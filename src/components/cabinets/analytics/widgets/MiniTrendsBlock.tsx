import { useState } from "react";
import { TrendingUp, AlertTriangle as AlertTriangleIcon } from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";
import { SectionBlock } from "./SectionBlock";
import { cn } from "@/lib/utils";

interface FopLimitData {
  currentTotal: number;
  yearlyLimit: number;
  percent: number;
  cumulative: number[];
}

interface MiniTrendsBlockProps {
  incomeSparkData: number[];
  expenseSparkData: number[];
  fopLimitData?: FopLimitData;
}

/** Mini Trends block with 7d/14d toggle */
export const MiniTrendsBlock = ({ incomeSparkData, expenseSparkData, fopLimitData }: MiniTrendsBlockProps) => {
  const [trendPeriod, setTrendPeriod] = useState<"7d" | "14d">("7d");

  const sliceCount = trendPeriod === "7d" ? 7 : 14;
  const incomeSlice = incomeSparkData.slice(-sliceCount);
  const expenseSlice = expenseSparkData.slice(-sliceCount);

  const calcDelta = (data: number[]) => {
    const half = Math.floor(data.length / 2);
    if (half === 0) return 0;
    const recent = data.slice(half).reduce((a, b) => a + b, 0);
    const prev = data.slice(0, half).reduce((a, b) => a + b, 0);
    return prev > 0 ? Math.round(((recent - prev) / prev) * 100) : 0;
  };

  const incomeDelta = calcDelta(incomeSlice);
  const expenseDelta = calcDelta(expenseSlice);

  const countAnomalies = (data: number[]) => {
    if (data.length < 3) return 0;
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    return data.filter(v => v > avg * 2).length;
  };
  const anomalyCount = countAnomalies(incomeSlice) + countAnomalies(expenseSlice);

  const formatDelta = (d: number) => {
    const label = trendPeriod === "7d" ? "попер. тиждень" : "попер. період";
    return `${d >= 0 ? "+" : ""}${d}% vs ${label}`;
  };

  const formatMln = (v: number) => `${(v / 1_000_000).toFixed(1)} млн`;
  const limitColor: "success" | "warning" | "destructive" =
    fopLimitData ? (fopLimitData.percent > 95 ? "destructive" : fopLimitData.percent >= 80 ? "warning" : "success") : "success";

  return (
    <SectionBlock title="Динаміка" icon={TrendingUp}>
      <div className="flex items-center justify-between mb-3 -mt-1">
        <div className="inline-flex items-center rounded-md bg-muted p-0.5">
          {(["7d", "14d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setTrendPeriod(p)}
              className={cn(
                "px-2 py-0.5 text-[11px] font-medium rounded transition-colors",
                trendPeriod === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        {anomalyCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-warning font-medium">
            <AlertTriangleIcon className="w-3 h-3" />
            {anomalyCount}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {incomeSlice.length >= 2 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Доходи</span>
              <span className={cn("text-[10px]", incomeDelta >= 0 ? "text-success" : "text-destructive")}>
                {formatDelta(incomeDelta)}
              </span>
            </div>
            <Sparkline data={incomeSlice} width={120} height={28} color="success" />
          </div>
        )}
        {expenseSlice.length >= 2 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Витрати</span>
              <span className={cn("text-[10px]", expenseDelta <= 0 ? "text-success" : "text-destructive")}>
                {formatDelta(expenseDelta)}
              </span>
            </div>
            <Sparkline data={expenseSlice} width={120} height={28} color="destructive" />
          </div>
        )}
        {fopLimitData && fopLimitData.cumulative.length >= 2 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Ліміт ФОП</span>
              <span className={cn("text-[10px]", limitColor === "success" ? "text-success" : limitColor === "warning" ? "text-warning" : "text-destructive")}>
                {formatMln(fopLimitData.currentTotal)} / {formatMln(fopLimitData.yearlyLimit)} ({fopLimitData.percent}%)
              </span>
            </div>
            <Sparkline data={fopLimitData.cumulative} width={120} height={28} color={limitColor} />
          </div>
        )}
      </div>
    </SectionBlock>
  );
};
