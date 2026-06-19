/**
 * Модуль двосторонньої синхронізації між документами та операціями Книги доходів
 * 
 * Логіка зв'язування:
 * 1. Документ → Операція: При оплаті рахунка знаходимо відповідну операцію в Книзі
 * 2. Операція → Документ: При надходженні платежу пропонуємо зв'язати з рахунком
 * 3. Автоматичне оновлення статусів при зміні стану зв'язаних об'єктів
 */

import type { Document, DocumentFlowStatus, LinkedPayment } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";

// ============================================
// ТИПИ ТА ІНТЕРФЕЙСИ
// ============================================

export interface SyncResult {
  success: boolean;
  linkedDocumentId?: string;
  linkedPaymentId?: string;
  message: string;
  action: "linked" | "unlinked" | "status-updated" | "no-action";
}

export interface MatchCandidate {
  documentId: string;
  documentNumber: string;
  documentType: string;
  contractorName?: string;
  amount: number;
  date: string;
  matchScore: number; // 0-100
  matchReasons: string[];
}

export interface PaymentMatchCandidate {
  paymentId: string;
  description: string;
  contractor?: string;
  amount: number;
  date: string;
  matchScore: number;
  matchReasons: string[];
}

// ============================================
// АВТОМАТИЧНЕ ЗІСТАВЛЕННЯ
// ============================================

/**
 * Знаходить можливі документи для зв'язування з операцією
 */
export function findMatchingDocuments(
  payment: IncomeBookRecord,
  documents: Document[]
): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];

  for (const doc of documents) {
    // Пропускаємо документи без суми або вже оплачені повністю
    if (!doc.amount || doc.status === "paid" || doc.status === "archived" || doc.status === "cancelled") {
      continue;
    }

    // Пропускаємо документи не-рахунки
    if (doc.type !== "invoice") {
      continue;
    }

    const matchReasons: string[] = [];
    let score = 0;

    // Точне співпадіння суми (+40 балів)
    if (doc.amount === payment.amount) {
      score += 40;
      matchReasons.push("Точне співпадіння суми");
    } else if (Math.abs(doc.amount - payment.amount) <= doc.amount * 0.05) {
      // Сума в межах 5% (+20 балів)
      score += 20;
      matchReasons.push("Сума близька (±5%)");
    }

    // Співпадіння контрагента (+35 балів)
    if (doc.contractor && payment.contractor) {
      const docName = doc.contractor.name.toLowerCase();
      const paymentContractor = payment.contractor.toLowerCase();
      
      if (docName === paymentContractor || docName.includes(paymentContractor) || paymentContractor.includes(docName)) {
        score += 35;
        matchReasons.push("Співпадіння контрагента");
      }
    }

    // Співпадіння коду контрагента (+25 балів)
    if (doc.contractor?.code && payment.contractorCode) {
      if (doc.contractor.code === payment.contractorCode) {
        score += 25;
        matchReasons.push("Співпадіння ЄДРПОУ/ІПН");
      }
    }

    // Дата документа раніше платежу (+10 балів)
    if (new Date(doc.date) <= new Date(payment.date)) {
      score += 10;
      matchReasons.push("Дата документа передує оплаті");
    }

    // Номер документа в описі платежу (+20 балів)
    if (payment.description.toLowerCase().includes(doc.number.toLowerCase())) {
      score += 20;
      matchReasons.push("Номер документа в призначенні");
    }

    // Мінімальний поріг для включення
    if (score >= 30) {
      candidates.push({
        documentId: doc.id,
        documentNumber: doc.number,
        documentType: doc.type,
        contractorName: doc.contractor?.name,
        amount: doc.amount,
        date: doc.date,
        matchScore: Math.min(score, 100),
        matchReasons,
      });
    }
  }

  // Сортуємо за релевантністю
  return candidates.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Знаходить можливі операції для зв'язування з документом
 */
export function findMatchingPayments(
  document: Document,
  payments: IncomeBookRecord[]
): PaymentMatchCandidate[] {
  const candidates: PaymentMatchCandidate[] = [];

  // Пропускаємо документи без суми
  if (!document.amount) {
    return candidates;
  }

  for (const payment of payments) {
    // Пропускаємо повернення та проблемні записи
    if (payment.status === "return" || payment.status === "needs-clarification") {
      continue;
    }

    const matchReasons: string[] = [];
    let score = 0;

    // Точне співпадіння суми (+40 балів)
    if (document.amount === payment.amount) {
      score += 40;
      matchReasons.push("Точне співпадіння суми");
    } else if (Math.abs(document.amount - payment.amount) <= document.amount * 0.05) {
      score += 20;
      matchReasons.push("Сума близька (±5%)");
    }

    // Співпадіння контрагента (+35 балів)
    if (document.contractor && payment.contractor) {
      const docName = document.contractor.name.toLowerCase();
      const paymentContractor = payment.contractor.toLowerCase();
      
      if (docName === paymentContractor || docName.includes(paymentContractor) || paymentContractor.includes(docName)) {
        score += 35;
        matchReasons.push("Співпадіння контрагента");
      }
    }

    // Співпадіння коду контрагента (+25 балів)
    if (document.contractor?.code && payment.contractorCode) {
      if (document.contractor.code === payment.contractorCode) {
        score += 25;
        matchReasons.push("Співпадіння ЄДРПОУ/ІПН");
      }
    }

    // Номер документа в описі платежу (+20 балів)
    if (payment.description.toLowerCase().includes(document.number.toLowerCase())) {
      score += 20;
      matchReasons.push("Номер документа в призначенні");
    }

    // Дата платежу пізніше документа (+10 балів)
    if (new Date(payment.date) >= new Date(document.date)) {
      score += 10;
      matchReasons.push("Оплата після виставлення");
    }

    // Мінімальний поріг
    if (score >= 30) {
      candidates.push({
        paymentId: payment.id,
        description: payment.description,
        contractor: payment.contractor,
        amount: payment.amount,
        date: payment.date,
        matchScore: Math.min(score, 100),
        matchReasons,
      });
    }
  }

  return candidates.sort((a, b) => b.matchScore - a.matchScore);
}

// ============================================
// ОПЕРАЦІЇ СИНХРОНІЗАЦІЇ
// ============================================

/**
 * Зв'язує документ з операцією та оновлює статуси
 */
export function linkDocumentToPayment(
  document: Document,
  payment: IncomeBookRecord
): { updatedDocument: Document; updatedPayment: IncomeBookRecord } {
  const now = new Date().toISOString();

  // Оновлюємо документ
  const linkedPayment: LinkedPayment = {
    id: payment.id,
    amount: payment.amount,
    date: payment.date,
    source: payment.source,
  };

  const existingPayments = document.linkedPayments || [];
  const alreadyLinked = existingPayments.some(p => p.id === payment.id);

  const updatedDocument: Document = {
    ...document,
    linkedPayments: alreadyLinked 
      ? existingPayments 
      : [...existingPayments, linkedPayment],
    paidAmount: (document.paidAmount || 0) + (alreadyLinked ? 0 : payment.amount),
    updatedAt: now,
    history: [
      ...(document.history || []),
      {
        id: `h-${Date.now()}`,
        timestamp: now,
        action: "paid" as const,
        actor: "Система",
        newValue: `Зв'язано з операцією ${payment.id}`,
        comment: `Оплата ${payment.amount} ₴ від ${payment.date}`,
      },
    ],
  };

  // Розраховуємо новий статус документа
  if (document.amount && updatedDocument.paidAmount) {
    if (updatedDocument.paidAmount >= document.amount) {
      updatedDocument.status = "paid";
    } else if (updatedDocument.paidAmount > 0) {
      updatedDocument.status = "partially-paid";
    }
  }

  // Оновлюємо операцію
  const updatedPayment: IncomeBookRecord = {
    ...payment,
    relatedDocument: {
      type: document.type as "invoice" | "act" | "contract" | "check",
      number: document.number,
      date: document.date,
    },
  };

  return { updatedDocument, updatedPayment };
}

/**
 * Розриває зв'язок між документом та операцією
 */
export function unlinkDocumentFromPayment(
  document: Document,
  paymentId: string
): Document {
  const payment = document.linkedPayments?.find(p => p.id === paymentId);
  if (!payment) return document;

  const now = new Date().toISOString();

  const updatedDocument: Document = {
    ...document,
    linkedPayments: document.linkedPayments?.filter(p => p.id !== paymentId),
    paidAmount: Math.max(0, (document.paidAmount || 0) - payment.amount),
    updatedAt: now,
    history: [
      ...(document.history || []),
      {
        id: `h-${Date.now()}`,
        timestamp: now,
        action: "edited" as const,
        actor: "Система",
        comment: `Видалено зв'язок з операцією ${paymentId}`,
      },
    ],
  };

  // Перераховуємо статус
  if (document.amount) {
    if (!updatedDocument.paidAmount || updatedDocument.paidAmount === 0) {
      // Повертаємо до попереднього статусу (sent або confirmed)
      updatedDocument.status = document.status === "paid" ? "sent" : document.status;
    } else if (updatedDocument.paidAmount < document.amount) {
      updatedDocument.status = "partially-paid";
    }
  }

  return updatedDocument;
}

/**
 * Оновлює статус документа при зміні статусу операції
 */
export function syncDocumentStatusFromPayment(
  document: Document,
  paymentStatus: "income" | "not-income" | "return"
): Document {
  if (paymentStatus === "return") {
    // Повернення коштів - зменшуємо оплачену суму
    return {
      ...document,
      status: document.paidAmount && document.amount && document.paidAmount >= document.amount
        ? "paid"
        : "partially-paid",
    };
  }

  if (paymentStatus === "not-income") {
    // Операція виключена з доходу - можливо потрібно перевірити документ
    return document;
  }

  return document;
}

// ============================================
// УТИЛІТИ ПОШУКУ
// ============================================

/**
 * Знаходить документ за ID операції з Книги доходів
 */
export function findDocumentByPaymentId(
  paymentId: string,
  documents: Document[]
): Document | undefined {
  return documents.find(doc => 
    doc.linkedPayments?.some(p => p.id === paymentId)
  );
}

/**
 * Знаходить операцію за номером пов'язаного документа
 */
export function findPaymentByDocumentNumber(
  documentNumber: string,
  payments: IncomeBookRecord[]
): IncomeBookRecord | undefined {
  return payments.find(payment => 
    payment.relatedDocument?.number === documentNumber
  );
}

/**
 * Отримує всі незв'язані операції (потенційні кандидати для зв'язування)
 */
export function getUnlinkedPayments(
  payments: IncomeBookRecord[]
): IncomeBookRecord[] {
  return payments.filter(p => 
    p.status === "income" && 
    !p.relatedDocument &&
    p.amount > 0
  );
}

/**
 * Отримує всі неоплачені документи (потенційні кандидати для зв'язування)
 */
export function getUnpaidDocuments(
  documents: Document[]
): Document[] {
  return documents.filter(doc => 
    doc.type === "invoice" &&
    doc.amount &&
    doc.status !== "paid" &&
    doc.status !== "archived" &&
    doc.status !== "cancelled"
  );
}

// ============================================
// АНАЛІТИКА СИНХРОНІЗАЦІЇ
// ============================================

export interface SyncAnalytics {
  totalDocuments: number;
  linkedDocuments: number;
  unpaidDocuments: number;
  totalPayments: number;
  linkedPayments: number;
  unlinkedPayments: number;
  syncRate: number; // відсоток зв'язаних
  potentialMatches: number; // кількість потенційних зв'язків
}

/**
 * Розраховує аналітику синхронізації
 */
export function calculateSyncAnalytics(
  documents: Document[],
  payments: IncomeBookRecord[]
): SyncAnalytics {
  const invoices = documents.filter(d => d.type === "invoice");
  const linkedDocs = invoices.filter(d => d.linkedPayments && d.linkedPayments.length > 0);
  const unpaidDocs = getUnpaidDocuments(documents);
  
  const incomePayments = payments.filter(p => p.status === "income");
  const linkedPayments = incomePayments.filter(p => p.relatedDocument);
  const unlinkedPayments = getUnlinkedPayments(payments);

  // Рахуємо потенційні зв'язки
  let potentialMatches = 0;
  for (const payment of unlinkedPayments) {
    const matches = findMatchingDocuments(payment, documents);
    if (matches.length > 0) {
      potentialMatches++;
    }
  }

  return {
    totalDocuments: invoices.length,
    linkedDocuments: linkedDocs.length,
    unpaidDocuments: unpaidDocs.length,
    totalPayments: incomePayments.length,
    linkedPayments: linkedPayments.length,
    unlinkedPayments: unlinkedPayments.length,
    syncRate: invoices.length > 0 
      ? Math.round((linkedDocs.length / invoices.length) * 100) 
      : 0,
    potentialMatches,
  };
}

/**
 * Генерує підказки для AI-асистента на основі стану синхронізації
 */
export function generateSyncSuggestions(analytics: SyncAnalytics): string[] {
  const suggestions: string[] = [];

  if (analytics.potentialMatches > 0) {
    suggestions.push(`Знайдено ${analytics.potentialMatches} операцій, які можна зв'язати з документами`);
  }

  if (analytics.unpaidDocuments > 0) {
    suggestions.push(`${analytics.unpaidDocuments} рахунків очікують оплати`);
  }

  if (analytics.unlinkedPayments > 0) {
    suggestions.push(`${analytics.unlinkedPayments} операцій без пов'язаних документів`);
  }

  if (analytics.syncRate < 50) {
    suggestions.push(`Рівень синхронізації ${analytics.syncRate}% — рекомендую перевірити зв'язки`);
  }

  return suggestions;
}
