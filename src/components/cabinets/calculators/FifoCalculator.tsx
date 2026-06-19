import { Calculator, Info, TrendingUp, CreditCard, AlertTriangle, Layers } from "lucide-react";
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
import {
  investmentPositions,
  multiLotBuyLots,
  multiLotSellPosition,
  calculateFifoResult,
  calculateDividendResult,
  calculateMultiLotFifo,
  type FifoResult,
  type DividendResult,
} from "@/config/demoCabinets/investmentData";

interface FifoCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export const FifoCalculator = ({ open, onOpenChange }: FifoCalculatorProps) => {
  // Single-lot FIFO
  const fifoRows: FifoResult[] = investmentPositions
    .filter(p => p.operationType === "sell")
    .map(calculateFifoResult)
    .filter(Boolean) as FifoResult[];

  const totalPlUah = fifoRows.reduce((s, r) => s + r.plUah, 0);
  const totalPit = fifoRows.reduce((s, r) => s + r.pit18, 0);
  const totalMil = fifoRows.reduce((s, r) => s + r.mil5, 0);
  const hasLosses = fifoRows.some(r => r.isLoss);
  const netPlUah = Math.max(0, totalPlUah);

  // Multi-lot FIFO (Amazon)
  const multiLotResult = calculateMultiLotFifo(multiLotBuyLots, multiLotSellPosition);

  // WHT
  const whtRows: DividendResult[] = investmentPositions
    .filter(p => p.operationType === "dividend")
    .map(calculateDividendResult)
    .filter(Boolean) as DividendResult[];

  // Corporate actions
  const corporateActions = investmentPositions.filter(p => p.corporateAction);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            FIFO-калькулятор інвестицій
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Розрахунок інвестиційного прибутку та заліку утриманого податку (ст. 170.2 ПКУ)
          </p>
        </SheetHeader>

        <div className="flex-1 space-y-6">
          {/* Corporate actions alert */}
          {corporateActions.length > 0 && (
            <div className="text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-1">
              <p className="font-medium text-amber-800 dark:text-amber-300">Corporate Actions</p>
              {corporateActions.map(p => (
                <p key={p.id} className="text-amber-700 dark:text-amber-400">
                  <strong>{p.ticker}:</strong> {p.corporateAction!.description}
                </p>
              ))}
            </div>
          )}

          {/* Section 1: Single-lot FIFO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Реалізовані операції (FIFO)
                <Badge variant="info" size="sm">FIFO</Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Метод FIFO (First In, First Out) — ст. 170.2 ПКУ. Дохід за курсом НБУ на дату продажу, витрати — на дату придбання.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table containerClassName="rounded-b-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead compact>Актив</TableHead>
                    <TableHead compact>Купівля</TableHead>
                    <TableHead compact numeric>К-сть</TableHead>
                    <TableHead compact numeric>Buy ($)</TableHead>
                    <TableHead compact numeric>Курс ₴</TableHead>
                    <TableHead compact>Продаж</TableHead>
                    <TableHead compact numeric>Sell ($)</TableHead>
                    <TableHead compact numeric>Курс ₴</TableHead>
                    <TableHead compact numeric>Коміс.</TableHead>
                    <TableHead compact numeric>P&L (₴)</TableHead>
                    <TableHead compact numeric>ПДФО 18%</TableHead>
                    <TableHead compact numeric>ВЗ 5%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fifoRows.map((r) => (
                    <TableRow key={r.position.id}>
                      <TableCell compact className="font-medium">{r.position.ticker}</TableCell>
                      <TableCell compact className="text-muted-foreground">{r.position.buyDate}</TableCell>
                      <TableCell compact numeric>{r.position.buyQty}</TableCell>
                      <TableCell compact numeric>{fmtUsd(r.position.buyPriceUsd)}</TableCell>
                      <TableCell compact numeric className="text-muted-foreground">{r.position.nbuRateBuy}</TableCell>
                      <TableCell compact className="text-muted-foreground">{r.position.sellDate}</TableCell>
                      <TableCell compact numeric>{fmtUsd(r.position.sellPriceUsd!)}</TableCell>
                      <TableCell compact numeric className="text-muted-foreground">{r.position.nbuRateSell}</TableCell>
                      <TableCell compact numeric className="text-muted-foreground">
                        {fmtUsd((r.position.buyCommission || 0) + (r.position.sellCommission || 0))}
                      </TableCell>
                      <TableCell compact numeric className={r.isLoss ? "text-destructive font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                        {r.isLoss ? "" : "+"}{fmt(r.plUah)}
                      </TableCell>
                      <TableCell compact numeric>{fmt(r.pit18)}</TableCell>
                      <TableCell compact numeric>{fmt(r.mil5)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="font-semibold">
                    <TableCell compact colSpan={9} className="text-right">Разом:</TableCell>
                    <TableCell compact numeric>{fmt(totalPlUah)} ₴</TableCell>
                    <TableCell compact numeric>{fmt(totalPit)} ₴</TableCell>
                    <TableCell compact numeric>{fmt(totalMil)} ₴</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {hasLosses && (
            <div className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">Інвестиційні збитки (ст. 170.2.6 ПКУ)</p>
                <p className="text-amber-700 dark:text-amber-400">
                  Збиток від окремих операцій зменшує загальний інвестиційний прибуток у межах звітного року.
                  Чистий оподатковуваний прибуток: {fmt(netPlUah)} ₴.
                </p>
              </div>
            </div>
          )}

          {/* Section 2: Multi-lot FIFO */}
          {multiLotResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Multi-lot FIFO: {multiLotSellPosition.ticker}
                  <Badge variant="warning" size="sm">{multiLotResult.matches.length} лотів</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table containerClassName="rounded-b-lg">
                  <TableHeader>
                    <TableRow>
                      <TableHead compact>Лот (дата купівлі)</TableHead>
                      <TableHead compact numeric>К-сть</TableHead>
                      <TableHead compact numeric>Buy ($)</TableHead>
                      <TableHead compact numeric>Курс ₴</TableHead>
                      <TableHead compact numeric>Витрати (₴)</TableHead>
                      <TableHead compact numeric>Дохід (₴)</TableHead>
                      <TableHead compact numeric>P&L (₴)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multiLotResult.matches.map((m) => (
                      <TableRow key={m.lotId}>
                        <TableCell compact className="text-muted-foreground">{m.lotBuyDate}</TableCell>
                        <TableCell compact numeric>{m.matchedQty}</TableCell>
                        <TableCell compact numeric>{fmtUsd(m.lotBuyPrice)}</TableCell>
                        <TableCell compact numeric className="text-muted-foreground">{m.lotNbuRateBuy}</TableCell>
                        <TableCell compact numeric>{fmt(m.costUah)}</TableCell>
                        <TableCell compact numeric>{fmt(m.revenueUah)}</TableCell>
                        <TableCell compact numeric className={m.plUah >= 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-destructive font-semibold"}>
                          {m.plUah >= 0 ? "+" : ""}{fmt(m.plUah)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="font-semibold">
                      <TableCell compact colSpan={6} className="text-right">Разом P&L:</TableCell>
                      <TableCell compact numeric className={multiLotResult.totalPlUah >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                        {multiLotResult.totalPlUah >= 0 ? "+" : ""}{fmt(multiLotResult.totalPlUah)} ₴
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell compact colSpan={5} className="text-right text-muted-foreground">Sell: {multiLotSellPosition.sellDate} @ {fmtUsd(multiLotSellPosition.sellPriceUsd!)} × {multiLotSellPosition.buyQty} шт, курс НБУ {multiLotSellPosition.nbuRateSell}</TableCell>
                      <TableCell compact className="text-right text-muted-foreground">ПДФО {fmt(multiLotResult.pit18)} ₴</TableCell>
                      <TableCell compact className="text-right text-muted-foreground">ВЗ {fmt(multiLotResult.mil5)} ₴</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Section 3: WHT Credit */}
          {whtRows.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Залік утриманого податку (дивіденди)
                  <Badge variant="warning" size="sm">WHT Credit</Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Ст. 170.11.2 ПКУ — податок, утриманий за кордоном, зараховується в рахунок ПДФО (не більше 18%).
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table containerClassName="rounded-b-lg">
                  <TableHeader>
                    <TableRow>
                      <TableHead compact>Дохід</TableHead>
                      <TableHead compact numeric>Gross ($)</TableHead>
                      <TableHead compact numeric>WHT</TableHead>
                      <TableHead compact numeric>Курс ₴</TableHead>
                      <TableHead compact numeric>Gross (₴)</TableHead>
                      <TableHead compact numeric>ПДФО 18%</TableHead>
                      <TableHead compact numeric>Залік</TableHead>
                      <TableHead compact numeric>До доплати</TableHead>
                      <TableHead compact numeric>ВЗ 5%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whtRows.map((r) => (
                      <TableRow key={r.position.id}>
                        <TableCell compact className="font-medium">
                          {r.position.ticker}
                          {r.position.country && r.position.country !== "US" && (
                            <Badge variant="outline" size="sm" className="ml-1">{r.position.country}</Badge>
                          )}
                        </TableCell>
                        <TableCell compact numeric>{fmtUsd(r.grossUsd)}</TableCell>
                        <TableCell compact numeric className="text-destructive">
                          {fmtUsd(r.withheldUsd)} ({Math.round((r.position.withholdingRate || 0) * 100)}%)
                        </TableCell>
                        <TableCell compact numeric className="text-muted-foreground">{r.position.nbuRateDividend}</TableCell>
                        <TableCell compact numeric>{fmt(r.grossUah)}</TableCell>
                        <TableCell compact numeric>{fmt(r.pitDue)}</TableCell>
                        <TableCell compact numeric className="text-emerald-600 dark:text-emerald-400">{fmt(r.creditCapped)}</TableCell>
                        <TableCell compact numeric className="font-semibold">{fmt(r.toPay)} ₴</TableCell>
                        <TableCell compact numeric>{fmt(r.milDue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {whtRows.some(r => (r.position.withholdingRate || 0) > 0.18) && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 border-t">
                    ⚠️ WHT &gt; 18% — залік обмежено до 18% від gross (ст. 170.11.2 ПКУ). Різниця не повертається.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legal note */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
            <p><strong>Ст. 170.2 ПКУ:</strong> Інвестиційний прибуток = дохід (за курсом НБУ на дату продажу) − витрати (за курсом НБУ на дату купівлі) − комісії.</p>
            <p><strong>Ст. 170.2.6 ПКУ:</strong> Інвестиційний збиток переноситься на зменшення прибутку у межах звітного року.</p>
            <p><strong>Ст. 170.11.2 ПКУ:</strong> Залік WHT не більше 18%. При WHT &gt; 18% (напр. Німеччина 26.375%) різниця — за рахунок інвестора.</p>
            <p><strong>Multi-lot FIFO:</strong> При продажу акцій, придбаних кількома лотами, першими продаються найстаріші (FIFO).</p>
            <p><strong>Ставки:</strong> ПДФО — 18%, військовий збір — 5% (з 2024 р.).</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
