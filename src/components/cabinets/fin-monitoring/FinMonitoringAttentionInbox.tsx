import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import { useFinMonitoringAttentionItems } from "./useFinMonitoringAttentionItems";
import type { FinMonitoringRecord } from "@/config/finMonitoringConfig";

interface FinMonitoringAttentionInboxProps {
  records: FinMonitoringRecord[];
  onShowNeedsReview?: () => void;
  onShowPending?: () => void;
}

export function FinMonitoringAttentionInbox(props: FinMonitoringAttentionInboxProps) {
  const items = useFinMonitoringAttentionItems(props);
  if (items.length === 0) return null;
  return <AttentionInbox sectionKey="fin-monitoring" items={items} />;
}
