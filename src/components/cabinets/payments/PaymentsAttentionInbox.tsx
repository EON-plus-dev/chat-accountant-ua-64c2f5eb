import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import { usePaymentsAttentionItems } from "./usePaymentsAttentionItems";
import type { TaxPayment, SalaryPayment, ContractorPayment } from "@/config/paymentsConfig";

interface PaymentsAttentionInboxProps {
  sectionKey?: string;
  taxPayments: TaxPayment[];
  salaryPayments?: SalaryPayment[];
  contractorPayments?: ContractorPayment[];
  onOpenPayment?: (paymentId: string) => void;
  onOpenAllOverdue?: () => void;
  onOpenPending?: () => void;
  onOpenScheduled?: () => void;
  /** Якщо true — пункти про податки не відображаються (вони живуть у власному розділі «Податки»). */
  hideTaxAttention?: boolean;
}

export function PaymentsAttentionInbox({
  sectionKey = "payments",
  taxPayments,
  salaryPayments,
  contractorPayments,
  onOpenPayment,
  onOpenAllOverdue,
  onOpenPending,
  onOpenScheduled,
  hideTaxAttention = false,
}: PaymentsAttentionInboxProps) {
  const items = usePaymentsAttentionItems({
    taxPayments: hideTaxAttention ? [] : taxPayments,
    salaryPayments,
    contractorPayments,
    onOpenPayment,
    onOpenAllOverdue,
    onOpenPending,
    onOpenScheduled,
  });

  if (items.length === 0) return null;

  return <AttentionInbox sectionKey={sectionKey} items={items} />;
}
