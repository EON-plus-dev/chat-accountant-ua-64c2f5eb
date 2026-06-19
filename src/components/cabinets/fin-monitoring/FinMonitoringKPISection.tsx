/**
 * Fin-Monitoring KPI Section
 * Single horizontal KPIStrip — all four metrics are homogeneous (sum + count),
 * which is the canonical use case for the strip pattern (Stripe/Mercury 2025).
 * Replaces the per-card grid for tighter vertical density (~64px instead of ~140px).
 */

import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import { useFinMonitoringKPIs } from "./useFinMonitoringKPIs";
import type { FinMonitoringRecord } from "@/config/finMonitoringConfig";

interface FinMonitoringKPISectionProps {
  records: FinMonitoringRecord[];
  periodLabel: string;
}

function formatCurrency(val: number): string {
  return (
    new Intl.NumberFormat("uk-UA", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val) + " ₴"
  );
}

export function FinMonitoringKPISection({
  records,
  periodLabel,
}: FinMonitoringKPISectionProps) {
  const kpis = useFinMonitoringKPIs({ records, periodLabel });

  if (kpis.length === 0) return null;

  const items: KPIStripItem[] = kpis.map((k) => ({
    id: k.id,
    title: k.title,
    icon: k.icon,
    variant: k.variant,
    value: k.format === "currency" ? formatCurrency(k.value) : k.value.toLocaleString("uk-UA"),
    hint: k.description,
  }));

  return <KPIStrip items={items} ariaLabel="Фін-моніторинг KPI" />;
}
