import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import { AIStatusStrip } from "./AIStatusStrip";
import { useReportsAttentionItems } from "./useReportsAttentionItems";
import type { ReportsHubStats } from "./reportsHubTypes";
import type { Report } from "@/config/reportsConfig";

interface ReportsAttentionInboxProps {
  hubStats: ReportsHubStats;
  onOpenReport?: (report: Report) => void;
  onApplyFilter?: (filter: "review" | "overdue") => void;
  isAutoGenerating?: boolean;
  generatingReportType?: string | null;
  hasError?: boolean;
  errorMessage?: string | null;
  onRetryGeneration?: () => void;
}

export function ReportsAttentionInbox({
  hubStats,
  onOpenReport,
  onApplyFilter,
  isAutoGenerating,
  generatingReportType,
  hasError,
  errorMessage,
  onRetryGeneration,
}: ReportsAttentionInboxProps) {
  const items = useReportsAttentionItems({ hubStats, onOpenReport, onApplyFilter });

  const hasStrip = !!(isAutoGenerating || hasError);
  if (items.length === 0 && !hasStrip) return null;

  return (
    <AttentionInbox
      sectionKey="reports"
      items={items}
      topSlot={
        hasStrip ? (
          <AIStatusStrip
            isAutoGenerating={isAutoGenerating}
            generatingReportType={generatingReportType}
            hasError={hasError}
            errorMessage={errorMessage}
            onRetryGeneration={onRetryGeneration}
          />
        ) : null
      }
    />
  );
}
