import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ComparisonChartPoint, ComparisonDataPoint } from "@/types/comparison";

interface ComparisonChartProps {
  chartData: ComparisonChartPoint[];
  dataPoints: ComparisonDataPoint[];
  className?: string;
}

type ScaleMode = "absolute" | "normalized";

const formatCurrency = (value: number) => 
  new Intl.NumberFormat("uk-UA", { 
    style: "currency", 
    currency: "UAH", 
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? "compact" : "standard",
  }).format(value);

const formatCompact = (value: number) =>
  value >= 1000000 
    ? `${(value / 1000000).toFixed(1)}M` 
    : value >= 1000 
    ? `${(value / 1000).toFixed(0)}K` 
    : value.toString();

export function ComparisonChart({ chartData, dataPoints, className }: ComparisonChartProps) {
  const [scaleMode, setScaleMode] = useState<ScaleMode>("absolute");
  const [visibleItems, setVisibleItems] = useState<Set<string>>(
    new Set(dataPoints.map(dp => dp.itemId))
  );
  
  if (chartData.length === 0 || dataPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        Немає даних для відображення
      </div>
    );
  }
  
  // Normalize data if needed (index = 100 for first month)
  const processedData = scaleMode === "normalized" 
    ? chartData.map((point, index) => {
        const normalized: ComparisonChartPoint = { month: point.month };
        dataPoints.forEach(dp => {
          const firstValue = chartData[0][dp.itemId] as number || 1;
          const currentValue = point[dp.itemId] as number || 0;
          normalized[dp.itemId] = (currentValue / firstValue) * 100;
        });
        return normalized;
      })
    : chartData;
  
  // Build chart config
  const chartConfig = dataPoints.reduce((acc, dp) => {
    acc[dp.itemId] = { label: dp.itemLabel, color: dp.color };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);
  
  const toggleItemVisibility = (itemId: string) => {
    setVisibleItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        // Don't allow hiding all items
        if (next.size > 1) {
          next.delete(itemId);
        }
      } else {
        next.add(itemId);
      }
      return next;
    });
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Toggle visibility */}
        <div className="flex flex-wrap gap-2">
          {dataPoints.map(dp => (
            <button
              key={dp.itemId}
              onClick={() => toggleItemVisibility(dp.itemId)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                visibleItems.has(dp.itemId) 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <div 
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-opacity",
                  !visibleItems.has(dp.itemId) && "opacity-30"
                )}
                style={{ backgroundColor: dp.color }}
              />
              <span className="max-w-[100px] truncate">{dp.itemLabel}</span>
            </button>
          ))}
        </div>
        
        {/* Scale mode */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Шкала:</Label>
          <ToggleGroup 
            type="single" 
            value={scaleMode} 
            onValueChange={(v) => v && setScaleMode(v as ScaleMode)}
            size="sm"
          >
            <ToggleGroupItem value="absolute" className="text-xs px-2">
              Абсолютна
            </ToggleGroupItem>
            <ToggleGroupItem value="normalized" className="text-xs px-2">
              Індекс (100)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <LineChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis 
            tickFormatter={scaleMode === "normalized" ? (v) => `${v}` : formatCompact} 
            className="text-xs" 
          />
          <ChartTooltip 
            content={
              <ChartTooltipContent 
                formatter={(value) => 
                  scaleMode === "normalized" 
                    ? `${Number(value).toFixed(1)} (індекс)` 
                    : formatCurrency(Number(value))
                } 
              />
            } 
          />
          <Legend />
          
          {dataPoints.map(dp => (
            visibleItems.has(dp.itemId) && (
              <Line
                key={dp.itemId}
                type="monotone"
                dataKey={dp.itemId}
                name={dp.itemLabel}
                stroke={dp.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
