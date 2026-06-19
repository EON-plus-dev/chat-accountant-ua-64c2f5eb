import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { DEADLINES } from "@/portal/data/deadlines";
import { cn } from "@/lib/utils";

const URGENCY_DOT: Record<string, string> = {
  urgent: "bg-red-500",
  upcoming: "bg-amber-500",
  ok: "bg-emerald-500",
};

interface Props {
  taxType?: string;
  limit?: number;
}

export const DeadlineWidget = ({ taxType, limit = 4 }: Props) => {
  const deadlines = DEADLINES
    .filter((d) => !taxType || d.taxType === taxType || d.taxType === "all")
    .filter((d) => d.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit);

  if (deadlines.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        Дедлайни
      </h4>
      <div className="space-y-2">
        {deadlines.map((d) => (
          <div key={d.id} className="flex items-start gap-2">
            <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", URGENCY_DOT[d.urgency])} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground leading-snug truncate">{d.title}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {d.date} · {d.daysLeft}д
              </p>
            </div>
          </div>
        ))}
      </div>
      <Link to="/tools" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
        Повний календар →
      </Link>
    </div>
  );
};
