import type { LucideIcon } from "lucide-react";

// Risk categories for classification
export type RiskCategory = "limit" | "data" | "compliance" | "finance" | "operations";

// Severity levels
export type RiskSeverity = "critical" | "warning" | "info";

// Action types
export type ActionType = "chat-prompt" | "navigate" | "scroll";

// Evidence item linked to a risk
export interface RiskEvidence {
  label: string;
  value: string;
}

// Risk metric with thresholds
export interface RiskMetric {
  name: string;
  value: number;
  unit: string;
  thresholdWarning?: number;
  thresholdCritical?: number;
}

// Risk entity reference
export interface RiskEntity {
  type: "account" | "cabinet" | "counterparty";
  id: string;
  name: string;
}

// Risk time context
export interface RiskTime {
  detectedAt: string; // ISO timestamp
  rangeHint?: string; // e.g. "YTD", "30d"
}

// Risk CTA
export interface RiskCTA {
  label: string;
  action: string;
  payload: Record<string, string>;
}

// Risk AI cross-reference
export interface RiskAI {
  explainKey: string;
  evidenceRefs: string[];
}

// Recommended action for a risk
export interface RecommendedAction {
  id: string;
  label: string;
  icon: LucideIcon;
  actionType: ActionType;
  actionPayload: string; // chat prompt text, route path, or section id
  expectedEffect?: string;
}

// Extended analytics risk with evidence & actions
export interface AnalyticsRisk {
  id: string;
  text: string;
  severity: RiskSeverity;
  category: RiskCategory;
  priority: number;
  icon: LucideIcon;
  title?: string;
  subtitle?: string;
  value?: string;
  impact?: string;
  deadline?: string;
  metric?: RiskMetric;
  entity?: RiskEntity;
  time?: RiskTime;
  source: string[];
  status: "open" | "resolved" | "dismissed";
  cta?: RiskCTA;
  ai?: RiskAI;
  evidence: RiskEvidence[];
  recommendedActions: RecommendedAction[];
  /** Опційні семантичні мітки для прив'язки ризику до конкретних метрик
   * у Focus AI-довідці (напр., ["income", "limit"]). Якщо порожньо — матчинг
   * виконується за токенами в `id`/`title`/`text` (див. metricRiskMap.ts). */
  tags?: string[];
}

// Analytics action (for Action Center)
export interface AnalyticsAction {
  id: string;
  label: string;
  icon: LucideIcon;
  priority: "high" | "medium" | "low";
  expectedEffect: string;
  actionType: ActionType;
  actionPayload: string;
  linkedRiskId?: string;
}

// Activity event categories
export type ActivityCategory =
  | "transaction_income"
  | "transaction_expense"
  | "limit_status_change"
  | "integration_sync"
  | "compliance_event"
  | "system_event";

// Activity event amount
export interface ActivityAmount {
  value: number;
  currency: string;
}

// Activity event entity
export interface ActivityEntity {
  type: "account" | "cabinet" | "counterparty";
  id: string;
  name: string;
}

// Activity event CTA
export interface ActivityCTA {
  label: string;
  action: string;
  payload: Record<string, string>;
}

// Typed activity event
export interface ActivityEvent {
  id: string;
  category: ActivityCategory;
  timestamp: string; // ISO
  title: string;
  subtitle?: string;
  amount?: ActivityAmount;
  entity?: ActivityEntity;
  source: string;
  tags: string[];
  icon: LucideIcon;
  cta?: ActivityCTA;
  ai?: { evidenceRef: string };
}

// Activity filter chip ID (for UI grouping)
export type ActivityChipId = "all" | "transactions" | "integrations" | "limits" | "compliance";

// Data trust metric per source
export interface DataTrustMetric {
  id: string;
  sourceName: string;
  icon: LucideIcon;
  status: "connected" | "syncing" | "error" | "stale";
  lastSync?: string;
  freshness: "fresh" | "aging" | "stale";
  coverage: number; // 0-100%
  discrepancy?: string;
}

// AI Briefing structure
export interface AIBriefing {
  summary: string;
  confidence: number; // 0-1
  sourcesCount: number;
  asOf: string; // ISO timestamp
  highlights: string[];
  topRiskIds: string[];
  evidenceRefs: string[];
}

// ── Health Score ──

export type HealthGrade = "excellent" | "good" | "attention" | "critical";

export type HealthPillarId = "compliance" | "dataQuality" | "financial" | "operational" | "growth";

export interface HealthScorePillar {
  id: HealthPillarId;
  label: string;
  score: number; // 0-100
  weight: number; // 0-1
  issues: string[];
  grade: HealthGrade;
}

export interface HealthScoreResult {
  total: number; // 0-100
  grade: HealthGrade;
  trend: "up" | "down" | "stable";
  pillars: HealthScorePillar[];
}

export function healthGradeFromScore(score: number): HealthGrade {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "attention";
  return "critical";
}

// Today Snapshot DTO
export interface TodaySnapshotDTO {
  risks: {
    counts: {
      total: number;
      bySeverity: Record<RiskSeverity, number>;
      byCategory: Record<string, number>;
    };
    filters: {
      severity: RiskSeverity[];
      category: RiskCategory[];
    };
    items: AnalyticsRisk[];
  };
  recentActivity: {
    counts: {
      total: number;
      byChip: Record<ActivityChipId, number>;
    };
    chips: ActivityChipId[];
    events: ActivityEvent[];
  };
  aiBriefing: AIBriefing | null;
}
