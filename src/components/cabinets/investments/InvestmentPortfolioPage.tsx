import { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Calculator,
  FileText,
  PieChart,
  ArrowRight,
  Briefcase,
  Info,
  Landmark,
  Award,
  Zap,
  Calendar,
  Download,
  BarChart3,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FifoCalculator } from "../calculators/FifoCalculator";
import { AllocationChart } from "./AllocationChart";
import { InvestmentPositionDetail } from "./InvestmentPositionDetail";
import { InvestorAnnualReport } from "./InvestorAnnualReport";
import { TaxLossHarvesting } from "./TaxLossHarvesting";
import { InvestmentsAttentionInbox } from "./InvestmentsAttentionInbox";
import { InvestmentsKPISection } from "./InvestmentsKPISection";
import {
  investmentPositions,
  multiLotBuyLots,
  multiLotSellPosition,
  calculateFifoResult,
  calculateDividendResult,
  calculateBondResult,
  calculateEsopResult,
  calculateYieldResult,
  calculateMultiLotFifo,
  calculatePortfolioSummary,
  type InvestmentPosition,
} from "@/config/demoCabinets/investmentData";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";

interface InvestmentPortfolioPageProps {
  cabinet: Cabinet;
  onNavigateToDeclarations?: () => void;
}

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

type FilterType = "all" | "sell" | "dividend" | "hold" | "coupon" | "exercise" | "yield";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "info" }> = {
  declared: { label: "Задекларовано", variant: "success" },
  "in-portfolio": { label: "У портфелі", variant: "info" },
  pending: { label: "Очікує", variant: "warning" },
};

const operationLabels: Record<string, string> = {
  sell: "Продаж",
  dividend: "Дивіденди",
  hold: "Утримання",
  coupon: "Купон",
  exercise: "Exercise",
  yield: "Yield",
};

const typeLabels: Record<string, string> = {
  stock: "STOCK",
  etf: "ETF",
  crypto: "CRYPTO",
  bond: "BOND",
  dividend: "DIV",
  ovdp: "ОВДП",
  esop: "ESOP",
  p2p: "P2P",
  defi: "DEFI",
  reit: "REIT",
  fund: "FUND",
  metal: "METAL",
};

// Compute consumed quantities from multi-lot FIFO sell
function getAdjustedBuyLots(): InvestmentPosition[] {
  const multiLotResult = calculateMultiLotFifo(multiLotBuyLots, multiLotSellPosition);
  if (!multiLotResult) return multiLotBuyLots;

  const consumedMap = new Map<string, number>();
  for (const m of multiLotResult.matches) {
    consumedMap.set(m.lotId, (consumedMap.get(m.lotId) || 0) + m.matchedQty);
  }

  return multiLotBuyLots
    .map(lot => {
      const consumed = consumedMap.get(lot.id) || 0;
      const remaining = lot.buyQty - consumed;
      if (remaining <= 0) return null; // fully consumed
      return { ...lot, buyQty: remaining };
    })
    .filter(Boolean) as InvestmentPosition[];
}

// All positions including multi-lot sell, with consumed lots adjusted
const allPositions: InvestmentPosition[] = [...investmentPositions, ...getAdjustedBuyLots(), multiLotSellPosition];

export const InvestmentPortfolioPage = ({ cabinet, onNavigateToDeclarations }: InvestmentPortfolioPageProps) => {
  const [fifoOpen, setFifoOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [detailPosition, setDetailPosition] = useState<InvestmentPosition | null>(null);
  const { toast } = useToast();

  const summary = useMemo(() => calculatePortfolioSummary(allPositions), []);

  const filteredPositions = useMemo(() => {
    let positions = allPositions;
    // Year filter: filter by sellDate or buyDate year
    if (selectedYear) {
      positions = positions.filter(p => {
        const dateStr = p.sellDate || p.buyDate;
        if (!dateStr) return true;
        return new Date(dateStr).getFullYear() === selectedYear;
      });
    }
    if (filter !== "all") {
      positions = positions.filter(p => p.operationType === filter);
    }
    return positions;
  }, [filter, selectedYear]);

  const positionsWithPl = useMemo(() => {
    return filteredPositions.map(pos => {
      if (pos.operationType === "sell") {
        const result = calculateFifoResult(pos);
        return { ...pos, plUah: result?.plUah ?? 0, taxTotal: result?.totalTax ?? 0 };
      }
      if (pos.operationType === "dividend") {
        const result = calculateDividendResult(pos);
        return { ...pos, plUah: result?.grossUah ?? 0, taxTotal: (result?.toPay ?? 0) + (result?.milDue ?? 0) };
      }
      if (pos.type === "bond" || pos.type === "ovdp") {
        const result = calculateBondResult(pos);
        return { ...pos, plUah: result?.totalIncomeUah ?? 0, taxTotal: result?.totalTax ?? 0 };
      }
      if (pos.operationType === "exercise") {
        const result = calculateEsopResult(pos);
        return { ...pos, plUah: result?.benefitUah ?? 0, taxTotal: result?.totalTax ?? 0 };
      }
      if (pos.operationType === "yield") {
        const result = calculateYieldResult(pos);
        return { ...pos, plUah: result?.yieldUah ?? 0, taxTotal: result?.totalTax ?? 0 };
      }
      // Hold — unrealized estimate
      const estimate = pos.buyPriceUsd * 1.15;
      const unrealizedUah = (estimate - pos.buyPriceUsd) * pos.buyQty * 41.5;
      return { ...pos, plUah: unrealizedUah, taxTotal: 0 };
    });
  }, [filteredPositions]);

  const handleImport = () => {
    toast({
      title: "Імпорт IBKR Statement",
      description: "Завантажте Activity Statement у форматі CSV для автоматичного парсингу операцій.",
    });
  };

  // Check if we have bonds/esop/yield for extra summary cards
  const hasCouponIncome = summary.totalCouponIncomeUah > 0;
  const hasEsop = summary.totalEsopBenefitUah > 0;
  const hasYield = summary.totalYieldIncomeUah > 0;

  return (
    <div className="space-y-5">
      {/* Section-scoped action inbox */}
      <InvestmentsAttentionInbox
        positions={allPositions}
        onOpenPosition={(id) => {
          const pos = allPositions.find((p) => p.id === id);
          if (pos) setDetailPosition(pos);
        }}
        onOpenDeclarations={onNavigateToDeclarations}
        onOpenReport={() => setReportOpen(true)}
      />

      {/* Unified KPI grid (state metrics). Replaces custom SummaryCard hero. */}
      <InvestmentsKPISection positions={allPositions} />

      {/* Allocation Chart */}
      <AllocationChart positions={allPositions} />

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-[85px] h-9">
            <Calendar className="w-3.5 h-3.5 mr-1 shrink-0 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2025, 2024].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Всі операції" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі операції</SelectItem>
            <SelectItem value="sell">Продажі</SelectItem>
            <SelectItem value="dividend">Дивіденди</SelectItem>
            <SelectItem value="hold">У портфелі</SelectItem>
            <SelectItem value="coupon">Купони</SelectItem>
            <SelectItem value="exercise">ESOP Exercise</SelectItem>
            <SelectItem value="yield">Yield / P2P</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={handleImport}>
          <FileText className="w-4 h-4 mr-1.5" />
          Імпорт IBKR
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFifoOpen(true)}>
          <Calculator className="w-4 h-4 mr-1.5" />
          FIFO Калькулятор
        </Button>
        <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}>
          <Download className="w-4 h-4 mr-1.5" />
          Звіт інвестора
        </Button>
        {onNavigateToDeclarations && (
          <Button variant="default" size="sm" onClick={onNavigateToDeclarations}>
            До декларації
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Портфель ({filteredPositions.length} позицій)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Клікніть на рядок для деталей розрахунку. Дохід конвертується за курсом НБУ на дату операції.
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
                <TableHead compact>Тип</TableHead>
                <TableHead compact>Операція</TableHead>
                <TableHead compact>Дата</TableHead>
                <TableHead compact numeric>К-сть</TableHead>
                <TableHead compact numeric>Курс buy ₴</TableHead>
                <TableHead compact numeric>Курс sell ₴</TableHead>
                <TableHead compact numeric>P&L (₴)</TableHead>
                <TableHead compact numeric>Податок</TableHead>
                <TableHead compact>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positionsWithPl.map((pos) => {
                const st = statusConfig[pos.status] || statusConfig.pending;
                const dateCol = pos.operationType === "sell" ? pos.sellDate
                  : pos.operationType === "dividend" ? pos.dividendDate
                  : pos.operationType === "coupon" ? pos.couponDate
                  : pos.operationType === "exercise" ? pos.exerciseDate
                  : pos.operationType === "yield" ? pos.dividendDate
                  : "—";
                const sellRate = pos.nbuRateSell || pos.nbuRateDividend || "—";

                return (
                  <TableRow
                    key={pos.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setDetailPosition(pos)}
                  >
                    <TableCell compact className="font-medium">
                      <div className="flex flex-col">
                        <span>{pos.ticker}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{pos.asset}</span>
                      </div>
                    </TableCell>
                    <TableCell compact>
                      <Badge variant="outline" size="sm">{typeLabels[pos.type] || pos.type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell compact>{operationLabels[pos.operationType]}</TableCell>
                    <TableCell compact className="text-muted-foreground">{dateCol}</TableCell>
                    <TableCell compact numeric>{pos.buyQty}</TableCell>
                    <TableCell compact numeric className="text-muted-foreground">{pos.nbuRateBuy}</TableCell>
                    <TableCell compact numeric className="text-muted-foreground">{sellRate}</TableCell>
                    <TableCell compact numeric className={
                      pos.plUah > 0
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : pos.plUah < 0
                          ? "text-destructive font-semibold"
                          : "text-muted-foreground"
                    }>
                      {pos.plUah > 0 ? "+" : ""}{fmt(pos.plUah)}
                    </TableCell>
                    <TableCell compact numeric>
                      {pos.taxTotal > 0 ? `${fmt(pos.taxTotal)} ₴` : "—"}
                    </TableCell>
                    <TableCell compact>
                      <Badge variant={st.variant} size="sm">{st.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter sticky>
              {(() => {
                const realized = positionsWithPl.filter(p => p.operationType !== "hold");
                const unrealized = positionsWithPl.filter(p => p.operationType === "hold");
                const realizedPl = realized.reduce((s, p) => s + (p.plUah || 0), 0);
                const unrealizedPl = unrealized.reduce((s, p) => s + (p.plUah || 0), 0);
                const totalTax = realized.reduce((s, p) => s + (p.taxTotal || 0), 0);
                return (
                  <>
                    <TableRow className="font-semibold">
                      <TableCell compact colSpan={4}>Реалізований P&L ({realized.length} операцій)</TableCell>
                      <TableCell compact numeric colSpan={3} />
                      <TableCell compact numeric className={
                        realizedPl > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : realizedPl < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                      }>
                        {realizedPl > 0 ? "+" : ""}{fmt(realizedPl)}
                      </TableCell>
                      <TableCell compact numeric>
                        {totalTax > 0 ? `${fmt(totalTax)} ₴` : "—"}
                      </TableCell>
                      <TableCell compact />
                    </TableRow>
                    {unrealized.length > 0 && (
                      <TableRow className="font-medium text-muted-foreground">
                        <TableCell compact colSpan={4}>Нереалізований P&L ({unrealized.length} позицій)</TableCell>
                        <TableCell compact numeric colSpan={3} />
                        <TableCell compact numeric className={
                          unrealizedPl > 0
                            ? "text-emerald-600/70 dark:text-emerald-400/70"
                            : unrealizedPl < 0
                              ? "text-destructive/70"
                              : "text-muted-foreground"
                        }>
                          ~{unrealizedPl > 0 ? "+" : ""}{fmt(unrealizedPl)}
                        </TableCell>
                        <TableCell compact numeric>—</TableCell>
                        <TableCell compact />
                      </TableRow>
                    )}
                  </>
                );
              })()}
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Dividend Calendar */}
      <DividendCalendar positions={allPositions} />

      {/* Tax-Loss Harvesting */}
      <TaxLossHarvesting positions={allPositions} totalRealizedGainsUah={summary.netRealizedUah} />

      {/* Benchmark Comparison */}
      <BenchmarkComparison />

      {/* Legal disclaimer */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
        <p><strong>Ст. 170.2 ПКУ:</strong> Інвестиційний прибуток = дохід від продажу − вартість придбання − комісії, з конвертацією за курсами НБУ на відповідні дати.</p>
        <p><strong>ВЗ:</strong> 5% з 2024 р. згідно із Законом № 4015-IX.</p>
        <p><strong>ОВДП:</strong> Купонний дохід оподатковується 18% ПДФО + 5% ВЗ.</p>
        <p><strong>ESOP/RSU:</strong> Дохід = (FMV − Strike Price) × Qty на дату exercise.</p>
      </div>

      <FifoCalculator open={fifoOpen} onOpenChange={setFifoOpen} />
      <InvestorAnnualReport open={reportOpen} onOpenChange={setReportOpen} />
      <InvestmentPositionDetail
        open={!!detailPosition}
        onOpenChange={(open) => !open && setDetailPosition(null)}
        position={detailPosition}
      />
    </div>
  );
};

// ---- Dividend Calendar (E.5) ----

const DividendCalendar = ({ positions }: { positions: InvestmentPosition[] }) => {
  const dividendEvents = useMemo(() => {
    return positions
      .filter(p => p.operationType === "dividend" || p.operationType === "coupon" || (p.couponDate && p.couponRate))
      .map(p => {
        const date = p.dividendDate || p.couponDate || "—";
        const gross = p.grossDividendUsd || (p.nominal && p.couponRate ? p.nominal * p.couponRate * 0.5 : 0);
        const wht = p.withholdingRate || 0;
        const whtAmount = p.grossDividendUsd ? p.grossDividendUsd * wht : 0;
        const currency = p.currency || "USD";
        return { id: p.id, ticker: p.ticker, asset: p.asset, date, gross, wht, whtAmount, currency, country: p.country || "—" };
      })
      .sort((a, b) => {
        const parse = (d: string) => { const [dd, mm, yy] = d.split("."); return new Date(`${yy}-${mm}-${dd}`).getTime(); };
        return parse(a.date) - parse(b.date);
      });
  }, [positions]);

  if (dividendEvents.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Дивідендний календар
          <Badge variant="info" size="sm">E.5</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table containerClassName="rounded-b-lg">
          <TableHeader>
            <TableRow>
              <TableHead compact>Дата</TableHead>
              <TableHead compact>Актив</TableHead>
              <TableHead compact numeric>Gross</TableHead>
              <TableHead compact numeric>WHT</TableHead>
              <TableHead compact numeric>Net</TableHead>
              <TableHead compact>Країна</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dividendEvents.map(ev => (
              <TableRow key={ev.id}>
                <TableCell compact className="text-muted-foreground">{ev.date}</TableCell>
                <TableCell compact className="font-medium">{ev.ticker}</TableCell>
                <TableCell compact numeric>{fmt(ev.gross)} {ev.currency}</TableCell>
                <TableCell compact numeric className={ev.whtAmount > 0 ? "text-destructive" : "text-muted-foreground"}>
                  {ev.whtAmount > 0 ? `-${fmt(ev.whtAmount)}` : "—"}
                  {ev.wht > 0 && <span className="text-[10px] text-muted-foreground ml-1">({(ev.wht * 100).toFixed(1)}%)</span>}
                </TableCell>
                <TableCell compact numeric className="font-medium">{fmt(ev.gross - ev.whtAmount)}</TableCell>
                <TableCell compact>
                  <Badge variant="outline" size="sm">{ev.country}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// ---- Benchmark Comparison (D.5) ----

const benchmarkData = [
  { name: "Мій портфель", value: 18.5, fill: "hsl(var(--primary))" },
  { name: "S&P 500", value: 22.3, fill: "hsl(var(--muted-foreground))" },
];

const BenchmarkComparison = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        Порівняння з S&P 500
        <Badge variant="outline" size="sm">2024</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={benchmarkData} layout="vertical" margin={{ left: 100 }}>
            <XAxis type="number" domain={[0, 30]} tickFormatter={(v) => `${v}%`} fontSize={11} />
            <YAxis type="category" dataKey="name" fontSize={12} width={100} />
            <RechartsTooltip formatter={(v: number) => [`${v}%`, "Дохідність"]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {benchmarkData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Демо-дані. Реальне порівняння потребує інтеграції з ринковими даними.
      </p>
    </CardContent>
  </Card>
);

// SummaryCard removed — replaced by InvestmentsKPISection (UniversalKPICard grid).
