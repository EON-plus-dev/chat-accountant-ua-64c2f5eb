/**
 * Contractor Onboarding Notification Service
 * 
 * Generates notifications when invited contractors complete registration.
 * Linked documents are auto-filled and users are prompted to finalize/send.
 */

import type { Contractor } from "@/config/settingsConfig";
import type { Document } from "@/config/documentFlowConfig";
import type { Cabinet } from "@/types/cabinet";

export interface ContractorOnboardedNotification {
  id: string;
  type: "contractor-onboarded";
  title: string;
  description: string;
  time: string;
  date: string;
  contractorId: string;
  contractorName: string;
  linkedDocumentIds: string[];
  cabinetId: string;
  cabinetName: string;
  priority: "high";
  isRead: boolean;
  actions: ContractorOnboardedAction[];
}

export interface ContractorOnboardedAction {
  label: string;
  action: "view-document" | "send-document" | "view-contractor";
  documentId?: string;
}

/**
 * Generate notification when a contractor completes onboarding
 */
export function generateContractorOnboardedNotification(
  contractor: Contractor,
  linkedDocuments: Document[],
  cabinet: Cabinet
): ContractorOnboardedNotification {
  const docCount = linkedDocuments.length;
  const docWord = getDocumentWord(docCount);
  
  const now = new Date();
  
  return {
    id: `contractor-onboarded-${contractor.id}-${Date.now()}`,
    type: "contractor-onboarded",
    title: `${contractor.name} завершив реєстрацію`,
    description: docCount > 0 
      ? `${docCount} ${docWord} готовий до відправки. Реквізити автоматично заповнено.`
      : `Контрагент готовий до роботи. Можете створювати документи.`,
    time: "Щойно",
    date: now.toISOString().split("T")[0],
    contractorId: contractor.id,
    contractorName: contractor.name,
    linkedDocumentIds: linkedDocuments.map(d => d.id),
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    priority: "high",
    isRead: false,
    actions: generateActions(linkedDocuments),
  };
}

export function getDocumentWord(count: number): string {
  if (count === 1) return "документ";
  if (count >= 2 && count <= 4) return "документи";
  return "документів";
}

function generateActions(documents: Document[]): ContractorOnboardedAction[] {
  const actions: ContractorOnboardedAction[] = [];
  
  // Add action for each document (max 3)
  documents.slice(0, 3).forEach(doc => {
    actions.push({
      label: `Надіслати ${doc.number || doc.type}`,
      action: "send-document",
      documentId: doc.id,
    });
  });
  
  // If more than 3 documents, add a generic "view all" action
  if (documents.length > 3) {
    actions.push({
      label: `Переглянути всі (${documents.length})`,
      action: "view-contractor",
    });
  }
  
  return actions;
}

/**
 * Pending contractor info stored with document
 */
export interface PendingContractorInfo {
  id: string;
  name: string;
  email: string;
  inviteId?: string;
}

/**
 * Check if document is waiting for contractor onboarding
 */
export function isDocumentPendingContractor(document: Document): boolean {
  return document.status === "draft-pending-contractor";
}

/**
 * Get list of documents pending a specific contractor
 */
export function getDocumentsPendingContractor(
  documents: Document[],
  contractorId: string
): Document[] {
  return documents.filter(
    doc => doc.status === "draft-pending-contractor" && 
           (doc as any).pendingContractorId === contractorId
  );
}

/**
 * Simulate contractor onboarding completion
 * For demo purposes - triggers custom event
 */
export function simulateContractorOnboarding(
  contractorId: string,
  contractorEmail: string,
  delayMs: number = 30000
): void {
  if (typeof window === "undefined") return;
  
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("contractor-onboarded", {
        detail: {
          contractorId,
          email: contractorEmail,
          onboardedAt: new Date().toISOString(),
        },
      })
    );
  }, delayMs);
}

/**
 * Listen for contractor onboarding events
 */
export function onContractorOnboarded(
  callback: (detail: { contractorId: string; email: string; onboardedAt: string }) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail);
  };
  
  window.addEventListener("contractor-onboarded", handler);
  
  return () => {
    window.removeEventListener("contractor-onboarded", handler);
  };
}
