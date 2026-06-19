import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Search, Lightbulb, Sparkles, X, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Cabinet } from "@/types/cabinet";
import {
  type FieldDataType,
  cabinetFieldSchema,
  contractorFieldSchema,
  detectFieldType,
  getFieldOptionsGrouped,
} from "@/config/documentTemplatesConfig";

// Extended TemplateField interface with AI-friendly properties
export interface TemplateField {
  key: string;
  label: string;
  originalText: string;
  source: "cabinet" | "contractor" | "manual" | "computed";
  sourceKey?: string;
  dataType: FieldDataType;
  aiHint?: string;
  required?: boolean;
  format?: string;
  position?: { start: number; end: number };
}

// Data type labels for UI
const dataTypeLabels: Record<FieldDataType, string> = {
  text: "Текст",
  number: "Число",
  currency: "Сума (грн)",
  date: "Дата",
  phone: "Телефон",
  email: "Email",
  iban: "IBAN",
  edrpou: "ЄДРПОУ",
  ipn: "ІПН",
  address: "Адреса",
  "person-name": "ПІБ",
};

interface TemplateTextEditorProps {
  documentText: string;
  fields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
  cabinet: Cabinet;
}

interface SelectionState {
  text: string;
  start: number;
  end: number;
  rect: { top: number; left: number } | null;
}

const sourceOptions = [
  { value: "cabinet", label: "З кабінету", description: "Автоматично з вашого профілю" },
  { value: "contractor", label: "Контрагент", description: "З обраного контрагента" },
  { value: "manual", label: "Ручне", description: "Вводиться при створенні" },
];

// ============================================
// CREATE FIELD FORM CONTENT (shared by Dialog & Drawer)
// ============================================
interface CreateFieldFormProps {
  selectionState: SelectionState | null;
  detectedType: ReturnType<typeof detectFieldType> | null;
  newFieldLabel: string;
  setNewFieldLabel: (v: string) => void;
  newFieldSource: TemplateField["source"];
  setNewFieldSource: (v: TemplateField["source"]) => void;
  newFieldSourceKey: string;
  setNewFieldSourceKey: (v: string) => void;
  newFieldDataType: FieldDataType;
  setNewFieldDataType: (v: FieldDataType) => void;
  newFieldAiHint: string;
  setNewFieldAiHint: (v: string) => void;
  fieldSearchQuery: string;
  setFieldSearchQuery: (v: string) => void;
  handleSourceKeySelect: (key: string) => void;
  fieldOptions: ReturnType<typeof getFieldOptionsGrouped>;
  isMobile?: boolean;
}

const CreateFieldFormContent = ({
  selectionState,
  detectedType,
  newFieldLabel,
  setNewFieldLabel,
  newFieldSource,
  setNewFieldSource,
  newFieldSourceKey,
  newFieldDataType,
  setNewFieldDataType,
  newFieldAiHint,
  setNewFieldAiHint,
  fieldSearchQuery,
  setFieldSearchQuery,
  handleSourceKeySelect,
  fieldOptions,
  isMobile,
}: CreateFieldFormProps) => {
  const inputHeight = isMobile ? "h-12" : "h-10";
  const radioItemHeight = isMobile ? "min-h-[56px]" : "";
  
  return (
    <div className="space-y-4">
      {/* Selected text with auto-detection */}
      {selectionState && (
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Виділений текст:</p>
            {detectedType && detectedType.confidence > 0.5 && (
              <Badge variant="secondary" className="text-[10px]">
                <Lightbulb className="w-3 h-3 mr-1" />
                Визначено: {dataTypeLabels[detectedType.dataType]}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium font-mono break-all">"{selectionState.text}"</p>
        </div>
      )}

      {/* Field label */}
      <div className="space-y-2">
        <Label htmlFor="field-label">Назва поля</Label>
        <Input
          id="field-label"
          value={newFieldLabel}
          onChange={(e) => setNewFieldLabel(e.target.value)}
          placeholder="Введіть назву поля"
          className={inputHeight}
        />
      </div>

      {/* Data source selection */}
      <div className="space-y-3">
        <Label>Джерело даних</Label>
        <RadioGroup
          value={newFieldSource}
          onValueChange={(value) => {
            setNewFieldSource(value as TemplateField["source"]);
            setFieldSearchQuery("");
          }}
          className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-3")}
        >
          {sourceOptions.map((option) => (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={`source-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`source-${option.value}`}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                  "hover:bg-muted/50",
                  radioItemHeight
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-[10px] text-muted-foreground text-center mt-0.5">
                  {option.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Field selection for cabinet/contractor */}
      {(newFieldSource === "cabinet" || newFieldSource === "contractor") && (
        <div className="space-y-2">
          <Label>Конкретне поле</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={fieldSearchQuery}
              onChange={(e) => setFieldSearchQuery(e.target.value)}
              placeholder="Пошук поля..."
              className={cn("pl-9", inputHeight)}
            />
          </div>
          <ScrollArea className={cn("border rounded-lg", isMobile ? "h-[180px]" : "h-[140px]")}>
            <div className="p-2 space-y-1">
              {(newFieldSource === "cabinet" ? fieldOptions.cabinet : fieldOptions.contractor)
                .filter(f => 
                  !fieldSearchQuery || 
                  f.label.toLowerCase().includes(fieldSearchQuery.toLowerCase()) ||
                  f.key.toLowerCase().includes(fieldSearchQuery.toLowerCase())
                )
                .map((field) => (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => handleSourceKeySelect(field.key)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
                      isMobile && "min-h-[48px]",
                      newFieldSourceKey === field.key
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <span className="text-base">{field.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{field.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {field.key} · {dataTypeLabels[field.dataType]}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Data type for manual fields */}
      {newFieldSource === "manual" && (
        <div className="space-y-2">
          <Label>Тип даних</Label>
          <Select
            value={newFieldDataType}
            onValueChange={(value) => setNewFieldDataType(value as FieldDataType)}
          >
            <SelectTrigger className={inputHeight}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dataTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* AI Hint (optional) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          AI-підказка
          <span className="text-xs text-muted-foreground font-normal">(опціонально)</span>
        </Label>
        <Textarea
          value={newFieldAiHint}
          onChange={(e) => setNewFieldAiHint(e.target.value)}
          placeholder="Опишіть семантику поля для кращого розуміння AI"
          className={cn("resize-none text-sm", isMobile ? "h-20" : "h-16")}
        />
      </div>
    </div>
  );
};

// ============================================
// MOBILE SELECTION BAR (sticky bottom)
// ============================================
interface MobileSelectionBarProps {
  selectionText: string;
  onCreateField: () => void;
  onCancel: () => void;
}

const MobileSelectionBar = ({ selectionText, onCreateField, onCancel }: MobileSelectionBarProps) => {
  // Use portal to escape stacking context from parent transforms
  const content = (
    <div 
      className={cn(
        "fixed inset-x-0 z-[60]",
        "bg-background border-t border-border shadow-lg",
        "animate-in slide-in-from-bottom-4 duration-200"
      )}
      style={{ 
        bottom: "var(--mobile-footer-height, 0px)"
      }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Selection preview */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground mb-0.5">Виділено:</p>
          <p className="text-sm font-medium truncate">"{selectionText}"</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onCancel}
          >
            <X className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            className="h-12 px-6 rounded-full gap-2"
            onClick={onCreateField}
          >
            <Plus className="w-5 h-5" />
            Створити поле
          </Button>
        </div>
      </div>
    </div>
  );

  // Render via portal to escape parent stacking context
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};

// ============================================
// MOBILE FIELD INFO DRAWER
// ============================================
interface FieldInfoDrawerProps {
  field: TemplateField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceChange: (fieldKey: string, newSource: TemplateField["source"]) => void;
  onDelete: (fieldKey: string) => void;
}

const FieldInfoDrawer = ({ field, open, onOpenChange, onSourceChange, onDelete }: FieldInfoDrawerProps) => {
  if (!field) return null;
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[60dvh]">
        <DrawerHeader className="border-b border-border/50">
          <DrawerTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            {field.label}
          </DrawerTitle>
          <DrawerDescription>
            Редагування поля шаблону
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 space-y-4">
          {/* Original text preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Оригінальний текст:</p>
            <p className="text-sm font-mono break-all">"{field.originalText}"</p>
          </div>
          
          {/* Source selector with h-12 touch target */}
          <div className="space-y-2">
            <Label>Джерело даних</Label>
            <Select
              value={field.source}
              onValueChange={(value) => {
                onSourceChange(field.key, value as TemplateField["source"]);
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Data type badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Тип даних:</span>
            <Badge variant="secondary" className="h-7 px-3">
              {dataTypeLabels[field.dataType]}
            </Badge>
          </div>
        </div>
        
        <DrawerFooter className="border-t border-border/50 pt-4">
          {/* Delete button - full width for mobile */}
          <Button
            variant="destructive"
            size="lg"
            className="h-12 w-full"
            onClick={() => {
              onDelete(field.key);
              onOpenChange(false);
            }}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Видалити поле
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="h-12"
            onClick={() => onOpenChange(false)}
          >
            Закрити
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const TemplateTextEditor = ({
  documentText,
  fields,
  onFieldsChange,
  cabinet,
}: TemplateTextEditorProps) => {
  const isMobile = useIsMobile();
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  
  // Selection state
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // New field form state
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldSource, setNewFieldSource] = useState<TemplateField["source"]>("manual");
  const [newFieldSourceKey, setNewFieldSourceKey] = useState<string>("");
  const [newFieldDataType, setNewFieldDataType] = useState<FieldDataType>("text");
  const [newFieldAiHint, setNewFieldAiHint] = useState("");
  const [detectedType, setDetectedType] = useState<ReturnType<typeof detectFieldType> | null>(null);
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");
  
  // Get grouped field options
  const fieldOptions = useMemo(() => getFieldOptionsGrouped(), []);
  
  // Field popup state (for contextual info/edit) - Desktop only
  const [selectedFieldPopup, setSelectedFieldPopup] = useState<{
    fieldKey: string;
    rect: { top: number; left: number };
  } | null>(null);
  
  // Mobile field info drawer state
  const [showFieldInfoDrawer, setShowFieldInfoDrawer] = useState(false);
  const [mobileSelectedField, setMobileSelectedField] = useState<TemplateField | null>(null);
  
  // Delete confirmation state
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
  
  // Get selected field data for popup
  const selectedPopupField = selectedFieldPopup 
    ? fields.find(f => f.key === selectedFieldPopup.fieldKey) 
    : null;
  
  const documentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process selection (shared logic for both mouse and touch)
  const processSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) {
      setSelectionState(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) {
      setSelectionState(null);
      return;
    }

    // Check if selection is within our document
    const range = selection.getRangeAt(0);
    if (!documentRef.current?.contains(range.commonAncestorContainer)) {
      setSelectionState(null);
      return;
    }

    // Calculate position in original text
    const fullText = documentRef.current.textContent || "";
    const selectionStart = fullText.indexOf(selectedText);
    
    if (selectionStart === -1) {
      setSelectionState(null);
      return;
    }

    // Check if selection overlaps with existing fields
    const selectionEnd = selectionStart + selectedText.length;
    const overlaps = fields.some(
      (field) =>
        field.position &&
        ((selectionStart >= field.position.start && selectionStart < field.position.end) ||
        (selectionEnd > field.position.start && selectionEnd <= field.position.end) ||
        (selectionStart <= field.position.start && selectionEnd >= field.position.end))
    );

    if (overlaps) {
      setSelectionState(null);
      return;
    }

    // Get position for popup (desktop only)
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      setSelectionState({
        text: selectedText,
        start: selectionStart,
        end: selectionEnd,
        rect: isMobile ? null : {
          top: rect.bottom - containerRect.top + 8,
          left: rect.left - containerRect.left + rect.width / 2,
        },
      });
    }
  }, [fields, isMobile]);

  // Desktop: Handle mouse selection
  const handleTextSelection = useCallback(() => {
    if (isMobile) return;
    processSelection();
  }, [isMobile, processSelection]);

  // Mobile: Use selectionchange event with debounce
  useEffect(() => {
    if (!isMobile) return;

    const handleSelectionChange = () => {
      // Clear previous timeout
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      
      // Debounce: wait 150ms after selection stabilizes
      selectionTimeoutRef.current = setTimeout(() => {
        processSelection();
      }, 150);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [isMobile, processSelection]);

  // Clear selection and field popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Close field popup if clicking outside
      if (selectedFieldPopup && !target.closest('[data-field-popup]') && !target.closest('mark')) {
        setSelectedFieldPopup(null);
      }
      
      if (selectionState && !documentRef.current?.contains(e.target as Node)) {
        // Small delay to allow button click
        setTimeout(() => {
          const selection = window.getSelection();
          if (!selection?.toString().trim()) {
            setSelectionState(null);
          }
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectionState, selectedFieldPopup]);

  const handleOpenCreateDialog = () => {
    if (selectionState) {
      // Auto-detect field type
      const detected = detectFieldType(selectionState.text);
      setDetectedType(detected);
      
      setNewFieldLabel(selectionState.text);
      setNewFieldDataType(detected.dataType);
      setNewFieldSource(detected.suggestedSourceKey ? 
        (detected.suggestedSourceKey.startsWith("cabinet.") ? "cabinet" : "contractor") 
        : "manual"
      );
      setNewFieldSourceKey(detected.suggestedSourceKey || "");
      setNewFieldAiHint("");
      setFieldSearchQuery("");
      setShowCreateDialog(true);
    }
  };

  const handleCancelSelection = () => {
    setSelectionState(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCreateField = () => {
    if (!selectionState || !newFieldLabel.trim()) return;

    // Get AI hint from schema if sourceKey is selected
    let aiHint = newFieldAiHint;
    if (newFieldSourceKey && !aiHint) {
      const schema = newFieldSource === "cabinet" ? cabinetFieldSchema : contractorFieldSchema;
      const schemaItem = schema[newFieldSourceKey];
      if (schemaItem) {
        aiHint = schemaItem.aiHint;
      }
    }

    const newField: TemplateField = {
      key: `field_${Date.now()}`,
      label: newFieldLabel.trim(),
      originalText: selectionState.text,
      source: newFieldSource,
      sourceKey: newFieldSourceKey || undefined,
      dataType: newFieldDataType,
      aiHint: aiHint || undefined,
      position: { start: selectionState.start, end: selectionState.end },
    };

    onFieldsChange([...fields, newField]);
    setShowCreateDialog(false);
    setSelectionState(null);
    setNewFieldLabel("");
    setNewFieldSourceKey("");
    setNewFieldAiHint("");
    setDetectedType(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleSourceKeySelect = (sourceKey: string) => {
    setNewFieldSourceKey(sourceKey);
    
    // Get field info from schema
    const schema = newFieldSource === "cabinet" ? cabinetFieldSchema : contractorFieldSchema;
    const fieldInfo = schema[sourceKey];
    if (fieldInfo) {
      setNewFieldDataType(fieldInfo.dataType);
      // Only update label if it's still the original text
      if (newFieldLabel === selectionState?.text) {
        setNewFieldLabel(fieldInfo.label);
      }
    }
  };

  const handleDeleteField = (fieldKey: string) => {
    onFieldsChange(fields.filter((f) => f.key !== fieldKey));
    setFieldToDelete(null);
    if (selectedFieldKey === fieldKey) {
      setSelectedFieldKey(null);
    }
  };

  const handleSourceChange = (fieldKey: string, newSource: TemplateField["source"]) => {
    const updatedFields = fields.map((f) =>
      f.key === fieldKey ? { ...f, source: newSource } : f
    );
    onFieldsChange(updatedFields);
  };

  const handleFieldClick = (fieldKey: string, event?: React.MouseEvent<HTMLElement>) => {
    const field = fields.find(f => f.key === fieldKey);
    
    if (isMobile) {
      // Mobile: open Drawer
      setMobileSelectedField(field || null);
      setShowFieldInfoDrawer(true);
    } else {
      // Desktop: show Card popup
      setSelectedFieldKey(selectedFieldKey === fieldKey ? null : fieldKey);
      
      if (event && containerRef.current) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setSelectedFieldPopup({
          fieldKey,
          rect: {
            top: rect.top - containerRect.top - 36,
            left: rect.left - containerRect.left + rect.width / 2,
          },
        });
      }
    }
  };

  // Render document with highlighted fields
  const renderHighlightedText = () => {
    const parts: { text: string; field?: TemplateField }[] = [];
    let lastIndex = 0;

    // Sort fields by position (only those with positions)
    const sortedFields = [...fields].filter(f => f.position).sort((a, b) => a.position!.start - b.position!.start);

    sortedFields.forEach((field) => {
      // Add text before this field
      if (field.position!.start > lastIndex) {
        parts.push({ text: documentText.slice(lastIndex, field.position!.start) });
      }
      // Add the field
      parts.push({
        text: documentText.slice(field.position!.start, field.position!.end),
        field,
      });
      lastIndex = field.position!.end;
    });

    // Add remaining text
    if (lastIndex < documentText.length) {
      parts.push({ text: documentText.slice(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.field) {
        const isSelected = selectedFieldKey === part.field.key;
        return (
          <mark
            key={index}
            className={cn(
              "px-1 py-0.5 rounded cursor-pointer transition-colors",
              part.field.source === "cabinet" && "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300",
              part.field.source === "contractor" && "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300",
              part.field.source === "manual" && "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300",
              isSelected && "ring-2 ring-primary ring-offset-1"
            )}
            onClick={(e) => handleFieldClick(part.field!.key, e)}
          >
            [{part.field.originalText}]
          </mark>
        );
      }
      return <span key={index}>{part.text}</span>;
    });
  };

  // Form props for both Dialog and Drawer
  const formProps: CreateFieldFormProps = {
    selectionState,
    detectedType,
    newFieldLabel,
    setNewFieldLabel,
    newFieldSource,
    setNewFieldSource: (v) => {
      setNewFieldSource(v);
      setNewFieldSourceKey("");
    },
    newFieldSourceKey,
    setNewFieldSourceKey,
    newFieldDataType,
    setNewFieldDataType,
    newFieldAiHint,
    setNewFieldAiHint,
    fieldSearchQuery,
    setFieldSearchQuery,
    handleSourceKeySelect,
    fieldOptions,
    isMobile,
  };

  const isCreateDisabled = !newFieldLabel.trim() || 
    ((newFieldSource === "cabinet" || newFieldSource === "contractor") && !newFieldSourceKey);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative" ref={containerRef}>
      {/* Document Content */}
      <ScrollArea className={cn("flex-1 relative", isMobile && selectionState && "pb-24")}>
        <div className="p-6">
          <div 
            ref={documentRef}
            className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-xs leading-relaxed select-text"
            onMouseUp={handleTextSelection}
          >
            {renderHighlightedText()}
          </div>
        </div>

        {/* Desktop: Selection Popup */}
        {!isMobile && selectionState?.rect && (
          <div
            className="absolute z-50 animate-in fade-in-0 zoom-in-95"
            style={{
              top: selectionState.rect.top,
              left: selectionState.rect.left,
              transform: "translateX(-50%)",
            }}
          >
            <Button
              size="sm"
              className="h-8 gap-1.5 shadow-lg"
              onClick={handleOpenCreateDialog}
            >
              <Plus className="w-3.5 h-3.5" />
              Створити поле
            </Button>
          </div>
        )}

        {/* Extended Field Info Popup (Desktop) */}
        {!isMobile && selectedFieldPopup && selectedPopupField && (
          <div
            data-field-popup
            className="absolute z-50 animate-in fade-in-0 zoom-in-95"
            style={{
              top: selectedFieldPopup.rect.top,
              left: selectedFieldPopup.rect.left,
              transform: "translateX(-50%)",
            }}
          >
            <Card className="w-64 shadow-lg border">
              <CardContent className="p-3 space-y-2">
                {/* Field label + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate flex-1">
                    {selectedPopupField.label}
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFieldToDelete(selectedFieldPopup.fieldKey);
                            setSelectedFieldPopup(null);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Видалити поле</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                
                {/* Source selector */}
                <Select
                  value={selectedPopupField.source}
                  onValueChange={(value) => {
                    handleSourceChange(selectedPopupField.key, value as TemplateField["source"]);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Original text */}
                <p className="text-[10px] text-muted-foreground truncate">
                  Оригінал: "{selectedPopupField.originalText}"
                </p>
                
                {/* Data type badge */}
                {selectedPopupField.dataType && (
                  <Badge variant="outline" className="text-[10px]">
                    {dataTypeLabels[selectedPopupField.dataType]}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>

      {/* Mobile: Sticky Selection Bar */}
      {isMobile && selectionState && !showCreateDialog && (
        <MobileSelectionBar
          selectionText={selectionState.text}
          onCreateField={handleOpenCreateDialog}
          onCancel={handleCancelSelection}
        />
      )}

      {/* ============================================ */}
      {/* CREATE FIELD: Dialog (Desktop) / Drawer (Mobile) */}
      {/* ============================================ */}
      
      {/* Desktop: Dialog */}
      {!isMobile && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Створити нове поле
              </DialogTitle>
              <DialogDescription>
                Налаштуйте параметри для точного AI-автозаповнення
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <CreateFieldFormContent {...formProps} />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Скасувати
              </Button>
              <Button 
                onClick={handleCreateField} 
                disabled={isCreateDisabled}
              >
                <Plus className="w-4 h-4 mr-2" />
                Створити поле
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile: Drawer */}
      {isMobile && (
        <Drawer open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DrawerContent className="max-h-[90dvh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Створити нове поле
              </DrawerTitle>
              <DrawerDescription>
                Налаштуйте параметри для AI-автозаповнення
              </DrawerDescription>
            </DrawerHeader>
            
            <ScrollArea className="flex-1 px-4">
              <CreateFieldFormContent {...formProps} />
            </ScrollArea>

            <DrawerFooter className="pt-4">
              <Button 
                size="lg"
                className="h-12"
                onClick={handleCreateField} 
                disabled={isCreateDisabled}
              >
                <Plus className="w-5 h-5 mr-2" />
                Створити поле
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12"
                onClick={() => setShowCreateDialog(false)}
              >
                Скасувати
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Mobile: Field Info Drawer */}
      {isMobile && (
        <FieldInfoDrawer
          field={mobileSelectedField}
          open={showFieldInfoDrawer}
          onOpenChange={setShowFieldInfoDrawer}
          onSourceChange={handleSourceChange}
          onDelete={(fieldKey) => {
            setFieldToDelete(fieldKey);
            setShowFieldInfoDrawer(false);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!fieldToDelete} onOpenChange={() => setFieldToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити поле?</AlertDialogTitle>
            <AlertDialogDescription>
              Поле буде видалено з шаблону. Текст залишиться як звичайний текст документу.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => fieldToDelete && handleDeleteField(fieldToDelete)}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
