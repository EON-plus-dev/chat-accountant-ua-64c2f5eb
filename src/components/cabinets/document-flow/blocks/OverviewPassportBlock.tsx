/**
 * OverviewPassportBlock — Unified "Паспорт документа" block
 * Combines stepper (from DocumentPassportBlock) + formal identification fields
 * 
 * Fields: Status, Type, Counterparty, Date, Number, Amount, Important Dates, Project
 * Removed: Category (system classification), Cabinet (redundant with header)
 */

import { FileText, Calendar, Hash, Coins, Clock, Users, Archive, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ActionBadgeStepper } from "../ActionBadgeStepper";
import { useActionSteps } from "@/hooks/useActionSteps";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import { getDocumentStatusConfig } from "@/config/documentFlowConfig";
import type { CabinetType } from "@/types/cabinet";
import type { ApprovalState } from "@/config/approvalWorkflowConfig";
import type { ActionType } from "@/config/userActionStepsConfig";

// ============================================
// TYPES
// ============================================

interface TemplateFieldValues {
  documentNumber?: string;
  documentDate?: string;
  total?: string;
  supplierName?: string;
  supplierCode?: string;
  buyerName?: string;
  buyerCode?: string;
  subject?: string;
  validUntil?: string;
}

interface CounterpartyInfo {
  name: string;
  code?: string;
  onClick?: () => void;
}

interface OverviewPassportBlockProps {
  document: FlowDocument;
  projectName?: string;
  className?: string;
  fieldValues?: TemplateFieldValues;
  counterparty?: CounterpartyInfo;
  // Stepper props
  cabinetType?: CabinetType;
  approvalState?: ApprovalState;
  onStepAction?: (actionType: ActionType) => void;
}

// ============================================
// HELPERS
// ============================================

const formatDate = (dateString?: string): string => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatAmount = (amount?: number, currency: string = "UAH"): string => {
  if (amount === undefined || amount === null) return "—";
  const currencySymbols: Record<string, string> = { UAH: "₴", USD: "$", EUR: "€" };
  return `${amount.toLocaleString("uk-UA")} ${currencySymbols[currency] || currency}`;
};

export const getDocumentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    invoice: "Рахунок",
    act: "Акт",
    contract: "Договір",
    "tax-invoice": "Податкова накладна",
    "bank-statement": "Банківська виписка",
    order: "Наказ",
    "rental-agreement": "Договір оренди",
    "supply-contract": "Договір поставки",
    "fop-service-contract": "Договір послуг",
    "service-agreement": "Договір про надання послуг",
    nda: "NDA",
    "license-agreement": "Ліцензійний договір",
    "framework-agreement": "Рамковий договір",
    waybill: "ТТН",
    receipt: "Касовий чек",
    "vacation-order": "Наказ про відпустку",
    "employment-order": "Наказ про прийняття",
    "dismissal-order": "Наказ про звільнення",
    "payment-order": "Платіжне доручення",
    "power-of-attorney": "Довіреність",
    certificate: "Довідка",
    "prro-receipt": "Касовий чек (ПРРО)",
    reconciliation: "Акт звірки",
    "sale-agreement": "Договір купівлі-продажу",
    ttn: "ТТН",
  };
  return labels[type] || type;
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface PassportItemProps {
  icon: typeof FileText;
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}

const PassportItem = ({ icon: Icon, label, value, highlight }: PassportItemProps) => (
  <div className="flex items-start gap-2.5">
    <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        "text-sm font-medium truncate",
        highlight && "text-primary"
      )}>
        {value}
      </p>
    </div>
  </div>
);

// Stepper wrapper (moved from DocumentPassportBlock)
interface StepperSectionProps {
  document: FlowDocument;
  cabinetType: CabinetType;
  approvalState?: ApprovalState;
  onStepAction?: (actionType: ActionType) => void;
}

const StepperSection = ({ document, cabinetType, approvalState, onStepAction }: StepperSectionProps) => {
  const { steps, currentStepIndex, isCompleted } = useActionSteps({
    documentStatus: document.status,
    cabinetType,
    approvalState,
  });

  if (['archived', 'cancelled'].includes(document.status)) {
    return (
      <Badge variant="secondary" className="text-sm gap-1.5">
        {document.status === 'archived' ? (
          <><Archive className="w-3.5 h-3.5" /> Архів</>
        ) : (
          <><XCircle className="w-3.5 h-3.5" /> Скасовано</>
        )}
      </Badge>
    );
  }

  return (
    <ActionBadgeStepper
      steps={steps}
      currentStepIndex={currentStepIndex}
      isCompleted={isCompleted}
      onStepClick={onStepAction ? (step) => onStepAction(step.action) : undefined}
    />
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const OverviewPassportBlock = ({
  document,
  projectName,
  className,
  fieldValues,
  counterparty,
  cabinetType = "fop",
  approvalState,
  onStepAction,
}: OverviewPassportBlockProps) => {
  const hasValidityPeriod = document.period?.from || document.period?.to;
  const hasDueDate = document.dueDate;
  const hasValidUntil = fieldValues?.validUntil;
  
  const displayNumber = fieldValues?.documentNumber || document.number || "—";
  const displayDate = fieldValues?.documentDate || document.date;
  const displayAmount = fieldValues?.total 
    ? parseFloat(fieldValues.total.replace(/\s/g, '').replace(',', '.'))
    : document.amount;

  // Status config
  const statusConfig = getDocumentStatusConfig(document.status);

  return (
    <Card className={cn("overflow-hidden", className)} data-section="document-passport">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Паспорт документа
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stepper Section */}
        <div data-section="document-hero">
          <StepperSection
            document={document}
            cabinetType={cabinetType}
            approvalState={approvalState}
            onStepAction={onStepAction}
          />
        </div>

        {/* Passport Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {/* Left column */}
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-start gap-2.5">
              <statusConfig.icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Статус</p>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs px-1.5 py-0 font-medium", statusConfig.color)}
                >
                  {statusConfig.label}
                </Badge>
              </div>
            </div>

            <PassportItem
              icon={FileText}
              label="Тип документа"
              value={getDocumentTypeLabel(document.type)}
            />
            
            {/* Counterparty */}
            {counterparty && (
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Контрагент</p>
                  {counterparty.onClick ? (
                    <button
                      onClick={counterparty.onClick}
                      className="text-sm font-medium text-primary hover:underline underline-offset-2 truncate block text-left"
                    >
                      {counterparty.name}
                    </button>
                  ) : (
                    <p className="text-sm font-medium truncate">{counterparty.name}</p>
                  )}
                  {counterparty.code && (
                    <p className="text-xs text-muted-foreground">
                      {counterparty.code.length === 8 ? "ЄДРПОУ" : counterparty.code.length === 10 ? "ІПН" : "Код"}: {counterparty.code}
                    </p>
                  )}
                </div>
              </div>
            )}

            
            {projectName && (
              <PassportItem
                icon={FileText}
                label="Проєкт / напрям"
                value={projectName}
              />
            )}
          </div>
          
          {/* Right column */}
          <div className="space-y-3">
            <PassportItem
              icon={Calendar}
              label="Дата документа"
              value={formatDate(displayDate)}
            />
            
            <PassportItem
              icon={Hash}
              label="Номер"
              value={displayNumber}
            />
            
            {(displayAmount !== undefined || fieldValues?.total) && (
              <PassportItem
                icon={Coins}
                label="Сума"
                value={fieldValues?.total || formatAmount(displayAmount, document.currency)}
                highlight
              />
            )}
            
            {(hasValidityPeriod || hasDueDate || hasValidUntil) && (
              <PassportItem
                icon={Clock}
                label="Важливі дати"
                value={
                  <div className="space-y-0.5 text-xs">
                    {hasDueDate && (
                      <span className="block">
                        Оплата до: {formatDate(document.dueDate)}
                      </span>
                    )}
                    {hasValidityPeriod && (
                      <span className="block text-muted-foreground">
                        Період: {formatDate(document.period?.from)} — {formatDate(document.period?.to)}
                      </span>
                    )}
                    {hasValidUntil && !hasValidityPeriod && (
                      <span className="block text-muted-foreground">
                        Дійсний до: {formatDate(fieldValues?.validUntil)}
                      </span>
                    )}
                  </div>
                }
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
