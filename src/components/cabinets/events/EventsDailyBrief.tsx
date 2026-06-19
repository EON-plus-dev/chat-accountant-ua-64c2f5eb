import { Sparkles, CalendarClock, AlertOctagon, CheckCircle2, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DailyBriefCounts {
  scheduledToday: number;
  upcomingDeadlines: number;
  overdue: number;
  completedThisWeek: number;
}

interface Props {
  counts: DailyBriefCounts;
  briefText: string;
  className?: string;
}

const tiles = [
  { key: "scheduledToday" as const,     label: "Сьогодні",            icon: CalendarClock,  tone: "primary" },
  { key: "upcomingDeadlines" as const,  label: "Дедлайни 7 днів",     icon: Target,         tone: "warning" },
  { key: "overdue" as const,            label: "Прострочено",         icon: AlertOctagon,   tone: "destructive" },
  { key: "completedThisWeek" as const,  label: "Виконано / тиждень",  icon: CheckCircle2,   tone: "success" },
];

const toneClasses: Record<string, { iconBg: string; iconFg: string; valueFg: string }> = {
  primary:     { iconBg: "bg-primary/10",     iconFg: "text-primary",     valueFg: "text-foreground" },
  warning:     { iconBg: "bg-warning/10",     iconFg: "text-warning",     valueFg: "text-foreground" },
  destructive: { iconBg: "bg-destructive/10", iconFg: "text-destructive", valueFg: "text-destructive" },
  success:     { iconBg: "bg-success/10",     iconFg: "text-success",     valueFg: "text-foreground" },
};

export function EventsDailyBrief({ counts, briefText, className }: Props) {
  return (
    <Card className={cn("p-4 md:p-5 bg-gradient-to-br from-primary/5 via-card to-card border-primary/20", className)}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            AI Brief дня
          </div>
          <p className="text-sm md:text-base font-medium leading-snug mt-0.5">{briefText}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          const cls = toneClasses[t.tone];
          const value = counts[t.key];
          return (
            <div
              key={t.key}
              className="flex items-center gap-2.5 p-2.5 rounded-md border border-border/60 bg-background/60"
            >
              <div className={cn("rounded-md p-1.5 flex-shrink-0", cls.iconBg)}>
                <Icon className={cn("w-4 h-4", cls.iconFg)} />
              </div>
              <div className="min-w-0 leading-tight">
                <div className={cn("text-lg font-bold tabular-nums", cls.valueFg)}>{value}</div>
                <div className="text-[11px] text-muted-foreground truncate">{t.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/** Deterministic 1-sentence brief from counts (no AI call). */
export function computeBriefText(counts: DailyBriefCounts): string {
  const parts: string[] = [];
  if (counts.overdue > 0) {
    parts.push(`${counts.overdue} ${plural(counts.overdue, ["прострочена подія", "прострочені події", "прострочених подій"])} потребує уваги`);
  }
  if (counts.scheduledToday > 0) {
    parts.push(`на сьогодні заплановано ${counts.scheduledToday}`);
  }
  if (counts.upcomingDeadlines > 0) {
    parts.push(`${counts.upcomingDeadlines} ${plural(counts.upcomingDeadlines, ["дедлайн", "дедлайни", "дедлайнів"])} у найближчий тиждень`);
  }
  if (parts.length === 0) return "Сьогодні все спокійно — жодних дедлайнів і простроченого. Гарний день, щоб переглянути цілі.";
  return capitalize(parts.join("; ")) + ".";
}

function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
