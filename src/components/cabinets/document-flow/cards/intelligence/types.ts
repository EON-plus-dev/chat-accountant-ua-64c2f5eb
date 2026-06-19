// Types for DocumentIntelligenceCard subcomponents

import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { 
  DocumentSummary, 
  ContractSummary,
  PartyInfo,
  KeyDate,
  DocumentChecklist,
  ChecklistItem,
  FieldConfidence,
} from "@/types/documentSummary";
import type { ProlongationPolicy } from "@/config/settingsConfig";

// Legal sections configuration
export const legalSectionsConfig = [
  { key: "penalties", title: "Штрафні санкції", icon: "AlertTriangle" as const },
  { key: "termination", title: "Умови розірвання", icon: "XCircle" as const },
  { key: "disputes", title: "Вирішення спорів", icon: "Scale" as const },
  { key: "forceMajeure", title: "Форс-мажор", icon: "Shield" as const },
  { key: "liability", title: "Обмеження відповідальності", icon: "Scale" as const },
  { key: "confidentiality", title: "Конфіденційність", icon: "Lock" as const },
  { key: "governingLaw", title: "Застосовне право", icon: "Gavel" as const },
] as const;

export type SectionStatus = "missing" | "warning" | "ok";

export interface SectionStatusInfo {
  status: SectionStatus;
  label?: string;
}

export interface LegalSectionsSummary {
  defined: number;
  total: number;
  warnings: Array<{ section: string; label: string; key: string }>;
  missing: Array<{ section: string; key: string }>;
  sections: Array<{ 
    key: string; 
    title: string; 
    status: SectionStatus; 
    label?: string;
    icon: string;
  }>;
}

export interface AggregatedAlert {
  type: "ai" | "legal" | "missing";
  text: string;
  severity: "critical" | "high" | "medium";
}

// Operational data interface
export interface OperationalData {
  responsibleName?: string;
  period?: string;
  accountingAccount?: string;
  tags?: string[];
  internalNote?: string;
}

// Primary action configuration
export interface PrimaryActionConfig {
  label: string;
  icon: string;
  action: "sign" | "send" | "pay" | "archive" | "wait" | null;
  variant: "default" | "outline" | "secondary";
}

// Prolongation labels
export const prolongationTypeLabels: Record<string, string> = {
  auto: "Автоматична",
  manual: "Ручна",
  none: "Без пролонгації",
};

// Party role labels
export const roleLabels: Record<string, string> = {
  supplier: "Постачальник",
  buyer: "Замовник",
  executor: "Виконавець",
  client: "Клієнт",
  lessor: "Орендодавець",
  lessee: "Орендар",
  seller: "Продавець",
  principal: "Довіритель",
  shipper: "Вантажовідправник",
  consignee: "Вантажоотримувач",
  carrier: "Перевізник",
};

// Penalty type labels
export const penaltyTypeLabels: Record<string, string> = {
  "late-payment": "Прострочення оплати",
  "non-delivery": "Невиконання поставки",
  "quality": "Порушення якості",
  "other": "Інші порушення",
};

// Dispute method labels
export const disputeMethodLabels: Record<string, string> = {
  court: "Судовий порядок",
  arbitration: "Арбітраж",
  mediation: "Медіація",
  negotiation: "Переговори",
};

// Main component props
export interface DocumentIntelligenceCardProps {
  document?: FlowDocument;
  summary?: DocumentSummary | ContractSummary;
  isLoading?: boolean;
  operationalData?: OperationalData;
  cabinetPolicy?: ProlongationPolicy;
  cabinetType?: string;
  checklist?: DocumentChecklist;
  onExplainSimple?: () => void;
  onExplainRisks?: () => void;
  onCompareTemplate?: () => void;
  onNavigateToContractor?: (contractorCode: string) => void;
  onNavigateToRelatedTab?: () => void;
  onPrimaryAction?: (action: "sign" | "send" | "pay" | "archive") => void;
  onChecklistAction?: (item: ChecklistItem) => void;
  onChecklistItemComplete?: (itemId: string) => void;
  onNavigateToFieldInPdf?: (field: FieldConfidence) => void;
  onOpenSideBySide?: () => void;
  onAskAI?: () => void;
  className?: string;
}

// Subcomponent props
export interface IntelligenceCardHeaderProps {
  confidence?: number;
  analysisTime: string;
  checklist?: { 
    completedItems: number; 
    totalItems: number; 
    completionPercent: number;
  };
  isComplete?: boolean;
  onAskAI?: () => void;
  onOpenSideBySide?: () => void;
  hasFieldsToReview?: boolean;
}

export interface IntelligenceCardSummaryProps {
  shortSummary: string;
  alerts: AggregatedAlert[];
  isExpired?: boolean;
  hasNewContractor?: boolean;
  pendingContractorCode?: string;
  onNavigateToContractor?: (code: string) => void;
  isCompact?: boolean;
  onExpandDetails?: () => void;
}

export interface IntelligenceCardPartiesProps {
  supplier?: PartyInfo;
  buyer?: PartyInfo;
  documentType?: string;
  onNavigateToContractor?: (code: string) => void;
  onNavigateToRelatedTab?: () => void;
}

export interface IntelligenceCardFinancialsProps {
  financials?: {
    amount: number;
    currency?: string;
    vatIncluded?: boolean;
    exchangeRate?: number;
    exchangeRateDate?: string;
    amountInUAH?: number;
  };
  documentId?: string;
  cabinetType?: string;
}

export interface IntelligenceCardDatesProps {
  keyDates: KeyDate[];
}

export interface IntelligenceCardLegalProps {
  isContractType: boolean;
  legalSummary?: LegalSectionsSummary;
  contractData?: ContractSummary["contract"];
  autoExpandedSections?: string[];
}

export interface IntelligenceCardExtractionProps {
  fieldConfidences?: FieldConfidence[];
  onNavigateToFieldInPdf?: (field: FieldConfidence) => void;
  onOpenSideBySide?: () => void;
}

// Income Book Status for Financials section
export interface IncomeBookStatus {
  isLinked: boolean;
  linkedRecord?: { 
    id: string; 
    date: string; 
    amount: number;
  };
  taxPeriod?: string;
  includedInLimit: boolean;
  limitImpact?: {
    amount: number;
    percentOfLimit: number;
    currentTotal: number;
    yearlyLimit: number;
  };
}
