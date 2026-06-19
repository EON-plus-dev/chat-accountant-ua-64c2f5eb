/**
 * Financial Monitoring Configuration
 * Unified income/expense ledger for Individual (Фіз. особа) cabinet
 */

import {
  Briefcase,
  Home,
  TrendingUp,
  Gift,
  Car,
  Laptop,
  Receipt,
  HelpCircle,
  CreditCard,
  FileText,
  BarChart3,
  PenLine,
  Heart,
  GraduationCap,
  Shield,
  Zap,
  Building2,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

// ========== TYPES ==========

export type FinDirection = "income" | "expense";

export type FinCategory =
  | "salary"
  | "rent"
  | "investment"
  | "gift"
  | "sale"
  | "freelance"
  | "dividend"
  | "education"
  | "medical"
  | "utilities"
  | "insurance"
  | "tax-paid"
  | "transport"
  | "inheritance"
  | "crypto"
  | "lottery"
  | "charity"
  | "other";

export type FinSource = "monobank" | "privat24" | "ibkr" | "document" | "manual";

export type FinSourceTab = "investments" | "property" | "tax-discount" | "salary" | "freelance" | "manual";

export type FinRecordStatus = "confirmed" | "pending" | "needs-review";

export const finSourceTabLabels: Record<FinSourceTab, string> = {
  investments: "Інвестиції",
  property: "Майно",
  "tax-discount": "Податкова знижка",
  salary: "Зарплата",
  freelance: "Фріланс",
  manual: "Ручний запис",
};

export interface FinTaxImplication {
  pdfo: number;       // ПДФО amount
  vz: number;         // ВЗ amount
  rate?: string;      // e.g. "18% + 5%"
  article?: string;   // e.g. "ст. 173.2 ПКУ"
}

export interface FinMonitoringRecord {
  id: string;
  date: string;           // ISO date
  description: string;
  amount: number;
  direction: FinDirection;
  category: FinCategory;
  source: FinSource;
  sourceRef?: string;     // linked document or record ID
  taxImplication?: FinTaxImplication;
  contractor?: string;
  contractorCode?: string;
  status: FinRecordStatus;
  linkedDocuments: string[];
  currency?: string;      // default UAH
  sourceTab?: FinSourceTab; // which operations tab this record originated from
}

// ========== CATEGORY CONFIG ==========

export interface FinCategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  badgeClass: string;
}

export const finCategoryConfig: Record<FinCategory, FinCategoryConfig> = {
  salary: {
    label: "Зарплата",
    icon: Briefcase,
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  },
  rent: {
    label: "Оренда",
    icon: Home,
    color: "violet",
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  },
  investment: {
    label: "Інвестиції",
    icon: TrendingUp,
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  gift: {
    label: "Подарунок",
    icon: Gift,
    color: "pink",
    badgeClass: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400",
  },
  sale: {
    label: "Продаж",
    icon: HandCoins,
    color: "amber",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  },
  freelance: {
    label: "Фріланс / ЦПД",
    icon: Laptop,
    color: "cyan",
    badgeClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
  },
  dividend: {
    label: "Дивіденди",
    icon: BarChart3,
    color: "teal",
    badgeClass: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
  },
  education: {
    label: "Навчання",
    icon: GraduationCap,
    color: "indigo",
    badgeClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
  },
  medical: {
    label: "Медицина",
    icon: Heart,
    color: "rose",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  },
  utilities: {
    label: "Комунальні",
    icon: Zap,
    color: "orange",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
  },
  insurance: {
    label: "Страхування",
    icon: Shield,
    color: "sky",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  },
  "tax-paid": {
    label: "Податок сплачено",
    icon: Building2,
    color: "slate",
    badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  },
  transport: {
    label: "Транспорт",
    icon: Car,
    color: "zinc",
    badgeClass: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400",
  },
  inheritance: {
    label: "Спадщина",
    icon: Receipt,
    color: "purple",
    badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
  },
  crypto: {
    label: "Криптовалюта",
    icon: TrendingUp,
    color: "yellow",
    badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400",
  },
  lottery: {
    label: "Лотерея",
    icon: Gift,
    color: "fuchsia",
    badgeClass: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-400",
  },
  charity: {
    label: "Благодійність",
    icon: Heart,
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  other: {
    label: "Інше",
    icon: HelpCircle,
    color: "gray",
    badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  },
};

// ========== SOURCE CONFIG ==========

export interface FinSourceConfig {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  badgeClass: string;
}

export const finSourceConfig: Record<FinSource, FinSourceConfig> = {
  monobank: {
    label: "Monobank",
    shortLabel: "Mono",
    icon: CreditCard,
    badgeClass: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
  },
  privat24: {
    label: "Приват24",
    shortLabel: "Приват",
    icon: CreditCard,
    badgeClass: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  },
  ibkr: {
    label: "Interactive Brokers",
    shortLabel: "IBKR",
    icon: BarChart3,
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  },
  document: {
    label: "Документ",
    shortLabel: "Документ",
    icon: FileText,
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  },
  manual: {
    label: "Вручну",
    shortLabel: "Ручне",
    icon: PenLine,
    badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  },
};

// ========== STATUS CONFIG ==========

export const finStatusConfig: Record<FinRecordStatus, { label: string; badgeClass: string }> = {
  confirmed: {
    label: "Підтверджено",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  pending: {
    label: "Очікує",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  "needs-review": {
    label: "На перевірку",
    badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  },
};

// ========== FILTER OPTIONS ==========

export const finDirectionFilterOptions = [
  { value: "all", label: "Усі" },
  { value: "income", label: "Доходи" },
  { value: "expense", label: "Витрати" },
];

export const finSourceFilterOptions = [
  { value: "all", label: "Усі джерела" },
  { value: "monobank", label: "Monobank" },
  { value: "privat24", label: "Приват24" },
  { value: "ibkr", label: "IBKR" },
  { value: "document", label: "Документи" },
  { value: "manual", label: "Ручне" },
];

export const finCategoryFilterOptions = [
  { value: "all", label: "Усі категорії" },
  ...Object.entries(finCategoryConfig).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  })),
];

// ========== HELPERS ==========

export function formatUAH(amount: number): string {
  return `${new Intl.NumberFormat("uk-UA").format(Math.abs(amount))} ₴`;
}

export function calcKPI(records: FinMonitoringRecord[]) {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalPdfo = 0;
  let totalVz = 0;

  records.forEach((r) => {
    if (r.direction === "income") totalIncome += r.amount;
    else totalExpense += r.amount;
    if (r.taxImplication) {
      totalPdfo += r.taxImplication.pdfo;
      totalVz += r.taxImplication.vz;
    }
  });

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    totalTax: totalPdfo + totalVz,
    totalPdfo,
    totalVz,
  };
}
