/**
 * useActionSteps Hook
 * Determines action steps and current step index based on document and cabinet state
 */

import { useMemo } from "react";
import type { CabinetType } from "@/types/cabinet";
import type { DocumentFlowStatus } from "@/config/documentFlowConfig";
import type { ApprovalState } from "@/config/approvalWorkflowConfig";
import { 
  getActionStepsConfig, 
  type UserActionStep 
} from "@/config/userActionStepsConfig";

interface UseActionStepsParams {
  documentStatus: DocumentFlowStatus;
  cabinetType: CabinetType;
  approvalState?: ApprovalState;
}

interface UseActionStepsResult {
  steps: UserActionStep[];
  currentStepIndex: number;
  isCompleted: boolean;
}

/**
 * Determines whether the document has an active approval workflow
 */
function hasActiveApprovalWorkflow(approvalState?: ApprovalState): boolean {
  if (!approvalState) return false;
  if (approvalState.autoApproved) return false;
  if (!approvalState.required) return false;
  return approvalState.chain.length > 0;
}

/**
 * Hook to get personalized action steps for a document
 */
export function useActionSteps({
  documentStatus,
  cabinetType,
  approvalState,
}: UseActionStepsParams): UseActionStepsResult {
  return useMemo(() => {
    const hasApproval = hasActiveApprovalWorkflow(approvalState);
    const config = getActionStepsConfig(cabinetType, hasApproval);
    
    // Terminal statuses
    const terminalStatuses: DocumentFlowStatus[] = [
      "archived", 
      "cancelled", 
      "disputed"
    ];
    
    if (terminalStatuses.includes(documentStatus)) {
      return {
        steps: config.steps,
        currentStepIndex: config.steps.length - 1,
        isCompleted: true,
      };
    }
    
    // Get step index from status map
    let currentIndex = config.statusToStepMap[documentStatus] ?? 0;
    
    // For TOV with approval, check if approval is still in progress
    if (hasApproval && approvalState) {
      const approvalInProgress = approvalState.status === "pending" || 
                                  approvalState.status === "in-progress";
      
      if (approvalInProgress && documentStatus !== "draft") {
        // Still in approval phase
        currentIndex = 1; // "approve" step
      } else if (approvalState.status === "approved" && documentStatus === "pending-sign") {
        // Approval complete, waiting for signature
        currentIndex = 2; // "sign" step
      }
    }
    
    // Check if fully completed
    const isCompleted = currentIndex >= config.steps.length - 1;
    
    return {
      steps: config.steps,
      currentStepIndex: Math.min(currentIndex, config.steps.length - 1),
      isCompleted,
    };
  }, [documentStatus, cabinetType, approvalState]);
}
