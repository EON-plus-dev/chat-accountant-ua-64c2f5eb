import { CheckCircle2, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LegalStatus = "ok" | "warning" | "missing";

interface LegalStatusRowProps {
  icon: LucideIcon;
  title: string;
  status: LegalStatus;
  statusLabel?: string;
  action?: { 
    label: string; 
    onClick: () => void; 
  };
  className?: string;
}

/**
 * Compact one-liner for legal section status display.
 * Used in DocumentIntelligenceCard for minimalist legal health overview.
 */
export const LegalStatusRow = ({ 
  icon: Icon, 
  title, 
  status, 
  statusLabel, 
  action,
  className 
}: LegalStatusRowProps) => (
  <div 
    className={cn(
      "flex items-center justify-between py-2.5 px-2 hover:bg-muted/50 rounded-md transition-colors min-h-[44px] sm:min-h-0",
      className
    )}
  >
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm truncate">{title}</span>
      {status === "warning" && statusLabel && (
        <Badge 
          variant="outline" 
          className="text-[10px] h-5 gap-1 border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/50 dark:text-orange-400 shrink-0"
        >
          {statusLabel}
        </Badge>
      )}
      {status === "ok" && (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      )}
      {status === "missing" && (
        <span className="text-xs text-muted-foreground italic shrink-0">не визначено</span>
      )}
    </div>
    {action && status !== "ok" && (
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2 text-xs shrink-0" 
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    )}
  </div>
);
