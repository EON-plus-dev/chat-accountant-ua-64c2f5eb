/**
 * User Action Steps Configuration
 * Defines badge-based action steps for different cabinet types
 */

import type { CabinetType } from "@/types/cabinet";
import type { DocumentFlowStatus } from "@/config/documentFlowConfig";

// ============================================
// TYPES
// ============================================

export type ActionType = "fill" | "approve" | "sign" | "send" | "done";

export interface UserActionStep {
  id: string;
  action: ActionType;
  actionLabel: string;      // Active verb: "Підписати"
  completedLabel: string;   // Past tense: "Підписано"
  actor: "user" | "auto";
}

export interface ActionStepsConfig {
  steps: UserActionStep[];
  /** Maps document status to step index */
  statusToStepMap: Partial<Record<DocumentFlowStatus, number>>;
}

// ============================================
// STEP CONFIGURATIONS BY CABINET TYPE
// ============================================

/**
 * ФОП (Sole Proprietor) - Simple 3-step flow
 * fill → sign → done
 */
export const fopSteps: UserActionStep[] = [
  { 
    id: "fill", 
    action: "fill", 
    actionLabel: "Створити", 
    completedLabel: "Створено", 
    actor: "user" 
  },
  { 
    id: "sign", 
    action: "sign", 
    actionLabel: "Підписати", 
    completedLabel: "Підписано", 
    actor: "user" 
  },
  { 
    id: "done", 
    action: "done", 
    actionLabel: "Готово", 
    completedLabel: "Готово", 
    actor: "auto" 
  },
];

/**
 * ТОВ with approval workflow - 4-step flow
 * fill → approve → sign → done
 */
export const tovApprovalSteps: UserActionStep[] = [
  { 
    id: "fill", 
    action: "fill", 
    actionLabel: "Створити", 
    completedLabel: "Створено", 
    actor: "user" 
  },
  { 
    id: "approve", 
    action: "approve", 
    actionLabel: "Погодити", 
    completedLabel: "Погоджено", 
    actor: "user" 
  },
  { 
    id: "sign", 
    action: "sign", 
    actionLabel: "Підписати", 
    completedLabel: "Підписано", 
    actor: "user" 
  },
  { 
    id: "done", 
    action: "done", 
    actionLabel: "Готово", 
    completedLabel: "Готово", 
    actor: "auto" 
  },
];

/**
 * ТОВ without approval (auto-approved) - 3-step flow
 * fill → sign → done
 */
export const tovSimpleSteps: UserActionStep[] = [
  { 
    id: "fill", 
    action: "fill", 
    actionLabel: "Створити", 
    completedLabel: "Створено", 
    actor: "user" 
  },
  { 
    id: "sign", 
    action: "sign", 
    actionLabel: "Підписати", 
    completedLabel: "Підписано", 
    actor: "user" 
  },
  { 
    id: "done", 
    action: "done", 
    actionLabel: "Готово", 
    completedLabel: "Готово", 
    actor: "auto" 
  },
];

/**
 * Individual - Simplest 2-step flow
 * fill → done (auto-approved)
 */
export const individualSteps: UserActionStep[] = [
  { 
    id: "fill", 
    action: "fill", 
    actionLabel: "Створити", 
    completedLabel: "Створено", 
    actor: "user" 
  },
  { 
    id: "done", 
    action: "done", 
    actionLabel: "Готово", 
    completedLabel: "Готово", 
    actor: "auto" 
  },
];

// ============================================
// STATUS MAPPINGS
// ============================================

/**
 * Maps document status to step index for ФОП/ТОВ simple flow
 */
export const simpleStatusToStep: Partial<Record<DocumentFlowStatus, number>> = {
  "draft": 0,
  "needs-clarification": 0,
  "pending-sign": 1,
  "signed": 2,
  "sent": 2,
  "confirmed": 2,
  "paid": 2,
  "partially-paid": 2,
  "registered": 2,
  "archived": 2,
};

/**
 * Maps document status to step index for ТОВ with approval
 */
export const approvalStatusToStep: Partial<Record<DocumentFlowStatus, number>> = {
  "draft": 0,
  "needs-clarification": 1,
  "in-review": 1,
  "pending-sign": 2,
  "signed": 3,
  "sent": 3,
  "confirmed": 3,
  "paid": 3,
  "partially-paid": 3,
  "registered": 3,
  "archived": 3,
};

/**
 * Maps document status to step index for Individual
 */
export const individualStatusToStep: Partial<Record<DocumentFlowStatus, number>> = {
  "draft": 0,
  "confirmed": 1,
  "archived": 1,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get action steps configuration based on cabinet type and approval state
 */
export function getActionStepsConfig(
  cabinetType: CabinetType,
  hasApprovalWorkflow: boolean
): ActionStepsConfig {
  switch (cabinetType) {
    case "individual":
      return {
        steps: individualSteps,
        statusToStepMap: individualStatusToStep,
      };
    
    case "fop":
    case "fop-group":
      return {
        steps: fopSteps,
        statusToStepMap: simpleStatusToStep,
      };
    
    case "tov":
      if (hasApprovalWorkflow) {
        return {
          steps: tovApprovalSteps,
          statusToStepMap: approvalStatusToStep,
        };
      }
      return {
        steps: tovSimpleSteps,
        statusToStepMap: simpleStatusToStep,
      };
    
    default:
      return {
        steps: fopSteps,
        statusToStepMap: simpleStatusToStep,
      };
  }
}
