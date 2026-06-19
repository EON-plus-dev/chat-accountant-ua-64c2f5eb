import { useMemo } from "react";
import {
  mergeAttentionItems,
  type AttentionItem,
  type AttentionPriority,
} from "@/components/cabinets/shared/attention-inbox";
import type { AnalyticsRisk, RiskSeverity } from "@/types/analyticsTypes";

interface UseAnalyticsAttentionItemsParams {
  risks: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
  onNavigate?: (path: string) => void;
  onScrollTo?: (sectionId: string) => void;
}

function severityToPriority(severity: RiskSeverity): AttentionPriority {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "attention";
  return "normal";
}

/**
 * Адаптер: AnalyticsRisk[] → AttentionItem[].
 * Severity mapping: critical→critical, warning→attention, info→normal.
 * recommendedActions[0] → primaryAction; решта → secondaryActions.
 */
export function useAnalyticsAttentionItems({
  risks,
  onChatPromptInsert,
  onNavigate,
  onScrollTo,
}: UseAnalyticsAttentionItemsParams): AttentionItem[] {
  return useMemo(() => {
    const handleAction = (actionType: string, payload: string) => {
      switch (actionType) {
        case "chat-prompt":
          onChatPromptInsert?.(payload);
          break;
        case "navigate":
          onNavigate?.(payload);
          break;
        case "scroll":
          onScrollTo?.(payload);
          break;
      }
    };

    const items: AttentionItem[] = risks.map((risk) => {
      const primary = risk.recommendedActions[0];
      const secondary = risk.recommendedActions.slice(1);
      return {
        id: `analytics:${risk.id}`,
        priority: severityToPriority(risk.severity),
        icon: risk.icon,
        title: risk.title || risk.text,
        meta: [risk.impact, risk.deadline ? `до ${risk.deadline}` : null, risk.value]
          .filter(Boolean)
          .join(" · ") || undefined,
        primaryAction: primary
          ? {
              label: primary.label,
              onClick: () => handleAction(primary.actionType, primary.actionPayload),
            }
          : { label: "Деталі", onClick: () => {} },
        secondaryActions: secondary.length
          ? secondary.map((a) => ({
              label: a.label,
              onClick: () => handleAction(a.actionType, a.actionPayload),
            }))
          : undefined,
      };
    });

    return mergeAttentionItems(items);
  }, [risks, onChatPromptInsert, onNavigate, onScrollTo]);
}
