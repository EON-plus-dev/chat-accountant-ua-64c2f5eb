import { useState, useCallback, useRef, useEffect } from "react";
import { 
  SlidersHorizontal, 
  Search, 
  X,
  Check,
  Tags,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DataQualityButton } from "@/components/ui/DataQualityButton";
import { SyncStatusButton } from "@/components/ui/SyncStatusButton";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import type { FilterState } from "./IncomeBookPage";
import type { PaymentType, DataSource, IssueType } from "@/config/incomeBookConfig";
import { demoDataSources, issueTypeConfig } from "@/config/incomeBookConfig";
import type { CabinetType } from "@/types/cabinet";

// Sort options for different view modes
export type SortField = "date" | "amount" | "status" | "source";
export type SortDirection = "asc" | "desc";

interface IncomeBookFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onQuickFilterChange: (filter: FilterState["quickFilter"]) => void;
  isMobile?: boolean;
  cabinetType: CabinetType;
  // Results count
  filteredCount?: number;
  totalCount?: number;
  // Data quality
  dataQualityPercent?: number;
  qualityIssuesCount?: number;
  issuesByType?: Record<IssueType, number>;
  onShowQualityIssues?: () => void;
  onFilterByIssueType?: (issueType: string) => void;
  // Navigation handler
  onNavigateToSettings?: () => void;
  // Compliance / categorization (mobile shows it inside drawer)
  categorizationPercent?: number;
  uncategorizedCount?: number;
  onCategorizationClick?: () => void;
}

const paymentTypeOptions: { value: PaymentType; label: string }[] = [
  { value: "cash", label: "Готівка" },
  { value: "bank", label: "Безготівка" },
  { value: "card", label: "Платіжні системи" },
  { value: "prro", label: "ПРРО" },
];

const sourceOptions: { value: DataSource; label: string }[] = [
  { value: "monobank", label: "Monobank" },
  { value: "privat24", label: "Приват24" },
  { value: "way4pay", label: "Way4Pay" },
  { value: "liqpay", label: "LiqPay" },
  { value: "prro", label: "ПРРО" },
  { value: "manual", label: "Вручну" },
];

const quickFilters: { value: FilterState["quickFilter"]; label: string; tooltip: string }[] = [
  { value: "income-only", label: "Тільки доходи", tooltip: "Операції, включені до доходу книги" },
  { value: "not-income", label: "Не в дохід", tooltip: "Операції, що не враховуються в дохід" },
  { value: "returns", label: "Повернення", tooltip: "Повернення та коригування" },
  { value: "needs-clarification", label: "⚠ Потребують уваги", tooltip: "Операції, що потребують уточнення" },
];

// Helper to get source status from demoDataSources (for filters display only)
const getSourceStatusFromDemo = (sourceId: DataSource) => {
  const source = demoDataSources.find((s) => s.id === sourceId);
  return source || null;
};

// Get status indicator color for filter display
const getFilterSourceStatusColor = (source: ReturnType<typeof getSourceStatusFromDemo>) => {
  if (!source || !source.connected) return "bg-muted";
  switch (source.status) {
    case "ok":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-muted";
  }
};

// Format last sync date - compact format for filters
const formatLastSyncForFilter = (dateStr?: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const IncomeBookFilters = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onQuickFilterChange,
  isMobile,
  cabinetType,
  filteredCount,
  totalCount,
  dataQualityPercent = 100,
  qualityIssuesCount = 0,
  issuesByType,
  onShowQualityIssues,
  onFilterByIssueType,
  onNavigateToSettings,
  categorizationPercent = 100,
  uncategorizedCount = 0,
  onCategorizationClick,
}: IncomeBookFiltersProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const hasActiveFilters =
    filters.paymentTypes.length > 0 ||
    filters.sources.length > 0 ||
    filters.showOnlyReturns ||
    filters.excludeReturns ||
    !!filters.dateRange?.from;

  const activeFiltersCount = filters.paymentTypes.length + filters.sources.length +
    (filters.showOnlyReturns ? 1 : 0) + (filters.excludeReturns ? 1 : 0) +
    (filters.dateRange?.from ? 1 : 0);

  const togglePaymentType = (type: PaymentType) => {
    const current = filters.paymentTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, paymentTypes: updated });
  };

  const toggleSource = (source: DataSource) => {
    const current = filters.sources;
    const updated = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    onFiltersChange({ ...filters, sources: updated });
  };

  const selectAllPaymentTypes = () => {
    const allSelected = filters.paymentTypes.length === paymentTypeOptions.length;
    onFiltersChange({
      ...filters,
      paymentTypes: allSelected ? [] : paymentTypeOptions.map((o) => o.value),
    });
  };

  const selectAllSources = () => {
    const allSelected = filters.sources.length === sourceOptions.length;
    onFiltersChange({
      ...filters,
      sources: allSelected ? [] : sourceOptions.map((o) => o.value),
    });
  };

  const clearFilters = useCallback(() => {
    onFiltersChange({
      paymentTypes: [],
      sources: [],
      showOnlyReturns: false,
      excludeReturns: false,
      quickFilter: "all",
      dateRange: undefined,
    });
    onSearchChange("");
  }, [onFiltersChange, onSearchChange]);

  // SyncSourcesContent replaced by unified SyncStatusButton component

  // Compliance helpers
  const isGoodCat = categorizationPercent >= 95;
  const isWarningCat = categorizationPercent < 80;
  const allCategorized = uncategorizedCount === 0;
  const showCompliance = onCategorizationClick !== undefined;

  // Categorization chip — used as `extraSection` inside DataQualityButton ("Відповідність").
  const categorizationExtra = showCompliance ? (
    <button
      type="button"
      onClick={() => onCategorizationClick?.()}
      className={cn(
        "w-full flex items-center gap-2 h-11 px-3 rounded-lg border transition-colors text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        allCategorized && isGoodCat
          ? "border-success/40 bg-success/10 hover:bg-success/15 text-success"
          : isWarningCat
            ? "border-warning/40 bg-warning/10 hover:bg-warning/15 text-warning"
            : "border-border/70 bg-muted/30 hover:bg-muted/50",
      )}
    >
      {allCategorized && isGoodCat ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <Tags className="w-4 h-4 shrink-0" />
      )}
      <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
        <span className="text-sm font-medium">Категоризовано</span>
        <span className="text-sm font-semibold tabular-nums">{categorizationPercent}%</span>
        {!allCategorized && (
          <span className="text-xs text-muted-foreground tabular-nums truncate">
            · {uncategorizedCount} без категорії
          </span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 shrink-0 opacity-60" />
    </button>
  ) : null;

  // Filters Content for both Popover and Drawer (NO quick filters - they're in toolbar only)
  const FiltersContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className="space-y-4">

      {/* Period (custom date range) */}
      <DateRangeFilter
        value={filters.dateRange}
        onChange={(range) => onFiltersChange({ ...filters, dateRange: range })}
        presets={["today", "yesterday", "this-week", "this-month", "last-month", "this-quarter", "this-year"]}
      />

      <Separator />

      {/* Payment types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Тип надходжень</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllPaymentTypes}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {filters.paymentTypes.length === paymentTypeOptions.length ? "Скасувати" : "Обрати все"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {paymentTypeOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`${inDrawer ? 'drawer-' : ''}payment-${opt.value}`}
                checked={filters.paymentTypes.includes(opt.value)}
                onCheckedChange={() => togglePaymentType(opt.value)}
              />
              <Label
                htmlFor={`${inDrawer ? 'drawer-' : ''}payment-${opt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Sources with connection status */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Джерело</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllSources}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {filters.sources.length === sourceOptions.length ? "Скасувати" : "Обрати все"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {sourceOptions.map((opt) => {
            const sourceStatus = getSourceStatusFromDemo(opt.value);
            const isConnected = sourceStatus?.connected ?? false;
            const lastSync = formatLastSyncForFilter(sourceStatus?.lastSync);

            return (
              <TooltipProvider key={opt.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          getFilterSourceStatusColor(sourceStatus)
                        )}
                      />
                      <Checkbox
                        id={`${inDrawer ? 'drawer-' : ''}source-${opt.value}`}
                        checked={filters.sources.includes(opt.value)}
                        onCheckedChange={() => toggleSource(opt.value)}
                      />
                      <Label
                        htmlFor={`${inDrawer ? 'drawer-' : ''}source-${opt.value}`}
                        className={cn(
                          "text-sm font-normal cursor-pointer flex-1",
                          !isConnected && "text-muted-foreground"
                        )}
                      >
                        {opt.label}
                      </Label>
                      {!isConnected && (
                        <span className="text-xs text-muted-foreground">
                          Не підкл.
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  {lastSync && (
                    <TooltipContent side="right" className="text-xs">
                      Синхронізовано: {lastSync}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Returns filters */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Повернення</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${inDrawer ? 'drawer-' : ''}show-only-returns`}
              checked={filters.showOnlyReturns}
              disabled={filters.excludeReturns}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, showOnlyReturns: !!checked })
              }
            />
            <Label 
              htmlFor={`${inDrawer ? 'drawer-' : ''}show-only-returns`} 
              className="text-sm font-normal cursor-pointer"
            >
              Показати тільки повернення
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${inDrawer ? 'drawer-' : ''}exclude-returns`}
              checked={filters.excludeReturns}
              disabled={filters.showOnlyReturns}
              onCheckedChange={(checked) =>
                onFiltersChange({ ...filters, excludeReturns: !!checked })
              }
            />
            <Label 
              htmlFor={`${inDrawer ? 'drawer-' : ''}exclude-returns`} 
              className="text-sm font-normal cursor-pointer"
            >
              Виключити повернення
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick filters - moved inside Popover/Drawer */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Швидкі фільтри</Label>
        <div className="flex flex-wrap gap-1.5">
          {quickFilters.map((qf) => (
            <Badge
              key={qf.value}
              variant={filters.quickFilter === qf.value ? "default" : "outline"}
              className={cn(
                "cursor-pointer h-6 px-2 text-xs font-normal transition-colors focus:ring-0 focus:ring-offset-0",
                filters.quickFilter === qf.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() =>
                onQuickFilterChange(filters.quickFilter === qf.value ? "all" : qf.value)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onQuickFilterChange(filters.quickFilter === qf.value ? "all" : qf.value);
                }
              }}
            >
              {qf.label}
            </Badge>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="space-y-2">
      {/* Main toolbar row */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Search */}
        <div className="flex-1 min-w-[140px] sm:min-w-[200px] max-w-[400px] relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Пошук..."
            className="pl-8 h-9 sm:h-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              aria-label="Очистити пошук"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters - Drawer for mobile, Popover for desktop */}
        {isMobile ? (
          <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "relative gap-1 h-9 min-w-[44px] px-2.5",
                  hasActiveFilters && "border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] flex flex-col">
              <DrawerHeader className="shrink-0 border-b bg-background flex flex-row items-center justify-between py-3 px-4">
                <DrawerTitle className="text-base">Фільтри</DrawerTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Скинути
                  </Button>
                )}
              </DrawerHeader>
              <div className="flex-1 min-h-0 max-h-[calc(85vh-140px)] overflow-y-auto overscroll-contain">
                <div className="px-4 py-3">
                  <FiltersContent inDrawer />
                </div>
              </div>
              <div className="shrink-0 p-4 border-t bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {filteredCount !== undefined && totalCount !== undefined && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      Знайдено: <span className="font-medium text-foreground">{filteredCount}</span> з {totalCount}
                    </span>
                  </div>
                )}
                <DrawerClose asChild>
                  <Button className="w-full">
                    <Check className="h-4 w-4 mr-2" />
                    Застосувати
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 h-8",
                  hasActiveFilters && "border-primary text-primary"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Фільтри
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="sticky top-0 z-10 bg-popover border-b px-3 py-2.5 flex items-center justify-between">
                <span className="text-sm font-medium">Фільтри</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 px-2 text-xs text-muted-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Скинути
                  </Button>
                )}
              </div>
              <div className="relative">
                <div 
                  className="max-h-[60vh] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                >
                  <div className="p-3">
                    <FiltersContent />
                  </div>
                </div>
              </div>
              {filteredCount !== undefined && totalCount !== undefined && (
                <div className="p-3 border-t border-border/50 text-center text-xs text-muted-foreground">
                  Знайдено: <span className="font-medium text-foreground">{filteredCount}</span> з {totalCount}
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Data Quality button - unified component */}
        <DataQualityButton
          summary={{
            qualityPercent: dataQualityPercent,
            totalCount: filteredCount || 0,
            itemsWithIssues: qualityIssuesCount,
            issuesByType: (issuesByType || {}) as Record<string, number>,
          }}
          issueTypeConfig={issueTypeConfig}
          onShowAllIssues={onShowQualityIssues || (() => {})}
          onFilterByIssueType={onFilterByIssueType || (() => {})}
          isMobile={isMobile}
          itemLabel="операцій"
          extraSection={categorizationExtra}
        />

        {/* Sync button - unified component */}
        <SyncStatusButton
          cabinetType={cabinetType}
          variant="income"
          isMobile={isMobile}
          onNavigateToSettings={onNavigateToSettings}
        />

      </div>

      {/* Results count + Active filter chips + Clear button - unified row */}
      {(filters.quickFilter !== "all" || hasActiveFilters || searchQuery) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Results count */}
          {!isMobile && filteredCount !== undefined && totalCount !== undefined && (
            <span className="text-xs text-muted-foreground tabular-nums">
              Знайдено: <span className="font-medium text-foreground">{filteredCount}</span> з {totalCount}
            </span>
          )}
          
          {/* Active payment type chips */}
          {filters.paymentTypes.length > 0 && filters.paymentTypes.length < paymentTypeOptions.length && (
            filters.paymentTypes.map(type => (
              <Badge 
                key={type} 
                variant="secondary" 
                className="h-6 px-2 text-xs font-normal gap-1 cursor-pointer hover:bg-secondary/80"
              >
                {paymentTypeOptions.find(o => o.value === type)?.label}
                <X 
                  className="w-3 h-3 hover:text-foreground" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onFiltersChange({
                      ...filters,
                      paymentTypes: filters.paymentTypes.filter(t => t !== type)
                    });
                  }}
                />
              </Badge>
            ))
          )}
          
          {/* Active source chips */}
          {filters.sources.length > 0 && filters.sources.length < sourceOptions.length && (
            filters.sources.map(source => (
              <Badge 
                key={source} 
                variant="secondary" 
                className="h-6 px-2 text-xs font-normal gap-1 cursor-pointer hover:bg-secondary/80"
              >
                {sourceOptions.find(o => o.value === source)?.label}
                <X 
                  className="w-3 h-3 hover:text-foreground" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onFiltersChange({
                      ...filters,
                      sources: filters.sources.filter(s => s !== source)
                    });
                  }}
                />
              </Badge>
            ))
          )}
          
          {/* Active quick filter badge */}
          {filters.quickFilter !== "all" && (
            <Badge 
              variant="secondary" 
              className="h-6 px-2 text-xs font-normal gap-1 cursor-pointer hover:bg-secondary/80"
            >
              {quickFilters.find(qf => qf.value === filters.quickFilter)?.label}
              <X 
                className="w-3 h-3 hover:text-foreground" 
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickFilterChange("all");
                }}
              />
            </Badge>
          )}
          
          {/* Clear all */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground h-6 px-2 text-xs shrink-0"
          >
            <X className="w-3 h-3 mr-1" />
            Скинути
          </Button>
        </div>
      )}
    </div>
  );
};
