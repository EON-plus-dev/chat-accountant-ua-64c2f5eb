/**
 * АВТОКЛАСИФІКАЦІЯ ЗАВАНТАЖЕНИХ ДОКУМЕНТІВ
 * 
 * Rule-based класифікація для визначення:
 * - Джерела доходу (salary, rent, investment, business, other)
 * - Податкового сценарію (ЄП, ПДФО+ВЗ, тощо)
 * - Рекомендацій для оновлення профілю кабінету
 */

import type { DocumentType } from "@/config/documentFlowConfig";
import type { DocumentCategory } from "@/types/documentClassification";
import { documentTypeToCategory } from "@/types/documentClassification";

// ============================================
// TYPES
// ============================================

export type IncomeSourceType = "salary" | "rent" | "investment" | "business" | "other";

export interface IncomeSource {
  type: IncomeSourceType;
  label: string;
  icon: string; // lucide icon name
}

export interface TaxScenario {
  type: string;
  label: string;
  rate: string;
  description: string;
  militaryTax?: string;
}

export interface CabinetUpdate {
  field: string;
  value: string;
  label: string;
  description: string;
}

export interface UploadClassificationResult {
  documentCategory: DocumentCategory;
  categoryLabel: string;
  incomeSource?: IncomeSource;
  taxScenario?: TaxScenario;
  cabinetUpdates: CabinetUpdate[];
  confidence: number;
  tags: string[];
  warnings: string[];
}

// ============================================
// INCOME SOURCE DETECTION RULES
// ============================================

const INCOME_SOURCE_CONFIG: Record<IncomeSourceType, IncomeSource> = {
  salary: { type: "salary", label: "Заробітна плата", icon: "briefcase" },
  rent: { type: "rent", label: "Орендний дохід", icon: "home" },
  investment: { type: "investment", label: "Інвестиційний дохід", icon: "trending-up" },
  business: { type: "business", label: "Підприємницький дохід", icon: "building-2" },
  other: { type: "other", label: "Інший дохід", icon: "circle-dot" },
};

// ============================================
// TAX SCENARIOS
// ============================================

const TAX_SCENARIOS: Record<string, TaxScenario> = {
  "ep-5": {
    type: "ep-5",
    label: "Єдиний податок 5%",
    rate: "5%",
    description: "ФОП 3 група, єдиний податок 5% від доходу",
    militaryTax: "5% ВЗ",
  },
  "ep-3": {
    type: "ep-3",
    label: "Єдиний податок 3%",
    rate: "3% + ПДВ",
    description: "ФОП 3 група, єдиний податок 3% + ПДВ",
    militaryTax: "5% ВЗ",
  },
  "pdfo-18": {
    type: "pdfo-18",
    label: "ПДФО 18% + ВЗ",
    rate: "18% + 5%",
    description: "Загальна система: ПДФО 18% + військовий збір 5%",
    militaryTax: "5% ВЗ",
  },
  "pdfo-5-passive": {
    type: "pdfo-5-passive",
    label: "ПДФО 5% (пасивний дохід)",
    rate: "5% + 5%",
    description: "Орендний/пасивний дохід: ПДФО 5% + військовий збір 5%",
    militaryTax: "5% ВЗ",
  },
  "pdfo-18-investment": {
    type: "pdfo-18-investment",
    label: "ПДФО 18% (інвестиційний дохід)",
    rate: "18% + 5%",
    description: "Інвестиційний прибуток: ПДФО 18% + військовий збір 5%",
    militaryTax: "5% ВЗ",
  },
  "property-sale": {
    type: "property-sale",
    label: "Продаж майна",
    rate: "5% / 18%",
    description: "Перший продаж за рік — 5%, інші — 18% + 5% ВЗ",
    militaryTax: "5% ВЗ",
  },
};

// ============================================
// CLASSIFICATION FUNCTION
// ============================================

const FINMON_THRESHOLD = 400_000; // Поріг фінмоніторингу

interface ClassifyInput {
  documentType: DocumentType;
  amount?: number;
  subject?: string;
  contractorName?: string;
  keyTerms?: string[];
}

export function classifyUploadedDocument(input: ClassifyInput): UploadClassificationResult {
  const { documentType, amount, subject, contractorName, keyTerms } = input;
  
  const category = documentTypeToCategory[documentType] || "operational";
  const tags: string[] = [];
  const warnings: string[] = [];
  const cabinetUpdates: CabinetUpdate[] = [];
  
  let incomeSource: IncomeSource | undefined;
  let taxScenario: TaxScenario | undefined;

  // Category label
  const categoryLabels: Record<string, string> = {
    contractual: "Договірний",
    financial: "Фінансовий",
    regulatory: "Регуляторний",
    operational: "Операційний",
    hr: "Кадровий",
  };

  // ---- RULE ENGINE ----

  const subjectLower = (subject || "").toLowerCase();
  const contractorLower = (contractorName || "").toLowerCase();
  const termsJoined = (keyTerms || []).join(" ").toLowerCase();
  const allText = `${subjectLower} ${contractorLower} ${termsJoined}`;

  // Detect IT/business services
  const isIT = /it[-\s]?послуг|розробк|програм|software|web|веб|digital|діджитал/.test(allText);
  const isRent = /оренд|найм|lease|rental/.test(allText);
  const isInvestment = /інвест|дивіденд|dividend|відсотк|interest|акці|share|брокер/.test(allText);
  const isSalary = /зарплат|salary|оплата праці|трудов/.test(allText);

  // 1. Contract classification
  if (["contract", "supply-contract", "fop-service-contract"].includes(documentType)) {
    tags.push("договір");
    
    if (isIT) {
      incomeSource = INCOME_SOURCE_CONFIG.business;
      taxScenario = TAX_SCENARIOS["ep-5"];
      tags.push("IT-послуги", "ФОП");
      cabinetUpdates.push({
        field: "incomeSource",
        value: "business",
        label: "Додати джерело доходу: Підприємницький",
        description: "На основі договору про IT-послуги",
      });
    } else if (isRent) {
      incomeSource = INCOME_SOURCE_CONFIG.rent;
      taxScenario = TAX_SCENARIOS["pdfo-5-passive"];
      tags.push("оренда", "пасивний-дохід");
      cabinetUpdates.push({
        field: "incomeSource",
        value: "rent",
        label: "Додати джерело доходу: Орендний",
        description: "На основі договору оренди",
      });
    } else {
      incomeSource = INCOME_SOURCE_CONFIG.business;
      taxScenario = TAX_SCENARIOS["ep-5"];
      tags.push("послуги");
    }
  }

  // 2. Rental agreement
  if (documentType === "rental-agreement") {
    incomeSource = INCOME_SOURCE_CONFIG.rent;
    taxScenario = TAX_SCENARIOS["pdfo-5-passive"];
    tags.push("оренда", "пасивний-дохід");
    cabinetUpdates.push({
      field: "incomeSource",
      value: "rent",
      label: "Додати джерело доходу: Орендний",
      description: "На основі договору оренди нерухомості",
    });
  }

  // 3. Invoice / Act
  if (["invoice", "act"].includes(documentType)) {
    tags.push("фінансовий");
    if (isRent) {
      incomeSource = INCOME_SOURCE_CONFIG.rent;
      taxScenario = TAX_SCENARIOS["pdfo-5-passive"];
      tags.push("оренда");
    } else {
      incomeSource = INCOME_SOURCE_CONFIG.business;
      taxScenario = TAX_SCENARIOS["ep-5"];
    }
  }

  // 4. Tax invoice
  if (documentType === "tax-invoice") {
    incomeSource = INCOME_SOURCE_CONFIG.business;
    taxScenario = TAX_SCENARIOS["ep-3"];
    tags.push("ПДВ", "податкова-накладна");
  }

  // 5. Bank statement
  if (documentType === "bank-statement") {
    tags.push("банк", "виписка");
    // Can't determine income source from bank statement alone
  }

  // 6. HR documents → salary
  if (["employment-order", "vacation-order", "dismissal-order"].includes(documentType)) {
    incomeSource = INCOME_SOURCE_CONFIG.salary;
    taxScenario = TAX_SCENARIOS["pdfo-18"];
    tags.push("кадри", "зарплата");
    cabinetUpdates.push({
      field: "incomeSource",
      value: "salary",
      label: "Додати джерело доходу: Заробітна плата",
      description: "На основі кадрового документа",
    });
  }

  // 7. Salary detection from text
  if (!incomeSource && isSalary) {
    incomeSource = INCOME_SOURCE_CONFIG.salary;
    taxScenario = TAX_SCENARIOS["pdfo-18"];
  }

  // 8. Investment detection
  if (!incomeSource && isInvestment) {
    incomeSource = INCOME_SOURCE_CONFIG.investment;
    taxScenario = TAX_SCENARIOS["pdfo-18-investment"];
    tags.push("інвестиції");
    cabinetUpdates.push({
      field: "incomeSource",
      value: "investment",
      label: "Додати джерело доходу: Інвестиційний",
      description: "На основі виявлених інвестиційних операцій",
    });
  }

  // ---- WARNINGS ----

  if (amount && amount >= FINMON_THRESHOLD) {
    warnings.push(`Сума ${amount.toLocaleString("uk-UA")} ₴ перевищує поріг фінмоніторингу (${FINMON_THRESHOLD.toLocaleString("uk-UA")} ₴)`);
    tags.push("фінмоніторинг");
  }

  // Confidence based on how much we could classify
  let confidence = 60;
  if (incomeSource) confidence += 15;
  if (taxScenario) confidence += 15;
  if (category !== "operational") confidence += 10;

  return {
    documentCategory: category,
    categoryLabel: categoryLabels[category] || category,
    incomeSource,
    taxScenario,
    cabinetUpdates,
    confidence: Math.min(confidence, 98),
    tags,
    warnings,
  };
}

// ============================================
// PROPERTY CLASSIFICATION (for AddPropertySheet)
// ============================================

export interface PropertyClassificationResult {
  taxScenarioOnSale: TaxScenario;
  requiresDeclaration: boolean;
  declarationReason?: string;
  tags: string[];
}

export function classifyPropertyDocument(input: {
  acquisitionMethod: string;
  estimatedValue?: number;
  ownershipYears?: number;
}): PropertyClassificationResult {
  const { acquisitionMethod, estimatedValue, ownershipYears } = input;
  const tags: string[] = [];

  let taxScenarioOnSale = TAX_SCENARIOS["property-sale"];
  let requiresDeclaration = false;
  let declarationReason: string | undefined;

  // If inherited or gifted — different tax treatment
  if (acquisitionMethod === "inheritance" || acquisitionMethod === "gift") {
    tags.push("спадщина/дарування");
    if (ownershipYears && ownershipYears < 3) {
      taxScenarioOnSale = TAX_SCENARIOS["pdfo-18"];
      tags.push("менше-3-років");
    }
  }

  // Value threshold for declaration
  if (estimatedValue && estimatedValue >= FINMON_THRESHOLD) {
    requiresDeclaration = true;
    declarationReason = `Вартість ${estimatedValue.toLocaleString("uk-UA")} ₴ перевищує поріг декларування`;
    tags.push("декларування");
  }

  return {
    taxScenarioOnSale,
    requiresDeclaration,
    declarationReason,
    tags,
  };
}
