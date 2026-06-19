import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight } from "lucide-react";
import { getCurrencySnapshot, getUpcomingDeadlines } from "@/portal/data/dailyDigest";
import { cn } from "@/lib/utils";

const urgencyColors: Record<string, string> = {
  urgent: "text-destructive",
  upcoming: "text-warning",
  ok: "text-info",
};

export const MobileQuickData = () => {
  const { usd, eur } = getCurrencySnapshot();
  const deadlines = getUpcomingDeadlines(2);

  return (
    <div className="lg:hidden space-y-3">
      {/* Currency strip */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        {[usd, eur].filter(Boolean).map(r => r && (
          <div key={r.currency} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{r.flag} {r.currency}</span>
            <span className="font-mono font-semibold text-foreground">{r.nbuRate.toFixed(2)}</span>
            <span className={cn("text-xs font-mono", r.nbuChange > 0 ? "text-destructive" : r.nbuChange < 0 ? "text-chart-2" : "text-muted-foreground")}>
              {r.nbuChange > 0 ? "▲" : r.nbuChange < 0 ? "▼" : "—"}{Math.abs(r.nbuChange).toFixed(2)}
            </span>
          </div>
        ))}
        <Link to="/analytics/currency" className="ml-auto text-[10px] text-primary hover:underline">Всі →</Link>
      </div>

      {/* Deadlines compact */}
      {deadlines.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {deadlines.map(d => (
            <div key={d.id} className="shrink-0 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <CalendarDays className={cn("h-3.5 w-3.5", urgencyColors[d.urgency])} />
              <div>
                <p className="text-xs font-medium text-foreground leading-tight line-clamp-1">{d.title}</p>
                <p className="text-[10px] text-muted-foreground">{d.daysLeft > 0 ? `${d.daysLeft} дн.` : "Сьогодні!"}</p>
              </div>
            </div>
          ))}
          <Link to="/analytics/deadlines" className="shrink-0 flex items-center text-xs text-primary gap-1 px-2">
            Всі <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
};
