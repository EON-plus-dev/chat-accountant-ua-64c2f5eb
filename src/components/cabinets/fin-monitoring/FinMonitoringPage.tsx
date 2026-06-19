/**
 * Financial Monitoring Page — unified income/expense ledger for Individual cabinet
 * Single flat sortable table with 7 columns, sticky header/footer
 */

import { useState, useMemo } from "react";
import { ArrowDownLeft, ArrowUpRight, Landmark, Wallet, PenLine, Sparkles, Info, AlertCircle, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSortState } from "@/hooks/use-sort-state";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { FinMonitoringDetailSheet } from "./FinMonitoringDetailSheet";
import { FinMonitoringAttentionInbox } from "./FinMonitoringAttentionInbox";
import { FinMonitoringKPISection } from "./FinMonitoringKPISection";
import { getDemoFinMonitoringForCabinet } from "@/config/demoCabinets/getters";
import {
  type FinMonitoringRecord,
  finCategoryConfig,
  finSourceConfig,
  finStatusConfig,
  finDirectionFilterOptions,
  finSourceFilterOptions,
  finCategoryFilterOptions,
  formatUAH,
  calcKPI,
} from "@/config/finMonitoringConfig";

interface FinMonitoringPageProps {
  cabinet: Cabinet;
  onNavigateToDocumentDetail?: (documentId: string) => void;
  onNavigateToTab?: (tabId: string) => void;
}

// ========== PERIOD FILTER HELPERS ==========

type PeriodFilter = "month" | "quarter" | "year" | "all";

const periodFilterOptions = [
  { value: "month", label: "Місяць" },
  { value: "quarter", label: "Квартал" },
  { value: "year", label: "Рік" },
  { value: "all", label: "Увесь час" },
];

function filterRecordsByPeriod(records: FinMonitoringRecord[], period: PeriodFilter, selectedYear: number): FinMonitoringRecord[] {
  if (period === "all") return records;

  const now = new Date();
  const currentYear = now.getFullYear();
  const month = selectedYear === currentYear ? now.getMonth() : 11; // if past year, use full year

  let startDate: Date;
  let endDate: Date;
  if (period === "month") {
    startDate = new Date(selectedYear, month, 1);
    endDate = new Date(selectedYear, month + 1, 0, 23, 59, 59);
  } else if (period === "quarter") {
    const qStart = Math.floor(month / 3) * 3;
    startDate = new Date(selectedYear, qStart, 1);
    endDate = new Date(selectedYear, qStart + 3, 0, 23, 59, 59);
  } else {
    startDate = new Date(selectedYear, 0, 1);
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
  }

  return records.filter((r) => {
    const d = new Date(r.date);
    return d >= startDate && d <= endDate;
  });
}

function getPeriodLabel(period: PeriodFilter, selectedYear: number): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = selectedYear === currentYear ? now.getMonth() : 11;
  const monthNames = [
    "січень", "лютий", "березень", "квітень", "травень", "червень",
    "липень", "серпень", "вересень", "жовтень", "листопад", "грудень",
  ];

  switch (period) {
    case "month":
      return `за ${monthNames[month]} ${selectedYear}`;
    case "quarter": {
      const q = Math.floor(month / 3) + 1;
      return `за ${q} квартал ${selectedYear}`;
    }
    case "year":
      return `за ${selectedYear} рік`;
    case "all":
      return "за весь час";
  }
}

// ========== SORT KEY TYPE ==========

type FinSortKey = "date" | "description" | "contractor" | "category" | "source" | "amount" | "status";

function sortRecords(records: FinMonitoringRecord[], key: FinSortKey, direction: "asc" | "desc"): FinMonitoringRecord[] {
  const sorted = [...records].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "date":
        cmp = a.date.localeCompare(b.date);
        break;
      case "description":
        cmp = a.description.localeCompare(b.description, "uk");
        break;
      case "contractor":
        cmp = (a.contractor || "").localeCompare(b.contractor || "", "uk");
        break;
      case "category":
        cmp = finCategoryConfig[a.category].label.localeCompare(finCategoryConfig[b.category].label, "uk");
        break;
      case "source":
        cmp = finSourceConfig[a.source].shortLabel.localeCompare(finSourceConfig[b.source].shortLabel, "uk");
        break;
      case "amount": {
        const aVal = a.direction === "income" ? a.amount : -a.amount;
        const bVal = b.direction === "income" ? b.amount : -b.amount;
        cmp = aVal - bVal;
        break;
      }
      case "status":
        cmp = finStatusConfig[a.status].label.localeCompare(finStatusConfig[b.status].label, "uk");
        break;
    }
    return cmp;
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

// KpiCard removed — replaced by FinMonitoringKPISection (UniversalKPICard grid).

export const FinMonitoringPage = ({ cabinet, onNavigateToDocumentDetail, onNavigateToTab }: FinMonitoringPageProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("year");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedRecord, setSelectedRecord] = useState<FinMonitoringRecord | null>(null);

  const { sort, handleSort } = useSortState<FinSortKey>("date", "desc");

  const allRecords = useMemo(() => getDemoFinMonitoringForCabinet(cabinet.id), [cabinet.id]);

  // Period-filtered records (used for KPI)
  const periodRecords = useMemo(() => filterRecordsByPeriod(allRecords, periodFilter, selectedYear), [allRecords, periodFilter, selectedYear]);

  // Filter records (direction/source/category/search on top of period)
  const filteredRecords = useMemo(() => {
    return periodRecords.filter((r) => {
      if (directionFilter !== "all" && r.direction !== directionFilter) return false;
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = r.description.toLowerCase().includes(q)
          || (r.contractor?.toLowerCase().includes(q))
          || finCategoryConfig[r.category].label.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [periodRecords, directionFilter, sourceFilter, categoryFilter, searchQuery]);

  // Sorted records
  const sortedRecords = useMemo(() => sortRecords(filteredRecords, sort.key, sort.direction), [filteredRecords, sort]);

  // KPI from period-filtered records
  const kpi = useMemo(() => calcKPI(periodRecords), [periodRecords]);

  const periodLabel = getPeriodLabel(periodFilter, selectedYear);
  const filtersActive = directionFilter !== "all" || sourceFilter !== "all" || categoryFilter !== "all" || searchQuery.trim() !== "";

  const handleAddManual = () => {
    toast({ title: "Демо-режим", description: "Ручне додавання буде доступне після запуску" });
  };

  // Summary calculations for footer
  const summaryIncome = filteredRecords.filter(r => r.direction === "income").reduce((s, r) => s + r.amount, 0);
  const summaryExpense = filteredRecords.filter(r => r.direction === "expense").reduce((s, r) => s + r.amount, 0);
  const summaryBalance = summaryIncome - summaryExpense;
  const summaryTax = filteredRecords.reduce((s, r) => s + (r.taxImplication ? r.taxImplication.pdfo + r.taxImplication.vz : 0), 0);

  // Additional filters as filterSlot
  const filterSlot = (
    <div className="flex items-center gap-2">
      <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
        <SelectTrigger className="h-8 w-[85px] text-xs">
          <Calendar className="w-3 h-3 mr-1 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[2025, 2024].map((y) => (
            <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="Період" />
        </SelectTrigger>
        <SelectContent>
          {periodFilterOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sourceFilter} onValueChange={setSourceFilter}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Джерело" />
        </SelectTrigger>
        <SelectContent>
          {finSourceFilterOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Категорія" />
        </SelectTrigger>
        <SelectContent>
          {finCategoryFilterOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Section-scoped action inbox */}
      <FinMonitoringAttentionInbox
        records={allRecords}
        onShowNeedsReview={() => {
          setDirectionFilter("all");
          setSourceFilter("all");
          setCategoryFilter("all");
        }}
        onShowPending={() => {
          setDirectionFilter("all");
        }}
      />

      {/* Unified KPI grid (state metrics) */}
      <FinMonitoringKPISection records={periodRecords} periodLabel={periodLabel} />

      {/* Toolbar with filters */}
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={finDirectionFilterOptions}
        filterValue={directionFilter}
        onFilterChange={setDirectionFilter}
        filterPlaceholder="Напрямок"
        filterSlot={filterSlot}
        resultsCount={{ shown: filteredRecords.length, total: periodRecords.length }}
        sticky={false}
        className="px-0"
      />

      {/* Info notice */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground">
          Автоматичне зведення з 5 джерел: банки, документи, брокерський звіт, WISE, ручне введення
        </span>
      </div>

      {/* Records table / cards */}
      {filteredRecords.length === 0 ? (
        <div className="border rounded-lg">
          <TableEmptyState
            title={searchQuery || directionFilter !== "all" || sourceFilter !== "all"
              ? "Записів за вашим запитом не знайдено"
              : "Немає записів"}
            description={searchQuery || directionFilter !== "all" || sourceFilter !== "all"
              ? "Спробуйте змінити параметри пошуку"
              : undefined}
          />
        </div>
      ) : isMobile ? (
        /* Mobile: card layout with date */
        <div className="border border-border/70 rounded-lg overflow-hidden divide-y divide-border/50">
          {sortedRecords.map((record) => (
            <RecordCardMobile key={record.id} record={record} onClick={() => setSelectedRecord(record)} />
          ))}
        </div>
      ) : (
        /* Desktop: single flat sortable table */
        <div className="border border-border/70 rounded-lg overflow-hidden">
          <Table>
            <TableHeader sticky>
              <TableRow className="hover:bg-muted/80">
                <SortableHeader<FinSortKey>
                  field="date"
                  label="Дата"
                  currentField={sort.key}
                  direction={sort.direction}
                  onSort={handleSort}
                  compact
                  className="w-[90px]"
                />
                <SortableHeader<FinSortKey>
                  field="description"
                  label="Опис"
                  currentField={sort.key}
                  direction={sort.direction}
                  onSort={handleSort}
                  compact
                />
                <SortableHeader<FinSortKey>
                  field="contractor"
                  label="Контрагент"
                  currentField={sort.key}
                  direction={sort.direction}
                  onSort={handleSort}
                  compact
                  className="w-[140px]"
                />
                <SortableHeader<FinSortKey>
                  field="category"
                  label="Категорія"
                  currentField={sort.key}
                  direction={sort.direction}
                  onSort={handleSort}
                  compact
                  className="w-[130px]"
                />
                <SortableHeader<FinSortKey>
                  field="source"
                  label="Джерело"
                  currentField={sort.key}
                  direction={sort.direction}
                  onSort={handleSort}
                  compact
                  className="w-[90px]"
                />
                <SortableHeader<FinSortKey>
                  field="amount"
                  label="Сума"
                  currentField={sort.key}
                  direction={sort.direction}
                  onSort={handleSort}
                  compact
                  numeric
                  align="right"
                  className="w-[130px]"
                />
                <SortableHeader<FinSortKey>
                  field="status"
                  label="Статус"
                  currentField={sort.key}
                  direction={sort.direction}
                  onSort={handleSort}
                  compact
                  className="w-[110px]"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => (
                <RecordRow key={record.id} record={record} onClick={() => setSelectedRecord(record)} />
              ))}
            </TableBody>
            <TableFooter sticky>
              <TableRow>
                <TableCell compact colSpan={5} className="text-sm font-medium">
                  {filteredRecords.length} записів{filtersActive ? " (відфільтровано)" : ""}
                </TableCell>
                <TableCell compact numeric className="text-sm tabular-nums">
                  <div className="space-y-0.5">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold">+{formatUAH(summaryIncome)}</div>
                    <div className="text-rose-600 dark:text-rose-400 font-semibold">−{formatUAH(summaryExpense)}</div>
                    <div className={cn("font-bold", summaryBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                      = {formatUAH(summaryBalance)}
                    </div>
                  </div>
                </TableCell>
                <TableCell compact className="text-sm">
                  <span className="text-muted-foreground text-xs">ПДФО+ВЗ:</span>
                  <div className="font-semibold text-violet-600 dark:text-violet-400 tabular-nums">{formatUAH(summaryTax)}</div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}

      {/* Mobile summary footer */}
      {isMobile && filteredRecords.length > 0 && (
        <Card>
          <CardContent className="p-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Записів{filtersActive ? " (відфільтровано)" : ""}
              </p>
              <p className="text-sm font-semibold tabular-nums">{filteredRecords.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Доходи</p>
              <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatUAH(summaryIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Витрати</p>
              <p className="text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">{formatUAH(summaryExpense)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Сальдо</p>
              <p className={cn("text-sm font-semibold tabular-nums", summaryBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                {summaryBalance >= 0 ? "+" : "−"}{formatUAH(Math.abs(summaryBalance))}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">ПДФО + ВЗ</p>
              <p className="text-sm font-semibold tabular-nums text-violet-600 dark:text-violet-400">{formatUAH(summaryTax)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" variant="default" onClick={handleAddManual} className="gap-1.5">
          <PenLine className="w-3.5 h-3.5" /> Додати запис
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => toast({ title: "Демо-режим", description: "AI-класифікація буде доступна після запуску" })}
          className="gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
        >
          <Sparkles className="w-3.5 h-3.5" /> AI: Класифікувати
        </Button>
      </div>

      {/* Detail Sheet */}
      <FinMonitoringDetailSheet
        record={selectedRecord}
        open={!!selectedRecord}
        onOpenChange={(open) => { if (!open) setSelectedRecord(null); }}
        onNavigateToDocumentDetail={onNavigateToDocumentDetail ? (docId) => {
          setSelectedRecord(null);
          onNavigateToDocumentDetail(docId);
        } : undefined}
        onNavigateToTab={onNavigateToTab ? (tabId) => {
          setSelectedRecord(null);
          onNavigateToTab(tabId);
        } : undefined}
      />
    </div>
  );
};

// ========== RECORD ROW (desktop) — with date column ==========

const RecordRow = ({ record, onClick }: { record: FinMonitoringRecord; onClick: () => void }) => {
  const catCfg = finCategoryConfig[record.category];
  const srcCfg = finSourceConfig[record.source];
  const statusCfg = finStatusConfig[record.status];
  const CatIcon = catCfg.icon;
  const SrcIcon = srcCfg.icon;
  const isIncome = record.direction === "income";
  const needsReview = record.status === "needs-review";

  const dateFormatted = format(parseISO(record.date), "dd.MM", { locale: uk });

  return (
    <TableRow className="cursor-pointer" onClick={onClick}>
      <TableCell compact className="text-sm tabular-nums text-muted-foreground">
        {dateFormatted}
      </TableCell>
      <TableCell compact className="text-sm">
        <div className="flex items-center gap-2">
          {isIncome ? (
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          )}
          <span className="truncate">{record.description}</span>
        </div>
      </TableCell>
      <TableCell compact className="text-sm text-muted-foreground truncate">
        {record.contractor || "—"}
      </TableCell>
      <TableCell compact className="text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("shrink-0 rounded-md p-1", catCfg.badgeClass)}>
            <CatIcon className="h-3 w-3" />
          </span>
          <span className="text-xs truncate">{catCfg.label}</span>
        </span>
      </TableCell>
      <TableCell compact className="text-sm">
        <Badge variant="outline" className={cn("text-[10px] gap-1 py-0", srcCfg.badgeClass)}>
          <SrcIcon className="h-2.5 w-2.5" />
          {srcCfg.shortLabel}
        </Badge>
      </TableCell>
      <TableCell compact numeric className="text-sm">
        <span className={cn(
          "font-semibold tabular-nums",
          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        )}>
          {isIncome ? "+" : "−"}{formatUAH(record.amount)}
        </span>
        {record.taxImplication && (record.taxImplication.pdfo + record.taxImplication.vz) > 0 && (
          <span className="block text-[10px] text-violet-500 dark:text-violet-400 tabular-nums mt-0.5">
            ПДФО+ВЗ: {formatUAH(record.taxImplication.pdfo + record.taxImplication.vz)}
          </span>
        )}
      </TableCell>
      <TableCell compact className="text-sm">
        <div className="flex items-center gap-1">
          {needsReview && <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" />}
          <Badge variant="secondary" size="sm" className={cn("font-medium", statusCfg.badgeClass)}>
            {statusCfg.label}
          </Badge>
        </div>
      </TableCell>
    </TableRow>
  );
};

// ========== RECORD CARD (mobile) — with date ==========

const RecordCardMobile = ({ record, onClick }: { record: FinMonitoringRecord; onClick: () => void }) => {
  const catCfg = finCategoryConfig[record.category];
  const srcCfg = finSourceConfig[record.source];
  const statusCfg = finStatusConfig[record.status];
  const CatIcon = catCfg.icon;
  const isIncome = record.direction === "income";
  const needsReview = record.status === "needs-review";

  const dateFormatted = format(parseISO(record.date), "dd.MM", { locale: uk });

  return (
    <div className="px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <div className={cn("rounded-lg p-2 shrink-0", catCfg.badgeClass)}>
        <CatIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{record.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground tabular-nums">{dateFormatted}</span>
          <span className="text-xs text-muted-foreground">{srcCfg.shortLabel}</span>
          {record.contractor && (
            <span className="text-xs text-muted-foreground truncate">• {record.contractor}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={cn(
          "text-sm font-semibold tabular-nums",
          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
        )}>
          {isIncome ? "+" : "−"}{formatUAH(record.amount)}
        </p>
        {record.taxImplication && (record.taxImplication.pdfo + record.taxImplication.vz) > 0 && (
          <p className="text-[10px] text-violet-500 dark:text-violet-400 tabular-nums">
            ПДФО+ВЗ: {formatUAH(record.taxImplication.pdfo + record.taxImplication.vz)}
          </p>
        )}
        <div className="flex items-center gap-1 justify-end">
          {needsReview && <AlertCircle className="h-3 w-3 text-orange-500 shrink-0" />}
          <Badge variant="secondary" size="sm" className={cn("text-[10px] mt-0.5", statusCfg.badgeClass)}>
            {statusCfg.label}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default FinMonitoringPage;
