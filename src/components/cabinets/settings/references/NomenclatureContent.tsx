import { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Package,
  Briefcase,
  Box,
  Star,
  Download,
} from "lucide-react";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { SortableHeader } from "@/components/ui/sortable-header";
import { useSortState } from "@/hooks/use-sort-state";
import { getNomenclatureForCabinet } from "@/config/settingsConfig";
import { isDemoCabinet, getDemoNomenclatureV2ForCabinet } from "@/config/demoCabinetsData";
import type { NomenclatureItemV2, SyncConflict } from "@/config/nomenclatureConfig";
import { formatNomenclaturePrice, convertToV2 } from "@/config/nomenclatureConfig";
import type { Cabinet } from "@/types/cabinet";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  SyncPanel, 
  StockIndicator, 
  SyncStatusBadge, 
  ConflictResolutionPanel,
  NomenclatureDetailSheet,
  NomenclatureFiltersPopover,
  NomenclatureActiveFiltersBar,
  AddNomenclatureSheet,
  type NomenclatureFilterState,
} from "./nomenclature";
import { DataQualityButton, type IssueTypeDefinition } from "@/components/ui/DataQualityButton";
import { SyncStatusButton } from "@/components/ui/SyncStatusButton";
import { toast } from "sonner";

interface NomenclatureContentProps {
  cabinet: Cabinet;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToNomenclature?: (itemId: string, category?: string) => void;
}

type SortField = "sku" | "name" | "price" | "stock" | "updated";

const defaultFilters: NomenclatureFilterState = {
  category: "all",
  stock: "all",
  sync: "all",
  priceMin: undefined,
  priceMax: undefined,
};

// Issue type config for data quality
const nomenclatureIssueTypeConfig: Record<string, IssueTypeDefinition> = {
  low_stock: { label: "Низький залишок", shortLabel: "Мало", color: "amber", priority: 1 },
  out_of_stock: { label: "Немає в наявності", shortLabel: "Немає", color: "red", priority: 2 },
  sync_conflict: { label: "Конфлікт синхронізації", shortLabel: "Конфлікт", color: "orange", priority: 3 },
  sync_error: { label: "Помилка синхронізації", shortLabel: "Помилка", color: "red", priority: 4 },
  missing_barcode: { label: "Немає штрих-коду", shortLabel: "Без EAN", color: "slate", priority: 5 },
  missing_price: { label: "Немає ціни", shortLabel: "Без ціни", color: "yellow", priority: 6 },
};

export const NomenclatureContent = ({ 
  cabinet,
  searchQuery, 
  onSearchChange,
  onNavigateToNomenclature,
}: NomenclatureContentProps) => {
  // Detail sheet state
  const [selectedItem, setSelectedItem] = useState<NomenclatureItemV2 | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [filters, setFilters] = useState<NomenclatureFilterState>(defaultFilters);
  const [localItems, setLocalItems] = useState<NomenclatureItemV2[]>([]);
  
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  
  // Sorting state
  const { sort, handleSort } = useSortState<SortField>("name", "asc");
  
  // Get items - use V2 for demo cabinets, convert legacy for others
  const baseItems = useMemo((): NomenclatureItemV2[] => {
    if (isDemoCabinet(cabinet.id)) {
      const v2Items = getDemoNomenclatureV2ForCabinet(cabinet.id);
      if (v2Items.length > 0) return v2Items;
    }
    
    // Fallback: convert legacy items to V2
    const legacyItems = getNomenclatureForCabinet(cabinet);
    return legacyItems.map(convertToV2);
  }, [cabinet]);
  
  // Combine base items with locally added items
  const allItems = useMemo(() => [...localItems, ...baseItems], [localItems, baseItems]);
  
  const filteredItems = useMemo(() => {
    let items = allItems;
    
    
    // Filter by category
    if (filters.category !== "all") {
      items = items.filter(i => i.category === filters.category);
    }
    
    // Filter by stock status (products only)
    if (filters.stock !== "all") {
      items = items.filter(i => i.stock?.status === filters.stock);
    }
    
    // Filter by sync status
    if (filters.sync !== "all") {
      items = items.filter(i => i.sync.syncStatus === filters.sync);
    }
    
    // Filter by price range
    if (filters.priceMin !== undefined) {
      items = items.filter(i => i.pricing.basePrice >= filters.priceMin!);
    }
    if (filters.priceMax !== undefined) {
      items = items.filter(i => i.pricing.basePrice <= filters.priceMax!);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(query) ||
        i.sku.toLowerCase().includes(query) ||
        i.barcode?.toLowerCase().includes(query) ||
        i.vendorCode?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    items = [...items].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      
      switch (sort.key) {
        case "sku":
          return a.sku.localeCompare(b.sku) * direction;
        case "name":
          return a.name.localeCompare(b.name) * direction;
        case "price":
          return (a.pricing.basePrice - b.pricing.basePrice) * direction;
        case "stock":
          const aStock = a.stock?.available ?? -1;
          const bStock = b.stock?.available ?? -1;
          return (aStock - bStock) * direction;
        case "updated":
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction;
        default:
          return 0;
      }
    });
    
    return items;
  }, [allItems, filters, searchQuery, sort]);

  const stats = useMemo(() => ({
    total: allItems.length,
    services: allItems.filter(i => i.category === "service").length,
    products: allItems.filter(i => i.category === "product").length,
    synced: allItems.filter(i => i.sync.syncStatus === "synced").length,
    conflicts: allItems.filter(i => i.sync.syncStatus === "conflict").length,
    syncErrors: allItems.filter(i => i.sync.syncStatus === "error").length,
    lowStock: allItems.filter(i => i.stock?.status === "limited").length,
    outOfStock: allItems.filter(i => i.stock?.status === "out-of-stock").length,
    favorites: allItems.filter(i => i.isFavorite).length,
    missingBarcode: allItems.filter(i => i.category === "product" && !i.barcode).length,
  }), [allItems]);

  // Calculate data quality
  const qualitySummary = useMemo(() => {
    const totalIssues = stats.lowStock + stats.outOfStock + stats.conflicts + stats.syncErrors + stats.missingBarcode;
    const qualityPercent = stats.total > 0 
      ? Math.round(((stats.total - totalIssues) / stats.total) * 100)
      : 100;
    
    return {
      qualityPercent: Math.max(0, qualityPercent),
      totalCount: stats.total,
      itemsWithIssues: totalIssues,
      issuesByType: {
        low_stock: stats.lowStock,
        out_of_stock: stats.outOfStock,
        sync_conflict: stats.conflicts,
        sync_error: stats.syncErrors,
        missing_barcode: stats.missingBarcode,
      },
    };
  }, [stats]);


  const handleSyncComplete = useCallback((newConflicts: SyncConflict[]) => {
    setConflicts(newConflicts);
  }, []);

  const handleConflictResolve = useCallback((resolvedItems: NomenclatureItemV2[]) => {
    // In real app, would update the items state
    setConflicts([]);
  }, []);

  const handleAddItem = useCallback((newItem: NomenclatureItemV2) => {
    setLocalItems(prev => [newItem, ...prev]);
  }, []);

  const handleExport = (format: "csv" | "pdf") => {
    toast.success(`Експорт у ${format.toUpperCase()}`, {
      description: `${filteredItems.length} позицій буде експортовано`,
    });
  };

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof NomenclatureFilterState) => {
    setFilters(prev => ({
      ...prev,
      [key]: key === "category" ? "all" : key === "stock" ? "all" : key === "sync" ? "all" : undefined,
    }));
  }, []);

  const hasActiveFilters = 
    filters.category !== "all" || 
    filters.stock !== "all" || 
    filters.sync !== "all" || 
    filters.priceMin !== undefined || 
    filters.priceMax !== undefined;

  return (
    <div className="space-y-4">
      {/* Note: SyncPanel removed - functionality consolidated into SyncStatusButton */}

      {/* Conflict Resolution Panel */}
      {conflicts.length > 0 && (
        <ConflictResolutionPanel
          conflicts={conflicts}
          items={allItems}
          onResolve={handleConflictResolve}
          onDismiss={() => setConflicts([])}
        />
      )}

      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Пошук за назвою, SKU або штрих-кодом..."
        sticky={false}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Unified Filters Popover */}
            <NomenclatureFiltersPopover
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleResetFilters}
              stats={stats}
              showSync={isDemoCabinet(cabinet.id)}
              showStock={filters.category !== "service" && stats.products > 0}
            />

            {/* Data Quality Button */}
            <DataQualityButton
              summary={qualitySummary}
              issueTypeConfig={nomenclatureIssueTypeConfig}
              onShowAllIssues={handleResetFilters}
              onFilterByIssueType={(type) => {
                if (type === "low_stock") {
                  setFilters(prev => ({ ...prev, stock: "limited" }));
                } else if (type === "out_of_stock") {
                  setFilters(prev => ({ ...prev, stock: "out-of-stock" }));
                } else if (type === "sync_conflict" || type === "sync_error") {
                  setFilters(prev => ({ ...prev, sync: "conflict" }));
                }
              }}
              itemLabel="позицій"
            />

            {/* Sync Status Button - uses nomenclature variant */}
            <SyncStatusButton
              cabinetType={cabinet.type}
              variant="nomenclature"
              cabinetId={cabinet.id}
            />

            {/* Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Експорт
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  📊 Експорт у CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  📄 Експорт у PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button size="sm" onClick={() => setAddSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Додати
            </Button>
          </div>
        }
      />

      {/* Active Filters Bar */}
      <NomenclatureActiveFiltersBar
        filters={filters}
        quickFilter={null}
        filteredCount={filteredItems.length}
        totalCount={allItems.length}
        onRemoveFilter={handleRemoveFilter}
        onRemoveQuickFilter={() => {}}
        onClearAll={handleResetFilters}
      />
      
      {/* Stats Summary - removed, now in DataQualityButton */}
      
      {/* Desktop Table */}
      <div className="hidden sm:block border rounded-lg overflow-hidden">
        <Table containerClassName="md:max-h-[calc(100vh-400px)] md:overflow-auto">
          <TableHeader sticky>
            <TableRow className="bg-muted/50">
              <SortableHeader
                field="sku"
                label="SKU"
                currentField={sort.key}
                direction={sort.direction}
                onSort={handleSort}
                className="w-[100px]"
              />
              <TableHead className="w-[130px]">Штрих-код</TableHead>
              <TableHead className="w-[100px]">УКТ ЗЕД</TableHead>
              <SortableHeader
                field="name"
                label="Назва"
                currentField={sort.key}
                direction={sort.direction}
                onSort={handleSort}
              />
              <TableHead className="w-[60px]">Од.</TableHead>
              <SortableHeader
                field="stock"
                label="Залишок"
                currentField={sort.key}
                direction={sort.direction}
                onSort={handleSort}
                className="w-[80px]"
                align="center"
              />
              <SortableHeader
                field="price"
                label="Ціна"
                currentField={sort.key}
                direction={sort.direction}
                onSort={handleSort}
                className="w-[100px]"
                align="right"
                numeric
              />
              <TableHead className="w-[60px] text-center">ПДВ</TableHead>
              <TableHead className="w-[60px] text-center">Тип</TableHead>
              {isDemoCabinet(cabinet.id) && (
                <TableHead className="w-[50px] text-center">Sync</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow 
                key={item.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  if (onNavigateToNomenclature) {
                    onNavigateToNomenclature(item.id, "nomenclature");
                  } else {
                    setSelectedItem(item);
                    setDetailSheetOpen(true);
                  }
                }}
              >
                <TableCell>
                  <div className="flex items-center gap-1">
                    {item.isFavorite && (
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    )}
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.sku}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {item.barcode ? (
                    <span className="font-mono text-xs text-muted-foreground">{item.barcode}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.uktzedCode ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-mono text-xs text-muted-foreground">{item.uktzedCode}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Код УКТ ЗЕД: {item.uktzedCode}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">{item.description}</p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{item.unitCode}</TableCell>
                <TableCell className="text-center">
                  <StockIndicator stock={item.stock} category={item.category} />
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-mono">
                        {formatNomenclaturePrice(item.pricing.basePrice, item.pricing.currency)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 text-xs">
                        <p>Без ПДВ: {formatNomenclaturePrice(item.pricing.basePrice, item.pricing.currency)}</p>
                        {item.pricing.vatRate > 0 && (
                          <>
                            <p>ПДВ: {item.pricing.vatRate}%</p>
                            <p className="font-medium">
                              З ПДВ: {formatNomenclaturePrice(item.pricing.priceWithVat, item.pricing.currency)}
                            </p>
                          </>
                        )}
                        {item.pricing.priceTiers && item.pricing.priceTiers.length > 0 && (
                          <div className="pt-1 border-t mt-1">
                            <p className="text-muted-foreground">Оптові ціни:</p>
                            {item.pricing.priceTiers.map((tier, i) => (
                              <p key={i}>
                                від {tier.minQuantity} шт: {formatNomenclaturePrice(tier.price, item.pricing.currency)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={item.pricing.vatRate > 0 ? "default" : "secondary"}
                    className={cn(
                      "text-xs",
                      item.pricing.vatRate === 0 && "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.pricing.vatRate > 0 ? `${item.pricing.vatRate}%` : "Без ПДВ"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.category === "service" ? "secondary" : "default"}>
                    {item.category === "service" ? (
                      <><Briefcase className="h-3 w-3 mr-1" />П</>
                    ) : (
                      <><Box className="h-3 w-3 mr-1" />Т</>
                    )}
                  </Badge>
                </TableCell>
                {isDemoCabinet(cabinet.id) && (
                  <TableCell className="text-center">
                    <SyncStatusBadge sync={item.sync} compact />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => {
              if (onNavigateToNomenclature) {
                onNavigateToNomenclature(item.id, "nomenclature");
              } else {
                setSelectedItem(item);
                setDetailSheetOpen(true);
              }
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                {item.isFavorite && (
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                )}
                <Badge variant="outline" className="font-mono text-xs">
                  {item.sku}
                </Badge>
                <Badge variant={item.category === "service" ? "secondary" : "default"} className="text-xs">
                  {item.category === "service" ? "П" : "Т"}
                </Badge>
              </div>
              <StockIndicator stock={item.stock} category={item.category} />
            </div>
            <p className="font-medium text-sm truncate">{item.name}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
            )}
            <div className="flex items-center justify-between mt-1.5">
              <span className="font-mono text-xs text-muted-foreground">
                {formatNomenclaturePrice(item.pricing.basePrice, item.pricing.currency)}/{item.unitCode}
              </span>
              <Badge
                variant={item.pricing.vatRate > 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {item.pricing.vatRate > 0 ? `ПДВ ${item.pricing.vatRate}%` : "Без ПДВ"}
              </Badge>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Позицій не знайдено</p>
          {hasActiveFilters && (
            <Button 
              variant="link" 
              className="mt-2"
              onClick={handleResetFilters}
            >
              Скинути всі фільтри
            </Button>
          )}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground pt-2 border-t">
        💡 Позиції з номенклатури автоматично підставляються при створенні рахунків та актів. 
        {isDemoCabinet(cabinet.id) && " Використовуйте синхронізацію для оновлення даних з 1C, M.E.Doc або Vchasno."}
      </div>

      {/* Detail Sheet */}
      <NomenclatureDetailSheet
        item={selectedItem}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        cabinet={cabinet}
        onDelete={(itemId) => {
          // In real app, would delete the item
          if (import.meta.env.DEV) console.log("Delete item:", itemId);
          setDetailSheetOpen(false);
        }}
        onUpdate={(updatedItem) => {
          // In real app, would update the item
          if (import.meta.env.DEV) console.log("Update item:", updatedItem);
        }}
      />

      {/* Add Nomenclature Sheet */}
      <AddNomenclatureSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onSuccess={handleAddItem}
        cabinetId={cabinet.id}
      />
    </div>
  );
};
