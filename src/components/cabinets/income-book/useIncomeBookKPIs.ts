/**
 * Income Book KPI adapter
 * Returns KPI definitions for Income Book (state metrics, NOT alerts).
 */

import { useMemo } from "react";
import { TrendingUp, Wallet, Crown, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type IncomeBookRecord } from "@/config/incomeBookConfig";
import { FOP_INCOME_LIMITS } from "@/lib/businessRules";
import type { Cabinet } from "@/types/cabinet";

export interface IncomeBookKPIDef {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number";
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  description?: string;
  target?: { value: number; label: string };
}

interface UseIncomeBookKPIsArgs {
  cabinet: Cabinet;
  records: IncomeBookRecord[];
  selectedYear: number;
}

export function useIncomeBookKPIs({
  cabinet,
  records,
  selectedYear,
}: UseIncomeBookKPIsArgs): IncomeBookKPIDef[] {
  return useMemo(() => {
    const yearRecords = records.filter((r) => r.date.startsWith(String(selectedYear)));
    const incomeRecords = yearRecords.filter((r) => r.status === "income");

    const yearIncome = incomeRecords.reduce((s, r) => s + r.amount, 0);

    // Поточний місяць
    const now = new Date();
    const monthStr = `${selectedYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const monthRecords = incomeRecords.filter((r) => r.date.startsWith(monthStr));
    const monthIncome = monthRecords.reduce((s, r) => s + r.amount, 0);

    // Середнє на місяць
    const monthsPassed = selectedYear === now.getFullYear() ? now.getMonth() + 1 : 12;
    const avgPerMonth = monthsPassed > 0 ? Math.round(yearIncome / monthsPassed) : 0;

    // FOP ліміт (для ФОП кабінетів)
    const fopGroup = (cabinet.fopGroup || 3) as 1 | 2 | 3;
    const limit = FOP_INCOME_LIMITS[fopGroup];
    const usedPercent = (yearIncome / limit) * 100;

    let limitVariant: "success" | "warning" | "danger" = "success";
    if (usedPercent >= 90) limitVariant = "danger";
    else if (usedPercent >= 75) limitVariant = "warning";

    // Топ-контрагент за сумою доходу — замість безглуздого лічильника операцій.
    // Дає миттєву відповідь: «хто головне джерело виручки і наскільки я від нього залежу».
    const contractorTotals = new Map<string, { sum: number; count: number }>();
    incomeRecords.forEach((r) => {
      const key = (r.contractor || "").trim() || "Без контрагента";
      const cur = contractorTotals.get(key) ?? { sum: 0, count: 0 };
      cur.sum += r.amount;
      cur.count += 1;
      contractorTotals.set(key, cur);
    });
    const topEntry = [...contractorTotals.entries()].sort((a, b) => b[1].sum - a[1].sum)[0];
    const topName = topEntry?.[0] ?? "—";
    const topSum = topEntry?.[1].sum ?? 0;
    const topCount = topEntry?.[1].count ?? 0;
    const topShare = yearIncome > 0 ? Math.round((topSum / yearIncome) * 100) : 0;
    // Концентрація >40% від одного контрагента — це бізнес-ризик, підсвічуємо warning.
    const topVariant: "default" | "warning" = topShare >= 40 ? "warning" : "default";
    const topDescription =
      topEntry
        ? `${topName} · ${topShare}% доходу · ${topCount} ${topCount === 1 ? "операція" : topCount < 5 ? "операції" : "операцій"}`
        : "Поки немає доходів";

    const defs: IncomeBookKPIDef[] = [
      {
        id: "year-income",
        title: `Дохід ${selectedYear}`,
        value: yearIncome,
        format: "currency",
        icon: TrendingUp,
        variant: "default",
        description: `${incomeRecords.length} операцій включено до доходу`,
        target: { value: limit, label: `від ліміту ФОП ${fopGroup}` },
      },
      {
        id: "month-income",
        title: "Цього місяця",
        value: monthIncome,
        format: "currency",
        icon: Calendar,
        variant: "default",
        description: `${monthRecords.length} операцій`,
      },
      {
        id: "avg-month",
        title: "Середньомісячний дохід",
        value: avgPerMonth,
        format: "currency",
        icon: Wallet,
        variant: limitVariant,
        description: `За ${monthsPassed} ${monthsPassed === 1 ? "місяць" : monthsPassed < 5 ? "місяці" : "місяців"}`,
      },
      {
        id: "top-contractor",
        title: "Топ-контрагент",
        value: topSum,
        format: "currency",
        icon: Crown,
        variant: topVariant,
        description: topDescription,
      },
    ];

    return defs;
  }, [cabinet, records, selectedYear]);
}
