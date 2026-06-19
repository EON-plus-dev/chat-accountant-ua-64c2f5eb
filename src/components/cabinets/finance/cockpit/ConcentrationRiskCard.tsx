/**
 * ConcentrationRiskCard — розподіл коштів по банках + ФГВФО-попередження.
 *
 * Поріг: >70% в одному банку = warn, >85% = danger.
 * ФГВФО (Фонд гарантування вкладів фізосіб) ліміт 600 тис ₴ на банк — попереджаємо
 * для individual-кабінетів (юрособи не покриваються, але корисно для свідомості ризику).
 */

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { useConcentrationRisk } from "@/hooks/useConcentrationRisk";
import type { CabinetCashPosition } from "@/hooks/useCabinetCashPosition";
import type { Cabinet } from "@/types/cabinet";

interface Props {
  cabinet: Cabinet;
  position: CabinetCashPosition;
}

const TONE_BADGE: Record<string, string> = {
  ok: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  warn: "text-amber-600 dark:text-amber-400 border-amber-500/30",
  danger: "text-red-600 dark:text-red-400 border-red-500/30",
};

export function ConcentrationRiskCard({ cabinet, position }: Props) {
  const risk = useConcentrationRisk(position);
  const showFgvfo = cabinet.type === "individual" || cabinet.type === "fop";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold inline-flex items-center gap-2 flex-wrap">
          {risk.tone === "ok" ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className={cn(
              "w-4 h-4",
              risk.tone === "danger" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400",
            )} />
          )}
          Концентрація коштів
          <Badge variant="outline" size="sm" className={cn("text-[10px]", TONE_BADGE[risk.tone])}>
            {risk.topBank
              ? `${risk.topPercent}% у ${risk.topBank}`
              : "немає рахунків"}
          </Badge>
          {showFgvfo && risk.exceedFgvfoCount > 0 && (
            <Badge
              variant="outline"
              size="sm"
              className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30"
            >
              ФГВФО: {risk.exceedFgvfoCount}{" "}
              {risk.exceedFgvfoCount === 1 ? "банк понад 600 тис" : "банки понад 600 тис"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 space-y-2">
        {risk.buckets.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">Немає підключених рахунків.</div>
        ) : (
          risk.buckets.map((b) => (
            <div key={b.bankShort} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium truncate">{b.bankShort}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatCurrency(b.amountUah)} ·{" "}
                  <span className="font-medium text-foreground">{b.percent}%</span>
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    b.percent >= 70 ? "bg-amber-500" : "bg-primary",
                    b.percent >= 85 && "bg-red-500",
                  )}
                  style={{ width: `${b.percent}%` }}
                />
              </div>
              {showFgvfo && b.exceedsFgvfo && (
                <div className="text-[10px] text-amber-700 dark:text-amber-400">
                  Перевищено ФГВФО-ліміт 600 тис ₴ — частина не покрита гарантією
                </div>
              )}
            </div>
          ))
        )}
        {risk.tone !== "ok" && (
          <div className="text-[11px] text-muted-foreground border-t pt-2 mt-2">
            Рекомендація: розподілити кошти між {risk.tone === "danger" ? "3+" : "2+"} банками
            для зниження ризику ліквідності.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
