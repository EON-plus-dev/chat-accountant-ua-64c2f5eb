import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NomenclatureFilterState, CategoryFilter, StockFilter, SyncFilter } from "./NomenclatureFiltersPopover";

interface NomenclatureActiveFiltersBarProps {
  filters: NomenclatureFilterState;
  quickFilter: string | null;
  filteredCount: number;
  totalCount: number;
  onRemoveFilter: (key: keyof NomenclatureFilterState) => void;
  onRemoveQuickFilter: () => void;
  onClearAll: () => void;
  quickFilterLabels?: Record<string, string>;
}

const categoryLabels: Record<CategoryFilter, string> = {
  all: "Усі",
  service: "Послуги",
  product: "Товари",
};

const stockLabels: Record<StockFilter, string> = {
  all: "Усі",
  "in-stock": "В наявності",
  "limited": "Обмежено",
  "out-of-stock": "Немає",
  "on-order": "Замовлено",
};

const syncLabels: Record<SyncFilter, string> = {
  all: "Усі",
  synced: "Синхронізовано",
  pending: "Очікує",
  conflict: "Конфлікт",
  error: "Помилка",
};

export const NomenclatureActiveFiltersBar = ({
  filters,
  quickFilter,
  filteredCount,
  totalCount,
  onRemoveFilter,
  onRemoveQuickFilter,
  onClearAll,
  quickFilterLabels = {},
}: NomenclatureActiveFiltersBarProps) => {
  const hasFilters =
    filters.category !== "all" ||
    filters.stock !== "all" ||
    filters.sync !== "all" ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    quickFilter !== null;

  if (!hasFilters) return null;

  return (
    <div className="flex items-center gap-1.5 py-2 flex-wrap">
      <span className="text-xs text-muted-foreground">
        Знайдено: <span className="font-medium text-foreground">{filteredCount}</span> з {totalCount}
      </span>

      {/* Category chip */}
      {filters.category !== "all" && (
        <Badge variant="secondary" className="h-6 px-2 text-xs gap-1">
          {categoryLabels[filters.category]}
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive"
            onClick={() => onRemoveFilter("category")}
          />
        </Badge>
      )}

      {/* Stock chip */}
      {filters.stock !== "all" && (
        <Badge variant="secondary" className="h-6 px-2 text-xs gap-1">
          {stockLabels[filters.stock]}
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive"
            onClick={() => onRemoveFilter("stock")}
          />
        </Badge>
      )}

      {/* Sync chip */}
      {filters.sync !== "all" && (
        <Badge variant="secondary" className="h-6 px-2 text-xs gap-1">
          {syncLabels[filters.sync]}
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive"
            onClick={() => onRemoveFilter("sync")}
          />
        </Badge>
      )}

      {/* Price range chip */}
      {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
        <Badge variant="secondary" className="h-6 px-2 text-xs gap-1">
          Ціна: {filters.priceMin ?? "0"} — {filters.priceMax ?? "∞"} ₴
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive"
            onClick={() => {
              onRemoveFilter("priceMin");
              onRemoveFilter("priceMax");
            }}
          />
        </Badge>
      )}

      {/* Quick filter chip */}
      {quickFilter && (
        <Badge variant="secondary" className="h-6 px-2 text-xs gap-1">
          {quickFilterLabels[quickFilter] || quickFilter}
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive"
            onClick={onRemoveQuickFilter}
          />
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={onClearAll}
      >
        <X className="w-3 h-3 mr-1" />
        Скинути
      </Button>
    </div>
  );
};

export default NomenclatureActiveFiltersBar;
