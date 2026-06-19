import { useMemo } from "react";
import { Calendar, FileCheck, ShieldAlert } from "lucide-react";
import { differenceInDays } from "date-fns";
import {
  mergeAttentionItems,
  type AttentionItem,
  type AttentionPriority,
} from "@/components/cabinets/shared/attention-inbox";
import type { ReportsHubStats } from "./reportsHubTypes";
import type { Report } from "@/config/reportsConfig";

interface UseReportsAttentionItemsParams {
  hubStats: ReportsHubStats;
  onOpenReport?: (report: Report) => void;
  onApplyFilter?: (filter: "review" | "overdue") => void;
}

function deadlinePriority(days: number): AttentionPriority {
  if (days < 0) return "critical";
  if (days <= 7) return "attention";
  return "normal";
}

function relativeLabel(days: number): string {
  if (days < 0) return `Прострочено ${Math.abs(days)} ${Math.abs(days) === 1 ? "день" : "дн."}`;
  if (days === 0) return "Сьогодні";
  if (days === 1) return "Завтра";
  return `Через ${days} дн.`;
}

/**
 * Адаптер: перетворює ReportsHubStats у плоский список AttentionItem,
 * дедуплікуючи звіти, що з'являються одночасно як "найближчий дедлайн" і "до перевірки".
 */
export function useReportsAttentionItems({
  hubStats,
  onOpenReport,
  onApplyFilter,
}: UseReportsAttentionItemsParams): AttentionItem[] {
  return useMemo(() => {
    const today = new Date();
    const items: AttentionItem[] = [];

    // 1. Найближчі дедлайни (до 4 верхніх, як в оригіналі)
    for (const report of hubStats.upcoming.slice(0, 4)) {
      const days = differenceInDays(new Date(report.deadline), today);
      const priority = deadlinePriority(days);
      const status = report.normalizedStatus;
      const isScheduled = status === "scheduled" || status === "processing";
      const ctaLabel = status === "review" ? "Перевірити" : "Відкрити";

      items.push({
        id: `report:${report.id}`,
        priority,
        icon: Calendar,
        title: `${report.typeLabel}`,
        meta: `${relativeLabel(days)} · ${report.periodLabel}`,
        badge: isScheduled ? { text: "AI", tone: "ai" } : undefined,
        primaryAction: {
          label: ctaLabel,
          onClick: () => onOpenReport?.(report),
        },
      });
    }

    // 2. Звіти "до перевірки" — окремий item, якщо їх більше 1 АБО якщо єдиний review
    //    не збігається з найближчим дедлайном
    const reviewTotal = hubStats.review.total;
    const firstReview = hubStats.review.firstReport;
    if (reviewTotal > 0) {
      if (reviewTotal === 1 && firstReview) {
        // Єдиний review — додаємо як окремий item з id звіту;
        // mergeAttentionItems автоматично залишить версію з вищим пріоритетом.
        const days = differenceInDays(new Date(firstReview.deadline), today);
        items.push({
          id: `report:${firstReview.id}`,
          priority: "attention",
          icon: FileCheck,
          title: firstReview.typeLabel,
          meta: `Готовий до перевірки · ${firstReview.periodLabel}`,
          badge: { text: "AI", tone: "ai" },
          primaryAction: {
            label: "Перевірити",
            onClick: () => onOpenReport?.(firstReview),
          },
        });
      } else {
        // 2+ звітів на перевірку — агрегований item
        items.push({
          id: "reports:review-queue",
          priority: "attention",
          icon: FileCheck,
          title: `${reviewTotal} ${reviewTotal === 1 ? "звіт" : reviewTotal < 5 ? "звіти" : "звітів"} до перевірки`,
          meta:
            hubStats.review.fresh > 0
              ? `${hubStats.review.fresh} нових від AI`
              : "Готові до підтвердження",
          badge: { text: String(reviewTotal), tone: "count" },
          primaryAction: {
            label: "Перевірити всі",
            onClick: () => onApplyFilter?.("review"),
          },
        });
      }
    }

    // 3. Reliability alert — тільки коли є дані ТА надійність низька (<70%)
    const rel = hubStats.discipline;
    if (rel.totalPaid > 0 && rel.onTimeRate < 70) {
      items.push({
        id: "reports:reliability",
        priority: rel.onTimeRate < 50 ? "critical" : "attention",
        icon: ShieldAlert,
        title: `Надійність ${rel.onTimeRate}%`,
        meta: `${rel.lateCount} ${rel.lateCount === 1 ? "звіт" : "звітів"} із запізненням за останні 6 міс.`,
        primaryAction: {
          label: "Переглянути",
          onClick: () => onApplyFilter?.("overdue"),
        },
      });
    }

    return mergeAttentionItems(items);
  }, [hubStats, onOpenReport, onApplyFilter]);
}
