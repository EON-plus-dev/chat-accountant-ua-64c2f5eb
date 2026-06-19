/**
 * Mock AI Engine для генерації платежів
 * Імітує "AI-powered" поведінку з детермінованою логікою
 */

import type { Cabinet } from "@/types/cabinet";
import type { 
  TaxPayment, 
  SalaryPayment, 
  ContractorPayment,
  TaxType,
  taxBudgetCodes,
  calculateTaxFromIncome,
  ESV_MINIMUM_2025,
} from "@/config/paymentsConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";

// ========== TYPES ==========

export interface PaymentDraft {
  id: string;
  type: "tax" | "salary" | "contractor";
  taxType?: TaxType;
  amount: number;
  recipient: string;
  recipientCode?: string;
  recipientIban?: string;
  purpose: string;
  deadline?: string;
  period?: string;
  
  // AI metadata
  aiGenerated: boolean;
  sourceRecordIds?: string[];
  calculationFormula?: string;
  explanation: string;
  confidenceScore: number;
  suggestedAt: string;
}

export interface PaymentSuggestion {
  id: string;
  type: "action" | "warning" | "info";
  message: string;
  actionLabel?: string;
  priority: number;
  relatedPaymentId?: string;
}

export interface UrgencyLevel {
  level: "normal" | "warning" | "urgent" | "overdue";
  message: string;
  daysLeft: number;
  color: string;
}

// ========== TAX CALCULATION HELPERS ==========

const QUARTER_MONTHS: Record<number, string[]> = {
  1: ["Січень", "Лютий", "Березень"],
  2: ["Квітень", "Травень", "Червень"],
  3: ["Липень", "Серпень", "Вересень"],
  4: ["Жовтень", "Листопад", "Грудень"],
};

const QUARTER_LABELS: Record<number, string> = {
  1: "І квартал",
  2: "ІІ квартал",
  3: "ІІІ квартал",
  4: "ІV квартал",
};

/**
 * Мінімальний ЄСВ 2025 (8000 грн × 22%)
 */
const ESV_MIN_MONTHLY = 1760;

/**
 * Ставка ЄП для 3 групи
 */
const EP_RATE_GROUP_3 = 0.05;

// ========== MOCK AI FUNCTIONS ==========

/**
 * Імітація затримки AI-обробки
 */
export async function simulateAIDelay(ms: number = 800): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Генерує пояснення для податкового платежу
 * Імітує AI-відповідь з формулою розрахунку
 */
export function generatePaymentExplanation(
  payment: TaxPayment,
  incomeTotal?: number
): string {
  const { taxType, amountToPay, period } = payment;
  
  switch (taxType) {
    case "ep":
      if (incomeTotal) {
        return `ЄП розраховано як 5% від доходу ${formatCurrency(incomeTotal)} за ${period}. Формула: ${formatCurrency(incomeTotal)} × 5% = ${formatCurrency(amountToPay)}`;
      }
      return `Єдиний податок за ${period}: ${formatCurrency(amountToPay)}`;
      
    case "esv":
      const months = payment.quarter ? 3 : 1;
      return `ЄСВ розраховано як мінімальний внесок: ${formatCurrency(ESV_MIN_MONTHLY)} × ${months} міс. = ${formatCurrency(amountToPay)}. Мінімальна ЗП 2025: 8 000 ₴`;
      
    case "pdfo":
      return `ПДФО утримано із зарплати працівників за ставкою 18%`;
      
    case "military":
      return `Військовий збір утримано із зарплати працівників за ставкою 5% (з грудня 2024)`;
      
    default:
      return `Платіж ${formatCurrency(amountToPay)} за ${period}`;
  }
}

/**
 * Генерує формулу розрахунку для UI
 */
export function generateCalculationFormula(
  taxType: TaxType,
  amount: number,
  baseAmount?: number,
  months?: number
): string {
  switch (taxType) {
    case "ep":
      if (baseAmount) {
        return `${formatCurrency(baseAmount)} × 5% = ${formatCurrency(amount)}`;
      }
      return `Дохід × 5%`;
      
    case "esv":
      const m = months || 3;
      return `8 000 ₴ × 22% × ${m} = ${formatCurrency(amount)}`;
      
    case "pdfo":
      if (baseAmount) {
        return `${formatCurrency(baseAmount)} × 18% = ${formatCurrency(amount)}`;
      }
      return `Брутто × 18%`;
      
    case "military":
      if (baseAmount) {
        return `${formatCurrency(baseAmount)} × 5% = ${formatCurrency(amount)}`;
      }
      return `Брутто × 5%`;
      
    default:
      return "";
  }
}

/**
 * Визначає терміновість платежу
 */
export function getPaymentUrgency(deadline: string): UrgencyLevel {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysLeft < 0) {
    return {
      level: "overdue",
      message: `Прострочено на ${Math.abs(daysLeft)} дн.`,
      daysLeft,
      color: "text-destructive",
    };
  }
  
  if (daysLeft === 0) {
    return {
      level: "urgent",
      message: "Сьогодні останній день!",
      daysLeft,
      color: "text-destructive",
    };
  }
  
  if (daysLeft <= 3) {
    return {
      level: "urgent",
      message: `Через ${daysLeft} дн.`,
      daysLeft,
      color: "text-destructive",
    };
  }
  
  if (daysLeft <= 7) {
    return {
      level: "warning",
      message: `Через ${daysLeft} дн.`,
      daysLeft,
      color: "text-amber-600",
    };
  }
  
  return {
    level: "normal",
    message: `Через ${daysLeft} дн.`,
    daysLeft,
    color: "text-muted-foreground",
  };
}

/**
 * Генерує AI-рекомендації для секції платежів
 */
export function getPaymentSuggestions(
  taxPayments: TaxPayment[],
  salaryPayments: SalaryPayment[],
  contractorPayments?: ContractorPayment[]
): PaymentSuggestion[] {
  const suggestions: PaymentSuggestion[] = [];
  const now = new Date();
  
  // Знаходимо платежі до сплати
  const pendingTax = taxPayments.filter(p => 
    p.status === "scheduled" || p.status === "created"
  );
  
  const pendingSalary = salaryPayments.filter(p => 
    p.status === "scheduled" || p.status === "created"
  );
  
  // Сумарна рекомендація
  const totalPending = pendingTax.length + pendingSalary.length;
  if (totalPending > 0) {
    const totalAmount = [
      ...pendingTax.map(p => p.amountToPay),
      ...pendingSalary.map(p => p.amount),
    ].reduce((sum, a) => sum + a, 0);
    
    suggestions.push({
      id: "pending-total",
      type: "action",
      message: `У вас ${totalPending} платеж${getPlural(totalPending, "ів", "і", "")} на ${formatCurrency(totalAmount)}`,
      actionLabel: "Переглянути",
      priority: 1,
    });
  }
  
  // Термінові дедлайни
  const urgentPayments = pendingTax.filter(p => {
    const urgency = getPaymentUrgency(p.deadline);
    return urgency.level === "urgent" || urgency.level === "overdue";
  });
  
  if (urgentPayments.length > 0) {
    const firstUrgent = urgentPayments[0];
    const urgency = getPaymentUrgency(firstUrgent.deadline);
    
    suggestions.push({
      id: "urgent-deadline",
      type: "warning",
      message: `Дедлайн ${firstUrgent.taxTypeLabel}: ${urgency.message}`,
      actionLabel: "Сплатити",
      priority: 0,
      relatedPaymentId: firstUrgent.id,
    });
  }
  
  // Несформовані платежі
  const notCreated = taxPayments.filter(p => p.status === "not-created");
  if (notCreated.length > 0) {
    suggestions.push({
      id: "not-created",
      type: "info",
      message: `${notCreated.length} платеж${getPlural(notCreated.length, "ів", "і", "")} ще не сформовано`,
      actionLabel: "Сформувати",
      priority: 2,
    });
  }
  
  return suggestions.sort((a, b) => a.priority - b.priority);
}

/**
 * Генерує драфти платежів на основі Книги доходів
 */
export async function generatePaymentDrafts(
  incomeRecords: IncomeBookRecord[],
  quarter: number,
  year: number,
  cabinet: Cabinet
): Promise<PaymentDraft[]> {
  // Імітуємо AI-обробку
  await simulateAIDelay(1200);
  
  const drafts: PaymentDraft[] = [];
  
  // Фільтруємо записи за квартал
  const quarterStart = new Date(year, (quarter - 1) * 3, 1);
  const quarterEnd = new Date(year, quarter * 3, 0);
  
  const quarterRecords = incomeRecords.filter(r => {
    const date = new Date(r.date);
    return date >= quarterStart && date <= quarterEnd && r.status === "income";
  });
  
  // Розраховуємо дохід
  const totalIncome = quarterRecords.reduce((sum, r) => sum + r.inIncomeBook, 0);
  
  // Генеруємо ЄП
  if (totalIncome > 0) {
    const epAmount = Math.round(totalIncome * EP_RATE_GROUP_3);
    const deadline = new Date(year, quarter * 3, 19); // 19 число наступного місяця
    
    drafts.push({
      id: `draft-ep-${quarter}-${year}`,
      type: "tax",
      taxType: "ep",
      amount: epAmount,
      recipient: "ГУ ДПС у м. Києві",
      recipientCode: "44094520",
      recipientIban: "UA218201720343130001000015825",
      purpose: `*;101;0000000000;Єдиний податок за ${QUARTER_LABELS[quarter]} ${year}`,
      deadline: deadline.toISOString().split("T")[0],
      period: `${QUARTER_LABELS[quarter]} ${year}`,
      aiGenerated: true,
      sourceRecordIds: quarterRecords.map(r => r.id),
      calculationFormula: `${formatCurrency(totalIncome)} × 5% = ${formatCurrency(epAmount)}`,
      explanation: `ЄП розраховано автоматично на основі ${quarterRecords.length} операцій у Книзі доходів за ${QUARTER_LABELS[quarter]} ${year}`,
      confidenceScore: 0.95,
      suggestedAt: new Date().toISOString(),
    });
  }
  
  // Генеруємо ЄСВ (мінімальний)
  const esvAmount = ESV_MIN_MONTHLY * 3;
  const esvDeadline = new Date(year, quarter * 3, 19);
  
  drafts.push({
    id: `draft-esv-${quarter}-${year}`,
    type: "tax",
    taxType: "esv",
    amount: esvAmount,
    recipient: "ГУ ДПС у м. Києві",
    recipientCode: "44094520",
    recipientIban: "UA538212070000026007300905065",
    purpose: `*;101;0000000000;Єдиний соціальний внесок за ${QUARTER_LABELS[quarter]} ${year}`,
    deadline: esvDeadline.toISOString().split("T")[0],
    period: `${QUARTER_LABELS[quarter]} ${year}`,
    aiGenerated: true,
    calculationFormula: `8 000 ₴ × 22% × 3 = ${formatCurrency(esvAmount)}`,
    explanation: `ЄСВ розраховано як мінімальний внесок: 8 000 ₴ (мін. ЗП) × 22% × 3 міс.`,
    confidenceScore: 1.0,
    suggestedAt: new Date().toISOString(),
  });
  
  return drafts;
}

/**
 * Форматує відповідь для чату
 */
export function formatPaymentChatResponse(
  payments: TaxPayment[],
  type: "pending" | "overdue" | "paid" | "all"
): string {
  let filtered: TaxPayment[];
  let title: string;
  
  switch (type) {
    case "pending":
      filtered = payments.filter(p => p.status === "scheduled" || p.status === "created");
      title = "📋 **Платежі до сплати:**";
      break;
    case "overdue":
      filtered = payments.filter(p => p.status === "overdue");
      title = "⚠️ **Прострочені платежі:**";
      break;
    case "paid":
      filtered = payments.filter(p => p.status === "paid");
      title = "✅ **Оплачені платежі:**";
      break;
    default:
      filtered = payments;
      title = "📊 **Усі платежі:**";
  }
  
  if (filtered.length === 0) {
    return type === "pending" 
      ? "✓ Немає платежів до сплати. Все оплачено!" 
      : "Платежів не знайдено.";
  }
  
  const lines = filtered.map(p => {
    const urgency = getPaymentUrgency(p.deadline);
    const urgencyIcon = urgency.level === "urgent" ? "🔴" : urgency.level === "warning" ? "🟡" : "🟢";
    return `${urgencyIcon} **${p.taxTypeLabel}** ${p.period}: ${formatCurrency(p.amountToPay)} — ${urgency.message}`;
  });
  
  const total = filtered.reduce((sum, p) => sum + p.amountToPay, 0);
  
  return `${title}\n\n${lines.join("\n")}\n\n**Всього:** ${formatCurrency(total)}`;
}

/**
 * Генерує пояснення "чому така сума"
 */
export function explainTaxAmount(
  taxType: TaxType,
  amount: number,
  incomeTotal?: number,
  period?: string
): string {
  const periodText = period || "поточний період";
  
  switch (taxType) {
    case "ep":
      if (incomeTotal) {
        return `🧮 **Розрахунок ЄП за ${periodText}:**

**База:** Дохід згідно Книги доходів
**Сума доходу:** ${formatCurrency(incomeTotal)}
**Ставка:** 5% (3 група ЄП)

**Формула:** ${formatCurrency(incomeTotal)} × 5% = **${formatCurrency(amount)}**

Розраховано автоматично на основі синхронізованих даних.`;
      }
      return `ЄП за ${periodText}: ${formatCurrency(amount)}. Для детального розрахунку перегляньте Книгу доходів.`;
      
    case "esv":
      return `🧮 **Розрахунок ЄСВ за ${periodText}:**

**Мінімальна ЗП 2025:** 8 000 ₴
**Ставка ЄСВ:** 22%
**Період:** 3 місяці

**Формула:** 8 000 ₴ × 22% × 3 = **${formatCurrency(amount)}**

ЄСВ сплачується незалежно від наявності доходу.`;
      
    default:
      return `Сума платежу: ${formatCurrency(amount)}`;
  }
}

/**
 * Генерує пояснення для зарплатного платежу
 */
export function generateSalaryExplanation(payment: SalaryPayment): string {
  const grossAmount = payment.grossAmount || payment.amount + (payment.pdfoAmount || 0) + (payment.militaryTaxAmount || 0);
  
  return `👤 **Зарплата ${payment.employeeName} за ${payment.period}:**

**Брутто:** ${formatCurrency(grossAmount)}
${payment.pdfoAmount ? `**ПДФО (18%):** ${formatCurrency(payment.pdfoAmount)}` : ''}
${payment.militaryTaxAmount ? `**ВЗ (5%):** ${formatCurrency(payment.militaryTaxAmount)}` : ''}
${payment.esvAmount ? `**ЄСВ (22%):** ${formatCurrency(payment.esvAmount)}` : ''}

**До виплати (нетто):** ${formatCurrency(payment.amount)}

Розраховано автоматично згідно чинного законодавства.`;
}

/**
 * Генерує пояснення для платежу контрагенту
 */
export function generateContractorExplanation(payment: ContractorPayment): string {
  const docInfo = payment.contractNumber 
    ? `\n**Підстава:** Договір №${payment.contractNumber}` 
    : payment.invoiceNumber 
      ? `\n**Підстава:** Рахунок №${payment.invoiceNumber}`
      : '';
  
  return `🏢 **Оплата контрагенту ${payment.contractor}:**

**Сума:** ${formatCurrency(payment.amount)}${payment.vatAmount ? ` (з ПДВ ${formatCurrency(payment.vatAmount)})` : ' (без ПДВ)'}${docInfo}
**Призначення:** ${payment.purpose || 'Оплата за товари/послуги'}

${payment.contractorCode ? `**ЄДРПОУ:** ${payment.contractorCode}` : ''}
${payment.recipientIban ? `**IBAN:** ${payment.recipientIban}` : ''}`;
}

// ========== HELPERS ==========

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("uk-UA").format(amount) + " ₴";
}

function getPlural(n: number, form1: string, form2: string, form3: string): string {
  const n10 = n % 10;
  const n100 = n % 100;
  
  if (n100 >= 11 && n100 <= 14) return form1;
  if (n10 === 1) return form3;
  if (n10 >= 2 && n10 <= 4) return form2;
  return form1;
}
