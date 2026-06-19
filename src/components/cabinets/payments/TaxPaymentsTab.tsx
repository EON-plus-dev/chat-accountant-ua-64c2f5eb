import { useState, useMemo } from "react";
import { ExternalLink, MoreHorizontal, FileText, CheckCircle2, Calculator, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type TaxPayment,
  type TaxType,
  taxTypeConfig,
  paymentStatusConfig,
  getPaymentDeadlineUrgency,
  taxBudgetCodes,
  formatIban,
} from "@/config/paymentsConfig";
import { getBadgeColorClasses } from "@/config/semanticStyles";
import { effectiveTaxStatus, daysToDeadline } from "@/lib/taxStatus";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";
import { taxFormula, taxFullName, humanizeDeadline } from "@/components/cabinets/taxes/taxFormulas";

interface TaxPaymentsTabProps {
  payments: TaxPayment[];
  onOpenPayment: (payment: TaxPayment) => void;
  /** Якщо переданий — клік по рядку/картці відкриває TaxDetailSheet (а не платіжний sheet). */
  onOpenTaxDetail?: (payment: TaxPayment) => void;
  onNavigateToReport?: (reportId: string) => void;
  onNavigateToIncomeBook?: (periodStart: string, periodEnd: string) => void;

  // Controlled filters (опційно — якщо не передано, працює локальний state)
  yearFilter?: string;
  onYearFilterChange?: (v: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (v: string) => void;
  taxTypeFilter?: string;
  onTaxTypeFilterChange?: (v: string) => void;
  /** Сховати селектор року (коли парент сам ним керує) */
  hideYearSelector?: boolean;
  /** Зовнішній фільтр (наприклад пошук з парента) — застосовується додатково. */
  externalFilter?: (p: TaxPayment) => boolean;
}

const yearOptions = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

const periodOptions = [
  { value: "all", label: "Усі періоди" },
  // Квартали
  { value: "Q1", label: "І квартал" },
  { value: "Q2", label: "ІІ квартал" },
  { value: "Q3", label: "ІІІ квартал" },
  { value: "Q4", label: "IV квартал" },
  // Місяці
  { value: "M01", label: "Січень" },
  { value: "M02", label: "Лютий" },
  { value: "M03", label: "Березень" },
  { value: "M04", label: "Квітень" },
  { value: "M05", label: "Травень" },
  { value: "M06", label: "Червень" },
  { value: "M07", label: "Липень" },
  { value: "M08", label: "Серпень" },
  { value: "M09", label: "Вересень" },
  { value: "M10", label: "Жовтень" },
  { value: "M11", label: "Листопад" },
  { value: "M12", label: "Грудень" },
];

const statusOptions = [
  { value: "all", label: "Усі статуси" },
  { value: "overdue", label: "Прострочені" },
  { value: "due", label: "До сплати" },
  { value: "paid", label: "Сплачені" },
];

// Категорії податків: ФОП vs ЗП
const taxCategoryOptions = [
  { value: "all", label: "Усі категорії" },
  { value: "fop", label: "Податки ФОП" },
  { value: "salary", label: "Податки ЗП" },
];

const taxTypeOptions = [
  { value: "all", label: "Усі типи" },
  // ФОП
  { value: "ep", label: "ЄП (ФОП)", category: "fop" },
  { value: "esv", label: "ЄСВ ФОП", category: "fop" },
  { value: "military-fop", label: "ВЗ ФОП", category: "fop" },
  // ЗП
  { value: "pdfo", label: "ПДФО (ЗП)", category: "salary" },
  { value: "military", label: "ВЗ (ЗП)", category: "salary" },
  { value: "esv-employer", label: "ЄСВ рб. (ЗП)", category: "salary" },
];

export function TaxPaymentsTab({
  payments,
  onOpenPayment,
  onOpenTaxDetail,
  onNavigateToReport,
  onNavigateToIncomeBook,
  yearFilter: yearFilterProp,
  onYearFilterChange,
  statusFilter: statusFilterProp,
  onStatusFilterChange,
  taxTypeFilter: taxTypeFilterProp,
  onTaxTypeFilterChange,
  hideYearSelector = false,
  externalFilter,
}: TaxPaymentsTabProps) {
  const handleRowOpen = (p: TaxPayment) =>
    onOpenTaxDetail ? onOpenTaxDetail(p) : onOpenPayment(p);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [yearFilterLocal, setYearFilterLocal] = useState("2026");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [taxCategoryFilter, setTaxCategoryFilter] = useState("all");
  const [taxTypeFilterLocal, setTaxTypeFilterLocal] = useState("all");
  const [statusFilterLocal, setStatusFilterLocal] = useState("all");

  const yearFilter = yearFilterProp ?? yearFilterLocal;
  const setYearFilter = onYearFilterChange ?? setYearFilterLocal;
  const statusFilter = statusFilterProp ?? statusFilterLocal;
  const setStatusFilter = onStatusFilterChange ?? setStatusFilterLocal;
  const taxTypeFilter = taxTypeFilterProp ?? taxTypeFilterLocal;
  const setTaxTypeFilter = onTaxTypeFilterChange ?? setTaxTypeFilterLocal;

  // Filter tax types based on selected category
  const filteredTaxTypeOptions = useMemo(() => {
    if (taxCategoryFilter === "all") return taxTypeOptions;
    return taxTypeOptions.filter(opt => opt.value === "all" || opt.category === taxCategoryFilter);
  }, [taxCategoryFilter]);

  // Канонічна категоризація — з taxTypeConfig
  const getTaxCategory = (taxType: TaxType): "fop" | "salary" => {
    return taxTypeConfig[taxType]?.category === "fop" ? "fop" : "salary";
  };

  const filteredPayments = useMemo(() => {
    const today = new Date();
    return payments.filter((p) => {
      if (p.year !== parseInt(yearFilter)) return false;

      if (periodFilter !== "all") {
        if (periodFilter.startsWith("Q")) {
          if (p.quarter !== parseInt(periodFilter.replace("Q", ""))) return false;
        } else if (periodFilter.startsWith("M")) {
          const monthNum = parseInt(periodFilter.replace("M", ""));
          if (p.month !== monthNum) return false;
        }
      }

      if (taxCategoryFilter !== "all") {
        if (getTaxCategory(p.taxType) !== taxCategoryFilter) return false;
      }

      if (taxTypeFilter !== "all" && p.taxType !== taxTypeFilter) return false;

      if (statusFilter !== "all") {
        const eff = effectiveTaxStatus(p, today);
        if (statusFilter === "overdue" && eff !== "overdue") return false;
        if (statusFilter === "due" && eff !== "due" && eff !== "open") return false;
        if (statusFilter === "paid" && eff !== "paid") return false;
      }

      if (externalFilter && !externalFilter(p)) return false;

      return true;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [payments, yearFilter, periodFilter, taxCategoryFilter, taxTypeFilter, statusFilter, externalFilter]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("uk-UA").format(amount) + " ₴";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
  };

  const handleCreatePayment = (payment: TaxPayment) => {
    toast({
      title: "Демо-режим",
      description: `Платіж "${payment.taxTypeLabel} за ${payment.period}" буде створено`,
    });
  };

  const handleMarkAsPaid = (payment: TaxPayment) => {
    toast({
      title: "Демо-режим",
      description: `Платіж "${payment.taxTypeLabel}" позначено як оплачено`,
    });
  };

  const handleCopyKbk = (payment: TaxPayment) => {
    const kbkConfig = taxBudgetCodes[payment.taxType];
    if (kbkConfig) {
      navigator.clipboard.writeText(kbkConfig.code);
      toast({
        title: "Скопійовано",
        description: `КБК ${kbkConfig.code} скопійовано в буфер`,
      });
    }
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {!hideYearSelector && (
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={taxTypeFilter} onValueChange={setTaxTypeFilter}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taxTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards */}
        {filteredPayments.length === 0 ? (
          <TableEmptyState title="Немає платежів" description="Платежі за обраний період відсутні" />
        ) : (
          <div className="space-y-2">
            {filteredPayments.map((payment) => {
              const urgency = getPaymentDeadlineUrgency(payment.deadline);
              const taxConfig = taxTypeConfig[payment.taxType];
              const fullName = taxFullName[payment.taxType] ?? taxConfig.label;
              const human = humanizeDeadline(daysToDeadline(payment));
              const eff = effectiveTaxStatus(payment);
              const accent =
                eff === "overdue"
                  ? "border-l-rose-500"
                  : eff === "due"
                    ? "border-l-amber-500"
                    : eff === "paid"
                      ? "border-l-emerald-500"
                      : "border-l-border";
              const statusTone =
                eff === "overdue"
                  ? "text-rose-600 dark:text-rose-400"
                  : eff === "paid"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground";
              const urgencyClass =
                urgency === "urgent" || urgency === "past"
                  ? "text-rose-600 dark:text-rose-400"
                  : urgency === "warning"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground";

              return (
                <Card
                  key={payment.id}
                  className={cn("cursor-pointer hover:shadow-md transition-shadow border-l-2", accent)}
                  onClick={() => handleRowOpen(payment)}
                >
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge
                        variant="status"
                        className={cn(
                          "h-5 text-[10px] px-1.5 shrink-0",
                          getBadgeColorClasses(taxConfig.color, false),
                        )}
                      >
                        {taxConfig.shortLabel}
                      </Badge>
                      <span className="text-sm font-medium truncate flex-1 min-w-0">
                        {fullName}
                        <span className="text-muted-foreground"> · {payment.period}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums shrink-0">
                        {formatAmount(payment.amountToPay)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={statusTone}>{payment.statusLabel}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className={urgencyClass}>
                        до {formatDate(payment.deadline)} · {human}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {!hideYearSelector && (
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={taxCategoryFilter} onValueChange={(v) => {
          setTaxCategoryFilter(v);
          setTaxTypeFilter("all"); // Reset type when category changes
        }}>
          <SelectTrigger className="w-36 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {taxCategoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={taxTypeFilter} onValueChange={setTaxTypeFilter}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filteredTaxTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <div className="border border-border/70 rounded-lg">
          <TableEmptyState title="Немає платежів" description="Платежі за обраний період відсутні" />
        </div>
      ) : (
        <TooltipProvider>
          <div className="border border-border/70 rounded-lg overflow-hidden">
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead compact style={{ width: "38%" }}>Податок · період</TableHead>
                  <TableHead compact numeric style={{ width: "22%" }}>База → Сума</TableHead>
                  <TableHead compact numeric style={{ width: "12%" }}>Санкції</TableHead>
                  <TableHead compact style={{ width: "12%" }}>Статус</TableHead>
                  <TableHead compact style={{ width: "12%" }}>Дедлайн</TableHead>
                  <TableHead compact style={{ width: "4%" }}></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const StatusIcon = paymentStatusConfig[payment.status].icon;
                  const urgency = getPaymentDeadlineUrgency(payment.deadline);
                  const taxConfig = taxTypeConfig[payment.taxType];
                  const kbkConfig = taxBudgetCodes[payment.taxType];
                  const category = getTaxCategory(payment.taxType);
                  const fullName = taxFullName[payment.taxType] ?? taxConfig.label;
                  const formula = taxFormula[payment.taxType] ?? taxConfig.description;
                  const days = daysToDeadline(payment);
                  const human = humanizeDeadline(days);

                  return (
                    <TableRow
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => handleRowOpen(payment)}
                    >
                      {/* Податок · період — повна назва, формула, бейджі без hover */}
                      <TableCell compact>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant="status"
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                category === "fop"
                                  ? "border border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
                                  : "border border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400",
                              )}
                            >
                              {category === "fop" ? "ФОП" : "ЗП"}
                            </Badge>
                            <Badge variant="status" className={cn("text-[10px] px-1.5 py-0", getBadgeColorClasses(taxConfig.color, false))}>
                              {taxConfig.shortLabel}
                            </Badge>
                            <span className="text-sm font-medium text-foreground truncate">
                              {fullName}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {formula} · за {payment.period}
                          </div>
                        </div>
                      </TableCell>

                      {/* База → Сума */}
                      <TableCell compact numeric>
                        {payment.calculatedFromIncome ? (
                          <div className="flex flex-col items-end gap-0">
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              База: {formatAmount(payment.calculatedFromIncome)}
                            </span>
                            <span className="font-semibold tabular-nums text-foreground">
                              × {payment.taxRate ?? taxConfig.rate ?? "—"}% → {formatAmount(payment.amountToPay)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-0">
                            <span className="font-semibold tabular-nums text-foreground">
                              {formatAmount(payment.amountToPay)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              фікс. ставка
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Санкції */}
                      <TableCell compact numeric>
                        {(() => {
                          const eff = effectiveTaxStatus(payment);
                          if (eff !== "overdue") {
                            return <span className="text-muted-foreground">—</span>;
                          }
                          const overdueDays = Math.abs(daysToDeadline(payment));
                          const total = calcTaxPenalty(payment.amountToPay, overdueDays).total;
                          if (total <= 0) return <span className="text-muted-foreground">—</span>;
                          return (
                            <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                              +{formatAmount(total)}
                            </span>
                          );
                        })()}
                      </TableCell>

                      <TableCell compact>
                        <Badge variant="status" className={cn("text-xs", paymentStatusConfig[payment.status].className)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {payment.statusLabel}
                        </Badge>
                      </TableCell>

                      {/* Дедлайн + людська підказка */}
                      <TableCell compact className={cn(
                        "text-sm",
                        urgency === "urgent" && "text-red-600 dark:text-red-400 font-medium",
                        urgency === "warning" && "text-amber-600 dark:text-amber-400",
                        urgency === "past" && "text-red-600 dark:text-red-400",
                      )}>
                        <div className="flex flex-col leading-tight">
                          <span className="tabular-nums">{formatDate(payment.deadline)}</span>
                          <span className="text-[10px] text-muted-foreground">{human}</span>
                        </div>
                      </TableCell>
                      <TableCell compact>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onOpenPayment(payment)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Деталі
                            </DropdownMenuItem>
                            {payment.status === "not-created" && (
                              <DropdownMenuItem onClick={() => handleCreatePayment(payment)}>
                                Створити платіж
                              </DropdownMenuItem>
                            )}
                            {payment.status !== "paid" && payment.status !== "cancelled" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(payment)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Позначити як оплачено
                                </DropdownMenuItem>
                              </>
                            )}
                            {payment.relatedReportId && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onNavigateToReport?.(payment.relatedReportId!)}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Відкрити звіт
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
