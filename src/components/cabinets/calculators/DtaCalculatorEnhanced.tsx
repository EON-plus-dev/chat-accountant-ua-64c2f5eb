/**
 * DtaCalculator — Enhanced (2.2, 2.10)
 * Інтерактивний КУПО-калькулятор з конвертацією валют
 */
import { useState, useMemo } from "react";
import { Globe, Info, ArrowRight, RefreshCcw, Calculator } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface DtaCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Demo NBU rates for multiple currencies
const nbuRates: Record<string, { rate: number; label: string }> = {
  USD: { rate: 41.20, label: "Долар США" },
  EUR: { rate: 44.60, label: "Євро" },
  GBP: { rate: 52.30, label: "Фунт стерлінгів" },
  PLN: { rate: 10.05, label: "Злотий" },
  CHF: { rate: 46.10, label: "Швейцарський франк" },
  CZK: { rate: 1.72, label: "Чеська крона" },
};

// DTA treaties available
const treaties: Record<string, { name: string; pitRate: number }> = {
  PL: { name: "КУПО Україна—Польща (1993)", pitRate: 0.12 },
  DE: { name: "КУПО Україна—Німеччина (1995)", pitRate: 0.26375 },
  US: { name: "Немає КУПО", pitRate: 0.15 },
  GB: { name: "КУПО Україна—Великобританія (1993)", pitRate: 0.20 },
  CZ: { name: "КУПО Україна—Чехія (1997)", pitRate: 0.15 },
  CH: { name: "КУПО Україна—Швейцарія (2000)", pitRate: 0.15 },
};

// Demo currency conversion data
const conversions = [
  { id: "conv-1", date: "10.04.2025", from: "PLN" as const, to: "UAH" as const, amountFrom: 15000, rateActual: 10.35, rateNbu: 10.0 },
  { id: "conv-2", date: "15.07.2025", from: "PLN" as const, to: "UAH" as const, amountFrom: 25000, rateActual: 10.42, rateNbu: 10.05 },
  { id: "conv-3", date: "20.10.2025", from: "EUR" as const, to: "UAH" as const, amountFrom: 3200, rateActual: 45.10, rateNbu: 44.60 },
];

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmt2 = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const DtaCalculatorEnhanced = ({ open, onOpenChange }: DtaCalculatorProps) => {
  // Interactive inputs
  const [grossAmount, setGrossAmount] = useState(72000);
  const [currency, setCurrency] = useState("PLN");
  const [country, setCountry] = useState("PL");

  const calc = useMemo(() => {
    const rate = nbuRates[currency]?.rate || 1;
    const treaty = treaties[country];
    const foreignTaxRate = treaty?.pitRate || 0;

    const foreignTax = grossAmount * foreignTaxRate;
    const grossUah = grossAmount * rate;
    const foreignTaxUah = foreignTax * rate;
    const pitDue = Math.round(grossUah * 0.18);
    const creditCap = Math.round(Math.min(foreignTaxUah, pitDue));
    const pitToPay = Math.max(0, pitDue - creditCap);
    const milToPay = Math.round(grossUah * 0.05);
    const whtExcess = foreignTaxRate > 0.18;

    return {
      rate, foreignTaxRate, foreignTax, grossUah, foreignTaxUah,
      pitDue, creditCap, pitToPay, milToPay, whtExcess,
      treatyName: treaty?.name || "—",
    };
  }, [grossAmount, currency, country]);

  // Conversion calculations
  const convRows = conversions.map((c) => {
    const diff = c.rateActual - c.rateNbu;
    const profitUah = Math.round(c.amountFrom * diff);
    return { ...c, diff, profitUah };
  });
  const totalConvProfit = convRows.reduce((s, r) => s + r.profitUah, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            КУПО-калькулятор
            <Badge variant="info" size="sm">2.2</Badge>
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Інтерактивний розрахунок заліку податку за КУПО
          </p>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          {/* Interactive inputs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Параметри розрахунку
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Дохід (gross)</Label>
                  <Input
                    type="number"
                    value={grossAmount}
                    onChange={(e) => setGrossAmount(Number(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Валюта</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(nbuRates).map(([code, { label }]) => (
                        <SelectItem key={code} value={code}>{code} — {label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Країна / КУПО</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(treaties).map(([code, { name }]) => (
                      <SelectItem key={code} value={code}>{code} — {name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Step-by-step formula */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Покрокова формула КУПО
                <Badge variant="info" size="sm">DTA</Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Ст. 170.11 ПКУ — сума податку, сплаченого за кордоном відповідно до КУПО, зараховується у зменшення ПДФО.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{calc.treatyName}</span>
                  <Badge variant="outline" size="sm">{currency}</Badge>
                </div>

                <Table containerClassName="rounded-lg border">
                  <TableBody>
                    {/* Step 1: Gross */}
                    <TableRow>
                      <TableCell className="text-muted-foreground">① Дохід (gross)</TableCell>
                      <TableCell numeric className="font-medium">{fmt(grossAmount)} {currency}</TableCell>
                    </TableRow>
                    {/* Step 2: Foreign tax */}
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        ② Утримано PIT ({(calc.foreignTaxRate * 100).toFixed(1)}%)
                      </TableCell>
                      <TableCell numeric className="text-destructive">{fmt(calc.foreignTax)} {currency}</TableCell>
                    </TableRow>
                    {/* Step 3: NBU rate */}
                    <TableRow className="bg-muted/20">
                      <TableCell className="text-muted-foreground">③ Курс НБУ ({currency}/UAH)</TableCell>
                      <TableCell numeric>{fmt2(calc.rate)}</TableCell>
                    </TableRow>
                    {/* Step 4: Convert to UAH */}
                    <TableRow className="bg-muted/20">
                      <TableCell className="text-muted-foreground">④ Дохід в UAH = ① × ③</TableCell>
                      <TableCell numeric className="font-semibold">{fmt(calc.grossUah)} ₴</TableCell>
                    </TableRow>
                    <Separator className="my-0" />
                    {/* Step 5: UA PIT */}
                    <TableRow className="bg-muted/30">
                      <TableCell className="text-muted-foreground">⑤ ПДФО 18% = ④ × 0.18</TableCell>
                      <TableCell numeric>{fmt(calc.pitDue)} ₴</TableCell>
                    </TableRow>
                    {/* Step 6: Credit */}
                    <TableRow className="bg-muted/30">
                      <TableCell className="text-muted-foreground flex items-center gap-1">
                        ⑥ Залік (credit) = min(② × ③, ⑤)
                        <ArrowRight className="w-3 h-3" />
                      </TableCell>
                      <TableCell numeric className="text-emerald-600 dark:text-emerald-400">−{fmt(calc.creditCap)} ₴</TableCell>
                    </TableRow>
                    {/* WHT excess warning */}
                    {calc.whtExcess && (
                      <TableRow className="bg-amber-50/50 dark:bg-amber-950/20">
                        <TableCell colSpan={2} className="text-xs text-amber-700 dark:text-amber-400">
                          ⚠️ WHT ({(calc.foreignTaxRate * 100).toFixed(1)}%) перевищує 18% — залік обмежено до 18% (ст. 170.11.2 ПКУ)
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Step 7: Net PIT */}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell>⑦ ПДФО до доплати = ⑤ − ⑥</TableCell>
                      <TableCell numeric>{fmt(calc.pitToPay)} ₴</TableCell>
                    </TableRow>
                    {/* Step 8: Military levy */}
                    <TableRow className="bg-muted/50">
                      <TableCell className="text-muted-foreground">⑧ ВЗ 5% = ④ × 0.05 (без заліку)</TableCell>
                      <TableCell numeric>{fmt(calc.milToPay)} ₴</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="px-4 pb-4">
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg font-semibold text-sm">
                  <span>Разом до сплати:</span>
                  <span>ПДФО {fmt(calc.pitToPay)} ₴ + ВЗ {fmt(calc.milToPay)} ₴ = {fmt(calc.pitToPay + calc.milToPay)} ₴</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Currency conversions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Курсові різниці (конвертації WISE)
                <Badge variant="secondary" size="sm">2.10</Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      При конвертації валюти через платіжні системи (WISE, PayPal) може виникати курсова різниця відносно курсу НБУ, яка вважається додатковим доходом.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table containerClassName="rounded-b-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead compact>Дата</TableHead>
                    <TableHead compact>Операція</TableHead>
                    <TableHead compact numeric>Сума</TableHead>
                    <TableHead compact numeric>Факт. курс</TableHead>
                    <TableHead compact numeric>Курс НБУ</TableHead>
                    <TableHead compact numeric>Різниця</TableHead>
                    <TableHead compact numeric>Дохід (₴)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convRows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell compact className="text-muted-foreground">{c.date}</TableCell>
                      <TableCell compact>{c.from} → {c.to}</TableCell>
                      <TableCell compact numeric>{fmt(c.amountFrom)} {c.from}</TableCell>
                      <TableCell compact numeric>{fmt2(c.rateActual)}</TableCell>
                      <TableCell compact numeric>{fmt2(c.rateNbu)}</TableCell>
                      <TableCell compact numeric className={c.diff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                        {c.diff > 0 ? "+" : ""}{fmt2(c.diff)}
                      </TableCell>
                      <TableCell compact numeric className="font-medium">
                        {c.profitUah > 0 ? "+" : ""}{fmt(c.profitUah)} ₴
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-semibold">
                    <TableCell compact colSpan={6} className="text-right">Разом курсовий дохід:</TableCell>
                    <TableCell compact numeric>{totalConvProfit > 0 ? "+" : ""}{fmt(totalConvProfit)} ₴</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Legal note */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
            <p><strong>Ст. 170.11 ПКУ:</strong> Сума податку, сплаченого за кордоном, зараховується у зменшення ПДФО за умови наявності КУПО та підтверджуючого документа.</p>
            <p><strong>WHT Cap:</strong> Залік не може перевищувати суму ПДФО, нарахованого в Україні (18%). Надлишок WHT не повертається.</p>
            <p><strong>ВЗ 5%:</strong> Не підлягає заліку за КУПО, сплачується в повному обсязі.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
