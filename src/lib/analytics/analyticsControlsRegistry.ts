/**
 * Реєстр сетерів аналітики кабінету.
 *
 * `CabinetAnalyticsPage` під час mount реєструє свої setState-функції,
 * `ChatOrchestrator` (єдина точка входу AI) викликає `apply(args)`,
 * коли AI повертає tool_call `apply_analytics_filters`.
 */
import type { ApplyFiltersArgs } from "./aiToolSchemas";
import type { PeriodType, CompareBaseline } from "./periodFilter";
import type { MetricId } from "./metricSectionMatrix";
import type { ViewMode, AnalysisMode } from "@/components/cabinets/analytics/widgets/QueryBuilderBar";
import type { DisplayMode } from "./displayMode";
import { isDisplayMode } from "./displayMode";

export interface AnalyticsAiInsight {
  /** Стисле пояснення-інсайт від AI (1-2 речення). */
  message: string;
  /** Контекстний підпис (наприклад "Період: квартал · Метрики: дохід"). */
  context?: string;
  /** Підказки для подальших уточнень. */
  followUps?: string[];
  /** Унікальний токен — щоб banner з'являвся на КОЖНИЙ новий tool_call. */
  token: number;
}

export interface AnalyticsControls {
  setPeriod: (p: PeriodType) => void;
  setCustomRange: (r: { from: Date; to: Date } | null) => void;
  setExplorerViewMode: (v: ViewMode) => void;
  setExplorerActiveTab: (t: string) => void;
  setSelectedMetrics: (m: MetricId[]) => void;
  setAnalysisMode: (m: AnalysisMode) => void;
  setCompareBaseline: (b: CompareBaseline) => void;
  setCompareBaselineRange: (r: { from: Date; to: Date } | null) => void;
  setDisplayMode: (m: DisplayMode) => void;
  /** Скидає dismissed-стан AI insight banner (показується новий брифінг). */
  resetInsightDismissed: () => void;
  /** Записує AI-інсайт-повідомлення у banner. */
  setAiInsight?: (insight: AnalyticsAiInsight | null) => void;
}

let current: AnalyticsControls | null = null;

const VALID_PERIODS: PeriodType[] = ["today", "week", "month", "quarter", "year", "custom"];
const VALID_BASELINES: CompareBaseline[] = ["previous_period", "previous_year", "custom"];

/**
 * Автодетект DisplayMode за іншими полями виклику.
 * Працює лише якщо AI явно не передав displayMode.
 */
function inferDisplayMode(args: ApplyFiltersArgs): DisplayMode | null {
  const reasoning = (args.reasoning ?? "").toLowerCase();
  // Сигнальні слова в reasoning → спеціалізовані view
  if (/health\s?score|здоров['ʼ]?я|оцінк[аи]\s+кабінет/.test(reasoning)) return "score";
  if (/прогноз|runway|cash\s?flow|вистачить|залиш(ок|ку)/.test(reasoning)) return "forecast";

  // Спеціалізовані метрики
  const metrics = args.metrics ?? [];
  if (metrics.length === 1) {
    const single = metrics[0];
    if (single === "limits") return "gauge";
    if (single === "compliance" || single === "taxes") return "compliance";
  }
  // Compare режим
  if (args.analysisMode === "compare" || args.compareBaseline) {
    return "comparison";
  }
  // Одна метрика без compare → focus
  if (metrics.length === 1) return "focus";
  // Декілька метрик або без метрик → multi (overview)
  if (metrics.length > 1) return "multi";
  return null;
}

export const analyticsControlsRegistry = {
  register(controls: AnalyticsControls): () => void {
    current = controls;
    return () => {
      if (current === controls) current = null;
    };
  },
  isReady(): boolean {
    return current !== null;
  },
  apply(args: ApplyFiltersArgs): boolean {
    if (!current) return false;
    if (args.period && VALID_PERIODS.includes(args.period as PeriodType)) {
      current.setPeriod(args.period as PeriodType);
    }
    if (args.customRange) {
      current.setCustomRange({
        from: new Date(args.customRange.from),
        to: new Date(args.customRange.to),
      });
      // Якщо AI задає custom-діапазон, період повинен стати "custom",
      // щоб Sidebar і блок аналітики показували однаковий стан.
      if (!args.period) current.setPeriod("custom");
    }
    // Legacy mapping
    if (args.analysisMode === "today") current.setPeriod("today");
    else if (args.analysisMode === "compare") current.setAnalysisMode("compare");
    else if (args.analysisMode === "period") current.setAnalysisMode("period");

    if (args.compareBaseline && VALID_BASELINES.includes(args.compareBaseline as CompareBaseline)) {
      current.setCompareBaseline(args.compareBaseline as CompareBaseline);
      // Якщо AI явно вказав baseline → це implicitly означає "compare on"
      current.setAnalysisMode("compare");
    }
    if (args.compareBaselineRange) {
      current.setCompareBaselineRange({
        from: new Date(args.compareBaselineRange.from),
        to: new Date(args.compareBaselineRange.to),
      });
    }
    if (args.viewMode) current.setExplorerViewMode(args.viewMode);
    if (args.activeTab) current.setExplorerActiveTab(args.activeTab);
    if (args.metrics && args.metrics.length > 0) {
      current.setSelectedMetrics(args.metrics as MetricId[]);
    }

    // ── DisplayMode: явне значення від AI має пріоритет, інакше автодетект ──
    const explicit = isDisplayMode(args.displayMode) ? args.displayMode : null;
    const inferred = explicit ?? inferDisplayMode(args);
    if (inferred) {
      current.setDisplayMode(inferred);
    }

    // Записуємо AI-інсайт banner (якщо AI передав reasoning)
    if (args.reasoning && current.setAiInsight) {
      current.setAiInsight({
        message: args.reasoning,
        context: buildInsightContext(args, inferred),
        followUps: buildFollowUps(args, inferred),
        token: Date.now(),
      });
    }

    // Скидаємо dismissed щоб banner показався з новим інсайтом
    current.resetInsightDismissed();
    return true;
  },
};

function buildInsightContext(args: ApplyFiltersArgs, mode: DisplayMode | null): string {
  const parts: string[] = [];
  if (args.period) parts.push(`період: ${args.period}`);
  if (args.metrics && args.metrics.length > 0) {
    parts.push(`метрики: ${args.metrics.slice(0, 3).join(", ")}`);
  }
  if (mode && mode !== "multi") parts.push(`вигляд: ${mode}`);
  return parts.join(" · ");
}

function buildFollowUps(args: ApplyFiltersArgs, mode: DisplayMode | null): string[] {
  if (mode === "forecast") return ["Що буде через 30 днів?", "Покажи песимістичний сценарій"];
  if (mode === "score") return ["Як підвищити score?", "Які слабкі pillar?"];
  if (mode === "gauge") return ["Коли я перевищу ліміт?", "Чи перейти на 3 групу?"];
  if (mode === "compliance") return ["Які найближчі дедлайни?", "Що зробити сьогодні?"];
  if (mode === "comparison" || args.analysisMode === "compare") {
    return ["А порівняй з минулим роком", "Чому така різниця?"];
  }
  return ["Поясни детальніше", "Запропонуй наступну дію"];
}
