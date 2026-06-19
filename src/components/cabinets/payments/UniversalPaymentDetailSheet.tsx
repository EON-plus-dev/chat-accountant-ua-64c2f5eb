/**
 * Universal Payment Detail Sheet
 * Polymorphic sheet that adapts content based on payment sourceType.
 * Тільки робочі дії — заглушки приховано (B1).
 * Заголовок: [Іконка] [Тип] · [№/Період] (B4).
 */

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Receipt,
  RotateCcw,
  Link2,
  Copy,
  BookOpen,
  FileDown,
  FilePlus2,
  FileWarning,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type UnifiedPayment,
  paymentTypeConfig,
  directionConfig,
  unifiedStatusConfig,
  isTaxPayment,
  isSalaryPayment,
  isContractorPayment,
  isIncomeBookRecord,
} from "@/config/unifiedPaymentsConfig";
import { getTaxCategory } from "@/config/paymentsConfig";
import {
  TaxFopDetailSection,
  TaxSalaryDetailSection,
  SalaryDetailSection,
  ContractorDetailSection,
  IncomeDetailSection,
  ReturnDetailSection,
} from "./detail-sections";
import { MarkAsPaidDialog } from "./MarkAsPaidDialog";
import { MarkAsReceivedDialog } from "./MarkAsReceivedDialog";
import { IssueReceiptDialog } from "./IssueReceiptDialog";
import { PaymentAuditTrail } from "./PaymentAuditTrail";
import { useDrillStack } from "@/components/shared/drill-stack";

export type DetailSheetFocusSection = "bank-details" | "audit" | null;

interface UniversalPaymentDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: UnifiedPayment | null;
  /**
   * Якщо передано — після відкриття sheet скролить до відповідного блоку
   * та підсвічує його ~1.5s. Використовується з row-action «Сплатити».
   */
  focusSection?: DetailSheetFocusSection;
  onNavigateToEmployee?: (employeeId: string) => void;
  onNavigateToContractor?: (contractorId: string) => void;
  onNavigateToDocument?: (documentId: string) => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToOriginalPayment?: (id: string) => void;
  onNavigateToReport?: (reportId: string) => void;
  onExplainInChat?: (prompt: string) => void;
}

function getSubtitle(payment: UnifiedPayment): string {
  const data = payment.sourceData;
  if (isTaxPayment(data)) return data.period || data.taxTypeLabel;
  if (isSalaryPayment(data)) return `${data.employeeName} · ${data.period}`;
  if (isContractorPayment(data)) {
    return data.relatedDocumentNumber
      ? `${data.contractor} · Док. №${data.relatedDocumentNumber}`
      : data.contractor;
  }
  if (isIncomeBookRecord(data)) {
    return data.contractor || format(new Date(payment.date), "dd MMMM yyyy", { locale: uk });
  }
  return format(new Date(payment.date), "dd MMMM yyyy", { locale: uk });
}

export function UniversalPaymentDetailSheet({
  open,
  onOpenChange,
  payment,
  focusSection = null,
  onNavigateToEmployee,
  onNavigateToContractor,
  onNavigateToDocument,
  onNavigateToIncomeBook,
  onNavigateToPayroll,
  onNavigateToOriginalPayment,
  onNavigateToReport,
  onExplainInChat,
}: UniversalPaymentDetailSheetProps) {
  const drillStack = useDrillStack();
  const sourceLabel = payment ? `Платіж №${payment.id}` : undefined;

  // Drill fallbacks: якщо явний onNavigate* не передано — пушимо рівень у стек.
  // Це дозволяє відкрити пов'язану сутність як stacked sheet без втрати контексту.
  const handleNavContractor = (contractorId: string) => {
    if (onNavigateToContractor) onNavigateToContractor(contractorId);
    else {
      const data = payment?.sourceData as { contractor?: string } | undefined;
      drillStack.push({
        kind: "contractor",
        id: contractorId,
        sourceLabel,
        displayName: data?.contractor,
      });
    }
  };
  const handleNavDocument = (documentId: string) => {
    if (onNavigateToDocument) onNavigateToDocument(documentId);
    else drillStack.push({ kind: "document", id: documentId, sourceLabel });
  };
  const handleNavIncomeBook = () => {
    // Для сутності IncomeBook — використовуємо id поточного платежу як id запису
    // (у demo income-records id збігаються з payment.id для income-сутностей).
    if (onNavigateToIncomeBook) onNavigateToIncomeBook();
    else if (payment) drillStack.push({ kind: "income-record", id: payment.id, sourceLabel });
  };

  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [markReceivedOpen, setMarkReceivedOpen] = useState(false);
  const [issueReceiptOpen, setIssueReceiptOpen] = useState(false);
  const [extraAuditEntries, setExtraAuditEntries] = useState<import("./PaymentAuditTrail").PaymentAuditEntry[]>([]);
  const [highlightSection, setHighlightSection] = useState<DetailSheetFocusSection>(null);
  const bankDetailsRef = useRef<HTMLDivElement | null>(null);
  const auditRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll & highlight when sheet is opened with a focus target
  useEffect(() => {
    if (!open || !focusSection) {
      setHighlightSection(null);
      return;
    }
    const target = focusSection === "bank-details" ? bankDetailsRef.current : auditRef.current;
    const t = window.setTimeout(() => {
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightSection(focusSection);
      window.setTimeout(() => setHighlightSection(null), 1600);
    }, 220);
    return () => window.clearTimeout(t);
  }, [open, focusSection, payment?.id]);

  if (!payment) return null;

  const typeConfig = paymentTypeConfig[payment.paymentType];
  const dirConfig = directionConfig[payment.direction];
  const statusConfig = unifiedStatusConfig[payment.status] || {
    label: payment.statusLabel,
    badgeClass: "bg-slate-100 text-slate-600",
  };
  const TypeIcon = typeConfig.icon;
  const subtitle = getSubtitle(payment);

  const formatCurrency = (amount: number) => `₴${amount.toLocaleString("uk-UA")}`;

  const handleDuplicate = () => {
    toast({
      title: "Чернетку створено",
      description: "Платіж скопійовано як новий чернетка-документ. Перевірте дані перед відправкою.",
    });
  };

  const handleDownloadReceipt = () => {
    toast({
      title: "Завантаження квитанції",
      description: "Запит до Електронного кабінету ДПС у обробці…",
    });
  };

  const handleDownloadPayslip = () => {
    toast({
      title: "Розрахунковий лист",
      description: "PDF готується…",
    });
  };

  const handleDownloadActAndInstruction = () => {
    toast({
      title: "Документи готуються",
      description: "Акт + Платіжна інструкція (PDF) скоро будуть готові.",
    });
  };

  // Render source-specific details
  const renderSourceDetails = () => {
    const sourceData = payment.sourceData;

    if (isTaxPayment(sourceData)) {
      const category = getTaxCategory(sourceData.taxType);
      if (category === "fop") {
        return (
          <TaxFopDetailSection
            payment={sourceData}
            onNavigateToIncomeBook={handleNavIncomeBook}
          />
        );
      }
      return (
        <TaxSalaryDetailSection
          payment={sourceData}
          onNavigateToEmployee={onNavigateToEmployee}
          onNavigateToPayroll={onNavigateToPayroll}
        />
      );
    }

    if (isSalaryPayment(sourceData)) {
      return (
        <SalaryDetailSection
          payment={sourceData}
          onNavigateToEmployee={onNavigateToEmployee}
        />
      );
    }

    if (isContractorPayment(sourceData)) {
      return (
        <ContractorDetailSection
          payment={sourceData}
          onNavigateToContractor={handleNavContractor}
          onNavigateToDocument={handleNavDocument}
        />
      );
    }

    if (isIncomeBookRecord(sourceData)) {
      if (sourceData.status === "return") {
        return (
          <ReturnDetailSection
            record={sourceData}
            onNavigateToOriginalPayment={onNavigateToOriginalPayment}
            onNavigateToDocument={handleNavDocument}
            onNavigateToIncomeBook={handleNavIncomeBook}
          />
        );
      }
      return (
        <IncomeDetailSection
          record={sourceData}
          onNavigateToContractor={handleNavContractor}
          onNavigateToDocument={handleNavDocument}
          onNavigateToIncomeBook={handleNavIncomeBook}
        />
      );
    }


    return null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2 text-left">
            <span className="inline-flex items-center gap-2">
              <TypeIcon className={cn("h-5 w-5 shrink-0", `text-${typeConfig.color}-500`)} />
              <span>{typeConfig.label}</span>
              <span className="hidden sm:inline text-muted-foreground font-normal">·</span>
            </span>
            <span className="text-sm text-muted-foreground font-normal break-words sm:truncate">{subtitle}</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Header: Amount + Status */}
          <div className="text-center pb-4 border-b">
            <div className={cn(
              "text-2xl sm:text-3xl font-bold mb-2 break-all",
              dirConfig.amountClass
            )}>
              {payment.direction === "in" ? "+" : "−"}{formatCurrency(payment.amount)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className={cn("font-medium", statusConfig.badgeClass)}
              >
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(payment.date), "dd MMMM yyyy", { locale: uk })}
              </span>
            </div>
          </div>

          {/* Source-specific details (містить блок реквізитів) */}
          <div
            ref={bankDetailsRef}
            data-section="bank-details"
            className={cn(
              "scroll-mt-4 transition-all duration-500 rounded-lg",
              highlightSection === "bank-details" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            {renderSourceDetails()}
          </div>

          {/* Audit trail */}
          <div
            ref={auditRef}
            data-section="audit"
            className={cn(
              "scroll-mt-4 transition-all duration-500 rounded-lg",
              highlightSection === "audit" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <PaymentAuditTrail payment={payment} extraEntries={extraAuditEntries} />
          </div>

          {/* Action Bar — тільки робочі кнопки (B1) */}
          <div className="pt-4 border-t space-y-2">
            {(() => {
              const isOut = payment.direction === "out";
              const isIn = payment.direction === "in";
              const isPaid = payment.status === "paid";
              const needsPayment = isOut && (
                payment.status === "scheduled" ||
                payment.status === "created" ||
                payment.status === "not-created" ||
                payment.status === "overdue"
              );
              const needsConfirmation = isIn && (
                payment.status === "needs-clarification" ||
                payment.status === "scheduled"
              );
              const isReturn = payment.paymentType === "return";
              const isIncome = payment.paymentType === "income";
              const isTax = payment.paymentType === "tax-fop" || payment.paymentType === "tax-salary" || payment.paymentType === "tax";
              const isSalary = payment.paymentType === "salary";
              const isContractor = payment.paymentType === "contractor";

              return (
                <>
                  {/* Primary action — підтвердження */}
                  {needsPayment && (
                    <Button className="w-full" size="sm" onClick={() => setMarkPaidOpen(true)}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Підтвердити оплату
                    </Button>
                  )}
                  {needsConfirmation && isIncome && (
                    <Button className="w-full" size="sm" onClick={() => setMarkReceivedOpen(true)}>
                      <BookOpen className="h-4 w-4 mr-1.5" />
                      Підтвердити надходження
                    </Button>
                  )}
                  {isReturn && payment.status !== "paid" && (
                    <Button className="w-full" size="sm" onClick={() => setMarkPaidOpen(true)}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Підтвердити повернення
                    </Button>
                  )}

                  {/* Primary post-paid actions (B2) */}
                  {isPaid && isTax && (
                    <Button className="w-full" size="sm" variant="default" onClick={handleDownloadReceipt}>
                      <FileDown className="h-4 w-4 mr-1.5" />
                      Завантажити квитанцію ДПС
                    </Button>
                  )}
                  {isPaid && isSalary && (
                    <Button className="w-full" size="sm" variant="default" onClick={handleDownloadPayslip}>
                      <Receipt className="h-4 w-4 mr-1.5" />
                      Розрахунковий лист (PDF)
                    </Button>
                  )}
                  {isPaid && isContractor && (
                    <Button className="w-full" size="sm" variant="default" onClick={handleDownloadActAndInstruction}>
                      <FileDown className="h-4 w-4 mr-1.5" />
                      Акт + Платіжна інструкція (PDF)
                    </Button>
                  )}

                  {/* Issue receipt for income paid */}
                  {isPaid && isIncome && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setIssueReceiptOpen(true)}>
                      <Receipt className="h-3.5 w-3.5 mr-1.5" />
                      Видати квитанцію (PDF)
                    </Button>
                  )}

                  {/* Виписати ПН на передоплату — для income paid */}
                  {isPaid && isIncome && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => toast({ title: "ПН на передоплату", description: "Доступно для платників ПДВ. Готується інтеграція з СЕА ПДВ." })}
                          >
                            <FilePlus2 className="h-3.5 w-3.5 mr-1.5" />
                            Виписати ПН на передоплату
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Доступно для платників ПДВ (ПКУ ст. 187, перша подія — оплата)</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* РК до ПН — для return, disabled поки немає зв'язку */}
                  {isReturn && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled
                            >
                              <FileWarning className="h-3.5 w-3.5 mr-1.5" />
                              РК до ПН
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Спочатку прив'яжіть оригінальну податкову накладну</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Secondary actions: bank reconciliation + duplicate */}
                  <div className="grid grid-cols-2 gap-2">
                    {(needsPayment || isPaid) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => isOut ? setMarkPaidOpen(true) : setMarkReceivedOpen(true)}
                      >
                        <Link2 className="h-3.5 w-3.5 mr-1.5" />
                        {isPaid ? "Прив'язати виписку" : "До банк-виписки"}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleDuplicate}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Дублювати
                    </Button>
                  </div>

                  {payment.relatedReportId && onNavigateToReport && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onNavigateToReport(payment.relatedReportId!)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      Відкрити пов'язаний звіт
                    </Button>
                  )}

                  {onExplainInChat && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onExplainInChat(`Поясни деталі платежу "${payment.entityName}" на суму ${formatCurrency(payment.amount)}`)}
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Пояснити в чаті
                    </Button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </SheetContent>

      <MarkAsPaidDialog
        open={markPaidOpen}
        onOpenChange={setMarkPaidOpen}
        payment={payment}
        onConfirm={(d) => {
          if (d.statementRef) {
            setExtraAuditEntries((prev) => [
              ...prev,
              {
                id: `${payment.id}-rec-${Date.now()}`,
                action: "reconciled",
                actor: "Власник кабінету",
                at: d.paidAt,
                note: `Звірено з: ${d.statementRef}`,
              },
            ]);
          }
        }}
      />
      <MarkAsReceivedDialog
        open={markReceivedOpen}
        onOpenChange={setMarkReceivedOpen}
        payment={payment}
        onConfirm={(d) => {
          if (d.statementRef) {
            setExtraAuditEntries((prev) => [
              ...prev,
              {
                id: `${payment.id}-rec-${Date.now()}`,
                action: "reconciled",
                actor: "Власник кабінету",
                at: d.receivedAt,
                note: `Звірено з: ${d.statementRef}`,
              },
            ]);
          }
        }}
      />
      {payment.sourceData && isIncomeBookRecord(payment.sourceData) && (
        <IssueReceiptDialog
          open={issueReceiptOpen}
          onOpenChange={setIssueReceiptOpen}
          record={payment.sourceData}
        />
      )}
    </Sheet>
  );
}
