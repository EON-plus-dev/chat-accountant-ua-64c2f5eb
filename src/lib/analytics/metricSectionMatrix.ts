/**
 * Smart Analytics Block — Metric-to-Section mapping matrix.
 * Defines which UI sections, KPI fields, patterns, and view types
 * are active for each analytics metric.
 */

import {
  DollarSign, TrendingDown, Activity, ArrowLeftRight,
  Gauge, Receipt, Users, ShieldCheck, FileText, KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Core types ──

export type MetricId =
  | "income"
  | "expenses"
  | "net"
  | "transactions"
  | "limits"
  | "taxes"
  | "salaries"
  | "compliance"
  | "documents"
  | "access";

export type AnalyticsViewType = "trend" | "breakdown" | "list" | "score";

export type PatternType = "trend" | "volatility" | "seasonality" | "anomalies";

export interface MetricSectionConfig {
  id: MetricId;
  label: string;
  icon: LucideIcon;
  /** Brand colour (hex) for tabs/charts. Used as inline accent. */
  color: string;
  defaultViewType: AnalyticsViewType;
  // Active sections
  hasKpis: boolean;
  hasPatterns: boolean;
  hasDynamics: boolean;
  hasStructure: boolean;
  hasDrivers: boolean;
  hasForecast: boolean;
  // KPI fields for this metric
  kpiFields: string[];
  // Available pattern types
  patterns: PatternType[];
  // Minimum history (months) required for seasonality detection
  minHistoryForSeasonality: number;
}

// ── Matrix ──

const METRIC_SECTION_MAP: Record<MetricId, MetricSectionConfig> = {
  income: {
    id: "income",
    label: "Дохід",
    icon: DollarSign,
    color: "#22c55e",
    defaultViewType: "trend",
    hasKpis: true, hasPatterns: true, hasDynamics: true,
    hasStructure: true, hasDrivers: true, hasForecast: true,
    kpiFields: ["total", "delta", "avgDay", "txCount", "avgCheck"],
    patterns: ["trend", "volatility", "seasonality", "anomalies"],
    minHistoryForSeasonality: 12,
  },
  expenses: {
    id: "expenses",
    label: "Витрати",
    icon: TrendingDown,
    color: "#ef4444",
    defaultViewType: "trend",
    hasKpis: true, hasPatterns: true, hasDynamics: true,
    hasStructure: true, hasDrivers: true, hasForecast: true,
    kpiFields: ["total", "delta", "avgDay", "txCount", "avgCheck"],
    patterns: ["trend", "volatility", "anomalies"],
    minHistoryForSeasonality: 12,
  },
  net: {
    id: "net",
    label: "Чистий дохід",
    icon: Activity,
    color: "#3b82f6",
    defaultViewType: "trend",
    hasKpis: true, hasPatterns: true, hasDynamics: true,
    hasStructure: false, hasDrivers: true, hasForecast: true,
    kpiFields: ["net", "margin", "delta"],
    patterns: ["trend", "volatility"],
    minHistoryForSeasonality: 12,
  },
  transactions: {
    id: "transactions",
    label: "Транзакції",
    icon: ArrowLeftRight,
    color: "#8b5cf6",
    defaultViewType: "trend",
    hasKpis: true, hasPatterns: true, hasDynamics: true,
    hasStructure: true, hasDrivers: true, hasForecast: false,
    kpiFields: ["count", "totalSum", "avgCheck", "maxMin"],
    patterns: ["trend", "anomalies"],
    minHistoryForSeasonality: 12,
  },
  limits: {
    id: "limits",
    label: "Ліміти",
    icon: Gauge,
    color: "#f97316",
    defaultViewType: "trend",
    hasKpis: true, hasPatterns: true, hasDynamics: true,
    hasStructure: false, hasDrivers: true, hasForecast: true,
    kpiFields: ["usagePercent", "remaining", "daysToLimit", "deltaUsage"],
    patterns: ["trend"],
    minHistoryForSeasonality: 6,
  },
  taxes: {
    id: "taxes",
    label: "Податки",
    icon: Receipt,
    color: "#eab308",
    defaultViewType: "trend",
    hasKpis: true, hasPatterns: true, hasDynamics: true,
    hasStructure: true, hasDrivers: true, hasForecast: true,
    kpiFields: ["total", "ep", "esv", "delta"],
    patterns: ["trend"],
    minHistoryForSeasonality: 12,
  },
  salaries: {
    id: "salaries",
    label: "Зарплати",
    icon: Users,
    color: "#14b8a6",
    defaultViewType: "trend",
    hasKpis: true, hasPatterns: true, hasDynamics: true,
    hasStructure: true, hasDrivers: true, hasForecast: false,
    kpiFields: ["total", "count", "avg", "delta"],
    patterns: ["trend"],
    minHistoryForSeasonality: 12,
  },
  compliance: {
    id: "compliance",
    label: "Перевірки",
    icon: ShieldCheck,
    color: "#ec4899",
    defaultViewType: "list",
    hasKpis: true, hasPatterns: false, hasDynamics: false,
    hasStructure: true, hasDrivers: true, hasForecast: false,
    kpiFields: ["active", "completed", "planned", "progress"],
    patterns: [],
    minHistoryForSeasonality: 0,
  },
  documents: {
    id: "documents",
    label: "Документи",
    icon: FileText,
    color: "#64748b",
    defaultViewType: "score",
    hasKpis: true, hasPatterns: false, hasDynamics: false,
    hasStructure: true, hasDrivers: true, hasForecast: false,
    kpiFields: ["total", "filled", "pending", "fillRate"],
    patterns: [],
    minHistoryForSeasonality: 0,
  },
  access: {
    id: "access",
    label: "Доступи",
    icon: KeyRound,
    color: "#0ea5e9",
    defaultViewType: "list",
    hasKpis: true, hasPatterns: false, hasDynamics: false,
    hasStructure: true, hasDrivers: false, hasForecast: false,
    kpiFields: ["totalUsers", "active", "pending"],
    patterns: [],
    minHistoryForSeasonality: 0,
  },
};

// ── KPI / Dataset mapping ──

const METRIC_KPI_MAP: Record<MetricId, string[]> = {
  income: ["income", "revenue"],
  expenses: ["expenses", "total-expenses"],
  net: ["net-income", "cashflow", "profit-margin"],
  transactions: ["tx-count", "tx-avg-check"],
  limits: ["limit-usage"],
  taxes: ["ep-vz", "esv", "tax-total"],
  salaries: ["payroll-burden", "employee-count"],
  compliance: ["receivables"],
  documents: ["doc-fill-rate", "doc-total"],
  access: [],
};

const METRIC_DATASET_MAP: Record<MetricId, string[]> = {
  income: ["dynamics", "comparison"],
  expenses: ["expenses", "comparison"],
  net: ["dynamics", "comparison"],
  transactions: ["transactions", "comparison"],
  limits: ["limits", "comparison"],
  taxes: ["taxes", "comparison"],
  salaries: ["salaries", "comparison"],
  compliance: [],
  documents: [],
  access: [],
};

export function getRelevantKpiIds(metrics: MetricId[]): Set<string> {
  const ids = new Set<string>();
  metrics.forEach((m) => METRIC_KPI_MAP[m]?.forEach((id) => ids.add(id)));
  return ids;
}

export function getRelevantDatasetIds(metrics: MetricId[]): Set<string> {
  const ids = new Set<string>();
  metrics.forEach((m) => METRIC_DATASET_MAP[m]?.forEach((id) => ids.add(id)));
  return ids;
}

// ── Helpers ──

export function getMetricConfig(id: MetricId): MetricSectionConfig {
  return METRIC_SECTION_MAP[id];
}

export function getAllMetricConfigs(): MetricSectionConfig[] {
  return Object.values(METRIC_SECTION_MAP);
}

/** Metrics available per cabinet type */
const CABINET_METRICS: Record<string, MetricId[]> = {
  fop: ["income", "expenses", "net", "transactions", "limits", "taxes", "compliance", "documents", "access"],
  tov: ["income", "expenses", "net", "transactions", "taxes", "salaries", "compliance", "documents", "access"],
  individual: ["income", "expenses", "net", "transactions", "taxes", "documents", "access"],
  "fop-group": ["income", "expenses", "net", "transactions", "limits", "taxes", "compliance", "documents", "access"],
};

export function getAvailableMetrics(cabinetType: string): MetricId[] {
  return CABINET_METRICS[cabinetType] ?? CABINET_METRICS["fop"];
}

/**
 * Resolve the effective ViewType for a set of selected metrics.
 * If user provides an override, it wins. Otherwise pick the default
 * of the first selected metric (multi-metric → always "trend").
 */
export function resolveViewType(
  metrics: MetricId[],
  userOverride?: AnalyticsViewType,
): AnalyticsViewType {
  if (userOverride) return userOverride;
  if (metrics.length === 0) return "trend";
  if (metrics.length > 1) return "trend";
  return METRIC_SECTION_MAP[metrics[0]].defaultViewType;
}

// ── Period-aware aggregation: як рахувати hero-цифру з period-фільтрованого dataset ──

/**
 * Як саме hero-цифра агрегує дані поточного періоду:
 * - sum  → сума всіх точок (income, expenses, taxes, salaries)
 * - last → остання точка (limits — снапшот стану)
 * - avg  → середнє (margin %)
 */
export type AggregationKind = "sum" | "last" | "avg";

const METRIC_AGGREGATION: Record<MetricId, AggregationKind> = {
  income: "sum",
  expenses: "sum",
  net: "sum",
  transactions: "sum",
  limits: "last",
  taxes: "sum",
  salaries: "sum",
  compliance: "last",
  documents: "last",
  access: "last",
};

export function getAggregationForMetric(metricId: MetricId): AggregationKind {
  return METRIC_AGGREGATION[metricId] ?? "sum";
}

/**
 * Канонічний формат heros для кожної метрики.
 * (transactions — number, інше — currency; винятки явні.)
 */
export function getFormatForMetric(metricId: MetricId): "currency" | "number" | "percent" {
  if (metricId === "transactions") return "number";
  return "currency";
}

/**
 * Резолв «який рядок dataset.rows відповідає метриці»: повертає найімовірніший id
 * у порядку пріоритету. Використовується для read-out current/previous.
 */
const METRIC_TO_ROW_IDS: Record<MetricId, string[]> = {
  income: ["income", "revenue", "total-income"],
  expenses: ["expenses", "total-expenses"],
  net: ["net-income", "net", "margin", "profit"],
  transactions: ["tx-count", "transactions", "count"],
  limits: ["limit-usage", "limits"],
  taxes: ["tax-total", "ep-vz", "esv", "taxes"],
  salaries: ["salary-total", "salaries", "payroll"],
  compliance: [],
  documents: [],
  access: [],
};

export function getRowIdsForMetric(metricId: MetricId): string[] {
  return METRIC_TO_ROW_IDS[metricId] ?? [];
}
