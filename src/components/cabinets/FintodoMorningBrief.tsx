/**
 * FintodoMorningBrief — KPI-стрічка «морнінг бриф» для кабінету власника
 * системи (id=5). Завжди показує ключові метрики SaaS-бізнесу:
 * MRR, ARR, активні підписки, New/Churn (30д), приведені партнерами,
 * комісії до виплати, AI-маржа, Support SLA.
 *
 * Дані — агреговано з демо-наборів (`fintodoCrmData`, `fintodoPartnersData`).
 * Жодних звернень до БД — це візуалізація для власника системи.
 */

import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import {
  TrendingUp, Users, ArrowDownRight, ArrowUpRight, Link2, Banknote, Sparkles, LifeBuoy,
} from "lucide-react";
import { FINTODO_PARTNERS_TOTALS, formatUAH } from "@/config/demoCabinets/fintodoPartnersData";

const fmtCompactUah = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M ₴`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ₴`;
  return `${n} ₴`;
};

// Узгоджено з CRM-даними (MRR ≈ 2.4M, partners ≈ 1.4M attributed)
const MRR_TOTAL = 2_412_000;
const ARR_TOTAL = MRR_TOTAL * 12;
const ACTIVE_SUBS = 1_842;
const NEW_30D = 124;
const CHURN_30D = 38;
const AI_MARGIN = 0.27; // 27% vs target 20%
const SUPPORT_SLA = 0.94; // 94% у межах SLA

export function FintodoMorningBrief() {
  const items: KPIStripItem[] = [
    {
      id: "mrr",
      title: "MRR",
      value: fmtCompactUah(MRR_TOTAL),
      icon: TrendingUp,
      variant: "success",
      hint: "+8.4% м/м",
    },
    {
      id: "arr",
      title: "ARR (прогноз)",
      value: fmtCompactUah(ARR_TOTAL),
      icon: TrendingUp,
      hint: "на основі MRR",
    },
    {
      id: "subs",
      title: "Активних підписок",
      value: ACTIVE_SUBS.toLocaleString("uk-UA"),
      icon: Users,
      hint: "Start/Smart/Premium",
    },
    {
      id: "net",
      title: "New / Churn (30д)",
      value: `+${NEW_30D} / −${CHURN_30D}`,
      icon: NEW_30D >= CHURN_30D ? ArrowUpRight : ArrowDownRight,
      variant: NEW_30D >= CHURN_30D ? "success" : "danger",
      hint: `net +${NEW_30D - CHURN_30D}`,
    },
    {
      id: "partner-mrr",
      title: "Партнери → MRR",
      value: fmtCompactUah(FINTODO_PARTNERS_TOTALS.totalMrrAttributed),
      icon: Link2,
      hint: `${FINTODO_PARTNERS_TOTALS.totalActiveClients} клієнтів`,
    },
    {
      id: "payout",
      title: "Комісії до виплати",
      value: formatUAH(FINTODO_PARTNERS_TOTALS.totalPayoutPending),
      icon: Banknote,
      variant: "warning",
      hint: "6 заявок",
    },
    {
      id: "ai-margin",
      title: "AI-маржа",
      value: `${(AI_MARGIN * 100).toFixed(0)}%`,
      icon: Sparkles,
      variant: AI_MARGIN >= 0.20 ? "success" : "warning",
      hint: "ціль ≥ 20%",
    },
    {
      id: "sla",
      title: "Support SLA",
      value: `${(SUPPORT_SLA * 100).toFixed(0)}%`,
      icon: LifeBuoy,
      variant: SUPPORT_SLA >= 0.90 ? "success" : "warning",
      hint: "FRT < 4 год",
    },
  ];

  return (
    <div className="px-4 md:px-6">
      <div className="max-w-6xl mx-auto w-full">
        <KPIStrip items={items} ariaLabel="Морнінг бриф Fintodo" />
      </div>
    </div>
  );
}
