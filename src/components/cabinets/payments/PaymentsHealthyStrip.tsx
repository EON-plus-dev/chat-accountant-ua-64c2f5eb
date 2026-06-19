/**
 * PaymentsHealthyStrip
 * Acknowledgement-рядок коли AttentionInbox порожній — підтверджує, що все під контролем.
 * Показує найближчий майбутній out-платіж для контексту.
 */

import { CheckCircle2 } from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

interface PaymentsHealthyStripProps {
  payments: UnifiedPayment[];
  className?: string;
}

function getNextUpcomingOut(payments: UnifiedPayment[]): { days: number; label: string; amount: number } | null {
  const today = new Date();
  const upcoming = payments
    .filter(
      (p) =>
        p.direction === "out" &&
        ["scheduled", "created", "sent-to-bank", "not-created"].includes(p.status as string)
    )
    .map((p) => {
      try {
        return { p, days: differenceInCalendarDays(parseISO(p.date), today) };
      } catch {
        return null;
      }
    })
    .filter((x): x is { p: UnifiedPayment; days: number } => x !== null && x.days >= 0)
    .sort((a, b) => a.days - b.days);

  if (upcoming.length === 0) return null;
  const next = upcoming[0];
  return {
    days: next.days,
    label: next.p.entityName || next.p.description || "Платіж",
    amount: next.p.amount,
  };
}

export function PaymentsHealthyStrip({ payments, className }: PaymentsHealthyStripProps) {
  const next = getNextUpcomingOut(payments);

  let secondary: string;
  if (!next) {
    secondary = "Нових завдань немає.";
  } else if (next.days === 0) {
    secondary = `Найближче списання сьогодні: ${next.label} · ₴${next.amount.toLocaleString("uk-UA")}.`;
  } else if (next.days === 1) {
    secondary = `Найближче списання завтра: ${next.label} · ₴${next.amount.toLocaleString("uk-UA")}.`;
  } else {
    secondary = `Найближче списання через ${next.days} дн.: ${next.label} · ₴${next.amount.toLocaleString("uk-UA")}.`;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm",
        className
      )}
    >
      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <div className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-medium text-emerald-700 dark:text-emerald-300">Усе під контролем.</span>
        <span className="text-muted-foreground">{secondary}</span>
      </div>
    </div>
  );
}
