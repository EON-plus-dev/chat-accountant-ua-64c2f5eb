import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { RiskScoreBadge, calculateRiskScore } from "./RiskScoreBadge";
import { extractRegulatoryStatus } from "./RegulatoryBadges";
import { 
  Sparkles, AlertTriangle, CheckCircle2, 
  FileCheck, Building2, Settings2, Paperclip, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { 
  DocumentSummary, 
  ContractSummary,
  DocumentChecklist,
  ChecklistItem,
  FieldConfidence,
} from "@/types/documentSummary";
import type { Document as FlowDocument, DocumentCategory } from "@/config/documentFlowConfig";
import { documentTypeConfigs } from "@/config/documentFlowConfig";
import { 
  resolveProlongation, 
  type ProlongationPolicy,
  type ProlongationSource,
  type ResolvedProlongation,
} from "@/config/settingsConfig";

// Import NEW simplified subcomponents
import {
  IntelligenceCardHeader,
  DocumentHeroSummary,
  DocumentWarningsSection,
  DocumentStatusBadge,
  DocumentTermsSection,
  DocumentRelatedSection,
  legalSectionsConfig,
  type LegalSectionsSummary,
  type AggregatedAlert,
} from "./intelligence";

// Context and logging
import { useDocumentChat } from "@/contexts/DocumentChatContext";
import { useAuditLog } from "@/lib/auditLogger";

// Lazy load heavy component for Legal Analysis tab
const LegalAnalysisSection = lazy(() => 
  import("./LegalAnalysisSection").then(m => ({ default: m.LegalAnalysisSection }))
);

// Helper function to get section status for legal clauses
const getLegalSectionStatus = (
  sectionType: string,
  contractData: ContractSummary["contract"] | null,
  docType?: string
): { status: "missing" | "warning" | "ok"; label?: string } => {
  if (!contractData) return { status: "missing" };
  
  switch (sectionType) {
    case "penalties":
      if (!contractData.penalties || contractData.penalties.length === 0) {
        return { status: "missing" };
      }
      const highPenalty = contractData.penalties.some(p => {
        const rate = parseFloat(p.rate.replace(/[^0-9.,]/g, "").replace(",", "."));
        return rate >= 0.5;
      });
      if (highPenalty) {
        return { status: "warning", label: "Підвищені штрафи" };
      }
      return { status: "ok" };

    case "termination":
      if (!contractData.termination) {
        return { status: "missing" };
      }
      if (contractData.termination.noticePeriod < 14) {
        return { status: "warning", label: "Короткий термін" };
      }
      return { status: "ok" };

    case "disputes":
      return contractData.disputes ? { status: "ok" } : { status: "missing" };

    case "forceMajeure":
      return (contractData.forceMajeure && contractData.forceMajeure.length > 0) 
        ? { status: "ok" } 
        : { status: "missing" };

    case "liability":
      return contractData.liability ? { status: "ok" } : { status: "missing" };

    case "confidentiality":
      if (!contractData.confidentiality) {
        if (docType && ["nda", "fop-service-contract"].includes(docType)) {
          return { status: "warning", label: "Рекомендовано" };
        }
        return { status: "missing" };
      }
      return { status: "ok" };

    case "governingLaw":
      return contractData.governingLaw ? { status: "ok" } : { status: "missing" };

    default:
      return { status: "ok" };
  }
};

// Aggregate all legal section statuses
const getLegalSectionsSummary = (
  contractData: ContractSummary["contract"] | null,
  docType?: string
): LegalSectionsSummary => {
  let defined = 0;
  const warnings: Array<{ section: string; label: string; key: string }> = [];
  const missing: Array<{ section: string; key: string }> = [];
  const sections: LegalSectionsSummary["sections"] = [];
  
  legalSectionsConfig.forEach(section => {
    const statusInfo = getLegalSectionStatus(section.key, contractData, docType);
    sections.push({ ...section, status: statusInfo.status, label: statusInfo.label });
    
    if (statusInfo.status === "ok") {
      defined++;
    } else if (statusInfo.status === "warning") {
      defined++;
      warnings.push({ section: section.title, label: statusInfo.label || "Увага", key: section.key });
    } else {
      missing.push({ section: section.title, key: section.key });
    }
  });
  
  return { defined, total: legalSectionsConfig.length, warnings, missing, sections };
};

interface DocumentIntelligenceCardProps {
  document?: FlowDocument;
  summary?: DocumentSummary | ContractSummary;
  isLoading?: boolean;
  operationalData?: {
    responsibleName?: string;
    period?: string;
    accountingAccount?: string;
    tags?: string[];
    internalNote?: string;
  };
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
  onNavigateToLegalTab?: () => void;
  className?: string;
}

// Skeleton component for loading state
export const DocumentIntelligenceCardSkeleton = ({ className }: { className?: string }) => (
  <Card className={cn("overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent", className)}>
    <CardHeader className="pb-2 sm:pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-1.5 w-16 rounded-full" />
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export const DocumentIntelligenceCard = ({
  document,
  summary,
  isLoading,
  operationalData,
  cabinetPolicy,
  cabinetType,
  checklist,
  onExplainSimple,
  onExplainRisks,
  onCompareTemplate,
  onNavigateToContractor,
  onNavigateToRelatedTab,
  onPrimaryAction,
  onChecklistAction,
  onChecklistItemComplete,
  onNavigateToFieldInPdf,
  onOpenSideBySide,
  onNavigateToLegalTab,
  className,
}: DocumentIntelligenceCardProps) => {
  // Context integrations
  const { sendCommand, setCurrentDocument } = useDocumentChat();
  const { logAIAnalysis, logRiskCalculation } = useAuditLog();
  
  // Show skeleton while loading
  if (isLoading) {
    return <DocumentIntelligenceCardSkeleton className={className} />;
  }
  
  if (!summary) return null;
  
  // Type guard for contract summary
  const isContractSummary = (s: DocumentSummary | ContractSummary): s is ContractSummary => {
    return 'contract' in s;
  };

  const contractData = isContractSummary(summary) ? summary.contract : null;
  const parties = summary.parties || [];
  const keyDates = summary.keyDates || [];
  const keyTerms = summary.keyTerms || [];
  const financials = summary.financials;
  const compliance = summary.compliance;
  
  const isContractType = document?.type && [
    "contract", "supply-contract", "fop-service-contract", "rental-agreement", "nda"
  ].includes(document.type);
  
  // Get legal analysis data
  const legalSummary = isContractType ? getLegalSectionsSummary(contractData, document?.type) : null;
  
  // Format analysis timestamp
  const analysisTime = summary.analysis?.processedAt 
    ? format(new Date(summary.analysis.processedAt), "HH:mm", { locale: uk })
    : format(new Date(), "HH:mm", { locale: uk });
  
  // Get parties for display
  const supplier = parties.find(p => 
    ["supplier", "executor", "lessor", "seller"].includes(p.role)
  );
  const buyer = parties.find(p => 
    ["buyer", "client", "lessee", "principal"].includes(p.role)
  );
  
  // Get validity date
  const validityDate = keyDates.find(d => 
    d.type === "valid-until" || 
    d.type === "due" ||
    d.label.toLowerCase().includes("закінч") || 
    d.label.toLowerCase().includes("дійсн")
  );

  // Find contract end date for prolongation
  const contractEndDate = keyDates.find(d => 
    d.type === "valid-until" || 
    d.type === "due" ||
    d.label.toLowerCase().includes("закінч") || 
    d.label.toLowerCase().includes("дійсн") ||
    d.label.toLowerCase().includes("end")
  )?.date;

  // Get extracted prolongation from contract data
  const extractedProlongation = contractData?.prolongation ? {
    type: contractData.prolongation.type || undefined,
    noticePeriod: contractData.prolongation.noticePeriod,
  } : undefined;

  // Resolve with priority: document > policy > system
  const resolvedProlongation = isContractType 
    ? resolveProlongation(extractedProlongation, cabinetPolicy, contractEndDate) 
    : null;
  
  // Checklist progress
  const pendingItems = checklist?.items.filter(i => i.status !== "done") || [];
  const completedItems = checklist?.items.filter(i => i.status === "done") || [];
  const hasChecklist = checklist && checklist.totalItems > 0;
  const isAllComplete = hasChecklist && checklist.completionPercent === 100;

  // Calculate risk score for contracts
  const riskResult = useMemo(() => {
    if (!isContractType) return null;
    return calculateRiskScore(document, contractData, parties, compliance?.warnings);
  }, [isContractType, document, contractData, parties, compliance?.warnings]);

  // Extract registration data from document or calculate from document type
  const registrationData = useMemo(() => {
    if (document?.number && document?.type) {
      const typeConfig = documentTypeConfigs[document.type];
      return {
        number: document.number,
        category: (typeConfig?.category || "primary") as DocumentCategory,
        retentionYears: document.retentionPeriod || typeConfig?.retentionYears || 3,
        retentionDeadline: document.retentionDeadline,
        humanVerified: document.humanVerified || false,
      };
    }
    return null;
  }, [document]);

  // Check if contract is expired
  const isExpired = validityDate?.daysUntil !== undefined && validityDate.daysUntil < 0;
  
  // Determine card border color based on state
  const getCardStyles = () => {
    const hasCritical = pendingItems.some(i => i.priority === "critical");
    if (hasCritical || (riskResult && riskResult.level === "critical")) {
      return "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20";
    }
    if (isAllComplete && (!riskResult || riskResult.level === "low")) {
      return "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20";
    }
    if ((legalSummary?.warnings && legalSummary.warnings.length > 0) || (riskResult && riskResult.level === "high") || isExpired) {
      return "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20";
    }
    return "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent";
  };
  
  // Set document context for chat integration
  useEffect(() => {
    if (summary && document) {
      setCurrentDocument({
        documentId: document.id,
        documentType: document.type,
        documentNumber: document.number,
        summary: summary.shortSummary,
        riskLevel: riskResult?.level,
        parties: parties.map(p => ({ name: p.name, code: p.code, role: p.role })),
        amount: financials?.amount,
        currency: financials?.currency,
      });
      
      // Log AI analysis
      logAIAnalysis(document.id, {
        confidence: summary.confidence,
        fieldsExtracted: summary.fieldConfidences?.length || 0,
        hasWarnings: (compliance?.warnings?.length || 0) > 0,
      });
    }
    
    return () => {
      setCurrentDocument(null);
    };
  }, [document?.id, summary?.shortSummary]);
  
  // Log risk calculation
  useEffect(() => {
    if (riskResult && document) {
      logRiskCalculation(document.id, {
        score: riskResult.score,
        level: riskResult.level,
        factors: riskResult.factors.map(f => f.name),
      });
    }
  }, [riskResult?.score, document?.id]);

  // Handle ask AI action
  const handleAskAI = () => {
    if (document) {
      sendCommand({ type: 'explain_simple', documentId: document.id });
    }
    onExplainSimple?.();
  };

  // Check if there are fields needing review
  // For signed/sent/confirmed/archived documents, verification is complete
  const isVerificationComplete = ['signed', 'sent', 'confirmed', 'archived'].includes(document?.status || '');
  const hasFieldsToReview = !isVerificationComplete && 
    (summary.fieldConfidences?.filter(f => f.needsReview || f.confidence < 80).length || 0) > 0;

  // Get referenced documents (mentioned in text)
  const referencedDocs = isContractSummary(summary) && summary.contract?.referencedDocuments
    ? summary.contract.referencedDocuments
    : [];

  // Signature data for status badge (mock - would come from props in real app)
  const signaturesData = {
    count: document?.status === "signed" ? 2 : document?.status === "pending-sign" ? 1 : 0,
    required: 2,
    signatures: document?.status === "signed" ? [
      { name: supplier?.name || "Постачальник", position: "Директор", date: new Date().toISOString(), isValid: true },
      { name: buyer?.name || "Замовник", date: new Date().toISOString(), isValid: true },
    ] : [],
    isIntegrityVerified: document?.status === "signed" || document?.status === "sent",
  };
  
  return (
    <Card id="intelligence-card" className={cn("overflow-hidden", getCardStyles(), className)}>
      {/* SECTION 1: Header with Progress and Actions */}
      <IntelligenceCardHeader
        analysisTime={analysisTime}
        checklist={hasChecklist ? {
          totalItems: checklist!.totalItems,
          completedItems: checklist!.completedItems,
          completionPercent: checklist!.completionPercent,
        } : null}
        isComplete={isAllComplete}
        onAskAI={handleAskAI}
        onOpenSideBySide={onOpenSideBySide}
        hasFieldsToReview={hasFieldsToReview}
      />
      
      <CardContent className="space-y-4 pt-0">
        {/* SECTION 1: Hero Summary (Compact) */}
        <DocumentHeroSummary
          shortSummary={summary.shortSummary}
          amount={financials?.amount}
          currency={financials?.currency}
          supplier={supplier}
          buyer={buyer}
          validityDate={validityDate}
          isExpired={isExpired}
          riskLevel={riskResult?.level}
          documentStatus={document?.status}
          // Registration data
          documentNumber={registrationData?.number}
          documentCategory={registrationData?.category}
          retentionYears={registrationData?.retentionYears}
          retentionDeadline={registrationData?.retentionDeadline}
          humanVerified={registrationData?.humanVerified}
        />

        {/* SECTION 2: Warnings (only if there are issues) - legalSummary removed to avoid duplication with DocumentOverviewTab */}
        <DocumentWarningsSection
          warnings={[]}
          riskResult={riskResult}
          onNavigateToLegalTab={onNavigateToLegalTab}
        />

        {/* SECTION 3: Legal Status Badge - Moved to DocumentOverviewTab for single source of truth */}

        {/* SECTION 4: Terms (Compact - terms + prolongation combined) */}
        {isContractType && (
          <DocumentTermsSection
            keyTerms={keyTerms}
            prolongation={resolvedProlongation}
          />
        )}

        {/* SECTION 5: Related Documents (if referenced in text) */}
        {referencedDocs.length > 0 && (
          <DocumentRelatedSection
            referencedDocuments={referencedDocs}
          />
        )}
      </CardContent>
    </Card>
  );
};
