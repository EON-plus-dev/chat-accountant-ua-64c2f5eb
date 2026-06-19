import { useState } from "react";
import { Info, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface EditableField {
  id: string;
  name: string;           // "contractor_name", "amount", "date"
  label: string;          // "Назва контрагента"
  value: string;
  type: "text" | "date" | "amount" | "party";
  source?: string;        // "Кабінет", "Контрагент", "Ручне введення"
  position?: { start: number; end: number };
  isRequired?: boolean;
}

interface EditableFieldOverlayProps {
  fields: EditableField[];
  documentText: string;
  onFieldChange: (fieldId: string, newValue: string) => void;
  className?: string;
}

interface FieldPopoverProps {
  field: EditableField;
  onValueChange: (newValue: string) => void;
  children: React.ReactNode;
}

const FieldPopover = ({ field, onValueChange, children }: FieldPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(field.value);

  const handleSave = () => {
    onValueChange(editValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(field.value);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">{field.label}</Label>
            {field.isRequired && (
              <Badge variant="secondary" className="text-[10px]">Обов'язкове</Badge>
            )}
          </div>
          
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Введіть ${field.label.toLowerCase()}`}
            className="h-9"
            autoFocus
          />
          
          {field.source && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              <span>Джерело: {field.source}</span>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setEditValue(field.value);
                setIsOpen(false);
              }}
            >
              Скасувати
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!editValue.trim()}
            >
              Зберегти
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const EditableFieldOverlay = ({
  fields,
  documentText,
  onFieldChange,
  className,
}: EditableFieldOverlayProps) => {
  // Sort fields by position (start index) to process in order
  const sortedFields = [...fields]
    .filter(f => f.position)
    .sort((a, b) => (a.position?.start || 0) - (b.position?.start || 0));

  // If no fields with positions, render text as-is with field badges
  if (sortedFields.length === 0) {
    return (
      <div className={cn("relative", className)}>
        <pre className="whitespace-pre-wrap text-sm font-sans text-foreground/90 leading-relaxed">
          {documentText}
        </pre>
        
        {/* Field badges panel */}
        {fields.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Змінні поля документа:
            </p>
            <div className="flex flex-wrap gap-2">
              {fields.map((field) => (
                <FieldPopover
                  key={field.id}
                  field={field}
                  onValueChange={(newValue) => onFieldChange(field.id, newValue)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10"
                  >
                    <Edit3 className="w-3 h-3" />
                    {field.label}: {field.value || "—"}
                  </Button>
                </FieldPopover>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Build text with inline editable fields
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedFields.forEach((field, index) => {
    const { start, end } = field.position!;
    
    // Add text before this field
    if (start > lastIndex) {
      elements.push(
        <span key={`text-${index}`}>
          {documentText.slice(lastIndex, start)}
        </span>
      );
    }
    
    // Add editable field
    elements.push(
      <FieldPopover
        key={field.id}
        field={field}
        onValueChange={(newValue) => onFieldChange(field.id, newValue)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline cursor-pointer transition-all duration-150",
                "bg-primary/10 border border-dashed border-primary/50",
                "px-1 py-0.5 rounded",
                "hover:bg-primary/20 hover:border-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
              tabIndex={0}
              role="button"
              aria-label={`Редагувати поле: ${field.label}`}
            >
              {field.value || documentText.slice(start, end)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="flex items-center gap-1.5">
              <Edit3 className="w-3 h-3" />
              <span>{field.label}</span>
              {field.source && (
                <span className="text-muted-foreground">· {field.source}</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </FieldPopover>
    );
    
    lastIndex = end;
  });

  // Add remaining text after last field
  if (lastIndex < documentText.length) {
    elements.push(
      <span key="text-end">
        {documentText.slice(lastIndex)}
      </span>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <pre className="whitespace-pre-wrap text-sm font-sans text-foreground/90 leading-relaxed">
        {elements}
      </pre>
    </div>
  );
};
