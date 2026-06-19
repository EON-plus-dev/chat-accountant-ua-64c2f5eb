import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getIndustryBenchmark } from "@/config/industryBenchmarks";
import type { Industry, BenchmarkHistoryPoint } from "@/types/comparison";
import { useIsMobile } from "@/hooks/use-mobile";

interface BenchmarkTrendChartProps {
  history: BenchmarkHistoryPoint[];
  industry: Industry;
  metric?: "taxBurden" | "laborCost";
  className?: string;
}

interface TrendInfo {
  direction: "improving" | "worsening" | "stable";
  delta: number;
  icon: React.ElementType;
  color: string;
  label: string;
}

export function BenchmarkTrendChart({
  history,
  industry,
  metric = "taxBurden",
  className,
}: BenchmarkTrendChartProps) {
  const isMobile = useIsMobile();
  const benchmark = getIndustryBenchmark(industry);

  // Filter to last 6 months on mobile, 12 on desktop
  const displayHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => a.month.localeCompare(b.month));
    return isMobile ? sorted.slice(-6) : sorted.slice(-12);
  }, [history, isMobile]);

  // Calculate trend info
  const trendInfo = useMemo((): TrendInfo | null => {
    if (displayHistory.length < 2) return null;

    const first = displayHistory[0][metric];
    const last = displayHistory[displayHistory.length - 1][metric];
    const delta = last - first;
    const threshold = 0.5; // 0.5 п.п.

    // For tax burden and labor cost, lower is better
    if (Math.abs(delta) < threshold) {
      return {
        direction: "stable",
        delta,
        icon: Minus,
        color: "text-muted-foreground",
        label: "Стабільно",
      };
    } else if (delta < 0) {
      return {
        direction: "improving",
        delta: Math.abs(delta),
        icon: TrendingDown,
        color: "text-emerald-600 dark:text-emerald-400",
        label: "Покращення",
      };
    } else {
      return {
        direction: "worsening",
        delta,
        icon: TrendingUp,
        color: "text-red-600 dark:text-red-400",
        label: "Зростання",
      };
    }
  }, [displayHistory, metric]);

  const currentValue = displayHistory[displayHistory.length - 1]?.[metric] || 0;
  const optimalValue = benchmark?.benchmarks[metric]?.optimal || 0;

  const metricLabel = metric === "taxBurden" ? "Tax Burden" : "Labor Cost";

  const chartData = useMemo(() => {
    return displayHistory.map((point) => ({
      ...point,
      value: point[metric],
      // Format month for display
      label: formatMonthLabel(point.month, isMobile),
    }));
  }, [displayHistory, metric, isMobile]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header with current value and trend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{metricLabel}:</span>
          <span className="text-lg font-bold">{currentValue.toFixed(1)}%</span>
          {trendInfo && (
            <Badge 
              variant="secondary" 
              className={cn("text-xs gap-1", trendInfo.color)}
            >
              <trendInfo.icon className="w-3 h-3" />
              {trendInfo.delta.toFixed(1)} п.п. за {isMobile ? "6" : "12"} міс.
            </Badge>
          )}
        </div>
        {optimalValue > 0 && (
          <span className="text-xs text-muted-foreground">
            Оптимум галузі: {optimalValue}%
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="h-32 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval={isMobile ? 1 : 0}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={30}
              tickFormatter={(value) => `${value}%`}
              domain={["dataMin - 1", "dataMax + 1"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-md px-3 py-2 shadow-md">
                    <p className="text-xs text-muted-foreground">{data.month}</p>
                    <p className="text-sm font-medium">{data.value.toFixed(1)}%</p>
                  </div>
                );
              }}
            />
            
            {/* Optimal reference line */}
            {optimalValue > 0 && (
              <ReferenceLine 
                y={optimalValue} 
                stroke="hsl(var(--chart-2))" 
                strokeDasharray="4 4"
                strokeOpacity={0.7}
              />
            )}
            
            <Line
              type="monotone"
              dataKey="value"
              stroke={
                trendInfo?.direction === "improving" 
                  ? "hsl(var(--chart-2))" 
                  : trendInfo?.direction === "worsening"
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--primary))"
              }
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend summary */}
      {trendInfo && trendInfo.direction !== "stable" && (
        <div className={cn(
          "text-xs p-2 rounded-md flex items-center gap-2",
          trendInfo.direction === "improving" 
            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
        )}>
          <trendInfo.icon className="w-4 h-4 flex-shrink-0" />
          <span>
            {trendInfo.direction === "improving" 
              ? `Покращення: знизили ${metricLabel} на ${trendInfo.delta.toFixed(1)} п.п.`
              : `Зростання: ${metricLabel} збільшився на ${trendInfo.delta.toFixed(1)} п.п.`
            }
          </span>
        </div>
      )}
    </div>
  );
}

function formatMonthLabel(month: string, short: boolean): string {
  const monthNames = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
  const [year, m] = month.split("-");
  const monthIndex = parseInt(m, 10) - 1;
  
  if (short) {
    return monthNames[monthIndex] || month;
  }
  return `${monthNames[monthIndex]} '${year.slice(2)}`;
}
