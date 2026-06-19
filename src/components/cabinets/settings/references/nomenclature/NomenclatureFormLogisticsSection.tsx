/**
 * NomenclatureFormLogisticsSection - Weight, dimensions, packaging (collapsible)
 */

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Truck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { NomenclatureFormData } from "./NomenclatureForm";

interface NomenclatureFormLogisticsSectionProps {
  form: UseFormReturn<NomenclatureFormData>;
}

const PACKAGING_TYPES = [
  { value: "box", label: "Коробка" },
  { value: "pallet", label: "Палета" },
  { value: "bag", label: "Мішок" },
  { value: "container", label: "Контейнер" },
  { value: "envelope", label: "Конверт" },
  { value: "tube", label: "Тубус" },
  { value: "other", label: "Інше" },
];

const COUNTRIES = [
  { value: "UA", label: "🇺🇦 Україна" },
  { value: "CN", label: "🇨🇳 Китай" },
  { value: "DE", label: "🇩🇪 Німеччина" },
  { value: "PL", label: "🇵🇱 Польща" },
  { value: "US", label: "🇺🇸 США" },
  { value: "TR", label: "🇹🇷 Туреччина" },
  { value: "IT", label: "🇮🇹 Італія" },
  { value: "other", label: "🌍 Інша країна" },
];

export const NomenclatureFormLogisticsSection = ({ form }: NomenclatureFormLogisticsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">🚚 Логістика та упаковка</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-4 pb-4 space-y-4 border border-t-0 rounded-b-lg">
        <div className="pt-4 space-y-4">
          {/* Weight */}
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Вага (кг)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="0.000" 
                    className="font-mono"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dimensions */}
          <div className="space-y-2">
            <FormLabel>Габарити (см)</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="dimensions.length"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Довжина" 
                        className="text-sm"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions.width"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Ширина" 
                        className="text-sm"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions.height"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Висота" 
                        className="text-sm"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription>Довжина × Ширина × Висота в сантиметрах</FormDescription>
          </div>

          {/* Packaging Type */}
          <FormField
            control={form.control}
            name="packagingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип упаковки</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть тип упаковки" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PACKAGING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country of Origin */}
          <FormField
            control={form.control}
            name="countryOfOrigin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Країна походження</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть країну" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
