import { useState, useMemo, useEffect } from "react";
import {
  FileText, User, Building2, Package, Hash,
  Calendar, DollarSign, Bot, Plus, Trash2,
  AlertCircle, CheckCircle, UserPlus, LayoutGrid
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import {
  type DocumentType,
  documentTypeConfigs,
} from "@/config/documentFlowConfig";
import {
  getContractorsForCabinet,
  getNomenclatureForCabinet,
  type Contractor,
  type NomenclatureItem,
} from "@/config/settingsConfig";
import { type DocumentTemplate } from "@/config/documentTemplatesConfig";
import { InviteContractorSheet } from "./InviteContractorSheet";

interface CreateDocumentSheetProps {
  cabinet: Cabinet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatPromptInsert?: (prompt: string) => void;
  onDocumentCreated?: () => void;
  initialTemplate?: DocumentTemplate | null;
}

interface DocumentPosition {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
}

// Generate document number based on type and date
const generateDocumentNumber = (type: DocumentType): string => {
  const prefixes: Record<DocumentType, string> = {
    invoice: "РАХ",
    act: "АКТ",
    contract: "ДОГ",
    waybill: "НКЛ",
    ttn: "ТТН",
    "tax-invoice": "ПН",
    "prro-receipt": "ЧЕК",
    reconciliation: "АЗ",
    certificate: "ДОВ",
    receipt: "КВТ",
    "power-of-attorney": "ДВР",
    order: "НКЗ",
    "employment-order": "НПР",
    "dismissal-order": "НЗВ",
    "vacation-order": "НВП",
    "payment-order": "ПП",
    "bank-statement": "ВИП",
    "rental-agreement": "ДОА",
    "sale-agreement": "ДКП",
    "supply-contract": "ДПС",
    "fop-service-contract": "ДФП",
    "discrepancy-act": "АР",
    other: "ДОК",
  };

  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${prefixes[type]}-${year}-${randomNum}`;
};

// Get available document types for creation (exclude some types)
const getCreatableDocumentTypes = () => {
  const excludeTypes: DocumentType[] = ["prro-receipt", "bank-statement"];
  return Object.values(documentTypeConfigs).filter(
    (config) => !excludeTypes.includes(config.type)
  );
};

export const CreateDocumentSheet = ({
  cabinet,
  open,
  onOpenChange,
  onChatPromptInsert,
  onDocumentCreated,
  initialTemplate,
}: CreateDocumentSheetProps) => {
  // Form state - initialize with template if provided
  const getInitialType = (): DocumentType => {
    if (initialTemplate?.type && documentTypeConfigs[initialTemplate.type]) {
      return initialTemplate.type;
    }
    return "invoice";
  };
  
  const [documentType, setDocumentType] = useState<DocumentType>(getInitialType);
  const [documentNumber, setDocumentNumber] = useState(() => generateDocumentNumber(getInitialType()));
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [contractorSearchOpen, setContractorSearchOpen] = useState(false);
  const [contractorSearch, setContractorSearch] = useState("");
  const [positions, setPositions] = useState<DocumentPosition[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<DocumentTemplate | null>(initialTemplate || null);

  // Update form when initialTemplate changes (when opening with template)
  useEffect(() => {
    if (open && initialTemplate) {
      setActiveTemplate(initialTemplate);
      if (initialTemplate.type && documentTypeConfigs[initialTemplate.type]) {
        setDocumentType(initialTemplate.type);
        setDocumentNumber(generateDocumentNumber(initialTemplate.type));
      }
    }
  }, [open, initialTemplate]);

  // Reset active template when closed
  useEffect(() => {
    if (!open) {
      setActiveTemplate(null);
    }
  }, [open]);

  // Get data from config
  const contractors = useMemo(() => getContractorsForCabinet(cabinet), [cabinet]);
  const nomenclature = useMemo(() => getNomenclatureForCabinet(cabinet), [cabinet]);
  const creatableTypes = useMemo(() => getCreatableDocumentTypes(), []);
  const typeConfig = documentTypeConfigs[documentType];

  // Calculate total amount
  const totalAmount = useMemo(() => 
    positions.reduce((sum, p) => sum + p.amount, 0),
    [positions]
  );

  // Filter contractors by search
  const filteredContractors = useMemo(() => {
    if (!contractorSearch) return contractors;
    const search = contractorSearch.toLowerCase();
    return contractors.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.code.includes(search) ||
        c.iban?.includes(search)
    );
  }, [contractors, contractorSearch]);

  // Handle document type change
  const handleTypeChange = (type: DocumentType) => {
    setDocumentType(type);
    setDocumentNumber(generateDocumentNumber(type));
  };

  // Add position from nomenclature
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

  // Add empty position
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

  // Update position
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

  // Remove position
  const handleRemovePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  // Handle AI help
  const handleAIHelp = () => {
    const prompt = `Допоможи заповнити ${typeConfig.label.toLowerCase()} для ${cabinet.name}`;
    onChatPromptInsert?.(prompt);
    toast({
      title: "AI-підказка",
      description: "Запит відправлено до AI-асистента",
    });
  };

  // Handle invite contractor
  const handleInviteContractor = () => {
    setContractorSearchOpen(false);
    setInviteSheetOpen(true);
  };

  // Handle invite sent - create temporary contractor entry
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

  // Handle form submit
  const handleSubmit = () => {
    // Validation
    if (!documentNumber.trim()) {
      toast({ title: "Помилка", description: "Вкажіть номер документа", variant: "destructive" });
      return;
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

    // Simulate creation
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Документ створено",
        description: `${typeConfig.label} ${documentNumber} створено як чернетку`,
      });
      onDocumentCreated?.();
      onOpenChange(false);
      
      // Reset form
      setDocumentType("invoice");
      setDocumentNumber(generateDocumentNumber("invoice"));
      setSelectedContractor(null);
      setPositions([]);
      setNotes("");
    }, 800);
  };

  // Get company requisites display
  const getCompanyRequisites = () => {
    const taxIdLabel = cabinet.taxId?.length === 8 ? "ЄДРПОУ" : "ІПН";
    return {
      name: cabinet.name,
      taxId: cabinet.taxId || "—",
      taxIdLabel,
    };
  };

  const companyReqs = getCompanyRequisites();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Новий документ
            {activeTemplate && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                <LayoutGrid className="w-3 h-3 mr-1" />
                {activeTemplate.name}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {activeTemplate 
              ? `Створення на основі шаблону "${activeTemplate.name}"`
              : "Створіть документ з автозаповненням реквізитів"
            }
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-4">
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

            {/* Number and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  Номер
                </Label>
                <Input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="АВТ-2025-001"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Дата
                </Label>
                <Input
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
              </div>
            </div>

            {/* Due date for invoices */}
            {(documentType === "invoice" || documentType === "contract") && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {documentType === "invoice" ? "Термін оплати" : "Дійсний до"}
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            )}

            <Separator />

            {/* Company Requisites (Auto-filled) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Постачальник (ваші реквізити)
              </Label>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{companyReqs.name}</span>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Автозаповнено
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {companyReqs.taxIdLabel}: {companyReqs.taxId}
                </div>
              </div>
            </div>

            {/* Contractor Selection */}
            {typeConfig.requiresContractor && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Контрагент (покупець)
                </Label>
                <Popover open={contractorSearchOpen} onOpenChange={setContractorSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={contractorSearchOpen}
                      className={cn(
                        "w-full justify-start text-left font-normal h-auto py-2",
                        !selectedContractor && "text-muted-foreground"
                      )}
                    >
                      {selectedContractor ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedContractor.name}</span>
                            {selectedContractor.isPending && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400">
                                Очікує реєстрації
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {selectedContractor.isPending 
                              ? "Реквізити будуть заповнені після реєстрації"
                              : `${selectedContractor.code.length === 8 ? "ЄДРПОУ" : "ІПН"}: ${selectedContractor.code}`
                            }
                          </span>
                        </div>
                      ) : (
                        <span>Оберіть контрагента...</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Пошук за назвою або кодом..."
                        value={contractorSearch}
                        onValueChange={setContractorSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-4 text-center space-y-2">
                            <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Контрагента не знайдено</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={handleInviteContractor}
                            >
                              <UserPlus className="w-4 h-4 mr-1.5" />
                              Запросити контрагента
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup heading="Контрагенти">
                          {filteredContractors.map((contractor) => (
                            <CommandItem
                              key={contractor.id}
                              value={contractor.name}
                              onSelect={() => {
                                setSelectedContractor(contractor);
                                setContractorSearchOpen(false);
                                setContractorSearch("");
                              }}
                              className="flex flex-col items-start gap-0.5 py-2"
                            >
                              <span className="font-medium">{contractor.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {contractor.code.length === 8 ? "ЄДРПОУ" : "ІПН"}: {contractor.code}
                                {contractor.isSynced && (
                                  <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400">
                                    Синхронізовано
                                  </Badge>
                                )}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <div className="p-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-muted-foreground"
                            onClick={handleInviteContractor}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Запросити нового контрагента
                          </Button>
                        </div>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Positions */}
            {typeConfig.hasAmount && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-muted-foreground" />
                      Позиції
                    </Label>
                    <div className="flex gap-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            З довідника
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0" align="end">
                          <Command>
                            <CommandInput placeholder="Пошук товару/послуги..." />
                            <CommandList>
                              <CommandEmpty>Не знайдено</CommandEmpty>
                              <CommandGroup heading="Номенклатура">
                                {nomenclature.map((item) => (
                                  <CommandItem
                                    key={item.id}
                                    value={item.name}
                                    onSelect={() => handleAddPosition(item)}
                                    className="flex justify-between"
                                  >
                                    <span>{item.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {item.price.toLocaleString("uk-UA")} ₴
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Button variant="ghost" size="sm" onClick={handleAddEmptyPosition}>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Вручну
                      </Button>
                    </div>
                  </div>

                  {positions.length === 0 ? (
                    <div className="border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                      Додайте позиції з довідника або вручну
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {positions.map((pos, index) => (
                        <div key={pos.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Input
                                value={pos.name}
                                onChange={(e) => handleUpdatePosition(pos.id, "name", e.target.value)}
                                placeholder="Назва позиції"
                                className="h-8 text-sm"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemovePosition(pos.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">К-сть</Label>
                              <Input
                                type="number"
                                value={pos.quantity}
                                onChange={(e) => handleUpdatePosition(pos.id, "quantity", parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                                min={0}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Од.</Label>
                              <Input
                                value={pos.unit}
                                onChange={(e) => handleUpdatePosition(pos.id, "unit", e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Ціна</Label>
                              <Input
                                type="number"
                                value={pos.price}
                                onChange={(e) => handleUpdatePosition(pos.id, "price", parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                                min={0}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Сума</Label>
                              <Input
                                value={pos.amount.toLocaleString("uk-UA")}
                                readOnly
                                className="h-8 text-sm bg-muted/50"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Total */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Всього:</span>
                        <span className="text-lg font-bold tabular-nums">
                          {totalAmount.toLocaleString("uk-UA")} ₴
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Примітки</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Додаткова інформація..."
                rows={2}
              />
            </div>

            {/* AI Help */}
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={handleAIHelp}
            >
              <Bot className="w-4 h-4 mr-2 text-primary" />
              Допоможи заповнити документ
            </Button>
          </div>
        </ScrollArea>

        <SheetFooter className="gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Створення..." : "Створити чернетку"}
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Invite Contractor Sheet */}
      <InviteContractorSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        prefillName={contractorSearch}
        cabinetName={cabinet.name}
        onInviteSent={handleInviteSent}
      />
    </Sheet>
  );
};
