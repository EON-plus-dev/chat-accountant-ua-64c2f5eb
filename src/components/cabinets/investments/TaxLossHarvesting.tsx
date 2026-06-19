import { useMemo } from "react";
import { TrendingDown, Lightbulb } from "lucide-react";
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
import type { InvestmentPosition } from "@/config/demoCabinets/investmentData";

interface TaxLossHarvestingProps {
  positions: InvestmentPosition[];
  totalRealizedGainsUah: number;
}

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// Simulated current prices for open positions
const currentPrices: Record<string, number> = {
  TSLA: 155,
  IVV: 545,
  VWCE: 108,
  KVUE: 22,
};

export const TaxLossHarvesting = ({ positions, totalRealizedGainsUah }: TaxLossHarvestingProps) => {
  const opportunities = useMemo(() => {
    return positions
      .filter(p => p.operationType === "hold")
      .map(p => {
        const currentPrice = currentPrices[p.ticker] || p.buyPriceUsd * 1.05;
        const unrealizedUsd = (currentPrice - p.buyPriceUsd) * p.buyQty;
        const estimatedNbuRate = 41.5;
        const unrealizedUah = unrealizedUsd * estimatedNbuRate;
        const potentialSavings = unrealizedUah < 0 ? Math.round(Math.abs(unrealizedUah) * 0.23) : 0;

        return {
          ticker: p.ticker,
          asset: p.asset,
          qty: p.buyQty,
          buyPrice: p.buyPriceUsd,
          currentPrice,
          unrealizedUsd,
          unrealizedUah,
          potentialSavings,
          isLoss: unrealizedUah < 0,
        };
      })
      .sort((a, b) => a.unrealizedUah - b.unrealizedUah);
  }, [positions]);

  const totalPotentialSavings = opportunities.reduce((s, o) => s + o.potentialSavings, 0);
  const lossOpportunities = opportunities.filter(o => o.isLoss);

  if (lossOpportunities.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Немає позицій з нереалізованим збитком для tax-loss harvesting.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-muted-foreground" />
          Tax-Loss Harvesting
          <Badge variant="warning" size="sm">Simulation</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Продаж позицій зі збитком для offset реалізованого прибутку ({fmt(totalRealizedGainsUah)} ₴)
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Table containerClassName="rounded-b-lg">
          <TableHeader>
            <TableRow>
              <TableHead compact>Актив</TableHead>
              <TableHead compact numeric>К-сть</TableHead>
              <TableHead compact numeric>Buy $</TableHead>
              <TableHead compact numeric>Поточна $</TableHead>
              <TableHead compact numeric>Unrealized (₴)</TableHead>
              <TableHead compact numeric>Економія (₴)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lossOpportunities.map(o => (
              <TableRow key={o.ticker}>
                <TableCell compact className="font-medium">
                  <div className="flex flex-col">
                    <span>{o.ticker}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{o.asset}</span>
                  </div>
                </TableCell>
                <TableCell compact numeric>{o.qty}</TableCell>
                <TableCell compact numeric className="text-muted-foreground">${o.buyPrice}</TableCell>
                <TableCell compact numeric>${o.currentPrice}</TableCell>
                <TableCell compact numeric className="text-destructive font-semibold">
                  {fmt(o.unrealizedUah)}
                </TableCell>
                <TableCell compact numeric className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  +{fmt(o.potentialSavings)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-3 border-t space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Потенційна економія (ПДФО 18% + ВЗ 5%):</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{fmt(totalPotentialSavings)} ₴</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ст. 170.2.6 ПКУ: збиток від продажу інвестиційних активів зменшує прибуток у межах звітного року.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
