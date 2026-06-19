import { useState } from "react";
import { 
  FileText, Paperclip, 
  Scale, ChevronDown, ChevronUp,
  Link2, ChevronRight, FileCheck,
  Truck, Banknote, Receipt, UserCheck, Users, Upload, Building2, Phone,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

import { DocumentIntelligenceCard } from "../cards";
import { ApprovalStatusSection } from "../sections/ApprovalStatusSection";
import { LegalStatusSection } from "../sections/LegalStatusSection";
import { DocumentCommentsSection } from "../sections/DocumentCommentsSection";
import { classifyDocument } from "@/lib/documentAnalysis/classifyDocument";
import type { SignatureVerification, IntegrityCheck } from "@/types/documentAuthenticity";
import { generateDemoSignature, generateDemoIntegrity } from "@/types/documentAuthenticity";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { 
  DocumentSummary, 
  ContractSummary, 
  DocumentChecklist,
  ChecklistItem,
} from "@/types/documentSummary";
import { type Document as FlowDocument, documentTypeConfigs, documentStatusConfigs } from "@/config/documentFlowConfig";
import { type ApprovalState, needsApprovalWorkflow } from "@/config/approvalWorkflowConfig";
import { type CabinetType } from "@/types/cabinet";
import { type ProlongationPolicy } from "@/config/settingsConfig";
import { formatCurrency } from "@/lib/formatters";
import { 
  DEMO_CURRENT_USER_ID, 
  DEMO_CURRENT_USER_NAME, 
  DEMO_CURRENT_USER_ROLE 
} from "@/config/businessStatusConfig";

// Operational data interface (shared with DocumentIntelligenceCard)
interface OperationalData {
  responsibleName?: string;
  period?: string;
  accountingAccount?: string;
  tags?: string[];
  internalNote?: string;
}

interface CollapsibleSectionProps {
  id?: string;
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ 
  id, icon, title, badge, children, defaultOpen = true 
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div id={id}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-sm">{title}</span>
            {badge}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {children}
      </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

// ============ STATUS BADGE HELPERS ============

interface ReferencedDocsStatus {
  attached: number;
  total: number;
  status: "complete" | "partial" | "empty";
}

const getReferencedDocsStatus = (
  docs: Array<{ status: string; description: string }> | undefined,
  attachedSet: Set<string> | undefined
): ReferencedDocsStatus | null => {
  if (!docs || docs.length === 0) return null;
  
  const attached = docs.filter(d => 
    d.status === "attached" || attachedSet?.has(d.description)
  ).length;
  
  const total = docs.length;
  const status = attached === total ? "complete" 
    : attached > 0 ? "partial" 
    : "empty";
  
  return { attached, total, status };
};

interface LinkedDocsStatus {
  count: number;
  hasWarnings: boolean;
  hasCritical: boolean;
}

const getLinkedDocsStatus = (
  docs: FlowDocument[] | undefined
): LinkedDocsStatus | null => {
  if (!docs || docs.length === 0) return null;
  
  const warningStatuses = ["draft", "pending-sign"];
  const criticalStatuses = ["overdue", "cancelled", "rejected"];
  
  return {
    count: docs.length,
    hasWarnings: docs.some(d => warningStatuses.includes(d.status)),
    hasCritical: docs.some(d => 
      criticalStatuses.includes(d.status) || 
      (d.dueDate && new Date(d.dueDate) < new Date())
    ),
  };
};

type RegulatoryStatus = "ok" | "warning" | "error";

interface RegulatoryStatusResult {
  status: RegulatoryStatus;
  label: string;
}

const getRegulatoryStatus = (
  compliance: DocumentSummary["compliance"] | undefined
): RegulatoryStatusResult | null => {
  if (!compliance) return null;
  
  // Critical: missing KVED or licenses
  const hasCritical = 
    (compliance.kvedMissing && compliance.kvedMissing.length > 0) ||
    (compliance.licenseMissing && compliance.licenseMissing.length > 0);
  
  // Warning: KVED doesn't match
  const hasWarning = !compliance.kvedMatch || 
    (compliance.warnings && compliance.warnings.length > 0);
  
  if (hasCritical) {
    return { status: "error", label: "Ризик" };
  }
  if (hasWarning) {
    return { status: "warning", label: "Увага" };
  }
  return { status: "ok", label: "OK" };
};

interface DocumentSummaryTabProps {
  document?: FlowDocument;
  summary?: DocumentSummary | ContractSummary;
  checklist?: DocumentChecklist;
  linkedDocumentsResolved?: FlowDocument[];
  approvalState?: ApprovalState;
  onApprove?: (comment?: string) => void;
  onReject?: (comment: string) => void;
  onRecommend?: (comment: string) => void;               // М'яке погодження
  onRequestClarification?: (comment: string) => void;    // Повернути з коментарями
  onRespondToClarification?: (comment: string) => void;  // Відповідь на запит уточнення
  onResolveComment?: (commentId: string, resolved: boolean) => void; // Вирішити коментар
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
  onUploadRelatedDocument?: (docType: string, description: string) => void;
  onNavigateToFieldInPdf?: (field: import("@/types/documentSummary").FieldConfidence) => void;
  onOpenSideBySide?: () => void;
  onSign?: () => void;
  onSend?: () => void;
  onPayment?: () => void;
  onArchive?: () => void;
  className?: string;
  cabinetPolicy?: ProlongationPolicy;
}

export const DocumentSummaryTab = ({
  document,
  summary,
  checklist,
  linkedDocumentsResolved,
  approvalState,
  onApprove,
  onReject,
  onRecommend,
  onRequestClarification,
  onRespondToClarification,
  onResolveComment,
  cabinetType,
  operationalData,
  attachedReferencedDocs,
  onChatPrompt,
  onExplainSimple,
  onExplainRisks,
  onChecklistAction,
  onChecklistItemComplete,
  onNavigateToDocument,
  onNavigateToContractor,
  onNavigateToRelatedTab,
  onUploadRelatedDocument,
  onNavigateToFieldInPdf,
  onOpenSideBySide,
  onSign,
  onSend,
  onPayment,
  onArchive,
  className,
  cabinetPolicy,
}: DocumentSummaryTabProps) => {
  // Type guard for contract summary
  const isContractSummary = (s: DocumentSummary | ContractSummary): s is ContractSummary => {
    return 'contract' in s;
  };

  const contractData = summary && isContractSummary(summary) ? summary.contract : null;
  const compliance = summary?.compliance;

  // Calculate document classification
  const classification = document ? classifyDocument(document) : undefined;

  // Demo data for legal status section
  const demoSignatures: SignatureVerification[] = document?.status !== "draft" ? [
    generateDemoSignature(
      document?.contractor?.name || "Петренко Іван Михайлович",
      "Директор",
      true
    )
  ] : [];

  const demoIntegrity: IntegrityCheck = generateDemoIntegrity(true);

  const demoErpnRegistration = document?.type === "tax-invoice" ? {
    number: document?.taxInvoiceNumber || "1234567890",
    date: document?.date || new Date().toISOString(),
    status: "registered" as const,
  } : undefined;

  const demoNotarization = document?.type === "power-of-attorney" ? {
    required: true,
    completed: document?.status !== "draft",
    notaryName: document?.status !== "draft" ? "Коваленко О.В." : undefined,
    date: document?.status !== "draft" ? document?.date : undefined,
    registryNumber: document?.status !== "draft" ? "12345" : undefined,
  } : undefined;

  // Handle primary action from Action Center
  const handlePrimaryAction = (action: "sign" | "send" | "pay" | "archive") => {
    switch (action) {
      case "sign": onSign?.(); break;
      case "send": onSend?.(); break;
      case "pay": onPayment?.(); break;
      case "archive": onArchive?.(); break;
    }
  };

  // Handle compare template action
  const handleCompareTemplate = () => {
    onChatPrompt?.(`Порівняй цей договір ${document?.number} з типовим договором цього типу`);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 1. Approval Status Section - only for TOV */}
      {cabinetType && needsApprovalWorkflow(cabinetType) && approvalState && (
        <ApprovalStatusSection
          approvalState={approvalState}
          documentId={document.id}
          currentUserId={DEMO_CURRENT_USER_ID}
          isDocumentAuthor={true} // Demo: always show as author
          onApprove={onApprove}
          onReject={onReject}
          onRecommend={onRecommend}
          onRequestClarification={onRequestClarification}
          onRespondToClarification={onRespondToClarification}
        />
      )}

      {/* 2. Unified Document Intelligence Card - summary + actions in one block */}
      <DocumentIntelligenceCard
        document={document}
        summary={summary}
        operationalData={operationalData}
        cabinetPolicy={cabinetPolicy}
        cabinetType={cabinetType}
        checklist={checklist}
        onExplainSimple={onExplainSimple}
        onExplainRisks={onExplainRisks}
        onCompareTemplate={handleCompareTemplate}
        onNavigateToContractor={onNavigateToContractor}
        onNavigateToRelatedTab={onNavigateToRelatedTab}
        onPrimaryAction={handlePrimaryAction}
        onChecklistAction={onChecklistAction}
        onChecklistItemComplete={onChecklistItemComplete}
        onNavigateToFieldInPdf={onNavigateToFieldInPdf}
        onOpenSideBySide={onOpenSideBySide}
      />

      {/* 3. Legal Status Section - for signed/sent/confirmed documents */}
      {document && document.status !== "draft" && (
        <LegalStatusSection
          document={document}
          signatures={demoSignatures}
          integrity={demoIntegrity}
          erpnRegistration={demoErpnRegistration}
          notarization={demoNotarization}
        />
      )}

      {/* 4. Type-specific sections */}
      <div className="space-y-3">
        {/* Bank Statement - Bank Details section */}
        {document?.type === "bank-statement" && (
          <CollapsibleSection
            icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
            title="Банківські реквізити"
            defaultOpen={false}
          >
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Банк:</span>
                <span className="font-medium">{(document as any).bankName || "ПриватБанк"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IBAN:</span>
                <span className="font-mono text-xs">{document.contractor?.iban || "UA21 3052 9900 0002 6001 0300 3891 4"}</span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Bank Statement - Totals section */}
        {document?.type === "bank-statement" && document?.statementTotals && (
          <CollapsibleSection
            icon={<Banknote className="w-4 h-4 text-muted-foreground" />}
            title="Підсумки виписки"
          >
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Надходження:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +{document.statementTotals.income.toLocaleString("uk-UA")} ₴
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Витрати:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -{document.statementTotals.expense.toLocaleString("uk-UA")} ₴
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Залишок на кінець:</span>
                <span className="font-medium">
                  {document.statementTotals.closingBalance.toLocaleString("uk-UA")} ₴
                </span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* PRRO Receipt - Fiscal Data section */}
        {document?.type === "prro-receipt" && (
          <CollapsibleSection
            icon={<Receipt className="w-4 h-4 text-muted-foreground" />}
            title="Фіскальні дані"
          >
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Фіскальний номер:</span>
                <span className="font-medium font-mono">{document.prroFiscalNumber || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Сума:</span>
                <span className="font-medium">{document.amount?.toLocaleString("uk-UA")} ₴</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Дата/час:</span>
                <span>{format(new Date(document.date), "dd.MM.yyyy HH:mm", { locale: uk })}</span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* HR Orders - Employee section */}
        {["employment-order", "vacation-order", "dismissal-order"].includes(document?.type || "") && 
         document?.employee && (
          <CollapsibleSection
            icon={<Users className="w-4 h-4 text-muted-foreground" />}
            title="Працівник"
          >
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ПІБ:</span>
                <span className="font-medium">{document.employee.name}</span>
              </div>
              {document.employee.position && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Посада:</span>
                  <span>{document.employee.position}</span>
                </div>
              )}
              {document.employee.department && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Підрозділ:</span>
                  <span>{document.employee.department}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Power of Attorney - Authorized Person section */}
        {document?.type === "power-of-attorney" && document?.employee && (
          <CollapsibleSection
            icon={<UserCheck className="w-4 h-4 text-muted-foreground" />}
            title="Довірена особа"
          >
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ПІБ:</span>
                <span className="font-medium">{document.employee.name}</span>
              </div>
              {document.employee.position && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Посада:</span>
                  <span>{document.employee.position}</span>
                </div>
              )}
              {document.dueDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Дійсна до:</span>
                  <span className="font-medium">{format(new Date(document.dueDate), "dd.MM.yyyy", { locale: uk })}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* TTN - Route section */}
        {document?.type === "ttn" && document?.route && (
          <CollapsibleSection
            icon={<Truck className="w-4 h-4 text-muted-foreground" />}
            title="Маршрут доставки"
          >
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Звідки:</span>
                <span>{document.route.from}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Куди:</span>
                <span>{document.route.to}</span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* TTN - Transport section (carrier, driver, vehicle) */}
        {document?.type === "ttn" && (
          <CollapsibleSection
            icon={<Truck className="w-4 h-4 text-muted-foreground" />}
            title="Транспорт"
            defaultOpen={true}
          >
            <div className="space-y-3 pl-6">
              {/* Carrier info */}
              {document.carrier && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Перевізник
                  </p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{document.carrier.name}</span>
                  </div>
                  {document.carrier.code && (
                    <p className="text-sm text-muted-foreground ml-6">
                      ЄДРПОУ: {document.carrier.code}
                    </p>
                  )}
                  {document.carrier.phone && (
                    <div className="flex items-center gap-2 ml-6">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <a 
                        href={`tel:${document.carrier.phone}`} 
                        className="text-sm text-primary hover:underline"
                      >
                        {document.carrier.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {(document.carrier && (document.driver || document.vehicle)) && (
                <Separator />
              )}

              {/* Driver & Vehicle grid */}
              {(document.driver || document.vehicle) && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Driver */}
                  {document.driver && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Водій
                      </p>
                      <p className="font-medium">{document.driver.name}</p>
                      {document.driver.license && (
                        <p className="text-sm text-muted-foreground">
                          Посв: {document.driver.license}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Vehicle */}
                  {document.vehicle && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Транспортний засіб
                      </p>
                      <p className="font-mono font-medium">{document.vehicle.number}</p>
                      {document.vehicle.type && (
                        <Badge variant="outline" className="text-xs">
                          {document.vehicle.type === "truck" ? "Вантажівка" :
                           document.vehicle.type === "van" ? "Фургон" :
                           document.vehicle.type === "car" ? "Легковий" :
                           document.vehicle.type === "trailer" ? "З причепом" :
                           document.vehicle.type}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Fallback if no transport data */}
              {!document.carrier && !document.driver && !document.vehicle && (
                <p className="text-sm text-muted-foreground italic">
                  Дані про транспорт не знайдено
                </p>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Reconciliation Results - Enhanced */}
        {document?.type === "reconciliation" && (document.reconciliationBalance || document.period) && (
          <CollapsibleSection
            icon={<Scale className="w-4 h-4 text-muted-foreground" />}
            title="Результати звірки"
          >
            <div className="space-y-3 pl-6">
              {/* Balance visualization */}
              {document.reconciliationBalance && (
                <div className={cn(
                  "p-3 rounded-lg border",
                  document.reconciliationBalance.amount === 0 
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                    : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {document.reconciliationBalance.amount === 0 
                        ? "✓ Розбіжностей не виявлено"
                        : `Сальдо: ${document.reconciliationBalance.amount.toLocaleString("uk-UA")} ₴`}
                    </span>
                    {document.reconciliationBalance.amount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {document.reconciliationBalance.inFavor === "us" ? "На нашу користь" : "На користь контрагента"}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Period */}
              {document.period?.label && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Період звірки:</span>
                  <span className="font-medium">{document.period.label}</span>
                </div>
              )}
              
              {/* Detailed breakdown when balance exists */}
              {document.reconciliationBalance && document.reconciliationBalance.amount !== 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Сума:</span>
                    <span className={cn(
                      "font-medium",
                      document.reconciliationBalance.inFavor === "us" 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {document.reconciliationBalance.inFavor === "us" ? "+" : "-"}
                      {document.reconciliationBalance.amount.toLocaleString("uk-UA")} ₴
                    </span>
                  </div>
                </>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Tax Invoice - ЄРПН Registration section */}
        {document?.type === "tax-invoice" && (
          <CollapsibleSection
            icon={<FileText className="w-4 h-4 text-muted-foreground" />}
            title="Реєстрація в ЄРПН"
          >
            <div className="space-y-3 pl-6">
              {/* Registration status card */}
              <div className={cn(
                "p-3 rounded-lg border",
                document.taxInvoiceNumber 
                  ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                  : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {document.taxInvoiceNumber 
                      ? "✓ Зареєстровано в ЄРПН"
                      : "⚠ Очікує реєстрації"}
                  </span>
                  <Badge variant={document.taxInvoiceNumber ? "default" : "secondary"}>
                    {document.taxInvoiceNumber ? "Зареєстровано" : "Не зареєстровано"}
                  </Badge>
                </div>
              </div>
              
              {/* Registration number */}
              {document.taxInvoiceNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Реєстраційний номер:</span>
                  <span className="font-medium font-mono">{document.taxInvoiceNumber}</span>
                </div>
              )}
              
              {/* VAT breakdown */}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Сума без ПДВ:</span>
                <span className="font-medium">
                  {(document.amount ? document.amount / 1.2 : 0).toLocaleString("uk-UA", { minimumFractionDigits: 2 })} ₴
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ПДВ 20%:</span>
                <span className="font-medium">
                  {(document.amount ? document.amount - document.amount / 1.2 : 0).toLocaleString("uk-UA", { minimumFractionDigits: 2 })} ₴
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Загальна сума:</span>
                <span className="font-medium">
                  {(document.amount || 0).toLocaleString("uk-UA", { minimumFractionDigits: 2 })} ₴
                </span>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Discrepancy Act - Status section */}
        {document?.type === "discrepancy-act" && (
          <CollapsibleSection
            icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
            title="Статус розгляду"
          >
            <div className="space-y-3 pl-6">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <Badge variant={
                  document.status === "signed" ? "default" :
                  document.status === "sent" ? "secondary" : "outline"
                }>
                  {document.status === "signed" ? "✓ Прийнято контрагентом" :
                   document.status === "cancelled" ? "✗ Відхилено" :
                   document.status === "sent" ? "На розгляді" : "Чернетка"}
                </Badge>
              </div>
              
              {/* Amount if exists */}
              {document.amount && document.amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Сума розбіжностей:</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {document.amount.toLocaleString("uk-UA")} ₴
                  </span>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* Referenced Documents section moved to DocumentIntelligenceCard → DocumentRelatedSection */}

      {/* 6. Regulatory Aspects - Combined Section */}
      {compliance && !["reconciliation", "bank-statement", "prro-receipt", "employment-order", "vacation-order", "dismissal-order"].includes(document?.type || "") && (() => {
        const regulatoryStatus = getRegulatoryStatus(compliance);
        if (!regulatoryStatus) return null;
        
        const isOk = regulatoryStatus.status === "ok";
        
        return (
          <CollapsibleSection
            icon={<Scale className="w-4 h-4 text-muted-foreground" />}
            title="Регуляторні аспекти"
            defaultOpen={!isOk}
            badge={
              <Badge 
                variant="status"
                className={cn(
                  "text-[10px] ml-1.5",
                  isOk 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : regulatoryStatus.status === "warning"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                )}
                aria-label={`Регуляторний статус: ${regulatoryStatus.label}`}
              >
                {isOk ? "✓ " : regulatoryStatus.status === "warning" ? "⚠ " : "✗ "}
                {regulatoryStatus.label}
              </Badge>
            }
          >
            <div className="space-y-3 pl-6 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">КВЕД відповідність:</span>
                  <Badge variant={compliance.kvedMatch ? "default" : "destructive"} className="text-[10px]">
                    {compliance.kvedMatch ? "✓ Відповідає" : "✗ Не відповідає"}
                  </Badge>
                </div>
                
                {compliance.kvedMissing && compliance.kvedMissing.length > 0 && (
                  <div className="p-2 rounded-md bg-destructive/10 border border-destructive/30">
                    <p className="text-xs text-destructive font-medium mb-1">
                      ⚠ Відсутні КВЕД у вашому ФОП:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {compliance.kvedMissing.map(kved => (
                        <Badge key={kved} variant="destructive" className="text-[10px]">{kved}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {isOk && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ліцензії:</span>
                    <span>не потрібні</span>
                  </div>
                )}
              </div>
              
              {compliance.licenseMissing && compliance.licenseMissing.length > 0 && (
                <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    ⚠ Відсутні ліцензії: {compliance.licenseMissing.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* Note: Accounting & Taxes Section has been moved to a dedicated tab */}

      {/* 9. Comments Section */}
      {document && (
        <CollapsibleSection
          id="comments-section"
          icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
          title="Коментарі"
          badge={document.comments?.length ? (
            <Badge variant="secondary" className="text-[10px]">{document.comments.length}</Badge>
          ) : null}
          defaultOpen={false}
        >
          <DocumentCommentsSection
            documentId={document.id}
            comments={document.comments || []}
            currentUserId="user-1"
            currentUserName="Поточний користувач"
            currentUserRole="manager"
            onAddComment={(content, replyToId) => {
              if (import.meta.env.DEV) console.log("Add comment:", content, replyToId);
            }}
            onEditComment={(commentId, content) => {
              if (import.meta.env.DEV) console.log("Edit comment:", commentId, content);
            }}
            onDeleteComment={(commentId) => {
              if (import.meta.env.DEV) console.log("Delete comment:", commentId);
            }}
            onResolveComment={onResolveComment}
          />
        </CollapsibleSection>
      )}

      {/* Note: ProcessingHistorySection and DocumentMetadataSection 
          have been removed as they are technical/developer-focused content.
          Users see the AI summary, legal status, and comments instead. */}
    </div>
  );
};
