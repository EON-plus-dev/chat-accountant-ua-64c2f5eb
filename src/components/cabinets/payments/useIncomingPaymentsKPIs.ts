/**
 * Incoming Payments KPI adapter
 * State metrics only (expected/received amounts and counts).
 * Alert signals (overdue, due-soon) belong to PaymentsAttentionInbox.
 */

import { useMemo } from "react";
import { Clock, ArrowDownLeft, RotateCcw, CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface IncomingKPIDef {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number";
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  description?: string;
}

interface ExpectedStats {
  total: number;
  overdueCount: number;
  dueSoonCount: number;
  overdueAmount: number;
}

interface ReceivedStats {
  totalIncome: number;
  totalReturns: number;
  netIncome: number;
  incomeCount: number;
  returnsCount: number;
}

interface UseIncomingPaymentsKPIsArgs {
  mode: "expected" | "received";
  expectedStats: ExpectedStats;
  receivedStats: ReceivedStats;
}

export function useIncomingPaymentsKPIs({
  mode,
  expectedStats,
  receivedStats,
}: UseIncomingPaymentsKPIsArgs): IncomingKPIDef[] {
  return useMemo(() => {
    if (mode === "expected") {
      const defs: IncomingKPIDef[] = [
        {
          id: "expected-total",
          title: "Очікується надходжень",
          value: expectedStats.total,
          format: "currency",
          icon: Clock,
          variant: expectedStats.total > 0 ? "default" : "success",
          description: "Сума непогашених рахунків",
        },
        {
          id: "due-soon",
          title: "До 7 днів",
          value: expectedStats.dueSoonCount,
          format: "number",
          icon: CalendarClock,
          variant: expectedStats.dueSoonCount > 0 ? "warning" : "default",
          description: "Рахунків з найближчим терміном",
        },
      ];
      return defs;
    }

    const defs: IncomingKPIDef[] = [
      {
        id: "received-income",
        title: "Отримано",
        value: receivedStats.totalIncome,
        format: "currency",
        icon: ArrowDownLeft,
        variant: "success",
        description: `${receivedStats.incomeCount} надходжень`,
      },
      {
        id: "net-income",
        title: "Чистий результат",
        value: receivedStats.netIncome,
        format: "currency",
        icon: ArrowDownLeft,
        variant: "default",
        description: "Надходження мінус повернення",
      },
    ];
    if (receivedStats.returnsCount > 0) {
      defs.push({
        id: "returns",
        title: "Повернення",
        value: receivedStats.totalReturns,
        format: "currency",
        icon: RotateCcw,
        variant: "warning",
        description: `${receivedStats.returnsCount} операцій`,
      });
    }
    return defs;
  }, [mode, expectedStats, receivedStats]);
}
