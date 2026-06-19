import { Badge } from "@/components/ui/badge";
import { ClipboardList, FileCheck } from "lucide-react";
import { DEMO_DECLARATION_HISTORY, type DeclarationHistoryEntry } from "@/config/propertyTaxConfig";
import type { PropertyObject } from "@/config/propertyRegistryConfig";

interface PropertyDeclarationHistoryProps {
  property: PropertyObject;
}

export const PropertyDeclarationHistory = ({ property }: PropertyDeclarationHistoryProps) => {
  const entries: DeclarationHistoryEntry[] = DEMO_DECLARATION_HISTORY[property.id] ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-primary" />
        Історія декларування ({entries.length})
      </h3>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Об'єкт ще не фігурував у деклараціях</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2">
              <FileCheck className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">{entry.year}</span>
              <span className="text-sm text-muted-foreground flex-1">{entry.declarationType}</span>
              <Badge variant="secondary" className="text-xs font-normal">
                {entry.section}, {entry.row}
              </Badge>
              <Badge
                variant={entry.status === "submitted" ? "default" : "outline"}
                className="text-xs"
              >
                {entry.status === "submitted" ? "Подано" : "Чернетка"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
