import { useMemo } from "react";
import { Calculator, ExternalLink, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { calculateTaxFromIncome, type TaxPayment } from "@/config/paymentsConfig";

interface TaxCalculationCardProps {
  quarterlyIncome: number;
  quarter: number;
  year: number;
  taxSystemGroup?: 3;
  taxPayments: TaxPayment[];
  onNavigateToIncomeBook?: () => void;
}

export function TaxCalculationCard({
  quarterlyIncome,
  quarter,
  year,
  taxSystemGroup = 3,
  taxPayments,
  onNavigateToIncomeBook,
}: TaxCalculationCardProps) {
  const taxCalculation = useMemo(() => {
    return calculateTaxFromIncome(quarterlyIncome, taxSystemGroup);
  }, [quarterlyIncome, taxSystemGroup]);

  // Find EP payment for this quarter
  const epPayment = useMemo(() => {
    return taxPayments.find(p => 
      p.taxType === "ep" && 
      p.period.includes(`${quarter} кв`) && 
      p.period.includes(String(year))
    );
  }, [taxPayments, quarter, year]);

  // Find ESV payment for this quarter
  const esvPayment = useMemo(() => {
    return taxPayments.find(p => 
      p.taxType === "esv" && 
      p.period.includes(`${quarter} кв`) && 
      p.period.includes(String(year))
    );
  }, [taxPayments, quarter, year]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("uk-UA").format(amount) + " ₴";
  };

  // Discrepancy calculations
  const epDiscrepancy = useMemo(() => {
    if (!epPayment) return null;
    const diff = epPayment.amountToPay - taxCalculation.epAmount;
    return {
      amount: diff,
      hasIssue: Math.abs(diff) > 100,
      type: diff > 0 ? "overpay" : diff < 0 ? "underpay" : "match",
    };
  }, [epPayment, taxCalculation.epAmount]);

  const esvDiscrepancy = useMemo(() => {
    if (!esvPayment) return null;
    const diff = esvPayment.amountToPay - taxCalculation.esvAmount;
    return {
      amount: diff,
      hasIssue: diff < -10, // Only warn if paying less than minimum
      type: diff >= 0 ? "ok" : "underpay",
    };
  }, [esvPayment, taxCalculation.esvAmount]);

  const quarterLabel = `${quarter} квартал ${year}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Розрахунок податків за {quarterLabel}
          </CardTitle>
          {(epDiscrepancy?.hasIssue || esvDiscrepancy?.hasIssue) ? (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Є розбіжності
            </Badge>
          ) : (epPayment || esvPayment) ? (
            <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Збігається
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Income base */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">База розрахунку (дохід)</p>
            <p className="text-xl font-bold tabular-nums">{formatAmount(quarterlyIncome)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Ставка ЄП</p>
            <p className="text-xl font-bold">{taxSystemGroup === 3 ? "5%" : "—"}</p>
          </div>
        </div>

        {/* EP Calculation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Єдиний податок (ЄП)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-muted-foreground cursor-help">
                    {formatAmount(quarterlyIncome)} × 5%
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Дохід × ставка ЄП для 3 групи</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Розраховано:</span>
            <span className="font-semibold tabular-nums">{formatAmount(taxCalculation.epAmount)}</span>
          </div>
          {epPayment && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">В системі:</span>
                <span className="font-medium tabular-nums">{formatAmount(epPayment.amountToPay)}</span>
              </div>
              {epDiscrepancy?.hasIssue && (
                <div className={cn(
                  "flex items-center justify-between text-sm p-2 rounded",
                  epDiscrepancy.type === "overpay" 
                    ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                )}>
                  <span>{epDiscrepancy.type === "overpay" ? "Переплата" : "Недоплата"}:</span>
                  <span className="font-medium tabular-nums">
                    {epDiscrepancy.amount > 0 ? "+" : ""}{formatAmount(epDiscrepancy.amount)}
                  </span>
                </div>
              )}
              <Progress 
                value={epPayment.status === "paid" ? 100 : 0} 
                className="h-1.5"
              />
            </>
          )}
        </div>

        {/* ESV Calculation */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ЄСВ (мінімальний)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm text-muted-foreground cursor-help">
                    22% від мін. ЗП × 3 міс
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>8000 ₴ × 22% × 3 = {formatAmount(taxCalculation.esvAmount)}</p>
                  <p className="text-xs mt-1">Мінімальна ЗП 2025: 8000 ₴</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Мінімум:</span>
            <span className="font-semibold tabular-nums">{formatAmount(taxCalculation.esvAmount)}</span>
          </div>
          {esvPayment && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">В системі:</span>
                <span className="font-medium tabular-nums">{formatAmount(esvPayment.amountToPay)}</span>
              </div>
              {esvDiscrepancy?.hasIssue && (
                <div className="flex items-center justify-between text-sm p-2 rounded bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                  <span>Менше мінімуму на:</span>
                  <span className="font-medium tabular-nums">{formatAmount(Math.abs(esvDiscrepancy.amount))}</span>
                </div>
              )}
              <Progress 
                value={esvPayment.status === "paid" ? 100 : 0} 
                className="h-1.5"
              />
            </>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="font-medium">Всього податків за квартал:</span>
          <span className="text-lg font-bold tabular-nums text-primary">
            {formatAmount(taxCalculation.epAmount + taxCalculation.esvAmount)}
          </span>
        </div>

        {/* Action */}
        {onNavigateToIncomeBook && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onNavigateToIncomeBook}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            Переглянути операції в Книзі доходів
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
