/**
 * ValidationBanner Component
 * Expandable validation warnings display with field-level indicators
 * Enterprise-grade: Shows all warnings with collapse/expand and action buttons
 */

import { useState } from "react";
import { 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  UserRoundX, 
  Edit,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ValidationWarning } from "@/hooks/use-document-validation";

interface ValidationBannerProps {
  warnings: ValidationWarning[];
  onCardClick?: (cardId: string) => void;
  maxVisibleCollapsed?: number;
  className?: string;
}

// Icon mapping for action icons
const iconMap: Record<string, typeof ExternalLink> = {
  ExternalLink,
  UserRoundX,
  Edit,
};

export function ValidationBanner({
  warnings,
  onCardClick,
  maxVisibleCollapsed = 2,
  className,
}: ValidationBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (warnings.length === 0) return null;

  const criticalWarnings = warnings.filter((w) => w.type === "critical");
  const otherWarnings = warnings.filter((w) => w.type !== "critical");
  
  // Sort: critical first, then warning, then info
  const sortedWarnings = [...criticalWarnings, ...otherWarnings];
  const hasCritical = criticalWarnings.length > 0;
  const hasMoreThanMax = sortedWarnings.length > maxVisibleCollapsed;

  const visibleWarnings = isExpanded 
    ? sortedWarnings 
    : sortedWarnings.slice(0, maxVisibleCollapsed);

  const hiddenCount = sortedWarnings.length - maxVisibleCollapsed;

  const getWarningIcon = (type: ValidationWarning["type"]) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning shrink-0" />;
      case "info":
        return <Info className="h-4 w-4 text-primary shrink-0" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />;
    }
  };

  const getBannerBackground = () => {
    if (hasCritical) return "bg-destructive/10 border-destructive/30";
    return "bg-warning/10 border-warning/30";
  };

  return (
    <div className={cn("shrink-0 border-b", getBannerBackground(), className)}>
      <div className="px-4 md:px-6 py-2.5">
        {/* Header with count */}
        <div className="flex items-center gap-2 mb-2">
          {hasCritical ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Info className="h-4 w-4 text-warning" />
          )}
          <span className={cn(
            "text-sm font-medium",
            hasCritical ? "text-destructive" : "text-foreground"
          )}>
            {hasCritical 
              ? `${criticalWarnings.length} критичн${criticalWarnings.length === 1 ? 'а' : 'і'} помилк${criticalWarnings.length === 1 ? 'а' : 'и'}`
              : `${sortedWarnings.length} попереджен${sortedWarnings.length === 1 ? 'ня' : 'ь'}`
            }
            {hasCritical && otherWarnings.length > 0 && (
              <span className="text-muted-foreground font-normal">
                {" "}+ {otherWarnings.length} попереджен{otherWarnings.length === 1 ? 'ня' : 'ь'}
              </span>
            )}
          </span>
        </div>

        {/* Warnings list */}
        <div className="space-y-2">
          {visibleWarnings.map((warning) => (
            <div
              key={warning.id}
              className={cn(
                "flex items-start gap-2 p-2 rounded-md transition-colors",
              warning.type === "critical" 
                  ? "bg-destructive/5" 
                  : warning.type === "warning"
                    ? "bg-warning/10"
                    : "bg-muted/50"
              )}
            >
              <div className="mt-0.5">{getWarningIcon(warning.type)}</div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  warning.type === "critical" ? "text-destructive" : "text-foreground"
                )}>
                  {warning.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {warning.message}
                </p>
                
                {/* Actions */}
                {warning.actions && warning.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {warning.actions.map((action, i) => {
                      const IconComponent = action.icon ? iconMap[action.icon] : null;
                      
                      if (action.href) {
                        return (
                          <a
                            key={i}
                            href={action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            {IconComponent && <IconComponent className="h-3 w-3" />}
                            {action.label}
                          </a>
                        );
                      }
                      
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (action.icon === "UserRoundX" && warning.field) {
                              onCardClick?.(warning.field);
                            }
                            action.onClick?.();
                          }}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          {IconComponent && <IconComponent className="h-3 w-3" />}
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Field indicator badge */}
              {warning.field && (
                <button
                  onClick={() => onCardClick?.(warning.field!)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  →
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Expand/Collapse button */}
        {hasMoreThanMax && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 h-7 text-xs gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Згорнути
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Показати всі ({hiddenCount} ще)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
