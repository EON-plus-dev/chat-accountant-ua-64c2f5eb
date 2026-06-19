import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, ArrowUpDown, LayoutGrid, List, Bell, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface UnifiedToolbarProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Sort (optional)
  sortOptions?: SortOption[];
  sortValue?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (value: string) => void;
  onSortDirectionToggle?: () => void;

  // Status Filter (optional)
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;

  // Filter slot for custom filters (optional) - desktop only
  filterSlot?: React.ReactNode;
  
  // Mobile filter content for Sheet (optional)
  mobileFilterContent?: React.ReactNode;

  // View mode toggle (optional)
  viewMode?: "grid" | "list" | "timeline" | "calendar";
  onViewModeChange?: (mode: "grid" | "list" | "timeline" | "calendar") => void;
  showViewToggle?: boolean;
  viewOptions?: Array<{ value: string; label: string; icon: React.ReactNode }>;

  // Unread toggle (optional, for notifications)
  unreadToggle?: {
    pressed: boolean;
    onPressedChange: (pressed: boolean) => void;
    unreadCount: number;
  };

  // Active filter chips (optional)
  activeChips?: ActiveChip[];
  onClearAllFilters?: () => void;

  // Results count (optional)
  resultsCount?: { shown: number; total: number };

  // Role hint (optional)
  roleHint?: string;

  // Extra actions slot (optional)
  actions?: React.ReactNode;

  // Sticky positioning
  sticky?: boolean;

  // Additional className
  className?: string;
}

export function UnifiedToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Пошук...",
  sortOptions,
  sortValue,
  sortDirection = "asc",
  onSortChange,
  onSortDirectionToggle,
  filterOptions,
  filterValue,
  onFilterChange,
  filterPlaceholder = "Фільтр",
  filterSlot,
  mobileFilterContent,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  viewOptions,
  unreadToggle,
  activeChips,
  onClearAllFilters,
  resultsCount,
  roleHint,
  actions,
  sticky = true,
  className,
}: UnifiedToolbarProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate unified sort options (field + direction combined)
  const unifiedSortOptions = useMemo(() => {
    if (!sortOptions) return [];
    return sortOptions.flatMap(opt => [
      { value: `${opt.value}-asc`, label: `${opt.label}: А → Я`, field: opt.value, direction: "asc" as const },
      { value: `${opt.value}-desc`, label: `${opt.label}: Я → А`, field: opt.value, direction: "desc" as const },
    ]);
  }, [sortOptions]);

  // Current unified sort value
  const unifiedSortValue = sortValue ? `${sortValue}-${sortDirection}` : undefined;

  // Handle unified sort change
  const handleUnifiedSortChange = useCallback((combinedValue: string) => {
    const selectedOption = unifiedSortOptions.find(opt => opt.value === combinedValue);
    if (!selectedOption) return;

    const { field, direction } = selectedOption;

    // Update field if changed
    if (field !== sortValue && onSortChange) {
      onSortChange(field);
    }

    // Toggle direction if needed (toggle only if direction differs from current)
    if (direction !== sortDirection && onSortDirectionToggle) {
      onSortDirectionToggle();
    }
  }, [unifiedSortOptions, sortValue, sortDirection, onSortChange, onSortDirectionToggle]);

  // Check if we have any controls that should go in the mobile sheet
  // Sort is shown inline on mobile (compact icon-Select), so it shouldn't trigger the drawer alone
  const hasMobileSheetContent = showViewToggle || (filterOptions?.length ?? 0) > 0 || !!mobileFilterContent;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear search
      if (e.key === "Escape") {
        if (mobileSheetOpen) {
          setMobileSheetOpen(false);
        } else if (searchValue && document.activeElement === searchInputRef.current) {
          onSearchChange("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchValue, onSearchChange, mobileSheetOpen]);

  // Default view options for grid/list
  const defaultViewOptions = [
    { value: "grid", label: "Сітка", icon: <LayoutGrid className="w-4 h-4" /> },
    { value: "list", label: "Список", icon: <List className="w-4 h-4" /> },
  ];

  const effectiveViewOptions = viewOptions || defaultViewOptions;

  return (
    <div
      className={cn(
        "py-2",
        sticky && "sticky top-0 z-10",
        className
      )}
    >
      {/* Main toolbar row */}
      <div className="flex items-center gap-2">
        {/* Search - always visible */}
        <div className="relative flex-1 min-w-0 sm:max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8 h-9 text-sm"
            aria-label={searchPlaceholder}
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              aria-label="Очистити пошук"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Unified Sort dropdown — icon-only on mobile, full label on desktop */}
        {unifiedSortOptions.length > 0 && onSortChange && (
          <Select value={unifiedSortValue} onValueChange={handleUnifiedSortChange}>
            <SelectTrigger
              className="w-9 sm:w-[180px] h-9 px-0 sm:px-3 justify-center sm:justify-between text-sm shrink-0"
              aria-label="Сортування"
            >
              <ArrowUpDown className="w-3.5 h-3.5 sm:mr-1.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                <SelectValue placeholder="Сортувати" />
              </span>
            </SelectTrigger>
            <SelectContent>
              {unifiedSortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Desktop: View Toggle */}
        {showViewToggle && viewMode && onViewModeChange && (
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && onViewModeChange(value as any)}
            className="border border-border rounded-lg hidden sm:flex"
          >
            {effectiveViewOptions.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                aria-label={opt.label}
                className="h-9 w-9 data-[state=on]:bg-muted"
              >
                {opt.icon}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        {/* Desktop: Filter dropdown */}
        {filterOptions && filterOptions.length > 0 && onFilterChange && (
          <Select value={filterValue} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[130px] h-9 text-sm hidden sm:flex">
              <SelectValue placeholder={filterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Custom Filter Slot — desktop only; on mobile filters live in the drawer */}
        {filterSlot && <div className="hidden sm:flex flex-wrap items-center gap-2">{filterSlot}</div>}

        {/* Unread Toggle - always visible */}
        {unreadToggle && (
          <Toggle
            pressed={unreadToggle.pressed}
            onPressedChange={unreadToggle.onPressedChange}
            aria-label={`Тільки непрочитані${unreadToggle.unreadCount > 0 ? `. Непрочитаних: ${unreadToggle.unreadCount}` : ""}`}
            className="shrink-0 h-9 w-9 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <div className="relative">
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unreadToggle.unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center" aria-hidden="true">
                  {unreadToggle.unreadCount > 9 ? "9+" : unreadToggle.unreadCount}
                </span>
              )}
            </div>
          </Toggle>
        )}

        {/* Mobile: Drawer trigger for sort/view/filter */}
        {hasMobileSheetContent && (
          <Drawer open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:hidden shrink-0"
                aria-label="Налаштування"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </DrawerTrigger>

            <DrawerContent className="max-h-[85dvh] flex flex-col">
              <DrawerHeader className="shrink-0 border-b border-border/70 py-3">
                <DrawerTitle className="text-base">Сортування і фільтри</DrawerTitle>
              </DrawerHeader>

              {/* Scrollable content */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-4 py-4 space-y-5">
                  {/* Sort section - unified dropdown */}
                  {unifiedSortOptions.length > 0 && onSortChange && (
                    <div className="space-y-2">
                      <Label htmlFor="mobile-sort-select" className="text-sm font-medium">
                        Сортування
                      </Label>
                      <Select value={unifiedSortValue} onValueChange={handleUnifiedSortChange}>
                        <SelectTrigger id="mobile-sort-select" className="w-full h-9">
                          <SelectValue placeholder="Сортувати" />
                        </SelectTrigger>
                        <SelectContent>
                          {unifiedSortOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* View mode section */}
                  {showViewToggle && viewMode && onViewModeChange && (
                    <>
                      {unifiedSortOptions.length > 0 && <Separator />}
                      <div className="space-y-2">
                        <Label id="mobile-view-label" className="text-sm font-medium">
                          Вигляд
                        </Label>
                        <ToggleGroup
                          type="single"
                          value={viewMode}
                          onValueChange={(value) => value && onViewModeChange(value as any)}
                          className="justify-start"
                          aria-labelledby="mobile-view-label"
                        >
                          {effectiveViewOptions.map((opt) => (
                            <ToggleGroupItem
                              key={opt.value}
                              value={opt.value}
                              aria-label={opt.label}
                              className="h-9 px-4 gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              {opt.icon}
                              {opt.label}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                    </>
                  )}

                  {/* Filter section */}
                  {filterOptions && filterOptions.length > 0 && onFilterChange && (
                    <>
                      {(unifiedSortOptions.length > 0 || showViewToggle) && <Separator />}
                      <div className="space-y-2">
                        <Label htmlFor="mobile-filter-select" className="text-sm font-medium">
                          {filterPlaceholder}
                        </Label>
                        <Select value={filterValue} onValueChange={onFilterChange}>
                          <SelectTrigger id="mobile-filter-select" className="w-full h-9">
                            <SelectValue placeholder={filterPlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {filterOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Mobile custom filter content */}
                  {mobileFilterContent && (
                    <>
                      {(unifiedSortOptions.length > 0 || showViewToggle || filterOptions?.length) && <Separator />}
                      <div className="space-y-3" role="group" aria-label="Додаткові фільтри">
                        
                        {mobileFilterContent}
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="shrink-0 border-t border-border/70 bg-background px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="flex gap-2">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">
                      Закрити
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button className="flex-1">Застосувати</Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}


        {/* Extra Actions */}
        {actions}

        {/* Results Count - desktop only (only when no active chips to avoid duplication) */}
        {resultsCount && resultsCount.shown !== resultsCount.total && (!activeChips || activeChips.length === 0) && (
          <span 
            className="text-xs text-muted-foreground hidden sm:inline ml-auto tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {resultsCount.shown} з {resultsCount.total}
          </span>
        )}
      </div>

      {/* Active Chips Row */}
      {activeChips && activeChips.length > 0 && (
        <div className="flex items-center gap-2 mt-2 text-sm" role="status" aria-live="polite">
          <span className="text-muted-foreground tabular-nums text-xs">
            {resultsCount ? `${resultsCount.shown} з ${resultsCount.total}` : "Фільтри:"}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground/50">·</span>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.onRemove}
                className="text-primary hover:bg-accent/50 rounded-sm px-1 py-0.5 -mx-1 flex items-center gap-0.5 transition-colors text-xs"
                aria-label={`Видалити фільтр: ${chip.label}`}
              >
                {chip.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            {activeChips.length > 1 && onClearAllFilters && (
              <button
                onClick={onClearAllFilters}
                className="text-muted-foreground hover:text-foreground text-xs ml-1"
              >
                скинути
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}