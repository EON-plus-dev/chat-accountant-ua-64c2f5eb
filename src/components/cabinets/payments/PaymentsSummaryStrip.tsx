/**
 * PaymentsSummaryStrip
 * Compact summary above payments table.
 *
 * Wave 5: dual-mode — `today` (об'єктивна щоденна картина за всіма платежами кабінету)
 *  vs `filtered` (метрики за поточною вибіркою фільтрів). Над метриками — рядок-хінт
 *  з контекстом і опціональним лінком «Скинути фільтри».
 */

import { AlertTriangle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface PaymentsSummaryStripData {
  // ---- filtered-mode core ----
  inflow: number;
  outflow: number;
  net: number;
  overdue: number;
  /** Очікується надходжень (виставлені рахунки, потребують уточнення). */
  expectedIn?: number;
  /** До оплати (підготовлені out-платежі, ще не виконані). */
  toPay?: number;
  /** Поточний баланс рахунків (UAH-еквівалент). */
  accountsBalance?: number;
  accountsCount?: number;
  /** Чи містить вибірка валютні платежі — тоді показуємо «≈». */
  hasForeignCurrency?: boolean;

  // ---- today-mode extras (об'єктивні, не залежать від фільтрів) ----
  /** Надходжень сьогодні (paid). */
  inflowToday?: number;
  /** Витрат сьогодні (paid). */
  outflowToday?: number;
  /** Заплановано до оплати на сьогодні. */
  plannedToday?: number;
  /** Очікуваних надходжень на сьогодні. */
  expectedToday?: number;
}

interface PaymentsSummaryStripProps {
  summary: PaymentsSummaryStripData;
  className?: string;
  /** "today" — щоденна картина, "filtered" — за вибіркою. Default: "filtered" (back-compat). */
  mode?: "today" | "filtered";
  /** Текст-контекст зверху, наприклад «За сьогодні · 23 квіт.» */
  contextLabel?: string;
  /** Опційно: дія для лінку праворуч. */
  onResetContext?: () => void;
  /** Текст лінку. Default: «Скинути фільтри». */
  resetActionLabel?: string;
}

const fmt = (v: number) => `₴${Math.abs(Math.round(v)).toLocaleString("uk-UA")}`;
const approxPrefix = (hasFx?: boolean) => (hasFx ? "≈" : "");

interface MetricItem {
  key: string;
  label: string;
  value: string;
  valueClass?: string;
  icon?: React.ReactNode;
  hint?: string;
  subLabel?: string;
}

export function PaymentsSummaryStrip({
  summary,
  className,
  mode = "filtered",
  contextLabel,
  onResetContext,
  resetActionLabel = "Скинути фільтри",
}: PaymentsSummaryStripProps) {
  const {
    inflow,
    outflow,
    net,
    overdue,
    expectedIn = 0,
    toPay = 0,
    accountsBalance,
    accountsCount,
    hasForeignCurrency,
    inflowToday = 0,
    outflowToday = 0,
    plannedToday = 0,
    expectedToday = 0,
  } = summary;

  const showBalance = typeof accountsBalance === "number";
  const ax = approxPrefix(hasForeignCurrency);

  const metrics: MetricItem[] = [];

  // Balance — завжди першою метрикою (актуальна на «зараз», не залежить від режиму).
  if (showBalance) {
    metrics.push({
      key: "balance",
      label: "На рахунках",
      value: fmt(accountsBalance!),
      valueClass: "font-semibold text-foreground",
      icon: <Wallet className="h-3 w-3" />,
      subLabel: accountsCount
        ? `${accountsCount} ${accountsCount === 1 ? "рахунок" : accountsCount < 5 ? "рахунки" : "рахунків"}`
        : undefined,
      hint: "Поточний UAH-еквівалент усіх ваших рахунків",
    });
  }

  if (mode === "today") {
    metrics.push(
      {
        key: "in-today",
        label: "Надходження сьогодні",
        value: `+${fmt(inflowToday)}`,
        valueClass: "text-emerald-600 dark:text-emerald-400",
        hint: "Зараховано на рахунки сьогодні",
      },
      {
        key: "out-today",
        label: "Витрати сьогодні",
        value: `−${fmt(outflowToday)}`,
        valueClass: "text-rose-600 dark:text-rose-400",
        hint: "Списано з рахунків сьогодні",
      },
      {
        key: "planned-today",
        label: "План на сьогодні",
        value: fmt(plannedToday),
        valueClass: "text-amber-600 dark:text-amber-400",
        hint: "Заплановані до оплати платежі з датою «сьогодні»",
      },
      {
        key: "expected-today",
        label: "Очікується сьогодні",
        value: fmt(expectedToday),
        valueClass: "text-emerald-600/80 dark:text-emerald-400/80",
        hint: "Виставлені рахунки з очікуваною датою «сьогодні»",
      },
    );
  } else {
    const netSign = net >= 0 ? "+" : "−";
    const netColor = net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
    metrics.push(
      { key: "in", label: "Надходження", value: `${ax}+${fmt(inflow)}`, valueClass: "text-emerald-600 dark:text-emerald-400" },
      { key: "out", label: "Витрати", value: `${ax}−${fmt(outflow)}`, valueClass: "text-rose-600 dark:text-rose-400" },
      { key: "net", label: "Чистий потік", value: `${ax}${netSign}${fmt(net)}`, valueClass: cn("font-semibold", netColor) },
    );
    if (expectedIn > 0) {
      metrics.push({
        key: "expected",
        label: "Очікується",
        value: fmt(expectedIn),
        valueClass: "text-emerald-600/80 dark:text-emerald-400/80",
        hint: "Виставлені рахунки, ще не зараховані",
      });
    }
    if (toPay > 0) {
      metrics.push({
        key: "topay",
        label: "До оплати",
        value: fmt(toPay),
        valueClass: "text-amber-600 dark:text-amber-400",
        hint: "Підготовлені платежі, ще не виконані",
      });
    }
  }

  const showContextRow = !!contextLabel || !!onResetContext;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("rounded-lg border border-border/60 bg-muted/30", className)}
    >
      {showContextRow && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border/40 text-[11px]">
          <span className="text-muted-foreground truncate">{contextLabel}</span>
          {onResetContext && (
            <button
              type="button"
              onClick={onResetContext}
              className="text-primary hover:underline whitespace-nowrap font-medium shrink-0"
            >
              {resetActionLabel}
            </button>
          )}
        </div>
      )}

      {/* Desktop ≥lg: horizontal strip with wrap + real dividers */}
      <div className="hidden lg:flex items-center justify-between gap-x-5 gap-y-2 flex-wrap px-4 py-2">
        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-sm min-w-0">
          {metrics.map((m, i) => (
            <div key={m.key} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden className="w-px h-3.5 bg-border/70" />}
              <MetricInline {...m} />
            </div>
          ))}
        </div>
        {overdue > 0 && (
          <OverduePill value={fmt(overdue)} />
        )}
      </div>

      {/* Tablet & Mobile: grid 2-col with last item col-span-2 if odd */}
      <div className="grid grid-cols-2 gap-px bg-border/60 lg:hidden rounded-lg overflow-hidden">
        {metrics.map((m, i) => (
          <Cell
            key={m.key}
            {...m}
            className={cn(
              i === metrics.length - 1 && metrics.length % 2 === 1 && "col-span-2"
            )}
          />
        ))}
        {overdue > 0 && (
          <Cell
            key="overdue"
            label="Прострочено"
            value={fmt(overdue)}
            valueClass="text-rose-700 dark:text-rose-300 font-semibold"
            icon={<AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" />}
            className={cn(
              metrics.length % 2 === 0 && "col-span-2"
            )}
          />
        )}
      </div>
    </div>
  );
}

function MetricInline({ label, value, valueClass, icon, subLabel, hint }: MetricItem) {
  const content = (
    <div className="inline-flex items-baseline gap-1.5 min-w-0">
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-medium whitespace-nowrap">
        {icon}
        {label}
      </span>
      <span className={cn("text-sm tabular-nums whitespace-nowrap", valueClass)}>{value}</span>
      {subLabel && <span className="text-[10px] text-muted-foreground whitespace-nowrap">· {subLabel}</span>}
    </div>
  );
  if (!hint) return content;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="bottom">{hint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function OverduePill({ value }: { value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2.5 py-1 text-xs font-semibold tabular-nums">
      <AlertTriangle className="h-3.5 w-3.5" />
      <span className="uppercase tracking-wide text-[10px] font-medium opacity-80">Прострочено</span>
      <span>{value}</span>
    </div>
  );
}

function Cell({
  label,
  value,
  valueClass,
  icon,
  subLabel,
  className,
}: MetricItem & { className?: string }) {
  return (
    <div className={cn("bg-muted/30 px-3 py-2.5 flex flex-col gap-0.5 min-w-0", className)}>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium inline-flex items-center gap-1 truncate">
        {icon}
        {label}
      </span>
      <span className={cn("text-sm tabular-nums truncate", valueClass)}>{value}</span>
      {subLabel && <span className="text-[10px] text-muted-foreground truncate">{subLabel}</span>}
    </div>
  );
}
