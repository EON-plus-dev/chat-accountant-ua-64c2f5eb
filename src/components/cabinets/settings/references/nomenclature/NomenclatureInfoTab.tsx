/**
 * NOMENCLATURE INFO TAB
 * 
 * Базова інформація про позицію номенклатури
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Tag, Barcode, Layers } from "lucide-react";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { getUnitByCode } from "@/config/unitsConfig";

interface NomenclatureInfoTabProps {
  item: NomenclatureItemV2;
}

export const NomenclatureInfoTab = ({ item }: NomenclatureInfoTabProps) => {
  const unit = getUnitByCode(item.unitCode);

  return (
    <div className="space-y-4">
      {/* Description */}
      {item.description && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Опис
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Classification */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Класифікація
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Категорія</span>
            <Badge variant={item.category === "service" ? "secondary" : "default"}>
              {item.category === "service" ? "Послуга" : "Товар"}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Одиниця виміру</span>
            <div className="text-right">
              <p className="text-sm font-medium">{item.unitCode}</p>
              {unit && (
                <p className="text-xs text-muted-foreground">{unit.name}</p>
              )}
            </div>
          </div>

          {item.unitAlt && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Альт. одиниця</span>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.unitAlt}</p>
                  {item.conversionRate && (
                    <p className="text-xs text-muted-foreground">
                      Коеф.: {item.conversionRate}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Теги
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barcodes & Codes */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Barcode className="h-4 w-4" />
            Ідентифікатори
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">SKU</span>
            <Badge variant="outline" className="font-mono">
              {item.sku}
            </Badge>
          </div>

          {item.barcode && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Штрих-код (EAN-13)</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {item.barcode}
                </Badge>
              </div>
            </>
          )}

          {item.vendorCode && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Артикул постачальника</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {item.vendorCode}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Створено: {new Date(item.createdAt).toLocaleDateString("uk-UA")}</span>
            <span>Оновлено: {new Date(item.updatedAt).toLocaleDateString("uk-UA")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
