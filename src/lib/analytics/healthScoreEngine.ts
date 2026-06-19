/**
 * HEALTH SCORE ENGINE — агрегований індикатор «здоров'я» кабінету (0-100)
 * 
 * 5 Pillars:
 *  1. Compliance  (30%) — податки, ліміти, прострочення
 *  2. Data Quality (20%) — категоризація, джерела, свіжість
 *  3. Financial   (25%) — чистий дохід, cashflow trend
 *  4. Operational  (15%) — документи, контрагенти
 *  5. Growth      (10%) — тренд доходу
 */

import type { Cabinet } from "@/types/cabinet";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsDataSet } from "./dataLayer";
import type {
  HealthScoreResult,
  HealthScorePillar,
  HealthPillarId,
  HealthGrade,
} from "@/types/analyticsTypes";
import { healthGradeFromScore } from "@/types/analyticsTypes";
import { FOP_INCOME_LIMITS } from "@/config/taxConstantsConfig";

// ── Pillar weights by cabinet type ──

const WEIGHTS: Record<string, Record<HealthPillarId, number>> = {
  fop: { compliance: 0.30, dataQuality: 0.20, financial: 0.25, operational: 0.15, growth: 0.10 },
  tov: { compliance: 0.30, dataQuality: 0.20, financial: 0.25, operational: 0.15, growth: 0.10 },
  individual: { compliance: 0.35, dataQuality: 0.20, financial: 0.20, operational: 0.15, growth: 0.10 },
};

const PILLAR_LABELS: Record<HealthPillarId, string> = {
  compliance: "Комплаєнс",
  dataQuality: "Якість даних",
  financial: "Фінансове здоров'я",
  operational: "Операційна ефективність",
  growth: "Зростання",
};

// ── Pillar calculators ──

function scoreCompliance(data: AnalyticsDataSet, config: CabinetAnalyticsConfig, cabinet: Cabinet): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  // Check overdue tax payments
  const now = new Date();
  const overdueTax = data.taxPayments.filter(t => t.status === "overdue" || (t.deadline && new Date(t.deadline) < now && t.status !== "paid"));
  if (overdueTax.length > 0) {
    score -= Math.min(40, overdueTax.length * 15);
    issues.push(`${overdueTax.length} прострочених податкових платежів`);
  }

  // Check FOP income limit proximity
  if (cabinet.type === "fop" && cabinet.fopGroup) {
    const limit = FOP_INCOME_LIMITS[cabinet.fopGroup as 1 | 2 | 3];
    if (limit > 0 && cabinet.yearlyIncome) {
      const pct = (cabinet.yearlyIncome / limit) * 100;
      if (pct >= 95) {
        score -= 30;
        issues.push(`Ліміт доходу ${Math.round(pct)}% — критична зона`);
      } else if (pct >= 80) {
        score -= 15;
        issues.push(`Ліміт доходу ${Math.round(pct)}% — наближення`);
      }
    }
  }

  // Unsigned documents
  const unsigned = data.documents.filter(d => d.status === "draft" || d.status === "sent");
  if (unsigned.length > 3) {
    score -= Math.min(15, unsigned.length * 3);
    issues.push(`${unsigned.length} непідписаних документів`);
  }

  // P5: Compliance risk scoring — use severity + ID patterns instead of fragile text matching
  const complianceRiskIds = ["tax-", "limit-", "deadline-", "declaration-", "compliance-"];
  const complianceRisks = config.risks.filter(r =>
    complianceRiskIds.some(prefix => r.id.startsWith(prefix)) ||
    r.severity === "critical"
  );
  if (complianceRisks.length > 0) {
    score -= Math.min(20, complianceRisks.length * 7);
    complianceRisks.forEach(r => {
      if (r.text && !issues.some(i => i === r.text)) issues.push(r.text);
    });
  }

  return { score: Math.max(0, score), issues };
}

function scoreDataQuality(data: AnalyticsDataSet, config: CabinetAnalyticsConfig): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  // Data sources status
  const errorSources = config.dataSources.filter(ds => ds.status === "error");
  if (errorSources.length > 0) {
    score -= errorSources.length * 15;
    issues.push(`${errorSources.length} джерел з помилками`);
  }
  const syncingSources = config.dataSources.filter(ds => ds.status === "syncing");
  if (syncingSources.length > 0) {
    score -= syncingSources.length * 5;
    issues.push(`${syncingSources.length} джерел синхронізуються`);
  }

  // Uncategorized income records
  const uncategorized = data.incomeRecords.filter(r => !(r as any).category || (r as any).category === "uncategorized");
  const totalRecords = data.incomeRecords.length;
  if (totalRecords > 0) {
    const uncatPct = (uncategorized.length / totalRecords) * 100;
    if (uncatPct > 20) {
      score -= Math.min(25, Math.round(uncatPct / 2));
      issues.push(`${Math.round(uncatPct)}% операцій без категорії`);
    }
  }

  // No income records at all
  if (totalRecords === 0) {
    score -= 20;
    issues.push("Немає записів у книзі доходів");
  }

  // Few data sources
  if (config.dataSources.length < 2) {
    score -= 10;
    issues.push("Лише 1 джерело даних");
  }

  return { score: Math.max(0, score), issues };
}

function scoreFinancial(data: AnalyticsDataSet, config: CabinetAnalyticsConfig): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  // Net income from KPIs
  const netIncomeKpi = config.kpis.find(k => k.id === "net-income" || k.id === "income");
  const expenseKpi = config.kpis.find(k => k.id === "expenses" || k.id === "total-expenses");

  if (netIncomeKpi && expenseKpi && typeof netIncomeKpi.value === "number" && typeof expenseKpi.value === "number") {
    const netIncome = netIncomeKpi.value;
    const expenses = expenseKpi.value;
    
    if (netIncome <= 0) {
      score -= 30;
      issues.push("Від'ємний або нульовий чистий дохід");
    }

    // Expense ratio
    if (netIncome > 0 && expenses > 0) {
      const ratio = expenses / netIncome;
      if (ratio > 0.9) {
        score -= 20;
        issues.push("Витрати перевищують 90% доходу");
      } else if (ratio > 0.7) {
        score -= 10;
        issues.push("Витрати складають понад 70% доходу");
      }
    }
  }

  // Negative trend
  if (config.chartData.length >= 3) {
    const lastThree = config.chartData.slice(-3);
    const incomes = lastThree.map((d: any) => d.income || d.accruals || 0);
    if (incomes[2] < incomes[0] && incomes[1] < incomes[0]) {
      score -= 15;
      issues.push("Спадний тренд доходу за останні 3 місяці");
    }
  }

  return { score: Math.max(0, score), issues };
}

function scoreOperational(data: AnalyticsDataSet): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  // Overdue contractor payments
  const overdueContractor = data.contractorPayments.filter(p => p.status === "overdue");
  if (overdueContractor.length > 0) {
    score -= Math.min(30, overdueContractor.length * 10);
    issues.push(`${overdueContractor.length} прострочених платежів контрагентам`);
  }

  // Draft documents
  const draftDocs = data.documents.filter(d => d.status === "draft");
  if (draftDocs.length > 5) {
    score -= Math.min(15, draftDocs.length * 2);
    issues.push(`${draftDocs.length} документів у чернетці`);
  }

  // Overdue salaries
  const overdueSalary = data.salaryPayments.filter(s => s.status === "overdue");
  if (overdueSalary.length > 0) {
    score -= 25;
    issues.push(`${overdueSalary.length} прострочених зарплат`);
  }

  return { score: Math.max(0, score), issues };
}

function scoreGrowth(config: CabinetAnalyticsConfig): { score: number; issues: string[] } {
  let score = 70; // neutral baseline
  const issues: string[] = [];

  if (config.chartData.length < 3) {
    return { score: 50, issues: ["Недостатньо даних для оцінки тренду"] };
  }

  const incomes = config.chartData.map((d: any) => d.income || d.accruals || 0);
  const lastHalf = incomes.slice(-Math.ceil(incomes.length / 2));
  const firstHalf = incomes.slice(0, Math.ceil(incomes.length / 2));

  const avgLast = lastHalf.reduce((a: number, b: number) => a + b, 0) / lastHalf.length;
  const avgFirst = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length;

  if (avgFirst > 0) {
    const growthRate = ((avgLast - avgFirst) / avgFirst) * 100;
    if (growthRate > 10) {
      score = Math.min(100, 80 + Math.round(growthRate / 5));
      // no issues — positive growth
    } else if (growthRate > 0) {
      score = 70;
    } else if (growthRate > -10) {
      score = 55;
      issues.push("Стагнація доходу");
    } else {
      score = Math.max(20, 50 + Math.round(growthRate));
      issues.push(`Падіння доходу на ${Math.abs(Math.round(growthRate))}%`);
    }
  }

  // Stability check (coefficient of variation)
  if (incomes.length >= 4) {
    const mean = incomes.reduce((a: number, b: number) => a + b, 0) / incomes.length;
    if (mean > 0) {
      const variance = incomes.reduce((sum: number, v: number) => sum + (v - mean) ** 2, 0) / incomes.length;
      const cv = Math.sqrt(variance) / mean;
      if (cv > 0.5) {
        score -= 10;
        issues.push("Висока нестабільність доходу");
      }
    }
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

// ── Main export ──

export function computeHealthScore(
  data: AnalyticsDataSet,
  config: CabinetAnalyticsConfig,
  cabinet: Cabinet
): HealthScoreResult {
  const weights = WEIGHTS[cabinet.type] || WEIGHTS.fop;

  const pillarResults: { id: HealthPillarId; result: { score: number; issues: string[] } }[] = [
    { id: "compliance", result: scoreCompliance(data, config, cabinet) },
    { id: "dataQuality", result: scoreDataQuality(data, config) },
    { id: "financial", result: scoreFinancial(data, config) },
    { id: "operational", result: scoreOperational(data) },
    { id: "growth", result: scoreGrowth(config) },
  ];

  const pillars: HealthScorePillar[] = pillarResults.map(({ id, result }) => ({
    id,
    label: PILLAR_LABELS[id],
    score: result.score,
    weight: weights[id],
    issues: result.issues,
    grade: healthGradeFromScore(result.score),
  }));

  const total = Math.round(
    pillars.reduce((sum, p) => sum + p.score * p.weight, 0) /
    pillars.reduce((sum, p) => sum + p.weight, 0)
  );

  // Simple trend: compare financial + growth scores to determine direction
  const financialPillar = pillars.find(p => p.id === "financial");
  const growthPillar = pillars.find(p => p.id === "growth");
  let trend: "up" | "down" | "stable" = "stable";
  if (growthPillar && growthPillar.score >= 75) trend = "up";
  else if (growthPillar && growthPillar.score < 50) trend = "down";
  else if (financialPillar && financialPillar.score < 40) trend = "down";

  return {
    total,
    grade: healthGradeFromScore(total),
    trend,
    pillars,
  };
}
