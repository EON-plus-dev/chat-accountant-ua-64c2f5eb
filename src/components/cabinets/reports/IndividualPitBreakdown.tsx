import { useState } from "react";
import { Calculator, Info, ChevronDown, ChevronRight } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Report } from "@/config/reportsConfig";

interface IndividualPitBreakdownProps {
  report: Report;
}

// Demo PIT breakdown data with formula details
const pitSources = [
  {
    id: "pit-1",
    source: "Інвестиції IBKR (FIFO)",
    grossUah: 164800,
    rate: 0.18,
    pitCalculated: 29664,
    pitWithheld: 0,
    milRate: 0.05,
    milCalculated: 8240,
    note: "ст. 170.2 ПКУ",
    formula: "P&L = (SellPrice × nbuRateSell) − (BuyPrice × nbuRateBuy + Commissions)",
    details: "10 × $270 × 41.22 − 10 × $150 × 38.45 = 164 800 ₴",
  },
  {
    id: "pit-2",
    source: "Дивіденди IBKR (MSFT)",
    grossUah: 16480,
    rate: 0.18,
    pitCalculated: 2966,
    pitWithheld: 2472,
    milRate: 0.05,
    milCalculated: 824,
    note: "ст. 170.11.2 ПКУ (залік)",
    formula: "Credit = min(WHT × nbuRate, PIT_due); PIT_to_pay = PIT_due − Credit",
    details: "$400 × 15% = $60 WHT → 60 × 41.20 = 2 472 ₴ залік; PIT = 2 966 − 2 472 = 494 ₴",
  },
  {
    id: "pit-3",
    source: "Зарплата Польща (КУПО)",
    grossUah: 720000,
    rate: 0.18,
    pitCalculated: 129600,
    pitWithheld: 86400,
    milRate: 0.05,
    milCalculated: 36000,
    note: "КУПО Україна—Польща",
    formula: "Credit = min(Foreign_PIT × nbuRate, UA_PIT_due)",
    details: "72 000 PLN × 12% = 8 640 PLN → 8 640 × 10.0 = 86 400 ₴; доплата = 129 600 − 86 400 = 43 200 ₴",
  },
  {
    id: "pit-4",
    source: "Оренда квартири",
    grossUah: 96000,
    rate: 0.18,
    pitCalculated: 17280,
    pitWithheld: 0,
    milRate: 0.05,
    milCalculated: 4800,
    note: "ст. 170.1 ПКУ",
    formula: "PIT = Gross × 18%",
    details: "8 000 ₴/міс × 12 = 96 000 ₴; PIT = 96 000 × 18% = 17 280 ₴",
  },
  {
    id: "pit-5",
    source: "Фріланс ЦПД (утримано агентом)",
    grossUah: 45000,
    rate: 0.18,
    pitCalculated: 8100,
    pitWithheld: 8100,
    milRate: 0.05,
    milCalculated: 2250,
    note: "ст. 168.1 ПКУ",
    formula: "Agent withheld 100% → PIT_to_pay = 0",
    details: "45 000 × 18% = 8 100 ₴ утримано податковим агентом → доплата 0 ₴",
  },
];

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function IndividualPitBreakdown({ report }: IndividualPitBreakdownProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Only show for individual PDFO reports
  if (report.type !== "pdfo" || report.cabinetId !== "demo-individual-declarant") {
    return null;
  }
  // Don't show for tax discount reports
  if (report.amountToPay !== undefined && report.amountToPay < 0) return null;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalGross = pitSources.reduce((s, r) => s + r.grossUah, 0);
  const totalPit = pitSources.reduce((s, r) => s + r.pitCalculated, 0);
  const totalWithheld = pitSources.reduce((s, r) => s + r.pitWithheld, 0);
  const totalMil = pitSources.reduce((s, r) => s + r.milCalculated, 0);
  const totalToPay = totalPit - totalWithheld;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          Розбивка ПДФО за джерелами
          <Badge variant="info" size="sm">2.12</Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Агрегація ПДФО з усіх джерел доходу. Клікніть на рядок для формули розрахунку.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table containerClassName="rounded-b-lg">
          <TableHeader>
            <TableRow>
              <TableHead compact className="w-5"></TableHead>
              <TableHead compact>Джерело</TableHead>
              <TableHead compact numeric>Дохід (₴)</TableHead>
              <TableHead compact numeric>ПДФО 18%</TableHead>
              <TableHead compact numeric>Утримано</TableHead>
              <TableHead compact numeric>ВЗ 5%</TableHead>
              <TableHead compact>Примітка</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pitSources.map((r) => {
              const isExpanded = expandedRows.has(r.id);
              return (
                <Collapsible key={r.id} open={isExpanded} onOpenChange={() => toggleRow(r.id)} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell compact className="w-5 px-2">
                          {isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          }
                        </TableCell>
                        <TableCell compact className="font-medium text-sm">{r.source}</TableCell>
                        <TableCell compact numeric>{fmt(r.grossUah)}</TableCell>
                        <TableCell compact numeric>{fmt(r.pitCalculated)}</TableCell>
                        <TableCell compact numeric className={r.pitWithheld > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                          {r.pitWithheld > 0 ? `−${fmt(r.pitWithheld)}` : "—"}
                        </TableCell>
                        <TableCell compact numeric>{fmt(r.milCalculated)}</TableCell>
                        <TableCell compact className="text-xs text-muted-foreground">{r.note}</TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/20 hover:bg-muted/30">
                        <TableCell compact />
                        <TableCell compact colSpan={6} className="text-xs space-y-1 py-3">
                          <div className="text-muted-foreground font-medium">Формула:</div>
                          <code className="block bg-muted/50 rounded px-2 py-1 text-xs font-mono">{r.formula}</code>
                          <div className="text-muted-foreground font-medium mt-1.5">Розрахунок:</div>
                          <div className="text-foreground">{r.details}</div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="font-semibold">
              <TableCell compact />
              <TableCell compact>Разом</TableCell>
              <TableCell compact numeric>{fmt(totalGross)} ₴</TableCell>
              <TableCell compact numeric>{fmt(totalPit)} ₴</TableCell>
              <TableCell compact numeric className="text-emerald-600 dark:text-emerald-400">−{fmt(totalWithheld)} ₴</TableCell>
              <TableCell compact numeric>{fmt(totalMil)} ₴</TableCell>
              <TableCell compact />
            </TableRow>
            <TableRow className="font-bold bg-primary/5">
              <TableCell compact />
              <TableCell compact colSpan={2}>До сплати ПДФО</TableCell>
              <TableCell compact numeric colSpan={2} className="text-lg">{fmt(totalToPay)} ₴</TableCell>
              <TableCell compact numeric className="text-lg">{fmt(totalMil)} ₴</TableCell>
              <TableCell compact />
            </TableRow>
          </TableFooter>
        </Table>

        {/* Aggregation formula */}
        <div className="p-4 border-t">
          <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="font-semibold text-foreground">Формула агрегації:</div>
            <code className="block font-mono text-muted-foreground">
              ПДФО_до_сплати = Σ(Дохід_i × 18%) − Σ(Утримано_i) = {fmt(totalPit)} − {fmt(totalWithheld)} = <span className="text-foreground font-semibold">{fmt(totalToPay)} ₴</span>
            </code>
            <code className="block font-mono text-muted-foreground">
              ВЗ_до_сплати = Σ(Дохід_i × 5%) = <span className="text-foreground font-semibold">{fmt(totalMil)} ₴</span>
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
