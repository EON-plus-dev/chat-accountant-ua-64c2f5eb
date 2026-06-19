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
import { Home, ShieldCheck, AlertTriangle, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { calculateRentalTax } from "@/config/propertyTaxConfig";
import type { PropertyObject, TenantType } from "@/config/propertyRegistryConfig";
import { toast } from "@/hooks/use-toast";

interface PropertyRentalTaxCalculatorProps {
  property: PropertyObject;
}

const TENANT_LABELS: Record<TenantType, string> = {
  individual: "Фізична особа",
  legal_entity: "Юридична особа",
};

export const PropertyRentalTaxCalculator = ({ property }: PropertyRentalTaxCalculatorProps) => {
  const defaultRent = property.monthlyRent ?? 0;
  const [customRent, setCustomRent] = useState<string>(defaultRent.toString());
  const [tenantType, setTenantType] = useState<TenantType>(property.tenantType ?? "individual");
  const rent = Number(customRent) || 0;

  const result = calculateRentalTax(rent, tenantType);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          Податок з оренди
        </h3>
        <Badge variant="outline" className="text-xs">ст. 170.1 ПКУ</Badge>
      </div>

      <div className="rounded-lg border p-3 space-y-3">
        {/* Tenant type selector */}
        <div className="space-y-1.5">
          <Label htmlFor="tenant-type" className="text-xs">Тип орендаря</Label>
          <Select value={tenantType} onValueChange={(v) => setTenantType(v as TenantType)}>
            <SelectTrigger id="tenant-type" className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TENANT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agent indicator */}
        <div className="flex items-center gap-2 text-sm">
          {result.isAgentWithheld ? (
            <>
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>Орендар — юрособа (податковий агент утримує податок)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>Орендар — фізособа (самостійне декларування)</span>
            </>
          )}
        </div>

        {/* Rent input */}
        <div className="space-y-1.5">
          <Label htmlFor="monthly-rent" className="text-xs">Місячна оренда, грн</Label>
          <Input
            id="monthly-rent"
            type="number"
            value={customRent}
            onChange={(e) => setCustomRent(e.target.value)}
            className="h-8 text-sm"
            min={0}
          />
        </div>

        {/* Result */}
        {rent > 0 && (
          <div className="rounded-md bg-muted/50 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Річна оренда</p>
                <p className="font-medium">{formatCurrency(result.annualRent)}</p>
              </div>
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
              <span className="text-sm font-semibold">Разом до сплати за рік</span>
              <span className="text-sm font-bold text-primary">{formatCurrency(result.total)}</span>
            </div>

            {result.total > 0 && (
              <>
                <Button
                  size="sm"
                  className="w-full gap-2 mt-1"
                  onClick={() => toast({ title: "Демо-режим", description: "Перейдіть до розділу Платежі для створення платіжного доручення" })}
                >
                  <CreditCard className="h-4 w-4" />
                  Сформувати квартальний платіж
                </Button>
                <p className="text-xs text-muted-foreground text-center">Декларування — щоквартально до 10 числа наступного місяця</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
