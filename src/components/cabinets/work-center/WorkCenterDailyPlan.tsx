import { Button } from "@/components/ui/button";
import { CalendarCheck2, Sparkles, Clock } from "lucide-react";

interface Props {
  items: string[];
  estimateMinutes: number;
  onStart: () => void;
}

export function WorkCenterDailyPlan({ items, estimateMinutes, onStart }: Props) {
  return (
    <section className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-primary/[0.03] to-transparent p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 md:gap-8 items-start">
        {/* Illustration */}
        <div className="hidden md:flex relative h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <CalendarCheck2 className="h-12 w-12 text-primary" />
          <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-amber-400 fill-amber-400/20" />
        </div>

        {/* Description */}
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl font-semibold">План дня від AI</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Сьогодні рекомендовано зосередитись на {items.length} важливих діях, які наблизять вас до ваших цілей.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
            <Clock className="h-3.5 w-3.5" />
            Очікуваний час: ~{estimateMinutes} хвилин
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2.5 md:min-w-[260px]">
          {items.map((label, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="text-sm">{label}</span>
            </div>
          ))}
          <Button size="sm" className="mt-2 gap-1.5" onClick={onStart}>
            <Sparkles className="h-3.5 w-3.5" /> Розпочати
          </Button>
        </div>
      </div>
    </section>
  );
}
