import { useMemo } from "react";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";
import {
  effectiveTaxStatus,
  daysToDeadline,
  paidAmountOf,
} from "@/lib/taxStatus";
import type { TaxPayment } from "@/config/paymentsConfig";

export interface TaxesKPIs {
  /** Σ нарахованих зобов'язань за рік (всі статуси, окрім cancelled) */
  accrued: number;
  /** Σ фактично сплаченого (включно з частковими оплатами) */
  paid: number;
  /** Σ до сплати (відкриті, ще не прострочені) */
  due: number;
  /** Σ простроченого тіла боргу (без санкцій) */
  overdue: number;
  /** Σ нарахованих санкцій (пеня + штраф) */
  sanctions: number;
  /** «Разом до сплати» = due + overdue + sanctions — головна цифра дашборду */
  totalDue: number;
  /** Кількість прострочених позицій */
  overdueCount: number;
  /** Кількість позицій до сплати */
  dueCount: number;
}

export function useTaxesKPIs(payments: TaxPayment[], today: Date = new Date()): TaxesKPIs {
  return useMemo(() => {
    let accrued = 0;
    let paid = 0;
    let due = 0;
    let overdue = 0;
    let sanctions = 0;
    let overdueCount = 0;
    let dueCount = 0;

    for (const p of payments) {
      const status = effectiveTaxStatus(p, today);
      if (status === "cancelled") continue;

      accrued += p.amountToPay;
      paid += paidAmountOf(p);

      if (status === "paid") continue;

      if (status === "overdue") {
        overdue += p.amountToPay - paidAmountOf(p);
        overdueCount += 1;
        const days = Math.abs(daysToDeadline(p, today));
        sanctions += calcTaxPenalty(p.amountToPay, days).total;
      } else if (status === "due") {
        due += p.amountToPay - paidAmountOf(p);
        dueCount += 1;
      }
    }

    return {
      accrued,
      paid,
      due,
      overdue,
      sanctions,
      totalDue: due + overdue + sanctions,
      overdueCount,
      dueCount,
    };
  }, [payments, today]);
}
