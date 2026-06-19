import { CheckCircle2, AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BenchmarkComparison, Industry } from "@/types/comparison";
import { getIndustryLabel } from "@/config/industryBenchmarks";

interface BenchmarkGaugeProps {
  comparison: BenchmarkComparison;
  showRecommendation?: boolean;
}

export function BenchmarkGauge({ comparison, showRecommendation = true }: BenchmarkGaugeProps) {
  const { value, benchmark, status, industry, metric, recommendation } = comparison;
  const { low, optimal, high } = benchmark;
  
  // Calculate position on scale (0-100)
  const range = high - low;
  const position = Math.max(0, Math.min(100, ((value - low) / range) * 100));
  
  // Calculate optimal position
  const optimalPosition = ((optimal - low) / range) * 100;
  
  const metricLabel = metric === "taxBurden" ? "Tax Burden" : "Labor Cost";
  const industryLabel = getIndustryLabel(industry);
  
  const StatusIcon = status === "below" ? TrendingDown : status === "optimal" ? CheckCircle2 : AlertTriangle;
  const statusColor = status === "optimal" ? "text-success" : status === "below" ? "text-blue-500" : "text-destructive";
  const statusBg = status === "optimal" ? "bg-success/10" : status === "below" ? "bg-blue-500/10" : "bg-destructive/10";
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{metricLabel}: {value.toFixed(1)}%</span>
        <span className="text-xs text-muted-foreground">vs {industryLabel}: {optimal}%</span>
      </div>
      
      {/* Gauge */}
      <div className="relative h-6 rounded-full bg-muted overflow-hidden">
        {/* Zones */}
        <div className="absolute inset-0 flex">
          <div className="h-full bg-blue-500/20" style={{ width: "33%" }} />
          <div className="h-full bg-success/20" style={{ width: "34%" }} />
          <div className="h-full bg-destructive/20" style={{ width: "33%" }} />
        </div>
        
        {/* Optimal marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/30"
          style={{ left: `${optimalPosition}%` }}
        />
        
        {/* Current value marker */}
        <div 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-background shadow-md",
            status === "optimal" ? "bg-success" : status === "below" ? "bg-blue-500" : "bg-destructive"
          )}
          style={{ left: `calc(${position}% - 8px)` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>LOW ({low}%)</span>
        <span>OPTIMAL ({optimal}%)</span>
        <span>HIGH ({high}%)</span>
      </div>
      
      {/* Status message */}
      <div className={cn("flex items-start gap-2 p-2 rounded-lg", statusBg)}>
        <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", statusColor)} />
        <div className="text-xs">
          {status === "optimal" && (
            <span>Ваш показник у межах оптимального діапазону для галузі {industryLabel}</span>
          )}
          {status === "below" && (
            <span>
              Ваш {metricLabel} нижче середнього по галузі на {(optimal - value).toFixed(1)} п.п. — це відмінний результат!
            </span>
          )}
          {status === "above" && (
            <span>
              Ваш {metricLabel} вище оптимального рівня на {(value - optimal).toFixed(1)} п.п.
            </span>
          )}
        </div>
      </div>
      
      {/* Recommendation */}
      {showRecommendation && recommendation && (
        <p className="text-xs text-muted-foreground italic">{recommendation}</p>
      )}
    </div>
  );
}

// Compact inline badge for table cells
interface BenchmarkBadgeProps {
  value: number;
  benchmark: { low: number; optimal: number; high: number };
  industry: Industry;
}

export function BenchmarkBadge({ value, benchmark, industry }: BenchmarkBadgeProps) {
  const { low, optimal, high } = benchmark;
  const industryLabel = getIndustryLabel(industry);
  
  let status: "below" | "optimal" | "above";
  if (value < low) status = "below";
  else if (value > high) status = "above";
  else status = "optimal";
  
  const delta = value - optimal;
  
  return (
    <div className="text-xs">
      <div className="text-muted-foreground">{industryLabel}: {optimal}%</div>
      <div className={cn(
        "font-medium",
        status === "optimal" ? "text-success" : status === "below" ? "text-blue-500" : "text-destructive"
      )}>
        {delta > 0 ? "+" : ""}{delta.toFixed(1)} п.п.
      </div>
    </div>
  );
}
