import { useState, useMemo, useCallback, useEffect } from "react";
import { useSortState, type SortDirection } from "@/hooks/use-sort-state";
import { Plus, FileText, ChevronDown, Calendar, Users, Settings, Table as TableIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import type { Report, ReportType, ReportStatus, FopGroup } from "@/config/reportsConfig";
import { getReportsForCabinet, migrateReportStatus, reportTypeConfig, reportStatusConfig } from "@/config/reportsConfig";
import { addRuntimeExtraTaxPayment } from "@/config/paymentsConfig";
import { generateAnnualSchedule } from "@/lib/reportScheduleEngine";
import type { ScheduledGeneration } from "@/lib/reportGenerationScheduler";
import { getReportAutomationSettingsForCabinet } from "@/config/settingsConfig";
import { useAutoReportGeneration } from "@/hooks/useAutoReportGeneration";
import { type ReportsHubStats } from "./reportsHubTypes";
import { ReportsAttentionInbox } from "./ReportsAttentionInbox";
import { ReportsFilters, type ReportsDiapasonFilters } from "./ReportsFilters";
import { ReportsTable } from "./ReportsTable";

import { ReportTimelineCalendar } from "./ReportTimelineCalendar";
import { ReportReviewPage } from "./ReportReviewPage";
import { ReportPreviewDialog } from "./ReportPreviewDialog";
import { ReportCorrectionSheet } from "./ReportCorrectionSheet";
import { SyncStatusButton } from "@/components/ui/SyncStatusButton";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { getCabinetPaymentDisciplineStats, getPaymentDiscipline } from "@/lib/paymentDiscipline";
import { resolvePaymentStatusForReport } from "@/lib/paymentResolver";
import { useHubBreadcrumb } from "@/components/cabinets/shared/hub-breadcrumb/HubBreadcrumbContext";

interface ReportsPageProps {
  cabinet: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  onNavigateToSettings?: () => void;
  onNavigateToPayment?: (paymentId: string) => void;
  onNavigateToEmployee?: (employeeId: string) => void;
  highlightReportId?: string | null;
  onHighlightClear?: () => void;
}

// Get current quarter
function getCurrentQuarter(): number {
  return Math.ceil((new Date().getMonth() + 1) / 3);
}

export function ReportsPage({ 
  cabinet, 
  onChatPromptInsert, 
  onNavigateToSettings,
  onNavigateToPayment,
  onNavigateToEmployee,
  highlightReportId,
  onHighlightClear 
}: ReportsPageProps) {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  
  // Smart initial year: pick latest year from reports if current year has none
  const initialYear = useMemo(() => {
    const reports = getReportsForCabinet(cabinet.id);
    if (reports.length === 0) return currentYear;
    const hasCurrentYear = reports.some(r => r.year === currentYear);
    if (hasCurrentYear) return currentYear;
    return Math.max(...reports.map(r => r.year));
  }, [cabinet.id, currentYear]);
  
  // State
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<ReportType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [diapason, setDiapason] = useState<ReportsDiapasonFilters>({});
  // Reset month when year changes — month indices belong to a specific year
  useEffect(() => {
    setSelectedMonth(null);
  }, [selectedYear]);
  // (selectedReport state removed — unified into reportToReview as part of Phase 2.2)
  const viewModeStorageKey = `reports-view-mode:${cabinet.id}`;
  const [viewMode, setViewMode] = useState<"table" | "calendar">(() => {
    if (typeof window === "undefined") return "table";
    try {
      const raw = window.localStorage.getItem(viewModeStorageKey);
      return raw === "calendar" || raw === "table" ? raw : "table";
    } catch {
      return "table";
    }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(viewModeStorageKey, viewMode);
    } catch {
      // ignore
    }
  }, [viewMode, viewModeStorageKey]);
  // reviewSheetOpen retained for backward compat with handlers; sheet UI removed
  const [, setReviewSheetOpen] = useState(false);
  const [reportToReview, setReportToReview] = useState<Report | null>(null);
  const [bannerPreviewReport, setBannerPreviewReport] = useState<Report | null>(null);
  const [correctionSheetOpen, setCorrectionSheetOpen] = useState(false);
  const [reportToCorrect, setReportToCorrect] = useState<Report | null>(null);
  // Persist payment overrides per-cabinet so refresh keeps "Сплачено" status (UI-mock).
  const overridesStorageKey = `reports-payment-overrides:${cabinet.id}`;
  const [reportOverrides, setReportOverrides] = useState<Record<string, Partial<Report>>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(overridesStorageKey);
      return raw ? (JSON.parse(raw) as Record<string, Partial<Report>>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(overridesStorageKey, JSON.stringify(reportOverrides));
    } catch {
      // ignore quota / serialization errors
    }
  }, [reportOverrides, overridesStorageKey]);
  
  // Sorting state
  type ReportSortKey = "typeLabel" | "deadline" | "status" | "amountToPay";
  const { sort, handleSort } = useSortState<ReportSortKey>("deadline", "asc");

  // Determine FOP group from cabinet
  const fopGroup: FopGroup = useMemo(() => {
    return cabinet.fopGroup || 3;
  }, [cabinet.fopGroup]);

  // Determine if cabinet has employees
  const hasEmployees = cabinet.hasEmployees || false;

  // FOP cabinets rely on AI auto-generation — hide primary "Create" button
  const isFopCabinet = cabinet.type === "fop" || cabinet.type === "fop-group";

  // Generate annual schedule based on cabinet configuration
  const annualSchedule = useMemo(() => {
    return generateAnnualSchedule(fopGroup, selectedYear, false, hasEmployees);
  }, [fopGroup, selectedYear, hasEmployees]);

  // Get reports for this cabinet (with local session overrides applied)
  const allReports = useMemo(() => {
    const base = getReportsForCabinet(cabinet.id);
    return base.map((r) => {
      const ov = reportOverrides[r.id];
      return ov ? { ...r, ...ov } : r;
    });
  }, [cabinet.id, reportOverrides]);

  // Auto-open highlighted report
  useEffect(() => {
    if (highlightReportId) {
      const report = allReports.find(r => r.id === highlightReportId);
      if (report) {
        setReportToReview(report);
        onHighlightClear?.();
      }
    }
  }, [highlightReportId, allReports, onHighlightClear]);

  // Інтеграція з глобальним breadcrumb (Управління / Звіти / <Звіт · Період>)
  const { setExtraCrumbs } = useHubBreadcrumb();
  useEffect(() => {
    if (reportToReview) {
      const typeLabel =
        reportToReview.typeLabel ||
        reportTypeConfig[reportToReview.type]?.label ||
        "Звіт";
      const label = reportToReview.periodLabel
        ? `${typeLabel} · ${reportToReview.periodLabel}`
        : typeLabel;
      setExtraCrumbs([
        {
          id: `report-${reportToReview.id}`,
          label,
          onSelect: () => setReportToReview(null),
        },
      ]);
    } else {
      setExtraCrumbs([]);
    }
    return () => setExtraCrumbs([]);
  }, [reportToReview, setExtraCrumbs]);

  // Filter reports
  const filteredReports = useMemo(() => {
    let reports = allReports;

    // Year filter
    reports = reports.filter((r) => r.year === selectedYear);

    // Month filter (single, 0-11) — synced with timeline DotStrip
    if (selectedMonth !== null) {
      reports = reports.filter((r) => new Date(r.deadline).getMonth() === selectedMonth);
    }

    // Type filter (multi-select: empty = all)
    if (selectedTypes.length > 0) {
      reports = reports.filter(r => selectedTypes.includes(r.type));
    }

    // Status filter (multi-select: empty = all)
    if (selectedStatuses.length > 0) {
      reports = reports.filter(r => selectedStatuses.includes(r.status) || selectedStatuses.includes(migrateReportStatus(r.status)));
    }

    // Quick filters (using new autonomous status system)
    if (quickFilter === "review") {
      reports = reports.filter(r => {
        const status = migrateReportStatus(r.status);
        return status === "review" || status === "approved";
      });
    } else if (quickFilter === "due-this-quarter") {
      const currentQuarter = getCurrentQuarter();
      reports = reports.filter(r => 
        r.quarter === currentQuarter && 
        !["accepted", "submitted"].includes(migrateReportStatus(r.status))
      );
    } else if (quickFilter === "overdue") {
      const now = new Date();
      reports = reports.filter(r => 
        new Date(r.deadline) < now && 
        !["accepted", "submitted"].includes(migrateReportStatus(r.status))
      );
    } else if (quickFilter === "accepted-only") {
      reports = reports.filter(r => migrateReportStatus(r.status) === "accepted");
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      reports = reports.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.typeLabel?.toLowerCase().includes(query) ||
        r.periodLabel?.toLowerCase().includes(query)
      );
    }

    // Diapason filters (deadline + amount range)
    if (diapason.deadlineFrom) {
      const fromTs = diapason.deadlineFrom.getTime();
      reports = reports.filter((r) => new Date(r.deadline).getTime() >= fromTs);
    }
    if (diapason.deadlineTo) {
      // Inclusive end-of-day
      const toTs = new Date(diapason.deadlineTo).setHours(23, 59, 59, 999);
      reports = reports.filter((r) => new Date(r.deadline).getTime() <= toTs);
    }
    if (diapason.amountFrom !== undefined) {
      reports = reports.filter((r) => (r.amountToPay ?? 0) >= diapason.amountFrom!);
    }
    if (diapason.amountTo !== undefined) {
      reports = reports.filter((r) => (r.amountToPay ?? 0) <= diapason.amountTo!);
    }

    return reports; // Sorting is handled in ReportsTable
  }, [allReports, selectedYear, selectedMonth, selectedTypes, selectedStatuses, quickFilter, searchQuery, diapason]);

  // Check if has active filters
  const hasActiveFilters =
    selectedMonth !== null ||
    selectedTypes.length > 0 ||
    selectedStatuses.length > 0 ||
    quickFilter !== null ||
    searchQuery.trim() !== "" ||
    !!(diapason.deadlineFrom || diapason.deadlineTo || diapason.amountFrom !== undefined || diapason.amountTo !== undefined);

  // Year reports count for display
  const yearReportsCount = useMemo(() => allReports.filter(r => r.year === selectedYear).length, [allReports, selectedYear]);

  // Helper functions for filter labels
  const getTypeLabel = (type: ReportType) => reportTypeConfig[type]?.label || type;
  const getStatusLabel = (status: ReportStatus) => reportStatusConfig[status]?.label || status;
  const getQuickFilterLabel = (filter: string) => {
    switch (filter) {
      case "review": return "На перевірку";
      case "due-this-quarter": return "Цей квартал";
      case "overdue": return "Прострочені";
      case "accepted-only": return "Прийняті";
      default: return filter;
    }
  };
  const monthFullNames = [
    "Січень","Лютий","Березень","Квітень","Травень","Червень",
    "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень",
  ];
  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setSelectedMonth(null);
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setQuickFilter(null);
    setSearchQuery("");
    setDiapason({});
  }, []);

  // SSOT — single hubStats memo. Replaces 5 separate `migrateReportStatus` calls
  // that previously lived inside ReportsActionHub. Hub is now pure-presentational.
  const hubStats: ReportsHubStats = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const yearReports = allReports.filter((r) => r.year === selectedYear);

    // Pre-normalize once per report.
    const normalized = yearReports.map((r) => ({
      ...r,
      normalizedStatus: migrateReportStatus(r.status) as ReportStatus,
    }));

    // Upcoming (deadline within 90d, not finalized) — sorted asc.
    const upcoming = normalized
      .filter((r) => {
        const d = new Date(r.deadline);
        return d >= now && d <= horizon &&
          r.normalizedStatus !== "submitted" &&
          r.normalizedStatus !== "accepted";
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    const reviewArr = normalized.filter((r) => r.normalizedStatus === "review");
    const approvedArr = normalized.filter((r) => r.normalizedStatus === "approved");
    const sortByDeadline = (a: Report, b: Report) =>
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    const firstReport =
      [...reviewArr].sort(sortByDeadline)[0] ??
      [...approvedArr].sort(sortByDeadline)[0] ??
      null;

    const submittedCount = normalized.filter(
      (r) => r.normalizedStatus === "submitted" || r.normalizedStatus === "accepted",
    ).length;

    const disciplineStats = getCabinetPaymentDisciplineStats(allReports, selectedYear);

    // 6-month sparkline buckets (lifted from Hub).
    const buckets: Array<{ month: number; ok: number; late: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ month: d.getMonth() + d.getFullYear() * 12, ok: 0, late: 0 });
    }
    for (const report of allReports) {
      const resolved = resolvePaymentStatusForReport(report);
      if (resolved.status !== "paid") continue;
      const paidDate = resolved.paidDate ?? report.paymentDate;
      if (!paidDate) continue;
      const pd = new Date(paidDate);
      const key = pd.getMonth() + pd.getFullYear() * 12;
      const bucket = buckets.find((b) => b.month === key);
      if (!bucket) continue;
      const { kind } = getPaymentDiscipline(paidDate, report.deadline);
      if (kind === "late") bucket.late++;
      else bucket.ok++;
    }
    const sparkline = buckets.map((b, idx) => {
      const total = b.ok + b.late;
      const monthDate = new Date(Math.floor(b.month / 12), b.month % 12, 1);
      return {
        x: idx,
        rate: total === 0 ? null : Math.round((b.ok / total) * 100),
        label: format(monthDate, "LLL yyyy", { locale: uk }),
        ok: b.ok,
        total,
      };
    });

    return {
      upcoming,
      review: {
        total: reviewArr.length + approvedArr.length,
        fresh: reviewArr.length,
        firstReport,
      },
      submittedCount,
      discipline: {
        onTimeRate: disciplineStats.onTimeRate,
        totalPaid: disciplineStats.totalPaid,
        lateCount: disciplineStats.lateCount,
      },
      sparkline,
    };
  }, [allReports, selectedYear]);

  // Calculate counts for quick filters (derived from hubStats where possible)
  const filterCounts = useMemo(() => {
    const yearReports = allReports.filter(r => r.year === selectedYear);
    const currentQuarter = getCurrentQuarter();
    const now = new Date();

    return {
      review: hubStats.review.total,
      quarter: yearReports.filter(r =>
        r.quarter === currentQuarter &&
        !["accepted", "submitted"].includes(migrateReportStatus(r.status))
      ).length,
      overdue: yearReports.filter(r =>
        new Date(r.deadline) < now &&
        !["accepted", "submitted"].includes(migrateReportStatus(r.status))
      ).length,
    };
  }, [allReports, selectedYear, hubStats.review.total]);

  // Handlers
  const handleQuickFilterChange = useCallback((filter: string | null) => {
    setQuickFilter(filter);
  }, []);

  // KPI cards now apply real filters via popover state
  const handleKpiApplyFilter = useCallback((filter: "review" | "overdue") => {
    setQuickFilter(filter);
  }, []);

  /**
   * View routing matrix (Phase 2.2 — unified):
   *  - All cabinets (FOP / business / individual) → ReportReviewPage
   *    (individual-specific blocks live conditionally inside ReportReviewPage).
   *  - ReportPreviewDialog → quick-look only (banner preview, hover-card).
   *  - ReportFormPreview   → PDF render (specialized, opened from inside views).
   */
  const handleOpenReport = useCallback((report: Report) => {
    setReportToReview(report);
  }, []);

  const handleExplainInChat = useCallback((report: Report) => {
    onChatPromptInsert?.(`Поясни звіт "${report.name}" за ${report.periodLabel}`);
  }, [onChatPromptInsert]);

  const handleCreateReport = useCallback((type: string) => {
    toast({
      title: "Демо-режим",
      description: `Створення «${type}» буде доступне після запуску`,
    });
  }, [toast]);

  // Handler for auto-generated reports
  const handleReportsGenerated = useCallback((reports: Report[]) => {
    toast({
      title: "Звіти згенеровано",
      description: `Створено ${reports.length} чернетк(ок)`,
    });
    if (reports.length > 0) {
      setReportToReview(reports[0]);
    }
  }, [toast]);

  // Handler for single report generated from banner
  const handleBannerReportGenerated = useCallback((report: Report) => {
    toast({
      title: "Чернетку згенеровано",
      description: `${report.name} готова до перегляду`,
    });
    setReportToReview(report);
  }, [toast]);

  // Review handlers (now drive the full ReportReviewPage)
  const handleApproveReport = useCallback((reportId: string) => {
    toast({
      title: "Звіт підтверджено",
      description: "Статус змінено на 'Підтверджено'. Готово до подання.",
    });
    setReviewSheetOpen(false);
    setReportToReview(null);
  }, [toast]);

  const handleRejectReport = useCallback((reportId: string, reason: string) => {
    toast({
      title: "Звіт відхилено",
      description: reason,
      variant: "destructive",
    });
    setReviewSheetOpen(false);
    setReportToReview(null);
  }, [toast]);

  const handleRequestCorrection = useCallback((reportId: string) => {
    const report = allReports.find(r => r.id === reportId);
    if (report) {
      setReviewSheetOpen(false);
      setReportToReview(report);
    }
  }, [allReports]);

  // Correction sheet handlers
  const handleOpenCorrectionSheet = useCallback((report: Report) => {
    setReportToCorrect(report);
    setCorrectionSheetOpen(true);
  }, []);

  // Draft / submission lifecycle handlers (session-only overlays)
  const handleCreateDraft = useCallback((report: Report) => {
    setReportOverrides((prev) => ({
      ...prev,
      [report.id]: {
        ...(prev[report.id] || {}),
        status: "review",
        draftReady: true,
      },
    }));
    // Reflect status change in currently opened review view
    setReportToReview((curr) =>
      curr && curr.id === report.id
        ? { ...curr, status: "review", draftReady: true }
        : curr
    );
    toast({
      title: "Чернетку сформовано",
      description: "Перевірте дані нижче та натисніть «Подати звіт»",
    });
  }, [toast]);

  const handleSubmitReport = useCallback((report: Report) => {
    const submittedDate = new Date().toISOString();
    setReportOverrides((prev) => ({
      ...prev,
      [report.id]: {
        ...(prev[report.id] || {}),
        status: "submitted",
        submittedDate,
      },
    }));
    setReportToReview((curr) =>
      curr && curr.id === report.id
        ? { ...curr, status: "submitted", submittedDate }
        : curr
    );
    toast({
      title: "Звіт подано",
      description: "Підпишіть КЕП у Кабінеті ДПС, що відкрився у новій вкладці",
    });
  }, [toast]);

  // Mark payment as paid (manual fallback) — updates report.paymentStatus + paymentDate
  // + creates a synthetic TaxPayment in the runtime store so автодетект бачить його.
  const handleMarkPaid = useCallback(
    (
      reportId: string,
      data: {
        paidDate: Date;
        amount: number;
        reference?: string;
        paymentType: "ep" | "esv" | "vz";
        paymentTypeLabel: string;
      }
    ) => {
      const isoDate = data.paidDate.toISOString().slice(0, 10);
      setReportOverrides((prev) => ({
        ...prev,
        [reportId]: {
          ...(prev[reportId] || {}),
          paymentStatus: "paid",
          paymentDate: isoDate,
          paymentReference: data.reference,
        },
      }));
      setReportToReview((curr) =>
        curr && curr.id === reportId
          ? {
              ...curr,
              paymentStatus: "paid",
              paymentDate: isoDate,
              paymentReference: data.reference,
            }
          : curr
      );
      const report = allReports.find((r) => r.id === reportId);

      // Створюємо синтетичний запис у runtime-сторі платежів для автодетекту
      const taxTypeMap: Record<typeof data.paymentType, "ep" | "esv" | "military-fop"> = {
        ep: "ep",
        esv: "esv",
        vz: "military-fop",
      };
      addRuntimeExtraTaxPayment({
        id: `manual-${reportId}-${data.paymentType}-${Date.now()}`,
        cabinetId: cabinet.id,
        taxType: taxTypeMap[data.paymentType],
        taxTypeLabel: data.paymentTypeLabel,
        period: report?.periodLabel ?? "",
        year: report?.year ?? new Date().getFullYear(),
        quarter: report?.quarter,
        amountToPay: data.amount,
        status: "paid",
        statusLabel: "Сплачено",
        deadline: report?.deadline ?? isoDate,
        paidDate: isoDate,
        paidAmount: data.amount,
        relatedReportId: reportId,
        relatedReportName: report?.name,
        createdAt: new Date().toISOString(),
        paymentOrderNumber: data.reference,
      });

      const formattedDate = data.paidDate.toLocaleDateString("uk-UA");
      const formattedAmount = new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 2,
      }).format(data.amount);
      toast({
        title: `${data.paymentTypeLabel} позначено як сплачений`,
        description: `${report?.name ?? "Звіт"} • ${formattedAmount} • ${formattedDate}${
          data.reference ? ` • №${data.reference}` : ""
        }`,
      });
    },
    [toast, allReports, cabinet.id]
  );

  const handleEditDraft = useCallback((report: Report) => {
    setReportToReview(report);
  }, []);

  const handleCorrectionCreated = useCallback((correctionReport: Report) => {
    toast({
      title: "Коригуючий звіт створено",
      description: `${correctionReport.name} готовий до перевірки`,
    });
    setCorrectionSheetOpen(false);
    setReportToCorrect(null);
    setReportToReview(correctionReport);
  }, [toast]);

  // Navigate to report handler
  const handleNavigateToReport = useCallback((reportId: string) => {
    const report = allReports.find(r => r.id === reportId);
    if (report) {
      setReportToReview(report);
    }
  }, [allReports]);

  // Handler for banner preview action
  const handleBannerPreview = useCallback((reportType: string, period: string) => {
    // Find scheduled report with matching type and period
    const report = allReports.find(
      r => r.type === reportType && r.periodLabel === period && r.status === "scheduled"
    );
    if (report) {
      setBannerPreviewReport(report);
    } else {
      // Fallback: find any scheduled report of that type
      const fallback = allReports.find(r => r.type === reportType && r.status === "scheduled");
      if (fallback) setBannerPreviewReport(fallback);
    }
  }, [allReports]);

  // Generate mock scheduled generations for banner
  const scheduledGenerations: ScheduledGeneration[] = useMemo(() => {
    // Create mock scheduled generations based on annual schedule
    return annualSchedule.slice(0, 3).map((item, index) => ({
      id: `gen-${item.type}-${item.period}`,
      reportType: item.type,
      period: item.period,
      year: selectedYear,
      deadline: item.deadline,
      generationDate: new Date(new Date(item.deadline).getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      notificationDate: new Date(new Date(item.deadline).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: index === 0 ? "pending" as const : "pending" as const,
    }));
  }, [annualSchedule, selectedYear]);

  // Automation settings
  const automationSettings = useMemo(() => getReportAutomationSettingsForCabinet(cabinet), [cabinet]);

  // Auto-generation hook
  const {
    isAutoGenerating,
    generatingReportType,
    triggerNow,
    hasError,
    errorMessage,
  } = useAutoReportGeneration({
    cabinet,
    scheduledGenerations,
    automationSettings,
    onReportsGenerated: handleReportsGenerated,
    enabled: true,
  });

  // (Banner ↔ Hero KPI mutual exclusion logic moved into ReportsActionHub.)
  const previousReportForReview = useMemo(() => {
    if (!reportToReview) return null;
    const sameType = allReports
      .filter(r => r.id !== reportToReview.id && r.type === reportToReview.type)
      .filter(r => new Date(r.deadline) < new Date(reportToReview.deadline))
      .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
    return sameType[0] || null;
  }, [reportToReview, allReports]);

  // If viewing a report being reviewed (full page) — unified for all cabinet types.
  if (reportToReview) {
    return (
      <ReportReviewPage
        report={reportToReview}
        previousReport={previousReportForReview}
        onBack={() => setReportToReview(null)}
        onApprove={handleApproveReport}
        onReject={handleRejectReport}
        onRequestCorrection={handleRequestCorrection}
        onCreateDraft={handleCreateDraft}
        onSubmitReport={handleSubmitReport}
        onChatPromptInsert={onChatPromptInsert}
        onNavigateToPayment={onNavigateToPayment}
        onNavigateToEmployee={onNavigateToEmployee}
        onMarkPaid={handleMarkPaid}
        allReports={allReports}
        onNavigateToReport={handleNavigateToReport}
      />
    );
  }

  return (
    <div className="pt-5 space-y-6 min-w-0 overflow-x-hidden">
      {/* Unified AttentionInbox — section-scoped action items */}
      <ReportsAttentionInbox
        hubStats={hubStats}
        onOpenReport={handleOpenReport}
        onApplyFilter={handleKpiApplyFilter}
        isAutoGenerating={isAutoGenerating}
        generatingReportType={generatingReportType}
        hasError={hasError}
        errorMessage={errorMessage}
        onRetryGeneration={triggerNow}
      />

      {/* Banner Preview Dialog */}
      <ReportPreviewDialog
        report={bannerPreviewReport}
        open={!!bannerPreviewReport}
        onOpenChange={(open) => !open && setBannerPreviewReport(null)}
      />

      {/* Report Correction Sheet */}
      <ReportCorrectionSheet
        open={correctionSheetOpen}
        onOpenChange={setCorrectionSheetOpen}
        report={reportToCorrect}
        onCreateCorrection={handleCorrectionCreated}
      />

      {/* Unified Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
        <div className="flex-1 min-w-0">
          <ReportsFilters
            year={selectedYear}
            onYearChange={setSelectedYear}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            selectedStatuses={selectedStatuses}
            onStatusesChange={setSelectedStatuses}
            quickFilter={quickFilter}
            onQuickFilterChange={handleQuickFilterChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            diapason={diapason}
            onDiapasonChange={setDiapason}
            reviewCount={filterCounts.review}
            quarterCount={filterCounts.quarter}
            overdueCount={filterCounts.overdue}
            availableYears={(() => {
              const years = [...new Set(allReports.map(r => r.year))].sort((a, b) => b - a);
              if (!years.includes(currentYear)) years.unshift(currentYear);
              return years;
            })()}
            filteredCount={filteredReports.length}
            totalCount={allReports.filter(r => r.year === selectedYear).length}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <SyncStatusButton
            cabinetType={cabinet.type}
            variant="reports"
            onNavigateToSettings={onNavigateToSettings}
          />

          {/* View Mode Toggle (moved to header for discoverability) */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "calendar")}>
            <TabsList className="h-8">
              <TabsTrigger value="table" className="text-xs px-2.5 h-7">
                <TableIcon className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Таблиця</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs px-2.5 h-7">
                <Calendar className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Графік</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* "Create" — only for non-FOP cabinets. FOP-кабінети покладаються на AI-автогенерацію. */}
          {!isFopCabinet && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-8 gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Створити</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCreateReport("Декларація ЄП")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Декларація ЄП
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateReport("Звіт ЄСВ")}>
                  <FileText className="h-4 w-4 mr-2" />
                  ЄСВ
                </DropdownMenuItem>
                {hasEmployees && (
                  <DropdownMenuItem onClick={() => handleCreateReport("Податковий розрахунок (4ДФ)")}>
                    <Users className="h-4 w-4 mr-2" />
                    Податковий розрахунок (4ДФ)
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleCreateReport("Військовий збір")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Військовий збір
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateReport("МПЗ")}>
                  <FileText className="h-4 w-4 mr-2" />
                  МПЗ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateReport("Інший звіт")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Інший звіт
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/*
            FOP cabinets: ручне створення приховано з шапки (низька discoverability + перевантаження тулбару).
            Доступне через empty-state CTA в таблиці (handled by ReportsTable when yearHasNoReports && isFopCabinet).
            Phase 2.4 — view-unification cleanup.
          */}
        </div>
      </div>

      {/* Active Filters Row - shown only when filters are active. Один лічильник «Знайдено». */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Знайдено: <span className="font-medium text-foreground">{filteredReports.length}</span> з {yearReportsCount}
          </span>

          {selectedMonth !== null && (
            <Badge variant="secondary" className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10">
              {monthFullNames[selectedMonth]}
              <X className="h-3 w-3" onClick={() => setSelectedMonth(null)} />
            </Badge>
          )}

          {selectedTypes.map(type => {
            const label = getTypeLabel(type);
            return (
              <Badge key={type} variant="secondary" className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10 max-w-[180px]" title={label}>
                <span className="truncate">{label}</span>
                <X className="h-3 w-3 shrink-0" onClick={() => setSelectedTypes(prev => prev.filter(t => t !== type))} />
              </Badge>
            );
          })}

          {selectedStatuses.map(status => {
            const label = getStatusLabel(status);
            return (
              <Badge key={status} variant="secondary" className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10 max-w-[180px]" title={label}>
                <span className="truncate">{label}</span>
                <X className="h-3 w-3 shrink-0" onClick={() => setSelectedStatuses(prev => prev.filter(s => s !== status))} />
              </Badge>
            );
          })}

          {quickFilter && (
            <Badge variant="secondary" className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10">
              {getQuickFilterLabel(quickFilter)}
              <X className="h-3 w-3" onClick={() => setQuickFilter(null)} />
            </Badge>
          )}

          {searchQuery.trim() && (
            <Badge variant="secondary" className="h-6 px-2 text-xs gap-1 cursor-pointer hover:bg-destructive/10">
              «{searchQuery}»
              <X className="h-3 w-3" onClick={() => setSearchQuery("")} />
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={handleClearAllFilters} className="h-6 px-2 text-xs text-foreground hover:text-foreground hover:bg-muted shrink-0 ml-auto sm:ml-0">
            <X className="h-3 w-3 mr-1" />
            Скинути
          </Button>
        </div>
      )}

      {/* Content */}
      <div>
        {viewMode === "calendar" ? (
          <ReportTimelineCalendar
            schedule={annualSchedule}
            reports={allReports}
            filteredReports={filteredReports}
            filterTypes={selectedTypes}
            filterStatuses={selectedStatuses}
            quickFilter={quickFilter}
            hasActiveFilters={hasActiveFilters}
            year={selectedYear}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onScheduleItemClick={(item) => {
              const relatedReport = allReports.find(r =>
                r.type === item.type &&
                r.periodLabel?.includes(item.periodLabel || "")
              );
              if (relatedReport) {
                setReportToReview(relatedReport);
              } else {
                toast({
                  title: "Звіт не сформовано",
                  description: `${item.periodLabel} — ще не створено`,
                });
              }
            }}
          />
        ) : (
          <ReportsTable
            reports={filteredReports}
            sortKey={sort.key}
            sortDirection={sort.direction}
            onSort={handleSort}
            onOpenReport={handleOpenReport}
            onExplainInChat={handleExplainInChat}
            onResetFilters={handleClearAllFilters}
            selectedYear={selectedYear}
            yearHasNoReports={yearReportsCount === 0}
            fallbackYear={(() => {
              const years = [...new Set(allReports.map(r => r.year))]
                .filter(y => y !== selectedYear)
                .sort((a, b) => b - a);
              return years[0];
            })()}
            onSwitchYear={setSelectedYear}
            isFopCabinet={isFopCabinet}
            onNavigateToSettings={onNavigateToSettings}
          />
        )}
      </div>
    </div>
  );
}
