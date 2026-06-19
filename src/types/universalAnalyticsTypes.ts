/**
 * Universal Analytics Panel types — shared across all analytics sections
 * that display table/chart/AI insight patterns.
 */

import type { LucideIcon } from "lucide-react";

export interface AnalyticsRow {
  id: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  delta: number;
  deltaPercent: number;
  direction: "up" | "down" | "stable";
  format: "currency" | "number";
  /** positive-up = growth is good, negative-up = growth is bad, neutral = informational */
  semantic: "positive-up" | "negative-up" | "neutral";
}

export interface ChartDataItem {
  category: string;
  current: number;
  previous: number;
  /** Additional dynamic keys for multi-series charts */
  [key: string]: string | number;
}

export interface ChartSeriesConfig {
  key: string;
  label: string;
  color: string;
  strokeDasharray?: string;
}

export interface MetricOption {
  id: string;
  label: string;
  defaultOn: boolean;
}

export interface AiAnalysis {
  summary: string;
  highlights: string[];
  recommendation: string;
}

export interface AnalyticsDataset {
  id: string;
  label: string;
  icon: LucideIcon;
  rows: AnalyticsRow[];
  chartData?: ChartDataItem[];
  metricOptions?: MetricOption[];
  currentLabel?: string;
  previousLabel?: string;
  insightText?: string;
  chartType?: "bar" | "line";
  onRequestAiAnalysis?: () => void;
  aiLoading?: boolean;
  aiAnalysis?: AiAnalysis | null;
  /** Multi-series chart config — when provided, renders custom series instead of current/previous */
  chartSeries?: ChartSeriesConfig[];
}
