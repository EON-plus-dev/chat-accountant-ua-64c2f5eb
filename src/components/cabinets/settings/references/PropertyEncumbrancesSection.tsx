import { Badge } from "@/components/ui/badge";
import { Scale, Building2, Ban, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import {
  ENCUMBRANCE_TYPE_LABELS,
  type PropertyObject,
  type EncumbranceType,
} from "@/config/propertyRegistryConfig";

const ENCUMBRANCE_STYLES: Record<EncumbranceType, { icon: React.ElementType; className: string }> = {
  mortgage: { icon: Building2, className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  arrest: { icon: Ban, className: "bg-destructive/10 text-destructive border-destructive/20" },
  prohibition: { icon: ShieldAlert, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" },
  lease: { icon: Scale, className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  other: { icon: AlertTriangle, className: "border-border text-muted-foreground" },
};

interface Props {
  property: PropertyObject;
}

export const PropertyEncumbrancesSection = ({ property }: Props) => {
  const encumbrances = property.encumbrances ?? [];
  const activeCount = encumbrances.filter((e) => e.active).length;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Scale className="h-4 w-4 text-muted-foreground" />
        Обтяження
        {encumbrances.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeCount} активн.
          </Badge>
        )}
      </h3>

      {encumbrances.length === 0 ? (
        <p className="text-sm text-muted-foreground">Обтяжень не зареєстровано</p>
      ) : (
        <div className="space-y-2">
          {encumbrances.map((enc) => {
            const style = ENCUMBRANCE_STYLES[enc.type];
            const Icon = style.icon;
            return (
              <div
                key={enc.id}
                className={`rounded-lg border p-3 space-y-1.5 ${!enc.active ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs gap-1 ${style.className}`}>
                      <Icon className="h-3 w-3" />
                      {ENCUMBRANCE_TYPE_LABELS[enc.type]}
                    </Badge>
                    <Badge variant={enc.active ? "destructive" : "outline"} className="text-xs">
                      {enc.active ? "Активне" : "Зняте"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm">{enc.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Реєстратор: {enc.registeredBy}</span>
                  <span>Дата: {formatDate(enc.registeredAt)}</span>
                  {enc.registryNumber && <span>№ {enc.registryNumber}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 p-2.5 rounded-lg bg-muted/50 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">
          Дані з Державного реєстру обтяжень рухомого/нерухомого майна
        </span>
      </div>
    </div>
  );
};
