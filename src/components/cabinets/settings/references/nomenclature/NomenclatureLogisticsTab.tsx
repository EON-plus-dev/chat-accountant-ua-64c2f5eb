/**
 * NOMENCLATURE LOGISTICS TAB
 * 
 * Логістична інформація (вага, габарити, умови зберігання)
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  Scale,
  Ruler,
  Box,
  Thermometer,
  ShieldAlert,
  MapPin,
  Package,
  Clock,
} from "lucide-react";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { calculateVolumeWeight } from "@/config/nomenclatureConfig";

interface NomenclatureLogisticsTabProps {
  item: NomenclatureItemV2;
}

export const NomenclatureLogisticsTab = ({ item }: NomenclatureLogisticsTabProps) => {
  const { logistics } = item;

  if (!logistics) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Truck className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Логістичні дані відсутні</p>
          <p className="text-xs mt-1">
            Додайте вагу, габарити та умови зберігання
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasPhysicalProps = logistics.weight || logistics.dimensions;
  const hasStorageProps = logistics.storageConditions || logistics.temperatureRange || logistics.shelfLife;

  // Calculate volume weight if dimensions exist
  const volumeWeight = logistics.dimensions
    ? calculateVolumeWeight(logistics.dimensions)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Physical Properties */}
      {hasPhysicalProps && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Фізичні характеристики
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {logistics.weight && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5" />
                  Вага
                </span>
                <span className="font-mono font-medium">{logistics.weight} кг</span>
              </div>
            )}

            {logistics.dimensions && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5" />
                    Габарити (Д×Ш×В)
                  </span>
                  <span className="font-mono text-sm">
                    {logistics.dimensions.length} × {logistics.dimensions.width} × {logistics.dimensions.height} см
                  </span>
                </div>

                {volumeWeight && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Box className="h-3.5 w-3.5" />
                        Об'ємна вага
                      </span>
                      <span className="font-mono text-sm">{volumeWeight.toFixed(2)} кг</span>
                    </div>
                  </>
                )}
              </>
            )}

            {logistics.packagingType && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Тип упаковки
                  </span>
                  <Badge variant="secondary">{logistics.packagingType}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Storage Conditions */}
      {hasStorageProps && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Умови зберігання
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {logistics.storageConditions && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-muted-foreground shrink-0">Умови</span>
                <p className="text-sm text-right">{logistics.storageConditions}</p>
              </div>
            )}

            {logistics.temperatureRange && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Thermometer className="h-3.5 w-3.5" />
                    Температурний режим
                  </span>
                  <Badge variant="outline">{logistics.temperatureRange}</Badge>
                </div>
              </>
            )}

            {logistics.shelfLife && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Термін зберігання
                  </span>
                  <span className="font-medium">{logistics.shelfLife} днів</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Safety & Origin */}
      {(logistics.hazardClass || logistics.countryOfOrigin) && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Безпека та походження
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {logistics.hazardClass && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Клас небезпеки
                </span>
                <Badge variant="destructive">{logistics.hazardClass}</Badge>
              </div>
            )}

            {logistics.countryOfOrigin && (
              <>
                {logistics.hazardClass && <Separator />}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Країна походження
                  </span>
                  <Badge variant="secondary">{logistics.countryOfOrigin}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state if no logistics at all */}
      {!hasPhysicalProps && !hasStorageProps && !logistics.hazardClass && !logistics.countryOfOrigin && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-muted-foreground">
            <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Логістичні дані не заповнені</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
