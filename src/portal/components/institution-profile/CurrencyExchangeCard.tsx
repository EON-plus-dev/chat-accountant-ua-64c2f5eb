import { TrendingUp, TrendingDown, Minus, ChevronDown, ArrowRightLeft, MapPin, CalendarIcon, ExternalLink, ArrowUpDown } from "lucide-react";
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNBUFinderRates } from "@/hooks/useNBUFinderRates";
import type { InstitutionProduct, FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import { ProductDocuments } from "./ProductDocuments";

const DISPLAY_CURRENCIES = ["USD", "EUR", "GBP", "PLN"];
const BANK_SPREAD = 0.005;

interface Props {
  product: InstitutionProduct;
  profile: FullInstitutionProfile;
}

export const CurrencyExchangeCard = ({ product, profile }: Props) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [convertCurrency, setConvertCurrency] = useState("USD");
  const [amountForeign, setAmountForeign] = useState("1000");
  const [amountUAH, setAmountUAH] = useState("");
  const [editingField, setEditingField] = useState<"foreign" | "uah">("foreign");

  // Order form
  const [orderCurrency, setOrderCurrency] = useState("USD");
  const [orderAmount, setOrderAmount] = useState("500");
  const [orderCity, setOrderCity] = useState("");
  const [orderDate, setOrderDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });

  const { rates, isLive, lastUpdated } = useNBUFinderRates("USD");

  const getEffectiveRate = useCallback((cc: string) => {
    const r = rates.get(cc);
    if (!r) return null;
    const buyRate = +(r.rate * (1 - BANK_SPREAD)).toFixed(4);
    const sellRate = +(r.rate * (1 + BANK_SPREAD)).toFixed(4);
    return { nbu: r.rate, buy: buyRate, sell: sellRate, change: r.change };
  }, [rates]);

  const effectiveRate = getEffectiveRate(convertCurrency);
  const currentRate = effectiveRate
    ? direction === "buy" ? effectiveRate.sell : effectiveRate.buy
    : 0;

  // Auto-calculate based on which field user is editing
  const foreignNum = parseFloat(amountForeign.replace(/[^\d.]/g, "")) || 0;
  const uahNum = parseFloat(amountUAH.replace(/[^\d.]/g, "")) || 0;

  const computedUAH = editingField === "foreign" ? Math.round(foreignNum * currentRate) : uahNum;
  const computedForeign = editingField === "uah" && currentRate > 0
    ? +(uahNum / currentRate).toFixed(2)
    : foreignNum;

  const displayUAH = editingField === "foreign" ? computedUAH : uahNum;
  const displayForeign = editingField === "uah" ? computedForeign : foreignNum;

  return (
    <Card className="p-3 space-y-3">
      {/* Header + rates grid */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
            {isLive && (
              <Badge variant="success" size="sm" className="text-[10px] gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground">
              Курси НБУ · {lastUpdated.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {DISPLAY_CURRENCIES.map((cc) => {
            const r = rates.get(cc);
            if (!r) return null;
            const isUp = r.change > 0;
            const isDown = r.change < 0;
            return (
              <div key={cc} className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/20 px-2 py-1.5">
                <span className="text-xs font-semibold text-foreground w-8">{cc}</span>
                <span className="text-xs font-mono font-bold text-foreground flex-1">{r.rate.toFixed(4)}</span>
                <span className={`text-[10px] font-mono flex items-center gap-0.5 ${isUp ? "text-emerald-600 dark:text-emerald-400" : isDown ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {isUp ? "+" : ""}{r.change.toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Converter — always visible */}
      <div className="border-t border-border/50 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary" /> Конвертер
          </p>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setDirection("buy")}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${direction === "buy" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
            >
              Купую
            </button>
            <button
              onClick={() => setDirection("sell")}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${direction === "sell" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
            >
              Продаю
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5">
            <Input
              type="text"
              className="h-8 text-xs font-mono flex-1"
              value={editingField === "foreign" ? amountForeign : displayForeign.toLocaleString("uk-UA")}
              onFocus={() => setEditingField("foreign")}
              onChange={e => {
                setEditingField("foreign");
                setAmountForeign(e.target.value.replace(/[^\d.]/g, ""));
              }}
            />
            <Select value={convertCurrency} onValueChange={setConvertCurrency}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_CURRENCIES.map(cc => (
                  <SelectItem key={cc} value={cc} className="text-xs">{cc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />

          <div className="flex-1 flex items-center gap-1.5">
            <Input
              type="text"
              className="h-8 text-xs font-mono flex-1"
              value={editingField === "uah" ? amountUAH : displayUAH.toLocaleString("uk-UA")}
              onFocus={() => setEditingField("uah")}
              onChange={e => {
                setEditingField("uah");
                setAmountUAH(e.target.value.replace(/[^\d.]/g, ""));
              }}
            />
            <span className="text-xs font-semibold text-muted-foreground w-10">UAH</span>
          </div>
        </div>

        {effectiveRate && (
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Курс НБУ: {effectiveRate.nbu.toFixed(4)}</span>
            <span>·</span>
            <span>
              Орієнтовний курс банку: ~{currentRate.toFixed(4)}
              <span className="ml-1 opacity-70">({direction === "buy" ? "продаж" : "купівля"})</span>
            </span>
          </div>
        )}
      </div>

      {/* Order currency at branch */}
      <div className="border-t border-border/50 pt-3">
        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
          <MapPin className="w-3.5 h-3.5 text-primary" /> Замовити валюту у відділення
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Валюта</label>
            <Select value={orderCurrency} onValueChange={setOrderCurrency}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_CURRENCIES.map(cc => (
                  <SelectItem key={cc} value={cc} className="text-xs">{cc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Сума</label>
            <Input
              type="text"
              className="h-8 text-xs font-mono"
              value={orderAmount}
              onChange={e => setOrderAmount(e.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Місто / відділення</label>
            <Input
              type="text"
              className="h-8 text-xs"
              placeholder="напр. Київ, №123"
              value={orderCity}
              onChange={e => setOrderCity(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Дата</label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={orderDate}
              onChange={e => setOrderDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            ⚠ Замовлення через онлайн-банкінг
          </p>
          {product.ctaUrl && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
              <a href={product.ctaUrl} target="_blank" rel="noopener noreferrer">
                {product.ctaLabel || "Перейти"} <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible details */}
      {product.benefits && product.benefits.length > 0 && (
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors border-t border-border/50 pt-2 w-full">
            <ChevronDown className={`w-3 h-3 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
            <span>{detailsOpen ? "Згорнути" : "Детальніше"}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <ul className="space-y-0.5">
              {product.benefits.map((b, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <ProductDocuments product={product} profile={profile} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};
