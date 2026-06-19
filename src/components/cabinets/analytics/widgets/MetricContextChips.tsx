import { Info, Database, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataSource } from "@/config/cabinetAnalyticsConfig";

interface MetricContextChipsProps {
  metricName?: string;
  sources?: DataSource[];
  asOf?: string;
  definition?: string;
  className?: string;
}

export const MetricContextChips = ({ metricName, sources, asOf, definition, className }: MetricContextChipsProps) => {
  const chips = [
    ...(metricName ? [{ label: metricName, icon: Info, variant: "default" as const }] : []),
    ...(sources && sources.length > 0 ? [{ label: `${sources.length} джерел`, icon: Database, variant: "default" as const }] : []),
    ...(asOf ? [{ label: `Станом на ${asOf}`, icon: Clock, variant: "muted" as const }] : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto scrollbar-none", className)}>
      {chips.map((chip, i) => (
        <div
          key={i}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/50 text-xs font-medium whitespace-nowrap text-muted-foreground"
        >
          <chip.icon className="w-3 h-3" />
          <span>{chip.label}</span>
        </div>
      ))}
      {definition && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/20 text-xs text-primary whitespace-nowrap">
          <Info className="w-3 h-3" />
          <span className="max-w-[200px] truncate">{definition}</span>
        </div>
      )}
    </div>
  );
};
