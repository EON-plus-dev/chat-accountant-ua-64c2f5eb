import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrencySymbol } from "@/lib/formatters";
import type { ChartDataItem } from "@/types/universalAnalyticsTypes";

interface Props {
  /** Transactions dataset chartData — `current` = count per period bucket. */
  data: ChartDataItem[];
  /** Optional sums dataset (currency) aligned by period label. If absent — falls back to count*avgCheck heuristic = none. */
  sumsData?: ChartDataItem[];
  color: string;
}

/**
 * Dual-axis: bars = transaction count (left), line = total sum UAH (right).
 * Світовий стандарт payments-аналітики (Stripe/Paddle dashboards).
 */
export const TransactionsDualAxis = ({ data, sumsData, color }: Props) => {
  const merged = useMemo(() => {
    if (!data?.length) return [];
    const sumsByLabel = new Map<string, number>();
    sumsData?.forEach((p) => sumsByLabel.set(String(p.label), Number(p.current) || 0));
    return data.map((p) => ({
      label: String(p.label),
      count: Number(p.current) || 0,
      sum: sumsByLabel.get(String(p.label)) ?? 0,
    }));
  }, [data, sumsData]);

  if (!merged.length) return null;
  const hasSums = merged.some((d) => d.sum > 0);

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="px-4 py-2.5 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
        <span>Кількість vs Обсяг</span>
        <span className="text-[10px] normal-case tracking-normal">
          стовпці — кількість • лінія — сума
        </span>
      </div>
      <div className="p-3 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis
              yAxisId="count"
              orientation="left"
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              width={36}
            />
            {hasSums && (
              <YAxis
                yAxisId="sum"
                orientation="right"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                width={56}
                tickFormatter={(v) => formatCurrencySymbol(Number(v))}
              />
            )}
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) =>
                name === "Сума" ? [formatCurrencySymbol(value), name] : [value.toLocaleString("uk-UA"), name]
              }
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="count" dataKey="count" name="Кількість" fill={color} opacity={0.7} radius={[3, 3, 0, 0]} />
            {hasSums && (
              <Line
                yAxisId="sum"
                type="monotone"
                dataKey="sum"
                name="Сума"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
