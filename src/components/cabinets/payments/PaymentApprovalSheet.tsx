/**
 * PaymentApprovalSheet - Універсальний діалог підтвердження платежу з AI-поясненням
 * Підтримує: TaxPayment, SalaryPayment, ContractorPayment
 */

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Calculator,
  Landmark,
  CreditCard,
  FileText,
  ChevronRight,
  Users,
  Building2,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  generatePaymentExplanation, 
  generateCalculationFormula,
  getPaymentUrgency,
  generateSalaryExplanation,
  generateContractorExplanation,
  simulateAIDelay,
} from "@/lib/paymentAI";
import { 
  formatPaymentRequisites, 
  generateBankDeepLink,
  getPaymentInstructions,
  getSupportedBanks,
} from "@/lib/bankDeepLinks";
import type { TaxPayment, SalaryPayment, ContractorPayment, BankProvider, PaymentCategory } from "@/config/paymentsConfig";

type ApprovalStep = "idle" | "preparing" | "sending" | "confirming" | "completed";

const APPROVAL_STEPS: { step: ApprovalStep; label: string; progress: number }[] = [
  { step: "preparing", label: "Формування платіжки", progress: 25 },
  { step: "sending", label: "Відправка в банк", progress: 60 },
  { step: "confirming", label: "Підтвердження", progress: 90 },
  { step: "completed", label: "Завершено", progress: 100 },
];

interface PaymentApprovalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: TaxPayment | SalaryPayment | ContractorPayment | null;
  paymentType?: PaymentCategory;
  incomeTotal?: number;
  onApprove?: (paymentId: string) => void;
  onEdit?: (paymentId: string) => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToEmployee?: (employeeId: string) => void;
  onNavigateToContractor?: (contractorId: string) => void;
  onExplainInChat?: (prompt: string) => void;
}

export function PaymentApprovalSheet({
  open,
  onOpenChange,
  payment,
  paymentType = "tax",
  incomeTotal,
  onApprove,
  onEdit,
  onNavigateToIncomeBook,
  onNavigateToEmployee,
  onNavigateToContractor,
  onExplainInChat,
}: PaymentApprovalSheetProps) {
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState<BankProvider>("monobank");
  const [approvalStep, setApprovalStep] = useState<ApprovalStep>("idle");
  
  // Reset step when sheet closes
  useEffect(() => {
    if (!open) {
      setApprovalStep("idle");
    }
  }, [open]);
  
  if (!payment) return null;
  
  // Type guards
  const isTaxPayment = (p: typeof payment): p is TaxPayment => paymentType === "tax";
  const isSalaryPayment = (p: typeof payment): p is SalaryPayment => paymentType === "salary";
  const isContractorPayment = (p: typeof payment): p is ContractorPayment => paymentType === "contractor";
  
  // Common fields
  const amount = isTaxPayment(payment) ? payment.amountToPay : payment.amount;
  const statusLabel = payment.statusLabel;
  
  // Type-specific data
  const title = isTaxPayment(payment) 
    ? `${payment.taxTypeLabel} за ${payment.period}`
    : isSalaryPayment(payment)
      ? `Зарплата: ${payment.employeeName}`
      : `Оплата: ${payment.contractor}`;
  
  const subtitle = isTaxPayment(payment)
    ? payment.period
    : isSalaryPayment(payment)
      ? payment.period
      : payment.purpose;
  
  // Urgency (only for tax payments)
  const urgency = isTaxPayment(payment) 
    ? getPaymentUrgency(payment.deadline)
    : null;
  
  // AI Explanation
  const explanation = isTaxPayment(payment)
    ? generatePaymentExplanation(payment, incomeTotal || payment.calculatedFromIncome)
    : isSalaryPayment(payment)
      ? generateSalaryExplanation(payment)
      : generateContractorExplanation(payment);
  
  // Formula (only for tax)
  const formula = isTaxPayment(payment)
    ? generateCalculationFormula(
        payment.taxType,
        payment.amountToPay,
        incomeTotal || payment.calculatedFromIncome,
        payment.quarter ? 3 : 1
      )
    : null;
  
  // Bank integration (only for tax for now)
  const bankLink = isTaxPayment(payment) ? generateBankDeepLink(payment, selectedBank) : null;
  const instructions = getPaymentInstructions(selectedBank);
  const supportedBanks = getSupportedBanks();
  
  // Icon based on type
  const TypeIcon = isTaxPayment(payment) ? Landmark : isSalaryPayment(payment) ? Users : Building2;
  
  const handleCopyRequisites = () => {
    if (isTaxPayment(payment)) {
      const text = formatPaymentRequisites(payment);
      navigator.clipboard.writeText(text);
      toast({
        title: "Скопійовано",
        description: "Реквізити скопійовано в буфер обміну",
      });
    }
  };
  
  const handleApprove = async () => {
    // Mock Bank Confirmation Flow
    setApprovalStep("preparing");
    await simulateAIDelay(800);
    
    setApprovalStep("sending");
    await simulateAIDelay(1000);
    
    setApprovalStep("confirming");
    await simulateAIDelay(600);
    
    setApprovalStep("completed");
    
    // Generate mock confirmation number
    const confirmationNumber = `PO-${Date.now().toString().slice(-8)}`;
    
    setTimeout(() => {
      onApprove?.(payment.id);
      toast({
        title: "✓ Платіж підтверджено",
        description: `Квитанція: ${confirmationNumber}`,
      });
      onOpenChange(false);
    }, 500);
  };
  
  const handleOpenBank = () => {
    if (bankLink?.deepLink) {
      window.open(bankLink.deepLink, "_blank");
    } else if (bankLink?.fallbackUrl) {
      window.open(bankLink.fallbackUrl, "_blank");
    } else {
      handleCopyRequisites();
    }
  };
  
  const handleAskAI = () => {
    const prompt = isTaxPayment(payment)
      ? `Поясни детальніше розрахунок ${payment.taxTypeLabel} за ${payment.period}`
      : isSalaryPayment(payment)
        ? `Поясни розрахунок зарплати ${payment.employeeName} за ${payment.period}`
        : `Поясни платіж контрагенту ${payment.contractor}`;
    onExplainInChat?.(prompt);
    onOpenChange(false);
  };
  
  const handleNavigate = () => {
    if (isTaxPayment(payment)) {
      onNavigateToIncomeBook?.();
    } else if (isSalaryPayment(payment)) {
      onNavigateToEmployee?.(payment.employeeId);
    } else if (isContractorPayment(payment) && payment.contractorId) {
      onNavigateToContractor?.(payment.contractorId);
    }
  };
  
  const currentStepIndex = APPROVAL_STEPS.findIndex(s => s.step === approvalStep);
  const currentProgress = currentStepIndex >= 0 ? APPROVAL_STEPS[currentStepIndex].progress : 0;
  const isApproving = approvalStep !== "idle" && approvalStep !== "completed";
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              urgency?.level === "urgent" || urgency?.level === "overdue"
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            )}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-left">
                {title}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={payment.status === "created" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {statusLabel}
                </Badge>
                {urgency && (
                  <span className={cn("text-xs", urgency.color)}>
                    {urgency.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>
        
        {/* Amount */}
        <div className="text-center py-4 border-y bg-muted/30">
          <p className="text-3xl font-bold tabular-nums">
            {new Intl.NumberFormat("uk-UA").format(amount)} ₴
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isTaxPayment(payment) ? "До сплати" : isSalaryPayment(payment) ? "До виплати" : "До оплати"}
          </p>
        </div>
        
        {/* Bank Confirmation Progress */}
        {isApproving && (
          <Card className="mt-4 border-primary/30 bg-primary/5">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">
                  {APPROVAL_STEPS[currentStepIndex]?.label || "Обробка..."}
                </span>
              </div>
              <Progress value={currentProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {APPROVAL_STEPS.slice(0, 3).map((s, i) => (
                  <span key={s.step} className={cn(
                    currentStepIndex >= i && "text-primary font-medium"
                  )}>
                    {i + 1}. {s.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* AI Explanation */}
        {!isApproving && (
          <Card className="mt-4 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Розрахунок AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground whitespace-pre-line">{explanation}</p>
              
              {formula && (
                <div className="flex items-center gap-2 p-2 bg-background rounded-md border">
                  <Calculator className="h-4 w-4 text-muted-foreground shrink-0" />
                  <code className="text-sm font-mono">{formula}</code>
                </div>
              )}
              
              {(isTaxPayment(payment) && payment.calculatedFromIncome) || isSalaryPayment(payment) || isContractorPayment(payment) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-xs"
                  onClick={handleNavigate}
                >
                  <span>
                    {isTaxPayment(payment) 
                      ? "Переглянути операції в Книзі доходів"
                      : isSalaryPayment(payment)
                        ? "Переглянути картку працівника"
                        : "Переглянути картку контрагента"
                    }
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : null}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handleAskAI}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Запитати AI детальніше
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Tabs: Requisites / Bank - Only for Tax Payments */}
        {isTaxPayment(payment) && !isApproving && (
          <Tabs defaultValue="requisites" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="requisites" className="flex-1 text-xs">
                <FileText className="h-3.5 w-3.5 mr-1" />
                Реквізити
              </TabsTrigger>
              <TabsTrigger value="bank" className="flex-1 text-xs">
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                Оплата
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="requisites" className="mt-3 space-y-3">
              <div className="space-y-2 text-sm">
                <RequisiteRow label="Отримувач" value="ГУ ДПС у м. Києві" />
                <RequisiteRow label="ЄДРПОУ" value="44094520" />
                <RequisiteRow 
                  label="IBAN" 
                  value={payment.recipientIban || "—"}
                  copyable
                />
                <RequisiteRow label="МФО (довідково з IBAN)" value={payment.recipientMfo || "—"} />
                <RequisiteRow label="КБК" value={payment.budgetCode || "—"} />
                <Separator />
                <RequisiteRow 
                  label="Призначення" 
                  value={`*;101;${payment.budgetCode || ""};${payment.taxTypeLabel} за ${payment.period}`}
                  copyable
                />
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyRequisites}
              >
                <Copy className="h-4 w-4 mr-2" />
                Копіювати всі реквізити
              </Button>
            </TabsContent>
            
            <TabsContent value="bank" className="mt-3 space-y-3">
              {/* Bank Selector */}
              <div className="flex gap-2">
                {supportedBanks.map(bank => (
                  <Button
                    key={bank.id}
                    variant={selectedBank === bank.id ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedBank(bank.id)}
                  >
                    {bank.name}
                  </Button>
                ))}
              </div>
              
              {/* Instructions */}
              <Card>
                <CardContent className="pt-4">
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                    {instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              
              <Button
                className="w-full"
                onClick={handleOpenBank}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {bankLink?.deepLink ? `Відкрити ${selectedBank === "monobank" ? "Monobank" : "Приват24"}` : "Копіювати реквізити"}
              </Button>
              
              {bankLink && !bankLink.isSupported && (
                <p className="text-xs text-center text-muted-foreground">
                  Для цього банку доступне лише копіювання реквізитів
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Salary Payment Details */}
        {isSalaryPayment(payment) && !isApproving && (
          <div className="mt-4 space-y-3">
            <div className="space-y-2 text-sm">
              <RequisiteRow
                label="Працівник"
                value={payment.employeeName}
                onClick={
                  onNavigateToEmployee
                    ? () => onNavigateToEmployee(payment.employeeId)
                    : undefined
                }
              />
              <RequisiteRow label="Посада" value={payment.employeePosition} />
              <RequisiteRow label="Період" value={payment.period} />
              {payment.employeeIban && (
                <RequisiteRow label="IBAN" value={payment.employeeIban} copyable />
              )}
              {payment.employeeCardMask && (
                <RequisiteRow label="Картка" value={payment.employeeCardMask} />
              )}
            </div>
          </div>
        )}
        
        {/* Contractor Payment Details */}
        {isContractorPayment(payment) && !isApproving && (
          <div className="mt-4 space-y-3">
            <div className="space-y-2 text-sm">
              <RequisiteRow
                label="Контрагент"
                value={payment.contractor}
                onClick={
                  onNavigateToContractor && payment.contractorId
                    ? () => onNavigateToContractor(payment.contractorId!)
                    : undefined
                }
              />
              {payment.contractorCode && (
                <RequisiteRow label="ЄДРПОУ" value={payment.contractorCode} />
              )}
              {payment.recipientIban && (
                <RequisiteRow label="IBAN" value={payment.recipientIban} copyable />
              )}
              <RequisiteRow label="Призначення" value={payment.purpose} />
              {payment.contractNumber && (
                <RequisiteRow label="Договір" value={`№${payment.contractNumber}`} />
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {!isApproving && (
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit?.(payment.id)}
            >
              Редагувати
            </Button>
            <Button
              className="flex-1"
              onClick={handleApprove}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Підтвердити
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ========== HELPER COMPONENTS ==========

interface RequisiteRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  onClick?: () => void;
}

function RequisiteRow({ label, value, copyable, onClick }: RequisiteRowProps) {
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Скопійовано",
      description: label,
    });
  };
  
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <div className="flex items-center gap-1 text-right">
        {onClick && value !== "—" ? (
          <button
            type="button"
            onClick={onClick}
            className="font-medium break-all text-left hover:text-primary hover:underline transition-colors inline-flex items-center gap-1 group"
          >
            <span>{value}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ) : (
          <span className="font-medium break-all">{value}</span>
        )}
        {copyable && value !== "—" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}