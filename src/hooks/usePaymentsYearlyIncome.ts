/**
 * Дохід року для ФОП — агрегує `demoIncomeRecords` за поточний рік.
 * Сума підраховується тільки для записів зі статусом 'income' (включається в ліміт).
 */

import { useMemo } from "react";
import { demoIncomeRecords } from "@/config/incomeBookConfig";
import type { Cabinet } from "@/types/cabinet";
import { getFopGroupLimit, getFopLimitTone, type FopLimitTone } from "@/config/fopGroupLimits";

export interface PaymentsYearlyIncome {
  enabled: boolean;
  amount: number;
  limit: number | null;
  percent: number;
  remaining: number;
  group?: 1 | 2 | 3;
  tone: FopLimitTone;
}

export function usePaymentsYearlyIncome(cabinet: Cabinet): PaymentsYearlyIncome {
  return useMemo(() => {
    const isFop = cabinet.type === "fop";
    const limit = getFopGroupLimit(cabinet.fopGroup);

    if (!isFop || !limit) {
      return {
        enabled: false,
        amount: 0,
        limit: null,
        percent: 0,
        remaining: 0,
        group: cabinet.fopGroup,
        tone: "ok",
      };
    }

    const currentYear = new Date().getFullYear();
    // Demo income records are tied to a specific demo cabinet (id "2");
    // for інших ФОП-кабінетів — fallback на cabinet.yearlyIncome або 0.
    const fromBook =
      cabinet.id === "2"
        ? demoIncomeRecords
            .filter((r) => r.status === "income" && r.date.startsWith(String(currentYear)))
            .reduce((s, r) => s + r.inIncomeBook, 0)
        : cabinet.yearlyIncome ?? 0;

    const amount = Math.max(0, fromBook);
    const percent = Math.min(100, (amount / limit) * 100);

    return {
      enabled: true,
      amount,
      limit,
      percent,
      remaining: Math.max(0, limit - amount),
      group: cabinet.fopGroup,
      tone: getFopLimitTone(percent),
    };
  }, [cabinet.id, cabinet.type, cabinet.fopGroup, cabinet.yearlyIncome]);
}
