/**
 * NOMENCLATURE STOCK TAB
 * 
 * Залишки, резервування, партії (тільки для товарів)
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Lock,
  AlertTriangle,
  Warehouse,
  Calendar,
  Hash,
} from "lucide-react";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import {
  stockStatusLabels,
  stockStatusColors,
  stockStatusBgColors,
  stockStatusIcons,
} from "@/config/nomenclatureConfig";
import { cn } from "@/lib/utils";

interface NomenclatureStockTabProps {
  item: NomenclatureItemV2;
}

export const NomenclatureStockTab = ({ item }: NomenclatureStockTabProps) => {
  const { stock } = item;

  if (!stock) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Дані про залишки відсутні</p>
          <p className="text-xs mt-1">
            Синхронізуйте з 1C або додайте залишки вручну
          </p>
        </CardContent>
      </Card>
    );
  }

  const availablePercent = stock.quantity > 0
    ? Math.round((stock.available / stock.quantity) * 100)
    : 0;

  const reservedPercent = stock.quantity > 0
    ? Math.round((stock.reserved / stock.quantity) * 100)
    : 0;

  const isLowStock = stock.available <= stock.reorderPoint;

  return (
    <div className="space-y-4">
      {/* Stock Overview */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Залишки на складі
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Статус</span>
            <Badge
              variant="outline"
              className={cn(
                "gap-1",
                stockStatusColors[stock.status],
                stockStatusBgColors[stock.status]
              )}
            >
              <span>{stockStatusIcons[stock.status]}</span>
              {stockStatusLabels[stock.status]}
            </Badge>
          </div>

          <Separator />

          {/* Visual Stock Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Розподіл залишків</span>
              <span className="text-lg font-bold">{stock.quantity} шт</span>
            </div>

            <div className="space-y-2">
              {/* Available */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <Package className="h-3 w-3" />
                    Доступно
                  </span>
                  <span className="font-mono">{stock.available} шт ({availablePercent}%)</span>
                </div>
                <Progress value={availablePercent} className="h-2 [&>div]:bg-green-500" />
              </div>

              {/* Reserved */}
              {stock.reserved > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <Lock className="h-3 w-3" />
                      Заброньовано
                    </span>
                    <span className="font-mono">{stock.reserved} шт ({reservedPercent}%)</span>
                  </div>
                  <Progress value={reservedPercent} className="h-2 [&>div]:bg-amber-500" />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reorder Point Warning */}
          {isLowStock && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Критичний рівень залишків
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Доступно {stock.available} шт, точка перезамовлення: {stock.reorderPoint} шт
                </p>
              </div>
            </div>
          )}

          {/* Reorder Point Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Точка перезамовлення</span>
            <span className="font-mono text-sm">{stock.reorderPoint} шт</span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Оновлено</span>
            <span>{new Date(stock.lastUpdated).toLocaleString("uk-UA")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Info */}
      {stock.warehouse && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Склад
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge variant="secondary">{stock.warehouse}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Batch Info */}
      {(stock.batchNumber || stock.expirationDate) && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Партія
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {stock.batchNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Номер партії</span>
                <Badge variant="outline" className="font-mono">
                  {stock.batchNumber}
                </Badge>
              </div>
            )}
            {stock.expirationDate && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Термін придатності
                  </span>
                  <Badge
                    variant={
                      new Date(stock.expirationDate) < new Date()
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {new Date(stock.expirationDate).toLocaleDateString("uk-UA")}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Placeholder for Reservations */}
      <Card className="border-dashed">
        <CardContent className="py-4 text-center text-muted-foreground">
          <Lock className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs">Активні резервування відображатимуться тут</p>
        </CardContent>
      </Card>
    </div>
  );
};
