import { Progress } from "@/components/ui/progress";
import type { Deadline } from "@/portal/data/deadlines";
import { cn } from "@/lib/utils";

const URGENCY_STYLES: Record<Deadline["urgency"], { text: string; progress: string; value: number }> = {
  urgent: { text: "text-red-600 dark:text-red-400", progress: "[&>div]:bg-red-500", value: 85 },
  upcoming: { text: "text-amber-600 dark:text-amber-400", progress: "[&>div]:bg-amber-500", value: 40 },
  ok: { text: "text-emerald-600 dark:text-emerald-400", progress: "[&>div]:bg-emerald-500", value: 20 },
};

interface Props {
  deadline: Deadline;
}

export const DeadlineCard = ({ deadline }: Props) => {
  const style = URGENCY_STYLES[deadline.urgency];
  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-card p-3">
      <p className="text-sm font-bold text-foreground">{deadline.date}</p>
      <p className="text-sm text-muted-foreground">{deadline.title}</p>
      <p className={cn("text-xs font-medium", style.text)}>
        Залишилось: {deadline.daysLeft} днів
      </p>
      <Progress value={style.value} className={cn("h-1.5", style.progress)} />
    </div>
  );
};
