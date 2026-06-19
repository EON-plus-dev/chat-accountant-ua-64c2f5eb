import type { DocumentType, DocumentIssueType } from "@/config/documentFlowConfig";

// ============================================
// СТОРОНИ ДОКУМЕНТА
// ============================================

export type PartyRole = 
  | "supplier"    // Постачальник
  | "buyer"       // Покупець
  | "lessor"      // Орендодавець
  | "lessee"      // Орендар
  | "executor"    // Виконавець
  | "client"      // Замовник
  | "seller"      // Продавець
  | "principal"   // Довіритель
  // TTN-specific logistics roles
  | "shipper"     // Вантажовідправник
  | "consignee"   // Вантажоотримувач
  | "carrier";    // Перевізник

export type ValidationStatus = "valid" | "pending" | "unknown" | "invalid";
export type ValidationSource = "edr" | "dps" | "manual" | "system";

export interface PartyInfo {
  role: PartyRole;
  name: string;
  code: string;           // ЄДРПОУ/ІПН
  isKnown: boolean;       // Чи є в системі контрагентів
  validationStatus: ValidationStatus;
  validationSource?: ValidationSource;
  iban?: string;
  address?: string;
  isCabinetOwner?: boolean; // Чи є стороною-власником кабінету
}

// ============================================
// КЛЮЧОВІ ДАТИ
// ============================================

export type KeyDateType = 
  | "document"        // Дата документа
  | "due"             // Термін дії
  | "valid-from"      // Дійсний з
  | "valid-until"     // Дійсний до
  | "payment-due"     // Термін оплати
  | "prolongation"    // Дата пролонгації
  | "signed";         // Дата підписання

export interface KeyDate {
  type: KeyDateType;
  date: string;
  label: string;
  isOverdue?: boolean;
  daysUntil?: number;
}

// ============================================
// ФІНАНСОВА ІНФОРМАЦІЯ
// ============================================

export interface FinancialInfo {
  amount: number;
  currency: "UAH" | "USD" | "EUR";
  vat?: number;
  vatIncluded?: boolean;
  paymentTerms?: string;
  paymentDays?: number;
  
  // Курс валюти та еквівалент в гривні
  exchangeRate?: number;        // Курс НБУ на дату документа
  exchangeRateDate?: string;    // Дата курсу
  amountInUAH?: number;         // Сума в UAH (авторозрахунок)
}

// ============================================
// КОМПЛАЄНС
// ============================================

export interface ComplianceInfo {
  kvedMatch: boolean;
  kvedRequired?: string[];
  kvedMissing?: string[];
  licenseRequired?: string[];
  licenseMissing?: string[];
  warnings?: string[];
}

// ============================================
// МЕТАДАНІ АНАЛІЗУ
// ============================================

export interface AnalysisMetadata {
  processedAt: string;
  version: string;
  model?: string;
  confidence: number;
}

// ============================================
// ДЕТАЛІ ВИТЯГУВАННЯ ПОЛІВ
// ============================================

export type ExtractionMethod = 
  | "ocr"           // Оптичне розпізнавання
  | "nlp"           // Обробка природної мови
  | "pattern"       // Регулярний вираз/шаблон
  | "table"         // Витягування з таблиці
  | "manual"        // Ручне введення
  | "lookup";       // Пошук в базі/реєстрі

export interface FieldAlternative {
  value: string;
  confidence: number;
  source: ExtractionMethod;
}

export interface FieldConfidence {
  fieldName: string;           // Назва поля (parties.supplier.name, amount, etc.)
  fieldLabel: string;          // Людиночитана назва
  value: string;               // Витягнуте значення
  confidence: number;          // 0-100%
  method: ExtractionMethod;    // Метод витягування
  alternatives?: FieldAlternative[]; // Альтернативні значення
  needsReview?: boolean;       // Потребує перевірки
  pageNumber?: number;         // Сторінка PDF
  boundingBox?: {              // Координати на сторінці
    x: number; 
    y: number; 
    width: number; 
    height: number;
  };
}

// ============================================
// БАЗОВЕ РЕЗЮМЕ ДОКУМЕНТА
// ============================================

// Import DocumentRisk type for AI-detected risks with suggestions
import type { DocumentRisk } from "@/config/documentFlowConfig";

export interface DocumentSummary {
  id: string;
  documentType: DocumentType;
  confidence: number;
  
  // Сторони
  parties: PartyInfo[];
  
  // Ключові дати
  keyDates: KeyDate[];
  
  // Фінанси
  financials?: FinancialInfo;
  
  // AI-резюме
  /** Чистий бізнес-опис документа (1-2 речення без рекомендацій) */
  description?: string;
  /** Коротке резюме для списків/пошуку (legacy) */
  shortSummary: string;
  fullSummary: string;
  
  // Ключові умови
  keyTerms?: string[];
  
  // Комплаєнс
  compliance: ComplianceInfo;
  
  // Метадані аналізу
  analysis: AnalysisMetadata;
  
  // Деталі витягування полів (Field Confidence Breakdown)
  fieldConfidences?: FieldConfidence[];
  
  // AI-detected risks with actionable suggestions
  risks?: DocumentRisk[];
}

// ============================================
// РОЗШИРЕНІ ТИПИ ДЛЯ ДОГОВОРІВ
// ============================================

export interface ReferencedDocument {
  type: string;
  description: string;
  status: "attached" | "missing" | "pending";
  documentId?: string;
}

export interface Signatory {
  party: string;
  position: string;
  name: string;
  signedAt?: string;
  signatureType?: "kep" | "manual" | "pending";
}

export interface ProlongationInfo {
  type: "auto" | "manual" | "none";
  noticePeriod?: number;
  nextDate?: string;
  condition?: string;
}

// Legal clause types for contracts
export interface PenaltyClause {
  type: "late-payment" | "non-delivery" | "quality" | "other";
  rate: string;           // "0.1% за день"
  maxAmount?: string;     // "не більше 10%"
  description?: string;
}

export interface TerminationConditions {
  noticePeriod: number;       // days
  grounds: string[];          // ["за згодою сторін", "односторонньо"]
  consequences?: string[];    // ["повернення авансу", "компенсація витрат"]
}

export interface DisputeResolution {
  method: "court" | "arbitration" | "mediation" | "negotiation";
  jurisdiction?: string;      // "Господарський суд м. Києва"
  arbitrationBody?: string;   // "МТП"
}

export interface ConfidentialityClause {
  duration: string;           // "5 років після закінчення"
  scope: string[];            // ["комерційна таємниця", "персональні дані"]
}

export interface LiabilityLimitation {
  maxAmount?: string;         // "не перевищує суму договору"
  exclusions?: string[];      // ["навмисні дії", "груба недбалість"]
}

export interface ContractDetails {
  subject: string;
  terms: string[];
  prolongation?: ProlongationInfo;
  referencedDocuments: ReferencedDocument[];
  signatories: Signatory[];
  // Legal clauses
  penalties?: PenaltyClause[];
  termination?: TerminationConditions;
  forceMajeure?: string[];
  disputes?: DisputeResolution;
  confidentiality?: ConfidentialityClause;
  liability?: LiabilityLimitation;
  governingLaw?: string; // "Законодавство України"
}

export interface ContractSummary extends DocumentSummary {
  contract: ContractDetails;
}

// ============================================
// РОЗШИРЕНІ ТИПИ ДЛЯ РАХУНКІВ
// ============================================

export interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface InvoiceDetails {
  items: InvoiceItem[];
  linkedContract?: {
    id: string;
    number: string;
    date: string;
  };
  paymentDueDate: string;
  paymentStatus: "pending" | "partial" | "paid" | "overdue";
}

export interface InvoiceSummary extends DocumentSummary {
  invoice: InvoiceDetails;
}

// ============================================
// РОЗШИРЕНІ ТИПИ ДЛЯ АКТІВ
// ============================================

export interface ActDetails {
  linkedInvoice?: {
    id: string;
    number: string;
    date: string;
  };
  linkedContract?: {
    id: string;
    number: string;
    date: string;
  };
  workDescription: string;
  completionDate: string;
  acceptanceStatus: "accepted" | "pending" | "rejected";
}

export interface ActSummary extends DocumentSummary {
  act: ActDetails;
}

// ============================================
// ЧЕК-ЛИСТ
// ============================================

export type ChecklistItemType =
  | "missing-annex"           // Відсутній додаток
  | "unknown-contractor"      // Невідомий контрагент
  | "contractor-validation"   // Потрібна валідація
  | "kved-mismatch"           // Невідповідність КВЕД
  | "license-required"        // Потрібна ліцензія
  | "missing-signature"       // Відсутній підпис
  | "prolongation-check"      // Перевірка пролонгації
  | "payment-link"            // Зв'язок з оплатою
  | "kudir-entry"             // Запис в КУДіР
  | "linked-contract"         // Прив'язка до договору
  | "tax-invoice"             // Податкова накладна
  | "edo-send"                // Відправка через ЕДО
  | "delivery-confirm"        // Підтвердження доставки
  | "route-missing"           // Відсутній маршрут
  | "reconciliation-sign"     // Підпис акта звірки
  | "attorney-expiring"       // Термін довіреності
  | "fiscal-number"           // Фіскальний номер ПРРО
  | "hr-register"             // Кадровий облік
  | "vacation-calculation"    // Розрахунок відпускних
  | "statement-reconcile";    // Звірка виписки

export type ChecklistPriority = "critical" | "high" | "medium" | "low";
export type ChecklistStatus = "pending" | "in-progress" | "done" | "skipped";
export type ChecklistActionType = "manual" | "auto" | "invite" | "validate" | "navigate" | "upload";

// Action category for semantic grouping
export type ActionCategory = "required" | "recommended" | "automatic";

export interface ChecklistAction {
  type: ChecklistActionType;
  label: string;
  handler?: string;
  targetRoute?: string;
  prefillData?: Record<string, unknown>;
}

export type WorkflowPhase = 'pre-sign' | 'post-sign' | 'post-confirm' | 'archive';

export interface ChecklistItem {
  id: string;
  type: ChecklistItemType;
  priority: ChecklistPriority;
  title: string;
  description: string;
  status: ChecklistStatus;
  action: ChecklistAction;
  dueDate?: string;
  slaHours?: number;
  assignee?: string;
  completedAt?: string;
  completedBy?: string;
  workflowPhase?: WorkflowPhase;
  actionCategory?: ActionCategory; // Semantic grouping category
}

export interface DocumentChecklist {
  documentId: string;
  generatedAt: string;
  items: ChecklistItem[];
  completionPercent: number;
  totalItems: number;
  completedItems: number;
  criticalItems: number;
}

// ============================================
// РЕЄСТРАЦІЯ ДОКУМЕНТА
// ============================================

export type DocumentCategoryType = "primary" | "contract" | "fiscal" | "report" | "bank" | "internal";

export interface DocumentRegistration {
  number: string;
  category: DocumentCategoryType;
  retentionYears: number;
  retentionDeadline: string;
  registeredAt?: string;
  humanVerified?: boolean;
}

// ============================================
// РОЗШИРЕНИЙ РЕЗУЛЬТАТ АНАЛІЗУ
// ============================================

export interface ExtendedAnalysisResult {
  // Базові поля (backward compatible)
  documentType: DocumentType;
  suggestedNumber: string;
  suggestedDate: string;
  contractor?: { name: string; code: string };
  amount?: number;
  summary: string;
  confidence: number;
  parties?: {
    supplier: string;
    supplierCode: string;
    buyer: string;
    buyerCode: string;
  };
  keyTerms?: string[];
  subject?: string;
  currency?: string;
  validUntil?: string;
  
  // Нові поля DIH
  dihSummary?: DocumentSummary | ContractSummary | InvoiceSummary | ActSummary;
  checklist?: DocumentChecklist;
  demoScenarioId?: string;
  
  // Реєстраційні дані
  registration?: DocumentRegistration;
}
