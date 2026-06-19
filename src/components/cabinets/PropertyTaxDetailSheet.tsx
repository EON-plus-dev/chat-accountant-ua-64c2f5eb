import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Home,
  MapPin,
  Car,
  Package,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import {
  DEMO_PROPERTY_OBJECTS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  ACQUISITION_METHOD_LABELS,
  type PropertyObject,
} from "@/config/propertyRegistryConfig";
import { PropertyTaxSection } from "./settings/references/PropertyTaxSection";
import { PropertyScenarioCalculators } from "./settings/references/PropertyScenarioCalculators";
import { PropertyDeclarationHistory } from "./settings/references/PropertyDeclarationHistory";
import type { DemoRecord } from "@/config/operationsConfig";

const TYPE_ICONS: Record<string, React.ElementType> = {
  apartment: Building2,
  house: Home,
  land: MapPin,
  vehicle: Car,
  commercial: Building2,
  other: Package,
};

interface PropertyTaxDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DemoRecord | null;
  onGoToRegistry?: () => void;
}

export const PropertyTaxDetailSheet = ({
  open,
  onOpenChange,
  record,
  onGoToRegistry,
}: PropertyTaxDetailSheetProps) => {
  const property: PropertyObject | undefined = useMemo(() => {
    if (!record) return undefined;
    return DEMO_PROPERTY_OBJECTS.find((p) => p.id === record.id);
  }, [record]);

  if (!property) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="responsive-right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Об'єкт не знайдено</SheetTitle>
            <SheetDescription>Не вдалося знайти деталі об'єкта</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const Icon = TYPE_ICONS[property.type] ?? Package;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 space-y-1">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base truncate">
                  {PROPERTY_TYPE_LABELS[property.type]}
                </SheetTitle>
                <SheetDescription className="truncate">
                  {property.address || property.description}
                </SheetDescription>
              </div>
              <Badge
                variant={property.status === "owned" ? "success" : "secondary"}
                size="sm"
                className="pointer-events-none"
              >
                {PROPERTY_STATUS_LABELS[property.status]}
              </Badge>
            </div>
          </SheetHeader>
        </div>

        <Separator />

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {/* Quick info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {property.address && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Адреса</p>
                  <p className="font-medium mt-0.5">{property.address}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Спосіб набуття</p>
                <p className="font-medium mt-0.5">
                  {ACQUISITION_METHOD_LABELS[property.acquisitionMethod]}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Частка</p>
                <p className="font-medium mt-0.5">
                  {(property.ownershipShare * 100).toFixed(0)}%
                </p>
              </div>
              {property.totalArea != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Площа</p>
                  <p className="font-medium mt-0.5">{property.totalArea} м²</p>
                </div>
              )}
              {property.estimatedValue != null && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Оціночна вартість
                  </p>
                  <p className="font-medium mt-0.5">
                    {formatCurrency(property.estimatedValue)}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Tax section */}
            <PropertyTaxSection property={property} />

            <Separator />

            {/* Scenario tax calculators */}
            <PropertyScenarioCalculators
              property={property}
              allProperties={DEMO_PROPERTY_OBJECTS}
            />

            <Separator />

            {/* Declaration history */}
            <PropertyDeclarationHistory property={property} />
          </div>
        </ScrollArea>

        {/* Footer */}
        {onGoToRegistry && (
          <>
            <Separator />
            <div className="px-6 py-4">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  onOpenChange(false);
                  onGoToRegistry();
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Перейти до реєстру
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
