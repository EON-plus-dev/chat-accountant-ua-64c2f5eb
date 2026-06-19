import { useMemo } from "react";
import { Calculator, Info, TrendingUp, CreditCard, Layers, Award, Landmark, Zap } from "lucide-react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateFifoResult,
  calculateDividendResult,
  calculateBondResult,
  calculateEsopResult,
  calculateYieldResult,
  calculateMultiLotFifo,
  multiLotBuyLots,
  type InvestmentPosition,
  type MultiLotFifoResult,
} from "@/config/demoCabinets/investmentData";

interface InvestmentPositionDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: InvestmentPosition | null;
}

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export const InvestmentPositionDetail = ({ open, onOpenChange, position }: InvestmentPositionDetailProps) => {
  const detail = useMemo(() => {
    if (!position) return null;

    if (position.relatedLotIds?.length) {
      return { type: "multi-lot" as const, result: calculateMultiLotFifo(multiLotBuyLots, position) };
    }
    if (position.operationType === "sell") {
      return { type: "fifo" as const, result: calculateFifoResult(position) };
    }
    if (position.operationType === "dividend") {
      return { type: "dividend" as const, result: calculateDividendResult(position) };
    }
    if (position.type === "bond" || position.type === "ovdp") {
      return { type: "bond" as const, result: calculateBondResult(position) };
    }
    if (position.operationType === "exercise") {
      return { type: "esop" as const, result: calculateEsopResult(position) };
    }
    if (position.operationType === "yield") {
      return { type: "yield" as const, result: calculateYieldResult(position) };
    }
    return { type: "hold" as const, result: null };
  }, [position]);

  if (!position) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            {position.ticker} — {position.asset}
          </SheetTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" size="sm">{position.type.toUpperCase()}</Badge>
            <Badge variant="info" size="sm">{position.country}</Badge>
            {position.currency && position.currency !== "USD" && (
              <Badge variant="warning" size="sm">{position.currency}</Badge>
            )}
            {position.corporateAction && (
              <Badge variant="destructive" size="sm">{position.corporateAction.type.toUpperCase()}</Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-4">
          {/* Corporate action alert */}
          {position.corporateAction && (
            <div className="text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Corporate Action: {position.corporateAction.type} ({position.corporateAction.date})
              </p>
              <p className="text-amber-700 dark:text-amber-400">{position.corporateAction.description}</p>
            </div>
          )}

          {/* Multi-lot FIFO */}
          {detail?.type === "multi-lot" && detail.result && (
            <MultiLotSection result={detail.result as MultiLotFifoResult} />
          )}

          {/* Simple FIFO */}
          {detail?.type === "fifo" && detail.result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  FIFO P&L (ст. 170.2 ПКУ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Дохід від продажу" value={`${fmt((detail.result as any).revenueUah)} ₴`} />
                <Row label="Витрати (придбання + комісії)" value={`${fmt((detail.result as any).costUah)} ₴`} />
                <Row label="Курс НБУ (купівля)" value={`${position.nbuRateBuy}`} muted />
                <Row label="Курс НБУ (продаж)" value={`${position.nbuRateSell}`} muted />
                <div className="border-t pt-2">
                  <Row label="P&L" value={`${fmt((detail.result as any).plUah)} ₴`} bold positive={(detail.result as any).plUah > 0} />
                  <Row label="ПДФО 18%" value={`${fmt((detail.result as any).pit18)} ₴`} />
                  <Row label="ВЗ 5%" value={`${fmt((detail.result as any).mil5)} ₴`} />
                  <Row label="Разом податок" value={`${fmt((detail.result as any).totalTax)} ₴`} bold />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dividend / WHT */}
          {detail?.type === "dividend" && detail.result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Дивіденди з WHT Credit (ст. 170.11.2)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Gross дивіденд" value={`${fmtUsd((detail.result as any).grossUsd)} / ${fmt((detail.result as any).grossUah)} ₴`} />
                <Row label={`WHT ${Math.round((position.withholdingRate || 0) * 100)}%`} value={`${fmtUsd((detail.result as any).withheldUsd)}`} muted />
                <Row label="ПДФО 18%" value={`${fmt((detail.result as any).pitDue)} ₴`} />
                <Row label="Залік WHT (макс 18%)" value={`-${fmt((detail.result as any).creditCapped)} ₴`} positive />
                {(position.withholdingRate || 0) > 0.18 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                    WHT {Math.round((position.withholdingRate || 0) * 100)}% &gt; 18% — залік обмежено до 18% від gross
                  </div>
                )}
                <Row label="До доплати ПДФО" value={`${fmt((detail.result as any).toPay)} ₴`} bold />
                <Row label="ВЗ 5%" value={`${fmt((detail.result as any).milDue)} ₴`} />
              </CardContent>
            </Card>
          )}

          {/* Bond / ОВДП */}
          {detail?.type === "bond" && detail.result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Landmark className="w-4 h-4" />
                  {position.type === "ovdp" ? "ОВДП — купонний дохід" : "Облігація — купон + capital gains"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Номінал" value={position.currency === "UAH" ? `${fmt(position.nominal || 0)} ₴` : fmtUsd(position.nominal || 0)} />
                <Row label={`Купонна ставка`} value={`${((position.couponRate || 0) * 100).toFixed(1)}% річних`} muted />
                <Row label="Купонний дохід" value={`${fmt((detail.result as any).couponIncomeUah)} ₴`} />
                {(detail.result as any).capitalGainUah !== 0 && (
                  <Row label="Capital gain" value={`${fmt((detail.result as any).capitalGainUah)} ₴`} />
                )}
                <div className="border-t pt-2">
                  <Row label="Загальний дохід" value={`${fmt((detail.result as any).totalIncomeUah)} ₴`} bold />
                  <Row label="ПДФО 18%" value={`${fmt((detail.result as any).pit18)} ₴`} />
                  <Row label="ВЗ 5%" value={`${fmt((detail.result as any).mil5)} ₴`} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ESOP */}
          {detail?.type === "esop" && detail.result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  ESOP/RSU Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Strike price" value={fmtUsd(position.strikePrice || 0)} muted />
                <Row label="FMV при exercise" value={fmtUsd(position.fmvAtExercise || 0)} />
                <Row label="Кількість" value={`${position.buyQty} акцій`} muted />
                <Row label="Бенефіт (USD)" value={fmtUsd((detail.result as any).benefitUsd)} />
                <div className="border-t pt-2">
                  <Row label="Дохід (UAH)" value={`${fmt((detail.result as any).benefitUah)} ₴`} bold />
                  <Row label="ПДФО 18%" value={`${fmt((detail.result as any).pit18)} ₴`} />
                  <Row label="ВЗ 5%" value={`${fmt((detail.result as any).mil5)} ₴`} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* DeFi / P2P Yield */}
          {detail?.type === "yield" && detail.result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {position.type === "defi" ? "DeFi Yield" : "P2P Lending"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Джерело" value={position.yieldSource || "—"} muted />
                <Row label="Yield (USD)" value={fmtUsd((detail.result as any).yieldUsd)} />
                <Row label="Yield (UAH)" value={`${fmt((detail.result as any).yieldUah)} ₴`} bold positive={!(detail.result as any).isDefault} />
                {(detail.result as any).isDefault && (
                  <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
                    Дефолт — збиток не зменшує інвестиційний прибуток (інший дохід, не ст. 170.2)
                  </div>
                )}
                {!(detail.result as any).isDefault && (
                  <div className="border-t pt-2">
                    <Row label="ПДФО 18%" value={`${fmt((detail.result as any).pit18)} ₴`} />
                    <Row label="ВЗ 5%" value={`${fmt((detail.result as any).mil5)} ₴`} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hold — unrealized */}
          {detail?.type === "hold" && (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                <p>Відкрита позиція — нереалізований P&L. Податок нараховується лише при продажу.</p>
                <div className="mt-2 space-y-1">
                  <Row label="Вартість придбання" value={`${fmt(position.buyQty * position.buyPriceUsd * position.nbuRateBuy)} ₴`} />
                  <Row label="Дата купівлі" value={position.buyDate} muted />
                  <Row label="Курс НБУ" value={`${position.nbuRateBuy}`} muted />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legal */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <p><strong>Ст. 170.2 ПКУ:</strong> Інвестиційний прибуток з конвертацією за курсами НБУ.</p>
            <p><strong>ВЗ:</strong> 5% згідно із Законом № 4015-IX.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ---- Multi-lot FIFO section ----

const MultiLotSection = ({ result }: { result: MultiLotFifoResult }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm flex items-center gap-2">
        <Layers className="w-4 h-4" />
        Multi-lot FIFO Matching
        <Badge variant="info" size="sm">{result.matches.length} лотів</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <Table containerClassName="rounded-b-lg">
        <TableHeader>
          <TableRow>
            <TableHead compact>Лот (купівля)</TableHead>
            <TableHead compact numeric>К-сть</TableHead>
            <TableHead compact numeric>Buy $</TableHead>
            <TableHead compact numeric>Курс ₴</TableHead>
            <TableHead compact numeric>Витрати ₴</TableHead>
            <TableHead compact numeric>Дохід ₴</TableHead>
            <TableHead compact numeric>P&L ₴</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.matches.map((m, i) => (
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
      </Table>
      <div className="p-3 border-t space-y-1 text-sm">
        <Row label="Загальний P&L" value={`${result.totalPlUah >= 0 ? "+" : ""}${fmt(result.totalPlUah)} ₴`} bold positive={result.totalPlUah >= 0} />
        <Row label="ПДФО 18%" value={`${fmt(result.pit18)} ₴`} />
        <Row label="ВЗ 5%" value={`${fmt(result.mil5)} ₴`} />
        <Row label="Разом податок" value={`${fmt(result.totalTax)} ₴`} bold />
      </div>
    </CardContent>
  </Card>
);

// ---- Helpers ----

const Row = ({ label, value, muted, bold, positive }: {
  label: string; value: string; muted?: boolean; bold?: boolean; positive?: boolean;
}) => (
  <div className="flex justify-between">
    <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
    <span className={`tabular-nums ${bold ? "font-semibold" : ""} ${positive === true ? "text-emerald-600 dark:text-emerald-400" : positive === false ? "text-destructive" : ""}`}>
      {value}
    </span>
  </div>
);
