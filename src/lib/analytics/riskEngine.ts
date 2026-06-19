import type { RiskItem } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsRisk, AnalyticsAction, RiskCategory, RiskSeverity } from "@/types/analyticsTypes";
import { getActionsForCategory, actionLibrary } from "@/config/actionLibrary";
import { AlertTriangle } from "lucide-react";
import type { BudgetSettlementSummary } from "./budgetSettlementEngine";
import { formatValue } from "@/lib/formatters";

// Direct mapping: risk text keywords -> specific action ID
const riskActionMap: { keywords: string[]; actionId: string }[] = [
  { keywords: ["ліміт", "наближення"], actionId: "setup-limit-alert" },
  { keywords: ["без категорії", "некатегоризов"], actionId: "categorize-ops" },
  { keywords: ["прострочені платежі контрагент"], actionId: "resolve-overdue-payments" },
  { keywords: ["прострочені податкові"], actionId: "resolve-overdue-tax" },
  { keywords: ["борг перед бюджетом"], actionId: "resolve-overdue-tax" },
  { keywords: ["непідписан", "документ"], actionId: "prepare-docs" },
  { keywords: ["дефіцит", "прогнозний"], actionId: "review-volatility" },
  { keywords: ["розбіжність"], actionId: "reconcile-data" },
  { keywords: ["касов", "розрив"], actionId: "review-volatility" },
  { keywords: ["витрати рост"], actionId: "review-volatility" },
];

function findActionForRisk(riskText: string, category: RiskCategory) {
  const lower = riskText.toLowerCase();
  
  // Try exact mapping first
  for (const { keywords, actionId } of riskActionMap) {
    if (keywords.every(kw => lower.includes(kw))) {
      const action = actionLibrary.find(a => a.id === actionId);
      if (action) return action;
    }
  }
  
  // Fallback: first action from category
  const categoryActions = getActionsForCategory(category);
  return categoryActions[0] || null;
}

// Map keywords in risk text to categories
const categoryKeywords: { category: RiskCategory; keywords: string[] }[] = [
  { category: "limit", keywords: ["ліміт", "перевищення", "групи", "usage", "наближення"] },
  { category: "data", keywords: ["категорі", "синхроніз", "виписка", "розбіжн", "дані", "інтеграц", "підключ", "неповні"] },
  { category: "compliance", keywords: ["документ", "підпис", "реквізит", "звіт", "декларац", "дедлайн", "період", "прострочен", "платеж", "податков", "сплат", "штраф"] },
  { category: "finance", keywords: ["витрати рост", "касов", "падіння", "коливанн", "дефіцит", "прогноз", "концентрац", "залежність", "одного джерела", "дебіторськ", "заборгован"] },
  { category: "operations", keywords: ["записи", "перевірк", "контрагент", "реквізит"] },
];

function detectCategory(text: string): RiskCategory {
  const lower = text.toLowerCase();
  for (const { category, keywords } of categoryKeywords) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return "data";
}

function mapSeverity(severity: "critical" | "warning" | "info"): RiskSeverity {
  return severity;
}

// Build evidence from risk value
function buildEvidence(risk: RiskItem): { label: string; value: string }[] {
  if (!risk.value) return [];
  return [{ label: "Показник", value: risk.value }];
}

/**
 * Convert config RiskItem[] into enriched AnalyticsRisk[] with actions & evidence
 */
export function evaluateRisks(risks: RiskItem[]): AnalyticsRisk[] {
  return risks
    .map((risk, index): AnalyticsRisk => {
      const category = detectCategory(risk.text);
      const severity = mapSeverity(risk.severity);
      const matchedAction = findActionForRisk(risk.text, category);

      const recommendedActions = matchedAction
        ? [{
            id: matchedAction.id,
            label: matchedAction.label,
            icon: matchedAction.icon,
            actionType: matchedAction.actionType,
            actionPayload: matchedAction.actionPayload,
            expectedEffect: matchedAction.effect,
          }]
        : [];

      return {
        id: risk.id,
        text: risk.text,
        severity,
        category,
        priority: risk.priority ?? (index + 1),
        icon: risk.icon,
        title: risk.title,
        subtitle: risk.subtitle,
        value: risk.value,
        impact: risk.impact,
        deadline: risk.deadline,
        metric: risk.metric ? {
          name: risk.metric.name,
          value: risk.metric.value,
          unit: risk.metric.unit,
          thresholdWarning: risk.metric.thresholdWarning,
          thresholdCritical: risk.metric.thresholdCritical,
        } : undefined,
        entity: risk.entity,
        source: risk.source ?? [],
        status: risk.status ?? "open",
        ai: risk.ai ? {
          explainKey: risk.ai.explainKey,
          evidenceRefs: risk.ai.evidenceRefs,
        } : undefined,
        evidence: buildEvidence(risk),
        recommendedActions,
      };
    })
    .sort((a, b) => {
      // Sort by priority ASC, then severity, then id as fallback
      if (a.priority !== b.priority) return a.priority - b.priority;
      const severityOrder: Record<RiskSeverity, number> = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

/**
 * Generate top-N action recommendations from evaluated risks
 */
export function generateActions(risks: AnalyticsRisk[], limit = 3): AnalyticsAction[] {
  const seen = new Set<string>();
  const actions: AnalyticsAction[] = [];

  for (const risk of risks) {
    for (const ra of risk.recommendedActions) {
      if (seen.has(ra.id)) continue;
      seen.add(ra.id);
      
      const template = getActionsForCategory(risk.category).find(a => a.id === ra.id);
      actions.push({
        id: ra.id,
        label: ra.label,
        icon: ra.icon,
        priority: risk.severity === "critical" ? "high" : risk.severity === "warning" ? "medium" : "low",
        expectedEffect: template?.effect || "",
        actionType: ra.actionType,
        actionPayload: ra.actionPayload,
        linkedRiskId: risk.id,
      });

      if (actions.length >= limit) return actions;
    }
  }

  return actions;
}

/**
 * Build a RiskItem from budget settlement summary (budget-debt rule).
 * Returns null if no debt and no overdue.
 */
export function buildBudgetDebtRisk(summary: BudgetSettlementSummary): RiskItem | null {
  if (!summary.hasDebt) return null;
  const totalDebt = summary.debt + summary.overdueAmount;
  const isCritical = summary.overdueAmount > 0;
  return {
    id: "budget-debt",
    text: isCritical
      ? `Борг перед бюджетом: ${formatValue(totalDebt, "currency")} (з них прострочено ${formatValue(summary.overdueAmount, "currency")})`
      : `Борг перед бюджетом: ${formatValue(totalDebt, "currency")} до сплати`,
    severity: isCritical ? "critical" : "warning",
    icon: AlertTriangle,
    value: formatValue(totalDebt, "currency"),
    impact: summary.nextPayment ? `Найближчий платіж до ${summary.nextPayment.deadline.slice(0,10)}` : undefined,
    priority: isCritical ? 1 : 3,
    source: ["tax_payments"],
    status: "open",
    title: "Борг перед бюджетом",
  };
}
