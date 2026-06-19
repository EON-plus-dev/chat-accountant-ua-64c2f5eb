import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ArrowLeft, AlertTriangle, X, CheckCircle2, ArrowRight, Search, List, CalendarDays, LayoutGrid } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import type { Cabinet } from "@/types/cabinet";
import { IncomeBookHeader, type AggregationType } from "./IncomeBookHeader";
import { IncomeBookFilters, type SortField, type SortDirection } from "./IncomeBookFilters";
import { MonthlyView } from "./MonthlyView";
import { QuarterlyView, type QuarterlySortField } from "./QuarterlyView";
import { GroupedDailyView, type IncomeBookSummaryFilterType } from "./GroupedDailyView";
import { LimitControlBlock } from "./LimitControlBlock";
import { CashReconciliationCard } from "./CashReconciliationCard";
import { IncomeBookAttentionInbox } from "./IncomeBookAttentionInbox";
import { IncomeBookKPISection } from "./IncomeBookKPISection";
import { IncomeBookSummaryStrip } from "./IncomeBookSummaryStrip";
import { WeeklyView } from "./WeeklyView";
import { BulkActionBar } from "./BulkActionBar";
import { Progress } from "@/components/ui/progress";

import { OperationDetailsSheet } from "./OperationDetailsSheet";
import {
  demoIncomeRecords,
  aggregateRecordsByMonth,
  issueTypeConfig,
  getIncomeRecordsForCabinet,
  type IncomeBookRecord,
  type PaymentType,
  type DataSource,
  type IssueType,
} from "@/config/incomeBookConfig";
import { autoCategorizeRecords, getCategorizationStats } from "@/lib/autoCategorization";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { buildIncomeBookCsv, downloadCsvBlob, sanitizeFilenameFragment } from "./incomeBookCsv";

interface IncomeBookPageProps {
  cabinet: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  onNavigateToSettings?: () => void;
  onNavigateToAnalytics?: () => void;
  onScroll?: (isScrolled: boolean) => void;
}

export interface FilterState {
  paymentTypes: PaymentType[];
  sources: DataSource[];
  showOnlyReturns: boolean;
  excludeReturns: boolean;
  quickFilter: "all" | "income-only" | "not-income" | "returns" | "needs-clarification" | "uncategorized";
  dateRange?: { from?: Date; to?: Date };
}

// Month labels for breadcrumb
const monthLabels: Record<string, string> = {
  "01": "Січень",
  "02": "Лютий",
  "03": "Березень",
  "04": "Квітень",
  "05": "Травень",
  "06": "Червень",
  "07": "Липень",
  "08": "Серпень",
  "09": "Вересень",
  "10": "Жовтень",
  "11": "Листопад",
  "12": "Грудень",
};

const quarterLabels: Record<string, string> = {
  Q1: "I квартал",
  Q2: "II квартал",
  Q3: "III квартал",
  Q4: "IV квартал",
};

const quarterMonths: Record<string, string[]> = {
  Q1: ["01", "02", "03"],
  Q2: ["04", "05", "06"],
  Q3: ["07", "08", "09"],
  Q4: ["10", "11", "12"],
};

// All months for dropdown
const allMonths = [
  { value: "01", label: "Січень" },
  { value: "02", label: "Лютий" },
  { value: "03", label: "Березень" },
  { value: "04", label: "Квітень" },
  { value: "05", label: "Травень" },
  { value: "06", label: "Червень" },
  { value: "07", label: "Липень" },
  { value: "08", label: "Серпень" },
  { value: "09", label: "Вересень" },
  { value: "10", label: "Жовтень" },
  { value: "11", label: "Листопад" },
  { value: "12", label: "Грудень" },
];

const allQuarters = [
  { value: "Q1", label: "I квартал" },
  { value: "Q2", label: "II квартал" },
  { value: "Q3", label: "III квартал" },
  { value: "Q4", label: "IV квартал" },
];

export const IncomeBookPage = ({ cabinet, onChatPromptInsert, onNavigateToSettings, onNavigateToAnalytics, onScroll }: IncomeBookPageProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  // Deep-link: ?year=YYYY&quarter=N — initial period from URL (e.g. з картки податку ЄП)
  const initialYear = useMemo(() => {
    const v = parseInt(searchParams.get("year") ?? "", 10);
    return Number.isFinite(v) && v >= 2020 && v <= 2030 ? v : 2025;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const initialQuarter = useMemo(() => {
    const v = parseInt(searchParams.get("quarter") ?? "", 10);
    return v >= 1 && v <= 4 ? `Q${v}` : null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Main state
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [aggregation, setAggregation] = useState<AggregationType>(initialQuarter ? "quarterly" : "monthly");
  // Hierarchical navigation: null = aggregated, "Q1" = quarter months, "2025-03" = daily
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(initialQuarter); // "Q1", "Q2", etc.
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // "2025-01", etc.
  const [searchQuery, setSearchQuery] = useState("");

  // Очищаємо year/quarter з URL після ініціалізації, щоб не «пам'ятати» при F5
  useEffect(() => {
    if (searchParams.get("year") || searchParams.get("quarter")) {
      const next = new URLSearchParams(searchParams);
      next.delete("year");
      next.delete("quarter");
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Pick up quickFilter from URL (deep-link from report review checklist)
  const initialQuickFilter = useMemo<FilterState["quickFilter"]>(() => {
    const v = searchParams.get("quickFilter");
    if (v === "income-only" || v === "not-income" || v === "returns" || v === "needs-clarification") {
      return v;
    }
    return "all";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Стан фільтрів
  const [filters, setFilters] = useState<FilterState>({
    paymentTypes: [],
    sources: [],
    showOnlyReturns: false,
    excludeReturns: false,
    quickFilter: initialQuickFilter,
  });

  // Clear quickFilter param from URL after consuming + show toast
  useEffect(() => {
    if (searchParams.get("quickFilter")) {
      const messages: Record<FilterState["quickFilter"], string> = {
        all: "",
        "income-only": "Показано операції, що включені до доходу",
        "not-income": "Показано операції, що не включені до доходу",
        returns: "Показано повернення та коригування",
        "needs-clarification": "Показано записи, що потребують уточнення",
        uncategorized: "Показано операції без категорії",
      };
      const msg = messages[initialQuickFilter];
      if (msg) {
        toast({ title: "Фільтр застосовано", description: msg });
      }
      const next = new URLSearchParams(searchParams);
      next.delete("quickFilter");
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Стан сортування
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Стан деталей операції
  const [selectedRecord, setSelectedRecord] = useState<IncomeBookRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Bulk-selection (Phase 4)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // View mode toggle: grouped by day vs flat list (persisted across sessions)
  const [viewMode, setViewMode] = useState<"list" | "grouped">(() => {
    if (typeof window === "undefined") return "grouped";
    const saved = window.localStorage.getItem("income_book_view_mode");
    return saved === "list" || saved === "grouped" ? saved : "grouped";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("income_book_view_mode", viewMode);
    }
  }, [viewMode]);

  const handleToggleSelected = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback((ids: string[], allOn: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allOn) ids.forEach(id => next.add(id));
      else ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Determine view level: aggregated, quarter-months, or daily
  const isQuarterMonthsView = selectedQuarter !== null && selectedMonth === null;
  const isDailyView = selectedMonth !== null;

  // Get cabinet-specific income records with auto-categorization
  const baseRecords = useMemo(() => {
    const raw = getIncomeRecordsForCabinet(cabinet);
    const result = autoCategorizeRecords(raw, cabinet.id);
    return result.records;
  }, [cabinet]);

  const [cabinetRecords, setCabinetRecords] = useState<IncomeBookRecord[]>(baseRecords);

  // Sync when base records change (cabinet switch)
  useEffect(() => {
    setCabinetRecords(baseRecords);
  }, [baseRecords]);

  // ── Processed-today tracker (J6: «закрий інбокс за 5 хвилин»)
  // sessionStorage key per cabinet+date so progress is meaningful for one work session.
  const todayKey = useMemo(() => {
    const d = new Date();
    return `incomebook:processed:${cabinet.id}:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [cabinet.id]);

  const [processedToday, setProcessedToday] = useState<Set<string>>(() => {
    try {
      const raw = sessionStorage.getItem(todayKey);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(todayKey);
      setProcessedToday(raw ? new Set(JSON.parse(raw) as string[]) : new Set());
    } catch { setProcessedToday(new Set()); }
  }, [todayKey]);

  const persistProcessed = useCallback((next: Set<string>) => {
    try { sessionStorage.setItem(todayKey, JSON.stringify([...next])); } catch { /* ignore */ }
  }, [todayKey]);

  // Update a single record in-place (e.g. after rule creation)
  const handleRecordUpdate = useCallback((recordId: string, updates: Partial<IncomeBookRecord>) => {
    setCabinetRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      const updated = { ...r, ...updates };
      // Mark as processed when leaving needs-clarification OR confirming category
      const wasProblem = r.status === "needs-clarification" || (r.categoryCode && !r.categoryConfirmed);
      const stillProblem = updated.status === "needs-clarification" || (updated.categoryCode && !updated.categoryConfirmed);
      if (wasProblem && !stillProblem) {
        setProcessedToday(prev => {
          if (prev.has(recordId)) return prev;
          const next = new Set(prev); next.add(recordId); persistProcessed(next); return next;
        });
      }
      return updated;
    }));
    setSelectedRecord(prev => prev?.id === recordId ? { ...prev, ...updates } : prev);
  }, [persistProcessed]);

  // Bulk mutation helper
  const applyBulk = useCallback((mutate: (r: IncomeBookRecord) => Partial<IncomeBookRecord>) => {
    setCabinetRecords(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, ...mutate(r) } : r));
  }, [selectedIds]);

  const selectedRecordsList = useMemo(
    () => cabinetRecords.filter(r => selectedIds.has(r.id)),
    [cabinetRecords, selectedIds],
  );

  const handleBulkConfirmCategory = useCallback(() => {
    const count = selectedRecordsList.filter(r => r.categoryCode && !r.categoryConfirmed).length;
    applyBulk(r => r.categoryCode && !r.categoryConfirmed ? { categoryConfirmed: true } : {});
    toast({ title: "Категорії підтверджено", description: `Оновлено ${count} операцій` });
  }, [applyBulk, selectedRecordsList, toast]);

  const handleBulkMarkIncome = useCallback(() => {
    applyBulk(r => ({ status: "income", issueType: undefined, inIncomeBook: r.amount }));
    toast({ title: "Включено в дохід", description: `Оновлено ${selectedIds.size} операцій` });
    setSelectedIds(new Set());
  }, [applyBulk, selectedIds, toast]);

  const handleBulkMarkNotIncome = useCallback(() => {
    applyBulk(() => ({ status: "not-income", issueType: undefined, inIncomeBook: 0 }));
    toast({ title: "Виключено з доходу", description: `Оновлено ${selectedIds.size} операцій` });
    setSelectedIds(new Set());
  }, [applyBulk, selectedIds, toast]);

  const handleBulkExport = useCallback(() => {
    if (selectedRecordsList.length === 0) return;
    const csv = buildIncomeBookCsv(selectedRecordsList);
    downloadCsvBlob(csv, `kniga-dohodiv_vybrane_${sanitizeFilenameFragment(String(selectedYear))}.csv`);
    toast({ title: "CSV експортовано", description: `${selectedRecordsList.length} вибраних операцій` });
  }, [selectedRecordsList, selectedYear, toast]);

  // Categorization stats
  const categorizationStats = useMemo(() => {
    return getCategorizationStats(cabinetRecords);
  }, [cabinetRecords]);

  // Show cash reconciliation for any cabinet that has BOTH fiscal (PRRO) cash receipts
  // AND non-PRRO cash deposits — that's the universal precondition for needing reconciliation.
  const showCashReconciliation = useMemo(() => {
    const hasPrroCash = cabinetRecords.some(
      (r) => r.source === "prro" && r.paymentType === "cash",
    );
    const hasBankCash = cabinetRecords.some(
      (r) => r.source !== "prro" && r.paymentType === "cash",
    );
    return hasPrroCash && hasBankCash;
  }, [cabinetRecords]);

  // Filtered year records for cash reconciliation
  const filteredYearRecordsForReconciliation = useMemo(() => {
    return cabinetRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === selectedYear;
    });
  }, [cabinet]);

  // Get months for selected quarter
  const getQuarterMonths = useCallback((quarter: string): string[] => {
    const months = quarterMonths[quarter];
    if (!months) return [];
    return months.map(m => `${selectedYear}-${m}`);
  }, [selectedYear]);

  // Фільтровані записи за рік (БЕЗ обмеження по місяцю — для агрегованих view)
  const filteredYearRecords = useMemo(() => {
    const drFrom = filters.dateRange?.from;
    const drTo = filters.dateRange?.to ?? filters.dateRange?.from;
    const drFromStr = drFrom ? `${drFrom.getFullYear()}-${String(drFrom.getMonth() + 1).padStart(2, "0")}-${String(drFrom.getDate()).padStart(2, "0")}` : null;
    const drToStr = drTo ? `${drTo.getFullYear()}-${String(drTo.getMonth() + 1).padStart(2, "0")}-${String(drTo.getDate()).padStart(2, "0")}` : null;

    return cabinetRecords.filter((record) => {
      // Фільтр по довільному діапазону дат (має пріоритет над роком)
      if (drFromStr && drToStr) {
        if (record.date < drFromStr || record.date > drToStr) return false;
      } else if (!record.date.startsWith(String(selectedYear))) {
        // Фільтр по році (коли діапазон не заданий)
        return false;
      }
      
      // Фільтр по типу оплати
      if (filters.paymentTypes.length > 0 && !filters.paymentTypes.includes(record.paymentType)) {
        return false;
      }
      
      // Фільтр по джерелу
      if (filters.sources.length > 0 && !filters.sources.includes(record.source)) {
        return false;
      }
      
      // Фільтр повернень
      if (filters.showOnlyReturns && record.status !== "return") return false;
      if (filters.excludeReturns && record.status === "return") return false;
      
      // Швидкі фільтри
      switch (filters.quickFilter) {
        case "income-only":
          return record.status === "income";
        case "not-income":
          return record.status === "not-income";
        case "returns":
          return record.status === "return";
        case "needs-clarification":
          return record.status === "needs-clarification";
        case "uncategorized":
          return !record.categoryCode;
        default:
          return true;
      }
    });
  }, [selectedYear, filters, cabinetRecords]);

  // Динамічні агрегати замість статичних demoMonthlyAggregates
  const yearlyAggregates = useMemo(() => {
    return aggregateRecordsByMonth(filteredYearRecords);
  }, [filteredYearRecords]);

  // Get aggregates for selected quarter (for MonthlyView within quarter)
  const quarterMonthlyAggregates = useMemo(() => {
    if (!selectedQuarter) return [];
    const qMonths = getQuarterMonths(selectedQuarter);
    return yearlyAggregates.filter(agg => qMonths.includes(agg.month));
  }, [selectedQuarter, yearlyAggregates, getQuarterMonths]);

  // Фільтрація записів (for daily view)
  const filteredRecords = useMemo(() => {
    const drFrom = filters.dateRange?.from;
    const drTo = filters.dateRange?.to ?? filters.dateRange?.from;
    const drFromStr = drFrom ? `${drFrom.getFullYear()}-${String(drFrom.getMonth() + 1).padStart(2, "0")}-${String(drFrom.getDate()).padStart(2, "0")}` : null;
    const drToStr = drTo ? `${drTo.getFullYear()}-${String(drTo.getMonth() + 1).padStart(2, "0")}-${String(drTo.getDate()).padStart(2, "0")}` : null;

    let filtered = cabinetRecords.filter((record) => {
      // Фільтр по довільному діапазону дат (має пріоритет над роком/місяцем)
      if (drFromStr && drToStr) {
        if (record.date < drFromStr || record.date > drToStr) return false;
      } else {
        // Фільтр по року
        if (!record.date.startsWith(String(selectedYear))) return false;
        // Фільтр по місяцю (daily view)
        if (selectedMonth) {
          if (!record.date.startsWith(selectedMonth)) return false;
        }
      }
      
      // Пошук
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchable = [
          record.description,
          record.contractor,
          record.txnId,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      
      // Фільтр по типу оплати
      if (filters.paymentTypes.length > 0 && !filters.paymentTypes.includes(record.paymentType)) {
        return false;
      }
      
      // Фільтр по джерелу
      if (filters.sources.length > 0 && !filters.sources.includes(record.source)) {
        return false;
      }
      
      // Фільтр повернень
      if (filters.showOnlyReturns && record.status !== "return") return false;
      if (filters.excludeReturns && record.status === "return") return false;
      
      // Швидкі фільтри
      switch (filters.quickFilter) {
        case "income-only":
          return record.status === "income";
        case "not-income":
          return record.status === "not-income";
        case "returns":
          return record.status === "return";
        case "needs-clarification":
          return record.status === "needs-clarification";
        case "uncategorized":
          return !record.categoryCode;
        default:
          return true;
      }
    });

    // Сортування
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "source":
          comparison = a.source.localeCompare(b.source);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [selectedYear, selectedMonth, searchQuery, filters, sortField, sortDirection, cabinetRecords]);

  // Загальна кількість записів за рік
  const totalYearRecords = useMemo(() => {
    return cabinetRecords.filter((r) => r.date.startsWith(String(selectedYear))).length;
  }, [selectedYear, cabinetRecords]);

  // (yearlyAggregates moved up before quarterMonthlyAggregates)

  // Підрахунок проблемних операцій (для Data Quality)
  const qualityIssuesCount = useMemo(() => {
    return cabinetRecords.filter(
      (r) => r.date.startsWith(String(selectedYear)) && r.status === "needs-clarification"
    ).length;
  }, [selectedYear, cabinetRecords]);

  // Issues breakdown by type
  const issuesByType = useMemo(() => {
    const issues = cabinetRecords.filter(
      (r) => r.date.startsWith(String(selectedYear)) && r.status === "needs-clarification"
    );
    
    const byType: Partial<Record<IssueType, number>> = {};
    issues.forEach((r) => {
      if (r.issueType) {
        byType[r.issueType] = (byType[r.issueType] || 0) + 1;
      }
    });
    
    return byType as Record<IssueType, number>;
  }, [selectedYear, cabinetRecords]);

  // Data Quality percent
  const dataQualityPercent = useMemo(() => {
    const total = cabinetRecords.filter(
      (r) => r.date.startsWith(String(selectedYear))
    ).length;
    if (total === 0) return 100;
    return Math.round(((total - qualityIssuesCount) / total) * 100);
  }, [selectedYear, qualityIssuesCount, cabinetRecords]);

  // Get period label for breadcrumb
  const selectedQuarterLabel = useMemo(() => {
    if (!selectedQuarter) return null;
    return quarterLabels[selectedQuarter] || selectedQuarter;
  }, [selectedQuarter]);

  const selectedMonthLabel = useMemo(() => {
    if (!selectedMonth) return null;
    const monthNum = selectedMonth.split("-")[1];
    return monthLabels[monthNum] || selectedMonth;
  }, [selectedMonth]);

// Helper: get quarter from month number
const getQuarterFromMonth = (monthNum: string): string => {
  const num = parseInt(monthNum, 10);
  if (num <= 3) return "Q1";
  if (num <= 6) return "Q2";
  if (num <= 9) return "Q3";
  return "Q4";
};

// Обробники
const handleMonthClick = useCallback((month: string) => {
  setSelectedMonth(month);
  // Auto-set quarter based on month
  const monthNum = month.split("-")[1];
  setSelectedQuarter(getQuarterFromMonth(monthNum));
  const monthLabel = yearlyAggregates.find(m => m.month === month)?.label || month;
  onChatPromptInsert?.(`Відкрив детальний вигляд книги за ${monthLabel}`);
}, [onChatPromptInsert, yearlyAggregates]);

  const handleQuarterClick = useCallback((quarter: string) => {
    setSelectedQuarter(quarter);
    setSelectedMonth(null); // Reset month when selecting quarter
    onChatPromptInsert?.(`Відкрив ${quarterLabels[quarter]} — перегляд по місяцях`);
  }, [onChatPromptInsert]);

  const handleRecordClick = useCallback((record: IncomeBookRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  }, []);

  // Deep-link: ?highlight=<recordId> — миттєво відкриває картку запису.
  // Використовується drill-stack «Відкрити повний розділ Книги доходів».
  useEffect(() => {
    const highlightId = searchParams.get("highlight");
    if (!highlightId) return;
    const target = demoIncomeRecords.find((r) => r.id === highlightId);
    if (target) {
      setSelectedRecord(target);
      setDetailsOpen(true);
      const year = new Date(target.date).getFullYear();
      if (!Number.isNaN(year)) setSelectedYear(year);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("highlight");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSummaryFilterClick = useCallback((filterType: IncomeBookSummaryFilterType) => {
    if (filterType === "all") {
      setFilters(prev => ({ ...prev, quickFilter: "all" }));
    } else if (filterType === "income") {
      setFilters(prev => ({ ...prev, quickFilter: "income-only" }));
    } else if (filterType === "needs-clarification") {
      setFilters(prev => ({ ...prev, quickFilter: "needs-clarification" }));
    } else if (filterType === "return") {
      setFilters(prev => ({ ...prev, quickFilter: "returns" }));
    }
  }, []);

  const handleQuickFilterChange = useCallback((filter: FilterState["quickFilter"]) => {
    setFilters((prev) => ({ ...prev, quickFilter: filter }));
    
    const messages: Record<FilterState["quickFilter"], string> = {
      all: "Показую всі операції",
      "income-only": "Показую тільки операції, що включені до доходу книги",
      "not-income": "Відфільтрував операції, які не потрапили до доходу",
      returns: "Показую повернення та коригування",
      "needs-clarification": "Показую операції, що потребують уточнення",
      uncategorized: "Показую операції без категорії",
    };
    onChatPromptInsert?.(messages[filter]);
  }, [onChatPromptInsert]);

  // Handler: jump to uncategorized operations (from header badge or attention inbox)
  const handleShowUncategorized = useCallback(() => {
    if (categorizationStats.uncategorized === 0) {
      onNavigateToSettings?.();
      toast({
        title: "Усе категоризовано ✓",
        description: "Можете керувати правилами категоризації",
      });
      return;
    }
    setSelectedQuarter(null);
    setSelectedMonth(null);
    setSearchQuery("");
    setFilters({
      paymentTypes: [],
      sources: [],
      showOnlyReturns: false,
      excludeReturns: false,
      quickFilter: "uncategorized",
    });
    toast({
      title: "Фільтр: Без категорії",
      description: `Показую ${categorizationStats.uncategorized} ${categorizationStats.uncategorized === 1 ? "операцію" : "операцій"} без категорії`,
    });
    onChatPromptInsert?.("Допоможи категоризувати ці операції");
  }, [categorizationStats.uncategorized, onChatPromptInsert, onNavigateToSettings, toast]);

  const handleShowIssues = useCallback(() => {
    // Find records with issues for the selected year
    const issueRecords = cabinetRecords.filter(
      (r) => r.date.startsWith(String(selectedYear)) && r.status === "needs-clarification"
    );
    
    if (issueRecords.length === 0) return;
    
    // Find first month with issues
    const firstIssueDate = issueRecords.map((r) => r.date).sort()[0];
    const firstIssueMonth = firstIssueDate.slice(0, 7); // "2025-03"
    
    // Determine quarter from month
    const monthNum = firstIssueMonth.split("-")[1];
    const quarter = getQuarterFromMonth(monthNum);
    
    // Set navigation and filter
    setSelectedQuarter(quarter);
    setSelectedMonth(firstIssueMonth);
    setFilters({
      paymentTypes: [],
      sources: [],
      showOnlyReturns: false,
      excludeReturns: false,
      quickFilter: "needs-clarification",
    });
    setSearchQuery("");
    onChatPromptInsert?.(`Показую ${qualityIssuesCount} операцій, що потребують уточнення`);
  }, [selectedYear, qualityIssuesCount, onChatPromptInsert, cabinetRecords]);

  // NEW: Handler for filtering by specific issue type (from DataQualityButton)
  const handleFilterByIssueType = useCallback((issueType: string) => {
    // Find records with this specific issue type
    const issueRecords = cabinetRecords.filter(
      (r) => r.date.startsWith(String(selectedYear)) && 
             r.status === "needs-clarification" && 
             r.issueType === issueType
    );
    
    if (issueRecords.length === 0) return;
    
    // Find first month with this issue
    const firstIssueDate = issueRecords.map((r) => r.date).sort()[0];
    const firstIssueMonth = firstIssueDate.slice(0, 7);
    
    // Determine quarter from month
    const monthNum = firstIssueMonth.split("-")[1];
    const quarter = getQuarterFromMonth(monthNum);
    
    // Navigate and filter
    setSelectedQuarter(quarter);
    setSelectedMonth(firstIssueMonth);
    setFilters({
      paymentTypes: [],
      sources: [],
      showOnlyReturns: false,
      excludeReturns: false,
      quickFilter: "needs-clarification",
    });
    setSearchQuery("");
    
    const config = issueTypeConfig[issueType as IssueType];
    if (config) {
      onChatPromptInsert?.(`Фільтрую: ${config.label}`);
    }
  }, [selectedYear, onChatPromptInsert, cabinetRecords]);

  const handleBackToAggregated = useCallback(() => {
    setSelectedQuarter(null);
    setSelectedMonth(null);
  }, []);

  const handleBackToQuarter = useCallback(() => {
    setSelectedMonth(null);
  }, []);

  const handleSortChange = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "date" ? "desc" : "asc");
    }
  }, [sortField]);

const handleQuarterChange = useCallback((newQuarter: string) => {
  setSelectedQuarter(newQuarter);
  // Always reset to quarter-months view (show 3 months table, not daily view)
  setSelectedMonth(null);
  onChatPromptInsert?.(`Відкрив ${quarterLabels[newQuarter]} — перегляд по місяцях`);
}, [onChatPromptInsert]);

  const handleMonthChange = useCallback((newMonth: string) => {
    setSelectedMonth(newMonth);
  }, []);

// Get available months for dropdown based on selected quarter
const availableMonthsForQuarter = useMemo(() => {
  if (!selectedQuarter) {
    // If no quarter selected, show all months
    return allMonths.map(m => ({ 
      value: `${selectedYear}-${m.value}`, 
      label: m.label 
    }));
  }
  const qMonths = quarterMonths[selectedQuarter];
  if (!qMonths) return [];
  return qMonths.map(m => ({ 
    value: `${selectedYear}-${m}`, 
    label: monthLabels[m] 
  }));
}, [selectedQuarter, selectedYear]);

  // ── Review queue: needs-clarification OR unconfirmed category (drives processedToday %)
  const reviewQueue = useMemo(() => {
    return cabinetRecords
      .filter(r => r.status === "needs-clarification" || (r.categoryCode && !r.categoryConfirmed))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [cabinetRecords]);

  const processedTodayCount = useMemo(() => {
    let n = 0;
    processedToday.forEach(() => n++);
    return n;
  }, [processedToday]);

  const todayBatchTotal = processedTodayCount + reviewQueue.length;
  const showProcessedBanner =
    filters.quickFilter === "needs-clarification" && todayBatchTotal > 0;

  const handleContinueQueue = useCallback(() => {
    const next = reviewQueue[0];
    if (!next) return;
    setSelectedRecord(next);
    setDetailsOpen(true);
  }, [reviewQueue]);

  // ── Global search across the year — surfaces hits when current month/quarter is empty
  const globalSearchHits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    if (!isDailyView && !isQuarterMonthsView) return null;
    if (filteredRecords.length > 0) return null;

    const yearMatches = cabinetRecords.filter(r => {
      if (!r.date.startsWith(String(selectedYear))) return false;
      const hay = [r.description, r.contractor, r.txnId, String(r.amount)]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
    if (yearMatches.length === 0) return null;

    // Aggregate by month
    const byMonth = new Map<string, number>();
    yearMatches.forEach(r => {
      const m = r.date.slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + 1);
    });
    const months = [...byMonth.entries()]
      .map(([month, count]) => ({ month, count, label: monthLabels[month.split("-")[1]] || month }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { total: yearMatches.length, months };
  }, [searchQuery, isDailyView, isQuarterMonthsView, filteredRecords.length, cabinetRecords, selectedYear]);

  const handleJumpToMonth = useCallback((month: string) => {
    const monthNum = month.split("-")[1];
    setSelectedQuarter(getQuarterFromMonth(monthNum));
    setSelectedMonth(month);
  }, []);

  return (
    <div className="pb-16 md:pb-4">
      {/* Section-scoped action inbox — above header */}
      <div className="px-4 md:px-6 pt-4 space-y-4">
        <IncomeBookAttentionInbox
          cabinet={cabinet}
          records={cabinetRecords}
          yearlyAggregates={yearlyAggregates}
          selectedYear={selectedYear}
          qualityIssuesCount={qualityIssuesCount}
          categorizationPercent={categorizationStats.percent}
          uncategorizedCount={categorizationStats.uncategorized}
          onShowIssues={handleShowIssues}
          onShowUncategorized={handleShowUncategorized}
          onNavigateToAnalytics={onNavigateToAnalytics}
          onOpenLimitDetails={() => {
            const el = document.getElementById("limit-control");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              onNavigateToAnalytics?.();
            }
          }}
        />

        {/* Unified KPI grid (state metrics) — mobile gets a collapsible summary strip */}
        {isMobile ? (
          <IncomeBookSummaryStrip
            cabinet={cabinet}
            records={cabinetRecords}
            selectedYear={selectedYear}
          />
        ) : (
          <IncomeBookKPISection
            cabinet={cabinet}
            records={cabinetRecords}
            selectedYear={selectedYear}
          />
        )}
      </div>

      {/* Header + Filters Block (scrolls with page) */}
      <div className="px-4 md:px-6 pt-5 pb-4 space-y-2 -mx-4 md:-mx-6 border-b border-border/50">
        {/* Header row: Year + Aggregation + Export */}
        <IncomeBookHeader
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          aggregation={aggregation}
          onAggregationChange={setAggregation}
          categorizationPercent={categorizationStats.percent}
          uncategorizedCount={categorizationStats.uncategorized}
          onCategorizationClick={handleShowUncategorized}
          exportRecords={isDailyView ? filteredRecords : filteredYearRecords}
          exportPeriodLabel={
            isDailyView && selectedMonthLabel
              ? `${selectedMonthLabel} ${selectedYear}`
              : isQuarterMonthsView && selectedQuarterLabel
                ? `${selectedQuarterLabel} ${selectedYear}`
                : String(selectedYear)
          }
        />

        {/* Unified filters row */}
        <IncomeBookFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          onQuickFilterChange={handleQuickFilterChange}
          cabinetType={cabinet.type}
          isMobile={isMobile}
          filteredCount={isDailyView ? filteredRecords.length : filteredYearRecords.length}
          totalCount={totalYearRecords}
          dataQualityPercent={dataQualityPercent}
          qualityIssuesCount={qualityIssuesCount}
          issuesByType={issuesByType}
          onShowQualityIssues={handleShowIssues}
          onFilterByIssueType={handleFilterByIssueType}
          onNavigateToSettings={onNavigateToSettings}
          categorizationPercent={categorizationStats.percent}
          uncategorizedCount={categorizationStats.uncategorized}
          onCategorizationClick={isMobile ? handleShowUncategorized : undefined}
        />

      </div>

      {/* Processed-today progress banner — visible in attention mode */}
      {showProcessedBanner && (
        <div className="mt-4 px-3 py-2.5 rounded-lg border border-success/30 bg-success/5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">
                  Опрацьовано <span className="tabular-nums">{processedTodayCount}</span> з <span className="tabular-nums">{todayBatchTotal}</span> за сьогодні
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {todayBatchTotal > 0 ? Math.round((processedTodayCount / todayBatchTotal) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={todayBatchTotal > 0 ? (processedTodayCount / todayBatchTotal) * 100 : 0}
                className="h-1.5 mt-1.5 [&>div]:bg-success"
              />
            </div>
            {reviewQueue.length > 0 && (
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1 shrink-0"
                onClick={handleContinueQueue}
              >
                Продовжити
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Global search hits — when current period has 0 results but year does */}
      {globalSearchHits && (
        <div className="mt-4 px-3 py-2.5 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-start gap-2 flex-wrap">
            <Search className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                За «<span className="font-medium">{searchQuery}</span>» у поточному періоді нічого не знайдено,
                але є <span className="font-medium tabular-nums">{globalSearchHits.total}</span> {globalSearchHits.total === 1 ? "збіг" : globalSearchHits.total < 5 ? "збіги" : "збігів"} в інших місяцях {selectedYear}:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {globalSearchHits.months.map(m => (
                  <button
                    key={m.month}
                    onClick={() => handleJumpToMonth(m.month)}
                    className="text-xs px-2 py-1 rounded-md bg-background border border-border hover:bg-muted transition-colors tabular-nums"
                  >
                    {m.label} <span className="text-muted-foreground">({m.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attention mode: flat list of records that need clarification */}
      {filters.quickFilter === "needs-clarification" ? (
        <>
          {/* Attention banner */}
          <div className="mt-4 flex flex-wrap items-center gap-3 px-3 py-2.5 rounded-lg border border-warning/30 bg-warning/10">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm flex-1 min-w-0">
              <span className="font-medium text-foreground">
                Фільтр: Потребують уваги
              </span>
              <span className="text-muted-foreground tabular-nums">
                {filteredYearRecords.length} {filteredYearRecords.length === 1 ? "операція" : filteredYearRecords.length < 5 ? "операції" : "операцій"}
              </span>
              {filteredYearRecords.length > 0 && (() => {
                const dates = filteredYearRecords.map(r => r.date).sort();
                const sum = filteredYearRecords.reduce((s, r) => s + r.amount, 0);
                const fmt = (d: string) => {
                  const [, m, day] = d.split("-");
                  return `${day}.${m}`;
                };
                return (
                  <>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="text-muted-foreground tabular-nums">
                      {fmt(dates[0])}–{fmt(dates[dates.length - 1])} {selectedYear}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="text-muted-foreground tabular-nums">
                      на суму {sum.toLocaleString("uk-UA")} ₴
                    </span>
                  </>
                );
              })()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickFilterChange("all")}
              className="h-7 px-2 text-xs gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Скинути фільтр
            </Button>
          </div>

          {/* Flat list of all problematic records across the whole year */}
          <div className="mt-4">
            <GroupedDailyView
              records={filteredYearRecords}
              onRecordClick={handleRecordClick}
              isMobile={isMobile}
              showSummary={true}
              summaryLabel={`Потребують уваги · ${selectedYear}`}
              onSummaryFilterClick={handleSummaryFilterClick}
              onStatusChange={handleRecordUpdate}
              selectedIds={selectedIds}
              onToggleSelected={handleToggleSelected}
              onToggleSelectAll={handleToggleSelectAll}
              defaultAllExpanded
              flat={viewMode === "list"}
              externalDateSort={isMobile ? sortDirection : undefined}
            />
          </div>
        </>
      ) : (
        <>
          {/* Breadcrumb navigation */}
          {(isQuarterMonthsView || isDailyView) && (
            <Breadcrumb className="mt-4">
              <BreadcrumbList>
                {/* Year - always clickable to go back to aggregated */}
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    className="cursor-pointer"
                    onClick={handleBackToAggregated}
                  >
                    {selectedYear}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                
                {/* Quarter dropdown - DropdownMenu allows clicking on same value */}
                {selectedQuarter && (
                  <>
                    <BreadcrumbItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-9 px-2.5 text-sm font-medium hover:bg-muted/50 rounded-md flex items-center gap-1 outline-none focus:ring-0">
                          {selectedQuarterLabel}
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {allQuarters.map((q) => {
                            const isCurrentQuarter = selectedQuarter === q.value;
                            const showBackHint = isCurrentQuarter && isDailyView;
                            
                            return (
                              <DropdownMenuItem 
                                key={q.value} 
                                onClick={() => handleQuarterChange(q.value)}
                                className={isCurrentQuarter ? "bg-accent" : ""}
                              >
                                {showBackHint && (
                                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                )}
                                <span className={showBackHint ? "font-medium" : ""}>
                                  {q.label}
                                </span>
                                {showBackHint && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    · до таблиці
                                  </span>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                    {isDailyView && <BreadcrumbSeparator />}
                  </>
                )}
                
                {/* Month selector (when viewing daily operations) */}
                {isDailyView && selectedMonth && (
                  <BreadcrumbItem>
                    <Select value={selectedMonth} onValueChange={handleMonthChange}>
                      <SelectTrigger className="h-9 px-2.5 text-sm font-medium border-none shadow-none hover:bg-muted/50 gap-1">
                        <SelectValue>{selectedMonthLabel}</SelectValue>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMonthsForQuarter.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </BreadcrumbItem>
                )}
                
                {/* Operations count badge */}
                {isDailyView && (
                  <BreadcrumbItem className="ml-2">
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
                      {filteredRecords.length} операцій
                    </Badge>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {/* View mode toggle (always visible) + mobile-only aggregation selector */}
          <div className="mt-4 flex items-center justify-between gap-2 sm:justify-end">
            <Select
              value={aggregation}
              onValueChange={(v) => setAggregation(v as AggregationType)}
            >
              <SelectTrigger className="sm:hidden h-8 w-[160px] text-xs">
                <LayoutGrid className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">За тижнями</SelectItem>
                <SelectItem value="monthly">За місяцями</SelectItem>
                <SelectItem value="quarterly">За кварталами</SelectItem>
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as "list" | "grouped")}
              className="shrink-0 bg-muted p-0.5 rounded-lg"
              aria-label="Режим перегляду"
            >
              <ToggleGroupItem value="list" aria-label="Список" className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <List className="w-3.5 h-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grouped" aria-label="За днями" className="h-7 w-7 p-0 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                <CalendarDays className="w-3.5 h-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Main content: aggregated, quarter-months, or daily view */}
          <div className="mt-2">
            {(() => {
              const effectiveViewMode = viewMode;
              return effectiveViewMode === "list" && !isDailyView ? (
              // List mode at any aggregated level → flat list across the whole filtered period
              <GroupedDailyView
                records={isQuarterMonthsView
                  ? filteredYearRecords.filter(r => quarterMonths[selectedQuarter!]?.some(m => r.date.startsWith(`${selectedYear}-${m}`)))
                  : filteredYearRecords}
                onRecordClick={handleRecordClick}
                isMobile={isMobile}
                showSummary={true}
                summaryLabel={isQuarterMonthsView && selectedQuarterLabel
                  ? `Усього за ${selectedQuarterLabel.toLowerCase()}`
                  : `Усього за ${selectedYear}`}
                onSummaryFilterClick={handleSummaryFilterClick}
                onStatusChange={handleRecordUpdate}
                selectedIds={selectedIds}
                onToggleSelected={handleToggleSelected}
                onToggleSelectAll={handleToggleSelectAll}
                flat
              />
            ) : isDailyView ? (
              <GroupedDailyView
                records={filteredRecords}
                onRecordClick={handleRecordClick}
                isMobile={isMobile}
                showSummary={true}
                summaryLabel={selectedMonthLabel
                  ? `Усього за ${selectedMonthLabel.toLowerCase()}`
                  : "Усього"
                }
                onSummaryFilterClick={handleSummaryFilterClick}
                onStatusChange={handleRecordUpdate}
                selectedIds={selectedIds}
                onToggleSelected={handleToggleSelected}
                onToggleSelectAll={handleToggleSelectAll}
                flat={effectiveViewMode === "list"}
                externalDateSort={isMobile ? sortDirection : undefined}
              />
            ) : isQuarterMonthsView ? (
              <MonthlyView
                aggregates={quarterMonthlyAggregates}
                onMonthClick={handleMonthClick}
                isMobile={isMobile}
                showYearlyTotal={true}
                quarterLabel={selectedQuarterLabel || undefined}
              />
            ) : aggregation === "weekly" ? (
              <WeeklyView
                records={filteredYearRecords}
                year={selectedYear}
                onWeekClick={(_key, monthIso) => {
                  setSelectedMonth(monthIso);
                  const monthNum = monthIso.split("-")[1];
                  setSelectedQuarter(getQuarterFromMonth(monthNum));
                }}
              />
            ) : aggregation === "monthly" ? (
              <MonthlyView
                aggregates={yearlyAggregates}
                onMonthClick={handleMonthClick}
                isMobile={isMobile}
                showYearlyTotal={true}
              />
            ) : (
              <QuarterlyView
                aggregates={yearlyAggregates}
                year={selectedYear}
                onQuarterClick={handleQuarterClick}
                isMobile={isMobile}
              />
            );
            })()}
          </div>
        </>
      )}


      {/* Review queue: problem records (clarification or unconfirmed category), sorted by date desc.
          Used to enable Next/Prev navigation in the details sheet — closes J4 «inbox in 5 minutes». */}
      {(() => {
        const reviewQueue = cabinetRecords
          .filter(r => r.status === "needs-clarification" || (r.categoryCode && !r.categoryConfirmed))
          .sort((a, b) => b.date.localeCompare(a.date));
        const isProblem = !!selectedRecord && reviewQueue.some(r => r.id === selectedRecord.id);
        const queue = isProblem ? reviewQueue : undefined;
        const idx = selectedRecord && queue ? queue.findIndex(r => r.id === selectedRecord.id) : -1;
        const goTo = (delta: number) => {
          if (!queue || idx < 0) return;
          const next = queue[idx + delta];
          if (next) setSelectedRecord(next);
        };
        return (
          <OperationDetailsSheet
            record={selectedRecord}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            onChatPromptInsert={onChatPromptInsert}
            onRecordUpdate={handleRecordUpdate}
            queue={queue}
            onNavigatePrev={() => goTo(-1)}
            onNavigateNext={() => goTo(1)}
            onCreateReturn={(rec) => {
              toast({
                title: "Створення повернення",
                description: `Чернетку повернення на ${rec.amount} грн передано в Платежі (демо)`,
              });
              setDetailsOpen(false);
            }}
          />
        );
      })()}

      {/* Cash Reconciliation Card - for auto repair and dealer */}
      {showCashReconciliation && (
        <CashReconciliationCard
          records={filteredYearRecordsForReconciliation}
          onShowDiscrepancies={() => {
            setFilters(prev => ({
              ...prev,
              paymentTypes: ["cash"],
              sources: [],
              quickFilter: "all",
            }));
          }}
          onChatPromptInsert={onChatPromptInsert}
        />
      )}

      {/* Блок контролю ліміту - внизу після таблиць (anchor for AttentionInbox "Деталі") */}
      <div id="limit-control" className="scroll-mt-20">
        <LimitControlBlock
          cabinet={cabinet}
          yearlyAggregates={yearlyAggregates}
          selectedYear={selectedYear}
          onChatPromptInsert={onChatPromptInsert}
          onNavigateToAnalytics={onNavigateToAnalytics}
          isMobile={isMobile}
        />
      </div>

      {/* Spacer so the sticky BulkActionBar never overlaps the last block */}
      {selectedIds.size > 0 && <div aria-hidden className="h-24" />}

      {/* Sticky bulk-actions bar — appears when 1+ records are selected */}
      <BulkActionBar
        selectedRecords={selectedRecordsList}
        onClearSelection={handleClearSelection}
        onBulkConfirmCategory={handleBulkConfirmCategory}
        onBulkMarkIncome={handleBulkMarkIncome}
        onBulkMarkNotIncome={handleBulkMarkNotIncome}
        onBulkExport={handleBulkExport}
      />
    </div>
  );
};
