/**
 * NomenclatureFormStockSection - Stock quantity and reorder point (collapsible)
 */

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Package } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { NomenclatureFormData } from "./NomenclatureForm";

interface NomenclatureFormStockSectionProps {
  form: UseFormReturn<NomenclatureFormData>;
}

export const NomenclatureFormStockSection = ({ form }: NomenclatureFormStockSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">📦 Складський облік</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-4 pb-4 space-y-4 border border-t-0 rounded-b-lg">
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Initial Stock */}
          <FormField
            control={form.control}
            name="initialStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Початковий залишок</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Кількість на складі</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reorder Point */}
          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Точка перезамовлення</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    step="1"
                    placeholder="5" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Мін. залишок для повідомлення про поповнення
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
