/**
 * DocumentLifecycleTab — Об'єднана вкладка "Життя документа"
 * 
 * Містить 3 підрозділи:
 * - Історія (хронологія + версії)
 * - Зв'язки (документи, модулі, інтеграції)
 * - Тех ID (технічні дані для підтримки)
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { History, Link2, Settings, Clock, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sections
import { LifecycleHistorySection } from "./lifecycle/LifecycleHistorySection";
import { LifecycleConnectionsSection } from "./lifecycle/LifecycleConnectionsSection";
import { LifecycleTechIdSection } from "./lifecycle/LifecycleTechIdSection";

import { getVersionsForDocument, type DocumentVersion } from "@/config/documentVersioningConfig";
import type { 
  Document as FlowDocument,
  ExternalIntegration,
  InternalLink,
  AutomationRule,
  TechnicalData,
  InternalModule
} from "@/config/documentFlowConfig";
import type { CabinetType, Cabinet } from "@/types/cabinet";
import type { SignatureVerification } from "@/types/documentAuthenticity";

// ============================================
// TYPES
// ============================================

type LifecycleSection = "history" | "connections" | "techid";

interface LifecycleSectionConfig {
  id: LifecycleSection;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const lifecycleSections: LifecycleSectionConfig[] = [
  { id: "history", label: "Історія", shortLabel: "Істор.", icon: History },
  { id: "connections", label: "Зв'язки", shortLabel: "Зв'яз.", icon: Link2 },
  { id: "techid", label: "ID документа", shortLabel: "ID", icon: Settings },
];

interface DocumentLifecycleTabProps {
  document: FlowDocument;
  cabinet: Cabinet;
  cabinetType: CabinetType;
  fopGroup?: 1 | 2 | 3;
  yearlyIncome?: number;
  linkedDocumentsResolved?: FlowDocument[];
  signatures?: SignatureVerification[];
  // Navigation callbacks
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToAudit?: (auditId: string) => void;
  // History callbacks
  onRestoreVersion?: (versionId: string, version: DocumentVersion) => void;
  onViewVersion?: (versionId: string) => void;
  onCompareVersions?: (left: DocumentVersion, right: DocumentVersion) => void;
  onExportAudit?: () => void;
  // Initial section for deep-linking
  initialSection?: LifecycleSection;
  className?: string;
}

// Demo data generators (moved from DocumentIntegrationTab)
const getDemoExternalIntegrations = (doc: FlowDocument): ExternalIntegration[] => {
  const integrations: ExternalIntegration[] = [];
  
  if (doc.sourceSystem === "medoc" || doc.source === "edo") {
    integrations.push({
      system: "medoc",
      integrationType: "edo",
      status: "received",
      lastSyncAt: doc.createdAt,
      externalId: `EDO-${doc.id.substring(0, 8)}`,
      actions: ["refresh", "open_external"],
    });
  }
  
  if (doc.type === "tax-invoice") {
    integrations.push({
      system: "erpn",
      integrationType: "tax",
      status: doc.taxInvoiceNumber ? "registered" : "queued",
      lastSyncAt: doc.updatedAt,
      externalId: doc.taxInvoiceNumber,
      actions: ["refresh", "open_external"],
    });
  }
  
  integrations.push({
    system: "tax_cabinet",
    integrationType: "tax",
    status: "not_connected",
    actions: ["configure"],
  });
  
  if (doc.linkedPayments && doc.linkedPayments.length > 0) {
    integrations.push({
      system: "monobank",
      integrationType: "bank",
      status: "processed",
      lastSyncAt: doc.updatedAt,
      actions: ["refresh"],
    });
  }
  
  return integrations;
};

const getDemoInternalLinks = (doc: FlowDocument, cabinetType: CabinetType): InternalLink[] => {
  const links: InternalLink[] = [];
  
  if (cabinetType === "fop" && doc.amount && doc.status !== "draft") {
    links.push({
      module: "incomeBook",
      linkType: "creates_operation",
      linkedEntity: {
        type: "incomeRecord",
        id: `ib-${doc.id}`,
        label: `Запис за ${new Date(doc.date).toLocaleDateString("uk-UA", { month: "long", year: "numeric" })} · ${doc.amount?.toLocaleString("uk-UA")} ₴`,
        status: "posted",
      },
    });
  }
  
  if (doc.hasAccountingImpact) {
    links.push({
      module: "operations",
      linkType: "basis_for",
      linkedEntity: {
        type: "operation",
        id: `op-${doc.id}`,
        label: `Операція №OP-${new Date(doc.date).getFullYear()}-${doc.id.substring(0, 5)}`,
        status: "posted",
      },
    });
  }
  
  if (doc.taxDeclarations && doc.taxDeclarations.length > 0) {
    links.push({
      module: "reports",
      linkType: "included_in_report",
      linkedEntity: {
        type: "declaration",
        id: doc.taxDeclarations[0].declarationId,
        label: `Декларація ЄП за ${doc.taxDeclarations[0].period}`,
        status: "draft",
      },
    });
  }
  
  if (doc.auditPackages && doc.auditPackages.length > 0) {
    doc.auditPackages.forEach(pkg => {
      links.push({
        module: "auditPackages",
        linkType: "included_in_package",
        linkedEntity: {
          type: "package",
          id: pkg.auditId,
          label: `Пакет перевірки (${pkg.packageType === 'request' ? 'запит' : pkg.packageType === 'response' ? 'відповідь' : 'підтвердження'})`,
          status: "active",
        },
      });
    });
  }
  
  return links;
};

const getDemoAutomationRules = (doc: FlowDocument): AutomationRule[] => {
  const rules: AutomationRule[] = [];
  
  if (doc.hasAccountingImpact) {
    rules.push({
      ruleName: "Автоматичне створення запису в Книзі доходів",
      triggerType: "on_create",
      lastRunAt: doc.createdAt,
      lastResult: "success",
      actionsSummary: "Створено 1 запис у Книзі доходів",
    });
  }
  
  if (doc.type === "contract" && doc.aiRisks && doc.aiRisks.length > 0) {
    rules.push({
      ruleName: "AI-перевірка ризиків договору",
      triggerType: "on_create",
      lastRunAt: doc.createdAt,
      lastResult: doc.aiRisks.length > 0 ? "warning" : "success",
      actionsSummary: `Знайдено ${doc.aiRisks.length} потенційних ризиків`,
    });
  }
  
  if (doc.type === "contract" && doc.dueDate) {
    rules.push({
      ruleName: "Нагадування про закінчення договору",
      triggerType: "scheduled",
      scheduledAt: doc.dueDate,
      lastResult: "scheduled",
    });
  }
  
  return rules;
};

const getDemoTechnicalData = (doc: FlowDocument): TechnicalData => ({
  internalId: doc.id,
  externalDocumentId: doc.sourceReference || undefined,
  externalMessageId: doc.source === "edo" ? `MSG-${doc.id.substring(0, 12)}` : undefined,
  contentHash: `${doc.id.substring(0, 8)}...${doc.id.substring(doc.id.length - 8)}`,
  storageLocation: `s3://ai-buh/documents/${new Date(doc.date).getFullYear()}/${doc.id}`,
  lastSyncJobId: doc.sourceSystem ? `JOB-${Date.now().toString(36)}` : undefined,
});

// ============================================
// MAIN COMPONENT
// ============================================

export const DocumentLifecycleTab = ({
  document,
  cabinet,
  cabinetType,
  linkedDocumentsResolved,
  signatures,
  onNavigateToDocument,
  onNavigateToIncomeBook,
  onNavigateToPayments,
  onNavigateToReports,
  onRestoreVersion,
  onViewVersion,
  onCompareVersions,
  onExportAudit,
  initialSection = "history",
  className,
}: DocumentLifecycleTabProps) => {
  const [activeSection, setActiveSection] = useState<LifecycleSection>(initialSection);
  
  // Sync with initialSection when it changes (for deep-linking)
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Get data (use document fields or generate demo)
  const externalIntegrations = document.externalIntegrations || getDemoExternalIntegrations(document);
  const internalLinks = document.internalLinks || getDemoInternalLinks(document, cabinetType);
  const automationRules = document.automationRules || getDemoAutomationRules(document);
  const technicalData = document.technicalData || getDemoTechnicalData(document);
  
  // Determine source info
  const sourceType = document.sourceType || 
    (document.source === "edo" || document.source === "external" ? "EXTERNAL_INTEGRATION" : 
     document.source === "generated" ? "GENERATED" : "UPLOAD");
  
  const sourceChannel = document.sourceChannel || 
    (document.sourceSystem ? 
      { medoc: "M.E.Doc", vchasno: "Vchasno", "1c": "1С", email: "Email" }[document.sourceSystem] 
      : undefined);
  
  const direction = document.direction || 
    (document.source === "edo" || document.source === "external" ? "incoming" : "outgoing");

  // Handle module navigation
  const handleNavigateToModule = useCallback((module: InternalModule, entityId: string) => {
    switch (module) {
      case "incomeBook":
        onNavigateToIncomeBook?.();
        break;
      case "payments":
        onNavigateToPayments?.();
        break;
      case "reports":
        onNavigateToReports?.();
        break;
      default:
        toast({
          title: "Навігація",
          description: `Перехід до модуля ${module} (демо)`,
        });
    }
  }, [onNavigateToIncomeBook, onNavigateToPayments, onNavigateToReports]);

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Segmented Control / Internal tabs */}
      <div className="shrink-0 pb-3">
        <div 
          className="inline-flex items-center gap-0.5 p-0.5 bg-muted rounded-lg"
          role="tablist"
          aria-label="Підрозділи життя документа"
        >
          {lifecycleSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 h-8 rounded-md text-sm font-medium",
                  "transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                  isActive
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50 active:scale-[0.98]"
                )}
              >
                <Icon className={cn(
                  "shrink-0 w-4 h-4 xs:w-3.5 xs:h-3.5",
                  isActive && "text-primary"
                )} />
                {/* Desktop: full label */}
                <span className="hidden sm:inline">{section.label}</span>
                {/* Tablet (xs-sm): short label */}
                <span className="hidden xs:inline sm:hidden">{section.shortLabel}</span>
                {/* Mobile (<xs): icons only, sr-only for accessibility */}
                <span className="sr-only xs:hidden">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <div className="flex-1 min-h-0">
        {activeSection === "history" && (
          <LifecycleHistorySection
            document={document}
            history={document.history}
            automationRules={automationRules}
            externalIntegrations={externalIntegrations}
            internalLinks={internalLinks}
            versions={getVersionsForDocument(document.id)}
            currentVersion={document.version}
            onRestoreVersion={onRestoreVersion}
            onViewVersion={onViewVersion}
            onCompareVersions={onCompareVersions}
            onExportAudit={onExportAudit}
          />
        )}
        
        {activeSection === "connections" && (
          <LifecycleConnectionsSection
            document={document}
            cabinet={cabinet}
            cabinetType={cabinetType}
            linkedDocumentsResolved={linkedDocumentsResolved}
            externalIntegrations={externalIntegrations}
            internalLinks={internalLinks}
            sourceType={sourceType}
            sourceChannel={sourceChannel}
            direction={direction}
            onNavigateToDocument={onNavigateToDocument}
            onNavigateToModule={handleNavigateToModule}
          />
        )}
        
        {activeSection === "techid" && (
          <LifecycleTechIdSection
            document={document}
            technicalData={technicalData}
            externalIntegrations={externalIntegrations}
            signatures={signatures}
          />
        )}
      </div>
    </div>
  );
};
