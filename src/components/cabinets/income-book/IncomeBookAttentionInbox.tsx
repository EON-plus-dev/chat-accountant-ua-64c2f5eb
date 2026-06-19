import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import { useIncomeBookAttentionItems } from "./useIncomeBookAttentionItems";
import type { Cabinet } from "@/types/cabinet";
import type { IncomeBookRecord, MonthlyAggregate } from "@/config/incomeBookConfig";

interface IncomeBookAttentionInboxProps {
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

export function IncomeBookAttentionInbox(props: IncomeBookAttentionInboxProps) {
  const items = useIncomeBookAttentionItems(props);
  if (items.length === 0) return null;
  return <AttentionInbox sectionKey="income-book" items={items} />;
}
