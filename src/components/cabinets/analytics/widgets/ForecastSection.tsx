import type { ForecastItem } from "@/config/cabinetAnalyticsConfig";
import { formatValue } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/ui/Sparkline";

interface ForecastSectionProps {
  forecasts: ForecastItem[];
}

const statusStyles: Record<string, string> = {
  positive: "text-success",
  warning: "text-warning",
  neutral: "text-foreground",
};

const confidenceLabels: Record<string, { text: string; variant: "outline" | "success" | "warning" }> = {
  high: { text: "висока", variant: "success" },
  medium: { text: "середня", variant: "warning" },
  low: { text: "низька", variant: "outline" },
};

const sparklineColor: Record<string, "success" | "warning" | "primary"> = {
  positive: "success",
  warning: "warning",
  neutral: "primary",
};

export const ForecastSection = ({ forecasts }: ForecastSectionProps) => {
  if (forecasts.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {forecasts.map((forecast) => (
          <div 
            key={forecast.id} 
            className="p-4 bg-muted/30 rounded-lg border border-dashed border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <forecast.icon className={cn("w-4 h-4", statusStyles[forecast.status])} />
              <span className="text-sm text-muted-foreground flex-1">{forecast.title}</span>
              {forecast.confidence && (
                <Badge 
                  variant={confidenceLabels[forecast.confidence].variant} 
                  size="sm" 
                  className="text-[10px] font-normal"
                >
                  {confidenceLabels[forecast.confidence].text}
                </Badge>
              )}
            </div>
            <div className="flex items-end justify-between gap-2">
              <p className={cn("text-xl font-bold tabular-nums", statusStyles[forecast.status])}>
                {typeof forecast.value === "number" ? formatValue(forecast.value, "currency") : forecast.value}
              </p>
              {forecast.historicalData && forecast.historicalData.length >= 2 && (
                <Sparkline 
                  data={forecast.historicalData.map(d => d.value)} 
                  color={sparklineColor[forecast.status] || "primary"}
                  width={64}
                  height={28}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{forecast.description}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 italic">
        * Орієнтовний розрахунок на основі поточних даних. Не є фінансовою порадою.
      </p>
    </div>
  );
};
