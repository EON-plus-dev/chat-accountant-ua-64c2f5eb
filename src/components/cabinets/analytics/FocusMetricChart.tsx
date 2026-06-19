import { useMemo, useCallback, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
} from "recharts";
import { Download, Copy, ImageDown, Maximize2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { ChartDataItem } from "@/types/universalAnalyticsTypes";

interface FocusMetricChartProps {
  data: ChartDataItem[];
  /** Hex/HSL колір основної серії (поточний період). */
  color: string;
  chartType: "area" | "bar";
  currentLabel?: string;
  previousLabel?: string;
  /** Показувати другу серію (попередній період) у compare-режимі. */
  compareEnabled?: boolean;
  /** Назва метрики для CSV-експорту. */
  metricLabel: string;
  /** Символ валюти. За замовчуванням ₴ — для FOP/TOV/individual UA. */
  currencySymbol?: string;
}

/**
 * Hero-чарт Focus-канвасу.
 * - Smart Y-scale: якщо діапазон ≤10% від середнього — auto-domain (з info-іконкою).
 * - Last-point label: підпис останньої точки завжди видимий.
 * - Compare: dashed gray для baseline + Δ% поряд з mini-stats.
 * - Експорт: CSV / PNG (SVG) / Copy values.
 */
export const FocusMetricChart = ({
  data,
  color,
  chartType,
  currentLabel = "Поточний період",
  previousLabel = "Попередній період",
  compareEnabled = false,
  metricLabel,
  currencySymbol = "₴",
}: FocusMetricChartProps) => {
  const [zeroBased, setZeroBased] = useState(false);

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const cur = data.map((d) => Number(d.current) || 0);
    const prev = data.map((d) => Number(d.previous) || 0);
    const sum = cur.reduce((s, v) => s + v, 0);
    const avg = sum / cur.length;
    const max = Math.max(...cur);
    const min = Math.min(...cur);
    const prevSum = prev.reduce((s, v) => s + v, 0);
    const prevAvg = prevSum / Math.max(prev.length, 1);
    const sumDelta = prevSum > 0 ? ((sum - prevSum) / prevSum) * 100 : null;
    const avgDelta = prevAvg > 0 ? ((avg - prevAvg) / prevAvg) * 100 : null;
    return { avg, max, min, sum, prevSum, prevAvg, sumDelta, avgDelta };
  }, [data]);

  // Smart Y-scale: якщо (max-min)/avg ≤ 0.10 і не нуль → auto-domain
  const yDomainInfo = useMemo(() => {
    if (!stats || zeroBased) return { domain: undefined as [number | string, number | string] | undefined, suppressed: false };
    const range = stats.max - stats.min;
    const avgAbs = Math.abs(stats.avg);
    if (avgAbs > 0 && range / avgAbs <= 0.1 && stats.min > 0) {
      // auto-domain з padding 10%
      const pad = range > 0 ? range * 0.5 : avgAbs * 0.05;
      return { domain: [Math.max(0, stats.min - pad), stats.max + pad] as [number, number], suppressed: true };
    }
    return { domain: [0, "auto"] as [number, string], suppressed: false };
  }, [stats, zeroBased]);

  const formatShort = useCallback((v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}М`;
    if (abs >= 1_000) return `${Math.round(v / 1_000)}К`;
    return v.toLocaleString("uk-UA");
  }, []);

  const formatFull = useCallback(
    (v: number) => `${v.toLocaleString("uk-UA")} ${currencySymbol}`,
    [currencySymbol],
  );

  // ── Експорт-меню ──
  const handleExportCsv = useCallback(() => {
    if (!data || data.length === 0) return;
    const header = compareEnabled
      ? ["Період", currentLabel, previousLabel]
      : ["Період", currentLabel];
    const rows = data.map((d) =>
      compareEnabled
        ? [d.category, String(d.current), String(d.previous ?? "")]
        : [d.category, String(d.current)],
    );
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${metricLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV експортовано");
  }, [data, compareEnabled, currentLabel, previousLabel, metricLabel]);

  const handleCopyValues = useCallback(async () => {
    if (!data?.length) return;
    const text = data
      .map((d) =>
        compareEnabled
          ? `${d.category}\t${d.current}\t${d.previous ?? ""}`
          : `${d.category}\t${d.current}`,
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Значення скопійовано");
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  }, [data, compareEnabled]);

  const handleExportPng = useCallback(() => {
    // recharts рендерить SVG; знаходимо найближчий .recharts-wrapper svg і конвертуємо.
    const wrapper = document.querySelector(`[data-focus-chart-id="${metricLabel}"] svg`);
    if (!wrapper) {
      toast.error("Не вдалося знайти графік");
      return;
    }
    const svgClone = wrapper.cloneNode(true) as SVGElement;
    const xml = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = (wrapper as SVGElement).clientWidth * 2;
      canvas.height = (wrapper as SVGElement).clientHeight * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `analytics-${metricLabel}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("PNG збережено");
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [metricLabel]);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  };

  const tooltipFormatter = (value: number, name: string) => {
    const label = name === "current" ? currentLabel : previousLabel;
    return [formatFull(value), label];
  };

  // last-point label renderer — показуємо лише на останній точці
  const lastIdx = data.length - 1;
  const renderLastLabel = useCallback(
    (props: { x?: number; y?: number; index?: number; value?: number }) => {
      if (props.index !== lastIdx) return null;
      if (typeof props.x !== "number" || typeof props.y !== "number") return null;
      return (
        <text
          x={props.x}
          y={props.y - 8}
          fill={color}
          fontSize={11}
          fontWeight={600}
          textAnchor="middle"
        >
          {formatShort(props.value ?? 0)}
        </text>
      );
    },
    [lastIdx, color, formatShort],
  );

  // ── Δ% бейдж ──
  const deltaBadge = (delta: number | null) => {
    if (delta === null || !Number.isFinite(delta)) return null;
    const positive = delta >= 0;
    return (
      <span
        className={
          positive
            ? "text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
            : "text-[10px] font-medium text-rose-600 dark:text-rose-400"
        }
      >
        {positive ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
      </span>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Немає даних за обраний період.
      </div>
    );
  }

  return (
    <div data-focus-chart-id={metricLabel}>
      {/* Сповіщення «Y не з 0» — компактний рядок над чартом, без дубль-шапки. */}
      {(yDomainInfo.suppressed || zeroBased) && (
        <div className="flex items-center gap-2 px-4 pt-2 text-[10px] text-muted-foreground">
          {yDomainInfo.suppressed && (
            <TooltipProvider>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setZeroBased(true)}
                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
                    aria-label="Y-вісь не з нуля"
                  >
                    <Info className="w-3 h-3" />
                    Y не з 0
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                  Y-вісь не з 0 — діапазон значень малий. Натисніть, щоб увімкнути zero-baseline.
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          )}
          {zeroBased && (
            <button
              type="button"
              onClick={() => setZeroBased(false)}
              className="hover:text-foreground underline"
            >
              auto-scale
            </button>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="p-3 pb-2">
        <div className="h-[180px] md:h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 18, right: 24, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`focusFill-${metricLabel}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-border"
                  strokeOpacity={0.4}
                />
                <XAxis
                  dataKey="category"
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={formatShort}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  domain={yDomainInfo.domain}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
                {stats && (
                  <ReferenceLine
                    y={stats.avg}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2 4"
                    strokeOpacity={0.4}
                  />
                )}
                {compareEnabled && (
                  <Area
                    type="monotone"
                    dataKey="previous"
                    name="previous"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="transparent"
                    dot={false}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="current"
                  name="current"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#focusFill-${metricLabel})`}
                  dot={{ r: 3, fill: color }}
                  activeDot={{ r: 5 }}
                >
                  <LabelList dataKey="current" content={renderLastLabel as any} />
                </Area>
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 18, right: 12, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-border"
                  strokeOpacity={0.4}
                />
                <XAxis
                  dataKey="category"
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={formatShort}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  domain={yDomainInfo.domain}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
                {compareEnabled && (
                  <Bar
                    dataKey="previous"
                    name="previous"
                    fill="hsl(var(--muted-foreground) / 0.35)"
                    radius={[3, 3, 0, 0]}
                  />
                )}
                <Bar
                  dataKey="current"
                  name="current"
                  fill={color}
                  radius={[3, 3, 0, 0]}
                >
                  <LabelList dataKey="current" content={renderLastLabel as any} />
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini-stats з compare-aware Δ */}
      {stats && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-border/40 text-[11px] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Сер.:</span>
            <span className="font-medium tabular-nums">
              {formatShort(stats.avg)} {currencySymbol}
            </span>
            {compareEnabled && deltaBadge(stats.avgDelta)}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Макс:</span>
            <span className="font-medium tabular-nums">
              {formatShort(stats.max)} {currencySymbol}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Мін:</span>
            <span className="font-medium tabular-nums">
              {formatShort(stats.min)} {currencySymbol}
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-muted-foreground">Сума:</span>
            <span className="font-semibold tabular-nums">
              {formatShort(stats.sum)} {currencySymbol}
            </span>
            {compareEnabled && deltaBadge(stats.sumDelta)}
          </div>
        </div>
      )}

      {/* Compare legend */}
      {compareEnabled && (
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span>{currentLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-[2px] border-t-2 border-dashed border-muted-foreground" />
            <span>{previousLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="inline-block w-3 h-[2px] border-t-2 border-dotted border-muted-foreground/60" />
            <span>середнє</span>
          </div>
        </div>
      )}
    </div>
  );
};
