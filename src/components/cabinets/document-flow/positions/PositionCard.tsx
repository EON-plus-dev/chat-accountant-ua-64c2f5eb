/**
 * PositionCard Component
 * Single position item with drag handle, discount, VAT, currency, and actions
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ExtendedDocumentPosition, DiscountType, VatRate } from "@/types/extendedPosition";
import { calculatePositionAmounts } from "@/types/extendedPosition";
import { PositionCurrencySection } from "./PositionCurrencySection";
import { 
  getActiveCurrencies, 
  getCurrencySymbol,
  type PositionCurrency 
} from "@/config/currencyConfig";
import { getUnitOptions } from "@/config/unitsConfig";

interface PositionCardProps {
  position: ExtendedDocumentPosition;
  index: number;
  documentDate: string;
  onUpdate: (id: string, field: keyof ExtendedDocumentPosition, value: string | number) => void;
  onRemove: (id: string) => void;
  onClone: (id: string) => void;
  onCurrencyUpdate: (id: string, currency: PositionCurrency, rate: number, rateDate: string) => void;
}

// Get active currencies and units from config
const activeCurrencies = getActiveCurrencies();
const unitOptions = getUnitOptions();

export function PositionCard({
  position,
  index,
  documentDate,
  onUpdate,
  onRemove,
  onClone,
  onCurrencyUpdate,
}: PositionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: position.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate amounts
  const calculated = calculatePositionAmounts(position);
  const hasDiscount = (position.discountValue || 0) > 0;
  const hasVat = (position.vatRate || 0) > 0;
  const currency = position.currency || "UAH";
  const symbol = getCurrencySymbol(currency);
  const isForeignCurrency = currency !== "UAH";

  const formatAmount = (amount: number) =>
    amount.toLocaleString("uk-UA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleCurrencyChange = (newCurrency: PositionCurrency) => {
    onCurrencyUpdate(position.id, newCurrency, newCurrency === "UAH" ? 1 : (position.exchangeRate || 0), position.exchangeRateDate || "");
  };

  const handleExchangeRateChange = (rate: number, rateDate: string) => {
    onCurrencyUpdate(position.id, currency, rate, rateDate);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 rounded-lg border bg-card transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/20 z-10"
      )}
    >
      {/* Header row with drag handle and actions */}
      <div className="flex items-center gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 -ml-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <Badge variant="secondary" className="shrink-0 text-xs">
          #{index + 1}
        </Badge>
        
        <div className="flex-1" />
        
        {/* Quick indicators */}
        {isForeignCurrency && (
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
            {currency}
          </Badge>
        )}
        {hasDiscount && (
          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
            -{position.discountValue}{position.discountType === "percent" ? "%" : symbol}
          </Badge>
        )}
        {hasVat && (
          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
            ПДВ {position.vatRate}%
          </Badge>
        )}
        
        {/* Actions */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onClone(position.id)}
          title="Дублювати"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(position.id)}
          title="Видалити"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Name field */}
      <div className="mb-3">
        <Label className="text-xs text-muted-foreground">Назва</Label>
        <Input
          value={position.name}
          onChange={(e) => onUpdate(position.id, "name", e.target.value)}
          placeholder="Назва товару/послуги"
          className="h-9 mt-1"
        />
      </div>

      {/* Main fields row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <div>
          <Label className="text-xs text-muted-foreground">Кількість</Label>
          <Input
            type="number"
            value={position.quantity || ""}
            onChange={(e) =>
              onUpdate(position.id, "quantity", parseFloat(e.target.value) || 0)
            }
            className="h-9 mt-1"
            min={0}
            step={0.01}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Одиниця</Label>
          <Input
            value={position.unit}
            onChange={(e) => onUpdate(position.id, "unit", e.target.value)}
            className="h-9 mt-1"
            placeholder="шт"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Ціна</Label>
          <Input
            type="number"
            value={position.price || ""}
            onChange={(e) =>
              onUpdate(position.id, "price", parseFloat(e.target.value) || 0)
            }
            className="h-9 mt-1"
            min={0}
            step={0.01}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Валюта</Label>
          <Select 
            value={currency} 
            onValueChange={(v) => handleCurrencyChange(v as PositionCurrency)}
          >
            <SelectTrigger className="h-9 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeCurrencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Currency exchange rate info (for foreign currencies) */}
      {isForeignCurrency && position.exchangeRate && position.exchangeRate > 0 && (
        <div className="mb-2 p-2 rounded-md bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              💱 Курс: {position.exchangeRate.toFixed(4)} ₴/{currency}
              {position.exchangeRateDate && (
                <span className="ml-1 text-muted-foreground/70">({position.exchangeRateDate})</span>
              )}
            </span>
            <span className="font-medium text-primary">
              = {formatAmount(calculated.priceInUAH || 0)} ₴
            </span>
          </div>
        </div>
      )}

      {/* Expandable section for discount/VAT/Currency */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Приховати налаштування
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Знижка, ПДВ та курс
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-2 space-y-3">
          {/* Discount row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Знижка</Label>
              <div className="flex gap-1.5 mt-1">
                <Input
                  type="number"
                  value={position.discountValue || ""}
                  onChange={(e) =>
                    onUpdate(position.id, "discountValue", parseFloat(e.target.value) || 0)
                  }
                  className="h-9 flex-1"
                  min={0}
                  step={0.01}
                  placeholder="0"
                />
                <Select
                  value={position.discountType || "percent"}
                  onValueChange={(v) => onUpdate(position.id, "discountType", v as DiscountType)}
                >
                  <SelectTrigger className="h-9 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="fixed">{symbol}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">ПДВ</Label>
              <Select
                value={String(position.vatRate || 0)}
                onValueChange={(v) => onUpdate(position.id, "vatRate", parseInt(v) as VatRate)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Без ПДВ</SelectItem>
                  <SelectItem value="7">7%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Currency section (only for foreign currencies) */}
          {isForeignCurrency && (
            <PositionCurrencySection
              currency={currency}
              exchangeRate={position.exchangeRate}
              exchangeRateDate={position.exchangeRateDate}
              documentDate={documentDate}
              priceInUAH={calculated.priceInUAH}
              onCurrencyChange={handleCurrencyChange}
              onExchangeRateChange={handleExchangeRateChange}
            />
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Amount summary */}
      <div className="flex flex-col items-end pt-2 border-t mt-2 space-y-0.5">
        {hasDiscount && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Знижка:</span>
            <span className="text-success font-medium tabular-nums">
              -{formatAmount(calculated.discountAmount || 0)} {symbol}
            </span>
          </div>
        )}
        {hasVat && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">ПДВ:</span>
            <span className="text-warning font-medium tabular-nums">
              +{formatAmount(calculated.vatAmount || 0)} {symbol}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            = {formatAmount(calculated.grossAmount || calculated.amount)} {symbol}
          </span>
        </div>
        {/* UAH equivalent for foreign currencies */}
        {isForeignCurrency && position.exchangeRate && position.exchangeRate > 0 && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <span className="text-muted-foreground">В UAH:</span>
            <span className="font-medium tabular-nums">
              {formatAmount(calculated.grossAmountInUAH || calculated.amountInUAH || 0)} ₴
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
