import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronDown, SlidersHorizontal, Zap, Save, Check, TableIcon, BarChart3, Lock, GitCompareArrows, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PeriodType } from "@/lib/analytics/periodFilter";
import { uk } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { getAllMetricConfigs, type MetricId } from "@/lib/analytics/metricSectionMatrix";

type Grouping = "month" | "week" | "day";

export type ViewMode = "table" | "chart";

export type AnalysisMode = "period" | "compare";

interface QueryBuilderBarProps {
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  customRange?: { from: Date; to: Date } | null;
  onCustomRangeChange?: (range: { from: Date; to: Date } | null) => void;
  proMode?: boolean;
  onProModeChange?: (v: boolean) => void;
  cabinetId?: string;
  viewMode?: ViewMode;
  onViewModeChange?: (v: ViewMode) => void;
  extraControls?: React.ReactNode;
  // Phase 3: MetricPicker
  selectedMetrics?: MetricId[];
  onMetricsChange?: (metrics: MetricId[]) => void;
  availableMetrics?: MetricId[];
  // Phase 3: AnalysisMode
  analysisMode?: AnalysisMode;
  onAnalysisModeChange?: (mode: AnalysisMode) => void;
}

const periodLabels: Record<PeriodType, string> = {
  today: "Сьогодні",
  week: "Тиждень",
  month: "Місяць",
  quarter: "Квартал",
  year: "Рік",
  custom: "Довільний",
};

const fmtDateShort = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

const groupingLabels: Record<Grouping, string> = { month: "За місяць", week: "За тиждень", day: "За днями" };

// ── MetricPicker (inline chips) ──

const MetricPicker = ({
  selectedMetrics,
  onMetricsChange,
  availableMetrics,
}: {
  selectedMetrics: MetricId[];
  onMetricsChange: (m: MetricId[]) => void;
  availableMetrics: MetricId[];
}) => {
  const allConfigs = getAllMetricConfigs();

  const toggle = (id: MetricId) => {
    if (!availableMetrics.includes(id)) return;
    if (selectedMetrics.includes(id)) {
      if (selectedMetrics.length <= 1) return; // at least one
      onMetricsChange(selectedMetrics.filter((m) => m !== id));
    } else {
      onMetricsChange([...selectedMetrics, id]);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">Метрики:</span>
        {allConfigs.map((cfg) => {
          const Icon = cfg.icon;
          const isAvailable = availableMetrics.includes(cfg.id);
          const isSelected = selectedMetrics.includes(cfg.id);

          if (!isAvailable) {
            return (
              <Tooltip key={cfg.id}>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground/50 cursor-not-allowed"
                    disabled
                  >
                    <Lock className="w-3 h-3" />
                    {cfg.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Підключіть джерело для доступу</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <button
              key={cfg.id}
              onClick={() => toggle(cfg.id)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                isSelected
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/60 bg-background text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

// ── AnalysisModeToggle ──

const AnalysisModeToggle = ({
  mode,
  onChange,
}: {
  mode: AnalysisMode;
  onChange: (m: AnalysisMode) => void;
}) => (
  <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
    <Button
      variant={mode === "period" ? "default" : "ghost"}
      size="sm"
      className="h-7 px-3 text-xs rounded-md gap-1"
      aria-pressed={mode === "period"}
      onClick={() => onChange("period")}
    >
      <CalendarDays className="w-3 h-3" />
      Період
    </Button>
    <Button
      variant={mode === "compare" ? "default" : "ghost"}
      size="sm"
      className="h-7 px-3 text-xs rounded-md gap-1"
      aria-pressed={mode === "compare"}
      onClick={() => onChange("compare")}
    >
      <GitCompareArrows className="w-3 h-3" />
      Порівняння
    </Button>
  </div>
);

// ── QuerySummaryRow ──

const QuerySummaryRow = ({
  selectedMetrics,
  period,
  viewMode,
  analysisMode,
}: {
  selectedMetrics: MetricId[];
  period: PeriodType;
  viewMode: ViewMode;
  analysisMode: AnalysisMode;
}) => {
  const allConfigs = getAllMetricConfigs();
  const labels = selectedMetrics
    .map((id) => allConfigs.find((c) => c.id === id)?.label)
    .filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground border-t border-border/30">
      <span className="font-medium text-foreground/70">{labels.join(" + ")}</span>
      <span>•</span>
      <span>{periodLabels[period]}</span>
      <span>•</span>
      <span>{viewMode === "chart" ? "Графік" : "Таблиця"}</span>
      {analysisMode === "compare" && (
        <>
          <span>•</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5">vs попередній</Badge>
        </>
      )}
    </div>
  );
};

export const QueryBuilderBar = ({
  period, onPeriodChange, customRange, onCustomRangeChange,
  proMode = false, onProModeChange, cabinetId,
  viewMode = "table", onViewModeChange, extraControls,
  selectedMetrics, onMetricsChange, availableMetrics,
  analysisMode = "period", onAnalysisModeChange,
}: QueryBuilderBarProps) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [grouping, setGrouping] = useState<Grouping>("month");
  const [saved, setSaved] = useState(false);

  const hasMetricPicker = selectedMetrics && onMetricsChange && availableMetrics;

  // Restore saved view on mount
  useEffect(() => {
    if (!cabinetId) return;
    try {
      const raw = localStorage.getItem(`analytics-view-${cabinetId}`);
      if (!raw) return;
      const view = JSON.parse(raw);
      if (view.period) onPeriodChange(view.period);
      if (view.proMode && onProModeChange) onProModeChange(true);
      if (view.grouping) setGrouping(view.grouping);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabinetId]);

  const handleSaveView = useCallback(() => {
    if (!cabinetId) return;
    const view = { period, proMode, grouping };
    localStorage.setItem(`analytics-view-${cabinetId}`, JSON.stringify(view));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [cabinetId, period, proMode, grouping]);

  const proToggle = onProModeChange ? (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
      <Button
        variant={!proMode ? "default" : "ghost"}
        size="sm"
        className="h-7 px-3 text-xs rounded-md"
        aria-pressed={!proMode}
        onClick={() => onProModeChange(false)}
      >
        Simple
      </Button>
      <Button
        variant={proMode ? "default" : "ghost"}
        size="sm"
        className="h-7 px-3 text-xs rounded-md gap-1"
        aria-pressed={proMode}
        onClick={() => onProModeChange(true)}
      >
        <Zap className="w-3 h-3" />
        Pro
      </Button>
    </div>
  ) : null;

  const proExtras = (
    <AnimatePresence>
      {proMode && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 flex-wrap pt-2 px-3 pb-2">
            <span className="text-xs text-muted-foreground">Групування:</span>
            <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              {(["month", "week", "day"] as Grouping[]).map((g) => (
                <Button
                  key={g}
                  variant={grouping === g ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2.5 text-[11px] rounded-md"
                  onClick={() => setGrouping(g)}
                >
                  {groupingLabels[g]}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const periodSelector = (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
            <CalendarIcon className="w-3.5 h-3.5" />
            {periodLabels[period]}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onPeriodChange("month")}>Місяць</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("quarter")}>Квартал</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("year")}>Рік</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("custom")}>Довільний період</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {period === "custom" && customRange && onCustomRangeChange && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                Від: {fmtDateShort(customRange.from)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange.from}
                onSelect={(d) => d && onCustomRangeChange({ ...customRange, from: d })}
                locale={uk}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">—</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                До: {fmtDateShort(customRange.to)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange.to}
                onSelect={(d) => d && onCustomRangeChange({ ...customRange, to: d })}
                locale={uk}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );

  // Mobile: compact summary row + bottom sheet
  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{periodLabels[period]}</span>
            {proMode && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 gap-0.5"><Zap className="w-2.5 h-2.5" />Pro</Badge>}
            {analysisMode === "compare" && (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-0.5">
                <GitCompareArrows className="w-2.5 h-2.5" />vs
              </Badge>
            )}
            {period === "custom" && customRange && (
              <span className="text-xs text-muted-foreground">
                {fmtDateShort(customRange.from)} — {fmtDateShort(customRange.to)}
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs min-h-[44px]" onClick={() => setDrawerOpen(true)}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Налаштувати
          </Button>
        </div>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Налаштування аналізу</DrawerTitle>
              <DrawerDescription>Оберіть метрики, період та режим аналітики</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-4">
              {/* MetricPicker in drawer */}
              {hasMetricPicker && (
                <div className="space-y-1">
                  <MetricPicker
                    selectedMetrics={selectedMetrics}
                    onMetricsChange={onMetricsChange}
                    availableMetrics={availableMetrics}
                  />
                </div>
              )}

              {/* AnalysisMode */}
              {onAnalysisModeChange && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Режим аналізу:</span>
                  <AnalysisModeToggle mode={analysisMode} onChange={onAnalysisModeChange} />
                </div>
              )}

              {periodSelector}
              {onViewModeChange && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Відображення:</span>
                  <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
                    <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" className="h-8 px-3 text-xs rounded-md gap-1 min-h-[44px]" onClick={() => onViewModeChange("table")}>
                      <TableIcon className="w-3.5 h-3.5" />Таблиця
                    </Button>
                    <Button variant={viewMode === "chart" ? "default" : "ghost"} size="sm" className="h-8 px-3 text-xs rounded-md gap-1 min-h-[44px]" onClick={() => onViewModeChange("chart")}>
                      <BarChart3 className="w-3.5 h-3.5" />Графік
                    </Button>
                  </div>
                </div>
              )}
              {extraControls}
              {proToggle}
              {proExtras}
              <div className="flex gap-2">
                <Button className="flex-1 min-h-[44px]" onClick={() => setDrawerOpen(false)}>Застосувати</Button>
                {cabinetId && (
                  <Button variant="outline" className="min-h-[44px] gap-1.5" onClick={handleSaveView}>
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: sticky bar
  return (
    <div className="sticky top-[88px] z-[5] space-y-0 rounded-lg bg-card border border-border/60 shadow-sm">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          {periodSelector}
          {onAnalysisModeChange && (
            <AnalysisModeToggle mode={analysisMode} onChange={onAnalysisModeChange} />
          )}
        </div>
        <div className="flex items-center gap-2">
          {extraControls}
          {onViewModeChange && (
            <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
              <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" className="h-7 px-2 gap-1 text-xs" onClick={() => onViewModeChange("table")}>
                <TableIcon className="w-3.5 h-3.5" />Таблиця
              </Button>
              <Button variant={viewMode === "chart" ? "secondary" : "ghost"} size="sm" className="h-7 px-2 gap-1 text-xs" onClick={() => onViewModeChange("chart")}>
                <BarChart3 className="w-3.5 h-3.5" />Графік
              </Button>
            </div>
          )}
          {proToggle}
          {cabinetId && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={handleSaveView}>
              {saved ? <Check className="w-3.5 h-3.5 text-success" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? "Збережено" : "Зберегти"}
            </Button>
          )}
        </div>
      </div>

      {/* MetricPicker row */}
      {hasMetricPicker && (
        <div className="px-3 pb-2">
          <MetricPicker
            selectedMetrics={selectedMetrics}
            onMetricsChange={onMetricsChange}
            availableMetrics={availableMetrics}
          />
        </div>
      )}

      {proExtras}

      {/* QuerySummaryRow */}
      {hasMetricPicker && (
        <QuerySummaryRow
          selectedMetrics={selectedMetrics}
          period={period}
          viewMode={viewMode}
          analysisMode={analysisMode}
        />
      )}
    </div>
  );
};
