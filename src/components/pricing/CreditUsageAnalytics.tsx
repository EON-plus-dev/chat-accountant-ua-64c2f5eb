import { useMemo, useState } from "react";
import { BarChart3, PieChart, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { 
  CreditUsageEntry, 
  CreditUsageCategory,
  creditUsageCategoryLabels 
} from "@/config/pricingData";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { uk } from "date-fns/locale";

interface CreditUsageAnalyticsProps {
  entries: CreditUsageEntry[];
  standalone?: boolean;
  activePeriod?: "today" | "week" | "month" | "all";
}

const CATEGORY_COLORS: Record<CreditUsageCategory, string> = {
  ai_session: "#8b5cf6",
  document: "#3b82f6",
  document_pack: "#2563eb",
  report: "#f59e0b",
  payment: "#10b981",
  payroll: "#6366f1",
  verification: "#f97316",
  signature: "#06b6d4",
  other: "#6b7280",
};

export const CreditUsageAnalytics = ({ 
  entries,
  standalone = true,
  activePeriod,
}: CreditUsageAnalyticsProps) => {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const { categoryData, trendData, topCategory, insight } = useMemo(() => {
    let filtered: CreditUsageEntry[];

    if (standalone) {
      const now = new Date();
      const daysBack = period === "week" ? 7 : 30;
      const startDate = startOfDay(subDays(now, daysBack));
      filtered = entries.filter(e => isAfter(new Date(e.date), startDate));
    } else {
      filtered = entries;
    }

    // Category breakdown
    const byCategory: Record<CreditUsageCategory, number> = {} as Record<CreditUsageCategory, number>;
    filtered.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + Math.abs(e.amount);
    });

    const categoryData = Object.entries(byCategory)
      .map(([category, value]) => ({
        name: creditUsageCategoryLabels[category as CreditUsageCategory],
        value,
        category: category as CreditUsageCategory,
        color: CATEGORY_COLORS[category as CreditUsageCategory],
      }))
      .sort((a, b) => b.value - a.value);

    // Daily trend
    const dailyMap: Record<string, number> = {};

    if (standalone) {
      const now = new Date();
      const daysBack = period === "week" ? 7 : 30;
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = format(subDays(now, i), "yyyy-MM-dd");
        dailyMap[date] = 0;
      }
    } else {
      // Build range based on activePeriod
      const now = new Date();
      if (activePeriod === "today") {
        dailyMap[format(now, "yyyy-MM-dd")] = 0;
      } else if (activePeriod === "week") {
        for (let i = 6; i >= 0; i--) {
          dailyMap[format(subDays(now, i), "yyyy-MM-dd")] = 0;
        }
      } else if (activePeriod === "month") {
        for (let i = 29; i >= 0; i--) {
          dailyMap[format(subDays(now, i), "yyyy-MM-dd")] = 0;
        }
      } else {
        // "all" or undefined — from oldest entry to today
        const dates = filtered.map(e => format(new Date(e.date), "yyyy-MM-dd"));
        const uniqueDates = [...new Set(dates)].sort();
        const minDate = uniqueDates.length > 0 ? new Date(uniqueDates[0]) : now;
        const diffDays = Math.round((now.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = diffDays; i >= 0; i--) {
          dailyMap[format(subDays(now, i), "yyyy-MM-dd")] = 0;
        }
      }
    }

    filtered.forEach(e => {
      const date = format(new Date(e.date), "yyyy-MM-dd");
      if (dailyMap[date] !== undefined) {
        dailyMap[date] += Math.abs(e.amount);
      }
    });

    let labelFormat: string;
    if (!standalone) {
      if (activePeriod === "today") labelFormat = "HH:mm";
      else if (activePeriod === "week") labelFormat = "EEE";
      else if (activePeriod === "month") labelFormat = "d";
      else labelFormat = "d MMM";
    } else {
      labelFormat = period === "week" ? "EEE" : "d";
    }

    const trendData = Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      label: format(new Date(date), standalone ? (period === "week" ? "EEE" : "d") : labelFormat, { locale: uk }),
      fullDate: format(new Date(date), "d MMMM", { locale: uk }),
      amount,
    }));

    // Top category
    const topCategory = categoryData[0]?.category;
    
    // Generate insight
    let insight = "";
    if (topCategory === "ai_session") {
      insight = "Найбільше витрачаєте на AI-сесії. Спробуйте шаблони документів для економії.";
    } else if (topCategory === "report") {
      insight = "Значна частина витрат на звіти. Налаштуйте автоматичне формування.";
    } else if (topCategory === "payment") {
      insight = "Активно використовуєте платежі. Розгляньте пакетне формування.";
    } else if (categoryData.length > 0) {
      insight = `Основні витрати: ${categoryData[0]?.name}. Оптимізуйте цей напрямок для економії.`;
    }

    return { categoryData, trendData, topCategory, insight };
  }, [entries, period, activePeriod]);

  const totalUsed = categoryData.reduce((sum, c) => sum + c.value, 0);

  const periodSelector = (
    <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
      <TabsList className="h-8">
        <TabsTrigger value="week" className="text-xs px-3 h-6">Тиждень</TabsTrigger>
        <TabsTrigger value="month" className="text-xs px-3 h-6">Місяць</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const content = (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            Розподіл за категоріями
          </h4>
          {totalUsed > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {categoryData.slice(0, 5).map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-muted-foreground truncate max-w-[100px]">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-medium tabular-nums">
                      {Math.round((cat.value / totalUsed) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Немає даних за обраний період
            </p>
          )}
        </div>

        {/* Bar Chart - Trend */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Динаміка {standalone ? (period === "week" ? "за тиждень" : "за місяць") : ""}
          </h4>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              {trendData.length > 14 ? (
                <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    interval={Math.ceil(trendData.length / 7)}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} кр.`, "Списано"]}
                    labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDate || _label}
                  />
                  <Area 
                    type="monotone"
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#colorAmount)"
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} кр.`, "Списано"]}
                    labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDate || _label}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insight */}
      {insight && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">{insight}</p>
        </div>
      )}
    </div>
  );

  if (!standalone) {
    return content;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Аналітика використання</CardTitle>
          </div>
          {periodSelector}
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};