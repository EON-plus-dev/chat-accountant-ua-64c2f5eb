import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PropertyRequiredDocuments } from "./PropertyRequiredDocuments";
import { PropertyTaxSection } from "./PropertyTaxSection";
import { PropertyScenarioCalculators } from "./PropertyScenarioCalculators";
import { PropertyDeclarationHistory } from "./PropertyDeclarationHistory";
import { PropertyEncumbrancesSection } from "./PropertyEncumbrancesSection";
import { PropertyInsuranceSection } from "./PropertyInsuranceSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pencil,
  Trash2,
  FileText,
  Sparkles,
  CalendarDays,
  ExternalLink,
  Lock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  PROPERTY_TYPE_LABELS,
  ACQUISITION_METHOD_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_ICONS,
  DATA_SOURCE_LABELS,
  shareLabel,
  type PropertyObject,
} from "@/config/propertyRegistryConfig";

interface PropertyDetailSheetProps {
  property: PropertyObject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (property: PropertyObject) => void;
  onDelete: (id: string) => void;
  onUploadDocument?: (checklistItemId: string) => void;
}

export const PropertyDetailSheet = ({
  property,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onUploadDocument,
}: PropertyDetailSheetProps) => {
  if (!property) return null;

  const Icon = PROPERTY_TYPE_ICONS[property.type];
  const isSold = property.status === "sold";

  const fields = [
    { label: "Тип майна", value: PROPERTY_TYPE_LABELS[property.type] },
    { label: "Опис", value: property.description },
    { label: "Адреса", value: property.address || "—" },
    { label: "Частка володіння", value: shareLabel(property.ownershipShare) },
    { label: "Дата набуття", value: formatDate(property.acquisitionDate) },
    { label: "Спосіб набуття", value: ACQUISITION_METHOD_LABELS[property.acquisitionMethod] },
    { label: "Орієнтовна вартість", value: property.estimatedValue ? formatCurrency(property.estimatedValue) : "—" },
    {
      label: "Статус",
      value: PROPERTY_STATUS_LABELS[property.status] +
        (property.soldDate ? ` (${formatDate(property.soldDate)})` : ""),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2.5 ${isSold ? "bg-muted" : "bg-primary/10"}`}>
              <Icon className={`h-6 w-6 ${isSold ? "text-muted-foreground" : "text-primary"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-left">
                {property.description}
              </SheetTitle>
              <SheetDescription className="text-left">
                {property.address || PROPERTY_TYPE_LABELS[property.type]}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Data source badge */}
              <Badge
                variant={property.dataSource === "registry" ? "default" : "outline"}
                className={`text-xs gap-1 pointer-events-none ${
                  property.dataSource === "registry"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : property.dataSource === "document"
                    ? "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    : ""
                }`}
              >
                {property.dataSource === "registry" && <Lock className="h-3 w-3" />}
                {DATA_SOURCE_LABELS[property.dataSource]}
              </Badge>
              <Badge variant={isSold ? "outline" : "secondary"} className="pointer-events-none">
                {PROPERTY_STATUS_LABELS[property.status]}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Core data */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Основні дані</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {fields.map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Required documents checklist */}
          <PropertyRequiredDocuments property={property} onUploadClick={onUploadDocument} />

          <Separator />

          {/* Tax accounting */}
          <PropertyTaxSection property={property} />

          <Separator />

          {/* Scenario tax calculators */}
          <PropertyScenarioCalculators property={property} />

          <Separator />

          {/* Declaration history */}
          <PropertyDeclarationHistory property={property} />

          <Separator />

          {/* Encumbrances */}
          <PropertyEncumbrancesSection property={property} />

          <Separator />

          {/* Insurance */}
          <PropertyInsuranceSection property={property} />

          <Separator />
          {property.dataSource === "registry" && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Підтверджено держреєстром
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {property.registryNumber && (
                  <div>
                    <span className="block text-muted-foreground/70">Номер у реєстрі</span>
                    <span className="font-medium text-foreground">{property.registryNumber}</span>
                  </div>
                )}
                {property.registryLastSync && (
                  <div>
                    <span className="block text-muted-foreground/70">Остання синхронізація</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      {formatDate(property.registryLastSync)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Documents */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Документи ({property.documents.length})
            </h3>
            {property.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Документи не додано</p>
            ) : (
              <div className="space-y-2">
                {property.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(doc.uploadedAt)}
                        </span>
                        {doc.aiClassification && (
                          <Badge variant="secondary" className="text-xs font-normal gap-1">
                            <Sparkles className="h-3 w-3" />
                            {doc.aiClassification}
                          </Badge>
                        )}
                      </div>
                      {doc.recognizedFields && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(doc.recognizedFields).map(([key, val]) => (
                            <Badge key={key} variant="outline" className="text-xs font-normal">
                              {key}: {val}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cross-reference to document flow */}
            {property.documentRefs && property.documentRefs.length > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-muted/50 flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">
                  Пов'язано з {property.documentRefs.length} док. у документообігу
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                onEdit(property);
              }}
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Редагувати
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Видалити об'єкт?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {PROPERTY_TYPE_LABELS[property.type]} — {property.address || property.description}.
                    Цю дію не можна скасувати.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Скасувати</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      onDelete(property.id);
                      onOpenChange(false);
                    }}
                  >
                    Видалити
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
