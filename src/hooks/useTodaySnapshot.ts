/**
 * useTodaySnapshot — єдина точка входу даних для режиму «Сьогодні»
 * Повертає TodaySnapshotDTO + допоміжні дані для UI
 */

import { useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  AlertTriangle,
  FileText,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type {
  TodaySnapshotDTO,
  ActivityEvent,
  ActivityCategory,
  ActivityChipId,
  RiskSeverity,
  RiskCategory,
  AnalyticsRisk,
  HealthScoreResult,
} from "@/types/analyticsTypes";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsDataSet } from "@/lib/analytics/dataLayer";
import { aggregateAnalyticsData } from "@/lib/analytics/dataLayer";
import { computeAnalytics } from "@/lib/analytics/computeEngine";
import { getAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import { evaluateRisks } from "@/lib/analytics/riskEngine";
import { computeHealthScore } from "@/lib/analytics/healthScoreEngine";
import { FOP_INCOME_LIMITS } from "@/config/taxConstantsConfig";

type TovViewMode = "director" | "accountant";

export interface TodaySnapshotResult extends TodaySnapshotDTO {
  config: CabinetAnalyticsConfig;
  healthScore: HealthScoreResult;
  sparkData: {
    income: number[];
    expense: number[];
    fopLimit?: { currentTotal: number; yearlyLimit: number; percent: number; cumulative: number[] };
  };
}

// ── Activity event generation (moved from RecentActivitySection) ──

function categoryToChip(cat: ActivityCategory): ActivityChipId {
  switch (cat) {
    case "transaction_income":
    case "transaction_expense":
      return "transactions";
    case "integration_sync":
      return "integrations";
    case "limit_status_change":
      return "limits";
    case "compliance_event":
      return "compliance";
    case "system_event":
      return "transactions";
  }
}

function generateActivityEvents(
  config: CabinetAnalyticsConfig,
  maxItems = 20
): ActivityEvent[] {
  const result: ActivityEvent[] = [];
  const now = new Date();

  // Helper: generate realistic past timestamps (spread over last 7 days)
  const pastDate = (daysAgo: number, hoursOffset = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(9 + hoursOffset, Math.floor(Math.random() * 59), 0, 0);
    return d.toISOString();
  };

  // Derive from chart data (latest months as "income/expense" events)
  if (config.chartData.length > 0) {
    const latest = config.chartData.slice(-3);
    latest.forEach((d: any, i: number) => {
      const daysAgo = (latest.length - 1 - i) * 2 + 1; // spread: 5, 3, 1 days ago
      if (d.income) {
        result.push({
          id: `act_inc_${i}`,
          icon: ArrowUpRight,
          title: `Дохід за ${d.month}`,
          subtitle: "Bank • Надходження",
          amount: { value: d.income, currency: "UAH" },
          timestamp: pastDate(daysAgo, 2),
          category: "transaction_income",
          source: "bank_transactions",
          tags: ["bank", "income"],
          ai: { evidenceRef: `ev_inc_${i}` },
        });
      }
      if (d.expenses) {
        result.push({
          id: `act_exp_${i}`,
          icon: ArrowDownRight,
          title: `Витрати за ${d.month}`,
          subtitle: "Bank • Списання",
          amount: { value: d.expenses, currency: "UAH" },
          timestamp: pastDate(daysAgo, 4),
          category: "transaction_expense",
          source: "bank_transactions",
          tags: ["bank", "expense"],
          ai: { evidenceRef: `ev_exp_${i}` },
        });
      }
    });
  }

  // Tax events from KPIs
  config.kpis.forEach((kpi, idx) => {
    if (
      ["ep-vz", "esv", "tax-total"].includes(kpi.id) &&
      typeof kpi.value === "number" &&
      kpi.value > 0
    ) {
      result.push({
        id: `act_tax_${kpi.id}`,
        icon: CreditCard,
        title: kpi.title,
        subtitle: "Розрахунок • Податки",
        amount: { value: kpi.value, currency: "UAH" },
        timestamp: pastDate(0, idx + 1),
        category: "transaction_expense",
        source: "daily_calculations",
        tags: ["tax"],
      });
    }
  });

  // Risk events
  config.risks.slice(0, 5).forEach((risk, idx) => {
    result.push({
      id: `act_risk_${risk.id}`,
      icon: AlertTriangle,
      title: risk.text?.slice(0, 60) || "Ризик",
      timestamp: pastDate(idx, 3),
      category: "limit_status_change",
      source: (risk.source && risk.source[0]) || "system",
      tags: ["risk"],
      ai: { evidenceRef: `ev_risk_${risk.id}` },
    });
  });

  // Integration events from dataSources
  config.dataSources.forEach((ds, idx) => {
    if (ds.status === "error" || ds.status === "syncing") {
      result.push({
        id: `act_ds_${ds.id}`,
        icon: ds.icon,
        title: `${ds.name}: ${ds.status === "error" ? "помилка синхронізації" : "синхронізація..."}`,
        subtitle: ds.name,
        timestamp: pastDate(0, idx),
        category: "integration_sync",
        source: ds.name.toLowerCase(),
        tags: ["integration", ds.status],
      });
    }
  });

  // Sort by timestamp DESC (newest first)
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return result.slice(0, maxItems);
}

// ── Main hook ──

export function useTodaySnapshot(
  cabinet: Cabinet,
  tovViewMode?: TovViewMode,
  externalDataSet?: AnalyticsDataSet
): TodaySnapshotResult {
  return useMemo(() => {
    const isPassive = cabinet.accessMode === "passive";

    // 1. Aggregate data (use external if provided to avoid duplicate computation)
    const dataSet = externalDataSet || aggregateAnalyticsData(cabinet);

    // 2. Compute config
    const config: CabinetAnalyticsConfig = dataSet.isDemoData
      ? computeAnalytics(dataSet, "month")
      : getAnalyticsConfig(
          cabinet.type,
          cabinet.type === "tov" ? tovViewMode : undefined,
          isPassive
        );

    // 3. Evaluate risks
    const items = evaluateRisks(config.risks);

    // 4. Risk counts
    const bySeverity: Record<RiskSeverity, number> = { critical: 0, warning: 0, info: 0 };
    const byCategory: Record<string, number> = {};
    for (const r of items) {
      bySeverity[r.severity]++;
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    }

    // 5. Activity events
    const events = generateActivityEvents(config);
    const byChip: Record<ActivityChipId, number> = {
      all: events.length,
      transactions: 0,
      integrations: 0,
      limits: 0,
      compliance: 0,
    };
    for (const e of events) {
      const chip = categoryToChip(e.category);
      byChip[chip]++;
    }
    const chips: ActivityChipId[] = (
      ["all", "transactions", "integrations", "limits", "compliance"] as ActivityChipId[]
    ).filter((c) => c === "all" || byChip[c] > 0);

    // 6. Spark data
    const income = config.chartData
      .map((d: any) => d.income || d.accruals || 0)
      .filter(Boolean);
    const expense = config.chartData
      .map((d: any) => d.expenses || 0)
      .filter(Boolean);

    // 6b. FOP limit sparkline
    let fopLimit: TodaySnapshotResult["sparkData"]["fopLimit"] = undefined;
    if (cabinet.type === "fop" && cabinet.fopGroup) {
      const group = cabinet.fopGroup as 1 | 2 | 3;
      const yearlyLimit = FOP_INCOME_LIMITS[group];
      if (yearlyLimit > 0) {
        // Build cumulative income array from chartData
        const cumulative: number[] = [];
        let running = 0;
        for (const d of config.chartData) {
          running += (d as any).income || (d as any).accruals || 0;
          cumulative.push(running);
        }
        const currentTotal = cabinet.yearlyIncome || (cumulative.length > 0 ? cumulative[cumulative.length - 1] : 0);
        const percent = Math.round((currentTotal / yearlyLimit) * 100);
        fopLimit = { currentTotal, yearlyLimit, percent, cumulative };
      }
    }

    // 7. Severity filters
    const severityFilters: RiskSeverity[] = (
      ["critical", "warning", "info"] as RiskSeverity[]
    ).filter((s) => bySeverity[s] > 0);
    const categoryFilters: RiskCategory[] = (
      ["limit", "data", "compliance", "finance", "operations"] as RiskCategory[]
    ).filter((c) => (byCategory[c] || 0) > 0);

    // 8. Health Score
    const healthScore = computeHealthScore(dataSet, config, cabinet);

    return {
      risks: {
        counts: { total: items.length, bySeverity, byCategory },
        filters: { severity: severityFilters, category: categoryFilters },
        items,
      },
      recentActivity: {
        counts: { total: events.length, byChip },
        chips,
        events,
      },
      aiBriefing: null,
      config,
      healthScore,
      sparkData: { income, expense, fopLimit },
    };
  }, [cabinet, tovViewMode, externalDataSet]);
}
