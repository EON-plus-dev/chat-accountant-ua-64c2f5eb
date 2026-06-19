/**
 * COMPUTE ENGINE — розрахунок KPI, ризиків, графіків, прогнозів з реальних даних
 */

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  AlertTriangle,
  ShieldAlert,
  FileText,
  CreditCard,
  Building2,
  FileCheck,
  Target,
  PiggyBank,
  Ban,
  Users,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type {
  CabinetAnalyticsConfig,
  AnalyticsKPI,
  RiskItem,
  ForecastItem,
  ChartDataPoint,
  ExpenseStructureItem,
  DataSource,
} from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsDataSet } from "./dataLayer";
import type { PeriodType } from "./periodFilter";
import { filterByPeriod, filterByCustomRange } from "./periodFilter";
import {
  TAX_RATES,
  ESV_MONTHLY,
  EP_FIXED,
  MINIMUM_WAGE,
  FOP_INCOME_LIMITS,
} from "@/config/taxConstantsConfig";
import type { PaymentPurposeType } from "@/config/paymentsConfig";
import { paymentPurposeTypeConfig } from "@/config/paymentsConfig";
import type { Industry, BenchmarkHistoryPoint } from "@/types/comparison";

// ============================================
// MONTH LABELS
// ============================================

const SHORT_MONTH_UA = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];

// ============================================
// KPI CALCULATOR
// ============================================

function computeMonthsInPeriod(period: PeriodType, customRange?: { from: Date; to: Date }): number {
  if (period === "custom" && customRange) {
    const diffMs = customRange.to.getTime() - customRange.from.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diffDays / 30));
  }
  return period === "month" ? 1 : period === "quarter" ? 3 : period === "year" ? 12 : 1;
}

function computeKPIs(
  current: AnalyticsDataSet,
  previous: AnalyticsDataSet,
  cabinet: Cabinet,
  period: PeriodType,
  monthsInPeriod: number,
): AnalyticsKPI[] {
  if (cabinet.type === "tov") {
    return computeTovKPIs(current, previous, cabinet, period);
  }
  const fopGroup = cabinet.fopGroup || 3;
  if (fopGroup === 1 || fopGroup === 2) {
    return computeFopFixedKPIs(current, previous, cabinet, period, monthsInPeriod);
  }
  return computeFopPercentKPIs(current, previous, cabinet, period, monthsInPeriod);
}

// ---- Shared helpers ----

function computeIncomeExpenses(current: AnalyticsDataSet, previous: AnalyticsDataSet) {
  const income = current.incomeRecords
    .filter(r => r.status === "income")
    .reduce((sum, r) => sum + r.inIncomeBook, 0);
  const prevIncome = previous.incomeRecords
    .filter(r => r.status === "income")
    .reduce((sum, r) => sum + r.inIncomeBook, 0);
  const incomeTrend = prevIncome > 0 ? Math.round(((income - prevIncome) / prevIncome) * 100) : 0;

  const contractorExpenses = current.contractorPayments.reduce((sum, p) => sum + p.amount, 0);
  const salaryExpenses = current.salaryPayments.reduce((sum, p) => sum + p.amount, 0);
  const expenses = contractorExpenses + salaryExpenses;
  const prevExpenses = previous.contractorPayments.reduce((sum, p) => sum + p.amount, 0)
    + previous.salaryPayments.reduce((sum, p) => sum + p.amount, 0);
  const expensesTrend = prevExpenses > 0 ? Math.round(((expenses - prevExpenses) / prevExpenses) * 100) : 0;

  return { income, prevIncome, incomeTrend, expenses, prevExpenses, expensesTrend, contractorExpenses, salaryExpenses };
}

// ---- FOP Group 3 (percent-based) — original logic ----

function computeFopPercentKPIs(
  current: AnalyticsDataSet,
  previous: AnalyticsDataSet,
  cabinet: Cabinet,
  period: PeriodType,
  monthsInPeriod: number,
): AnalyticsKPI[] {
  const { income, incomeTrend, expenses, expensesTrend } = computeIncomeExpenses(current, previous);
  const esvAmount = ESV_MONTHLY * monthsInPeriod;

  const epRate = TAX_RATES.epGroup3_withoutVat;
  const vzRate = TAX_RATES.militaryTaxFop; // 1% для ФОП (не плутати з 5% для зарплат)
  const epAmount = Math.round(income * epRate);
  const militaryAmount = Math.round(income * vzRate);
  const epVzTotal = epAmount + militaryAmount;

  const allIncomeByMonth = buildMonthlyIncome(current);
  const periodLabel = period === "custom" ? "за обраний період"
    : period === "month" ? "за цей місяць" : period === "quarter" ? "за квартал" : "за рік";

  return [
    {
      id: "income",
      title: "Дохід",
      value: income,
      format: "currency",
      trend: incomeTrend !== 0 ? { value: Math.abs(incomeTrend), direction: incomeTrend > 0 ? "up" : "down" } : undefined,
      description: periodLabel,
      icon: TrendingUp,
      semantic: "income",
      historicalData: allIncomeByMonth,
    },
    {
      id: "expenses",
      title: "Витрати",
      value: expenses,
      format: "currency",
      trend: expensesTrend !== 0 ? { value: Math.abs(expensesTrend), direction: expensesTrend > 0 ? "up" : "down" } : undefined,
      description: periodLabel,
      icon: TrendingDown,
      semantic: "expense",
    },
    {
      id: "ep-vz",
      title: "Орієнтовний ЄП та ВЗ",
      value: epVzTotal,
      format: "currency",
      description: `${(epRate * 100)}%+${(vzRate * 100)}% від доходу`,
      icon: Wallet,
      semantic: "neutral",
      details: [
        { label: "Дохід за період", value: `${income.toLocaleString("uk-UA")} ₴` },
        { label: `ЄП (${(epRate * 100)}%)`, value: `${epAmount.toLocaleString("uk-UA")} ₴` },
        { label: `ВЗ (${(vzRate * 100)}%)`, value: `${militaryAmount.toLocaleString("uk-UA")} ₴` },
        { label: "Разом", value: `${epVzTotal.toLocaleString("uk-UA")} ₴` },
      ],
    },
    {
      id: "esv",
      title: "Орієнтовний ЄСВ",
      value: esvAmount,
      format: "currency",
      description: `мінімальний внесок${monthsInPeriod > 1 ? ` (×${monthsInPeriod} міс.)` : ""}`,
      icon: Receipt,
      semantic: "neutral",
    },
    {
      id: "net-income",
      title: "Чистий дохід",
      value: income - expenses - epVzTotal - esvAmount,
      format: "currency",
      description: "дохід − витрати − ЄП − ВЗ − ЄСВ",
      icon: PiggyBank,
      semantic: (income - expenses - epVzTotal - esvAmount) >= 0 ? "income" : "warning",
      details: [
        { label: "Дохід", value: `${income.toLocaleString("uk-UA")} ₴` },
        { label: "Витрати", value: `-${expenses.toLocaleString("uk-UA")} ₴` },
        { label: "ЄП + ВЗ", value: `-${epVzTotal.toLocaleString("uk-UA")} ₴` },
        { label: "ЄСВ", value: `-${esvAmount.toLocaleString("uk-UA")} ₴` },
        { label: "Чистий дохід", value: `${(income - expenses - epVzTotal - esvAmount).toLocaleString("uk-UA")} ₴` },
      ],
    },
    // Limit usage KPI
    (() => {
      const fopGroup = cabinet.fopGroup as 1 | 2 | 3;
      const yearlyLimit = FOP_INCOME_LIMITS[fopGroup];
      if (yearlyLimit > 0) {
        const currentTotal = cabinet.yearlyIncome || income;
        const percent = Math.round((currentTotal / yearlyLimit) * 100);
        return {
          id: "limit-usage",
          title: "Ліміт доходу",
          value: percent,
          format: "percent" as const,
          description: `${currentTotal.toLocaleString("uk-UA")} з ${yearlyLimit.toLocaleString("uk-UA")} ₴`,
          icon: ShieldAlert,
          semantic: percent > 90 ? "warning" : percent > 80 ? "expense" : "income",
        };
      }
      return null;
    })(),
    // Transaction KPIs
    ...computeTransactionKPIs(current),
    // Document KPIs
    ...computeDocumentKPIs(current),
  ].filter(Boolean) as AnalyticsKPI[];
}

// ---- FOP Groups 1-2 (fixed-rate) ----

function computeFopFixedKPIs(
  current: AnalyticsDataSet,
  previous: AnalyticsDataSet,
  cabinet: Cabinet,
  period: PeriodType,
  monthsInPeriod: number,
): AnalyticsKPI[] {
  const { income, incomeTrend, expenses, expensesTrend } = computeIncomeExpenses(current, previous);
  const fopGroup = cabinet.fopGroup || 2;

  const epFixed = fopGroup === 1 ? EP_FIXED.group1 : EP_FIXED.group2;
  // ВЗ для ФОП груп 1-2 — 1% від МЗП (ЗУ №4015-IX, з 01.12.2024)
  const vzRateFop = TAX_RATES.militaryTaxFop;
  const vzFixed = Math.round(MINIMUM_WAGE * vzRateFop);
  const epTotal = epFixed * monthsInPeriod;
  const vzTotal = vzFixed * monthsInPeriod;
  const esvTotal = ESV_MONTHLY * monthsInPeriod;
  const taxTotal = epTotal + vzTotal + esvTotal;

  const ratePercent = fopGroup === 1 ? 10 : 20;
  const allIncomeByMonth = buildMonthlyIncome(current);
  const periodLabel = period === "custom" ? "за обраний період"
    : period === "month" ? "за цей місяць" : period === "quarter" ? "за квартал" : "за рік";

  const cashflow = income - expenses - taxTotal;

  return [
    {
      id: "income",
      title: "Дохід",
      value: income,
      format: "currency",
      trend: incomeTrend !== 0 ? { value: Math.abs(incomeTrend), direction: incomeTrend > 0 ? "up" : "down" } : undefined,
      description: periodLabel,
      icon: TrendingUp,
      semantic: "income",
      historicalData: allIncomeByMonth,
    },
    {
      id: "expenses",
      title: "Витрати",
      value: expenses,
      format: "currency",
      trend: expensesTrend !== 0 ? { value: Math.abs(expensesTrend), direction: expensesTrend > 0 ? "up" : "down" } : undefined,
      description: periodLabel,
      icon: TrendingDown,
      semantic: "expense",
    },
    {
      id: "tax-total",
      title: "Податкове навантаження",
      value: taxTotal,
      format: "currency",
      description: `фіксований (${ratePercent}% МЗП)${monthsInPeriod > 1 ? ` ×${monthsInPeriod} міс.` : ""}`,
      icon: Wallet,
      semantic: "neutral",
      details: [
        { label: `ЄП (${ratePercent}% від МЗП ${MINIMUM_WAGE.toLocaleString("uk-UA")} ₴)`, value: `${epFixed.toLocaleString("uk-UA")} ₴/міс` },
        { label: `ВЗ (${(vzRateFop * 100)}% від МЗП)`, value: `${vzFixed.toLocaleString("uk-UA")} ₴/міс` },
        { label: `ЄСВ (мін. внесок)`, value: `${ESV_MONTHLY.toLocaleString("uk-UA")} ₴/міс` },
        ...(monthsInPeriod > 1 ? [{ label: `Період (${monthsInPeriod} міс.)`, value: `×${monthsInPeriod}` }] : []),
        { label: "Разом", value: `${taxTotal.toLocaleString("uk-UA")} ₴` },
      ],
    },
    {
      id: "cashflow",
      title: "Cashflow",
      value: cashflow,
      format: "currency",
      description: "дохід − витрати − податки",
      icon: PiggyBank,
      semantic: cashflow >= 0 ? "income" : "warning",
    },
    {
      id: "net-income",
      title: "Чистий дохід",
      value: cashflow,
      format: "currency",
      description: "дохід − витрати − податки",
      icon: PiggyBank,
      semantic: cashflow >= 0 ? "income" : "warning",
      details: [
        { label: "Дохід", value: `${income.toLocaleString("uk-UA")} ₴` },
        { label: "Витрати", value: `-${expenses.toLocaleString("uk-UA")} ₴` },
        { label: "Податки", value: `-${taxTotal.toLocaleString("uk-UA")} ₴` },
        { label: "Чистий", value: `${cashflow.toLocaleString("uk-UA")} ₴` },
      ],
    },
    // Limit usage KPI
    (() => {
      const fGroup = cabinet.fopGroup as 1 | 2;
      const yearlyLimit = FOP_INCOME_LIMITS[fGroup];
      if (yearlyLimit > 0) {
        const currentTotal = cabinet.yearlyIncome || income;
        const percent = Math.round((currentTotal / yearlyLimit) * 100);
        return {
          id: "limit-usage",
          title: "Ліміт доходу",
          value: percent,
          format: "percent" as const,
          description: `${currentTotal.toLocaleString("uk-UA")} з ${yearlyLimit.toLocaleString("uk-UA")} ₴`,
          icon: ShieldAlert,
          semantic: percent > 90 ? "warning" : percent > 80 ? "expense" : "income",
        };
      }
      return null;
    })(),
    // Transaction KPIs
    ...computeTransactionKPIs(current),
    // Document KPIs
    ...computeDocumentKPIs(current),
  ].filter(Boolean) as AnalyticsKPI[];
}

// ---- TOV (Director) ----

function computeTovKPIs(
  current: AnalyticsDataSet,
  previous: AnalyticsDataSet,
  cabinet: Cabinet,
  period: PeriodType,
): AnalyticsKPI[] {
  const { income, incomeTrend, expenses, expensesTrend, salaryExpenses } = computeIncomeExpenses(current, previous);
  const allIncomeByMonth = buildMonthlyIncome(current);
  const periodLabel = period === "custom" ? "за обраний період"
    : period === "month" ? "за цей місяць" : period === "quarter" ? "за квартал" : "за рік";

  // Profit margin
  const profitMargin = income > 0 ? Math.round(((income - expenses) / income) * 1000) / 10 : 0;
  const prevData = computeIncomeExpenses(previous, previous);
  const prevMargin = prevData.income > 0 ? Math.round(((prevData.income - prevData.expenses) / prevData.income) * 1000) / 10 : 0;
  const marginTrend = prevMargin > 0 ? Math.round(profitMargin - prevMargin) : 0;

  // Receivables — overdue contractor payments (treated as receivables for TOV)
  const overdueReceivables = current.contractorPayments.filter(
    p => p.status === "overdue"
  );
  const receivablesAmount = overdueReceivables.reduce((sum, p) => sum + p.amount, 0);

  // Payroll burden — gross salary / revenue
  const grossSalary = current.salaryPayments.reduce((sum, p) => sum + (p.grossAmount || p.amount), 0);
  const payrollBurden = income > 0 ? Math.round((grossSalary / income) * 1000) / 10 : 0;

  return [
    {
      id: "revenue",
      title: "Виручка",
      value: income,
      format: "currency",
      trend: incomeTrend !== 0 ? { value: Math.abs(incomeTrend), direction: incomeTrend > 0 ? "up" : "down" } : undefined,
      description: periodLabel,
      icon: TrendingUp,
      semantic: "income",
      historicalData: allIncomeByMonth,
    },
    {
      id: "profit-margin",
      title: "Рентабельність",
      value: profitMargin,
      format: "percent",
      trend: marginTrend !== 0 ? { value: Math.abs(marginTrend), direction: marginTrend > 0 ? "up" : "down" } : undefined,
      description: `(дохід − витрати) / дохід`,
      icon: Target,
      semantic: profitMargin >= 20 ? "income" : "warning",
    },
    {
      id: "receivables",
      title: "Дебіторка",
      value: receivablesAmount,
      format: "currency",
      description: overdueReceivables.length > 0 ? `${overdueReceivables.length} прострочених` : "немає прострочень",
      icon: AlertTriangle,
      semantic: receivablesAmount > 0 ? "warning" : "neutral",
    },
    {
      id: "payroll-burden",
      title: "ФОП зарплат",
      value: payrollBurden,
      format: "percent",
      description: "зарплати / виручка",
      icon: Users,
      semantic: "neutral",
    },
    {
      id: "total-expenses",
      title: "Загальні витрати",
      value: expenses,
      format: "currency",
      trend: expensesTrend !== 0 ? { value: Math.abs(expensesTrend), direction: expensesTrend > 0 ? "up" : "down" } : undefined,
      description: periodLabel,
      icon: TrendingDown,
      semantic: "expense",
    },
    {
      id: "employee-count",
      title: "Працівники",
      value: current.employees.length,
      format: "number",
      description: `активних у штаті`,
      icon: Users,
      semantic: "neutral",
    },
    // Transaction KPIs
    ...computeTransactionKPIs(current),
    // Document KPIs
    ...computeDocumentKPIs(current),
  ];
}

// ---- Shared: Transaction & Document KPIs ----

function computeTransactionKPIs(data: AnalyticsDataSet): AnalyticsKPI[] {
  const incomeRecords = data.incomeRecords.filter(r => r.status === "income");
  const count = incomeRecords.length;
  const totalIncome = incomeRecords.reduce((s, r) => s + r.inIncomeBook, 0);
  const avgCheck = count > 0 ? Math.round(totalIncome / count) : 0;

  return [
    {
      id: "tx-count",
      title: "Кількість транзакцій",
      value: count,
      format: "number",
      description: "операцій за період",
      icon: CreditCard,
      semantic: "neutral",
    },
    {
      id: "tx-avg-check",
      title: "Середній чек",
      value: avgCheck,
      format: "currency",
      description: count > 0 ? `${count} операцій` : "немає даних",
      icon: CreditCard,
      semantic: "neutral",
    },
  ];
}

function computeDocumentKPIs(data: AnalyticsDataSet): AnalyticsKPI[] {
  const total = data.documents.length;
  if (total === 0) return [];
  const filled = data.documents.filter(d => d.status === "signed" || d.status === "registered").length;
  const fillRate = Math.round((filled / total) * 100);

  return [
    {
      id: "doc-fill-rate",
      title: "Заповненість документів",
      value: fillRate,
      format: "percent",
      description: `${filled} з ${total} завершено`,
      icon: FileCheck,
      semantic: fillRate >= 80 ? "income" : fillRate >= 50 ? "neutral" : "warning",
    },
    {
      id: "doc-total",
      title: "Документи",
      value: total,
      format: "number",
      description: `${filled} підписано`,
      icon: FileText,
      semantic: "neutral",
    },
  ];
}

// ============================================
// CHART DATA GENERATOR
// ============================================

function buildMonthlyIncome(data: AnalyticsDataSet): { month: string; value: number }[] {
  const byMonth: Record<string, number> = {};
  for (const r of data.incomeRecords) {
    if (r.status === "return") continue;
    const m = r.date.slice(0, 7); // "2025-03"
    byMonth[m] = (byMonth[m] || 0) + r.inIncomeBook;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, value]) => ({
      month: SHORT_MONTH_UA[parseInt(month.slice(5, 7)) - 1],
      value,
    }));
}

function computeChartData(data: AnalyticsDataSet): ChartDataPoint[] {
  const months = new Set<string>();

  for (const r of data.incomeRecords) months.add(r.date.slice(0, 7));
  for (const p of data.contractorPayments) months.add(p.date.slice(0, 7));
  for (const p of data.salaryPayments) months.add(p.scheduledDate.slice(0, 7));

  const sorted = Array.from(months).sort();

  return sorted.map(m => {
    const income = data.incomeRecords
      .filter(r => r.date.startsWith(m) && r.status !== "return")
      .reduce((sum, r) => sum + r.inIncomeBook, 0);

    const contExp = data.contractorPayments
      .filter(p => p.date.startsWith(m))
      .reduce((sum, p) => sum + p.amount, 0);
    const salExp = data.salaryPayments
      .filter(p => p.scheduledDate.startsWith(m))
      .reduce((sum, p) => sum + p.amount, 0);
    const expenses = contExp + salExp;

    return {
      month: SHORT_MONTH_UA[parseInt(m.slice(5, 7)) - 1],
      income,
      expenses,
    };
  });
}

// ============================================
// EXPENSE STRUCTURE
// ============================================

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function computeExpenseStructure(data: AnalyticsDataSet): ExpenseStructureItem[] {
  const byType: Record<string, number> = {};

  for (const p of data.contractorPayments) {
    const label = paymentPurposeTypeConfig[p.paymentPurposeType]?.label || "Інше";
    byType[label] = (byType[label] || 0) + p.amount;
  }

  const totalSalary = data.salaryPayments.reduce((sum, p) => sum + p.amount, 0);
  if (totalSalary > 0) {
    byType["Зарплати"] = totalSalary;
  }

  return Object.entries(byType)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], i) => ({
      name,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
}

// ============================================
// RISK DETECTOR
// ============================================

/** Format date string "YYYY-MM-DD" to "DD.MM.YYYY" */
function formatUaDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** Estimate tax penalty — 10% of total (first violation, ПКУ ст. 126.1) */
function estimateTaxPenalty(overdueTax: { amountToPay: number }[]): string {
  const total = overdueTax.reduce((s, t) => s + t.amountToPay, 0);
  const penalty = Math.round(total * 0.10);
  return `~${penalty.toLocaleString("uk-UA")} ₴ штраф`;
}

/** Earliest overdue date from scheduled/deadline dates */
function earliestDate(payments: { scheduledDate?: string; date?: string; deadline?: string }[]): string {
  const dates = payments
    .map(p => p.scheduledDate || p.deadline || p.date || "")
    .filter(Boolean)
    .sort();
  return dates[0] ? formatUaDate(dates[0]) : "";
}

/** Estimate contractor penalty — 3% annual rate (ст. 625 ЦКУ) */
function estimateContractorPenalty(overduePayments: { amount: number; date: string }[]): string {
  const total = overduePayments.reduce((s, p) => s + p.amount, 0);
  const avgDays = 30;
  const penalty = Math.round(total * 0.03 * avgDays / 365);
  return `~${penalty.toLocaleString("uk-UA")} ₴ пеня`;
}

function detectRisks(data: AnalyticsDataSet, cabinet: Cabinet): RiskItem[] {
  const risks: RiskItem[] = [];
  let riskId = 1;
  const currentYear = new Date().getFullYear();

  // 1. Income limit for FOP
  if (cabinet.type === "fop" && cabinet.fopGroup && cabinet.yearlyIncome) {
    const limit = FOP_INCOME_LIMITS[cabinet.fopGroup];
    if (limit > 0) {
      const usage = (cabinet.yearlyIncome / limit) * 100;
      if (usage > 70) {
        const remaining = limit - cabinet.yearlyIncome;
        risks.push({
          id: String(riskId++),
          text: "Наближення до ліміту доходу",
          severity: usage > 90 ? "critical" : "warning",
          icon: ShieldAlert,
          value: `${usage.toFixed(1)}%`,
          impact: `Залишок ${remaining.toLocaleString("uk-UA")} ₴`,
          deadline: `31.12.${currentYear}`,
        });
      }
    }
  }

  // 2. Uncategorized income records
  const uncategorized = data.incomeRecords.filter(r => r.status === "needs-clarification");
  if (uncategorized.length > 0) {
    const uncatSum = uncategorized.reduce((s, r) => s + r.inIncomeBook, 0);
    risks.push({
      id: String(riskId++),
      text: "Операції без категорії",
      severity: uncategorized.length > 5 ? "critical" : "warning",
      icon: Ban,
      value: `${uncategorized.length} шт.`,
      impact: `${uncatSum.toLocaleString("uk-UA")} ₴ без класифікації`,
    });
  }

  // 3. Overdue contractor payments
  const overdue = data.contractorPayments.filter(p => p.status === "overdue");
  if (overdue.length > 0) {
    const overdueAmount = overdue.reduce((sum, p) => sum + p.amount, 0);
    risks.push({
      id: String(riskId++),
      text: "Прострочені платежі контрагентам",
      severity: "critical",
      icon: AlertTriangle,
      value: `${overdueAmount.toLocaleString("uk-UA")} ₴`,
      impact: estimateContractorPenalty(overdue),
      deadline: earliestDate(overdue),
    });
  }

  // 4. Draft/sent documents (unsigned)
  const unsigned = data.documents.filter(d => d.status === "draft" || d.status === "sent");
  if (unsigned.length > 3) {
    risks.push({
      id: String(riskId++),
      text: "Непідписані документи",
      severity: unsigned.length > 7 ? "warning" : "info",
      icon: FileText,
      value: `${unsigned.length} шт.`,
      impact: `${unsigned.length} документів без юридичної сили`,
    });
  }

  // 5. Overdue tax payments
  const overdueTax = data.taxPayments.filter(t => t.status === "overdue");
  if (overdueTax.length > 0) {
    risks.push({
      id: String(riskId++),
      text: "Прострочені податкові платежі",
      severity: "critical",
      icon: AlertTriangle,
      value: `${overdueTax.length} шт.`,
      impact: estimateTaxPenalty(overdueTax),
      deadline: earliestDate(overdueTax),
    });
  }

  return risks;
}

/** Detect forecast-based risks (called after forecasts are computed) */
function detectForecastRisks(forecasts: ForecastItem[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const cashflow = forecasts.find(f => f.id === "forecast-cashflow");
  if (cashflow && typeof cashflow.value === "number" && cashflow.value < 0) {
    risks.push({
      id: "forecast-deficit",
      text: "Прогнозний дефіцит коштів",
      severity: "critical",
      icon: AlertTriangle,
      value: `${cashflow.value.toLocaleString("uk-UA")} ₴`,
      impact: `Очікуваний мінус ${Math.abs(cashflow.value).toLocaleString("uk-UA")} ₴`,
      deadline: undefined,
    });
  }
  return risks;
}

// ============================================
// BENCHMARK HISTORY
// ============================================

function computeBenchmarkHistory(
  data: AnalyticsDataSet,
  cabinet: Cabinet,
): BenchmarkHistoryPoint[] {
  // Group income, taxes, salary by month
  const monthlyIncome: Record<string, number> = {};
  const monthlySalary: Record<string, number> = {};

  for (const r of data.incomeRecords) {
    if (r.status === "return") continue;
    const m = r.date.slice(0, 7);
    monthlyIncome[m] = (monthlyIncome[m] || 0) + r.inIncomeBook;
  }
  for (const p of data.salaryPayments) {
    const m = p.scheduledDate.slice(0, 7);
    monthlySalary[m] = (monthlySalary[m] || 0) + (p.grossAmount || p.amount);
  }

  const allMonths = new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlySalary)]);
  const sorted = Array.from(allMonths).sort().slice(-12);

  const fopGroup = cabinet.fopGroup || 3;

  return sorted.map(m => {
    const inc = monthlyIncome[m] || 0;
    const sal = monthlySalary[m] || 0;

    // Tax calculation per month
    let tax: number;
    if (fopGroup === 3) {
      tax = Math.round(inc * (TAX_RATES.epGroup3_withoutVat + TAX_RATES.militaryTaxFop)) + ESV_MONTHLY;
    } else {
      const epFixed = fopGroup === 1 ? EP_FIXED.group1 : EP_FIXED.group2;
      const vzFixed = Math.round(MINIMUM_WAGE * TAX_RATES.militaryTaxFop);
      tax = epFixed + vzFixed + ESV_MONTHLY;
    }

    const taxBurden = inc > 0 ? Math.round((tax / inc) * 1000) / 10 : 0;
    const laborCost = inc > 0 ? Math.round((sal / inc) * 1000) / 10 : 0;

    return {
      month: m,
      taxBurden,
      laborCost,
    };
  });
}

// ============================================
// FORECAST ENGINE
// ============================================

/** Compute confidence level based on coefficient of variation */
function computeConfidence(values: number[]): "high" | "medium" | "low" {
  if (values.length < 2) return "low";
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  if (avg === 0) return "low";
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length;
  const cv = Math.sqrt(variance) / avg; // coefficient of variation
  if (cv < 0.15) return "high";
  if (cv < 0.35) return "medium";
  return "low";
}

function computeForecasts(data: AnalyticsDataSet, cabinet: Cabinet, period: PeriodType): ForecastItem[] {
  const forecasts: ForecastItem[] = [];

  // Build monthly income trend for extrapolation
  const monthlyIncome: Record<string, number> = {};
  for (const r of data.incomeRecords) {
    if (r.status === "return") continue;
    const m = r.date.slice(0, 7);
    monthlyIncome[m] = (monthlyIncome[m] || 0) + r.inIncomeBook;
  }
  const monthValues = Object.entries(monthlyIncome).sort(([a], [b]) => a.localeCompare(b));
  const recentMonths = monthValues.slice(-3);
  const last6 = monthValues.slice(-6);

  // Build historical data for sparklines
  const incomeHistory = last6.map(([m, v]) => ({
    month: SHORT_MONTH_UA[parseInt(m.slice(5, 7)) - 1],
    value: v,
  }));
  const incomeValues = last6.map(([, v]) => v);

  if (recentMonths.length >= 2) {
    const avgIncome = recentMonths.reduce((sum, [, v]) => sum + v, 0) / recentMonths.length;
    const nextMonthForecast = Math.round(avgIncome);

    forecasts.push({
      id: "forecast-income",
      title: "Прогноз доходу (наступний місяць)",
      value: nextMonthForecast,
      description: "На основі тренду останніх місяців",
      icon: Target,
      status: "positive",
      historicalData: incomeHistory,
      confidence: computeConfidence(incomeValues),
    });

    // Tax forecast — fixed for groups 1-2, percentage for group 3
    const forecastFopGroup = cabinet.fopGroup || 3;
    let forecastTax: number;
    if (forecastFopGroup === 3) {
      forecastTax = Math.round(nextMonthForecast * (TAX_RATES.epGroup3_withoutVat + TAX_RATES.militaryTaxFop)) + ESV_MONTHLY;
    } else {
      const epFixed = forecastFopGroup === 1 ? EP_FIXED.group1 : EP_FIXED.group2;
      const vzFixed = Math.round(MINIMUM_WAGE * TAX_RATES.militaryTaxFop);
      forecastTax = epFixed + vzFixed + ESV_MONTHLY;
    }
    forecasts.push({
      id: "forecast-tax",
      title: "Очікувані податки",
      value: forecastTax,
      description: `ЄП + ВЗ + ЄСВ`,
      icon: PiggyBank,
      status: "neutral",
      confidence: "high", // tax rates are deterministic
    });

    // Cashflow forecast
    const monthlyExpenses: Record<string, number> = {};
    for (const p of data.contractorPayments) {
      const m = p.date.slice(0, 7);
      monthlyExpenses[m] = (monthlyExpenses[m] || 0) + p.amount;
    }
    const expValues = Object.entries(monthlyExpenses).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    const expHistory = expValues.map(([m, v]) => ({
      month: SHORT_MONTH_UA[parseInt(m.slice(5, 7)) - 1],
      value: v,
    }));

    const avgExpenses = data.contractorPayments.length > 0
      ? data.contractorPayments.reduce((sum, p) => sum + p.amount, 0) / Math.max(recentMonths.length, 1)
      : 0;
    const forecastCashflow = Math.round(nextMonthForecast - avgExpenses - forecastTax);

    // Cashflow history: income - expenses per month
    const cashflowHistory = last6.map(([m, inc]) => ({
      month: SHORT_MONTH_UA[parseInt(m.slice(5, 7)) - 1],
      value: inc - (monthlyExpenses[m] || 0),
    }));

    forecasts.push({
      id: "forecast-cashflow",
      title: "Прогноз Cashflow",
      value: forecastCashflow,
      description: "Дохід − витрати − податки",
      icon: Wallet,
      status: forecastCashflow > 0 ? "positive" : "warning",
      historicalData: cashflowHistory,
      confidence: computeConfidence([...incomeValues, ...expValues.map(([, v]) => v)]) === "high" ? "medium" : "low",
    });
  }

  return forecasts;
}

// ============================================
// DATA SOURCES
// ============================================

function computeDataSources(data: AnalyticsDataSet): DataSource[] {
  const sourceMap: Record<string, { count: number; latestDate: string }> = {};

  for (const r of data.incomeRecords) {
    const src = r.source;
    if (!sourceMap[src]) sourceMap[src] = { count: 0, latestDate: "" };
    sourceMap[src].count++;
    if (r.date > sourceMap[src].latestDate) sourceMap[src].latestDate = r.date;
  }

  const sourceLabels: Record<string, { name: string; icon: typeof CreditCard }> = {
    monobank: { name: "Monobank", icon: CreditCard },
    privat24: { name: "Приват24", icon: Building2 },
    way4pay: { name: "Way4Pay", icon: CreditCard },
    liqpay: { name: "LiqPay", icon: CreditCard },
    prro: { name: "ПРРО", icon: FileCheck },
    vchasno: { name: "Вчасно", icon: FileCheck },
    manual: { name: "Ручне введення", icon: FileText },
  };

  return Object.entries(sourceMap).map(([src, info], i) => {
    const label = sourceLabels[src] || { name: src, icon: CreditCard };
    return {
      id: String(i + 1),
      name: label.name,
      icon: label.icon,
      status: "connected" as const,
      lastSync: `${info.count} операцій`,
    };
  });
}

// ============================================
// MAIN: computeAnalytics
// ============================================

export function computeAnalytics(
  fullData: AnalyticsDataSet,
  period: PeriodType,
  customRange?: { from: Date; to: Date },
): CabinetAnalyticsConfig {
  const { current, previous } = period === "custom" && customRange
    ? filterByCustomRange(fullData, customRange.from, customRange.to)
    : filterByPeriod(fullData, period);
  const cabinet = fullData.cabinet;
  const monthsInPeriod = computeMonthsInPeriod(period, customRange);

  const kpis = computeKPIs(current, previous, cabinet, period, monthsInPeriod);
  const chartData = computeChartData(current);
  const expenseStructure = computeExpenseStructure(current);
  const risks = detectRisks(fullData, cabinet);
  const forecasts = computeForecasts(fullData, cabinet, period);
  // Add forecast-based risks
  risks.push(...detectForecastRisks(forecasts));
  const dataSources = computeDataSources(fullData);

  // Chat prompts based on actual data
  const chatPrompts = buildChatPrompts(cabinet, risks);

  // Benchmark metrics — handle different KPI structures
  const totalIncome = kpis.find(k => ["income", "revenue"].includes(k.id))?.value || 1;
  const epVz = kpis.find(k => k.id === "ep-vz")?.value || 0;
  const esv = kpis.find(k => k.id === "esv")?.value || 0;
  const taxTotal = kpis.find(k => k.id === "tax-total")?.value || 0;
  const taxBurdenValue = taxTotal > 0 ? taxTotal : (epVz + esv);
  const salaryTotal = current.salaryPayments.reduce((sum, p) => sum + (p.grossAmount || p.amount), 0);

  const benchmarkMetrics = {
    taxBurden: totalIncome > 0 ? Math.round((taxBurdenValue / totalIncome) * 1000) / 10 : 0,
    laborCost: totalIncome > 0 ? Math.round((salaryTotal / totalIncome) * 1000) / 10 : 0,
  };

  const benchmarkHistory = computeBenchmarkHistory(fullData, cabinet);

  return {
    kpis,
    chartData,
    expenseStructure,
    risks,
    forecasts,
    dataSources,
    chatPrompts,
    benchmarkMetrics,
    benchmarkHistory,
    suggestedIndustry: (cabinet.industry || "consulting") as Industry,
  };
}

function buildChatPrompts(cabinet: Cabinet, risks: RiskItem[]): string[] {
  const prompts: string[] = [];

  if (cabinet.type === "fop" && cabinet.fopGroup) {
    prompts.push("Спрогнозуй, чи перевищу я ліміт у 2025.");
  }

  if (risks.some(r => r.text.includes("категорі"))) {
    prompts.push("Допоможи категоризувати операції без категорії.");
  }

  prompts.push("Покажи, що найбільше впливає на витрати.");
  prompts.push("Сформуй короткий звіт для податкового планування.");
  prompts.push("Порівняй доходи за останні 3 місяці.");

  return prompts.slice(0, 5);
}
