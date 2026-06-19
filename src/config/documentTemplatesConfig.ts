import type { DocumentType } from "./documentFlowConfig";
import { FileText, Receipt, FileCheck, Handshake, Truck, FileBox, Users, Building2, type LucideIcon } from "lucide-react";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { PositionColumn } from "./documentFormSchemas";

// Re-export from partyAttributesLibrary for unified usage
export { 
  detectFieldFromText,
  inferPartyFromContext,
  resolveFieldValue,
  createFieldFromAttribute,
  PARTY_CONFIGS,
  getPartyConfig,
  getPartyAttributes,
  getAttributeById,
  type PartyType,
  type PartyConfig,
  type PartyAttribute,
  type FieldDetectionResult,
  type PartyInferenceResult,
  type FieldResolutionContext,
} from "./partyAttributesLibrary";

// Re-export FieldDataType from templateField for backward compatibility
export type { FieldDataType } from "@/types/templateField";

// ============= FIELD SCHEMA DEFINITIONS =============
export interface FieldSchemaItem {
  label: string;
  dataType: import("@/types/templateField").FieldDataType;
  aiHint: string;
  icon?: string;
}

/**
 * @deprecated Use PARTY_CONFIGS from partyAttributesLibrary instead
 * Cabinet field schema - all available fields from cabinet
 */
export const cabinetFieldSchema: Record<string, FieldSchemaItem> = {
  // Основна інформація
  "cabinet.name": { label: "Назва компанії/ФОП", dataType: "text", aiHint: "Повна юридична назва суб'єкта господарювання", icon: "🏢" },
  "cabinet.shortName": { label: "Скорочена назва", dataType: "text", aiHint: "Скорочена форма назви для документів", icon: "🏢" },
  "cabinet.edrpou": { label: "Код ЄДРПОУ", dataType: "edrpou", aiHint: "8-значний код в Єдиному реєстрі (для ТОВ)", icon: "🔢" },
  "cabinet.ipn": { label: "ІПН/РНОКПП", dataType: "ipn", aiHint: "10-значний ідентифікаційний номер (для ФОП/фіз.осіб)", icon: "🔢" },
  
  // Адреси
  "cabinet.legalAddress": { label: "Юридична адреса", dataType: "address", aiHint: "Офіційна зареєстрована адреса", icon: "📍" },
  "cabinet.factualAddress": { label: "Фактична адреса", dataType: "address", aiHint: "Адреса фактичного розташування", icon: "📍" },
  
  // Банківські реквізити
  "cabinet.iban": { label: "IBAN рахунок", dataType: "iban", aiHint: "Банківський рахунок у форматі UA...", icon: "🏦" },
  "cabinet.bankName": { label: "Назва банку", dataType: "text", aiHint: "Повна назва банку", icon: "🏦" },
  "cabinet.mfo": { label: "МФО банку", dataType: "text", aiHint: "6-значний код банку", icon: "🏦" },
  
  // Контакти
  "cabinet.phone": { label: "Телефон", dataType: "phone", aiHint: "Контактний номер телефону", icon: "📞" },
  "cabinet.email": { label: "Email", dataType: "email", aiHint: "Електронна пошта", icon: "📧" },
  
  // Представник
  "cabinet.director": { label: "Директор/Представник", dataType: "person-name", aiHint: "ПІБ керівника або уповноваженої особи", icon: "👤" },
  "cabinet.directorPosition": { label: "Посада представника", dataType: "text", aiHint: "Посада особи, що підписує документ", icon: "👤" },
  
  // ПДВ
  "cabinet.vatNumber": { label: "ІПН платника ПДВ", dataType: "text", aiHint: "Номер свідоцтва платника ПДВ (12 цифр)", icon: "📄" },
};

/**
 * @deprecated Use PARTY_CONFIGS from partyAttributesLibrary instead
 * Contractor field schema - all available fields from contractor
 */
export const contractorFieldSchema: Record<string, FieldSchemaItem> = {
  "contractor.name": { label: "Назва контрагента", dataType: "text", aiHint: "Назва компанії або ПІБ ФОП контрагента", icon: "🏢" },
  "contractor.code": { label: "Код ЄДРПОУ/ІПН", dataType: "text", aiHint: "Ідентифікаційний код контрагента", icon: "🔢" },
  "contractor.iban": { label: "IBAN контрагента", dataType: "iban", aiHint: "Банківський рахунок контрагента", icon: "🏦" },
  "contractor.bankName": { label: "Банк контрагента", dataType: "text", aiHint: "Назва банку контрагента", icon: "🏦" },
  "contractor.address": { label: "Адреса контрагента", dataType: "address", aiHint: "Юридична адреса контрагента", icon: "📍" },
  "contractor.phone": { label: "Телефон контрагента", dataType: "phone", aiHint: "Контактний телефон", icon: "📞" },
  "contractor.email": { label: "Email контрагента", dataType: "email", aiHint: "Електронна пошта контрагента", icon: "📧" },
  "contractor.director": { label: "Представник контрагента", dataType: "person-name", aiHint: "ПІБ підписанта з боку контрагента", icon: "👤" },
  "contractor.directorPosition": { label: "Посада представника", dataType: "text", aiHint: "Посада особи, що підписує документ", icon: "👤" },
};

// ============= SMART FIELD DETECTION =============
/**
 * @deprecated Use detectFieldFromText from partyAttributesLibrary instead
 */
export interface DetectedFieldType {
  dataType: import("@/types/templateField").FieldDataType;
  suggestedSourceKey?: string;
  confidence: number; // 0-1
}

/**
 * @deprecated Use detectFieldFromText from partyAttributesLibrary instead
 */
export const detectFieldType = (text: string): DetectedFieldType => {
  const cleanText = text.replace(/\s/g, "").trim();
  
  // IBAN (UA + 27 digits)
  if (/^UA\d{27}$/i.test(cleanText)) {
    return { dataType: "iban", suggestedSourceKey: "cabinet.iban", confidence: 0.95 };
  }
  
  // ЄДРПОУ (8 digits)
  if (/^\d{8}$/.test(cleanText)) {
    return { dataType: "edrpou", suggestedSourceKey: "cabinet.edrpou", confidence: 0.85 };
  }
  
  // ІПН (10 digits)
  if (/^\d{10}$/.test(cleanText)) {
    return { dataType: "ipn", suggestedSourceKey: "cabinet.ipn", confidence: 0.85 };
  }
  
  // Phone (+380... or 0...)
  if (/^(\+?\d[\d\s\-()]{9,})$/.test(text.trim())) {
    return { dataType: "phone", confidence: 0.8 };
  }
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) {
    return { dataType: "email", confidence: 0.95 };
  }
  
  // Currency (digits with optional spaces, optional decimal, optional "грн")
  if (/^\d[\d\s]*([.,]\d{1,2})?(\s*грн\.?)?$/i.test(text.trim())) {
    return { dataType: "currency", confidence: 0.7 };
  }
  
  // Date (various formats)
  if (/\d{1,2}[\.\-\/]\d{1,2}[\.\-\/]\d{2,4}/.test(text.trim()) ||
      /«?\d{1,2}»?\s*(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)/i.test(text.trim())) {
    return { dataType: "date", confidence: 0.85 };
  }
  
  // Number (pure digits with optional spaces)
  if (/^\d[\d\s]*$/.test(text.trim()) && text.trim().length <= 10) {
    return { dataType: "number", confidence: 0.5 };
  }
  
  // Default to text
  return { dataType: "text", confidence: 0.3 };
};

// Get all field options grouped by source
export const getFieldOptionsGrouped = () => ({
  cabinet: Object.entries(cabinetFieldSchema).map(([key, value]) => ({
    key,
    ...value,
  })),
  contractor: Object.entries(contractorFieldSchema).map(([key, value]) => ({
    key,
    ...value,
  })),
});

// ============= TEMPLATE VARIABLE (DEPRECATED) =============
/**
 * @deprecated Use UnifiedTemplateField instead
 * Kept for backward compatibility with existing templates
 */
export interface TemplateVariable {
  key: string;
  label: string;
  source: "cabinet" | "contractor" | "manual";
  defaultValue?: string;
}

// ============= FUNCTIONAL METADATA TYPES =============
export type TemplateFeature = 
  | "positions"    // Таблиця позицій
  | "discount"     // Знижка
  | "notes"        // Коментар
  | "signature"    // Підпис
  | "schedule"     // Графік платежів
  | "appendix";    // Додатки

export type TaxType = "vat" | "no-vat" | "both";

export type ComplianceTag = 
  | "legal-verified"   // Юридично перевірено
  | "dstu-compliant";  // ДСТУ

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  category: "system" | "custom";
  description: string;
  icon: LucideIcon;
  previewUrl?: string;
  
  // === UNIFIED FIELDS (NEW - replaces variables) ===
  fields?: UnifiedTemplateField[];
  positionColumns?: PositionColumn[];
  
  // === DEPRECATED - use fields instead ===
  /** @deprecated Use fields instead */
  variables?: TemplateVariable[];
  
  isPopular?: boolean;
  usageCount: number;
  lastModified: string;
  createdFrom?: string; // if custom, source template id
  createdBy?: string;   // user id for custom templates
  
  // AI matching fields
  tags?: string[];           // Semantic tags for AI search
  keywords?: string[];       // Keywords for matching
  useCases?: string[];       // Example use cases
  applicableTo?: ("fop" | "tov")[]; // Applicable cabinet types
  
  // Functional metadata for enterprise badges
  taxType?: TaxType;
  features?: TemplateFeature[];
  compliance?: ComplianceTag[];
}

// System templates
export const systemTemplates: DocumentTemplate[] = [
  {
    id: "sys-invoice-standard",
    name: "Рахунок-фактура",
    type: "invoice",
    category: "system",
    description: "Стандартний рахунок з усіма обов'язковими реквізитами",
    icon: Receipt,
    isPopular: true,
    usageCount: 1247,
    lastModified: "2025-01-01",
    tags: ["рахунок", "оплата", "товар", "послуги"],
    keywords: ["постачальник", "покупець", "сума", "позиції"],
    useCases: ["Виставлення рахунку за товари", "Рахунок за послуги", "Передоплата"],
    taxType: "vat",
    features: ["positions"],
    // NEW: Unified fields (replaces variables)
    fields: [
      // Header
      { key: "documentNumber", label: "Номер рахунку", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "dueDate", label: "Оплатити до", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 3, required: false, width: "half" },
      // Supplier
      { key: "supplierName", label: "Постачальник", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "supplierCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "supplierIban", label: "IBAN", source: "cabinet", sourceKey: "cabinet.iban", dataType: "iban", fieldType: "iban", group: "supplier", order: 3, required: true, width: "full" },
      { key: "supplierBank", label: "Банк", source: "cabinet", sourceKey: "cabinet.bankName", dataType: "text", fieldType: "text", group: "supplier", order: 4, required: false, width: "half" },
      { key: "supplierAddress", label: "Адреса", source: "cabinet", sourceKey: "cabinet.legalAddress", dataType: "address", fieldType: "text", group: "supplier", order: 5, required: false, width: "full" },
      // Buyer
      { key: "buyerName", label: "Покупець", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "buyerCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "buyerIban", label: "IBAN", source: "contractor", sourceKey: "contractor.iban", dataType: "iban", fieldType: "iban", group: "buyer", order: 3, required: false, width: "full" },
      { key: "buyerAddress", label: "Адреса", source: "contractor", sourceKey: "contractor.address", dataType: "address", fieldType: "text", group: "buyer", order: 4, required: false, width: "full" },
      // Positions
      { key: "positions", label: "Позиції", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      // Totals
      { key: "hasVat", label: "З ПДВ", source: "manual", dataType: "text", fieldType: "checkbox", group: "totals", order: 1, required: false, width: "half" },
      { key: "subtotal", label: "Сума без ПДВ", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 2, required: true, width: "third", computeFormula: "SUM(positions.amount)" },
      { key: "vatAmount", label: "ПДВ 20%", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 3, required: false, width: "third", computeFormula: "subtotal * 0.2", showIf: { field: "hasVat", value: true } },
      { key: "total", label: "Разом до сплати", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 4, required: true, width: "third", computeFormula: "subtotal + vatAmount" },
      // Terms
      { key: "paymentTerms", label: "Умови оплати", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 1, required: false, width: "half", options: [
        { value: "prepaid", label: "Передоплата 100%" },
        { value: "postpaid", label: "Післяплата" },
        { value: "partial-50", label: "50% аванс, 50% по факту" },
        { value: "net-7", label: "Протягом 7 днів" },
        { value: "net-30", label: "Протягом 30 днів" },
      ]},
      { key: "notes", label: "Примітки", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 2, required: false, width: "full" },
    ],
    // DEPRECATED: Kept for backward compatibility
    variables: [
      { key: "supplierName", label: "Назва постачальника", source: "cabinet" },
      { key: "supplierCode", label: "ЄДРПОУ/ІПН постачальника", source: "cabinet" },
      { key: "supplierIban", label: "IBAN постачальника", source: "cabinet" },
      { key: "buyerName", label: "Назва покупця", source: "contractor" },
      { key: "buyerCode", label: "ЄДРПОУ/ІПН покупця", source: "contractor" },
      { key: "positions", label: "Позиції", source: "manual" },
    ],
  },
  {
    id: "sys-act-standard",
    name: "Акт виконаних робіт",
    type: "act",
    category: "system",
    description: "Акт приймання-передачі виконаних робіт або послуг",
    icon: FileCheck,
    isPopular: true,
    usageCount: 892,
    lastModified: "2025-01-01",
    tags: ["акт", "роботи", "послуги", "приймання"],
    keywords: ["виконавець", "замовник", "виконані роботи"],
    useCases: ["Закриття робіт за договором", "Приймання послуг"],
    features: ["positions", "signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер акту", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "contractRef", label: "До договору", source: "manual", dataType: "text", fieldType: "contract-ref", group: "header", order: 3, required: true, width: "full", placeholder: "№ договору від дати" },
      { key: "periodStart", label: "Період з", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 4, required: true, width: "half" },
      { key: "periodEnd", label: "Період по", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 5, required: true, width: "half" },
      // Executor
      { key: "executorName", label: "Виконавець", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "executorCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "executorDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Customer
      { key: "customerName", label: "Замовник", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "customerCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "customerDirector", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Positions
      { key: "positions", label: "Перелік виконаних робіт/послуг", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      // Totals
      { key: "total", label: "Загальна вартість", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half", computeFormula: "SUM(positions.amount)" },
      { key: "totalInWords", label: "Сума прописом", source: "computed", dataType: "text", fieldType: "text", group: "totals", order: 2, required: true, width: "full" },
    ],
    variables: [
      { key: "supplierName", label: "Виконавець", source: "cabinet" },
      { key: "buyerName", label: "Замовник", source: "contractor" },
      { key: "positions", label: "Перелік робіт", source: "manual" },
      { key: "contractRef", label: "Посилання на договір", source: "manual" },
    ],
  },
  {
    id: "sys-contract-services",
    name: "Договір на послуги",
    type: "contract",
    category: "system",
    description: "Типовий договір на надання послуг",
    icon: Handshake,
    usageCount: 423,
    lastModified: "2025-01-01",
    tags: ["послуги", "сервіс", "консалтинг", "it", "маркетинг"],
    keywords: ["виконавець", "замовник", "предмет", "вартість"],
    useCases: ["IT-послуги", "Консалтинг", "Маркетингові послуги", "Аутсорс"],
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "city", label: "Місто", source: "cabinet", sourceKey: "cabinet.legalAddress", dataType: "text", fieldType: "text", group: "header", order: 3, required: false, width: "half", defaultValue: "м. Київ" },
      // Executor
      { key: "executorName", label: "Виконавець", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "executorCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "executorIban", label: "IBAN", source: "cabinet", sourceKey: "cabinet.iban", dataType: "iban", fieldType: "iban", group: "supplier", order: 3, required: true, width: "full" },
      { key: "executorDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 4, required: true, width: "half" },
      // Customer
      { key: "customerName", label: "Замовник", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "customerCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "customerIban", label: "IBAN", source: "contractor", sourceKey: "contractor.iban", dataType: "iban", fieldType: "iban", group: "buyer", order: 3, required: false, width: "full" },
      { key: "customerDirector", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 4, required: false, width: "half" },
      // Terms
      { key: "subject", label: "Предмет договору", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full", placeholder: "Опишіть предмет договору..." },
      { key: "price", label: "Вартість послуг", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
      { key: "paymentTerms", label: "Порядок оплати", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 2, required: true, width: "half", options: [
        { value: "prepaid", label: "Передоплата 100%" },
        { value: "postpaid", label: "Післяплата" },
        { value: "partial-50", label: "50% аванс, 50% по факту" },
        { value: "monthly", label: "Щомісячно" },
      ]},
      { key: "duration", label: "Строк дії", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 3, required: true, width: "half", options: [
        { value: "1m", label: "1 місяць" },
        { value: "3m", label: "3 місяці" },
        { value: "6m", label: "6 місяців" },
        { value: "1y", label: "1 рік" },
        { value: "indefinite", label: "Безстроково" },
      ]},
      { key: "validUntil", label: "Дійсний до", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 4, required: false, width: "half" },
    ],
    variables: [
      { key: "supplierName", label: "Виконавець", source: "cabinet" },
      { key: "buyerName", label: "Замовник", source: "contractor" },
      { key: "subject", label: "Предмет договору", source: "manual" },
      { key: "price", label: "Вартість", source: "manual" },
      { key: "duration", label: "Строк дії", source: "manual" },
    ],
  },
  {
    id: "sys-contract-rental",
    name: "Договір оренди",
    type: "rental-agreement",
    category: "system",
    description: "Договір оренди приміщення або обладнання",
    icon: Building2,
    usageCount: 156,
    lastModified: "2025-01-01",
    tags: ["оренда", "нерухомість", "офіс", "приміщення", "склад"],
    keywords: ["орендар", "орендодавець", "орендна плата", "термін"],
    useCases: ["Оренда офісу", "Оренда складу", "Суборенда приміщення", "Оренда обладнання"],
    features: ["schedule", "signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Landlord
      { key: "landlordName", label: "Орендодавець", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "landlordCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "landlordDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Tenant
      { key: "tenantName", label: "Орендар", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "tenantCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "tenantDirector", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Object
      { key: "objectDescription", label: "Об'єкт оренди", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full", placeholder: "Опис об'єкта оренди (адреса, площа, характеристики)" },
      { key: "rentPrice", label: "Орендна плата (грн/міс)", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
      { key: "startDate", label: "Початок оренди", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 2, required: true, width: "half" },
      { key: "endDate", label: "Закінчення оренди", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 3, required: true, width: "half" },
    ],
    variables: [
      { key: "landlord", label: "Орендодавець", source: "cabinet" },
      { key: "tenant", label: "Орендар", source: "contractor" },
      { key: "object", label: "Об'єкт оренди", source: "manual" },
      { key: "rentPrice", label: "Орендна плата", source: "manual" },
    ],
  },
  {
    id: "sys-waybill-standard",
    name: "Видаткова накладна",
    type: "waybill",
    category: "system",
    description: "Накладна на відпуск товарів",
    icon: Truck,
    usageCount: 312,
    lastModified: "2025-01-01",
    tags: ["накладна", "товар", "відвантаження", "склад"],
    keywords: ["постачальник", "отримувач", "товари", "кількість"],
    useCases: ["Відвантаження товарів", "Передача товарів покупцю"],
    taxType: "vat",
    features: ["positions"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер накладної", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Supplier
      { key: "supplierName", label: "Постачальник", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "supplierCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "supplierAddress", label: "Адреса", source: "cabinet", sourceKey: "cabinet.legalAddress", dataType: "address", fieldType: "text", group: "supplier", order: 3, required: false, width: "full" },
      // Receiver
      { key: "receiverName", label: "Отримувач", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "receiverCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "receiverAddress", label: "Адреса доставки", source: "contractor", sourceKey: "contractor.address", dataType: "address", fieldType: "text", group: "buyer", order: 3, required: false, width: "full" },
      // Positions
      { key: "positions", label: "Товари", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      // Totals
      { key: "subtotal", label: "Сума без ПДВ", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "third", computeFormula: "SUM(positions.amount)" },
      { key: "vatAmount", label: "ПДВ 20%", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 2, required: false, width: "third", computeFormula: "subtotal * 0.2" },
      { key: "total", label: "Всього з ПДВ", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 3, required: true, width: "third", computeFormula: "subtotal + vatAmount" },
    ],
    variables: [
      { key: "supplier", label: "Постачальник", source: "cabinet" },
      { key: "buyer", label: "Отримувач", source: "contractor" },
      { key: "goods", label: "Товари", source: "manual" },
    ],
  },
  {
    id: "sys-employment-contract",
    name: "Трудовий договір",
    type: "contract",
    category: "system",
    description: "Договір з працівником (для ТОВ)",
    icon: Users,
    usageCount: 89,
    lastModified: "2025-01-01",
    tags: ["трудовий", "працівник", "зарплата", "кадри"],
    keywords: ["роботодавець", "працівник", "посада", "оклад"],
    useCases: ["Прийняття на роботу", "Оформлення працівника"],
    applicableTo: ["tov"],
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "city", label: "Місто", source: "cabinet", dataType: "text", fieldType: "text", group: "header", order: 3, required: false, width: "half", defaultValue: "м. Київ" },
      // Employer
      { key: "employerName", label: "Роботодавець", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "employerCode", label: "ЄДРПОУ", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "employerDirector", label: "Директор", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Employee
      { key: "employeeName", label: "Працівник (ПІБ)", source: "employee", dataType: "person-name", fieldType: "text", group: "employee", order: 1, required: true, width: "full" },
      { key: "employeeIpn", label: "ІПН", source: "employee", dataType: "ipn", fieldType: "text", group: "employee", order: 2, required: true, width: "half" },
      { key: "employeeAddress", label: "Адреса проживання", source: "employee", dataType: "address", fieldType: "text", group: "employee", order: 3, required: false, width: "full" },
      // Terms
      { key: "position", label: "Посада", source: "manual", dataType: "text", fieldType: "text", group: "terms", order: 1, required: true, width: "half" },
      { key: "startDate", label: "Дата початку роботи", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 2, required: true, width: "half" },
      { key: "probationPeriod", label: "Випробувальний термін", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 3, required: false, width: "half", options: [
        { value: "none", label: "Відсутній" },
        { value: "1m", label: "1 місяць" },
        { value: "3m", label: "3 місяці" },
      ]},
      { key: "workSchedule", label: "Режим роботи", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 4, required: false, width: "half", options: [
        { value: "fulltime", label: "Повний день (8 год)" },
        { value: "parttime", label: "Неповний день" },
        { value: "remote", label: "Дистанційно" },
      ]},
      // Salary
      { key: "salary", label: "Оклад (грн/міс)", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
    ],
    variables: [
      { key: "employer", label: "Роботодавець", source: "cabinet" },
      { key: "employee", label: "Працівник", source: "manual" },
      { key: "position", label: "Посада", source: "manual" },
      { key: "salary", label: "Оклад", source: "manual" },
    ],
  },
  {
    id: "sys-gph-contract",
    name: "Договір ГПХ (ЦПД)",
    type: "contract",
    category: "system",
    description: "Цивільно-правовий договір з фізичною особою",
    icon: Users,
    usageCount: 234,
    lastModified: "2025-01-01",
    tags: ["гпх", "цпд", "фізособа", "підряд", "фріланс"],
    keywords: ["замовник", "виконавець", "винагорода", "роботи"],
    useCases: ["Разові роботи", "Фріланс проект", "Підрядні роботи"],
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "city", label: "Місто", source: "cabinet", dataType: "text", fieldType: "text", group: "header", order: 3, required: false, width: "half", defaultValue: "м. Київ" },
      // Client
      { key: "clientName", label: "Замовник", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "clientCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "clientDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Contractor (individual)
      { key: "contractorName", label: "Виконавець (ФО)", source: "manual", dataType: "person-name", fieldType: "text", group: "buyer", order: 1, required: true, width: "full" },
      { key: "contractorIpn", label: "ІПН", source: "manual", dataType: "ipn", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "contractorAddress", label: "Адреса", source: "manual", dataType: "address", fieldType: "text", group: "buyer", order: 3, required: false, width: "full" },
      // Work description
      { key: "workDescription", label: "Опис робіт/послуг", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full" },
      { key: "deadline", label: "Термін виконання", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 2, required: true, width: "half" },
      // Fee
      { key: "fee", label: "Винагорода (грн)", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
    ],
    variables: [
      { key: "client", label: "Замовник", source: "cabinet" },
      { key: "contractor", label: "Виконавець (ФО)", source: "contractor" },
      { key: "workDescription", label: "Опис робіт", source: "manual" },
      { key: "fee", label: "Винагорода", source: "manual" },
    ],
  },
  {
    id: "sys-reconciliation-act",
    name: "Акт звірки",
    type: "reconciliation",
    category: "system",
    description: "Акт звірки взаєморозрахунків між контрагентами",
    icon: FileBox,
    usageCount: 178,
    lastModified: "2025-01-01",
    tags: ["звірка", "взаєморозрахунки", "баланс", "сальдо"],
    keywords: ["сторона", "період", "заборгованість"],
    useCases: ["Звірка розрахунків", "Закриття періоду"],
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentDate", label: "Дата звірки", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 1, required: true, width: "half" },
      { key: "periodStart", label: "Період з", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "periodEnd", label: "Період по", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 3, required: true, width: "half" },
      // Party 1
      { key: "party1Name", label: "Сторона 1", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "party1Code", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "party1Director", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Party 2
      { key: "party2Name", label: "Сторона 2", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "party2Code", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "party2Director", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Balance
      { key: "balanceAmount", label: "Сума заборгованості", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
      { key: "balanceInFavor", label: "На користь", source: "manual", dataType: "text", fieldType: "select", group: "totals", order: 2, required: true, width: "half", options: [
        { value: "party1", label: "Сторона 1" },
        { value: "party2", label: "Сторона 2" },
        { value: "zero", label: "Заборгованість відсутня" },
      ]},
    ],
    variables: [
      { key: "party1", label: "Сторона 1", source: "cabinet" },
      { key: "party2", label: "Сторона 2", source: "contractor" },
      { key: "period", label: "Період звірки", source: "manual" },
    ],
  },
  {
    id: "sys-ttn-standard",
    name: "Товарно-транспортна накладна",
    type: "ttn",
    category: "system",
    description: "ТТН для перевезення вантажу",
    icon: Truck,
    usageCount: 145,
    lastModified: "2025-01-01",
    tags: ["ттн", "транспорт", "перевезення", "вантаж", "доставка"],
    keywords: ["відправник", "отримувач", "перевізник", "водій"],
    useCases: ["Перевезення товарів", "Доставка вантажу"],
    features: ["positions"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер ТТН", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Sender
      { key: "senderName", label: "Вантажовідправник", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "senderCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "senderAddress", label: "Адреса відправлення", source: "cabinet", sourceKey: "cabinet.legalAddress", dataType: "address", fieldType: "text", group: "supplier", order: 3, required: true, width: "full" },
      // Receiver
      { key: "receiverName", label: "Вантажоотримувач", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "receiverCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "receiverAddress", label: "Адреса доставки", source: "contractor", sourceKey: "contractor.address", dataType: "address", fieldType: "text", group: "buyer", order: 3, required: true, width: "full" },
      // Transport
      { key: "carrierName", label: "Перевізник", source: "manual", dataType: "text", fieldType: "text", group: "transport", order: 1, required: true, width: "full" },
      { key: "vehicleNumber", label: "Номер ТЗ", source: "manual", dataType: "text", fieldType: "text", group: "transport", order: 2, required: true, width: "half" },
      { key: "driverName", label: "Водій", source: "manual", dataType: "person-name", fieldType: "text", group: "transport", order: 3, required: true, width: "half" },
      // Positions
      { key: "positions", label: "Вантаж", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      // Totals
      { key: "totalWeight", label: "Загальна вага (кг)", source: "manual", dataType: "number", fieldType: "number", group: "totals", order: 1, required: true, width: "third" },
      { key: "totalPlaces", label: "Кількість місць", source: "manual", dataType: "number", fieldType: "number", group: "totals", order: 2, required: true, width: "third" },
      { key: "totalValue", label: "Оголошена вартість", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 3, required: false, width: "third", computeFormula: "SUM(positions.amount)" },
    ],
    variables: [
      { key: "sender", label: "Вантажовідправник", source: "cabinet" },
      { key: "receiver", label: "Вантажоотримувач", source: "contractor" },
      { key: "carrier", label: "Перевізник", source: "manual" },
      { key: "driver", label: "Водій", source: "manual" },
      { key: "goods", label: "Вантаж", source: "manual" },
    ],
  },
  {
    id: "sys-supply-contract",
    name: "Договір поставки",
    type: "supply-contract",
    category: "system",
    description: "Договір на поставку товарів",
    icon: Handshake,
    usageCount: 98,
    lastModified: "2025-01-01",
    tags: ["поставка", "товар", "продаж", "купівля", "закупівля"],
    keywords: ["постачальник", "покупець", "доставка", "умови"],
    useCases: ["Закупівля товарів", "Оптові поставки", "Регулярні поставки"],
    taxType: "vat",
    features: ["positions", "schedule"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Supplier
      { key: "supplierName", label: "Постачальник", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "supplierCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "supplierDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Buyer
      { key: "buyerName", label: "Покупець", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "buyerCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "buyerAddress", label: "Адреса доставки", source: "contractor", sourceKey: "contractor.address", dataType: "address", fieldType: "text", group: "buyer", order: 3, required: false, width: "full" },
      // Terms
      { key: "positions", label: "Товари до поставки", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      { key: "deliveryTerms", label: "Умови доставки", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 1, required: true, width: "half", options: [
        { value: "exw", label: "EXW - самовивіз" },
        { value: "dap", label: "DAP - доставка продавцем" },
        { value: "ddp", label: "DDP - включно з митом" },
      ]},
      { key: "paymentTerms", label: "Умови оплати", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 2, required: true, width: "half", options: [
        { value: "prepaid", label: "Передоплата 100%" },
        { value: "postpaid", label: "Післяплата" },
        { value: "partial", label: "Часткова передоплата" },
      ]},
      // Totals
      { key: "total", label: "Загальна вартість", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half", computeFormula: "SUM(positions.amount)" },
    ],
    variables: [
      { key: "supplier", label: "Постачальник", source: "cabinet" },
      { key: "buyer", label: "Покупець", source: "contractor" },
      { key: "goods", label: "Товар", source: "manual" },
      { key: "deliveryTerms", label: "Умови поставки", source: "manual" },
    ],
  },
  {
    id: "sys-fop-contractor-contract",
    name: "Договір з ФОП-підрядником",
    type: "fop-service-contract",
    category: "system",
    description: "Договір на послуги з ФОП",
    icon: Users,
    usageCount: 187,
    lastModified: "2025-01-01",
    tags: ["фоп", "підрядник", "послуги", "аутсорс", "it"],
    keywords: ["замовник", "виконавець", "послуги", "оплата"],
    useCases: ["ФОП-розробник", "ФОП-дизайнер", "IT-аутсорс"],
    taxType: "no-vat",
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Client
      { key: "clientName", label: "Замовник", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "clientCode", label: "ЄДРПОУ", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "clientDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // FOP Contractor
      { key: "fopName", label: "ФОП-Виконавець", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "fopCode", label: "ІПН/РНОКПП", source: "contractor", sourceKey: "contractor.code", dataType: "ipn", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "fopIban", label: "IBAN", source: "contractor", sourceKey: "contractor.iban", dataType: "iban", fieldType: "iban", group: "buyer", order: 3, required: true, width: "full" },
      // Terms
      { key: "serviceDescription", label: "Опис послуг", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full" },
      { key: "paymentTerms", label: "Умови оплати", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 2, required: true, width: "half", options: [
        { value: "monthly", label: "Щомісячно" },
        { value: "per-act", label: "За актом" },
        { value: "prepaid", label: "Передоплата" },
      ]},
      { key: "duration", label: "Термін дії", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 3, required: true, width: "half", options: [
        { value: "1m", label: "1 місяць" },
        { value: "3m", label: "3 місяці" },
        { value: "6m", label: "6 місяців" },
        { value: "1y", label: "1 рік" },
        { value: "indefinite", label: "Безстроково" },
      ]},
      // Payment
      { key: "monthlyFee", label: "Оплата (грн/міс)", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
    ],
    variables: [
      { key: "client", label: "Замовник", source: "cabinet" },
      { key: "fopName", label: "ФОП-виконавець", source: "contractor" },
      { key: "services", label: "Перелік послуг", source: "manual" },
      { key: "monthlyFee", label: "Оплата", source: "manual" },
    ],
  },
  {
    id: "sys-employment-order",
    name: "Наказ про прийняття",
    type: "employment-order",
    category: "system",
    description: "Наказ про зарахування працівника",
    icon: FileText,
    usageCount: 67,
    lastModified: "2025-01-01",
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер наказу", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата наказу", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Company
      { key: "companyName", label: "Підприємство", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "companyCode", label: "ЄДРПОУ", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      // Employee
      { key: "employeeName", label: "ПІБ працівника", source: "employee", dataType: "person-name", fieldType: "text", group: "employee", order: 1, required: true, width: "full" },
      { key: "position", label: "Посада", source: "manual", dataType: "text", fieldType: "text", group: "employee", order: 2, required: true, width: "half" },
      { key: "department", label: "Підрозділ", source: "manual", dataType: "text", fieldType: "text", group: "employee", order: 3, required: false, width: "half" },
      { key: "startDate", label: "Дата початку роботи", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 1, required: true, width: "half" },
      { key: "salary", label: "Оклад", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
    ],
    variables: [
      { key: "companyName", label: "Підприємство", source: "cabinet" },
      { key: "employeeName", label: "ПІБ працівника", source: "manual" },
      { key: "position", label: "Посада", source: "manual" },
      { key: "startDate", label: "Дата початку", source: "manual" },
      { key: "salary", label: "Оклад", source: "manual" },
    ],
  },
  {
    id: "sys-dismissal-order",
    name: "Наказ про звільнення",
    type: "dismissal-order",
    category: "system",
    description: "Наказ про припинення трудових відносин",
    icon: FileText,
    usageCount: 34,
    lastModified: "2025-01-01",
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер наказу", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата наказу", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Company
      { key: "companyName", label: "Підприємство", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      // Employee
      { key: "employeeName", label: "ПІБ працівника", source: "employee", dataType: "person-name", fieldType: "text", group: "employee", order: 1, required: true, width: "full" },
      { key: "position", label: "Посада", source: "manual", dataType: "text", fieldType: "text", group: "employee", order: 2, required: true, width: "half" },
      { key: "dismissalDate", label: "Дата звільнення", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 1, required: true, width: "half" },
      { key: "reason", label: "Підстава звільнення", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 2, required: true, width: "full", options: [
        { value: "own-will", label: "За власним бажанням (ст. 38 КЗпП)" },
        { value: "agreement", label: "За угодою сторін (п.1 ст.36 КЗпП)" },
        { value: "contract-end", label: "Закінчення строку договору (п.2 ст.36 КЗпП)" },
        { value: "reduction", label: "Скорочення штату (п.1 ст.40 КЗпП)" },
      ]},
    ],
    variables: [
      { key: "companyName", label: "Підприємство", source: "cabinet" },
      { key: "employeeName", label: "ПІБ працівника", source: "manual" },
      { key: "dismissalDate", label: "Дата звільнення", source: "manual" },
      { key: "reason", label: "Підстава", source: "manual" },
    ],
  },
  {
    id: "sys-vacation-order",
    name: "Наказ про відпустку",
    type: "vacation-order",
    category: "system",
    description: "Наказ про надання відпустки",
    icon: FileText,
    usageCount: 89,
    lastModified: "2025-01-01",
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер наказу", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата наказу", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Company
      { key: "companyName", label: "Підприємство", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      // Employee
      { key: "employeeName", label: "ПІБ працівника", source: "employee", dataType: "person-name", fieldType: "text", group: "employee", order: 1, required: true, width: "full" },
      { key: "position", label: "Посада", source: "manual", dataType: "text", fieldType: "text", group: "employee", order: 2, required: true, width: "half" },
      // Vacation
      { key: "vacationType", label: "Вид відпустки", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 1, required: true, width: "half", options: [
        { value: "annual", label: "Щорічна основна" },
        { value: "additional", label: "Додаткова" },
        { value: "unpaid", label: "Без збереження зарплати" },
        { value: "study", label: "Навчальна" },
        { value: "maternity", label: "По догляду за дитиною" },
      ]},
      { key: "startDate", label: "Дата початку", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 2, required: true, width: "half" },
      { key: "endDate", label: "Дата закінчення", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 3, required: true, width: "half" },
      { key: "daysCount", label: "Календарних днів", source: "computed", dataType: "number", fieldType: "number", group: "terms", order: 4, required: true, width: "half" },
    ],
    variables: [
      { key: "companyName", label: "Підприємство", source: "cabinet" },
      { key: "employeeName", label: "ПІБ працівника", source: "manual" },
      { key: "vacationType", label: "Вид відпустки", source: "manual" },
      { key: "startDate", label: "Дата початку", source: "manual" },
      { key: "endDate", label: "Дата закінчення", source: "manual" },
    ],
  },
  {
    id: "sys-power-of-attorney",
    name: "Довіреність",
    type: "power-of-attorney",
    category: "system",
    description: "Довіреність на представництво",
    icon: FileBox,
    usageCount: 56,
    lastModified: "2025-01-01",
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер довіреності", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата видачі", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "city", label: "Місто", source: "cabinet", dataType: "text", fieldType: "text", group: "header", order: 3, required: false, width: "half", defaultValue: "м. Київ" },
      // Principal
      { key: "principalName", label: "Довіритель", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "principalCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "principalDirector", label: "Керівник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Agent
      { key: "agentName", label: "Представник (ПІБ)", source: "manual", dataType: "person-name", fieldType: "text", group: "buyer", order: 1, required: true, width: "full" },
      { key: "agentPassport", label: "Паспортні дані", source: "manual", dataType: "text", fieldType: "text", group: "buyer", order: 2, required: true, width: "full" },
      { key: "agentIpn", label: "ІПН", source: "manual", dataType: "ipn", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Powers
      { key: "powers", label: "Повноваження", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full", placeholder: "Опишіть повноваження представника..." },
      { key: "validUntil", label: "Дійсна до", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 2, required: true, width: "half" },
    ],
    variables: [
      { key: "principal", label: "Довіритель", source: "cabinet" },
      { key: "agent", label: "Представник", source: "manual" },
      { key: "powers", label: "Повноваження", source: "manual" },
      { key: "validUntil", label: "Дійсна до", source: "manual" },
    ],
  },
  // === НОВІ ШАБЛОНИ (Phase 3: Розширення контенту) ===
  {
    id: "sys-nda-contract",
    name: "Договір NDA (Конфіденційність)",
    type: "contract",
    category: "system",
    description: "Договір про нерозголошення конфіденційної інформації",
    icon: Handshake,
    usageCount: 156,
    lastModified: "2025-01-01",
    tags: ["nda", "конфіденційність", "нерозголошення", "таємниця", "захист"],
    keywords: ["захист інформації", "секрет", "комерційна таємниця"],
    useCases: ["Захист комерційної таємниці", "Передача конфіденційної інформації", "Співпраця з підрядниками"],
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Disclosing Party
      { key: "disclosingName", label: "Сторона, що розкриває", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "disclosingCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "disclosingDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Receiving Party
      { key: "receivingName", label: "Сторона, що отримує", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "receivingCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "receivingDirector", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Terms
      { key: "confidentialInfo", label: "Тип конфіденційної інформації", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full", placeholder: "Опишіть що вважається конфіденційною інформацією..." },
      { key: "duration", label: "Термін дії зобов'язань", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 2, required: true, width: "half", options: [
        { value: "1y", label: "1 рік" },
        { value: "3y", label: "3 роки" },
        { value: "5y", label: "5 років" },
        { value: "indefinite", label: "Безстроково" },
      ]},
      { key: "penalty", label: "Штрафні санкції (грн)", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: false, width: "half" },
    ],
    variables: [
      { key: "disclosingParty", label: "Сторона, що розкриває", source: "cabinet" },
      { key: "receivingParty", label: "Сторона, що отримує", source: "contractor" },
      { key: "confidentialInfo", label: "Тип конфіденційної інформації", source: "manual" },
      { key: "duration", label: "Термін дії", source: "manual" },
      { key: "penalty", label: "Штрафні санкції", source: "manual" },
    ],
  },
  {
    id: "sys-act-acceptance",
    name: "Акт приймання-передачі",
    type: "act",
    category: "system",
    description: "Акт приймання-передачі майна, обладнання або товарів",
    icon: FileCheck,
    usageCount: 234,
    lastModified: "2025-01-01",
    tags: ["передача", "приймання", "майно", "обладнання", "товар"],
    keywords: ["приймаюча сторона", "передаюча сторона", "стан майна"],
    useCases: ["Передача обладнання", "Передача автомобіля", "Передача офісної техніки"],
    features: ["positions", "signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер акту", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Transferor
      { key: "transferorName", label: "Передаюча сторона", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "transferorCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "transferorDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Transferee
      { key: "transfereeName", label: "Приймаюча сторона", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "transfereeCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "transfereeDirector", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Object
      { key: "positions", label: "Перелік майна/обладнання", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      { key: "condition", label: "Стан майна", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 1, required: true, width: "half", options: [
        { value: "new", label: "Новий" },
        { value: "good", label: "Справний" },
        { value: "used", label: "Б/в, робочий" },
        { value: "damaged", label: "Пошкоджений" },
      ]},
      { key: "total", label: "Загальна вартість", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half", computeFormula: "SUM(positions.amount)" },
    ],
    variables: [
      { key: "transferor", label: "Передаюча сторона", source: "cabinet" },
      { key: "transferee", label: "Приймаюча сторона", source: "contractor" },
      { key: "property", label: "Об'єкт передачі", source: "manual" },
      { key: "condition", label: "Стан майна", source: "manual" },
      { key: "value", label: "Вартість", source: "manual" },
    ],
  },
  {
    id: "sys-addendum-contract",
    name: "Додаткова угода",
    type: "contract",
    category: "system",
    description: "Додаткова угода до існуючого договору",
    icon: Handshake,
    usageCount: 178,
    lastModified: "2025-01-01",
    tags: ["додаткова угода", "зміни", "пролонгація", "корегування"],
    keywords: ["зміна умов", "продовження договору", "коригування ціни"],
    useCases: ["Пролонгація договору", "Зміна ціни", "Зміна предмету договору", "Додаткові роботи"],
    features: ["signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер додаткової угоди", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "originalContract", label: "До договору №", source: "manual", dataType: "text", fieldType: "contract-ref", group: "header", order: 3, required: true, width: "full", placeholder: "Номер та дата основного договору" },
      // Party 1
      { key: "party1Name", label: "Сторона 1", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "party1Code", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "party1Director", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Party 2
      { key: "party2Name", label: "Сторона 2", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "party2Code", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "party2Director", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Changes
      { key: "changes", label: "Зміни до договору", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full", placeholder: "Опишіть зміни, що вносяться до договору..." },
      { key: "effectiveDate", label: "Набуває чинності з", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 2, required: true, width: "half" },
    ],
    variables: [
      { key: "party1", label: "Сторона 1", source: "cabinet" },
      { key: "party2", label: "Сторона 2", source: "contractor" },
      { key: "originalContract", label: "Номер основного договору", source: "manual" },
      { key: "changes", label: "Зміни до договору", source: "manual" },
      { key: "effectiveDate", label: "Дата набуття чинності", source: "manual" },
    ],
  },
  {
    id: "sys-commission-contract",
    name: "Договір комісії",
    type: "contract",
    category: "system",
    description: "Договір комісії на продаж товарів/послуг",
    icon: Handshake,
    usageCount: 67,
    lastModified: "2025-01-01",
    tags: ["комісія", "посередник", "торгівля", "агент"],
    keywords: ["комітент", "комісіонер", "винагорода", "товар"],
    useCases: ["Продаж товарів через посередника", "Торгові агенти", "Реалізація продукції"],
    features: ["positions", "signature"],
    // NEW: Unified fields
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Principal (Комітент)
      { key: "principalName", label: "Комітент", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "principalCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "principalDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 3, required: true, width: "half" },
      // Agent (Комісіонер)
      { key: "agentName", label: "Комісіонер", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "agentCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "agentDirector", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 3, required: false, width: "half" },
      // Goods
      { key: "positions", label: "Товар для реалізації", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      // Terms
      { key: "commissionType", label: "Тип комісії", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 1, required: true, width: "half", options: [
        { value: "percent", label: "% від продажу" },
        { value: "fixed", label: "Фіксована сума" },
      ]},
      { key: "commissionRate", label: "Розмір комісії", source: "manual", dataType: "number", fieldType: "number", group: "totals", order: 1, required: true, width: "half", placeholder: "% або грн" },
      { key: "terms", label: "Умови реалізації", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 2, required: false, width: "full" },
    ],
    variables: [
      { key: "principal", label: "Комітент", source: "cabinet" },
      { key: "agent", label: "Комісіонер", source: "contractor" },
      { key: "goods", label: "Товар/Послуга", source: "manual" },
      { key: "commission", label: "Комісійна винагорода", source: "manual" },
      { key: "terms", label: "Умови реалізації", source: "manual" },
    ],
  },
];

// Demo custom templates (per cabinet) - with full UnifiedTemplateField structure
export const demoCustomTemplates: DocumentTemplate[] = [
  {
    id: "custom-it-invoice",
    name: "Рахунок IT-послуги",
    type: "invoice",
    category: "custom",
    description: "Рахунок для IT-проєктів з погодинною оплатою та milestone",
    icon: Receipt,
    usageCount: 45,
    lastModified: "2026-01-15",
    createdFrom: "sys-invoice-standard",
    tags: ["it", "погодинна", "проєкт", "milestone", "freelance"],
    keywords: ["ставка", "години", "етап", "розробка"],
    useCases: ["Рахунок за IT-розробку", "Оплата по milestone", "Freelance invoice"],
    taxType: "no-vat",
    features: ["positions"],
    fields: [
      // Header
      { key: "documentNumber", label: "Номер рахунку", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      // Supplier (cabinet)
      { key: "supplierName", label: "Виконавець", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "supplierCode", label: "ІПН", source: "cabinet", sourceKey: "cabinet.ipn", dataType: "ipn", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "supplierIban", label: "IBAN", source: "cabinet", sourceKey: "cabinet.iban", dataType: "iban", fieldType: "iban", group: "supplier", order: 3, required: true, width: "full" },
      { key: "supplierBank", label: "Банк", source: "cabinet", sourceKey: "cabinet.bankName", dataType: "text", fieldType: "text", group: "supplier", order: 4, required: false, width: "half" },
      // Buyer (contractor)
      { key: "buyerName", label: "Замовник", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "buyerCode", label: "ЄДРПОУ", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      // Project-specific (manual)
      { key: "projectName", label: "Назва проєкту", source: "manual", dataType: "text", fieldType: "text", group: "terms", order: 1, required: true, width: "full", placeholder: "Наприклад: Розробка CRM-системи" },
      { key: "milestone", label: "Етап/Milestone", source: "manual", dataType: "text", fieldType: "text", group: "terms", order: 2, required: false, width: "half", placeholder: "Backend API v2.0" },
      { key: "periodStart", label: "Період робіт з", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 3, required: true, width: "half" },
      { key: "periodEnd", label: "Період робіт по", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 4, required: true, width: "half" },
      // Positions
      { key: "positions", label: "Виконані роботи", source: "manual", dataType: "text", fieldType: "positions", group: "positions", order: 1, required: true, width: "full" },
      // Totals (computed)
      { key: "total", label: "Разом до сплати", source: "computed", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half", computeFormula: "SUM(positions.amount)" },
      // Payment terms
      { key: "dueDate", label: "Оплатити до", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 5, required: true, width: "half" },
      { key: "contractRef", label: "Договір-підстава", source: "manual", dataType: "text", fieldType: "contract-ref", group: "terms", order: 6, required: false, width: "full", placeholder: "№ договору від дати" },
      { key: "notes", label: "Примітки", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 7, required: false, width: "full" },
    ] as UnifiedTemplateField[],
    positionColumns: [
      { key: "name", label: "Опис робіт", width: "40%", type: "text", required: true },
      { key: "quantity", label: "Годин", width: "12%", type: "number", required: true },
      { key: "unit", label: "Од.", width: "8%", type: "text", defaultValue: "год" },
      { key: "price", label: "Ставка, грн", width: "18%", type: "currency", required: true },
      { key: "amount", label: "Сума, грн", width: "22%", type: "currency", computed: true },
    ] as PositionColumn[],
  },
  {
    id: "custom-marketing-contract",
    name: "Договір маркетинг",
    type: "contract",
    category: "custom",
    description: "Договір на маркетингові послуги з KPI та рекламним бюджетом",
    icon: Handshake,
    usageCount: 12,
    lastModified: "2026-01-20",
    createdFrom: "sys-contract-services",
    tags: ["маркетинг", "smm", "реклама", "kpi", "digital"],
    keywords: ["таргет", "соцмережі", "бюджет", "конверсія", "ліди"],
    useCases: ["SMM-послуги", "Digital-маркетинг", "Таргетована реклама"],
    features: ["signature"],
    fields: [
      // Header
      { key: "documentNumber", label: "Номер договору", source: "computed", dataType: "text", fieldType: "text", group: "header", order: 1, required: true, width: "half" },
      { key: "documentDate", label: "Дата укладання", source: "manual", dataType: "date", fieldType: "date", group: "header", order: 2, required: true, width: "half" },
      { key: "city", label: "Місто", source: "cabinet", dataType: "text", fieldType: "text", group: "header", order: 3, required: false, width: "half", defaultValue: "м. Київ" },
      // Agency (cabinet as Executor)
      { key: "agencyName", label: "Агенція (Виконавець)", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", fieldType: "text", group: "supplier", order: 1, required: true, width: "full" },
      { key: "agencyCode", label: "ЄДРПОУ/ІПН", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", fieldType: "text", group: "supplier", order: 2, required: true, width: "half" },
      { key: "agencyIban", label: "IBAN", source: "cabinet", sourceKey: "cabinet.iban", dataType: "iban", fieldType: "iban", group: "supplier", order: 3, required: true, width: "full" },
      { key: "agencyDirector", label: "Представник", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", fieldType: "text", group: "supplier", order: 4, required: true, width: "half" },
      // Client (contractor as Customer)
      { key: "clientName", label: "Клієнт (Замовник)", source: "contractor", sourceKey: "contractor.name", dataType: "text", fieldType: "combobox", group: "buyer", order: 1, required: true, width: "full" },
      { key: "clientCode", label: "ЄДРПОУ/ІПН", source: "contractor", sourceKey: "contractor.code", dataType: "text", fieldType: "text", group: "buyer", order: 2, required: true, width: "half" },
      { key: "clientIban", label: "IBAN", source: "contractor", sourceKey: "contractor.iban", dataType: "iban", fieldType: "iban", group: "buyer", order: 3, required: false, width: "full" },
      { key: "clientDirector", label: "Представник", source: "contractor", sourceKey: "contractor.director", dataType: "person-name", fieldType: "text", group: "buyer", order: 4, required: false, width: "half" },
      // Marketing-specific (manual)
      { key: "services", label: "Перелік послуг", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 1, required: true, width: "full", placeholder: "SMM-стратегія, контент, таргет..." },
      { key: "campaignGoals", label: "Цілі кампанії (KPI)", source: "manual", dataType: "text", fieldType: "textarea", group: "terms", order: 2, required: true, width: "full", placeholder: "Охоплення +50%, 5000 підписників..." },
      // Financial
      { key: "monthlyFee", label: "Абонплата (грн/міс)", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 1, required: true, width: "half" },
      { key: "adBudget", label: "Рекламний бюджет (грн/міс)", source: "manual", dataType: "currency", fieldType: "currency", group: "totals", order: 2, required: true, width: "half" },
      { key: "bonusTerms", label: "Бонус за KPI", source: "manual", dataType: "text", fieldType: "text", group: "totals", order: 3, required: false, width: "full", placeholder: "10% від бюджету при перевиконанні" },
      // Duration
      { key: "startDate", label: "Дата початку", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 3, required: true, width: "half" },
      { key: "endDate", label: "Дата завершення", source: "manual", dataType: "date", fieldType: "date", group: "terms", order: 4, required: true, width: "half" },
      { key: "reportingSchedule", label: "Графік звітності", source: "manual", dataType: "text", fieldType: "select", group: "terms", order: 5, required: false, width: "half", options: [
        { value: "weekly", label: "Щотижнево" },
        { value: "biweekly", label: "Раз на 2 тижні" },
        { value: "monthly", label: "Щомісячно" },
      ]},
    ] as UnifiedTemplateField[],
  },
];

// ============= CENTRALIZED TEMPLATE ACCESS =============

/**
 * Get stored custom templates from localStorage (demo mode)
 */
const getStoredCustomTemplates = (): DocumentTemplate[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('customTemplates');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

/**
 * Get ALL templates (system + demo custom + user stored)
 * Single source of truth for template access
 */
export const getAllTemplates = (): DocumentTemplate[] => 
  [...systemTemplates, ...demoCustomTemplates, ...getStoredCustomTemplates()];

/**
 * Get template by ID from all sources
 */
export const getTemplateById = (id: string): DocumentTemplate | undefined =>
  getAllTemplates().find(t => t.id === id);

/**
 * Get templates filtered by document type
 */
export const getTemplatesByType = (type: DocumentType): DocumentTemplate[] =>
  getAllTemplates().filter(t => t.type === type);

/**
 * Add custom template to localStorage (demo mode)
 */
export const addCustomTemplate = (template: DocumentTemplate): void => {
  const stored = getStoredCustomTemplates();
  // Remove if exists (for updates)
  const filtered = stored.filter(t => t.id !== template.id);
  filtered.push(template);
  localStorage.setItem('customTemplates', JSON.stringify(filtered));
};

/**
 * Remove custom template from localStorage
 */
export const removeCustomTemplate = (templateId: string): void => {
  const stored = getStoredCustomTemplates();
  const filtered = stored.filter(t => t.id !== templateId);
  localStorage.setItem('customTemplates', JSON.stringify(filtered));
};

// Get templates for cabinet (legacy API - kept for compatibility)
export const getTemplatesForCabinet = (cabinetId: string): { system: DocumentTemplate[]; custom: DocumentTemplate[] } => {
  // In real app, custom templates would be fetched from DB based on cabinetId
  return {
    system: systemTemplates,
    custom: [...demoCustomTemplates, ...getStoredCustomTemplates()],
  };
};

// Template type filters
export const templateTypeFilters = [
  { id: "all", label: "Всі типи" },
  { id: "invoice", label: "Рахунки" },
  { id: "act", label: "Акти" },
  { id: "contract", label: "Договори" },
  { id: "waybill", label: "Накладні" },
  { id: "other", label: "Інші" },
] as const;

export type TemplateTypeFilter = typeof templateTypeFilters[number]["id"];

// Demo document texts for template creation wizard
export interface DemoDocumentText {
  id: string;
  name: string;
  text: string;
  suggestedName: string;
  detectedFields: {
    key: string;
    label: string;
    originalText: string;
    source: "cabinet" | "contractor" | "manual" | "computed";
    sourceKey?: string;
    group?: string;
    dataType: import("@/types/templateField").FieldDataType;
    aiHint?: string;
    position?: { start: number; end: number };
  }[];
}

export const demoDocumentTexts: DemoDocumentText[] = [
  {
    id: "demo-it-contract",
    name: "Договір IT-послуги",
    suggestedName: "Договір IT-послуги",
    text: `<h2 style="text-align:center">ДОГОВІР №[ДОГ-2025-001]</h2>
<p style="text-align:center"><em>на надання IT-послуг</em></p>
<p style="text-align:center">м. Київ&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;«[15]» [січня] 2025 р.</p>
<p><strong>[Назва виконавця]</strong>, код ЄДРПОУ <strong>[ЄДРПОУ виконавця]</strong>, в особі директора <strong>[Директор виконавця]</strong>, що діє на підставі Статуту, (надалі&nbsp;– "Виконавець"), з однієї сторони, та</p>
<p><strong>[Назва замовника]</strong>, код <strong>[ІПН замовника]</strong>, (надалі&nbsp;– "Замовник"), з іншої сторони,</p>
<p>уклали цей Договір про наступне:</p>
<h3>1. ПРЕДМЕТ ДОГОВОРУ</h3>
<p>1.1. Виконавець зобов'язується надати Замовнику послуги з <strong>[розробки веб-додатку]</strong>, а Замовник зобов'язується прийняти та оплатити надані послуги.</p>
<h3>2. ВАРТІСТЬ ПОСЛУГ ТА ПОРЯДОК РОЗРАХУНКІВ</h3>
<p>2.1. Загальна вартість послуг за цим Договором складає <strong>[75 000] грн</strong>.</p>
<p>2.2. Оплата здійснюється у наступному порядку:</p>
<ul>
<li>Аванс <strong>[50]%</strong>&nbsp;– протягом 3 днів з моменту підписання.</li>
<li>Решта <strong>[50]%</strong>&nbsp;– після підписання Акту виконаних робіт.</li>
</ul>
<h3>3. СТРОКИ ВИКОНАННЯ</h3>
<p>3.1. Початок робіт: <strong>[20 січня 2025 р.]</strong></p>
<p>3.2. Завершення робіт: <strong>[20 лютого 2025 р.]</strong></p>
<h3>4. РЕКВІЗИТИ СТОРІН</h3>
<table style="width:100%; border-collapse:collapse">
<thead><tr><th style="text-align:left; padding:6px; border-bottom:2px solid #333; width:50%">ВИКОНАВЕЦЬ</th><th style="text-align:left; padding:6px; border-bottom:2px solid #333; width:50%">ЗАМОВНИК</th></tr></thead>
<tbody>
<tr><td style="padding:4px 6px">[Назва виконавця]</td><td style="padding:4px 6px">[Назва замовника]</td></tr>
<tr><td style="padding:4px 6px">Код ЄДРПОУ: [ЄДРПОУ виконавця]</td><td style="padding:4px 6px">ІПН: [ІПН замовника]</td></tr>
<tr><td style="padding:4px 6px">IBAN: [IBAN виконавця]</td><td style="padding:4px 6px">IBAN: [IBAN замовника]</td></tr>
<tr><td style="padding:12px 6px 4px">_______________ / [Директор виконавця] /</td><td style="padding:12px 6px 4px">_______________ / [Представник замовника] /</td></tr>
</tbody>
</table>`,
    detectedFields: [
      { key: "doc_number", label: "Номер договору", originalText: "ДОГ-2025-001", source: "manual", dataType: "text", aiHint: "Унікальний номер договору" },
      { key: "day", label: "День", originalText: "15", source: "manual", dataType: "number" },
      { key: "month", label: "Місяць", originalText: "січня", source: "manual", dataType: "text" },
      { key: "company_name", label: "Назва виконавця", originalText: "Назва виконавця", source: "cabinet", sourceKey: "cabinet.name", dataType: "text", aiHint: "Повна юридична назва компанії-виконавця" },
      { key: "company_code", label: "ЄДРПОУ виконавця", originalText: "ЄДРПОУ виконавця", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou", aiHint: "8-значний код ЄДРПОУ компанії-виконавця" },
      { key: "director_name", label: "Директор виконавця", originalText: "Директор виконавця", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name", aiHint: "ПІБ директора компанії-виконавця" },
      { key: "contractor_name", label: "Назва замовника", originalText: "Назва замовника", source: "contractor", sourceKey: "contractor.name", dataType: "text", aiHint: "Назва контрагента-замовника" },
      { key: "contractor_code", label: "ІПН замовника", originalText: "ІПН замовника", source: "contractor", sourceKey: "contractor.code", dataType: "ipn", aiHint: "Ідентифікаційний код контрагента-замовника" },
      { key: "contractor_iban", label: "IBAN замовника", originalText: "IBAN замовника", source: "contractor", sourceKey: "contractor.iban", dataType: "iban", aiHint: "Банківський рахунок замовника" },
      { key: "company_iban", label: "IBAN виконавця", originalText: "IBAN виконавця", source: "cabinet", sourceKey: "cabinet.iban", dataType: "iban", aiHint: "Банківський рахунок виконавця" },
      { key: "contractor_rep", label: "Представник замовника", originalText: "Представник замовника", source: "contractor", sourceKey: "contractor.representative", dataType: "person-name", aiHint: "ПІБ представника замовника" },
      { key: "service_description", label: "Опис послуг", originalText: "розробки веб-додатку", source: "computed", group: "positions", dataType: "text", aiHint: "Детальний опис послуг за договором" },
      { key: "total_amount", label: "Сума договору", originalText: "75 000", source: "computed", group: "positions", dataType: "currency", aiHint: "Загальна вартість послуг у гривнях" },
      { key: "advance_percent", label: "% авансу", originalText: "50", source: "manual", dataType: "number" },
      { key: "final_percent", label: "% фіналу", originalText: "50", source: "manual", dataType: "number" },
      { key: "start_date", label: "Дата початку", originalText: "20 січня 2025 р.", source: "manual", dataType: "date", aiHint: "Дата початку виконання робіт" },
      { key: "end_date", label: "Дата завершення", originalText: "20 лютого 2025 р.", source: "manual", dataType: "date", aiHint: "Дата завершення виконання робіт" },
    ],
  },
  // Custom IT Invoice demo text
  {
    id: "custom-it-invoice-text",
    name: "Рахунок IT-послуги",
    suggestedName: "Рахунок IT-послуги",
    text: `<h2 style="text-align:center">РАХУНОК НА ОПЛАТУ</h2>
<p style="text-align:center"><strong>№ [РАХ-IT-2026-001]</strong> від <strong>[02 лютого 2026 р.]</strong></p>
<h3>ВИКОНАВЕЦЬ:</h3>
<p><strong>[Назва виконавця]</strong><br>ІПН: <strong>[ІПН виконавця]</strong><br>IBAN: [IBAN виконавця]<br>Банк: [Банк виконавця]</p>
<h3>ЗАМОВНИК:</h3>
<p><strong>[Назва замовника]</strong><br>ЄДРПОУ: <strong>[ЄДРПОУ замовника]</strong></p>
<p>Проєкт: <strong>[Розробка CRM-системи]</strong><br>Етап: <strong>[Backend API v2.0]</strong><br>Період робіт: <strong>[01.01.2026]</strong> – <strong>[31.01.2026]</strong></p>
<table style="width:100%; border-collapse:collapse">
<thead>
<tr style="border-bottom:2px solid #333">
<th style="text-align:left; padding:6px; width:5%">№</th>
<th style="text-align:left; padding:6px; width:45%">Опис робіт</th>
<th style="text-align:center; padding:6px; width:10%">Год.</th>
<th style="text-align:right; padding:6px; width:18%">Ставка, грн</th>
<th style="text-align:right; padding:6px; width:22%">Сума, грн</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid #ddd"><td style="padding:4px 6px">1</td><td style="padding:4px 6px">Розробка API endpoints</td><td style="text-align:center; padding:4px 6px">80</td><td style="text-align:right; padding:4px 6px">1 000,00</td><td style="text-align:right; padding:4px 6px">80 000,00</td></tr>
<tr style="border-bottom:1px solid #ddd"><td style="padding:4px 6px">2</td><td style="padding:4px 6px">Code review</td><td style="text-align:center; padding:4px 6px">10</td><td style="text-align:right; padding:4px 6px">1 000,00</td><td style="text-align:right; padding:4px 6px">10 000,00</td></tr>
<tr style="border-bottom:1px solid #ddd"><td style="padding:4px 6px">3</td><td style="padding:4px 6px">Тестування та документування</td><td style="text-align:center; padding:4px 6px">10</td><td style="text-align:right; padding:4px 6px">800,00</td><td style="text-align:right; padding:4px 6px">8 000,00</td></tr>
</tbody>
</table>
<p style="text-align:right; margin-top:12px"><strong>РАЗОМ ДО СПЛАТИ: [98 000,00 грн]</strong></p>
<p style="text-align:right"><em>(Дев'яносто вісім тисяч гривень 00 копійок)</em></p>
<p>Оплатити до: <strong>[10.02.2026]</strong><br>Підстава: [Договір IT-2025-012 від 01.12.2025]</p>
<p style="margin-top:24px">Виконавець: _______________ / <strong>[Представник виконавця]</strong> /</p>`,
    detectedFields: [
      { key: "documentNumber", label: "Номер рахунку", originalText: "РАХ-IT-2026-001", source: "computed", dataType: "text", aiHint: "Автоматично генерований номер рахунку" },
      { key: "documentDate", label: "Дата", originalText: "02 лютого 2026 р.", source: "manual", dataType: "date" },
      { key: "supplierName", label: "Назва виконавця", originalText: "Назва виконавця", source: "cabinet", sourceKey: "cabinet.name", dataType: "text" },
      { key: "supplierCode", label: "ІПН виконавця", originalText: "ІПН виконавця", source: "cabinet", sourceKey: "cabinet.ipn", dataType: "ipn" },
      { key: "supplierIban", label: "IBAN виконавця", originalText: "IBAN виконавця", source: "cabinet", sourceKey: "cabinet.iban", dataType: "iban" },
      { key: "supplierBank", label: "Банк виконавця", originalText: "Банк виконавця", source: "cabinet", sourceKey: "cabinet.bankName", dataType: "text" },
      { key: "supplierRep", label: "Представник виконавця", originalText: "Представник виконавця", source: "cabinet", sourceKey: "cabinet.representative", dataType: "person-name" },
      { key: "buyerName", label: "Назва замовника", originalText: "Назва замовника", source: "contractor", sourceKey: "contractor.name", dataType: "text" },
      { key: "buyerCode", label: "ЄДРПОУ замовника", originalText: "ЄДРПОУ замовника", source: "contractor", sourceKey: "contractor.code", dataType: "edrpou" },
      { key: "projectName", label: "Назва проєкту", originalText: "Розробка CRM-системи", source: "manual", dataType: "text" },
      { key: "milestone", label: "Етап/Milestone", originalText: "Backend API v2.0", source: "manual", dataType: "text" },
      { key: "periodStart", label: "Період робіт з", originalText: "01.01.2026", source: "manual", dataType: "date" },
      { key: "periodEnd", label: "Період робіт по", originalText: "31.01.2026", source: "manual", dataType: "date" },
      { key: "total", label: "Разом до сплати", originalText: "98 000,00 грн", source: "computed", dataType: "currency" },
      { key: "dueDate", label: "Оплатити до", originalText: "10.02.2026", source: "manual", dataType: "date" },
      { key: "contractRef", label: "Договір-підстава", originalText: "Договір IT-2025-012 від 01.12.2025", source: "manual", dataType: "text" },
    ],
  },
  // Custom Marketing Contract demo text
  {
    id: "custom-marketing-contract-text",
    name: "Договір маркетинг",
    suggestedName: "Договір на маркетингові послуги",
    text: `<h2 style="text-align:center">ДОГОВІР № [МКТ-2026-001]</h2>
<p style="text-align:center"><em>на надання маркетингових послуг</em></p>
<p style="text-align:center">[Місто]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;«[02]» [лютого] 2026 р.</p>
<p><strong>[Назва виконавця]</strong>, код ЄДРПОУ <strong>[ЄДРПОУ виконавця]</strong>, в особі директора <strong>[Директор виконавця]</strong>, що діє на підставі Статуту (надалі&nbsp;– "Виконавець"), з однієї сторони, та</p>
<p><strong>[Назва замовника]</strong>, ІПН <strong>[ІПН замовника]</strong>, (надалі&nbsp;– "Замовник"), з іншої сторони,</p>
<p>уклали цей Договір про наступне:</p>
<h3>1. ПРЕДМЕТ ДОГОВОРУ</h3>
<p>1.1. Виконавець зобов'язується надати Замовнику маркетингові послуги:</p>
<ul>
<li>Розробка та реалізація SMM-стратегії</li>
<li>Створення контенту для соціальних мереж</li>
<li>Налаштування та ведення таргетованої реклами</li>
<li>Щомісячна аналітика та звітність</li>
</ul>
<h3>2. ЦІЛІ КАМПАНІЇ (KPI)</h3>
<ul>
<li>Збільшення охоплення: +50% за 3 місяці</li>
<li>Залучення нових підписників: 5 000 осіб</li>
<li>Конверсія у ліди: 3%</li>
<li>Зниження вартості ліда: до 50 грн</li>
</ul>
<h3>3. ВАРТІСТЬ ПОСЛУГ</h3>
<p>3.1. Місячна абонплата: <strong>[45 000,00 грн]</strong></p>
<p>3.2. Рекламний бюджет: <strong>[150 000,00 грн/міс]</strong></p>
<p>3.3. Бонус за перевиконання KPI: <strong>[10% від бюджету]</strong></p>
<h3>4. СТРОК ДІЇ</h3>
<p>4.1. Договір діє з <strong>[01.02.2026]</strong> по <strong>[30.04.2026]</strong></p>
<p>4.2. Звітність: <strong>[щотижнево (п'ятниця до 18:00)]</strong></p>
<h3>5. РЕКВІЗИТИ СТОРІН</h3>
<table style="width:100%; border-collapse:collapse">
<thead><tr><th style="text-align:left; padding:6px; border-bottom:2px solid #333; width:50%">ВИКОНАВЕЦЬ</th><th style="text-align:left; padding:6px; border-bottom:2px solid #333; width:50%">ЗАМОВНИК</th></tr></thead>
<tbody>
<tr><td style="padding:4px 6px">[Назва виконавця]</td><td style="padding:4px 6px">[Назва замовника]</td></tr>
<tr><td style="padding:4px 6px">ЄДРПОУ: [ЄДРПОУ виконавця]</td><td style="padding:4px 6px">ІПН: [ІПН замовника]</td></tr>
<tr><td style="padding:4px 6px">IBAN: [IBAN виконавця]</td><td style="padding:4px 6px">IBAN: [IBAN замовника]</td></tr>
<tr><td style="padding:12px 6px 4px">_______ / [Директор виконавця] /</td><td style="padding:12px 6px 4px">_______ / [Представник замовника] /</td></tr>
</tbody>
</table>`,
    detectedFields: [
      { key: "documentNumber", label: "Номер договору", originalText: "МКТ-2026-001", source: "computed", dataType: "text" },
      { key: "city", label: "Місто", originalText: "Місто", source: "cabinet", sourceKey: "cabinet.city", dataType: "text" },
      { key: "documentDay", label: "День", originalText: "02", source: "manual", dataType: "number" },
      { key: "documentMonth", label: "Місяць", originalText: "лютого", source: "manual", dataType: "text" },
      { key: "agencyName", label: "Назва виконавця", originalText: "Назва виконавця", source: "cabinet", sourceKey: "cabinet.name", dataType: "text" },
      { key: "agencyCode", label: "ЄДРПОУ виконавця", originalText: "ЄДРПОУ виконавця", source: "cabinet", sourceKey: "cabinet.edrpou", dataType: "edrpou" },
      { key: "agencyDirector", label: "Директор виконавця", originalText: "Директор виконавця", source: "cabinet", sourceKey: "cabinet.director", dataType: "person-name" },
      { key: "agencyIban", label: "IBAN виконавця", originalText: "IBAN виконавця", source: "cabinet", sourceKey: "cabinet.iban", dataType: "iban" },
      { key: "clientName", label: "Назва замовника", originalText: "Назва замовника", source: "contractor", sourceKey: "contractor.name", dataType: "text" },
      { key: "clientCode", label: "ІПН замовника", originalText: "ІПН замовника", source: "contractor", sourceKey: "contractor.code", dataType: "ipn" },
      { key: "clientIban", label: "IBAN замовника", originalText: "IBAN замовника", source: "contractor", sourceKey: "contractor.iban", dataType: "iban" },
      { key: "clientRep", label: "Представник замовника", originalText: "Представник замовника", source: "contractor", sourceKey: "contractor.representative", dataType: "person-name" },
      { key: "services", label: "Перелік послуг", originalText: "• Розробка та реалізація SMM-стратегії\n• Створення контенту для соціальних мереж\n• Налаштування та ведення таргетованої реклами\n• Щомісячна аналітика та звітність", source: "manual", dataType: "text" },
      { key: "campaignGoals", label: "Цілі кампанії (KPI)", originalText: "• Збільшення охоплення: +50% за 3 місяці\n• Залучення нових підписників: 5 000 осіб\n• Конверсія у ліди: 3%\n• Зниження вартості ліда: до 50 грн", source: "manual", dataType: "text" },
      { key: "monthlyFee", label: "Абонплата (грн/міс)", originalText: "45 000,00 грн", source: "manual", dataType: "currency" },
      { key: "adBudget", label: "Рекламний бюджет (грн/міс)", originalText: "150 000,00 грн/міс", source: "manual", dataType: "currency" },
      { key: "bonusTerms", label: "Бонус за KPI", originalText: "10% від бюджету", source: "manual", dataType: "text" },
      { key: "startDate", label: "Дата початку", originalText: "01.02.2026", source: "manual", dataType: "date" },
      { key: "endDate", label: "Дата завершення", originalText: "30.04.2026", source: "manual", dataType: "date" },
      { key: "reportingSchedule", label: "Графік звітності", originalText: "щотижнево (п'ятниця до 18:00)", source: "manual", dataType: "text" },
    ],
  },
];