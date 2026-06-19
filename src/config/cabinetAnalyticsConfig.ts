import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt,
  Users,
  AlertTriangle,
  FileText,
  CreditCard,
  Calendar,
  CheckCircle,
  BarChart3,
  ShieldAlert,
  FileCheck,
  Building2,
  Clock,
  Ban,
  RefreshCw,
  Target,
  PiggyBank,
  CircleDollarSign,
  Percent
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CabinetType } from "@/types/cabinet";
import type { Industry, BenchmarkHistoryPoint } from "@/types/comparison";

// Analytics KPI type
export interface AnalyticsKPI {
  id: string;
  title: string;
  value: number;
  format: "currency" | "number" | "percent" | "days";
  trend?: { value: number; direction: "up" | "down" };
  description: string;
  icon: LucideIcon;
  semantic: "income" | "expense" | "neutral" | "warning";
  details?: { label: string; value: string }[];
  historicalData?: { month: string; value: number }[];
}

// Risk/Anomaly type
export interface RiskItem {
  id: string;
  text: string;
  severity: "critical" | "warning" | "info";
  icon: LucideIcon;
  value?: string;
  impact?: string;    // e.g. "~12 000 ₴ штраф", "15 операцій"
  deadline?: string;  // e.g. "20.01.2026"
  priority?: number;  // 1 = highest
  source?: string[];  // e.g. ["daily_calculations", "bank_transactions"]
  status?: "open" | "resolved" | "dismissed";
  title?: string;
  subtitle?: string;
  metric?: { name: string; value: number; unit: string; thresholdWarning?: number; thresholdCritical?: number };
  entity?: { type: "account" | "cabinet" | "counterparty"; id: string; name: string };
  ai?: { explainKey: string; evidenceRefs: string[] };
}

// Forecast type
export interface ForecastItem {
  id: string;
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  status: "positive" | "neutral" | "warning";
  historicalData?: { month: string; value: number }[];
  confidence?: "high" | "medium" | "low";
}

// Data source type
export interface DataSource {
  id: string;
  name: string;
  icon: LucideIcon;
  status: "connected" | "syncing" | "error";
  lastSync?: string;
}

// Chart data point type
export interface ChartDataPoint {
  month: string;
  income?: number;
  expenses?: number;
  profit?: number;
  result?: number;
  taxes?: number;
  accruals?: number;
}

// Expense structure item
export interface ExpenseStructureItem {
  name: string;
  value: number;
  color: string;
}

// FOP contribution in group
export interface FopContribution {
  id: string;
  name: string;
  income: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

// Individual income source
export interface IncomeSource {
  id: string;
  source: string;
  amount: number;
  percentage: number;
  type: "salary" | "rent" | "investment" | "other";
}

// Debtor item for TOV
export interface DebtorItem {
  id: string;
  name: string;
  amount: number;
  daysOverdue: number;
}

// Data quality metric
export interface DataQualityMetric {
  id: string;
  title: string;
  value: number;
  total: number;
  status: "ok" | "warning" | "error";
}

// Benchmark metrics for industry comparison
export interface BenchmarkMetrics {
  taxBurden: number;   // Податки / Дохід * 100
  laborCost: number;   // Зарплати / Дохід * 100
}

// Розрахунок з бюджетом по типах податків (для Focus-блоку «Податки»)
export interface TaxBudgetRow {
  name: string;        // напр. "ЄП 5%", "ВЗ 1%", "ЄСВ", "ПДФО"
  accrued: number;     // нараховано
  paid: number;        // сплачено
  status: "closed" | "pending" | "overdue";
  deadline?: string;   // напр. "до 19.05.2026"
}

// Analytics configuration type
export interface CabinetAnalyticsConfig {
  kpis: AnalyticsKPI[];
  chartData: ChartDataPoint[];
  expenseStructure: ExpenseStructureItem[];
  /**
   * Структура доходів (топ-контрагенти / категорії).
   * Опційна — використовується у Focus-канвасі для метрики Income замість expenseStructure.
   * Якщо не задано — структура для income не показується.
   */
  incomeStructure?: ExpenseStructureItem[];
  risks: RiskItem[];
  forecasts: ForecastItem[];
  dataSources: DataSource[];
  chatPrompts: string[];
  // Type-specific data
  fopContributions?: FopContribution[];
  incomeSources?: IncomeSource[];
  debtors?: DebtorItem[];
  dataQualityMetrics?: DataQualityMetric[];
  // Benchmark data
  benchmarkMetrics?: BenchmarkMetrics;
  suggestedIndustry?: Industry;
  benchmarkHistory?: BenchmarkHistoryPoint[];
  /** Розрахунок з бюджетом по податках (рядки для Focus-метрики «Податки»). */
  taxBudgetBreakdown?: TaxBudgetRow[];
}

// ===== FOP Analytics Configuration =====
const fopAnalyticsConfig: CabinetAnalyticsConfig = {
  kpis: [
    { 
      id: "income", 
      title: "Дохід", 
      value: 85000, 
      format: "currency",
      trend: { value: 12, direction: "up" },
      description: "за цей місяць",
      icon: TrendingUp,
      semantic: "income",
      historicalData: [
        { month: "Лип", value: 72000 },
        { month: "Сер", value: 68000 },
        { month: "Вер", value: 75000 },
        { month: "Жов", value: 82000 },
        { month: "Лис", value: 78000 },
        { month: "Гру", value: 85000 },
      ]
    },
    { 
      id: "expenses", 
      title: "Витрати", 
      value: 28000, 
      format: "currency",
      trend: { value: 3, direction: "down" },
      description: "за цей місяць",
      icon: TrendingDown,
      semantic: "expense",
      historicalData: [
        { month: "Лип", value: 25000 },
        { month: "Сер", value: 30000 },
        { month: "Вер", value: 22000 },
        { month: "Жов", value: 26000 },
        { month: "Лис", value: 24000 },
        { month: "Гру", value: 28000 },
      ]
    },
    { 
      id: "ep-vz", 
      title: "Орієнтовний ЄП та ВЗ", 
      value: 5100, 
      format: "currency",
      description: "5%+1% від доходу",
      icon: Wallet,
      semantic: "neutral",
      details: [
        { label: "Дохід за період", value: "85 000 ₴" },
        { label: "ЄП (5%)", value: "4 250 ₴" },
        { label: "ВЗ (1%)", value: "850 ₴" },
        { label: "Разом", value: "5 100 ₴" }
      ]
    },
    { 
      id: "esv", 
      title: "Орієнтовний ЄСВ", 
      value: 1760, 
      format: "currency",
      description: "мінімальний внесок",
      icon: Receipt,
      semantic: "neutral"
    },
    // ── Розрахунок з бюджетом по податках ──
    { id: "tax-total", title: "Σ нараховано податків", value: 6860, format: "currency", description: "ЄП + ВЗ + ЄСВ", icon: Receipt, semantic: "neutral" },
    { id: "tax-paid", title: "Сплачено податків", value: 5100, format: "currency", description: "ЄП + ВЗ — закрито", icon: CheckCircle, semantic: "income" },
    { id: "tax-debt", title: "Заборгованість бюджету", value: 1760, format: "currency", description: "ЄСВ — очікує сплати", icon: AlertTriangle, semantic: "warning" },
    // ── Ліміт ФОП 3-ї групи ──
    { id: "limit-usage", title: "Використано ліміту", value: 84, format: "percent", description: "річний ліміт групи 3", icon: ShieldAlert, semantic: "warning" },
    { id: "annual-limit", title: "Річний ліміт", value: 8285700, format: "currency", description: "1167 МЗП · 2026", icon: Target, semantic: "neutral" },
    // ── Транзакції / max-check ──
    { id: "max-check", title: "Максимальний чек", value: 22500, format: "currency", description: "за поточний період", icon: TrendingUp, semantic: "income" },
    // ── Перевірки (compliance) ──
    { id: "compl-score", title: "Score відповідності", value: 78, format: "percent", description: "виконано пунктів", icon: ShieldAlert, semantic: "warning" },
    { id: "compl-open", title: "Відкритих ризиків", value: 3, format: "number", description: "потребують уваги", icon: AlertTriangle, semantic: "warning" },
    { id: "compl-deadlines", title: "Найближчих дедлайнів", value: 2, format: "number", description: "у 14 днів", icon: Clock, semantic: "warning" },
    { id: "compl-overdue", title: "Прострочено", value: 1, format: "number", description: "потребує негайного закриття", icon: AlertTriangle, semantic: "expense" },
    // ── Документи ──
    { id: "docs-total", title: "Документів", value: 33, format: "number", description: "за поточний місяць", icon: FileText, semantic: "neutral" },
    { id: "docs-unsigned", title: "Без підпису", value: 4, format: "number", description: "очікують підпису", icon: FileText, semantic: "warning" },
    { id: "docs-overdue", title: "Прострочених", value: 2, format: "number", description: "понад термін", icon: AlertTriangle, semantic: "expense" },
    { id: "docs-actions", title: "Очікують дії", value: 6, format: "number", description: "ваше рішення потрібне", icon: FileCheck, semantic: "warning" },
    // ── Доступи ──
    { id: "access-users", title: "Активних користувачів", value: 2, format: "number", description: "ви + бухгалтер", icon: Users, semantic: "neutral" },
    { id: "access-roles", title: "Унікальних ролей", value: 2, format: "number", description: "власник, бухгалтер", icon: ShieldAlert, semantic: "neutral" },
    { id: "access-2fa", title: "2FA увімкнено", value: 100, format: "percent", description: "усі акаунти захищені", icon: CheckCircle, semantic: "income" },
    { id: "access-recent", title: "Заходів за 7 днів", value: 12, format: "number", description: "сесій авторизації", icon: Clock, semantic: "neutral" },
  ],
  chartData: [
    { month: "Лип", income: 72000, expenses: 25000 },
    { month: "Сер", income: 68000, expenses: 30000 },
    { month: "Вер", income: 75000, expenses: 22000 },
    { month: "Жов", income: 82000, expenses: 26000 },
    { month: "Лис", income: 78000, expenses: 24000 },
    { month: "Гру", income: 85000, expenses: 28000 },
  ],
  expenseStructure: [
    { name: "Оренда", value: 10000, color: "hsl(var(--chart-1))" },
    { name: "Реклама", value: 8000, color: "hsl(var(--chart-2))" },
    { name: "Підрядники", value: 7000, color: "hsl(var(--chart-3))" },
    { name: "Інше", value: 3000, color: "hsl(var(--chart-4))" },
  ],
  incomeStructure: [
    { name: "ТОВ «Альфа»", value: 35000, color: "hsl(var(--chart-1))" },
    { name: "ФОП Петренко", value: 22000, color: "hsl(var(--chart-2))" },
    { name: "ТОВ «Дельта»", value: 18000, color: "hsl(var(--chart-3))" },
    { name: "Інші клієнти", value: 10000, color: "hsl(var(--chart-4))" },
  ],
  risks: [
    { id: "risk_limit_fop_usage_87", text: "Наближення до ліміту доходу", severity: "critical", icon: ShieldAlert, value: "87.6%", impact: "~50 000 ₴ перевищення", deadline: "31.03.2026", priority: 1, source: ["daily_calculations"], status: "open", title: "Критичне наближення до ліміту", subtitle: "87.6% використання, ~50 днів до 100%", metric: { name: "limit_usage", value: 87.6, unit: "%", thresholdWarning: 80, thresholdCritical: 95 }, entity: { type: "account", id: "fop-1", name: "ФОП Іваненко" }, ai: { explainKey: "risk_limit_critical", evidenceRefs: ["ev_calc_limit_ytd"] } },
    { id: "risk_data_fop_uncategorized_8", text: "Операції без категорії", severity: "warning", icon: AlertTriangle, value: "8 шт.", priority: 2, source: ["bank_transactions"], status: "open", title: "Операції без категорії", subtitle: "8 операцій потребують класифікації", metric: { name: "uncategorized_ops", value: 8, unit: "шт." }, entity: { type: "account", id: "fop-1", name: "ФОП Іваненко" }, ai: { explainKey: "risk_data_uncategorized", evidenceRefs: ["ev_bank_mono_ops"] } },
    { id: "risk_data_fop_statement_missing", text: "Відсутня виписка за листопад", severity: "info", icon: FileText, priority: 3, source: ["bank_sync"], status: "open", title: "Відсутня виписка", subtitle: "Листопад — дані не завантажені", entity: { type: "account", id: "fop-1", name: "ФОП Іваненко" }, ai: { explainKey: "risk_data_missing_statement", evidenceRefs: ["ev_bank_privat_sync"] } },
  ],
  forecasts: [
    { id: "1", title: "Прогноз доходу до кінця року", value: 102000, description: "При поточному темпі", icon: Target, status: "positive" },
    { id: "2", title: "Очікуваний ЄП (Q4)", value: 12750, description: "На основі прогнозу", icon: PiggyBank, status: "neutral" },
    { id: "3", title: "Очікуваний ЄСВ (Q4)", value: 5280, description: "Мінімальний внесок", icon: Receipt, status: "neutral" },
  ],
  dataSources: [
    { id: "1", name: "Monobank", icon: CreditCard, status: "connected", lastSync: "5 хв. тому" },
    { id: "2", name: "Приват24", icon: Building2, status: "syncing", lastSync: "Синхронізація..." },
    { id: "3", name: "vchasno", icon: FileCheck, status: "error", lastSync: "Помилка підключення" },
  ],
  chatPrompts: [
    "Спрогнозуй, чи перевищу я ліміт у 2025.",
    "Покажи, що найбільше впливає на витрати.",
    "Сформуй короткий звіт для податкового планування.",
    "Порівняй доходи за останні 3 місяці.",
  ],
  benchmarkMetrics: {
    taxBurden: 6.0, // (ЄП 5% + ВЗ 1%) від доходу
    laborCost: 0,   // Немає найманих працівників
  },
  suggestedIndustry: "consulting" as Industry,
  benchmarkHistory: [
    { month: "2024-01", taxBurden: 6.8, laborCost: 0 },
    { month: "2024-02", taxBurden: 6.5, laborCost: 0 },
    { month: "2024-03", taxBurden: 6.2, laborCost: 0 },
    { month: "2024-04", taxBurden: 6.4, laborCost: 0 },
    { month: "2024-05", taxBurden: 6.1, laborCost: 0 },
    { month: "2024-06", taxBurden: 5.8, laborCost: 0 },
    { month: "2024-07", taxBurden: 5.9, laborCost: 0 },
    { month: "2024-08", taxBurden: 5.7, laborCost: 0 },
    { month: "2024-09", taxBurden: 5.5, laborCost: 0 },
    { month: "2024-10", taxBurden: 5.3, laborCost: 0 },
    { month: "2024-11", taxBurden: 5.1, laborCost: 0 },
    { month: "2024-12", taxBurden: 6.0, laborCost: 0 },
  ],
  taxBudgetBreakdown: [
    { name: "ЄП 5%", accrued: 4250, paid: 4250, status: "closed" },
    { name: "ВЗ 1%", accrued: 850, paid: 850, status: "closed" },
    { name: "ЄСВ", accrued: 1760, paid: 0, status: "pending", deadline: "до 19.05.2026" },
  ],
};

// ===== TOV Director Analytics Configuration =====
const tovDirectorAnalyticsConfig: CabinetAnalyticsConfig = {
  kpis: [
    { 
      id: "revenue", 
      title: "Виручка", 
      value: 1200000, 
      format: "currency",
      trend: { value: 8, direction: "up" },
      description: "за цей місяць",
      icon: TrendingUp,
      semantic: "income",
      historicalData: [
        { month: "Лип", value: 980000 },
        { month: "Сер", value: 1050000 },
        { month: "Вер", value: 1100000 },
        { month: "Жов", value: 1150000 },
        { month: "Лис", value: 1180000 },
        { month: "Гру", value: 1200000 },
      ]
    },
    { 
      id: "profit-margin", 
      title: "Рентабельність", 
      value: 40, 
      format: "percent",
      trend: { value: 3, direction: "up" },
      description: "(дохід − витрати) / дохід",
      icon: Percent,
      semantic: "income",
    },
    { 
      id: "receivables", 
      title: "Дебіторка", 
      value: 185000, 
      format: "currency",
      description: "3 прострочених",
      icon: Clock,
      semantic: "warning"
    },
    { 
      id: "payroll-burden", 
      title: "ФОП зарплат", 
      value: 23.3, 
      format: "percent",
      description: "зарплати / виручка",
      icon: Users,
      semantic: "neutral"
    },
  ],
  chartData: [
    { month: "Лип", income: 980000, expenses: 650000, result: 330000 },
    { month: "Сер", income: 1050000, expenses: 680000, result: 370000 },
    { month: "Вер", income: 1100000, expenses: 700000, result: 400000 },
    { month: "Жов", income: 1150000, expenses: 710000, result: 440000 },
    { month: "Лис", income: 1180000, expenses: 715000, result: 465000 },
    { month: "Гру", income: 1200000, expenses: 720000, result: 480000 },
  ],
  expenseStructure: [
    { name: "Зарплати", value: 280000, color: "hsl(var(--chart-1))" },
    { name: "Оренда", value: 180000, color: "hsl(var(--chart-2))" },
    { name: "Матеріали", value: 150000, color: "hsl(var(--chart-3))" },
    { name: "Маркетинг", value: 70000, color: "hsl(var(--chart-4))" },
    { name: "Інше", value: 40000, color: "hsl(var(--chart-5))" },
  ],
  risks: [
    { id: "risk_finance_tov_expense_growth", text: "Витрати ростуть швидше за виручку", severity: "critical", icon: AlertTriangle, value: "+5% vs +8%", impact: "Маржа під тиском", priority: 1, source: ["daily_calculations"], status: "open", title: "Витрати випереджають виручку", subtitle: "Темп витрат +5% vs виручка +8% — маржа під тиском", metric: { name: "expense_growth_rate", value: 5, unit: "%" }, entity: { type: "cabinet", id: "tov-1", name: "ТОВ «Компанія»" }, ai: { explainKey: "risk_finance_expense_growth", evidenceRefs: ["ev_calc_expense_trend"] } },
    { id: "risk_finance_tov_cashflow_gap", text: "Ризик касового розриву", severity: "critical", icon: ShieldAlert, value: "через 45 днів", impact: "Дефіцит ~200 000 ₴", priority: 1, source: ["daily_calculations", "bank_transactions"], status: "open", title: "Ризик касового розриву", subtitle: "Дефіцит ~200 000 ₴ через 45 днів", metric: { name: "cashflow_gap_days", value: 45, unit: "днів" }, entity: { type: "cabinet", id: "tov-1", name: "ТОВ «Компанія»" }, ai: { explainKey: "risk_finance_cashflow_gap", evidenceRefs: ["ev_calc_cashflow_forecast", "ev_bank_balance"] } },
    { id: "risk_compliance_tov_overdue_debt", text: "Прострочена дебіторська заборгованість", severity: "warning", icon: Clock, value: "185 000 грн", impact: "3 контрагенти", priority: 2, source: ["accounting_system"], status: "open", title: "Прострочена дебіторка", subtitle: "185 000 ₴ від 3 контрагентів", metric: { name: "overdue_receivables", value: 185000, unit: "₴" }, entity: { type: "cabinet", id: "tov-1", name: "ТОВ «Компанія»" }, ai: { explainKey: "risk_compliance_overdue_debt", evidenceRefs: ["ev_accounting_receivables"] } },
  ],
  forecasts: [
    { id: "1", title: "Прогноз Cashflow (Q1)", value: 450000, description: "Очікуваний залишок", icon: CircleDollarSign, status: "positive" },
    { id: "2", title: "Прогноз податків (Q1)", value: 468000, description: "До сплати", icon: Wallet, status: "warning" },
    { id: "3", title: "Прогноз виручки (Q1)", value: 3600000, description: "При поточному темпі", icon: Target, status: "positive" },
  ],
  dataSources: [
    { id: "1", name: "M.E.Doc", icon: FileCheck, status: "connected", lastSync: "1 год. тому" },
    { id: "2", name: "Monobank", icon: CreditCard, status: "connected", lastSync: "10 хв. тому" },
    { id: "3", name: "1С:Бухгалтерія", icon: BarChart3, status: "connected", lastSync: "2 год. тому" },
    { id: "4", name: "vchasno", icon: FileText, status: "syncing" },
  ],
  chatPrompts: [
    "Сформуй директорське резюме за місяць.",
    "Покажи топ витратні категорії.",
    "Чи є ризик нестачі коштів на зарплати?",
    "Порівняй рентабельність за квартали.",
  ],
  debtors: [
    { id: "1", name: "ТОВ «Партнер»", amount: 85000, daysOverdue: 15 },
    { id: "2", name: "ПП «Постачальник»", amount: 62000, daysOverdue: 8 },
    { id: "3", name: "ФОП Клієнт", amount: 38000, daysOverdue: 3 },
  ],
  benchmarkMetrics: {
    taxBurden: 13.0, // Податки 156000 / Виручка 1200000 * 100
    laborCost: 23.3, // ФОП 280000 / Виручка 1200000 * 100
  },
  suggestedIndustry: "services" as Industry,
  benchmarkHistory: [
    { month: "2024-01", taxBurden: 14.5, laborCost: 25.0 },
    { month: "2024-02", taxBurden: 14.2, laborCost: 24.5 },
    { month: "2024-03", taxBurden: 13.8, laborCost: 24.0 },
    { month: "2024-04", taxBurden: 13.5, laborCost: 23.8 },
    { month: "2024-05", taxBurden: 13.6, laborCost: 24.2 },
    { month: "2024-06", taxBurden: 13.2, laborCost: 23.5 },
    { month: "2024-07", taxBurden: 13.0, laborCost: 23.0 },
    { month: "2024-08", taxBurden: 12.8, laborCost: 22.8 },
    { month: "2024-09", taxBurden: 13.1, laborCost: 23.2 },
    { month: "2024-10", taxBurden: 12.9, laborCost: 23.0 },
    { month: "2024-11", taxBurden: 12.7, laborCost: 23.1 },
    { month: "2024-12", taxBurden: 13.0, laborCost: 23.3 },
  ],
};

// ===== TOV Accountant Analytics Configuration =====
const tovAccountantAnalyticsConfig: CabinetAnalyticsConfig = {
  kpis: [
    { 
      id: "docs-pending", 
      title: "Документи без статусу", 
      value: 12, 
      format: "number",
      description: "потребують обробки",
      icon: FileText,
      semantic: "warning"
    },
    { 
      id: "ops-uncategorized", 
      title: "Операції без категорії", 
      value: 28, 
      format: "number",
      description: "потребують класифікації",
      icon: Ban,
      semantic: "warning"
    },
    { 
      id: "periods-open", 
      title: "Незакриті періоди", 
      value: 2, 
      format: "number",
      description: "листопад, грудень",
      icon: Calendar,
      semantic: "warning"
    },
    { 
      id: "reports-pending", 
      title: "Звіти до підготовки", 
      value: 4, 
      format: "number",
      description: "на цей місяць",
      icon: FileCheck,
      semantic: "neutral"
    },
  ],
  chartData: [
    { month: "Вер", accruals: 145000 },
    { month: "Жов", accruals: 152000 },
    { month: "Лис", accruals: 148000 },
    { month: "Гру", accruals: 156000 },
  ],
  expenseStructure: [],
  risks: [
    { id: "risk_data_tov_discrepancy_15", text: "Розбіжність даних Monobank vs 1С", severity: "critical", icon: RefreshCw, value: "15 операцій", impact: "Некоректна звітність", priority: 1, source: ["bank_transactions", "accounting_system"], status: "open", title: "Розбіжність банк vs облік", subtitle: "15 операцій не збігаються між Monobank та 1С", metric: { name: "data_discrepancy_ops", value: 15, unit: "шт." }, entity: { type: "cabinet", id: "tov-1", name: "ТОВ «Компанія»" }, ai: { explainKey: "risk_data_discrepancy", evidenceRefs: ["ev_bank_mono_ops", "ev_accounting_1c_ops"] } },
    { id: "risk_compliance_tov_unsigned_docs", text: "Непідписані документи vchasno", severity: "warning", icon: FileText, value: "7 шт.", deadline: "20.02.2026", priority: 2, source: ["document_system"], status: "open", title: "Непідписані документи", subtitle: "7 документів очікують підпису до 20.02.2026", metric: { name: "unsigned_docs", value: 7, unit: "шт." }, entity: { type: "cabinet", id: "tov-1", name: "ТОВ «Компанія»" }, ai: { explainKey: "risk_compliance_unsigned_docs", evidenceRefs: ["ev_docs_vchasno_pending"] } },
    { id: "risk_operations_tov_no_requisites", text: "Контрагент без реквізитів", severity: "info", icon: Building2, value: "3 шт.", priority: 3, source: ["accounting_system"], status: "open", title: "Контрагенти без реквізитів", subtitle: "3 контрагенти потребують заповнення реквізитів", metric: { name: "missing_requisites", value: 3, unit: "шт." }, entity: { type: "cabinet", id: "tov-1", name: "ТОВ «Компанія»" }, ai: { explainKey: "risk_operations_no_requisites", evidenceRefs: ["ev_accounting_counterparties"] } },
  ],
  forecasts: [
    { id: "1", title: "Навантаження на закриття періоду", value: "Високе", description: "28 операцій + 12 документів", icon: Clock, status: "warning" },
    { id: "2", title: "Прогноз готовності звітів", value: "85%", description: "До 20 числа", icon: CheckCircle, status: "positive" },
  ],
  dataSources: [
    { id: "1", name: "M.E.Doc", icon: FileCheck, status: "connected", lastSync: "1 год. тому" },
    { id: "2", name: "Monobank", icon: CreditCard, status: "connected", lastSync: "10 хв. тому" },
    { id: "3", name: "1С:Бухгалтерія", icon: BarChart3, status: "error", lastSync: "Помилка синхронізації" },
    { id: "4", name: "vchasno", icon: FileText, status: "syncing" },
  ],
  chatPrompts: [
    "Покажи операції без категорії.",
    "Сформуй список задач для закриття місяця.",
    "Які документи потребують підпису?",
    "Порівняй дані з банком та 1С.",
  ],
  dataQualityMetrics: [
    { id: "1", title: "Документи з підписом", value: 145, total: 157, status: "warning" },
    { id: "2", title: "Операції з категорією", value: 892, total: 920, status: "ok" },
    { id: "3", title: "Контрагенти з реквізитами", value: 47, total: 50, status: "ok" },
    { id: "4", title: "Синхронізація інтеграцій", value: 3, total: 4, status: "warning" },
  ],
  // Accountant view doesn't show benchmark - it's operational focused
};

// ===== FOP Group Analytics Configuration =====
const fopGroupAnalyticsConfig: CabinetAnalyticsConfig = {
  kpis: [
    { 
      id: "total-income", 
      title: "Сумарний дохід", 
      value: 380000, 
      format: "currency",
      trend: { value: 15, direction: "up" },
      description: "за цей місяць",
      icon: TrendingUp,
      semantic: "income"
    },
    { 
      id: "fop-count", 
      title: "Кількість ФОП", 
      value: 5, 
      format: "number",
      description: "активних",
      icon: Users,
      semantic: "neutral"
    },
    { 
      id: "risks", 
      title: "Ризики", 
      value: 2, 
      format: "number",
      description: "потребують уваги",
      icon: ShieldAlert,
      semantic: "warning"
    },
    { 
      id: "average", 
      title: "Середній дохід", 
      value: 76000, 
      format: "currency",
      description: "на одного ФОП",
      icon: BarChart3,
      semantic: "neutral"
    },
  ],
  chartData: [
    { month: "Жов", income: 320000 },
    { month: "Лис", income: 350000 },
    { month: "Гру", income: 380000 },
  ],
  expenseStructure: [],
  risks: [
    { id: "risk_limit_group_petrenko_87", text: "ФОП Петренко: наближення до ліміту 2 групи", severity: "critical", icon: AlertTriangle, value: "87.6%", impact: "Перевищення ліміту", priority: 1, source: ["daily_calculations"], status: "open" },
    { id: "risk_data_group_pumb_sync", text: "ФОП Сидоренко: відсутня синхронізація ПУМБ", severity: "warning", icon: RefreshCw, priority: 2, source: ["bank_sync"], status: "open" },
    { id: "risk_compliance_group_deadlines", text: "Дедлайни по 2 ФОП наближаються", severity: "critical", icon: Calendar, value: "3-5 днів", impact: "Штраф ~3 400 ₴", priority: 1, source: ["daily_calculations"], status: "open" },
  ],
  forecasts: [
    { id: "1", title: "Прогноз сумарного доходу групи", value: 420000, description: "Наступний місяць", icon: Target, status: "positive" },
    { id: "2", title: "Прогноз податкового навантаження", value: 38000, description: "ЄП + ЄСВ групи", icon: Wallet, status: "neutral" },
  ],
  dataSources: [
    { id: "1", name: "Monobank", icon: CreditCard, status: "connected", lastSync: "5 хв. тому" },
    { id: "2", name: "Приват24", icon: Building2, status: "connected", lastSync: "15 хв. тому" },
    { id: "3", name: "ПУМБ", icon: Building2, status: "error", lastSync: "Помилка підключення" },
  ],
  chatPrompts: [
    "Покажи ФОП з найвищим ризиком.",
    "Порівняй доходи ФОП у групі за цей місяць.",
    "Сформуй зведення дедлайнів на 30 днів.",
    "Хто з ФОП наближається до ліміту?",
  ],
  fopContributions: [
    { id: "1", name: "ФОП Коваленко А.В.", income: 95000, percentage: 25, trend: "up" },
    { id: "2", name: "ФОП Петренко О.В.", income: 85000, percentage: 22, trend: "stable" },
    { id: "3", name: "ФОП Іваненко І.І.", income: 78000, percentage: 21, trend: "up" },
    { id: "4", name: "ФОП Сидоренко М.П.", income: 68000, percentage: 18, trend: "down" },
    { id: "5", name: "ФОП Шевченко К.Л.", income: 54000, percentage: 14, trend: "stable" },
  ],
  benchmarkMetrics: {
    taxBurden: 10.0, // Aggregated tax burden for group
    laborCost: 5.0,  // Some FOP have employees
  },
  suggestedIndustry: "consulting" as Industry,
  benchmarkHistory: [
    { month: "2024-01", taxBurden: 11.2, laborCost: 6.0 },
    { month: "2024-02", taxBurden: 11.0, laborCost: 5.8 },
    { month: "2024-03", taxBurden: 10.8, laborCost: 5.5 },
    { month: "2024-04", taxBurden: 10.5, laborCost: 5.3 },
    { month: "2024-05", taxBurden: 10.3, laborCost: 5.2 },
    { month: "2024-06", taxBurden: 10.4, laborCost: 5.1 },
    { month: "2024-07", taxBurden: 10.2, laborCost: 5.0 },
    { month: "2024-08", taxBurden: 10.0, laborCost: 4.9 },
    { month: "2024-09", taxBurden: 9.8, laborCost: 5.0 },
    { month: "2024-10", taxBurden: 9.9, laborCost: 5.1 },
    { month: "2024-11", taxBurden: 10.1, laborCost: 5.0 },
    { month: "2024-12", taxBurden: 10.0, laborCost: 5.0 },
  ],
};

// ===== Individual Analytics Configuration =====
const individualAnalyticsConfig: CabinetAnalyticsConfig = {
  kpis: [
    { 
      id: "taxes-ytd", 
      title: "Нараховано податків YTD", 
      value: 14500, 
      format: "currency",
      description: "з початку року",
      icon: Wallet,
      semantic: "expense"
    },
    { 
      id: "declarations", 
      title: "Декларацій подано", 
      value: 2, 
      format: "number",
      description: "за цей рік",
      icon: CheckCircle,
      semantic: "neutral"
    },
    { 
      id: "pending", 
      title: "Очікувані платежі", 
      value: 8400, 
      format: "currency",
      description: "до сплати",
      icon: Clock,
      semantic: "warning"
    },
    { 
      id: "next-deadline", 
      title: "Днів до дедлайну", 
      value: 15, 
      format: "days",
      description: "декларація про доходи",
      icon: Calendar,
      semantic: "neutral"
    },
  ],
  chartData: [
    { month: "Січ", accruals: 1200 },
    { month: "Лют", accruals: 1200 },
    { month: "Бер", accruals: 1500 },
    { month: "Кві", accruals: 1200 },
    { month: "Тра", accruals: 1200 },
    { month: "Чер", accruals: 1800 },
    { month: "Лип", accruals: 1200 },
    { month: "Сер", accruals: 1200 },
    { month: "Вер", accruals: 1200 },
    { month: "Жов", accruals: 1300 },
    { month: "Лис", accruals: 1300 },
    { month: "Гру", accruals: 1200 },
  ],
  expenseStructure: [],
  risks: [
    { id: "risk_compliance_ind_declaration_15d", text: "Наближення дедлайну декларації", severity: "critical", icon: Calendar, value: "15 днів", impact: "Штраф за несвоєчасну подачу", deadline: "28.02.2026", priority: 1, source: ["tax_calendar"], status: "open" },
    { id: "risk_data_ind_dia_incomplete", text: "Неповні дані з Дія", severity: "warning", icon: RefreshCw, value: "2 записи", priority: 2, source: ["dia_integration"], status: "open" },
    { id: "risk_operations_ind_new_records", text: "Нові записи для перевірки", severity: "info", icon: FileText, value: "3 шт.", priority: 3, source: ["manual_entry"], status: "open" },
  ],
  forecasts: [
    { id: "1", title: "Прогноз платежів до кінця року", value: 9600, description: "ПДФО + військовий збір", icon: Wallet, status: "neutral" },
    { id: "2", title: "Рекомендація відкласти", value: 3200, description: "На наступний квартал", icon: PiggyBank, status: "positive" },
  ],
  dataSources: [
    { id: "1", name: "Дія", icon: FileCheck, status: "connected", lastSync: "1 день тому" },
    { id: "2", name: "Monobank", icon: CreditCard, status: "syncing", lastSync: "Синхронізація..." },
  ],
  chatPrompts: [
    "Поясни, з чого складається сума нарахувань.",
    "Підготуй чернетку декларації.",
    "Які платежі мені треба зробити найближчим часом?",
    "Чи маю право на податкову знижку?",
  ],
  incomeSources: [
    { id: "1", source: "Заробітна плата", amount: 84000, percentage: 58, type: "salary" },
    { id: "2", source: "Оренда квартири", amount: 42000, percentage: 29, type: "rent" },
    { id: "3", source: "Дивіденди", amount: 18500, percentage: 13, type: "investment" },
  ],
  benchmarkMetrics: {
    taxBurden: 10.0, // ПДФО + військовий збір
    laborCost: 0,    // N/A for individual
  },
  // Individual doesn't need industry benchmark
};

// ===== Passive Cabinet Analytics Configuration =====
const passiveAnalyticsConfig: CabinetAnalyticsConfig = {
  kpis: [
    { 
      id: "total-docs", 
      title: "Документів", 
      value: 5, 
      format: "number",
      description: "від партнера",
      icon: FileText,
      semantic: "neutral"
    },
    { 
      id: "pending-sign", 
      title: "Очікують підпису", 
      value: 2, 
      format: "number",
      description: "потребують дії",
      icon: FileCheck,
      semantic: "warning"
    },
    { 
      id: "turnover", 
      title: "Оборот", 
      value: 125000, 
      format: "currency",
      trend: { value: 8, direction: "up" },
      description: "з партнером",
      icon: TrendingUp,
      semantic: "income",
      historicalData: [
        { month: "Лип", value: 45000 },
        { month: "Сер", value: 52000 },
        { month: "Вер", value: 48000 },
        { month: "Жов", value: 55000 },
        { month: "Лис", value: 62000 },
        { month: "Гру", value: 125000 },
      ]
    },
    { 
      id: "payments-received", 
      title: "Отримано", 
      value: 3, 
      format: "number",
      description: "платежів",
      icon: CreditCard,
      semantic: "neutral"
    },
  ],
  chartData: [
    { month: "Лип", income: 45000 },
    { month: "Сер", income: 52000 },
    { month: "Вер", income: 48000 },
    { month: "Жов", income: 55000 },
    { month: "Лис", income: 62000 },
    { month: "Гру", income: 68000 },
  ],
  expenseStructure: [], // Not relevant for passive cabinet
  risks: [], // Passive cabinet has no business risks to display
  forecasts: [], // No forecasts for passive cabinet
  dataSources: [], // Simplified - no integrations display
  chatPrompts: [
    "Покажи історію документів від партнера.",
    "Які документи потребують мого підпису?",
    "Підготуй звіт по оборотах з партнером.",
  ],
};

// Export configurations by cabinet type
export const analyticsConfigs = {
  fop: fopAnalyticsConfig,
  "tov-director": tovDirectorAnalyticsConfig,
  "tov-accountant": tovAccountantAnalyticsConfig,
  "fop-group": fopGroupAnalyticsConfig,
  individual: individualAnalyticsConfig,
  passive: passiveAnalyticsConfig,
};

// Helper to get config by cabinet type and mode
export const getAnalyticsConfig = (
  type: CabinetType, 
  mode?: "director" | "accountant",
  isPassive?: boolean
): CabinetAnalyticsConfig => {
  // Return passive config for passive cabinets
  if (isPassive) {
    return analyticsConfigs.passive;
  }
  
  if (type === "tov") {
    return mode === "accountant" 
      ? analyticsConfigs["tov-accountant"]
      : analyticsConfigs["tov-director"];
  }
  return analyticsConfigs[type] || analyticsConfigs.fop;
};
