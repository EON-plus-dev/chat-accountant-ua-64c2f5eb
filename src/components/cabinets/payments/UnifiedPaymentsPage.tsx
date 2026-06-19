/**
 * Unified Payments Page
 * Single table view for all payment types with contextual KPIs
 */

import { useState, useMemo, useCallback, useRef } from "react";
import { startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter, startOfYear, endOfYear, startOfDay, endOfDay, parseISO, isWithinInterval, format } from "date-fns";
import { uk } from "date-fns/locale";
import type { DateRangeValue } from "@/components/ui/DateRangeFilter";
import { Download, FileSpreadsheet, FileText, X, CheckCircle2, Send, Plus, List, CalendarDays, MoreVertical, Repeat, FileBarChart2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MarkAsPaidDialog } from "./MarkAsPaidDialog";
import { BulkMarkAsPaidDialog } from "./BulkMarkAsPaidDialog";
import { MarkAsReceivedConfirmDialog } from "./MarkAsReceivedConfirmDialog";
import { exportPaymentsToCSV, exportPaymentsToXLSX, exportPaymentsToIBank2UA } from "@/lib/paymentsExport";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import UnifiedFilterPopover, { type FilterSection } from "@/components/ui/UnifiedFilterPopover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UnifiedPaymentsTable } from "./UnifiedPaymentsTable";
import { PaymentsSummaryStrip } from "./PaymentsSummaryStrip";
import { PaymentsHealthyStrip } from "./PaymentsHealthyStrip";
import { UnifiedPaymentCard } from "./UnifiedPaymentCard";
import { UniversalPaymentDetailSheet } from "./UniversalPaymentDetailSheet";
import { PaymentsAttentionInbox } from "./PaymentsAttentionInbox";
import { QuickCreatePaymentDialog, type QuickPaymentType } from "./QuickCreatePaymentDialog";
import { PaymentsCalendarView } from "./PaymentsCalendarView";
import { CashRiskBanner } from "./CashRiskBanner";
import { RecurringPaymentsManager } from "./RecurringPaymentsManager";
import { DeclarationExportDialog } from "./DeclarationExportDialog";
import { usePaymentsAttentionItems } from "./usePaymentsAttentionItems";
import type { PaymentRowActionHandlers } from "./PaymentRowActions";

import { useIsMobile } from "@/hooks/use-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useContainerWidth } from "@/hooks/use-container-width";
import { usePaymentsAccountsBalance } from "@/hooks/usePaymentsAccountsBalance";
import { useCabinetAllPayments } from "@/hooks/useCabinetAllPayments";
import { inferCurrency, toUah, type CurrencyCode } from "@/lib/paymentsCurrency";
import type { Cabinet } from "@/types/cabinet";
import {
  paymentTypeFilterOptions,
  paymentDirectionFilterOptions,
  paymentStatusFilterOptions,
  typesByDirection,
  statusesByDirection,
  type UnifiedPayment,
  type PaymentDirection,
  type UnifiedPaymentType,
} from "@/config/unifiedPaymentsConfig";
import {
  getTaxPaymentsForCabinet,
  getSalaryPaymentsForCabinet,
  getContractorPaymentsForCabinet,
} from "@/config/paymentsConfig";

// Period range helper kept for backwards-compatible label/chip formatting
function formatDateRangeLabel(range: DateRangeValue): string {
  if (!range?.from) return "";
  const from = format(range.from, "dd.MM.yy", { locale: uk });
  const to = range.to ? format(range.to, "dd.MM.yy", { locale: uk }) : from;
  return from === to ? from : `${from} – ${to}`;
}

interface UnifiedPaymentsPageProps {
  cabinet: Cabinet;
  onNavigateToEmployee?: (employeeId: string) => void;
  onNavigateToContractor?: (contractorId: string) => void;
  onNavigateToDocumentDetail?: (documentId: string) => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToReport?: (reportId: string) => void;
  onChatPromptInsert?: (prompt: string) => void;
}

export function UnifiedPaymentsPage({
  cabinet,
  onNavigateToEmployee,
  onNavigateToContractor,
  onNavigateToDocumentDetail,
  onNavigateToIncomeBook,
  onNavigateToReport,
  onChatPromptInsert,
}: UnifiedPaymentsPageProps) {
  const isMobile = useIsMobile();
  // Container-driven adaptation: реагує на фактичну ширину робочого поля
  // (а не viewport), щоб layout перебудовувався при згортанні/розгортанні чату.
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const isCompactView = containerWidth > 0 && containerWidth < 1024;
  const isPassive = cabinet.accessMode === "passive";
  
  // State - for passive cabinets, default to incoming direction
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState<PaymentDirection | "all">(isPassive ? "in" : "all");
  const [typeFilter, setTypeFilter] = useState<UnifiedPaymentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangeValue>(undefined);
  const [contractorFilter, setContractorFilter] = useState<string>("all");
  const [amountFrom, setAmountFrom] = useState<number | "">("");
  const [amountTo, setAmountTo] = useState<number | "">("");
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyCode | "all">("all");
  const [selectedPayment, setSelectedPayment] = useState<UnifiedPayment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<QuickPaymentType>("contractor");
  const [recurringDrawerOpen, setRecurringDrawerOpen] = useState(false);
  const [declarationDialogOpen, setDeclarationDialogOpen] = useState(false);

  // Fix-up: state для real action workflows
  const [paymentToMarkPaid, setPaymentToMarkPaid] = useState<UnifiedPayment | null>(null);
  const [paymentToCancel, setPaymentToCancel] = useState<UnifiedPayment | null>(null);
  const [bulkMarkPaidOpen, setBulkMarkPaidOpen] = useState(false);
  const [bulkPaymentsToMark, setBulkPaymentsToMark] = useState<UnifiedPayment[]>([]);
  const [duplicatePrefill, setDuplicatePrefill] = useState<{ counterparty: string; amount: number; purpose: string } | null>(null);
  const [paymentToMarkReceived, setPaymentToMarkReceived] = useState<UnifiedPayment | null>(null);
  // Доробок A: фокус на блок реквізитів при кліку «Сплатити»
  const [detailFocus, setDetailFocus] = useState<"bank-details" | null>(null);

  // View mode: список / календар (зберігається у localStorage)
  const [viewMode, setViewMode] = useState<"list" | "calendar">(() => {
    if (typeof window === "undefined") return "list";
    const saved = window.localStorage.getItem("payments.viewMode");
    return saved === "calendar" ? "calendar" : "list";
  });
  const handleViewModeChange = useCallback((v: string) => {
    if (!v) return;
    const next = v as "list" | "calendar";
    setViewMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("payments.viewMode", next);
    }
  }, []);

  // Wave 2: поточний баланс рахунків
  const accountsBalance = usePaymentsAccountsBalance(cabinet);

  const openCreateDialog = useCallback((type: QuickPaymentType = "contractor") => {
    setCreateDialogType(type);
    setCreateDialogOpen(true);
  }, []);

  // Quick-actions handlers — reused by row «...» menu
  const rowActions = useMemo<PaymentRowActionHandlers>(() => ({
    onView: (p) => {
      setDetailFocus(null);
      setSelectedPayment(p);
    },
    onPay: (p) => {
      // Доробок A: відкриваємо детальний sheet із фокусом на блок реквізитів
      setDetailFocus("bank-details");
      setSelectedPayment(p);
    },
    onMarkPaid: (p) => {
      // Відкриваємо реальний MarkAsPaidDialog (не toast-заглушка)
      setPaymentToMarkPaid(p);
    },
    onMarkReceived: (p) => {
      // Доробок 3: окремий confirm із вибором категорії доходу
      setPaymentToMarkReceived(p);
    },
    onClarify: (p) => {
      // Поки немає окремого workflow — відкриваємо детальний sheet, де є поля для уточнення
      setDetailFocus(null);
      setSelectedPayment(p);
      toast.info("Розпізнайте платіж", {
        description: "У деталях оберіть контрагента та документ-підставу",
      });
    },
    onDuplicate: (p) => {
      // Префілюємо QuickCreatePaymentDialog даними джерела
      setDuplicatePrefill({
        counterparty: p.entityName ?? "",
        amount: p.amount,
        purpose: p.description ?? "",
      });
      setCreateDialogType(p.paymentType === "tax-fop" || p.paymentType === "tax-salary" ? "tax" : p.paymentType === "salary" ? "salary" : "contractor");
      setCreateDialogOpen(true);
    },
    onCancel: (p) => {
      // Confirm перед деструктивною дією
      setPaymentToCancel(p);
    },
  }), []);

  const toggleSelectId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((visibleIds: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = visibleIds.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      }
      const next = new Set(prev);
      visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Fetch and normalize all payments — спільне джерело з Аналітикою
  const allPayments = useCabinetAllPayments(cabinet);


  // Apply filters
  const filteredPayments = useMemo(() => {
    const periodRange = dateRange?.from
      ? {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to ?? dateRange.from),
        }
      : null;

    return allPayments.filter((payment) => {
      // Period filter
      if (periodRange) {
        try {
          const paymentDate = parseISO(payment.date);
          if (!isWithinInterval(paymentDate, periodRange)) {
            return false;
          }
        } catch {
          // If date parsing fails, include the payment
        }
      }
      
      // Direction filter
      if (directionFilter !== "all" && payment.direction !== directionFilter) {
        return false;
      }
      
      // Type filter with tax grouping
      if (typeFilter !== "all") {
        if (typeFilter === "tax") {
          if (payment.paymentType !== "tax-fop" && payment.paymentType !== "tax-salary") {
            return false;
          }
        } else if (payment.paymentType !== typeFilter) {
          return false;
        }
      }
      
      // Status filter
      if (statusFilter !== "all" && payment.status !== statusFilter) {
        return false;
      }

      // Contractor filter
      if (contractorFilter !== "all" && payment.entityName !== contractorFilter) {
        return false;
      }

      // Amount range
      if (amountFrom !== "" && payment.amount < amountFrom) return false;
      if (amountTo !== "" && payment.amount > amountTo) return false;

      // Currency
      if (currencyFilter !== "all" && inferCurrency(payment) !== currencyFilter) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          payment.entityName,
          payment.description,
          payment.entityCode,
          payment.statusLabel,
        ].filter(Boolean).join(" ").toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [allPayments, dateRange, directionFilter, typeFilter, statusFilter, contractorFilter, amountFrom, amountTo, currencyFilter, searchQuery]);

  // Reset all filters
  const handleClearFilters = useCallback(() => {
    setDirectionFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateRange(undefined);
    setContractorFilter("all");
    setAmountFrom("");
    setAmountTo("");
    setCurrencyFilter("all");
    setSearchQuery("");
  }, []);

  // Unique contractor list from data
  const contractorOptions = useMemo(() => {
    const names = new Set<string>();
    allPayments.forEach(p => {
      if (p.entityName) names.add(p.entityName);
    });
    const sorted = Array.from(names).sort((a, b) => a.localeCompare(b, "uk"));
    return [
      { value: "all", label: "Усі контрагенти" },
      ...sorted.map(name => ({ value: name, label: name })),
    ];
  }, [allPayments]);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (dateRange?.from) {
      chips.push({
        key: "period",
        label: formatDateRangeLabel(dateRange),
        onRemove: () => setDateRange(undefined),
      });
    }

    if (directionFilter !== "all") {
      const dirLabel = directionFilter === "in" ? "Надходження" : "Витрати";
      chips.push({
        key: "direction",
        label: dirLabel,
        onRemove: () => setDirectionFilter("all"),
      });
    }
    if (typeFilter !== "all") {
      const typeLabel = paymentTypeFilterOptions.find(o => o.value === typeFilter)?.label || typeFilter;
      chips.push({
        key: "type",
        label: typeLabel,
        onRemove: () => setTypeFilter("all"),
      });
    }

    if (statusFilter !== "all") {
      const statusLabel = paymentStatusFilterOptions.find(o => o.value === statusFilter)?.label || statusFilter;
      chips.push({
        key: "status",
        label: statusLabel,
        onRemove: () => setStatusFilter("all"),
      });
    }

    if (contractorFilter !== "all") {
      chips.push({
        key: "contractor",
        label: `Контрагент: ${contractorFilter}`,
        onRemove: () => setContractorFilter("all"),
      });
    }

    if (amountFrom !== "" || amountTo !== "") {
      const from = amountFrom === "" ? "0" : amountFrom.toLocaleString("uk-UA");
      const to = amountTo === "" ? "∞" : amountTo.toLocaleString("uk-UA");
      chips.push({
        key: "amount",
        label: `Сума: ₴${from}—${to}`,
        onRemove: () => { setAmountFrom(""); setAmountTo(""); },
      });
    }

    if (currencyFilter !== "all") {
      chips.push({
        key: "currency",
        label: `Валюта: ${currencyFilter}`,
        onRemove: () => setCurrencyFilter("all"),
      });
    }

    return chips;
  }, [dateRange, directionFilter, typeFilter, statusFilter, contractorFilter, amountFrom, amountTo, currencyFilter]);

  // Direction-dependent type and status options
  const filteredTypeOptions = useMemo(() => {
    const allowedTypes = typesByDirection[directionFilter] || typesByDirection.all;
    let options = paymentTypeFilterOptions.filter(opt => allowedTypes.includes(opt.value));
    if (isPassive) {
      options = options.filter(opt => !["tax", "tax-fop", "tax-salary", "salary"].includes(opt.value));
    }
    return options;
  }, [directionFilter, isPassive]);

  const filteredStatusOptions = useMemo(() => {
    const allowedStatuses = statusesByDirection[directionFilter] || statusesByDirection.all;
    return paymentStatusFilterOptions.filter(opt => allowedStatuses.includes(opt.value));
  }, [directionFilter]);

  // Handle direction change: reset type/status if not valid in new direction
  const handleDirectionChange = useCallback((newDir: string) => {
    if (!newDir) return;
    const dir = newDir as PaymentDirection | "all";
    setDirectionFilter(dir);
    const allowedTypes = typesByDirection[dir] || typesByDirection.all;
    if (!allowedTypes.includes(typeFilter)) setTypeFilter("all");
    const allowedStatuses = statusesByDirection[dir] || statusesByDirection.all;
    if (!allowedStatuses.includes(statusFilter)) setStatusFilter("all");
  }, [typeFilter, statusFilter]);

  // Count active filters for the popover badge
  const activeFiltersCount = useMemo(() => {
    return [
      directionFilter !== "all",
      typeFilter !== "all",
      statusFilter !== "all",
      !!dateRange?.from,
      contractorFilter !== "all",
      amountFrom !== "" || amountTo !== "",
      currencyFilter !== "all",
    ].filter(Boolean).length;
  }, [directionFilter, typeFilter, statusFilter, dateRange, contractorFilter, amountFrom, amountTo, currencyFilter]);

  // Quick presets — atomically set multiple filters
  const filterPresets = useMemo(() => [
    {
      id: "all",
      label: "Усі",
      isActive: activeFiltersCount === 0,
      apply: handleClearFilters,
    },
    {
      id: "overdue",
      label: "Прострочені",
      isActive: statusFilter === "overdue",
      apply: () => {
        setStatusFilter(statusFilter === "overdue" ? "all" : "overdue");
      },
    },
    {
      id: "needs-clarification",
      label: "Очікують",
      isActive: statusFilter === "needs-clarification",
      apply: () => {
        if (statusFilter === "needs-clarification") {
          setStatusFilter("all");
        } else {
          setStatusFilter("needs-clarification");
          if (directionFilter === "out") setDirectionFilter("all");
        }
      },
    },
    {
      id: "this-month",
      label: "Цього місяця",
      isActive:
        !!dateRange?.from &&
        dateRange.from.getTime() === startOfMonth(new Date()).getTime() &&
        dateRange.to?.getTime() === endOfMonth(new Date()).getTime(),
      apply: () => {
        const now = new Date();
        const isActive =
          !!dateRange?.from &&
          dateRange.from.getTime() === startOfMonth(now).getTime() &&
          dateRange.to?.getTime() === endOfMonth(now).getTime();
        setDateRange(isActive ? undefined : { from: startOfMonth(now), to: endOfMonth(now) });
      },
    },
    {
      id: "last-month",
      label: "Минулого місяця",
      isActive:
        !!dateRange?.from &&
        dateRange.from.getTime() === startOfMonth(subMonths(new Date(), 1)).getTime() &&
        dateRange.to?.getTime() === endOfMonth(subMonths(new Date(), 1)).getTime(),
      apply: () => {
        const lm = subMonths(new Date(), 1);
        const isActive =
          !!dateRange?.from &&
          dateRange.from.getTime() === startOfMonth(lm).getTime() &&
          dateRange.to?.getTime() === endOfMonth(lm).getTime();
        setDateRange(isActive ? undefined : { from: startOfMonth(lm), to: endOfMonth(lm) });
      },
    },
  ], [activeFiltersCount, statusFilter, dateRange, directionFilter, handleClearFilters]);

  // Currency options with counts
  const currencyOptions = useMemo(() => {
    const counts = new Map<CurrencyCode, number>();
    allPayments.forEach((p) => {
      const c = inferCurrency(p);
      counts.set(c, (counts.get(c) ?? 0) + 1);
    });
    const all = ["UAH", "USD", "EUR", "GBP", "PLN"] as CurrencyCode[];
    const opts: { value: string; label: string }[] = [
      { value: "all", label: `Усі валюти (${allPayments.length})` },
    ];
    for (const c of all) {
      const count = counts.get(c) ?? 0;
      if (count > 0) opts.push({ value: c, label: `${c} · ${count}` });
    }
    return opts;
  }, [allPayments]);

  // Filter sections for UnifiedFilterPopover
  const filterSections: FilterSection[] = useMemo(() => [
    {
      id: "type",
      label: "Тип платежу",
      options: filteredTypeOptions.map(o => ({ value: o.value, label: o.label })),
      value: typeFilter,
      onChange: (v) => setTypeFilter(v as UnifiedPaymentType | "all"),
      placeholder: "Усі типи",
    },
    {
      id: "status",
      label: "Статус",
      options: filteredStatusOptions.map(o => ({ value: o.value, label: o.label })),
      value: statusFilter,
      onChange: setStatusFilter,
      placeholder: "Усі статуси",
    },
    {
      id: "contractor",
      label: "Контрагент",
      options: contractorOptions,
      value: contractorFilter,
      onChange: setContractorFilter,
      placeholder: "Усі контрагенти",
    },
    ...(currencyOptions.length > 2 ? [{
      id: "currency",
      label: "Валюта",
      options: currencyOptions,
      value: currencyFilter,
      onChange: (v: string) => setCurrencyFilter(v as CurrencyCode | "all"),
      placeholder: "Усі валюти",
    }] : []),
  ], [typeFilter, statusFilter, contractorFilter, currencyFilter, filteredTypeOptions, filteredStatusOptions, contractorOptions, currencyOptions]);

  // Numeric range sections (amount from-to)
  const numericRanges = useMemo(() => [
    {
      id: "amount",
      label: "Сума, ₴",
      from: amountFrom,
      to: amountTo,
      onFromChange: setAmountFrom,
      onToChange: setAmountTo,
      placeholderFrom: "Від",
      placeholderTo: "До",
    },
  ], [amountFrom, amountTo]);

  // Summary calculations — у UAH-еквіваленті, з прапором наявності валютних
  const paymentsSummary = useMemo(() => {
    const inPayments = filteredPayments.filter(p => p.direction === "in");
    const outPayments = filteredPayments.filter(p => p.direction === "out");
    const paidIn = inPayments.filter(p => p.status === "paid" || p.status === "income");
    const paidOut = outPayments.filter(p => p.status === "paid");

    let hasForeignCurrency = false;
    const uah = (p: UnifiedPayment) => {
      const c = inferCurrency(p);
      if (c !== "UAH") hasForeignCurrency = true;
      return toUah(p.amount, c);
    };

    const totalIn = paidIn.reduce((sum, p) => sum + uah(p), 0);
    const totalOut = paidOut.reduce((sum, p) => sum + uah(p), 0);

    const toPayStatuses = new Set(["scheduled", "created", "sent-to-bank", "not-created"]);
    const toPay = outPayments
      .filter(p => toPayStatuses.has(p.status as string))
      .reduce((sum, p) => sum + uah(p), 0);

    const overdue = outPayments
      .filter(p => p.status === "overdue")
      .reduce((sum, p) => sum + uah(p), 0);

    const expectedIn = inPayments
      .filter(p => p.status === "needs-clarification" || p.status === "scheduled")
      .reduce((sum, p) => sum + uah(p), 0);

    return {
      count: filteredPayments.length,
      countIn: inPayments.length,
      countOut: outPayments.length,
      totalIn,
      totalOut,
      netFlow: totalIn - totalOut,
      toPay,
      overdue,
      expectedIn,
      hasForeignCurrency,
    };
  }, [filteredPayments]);

  // Об'єктивна щоденна картина — від УСІХ платежів кабінету (не від filtered)
  const todaySummary = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const isToday = (iso: string) => {
      try { return format(parseISO(iso), "yyyy-MM-dd") === todayStr; }
      catch { return false; }
    };
    const uah = (p: UnifiedPayment) => toUah(p.amount, inferCurrency(p));

    let inflowToday = 0;
    let outflowToday = 0;
    let plannedToday = 0;
    let expectedToday = 0;
    let overdueAll = 0;

    const plannedStatuses = new Set(["scheduled", "created", "sent-to-bank"]);
    const expectedStatuses = new Set(["scheduled", "needs-clarification"]);

    for (const p of allPayments) {
      const today = isToday(p.date);
      if (p.direction === "in") {
        if (today && (p.status === "paid" || p.status === "income")) inflowToday += uah(p);
        if (today && expectedStatuses.has(p.status as string)) expectedToday += uah(p);
      } else if (p.direction === "out") {
        if (today && p.status === "paid") outflowToday += uah(p);
        if (today && plannedStatuses.has(p.status as string)) plannedToday += uah(p);
        if (p.status === "overdue") overdueAll += uah(p);
      }
    }

    return { inflowToday, outflowToday, plannedToday, expectedToday, overdueAll };
  }, [allPayments]);

  // Режим стрічки: "today" коли немає жодного фільтра/пошуку, інакше "filtered".
  const summaryMode: "today" | "filtered" =
    activeFiltersCount > 0 || !!dateRange?.from || searchQuery.trim() !== ""
      ? "filtered"
      : "today";

  const contextLabel = useMemo(() => {
    if (summaryMode === "today") {
      return `За сьогодні · ${format(new Date(), "d MMM")}`;
    }
    const periodLabel = dateRange?.from ? formatDateRangeLabel(dateRange) : null;
    return periodLabel ? `Період: ${periodLabel}` : "Фільтрована вибірка";
  }, [summaryMode, dateRange]);


  const isFop = cabinet.type === "fop";

  // Items for AttentionInbox
  const taxPayments = useMemo(() => getTaxPaymentsForCabinet(cabinet.id), [cabinet.id]);
  const salaryPayments = useMemo(() => getSalaryPaymentsForCabinet(cabinet.id), [cabinet.id]);
  const contractorPayments = useMemo(() => getContractorPaymentsForCabinet(cabinet.id), [cabinet.id]);

  // Determine if AttentionInbox would render anything (so we can show healthy strip otherwise)
  const attentionItems = usePaymentsAttentionItems({
    taxPayments,
    salaryPayments: isPassive ? [] : salaryPayments,
    contractorPayments: isPassive ? [] : contractorPayments,
  });
  const showHealthyStrip = attentionItems.length === 0 && !isPassive;

  return (
    <div ref={containerRef} className="pt-5 space-y-4 flex flex-col flex-1 min-h-0">
      {/* Section-scoped action inbox OR healthy acknowledgement */}
      {showHealthyStrip ? (
        <PaymentsHealthyStrip payments={allPayments} />
      ) : (
        <PaymentsAttentionInbox
          sectionKey={`payments:${cabinet.id}`}
          taxPayments={taxPayments}
          salaryPayments={isPassive ? [] : salaryPayments}
          contractorPayments={isPassive ? [] : contractorPayments}
          /* У ФОП-кабінеті податки живуть у власному розділі «Податки» — не дублюємо. */
          hideTaxAttention={cabinet.type === "fop"}
          onOpenPayment={(id) => {
            const p = allPayments.find((x) => x.id === id);
            if (p) setSelectedPayment(p);
          }}
          onOpenAllOverdue={() => {
            setStatusFilter("overdue");
            if (!isPassive) setDirectionFilter("out");
            setTypeFilter("all");
          }}
          onOpenPending={() => {
            setTypeFilter("contractor");
            setStatusFilter("created");
            if (!isPassive) setDirectionFilter("out");
          }}
          onOpenScheduled={() => {
            setTypeFilter("salary");
            setStatusFilter("scheduled");
          }}
        />
      )}

      {/* Wave 3: сценарне попередження «що якщо клієнт не заплатить» */}
      {!isPassive && (
        <CashRiskBanner
          payments={allPayments}
          startingBalance={accountsBalance.totalUah}
          onShowDetails={(p) => setSelectedPayment(p)}
        />
      )}

      {/* Unified Toolbar with filter popover */}
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Пошук за назвою, кодом, описом..."
        sortOptions={[
          { value: "date-desc", label: "Спочатку нові" },
          { value: "date-asc", label: "Спочатку старі" },
          { value: "amount-desc", label: "За сумою ↓" },
          { value: "amount-asc", label: "За сумою ↑" },
        ]}
        activeChips={activeChips}
        onClearAllFilters={handleClearFilters}
        resultsCount={{ shown: filteredPayments.length, total: allPayments.length }}
        sticky={false}
        className="px-0"
        filterSlot={
          <div className="flex flex-wrap items-center gap-2 gap-y-2">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={handleViewModeChange}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <ToggleGroupItem value="list" className="h-9 px-2.5" aria-label="Список">
                <List className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" className="h-9 px-2.5" aria-label="Календар">
                <CalendarDays className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
            <UnifiedFilterPopover
              sections={filterSections}
              presets={!isPassive ? filterPresets : undefined}
              numericRanges={numericRanges}
              dateRange={{
                value: dateRange,
                onChange: setDateRange,
                presets: ["today", "yesterday", "this-week", "this-month", "last-month", "this-quarter", "this-year"],
              }}
              activeFiltersCount={activeFiltersCount}
              onReset={handleClearFilters}
              isMobile={isMobile}
              filteredCount={filteredPayments.length}
              totalCount={allPayments.length}
              headerSlot={!isPassive ? (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Напрямок</span>
                  <ToggleGroup
                    type="single"
                    value={directionFilter}
                    onValueChange={handleDirectionChange}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <ToggleGroupItem value="all" className="text-xs flex-1 h-8">Усі</ToggleGroupItem>
                    <ToggleGroupItem value="in" className="text-xs flex-1 h-8">Надходження</ToggleGroupItem>
                    <ToggleGroupItem value="out" className="text-xs flex-1 h-8">Витрати</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              ) : undefined}
            />
            {!isPassive && (
              <Button
                size="sm"
                className="h-9 px-2.5 sm:px-3"
                onClick={() => openCreateDialog("contractor")}
                aria-label="Створити платіж"
              >
                <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Створити</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Більше дій">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Експорт — об'єднано з меню ⋮ */}
                <DropdownMenuItem
                  onClick={() => {
                    if (filteredPayments.length === 0) return toast.error("Немає платежів для експорту");
                    const fname = `payments_${cabinet.id}_${format(new Date(), "yyyy-MM-dd")}.csv`;
                    exportPaymentsToCSV(filteredPayments, fname);
                    toast.success(`CSV: ${filteredPayments.length} платежів`);
                  }}
                >
                  <FileText className="h-3.5 w-3.5 mr-2" />
                  Експорт CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (filteredPayments.length === 0) return toast.error("Немає платежів для експорту");
                    const fname = `payments_${cabinet.id}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
                    exportPaymentsToXLSX(filteredPayments, fname);
                    toast.success(`Excel: ${filteredPayments.length} платежів`);
                  }}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
                  Експорт Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    try {
                      const fname = `ibank2ua_${cabinet.id}_${format(new Date(), "yyyy-MM-dd")}.txt`;
                      exportPaymentsToIBank2UA(filteredPayments, fname);
                      toast.success(`iBank2UA: експортовано вихідні платежі`);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Помилка експорту");
                    }
                  }}
                >
                  <Send className="h-3.5 w-3.5 mr-2" />
                  Експорт iBank2UA (.txt)
                </DropdownMenuItem>
                {!isPassive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRecurringDrawerOpen(true)}>
                      <Repeat className="h-3.5 w-3.5 mr-2" />
                      Регулярні платежі
                    </DropdownMenuItem>
                    {isFop && (
                      <DropdownMenuItem onClick={() => setDeclarationDialogOpen(true)}>
                        <FileBarChart2 className="h-3.5 w-3.5 mr-2" />
                        → Декларація ФОП
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />



      {/* Bulk-bar — чесні дії: експорт + позначення оплаченими (масово). */}
      {selectedIds.size > 0 && (
        <div
          className="sticky bottom-0 z-20 -mx-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg flex items-center gap-2 flex-wrap"
          style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
        >
          <span className="text-sm font-medium">
            Обрано {selectedIds.size}
            {selectedIds.size === 1 ? " платіж" : selectedIds.size < 5 ? " платежі" : " платежів"}
          </span>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => {
              const selected = filteredPayments.filter((p) => selectedIds.has(p.id));
              if (selected.length === 0) return;
              const fname = `payments_registry_${cabinet.id}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
              exportPaymentsToXLSX(selected, fname);
              toast.success(`Експорт реєстру: ${selected.length} платежів`);
            }}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Експорт реєстру (XLSX)</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            title="Реальна відправка в банк — у наступному релізі"
            onClick={() => {
              const selected = filteredPayments.filter((p) => selectedIds.has(p.id));
              try {
                const fname = `ibank2ua_registry_${cabinet.id}_${format(new Date(), "yyyy-MM-dd")}.txt`;
                exportPaymentsToIBank2UA(selected, fname);
                toast.success("iBank2UA: реєстр експортовано", {
                  description: "Завантажте файл у клієнт-банк для відправки",
                });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Помилка експорту");
              }
            }}
          >
            <Send className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Експорт у клієнт-банк</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => {
              const selected = filteredPayments.filter((p) => selectedIds.has(p.id));
              const eligible = selected.filter((p) => p.direction === "out" && p.status !== "paid" && p.status !== "cancelled");
              if (eligible.length === 0) {
                toast.info("Немає платежів, які можна позначити оплаченими");
                return;
              }
              // Реальна batch-мутація через MarkAsPaidDialog
              setBulkPaymentsToMark(eligible);
              setBulkMarkPaidOpen(true);
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Позначити оплаченими</span>
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={clearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Universal summary strip — visible across all viewports & view modes */}
      {allPayments.length > 0 && (
        <PaymentsSummaryStrip
          mode={summaryMode}
          contextLabel={contextLabel}
          onResetContext={summaryMode === "filtered" ? handleClearFilters : undefined}
          summary={{
            inflow: paymentsSummary.totalIn,
            outflow: paymentsSummary.totalOut,
            net: paymentsSummary.netFlow,
            overdue: summaryMode === "today" ? todaySummary.overdueAll : paymentsSummary.overdue,
            expectedIn: paymentsSummary.expectedIn,
            toPay: paymentsSummary.toPay,
            accountsBalance: accountsBalance.totalUah,
            accountsCount: accountsBalance.accountsCount,
            hasForeignCurrency: paymentsSummary.hasForeignCurrency,
            inflowToday: todaySummary.inflowToday,
            outflowToday: todaySummary.outflowToday,
            plannedToday: todaySummary.plannedToday,
            expectedToday: todaySummary.expectedToday,
          }}
        />
      )}

      {viewMode === "calendar" ? (
        <PaymentsCalendarView payments={filteredPayments} onPaymentClick={setSelectedPayment} />
      ) : isCompactView ? (
        <div className="space-y-2">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Платежів за вашим запитом не знайдено</p>
            </div>
          ) : (
            <>
              {filteredPayments.map((payment) => (
                <UnifiedPaymentCard
                  key={payment.id}
                  payment={payment}
                  onClick={() => setSelectedPayment(payment)}
                  onNavigateToReport={onNavigateToReport}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <UnifiedPaymentsTable
            payments={filteredPayments}
            onRowClick={setSelectedPayment}
            onNavigateToReport={onNavigateToReport}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectId}
            onToggleSelectAll={toggleSelectAll}
            rowActions={isPassive ? undefined : rowActions}
          />
        </div>
      )}

      {/* Detail Sheet */}
      <UniversalPaymentDetailSheet
        open={!!selectedPayment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPayment(null);
            setDetailFocus(null);
          }
        }}
        payment={selectedPayment}
        focusSection={detailFocus}
        onNavigateToEmployee={onNavigateToEmployee}
        onNavigateToContractor={onNavigateToContractor}
        onNavigateToDocument={onNavigateToDocumentDetail}
        onNavigateToIncomeBook={onNavigateToIncomeBook}
        onNavigateToPayroll={() => { if (import.meta.env.DEV) console.log("Navigate to payroll"); }}
        onNavigateToOriginalPayment={(id) => { if (import.meta.env.DEV) console.log("Navigate to original payment:", id); }}
        onNavigateToReport={onNavigateToReport}
        onExplainInChat={onChatPromptInsert}
      />

      {/* Quick-create dialog */}
      <QuickCreatePaymentDialog
        open={createDialogOpen}
        onOpenChange={(next) => {
          setCreateDialogOpen(next);
          if (!next) setDuplicatePrefill(null);
        }}
        defaultType={createDialogType}
        prefillCounterparty={duplicatePrefill?.counterparty}
        prefillAmount={duplicatePrefill?.amount}
        prefillPurpose={duplicatePrefill?.purpose}
      />

      {/* Wave 3: regular payments manager */}
      <RecurringPaymentsManager
        open={recurringDrawerOpen}
        onOpenChange={setRecurringDrawerOpen}
      />

      {/* Wave 3: declaration export (FOP only) */}
      {isFop && (
        <DeclarationExportDialog
          open={declarationDialogOpen}
          onOpenChange={setDeclarationDialogOpen}
          cabinet={cabinet}
        />
      )}

      {/* Fix-up: real Mark-as-Paid dialog (single payment) */}
      <MarkAsPaidDialog
        open={!!paymentToMarkPaid}
        onOpenChange={(o) => !o && setPaymentToMarkPaid(null)}
        payment={paymentToMarkPaid}
      />

      {/* Доробок 2: dedicated bulk Mark-as-Paid dialog (без шаблону першого платежу) */}
      <BulkMarkAsPaidDialog
        open={bulkMarkPaidOpen}
        onOpenChange={(o) => {
          setBulkMarkPaidOpen(o);
          if (!o) setBulkPaymentsToMark([]);
        }}
        payments={bulkPaymentsToMark}
        onConfirm={() => clearSelection()}
      />

      {/* Доробок 3: confirm із вибором категорії доходу */}
      <MarkAsReceivedConfirmDialog
        open={!!paymentToMarkReceived}
        onOpenChange={(o) => !o && setPaymentToMarkReceived(null)}
        payment={paymentToMarkReceived}
      />

      {/* Fix-up: confirm перед скасуванням платежу */}
      <AlertDialog open={!!paymentToCancel} onOpenChange={(o) => !o && setPaymentToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Скасувати платіж?</AlertDialogTitle>
            <AlertDialogDescription>
              {paymentToCancel
                ? `«${paymentToCancel.entityName}» · ₴${paymentToCancel.amount.toLocaleString("uk-UA")}. Дію не можна буде скасувати.`
                : "Дію не можна буде скасувати."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Назад</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (paymentToCancel) {
                  toast.success("Платіж скасовано", {
                    description: `${paymentToCancel.entityName} · ₴${paymentToCancel.amount.toLocaleString("uk-UA")}`,
                  });
                }
                setPaymentToCancel(null);
              }}
            >
              Так, скасувати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
