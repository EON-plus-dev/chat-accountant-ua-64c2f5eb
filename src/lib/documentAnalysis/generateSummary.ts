import type { DocumentSummary, ExtendedAnalysisResult, DocumentCategoryType } from "@/types/documentSummary";
import { getDemoScenarioById } from "@/config/documentSummaryDemo";
import { documentTypeConfigs, type DocumentType } from "@/config/documentFlowConfig";

/**
 * Calculate retention deadline from document date and retention years
 */
const calculateRetentionDeadline = (documentDate: string, years: number): string => {
  const date = new Date(documentDate);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split("T")[0];
};

/**
 * Get document category from document type
 */
const getDocumentCategory = (documentType: DocumentType): DocumentCategoryType => {
  const config = documentTypeConfigs[documentType];
  return (config?.category as DocumentCategoryType) || "primary";
};

/**
 * Generate document summary from demo scenario or file analysis
 */
export const generateDocumentSummary = (
  scenarioId?: string,
  _file?: File
): DocumentSummary | null => {
  // If demo scenario provided, use it
  if (scenarioId) {
    const scenario = getDemoScenarioById(scenarioId);
    if (scenario) {
      return scenario.summary;
    }
  }
  
  // In real implementation, this would call AI service
  // For now, return null for non-demo files
  return null;
};

/**
 * Convert demo scenario to ExtendedAnalysisResult format
 * for backward compatibility with existing UploadDocumentContent
 */
export const scenarioToAnalysisResult = (scenarioId: string): ExtendedAnalysisResult | null => {
  const scenario = getDemoScenarioById(scenarioId);
  if (!scenario) return null;
  
  const summary = scenario.summary;
  const documentType = summary.documentType as DocumentType;
  const typeConfig = documentTypeConfigs[documentType];
  
  // Find supplier and buyer from parties
  const supplier = summary.parties.find(p => 
    ["supplier", "executor", "lessor"].includes(p.role)
  );
  const buyer = summary.parties.find(p => 
    ["buyer", "client", "lessee"].includes(p.role)
  );
  
  // Find valid-until date
  const validUntil = summary.keyDates.find(d => d.type === "valid-until")?.date;
  
  // Calculate suggested number
  const suggestedNumber = `${summary.documentType.toUpperCase().slice(0, 3)}-2025-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
  
  // Calculate registration data
  const documentDate = summary.keyDates.find(d => d.type === "document")?.date || new Date().toISOString().split("T")[0];
  const retentionYears = typeConfig?.retentionYears || 3;
  const retentionDeadline = calculateRetentionDeadline(documentDate, retentionYears);
  const category = getDocumentCategory(documentType);
  
  return {
    documentType,
    suggestedNumber,
    suggestedDate: documentDate,
    contractor: supplier ? { name: supplier.name, code: supplier.code } : undefined,
    amount: summary.financials?.amount,
    summary: summary.shortSummary,
    confidence: summary.confidence,
    parties: supplier && buyer ? {
      supplier: supplier.name,
      supplierCode: supplier.code,
      buyer: buyer.name,
      buyerCode: buyer.code,
    } : undefined,
    keyTerms: summary.keyTerms,
    subject: "contract" in summary ? (summary as any).contract.subject : undefined,
    currency: summary.financials?.currency,
    validUntil,
    dihSummary: summary,
    checklist: scenario.checklist,
    demoScenarioId: scenario.id,
    // Registration data
    registration: {
      number: suggestedNumber,
      category,
      retentionYears,
      retentionDeadline,
      registeredAt: new Date().toISOString(),
      humanVerified: false,
    },
  };
};
