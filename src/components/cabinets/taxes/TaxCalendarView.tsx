/**
 * TaxCalendarView — поєднує річну смугу місяців (як у ReportTimelineCalendar.DotStrip)
 * та місячну сітку податкових платежів (як у PaymentsCalendarView).
 *
 * Прибирає необхідність переходу на сторінку Платежі — користувач залишається в розділі Податки.
 */
import { useMemo, useState } from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { uk } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { effectiveTaxStatus, type EffectiveTaxStatus } from "@/lib/taxStatus";
import type { TaxPayment } from "@/config/paymentsConfig";

interface TaxCalendarViewProps {
  payments: TaxPayment[];
  year: number;
  onOpenPayment: (p: TaxPayment) => void;
  onOpenTaxDetail?: (p: TaxPayment) => void;
  onOpenFullCalendar?: () => void;
}

const MONTHS_SHORT = [
  "Січ", "Лют", "Бер", "Кві", "Тра", "Чер",
  "Лип", "Сер", "Вер", "Жов", "Лис", "Гру",
];

const STATUS_PRIORITY: Record<EffectiveTaxStatus, number> = {
  overdue: 5,
  due: 4,
  open: 3,
  paid: 1,
  cancelled: 0,
};

const STATUS_DOT: Record<EffectiveTaxStatus, string> = {
  overdue: "bg-rose-500",
  due: "bg-amber-500",
  open: "bg-blue-500",
  paid: "bg-emerald-500",
  cancelled: "bg-slate-400",
};

const STATUS_LABEL: Record<EffectiveTaxStatus, string> = {
  overdue: "Прострочено",
  due: "До сплати",
  open: "Заплановано",
  paid: "Сплачено",
  cancelled: "Скасовано",
};

const fmtMoney = (n: number) =>
  `${Math.round(Math.abs(n)).toLocaleString("uk-UA")} ₴`;

interface MonthBucket {
  index: number;
  items: TaxPayment[];
  counts: Partial<Record<EffectiveTaxStatus, number>>;
  worst: EffectiveTaxStatus | null;
}

interface DayBucket {
  date: Date;
  iso: string;
  payments: TaxPayment[];
  totalDue: number;
}

export function TaxCalendarView({
  payments,
  year,
  onOpenPayment,
  onOpenTaxDetail,
  onOpenFullCalendar,
}: TaxCalendarViewProps) {
  const isMobile = useIsMobile();
  const today = new Date();
  const isCurrentYear = year === today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(
    isCurrentYear ? today.getMonth() : 0,
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  type FilterStatus = "overdue" | "due" | "open" | "paid";
  const ALL_FILTERS: FilterStatus[] = ["overdue", "due", "open", "paid"];
  const [activeStatuses, setActiveStatuses] = useState<FilterStatus[]>(ALL_FILTERS);

  const statusOf = (p: TaxPayment) => effectiveTaxStatus(p, today);

  const isStatusActive = (s: EffectiveTaxStatus) =>
    s === "cancelled" ? false : activeStatuses.includes(s as FilterStatus);

  // Apply status filter once
  const filteredPayments = useMemo(
    () => payments.filter((p) => isStatusActive(statusOf(p))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payments, activeStatuses],
  );

  // 12-month buckets
  const monthBuckets = useMemo<MonthBucket[]>(() => {
    const buckets: MonthBucket[] = Array.from({ length: 12 }, (_, i) => ({
      index: i,
      items: [],
      counts: {},
      worst: null,
    }));
    for (const p of filteredPayments) {
      let m: number;
      try {
        m = parseISO(p.deadline).getMonth();
      } catch {
        continue;
      }
      if (m < 0 || m > 11) continue;
      const b = buckets[m];
      b.items.push(p);
      const s = statusOf(p);
      b.counts[s] = (b.counts[s] || 0) + 1;
      if (!b.worst || STATUS_PRIORITY[s] > STATUS_PRIORITY[b.worst]) {
        b.worst = s;
      }
    }
    return buckets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPayments, year]);

  // Day buckets for selectedMonth
  const monthCursor = useMemo(
    () => new Date(year, selectedMonth, 1),
    [year, selectedMonth],
  );

  const bucketByIso = useMemo(() => {
    const map = new Map<string, DayBucket>();
    for (const p of monthBuckets[selectedMonth].items) {
      let d: Date;
      try {
        d = parseISO(p.deadline);
      } catch {
        continue;
      }
      const iso = format(d, "yyyy-MM-dd");
      const b = map.get(iso) ?? { date: d, iso, payments: [], totalDue: 0 };
      b.payments.push(p);
      const s = statusOf(p);
      if (s === "overdue" || s === "due" || s === "open") {
        b.totalDue += p.amountToPay;
      }
      map.set(iso, b);
    }
    for (const b of map.values()) {
      b.payments.sort(
        (a, c) => new Date(a.deadline).getTime() - new Date(c.deadline).getTime(),
      );
    }
    return map;
  }, [monthBuckets, selectedMonth]);

  const selectedBucket = selectedDay
    ? bucketByIso.get(format(selectedDay, "yyyy-MM-dd"))
    : null;

  const handleClickPayment = (p: TaxPayment) => {
    setSelectedDay(null);
    if (onOpenTaxDetail) onOpenTaxDetail(p);
    else onOpenPayment(p);
  };

  // ===== Year strip =====
  const yearStrip = (
    <div className="space-y-2">
      <div
        className={cn(
          "gap-1",
          isMobile ? "flex overflow-x-auto pb-1 -mx-1 px-1" : "grid grid-cols-12",
        )}
      >
        {monthBuckets.map((b) => {
          const isSelected = b.index === selectedMonth;
          const isCurrent = isCurrentYear && b.index === today.getMonth();
          const dotEntries = (Object.entries(b.counts) as [EffectiveTaxStatus, number][])
            .filter(([s]) => s !== "cancelled")
            .sort(([a], [c]) => STATUS_PRIORITY[c] - STATUS_PRIORITY[a]);
          return (
            <button
              key={b.index}
              type="button"
              onClick={() => setSelectedMonth(b.index)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-md border transition-colors text-center shrink-0",
                isMobile && "min-w-[56px]",
                isSelected
                  ? "bg-accent border-accent-foreground/20"
                  : "bg-card border-border hover:bg-accent/50",
                isCurrent && !isSelected && "ring-1 ring-primary",
              )}
            >
              <span
                className={cn(
                  "text-xs capitalize",
                  isSelected ? "font-semibold" : "font-medium text-muted-foreground",
                )}
              >
                {MONTHS_SHORT[b.index]}
              </span>
              <div className="h-2 flex items-center justify-center gap-0.5">
                {dotEntries.length === 0 ? (
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                ) : (
                  dotEntries.slice(0, 3).map(([s]) => (
                    <span key={s} className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[s])} />
                  ))
                )}
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {b.items.length || ""}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> прострочено
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> до сплати
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> заплановано
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> сплачено
        </span>
      </div>
    </div>
  );

  // ===== Month grid =====
  const monthLabel = (
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold capitalize tabular-nums">
        {format(monthCursor, "LLLL yyyy", { locale: uk })}
      </h4>
      <span className="text-xs text-muted-foreground">
        {monthBuckets[selectedMonth].items.length} нарахувань
      </span>
    </div>
  );

  let grid: JSX.Element;

  if (isMobile) {
    const days = Array.from(bucketByIso.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    grid = (
      <div className="space-y-3">
        {monthLabel}
        {days.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            На {format(monthCursor, "LLLL", { locale: uk })} нарахувань немає
          </div>
        ) : (
          days.map((b) => (
            <div key={b.iso} className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span
                  className={cn(
                    "text-xs font-medium capitalize",
                    isToday(b.date) ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {format(b.date, "EEEE, d MMM", { locale: uk })}
                </span>
                {b.totalDue > 0 && (
                  <span className="text-xs tabular-nums font-medium text-rose-600">
                    {fmtMoney(b.totalDue)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {b.payments.map((p) => (
                  <PaymentRow key={p.id} payment={p} onClick={() => handleClickPayment(p)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  } else {
    const gridStart = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 });
    const days: Date[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    const weekLabels = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"];

    grid = (
      <div className="space-y-2">
        {monthLabel}
        <div className="grid grid-cols-7 gap-px text-[10px] uppercase tracking-wide text-muted-foreground">
          {weekLabels.map((w) => (
            <div key={w} className="px-2 py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
          {days.map((d) => {
            const iso = format(d, "yyyy-MM-dd");
            const b = bucketByIso.get(iso);
            const inCurrentMonth = isSameMonth(d, monthCursor);
            const isTd = isToday(d);
            const dots = b ? b.payments.slice(0, 3) : [];
            const more = b && b.payments.length > 3 ? b.payments.length - 3 : 0;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => b && setSelectedDay(d)}
                disabled={!b}
                className={cn(
                  "min-h-[80px] bg-card text-left p-1.5 flex flex-col gap-1 transition-colors",
                  inCurrentMonth ? "" : "bg-muted/30 text-muted-foreground/60",
                  b ? "hover:bg-accent/50 cursor-pointer" : "cursor-default",
                  isTd && "ring-1 ring-inset ring-primary",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isTd && "font-semibold text-primary",
                      !isTd && inCurrentMonth && "font-medium",
                    )}
                  >
                    {d.getDate()}
                  </span>
                  {more > 0 && (
                    <span className="text-[9px] text-muted-foreground">+{more}</span>
                  )}
                </div>
                {dots.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    {dots.map((p) => (
                      <span
                        key={p.id}
                        className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[statusOf(p)])}
                        title={p.taxTypeLabel}
                      />
                    ))}
                  </div>
                )}
                {b && b.totalDue > 0 && (
                  <span className="text-[10px] tabular-nums mt-auto text-rose-600 dark:text-rose-400">
                    {fmtMoney(b.totalDue)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const FILTER_LABELS: Record<FilterStatus, string> = {
    overdue: "Прострочено",
    due: "До сплати",
    open: "Заплановано",
    paid: "Сплачено",
  };

  const totalCounts = useMemo(() => {
    const counts: Record<FilterStatus, number> = { overdue: 0, due: 0, open: 0, paid: 0 };
    for (const p of payments) {
      const s = statusOf(p);
      if (s === "cancelled") continue;
      counts[s as FilterStatus] += 1;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

  const toggleFilter = (s: FilterStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {ALL_FILTERS.map((s) => {
          const active = activeStatuses.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggleFilter(s)}
              className={cn(
                "inline-flex items-center gap-1.5 h-6 sm:h-7 px-2 sm:px-2.5 rounded-full border text-[11px] sm:text-xs transition-colors",
                active
                  ? "bg-accent border-accent-foreground/20"
                  : "bg-background border-border text-muted-foreground hover:bg-accent/40",
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[s])} />
              <span>{FILTER_LABELS[s]}</span>
              <span className="tabular-nums opacity-70">{totalCounts[s]}</span>
            </button>
          );
        })}
        {activeStatuses.length < ALL_FILTERS.length && (
          <button
            type="button"
            onClick={() => setActiveStatuses(ALL_FILTERS)}
            className="text-xs text-primary hover:underline px-1.5"
          >
            Скинути
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {yearStrip}
      {toolbar}
      {grid}

      {onOpenFullCalendar && (
        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="sm" onClick={onOpenFullCalendar} className="text-xs gap-1">
            Відкрити повний календар платежів
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      )}

      <Sheet open={!!selectedDay} onOpenChange={(o) => !o && setSelectedDay(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle className="text-base capitalize">
              {selectedDay && format(selectedDay, "EEEE, d MMMM yyyy", { locale: uk })}
            </SheetTitle>
            {selectedBucket && (
              <p className="text-xs text-muted-foreground">
                {selectedBucket.payments.length} нарахувань
                {selectedBucket.totalDue > 0 && (
                  <>
                    {" · "}
                    <span className="text-rose-600 tabular-nums">
                      {fmtMoney(selectedBucket.totalDue)} до сплати
                    </span>
                  </>
                )}
              </p>
            )}
          </SheetHeader>
          <ScrollArea className="flex-1 px-5 py-4">
            <div className="space-y-2">
              {selectedBucket?.payments.map((p) => (
                <PaymentRow key={p.id} payment={p} onClick={() => handleClickPayment(p)} />
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============== Sub-components ==============

interface PaymentRowProps {
  payment: TaxPayment;
  onClick: () => void;
}

function PaymentRow({ payment, onClick }: PaymentRowProps) {
  const status = effectiveTaxStatus(payment);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors text-left"
    >
      <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[status])} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {payment.taxTypeLabel}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {payment.period} · {STATUS_LABEL[status]}
        </div>
      </div>
      <div className="text-sm font-semibold tabular-nums shrink-0">
        {fmtMoney(payment.amountToPay)}
      </div>
    </button>
  );
}
