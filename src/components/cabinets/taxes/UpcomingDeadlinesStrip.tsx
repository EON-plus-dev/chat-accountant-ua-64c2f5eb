import { useMemo } from "react";
import { Calendar, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  effectiveTaxStatus,
  daysToDeadline,
  isOverduePayment,
} from "@/lib/taxStatus";
import type { TaxPayment } from "@/config/paymentsConfig";

interface Props {
  payments: TaxPayment[];
  onOpenPayment: (payment: TaxPayment) => void;
  /** Скільки найближчих відобразити (default 4) */
  limit?: number;
  /** Скільки днів вперед враховувати як «найближчі» (default 30) */
  withinDays?: number;
}

const fmt = (n: number) => `${Math.round(n).toLocaleString("uk-UA")} ₴`;

export function UpcomingDeadlinesStrip({
  payments,
  onOpenPayment,
  limit = 4,
  withinDays = 30,
}: Props) {
  const items = useMemo(() => {
    const today = new Date();
    return payments
      .filter((p) => {
        const eff = effectiveTaxStatus(p, today);
        if (eff === "paid" || eff === "cancelled") return false;
        // прострочене показуємо завжди (як «червоне»);
        if (isOverduePayment(p, today)) return true;
        const d = daysToDeadline(p, today);
        return d >= 0 && d <= withinDays;
      })
      .sort((a, b) => daysToDeadline(a, today) - daysToDeadline(b, today))
      .slice(0, limit);
  }, [payments, limit, withinDays]);

  if (items.length === 0) return null;

  return (
    <div className="rounded-md border border-border/70 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Найближчі дедлайни
        </div>
      </div>
      <ul className="divide-y divide-border/40">
        {items.map((p) => {
          const today = new Date();
          const d = daysToDeadline(p, today);
          const overdue = isOverduePayment(p, today);
          const dateLabel = format(parseISO(p.deadline), "dd MMM", { locale: uk });
          const relLabel = overdue
            ? `прострочено ${Math.abs(d)} дн.`
            : d === 0
              ? "сьогодні"
              : d === 1
                ? "завтра"
                : `через ${d} дн.`;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onOpenPayment(p)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
              >
                {overdue ? (
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                ) : (
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    <span className="font-medium">{p.taxTypeLabel}</span>
                    <span className="text-muted-foreground"> · {p.period}</span>
                  </div>
                  <div className={cn(
                    "text-xs",
                    overdue ? "text-rose-600 dark:text-rose-400 font-medium" : "text-muted-foreground"
                  )}>
                    {dateLabel} · {relLabel}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums shrink-0">
                  {fmt(p.amountToPay)}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
