/**
 * STOCK INDICATOR COMPONENT
 * 
 * Індикатор наявності товару з візуальними станами
 */

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Package, PackageX, PackageCheck, Clock } from "lucide-react";
import type { StockInfo, StockStatus } from "@/config/nomenclatureConfig";
import {
  stockStatusLabels,
  stockStatusColors,
  stockStatusBgColors,
  stockStatusIcons,
} from "@/config/nomenclatureConfig";
import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  stock?: StockInfo;
  category: "service" | "product";
  compact?: boolean;
}

export const StockIndicator = ({ stock, category, compact = false }: StockIndicatorProps) => {
  // Services don't have stock
  if (category === "service") {
    return (
      <span className="text-muted-foreground text-sm">—</span>
    );
  }

  if (!stock) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Немає даних
      </Badge>
    );
  }

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case "in-stock":
        return <PackageCheck className="h-3.5 w-3.5" />;
      case "limited":
        return <Package className="h-3.5 w-3.5" />;
      case "out-of-stock":
        return <PackageX className="h-3.5 w-3.5" />;
      case "on-order":
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("text-lg cursor-default", stockStatusColors[stock.status])}>
            {stockStatusIcons[stock.status]}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{stockStatusLabels[stock.status]}</p>
            <p className="text-xs">Всього: {stock.quantity}</p>
            <p className="text-xs">Доступно: {stock.available}</p>
            {stock.reserved > 0 && (
              <p className="text-xs text-amber-500">Заброньовано: {stock.reserved}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "gap-1 cursor-default",
            stockStatusColors[stock.status],
            stockStatusBgColors[stock.status]
          )}
        >
          {getStatusIcon(stock.status)}
          <span className="font-mono">{stock.available}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">{stockStatusLabels[stock.status]}</p>
          <p className="text-xs">Всього на складі: {stock.quantity}</p>
          <p className="text-xs">Доступно для продажу: {stock.available}</p>
          {stock.reserved > 0 && (
            <p className="text-xs text-amber-500">🔒 Заброньовано: {stock.reserved}</p>
          )}
          {stock.reorderPoint > 0 && stock.available <= stock.reorderPoint && (
            <p className="text-xs text-red-500">⚠️ Нижче точки перезамовлення ({stock.reorderPoint})</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
