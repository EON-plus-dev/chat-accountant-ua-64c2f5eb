import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Coins,
  Calendar,
  TrendingUp,
  ArrowRightLeft,
  BookOpen,
  FileText,
  Building2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InlineSectionAlert } from "@/components/ui/InlineSectionAlert";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { validateIncomeLimit } from "@/lib/businessRules";
import { useNBUExchangeRate } from "@/hooks/useNBUExchangeRate";
import { RegulatoryBadges, extractRegulatoryStatus } from "../cards/RegulatoryBadges";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { CabinetType } from "@/types/cabinet";

interface OperationalData {
  responsibleName?: string;
  accountingPeriod?: string;
  tags?: string[];
}

interface DocumentAccountingTabProps {
  document: FlowDocument;
  cabinetType: CabinetType;
  fopGroup?: 1 | 2 | 3;
  yearlyIncome?: number;
  operationalData?: OperationalData;
  onNavigateToIncomeBook?: () => void;
  className?: string;
}

// Helper to get quarter from date
const getQuarterFromDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  return `Q${quarter} ${date.getFullYear()}`;
};

// Helper to get month label from date
const getMonthLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  return format(date, "LLLL yyyy", { locale: uk });
};

// Helper to format amount with currency
const formatAmountWithCurrency = (amount: number, currency: string): string => {
  const formatted = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
  
  const currencySymbols: Record<string, string> = {
    UAH: "грн",
    USD: "$",
    EUR: "€",
  };
  
  const symbol = currencySymbols[currency] || currency;
  return currency === "UAH" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
};

// Auto-suggest accounting account based on document type
const getAutoAccountingAccount = (doc: FlowDocument): string => {
  const accountMap: Record<string, string> = {
    invoice: "361",
    act: "703",
    contract: "631",
    payment: "311",
    "tax-invoice": "641",
    receipt: "372",
    "bank-statement": "311",
  };
  return accountMap[doc.type] || "—";
};

const operationTypeLabels: Record<string, string> = {
  income: "Дохід",
  expense: "Витрата",
  other: "Інше",
};

export const DocumentAccountingTab: React.FC<DocumentAccountingTabProps> = ({
  document,
  cabinetType,
  fopGroup,
  yearlyIncome = 0,
  operationalData,
  onNavigateToIncomeBook,
  className,
}) => {
  // State for FOP limit checkbox - default to true for income documents
  const [includeInFopLimit, setIncludeInFopLimit] = useState<boolean>(
    document.accounting?.taxCategory === "income" || document.accounting?.taxCategory === undefined
  );

  // State for TOV operation type
  const [operationType, setOperationType] = useState<string>(
    document.accounting?.taxCategory || "income"
  );

  // State for auto-fetched exchange rate
  const [autoExchangeRate, setAutoExchangeRate] = useState<{
    rate: number;
    date: string;
  } | null>(null);

  // Hook for fetching NBU rate
  const { fetchRate, isLoading: isLoadingRate, error: rateError } = useNBUExchangeRate();

  // Calculate amounts
  const currency = document.currency || "UAH";
  const amount = document.amount || 0;
  const staticExchangeRate = document.exchangeRate;
  const staticExchangeRateDate = document.exchangeRateDate;

  // Use static rate or auto-fetched rate
  const displayedExchangeRate = staticExchangeRate || autoExchangeRate?.rate;
  const displayedExchangeRateDate = staticExchangeRateDate || autoExchangeRate?.date;

  // Calculate UAH amount using displayed rate
  const calculatedAmountInUAH = useMemo(() => {
    if (document.amountInUAH) return document.amountInUAH;
    if (displayedExchangeRate && amount) {
      return amount * displayedExchangeRate;
    }
    return amount;
  }, [document.amountInUAH, displayedExchangeRate, amount]);

  const amountInUAH = calculatedAmountInUAH;

  // Handler for fetching NBU rate
  const handleFetchRate = async () => {
    if (!document.date || currency === "UAH") return;

    const result = await fetchRate(currency, document.date);
    if (result) {
      setAutoExchangeRate({
        rate: result.rate,
        date: document.date,
      });
    }
  };

  // Determine if foreign currency
  const isForeignCurrency = currency !== "UAH";

  // Get periods
  const accountingPeriod = useMemo(() => {
    if (document.period?.label) return document.period.label;
    if (operationalData?.accountingPeriod) return operationalData.accountingPeriod;
    if (document.date) return getMonthLabel(document.date);
    return "—";
  }, [document.period, operationalData?.accountingPeriod, document.date]);

  const taxPeriod = useMemo(() => {
    if (document.date) return getQuarterFromDate(document.date);
    return "—";
  }, [document.date]);

  // Get accounting account
  const accountingAccount = document.accounting?.account || getAutoAccountingAccount(document);
  const costCenter = document.accounting?.costCenter || "—";

  // Calculate FOP limit impact
  const limitImpact = useMemo(() => {
    if (cabinetType !== "fop" || !fopGroup || !includeInFopLimit) return null;

    const amountForLimit = amountInUAH;

    // Current state
    const currentValidation = validateIncomeLimit(fopGroup, yearlyIncome);

    // State after this document
    const afterValidation = validateIncomeLimit(fopGroup, yearlyIncome + amountForLimit);

    return {
      amountForLimit,
      currentStatus: currentValidation.status,
      afterStatus: afterValidation.status,
      currentPercent: currentValidation.usedPercent,
      afterPercent: afterValidation.usedPercent,
      willExceed: afterValidation.status === "exceeded",
      remainingAfter: afterValidation.remainingAmount,
      percentIncrease: afterValidation.usedPercent - currentValidation.usedPercent,
      limit: currentValidation.limit,
    };
  }, [cabinetType, fopGroup, yearlyIncome, amountInUAH, includeInFopLimit]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Block 1: Суми та валюта */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="w-4 h-4 text-primary" />
            Суми та валюта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Сума документа</span>
            <span className="text-lg font-semibold">
              {formatAmountWithCurrency(amount, currency)}
            </span>
          </div>

          {/* Exchange rate - only for foreign currency */}
          {isForeignCurrency && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Курс НБУ
                </span>
                <div className="flex items-center gap-2">
                  {displayedExchangeRate ? (
                    <>
                      <span className="font-medium">
                        {displayedExchangeRate.toFixed(4)}
                        {displayedExchangeRateDate && (
                          <span className="text-muted-foreground text-xs ml-1.5">
                            на {format(new Date(displayedExchangeRateDate), "dd.MM.yyyy")}
                          </span>
                        )}
                      </span>
                      {autoExchangeRate && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-600 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Авто
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Не вказано</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFetchRate}
                        disabled={isLoadingRate || !document.date}
                        className="h-7 text-xs"
                      >
                        {isLoadingRate ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Завантаження...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Отримати курс НБУ
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Error message */}
              {rateError && (
                <p className="text-xs text-destructive text-right">{rateError}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Сума в базовій валюті
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(amountInUAH)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Block 2: Обліковий період */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-primary" />
            Обліковий період
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Період</span>
            <span className="font-medium capitalize">{accountingPeriod}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Податковий період</span>
            <Badge variant="outline">{taxPeriod}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Податковий контекст - FOP */}
      {cabinetType === "fop" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" />
              Податковий контекст (ФОП)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Checkbox for including in FOP limit */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="include-in-limit"
                checked={includeInFopLimit}
                onCheckedChange={(checked) => setIncludeInFopLimit(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="include-in-limit"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Враховується в ліміт доходу ФОП
                </label>
                <p className="text-xs text-muted-foreground">
                  Сума буде врахована при розрахунку річного ліміту
                </p>
              </div>
            </div>

            {/* Limit impact visualization */}
            {includeInFopLimit && limitImpact && (
              <>
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Сума в ліміт</span>
                    <span className="font-semibold">
                      {formatCurrency(limitImpact.amountForLimit)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Progress 
                        value={limitImpact.afterPercent} 
                        className={cn(
                          "h-3",
                          limitImpact.willExceed && "[&>div]:bg-destructive",
                          limitImpact.afterStatus === "critical" && "[&>div]:bg-amber-500"
                        )}
                      />
                      {/* Current position marker */}
                      <div 
                        className="absolute top-0 h-3 w-0.5 bg-foreground/50"
                        style={{ left: `${Math.min(limitImpact.currentPercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {limitImpact.currentPercent.toFixed(1)}% → {limitImpact.afterPercent.toFixed(1)}%
                      </span>
                      <span className="font-medium text-foreground">
                        +{formatCurrency(limitImpact.amountForLimit)}
                      </span>
                    </div>
                  </div>

                  {/* Remaining amount */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Залишок після документа</span>
                    <span className={cn(
                      "font-medium",
                      limitImpact.remainingAfter < 0 ? "text-destructive" : "text-emerald-600"
                    )}>
                      {formatCurrency(Math.max(0, limitImpact.remainingAfter))}
                    </span>
                  </div>

                  {/* Warning if exceeding */}
                  {limitImpact.willExceed && (
                    <InlineSectionAlert
                      type="critical"
                      title="Ліміт буде перевищено"
                      description="Після врахування цього документа річний ліміт доходу ФОП буде перевищено."
                    />
                  )}

                  {limitImpact.afterStatus === "critical" && !limitImpact.willExceed && (
                    <InlineSectionAlert
                      type="warning"
                      title="Наближення до ліміту"
                      description={`Використано більше 90% річного ліміту (${limitImpact.afterPercent.toFixed(1)}%).`}
                    />
                  )}
                </div>

                {/* Navigate to Income Book */}
                {onNavigateToIncomeBook && (
                  <>
                    <Separator />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onNavigateToIncomeBook}
                      className="w-full justify-start text-primary hover:text-primary"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Переглянути в Книзі доходів
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Block 3: Податковий контекст - TOV */}
      {cabinetType === "tov" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4 text-primary" />
              Податковий контекст (ТОВ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operation type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Тип операції</span>
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Дохід</SelectItem>
                  <SelectItem value="expense">Витрата</SelectItem>
                  <SelectItem value="other">Інше</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Accounting account */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Рахунок обліку</span>
              <Badge variant="secondary" className="font-mono">
                {accountingAccount}
              </Badge>
            </div>

            {/* Cost center */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Центр витрат</span>
              <span className="text-sm font-medium">{costCenter}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block 3: Податковий контекст - Individual (simplified) */}
      {cabinetType === "individual" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-primary" />
              Податковий контекст
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Категорія</span>
              <Badge variant="outline">
                {operationTypeLabels[document.accounting?.taxCategory || "other"]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block 4: Регуляторний статус (для ФОП) */}
      {cabinetType === "fop" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="w-4 h-4 text-primary" />
              Регуляторний статус
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegulatoryBadges 
              status={extractRegulatoryStatus(cabinetType, undefined, undefined)} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentAccountingTab;
