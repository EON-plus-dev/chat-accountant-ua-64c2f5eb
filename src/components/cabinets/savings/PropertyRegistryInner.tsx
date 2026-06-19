import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Home, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { OperationCard, extractTypeLabel, getTypeIcon } from "../OperationCard";
import { PropertyTaxDetailSheet } from "../PropertyTaxDetailSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSortState } from "@/hooks/use-sort-state";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAmountColor, getStatusClassName } from "@/config/semanticStyles";
import {
  individualLeafOperations,
  type DemoRecord,
  type OperationsSubTab,
  type RecordStatus,
} from "@/config/operationsConfig";

const statusFilterOptions: { value: string; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "paid", label: "Сплачено" },
  { value: "pending", label: "Очікує" },
  { value: "ok", label: "Норма" },
  { value: "warning", label: "Увага" },
];

const propertySubtab = individualLeafOperations.find((s) => s.id === "property")!;

const extractYearFromRecord = (record: DemoRecord): string | null => {
  if (record.columns.year) return String(record.columns.year);
  for (const key of ["date", "deadline", "lastActivity", "lastMove", "lastRun"]) {
    const value = String(record.columns[key] || "");
    const match = value.match(/\d{2}\.\d{2}\.(\d{4})/);
    if (match) return match[1];
  }
  return null;
};

const parseCurrency = (value: string | number) => {
  const amount = parseFloat(String(value).replace(/[^\d]/g, ""));
  return Number.isNaN(amount) ? 0 : amount;
};

const formatUAH = (value: number) =>
  value > 0 ? `${new Intl.NumberFormat("uk-UA").format(value)} ₴` : "—";

const StatusBadge = ({ status, label }: { status?: RecordStatus; label?: string }) => {
  if (!status || !label) return null;
  return (
    <Badge variant="secondary" size="sm" className={cn("font-medium", getStatusClassName(status))}>
      {label}
    </Badge>
  );
};

interface PropertyRegistryTableProps {
  subtab: OperationsSubTab;
  searchQuery: string;
  statusFilter: string;
  yearFilter: string;
  onRowClick: (record: DemoRecord) => void;
  onResultsChange: (shown: number, total: number) => void;
}

const PropertyRegistryTable = ({
  subtab,
  searchQuery,
  statusFilter,
  yearFilter,
  onRowClick,
  onResultsChange,
}: PropertyRegistryTableProps) => {
  const isMobile = useIsMobile();
  const { sort, handleSort } = useSortState<string>("");

  const processedRecords = useMemo(() => {
    let records = (subtab.demoRecords ?? []).filter((record) => {
      if (statusFilter !== "all" && record.status !== statusFilter) return false;
      if (yearFilter !== "all") {
        const recordYear = extractYearFromRecord(record);
        if (recordYear && recordYear !== yearFilter) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return Object.values(record.columns).some((value) => String(value).toLowerCase().includes(query));
      }
      return true;
    });

    if (sort.key) {
      records = [...records].sort((a, b) => {
        const aValue = sort.key === "status" ? a.statusLabel ?? "" : a.columns[sort.key] ?? "";
        const bValue = sort.key === "status" ? b.statusLabel ?? "" : b.columns[sort.key] ?? "";
        const aNumber = parseFloat(String(aValue).replace(/[^\d.-]/g, ""));
        const bNumber = parseFloat(String(bValue).replace(/[^\d.-]/g, ""));
        if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
          return sort.direction === "asc" ? aNumber - bNumber : bNumber - aNumber;
        }
        const comparison = String(aValue).localeCompare(String(bValue), "uk");
        return sort.direction === "asc" ? comparison : -comparison;
      });
    }

    return records;
  }, [subtab.demoRecords, searchQuery, statusFilter, yearFilter, sort]);

  useEffect(() => {
    onResultsChange(processedRecords.length, subtab.demoRecords?.length ?? 0);
  }, [onResultsChange, processedRecords.length, subtab.demoRecords?.length]);

  if (processedRecords.length === 0) {
    return (
      <div className="border rounded-lg">
        <TableEmptyState
          title={searchQuery || statusFilter !== "all" ? "Записів за вашим запитом не знайдено" : "Немає записів"}
          description={searchQuery || statusFilter !== "all" ? "Спробуйте змінити параметри пошуку" : undefined}
        />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        {processedRecords.map((record) => (
          <OperationCard key={record.id} record={record} subtab={subtab} onClick={() => onRowClick(record)} />
        ))}
      </div>
    );
  }

  const totalObjects = processedRecords.length;
  const totalTax = processedRecords.reduce((sum, record) => sum + parseCurrency(record.columns.taxYear || ""), 0);
  const paidTax = processedRecords
    .filter((record) => record.status === "paid")
    .reduce((sum, record) => sum + parseCurrency(record.columns.taxYear || ""), 0);
  const pendingTax = processedRecords
    .filter((record) => record.status === "pending")
    .reduce((sum, record) => sum + parseCurrency(record.columns.taxYear || ""), 0);

  return (
    <div className="border border-border/70 rounded-lg overflow-hidden">
      <Table>
        <TableHeader sticky>
          <TableRow className="hover:bg-muted/80">
            {subtab.tableColumns?.map((column) => (
              <TableHead
                key={column.key}
                compact
                sortable
                style={{ width: column.width }}
                onSort={() => handleSort(column.key)}
                numeric={column.align === "right"}
                sorted={sort.key === column.key}
                sortDirection={sort.key === column.key ? sort.direction : null}
                className={cn(column.align === "center" && "text-center")}
              >
                <span className="inline-flex items-center">
                  {column.label}
                  <SortIndicator active={sort.key === column.key} direction={sort.direction} />
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedRecords.map((record) => (
            <TableRow
              key={record.id}
              className="cursor-pointer"
              onClick={() => onRowClick(record)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick(record);
                }
              }}
            >
              {subtab.tableColumns?.map((column) => (
                <TableCell
                  key={column.key}
                  compact
                  numeric={column.align === "right"}
                  className={cn("text-sm", column.align === "center" && "text-center")}
                >
                  {column.key === "status" ? (
                    <StatusBadge status={record.status} label={record.statusLabel} />
                  ) : column.key === "type" ? (() => {
                    const TypeIcon = getTypeIcon(record.columns[column.key]);
                    return (
                      <span className="inline-flex items-center gap-2">
                        <span className="shrink-0 rounded-md bg-primary/10 p-1.5">
                          <TypeIcon className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span>{extractTypeLabel(record.columns[column.key])}</span>
                      </span>
                    );
                  })() : column.key === "event" && record.columns[column.key] ? (
                    <Badge variant="outline" className="pointer-events-none">{record.columns[column.key]}</Badge>
                  ) : column.key === "area" ? (
                    <span className="text-muted-foreground tabular-nums">{record.columns[column.key]}</span>
                  ) : column.key === "description" ? (
                    <span className="text-muted-foreground">{record.columns[column.key]}</span>
                  ) : (
                    <span className={cn(column.key === "taxYear" && "font-medium tabular-nums", getAmountColor(String(record.columns[column.key])))}>
                      {record.columns[column.key]}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter sticky>
          <TableRow className="hover:bg-transparent">
            <TableCell compact colSpan={2} className="text-sm font-medium">
              Усього обʼєктів: {totalObjects}
            </TableCell>
            <TableCell compact className="text-sm" />
            <TableCell compact className="text-sm text-muted-foreground">Податок:</TableCell>
            <TableCell compact numeric className="text-sm font-semibold tabular-nums">
              {formatUAH(totalTax)}
            </TableCell>
            <TableCell compact className="text-sm">
              {paidTax > 0 && <span className="text-success tabular-nums mr-2">✓ {formatUAH(paidTax)}</span>}
              {pendingTax > 0 && <span className="text-warning tabular-nums">⏳ {formatUAH(pendingTax)}</span>}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

interface PropertyRegistryInnerProps {
  onGoToRegistry?: () => void;
}

export default function PropertyRegistryInner({ onGoToRegistry }: PropertyRegistryInnerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [resultsCount, setResultsCount] = useState<{ shown: number; total: number }>();
  const [selectedRecord, setSelectedRecord] = useState<DemoRecord | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    propertySubtab.demoRecords?.forEach((record) => {
      const year = extractYearFromRecord(record);
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, []);

  const handleRowClick = (record: DemoRecord) => {
    setSelectedRecord(record);
    setEditorOpen(true);
  };

  const handleResultsChange = useCallback((shown: number, total: number) => {
    setResultsCount((previous) => (
      previous?.shown === shown && previous?.total === total ? previous : { shown, total }
    ));
  }, []);

  const handleCtaClick = (buttonId: string, label: string) => {
    if (buttonId === "go-to-registry" && onGoToRegistry) {
      onGoToRegistry();
      return;
    }
    toast({ title: "Демо-режим", description: `«${label}» буде доступна після запуску` });
  };

  return (
    <div className="space-y-5">
      {propertySubtab.notice && (
        <div className="flex items-center gap-2 px-3 py-2 bg-info/10 border border-info/20 rounded-lg text-sm">
          <Home className="w-4 h-4 text-info flex-shrink-0" />
          <span className="text-foreground/80">{propertySubtab.notice}</span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <UnifiedToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filterOptions={statusFilterOptions}
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterPlaceholder="Статус"
            resultsCount={resultsCount}
            sticky={false}
            className="px-0"
          />
        </div>
        {availableYears.length > 1 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Фільтр по року"
            >
              <option value="all">Усі роки</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <PropertyRegistryTable
        subtab={propertySubtab}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        yearFilter={yearFilter}
        onRowClick={handleRowClick}
        onResultsChange={handleResultsChange}
      />

      {propertySubtab.ctaButtons && propertySubtab.ctaButtons.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {propertySubtab.ctaButtons.map((button) => {
            const ButtonIcon = button.aiAction ? Sparkles : button.icon;
            return (
              <Button
                key={button.id}
                variant={button.variant || "default"}
                size="sm"
                onClick={() => handleCtaClick(button.id, button.label)}
                className="gap-1.5"
              >
                {ButtonIcon && <ButtonIcon className="w-3.5 h-3.5" />}
                {button.label}
              </Button>
            );
          })}
        </div>
      )}

      <PropertyTaxDetailSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        record={selectedRecord}
        onGoToRegistry={onGoToRegistry}
      />
    </div>
  );
}