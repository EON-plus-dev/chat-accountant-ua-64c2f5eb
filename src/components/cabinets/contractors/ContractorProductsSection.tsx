/**
 * CONTRACTOR PRODUCTS SECTION
 * 
 * Таблиця товарів/послуг від контрагента з фільтрами, пошуком, MOQ, lead time
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Package, 
  Search, 
  ShoppingCart, 
  Star, 
  Clock,
  Briefcase,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import {
  type ContractorProduct,
  type ContractorStockStatus,
  contractorStockStatusIcons,
  contractorStockStatusLabels,
  contractorStockStatusColors,
} from "@/config/contractorInteractionConfig";

interface ContractorProductsSectionProps {
  products: ContractorProduct[];
  contractorName: string;
  relationshipType?: "buyer" | "supplier" | "both";
  onCreateOrder?: () => void;
  onViewProduct?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  cartItemsCount?: number;
}

type CategoryFilter = "all" | "product" | "service";
type StockFilter = "all" | ContractorStockStatus;

export const ContractorProductsSection = ({
  products,
  contractorName,
  relationshipType = "supplier",
  onCreateOrder,
  onViewProduct,
  onAddToCart,
  cartItemsCount = 0,
}: ContractorProductsSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nomenclatureName.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.contractorSku?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (stockFilter !== "all") {
      result = result.filter((p) => p.stockStatus === stockFilter);
    }

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    products: products.filter((p) => p.category === "product").length,
    services: products.filter((p) => p.category === "service").length,
    preferred: products.filter((p) => p.isPreferred).length,
  }), [products]);

  const getSectionTitle = () => {
    if (relationshipType === "buyer") {
      return "Товари та послуги для покупця";
    }
    return "Товари та послуги від постачальника";
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            {getSectionTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Товари та послуги не додано</p>
          <p className="text-xs mt-1">
            Додайте позиції номенклатури для цього контрагента
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            {getSectionTitle()}
            <Badge variant="secondary" className="ml-1">
              {stats.total}
            </Badge>
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5 relative" onClick={onCreateOrder}>
            <ShoppingCart className="h-4 w-4" />
            Кошик
            {cartItemsCount > 0 && (
              <Badge variant="default" className="absolute -top-2 -right-2 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center">
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-0 w-full sm:w-auto sm:min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук за назвою або артикулом..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
              <SelectTrigger className="flex-1 sm:flex-none sm:w-[130px] h-9">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі ({stats.total})</SelectItem>
                <SelectItem value="product">
                  <span className="flex items-center gap-2">
                    <Box className="h-3.5 w-3.5" />
                    Товари ({stats.products})
                  </span>
                </SelectItem>
                <SelectItem value="service">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" />
                    Послуги ({stats.services})
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
              <SelectTrigger className="flex-1 sm:flex-none sm:w-[140px] h-9">
                <SelectValue placeholder="Наявність" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі статуси</SelectItem>
                <SelectItem value="available">🟢 В наявності</SelectItem>
                <SelectItem value="limited">🟡 Обмежено</SelectItem>
                <SelectItem value="out-of-stock">🔴 Немає</SelectItem>
                <SelectItem value="on-order">📦 Замовлено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Артикул</TableHead>
                <TableHead>Назва</TableHead>
                <TableHead className="w-[100px] text-right">Ціна</TableHead>
                <TableHead className="w-[90px] text-center">Наявність</TableHead>
                <TableHead className="w-[80px] text-center">
                  <Tooltip>
                    <TooltipTrigger asChild><span>Мін.</span></TooltipTrigger>
                    <TooltipContent>Мінімальна кількість для замовлення</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-[80px] text-center">
                  <Tooltip>
                    <TooltipTrigger asChild><span>Термін</span></TooltipTrigger>
                    <TooltipContent>Термін поставки у днях</TooltipContent>
                  </Tooltip>
                </TableHead>
                {onAddToCart && <TableHead className="w-[80px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow 
                  key={product.id}
                  className={cn("hover:bg-muted/50", onViewProduct && "cursor-pointer")}
                  onClick={() => onViewProduct?.(product.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {product.isPreferred && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>Основний постачальник</TooltipContent>
                        </Tooltip>
                      )}
                      <Badge variant="outline" className="font-mono text-xs">
                        {product.sku}
                      </Badge>
                    </div>
                    {product.contractorSku && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {product.contractorSku}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.category === "service" ? (
                        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium truncate">{product.nomenclatureName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">
                      {formatNomenclaturePrice(product.price, product.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">/{product.unit}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", contractorStockStatusColors[product.stockStatus])}
                        >
                          {contractorStockStatusIcons[product.stockStatus]}
                          {product.stockQuantity !== undefined && ` ${product.stockQuantity}`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {contractorStockStatusLabels[product.stockStatus]}
                        {product.stockQuantity !== undefined && ` (${product.stockQuantity} ${product.unit})`}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-sm">
                      {product.minOrderQuantity} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {product.leadTimeDays} д
                    </span>
                  </TableCell>
                  {onAddToCart && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-2">
          {filteredProducts.map((product) => (
            <div key={product.id} className={cn("rounded-lg border p-3 hover:bg-muted/50 transition-colors", onViewProduct && "cursor-pointer")} onClick={() => onViewProduct?.(product.id)}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {product.isPreferred && (
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                  )}
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.sku}
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs shrink-0", contractorStockStatusColors[product.stockStatus])}
                >
                  {contractorStockStatusIcons[product.stockStatus]}
                  {product.stockQuantity !== undefined && ` ${product.stockQuantity}`}
                </Badge>
              </div>
              <p className="font-medium text-sm truncate">{product.nomenclatureName}</p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">
                    {formatNomenclaturePrice(product.price, product.currency)}/{product.unit}
                  </span>
                  <span>•</span>
                  <span>Мін: {product.minOrderQuantity} {product.unit}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {product.leadTimeDays} д
                  </span>
                </div>
                {onAddToCart && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-xs shrink-0"
                    onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Позицій не знайдено</p>
          </div>
        )}

        {/* Last order info */}
        {products.some(p => p.lastOrderDate) && (
          <p className="text-xs text-muted-foreground">
            💡 Останнє замовлення:{" "}
            {products.find(p => p.lastOrderDate)?.lastOrderDate &&
              new Date(products.find(p => p.lastOrderDate)!.lastOrderDate!).toLocaleDateString("uk-UA")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
