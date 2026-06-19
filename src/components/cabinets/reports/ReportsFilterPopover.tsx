import { useState, useCallback, useRef, useEffect } from "react";
import { SlidersHorizontal, X, Check, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ReportType, ReportStatus } from "@/config/reportsConfig";

export interface ReportsDiapasonFilters {
  /** Дедлайн від (inclusive). undefined = без обмеження */
  deadlineFrom?: Date;
  /** Дедлайн до (inclusive) */
  deadlineTo?: Date;
  /** Сума до сплати від (грн) */
  amountFrom?: number;
  /** Сума до сплати до (грн) */
  amountTo?: number;
}

interface ReportsFilterPopoverProps {
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
  diapason?: ReportsDiapasonFilters;
  onDiapasonChange?: (diapason: ReportsDiapasonFilters) => void;
  onReset: () => void;
  isMobile?: boolean;
  availableYears?: number[];
  filteredCount?: number;
  totalCount?: number;
  reviewCount?: number;
  quarterCount?: number;
  overdueCount?: number;
}

const quickFilters = [
  { id: "review", label: "На перевірку" },
  { id: "due-this-quarter", label: "Цей квартал" },
  { id: "overdue", label: "Прострочені" },
];

const reportTypes: { value: ReportType; label: string }[] = [
  { value: "ep", label: "Єдиний податок" },
  { value: "esv", label: "ЄСВ" },
  { value: "vz", label: "Військовий збір" },
  { value: "1df", label: "Податковий розрахунок (4ДФ)" },
  { value: "pdfo", label: "ПДФО" },
  { value: "mpz", label: "МПЗ" },
  { value: "other", label: "Інші" },
];

const reportStatuses: { value: ReportStatus; label: string }[] = [
  { value: "scheduled", label: "Заплановано" },
  { value: "processing", label: "Формується" },
  { value: "review", label: "На перевірку" },
  { value: "approved", label: "Підтверджено" },
  { value: "submitted", label: "Подано" },
  { value: "accepted", label: "Прийнято" },
  { value: "rejected", label: "Відхилено" },
];

export function ReportsFilterPopover({
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
  diapason,
  onDiapasonChange,
  onReset,
  isMobile = false,
  availableYears = [2025, 2024, 2023],
  filteredCount,
  totalCount,
  reviewCount,
  quarterCount,
  overdueCount,
}: ReportsFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const diapasonActive = !!(
    diapason?.deadlineFrom ||
    diapason?.deadlineTo ||
    diapason?.amountFrom !== undefined ||
    diapason?.amountTo !== undefined
  );

  const activeFiltersCount =
    selectedTypes.length +
    selectedStatuses.length +
    (quickFilter ? 1 : 0) +
    (diapasonActive ? 1 : 0) +
    (month !== null && month !== undefined ? 1 : 0);

  const updateDiapason = (patch: Partial<ReportsDiapasonFilters>) => {
    onDiapasonChange?.({ ...(diapason ?? {}), ...patch });
  };

  const getQuickFilterCount = (id: string): number | undefined => {
    switch (id) {
      case "review": return reviewCount;
      case "due-this-quarter": return quarterCount;
      case "overdue": return overdueCount;
      default: return undefined;
    }
  };

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
    if (open) {
      const timer = setTimeout(checkScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [open, checkScroll]);

  const toggleType = (type: ReportType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const toggleStatus = (status: ReportStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const selectAllTypes = () => {
    if (selectedTypes.length === reportTypes.length) {
      onTypesChange([]);
    } else {
      onTypesChange(reportTypes.map((t) => t.value));
    }
  };

  const selectAllStatuses = () => {
    if (selectedStatuses.length === reportStatuses.length) {
      onStatusesChange([]);
    } else {
      onStatusesChange(reportStatuses.map((s) => s.value));
    }
  };

  const FiltersContent = () => (
    <div className="space-y-4">
      {/* Рік + Місяць */}
      <div className={cn("grid gap-3", onMonthChange ? "grid-cols-2" : "grid-cols-1")}>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Рік
          </Label>
          <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Рік" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {onMonthChange && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Місяць
            </Label>
            <Select
              value={month === null || month === undefined ? "all" : String(month)}
              onValueChange={(v) => onMonthChange(v === "all" ? null : Number(v))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Усі місяці" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі місяці</SelectItem>
                {[
                  "Січень","Лютий","Березень","Квітень","Травень","Червень",
                  "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень",
                ].map((name, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      {/* Статус - moved higher for better visibility (like DocumentFlow) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Статус
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={selectAllStatuses}
          >
            {selectedStatuses.length === reportStatuses.length ? "Скасувати" : "Обрати все"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {reportStatuses.map((status) => (
            <div key={status.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={selectedStatuses.includes(status.value)}
                onCheckedChange={() => toggleStatus(status.value)}
              />
              <Label
                htmlFor={`status-${status.value}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {status.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Тип звіту */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Тип звіту
          </Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={selectAllTypes}
          >
            {selectedTypes.length === reportTypes.length ? "Скасувати" : "Обрати все"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {reportTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type.value}`}
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => toggleType(type.value)}
              />
              <Label
                htmlFor={`type-${type.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Швидкі фільтри */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Швидкі фільтри
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {quickFilters.map((qf) => {
            const isActive = quickFilter === qf.id;
            const count = getQuickFilterCount(qf.id);
            return (
              <Badge
                key={qf.id}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs gap-1.5 px-2.5 py-1",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => onQuickFilterChange(isActive ? null : qf.id)}
              >
                {qf.label}
                {count !== undefined && count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[10px] rounded-full min-w-[18px] text-center",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted-foreground/10 text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </Badge>
            );
          })}
        </div>
      </div>

      {onDiapasonChange && (
        <>
          <Separator />

          {/* Розширені (диапазони) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Розширені
              </Label>
              {diapasonActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    onDiapasonChange({
                      deadlineFrom: undefined,
                      deadlineTo: undefined,
                      amountFrom: undefined,
                      amountTo: undefined,
                    })
                  }
                >
                  Очистити
                </Button>
              )}
            </div>

            {/* Дедлайн діапазон */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Дедлайн</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 justify-start text-left font-normal text-xs",
                        !diapason?.deadlineFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {diapason?.deadlineFrom
                        ? format(diapason.deadlineFrom, "dd.MM.yy", { locale: uk })
                        : "від"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={diapason?.deadlineFrom}
                      onSelect={(d) => updateDiapason({ deadlineFrom: d ?? undefined })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 justify-start text-left font-normal text-xs",
                        !diapason?.deadlineTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {diapason?.deadlineTo
                        ? format(diapason.deadlineTo, "dd.MM.yy", { locale: uk })
                        : "до"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={diapason?.deadlineTo}
                      onSelect={(d) => updateDiapason({ deadlineTo: d ?? undefined })}
                      disabled={(date) =>
                        diapason?.deadlineFrom ? date < diapason.deadlineFrom : false
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Сума діапазон */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Сума до сплати, ₴</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="від"
                  className="h-8 text-xs"
                  value={diapason?.amountFrom ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateDiapason({
                      amountFrom: v === "" ? undefined : Math.max(0, Number(v)),
                    });
                  }}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="до"
                  className="h-8 text-xs"
                  value={diapason?.amountTo ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateDiapason({
                      amountTo: v === "" ? undefined : Math.max(0, Number(v)),
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const TriggerButton = (
    <Button variant="outline" size="sm" className="h-8 gap-1.5">
      <SlidersHorizontal className="h-4 w-4" />
      <span className="hidden sm:inline">Фільтри</span>
      <span className="hidden sm:inline text-muted-foreground">· {year}</span>
      {activeFiltersCount > 0 && (
        <Badge
          variant="secondary"
          className="h-5 px-1.5 text-[10px] font-medium"
        >
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="shrink-0 border-b bg-background flex flex-row items-center justify-between">
            <DrawerTitle>Фільтри звітів</DrawerTitle>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Скинути
              </Button>
            )}
          </DrawerHeader>
          <div className="flex-1 min-h-0 max-h-[calc(85vh-140px)] overflow-y-auto overscroll-contain">
            <div className="px-4 py-3">
              <FiltersContent />
            </div>
          </div>
          <div className="shrink-0 p-4 border-t bg-background pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {/* Лічильник «Знайдено» прибрано — він уже показаний над таблицею (single source of truth) */}
            <DrawerClose asChild>
              <Button className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Застосувати
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent 
        align="start" 
        className="w-80 p-0 flex flex-col overflow-hidden"
        style={{ maxHeight: 'min(80vh, var(--radix-popper-available-height))' }}
      >
        {/* Header - fixed */}
        <div className="shrink-0 bg-popover border-b px-3 py-2.5 flex items-center justify-between">
          <span className="text-sm font-medium">Фільтри звітів</span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Скинути
            </Button>
          )}
        </div>
        
        {/* Scrollable content - adaptive with fade effect */}
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
      </PopoverContent>
    </Popover>
  );
}
