import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Pencil, Ban, ShoppingCart } from "lucide-react";
import { EditFixedAssetSheet } from "./EditFixedAssetSheet";
import { WriteOffDialog } from "./WriteOffDialog";
import { SaleDialog } from "./SaleDialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFixedAssetsForCabinet, type FixedAsset } from "@/config/fixedAssetsConfig";
import type { Cabinet } from "@/types/cabinet";
import { FixedAssetInfoTab } from "./FixedAssetInfoTab";
import { FixedAssetDepreciationTab } from "./FixedAssetDepreciationTab";
import { FixedAssetDocumentsTab } from "./FixedAssetDocumentsTab";
import { FixedAssetHistoryTab } from "./FixedAssetHistoryTab";

interface FixedAssetDetailPageProps {
  assetId: string;
  cabinet: Cabinet;
  onBack: () => void;
  localAssets?: FixedAsset[];
  onAssetUpdate?: (updated: FixedAsset) => void;
}

export const FixedAssetDetailPage = ({
  assetId,
  cabinet,
  onBack,
  localAssets = [],
  onAssetUpdate,
}: FixedAssetDetailPageProps) => {
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [localAsset, setLocalAsset] = useState<FixedAsset | null>(null);

  const asset = useMemo(() => {
    if (localAsset) return localAsset;
    const assets = [...getFixedAssetsForCabinet(cabinet.id), ...localAssets];
    return assets.find(a => a.id === assetId);
  }, [assetId, cabinet.id, localAssets]);

  if (!asset) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Landmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Основний засіб не знайдено</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="hidden sm:block text-xl font-semibold">{asset.name}</h2>
          <p className="text-sm text-muted-foreground font-mono">{asset.inventoryNumber}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(asset.status === "active" || asset.status === "under-repair") && (
            <>
              <Button variant="destructive" size="sm" onClick={() => setWriteOffOpen(true)} className="gap-1.5">
                <Ban className="h-4 w-4" />
                Списати
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSaleOpen(true)} className="gap-1.5">
                <ShoppingCart className="h-4 w-4" />
                Продати
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditSheetOpen(true)} className="gap-1.5">
            <Pencil className="h-4 w-4" />
            Редагувати
          </Button>
        </div>
      </div>

      <EditFixedAssetSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        asset={asset}
        onSuccess={(updated) => {
          setLocalAsset(updated);
          onAssetUpdate?.(updated);
        }}
      />

      <WriteOffDialog
        open={writeOffOpen}
        onOpenChange={setWriteOffOpen}
        asset={asset}
        onConfirm={(data) => {
          const updated: FixedAsset = {
            ...asset,
            status: "written-off",
            residualValue: 0,
            salvageValue: 0,
            writeOffDate: data.writeOffDate,
            writeOffReason: data.writeOffReason,
            writeOffActNumber: data.writeOffActNumber,
            writeOffCommission: data.writeOffCommission,
          };
          setLocalAsset(updated);
          onAssetUpdate?.(updated);
          toast.success("Основний засіб списано");
        }}
      />
      <SaleDialog
        open={saleOpen}
        onOpenChange={setSaleOpen}
        asset={asset}
        onConfirm={(data) => {
          const updated: FixedAsset = {
            ...asset,
            status: "sold",
            salePrice: data.salePrice,
            saleDate: data.saleDate,
            saleBuyer: data.saleBuyer,
            saleContractNumber: data.saleContractNumber,
          };
          setLocalAsset(updated);
          onAssetUpdate?.(updated);
          toast.success("Основний засіб продано");
        }}
      />

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Інформація</TabsTrigger>
          <TabsTrigger value="depreciation">Амортизація</TabsTrigger>
          <TabsTrigger value="documents">Документи</TabsTrigger>
          <TabsTrigger value="history">Історія</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="mt-4">
          <FixedAssetInfoTab asset={asset} />
        </TabsContent>
        <TabsContent value="depreciation" className="mt-4">
          <FixedAssetDepreciationTab asset={asset} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <FixedAssetDocumentsTab asset={asset} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <FixedAssetHistoryTab asset={asset} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
