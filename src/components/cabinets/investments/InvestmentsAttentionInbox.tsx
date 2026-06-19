import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import { useInvestmentsAttentionItems } from "./useInvestmentsAttentionItems";
import type { InvestmentPosition } from "@/config/demoCabinets/investmentData";

interface InvestmentsAttentionInboxProps {
  positions: InvestmentPosition[];
  onOpenPosition?: (positionId: string) => void;
  onOpenDeclarations?: () => void;
  onOpenReport?: () => void;
}

export function InvestmentsAttentionInbox(props: InvestmentsAttentionInboxProps) {
  const items = useInvestmentsAttentionItems(props);
  if (items.length === 0) return null;
  return <AttentionInbox sectionKey="investments" items={items} />;
}
