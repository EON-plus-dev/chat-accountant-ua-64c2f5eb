/**
 * CONTRACTOR TERMS CARD
 * 
 * Умови співпраці: оплата, доставка, знижки, кредитний ліміт
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  CreditCard,
  Truck,
  Percent,
  DollarSign,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import {
  type ContractorTerms,
  paymentTermsLabels,
  deliveryTermsLabels,
} from "@/config/contractorInteractionConfig";

interface ContractorTermsCardProps {
  terms: ContractorTerms;
  onNavigateToContract?: (contractId: string) => void;
}

export const ContractorTermsCard = ({
  terms,
  onNavigateToContract,
}: ContractorTermsCardProps) => {
  const creditUsagePercent = terms.creditLimit 
    ? Math.round((terms.creditUsed || 0) / terms.creditLimit * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Умови співпраці
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Payment Terms */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Умови оплати
          </span>
          <span className="text-sm font-medium">
            {paymentTermsLabels[terms.paymentTerms]}
          </span>
        </div>

        {/* Delivery Terms */}
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Умови доставки
          </span>
          <span className="text-sm font-medium">
            {deliveryTermsLabels[terms.deliveryTerms]}
          </span>
        </div>

        {terms.deliveryAddress && (
          <div className="flex items-start justify-between py-2 border-b gap-2">
            <span className="text-sm text-muted-foreground shrink-0">Адреса доставки</span>
            <span className="text-sm text-right">{terms.deliveryAddress}</span>
          </div>
        )}

        {/* Minimum Order */}
        {terms.minOrderAmount && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Мін. замовлення
            </span>
            <span className="text-sm font-medium font-mono">
              {formatNomenclaturePrice(terms.minOrderAmount, terms.currency)}
            </span>
          </div>
        )}

        {/* Price Group / Discount */}
        {(terms.priceGroupName || terms.discountPercent) && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Цінова група
            </span>
            <div className="flex items-center gap-2">
              {terms.priceGroupName && (
                <Badge variant="secondary">{terms.priceGroupName}</Badge>
              )}
              {terms.discountPercent && terms.discountPercent > 0 && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  -{terms.discountPercent}%
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Credit Limit */}
        {terms.creditLimit && (
          <div className="py-2 border-b space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Кредитний ліміт</span>
              <span className="text-sm">
                <span className="font-mono font-medium">
                  {formatNomenclaturePrice(terms.creditUsed || 0, terms.currency)}
                </span>
                <span className="text-muted-foreground">
                  {" / "}
                  {formatNomenclaturePrice(terms.creditLimit, terms.currency)}
                </span>
              </span>
            </div>
            <Progress 
              value={creditUsagePercent} 
              className={cn(
                "h-2",
                creditUsagePercent > 80 && "[&>div]:bg-amber-500",
                creditUsagePercent > 95 && "[&>div]:bg-red-500"
              )}
            />
            <p className="text-xs text-muted-foreground text-right">
              Використано {creditUsagePercent}%
            </p>
          </div>
        )}

        {/* Contract Link */}
        {terms.contractNumber && (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Договір
            </span>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 gap-1"
              onClick={() => terms.contractId && onNavigateToContract?.(terms.contractId)}
            >
              {terms.contractNumber}
              {terms.contractDate && (
                <span className="text-muted-foreground">
                  від {new Date(terms.contractDate).toLocaleDateString("uk-UA")}
                </span>
              )}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Notes */}
        {terms.notes && (
          <>
            <Separator />
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
              💡 {terms.notes}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
