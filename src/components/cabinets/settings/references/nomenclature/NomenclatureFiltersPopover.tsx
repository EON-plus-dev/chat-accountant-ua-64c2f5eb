import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { StockStatus, SyncStatus } from "@/config/nomenclatureConfig";

export type CategoryFilter = "all" | "service" | "product";
export type StockFilter = "all" | StockStatus;
export type SyncFilter = "all" | SyncStatus;

export interface NomenclatureFilterState {
  category: CategoryFilter;
  stock: StockFilter;
  sync: SyncFilter;
  priceMin?: number;
  priceMax?: number;
}

interface NomenclatureFiltersPopoverProps {
  filters: NomenclatureFilterState;
  onFiltersChange: (filters: NomenclatureFilterState) => void;
  onReset: () => void;
  stats: {
    total: number;
    services: number;
    products: number;
    synced: number;
    conflicts: number;
    lowStock: number;
    outOfStock: number;
  };
  showSync?: boolean;
  showStock?: boolean;
}

export const NomenclatureFiltersPopover = ({
  filters,
  onFiltersChange,
  onReset,
  stats,
  showSync = true,
  showStock = true,
}: NomenclatureFiltersPopoverProps) => {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.stock !== "all") count++;
    if (filters.sync !== "all") count++;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const updateFilter = <K extends keyof NomenclatureFilterState>(
    key: K,
    value: NomenclatureFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 h-9 shrink-0",
            hasActiveFilters && "border-primary text-primary"
          )}
          aria-label={`Фільтри${hasActiveFilters ? `. Активних: ${activeFiltersCount}` : ""}`}
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Фільтри</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs" aria-hidden="true">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 flex flex-col overflow-hidden"
        align="end"
        style={{ maxHeight: "min(80vh, var(--radix-popper-available-height))" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-popover border-b px-3 py-2.5 flex items-center justify-between">
          <span className="text-sm font-medium">Фільтри</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => {
                onReset();
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Скинути
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Категорія
            </Label>
            <Select
              value={filters.category}
              onValueChange={(v) => updateFilter("category", v as CategoryFilter)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Оберіть категорію" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі ({stats.total})</SelectItem>
                <SelectItem value="service">Послуги ({stats.services})</SelectItem>
                <SelectItem value="product">Товари ({stats.products})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock Filter */}
          {showStock && filters.category !== "service" && stats.products > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Наявність
              </Label>
              <Select
                value={filters.stock}
                onValueChange={(v) => updateFilter("stock", v as StockFilter)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Оберіть статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі залишки</SelectItem>
                  <SelectItem value="in-stock">🟢 В наявності</SelectItem>
                  <SelectItem value="limited">🟡 Обмежено ({stats.lowStock})</SelectItem>
                  <SelectItem value="out-of-stock">🔴 Немає ({stats.outOfStock})</SelectItem>
                  <SelectItem value="on-order">📦 Замовлено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sync Filter */}
          {showSync && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Синхронізація
              </Label>
              <Select
                value={filters.sync}
                onValueChange={(v) => updateFilter("sync", v as SyncFilter)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Оберіть статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі статуси</SelectItem>
                  <SelectItem value="synced">✅ Синхронізовано ({stats.synced})</SelectItem>
                  <SelectItem value="pending">🔄 Очікує</SelectItem>
                  <SelectItem value="conflict">⚠️ Конфлікт ({stats.conflicts})</SelectItem>
                  <SelectItem value="error">❌ Помилка</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Price Range */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Ціновий діапазон
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Від"
                className="h-9"
                value={filters.priceMin ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "priceMin",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="number"
                placeholder="До"
                className="h-9"
                value={filters.priceMax ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "priceMax",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Застосувати
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NomenclatureFiltersPopover;
