/**
 * Investments KPI adapter
 * Returns KPI definitions for Investment Portfolio (state metrics, NOT alerts).
 */

import { useMemo } from "react";
import { TrendingUp, DollarSign, Briefcase, Calculator, Landmark, Award, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  calculatePortfolioSummary,
  type InvestmentPosition,
} from "@/config/demoCabinets/investmentData";

export interface InvestmentsKPIDef {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number";
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  description?: string;
}

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function useInvestmentsKPIs(positions: InvestmentPosition[]): InvestmentsKPIDef[] {
  return useMemo(() => {
    const summary = calculatePortfolioSummary(positions);

    const defs: InvestmentsKPIDef[] = [
      {
        id: "realized-pl",
        title: "Реалізований P&L",
        value: summary.netRealizedUah,
        format: "currency",
        icon: TrendingUp,
        variant: summary.netRealizedUah >= 0 ? "success" : "danger",
        description: summary.totalLossUah > 0
          ? `Збитків: ${fmt(summary.totalLossUah)} ₴`
          : "Без збитків",
      },
      {
        id: "dividends",
        title: "Дивіденди (gross)",
        value: summary.totalDividendsGrossUah,
        format: "currency",
        icon: DollarSign,
        variant: "default",
        description: `WHT залік: ${fmt(summary.totalWhtCreditUah)} ₴`,
      },
      {
        id: "open-positions",
        title: "Відкриті позиції",
        value: summary.openPositionsCostUah,
        format: "currency",
        icon: Briefcase,
        variant: "default",
        description: "Вартість придбання",
      },
      {
        id: "tax-due",
        title: "Податки до сплати",
        value: summary.totalTaxDue,
        format: "currency",
        icon: Calculator,
        variant: summary.totalTaxDue > 0 ? "warning" : "success",
        description: `ПДФО ${fmt(summary.totalPitInvestments + summary.totalPitDividends + summary.totalPitOther)} · ВЗ ${fmt(summary.totalMilInvestments + summary.totalMilDividends + summary.totalMilOther)}`,
      },
    ];

    if (summary.totalCouponIncomeUah > 0) {
      defs.push({
        id: "coupon",
        title: "Купонний дохід",
        value: summary.totalCouponIncomeUah,
        format: "currency",
        icon: Landmark,
        variant: "default",
        description: "Облігації / ОВДП",
      });
    }
    if (summary.totalEsopBenefitUah > 0) {
      defs.push({
        id: "esop",
        title: "ESOP / RSU бенефіт",
        value: summary.totalEsopBenefitUah,
        format: "currency",
        icon: Award,
        variant: "success",
        description: "(FMV − Strike) × Qty",
      });
    }
    if (summary.totalYieldIncomeUah > 0) {
      defs.push({
        id: "yield",
        title: "DeFi / P2P Yield",
        value: summary.totalYieldIncomeUah,
        format: "currency",
        icon: Zap,
        variant: "default",
        description: "Стейкінг, відсотки",
      });
    }

    return defs;
  }, [positions]);
}
