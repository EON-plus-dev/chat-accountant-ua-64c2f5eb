import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Plus, CalendarDays } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  INSURANCE_TYPE_LABELS,
  type PropertyObject,
  type InsuranceType,
} from "@/config/propertyRegistryConfig";

const INSURANCE_BADGE_CLASS: Record<InsuranceType, string> = {
  property: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  liability: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  title: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

const daysUntil = (dateStr: string): number => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

interface Props {
  property: PropertyObject;
}

export const PropertyInsuranceSection = ({ property }: Props) => {
  const insurances = property.insurances ?? [];

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        Страхування
        {insurances.length > 0 && (
          <Badge variant="secondary" className="text-xs">{insurances.length}</Badge>
        )}
      </h3>

      {insurances.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-muted-foreground">Страхові поліси не додано</p>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Додати поліс
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {insurances.map((ins) => {
            const remaining = daysUntil(ins.validTo);
            const isExpired = remaining < 0;
            const isExpiringSoon = !isExpired && remaining <= 30;

            return (
              <div key={ins.id} className={`rounded-lg border p-3 space-y-1.5 ${isExpired ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs gap-1 ${INSURANCE_BADGE_CLASS[ins.type]}`}>
                      {INSURANCE_TYPE_LABELS[ins.type]}
                    </Badge>
                    <Badge
                      variant={isExpired ? "outline" : isExpiringSoon ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {isExpired ? "Закінчився" : isExpiringSoon ? `Закінч. через ${remaining} дн.` : "Діє"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium">{ins.company}</span>
                  <span className="text-muted-foreground">№ {ins.policyNumber}</span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(ins.validFrom)} — {formatDate(ins.validTo)}
                  </span>
                  <span>Покриття: {formatCurrency(ins.coverageAmount)}</span>
                </div>

                {isExpiringSoon && !isExpired && (
                  <div className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Поліс закінчується через {remaining} днів — рекомендуємо подовжити
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
