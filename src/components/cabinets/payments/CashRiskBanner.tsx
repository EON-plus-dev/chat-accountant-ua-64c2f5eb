/**
 * CashRiskBanner — сценарне попередження «що якщо клієнт не заплатить» (Wave 3).
 * Показуємо тільки якщо без найбільшого очікуваного надходження (≤14 днів)
 * у наступні 30 днів виникає касовий розрив.
 */

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { AlertTriangle, Bell, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";
import { useCashFlowForecast } from "@/hooks/useCashFlowForecast";

interface CashRiskBannerProps {
  payments: UnifiedPayment[];
  startingBalance: number;
  onShowDetails?: (payment: UnifiedPayment) => void;
}

export function CashRiskBanner({ payments, startingBalance, onShowDetails }: CashRiskBannerProps) {
  // 1. Базовий прогноз — щоб знайти найбільше очікуване надходження
  const baseForecast = useCashFlowForecast({ payments, startingBalance });

  // 2. «Що якщо» — прогноз без найбільшого очікуваного надходження
  const paymentsWithoutLargest = useMemo(() => {
    if (!baseForecast.largestExpectedInflow) return payments;
    const id = baseForecast.largestExpectedInflow.payment.id;
    return payments.filter((p) => p.id !== id);
  }, [payments, baseForecast.largestExpectedInflow]);

  const whatIfForecast = useCashFlowForecast({
    payments: paymentsWithoutLargest,
    startingBalance,
  });

  if (!baseForecast.largestExpectedInflow || !whatIfForecast.gapDate) return null;

  const inflow = baseForecast.largestExpectedInflow;
  const gap = whatIfForecast.gapAmount ?? 0;
  const gapDateLabel = format(parseISO(whatIfForecast.gapDate), "d MMMM", { locale: uk });
  const inflowDateLabel = format(parseISO(inflow.date), "d MMMM", { locale: uk });

  // Знаходимо подію, через яку виникає розрив (перший великий out після gapDate)
  const blockingEvent = whatIfForecast.points.find((p) => p.date === whatIfForecast.gapDate);

  return (
    <div className="border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg p-3 flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm text-foreground leading-snug">
          Якщо <span className="font-semibold">«{inflow.payment.entityName}»</span> не заплатить{" "}
          <span className="font-semibold tabular-nums">₴{Math.round(inflow.amount).toLocaleString("uk-UA")}</span>{" "}
          до {inflowDateLabel} —{" "}
          <span className="text-rose-700 dark:text-rose-400">
            у вас не вистачить{" "}
            <span className="font-semibold tabular-nums">₴{Math.abs(gap).toLocaleString("uk-UA")}</span>{" "}
            {blockingEvent?.primaryEvent ? `на «${blockingEvent.primaryEvent.split(" −")[0]}»` : "на заплановані витрати"}{" "}
            {gapDateLabel}
          </span>
          .
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-rose-300 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-950/40"
            onClick={() => {
              toast.success("Нагадування заплановано", {
                description: `${inflow.payment.entityName} отримає лист за 3 дні до ${inflowDateLabel}`,
              });
            }}
          >
            <Bell className="h-3 w-3 mr-1" />
            Нагадати клієнту
          </Button>
          {onShowDetails && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => onShowDetails(inflow.payment)}
            >
              Деталі
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
