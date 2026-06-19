/**
 * TaxReserveCard — резерв під податки (ЄП, ЄСВ, ВЗ, ПДВ, зарплатні).
 *
 * Скільки потрібно сплатити в горизонті 30 днів і чи вистачає Available.
 * Дані — із `useLiquidityBuckets` (де вже відокремлено tax-резерв).
 */

import { PiggyBank, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { useLiquidityBuckets } from "@/hooks/useLiquidityBuckets";
import type { Cabinet } from "@/types/cabinet";
import type { CabinetCashPosition } from "@/hooks/useCabinetCashPosition";

interface Props {
  cabinet: Cabinet;
  position: CabinetCashPosition;
}

export function TaxReserveCard({ cabinet, position }: Props) {
  const { buckets } = useLiquidityBuckets(cabinet, position);
  const tax = buckets.find((b) => b.id === "tax");
  if (!tax || (tax.needed ?? 0) === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold inline-flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-muted-foreground" />
            Резерв під податки
            <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> немає очікуваних платежів у 30 днях
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const needed = tax.needed ?? 0;
  const coverage = needed === 0 ? 100 : Math.min(100, Math.round((tax.amount / needed) * 100));
  const shortfall = Math.max(0, needed - tax.amount);
  const isFunded = shortfall === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold inline-flex items-center gap-2 flex-wrap">
          <PiggyBank className="w-4 h-4 text-muted-foreground" />
          Резерв під податки (30 днів)
          <span
            className={cn(
              "text-xs font-normal",
              isFunded
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400",
            )}
          >
            · {formatCurrency(tax.amount)} з {formatCurrency(needed)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              isFunded ? "bg-emerald-500" : "bg-amber-500",
            )}
            style={{ width: `${coverage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>{coverage}% покрито з Доступно</span>
          {shortfall > 0 && (
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              Не вистачає: {formatCurrency(shortfall)}
            </span>
          )}
        </div>
        {shortfall > 0 && (
          <div className="text-[11px] text-muted-foreground border-t pt-2">
            Заплануйте поповнення до строку сплати або погодьте розстрочку з ДПС.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
