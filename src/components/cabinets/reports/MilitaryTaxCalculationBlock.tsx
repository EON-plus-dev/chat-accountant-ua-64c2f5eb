import { Shield, Info, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { VZCalculation } from "@/config/reportsConfig";

interface MilitaryTaxCalculationBlockProps {
  calculation: VZCalculation;
  className?: string;
}

export function MilitaryTaxCalculationBlock({ calculation, className }: MilitaryTaxCalculationBlockProps) {
  const isNewRate = new Date() >= new Date("2024-12-01");
  
  const base = calculation.baseAmount;
  const rate = calculation.rate;
  const amount = calculation.calculatedVZ;
  const previousRateAmount = rate > 0 ? Math.round(base * 0.015) : undefined;

  return (
    <Card className={cn("border-amber-200 dark:border-amber-800", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Військовий збір
          </CardTitle>
          <Badge variant="secondary" className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
            {rate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNewRate && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <p className="font-medium">З 01.12.2024 діє нова ставка 1%</p>
                <p className="mt-0.5 opacity-80">Згідно ЗУ №4015-IX</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">База оподаткування</span>
            <span className="font-medium">{formatCurrency(base)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Ставка ВЗ</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">1% від чистого доходу для 3 групи ФОП</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">{rate}%</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="font-medium">ВЗ до сплати</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {previousRateAmount !== undefined && previousRateAmount > amount && (
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>За старою ставкою 1.5%</span>
              </div>
              <span className="line-through text-muted-foreground">
                {formatCurrency(previousRateAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Економія: {formatCurrency(previousRateAmount - amount)}
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Термін сплати:</span>{" "}
            Протягом 10 днів після граничного строку подання декларації
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
