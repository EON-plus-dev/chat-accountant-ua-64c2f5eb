/**
 * CONTRACTOR PRODUCT DETAIL SHEET
 * 
 * Панель перегляду деталей товару/послуги контрагента
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Box, Briefcase, ShoppingCart, Star, Clock, Package, Hash, ArrowRight } from "lucide-react";
import type {
  ContractorProduct,
} from "@/config/contractorInteractionConfig";
import {
  contractorStockStatusLabels,
  contractorStockStatusColors,
  contractorStockStatusIcons,
} from "@/config/contractorInteractionConfig";
import { formatCurrency } from "@/config/currencyConfig";

interface ContractorProductDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ContractorProduct | null;
  onCreateOrder?: () => void;
}

export const ContractorProductDetailSheet = ({
  open,
  onOpenChange,
  product,
  onCreateOrder,
}: ContractorProductDetailSheetProps) => {
  if (!product) return null;

  const CategoryIcon = product.category === "product" ? Box : Briefcase;
  const stockProgress = product.stockQuantity != null && product.minOrderQuantity > 0
    ? Math.min((product.stockQuantity / product.minOrderQuantity) * 100, 100)
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2.5">
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base leading-tight">
                {product.nomenclatureName}
              </SheetTitle>
              <SheetDescription className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs">{product.sku}</span>
                {product.contractorSku && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-xs">Арт. {product.contractorSku}</span>
                  </>
                )}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge
              variant="status"
              className={contractorStockStatusColors[product.stockStatus]}
            >
              {contractorStockStatusIcons[product.stockStatus]} {contractorStockStatusLabels[product.stockStatus]}
              {product.stockQuantity != null && ` (${product.stockQuantity} ${product.unit})`}
            </Badge>
            {product.isPreferred && (
              <Badge variant="warning" size="sm">
                <Star className="h-3 w-3 mr-0.5" /> Основний
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Separator />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Price & Terms */}
          <section className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Ціна та умови</h4>
            <div className="text-2xl font-semibold tracking-tight">
              {formatCurrency(product.price, product.currency)}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ {product.unit}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem icon={Package} label="Мін. замовлення" value={`${product.minOrderQuantity} ${product.unit}`} />
              <InfoItem icon={Clock} label="Термін поставки" value={`${product.leadTimeDays} дн.`} />
            </div>
          </section>

          {/* Stock (products only) */}
          {product.category === "product" && product.stockQuantity != null && (
            <>
              <Separator />
              <section className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Наявність на складі</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{product.stockQuantity} {product.unit}</span>
                    <span className="text-muted-foreground">MOQ: {product.minOrderQuantity}</span>
                  </div>
                  <Progress value={stockProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {stockProgress >= 100
                      ? "Достатньо для мінімального замовлення"
                      : `Потрібно ще ${product.minOrderQuantity - (product.stockQuantity ?? 0)} ${product.unit} до MOQ`}
                  </p>
                </div>
              </section>
            </>
          )}

          {/* Order history */}
          {(product.lastOrderDate || product.lastOrderQuantity) && (
            <>
              <Separator />
              <section className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Історія замовлень</h4>
                <div className="text-sm space-y-1">
                  {product.lastOrderDate && (
                    <p>Останнє замовлення: <span className="font-medium">{product.lastOrderDate}</span></p>
                  )}
                  {product.lastOrderQuantity && (
                    <p>Кількість: <span className="font-medium">{product.lastOrderQuantity} {product.unit}</span></p>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Nomenclature link */}
          <Separator />
          <section className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Зв'язок з номенклатурою</h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem icon={Hash} label="ID номенклатури" value={product.nomenclatureId} />
              <InfoItem icon={Hash} label="SKU" value={product.sku} />
            </div>
            {product.contractorSku && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <span className="font-mono">{product.contractorSku}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-mono">{product.sku}</span>
              </div>
            )}
          </section>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 border-t bg-background p-4">
          <Button className="w-full" onClick={onCreateOrder}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Замовити
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

/* Small helper for key-value info rows */
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-2">
    <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  </div>
);
