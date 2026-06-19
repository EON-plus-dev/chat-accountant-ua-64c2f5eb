// ============================================
// DOCUMENT CLASSIFICATION LAYER
// World-class taxonomy for document indexing (ISO 15489, MoReq2010)
// ============================================

import type { DocumentType } from "@/config/documentFlowConfig";

// ============================================
// DOCUMENT CATEGORIES
// ============================================

export type DocumentCategory =
  | "contractual"     // Договірні документи
  | "financial"       // Фінансові документи
  | "regulatory"      // Регуляторні документи (звітність, декларації)
  | "operational"     // Операційні документи (ТТН, накладні)
  | "hr";             // Кадрові документи

export const documentCategoryConfig: Record<DocumentCategory, {
  labelUk: string;
  labelEn: string;
  description: string;
  icon: string;
}> = {
  contractual: {
    labelUk: "Договірний",
    labelEn: "Contractual",
    description: "Договори, угоди, додаткові угоди",
    icon: "file-signature",
  },
  financial: {
    labelUk: "Фінансовий",
    labelEn: "Financial",
    description: "Рахунки, акти, податкові накладні",
    icon: "banknote",
  },
  regulatory: {
    labelUk: "Регуляторний",
    labelEn: "Regulatory",
    description: "Звітність, декларації, ліцензії",
    icon: "shield-check",
  },
  operational: {
    labelUk: "Операційний",
    labelEn: "Operational",
    description: "ТТН, накладні, виписки",
    icon: "truck",
  },
  hr: {
    labelUk: "Кадровий",
    labelEn: "HR",
    description: "Накази, довіреності, трудові договори",
    icon: "users",
  },
};

// ============================================
// LEGAL WEIGHT (ЮРИДИЧНА ВАГА)
// ============================================

export type LegalWeight =
  | "primary"         // Первинний документ (має повну юридичну силу)
  | "secondary"       // Вторинний (на основі первинного)
  | "supporting"      // Підтверджуючий (додаток, довідка)
  | "informational";  // Інформаційний (без юридичної сили)

export const legalWeightConfig: Record<LegalWeight, {
  labelUk: string;
  labelEn: string;
  description: string;
  priority: number;
}> = {
  primary: {
    labelUk: "Первинний",
    labelEn: "Primary",
    description: "Має повну юридичну силу, є основою для транзакцій",
    priority: 1,
  },
  secondary: {
    labelUk: "Вторинний",
    labelEn: "Secondary",
    description: "Створений на основі первинного документа",
    priority: 2,
  },
  supporting: {
    labelUk: "Підтверджуючий",
    labelEn: "Supporting",
    description: "Додаток, довідка або підтверджуючий документ",
    priority: 3,
  },
  informational: {
    labelUk: "Інформаційний",
    labelEn: "Informational",
    description: "Не має юридичної сили, лише для інформування",
    priority: 4,
  },
};

// ============================================
// EVIDENTIARY VALUE (ДОКАЗОВА ЦІННІСТЬ)
// ISO 15489-1:2016 Authenticity Criteria
// ============================================

export type EvidentiaryValue =
  | "original"        // Оригінал (електронний або сканований)
  | "certified-copy"  // Завірена копія (з КЕП)
  | "copy"            // Проста копія
  | "reference";      // Посилання на зовнішній документ

export const evidentiaryValueConfig: Record<EvidentiaryValue, {
  labelUk: string;
  labelEn: string;
  admissibility: "full" | "limited" | "none";
  requiresVerification: boolean;
}> = {
  original: {
    labelUk: "Оригінал",
    labelEn: "Original",
    admissibility: "full",
    requiresVerification: true,
  },
  "certified-copy": {
    labelUk: "Завірена копія",
    labelEn: "Certified Copy",
    admissibility: "full",
    requiresVerification: true,
  },
  copy: {
    labelUk: "Копія",
    labelEn: "Copy",
    admissibility: "limited",
    requiresVerification: false,
  },
  reference: {
    labelUk: "Посилання",
    labelEn: "Reference",
    admissibility: "none",
    requiresVerification: false,
  },
};

// ============================================
// PROCEDURAL ROLE (ПРОЦЕСУАЛЬНА РОЛЬ)
// Document's role in business process flow
// ============================================

export type ProceduralRole =
  | "initiating"      // Ініціюючий документ (починає процес)
  | "confirming"      // Підтверджуючий (підтверджує виконання)
  | "amending"        // Змінюючий (вносить зміни)
  | "terminating"     // Завершуючий (закриває правовідносини)
  | "archival";       // Архівний (для зберігання)

export const proceduralRoleConfig: Record<ProceduralRole, {
  labelUk: string;
  labelEn: string;
  description: string;
  canInitiatePayment: boolean;
}> = {
  initiating: {
    labelUk: "Ініціюючий",
    labelEn: "Initiating",
    description: "Починає бізнес-процес або правовідносини",
    canInitiatePayment: true,
  },
  confirming: {
    labelUk: "Підтверджуючий",
    labelEn: "Confirming",
    description: "Підтверджує виконання зобов'язань",
    canInitiatePayment: true,
  },
  amending: {
    labelUk: "Змінюючий",
    labelEn: "Amending",
    description: "Вносить зміни до існуючих умов",
    canInitiatePayment: false,
  },
  terminating: {
    labelUk: "Завершуючий",
    labelEn: "Terminating",
    description: "Закриває правовідносини",
    canInitiatePayment: false,
  },
  archival: {
    labelUk: "Архівний",
    labelEn: "Archival",
    description: "Призначений лише для зберігання",
    canInitiatePayment: false,
  },
};

// ============================================
// UNIFIED CLASSIFICATION
// ============================================

export interface DocumentClassification {
  category: DocumentCategory;
  legalWeight: LegalWeight;
  evidentiaryValue: EvidentiaryValue;
  proceduralRole: ProceduralRole;
  
  // Auto-generated metadata
  confidentialityLevel?: "public" | "internal" | "confidential" | "restricted";
  sensitivityMarkers?: string[];
  
  // Indexing tags
  autoTags: string[];
  customTags?: string[];
  
  // Department/Project assignment
  department?: string;
  project?: string;
  costCenter?: string;
  
  // External integrations
  externalIds?: Record<string, string>;
}

// ============================================
// DOCUMENT TYPE TO CATEGORY MAPPING
// ============================================

export const documentTypeToCategory: Partial<Record<DocumentType, DocumentCategory>> = {
  contract: "contractual",
  "supply-contract": "contractual",
  "rental-agreement": "contractual",
  "fop-service-contract": "contractual",
  invoice: "financial",
  act: "financial",
  waybill: "operational",
  ttn: "operational",
  "tax-invoice": "financial",
  "prro-receipt": "financial",
  "bank-statement": "financial",
  reconciliation: "financial",
  "employment-order": "hr",
  "vacation-order": "hr",
  "dismissal-order": "hr",
  "power-of-attorney": "hr",
};

// ============================================
// DOCUMENT TYPE TO LEGAL WEIGHT MAPPING
// ============================================

export const documentTypeToLegalWeight: Partial<Record<DocumentType, LegalWeight>> = {
  contract: "primary",
  "supply-contract": "primary",
  "rental-agreement": "primary",
  "fop-service-contract": "primary",
  invoice: "primary",
  act: "primary",
  waybill: "secondary",
  ttn: "primary",
  "tax-invoice": "primary",
  "prro-receipt": "primary",
  "bank-statement": "supporting",
  reconciliation: "supporting",
  "employment-order": "primary",
  "vacation-order": "primary",
  "dismissal-order": "primary",
  "power-of-attorney": "primary",
};

// ============================================
// AUTO-TAG GENERATION
// ============================================

export const generateAutoTags = (
  docType: DocumentType,
  amount?: number,
  contractorName?: string,
  period?: string
): string[] => {
  const tags: string[] = [];
  
  // Category tag
  const category = documentTypeToCategory[docType];
  tags.push(documentCategoryConfig[category].labelUk);
  
  // Amount range tags
  if (amount) {
    if (amount >= 1000000) tags.push("великий-контракт");
    else if (amount >= 100000) tags.push("середній-контракт");
    else if (amount >= 10000) tags.push("стандартний");
    else tags.push("малий");
  }
  
  // Period tags
  if (period) {
    tags.push(period);
  }
  
  // Type-specific tags
  if (["invoice", "act", "tax-invoice"].includes(docType)) {
    tags.push("фінансовий");
  }
  if (["contract", "supply-contract", "rental-agreement"].includes(docType)) {
    tags.push("договір");
  }
  if (["employment-order", "vacation-order", "dismissal-order"].includes(docType)) {
    tags.push("кадри");
  }
  
  return tags;
};
