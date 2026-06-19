/**
 * TemplateFieldCards - Card component for grouped fields in test step
 * Displays fields with auto-fill indicators and input controls
 */

import { useMemo } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { Cabinet } from "@/types/cabinet";
import { resolveFieldValue } from "@/config/partyAttributesLibrary";

interface TemplateFieldCardsProps {
  cardIndex: number;
  title: string;
  icon: React.ReactNode;
  fields: UnifiedTemplateField[];
  testValues: Record<string, string>;
  onFieldValueChange: (key: string, value: string) => void;
  cabinet: Cabinet;
  highlightedFieldKey?: string | null;
}

// Get cabinet value by source key using unified resolveFieldValue
const getCabinetValue = (cabinet: Cabinet, sourceKey?: string): string => {
  if (!sourceKey) return "";
  
  const result = resolveFieldValue(sourceKey, { 
    cabinet: {
      name: cabinet.name,
      edrpou: cabinet.taxId,
      taxId: cabinet.taxId,
    } 
  });

  return result !== undefined ? String(result) : "";
};

export const TemplateFieldCards = ({
  cardIndex,
  title,
  icon,
  fields,
  testValues,
  onFieldValueChange,
  cabinet,
  highlightedFieldKey,
}: TemplateFieldCardsProps) => {
  // Check if all fields are auto-filled
  const isAutoGroup = useMemo(() => {
    return fields.every(
      (f) => f.source === "cabinet" || f.source === "contractor"
    );
  }, [fields]);

  // Count filled fields
  const filledCount = useMemo(() => {
    return fields.filter((f) => testValues[f.key]).length;
  }, [fields, testValues]);

  return (
    <div className="bg-card rounded-lg border border-border/70 overflow-hidden shadow-sm">
      {/* Card header with card number */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="text-muted-foreground">{icon}</span>
            {/* Card number badge */}
            <span className="absolute -top-1.5 -left-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {cardIndex}
            </span>
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {isAutoGroup && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" />
              Авто
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {filledCount}/{fields.length}
          </span>
        </div>
      </div>

      {/* Card content - fields grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => {
            const isAuto = field.source === "cabinet" || field.source === "contractor";
            const autoValue = isAuto ? getCabinetValue(cabinet, field.sourceKey) : "";
            const currentValue = testValues[field.key] || autoValue;
            const isFilled = Boolean(currentValue);
            const isHighlighted = highlightedFieldKey === field.key;

            return (
              <div
                key={field.key}
                className={cn(
                  "space-y-1.5 transition-all duration-300",
                  isHighlighted && "ring-2 ring-primary ring-offset-2 rounded-lg p-2 -m-2"
                )}
              >
                <Label
                  htmlFor={field.key}
                  className="text-sm flex items-center gap-1.5"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-destructive">*</span>
                  )}
                  {isAuto && isFilled && (
                    <Sparkles className="w-3 h-3 text-primary ml-1" />
                  )}
                  {!isAuto && isFilled && (
                    <CheckCircle2 className="w-3 h-3 text-primary/70 ml-1" />
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id={field.key}
                    type={getInputType(field.dataType)}
                    value={currentValue}
                    onChange={(e) => onFieldValueChange(field.key, e.target.value)}
                    placeholder={field.placeholder || `Введіть ${field.label.toLowerCase()}`}
                    className={cn(
                      "w-full",
                      isAuto && isFilled && "bg-primary/5 border-primary/30"
                    )}
                    readOnly={isAuto && Boolean(autoValue)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Map data type to input type
function getInputType(dataType: string): string {
  switch (dataType) {
    case "number":
    case "currency":
      return "number";
    case "date":
      return "date";
    case "email":
      return "email";
    case "phone":
      return "tel";
    default:
      return "text";
  }
}
