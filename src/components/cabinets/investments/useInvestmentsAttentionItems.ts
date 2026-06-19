import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { DollarSign, AlertCircle, Award } from "lucide-react";
import {
  mergeAttentionItems,
  type AttentionItem,
} from "@/components/cabinets/shared/attention-inbox";
import type { InvestmentPosition } from "@/config/demoCabinets/investmentData";

interface UseInvestmentsAttentionItemsParams {
  positions: InvestmentPosition[];
  onOpenPosition?: (positionId: string) => void;
  onOpenDeclarations?: () => void;
  onOpenReport?: () => void;
}

/**
 * Адаптер: позиції портфеля → AttentionItem[].
 * Джерела:
 *   - critical: дивіденди отримані ≥60 днів тому, не задекларовані (status !== "declared")
 *   - attention: позиції з status === "pending" (чекають дії)
 *   - normal: ESOP exercise події незадекларовані (status !== "declared")
 */
export function useInvestmentsAttentionItems({
  positions,
  onOpenPosition,
  onOpenDeclarations,
  onOpenReport,
}: UseInvestmentsAttentionItemsParams): AttentionItem[] {
  return useMemo(() => {
    const today = new Date();
    const items: AttentionItem[] = [];

    // 1. Критично: незадекларовані дивіденди >60 днів
    const overdueDividends = positions.filter((p) => {
      if (p.operationType !== "dividend") return false;
      if (p.status === "declared") return false;
      if (!p.dividendDate) return false;
      const days = differenceInDays(today, new Date(p.dividendDate));
      return days >= 60;
    });

    if (overdueDividends.length === 1) {
      const p = overdueDividends[0];
      const days = p.dividendDate ? differenceInDays(today, new Date(p.dividendDate)) : 0;
      items.push({
        id: `investment:${p.id}`,
        priority: "critical",
        icon: DollarSign,
        title: `Дивіденди ${p.ticker} не задекларовано`,
        meta: `${days} дн. тому · потрібно подати декларацію`,
        primaryAction: {
          label: "До декларації",
          onClick: () => onOpenDeclarations?.(),
        },
        secondaryActions: [
          { label: "Деталі позиції", onClick: () => onOpenPosition?.(p.id) },
        ],
      });
    } else if (overdueDividends.length > 1) {
      items.push({
        id: "investments:dividends-overdue",
        priority: "critical",
        icon: DollarSign,
        title: `${overdueDividends.length} дивідендів не задекларовано`,
        meta: "Отримано >60 днів тому",
        badge: { text: String(overdueDividends.length), tone: "count" },
        primaryAction: {
          label: "До декларації",
          onClick: () => onOpenDeclarations?.(),
        },
      });
    }

    // 2. Attention: pending позиції (потребують дії)
    const pendingPositions = positions.filter((p) => p.status === "pending");
    if (pendingPositions.length > 0) {
      items.push({
        id: "investments:pending",
        priority: "attention",
        icon: AlertCircle,
        title: `${pendingPositions.length} ${pendingPositions.length === 1 ? "позиція очікує" : "позицій очікують"} обробки`,
        meta: "FIFO matching, корпоративні дії",
        badge: { text: String(pendingPositions.length), tone: "count" },
        primaryAction: {
          label: "Переглянути",
          onClick: () => onOpenReport?.(),
        },
      });
    }

    // 3. Normal: ESOP exercise події незадекларовані
    const esopPending = positions.filter(
      (p) => p.operationType === "exercise" && p.status !== "declared",
    );
    if (esopPending.length > 0) {
      items.push({
        id: "investments:esop-pending",
        priority: "normal",
        icon: Award,
        title: `ESOP/RSU: ${esopPending.length} ${esopPending.length === 1 ? "подія" : "події"} до декларування`,
        meta: "Бенефіт = (FMV − Strike) × Qty",
        primaryAction: {
          label: "Звіт інвестора",
          onClick: () => onOpenReport?.(),
        },
      });
    }

    return mergeAttentionItems(items);
  }, [positions, onOpenPosition, onOpenDeclarations, onOpenReport]);
}
