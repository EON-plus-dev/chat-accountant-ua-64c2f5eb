import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getAllMetricConfigs, type MetricId } from "@/lib/analytics/metricSectionMatrix";

interface MetricTabsStripProps {
  activeMetric: MetricId | null;
  availableMetrics: MetricId[];
  onChange: (metric: MetricId) => void;
  className?: string;
}

/**
 * Горизонтальна стрічка перемикання активної метрики.
 * Active tab підкреслюється brand-кольором метрики (без зміни фону).
 */
export const MetricTabsStrip = ({
  activeMetric,
  availableMetrics,
  onChange,
  className,
}: MetricTabsStripProps) => {
  const all = getAllMetricConfigs();
  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="tablist"
        aria-label="Показники аналітики"
        className={cn(
          "flex items-center gap-1 overflow-x-auto scrollbar-thin border-b border-border/40",
          className,
        )}
      >
        {all.map((cfg) => {
          const Icon = cfg.icon;
          const isAvailable = availableMetrics.includes(cfg.id);
          const isActive = activeMetric === cfg.id;

          if (!isAvailable) {
            return (
              <Tooltip key={cfg.id}>
                <TooltipTrigger asChild>
                  <div
                    aria-disabled
                    className="flex items-center gap-1.5 px-3 h-9 text-xs text-muted-foreground/50 cursor-not-allowed shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{cfg.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Підключіть джерело для доступу</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <button
              key={cfg.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cfg.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-9 text-xs font-medium shrink-0",
                "border-b-2 -mb-px transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
              style={isActive ? { borderColor: cfg.color } : undefined}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
