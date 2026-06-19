/**
 * Investments KPI Section
 * Unified grid of UniversalKPICard for the Investment Portfolio.
 * Replaces custom SummaryCard hero blocks.
 */

import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { useInvestmentsKPIs } from "./useInvestmentsKPIs";
import type { InvestmentPosition } from "@/config/demoCabinets/investmentData";

interface InvestmentsKPISectionProps {
  positions: InvestmentPosition[];
}

export function InvestmentsKPISection({ positions }: InvestmentsKPISectionProps) {
  const kpis = useInvestmentsKPIs(positions);

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
          density="compact"
          showDescription
        />
      ))}
    </div>
  );
}
