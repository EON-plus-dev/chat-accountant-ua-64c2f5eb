/**
 * NOMENCLATURE PERFORMANCE CARD
 * 
 * Аналітика продажів для позиції номенклатури:
 * - Графік продажів за 6 місяців (recharts AreaChart)
 * - Тренд попиту
 * - Середня маржа
 * - Частота використання в документах
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  FileText,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

interface NomenclaturePerformanceCardProps {
  item: NomenclatureItemV2;
  className?: string;
}

// Mock sales data for demo
const generateMockSalesData = (itemId: string) => {
  const months = ["Серп", "Верес", "Жовт", "Листоп", "Груд", "Січ"];
  const baseValue = 50 + Math.abs(itemId.charCodeAt(0) % 100);
  
  return months.map((month, index) => ({
    month,
    sales: Math.round(baseValue + Math.sin(index * 0.8) * 30 + Math.random() * 20),
    revenue: Math.round((baseValue + Math.sin(index * 0.8) * 30) * 1500 + Math.random() * 5000),
  }));
};

export const NomenclaturePerformanceCard = ({ 
  item,
  className 
}: NomenclaturePerformanceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const salesData = generateMockSalesData(item.id);
  
  // Calculate metrics
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const lastMonthSales = salesData[salesData.length - 1]?.sales || 0;
  const prevMonthSales = salesData[salesData.length - 2]?.sales || 0;
  const trend = prevMonthSales > 0 
    ? Math.round(((lastMonthSales - prevMonthSales) / prevMonthSales) * 100) 
    : 0;
  const isPositiveTrend = trend >= 0;
  
  // Mock metrics
  const avgMargin = 18 + Math.abs(item.id.charCodeAt(0) % 15);
  const docFrequency = (2 + Math.abs(item.id.charCodeAt(1) % 5) + Math.random()).toFixed(1);

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="py-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Аналітика продажів
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Chart */}
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={salesData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                  }}
                  formatter={(value: number) => [`${value} од.`, "Продажі"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            {/* Trend */}
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "p-1.5 rounded-md",
                isPositiveTrend 
                  ? "bg-emerald-100 dark:bg-emerald-950/50" 
                  : "bg-red-100 dark:bg-red-950/50"
              )}>
                {isPositiveTrend ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className={cn(
                  "text-sm font-semibold",
                  isPositiveTrend ? "text-emerald-600" : "text-red-600"
                )}>
                  {isPositiveTrend ? "+" : ""}{trend}%
                </p>
                <p className="text-[10px] text-muted-foreground">тренд</p>
              </div>
            </div>
            
            {/* Margin */}
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950/50">
                <Percent className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{avgMargin}%</p>
                <p className="text-[10px] text-muted-foreground">маржа</p>
              </div>
            </div>
            
            {/* Document Frequency */}
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-950/50">
                <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{docFrequency}</p>
                <p className="text-[10px] text-muted-foreground">доки/тижд</p>
              </div>
            </div>
          </div>
          
          {/* Total summary */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <span>Всього за 6 міс: <strong className="text-foreground">{totalSales} од.</strong></span>
            <Badge variant="secondary" className="text-xs">
              {item.category === "service" ? "Послуга" : "Товар"}
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
