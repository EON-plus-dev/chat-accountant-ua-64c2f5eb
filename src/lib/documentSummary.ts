import {
  type Document,
  type DocumentFlowStatus,
  type DocumentIssueType,
  detectDocumentIssues,
  documentIssueTypeConfig,
} from "@/config/documentFlowConfig";

// Unified document summary type
export interface DocumentSummary {
  totalCount: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  statusCounts: Record<DocumentFlowStatus, number>;
  documentsWithIssues: number;
  signedCount: number;
  pendingCount: number;
  completedCount: number;
  issuesByType: Partial<Record<DocumentIssueType, number>>;
  qualityPercent: number;
}

// Calculate unified summary for documents
export const calculateDocumentSummary = (documents: Document[]): DocumentSummary => {
  const totalAmount = documents.reduce((sum, doc) => sum + (doc.amount || 0), 0);
  const paidAmount = documents.reduce((sum, doc) => sum + (doc.paidAmount || 0), 0);
  
  const statusCounts: Record<DocumentFlowStatus, number> = {
    draft: 0,
    "draft-pending-contractor": 0,
    "needs-clarification": 0,
    "in-review": 0,
    "pending-sign": 0,
    signed: 0,
    sent: 0,
    confirmed: 0,
    "partially-paid": 0,
    paid: 0,
    registered: 0,
    archived: 0,
    cancelled: 0,
    disputed: 0,
    "discrepancy-pending": 0,
  };
  
  const issuesByType: Partial<Record<DocumentIssueType, number>> = {};
  let documentsWithIssues = 0;
  
  documents.forEach(doc => {
    statusCounts[doc.status]++;
    
    const issues = detectDocumentIssues(doc);
    if (issues.length > 0) {
      documentsWithIssues++;
      issues.forEach(issue => {
        issuesByType[issue] = (issuesByType[issue] || 0) + 1;
      });
    }
  });
  
  const qualityPercent = documents.length > 0 
    ? Math.round(((documents.length - documentsWithIssues) / documents.length) * 100)
    : 100;
  
  return {
    totalCount: documents.length,
    totalAmount,
    paidAmount,
    unpaidAmount: totalAmount - paidAmount,
    statusCounts,
    documentsWithIssues,
    issuesByType,
    qualityPercent,
    signedCount: statusCounts.signed + statusCounts.sent + statusCounts.confirmed + statusCounts.paid + statusCounts["partially-paid"] + statusCounts.registered,
    pendingCount: statusCounts.draft + statusCounts["pending-sign"],
    completedCount: statusCounts.paid + statusCounts.archived,
  };
};

// Get sorted issues by priority
export const getSortedIssues = (issuesByType: Partial<Record<DocumentIssueType, number>>) => {
  return Object.entries(issuesByType)
    .map(([type, count]) => ({
      type: type as DocumentIssueType,
      count: count || 0,
      config: documentIssueTypeConfig[type as DocumentIssueType],
    }))
    .filter(i => i.count > 0)
    .sort((a, b) => a.config.priority - b.config.priority);
};

// Format currency amount
export const formatAmount = (amount: number, currency: string = "UAH"): string => {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
