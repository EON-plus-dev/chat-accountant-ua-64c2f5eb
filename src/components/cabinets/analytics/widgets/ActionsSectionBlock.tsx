import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionBlock } from "./SectionBlock";
import type { SeverityChip } from "./SectionBlock";
import type { AnalyticsRisk } from "@/types/analyticsTypes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ActionsSectionBlockProps {
  risks: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
  onScrollTo?: (sectionId: string) => void;
}

/**
 * Derives actionable to-do items from risk recommended actions.
 */
export const ActionsSectionBlock = ({ risks, onChatPromptInsert, onScrollTo }: ActionsSectionBlockProps) => {
  const actions = useMemo(() => {
    return risks
      .filter(r => r.recommendedActions.length > 0)
      .map(r => ({
        id: r.id,
        label: r.recommendedActions[0].label,
        why: r.text,
        expectedEffect: r.recommendedActions[0].expectedEffect,
        actionType: r.recommendedActions[0].actionType,
        actionPayload: r.recommendedActions[0].actionPayload,
        priority: r.severity === "critical" ? "high" as const : r.severity === "warning" ? "medium" as const : "low" as const,
        icon: r.recommendedActions[0].icon,
      }));
  }, [risks]);

  if (actions.length === 0) return null;

  const urgentCount = actions.filter(a => a.priority === "high").length;
  const improvementCount = actions.filter(a => a.priority === "medium").length;
  const settingsCount = actions.filter(a => a.priority === "low").length;

  const severityChips: SeverityChip[] = [
    { label: "Терміново", count: urgentCount, variant: "error" },
    { label: "Покращення", count: improvementCount, variant: "warning" },
    { label: "Налаштування", count: settingsCount, variant: "outline" },
  ];

  const needsScroll = actions.length > 4;

  const handleAction = (actionType: string, payload: string) => {
    switch (actionType) {
      case "chat-prompt":
        onChatPromptInsert?.(payload);
        toast.success("Запит надіслано", { duration: 3000 });
        break;
      case "scroll":
        onScrollTo?.(payload);
        break;
    }
  };

  return (
    <SectionBlock
      title="Рекомендовані дії"
      icon={Lightbulb}
      count={actions.length}
      severityChips={severityChips}
      fixedHeight="380px"
    >
      <div className="space-y-1.5">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <div
              key={action.id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <ActionIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.why}</p>
                {action.expectedEffect && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{action.expectedEffect}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] md:min-h-0 text-xs text-primary px-2 h-7 flex-shrink-0"
                onClick={() => handleAction(action.actionType, action.actionPayload)}
              >
                {action.actionType === "chat-prompt" ? "Запитати AI" : action.actionType === "scroll" ? "Перейти" : action.label}
              </Button>
            </div>
          );
        })}
      </div>
    </SectionBlock>
  );
};
