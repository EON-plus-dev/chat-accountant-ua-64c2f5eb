/**
 * FieldAnchorCard Component
 * Card for individual document field with source-based color coding
 * Supports inline editing for manual fields and 1:1 navigation to document
 */

import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Check, AlertCircle, Link, Sparkles, Edit3, Zap, Building2,
  type LucideIcon 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { FieldSource } from "@/config/documentFormSchemas";

export interface FieldAnchorCardProps {
  /** Template field definition */
  field: UnifiedTemplateField;
  /** Current field value */
  value: string;
  /** Value change handler (only for manual/computed editable fields) */
  onChange?: (value: string) => void;
  /** Navigate to field in document */
  onNavigate: () => void;
  /** Is card highlighted */
  isHighlighted?: boolean;
  /** Hover handler for bidirectional sync */
  onHover?: (fieldKey: string | null) => void;
  /** Is field read-only (auto-filled from system) */
  isAutoFilled?: boolean;
  /** Additional class names */
  className?: string;
}

// Source-based styling
const sourceStyles: Record<FieldSource, { 
  border: string; 
  bg: string; 
  icon: LucideIcon;
  iconColor: string;
  navBg: string;
  navText: string;
}> = {
  manual: {
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-amber-50/40 dark:bg-amber-950/30",
    icon: Edit3,
    iconColor: "text-amber-600 dark:text-amber-400",
    navBg: "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-900",
    navText: "text-amber-700 dark:text-amber-400",
  },
  computed: {
    border: "border-emerald-200 dark:border-emerald-800/60",
    bg: "bg-emerald-50/40 dark:bg-emerald-950/30",
    icon: Zap,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    navBg: "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-900",
    navText: "text-emerald-700 dark:text-emerald-400",
  },
  cabinet: {
    border: "border-blue-200 dark:border-blue-800/60",
    bg: "bg-blue-50/40 dark:bg-blue-950/30",
    icon: Building2,
    iconColor: "text-blue-600 dark:text-blue-400",
    navBg: "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900",
    navText: "text-blue-700 dark:text-blue-400",
  },
  contractor: {
    border: "border-purple-200 dark:border-purple-800/60",
    bg: "bg-purple-50/40 dark:bg-purple-950/30",
    icon: Sparkles,
    iconColor: "text-purple-600 dark:text-purple-400",
    navBg: "bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900",
    navText: "text-purple-700 dark:text-purple-400",
  },
  employee: {
    border: "border-indigo-200 dark:border-indigo-800/60",
    bg: "bg-indigo-50/40 dark:bg-indigo-950/30",
    icon: Sparkles,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    navBg: "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-900",
    navText: "text-indigo-700 dark:text-indigo-400",
  },
};

// Get input type from data type
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

export const FieldAnchorCard = forwardRef<HTMLDivElement, FieldAnchorCardProps>(
  ({ 
    field,
    value,
    onChange,
    onNavigate,
    isHighlighted,
    onHover,
    isAutoFilled = false,
    className,
  }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const styles = sourceStyles[field.source] || sourceStyles.manual;
    const SourceIcon = styles.icon;
    const isFilled = Boolean(value);
    const isEditable = field.source === "manual" && onChange;
    
    // Update edit value when prop value changes
    useEffect(() => {
      setEditValue(value);
    }, [value]);
    
    // Focus input when editing starts
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);
    
    // Handle click to start editing
    const handleClick = useCallback(() => {
      if (isEditable) {
        setIsEditing(true);
      }
    }, [isEditable]);
    
    // Handle blur to save and exit editing
    const handleBlur = useCallback(() => {
      setIsEditing(false);
      if (onChange && editValue !== value) {
        onChange(editValue);
      }
    }, [onChange, editValue, value]);
    
    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleBlur();
      } else if (e.key === "Escape") {
        setEditValue(value);
        setIsEditing(false);
      }
    }, [handleBlur, value]);
    
    return (
      <div
        ref={ref}
        data-anchor-card-id={field.key}
        data-field-card
        data-field-source={field.source}
        className={cn(
          "group relative flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200",
          "min-w-[120px] w-[140px] sm:w-[130px] flex-shrink-0",
          "min-h-[64px] sm:min-h-[56px]",
          "select-none touch-manipulation",
          "snap-start",
          styles.border,
          styles.bg,
          isHighlighted && "ring-2 ring-primary/50",
          isEditable && "cursor-text",
          !isEditable && "cursor-default",
          className
        )}
        onMouseEnter={() => onHover?.(field.key)}
        onMouseLeave={() => onHover?.(null)}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-muted-foreground min-w-0">
            <SourceIcon className={cn("w-3.5 h-3.5 flex-shrink-0", styles.iconColor)} />
            <span className="text-[11px] font-medium truncate">
              {field.label}
            </span>
            {field.required && (
              <span className="text-destructive text-[10px]">*</span>
            )}
          </div>
          {isFilled ? (
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
          )}
        </div>
        
        {/* Value or Input */}
        {isEditing ? (
          <Input
            ref={inputRef}
            type={getInputType(field.dataType)}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Введіть...`}
            className={cn(
              "h-6 text-sm px-1.5 py-0.5",
              "bg-background/80 border-primary/30"
            )}
          />
        ) : (
          <p className={cn(
            "text-sm font-medium truncate pr-6",
            !isFilled && "text-muted-foreground italic text-xs"
          )}>
            {isFilled ? value : (isEditable ? "Натисніть..." : "Очікує...")}
          </p>
        )}
        
        {/* Navigation button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-no-drag
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onNavigate();
              }}
              className={cn(
                "absolute bottom-2 right-2 p-1 rounded-full z-10",
                "opacity-100",
                styles.navBg,
                styles.navText,
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              <Link className="w-2.5 h-2.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Перейти до поля в документі
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }
);

FieldAnchorCard.displayName = "FieldAnchorCard";
