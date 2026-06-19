/**
 * NOMENCLATURE WARRANTY TAB
 * 
 * Гарантія, повернення та після-гарантійний сервіс
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  RotateCcw,
  Wrench,
  Award,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import {
  warrantyTypeLabels,
  returnPolicyLabels,
} from "@/config/nomenclatureConfig";
import { cn } from "@/lib/utils";

interface NomenclatureWarrantyTabProps {
  item: NomenclatureItemV2;
}

export const NomenclatureWarrantyTab = ({ item }: NomenclatureWarrantyTabProps) => {
  const service = item.productService;
  
  const hasWarranty = service?.warrantyMonths && service.warrantyMonths > 0;
  const hasReturn = service?.returnPolicy && service.returnPolicy !== "none";
  const hasAfterWarranty = service?.afterWarrantyService;
  const hasCertificates = service?.certificates && service.certificates.length > 0;
  
  const hasAnyData = hasWarranty || hasReturn || hasAfterWarranty || hasCertificates;

  if (!hasAnyData) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Інформація про гарантію не вказана</p>
            <p className="text-xs mt-1 max-w-xs mx-auto">
              Додайте умови гарантії, повернення та сервісного обслуговування для цього товару
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warranty Card */}
      {hasWarranty && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Гарантія
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Термін гарантії
              </span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30">
                {service.warrantyMonths} {service.warrantyMonths === 1 ? "місяць" : 
                  service.warrantyMonths! < 5 ? "місяці" : "місяців"}
              </Badge>
            </div>
            
            {service.warrantyType && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Тип</span>
                <span className="text-sm font-medium">
                  {warrantyTypeLabels[service.warrantyType]}
                </span>
              </div>
            )}
            
            {service.warrantyNotes && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Умови гарантії</p>
                  <p className="text-sm">{service.warrantyNotes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Return Policy Card */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Повернення
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {service?.returnDays && service.returnDays > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Термін повернення
              </span>
              <Badge variant="outline">
                {service.returnDays} {service.returnDays === 1 ? "день" : 
                  service.returnDays < 5 ? "дні" : "днів"}
              </Badge>
            </div>
          ) : null}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Умови</span>
            <div className="flex items-center gap-1.5">
              {service?.returnPolicy === "full" && (
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              )}
              {service?.returnPolicy === "exchange" && (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              )}
              {(!service?.returnPolicy || service.returnPolicy === "none") && (
                <XCircle className="h-3.5 w-3.5 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                service?.returnPolicy === "full" && "text-green-600",
                service?.returnPolicy === "exchange" && "text-amber-600",
                (!service?.returnPolicy || service.returnPolicy === "none") && "text-red-600",
              )}>
                {service?.returnPolicy ? returnPolicyLabels[service.returnPolicy] : "Без повернення"}
              </span>
            </div>
          </div>
          
          {service?.returnNotes && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Примітки</p>
                <p className="text-sm">{service.returnNotes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* After-Warranty Service Card */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Після-гарантійний сервіс
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Доступний</span>
            <div className="flex items-center gap-1.5">
              {hasAfterWarranty ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Так</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Ні</span>
                </>
              )}
            </div>
          </div>
          
          {service?.serviceCenter && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Сервісний центр</span>
              <span className="text-sm font-medium">{service.serviceCenter}</span>
            </div>
          )}
          
          {service?.serviceCenterContact && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Контакти
              </span>
              <span className="text-sm font-mono">{service.serviceCenterContact}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates Card */}
      {hasCertificates && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              Сертифікати
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {service.certificates!.map((cert, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiration Date */}
      {service?.expirationDate && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Термін придатності
              </span>
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                до {new Date(service.expirationDate).toLocaleDateString("uk-UA")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
