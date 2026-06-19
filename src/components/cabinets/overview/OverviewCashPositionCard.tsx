/**
 * OverviewCashPositionCard — компактна картка «Залишок коштів» у розділі Огляд.
 *
 * Бере дані з єдиного owner-хука `useCabinetCashPosition` (той самий, що в Фінансах).
 * Клік або кнопка → перехід в Операції → Фінанси.
 */

import { Wallet, ArrowRight, TrendingUp, TrendingDown, Clock, AlertTriangle, Plug } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { useCabinetCashPosition } from "@/hooks/useCabinetCashPosition";
import type { Cabinet } from "@/types/cabinet";

interface Props {
  cabinet: Cabinet;
  onOpenFinance?: () => void;
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 160;
  const h = 36;
  const step = w / (data.length - 1);
  const path = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 160 36" className="w-full max-w-[160px] h-9 text-primary/70" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

function formatAsOf(iso: string): string {
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 60) return `${min} хв тому`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} год тому`;
  return new Date(iso).toLocaleDateString("uk-UA");
}

export function OverviewCashPositionCard({ cabinet, onOpenFinance }: Props) {
  const position = useCabinetCashPosition(cabinet);
  const hasAny = position.bankAccounts.length > 0 || position.prroCashboxes.length > 0;
  const cash = position.breakdown.find((b) => b.id === "cash_prro");
  const isPositive = position.delta7dUah >= 0;

  if (!hasAny) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Plug className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold">Залишок коштів</div>
              <div className="text-xs text-muted-foreground">
                Підключіть банк або касу, щоб побачити сукупний залишок
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={onOpenFinance}>
            До розділу Фінанси <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:border-primary/40 transition-colors"
      role="button"
      tabIndex={0}
      onClick={onOpenFinance}
      onKeyDown={(e) => e.key === "Enter" && onOpenFinance?.()}
    >
      <CardContent className="p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-5 items-center">
          {/* Left: number + breakdown */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Wallet className="w-3.5 h-3.5" />
              <span className="font-medium">Залишок коштів</span>
              <span className="inline-flex items-center gap-1 normal-case tracking-normal text-[11px] text-muted-foreground/80">
                <Clock className="w-3 h-3" />
                Станом на {formatAsOf(position.asOf)}
              </span>
              {position.hasStaleAccounts && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-medium text-amber-700 dark:text-amber-400 normal-case tracking-normal">
                  <AlertTriangle className="w-3 h-3" />
                  {position.staleAccountsCount} застаріло
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight">
                {formatCurrency(position.totalUah)}
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? "+" : "−"}
                {formatNumber(Math.abs(position.delta7dUah))} ₴
                <span className="text-muted-foreground font-normal text-xs">за 7д</span>
              </span>
            </div>
            <div className="text-xs text-muted-foreground tabular-nums">
              Доступно <span className="text-foreground font-medium">{formatCurrency(position.availableUah)}</span>
              {position.pendingOutUah > 0 && (
                <>
                  {" · "}В дорозі{" "}
                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                    −{formatCurrency(position.pendingOutUah)}
                  </span>
                </>
              )}
              {cash && cash.amountUah > 0 && (
                <>
                  {" · "}Готівка <span className="text-foreground font-medium">{formatCurrency(cash.amountUah)}</span>
                </>
              )}
            </div>
          </div>

          {/* Right: sparkline + CTA */}
          <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-2 w-full md:w-auto">
            <Sparkline data={position.sparklineUah} />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-primary shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFinance?.();
              }}
            >
              До Фінансів <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
