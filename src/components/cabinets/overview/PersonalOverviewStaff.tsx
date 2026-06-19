import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, AlertTriangle, AlertCircle, Info, Wallet, Building2, Banknote, Coins, TrendingUp, TrendingDown, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "@/components/dashboard/WorkspacePanel";
import { getOverviewSnapshot } from "@/personal/overview/personalOverviewMock";
import { getGoalsForCabinet, getGoalProgress } from "@/personal/goals/personalGoalsMock";

function fmt(n: number, withSign = false) {
  const v = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Math.abs(n));
  if (!withSign) return v + " ₴";
  return (n >= 0 ? "+" : "−") + v + " ₴";
}

const BUCKET_ICON = [Building2, Wallet, Banknote, Coins];

interface Props {
  cabinet: Cabinet;
  onTabChange?: (tab: TabType, subTab?: string) => void;
}

export function PersonalOverviewStaff({ cabinet, onTabChange }: Props) {
  const snap = getOverviewSnapshot(cabinet.id);
  const goals = getGoalsForCabinet(cabinet.id).slice(0, 3);
  if (!snap) return null;

  const budgetUsedPct = Math.min(100, Math.round((snap.mtd.expenseUah / snap.mtd.budgetUah) * 100));

  return (
    <div className="space-y-3">
      {/* Balance card */}
      <Card className="p-4">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Загальний баланс</div>
            <div className="text-2xl md:text-3xl font-semibold mt-0.5">{fmt(snap.totalUah)}</div>
          </div>
          <Button variant="link" size="sm" className="text-xs gap-1 h-auto p-0" onClick={() => onTabChange?.("operations" as TabType, "finance")}>
            Деталі рахунків <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {snap.balances.map((b, i) => {
            const Icon = BUCKET_ICON[i] ?? Wallet;
            return (
              <div key={b.label} className="rounded-lg border p-2.5 bg-card">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Icon className="w-3 h-3" /> {b.label}
                </div>
                <div className="text-sm font-semibold mt-1">{fmt(b.amountUah)}</div>
                {b.hint && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{b.hint}</div>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Income / Expense MTD + budget */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">Доходи місяця</div>
            <span className={cn("text-xs flex items-center gap-0.5", snap.mtd.incomeDeltaPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600")}>
              {snap.mtd.incomeDeltaPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {snap.mtd.incomeDeltaPct > 0 ? "+" : ""}{snap.mtd.incomeDeltaPct}%
            </span>
          </div>
          <div className="text-2xl font-semibold mt-1">{fmt(snap.mtd.incomeUah)}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">Витрати місяця</div>
            <span className={cn("text-xs flex items-center gap-0.5", snap.mtd.expenseDeltaPct > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
              {snap.mtd.expenseDeltaPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {snap.mtd.expenseDeltaPct > 0 ? "+" : ""}{snap.mtd.expenseDeltaPct}%
            </span>
          </div>
          <div className="text-2xl font-semibold mt-1">{fmt(snap.mtd.expenseUah)}</div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>Бюджет {fmt(snap.mtd.budgetUah)}</span>
              <span>{budgetUsedPct}%</span>
            </div>
            <Progress value={budgetUsedPct} className="h-1.5" />
          </div>
        </Card>
      </div>

      {/* Goal progress strip */}
      {goals.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="text-sm font-medium">Прогрес цілей</div>
            <Button variant="link" size="sm" className="text-xs gap-1 h-auto p-0" onClick={() => onTabChange?.("savings" as TabType, "goals")}>
              Усі цілі <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {goals.map((g) => {
              const p = getGoalProgress(g);
              return (
                <div key={g.id} className="rounded-lg border p-2.5 bg-card">
                  <div className="text-xs font-medium truncate">{g.title}</div>
                  <div className="flex items-baseline justify-between mt-1 text-[11px] text-muted-foreground">
                    <span><span className="text-foreground font-medium">{fmt(g.currentUah)}</span> / {fmt(g.targetUah)}</span>
                    <span className="text-foreground font-medium">{p}%</span>
                  </div>
                  <Progress value={p} className="h-1 mt-1.5" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Risks + System status */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-4">
          <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Ризики
          </div>
          <ul className="space-y-2">
            {snap.risks.map((r) => {
              const Icon = r.severity === "danger" ? AlertCircle : r.severity === "warning" ? AlertTriangle : Info;
              const color = r.severity === "danger" ? "text-rose-600" : r.severity === "warning" ? "text-amber-600 dark:text-amber-400" : "text-sky-600";
              return (
                <li key={r.id} className="flex items-start gap-2 text-xs">
                  <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", color)} />
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{r.title}</div>
                    <div className="text-muted-foreground">{r.description}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> Статус системи
          </div>
          <div className="flex flex-wrap gap-1.5">
            {snap.systemStatus.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] flex items-center gap-1.5",
                  s.state === "ok" && "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
                  s.state === "warn" && "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
                  s.state === "info" && "border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-400",
                )}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-medium">{s.label}</span>
                <span className="text-muted-foreground">· {s.detail}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
