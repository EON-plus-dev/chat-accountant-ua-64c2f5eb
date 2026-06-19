/**
 * PositionCurrencySection Component
 * Currency selector with NBU exchange rate display and auto-fetch
 */

import { useEffect, useState } from "react";
import { RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNBUExchangeRate } from "@/hooks/useNBUExchangeRate";
import { 
  getActiveCurrencies, 
  getCurrencySymbol,
  type PositionCurrency 
} from "@/config/currencyConfig";

interface PositionCurrencySectionProps {
  currency: PositionCurrency;
  exchangeRate?: number;
  exchangeRateDate?: string;
  documentDate: string;
  priceInUAH?: number;
  onCurrencyChange: (currency: PositionCurrency) => void;
  onExchangeRateChange: (rate: number, date: string) => void;
}

// Get active currencies for selector
const activeCurrencies = getActiveCurrencies();

export function PositionCurrencySection({
  currency,
  exchangeRate,
  exchangeRateDate,
  documentDate,
  priceInUAH,
  onCurrencyChange,
  onExchangeRateChange,
}: PositionCurrencySectionProps) {
  const { fetchRate, isLoading, error } = useNBUExchangeRate();
  const [manualRate, setManualRate] = useState<string>("");

  // Auto-fetch rate when currency or date changes
  useEffect(() => {
    if (currency !== "UAH" && documentDate) {
      handleFetchRate();
    }
  }, [currency, documentDate]);

  const handleFetchRate = async () => {
    if (currency === "UAH" || !documentDate) return;
    
    const result = await fetchRate(currency, documentDate);
    if (result) {
      onExchangeRateChange(result.rate, result.date);
      setManualRate("");
    }
  };

  const handleCurrencyChange = (newCurrency: PositionCurrency) => {
    onCurrencyChange(newCurrency);
    if (newCurrency === "UAH") {
      onExchangeRateChange(1, "");
    }
  };

  const handleManualRateChange = (value: string) => {
    setManualRate(value);
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate > 0) {
      onExchangeRateChange(rate, "Ручний ввід");
    }
  };

  const formatRate = (rate: number) => rate.toFixed(4);
  
  const formatAmount = (amount: number) =>
    amount.toLocaleString("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Don't show currency section for UAH
  if (currency === "UAH") {
    return (
      <div>
        <Label className="text-xs text-muted-foreground">Валюта</Label>
        <Select value={currency} onValueChange={(v) => handleCurrencyChange(v as PositionCurrency)}>
          <SelectTrigger className="h-9 mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activeCurrencies.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Currency selector */}
      <div>
        <Label className="text-xs text-muted-foreground">Валюта</Label>
        <Select value={currency} onValueChange={(v) => handleCurrencyChange(v as PositionCurrency)}>
          <SelectTrigger className="h-9 mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activeCurrencies.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exchange rate section */}
      <div className="p-3 rounded-lg bg-muted/50 border border-dashed space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Курс НБУ</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleFetchRate}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")} />
            Оновити
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
            <div className="flex gap-2 items-center">
              <Label className="text-xs text-muted-foreground shrink-0">Ввести вручну:</Label>
              <Input
                type="number"
                value={manualRate}
                onChange={(e) => handleManualRateChange(e.target.value)}
                className="h-7 text-xs"
                placeholder="41.25"
                step={0.0001}
              />
            </div>
          </div>
        ) : exchangeRate && exchangeRate > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm font-mono">
                1 {currency} = {formatRate(exchangeRate)} ₴
              </Badge>
            </div>
            {exchangeRateDate && (
              <p className="text-xs text-muted-foreground">
                📅 {exchangeRateDate}
              </p>
            )}
            {priceInUAH !== undefined && priceInUAH > 0 && (
              <p className="text-xs text-success font-medium">
                💰 Ціна в UAH: {formatAmount(priceInUAH)} ₴
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Оберіть дату документа для отримання курсу
          </p>
        )}
      </div>
    </div>
  );
}
