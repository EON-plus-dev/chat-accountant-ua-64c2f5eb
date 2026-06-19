import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Calculator, TrendingDown, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "@/hooks/use-toast";
import {
  SALE_TAX_CONDITIONS,
  calculateSaleTax,
} from "@/config/propertyTaxConfig";
import type { PropertyObject } from "@/config/propertyRegistryConfig";
import { DEMO_PROPERTY_OBJECTS } from "@/config/propertyRegistryConfig";

interface PropertySaleTaxCalculatorProps {
  property: PropertyObject;
  allProperties?: PropertyObject[];
}

export const PropertySaleTaxCalculator = ({
  property,
  allProperties = DEMO_PROPERTY_OBJECTS,
}: PropertySaleTaxCalculatorProps) => {
  const defaultPrice = property.estimatedValue ?? 0;
  const [customPrice, setCustomPrice] = useState<string>(defaultPrice.toString());
  const price = Number(customPrice) || 0;

  const isSold = property.status === "sold";
  const result = calculateSaleTax(price, property, allProperties);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          {isSold ? "Податок при продажу" : "Калькулятор податку при продажу"}
        </h3>
        <Badge variant="outline" className="text-xs">ст. 172 ПКУ</Badge>
      </div>

      <div className="rounded-lg border p-3 space-y-3">
        {/* Conditions checklist */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Умови пільгового оподаткування</p>
          {SALE_TAX_CONDITIONS.map((cond) => {
            const met = cond.check(property, allProperties);
            return (
              <div key={cond.id} className="flex items-center gap-2 text-sm">
                {met ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                )}
                <span className={met ? "" : "text-muted-foreground"}>{cond.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">{cond.article}</span>
              </div>
            );
          })}
        </div>

        {/* Price input */}
        {!isSold && (
          <div className="space-y-1.5">
            <Label htmlFor="sale-price" className="text-xs">Ціна продажу, грн</Label>
            <Input
              id="sale-price"
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="h-8 text-sm"
              min={0}
            />
          </div>
        )}

        {/* Result */}
        {price > 0 && (
          <div className="rounded-md bg-muted/50 p-3 space-y-2">
            {result.isExempt && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="h-4 w-4" />
                Звільнено від оподаткування (0%)
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">ПДФО ({result.pitRate}%)</p>
                <p className="font-medium">{formatCurrency(result.pitAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Військовий збір ({result.militaryRate}%)</p>
                <p className="font-medium">{formatCurrency(result.militaryAmount)}</p>
              </div>
            </div>

            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-sm font-semibold">Разом до сплати</span>
              <span className="text-sm font-bold text-primary">{formatCurrency(result.total)}</span>
            </div>

            {result.total > 0 && (
              <Button
                size="sm"
                className="w-full gap-2 mt-1"
                onClick={() => toast({ title: "Демо-режим", description: "Перейдіть до розділу Платежі для створення платіжного доручення" })}
              >
                <CreditCard className="h-4 w-4" />
                Сформувати платіж ПДФО + ВЗ
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
