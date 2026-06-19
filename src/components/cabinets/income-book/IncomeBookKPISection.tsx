/**
 * Income Book KPI Section
 * Unified grid of UniversalKPICard for the Income Book module.
 * FOP limit progress is shown via UniversalKPICard's target/progress feature.
 * Detailed limit analysis still lives in LimitControlBlock (deeper view).
 */

import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { useIncomeBookKPIs } from "./useIncomeBookKPIs";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { Cabinet } from "@/types/cabinet";

interface IncomeBookKPISectionProps {
  cabinet: Cabinet;
  records: IncomeBookRecord[];
  selectedYear: number;
}

export function IncomeBookKPISection({
  cabinet,
  records,
  selectedYear,
}: IncomeBookKPISectionProps) {
  const kpis = useIncomeBookKPIs({ cabinet, records, selectedYear });

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
          density="compact"
        />
      ))}
    </div>
  );
}
