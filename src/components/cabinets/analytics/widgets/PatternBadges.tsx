import { TrendingUp, TrendingDown, Minus, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PatternBadge {
  id: string;
  label: string;
  type: "growth" | "decline" | "stable" | "anomaly" | "warning";
}

interface PatternBadgesProps {
  patterns: PatternBadge[];
  maxVisible?: number;
  className?: string;
}

const typeConfig = {
  growth: { icon: TrendingUp, color: "text-success bg-success/10 border-success/20" },
  decline: { icon: TrendingDown, color: "text-destructive bg-destructive/10 border-destructive/20" },
  stable: { icon: Minus, color: "text-muted-foreground bg-muted/60 border-border/50" },
  anomaly: { icon: Zap, color: "text-warning bg-warning/10 border-warning/20" },
  warning: { icon: AlertTriangle, color: "text-warning bg-warning/10 border-warning/20" },
};

export const PatternBadges = ({ patterns, maxVisible = 6, className }: PatternBadgesProps) => {
  if (patterns.length === 0) return null;

  const visible = patterns.slice(0, maxVisible);
  const remaining = patterns.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((p) => {
        const cfg = typeConfig[p.type];
        return (
          <div
            key={p.id}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
              cfg.color
            )}
          >
            <cfg.icon className="w-3 h-3" />
            {p.label}
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/60 border border-border/50 text-xs text-muted-foreground">
          +{remaining}
        </div>
      )}
    </div>
  );
};
