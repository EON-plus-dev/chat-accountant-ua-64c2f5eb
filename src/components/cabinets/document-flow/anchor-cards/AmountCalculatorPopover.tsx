/**
 * AmountCalculatorPopover Component
 * Interactive VAT calculator with currency conversion support
 */

import { useState, useMemo, useEffect } from "react";
import { Calculator, RefreshCw, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { numberToWordsUkrainian } from "@/lib/numberToWords";
import { useNBUExchangeRate } from "@/hooks/useNBUExchangeRate";

type VatMode = "without" | "plus" | "included";
type RoundingMode = "math" | "accounting";
type Currency = "UAH" | "USD" | "EUR";

interface AmountCalculatorPopoverProps {
  baseAmount: number;
  date: string;
  onAmountChange?: (amount: number, vatAmount: number, currency: Currency) => void;
  children: React.ReactNode;
}

const VAT_RATE = 0.20; // 20% VAT in Ukraine

const CURRENCY_LABELS: Record<Currency, string> = {
  UAH: "₴ UAH",
  USD: "$ USD",
  EUR: "€ EUR",
};

export function AmountCalculatorPopover({
  baseAmount,
  date,
  onAmountChange,
  children,
}: AmountCalculatorPopoverProps) {
  const [vatMode, setVatMode] = useState<VatMode>("without");
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("math");
  const [currency, setCurrency] = useState<Currency>("UAH");
  const [isOpen, setIsOpen] = useState(false);
  
  const { fetchRate, result: exchangeRate, isLoading: isLoadingRate } = useNBUExchangeRate();

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (currency !== "UAH" && date) {
      fetchRate(currency, date);
    }
  }, [currency, date, fetchRate]);

  // Calculate amounts based on VAT mode
  const { subtotal, vatAmount, total, totalInUAH } = useMemo(() => {
    let sub = baseAmount;
    let vat = 0;
    let tot = baseAmount;

    switch (vatMode) {
      case "without":
        // No VAT
        sub = baseAmount;
        vat = 0;
        tot = baseAmount;
        break;
      case "plus":
        // Add VAT on top
        sub = baseAmount;
        vat = baseAmount * VAT_RATE;
        tot = baseAmount + vat;
        break;
      case "included":
        // VAT is already included in the base amount
        tot = baseAmount;
        vat = baseAmount - (baseAmount / (1 + VAT_RATE));
        sub = baseAmount - vat;
        break;
    }

    // Apply rounding
    if (roundingMode === "accounting") {
      // Banker's rounding (round half to even)
      sub = Math.round(sub * 100) / 100;
      vat = Math.round(vat * 100) / 100;
      tot = sub + vat;
    } else {
      // Standard math rounding
      sub = Math.round(sub * 100) / 100;
      vat = Math.round(vat * 100) / 100;
      tot = Math.round(tot * 100) / 100;
    }

    // Convert to UAH if foreign currency
    let uahTotal = tot;
    if (currency !== "UAH" && exchangeRate) {
      uahTotal = tot * exchangeRate.rate;
    }

    return { subtotal: sub, vatAmount: vat, total: tot, totalInUAH: uahTotal };
  }, [baseAmount, vatMode, roundingMode, currency, exchangeRate]);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleApply = () => {
    onAmountChange?.(total, vatAmount, currency);
    setIsOpen(false);
  };

  const amountInWords = numberToWordsUkrainian(total);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Калькулятор суми</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Amount breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Підсумок:</span>
              <span className="font-medium tabular-nums">
                {formatAmount(subtotal)} {currency === "UAH" ? "₴" : currency}
              </span>
            </div>
            
            {vatMode !== "without" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ПДВ (20%){vatMode === "included" ? " вкл." : ""}:
                </span>
                <span className="font-medium tabular-nums text-warning">
                  {formatAmount(vatAmount)} {currency === "UAH" ? "₴" : currency}
                </span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between">
              <span className="font-semibold">ВСЬОГО:</span>
              <span className="text-lg font-bold tabular-nums">
                {formatAmount(total)} {currency === "UAH" ? "₴" : currency}
              </span>
            </div>
            
            {/* Amount in words */}
            <p className="text-xs text-muted-foreground italic">
              ({amountInWords})
            </p>
            
            {/* UAH equivalent for foreign currency */}
            {currency !== "UAH" && exchangeRate && (
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Еквівалент в UAH:</span>
                <span className="tabular-nums">
                  {formatAmount(totalInUAH)} ₴
                  <span className="ml-1 opacity-70">
                    (курс: {exchangeRate.rate.toFixed(4)})
                  </span>
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* VAT Mode */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Режим ПДВ</Label>
            <RadioGroup
              value={vatMode}
              onValueChange={(v) => setVatMode(v as VatMode)}
              className="grid grid-cols-3 gap-2"
            >
              <Label
                htmlFor="vat-without"
                className={cn(
                  "flex items-center justify-center px-2 py-1.5 text-xs rounded-md border cursor-pointer transition-colors",
                  vatMode === "without"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted"
                )}
              >
                <RadioGroupItem value="without" id="vat-without" className="sr-only" />
                Без ПДВ
              </Label>
              <Label
                htmlFor="vat-plus"
                className={cn(
                  "flex items-center justify-center px-2 py-1.5 text-xs rounded-md border cursor-pointer transition-colors",
                  vatMode === "plus"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted"
                )}
              >
                <RadioGroupItem value="plus" id="vat-plus" className="sr-only" />
                +ПДВ
              </Label>
              <Label
                htmlFor="vat-included"
                className={cn(
                  "flex items-center justify-center px-2 py-1.5 text-xs rounded-md border cursor-pointer transition-colors",
                  vatMode === "included"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted"
                )}
              >
                <RadioGroupItem value="included" id="vat-included" className="sr-only" />
                Вкл. ПДВ
              </Label>
            </RadioGroup>
          </div>

          {/* Currency & Rounding */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Валюта</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Округлення</Label>
              <Select value={roundingMode} onValueChange={(v) => setRoundingMode(v as RoundingMode)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math" className="text-xs">Математичне</SelectItem>
                  <SelectItem value="accounting" className="text-xs">Бухгалтерське</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rate refresh for foreign currency */}
          {currency !== "UAH" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRate(currency, date)}
              disabled={isLoadingRate}
              className="w-full text-xs h-8 gap-1.5"
            >
              <RefreshCw className={cn("h-3 w-3", isLoadingRate && "animate-spin")} />
              Оновити курс НБУ
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-muted/30">
          <Button onClick={handleApply} className="w-full gap-1.5" size="sm">
            <Check className="h-4 w-4" />
            Застосувати
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
