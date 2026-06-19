import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import { useAnalyticsAttentionItems } from "./useAnalyticsAttentionItems";
import type { AnalyticsRisk } from "@/types/analyticsTypes";

interface AnalyticsAttentionInboxProps {
  risks: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
  onNavigate?: (path: string) => void;
  onScrollTo?: (sectionId: string) => void;
}

export function AnalyticsAttentionInbox(props: AnalyticsAttentionInboxProps) {
  const items = useAnalyticsAttentionItems(props);
  if (items.length === 0) return null;
  return <AttentionInbox sectionKey="analytics" items={items} />;
}
