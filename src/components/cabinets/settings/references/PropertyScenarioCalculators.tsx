import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertySaleTaxCalculator } from "./PropertySaleTaxCalculator";
import { PropertyRentalTaxCalculator } from "./PropertyRentalTaxCalculator";
import { PropertyGiftTaxCalculator } from "./PropertyGiftTaxCalculator";
import { DEMO_PROPERTY_OBJECTS, type PropertyObject } from "@/config/propertyRegistryConfig";

interface PropertyScenarioCalculatorsProps {
  property: PropertyObject;
  allProperties?: PropertyObject[];
}

const RENTABLE_TYPES = new Set(["apartment", "house", "commercial"]);

export const PropertyScenarioCalculators = ({
  property,
  allProperties = DEMO_PROPERTY_OBJECTS,
}: PropertyScenarioCalculatorsProps) => {
  const isSold = property.status === "sold";
  const canRent = RENTABLE_TYPES.has(property.type);

  // Pick default tab based on current property state
  const defaultTab =
    property.status === "rented" ? "rental" :
    property.acquisitionMethod === "gift" ? "gift" :
    property.acquisitionMethod === "inheritance" ? "inheritance" :
    "sale";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Сценарії оподаткування</h3>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full h-auto flex-wrap">
          {!isSold && <TabsTrigger value="sale" className="text-xs flex-1">🏷️ Продаж</TabsTrigger>}
          {canRent && <TabsTrigger value="rental" className="text-xs flex-1">🏠 Оренда</TabsTrigger>}
          <TabsTrigger value="gift" className="text-xs flex-1">🎁 Дарування</TabsTrigger>
          <TabsTrigger value="inheritance" className="text-xs flex-1">📜 Спадщина</TabsTrigger>
        </TabsList>

        {!isSold && (
          <TabsContent value="sale">
            <PropertySaleTaxCalculator property={property} allProperties={allProperties} />
          </TabsContent>
        )}

        {canRent && (
          <TabsContent value="rental">
            <PropertyRentalTaxCalculator property={property} />
          </TabsContent>
        )}

        <TabsContent value="gift">
          <PropertyGiftTaxCalculator property={property} mode="gift" />
        </TabsContent>

        <TabsContent value="inheritance">
          <PropertyGiftTaxCalculator property={property} mode="inheritance" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
