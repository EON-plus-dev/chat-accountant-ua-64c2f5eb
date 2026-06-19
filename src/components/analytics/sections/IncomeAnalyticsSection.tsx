import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown,
  Building2,
  User,
  Users,
  ChevronRight, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface TypeDistribution {
  type: string;
  label: string;
  value: number;
  count: number;
  color: string;
}

interface CabinetIncome {
  cabinetId: string;
  cabinetName: string;
  type: string;
  typeLabel: string;
  income: number;
  trend: { value: number; direction: "up" | "down" };
  rank: number;
}

interface MonthlyIncome {
  month: string;
  income: number;
}

interface IncomeTrend {
  value: number;
  direction: "up" | "down";
}

interface IncomeAnalyticsSectionProps {
  totalIncome: number;
  previousPeriodIncome: number;
  trend: IncomeTrend;
  typeDistribution: TypeDistribution[];
  topCabinets: CabinetIncome[];
  monthlyData: MonthlyIncome[];
  onCabinetClick?: (cabinetId: string) => void;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(value);

const formatCompact = (value: number) =>
  value >= 1000000 
    ? `${(value / 1000000).toFixed(1)}M` 
    : value >= 1000 
    ? `${(value / 1000).toFixed(0)}K` 
    : value.toString();

const typeIcons: Record<string, typeof Building2> = {
  fop: User,
  tov: Building2,
  individual: Users,
  "fop-group": Users,
};

export function IncomeAnalyticsSection({
  totalIncome,
  previousPeriodIncome,
  trend,
  typeDistribution,
  topCabinets,
  monthlyData,
  onCabinetClick,
  isLoading = false,
}: IncomeAnalyticsSectionProps) {
  const chartConfig = {
    income: { label: "Дохід", color: "hsl(var(--chart-1))" },
  };

  const incomeDiff = totalIncome - previousPeriodIncome;
  const TrendIcon = trend.direction === "up" ? TrendingUp : TrendingDown;

  // Loading skeleton
  if (isLoading) {
    return (
      <Card id="income-analytics" className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted w-10 h-10" />
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-48" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-8 bg-muted rounded w-28 ml-auto" />
              <div className="h-3 bg-muted rounded w-24 ml-auto" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-[120px] bg-muted rounded" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="income-analytics" className="transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              trend.direction === "up" ? "bg-success/10" : "bg-destructive/10"
            )}>
              <TrendIcon className={cn(
                "h-5 w-5",
                trend.direction === "up" ? "text-success" : "text-destructive"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">Аналітика доходу</CardTitle>
              <CardDescription>
                Деталізація за типами та кабінетами
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            <div className={cn(
              "flex items-center justify-end gap-1 text-xs",
              trend.direction === "up" ? "text-success" : "text-destructive"
            )}>
              {trend.direction === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{trend.value}% vs попередній період</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mini chart */}
        {monthlyData.length > 0 && (
          <div className="h-[120px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatCompact} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="hsl(var(--chart-1))" 
                  fill="url(#incomeGradientAnalytics)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}

        {/* Type distribution */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Розподіл за типами</p>
          <div className="space-y-2">
            {typeDistribution.map((item) => {
              const percent = totalIncome > 0 ? Math.round((item.value / totalIncome) * 100) : 0;
              const TypeIcon = typeIcons[item.type] || Building2;
              
              return (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{item.label}</span>
                      <Badge variant="outline" className="text-[10px] px-1">{item.count}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                      <span className="text-xs text-muted-foreground">({percent}%)</span>
                    </div>
                  </div>
                  <Progress 
                    value={percent} 
                    className="h-1.5"
                    style={{ "--progress-color": item.color } as React.CSSProperties}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top cabinets with sticky header */}
        {topCabinets.length > 0 && (
          <div className="space-y-3">
            <div className="sticky top-0 bg-card z-10 py-2 -mt-2">
              <p className="text-sm font-medium text-muted-foreground">Топ кабінетів за доходом</p>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                {topCabinets.map((cabinet) => {
                  const TypeIcon = typeIcons[cabinet.type] || Building2;
                  const CabinetTrendIcon = cabinet.trend.direction === "up" ? ArrowUpRight : ArrowDownRight;

                  return (
                    <button
                      key={cabinet.cabinetId}
                      onClick={() => onCabinetClick?.(cabinet.cabinetId)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg",
                        "hover:bg-muted/50 active:bg-muted/70 transition-colors",
                        "text-left min-h-[56px]", // Phase 1: Better touch target
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                    >
                      <span className="text-sm font-medium text-muted-foreground w-5">{cabinet.rank}</span>
                      <div className="p-1.5 rounded-md bg-muted">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cabinet.cabinetName}</p>
                        <p className="text-xs text-muted-foreground">{cabinet.typeLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(cabinet.income)}</p>
                        <div className={cn(
                          "flex items-center justify-end gap-0.5 text-xs", // Slightly larger for mobile
                          cabinet.trend.direction === "up" ? "text-success" : "text-destructive"
                        )}>
                          <CabinetTrendIcon className="h-3 w-3" />
                          <span>{cabinet.trend.value}%</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Comparison with previous period */}
        <div className="p-4 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Порівняння з попереднім періодом</p>
              <p className="text-sm text-muted-foreground mt-1">
                Попередній: <span className="font-medium text-foreground">{formatCurrency(previousPeriodIncome)}</span>
              </p>
            </div>
            <div className={cn(
              "text-right",
              incomeDiff >= 0 ? "text-success" : "text-destructive"
            )}>
              <p className="text-lg font-bold">
                {incomeDiff >= 0 ? "+" : ""}{formatCurrency(incomeDiff)}
              </p>
              <p className="text-xs">{incomeDiff >= 0 ? "приріст" : "зменшення"}</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
