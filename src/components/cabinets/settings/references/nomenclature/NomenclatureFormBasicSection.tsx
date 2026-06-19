/**
 * NomenclatureFormBasicSection - Type selection, name, SKU, barcode, etc.
 */

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RefreshCw, Package, Briefcase, Barcode, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { NomenclatureFormData } from "./NomenclatureForm";

interface NomenclatureFormBasicSectionProps {
  form: UseFormReturn<NomenclatureFormData>;
  category: "product" | "service";
  onCategoryChange: (category: "product" | "service") => void;
  onRegenerateSku: () => void;
}

export const NomenclatureFormBasicSection = ({
  form,
  category,
  onCategoryChange,
  onRegenerateSku,
}: NomenclatureFormBasicSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Type Selection */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <Label className="text-sm font-medium mb-3 block">📦 Тип позиції</Label>
        <RadioGroup
          value={category}
          onValueChange={(value) => onCategoryChange(value as "product" | "service")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="product" id="product" />
            <Label 
              htmlFor="product" 
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                category === "product" && "text-primary font-medium"
              )}
            >
              <Package className="h-4 w-4" />
              Товар
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="service" id="service" />
            <Label 
              htmlFor="service"
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                category === "service" && "text-primary font-medium"
              )}
            >
              <Briefcase className="h-4 w-4" />
              Послуга
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Basic Info */}
      <div className="p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📋</span>
          <h3 className="font-semibold">Основна інформація</h3>
          <span className="text-xs text-muted-foreground ml-auto">обов'язково</span>
        </div>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Назва *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Введіть назву товару або послуги" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Short Name */}
        <FormField
          control={form.control}
          name="shortName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Коротка назва</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Для друку в документах (до 50 символів)" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>Опціонально. Використовується в друкованих формах</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SKU with regenerate button */}
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Артикул) *</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="PROD-2025-XXX" 
                    className="font-mono"
                    {...field} 
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onRegenerateSku}
                  title="Згенерувати новий SKU"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Barcode (EAN-13) */}
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                Штрих-код (EAN-13)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="4820000000000" 
                  className="font-mono"
                  maxLength={13}
                  {...field} 
                />
              </FormControl>
              <FormDescription>13 цифр для товарів</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* UKT ZED Code */}
        {category === "product" && (
          <FormField
            control={form.control}
            name="uktzedCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Код УКТ ЗЕД
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="0000000000" 
                    className="font-mono"
                    maxLength={10}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>10 цифр для митного оформлення</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Vendor Code */}
        <FormField
          control={form.control}
          name="vendorCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Артикул постачальника</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Код від постачальника" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Опис</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Детальний опис товару або послуги..." 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
