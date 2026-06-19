/**
 * Payments header: KPI grid (state) + actions.
 * Alert signals (overdue, pending) live in PaymentsAttentionInbox.
 */

import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentsKPIGrid } from "./PaymentsKPIGrid";
import type { TaxPayment, SalaryPayment, ContractorPayment } from "@/config/paymentsConfig";
import type { Cabinet } from "@/types/cabinet";

interface PaymentsKPISectionProps {
  taxPayments: TaxPayment[];
  salaryPayments: SalaryPayment[];
  contractorPayments?: ContractorPayment[];
  cabinet?: Cabinet;
  // Smart Inbox
  pendingPaymentsCount?: number;
  onOpenSmartInbox?: () => void;
  // Actions
  onCreatePayment?: () => void;
  // legacy — kept for backwards compatibility, no longer used internally
  onPayNow?: (paymentId: string) => void;
}

export function PaymentsKPISection({
  taxPayments,
  salaryPayments,
  contractorPayments,
  cabinet,
  pendingPaymentsCount = 0,
  onOpenSmartInbox,
  onCreatePayment,
}: PaymentsKPISectionProps) {
  return (
    <div className="space-y-3">
      {/* Action bar (queue + create). Stays here as it is composed with KPI in PaymentsPage. */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="h-8" onClick={onOpenSmartInbox}>
          <Inbox className="h-4 w-4 mr-1.5" />
          Черга
          {pendingPaymentsCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1.5 text-xs">
              {pendingPaymentsCount}
            </Badge>
          )}
        </Button>
        <Button size="sm" className="h-8" onClick={onCreatePayment}>
          + Створити
        </Button>
      </div>

      {/* Unified KPI grid */}
      <PaymentsKPIGrid
        taxPayments={taxPayments}
        salaryPayments={salaryPayments}
        contractorPayments={contractorPayments}
        cabinet={cabinet}
      />
    </div>
  );
}
