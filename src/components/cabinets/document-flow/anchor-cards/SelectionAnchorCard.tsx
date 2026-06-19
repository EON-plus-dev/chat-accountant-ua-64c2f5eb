/**
 * SelectionAnchorCard Component
 * Card for selecting entities (Contractor, Employee, Vehicle) that auto-fill related fields
 * Selection of one entity fills multiple document fields automatically
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check, AlertCircle, Link, Sparkles, type LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export type SelectionCardStatus = "empty" | "editing" | "filled";

export interface SelectionAnchorCardProps {
  /** Unique card identifier */
  id: string;
  /** Card icon */
  icon: LucideIcon;
  /** Card label (e.g., "Контрагент", "Водій") */
  label: string;
  /** Display value when entity is selected */
  displayValue: string;
  /** Current status */
  status: SelectionCardStatus;
  /** Number of fields auto-filled by this selection */
  autoFilledCount?: number;
  /** Is card highlighted (bidirectional sync) */
  isHighlighted?: boolean;
  /** Is popover open */
  isOpen?: boolean;
  /** Popover open state handler */
  onOpenChange?: (open: boolean) => void;
  /** Card click handler */
  onClick?: () => void;
  /** Hover handler for bidirectional sync */
  onHover?: (id: string | null) => void;
  /** Navigate to section in document */
  onNavigate?: () => void;
  /** Popover content for entity selection */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Is card disabled */
  disabled?: boolean;
  /** Popover side */
  popoverSide?: "top" | "bottom" | "left" | "right";
  /** Popover align */
  popoverAlign?: "start" | "center" | "end";
}

const statusStyles: Record<SelectionCardStatus, { border: string; bg: string }> = {
  empty: {
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-amber-50/30 dark:bg-amber-950/20",
  },
  editing: {
    border: "ring-2 ring-primary border-transparent",
    bg: "bg-background",
  },
  filled: {
    border: "border-purple-200 dark:border-purple-800/60",
    bg: "bg-purple-50/30 dark:bg-purple-950/20",
  },
};

export const SelectionAnchorCard = forwardRef<HTMLDivElement, SelectionAnchorCardProps>(
  ({ 
    id, 
    icon: Icon, 
    label, 
    displayValue,
    status,
    autoFilledCount,
    isHighlighted, 
    isOpen, 
    onOpenChange, 
    onClick, 
    onHover,
    onNavigate,
    children, 
    className, 
    disabled,
    popoverSide = "bottom",
    popoverAlign = "start",
  }, ref) => {
    const currentStatus = isOpen ? "editing" : status;
    const currentStyles = isOpen ? statusStyles.editing : statusStyles[status];
    
    const cardContent = (
      <div
        ref={ref}
        data-anchor-card-id={id}
        data-selection-card
        className={cn(
          "group relative flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200",
          "min-w-[140px] w-[160px] sm:w-[150px] flex-shrink-0",
          "min-h-[72px] sm:min-h-[64px]",
          "cursor-pointer select-none touch-manipulation",
          "snap-start",
          currentStyles.border,
          currentStyles.bg,
          isHighlighted && "ring-2 ring-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseEnter={() => onHover?.(id)}
        onMouseLeave={() => onHover?.(null)}
        onClick={disabled ? undefined : onClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
          </div>
          {status === "filled" ? (
            <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          ) : status === "empty" ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          ) : null}
        </div>
        
        {/* Value */}
        <p className={cn(
          "text-sm font-medium truncate pr-5",
          status === "empty" && "text-muted-foreground italic"
        )}>
          {status === "empty" ? "Оберіть" : displayValue}
        </p>
        
        {/* Auto-filled indicator */}
        {status === "filled" && autoFilledCount && autoFilledCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400">
            <Sparkles className="w-3 h-3" />
            <span>Авто: {autoFilledCount} полів</span>
          </div>
        )}
      </div>
    );
    
    // Build card for popover (without navigation icon inline)
    const cardContentForPopover = (
      <div
        ref={ref}
        data-anchor-card-id={id}
        data-selection-card
        className={cn(
          "group relative flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200",
          "min-w-[140px] w-[160px] sm:w-[150px] flex-shrink-0",
          "min-h-[72px] sm:min-h-[64px]",
          "cursor-pointer select-none touch-manipulation",
          "snap-start",
          currentStyles.border,
          currentStyles.bg,
          isHighlighted && "ring-2 ring-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onMouseEnter={() => onHover?.(id)}
        onMouseLeave={() => onHover?.(null)}
        onClick={disabled ? undefined : onClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{label}</span>
          </div>
          {status === "filled" ? (
            <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          ) : status === "empty" ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          ) : null}
        </div>
        
        {/* Value */}
        <p className={cn(
          "text-sm font-medium truncate pr-5",
          status === "empty" && "text-muted-foreground italic"
        )}>
          {status === "empty" ? "Оберіть" : displayValue}
        </p>
        
        {/* Auto-filled indicator */}
        {status === "filled" && autoFilledCount && autoFilledCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400">
            <Sparkles className="w-3 h-3" />
            <span>Авто: {autoFilledCount} полів</span>
          </div>
        )}
      </div>
    );
    
    if (children) {
      return (
        <div className="relative group">
          <Popover open={isOpen} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              {cardContentForPopover}
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 p-0 bg-popover border shadow-lg z-50" 
              align={popoverAlign}
              side={popoverSide}
              sideOffset={8}
            >
              {children}
            </PopoverContent>
          </Popover>
          
          {/* Navigation icon OUTSIDE Popover */}
          {!disabled && onNavigate && (
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
                    "bg-purple-100 text-purple-600 hover:bg-purple-200",
                    "dark:bg-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-900",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  )}
                >
                  <Link className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Перейти до секції в документі
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    }
    
    // Card without popover but with navigation icon
    return (
      <div className="relative group">
        {cardContent}
        {!disabled && onNavigate && (
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
                  "bg-purple-100 text-purple-600 hover:bg-purple-200",
                  "dark:bg-purple-900/50 dark:text-purple-400 dark:hover:bg-purple-900",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                )}
              >
                <Link className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Перейти до секції в документі
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }
);

SelectionAnchorCard.displayName = "SelectionAnchorCard";
