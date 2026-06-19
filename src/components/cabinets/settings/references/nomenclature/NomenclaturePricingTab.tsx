/**
 * NOMENCLATURE PRICING TAB
 * 
 * Цінова інформація: закупівля → опт → продаж + маржа
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Percent, Calendar, ShoppingCart, Tag, ArrowRight } from "lucide-react";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import { cn } from "@/lib/utils";
import { NomenclaturePriceHistory } from "./NomenclaturePriceHistory";

interface NomenclaturePricingTabProps {
  item: NomenclatureItemV2;
}

export const NomenclaturePricingTab = ({ item }: NomenclaturePricingTabProps) => {
  const { pricing } = item;
  
  // Calculate margin if purchasePrice exists
  const calculatedMargin = pricing.purchasePrice && pricing.purchasePrice > 0
    ? {
        amount: pricing.basePrice - pricing.purchasePrice,
        percent: ((pricing.basePrice - pricing.purchasePrice) / pricing.purchasePrice) * 100,
      }
    : null;
  
  const marginAmount = pricing.marginAmount ?? calculatedMargin?.amount;
  const marginPercent = pricing.marginPercent ?? calculatedMargin?.percent;
  const hasPurchaseData = pricing.purchasePrice !== undefined && pricing.purchasePrice > 0;
  const hasTiers = pricing.priceTiers && pricing.priceTiers.length > 0;

  return (
    <div className="space-y-4">
      {/* Price Levels Visual Card */}
      {(hasPurchaseData || hasTiers) && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Цінові рівні
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
              {/* Purchase Price */}
              {hasPurchaseData && (
                <>
                  <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center min-w-[100px]">
                    <ShoppingCart className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {formatNomenclaturePrice(pricing.purchasePrice!, pricing.purchaseCurrency || pricing.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Закупівля</p>
                  </div>
                  <div className="flex items-center px-1">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </>
              )}
              
              {/* Wholesale Tiers */}
              {hasTiers && pricing.priceTiers!.map((tier, index) => {
                const discount = Math.round((1 - tier.price / pricing.basePrice) * 100);
                return (
                  <div 
                    key={index} 
                    className="flex-shrink-0 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center min-w-[100px]"
                  >
                    <Tag className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                      {formatNomenclaturePrice(tier.price, pricing.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      від {tier.minQuantity} шт
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="mt-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    >
                      -{discount}%
                    </Badge>
                  </div>
                );
              })}
              
              {(hasPurchaseData || hasTiers) && (
                <div className="flex items-center px-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              
              {/* Sale Price */}
              <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10 text-center min-w-[100px]">
                <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-primary">
                  {formatNomenclaturePrice(pricing.basePrice, pricing.currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Продаж</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  Базова
                </Badge>
              </div>
            </div>
            
            {/* Margin Summary */}
            {marginAmount !== undefined && marginPercent !== undefined && (
              <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Маржа</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-green-600">
                    +{formatNomenclaturePrice(marginAmount, pricing.currency)}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="text-green-600 bg-green-100 dark:bg-green-900/30"
                  >
                    +{marginPercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Price Card */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Ціна продажу
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">
                {formatNomenclaturePrice(pricing.basePrice, pricing.currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">без ПДВ</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">
                {formatNomenclaturePrice(pricing.priceWithVat, pricing.currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">з ПДВ ({pricing.vatRate}%)</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5" />
                Ставка ПДВ
              </span>
              <Badge variant="outline">{pricing.vatRate}%</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Валюта</span>
              <Badge variant="secondary">{pricing.currency}</Badge>
            </div>

            {pricing.lastPriceChange && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Остання зміна ціни
                </span>
                <span className="text-sm">
                  {new Date(pricing.lastPriceChange).toLocaleDateString("uk-UA")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Price Details */}
      {hasPurchaseData && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Закупівельна ціна
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ціна закупівлі</span>
              <span className="font-mono font-medium">
                {formatNomenclaturePrice(pricing.purchasePrice!, pricing.purchaseCurrency || pricing.currency)}
              </span>
            </div>
            
            {pricing.purchaseVatRate !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ПДВ при закупівлі</span>
                <Badge variant="outline">{pricing.purchaseVatRate}%</Badge>
              </div>
            )}
            
            {marginAmount !== undefined && marginPercent !== undefined && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Маржа</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {formatNomenclaturePrice(marginAmount, pricing.currency)}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        marginPercent > 0 && "text-green-600 bg-green-100 dark:bg-green-900/30"
                      )}
                    >
                      {marginPercent > 0 ? "+" : ""}{marginPercent.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price Tiers Table */}
      {hasTiers && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Оптові ціни
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="h-9">Мін. к-сть</TableHead>
                    <TableHead className="h-9 text-right">Ціна</TableHead>
                    <TableHead className="h-9 text-right">Знижка</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricing.priceTiers!.map((tier, index) => {
                    const discount = Math.round(
                      (1 - tier.price / pricing.basePrice) * 100
                    );
                    return (
                      <TableRow key={index}>
                        <TableCell className="py-2">
                          <div>
                            <span className="font-mono">від {tier.minQuantity} шт</span>
                            {tier.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {tier.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-right font-mono">
                          {formatNomenclaturePrice(tier.price, pricing.currency)}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              discount > 0 && "text-green-600 bg-green-100 dark:bg-green-900/30"
                            )}
                          >
                            -{discount}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Margins & Prices Card */}
      {(pricing.minMargin !== undefined || 
        pricing.minSalePrice !== undefined || 
        pricing.recommendedRetailPrice !== undefined ||
        pricing.recommendedPrice !== undefined) && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Обмеження та рекомендації
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {pricing.minMargin !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Мінімальна маржа</span>
                <Badge variant="outline">{pricing.minMargin}%</Badge>
              </div>
            )}
            {pricing.minSalePrice !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Мін. ціна продажу</span>
                <span className="font-mono font-medium">
                  {formatNomenclaturePrice(pricing.minSalePrice, pricing.currency)}
                </span>
              </div>
            )}
            {(pricing.recommendedRetailPrice !== undefined || pricing.recommendedPrice !== undefined) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">РРЦ</span>
                <span className="font-mono font-medium">
                  {formatNomenclaturePrice(
                    pricing.recommendedRetailPrice ?? pricing.recommendedPrice!, 
                    pricing.currency
                  )}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state for no tiers and no purchase price */}
      {!hasTiers && !hasPurchaseData && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Додаткові цінові дані не налаштовані</p>
            <p className="text-xs mt-1">
              Додайте закупівельну ціну та оптові рівні для повного обліку
            </p>
          </CardContent>
        </Card>
      )}

      {/* Price History */}
      <NomenclaturePriceHistory 
        nomenclatureId={item.id} 
        currency={pricing.currency}
      />
    </div>
  );
};
