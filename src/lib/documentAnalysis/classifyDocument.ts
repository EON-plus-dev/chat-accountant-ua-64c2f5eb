// ============================================
// AUTOMATIC DOCUMENT CLASSIFICATION
// AI-based classification with fallback rules
// ============================================

import type { Document, DocumentFlowStatus } from "@/config/documentFlowConfig";
import type {
  DocumentClassification,
  DocumentCategory,
  LegalWeight,
  EvidentiaryValue,
  ProceduralRole,
} from "@/types/documentClassification";
import {
  documentTypeToCategory,
  documentTypeToLegalWeight,
  generateAutoTags,
} from "@/types/documentClassification";

// ============================================
// STATUS TO PROCEDURAL ROLE MAPPING
// ============================================

const statusToProceduralRole: Record<DocumentFlowStatus, ProceduralRole> = {
  draft: "initiating",
  "draft-pending-contractor": "initiating",
  "needs-clarification": "initiating",
  "in-review": "initiating",
  "pending-sign": "initiating",
  signed: "initiating",
  sent: "initiating",
  confirmed: "confirming",
  "partially-paid": "confirming",
  paid: "confirming",
  registered: "confirming",
  archived: "archival",
  cancelled: "terminating",
  disputed: "terminating",
  "discrepancy-pending": "terminating",
};

// ============================================
// EVIDENTIARY VALUE DETERMINATION
// ============================================

const determineEvidentiaryValue = (doc: Document): EvidentiaryValue => {
  // Check for digital signatures
  const hasSignatures = doc.status !== "draft" && doc.status !== "pending-sign";
  const isRegistered = doc.status === "registered";
  
  // Original: signed documents or registered tax invoices
  if (isRegistered || (hasSignatures && doc.type === "tax-invoice")) {
    return "original";
  }
  
  // Certified copy: signed but not registered
  if (hasSignatures) {
    return "certified-copy";
  }
  
  // Draft or unsigned = copy
  if (doc.status === "draft" || doc.status === "pending-sign") {
    return "copy";
  }
  
  return "copy";
};

// ============================================
// PROCEDURAL ROLE DETERMINATION
// ============================================

const determineProceduralRole = (doc: Document): ProceduralRole => {
  // Check if document has linked documents that supersede it
  if (doc.linkedDocuments?.some(id => id.includes("amend"))) {
    return "amending";
  }
  
  // Cancelled documents terminate relationships
  if (doc.status === "cancelled") {
    return "terminating";
  }
  
  // Archived documents
  if (doc.status === "archived") {
    return "archival";
  }
  
  // Acts confirm service/goods delivery
  if (doc.type === "act" || doc.type === "reconciliation") {
    return "confirming";
  }
  
  // Default based on status
  return statusToProceduralRole[doc.status] || "initiating";
};

// ============================================
// CONFIDENTIALITY LEVEL
// ============================================

const determineConfidentiality = (
  doc: Document
): "public" | "internal" | "confidential" | "restricted" => {
  // HR documents are always restricted
  if (["employment-order", "vacation-order", "dismissal-order"].includes(doc.type)) {
    return "restricted";
  }
  
  // Financial documents with large amounts
  if (doc.amount && doc.amount >= 1000000) {
    return "confidential";
  }
  
  // Contracts are typically confidential
  if (["contract", "supply-contract", "rental-agreement", "fop-service-contract"].includes(doc.type)) {
    return "confidential";
  }
  
  // Default internal
  return "internal";
};

// ============================================
// SENSITIVITY MARKERS
// ============================================

const determineSensitivityMarkers = (doc: Document): string[] => {
  const markers: string[] = [];
  
  // Personal data markers
  if (["employment-order", "vacation-order", "dismissal-order", "power-of-attorney"].includes(doc.type)) {
    markers.push("personal-data");
  }
  
  // Financial markers
  if (doc.amount && doc.amount >= 100000) {
    markers.push("high-value");
  }
  
  // Legal markers
  if (["contract", "supply-contract", "rental-agreement"].includes(doc.type)) {
    markers.push("legally-binding");
  }
  
  // Tax markers
  if (doc.type === "tax-invoice" || doc.type === "prro-receipt") {
    markers.push("tax-relevant");
  }
  
  return markers;
};

// ============================================
// MAIN CLASSIFICATION FUNCTION
// ============================================

export const classifyDocument = (doc: Document): DocumentClassification => {
  const category: DocumentCategory = documentTypeToCategory[doc.type] || "operational";
  const legalWeight: LegalWeight = documentTypeToLegalWeight[doc.type] || "secondary";
  const evidentiaryValue = determineEvidentiaryValue(doc);
  const proceduralRole = determineProceduralRole(doc);
  
  // Get contractor name from document
  const contractorName = doc.contractor?.name;
  
  // Get period string
  const periodStr = doc.period?.label || 
    (doc.date ? new Date(doc.date).toLocaleDateString("uk-UA", { month: "long", year: "numeric" }) : undefined);
  
  // Generate auto-tags
  const autoTags = generateAutoTags(doc.type, doc.amount, contractorName, periodStr);
  
  return {
    category,
    legalWeight,
    evidentiaryValue,
    proceduralRole,
    
    confidentialityLevel: determineConfidentiality(doc),
    sensitivityMarkers: determineSensitivityMarkers(doc),
    
    autoTags,
    customTags: [],
    
    // These would typically come from user input or organizational defaults
    department: undefined,
    project: undefined,
    costCenter: undefined,
    
    externalIds: undefined,
  };
};

// ============================================
// BATCH CLASSIFICATION
// ============================================

export const classifyDocuments = (
  docs: Document[]
): Map<string, DocumentClassification> => {
  const classifications = new Map<string, DocumentClassification>();
  
  for (const doc of docs) {
    classifications.set(doc.id, classifyDocument(doc));
  }
  
  return classifications;
};

// ============================================
// CLASSIFICATION SCORE
// ============================================

export interface ClassificationScore {
  completeness: number;      // 0-100: How complete is the classification
  confidence: number;        // 0-100: How confident is the auto-classification
  requiresReview: boolean;   // True if manual review recommended
  reviewReasons: string[];   // Reasons for required review
}

export const getClassificationScore = (
  classification: DocumentClassification
): ClassificationScore => {
  let completeness = 0;
  let confidence = 80; // Base confidence for auto-classification
  const reviewReasons: string[] = [];
  
  // Completeness calculation
  if (classification.category) completeness += 20;
  if (classification.legalWeight) completeness += 20;
  if (classification.evidentiaryValue) completeness += 20;
  if (classification.proceduralRole) completeness += 20;
  if (classification.autoTags.length > 0) completeness += 10;
  if (classification.department) completeness += 5;
  if (classification.project) completeness += 5;
  
  // Confidence adjustments
  if (classification.sensitivityMarkers?.includes("high-value")) {
    confidence -= 10;
    reviewReasons.push("Документ з високою сумою потребує перевірки");
  }
  
  if (classification.confidentialityLevel === "restricted") {
    confidence -= 5;
    reviewReasons.push("Конфіденційний документ потребує ручної класифікації");
  }
  
  // Missing manual fields reduce completeness
  if (!classification.customTags || classification.customTags.length === 0) {
    completeness -= 5;
  }
  
  return {
    completeness: Math.max(0, Math.min(100, completeness)),
    confidence: Math.max(0, Math.min(100, confidence)),
    requiresReview: confidence < 70 || reviewReasons.length > 0,
    reviewReasons,
  };
};

// ============================================
// CLASSIFICATION UPDATE
// ============================================

export const updateClassification = (
  current: DocumentClassification,
  updates: Partial<DocumentClassification>
): DocumentClassification => {
  return {
    ...current,
    ...updates,
    // Merge tags instead of replacing
    customTags: updates.customTags 
      ? [...new Set([...(current.customTags || []), ...updates.customTags])]
      : current.customTags,
    // Merge external IDs
    externalIds: updates.externalIds
      ? { ...current.externalIds, ...updates.externalIds }
      : current.externalIds,
  };
};
