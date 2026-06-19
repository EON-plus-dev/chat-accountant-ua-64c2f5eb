/**
 * useReconciliationStatus — статус банк-реконсиляції кабінету.
 *
 * Замість фейкового `totalUah % 4` рахує реальні незіставлені операції з ledger'у:
 * платіж вважається «незіставленим», якщо в нього статус `needs-clarification`
 * або (для income-book) `inIncomeBook === 0`.
 */

import { useMemo } from "react";
import { parseISO, differenceInCalendarDays } from "date-fns";
import type { Cabinet } from "@/types/cabinet";
import { useCabinetAllPayments } from "./useCabinetAllPayments";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

export interface ReconciliationStatus {
  /** Кількість незіставлених транзакцій за останні 30 днів. */
  unmatchedCount: number;
  /** Сума ₴ незіставлених. */
  unmatchedAmount: number;
  /** % зіставлених від загальної кількості за 30 днів (0–100). */
  matchedPercent: number;
  /** Загалом транзакцій за 30 днів. */
  totalCount: number;
}

function isUnmatched(p: UnifiedPayment): boolean {
  if (p.status === "needs-clarification") return true;
  if (p.sourceType === "income-book") {
    const src = p.sourceData as { inIncomeBook?: number };
    return (src.inIncomeBook ?? 0) === 0 && p.direction === "in";
  }
  return false;
}

export function useReconciliationStatus(cabinet: Cabinet): ReconciliationStatus {
  const payments = useCabinetAllPayments(cabinet);

  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let unmatchedCount = 0;
    let unmatchedAmount = 0;
    let totalCount = 0;

    for (const p of payments) {
      let d: Date;
      try {
        d = parseISO(p.date);
      } catch {
        continue;
      }
      const ageDays = differenceInCalendarDays(today, d);
      if (ageDays < 0 || ageDays > 30) continue;
      totalCount += 1;
      if (isUnmatched(p)) {
        unmatchedCount += 1;
        unmatchedAmount += p.amount;
      }
    }

    const matchedPercent =
      totalCount === 0 ? 100 : Math.round(((totalCount - unmatchedCount) / totalCount) * 100);

    return {
      unmatchedCount,
      unmatchedAmount: Math.round(unmatchedAmount),
      matchedPercent,
      totalCount,
    };
  }, [payments]);
}
