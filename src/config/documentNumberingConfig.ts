import type { DocumentType } from "./documentFlowConfig";

// ============= NUMBERING RULE INTERFACES =============

export type YearFormat = "full" | "short" | "none"; // 2025, 25, без року
export type ResetPolicy = "yearly" | "monthly" | "quarterly" | "never";
export type LockAfterStatus = "signed" | "sent" | "created" | "never";

export interface NumberingRule {
  documentType: DocumentType;
  prefix: string;
  includeBranchCode: boolean;
  branchCode?: string;
  yearFormat: YearFormat;
  sequencePadding: number; // 4 = 0001, 5 = 00001, 6 = 000001
  resetPolicy: ResetPolicy;
  startNumber: number;
  currentSequence: number;
  allowManualOverride: boolean;
  lockAfter: LockAfterStatus;
  separator: string; // "-" або "/"
  lastResetDate?: string;
}

export interface NumberingConfig {
  cabinetId: string;
  gaplessNumbering: boolean; // Забороняти пропуски в нумерації
  checkDuplicates: boolean; // Перевіряти унікальність
  rules: NumberingRule[];
}

// ============= DEFAULT NUMBERING RULES =============

const createDefaultRule = (
  documentType: DocumentType,
  prefix: string,
  options: Partial<NumberingRule> = {}
): NumberingRule => ({
  documentType,
  prefix,
  includeBranchCode: false,
  yearFormat: "full",
  sequencePadding: 5,
  resetPolicy: "yearly",
  startNumber: 1,
  currentSequence: 42, // Demo: simulate some existing documents
  allowManualOverride: false,
  lockAfter: "signed",
  separator: "-",
  ...options,
});

export const defaultNumberingRules: NumberingRule[] = [
  // Фінансові документи
  createDefaultRule("invoice", "INV", { currentSequence: 127 }),
  createDefaultRule("act", "ACT", { currentSequence: 89 }),
  createDefaultRule("waybill", "WB", { currentSequence: 54 }),
  createDefaultRule("ttn", "TTN", { currentSequence: 23 }),
  createDefaultRule("tax-invoice", "PN", { sequencePadding: 6, currentSequence: 156 }),
  
  // Договори
  createDefaultRule("contract", "DOG", { resetPolicy: "yearly", currentSequence: 34 }),
  createDefaultRule("rental-agreement", "ARN", { currentSequence: 8 }),
  createDefaultRule("sale-agreement", "KP", { currentSequence: 12 }),
  createDefaultRule("supply-contract", "DST", { currentSequence: 15 }),
  createDefaultRule("fop-service-contract", "GPC", { currentSequence: 45 }),
  
  // HR документи
  createDefaultRule("employment-order", "НК", { prefix: "НК", sequencePadding: 4, currentSequence: 28 }),
  createDefaultRule("dismissal-order", "ЗВ", { prefix: "ЗВ", sequencePadding: 4, currentSequence: 5 }),
  createDefaultRule("vacation-order", "ВД", { prefix: "ВД", sequencePadding: 4, currentSequence: 17 }),
  
  // Внутрішні
  createDefaultRule("power-of-attorney", "DV", { currentSequence: 6 }),
  createDefaultRule("reconciliation", "ZVR", { currentSequence: 11 }),
];

// ============= HELPER FUNCTIONS =============

/**
 * Format year based on selected format
 */
const formatYear = (date: Date, format: YearFormat): string => {
  switch (format) {
    case "full":
      return date.getFullYear().toString();
    case "short":
      return date.getFullYear().toString().slice(-2);
    case "none":
      return "";
  }
};

/**
 * Pad sequence number with zeros
 */
const padSequence = (num: number, padding: number): string => {
  return num.toString().padStart(padding, "0");
};

/**
 * Generate document number based on rule
 */
export const generateDocumentNumber = (
  rule: NumberingRule,
  date: Date = new Date()
): string => {
  const parts: string[] = [];
  
  // Prefix
  parts.push(rule.prefix);
  
  // Branch code (optional)
  if (rule.includeBranchCode && rule.branchCode) {
    parts.push(rule.branchCode);
  }
  
  // Year
  const year = formatYear(date, rule.yearFormat);
  if (year) {
    parts.push(year);
  }
  
  // Sequence number
  parts.push(padSequence(rule.currentSequence + 1, rule.sequencePadding));
  
  return parts.join(rule.separator);
};

/**
 * Generate preview of number format (example)
 */
export const formatNumberPreview = (rule: NumberingRule): string => {
  const parts: string[] = [];
  
  parts.push(rule.prefix);
  
  if (rule.includeBranchCode && rule.branchCode) {
    parts.push(rule.branchCode);
  }
  
  if (rule.yearFormat !== "none") {
    parts.push(rule.yearFormat === "full" ? "2025" : "25");
  }
  
  parts.push(padSequence(42, rule.sequencePadding));
  
  return parts.join(rule.separator);
};

/**
 * Validate document number against rule
 */
export const validateDocumentNumber = (
  number: string,
  rule: NumberingRule
): { isValid: boolean; error?: string } => {
  // Build expected pattern
  let pattern = `^${rule.prefix}`;
  
  if (rule.includeBranchCode && rule.branchCode) {
    pattern += `${rule.separator}[A-Z0-9]+`;
  }
  
  if (rule.yearFormat !== "none") {
    pattern += `${rule.separator}\\d{${rule.yearFormat === "full" ? "4" : "2"}}`;
  }
  
  pattern += `${rule.separator}\\d{${rule.sequencePadding}}$`;
  
  const regex = new RegExp(pattern);
  
  if (!regex.test(number)) {
    return { isValid: false, error: `Номер не відповідає формату: ${formatNumberPreview(rule)}` };
  }
  
  return { isValid: true };
};

/**
 * Get next sequence number considering reset policy
 */
export const getNextSequence = (
  rule: NumberingRule,
  currentDate: Date = new Date()
): number => {
  if (!rule.lastResetDate) {
    return rule.startNumber;
  }
  
  const lastReset = new Date(rule.lastResetDate);
  let shouldReset = false;
  
  switch (rule.resetPolicy) {
    case "yearly":
      shouldReset = lastReset.getFullYear() !== currentDate.getFullYear();
      break;
    case "quarterly":
      const lastQ = Math.floor(lastReset.getMonth() / 3);
      const currentQ = Math.floor(currentDate.getMonth() / 3);
      shouldReset = lastQ !== currentQ || lastReset.getFullYear() !== currentDate.getFullYear();
      break;
    case "monthly":
      shouldReset = lastReset.getMonth() !== currentDate.getMonth() ||
                    lastReset.getFullYear() !== currentDate.getFullYear();
      break;
    case "never":
      shouldReset = false;
      break;
  }
  
  return shouldReset ? rule.startNumber : rule.currentSequence + 1;
};

/**
 * Get rule for document type
 */
export const getRuleForType = (
  rules: NumberingRule[],
  documentType: DocumentType
): NumberingRule | undefined => {
  return rules.find(r => r.documentType === documentType);
};

// ============= DOCUMENT TYPE LABELS =============

export const documentTypeLabels: Record<DocumentType, string> = {
  "invoice": "Рахунок-фактура",
  "act": "Акт виконаних робіт",
  "waybill": "Видаткова накладна",
  "ttn": "Товарно-транспортна накладна",
  "tax-invoice": "Податкова накладна",
  "contract": "Договір",
  "rental-agreement": "Договір оренди",
  "sale-agreement": "Договір купівлі-продажу",
  "supply-contract": "Договір постачання",
  "fop-service-contract": "Договір з ФОП на послуги",
  "employment-order": "Наказ про прийняття",
  "dismissal-order": "Наказ про звільнення",
  "vacation-order": "Наказ про відпустку",
  "power-of-attorney": "Довіреність",
  "reconciliation": "Акт звірки",
  "certificate": "Довідка",
  "order": "Наказ",
  "prro-receipt": "Чек ПРРО/РРО",
  "receipt": "Квитанція",
  "payment-order": "Платіжне доручення",
  "bank-statement": "Виписка банку",
  "discrepancy-act": "Акт розбіжностей",
  "other": "Інший документ",
};

export const yearFormatLabels: Record<YearFormat, string> = {
  "full": "Повний (2025)",
  "short": "Скорочений (25)",
  "none": "Без року",
};

export const resetPolicyLabels: Record<ResetPolicy, string> = {
  "yearly": "Щороку",
  "quarterly": "Щокварталу",
  "monthly": "Щомісяця",
  "never": "Ніколи",
};

export const lockAfterLabels: Record<LockAfterStatus, string> = {
  "signed": "Після підписання",
  "sent": "Після відправки",
  "created": "Одразу після створення",
  "never": "Ніколи (можна змінювати)",
};

// ============= DEMO CONFIG =============

export const getDemoNumberingConfig = (cabinetId: string): NumberingConfig => ({
  cabinetId,
  gaplessNumbering: true,
  checkDuplicates: true,
  rules: defaultNumberingRules,
});
