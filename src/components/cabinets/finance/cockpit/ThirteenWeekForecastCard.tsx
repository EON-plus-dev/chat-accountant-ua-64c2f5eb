/**
 * ThirteenWeekForecastCard — rolling 13-week cash forecast.
 *
 * Стандарт treasury-планування: 13 тижнів (квартал) денних точок, агрегованих у тижні.
 * Перевикористовуємо `useCashFlowForecast` (поки 30 днів), а решту тижнів
 * заповнюємо trend-проекцією на основі останніх рухомих середніх.
 */

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { useCashFlowForecast } from "@/hooks/useCashFlowForecast";
import { useCabinetAllPayments } from "@/hooks/useCabinetAllPayments";
import type { Cabinet } from "@/types/cabinet";
import type { CabinetCashPosition } from "@/hooks/useCabinetCashPosition";

interface Props {
  cabinet: Cabinet;
  position: CabinetCashPosition;
}

interface WeekPoint {
  weekIdx: number; // 1..13
  label: string;
  balance: number;
  inflow: number;
  outflow: number;
  isProjected: boolean;
}

function isoWeekLabel(d: Date): string {
  const week = `W${Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86_400_000 + 1) / 7)}`;
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")} ${week}`;
}

export function ThirteenWeekForecastCard({ cabinet, position }: Props) {
  const payments = useCabinetAllPayments(cabinet);
  const forecast = useCashFlowForecast({
    payments,
    startingBalance: position.availableUah,
  });

  const weeks: WeekPoint[] = useMemo(() => {
    // Agg per 7-day buckets для перших ~30 днів
    const buckets: { in: number; out: number }[] = Array.from({ length: 13 }, () => ({ in: 0, out: 0 }));
    for (const pt of forecast.points) {
      const day = (new Date(pt.date).getTime() - new Date(forecast.points[0].date).getTime()) / 86_400_000;
      const wIdx = Math.min(12, Math.floor(day / 7));
      buckets[wIdx].in += pt.inflow;
      buckets[wIdx].out += pt.outflow;
    }
    // Avg in/out з реальних перших 4 тижнів (де є дані)
    const observed = buckets.slice(0, 4);
    const avgIn = observed.reduce((s, b) => s + b.in, 0) / observed.length || 0;
    const avgOut = observed.reduce((s, b) => s + b.out, 0) / observed.length || 0;

    const out: WeekPoint[] = [];
    let running = position.availableUah;
    const today = new Date();
    for (let i = 0; i < 13; i++) {
      const isProjected = i >= 4 || (buckets[i].in === 0 && buckets[i].out === 0);
      const inflow = isProjected ? Math.round(avgIn) : Math.round(buckets[i].in);
      const outflow = isProjected ? Math.round(avgOut) : Math.round(buckets[i].out);
      running = running + inflow - outflow;
      const weekStart = new Date(today.getTime() + i * 7 * 86_400_000);
      out.push({
        weekIdx: i + 1,
        label: isoWeekLabel(weekStart),
        balance: Math.round(running),
        inflow,
        outflow,
        isProjected,
      });
    }
    return out;
  }, [forecast, position.availableUah]);

  const balances = weeks.map((w) => w.balance);
  const minBalance = Math.min(...balances, position.availableUah);
  const endBalance = weeks[weeks.length - 1].balance;
  const minWeek = weeks.find((w) => w.balance === minBalance);
  const isCritical = minBalance < 0;

  // SVG line
  const W = 100;
  const H = 100;
  const allVals = [position.availableUah, ...balances];
  const max = Math.max(...allVals);
  const min = Math.min(...allVals, 0);
  const range = max - min || 1;
  const stepX = W / weeks.length;
  const yOf = (v: number) => H - ((v - min) / range) * H;
  const path = weeks
    .map((w, i) => `${i === 0 ? "M" : "L"}${(i * stepX + stepX / 2).toFixed(2)},${yOf(w.balance).toFixed(2)}`)
    .join(" ");
  const projectedPath = weeks
    .filter((w) => w.isProjected)
    .map((w, i, arr) => {
      const idx = weeks.indexOf(w);
      return `${i === 0 ? "M" : "L"}${(idx * stepX + stepX / 2).toFixed(2)},${yOf(w.balance).toFixed(2)}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold inline-flex items-center gap-2 flex-wrap">
          <CalendarClock className="w-4 h-4 text-muted-foreground" />
          Прогноз на 13 тижнів
          <span className="text-xs font-normal text-muted-foreground">
            · через 13 тиж.{" "}
            <span
              className={cn(
                "tabular-nums font-medium",
                endBalance >= position.availableUah
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground",
              )}
            >
              {formatCurrency(endBalance)}
            </span>
          </span>
          {isCritical && minWeek && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              · мінімум на тижні {minWeek.label.split(" ")[1]}: {formatCurrency(minBalance)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-32"
          role="img"
          aria-label="Прогноз на 13 тижнів"
        >
          {/* Zero line */}
          {min < 0 && (
            <line
              x1={0}
              y1={yOf(0)}
              x2={W}
              y2={yOf(0)}
              stroke="hsl(0, 72%, 51%)"
              strokeOpacity={0.4}
              strokeWidth={0.2}
              strokeDasharray="0.6"
            />
          )}
          {/* Confidence band (±15% від проектованих) */}
          <path
            d={
              weeks
                .map((w, i) => {
                  const yHi = yOf(w.balance + Math.abs(w.balance) * 0.15);
                  return `${i === 0 ? "M" : "L"}${(i * stepX + stepX / 2).toFixed(2)},${yHi.toFixed(2)}`;
                })
                .join(" ") +
              " " +
              weeks
                .slice()
                .reverse()
                .map((w, i) => {
                  const idx = weeks.length - 1 - i;
                  const yLo = yOf(w.balance - Math.abs(w.balance) * 0.15);
                  return `L${(idx * stepX + stepX / 2).toFixed(2)},${yLo.toFixed(2)}`;
                })
                .join(" ") +
              " Z"
            }
            fill="hsl(var(--primary))"
            fillOpacity={0.08}
          />
          {/* Main line */}
          <path
            d={path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={0.7}
          />
          {/* Bars: inflow/outflow */}
          {weeks.map((w, i) => {
            const cx = i * stepX + stepX / 2;
            const cyBalance = yOf(w.balance);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cyBalance}
                r={w.isProjected ? 0.5 : 0.9}
                fill="hsl(var(--primary))"
                opacity={w.isProjected ? 0.5 : 1}
              />
            );
          })}
        </svg>
        <div
          className="grid mt-1 text-[9px] text-muted-foreground"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((w) => (
            <div key={w.weekIdx} className="text-center truncate px-0.5">
              <div className="truncate" title={w.label}>
                {w.weekIdx}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground mt-2 pt-2 border-t">
          <span>● Факт (тижні 1–4)</span>
          <span className="opacity-60">○ Проекція ±15% (5–13)</span>
        </div>
      </CardContent>
    </Card>
  );
}
