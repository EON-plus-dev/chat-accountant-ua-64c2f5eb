import {
  Lock,
  GitCompareArrows,
  CalendarRange,
  Layers,
  Eye,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { PeriodType, CompareBaseline } from "@/lib/analytics/periodFilter";
import { getAllMetricConfigs, type MetricId } from "@/lib/analytics/metricSectionMatrix";
import type { ViewMode, AnalysisMode } from "./widgets/QueryBuilderBar";
import type { DisplayMode } from "@/lib/analytics/displayMode";
import { getDefaultModeForMetric } from "@/lib/analytics/displayMode";
import { DateRangePopover } from "./widgets/DateRangePopover";

const PERIOD_PRESETS: Array<{ value: PeriodType; label: string; hint: string }> = [
  { value: "today", label: "Сьогодні", hint: "Поточний день (00:00 – 23:59)" },
  { value: "week", label: "Тиждень", hint: "Поточний тиждень (пн – нд)" },
  { value: "month", label: "Місяць", hint: "Поточний календарний місяць" },
  { value: "quarter", label: "Квартал", hint: "Поточний календарний квартал" },
  { value: "year", label: "Рік", hint: "Поточний календарний рік" },
  { value: "custom", label: "Довільний…", hint: "Власний діапазон дат" },
];

const BASELINE_OPTIONS: Array<{ value: CompareBaseline; label: string; hint: string }> = [
  { value: "previous_period", label: "Попередній період", hint: "Період такої ж тривалості, що й обраний" },
  { value: "previous_year", label: "Той самий період торік", hint: "Зсув на 1 рік назад (year-over-year)" },
  { value: "custom", label: "Власний період", hint: "Самостійно оберіть діапазон порівняння" },
];

interface AnalyticsSidebarProps {
  // Контекст
  cabinetId: string;
  extraControls?: React.ReactNode;

  // Період
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  customRange: { from: Date; to: Date } | null;
  onCustomRangeChange: (range: { from: Date; to: Date } | null) => void;

  // Порівняння
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  compareBaseline: CompareBaseline;
  onCompareBaselineChange: (b: CompareBaseline) => void;
  compareBaselineRange: { from: Date; to: Date } | null;
  onCompareBaselineRangeChange: (r: { from: Date; to: Date } | null) => void;
  comparisonPreviousLabel?: string;

  // Показники
  selectedMetrics: MetricId[];
  onMetricsChange: (metrics: MetricId[]) => void;
  availableMetrics: MetricId[];

  // Explorer
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;

  // Display mode (Огляд / Фокус)
  displayMode?: DisplayMode;
  onDisplayModeChange?: (m: DisplayMode) => void;
}

const SectionHeader = ({ icon: Icon, title, badge }: { icon: any; title: string; badge?: React.ReactNode }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <p className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
        {title}
      </p>
    </div>
    {badge}
  </div>
);

export const AnalyticsSidebar = ({
  cabinetId, extraControls,
  period, onPeriodChange, customRange, onCustomRangeChange,
  analysisMode, onAnalysisModeChange,
  compareBaseline, onCompareBaselineChange,
  compareBaselineRange, onCompareBaselineRangeChange,
  comparisonPreviousLabel,
  selectedMetrics, onMetricsChange, availableMetrics,
  viewMode, onViewModeChange,
  displayMode = "multi",
  onDisplayModeChange,
}: AnalyticsSidebarProps) => {
  const allConfigs = getAllMetricConfigs();
  const isCompare = analysisMode === "compare";
  // Canvas завжди single-metric — UI завжди як radio.

  const toggleMetric = (id: MetricId) => {
    if (!availableMetrics.includes(id)) return;
    // Default behavior: single-metric focus canvas. Вибір метрики в sidebar
    // означає "переключи canvas на цю метрику" і авто-роутить на дефолтний
    // mode (limits → gauge, taxes/compliance → compliance, інше → focus).
    // У режимі порівняння — лишаємо comparison; mode-роутинг робить PeriodModeView.
    onMetricsChange([id]);
    if (analysisMode !== "compare") {
      onDisplayModeChange?.(getDefaultModeForMetric(id));
    }
  };

  // (раніше тут був handleDisplayModeChange — режим тепер авто-роутиться)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-border/60 bg-card p-3 space-y-4">

        {/* ── 1. КОНТЕКСТ (лише за наявності extraControls) ── */}
        {extraControls && (
          <>
            <div className="space-y-2.5">
              <SectionHeader icon={Eye} title="Контекст" />
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">Перегляд</p>
                {extraControls}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Режим відображення (Огляд/Фокус) приховано — canvas завжди single-metric.
            Спеціалізовані view (gauge/compliance/forecast/score) активуються
            автоматично при виборі метрики або через AI tool_call. */}

        {/* ── 2. ПЕРІОД ── */}
        <div className="space-y-2">
          <SectionHeader icon={CalendarRange} title="Період" />

          <div className="grid grid-cols-2 gap-1">
            {PERIOD_PRESETS.map((preset) => {
              const isActive = period === preset.value;
              return (
                <Tooltip key={preset.value}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onPeriodChange(preset.value)}
                      className={cn(
                        "h-7 px-2 rounded-md text-xs font-medium transition-colors text-left truncate",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 text-foreground hover:bg-muted",
                      )}
                      aria-pressed={isActive}
                    >
                      {preset.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">{preset.hint}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {period === "custom" && (
            <div className="pt-1">
              <DateRangePopover
                value={customRange}
                onChange={onCustomRangeChange}
                placeholder="Оберіть діапазон…"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* ── 3. ПОРІВНЯННЯ ── */}
        <div className="space-y-2">
          <SectionHeader icon={GitCompareArrows} title="Порівняння" />

          <div className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5">
            <Label htmlFor="compare-toggle" className="text-xs cursor-pointer">
              Увімкнути порівняння
            </Label>
            <Switch
              id="compare-toggle"
              checked={isCompare}
              onCheckedChange={(v) => onAnalysisModeChange(v ? "compare" : "period")}
            />
          </div>

          {isCompare && (
            <div className="space-y-2 pl-1 pt-1">
              <p className="text-[11px] text-muted-foreground">Базова лінія</p>
              <RadioGroup
                value={compareBaseline}
                onValueChange={(v) => onCompareBaselineChange(v as CompareBaseline)}
                className="space-y-1"
              >
                {BASELINE_OPTIONS.map((opt) => (
                  <Tooltip key={opt.value}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={opt.value} id={`bl-${opt.value}`} className="h-3.5 w-3.5" />
                        <Label
                          htmlFor={`bl-${opt.value}`}
                          className="text-xs font-normal cursor-pointer flex-1"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs">{opt.hint}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </RadioGroup>

              {compareBaseline === "custom" && (
                <div className="pt-1">
                  <DateRangePopover
                    value={compareBaselineRange}
                    onChange={onCompareBaselineRangeChange}
                    placeholder="Період порівняння…"
                  />
                </div>
              )}

              {comparisonPreviousLabel && (
                <div className="text-[11px] text-muted-foreground bg-muted/30 rounded px-2 py-1.5 leading-snug">
                  vs <span className="font-medium text-foreground">{comparisonPreviousLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* ── 4. ПОКАЗНИКИ ── */}
        <div className="space-y-2">
          <SectionHeader icon={Layers} title="Показники" />
          <div className="space-y-0.5">
            {allConfigs.map((cfg) => {
              const Icon = cfg.icon;
              const isAvailable = availableMetrics.includes(cfg.id);
              const isSelected = selectedMetrics.includes(cfg.id);

              if (!isAvailable) {
                return (
                  <Tooltip key={cfg.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground/50 cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>{cfg.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs">Підключіть джерело для доступу</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <button
                  key={cfg.id}
                  onClick={() => toggleMetric(cfg.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted/50",
                  )}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-3.5 w-3.5 rounded-full border shrink-0 flex items-center justify-center",
                      isSelected ? "border-primary" : "border-muted-foreground/40",
                    )}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </span>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

