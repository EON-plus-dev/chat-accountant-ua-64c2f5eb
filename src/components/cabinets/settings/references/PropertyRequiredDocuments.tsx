import { CheckCircle2, AlertTriangle, Circle, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  REQUIRED_DOCUMENTS_BY_TYPE,
  type PropertyObject,
  type PropertyRequiredDocument,
} from "@/config/propertyRegistryConfig";

interface PropertyRequiredDocumentsProps {
  property: PropertyObject;
  onUploadClick?: (checklistItemId: string) => void;
}

const PRIORITY_CONFIG: Record<
  PropertyRequiredDocument["priority"],
  { label: string; variant: "error" | "warning" | "outline" }
> = {
  critical: { label: "Критичний", variant: "error" },
  high: { label: "Важливий", variant: "warning" },
  medium: { label: "Бажаний", variant: "outline" },
};

export const PropertyRequiredDocuments = ({
  property,
  onUploadClick,
}: PropertyRequiredDocumentsProps) => {
  const requiredDocs = REQUIRED_DOCUMENTS_BY_TYPE[property.type] ?? [];
  if (requiredDocs.length === 0) return null;

  const classifications = property.documents
    .map((d) => d.aiClassification)
    .filter(Boolean) as string[];

  const matches = requiredDocs.map((req) => {
    const found = req.matchClassifications
      ? req.matchClassifications.some((mc) => classifications.includes(mc))
      : false;
    return { ...req, found };
  });

  const fulfilled = matches.filter((m) => m.found).length;
  const total = matches.length;
  const percent = Math.round((fulfilled / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Необхідні документи ({fulfilled}/{total})
        </h3>
        {fulfilled === total && (
          <Badge variant="success" size="sm">Комплект повний</Badge>
        )}
      </div>

      <Progress value={percent} className="h-2" />

      <div className="space-y-1.5">
        {matches.map((item) => {
          const priorityCfg = PRIORITY_CONFIG[item.priority];
          return (
            <div
              key={item.id}
              className="flex items-center gap-2.5 rounded-lg border px-3 py-2"
            >
              {item.found ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : item.priority === "critical" || item.priority === "high" ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                {item.description && !item.found && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                )}
              </div>

              <Badge variant={priorityCfg.variant} size="sm">
                {priorityCfg.label}
              </Badge>

              {!item.found && onUploadClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onUploadClick(item.id)}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Завантажити
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
