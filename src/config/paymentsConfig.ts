import { 
  Circle, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle,
  type LucideIcon 
} from "lucide-react";
import {
  isDemoCabinet,
  getDemoTaxPaymentsForCabinet,
  getDemoContractorPaymentsForCabinet,
  getDemoSalaryPaymentsForCabinet,
} from "@/config/demoCabinetsData";

// Категорії платежів
export type PaymentCategory = "tax" | "contractor" | "salary";

// Категорії податків (ФОП vs ЗП)
export type TaxCategory = "fop" | "salary";

// Типи податків
// "military" — ВЗ із ЗП найманих (КБК 11011000)
// "military-fop" — ВЗ ФОП-єдинника (КБК 11011001, з 01.01.2025)
// "ep" — ЄП ФОП 1-3 групи (КБК 18050400)
export type TaxType = "ep" | "esv" | "pdfo" | "military" | "military-fop" | "esv-employer" | "other";

// Типи виплат працівникам
export type SalaryType = "salary" | "advance" | "bonus" | "civil-reward";

// Статуси платежів
export type PaymentStatus = 
  | "not-created"      // Не створено платіж
  | "created"          // Сформовано платіж
  | "sent-to-bank"     // Відправлено в банк
  | "paid"             // Оплачено
  | "overdue"          // Прострочено
  | "scheduled"        // Заплановано
  | "cancelled";       // Скасовано

// Джерела платежу
export type PaymentSource = "report" | "manual" | "bank-sync" | "document" | "payroll";

// Банки для інтеграції
export type BankProvider = "monobank" | "privatbank" | "oschadbank" | "other";

// Типи призначення платежу контрагенту
export type PaymentPurposeType = "goods" | "services" | "rent" | "works" | "advance" | "return" | "other";

// ========== ІНТЕРФЕЙСИ (розширено згідно українського законодавства) ==========

// Інтерфейс податкового платежу (відповідно до Наказу Мінфіну №57)
export interface TaxPayment {
  id: string;
  cabinetId: string;
  taxType: TaxType;
  taxTypeLabel: string;
  period: string;              // "Грудень 2025", "ІІ квартал 2025"
  year: number;
  quarter?: number;
  month?: number;
  amountToPay: number;
  status: PaymentStatus;
  statusLabel: string;
  deadline: string;            // ISO date
  paidDate?: string;           // Дата оплати
  paidAmount?: number;         // Фактично сплачена сума
  relatedReportId?: string;    // Посилання на звіт
  relatedReportName?: string;
  bankProvider?: BankProvider;
  bankLabel?: string;
  createdAt: string;
  
  // NEW: Обов'язкові реквізити за Наказом Мінфіну №57
  budgetCode?: string;         // КБК (код бюджетної класифікації)
  recipientMfo?: string;       // МФО банку отримувача (6 цифр)
  recipientIban?: string;      // IBAN казначейства (29 символів)
  paymentOrderNumber?: string; // Номер платіжного доручення
  paymentOrderDate?: string;   // Дата платіжного доручення
  bankConfirmation?: string;   // Номер банківської квитанції
  
  // NEW: Автоматичний розрахунок (зв'язок з Книгою доходів)
  calculatedFromIncome?: number; // База для розрахунку (дохід за період)
  taxRate?: number;              // Ставка (5% для ЄП 3 групи)
  incomeBookPeriodStart?: string;
  incomeBookPeriodEnd?: string;
  linkedIncomeRecordIds?: string[];
}

// Інтерфейс платежу контрагенту (з повними банківськими реквізитами)
export interface ContractorPayment {
  id: string;
  cabinetId: string;
  date: string;
  contractor: string;
  contractorId?: string;       // Посилання на контрагента в системі
  contractorCode?: string;     // ЄДРПОУ/ІПН
  purpose: string;             // Призначення платежу
  amount: number;
  status: PaymentStatus;
  statusLabel: string;
  relatedDocumentId?: string;  // Рахунок/акт з документообігу
  relatedDocumentNumber?: string;
  bankProvider?: BankProvider;
  bankLabel?: string;
  
  // NEW: Повні банківські реквізити
  recipientIban?: string;      // IBAN отримувача (29 символів)
  recipientMfo?: string;       // МФО банку отримувача
  recipientBankName?: string;  // Назва банку
  
  // NEW: Типізація платежів
  paymentPurposeType: PaymentPurposeType;
  vatAmount?: number;          // Сума ПДВ (якщо платник ПДВ)
  vatRate?: number;            // Ставка ПДВ (20%, 7%, 0%)
  
  // NEW: Документи-підстави
  contractId?: string;         // ID договору
  contractNumber?: string;     // Номер договору
  invoiceNumber?: string;      // Номер рахунку-фактури
  actNumber?: string;          // Номер акту виконаних робіт
  
  // NEW: Платіжне доручення
  paymentOrderNumber?: string;
  paymentOrderDate?: string;
  
  // Auto-categorization
  expenseCategoryCode?: string; // Код категорії витрати
}

// Інтерфейс виплати працівнику (повна деталізація за НКУ та ЗУ про ЄСВ)
export interface SalaryPayment {
  id: string;
  cabinetId: string;
  employeeId: string;          // Посилання на працівника
  employeeName: string;
  employeePosition: string;
  salaryType: SalaryType;
  salaryTypeLabel: string;
  period: string;              // "Грудень 2025"
  amount: number;              // Сума до виплати (нетто)
  status: PaymentStatus;
  statusLabel: string;
  scheduledDate: string;       // Запланована дата
  paidDate?: string;
  bankProvider?: BankProvider;
  bankLabel?: string;
  source: PaymentSource;
  
  // NEW: Деталізація нарахувань за НКУ та ЗУ про ЄСВ
  grossAmount?: number;        // Нараховано (брутто)
  netAmount?: number;          // До виплати (нетто) = amount
  pdfoAmount?: number;         // ПДФО (18%)
  militaryTaxAmount?: number;  // Військовий збір (5% з 2024)
  esvAmount?: number;          // ЄСВ на роботодавця (22%)
  
  // NEW: Документальне оформлення
  payrollNumber?: string;      // Номер відомості
  accrualDate?: string;        // Дата нарахування
  paymentOrderNumber?: string; // Номер платіжного доручення
  
  // NEW: Реквізити виплати
  employeeIban?: string;       // IBAN працівника
  employeeCardMask?: string;   // Маска картки (5168 **** 1234)
  
  // NEW: Розрахункові дані
  workingDays?: number;        // Відпрацьовано днів
  sickDays?: number;           // Лікарняні дні
  vacationDays?: number;       // Відпускні дні
}

// ========== КОНФІГУРАЦІЯ КБК (Коди бюджетної класифікації) ==========

export interface TaxBudgetCodeConfig {
  code: string;
  name: string;
  iban: string;
  mfo: string;
  recipient: string;
  edrpou: string;
}

// Демо: реквізити для м. Києва (ГУ ДПС у м. Києві)
export const taxBudgetCodes: Record<TaxType, TaxBudgetCodeConfig> = {
  ep: {
    code: "18050400",
    name: "Єдиний податок з фізичних осіб (1-3 група)",
    iban: "UA218201720343130001000015825",
    mfo: "820172",
    recipient: "ГУ ДПС у м. Києві",
    edrpou: "44094520",
  },
  esv: {
    code: "22010100",
    name: "Єдиний соціальний внесок (ФОП)",
    iban: "UA538212070000026007300905065",
    mfo: "821207",
    recipient: "ГУ ДПС у м. Києві",
    edrpou: "44094520",
  },
  pdfo: {
    code: "11010100",
    name: "ПДФО (податок на доходи фізичних осіб)",
    iban: "UA218201720343160001000015826",
    mfo: "820172",
    recipient: "ГУ ДПС у м. Києві",
    edrpou: "44094520",
  },
  military: {
    code: "11011000",
    name: "Військовий збір (із зарплати найманих)",
    iban: "UA218201720343160001000015827",
    mfo: "820172",
    recipient: "ГУ ДПС у м. Києві",
    edrpou: "44094520",
  },
  "military-fop": {
    code: "11011001",
    name: "Військовий збір (ФОП-єдинник, з 01.01.2025)",
    iban: "UA218201720343160001000015828",
    mfo: "820172",
    recipient: "ГУ ДПС у м. Києві",
    edrpou: "44094520",
  },
  "esv-employer": {
    code: "22010100",
    name: "Єдиний соціальний внесок (роботодавець)",
    iban: "UA538212070000026007300905065",
    mfo: "821207",
    recipient: "ГУ ДПС у м. Києві",
    edrpou: "44094520",
  },
  other: {
    code: "",
    name: "Інший податок",
    iban: "",
    mfo: "",
    recipient: "",
    edrpou: "",
  },
};

// ========== КОНФІГУРАЦІЯ UI ==========

// Конфігурація категорій податків
export const taxCategoryConfig: Record<TaxCategory, {
  label: string;
  shortLabel: string;
  color: string;
  badgeClass: string;
}> = {
  fop: {
    label: "Податки ФОП",
    shortLabel: "ФОП",
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  salary: {
    label: "Податки із ЗП",
    shortLabel: "ЗП",
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  },
};

// Конфігурація типів податків
export const taxTypeConfig: Record<TaxType, { 
  label: string; 
  shortLabel: string; 
  color: string;
  description: string;
  rate?: number;
  category: TaxCategory;
}> = {
  ep: { 
    label: "Єдиний податок (ЄП)", 
    shortLabel: "ЄП", 
    color: "emerald",
    description: "5% від доходу для 3 групи ЄП",
    rate: 5,
    category: "fop",
  },
  esv: { 
    label: "Єдиний соціальний внесок (ЄСВ)", 
    shortLabel: "ЄСВ ФОП", 
    color: "teal",
    description: "Мінімальний внесок 1760 грн/місяць (2025)",
    category: "fop",
  },
  pdfo: { 
    label: "ПДФО (за працівників)", 
    shortLabel: "ПДФО", 
    color: "violet",
    description: "18% від зарплати працівників",
    rate: 18,
    category: "salary",
  },
  military: { 
    label: "Військовий збір (наймані)", 
    shortLabel: "ВЗ", 
    color: "orange",
    description: "5% від зарплати працівників (з грудня 2024)",
    rate: 5,
    category: "salary",
  },
  "military-fop": { 
    label: "Військовий збір (ФОП)", 
    shortLabel: "ВЗ ФОП", 
    color: "orange",
    description: "1% від доходу ФОП-єдинника (з 01.01.2025)",
    rate: 1,
    category: "fop",
  },
  "esv-employer": { 
    label: "ЄСВ на роботодавця", 
    shortLabel: "ЄСВ ЗП", 
    color: "blue",
    description: "22% від зарплати працівників",
    rate: 22,
    category: "salary",
  },
  other: { 
    label: "Інший податок", 
    shortLabel: "Інше", 
    color: "slate",
    description: "",
    category: "fop",
  },
};

// Helper: отримати категорію податку
export function getTaxCategory(taxType: TaxType): TaxCategory {
  return taxTypeConfig[taxType]?.category || "fop";
}

// Типи виплат
export const salaryTypeConfig: Record<SalaryType, { 
  label: string; 
  color: string;
}> = {
  salary: { label: "Заробітна плата", color: "emerald" },
  advance: { label: "Аванс", color: "blue" },
  bonus: { label: "Премія", color: "amber" },
  "civil-reward": { label: "Винагорода за ЦПД", color: "violet" },
};

// Типи призначення платежу
export const paymentPurposeTypeConfig: Record<PaymentPurposeType, { label: string }> = {
  goods: { label: "За товар" },
  services: { label: "За послуги" },
  rent: { label: "Оренда" },
  works: { label: "За виконані роботи" },
  advance: { label: "Аванс/передоплата" },
  return: { label: "Повернення коштів" },
  other: { label: "Інше" },
};

// Статуси платежів
export const paymentStatusConfig: Record<PaymentStatus, {
  label: string;
  icon: LucideIcon;
  className: string;
}> = {
  "not-created": {
    label: "Не створено",
    icon: Circle,
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400"
  },
  created: {
    label: "Сформовано",
    icon: FileText,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
  },
  "sent-to-bank": {
    label: "Відправлено в банк",
    icon: Send,
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400"
  },
  paid: {
    label: "Оплачено",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  },
  overdue: {
    label: "Прострочено",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
  },
  scheduled: {
    label: "Заплановано",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
  },
  cancelled: {
    label: "Скасовано",
    icon: XCircle,
    className: "bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500"
  },
};

// Конфігурація банків
export const bankProviderConfig: Record<BankProvider, { label: string }> = {
  monobank: { label: "Monobank" },
  privatbank: { label: "Приват24" },
  oschadbank: { label: "Ощадбанк" },
  other: { label: "Інший банк" },
};

// ========== ПОДАТКОВИЙ КАЛЕНДАР ==========

/**
 * Розраховує дедлайн податкового платежу згідно ПКУ
 * ЄП та ЄСВ для ФОП — квартальні, до 19 числа місяця після кварталу
 * ПДФО/ВЗ — до 20 числа місяця після нарахування
 */
export function calculateTaxDeadline(
  taxType: TaxType,
  period: { year: number; quarter?: number; month?: number },
  hasEmployees: boolean = false
): Date {
  const { year, quarter, month } = period;
  
  // ЄП та ЄСВ — квартальні, до 19 числа наступного місяця після кварталу
  if (taxType === "ep" || taxType === "esv") {
    if (quarter) {
      const deadlineMonth = quarter * 3 + 1; // Квітень (Q1), Липень (Q2), Жовтень (Q3), Січень (Q4)
      const deadlineYear = quarter === 4 ? year + 1 : year;
      return new Date(deadlineYear, deadlineMonth - 1, 19);
    }
  }
  
  // ПДФО/ВЗ — місячні (якщо є працівники), до 20 числа наступного місяця
  if ((taxType === "pdfo" || taxType === "military") && hasEmployees && month) {
    const deadlineMonth = month === 12 ? 1 : month + 1;
    const deadlineYear = month === 12 ? year + 1 : year;
    return new Date(deadlineYear, deadlineMonth - 1, 20);
  }
  
  return new Date();
}

import { 
  ESV_MONTHLY, 
  TAX_RATES,
  getMinimumWageForDate 
} from "@/config/taxConstantsConfig";

/**
 * @deprecated Використовуйте ESV_MONTHLY з taxConstantsConfig.ts
 * Мінімальний ЄСВ для ФОП
 */
export const ESV_MINIMUM_2025 = ESV_MONTHLY;

/**
 * Розрахунок податків з Книги доходів для ФОП 3 групи
 */
export function calculateTaxFromIncome(
  totalIncome: number,
  taxSystemGroup: 3 = 3,
  quarterMonths: number = 3
): {
  epAmount: number;
  esvAmount: number;
  epRate: number;
  esvMonthly: number;
} {
  // ЄП: 5% від доходу для 3 групи
  const epRate = taxSystemGroup === 3 ? TAX_RATES.epGroup3_withoutVat * 100 : 0;
  const epAmount = Math.round(totalIncome * (epRate / 100));
  
  // ЄСВ: мінімальний внесок × кількість місяців
  const esvAmount = ESV_MONTHLY * quarterMonths;
  
  return {
    epAmount,
    esvAmount,
    epRate,
    esvMonthly: ESV_MONTHLY,
  };
}

/**
 * Розрахунок податків із зарплати працівника
 */
export function calculateSalaryTaxes(grossAmount: number): {
  pdfoAmount: number;
  militaryAmount: number;
  esvEmployerAmount: number;
  netAmount: number;
} {
  // ПДФО: 18%
  const pdfoAmount = Math.round(grossAmount * TAX_RATES.personalIncomeTax);
  
  // Військовий збір: 5% (з грудня 2024)
  const militaryAmount = Math.round(grossAmount * TAX_RATES.militaryTax);
  
  // ЄСВ на роботодавця: 22%
  const esvEmployerAmount = Math.round(grossAmount * TAX_RATES.esv);
  
  // Нетто = брутто - ПДФО - ВЗ
  const netAmount = grossAmount - pdfoAmount - militaryAmount;
  
  return {
    pdfoAmount,
    militaryAmount,
    esvEmployerAmount,
    netAmount,
  };
}

// ========== ДЕМО-ДАНІ ==========

// Runtime-додані синтетичні платежі (через handleMarkPaid у ReportsPage).
// Зберігаються в пам'яті процесу + дублюються в localStorage на рівні ReportsPage.
const runtimeExtraTaxPayments: Record<string, TaxPayment[]> = {};

export function getRuntimeExtraTaxPayments(cabinetId: string): TaxPayment[] {
  return runtimeExtraTaxPayments[cabinetId] ?? [];
}

export function addRuntimeExtraTaxPayment(payment: TaxPayment): void {
  const list = runtimeExtraTaxPayments[payment.cabinetId] ?? [];
  // Уникаємо дублікатів за id
  const filtered = list.filter((p) => p.id !== payment.id);
  runtimeExtraTaxPayments[payment.cabinetId] = [...filtered, payment];
}

// Податкові платежі (прив'язані до reportsConfig)
export const demoTaxPayments: TaxPayment[] = [
  // ФОП Іваненко (cabinetId: "2")
  {
    id: "tax-1",
    cabinetId: "2",
    taxType: "ep",
    taxTypeLabel: "ЄП",
    period: "І квартал 2025",
    year: 2025,
    quarter: 1,
    amountToPay: 21250,
    status: "paid",
    statusLabel: "Оплачено",
    deadline: "2025-05-19",
    paidDate: "2025-05-15",
    paidAmount: 21250,
    relatedReportId: "rep-1",
    relatedReportName: "Декларація ЄП за I квартал 2025",
    bankProvider: "monobank",
    bankLabel: "Monobank",
    createdAt: "2025-05-01",
    // Extended fields
    budgetCode: "21010300",
    recipientIban: "UA218201720343130001000015825",
    recipientMfo: "820172",
    paymentOrderNumber: "ПД-2025-0145",
    paymentOrderDate: "2025-05-15",
    bankConfirmation: "А2025051512345",
    calculatedFromIncome: 425000,
    taxRate: 5,
    incomeBookPeriodStart: "2025-01-01",
    incomeBookPeriodEnd: "2025-03-31",
  },
  {
    id: "tax-2",
    cabinetId: "2",
    taxType: "esv",
    taxTypeLabel: "ЄСВ",
    period: "І квартал 2025",
    year: 2025,
    quarter: 1,
    amountToPay: 5280,
    status: "paid",
    statusLabel: "Оплачено",
    deadline: "2025-05-19",
    paidDate: "2025-05-15",
    paidAmount: 5280,
    relatedReportId: "rep-2",
    relatedReportName: "Звіт ЄСВ за I квартал 2025",
    bankProvider: "monobank",
    bankLabel: "Monobank",
    createdAt: "2025-05-01",
    budgetCode: "22010100",
    recipientIban: "UA538212070000026007300905065",
    recipientMfo: "821207",
    paymentOrderNumber: "ПД-2025-0146",
    paymentOrderDate: "2025-05-15",
  },
  {
    id: "tax-3",
    cabinetId: "2",
    taxType: "ep",
    taxTypeLabel: "ЄП",
    period: "ІІ квартал 2025",
    year: 2025,
    quarter: 2,
    amountToPay: 22500,
    status: "created",
    statusLabel: "Сформовано",
    deadline: "2025-08-19",
    relatedReportId: "rep-3",
    relatedReportName: "Декларація ЄП за II квартал 2025",
    createdAt: "2025-07-01",
    budgetCode: "21010300",
    recipientIban: "UA218201720343130001000015825",
    recipientMfo: "820172",
    calculatedFromIncome: 450000,
    taxRate: 5,
    incomeBookPeriodStart: "2025-04-01",
    incomeBookPeriodEnd: "2025-06-30",
  },
  {
    id: "tax-4",
    cabinetId: "2",
    taxType: "esv",
    taxTypeLabel: "ЄСВ",
    period: "ІІ квартал 2025",
    year: 2025,
    quarter: 2,
    amountToPay: 5280,
    status: "not-created",
    statusLabel: "Не створено",
    deadline: "2025-08-19",
    relatedReportId: "rep-4",
    relatedReportName: "Звіт ЄСВ за II квартал 2025",
    createdAt: "2025-07-01",
    budgetCode: "22010100",
    recipientIban: "UA538212070000026007300905065",
    recipientMfo: "821207",
  },
  {
    id: "tax-5",
    cabinetId: "2",
    taxType: "pdfo",
    taxTypeLabel: "ПДФО",
    period: "Липень 2025",
    year: 2025,
    month: 7,
    amountToPay: 3951,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2025-08-20",
    createdAt: "2025-07-15",
    budgetCode: "11010100",
    recipientIban: "UA218201720343160001000015826",
    recipientMfo: "820172",
  },
  {
    id: "tax-6",
    cabinetId: "2",
    taxType: "military",
    taxTypeLabel: "ВЗ",
    period: "Липень 2025",
    year: 2025,
    month: 7,
    amountToPay: 1098,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2025-08-20",
    createdAt: "2025-07-15",
    budgetCode: "11011000",
    recipientIban: "UA218201720343160001000015827",
    recipientMfo: "820172",
  },

  // ===== 2026 рік — повна демонстрація розрахунків з бюджетом (кабінет "2") =====
  // Поточний місяць: травень 2026. Включає сплачене / заплановане / прострочене / пеню.
  {
    id: "tax-2026-q1-ep",
    cabinetId: "2",
    taxType: "ep",
    taxTypeLabel: "ЄП",
    period: "І квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: 28000,
    status: "paid",
    statusLabel: "Оплачено",
    deadline: "2026-05-19",
    paidDate: "2026-05-04",
    paidAmount: 28000,
    relatedReportId: "rep-2026-q1-ep",
    relatedReportName: "Декларація ЄП за I квартал 2026",
    bankProvider: "monobank",
    bankLabel: "Monobank",
    createdAt: "2026-04-15",
    budgetCode: "18050400",
    recipientIban: "UA218201720343130001000015825",
    recipientMfo: "820172",
    paymentOrderNumber: "ПД-2026-0098",
    paymentOrderDate: "2026-05-04",
    bankConfirmation: "А2026050412345",
    calculatedFromIncome: 560000,
    taxRate: 5,
    incomeBookPeriodStart: "2026-01-01",
    incomeBookPeriodEnd: "2026-03-31",
  },
  {
    id: "tax-2026-q1-esv",
    cabinetId: "2",
    taxType: "esv",
    taxTypeLabel: "ЄСВ (за себе)",
    period: "І квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: 5280,
    status: "paid",
    statusLabel: "Оплачено",
    deadline: "2026-05-19",
    paidDate: "2026-05-04",
    paidAmount: 5280,
    bankProvider: "monobank",
    bankLabel: "Monobank",
    createdAt: "2026-04-15",
    budgetCode: "71040000",
    recipientIban: "UA538212070000026007300905065",
    recipientMfo: "821207",
    paymentOrderNumber: "ПД-2026-0099",
    paymentOrderDate: "2026-05-04",
  },
  {
    id: "tax-2026-04-pdfo",
    cabinetId: "2",
    taxType: "pdfo",
    taxTypeLabel: "ПДФО",
    period: "Квітень 2026",
    year: 2026,
    month: 4,
    amountToPay: 5994,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-05-20",
    createdAt: "2026-04-30",
    budgetCode: "11010100",
    recipientIban: "UA218201720343160001000015826",
    recipientMfo: "820172",
  },
  {
    id: "tax-2026-04-mil",
    cabinetId: "2",
    taxType: "military",
    taxTypeLabel: "ВЗ із ЗП",
    period: "Квітень 2026",
    year: 2026,
    month: 4,
    amountToPay: 1665,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-05-20",
    createdAt: "2026-04-30",
    budgetCode: "11011000",
    recipientIban: "UA218201720343160001000015827",
    recipientMfo: "820172",
  },
  {
    id: "tax-2026-04-esv-emp",
    cabinetId: "2",
    taxType: "esv-employer",
    taxTypeLabel: "ЄСВ роботодавця",
    period: "Квітень 2026",
    year: 2026,
    month: 4,
    amountToPay: 7326,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-05-20",
    createdAt: "2026-04-30",
    budgetCode: "71040000",
    recipientIban: "UA538212070000026007300905065",
    recipientMfo: "821207",
  },
  {
    id: "tax-2026-q1-mil-fop",
    cabinetId: "2",
    taxType: "military-fop",
    taxTypeLabel: "ВЗ ФОП",
    period: "І квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: 4480,
    status: "overdue",
    statusLabel: "Прострочено",
    deadline: "2026-05-04",
    createdAt: "2026-04-15",
    budgetCode: "11011001",
    recipientIban: "UA218201720343160001000015828",
    recipientMfo: "820172",
    calculatedFromIncome: 560000,
    taxRate: 1,
  },
  {
    id: "tax-2026-05-penalty",
    cabinetId: "2",
    taxType: "other",
    taxTypeLabel: "Пеня (ВЗ ФОП)",
    period: "Травень 2026",
    year: 2026,
    month: 5,
    amountToPay: 320,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-05-15",
    createdAt: "2026-05-05",
    budgetCode: "11011001",
    recipientIban: "UA218201720343160001000015828",
    recipientMfo: "820172",
    // engine reads optional `category` for penalty/fine bucket
    ...({ category: "penalty" } as Record<string, unknown>),
  },
  // Q4 2025 (deadline у лютому 2026) — для річної динаміки
  {
    id: "tax-2025-q4-ep",
    cabinetId: "2",
    taxType: "ep",
    taxTypeLabel: "ЄП",
    period: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    amountToPay: 26000,
    status: "paid",
    statusLabel: "Оплачено",
    deadline: "2026-02-19",
    paidDate: "2026-02-12",
    paidAmount: 26000,
    bankProvider: "monobank",
    bankLabel: "Monobank",
    createdAt: "2026-01-15",
    budgetCode: "18050400",
    recipientIban: "UA218201720343130001000015825",
    recipientMfo: "820172",
    calculatedFromIncome: 520000,
    taxRate: 5,
  },
  {
    id: "tax-2025-q4-esv",
    cabinetId: "2",
    taxType: "esv",
    taxTypeLabel: "ЄСВ (за себе)",
    period: "IV квартал 2025",
    year: 2025,
    quarter: 4,
    amountToPay: 5280,
    status: "paid",
    statusLabel: "Оплачено",
    deadline: "2026-02-19",
    paidDate: "2026-02-12",
    paidAmount: 5280,
    bankProvider: "monobank",
    bankLabel: "Monobank",
    createdAt: "2026-01-15",
    budgetCode: "71040000",
    recipientIban: "UA538212070000026007300905065",
    recipientMfo: "821207",
  },
];

// Виплати працівникам (прив'язані до employeesConfig)
export const demoSalaryPayments: SalaryPayment[] = [
  // ФОП Іваненко (cabinetId: "2")
  {
    id: "sal-1",
    cabinetId: "2",
    employeeId: "emp-001",
    employeeName: "Петренко Олег Іванович",
    employeePosition: "Менеджер з продажу",
    salaryType: "salary",
    salaryTypeLabel: "Заробітна плата",
    period: "Червень 2025",
    amount: 16390,
    status: "paid",
    statusLabel: "Виплачено",
    scheduledDate: "2025-07-05",
    paidDate: "2025-07-05",
    bankProvider: "monobank",
    bankLabel: "Monobank",
    source: "payroll",
    // Extended fields
    grossAmount: 21300,
    netAmount: 16390,
    pdfoAmount: 3834,      // 21300 × 18%
    militaryTaxAmount: 1065, // 21300 × 5%
    esvAmount: 4686,        // 21300 × 22% (роботодавець)
    payrollNumber: "ЗВ-2025-06-001",
    accrualDate: "2025-06-30",
    paymentOrderNumber: "ПД-2025-0201",
    employeeCardMask: "5168 **** 4521",
    workingDays: 22,
  },
  {
    id: "sal-2",
    cabinetId: "2",
    employeeId: "emp-002",
    employeeName: "Коваленко Марія Сергіївна",
    employeePosition: "Маркетолог",
    salaryType: "civil-reward",
    salaryTypeLabel: "Винагорода за ЦПД",
    period: "Червень 2025",
    amount: 9240,
    status: "paid",
    statusLabel: "Виплачено",
    scheduledDate: "2025-07-05",
    paidDate: "2025-07-05",
    bankProvider: "privatbank",
    bankLabel: "Приват24",
    source: "manual",
    grossAmount: 12000,
    netAmount: 9240,
    pdfoAmount: 2160,      // 12000 × 18%
    militaryTaxAmount: 600, // 12000 × 5%
    esvAmount: 2640,        // 12000 × 22%
    payrollNumber: "ЗВ-2025-06-002",
    accrualDate: "2025-06-30",
    employeeCardMask: "4149 **** 8832",
  },
  {
    id: "sal-3",
    cabinetId: "2",
    employeeId: "emp-001",
    employeeName: "Петренко Олег Іванович",
    employeePosition: "Менеджер з продажу",
    salaryType: "salary",
    salaryTypeLabel: "Заробітна плата",
    period: "Липень 2025",
    amount: 16390,
    status: "scheduled",
    statusLabel: "Заплановано",
    scheduledDate: "2025-08-05",
    source: "payroll",
    grossAmount: 21300,
    netAmount: 16390,
    pdfoAmount: 3834,
    militaryTaxAmount: 1065,
    esvAmount: 4686,
    workingDays: 23,
  },
  {
    id: "sal-4",
    cabinetId: "2",
    employeeId: "emp-002",
    employeeName: "Коваленко Марія Сергіївна",
    employeePosition: "Маркетолог",
    salaryType: "civil-reward",
    salaryTypeLabel: "Винагорода за ЦПД",
    period: "Липень 2025",
    amount: 9240,
    status: "scheduled",
    statusLabel: "Заплановано",
    scheduledDate: "2025-08-05",
    source: "manual",
    grossAmount: 12000,
    netAmount: 9240,
    pdfoAmount: 2160,
    militaryTaxAmount: 600,
    esvAmount: 2640,
  },
  {
    id: "sal-5",
    cabinetId: "2",
    employeeId: "emp-001",
    employeeName: "Петренко Олег Іванович",
    employeePosition: "Менеджер з продажу",
    salaryType: "bonus",
    salaryTypeLabel: "Премія",
    period: "Липень 2025",
    amount: 3850,
    status: "scheduled",
    statusLabel: "Заплановано",
    scheduledDate: "2025-08-05",
    source: "manual",
    grossAmount: 5000,
    netAmount: 3850,
    pdfoAmount: 900,
    militaryTaxAmount: 250,
    esvAmount: 1100,
  },
];

// Платежі контрагентам (з повними реквізитами)
export const demoContractorPayments: ContractorPayment[] = [
  {
    id: "contr-1",
    cabinetId: "2",
    date: "2025-07-10",
    contractor: "ТОВ «Діджитал Сервіс»",
    contractorId: "contractor-001",
    contractorCode: "12345678",
    purpose: "Оплата за послуги хостингу згідно рах. №РФ-2025-0234 від 05.07.2025",
    amount: 15000,
    status: "paid",
    statusLabel: "Оплачено",
    relatedDocumentId: "doc-rf-234",
    relatedDocumentNumber: "РФ-2025-0234",
    bankProvider: "monobank",
    bankLabel: "Monobank",
    // Extended fields
    recipientIban: "UA213223130000026007123456789",
    recipientMfo: "322313",
    recipientBankName: "АТ КБ «ПриватБанк»",
    paymentPurposeType: "services",
    contractNumber: "ДП-2025-001",
    invoiceNumber: "РФ-2025-0234",
    paymentOrderNumber: "ПД-2025-0189",
    paymentOrderDate: "2025-07-10",
  },
  {
    id: "contr-2",
    cabinetId: "2",
    date: "2025-07-15",
    contractor: "ФОП Сидоренко В.І.",
    contractorId: "contractor-002",
    contractorCode: "1234567890",
    purpose: "Оренда офісного приміщення за липень 2025",
    amount: 5000,
    status: "scheduled",
    statusLabel: "Заплановано",
    relatedDocumentId: "doc-act-112",
    relatedDocumentNumber: "АКТ-2025-0112",
    recipientIban: "UA2130052990000026009876543211",
    recipientMfo: "305299",
    recipientBankName: "АТ «ПУМБ»",
    paymentPurposeType: "rent",
    contractNumber: "ОР-2024-003",
    actNumber: "АКТ-2025-0112",
  },
  {
    id: "contr-3",
    cabinetId: "2",
    date: "2025-07-05",
    contractor: "ПрАТ «Київстар»",
    contractorId: "contractor-003",
    contractorCode: "21673832",
    purpose: "Послуги мобільного зв'язку за червень 2025",
    amount: 800,
    status: "paid",
    statusLabel: "Оплачено",
    bankProvider: "privatbank",
    bankLabel: "Приват24",
    recipientIban: "UA903052990000026004567891234",
    recipientMfo: "305299",
    recipientBankName: "АТ «ПУМБ»",
    paymentPurposeType: "services",
    paymentOrderNumber: "ПД-2025-0176",
    paymentOrderDate: "2025-07-05",
  },
  {
    id: "contr-4",
    cabinetId: "2",
    date: "2025-07-20",
    contractor: "ТОВ «Офіс Маркет»",
    contractorId: "contractor-004",
    contractorCode: "43215678",
    purpose: "Канцтовари та витратні матеріали згідно накл. №ВН-1234",
    amount: 2350,
    status: "created",
    statusLabel: "Сформовано",
    relatedDocumentNumber: "ВН-2025-1234",
    recipientIban: "UA123223130000026001234567890",
    recipientMfo: "322313",
    recipientBankName: "АТ КБ «ПриватБанк»",
    paymentPurposeType: "goods",
    invoiceNumber: "РФ-2025-0567",
    vatAmount: 391.67,
    vatRate: 20,
  },
];

// ========== ДЕМО-ДАНІ ДЛЯ ПАСИВНОГО КАБІНЕТУ ==========

// Вхідні платежі для passive-demo-1 від партнера ФОП Іваненко
export const passiveDemoContractorPayments: ContractorPayment[] = [
  {
    id: "passive-income-1",
    cabinetId: "passive-demo-1",
    date: "2024-12-18",
    contractor: "ФОП Іваненко Іван Іванович",
    contractorId: "partner-fop-ivanenko",
    contractorCode: "1234567890",
    purpose: "Оплата за рахунком Р-2024/156 — консалтингові послуги",
    amount: 35000,
    status: "paid",
    statusLabel: "Оплачено",
    relatedDocumentId: "passive-doc-005",
    relatedDocumentNumber: "Р-2024/156",
    bankProvider: "monobank",
    bankLabel: "Monobank",
    recipientIban: "UA213223130000026007233566001",
    recipientMfo: "322313",
    recipientBankName: "АТ КБ «ПриватБанк»",
    paymentPurposeType: "services",
    paymentOrderNumber: "ПД-2024-0892",
    paymentOrderDate: "2024-12-18",
  },
  {
    id: "passive-income-2",
    cabinetId: "passive-demo-1",
    date: "2024-12-22",
    contractor: "ФОП Іваненко Іван Іванович",
    contractorId: "partner-fop-ivanenko",
    contractorCode: "1234567890",
    purpose: "Оплата за накладною ВН-2024/089 — комп'ютерне обладнання",
    amount: 85000,
    status: "paid",
    statusLabel: "Оплачено",
    relatedDocumentId: "passive-doc-004",
    relatedDocumentNumber: "ВН-2024/089",
    bankProvider: "monobank",
    bankLabel: "Monobank",
    recipientIban: "UA213223130000026007233566001",
    recipientMfo: "322313",
    recipientBankName: "АТ КБ «ПриватБанк»",
    paymentPurposeType: "goods",
    paymentOrderNumber: "ПД-2024-0915",
    paymentOrderDate: "2024-12-22",
  },
  {
    id: "passive-income-3",
    cabinetId: "passive-demo-1",
    date: "2025-01-20",
    contractor: "ФОП Іваненко Іван Іванович",
    contractorId: "partner-fop-ivanenko",
    contractorCode: "1234567890",
    purpose: "Оплата за рахунком Р-2025/001 — IT-послуги за січень 2025",
    amount: 45000,
    status: "scheduled",
    statusLabel: "Заплановано",
    relatedDocumentId: "passive-doc-002",
    relatedDocumentNumber: "Р-2025/001",
    recipientIban: "UA213223130000026007233566001",
    recipientMfo: "322313",
    recipientBankName: "АТ КБ «ПриватБанк»",
    paymentPurposeType: "services",
  },
];

// ========== ХЕЛПЕРИ ==========

export function getTaxPaymentsForCabinet(cabinetId: string): TaxPayment[] {
  // Check for specialized demo cabinets first
  if (isDemoCabinet(cabinetId)) {
    return getDemoTaxPaymentsForCabinet(cabinetId);
  }
  return demoTaxPayments.filter(p => p.cabinetId === cabinetId);
}

export function getSalaryPaymentsForCabinet(cabinetId: string): SalaryPayment[] {
  // Check for specialized demo cabinets first
  if (isDemoCabinet(cabinetId)) {
    return getDemoSalaryPaymentsForCabinet(cabinetId);
  }
  return demoSalaryPayments.filter(p => p.cabinetId === cabinetId);
}

export function getContractorPaymentsForCabinet(cabinetId: string): ContractorPayment[] {
  // Check for specialized demo cabinets first
  if (isDemoCabinet(cabinetId)) {
    return getDemoContractorPaymentsForCabinet(cabinetId);
  }
  // Special case for passive cabinet
  if (cabinetId === "passive-demo-1") {
    return passiveDemoContractorPayments;
  }
  return demoContractorPayments.filter(p => p.cabinetId === cabinetId);
}

// Статистика платежів (включаючи деталізацію податків)
export function getPaymentsStats(
  taxPayments: TaxPayment[], 
  salaryPayments: SalaryPayment[]
) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Фільтруємо платежі поточного місяця
  const thisMonthTax = taxPayments.filter(p => {
    const deadline = new Date(p.deadline);
    return deadline.getMonth() === currentMonth && deadline.getFullYear() === currentYear;
  });
  
  const thisMonthSalary = salaryPayments.filter(p => {
    const date = new Date(p.scheduledDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  // До сплати
  const taxToPay = thisMonthTax
    .filter(p => p.status !== "paid" && p.status !== "cancelled")
    .reduce((sum, p) => sum + p.amountToPay, 0);
    
  const salaryToPay = thisMonthSalary
    .filter(p => p.status !== "paid" && p.status !== "cancelled")
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Прострочено
  const overdueCount = [...taxPayments, ...salaryPayments].filter(p => p.status === "overdue").length;
  
  // Оплачено за місяць
  const taxPaid = thisMonthTax
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + (p.paidAmount || p.amountToPay), 0);
    
  const salaryPaid = thisMonthSalary
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  
  // NEW: Деталізація по ПДФО/ВЗ/ЄСВ
  const pdfoTotal = thisMonthSalary.reduce((sum, p) => sum + (p.pdfoAmount || 0), 0);
  const militaryTotal = thisMonthSalary.reduce((sum, p) => sum + (p.militaryTaxAmount || 0), 0);
  const esvTotal = thisMonthSalary.reduce((sum, p) => sum + (p.esvAmount || 0), 0);
  
  return {
    taxToPay,
    salaryToPay,
    totalToPay: taxToPay + salaryToPay,
    overdueCount,
    taxPaid,
    salaryPaid,
    totalPaid: taxPaid + salaryPaid,
    // NEW: Деталі податків із зарплати
    pdfoTotal,
    militaryTotal,
    esvTotal,
    salaryTaxesTotal: pdfoTotal + militaryTotal + esvTotal,
  };
}

// Визначення терміновості дедлайну
export function getPaymentDeadlineUrgency(deadline: string): "urgent" | "warning" | "normal" | "past" {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysLeft < 0) return "past";
  if (daysLeft <= 3) return "urgent";
  if (daysLeft <= 7) return "warning";
  return "normal";
}

// Форматування IBAN для відображення (з пробілами)
export function formatIban(iban: string): string {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}
