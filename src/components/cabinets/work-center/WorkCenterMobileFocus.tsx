import { Button } from "@/components/ui/button";
import { Calendar, Send, ShieldCheck, Sparkles, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  needsAttention: number;
  awaitingDecision: number;
  risk: number;
  onStartDailyPlan: () => void;
}

const STATS = [
  { key: "attention", label: "Потребують уваги", icon: Calendar, tone: "bg-orange-100 text-orange-700" },
  { key: "decision", label: "Очікують рішення", icon: Send, tone: "bg-violet-100 text-violet-700" },
  { key: "risk", label: "Ризик", icon: ShieldCheck, tone: "bg-emerald-100 text-emerald-700" },
] as const;

export function WorkCenterMobileFocus({ needsAttention, awaitingDecision, risk, onStartDailyPlan }: Props) {
  const values: Record<string, number> = {
    attention: needsAttention,
    decision: awaitingDecision,
    risk,
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-3 space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Сьогодні у фокусі</h2>
        <button className="text-muted-foreground/60 hover:text-muted-foreground" aria-label="Дії">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex flex-col items-center gap-1 rounded-xl bg-muted/30 p-2.5">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", s.tone)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-xl font-semibold leading-none tabular-nums">{values[s.key]}</div>
              <div className="text-[11px] text-muted-foreground text-center leading-tight">{s.label}</div>
            </div>
          );
        })}
      </div>

      <Button
        variant="secondary"
        className="w-full justify-center gap-2 h-9 bg-primary/10 text-primary hover:bg-primary/15"
        onClick={onStartDailyPlan}
      >
        <Sparkles className="h-4 w-4" /> План дня від AI
      </Button>
    </section>
  );
}
