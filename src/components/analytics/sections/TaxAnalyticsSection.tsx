import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Wallet, TrendingUp, TrendingDown, Sparkles, PieChart } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";

interface TaxBreakdown {
  ep: { label: string; amount: number };
  esv: { label: string; amount: number };
  pdfo: { label: string; amount: number };
  military: { label: string; amount: number };
  percentOfIncome: number;
}

interface TaxByCabinet {
  cabinetId: string;
  cabinetName: string;
  total: number;
  percentOfTotal: number;
}

interface TaxAnalyticsSectionProps {
  totalTax: number;
  taxBreakdown: TaxBreakdown;
  taxByCabinet: TaxByCabinet[];
  previousPeriodTax?: number;
  onCabinetClick?: (cabinetId: string) => void;
  onAiPromptClick?: (prompt: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(value);

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function TaxAnalyticsSection({
  totalTax,
  taxBreakdown,
  taxByCabinet,
  previousPeriodTax,
  onCabinetClick,
  onAiPromptClick,
}: TaxAnalyticsSectionProps) {
  const taxChange = previousPeriodTax
    ? ((totalTax - previousPeriodTax) / previousPeriodTax) * 100
    : null;

  const pieData = [
    { name: taxBreakdown.ep.label, value: taxBreakdown.ep.amount, color: COLORS[0] },
    { name: taxBreakdown.esv.label, value: taxBreakdown.esv.amount, color: COLORS[1] },
    { name: taxBreakdown.pdfo.label, value: taxBreakdown.pdfo.amount, color: COLORS[2] },
    { name: taxBreakdown.military.label, value: taxBreakdown.military.amount, color: COLORS[3] },
  ].filter((d) => d.value > 0);

  const aiPrompts = [
    "Проаналізуй податкове навантаження портфеля",
    "Порівняй з попереднім періодом",
    "Знайди можливості оптимізації",
  ];

  return (
    <Card id="tax-analytics" className="transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Аналіз податків</CardTitle>
              <CardDescription>Tax Burden Ratio: {taxBreakdown.percentOfIncome}% від доходу</CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-sm px-3 py-1",
              taxBreakdown.percentOfIncome < 7
                ? "border-success/50 text-success"
                : taxBreakdown.percentOfIncome < 10
                ? "border-amber-500/50 text-amber-600"
                : "border-destructive/50 text-destructive"
            )}
          >
            {taxBreakdown.percentOfIncome < 7 ? "Низьке" : taxBreakdown.percentOfIncome < 10 ? "Середнє" : "Високе"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/50">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">До сплати за період</p>
            <p className="text-3xl font-bold">{formatCurrency(totalTax)}</p>
          </div>
          {taxChange !== null && (
            <div className="flex items-center gap-2">
              {taxChange > 0 ? (
                <TrendingUp className="h-5 w-5 text-destructive" />
              ) : (
                <TrendingDown className="h-5 w-5 text-success" />
              )}
              <span
                className={cn(
                  "text-lg font-semibold",
                  taxChange > 0 ? "text-destructive" : "text-success"
                )}
              >
                {taxChange > 0 ? "+" : ""}
                {taxChange.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">vs попередній період</span>
            </div>
          )}
        </div>

        {/* Tax breakdown pie + list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-muted-foreground mb-4">Структура податків</p>
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown list */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Деталізація</p>
            {pieData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.value)}</span>
                </div>
                <Progress
                  value={(item.value / totalTax) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cabinet breakdown */}
        {taxByCabinet.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Розподіл по кабінетах</p>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {taxByCabinet.map((cabinet) => (
                  <button
                    key={cabinet.cabinetId}
                    onClick={() => onCabinetClick?.(cabinet.cabinetId)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[44px]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cabinet.cabinetName}</p>
                      <p className="text-xs text-muted-foreground">{cabinet.percentOfTotal}% від загальної суми</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">{formatCurrency(cabinet.total)}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
