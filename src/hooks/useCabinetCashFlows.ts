/**
 * useCabinetCashFlows — реальні inflow/outflow + pending з ledger'у кабінету.
 *
 * Замінює фантомні `inflow7d/outflow7d`, які раніше рахувались у `usePaymentsAccountsBalance`
 * як `balance × 0.4-0.8`. Тепер числа звіряються з тими ж операціями, що показують Платежі.
 *
 * Pending = scheduled-out (надіслані в банк, ще не списані) + needs-clarification-in
 * (надходження в очікуванні підтвердження).
 */

import { useMemo } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Cabinet } from "@/types/cabinet";
import { useCabinetAllPayments } from "./useCabinetAllPayments";
import { inferCurrency, toUah } from "@/lib/paymentsCurrency";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

const PENDING_OUT = new Set<string>(["scheduled", "created", "sent-to-bank"]);
const PENDING_IN = new Set<string>(["needs-clarification", "scheduled"]);
const COMPLETED_OUT = new Set<string>(["paid", "completed"]);
const COMPLETED_IN = new Set<string>(["income", "completed"]);

function uahOf(p: UnifiedPayment): number {
  return toUah(p.amount, inferCurrency(p));
}

function isOverdue(p: UnifiedPayment, today: Date): boolean {
  try {
    return p.status === "overdue" || parseISO(p.date) < today;
  } catch {
    return false;
  }
}

export interface CabinetCashFlows {
  /** Підтверджені рухи за останні 7 днів. */
  inflow7d: number;
  outflow7d: number;
  /** Підтверджені рухи за останні 30 днів. */
  inflow30d: number;
  outflow30d: number;
  /** Δ (in − out) за 7 / 30 днів. */
  delta7d: number;
  delta30d: number;
  /** Pending — надіслано в банк / очікує підтвердження (зменшує available). */
  pendingOut: number;
  pendingIn: number;
  /** Денний avg burn по 90 днях (для runway). */
  dailyBurn90d: number;
  /** Кількість операцій за 7 днів. */
  txCount7d: number;
}

export function useCabinetCashFlows(cabinet: Cabinet): CabinetCashFlows {
  const payments = useCabinetAllPayments(cabinet);

  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let inflow7d = 0;
    let outflow7d = 0;
    let inflow30d = 0;
    let outflow30d = 0;
    let pendingOut = 0;
    let pendingIn = 0;
    let outflow90d = 0;
    let txCount7d = 0;

    for (const p of payments) {
      let d: Date;
      try {
        d = parseISO(p.date);
      } catch {
        continue;
      }
      const ageDays = differenceInCalendarDays(today, d);
      const uah = uahOf(p);
      const status = String(p.status);

      // Pending — у будь-якому часовому горизонті, поки не виконано
      if (p.direction === "out" && PENDING_OUT.has(status) && !isOverdue(p, today)) {
        pendingOut += uah;
      } else if (p.direction === "in" && PENDING_IN.has(status) && ageDays <= 0) {
        pendingIn += uah;
      }

      // Завершені — за історичні вікна
      const completed =
        (p.direction === "out" && COMPLETED_OUT.has(status)) ||
        (p.direction === "in" && COMPLETED_IN.has(status));

      if (!completed || ageDays < 0) continue;

      if (ageDays <= 7) {
        if (p.direction === "in") inflow7d += uah;
        else outflow7d += uah;
        txCount7d += 1;
      }
      if (ageDays <= 30) {
        if (p.direction === "in") inflow30d += uah;
        else outflow30d += uah;
      }
      if (ageDays <= 90 && p.direction === "out") {
        outflow90d += uah;
      }
    }

    return {
      inflow7d: Math.round(inflow7d),
      outflow7d: Math.round(outflow7d),
      inflow30d: Math.round(inflow30d),
      outflow30d: Math.round(outflow30d),
      delta7d: Math.round(inflow7d - outflow7d),
      delta30d: Math.round(inflow30d - outflow30d),
      pendingOut: Math.round(pendingOut),
      pendingIn: Math.round(pendingIn),
      dailyBurn90d: Math.round(outflow90d / 90),
      txCount7d,
    };
  }, [payments]);
}
