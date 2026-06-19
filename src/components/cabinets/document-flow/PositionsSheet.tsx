/**
 * PositionsSheet Component
 * Enterprise-grade positions management with drag-to-reorder, discount, VAT, and clone
 */

import { useState, useMemo, useCallback } from "react";
import { Plus, Package, Search, X, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchNBUExchangeRate } from "@/lib/nbuExchangeRate";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { type NomenclatureItem, getNomenclatureForCabinet } from "@/config/settingsConfig";
import type { Cabinet } from "@/types/cabinet";
import type { DocumentPosition } from "@/config/documentTemplateGenerator";
import type { ExtendedDocumentPosition, DiscountType, VatRate, PositionCurrency } from "@/types/extendedPosition";
import { calculatePositionTotals } from "@/types/extendedPosition";
import { PositionCard } from "./positions/PositionCard";

interface PositionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positions: DocumentPosition[];
  onPositionsChange: (positions: DocumentPosition[]) => void;
  cabinet: Cabinet;
  documentDate?: string;
}

export function PositionsSheet({
  open,
  onOpenChange,
  positions,
  onPositionsChange,
  cabinet,
  documentDate = "",
}: PositionsSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNomenclature, setShowNomenclature] = useState(false);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  const nomenclature = useMemo(() => getNomenclatureForCabinet(cabinet), [cabinet]);

  const filteredNomenclature = useMemo(() => {
    if (!searchQuery.trim()) return nomenclature.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return nomenclature
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 20);
  }, [nomenclature, searchQuery]);

  // Cast positions to extended type for calculations
  const extendedPositions = positions as ExtendedDocumentPosition[];
  
  // Calculate totals with discount and VAT
  const totals = useMemo(() => calculatePositionTotals(extendedPositions), [extendedPositions]);

  // Check if has foreign currency positions
  const hasForeignCurrencyPositions = useMemo(() => 
    extendedPositions.some(p => p.currency && p.currency !== "UAH"),
    [extendedPositions]
  );

  // Bulk refresh all exchange rates
  const handleRefreshAllRates = useCallback(async () => {
    if (!documentDate) return;
    
    setIsRefreshingRates(true);
    
    try {
      const updatedPositions = await Promise.all(
        positions.map(async (pos) => {
          const ext = pos as ExtendedDocumentPosition;
          if (!ext.currency || ext.currency === "UAH") {
            return pos;
          }
          
          const result = await fetchNBUExchangeRate(ext.currency, documentDate);
          if (result) {
            return {
              ...pos,
              exchangeRate: result.rate,
              exchangeRateDate: result.date,
            };
          }
          return pos;
        })
      );
      
      onPositionsChange(updatedPositions);
      toast({ title: "Курси оновлено", description: "Всі курси оновлено за курсом НБУ" });
    } catch (error) {
      toast({ 
        title: "Помилка", 
        description: "Не вдалося оновити курси", 
        variant: "destructive" 
      });
    } finally {
      setIsRefreshingRates(false);
    }
  }, [documentDate, positions, onPositionsChange]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = positions.findIndex((p) => p.id === active.id);
        const newIndex = positions.findIndex((p) => p.id === over.id);
        onPositionsChange(arrayMove(positions, oldIndex, newIndex));
      }
    },
    [positions, onPositionsChange]
  );

  const handleAddFromNomenclature = useCallback(
    (item: NomenclatureItem) => {
      const newPosition: ExtendedDocumentPosition = {
        id: `pos-${Date.now()}`,
        name: item.name,
        quantity: 1,
        unit: item.unit,
        price: item.price,
        amount: item.price,
        discountType: "percent",
        discountValue: 0,
        vatRate: 0,
      };
      onPositionsChange([...positions, newPosition]);
      setShowNomenclature(false);
      setSearchQuery("");
    },
    [positions, onPositionsChange]
  );

  const handleAddEmpty = useCallback(() => {
    const newPosition: ExtendedDocumentPosition = {
      id: `pos-${Date.now()}`,
      name: "",
      quantity: 1,
      unit: "шт",
      price: 0,
      amount: 0,
      discountType: "percent",
      discountValue: 0,
      vatRate: 0,
    };
    onPositionsChange([...positions, newPosition]);
    setShowNomenclature(false);
  }, [positions, onPositionsChange]);

  const handleUpdatePosition = useCallback(
    (id: string, field: keyof ExtendedDocumentPosition, value: string | number) => {
      onPositionsChange(
        positions.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p, [field]: value } as ExtendedDocumentPosition;
          // Recalculate base amount
          if (field === "quantity" || field === "price") {
            updated.amount = updated.quantity * updated.price;
          }
          return updated;
        })
      );
    },
    [positions, onPositionsChange]
  );

  const handleCurrencyUpdate = useCallback(
    (id: string, currency: PositionCurrency, rate: number, rateDate: string) => {
      onPositionsChange(
        positions.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p } as ExtendedDocumentPosition;
          updated.currency = currency;
          updated.exchangeRate = rate;
          updated.exchangeRateDate = rateDate;
          return updated;
        })
      );
    },
    [positions, onPositionsChange]
  );

  const handleRemovePosition = useCallback(
    (id: string) => {
      onPositionsChange(positions.filter((p) => p.id !== id));
    },
    [positions, onPositionsChange]
  );

  const handleClonePosition = useCallback(
    (id: string) => {
      const original = positions.find((p) => p.id === id);
      if (!original) return;
      
      const cloned: ExtendedDocumentPosition = {
        ...(original as ExtendedDocumentPosition),
        id: `pos-${Date.now()}`,
        name: `${original.name} (копія)`,
      };
      
      const originalIndex = positions.findIndex((p) => p.id === id);
      const newPositions = [...positions];
      newPositions.splice(originalIndex + 1, 0, cloned);
      onPositionsChange(newPositions);
    },
    [positions, onPositionsChange]
  );

  const formatAmount = (amount: number) =>
    amount.toLocaleString("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Позиції документа
          </SheetTitle>
          <SheetDescription>
            Додайте товари або послуги. Перетягніть для зміни порядку.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-4 py-4">
          {/* Add button / Search */}
          <div className="shrink-0 flex gap-2">
            {showNomenclature ? (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук по номенклатурі..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => {
                    setShowNomenclature(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1 justify-start gap-2"
                  onClick={() => setShowNomenclature(true)}
                >
                  <Plus className="h-4 w-4" />
                  Додати позицію
                </Button>
                
                {/* Refresh all rates button - visible when has foreign currency positions */}
                {hasForeignCurrencyPositions && documentDate && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefreshAllRates}
                    disabled={isRefreshingRates}
                    title="Оновити всі курси валют"
                  >
                    <RefreshCw className={cn("h-4 w-4", isRefreshingRates && "animate-spin")} />
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Nomenclature dropdown */}
          {showNomenclature && (
            <div className="shrink-0 border rounded-lg overflow-hidden bg-background">
              <Command className="rounded-none">
                <CommandList className="max-h-48">
                  <CommandEmpty>Не знайдено</CommandEmpty>
                  <CommandGroup heading="Номенклатура">
                    {filteredNomenclature.map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleAddFromNomenclature(item)}
                        className="cursor-pointer"
                      >
                        <div className="flex-1 flex items-center justify-between">
                          <span className="truncate">{item.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {item.price.toLocaleString("uk-UA")} ₴/{item.unit}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleAddEmpty}
                      className="text-primary cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Додати вручну
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}

          <Separator className="shrink-0" />

          {/* Positions list with drag-and-drop */}
          <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
            {positions.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={positions.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 pr-2">
                    {extendedPositions.map((pos, index) => (
                      <PositionCard
                        key={pos.id}
                        position={pos}
                        index={index}
                        documentDate={documentDate}
                        onUpdate={handleUpdatePosition}
                        onRemove={handleRemovePosition}
                        onClone={handleClonePosition}
                        onCurrencyUpdate={handleCurrencyUpdate}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p className="font-medium">Немає позицій</p>
                <p className="text-sm">Натисніть "Додати позицію" для початку</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <Separator className="shrink-0" />

        {/* Footer with totals breakdown */}
        <SheetFooter className="shrink-0 pt-4 pb-safe flex-col gap-2">
          {/* Totals breakdown */}
          {positions.length > 0 && (totals.totalDiscountUAH > 0 || totals.totalVatUAH > 0) && (
            <div className="w-full space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Підсумок:</span>
                <span className="tabular-nums">{formatAmount(totals.subtotalUAH)} ₴</span>
              </div>
              {totals.totalDiscountUAH > 0 && (
                <div className="flex justify-between text-success">
                  <span>Знижка:</span>
                  <span className="tabular-nums">-{formatAmount(totals.totalDiscountUAH)} ₴</span>
                </div>
              )}
              {totals.totalVatUAH > 0 && (
                <div className="flex justify-between text-warning">
                  <span>ПДВ:</span>
                  <span className="tabular-nums">+{formatAmount(totals.totalVatUAH)} ₴</span>
                </div>
              )}
              <Separator className="my-1" />
            </div>
          )}
          
          <div className="w-full flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Всього:</span>
              <span className="text-xl font-bold tabular-nums">
                {formatAmount(totals.totalGrossUAH)} ₴
              </span>
            </div>
            <Button onClick={() => onOpenChange(false)}>Готово</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
