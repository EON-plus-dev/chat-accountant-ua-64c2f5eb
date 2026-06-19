/**
 * PaymentsCalendarView — місячна сітка платежів (Wave 3).
 * Кожна клітинка показує до 3 dot-маркерів за типом + сумарний потік за день.
 * Клік по дню → side-drawer зі списком платежів.
 * Mobile: agenda-list по днях замість сітки.
 */

import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { uk } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { UnifiedPaymentCard } from "./UnifiedPaymentCard";
import type { UnifiedPayment, UnifiedPaymentType } from "@/config/unifiedPaymentsConfig";
import { inferCurrency, toUah } from "@/lib/paymentsCurrency";

interface PaymentsCalendarViewProps {
  payments: UnifiedPayment[];
  onPaymentClick: (payment: UnifiedPayment) => void;
}

// Колір dot-маркера за типом
function dotClass(type: UnifiedPaymentType): string {
  if (type === "tax" || type === "tax-fop" || type === "tax-salary") return "bg-rose-500";
  if (type === "salary") return "bg-amber-500";
  if (type === "income") return "bg-emerald-500";
  return "bg-slate-400";
}

interface DayBucket {
  date: Date;
  iso: string;
  payments: UnifiedPayment[];
  netUah: number;
}

export function PaymentsCalendarView({ payments, onPaymentClick }: PaymentsCalendarViewProps) {
  const isMobile = useIsMobile();
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Map: iso → bucket
  const bucketByIso = useMemo(() => {
    const map = new Map<string, DayBucket>();
    for (const p of payments) {
      let d: Date;
      try {
        d = parseISO(p.date);
      } catch {
        continue;
      }
      const iso = format(d, "yyyy-MM-dd");
      const b = map.get(iso) ?? { date: d, iso, payments: [], netUah: 0 };
      b.payments.push(p);
      const uah = toUah(p.amount, inferCurrency(p));
      b.netUah += p.direction === "in" ? uah : -uah;
      map.set(iso, b);
    }
    return map;
  }, [payments]);

  const selectedBucket = selectedDay ? bucketByIso.get(format(selectedDay, "yyyy-MM-dd")) : null;

  const goPrev = () => setCursor((c) => addMonths(c, -1));
  const goNext = () => setCursor((c) => addMonths(c, 1));
  const goToday = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    setCursor(d);
  };

  // Header
  const header = (
    <div className="flex items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={goPrev} aria-label="Попередній місяць">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
          Сьогодні
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={goNext} aria-label="Наступний місяць">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <h3 className="text-sm font-semibold capitalize tabular-nums">
        {format(cursor, "LLLL yyyy", { locale: uk })}
      </h3>
      <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> податок</span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> надх.</span>
        <span className="hidden md:inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> контр.</span>
      </div>
    </div>
  );

  // Mobile: agenda-list (тільки дні з платежами в поточному місяці)
  if (isMobile) {
    const monthDays = Array.from(bucketByIso.values())
      .filter((b) => isSameMonth(b.date, cursor))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
      <div className="flex flex-col">
        {header}
        {monthDays.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            На {format(cursor, "LLLL", { locale: uk })} платежів немає
          </div>
        ) : (
          <div className="space-y-3">
            {monthDays.map((b) => (
              <div key={b.iso} className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className={cn("text-xs font-medium", isToday(b.date) ? "text-primary" : "text-muted-foreground")}>
                    {format(b.date, "EEEE, d MMM", { locale: uk })}
                  </span>
                  <span className={cn("text-xs tabular-nums font-medium", b.netUah >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {b.netUah >= 0 ? "+" : "−"}₴{Math.round(Math.abs(b.netUah)).toLocaleString("uk-UA")}
                  </span>
                </div>
                {b.payments.map((p) => (
                  <UnifiedPaymentCard key={p.id} payment={p} onClick={() => onPaymentClick(p)} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop: 7×N grid
  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  const weekLabels = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"];

  return (
    <div className="flex flex-col">
      {header}
      <div className="grid grid-cols-7 gap-px mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {weekLabels.map((w) => (
          <div key={w} className="px-2 py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
        {days.map((d) => {
          const iso = format(d, "yyyy-MM-dd");
          const b = bucketByIso.get(iso);
          const inCurrentMonth = isSameMonth(d, cursor);
          const today = isToday(d);
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
                today && "ring-1 ring-inset ring-primary",
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs tabular-nums",
                  today && "font-semibold text-primary",
                  !today && inCurrentMonth && "font-medium",
                )}>
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
                      className={cn("w-1.5 h-1.5 rounded-full", dotClass(p.paymentType))}
                      title={p.entityName}
                    />
                  ))}
                </div>
              )}
              {b && (
                <span className={cn(
                  "text-[10px] tabular-nums mt-auto",
                  b.netUah >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                )}>
                  {b.netUah >= 0 ? "+" : "−"}₴{Math.round(Math.abs(b.netUah)).toLocaleString("uk-UA", { maximumFractionDigits: 0 })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day drawer */}
      <Sheet open={!!selectedDay} onOpenChange={(o) => !o && setSelectedDay(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle className="text-base">
              {selectedDay && format(selectedDay, "EEEE, d MMMM yyyy", { locale: uk })}
            </SheetTitle>
            {selectedBucket && (
              <p className="text-xs text-muted-foreground">
                {selectedBucket.payments.length} платежів ·{" "}
                <span className={selectedBucket.netUah >= 0 ? "text-emerald-600" : "text-rose-600"}>
                  {selectedBucket.netUah >= 0 ? "+" : "−"}₴{Math.round(Math.abs(selectedBucket.netUah)).toLocaleString("uk-UA")}
                </span>
              </p>
            )}
          </SheetHeader>
          <ScrollArea className="flex-1 px-5 py-4">
            <div className="space-y-2">
              {selectedBucket?.payments.map((p) => (
                <UnifiedPaymentCard
                  key={p.id}
                  payment={p}
                  onClick={() => {
                    onPaymentClick(p);
                    setSelectedDay(null);
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
