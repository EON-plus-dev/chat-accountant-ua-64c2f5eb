/**
 * useCashFlowBridge — cash-flow bridge (waterfall) для розділу «Фінанси».
 *
 * Розкладає Δ балансу за вибраний період на 5 категорій:
 *   AR collections (надходження) | інші in | AP (контрагенти) | Зарплати | Податки → Closing.
 *
 * Використовує `useCabinetAllPayments` як ledger (single source of truth).
 */

import { useMemo } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Cabinet } from "@/types/cabinet";
import { useCabinetAllPayments } from "./useCabinetAllPayments";
import { inferCurrency, toUah } from "@/lib/paymentsCurrency";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

export type WaterfallCategoryId =
  | "opening"
  | "ar"
  | "other_in"
  | "ap"
  | "payroll"
  | "taxes"
  | "closing";

export interface WaterfallBar {
  id: WaterfallCategoryId;
  label: string;
  amount: number; // signed: + inflow, − outflow
  kind: "total" | "positive" | "negative";
}

export interface CashFlowBridge {
  bars: WaterfallBar[];
  periodDays: number;
  /** Сукупний net за період. */
  net: number;
}

const COMPLETED_OUT = new Set(["paid", "completed"]);
const COMPLETED_IN = new Set(["income", "completed"]);

function classify(p: UnifiedPayment): "ar" | "other_in" | "ap" | "payroll" | "taxes" | null {
  if (p.direction === "in") {
    return p.sourceType === "income-book" ? "ar" : "other_in";
  }
  // out
  if (p.paymentType === "tax" || p.paymentType === "tax-fop" || p.paymentType === "tax-salary") {
    return "taxes";
  }
  if (p.paymentType === "salary") return "payroll";
  return "ap";
}

export function useCashFlowBridge(cabinet: Cabinet, openingBalance: number, periodDays = 30): CashFlowBridge {
  const payments = useCabinetAllPayments(cabinet);

  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = { ar: 0, other_in: 0, ap: 0, payroll: 0, taxes: 0 };

    for (const p of payments) {
      let d: Date;
      try {
        d = parseISO(p.date);
      } catch {
        continue;
      }
      const ageDays = differenceInCalendarDays(today, d);
      if (ageDays < 0 || ageDays > periodDays) continue;

      const status = String(p.status);
      const completed =
        (p.direction === "out" && COMPLETED_OUT.has(status)) ||
        (p.direction === "in" && COMPLETED_IN.has(status));
      if (!completed) continue;

      const cat = classify(p);
      if (!cat) continue;
      const uah = toUah(p.amount, inferCurrency(p));
      buckets[cat] += uah;
    }

    const net =
      buckets.ar + buckets.other_in - buckets.ap - buckets.payroll - buckets.taxes;
    const closing = openingBalance + net;

    const bars: WaterfallBar[] = [
      { id: "opening", label: "Початок", amount: Math.round(openingBalance), kind: "total" },
      { id: "ar", label: "Оплати клієнтів", amount: Math.round(buckets.ar), kind: "positive" },
      { id: "other_in", label: "Інші надходж.", amount: Math.round(buckets.other_in), kind: "positive" },
      { id: "ap", label: "Контрагенти", amount: -Math.round(buckets.ap), kind: "negative" },
      { id: "payroll", label: "Зарплати", amount: -Math.round(buckets.payroll), kind: "negative" },
      { id: "taxes", label: "Податки", amount: -Math.round(buckets.taxes), kind: "negative" },
      { id: "closing", label: "Кінець", amount: Math.round(closing), kind: "total" },
    ];

    return { bars, periodDays, net: Math.round(net) };
  }, [payments, openingBalance, periodDays]);
}
