/**
 * Payments KPI adapter
 * Returns KPI definitions for Payments section (state metrics, NOT alerts).
 * Alert/action signals belong to PaymentsAttentionInbox.
 */

import { useMemo } from "react";
import { Wallet, CheckCircle2, Receipt, Users, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getPaymentsStats,
  type TaxPayment,
  type SalaryPayment,
  type ContractorPayment,
} from "@/config/paymentsConfig";
import type { Cabinet } from "@/types/cabinet";
import { usePaymentsYearlyIncome } from "@/hooks/usePaymentsYearlyIncome";

export interface PaymentsKPIDef {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number";
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  description?: string;
  /** Опціональна ціль/ліміт (для прогрес-бару у UniversalKPICard). */
  target?: { value: number; label?: string };
  showProgressBar?: boolean;
}

interface UsePaymentsKPIsArgs {
  taxPayments: TaxPayment[];
  salaryPayments: SalaryPayment[];
  contractorPayments?: ContractorPayment[];
  /** Опціонально — для FOP yearly limit KPI. */
  cabinet?: Cabinet;
}

export function usePaymentsKPIs({
  taxPayments,
  salaryPayments,
  contractorPayments = [],
  cabinet,
}: UsePaymentsKPIsArgs): PaymentsKPIDef[] {
  // Hook завжди викликаємо (умовний cabinet просто дає disabled=false)
  const yearly = usePaymentsYearlyIncome(
    cabinet ?? ({ id: "__none__", type: "individual" } as Cabinet),
  );

  return useMemo(() => {
    const stats = getPaymentsStats(taxPayments, salaryPayments);

    // Контрагенти — заплановані виплати поточного місяця
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const thisMonthContractor = contractorPayments.filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const contractorPending = thisMonthContractor
      .filter((p) => p.status === "scheduled" || p.status === "created")
      .reduce((s, p) => s + p.amount, 0);
    const contractorPaid = thisMonthContractor
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);

    const defs: PaymentsKPIDef[] = [];

    // 0. Дохід року vs ліміт групи ФОП — топ-метрика для ФОП
    if (yearly.enabled && yearly.limit) {
      const variant: PaymentsKPIDef["variant"] =
        yearly.tone === "danger" ? "danger" : yearly.tone === "warn" ? "warning" : "success";
      defs.push({
        id: "fop-yearly-limit",
        title: "Дохід року",
        value: yearly.amount,
        format: "currency",
        icon: Target,
        variant,
        description: `${yearly.percent.toFixed(0)}% ліміту · ФОП ${yearly.group} група · залишок ₴${yearly.remaining.toLocaleString("uk-UA")}`,
        target: { value: yearly.limit, label: "Ліміт" },
        showProgressBar: true,
      });
    }

    defs.push(
      {
        id: "to-pay",
        title: "До сплати цього місяця",
        value: stats.totalToPay,
        format: "currency",
        icon: Wallet,
        variant: stats.totalToPay > 0 ? "default" : "success",
        description: "Податки + зарплати",
      },
      {
        id: "paid",
        title: "Оплачено цього місяця",
        value: stats.totalPaid,
        format: "currency",
        icon: CheckCircle2,
        variant: "success",
        description: stats.totalPaid > 0 ? "Завершено платежі" : "Немає оплат",
      },
      {
        id: "salary-taxes",
        title: "Податки із ЗП (ПДФО+ВЗ+ЄСВ)",
        value: stats.salaryTaxesTotal,
        format: "currency",
        icon: Receipt,
        variant: "default",
        description: `ПДФО ${Math.round(stats.pdfoTotal / 1000)}K · ВЗ ${Math.round(stats.militaryTotal / 1000)}K · ЄСВ ${Math.round(stats.esvTotal / 1000)}K`,
      },
    );

    if (contractorPayments.length > 0) {
      defs.push({
        id: "contractors",
        title: "Контрагенти цього місяця",
        value: contractorPending + contractorPaid,
        format: "currency",
        icon: Users,
        variant: "default",
        description: `Сплачено ${Math.round(contractorPaid / 1000)}K · Очікує ${Math.round(contractorPending / 1000)}K`,
      });
    }

    return defs;
  }, [taxPayments, salaryPayments, contractorPayments, yearly]);
}
