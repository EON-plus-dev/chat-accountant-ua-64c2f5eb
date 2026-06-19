import { useState, useMemo, useEffect, useCallback } from "react";
import {
  FileText, User, Building2, Hash, Calendar, Plus, Trash2,
  AlertCircle, CheckCircle, UserPlus, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { type DocumentType, documentTypeConfigs } from "@/config/documentFlowConfig";
import { getContractorsForCabinet, getNomenclatureForCabinet, type Contractor, type NomenclatureItem } from "@/config/settingsConfig";
import { type DocumentTemplate, systemTemplates, demoCustomTemplates } from "@/config/documentTemplatesConfig";
import {
  type FormField, type FieldGroup, type PositionColumn,
  getFormSchemaForType, getPositionColumnsForType, getFieldsByGroup, fieldGroupLabels
} from "@/config/documentFormSchemas";
import { getCabinetRequisites, mapSourceKeyToValue, mapContractorToValues } from "@/config/cabinetRequisitesDemo";
import { DynamicFormField } from "./DynamicFormField";
import { InviteContractorSheet } from "./InviteContractorSheet";

interface CreateDocumentContentProps {
  cabinet: Cabinet;
  onCancel?: () => void;
  onDocumentCreated?: () => void;
  onChatMessage?: (prompt: string) => void;
  onNavigateToCreateTemplate?: () => void;
}

interface DocumentPosition {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
  weight?: number;
  places?: number;
  sku?: string;
  packaging?: string;
}

// Generate document number based on type and date
const generateDocumentNumber = (type: DocumentType): string => {
  const prefixes: Record<DocumentType, string> = {
    invoice: "РАХ", act: "АКТ", contract: "ДОГ", waybill: "НКЛ", ttn: "ТТН",
    "tax-invoice": "ПН", "prro-receipt": "ЧЕК", reconciliation: "АЗ",
    certificate: "ДОВ", receipt: "КВТ", "power-of-attorney": "ДВР",
    order: "НКЗ", "employment-order": "НПР", "dismissal-order": "НЗВ", "vacation-order": "НВП",
    "payment-order": "ПП", "bank-statement": "ВИП",
    "rental-agreement": "ДОА", "sale-agreement": "ДКП", "supply-contract": "ДПС",
    "fop-service-contract": "ДФП", "discrepancy-act": "АР", other: "ДОК",
  };
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${prefixes[type]}-${year}-${randomNum}`;
};

// Get available document types for creation
const getCreatableDocumentTypes = () => {
  const excludeTypes: DocumentType[] = ["prro-receipt", "bank-statement"];
  return Object.values(documentTypeConfigs).filter(
    (config) => !excludeTypes.includes(config.type)
  );
};

// Field group icons
const fieldGroupIcons: Partial<Record<FieldGroup, React.ElementType>> = {
  header: Hash,
  supplier: User,
  buyer: Building2,
  employee: User,
  transport: FileText,
  terms: FileText,
  totals: FileText,
};

export const CreateDocumentContent = ({
  cabinet,
  onCancel,
  onDocumentCreated,
  onChatMessage,
  onNavigateToCreateTemplate,
}: CreateDocumentContentProps) => {
  const [documentType, setDocumentType] = useState<DocumentType>("invoice");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [positions, setPositions] = useState<DocumentPosition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<FieldGroup>>(
    new Set(["header", "supplier", "buyer", "employee", "terms", "transport", "totals"])
  );

  const contractors = useMemo(() => getContractorsForCabinet(cabinet), [cabinet]);
  const nomenclature = useMemo(() => getNomenclatureForCabinet(cabinet), [cabinet]);
  const creatableTypes = useMemo(() => getCreatableDocumentTypes(), []);
  const typeConfig = documentTypeConfigs[documentType];
  const cabinetRequisites = useMemo(() => getCabinetRequisites(cabinet), [cabinet]);

  // Get form schema for current document type
  const formSchema = useMemo(() => getFormSchemaForType(documentType), [documentType]);
  const positionColumns = useMemo(() => getPositionColumnsForType(documentType), [documentType]);
  const fieldsByGroup = useMemo(() => formSchema ? getFieldsByGroup(formSchema) : null, [formSchema]);

  // Templates for current type
  const templatesForType = useMemo(() => {
    const allTemplates = [...systemTemplates, ...demoCustomTemplates];
    return allTemplates.filter(t => t.type === documentType);
  }, [documentType]);

  const systemTemplatesForType = useMemo(() => 
    templatesForType.filter(t => t.category === "system"),
    [templatesForType]
  );
  const customTemplatesForType = useMemo(() => 
    templatesForType.filter(t => t.category === "custom"),
    [templatesForType]
  );

  // Initialize form with cabinet autofill values
  const initializeFormValues = useCallback(() => {
    if (!formSchema) return {};
    
    const values: Record<string, string | number | boolean> = {};
    
    formSchema.forEach(field => {
      // Set default values
      if (field.defaultValue !== undefined) {
        values[field.key] = field.defaultValue;
      }
      
      // Autofill from cabinet
      if (field.source === "cabinet" && field.sourceKey) {
        const value = mapSourceKeyToValue(field.sourceKey, cabinetRequisites);
        if (value) {
          values[field.key] = value;
        }
      }
      
      // Set computed document number
      if (field.key === "documentNumber" && field.source === "computed") {
        values[field.key] = generateDocumentNumber(documentType);
      }
      
      // Set current date for date fields
      if (field.key === "documentDate" && field.fieldType === "date") {
        values[field.key] = new Date().toISOString().split("T")[0];
      }
    });
    
    return values;
  }, [formSchema, cabinetRequisites, documentType]);

  // Initialize form when type changes
  useEffect(() => {
    setFormValues(initializeFormValues());
    setSelectedContractor(null);
    setPositions([]);
    
    // Select first template
    if (templatesForType.length > 0) {
      setSelectedTemplate(templatesForType[0]);
    } else {
      setSelectedTemplate(null);
    }
  }, [documentType, initializeFormValues]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update contractor fields when contractor is selected
  useEffect(() => {
    if (!selectedContractor || !formSchema) return;
    
    const contractorValues = mapContractorToValues(selectedContractor);
    const updates: Record<string, string | number | boolean> = {};
    
    formSchema.forEach(field => {
      if (field.source === "contractor" && field.sourceKey) {
        const value = contractorValues[field.sourceKey];
        if (value) {
          updates[field.key] = value;
        }
      }
    });
    
    if (Object.keys(updates).length > 0) {
      setFormValues(prev => ({ ...prev, ...updates }));
    }
  }, [selectedContractor, formSchema]);

  // Calculate totals
  const totalAmount = useMemo(() => 
    positions.reduce((sum, p) => sum + p.amount, 0),
    [positions]
  );

  const handleTypeChange = (type: DocumentType) => {
    setDocumentType(type);
  };

  const handleTemplateChange = (templateId: string) => {
    const template = [...systemTemplates, ...demoCustomTemplates].find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  };

  const handleFieldChange = (key: string, value: string | number | boolean) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const handleContractorSelect = (contractor: Contractor) => {
    setSelectedContractor(contractor);
  };

  const handleInviteContractor = () => {
    setInviteSheetOpen(true);
  };

  const handleInviteSent = (email: string, name: string) => {
    const tempContractor: Contractor = {
      id: `temp-${Date.now()}`,
      name: name,
      code: "—",
      type: "legal",
      isPending: true,
    };
    setSelectedContractor(tempContractor);
  };

  const handleAddPosition = (item: NomenclatureItem) => {
    const newPosition: DocumentPosition = {
      id: `pos-${Date.now()}`,
      name: item.name,
      quantity: 1,
      unit: item.unit,
      price: item.price,
      amount: item.price,
    };
    setPositions([...positions, newPosition]);
  };

  const handleAddEmptyPosition = () => {
    const newPosition: DocumentPosition = {
      id: `pos-${Date.now()}`,
      name: "",
      quantity: 1,
      unit: "шт",
      price: 0,
      amount: 0,
    };
    setPositions([...positions, newPosition]);
  };

  const handleUpdatePosition = (id: string, field: keyof DocumentPosition, value: string | number) => {
    setPositions(positions.map((p) => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      if (field === "quantity" || field === "price") {
        updated.amount = updated.quantity * updated.price;
      }
      return updated;
    }));
  };

  const handleRemovePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const toggleGroup = (group: FieldGroup) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (formSchema) {
      const missingFields = formSchema.filter(f => 
        f.required && !formValues[f.key] && f.fieldType !== "positions"
      );
      
      if (missingFields.length > 0) {
        toast({
          title: "Помилка",
          description: `Заповніть обов'язкові поля: ${missingFields.map(f => f.label).join(", ")}`,
          variant: "destructive"
        });
        return;
      }
    }

    if (typeConfig.requiresContractor && !selectedContractor) {
      toast({ title: "Помилка", description: "Оберіть контрагента", variant: "destructive" });
      return;
    }

    if (typeConfig.hasAmount && positions.length === 0) {
      toast({ title: "Помилка", description: "Додайте хоча б одну позицію", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Документ створено",
        description: `${typeConfig.label} ${formValues.documentNumber} створено як чернетку`,
      });
      onDocumentCreated?.();
    }, 800);
  };

  // Render a group of fields
  const renderFieldGroup = (group: FieldGroup) => {
    if (!fieldsByGroup) return null;
    
    const fields = fieldsByGroup[group];
    if (!fields || fields.length === 0) return null;

    // Skip positions group - rendered separately
    if (group === "positions") return null;

    const GroupIcon = fieldGroupIcons[group] || FileText;
    const isExpanded = expandedGroups.has(group);
    const groupLabel = fieldGroupLabels[group];

    // Check if any field in group has autofill
    const hasAutofill = fields.some(f => f.source === "cabinet" && formValues[f.key]);

    return (
      <Collapsible
        key={group}
        open={isExpanded}
        onOpenChange={() => toggleGroup(group)}
      >
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="p-3 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GroupIcon className="w-4 h-4 text-muted-foreground" />
                  {groupLabel}
                  {hasAutofill && (
                    <Badge 
                      variant="outline" 
                      className="text-[10px] h-5 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Автозаповнено
                    </Badge>
                  )}
                </CardTitle>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-12 gap-3">
                {fields.map(field => (
                  <DynamicFormField
                    key={field.key}
                    field={field}
                    value={formValues[field.key] ?? ""}
                    onChange={handleFieldChange}
                    disabled={field.source === "cabinet" || field.source === "computed"}
                    contractors={contractors}
                    selectedContractor={selectedContractor}
                    onContractorSelect={handleContractorSelect}
                    onInviteContractor={handleInviteContractor}
                  />
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  // Render positions table
  const renderPositions = () => {
    if (!fieldsByGroup?.positions?.length) return null;

    return (
      <Card>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Позиції</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" />
                  Додати
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Пошук товарів/послуг..." />
                  <CommandList>
                    <CommandEmpty>Не знайдено</CommandEmpty>
                    <CommandGroup heading="Номенклатура">
                      {nomenclature.slice(0, 10).map((item) => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleAddPosition(item)}
                        >
                          <div className="flex-1">
                            <span>{item.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {item.price.toLocaleString("uk-UA")} ₴/{item.unit}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandGroup>
                      <CommandItem onSelect={handleAddEmptyPosition} className="text-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Додати вручну
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {positions.length > 0 ? (
            <div className="space-y-2">
              {positions.map((pos) => (
                <Card key={pos.id} className="p-3 bg-muted/30">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Назва"
                        value={pos.name}
                        onChange={(e) => handleUpdatePosition(pos.id, "name", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="К-сть"
                        value={pos.quantity}
                        onChange={(e) => handleUpdatePosition(pos.id, "quantity", parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Ціна"
                        value={pos.price}
                        onChange={(e) => handleUpdatePosition(pos.id, "price", parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium">
                      {pos.amount.toLocaleString("uk-UA")} ₴
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemovePosition(pos.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Разом:</span>
                <span className="text-lg font-bold">{totalAmount.toLocaleString("uk-UA")} ₴</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Додайте позиції до документа</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Fallback to old form if no schema available
  const hasSchema = !!formSchema && formSchema.length > 0;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Document Type */}
      <div className="space-y-2">
        <Label>Тип документа</Label>
        <Select value={documentType} onValueChange={(v) => handleTypeChange(v as DocumentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {creatableTypes.map((config) => (
              <SelectItem key={config.type} value={config.type}>
                <div className="flex items-center gap-2">
                  <config.icon className="w-4 h-4 text-muted-foreground" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Шаблон</Label>
          {onNavigateToCreateTemplate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-xs text-primary px-2"
              onClick={onNavigateToCreateTemplate}
            >
              <Sparkles className="w-3 h-3" />
              Створити свій
            </Button>
          )}
        </div>
        <Select 
          value={selectedTemplate?.id || ""} 
          onValueChange={handleTemplateChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Оберіть шаблон..." />
          </SelectTrigger>
          <SelectContent>
            {systemTemplatesForType.length > 0 && (
              <SelectGroup>
                <SelectLabel>Системні</SelectLabel>
                {systemTemplatesForType.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <template.icon className="w-4 h-4 text-muted-foreground" />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {customTemplatesForType.length > 0 && (
              <SelectGroup>
                <SelectLabel>Мої шаблони</SelectLabel>
                {customTemplatesForType.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <template.icon className="w-4 h-4 text-primary" />
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {templatesForType.length === 0 && (
              <SelectItem value="none" disabled>
                Немає шаблонів для цього типу
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Dynamic Form Fields by Groups */}
      {hasSchema ? (
        <div className="space-y-3">
          {renderFieldGroup("header")}
          {renderFieldGroup("supplier")}
          {renderFieldGroup("buyer")}
          {renderFieldGroup("employee")}
          {renderFieldGroup("transport")}
          {renderPositions()}
          {renderFieldGroup("totals")}
          {renderFieldGroup("terms")}
        </div>
      ) : (
        // Fallback for types without schema
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Схема форми для цього типу документа ще не налаштована</p>
          <p className="text-sm mt-1">Використовуйте шаблон для створення</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <div className="flex-1" />
        <Button variant="outline" onClick={onCancel}>
          Скасувати
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !hasSchema}>
          {isSubmitting ? "Збереження..." : "Створити документ"}
        </Button>
      </div>

      {/* Invite Contractor Sheet */}
      <InviteContractorSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
};
