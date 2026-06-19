/**
 * NomenclatureFormPricingSection - Unit, prices, VAT, margin calculation
 */

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Plus, Trash2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { NomenclatureFormData } from "./NomenclatureForm";
import { getUnitOptionsGrouped } from "@/config/unitsConfig";
import { getCurrencyOptions, getCurrencySymbol } from "@/config/currencyConfig";
import type { VatRate, PriceTier } from "@/config/nomenclatureConfig";

interface NomenclatureFormPricingSectionProps {
  form: UseFormReturn<NomenclatureFormData>;
  category: "product" | "service";
  marginAmount: number | null;
  marginPercent: number | null;
}

const VAT_RATES: { value: VatRate; label: string }[] = [
  { value: 0, label: "0% (без ПДВ)" },
  { value: 7, label: "7%" },
  { value: 20, label: "20%" },
];

export const NomenclatureFormPricingSection = ({
  form,
  category,
  marginAmount,
  marginPercent,
}: NomenclatureFormPricingSectionProps) => {
  const [showPriceTiers, setShowPriceTiers] = useState(false);
  const priceTiers = form.watch("priceTiers") || [];
  const currency = form.watch("currency");
  const unitGroups = getUnitOptionsGrouped();
  const currencyOptions = getCurrencyOptions();

  const getMarginIndicator = () => {
    if (marginPercent === null) return null;
    
    if (marginPercent < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30",
        message: "⚠️ Від'ємна маржа! Ціна продажу нижча за закупівлю",
        type: "error",
      };
    }
    if (marginPercent < 10) {
      return {
        icon: AlertTriangle,
        color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30",
        message: `⚠️ Маржа ${marginPercent.toFixed(1)}% — низька прибутковість`,
        type: "warning",
      };
    }
    if (marginPercent < 20) {
      return {
        icon: Info,
        color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30",
        message: `ℹ️ Маржа ${marginPercent.toFixed(1)}% — помірна прибутковість`,
        type: "info",
      };
    }
    return {
      icon: CheckCircle,
      color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30",
      message: `✅ Маржа ${marginPercent.toFixed(1)}% — прийнятна`,
      type: "success",
    };
  };

  const addPriceTier = () => {
    const currentTiers = form.getValues("priceTiers") || [];
    const lastMinQty = currentTiers.length > 0 
      ? currentTiers[currentTiers.length - 1].minQuantity 
      : 1;
    
    form.setValue("priceTiers", [
      ...currentTiers,
      { minQuantity: lastMinQty + 10, price: form.getValues("basePrice") * 0.95, description: "" },
    ]);
  };

  const removePriceTier = (index: number) => {
    const currentTiers = form.getValues("priceTiers") || [];
    form.setValue("priceTiers", currentTiers.filter((_, i) => i !== index));
  };

  const updatePriceTier = (index: number, field: keyof PriceTier, value: number | string) => {
    const currentTiers = form.getValues("priceTiers") || [];
    const updated = [...currentTiers];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue("priceTiers", updated);
  };

  const marginIndicator = getMarginIndicator();

  return (
    <div className="p-4 rounded-lg border space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">💰</span>
        <h3 className="font-semibold">Ціноутворення</h3>
        <span className="text-xs text-muted-foreground ml-auto">обов'язково</span>
      </div>

      {/* Unit of Measure */}
      <FormField
        control={form.control}
        name="unitCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Одиниця виміру *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть одиницю" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {unitGroups.map((group) => (
                  <SelectGroup key={group.category}>
                    <SelectLabel>{group.categoryLabel}</SelectLabel>
                    {group.units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Two-column layout for Purchase/Sale prices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Purchase Price - only for products */}
        {category === "product" && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-dashed">
            <div className="text-sm font-medium text-muted-foreground">Закупівля</div>
            
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ціна закупівлі</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00" 
                        className="font-mono"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="purchaseCurrency"
                      render={({ field: currencyField }) => (
                        <Select onValueChange={currencyField.onChange} value={currencyField.value || "UAH"}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyOptions.map((c) => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseVatRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ПДВ закупівлі</FormLabel>
                  <Select 
                    onValueChange={(v) => field.onChange(parseInt(v))} 
                    value={field.value?.toString() || "20"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VAT_RATES.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value.toString()}>
                          {rate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Sale Price */}
        <div className={cn(
          "space-y-3 p-3 rounded-lg bg-primary/5 border",
          category === "service" && "sm:col-span-2"
        )}>
          <div className="text-sm font-medium">Продаж</div>
          
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ціна продажу *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00" 
                      className="font-mono"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field: currencyField }) => (
                      <Select onValueChange={currencyField.onChange} value={currencyField.value}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vatRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ставка ПДВ *</FormLabel>
                <Select 
                  onValueChange={(v) => field.onChange(parseInt(v))} 
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VAT_RATES.map((rate) => (
                      <SelectItem key={rate.value} value={rate.value.toString()}>
                        {rate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Margin Indicator */}
      {category === "product" && marginIndicator && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg text-sm",
          marginIndicator.color
        )}>
          <marginIndicator.icon className="h-4 w-4 flex-shrink-0" />
          <span>
            Маржа: {marginAmount?.toFixed(0)} {getCurrencySymbol(currency)} ({marginPercent?.toFixed(1)}%)
          </span>
        </div>
      )}

      {/* Price Tiers */}
      <div className="pt-2 border-t">
        {!showPriceTiers && priceTiers.length === 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowPriceTiers(true);
              addPriceTier();
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Додати оптові ціни
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Оптові ціни</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addPriceTier}
              >
                <Plus className="h-4 w-4 mr-1" />
                Додати рівень
              </Button>
            </div>
            
            {priceTiers.map((tier, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Від"
                    value={tier.minQuantity}
                    onChange={(e) => updatePriceTier(index, "minQuantity", parseInt(e.target.value) || 2)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ціна"
                    value={tier.price}
                    onChange={(e) => updatePriceTier(index, "price", parseFloat(e.target.value) || 0)}
                    className="text-sm font-mono"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePriceTier(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
