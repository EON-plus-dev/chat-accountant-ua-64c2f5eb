// ============================================
// SEMANTIC DOCUMENT LINKS
// Typed relationships for document chains (BPMN 2.0, Dublin Core)
// ============================================

// ============================================
// LINK TYPES
// ============================================

export type LinkType =
  // Hierarchical relationships
  | "parent"              // Батьківський документ
  | "child"               // Дочірній документ
  | "amendment"           // Додаткова угода / Зміна
  | "annex"               // Додаток
  
  // Financial chain
  | "payment-basis"       // Підстава для оплати (рахунок → платіж)
  | "payment-confirm"     // Підтвердження оплати (платіж → рахунок)
  
  // Version control
  | "supersedes"          // Замінює (новий → старий)
  | "superseded-by"       // Замінений (старий → новий)
  | "version-of"          // Версія документа
  
  // Reference
  | "reference"           // Посилання / Згадка
  | "related"             // Пов'язаний
  
  // Bundle / Package
  | "bundle"              // Частина пакету документів
  | "audit-package"       // Частина пакету аудиту
  
  // Discrepancy
  | "discrepancy-act";    // Акт розбіжностей

// ============================================
// LINK TYPE CONFIGURATION
// ============================================

export interface LinkTypeConfig {
  labelUk: string;
  labelEn: string;
  description: string;
  direction: "forward" | "backward" | "bidirectional";
  color: string;
  icon: string;
  inverseType?: LinkType;
}

export const linkTypeConfig: Record<LinkType, LinkTypeConfig> = {
  parent: {
    labelUk: "Батьківський",
    labelEn: "Parent",
    description: "Батьківський документ, від якого походить поточний",
    direction: "backward",
    color: "text-blue-600",
    icon: "arrow-up",
    inverseType: "child",
  },
  child: {
    labelUk: "Дочірній",
    labelEn: "Child",
    description: "Документ, створений на основі поточного",
    direction: "forward",
    color: "text-blue-600",
    icon: "arrow-down",
    inverseType: "parent",
  },
  amendment: {
    labelUk: "Додаткова угода",
    labelEn: "Amendment",
    description: "Вносить зміни до умов основного документа",
    direction: "forward",
    color: "text-amber-600",
    icon: "file-edit",
    inverseType: "parent",
  },
  annex: {
    labelUk: "Додаток",
    labelEn: "Annex",
    description: "Додаток до основного документа",
    direction: "forward",
    color: "text-purple-600",
    icon: "paperclip",
    inverseType: "parent",
  },
  "payment-basis": {
    labelUk: "Підстава для оплати",
    labelEn: "Payment Basis",
    description: "Документ є підставою для здійснення платежу",
    direction: "forward",
    color: "text-emerald-600",
    icon: "credit-card",
    inverseType: "payment-confirm",
  },
  "payment-confirm": {
    labelUk: "Підтвердження оплати",
    labelEn: "Payment Confirmation",
    description: "Документ підтверджує здійснену оплату",
    direction: "backward",
    color: "text-emerald-600",
    icon: "check-circle",
    inverseType: "payment-basis",
  },
  supersedes: {
    labelUk: "Замінює",
    labelEn: "Supersedes",
    description: "Поточний документ замінює вказаний",
    direction: "forward",
    color: "text-red-600",
    icon: "refresh-cw",
    inverseType: "superseded-by",
  },
  "superseded-by": {
    labelUk: "Замінений",
    labelEn: "Superseded By",
    description: "Поточний документ замінено вказаним",
    direction: "backward",
    color: "text-gray-500",
    icon: "archive",
    inverseType: "supersedes",
  },
  "version-of": {
    labelUk: "Версія",
    labelEn: "Version Of",
    description: "Є версією іншого документа",
    direction: "bidirectional",
    color: "text-indigo-600",
    icon: "git-branch",
  },
  reference: {
    labelUk: "Посилання",
    labelEn: "Reference",
    description: "Посилається на інший документ",
    direction: "forward",
    color: "text-gray-600",
    icon: "link",
  },
  related: {
    labelUk: "Пов'язаний",
    labelEn: "Related",
    description: "Пов'язаний за контекстом",
    direction: "bidirectional",
    color: "text-gray-500",
    icon: "link-2",
  },
  bundle: {
    labelUk: "Частина пакету",
    labelEn: "Bundle",
    description: "Входить до пакету документів",
    direction: "bidirectional",
    color: "text-orange-600",
    icon: "folder",
  },
  "audit-package": {
    labelUk: "Пакет аудиту",
    labelEn: "Audit Package",
    description: "Входить до пакету перевірки",
    direction: "forward",
    color: "text-cyan-600",
    icon: "shield",
  },
  "discrepancy-act": {
    labelUk: "Акт розбіжностей",
    labelEn: "Discrepancy Act",
    description: "Фіксує розбіжності при прийманні товарів/робіт",
    direction: "forward",
    color: "text-red-600",
    icon: "alert-triangle",
    inverseType: "parent",
  },
};

// ============================================
// DOCUMENT LINK INTERFACE
// ============================================

export interface DocumentLink {
  id: string;
  targetId: string;
  targetNumber?: string;
  targetType?: string;
  linkType: LinkType;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  
  // Optional fields
  effectiveFrom?: string;      // Дата набрання чинності зв'язку
  effectiveUntil?: string;     // Дата закінчення зв'язку
  reason?: string;             // Причина створення зв'язку
  notes?: string;              // Примітки
  
  // Validation
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

// ============================================
// LINK CHAIN (FOR VISUALIZATION)
// ============================================

export interface LinkChainNode {
  documentId: string;
  documentNumber: string;
  documentType: string;
  documentDate: string;
  status: string;
  depth: number;
  links: DocumentLink[];
}

export interface DocumentChain {
  rootId: string;
  nodes: LinkChainNode[];
  maxDepth: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getLinkDirection = (linkType: LinkType): "forward" | "backward" | "bidirectional" => {
  return linkTypeConfig[linkType].direction;
};

export const getInverseLinkType = (linkType: LinkType): LinkType | undefined => {
  return linkTypeConfig[linkType].inverseType;
};

export const isFinancialLink = (linkType: LinkType): boolean => {
  return ["payment-basis", "payment-confirm"].includes(linkType);
};

export const isHierarchicalLink = (linkType: LinkType): boolean => {
  return ["parent", "child", "amendment", "annex"].includes(linkType);
};

export const isVersionLink = (linkType: LinkType): boolean => {
  return ["supersedes", "superseded-by", "version-of"].includes(linkType);
};

// ============================================
// LINK GROUPS FOR UI
// ============================================

export type LinkGroup = "hierarchy" | "financial" | "versions" | "references" | "packages";

export const linkTypeToGroup: Record<LinkType, LinkGroup> = {
  parent: "hierarchy",
  child: "hierarchy",
  amendment: "hierarchy",
  annex: "hierarchy",
  "payment-basis": "financial",
  "payment-confirm": "financial",
  supersedes: "versions",
  "superseded-by": "versions",
  "version-of": "versions",
  reference: "references",
  related: "references",
  bundle: "packages",
  "audit-package": "packages",
  "discrepancy-act": "hierarchy",
};

export const linkGroupConfig: Record<LinkGroup, {
  labelUk: string;
  order: number;
}> = {
  hierarchy: { labelUk: "Ланцюжок документів", order: 1 },
  financial: { labelUk: "Фінансові зв'язки", order: 2 },
  versions: { labelUk: "Версії", order: 3 },
  references: { labelUk: "Посилання", order: 4 },
  packages: { labelUk: "Пакети", order: 5 },
};
