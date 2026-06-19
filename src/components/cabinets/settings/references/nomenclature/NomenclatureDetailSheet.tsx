/**
 * NOMENCLATURE DETAIL SHEET - Enterprise Detail View
 * 
 * Детальний перегляд номенклатури з табами:
 * - Інформація (базові дані, категорія, теги)
 * - Ціни (прайс-тієри, історія)
 * - Залишки (тільки для товарів)
 * - Логістика (тільки для товарів)
 * - Синхронізація (джерело, історія, конфлікти)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Shield,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import {
  formatNomenclaturePrice,
  stockStatusColors,
} from "@/config/nomenclatureConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

// Tab components
import { NomenclatureInfoTab } from "./NomenclatureInfoTab";
import { NomenclaturePricingTab } from "./NomenclaturePricingTab";
import { NomenclatureStockTab } from "./NomenclatureStockTab";
import { NomenclatureLogisticsTab } from "./NomenclatureLogisticsTab";
import { NomenclatureSyncTab } from "./NomenclatureSyncTab";
import { NomenclatureWarrantyTab } from "./NomenclatureWarrantyTab";
import { EditNomenclatureSheet } from "./EditNomenclatureSheet";

interface NomenclatureDetailSheetProps {
  item: NomenclatureItemV2 | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinet: Cabinet;
  mode?: "sheet" | "page";
  onBack?: () => void;
  onEdit?: (item: NomenclatureItemV2) => void;
  onDelete?: (itemId: string) => void;
  onSync?: (itemId: string) => void;
  onUpdate?: (item: NomenclatureItemV2) => void;
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
  { id: "warranty", label: "Гарантія", icon: Shield, showFor: "product" },
  { id: "stock", label: "Залишки", icon: Package, showFor: "product" },
  { id: "logistics", label: "Логістика", icon: Truck, showFor: "product" },
  { id: "sync", label: "Синхронізація", icon: RefreshCw, showFor: "all" },
];

export const NomenclatureDetailSheet = ({
  item,
  open,
  onOpenChange,
  cabinet,
  mode = "sheet",
  onBack,
  onEdit,
  onDelete,
  onSync,
  onUpdate,
}: NomenclatureDetailSheetProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("info");
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "archive" | "delete";
    open: boolean;
  }>({ type: "delete", open: false });
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  if (!item) return null;

  // Filter tabs based on category
  const activeTabs = nomenclatureTabs.filter(
    (tab) => tab.showFor === "all" || tab.showFor === item.category
  );

  // Handlers
  const handleEdit = () => {
    setEditSheetOpen(true);
  };

  const handleToggleFavorite = () => {
    const updated = { ...item, isFavorite: !item.isFavorite };
    onUpdate?.(updated);
    toast.success(
      item.isFavorite ? "Прибрано з обраного" : "Додано в обране"
    );
  };

  const handleSync = () => {
    onSync?.(item.id);
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
        onDelete?.(item.id);
        toast.success("Позицію видалено");
        onOpenChange(false);
        break;
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const getCategoryIcon = () => {
    return item.category === "service" ? (
      <Briefcase className="h-5 w-5 text-muted-foreground" />
    ) : (
      <Box className="h-5 w-5 text-muted-foreground" />
    );
  };

  const content = (
    <div className={cn("space-y-4", mode === "page" && "p-4 md:p-6")}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {mode === "page" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {getCategoryIcon()}
            <h2 className="text-lg font-bold truncate">{item.name}</h2>
            {item.shortName && (
              <span className="text-sm text-muted-foreground">
                ({item.shortName})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all">
          <p className="text-lg font-bold">
            {formatNomenclaturePrice(
              item.pricing.basePrice,
              item.pricing.currency
            )}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">базова ціна</p>
        </div>
        <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all">
          {item.category === "product" && item.stock ? (
            <>
              <p
                className={cn(
                  "text-lg font-bold",
                  stockStatusColors[item.stock.status]
                )}
              >
                {item.stock.available}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                доступно
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-muted-foreground">∞</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                послуга
              </p>
            </>
          )}
        </div>
        <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all">
          <p className="text-lg font-bold">{item.pricing.vatRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">ПДВ</p>
        </div>
        <div className="rounded-lg border p-2.5 text-center hover:shadow-sm transition-all">
          <p className="text-sm font-medium truncate">
            {item.updatedAt
              ? formatDistanceToNow(new Date(item.updatedAt), { locale: uk })
              : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">оновлено</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={cn(
            "w-full",
            activeTabs.length === 3 && "grid-cols-3",
            activeTabs.length === 5 && "grid-cols-5"
          )}
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

        <TabsContent value="info" className="mt-4">
          <NomenclatureInfoTab item={item} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <NomenclaturePricingTab item={item} />
        </TabsContent>

        {item.category === "product" && (
          <>
            <TabsContent value="warranty" className="mt-4">
              <NomenclatureWarrantyTab item={item} />
            </TabsContent>

            <TabsContent value="stock" className="mt-4">
              <NomenclatureStockTab item={item} />
            </TabsContent>

            <TabsContent value="logistics" className="mt-4">
              <NomenclatureLogisticsTab item={item} />
            </TabsContent>
          </>
        )}

        <TabsContent value="sync" className="mt-4">
          <NomenclatureSyncTab item={item} onSync={handleSync} />
        </TabsContent>
      </Tabs>

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
      {/* Edit Sheet */}
      <EditNomenclatureSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        item={item}
        cabinetId={cabinet.id}
        onSuccess={(updated) => {
          onUpdate?.(updated);
        }}
      />
    </div>
  );

  // Sheet mode
  if (mode === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="responsive-right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{item.name}</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // Page mode
  return content;
};
