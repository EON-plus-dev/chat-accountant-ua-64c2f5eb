import type { CabinetType } from "@/types/cabinet";

// Mode for goals calculation
export type GoalsMode = "auto" | "manual";

// All possible goal/budget fields
export interface CabinetGoals {
  // Mode
  mode: GoalsMode;
  
  // Income goals
  monthlyIncomeTarget?: number;
  quarterlyIncomeTarget?: number;
  growthFactor?: number; // e.g., 1.1 = +10%
  
  // FOP limit settings (read-only limit, configurable thresholds)
  fopLimitWarningThreshold?: number; // e.g., 70
  fopLimitCriticalThreshold?: number; // e.g., 90
  fopLimitNotifyDays?: number; // e.g., 30
  
  // Salary budget (TOV)
  monthlySalaryBudget?: number;
  salaryOverrunWarning?: boolean;
  
  // OPEX budget (TOV)
  monthlyOpexBudget?: number;
  opexBreakdown?: {
    rent?: number;
    utilities?: number;
    marketing?: number;
    other?: number;
  };
  
  // Tax budget
  taxBudgetBuffer?: number; // e.g., 1.05 = +5%
  
  // Financial goals (TOV)
  targetProfitMargin?: number; // e.g., 15 = 15%
  targetArDays?: number; // e.g., 30 days
  cashReserveMonths?: number; // e.g., 3 months
  
  // Savings goal (Individual)
  yearlySavingsGoal?: number;
  
  // Reporting
  expectedReportsPerYear?: number;
}

// Default auto-calculation factors
export const DEFAULT_GROWTH_FACTOR = 1.1; // +10%
export const DEFAULT_TAX_BUFFER = 1.05; // +5%
export const DEFAULT_FOP_WARNING = 70;
export const DEFAULT_FOP_CRITICAL = 90;
export const DEFAULT_FOP_NOTIFY_DAYS = 30;

// Fields available for each cabinet type
export const goalsFieldsByType: Record<CabinetType, (keyof CabinetGoals)[]> = {
  fop: [
    "mode",
    "monthlyIncomeTarget",
    "quarterlyIncomeTarget",
    "growthFactor",
    "fopLimitWarningThreshold",
    "fopLimitCriticalThreshold",
    "fopLimitNotifyDays",
    "taxBudgetBuffer",
    "expectedReportsPerYear",
  ],
  tov: [
    "mode",
    "monthlyIncomeTarget",
    "quarterlyIncomeTarget",
    "growthFactor",
    "monthlySalaryBudget",
    "salaryOverrunWarning",
    "monthlyOpexBudget",
    "opexBreakdown",
    "taxBudgetBuffer",
    "targetProfitMargin",
    "targetArDays",
    "cashReserveMonths",
    "expectedReportsPerYear",
  ],
  "fop-group": [
    "mode",
    "monthlyIncomeTarget",
    "quarterlyIncomeTarget",
    "growthFactor",
    "fopLimitWarningThreshold",
    "fopLimitCriticalThreshold",
    "taxBudgetBuffer",
    "expectedReportsPerYear",
  ],
  individual: [
    "mode",
    "monthlyIncomeTarget",
    "quarterlyIncomeTarget",
    "yearlySavingsGoal",
    "taxBudgetBuffer",
    "expectedReportsPerYear",
  ],
};

// Helper: Calculate auto targets based on current data
export function calculateAutoTargets(
  currentMonthlyIncome: number,
  growthFactor: number = DEFAULT_GROWTH_FACTOR
): { monthlyTarget: number; quarterlyTarget: number } {
  const monthlyTarget = Math.round(currentMonthlyIncome * growthFactor);
  const quarterlyTarget = monthlyTarget * 3;
  return { monthlyTarget, quarterlyTarget };
}

// Helper: Calculate expected reports per year for a cabinet
export function calculateExpectedReports(
  cabinetType: CabinetType,
  isVatPayer: boolean = false
): number {
  switch (cabinetType) {
    case "fop":
      // 4 quarters × (EP + ESV) = 8, + 4 VAT if applicable
      return isVatPayer ? 12 : 8;
    case "tov":
      // Monthly VAT (12) + quarterly reports + annual
      return isVatPayer ? 20 : 10;
    case "fop-group":
      // Sum of individual FOP reports (demo: 3 FOPs × 8)
      return 24;
    case "individual":
      // Annual declaration only
      return 1;
    default:
      return 8;
  }
}
