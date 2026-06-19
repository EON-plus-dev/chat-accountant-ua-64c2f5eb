import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type IncomeBookRecord } from "@/config/incomeBookConfig";

interface WeeklyViewProps {
  records: IncomeBookRecord[];
  year: number;
  onWeekClick?: (weekKey: string, monthIso: string) => void;
}

interface WeekAggregate {
  key: string; // e.g. "2025-W14"
  label: string; // "14–20 квіт"
  startDate: string; // ISO date of Monday
  endDate: string;
  monthIso: string; // first month containing the week (for drill-down)
  totalIncome: number;
  totalReturn: number;
  inIncomeBook: number;
  count: number;
  hasIssues: boolean;
}

const monthNamesShort = [
  "січ", "лют", "бер", "квіт", "трав", "черв",
  "лип", "серп", "вер", "жовт", "лист", "груд",
];

// ISO week number
const getIsoWeek = (date: Date): { week: number; year: number } => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getUTCFullYear() };
};

const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  const start = new Date(d);
  start.setDate(d.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const fmtRange = (s: Date, e: Date): string => {
  const sd = s.getDate();
  const ed = e.getDate();
  const sm = monthNamesShort[s.getMonth()];
  const em = monthNamesShort[e.getMonth()];
  if (s.getMonth() === e.getMonth()) return `${sd}–${ed} ${sm}`;
  return `${sd} ${sm} – ${ed} ${em}`;
};

export const WeeklyView = ({ records, year, onWeekClick }: WeeklyViewProps) => {
  const weeks = useMemo<WeekAggregate[]>(() => {
    const byWeek: Record<string, IncomeBookRecord[]> = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const { week, year: wYear } = getIsoWeek(d);
      const key = `${wYear}-W${String(week).padStart(2, "0")}`;
      if (!byWeek[key]) byWeek[key] = [];
      byWeek[key].push(r);
    });

    return Object.entries(byWeek)
      .map(([key, recs]) => {
        const sorted = [...recs].sort((a, b) => a.date.localeCompare(b.date));
        const firstDate = new Date(sorted[0].date);
        const { start, end } = getWeekRange(firstDate);
        const monthIso = `${year}-${String(start.getMonth() + 1).padStart(2, "0")}`;
        return {
          key,
          label: fmtRange(start, end),
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          monthIso,
          totalIncome: recs.filter((r) => r.status !== "return").reduce((s, r) => s + r.amount, 0),
          totalReturn: recs.filter((r) => r.status === "return").reduce((s, r) => s + r.amount, 0),
          inIncomeBook: recs.reduce((s, r) => s + r.inIncomeBook, 0),
          count: recs.length,
          hasIssues: recs.some((r) => r.status === "needs-clarification"),
        };
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [records, year]);

  if (weeks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Немає операцій для відображення за тижнями
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {weeks.map((w) => (
        <Card
          key={w.key}
          className={cn(
            "cursor-pointer hover:border-primary/50 hover:shadow-md transition-all",
            w.hasIssues && "border-l-4 border-l-amber-400",
          )}
          onClick={() => onWeekClick?.(w.key, w.monthIso)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onWeekClick?.(w.key, w.monthIso);
            }
          }}
        >
          <CardContent className="p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-xs text-muted-foreground tabular-nums w-12 shrink-0">
                {w.key.split("-W")[1]}-й
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm">{w.label}</div>
                <div className="text-xs text-muted-foreground">
                  {w.count} {w.count === 1 ? "операція" : w.count < 5 ? "операції" : "операцій"}
                  {w.hasIssues && <Badge variant="outline" className="ml-2 h-4 px-1 text-[10px] bg-amber-50 text-amber-700 border-amber-200">⚠</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className={cn(
                  "font-semibold tabular-nums text-sm",
                  w.inIncomeBook >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400",
                )}>
                  {formatCurrency(w.inIncomeBook)}
                </div>
                <div className="text-[11px] text-muted-foreground">у дохід</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
