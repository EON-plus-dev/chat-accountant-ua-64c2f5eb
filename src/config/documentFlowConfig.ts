/**
 * ============================================
 * УНІВЕРСАЛЬНА МОДЕЛЬ ДОКУМЕНТА v2.0
 * ============================================
 * 
 * Ця модель підтримує:
 * 
 * 1. РІЗНІ ТИПИ ДОКУМЕНТІВ:
 *    - Первинні (рахунки, акти, накладні)
 *    - Договірні (договори, ДУ, додатки)
 *    - Фіскальні (чеки ПРРО, ПН)
 *    - Звітні (декларації)
 *    - Банківські (платіжки, виписки)
 *    - Внутрішні (накази, довіреності)
 * 
 * 2. УНІФІКОВАНІ СТАТУСИ:
 *    - status (DocumentFlowStatus): Життєвий цикл для степпера
 *    - signatureStatus: Статус підписання (окремо)
 *    - accountingStatus: Статус в бухобліку
 *    - taxStatus: Статус в податковому обліку
 * 
 * 3. ЗВ'ЯЗКИ З ОБЛІКОМ І ПОДАТКАМИ:
 *    - hasAccountingImpact: Чи впливає на облік
 *    - accounting.entries[]: Проводки
 *    - taxDeclarations[]: Пов'язані декларації
 *    - affectsFopLimit: Вплив на ліміт ФОП
 * 
 * 4. AI-РЕЗЮМЕ / РИЗИКИ / ТАСКИ:
 *    - aiSummary: Коротке AI-резюме
 *    - aiRisks[]: Виявлені ризики з HITL
 *    - tasks[]: Чек-лист дій по документу
 * 
 * 5. ДЖЕРЕЛО ДОКУМЕНТА:
 *    - source: UPLOAD / GENERATED / EXTERNAL
 *    - sourceSystem: M.E.Doc, Vchasno, 1С тощо
 * 
 * 6. СТОРОНИ (PARTIES):
 *    - parties[]: Масив сторін з ролями
 *    - isCabinetOwner: Позначка власника кабінету
 * 
 * Усі лейбли — українською. Enum-и мають відповідні *Labels records.
 * ============================================
 */

import type { LucideIcon } from "lucide-react";
import {
  isDemoCabinet,
  getDemoDocumentsForCabinet,
} from "@/config/demoCabinetsData";
import { getDateFromNow, getDateInPast } from "@/config/demoCabinets/helpers";
import {
  FileText,
  FileCheck2,
  FileSignature,
  FileClock,
  FileArchive,
  FileX,
  Send,
  Receipt,
  ScrollText,
  Truck,
  ClipboardCheck,
  Stamp,
  FileQuestion,
  File,
} from "lucide-react";

// ============================================
// ТИПИ ДОКУМЕНТІВ
// ============================================

export type DocumentType =
  | "invoice"           // Рахунок
  | "act"               // Акт виконаних робіт
  | "contract"          // Договір
  | "waybill"           // Накладна
  | "ttn"               // Товарно-транспортна накладна
  | "tax-invoice"       // Податкова накладна
  | "prro-receipt"      // Чек ПРРО/РРО
  | "reconciliation"    // Акт звірки
  | "certificate"       // Довідка
  | "receipt"           // Квитанція
  | "power-of-attorney" // Довіреність
  | "order"             // Наказ
  | "employment-order"  // Наказ про прийняття
  | "dismissal-order"   // Наказ про звільнення
  | "vacation-order"    // Наказ про відпустку
  | "payment-order"     // Платіжне доручення
  | "bank-statement"    // Виписка банку
  | "rental-agreement"  // Договір оренди
  | "sale-agreement"    // Договір купівлі-продажу
  | "supply-contract"   // Договір поставки
  | "fop-service-contract" // Договір з ФОП-підрядником
  | "discrepancy-act"   // Акт розбіжностей
  | "other";            // Інше

export type DocumentCategory =
  | "primary"      // Первинні (рахунки, акти, накладні)
  | "contract"     // Договірні
  | "fiscal"       // Фіскальні (чеки ПРРО)
  | "report"       // Звітні
  | "bank"         // Банківські
  | "internal";    // Внутрішні

export type DocumentFlowStatus =
  | "draft"              // Чернетка
  | "draft-pending-contractor" // Чернетка — очікує реєстрації контрагента
  | "needs-clarification" // Потребує уточнення (на ролі)
  | "in-review"          // На узгодженні
  | "pending-sign"       // Очікує підпису
  | "signed"             // Підписано (КЕП)
  | "sent"               // Відправлено контрагенту
  | "confirmed"          // Підтверджено контрагентом
  | "paid"               // Оплачено (для рахунків)
  | "partially-paid"     // Частково оплачено
  | "registered"         // Зареєстровано (ЄРПН для ПН)
  | "archived"           // В архіві
  | "cancelled"          // Скасовано
  | "disputed"           // Спір / Оскарження
  | "discrepancy-pending"; // Акт розбіжностей створено

// ============================================
// ТИПИ ПРОБЛЕМ ДОКУМЕНТІВ (Document Issue Types)
// ============================================

export type DocumentIssueType =
  | "pending-signature"       // Очікує підпису
  | "missing-counterparty-sign" // Немає підпису контрагента
  | "expired"                 // Протермінований
  | "overdue-payment"         // Прострочена оплата
  | "missing-payment"         // Відсутня оплата
  | "partial-payment"         // Часткова оплата
  | "missing-contractor"      // Немає контрагента
  | "invalid-requisites"      // Невалідні реквізити
  | "duplicate-suspected"     // Можливий дублікат
  | "missing-file"            // Відсутній файл документа
  | "registration-pending"    // Очікує реєстрації (ЄРПН)
  | "retention-expiring"      // Закінчується термін зберігання
  // Mandatory field validation issues
  | "missing-amount"          // Відсутня сума
  | "missing-date"            // Відсутня дата
  | "missing-subject"         // Відсутній предмет договору
  | "missing-contractor-code"; // Відсутній код контрагента

// ============================================
// ІНТЕРФЕЙС КОМЕНТАРЯ ДО ДОКУМЕНТА
// ============================================

export interface DocumentComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole?: string;           // "accountant" | "lawyer" | "director" | "hr" | "manager"
  content: string;
  createdAt: string;
  editedAt?: string;
  replyToId?: string;            // Для відповідей
  mentions?: string[];           // @згадки
  attachments?: { name: string; url: string }[];
  // Статус "вирішено"
  resolved?: boolean;            // Чи вирішено коментар
  resolvedAt?: string;           // Коли вирішено
  resolvedBy?: string;           // Хто вирішив (userId)
  resolvedByName?: string;       // Ім'я того, хто вирішив
}

// Конфігурація типів проблем документів з метаданими
export interface DocumentIssueTypeConfig {
  label: string;
  shortLabel: string;
  icon: string;
  color: string;         // tailwind color name (amber, orange, red, etc.)
  borderColor: string;   // tailwind border class
  bgColor: string;       // tailwind background class
  bgColorDark: string;   // dark mode background
  priority: number;      // 1 = critical, 5 = low
  autoDetect?: boolean;  // Can be auto-detected from document data
}

export const documentIssueTypeConfig: Record<DocumentIssueType, DocumentIssueTypeConfig> = {
  "pending-signature": {
    label: "Очікує підпису",
    shortLabel: "Без підпису",
    icon: "FileSignature",
    color: "amber",
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-50/60",
    bgColorDark: "dark:bg-amber-950/30",
    priority: 1,
    autoDetect: true,
  },
  "missing-counterparty-sign": {
    label: "Немає підпису контрагента",
    shortLabel: "Без підпису контрагента",
    icon: "UserX",
    color: "orange",
    borderColor: "border-l-orange-400",
    bgColor: "bg-orange-50/60",
    bgColorDark: "dark:bg-orange-950/30",
    priority: 2,
    autoDetect: false,
  },
  "expired": {
    label: "Протермінований документ",
    shortLabel: "Протермінований",
    icon: "Clock",
    color: "red",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50/60",
    bgColorDark: "dark:bg-red-950/30",
    priority: 1,
    autoDetect: true,
  },
  "overdue-payment": {
    label: "Прострочена оплата",
    shortLabel: "Прострочена оплата",
    icon: "AlertCircle",
    color: "red",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50/60",
    bgColorDark: "dark:bg-red-950/30",
    priority: 1,
    autoDetect: true,
  },
  "missing-payment": {
    label: "Відсутня оплата",
    shortLabel: "Без оплати",
    icon: "CreditCard",
    color: "amber",
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-50/60",
    bgColorDark: "dark:bg-amber-950/30",
    priority: 2,
    autoDetect: true,
  },
  "partial-payment": {
    label: "Часткова оплата",
    shortLabel: "Частково оплачено",
    icon: "Percent",
    color: "yellow",
    borderColor: "border-l-yellow-400",
    bgColor: "bg-yellow-50/60",
    bgColorDark: "dark:bg-yellow-950/30",
    priority: 3,
    autoDetect: true,
  },
  "missing-contractor": {
    label: "Немає контрагента",
    shortLabel: "Без контрагента",
    icon: "Building2",
    color: "orange",
    borderColor: "border-l-orange-400",
    bgColor: "bg-orange-50/60",
    bgColorDark: "dark:bg-orange-950/30",
    priority: 2,
    autoDetect: true,
  },
  "invalid-requisites": {
    label: "Невалідні реквізити",
    shortLabel: "Помилка реквізитів",
    icon: "AlertTriangle",
    color: "red",
    borderColor: "border-l-red-400",
    bgColor: "bg-red-50/60",
    bgColorDark: "dark:bg-red-950/30",
    priority: 1,
    autoDetect: false,
  },
  "duplicate-suspected": {
    label: "Можливий дублікат",
    shortLabel: "Дублікат?",
    icon: "Copy",
    color: "purple",
    borderColor: "border-l-purple-400",
    bgColor: "bg-purple-50/60",
    bgColorDark: "dark:bg-purple-950/30",
    priority: 2,
    autoDetect: false,
  },
  "missing-file": {
    label: "Відсутній файл документа",
    shortLabel: "Без файлу",
    icon: "FileX",
    color: "slate",
    borderColor: "border-l-slate-400",
    bgColor: "bg-slate-50/60",
    bgColorDark: "dark:bg-slate-950/30",
    priority: 3,
    autoDetect: true,
  },
  "registration-pending": {
    label: "Очікує реєстрації в ЄРПН",
    shortLabel: "Не зареєстровано",
    icon: "FileSearch",
    color: "blue",
    borderColor: "border-l-blue-400",
    bgColor: "bg-blue-50/60",
    bgColorDark: "dark:bg-blue-950/30",
    priority: 2,
    autoDetect: true,
  },
  "retention-expiring": {
    label: "Закінчується термін зберігання",
    shortLabel: "Термін зберіг.",
    icon: "Calendar",
    color: "slate",
    borderColor: "border-l-slate-400",
    bgColor: "bg-slate-50/60",
    bgColorDark: "dark:bg-slate-950/30",
    priority: 4,
    autoDetect: true,
  },
  // Mandatory field validation issues
  "missing-amount": {
    label: "Відсутня сума документа",
    shortLabel: "Без суми",
    icon: "Wallet",
    color: "orange",
    borderColor: "border-l-orange-400",
    bgColor: "bg-orange-50/60",
    bgColorDark: "dark:bg-orange-950/30",
    priority: 2,
    autoDetect: true,
  },
  "missing-date": {
    label: "Відсутня дата документа",
    shortLabel: "Без дати",
    icon: "Calendar",
    color: "red",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50/60",
    bgColorDark: "dark:bg-red-950/30",
    priority: 1,
    autoDetect: true,
  },
  "missing-subject": {
    label: "Відсутній предмет договору",
    shortLabel: "Без предмету",
    icon: "FileQuestion",
    color: "orange",
    borderColor: "border-l-orange-400",
    bgColor: "bg-orange-50/60",
    bgColorDark: "dark:bg-orange-950/30",
    priority: 2,
    autoDetect: true,
  },
  "missing-contractor-code": {
    label: "Відсутній код контрагента",
    shortLabel: "Без ЄДРПОУ",
    icon: "Building2",
    color: "amber",
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-50/60",
    bgColorDark: "dark:bg-amber-950/30",
    priority: 2,
    autoDetect: true,
  },
};

// Helper to get document issue styles by type (deprecated - use getDocumentRowStyles instead)
export const getDocumentIssueStyles = (issueType?: DocumentIssueType): { border: string; bg: string; bgDark: string } => {
  if (!issueType) {
    return {
      border: "",
      bg: "",
      bgDark: "",
    };
  }
  const config = documentIssueTypeConfig[issueType];
  return {
    border: config.borderColor,
    bg: config.bgColor,
    bgDark: config.bgColorDark,
  };
};

// ============================================
// STATUS-FIRST ROW STYLES WITH SEVERITY ESCALATION
// Border ↔ Badge color synchronization for Documents
// ============================================
import { statusRowStyles, type StatusRowStyle } from "@/config/semanticStyles";

/**
 * Get unified row styles for Document records
 * Implements severity escalation: critical issues upgrade border to red
 * 
 * @param status - Document status
 * @param issues - Array of detected issues
 * @returns StatusRowStyle with synchronized border, badge, and background
 */
export const getDocumentRowStyles = (
  status: DocumentFlowStatus, 
  issues?: DocumentIssueType[]
): StatusRowStyle => {
  // Check for critical issues (priority 1)
  if (issues && issues.length > 0) {
    const hasCritical = issues.some(issue => 
      documentIssueTypeConfig[issue]?.priority === 1
    );
    if (hasCritical) {
      return statusRowStyles["critical"];
    }
  }
  
  return statusRowStyles[status] || statusRowStyles["neutral"];
};

/**
 * Check if document has critical severity issue
 */
export const hasDocumentCriticalIssue = (issues?: DocumentIssueType[]): boolean => {
  if (!issues || issues.length === 0) return false;
  return issues.some(issue => documentIssueTypeConfig[issue]?.priority === 1);
};

// Priority tag configuration for sorting
export interface PriorityTag {
  tag: string;
  priorityLevel: 1 | 2 | 3;
}

const priorityTags: PriorityTag[] = [
  { tag: "Терміново", priorityLevel: 1 },
  { tag: "Urgent", priorityLevel: 1 },
  { tag: "Високий пріоритет", priorityLevel: 2 },
  { tag: "High Priority", priorityLevel: 2 },
  { tag: "Важливо", priorityLevel: 2 },
];

/**
 * Get priority tag from document tags
 */
export const getPriorityFromTags = (tags?: string[]): PriorityTag | null => {
  if (!tags || tags.length === 0) return null;
  for (const priorityTag of priorityTags) {
    if (tags.some(t => t.toLowerCase() === priorityTag.tag.toLowerCase())) {
      return priorityTag;
    }
  }
  return null;
};

/**
 * Calculate document priority score for sorting
 * Lower score = higher priority (documents with issues appear first)
 */
export const getDocumentPriorityScore = (doc: Document): number => {
  let score = 100; // Base score
  
  // 1. Critical issues (Priority 1) — найвищий пріоритет
  const issues = detectDocumentIssues(doc);
  const hasCriticalIssue = issues.some(
    issue => documentIssueTypeConfig[issue]?.priority === 1
  );
  if (hasCriticalIssue) score -= 50;
  
  // 2. Priority tags (Терміново, Високий пріоритет)
  const priorityTag = getPriorityFromTags(doc.tags);
  if (priorityTag?.priorityLevel === 1) score -= 40;
  else if (priorityTag?.priorityLevel === 2) score -= 30;
  
  // 3. Overdue due date
  if (doc.dueDate) {
    const daysUntil = Math.ceil(
      (new Date(doc.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 0) score -= 35; // Прострочено
    else if (daysUntil <= 3) score -= 20; // Критичний термін
    else if (daysUntil <= 7) score -= 10; // Попередження
  }
  
  // 4. Non-critical issues
  if (issues.length > 0 && !hasCriticalIssue) score -= 15;
  
  return score;
};

// Helper to auto-detect issues from document data
export const detectDocumentIssues = (doc: Document): DocumentIssueType[] => {
  const issues: DocumentIssueType[] = [];
  const now = new Date();

  // Pending signature
  if (doc.status === "pending-sign") {
    issues.push("pending-signature");
  }

  // Expired (dueDate passed and not completed)
  if (doc.dueDate && new Date(doc.dueDate) < now && 
      !["paid", "archived", "cancelled", "confirmed"].includes(doc.status)) {
    issues.push("expired");
  }

  // Overdue payment (invoice with passed dueDate and not paid)
  if (doc.type === "invoice" && doc.dueDate && new Date(doc.dueDate) < now && 
      doc.status !== "paid" && doc.status !== "archived" && doc.status !== "cancelled") {
    issues.push("overdue-payment");
  }

  // Missing payment (invoice sent but not paid)
  if (doc.type === "invoice" && doc.status === "sent" && !doc.paidAmount) {
    issues.push("missing-payment");
  }

  // Partial payment
  if (doc.status === "partially-paid" || 
      (doc.amount && doc.paidAmount && doc.paidAmount < doc.amount && doc.paidAmount > 0)) {
    issues.push("partial-payment");
  }

  // Missing contractor (for types that require it)
  const typeConfig = documentTypeConfigs[doc.type];
  if (typeConfig?.requiresContractor && !doc.contractor) {
    issues.push("missing-contractor");
  }

  // Missing file
  if (!doc.files || doc.files.length === 0) {
    issues.push("missing-file");
  }

  // Registration pending for tax invoices
  if (doc.type === "tax-invoice" && doc.status === "signed" && !doc.taxInvoiceNumber) {
    issues.push("registration-pending");
  }

  // Retention expiring (within 30 days)
  if (doc.retentionDeadline) {
    const deadline = new Date(doc.retentionDeadline);
    const daysUntilExpiry = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      issues.push("retention-expiring");
    }
  }

  // === MANDATORY FIELD VALIDATION ===
  
  // Missing amount (for financial document types)
  const financialTypes: DocumentType[] = ["invoice", "act", "contract", "waybill", "tax-invoice", "supply-contract", "fop-service-contract", "rental-agreement"];
  if (financialTypes.includes(doc.type) && !doc.amount) {
    issues.push("missing-amount");
  }
  
  // Missing date
  if (!doc.date) {
    issues.push("missing-date");
  }
  
  // Missing subject (for contract types)
  const contractTypes: DocumentType[] = ["contract", "supply-contract", "fop-service-contract", "rental-agreement", "sale-agreement"];
  if (contractTypes.includes(doc.type) && !doc.subject) {
    issues.push("missing-subject");
  }
  
  // Missing contractor code
  if (doc.contractor && !doc.contractor.code) {
    issues.push("missing-contractor-code");
  }

  return issues;
};

/**
 * Визначає чи є документ вхідним (отриманим від контрагента)
 * Критерії:
 * 1. createdBy === "system" (імпортовано з банку, ПРРО тощо)
 * 2. history містить action: "received"
 * 3. createdBy схожий на назву організації (ТОВ, ФОП, ПП)
 */
export const isIncomingDocument = (doc: Document): boolean => {
  // 1. Документ створено системою (імпорт з банку, ПРРО)
  if (doc.createdBy === "system") {
    return true;
  }
  
  // 2. Історія містить "received" — документ отримано від контрагента
  if (doc.history?.some(entry => entry.action === "received")) {
    return true;
  }
  
  // 3. createdBy схожий на назву організації (зовнішній контрагент)
  const externalPatterns = /^(ТОВ|ФОП|ПП|ПАТ|ПрАТ|TOB|TOV)/i;
  if (externalPatterns.test(doc.createdBy)) {
    return true;
  }
  
  return false;
};

// ============================================
// ІНТЕРФЕЙСИ
// ============================================

export interface DocumentContractor {
  id: string;
  name: string;
  code: string;      // ЄДРПОУ/ІПН
  iban?: string;
  verified?: boolean;
  validationStatus?: "valid" | "pending" | "unknown";
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url?: string;
  uploadedAt: string;
  isSigned?: boolean;
}

export interface DocumentSignature {
  id: string;
  signedBy: string;
  signedAt: string;
  signatureType: "kep" | "qualified-kep" | "manual";
  certificateId?: string;
  certificateIssuer?: string;
  isValid: boolean;
}

export interface DocumentHistoryEntry {
  id: string;
  timestamp: string;
  action: "created" | "edited" | "status-changed" | "signed" | "sent" | "received" | "paid" | "archived" | "cancelled" | "confirmed";
  actor: string;
  previousValue?: string;
  newValue?: string;
  comment?: string;
}

export interface LinkedPayment {
  id: string;           // ID з IncomeBookRecord
  amount: number;
  date: string;
  source?: string;      // Джерело оплати
}

// Перевізник для ТТН
export interface DocumentCarrier {
  name: string;           // Назва компанії-перевізника
  code?: string;          // ЄДРПОУ
  phone?: string;         // Телефон
}

// Транспортний засіб для ТТН
export interface DocumentVehicle {
  number: string;         // Держномер (АА 1234 ВВ)
  type?: "truck" | "van" | "car" | "trailer";
}

// Водій для ТТН
export interface DocumentDriver {
  name: string;           // ПІБ водія
  license?: string;       // Номер посвідчення
}

// Зв'язок документа з пакетом перевірки
export interface AuditPackageRef {
  auditId: string;              // ID перевірки
  addedAt: string;              // Дата додавання
  addedBy?: string;             // Хто додав
  packageType: "request" | "response" | "evidence";  // Тип пакету
}

// ============================================
// ДЖЕРЕЛО ДОКУМЕНТА (NEW v2.0 - EXTENDED)
// ============================================

export type DocumentSourceType = 
  | "UPLOAD"              // Завантажено вручну користувачем
  | "GENERATED"           // Згенеровано/створено в системі (з шаблону)
  | "INTERNAL_RECEIVED"   // Отриманий від іншого кабінету платформи
  | "EXTERNAL_INTEGRATION"; // Отримано через інтеграцію

export const documentSourceTypeLabels: Record<DocumentSourceType, string> = {
  UPLOAD: "Завантажено вручну",
  GENERATED: "Створено в AI-Бухгалтер",
  INTERNAL_RECEIVED: "Отримано від користувача платформи",
  EXTERNAL_INTEGRATION: "Зовнішня інтеграція",
};

// Напрямок документа
export type DocumentDirection = 
  | "incoming"   // Вхідний
  | "outgoing"   // Вихідний
  | "internal";  // Внутрішній

export const documentDirectionLabels: Record<DocumentDirection, string> = {
  incoming: "Вхідний документ від контрагента",
  outgoing: "Вихідний документ для контрагента",
  internal: "Внутрішній документ",
};

// Legacy compatibility
export type DocumentSource = 
  | "upload"              // Завантажено користувачем
  | "generated"           // Згенеровано системою
  | "internal"            // Внутрішній документ
  | "external"            // Зовнішня інтеграція
  | "edo";                // Електронний документообіг

export const documentSourceLabels: Record<DocumentSource, string> = {
  upload: "Завантажено",
  generated: "Згенеровано",
  internal: "Внутрішній",
  external: "Зовнішня система",
  edo: "ЕДО",
};

export type ExternalSystem = 
  | "medoc"               // M.E.Doc
  | "vchasno"             // Вчасно
  | "1c"                  // 1С
  | "email"               // Email
  | "prro"                // ПРРО/РРО
  | "bank"                // Клієнт-банк
  | "checkbox"            // Checkbox
  | "tax_cabinet"         // Кабінет платника податків
  | "erpn"                // ЄРПН
  | "monobank"            // Monobank
  | "privat24"            // Приват24
  | "wayforpay"           // WayForPay
  | "liqpay"              // LiqPay
  | "other";              // Інше

export const externalSystemLabels: Record<ExternalSystem, string> = {
  medoc: "M.E.Doc",
  vchasno: "Vchasno EDI",
  "1c": "1С:Підприємство",
  email: "Email",
  prro: "ПРРО",
  bank: "Клієнт-банк",
  checkbox: "Checkbox",
  tax_cabinet: "Кабінет платника податків",
  erpn: "ЄРПН",
  monobank: "Monobank",
  privat24: "Приват24",
  wayforpay: "WayForPay",
  liqpay: "LiqPay",
  other: "Інше",
};

// ============================================
// ТИПИ ІНТЕГРАЦІЙ (NEW FOR INTEGRATION TAB)
// ============================================

export type IntegrationType = 
  | "edo"        // Електронний документообіг
  | "tax"        // Податкова
  | "bank"       // Банк
  | "erp"        // ERP-система
  | "prro"       // ПРРО
  | "payment";   // Платіжна система

export const integrationTypeLabels: Record<IntegrationType, string> = {
  edo: "ЕДО",
  tax: "Податкова",
  bank: "Банк",
  erp: "ERP",
  prro: "ПРРО",
  payment: "Платіжна система",
};

export type IntegrationStatus = 
  | "not_connected"
  | "queued"
  | "sent"
  | "received"
  | "registered"
  | "processed"
  | "error";

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  not_connected: "Не підключено",
  queued: "У черзі",
  sent: "Надіслано",
  received: "Отримано",
  registered: "Зареєстровано",
  processed: "Опрацьовано",
  error: "Помилка",
};

export interface ExternalIntegration {
  system: ExternalSystem;
  integrationType: IntegrationType;
  status: IntegrationStatus;
  lastSyncAt?: string;
  externalId?: string;
  message?: string;
  actions?: ("refresh" | "resend" | "open_external" | "configure")[];
}

// ============================================
// ВНУТРІШНІ ЗВ'ЯЗКИ (NEW FOR INTEGRATION TAB)
// ============================================

export type InternalModule = 
  | "incomeBook"    // Книга доходів
  | "operations"    // Фінансові операції
  | "payments"      // Платежі
  | "reports"       // Звіти
  | "payroll"       // Зарплата
  | "inventory"     // Склад
  | "auditPackages"; // Пакети перевірок

export const internalModuleLabels: Record<InternalModule, string> = {
  incomeBook: "Книга доходів",
  operations: "Фінансові операції",
  payments: "Платежі",
  reports: "Звіти / Декларації",
  payroll: "Зарплата / Працівники",
  inventory: "Склад",
  auditPackages: "Пакети перевірок",
};

export interface InternalLink {
  module: InternalModule;
  linkType: string;         // basis_for, creates_operation...
  linkedEntity: {
    type: string;
    id: string;
    label: string;
    status?: string;
  };
}

// ============================================
// АВТОМАТИЗАЦІЯ ТА ПРАВИЛА (NEW FOR INTEGRATION TAB)
// ============================================

export type AutomationTriggerType = 
  | "on_create"
  | "on_status_change"
  | "scheduled"
  | "integration_event";

export const automationTriggerLabels: Record<AutomationTriggerType, string> = {
  on_create: "При створенні",
  on_status_change: "При зміні статусу",
  scheduled: "За розкладом",
  integration_event: "За подією інтеграції",
};

export type AutomationResultStatus = 
  | "success"
  | "warning"
  | "error"
  | "pending"
  | "scheduled";

export interface AutomationRule {
  ruleName: string;
  triggerType: AutomationTriggerType;
  lastRunAt?: string;
  scheduledAt?: string;
  lastResult?: AutomationResultStatus;
  actionsSummary?: string;
}

// ============================================
// ТЕХНІЧНІ ДАНІ (NEW FOR INTEGRATION TAB)
// ============================================

export interface TechnicalData {
  internalId: string;
  externalMessageId?: string;
  externalDocumentId?: string;
  storageLocation?: string;
  contentHash?: string;
  lastSyncJobId?: string;
}

// ============================================
// СТАТУС ПІДПИСАННЯ (NEW v2.0)
// ============================================

export type SignatureStatus = 
  | "not-required"        // Підпис не потрібен
  | "pending-our"         // Очікує нашого підпису
  | "pending-counterparty" // Очікує підпису контрагента
  | "pending-both"        // Очікує обох підписів
  | "signed-our"          // Підписано нами
  | "signed-counterparty" // Підписано контрагентом
  | "partially-signed"    // Підписано частиною сторін (3+)
  | "fully-signed";       // Підписано всіма сторонами

export const signatureStatusLabels: Record<SignatureStatus, string> = {
  "not-required": "Підпис не потрібен",
  "pending-our": "Очікує нашого підпису",
  "pending-counterparty": "Очікує підпису контрагента",
  "pending-both": "Очікує обох підписів",
  "signed-our": "Підписано нами",
  "signed-counterparty": "Підписано контрагентом",
  "partially-signed": "Частково підписано",
  "fully-signed": "Повністю підписано",
};

// ============================================
// СТАТУС В ОБЛІКУ ТА ПОДАТКАХ (NEW v2.0)
// ============================================

export type AccountingStatus = 
  | "not-applicable"      // Не впливає на облік
  | "pending"             // Очікує проведення
  | "processed"           // Проведено в обліку
  | "error";              // Помилка проведення

export const accountingStatusLabels: Record<AccountingStatus, string> = {
  "not-applicable": "Не впливає на облік",
  pending: "Очікує проведення",
  processed: "Проведено",
  error: "Помилка",
};

export type TaxStatus = 
  | "not-applicable"      // Не впливає на податки
  | "pending"             // Не враховано
  | "included"            // Враховано в декларації
  | "reported";           // Подано до ДПС

export const taxStatusLabels: Record<TaxStatus, string> = {
  "not-applicable": "Не впливає",
  pending: "Очікує",
  included: "Враховано",
  reported: "Подано",
};

// ============================================
// СТОРОНА ДОКУМЕНТА (NEW v2.0)
// ============================================

export type PartyRole = 
  | "our-side"            // Наша сторона (власник кабінету)
  | "counterparty"        // Контрагент
  | "third-party";        // Третя сторона

export const partyRoleLabels: Record<PartyRole, string> = {
  "our-side": "Наша сторона",
  counterparty: "Контрагент",
  "third-party": "Третя сторона",
};

export interface DocumentParty {
  id: string;
  role: PartyRole;
  semanticRole?: string;          // "Виконавець", "Замовник", "Орендар" тощо
  name: string;
  code: string;                   // ЄДРПОУ/ІПН
  isCabinetOwner: boolean;        // Чи є власником кабінету
  isVerified: boolean;
  verificationSource?: "edr" | "dps" | "manual";
  iban?: string;
  address?: string;
}

// ============================================
// AI-ВИЯВЛЕНІ РИЗИКИ (NEW v2.0)
// ============================================

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskCategory = 
  | "financial"           // Фінансові ризики
  | "legal"               // Юридичні
  | "compliance"          // Комплаєнс
  | "deadline"            // Строки
  | "counterparty";       // Контрагент

/**
 * AI Suggestion for risk resolution
 * Provides actionable recommendations with target location
 */
export interface RiskSuggestion {
  text: string;                     // "Гарантійний термін на товар становить 30 днів..."
  targetSection?: string;           // "п. 3.2" — where to insert/modify
  insertPosition?: "append" | "replace" | "before" | "after";
  confidence: number;               // 0-100 AI confidence in this suggestion
}

export interface DocumentRisk {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;                  // "Підвищена пеня 5%"
  description: string;            // Детальний опис
  sourceSection?: string;         // "Розділ «Штрафні санкції»"
  potentialImpact?: number;       // Потенційний вплив у грн
  
  // AI Suggestion (NEW) — actionable resolution
  suggestion?: RiskSuggestion;
  
  // HITL state
  isConfirmed?: boolean;          // HITL: підтверджено користувачем
  isDisputed?: boolean;           // HITL: оскаржено
  disputeReason?: string;
  isSuggestionAccepted?: boolean; // NEW: suggestion was accepted
}

export const riskSeverityLabels: Record<RiskSeverity, string> = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
  critical: "Критичний",
};

export const riskCategoryLabels: Record<RiskCategory, string> = {
  financial: "Фінансові",
  legal: "Юридичні",
  compliance: "Комплаєнс",
  deadline: "Строки",
  counterparty: "Контрагент",
};

// ============================================
// ПРОВОДКА В ОБЛІКУ (NEW v2.0)
// ============================================

export interface AccountingEntry {
  id: string;
  debitAccount: string;        // "631"
  creditAccount: string;       // "311"
  amount: number;
  description: string;
  entryDate: string;
  journalId?: string;          // ID журналу операцій
}

// ============================================
// ПОСИЛАННЯ НА ПОДАТКОВУ ДЕКЛАРАЦІЮ (NEW v2.0)
// ============================================

export type TaxDeclarationType = "ep" | "esv" | "1df" | "vat";

export interface TaxDeclarationRef {
  declarationId: string;
  declarationType: TaxDeclarationType;  // Єдиний податок, ЄСВ, 4ДФ, ПДВ
  period: string;              // "Q1 2025", "Січень 2025"
  lineItem?: string;           // Рядок декларації
}

export const taxDeclarationTypeLabels: Record<TaxDeclarationType, string> = {
  ep: "Єдиний податок",
  esv: "ЄСВ",
  "1df": "4ДФ",
  vat: "ПДВ",
};

// ============================================
// ЗАВДАННЯ ПО ДОКУМЕНТУ (NEW v2.0)
// ============================================

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "pending" | "in-progress" | "completed" | "skipped";
export type WorkflowPhase = "before-sign" | "after-sign" | "after-confirm" | "archive";

export interface DocumentTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assignee?: string;
  workflowPhase?: WorkflowPhase;
  completedAt?: string;
  completedBy?: string;
}

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
  critical: "Критичний",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: "Очікує",
  "in-progress": "В роботі",
  completed: "Виконано",
  skipped: "Пропущено",
};

export const workflowPhaseLabels: Record<WorkflowPhase, string> = {
  "before-sign": "До підписання",
  "after-sign": "Після підписання",
  "after-confirm": "Після підтвердження",
  archive: "Перед архівацією",
};

export interface Document {
  // ==========================================
  // БАЗОВА ІДЕНТИФІКАЦІЯ
  // ==========================================
  id: string;
  number: string;           // INV-2025-00042
  type: DocumentType;
  subtype?: string;         // NEW: Підтип (для наказів: employment/dismissal/vacation)
  category: DocumentCategory;
  title: string;

  // ==========================================
  // РЕКВІЗИТИ
  // ==========================================
  date: string;             // Дата документа
  dueDate?: string;         // Термін оплати/дії
  amount?: number;
  paidAmount?: number;      // Оплачена сума
  currency: "UAH" | "USD" | "EUR";

  // ==========================================
  // СУБ'ЄКТ ТА КОНТРАГЕНТИ (РОЗШИРЕНО)
  // ==========================================
  cabinetId?: string;          // ID кабінету-власника
  cabinetName?: string;        // Назва кабінету
  cabinetCode?: string;        // ЄДРПОУ/РНОКПП кабінету
  parties?: DocumentParty[];   // Масив сторін з ролями
  contractor?: DocumentContractor; // Legacy: для зворотної сумісності

  // ==========================================
  // ДЖЕРЕЛО ДОКУМЕНТА (NEW - EXTENDED)
  // ==========================================
  source?: DocumentSource;     // Legacy: UPLOAD / GENERATED / EXTERNAL
  sourceSystem?: ExternalSystem; // NEW: M.E.Doc, Vchasno, 1С, email
  sourceReference?: string;    // NEW: ID в зовнішній системі
  
  // NEW: Extended source fields for Integration tab
  sourceType?: DocumentSourceType;      // UPLOAD / GENERATED / INTERNAL_RECEIVED / EXTERNAL_INTEGRATION
  sourceChannel?: string;               // M.E.Doc, Vchasno, Email, тощо
  direction?: DocumentDirection;        // incoming / outgoing / internal
  externalIntegrations?: ExternalIntegration[];  // Зовнішні інтеграції
  internalLinks?: InternalLink[];       // Внутрішні зв'язки
  automationRules?: AutomationRule[];   // Правила автоматизації
  technicalData?: TechnicalData;        // Технічні дані

  // ==========================================
  // СТАТУСИ (УНІФІКОВАНО)
  // ==========================================
  
  // Життєвий цикл (для степпера в хедері)
  status: DocumentFlowStatus;  // draft → pending-sign → signed → sent → confirmed → archived
  
  // Статус погодження (для ТОВ approval workflow)
  approvalRoute?: string;   // ID маршруту погодження
  currentApprover?: string; // Хто зараз має підписати
  
  // Статус підписання (NEW: окремо від lifecycle)
  signatureStatus?: SignatureStatus;
  
  // Статус в обліку (NEW)
  accountingStatus?: AccountingStatus;
  
  // Статус в податках (NEW)  
  taxStatus?: TaxStatus;

  // ==========================================
  // ОБЛІК ТА ПОДАТКИ (РОЗШИРЕНО)
  // ==========================================
  hasAccountingImpact?: boolean;  // NEW: Чи впливає на облік
  accounting?: {
    account?: string;              // Рахунок обліку (631, 361, 703)
    costCenter?: string;           // Центр витрат / Відділ
    taxCategory?: "income" | "expense" | "other";  // Тип для Книги доходів
    taxImpact?: number;            // Вплив на податкову базу
    entries?: AccountingEntry[];   // NEW: Проводки
  };
  taxDeclarations?: TaxDeclarationRef[]; // NEW: Пов'язані декларації
  affectsFopLimit?: boolean;      // NEW: Вплив на ліміт ФОП

  // ==========================================
  // ЗВ'ЯЗКИ
  // ==========================================
  linkedPayments?: LinkedPayment[];   // ID операцій з Книги доходів
  linkedDocuments?: string[];         // Пов'язані документи (акт → рахунок)
  parentDocumentId?: string;          // Для версій
  previousVersionId?: string;         // NEW: Явний зв'язок з попередньою версією
  auditPackages?: AuditPackageRef[];  // Зв'язки з пакетами перевірок
  packageIds?: string[];              // NEW: Пакети документів

  // ==========================================
  // AI / РЕЗЮМЕ / РИЗИКИ (NEW)
  // ==========================================
  aiSummary?: string;             // NEW: Коротке AI-резюме
  aiRisks?: DocumentRisk[];       // NEW: Виявлені ризики
  tasks?: DocumentTask[];         // NEW: Чек-лист дій
  aiProcessingStatus?: "pending" | "in-progress" | "completed" | "failed";
  aiProcessingStartedAt?: string;
  aiAnalysis?: {                  // Детальний аналіз (DIH)
    dihSummary?: unknown;
    checklist?: unknown;
    analyzedAt?: string;
  };

  // ==========================================
  // ВЕРСІЇ / ІСТОРІЯ
  // ==========================================
  version?: number;               // Поточна версія документа (1, 2, 3...)
  history?: DocumentHistoryEntry[];

  // ==========================================
  // ПІДПИСИ / АРХІВУВАННЯ
  // ==========================================
  signatures?: DocumentSignature[];
  archiveDate?: string;
  retentionPeriod: number;        // Років зберігання
  retentionDeadline?: string;     // Дата до якої зберігання
  storageLocation?: string;       // "local" | "cloud" | "prro"
  humanVerified?: boolean;        // Чи верифіковано людиною (після checklist)

  // ==========================================
  // ФАЙЛИ / КОМЕНТАРІ
  // ==========================================
  files?: DocumentFile[];
  comments?: DocumentComment[];
  bodyHtml?: string;

  // ==========================================
  // ISSUES / ТЕГИ
  // ==========================================
  issueTypes?: DocumentIssueType[];   // Масив типів проблем
  issueNote?: string;                 // Опціональний коментар до проблеми
  tags?: string[];                    // ["Терміново", "Audit 2024", "Q1 2025"]

  // ==========================================
  // АУДИТ
  // ==========================================
  createdAt: string;
  createdBy: string;
  updatedAt: string;

  // ==========================================
  // МЕТАДАНІ ДЛЯ ТИПІВ
  // ==========================================
  taxInvoiceNumber?: string;    // Номер ПН для ЄРПН
  prroFiscalNumber?: string;    // Фіскальний номер чека
  
  // Предмет документа (для AI та ручного введення)
  subject?: string;              // "Консалтингові послуги", "Комплектуючі до ПК"
  period?: {                     // Період за який документ
    from: string;
    to: string;
    label?: string;              // "грудень 2024", "Q4 2024"
  };
  
  // Курс валюти та еквівалент в гривні (для валютних документів)
  exchangeRate?: number;           // Курс НБУ на дату документа
  exchangeRateDate?: string;       // Дата курсу
  amountInUAH?: number;            // Сума в гривневому еквіваленті

  // Для HR-документів
  employee?: {
    name: string;
    position?: string;
    department?: string;
  };

  // Для ТТН
  route?: {
    from: string;
    to: string;
  };
  carrier?: DocumentCarrier;   // Перевізник
  vehicle?: DocumentVehicle;   // Транспортний засіб
  driver?: DocumentDriver;     // Водій

  // Для актів звірки
  reconciliationBalance?: {
    amount: number;
    inFavor: "us" | "them";
  };

  // Для виписок
  statementTotals?: {
    income: number;
    expense: number;
    closingBalance: number;
  };

  // ==========================================
  // PENDING CONTRACTOR TRACKING
  // ==========================================
  pendingContractorId?: string;       // ID тимчасового контрагента
  pendingContractorInviteId?: string; // ID запрошення
  pendingContractorEmail?: string;    // Email для відстеження онбордингу
  autoFilledAt?: string;              // Коли реквізити автозаповнено
  autoFilledFields?: string[];        // Які поля були автозаповнені

  // ==========================================
  // TEMPLATE-BASED FIELD VALUES (NEW)
  // ==========================================
  templateId?: string;                // ID шаблону, на основі якого створено
  fieldValues?: Record<string, string | number | boolean>;  // Значення полів з форми

  // ==========================================
  // ЗВ'ЯЗОК З РЕЄСТРОМ МАЙНА
  // ==========================================
  linkedPropertyId?: string;          // ID об'єкта з реєстру майна (крос-посилання)
}

// ============================================
// КОНФІГУРАЦІЯ ТИПІВ ДОКУМЕНТІВ
// ============================================

export interface DocumentTypeConfig {
  type: DocumentType;
  label: string;
  labelPlural: string;
  icon: LucideIcon;
  category: DocumentCategory;
  retentionYears: number;
  requiresSignature: boolean;
  requiresContractor: boolean;
  hasAmount: boolean;
  allowedStatuses: DocumentFlowStatus[];
}

export const documentTypeConfigs: Record<DocumentType, DocumentTypeConfig> = {
  invoice: {
    type: "invoice",
    label: "Рахунок",
    labelPlural: "Рахунки",
    icon: FileText,
    category: "primary",
    retentionYears: 3,
    requiresSignature: false,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "sent", "confirmed", "paid", "partially-paid", "archived", "cancelled"],
  },
  act: {
    type: "act",
    label: "Акт",
    labelPlural: "Акти",
    icon: FileCheck2,
    category: "primary",
    retentionYears: 3,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "archived", "cancelled"],
  },
  contract: {
    type: "contract",
    label: "Договір",
    labelPlural: "Договори",
    icon: FileText,
    category: "contract",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: false,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived", "cancelled"],
  },
  waybill: {
    type: "waybill",
    label: "Накладна",
    labelPlural: "Накладні",
    icon: Truck,
    category: "primary",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "archived", "cancelled"],
  },
  "tax-invoice": {
    type: "tax-invoice",
    label: "Податкова накладна",
    labelPlural: "Податкові накладні",
    icon: ScrollText,
    category: "primary",
    retentionYears: 7,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "registered", "archived", "cancelled"],
  },
  "prro-receipt": {
    type: "prro-receipt",
    label: "Чек ПРРО",
    labelPlural: "Чеки ПРРО",
    icon: Receipt,
    category: "fiscal",
    retentionYears: 3,
    requiresSignature: false,
    requiresContractor: false,
    hasAmount: true,
    allowedStatuses: ["signed", "archived"],
  },
  reconciliation: {
    type: "reconciliation",
    label: "Акт звірки",
    labelPlural: "Акти звірки",
    icon: ClipboardCheck,
    category: "primary",
    retentionYears: 3,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: false,
    allowedStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "archived"],
  },
  certificate: {
    type: "certificate",
    label: "Довідка",
    labelPlural: "Довідки",
    icon: Stamp,
    category: "internal",
    retentionYears: 3,
    requiresSignature: false,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["draft", "signed", "archived"],
  },
  receipt: {
    type: "receipt",
    label: "Квитанція",
    labelPlural: "Квитанції",
    icon: Receipt,
    category: "fiscal",
    retentionYears: 3,
    requiresSignature: false,
    requiresContractor: false,
    hasAmount: true,
    allowedStatuses: ["signed", "archived"],
  },
  "power-of-attorney": {
    type: "power-of-attorney",
    label: "Довіреність",
    labelPlural: "Довіреності",
    icon: FileSignature,
    category: "internal",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived", "cancelled"],
  },
  order: {
    type: "order",
    label: "Наказ",
    labelPlural: "Накази",
    icon: FileText,
    category: "internal",
    retentionYears: 75,
    requiresSignature: true,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived"],
  },
  "payment-order": {
    type: "payment-order",
    label: "Платіжне доручення",
    labelPlural: "Платіжні доручення",
    icon: Send,
    category: "bank",
    retentionYears: 3,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "sent", "archived"],
  },
  "bank-statement": {
    type: "bank-statement",
    label: "Виписка банку",
    labelPlural: "Виписки банку",
    icon: FileText,
    category: "bank",
    retentionYears: 3,
    requiresSignature: false,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["signed", "archived"],
  },
  "rental-agreement": {
    type: "rental-agreement",
    label: "Договір оренди",
    labelPlural: "Договори оренди",
    icon: FileText,
    category: "contract",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived", "cancelled"],
  },
  "sale-agreement": {
    type: "sale-agreement",
    label: "Договір купівлі-продажу",
    labelPlural: "Договори купівлі-продажу",
    icon: FileText,
    category: "contract",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived", "cancelled"],
  },
  ttn: {
    type: "ttn",
    label: "ТТН",
    labelPlural: "Товарно-транспортні накладні",
    icon: Truck,
    category: "primary",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "sent", "confirmed", "archived", "cancelled"],
  },
  "employment-order": {
    type: "employment-order",
    label: "Наказ про прийняття",
    labelPlural: "Накази про прийняття",
    icon: FileText,
    category: "internal",
    retentionYears: 75,
    requiresSignature: true,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived"],
  },
  "dismissal-order": {
    type: "dismissal-order",
    label: "Наказ про звільнення",
    labelPlural: "Накази про звільнення",
    icon: FileText,
    category: "internal",
    retentionYears: 75,
    requiresSignature: true,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived"],
  },
  "vacation-order": {
    type: "vacation-order",
    label: "Наказ про відпустку",
    labelPlural: "Накази про відпустку",
    icon: FileText,
    category: "internal",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived"],
  },
  "supply-contract": {
    type: "supply-contract",
    label: "Договір поставки",
    labelPlural: "Договори поставки",
    icon: FileText,
    category: "contract",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived", "cancelled"],
  },
  "fop-service-contract": {
    type: "fop-service-contract",
    label: "Договір з ФОП",
    labelPlural: "Договори з ФОП-підрядниками",
    icon: FileText,
    category: "contract",
    retentionYears: 5,
    requiresSignature: true,
    requiresContractor: true,
    hasAmount: true,
    allowedStatuses: ["draft", "pending-sign", "signed", "archived", "cancelled"],
  },
  "discrepancy-act": {
    type: "discrepancy-act",
    label: "Акт розбіжностей",
    labelPlural: "Акти розбіжностей",
    icon: FileX,
    category: "primary",
    retentionYears: 3,
    requiresSignature: false,
    requiresContractor: true,
    hasAmount: false,
    allowedStatuses: ["draft", "sent", "confirmed", "archived"],
  },
  other: {
    type: "other",
    label: "Інший документ",
    labelPlural: "Інші документи",
    icon: FileQuestion,
    category: "internal",
    retentionYears: 3,
    requiresSignature: false,
    requiresContractor: false,
    hasAmount: false,
    allowedStatuses: ["draft", "signed", "archived"],
  },
};

// ============================================
// КОНФІГУРАЦІЯ СТАТУСІВ
// ============================================

export interface DocumentStatusConfig {
  status: DocumentFlowStatus;
  label: string;
  color: string;        // Tailwind color class
  icon: LucideIcon;
  isTerminal: boolean;  // Чи це кінцевий статус
}

export const documentStatusConfigs: Record<DocumentFlowStatus, DocumentStatusConfig> = {
  draft: {
    status: "draft",
    label: "Чернетка",
    color: "bg-muted text-muted-foreground",
    icon: FileText,
    isTerminal: false,
  },
  "draft-pending-contractor": {
    status: "draft-pending-contractor",
    label: "Очікує контрагента",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: FileClock,
    isTerminal: false,
  },
  "pending-sign": {
    status: "pending-sign",
    label: "Очікує підпису",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: FileClock,
    isTerminal: false,
  },
  signed: {
    status: "signed",
    label: "Підписано",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    icon: FileSignature,
    isTerminal: false,
  },
  sent: {
    status: "sent",
    label: "Відправлено",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
    icon: Send,
    isTerminal: false,
  },
  confirmed: {
    status: "confirmed",
    label: "Підтверджено",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: FileCheck2,
    isTerminal: false,
  },
  paid: {
    status: "paid",
    label: "Оплачено",
    color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    icon: FileCheck2,
    isTerminal: false,
  },
  "partially-paid": {
    status: "partially-paid",
    label: "Частково оплачено",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
    icon: FileClock,
    isTerminal: false,
  },
  registered: {
    status: "registered",
    label: "Зареєстровано",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
    icon: Stamp,
    isTerminal: false,
  },
  archived: {
    status: "archived",
    label: "В архіві",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400",
    icon: FileArchive,
    isTerminal: true,
  },
  cancelled: {
    status: "cancelled",
    label: "Скасовано",
    color: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    icon: FileX,
    isTerminal: true,
  },
  "needs-clarification": {
    status: "needs-clarification",
    label: "Потребує уточнення",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: FileClock,
    isTerminal: false,
  },
  "in-review": {
    status: "in-review",
    label: "На узгодженні",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    icon: FileText,
    isTerminal: false,
  },
  disputed: {
    status: "disputed",
    label: "Спір",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    icon: FileX,
    isTerminal: false,
  },
  "discrepancy-pending": {
    status: "discrepancy-pending",
    label: "Акт розбіжностей",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
    icon: FileX,
    isTerminal: false,
  },
};

// ============================================
// ДЕМО-ДАНІ ДЛЯ ФОП
// ============================================

export const fopDemoDocuments: Document[] = [
  // ============================================
  // ДОКУМЕНТ: Очікує реєстрації контрагента
  // ============================================
  {
    id: "doc-fop-pending-001",
    number: "РАХ-2025-001",
    type: "invoice",
    category: "primary",
    title: "Рахунок на розробку сайту для ТОВ «ВебСтарт»",
    subject: "Розробка корпоративного веб-сайту",
    date: getDateInPast(2),
    dueDate: getDateFromNow(14),
    amount: 35000,
    currency: "UAH",
    
    source: "upload",
    
    parties: [
      {
        id: "party-fop-owner",
        role: "our-side",
        semanticRole: "Виконавець",
        name: "ФОП Іваненко І.І.",
        code: "1234567890",
        isCabinetOwner: true,
        isVerified: true,
      },
      {
        id: "party-pending-001",
        role: "counterparty",
        semanticRole: "Замовник",
        name: "ТОВ «ВебСтарт»",
        code: "",
        isCabinetOwner: false,
        isVerified: false,
      },
    ],
    
    contractor: {
      id: "c-pending-001",
      name: "ТОВ «ВебСтарт»",
      code: "",
      verified: false,
      validationStatus: "pending",
    },
    
    status: "draft-pending-contractor",
    
    pendingContractorId: "pending-c-webstart",
    pendingContractorInviteId: "invite-webstart-001",
    pendingContractorEmail: "info@webstart.ua",
    
    signatureStatus: "pending-our",
    accountingStatus: "pending",
    taxStatus: "pending",
    hasAccountingImpact: true,
    affectsFopLimit: true,
    
    aiSummary: "Рахунок на розробку корпоративного веб-сайту для нового клієнта ТОВ «ВебСтарт». Документ очікує реєстрації контрагента для автоматичного заповнення реквізитів (ЄДРПОУ, IBAN, адреса).",
    aiRisks: [
      {
        id: "r-pending-001",
        category: "counterparty",
        title: "Очікує реєстрації контрагента",
        description: "Документ не може бути підписаний та відправлений, поки контрагент не завершить реєстрацію та не надасть свої реквізити.",
        severity: "medium",
        sourceSection: "Статус",
      },
    ],
    
    issueTypes: ["missing-contractor"],
    
    retentionPeriod: 3,
    createdAt: getDateInPast(2) + "T10:30:00Z",
    createdBy: "owner",
    updatedAt: getDateInPast(2) + "T10:30:00Z",
    
    history: [
      { id: "h-pending-1", timestamp: getDateInPast(2) + "T10:30:00Z", action: "created", actor: "Іваненко І.І." },
      { id: "h-pending-2", timestamp: getDateInPast(2) + "T10:35:00Z", action: "sent", actor: "Система", comment: "Запрошення надіслано на info@webstart.ua" },
    ],
    
    tags: ["Новий клієнт", "Веб-розробка"],
  },
  
  // ============================================
  // ДОКУМЕНТ: Автозаповнено після онбордингу контрагента
  // ============================================
  {
    id: "doc-fop-filled-001",
    number: "РАХ-2025-002",
    type: "invoice",
    category: "primary",
    title: "Рахунок на SEO-послуги для ТОВ «ДіджиталМедіа»",
    subject: "SEO-просування та оптимізація",
    date: getDateInPast(1),
    dueDate: getDateFromNow(14),
    amount: 28000,
    currency: "UAH",
    
    source: "upload",
    
    parties: [
      {
        id: "party-fop-owner",
        role: "our-side",
        semanticRole: "Виконавець",
        name: "ФОП Іваненко І.І.",
        code: "1234567890",
        isCabinetOwner: true,
        isVerified: true,
      },
      {
        id: "party-filled-001",
        role: "counterparty",
        semanticRole: "Замовник",
        name: "ТОВ «ДіджиталМедіа»",
        code: "43876521",
        iban: "UA213223130000026007299887766",
        isCabinetOwner: false,
        isVerified: true,
      },
    ],
    
    contractor: {
      id: "c-filled-001",
      name: "ТОВ «ДіджиталМедіа»",
      code: "43876521",
      iban: "UA213223130000026007299887766",
      verified: true,
      validationStatus: "valid",
    },
    
    status: "draft",
    
    signatureStatus: "pending-our",
    accountingStatus: "pending",
    taxStatus: "pending",
    hasAccountingImpact: true,
    affectsFopLimit: true,
    
    aiSummary: "Рахунок на SEO-послуги для ТОВ «ДіджиталМедіа». Реквізити автоматично заповнені після реєстрації контрагента.",
    
    retentionPeriod: 3,
    createdAt: getDateInPast(3) + "T09:00:00Z",
    createdBy: "owner",
    updatedAt: getDateInPast(1) + "T15:30:00Z",
    
    history: [
      { id: "h-filled-1", timestamp: getDateInPast(3) + "T09:00:00Z", action: "created", actor: "Іваненко І.І." },
      { id: "h-filled-2", timestamp: getDateInPast(3) + "T09:05:00Z", action: "sent", actor: "Система", comment: "Запрошення надіслано на info@digitalmedia.ua" },
      { id: "h-filled-3", timestamp: getDateInPast(1) + "T15:30:00Z", action: "status-changed", actor: "Система", comment: "Реквізити автозаповнені після реєстрації контрагента" },
    ],
    
    tags: ["Автозаповнено", "Маркетинг"],
  },
  
  // ============================================
  // ЛАНЦЮЖОК A: IT-послуги (Договір → ДУ → Рахунок → Акт → Оплата)
  // ============================================
  // ============================================
  {
    id: "doc-fop-001",
    number: "РАХ-2024-042",
    type: "invoice",
    category: "primary",
    title: "Рахунок на послуги консалтингу",
    subject: "Консалтингові послуги з оптимізації бізнес-процесів",
    period: { from: "2024-12-01", to: "2024-12-31", label: "грудень 2024" },
    date: "2024-12-09",
    dueDate: "2024-12-19",
    amount: 15000,
    paidAmount: 15000,
    currency: "UAH",
    
    // NEW v2.0: Джерело
    source: "generated",
    sourceSystem: "1c",
    
    // NEW v2.0: Сторони
    parties: [
      {
        id: "party-fop-owner",
        role: "our-side",
        semanticRole: "Виконавець",
        name: "ФОП Коваленко О.М.",
        code: "3456789012",
        isCabinetOwner: true,
        isVerified: true,
      },
      {
        id: "party-c-001",
        role: "counterparty",
        semanticRole: "Замовник",
        name: "ТОВ «Діджитал Солюшнс»",
        code: "12345678",
        isCabinetOwner: false,
        isVerified: true,
        verificationSource: "edr",
        iban: "UA213223130000026007233566001",
      },
    ],
    
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      iban: "UA213223130000026007233566001",
      verified: true,
      validationStatus: "valid",
    },
    status: "paid",
    
    // NEW v2.0: Статуси
    signatureStatus: "not-required",
    accountingStatus: "processed",
    taxStatus: "included",
    hasAccountingImpact: true,
    affectsFopLimit: true,
    taxDeclarations: [
      { declarationId: "dec-q4-2024", declarationType: "ep", period: "Q4 2024" },
    ],
    
    // NEW v2.0: AI-резюме
    aiSummary: "Рахунок РАХ-2024-042 від 09.12.2024 з ТОВ «Діджитал Солюшнс». Консалтингові послуги з оптимізації бізнес-процесів за грудень 2024. 15 000 ₴. Оплачено повністю та враховано в Книзі доходів.",
    aiRisks: [
      {
        id: "r-fop-001-1",
        category: "financial",
        title: "Дохід враховано в ліміт",
        description: "Оплата 15 000 ₴ зарахована в Книгу доходів. Слідкуйте за наближенням до річного ліміту ФОП.",
        severity: "low",
        sourceSection: "Облік",
        suggestion: {
          text: "Перевірте загальну суму доходів за квартал. При наближенні до 80% ліміту — заплануйте оптимізацію.",
          targetSection: "Книга доходів",
          insertPosition: "append",
          confidence: 75,
        },
      },
    ],
    
    linkedPayments: [{ id: "rec-2024-038", amount: 15000, date: "2024-12-09", source: "Monobank" }],
    linkedDocuments: ["doc-fop-002", "doc-fop-025"],
    auditPackages: [{ auditId: "audit-2", addedAt: "2024-12-02", packageType: "response" }],
    files: [{ id: "f-001", name: "Рахунок_РАХ-2024-042.pdf", size: 125000, mimeType: "application/pdf", uploadedAt: "2024-12-09T10:00:00Z" }],
    retentionPeriod: 3,
    createdAt: "2024-12-09T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-09T14:30:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-09T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-09T10:30:00Z", action: "sent", actor: "Система" },
      { id: "h3", timestamp: "2024-12-09T14:00:00Z", action: "paid", actor: "Monobank", comment: "Надійшла оплата 15 000 ₴" },
    ],
  },
  {
    id: "doc-fop-002",
    number: "АКТ-2024-041",
    type: "act",
    category: "primary",
    title: "Акт виконаних робіт за грудень",
    subject: "Надання консалтингових послуг з оптимізації бізнес-процесів",
    period: { from: "2024-12-01", to: "2024-12-31", label: "грудень 2024" },
    date: "2024-12-09",
    amount: 15000,
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatureStatus: "fully-signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-09T15:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-001", "doc-fop-025"],
    auditPackages: [{ auditId: "audit-2", addedAt: "2024-12-02", packageType: "response" }],
    files: [{ id: "f-002", name: "Акт_АКТ-2024-041.pdf", size: 98000, mimeType: "application/pdf", uploadedAt: "2024-12-09T14:00:00Z" }],
    retentionPeriod: 3,
    createdAt: "2024-12-09T14:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-09T15:00:00Z",
    // AI Analysis
    aiSummary: "Акт АКТ-2024-041 від 09.12.2024 з ТОВ «Діджитал Солюшнс». Консалтингові послуги з оптимізації бізнес-процесів за грудень 2024. 15 000 ₴. Підписано обома сторонами — документ закрито.",
    aiRisks: [
      {
        id: "r-fop-002-1",
        category: "financial",
        title: "Акт закрито успішно",
        description: "Документ підписано та закрито. Дохід визнано для обліку.",
        severity: "low",
        sourceSection: "Статус",
        suggestion: {
          text: "Акт завершено. Перевірте, чи дохід відображено в Книзі доходів.",
          targetSection: "Облік",
          insertPosition: "append",
          confidence: 90,
        },
      },
    ],
    history: [
      { id: "h1", timestamp: "2024-12-09T14:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-09T15:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h3", timestamp: "2024-12-09T15:30:00Z", action: "sent", actor: "Vchasno EDI" },
    ],
  },
  {
    id: "doc-fop-003",
    number: "ЧЕК-20241209-001",
    type: "prro-receipt",
    category: "fiscal",
    title: "Чек ПРРО за готівку",
    subject: "Продаж товарів",
    date: "2024-12-09",
    amount: 2500,
    currency: "UAH",
    status: "signed",
    signatureStatus: "not-required",
    linkedPayments: [{ id: "rec-2024-039", amount: 2500, date: "2024-12-09", source: "ПРРО" }],
    prroFiscalNumber: "4521789632145",
    retentionPeriod: 3,
    createdAt: "2024-12-09T11:00:00Z",
    createdBy: "system",
    updatedAt: "2024-12-09T11:00:00Z",
    // AI Analysis
    aiSummary: "Фіскальний чек ЧЕК-20241209-001 від 09.12.2024. Продаж товарів за готівку на 2 500 ₴. Зареєстровано в ПРРО Checkbox (фіскальний номер: 4521789632145).",
    aiRisks: [
      {
        id: "r-fop-003-1",
        category: "financial",
        title: "Готівковий дохід зареєстровано",
        description: "Чек ПРРО автоматично зафіксовано в системі ДПС.",
        severity: "low",
        sourceSection: "Фіскалізація",
        suggestion: {
          text: "Готівкові операції автоматично потрапляють до звітності. Зберігайте копії чеків для аудиту.",
          targetSection: "Архів",
          insertPosition: "append",
          confidence: 92,
        },
      },
    ],
    history: [
      { id: "h-003-1", timestamp: "2024-12-09T11:00:00Z", action: "created", actor: "ПРРО Checkbox", comment: "Автоматично згенеровано касовим апаратом" },
      { id: "h-003-2", timestamp: "2024-12-09T11:00:01Z", action: "signed", actor: "ПРРО", newValue: "Фіскальний номер: 4521789632145" },
    ],
  },
  {
    id: "doc-fop-004",
    number: "РАХ-2024-045",
    type: "invoice",
    category: "primary",
    title: "Рахунок на дизайн логотипу",
    subject: "Розробка фірмового стилю та логотипу",
    date: "2024-12-09",
    dueDate: "2024-12-23",
    amount: 5000,
    currency: "UAH",
    contractor: {
      id: "c-005",
      name: "ФОП Мельник С.А.",
      code: "3456789012",
      validationStatus: "pending",
    },
    status: "sent",
    signatureStatus: "not-required",
    linkedDocuments: ["doc-fop-005"],
    retentionPeriod: 3,
    createdAt: "2024-12-09T16:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-09T16:30:00Z",
    // AI Analysis
    aiSummary: "Рахунок РАХ-2024-045 від 09.12.2024 для ФОП Мельник С.А. Розробка фірмового стилю та логотипу. 5 000 ₴. Надіслано на email, очікує оплати до 23.12.2024.",
    aiRisks: [
      {
        id: "r-fop-004-1",
        category: "legal",
        title: "Контрагент не верифікований",
        description: "ФОП Мельник С.А. має статус перевірки «pending». Рекомендовано перевірити в реєстрі.",
        severity: "medium",
        sourceSection: "Контрагент",
        suggestion: {
          text: "Перевірте ФОП Мельник С.А. в Єдиному реєстрі платників ЄП. Переконайтесь у правильності РНОКПП.",
          targetSection: "Реквізити",
          insertPosition: "append",
          confidence: 82,
        },
      },
    ],
    history: [
      { id: "h-004-1", timestamp: "2024-12-09T16:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-004-2", timestamp: "2024-12-09T16:15:00Z", action: "edited", actor: "Коваленко О.М.", comment: "Уточнено суму та реквізити" },
      { id: "h-004-3", timestamp: "2024-12-09T16:30:00Z", action: "sent", actor: "Email", newValue: "Відправлено на melnyk@email.com" },
    ],
  },
  {
    id: "doc-fop-005",
    number: "АКТ-2024-042",
    type: "act",
    category: "primary",
    title: "Акт надання маркетингових послуг",
    subject: "Розробка маркетингової стратегії та SMM-просування",
    period: { from: "2024-11-01", to: "2024-11-30", label: "листопад 2024" },
    date: "2024-12-09",
    amount: 12000,
    currency: "UAH",
    contractor: {
      id: "c-006",
      name: "ТОВ «Медіа Про»",
      code: "98765432",
      validationStatus: "pending",
    },
    linkedDocuments: ["doc-fop-004"],
    status: "pending-sign",
    currentApprover: "Власник",
    auditPackages: [{ auditId: "audit-2", addedAt: "2024-12-02", packageType: "response" }],
    retentionPeriod: 3,
    createdAt: "2024-12-09T17:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-09T17:00:00Z",
    aiSummary: "Акт АКТ-2024-042 від 09.12.2024 з ТОВ «Медіа Про». Маркетингові послуги за листопад 2024. 12 000 ₴. Очікує підпису.",
    aiRisks: [
      {
        id: "r-fop-005-1",
        category: "legal",
        title: "Очікує підпису контрагента",
        description: "Акт надіслано, але контрагент ще не підписав. Без підпису неможливо визнати дохід.",
        severity: "medium",
        sourceSection: "Статус",
        suggestion: {
          text: "Надішліть ввічливе нагадування контрагенту про необхідність підписання акту протягом 3 робочих днів.",
          targetSection: "Підпис",
          insertPosition: "append",
          confidence: 85,
        },
      },
    ],
    history: [
      { id: "h-005-1", timestamp: "2024-12-09T17:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-005-2", timestamp: "2024-12-09T17:10:00Z", action: "edited", actor: "Коваленко О.М.", comment: "Додано перелік послуг" },
      { id: "h-005-3", timestamp: "2024-12-09T17:20:00Z", action: "sent", actor: "Email", newValue: "Надіслано контрагенту для підпису" },
      { id: "h-005-4", timestamp: "2024-12-09T17:20:01Z", action: "status-changed", actor: "Система", previousValue: "sent", newValue: "Очікує підпису контрагента" },
    ],
  },
  {
    id: "doc-fop-006",
    number: "ЧЕК-20241209-002",
    type: "prro-receipt",
    category: "fiscal",
    title: "Чек ПРРО - продаж послуг",
    subject: "Надання послуг",
    date: "2024-12-09",
    amount: 3200,
    currency: "UAH",
    status: "signed",
    linkedPayments: [{ id: "rec-2024-040", amount: 3200, date: "2024-12-09", source: "ПРРО" }],
    prroFiscalNumber: "4521789632146",
    retentionPeriod: 3,
    createdAt: "2024-12-09T18:00:00Z",
    createdBy: "system",
    updatedAt: "2024-12-09T18:00:00Z",
    // AI Analysis
    aiSummary: "Фіскальний чек ЧЕК-20241209-002 від 09.12.2024. Надання послуг за готівку на 3 200 ₴. Зареєстровано в ПРРО Checkbox (фіскальний номер: 4521789632146).",
    aiRisks: [
      {
        id: "r-fop-006-1",
        category: "financial",
        title: "Фіскальний облік завершено",
        description: "Чек ПРРО успішно зареєстровано. Дохід автоматично враховано.",
        severity: "low",
        sourceSection: "Фіскалізація",
        suggestion: {
          text: "Дохід 3 200 ₴ автоматично враховано в електронному кабінеті платника. Зберігайте чек для архіву.",
          targetSection: "Облік",
          insertPosition: "append",
          confidence: 90,
        },
      },
    ],
    history: [
      { id: "h-006-1", timestamp: "2024-12-09T18:00:00Z", action: "created", actor: "ПРРО Checkbox", comment: "Автоматично згенеровано касовим апаратом" },
      { id: "h-006-2", timestamp: "2024-12-09T18:00:01Z", action: "signed", actor: "ПРРО", newValue: "Фіскальний номер: 4521789632146" },
    ],
  },

  // === Day 2: 2024-12-10 - 4 documents ===
  {
    id: "doc-fop-007",
    number: "РАХ-2024-046",
    type: "invoice",
    category: "primary",
    title: "Рахунок на IT-послуги",
    date: "2024-12-10",
    dueDate: "2024-12-24",
    amount: 8500,
    currency: "UAH",
    contractor: {
      id: "c-002",
      name: "ФОП Петренко І.В.",
      code: "1234567890",
    },
    status: "draft",
    linkedDocuments: ["doc-fop-009"], // Linked to Contract
    retentionPeriod: 3,
    createdAt: "2024-12-10T09:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-10T09:00:00Z",
    aiSummary: "Рахунок РАХ-2024-046 від 10.12.2024 для ФОП Петренко І.В. IT-послуги на 8 500 ₴. Чернетка — потребує доопрацювання.",
    aiRisks: [
      {
        id: "r-fop-007-1",
        category: "legal",
        title: "Документ у статусі чернетки",
        description: "Рахунок не відправлено контрагенту. Доповніть реквізити та надішліть.",
        severity: "low",
        sourceSection: "Статус",
        suggestion: {
          text: "Перевірте правильність реквізитів та суми. Після перевірки надішліть рахунок контрагенту.",
          targetSection: "Реквізити",
          insertPosition: "append",
          confidence: 78,
        },
      },
    ],
    history: [
      { id: "h-007-1", timestamp: "2024-12-10T09:00:00Z", action: "created", actor: "Коваленко О.М.", comment: "Створено на основі договору ДОГ-2024-015" },
    ],
  },
  {
    id: "doc-fop-008",
    number: "РАХ-2024-047",
    type: "invoice",
    category: "primary",
    title: "Рахунок на розробку сайту",
    date: "2024-12-10",
    dueDate: "2024-12-24",
    amount: 25000,
    currency: "UAH",
    contractor: {
      id: "c-003",
      name: "ТОВ «Веб-Студія»",
      code: "87654321",
    },
    status: "sent",
    linkedDocuments: ["doc-fop-009"], // Linked to Contract
    retentionPeriod: 3,
    createdAt: "2024-12-10T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-10T10:30:00Z",
    aiSummary: "Рахунок РАХ-2024-047 від 10.12.2024 з ТОВ «Веб-Студія». Розробка сайту на 25 000 ₴. Оплата до 24.12.2024.",
    aiRisks: [
      {
        id: "r-fop-008-1",
        category: "financial",
        title: "Контролюйте термін оплати",
        description: "Рахунок відправлено — відстежуйте надходження коштів до 24.12.2024.",
        severity: "low",
        sourceSection: "Умови оплати",
        suggestion: {
          text: "Якщо оплата не надійде до 24.12.2024, надішліть контрагенту нагадування.",
          targetSection: "Оплата",
          insertPosition: "append",
          confidence: 80,
        },
      },
    ],
    history: [
      { id: "h-008-1", timestamp: "2024-12-10T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-008-2", timestamp: "2024-12-10T10:20:00Z", action: "edited", actor: "Коваленко О.М.", comment: "Додано специфікацію робіт" },
      { id: "h-008-3", timestamp: "2024-12-10T10:30:00Z", action: "sent", actor: "Email", newValue: "Відправлено на info@webstudio.ua" },
    ],
  },
  {
    id: "doc-fop-009",
    number: "ДОГ-2024-015",
    type: "contract",
    category: "contract",
    title: "Договір про надання послуг",
    date: "2024-12-10",
    dueDate: "2025-12-10",
    amount: 120000,
    currency: "UAH",
    contractor: {
      id: "c-007",
      name: "ТОВ «Бізнес Партнер»",
      code: "11223344",
    },
    status: "pending-sign",
    currentApprover: "Власник",
    linkedDocuments: ["doc-fop-007", "doc-fop-008"], // Linked invoices
    files: [{ id: "f-009", name: "Договір_ДОГ-2024-015.pdf", size: 215000, mimeType: "application/pdf", uploadedAt: "2024-12-10T14:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-12-10T14:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-10T14:00:00Z",
    aiSummary: "Договір ДОГ-2024-015 від 10.12.2024 з ТОВ «Бізнес Партнер». Надання послуг на 120 000 ₴. Дійсний до 10.12.2025. Очікує підпису.",
    aiRisks: [
      {
        id: "r-fop-009-1",
        category: "legal",
        title: "Очікує підпису обох сторін",
        description: "Договір надіслано контрагенту, але ще не підписано. Без підпису договір не має юридичної сили.",
        severity: "medium",
        sourceSection: "Статус",
        suggestion: {
          text: "Зв'яжіться з контрагентом для прискорення підписання. Розгляньте можливість підписання через ЕДО.",
          targetSection: "Підпис",
          insertPosition: "append",
          confidence: 88,
        },
      },
    ],
    history: [
      { id: "h-009-1", timestamp: "2024-12-10T11:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-009-2", timestamp: "2024-12-10T11:30:00Z", action: "edited", actor: "Коваленко О.М.", comment: "Узгоджено умови оплати" },
      { id: "h-009-3", timestamp: "2024-12-10T12:00:00Z", action: "sent", actor: "Email", newValue: "Надіслано контрагенту на підпис" },
      { id: "h-009-4", timestamp: "2024-12-10T12:00:01Z", action: "status-changed", actor: "Система", previousValue: "sent", newValue: "Очікує підпису обох сторін" },
    ],
  },
  {
    id: "doc-fop-010",
    number: "ЧЕК-20241210-001",
    type: "prro-receipt",
    category: "fiscal",
    title: "Чек ПРРО термінал",
    date: "2024-12-10",
    amount: 1800,
    currency: "UAH",
    status: "signed",
    prroFiscalNumber: "4521789632147",
    retentionPeriod: 3,
    createdAt: "2024-12-10T15:00:00Z",
    createdBy: "system",
    updatedAt: "2024-12-10T15:00:00Z",
    // AI Analysis
    aiSummary: "Фіскальний чек ЧЕК-20241210-001 від 10.12.2024. Оплата через термінал на 1 800 ₴. Зареєстровано в ПРРО Checkbox (фіскальний номер: 4521789632147).",
    aiRisks: [
      {
        id: "r-fop-010-1",
        category: "financial",
        title: "Оплата терміналом зафіксована",
        description: "Безготівкова оплата через термінал успішно зареєстрована в ПРРО.",
        severity: "low",
        sourceSection: "Фіскалізація",
        suggestion: {
          text: "Термінальні оплати автоматично враховуються. Перевірте звіт еквайрингу для звірки.",
          targetSection: "Звірка",
          insertPosition: "append",
          confidence: 88,
        },
      },
    ],
    history: [
      { id: "h-010-1", timestamp: "2024-12-10T15:00:00Z", action: "created", actor: "ПРРО Checkbox" },
      { id: "h-010-2", timestamp: "2024-12-10T15:00:01Z", action: "signed", actor: "ПРРО", newValue: "Фіскальний номер: 4521789632147" },
    ],
  },

  // === Day 3: 2024-12-11 - 5 documents ===
  {
    id: "doc-fop-011",
    number: "НКЛ-2024-028",
    type: "waybill",
    category: "primary",
    title: "Накладна на товар",
    date: "2024-12-11",
    amount: 18000,
    currency: "UAH",
    contractor: {
      id: "c-008",
      name: "ТОВ «Постачальник»",
      code: "55667788",
    },
    status: "confirmed",
    linkedDocuments: ["doc-fop-012"], // Linked to Act
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-11T10:00:00Z", signatureType: "kep", isValid: true },
    ],
    retentionPeriod: 5,
    createdAt: "2024-12-11T09:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-11T11:00:00Z",
    aiSummary: "Накладна НКЛ-2024-028 від 11.12.2024 з ТОВ «Постачальник». Поставка товару на 18 000 ₴. Підтверджено отримувачем.",
    // Документ підтверджено — без ризиків
    history: [
      { id: "h-011-1", timestamp: "2024-12-11T09:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-011-2", timestamp: "2024-12-11T09:30:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h-011-3", timestamp: "2024-12-11T10:00:00Z", action: "sent", actor: "Email", newValue: "Відправлено перевізнику" },
      { id: "h-011-4", timestamp: "2024-12-11T16:00:00Z", action: "confirmed", actor: "Отримувач", comment: "Товар прийнято без зауважень" },
    ],
  },
  {
    id: "doc-fop-012",
    number: "АКТ-2024-043",
    type: "act",
    category: "primary",
    title: "Акт прийому-передачі обладнання",
    date: "2024-12-11",
    amount: 18000,
    currency: "UAH",
    contractor: {
      id: "c-008",
      name: "ТОВ «Постачальник»",
      code: "55667788",
    },
    status: "signed",
    linkedDocuments: ["doc-fop-011"], // Linked to Waybill
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-11T11:30:00Z", signatureType: "kep", isValid: true },
    ],
    auditPackages: [{ auditId: "audit-2", addedAt: "2024-12-02", packageType: "request" }], // Requested document
    retentionPeriod: 3,
    createdAt: "2024-12-11T11:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-11T11:30:00Z",
    aiSummary: "Акт АКТ-2024-043 від 11.12.2024 з ТОВ «Постачальник». Прийом-передача обладнання на 18 000 ₴. Підписано обома сторонами.",
    // Документ підписано — без ризиків
    history: [
      { id: "h-012-1", timestamp: "2024-12-11T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-012-2", timestamp: "2024-12-11T10:30:00Z", action: "edited", actor: "Коваленко О.М.", comment: "Перевірено суми" },
      { id: "h-012-3", timestamp: "2024-12-11T11:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h-012-4", timestamp: "2024-12-11T14:00:00Z", action: "signed", actor: "Контрагент (КЕП)", comment: "Підписано обома сторонами" },
    ],
  },
  {
    id: "doc-fop-013",
    number: "РАХ-2024-048",
    type: "invoice",
    category: "primary",
    title: "Рахунок за оренду офісу",
    date: "2024-12-11",
    dueDate: "2024-12-25",
    amount: 9500,
    currency: "UAH",
    contractor: {
      id: "c-009",
      name: "ТОВ «Нерухомість Плюс»",
      code: "99887766",
    },
    status: "sent",
    auditPackages: [{ auditId: "audit-2", addedAt: "2024-12-02", packageType: "request" }], // Requested document
    retentionPeriod: 3,
    createdAt: "2024-12-11T12:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-11T12:00:00Z",
    aiSummary: "Рахунок РАХ-2024-048 від 11.12.2024 з ТОВ «Нерухомість Плюс». Оренда офісу на 9 500 ₴. Оплата до 25.12.2024.",
    aiRisks: [
      {
        id: "r-fop-013-1",
        category: "financial",
        title: "Регулярний платіж — оренда",
        description: "Рахунок за оренду офісу. Контролюйте своєчасну оплату для уникнення штрафів.",
        severity: "low",
        sourceSection: "Призначення",
        suggestion: {
          text: "Налаштуйте автоматичне нагадування про оплату оренди до 25 числа кожного місяця.",
          targetSection: "Оплата",
          insertPosition: "append",
          confidence: 82,
        },
      },
    ],
    history: [
      { id: "h-013-1", timestamp: "2024-12-11T11:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-013-2", timestamp: "2024-12-11T11:30:00Z", action: "sent", actor: "Email", newValue: "Відправлено на orenda@nerukhomist.ua" },
    ],
  },
  {
    id: "doc-fop-014",
    number: "ДОГ-2024-016",
    type: "contract",
    category: "contract",
    title: "Додаткова угода до договору",
    date: "2024-12-11",
    dueDate: "2025-12-10",
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
    },
    status: "draft",
    retentionPeriod: 5,
    createdAt: "2024-12-11T14:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-11T14:00:00Z",
    aiSummary: "Чернетка додаткової угоди ДОГ-2024-016 від 11.12.2024 до договору з ТОВ «Діджитал Солюшнс». Потребує заповнення суми та предмета.",
    aiRisks: [
      {
        id: "r-fop-014-1",
        category: "legal",
        title: "Документ неповний",
        description: "Відсутні обов'язкові поля: сума та предмет договору.",
        severity: "high",
        sourceSection: "Загальні реквізити",
        suggestion: {
          text: "Вкажіть суму додаткової угоди та її предмет (що саме змінюється в основному договорі).",
          targetSection: "Реквізити",
          insertPosition: "append",
          confidence: 95,
        },
      },
    ],
    history: [
      { id: "h-014-1", timestamp: "2024-12-11T14:00:00Z", action: "created", actor: "Коваленко О.М.", comment: "Чернетка додаткової угоди до договору" },
    ],
  },
  {
    id: "doc-fop-015",
    number: "ЧЕК-20241211-001",
    type: "prro-receipt",
    category: "fiscal",
    title: "Чек ПРРО - послуги",
    date: "2024-12-11",
    amount: 4500,
    currency: "UAH",
    status: "signed",
    prroFiscalNumber: "4521789632148",
    retentionPeriod: 3,
    createdAt: "2024-12-11T16:00:00Z",
    createdBy: "system",
    updatedAt: "2024-12-11T16:00:00Z",
    history: [
      { id: "h-015-1", timestamp: "2024-12-11T16:00:00Z", action: "created", actor: "ПРРО Checkbox" },
      { id: "h-015-2", timestamp: "2024-12-11T16:00:01Z", action: "signed", actor: "ПРРО", newValue: "Фіскальний номер: 4521789632148" },
    ],
  },

  // === Day 4: 2024-12-08 - 3 documents ===
  {
    id: "doc-fop-016",
    number: "РАХ-2024-041",
    type: "invoice",
    category: "primary",
    title: "Рахунок за аудит",
    date: "2024-12-08",
    dueDate: "2024-12-15",
    amount: 7500,
    paidAmount: 7500,
    currency: "UAH",
    contractor: {
      id: "c-010",
      name: "ТОВ «Аудит Груп»",
      code: "33445566",
    },
    status: "paid",
    linkedPayments: [{ id: "rec-2024-010", amount: 7500, date: "2024-12-12", source: "Приват24" }],
    retentionPeriod: 3,
    createdAt: "2024-12-08T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-12T09:00:00Z",
    aiSummary: "Рахунок РАХ-2024-041 від 08.12.2024 з ТОВ «Аудит Груп». Аудиторські послуги на 7 500 ₴. Оплачено повністю.",
    // Рахунок оплачено — без ризиків
    history: [
      { id: "h-016-1", timestamp: "2024-12-08T09:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-016-2", timestamp: "2024-12-08T09:30:00Z", action: "sent", actor: "Email", newValue: "Відправлено контрагенту" },
      { id: "h-016-3", timestamp: "2024-12-08T14:00:00Z", action: "confirmed", actor: "Контрагент", comment: "Рахунок прийнято до оплати" },
      { id: "h-016-4", timestamp: "2024-12-09T10:00:00Z", action: "paid", actor: "Приват24", newValue: "Надійшла оплата 7 500 грн" },
    ],
  },
  {
    id: "doc-fop-017",
    number: "ЧЕК-20241208-001",
    type: "prro-receipt",
    category: "fiscal",
    title: "Чек ПРРО готівкова оплата",
    date: "2024-12-08",
    amount: 1200,
    currency: "UAH",
    status: "signed",
    prroFiscalNumber: "4521789632144",
    retentionPeriod: 3,
    createdAt: "2024-12-08T14:00:00Z",
    createdBy: "system",
    updatedAt: "2024-12-08T14:00:00Z",
    history: [
      { id: "h-017-1", timestamp: "2024-12-08T14:00:00Z", action: "created", actor: "ПРРО Checkbox" },
      { id: "h-017-2", timestamp: "2024-12-08T14:00:01Z", action: "signed", actor: "ПРРО", newValue: "Фіскальний номер: 4521789632144" },
    ],
  },
  {
    id: "doc-fop-018",
    number: "АКТ-2024-040",
    type: "act",
    category: "primary",
    title: "Акт звірки розрахунків Q4",
    date: "2024-12-08",
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
    },
    status: "confirmed",
    linkedDocuments: ["doc-fop-001", "doc-fop-002"], // Linked to reconciled documents
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-08T16:00:00Z", signatureType: "kep", isValid: true },
      { id: "s2", signedBy: "Представник контрагента", signedAt: "2024-12-08T17:00:00Z", signatureType: "kep", isValid: true },
    ],
    retentionPeriod: 3,
    createdAt: "2024-12-08T15:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-08T17:00:00Z",
    aiSummary: "Акт звірки АКТ-2024-040 за Q4 2024 з ТОВ «Діджитал Солюшнс». Сальдо підтверджено обома сторонами.",
    // Акт підтверджено — без ризиків
    history: [
      { id: "h-018-1", timestamp: "2024-12-08T11:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-018-2", timestamp: "2024-12-08T11:30:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h-018-3", timestamp: "2024-12-08T12:00:00Z", action: "sent", actor: "Email", newValue: "Надіслано контрагенту" },
      { id: "h-018-4", timestamp: "2024-12-08T16:00:00Z", action: "signed", actor: "Контрагент (КЕП)" },
      { id: "h-018-5", timestamp: "2024-12-08T16:00:01Z", action: "confirmed", actor: "Система", comment: "Акт підтверджено обома сторонами" },
    ],
  },

  // === Day 5: 2024-12-05 - 2 documents (older) ===
  {
    id: "doc-fop-019",
    number: "ДОГ-2024-012",
    type: "contract",
    category: "contract",
    title: "Договір поставки товарів",
    date: "2024-12-05",
    dueDate: "2025-06-05",
    currency: "UAH",
    contractor: {
      id: "c-011",
      name: "ТОВ «Оптова База»",
      code: "44556677",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-05T12:00:00Z", signatureType: "kep", isValid: true },
    ],
    retentionPeriod: 5,
    createdAt: "2024-12-05T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-05T12:00:00Z",
    aiSummary: "Договір поставки ДОГ-2024-012 від 05.12.2024 з ТОВ «Оптова База». Поставка товарів. Дійсний до 05.06.2025.",
    aiRisks: [
      {
        id: "r-fop-019-1",
        category: "financial",
        title: "Відсутня сума договору",
        description: "У договорі не вказано загальну суму або ліміт поставок.",
        severity: "medium",
        sourceSection: "п. 3.1 «Вартість»",
        suggestion: {
          text: "Рекомендую додати до договору максимальну суму поставок або щомісячний ліміт для контролю витрат.",
          targetSection: "Вартість",
          insertPosition: "append",
          confidence: 80,
        },
      },
    ],
    history: [
      { id: "h-019-1", timestamp: "2024-12-05T09:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h-019-2", timestamp: "2024-12-05T10:00:00Z", action: "edited", actor: "Коваленко О.М.", comment: "Узгоджено з юристом" },
      { id: "h-019-3", timestamp: "2024-12-05T11:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h-019-4", timestamp: "2024-12-05T14:00:00Z", action: "signed", actor: "Контрагент (КЕП)", comment: "Договір набув чинності" },
    ],
  },
  {
    id: "doc-fop-020",
    number: "РАХ-2024-039",
    type: "invoice",
    category: "primary",
    title: "Рахунок на передплату",
    subject: "Передплата за поставку товарів",
    date: "2024-12-05",
    dueDate: "2024-12-12",
    amount: 35000,
    paidAmount: 17500,
    currency: "UAH",
    contractor: {
      id: "c-011",
      name: "ТОВ «Оптова База»",
      code: "44556677",
    },
    status: "partially-paid",
    linkedPayments: [{ id: "rec-2024-011", amount: 17500, date: "2024-12-06", source: "Monobank" }],
    linkedDocuments: ["doc-fop-019"],
    retentionPeriod: 3,
    createdAt: "2024-12-05T11:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-06T10:00:00Z",
    aiSummary: "Рахунок РАХ-2024-039 від 05.12.2024 з ТОВ «Оптова База». Передплата 35 000 ₴. Частково оплачено: 17 500 ₴.",
    aiRisks: [
      {
        id: "r-fop-020-1",
        category: "financial",
        title: "Залишок оплати",
        description: "Рахунок частково оплачений. Залишок 17 500 ₴ потребує контролю.",
        severity: "medium",
        sourceSection: "Оплата",
        suggestion: {
          text: "Контролюйте надходження залишку 17 500 ₴. Термін оплати минув — зверніться до контрагента для уточнення.",
          targetSection: "Оплата",
          insertPosition: "append",
          confidence: 88,
        },
      },
    ],
    history: [
      { id: "h1", timestamp: "2024-12-05T11:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-05T11:30:00Z", action: "sent", actor: "Email" },
      { id: "h3", timestamp: "2024-12-06T10:00:00Z", action: "paid", actor: "Monobank", comment: "Часткова оплата 17 500 ₴" },
    ],
  },

  // ============================================
  // ЛАНЦЮЖОК B: Договір IT-послуг (головний документ ланцюжка A)
  // ============================================
  {
    id: "doc-fop-025",
    number: "ДОГ-2024-025",
    type: "contract",
    subtype: "service",  // NEW v2.0
    category: "contract",
    title: "Договір на IT-послуги",
    subject: "Технічна підтримка та супровід веб-додатку",
    period: { from: "2024-01-01", to: "2025-12-31", label: "2024-2025 роки" },
    date: "2024-01-15",
    dueDate: "2025-12-31",
    amount: 180000,
    currency: "UAH",
    
    // NEW v2.0: Джерело
    source: "upload",
    
    // NEW v2.0: Сторони
    parties: [
      {
        id: "party-fop-owner",
        role: "our-side",
        semanticRole: "Замовник",
        name: "ФОП Коваленко О.М.",
        code: "3456789012",
        isCabinetOwner: true,
        isVerified: true,
      },
      {
        id: "party-c-001",
        role: "counterparty",
        semanticRole: "Виконавець",
        name: "ТОВ «Діджитал Солюшнс»",
        code: "12345678",
        isCabinetOwner: false,
        isVerified: true,
        verificationSource: "edr",
        iban: "UA213223130000026007233566001",
      },
    ],
    
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      iban: "UA213223130000026007233566001",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    
    // NEW v2.0: Статуси
    signatureStatus: "fully-signed",
    accountingStatus: "not-applicable",
    taxStatus: "not-applicable",
    hasAccountingImpact: true,
    affectsFopLimit: true,
    
    // NEW v2.0: AI-резюме та ризики
    aiSummary: "Договір на IT-підтримку. Щомісячна оплата 15 000 ₴. Автопролонгація. Термін дії до 31.12.2025.",
    aiRisks: [
      {
        id: "risk-1",
        category: "financial",
        severity: "medium",
        title: "Підвищена ставка за прострочення",
        description: "Штраф 0.1% за день може накопичитись до значних сум при затримці оплати понад 90 днів",
        sourceSection: "Розділ «Штрафні санкції» п. 6.2",
        potentialImpact: 16200,
        isConfirmed: false,
        suggestion: {
          text: "Пеня за прострочення оплати становить 0.05% (нуль цілих п'ять сотих відсотка) від суми заборгованості за кожен день прострочення, але не більше 5% від суми боргу.",
          targetSection: "п. 6.2",
          insertPosition: "replace",
          confidence: 88,
        },
      },
      {
        id: "risk-2",
        category: "legal",
        severity: "low",
        title: "Автопролонгація без повідомлення",
        description: "Договір автоматично продовжується, якщо жодна сторона не повідомить про розірвання за 30 днів",
        sourceSection: "Розділ «Строк дії» п. 8.1",
        isConfirmed: true,
        suggestion: {
          text: "Про намір не продовжувати Договір Сторона повідомляє іншу Сторону письмово не пізніше ніж за 60 (шістдесят) календарних днів до закінчення терміну дії.",
          targetSection: "п. 8.1",
          insertPosition: "replace",
          confidence: 82,
        },
      },
    ],
    
    // NEW v2.0: Таски
    tasks: [
      {
        id: "task-1",
        title: "Надіслати акт за грудень",
        priority: "medium",
        status: "completed",
        workflowPhase: "after-sign",
        completedAt: "2024-12-09T15:00:00Z",
        completedBy: "Коваленко О.М.",
      },
    ],
    
    // NEW: bodyHtml для режиму розбіжностей
    bodyHtml: `
      <div style="font-family: 'Times New Roman', serif; padding: 20px; max-width: 800px; line-height: 1.6;">
        <h2 style="text-align: center; margin-bottom: 5px;">ДОГОВІР № ДОГ-2024-025</h2>
        <p style="text-align: center; margin-top: 0; color: #666;">про надання IT-послуг</p>
        
        <p style="margin-top: 20px;"><strong>м. Київ</strong> <span style="float: right;">15 січня 2024 р.</span></p>
        <div style="clear: both;"></div>
        
        <p style="text-align: justify; margin-top: 20px;">
          <strong>ТОВ «Діджитал Солюшнс»</strong>, код ЄДРПОУ 12345678, в особі директора Петренка І.С., що діє на підставі Статуту 
          (надалі — <strong>Виконавець</strong>), з однієї сторони, та<br/>
          <strong>ФОП Коваленко Олександр Миколайович</strong>, РНОКПП 3456789012, що діє на підставі Виписки з ЄДР 
          (надалі — <strong>Замовник</strong>), з іншої сторони,<br/>
          (разом — <strong>Сторони</strong>, а кожна окремо — <strong>Сторона</strong>),<br/>
          уклали цей Договір про нижченаведене:
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. ПРЕДМЕТ ДОГОВОРУ</h3>
        <p style="text-align: justify;">
          1.1. Виконавець зобов'язується надавати послуги технічної підтримки та супроводу веб-додатку Замовника, 
          а Замовник зобов'язується приймати та оплачувати ці послуги на умовах цього Договору.
        </p>
        <p style="text-align: justify;">
          1.2. Перелік послуг, що надаються за цим Договором:
        </p>
        <ul>
          <li>Технічна підтримка веб-додатку (виправлення помилок, оновлення)</li>
          <li>Моніторинг працездатності сервісу 24/7</li>
          <li>Резервне копіювання даних</li>
          <li>Консультації з технічних питань</li>
        </ul>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">2. ВАРТІСТЬ ПОСЛУГ ТА ПОРЯДОК РОЗРАХУНКІВ</h3>
        <p style="text-align: justify;">
          2.1. Щомісячна вартість послуг становить <strong>15 000,00 грн</strong> (п'ятнадцять тисяч гривень 00 копійок), 
          без ПДВ (Виконавець — платник єдиного податку).
        </p>
        <p style="text-align: justify;">
          2.2. Оплата здійснюється Замовником щомісячно на підставі виставленого Виконавцем рахунку, 
          протягом 5 (п'яти) банківських днів з дати отримання рахунку.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">3. ПРАВА ТА ОБОВ'ЯЗКИ СТОРІН</h3>
        <p style="text-align: justify;">
          3.1. Виконавець зобов'язується:
        </p>
        <ul>
          <li>Надавати послуги якісно та вчасно</li>
          <li>Інформувати Замовника про хід виконання робіт</li>
          <li>Забезпечувати конфіденційність інформації</li>
        </ul>
        <p style="text-align: justify;">
          3.2. Замовник зобов'язується:
        </p>
        <ul>
          <li>Своєчасно оплачувати послуги</li>
          <li>Надавати необхідну інформацію та доступи</li>
          <li>Підписувати акти наданих послуг протягом 5 робочих днів</li>
        </ul>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">6. ШТРАФНІ САНКЦІЇ</h3>
        <p style="text-align: justify;">
          6.1. За порушення термінів надання послуг Виконавець сплачує пеню в розмірі 0.05% від вартості 
          невчасно наданих послуг за кожен день прострочення.
        </p>
        <p style="text-align: justify; background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">
          <strong>6.2. За прострочення оплати Замовник сплачує пеню в розмірі 0.1% від суми заборгованості 
          за кожен день прострочення.</strong>
        </p>
        <p style="text-align: justify;">
          6.3. Сплата штрафних санкцій не звільняє Сторони від виконання своїх зобов'язань за Договором.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">7. ФОРС-МАЖОР</h3>
        <p style="text-align: justify;">
          7.1. Сторони звільняються від відповідальності за невиконання або неналежне виконання зобов'язань 
          за цим Договором у разі виникнення обставин непереборної сили.
        </p>
        <p style="text-align: justify;">
          7.2. До обставин непереборної сили належать: війна, воєнні дії, стихійні лиха, пандемії, 
          дії органів влади, що унеможливлюють виконання Договору.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">8. СТРОК ДІЇ ДОГОВОРУ</h3>
        <p style="text-align: justify; background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">
          <strong>8.1. Договір автоматично пролонгується на наступний календарний рік, якщо жодна зі сторін 
          не повідомить про намір розірвати договір за 30 днів до закінчення.</strong>
        </p>
        <p style="text-align: justify;">
          8.2. Договір набуває чинності з моменту його підписання Сторонами та діє до 31 грудня 2025 року.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">9. ІНШІ УМОВИ</h3>
        <p style="text-align: justify;">
          9.1. Усі зміни та доповнення до цього Договору дійсні, якщо вони вчинені у письмовій формі 
          та підписані уповноваженими представниками Сторін.
        </p>
        <p style="text-align: justify;">
          9.2. Договір укладено у двох примірниках українською мовою, по одному для кожної Сторони.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">10. РЕКВІЗИТИ ТА ПІДПИСИ СТОРІН</h3>
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <div style="width: 45%;">
            <p><strong>ВИКОНАВЕЦЬ:</strong></p>
            <p>ТОВ «Діджитал Солюшнс»</p>
            <p>Код ЄДРПОУ: 12345678</p>
            <p>IBAN: UA213223130000026007233566001</p>
            <p style="margin-top: 30px;">Директор ______________ Петренко І.С.</p>
          </div>
          <div style="width: 45%;">
            <p><strong>ЗАМОВНИК:</strong></p>
            <p>ФОП Коваленко О.М.</p>
            <p>РНОКПП: 3456789012</p>
            <p>IBAN: UA123456789012345678901234567</p>
            <p style="margin-top: 30px;">______________ Коваленко О.М.</p>
          </div>
        </div>
      </div>
    `,
    
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-01-15T14:00:00Z", signatureType: "kep", isValid: true },
      { id: "s2", signedBy: "Директор ТОВ", signedAt: "2024-01-15T15:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-001", "doc-fop-002", "doc-fop-025-a1", "doc-fop-025-a2", "doc-fop-025-du1"],
    files: [{ id: "f-025", name: "Договір_ДОГ-2024-025.pdf", size: 245000, mimeType: "application/pdf", uploadedAt: "2024-01-15T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-01-15T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-01-15T15:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-01-15T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-01-15T12:00:00Z", action: "sent", actor: "Email" },
      { id: "h3", timestamp: "2024-01-15T14:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h4", timestamp: "2024-01-15T15:00:00Z", action: "signed", actor: "Директор ТОВ (КЕП)", comment: "Підписано контрагентом" },
    ],
  },

  // ============================================
  // ЛАНЦЮЖОК C: Оренда офісу (Договір → Рахунок → Оплата)
  // ============================================
  {
    id: "doc-fop-026",
    number: "ДОГ-ОР-2024-001",
    type: "rental-agreement",
    category: "contract",
    title: "Договір оренди офісу",
    subject: "Оренда офісного приміщення площею 50 м²",
    period: { from: "2024-01-01", to: "2025-12-31", label: "2024-2025 роки" },
    date: "2023-12-20",
    dueDate: "2025-12-31",
    amount: 114000,
    currency: "UAH",
    contractor: {
      id: "c-009",
      name: "ТОВ «Нерухомість Плюс»",
      code: "99887766",
      iban: "UA123456789012345678901234567",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2023-12-20T14:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-013", "doc-fop-026-a1", "doc-fop-026-du1"],
    files: [{ id: "f-026", name: "Договір_оренди_2024.pdf", size: 320000, mimeType: "application/pdf", uploadedAt: "2023-12-20T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2023-12-20T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2023-12-20T14:00:00Z",
    history: [
      { id: "h1", timestamp: "2023-12-20T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2023-12-20T14:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },

  // ============================================
  // ЛАНЦЮЖОК D: Поставка (Договір → ТТН → Акт)
  // ============================================
  {
    id: "doc-fop-027",
    number: "ДОГ-ПОС-2024-003",
    type: "supply-contract",
    category: "contract",
    title: "Договір поставки комп'ютерного обладнання",
    subject: "Поставка комп'ютерної техніки та комплектуючих",
    date: "2024-11-15",
    dueDate: "2025-11-15",
    amount: 250000,
    currency: "UAH",
    contractor: {
      id: "c-008",
      name: "ТОВ «Постачальник»",
      code: "55667788",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    
    // NEW v2.0: AI-резюме та ризики
    aiSummary: "Договір поставки комп'ютерного обладнання на 250 000 ₴. Гарантія 12 міс. Штраф 1%/день за прострочення поставки.",
    aiRisks: [
      {
        id: "risk-supply-1",
        category: "financial",
        severity: "high",
        title: "Високий штраф за прострочення поставки",
        description: "Штраф 1% за день може досягти 20% вартості при затримці 20 днів — це 50 000 ₴ втрат",
        sourceSection: "Розділ «Відповідальність» п. 5.3",
        potentialImpact: 50000,
        isConfirmed: false,
        suggestion: {
          text: "За прострочення поставки Товару Постачальник сплачує пеню у розмірі 0.1% (нуль цілих одна десята відсотка) від вартості непоставленого Товару за кожен день прострочення, але не більше 10% від вартості такого Товару.",
          targetSection: "п. 5.3",
          insertPosition: "replace",
          confidence: 91,
        },
      },
      {
        id: "risk-supply-2",
        category: "legal",
        severity: "medium",
        title: "Короткий термін для рекламацій",
        description: "5 робочих днів недостатньо для ретельної перевірки комп'ютерного обладнання",
        sourceSection: "Розділ «Рекламації» п. 7.2",
        isConfirmed: false,
        suggestion: {
          text: "Покупець має право на пред'явлення рекламацій щодо якості та комплектності Товару протягом 14 (чотирнадцяти) робочих днів з моменту отримання Товару.",
          targetSection: "п. 7.2",
          insertPosition: "replace",
          confidence: 85,
        },
      },
    ],
    
    // NEW: bodyHtml для режиму розбіжностей
    bodyHtml: `
      <div style="font-family: 'Times New Roman', serif; padding: 20px; max-width: 800px; line-height: 1.6;">
        <h2 style="text-align: center; margin-bottom: 5px;">ДОГОВІР № ДОГ-ПОС-2024-003</h2>
        <p style="text-align: center; margin-top: 0; color: #666;">поставки комп'ютерного обладнання</p>
        
        <p style="margin-top: 20px;"><strong>м. Київ</strong> <span style="float: right;">15 листопада 2024 р.</span></p>
        <div style="clear: both;"></div>
        
        <p style="text-align: justify; margin-top: 20px;">
          <strong>ТОВ «Постачальник»</strong>, код ЄДРПОУ 55667788, в особі директора Сидоренка В.П., що діє на підставі Статуту 
          (надалі — <strong>Постачальник</strong>), з однієї сторони, та<br/>
          <strong>ФОП Коваленко Олександр Миколайович</strong>, РНОКПП 3456789012, що діє на підставі Виписки з ЄДР 
          (надалі — <strong>Покупець</strong>), з іншої сторони,<br/>
          уклали цей Договір про нижченаведене:
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. ПРЕДМЕТ ДОГОВОРУ</h3>
        <p style="text-align: justify;">
          1.1. Постачальник зобов'язується поставити, а Покупець — прийняти та оплатити комп'ютерне обладнання 
          згідно зі Специфікацією (Додаток № 1), що є невід'ємною частиною цього Договору.
        </p>
        <p style="text-align: justify;">
          1.2. Загальна вартість Товару за цим Договором становить <strong>250 000,00 грн</strong> 
          (двісті п'ятдесят тисяч гривень 00 копійок), без ПДВ.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">2. УМОВИ ПОСТАВКИ</h3>
        <p style="text-align: justify;">
          2.1. Поставка Товару здійснюється протягом 14 (чотирнадцяти) календарних днів з моменту отримання 
          передоплати на розрахунковий рахунок Постачальника.
        </p>
        <p style="text-align: justify;">
          2.2. Доставка здійснюється силами та за рахунок Постачальника за адресою: м. Київ, вул. Хрещатик, 1.
        </p>
        <p style="text-align: justify;">
          2.3. Право власності на Товар переходить до Покупця з моменту підписання видаткової накладної.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">3. ЯКІСТЬ ТА ГАРАНТІЇ</h3>
        <p style="text-align: justify;">
          3.1. Якість Товару повинна відповідати технічним характеристикам, зазначеним у Специфікації, 
          та супроводжуватись документами виробника.
        </p>
        <p style="text-align: justify; background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">
          <strong>3.2. Гарантійний термін на поставлене обладнання становить 12 (дванадцять) місяців з дати поставки.</strong>
        </p>
        <p style="text-align: justify;">
          3.3. Гарантійний ремонт здійснюється в авторизованих сервісних центрах виробника.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">4. ПОРЯДОК РОЗРАХУНКІВ</h3>
        <p style="text-align: justify;">
          4.1. Оплата здійснюється в наступному порядку:
        </p>
        <ul>
          <li>Передоплата 50% — протягом 3 банківських днів з дати підписання Договору;</li>
          <li>Остаточний розрахунок 50% — протягом 5 банківських днів з дати поставки та підписання видаткової накладної.</li>
        </ul>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">5. ВІДПОВІДАЛЬНІСТЬ СТОРІН</h3>
        <p style="text-align: justify;">
          5.1. За порушення умов цього Договору Сторони несуть відповідальність згідно з чинним законодавством України.
        </p>
        <p style="text-align: justify;">
          5.2. За прострочення оплати Покупець сплачує пеню в розмірі 0.1% від суми заборгованості за кожен день прострочення.
        </p>
        <p style="text-align: justify; background-color: #f8d7da; padding: 10px; border-left: 4px solid #dc3545; margin: 15px 0;">
          <strong>5.3. За прострочення поставки Постачальник сплачує штраф у розмірі 1% від суми замовлення 
          за кожен день прострочення, але не більше 20% від загальної суми Договору.</strong>
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">6. ФОРС-МАЖОР</h3>
        <p style="text-align: justify;">
          6.1. Сторони звільняються від відповідальності за невиконання зобов'язань у разі виникнення 
          обставин непереборної сили, підтверджених відповідним документом ТПП України.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">7. РЕКЛАМАЦІЇ</h3>
        <p style="text-align: justify;">
          7.1. Приймання Товару за кількістю та якістю здійснюється відповідно до Інструкцій П-6 та П-7.
        </p>
        <p style="text-align: justify; background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">
          <strong>7.2. Претензії щодо якості Товару приймаються протягом 5 (п'яти) робочих днів з моменту поставки.</strong>
        </p>
        <p style="text-align: justify;">
          7.3. Претензія подається у письмовій формі з обов'язковим зазначенням виявлених недоліків.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">8. СТРОК ДІЇ ДОГОВОРУ</h3>
        <p style="text-align: justify;">
          8.1. Договір набуває чинності з моменту підписання та діє до повного виконання Сторонами своїх зобов'язань.
        </p>
        <p style="text-align: justify;">
          8.2. Договір може бути розірваний за взаємною згодою Сторін або в інших випадках, передбачених законодавством.
        </p>

        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">9. РЕКВІЗИТИ ТА ПІДПИСИ СТОРІН</h3>
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <div style="width: 45%;">
            <p><strong>ПОСТАЧАЛЬНИК:</strong></p>
            <p>ТОВ «Постачальник»</p>
            <p>Код ЄДРПОУ: 55667788</p>
            <p>IBAN: UA987654321098765432109876543</p>
            <p style="margin-top: 30px;">Директор ______________ Сидоренко В.П.</p>
          </div>
          <div style="width: 45%;">
            <p><strong>ПОКУПЕЦЬ:</strong></p>
            <p>ФОП Коваленко О.М.</p>
            <p>РНОКПП: 3456789012</p>
            <p>IBAN: UA123456789012345678901234567</p>
            <p style="margin-top: 30px;">______________ Коваленко О.М.</p>
          </div>
        </div>
      </div>
    `,
    
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-11-15T14:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-011", "doc-fop-012", "doc-fop-028", "doc-fop-027-a1", "doc-fop-027-discr"],
    files: [{ id: "f-027", name: "Договір_поставки_ДОГ-ПОС-2024-003.pdf", size: 180000, mimeType: "application/pdf", uploadedAt: "2024-11-15T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-11-15T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-11-15T14:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-11-15T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-11-15T14:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },
  {
    id: "doc-fop-028",
    number: "ТТН-2024-001",
    type: "ttn",
    category: "primary",
    title: "Товарно-транспортна накладна",
    subject: "Доставка комп'ютерного обладнання",
    date: "2024-12-10",
    amount: 85000,
    currency: "UAH",
    route: { from: "м. Київ, вул. Індустріальна, 5", to: "м. Київ, вул. Хрещатик, 1" },
    carrier: {
      name: "ТОВ «Швидка Доставка»",
      code: "44332211",
      phone: "+380 44 555-12-34",
    },
    vehicle: {
      number: "АА 1234 ВВ",
      type: "van",
    },
    driver: {
      name: "Петренко Іван Сергійович",
      license: "ВАА 123456",
    },
    contractor: {
      id: "c-008",
      name: "ТОВ «Постачальник»",
      code: "55667788",
    },
    status: "confirmed",
    signatures: [
      { id: "s1", signedBy: "Водій Петренко", signedAt: "2024-12-10T12:00:00Z", signatureType: "manual", isValid: true },
      { id: "s2", signedBy: "Коваленко О.М.", signedAt: "2024-12-10T14:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-027", "doc-fop-012"],
    files: [{ id: "f-028", name: "ТТН-2024-001.pdf", size: 95000, mimeType: "application/pdf", uploadedAt: "2024-12-10T12:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-12-10T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-10T14:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-10T10:00:00Z", action: "created", actor: "ТОВ «Постачальник»" },
      { id: "h2", timestamp: "2024-12-10T12:00:00Z", action: "sent", actor: "Водій Петренко" },
      { id: "h3", timestamp: "2024-12-10T14:00:00Z", action: "received", actor: "Коваленко О.М." },
    ],
  },

  // ============================================
  // ЛАНЦЮЖОК E: HR-документи
  // ============================================
  {
    id: "doc-fop-029",
    number: "НК-2024-001",
    type: "employment-order",
    category: "internal",
    title: "Наказ про прийняття на роботу",
    subject: "Прийняття на посаду менеджера з продажу",
    date: "2024-10-01",
    currency: "UAH",
    employee: {
      name: "Іваненко Марія Петрівна",
      position: "Менеджер з продажу",
      department: "Відділ продажів",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-10-01T09:00:00Z", signatureType: "kep", isValid: true },
    ],
    files: [{ id: "f-029", name: "Наказ_НК-2024-001.pdf", size: 75000, mimeType: "application/pdf", uploadedAt: "2024-10-01T08:00:00Z" }],
    retentionPeriod: 75,
    createdAt: "2024-10-01T08:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-10-01T09:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-10-01T08:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-10-01T09:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },
  {
    id: "doc-fop-030",
    number: "НК-2024-015",
    type: "vacation-order",
    category: "internal",
    title: "Наказ про відпустку",
    subject: "Надання щорічної основної відпустки",
    period: { from: "2024-12-23", to: "2025-01-05", label: "14 календарних днів" },
    date: "2024-12-15",
    currency: "UAH",
    employee: {
      name: "Іваненко Марія Петрівна",
      position: "Менеджер з продажу",
      department: "Відділ продажів",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-15T10:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-029"],
    files: [{ id: "f-030", name: "Наказ_НК-2024-015.pdf", size: 65000, mimeType: "application/pdf", uploadedAt: "2024-12-15T09:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-12-15T09:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-15T10:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-15T09:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-15T10:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },

  // ============================================
  // ЛАНЦЮЖОК F: Акт звірки + Довіреність
  // ============================================
  {
    id: "doc-fop-031",
    number: "АЗ-2024-Q4",
    type: "reconciliation",
    category: "primary",
    title: "Акт звірки взаєморозрахунків за Q4 2024",
    subject: "Звірка взаєморозрахунків за 4 квартал 2024 року",
    period: { from: "2024-10-01", to: "2024-12-31", label: "Q4 2024" },
    date: "2024-12-20",
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      verified: true,
      validationStatus: "valid",
    },
    reconciliationBalance: {
      amount: 0,
      inFavor: "us",
    },
    status: "confirmed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-20T14:00:00Z", signatureType: "kep", isValid: true },
      { id: "s2", signedBy: "Представник ТОВ", signedAt: "2024-12-21T10:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-001", "doc-fop-002", "doc-fop-025"],
    files: [{ id: "f-031", name: "Акт_звірки_Q4_2024.pdf", size: 120000, mimeType: "application/pdf", uploadedAt: "2024-12-20T12:00:00Z" }],
    retentionPeriod: 3,
    createdAt: "2024-12-20T12:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-21T10:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-20T12:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-20T14:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h3", timestamp: "2024-12-20T15:00:00Z", action: "sent", actor: "Vchasno EDI" },
      { id: "h4", timestamp: "2024-12-21T10:00:00Z", action: "signed", actor: "Представник ТОВ (КЕП)", comment: "Підтверджено контрагентом" },
    ],
  },
  {
    id: "doc-fop-032",
    number: "ДОВ-2024-005",
    type: "power-of-attorney",
    category: "internal",
    title: "Довіреність на отримання ТМЦ",
    subject: "Довіреність на отримання товарно-матеріальних цінностей",
    date: "2024-12-10",
    dueDate: "2025-12-31",
    currency: "UAH",
    employee: {
      name: "Іваненко Марія Петрівна",
      position: "Менеджер з продажу",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-10T09:00:00Z", signatureType: "kep", isValid: true },
    ],
    files: [{ id: "f-032", name: "Довіреність_ДОВ-2024-005.pdf", size: 55000, mimeType: "application/pdf", uploadedAt: "2024-12-10T08:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-12-10T08:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-10T09:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-10T08:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-10T09:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },

  // ============================================
  // ЛАНЦЮЖОК G: Банківська виписка + Звільнення + Податкова накладна
  // ============================================
  {
    id: "doc-fop-033",
    number: "ВИП-2024-012",
    type: "bank-statement",
    category: "bank",
    title: "Виписка ПриватБанк за грудень 2024",
    date: "2024-12-31",
    currency: "UAH",
    status: "signed",
    period: { from: "2024-12-01", to: "2024-12-31", label: "грудень 2024" },
    statementTotals: {
      income: 245000,
      expense: 187500,
      closingBalance: 157500,
    },
    retentionPeriod: 3,
    createdAt: "2024-12-31T23:59:00Z",
    createdBy: "system",
    updatedAt: "2024-12-31T23:59:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-31T23:59:00Z", action: "created", actor: "ПриватБанк API" },
    ],
  },
  {
    id: "doc-fop-034",
    number: "НК-2024-020",
    type: "dismissal-order",
    category: "internal",
    title: "Наказ про звільнення",
    subject: "Звільнення за власним бажанням",
    date: "2024-12-20",
    currency: "UAH",
    employee: {
      name: "Сидоренко Петро Іванович",
      position: "Торговий представник",
      department: "Відділ продажів",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-20T10:00:00Z", signatureType: "kep", isValid: true },
    ],
    files: [{ id: "f-034", name: "Наказ_НК-2024-020.pdf", size: 60000, mimeType: "application/pdf", uploadedAt: "2024-12-20T09:00:00Z" }],
    retentionPeriod: 75,
    createdAt: "2024-12-20T09:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-20T10:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-20T09:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-20T10:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },
  {
    id: "doc-fop-035",
    number: "ПН-2024-025",
    type: "tax-invoice",
    category: "primary",
    title: "Податкова накладна на послуги",
    subject: "Надання IT-послуг за договором",
    date: "2024-12-15",
    amount: 36000,
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      verified: true,
      validationStatus: "valid",
    },
    status: "registered",
    taxInvoiceNumber: "9000245678",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-12-15T12:00:00Z", signatureType: "qualified-kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-001", "doc-fop-025"],
    retentionPeriod: 7,
    createdAt: "2024-12-15T11:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-15T14:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-15T11:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-15T12:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h3", timestamp: "2024-12-15T14:00:00Z", action: "status-changed", actor: "ЄРПН", newValue: "Зареєстровано" },
    ],
  },

  // ============================================
  // ЛАНЦЮЖОК H: Додатки та Додаткові угоди для вкладки "Пакет"
  // ============================================
  
  // Додатки до договору IT-послуг (doc-fop-025)
  {
    id: "doc-fop-025-a1",
    number: "ДОГ-2024-025-Додаток-1",
    type: "contract",
    category: "contract",
    title: "Додаток №1. Специфікація послуг",
    subject: "Перелік та опис IT-послуг за договором ДОГ-2024-025",
    date: "2024-01-15",
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-01-15T14:30:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-025"],
    files: [{ id: "f-025-a1", name: "Додаток_1_Специфікація.pdf", size: 85000, mimeType: "application/pdf", uploadedAt: "2024-01-15T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-01-15T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-01-15T14:30:00Z",
    history: [
      { id: "h1", timestamp: "2024-01-15T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-01-15T14:30:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },
  {
    id: "doc-fop-025-a2",
    number: "ДОГ-2024-025-Додаток-2",
    type: "contract",
    category: "contract",
    title: "Додаток №2. Тарифи на послуги",
    subject: "Прайс-лист на IT-послуги з погодинними ставками",
    date: "2024-01-15",
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-01-15T14:45:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-025"],
    files: [{ id: "f-025-a2", name: "Додаток_2_Тарифи.pdf", size: 65000, mimeType: "application/pdf", uploadedAt: "2024-01-15T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-01-15T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-01-15T14:45:00Z",
    history: [
      { id: "h1", timestamp: "2024-01-15T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-01-15T14:45:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },
  {
    id: "doc-fop-025-du1",
    number: "ДОГ-2024-025-ДУ-1",
    type: "contract",
    category: "contract",
    title: "Додаткова угода №1 про зміну вартості",
    subject: "Збільшення вартості послуг з 180 000 до 210 000 грн на рік",
    date: "2024-06-01",
    amount: 210000,
    currency: "UAH",
    contractor: {
      id: "c-001",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "12345678",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-06-01T15:00:00Z", signatureType: "kep", isValid: true },
      { id: "s2", signedBy: "Директор ТОВ", signedAt: "2024-06-01T16:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-025"],
    files: [{ id: "f-025-du1", name: "Додаткова_угода_1.pdf", size: 45000, mimeType: "application/pdf", uploadedAt: "2024-06-01T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-06-01T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-06-01T16:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-06-01T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-06-01T15:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h3", timestamp: "2024-06-01T16:00:00Z", action: "signed", actor: "Директор ТОВ (КЕП)" },
    ],
  },

  // Додатки до договору оренди (doc-fop-026)
  {
    id: "doc-fop-026-a1",
    number: "ДОГ-ОР-2024-001-Додаток-1",
    type: "contract",
    category: "contract",
    title: "Додаток №1. План приміщення",
    subject: "Поверховий план та схема орендованого приміщення",
    date: "2023-12-20",
    currency: "UAH",
    contractor: {
      id: "c-009",
      name: "ТОВ «Нерухомість Плюс»",
      code: "99887766",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2023-12-20T14:15:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-026"],
    files: [{ id: "f-026-a1", name: "Додаток_1_План_приміщення.pdf", size: 1250000, mimeType: "application/pdf", uploadedAt: "2023-12-20T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2023-12-20T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2023-12-20T14:15:00Z",
    history: [
      { id: "h1", timestamp: "2023-12-20T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2023-12-20T14:15:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },
  {
    id: "doc-fop-026-du1",
    number: "ДОГ-ОР-2024-001-ДУ-1",
    type: "contract",
    category: "contract",
    title: "Додаткова угода №1 про індексацію орендної плати",
    subject: "Індексація орендної плати на 10% з 01.01.2025",
    date: "2024-11-01",
    amount: 125400,
    currency: "UAH",
    contractor: {
      id: "c-009",
      name: "ТОВ «Нерухомість Плюс»",
      code: "99887766",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-11-01T11:00:00Z", signatureType: "kep", isValid: true },
      { id: "s2", signedBy: "Представник орендодавця", signedAt: "2024-11-01T14:00:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-026"],
    files: [{ id: "f-026-du1", name: "Додаткова_угода_1_Індексація.pdf", size: 55000, mimeType: "application/pdf", uploadedAt: "2024-11-01T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-11-01T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-11-01T14:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-11-01T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-11-01T11:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h3", timestamp: "2024-11-01T14:00:00Z", action: "signed", actor: "Представник орендодавця (КЕП)" },
    ],
  },

  // Додатки до договору поставки (doc-fop-027)
  {
    id: "doc-fop-027-a1",
    number: "ДОГ-ПОС-2024-003-Додаток-1",
    type: "contract",
    category: "contract",
    title: "Додаток №1. Специфікація обладнання",
    subject: "Детальний перелік комп'ютерного обладнання для поставки",
    date: "2024-11-15",
    currency: "UAH",
    contractor: {
      id: "c-008",
      name: "ТОВ «Постачальник»",
      code: "55667788",
      verified: true,
      validationStatus: "valid",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Коваленко О.М.", signedAt: "2024-11-15T14:20:00Z", signatureType: "kep", isValid: true },
    ],
    linkedDocuments: ["doc-fop-027"],
    files: [{ id: "f-027-a1", name: "Додаток_1_Специфікація_обладнання.pdf", size: 125000, mimeType: "application/pdf", uploadedAt: "2024-11-15T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-11-15T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-11-15T14:20:00Z",
    history: [
      { id: "h1", timestamp: "2024-11-15T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-11-15T14:20:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
    ],
  },
  {
    id: "doc-fop-027-discr",
    number: "АР-2024-001",
    type: "reconciliation",
    category: "primary",
    title: "Акт розбіжностей при прийманні товару",
    subject: "Виявлено некомплект в партії обладнання (відсутні 2 блоки живлення)",
    date: "2024-12-11",
    currency: "UAH",
    contractor: {
      id: "c-008",
      name: "ТОВ «Постачальник»",
      code: "55667788",
      verified: true,
      validationStatus: "valid",
    },
    status: "confirmed",
    reconciliationBalance: {
      amount: 15000,
      inFavor: "us",
    },
    linkedDocuments: ["doc-fop-027", "doc-fop-028"],
    files: [{ id: "f-027-discr", name: "Акт_розбіжностей_АР-2024-001.pdf", size: 120000, mimeType: "application/pdf", uploadedAt: "2024-12-11T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2024-12-11T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-11T14:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-11T10:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h2", timestamp: "2024-12-11T11:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h3", timestamp: "2024-12-11T14:00:00Z", action: "confirmed", actor: "ТОВ «Постачальник»", comment: "Підтверджено, допоставка протягом 3 днів" },
    ],
  },

  // ============================================
  // ТРИСТОРОННІЙ ДОКУМЕНТ (N-party test)
  // ============================================
  {
    id: "doc-fop-030",
    type: "contract",
    category: "contract",
    title: "Тристоронній договір субпідряду на IT-послуги",
    number: "СП-2025-001",
    date: "2025-01-20",
    status: "pending-sign",
    signatureStatus: "partially-signed",
    cabinetName: "ФОП Коваленко О.М.",
    parties: [
      {
        id: "party-kovalenko",
        name: "ФОП Коваленко О.М.",
        code: "3456789012",
        role: "our-side" as PartyRole,
        semanticRole: "Виконавець",
        isCabinetOwner: true,
        isVerified: true,
      },
      {
        id: "party-digital",
        name: 'ТОВ "Діджитал Солюшнс"',
        code: "43218765",
        role: "counterparty" as PartyRole,
        semanticRole: "Замовник",
        isCabinetOwner: false,
        isVerified: true,
      },
      {
        id: "party-subtech",
        name: 'ТОВ "СубТех Груп"',
        code: "98761234",
        role: "third-party" as PartyRole,
        semanticRole: "Субпідрядник",
        isCabinetOwner: false,
        isVerified: false,
      },
    ],
    contractor: {
      id: "contr-digital",
      name: 'ТОВ "Діджитал Солюшнс"',
      code: "43218765",
      verified: true,
      validationStatus: "valid",
    },
    amount: 480000,
    currency: "UAH",
    subject: "Розробка програмного забезпечення — тристоронній субпідряд",
    aiSummary: "Тристоронній договір субпідряду: ФОП Коваленко виконує роль генпідрядника, залучаючи ТОВ «СубТех Груп» для частини робіт. Замовник — ТОВ «Діджитал Солюшнс». Сума 480 000 грн, термін — 6 місяців.",
    aiRisks: [
      {
        id: "risk-030-1",
        category: "legal",
        severity: "high",
        title: "Відсутній підпис субпідрядника",
        description: "ТОВ «СубТех Груп» ще не підписало договір. Без підпису третьої сторони договір не набирає повної юридичної сили.",
      },
    ],
    tasks: [
      {
        id: "task-030-1",
        title: "Отримати підпис субпідрядника",
        description: 'Направити договір на підпис ТОВ "СубТех Груп" для завершення підписання всіма сторонами.',
        status: "pending" as TaskStatus,
        priority: "high" as TaskPriority,
      },
    ],
    signatures: [
      { id: "sig-030-1", signedBy: "Коваленко О.М.", signedAt: "2025-01-20T10:00:00Z", signatureType: "kep" as const, isValid: true },
      { id: "sig-030-2", signedBy: 'Директор ТОВ "Діджитал Солюшнс" Петренко І.В.', signedAt: "2025-01-21T14:30:00Z", signatureType: "kep" as const, isValid: true },
    ],
    files: [{ id: "f-030", name: "Договір_субпідряду_СП-2025-001.pdf", size: 245000, mimeType: "application/pdf", uploadedAt: "2025-01-20T09:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2025-01-20T09:00:00Z",
    createdBy: "owner",
    updatedAt: "2025-01-21T14:30:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-20T09:00:00Z", action: "created", actor: "Коваленко О.М." },
      { id: "h1b", timestamp: "2025-01-20T10:00:00Z", action: "signed", actor: "Коваленко О.М. (КЕП)" },
      { id: "h2", timestamp: "2025-01-20T11:00:00Z", action: "sent", actor: "Коваленко О.М.", comment: "Направлено на підпис замовнику та субпідряднику" },
      { id: "h3", timestamp: "2025-01-21T14:30:00Z", action: "signed", actor: 'Петренко І.В. (КЕП, ТОВ "Діджитал Солюшнс")' },
    ],
  },

  // ── doc-fop-040: 4-сторонній договір консорціуму (ФОП Іваненко) ──
  {
    id: "doc-fop-040",
    type: "contract" as const,
    category: "contract" as const,
    title: "Чотиристоронній договір консорціуму на будівельний проєкт",
    number: "КС-2025-001",
    date: "2025-02-01",
    status: "pending-sign" as const,
    signatureStatus: "partially-signed" as const,
    cabinetName: "ФОП Іваненко О.М.",
    amount: 1250000,
    currency: "UAH",
    aiSummary: "Договір консорціуму між 4 сторонами на виконання комплексного будівельного проєкту. Генпідрядник координує роботу двох субпідрядників за замовленням інвестора.",
    parties: [
      {
        id: "party-040-1",
        name: "ФОП Іваненко О.М.",
        code: "1234567890",
        role: "our-side" as const,
        semanticRole: "Генпідрядник",
        isCabinetOwner: true,
        isVerified: true,
      },
      {
        id: "party-040-2",
        name: 'ТОВ "БудІнвест Груп"',
        code: "33445566",
        role: "counterparty" as const,
        semanticRole: "Замовник",
        isCabinetOwner: false,
        isVerified: true,
      },
      {
        id: "party-040-3",
        name: 'ТОВ "ЕлектроМонтаж Плюс"',
        code: "55667788",
        role: "third-party" as const,
        semanticRole: "Субпідрядник електрики",
        isCabinetOwner: false,
        isVerified: true,
      },
      {
        id: "party-040-4",
        name: 'ТОВ "АкваСистем"',
        code: "99887766",
        role: "third-party" as const,
        semanticRole: "Субпідрядник сантехніки",
        isCabinetOwner: false,
        isVerified: false,
      },
    ],
    aiRisks: [
      {
        id: "risk-040-1",
        category: "legal" as const,
        title: "Відсутній підпис 4-ї сторони",
        description: 'ТОВ "АкваСистем" (Субпідрядник сантехніки) ще не підписав договір. Документ не має повної юридичної сили до отримання всіх 4 підписів.',
        severity: "high" as const,
      },
    ],
    tasks: [
      {
        id: "task-040-1",
        title: 'Отримати підпис ТОВ "АкваСистем"',
        description: 'Направити договір на підпис субпідряднику сантехніки ТОВ "АкваСистем" для завершення процедури підписання.',
        status: "pending" as const,
        priority: "high" as const,
      },
    ],
    signatures: [
      { id: "sig-040-1", signedBy: "Іваненко О.М.", signedAt: "2025-02-01T10:00:00Z", signatureType: "kep" as const, isValid: true },
      { id: "sig-040-2", signedBy: 'Директор ТОВ "БудІнвест Груп" Сидоренко В.П.', signedAt: "2025-02-02T09:30:00Z", signatureType: "kep" as const, isValid: true },
      { id: "sig-040-3", signedBy: 'Директор ТОВ "ЕлектроМонтаж Плюс" Бондар Л.А.', signedAt: "2025-02-03T11:15:00Z", signatureType: "kep" as const, isValid: true },
    ],
    files: [{ id: "f-040", name: "Договір_консорціуму_КС-2025-001.pdf", size: 312000, mimeType: "application/pdf", uploadedAt: "2025-02-01T09:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2025-02-01T09:00:00Z",
    createdBy: "owner",
    updatedAt: "2025-02-03T11:15:00Z",
    history: [
      { id: "h040-1", timestamp: "2025-02-01T09:00:00Z", action: "created", actor: "Іваненко О.М." },
      { id: "h040-2", timestamp: "2025-02-01T10:00:00Z", action: "signed", actor: "Іваненко О.М. (КЕП)" },
      { id: "h040-3", timestamp: "2025-02-01T11:00:00Z", action: "sent", actor: "Іваненко О.М.", comment: "Направлено на підпис усім сторонам" },
      { id: "h040-4", timestamp: "2025-02-02T09:30:00Z", action: "signed", actor: 'Сидоренко В.П. (КЕП, ТОВ "БудІнвест Груп")' },
      { id: "h040-5", timestamp: "2025-02-03T11:15:00Z", action: "signed", actor: 'Бондар Л.А. (КЕП, ТОВ "ЕлектроМонтаж Плюс")' },
    ],
  },
];

// ============================================
// ДЕМО-ДАНІ ДЛЯ ТОВ
// ============================================

export const tovDemoDocuments: Document[] = [
  // ============================================
  // ДОКУМЕНТИ В AI-ОБРОБЦІ
  // ============================================
  {
    id: "tov-doc-ai-processing-1",
    number: "ДОГ-2025-007",
    type: "contract",
    category: "contract",
    title: "Договір на розробку ПЗ",
    subject: "Розробка корпоративного порталу",
    date: "2025-01-10",
    dueDate: "2025-06-30",
    amount: 450000,
    currency: "UAH",
    contractor: {
      id: "c-104",
      name: "ТОВ «Діджитал Агенство»",
      code: "12398745",
    },
    status: "draft",
    aiProcessingStatus: "in-progress",
    aiProcessingStartedAt: "2025-01-10T09:15:00Z",
    linkedDocuments: ["tov-doc-007-a1", "tov-doc-007-a2", "tov-doc-007-du1"],
    retentionPeriod: 5,
    createdAt: "2025-01-10T09:00:00Z",
    createdBy: "manager",
    updatedAt: "2025-01-10T09:15:00Z",
    files: [{ id: "f-ai-1", name: "Договір_проект.pdf", size: 512000, mimeType: "application/pdf", uploadedAt: "2025-01-10T09:00:00Z" }],
    history: [
      { id: "h1", timestamp: "2025-01-10T09:00:00Z", action: "created", actor: "Менеджер" },
      { id: "h2", timestamp: "2025-01-10T09:15:00Z", action: "status-changed", actor: "AI-система", comment: "Розпочато AI-аналіз документа" },
    ],
  },
  {
    id: "tov-doc-ai-processing-2",
    number: "РАХ-2025-012",
    type: "invoice",
    category: "primary",
    title: "Рахунок на комплектуючі",
    subject: "Серверне обладнання та мережеві компоненти",
    date: "2025-01-11",
    dueDate: "2025-01-25",
    amount: 125000,
    currency: "UAH",
    contractor: {
      id: "c-105",
      name: "ТОВ «Техно Партнер»",
      code: "87654321",
    },
    status: "draft",
    aiProcessingStatus: "pending",
    retentionPeriod: 3,
    createdAt: "2025-01-11T08:30:00Z",
    createdBy: "accountant",
    updatedAt: "2025-01-11T08:30:00Z",
    files: [{ id: "f-ai-2", name: "Рахунок_скан.pdf", size: 256000, mimeType: "application/pdf", uploadedAt: "2025-01-11T08:30:00Z" }],
  },
  // ============================================
  // ДОКУМЕНТИ НА ПОГОДЖЕННІ (Потребує уточнення)
  // ID відповідають записам у demoApprovalStates
  // ============================================
  {
    id: "tov-inv-2025-001",
    number: "РАХ-2025-001",
    type: "invoice",
    category: "primary",
    title: "Рахунок на консалтинг",
    subject: "Юридичний супровід угоди M&A",
    date: "2025-01-08",
    dueDate: "2025-01-22",
    amount: 75000,
    currency: "UAH",
    contractor: {
      id: "c-106",
      name: "ТОВ «Юридична Компанія «Право»",
      code: "11112222",
    },
    status: "pending-sign",
    currentApprover: "Бухгалтер",
    retentionPeriod: 3,
    createdAt: "2025-01-08T10:00:00Z",
    createdBy: "manager",
    updatedAt: "2025-01-08T10:30:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-08T10:00:00Z", action: "created", actor: "Менеджер" },
      { id: "h2", timestamp: "2025-01-08T10:30:00Z", action: "status-changed", actor: "Система", comment: "Передано на погодження бухгалтеру" },
    ],
    comments: [
      {
        id: "cmt-inv-001-1",
        authorId: "user-1",
        authorName: "Іваненко О.В.",
        authorRole: "accountant",
        content: "Перевіряю відповідність суми договору. Ціна за годину консалтингу — 2500 грн, заявлено 30 годин = 75 000 грн. Арифметика сходиться.",
        createdAt: "2025-01-10T09:30:00Z",
      },
      {
        id: "cmt-inv-001-2",
        authorId: "user-1",
        authorName: "Іваненко О.В.",
        authorRole: "accountant",
        content: "Контрагент ТОВ «Юридична Компанія «Право» — перевірено в ЄДР, статус платника ПДВ активний. IBAN відповідає попереднім платежам.",
        createdAt: "2025-01-10T10:15:00Z",
      },
      {
        id: "cmt-inv-001-3",
        authorId: "user-1",
        authorName: "Іваненко О.В.",
        authorRole: "accountant",
        content: "⚠️ Зверніть увагу: термін оплати 22.01.2025 — залишилось 12 днів. Рекомендую погодити найближчим часом для своєчасного проведення платежу.",
        createdAt: "2025-01-10T10:45:00Z",
      },
    ],
  },
  {
    id: "tov-contract-pending",
    number: "ДОГ-2025-003",
    type: "contract",
    category: "contract",
    title: "Договір на маркетингові послуги",
    subject: "Digital-маркетинг та SMM-просування",
    date: "2025-01-07",
    dueDate: "2025-12-31",
    amount: 180000,
    currency: "UAH",
    contractor: {
      id: "c-107",
      name: "ТОВ «Маркетинг Груп»",
      code: "33334444",
    },
    status: "pending-sign",
    currentApprover: "Юрист",
    retentionPeriod: 5,
    createdAt: "2025-01-07T11:00:00Z",
    createdBy: "manager",
    updatedAt: "2025-01-07T11:30:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-07T11:00:00Z", action: "created", actor: "Менеджер" },
      { id: "h2", timestamp: "2025-01-07T11:30:00Z", action: "status-changed", actor: "Бухгалтер", comment: "Погоджено, передано юристу" },
    ],
    comments: [
      {
        id: "cmt-con-001-1",
        authorId: "user-3",
        authorName: "Сидоренко М.П.",
        authorRole: "accountant",
        content: "Фінансові умови перевірено. Щомісячний платіж 15 000 грн × 12 місяців = 180 000 грн. Бюджет на маркетинг затверджено на Q1-Q4.",
        createdAt: "2025-01-08T14:20:00Z",
      },
      {
        id: "cmt-con-001-2",
        authorId: "user-3",
        authorName: "Сидоренко М.П.",
        authorRole: "accountant",
        content: "Рекомендую до погодження. Передаю на юридичну експертизу. @Петренко І.С. зверніть увагу на пункт про інтелектуальну власність.",
        createdAt: "2025-01-08T14:35:00Z",
        mentions: ["user-2"],
      },
      {
        id: "cmt-con-001-3",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "Дякую за рекомендацію. Розпочинаю юридичний аналіз договору.",
        createdAt: "2025-01-09T09:00:00Z",
        replyToId: "cmt-con-001-2",
      },
      {
        id: "cmt-con-001-4",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "🔍 П. 4.3 «Форс-мажор» — формулювання занадто широке. Включає «зміни законодавства» як форс-мажор, що може бути використано для одностороннього розірвання. Рекомендую уточнити.",
        createdAt: "2025-01-09T10:30:00Z",
      },
      {
        id: "cmt-con-001-5",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "🔍 П. 6.1 «Штрафні санкції» — пеня 0.5% за день прострочення = 182.5% річних. Це перевищує типові ринкові умови (0.1-0.2%). Рекомендую переговорити зниження до 0.1%.",
        createdAt: "2025-01-09T11:15:00Z",
      },
      {
        id: "cmt-con-001-6",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "📋 П. 8 «Інтелектуальна власність» — права на створений контент переходять до Замовника лише після повної оплати. Це стандартна практика, OK.",
        createdAt: "2025-01-09T11:45:00Z",
      },
      {
        id: "cmt-con-001-7",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "⚠️ РЕЗЮМЕ: Договір потребує корекції п. 4.3 та п. 6.1 перед підписанням. Готую лист контрагенту з пропозиціями змін. Очікую відповідь протягом 3 робочих днів.",
        createdAt: "2025-01-09T14:00:00Z",
      },
    ],
  },
  // ============================================
  // ВХІДНИЙ ДОГОВІР ДЛЯ ТЕСТУВАННЯ АКТУ РОЗБІЖНОСТЕЙ
  // ============================================
  {
    id: "tov-incoming-contract-1",
    number: "ДОГ-ВХІД-2025-001",
    type: "contract",
    category: "contract",
    title: "Договір на IT-аутсорсинг (вхідний)",
    subject: "Надання послуг з розробки та підтримки програмного забезпечення",
    date: "2025-01-08",
    dueDate: "2026-01-08",
    amount: 960000,
    currency: "UAH",
    contractor: {
      id: "c-incoming-1",
      name: "ТОВ «Глобал Софт»",
      code: "40567891",
    },
    status: "sent",
    currentApprover: "Юрист",
    retentionPeriod: 5,
    createdAt: "2025-01-08T14:00:00Z",
    createdBy: "ТОВ «Глобал Софт»",
    updatedAt: "2025-01-08T15:30:00Z",
    files: [
      { 
        id: "f-incoming-1", 
        name: "Договір_IT_аутсорсинг_GlobalSoft.pdf", 
        size: 520000, 
        mimeType: "application/pdf", 
        uploadedAt: "2025-01-08T14:00:00Z" 
      }
    ],
    history: [
      { 
        id: "h1", 
        timestamp: "2025-01-08T14:00:00Z", 
        action: "created", 
        actor: "ТОВ «Глобал Софт»" 
      },
      { 
        id: "h2", 
        timestamp: "2025-01-08T14:30:00Z", 
        action: "sent", 
        actor: "ТОВ «Глобал Софт»",
        comment: "Надіслано для погодження" 
      },
      { 
        id: "h3", 
        timestamp: "2025-01-08T15:30:00Z", 
        action: "received",
        actor: "Система", 
        comment: "Отримано від контрагента через Email" 
      },
    ],
    comments: [
      {
        id: "cmt-incoming-1",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "📥 Отримано новий договір від ТОВ «Глобал Софт» на IT-аутсорсинг. Розпочинаю юридичний аналіз.",
        createdAt: "2025-01-08T16:00:00Z",
      },
      {
        id: "cmt-incoming-2",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "⚠️ П. 3.5 Відповідальність — обмеження відповідальності виконавця до 10% від суми договору. Це занадто низько для річного контракту на 960 000 грн. Рекомендую обговорити підвищення до 50%.",
        createdAt: "2025-01-09T10:00:00Z",
      },
      {
        id: "cmt-incoming-3",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer", 
        content: "🔍 П. 7.2 Конфіденційність — термін 5 років після закінчення договору. Стандартна практика, OK.",
        createdAt: "2025-01-09T10:30:00Z",
      },
      {
        id: "cmt-incoming-4",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "⚠️ П. 9.4 — 60 банківських днів на повернення передоплати при розірванні. Це близько 3 місяців! Рекомендую скоротити до 14 календарних днів.",
        createdAt: "2025-01-09T11:00:00Z",
      },
      {
        id: "cmt-incoming-5",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "⚠️ П. 10.3 — Підсудність за місцезнаходженням Виконавця невигідна. Пропоную змінити на 'за місцезнаходженням позивача' або вказати конкретний суд м. Київ.",
        createdAt: "2025-01-09T11:30:00Z",
      },
      {
        id: "cmt-incoming-6",
        authorId: "user-2",
        authorName: "Петренко І.С.",
        authorRole: "lawyer",
        content: "⚠️ РЕЗЮМЕ: Договір потребує корекції п. 3.5 (відповідальність), п. 9.4 (повернення передоплати), п. 10.3 (підсудність). Рекомендую створити Акт розбіжностей.",
        createdAt: "2025-01-09T14:00:00Z",
      },
    ],
    bodyHtml: `
      <div style="font-family: 'Times New Roman', serif; padding: 20px; max-width: 800px;">
        <h2 style="text-align: center; margin-bottom: 30px;">ДОГОВІР № ДОГ-ВХІД-2025-001</h2>
        <p style="text-align: center; margin-bottom: 20px;">про надання послуг з IT-аутсорсингу</p>
        
        <p style="margin-bottom: 15px;"><strong>м. Київ</strong> <span style="float: right;">08 січня 2025 р.</span></p>
        
        <p style="margin-bottom: 15px; text-align: justify;">
          <strong>ТОВ «Глобал Софт»</strong>, в особі директора Сидоренка О.В., що діє на підставі Статуту 
          (надалі – Виконавець), з однієї сторони, та <strong>ТОВ «Моя Компанія»</strong>, в особі директора 
          Іваненка П.С., що діє на підставі Статуту (надалі – Замовник), з іншої сторони, уклали цей Договір 
          про наступне:
        </p>
        
        <h3 style="margin-top: 25px;">1. ПРЕДМЕТ ДОГОВОРУ</h3>
        <p style="text-align: justify;">1.1. Виконавець зобов'язується надати Замовнику послуги з розробки та підтримки програмного забезпечення згідно з Технічним завданням (Додаток 1), а Замовник зобов'язується прийняти та оплатити ці послуги.</p>
        <p style="text-align: justify;">1.2. Послуги включають: розробку програмного забезпечення, технічну підтримку, консультації, навчання персоналу Замовника.</p>
        
        <h3 style="margin-top: 25px;">2. ВАРТІСТЬ ПОСЛУГ ТА ПОРЯДОК РОЗРАХУНКІВ</h3>
        <p>2.1. Загальна вартість послуг за цим Договором становить 960 000,00 грн (дев'ятсот шістдесят тисяч гривень 00 копійок), без ПДВ.</p>
        <p>2.2. Оплата здійснюється щомісячно по 80 000,00 грн на підставі Актів виконаних робіт.</p>
        <p>2.3. Замовник здійснює передоплату в розмірі 20% від загальної суми протягом 5 робочих днів з моменту підписання Договору.</p>
        
        <h3 style="margin-top: 25px;">3. ВІДПОВІДАЛЬНІСТЬ СТОРІН</h3>
        <p>3.1. За невиконання або неналежне виконання зобов'язань за цим Договором сторони несуть відповідальність згідно з чинним законодавством України.</p>
        <p>3.2. У разі прострочення оплати Замовник сплачує пеню в розмірі 0,1% від суми заборгованості за кожен день прострочення.</p>
        <p>3.3. У разі прострочення виконання робіт Виконавець сплачує пеню в розмірі 0,1% від вартості невиконаних робіт за кожен день прострочення.</p>
        <p>3.4. Сторона, яка порушила свої зобов'язання, зобов'язана відшкодувати іншій стороні завдані прямі збитки.</p>
        <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;"><strong>3.5. Загальний розмір відповідальності Виконавця за цим Договором обмежується 10% (десятьма відсотками) від загальної суми Договору.</strong></p>
        
        <h3 style="margin-top: 25px;">4. СТРОКИ ВИКОНАННЯ</h3>
        <p>4.1. Договір набуває чинності з моменту підписання та діє до 31 грудня 2025 року.</p>
        <p>4.2. Виконавець розпочинає надання послуг протягом 5 (п'яти) робочих днів з моменту отримання передоплати.</p>
        <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">4.3. У разі затримки виконання робіт з вини Виконавця більш ніж на 30 (тридцять) календарних днів, Замовник має право розірвати Договір в односторонньому порядку без відшкодування збитків Виконавцю.</p>
        <p>4.4. Графік виконання окремих етапів визначається Технічним завданням (Додаток 1).</p>
        
        <h3 style="margin-top: 25px;">5. ПОРЯДОК ПРИЙМАННЯ РОБІТ</h3>
        <p>5.1. По завершенні кожного етапу Виконавець надає Замовнику Акт виконаних робіт.</p>
        <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">5.2. Замовник протягом 3 (трьох) робочих днів з моменту отримання Акту зобов'язаний підписати його або надати мотивовану відмову. У разі ненадання відповіді — роботи вважаються прийнятими.</p>
        <p>5.3. При виявленні недоліків Замовник направляє Виконавцю перелік зауважень, які підлягають усуненню протягом 10 робочих днів за рахунок Виконавця.</p>
        <p>5.4. Повторне тестування після усунення недоліків здійснюється за рахунок Виконавця.</p>
        
        <h3 style="margin-top: 25px;">6. ФОРС-МАЖОР</h3>
        <p>6.1. Сторони звільняються від відповідальності за часткове або повне невиконання зобов'язань, якщо воно є наслідком дії обставин непереборної сили.</p>
        <p>6.2. До обставин непереборної сили належать: стихійні лиха, воєнні дії, епідемії, страйки, акти органів державної влади, що унеможливлюють виконання зобов'язань.</p>
        <p style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">6.3. Сторона, що зазнала впливу форс-мажору, зобов'язана повідомити іншу сторону протягом 48 (сорока восьми) годин з моменту настання таких обставин.</p>
        <p>6.4. Належним доказом наявності форс-мажорних обставин є довідка Торгово-промислової палати України.</p>
        
        <h3 style="margin-top: 25px;">7. КОНФІДЕНЦІЙНІСТЬ</h3>
        <p>7.1. Сторони зобов'язуються не розголошувати конфіденційну інформацію, отриману в рамках виконання цього Договору.</p>
        <p>7.2. Зобов'язання щодо конфіденційності діють протягом 5 (п'яти) років після закінчення терміну дії цього Договору.</p>
        <p>7.3. До конфіденційної інформації належать: технічна документація, вихідний код, бізнес-процеси, фінансові дані.</p>
        
        <h3 style="margin-top: 25px;">8. ПРАВА ІНТЕЛЕКТУАЛЬНОЇ ВЛАСНОСТІ</h3>
        <p>8.1. Усі права інтелектуальної власності на розроблене програмне забезпечення переходять до Замовника після повної оплати.</p>
        <p>8.2. Виконавець гарантує, що розроблене програмне забезпечення не порушує прав третіх осіб.</p>
        
        <h3 style="margin-top: 25px;">9. ПОРЯДОК РОЗІРВАННЯ ДОГОВОРУ</h3>
        <p>9.1. Договір може бути розірваний за взаємною згодою сторін шляхом підписання додаткової угоди.</p>
        <p style="background-color: #f8d7da; padding: 10px; border-left: 4px solid #dc3545;">9.2. Кожна зі сторін має право розірвати Договір в односторонньому порядку, попередивши іншу сторону письмово за 30 (тридцять) календарних днів.</p>
        <p>9.3. При достроковому розірванні Договору з ініціативи Замовника, оплаті підлягають фактично надані послуги та понесені витрати Виконавця.</p>
        <p style="background-color: #f8d7da; padding: 10px; border-left: 4px solid #dc3545;"><strong>9.4. При достроковому розірванні Договору з ініціативи Виконавця, передоплата за ненадані послуги повертається Замовнику протягом 60 (шістдесяти) банківських днів.</strong></p>
        
        <h3 style="margin-top: 25px;">10. ІНШІ УМОВИ</h3>
        <p>10.1. Усі зміни та доповнення до цього Договору дійсні лише у разі їх оформлення у письмовій формі та підписання обома сторонами.</p>
        <p>10.2. Спори, що виникають у зв'язку з виконанням цього Договору, вирішуються шляхом переговорів.</p>
        <p style="background-color: #f8d7da; padding: 10px; border-left: 4px solid #dc3545;"><strong>10.3. У разі недосягнення згоди, спори передаються на розгляд до господарського суду за місцезнаходженням Виконавця.</strong></p>
        <p>10.4. Цей Договір укладено у двох примірниках українською мовою, що мають однакову юридичну силу, по одному для кожної зі сторін.</p>
        <p>10.5. Додатки до цього Договору є його невід'ємною частиною.</p>
        
        <h3 style="margin-top: 25px;">11. РЕКВІЗИТИ СТОРІН</h3>
        <table style="width: 100%; margin-top: 15px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <strong>ВИКОНАВЕЦЬ:</strong><br/>
              ТОВ «Глобал Софт»<br/>
              ЄДРПОУ: 40567891<br/>
              Адреса: м. Київ, вул. Хрещатик, 1<br/>
              IBAN: UA12345678901234567890123456<br/>
              Телефон: +380 44 123 45 67<br/>
              E-mail: info@globalsoft.ua
            </td>
            <td style="width: 50%; vertical-align: top;">
              <strong>ЗАМОВНИК:</strong><br/>
              ТОВ «Моя Компанія»<br/>
              ЄДРПОУ: 12345678<br/>
              Адреса: м. Київ, вул. Центральна, 10<br/>
              IBAN: UA98765432109876543210987654<br/>
              Телефон: +380 44 987 65 43<br/>
              E-mail: office@mycompany.ua
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 40px;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 50%; text-align: center;">
                <p>Директор</p>
                <p style="margin-top: 30px;">________________ /Сидоренко О.В./</p>
                <p style="font-size: 12px; color: #666;">М.П.</p>
              </td>
              <td style="width: 50%; text-align: center;">
                <p>Директор</p>
                <p style="margin-top: 30px;">________________ /Іваненко П.С./</p>
                <p style="font-size: 12px; color: #666;">М.П.</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `,
  },
  {
    id: "tov-hr-order-1",
    number: "НК-2025-001",
    type: "employment-order",
    category: "internal",
    title: "Наказ про прийняття на роботу",
    employee: {
      name: "Ковальчук Олена Сергіївна",
      position: "Frontend Developer",
      department: "Розробка",
    },
    date: "2025-01-09",
    currency: "UAH",
    status: "pending-sign",
    currentApprover: "HR-менеджер",
    retentionPeriod: 75,
    createdAt: "2025-01-09T09:00:00Z",
    createdBy: "hr",
    updatedAt: "2025-01-09T09:15:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-09T09:00:00Z", action: "created", actor: "HR-менеджер" },
      { id: "h2", timestamp: "2025-01-09T09:15:00Z", action: "status-changed", actor: "Система", comment: "Очікує підтвердження HR" },
    ],
  },
  // ============================================
  // ВАЛЮТНИЙ ДОКУМЕНТ З КУРСОМ ТА КОМЕНТАРЯМИ
  // ============================================
  {
    id: "tov-usd-contract-1",
    number: "ДОГ-2025-USD-01",
    type: "contract",
    category: "contract",
    title: "Договір на маркетинг (USD)",
    subject: "Послуги digital-маркетингу від закордонного партнера",
    date: "2025-01-10",
    dueDate: "2025-12-31",
    amount: 5000,
    currency: "USD",
    exchangeRate: 41.5250,
    exchangeRateDate: "2025-01-10",
    amountInUAH: 207625,
    accounting: {
      account: "632",
      taxCategory: "expense",
      costCenter: "Маркетинг",
    },
    contractor: {
      id: "c-108",
      name: "Digital Agency LLC",
      code: "US12345678",
    },
    status: "pending-sign",
    retentionPeriod: 5,
    createdAt: "2025-01-10T10:00:00Z",
    createdBy: "manager",
    updatedAt: "2025-01-10T11:30:00Z",
    comments: [
      {
        id: "c1",
        authorId: "user-2",
        authorName: "Бухгалтер Олена",
        authorRole: "accountant",
        content: "Перевірено реквізити контрагента. Все коректно.",
        createdAt: "2025-01-10T10:30:00Z",
      },
      {
        id: "c2",
        authorId: "user-3",
        authorName: "Юрист Андрій",
        authorRole: "lawyer",
        content: "@Бухгалтер Олена дякую! Є питання по п.5.2 — можна уточнити термін пролонгації?",
        createdAt: "2025-01-10T11:15:00Z",
        mentions: ["user-2"],
      },
    ],
    history: [
      { id: "h1", timestamp: "2025-01-10T10:00:00Z", action: "created", actor: "Менеджер" },
    ],
  },
  // ============================================
  // ІСНУЮЧІ ДОКУМЕНТИ ТОВ
  // ============================================
  {
    id: "doc-tov-001",
    number: "НКЛ-2024-127",
    type: "waybill",
    category: "primary",
    title: "Накладна на товар",
    date: "2024-12-09",
    amount: 48000,
    currency: "UAH",
    contractor: {
      id: "c-101",
      name: "ТОВ «Постачальник Плюс»",
      code: "11223344",
      iban: "UA213223130000026007233566002",
    },
    status: "confirmed",
    approvalRoute: "route-standard",
    signatures: [
      { id: "s1", signedBy: "Бухгалтер", signedAt: "2024-12-09T10:00:00Z", signatureType: "kep", isValid: true },
      { id: "s2", signedBy: "Директор", signedAt: "2024-12-09T11:00:00Z", signatureType: "kep", isValid: true },
    ],
    retentionPeriod: 5,
    createdAt: "2024-12-09T09:00:00Z",
    createdBy: "accountant",
    updatedAt: "2024-12-09T11:00:00Z",
  },
  {
    id: "doc-tov-002",
    number: "ПН-2024-089",
    type: "tax-invoice",
    category: "primary",
    title: "Податкова накладна",
    date: "2024-12-08",
    amount: 125000,
    currency: "UAH",
    contractor: {
      id: "c-102",
      name: "ТОВ «Клієнт Сервіс»",
      code: "55667788",
    },
    status: "registered",
    taxInvoiceNumber: "9000123456",
    signatures: [
      { id: "s1", signedBy: "Бухгалтер", signedAt: "2024-12-08T14:00:00Z", signatureType: "qualified-kep", isValid: true },
    ],
    retentionPeriod: 7,
    createdAt: "2024-12-08T13:00:00Z",
    createdBy: "accountant",
    updatedAt: "2024-12-08T15:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-08T13:00:00Z", action: "created", actor: "Бухгалтер" },
      { id: "h2", timestamp: "2024-12-08T14:00:00Z", action: "signed", actor: "Бухгалтер" },
      { id: "h3", timestamp: "2024-12-08T15:00:00Z", action: "status-changed", actor: "ЄРПН", newValue: "Зареєстровано" },
    ],
  },
  {
    id: "doc-tov-003",
    number: "ДОГ-2024-045",
    type: "contract",
    category: "contract",
    title: "Договір постачання",
    date: "2024-12-01",
    dueDate: "2025-12-01",
    currency: "UAH",
    contractor: {
      id: "c-103",
      name: "ТОВ «Партнер Груп»",
      code: "99887766",
    },
    status: "pending-sign",
    currentApprover: "Директор",
    approvalRoute: "route-director",
    retentionPeriod: 5,
    createdAt: "2024-12-01T10:00:00Z",
    createdBy: "manager",
    updatedAt: "2024-12-05T16:00:00Z",
  },
  {
    id: "doc-tov-004",
    number: "РАХ-2024-156",
    type: "invoice",
    category: "primary",
    title: "Рахунок-фактура на послуги",
    date: "2024-12-07",
    dueDate: "2024-12-21",
    amount: 85000,
    paidAmount: 42500,
    currency: "UAH",
    contractor: {
      id: "c-102",
      name: "ТОВ «Клієнт Сервіс»",
      code: "55667788",
    },
    status: "partially-paid",
    linkedPayments: [{ id: "pay-001", amount: 42500, date: "2024-12-10", source: "Банк" }],
    retentionPeriod: 5,
    createdAt: "2024-12-07T09:00:00Z",
    createdBy: "accountant",
    updatedAt: "2024-12-10T12:00:00Z",
  },
  {
    id: "doc-tov-005",
    number: "АКТ-ЗВ-2024-Q4",
    type: "reconciliation",
    category: "primary",
    title: "Акт звірки за IV квартал",
    date: "2024-12-11",
    currency: "UAH",
    contractor: {
      id: "c-101",
      name: "ТОВ «Постачальник Плюс»",
      code: "11223344",
    },
    status: "sent",
    retentionPeriod: 3,
    createdAt: "2024-12-11T10:00:00Z",
    createdBy: "accountant",
    updatedAt: "2024-12-11T11:00:00Z",
  },
  {
    id: "doc-tov-006",
    number: "НКЗ-2024-089",
    type: "order",
    category: "internal",
    title: "Наказ про преміювання",
    date: "2024-12-10",
    currency: "UAH",
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Директор", signedAt: "2024-12-10T16:00:00Z", signatureType: "kep", isValid: true },
    ],
    retentionPeriod: 75,
    createdAt: "2024-12-10T15:00:00Z",
    createdBy: "hr",
    updatedAt: "2024-12-10T16:00:00Z",
  },
  
  // ============================================
  // ЛАНЦЮЖОК I: Додатки та ДУ до договору на розробку ПЗ (tov-doc-ai-processing-1)
  // ============================================
  {
    id: "tov-doc-007-a1",
    number: "ДОГ-2025-007-Додаток-1",
    type: "contract",
    category: "contract",
    title: "Додаток №1. Технічне завдання",
    subject: "Технічне завдання на розробку корпоративного порталу",
    date: "2025-01-10",
    currency: "UAH",
    contractor: {
      id: "c-104",
      name: "ТОВ «Діджитал Агенство»",
      code: "12398745",
    },
    status: "draft",
    linkedDocuments: ["tov-doc-ai-processing-1"],
    files: [{ id: "f-tov-007-a1", name: "Додаток_1_ТЗ.pdf", size: 450000, mimeType: "application/pdf", uploadedAt: "2025-01-10T09:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2025-01-10T09:00:00Z",
    createdBy: "manager",
    updatedAt: "2025-01-10T09:00:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-10T09:00:00Z", action: "created", actor: "Менеджер" },
    ],
  },
  {
    id: "tov-doc-007-a2",
    number: "ДОГ-2025-007-Додаток-2",
    type: "contract",
    category: "contract",
    title: "Додаток №2. Календарний план",
    subject: "Етапи та терміни виконання робіт з розробки порталу",
    date: "2025-01-10",
    currency: "UAH",
    contractor: {
      id: "c-104",
      name: "ТОВ «Діджитал Агенство»",
      code: "12398745",
    },
    status: "draft",
    linkedDocuments: ["tov-doc-ai-processing-1"],
    files: [{ id: "f-tov-007-a2", name: "Додаток_2_Календарний_план.pdf", size: 185000, mimeType: "application/pdf", uploadedAt: "2025-01-10T09:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2025-01-10T09:00:00Z",
    createdBy: "manager",
    updatedAt: "2025-01-10T09:00:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-10T09:00:00Z", action: "created", actor: "Менеджер" },
    ],
  },
  {
    id: "tov-doc-007-du1",
    number: "ДОГ-2025-007-ДУ-1",
    type: "contract",
    category: "contract",
    title: "Додаткова угода №1 про розширення функціоналу",
    subject: "Додавання модуля CRM та інтеграції з 1С",
    date: "2025-01-11",
    amount: 580000,
    currency: "UAH",
    contractor: {
      id: "c-104",
      name: "ТОВ «Діджитал Агенство»",
      code: "12398745",
    },
    status: "pending-sign",
    currentApprover: "Юрист",
    linkedDocuments: ["tov-doc-ai-processing-1"],
    files: [{ id: "f-tov-007-du1", name: "Додаткова_угода_1_CRM.pdf", size: 95000, mimeType: "application/pdf", uploadedAt: "2025-01-11T10:00:00Z" }],
    retentionPeriod: 5,
    createdAt: "2025-01-11T10:00:00Z",
    createdBy: "manager",
    updatedAt: "2025-01-11T10:30:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-11T10:00:00Z", action: "created", actor: "Менеджер" },
      { id: "h2", timestamp: "2025-01-11T10:30:00Z", action: "status-changed", actor: "Система", comment: "Передано на погодження юристу" },
    ],
  },
];

// ============================================
// ДЕМО-ДАНІ ДЛЯ ФОП-ГРУПИ
// ============================================

export interface FopGroupDocumentSummary {
  fopId: string;
  fopName: string;
  fopCode: string;
  totalDocuments: number;
  pendingSign: number;
  issues: number;
  lastActivity: string;
}

export const fopGroupDemoDocuments: FopGroupDocumentSummary[] = [
  {
    fopId: "fop-1",
    fopName: "ФОП Коваленко О.М.",
    fopCode: "1234567890",
    totalDocuments: 12,
    pendingSign: 0,
    issues: 0,
    lastActivity: "2024-12-09",
  },
  {
    fopId: "fop-2",
    fopName: "ФОП Шевченко І.П.",
    fopCode: "2345678901",
    totalDocuments: 8,
    pendingSign: 2,
    issues: 0,
    lastActivity: "2024-12-08",
  },
  {
    fopId: "fop-3",
    fopName: "ФОП Бондар А.С.",
    fopCode: "3456789012",
    totalDocuments: 15,
    pendingSign: 1,
    issues: 1,
    lastActivity: "2024-12-07",
  },
  {
    fopId: "fop-4",
    fopName: "ФОП Мороз К.О.",
    fopCode: "5678901234",
    totalDocuments: 6,
    pendingSign: 0,
    issues: 2,
    lastActivity: "2024-12-05",
  },
];

// ============================================
// ДЕМО-ДАНІ ДЛЯ ПАСИВНОГО КАБІНЕТУ КОНТРАГЕНТА
// Документи від партнера ФОП Іваненко для passive-demo-1
// ============================================

export const passiveDemoDocuments: Document[] = [
  // Договір поставки - підписаний обома сторонами
  {
    id: "passive-doc-001",
    number: "ДП-2024/125",
    type: "supply-contract",
    category: "contract",
    title: "Договір поставки IT-обладнання",
    subject: "Поставка комп'ютерного обладнання та комплектуючих",
    date: "2024-12-15",
    dueDate: "2025-12-15",
    currency: "UAH",
    contractor: {
      id: "partner-fop-ivanenko",
      name: "ФОП Іваненко Іван Іванович",
      code: "1234567890",
      iban: "UA213223130000026007233566001",
      verified: true,
      validationStatus: "valid",
    },
    status: "confirmed",
    signatures: [
      { id: "s1", signedBy: "Марченко В.А.", signedAt: "2024-12-15T10:00:00Z", signatureType: "kep", certificateIssuer: "АЦСК ПриватБанку", isValid: true },
      { id: "s2", signedBy: "Іваненко І.І.", signedAt: "2024-12-15T11:30:00Z", signatureType: "kep", certificateIssuer: "АЦСК Україна", isValid: true },
    ],
    files: [{ id: "f-p1", name: "Договір_ДП-2024-125.pdf", size: 256000, mimeType: "application/pdf", uploadedAt: "2024-12-15T10:00:00Z", isSigned: true }],
    retentionPeriod: 5,
    createdAt: "2024-12-15T09:00:00Z",
    createdBy: "ФОП Іваненко І.І.",
    updatedAt: "2024-12-15T11:30:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-15T09:00:00Z", action: "created", actor: "ФОП Іваненко І.І." },
      { id: "h2", timestamp: "2024-12-15T09:30:00Z", action: "received", actor: "Система", comment: "Отримано від партнера" },
      { id: "h3", timestamp: "2024-12-15T10:00:00Z", action: "signed", actor: "Марченко В.А." },
      { id: "h4", timestamp: "2024-12-15T11:30:00Z", action: "confirmed", actor: "ФОП Іваненко І.І." },
    ],
  },
  // Рахунок - очікує підпису контрагента
  {
    id: "passive-doc-002",
    number: "Р-2025/001",
    type: "invoice",
    category: "primary",
    title: "Рахунок на оплату IT-послуг",
    subject: "Технічна підтримка та супровід IT-інфраструктури",
    period: { from: "2025-01-01", to: "2025-01-31", label: "січень 2025" },
    date: "2025-01-05",
    dueDate: "2025-01-20",
    amount: 45000,
    currency: "UAH",
    contractor: {
      id: "partner-fop-ivanenko",
      name: "ФОП Іваненко Іван Іванович",
      code: "1234567890",
      iban: "UA213223130000026007233566001",
      verified: true,
      validationStatus: "valid",
    },
    status: "pending-sign",
    linkedDocuments: ["passive-doc-001"],
    files: [{ id: "f-p2", name: "Рахунок_Р-2025-001.pdf", size: 125000, mimeType: "application/pdf", uploadedAt: "2025-01-05T08:00:00Z" }],
    retentionPeriod: 3,
    createdAt: "2025-01-05T08:00:00Z",
    createdBy: "ФОП Іваненко І.І.",
    updatedAt: "2025-01-05T08:00:00Z",
    tags: ["Терміново"],
    history: [
      { id: "h1", timestamp: "2025-01-05T08:00:00Z", action: "created", actor: "ФОП Іваненко І.І." },
      { id: "h2", timestamp: "2025-01-05T08:15:00Z", action: "received", actor: "Система", comment: "Отримано від партнера" },
    ],
  },
  // Акт виконаних робіт - очікує підпису
  {
    id: "passive-doc-003",
    number: "АВР-2025/001",
    type: "act",
    category: "primary",
    title: "Акт виконаних робіт з IT-підтримки",
    subject: "IT-підтримка та консультації за січень 2025",
    period: { from: "2025-01-01", to: "2025-01-31", label: "січень 2025" },
    date: "2025-01-05",
    amount: 45000,
    currency: "UAH",
    contractor: {
      id: "partner-fop-ivanenko",
      name: "ФОП Іваненко Іван Іванович",
      code: "1234567890",
      iban: "UA213223130000026007233566001",
      verified: true,
      validationStatus: "valid",
    },
    status: "pending-sign",
    linkedDocuments: ["passive-doc-001", "passive-doc-002"],
    files: [{ id: "f-p3", name: "Акт_АВР-2025-001.pdf", size: 98000, mimeType: "application/pdf", uploadedAt: "2025-01-05T08:30:00Z" }],
    retentionPeriod: 3,
    createdAt: "2025-01-05T08:30:00Z",
    createdBy: "ФОП Іваненко І.І.",
    updatedAt: "2025-01-05T08:30:00Z",
    history: [
      { id: "h1", timestamp: "2025-01-05T08:30:00Z", action: "created", actor: "ФОП Іваненко І.І." },
      { id: "h2", timestamp: "2025-01-05T08:45:00Z", action: "received", actor: "Система", comment: "Отримано від партнера" },
    ],
  },
  // Накладна - підписана
  {
    id: "passive-doc-004",
    number: "ВН-2024/089",
    type: "waybill",
    category: "primary",
    title: "Видаткова накладна на комп'ютерне обладнання",
    subject: "Ноутбуки Lenovo ThinkPad x 2 шт",
    date: "2024-12-20",
    amount: 85000,
    currency: "UAH",
    contractor: {
      id: "partner-fop-ivanenko",
      name: "ФОП Іваненко Іван Іванович",
      code: "1234567890",
      iban: "UA213223130000026007233566001",
      verified: true,
      validationStatus: "valid",
    },
    status: "confirmed",
    linkedDocuments: ["passive-doc-001"],
    linkedPayments: [{ id: "passive-income-2", amount: 85000, date: "2024-12-22", source: "Monobank" }],
    signatures: [
      { id: "s1", signedBy: "Марченко В.А.", signedAt: "2024-12-20T14:00:00Z", signatureType: "kep", certificateIssuer: "АЦСК ПриватБанку", isValid: true },
      { id: "s2", signedBy: "Іваненко І.І.", signedAt: "2024-12-20T15:00:00Z", signatureType: "kep", certificateIssuer: "АЦСК Україна", isValid: true },
    ],
    files: [{ id: "f-p4", name: "Накладна_ВН-2024-089.pdf", size: 156000, mimeType: "application/pdf", uploadedAt: "2024-12-20T14:00:00Z", isSigned: true }],
    retentionPeriod: 5,
    createdAt: "2024-12-20T13:00:00Z",
    createdBy: "ФОП Іваненко І.І.",
    updatedAt: "2024-12-20T15:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-20T13:00:00Z", action: "created", actor: "ФОП Іваненко І.І." },
      { id: "h2", timestamp: "2024-12-20T13:30:00Z", action: "received", actor: "Система" },
      { id: "h3", timestamp: "2024-12-20T14:00:00Z", action: "signed", actor: "Марченко В.А." },
      { id: "h4", timestamp: "2024-12-20T15:00:00Z", action: "confirmed", actor: "ФОП Іваненко І.І." },
    ],
  },
  // Архівний рахунок - оплачений
  {
    id: "passive-doc-005",
    number: "Р-2024/156",
    type: "invoice",
    category: "primary",
    title: "Рахунок на оплату консалтингових послуг",
    subject: "Консультації з оптимізації бізнес-процесів",
    period: { from: "2024-12-01", to: "2024-12-31", label: "грудень 2024" },
    date: "2024-12-10",
    dueDate: "2024-12-20",
    amount: 35000,
    paidAmount: 35000,
    currency: "UAH",
    contractor: {
      id: "partner-fop-ivanenko",
      name: "ФОП Іваненко Іван Іванович",
      code: "1234567890",
      iban: "UA213223130000026007233566001",
      verified: true,
      validationStatus: "valid",
    },
    status: "paid",
    linkedDocuments: ["passive-doc-001"],
    linkedPayments: [{ id: "passive-income-1", amount: 35000, date: "2024-12-18", source: "Monobank" }],
    files: [{ id: "f-p5", name: "Рахунок_Р-2024-156.pdf", size: 112000, mimeType: "application/pdf", uploadedAt: "2024-12-10T09:00:00Z" }],
    retentionPeriod: 3,
    createdAt: "2024-12-10T09:00:00Z",
    createdBy: "ФОП Іваненко І.І.",
    updatedAt: "2024-12-18T16:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-10T09:00:00Z", action: "created", actor: "ФОП Іваненко І.І." },
      { id: "h2", timestamp: "2024-12-10T09:30:00Z", action: "received", actor: "Система" },
      { id: "h3", timestamp: "2024-12-10T10:00:00Z", action: "sent", actor: "Марченко В.А.", comment: "Підтверджено для оплати" },
      { id: "h4", timestamp: "2024-12-18T16:00:00Z", action: "paid", actor: "Monobank", comment: "Надійшла оплата 35 000 ₴" },
    ],
  },
];

// ============================================
// НОВІ ДЕМО-ДОКУМЕНТИ ДЛЯ ТОВ (Фаза 3)
// ============================================

// Податкова накладна - очікує реєстрації
const tovTaxInvoice2: Document = {
  id: "tov-tax-inv-002",
  number: "ПН-2025-00002",
  type: "tax-invoice",
  category: "fiscal",
  title: "Податкова накладна на поставку товарів",
  subject: "Комп'ютерне обладнання та периферія",
  date: "2025-01-12",
  amount: 85000,
  currency: "UAH",
  contractor: {
    id: "c-109",
    name: "ТОВ «ІТ-Рішення»",
    code: "99887766",
    iban: "UA213223130000026007233566099",
  },
  status: "signed",
  signatures: [
    { id: "s1", signedBy: "Бухгалтер", signedAt: "2025-01-12T11:00:00Z", signatureType: "qualified-kep", isValid: true },
  ],
  retentionPeriod: 7,
  createdAt: "2025-01-12T10:00:00Z",
  createdBy: "accountant",
  updatedAt: "2025-01-12T11:00:00Z",
  history: [
    { id: "h1", timestamp: "2025-01-12T10:00:00Z", action: "created", actor: "Бухгалтер" },
    { id: "h2", timestamp: "2025-01-12T11:00:00Z", action: "signed", actor: "Бухгалтер", comment: "Підписано КЕП, очікує реєстрації в ЄРПН" },
  ],
};

// Наказ про звільнення
const tovDismissalOrder: Document = {
  id: "tov-dismissal-001",
  number: "НКЗ-2025-001",
  type: "dismissal-order",
  category: "internal",
  title: "Наказ про звільнення",
  subject: "Звільнення за власним бажанням",
  date: "2025-01-08",
  currency: "UAH",
  employee: {
    name: "Мельник Сергій Вікторович",
    position: "Backend Developer",
    department: "Розробка",
  },
  status: "pending-sign",
  retentionPeriod: 75,
  createdAt: "2025-01-08T09:00:00Z",
  createdBy: "hr",
  updatedAt: "2025-01-08T10:30:00Z",
  history: [
    { id: "h1", timestamp: "2025-01-08T09:00:00Z", action: "created", actor: "HR-менеджер" },
    { id: "h2", timestamp: "2025-01-08T10:30:00Z", action: "status-changed", actor: "Система", comment: "Передано на підпис директору" },
  ],
  files: [{ id: "f-d1", name: "Заява_на_звільнення.pdf", size: 85000, mimeType: "application/pdf", uploadedAt: "2025-01-08T08:30:00Z" }],
};

// Акт розбіжностей - надісланий
const tovDiscrepancyAct: Document = {
  id: "tov-discrepancy-001",
  number: "АР-2025-001",
  type: "discrepancy-act",
  category: "contract",
  title: "Акт розбіжностей до договору ДОГ-ВХІД-2025-001",
  subject: "Зауваження до умов оплати та відповідальності",
  date: "2025-01-10",
  currency: "UAH",
  contractor: {
    id: "c-110",
    name: "ТОВ «Партнер Консалт»",
    code: "12345678",
  },
  status: "sent",
  parentDocumentId: "tov-incoming-contract-1",
  linkedDocuments: ["tov-incoming-contract-1"],
  retentionPeriod: 5,
  createdAt: "2025-01-10T14:00:00Z",
  createdBy: "lawyer",
  updatedAt: "2025-01-10T15:30:00Z",
  history: [
    { id: "h1", timestamp: "2025-01-10T14:00:00Z", action: "created", actor: "Юрист" },
    { id: "h2", timestamp: "2025-01-10T15:30:00Z", action: "sent", actor: "Юрист", comment: "Надіслано контрагенту на розгляд" },
  ],
};

// Банківська виписка ТОВ
const tovBankStatement: Document = {
  id: "tov-bank-stmt-001",
  number: "ВБ-2025-01-09",
  type: "bank-statement",
  category: "bank",
  title: "Виписка Приватбанк за 09.01.2025",
  date: "2025-01-09",
  currency: "UAH",
  status: "archived",
  period: { from: "2025-01-09", to: "2025-01-09", label: "09.01.2025" },
  statementTotals: {
    income: 385000,
    expense: 127500,
    closingBalance: 1507500,
  },
  retentionPeriod: 5,
  createdAt: "2025-01-10T08:00:00Z",
  createdBy: "system",
  updatedAt: "2025-01-10T08:00:00Z",
  history: [
    { id: "h1", timestamp: "2025-01-10T08:00:00Z", action: "created", actor: "API Приватбанк" },
  ],
};

// Акт розбіжностей - відхилений
const tovDiscrepancyActRejected: Document = {
  id: "tov-discrepancy-002",
  number: "АР-2025-002",
  type: "discrepancy-act",
  category: "contract",
  title: "Акт розбіжностей (відхилено)",
  subject: "Пропозиція щодо зміни термінів поставки",
  date: "2025-01-05",
  currency: "UAH",
  contractor: {
    id: "c-111",
    name: "ТОВ «Логістика Плюс»",
    code: "87654321",
  },
  status: "cancelled",
  parentDocumentId: "tov-contract-logistics",
  retentionPeriod: 5,
  createdAt: "2025-01-05T10:00:00Z",
  createdBy: "manager",
  updatedAt: "2025-01-07T16:00:00Z",
  history: [
    { id: "h1", timestamp: "2025-01-05T10:00:00Z", action: "created", actor: "Менеджер" },
    { id: "h2", timestamp: "2025-01-05T11:00:00Z", action: "sent", actor: "Менеджер" },
    { id: "h3", timestamp: "2025-01-07T16:00:00Z", action: "status-changed", actor: "Контрагент", comment: "Відхилено: не погоджуємося на зміну термінів" },
  ],
};

// ============================================
// ДЕМО-ДАНІ ДЛЯ ФІЗОСОБИ
// ============================================

export const individualDemoDocuments: Document[] = [
  {
    id: "doc-ind-001",
    number: "ДОВ-2024-001",
    type: "certificate",
    category: "internal",
    title: "Довідка про доходи",
    date: "2024-11-15",
    currency: "UAH",
    status: "signed",
    retentionPeriod: 3,
    createdAt: "2024-11-15T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-11-15T10:00:00Z",
  },
  {
    id: "doc-ind-002",
    number: "ОР-2024-001",
    type: "rental-agreement",
    category: "contract",
    title: "Договір оренди квартири",
    date: "2024-01-15",
    dueDate: "2025-01-15",
    amount: 15000,
    currency: "UAH",
    contractor: {
      id: "c-201",
      name: "Орендар Петренко В.В.",
      code: "3456789012",
    },
    status: "signed",
    signatures: [
      { id: "s1", signedBy: "Власник", signedAt: "2024-01-15T10:00:00Z", signatureType: "manual", isValid: true },
    ],
    retentionPeriod: 5,
    createdAt: "2024-01-15T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "doc-ind-003",
    number: "КВТ-2024-012",
    type: "receipt",
    category: "fiscal",
    title: "Квитанція за ремонт (податкова знижка)",
    date: "2024-08-20",
    amount: 45000,
    currency: "UAH",
    status: "archived",
    retentionPeriod: 3,
    createdAt: "2024-08-20T14:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-08-25T10:00:00Z",
  },
  {
    id: "doc-ind-004",
    number: "ВИП-2024-001",
    type: "bank-statement",
    category: "bank",
    title: "Виписка Monobank за 2024",
    date: "2024-12-01",
    currency: "UAH",
    status: "signed",
    period: { from: "2024-11-01", to: "2024-11-30", label: "листопад 2024" },
    statementTotals: {
      income: 125000,
      expense: 78500,
      closingBalance: 46500,
    },
    retentionPeriod: 3,
    createdAt: "2024-12-01T09:00:00Z",
    createdBy: "system",
    updatedAt: "2024-12-01T09:00:00Z",
    history: [
      { id: "h1", timestamp: "2024-12-01T09:00:00Z", action: "created", actor: "Monobank API" },
    ],
  },
];

// Додаємо нові ТОВ-документи (Фаза 3)
tovDemoDocuments.push(tovTaxInvoice2, tovDismissalOrder, tovDiscrepancyAct, tovBankStatement, tovDiscrepancyActRejected);

// ============================================
// SLA DEMO DOCUMENTS - 5 документів з різними рівнями критичності
// ============================================

// getDateFromNow is imported from @/config/demoCabinets/helpers

const getDateTimeFromNow = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// SLA DEMO 1: Договір на юристі 12 днів - CRITICAL
const tovSlaContractOverdue: Document = {
  id: "tov-sla-contract-overdue",
  number: "ДОГ-2024-SLA-001",
  type: "contract",
  category: "contract",
  title: "Договір оренди офісу (протерміновано!)",
  subject: "Оренда офісного приміщення 150 м² — потребує термінового погодження",
  date: getDateFromNow(-15),
  dueDate: getDateFromNow(30),
  amount: 180000,
  currency: "UAH",
  contractor: {
    id: "c-sla-1",
    name: "ТОВ «Офіс Центр»",
    code: "11112222",
    verified: true,
    validationStatus: "valid",
  },
  status: "pending-sign",
  currentApprover: "Юрист",
  retentionPeriod: 5,
  createdAt: getDateTimeFromNow(-15),
  createdBy: "manager",
  updatedAt: getDateTimeFromNow(-12),
  files: [{ id: "f-sla-1", name: "Договір_оренди_офіс.pdf", size: 512000, mimeType: "application/pdf", uploadedAt: getDateTimeFromNow(-15) }],
  history: [
    { id: "h1", timestamp: getDateTimeFromNow(-15), action: "created", actor: "Менеджер" },
    { id: "h2", timestamp: getDateTimeFromNow(-12), action: "status-changed", actor: "Система", comment: "Передано на погодження юристу" },
  ],
};

// SLA DEMO 2: HR-наказ 6 днів - CRITICAL для HR
const tovSlaHrWarning: Document = {
  id: "tov-sla-hr-warning",
  number: "НК-2025-SLA-001",
  type: "employment-order",
  category: "internal",
  title: "Наказ про переведення (увага!)",
  employee: {
    name: "Бондаренко Олексій Петрович",
    position: "DevOps Engineer",
    department: "Інфраструктура",
  },
  date: getDateFromNow(-8),
  currency: "UAH",
  status: "pending-sign",
  currentApprover: "HR-менеджер",
  retentionPeriod: 75,
  createdAt: getDateTimeFromNow(-8),
  createdBy: "hr",
  updatedAt: getDateTimeFromNow(-6),
  files: [{ id: "f-sla-hr", name: "Наказ_переведення.pdf", size: 128000, mimeType: "application/pdf", uploadedAt: getDateTimeFromNow(-8) }],
  history: [
    { id: "h1", timestamp: getDateTimeFromNow(-8), action: "created", actor: "HR-менеджер" },
    { id: "h2", timestamp: getDateTimeFromNow(-6), action: "status-changed", actor: "Система", comment: "Передано на погодження HR" },
  ],
};

// SLA DEMO 3: Рахунок на бухгалтері 8 днів - CRITICAL
const tovSlaInvoiceCritical: Document = {
  id: "tov-sla-invoice-critical",
  number: "РАХ-2024-SLA-001",
  type: "invoice",
  category: "primary",
  title: "Рахунок на обладнання (КРИТИЧНО!)",
  subject: "Серверне обладнання для нової інфраструктури",
  date: getDateFromNow(-10),
  dueDate: getDateFromNow(-3), // Прострочений!
  amount: 95000,
  currency: "UAH",
  contractor: {
    id: "c-sla-2",
    name: "ТОВ «Техноімпорт»",
    code: "33334444",
    verified: true,
    validationStatus: "valid",
  },
  status: "pending-sign",
  currentApprover: "Бухгалтер",
  retentionPeriod: 3,
  createdAt: getDateTimeFromNow(-10),
  createdBy: "manager",
  updatedAt: getDateTimeFromNow(-8),
  files: [{ id: "f-sla-inv1", name: "Рахунок_обладнання.pdf", size: 256000, mimeType: "application/pdf", uploadedAt: getDateTimeFromNow(-10) }],
  history: [
    { id: "h1", timestamp: getDateTimeFromNow(-10), action: "created", actor: "Менеджер" },
    { id: "h2", timestamp: getDateTimeFromNow(-8), action: "status-changed", actor: "Система", comment: "Передано на погодження бухгалтеру" },
  ],
};

// SLA DEMO 4: Рахунок 5 днів - WARNING
const tovSlaInvoiceWarning: Document = {
  id: "tov-sla-invoice-warning",
  number: "РАХ-2024-SLA-002",
  type: "invoice",
  category: "primary",
  title: "Рахунок на послуги (увага SLA)",
  subject: "Щомісячні послуги підтримки IT-інфраструктури",
  date: getDateFromNow(-7),
  dueDate: getDateFromNow(7),
  amount: 45000,
  currency: "UAH",
  contractor: {
    id: "c-sla-3",
    name: "ТОВ «Сервіс Про»",
    code: "55556666",
    verified: true,
    validationStatus: "valid",
  },
  status: "pending-sign",
  currentApprover: "Бухгалтер",
  retentionPeriod: 3,
  createdAt: getDateTimeFromNow(-7),
  createdBy: "manager",
  updatedAt: getDateTimeFromNow(-5),
  files: [{ id: "f-sla-inv2", name: "Рахунок_послуги.pdf", size: 128000, mimeType: "application/pdf", uploadedAt: getDateTimeFromNow(-7) }],
  history: [
    { id: "h1", timestamp: getDateTimeFromNow(-7), action: "created", actor: "Менеджер" },
    { id: "h2", timestamp: getDateTimeFromNow(-5), action: "status-changed", actor: "Система", comment: "Передано на погодження бухгалтеру" },
  ],
};

// SLA DEMO 5: Договір на директорі 4 дні - WARNING (юрист вже погодив)
const tovSlaDirectorPending: Document = {
  id: "tov-sla-director-pending",
  number: "ДОГ-2025-SLA-002",
  type: "contract",
  category: "contract",
  title: "Договір партнерства (на директорі)",
  subject: "Стратегічне партнерство з інвестиційним фондом",
  date: getDateFromNow(-5),
  dueDate: getDateFromNow(60),
  amount: 500000,
  currency: "UAH",
  contractor: {
    id: "c-sla-4",
    name: "ТОВ «Партнер Інвест»",
    code: "77778888",
    verified: true,
    validationStatus: "valid",
  },
  status: "pending-sign",
  currentApprover: "Директор",
  retentionPeriod: 5,
  createdAt: getDateTimeFromNow(-6),
  createdBy: "manager",
  updatedAt: getDateTimeFromNow(-4),
  files: [{ id: "f-sla-dir", name: "Договір_партнерство.pdf", size: 384000, mimeType: "application/pdf", uploadedAt: getDateTimeFromNow(-6) }],
  history: [
    { id: "h1", timestamp: getDateTimeFromNow(-6), action: "created", actor: "Менеджер" },
    { id: "h2", timestamp: getDateTimeFromNow(-5), action: "status-changed", actor: "Юрист", comment: "Юридично перевірено, рекомендую до підписання" },
    { id: "h3", timestamp: getDateTimeFromNow(-4), action: "status-changed", actor: "Система", comment: "Передано на погодження директору" },
  ],
};

// Push SLA demo documents
tovDemoDocuments.push(
  tovSlaContractOverdue,
  tovSlaHrWarning,
  tovSlaInvoiceCritical,
  tovSlaInvoiceWarning,
  tovSlaDirectorPending
);

// Додаємо нові Individual-документи (Фаза 3)
individualDemoDocuments.push(
  {
    id: "doc-ind-005",
    number: "КВТ-2024-EDU-001",
    type: "receipt",
    category: "fiscal",
    title: "Квитанція за навчання (податкова знижка)",
    subject: "Оплата за навчання в університеті",
    date: "2024-09-01",
    amount: 28000,
    currency: "UAH",
    status: "archived",
    tags: ["Податкова знижка", "Освіта"],
    retentionPeriod: 3,
    createdAt: "2024-09-01T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-09-01T10:00:00Z",
  },
  {
    id: "doc-ind-006",
    number: "КВТ-2024-MED-001",
    type: "receipt",
    category: "fiscal",
    title: "Квитанція за медичні послуги",
    subject: "Оплата за медичне обстеження",
    date: "2024-10-15",
    amount: 12500,
    currency: "UAH",
    status: "archived",
    tags: ["Податкова знижка", "Медицина"],
    retentionPeriod: 3,
    createdAt: "2024-10-15T14:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-10-15T14:00:00Z",
  },
  {
    id: "doc-ind-007",
    number: "ДОВ-ФО-2024-001",
    type: "power-of-attorney",
    category: "internal",
    title: "Довіреність на представника",
    subject: "Представництво інтересів у податковій",
    date: "2024-12-01",
    dueDate: "2025-12-01",
    currency: "UAH",
    employee: { name: "Коваленко Н.С.", position: "Представник" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2024-12-01T09:00:00Z",
    createdBy: "owner",
    updatedAt: "2024-12-01T09:00:00Z",
  }
);

// ============================================
// УТИЛІТИ
// ============================================

export const getDocumentTypeConfig = (type: DocumentType): DocumentTypeConfig => {
  return documentTypeConfigs[type];
};

export const getDocumentStatusConfig = (status: DocumentFlowStatus): DocumentStatusConfig => {
  return documentStatusConfigs[status];
};

export const formatDocumentAmount = (amount?: number, currency: string = "UAH"): string => {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getRetentionDeadline = (date: string, retentionYears: number): string => {
  const docDate = new Date(date);
  docDate.setFullYear(docDate.getFullYear() + retentionYears);
  return docDate.toISOString().split("T")[0];
};

// Get documents for a specific cabinet
export const getDocumentsForCabinet = (cabinet: { id?: string; type: string; accessMode?: string }): Document[] => {
  // Special case for passive cabinets - show partner documents
  if (cabinet.id === "passive-demo-1" || cabinet.accessMode === "passive") {
    return passiveDemoDocuments;
  }
  
  // Check for specialized demo cabinets (consulting, autorepair, IT, dealer)
  if (cabinet.id && isDemoCabinet(cabinet.id)) {
    return getDemoDocumentsForCabinet(cabinet.id);
  }
  
  switch (cabinet.type) {
    case "fop":
      return fopDemoDocuments;
    case "tov":
      return tovDemoDocuments;
    case "individual":
      return individualDemoDocuments;
    case "fop-group":
      return fopDemoDocuments; // Use FOP docs for group since fopGroupDemoDocuments is summary type
    default:
      return fopDemoDocuments;
  }
};
