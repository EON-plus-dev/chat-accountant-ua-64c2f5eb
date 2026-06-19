import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Cabinet } from "@/types/cabinet";
import { fopIncomeLimits } from "@/config/incomeBookConfig";
import { cn } from "@/lib/utils";
import { useResponsiveContainer } from "@/hooks/useResponsiveContainer";

interface LimitStatusWidgetProps {
  cabinet: Cabinet;
  onNavigateToIncomeBook?: (intent?: "needs-clarification") => void;
}

const MONTHS_SHORT = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
const MONTHS_FULL_NOM = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
const MONTHS_GENITIVE = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];

// Realistic seasonal pattern for FOP (Q1 lower, Q2-Q4 ramps)
const SEASONAL_PATTERN = [0.07, 0.08, 0.09, 0.085, 0.09, 0.085, 0.08, 0.085, 0.09, 0.09, 0.085, 0.10];

function buildLimitSeries(yearlyIncome: number, limit: number, currentMonthIdx: number) {
  // Distribute current cumulative income across past months using first N pattern values (re-normalized)
  const pastWeights = SEASONAL_PATTERN.slice(0, currentMonthIdx + 1);
  const pastSum = pastWeights.reduce((a, b) => a + b, 0);
  const actual = pastWeights.map((w) => (w / pastSum) * yearlyIncome);

  // Forecast: project remaining months using full seasonal pattern, scaled to current run-rate
  const projectedYearly = pastSum > 0 ? yearlyIncome / pastSum : yearlyIncome;
  const forecast = SEASONAL_PATTERN.slice(currentMonthIdx + 1).map((w) => w * projectedYearly);

  const monthly = [...actual, ...forecast];
  const cumulative: number[] = [];
  monthly.reduce((acc, v) => {
    const next = acc + v;
    cumulative.push(next);
    return next;
  }, 0);

  const forecastTotal = cumulative[cumulative.length - 1];
  const forecastPct = Math.round((forecastTotal / limit) * 100);

  // Find month index where cumulative crosses limit + interpolated day within that month
  let exceedAt: number | null = null;
  let exceedDay: number | null = null;
  for (let i = 0; i < cumulative.length; i++) {
    if (cumulative[i] >= limit) {
      exceedAt = i;
      const prev = i > 0 ? cumulative[i - 1] : 0;
      const cur = cumulative[i];
      const frac = cur > prev ? (limit - prev) / (cur - prev) : 0;
      exceedDay = Math.max(1, Math.min(30, Math.round(frac * 30)));
      break;
    }
  }

  return { monthly, cumulative, forecastPct, willExceed: forecastTotal > limit, exceedAt, exceedDay };
}

interface MonthlyBarsProps {
  monthly: number[];
  limit: number;
  currentMonthIdx: number;
  toneBarClass: string;
  willExceed: boolean;
}

function LimitMonthlyBars({
  monthly,
  limit,
  currentMonthIdx,
  toneBarClass,
  willExceed,
}: MonthlyBarsProps) {
  const safeMonthly = limit / 12;
  const maxY = Math.max(...monthly, safeMonthly) * 1.15;
  const safeTopPct = (1 - safeMonthly / maxY) * 100;

  return (
    <div className="w-full">
      {/* Bars + safe-pace dashed line */}
      <div className="relative h-14 flex items-end gap-[3px]">
        <div
          className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/50 z-10 pointer-events-none"
          style={{ top: `${safeTopPct}%` }}
          aria-hidden
        />
        {monthly.map((v, i) => {
          const hPct = Math.max(2, (v / maxY) * 100);
          const isPast = i <= currentMonthIdx;
          const exceedsSafe = v > safeMonthly;
          return (
            <div
              key={i}
              className="flex-1 flex items-end h-full"
              title={`${MONTHS_FULL_NOM[i]}: ${(v / 1000).toFixed(0)} тис ₴${
                exceedsSafe ? " · вище безпечного темпу" : ""
              }${!isPast ? " (прогноз)" : ""}`}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-[height] duration-500",
                  isPast
                    ? cn(exceedsSafe ? "bg-destructive" : toneBarClass, "opacity-90")
                    : cn(
                        "border border-dashed bg-transparent",
                        willExceed || exceedsSafe
                          ? "border-destructive/60"
                          : "border-muted-foreground/40"
                      )
                )}
                style={{ height: `${hPct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Month labels — pure HTML, same flex/gap → ширина клітинки = ширина бара */}
      <div className="flex gap-[3px] mt-1.5">
        {MONTHS_SHORT.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 text-center text-[10px] leading-none",
              i === currentMonthIdx
                ? "text-foreground font-semibold"
                : "text-muted-foreground"
            )}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Micro-legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className={cn("inline-block w-2 h-2 rounded-sm", toneBarClass)} />
          факт
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm border border-dashed border-muted-foreground/60" />
          прогноз
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 border-t border-dashed border-muted-foreground/60" />
          безп. темп (≈ {(safeMonthly / 1000).toFixed(0)} тис ₴/міс)
        </span>
      </div>
    </div>
  );
}

export const LimitStatusWidget = ({ cabinet, onNavigateToIncomeBook }: LimitStatusWidgetProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { width } = useResponsiveContainer(ref);

  if (cabinet.type !== "fop" || !cabinet.fopGroup) return null;

  const fopGroup = cabinet.fopGroup;
  const limit = fopIncomeLimits[fopGroup] || fopIncomeLimits[3];
  const yearlyIncome = cabinet.yearlyIncome || 0;
  const remaining = Math.max(0, limit - yearlyIncome);
  const percentage = Math.min((yearlyIncome / limit) * 100, 100);

  // Use April 2026 baseline per project data convention
  const currentMonthIdx = 3; // April (0-based)
  const series = buildLimitSeries(yearlyIncome, limit, currentMonthIdx);

  let status: "safe" | "warning" | "critical" = "safe";
  if (percentage >= 90 || series.willExceed) status = "critical";
  else if (percentage >= 70 || series.forecastPct >= 90) status = "warning";

  const tone = {
    safe: { text: "text-success", bg: "bg-success/10", border: "border-success/30", bar: "bg-success" },
    warning: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30", bar: "bg-warning" },
    critical: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", bar: "bg-destructive" },
  }[status];

  const forecastTotal = series.cumulative[series.cumulative.length - 1] ?? yearlyIncome;

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} млн ₴`;
    return `${(value / 1000).toFixed(0)} тис ₴`;
  };

  // Container-driven sizing
  const ultraCompact = width > 0 && width < 240;
  const compact = width >= 240 && width < 560;
  // standard: width >= 560 OR width === 0 (SSR fallback)

  const donutSize = ultraCompact ? 40 : compact ? 44 : 52;
  const stroke = 6;
  const r = (donutSize - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percentage / 100) * c;

  const handleClick = () =>
    onNavigateToIncomeBook?.(status === "critical" ? "needs-clarification" : undefined);

  // Forecast hint
  const forecastHint = (() => {
    if (series.willExceed && series.exceedAt !== null) {
      const monthGen = MONTHS_GENITIVE[series.exceedAt];
      const monthShort = MONTHS_SHORT[series.exceedAt].toLowerCase();
      const day = series.exceedDay ?? 15;
      return {
        text: ultraCompact
          ? `≈ ${day} ${monthShort}.`
          : `Прогноз: ліміт буде перевищено ≈ ${day} ${monthGen}`,
        tone: "text-destructive",
      };
    }
    if (series.forecastPct >= 90) {
      return {
        text: ultraCompact
          ? `≈ ${series.forecastPct}% до Гру`
          : `Прогноз: ${series.forecastPct}% — близько до ліміту`,
        tone: "text-warning",
      };
    }
    return {
      text: ultraCompact
        ? `≈ ${series.forecastPct}% до Гру`
        : `Прогноз на рік: ${series.forecastPct}% ліміту`,
      tone: "text-muted-foreground",
    };
  })();

  const tooltip = `Використано ${percentage.toFixed(1)}% річного ліміту ${fopGroup} групи. ${formatCurrency(yearlyIncome)} з ${formatCurrency(limit)} станом на 30 ${MONTHS_GENITIVE[currentMonthIdx]} 2026.`;

  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-3 rounded-lg border", tone.bg, tone.border)}
    >
      {/* Header */}
      <div className={cn("flex gap-x-2 gap-y-0.5 min-w-0", compact ? "flex-col" : "flex-row items-center justify-between")}>
        <span className="text-xs text-muted-foreground font-medium truncate min-w-0">
          Ліміт доходу ФОП{!ultraCompact && ` · ${fopGroup} група`}
        </span>
        {!ultraCompact && (
          <span className={cn("text-[11px] text-muted-foreground shrink-0", compact && "leading-none")}>
            на 30.04.26
          </span>
        )}
      </div>

      {/* Main row */}
      <div className="flex items-center gap-3 min-w-0" title={tooltip}>
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: donutSize, height: donutSize }}>
          <svg width={donutSize} height={donutSize} className={cn("-rotate-90", tone.text)}>
            <circle
              cx={donutSize / 2}
              cy={donutSize / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              className="stroke-muted"
            />
            <circle
              cx={donutSize / 2}
              cy={donutSize / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-500"
            />
          </svg>
          {!ultraCompact && (
            <div className={cn("absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums", tone.text)}>
              {Math.round(percentage)}%
            </div>
          )}
        </div>

        {/* Text column */}
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm font-semibold tabular-nums leading-tight truncate", tone.text)}>
            {ultraCompact || compact
              ? `${percentage.toFixed(0)}%`
              : `Використано ${percentage.toFixed(1)}%`}
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums leading-tight mt-0.5 truncate">
            {formatCurrency(yearlyIncome)} / {formatCurrency(limit)}
          </div>
        </div>

        {/* Remaining */}
        <div className="flex flex-col items-end shrink-0 min-w-0">
          <span className="text-[10px] text-muted-foreground leading-tight">Залишок</span>
          <span className={cn("text-sm font-bold tabular-nums leading-tight whitespace-nowrap", tone.text)}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Місячні стовпці + лінія безпечного темпу */}
      <LimitMonthlyBars
        monthly={series.monthly}
        limit={limit}
        currentMonthIdx={currentMonthIdx}
        toneBarClass={tone.bar}
        willExceed={series.willExceed}
      />

      {/* Forecast hint + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-auto">
        <span className={cn("text-[11px] min-w-0 flex-1 basis-full sm:basis-auto", forecastHint.tone)}>
          {forecastHint.text}
        </span>
        {onNavigateToIncomeBook && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 shrink-0 ml-auto"
            onClick={handleClick}
          >
            <span>{ultraCompact ? "Книга" : "Книга доходів"}</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
