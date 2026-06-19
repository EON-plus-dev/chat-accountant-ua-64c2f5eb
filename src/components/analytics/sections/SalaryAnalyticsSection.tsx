import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Users, TrendingUp, TrendingDown, Sparkles, Briefcase } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

interface SalaryBreakdown {
  salary: { amount: number; count: number };
  civil: { amount: number; count: number };
  bonus: { amount: number };
  percentOfIncome: number;
  employeeCount: number;
  avgPerEmployee: number;
}

interface SalaryByCabinet {
  cabinetId: string;
  cabinetName: string;
  total: number;
  employeeCount: number;
  percentOfTotal: number;
}

interface SalaryAnalyticsSectionProps {
  totalSalary: number;
  salaryBreakdown: SalaryBreakdown;
  salaryByCabinet: SalaryByCabinet[];
  previousPeriodSalary?: number;
  onCabinetClick?: (cabinetId: string) => void;
  onAiPromptClick?: (prompt: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(value);

export function SalaryAnalyticsSection({
  totalSalary,
  salaryBreakdown,
  salaryByCabinet,
  previousPeriodSalary,
  onCabinetClick,
  onAiPromptClick,
}: SalaryAnalyticsSectionProps) {
  const salaryChange = previousPeriodSalary
    ? ((totalSalary - previousPeriodSalary) / previousPeriodSalary) * 100
    : null;

  const breakdownData = [
    { name: "Зарплати", value: salaryBreakdown.salary.amount, count: salaryBreakdown.salary.count },
    { name: "ЦПД", value: salaryBreakdown.civil.amount, count: salaryBreakdown.civil.count },
    { name: "Премії", value: salaryBreakdown.bonus.amount, count: 0 },
  ].filter((d) => d.value > 0);

  const aiPrompts = [
    "Проаналізуй витрати на персонал",
    "Порівняй Labor Cost Ratio з галузевими нормами",
    "Оптимізуй структуру виплат",
  ];

  return (
    <Card id="salary-analytics" className="transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Аналіз виплат працівникам</CardTitle>
              <CardDescription>
                Labor Cost Ratio: {salaryBreakdown.percentOfIncome}% · {salaryBreakdown.employeeCount} працівників
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-sm px-3 py-1",
              salaryBreakdown.percentOfIncome < 30
                ? "border-success/50 text-success"
                : salaryBreakdown.percentOfIncome < 50
                ? "border-amber-500/50 text-amber-600"
                : "border-destructive/50 text-destructive"
            )}
          >
            {salaryBreakdown.percentOfIncome < 30 ? "Оптимально" : salaryBreakdown.percentOfIncome < 50 ? "Помірно" : "Високе"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Всього виплат</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSalary)}</p>
            {salaryChange !== null && (
              <div className="flex items-center gap-1 mt-1">
                {salaryChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-success" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    salaryChange > 0 ? "text-destructive" : "text-success"
                  )}
                >
                  {salaryChange > 0 ? "+" : ""}
                  {salaryChange.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Середнє на чол.</p>
            <p className="text-2xl font-bold">{formatCurrency(salaryBreakdown.avgPerEmployee)}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Кількість працівників</p>
            <p className="text-2xl font-bold">{salaryBreakdown.employeeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {salaryBreakdown.salary.count} штат + {salaryBreakdown.civil.count} ЦПД
            </p>
          </div>
        </div>

        {/* Breakdown chart */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Структура виплат</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} className="text-xs" />
                <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {breakdownData.map((item) => (
            <div key={item.name} className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{item.name}</span>
                {item.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {item.count} чол.
                  </Badge>
                )}
              </div>
              <p className="text-lg font-semibold tabular-nums">{formatCurrency(item.value)}</p>
              <Progress
                value={(item.value / totalSalary) * 100}
                className="h-1.5 mt-2"
              />
            </div>
          ))}
        </div>

        {/* Cabinet breakdown */}
        {salaryByCabinet.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Розподіл по кабінетах</p>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {salaryByCabinet.map((cabinet) => (
                  <button
                    key={cabinet.cabinetId}
                    onClick={() => onCabinetClick?.(cabinet.cabinetId)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{cabinet.cabinetName}</p>
                        <p className="text-xs text-muted-foreground">
                          {cabinet.employeeCount} чол. · {cabinet.percentOfTotal}%
                        </p>
                      </div>
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
