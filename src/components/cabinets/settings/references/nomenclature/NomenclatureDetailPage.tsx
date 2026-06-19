/**
 * NOMENCLATURE DETAIL PAGE - Enterprise Full-Page View
 * 
 * Повноцінна сторінка детального перегляду номенклатури (патерн ContractorDetailPage):
 * - Контекстний шлях передається у єдиний SettingsBreadcrumbBar
 * - Header з SKU, статусами, Actions dropdown
 * - Quick Stats Grid (6 метрик)
 * - Analytics Card (NomenclaturePerformanceCard)
 * - 6 табів: Інформація, Ціни, Залишки, Логістика, Документи, Синхронізація
 */

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Star,
  Archive,
  Trash2,
  RefreshCw,
  FileText,
  DollarSign,
  Package,
  Truck,
  Briefcase,
  Box,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  FileStack,
  Users,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import {
  formatNomenclaturePrice,
  stockStatusColors,
} from "@/config/nomenclatureConfig";
import { getNomenclatureForCabinet } from "@/config/settingsConfig";
import { isDemoCabinet, getDemoNomenclatureV2ForCabinet } from "@/config/demoCabinetsData";
import { convertToV2 } from "@/config/nomenclatureConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// Tab components
import { NomenclatureInfoTab } from "./NomenclatureInfoTab";
import { NomenclaturePricingTab } from "./NomenclaturePricingTab";
import { NomenclatureStockTab } from "./NomenclatureStockTab";
import { NomenclatureLogisticsTab } from "./NomenclatureLogisticsTab";
import { NomenclatureSyncTab } from "./NomenclatureSyncTab";
import { NomenclatureDocumentsTab } from "./NomenclatureDocumentsTab";
import { NomenclaturePerformanceCard } from "./NomenclaturePerformanceCard";
import { NomenclatureOriginCard } from "./NomenclatureOriginCard";
import { NomenclatureSuppliersTab } from "./NomenclatureSuppliersTab";
import { EditNomenclatureSheet } from "./EditNomenclatureSheet";

interface NomenclatureDetailPageProps {
  itemId: string;
  cabinet: Cabinet;
  mode?: "page" | "sheet";
  onBack?: () => void;
  onClose?: () => void;
  onNavigateToDocument?: (documentId: string) => void;
  onAddDocument?: () => void;
}

interface NomenclatureTab {
  id: string;
  label: string;
  icon: typeof FileText;
  showFor?: "all" | "product" | "service";
}

const nomenclatureTabs: NomenclatureTab[] = [
  { id: "info", label: "Інформація", icon: FileText, showFor: "all" },
  { id: "pricing", label: "Ціни", icon: DollarSign, showFor: "all" },
  { id: "suppliers", label: "Постачальники", icon: Users, showFor: "product" },
  { id: "stock", label: "Залишки", icon: Package, showFor: "product" },
  { id: "logistics", label: "Логістика", icon: Truck, showFor: "product" },
  { id: "documents", label: "Документи", icon: FileStack, showFor: "all" },
  { id: "sync", label: "Синхронізація", icon: RefreshCw, showFor: "all" },
];

export const NomenclatureDetailPage = ({
  itemId,
  cabinet,
  mode = "page",
  onBack,
  onClose,
  onNavigateToDocument,
  onAddDocument,
}: NomenclatureDetailPageProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("info");
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "archive" | "delete";
    open: boolean;
  }>({ type: "delete", open: false });
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Find item by ID
  const item = useMemo((): NomenclatureItemV2 | null => {
    // Try V2 demo data first
    if (isDemoCabinet(cabinet.id)) {
      const v2Items = getDemoNomenclatureV2ForCabinet(cabinet.id);
      const found = v2Items.find(i => i.id === itemId);
      if (found) return found;
    }
    
    // Fallback: convert legacy items
    const legacyItems = getNomenclatureForCabinet(cabinet);
    const legacyItem = legacyItems.find(i => i.id === itemId);
    if (legacyItem) return convertToV2(legacyItem);
    
    return null;
  }, [itemId, cabinet]);

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Позицію не знайдено</p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  // Filter tabs based on category
  const activeTabs = nomenclatureTabs.filter(
    (tab) => tab.showFor === "all" || tab.showFor === item.category
  );

  // Mock metrics
  const mockSalesCount = 85 + Math.abs(item.id.charCodeAt(0) % 50);
  const mockMargin = 18 + Math.abs(item.id.charCodeAt(0) % 15);
  const mockRating = (4.2 + Math.abs(item.id.charCodeAt(1) % 8) / 10).toFixed(1);
  const trend = 5 + Math.abs(item.id.charCodeAt(0) % 12);
  const isPositiveTrend = item.id.charCodeAt(0) % 3 !== 0;

  // Handlers
  const handleEdit = () => {
    setEditSheetOpen(true);
  };

  const handleToggleFavorite = () => {
    toast.success(
      item.isFavorite ? "Прибрано з обраного" : "Додано в обране"
    );
  };

  const handleSync = () => {
    toast.info("Запуск синхронізації...");
  };

  const handleArchive = () => {
    setConfirmDialog({ type: "archive", open: true });
  };

  const handleDelete = () => {
    setConfirmDialog({ type: "delete", open: true });
  };

  const confirmAction = () => {
    switch (confirmDialog.type) {
      case "archive":
        toast.success("Позицію архівовано");
        break;
      case "delete":
        toast.success("Позицію видалено");
        onBack?.();
        break;
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const getCategoryIcon = () => {
    return item.category === "service" ? (
      <Briefcase className="h-6 w-6 text-muted-foreground" />
    ) : (
      <Box className="h-6 w-6 text-muted-foreground" />
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="min-h-full px-4 md:px-6 py-4 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {getCategoryIcon()}
              <h1 className={cn("text-xl font-bold truncate", mode !== "sheet" && "hidden sm:block")}>{item.name}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                {item.sku}
              </Badge>
              {item.isActive ? (
                <Badge
                  variant="outline"
                  className="gap-1 text-green-600 border-green-200 text-xs"
                >
                  <CheckCircle className="h-3 w-3" />
                  Активна
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Неактивна
                </Badge>
              )}
              {item.isFavorite && (
                <Badge
                  variant="outline"
                  className="gap-1 text-amber-600 border-amber-200 text-xs"
                >
                  <Star className="h-3 w-3 fill-amber-500" />
                  Обране
                </Badge>
              )}
              {item.sync.syncStatus === "synced" && (
                <Badge
                  variant="outline"
                  className="gap-1 text-blue-600 border-blue-200 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  Синхронізовано
                </Badge>
              )}
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Редагувати
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleFavorite}>
                <Star className="h-4 w-4 mr-2" />
                {item.isFavorite ? "Прибрати з обраного" : "Додати в обране"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSync}
                disabled={item.sync.source === "manual"}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Синхронізувати
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleArchive}
                className="text-amber-600 focus:text-amber-600"
              >
                <Archive className="h-4 w-4 mr-2" />
                Архівувати
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Видалити
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Stats Grid - 6 metrics */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {/* Price */}
          <div className="rounded-lg border p-3 text-center hover:shadow-sm transition-all">
            <p className="text-lg font-bold">
              {formatNomenclaturePrice(item.pricing.basePrice, item.pricing.currency)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              з ПДВ {formatNomenclaturePrice(item.pricing.priceWithVat, item.pricing.currency)}
            </p>
          </div>
          
          {/* Stock */}
          <div className="rounded-lg border p-3 text-center hover:shadow-sm transition-all">
            {item.category === "product" && item.stock ? (
              <>
                <p className={cn("text-lg font-bold", stockStatusColors[item.stock.status])}>
                  {item.stock.available}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">доступно</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-muted-foreground">∞</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">послуга</p>
              </>
            )}
          </div>
          
          {/* Reserved */}
          <div className="rounded-lg border p-3 text-center hover:shadow-sm transition-all">
            <p className="text-lg font-bold">
              {item.category === "product" && item.stock ? item.stock.reserved : 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">резерв</p>
          </div>
          
          {/* Sales */}
          <div className="rounded-lg border p-3 text-center hover:shadow-sm transition-all">
            <p className="text-lg font-bold">{mockSalesCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">продажів/міс</p>
          </div>
          
          {/* Margin */}
          <div className="rounded-lg border p-3 text-center hover:shadow-sm transition-all">
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-bold">{mockMargin}%</p>
              <span className={cn(
                "flex items-center text-xs",
                isPositiveTrend ? "text-emerald-600" : "text-red-600"
              )}>
                {isPositiveTrend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositiveTrend ? "+" : "-"}{trend}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">маржа</p>
          </div>
          
          {/* Rating */}
          <div className="rounded-lg border p-3 text-center hover:shadow-sm transition-all">
            <p className="text-lg font-bold">{mockRating}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">⭐ рейтинг</p>
          </div>
        </div>

        {/* Analytics Card */}
        <NomenclaturePerformanceCard item={item} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="w-full"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${activeTabs.length}, 1fr)`,
            }}
          >
            {activeTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                <tab.icon className="h-4 w-4" />
                <span className={cn(isMobile && "sr-only")}>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            <NomenclatureOriginCard item={item} />
            <NomenclatureInfoTab item={item} />
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            <NomenclaturePricingTab item={item} />
          </TabsContent>

          {item.category === "product" && (
            <>
              <TabsContent value="suppliers" className="mt-4">
                <NomenclatureSuppliersTab item={item} />
              </TabsContent>

              <TabsContent value="stock" className="mt-4">
                <NomenclatureStockTab item={item} />
              </TabsContent>

              <TabsContent value="logistics" className="mt-4">
                <NomenclatureLogisticsTab item={item} />
              </TabsContent>
            </>
          )}

          <TabsContent value="documents" className="mt-4">
            <NomenclatureDocumentsTab 
              item={item} 
              onNavigateToDocument={onNavigateToDocument}
              onAddDocument={onAddDocument}
            />
          </TabsContent>

          <TabsContent value="sync" className="mt-4">
            <NomenclatureSyncTab item={item} onSync={handleSync} />
          </TabsContent>
        </Tabs>

        {/* Edit Sheet */}
        <EditNomenclatureSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          item={item}
          cabinetId={cabinet.id}
          onSuccess={(updated) => {
            toast.success("Позицію оновлено", { description: updated.name });
          }}
        />

        {/* Confirmation Dialog */}
        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.type === "archive"
                  ? "Архівувати позицію?"
                  : "Видалити позицію?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.type === "archive"
                  ? `Позицію "${item.name}" буде переміщено в архів. Ви зможете відновити її пізніше.`
                  : `Позицію "${item.name}" буде видалено назавжди. Цю дію неможливо скасувати.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAction}
                className={
                  confirmDialog.type === "delete"
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }
              >
                {confirmDialog.type === "archive" ? "Архівувати" : "Видалити"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ScrollArea>
  );
};
