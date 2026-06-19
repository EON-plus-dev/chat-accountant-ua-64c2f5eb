/**
 * Карта релевантності між активною Focus-метрикою та елементами AI-довідки.
 *
 * Використовується в `AnalyticsAiBriefing`, щоб при перемиканні показника
 * (Income → Expenses → Taxes → ...) фільтрувати:
 *   - картки ризиків (`AnalyticsRisk`)
 *   - картки прогнозів (`ForecastItem`)
 *   - похідні рекомендації
 *
 * Матчинг — за **підрядком у `id`** ризику/прогнозу та за опційним полем `tags`
 * (якщо буде додане в конфіги). Це не вимагає переписування існуючих ризиків —
 * їхні id вже містять семантичні ключі (`risk_limit_*`, `risk_finance_*_cashflow_*`,
 * `risk_compliance_*_deadline_*` тощо).
 */

import type { MetricId } from "@/lib/analytics/metricSectionMatrix";
import type { AnalyticsRisk } from "@/types/analyticsTypes";
import type { ForecastItem } from "@/components/cabinets/analytics/widgets/ForecastChips";

/**
 * Семантичні токени, що повинні зустрічатися в `risk.id` (lowercase, через `_` або `-`),
 * щоб ризик вважався релевантним для метрики.
 */
const METRIC_RISK_TOKENS: Record<MetricId, string[]> = {
  income: ["income", "revenue", "uncategor", "client", "limit", "cashflow", "receivable"],
  expenses: ["expense", "category", "uncategor", "burn", "discrepancy"],
  net: ["margin", "profit", "cashflow", "expense_growth", "receivable", "burn"],
  taxes: ["tax", "deadline", "ep_", "ep-", "esv", "vz_", "pdfo", "declaration", "report", "compliance"],
  limits: ["limit", "fop", "vat", "threshold"],
  salaries: ["payroll", "salary", "esv", "employee"],
  compliance: ["compliance", "deadline", "declaration", "report", "unsigned", "doc", "statement"],
  transactions: ["uncategor", "discrepancy", "statement", "sync"],
  documents: ["doc", "unsigned", "statement", "report"],
  access: ["sync", "integration", "dia", "access"],
};

/**
 * Семантичні токени для прогнозів (`ForecastItem.id` або `label`).
 */
const METRIC_FORECAST_TOKENS: Record<MetricId, string[]> = {
  income: ["income", "revenue", "cashflow"],
  expenses: ["expense", "burn", "cashflow"],
  net: ["net", "profit", "margin", "cashflow", "runway"],
  taxes: ["tax", "ep", "esv", "vz", "pdfo"],
  limits: ["limit", "vat", "threshold", "eta"],
  salaries: ["payroll", "salary"],
  compliance: ["deadline", "declaration", "report"],
  transactions: ["transaction", "ops"],
  documents: ["doc", "report"],
  access: [],
};

function matchesAny(haystack: string, needles: string[]): boolean {
  if (!haystack) return false;
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n));
}

function riskMatchesMetric(risk: AnalyticsRisk, metric: MetricId): boolean {
  const tokens = METRIC_RISK_TOKENS[metric] ?? [];
  if (tokens.length === 0) return true;
  // 1. id (основне джерело — id-ризиків самі по собі семантичні)
  if (matchesAny(risk.id, tokens)) return true;
  // 2. опційні tags (для майбутньої точкової атрибуції)
  const tags = (risk as AnalyticsRisk & { tags?: string[] }).tags;
  if (Array.isArray(tags) && tags.some((t) => matchesAny(t, tokens))) return true;
  // 3. fallback — title/text (на випадок україномовних збігів типу «ліміт»/«податк»)
  return matchesAny(`${risk.title ?? ""} ${risk.text ?? ""}`, tokens);
}

function forecastMatchesMetric(forecast: ForecastItem, metric: MetricId): boolean {
  const tokens = METRIC_FORECAST_TOKENS[metric] ?? [];
  if (tokens.length === 0) return true;
  if (matchesAny(forecast.id, tokens)) return true;
  return matchesAny(forecast.label, tokens);
}

/**
 * Відфільтрувати ризики під активну метрику.
 * Якщо нічого не співпало, лишаємо топ-1 critical (щоб користувач бачив
 * системну загрозу навіть на «нерелевантній» метриці).
 */
/**
 * Метрики, для яких НЕ застосовуємо fallback на «топ-1 critical»:
 * якщо специфічних ризиків нема — секція «Проблеми/Рішення» просто не рендериться.
 * Інакше «Операції без категорії» (data-ризик) показується під «Лімітами»/«Зарплатами»,
 * де він не релевантний.
 */
const METRICS_WITHOUT_RISK_FALLBACK: ReadonlySet<MetricId> = new Set<MetricId>([
  "limits",
  "compliance",
  "salaries",
]);

export function filterRisksForMetric(
  risks: AnalyticsRisk[],
  metric: MetricId | null | undefined,
): AnalyticsRisk[] {
  if (!metric) return risks;
  const matched = risks.filter((r) => riskMatchesMetric(r, metric));
  if (matched.length > 0) return matched;
  if (METRICS_WITHOUT_RISK_FALLBACK.has(metric)) return [];
  const topCritical = risks.find((r) => r.severity === "critical");
  return topCritical ? [topCritical] : [];
}

/**
 * Відфільтрувати прогнози під активну метрику.
 * Якщо нічого не співпало — повертаємо `forecast-cashflow` як універсальний
 * (cashflow доречний для будь-якої фінансової метрики), або порожній масив.
 */
/**
 * Метрики, для яких НЕ застосовуємо універсальний fallback `forecast-cashflow`:
 * для них cashflow не релевантний (напр., «Ліміти» вже мають власний прогноз ETA
 * у Gauge/LimitRunway, а cashflow тут лише дублював би/розфокусовував).
 */
const METRICS_WITHOUT_FORECAST_FALLBACK: ReadonlySet<MetricId> = new Set<MetricId>([
  "limits",
]);

export function filterForecastsForMetric(
  forecasts: ForecastItem[],
  metric: MetricId | null | undefined,
): ForecastItem[] {
  if (!metric) return forecasts;
  const matched = forecasts.filter((f) => forecastMatchesMetric(f, metric));
  if (matched.length > 0) return matched;
  if (METRICS_WITHOUT_FORECAST_FALLBACK.has(metric)) return [];
  const cashflow = forecasts.find((f) =>
    matchesAny(`${f.id} ${f.label}`, ["cashflow", "cash-flow"]),
  );
  return cashflow ? [cashflow] : [];
}
