/**
 * NOMENCLATURE PRICE HISTORY
 * 
 * Компонент історії цін з міні-графіком для NomenclaturePricingTab
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  History, 
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import { 
  getMockPriceHistory, 
  type PriceHistoryPoint 
} from "@/config/contractorInteractionConfig";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";

interface NomenclaturePriceHistoryProps {
  nomenclatureId: string;
  currency?: string;
}

export const NomenclaturePriceHistory = ({
  nomenclatureId,
  currency = "UAH",
}: NomenclaturePriceHistoryProps) => {
  const priceHistory = getMockPriceHistory(nomenclatureId);

  if (priceHistory.length === 0) {
    return null;
  }

  // Prepare chart data (reverse for chronological order)
  const chartData = [...priceHistory].reverse().map(point => ({
    date: new Date(point.date).toLocaleDateString("uk-UA", { 
      month: "short", 
      year: "2-digit" 
    }),
    price: point.price,
    priceWithVat: point.priceWithVat,
    fullDate: point.date,
  }));

  // Calculate overall trend
  const firstPrice = priceHistory[priceHistory.length - 1]?.price || 0;
  const currentPrice = priceHistory[0]?.price || 0;
  const overallChange = firstPrice > 0 
    ? Math.round(((currentPrice - firstPrice) / firstPrice) * 100)
    : 0;
  const isPositiveTrend = overallChange >= 0;

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case "import": return "Імпорт";
      case "sync": return "Синхронізація";
      default: return "Вручну";
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" />
            Історія цін
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1",
              isPositiveTrend 
                ? "text-red-600 border-red-200" 
                : "text-green-600 border-green-200"
            )}
          >
            {isPositiveTrend ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositiveTrend ? "+" : ""}{overallChange}% за рік
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Mini Chart */}
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                hide 
                domain={["dataMin - 100", "dataMax + 100"]}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  formatNomenclaturePrice(value, currency),
                  "Ціна"
                ]}
                labelFormatter={(label) => label}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* History List */}
        <div className="space-y-2">
          {priceHistory.slice(0, 5).map((point, index) => (
            <div 
              key={point.date}
              className={cn(
                "flex items-center justify-between py-2 text-sm",
                index < priceHistory.length - 1 && "border-b"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {new Date(point.date).toLocaleDateString("uk-UA")}
                </span>
                {point.reason && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {point.reason}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">
                  {formatNomenclaturePrice(point.price, currency)}
                </span>
                {point.changePercent !== undefined && point.changePercent !== 0 && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs gap-0.5",
                      point.changePercent > 0 
                        ? "text-red-600 border-red-200" 
                        : "text-green-600 border-green-200"
                    )}
                  >
                    {point.changePercent > 0 ? (
                      <ArrowUp className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowDown className="h-2.5 w-2.5" />
                    )}
                    {Math.abs(point.changePercent).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
