/**
 * DocumentOverviewTab — Об'єднаний таб "Огляд" 
 * Структура: 4 блоки — Паспорт, Що робити далі, Ризики, Юридична сила
 */

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

import { ApprovalStatusSection } from "../sections/ApprovalStatusSection";
import type { ActionType } from "@/config/userActionStepsConfig";
import {
  DocumentAICommandCenter,
  LegalSignaturesBlock,
  OverviewPassportBlock,
} from "../blocks";
import type { SignatureVerification, IntegrityCheck } from "@/types/documentAuthenticity";
import { generateDemoSignature, generateDemoIntegrity } from "@/types/documentAuthenticity";

import type { 
  DocumentSummary, 
  ContractSummary, 
  DocumentChecklist,
  ChecklistItem,
} from "@/types/documentSummary";
import { type Document as FlowDocument } from "@/config/documentFlowConfig";
import { type ApprovalState, needsApprovalWorkflow } from "@/config/approvalWorkflowConfig";
import { type CabinetType } from "@/types/cabinet";
import { type ProlongationPolicy } from "@/config/settingsConfig";
import { DEMO_CURRENT_USER_ID } from "@/config/businessStatusConfig";
import { getFieldDisplayValue } from "@/types/templateField";
import { getTemplateById } from "@/config/documentTemplatesConfig";

interface OperationalData {
  responsibleName?: string;
  period?: string;
  accountingAccount?: string;
  tags?: string[];
  internalNote?: string;
}

interface DocumentOverviewTabProps {
  document?: FlowDocument;
  summary?: DocumentSummary | ContractSummary;
  checklist?: DocumentChecklist;
  linkedDocumentsResolved?: FlowDocument[];
  approvalState?: ApprovalState;
  onApprove?: (comment?: string) => void;
  onReject?: (comment: string) => void;
  onRecommend?: (comment: string) => void;
  onRequestClarification?: (comment: string) => void;
  onRespondToClarification?: (comment: string) => void;
  onResolveComment?: (commentId: string, resolved: boolean) => void;
  cabinetType?: CabinetType;
  operationalData?: OperationalData;
  attachedReferencedDocs?: Set<string>;
  onChatPrompt?: (prompt: string) => void;
  onExplainSimple?: () => void;
  onExplainRisks?: () => void;
  onChecklistAction?: (item: ChecklistItem) => void;
  onChecklistItemComplete?: (itemId: string) => void;
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToContractor?: (contractorCode: string) => void;
  onNavigateToRelatedTab?: () => void;
  onNavigateToIntegration?: () => void;
  onUploadRelatedDocument?: (docType: string, description: string) => void;
  onNavigateToFieldInPdf?: (field: import("@/types/documentSummary").FieldConfidence) => void;
  onOpenSideBySide?: () => void;
  onNavigateToTechId?: () => void;
  onSign?: () => void;
  onSend?: () => void;
  onPayment?: () => void;
  onArchive?: () => void;
  onStepAction?: (actionType: ActionType) => void;
  onOpenEditor?: () => void; // NEW: Navigate to document tab in edit mode
  className?: string;
  cabinetPolicy?: ProlongationPolicy;
  // Action workflow handlers for tasks
  onSignDocument?: () => void;
  onValidateContractor?: () => void;
  onInviteContractor?: () => void;
  onNavigateToRegistration?: () => void;
  // Phase 4-5: External completion state for auto-completed tasks
  externalCompletedTaskIds?: Set<string>;
}

export const DocumentOverviewTab = ({
  document,
  summary,
  checklist,
  approvalState,
  onApprove,
  onReject,
  onRecommend,
  onRequestClarification,
  onRespondToClarification,
  cabinetType,
  onChatPrompt,
  onChecklistAction,
  onChecklistItemComplete,
  onNavigateToContractor,
  onNavigateToTechId,
  onStepAction,
  onOpenEditor,
  className,
  // Action workflow handlers
  onSignDocument,
  onValidateContractor,
  onInviteContractor,
  onNavigateToRegistration,
  // Phase 4-5: External completion state
  externalCompletedTaskIds,
}: DocumentOverviewTabProps) => {
  // ============================================
  // UNIFIED FIELD VALUES FROM TEMPLATE
  // ============================================
  const documentFieldValues = useMemo(() => {
    if (!document) return undefined;
    
    // Get template if document has templateId
    const template = document.templateId ? getTemplateById(document.templateId) : undefined;
    
    // Build key field values for display
    return {
      template,
      documentNumber: getFieldDisplayValue(document, "documentNumber") || document.number,
      documentDate: getFieldDisplayValue(document, "documentDate") || document.date,
      total: getFieldDisplayValue(document, "total") || getFieldDisplayValue(document, "totalAmount"),
      supplierName: getFieldDisplayValue(document, "supplierName") || getFieldDisplayValue(document, "executorName"),
      supplierCode: getFieldDisplayValue(document, "supplierCode") || getFieldDisplayValue(document, "executorCode"),
      buyerName: getFieldDisplayValue(document, "buyerName") || getFieldDisplayValue(document, "customerName"),
      buyerCode: getFieldDisplayValue(document, "buyerCode") || getFieldDisplayValue(document, "customerCode"),
      subject: getFieldDisplayValue(document, "subject"),
      validUntil: getFieldDisplayValue(document, "validUntil"),
    };
  }, [document]);

  // Cascading counterparty resolution
  const counterpartyInfo = useMemo(() => {
    if (document?.contractor) {
      return {
        name: document.contractor.name,
        code: document.contractor.code,
        onClick: document.contractor.code && onNavigateToContractor
          ? () => onNavigateToContractor(document.contractor!.code!)
          : undefined,
      };
    }
    const counterpartyParty = document?.parties?.find(p => !p.isCabinetOwner);
    if (counterpartyParty) {
      return {
        name: counterpartyParty.name,
        code: counterpartyParty.code,
        onClick: counterpartyParty.code && onNavigateToContractor
          ? () => onNavigateToContractor(counterpartyParty.code!)
          : undefined,
      };
    }
    if (documentFieldValues?.supplierName) {
      return { name: documentFieldValues.supplierName, code: documentFieldValues.supplierCode };
    }
    if (documentFieldValues?.buyerName) {
      return { name: documentFieldValues.buyerName, code: documentFieldValues.buyerCode };
    }
    return undefined;
  }, [document, documentFieldValues, onNavigateToContractor]);

  // Demo signatures — both parties
  const demoSignatures: SignatureVerification[] = useMemo(() => {
    if (!document || document.status === "draft") return [];

    const sigs: SignatureVerification[] = [];
    const sigStatus = document.signatureStatus;

    // If document has explicit parties, iterate over them
    if (document.parties && document.parties.length > 0) {
      document.parties.forEach((party) => {
        const isOwner = party.isCabinetOwner;
        let partyIsValid = true;
        let statusOverride: import("@/types/documentAuthenticity").SignatureStatus | undefined;

        if (sigStatus === "pending-our" && isOwner) {
          partyIsValid = false;
          statusOverride = "pending";
        } else if (sigStatus === "pending-counterparty" && !isOwner) {
          partyIsValid = false;
          statusOverride = "pending";
        } else if (sigStatus === "pending-both") {
          partyIsValid = false;
          statusOverride = "pending";
        } else if (sigStatus === "partially-signed") {
          // Use isVerified to determine which parties have signed
          if (!party.isVerified) {
            partyIsValid = false;
            statusOverride = "pending";
          }
        } else if (sigStatus === "not-required") {
          return; // skip this party
        }

        sigs.push(generateDemoSignature(
          party.name,
          isOwner ? "Директор" : "Представник",
          partyIsValid,
          statusOverride
        ));
      });
    } else {
      // Fallback: 2-party logic based on sigStatus
      const ownerName = document.cabinetName || "ФОП Мельник П.І.";
      const counterName = counterpartyInfo?.name || "Контрагент";

      if (sigStatus === "pending-our") {
        sigs.push(generateDemoSignature(counterName, "Директор", true));
        sigs.push(generateDemoSignature(ownerName, "Директор", false, "pending"));
      } else if (sigStatus === "pending-counterparty") {
        sigs.push(generateDemoSignature(ownerName, "Директор", true));
        sigs.push(generateDemoSignature(counterName, "Директор", false, "pending"));
      } else if (sigStatus === "pending-both") {
        sigs.push(generateDemoSignature(ownerName, "Директор", false, "pending"));
        sigs.push(generateDemoSignature(counterName, "Директор", false, "pending"));
      } else if (sigStatus === "not-required") {
        // No signatures needed
      } else {
        // signed-our, signed-counterparty, fully-signed, or fallback
        if (!sigStatus || sigStatus === "signed-our" || sigStatus === "fully-signed") {
          sigs.push(generateDemoSignature(ownerName, "Директор", true));
        }
        if (!sigStatus || sigStatus === "signed-counterparty" || sigStatus === "fully-signed") {
          sigs.push(generateDemoSignature(counterName, "Директор", true));
        }
      }
    }

    // Fallback: at least show owner for non-draft if nothing generated
    if (sigs.length === 0 && sigStatus !== "not-required") {
      sigs.push(generateDemoSignature(
        document.cabinetName || "ФОП Мельник П.І.", "Директор", true
      ));
      if (counterpartyInfo?.name) {
        sigs.push(generateDemoSignature(counterpartyInfo.name, "Директор", true));
      }
    }

    return sigs;
  }, [document, counterpartyInfo]);

  const demoIntegrity: IntegrityCheck = generateDemoIntegrity(true);

  // Build parties array for SmartDescription
  const parties = useMemo(() => {
    if (!document) return [];
    
    const result: Array<{
      name: string;
      code?: string;
      isOwner?: boolean;
      systemStatus?: "in-directory" | "invited" | "has-cabinet" | "not-found";
    }> = [];
    
    // From document.parties
    if (document.parties && document.parties.length > 0) {
      document.parties.forEach((party) => {
        result.push({
          name: party.name,
          code: party.code,
          isOwner: party.isCabinetOwner,
          systemStatus: party.isVerified ? "in-directory" : "not-found",
        });
      });
    } else {
      // Fallback to contractor
      if (document.cabinetName) {
        result.push({
          name: document.cabinetName,
          isOwner: true,
          systemStatus: "has-cabinet",
        });
      }
      if (document.contractor) {
        result.push({
          name: document.contractor.name,
          code: document.contractor.code,
          isOwner: false,
          systemStatus: document.contractor.validationStatus === "valid" ? "in-directory" : "not-found",
        });
      }
    }
    
    return result;
  }, [document]);

  // Handle scroll to risks with highlight animation
  const handleScrollToRisks = useCallback(() => {
    const element = document?.id ? globalThis.document.querySelector('[data-section="risks"]') : null;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Trigger highlight animation after scroll
      setTimeout(() => {
        element.dispatchEvent(new CustomEvent('risks-highlight'));
      }, 500);
    }
  }, [document?.id]);

  // Handle scroll to tasks
  const handleScrollToTasks = useCallback(() => {
    const element = document?.id ? globalThis.document.querySelector('[data-section="checklist"]') : null;
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [document?.id]);

  // Calculate counts for teasers
  const tasksCount = document?.tasks?.filter(t => t.status !== "completed").length || 
                     checklist?.items?.filter(i => i.status !== "done").length || 0;
  const risksCount = document?.aiRisks?.length || 0;

  if (!document) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 0. Approval Status Section - only for TOV */}
      {cabinetType && needsApprovalWorkflow(cabinetType) && approvalState && (
        <ApprovalStatusSection
          approvalState={approvalState}
          documentId={document.id}
          currentUserId={DEMO_CURRENT_USER_ID}
          isDocumentAuthor={true}
          onApprove={onApprove}
          onReject={onReject}
          onRecommend={onRecommend}
          onRequestClarification={onRequestClarification}
          onRespondToClarification={onRespondToClarification}
        />
      )}

      {/* 1. Паспорт документа (unified: Stepper + Fields) */}
      <OverviewPassportBlock
        document={document}
        fieldValues={documentFieldValues}
        cabinetType={cabinetType}
        approvalState={approvalState}
        onStepAction={onStepAction}
        counterparty={counterpartyInfo}
      />

      {/* 2. AI Command Center (unified tasks + risks + AI summary) */}
      <DocumentAICommandCenter
        document={document}
        summary={summary}
        aiRisks={document.aiRisks}
        tasks={document.tasks}
        checklist={checklist}
        documentId={document.id}
        parties={parties}
        fieldValues={documentFieldValues}
        onSignDocument={onSignDocument}
        onValidateContractor={onValidateContractor}
        onInviteContractor={onInviteContractor}
        onNavigateToRegistration={onNavigateToRegistration}
        onNavigateToContractor={onNavigateToContractor}
        onChatPrompt={onChatPrompt}
        onOpenEditor={onOpenEditor}
        externalCompletedTaskIds={externalCompletedTaskIds}
      />

      {/* 4. Юридична сила та підписи (КЕП) */}
      <LegalSignaturesBlock
        document={document}
        signatures={demoSignatures}
        integrity={demoIntegrity}
        onNavigateToTechId={onNavigateToTechId}
      />
    </div>
  );
};
