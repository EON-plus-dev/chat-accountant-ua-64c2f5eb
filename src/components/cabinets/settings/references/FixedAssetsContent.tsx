import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Landmark, ClipboardCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { SortableHeader } from "@/components/ui/sortable-header";
import { useSortState } from "@/hooks/use-sort-state";
import {
  getFixedAssetsForCabinet,
  fixedAssetCategoryLabels,
  fixedAssetCategoryColors,
  fixedAssetStatusLabels,
  fixedAssetStatusColors,
  intangibleAssetTypeLabels,
  calculateWearPercent,
  formatCurrency,
  type FixedAssetCategory,
  type FixedAssetStatus,
  type IntangibleAssetType,
} from "@/config/fixedAssetsConfig";
import type { Cabinet } from "@/types/cabinet";
import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { AddFixedAssetSheet } from "./fixed-assets/AddFixedAssetSheet";
import { InventorySheet } from "./fixed-assets/InventorySheet";
import type { FixedAsset } from "@/config/fixedAssetsConfig";
import type { InventoryResult } from "@/config/fixedAssetsConfig";

interface FixedAssetsContentProps {
  cabinet: Cabinet;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToFixedAsset?: (assetId: string, category?: string) => void;
}

type SortField = "inventoryNumber" | "name" | "originalCost" | "residualValue" | "purchaseDate";

export const FixedAssetsContent = ({
  cabinet,
  searchQuery,
  onSearchChange,
  onNavigateToFixedAsset,
}: FixedAssetsContentProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [localAssets, setLocalAssets] = useState<FixedAsset[]>([]);
  const { sort, handleSort } = useSortState<SortField>("name", "asc");

  const demoItems = useMemo(() => getFixedAssetsForCabinet(cabinet.id), [cabinet.id]);
  const allItems = useMemo(() => [...demoItems, ...localAssets], [demoItems, localAssets]);

  const filteredItems = useMemo(() => {
    let items = allItems;

    if (categoryFilter !== "all") {
      items = items.filter(i => i.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      items = items.filter(i => i.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.inventoryNumber.toLowerCase().includes(q)
      );
    }

    return [...items].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      switch (sort.key) {
        case "inventoryNumber": return a.inventoryNumber.localeCompare(b.inventoryNumber) * dir;
        case "name": return a.name.localeCompare(b.name) * dir;
        case "originalCost": return (a.originalCost - b.originalCost) * dir;
        case "residualValue": return (a.residualValue - b.residualValue) * dir;
        case "purchaseDate": return (new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()) * dir;
        default: return 0;
      }
    });
  }, [allItems, categoryFilter, statusFilter, searchQuery, sort]);

  const handleRowClick = (assetId: string) => {
    if (onNavigateToFixedAsset) {
      onNavigateToFixedAsset(assetId, "fixed-assets");
    } else {
      toast.info("Детальна сторінка ОЗ");
    }
  };

  return (
    <div className="space-y-4">
      <UnifiedToolbar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder="Пошук за назвою або інв. номером..."
        sticky={false}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Група" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі групи</SelectItem>
                {(Object.entries(fixedAssetCategoryLabels) as [FixedAssetCategory, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі статуси</SelectItem>
                {(Object.entries(fixedAssetStatusLabels) as [FixedAssetStatus, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setInventoryOpen(true)} className="gap-1.5">
              <ClipboardCheck className="h-4 w-4" />
              Інвентаризація
            </Button>
            <Button size="sm" onClick={() => setAddSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Додати
            </Button>
          </div>
        }
      />

      <AddFixedAssetSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        existingAssets={allItems}
        onSuccess={(asset) => setLocalAssets(prev => [...prev, asset])}
      />

      <InventorySheet
        open={inventoryOpen}
        onOpenChange={setInventoryOpen}
        assets={allItems}
        onSave={(results, date) => {
          setLocalAssets((prev) => {
            const updated = [...prev];
            for (const { assetId, result } of results) {
              const idx = updated.findIndex((a) => a.id === assetId);
              if (idx >= 0) {
                updated[idx] = { ...updated[idx], lastInventoryDate: date, lastInventoryResult: result };
              } else {
                const existing = allItems.find((a) => a.id === assetId);
                if (existing) {
                  updated.push({ ...existing, lastInventoryDate: date, lastInventoryResult: result });
                }
              }
            }
            return updated;
          });
        }}
      />

      {/* Desktop table */}
      <div className="hidden sm:block border rounded-lg overflow-hidden">
        <Table containerClassName="md:max-h-[calc(100vh-400px)] md:overflow-auto">
          <TableHeader sticky>
            <TableRow className="bg-muted/50">
              <SortableHeader field="inventoryNumber" label="Інв. №" currentField={sort.key} direction={sort.direction} onSort={handleSort} className="w-[100px]" />
              <SortableHeader field="name" label="Назва" currentField={sort.key} direction={sort.direction} onSort={handleSort} />
              <TableHead className="w-[110px]">Група</TableHead>
              <SortableHeader field="originalCost" label="Первісна" currentField={sort.key} direction={sort.direction} onSort={handleSort} className="w-[110px]" align="right" numeric />
              <TableHead className="w-[160px]">Залишкова / Знос</TableHead>
              <TableHead className="w-[100px]">Статус</TableHead>
              <SortableHeader field="purchaseDate" label="Введення" currentField={sort.key} direction={sort.direction} onSort={handleSort} className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const wear = calculateWearPercent(item);
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(item.id)}
                >
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{item.inventoryNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{item.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="status" className={cn("text-xs", fixedAssetCategoryColors[item.category])}>
                      {fixedAssetCategoryLabels[item.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(item.originalCost)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="text-sm font-mono">{formatCurrency(item.residualValue)}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={wear} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{wear}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="status" className={cn("text-xs", fixedAssetStatusColors[item.status])}>
                      {fixedAssetStatusLabels[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.purchaseDate).toLocaleDateString("uk-UA")}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <Landmark className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>Основних засобів не знайдено</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filteredItems.map((item) => {
          const wear = calculateWearPercent(item);
          return (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRowClick(item.id)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.inventoryNumber}</p>
                  </div>
                  <Badge variant="status" className={cn("text-xs shrink-0", fixedAssetStatusColors[item.status])}>
                    {fixedAssetStatusLabels[item.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="status" className={cn("text-xs", fixedAssetCategoryColors[item.category])}>
                    {fixedAssetCategoryLabels[item.category]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.purchaseDate).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Вартість:</span>
                  <span className="font-mono">{formatCurrency(item.originalCost)}</span>
                </div>
                {/* Transport: mileage & insurance */}
                {item.category === "transport" && item.vehicleMileage != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Пробіг:</span>
                    <span className="font-mono">{item.vehicleMileage.toLocaleString("uk-UA")} км</span>
                  </div>
                )}
                {item.category === "transport" && item.vehicleInsuranceExpiry && new Date(item.vehicleInsuranceExpiry) < new Date() && (
                  <Badge variant="destructive" className="text-[10px] w-fit">Страховка прострочена</Badge>
                )}
                {/* Equipment: power & warranty/calibration */}
                {item.category === "equipment" && item.equipmentPowerKw != null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Потужність:</span>
                    <span className="font-mono">{item.equipmentPowerKw} кВт</span>
                  </div>
                )}
                {item.category === "equipment" && item.equipmentWarrantyExpiry && new Date(item.equipmentWarrantyExpiry) < new Date() && (
                  <Badge variant="destructive" className="text-[10px] w-fit">Гарантія закінчилась</Badge>
                )}
                {item.category === "equipment" && item.equipmentNextCalibrationDate && new Date(item.equipmentNextCalibrationDate) < new Date() && (
                  <Badge variant="destructive" className="text-[10px] w-fit">Повірка прострочена</Badge>
                )}
                {/* Intangible: type badge & expiry */}
                {item.category === "intangible" && item.intangibleType && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Тип:</span>
                    <Badge variant="status" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {intangibleAssetTypeLabels[item.intangibleType]}
                    </Badge>
                  </div>
                )}
                {item.category === "intangible" && item.intangibleExpiryDate && new Date(item.intangibleExpiryDate) < new Date() && (
                  <Badge variant="destructive" className="text-[10px] w-fit">Строк дії закінчився</Badge>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Залишкова:</span>
                    <span className="font-mono">{formatCurrency(item.residualValue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={wear} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">{wear}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Landmark className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>Основних засобів не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
};
