/**
 * CashPositionHero — Net-баланс, Δ, sparkline, стек-бар + 3 види балансу (Book / Available / Pending).
 *
 * Owner-стан правди «Залишок коштів» (`useCabinetCashPosition`).
 */

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Database,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CabinetCashPosition } from "@/hooks/useCabinetCashPosition";

interface CashPositionHeroProps {
  position: CabinetCashPosition;
}

const SLICE_COLOR: Record<string, string> = {
  bank_uah: "bg-primary",
  bank_fx: "bg-sky-500",
  cash_prro: "bg-amber-500",
};

function Sparkline({ data }: { data: number[] }) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 220;
    const h = 40;
    const step = w / (data.length - 1);
    return data
      .map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg viewBox="0 0 220 40" className="w-full h-10" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-primary/70" />
    </svg>
  );
}

function formatAsOf(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.round(diffMs / 60_000));
  if (min < 60) return `${min} хв тому`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} год тому`;
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CashPositionHero({ position }: CashPositionHeroProps) {
  const totalBreakdown = position.breakdown.reduce((s, b) => s + b.amountUah, 0) || 1;
  const isPositive = position.delta7dUah >= 0;
  const stale = position.hasStaleAccounts;

  return (
    <TooltipProvider delayDuration={200}>
      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          {/* Row: title + chips */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Залишок коштів</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {position.sources.map((s) => (
                <div
                  key={s.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/50 text-xs font-medium text-muted-foreground"
                >
                  <Database className="w-3 h-3" />
                  <span>
                    {s.label} · {s.itemsCount}
                  </span>
                </div>
              ))}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/50 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Станом на {formatAsOf(position.asOf)}</span>
              </div>
              {/* FX chip — заявляємо джерело курсів */}
              {position.breakdown.some((b) => b.id === "bank_fx") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/50 text-xs text-muted-foreground cursor-default">
                      <Info className="w-3 h-3" />
                      <span>{position.fx.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="text-xs space-y-0.5">
                      <div>USD {position.fx.rates.USD.toFixed(2)} ₴</div>
                      <div>EUR {position.fx.rates.EUR.toFixed(2)} ₴</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              {/* Stale warning */}
              {stale && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-medium text-amber-700 dark:text-amber-400 cursor-default">
                      <AlertTriangle className="w-3 h-3" />
                      <span>
                        {position.staleAccountsCount}{" "}
                        {position.staleAccountsCount === 1 ? "рахунок застарів" : "рахунки застарілі"}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <span className="text-xs">
                      Дані не оновлювались більше 24 год — повторіть синк банку
                    </span>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Net + Δ + sparkline */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-end">
            <div>
              <div className="text-3xl md:text-4xl font-bold tabular-nums tracking-tight">
                {formatCurrency(position.totalUah)}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-sm flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-medium tabular-nums",
                    isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {isPositive ? "+" : "−"}
                  {formatNumber(Math.abs(position.delta7dUah))} ₴
                </span>
                <span className="text-muted-foreground text-xs">за 7д (факт)</span>
                <span className="text-muted-foreground text-xs">
                  · 30д{" "}
                  <span
                    className={cn(
                      "tabular-nums",
                      position.delta30dUah >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {position.delta30dUah >= 0 ? "+" : "−"}
                    {formatNumber(Math.abs(position.delta30dUah))} ₴
                  </span>
                </span>
              </div>
            </div>
            <div className="text-primary/70">
              <Sparkline data={position.sparklineUah} />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>14 днів тому</span>
                <span>сьогодні</span>
              </div>
            </div>
          </div>

          {/* 3 balances row: Облік / Доступно / В дорозі */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <BalanceCell
              label="Облік"
              tooltip="Залишок за випискою банку та готівка"
              value={position.totalUah}
              accent="default"
            />
            <BalanceCell
              label="Доступно"
              tooltip="Доступно зараз: облік мінус надіслані, але ще не списані платежі"
              value={position.availableUah}
              accent={position.availableUah < position.totalUah * 0.7 ? "warn" : "default"}
            />
            <BalanceCell
              label="В дорозі"
              tooltip="Платежі надіслані в банк, ще не списані — зменшують Доступно"
              value={position.pendingOutUah}
              accent={position.pendingOutUah > 0 ? "warn" : "muted"}
              isPending
            />
          </div>

          {/* Стек-бар */}
          {position.breakdown.length > 0 && (
            <div className="space-y-2">
              <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted">
                {position.breakdown.map((s) => (
                  <div
                    key={s.id}
                    className={cn("h-full", SLICE_COLOR[s.id] ?? "bg-muted-foreground")}
                    style={{ width: `${(s.amountUah / totalBreakdown) * 100}%` }}
                    title={`${s.label}: ${formatCurrency(s.amountUah)}`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {position.breakdown.map((s) => (
                  <div key={s.id} className="inline-flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        SLICE_COLOR[s.id] ?? "bg-muted-foreground",
                      )}
                    />
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium tabular-nums">{formatCurrency(s.amountUah)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function BalanceCell({
  label,
  tooltip,
  value,
  accent,
  isPending,
}: {
  label: string;
  tooltip: string;
  value: number;
  accent: "default" | "warn" | "muted";
  isPending?: boolean;
}) {
  const tone =
    accent === "warn"
      ? "text-amber-700 dark:text-amber-400"
      : accent === "muted"
        ? "text-muted-foreground"
        : "text-foreground";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 cursor-default">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1">
            {label}
            <Info className="w-2.5 h-2.5 opacity-60" />
          </div>
          <div className={cn("text-base font-semibold tabular-nums mt-0.5", tone)}>
            {isPending && value > 0 ? "−" : ""}
            {formatCurrency(Math.abs(value))}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span className="text-xs">{tooltip}</span>
      </TooltipContent>
    </Tooltip>
  );
}
