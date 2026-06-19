/**
 * AI Command Center v3 — Unified Types
 * 
 * Single source of truth for document actions (tasks) and risks,
 * merged into a unified CommandCenterItem model.
 */

import type { 
  RiskCategory, 
  RiskSeverity, 
  TaskPriority 
} from "@/config/documentFlowConfig";
import type { ChecklistActionType, ActionCategory } from "@/types/documentSummary";

// ============================================
// COMMAND CENTER ITEM (Unified Task + Risk)
// ============================================

export type CommandItemType = "task" | "risk";
export type CommandSection = "attention" | "recommended" | "automatic";
export type CommandItemStatus = "pending" | "completed" | "confirmed" | "disputed";

/**
 * AI Explanation for Explainable AI feature
 * Shows users how AI identified this item
 */
export interface AIExplanation {
  /** Keywords that triggered detection */
  keywords?: string[];
  /** Confidence level 0-100 */
  confidence?: number;
  /** Section in document where detected */
  detectedIn?: string;
}

/**
 * AI Suggestion for actionable risk resolution
 */
export interface AIInsightSuggestion {
  text: string;                     // Suggested text to add/change
  targetSection?: string;           // e.g., "п. 3.2"
  insertPosition?: "append" | "replace" | "before" | "after";
  confidence: number;               // 0-100 AI confidence
}

/**
 * Unified item representing both tasks and risks
 */
export interface CommandCenterItem {
  id: string;
  type: CommandItemType;
  
  // Display
  title: string;
  description?: string;
  
  // Categorization
  section: CommandSection;
  severity?: RiskSeverity;
  priority?: TaskPriority;
  
  // Task-specific
  actionType?: ChecklistActionType;
  actionLabel?: string;
  assignee?: string;
  dueDate?: string;
  actionCategory?: ActionCategory;
  
  // Risk-specific
  category?: RiskCategory;
  potentialImpact?: number;
  sourceSection?: string;
  aiExplanation?: AIExplanation;
  
  // AI Insight Suggestion (NEW)
  suggestion?: AIInsightSuggestion;
  isSuggestionAccepted?: boolean;
  
  // State
  status: CommandItemStatus;
}

// ============================================
// PROGRESS TRACKING
// ============================================

export interface CommandCenterProgress {
  total: number;
  completed: number;
  /** Human-readable label e.g. "3 з 5 дій виконано" */
  label: string;
}

// ============================================
// GROUPED ITEMS
// ============================================

export interface GroupedCommandItems {
  attention: CommandCenterItem[];
  recommended: CommandCenterItem[];
  automatic: CommandCenterItem[];
}

// ============================================
// SECTION CONFIG
// ============================================

export interface SectionConfig {
  key: CommandSection;
  label: string;
  icon: string;
  collapsible: boolean;
  defaultExpanded: boolean;
}

export const sectionConfigs: SectionConfig[] = [
  {
    key: "attention",
    label: "Потрібна ваша увага",
    icon: "AlertCircle",
    collapsible: false,
    defaultExpanded: true,
  },
  {
    key: "recommended",
    label: "Рекомендації",
    icon: "Lightbulb",
    collapsible: true,
    defaultExpanded: false,
  },
  {
    key: "automatic",
    label: "Автоматично",
    icon: "Zap",
    collapsible: true,
    defaultExpanded: false,
  },
];

// ============================================
// SEVERITY STYLES (for risks)
// ============================================

export const severityStyles: Record<RiskSeverity, {
  bg: string;
  border: string;
  text: string;
  badge: string;
}> = {
  low: {
    bg: "bg-muted/30",
    border: "border-border/50",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  medium: {
    bg: "bg-warning/5",
    border: "border-warning/30",
    text: "text-warning-foreground",
    badge: "bg-warning/10 text-warning-foreground",
  },
  high: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-300 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  critical: {
    bg: "bg-destructive/5",
    border: "border-destructive/30",
    text: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
};

// ============================================
// CATEGORY CONFIG (for risks)
// ============================================

export const categoryLabels: Record<RiskCategory, string> = {
  financial: "Фінансовий",
  legal: "Юридичний",
  compliance: "Комплаєнс",
  deadline: "Строки",
  counterparty: "Контрагент",
};

export const categoryIcons: Record<RiskCategory, string> = {
  financial: "💰",
  legal: "⚖️",
  compliance: "📋",
  deadline: "⏰",
  counterparty: "🏢",
};

// ============================================
// ACTION BUTTON CONFIG
// ============================================

export const actionButtonLabels: Record<ChecklistActionType, string> = {
  manual: "Позначити",
  auto: "Деталі",
  invite: "Запросити",
  validate: "Перевірити",
  navigate: "Перейти",
  upload: "Завантажити",
};

// ============================================
// HELPER: Determine section from task/risk
// ============================================

export const getSectionForTask = (
  priority?: TaskPriority,
  actionType?: ChecklistActionType,
  actionCategory?: ActionCategory
): CommandSection => {
  // Explicit category takes precedence
  if (actionCategory === "automatic" || actionType === "auto") return "automatic";
  if (actionCategory === "required") return "attention";
  if (actionCategory === "recommended") return "recommended";
  
  // Infer from priority
  if (priority === "critical" || priority === "high") return "attention";
  return "recommended";
};

export const getSectionForRisk = (severity?: RiskSeverity): CommandSection => {
  if (severity === "critical") return "attention";
  return "recommended";
};

// ============================================
// SMART TERMS (Key Contract Conditions)
// ============================================

export type TermCategory = "payment" | "duration" | "penalty" | "prolongation" | "termination" | "other";

export interface SmartTerm {
  id: string;
  category: TermCategory;
  label: string;
  value?: string;
  
  // AI context
  linkedTaskId?: string;
  linkedRiskId?: string;
  importance: "high" | "medium" | "low";
  
  // For deadline-based terms
  deadline?: string;
}

export const termCategoryConfig: Record<TermCategory, { 
  icon: string; 
  label: string;
  textClass: string;
}> = {
  payment: { icon: "💳", label: "Оплата", textClass: "text-blue-600 dark:text-blue-400" },
  duration: { icon: "📅", label: "Термін", textClass: "text-foreground" },
  penalty: { icon: "⚠️", label: "Штрафи", textClass: "text-warning-foreground" },
  prolongation: { icon: "🔄", label: "Пролонгація", textClass: "text-primary" },
  termination: { icon: "🚫", label: "Розірвання", textClass: "text-destructive" },
  other: { icon: "📋", label: "Інше", textClass: "text-muted-foreground" },
};
