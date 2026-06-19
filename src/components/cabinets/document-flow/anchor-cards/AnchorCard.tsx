/**
 * AnchorCard Component
 * Base interactive card for document creation input with Popover support
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check, AlertCircle, Link, type LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type AnchorCardStatus = "empty" | "editing" | "filled" | "error" | "locked";

export interface AnchorCardProps {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  secondaryValue?: string;
  status: AnchorCardStatus;
  isHighlighted?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClick?: () => void;
  onHover?: (id: string | null) => void;
  onNavigate?: () => void; // Navigate to field in document
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  popoverSide?: "top" | "bottom" | "left" | "right";
  popoverAlign?: "start" | "center" | "end";
  showNavigationIcon?: boolean;
}

const statusStyles: Record<AnchorCardStatus, { border: string; bg: string; badge: React.ReactNode }> = {
  empty: {
    border: "border-amber-200 dark:border-amber-800/60",
    bg: "bg-amber-50/30 dark:bg-amber-950/20",
    badge: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
  },
  editing: {
    border: "ring-2 ring-primary border-transparent",
    bg: "bg-background",
    badge: null,
  },
  filled: {
    border: "border-emerald-200 dark:border-emerald-800/60",
    bg: "bg-emerald-50/30 dark:bg-emerald-950/20",
    badge: <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
  },
  error: {
    border: "border-destructive/50",
    bg: "bg-destructive/5",
    badge: <AlertCircle className="w-3.5 h-3.5 text-destructive" />,
  },
  locked: {
    border: "border-muted",
    bg: "bg-muted/50",
    badge: null,
  },
};

export const AnchorCard = forwardRef<HTMLDivElement, AnchorCardProps>(
  ({ 
    id, 
    icon: Icon, 
    label, 
    value, 
    secondaryValue,
    status, 
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
    showNavigationIcon = true,
  }, ref) => {
    const styles = statusStyles[status];
    const currentStatus = isOpen ? "editing" : status;
    const currentStyles = isOpen ? statusStyles.editing : styles;
    
    const cardContent = (
      <div
        ref={ref}
        data-anchor-card-id={id}
        className={cn(
          "group relative flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200",
          "min-w-[180px] w-[200px] sm:w-[180px] flex-shrink-0",
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
          {currentStatus !== "editing" && styles.badge}
        </div>
        
        {/* Value */}
        <p className={cn(
          "text-sm font-medium truncate pr-5",
          currentStatus === "empty" && "text-muted-foreground italic"
        )}>
          {currentStatus === "empty" ? "Оберіть" : value}
        </p>
        
        {/* Secondary Value (e.g., VAT amount) */}
        {secondaryValue && (
          <p className="text-xs text-muted-foreground truncate">
            {secondaryValue}
          </p>
        )}
        
        {/* Navigation icon - appears on hover, only if onNavigate is provided */}
        {showNavigationIcon && !disabled && onNavigate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-no-drag
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
                className={cn(
                  "absolute bottom-2 right-2 p-1 rounded-full",
                  "opacity-100",
                  "bg-primary/10 text-primary hover:bg-primary/20",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
              >
                <Link className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Перейти до поля в документі
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
    
    if (children) {
      // Build card content WITHOUT navigation icon (will render separately outside Popover)
      const cardContentForPopover = (
        <div
          ref={ref}
          data-anchor-card-id={id}
          className={cn(
            "group relative flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200",
            "min-w-[180px] w-[200px] sm:w-[180px] flex-shrink-0",
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
            {currentStatus !== "editing" && styles.badge}
          </div>
          
          {/* Value */}
          <p className={cn(
            "text-sm font-medium truncate pr-5",
            currentStatus === "empty" && "text-muted-foreground italic"
          )}>
            {currentStatus === "empty" ? "Оберіть" : value}
          </p>
          
          {/* Secondary Value (e.g., VAT amount) */}
          {secondaryValue && (
            <p className="text-xs text-muted-foreground truncate">
              {secondaryValue}
            </p>
          )}
        </div>
      );
      
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
          
          {/* Navigation icon OUTSIDE Popover to prevent click interception */}
          {showNavigationIcon && !disabled && onNavigate && (
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
                    "bg-primary/10 text-primary hover:bg-primary/20",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                >
                  <Link className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Перейти до поля в документі
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    }
    
    return cardContent;
  }
);

AnchorCard.displayName = "AnchorCard";
