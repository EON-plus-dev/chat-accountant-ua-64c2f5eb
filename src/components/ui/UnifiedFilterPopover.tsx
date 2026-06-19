import { useState, useCallback, useRef, useEffect } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateRangeFilter, type DateRangeValue, type DateRangePresetKey } from "@/components/ui/DateRangeFilter";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSection {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FilterPreset {
  id: string;
  label: string;
  isActive: boolean;
  apply: () => void;
}

export interface NumericRangeSection {
  id: string;
  label: string;
  from: number | "";
  to: number | "";
  onFromChange: (v: number | "") => void;
  onToChange: (v: number | "") => void;
  placeholderFrom?: string;
  placeholderTo?: string;
}

interface UnifiedFilterPopoverProps {
  sections: FilterSection[];
  activeFiltersCount: number;
  onReset: () => void;
  title?: string;
  triggerLabel?: string;
  align?: "start" | "center" | "end";
  isMobile?: boolean;
  filteredCount?: number;
  totalCount?: number;
  /** Optional slot rendered before the filter sections (e.g. direction toggle) */
  headerSlot?: React.ReactNode;
  /** Quick presets shown at the top of the popover */
  presets?: FilterPreset[];
  /** Numeric range sections (e.g. amount from-to) */
  numericRanges?: NumericRangeSection[];
  /** Optional date-range section (calendar with presets) */
  dateRange?: {
    value?: DateRangeValue;
    onChange: (range: DateRangeValue) => void;
    presets?: DateRangePresetKey[];
    label?: string;
  };
}

const UnifiedFilterPopover = ({
  sections,
  activeFiltersCount,
  onReset,
  title = "Фільтри",
  triggerLabel = "Фільтри",
  align = "end",
  isMobile = false,
  filteredCount,
  totalCount,
  headerSlot,
  presets,
  numericRanges,
  dateRange,
}: UnifiedFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasActiveFilters = activeFiltersCount > 0;

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

  // Reusable filter content
  const FiltersContent = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <div className="space-y-3">
      {headerSlot && <div className="pb-1">{headerSlot}</div>}

      {presets && presets.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Швидкі пресети
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant={preset.isActive ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={preset.apply}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {dateRange && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {dateRange.label || "Період"}
          </Label>
          <DateRangeFilter
            value={dateRange.value}
            onChange={dateRange.onChange}
            presets={dateRange.presets}
            showLabel={false}
          />
        </div>
      )}

      {sections.map((section) => (
        <div key={section.id} className="space-y-1.5">
          <Label
            htmlFor={`${inDrawer ? "drawer-" : ""}filter-${section.id}`}
            className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
          >
            {section.label}
          </Label>
          <Select value={section.value} onValueChange={section.onChange}>
            <SelectTrigger
              id={`${inDrawer ? "drawer-" : ""}filter-${section.id}`}
              className="h-9 w-full"
            >
              <SelectValue
                placeholder={section.placeholder || `Оберіть ${section.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {section.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {numericRanges && numericRanges.map((range) => (
        <div key={range.id} className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {range.label}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              placeholder={range.placeholderFrom || "Від"}
              value={range.from === "" ? "" : range.from}
              onChange={(e) => {
                const v = e.target.value;
                range.onFromChange(v === "" ? "" : Number(v));
              }}
              className="h-9 text-sm"
            />
            <span className="text-muted-foreground text-xs">—</span>
            <Input
              type="number"
              inputMode="decimal"
              placeholder={range.placeholderTo || "До"}
              value={range.to === "" ? "" : range.to}
              onChange={(e) => {
                const v = e.target.value;
                range.onToChange(v === "" ? "" : Number(v));
              }}
              className="h-9 text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Trigger button (reusable)
  const TriggerButton = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 h-8 shrink-0",
        hasActiveFilters && "border-primary text-primary"
      )}
      aria-label={`${triggerLabel}${hasActiveFilters ? `. Активних: ${activeFiltersCount}` : ""}`}
    >
      <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{triggerLabel}</span>
      {hasActiveFilters && (
        <Badge variant="secondary" className="h-5 px-1.5 text-xs" aria-hidden="true">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );

  // Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="shrink-0 border-b bg-background flex flex-row items-center justify-between">
            <DrawerTitle>{title}</DrawerTitle>
            {hasActiveFilters && (
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
    );
  }

  // Desktop: Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 flex flex-col overflow-hidden" 
        align={align}
        style={{ maxHeight: 'min(80vh, var(--radix-popper-available-height))' }}
      >
        {/* Sticky header with Reset button */}
        <div className="shrink-0 bg-popover border-b px-3 py-2.5 flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={onReset}
            >
              <X className="h-3 w-3 mr-1" />
              Скинути
            </Button>
          )}
        </div>

        {/* Scrollable content with native scroll */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* Top fade indicator */}
          {canScrollUp && (
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-popover to-transparent pointer-events-none z-10" />
          )}

          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
            onScroll={checkScroll}
          >
            <div className="p-3 pb-6">
              <FiltersContent />
            </div>
          </div>

          {/* Bottom fade indicator */}
          {canScrollDown && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-popover to-transparent pointer-events-none z-10" />
          )}
        </div>

        {/* Footer with count */}
        {filteredCount !== undefined && totalCount !== undefined && (
          <div className="shrink-0 p-3 border-t border-border/50 text-center text-xs text-muted-foreground">
            Знайдено: <span className="font-medium text-foreground">{filteredCount}</span> з {totalCount}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default UnifiedFilterPopover;
