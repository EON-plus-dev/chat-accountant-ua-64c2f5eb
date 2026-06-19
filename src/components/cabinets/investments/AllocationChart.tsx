import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart as PieChartIcon } from "lucide-react";
import type { InvestmentPosition } from "@/config/demoCabinets/investmentData";

interface AllocationChartProps {
  positions: InvestmentPosition[];
}

type GroupBy = "sector" | "country" | "type";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(280 67% 55%)",
  "hsl(199 89% 48%)",
  "hsl(350 89% 60%)",
  "hsl(168 76% 36%)",
  "hsl(45 93% 47%)",
  "hsl(262 52% 47%)",
];

const groupLabels: Record<GroupBy, string> = {
  sector: "За секторами",
  country: "За країнами",
  type: "За типами",
};

const typeLabels: Record<string, string> = {
  stock: "Акції",
  etf: "ETF",
  crypto: "Крипто",
  bond: "Облігації",
  dividend: "Дивіденди",
  ovdp: "ОВДП",
  esop: "ESOP/RSU",
  p2p: "P2P",
  defi: "DeFi",
  reit: "REIT",
  fund: "Фонди",
  metal: "Метали",
};

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const AllocationChart = ({ positions }: AllocationChartProps) => {
  const [groupBy, setGroupBy] = useState<GroupBy>("sector");

  const chartData = useMemo(() => {
    const groups: Record<string, number> = {};
    positions.forEach((p) => {
      const costUah = p.buyQty * p.buyPriceUsd * p.nbuRateBuy;
      let key: string;
      if (groupBy === "sector") key = p.sector || "Інше";
      else if (groupBy === "country") key = p.country || "N/A";
      else key = typeLabels[p.type] || p.type;
      groups[key] = (groups[key] || 0) + costUah;
    });

    return Object.entries(groups)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [positions, groupBy]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Розподіл портфеля
          </CardTitle>
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sector">За секторами</SelectItem>
              <SelectItem value="country">За країнами</SelectItem>
              <SelectItem value="type">За типами</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="w-[180px] h-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => [`${fmt(value)} ₴`, ""]}
                  contentStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {chartData.map((d, i) => {
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
              return (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
                  <span className="font-medium tabular-nums">{pct}%</span>
                  <span className="text-xs text-muted-foreground tabular-nums w-20 text-right">
                    {fmt(d.value)} ₴
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
