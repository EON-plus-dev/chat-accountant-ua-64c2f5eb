import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Landmark, AlertTriangle, CheckCircle2, Wallet, Coins, LayoutGrid, List, CalendarDays, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { taxTypeConfig } from "@/config/paymentsConfig";
import { taxFullName } from "./taxFormulas";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PaymentsAttentionInbox } from "@/components/cabinets/payments/PaymentsAttentionInbox";
import { TaxPaymentsTab } from "@/components/cabinets/payments/TaxPaymentsTab";
import { UniversalPaymentDetailSheet } from "@/components/cabinets/payments/UniversalPaymentDetailSheet";
import {
  getTaxPaymentsForCabinet,
  type TaxPayment,
  type TaxType,
} from "@/config/paymentsConfig";
import { normalizeTaxPayment, type UnifiedPayment } from "@/config/unifiedPaymentsConfig";
import { effectiveTaxStatus } from "@/lib/taxStatus";
import type { Cabinet } from "@/types/cabinet";
import { useTaxesKPIs } from "./useTaxesKPIs";
import { TaxTypeOverviewGrid } from "./TaxTypeOverviewGrid";

import { TaxDetailSheet } from "./TaxDetailSheet";
import { TaxCalendarView } from "./TaxCalendarView";
import { TaxDetailPage } from "./okp/TaxDetailPage";

interface TaxesPageProps {
  cabinet: Cabinet;
  onNavigateToReport?: (reportId?: string) => void;
  /** Period дозволяє Книзі доходів одразу позиціонуватись на потрібному кварталі. */
  onNavigateToIncomeBook?: (period?: { year: number; quarter?: number }) => void;
  onNavigateToCalendar?: () => void;
  onChatPromptInsert?: (prompt: string) => void;
}

const fmt = (n: number) => `${Math.round(n).toLocaleString("uk-UA")} ₴`;

export function TaxesPage({
  cabinet,
  onNavigateToReport,
  onNavigateToIncomeBook,
  onNavigateToCalendar,
  onChatPromptInsert,
}: TaxesPageProps) {
  const allTaxPayments = useMemo(
    () => getTaxPaymentsForCabinet(cabinet.id),
    [cabinet.id],
  );

  const availableYears = useMemo(() => {
    const set = new Set<number>(allTaxPayments.map((p) => p.year));
    if (set.size === 0) set.add(2026);
    return Array.from(set).sort((a, b) => b - a);
  }, [allTaxPayments]);

  const [year, setYear] = useState<number>(availableYears[0] ?? 2026);

  const viewModeStorageKey = `taxes:viewMode:${cabinet.id}`;
  type ViewMode = "cards" | "list" | "calendar";
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "cards";
    const saved = window.localStorage.getItem(viewModeStorageKey);
    if (saved === "list" || saved === "calendar") return saved;
    return "cards";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(viewModeStorageKey, viewMode);
    }
  }, [viewMode, viewModeStorageKey]);

  

  // Controlled filters для TaxPaymentsTab
  const [statusFilter, setStatusFilter] = useState("all");
  const [taxTypeFilter, setTaxTypeFilter] = useState("all");

  const yearPayments = useMemo(
    () => allTaxPayments.filter((p) => p.year === year),
    [allTaxPayments, year],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const matchesSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return () => true;
    return (p: TaxPayment) => {
      const cfg = taxTypeConfig[p.taxType];
      const haystack = [
        cfg?.label,
        cfg?.shortLabel,
        taxFullName[p.taxType],
        p.taxTypeLabel,
        p.period,
        p.budgetCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    };
  }, [searchQuery]);

  const searchedYearPayments = useMemo(
    () => yearPayments.filter(matchesSearch),
    [yearPayments, matchesSearch],
  );

  const kpis = useTaxesKPIs(yearPayments);

  const [selectedUnified, setSelectedUnified] = useState<UnifiedPayment | null>(null);
  const [selectedTaxPaymentDetail, setSelectedTaxPaymentDetail] = useState<TaxPayment | null>(null);
  const [taxDetailType, setTaxDetailType] = useState<TaxType | null>(null);
  const [asOf, setAsOf] = useState<Date>(() => new Date());

  const openTaxPayment = (payment: TaxPayment) => {
    setSelectedUnified(normalizeTaxPayment(payment));
  };

  const openTaxDetailForType = (taxType: TaxType) => {
    setTaxDetailType(taxType);
  };

  const openTaxDetailForPayment = (payment: TaxPayment) => {
    setSelectedTaxPaymentDetail(payment);
  };

  // Глибока навігація з Огляду: ?taxPaymentId=… → відкриваємо drill-sheet
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("taxPaymentId");
    if (!id) return;
    const found = allTaxPayments.find((p) => p.id === id);
    if (found) {
      if (found.year !== year) setYear(found.year);
      openTaxPayment(found);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("taxPaymentId");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTaxPayments]);

  // Hydrate ?taxDetail=&year=&asOf= один раз на маунті
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = searchParams.get("taxDetail") as TaxType | null;
    const y = searchParams.get("year");
    const a = searchParams.get("asOf");
    if (t && taxTypeConfig[t]) setTaxDetailType(t);
    if (y && /^\d{4}$/.test(y)) setYear(parseInt(y, 10));
    if (a && /^\d{4}-\d{2}-\d{2}$/.test(a)) {
      const d = new Date(a);
      if (!isNaN(d.getTime())) setAsOf(d);
    }
  }, []);

  // Sync state → URL (без додавання історії)
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (taxDetailType) {
      next.set("taxDetail", taxDetailType);
      next.set("year", String(year));
      next.set("asOf", asOf.toISOString().slice(0, 10));
    } else {
      next.delete("taxDetail");
      next.delete("year");
      next.delete("asOf");
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxDetailType, year, asOf]);


  /**
   * Декларація: беремо relatedReportId з найсвіжішого незакритого платежу цього типу
   * (fallback — будь-який з relatedReportId, інакше — відкриваємо ReportsPage без highlight).
   */
  const handleOpenDeclaration = (taxType: TaxType, samples: TaxPayment[]) => {
    const today = new Date();
    const open = samples.find(
      (p) => p.relatedReportId && effectiveTaxStatus(p, today) !== "paid",
    );
    const any = samples.find((p) => p.relatedReportId);
    onNavigateToReport?.(open?.relatedReportId ?? any?.relatedReportId);
  };

  const handleOpenAllOverdueInbox = () => {
    setViewMode("list");
    setStatusFilter("overdue");
    setTaxTypeFilter("all");
    setTimeout(
      () =>
        document.getElementById("taxes-list")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50,
    );
  };

  // Повноекранна ОКП-сторінка для одного податку — рендериться замість усього вмісту розділу.
  if (taxDetailType) {
    const detailPayments = allTaxPayments.filter(
      (p) => p.taxType === taxDetailType && p.year === year,
    );
    return (
      <>
        <TaxDetailPage
          cabinet={cabinet}
          taxType={taxDetailType}
          year={year}
          payments={detailPayments}
          asOf={asOf}
          availableYears={availableYears}
          onYearChange={setYear}
          onAsOfChange={setAsOf}
          onBack={() => setTaxDetailType(null)}
          onOpenPayment={openTaxPayment}
          onOpenDeclaration={onNavigateToReport ? handleOpenDeclaration : undefined}
          onOpenIncomeBook={onNavigateToIncomeBook}
          onOpenCalendar={onNavigateToCalendar}
        />
        <UniversalPaymentDetailSheet
          open={!!selectedUnified}
          onOpenChange={(open) => !open && setSelectedUnified(null)}
          payment={selectedUnified}
          onNavigateToIncomeBook={onNavigateToIncomeBook}
          onNavigateToReport={onNavigateToReport}
          onExplainInChat={onChatPromptInsert}
        />
      </>
    );
  }

  return (
    <div className="space-y-5 pt-3">
      {/* AttentionInbox — дивимось на УСІ роки, бо прострочене з минулих років не може зникнути */}
      <PaymentsAttentionInbox
        sectionKey={`taxes:${cabinet.id}`}
        taxPayments={allTaxPayments}
        onOpenPayment={(id) => {
          const p = allTaxPayments.find((x) => x.id === id);
          if (p) openTaxPayment(p);
        }}
        onOpenAllOverdue={handleOpenAllOverdueInbox}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <UniversalKPICard
          title="Нараховано"
          value={fmt(kpis.accrued)}
          icon={Landmark}
          density="compact"
          description={`${yearPayments.length} ${yearPayments.length === 1 ? "позиція" : "позицій"}`}
        />
        <UniversalKPICard
          title="Сплачено"
          value={fmt(kpis.paid)}
          icon={CheckCircle2}
          density="compact"
          variant="success"
          description={
            kpis.accrued > 0
              ? `${Math.round((kpis.paid / kpis.accrued) * 100)}% від нарахованого`
              : "—"
          }
        />
        <UniversalKPICard
          title="До сплати"
          value={fmt(kpis.due)}
          icon={Wallet}
          density="compact"
          description={`${kpis.dueCount} ${kpis.dueCount === 1 ? "платіж" : "платежів"}`}
        />
        <UniversalKPICard
          title="Прострочено"
          value={fmt(kpis.overdue)}
          icon={AlertTriangle}
          density="compact"
          variant={kpis.overdueCount > 0 ? "danger" : "default"}
          description={
            kpis.sanctions > 0
              ? `+${fmt(kpis.sanctions)} санкції`
              : kpis.overdueCount > 0
                ? `${kpis.overdueCount} ${kpis.overdueCount === 1 ? "позиція" : "позицій"}`
                : "Без прострочень"
          }
        />
        {/* Головна цифра — клік відкриває Popover з розкладом */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-left col-span-2 sm:col-span-1">
              <UniversalKPICard
                title="Разом до сплати"
                value={fmt(kpis.totalDue)}
                icon={Coins}
                density="compact"
                variant={kpis.overdueCount > 0 ? "danger" : kpis.totalDue > 0 ? "warning" : "success"}
                description="з санкціями · клік"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-xs sm:w-72" align="end" collisionPadding={12}>
            <div className="text-sm font-semibold mb-2">Розклад «Разом до сплати»</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground min-w-0">До сплати (поточні)</span>
                <span className="tabular-nums shrink-0">{fmt(kpis.due)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground min-w-0">Прострочене (тіло)</span>
                <span className="tabular-nums shrink-0">{fmt(kpis.overdue)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground min-w-0">Штраф (ст. 124 ПКУ) + пеня (ст. 129 ПКУ)</span>
                <span className="tabular-nums text-rose-600 shrink-0">+{fmt(kpis.sanctions)}</span>
              </div>
              <div className="border-t border-border/60 pt-1.5 mt-2 flex justify-between gap-3 font-semibold text-sm">
                <span>Разом</span>
                <span className="tabular-nums shrink-0">{fmt(kpis.totalDue)}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Sub-header контролів — безпосередньо перед блоком списку/карток */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук: ЄП, IV кв, КБК…"
              className="pl-8 pr-8 h-9 text-sm"
              aria-label="Пошук податків"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Очистити пошук"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              {searchedYearPayments.length} знайдено
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
            className="bg-muted p-0.5 rounded-lg"
          >
            <ToggleGroupItem
              value="cards"
              aria-label="Картки по типах податків"
              className="gap-1.5 text-xs h-7 px-2 sm:px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Картки</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="Перелік нарахувань"
              className="gap-1.5 text-xs h-7 px-2 sm:px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Список</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="calendar"
              aria-label="Календар податків"
              className="gap-1.5 text-xs h-7 px-2 sm:px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Календар</span>
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[96px] sm:w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y} рік
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Огляд: один із режимів — Картки / Список / Календар */}
      <div id="taxes-list">
        {viewMode === "cards" ? (
          <TaxTypeOverviewGrid
            payments={searchedYearPayments}
            year={year}
            hasEmployees={cabinet.hasEmployees === true}
            onOpenPayment={openTaxPayment}
            onOpenDeclaration={onNavigateToReport ? handleOpenDeclaration : undefined}
            onOpenIncomeBook={onNavigateToIncomeBook}
            onOpenDetail={openTaxDetailForType}
          />
        ) : viewMode === "calendar" ? (
          <TaxCalendarView
            payments={searchedYearPayments}
            year={year}
            onOpenPayment={openTaxPayment}
            onOpenTaxDetail={openTaxDetailForPayment}
            onOpenFullCalendar={onNavigateToCalendar}
          />
        ) : (
          <TaxPaymentsTab
            payments={allTaxPayments}
            onOpenPayment={openTaxPayment}
            onOpenTaxDetail={openTaxDetailForPayment}
            onNavigateToReport={onNavigateToReport}
            onNavigateToIncomeBook={onNavigateToIncomeBook ? () => onNavigateToIncomeBook() : undefined}
            yearFilter={String(year)}
            onYearFilterChange={(v) => setYear(parseInt(v))}
            hideYearSelector
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            taxTypeFilter={taxTypeFilter}
            onTaxTypeFilterChange={setTaxTypeFilter}
            externalFilter={searchQuery ? matchesSearch : undefined}
          />
        )}
      </div>

      <TaxDetailSheet
        open={!!selectedTaxPaymentDetail}
        onOpenChange={(open) => !open && setSelectedTaxPaymentDetail(null)}
        payment={selectedTaxPaymentDetail}
        payments={allTaxPayments}
        onOpenTaxType={(taxType) => {
          setSelectedTaxPaymentDetail(null);
          setTaxDetailType(taxType);
        }}
        onOpenPayment={(p) => {
          setSelectedTaxPaymentDetail(null);
          openTaxPayment(p);
        }}
        onOpenDeclaration={onNavigateToReport ? handleOpenDeclaration : undefined}
        onOpenIncomeBook={onNavigateToIncomeBook}
        onOpenCalendar={onNavigateToCalendar}
      />

      <UniversalPaymentDetailSheet
        open={!!selectedUnified}
        onOpenChange={(open) => !open && setSelectedUnified(null)}
        payment={selectedUnified}
        onNavigateToIncomeBook={onNavigateToIncomeBook}
        onNavigateToReport={onNavigateToReport}
        onExplainInChat={onChatPromptInsert}
      />
    </div>
  );
}
