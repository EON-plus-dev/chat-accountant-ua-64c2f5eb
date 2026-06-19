import { useMemo } from "react";
import { Users, TrendingUp, Wallet } from "lucide-react";
import { formatCurrencySymbol } from "@/lib/formatters";

interface Props {
  totalPayroll: number;
  /** Дохід за той самий період — для розрахунку payroll-burden. */
  income: number;
  employeeCount: number;
  /** ESV ставка (зазв. 0.22). */
  esvRate?: number;
  /** ПДФО + ВЗ (0.18 + 0.05 = 0.23). */
  pitVzRate?: number;
  color: string;
}

/**
 * Salary burden widget: показує реальну вартість фонду оплати (gross + ESV),
 * частку від доходу, та середню зарплату.
 * Світовий стандарт HRIS (Gusto, Rippling, BambooHR).
 */
export const SalaryBurden = ({
  totalPayroll,
  income,
  employeeCount,
  esvRate = 0.22,
  pitVzRate = 0.23,
  color,
}: Props) => {
  const stats = useMemo(() => {
    const esv = totalPayroll * esvRate;
    const pitVz = totalPayroll * pitVzRate;
    const totalCost = totalPayroll + esv; // повна вартість для роботодавця
    const netToEmployees = totalPayroll - pitVz;
    const burdenPct = income > 0 ? (totalCost / income) * 100 : 0;
    const avgSalary = employeeCount > 0 ? totalPayroll / employeeCount : 0;
    const avgNet = employeeCount > 0 ? netToEmployees / employeeCount : 0;

    let burdenStatus: "good" | "watch" | "high";
    if (burdenPct < 25) burdenStatus = "good";
    else if (burdenPct < 40) burdenStatus = "watch";
    else burdenStatus = "high";

    return { esv, pitVz, totalCost, netToEmployees, burdenPct, avgSalary, avgNet, burdenStatus };
  }, [totalPayroll, income, employeeCount, esvRate, pitVzRate]);

  const burdenChip = {
    good: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    watch: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    high: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  }[stats.burdenStatus];

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Структура фонду оплати
        </span>
        {income > 0 && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${burdenChip}`}>
            {stats.burdenPct.toFixed(1)}% від доходу
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Складена шкала: net | PIT+VZ | ESV */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Повна вартість для роботодавця</span>
            <span className="tabular-nums font-medium">{formatCurrencySymbol(stats.totalCost)}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex">
            <div
              className="h-full"
              style={{ width: `${(stats.netToEmployees / stats.totalCost) * 100}%`, backgroundColor: color, opacity: 0.85 }}
              title={`Чисто на руки: ${formatCurrencySymbol(stats.netToEmployees)}`}
            />
            <div
              className="h-full"
              style={{ width: `${(stats.pitVz / stats.totalCost) * 100}%`, backgroundColor: color, opacity: 0.55 }}
              title={`ПДФО+ВЗ: ${formatCurrencySymbol(stats.pitVz)}`}
            />
            <div
              className="h-full"
              style={{ width: `${(stats.esv / stats.totalCost) * 100}%`, backgroundColor: color, opacity: 0.3 }}
              title={`ЄСВ: ${formatCurrencySymbol(stats.esv)}`}
            />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground mt-1.5">
            <span>● На руки: <span className="tabular-nums text-foreground/80">{formatCurrencySymbol(stats.netToEmployees)}</span></span>
            <span>● ПДФО+ВЗ: <span className="tabular-nums text-foreground/80">{formatCurrencySymbol(stats.pitVz)}</span></span>
            <span>● ЄСВ: <span className="tabular-nums text-foreground/80">{formatCurrencySymbol(stats.esv)}</span></span>
          </div>
        </div>

        {/* 3 KPI */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="rounded-lg bg-muted/40 p-2 sm:p-2.5 min-w-0">
            <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              <Users className="w-3 h-3 shrink-0" /> <span className="truncate">Працівників</span>
            </div>
            <div className="text-sm font-semibold tabular-nums truncate">{employeeCount}</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-2 sm:p-2.5 min-w-0">
            <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              <Wallet className="w-3 h-3 shrink-0" /> <span className="truncate">Серед. ЗП</span>
            </div>
            <div className="text-sm font-semibold tabular-nums truncate">{formatCurrencySymbol(stats.avgSalary)}</div>
          </div>
          <div className="rounded-lg bg-muted/40 p-2 sm:p-2.5 min-w-0">
            <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              <TrendingUp className="w-3 h-3 shrink-0" /> <span className="truncate">Серед. на руки</span>
            </div>
            <div className="text-sm font-semibold tabular-nums truncate">{formatCurrencySymbol(stats.avgNet)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
