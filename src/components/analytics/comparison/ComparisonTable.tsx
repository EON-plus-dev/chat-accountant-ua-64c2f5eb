import { TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ComparisonDataPoint, ComparisonMetric, Industry } from "@/types/comparison";
import { METRIC_CONFIGS } from "@/types/comparison";
import { INDUSTRY_BENCHMARKS, getIndustryLabel } from "@/config/industryBenchmarks";

interface ComparisonTableProps {
  dataPoints: ComparisonDataPoint[];
  metrics: ComparisonMetric[];
  showDeltas?: boolean;
  showBenchmarks?: boolean;
  benchmarkIndustry?: Industry;
  onItemClick?: (itemId: string) => void;
}

const formatValue = (value: number, format: "currency" | "percent" | "number"): string => {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("uk-UA", { 
        style: "currency", 
        currency: "UAH", 
        maximumFractionDigits: 0,
        notation: value >= 1000000 ? "compact" : "standard",
      }).format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "number":
      return value.toLocaleString("uk-UA");
    default:
      return String(value);
  }
};

const DeltaIndicator = ({ delta }: { delta: { value: number; percent: number; direction: "up" | "down" | "stable" } }) => {
  const Icon = delta.direction === "up" ? TrendingUp : delta.direction === "down" ? TrendingDown : Minus;
  const colorClass = delta.direction === "up" 
    ? "text-success" 
    : delta.direction === "down" 
    ? "text-destructive" 
    : "text-muted-foreground";
  
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs", colorClass)}>
      <Icon className="h-3 w-3" />
      <span>{delta.percent > 0 ? "+" : ""}{delta.percent.toFixed(1)}%</span>
    </span>
  );
};

export function ComparisonTable({ 
  dataPoints, 
  metrics, 
  showDeltas = true, 
  showBenchmarks = false,
  benchmarkIndustry,
  onItemClick 
}: ComparisonTableProps) {
  if (dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        Оберіть елементи для порівняння
      </div>
    );
  }
  
  const selectedMetrics = METRIC_CONFIGS.filter(m => metrics.includes(m.id));
  const benchmark = benchmarkIndustry 
    ? INDUSTRY_BENCHMARKS.find(b => b.id === benchmarkIndustry) 
    : undefined;
  
  // Find best/worst for each metric
  const rankings: Record<ComparisonMetric, { best: string; worst: string }> = {} as any;
  selectedMetrics.forEach(metric => {
    const sorted = [...dataPoints].sort((a, b) => {
      const aVal = a.metrics[metric.id];
      const bVal = b.metrics[metric.id];
      // For taxBurden, lower is better
      if (metric.colorScale === "negative") {
        return aVal - bVal;
      }
      return bVal - aVal;
    });
    rankings[metric.id] = {
      best: sorted[0]?.itemId || "",
      worst: sorted[sorted.length - 1]?.itemId || "",
    };
  });
  
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">
                Показник
              </TableHead>
              {dataPoints.map((dp) => (
                <TableHead 
                  key={dp.itemId} 
                  className="text-center min-w-[120px] cursor-pointer hover:bg-muted/50"
                  onClick={() => onItemClick?.(dp.itemId)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: dp.color }}
                    />
                    <span className="text-xs font-medium truncate max-w-[100px]">
                      {dp.itemLabel}
                    </span>
                  </div>
                </TableHead>
              ))}
              {dataPoints.length >= 2 && (
                <TableHead className="text-center min-w-[80px]">
                  Δ MAX
                </TableHead>
              )}
              {showBenchmarks && benchmark && (
                <TableHead className="text-center min-w-[100px]">
                  📊 Benchmark
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedMetrics.map((metric) => {
              const values = dataPoints.map(dp => dp.metrics[metric.id]);
              const maxDelta = Math.max(...values) - Math.min(...values);
              const hasBenchmark = showBenchmarks && benchmark && (metric.id === "taxBurden" || metric.id === "laborCost");
              const benchmarkData = hasBenchmark && benchmark
                ? benchmark.benchmarks[metric.id as "taxBurden" | "laborCost"]
                : null;
              
              return (
                <TableRow key={metric.id}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help border-b border-dotted border-muted-foreground">
                          {metric.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metric.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  
                  {dataPoints.map((dp) => {
                    const value = dp.metrics[metric.id];
                    const isBest = rankings[metric.id].best === dp.itemId && dataPoints.length > 1;
                    const isWorst = rankings[metric.id].worst === dp.itemId && dataPoints.length > 1;
                    const delta = showDeltas && dp.deltas ? dp.deltas[metric.id] : undefined;
                    
                    return (
                      <TableCell 
                        key={`${dp.itemId}-${metric.id}`}
                        className={cn(
                          "text-center",
                          isBest && "bg-success/10",
                          isWorst && metric.colorScale === "negative" && "bg-destructive/10"
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            {isBest && <Trophy className="h-3 w-3 text-amber-500" />}
                            {isWorst && metric.colorScale === "negative" && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                            <span className={cn(
                              "font-medium",
                              metric.format === "percent" && value > 10 && metric.colorScale === "negative" && "text-destructive",
                              metric.format === "percent" && value <= 7 && metric.colorScale === "negative" && "text-success"
                            )}>
                              {formatValue(value, metric.format)}
                            </span>
                          </div>
                          {delta && <DeltaIndicator delta={delta} />}
                        </div>
                      </TableCell>
                    );
                  })}
                  
                  {dataPoints.length >= 2 && (
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {formatValue(maxDelta, metric.format)}
                      </Badge>
                    </TableCell>
                  )}
                  
                  {showBenchmarks && benchmark && (
                    <TableCell className="text-center">
                      {benchmarkData ? (
                        <div className="text-xs">
                          <div className="text-muted-foreground">
                            {getIndustryLabel(benchmarkIndustry!)}: {benchmarkData.optimal}%
                          </div>
                          <div className="text-muted-foreground/70">
                            ({benchmarkData.low}–{benchmarkData.high}%)
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
