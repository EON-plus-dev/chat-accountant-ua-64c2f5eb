import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gift, TrendingDown, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { calculateGiftTax, calculateInheritanceTax } from "@/config/propertyTaxConfig";
import { toast } from "@/hooks/use-toast";
import type { PropertyObject, DonorRelation } from "@/config/propertyRegistryConfig";

const RELATION_LABELS: Record<DonorRelation, string> = {
  first_line: "Родич 1-ї черги (батьки, діти, подружжя)",
  second_line: "Родич 2-ї черги (брати, сестри, дідусі, бабусі)",
  non_relative: "Неродич",
  non_resident: "Нерезидент",
};

interface PropertyGiftTaxCalculatorProps {
  property: PropertyObject;
  mode?: "gift" | "inheritance";
}

export const PropertyGiftTaxCalculator = ({ property, mode }: PropertyGiftTaxCalculatorProps) => {
  const isInheritance = mode
    ? mode === "inheritance"
    : property.acquisitionMethod === "inheritance";

  const defaultRelation = isInheritance
    ? property.inheritanceRelation
    : property.donorRelation;

  const [relation, setRelation] = useState<DonorRelation>(defaultRelation ?? "first_line");

  const defaultValue = property.estimatedValue ?? 0;
  const [customValue, setCustomValue] = useState<string>(defaultValue.toString());
  const value = Number(customValue) || 0;

  const result = isInheritance
    ? calculateInheritanceTax(value, relation)
    : calculateGiftTax(value, relation);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          {isInheritance ? "Податок при спадкуванні" : "Податок при даруванні"}
        </h3>
        <Badge variant="outline" className="text-xs">{result.article}</Badge>
      </div>

      <div className="rounded-lg border p-3 space-y-3">
        {/* Relation selector */}
        <div className="space-y-1.5">
          <Label htmlFor="relation-select" className="text-xs">
            {isInheritance ? "Ступінь спорідненості зі спадкодавцем" : "Ступінь спорідненості з дарувальником"}
          </Label>
          <Select value={relation} onValueChange={(v) => setRelation(v as DonorRelation)}>
            <SelectTrigger id="relation-select" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(RELATION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value input */}
        <div className="space-y-1.5">
          <Label htmlFor="gift-value" className="text-xs">Оціночна вартість, грн</Label>
          <Input
            id="gift-value"
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="h-8 text-sm"
            min={0}
          />
        </div>

        {/* Result */}
        {value > 0 && (
          <div className="rounded-md bg-muted/50 p-3 space-y-2">
            {result.isExempt && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="h-4 w-4" />
                Звільнено від оподаткування (0%)
              </div>
            )}

            {!result.isExempt && (
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
            )}

            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-sm font-semibold">Разом до сплати</span>
              <span className={`text-sm font-bold ${result.isExempt ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>
                {formatCurrency(result.total)}
              </span>
            </div>

            {result.total > 0 && !result.isExempt && (
              <Button
                size="sm"
                className="w-full gap-2 mt-1"
                onClick={() => toast({ title: "Демо-режим", description: "Перейдіть до розділу Платежі для створення платіжного доручення" })}
              >
                <CreditCard className="h-4 w-4" />
                Сформувати платіж
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
