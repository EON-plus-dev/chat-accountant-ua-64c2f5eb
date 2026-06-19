import { useMemo } from "react";
import { AlertCircle, Repeat } from "lucide-react";
import {
  mergeAttentionItems,
  type AttentionItem,
} from "@/components/cabinets/shared/attention-inbox";
import type { FinMonitoringRecord } from "@/config/finMonitoringConfig";

interface UseFinMonitoringAttentionItemsParams {
  records: FinMonitoringRecord[];
  onShowNeedsReview?: () => void;
  onShowPending?: () => void;
}

/**
 * Адаптер: агрегує операції фін.моніторингу зі статусами needs-review / pending → AttentionItem[].
 * Джерела:
 *   - critical: операції з needs-review (потребують класифікації)
 *   - attention: операції pending (на підтвердження)
 */
export function useFinMonitoringAttentionItems({
  records,
  onShowNeedsReview,
  onShowPending,
}: UseFinMonitoringAttentionItemsParams): AttentionItem[] {
  return useMemo(() => {
    const items: AttentionItem[] = [];

    const needsReview = records.filter((r) => r.status === "needs-review");
    const pending = records.filter((r) => r.status === "pending");

    if (needsReview.length > 0) {
      items.push({
        id: "fin-monitoring:needs-review",
        priority: "critical",
        icon: AlertCircle,
        title: `${needsReview.length} ${needsReview.length === 1 ? "операція потребує" : "операцій потребують"} класифікації`,
        meta: "Без категорії — потенційні податкові ризики",
        badge: { text: String(needsReview.length), tone: "count" },
        primaryAction: {
          label: "Перевірити",
          onClick: () => onShowNeedsReview?.(),
        },
      });
    }

    if (pending.length > 0) {
      items.push({
        id: "fin-monitoring:pending",
        priority: "attention",
        icon: Repeat,
        title: `${pending.length} ${pending.length === 1 ? "операція очікує" : "операцій очікують"} підтвердження`,
        meta: "Імпорт із банку / документу",
        badge: { text: String(pending.length), tone: "count" },
        primaryAction: {
          label: "Підтвердити",
          onClick: () => onShowPending?.(),
        },
      });
    }

    return mergeAttentionItems(items);
  }, [records, onShowNeedsReview, onShowPending]);
}
