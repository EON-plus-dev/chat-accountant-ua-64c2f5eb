/**
 * CashFlowWaterfallCard — bridge від Opening Balance до Closing за період.
 *
 * Стандартний CFO-графік: Opening + AR + Other in − AP − Payroll − Taxes = Closing.
 * Реалізовано власним SVG для повного контролю над totals/positive/negative bars.
 */

import { useMemo, useState } from "react";
import { GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { useCashFlowBridge, type WaterfallBar } from "@/hooks/useCashFlowBridge";
import type { Cabinet } from "@/types/cabinet";

interface Props {
  cabinet: Cabinet;
  openingBalance: number;
}

const PERIODS = [
  { id: "30" as const, label: "30 днів" },
  { id: "90" as const, label: "Квартал" },
];

interface BarRect {
  bar: WaterfallBar;
  x: number;
  y: number;
  height: number;
  isPositive: boolean;
}

export function CashFlowWaterfallCard({ cabinet, openingBalance }: Props) {
  const [period, setPeriod] = useState<"30" | "90">("30");
  const bridge = useCashFlowBridge(cabinet, openingBalance, parseInt(period, 10));

  const { rects, max, baselineY, height, width, barW, gap } = useMemo(() => {
    const W = 100;
    const H = 100;
    const PADDING_TOP = 10;
    const PADDING_BOTTOM = 18;
    const barCount = bridge.bars.length;
    const gap = 2;
    const barW = (W - gap * (barCount + 1)) / barCount;

    // Compute running balance to position relative bars
    let running = 0;
    const positions: { start: number; end: number }[] = [];
    for (const b of bridge.bars) {
      if (b.kind === "total") {
        positions.push({ start: 0, end: b.amount });
        running = b.amount;
      } else {
        const start = running;
        const end = running + b.amount;
        positions.push({ start, end });
        running = end;
      }
    }
    const allVals = positions.flatMap((p) => [p.start, p.end]);
    const max = Math.max(...allVals, 1);
    const min = Math.min(...allVals, 0);
    const range = max - min || 1;

    const usableH = H - PADDING_TOP - PADDING_BOTTOM;
    const baselineY = PADDING_TOP + ((max - 0) / range) * usableH;

    const rects: BarRect[] = bridge.bars.map((b, i) => {
      const p = positions[i];
      const x = gap + i * (barW + gap);
      const top = PADDING_TOP + ((max - Math.max(p.start, p.end)) / range) * usableH;
      const barHeight = (Math.abs(p.end - p.start) / range) * usableH || 1;
      const isPositive = b.kind === "total" ? true : p.end > p.start;
      return { bar: b, x, y: top, height: barHeight, isPositive };
    });

    return { rects, max, baselineY, height: H, width: W, barW, gap };
  }, [bridge]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-sm font-semibold inline-flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            Рух коштів за період
            <span className="text-xs font-normal text-muted-foreground">
              · Сальдо{" "}
              <span
                className={cn(
                  "tabular-nums font-medium",
                  bridge.net >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {bridge.net >= 0 ? "+" : "−"}
                {formatCurrency(Math.abs(bridge.net))}
              </span>
            </span>
          </CardTitle>
          <ToggleGroup
            type="single"
            size="sm"
            value={period}
            onValueChange={(v) => v && setPeriod(v as "30" | "90")}
          >
            {PERIODS.map((p) => (
              <ToggleGroupItem key={p.id} value={p.id} className="h-6 text-[11px] px-2">
                {p.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="w-full h-44"
            role="img"
            aria-label="Каскад руху коштів"
          >
            {/* baseline */}
            <line
              x1={0}
              y1={baselineY}
              x2={width}
              y2={baselineY}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={0.2}
            />
            {rects.map(({ bar, x, y, height: h, isPositive }) => {
              const fill =
                bar.kind === "total"
                  ? "hsl(var(--primary))"
                  : isPositive
                    ? "hsl(142, 71%, 45%)"
                    : "hsl(0, 72%, 51%)";
              return (
                <g key={bar.id}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={fill}
                    opacity={bar.kind === "total" ? 0.9 : 0.78}
                    rx={0.4}
                  />
                </g>
              );
            })}
          </svg>
          {/* Labels grid (HTML, not SVG, for crisp text) */}
          <div
            className="grid mt-1 text-[10px] text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${bridge.bars.length}, minmax(0, 1fr))` }}
          >
            {bridge.bars.map((b) => (
              <div key={b.id} className="text-center truncate px-0.5">
                <div className="truncate" title={b.label}>
                  {b.label}
                </div>
                <div
                  className={cn(
                    "tabular-nums font-medium",
                    b.kind === "total"
                      ? "text-foreground"
                      : b.amount >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                  )}
                >
                  {b.kind === "total"
                    ? formatCurrency(b.amount)
                    : `${b.amount >= 0 ? "+" : "−"}${formatCurrency(Math.abs(b.amount))}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
