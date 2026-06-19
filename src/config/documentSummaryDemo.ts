import { 
  FileSignature, 
  Receipt, 
  FileCheck2, 
  AlertTriangle, 
  Truck, 
  Home,
  type LucideIcon 
} from "lucide-react";
import { format } from "date-fns";
import type { 
  ContractSummary, 
  InvoiceSummary, 
  ActSummary,
  DocumentSummary,
  DocumentChecklist,
  ChecklistItem,
  LiabilityLimitation,
  ConfidentialityClause,
} from "@/types/documentSummary";
import { generateDynamicChecklist } from "@/lib/documentAnalysis/generateChecklist";

// ============================================
// LEGAL CLAUSE VARIANTS BY CONTRACT TYPE
// ============================================

interface LegalClauses {
  liability: LiabilityLimitation;
  confidentiality: ConfidentialityClause;
  governingLaw: string;
}

const legalClausesIT: LegalClauses = {
  liability: {
    maxAmount: "не перевищує суму договору",
    exclusions: ["навмисні дії", "груба недбалість", "порушення конфіденційності"],
  },
  confidentiality: {
    duration: "5 років після закінчення договору",
    scope: ["комерційна таємниця", "технічна документація", "персональні дані"],
  },
  governingLaw: "Законодавство України",
};

const legalClausesRental: LegalClauses = {
  liability: {
    maxAmount: "річна сума орендної плати",
    exclusions: ["форс-мажор", "природне зношення майна"],
  },
  confidentiality: {
    duration: "протягом дії договору",
    scope: ["комерційні умови оренди"],
  },
  governingLaw: "Законодавство України",
};

const legalClausesSupply: LegalClauses = {
  liability: {
    maxAmount: "не перевищує 20% вартості партії",
    exclusions: ["транспортні затримки", "обставини непереборної сили"],
  },
  confidentiality: {
    duration: "3 роки після закінчення договору",
    scope: ["цінові умови", "обсяги поставок"],
  },
  governingLaw: "Законодавство України",
};

const getLegalClausesByDocType = (docType: string): LegalClauses => {
  switch (docType) {
    case "rental-agreement":
      return legalClausesRental;
    case "supply-contract":
      return legalClausesSupply;
    case "fop-service-contract":
    case "contract":
    case "nda":
    default:
      return legalClausesIT;
  }
};

// ============================================
// ДЕМО СЦЕНАРІЇ
// ============================================

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fileName: string;
  summary: ContractSummary | InvoiceSummary | ActSummary | DocumentSummary;
  checklist: DocumentChecklist;
}

// ============================================
// СЦЕНАРІЙ 1: Договір з невідомим контрагентом
// ============================================

const scenario1Summary: ContractSummary = {
  id: "demo-contract-1",
  documentType: "contract",
  confidence: 94,
  parties: [
    {
      role: "executor",
      name: "ТОВ «Нова Компанія»",
      code: "99887766",
      isKnown: false,
      validationStatus: "pending",
    },
    {
      role: "client",
      name: "ФОП Мельник О.В.",
      code: "3456789012",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
  ],
  keyDates: [
    { type: "document", date: "2025-01-15", label: "Дата договору" },
    { type: "valid-from", date: "2025-01-15", label: "Початок дії" },
    { type: "valid-until", date: "2026-01-15", label: "Закінчення дії", daysUntil: 365 },
    { type: "prolongation", date: "2025-12-15", label: "Пролонгація", daysUntil: 335 },
  ],
  financials: {
    amount: 180000,
    currency: "UAH",
    vatIncluded: false,
    paymentTerms: "Щомісячно до 10 числа",
    paymentDays: 10,
  },
  description: "Договір на IT-послуги з ТОВ «Нова Компанія» на 180 000 ₴ терміном 12 місяців. Оплата 15 000 ₴/міс до 10 числа.",
  shortSummary: "IT-послуги, ТОВ «Нова Компанія», 180 000 ₴, 12 міс",
  fullSummary: "Договір №ДОГ-2025-048 про надання послуг з розробки та технічної підтримки веб-додатку. Виконавець — ТОВ «Нова Компанія» (ЄДРПОУ 99887766), яка не зареєстрована в системі контрагентів. Договір передбачає щомісячну оплату 15 000 грн протягом 12 місяців. Загальна сума — 180 000 грн без ПДВ. Передбачена автоматична пролонгація на 12 місяців за відсутності повідомлення за 30 днів. До договору мають бути додані: Додаток 1 (Специфікація робіт) та Додаток 2 (Графік виконання).",
  keyTerms: [
    "Термін дії: 12 місяців",
    "Оплата: 15 000 ₴/міс до 10 числа",
    "Автопролонгація на 12 місяців",
    "Повідомлення про розірвання: за 30 днів",
    "Штраф за прострочення: 0.1% за день",
  ],
  compliance: {
    kvedMatch: true,
    warnings: [
      "Новий контрагент — рекомендуємо перевірити реквізити перед підписанням",
      "Відсутні обов'язкові додатки до договору",
    ],
  },
  analysis: {
    processedAt: new Date().toISOString(),
    version: "1.0",
    model: "DIH Demo",
    confidence: 94,
  },
  // Field Confidence Breakdown demo data with boundingBox for PDF highlighting
  fieldConfidences: [
    {
      fieldName: "parties.executor.name",
      fieldLabel: "Назва виконавця",
      value: "ТОВ «Нова Компанія»",
      confidence: 94,
      method: "ocr",
      pageNumber: 1,
      boundingBox: { x: 40, y: 165, width: 200, height: 18 },
      alternatives: [
        { value: "ТОВ Нова Компанія", confidence: 85, source: "ocr" },
        { value: "TOB «Нова Компанія»", confidence: 72, source: "pattern" },
      ],
    },
    {
      fieldName: "parties.executor.code",
      fieldLabel: "ЄДРПОУ виконавця",
      value: "99887766",
      confidence: 98,
      method: "pattern",
      pageNumber: 1,
      boundingBox: { x: 170, y: 185, width: 80, height: 14 },
    },
    {
      fieldName: "parties.client.name",
      fieldLabel: "Назва замовника",
      value: "ФОП Мельник О.В.",
      confidence: 97,
      method: "ocr",
      pageNumber: 1,
      boundingBox: { x: 330, y: 165, width: 180, height: 18 },
    },
    {
      fieldName: "financials.amount",
      fieldLabel: "Сума договору",
      value: "180 000 грн",
      confidence: 96,
      method: "table",
      pageNumber: 1,
      boundingBox: { x: 40, y: 500, width: 180, height: 18 },
    },
    {
      fieldName: "contract.subject",
      fieldLabel: "Предмет договору",
      value: "Розробка та технічна підтримка веб-додатку",
      confidence: 78,
      method: "nlp",
      needsReview: true,
      pageNumber: 1,
      boundingBox: { x: 40, y: 250, width: 480, height: 36 },
      alternatives: [
        { value: "Розробка веб-додатку", confidence: 82, source: "nlp" },
        { value: "Технічна підтримка ПЗ", confidence: 65, source: "nlp" },
      ],
    },
    {
      fieldName: "keyDates.validUntil",
      fieldLabel: "Дата закінчення",
      value: "15.01.2026",
      confidence: 99,
      method: "pattern",
      pageNumber: 1,
      boundingBox: { x: 200, y: 135, width: 80, height: 14 },
    },
    {
      fieldName: "contract.prolongation.noticePeriod",
      fieldLabel: "Термін попередження",
      value: "30 днів",
      confidence: 65,
      method: "nlp",
      needsReview: true,
      pageNumber: 1,
      boundingBox: { x: 40, y: 380, width: 120, height: 14 },
      alternatives: [
        { value: "14 днів", confidence: 45, source: "nlp" },
        { value: "60 днів", confidence: 30, source: "nlp" },
      ],
    },
    {
      fieldName: "contract.penalties.latePayment",
      fieldLabel: "Штраф за прострочення",
      value: "0.1% за день",
      confidence: 91,
      method: "pattern",
      pageNumber: 1,
      boundingBox: { x: 40, y: 420, width: 150, height: 14 },
    },
  ],
  contract: {
    subject: "Розробка та технічна підтримка веб-додатку",
    terms: [
      "Щомісячна оплата до 10 числа",
      "Акт виконаних робіт щомісяця",
      "Гарантійний строк: 6 місяців",
    ],
    prolongation: {
      type: "auto",
      noticePeriod: 30,
      nextDate: "2025-12-15",
      condition: "За відсутності письмового повідомлення",
    },
    referencedDocuments: [
      { type: "Додаток", description: "Додаток 1 — Специфікація робіт", status: "missing" },
      { type: "Додаток", description: "Додаток 2 — Графік виконання", status: "missing" },
    ],
    signatories: [
      { party: "Замовник", position: "ФОП", name: "Мельник О.В.", signatureType: "pending" },
      { party: "Виконавець", position: "Директор", name: "Петренко І.С.", signatureType: "pending" },
    ],
    // Legal clauses
    penalties: [
      { type: "late-payment", rate: "0.1% за день", maxAmount: "10% від суми" },
      { type: "non-delivery", rate: "5% від суми етапу" },
    ],
    termination: {
      noticePeriod: 30,
      grounds: ["за згодою сторін", "односторонньо з попередженням за 30 днів", "при суттєвому порушенні умов"],
      consequences: ["повернення авансу", "компенсація фактичних витрат"],
    },
    disputes: {
      method: "court",
      jurisdiction: "Господарський суд м. Києва",
    },
    forceMajeure: [
      "Війна, воєнні дії, блокада",
      "Стихійні лиха (землетрус, повінь)",
      "Рішення державних органів, що унеможливлюють виконання",
    ],
    liability: {
      maxAmount: "не перевищує суму договору",
      exclusions: ["навмисні дії", "груба недбалість", "порушення конфіденційності"],
    },
    confidentiality: {
      duration: "5 років після закінчення договору",
      scope: ["комерційна таємниця", "технічна документація", "персональні дані"],
    },
    governingLaw: "Законодавство України",
  },
  // AI-detected risks with suggestions
  risks: [
    {
      id: "risk-s1-warranty",
      category: "legal" as const,
      severity: "medium" as const,
      title: "Відсутня гарантія на послуги",
      description: "Договір не містить чіткого положення про гарантійний термін на виконані роботи з технічної підтримки",
      sourceSection: "Розділ 4. Якість послуг",
      suggestion: {
        text: "Гарантійний термін на надані послуги становить 6 (шість) місяців з дати підписання акту виконаних робіт. У разі виявлення недоліків, Виконавець зобов'язаний усунути їх безоплатно протягом 10 робочих днів.",
        targetSection: "п. 4.2",
        insertPosition: "append" as const,
        confidence: 92,
      },
    },
    {
      id: "risk-s1-penalty-asymmetry",
      category: "financial" as const,
      severity: "high" as const,
      title: "Асиметричні штрафні санкції",
      description: "Штраф за прострочення оплати (0.1%/день) нижчий за штраф за невиконання (5% від суми етапу) — невигідно для Замовника",
      sourceSection: "Розділ 7. Відповідальність сторін",
      potentialImpact: 9000,
      suggestion: {
        text: "Вирівняти штрафні санкції: пеня за прострочення — 0.1% за кожен день, але не більше 5% від суми заборгованості для обох сторін.",
        targetSection: "п. 7.1-7.2",
        insertPosition: "replace" as const,
        confidence: 85,
      },
    },
  ],
};

const scenario1Checklist: DocumentChecklist = {
  documentId: "demo-contract-1",
  generatedAt: new Date().toISOString(),
  totalItems: 4,
  completedItems: 0,
  criticalItems: 1,
  completionPercent: 0,
  items: [
    {
      id: "check-1-1",
      type: "unknown-contractor",
      priority: "critical",
      title: "Невідомий контрагент",
      description: "ТОВ «Нова Компанія» (ЄДРПОУ 99887766) не зареєстрована в системі",
      status: "pending",
      action: {
        type: "invite",
        label: "Запросити контрагента",
        prefillData: { name: "ТОВ «Нова Компанія»", code: "99887766" },
      },
    },
    {
      id: "check-1-2",
      type: "missing-annex",
      priority: "high",
      title: "Відсутній Додаток 1",
      description: "Специфікація робіт — обов'язковий додаток до договору",
      status: "pending",
      action: {
        type: "upload",
        label: "Завантажити",
      },
    },
    {
      id: "check-1-3",
      type: "missing-annex",
      priority: "high",
      title: "Відсутній Додаток 2",
      description: "Графік виконання — обов'язковий додаток до договору",
      status: "pending",
      action: {
        type: "upload",
        label: "Завантажити",
      },
    },
    {
      id: "check-1-4",
      type: "prolongation-check",
      priority: "medium",
      title: "Моніторинг пролонгації",
      description: "Нагадування буде створено за 30 днів до 15.12.2025",
      status: "pending",
      action: {
        type: "auto",
        label: "Автоматично",
      },
    },
  ],
};

// ============================================
// СЦЕНАРІЙ 2: Рахунок до існуючого договору
// ============================================

const scenario2Summary: InvoiceSummary = {
  id: "demo-invoice-1",
  documentType: "invoice",
  confidence: 96,
  parties: [
    {
      role: "supplier",
      name: "ФОП Мельник О.В.",
      code: "3456789012",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
    {
      role: "buyer",
      name: "ТОВ «Діджитал Солюшнс»",
      code: "43215678",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "edr",
    },
  ],
  keyDates: [
    { type: "document", date: "2025-01-20", label: "Дата рахунку" },
    { type: "payment-due", date: "2025-01-25", label: "Термін оплати", daysUntil: 5 },
  ],
  financials: {
    amount: 15000,
    currency: "UAH",
    vatIncluded: false,
    paymentTerms: "5 банківських днів",
    paymentDays: 5,
  },
  description: "Рахунок на 15 000 ₴ від ТОВ «Діджитал Солюшнс» за IT-підтримку за січень. Сплатити до 25.01.2025.",
  shortSummary: "IT-підтримка, ТОВ «Діджитал Солюшнс», 15 000 ₴, до 25.01",
  fullSummary: "Рахунок №РАХ-2025-001 від 20.01.2025 на суму 15 000 грн за послуги технічної підтримки за січень 2025 року. Покупець — ТОВ «Діджитал Солюшнс» (ЄДРПОУ 43215678), зареєстрований контрагент. Рахунок виставлено на основі Договору №ДОГ-2024-023 від 15.03.2024. Термін оплати — 5 банківських днів (до 25.01.2025). Платник єдиного податку — без ПДВ.",
  keyTerms: [
    "Термін оплати: 5 банківських днів",
    "Без ПДВ (єдиний податок)",
    "На підставі договору ДОГ-2024-023",
  ],
  compliance: {
    kvedMatch: true,
    warnings: [],
  },
  analysis: {
    processedAt: new Date().toISOString(),
    version: "1.0",
    model: "DIH Demo",
    confidence: 96,
  },
  invoice: {
    items: [
      { name: "Технічна підтримка веб-додатку", quantity: 1, unit: "міс", price: 15000, total: 15000 },
    ],
    linkedContract: {
      id: "contract-2024-023",
      number: "ДОГ-2024-023",
      date: "2024-03-15",
    },
    paymentDueDate: "2025-01-25",
    paymentStatus: "pending",
  },
  // AI-detected risks with suggestions
  risks: [
    {
      id: "risk-s2-payment-term",
      category: "deadline" as const,
      severity: "medium" as const,
      title: "Короткий термін оплати",
      description: "5 банківських днів може бути недостатньо для великих компаній з довгим циклом погодження рахунків",
      sourceSection: "Умови оплати",
      suggestion: {
        text: "Рекомендую збільшити термін оплати до 10 банківських днів для уникнення прострочень та нарахування пені.",
        targetSection: "Термін оплати",
        insertPosition: "replace" as const,
        confidence: 78,
      },
    },
  ],
};

const scenario2Checklist: DocumentChecklist = {
  documentId: "demo-invoice-1",
  generatedAt: new Date().toISOString(),
  totalItems: 3,
  completedItems: 1,
  criticalItems: 0,
  completionPercent: 33,
  items: [
    {
      id: "check-2-1",
      type: "linked-contract",
      priority: "low",
      title: "Договір прив'язано",
      description: "Рахунок прив'язано до ДОГ-2024-023",
      status: "done",
      completedAt: new Date().toISOString(),
      action: {
        type: "navigate",
        label: "Переглянути договір",
        targetRoute: "/cabinets/{cabinetId}/documents/contract-2024-023",
      },
    },
    {
      id: "check-2-2",
      type: "payment-link",
      priority: "medium",
      title: "Очікування оплати",
      description: "Додати до очікуваних платежів на 25.01.2025",
      status: "pending",
      action: {
        type: "navigate",
        label: "Додати до платежів",
        targetRoute: "/cabinets/{cabinetId}/payments",
      },
    },
    {
      id: "check-2-3",
      type: "kudir-entry",
      priority: "medium",
      title: "Запис в КУДіР",
      description: "Автоматичний запис після отримання оплати",
      status: "pending",
      action: {
        type: "auto",
        label: "Автоматично",
      },
    },
  ],
};

// ============================================
// СЦЕНАРІЙ 3: Акт виконаних робіт
// ============================================

const scenario3Summary: ActSummary = {
  id: "demo-act-1",
  documentType: "act",
  confidence: 92,
  parties: [
    {
      role: "executor",
      name: "ФОП Петренко І.С.",
      code: "1234567890",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
    {
      role: "client",
      name: "ФОП Мельник О.В.",
      code: "3456789012",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
  ],
  keyDates: [
    { type: "document", date: "2025-01-18", label: "Дата акту" },
    { type: "signed", date: "2025-01-18", label: "Підписано" },
  ],
  financials: {
    amount: 8500,
    currency: "UAH",
    vatIncluded: false,
  },
  description: "Акт на 8 500 ₴ за UI/UX дизайн від ФОП Петренко. Роботи прийнято, є підставою для оплати.",
  shortSummary: "UI/UX дизайн, ФОП Петренко І.С., 8 500 ₴",
  fullSummary: "Акт виконаних робіт №АКТ-2025-001 від 18.01.2025 на суму 8 500 грн. Виконавець — ФОП Петренко І.С. виконав роботи з розробки UI/UX дизайну мобільного додатку. Роботи виконано в повному обсязі, претензій до якості немає. Акт є підставою для оплати рахунку №РАХ-2025-002.",
  keyTerms: [
    "Роботи виконано в повному обсязі",
    "Претензій до якості немає",
    "Підстава для оплати РАХ-2025-002",
  ],
  compliance: {
    kvedMatch: true,
    warnings: [],
  },
  analysis: {
    processedAt: new Date().toISOString(),
    version: "1.0",
    model: "DIH Demo",
    confidence: 92,
  },
  act: {
    linkedInvoice: {
      id: "invoice-2025-002",
      number: "РАХ-2025-002",
      date: "2025-01-10",
    },
    workDescription: "Розробка UI/UX дизайну мобільного додатку",
    completionDate: "2025-01-18",
    acceptanceStatus: "accepted",
  },
  // AI-detected risks with suggestions - акт без ризиків (усе ок)
  risks: [],
};

const scenario3Checklist: DocumentChecklist = {
  documentId: "demo-act-1",
  generatedAt: new Date().toISOString(),
  totalItems: 3,
  completedItems: 2,
  criticalItems: 0,
  completionPercent: 67,
  items: [
    {
      id: "check-3-1",
      type: "missing-signature",
      priority: "high",
      title: "Підписи сторін",
      description: "Обидві сторони підписали акт",
      status: "done",
      completedAt: new Date().toISOString(),
      action: {
        type: "manual",
        label: "Перевірено",
      },
    },
    {
      id: "check-3-2",
      type: "payment-link",
      priority: "medium",
      title: "Оплата рахунку",
      description: "Підтвердити оплату РАХ-2025-002 на 8 500 грн",
      status: "done",
      completedAt: new Date().toISOString(),
      action: {
        type: "navigate",
        label: "Переглянути рахунок",
        targetRoute: "/cabinets/{cabinetId}/documents/invoice-2025-002",
      },
    },
    {
      id: "check-3-3",
      type: "kudir-entry",
      priority: "medium",
      title: "Запис в КУДіР",
      description: "Записати витрату 8 500 грн в Книгу обліку",
      status: "pending",
      action: {
        type: "navigate",
        label: "Додати в КУДіР",
        targetRoute: "/cabinets/{cabinetId}/income-book",
      },
    },
  ],
};

// ============================================
// СЦЕНАРІЙ 4: Договір з КВЕД-проблемою
// ============================================

const scenario4Summary: ContractSummary = {
  id: "demo-contract-kved",
  documentType: "contract",
  confidence: 91,
  parties: [
    {
      role: "executor",
      name: "ФОП Коваленко А.М.",
      code: "2468013579",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "edr",
    },
    {
      role: "client",
      name: "ФОП Мельник О.В.",
      code: "3456789012",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
  ],
  keyDates: [
    { type: "document", date: "2025-01-22", label: "Дата договору" },
    { type: "valid-from", date: "2025-02-01", label: "Початок дії" },
    { type: "valid-until", date: "2025-12-31", label: "Закінчення дії", daysUntil: 340 },
  ],
  financials: {
    amount: 250000,
    currency: "UAH",
    vatIncluded: false,
    paymentTerms: "За фактом виконання етапів",
  },
  description: "Договір на рекламні послуги з ФОП Коваленко на 250 000 ₴. Оплата за етапами виконання.",
  shortSummary: "Рекламні послуги, ФОП Коваленко А.М., 250 000 ₴",
  fullSummary: "Договір №ДОГ-2025-050 про надання рекламних послуг. Виконавець — ФОП Коваленко А.М. надаватиме послуги з розробки та проведення рекламних кампаній. Загальна сума — 250 000 грн. КРИТИЧНО: Предмет договору (рекламні послуги) потребує КВЕД 73.11, який не зареєстрований для вашого ФОП. Рекомендовано: 1) Додати КВЕД 73.11 або 2) Переглянути предмет договору.",
  keyTerms: [
    "Предмет: рекламні послуги",
    "Оплата: за етапами",
    "Звіт: щомісячно",
  ],
  compliance: {
    kvedMatch: false,
    kvedRequired: ["73.11"],
    kvedMissing: ["73.11 — Рекламні агентства"],
    licenseRequired: [],
    warnings: [
      "КВЕД 73.11 не зареєстрований для вашого ФОП",
      "Рекомендовано додати КВЕД або змінити предмет договору",
    ],
  },
  analysis: {
    processedAt: new Date().toISOString(),
    version: "1.0",
    model: "DIH Demo",
    confidence: 91,
  },
  contract: {
    subject: "Надання рекламних послуг",
    terms: [
      "Розробка рекламних матеріалів",
      "Проведення рекламних кампаній",
      "Звітування про результати",
    ],
    referencedDocuments: [],
    signatories: [
      { party: "Замовник", position: "ФОП", name: "Мельник О.В.", signatureType: "pending" },
      { party: "Виконавець", position: "ФОП", name: "Коваленко А.М.", signatureType: "pending" },
    ],
  },
  // AI-detected risks with suggestions
  risks: [
    {
      id: "risk-s4-kved",
      category: "compliance" as const,
      severity: "critical" as const,
      title: "КВЕД не відповідає предмету договору",
      description: "Предмет договору «рекламні послуги» потребує КВЕД 73.11, який не зареєстрований для вашого ФОП",
      sourceSection: "Преамбула, предмет договору",
      potentialImpact: 250000,
      suggestion: {
        text: "Є два варіанти: 1) Додати КВЕД 73.11 «Рекламні агентства» до вашого ФОП; 2) Змінити предмет договору на «консультаційні послуги з маркетингу» (КВЕД 70.22).",
        targetSection: "Предмет договору",
        insertPosition: "replace" as const,
        confidence: 95,
      },
    },
    {
      id: "risk-s4-no-limit",
      category: "financial" as const,
      severity: "medium" as const,
      title: "Відсутнє обмеження відповідальності",
      description: "Договір не містить обмеження максимальної суми відповідальності сторін",
      sourceSection: "Розділ 6. Відповідальність",
      potentialImpact: 250000,
      suggestion: {
        text: "Сукупна відповідальність кожної Сторони за цим Договором не може перевищувати загальну суму Договору.",
        targetSection: "п. 6.5",
        insertPosition: "append" as const,
        confidence: 88,
      },
    },
  ],
};

const scenario4Checklist: DocumentChecklist = {
  documentId: "demo-contract-kved",
  generatedAt: new Date().toISOString(),
  totalItems: 2,
  completedItems: 0,
  criticalItems: 1,
  completionPercent: 0,
  items: [
    {
      id: "check-4-1",
      type: "kved-mismatch",
      priority: "critical",
      title: "КВЕД не відповідає",
      description: "КВЕД 73.11 (Рекламні агентства) не зареєстрований для вашого ФОП",
      status: "pending",
      action: {
        type: "navigate",
        label: "Налаштування КВЕД",
        targetRoute: "/cabinets/{cabinetId}/settings?section=kved-licensing",
      },
    },
    {
      id: "check-4-2",
      type: "missing-signature",
      priority: "high",
      title: "Підписи сторін",
      description: "Договір очікує підписів обох сторін",
      status: "pending",
      action: {
        type: "manual",
        label: "Підписати",
      },
    },
  ],
};

// ============================================
// СЦЕНАРІЙ 5: Накладна з валідацією
// ============================================

const scenario5Summary: DocumentSummary = {
  id: "demo-waybill-1",
  documentType: "waybill",
  confidence: 89,
  parties: [
    {
      role: "supplier",
      name: "ТОВ «ОфісМаркет»",
      code: "32165498",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "edr",
    },
    {
      role: "buyer",
      name: "ФОП Мельник О.В.",
      code: "3456789012",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
  ],
  keyDates: [
    { type: "document", date: "2025-01-19", label: "Дата накладної" },
  ],
  financials: {
    amount: 4250,
    currency: "UAH",
    vat: 708.33,
    vatIncluded: true,
  },
  description: "Накладна на 4 250 ₴ (з ПДВ) від ТОВ «ОфісМаркет» на офісне приладдя. Товар отримано повністю.",
  shortSummary: "Накладна на офісне приладдя. Постачальник відомий, товари відповідають номенклатурі.",
  fullSummary: "Накладна №НАК-2025-001 від 19.01.2025 на суму 4 250 грн (в т.ч. ПДВ 708.33 грн). Постачальник — ТОВ «ОфісМаркет», зареєстрований контрагент. Товари: папір A4 (5 уп.), картриджі HP (2 шт.), ручки (20 шт.). Товари отримано в повному обсязі.",
  keyTerms: [
    "Товар отримано в повному обсязі",
    "Претензій немає",
    "ПДВ включено",
  ],
  compliance: {
    kvedMatch: true,
    warnings: [],
  },
  analysis: {
    processedAt: new Date().toISOString(),
    version: "1.0",
    model: "DIH Demo",
    confidence: 89,
  },
  // AI-detected risks with suggestions - накладна без критичних ризиків
  risks: [
    {
      id: "risk-s5-no-quality-check",
      category: "legal" as const,
      severity: "low" as const,
      title: "Рекомендація: фіксація якості товарів",
      description: "Накладна не містить детального опису якості отриманих товарів",
      sourceSection: "Примітки до накладної",
      suggestion: {
        text: "Рекомендую додати позначку: «Товар отримано у належній якості, пошкоджень не виявлено, кількість відповідає накладній».",
        targetSection: "Примітки",
        insertPosition: "append" as const,
        confidence: 75,
      },
    },
  ],
};

const scenario5Checklist: DocumentChecklist = {
  documentId: "demo-waybill-1",
  generatedAt: new Date().toISOString(),
  totalItems: 2,
  completedItems: 1,
  criticalItems: 0,
  completionPercent: 50,
  items: [
    {
      id: "check-5-1",
      type: "contractor-validation",
      priority: "low",
      title: "Постачальник перевірено",
      description: "ТОВ «ОфісМаркет» — зареєстрований постачальник",
      status: "done",
      completedAt: new Date().toISOString(),
      action: {
        type: "validate",
        label: "Перевірено",
      },
    },
    {
      id: "check-5-2",
      type: "kudir-entry",
      priority: "medium",
      title: "Запис витрат",
      description: "Записати витрату 4 250 грн в Книгу обліку",
      status: "pending",
      action: {
        type: "navigate",
        label: "Додати в КУДіР",
        targetRoute: "/cabinets/{cabinetId}/income-book",
      },
    },
  ],
};

// ============================================
// СЦЕНАРІЙ 6: Договір оренди з пролонгацією
// ============================================

const scenario6Summary: ContractSummary = {
  id: "demo-rental-1",
  documentType: "rental-agreement",
  confidence: 95,
  parties: [
    {
      role: "lessor",
      name: "ФОП Сидоренко В.П.",
      code: "9876543210",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
    {
      role: "lessee",
      name: "ФОП Мельник О.В.",
      code: "3456789012",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
  ],
  keyDates: [
    { type: "document", date: "2024-02-01", label: "Дата договору" },
    { type: "valid-from", date: "2024-02-01", label: "Початок оренди" },
    { type: "valid-until", date: "2025-02-28", label: "Закінчення оренди", daysUntil: 45, isOverdue: false },
    { type: "prolongation", date: "2025-01-29", label: "Дедлайн пролонгації", daysUntil: 15 },
  ],
  financials: {
    amount: 8000,
    currency: "UAH",
    vatIncluded: false,
    paymentTerms: "Щомісячно до 5 числа",
    paymentDays: 5,
  },
  shortSummary: "Договір оренди офісу закінчується через 45 днів. Потрібно прийняти рішення про пролонгацію до 29.01.2025.",
  fullSummary: "Договір оренди нежитлового приміщення №ОРЕ-2024-001 від 01.02.2024. Орендодавець — ФОП Сидоренко В.П., орендар — ФОП Мельник О.В. Об'єкт оренди: офісне приміщення 45 м² за адресою вул. Хрещатик, 1. Орендна плата: 8 000 грн/міс. Термін дії закінчується 28.02.2025. Для пролонгації необхідно повідомити орендодавця за 30 днів (до 29.01.2025).",
  keyTerms: [
    "Площа: 45 м²",
    "Оплата: 8 000 ₴/міс до 5 числа",
    "Комунальні: окремо за лічильниками",
    "Пролонгація: за згодою сторін",
    "Повідомлення: за 30 днів",
  ],
  compliance: {
    kvedMatch: true,
    warnings: ["Термін договору закінчується через 45 днів"],
  },
  analysis: {
    processedAt: new Date().toISOString(),
    version: "1.0",
    model: "DIH Demo",
    confidence: 95,
  },
  contract: {
    subject: "Оренда офісного приміщення 45 м²",
    terms: [
      "Адреса: вул. Хрещатик, 1",
      "Орендна плата: 8 000 грн/міс",
      "Комунальні послуги: за лічильниками",
    ],
    prolongation: {
      type: "manual",
      noticePeriod: 30,
      nextDate: "2025-01-29",
      condition: "За письмовою згодою сторін",
    },
    referencedDocuments: [
      { type: "Акт", description: "Акт приймання-передачі приміщення", status: "attached" },
    ],
    signatories: [
      { party: "Орендодавець", position: "ФОП", name: "Сидоренко В.П.", signedAt: "2024-02-01", signatureType: "manual" },
      { party: "Орендар", position: "ФОП", name: "Мельник О.В.", signedAt: "2024-02-01", signatureType: "manual" },
    ],
  },
  // AI-detected risks with suggestions
  risks: [
    {
      id: "risk-s6-deposit",
      category: "financial" as const,
      severity: "medium" as const,
      title: "Відсутня застава в договорі",
      description: "Договір оренди не містить положень про забезпечувальний платіж, що може створити ризики для орендодавця",
      sourceSection: "Розділ 4. Умови оплати",
      suggestion: {
        text: "Рекомендую додати: «Орендар сплачує забезпечувальний платіж у розмірі 1 (одного) місячного орендного платежу, який повертається після закінчення договору за умови відсутності заборгованості та пошкоджень».",
        targetSection: "п. 4.3",
        insertPosition: "append" as const,
        confidence: 82,
      },
    },
    {
      id: "risk-s6-short-notice",
      category: "deadline" as const,
      severity: "low" as const,
      title: "Короткий термін повідомлення про розірвання",
      description: "30 днів може бути недостатньо для пошуку нового приміщення у разі розірвання",
      sourceSection: "Розділ 8. Розірвання",
      suggestion: {
        text: "Збільшити термін попередження про розірвання договору до 60 (шістдесяти) днів для забезпечення достатнього часу на пошук альтернативи.",
        targetSection: "п. 8.2",
        insertPosition: "replace" as const,
        confidence: 75,
      },
    },
  ],
};

const scenario6Checklist: DocumentChecklist = {
  documentId: "demo-rental-1",
  generatedAt: new Date().toISOString(),
  totalItems: 2,
  completedItems: 0,
  criticalItems: 1,
  completionPercent: 0,
  items: [
    {
      id: "check-6-1",
      type: "prolongation-check",
      priority: "critical",
      title: "Пролонгація договору",
      description: "Термін для повідомлення про пролонгацію — до 29.01.2025 (15 днів)",
      status: "pending",
      action: {
        type: "manual",
        label: "Прийняти рішення",
      },
    },
    {
      id: "check-6-2",
      type: "payment-link",
      priority: "medium",
      title: "Оплата оренди",
      description: "Наступний платіж 8 000 грн до 05.02.2025",
      status: "pending",
      action: {
        type: "navigate",
        label: "Переглянути платежі",
        targetRoute: "/cabinets/{cabinetId}/payments",
      },
    },
  ],
};

// ============================================
// СЦЕНАРІЙ 7: ТТН — Товарно-транспортна накладна
// ============================================

const scenario7Summary: DocumentSummary = {
  id: "demo-ttn-1",
  documentType: "ttn",
  confidence: 92,
  parties: [
    {
      role: "shipper",
      name: "ТОВ «Постачальник»",
      code: "55667788",
      isKnown: true,
      validationStatus: "pending",
      validationSource: "edr",
    },
    {
      role: "consignee",
      name: "ФОП Іваненко І.І.",
      code: "1234567890",
      isKnown: true,
      validationStatus: "valid",
      validationSource: "system",
    },
  ],
  keyDates: [
    { type: "document", date: "2024-12-10", label: "Дата ТТН" },
  ],
  financials: {
    amount: 85000,
    currency: "UAH",
    vatIncluded: true,
  },
  description: "ТТН на 85 000 ₴ від ТОВ «Постачальник» на доставку комп'ютерного обладнання. Вантаж доставлено без пошкоджень.",
  shortSummary: "ТТН на доставку комп'ютерного обладнання. Вантаж доставлено без пошкоджень.",
  fullSummary: "Товарно-транспортна накладна №ТТН-2024-001 від 10.12.2024 на суму 85 000 грн. Вантажовідправник — ТОВ «Постачальник». Вантажоотримувач — ФОП Іваненко І.І. Маршрут: м. Київ, вул. Індустріальна, 5 → м. Київ, вул. Хрещатик, 1. Вантаж отримано без пошкоджень.",
  keyTerms: [
    "Вантаж отримано без пошкоджень",
    "Кількість місць відповідає накладній",
    "Претензій до перевізника немає",
  ],
  compliance: {
    kvedMatch: true,
    warnings: [],
  },
  analysis: {
    processedAt: new Date().toISOString(),
    version: "1.0",
    model: "DIH Demo",
    confidence: 92,
  },
  // AI-detected risks with suggestions - ТТН без ризиків (усе виконано)
  risks: [],
};

const scenario7Checklist: DocumentChecklist = {
  documentId: "demo-ttn-1",
  generatedAt: new Date().toISOString(),
  totalItems: 2,
  completedItems: 2,
  criticalItems: 0,
  completionPercent: 100,
  items: [
    {
      id: "check-7-1",
      type: "delivery-confirm",
      priority: "high",
      title: "Огляд вантажу",
      description: "Вантаж оглянуто при отриманні",
      status: "done",
      completedAt: new Date().toISOString(),
      action: { type: "manual", label: "Підтвердити" },
    },
    {
      id: "check-7-2",
      type: "missing-signature",
      priority: "medium",
      title: "Підпис водія",
      description: "Водій підписав накладну",
      status: "done",
      completedAt: new Date().toISOString(),
      action: { type: "manual", label: "Перевірити" },
    },
  ],
};

// ============================================
// ЕКСПОРТ СЦЕНАРІЇВ
// ============================================

export const demoScenarios: DemoScenario[] = [
  {
    id: "new-contract-unknown-contractor",
    title: "Договір з новим контрагентом",
    description: "ТОВ «Нова Компанія» — невідомий системі",
    icon: FileSignature,
    fileName: "Договір_ТОВ_Нова_Компанія_2025.pdf",
    summary: scenario1Summary,
    checklist: scenario1Checklist,
  },
  {
    id: "invoice-linked-to-contract",
    title: "Рахунок до договору",
    description: "Прив'язано до ДОГ-2024-023",
    icon: Receipt,
    fileName: "Рахунок_РАХ-2025-001.pdf",
    summary: scenario2Summary,
    checklist: scenario2Checklist,
  },
  {
    id: "act-of-work-done",
    title: "Акт виконаних робіт",
    description: "Пов'язаний з рахунком РАХ-2025-002",
    icon: FileCheck2,
    fileName: "Акт_АКТ-2025-001.pdf",
    summary: scenario3Summary,
    checklist: scenario3Checklist,
  },
  {
    id: "contract-kved-issue",
    title: "Договір з КВЕД-проблемою",
    description: "Потрібен КВЕД 73.11",
    icon: AlertTriangle,
    fileName: "Договір_Реклама_2025.pdf",
    summary: scenario4Summary,
    checklist: scenario4Checklist,
  },
  {
    id: "waybill-validation",
    title: "Накладна на товари",
    description: "Офісне приладдя від ТОВ «ОфісМаркет»",
    icon: Truck,
    fileName: "Накладна_НАК-2025-001.pdf",
    summary: scenario5Summary,
    checklist: scenario5Checklist,
  },
  {
    id: "rental-agreement-prolongation",
    title: "Договір оренди",
    description: "Закінчується через 45 днів",
    icon: Home,
    fileName: "Договір_Оренда_2024.pdf",
    summary: scenario6Summary,
    checklist: scenario6Checklist,
  },
  {
    id: "ttn-delivery",
    title: "ТТН — Доставка вантажу",
    description: "Товарно-транспортна накладна з підтвердженням доставки",
    icon: Truck,
    fileName: "ТТН-2024-001.pdf",
    summary: scenario7Summary,
    checklist: scenario7Checklist,
  },
];

// Helper to get scenario by ID
export const getDemoScenarioById = (id: string): DemoScenario | undefined => {
  return demoScenarios.find(s => s.id === id);
};

// ============================================
// UTILITY: Build Summary from Real Document Data
// ============================================

import type { Document, DocumentType, documentTypeConfigs as TypeConfigs } from "@/config/documentFlowConfig";
import type { FieldConfidence, PartyInfo } from "@/types/documentSummary";

// Role labels for field generation
const roleLabelsForFields: Record<string, string> = {
  supplier: "Постачальник",
  buyer: "Покупець",
  executor: "Виконавець",
  client: "Замовник",
  lessor: "Орендодавець",
  lessee: "Орендар",
  employee: "Працівник",
  employer: "Роботодавець",
  seller: "Продавець",
  attorney: "Повірений",
  principal: "Довіритель",
};

/**
 * Generates FieldConfidence array from document data
 * Used when no demo scenario with fieldConfidences exists
 */
const generateFieldConfidencesFromDocument = (
  doc: Document,
  parties: PartyInfo[],
  financials?: DocumentSummary["financials"]
): FieldConfidence[] => {
  const fields: FieldConfidence[] = [];
  
  // Document number
  if (doc.number) {
    fields.push({
      fieldName: "document.number",
      fieldLabel: "Номер документа",
      value: doc.number,
      confidence: 99,
      method: "pattern",
      pageNumber: 1,
    });
  }
  
  // Document date
  if (doc.date) {
    fields.push({
      fieldName: "document.date",
      fieldLabel: "Дата документа",
      value: new Date(doc.date).toLocaleDateString("uk-UA"),
      confidence: 98,
      method: "pattern",
      pageNumber: 1,
    });
  }
  
  // Parties
  parties.forEach((party) => {
    const roleLabel = roleLabelsForFields[party.role] || party.role;
    
    fields.push({
      fieldName: `parties.${party.role}.name`,
      fieldLabel: roleLabel,
      value: party.name,
      confidence: party.isKnown ? 96 : 78,
      method: party.isKnown ? "lookup" : "ocr",
      needsReview: !party.isKnown,
      pageNumber: 1,
    });
    
    if (party.code) {
      fields.push({
        fieldName: `parties.${party.role}.code`,
        fieldLabel: `ЄДРПОУ/ІПН ${roleLabel}`,
        value: party.code,
        confidence: 97,
        method: "pattern",
        pageNumber: 1,
      });
    }
  });
  
  // Amount - use "грн" for UAH to match HTML templates
  if (financials?.amount) {
    const currencyLabel = financials.currency === "UAH" ? "грн" : (financials.currency || "грн");
    fields.push({
      fieldName: "financials.amount",
      fieldLabel: "Сума",
      value: `${financials.amount.toLocaleString("uk-UA")} ${currencyLabel}`,
      confidence: 96,
      method: "pattern",
      pageNumber: 1,
    });
  }
  
  // Subject
  if (doc.subject) {
    fields.push({
      fieldName: "document.subject",
      fieldLabel: "Предмет/Призначення",
      value: doc.subject,
      confidence: 85,
      method: "nlp",
      pageNumber: 1,
    });
  }
  
  // Type-specific fields
  
  // PRRO Receipt - fiscal number
  if (doc.type === "prro-receipt" && doc.prroFiscalNumber) {
    fields.push({
      fieldName: "fiscal.number",
      fieldLabel: "Фіскальний номер",
      value: doc.prroFiscalNumber,
      confidence: 99,
      method: "pattern",
      pageNumber: 1,
    });
  }
  
  // Bank statement - totals
  if (doc.type === "bank-statement" && doc.statementTotals) {
    fields.push({
      fieldName: "statement.income",
      fieldLabel: "Надходження",
      value: `${doc.statementTotals.income.toLocaleString("uk-UA")} ₴`,
      confidence: 98,
      method: "table",
      pageNumber: 1,
    });
    fields.push({
      fieldName: "statement.expense",
      fieldLabel: "Видатки",
      value: `${doc.statementTotals.expense.toLocaleString("uk-UA")} ₴`,
      confidence: 98,
      method: "table",
      pageNumber: 1,
    });
    if (doc.statementTotals.closingBalance !== undefined) {
      fields.push({
        fieldName: "statement.balance",
        fieldLabel: "Залишок на кінець",
        value: `${doc.statementTotals.closingBalance.toLocaleString("uk-UA")} ₴`,
        confidence: 99,
        method: "table",
        pageNumber: 1,
      });
    }
  }
  
  // Reconciliation - balance
  if (doc.type === "reconciliation" && doc.reconciliationBalance) {
    const balanceText = doc.reconciliationBalance.amount === 0 
      ? "0 ₴ (без розбіжностей)" 
      : `${doc.reconciliationBalance.amount.toLocaleString("uk-UA")} ₴ (${doc.reconciliationBalance.inFavor === "us" ? "на нашу користь" : "на користь контрагента"})`;
    fields.push({
      fieldName: "reconciliation.balance",
      fieldLabel: "Сальдо",
      value: balanceText,
      confidence: 98,
      method: "table",
      pageNumber: 1,
    });
  }
  
  // TTN / Waybill - route
  if ((doc.type === "ttn" || doc.type === "waybill") && doc.route) {
    fields.push({
      fieldName: "route.from",
      fieldLabel: "Пункт відправлення",
      value: doc.route.from,
      confidence: 92,
      method: "ocr",
      pageNumber: 1,
    });
    fields.push({
      fieldName: "route.to",
      fieldLabel: "Пункт призначення",
      value: doc.route.to,
      confidence: 92,
      method: "ocr",
      pageNumber: 1,
    });
  }
  
  // Power of attorney
  if (doc.type === "power-of-attorney" && doc.dueDate) {
    fields.push({
      fieldName: "validity.until",
      fieldLabel: "Дійсна до",
      value: new Date(doc.dueDate).toLocaleDateString("uk-UA"),
      confidence: 97,
      method: "pattern",
      pageNumber: 1,
    });
  }
  
  // HR Orders - employee and position
  if (["employment-order", "dismissal-order", "vacation-order"].includes(doc.type)) {
    if (doc.employee?.name) {
      fields.push({
        fieldName: "employee.name",
        fieldLabel: "Працівник",
        value: doc.employee.name,
        confidence: 95,
        method: "ocr",
        pageNumber: 1,
      });
    }
    if (doc.employee?.position) {
      fields.push({
        fieldName: "employee.position",
        fieldLabel: "Посада",
        value: doc.employee.position,
        confidence: 93,
        method: "nlp",
        pageNumber: 1,
      });
    }
  }
  
  // Period for statements/reconciliation
  if (doc.period?.label) {
    fields.push({
      fieldName: "document.period",
      fieldLabel: "Період",
      value: doc.period.label,
      confidence: 94,
      method: "pattern",
      pageNumber: 1,
    });
  }
  
  return fields;
};

/**
 * Builds a DocumentSummary from actual document data
 * Uses demo scenarios only as fallback for AI-related fields (checklist, compliance)
 */
export const buildSummaryFromDocument = (
  doc: Document,
  cabinetName: string = "Кабінет",
  cabinetCode: string = "",
  scenarioForFallback?: DemoScenario,
  allDocuments?: Document[]
): DocumentSummary => {
  // Import document type labels
  const typeLabels: Record<string, string> = {
    invoice: "Рахунок",
    act: "Акт",
    contract: "Договір",
    waybill: "Накладна",
    ttn: "ТТН",
    "prro-receipt": "Чек ПРРО",
    "tax-invoice": "ПН",
    reconciliation: "Акт звірки",
    "power-of-attorney": "Довіреність",
    "rental-agreement": "Договір оренди",
    "supply-contract": "Договір поставки",
    "fop-service-contract": "Договір з ФОП",
    "payment-order": "Платіжка",
    "bank-statement": "Виписка",
    "employment-order": "Наказ",
    "dismissal-order": "Наказ",
    "vacation-order": "Наказ",
    order: "Наказ",
    certificate: "Довідка",
    receipt: "Квитанція",
    nda: "NDA",
    "sale-agreement": "Договір купівлі-продажу",
  };

  // Status labels
  const statusLabels: Record<string, string> = {
    paid: "Оплачено",
    "partially-paid": "Частково оплачено",
    signed: "Підписано",
    "pending-sign": "Очікує підпису",
    sent: "Відправлено",
    confirmed: "Підтверджено",
    draft: "Чернетка",
    registered: "Зареєстровано",
    archived: "Архів",
    cancelled: "Скасовано",
    rejected: "Відхилено",
    approved: "Затверджено",
    active: "Активний",
    expired: "Закінчився",
    delivered: "Доставлено",
    executed: "Виконано",
  };

  // ============================================
  // ТИПІЗОВАНІ ФУНКЦІЇ ГЕНЕРАЦІЇ SHORT SUMMARY
  // ============================================

  // Invoice: Analytical summary with payment context and recommendations
  const buildInvoiceShortSummary = (doc: Document, allDocs?: Document[]): string => {
    const sentences: string[] = [];
    
    // Main status sentence with context
    if (doc.status === "paid") {
      const paymentSource = doc.linkedPayments?.[0]?.source;
      const paymentDate = doc.linkedPayments?.[0]?.date;
      if (paymentSource && paymentDate) {
        sentences.push(`Рахунок повністю оплачено ${format(new Date(paymentDate), "dd.MM.yyyy")} через ${paymentSource}.`);
      } else {
        sentences.push("Рахунок повністю оплачено.");
      }
    } else if (doc.status === "partially-paid") {
      const remaining = doc.amount && doc.paidAmount ? doc.amount - doc.paidAmount : 0;
      sentences.push(`Частково оплачений рахунок — залишок ${remaining.toLocaleString("uk-UA")} ₴ потребує сплати.`);
    } else if (doc.dueDate) {
      const daysUntil = Math.ceil((new Date(doc.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) {
        sentences.push(`Рахунок прострочено на ${Math.abs(daysUntil)} днів — рекомендовано терміново провести оплату або зв'язатися з контрагентом.`);
      } else if (daysUntil <= 3) {
        sentences.push(`Рахунок очікує оплати — до терміну залишилось ${daysUntil} дн.`);
      } else {
        sentences.push("Рахунок очікує оплати.");
      }
    } else {
      sentences.push("Рахунок в обробці.");
    }
    
    // Subject and period context
    if (doc.subject) {
      let subjectSentence = `Призначення: ${doc.subject}`;
      if (doc.period?.label) subjectSentence += ` (${doc.period.label})`;
      sentences.push(subjectSentence + ".");
    }
    
    // Linked contract context
    if (doc.linkedDocuments?.length && allDocs) {
      const linkedContract = doc.linkedDocuments
        .map(id => allDocs.find(d => d.id === id))
        .find(d => d?.type.includes("contract"));
      if (linkedContract) {
        sentences.push(`Виставлено на підставі договору ${linkedContract.number}.`);
      }
    }
    
    // Contractor verification context
    if (doc.contractor?.name) {
      const isVerified = doc.contractor.verified || doc.contractor.validationStatus === "valid";
      if (isVerified) {
        sentences.push(`Платник ${doc.contractor.name} — верифікований контрагент.`);
      } else {
        sentences.push(`Платник: ${doc.contractor.name}.`);
      }
    }
    
    // Income book synchronization
    if (doc.linkedPayments?.length) {
      sentences.push("Операцію внесено до Книги доходів.");
    }
    
    return sentences.join(" ");
  };

  // Act: Analytical summary with execution and payment context
  const buildActShortSummary = (doc: Document, allDocs?: Document[]): string => {
    const sentences: string[] = [];
    
    // Signature status with action context
    if (doc.status === "signed") {
      sentences.push("Акт виконаних робіт підписано обома сторонами.");
    } else if (doc.status === "pending-sign") {
      sentences.push("Акт очікує підпису — рекомендовано надіслати нагадування контрагенту.");
    } else if (doc.status === "draft") {
      sentences.push("Акт у статусі чернетки — потребує доопрацювання.");
    } else {
      sentences.push("Акт виконаних робіт в обробці.");
    }
    
    // Subject with period context
    if (doc.subject) {
      let workSentence = `Предмет: ${doc.subject}`;
      if (doc.period?.label) workSentence += ` за ${doc.period.label}`;
      sentences.push(workSentence + ".");
    }
    
    // Link to parent document (contract or invoice)
    if (doc.linkedDocuments?.length && allDocs) {
      const linkedContract = doc.linkedDocuments
        .map(id => allDocs.find(d => d.id === id))
        .find(d => d?.type.includes("contract"));
      const linkedInvoice = doc.linkedDocuments
        .map(id => allDocs.find(d => d.id === id))
        .find(d => d?.type === "invoice");
      
      if (linkedContract && linkedInvoice) {
        sentences.push(`Закриває зобов'язання за договором ${linkedContract.number} та рахунком ${linkedInvoice.number}.`);
      } else if (linkedContract) {
        sentences.push(`Закриває етап робіт за договором ${linkedContract.number}.`);
      } else if (linkedInvoice) {
        sentences.push(`Підтверджує виконання за рахунком ${linkedInvoice.number}.`);
      }
    }
    
    // Payment context
    if (doc.linkedPayments?.length) {
      const totalPaid = doc.linkedPayments.reduce((sum, p) => sum + p.amount, 0);
      sentences.push(`Оплату проведено: ${totalPaid.toLocaleString("uk-UA")} ₴.`);
    } else if (doc.status === "signed" && doc.amount) {
      sentences.push(`Очікується оплата на суму ${doc.amount.toLocaleString("uk-UA")} ₴.`);
    }
    
    // Contractor context
    if (doc.contractor?.name) {
      const isVerified = doc.contractor.verified || doc.contractor.validationStatus === "valid";
      if (!isVerified) {
        sentences.push(`Контрагент ${doc.contractor.name} потребує верифікації.`);
      }
    }
    
    return sentences.join(" ");
  };

  // Contract: Analytical summary with validity, terms and recommendations
  const buildContractShortSummary = (doc: Document): string => {
    const typeLabel = typeLabels[doc.type] || "Договір";
    const sentences: string[] = [];
    
    // Validity and status context with recommendations
    if (doc.dueDate) {
      const daysUntil = Math.ceil((new Date(doc.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 0) {
        sentences.push(`${typeLabel} прострочено — термін дії закінчився ${Math.abs(daysUntil)} дн. тому.`);
        sentences.push("Рекомендовано узгодити пролонгацію або формально закрити зобов'язання.");
      } else if (daysUntil <= 30) {
        sentences.push(`Активний ${typeLabel.toLowerCase()} з терміном дії до ${format(new Date(doc.dueDate), "dd.MM.yyyy")}.`);
        sentences.push(`Увага: до закінчення ${daysUntil} дн. — зверніть увагу на умови пролонгації.`);
      } else {
        sentences.push(`Активний ${typeLabel.toLowerCase()} — дійсний до ${format(new Date(doc.dueDate), "dd.MM.yyyy")}.`);
      }
    } else if (doc.status === "pending-sign") {
      sentences.push(`${typeLabel} очікує підпису сторін.`);
      sentences.push("Рекомендовано перевірити коректність реквізитів перед підписанням.");
    } else if (doc.status === "archived") {
      sentences.push(`Архівний ${typeLabel.toLowerCase()} — зобов'язання виконано повністю.`);
    } else {
      sentences.push(`${typeLabel} в обробці.`);
    }
    
    // Subject context
    if (doc.subject) {
      sentences.push(`Предмет: ${doc.subject}.`);
    }
    
    // Financial context with payment status
    if (doc.amount) {
      if (doc.linkedPayments?.length) {
        const totalPaid = doc.linkedPayments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid >= doc.amount) {
          sentences.push(`Загальна сума ${doc.amount.toLocaleString("uk-UA")} ₴ — оплачено повністю.`);
        } else {
          sentences.push(`Загальна сума ${doc.amount.toLocaleString("uk-UA")} ₴, оплачено ${totalPaid.toLocaleString("uk-UA")} ₴.`);
        }
      } else {
        sentences.push(`Загальна сума зобов'язань: ${doc.amount.toLocaleString("uk-UA")} ₴.`);
      }
    }
    
    // Contractor verification context
    if (doc.contractor?.name) {
      const isVerified = doc.contractor.verified || doc.contractor.validationStatus === "valid";
      if (isVerified) {
        sentences.push(`Контрагент ${doc.contractor.name} — верифікований.`);
      } else {
        sentences.push(`Контрагент ${doc.contractor.name} — рекомендовано перевірити реквізити.`);
      }
    }
    
    return sentences.join(" ");
  };

  // Waybill: "Накладна ВН-2024-156 · Офісне обладнання · 12 500 ₴ · Отримано · ТОВ «Постачальник»"
  const buildWaybillShortSummary = (doc: Document): string => {
    const parts: string[] = [`Накладна ${doc.number}`];
    
    if (doc.subject) {
      const subjectShort = doc.subject.length > 35 ? doc.subject.slice(0, 35) + "…" : doc.subject;
      parts.push(`· ${subjectShort}`);
    }
    if (doc.amount) parts.push(`· ${doc.amount.toLocaleString("uk-UA")} ₴`);
    if (statusLabels[doc.status]) parts.push(`· ${statusLabels[doc.status]}`);
    if (doc.contractor?.name) parts.push(`· ${doc.contractor.name}`);
    
    return parts.join(" ");
  };

  // TTN: "ТТН ТТН-2024-156 · Будматеріали · Київ → Одеса · 12 500 ₴ · Доставлено"
  // Note: контрагент не дублюється — він відображається в секції СТОРОНИ
  const buildTTNShortSummary = (doc: Document): string => {
    const parts: string[] = [`ТТН ${doc.number}`];
    
    if (doc.subject) {
      const subjectShort = doc.subject.length > 25 ? doc.subject.slice(0, 25) + "…" : doc.subject;
      parts.push(`· ${subjectShort}`);
    }
    if (doc.route) parts.push(`· ${doc.route.from} → ${doc.route.to}`);
    if (doc.amount) parts.push(`· ${doc.amount.toLocaleString("uk-UA")} ₴`);
    if (statusLabels[doc.status]) parts.push(`· ${statusLabels[doc.status]}`);
    // Контрагент видалено — уникнення дублювання
    
    return parts.join(" ");
  };

  // Tax Invoice: "ПН 0012345678 · Реалізація товарів · 150 000 ₴ (ПДВ 25 000 ₴) · Зареєстровано · ТОВ «Покупець»"
  const buildTaxInvoiceShortSummary = (doc: Document): string => {
    const parts: string[] = [`ПН ${doc.taxInvoiceNumber || doc.number}`];
    
    if (doc.subject) {
      const subjectShort = doc.subject.length > 30 ? doc.subject.slice(0, 30) + "…" : doc.subject;
      parts.push(`· ${subjectShort}`);
    }
    if (doc.amount) parts.push(`· ${doc.amount.toLocaleString("uk-UA")} ₴`);
    if (statusLabels[doc.status]) parts.push(`· ${statusLabels[doc.status]}`);
    if (doc.contractor?.name) parts.push(`· ${doc.contractor.name}`);
    
    return parts.join(" ");
  };

  // PRRO: "Чек ПРРО ФН-4523789012 · Продаж · 2 450 ₴ · 15.12.2024 14:32"
  const buildPRROShortSummary = (doc: Document): string => {
    const fiscalNum = doc.prroFiscalNumber 
      ? doc.prroFiscalNumber.slice(0, 10) + (doc.prroFiscalNumber.length > 10 ? "…" : "")
      : doc.number;
    const parts: string[] = [`Чек ПРРО ${fiscalNum}`];
    
    if (doc.subject) {
      const subjectShort = doc.subject.length > 20 ? doc.subject.slice(0, 20) + "…" : doc.subject;
      parts.push(`· ${subjectShort}`);
    }
    if (doc.amount) parts.push(`· ${doc.amount.toLocaleString("uk-UA")} ₴`);
    
    // Date with time
    const dateStr = new Date(doc.date).toLocaleDateString("uk-UA");
    parts.push(`· ${dateStr}`);
    
    return parts.join(" ");
  };

  // HR Orders: "Наказ НК-2024-045 · Прийняття · Петренко О.В., бухгалтер · з 01.01.2025"
  const buildHROrderShortSummary = (doc: Document): string => {
    const typeLabel = doc.type === "employment-order" ? "Прийняття" :
                      doc.type === "dismissal-order" ? "Звільнення" :
                      doc.type === "vacation-order" ? "Відпустка" : "Кадровий наказ";
    
    const parts: string[] = [`Наказ ${doc.number}`, `· ${typeLabel}`];
    
    if (doc.employee) {
      const empStr = doc.employee.position 
        ? `${doc.employee.name}, ${doc.employee.position}`
        : doc.employee.name;
      parts.push(`· ${empStr}`);
    }
    
    if (doc.period) {
      parts.push(`· ${doc.period.label || `${doc.period.from} — ${doc.period.to}`}`);
    } else if (doc.dueDate) {
      const prefix = doc.type === "vacation-order" ? "" : "з ";
      parts.push(`· ${prefix}${new Date(doc.dueDate).toLocaleDateString("uk-UA")}`);
    }
    
    return parts.join(" ");
  };

  // Reconciliation: "Акт звірки АЗ-2024-004 · Q4 2024 · Сальдо +45 000 ₴ · Підписано · ТОВ «Контрагент»"
  const buildReconciliationShortSummary = (doc: Document): string => {
    const parts: string[] = [`Акт звірки ${doc.number}`];
    
    if (doc.period?.label) parts.push(`· ${doc.period.label}`);
    
    if (doc.reconciliationBalance) {
      const sign = doc.reconciliationBalance.inFavor === "us" ? "+" : "-";
      parts.push(`· Сальдо ${sign}${doc.reconciliationBalance.amount.toLocaleString("uk-UA")} ₴`);
    }
    
    if (statusLabels[doc.status]) parts.push(`· ${statusLabels[doc.status]}`);
    if (doc.contractor?.name) parts.push(`· ${doc.contractor.name}`);
    
    return parts.join(" ");
  };

  // Power of Attorney: "Довіреність ДОВ-2024-012 · Отримання ТМЦ · Іванов І.І. · до 31.03.2025"
  const buildPowerOfAttorneyShortSummary = (doc: Document): string => {
    const parts: string[] = [`Довіреність ${doc.number}`];
    
    if (doc.subject) {
      const subjectShort = doc.subject.length > 25 ? doc.subject.slice(0, 25) + "…" : doc.subject;
      parts.push(`· ${subjectShort}`);
    }
    if (doc.employee?.name) parts.push(`· ${doc.employee.name}`);
    if (doc.dueDate) parts.push(`· до ${new Date(doc.dueDate).toLocaleDateString("uk-UA")}`);
    
    return parts.join(" ");
  };

  // Generic fallback for unknown types
  const buildGenericShortSummary = (doc: Document): string => {
    const typeLabel = typeLabels[doc.type] || doc.type;
    const parts: string[] = [`${typeLabel} ${doc.number}`];
    
    if (doc.subject) {
      const subjectShort = doc.subject.length > 35 ? doc.subject.slice(0, 35) + "…" : doc.subject;
      parts.push(`· ${subjectShort}`);
    }
    if (doc.amount) parts.push(`· ${doc.amount.toLocaleString("uk-UA")} ₴`);
    if (statusLabels[doc.status]) parts.push(`· ${statusLabels[doc.status]}`);
    if (doc.contractor?.name) parts.push(`· ${doc.contractor.name}`);
    
    return parts.join(" ");
  };

  // ============================================
  // BUILD SHORT SUMMARY BY DOCUMENT TYPE
  // ============================================

  let shortSummary: string;
  const isContractType = ["contract", "supply-contract", "rental-agreement", "fop-service-contract", "sale-agreement"].includes(doc.type);

  switch (doc.type) {
    case "invoice":
      shortSummary = buildInvoiceShortSummary(doc, allDocuments);
      break;
    case "act":
      shortSummary = buildActShortSummary(doc, allDocuments);
      break;
    case "contract":
    case "supply-contract":
    case "rental-agreement":
    case "fop-service-contract":
    case "sale-agreement":
      shortSummary = buildContractShortSummary(doc);
      break;
    case "waybill":
      shortSummary = buildWaybillShortSummary(doc);
      break;
    case "ttn":
      shortSummary = buildTTNShortSummary(doc);
      break;
    case "tax-invoice":
      shortSummary = buildTaxInvoiceShortSummary(doc);
      break;
    case "prro-receipt":
      shortSummary = buildPRROShortSummary(doc);
      break;
    case "employment-order":
    case "dismissal-order":
    case "vacation-order":
      shortSummary = buildHROrderShortSummary(doc);
      break;
    case "reconciliation":
      shortSummary = buildReconciliationShortSummary(doc);
      break;
    case "power-of-attorney":
      shortSummary = buildPowerOfAttorneyShortSummary(doc);
      break;
    default:
      shortSummary = buildGenericShortSummary(doc);
  }

  // ============================================
  // BUILD KEY DATES, PARTIES, FINANCIALS
  // ============================================

  // Parse dates for keyDates
  const keyDates: DocumentSummary["keyDates"] = [
    { type: "document", date: doc.date, label: "Дата документа" },
  ];
  
  if (doc.dueDate) {
    const daysUntil = Math.ceil(
      (new Date(doc.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    keyDates.push({ 
      type: isContractType ? "valid-until" : "payment-due", 
      date: doc.dueDate, 
      label: isContractType ? "Закінчення дії" : "Термін оплати",
      daysUntil: daysUntil > 0 ? daysUntil : undefined,
    });
  }

  // Build parties from document contractor
  const parties: DocumentSummary["parties"] = [];
  
  // Special handling for TTN - use logistics roles
  const isTTN = doc.type === "ttn";
  
  // Add cabinet as first party (supplier/executor/consignee based on doc type)
  const isOutgoing = ["invoice", "act", "waybill"].includes(doc.type);
  parties.push({
    role: isTTN ? "consignee" : (isOutgoing ? "supplier" : "client"),
    name: cabinetName,
    code: cabinetCode,
    isKnown: true,
    validationStatus: "valid",
    validationSource: "system",
    isCabinetOwner: true, // Mark as cabinet owner for UI differentiation
  });

  // Add contractor as second party
  if (doc.contractor) {
    parties.push({
      role: isTTN ? "shipper" : (isOutgoing ? "buyer" : "executor"),
      name: doc.contractor.name,
      code: doc.contractor.code,
      isKnown: true,
      validationStatus: doc.contractor.validationStatus || "pending",
    });
  }

  // Build financials
  const financials: DocumentSummary["financials"] = doc.amount ? {
    amount: doc.amount,
    currency: doc.currency || "UAH",
    vatIncluded: false,
    paymentTerms: doc.dueDate ? `До ${new Date(doc.dueDate).toLocaleDateString("uk-UA")}` : undefined,
  } : undefined;

  // Build improved fullSummary
  const fullParts: string[] = [];
  const typeLabel = typeLabels[doc.type] || doc.type;
  const amountStr = doc.amount ? `${doc.amount.toLocaleString("uk-UA")} ₴` : "";
  
  // Base info with subject
  if (doc.subject) {
    fullParts.push(`${typeLabel} №${doc.number} від ${new Date(doc.date).toLocaleDateString("uk-UA")} — ${doc.subject}.`);
  } else {
    fullParts.push(`${typeLabel} №${doc.number} від ${new Date(doc.date).toLocaleDateString("uk-UA")}.`);
  }
  
  // Amount with context
  if (doc.amount) {
    if (doc.status === "paid") {
      const paidDate = doc.linkedPayments?.[0]?.date 
        ? ` ${new Date(doc.linkedPayments[0].date).toLocaleDateString("uk-UA")}`
        : "";
      fullParts.push(`Сума ${amountStr} оплачена повністю${paidDate}.`);
    } else if (doc.status === "partially-paid" && doc.paidAmount) {
      const remaining = doc.amount - doc.paidAmount;
      fullParts.push(`Сума ${amountStr}. Оплачено: ${doc.paidAmount.toLocaleString("uk-UA")} ₴, залишок: ${remaining.toLocaleString("uk-UA")} ₴.`);
    } else {
      fullParts.push(`Сума ${amountStr}.`);
    }
  }
  
  // Contractor with verification status
  if (doc.contractor) {
    const verificationStatus = doc.contractor.verified 
      ? "перевірено" 
      : doc.contractor.validationStatus === "pending" 
        ? "очікує перевірки" 
        : "";
    const codeStr = doc.contractor.code 
      ? ` (ЄДРПОУ ${doc.contractor.code}${verificationStatus ? `, ${verificationStatus}` : ""})`
      : verificationStatus ? ` (${verificationStatus})` : "";
    fullParts.push(`Контрагент: ${doc.contractor.name}${codeStr}.`);
  }
  
  // Due date / validity for specific types - with date range for contracts
  if (doc.dueDate) {
    if (["invoice"].includes(doc.type) && doc.status !== "paid") {
      fullParts.push(`Термін оплати: до ${new Date(doc.dueDate).toLocaleDateString("uk-UA")}.`);
    } else if (isContractType) {
      const startDate = new Date(doc.date).toLocaleDateString("uk-UA");
      const endDate = new Date(doc.dueDate).toLocaleDateString("uk-UA");
      fullParts.push(`Термін дії: ${startDate} — ${endDate}.`);
    }
  }
  
  // Linked documents with resolved numbers
  if (doc.linkedDocuments && doc.linkedDocuments.length > 0) {
    if (allDocuments) {
      const resolvedLinks = doc.linkedDocuments
        .map(id => allDocuments.find(d => d.id === id))
        .filter(Boolean) as Document[];
      
      if (resolvedLinks.length > 0) {
        const linkLabels = resolvedLinks.map(ld => 
          `${typeLabels[ld.type] || ld.type} ${ld.number}`
        ).join(", ");
        fullParts.push(`Пов'язані документи: ${linkLabels}.`);
      }
    } else {
      fullParts.push(`Пов'язані документи: ${doc.linkedDocuments.length}.`);
    }
  }
  
  // Payment source
  if (doc.linkedPayments && doc.linkedPayments.length > 0 && doc.linkedPayments[0].source) {
    fullParts.push(`Джерело оплати: ${doc.linkedPayments[0].source}.`);
  }
  
  const fullSummary = fullParts.join(" ");

  // Use fallback scenario for AI-related fields
  const compliance = scenarioForFallback?.summary?.compliance || {
    kvedMatch: true,
    warnings: [],
  };

  // Generate fieldConfidences from document data
  const fieldConfidences = generateFieldConfidencesFromDocument(doc, parties, financials);

  return {
    id: doc.id,
    documentType: doc.type,
    confidence: 95,
    parties,
    keyDates,
    financials,
    shortSummary,
    fullSummary,
    keyTerms: scenarioForFallback?.summary?.keyTerms || [],
    compliance,
    fieldConfidences,
    analysis: {
      processedAt: new Date().toISOString(),
      version: "1.0",
      model: "DIH",
      confidence: 95,
    },
  };
};

/**
 * Merges demo scenario with real document data
 * Keeps AI-generated checklist/compliance from scenario
 * Replaces document-specific fields with real data
 * Applies type-specific legal clauses
 */
export const mergeScenarioWithDocument = (
  scenario: DemoScenario,
  doc: Document,
  cabinetName: string = "Кабінет",
  cabinetCode: string = "",
  allDocuments?: Document[]
): { summary: DocumentSummary; checklist: DocumentChecklist } => {
  const realSummary = buildSummaryFromDocument(doc, cabinetName, cabinetCode, scenario, allDocuments);
  
  // Get type-specific legal clauses
  const legalClauses = getLegalClausesByDocType(doc.type);
  
  // Merge with scenario's extended fields (contract, invoice, act details)
  const mergedSummary = {
    ...realSummary,
    // Keep AI-generated fields from scenario
    keyTerms: scenario.summary.keyTerms,
    compliance: scenario.summary.compliance,
    // Field confidences for extraction breakdown and Side-by-Side view
    fieldConfidences: scenario.summary.fieldConfidences,
    // For contracts - merge scenario contract data with type-specific legal clauses
    ...("contract" in scenario.summary ? { 
      contract: {
        ...(scenario.summary as ContractSummary).contract,
        // Override with type-specific legal clauses
        liability: legalClauses.liability,
        confidentiality: legalClauses.confidentiality,
        governingLaw: legalClauses.governingLaw,
      }
    } : {}),
    ...("invoice" in scenario.summary ? { invoice: (scenario.summary as InvoiceSummary).invoice } : {}),
    ...("act" in scenario.summary ? { act: (scenario.summary as ActSummary).act } : {}),
  };

  // Generate dynamic checklist based on real document state
  const dynamicChecklist = generateDynamicChecklist(doc);
  
  return {
    summary: mergedSummary,
    checklist: dynamicChecklist || {
      documentId: doc.id,
      generatedAt: new Date().toISOString(),
      items: [],
      completionPercent: 100,
      totalItems: 0,
      completedItems: 0,
      criticalItems: 0,
    },
  };
};
