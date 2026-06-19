/**
 * CashPositionKpiStrip — compact KPI-стрічка під hero.
 *
 * Wave 1: реальні flows + реальна реконсиляція (не % від балансу).
 * Runway — за 90-day avg burn (стандартна метрика, менш волатильна за 7-day).
 */

import { ArrowDownToLine, ArrowUpFromLine, Hourglass, AlertTriangle } from "lucide-react";
import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import { formatCurrency } from "@/lib/formatters";
import type { CabinetCashPosition } from "@/hooks/useCabinetCashPosition";
import type { ReconciliationStatus } from "@/hooks/useReconciliationStatus";

interface Props {
  position: CabinetCashPosition;
  reconciliation: ReconciliationStatus;
  onOpenUnmatched?: () => void;
}

export function CashPositionKpiStrip({ position, reconciliation, onOpenUnmatched }: Props) {
  const inflow7d = position.flows.inflow7d;
  const outflow7d = position.flows.outflow7d;

  // Runway: 90-day avg burn — стандарт treasury-продуктів
  const dailyBurn = position.flows.dailyBurn90d;
  const runwayDays =
    dailyBurn > 0 && position.availableUah > 0
      ? Math.max(0, Math.round(position.availableUah / dailyBurn))
      : null;

  const items: KPIStripItem[] = [
    {
      id: "inflow",
      title: "Надходження 7д",
      value: formatCurrency(inflow7d),
      icon: ArrowDownToLine,
      variant: "success",
      hint: `${position.flows.txCount7d} оп.`,
    },
    {
      id: "outflow",
      title: "Списання 7д",
      value: formatCurrency(outflow7d),
      icon: ArrowUpFromLine,
      variant: outflow7d > inflow7d ? "warning" : "default",
    },
    {
      id: "runway",
      title: "Запас часу (90д)",
      value: runwayDays === null ? "—" : `${runwayDays} дн.`,
      icon: Hourglass,
      variant: runwayDays !== null && runwayDays < 30 ? "danger" : runwayDays !== null && runwayDays < 90 ? "warning" : "default",
      hint: runwayDays === null ? "Позитивний рух" : `середнє вибуття ${formatCurrency(dailyBurn)}/день`,
    },
    {
      id: "unmatched",
      title: "Незіставлено",
      value: reconciliation.unmatchedCount === 0 ? "0" : String(reconciliation.unmatchedCount),
      icon: AlertTriangle,
      variant: reconciliation.unmatchedCount > 0 ? "warning" : "default",
      hint:
        reconciliation.unmatchedCount > 0
          ? `${reconciliation.matchedPercent}% зіставлено`
          : "усе зіставлено",
      onClick: reconciliation.unmatchedCount > 0 ? onOpenUnmatched : undefined,
    },
  ];

  return <KPIStrip items={items} ariaLabel="Фінансові показники" />;
}
