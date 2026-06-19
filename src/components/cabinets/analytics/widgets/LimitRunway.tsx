import { useMemo } from "react";
import { AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { formatCurrencySymbol } from "@/lib/formatters";

interface Props {
  /** Поточне використання ліміту (грн). */
  currentUsage: number;
  /** Річний ліміт ФОП (грн). За замовч. — 1 336 000 (1 група 2026, або групи 3 8.34M). Передавати з config. */
  annualLimit: number;
  /** Середньоденний приріст за останній період (грн/день). */
  dailyBurnRate: number;
  /** Кінець податкового року (зазв. 31 груд). */
  yearEnd?: Date;
  color: string;
}

/**
 * Runway projection для ФОП-лімітів.
 * Показує: % використано, скільки днів до пробою (за поточним темпом), порівняння з лінійним графіком року.
 * Світовий стандарт SaaS/credit-line dashboards (Stripe, Brex, Ramp).
 */
export const LimitRunway = ({
  currentUsage,
  annualLimit,
  dailyBurnRate,
  yearEnd,
  color,
}: Props) => {
  const projection = useMemo(() => {
    const usagePct = annualLimit > 0 ? (currentUsage / annualLimit) * 100 : 0;
    const remaining = Math.max(0, annualLimit - currentUsage);

    const now = new Date();
    const endOfYear = yearEnd ?? new Date(now.getFullYear(), 11, 31);
    const daysToYearEnd = Math.max(1, Math.ceil((endOfYear.getTime() - now.getTime()) / 86400000));

    const daysToLimit = dailyBurnRate > 0 ? Math.floor(remaining / dailyBurnRate) : Infinity;
    const projectedAtYearEnd = currentUsage + dailyBurnRate * daysToYearEnd;
    const projectedPct = annualLimit > 0 ? (projectedAtYearEnd / annualLimit) * 100 : 0;

    // Linear-pace baseline: де мали б бути сьогодні, якщо рівномірно використовувати ліміт.
    const dayOfYear = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
    const linearPct = (dayOfYear / 365) * 100;
    const aheadOfPace = usagePct - linearPct;

    let status: "safe" | "watch" | "danger";
    if (projectedPct >= 100 || daysToLimit < 60) status = "danger";
    else if (projectedPct >= 85 || aheadOfPace > 10) status = "watch";
    else status = "safe";

    return {
      usagePct,
      remaining,
      daysToLimit,
      daysToYearEnd,
      projectedAtYearEnd,
      projectedPct,
      linearPct,
      aheadOfPace,
      status,
    };
  }, [currentUsage, annualLimit, dailyBurnRate, yearEnd]);

  const statusStyles = {
    safe: { ring: "border-emerald-500/40", chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "В межах темпу" },
    watch: { ring: "border-amber-500/40", chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Спостерігати" },
    danger: { ring: "border-rose-500/40", chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400", label: "Ризик пробою" },
  }[projection.status];

  const daysToLimitText =
    projection.daysToLimit === Infinity
      ? "немає темпу"
      : projection.daysToLimit > 365
        ? "> року"
        : `${projection.daysToLimit} дн.`;

  return (
    <div className={`rounded-xl border bg-card ${statusStyles.ring}`}>
      <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Прогноз ліміту до кінця року
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyles.chip}`}>
          {statusStyles.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Двошарова шкала: фактично + прогноз */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              Використано: <span className="text-foreground font-medium tabular-nums">{projection.usagePct.toFixed(1)}%</span>
            </span>
            <span className="text-muted-foreground tabular-nums">
              {formatCurrencySymbol(currentUsage)} / {formatCurrencySymbol(annualLimit)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden relative">
            {/* Прогноз (фон) */}
            <div
              className="absolute inset-y-0 left-0 opacity-30"
              style={{ width: `${Math.min(projection.projectedPct, 100)}%`, backgroundColor: color }}
            />
            {/* Фактично (передній план) */}
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${Math.min(projection.usagePct, 100)}%`, backgroundColor: color }}
            />
            {/* Лінійний темп (маркер) */}
            <div
              className="absolute inset-y-0 w-px bg-foreground/50"
              style={{ left: `${Math.min(projection.linearPct, 100)}%` }}
              title={`Рівномірний темп: ${projection.linearPct.toFixed(0)}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
            <span>Фактично</span>
            <span>Прогноз на 31.12: <span className="tabular-nums text-foreground/80">{projection.projectedPct.toFixed(0)}%</span></span>
          </div>
        </div>

        {/* 3 показники */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="rounded-lg bg-muted/40 p-2 sm:p-2.5 min-w-0">
            <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              <Calendar className="w-3 h-3 shrink-0" /> <span className="truncate">До пробою</span>
            </div>
            <div className="text-sm font-semibold tabular-nums truncate">{daysToLimitText}</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-2 sm:p-2.5 min-w-0">
            <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              <TrendingUp className="w-3 h-3 shrink-0" /> <span className="truncate">Темп/день</span>
            </div>
            <div className="text-sm font-semibold tabular-nums truncate">{formatCurrencySymbol(dailyBurnRate)}</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-2 sm:p-2.5 min-w-0">
            <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              <AlertTriangle className="w-3 h-3 shrink-0" /> <span className="truncate">vs темп</span>
            </div>
            <div
              className={`text-sm font-semibold tabular-nums truncate ${
                projection.aheadOfPace > 5
                  ? "text-rose-600 dark:text-rose-400"
                  : projection.aheadOfPace < -5
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground"
              }`}
            >
              {projection.aheadOfPace >= 0 ? "+" : ""}
              {projection.aheadOfPace.toFixed(1)} п.п.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
