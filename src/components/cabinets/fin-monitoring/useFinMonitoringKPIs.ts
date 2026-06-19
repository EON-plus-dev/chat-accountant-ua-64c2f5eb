/**
 * Fin-Monitoring KPI adapter
 * Returns KPI definitions for Financial Monitoring ledger (state metrics).
 */

import { useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Wallet, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { calcKPI, type FinMonitoringRecord } from "@/config/finMonitoringConfig";

export interface FinMonitoringKPIDef {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number";
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  description?: string;
}

interface UseFinMonitoringKPIsArgs {
  records: FinMonitoringRecord[];
  periodLabel: string;
}

export function useFinMonitoringKPIs({
  records,
  periodLabel,
}: UseFinMonitoringKPIsArgs): FinMonitoringKPIDef[] {
  return useMemo(() => {
    const kpi = calcKPI(records);

    return [
      {
        id: "income",
        title: `Доходи ${periodLabel}`,
        value: kpi.totalIncome,
        format: "currency",
        icon: ArrowDownLeft,
        variant: "success",
        description: `${records.filter((r) => r.direction === "income").length} операцій`,
      },
      {
        id: "expense",
        title: `Витрати ${periodLabel}`,
        value: kpi.totalExpense,
        format: "currency",
        icon: ArrowUpRight,
        variant: kpi.totalExpense > 0 ? "warning" : "default",
        description: `${records.filter((r) => r.direction === "expense").length} операцій`,
      },
      {
        id: "balance",
        title: `Сальдо ${periodLabel}`,
        value: kpi.netBalance,
        format: "currency",
        icon: Wallet,
        variant: kpi.netBalance >= 0 ? "success" : "danger",
        description: kpi.netBalance >= 0 ? "Профіцит" : "Дефіцит",
      },
      {
        id: "tax",
        title: `ПДФО + ВЗ ${periodLabel}`,
        value: kpi.totalTax,
        format: "currency",
        icon: Landmark,
        variant: kpi.totalTax > 0 ? "warning" : "default",
        description: `ПДФО ${Math.round(kpi.totalPdfo).toLocaleString("uk-UA")} · ВЗ ${Math.round(kpi.totalVz).toLocaleString("uk-UA")}`,
      },
    ];
  }, [records, periodLabel]);
}
