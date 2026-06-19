import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import { useAuditsAttentionItems } from "./useAuditsAttentionItems";
import type { TaxAudit } from "@/config/taxAuditsConfig";

interface AuditsAttentionInboxProps {
  audits: TaxAudit[];
  onOpenAudit?: (auditId: string) => void;
  onOpenAppeal?: (auditId: string) => void;
  onOpenAllOverdue?: () => void;
  onOpenResponse?: (auditId: string, requestId: string) => void;
}

export function AuditsAttentionInbox(props: AuditsAttentionInboxProps) {
  const items = useAuditsAttentionItems(props);
  if (items.length === 0) return null;
  return <AttentionInbox sectionKey="audits" items={items} />;
}
