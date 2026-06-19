/**
 * Payments KPI Grid
 * Pure unified grid of UniversalKPICard for the Payments module.
 * No action-bar — used as the visual KPI layer composed by PaymentsKPISection
 * (which adds the queue/create action-bar) or directly by UnifiedPaymentsPage.
 * Alerts live in PaymentsAttentionInbox.
 */

import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { usePaymentsKPIs } from "./usePaymentsKPIs";
import type {
  TaxPayment,
  SalaryPayment,
  ContractorPayment,
} from "@/config/paymentsConfig";
import type { Cabinet } from "@/types/cabinet";

interface PaymentsKPIGridProps {
  taxPayments: TaxPayment[];
  salaryPayments: SalaryPayment[];
  contractorPayments?: ContractorPayment[];
  /** Опціонально — щоб показати «Дохід року vs ліміт ФОП». */
  cabinet?: Cabinet;
}

export function PaymentsKPIGrid({
  taxPayments,
  salaryPayments,
  contractorPayments,
  cabinet,
}: PaymentsKPIGridProps) {
  const kpis = usePaymentsKPIs({ taxPayments, salaryPayments, contractorPayments, cabinet });

  if (kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <UniversalKPICard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          format={kpi.format}
          icon={kpi.icon}
          variant={kpi.variant}
          description={kpi.description}
          target={kpi.target}
          showProgressBar={kpi.showProgressBar}
          density="compact"
        />
      ))}
    </div>
  );
}
