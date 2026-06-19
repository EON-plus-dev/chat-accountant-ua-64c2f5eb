import { useState } from "react";
import { CreditCard, CheckCircle2, Clock, AlertCircle, CheckCheck, Zap, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { formatCurrency } from "@/lib/formatters";
import type { Report } from "@/config/reportsConfig";
import { migrateReportStatus } from "@/config/reportsConfig";
import { getPaymentDiscipline as computePaymentDiscipline, type DisciplineKind } from "@/lib/paymentDiscipline";
import { getRelatedPayments, getReportPaymentTotals, type RelatedPayment } from "@/lib/reportPayments";
import { MarkAsPaidDialog, type MarkAsPaidFormValues } from "./MarkAsPaidDialog";

export interface MarkPaidPayload extends MarkAsPaidFormValues {
  paymentType: "ep" | "esv" | "vz";
  paymentTypeLabel: string;
}

interface RelatedPaymentsSectionProps {
  report: Report;
  onNavigateToPayment?: (paymentId: string) => void;
  onMarkPaid?: (reportId: string, data: MarkPaidPayload) => void;
  /** Зовнішнє керування модалкою оплати (з PayActionBar). Якщо не передано — компонент керує сам. */
  payDialogOpen?: boolean;
  onPayDialogOpenChange?: (open: boolean) => void;
}

const statusConfig = {
  paid: {
    icon: CheckCircle2,
    label: "Сплачено",
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  },
  pending: {
    icon: Clock,
    label: "Очікує",
    className: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
  },
  overdue: {
    icon: AlertCircle,
    label: "Прострочено",
    className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30",
  },
};

function getPaymentDiscipline(
  paidDate: string,
  deadline: string,
): { kind: DisciplineKind; label: string; tooltip: string; daysDiff: number } {
  const { kind, daysDiff } = computePaymentDiscipline(paidDate, deadline);
  if (kind === "early") {
    const n = Math.abs(daysDiff);
    return {
      kind,
      label: `Достроково (за ${n} дн.)`,
      tooltip: `Сплачено за ${n} днів до терміну`,
      daysDiff,
    };
  }
  if (kind === "on-time") {
    return {
      kind,
      label: "Вчасно",
      tooltip: daysDiff === 0
        ? "Сплачено в день терміну"
        : `Сплачено за ${Math.abs(daysDiff)} дн. до терміну`,
      daysDiff,
    };
  }
  return {
    kind,
    label: `Із запізненням (+${daysDiff} дн.)`,
    tooltip: `Сплачено через ${daysDiff} дн. після терміну`,
    daysDiff,
  };
}

const disciplineStyles: Record<DisciplineKind, { className: string; Icon: typeof CheckCircle2 }> = {
  early: {
    className: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50",
    Icon: Zap,
  },
  "on-time": {
    className: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50",
    Icon: CheckCircle2,
  },
  late: {
    className: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50",
    Icon: Clock,
  },
};

export function RelatedPaymentsSection({
  report,
  onNavigateToPayment,
  onMarkPaid,
  payDialogOpen: payDialogOpenProp,
  onPayDialogOpenChange,
}: RelatedPaymentsSectionProps) {
  const payments = getRelatedPayments(report);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePayment, setActivePayment] = useState<RelatedPayment | null>(null);
  const [expandedPaid, setExpandedPaid] = useState(false);
  const [internalPayDialogOpen, setInternalPayDialogOpen] = useState(false);

  // Controlled / uncontrolled pay-dialog state
  const payDialogOpen = payDialogOpenProp ?? internalPayDialogOpen;
  const setPayDialogOpen = (next: boolean) => {
    if (onPayDialogOpenChange) onPayDialogOpenChange(next);
    else setInternalPayDialogOpen(next);
  };

  if (payments.length === 0) {
    return null;
  }

  const totals = getReportPaymentTotals(report);
  const totalAmount = totals.total;
  const paidAmount = totals.paid;
  const pendingAmount = totals.pending;
  const allPaid = totals.allPaid;

  // Видимість primary-CTA «Сплатити»: звіт уже подано до ДПС і є залишок.
  const reportStatus = migrateReportStatus(report.status);
  const canPay = pendingAmount > 0 &&
    (reportStatus === "submitted" || reportStatus === "accepted" || reportStatus === "rejected");

  // Discipline aggregate
  const paidDisciplines = payments
    .filter(p => p.status === "paid" && p.paidDate)
    .map(p => getPaymentDiscipline(p.paidDate!, p.deadline));
  const lateCount = paidDisciplines.filter(d => d.kind === "late").length;
  const hasDisciplineData = paidDisciplines.length > 0;
  const allOnTime = hasDisciplineData && lateCount === 0;

  const handleOpenMarkPaid = (payment: RelatedPayment) => {
    setActivePayment(payment);
    setDialogOpen(true);
  };

  const handleConfirmPaid = (data: MarkAsPaidFormValues) => {
    if (!activePayment || !onMarkPaid) return;
    onMarkPaid(report.id, {
      ...data,
      paymentType: activePayment.type,
      paymentTypeLabel: activePayment.typeLabel,
    });
  };

  // Швидкий «Mark paid» з PayDialog (без додаткової форми — просто реєструємо факт)
  const handleQuickMarkPaid = (payment: RelatedPayment) => {
    setActivePayment(payment);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2 min-w-0">
              <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">Платежі</span>
            </CardTitle>
            {pendingAmount > 0 ? (
              <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 shrink-0">
                До сплати: {formatCurrency(pendingAmount)}
              </Badge>
            ) : allOnTime ? (
              <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 shrink-0 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Сплачено · Усі вчасно
              </Badge>
            ) : lateCount > 0 ? (
              <Badge variant="secondary" className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 shrink-0 gap-1">
                <Clock className="h-3 w-3" />
                Сплачено · {lateCount} із запізненням
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 shrink-0 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Сплачено
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Primary CTA «Сплатити» — нагорі, одразу після header (тільки після подання до ДПС) */}
          {canPay && (
            <Button
              size="sm"
              className="w-full h-9 gap-1.5"
              onClick={() => setPayDialogOpen(true)}
            >
              <Banknote className="h-3.5 w-3.5" />
              Сплатити {formatCurrency(pendingAmount)}
            </Button>
          )}

          {/* Колапс all-paid: однорядковий підсумок замість списку */}
          {allPaid && !expandedPaid ? (
            <button
              type="button"
              onClick={() => setExpandedPaid(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm">
                  {payments.length} {payments.length === 1 ? "платіж" : payments.length < 5 ? "платежі" : "платежів"} · {formatCurrency(totalAmount)} · {lateCount > 0 ? `${lateCount} із запізненням` : "Усі вчасно"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">Розгорнути</span>
            </button>
          ) : (
            payments.map((payment) => {
              const config = statusConfig[payment.status];
              const Icon = config.icon;
              const canMarkPaid = payment.status !== "paid" && !!onMarkPaid;

              return (
                <div
                  key={payment.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                    onNavigateToPayment && "hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn("flex items-center gap-2 flex-1 min-w-0", onNavigateToPayment && "cursor-pointer")}
                    onClick={() => onNavigateToPayment?.(payment.id)}
                  >
                    <div className={cn("p-1.5 rounded-md shrink-0", config.className)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{payment.typeLabel}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[11px] text-muted-foreground truncate">
                          {payment.status === "paid" && payment.paidDate
                            ? `Сплачено ${format(new Date(payment.paidDate), "dd.MM.yyyy", { locale: uk })}`
                            : `до ${format(new Date(payment.deadline), "dd.MM.yyyy", { locale: uk })}`
                          }
                        </p>
                        {payment.status === "paid" && payment.paidDate && (() => {
                          const disc = getPaymentDiscipline(payment.paidDate, payment.deadline);
                          const { className: discClass, Icon: DiscIcon } = disciplineStyles[disc.kind];
                          return (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-0.5 rounded border px-1.5 py-0 text-[10px] font-medium leading-4 cursor-help",
                                      discClass,
                                    )}
                                  >
                                    <DiscIcon className="h-2.5 w-2.5" />
                                    {disc.label}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>{disc.tooltip}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={cn(
                      "font-semibold text-sm",
                      payment.status === "paid" && "text-emerald-600 dark:text-emerald-400",
                      payment.status === "overdue" && "text-red-600 dark:text-red-400"
                    )}>
                      {formatCurrency(payment.amount)}
                    </span>
                    {canMarkPaid && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              onClick={(e) => { e.stopPropagation(); handleOpenMarkPaid(payment); }}
                              aria-label="Позначити як сплачено"
                            >
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Позначити як сплачено</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Підсумок — показуємо лише якщо є pending або список розгорнутий */}
          {(!allPaid || expandedPaid) && (
            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Загалом за звіт</span>
              <span className="font-bold text-sm">{formatCurrency(totalAmount)}</span>
            </div>
          )}

          {allPaid && expandedPaid && (
            <button
              type="button"
              onClick={() => setExpandedPaid(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
            >
              Згорнути
            </button>
          )}

          {/* Primary CTA перенесено нагору CardContent (одразу після header) */}

          {/* Secondary: перейти до сторінки платежів */}
          {onNavigateToPayment && pendingAmount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => onNavigateToPayment("all")}
            >
              Перейти до платежів
            </Button>
          )}
        </CardContent>
      </Card>

      {activePayment && (
        <MarkAsPaidDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          paymentLabel={`${activePayment.typeLabel} • ${report.periodLabel ?? ""}`.trim()}
          defaultAmount={activePayment.amount}
          onConfirm={handleConfirmPaid}
          paymentType={activePayment.type}
          period={report.periodLabel}
          reportId={report.id}
        />
      )}

    </>
  );
}
