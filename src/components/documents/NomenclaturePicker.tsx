/**
 * NOMENCLATURE PICKER - Smart Selection Component
 * 
 * Розумний вибір номенклатури для документів з:
 * - Пошуком (за назвою, SKU, штрих-кодом)
 * - Індикаторами наявності
 * - Недавно використаними
 * - Обраними позиціями
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  Package,
  Briefcase,
  Box,
  Star,
  Clock,
  Barcode,
  Plus,
  Check,
  AlertTriangle,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import {
  formatNomenclaturePrice,
  stockStatusColors,
  stockStatusIcons,
} from "@/config/nomenclatureConfig";
import { getDemoNomenclatureV2ForCabinet } from "@/config/demoCabinets/nomenclature";
import { getNomenclatureForCabinet } from "@/config/settingsConfig";
import { convertToV2 } from "@/config/nomenclatureConfig";
import { isDemoCabinet } from "@/config/demoCabinetsData";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface NomenclaturePickerProps {
  cabinet: Cabinet;
  onSelect: (item: NomenclatureItemV2) => void;
  selectedItems?: string[];
  filter?: "all" | "products" | "services";
  showStock?: boolean;
  showPricing?: boolean;
  trigger?: React.ReactNode;
}

interface RecentItem {
  id: string;
  name: string;
  timestamp: number;
}

// ============================================
// RECENT ITEMS STORAGE
// ============================================

const RECENT_KEY_PREFIX = "nomenclature-recent-";
const MAX_RECENT = 5;

const getRecentItems = (cabinetId: string): RecentItem[] => {
  try {
    const stored = localStorage.getItem(`${RECENT_KEY_PREFIX}${cabinetId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addRecentItem = (cabinetId: string, item: NomenclatureItemV2): void => {
  try {
    const recent = getRecentItems(cabinetId);
    const filtered = recent.filter(r => r.id !== item.id);
    const updated = [
      { id: item.id, name: item.name, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(`${RECENT_KEY_PREFIX}${cabinetId}`, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
};

// ============================================
// COMPONENT
// ============================================

export const NomenclaturePicker = ({
  cabinet,
  onSelect,
  selectedItems = [],
  filter = "all",
  showStock = true,
  showPricing = true,
  trigger,
}: NomenclaturePickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  
  const debouncedSearch = useDebouncedValue(searchQuery, 200);

  // Get all items
  const allItems = useMemo((): NomenclatureItemV2[] => {
    if (isDemoCabinet(cabinet.id)) {
      const v2Items = getDemoNomenclatureV2ForCabinet(cabinet.id);
      if (v2Items.length > 0) return v2Items;
    }
    const legacyItems = getNomenclatureForCabinet(cabinet);
    return legacyItems.map(convertToV2);
  }, [cabinet]);

  // Get recent items
  const recentItems = useMemo(() => {
    const recent = getRecentItems(cabinet.id);
    return recent
      .map(r => allItems.find(i => i.id === r.id))
      .filter(Boolean) as NomenclatureItemV2[];
  }, [cabinet.id, allItems]);

  // Get favorites
  const favoriteItems = useMemo(() => {
    return allItems.filter(i => i.isFavorite);
  }, [allItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allItems.filter(i => i.isActive);

    // Apply category filter
    if (filter === "products") {
      items = items.filter(i => i.category === "product");
    } else if (filter === "services") {
      items = items.filter(i => i.category === "service");
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.sku.toLowerCase().includes(query) ||
        i.barcode?.toLowerCase().includes(query) ||
        i.vendorCode?.toLowerCase().includes(query) ||
        i.shortName?.toLowerCase().includes(query)
      );
    }

    return items;
  }, [allItems, filter, debouncedSearch]);

  // Handle selection
  const handleSelect = useCallback((item: NomenclatureItemV2) => {
    addRecentItem(cabinet.id, item);
    onSelect(item);
    setOpen(false);
    setSearchQuery("");
  }, [cabinet.id, onSelect]);

  // Simulate barcode scan
  const handleBarcodeScan = useCallback(async () => {
    setIsScanning(true);
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    // Pick a random product with barcode
    const productsWithBarcode = allItems.filter(i => i.barcode && i.category === "product");
    
    if (productsWithBarcode.length > 0) {
      const randomItem = productsWithBarcode[Math.floor(Math.random() * productsWithBarcode.length)];
      setSearchQuery(randomItem.barcode || "");
      toast.success("Штрих-код розпізнано", { description: randomItem.barcode });
    } else {
      toast.error("Штрих-код не розпізнано");
    }
    
    setIsScanning(false);
  }, [allItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === "Escape") {
        setOpen(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const renderItem = (item: NomenclatureItemV2) => {
    const isSelected = selectedItems.includes(item.id);
    const isLowStock = item.stock && item.stock.available <= item.stock.reorderPoint;

    return (
      <button
        key={item.id}
        onClick={() => handleSelect(item)}
        className={cn(
          "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
          "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
          isSelected && "bg-primary/10 border border-primary/20"
        )}
      >
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg shrink-0",
          item.category === "service" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-amber-100 dark:bg-amber-900/30"
        )}>
          {item.category === "service" ? (
            <Briefcase className="h-4 w-4 text-blue-600" />
          ) : (
            <Box className="h-4 w-4 text-amber-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {item.isFavorite && (
              <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
            )}
            <span className="font-medium truncate">{item.name}</span>
            {isSelected && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              {item.sku}
            </Badge>
            {showStock && item.category === "product" && item.stock && (
              <span className={cn("text-xs flex items-center gap-1", stockStatusColors[item.stock.status])}>
                {stockStatusIcons[item.stock.status]} {item.stock.available} шт
              </span>
            )}
            {isLowStock && (
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Price */}
        {showPricing && (
          <div className="text-right shrink-0">
            <p className="font-mono font-medium">
              {formatNomenclaturePrice(item.pricing.basePrice, item.pricing.currency)}
            </p>
            {item.pricing.vatRate > 0 && (
              <p className="text-xs text-muted-foreground">
                +{item.pricing.vatRate}% ПДВ
              </p>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Додати позицію
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="responsive-right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Вибір номенклатури
          </SheetTitle>
        </SheetHeader>

        {/* Search Bar */}
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Пошук за назвою, SKU, штрих-кодом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleBarcodeScan}
              disabled={isScanning}
              title="Сканувати штрих-код (demo)"
            >
              <Barcode className={cn("h-4 w-4", isScanning && "animate-pulse")} />
            </Button>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2">
            <Badge variant={filter === "all" ? "default" : "outline"} className="cursor-pointer">
              Усі ({allItems.filter(i => i.isActive).length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              <Box className="h-3 w-3 mr-1" />
              Товари ({allItems.filter(i => i.isActive && i.category === "product").length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              <Briefcase className="h-3 w-3 mr-1" />
              Послуги ({allItems.filter(i => i.isActive && i.category === "service").length})
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Recent Items */}
            {!debouncedSearch && recentItems.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Clock className="h-3 w-3" />
                  Нещодавно використані
                </h3>
                <div className="space-y-1">
                  {recentItems.slice(0, 3).map(renderItem)}
                </div>
              </div>
            )}

            {/* Favorites */}
            {!debouncedSearch && favoriteItems.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Star className="h-3 w-3" />
                  Обране
                </h3>
                <div className="space-y-1">
                  {favoriteItems.slice(0, 3).map(renderItem)}
                </div>
              </div>
            )}

            {/* Search Results or All Items */}
            <div>
              {debouncedSearch ? (
                <h3 className="text-xs font-medium text-muted-foreground mb-2">
                  Результати пошуку ({filteredItems.length})
                </h3>
              ) : (
                (recentItems.length > 0 || favoriteItems.length > 0) && (
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">
                    Усі позиції ({filteredItems.length})
                  </h3>
                )
              )}
              
              <div className="space-y-1">
                {filteredItems.map(renderItem)}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Позицій не знайдено</p>
                  {debouncedSearch && (
                    <p className="text-xs mt-1">
                      Спробуйте інший пошуковий запит
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
