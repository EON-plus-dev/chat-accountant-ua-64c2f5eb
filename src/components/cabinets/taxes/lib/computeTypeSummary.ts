/**
 * Агрегат по типу податку — використовується і у боковому
 * `TaxDetailSheet`, і у повноекранному `TaxDetailPage`.
 */
import type { TaxPayment, TaxType } from "@/config/paymentsConfig";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";
import {
  effectiveTaxStatus,
  daysToDeadline,
  paidAmountOf,
} from "@/lib/taxStatus";

export interface TypeSummary {
  accrued: number;
  paid: number;
  remaining: number;
  overdueCount: number;
  sanctions: number;
  baseEp: number;
  nextDue: { payment: TaxPayment; days: number } | null;
  sortedPayments: TaxPayment[];
}

export function computeTypeSummary(
  items: TaxPayment[],
  taxType: TaxType,
): TypeSummary {
  const today = new Date();
  let accrued = 0;
  let paid = 0;
  let overdueCount = 0;
  let sanctions = 0;
  let baseEp = 0;
  let nextDue: { payment: TaxPayment; days: number } | null = null;

  for (const p of items) {
    const status = effectiveTaxStatus(p, today);
    if (status === "cancelled") continue;
    accrued += p.amountToPay;
    paid += paidAmountOf(p);
    if (taxType === "ep" && p.calculatedFromIncome) baseEp += p.calculatedFromIncome;
    if (status === "paid") continue;
    const days = daysToDeadline(p, today);
    if (status === "overdue") {
      overdueCount += 1;
      sanctions += calcTaxPenalty(p.amountToPay, Math.abs(days)).total;
    } else if (days >= 0) {
      if (!nextDue || days < nextDue.days) nextDue = { payment: p, days };
    }
  }

  const sortedPayments = [...items].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );

  return {
    accrued,
    paid,
    remaining: Math.max(0, accrued - paid),
    overdueCount,
    sanctions,
    baseEp,
    nextDue,
    sortedPayments,
  };
}
