/**
 * FopLimitProgressCard — річний дохід ФОП vs ліміт групи.
 *
 * Дані: `usePaymentsYearlyIncome` (для ФОП-кабінетів). Для не-ФОП — нічого не рендеримо.
 * Тон бере з `getFopLimitTone` (ok / warn / danger).
 */

import { Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { usePaymentsYearlyIncome } from "@/hooks/usePaymentsYearlyIncome";
import type { Cabinet } from "@/types/cabinet";

interface Props {
  cabinet: Cabinet;
}

const TONE_FILL: Record<string, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  danger: "bg-red-500",
};

const TONE_TEXT: Record<string, string> = {
  ok: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  danger: "text-red-700 dark:text-red-400",
};

export function FopLimitProgressCard({ cabinet }: Props) {
  const data = usePaymentsYearlyIncome(cabinet);
  if (!data.enabled || !data.limit) return null;

  const monthsLeft = 12 - new Date().getMonth();
  const projected = Math.round((data.amount / Math.max(1, new Date().getMonth() + 1)) * 12);
  const projectedExceeds = projected > data.limit;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold inline-flex items-center gap-2 flex-wrap">
          <Target className="w-4 h-4 text-muted-foreground" />
          Ліміт {data.group} групи ФОП
          <span className="text-xs font-normal text-muted-foreground">
            · {formatCurrency(data.amount)} з {formatCurrency(data.limit)}
          </span>
          {data.tone !== "ok" && (
            <span className={cn("text-xs font-medium", TONE_TEXT[data.tone])}>
              · {data.percent.toFixed(1)}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 space-y-3">
        <div className="space-y-1.5">
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", TONE_FILL[data.tone])}
              style={{ width: `${Math.min(100, data.percent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>0 ₴</span>
            <span>Лишилось: {formatCurrency(data.remaining)}</span>
            <span>{formatCurrency(data.limit)}</span>
          </div>
        </div>

        {/* Прогноз річний (на основі темпу YTD) */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5">
            <div className="text-muted-foreground">Прогноз року</div>
            <div
              className={cn(
                "font-semibold tabular-nums",
                projectedExceeds ? "text-red-700 dark:text-red-400" : "text-foreground",
              )}
            >
              {formatCurrency(projected)}
            </div>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5">
            <div className="text-muted-foreground">До кінця року</div>
            <div className="font-semibold tabular-nums">
              {monthsLeft} {monthsLeft === 1 ? "місяць" : "міс."}
            </div>
          </div>
        </div>

        {projectedExceeds && (
          <div className="flex items-start gap-2 text-[11px] text-red-700 dark:text-red-400 border-t pt-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              За поточним темпом ліміт групи буде перевищено. Розгляньте перехід на наступну
              групу або реєстрацію 2-го ФОП.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
