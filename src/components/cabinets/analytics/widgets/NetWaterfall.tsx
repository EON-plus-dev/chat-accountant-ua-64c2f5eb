import { useMemo } from "react";
import { TrendingUp, TrendingDown, Receipt, Activity } from "lucide-react";
import { formatCurrencySymbol } from "@/lib/formatters";

interface NetWaterfallProps {
  income: number;
  expenses: number;
  taxes: number;
  /** Якщо undefined — рахуємо як income - expenses - taxes. */
  net?: number;
}

interface Step {
  id: string;
  label: string;
  value: number;
  /** Знак для відображення у тексті. */
  sign: "" | "+" | "−";
  /** Колір смуги. */
  color: string;
  icon: typeof Activity;
  isResult?: boolean;
}

/**
 * Net Waterfall — світовий стандарт пояснення «звідки взявся чистий результат».
 * Дохід → −Витрати → −Податки → = Net. Висота смуги пропорційна доходу (база = 100%).
 * Net показується окремою смугою з підсвічуванням маржі.
 */
export const NetWaterfall = ({ income, expenses, taxes, net }: NetWaterfallProps) => {
  const computedNet = net ?? income - expenses - taxes;
  const margin = income > 0 ? (computedNet / income) * 100 : 0;

  const steps: Step[] = useMemo(
    () => [
      { id: "income", label: "Дохід", value: income, sign: "+", color: "hsl(142 71% 45%)", icon: TrendingUp },
      { id: "expenses", label: "Витрати", value: expenses, sign: "−", color: "hsl(0 72% 51%)", icon: TrendingDown },
      { id: "taxes", label: "Податки", value: taxes, sign: "−", color: "hsl(38 92% 50%)", icon: Receipt },
      {
        id: "net",
        label: "Чистий дохід",
        value: computedNet,
        sign: computedNet >= 0 ? "+" : "−",
        color: computedNet >= 0 ? "hsl(217 91% 60%)" : "hsl(0 72% 51%)",
        icon: Activity,
        isResult: true,
      },
    ],
    [income, expenses, taxes, computedNet],
  );

  const base = Math.max(income, 1);

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Як сформовано чистий дохід
        </div>
        <div className="text-[11px] tabular-nums text-muted-foreground">
          Маржа: <span className={margin >= 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>{margin.toFixed(1)}%</span>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {steps.map((step) => {
          const widthPct = Math.min(100, (Math.abs(step.value) / base) * 100);
          const Icon = step.icon;
          return (
            <div key={step.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: step.color }} />
                  <span className={step.isResult ? "font-semibold text-foreground" : "text-foreground"}>
                    {step.label}
                  </span>
                </div>
                <span
                  className={
                    step.isResult
                      ? "tabular-nums font-semibold"
                      : "tabular-nums text-muted-foreground"
                  }
                  style={step.isResult ? { color: step.color } : undefined}
                >
                  {step.sign}
                  {formatCurrencySymbol(Math.abs(step.value))}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: step.color,
                    opacity: step.isResult ? 1 : 0.75,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
