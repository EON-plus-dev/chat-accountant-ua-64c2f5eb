/**
 * Party Attributes Library - Single Source of Truth
 * Unified configuration for:
 * - Field creation (FieldCreateSheet)
 * - Autofill (resolveFieldValue)
 * - AI detection (detectFieldFromText, inferPartyFromContext)
 */

import { Building2, Users, Truck, User, Package, FileText, Pencil, type LucideIcon } from "lucide-react";
import type { FieldSource } from "@/config/documentFormSchemas";
import type { FieldDataType, UnifiedTemplateField } from "@/types/templateField";
import { mapDataTypeToFieldType, inferGroupFromKey } from "@/types/templateField";

// ============= PARTY TYPES =============
export type PartyType = 
  | "cabinet"       // Мої дані
  | "contractor"    // Контрагент
  | "carrier"       // Перевізник
  | "employee"      // Працівник
  | "positions"     // Позиції (таблиця)
  | "parent-doc"    // Документ-підстава
  | "manual";       // Інше (вручну)

// ============= ATTRIBUTE INTERFACE =============
export interface PartyAttribute {
  id: string;
  label: string;
  sourceKey: string;
  dataType: FieldDataType;
  autoMode: "auto" | "formula" | "manual";
  computeFormula?: string;
  hint?: string;
  
  // AI recognition & validation
  recognitionPattern?: RegExp;
  synonyms?: string[];
  exampleValues?: string[];
}

// ============= PARTY CONFIG INTERFACE =============
export interface PartyConfig {
  id: PartyType;
  label: string;
  icon: LucideIcon;
  description: string;
  technicalSource: FieldSource;
  attributes: PartyAttribute[];
  
  // AI recognition
  synonyms: string[];
  contextPatterns?: RegExp[];
}

// ============= PARTY CONFIGURATIONS =============
export const PARTY_CONFIGS: PartyConfig[] = [
  {
    id: "cabinet",
    label: "Мої дані",
    icon: Building2,
    description: "Реквізити вашого кабінету",
    technicalSource: "cabinet",
    synonyms: [
      "постачальник", "виконавець", "продавець", "орендодавець",
      "принципал", "роботодавець", "відправник", "замовник послуг",
      "ми", "наша компанія", "наше підприємство"
    ],
    contextPatterns: [
      /виконавець[:\s]/i,
      /постачальник[:\s]/i,
      /продавець[:\s]/i,
      /орендодавець[:\s]/i,
      /ми[,\s]/i,
    ],
    attributes: [
      { 
        id: "name", 
        label: "Повна назва", 
        sourceKey: "cabinet.name", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["назва", "найменування", "компанія", "підприємство"],
      },
      { 
        id: "shortName", 
        label: "Коротка назва", 
        sourceKey: "cabinet.shortName", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["скорочена назва", "коротко"],
      },
      { 
        id: "code", 
        label: "ЄДРПОУ / ІПН", 
        sourceKey: "cabinet.edrpou", 
        dataType: "edrpou", 
        autoMode: "auto",
        recognitionPattern: /^\d{8}$|^\d{10}$/,
        synonyms: ["ЄДРПОУ", "ІПН", "код", "ідентифікатор", "код ЄДРПОУ", "РНОКПП"],
        exampleValues: ["12345678", "1234567890"],
      },
      { 
        id: "iban", 
        label: "IBAN", 
        sourceKey: "cabinet.iban", 
        dataType: "iban", 
        autoMode: "auto",
        recognitionPattern: /^UA\d{27}$/i,
        synonyms: ["р/р", "рахунок", "банківський рахунок", "IBAN", "розрахунковий рахунок"],
        exampleValues: ["UA213223130000026007233566001"],
      },
      { 
        id: "bankName", 
        label: "Назва банку", 
        sourceKey: "cabinet.bankName", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["банк", "в банку", "обслуговуючий банк"],
      },
      { 
        id: "mfo", 
        label: "МФО", 
        sourceKey: "cabinet.mfo", 
        dataType: "text", 
        autoMode: "auto",
        recognitionPattern: /^\d{6}$/,
        synonyms: ["МФО", "код банку"],
        exampleValues: ["305299"],
      },
      { 
        id: "legalAddress", 
        label: "Юридична адреса", 
        sourceKey: "cabinet.legalAddress", 
        dataType: "address", 
        autoMode: "auto",
        synonyms: ["юр. адреса", "місцезнаходження", "зареєстрована адреса"],
      },
      { 
        id: "factualAddress", 
        label: "Фактична адреса", 
        sourceKey: "cabinet.factualAddress", 
        dataType: "address", 
        autoMode: "auto",
        synonyms: ["факт. адреса", "адреса офісу", "поштова адреса"],
      },
      { 
        id: "director", 
        label: "ПІБ директора", 
        sourceKey: "cabinet.director", 
        dataType: "person-name", 
        autoMode: "auto",
        synonyms: ["директор", "керівник", "представник", "уповноважена особа", "ПІБ"],
      },
      { 
        id: "directorPosition", 
        label: "Посада директора", 
        sourceKey: "cabinet.directorPosition", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["посада", "посада керівника"],
      },
      { 
        id: "phone", 
        label: "Телефон", 
        sourceKey: "cabinet.phone", 
        dataType: "phone", 
        autoMode: "auto",
        recognitionPattern: /^(\+?38)?0\d{9}$/,
        synonyms: ["телефон", "тел.", "моб.", "контакт", "контактний телефон"],
        exampleValues: ["+380441234567", "0501234567"],
      },
      { 
        id: "email", 
        label: "Email", 
        sourceKey: "cabinet.email", 
        dataType: "email", 
        autoMode: "auto",
        recognitionPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        synonyms: ["email", "e-mail", "пошта", "електронна пошта"],
        exampleValues: ["info@company.ua"],
      },
      { 
        id: "vatNumber", 
        label: "Номер ПДВ", 
        sourceKey: "cabinet.vatNumber", 
        dataType: "text", 
        autoMode: "auto",
        recognitionPattern: /^\d{12}$/,
        synonyms: ["ІПН ПДВ", "номер платника ПДВ", "свідоцтво ПДВ"],
        exampleValues: ["123456789012"],
      },
    ],
  },
  {
    id: "contractor",
    label: "Контрагент",
    icon: Users,
    description: "Замовник, клієнт, покупець",
    technicalSource: "contractor",
    synonyms: [
      "замовник", "покупець", "клієнт", "орендар",
      "агент", "одержувач", "отримувач", "підрядник",
      "контрагент", "партнер", "інша сторона"
    ],
    contextPatterns: [
      /замовник[:\s]/i,
      /покупець[:\s]/i,
      /контрагент[:\s]/i,
      /клієнт[:\s]/i,
      /орендар[:\s]/i,
    ],
    attributes: [
      { 
        id: "name", 
        label: "Назва", 
        sourceKey: "contractor.name", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["назва контрагента", "найменування"],
      },
      { 
        id: "fullName", 
        label: "Повна назва", 
        sourceKey: "contractor.fullName", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["повна назва контрагента"],
      },
      { 
        id: "code", 
        label: "ЄДРПОУ / ІПН", 
        sourceKey: "contractor.code", 
        dataType: "edrpou", 
        autoMode: "auto",
        recognitionPattern: /^\d{8}$|^\d{10}$/,
        synonyms: ["код контрагента", "ЄДРПОУ контрагента", "ІПН контрагента"],
      },
      { 
        id: "iban", 
        label: "IBAN", 
        sourceKey: "contractor.iban", 
        dataType: "iban", 
        autoMode: "auto",
        recognitionPattern: /^UA\d{27}$/i,
        synonyms: ["рахунок контрагента", "IBAN контрагента"],
      },
      { 
        id: "bankName", 
        label: "Назва банку", 
        sourceKey: "contractor.bankName", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["банк контрагента"],
      },
      { 
        id: "address", 
        label: "Адреса", 
        sourceKey: "contractor.address", 
        dataType: "address", 
        autoMode: "auto",
        synonyms: ["адреса контрагента", "місцезнаходження контрагента"],
      },
      { 
        id: "director", 
        label: "ПІБ директора", 
        sourceKey: "contractor.director", 
        dataType: "person-name", 
        autoMode: "auto",
        synonyms: ["директор контрагента", "представник контрагента"],
      },
      { 
        id: "directorPosition", 
        label: "Посада директора", 
        sourceKey: "contractor.directorPosition", 
        dataType: "text", 
        autoMode: "auto",
        synonyms: ["посада представника контрагента"],
      },
      { 
        id: "phone", 
        label: "Телефон", 
        sourceKey: "contractor.phone", 
        dataType: "phone", 
        autoMode: "auto",
        recognitionPattern: /^(\+?38)?0\d{9}$/,
        synonyms: ["телефон контрагента"],
      },
      { 
        id: "email", 
        label: "Email", 
        sourceKey: "contractor.email", 
        dataType: "email", 
        autoMode: "auto",
        recognitionPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        synonyms: ["email контрагента", "пошта контрагента"],
      },
    ],
  },
  {
    id: "carrier",
    label: "Перевізник",
    icon: Truck,
    description: "Транспортна компанія",
    technicalSource: "contractor",
    synonyms: [
      "перевізник", "транспортна компанія", "водій",
      "експедитор", "логістична компанія"
    ],
    contextPatterns: [
      /перевізник[:\s]/i,
      /транспорт[:\s]/i,
      /водій[:\s]/i,
    ],
    attributes: [
      { id: "name", label: "Назва", sourceKey: "carrier.name", dataType: "text", autoMode: "auto" },
      { 
        id: "code", 
        label: "ЄДРПОУ / ІПН", 
        sourceKey: "carrier.code", 
        dataType: "edrpou", 
        autoMode: "auto",
        recognitionPattern: /^\d{8}$|^\d{10}$/,
      },
      { 
        id: "iban", 
        label: "IBAN", 
        sourceKey: "carrier.iban", 
        dataType: "iban", 
        autoMode: "auto",
        recognitionPattern: /^UA\d{27}$/i,
      },
      { id: "address", label: "Адреса", sourceKey: "carrier.address", dataType: "address", autoMode: "auto" },
      { 
        id: "phone", 
        label: "Телефон", 
        sourceKey: "carrier.phone", 
        dataType: "phone", 
        autoMode: "auto",
        recognitionPattern: /^(\+?38)?0\d{9}$/,
      },
    ],
  },
  {
    id: "employee",
    label: "Працівник",
    icon: User,
    description: "Дані найманого працівника",
    technicalSource: "employee",
    synonyms: [
      "працівник", "співробітник", "робітник",
      "найманий працівник", "штатний працівник"
    ],
    contextPatterns: [
      /працівник[:\s]/i,
      /співробітник[:\s]/i,
    ],
    attributes: [
      { id: "fullName", label: "ПІБ", sourceKey: "employee.fullName", dataType: "person-name", autoMode: "auto" },
      { id: "position", label: "Посада", sourceKey: "employee.position", dataType: "text", autoMode: "auto" },
      { 
        id: "ipn", 
        label: "ІПН", 
        sourceKey: "employee.ipn", 
        dataType: "ipn", 
        autoMode: "auto",
        recognitionPattern: /^\d{10}$/,
        synonyms: ["РНОКПП", "ідентифікаційний номер"],
      },
      { id: "contractNumber", label: "Номер договору", sourceKey: "employee.contractNumber", dataType: "text", autoMode: "auto" },
      { id: "contractDate", label: "Дата договору", sourceKey: "employee.contractDate", dataType: "date", autoMode: "auto" },
    ],
  },
  {
    id: "positions",
    label: "Позиції",
    icon: Package,
    description: "Підсумки таблиці товарів/послуг",
    technicalSource: "computed",
    synonyms: [
      "позиції", "товари", "послуги", "номенклатура",
      "таблиця", "перелік", "специфікація"
    ],
    contextPatterns: [
      /позиц[іїи]/i,
      /товар[иів]/i,
      /послуг[иа]/i,
      /разом/i,
      /всього/i,
    ],
    attributes: [
      { 
        id: "totalAmount", 
        label: "Сума всіх позицій", 
        sourceKey: "positions.totalAmount", 
        dataType: "currency", 
        autoMode: "formula", 
        computeFormula: "SUM(positions.amount)",
        synonyms: ["загальна сума", "разом", "всього", "до сплати"],
      },
      { 
        id: "subtotal", 
        label: "Сума без ПДВ", 
        sourceKey: "positions.subtotal", 
        dataType: "currency", 
        autoMode: "formula", 
        computeFormula: "positions.subtotal",
        synonyms: ["без ПДВ", "нетто"],
      },
      { 
        id: "vatAmount", 
        label: "Сума ПДВ", 
        sourceKey: "positions.vatAmount", 
        dataType: "currency", 
        autoMode: "formula", 
        computeFormula: "positions.vatAmount",
        synonyms: ["ПДВ", "податок"],
      },
      { 
        id: "totalQuantity", 
        label: "Загальна кількість", 
        sourceKey: "positions.totalQuantity", 
        dataType: "number", 
        autoMode: "formula", 
        computeFormula: "SUM(positions.quantity)",
        synonyms: ["кількість", "шт.", "одиниць"],
      },
      { 
        id: "totalInWords", 
        label: "Сума прописом", 
        sourceKey: "positions.totalInWords", 
        dataType: "text", 
        autoMode: "formula", 
        computeFormula: "TO_WORDS(positions.totalAmount)",
        synonyms: ["прописом", "словами"],
      },
    ],
  },
  {
    id: "parent-doc",
    label: "Документ-підстава",
    icon: FileText,
    description: "Дані пов'язаного документа",
    technicalSource: "manual",
    synonyms: [
      "документ-підстава", "підстава", "основний документ",
      "договір", "контракт", "угода"
    ],
    contextPatterns: [
      /підстава[:\s]/i,
      /на підставі/i,
      /згідно з/i,
      /відповідно до/i,
    ],
    attributes: [
      { id: "number", label: "Номер документа", sourceKey: "parentDoc.number", dataType: "text", autoMode: "auto" },
      { id: "date", label: "Дата документа", sourceKey: "parentDoc.date", dataType: "date", autoMode: "auto" },
      { id: "subject", label: "Предмет", sourceKey: "parentDoc.subject", dataType: "text", autoMode: "auto" },
      { id: "amount", label: "Сума", sourceKey: "parentDoc.amount", dataType: "currency", autoMode: "auto" },
    ],
  },
  {
    id: "manual",
    label: "Інше",
    icon: Pencil,
    description: "Ввести значення вручну",
    technicalSource: "manual",
    synonyms: ["інше", "вручну", "довільне"],
    attributes: [
      { id: "text", label: "Текст", sourceKey: "manual.text", dataType: "text", autoMode: "manual" },
      { id: "number", label: "Число", sourceKey: "manual.number", dataType: "number", autoMode: "manual" },
      { id: "date", label: "Дата", sourceKey: "manual.date", dataType: "date", autoMode: "manual" },
      { id: "currency", label: "Гроші", sourceKey: "manual.currency", dataType: "currency", autoMode: "manual" },
      { id: "phone", label: "Телефон", sourceKey: "manual.phone", dataType: "phone", autoMode: "manual" },
      { id: "email", label: "Email", sourceKey: "manual.email", dataType: "email", autoMode: "manual" },
      { id: "iban", label: "IBAN", sourceKey: "manual.iban", dataType: "iban", autoMode: "manual" },
      { id: "edrpou", label: "ЄДРПОУ", sourceKey: "manual.edrpou", dataType: "edrpou", autoMode: "manual" },
      { id: "ipn", label: "ІПН", sourceKey: "manual.ipn", dataType: "ipn", autoMode: "manual" },
    ],
  },
];

// ============= HELPERS: PARTY & ATTRIBUTE LOOKUP =============

/** Get party config by ID */
export const getPartyConfig = (partyId: PartyType): PartyConfig | undefined => 
  PARTY_CONFIGS.find(p => p.id === partyId);

/** Get attributes for a party */
export const getPartyAttributes = (partyId: PartyType): PartyAttribute[] => 
  getPartyConfig(partyId)?.attributes || [];

/** Get attribute by ID */
export const getAttributeById = (partyId: PartyType, attrId: string): PartyAttribute | undefined =>
  getPartyAttributes(partyId).find(a => a.id === attrId);

/** Generate hint for an attribute */
export const getAttributeHint = (partyId: PartyType, attrId: string): string => {
  const party = getPartyConfig(partyId);
  const attr = getAttributeById(partyId, attrId);
  
  if (!party || !attr) return "";
  
  if (attr.autoMode === "formula") {
    return "Розраховується автоматично на основі таблиці позицій";
  }
  
  if (attr.autoMode === "auto") {
    const sourceLabels: Record<string, string> = {
      cabinet: "реквізитів кабінету",
      contractor: "картки контрагента",
      carrier: "картки перевізника",
      employee: "картки працівника",
      "parent-doc": "пов'язаного документа",
    };
    return `Заповнюється автоматично з ${sourceLabels[partyId] || "системи"}`;
  }
  
  return "Вводиться вручну при створенні документа";
};

/** Get mode badge text */
export const getAutoModeBadge = (autoMode: "auto" | "formula" | "manual"): string | null => {
  switch (autoMode) {
    case "auto":
      return "Авто";
    case "formula":
      return "Формула";
    default:
      return null;
  }
};

// ============= RESOLVE FIELD VALUE (Unified Autofill) =============

/** Context for field value resolution */
export interface FieldResolutionContext {
  cabinet?: Record<string, any>;
  contractor?: Record<string, any>;
  carrier?: Record<string, any>;
  employee?: Record<string, any>;
  positions?: Array<{ quantity?: number; total?: number; amount?: number }>;
  parentDocument?: Record<string, any>;
}

/**
 * Resolve field value from data sources
 * Unified function for autofill across the system
 */
export const resolveFieldValue = (
  sourceKey: string,
  context: FieldResolutionContext
): string | number | undefined => {
  if (!sourceKey) return undefined;
  
  const [source, key] = sourceKey.split(".");
  if (!source || !key) return undefined;
  
  switch (source) {
    case "cabinet":
      return context.cabinet?.[key];
      
    case "contractor":
      return context.contractor?.[key];
      
    case "carrier":
      return context.carrier?.[key];
      
    case "employee":
      return context.employee?.[key];
      
    case "positions":
      // Computed formulas for positions
      if (!context.positions?.length) return undefined;
      
      switch (key) {
        case "totalAmount":
          return context.positions.reduce((sum, p) => sum + (p.total || p.amount || 0), 0);
        case "subtotal":
          // Assuming 20% VAT, calculate net
          const total = context.positions.reduce((sum, p) => sum + (p.total || p.amount || 0), 0);
          return total / 1.2;
        case "vatAmount":
          const totalWithVat = context.positions.reduce((sum, p) => sum + (p.total || p.amount || 0), 0);
          return totalWithVat - (totalWithVat / 1.2);
        case "totalQuantity":
          return context.positions.reduce((sum, p) => sum + (p.quantity || 0), 0);
        case "totalInWords":
          // Would need a number-to-words function
          return undefined;
        default:
          return undefined;
      }
      
    case "parentDoc":
      return context.parentDocument?.[key];
      
    case "manual":
      // Manual fields don't auto-resolve
      return undefined;
      
    default:
      return undefined;
  }
};

// ============= AI DETECTION FUNCTIONS =============

/** Result of party inference from context */
export interface PartyInferenceResult {
  party: PartyType;
  confidence: number;
}

/**
 * Infer party type from surrounding context
 * Used by AI when analyzing template text
 */
export const inferPartyFromContext = (
  text: string,
  surroundingText?: string
): PartyInferenceResult | null => {
  const normalizedText = text.toLowerCase();
  const normalizedContext = surroundingText?.toLowerCase() || "";
  const fullContext = `${normalizedContext} ${normalizedText}`;
  
  let bestMatch: PartyInferenceResult | null = null;
  
  for (const party of PARTY_CONFIGS) {
    // Check patterns first (higher confidence)
    for (const pattern of party.contextPatterns || []) {
      if (pattern.test(fullContext)) {
        const result = { party: party.id, confidence: 0.9 };
        if (!bestMatch || result.confidence > bestMatch.confidence) {
          bestMatch = result;
        }
      }
    }
    
    // Check synonyms
    for (const synonym of party.synonyms || []) {
      if (fullContext.includes(synonym.toLowerCase())) {
        const result = { party: party.id, confidence: 0.85 };
        if (!bestMatch || result.confidence > bestMatch.confidence) {
          bestMatch = result;
        }
      }
    }
  }
  
  return bestMatch;
};

/** Result of field detection from text */
export interface FieldDetectionResult {
  partyType: PartyType;
  attributeId: string;
  confidence: number;
  dataType: FieldDataType;
  sourceKey: string;
}

/**
 * Detect field type and source from text value
 * Replaces detectFieldType from documentTemplatesConfig.ts
 */
export const detectFieldFromText = (
  text: string,
  context?: string
): FieldDetectionResult | null => {
  const cleanText = text.replace(/\s/g, "").trim();
  
  // Check all attributes for pattern matches
  for (const party of PARTY_CONFIGS) {
    for (const attr of party.attributes) {
      if (attr.recognitionPattern?.test(cleanText)) {
        return {
          partyType: party.id,
          attributeId: attr.id,
          confidence: 0.9,
          dataType: attr.dataType,
          sourceKey: attr.sourceKey,
        };
      }
    }
  }
  
  // Fallback: infer from context
  const partyHint = inferPartyFromContext(text, context);
  if (partyHint) {
    // Try to find matching attribute by data type detection
    const dataType = detectDataType(cleanText);
    const party = getPartyConfig(partyHint.party);
    
    if (party) {
      const matchingAttr = party.attributes.find(a => a.dataType === dataType);
      if (matchingAttr) {
        return {
          partyType: partyHint.party,
          attributeId: matchingAttr.id,
          confidence: partyHint.confidence * 0.8,
          dataType: matchingAttr.dataType,
          sourceKey: matchingAttr.sourceKey,
        };
      }
    }
  }
  
  return null;
};

/**
 * Detect data type from text pattern (fallback detection)
 */
const detectDataType = (text: string): FieldDataType => {
  const cleanText = text.replace(/\s/g, "").trim();
  
  // IBAN
  if (/^UA\d{27}$/i.test(cleanText)) return "iban";
  
  // EDRPOU (8 digits)
  if (/^\d{8}$/.test(cleanText)) return "edrpou";
  
  // IPN (10 digits)
  if (/^\d{10}$/.test(cleanText)) return "ipn";
  
  // Phone
  if (/^(\+?38)?0\d{9}$/.test(cleanText)) return "phone";
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) return "email";
  
  // Currency
  if (/^\d[\d\s]*([.,]\d{1,2})?(\s*грн\.?)?$/i.test(text.trim())) return "currency";
  
  // Date
  if (/\d{1,2}[\.\-\/]\d{1,2}[\.\-\/]\d{2,4}/.test(text.trim())) return "date";
  
  // Number
  if (/^\d[\d\s]*$/.test(text.trim()) && text.trim().length <= 10) return "number";
  
  return "text";
};

// ============= FIELD FACTORY =============

/**
 * Create UnifiedTemplateField from party attribute
 * Single factory for both manual and AI field creation
 */
export const createFieldFromAttribute = (
  partyType: PartyType,
  attributeId: string,
  options?: {
    label?: string;
    required?: boolean;
    originalText?: string;
    order?: number;
  }
): UnifiedTemplateField | null => {
  const party = getPartyConfig(partyType);
  const attr = getAttributeById(partyType, attributeId);
  
  if (!party || !attr) return null;
  
  return {
    key: `${partyType}_${attributeId}_${Date.now()}`,
    label: options?.label || attr.label,
    partyType,
    source: party.technicalSource,
    sourceKey: attr.sourceKey,
    dataType: attr.dataType,
    fieldType: mapDataTypeToFieldType(attr.dataType),
    group: inferGroupFromKey(attributeId),
    order: options?.order || 0,
    required: options?.required || false,
    computeFormula: attr.computeFormula,
    originalText: options?.originalText,
    aiHint: attr.hint,
  };
};
