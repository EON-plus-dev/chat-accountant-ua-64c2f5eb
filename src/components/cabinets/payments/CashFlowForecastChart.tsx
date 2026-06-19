/**
 * CashFlowForecastChart — area-chart прогнозу балансу 30 днів (Wave 3).
 * Згорнутий за замовчуванням (toggle-кнопка). При розгортанні — h-32 chart.
 * Якщо є касовий розрив — показуємо червоний бейдж зверху.
 */

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown, ChevronUp, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CashFlowForecast } from "@/hooks/useCashFlowForecast";

interface CashFlowForecastChartProps {
  forecast: CashFlowForecast;
  /** Початково розгорнутий — для випадку коли є gap. */
  defaultOpen?: boolean;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { date: string; balance: number; primaryEvent?: string; inflow: number; outflow: number } }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const date = parseISO(p.date);
  const net = p.inflow - p.outflow;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium text-foreground capitalize">
        {format(date, "d MMM, EEEE", { locale: uk })}
      </div>
      <div className={cn("tabular-nums font-semibold", p.balance < 0 ? "text-rose-600" : "text-foreground")}>
        Баланс: ₴{p.balance.toLocaleString("uk-UA")}
      </div>
      {net !== 0 && (
        <div className="text-muted-foreground tabular-nums">
          {net > 0 ? "+" : "−"}₴{Math.abs(net).toLocaleString("uk-UA")} за день
        </div>
      )}
      {p.primaryEvent && (
        <div className="mt-1 text-muted-foreground truncate max-w-[220px]">{p.primaryEvent}</div>
      )}
    </div>
  );
}

export function CashFlowForecastChart({ forecast, defaultOpen = false }: CashFlowForecastChartProps) {
  const [open, setOpen] = useState(defaultOpen || !!forecast.gapDate);
  const hasGap = !!forecast.gapDate && forecast.gapAmount !== null;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-accent/30 transition-colors text-left"
      >
        <TrendingUp className={cn("h-4 w-4 shrink-0", hasGap ? "text-rose-500" : "text-emerald-600")} />
        <span className="text-sm font-medium">Прогноз 30 днів</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          ₴{forecast.startingBalance.toLocaleString("uk-UA")} → ₴{forecast.endingBalance.toLocaleString("uk-UA")}
        </span>
        {hasGap && (
          <span className="order-last sm:order-none w-full sm:w-auto inline-flex items-center gap-1 rounded-md bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate">
              Касовий розрив {forecast.gapDate && format(parseISO(forecast.gapDate), "d MMM", { locale: uk })}: ₴{Math.abs(forecast.gapAmount!).toLocaleString("uk-UA")}
            </span>
          </span>
        )}
        <span className="ml-auto shrink-0">
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </span>
      </button>

      {open && (
        <div className="px-2 pb-2">
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.points} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cashflow-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(iso) => format(parseISO(iso), "d MMM", { locale: uk })}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval={6}
                />
                <YAxis
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeWidth={1} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.75}
                  fill="url(#cashflow-gradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-muted-foreground">
            <span>Сьогодні: ₴{forecast.startingBalance.toLocaleString("uk-UA")}</span>
            <span>Мін: ₴{forecast.minBalance.toLocaleString("uk-UA")}</span>
            <span>Через 30 днів: ₴{forecast.endingBalance.toLocaleString("uk-UA")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
