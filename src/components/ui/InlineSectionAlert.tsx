import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineSectionAlertProps {
  type: "ai" | "legal" | "regulatory" | "warning" | "critical";
  title: string;
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Compact one-liner mode */
  compact?: boolean;
  className?: string;
}

/**
 * Inline contextual alert for accordion sections.
 * Provides risk explanations directly where relevant.
 * Supports optional action button for in-context recommendations.
 */
export const InlineSectionAlert = ({ 
  type, 
  title, 
  description, 
  action,
  compact,
  className 
}: InlineSectionAlertProps) => {
  const icon = type === "ai" ? "🤖" : type === "legal" ? "⚖️" : type === "critical" ? "⚠️" : type === "warning" ? "⚡" : "📋";
  
  const bgClass = type === "ai" 
    ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
    : type === "critical"
    ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
    : type === "warning"
    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
    : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800";
  
  const textClass = type === "ai"
    ? "text-blue-800 dark:text-blue-300"
    : type === "critical"
    ? "text-red-800 dark:text-red-300"
    : "text-amber-800 dark:text-amber-300";
  
  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center justify-between gap-2 py-2 px-3 rounded-lg border",
          bgClass,
          className
        )}
        role="alert"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0" aria-hidden="true">{icon}</span>
          <span className={cn("text-sm truncate font-medium", textClass)}>{title}</span>
        </div>
        {action && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 shrink-0 text-xs"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div 
      className={cn("p-3 rounded-lg border mb-3", bgClass, className)}
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-base shrink-0" aria-hidden="true">{icon}</span>
          <div className="min-w-0">
            <p className={cn("font-medium text-sm", textClass)}>{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 shrink-0 text-xs"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};