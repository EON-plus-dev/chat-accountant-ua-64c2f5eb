import { useState, useMemo } from "react";
import { Landmark, Building2, Users, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PaymentsKPISection } from "./PaymentsKPISection";
import { PaymentQueueCard } from "./PaymentQueueCard";
import { PaymentApprovalSheet } from "./PaymentApprovalSheet";
import { TaxPaymentsTab } from "./TaxPaymentsTab";
import { ContractorPaymentsTab } from "./ContractorPaymentsTab";
import { SalaryPaymentsTab } from "./SalaryPaymentsTab";
import { UniversalPaymentDetailSheet } from "./UniversalPaymentDetailSheet";
import { IncomingPaymentsTab } from "./IncomingPaymentsTab";
import { OperationDetailsSheet } from "@/components/cabinets/income-book/OperationDetailsSheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import {
  getTaxPaymentsForCabinet,
  getSalaryPaymentsForCabinet,
  getContractorPaymentsForCabinet,
  type TaxPayment,
  type SalaryPayment,
  type ContractorPayment,
  type PaymentCategory,
} from "@/config/paymentsConfig";
import {
  normalizeTaxPayment,
  normalizeSalaryPayment,
  normalizeContractorPayment,
  type UnifiedPayment,
} from "@/config/unifiedPaymentsConfig";

interface PaymentsPageProps {
  cabinet: Cabinet;
  onNavigateToReports?: (reportId?: string) => void;
  onNavigateToEmployees?: (employeeId?: string) => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToDocumentDetail?: (documentId: string) => void;
  onChatPromptInsert?: (prompt: string) => void;
}

type CashFlowDirection = "incoming" | "outgoing";
type PaymentMode = "tax" | "contractor" | "salary";

const modeConfig: { id: PaymentMode; label: string; icon: typeof Landmark }[] = [
  { id: "contractor", label: "Контрагенти", icon: Building2 },
  { id: "salary", label: "Зарплати", icon: Users },
  { id: "tax", label: "Податки", icon: Landmark },
];

export function PaymentsPage({ 
  cabinet, 
  onNavigateToReports, 
  onNavigateToEmployees,
  onNavigateToIncomeBook,
  onNavigateToDocumentDetail,
  onChatPromptInsert 
}: PaymentsPageProps) {
  const { toast } = useToast();
  const [cashFlowDirection, setCashFlowDirection] = useState<CashFlowDirection>("outgoing");
  const [activeMode, setActiveMode] = useState<PaymentMode>("contractor");
  const [selectedUnifiedPayment, setSelectedUnifiedPayment] = useState<UnifiedPayment | null>(null);
  const [approvalPayment, setApprovalPayment] = useState<TaxPayment | null>(null);
  const [smartInboxOpen, setSmartInboxOpen] = useState(false);
  const [selectedIncomingRecord, setSelectedIncomingRecord] = useState<IncomeBookRecord | null>(null);

  // Отримуємо дані
  const taxPayments = useMemo(() => getTaxPaymentsForCabinet(cabinet.id), [cabinet.id]);
  const salaryPayments = useMemo(() => getSalaryPaymentsForCabinet(cabinet.id), [cabinet.id]);
  const contractorPayments = useMemo(() => getContractorPaymentsForCabinet(cabinet.id), [cabinet.id]);

  // Pending payments count for Smart Inbox badge
  const pendingPaymentsCount = useMemo(() => {
    const pendingTax = taxPayments.filter(p => p.status === "scheduled" || p.status === "created").length;
    const pendingSalary = salaryPayments.filter(p => p.status === "scheduled").length;
    const pendingContractor = contractorPayments.filter(p => p.status === "scheduled").length;
    return pendingTax + pendingSalary + pendingContractor;
  }, [taxPayments, salaryPayments, contractorPayments]);

  const handleCreatePayment = () => {
    toast({
      title: "Демо-режим",
      description: "Створення платежу буде доступне після запуску",
    });
  };

  const handleOpenPayment = (payment: TaxPayment | SalaryPayment | ContractorPayment, category: PaymentCategory) => {
    if (category === "tax") setSelectedUnifiedPayment(normalizeTaxPayment(payment as TaxPayment));
    else if (category === "salary") setSelectedUnifiedPayment(normalizeSalaryPayment(payment as SalaryPayment));
    else setSelectedUnifiedPayment(normalizeContractorPayment(payment as ContractorPayment));
  };

  const handleNavigateToReport = (reportId: string) => {
    onNavigateToReports?.(reportId);
  };

  const handleNavigateToEmployee = (employeeId: string) => {
    onNavigateToEmployees?.(employeeId);
  };

  const handleExplainInChat = (prompt: string) => {
    onChatPromptInsert?.(prompt);
  };

  const handleOpenApproval = (paymentId: string, type: "tax" | "salary" | "contractor") => {
    if (type === "tax") {
      const payment = taxPayments.find(p => p.id === paymentId);
      if (payment) setApprovalPayment(payment);
    }
  };

  return (
    <div className="pt-5 space-y-5">
      {/* Level 1: Cash Flow Direction Segment */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1 bg-muted/50 dark:bg-muted/30 border border-border/50 rounded-full">
          <button
            onClick={() => setCashFlowDirection("incoming")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              cashFlowDirection === "incoming"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowDownLeft className={cn("h-4 w-4", cashFlowDirection === "incoming" ? "text-emerald-500" : "text-emerald-500/60")} />
            <span>Надходження</span>
          </button>
          <button
            onClick={() => setCashFlowDirection("outgoing")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              cashFlowDirection === "outgoing"
                ? "bg-card text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpRight className={cn("h-4 w-4", cashFlowDirection === "outgoing" ? "text-rose-500" : "text-rose-500/60")} />
            <span>Зобов'язання</span>
          </button>
        </div>
      </div>

      {/* Incoming Payments Tab */}
      {cashFlowDirection === "incoming" && (
        <IncomingPaymentsTab
          cabinet={cabinet}
          onOpenDocument={(docId) => onNavigateToDocumentDetail?.(docId)}
          onOpenRecord={(record) => setSelectedIncomingRecord(record)}
          onNavigateToIncomeBook={onNavigateToIncomeBook}
          onChatPromptInsert={onChatPromptInsert}
        />
      )}

      {/* Outgoing Payments Content */}
      {cashFlowDirection === "outgoing" && (
        <>
          {/* Compact Smart Header: KPI chips + Actions */}
          <PaymentsKPISection
            taxPayments={taxPayments}
            salaryPayments={salaryPayments}
            contractorPayments={contractorPayments}
            pendingPaymentsCount={pendingPaymentsCount}
            onOpenSmartInbox={() => setSmartInboxOpen(true)}
            onCreatePayment={handleCreatePayment}
          />

          {/* Smart Inbox Drawer */}
          <Sheet open={smartInboxOpen} onOpenChange={setSmartInboxOpen}>
            <SheetContent side="responsive-right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Черга платежів</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <PaymentQueueCard
                  taxPayments={taxPayments}
                  salaryPayments={salaryPayments}
                  contractorPayments={contractorPayments}
                  onApprovePayment={(id, type) => {
                    handleOpenApproval(id, type);
                    setSmartInboxOpen(false);
                  }}
                  onViewDetails={(id, type) => {
                    if (type === "tax") {
                      const p = taxPayments.find(t => t.id === id);
                      if (p) handleOpenPayment(p, "tax");
                    }
                    setSmartInboxOpen(false);
                  }}
                  className="border-0 shadow-none p-0"
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Level 2: Payment Mode Segment Control */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 p-1 bg-muted/30 dark:bg-muted/20 border border-border/30 rounded-full">
              {modeConfig.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                      isActive
                        ? "bg-card text-foreground shadow-sm border border-border/50"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 transition-colors", isActive && "text-primary")} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeMode === "tax" && (
            <TaxPaymentsTab 
              payments={taxPayments}
              onOpenPayment={(p) => handleOpenPayment(p, "tax")}
              onNavigateToReport={handleNavigateToReport}
            />
          )}
          
          {activeMode === "contractor" && (
            <ContractorPaymentsTab 
              payments={contractorPayments}
              onOpenPayment={(p) => handleOpenPayment(p, "contractor")}
            />
          )}
          
          {activeMode === "salary" && (
            <SalaryPaymentsTab 
              payments={salaryPayments}
              onOpenPayment={(p) => handleOpenPayment(p, "salary")}
              onNavigateToEmployee={handleNavigateToEmployee}
            />
          )}
        </>
      )}

      {/* Деталі платежу — уніфікований sheet */}
      <UniversalPaymentDetailSheet
        open={!!selectedUnifiedPayment}
        onOpenChange={(open) => !open && setSelectedUnifiedPayment(null)}
        payment={selectedUnifiedPayment}
        onNavigateToEmployee={handleNavigateToEmployee}
        onNavigateToIncomeBook={onNavigateToIncomeBook}
        onNavigateToReport={handleNavigateToReport}
        onExplainInChat={handleExplainInChat}
      />

      {/* AI Approval Sheet */}
      <PaymentApprovalSheet
        open={!!approvalPayment}
        onOpenChange={(open) => !open && setApprovalPayment(null)}
        payment={approvalPayment}
        onApprove={() => {
          toast({ title: "Платіж підтверджено", description: "Готовий до відправки в банк" });
          setApprovalPayment(null);
        }}
        onExplainInChat={handleExplainInChat}
      />

      {/* Incoming Record Details Sheet */}
      <OperationDetailsSheet
        open={!!selectedIncomingRecord}
        onOpenChange={(open) => !open && setSelectedIncomingRecord(null)}
        record={selectedIncomingRecord}
        onChatPromptInsert={onChatPromptInsert}
      />
    </div>
  );
}
