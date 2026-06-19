import { Globe, Info, ArrowRight, RefreshCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface DtaCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Demo DTA data (Poland - Ukraine treaty)
const dtaIncome = [
  {
    id: "dta-1",
    source: "IT Solutions Sp. z o.o.",
    country: "Польща",
    treaty: "КУПО Україна—Польща (1996)",
    grossForeign: 72000,
    currencyCode: "PLN",
    foreignTaxRate: 0.12,
    nbuRate: 10.0,
    uaPitRate: 0.18,
    uaMilRate: 0.05,
  },
];

// Demo currency conversion data
const conversions = [
  {
    id: "conv-1",
    date: "10.04.2024",
    from: "PLN",
    to: "UAH",
    amountFrom: 15000,
    rateActual: 10.35,
    rateNbu: 10.0,
    amountTo: 155250,
  },
  {
    id: "conv-2",
    date: "15.07.2024",
    from: "PLN",
    to: "UAH",
    amountFrom: 25000,
    rateActual: 10.42,
    rateNbu: 10.05,
    amountTo: 260500,
  },
  {
    id: "conv-3",
    date: "20.10.2024",
    from: "PLN",
    to: "UAH",
    amountFrom: 32000,
    rateActual: 10.50,
    rateNbu: 10.10,
    amountTo: 336000,
  },
];

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmt2 = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const DtaCalculator = ({ open, onOpenChange }: DtaCalculatorProps) => {
  // DTA calculations
  const dtaRows = dtaIncome.map((d) => {
    const foreignTax = d.grossForeign * d.foreignTaxRate;
    const grossUah = d.grossForeign * d.nbuRate;
    const foreignTaxUah = foreignTax * d.nbuRate;
    const pitDue = Math.round(grossUah * d.uaPitRate);
    const credit = Math.min(foreignTaxUah, pitDue);
    const pitToPay = Math.max(0, pitDue - Math.round(credit));
    const milToPay = Math.round(grossUah * d.uaMilRate);
    return { ...d, foreignTax, grossUah, foreignTaxUah, pitDue, credit: Math.round(credit), pitToPay, milToPay };
  });

  const totalPitToPay = dtaRows.reduce((s, r) => s + r.pitToPay, 0);
  const totalMilToPay = dtaRows.reduce((s, r) => s + r.milToPay, 0);

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
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Розрахунок заліку податку за конвенцією про уникнення подвійного оподаткування
          </p>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          {/* Section 1: DTA Treaty */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Іноземний дохід (КУПО)
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
              {dtaRows.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{r.source}</div>
                      <div className="text-xs text-muted-foreground">{r.country} · {r.treaty}</div>
                    </div>
                    <Badge variant="outline" size="sm">{r.currencyCode}</Badge>
                  </div>

                  <Table containerClassName="rounded-lg border">
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-muted-foreground">Дохід (gross)</TableCell>
                        <TableCell numeric className="font-medium">{fmt(r.grossForeign)} {r.currencyCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">Утримано PIT ({(r.foreignTaxRate * 100)}%)</TableCell>
                        <TableCell numeric className="text-destructive">{fmt(r.foreignTax)} {r.currencyCode}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">Курс НБУ ({r.currencyCode}/UAH)</TableCell>
                        <TableCell numeric>{fmt2(r.nbuRate)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">Дохід в UAH</TableCell>
                        <TableCell numeric className="font-semibold">{fmt(r.grossUah)} ₴</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/30">
                        <TableCell className="text-muted-foreground">ПДФО 18%</TableCell>
                        <TableCell numeric>{fmt(r.pitDue)} ₴</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/30">
                        <TableCell className="text-muted-foreground flex items-center gap-1">
                          Залік (credit)
                          <ArrowRight className="w-3 h-3" />
                        </TableCell>
                        <TableCell numeric className="text-emerald-600 dark:text-emerald-400">−{fmt(r.credit)} ₴</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell>ПДФО до доплати ({(r.uaPitRate * 100 - r.foreignTaxRate * 100)}%)</TableCell>
                        <TableCell numeric>{fmt(r.pitToPay)} ₴</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableCell className="text-muted-foreground">ВЗ 5% (без заліку)</TableCell>
                        <TableCell numeric>{fmt(r.milToPay)} ₴</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}

              <div className="px-4 pb-4">
                <div className="flex justify-between p-3 bg-muted/50 rounded-lg font-semibold text-sm">
                  <span>Разом до сплати:</span>
                  <span>ПДФО {fmt(totalPitToPay)} ₴ + ВЗ {fmt(totalMilToPay)} ₴ = {fmt(totalPitToPay + totalMilToPay)} ₴</span>
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
            <p><strong>Ст. 170.11 ПКУ:</strong> Сума податку, сплаченого за кордоном, зараховується у зменшення ПДФО за умови наявності КУПО та підтверджуючого документа (сертифікат, довідка).</p>
            <p><strong>КУПО Україна—Польща:</strong> Конвенція від 12.01.1993. PIT сплачений у Польщі (12%) зараховується проти ПДФО (18%). Різниця 6% підлягає доплаті в Україні.</p>
            <p><strong>ВЗ 5%:</strong> Не підлягає заліку за КУПО, сплачується в повному обсязі.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
