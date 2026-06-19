import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { computeBudgetSettlement } from "@/lib/analytics/budgetSettlementEngine";
import type { TaxPayment } from "@/config/paymentsConfig";
import type { PeriodType } from "@/lib/analytics/periodFilter";
import { formatValue as fmt } from "@/lib/formatters";

interface BudgetSettlementSectionProps {
  taxPayments: TaxPayment[];
  period: PeriodType;
  customRange?: { from: Date; to: Date } | null;
  onChatPromptInsert?: (prompt: string) => void;
  onScrollToPayments?: () => void;
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const BudgetSettlementSection = ({
  taxPayments,
  period,
  customRange,
  onChatPromptInsert,
  onScrollToPayments,
}: BudgetSettlementSectionProps) => {
  const summary = useMemo(
    () => computeBudgetSettlement(taxPayments, period, customRange ?? undefined),
    [taxPayments, period, customRange],
  );

  if (summary.byType.length === 0) {
    return (
      <div
        id="analytics-budget"
        className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground"
      >
        <Receipt className="w-3.5 h-3.5 text-primary/70 shrink-0" />
        <span>Розрахунки з бюджетом — за обраний період нарахувань немає.</span>
      </div>
    );
  }

  const ratioPercent = Math.round(summary.paymentRatio * 100);
  const chartData = summary.cumulative.map((p) => ({
    date: fmtDate(p.date),
    Нараховано: p.accruedCum,
    Сплачено: p.paidCum,
  }));

  return (
    <Card
      id="analytics-budget"
      className={summary.hasDebt ? "border-destructive/40" : "border-border"}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Розрахунки з бюджетом
          </div>
          <div className="flex items-center gap-2">
            {summary.hasDebt ? (
              <Badge variant="destructive" size="sm">
                Борг {fmt(summary.debt + summary.overdueAmount, "currency")}
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                Сплачено {ratioPercent}%
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <KPI label="Нараховано" value={summary.accrued} />
          <KPI label="Сплачено" value={summary.paid} tone="success" />
          <KPI
            label="Прострочено"
            value={summary.overdueAmount}
            tone={summary.overdueAmount > 0 ? "danger" : "muted"}
          />
          <KPI label="До сплати" value={summary.upcomingAmount} tone="warning" />
        </div>

        {/* Чарт накопичення */}
        {chartData.length > 1 && (
          <div className="h-44 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-accrued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v: number) => fmt(v, "currency")}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="Нараховано"
                  stroke="hsl(var(--primary))"
                  fill="url(#grad-accrued)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Сплачено"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Таблиця по типу податку */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium">Податок</th>
                <th className="text-right px-3 py-2 font-medium">Нараховано</th>
                <th className="text-right px-3 py-2 font-medium">Сплачено</th>
                <th className="text-right px-3 py-2 font-medium">Борг</th>
              </tr>
            </thead>
            <tbody>
              {summary.byType.map((row) => (
                <tr key={row.taxType} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span>{row.label}</span>
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        {row.count}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-right px-3 py-2 tabular-nums">
                    {fmt(row.accrued, "currency")}
                  </td>
                  <td className="text-right px-3 py-2 tabular-nums text-success">
                    {fmt(row.paid, "currency")}
                  </td>
                  <td
                    className={`text-right px-3 py-2 tabular-nums font-medium ${
                      row.debt > 0 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {fmt(row.debt, "currency")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Borg / next payment alert */}
        {summary.nextPayment && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2 text-sm min-w-0">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <span className="truncate">
                Наступний платіж: <strong>{summary.nextPayment.label}</strong> ·{" "}
                {fmt(summary.nextPayment.amount, "currency")} до{" "}
                {fmtDate(summary.nextPayment.deadline)}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onScrollToPayments && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={onScrollToPayments}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Платіжки
                </Button>
              )}
              {onChatPromptInsert && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={() =>
                    onChatPromptInsert(
                      `Сформуй платіжку: ${summary.nextPayment!.label}, сума ${summary.nextPayment!.amount} ₴, дедлайн ${summary.nextPayment!.deadline}`,
                    )
                  }
                >
                  AI
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function KPI({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "danger" | "warning" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-destructive"
        : tone === "warning"
          ? "text-warning"
          : tone === "muted"
            ? "text-muted-foreground"
            : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={`text-base font-semibold tabular-nums ${toneClass}`}>
        {fmt(value, "currency")}
      </div>
    </div>
  );
}
