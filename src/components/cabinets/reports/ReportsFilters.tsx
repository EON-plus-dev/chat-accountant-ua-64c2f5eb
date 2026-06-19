import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportsFilterPopover, type ReportsDiapasonFilters } from "./ReportsFilterPopover";
import type { ReportType, ReportStatus } from "@/config/reportsConfig";

export type { ReportsDiapasonFilters };

interface ReportsFiltersProps {
  year: number;
  onYearChange: (year: number) => void;
  month?: number | null;
  onMonthChange?: (month: number | null) => void;
  selectedTypes: ReportType[];
  onTypesChange: (types: ReportType[]) => void;
  selectedStatuses: ReportStatus[];
  onStatusesChange: (statuses: ReportStatus[]) => void;
  quickFilter: string | null;
  onQuickFilterChange: (filter: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  diapason?: ReportsDiapasonFilters;
  onDiapasonChange?: (diapason: ReportsDiapasonFilters) => void;
  reviewCount?: number;
  quarterCount?: number;
  overdueCount?: number;
  availableYears?: number[];
  filteredCount?: number;
  totalCount?: number;
}

export function ReportsFilters({
  year,
  onYearChange,
  month,
  onMonthChange,
  selectedTypes,
  onTypesChange,
  selectedStatuses,
  onStatusesChange,
  quickFilter,
  onQuickFilterChange,
  searchQuery,
  onSearchChange,
  diapason,
  onDiapasonChange,
  reviewCount,
  quarterCount,
  overdueCount,
  availableYears = [2025, 2024, 2023],
  filteredCount,
  totalCount,
}: ReportsFiltersProps) {
  const isMobile = useIsMobile();

  const handleClearFilters = () => {
    onTypesChange([]);
    onStatusesChange([]);
    onQuickFilterChange(null);
    onSearchChange("");
    onMonthChange?.(null);
    onDiapasonChange?.({
      deadlineFrom: undefined,
      deadlineTo: undefined,
      amountFrom: undefined,
      amountTo: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-0 sm:w-48 sm:flex-none">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Пошук звітів..."
          className="pl-8 h-8"
        />
      </div>

      {/* Filters Popover/Drawer */}
      <ReportsFilterPopover
        year={year}
        onYearChange={onYearChange}
        month={month}
        onMonthChange={onMonthChange}
        selectedTypes={selectedTypes}
        onTypesChange={onTypesChange}
        selectedStatuses={selectedStatuses}
        onStatusesChange={onStatusesChange}
        quickFilter={quickFilter}
        onQuickFilterChange={onQuickFilterChange}
        diapason={diapason}
        onDiapasonChange={onDiapasonChange}
        onReset={handleClearFilters}
        isMobile={isMobile}
        availableYears={availableYears}
        filteredCount={filteredCount}
        totalCount={totalCount}
        reviewCount={reviewCount}
        quarterCount={quarterCount}
        overdueCount={overdueCount}
      />
    </div>
  );
}
