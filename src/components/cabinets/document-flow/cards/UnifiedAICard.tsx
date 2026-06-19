/**
 * UnifiedAICard Component
 * Polymorphic card for auto-filled fields and AI verification results
 * Premium pill-style design with subtle semantic colors
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  FileQuestion,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles,
  Building2,
  User,
  Lightbulb,
} from "lucide-react";
import type { UnifiedAICardData, AutoFillSource } from "@/types/aiVerification";

interface UnifiedAICardProps {
  card: UnifiedAICardData;
  index: number;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggleExpand: () => void;
  onHover: (id: string | null) => void;
  onClick: () => void;
  onAccept: (id: string, comment?: string) => void;
  onDismiss: (id: string, comment?: string) => void;
}

// Source icon mapping
const sourceIcons: Record<AutoFillSource, typeof Sparkles> = {
  ai: Sparkles,
  profile: User,
  contractor: Building2,
};

// Source labels
const sourceLabels: Record<AutoFillSource, string> = {
  ai: "AI",
  profile: "Профіль",
  contractor: "Довідник",
};

export function UnifiedAICard({
  card,
  index,
  isExpanded,
  isHighlighted,
  onToggleExpand,
  onHover,
  onClick,
  onAccept,
  onDismiss,
}: UnifiedAICardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Debounced hover callback to prevent rapid re-renders (80ms reduces jitter on fast mouse movement)
  const debouncedHover = useCallback((id: string | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      onHover(id);
    }, 80);
  }, [onHover]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  // Determine visual configuration based on type and status
  const getCardConfig = () => {
    const { type, status, confidence, isOrphaned } = card;
    
    // Orphaned state - textRef no longer found in document
    if (isOrphaned) {
      return {
        icon: AlertTriangle,
        borderClass: "border-destructive/40 dark:border-destructive/50",
        bgClass: "bg-destructive/5 dark:bg-destructive/10",
        iconColorClass: "text-destructive",
        badgeVariant: "destructive" as const,
        badgeClass: "",
        badgeText: "Не знайдено",
      };
    }
    
    // User action states
    if (status === "accepted") {
      return {
        icon: CheckCircle,
        borderClass: "border-emerald-200/80 dark:border-emerald-800/60",
        bgClass: "bg-emerald-50/60 dark:bg-emerald-950/20",
        iconColorClass: "text-emerald-600 dark:text-emerald-400",
        badgeVariant: "default" as const,
        badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-0",
        badgeText: "Прийнято",
      };
    }
    
    if (status === "dismissed") {
      return {
        icon: X,
        borderClass: "border-muted/50",
        bgClass: "bg-muted/20 opacity-60",
        iconColorClass: "text-muted-foreground",
        badgeVariant: "secondary" as const,
        badgeClass: "border-0",
        badgeText: "Ігноровано",
      };
    }
    
    // AI status states
    if (type === "auto-filled") {
      if (status === "approved" || status === "pending") {
        return {
          icon: FileCheck,
          borderClass: "border-emerald-100/80 dark:border-emerald-900/50",
          bgClass: "bg-gradient-to-br from-white to-emerald-50/40 dark:from-background dark:to-emerald-950/10",
          iconColorClass: "text-emerald-600 dark:text-emerald-400",
          badgeVariant: "default" as const,
          badgeClass: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0",
          badgeText: `${confidence ?? 0}%`,
        };
      }
      // needs_review
      return {
        icon: FileQuestion,
        borderClass: "border-amber-100/80 dark:border-amber-900/50",
        bgClass: "bg-gradient-to-br from-white to-amber-50/40 dark:from-background dark:to-amber-950/10",
        iconColorClass: "text-amber-600 dark:text-amber-400",
        badgeVariant: "default" as const,
        badgeClass: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0",
        badgeText: `${confidence ?? 0}%`,
      };
    }
    
    // ai-verified type
    if (status === "approved") {
      return {
        icon: CheckCircle,
        borderClass: "border-emerald-100/80 dark:border-emerald-900/50",
        bgClass: "bg-gradient-to-br from-white to-emerald-50/40 dark:from-background dark:to-emerald-950/10",
        iconColorClass: "text-emerald-600 dark:text-emerald-400",
        badgeVariant: "default" as const,
        badgeClass: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0",
        badgeText: "✓ OK",
      };
    }
    
    // needs_review for ai-verified
    return {
      icon: AlertTriangle,
      borderClass: "border-amber-100/80 dark:border-amber-900/50",
      bgClass: "bg-gradient-to-br from-white to-amber-50/40 dark:from-background dark:to-amber-950/10",
      iconColorClass: "text-amber-600 dark:text-amber-400",
      badgeVariant: "default" as const,
      badgeClass: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0",
      badgeText: "⚠️",
    };
  };
  
  const config = getCardConfig();
  const IconComponent = config.icon;
  const SourceIcon = card.source ? sourceIcons[card.source] : null;
  
  // Check if actions are available (not already actioned)
  const canTakeAction = card.status !== "accepted" && card.status !== "dismissed";
  
  return (
    <div
      data-card-strip-id={card.id}
      className={cn(
        // Base structure - responsive width for better mobile readability
        "flex-shrink-0 rounded-xl border cursor-pointer",
        "w-[260px] max-[320px]:w-[calc(100vw-48px)] min-w-[220px] max-w-[280px] min-h-[120px] overflow-hidden",
        // GPU acceleration hint for smooth expand
        "will-change-[max-height]",
        // Precise transitions - only shadow and border, no transform
        "transition-[box-shadow,border-color] duration-200 ease-out",
        // Subtle shadows for depth
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]",
        // Dynamic styling
        config.borderClass,
        config.bgClass,
        // Highlighted state - ring for visibility
        isHighlighted && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background",
        // Hover state - shadow-only lift effect (no scale/translate to avoid layout jumps)
        isHovering && canTakeAction && "shadow-[0_4px_16px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] border-primary/20"
      )}
      style={{
        maxHeight: isExpanded ? 320 : 140,
        transition: 'max-height 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms ease-out, border-color 200ms ease-out',
      }}
      onMouseEnter={() => {
        setIsHovering(true);
        debouncedHover(card.id);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        debouncedHover(null);
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full",
            "bg-background/80 shadow-sm"
          )}>
            <IconComponent className={cn("w-3.5 h-3.5", config.iconColorClass)} />
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            #{index + 1}
          </span>
          <span className="text-sm font-medium truncate text-foreground">
            {card.label}
          </span>
        </div>
        <Badge 
          variant={config.badgeVariant}
          className={cn("text-xs px-2 py-0.5 h-5 flex-shrink-0 font-medium pointer-events-none", config.badgeClass)}
        >
          {config.badgeText}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="px-3 py-2.5 min-w-0">
        <p className="text-sm line-clamp-2 text-foreground/90 leading-relaxed break-words overflow-hidden">
          {card.value}
        </p>
        
        {/* Source / Action status */}
        <div className="flex items-center justify-between mt-2.5">
          {card.userAction ? (
            <span className="text-xs text-muted-foreground">
              ✓ {card.userAction === "accepted" ? "Прийнято" : "Ігноровано"}
              {card.actionTimestamp && (
                <span className="ml-1 opacity-70">
                  • {new Date(card.actionTimestamp).toLocaleTimeString("uk-UA", { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  })}
                </span>
              )}
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              {SourceIcon && (
                <SourceIcon className="w-3.5 h-3.5 text-muted-foreground/70" />
              )}
              <span className="text-xs text-muted-foreground/80">
                {card.source ? sourceLabels[card.source] : card.type === "ai-verified" ? "AI" : ""}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px] h-auto w-auto text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-label={isExpanded ? "Згорнути картку" : "Розгорнути картку"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/20 space-y-3 animate-in fade-in-0 duration-150 overflow-y-auto max-h-[160px] min-w-0">
          {/* AI Comment */}
          {card.aiComment && (
            <div className="flex gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 min-w-0">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed break-words min-w-0">
                {card.aiComment}
              </p>
            </div>
          )}
          
          {/* Suggestions */}
          {card.suggestions && card.suggestions.length > 0 && (
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-medium text-muted-foreground">
                📝 Пропозиції:
              </span>
              <ul className="space-y-1 pl-4 min-w-0">
                {card.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground list-disc break-words">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Action Buttons */}
          {canTakeAction && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(card.id);
                }}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Прийняти
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 text-xs border-border/60 hover:bg-muted/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(card.id);
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Ігнорувати
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
