/**
 * NOMENCLATURE SUPPLIERS TAB
 * 
 * Таб "Постачальники" - список постачальників для позиції номенклатури
 * з їх цінами, lead time, MOQ та рейтингом надійності
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Users, 
  Star, 
  Clock, 
  Plus,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { getMockNomenclatureSuppliers, type NomenclatureSupplier } from "@/config/contractorInteractionConfig";

interface NomenclatureSuppliersTabProps {
  item: NomenclatureItemV2;
  onNavigateToContractor?: (contractorId: string) => void;
  onAddSupplier?: () => void;
}

export const NomenclatureSuppliersTab = ({
  item,
  onNavigateToContractor,
  onAddSupplier,
}: NomenclatureSuppliersTabProps) => {
  const suppliers = getMockNomenclatureSuppliers(item.id);

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">Постачальників не додано</p>
          <Button onClick={onAddSupplier} className="gap-2">
            <Plus className="h-4 w-4" />
            Додати постачальника
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Find best price and preferred supplier
  const bestPrice = Math.min(...suppliers.map(s => s.price));
  const preferredSupplier = suppliers.find(s => s.isPreferred);

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 90) return "text-green-600 dark:text-green-400";
    if (reliability >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getReliabilityBgColor = (reliability: number) => {
    if (reliability >= 90) return "bg-green-500";
    if (reliability >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">{suppliers.length}</p>
            <p className="text-xs text-muted-foreground">постачальників</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold font-mono">
              {formatNomenclaturePrice(bestPrice, item.pricing.currency)}
            </p>
            <p className="text-xs text-muted-foreground">найнижча ціна</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">
              {Math.min(...suppliers.map(s => s.leadTimeDays))} дн
            </p>
            <p className="text-xs text-muted-foreground">мін. lead time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">
              {Math.round(suppliers.reduce((acc, s) => acc + s.reliability, 0) / suppliers.length)}%
            </p>
            <p className="text-xs text-muted-foreground">сер. надійність</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Постачальники
            </CardTitle>
            <Button size="sm" variant="outline" onClick={onAddSupplier} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Додати
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Постачальник</TableHead>
                  <TableHead className="w-[100px]">Артикул</TableHead>
                  <TableHead className="w-[120px] text-right">Ціна</TableHead>
                  <TableHead className="w-[70px] text-center">MOQ</TableHead>
                  <TableHead className="w-[80px] text-center">Lead Time</TableHead>
                  <TableHead className="w-[100px] text-center">Надійність</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow 
                    key={supplier.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigateToContractor?.(supplier.contractorId)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {supplier.isPreferred && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>Основний постачальник</TooltipContent>
                          </Tooltip>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{supplier.contractorName}</p>
                          <p className="text-xs text-muted-foreground">
                            ЄДРПОУ: {supplier.contractorCode}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.supplierSku ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {supplier.supplierSku}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "font-mono font-medium",
                        supplier.price === bestPrice && "text-green-600 dark:text-green-400"
                      )}>
                        {formatNomenclaturePrice(supplier.price, supplier.currency)}
                      </span>
                      {supplier.price === bestPrice && (
                        <Badge className="ml-1.5 text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Найнижча
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {supplier.minOrderQuantity}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="flex items-center justify-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {supplier.leadTimeDays} д
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className={getReliabilityColor(supplier.reliability)}>
                                {supplier.reliability}%
                              </span>
                              <TrendingUp className={cn("h-3 w-3", getReliabilityColor(supplier.reliability))} />
                            </div>
                            <Progress 
                              value={supplier.reliability} 
                              className={cn("h-1.5", `[&>div]:${getReliabilityBgColor(supplier.reliability)}`)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Рейтинг надійності постачальника
                          {supplier.lastDeliveryDate && (
                            <p className="text-xs opacity-75">
                              Остання поставка: {new Date(supplier.lastDeliveryDate).toLocaleDateString("uk-UA")}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Notes */}
          {suppliers.some(s => s.notes) && (
            <div className="mt-3 space-y-2">
              {suppliers.filter(s => s.notes).map(supplier => (
                <div 
                  key={supplier.id}
                  className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2"
                >
                  <span className="font-medium">{supplier.contractorName}:</span>{" "}
                  {supplier.notes}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
