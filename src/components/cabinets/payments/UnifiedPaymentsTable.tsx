/**
 * Unified Payments Table
 * Polymorphic table displaying all payment types with consistent columns:
 * Date | Counterparty(+code) | Purpose(+document) | Type | Amount | Deadline/PaidDate | Status
 */

import { useMemo } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { uk } from "date-fns/locale";
import { ExternalLink, FileText, AlertTriangle, Wallet } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSortState } from "@/hooks/use-sort-state";
import {
  type UnifiedPayment,
  paymentTypeConfig,
  directionConfig,
  unifiedStatusConfig,
  isTaxPayment,
  isContractorPayment,
  isIncomeBookRecord,
} from "@/config/unifiedPaymentsConfig";
import { PaymentRowActions, type PaymentRowActionHandlers } from "./PaymentRowActions";
import { inferCurrency, formatMoney, formatUahApprox, CURRENCY_SYMBOLS } from "@/lib/paymentsCurrency";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";

export interface PaymentsSummary {
  count: number;
  totalIn: number;
  totalOut: number;
  netFlow: number;
  toPay: number;
  overdue: number;
  expectedIn: number;
  countIn?: number;
  countOut?: number;
}

interface UnifiedPaymentsTableProps {
  payments: UnifiedPayment[];
  onRowClick: (payment: UnifiedPayment) => void;
  summary?: PaymentsSummary;
  className?: string;
  onNavigateToReport?: (reportId: string) => void;
  /** Multi-select: коли передано — рендериться колонка чекбоксів. */
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (visibleIds: string[]) => void;
  /** Quick-actions handlers — коли передано, рендериться колонка «...». */
  rowActions?: PaymentRowActionHandlers;
}

type SortKey = "date" | "counterparty" | "paymentType" | "amount" | "deadline";

/** Колір точки-індикатора статусу. */
function getStatusDotClass(status: string): string {
  switch (status) {
    case "paid":
    case "income":
    case "received":
    case "completed":
      return "bg-emerald-500";
    case "overdue":
      return "bg-rose-500";
    case "scheduled":
    case "pending":
    case "upcoming":
      return "bg-amber-500";
    case "draft":
      return "bg-muted-foreground/40";
    default:
      return "bg-muted-foreground/60";
  }
}

/** Контрагент: для всіх типів повертає реальну сторону (а не entityName-дубль). */
function getCounterparty(payment: UnifiedPayment): string {
  const data = payment.sourceData;
  if (isContractorPayment(data)) return data.contractor;
  if (isIncomeBookRecord(data)) return data.contractor || "—";
  if (isTaxPayment(data)) return "ДПС України";
  // salary
  return payment.entityName;
}

/** Призначення: основний рядок — суть операції; підрядок — № документа/звіту. */
function getPurpose(payment: UnifiedPayment): { primary: string; secondary?: string } {
  const data = payment.sourceData;

  // Для податків entityName = «ЄП за I кв.» — це і є призначення
  if (isTaxPayment(data)) {
    return {
      primary: payment.entityName,
      secondary: payment.relatedReportId ? `Звіт ${payment.relatedReportId}` : payment.period,
    };
  }

  // Зарплата: тип виплати + період
  if (payment.paymentType === "salary") {
    return {
      primary: payment.description || "Виплата зарплати",
      secondary: payment.period,
    };
  }

  // Контрагент / надходження / повернення: description + № документа
  let secondary: string | undefined;
  if (payment.relatedDocumentNumber) {
    secondary = `Док. №${payment.relatedDocumentNumber}`;
  } else if (isIncomeBookRecord(data) && data.relatedDocument) {
    const typeLabel =
      data.relatedDocument.type === "invoice" ? "Рахунок" :
      data.relatedDocument.type === "act" ? "Акт" :
      data.relatedDocument.type === "contract" ? "Договір" : "Чек";
    secondary = `${typeLabel} №${data.relatedDocument.number}`;
  } else if (payment.relatedReportId) {
    secondary = `Звіт ${payment.relatedReportId}`;
  }

  return {
    primary: payment.description || "—",
    secondary,
  };
}

/** Реальний дедлайн (для tax-out — sourceData.deadline; для решти — date). */
function getDeadlineTimestamp(payment: UnifiedPayment): number {
  const data = payment.sourceData;
  if (isTaxPayment(data) && payment.direction === "out") {
    return new Date(data.deadline).getTime();
  }
  return new Date(payment.date).getTime();
}

function getDeadlineCell(payment: UnifiedPayment): { text: string; tone: "neutral" | "danger" | "warn" | "success" } {
  const data = payment.sourceData;

  if (payment.direction === "in") {
    return { text: format(new Date(payment.date), "dd.MM.yy"), tone: "success" };
  }

  if (payment.status === "paid") {
    return { text: format(new Date(payment.date), "dd.MM.yy"), tone: "neutral" };
  }

  if (isTaxPayment(data)) {
    const deadline = new Date(data.deadline);
    const today = new Date();
    const daysLeft = differenceInCalendarDays(deadline, today);
    if (daysLeft < 0) return { text: `${Math.abs(daysLeft)} дн. простр.`, tone: "danger" };
    if (daysLeft === 0) return { text: "Сьогодні", tone: "danger" };
    if (daysLeft <= 3) return { text: `${daysLeft} дн.`, tone: "warn" };
    return { text: `${daysLeft} дн.`, tone: "neutral" };
  }

  return { text: format(new Date(payment.date), "dd.MM.yy"), tone: "neutral" };
}

export function UnifiedPaymentsTable({
  payments,
  onRowClick,
  summary,
  className,
  onNavigateToReport,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  rowActions,
}: UnifiedPaymentsTableProps) {
  const selectionEnabled = !!selectedIds && !!onToggleSelect;
  const actionsEnabled = !!rowActions;
  const { sort, handleSort } = useSortState<SortKey>("date", "desc");

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sort.key) {
        case "date":
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case "counterparty":
          aVal = getCounterparty(a).toLowerCase();
          bVal = getCounterparty(b).toLowerCase();
          break;
        case "paymentType":
          aVal = a.paymentType;
          bVal = b.paymentType;
          break;
        case "amount":
          aVal = Math.abs(a.amount);
          bVal = Math.abs(b.amount);
          break;
        case "deadline":
          aVal = getDeadlineTimestamp(a);
          bVal = getDeadlineTimestamp(b);
          break;
        default:
          return 0;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal), "uk");
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [payments, sort]);

  if (payments.length === 0) {
    return (
      <div className="border rounded-lg">
        <TableEmptyState
          icon={Wallet}
          title="Немає платежів"
          description="За вашим запитом платежів не знайдено"
        />
      </div>
    );
  }

  

  return (
    <div className={cn("border border-border/70 rounded-lg overflow-hidden", className)}>
      <Table containerClassName="overflow-auto" className="table-fixed min-w-[640px]">
        <colgroup>
          {selectionEnabled && <col className="w-[36px]" />}
          <col className="w-[12%] min-w-[80px]" />
          <col className="w-[55%]" />
          <col className="w-[14%] min-w-[80px]" />
          <col className="w-[19%] min-w-[120px]" />
          {actionsEnabled && <col className="w-[44px]" />}
        </colgroup>
        <TableHeader sticky>
          <TableRow className="hover:bg-transparent">
            {selectionEnabled && (
              <TableHead compact>
                <Checkbox
                  checked={
                    sortedPayments.length > 0 &&
                    sortedPayments.every((p) => selectedIds!.has(p.id))
                      ? true
                      : sortedPayments.some((p) => selectedIds!.has(p.id))
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={() =>
                    onToggleSelectAll?.(sortedPayments.map((p) => p.id))
                  }
                  aria-label="Виділити усі"
                />
              </TableHead>
            )}
            <TableHead
              compact
              sortable
              onSort={() => handleSort("date")}
              sorted={sort.key === "date"}
              sortDirection={sort.key === "date" ? sort.direction : null}
            >
              <span className="inline-flex items-center gap-1">
                Дата
                <SortIndicator active={sort.key === "date"} direction={sort.direction} />
              </span>
            </TableHead>

            <TableHead
              compact
              sortable
              onSort={() => handleSort("counterparty")}
              sorted={sort.key === "counterparty"}
              sortDirection={sort.key === "counterparty" ? sort.direction : null}
            >
              <span className="inline-flex items-center gap-1">
                Контрагент / Призначення
                <SortIndicator active={sort.key === "counterparty"} direction={sort.direction} />
              </span>
            </TableHead>

            <TableHead
              compact
              sortable
              onSort={() => handleSort("paymentType")}
              sorted={sort.key === "paymentType"}
              sortDirection={sort.key === "paymentType" ? sort.direction : null}
            >
              <span className="inline-flex items-center gap-1">
                Тип
                <SortIndicator active={sort.key === "paymentType"} direction={sort.direction} />
              </span>
            </TableHead>

            <TableHead
              compact
              sortable
              numeric
              onSort={() => handleSort("amount")}
              sorted={sort.key === "amount"}
              sortDirection={sort.key === "amount" ? sort.direction : null}
            >
              <span className="inline-flex items-center gap-1">
                Сума
                <SortIndicator active={sort.key === "amount"} direction={sort.direction} />
              </span>
            </TableHead>

            {actionsEnabled && (
              <TableHead compact>
                <span className="sr-only">Дії</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedPayments.map((payment) => {
            const typeConfig = paymentTypeConfig[payment.paymentType];
            const dirConfig = directionConfig[payment.direction];
            const statusConfig = unifiedStatusConfig[payment.status] || {
              label: payment.statusLabel,
              badgeClass: "bg-muted text-muted-foreground",
            };
            const counterparty = getCounterparty(payment);
            const purpose = getPurpose(payment);
            const deadline = getDeadlineCell(payment);
            const isOverdue = payment.status === "overdue";
            const showDeadlineBadge =
              payment.direction === "out" &&
              payment.status !== "paid" &&
              (deadline.tone === "danger" || deadline.tone === "warn");

            return (
              <TableRow
                key={payment.id}
                data-state={selectionEnabled && selectedIds!.has(payment.id) ? "selected" : undefined}
                className={cn(
                  "cursor-pointer",
                  isOverdue && "border-l-2 border-l-rose-500"
                )}
                onClick={() => onRowClick(payment)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(payment);
                  }
                }}
              >
                {selectionEnabled && (
                  <TableCell
                    compact
                    className="w-[36px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedIds!.has(payment.id)}
                      onCheckedChange={() => onToggleSelect?.(payment.id)}
                      aria-label="Виділити рядок"
                    />
                  </TableCell>
                )}
                {/* Date + inline deadline badge for unpaid hot tax */}
                <TableCell compact className="align-top">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {format(new Date(payment.date), "dd.MM.yy", { locale: uk })}
                    </span>
                    {showDeadlineBadge && (
                      <span className={cn(
                        "text-[10px] font-medium tabular-nums",
                        deadline.tone === "danger" && "text-rose-600 dark:text-rose-400",
                        deadline.tone === "warn" && "text-amber-600 dark:text-amber-400",
                      )}>
                        {deadline.text}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Counterparty (top) + Purpose (bottom) merged */}
                <TableCell compact>
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{counterparty}</span>
                      {payment.entityCode && (
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {payment.entityCode.length === 8 ? "ЄДРПОУ" : "ІПН"} {payment.entityCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 min-w-0 text-[11px] text-muted-foreground">
                      <span className="truncate">{purpose.primary}</span>
                      {purpose.secondary && (
                        <>
                          <span className="opacity-50">·</span>
                          <span className="inline-flex items-center gap-0.5 truncate">
                            <FileText className="h-3 w-3 shrink-0" />
                            {purpose.secondary}
                          </span>
                        </>
                      )}
                      {payment.relatedReportId && onNavigateToReport && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToReport(payment.relatedReportId!);
                          }}
                          className="inline-flex items-center gap-0.5 text-primary hover:underline shrink-0 ml-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          звіт
                        </button>
                      )}
                      {payment.direction === "in" && payment.status === "needs-clarification" && rowActions?.onClarify && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            rowActions.onClarify?.(payment);
                          }}
                          className="inline-flex items-center gap-0.5 text-primary hover:underline shrink-0 ml-1 font-medium"
                        >
                          Розпізнати →
                        </button>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Type Badge */}
                <TableCell compact>
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={cn("font-medium", typeConfig.badgeClass)}
                  >
                    {typeConfig.shortLabel}
                  </Badge>
                </TableCell>

                {/* Amount: основна валюта + UAH-еквівалент + санкції для overdue tax */}
                <TableCell compact numeric>
                  {(() => {
                    const currency = inferCurrency(payment);
                    const isForeign = currency !== "UAH";
                    const sign = payment.direction === "in" ? "+" : "−";
                    const main = `${sign}${CURRENCY_SYMBOLS[currency]}${payment.amount.toLocaleString("uk-UA")}`;
                    const approx = formatUahApprox(payment.amount, currency);

                    // Tax penalty for overdue
                    let penaltyBadge: React.ReactNode = null;
                    if (
                      payment.status === "overdue" &&
                      isTaxPayment(payment.sourceData) &&
                      payment.direction === "out"
                    ) {
                      const days = Math.abs(
                        differenceInCalendarDays(new Date(payment.sourceData.deadline), new Date()),
                      );
                      const p = calcTaxPenalty(payment.amount, days);
                      if (p.total > 0) {
                        penaltyBadge = (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums text-rose-600 dark:text-rose-400 hover:underline"
                              >
                                <AlertTriangle className="h-2.5 w-2.5" />
                                +₴{p.total.toLocaleString("uk-UA")}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="left"
                              align="end"
                              className="w-64 text-xs space-y-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-semibold text-sm text-foreground">
                                Санкції за прострочення
                              </div>
                              <div className="text-muted-foreground">
                                Прострочено {p.daysOverdue} {p.daysOverdue === 1 ? "день" : "дн."}
                              </div>
                              <div className="border-t border-border/60 pt-1.5 space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Пеня ({p.formula})</span>
                                  <span className="tabular-nums font-medium">₴{p.penalty.toLocaleString("uk-UA")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Штраф ({(p.finePercent * 100).toFixed(0)}%)
                                  </span>
                                  <span className="tabular-nums font-medium">₴{p.fine.toLocaleString("uk-UA")}</span>
                                </div>
                                <div className="flex justify-between border-t border-border/60 pt-1 font-semibold text-foreground">
                                  <span>Разом до сплати</span>
                                  <span className="tabular-nums text-rose-600 dark:text-rose-400">
                                    ₴{(payment.amount + p.total).toLocaleString("uk-UA")}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10px] text-muted-foreground pt-1">
                                Розрахунок згідно ст. 124, 129 ПКУ. Облікова ставка НБУ 13,5%.
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      }
                    }

                    return (
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    "inline-block h-2 w-2 rounded-full shrink-0",
                                    getStatusDotClass(payment.status)
                                  )}
                                  aria-label={statusConfig.label}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="left">{statusConfig.label}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className={cn("font-medium tabular-nums", dirConfig.amountClass)}>
                            {main}
                          </span>
                        </div>
                        {(approx || penaltyBadge) && (
                          <div className="flex items-center gap-2 text-[10px] tabular-nums leading-none">
                            {approx && (
                              <span className="text-muted-foreground">{approx}</span>
                            )}
                            {penaltyBadge}
                          </div>
                        )}
                        {isForeign && (
                          <Badge
                            variant="outline"
                            className="h-3.5 px-1 text-[9px] font-medium border-border/60 text-muted-foreground"
                          >
                            {currency}
                          </Badge>
                        )}
                      </div>
                    );
                  })()}
                </TableCell>

                {actionsEnabled && (
                  <TableCell compact className="w-[44px]" onClick={(e) => e.stopPropagation()}>
                    <PaymentRowActions payment={payment} {...rowActions!} />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>

      </Table>
    </div>
  );
}
