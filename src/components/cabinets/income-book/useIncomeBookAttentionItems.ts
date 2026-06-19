import { useMemo } from "react";
import { TrendingUp, AlertCircle, Wallet, Tags } from "lucide-react";
import {
  mergeAttentionItems,
  type AttentionItem,
} from "@/components/cabinets/shared/attention-inbox";
import type { Cabinet } from "@/types/cabinet";
import type { IncomeBookRecord, MonthlyAggregate } from "@/config/incomeBookConfig";
import { validateIncomeLimit, formatCurrency } from "@/lib/businessRules";

interface UseIncomeBookAttentionItemsParams {
  cabinet: Cabinet;
  records: IncomeBookRecord[];
  yearlyAggregates: MonthlyAggregate[];
  selectedYear: number;
  qualityIssuesCount: number;
  categorizationPercent?: number;
  uncategorizedCount?: number;
  onShowIssues?: () => void;
  onShowUncategorized?: () => void;
  onNavigateToAnalytics?: () => void;
  onOpenLimitDetails?: () => void;
}

/**
 * Адаптер: ліміт ФОП + операції з issues + категоризація → AttentionItem[].
 */
export function useIncomeBookAttentionItems({
  cabinet,
  records,
  yearlyAggregates,
  selectedYear,
  qualityIssuesCount,
  categorizationPercent = 100,
  uncategorizedCount = 0,
  onShowIssues,
  onShowUncategorized,
  onNavigateToAnalytics,
  onOpenLimitDetails,
}: UseIncomeBookAttentionItemsParams): AttentionItem[] {
  return useMemo(() => {
    const items: AttentionItem[] = [];

    const fopGroup = (cabinet.fopGroup || 3) as 1 | 2 | 3;
    const totalIncome = yearlyAggregates.reduce((s, a) => s + a.inIncomeBook, 0);
    const currentMonth = new Date().getMonth() + 1;
    const monthlyAverage = currentMonth > 0 ? totalIncome / currentMonth : 0;
    const limit = validateIncomeLimit(fopGroup, totalIncome, monthlyAverage);

    // 1. Ліміт ФОП
    if (limit.status === "exceeded") {
      items.push({
        id: "income-book:limit",
        priority: "critical",
        icon: TrendingUp,
        title: `Ліміт ФОП ${selectedYear} вичерпано`,
        meta: `${formatCurrency(totalIncome)} з ${formatCurrency(limit.limit)}`,
        primaryAction: {
          label: "Що робити",
          onClick: () => onOpenLimitDetails?.(),
        },
        secondaryActions: onNavigateToAnalytics
          ? [{ label: "Аналітика", onClick: () => onNavigateToAnalytics() }]
          : undefined,
      });
    } else if (limit.status === "critical") {
      items.push({
        id: "income-book:limit",
        priority: "critical",
        icon: TrendingUp,
        title: `Ліміт ФОП ${selectedYear}: ${limit.usedPercent.toFixed(0)}%`,
        meta: `Залишок ${formatCurrency(limit.remainingAmount)}`,
        primaryAction: {
          label: "Деталі",
          onClick: () => onOpenLimitDetails?.(),
        },
      });
    } else if (limit.status === "warning") {
      items.push({
        id: "income-book:limit",
        priority: "attention",
        icon: TrendingUp,
        title: `Ліміт ФОП ${selectedYear}: ${limit.usedPercent.toFixed(0)}%`,
        meta: `Залишок ${formatCurrency(limit.remainingAmount)}`,
        primaryAction: {
          label: "Деталі",
          onClick: () => onOpenLimitDetails?.(),
        },
      });
    }

    // 2. Операції потребують уточнення
    if (qualityIssuesCount > 0) {
      items.push({
        id: "income-book:issues",
        priority: "attention",
        icon: AlertCircle,
        title: `${qualityIssuesCount} ${qualityIssuesCount === 1 ? "операція потребує" : "операцій потребують"} уточнення`,
        meta: `${selectedYear} рік`,
        badge: { text: String(qualityIssuesCount), tone: "count" },
        primaryAction: {
          label: "Переглянути",
          onClick: () => onShowIssues?.(),
        },
      });
    }

    // 3. Категоризація — низьке покриття (бухгалтерський ризик)
    if (uncategorizedCount > 0 && categorizationPercent < 80) {
      items.push({
        id: "income-book:categorization",
        priority: "attention",
        icon: Tags,
        title: `Категоризація: ${categorizationPercent}%`,
        meta: `${uncategorizedCount} без категорії`,
        badge: { text: String(uncategorizedCount), tone: "count" },
        primaryAction: {
          label: "Категоризувати",
          onClick: () => onShowUncategorized?.(),
        },
      });
    }

    // 4. Касова звірка — нагадування (нормальне)
    const hasCash = records.some(
      (r) => r.paymentType === "cash" || r.source === "prro",
    );
    if (hasCash) {
      items.push({
        id: "income-book:cash-reconciliation",
        priority: "normal",
        icon: Wallet,
        title: "Касова звірка",
        meta: "Тижневе нагадування",
        primaryAction: {
          label: "Звірити",
          onClick: () => onShowIssues?.(),
        },
      });
    }

    return mergeAttentionItems(items);
  }, [
    cabinet,
    records,
    yearlyAggregates,
    selectedYear,
    qualityIssuesCount,
    categorizationPercent,
    uncategorizedCount,
    onShowIssues,
    onShowUncategorized,
    onNavigateToAnalytics,
    onOpenLimitDetails,
  ]);
}
