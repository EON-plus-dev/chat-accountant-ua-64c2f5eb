import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Receipt, Info, CheckCircle2, Clock, AlertTriangle, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import {
  TAX_RULES_BY_TYPE,
  DEMO_TAX_RECORDS,
  type PropertyTaxRecord,
  type TaxPaymentStatus,
} from "@/config/propertyTaxConfig";
import type { PropertyObject } from "@/config/propertyRegistryConfig";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<TaxPaymentStatus, { label: string; icon: React.ElementType; className: string }> = {
  paid: { label: "Сплачено", icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
  pending: { label: "Очікує", icon: Clock, className: "text-amber-600 dark:text-amber-400" },
  overdue: { label: "Прострочено", icon: AlertTriangle, className: "text-destructive" },
  calculated: { label: "Розрахунок", icon: Receipt, className: "text-muted-foreground" },
};

interface PropertyTaxSectionProps {
  property: PropertyObject;
}

export const PropertyTaxSection = ({ property }: PropertyTaxSectionProps) => {
  const [open, setOpen] = useState(false);
  const rule = TAX_RULES_BY_TYPE[property.type];
  const records: PropertyTaxRecord[] = DEMO_TAX_RECORDS[property.id] ?? [];
  const calculatedAnnual = rule.calculateAnnual(property);

  const totalPaid = records.filter((r) => r.status === "paid").reduce((s, r) => s + r.paid, 0);
  const totalAccrued = records.reduce((s, r) => s + r.accrued, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          Податковий облік
        </h3>
        <Badge variant="outline" className="text-xs">{rule.article}</Badge>
      </div>

      <div className="rounded-lg border p-3 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Тип податку</p>
            <p className="font-medium mt-0.5">{rule.taxName}</p>
          </div>
          {rule.exemptArea != null && (
            <div>
              <p className="text-xs text-muted-foreground">Пільгова площа</p>
              <p className="font-medium mt-0.5">{rule.exemptArea} м²</p>
            </div>
          )}
          {property.totalArea != null && (
            <div>
              <p className="text-xs text-muted-foreground">Загальна площа</p>
              <p className="font-medium mt-0.5">{property.totalArea} м²</p>
            </div>
          )}
          {calculatedAnnual != null && (
            <div>
              <p className="text-xs text-muted-foreground">Розрахунок на 2026</p>
              <p className="font-medium mt-0.5 text-primary">{formatCurrency(calculatedAnnual)}</p>
            </div>
          )}
        </div>

        {/* Payment history */}
        {records.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Історія нарахувань</p>
            {records.map((rec) => {
              const cfg = STATUS_CONFIG[rec.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={rec.year} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm font-medium">{rec.year}</span>
                  <span className="text-sm">{formatCurrency(rec.accrued)}</span>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.className}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between text-xs text-muted-foreground pt-1 px-1">
              <span>Всього нараховано: {formatCurrency(totalAccrued)}</span>
              <span>Сплачено: {formatCurrency(totalPaid)}</span>
            </div>
            {records.some((r) => r.status === "pending" || r.status === "overdue") && (
              <Button
                size="sm"
                variant={records.some((r) => r.status === "overdue") ? "destructive" : "default"}
                className="w-full gap-2 mt-1"
                onClick={() => toast({ title: "Демо-режим", description: "Перейдіть до розділу Платежі для створення платіжного доручення" })}
              >
                <CreditCard className="h-4 w-4" />
                Сплатити податок
              </Button>
            )}
          </div>
        )}

        {records.length === 0 && property.type === "vehicle" && (
          <div className="text-sm text-muted-foreground rounded-md bg-muted/50 p-2.5">
            {property.engineVolume && property.engineVolume > 3000
              ? "Транспортний податок нараховується щорічно"
              : "Транспортний податок не застосовується (об'єм двигуна ≤ 3000 куб. см або авто старше 5 років)"}
          </div>
        )}
      </div>

      {/* Collapsible explanation */}
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Info className="h-3.5 w-3.5" />
          <span>Як розраховано</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1.5">
          <p>{rule.description}</p>
          <p><strong>Ставка:</strong> {rule.rateDescription}</p>
          <p><strong>Дедлайн сплати:</strong> до 1 липня року, наступного за звітним</p>
          <p><strong>Підстава:</strong> {rule.article}</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
