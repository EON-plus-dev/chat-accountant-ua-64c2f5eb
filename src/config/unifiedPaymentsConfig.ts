/**
 * Unified Payments Configuration
 * Normalizes all payment types into a single interface for unified table display
 */

import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Landmark, 
  Building2, 
  Users, 
  Wallet,
  RotateCcw,
  type LucideIcon 
} from "lucide-react";
import type { TaxPayment, SalaryPayment, ContractorPayment, PaymentStatus, TaxCategory } from "./paymentsConfig";
import { getTaxCategory } from "./paymentsConfig";
import type { IncomeBookRecord } from "./incomeBookConfig";

// ========== UNIFIED PAYMENT INTERFACE ==========

export type PaymentDirection = "in" | "out";
export type UnifiedPaymentType = "income" | "tax" | "tax-fop" | "tax-salary" | "salary" | "contractor" | "return";
export type SourceType = "income-book" | "tax" | "salary" | "contractor";

export interface UnifiedPayment {
  // Core fields for table display
  id: string;
  date: string; // ISO date
  entityName: string; // Contractor name, employee name, tax type, etc.
  entityCode?: string; // ЄДРПОУ/ІПН for tooltips
  paymentType: UnifiedPaymentType;
  direction: PaymentDirection;
  amount: number;
  status: PaymentStatus | "income" | "return" | "not-income" | "needs-clarification";
  statusLabel: string;
  description?: string; // Short description for context
  
  // Metadata for detail sheet
  sourceType: SourceType;
  sourceData: TaxPayment | SalaryPayment | ContractorPayment | IncomeBookRecord;
  
  // Optional fields for enhanced display
  period?: string; // For taxes and salaries
  relatedDocumentId?: string;
  relatedDocumentNumber?: string;
  bankProvider?: string;
  taxCategory?: TaxCategory; // For tax payments: fop or salary
  categoryCode?: string; // Auto-categorization code
  relatedReportId?: string; // Link back to a tax report (for tax payments)
}

// ========== TYPE GUARDS ==========

export function isTaxPayment(data: UnifiedPayment["sourceData"]): data is TaxPayment {
  return "taxType" in data && "deadline" in data;
}

export function isSalaryPayment(data: UnifiedPayment["sourceData"]): data is SalaryPayment {
  return "employeeId" in data && "salaryType" in data;
}

export function isContractorPayment(data: UnifiedPayment["sourceData"]): data is ContractorPayment {
  return "contractor" in data && "paymentPurposeType" in data;
}

export function isIncomeBookRecord(data: UnifiedPayment["sourceData"]): data is IncomeBookRecord {
  return "inIncomeBook" in data && "paymentType" in data;
}

// ========== PAYMENT TYPE CONFIG ==========

export interface PaymentTypeConfig {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  color: string; // Tailwind color class
  badgeClass: string;
}

export const paymentTypeConfig: Record<UnifiedPaymentType, PaymentTypeConfig> = {
  income: {
    label: "Надходження",
    shortLabel: "Надходж.",
    icon: ArrowDownLeft,
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  tax: {
    label: "Податок",
    shortLabel: "Податок",
    icon: Landmark,
    color: "violet",
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  },
  "tax-fop": {
    label: "Податок ФОП",
    shortLabel: "ФОП",
    icon: Landmark,
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  "tax-salary": {
    label: "Податок ЗП",
    shortLabel: "ЗП",
    icon: Landmark,
    color: "sky",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  },
  salary: {
    label: "Зарплата",
    shortLabel: "Виплата",
    icon: Users,
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  },
  contractor: {
    label: "Контрагент",
    shortLabel: "Контр.",
    icon: Building2,
    color: "amber",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  },
  return: {
    label: "Повернення",
    shortLabel: "Поверн.",
    icon: RotateCcw,
    color: "slate",
    badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  },
};

// ========== DIRECTION CONFIG ==========

export const directionConfig: Record<PaymentDirection, {
  label: string;
  icon: LucideIcon;
  iconClass: string;
  amountClass: string;
}> = {
  in: {
    label: "Надходження",
    icon: ArrowDownLeft,
    iconClass: "text-emerald-500",
    amountClass: "text-emerald-600 dark:text-emerald-400",
  },
  out: {
    label: "Витрата",
    icon: ArrowUpRight,
    iconClass: "text-rose-500",
    amountClass: "text-rose-600 dark:text-rose-400",
  },
};

// ========== STATUS CONFIG FOR UNIFIED VIEW ==========

export const unifiedStatusConfig: Record<string, {
  label: string;
  badgeClass: string;
}> = {
  // Payment statuses
  "not-created": { label: "Не створено", badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400" },
  created: { label: "Сформовано", badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  "sent-to-bank": { label: "В банку", badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" },
  paid: { label: "Оплачено", badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  overdue: { label: "Прострочено", badgeClass: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
  scheduled: { label: "Заплановано", badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  cancelled: { label: "Скасовано", badgeClass: "bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500" },
  // Income book statuses
  income: { label: "Дохід", badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  return: { label: "Повернення", badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400" },
  "not-income": { label: "Не дохід", badgeClass: "bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500" },
  "needs-clarification": { label: "Уточнення", badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
};

// ========== NORMALIZER FUNCTIONS ==========

function getStatusLabel(status: string): string {
  return unifiedStatusConfig[status]?.label || status;
}

export function normalizeTaxPayment(payment: TaxPayment): UnifiedPayment {
  const category = getTaxCategory(payment.taxType);
  return {
    id: payment.id,
    date: payment.deadline, // Use deadline as primary date
    entityName: payment.taxTypeLabel,
    paymentType: category === "fop" ? "tax-fop" : "tax-salary",
    direction: "out",
    amount: payment.amountToPay,
    status: payment.status,
    statusLabel: payment.statusLabel,
    description: payment.period,
    sourceType: "tax",
    sourceData: payment,
    period: payment.period,
    bankProvider: payment.bankLabel,
    taxCategory: category,
    relatedReportId: payment.relatedReportId,
  };
}

export function normalizeSalaryPayment(payment: SalaryPayment): UnifiedPayment {
  return {
    id: payment.id,
    date: payment.scheduledDate,
    entityName: payment.employeeName,
    entityCode: payment.employeeId,
    paymentType: "salary",
    direction: "out",
    amount: payment.amount,
    status: payment.status,
    statusLabel: payment.statusLabel,
    description: `${payment.salaryTypeLabel} • ${payment.period}`,
    sourceType: "salary",
    sourceData: payment,
    period: payment.period,
    bankProvider: payment.bankLabel,
  };
}

export function normalizeContractorPayment(payment: ContractorPayment): UnifiedPayment {
  return {
    id: payment.id,
    date: payment.date,
    entityName: payment.contractor,
    entityCode: payment.contractorCode,
    paymentType: "contractor",
    direction: "out",
    amount: payment.amount,
    status: payment.status,
    statusLabel: payment.statusLabel,
    description: payment.purpose,
    sourceType: "contractor",
    sourceData: payment,
    relatedDocumentId: payment.relatedDocumentId,
    relatedDocumentNumber: payment.relatedDocumentNumber,
    bankProvider: payment.bankLabel,
    categoryCode: payment.expenseCategoryCode,
  };
}

export function normalizeIncomeRecord(record: IncomeBookRecord): UnifiedPayment {
  const isReturn = record.status === "return";
  return {
    id: record.id,
    date: record.date,
    entityName: record.contractor || "Невідомий контрагент",
    entityCode: record.contractorCode,
    paymentType: isReturn ? "return" : "income",
    direction: isReturn ? "out" : "in",
    amount: isReturn ? (record.returnAmount || record.amount) : record.amount,
    status: record.status,
    statusLabel: getStatusLabel(record.status),
    description: record.description,
    sourceType: "income-book",
    sourceData: record,
    relatedDocumentId: record.documentFlowId,
    relatedDocumentNumber: record.documentNumber,
    categoryCode: record.categoryCode,
  };
}

/**
 * Normalize all payment types into UnifiedPayment array
 */
export function normalizePayments(
  taxPayments: TaxPayment[],
  salaryPayments: SalaryPayment[],
  contractorPayments: ContractorPayment[],
  incomeRecords: IncomeBookRecord[]
): UnifiedPayment[] {
  const unified: UnifiedPayment[] = [
    ...taxPayments.map(normalizeTaxPayment),
    ...salaryPayments.map(normalizeSalaryPayment),
    ...contractorPayments.map(normalizeContractorPayment),
    ...incomeRecords
      .filter(r => r.status !== "not-income") // Exclude non-income records
      .map(normalizeIncomeRecord),
  ];
  
  // Sort by date descending (newest first)
  return unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ========== FILTER OPTIONS ==========

export const paymentTypeFilterOptions = [
  { value: "all", label: "Усі типи" },
  { value: "income", label: "Надходження" },
  { value: "tax", label: "Усі податки" },
  { value: "tax-fop", label: "Податки ФОП" },
  { value: "tax-salary", label: "Податки ЗП" },
  { value: "salary", label: "Зарплати" },
  { value: "contractor", label: "Контрагенти" },
  { value: "return", label: "Повернення" },
];

export const paymentDirectionFilterOptions = [
  { value: "all", label: "Усі" },
  { value: "in", label: "Надходження" },
  { value: "out", label: "Витрати" },
];

export const paymentStatusFilterOptions = [
  { value: "all", label: "Усі статуси" },
  { value: "paid", label: "Оплачено" },
  { value: "scheduled", label: "Заплановано" },
  { value: "created", label: "Сформовано" },
  { value: "overdue", label: "Прострочено" },
  { value: "cancelled", label: "Скасовано" },
  { value: "income", label: "Дохід" },
  { value: "return", label: "Повернення" },
  { value: "needs-clarification", label: "Уточнення" },
];

// ========== DIRECTION-DEPENDENT FILTER MAPPINGS ==========

/** Which payment types are relevant per direction */
export const typesByDirection: Record<string, string[]> = {
  all: ["all", "income", "tax", "tax-fop", "tax-salary", "salary", "contractor", "return"],
  in: ["all", "income", "return"],
  out: ["all", "tax", "tax-fop", "tax-salary", "salary", "contractor"],
};

/** Which statuses are relevant per direction */
export const statusesByDirection: Record<string, string[]> = {
  all: ["all", "paid", "scheduled", "created", "overdue", "cancelled", "income", "return", "needs-clarification"],
  in: ["all", "income", "return", "needs-clarification"],
  out: ["all", "paid", "scheduled", "created", "overdue", "cancelled"],
};
