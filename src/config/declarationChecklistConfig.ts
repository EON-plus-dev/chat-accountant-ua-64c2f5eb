/**
 * Declaration Checklist Config
 * Аналізує завантажені документи в кабінеті individual
 * та визначає які податкові сценарії активні і яких документів бракує.
 */

import type { Document } from "@/config/documentFlowConfig";
import {
  TrendingUp,
  Globe,
  Car,
  Home,
  Building,
  GraduationCap,
  Landmark,
  FileText,
  type LucideIcon,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export type TaxScenarioId =
  | "investment-income"
  | "foreign-salary"
  | "vehicle-sale"
  | "property-sale"
  | "rental-income"
  | "tax-discount"
  | "inheritance"
  | "cik-report";

export interface RequiredDocument {
  id: string;
  label: string;
  description: string;
  /** Document types that satisfy this requirement */
  matchTypes?: string[];
  /** Keywords to search in title/aiSummary */
  matchKeywords?: string[];
  /** Field keys that must exist */
  matchFieldKeys?: string[];
  isOptional?: boolean;
  priority: "critical" | "high" | "medium" | "low";
}

export interface ScenarioDetectionRule {
  /** Document types that trigger this scenario */
  triggerTypes?: string[];
  /** Keywords in title/aiSummary that trigger */
  triggerKeywords?: string[];
}

export interface DeclarationScenario {
  id: TaxScenarioId;
  title: string;
  icon: LucideIcon;
  taxArticle: string;
  detectionRules: ScenarioDetectionRule[];
  requiredDocuments: RequiredDocument[];
}

export interface ScenarioAnalysisResult {
  scenario: DeclarationScenario;
  isActive: boolean;
  documents: {
    required: RequiredDocument;
    found: Document | null;
    status: "found" | "missing" | "optional-missing";
  }[];
  completionPercent: number;
  missingCount: number;
  optionalMissingCount: number;
}

export interface DeclarationAnalysisResult {
  activeScenarios: ScenarioAnalysisResult[];
  totalRequired: number;
  totalFound: number;
  totalMissing: number;
  totalOptionalMissing: number;
  completionPercent: number;
  readyToFile: boolean;
}

// ============================================
// SCENARIOS
// ============================================

export const DECLARATION_SCENARIOS: DeclarationScenario[] = [
  {
    id: "investment-income",
    title: "Інвестиційний дохід",
    icon: TrendingUp,
    taxArticle: "ст. 170.2 ПКУ",
    detectionRules: [
      { triggerKeywords: ["Interactive Brokers", "IBKR", "брокерський звіт", "Activity Statement"] },
      { triggerKeywords: ["акцій", "дивіденди", "інвестиційний прибуток"] },
    ],
    requiredDocuments: [
      {
        id: "inv-broker-stmt",
        label: "Брокерський звіт (Activity Statement)",
        description: "Річний звіт від брокера з деталями операцій",
        matchKeywords: ["Activity Statement", "брокерський звіт", "IBKR"],
        priority: "critical",
      },
      {
        id: "inv-fifo-calc",
        label: "FIFO-розрахунок інвестиційного прибутку",
        description: "Розрахунок прибутку/збитку за методом FIFO",
        matchKeywords: ["FIFO", "розрахунок інвестиційного прибутку"],
        priority: "critical",
      },
      {
        id: "inv-currency-rates",
        label: "Курси НБУ на дати операцій",
        description: "Довідка про курси валют для конвертації",
        matchKeywords: ["курс НБУ", "валютний курс"],
        isOptional: true,
        priority: "low",
      },
    ],
  },
  {
    id: "foreign-salary",
    title: "Іноземна зарплата",
    icon: Globe,
    taxArticle: "ст. 170.11 ПКУ, КУПО",
    detectionRules: [
      { triggerKeywords: ["іноземн", "Zaświadczenie", "foreign income", "Польщ"] },
      { triggerKeywords: ["зарплата", "zarobk", "PIT"] },
    ],
    requiredDocuments: [
      {
        id: "fs-income-cert",
        label: "Довідка про доходи від іноземного роботодавця",
        description: "Zaświadczenie o zarobkach або аналог",
        matchKeywords: ["Zaświadczenie", "іноземн", "foreign income", "довідка про доходи"],
        matchTypes: ["certificate"],
        priority: "critical",
      },
      {
        id: "fs-residency-cert",
        label: "Сертифікат податкового резидентства",
        description: "Для застосування КУПО (уникнення подвійного оподаткування)",
        matchKeywords: ["Certyfikat Rezydencji", "резидентств", "certificate of residence"],
        priority: "critical",
      },
      {
        id: "fs-kupo-calc",
        label: "Розрахунок КУПО (залік іноземного податку)",
        description: "Розрахунок суми зарахування сплаченого за кордоном податку",
        matchKeywords: ["КУПО", "залік податку", "подвійне оподаткуван"],
        priority: "high",
      },
    ],
  },
  {
    id: "vehicle-sale",
    title: "Продаж автомобіля",
    icon: Car,
    taxArticle: "ст. 173.2 ПКУ",
    detectionRules: [
      { triggerKeywords: ["купівлі-продажу автомобіля", "продаж авто", "Toyota", "транспортн"] },
      { triggerTypes: ["sale-agreement"], triggerKeywords: ["авто", "транспорт", "ТЗ"] },
    ],
    requiredDocuments: [
      {
        id: "vs-sale-contract",
        label: "Договір купівлі-продажу авто",
        description: "Нотаріально засвідчений договір",
        matchKeywords: ["купівлі-продажу автомобіля", "продаж авто"],
        matchTypes: ["sale-agreement"],
        priority: "critical",
      },
      {
        id: "vs-tech-passport",
        label: "Свідоцтво про реєстрацію ТЗ (техпаспорт)",
        description: "Для підтвердження характеристик авто",
        matchKeywords: ["техпаспорт", "свідоцтво про реєстрацію ТЗ", "реєстр. номер"],
        priority: "high",
      },
      {
        id: "vs-valuation",
        label: "Оціночна вартість авто",
        description: "Експертна оцінка (рекомендовано для зниження ризиків)",
        matchKeywords: ["оціночна вартість", "експертна оцінка", "оцінка авто"],
        isOptional: true,
        priority: "medium",
      },
    ],
  },
  {
    id: "property-sale",
    title: "Продаж нерухомості",
    icon: Home,
    taxArticle: "ст. 172.1 ПКУ",
    detectionRules: [
      { triggerKeywords: ["купівлі-продажу", "квартир", "нерухомост"], triggerTypes: ["sale-agreement"] },
      { triggerKeywords: ["частк", "нотаріальний договір"] },
    ],
    requiredDocuments: [
      {
        id: "ps-sale-contract",
        label: "Договір купівлі-продажу нерухомості",
        description: "Нотаріальний договір з інформацією про ціну та об'єкт",
        matchKeywords: ["купівлі-продажу", "квартир", "нерухомост"],
        matchTypes: ["sale-agreement"],
        priority: "critical",
      },
      {
        id: "ps-ownership-doc",
        label: "Документ на право власності",
        description: "Свідоцтво про спадщину, договір дарування тощо",
        matchKeywords: ["право на спадщину", "право власності", "свідоцтво про спадщину"],
        priority: "critical",
      },
      {
        id: "ps-registry-extract",
        label: "Витяг з реєстру нерухомості",
        description: "Підтвердження права власності та частки",
        matchKeywords: ["витяг з", "реєстр", "речових прав"],
        priority: "high",
      },
    ],
  },
  {
    id: "rental-income",
    title: "Орендний дохід",
    icon: Building,
    taxArticle: "ст. 170.1 ПКУ",
    detectionRules: [
      { triggerTypes: ["rental-agreement"] },
      { triggerKeywords: ["оренд", "орендна плата", "орендар"] },
    ],
    requiredDocuments: [
      {
        id: "ri-rental-contract",
        label: "Договір оренди",
        description: "Чинний договір з орендарем",
        matchTypes: ["rental-agreement"],
        matchKeywords: ["оренд"],
        priority: "critical",
      },
      {
        id: "ri-bank-statement",
        label: "Банківські виписки (підтвердження оплати)",
        description: "Виписки з рахунку, що підтверджують надходження орендної плати",
        matchTypes: ["bank-statement"],
        matchKeywords: ["виписка", "орендні платежі"],
        priority: "high",
      },
    ],
  },
  {
    id: "tax-discount",
    title: "Податкова знижка",
    icon: GraduationCap,
    taxArticle: "ст. 166 ПКУ",
    detectionRules: [
      { triggerKeywords: ["навчання", "квитанція за навчання", "податкова знижка"] },
      { triggerKeywords: ["реабілітац", "лікування", "медичн"] },
    ],
    requiredDocuments: [
      {
        id: "td-payment-receipts",
        label: "Квитанції про оплату (навчання/медицина)",
        description: "Платіжні документи за навчання або лікування",
        matchTypes: ["receipt"],
        matchKeywords: ["квитанція", "навчання", "реабілітац", "лікування"],
        priority: "critical",
      },
      {
        id: "td-university-cert",
        label: "Довідка з ВНЗ (форма для ДПС)",
        description: "Довідка, що підтверджує навчання у ліцензованому закладі",
        matchKeywords: ["довідка з ВНЗ", "довідка з університету", "довідка про навчання"],
        priority: "high",
      },
      {
        id: "td-employer-income",
        label: "Довідка про доходи від роботодавця",
        description: "Форма ДФ для підтвердження утриманого ПДФО",
        matchKeywords: ["довідка про доходи", "Діджитал Академі"],
        matchTypes: ["certificate"],
        priority: "high",
      },
      {
        id: "td-medical-license",
        label: "Ліцензія медичного закладу",
        description: "Для підтвердження права на знижку за медичні витрати",
        matchKeywords: ["ліцензія медичн", "ліцензія закладу"],
        isOptional: true,
        priority: "medium",
      },
    ],
  },
  {
    id: "inheritance",
    title: "Спадщина",
    icon: Landmark,
    taxArticle: "ст. 174.2 ПКУ",
    detectionRules: [
      { triggerKeywords: ["спадщин", "спадкоємц", "свідоцтво про право на спадщину"] },
    ],
    requiredDocuments: [
      {
        id: "inh-certificate",
        label: "Свідоцтво про право на спадщину",
        description: "Нотаріальне свідоцтво з визначенням об'єкта та черги",
        matchKeywords: ["свідоцтво про право на спадщину", "спадщин"],
        priority: "critical",
      },
      {
        id: "inh-valuation",
        label: "Оцінка успадкованого майна",
        description: "Оціночна вартість для декларації",
        matchKeywords: ["оціночна вартість", "оцінка майна"],
        isOptional: true,
        priority: "medium",
      },
    ],
  },
  {
    id: "cik-report",
    title: "Звіт КІК (контрольована іноземна компанія)",
    icon: FileText,
    taxArticle: "ст. 39-2 ПКУ",
    detectionRules: [
      { triggerKeywords: ["КІК", "контрольован", "CFC", "controlled foreign"] },
    ],
    requiredDocuments: [
      {
        id: "cik-financial",
        label: "Фінансова звітність КІК",
        description: "Аудитований звіт або management accounts",
        matchKeywords: ["фінансова звітність КІК", "CFC financial"],
        priority: "critical",
      },
      {
        id: "cik-ownership",
        label: "Документ про частку в іноземній компанії",
        description: "Shareholders register, certificate of incorporation",
        matchKeywords: ["shareholders", "частка", "іноземна компанія"],
        priority: "critical",
      },
    ],
  },
];

// ============================================
// ANALYSIS FUNCTION
// ============================================

function matchesDocument(
  doc: Document,
  rule: { matchTypes?: string[]; matchKeywords?: string[] }
): boolean {
  const textToSearch = `${doc.title} ${doc.aiSummary || ""}`.toLowerCase();

  if (rule.matchTypes?.length) {
    if (rule.matchTypes.includes(doc.type)) return true;
  }

  if (rule.matchKeywords?.length) {
    return rule.matchKeywords.some((kw) => textToSearch.includes(kw.toLowerCase()));
  }

  return false;
}

function isScenarioTriggered(
  scenario: DeclarationScenario,
  documents: Document[]
): boolean {
  return scenario.detectionRules.some((rule) => {
    return documents.some((doc) => {
      const textToSearch = `${doc.title} ${doc.aiSummary || ""}`.toLowerCase();

      const typeMatch =
        !rule.triggerTypes?.length ||
        rule.triggerTypes.includes(doc.type);

      const kwMatch =
        !rule.triggerKeywords?.length ||
        rule.triggerKeywords.some((kw) => textToSearch.includes(kw.toLowerCase()));

      // If both are specified, both must match
      if (rule.triggerTypes?.length && rule.triggerKeywords?.length) {
        return typeMatch && kwMatch;
      }

      // Otherwise the one that's specified must match
      return rule.triggerTypes?.length ? typeMatch : kwMatch;
    });
  });
}

function findMatchingDocument(
  req: RequiredDocument,
  documents: Document[]
): Document | null {
  return (
    documents.find((doc) =>
      matchesDocument(doc, {
        matchTypes: req.matchTypes,
        matchKeywords: req.matchKeywords,
      })
    ) || null
  );
}

export function analyzeDocumentsForDeclaration(
  documents: Document[]
): DeclarationAnalysisResult {
  const activeScenarios: ScenarioAnalysisResult[] = [];

  for (const scenario of DECLARATION_SCENARIOS) {
    if (!isScenarioTriggered(scenario, documents)) continue;

    const docResults = scenario.requiredDocuments.map((req) => {
      const found = findMatchingDocument(req, documents);
      return {
        required: req,
        found,
        status: found
          ? ("found" as const)
          : req.isOptional
            ? ("optional-missing" as const)
            : ("missing" as const),
      };
    });

    const mandatoryDocs = docResults.filter((d) => !d.required.isOptional);
    const foundMandatory = mandatoryDocs.filter((d) => d.status === "found").length;
    const totalMandatory = mandatoryDocs.length;
    const completionPercent =
      totalMandatory > 0 ? Math.round((foundMandatory / totalMandatory) * 100) : 100;

    activeScenarios.push({
      scenario,
      isActive: true,
      documents: docResults,
      completionPercent,
      missingCount: docResults.filter((d) => d.status === "missing").length,
      optionalMissingCount: docResults.filter((d) => d.status === "optional-missing").length,
    });
  }

  const totalRequired = activeScenarios.reduce(
    (sum, s) => sum + s.documents.filter((d) => !d.required.isOptional).length,
    0
  );
  const totalFound = activeScenarios.reduce(
    (sum, s) => sum + s.documents.filter((d) => d.status === "found" && !d.required.isOptional).length,
    0
  );
  const totalMissing = activeScenarios.reduce((sum, s) => sum + s.missingCount, 0);
  const totalOptionalMissing = activeScenarios.reduce(
    (sum, s) => sum + s.optionalMissingCount,
    0
  );
  const completionPercent =
    totalRequired > 0 ? Math.round((totalFound / totalRequired) * 100) : 100;

  return {
    activeScenarios,
    totalRequired,
    totalFound,
    totalMissing,
    totalOptionalMissing,
    completionPercent,
    readyToFile: totalMissing === 0,
  };
}
