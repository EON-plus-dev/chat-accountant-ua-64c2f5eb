import { TrendingUp, HelpCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ForecastItem {
  id: string;
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
}

export interface Recommendation {
  id: string;
  text: string;
  why: string;
  actionLabel: string;
  onAction?: () => void;
}

interface ForecastChipsProps {
  forecasts: ForecastItem[];
  recommendations: Recommendation[];
  conclusion?: string;
  className?: string;
}

const confColors = {
  high: "border-success/30 bg-success/5",
  medium: "border-warning/30 bg-warning/5",
  low: "border-muted bg-muted/30",
};

export const ForecastChips = ({ forecasts, recommendations, conclusion, className }: ForecastChipsProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Forecast chips */}
      {forecasts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Прогноз
          </p>
          <div className="flex flex-wrap gap-1.5">
            {forecasts.map((f) => (
              <div
                key={f.id}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs",
                  confColors[f.confidence]
                )}
              >
                <span className="text-muted-foreground">{f.label}:</span>
                <span className="font-semibold tabular-nums">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusion */}
      {conclusion && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p>{conclusion}</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">Рекомендації</p>
          {recommendations.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border/70">
              <div className="flex-1 min-w-0">
                <p className="text-sm">{r.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.why}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] text-xs flex-shrink-0"
                onClick={r.onAction}
              >
                {r.actionLabel}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
