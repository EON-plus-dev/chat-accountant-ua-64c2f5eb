import { useState, useCallback, useRef, useEffect } from "react";
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  FileSignature,
  Clock,
  AlertCircle,
  Archive,
  Calendar,
  User,
  Tag,
  UserPlus
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { DocumentType, DocumentFlowStatus, DocumentIssueType, DocumentSourceType } from "@/config/documentFlowConfig";
import { documentSourceTypeLabels } from "@/config/documentFlowConfig";
import { tagPresets, getTagsByCategory, responsibleUsers } from "@/config/operationalMetadataConfig";

// Filter state type
export interface DocumentFilterState {
  types: DocumentType[];
  statuses: DocumentFlowStatus[];
  quickFilter: "all" | "pending-sign" | "overdue" | "unpaid" | "archived" | "has-issues" | "pending-contractor";
  issueTypeFilter?: DocumentIssueType | null;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  // Operational data filters
  responsibleFilter?: "all" | "my" | "incoming" | "assigned-to-me" | string; // "all", "my" (current user), "incoming" (received docs), "assigned-to-me" (approval workflow), or specific user ID
  tagFilters?: string[]; // Selected tag values
  sourceTypes?: DocumentSourceType[]; // Source of origin filter
}

// Source type options for filter
const sourceTypeOptions: { value: DocumentSourceType; label: string; icon: string }[] = [
  { value: "UPLOAD", label: documentSourceTypeLabels.UPLOAD, icon: "⬆" },
  { value: "GENERATED", label: documentSourceTypeLabels.GENERATED, icon: "✨" },
  { value: "INTERNAL_RECEIVED", label: documentSourceTypeLabels.INTERNAL_RECEIVED, icon: "📥" },
  { value: "EXTERNAL_INTEGRATION", label: documentSourceTypeLabels.EXTERNAL_INTEGRATION, icon: "🔗" },
];

// Quick filter type
export type DocumentQuickFilter = DocumentFilterState["quickFilter"];

interface DocumentFlowFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: DocumentFilterState;
  onFiltersChange: (filters: DocumentFilterState) => void;
  onQuickFilterChange: (filter: DocumentQuickFilter) => void;
  isMobile?: boolean;
  isCompact?: boolean;
  // Results count
  filteredCount?: number;
  totalCount?: number;
}

// Document type options for filter
const typeOptions: { value: DocumentType; label: string }[] = [
  { value: "invoice", label: "Рахунки" },
  { value: "act", label: "Акти" },
  { value: "contract", label: "Договори" },
  { value: "waybill", label: "Накладні" },
  { value: "tax-invoice", label: "Податкові накладні" },
  { value: "prro-receipt", label: "Чеки ПРРО" },
];

// Status options for filter
const statusOptions: { value: DocumentFlowStatus; label: string; key?: string }[] = [
  { value: "draft", label: "Чернетки" },
  { value: "draft-pending-contractor", label: "Очікують контрагента" },
  { value: "pending-sign", label: "Очікують підпису" },
  { value: "signed", label: "Підписані" },
  { value: "sent", label: "Відправлені" },
  { value: "sent", label: "Не оплачено", key: "unpaid" },
  { value: "paid", label: "Оплачені" },
  { value: "partially-paid", label: "Частково оплачені" },
  { value: "archived", label: "В архіві" },
];

// Quick filters configuration
const quickFilters: { value: DocumentQuickFilter; label: string; icon: typeof FileSignature }[] = [
  { value: "pending-contractor", label: "Очікують контрагента", icon: UserPlus },
  { value: "pending-sign", label: "Очікують підпису", icon: FileSignature },
  { value: "overdue", label: "Протерміновані", icon: Clock },
  { value: "unpaid", label: "Без оплати", icon: AlertCircle },
  { value: "has-issues", label: "⚠ Потребують уваги", icon: AlertCircle },
  { value: "archived", label: "Архів", icon: Archive },
];

// Date range presets
const datePresets = [
  { label: "Сьогодні", getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Вчора", getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: "Цей тиждень", getValue: () => ({ from: startOfWeek(new Date(), { locale: uk }), to: endOfWeek(new Date(), { locale: uk }) }) },
  { label: "Цей місяць", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Цей квартал", getValue: () => ({ from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) }) },
];

export const DocumentFlowFilters = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onQuickFilterChange,
  isMobile,
  isCompact,
  filteredCount,
  totalCount,
  
}: DocumentFlowFiltersProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position for fade indicators
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasMoreBelow = el.scrollHeight - el.scrollTop > el.clientHeight + 5;
      const hasMoreAbove = el.scrollTop > 5;
      setCanScrollDown(hasMoreBelow);
      setCanScrollUp(hasMoreAbove);
    }
  }, []);

  useEffect(() => {
    // Initial check after render
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [checkScroll]);

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange?.from ||
    filters.issueTypeFilter ||
    filters.quickFilter !== "all" ||
    (filters.responsibleFilter && filters.responsibleFilter !== "all") ||
    (filters.tagFilters && filters.tagFilters.length > 0) ||
    (filters.sourceTypes && filters.sourceTypes.length > 0);

  const activeFiltersCount = filters.types.length + filters.statuses.length + 
    (filters.dateRange?.from ? 1 : 0) + (filters.issueTypeFilter ? 1 : 0) +
    (filters.quickFilter !== "all" ? 1 : 0) +
    (filters.responsibleFilter && filters.responsibleFilter !== "all" ? 1 : 0) +
    (filters.tagFilters?.length || 0) +
    (filters.sourceTypes?.length || 0);

  const toggleType = (type: DocumentType) => {
    const current = filters.types;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, types: updated });
  };

  const toggleStatus = (status: DocumentFlowStatus) => {
    const current = filters.statuses;
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, statuses: updated });
  };

  const toggleSourceType = (sourceType: DocumentSourceType) => {
    const current = filters.sourceTypes || [];
    const updated = current.includes(sourceType)
      ? current.filter((s) => s !== sourceType)
      : [...current, sourceType];
    onFiltersChange({ ...filters, sourceTypes: updated });
  };

  const selectAllTypes = () => {
    const allSelected = filters.types.length === typeOptions.length;
    onFiltersChange({
      ...filters,
      types: allSelected ? [] : typeOptions.map((o) => o.value),
    });
  };

  const selectAllStatuses = () => {
    const allSelected = filters.statuses.length === statusOptions.length;
    onFiltersChange({
      ...filters,
      statuses: allSelected ? [] : statusOptions.map((o) => o.value),
    });
  };

  const clearFilters = useCallback(() => {
    onFiltersChange({
      types: [],
      statuses: [],
      quickFilter: "all",
      issueTypeFilter: null,
      dateRange: undefined,
      responsibleFilter: "all",
      tagFilters: [],
      sourceTypes: [],
    });
    onSearchChange("");
  }, [onFiltersChange, onSearchChange]);

  const toggleTagFilter = (tagValue: string) => {
    const currentTags = filters.tagFilters || [];
    const updated = currentTags.includes(tagValue)
      ? currentTags.filter(t => t !== tagValue)
      : [...currentTags, tagValue];
    onFiltersChange({ ...filters, tagFilters: updated });
  };

  const handleResponsibleChange = (value: string) => {
    onFiltersChange({ ...filters, responsibleFilter: value });
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFiltersChange({ ...filters, dateRange: range });
  };

  const clearDateRange = () => {
    onFiltersChange({ ...filters, dateRange: undefined });
    setDatePopoverOpen(false);
  };

  const formatDateRange = () => {
    if (!filters.dateRange?.from) return null;
    const from = format(filters.dateRange.from, "dd.MM", { locale: uk });
    const to = filters.dateRange.to 
      ? format(filters.dateRange.to, "dd.MM", { locale: uk })
      : from;
    return from === to ? from : `${from} – ${to}`;
  };

  // Combined Filters Content for both Popover and Drawer
  const FiltersContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className="space-y-4">
      {/* Period section */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Період</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {datePresets.map((preset) => (
            <Button
              key={preset.label}
              variant={
                filters.dateRange?.from?.getTime() === preset.getValue().from.getTime()
                  ? "secondary"
                  : "outline"
              }
              size="sm"
              className="text-xs h-7"
              onClick={() => handleDateRangeChange(preset.getValue())}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "w-full justify-start gap-2",
                filters.dateRange?.from && "border-primary text-primary"
              )}
              size="sm"
            >
              <Calendar className="w-4 h-4" />
              {formatDateRange() || "Обрати дати"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={filters.dateRange}
              onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
              locale={uk}
              numberOfMonths={1}
              className="pointer-events-auto"
            />
            {filters.dateRange?.from && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateRange}
                  className="w-full text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Скинути період
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      {/* Statuses - moved higher for better visibility */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Статус</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllStatuses}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {filters.statuses.length === statusOptions.length ? "Скасувати" : "Обрати все"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {statusOptions.map((opt) => (
            <div key={opt.key || opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`${inDrawer ? 'drawer-' : ''}status-${opt.value}`}
                checked={filters.statuses.includes(opt.value)}
                onCheckedChange={() => toggleStatus(opt.value)}
              />
              <Label
                htmlFor={`${inDrawer ? 'drawer-' : ''}status-${opt.value}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Document types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Тип документа</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllTypes}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {filters.types.length === typeOptions.length ? "Скасувати" : "Обрати все"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {typeOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`${inDrawer ? 'drawer-' : ''}type-${opt.value}`}
                checked={filters.types.includes(opt.value)}
                onCheckedChange={() => toggleType(opt.value)}
              />
              <Label
                htmlFor={`${inDrawer ? 'drawer-' : ''}type-${opt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Source of origin */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Джерело походження</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sourceTypeOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`${inDrawer ? 'drawer-' : ''}source-${opt.value}`}
                checked={filters.sourceTypes?.includes(opt.value) || false}
                onCheckedChange={() => toggleSourceType(opt.value)}
              />
              <Label
                htmlFor={`${inDrawer ? 'drawer-' : ''}source-${opt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                <span className="mr-1">{opt.icon}</span>
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Responsible filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <User className="w-4 h-4" />
          Відповідальний
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${inDrawer ? 'drawer-' : ''}responsible-all`}
              checked={!filters.responsibleFilter || filters.responsibleFilter === "all"}
              onCheckedChange={() => handleResponsibleChange("all")}
            />
            <Label
              htmlFor={`${inDrawer ? 'drawer-' : ''}responsible-all`}
              className="text-sm font-normal cursor-pointer"
            >
              Всі
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${inDrawer ? 'drawer-' : ''}responsible-my`}
              checked={filters.responsibleFilter === "my"}
              onCheckedChange={() => handleResponsibleChange("my")}
            />
            <Label
              htmlFor={`${inDrawer ? 'drawer-' : ''}responsible-my`}
              className="text-sm font-normal cursor-pointer"
            >
              Мої
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${inDrawer ? 'drawer-' : ''}responsible-incoming`}
              checked={filters.responsibleFilter === "incoming"}
              onCheckedChange={() => handleResponsibleChange("incoming")}
            />
            <Label
              htmlFor={`${inDrawer ? 'drawer-' : ''}responsible-incoming`}
              className="text-sm font-normal cursor-pointer"
            >
              Вхідні
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${inDrawer ? 'drawer-' : ''}responsible-assigned`}
              checked={filters.responsibleFilter === "assigned-to-me"}
              onCheckedChange={() => handleResponsibleChange("assigned-to-me")}
            />
            <Label
              htmlFor={`${inDrawer ? 'drawer-' : ''}responsible-assigned`}
              className="text-sm font-normal cursor-pointer"
            >
              На мені
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tags filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Теги
        </Label>
        <div className="space-y-3">
          {/* Priority tags */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Пріоритет</p>
            <div className="flex flex-wrap gap-1.5">
              {getTagsByCategory("priority").map(tag => {
                const isActive = filters.tagFilters?.includes(tag.value);
                return (
                  <Badge
                    key={tag.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-xs",
                      isActive ? "bg-primary text-primary-foreground" : tag.color
                    )}
                    onClick={() => toggleTagFilter(tag.value)}
                  >
                    {tag.label}
                  </Badge>
                );
              })}
            </div>
          </div>
          {/* Category tags */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Категорія</p>
            <div className="flex flex-wrap gap-1.5">
              {getTagsByCategory("category").map(tag => {
                const isActive = filters.tagFilters?.includes(tag.value);
                return (
                  <Badge
                    key={tag.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-xs",
                      isActive ? "bg-primary text-primary-foreground" : tag.color
                    )}
                    onClick={() => toggleTagFilter(tag.value)}
                  >
                    {tag.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick filters */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Швидкі фільтри</Label>
        <div className="flex flex-wrap gap-1.5">
          {quickFilters.map((qf) => {
            const isActive = filters.quickFilter === qf.value;
            const Icon = qf.icon;
            return (
              <Badge
                key={qf.value}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-2.5 py-1 gap-1 hover:bg-accent transition-colors",
                  isActive && "bg-primary text-primary-foreground"
                )}
                onClick={() => onQuickFilterChange(isActive ? "all" : qf.value)}
              >
                <Icon className="w-3 h-3" />
                {qf.label}
              </Badge>
            );
          })}
        </div>
      </div>

    </div>
  );

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Пошук..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange("")}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      

      {/* Main filters button - Desktop Popover / Mobile Drawer */}
      {isMobile ? (
        <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[90vh] max-h-[90vh] flex flex-col">
            <DrawerHeader className="shrink-0 border-b bg-background">
              <DrawerTitle>Фільтри документів</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <div className="px-4 py-3 pb-6">
                <FiltersContent inDrawer />
              </div>
            </div>
            <div className="shrink-0 p-4 border-t bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  Знайдено: {filteredCount} з {totalCount}
                </span>
              </div>
              <DrawerClose asChild>
                <Button className="w-full">Готово</Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Фільтри</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0 flex flex-col overflow-hidden" 
            align="end"
            style={{ maxHeight: 'min(80vh, var(--radix-popper-available-height))' }}
          >
            {/* Header - fixed */}
            <div className="shrink-0 bg-popover border-b px-3 py-2.5 flex items-center justify-between">
              <span className="text-sm font-medium">Фільтри документів</span>
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
            
            {/* Scroll area - adaptive with fade effect */}
            <div 
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              ref={scrollContainerRef}
              onScroll={checkScroll}
              style={canScrollDown ? {
                maskImage: 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)'
              } : undefined}
            >
              <div className="p-3 pb-6">
                <FiltersContent />
              </div>
            </div>
            
            {/* Footer - fixed */}
            {filteredCount !== undefined && totalCount !== undefined && (
              <div className="shrink-0 p-3 border-t border-border/50 text-center text-xs text-muted-foreground">
                Знайдено: <span className="font-medium text-foreground">{filteredCount}</span> з {totalCount}
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DocumentFlowFilters;
