import { Scale, BookOpen, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { useIncomeBookStatus } from "@/hooks/useIncomeBookStatus";
import type { IntelligenceCardFinancialsProps } from "./types";
import type { CabinetType } from "@/types/cabinet";

export const IntelligenceCardFinancials = ({
  financials,
  documentId,
  cabinetType,
}: IntelligenceCardFinancialsProps) => {
  // Get income book status for FOP cabinets
  const incomeBookStatus = useIncomeBookStatus(
    documentId || "",
    cabinetType as CabinetType | undefined
  );

  if (!financials?.amount) {
    return null;
  }

  const showIncomeBookSection = cabinetType === "fop";

  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
      {/* Main amount */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Сума</span>
        <div className="text-right">
          <span className="text-lg font-bold">
            {financials.currency !== "UAH" 
              ? `${financials.amount.toLocaleString("uk-UA")} ${financials.currency}` 
              : formatCurrency(financials.amount)
            }
          </span>
          {financials.vatIncluded && (
            <span className="text-xs text-muted-foreground ml-1">(в т.ч. ПДВ)</span>
          )}
        </div>
      </div>
      
      {/* Exchange rate for foreign currency */}
      {financials.currency !== "UAH" && financials.exchangeRate && (
        <>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <a 
                href={financials.exchangeRateDate 
                  ? `https://bank.gov.ua/ua/markets/exchangerates?date=${financials.exchangeRateDate}`
                  : "https://bank.gov.ua/ua/markets/exchangerates"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                Курс НБУ <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </span>
            <span className="font-medium">
              {financials.exchangeRate.toFixed(4)} 
              {financials.exchangeRateDate && (
                <span className="text-muted-foreground ml-1">
                  на {format(new Date(financials.exchangeRateDate), "dd.MM.yyyy")}
                </span>
              )}
            </span>
          </div>
          {financials.amountInUAH && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Еквівалент в UAH</span>
              <span className="font-bold text-primary">
                {formatCurrency(financials.amountInUAH)}
              </span>
            </div>
          )}
        </>
      )}
      
      {/* Income Book Status - only for FOP */}
      {showIncomeBookSection && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Книга доходів
              </span>
              {incomeBookStatus.isLinked ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-300 gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Враховано
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
                  <Clock className="w-3 h-3" />
                  Очікує
                </Badge>
              )}
            </div>
            
            {incomeBookStatus.isLinked && incomeBookStatus.linkedRecord && (
              <div className="text-xs text-muted-foreground">
                Запис #{incomeBookStatus.linkedRecord.id.slice(-4)} від{" "}
                {format(new Date(incomeBookStatus.linkedRecord.date), "dd.MM.yyyy")}
              </div>
            )}
            
            {/* Limit Impact for FOP */}
            {incomeBookStatus.includedInLimit && incomeBookStatus.limitImpact && (
              <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Вплив на ліміт ЄП</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    +{formatCurrency(incomeBookStatus.limitImpact.amount)}
                  </span>
                </div>
                <Progress 
                  value={incomeBookStatus.limitImpact.percentOfLimit} 
                  className="h-1.5 mt-1.5 [&>div]:bg-blue-500" 
                />
                <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                  {incomeBookStatus.limitImpact.percentOfLimit.toFixed(2)}% від річного ліміту
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Tax Period for TOV */}
      {cabinetType === "tov" && incomeBookStatus.taxPeriod && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Період обліку</span>
          <Badge variant="secondary">{incomeBookStatus.taxPeriod}</Badge>
        </div>
      )}
    </div>
  );
};
