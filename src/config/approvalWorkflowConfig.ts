/**
 * Approval Workflow Configuration
 * 
 * Key principles:
 * - FOP: No separate approval - signing = confirmation (підписання = погодження)
 * - Individual: Auto-approved (personal documents)
 * - ТОВ: Full approval chain (Юрист → Бухгалтер → Директор) based on document type and amount
 */

import { type DocumentType, type DocumentFlowStatus } from "./documentFlowConfig";
import { type CabinetType } from "@/types/cabinet";

// User roles in approval chain (only for ТОВ)
export type ApprovalRole = 
  | "accountant" 
  | "chief-accountant" 
  | "lawyer" 
  | "hr" 
  | "director";

export const roleLabels: Record<ApprovalRole, string> = {
  accountant: "Бухгалтер",
  "chief-accountant": "Головний бухгалтер",
  lawyer: "Юрист",
  hr: "HR-менеджер",
  director: "Директор",
};

// Tooltip descriptions for each role (for ТОВ workflow)
export const roleDescriptions: Record<ApprovalRole, string> = {
  accountant: "Перевірка фінансових умов, відповідності бюджету",
  "chief-accountant": "Контроль правильності обліку, податкових наслідків",
  lawyer: "Перевірка правових ризиків, умов договору",
  hr: "Перевірка кадрових питань, відповідності законодавству",
  director: "Фінальне рішення та підпис",
};

// Approval status for a single step
export type ApprovalStepStatus = "pending" | "approved" | "rejected" | "skipped" | "needs-clarification";

export interface ApprovalStep {
  role: ApprovalRole;
  status: ApprovalStepStatus;
  userId?: string;
  userName?: string;
  timestamp?: string;
  comment?: string;
  clarificationRequested?: boolean;  // Чи запитано уточнення
  clarificationReason?: string;      // Причина запиту уточнення
  recommendedAt?: string;            // Коли було надано рекомендацію
  recommendationComment?: string;    // Коментар рекомендації
}

// Full approval state for a document
export interface ApprovalState {
  required: boolean;
  autoApproved?: boolean;
  autoApproveReason?: string;
  chain: ApprovalStep[];
  currentStepIndex: number;
  status: "pending" | "in-progress" | "approved" | "rejected";
}

// Approval rule definition
export interface ApprovalRule {
  documentTypes: DocumentType[];
  amountThreshold?: number; // UAH - only applies if amount >= threshold
  chain: ApprovalRole[];
  autoApproveBelow?: number; // Auto-approve if amount < this
}

// Approval rules for ТОВ
export const approvalRules: ApprovalRule[] = [
  // Invoices - approval based on amount
  {
    documentTypes: ["invoice"],
    amountThreshold: 50000,
    chain: ["accountant", "chief-accountant", "director"],
    autoApproveBelow: 10000,
  },
  {
    documentTypes: ["invoice"],
    amountThreshold: 10000,
    chain: ["accountant", "chief-accountant"],
  },
  {
    documentTypes: ["invoice"],
    chain: ["accountant"],
  },
  // Contracts - always need legal + director
  {
    documentTypes: ["contract", "supply-contract", "fop-service-contract"],
    amountThreshold: 100000,
    chain: ["lawyer", "chief-accountant", "director"],
  },
  {
    documentTypes: ["contract", "supply-contract", "fop-service-contract"],
    chain: ["lawyer", "director"],
  },
  // HR orders
  {
    documentTypes: ["employment-order", "dismissal-order"],
    chain: ["hr", "director"],
  },
  {
    documentTypes: ["vacation-order"],
    chain: ["hr"],
  },
  // Tax invoices
  {
    documentTypes: ["tax-invoice"],
    chain: ["accountant", "chief-accountant"],
  },
];

// Demo users for each role (ТОВ only)
export const roleUsers: Record<ApprovalRole, { id: string; name: string }> = {
  accountant: { id: "user-1", name: "Іваненко О.В." },
  "chief-accountant": { id: "user-4", name: "Коваленко М.Д." },
  lawyer: { id: "user-2", name: "Петренко І.С." },
  hr: { id: "user-3", name: "Мельник А.А." },
  director: { id: "user-5", name: "Шевченко Т.Г." },
};

/**
 * Check if a cabinet type requires approval workflow UI
 * ФОП: No approval UI - signing with QES = confirmation
 * ТОВ: Full approval chain with UI
 * Individual: No approval needed
 */
export const needsApprovalWorkflow = (cabinetType: CabinetType): boolean => {
  // Only ТОВ has approval workflow UI
  // ФОП: signing = approval, no separate step
  // Individual: auto-approved
  return cabinetType === "tov";
};

/**
 * Get approval chain for a document
 * Only returns chain for ТОВ - FOP and Individual don't have chains
 */
export const getApprovalChain = (
  documentType: DocumentType,
  amount?: number,
  cabinetType: CabinetType = "tov"
): ApprovalRole[] => {
  // FOP and Individual: no approval chain
  // FOP: signing with QES = approval
  // Individual: auto-approved
  if (cabinetType !== "tov") {
    return [];
  }

  // TOV: full approval chain
  // Find matching rule (rules are ordered by priority - more specific first)
  const rule = approvalRules.find(r => {
    if (!r.documentTypes.includes(documentType)) return false;
    if (r.amountThreshold && (amount ?? 0) < r.amountThreshold) return false;
    return true;
  });

  return rule?.chain ?? [];
};

/**
 * Check if document should be auto-approved
 * FOP: auto-approved (signing = confirmation)
 * Individual: auto-approved (personal documents)
 * ТОВ: based on amount thresholds
 */
export const shouldAutoApprove = (
  documentType: DocumentType,
  amount?: number,
  cabinetType: CabinetType = "tov"
): { autoApprove: boolean; reason?: string } => {
  // Individual: always auto-approved (personal documents)
  if (cabinetType === "individual") {
    return { 
      autoApprove: true, 
      reason: "Персональний кабінет" 
    };
  }

  // FOP: auto-approved - signing with QES = confirmation
  // No separate approval step needed
  if (cabinetType === "fop") {
    return { 
      autoApprove: true, 
      reason: "Підписання власником" 
    };
  }

  // TOV: check for auto-approve threshold in rules
  const rule = approvalRules.find(r => {
    if (!r.documentTypes.includes(documentType)) return false;
    if (r.autoApproveBelow && (amount ?? 0) < r.autoApproveBelow) return true;
    return false;
  });

  if (rule?.autoApproveBelow && (amount ?? 0) < rule.autoApproveBelow) {
    return { 
      autoApprove: true, 
      reason: `Сума нижче ${rule.autoApproveBelow.toLocaleString("uk-UA")} ₴` 
    };
  }

  return { autoApprove: false };
};

/**
 * Build initial approval state for a document
 */
export const buildApprovalState = (
  documentType: DocumentType,
  amount?: number,
  cabinetType: CabinetType = "tov"
): ApprovalState => {
  // Check auto-approve first
  const { autoApprove, reason } = shouldAutoApprove(documentType, amount, cabinetType);
  
  if (autoApprove) {
    return {
      required: false,
      autoApproved: true,
      autoApproveReason: reason,
      chain: [],
      currentStepIndex: 0,
      status: "approved",
    };
  }

  // Build chain
  const roles = getApprovalChain(documentType, amount, cabinetType);
  
  if (roles.length === 0) {
    return {
      required: false,
      autoApproved: true,
      autoApproveReason: "Погодження не потрібне",
      chain: [],
      currentStepIndex: 0,
      status: "approved",
    };
  }

  const chain: ApprovalStep[] = roles.map(role => ({
    role,
    status: "pending",
    userId: roleUsers[role].id,
    userName: roleUsers[role].name,
  }));

  return {
    required: true,
    chain,
    currentStepIndex: 0,
    status: "pending",
  };
};

/**
 * Demo approval states for existing documents
 */
export const demoApprovalStates: Record<string, ApprovalState> = {
  // TOV invoice - in progress, on chief-accountant
  "tov-invoice-1": {
    required: true,
    chain: [
      { role: "accountant", status: "approved", userId: "user-1", userName: "Іваненко О.В.", timestamp: "2025-01-10T14:30:00" },
      { role: "chief-accountant", status: "pending", userId: "user-4", userName: "Коваленко М.Д." },
      { role: "director", status: "pending", userId: "user-5", userName: "Шевченко Т.Г." },
    ],
    currentStepIndex: 1,
    status: "in-progress",
  },
  // TOV invoice - in progress, on accountant (for demo "На мені" filter)
  "tov-inv-2025-001": {
    required: true,
    chain: [
      { role: "accountant", status: "pending", userId: "user-1", userName: "Іваненко О.В." },
      { role: "chief-accountant", status: "pending", userId: "user-4", userName: "Коваленко М.Д." },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  // TOV contract - in progress, on lawyer - SLA OVERDUE DEMO (12 days old)
  "tov-contract-pending": {
    required: true,
    chain: [
      { 
        role: "lawyer", 
        status: "pending", 
        userId: "user-2", 
        userName: "Петренко І.С.",
        // Timestamp 12 days ago for SLA demo
      },
      { role: "director", status: "pending", userId: "user-5", userName: "Шевченко Т.Г." },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  // TOV contract - approved
  "tov-contract-1": {
    required: true,
    chain: [
      { role: "lawyer", status: "approved", userId: "user-2", userName: "Петренко І.С.", timestamp: "2025-01-08T10:15:00" },
      { role: "director", status: "approved", userId: "user-5", userName: "Шевченко Т.Г.", timestamp: "2025-01-08T16:45:00" },
    ],
    currentStepIndex: 2,
    status: "approved",
  },
  // Small invoice - auto-approved
  "tov-invoice-small": {
    required: false,
    autoApproved: true,
    autoApproveReason: "Сума нижче 10 000 ₴",
    chain: [],
    currentStepIndex: 0,
    status: "approved",
  },
  // HR order - in progress, on HR - SLA WARNING DEMO (6 days old)
  "tov-hr-order-1": {
    required: true,
    chain: [
      { 
        role: "hr", 
        status: "pending", 
        userId: "user-3", 
        userName: "Мельник А.А.",
        // Timestamp 6 days ago for SLA warning demo
      },
      { role: "director", status: "pending", userId: "user-5", userName: "Шевченко Т.Г." },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  // TOV invoice - in progress, on accountant - SLA CRITICAL DEMO (8 days old)
  "tov-inv-sla-critical": {
    required: true,
    chain: [
      { 
        role: "accountant", 
        status: "pending", 
        userId: "user-1", 
        userName: "Іваненко О.В.",
      },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  
  // ============================================
  // SLA DEMO DOCUMENTS (5 scenarios)
  // ============================================
  
  // SLA DEMO 1: Договір на юристі 12 днів - CRITICAL
  "tov-sla-contract-overdue": {
    required: true,
    chain: [
      { role: "lawyer", status: "pending", userId: "user-2", userName: "Петренко І.С." },
      { role: "director", status: "pending", userId: "user-5", userName: "Шевченко Т.Г." },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  
  // SLA DEMO 2: HR-наказ 6 днів - CRITICAL для HR
  "tov-sla-hr-warning": {
    required: true,
    chain: [
      { role: "hr", status: "pending", userId: "user-3", userName: "Мельник А.А." },
      { role: "director", status: "pending", userId: "user-5", userName: "Шевченко Т.Г." },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  
  // SLA DEMO 3: Рахунок на бухгалтері 8 днів - CRITICAL
  "tov-sla-invoice-critical": {
    required: true,
    chain: [
      { role: "accountant", status: "pending", userId: "user-1", userName: "Іваненко О.В." },
      { role: "chief-accountant", status: "pending", userId: "user-4", userName: "Коваленко М.Д." },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  
  // SLA DEMO 4: Рахунок 5 днів - WARNING
  "tov-sla-invoice-warning": {
    required: true,
    chain: [
      { role: "accountant", status: "pending", userId: "user-1", userName: "Іваненко О.В." },
    ],
    currentStepIndex: 0,
    status: "in-progress",
  },
  
  // SLA DEMO 5: Договір на директорі 4 дні - WARNING (юрист погодив 4 дні тому)
  "tov-sla-director-pending": {
    required: true,
    chain: [
      { 
        role: "lawyer", 
        status: "approved", 
        userId: "user-2", 
        userName: "Петренко І.С.", 
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { role: "director", status: "pending", userId: "user-5", userName: "Шевченко Т.Г." },
    ],
    currentStepIndex: 1,
    status: "in-progress",
  },
};

/**
 * Get approval state for a document
 */
export const getApprovalState = (
  documentId: string,
  documentType: DocumentType,
  amount?: number,
  cabinetType: CabinetType = "tov"
): ApprovalState => {
  // Check for demo state first
  if (demoApprovalStates[documentId]) {
    return demoApprovalStates[documentId];
  }

  // Build default state
  return buildApprovalState(documentType, amount, cabinetType);
};

// ============================================
// SLA TRACKING FUNCTIONS
// ============================================

/**
 * SLA thresholds by approval role (in days)
 * Warning: Yellow badge shown when exceeded
 * Critical: Red badge shown when exceeded
 */
export const SLA_THRESHOLDS: Record<ApprovalRole, { warning: number; critical: number }> = {
  accountant: { warning: 5, critical: 7 },
  "chief-accountant": { warning: 5, critical: 7 },
  lawyer: { warning: 7, critical: 10 },
  hr: { warning: 3, critical: 5 },
  director: { warning: 3, critical: 5 },
};

export type SlaSeverity = "ok" | "warning" | "critical";

/**
 * Calculate days in current approval state
 * Uses timestamp from previous step (when transferred) or document.updatedAt
 * Pass documentId for demo scenarios with hardcoded ages
 */
export function getDaysInCurrentState(
  approvalState: ApprovalState,
  documentUpdatedAt?: string,
  documentId?: string
): number {
  // Not in approval or already completed
  if (!approvalState.required || approvalState.status === "approved" || approvalState.status === "rejected") {
    return 0;
  }
  
  const currentStep = approvalState.chain[approvalState.currentStepIndex];
  const previousStep = approvalState.chain[approvalState.currentStepIndex - 1];
  
  // Demo ages mapping - direct by documentId
  const demoAges: Record<string, number> = {
    "tov-sla-contract-overdue": 12,   // lawyer - critical (10+)
    "tov-sla-hr-warning": 6,          // hr - critical (5+)  
    "tov-sla-invoice-critical": 8,    // accountant - critical (7+)
    "tov-sla-invoice-warning": 5,     // accountant - warning (5+)
    "tov-sla-director-pending": 4,    // director - warning (3+)
    "tov-contract-pending": 12,       // legacy demo
    "tov-hr-order-1": 6,              // legacy demo
  };
  
  // Check demo age first by documentId
  if (documentId && demoAges[documentId] !== undefined) {
    return demoAges[documentId];
  }
  
  // Start date is when current step started:
  // 1. Timestamp of previous step (when they approved/transferred)
  // 2. Or document.updatedAt as fallback
  // 3. Or 0 (just created)
  let stateStartDate: Date;
  
  if (previousStep?.timestamp) {
    stateStartDate = new Date(previousStep.timestamp);
  } else if (documentUpdatedAt) {
    stateStartDate = new Date(documentUpdatedAt);
  } else {
    return 0;
  }
  
  const now = new Date();
  const diffMs = now.getTime() - stateStartDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Get SLA severity level based on days in state and role thresholds
 */
export function getSlaSeverity(
  daysInState: number,
  role: ApprovalRole
): SlaSeverity {
  const thresholds = SLA_THRESHOLDS[role];
  if (daysInState >= thresholds.critical) return "critical";
  if (daysInState >= thresholds.warning) return "warning";
  return "ok";
}

/**
 * Get SLA info for display in UI
 */
export interface SlaInfo {
  daysInState: number;
  severity: SlaSeverity;
  role: ApprovalRole | null;
  thresholds: { warning: number; critical: number } | null;
}

export function getSlaInfo(
  approvalState: ApprovalState,
  documentUpdatedAt?: string,
  documentId?: string
): SlaInfo {
  if (!approvalState.required || approvalState.status !== "in-progress") {
    return { daysInState: 0, severity: "ok", role: null, thresholds: null };
  }
  
  const currentStep = approvalState.chain[approvalState.currentStepIndex];
  if (!currentStep || currentStep.status !== "pending") {
    return { daysInState: 0, severity: "ok", role: null, thresholds: null };
  }
  
  const role = currentStep.role;
  const daysInState = getDaysInCurrentState(approvalState, documentUpdatedAt, documentId);
  const severity = getSlaSeverity(daysInState, role);
  const thresholds = SLA_THRESHOLDS[role];
  
  return { daysInState, severity, role, thresholds };
}
