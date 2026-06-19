import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  BarChart3,
  TableIcon,
  Sparkles,
  Loader2,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSortState } from "@/hooks/use-sort-state";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalyticsRow, ChartDataItem, MetricOption, AiAnalysis, ChartSeriesConfig } from "@/types/universalAnalyticsTypes";
import { ChartDrillDownSheet, type DrillDownPoint } from "./widgets/ChartDrillDownSheet";

interface UniversalAnalyticsPanelProps {
  rows: AnalyticsRow[];
  chartData?: ChartDataItem[];
  metricOptions?: MetricOption[];
  currentLabel?: string;
  previousLabel?: string;
  insightText?: string;
  onRequestAiAnalysis?: () => void;
  aiLoading?: boolean;
  aiAnalysis?: AiAnalysis | null;
  chartType?: "bar" | "line";
  loading?: boolean;
  /** Multi-series chart config — overrides default current/previous dual series */
  chartSeries?: ChartSeriesConfig[];
  /** Rows per page for table pagination (0 = no pagination) */
  pageSize?: number;
  /** External view mode control — when provided, hides internal toggle */
  externalViewMode?: "table" | "chart";
  /** When false (default), hides "previous"/Δ columns and the dual-series baseline in chart. */
  compareEnabled?: boolean;
}

// ─── Formatters ─────────────────────────────────────────────
function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₴`;
  return `${v.toLocaleString("uk-UA")} ₴`;
}

function formatNumber(v: number): string {
  return v.toLocaleString("uk-UA");
}

function fmt(v: number, format: string) {
  return format === "currency" ? formatCurrency(v) : formatNumber(v);
}

function formatDelta(row: AnalyticsRow): string {
  if (row.direction === "stable") return "—";
  if (row.format === "number") {
    const sign = row.delta > 0 ? "+" : "";
    return `${sign}${row.delta}`;
  }
  if (row.previousValue === 0) {
    return row.delta > 0 ? "нові" : "—";
  }
  const sign = row.deltaPercent > 0 ? "+" : "";
  return `${sign}${row.deltaPercent}%`;
}

function getDeltaColor(row: AnalyticsRow): string {
  if (row.direction === "stable") return "text-muted-foreground";
  const isGood =
    (row.semantic === "positive-up" && row.direction === "up") ||
    (row.semantic === "negative-up" && row.direction === "down");
  const isBad =
    (row.semantic === "positive-up" && row.direction === "down") ||
    (row.semantic === "negative-up" && row.direction === "up");
  if (isGood) return "text-success";
  if (isBad) return "text-destructive";
  return "text-muted-foreground";
}

function DeltaIcon({ row }: { row: AnalyticsRow }) {
  if (row.direction === "stable") return <Minus className="w-3.5 h-3.5" />;
  if (row.direction === "up") return <ArrowUpRight className="w-3.5 h-3.5" />;
  return <ArrowDownRight className="w-3.5 h-3.5" />;
}

// Sort key type
type SortKey = "metric" | "current" | "previous" | "delta";

function getSortValue(row: AnalyticsRow, key: SortKey): number | string {
  switch (key) {
    case "metric": return row.metric;
    case "current": return row.currentValue;
    case "previous": return row.previousValue;
    case "delta": return row.deltaPercent;
  }
}

// ─── Animation variants ─────────────────────────────────────
const viewVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// ─── Component ──────────────────────────────────────────────
export const UniversalAnalyticsPanel = ({
  rows,
  chartData,
  metricOptions,
  currentLabel = "Поточний",
  previousLabel = "Попередній",
  insightText,
  onRequestAiAnalysis,
  aiLoading = false,
  aiAnalysis = null,
  chartType = "bar",
  loading = false,
  chartSeries,
  pageSize = 10,
  externalViewMode,
  compareEnabled = false,
}: UniversalAnalyticsPanelProps) => {
  const isMobile = useIsMobile();
  const [internalView, setInternalView] = useState<"table" | "chart">(externalViewMode ?? "table");
  // Sync to external view mode when it changes (Sidebar / AI / saved view).
  // Local toggle inside the panel still works; the sync re-aligns when the parent updates.
  useEffect(() => {
    if (externalViewMode && externalViewMode !== internalView) {
      setInternalView(externalViewMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalViewMode]);
  const view = internalView;
  const setView = setInternalView;
  const { sort, handleSort } = useSortState<SortKey>("metric");
  const [currentPage, setCurrentPage] = useState(1);
  const [drillDownPoint, setDrillDownPoint] = useState<DrillDownPoint | null>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const defaultSelected = useMemo(
    () => new Set(metricOptions ? metricOptions.filter((m) => m.defaultOn).map((m) => m.id) : rows.map((r) => r.id)),
    [metricOptions, rows],
  );
  const [selected, setSelected] = useState<Set<string>>(defaultSelected);

  const toggleMetric = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const aVal = getSortValue(a, sort.key);
      const bVal = getSortValue(b, sort.key);
      const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string, "uk") : (aVal as number) - (bVal as number);
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredRows, sort]);

  // Pagination
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
  const paginatedRows = pageSize > 0 ? sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sortedRows;

  // Reset page when filters change
  const filteredRowsLength = filteredRows.length;
  useMemo(() => { setCurrentPage(1); }, [filteredRowsLength]);

  // CSV export
  const handleExportCsv = useCallback(() => {
    const header = ["Показник", currentLabel, previousLabel, "Δ%"];
    const csvRows = sortedRows.map(r => [
      r.metric,
      r.currentValue.toString(),
      r.previousValue.toString(),
      r.deltaPercent.toString(),
    ]);
    const csv = [header, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedRows, currentLabel, previousLabel]);

  // Chart click handler for drill-down
  const handleChartClick = useCallback((data: any) => {
    if (!data?.activePayload?.[0]?.payload) return;
    const payload = data.activePayload[0].payload;
    const values = data.activePayload.map((p: any) => ({
      label: p.name || p.dataKey,
      value: p.value,
      format: "currency" as const,
    }));
    setDrillDownPoint({
      category: payload.category || "",
      values,
    });
    setDrillDownOpen(true);
  }, []);

  const filteredChart = useMemo(() => {
    if (!chartData) return [];
    // For multi-series charts, don't filter by metric selection
    if (chartSeries) return chartData;
    const categoryToId: Record<string, string> = {};
    rows.forEach((r) => { categoryToId[r.metric] = r.id; });
    return chartData.filter((d) => selected.has(categoryToId[d.category] || d.category));
  }, [chartData, selected, rows, chartSeries]);

  // Build format lookup for chart tooltip
  const categoryFormat = useMemo(() => {
    const map: Record<string, "currency" | "number"> = {};
    rows.forEach((r) => { map[r.metric] = r.format; });
    return map;
  }, [rows]);

  const showMetricPicker = metricOptions && metricOptions.length > 0;
  const isMultiSeries = !!chartSeries && chartSeries.length > 0;

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <Table>
          <TableSkeleton
            columns={
              compareEnabled
                ? [
                    { header: "Показник", width: "w-24" },
                    { header: currentLabel, width: "w-20", align: "right" },
                    { header: previousLabel, width: "w-20", align: "right" },
                    { header: "Δ", width: "w-16", align: "right" },
                  ]
                : [
                    { header: "Показник", width: "w-24" },
                    { header: currentLabel, width: "w-20", align: "right" },
                  ]
            }
            rows={4}
            compact
            showHeader
          />
        </Table>
      </div>
    );
  }

  // Multi-series chart tooltip formatter
  const multiSeriesTooltipFormatter = (value: number, name: string) => {
    const series = chartSeries?.find(s => s.key === name);
    return [formatCurrency(value), series?.label || name];
  };

  // Default dual-series tooltip formatter
  const dualSeriesTooltipFormatter = (value: number, name: string, props: any) => {
    const format = categoryFormat[props?.payload?.category] || "currency";
    return [fmt(value, format), name === "current" ? currentLabel : previousLabel];
  };

  const renderChart = () => {
    const tooltipStyle = {
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
    };

    // Dark mode: reduce grid lines
    const gridProps = {
      strokeDasharray: "3 3",
      className: "stroke-border",
      strokeOpacity: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? 0.3 : 0.6,
    };

    if (isMultiSeries) {
      // Multi-series mode
      if (chartType === "line") {
        return (
          <LineChart data={filteredChart}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="category" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={multiSeriesTooltipFormatter} />
            <Legend formatter={(value: string) => chartSeries!.find(s => s.key === value)?.label || value} />
            {chartSeries!.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.key}
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.strokeDasharray}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        );
      }
      return (
        <BarChart data={filteredChart} barGap={4}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="category" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={multiSeriesTooltipFormatter} />
          <Legend formatter={(value: string) => chartSeries!.find(s => s.key === value)?.label || value} />
          {chartSeries!.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.key} fill={s.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      );
    }

    // Default dual-series mode
    if (chartType === "line") {
      return (
        <LineChart data={filteredChart}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="category" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={dualSeriesTooltipFormatter} />
          <Legend formatter={(value: string) => (value === "current" ? currentLabel : previousLabel)} />
          <Line type="monotone" dataKey="current" name="current" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          {compareEnabled && (
            <Line type="monotone" dataKey="previous" name="previous" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 2 }} />
          )}
        </LineChart>
      );
    }
    return (
      <BarChart data={filteredChart} barGap={4}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="category" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={dualSeriesTooltipFormatter} />
        <Legend formatter={(value: string) => (value === "current" ? currentLabel : previousLabel)} />
        <Bar dataKey="current" name="current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        {compareEnabled && (
          <Bar dataKey="previous" name="previous" fill="hsl(var(--muted-foreground)/0.4)" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    );
  };

  return (
    <div className="space-y-3">
      {/* Metric picker */}
      {showMetricPicker && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {metricOptions!.map((m) => (
            <label key={m.id} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
              <Checkbox
                checked={selected.has(m.id)}
                onCheckedChange={() => toggleMetric(m.id)}
                className="h-3.5 w-3.5"
              />
              <span className={cn("transition-colors", selected.has(m.id) ? "text-foreground" : "text-muted-foreground")}>
                {m.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* View toggle + Export — always visible above Table/Chart */}
      {chartData && chartData.length > 0 && (
        <div className="flex items-center justify-between gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 text-xs"
            onClick={handleExportCsv}
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              onClick={() => setView("table")}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Таблиця
            </Button>
            <Button
              variant={view === "chart" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              onClick={() => setView("chart")}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Графік
            </Button>
          </div>
        </div>
      )}

      {/* Table / Mobile cards / Chart with animation */}
      <AnimatePresence mode="wait">
        {view === "table" ? (
          <motion.div key="table" variants={viewVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            {sortedRows.length === 0 ? (
              <TableEmptyState
                icon={Filter}
                title="Немає даних"
                description="Оберіть хоча б один показник для відображення"
              />
            ) : isMobile ? (
              /* Mobile card list */
              <div className="space-y-2">
                {paginatedRows.map((row) => (
                  <div key={row.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                    <div>
                      <p className="text-sm font-medium">{row.metric}</p>
                      {compareEnabled && (
                        <p className="text-xs text-muted-foreground">
                          {previousLabel}: {fmt(row.previousValue, row.format)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{fmt(row.currentValue, row.format)}</p>
                      {compareEnabled && (
                        <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", getDeltaColor(row))}>
                          <DeltaIcon row={row} />
                          {formatDelta(row)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop table with sorting */
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead compact className="cursor-pointer select-none group" onClick={() => handleSort("metric")}>
                      <span className="inline-flex items-center">
                        Показник
                        <SortIndicator active={sort.key === "metric"} direction={sort.key === "metric" ? sort.direction : null} />
                      </span>
                    </TableHead>
                    <TableHead compact numeric className="cursor-pointer select-none group" onClick={() => handleSort("current")}>
                      <span className="inline-flex items-center">
                        {currentLabel}
                        <SortIndicator active={sort.key === "current"} direction={sort.key === "current" ? sort.direction : null} />
                      </span>
                    </TableHead>
                    {compareEnabled && (
                      <>
                        <TableHead compact numeric className="cursor-pointer select-none group" onClick={() => handleSort("previous")}>
                          <span className="inline-flex items-center">
                            {previousLabel}
                            <SortIndicator active={sort.key === "previous"} direction={sort.key === "previous" ? sort.direction : null} />
                          </span>
                        </TableHead>
                        <TableHead compact numeric className="cursor-pointer select-none group" onClick={() => handleSort("delta")}>
                          <span className="inline-flex items-center">
                            Δ
                            <SortIndicator active={sort.key === "delta"} direction={sort.key === "delta" ? sort.direction : null} />
                          </span>
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell compact className="font-medium">{row.metric}</TableCell>
                      <TableCell compact numeric>{fmt(row.currentValue, row.format)}</TableCell>
                      {compareEnabled && (
                        <>
                          <TableCell compact numeric className="text-muted-foreground">
                            {fmt(row.previousValue, row.format)}
                          </TableCell>
                          <TableCell compact numeric>
                            <span className={cn("inline-flex items-center gap-0.5 font-medium", getDeltaColor(row))}>
                              <DeltaIcon row={row} />
                              {formatDelta(row)}
                            </span>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination controls */}
            {pageSize > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedRows.length)} з {sortedRows.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs tabular-nums px-1">{currentPage}/{totalPages}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Chart with drill-down on click */
          <motion.div key="chart" variants={viewVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="h-56 md:h-72 lg:h-80 cursor-pointer" onClick={handleChartClick}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Drill-Down Sheet */}
      <ChartDrillDownSheet point={drillDownPoint} open={drillDownOpen} onOpenChange={setDrillDownOpen} />

      {/* AI insight block */}
      {(insightText || onRequestAiAnalysis) && (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
          {insightText && (
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground leading-relaxed">{insightText}</p>
            </div>
          )}

          {aiAnalysis ? (
            <div className="space-y-2 pl-6">
              <p className="text-sm font-medium">{aiAnalysis.summary}</p>
              {aiAnalysis.highlights.length > 0 && (
                <ul className="text-sm text-muted-foreground space-y-0.5 list-disc pl-4">
                  {aiAnalysis.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
              {aiAnalysis.recommendation && (
                <p className="text-sm text-primary/90 italic">{aiAnalysis.recommendation}</p>
              )}
            </div>
          ) : onRequestAiAnalysis ? (
            <div className={cn(insightText ? "pl-6" : "")}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={onRequestAiAnalysis}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Детальніший AI-аналіз
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
