/**
 * Business Status Configuration
 * 
 * Derived business statuses layer on top of DocumentFlowStatus
 * Provides human-readable labels with approval workflow substatus support
 */

import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FileCheck2,
  FileSignature,
  FileClock,
  FileArchive,
  FileX,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Scale,
  Calculator,
  UserCog,
  Building2,
} from "lucide-react";

import type { Document, DocumentFlowStatus } from "./documentFlowConfig";
import type { ApprovalState, ApprovalRole } from "./approvalWorkflowConfig";
import { roleLabels, getApprovalState } from "./approvalWorkflowConfig";
import type { CabinetType } from "@/types/cabinet";

// ============================================
// BUSINESS STATUS TYPES
// ============================================

export type BusinessStatus =
  | "draft"              // Чернетка
  | "draft-pending-contractor" // Очікує реєстрації контрагента
  | "processing"         // В обробці (AI-аналіз)
  | "needs-clarification" // Потребує уточнення (на ролі)
  | "pending-sign"       // Очікує підпису
  | "signed"             // Підписано
  | "sent"               // Відправлено контрагенту
  | "confirmed"          // Погоджено контрагентом
  | "paid"               // Оплачено
  | "partially-paid"     // Частково оплачено
  | "registered"         // Зареєстровано (ЄРПН)
  | "archived"           // В архіві
  | "cancelled"          // Скасовано
  | "discrepancy-pending"; // Акт розбіжностей створено

export interface BusinessStatusResult {
  status: BusinessStatus;
  label: string;                // "Потребує уточнення (на юристі)"
  substatus?: ApprovalRole;     // "lawyer" | "accountant" тощо
  substatusLabel?: string;      // "На юристі"
  color: string;                // Tailwind classes for Badge
  bgColor: string;              // Background color for cards/rows
  icon: LucideIcon;
}

// ============================================
// STATUS CONFIGURATION
// ============================================

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

const baseStatusConfigs: Record<BusinessStatus, StatusConfig> = {
  draft: {
    label: "Чернетка",
    color: "bg-muted text-muted-foreground",
    bgColor: "bg-muted/30",
    icon: FileText,
  },
  "draft-pending-contractor": {
    label: "Очікує контрагента",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/30",
    icon: Clock,
  },
  processing: {
    label: "В обробці (AI)",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/30",
    icon: Loader2,
  },
  "needs-clarification": {
    label: "Потребує уточнення",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/30",
    icon: AlertCircle,
  },
  "pending-sign": {
    label: "Очікує підпису",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/30",
    icon: FileSignature,
  },
  signed: {
    label: "Підписано",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/30",
    icon: FileCheck2,
  },
  sent: {
    label: "Відправлено контрагенту",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    bgColor: "bg-indigo-50/50 dark:bg-indigo-950/30",
    icon: Send,
  },
  confirmed: {
    label: "Погоджено контрагентом",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/30",
    icon: CheckCircle2,
  },
  paid: {
    label: "Оплачено",
    color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    bgColor: "bg-green-50/50 dark:bg-green-950/30",
    icon: CheckCircle2,
  },
  "partially-paid": {
    label: "Частково оплачено",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    bgColor: "bg-yellow-50/50 dark:bg-yellow-950/30",
    icon: Clock,
  },
  registered: {
    label: "Зареєстровано",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    bgColor: "bg-purple-50/50 dark:bg-purple-950/30",
    icon: FileCheck2,
  },
  archived: {
    label: "В архіві",
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
    bgColor: "bg-slate-50/50 dark:bg-slate-950/30",
    icon: FileArchive,
  },
  cancelled: {
    label: "Скасовано",
    color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    bgColor: "bg-red-50/50 dark:bg-red-950/30",
    icon: FileX,
  },
  "discrepancy-pending": {
    label: "Акт розбіжностей",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    bgColor: "bg-orange-50/50 dark:bg-orange-950/30",
    icon: AlertTriangle,
  },
};

// Icons for approval roles (for substatus display)
const roleIcons: Record<ApprovalRole, LucideIcon> = {
  accountant: Calculator,
  "chief-accountant": Calculator,
  lawyer: Scale,
  hr: UserCog,
  director: Building2,
};

// ============================================
// TYPE-SPECIFIC STATUS LABELS (Phase 4)
// ============================================

import type { DocumentType } from "./documentFlowConfig";

/**
 * Type-specific status labels for better UX
 * Overrides default labels for specific document types
 */
export const typeSpecificStatusLabels: Partial<Record<DocumentType, Partial<Record<BusinessStatus, string>>>> = {
  "tax-invoice": {
    registered: "Зареєстровано в ЄРПН",
    signed: "Підписано (очікує реєстрації)",
  },
  reconciliation: {
    confirmed: "Звірено без розбіжностей",
    sent: "Надіслано на звірку",
  },
  "discrepancy-act": {
    confirmed: "Прийнято контрагентом",
    sent: "На розгляді контрагента",
  },
  "dismissal-order": {
    "pending-sign": "Очікує підпису керівника",
    signed: "Підписано (виконати чек-лист)",
  },
};

/**
 * Get status label with type-specific override
 */
export function getStatusLabel(
  status: BusinessStatus,
  documentType?: DocumentType
): string {
  // Check for type-specific override
  if (documentType && typeSpecificStatusLabels[documentType]?.[status]) {
    return typeSpecificStatusLabels[documentType][status]!;
  }
  
  // Fallback to base config
  return baseStatusConfigs[status]?.label || status;
}

// ============================================
// UNIFIED LIFECYCLE STAGE LABELS (for Stepper UI)
// ============================================

/**
 * Уніфіковані лейбли стадій життєвого циклу документа
 * Використовуються в DocumentLifecycleStepper та інших UI компонентах
 */
export const lifecycleStageLabels = {
  draft: "Чернетка",
  "in-review": "На узгодженні",
  "needs-clarification": "На узгодженні",
  "pending-sign": "Очікує підпису",
  signed: "Підписано",
  sent: "Надіслано",
  confirmed: "Підтверджено",
  "in-accounting": "В обліку",
  paid: "Оплачено",
  "partially-paid": "Частково оплачено",
  registered: "Зареєстровано",
  archived: "Архів",
  cancelled: "Скасовано",
  disputed: "Спір / Акт розбіжностей",
  "discrepancy-pending": "Спір / Акт розбіжностей",
} as const;

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Get derived business status for a document
 * Considers AI processing state and approval workflow
 */
export function getBusinessStatus(
  document: Document,
  approvalState?: ApprovalState,
  cabinetType: CabinetType = "tov"
): BusinessStatusResult {
  const baseStatus = document.status;
  
  // 1. Check for AI processing status (new derived status)
  const aiProcessingStatus = document.aiProcessingStatus;
  if (aiProcessingStatus === "pending" || aiProcessingStatus === "in-progress") {
    const config = baseStatusConfigs.processing;
    return {
      status: "processing",
      label: config.label,
      color: config.color,
      bgColor: config.bgColor,
      icon: config.icon,
    };
  }
  
  // 2. Check for needs-clarification (approval workflow in progress)
  if (approvalState?.required && approvalState.status === "in-progress") {
    const currentStep = approvalState.chain[approvalState.currentStepIndex];
    if (currentStep && currentStep.status === "pending") {
      const role = currentStep.role;
      const roleLabel = roleLabels[role];
      const config = baseStatusConfigs["needs-clarification"];
      
      return {
        status: "needs-clarification",
        label: `Потребує уточнення (${roleLabel.toLowerCase().replace(/^(.)/, (_, c) => "на " + c)})`,
        substatus: role,
        substatusLabel: `На ${roleLabel.toLowerCase()}і`,
        color: config.color,
        bgColor: config.bgColor,
        icon: roleIcons[role] || config.icon,
      };
    }
  }
  
  // 3. Check if approval is rejected
  if (approvalState?.status === "rejected") {
    // Find who rejected
    const rejectedStep = approvalState.chain.find(s => s.status === "rejected");
    if (rejectedStep) {
      return {
        status: "cancelled",
        label: `Відхилено (${roleLabels[rejectedStep.role]})`,
        substatus: rejectedStep.role,
        substatusLabel: roleLabels[rejectedStep.role],
        color: baseStatusConfigs.cancelled.color,
        bgColor: baseStatusConfigs.cancelled.bgColor,
        icon: baseStatusConfigs.cancelled.icon,
      };
    }
  }
  
  // 4. Default: map from base DocumentFlowStatus
  const mappedStatus = baseStatus as BusinessStatus;
  const config = baseStatusConfigs[mappedStatus] || baseStatusConfigs.draft;
  
  return {
    status: mappedStatus,
    label: config.label,
    color: config.color,
    bgColor: config.bgColor,
    icon: config.icon,
  };
}

/**
 * Check if document is assigned to current user/role
 * Used for "Документи на мені" filter
 */
export function isDocumentAssignedToUser(
  document: Document,
  approvalState: ApprovalState | undefined,
  currentUserRole: ApprovalRole
): boolean {
  // No approval required - not assigned
  if (!approvalState?.required) {
    return false;
  }
  
  // Approval not in progress - not assigned
  if (approvalState.status !== "in-progress") {
    return false;
  }
  
  // Check current step
  const currentStep = approvalState.chain[approvalState.currentStepIndex];
  if (!currentStep) {
    return false;
  }
  
  // Match role
  return currentStep.role === currentUserRole;
}

/**
 * Extended check for "Документи на мені"
 * Includes:
 * 1. Documents where user is active approver
 * 2. Documents where user is initiator AND has clarification request
 * 3. Documents awaiting counterparty response (for tracking)
 */
export function isDocumentOnMe(
  document: Document,
  approvalState: ApprovalState | undefined,
  currentUserRole: ApprovalRole,
  currentUserId: string
): boolean {
  // 1. Active approver in workflow
  if (isDocumentAssignedToUser(document, approvalState, currentUserRole)) {
    return true;
  }
  
  // 2. Initiator with active clarification request
  if (
    document.createdBy === currentUserId && 
    approvalState?.chain?.some(s => s.clarificationRequested && s.status === "pending")
  ) {
    return true;
  }
  
  return false;
}

/**
 * Count documents assigned to current user
 */
export function countDocumentsOnMe(
  documents: Document[],
  currentUserRole: ApprovalRole,
  currentUserId: string,
  cabinetType: CabinetType
): number {
  return documents.filter(doc => {
    const approvalState = getApprovalState(doc.id, doc.type, doc.amount, cabinetType);
    return isDocumentOnMe(doc, approvalState, currentUserRole, currentUserId);
  }).length;
}

/**
 * Get business status with automatic approval state resolution
 * Convenience function for components that don't have approvalState
 */
export function getBusinessStatusForDocument(
  document: Document,
  cabinetType: CabinetType = "tov"
): BusinessStatusResult {
  const approvalState = getApprovalState(
    document.id,
    document.type,
    document.amount,
    cabinetType
  );
  
  return getBusinessStatus(document, approvalState, cabinetType);
}

// ============================================
// DEMO CURRENT USER (TODO: Replace with auth context)
// ============================================

/**
 * Demo current user role for testing "Документи на мені" filter
 * TODO: Replace with actual user role from authentication context
 */
export const DEMO_CURRENT_USER_ROLE: ApprovalRole = "accountant";
export const DEMO_CURRENT_USER_ID = "user-1";
export const DEMO_CURRENT_USER_NAME = "Іваненко О.В.";
