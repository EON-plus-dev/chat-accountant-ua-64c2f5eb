/**
 * UnifiedTemplateField - Single source of truth for template fields
 * Used across: Template Creation → Template Catalog → Document Creation → Document Display
 */

import type { 
  FormFieldType, 
  FieldGroup, 
  FieldSource, 
  FormFieldValidation, 
  FormFieldOption 
} from "@/config/documentFormSchemas";

// ============= SEMANTIC DATA TYPES =============
/**
 * Semantic data types for validation and AI detection
 * These describe WHAT the data IS (semantic meaning)
 */
export type FieldDataType = 
  | "text"           // Звичайний текст
  | "number"         // Число
  | "currency"       // Гроші (з форматуванням)
  | "date"           // Дата
  | "phone"          // Телефон
  | "email"          // Email
  | "iban"           // Банківський рахунок
  | "edrpou"         // ЄДРПОУ (8 цифр)
  | "ipn"            // ІПН (10 цифр)
  | "address"        // Адреса
  | "person-name";   // ПІБ

// ============= PARTY TYPES =============
/**
 * Document party types for business-oriented field creation
 * Re-exported from partyAttributesLibrary for convenience
 */
export type PartyType = 
  | "cabinet"       // Мої дані
  | "contractor"    // Контрагент
  | "carrier"       // Перевізник
  | "employee"      // Працівник
  | "positions"     // Позиції (таблиця)
  | "parent-doc"    // Документ-підстава
  | "manual";       // Інше (вручну)

// ============= UNIFIED TEMPLATE FIELD =============
/**
 * Unified field structure for Templates, Document Creation, and Document Display
 * Single source of truth across the entire document lifecycle
 * 
 * Flow: CreateTemplatePage → DocumentTemplate.fields → CreateDocumentSplitView → Document.fieldValues
 */
export interface UnifiedTemplateField {
  // === IDENTIFICATION ===
  /** Unique field key - maps to Document.fieldValues[key] */
  key: string;
  /** Human-readable label for UI */
  label: string;
  /** Party type for business-oriented field grouping */
  partyType?: PartyType;
  
  // === DATA SOURCE ===
  /** Where data comes from: cabinet, contractor, employee, manual, computed */
  source: FieldSource;
  /** Auto-fill key path (e.g., "cabinet.iban", "contractor.name") */
  sourceKey?: string;
  
  // === TYPING ===
  /** Semantic data type for validation and AI detection */
  dataType: FieldDataType;
  /** UI component type for form rendering */
  fieldType: FormFieldType;
  
  // === LAYOUT ===
  /** Field group for organizing form sections */
  group: FieldGroup;
  /** Order within group (1, 2, 3...) */
  order: number;
  /** Field width: full, half, third */
  width?: "full" | "half" | "third";
  /** Placeholder text */
  placeholder?: string;
  
  // === VALIDATION ===
  /** Whether field is required */
  required: boolean;
  /** Validation rules */
  validation?: FormFieldValidation;
  
  // === COMPUTED & OPTIONS ===
  /** Default value if any */
  defaultValue?: string | number | boolean;
  /** Formula for computed fields (e.g., "SUM(positions.amount)") */
  computeFormula?: string;
  /** Options for select/combobox fields */
  options?: FormFieldOption[];
  /** Conditional display rule */
  showIf?: { field: string; value: string | boolean | number };
  
  // === AI METADATA ===
  /** Semantic hint for AI detection */
  aiHint?: string;
  /** Original text from PDF (if created from upload) */
  originalText?: string;
  /** Position in template text (for AI detection) */
  position?: { start: number; end: number };
}

// ============= MAPPING HELPERS =============

/**
 * Maps semantic dataType to UI fieldType
 * dataType = what data IS (semantic)
 * fieldType = how to RENDER it (UI component)
 */
export const mapDataTypeToFieldType = (dataType: FieldDataType): FormFieldType => {
  const mapping: Record<FieldDataType, FormFieldType> = {
    text: "text",
    number: "number",
    currency: "currency",
    date: "date",
    iban: "iban",
    edrpou: "edrpou",
    ipn: "text", // No dedicated IPN fieldType, use text
    phone: "phone",
    email: "email",
    address: "text",
    "person-name": "text",
  };
  return mapping[dataType] || "text";
};

/**
 * Infers field group from field key naming convention
 */
export const inferGroupFromKey = (key: string): FieldGroup => {
  const lowerKey = key.toLowerCase();
  
  // Supplier/Executor group
  if (lowerKey.startsWith("supplier") || lowerKey.startsWith("executor") || 
      lowerKey.startsWith("sender") || lowerKey.startsWith("landlord") ||
      lowerKey.startsWith("transferor") || lowerKey.startsWith("principal") ||
      lowerKey.startsWith("disclosing") || lowerKey.startsWith("agency") ||
      lowerKey.startsWith("employer") || lowerKey.startsWith("company")) {
    return "supplier";
  }
  
  // Buyer/Customer group
  if (lowerKey.startsWith("buyer") || lowerKey.startsWith("customer") || 
      lowerKey.startsWith("contractor") || lowerKey.startsWith("recipient") ||
      lowerKey.startsWith("receiver") || lowerKey.startsWith("tenant") ||
      lowerKey.startsWith("transferee") || lowerKey.startsWith("receiving") ||
      lowerKey.startsWith("client") || lowerKey.startsWith("agent") ||
      lowerKey.startsWith("fop")) {
    return "buyer";
  }
  
  // Employee group
  if (lowerKey.startsWith("employee") || lowerKey.startsWith("worker") ||
      lowerKey.startsWith("driver")) {
    return "employee";
  }
  
  // Transport group
  if (lowerKey.startsWith("carrier") || lowerKey.startsWith("vehicle") ||
      lowerKey.startsWith("route")) {
    return "transport";
  }
  
  // Positions group
  if (lowerKey === "positions" || lowerKey.includes("positions") ||
      lowerKey === "goods" || lowerKey === "property") {
    return "positions";
  }
  
  // Totals group
  if (lowerKey.includes("total") || lowerKey.includes("amount") || 
      lowerKey.includes("vat") || lowerKey.includes("subtotal") ||
      lowerKey.includes("weight") || lowerKey.includes("places") ||
      lowerKey === "price" || lowerKey === "fee" || lowerKey === "commission" ||
      lowerKey === "salary" || lowerKey === "budget") {
    return "totals";
  }
  
  // Header group
  if (lowerKey.includes("date") || lowerKey.includes("number") || 
      lowerKey.includes("day") || lowerKey.includes("month") ||
      lowerKey.includes("contract") && lowerKey.includes("ref") ||
      lowerKey.includes("period") || lowerKey.includes("basis")) {
    return "header";
  }
  
  // Signatures group
  if (lowerKey.includes("sign") || lowerKey.includes("director")) {
    return "signatures";
  }
  
  // Default to terms
  return "terms";
};

/**
 * Converts FormField to UnifiedTemplateField
 * Used for backward compatibility with existing form schemas
 */
export const formFieldToUnified = (
  field: {
    key: string;
    label: string;
    fieldType: FormFieldType;
    source: FieldSource;
    sourceKey?: string;
    group: FieldGroup;
    order: number;
    required: boolean;
    defaultValue?: string | number | boolean;
    placeholder?: string;
    width?: "full" | "half" | "third";
    options?: FormFieldOption[];
    computeFormula?: string;
    validation?: FormFieldValidation;
    showIf?: { field: string; value: string | boolean | number };
    aiHint?: string;
  }
): UnifiedTemplateField => ({
  key: field.key,
  label: field.label,
  source: field.source,
  sourceKey: field.sourceKey,
  dataType: fieldTypeToDataType(field.fieldType),
  fieldType: field.fieldType,
  group: field.group,
  order: field.order,
  required: field.required,
  width: field.width,
  placeholder: field.placeholder,
  defaultValue: field.defaultValue,
  computeFormula: field.computeFormula,
  options: field.options,
  validation: field.validation,
  showIf: field.showIf,
  aiHint: field.aiHint,
});

/**
 * Maps UI fieldType back to semantic dataType
 */
export const fieldTypeToDataType = (fieldType: FormFieldType): FieldDataType => {
  const mapping: Record<FormFieldType, FieldDataType> = {
    text: "text",
    number: "number",
    currency: "currency",
    date: "date",
    select: "text",
    combobox: "text",
    positions: "text",
    textarea: "text",
    checkbox: "text",
    iban: "iban",
    edrpou: "edrpou",
    ipn: "ipn",
    phone: "phone",
    email: "email",
    employee: "text",
    "contract-ref": "text",
  };
  return mapping[fieldType] || "text";
};

/**
 * Field key to Document property mapping
 * Used to read/write values between template fields and document structure
 */
export const FIELD_TO_DOCUMENT_MAPPING: Record<string, string | ((doc: any) => any)> = {
  documentNumber: "number",
  documentDate: "date",
  dueDate: "dueDate",
  total: "amount",
  totalAmount: "amount",
  subtotal: "amount",
  currency: "currency",
  subject: "subject",
  supplierName: (doc) => doc.parties?.find((p: any) => p.isCabinetOwner)?.name,
  supplierCode: (doc) => doc.parties?.find((p: any) => p.isCabinetOwner)?.code,
  executorName: (doc) => doc.parties?.find((p: any) => p.isCabinetOwner)?.name,
  executorCode: (doc) => doc.parties?.find((p: any) => p.isCabinetOwner)?.code,
  buyerName: (doc) => doc.contractor?.name,
  buyerCode: (doc) => doc.contractor?.code,
  customerName: (doc) => doc.contractor?.name,
  customerCode: (doc) => doc.contractor?.code,
};

/**
 * Gets display value for a field from document
 * Prioritizes fieldValues, then falls back to mapped document properties
 */
export const getFieldDisplayValue = (
  doc: { fieldValues?: Record<string, any>; [key: string]: any },
  fieldKey: string
): string | undefined => {
  // Priority 1: Explicit field values from template
  if (doc.fieldValues?.[fieldKey] !== undefined) {
    const val = doc.fieldValues[fieldKey];
    if (typeof val === "number") {
      return val.toLocaleString("uk-UA");
    }
    return String(val);
  }
  
  // Priority 2: Mapped document properties
  const mapping = FIELD_TO_DOCUMENT_MAPPING[fieldKey];
  if (mapping) {
    if (typeof mapping === "function") {
      const result = mapping(doc);
      return result !== undefined ? String(result) : undefined;
    }
    const value = doc[mapping];
    if (value !== undefined) {
      if (typeof value === "number") {
        return value.toLocaleString("uk-UA");
      }
      return String(value);
    }
  }
  
  return undefined;
};
