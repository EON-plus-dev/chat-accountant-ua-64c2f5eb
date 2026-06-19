/**
 * Payment Detail Configuration
 * Defines section structure and legal references for each payment type
 * Based on Ukrainian tax legislation (ПКУ, ЗУ про ЄСВ, Наказ Мінфіну №57)
 */

import {
  Calculator,
  Scale,
  Building2,
  TrendingUp,
  History,
  Users,
  FileText,
  User,
  Wallet,
  Calendar,
  CreditCard,
  Shield,
  ArrowLeftRight,
  Receipt,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

// ========== TYPES ==========

export interface PaymentDetailSection {
  id: string;
  title: string;
  icon: LucideIcon;
  priority: number;
}

export interface LegalReference {
  article: string;
  description: string;
  rate?: string;
  deadline?: string;
}

// ========== LEGAL BASIS (Ukrainian Legislation) ==========

export const legalBasisConfig: Record<string, LegalReference> = {
  // ФОП taxes
  ep: {
    article: "ПКУ ст. 295-296",
    description: "Єдиний податок для платників 3 групи",
    rate: "5% від доходу",
    deadline: "До 19 числа місяця після кварталу",
  },
  esv: {
    article: "ЗУ про ЄСВ, ст. 7, 8",
    description: "Єдиний соціальний внесок для ФОП",
    rate: "22% від мінімальної ЗП",
    deadline: "До 19 числа місяця після кварталу",
  },
  // Salary taxes
  pdfo: {
    article: "ПКУ ст. 162-165, 167",
    description: "Податок на доходи фізичних осіб",
    rate: "18%",
    deadline: "До 20 числа місяця після нарахування",
  },
  military: {
    article: "ПКУ ст. 1.5, підрозд. 1",
    description: "Військовий збір (з 01.12.2024 — 5%)",
    rate: "5%",
    deadline: "До 20 числа місяця після нарахування",
  },
  "esv-employer": {
    article: "ЗУ про ЄСВ, ст. 8",
    description: "ЄСВ нараховується на ФОП роботодавцем",
    rate: "22%",
    deadline: "До 20 числа місяця після нарахування",
  },
  // Salary payment
  salaryPayment: {
    article: "КЗпП, ст. 115",
    description: "Заробітна плата виплачується не рідше 2 разів на місяць",
    deadline: "Не пізніше 7 днів після закінчення періоду",
  },
  // Contractor payment
  contractorPayment: {
    article: "ЦКУ, ст. 526-545",
    description: "Виконання зобов'язань за договором",
  },
};

// ========== SECTION CONFIGS ==========

// TAX FOP (ЄП, ЄСВ)
export const taxFopDetailConfig = {
  sections: [
    { id: "calculation", title: "AI-розрахунок", icon: Calculator, priority: 1 },
    { id: "income-breakdown", title: "База нарахування", icon: TrendingUp, priority: 2 },
    { id: "legal-basis", title: "Законодавча база", icon: Scale, priority: 3 },
    { id: "requisites", title: "Реквізити для оплати", icon: Building2, priority: 4 },
    { id: "payment-history", title: "Історія платежів", icon: History, priority: 5 },
  ] as PaymentDetailSection[],
};

// TAX SALARY (ПДФО, ВЗ, ЄСВ роботодавця)
export const taxSalaryDetailConfig = {
  sections: [
    { id: "aggregate", title: "Загальна інформація", icon: Calculator, priority: 1 },
    { id: "per-employee", title: "По працівниках", icon: Users, priority: 2 },
    { id: "legal-basis", title: "Законодавча база", icon: Scale, priority: 3 },
    { id: "payroll", title: "Відомість", icon: FileText, priority: 4 },
    { id: "requisites", title: "Реквізити для оплати", icon: Building2, priority: 5 },
  ] as PaymentDetailSection[],
};

// SALARY
export const salaryDetailConfig = {
  sections: [
    { id: "employee", title: "Працівник", icon: User, priority: 1 },
    { id: "accrual", title: "Нарахування", icon: Calendar, priority: 2 },
    { id: "tax-calculation", title: "Розрахунок податків", icon: Calculator, priority: 3 },
    { id: "legal-basis", title: "Законодавча база", icon: Scale, priority: 4 },
    { id: "payment-details", title: "Реквізити виплати", icon: CreditCard, priority: 5 },
  ] as PaymentDetailSection[],
};

// CONTRACTOR
export const contractorDetailConfig = {
  sections: [
    { id: "contractor", title: "Контрагент", icon: Building2, priority: 1 },
    { id: "documents", title: "Документи-підстава", icon: FileText, priority: 2 },
    { id: "payment-details", title: "Деталі оплати", icon: Wallet, priority: 3 },
    { id: "requisites", title: "Банківські реквізити", icon: CreditCard, priority: 4 },
    { id: "schedule", title: "Графік платежів", icon: Calendar, priority: 5 },
  ] as PaymentDetailSection[],
};

// INCOME
export const incomeDetailConfig = {
  sections: [
    { id: "transaction", title: "Операція", icon: Receipt, priority: 1 },
    { id: "counterparty", title: "Контрагент", icon: Building2, priority: 2 },
    { id: "financial", title: "Фінансові деталі", icon: Wallet, priority: 3 },
    { id: "accounting", title: "Облік", icon: BookOpen, priority: 4 },
    { id: "document", title: "Пов'язаний документ", icon: FileText, priority: 5 },
  ] as PaymentDetailSection[],
};

// RETURN
export const returnDetailConfig = {
  sections: [
    { id: "reason", title: "Причина повернення", icon: ArrowLeftRight, priority: 1 },
    { id: "original-payment", title: "Пов'язане надходження", icon: Receipt, priority: 2 },
    { id: "documents", title: "Документи-підстава", icon: FileText, priority: 3 },
    { id: "accounting-impact", title: "Вплив на облік", icon: BookOpen, priority: 4 },
  ] as PaymentDetailSection[],
};

// ========== DEMO DATA FOR BREAKDOWN ==========

// Demo monthly income breakdown for quarter
export interface MonthlyIncomeBreakdown {
  month: string;
  amount: number;
}

export const demoQuarterlyBreakdown: Record<string, MonthlyIncomeBreakdown[]> = {
  "Q1-2025": [
    { month: "Січень", amount: 142500 },
    { month: "Лютий", amount: 138000 },
    { month: "Березень", amount: 144500 },
  ],
  "Q4-2024": [
    { month: "Жовтень", amount: 125000 },
    { month: "Листопад", amount: 118500 },
    { month: "Грудень", amount: 156500 },
  ],
};

// Demo employee breakdown for salary taxes
export interface EmployeeTaxBreakdown {
  employeeId: string;
  employeeName: string;
  position: string;
  grossAmount: number;
  pdfoAmount: number;
  militaryAmount: number;
  esvAmount: number;
  netAmount: number;
}

export const demoEmployeeTaxBreakdown: EmployeeTaxBreakdown[] = [
  {
    employeeId: "emp-1",
    employeeName: "Петренко Олександр Васильович",
    position: "Розробник",
    grossAmount: 25000,
    pdfoAmount: 4500,
    militaryAmount: 1250,
    esvAmount: 5500,
    netAmount: 19250,
  },
  {
    employeeId: "emp-2",
    employeeName: "Сидоренко Марія Іванівна",
    position: "Дизайнер",
    grossAmount: 20000,
    pdfoAmount: 3600,
    militaryAmount: 1000,
    esvAmount: 4400,
    netAmount: 15400,
  },
  {
    employeeId: "emp-3",
    employeeName: "Коваленко Андрій Петрович",
    position: "Менеджер",
    grossAmount: 15000,
    pdfoAmount: 2700,
    militaryAmount: 750,
    esvAmount: 3300,
    netAmount: 11550,
  },
];

// Demo payment history
export interface PaymentHistoryItem {
  id: string;
  period: string;
  amount: number;
  paidDate: string;
  status: "paid" | "pending" | "overdue";
}

export const demoPaymentHistory: Record<string, PaymentHistoryItem[]> = {
  ep: [
    { id: "ph-1", period: "IV квартал 2024", amount: 20000, paidDate: "2025-01-17", status: "paid" },
    { id: "ph-2", period: "III квартал 2024", amount: 18750, paidDate: "2024-10-18", status: "paid" },
    { id: "ph-3", period: "II квартал 2024", amount: 17500, paidDate: "2024-07-19", status: "paid" },
  ],
  esv: [
    { id: "ph-4", period: "IV квартал 2024", amount: 5280, paidDate: "2025-01-17", status: "paid" },
    { id: "ph-5", period: "III квартал 2024", amount: 5280, paidDate: "2024-10-18", status: "paid" },
    { id: "ph-6", period: "II квартал 2024", amount: 5280, paidDate: "2024-07-19", status: "paid" },
  ],
};

// ========== HELPER FUNCTIONS ==========

export function getLegalReference(taxType: string): LegalReference | undefined {
  return legalBasisConfig[taxType];
}

export function getQuarterBreakdown(quarter: number, year: number): MonthlyIncomeBreakdown[] {
  const key = `Q${quarter}-${year}`;
  return demoQuarterlyBreakdown[key] || [];
}

export function getPaymentHistory(taxType: string): PaymentHistoryItem[] {
  return demoPaymentHistory[taxType] || [];
}
