/**
 * NomenclatureFormWarrantySection - Warranty and return policy (collapsible)
 */

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { NomenclatureFormData } from "./NomenclatureForm";

interface NomenclatureFormWarrantySectionProps {
  form: UseFormReturn<NomenclatureFormData>;
}

const WARRANTY_TYPES = [
  { value: "manufacturer", label: "Гарантія виробника" },
  { value: "seller", label: "Гарантія продавця" },
  { value: "extended", label: "Розширена гарантія" },
];

const RETURN_POLICIES = [
  { value: "full", label: "Повне повернення" },
  { value: "exchange", label: "Тільки обмін" },
  { value: "none", label: "Без повернення" },
];

export const NomenclatureFormWarrantySection = ({ form }: NomenclatureFormWarrantySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">🛡️ Гарантія та сервіс</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-4 pb-4 space-y-4 border border-t-0 rounded-b-lg">
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Warranty Months */}
          <FormField
            control={form.control}
            name="warrantyMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Гарантійний термін (міс)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    max="120"
                    step="1"
                    placeholder="12" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Warranty Type */}
          <FormField
            control={form.control}
            name="warrantyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип гарантії</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть тип" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WARRANTY_TYPES.map((type) => (
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

          {/* Return Days */}
          <FormField
            control={form.control}
            name="returnDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Термін повернення (днів)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    max="365"
                    step="1"
                    placeholder="14" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Згідно із Законом — 14 днів</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Return Policy */}
          <FormField
            control={form.control}
            name="returnPolicy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Політика повернення</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть політику" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RETURN_POLICIES.map((policy) => (
                      <SelectItem key={policy.value} value={policy.value}>
                        {policy.label}
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
