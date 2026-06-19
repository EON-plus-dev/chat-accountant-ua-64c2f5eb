import type { Cabinet } from "@/types/cabinet";

// Comparison modes
export type ComparisonMode = "cabinets" | "periods" | "mixed";

// Industry types for benchmarking
export type Industry = "it" | "trade" | "services" | "manufacturing" | "consulting" | "autorepair" | "dealer" | "investing" | "salon" | "tennis_club" | "restaurant" | "hotel";

// Industry benchmark configuration
export interface IndustryBenchmark {
  id: Industry;
  label: string;
  icon: string;
  benchmarks: {
    taxBurden: { low: number; optimal: number; high: number };
    laborCost: { low: number; optimal: number; high: number };
  };
  description: string;
}

// Benchmark comparison result
export interface BenchmarkComparison {
  metric: "taxBurden" | "laborCost";
  value: number;
  industry: Industry;
  benchmark: { low: number; optimal: number; high: number };
  status: "below" | "optimal" | "above";
  percentile: number;
  recommendation?: string;
}

// Available metrics for comparison
export type ComparisonMetric = 
  | "income" 
  | "taxes" 
  | "salary" 
  | "taxBurden" 
  | "laborCost" 
  | "employees";

// Period definition
export interface ComparisonPeriod {
  year: number;
  month?: number;
  quarter?: number;
  label: string;
}

// Item to compare (cabinet or period)
export interface ComparisonItem {
  id: string;
  label: string;
  type: "cabinet" | "period";
  cabinetId?: string;
  period?: ComparisonPeriod;
  color: string;
}

// Data point for a comparison item
export interface ComparisonDataPoint {
  itemId: string;
  itemLabel: string;
  color: string;
  metrics: Record<ComparisonMetric, number>;
  // For YoY comparison
  previousMetrics?: Record<ComparisonMetric, number>;
  deltas?: Record<ComparisonMetric, { value: number; percent: number; direction: "up" | "down" | "stable" }>;
}

// Chart data point for overlay charts
export interface ComparisonChartPoint {
  month: string;
  [key: string]: string | number; // Dynamic keys for each compared item
}

// Comparison state
export interface ComparisonState {
  mode: ComparisonMode;
  items: ComparisonItem[];
  metrics: ComparisonMetric[];
  viewType: "table" | "chart";
  basePeriod: ComparisonPeriod;
  comparePeriod?: ComparisonPeriod;
  // Benchmark settings
  showBenchmarks?: boolean;
  benchmarkIndustry?: Industry;
}

// Preset comparison
export interface ComparisonPreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  getState: (cabinets: Cabinet[]) => Partial<ComparisonState>;
}

// Comparison result
export interface ComparisonResult {
  dataPoints: ComparisonDataPoint[];
  chartData: ComparisonChartPoint[];
  insights: ComparisonInsight[];
  maxDelta: { metric: ComparisonMetric; itemId: string; value: number } | null;
  summary: {
    bestPerformer: { itemId: string; metric: ComparisonMetric } | null;
    worstPerformer: { itemId: string; metric: ComparisonMetric } | null;
  };
}

// Auto-generated insight
export interface ComparisonInsight {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
}

// Metric configuration
export interface MetricConfig {
  id: ComparisonMetric;
  label: string;
  shortLabel: string;
  format: "currency" | "percent" | "number";
  colorScale: "positive" | "negative" | "neutral";
  description: string;
}

// Default colors for comparison items
export const COMPARISON_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

// Metric configurations
export const METRIC_CONFIGS: MetricConfig[] = [
  { id: "income", label: "Дохід", shortLabel: "Дохід", format: "currency", colorScale: "positive", description: "Загальний дохід за період" },
  { id: "taxes", label: "Податки", shortLabel: "Податки", format: "currency", colorScale: "negative", description: "Сума податкових зобов'язань" },
  { id: "salary", label: "Зарплати", shortLabel: "Зарплати", format: "currency", colorScale: "negative", description: "Виплати працівникам" },
  { id: "taxBurden", label: "Tax Burden %", shortLabel: "TB%", format: "percent", colorScale: "negative", description: "Податкове навантаження" },
  { id: "laborCost", label: "Labor Cost %", shortLabel: "LC%", format: "percent", colorScale: "neutral", description: "Частка витрат на персонал" },
  { id: "employees", label: "Працівники", shortLabel: "Прац.", format: "number", colorScale: "neutral", description: "Кількість працівників" },
];

// Benchmark history point for trend analysis
export interface BenchmarkHistoryPoint {
  month: string; // "2024-01", "2024-02"
  taxBurden: number;
  laborCost: number;
}

// Benchmark trend analysis
export interface BenchmarkTrend {
  current: { taxBurden: number; laborCost: number };
  history: BenchmarkHistoryPoint[];
  trend: {
    taxBurden: "improving" | "worsening" | "stable";
    laborCost: "improving" | "worsening" | "stable";
  };
  deltaFromStart: {
    taxBurden: number; // п.п. change over 12 months
    laborCost: number;
  };
}

// Available years for comparison
export const AVAILABLE_YEARS = [2024, 2023, 2022] as const;

// Available periods
export const PERIOD_OPTIONS: ComparisonPeriod[] = [
  { year: 2024, label: "2024" },
  { year: 2023, label: "2023" },
  { year: 2022, label: "2022" },
  { year: 2024, quarter: 4, label: "Q4 2024" },
  { year: 2024, quarter: 3, label: "Q3 2024" },
  { year: 2024, quarter: 2, label: "Q2 2024" },
  { year: 2024, quarter: 1, label: "Q1 2024" },
  { year: 2023, quarter: 4, label: "Q4 2023" },
];
