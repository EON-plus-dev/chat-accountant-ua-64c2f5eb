/**
 * DisplayMode — як саме рендерити центральну зону аналітики кабінету.
 *
 * - "multi"      — стандартний overview (KPI strip + Explorer tabs).
 * - "focus"      — глибокий аналіз однієї метрики (FocusMetricView).
 * - "comparison" — синонім multi з analysisMode="compare" (для AI зручності).
 * - "gauge"      — спеціалізована панель лімітів.
 * - "compliance" — checklist податкових/звітних статусів.
 * - "forecast"   — cash-flow прогноз + runway.
 * - "score"      — Health Score дашборд з pillar-ами.
 */
export type DisplayMode =
  | "multi"
  | "focus"
  | "comparison"
  | "gauge"
  | "compliance"
  | "forecast"
  | "score";

export const DISPLAY_MODES: DisplayMode[] = [
  "multi",
  "focus",
  "comparison",
  "gauge",
  "compliance",
  "forecast",
  "score",
];

export function isDisplayMode(value: unknown): value is DisplayMode {
  return typeof value === "string" && (DISPLAY_MODES as string[]).includes(value);
}

/**
 * Дефолтний DisplayMode для конкретної метрики при кліку у sidebar.
 *
 * УНІФІКОВАНО: усі метрики відкриваються у Focus-режимі
 * (Hero + 4 KPI + Chart/Table + AI insight + follow-ups + контекстні mini-блоки).
 *
 * Спеціалізовані режими (gauge/compliance/forecast/score) лишаються доступними
 * через явний перемикач у sidebar або AI tool_call, але більше не нав'язуються
 * як «default для метрики».
 */
export function getDefaultModeForMetric(_metricId: string): DisplayMode {
  return "focus";
}

/**
 * Альтернативні display modes, доступні для конкретної метрики
 * (показуються як чипи у sidebar під назвою метрики).
 */
export function getAlternativeModesForMetric(metricId: string): DisplayMode[] {
  const alts: DisplayMode[] = [];
  if (metricId === "limits") alts.push("gauge");
  if (metricId === "taxes" || metricId === "compliance") alts.push("compliance");
  // Прогноз більше не є окремим Focus-режимом — він є частиною AI-довідки
  // (блок «Деталі» в AnalyticsAiBriefing) і не дублюється в sidebar.
  return alts;
}

/**
 * Дефолтний тип графіка для hero-чарта Focus-канвасу.
 * - area для income/net (трендові, накопичувальні)
 * - bar для решти (дискретні події)
 */
export function getDefaultChartTypeForMetric(metricId: string): "area" | "bar" {
  if (metricId === "income" || metricId === "net") return "area";
  return "bar";
}
