import { useState, useMemo } from "react";
import { FileText, CreditCard, Calendar, Copy, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { DEADLINES, getCurrentQuarter, type Deadline } from "@/portal/data/deadlines";
import { cn } from "@/lib/utils";

const TAX_TYPE_OPTIONS = [
  { value: "all", label: "Всі платники" },
  { value: "fop1", label: "ФОП 1 група" },
  { value: "fop2", label: "ФОП 2 група" },
  { value: "fop3", label: "ФОП 3 група" },
  { value: "tov", label: "ТОВ" },
];

const QUARTER_TABS = [
  { value: "all", label: "Всі" },
  { value: "1", label: "Q1 (Січ–Бер)" },
  { value: "2", label: "Q2 (Кві–Чер)" },
  { value: "3", label: "Q3 (Лип–Вер)" },
  { value: "4", label: "Q4 (Жов–Гру)" },
];

function buildGoogleCalendarUrl(d: Deadline): string {
  const parts = d.date.split(" ");
  const monthMap: Record<string, string> = {
    січня: "01", лютого: "02", березня: "03", квітня: "04",
    травня: "05", червня: "06", липня: "07", серпня: "08",
    вересня: "09", жовтня: "10", листопада: "11", грудня: "12",
  };
  const day = parts[0].padStart(2, "0");
  const month = monthMap[parts[1]] || "01";
  const year = parts[2] || "2025";
  const dateISO = `${year}${month}${day}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(d.title)}&dates=${dateISO}/${dateISO}&details=${encodeURIComponent(d.legalBasis + " | Штраф: " + d.penalty)}`;
}

export const TaxCalendar = () => {
  const [taxType, setTaxType] = useState("all");
  const [quarter, setQuarter] = useState(String(getCurrentQuarter()));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return DEADLINES.filter(d => {
      if (taxType !== "all" && d.taxType !== "all" && d.taxType !== taxType) return false;
      if (quarter !== "all" && d.quarter !== Number(quarter)) return false;
      return true;
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [taxType, quarter]);

  const handleCopy = () => {
    const text = filtered.map(d => `${d.date} — ${d.title} (${d.legalBasis})`).join("\n");
    navigator.clipboard.writeText(text);
    toast("Скопійовано!", { description: `${filtered.length} дедлайнів скопійовано в буфер обміну` });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={taxType} onValueChange={setTaxType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAX_TYPE_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={quarter} onValueChange={setQuarter}>
          <TabsList className="flex-wrap">
            {QUARTER_TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Дата</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Подія</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Тип</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Нормативна база</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Штраф</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Немає дедлайнів для обраних фільтрів
                </td>
              </tr>
            )}
            {filtered.map(d => {
              const isPast = d.daysLeft < 0;
              const isExpanded = expandedId === d.id;
              return (
                <tr
                  key={d.id}
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                  className={cn(
                    "border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/30",
                    d.isCritical && !isPast && "bg-destructive/5",
                    isPast && "opacity-60"
                  )}
                >
                  <td className={cn("px-4 py-3 font-mono text-xs whitespace-nowrap", isPast && "line-through")}>
                    {d.date}
                  </td>
                  <td className={cn("px-4 py-3", d.isCritical && !isPast && "font-semibold")}>
                    <div>{d.title}</div>
                    {isExpanded && (
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p><span className="font-medium text-foreground">Нормативна база:</span> {d.legalBasis}</p>
                        <p><span className="font-medium text-foreground">Штраф за порушення:</span> {d.penalty}</p>
                        <p><span className="font-medium text-foreground">Тип платника:</span> {d.taxType === 'all' ? 'Всі' : d.taxType.toUpperCase()}</p>
                        <a
                          href={buildGoogleCalendarUrl(d)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 mt-1 text-primary hover:underline"
                        >
                          <Calendar className="h-3 w-3" /> Додати у Google Calendar
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      {d.type === 'report' ? <FileText className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                      {d.type === 'report' ? 'Звіт' : 'Оплата'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{d.legalBasis}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{d.penalty}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isPast ? (
                        <Badge variant="secondary" size="sm">Минув</Badge>
                      ) : d.urgency === 'urgent' ? (
                        <Badge variant="destructive" size="sm">Залишилось {d.daysLeft} дн.</Badge>
                      ) : d.urgency === 'upcoming' ? (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400" size="sm">{d.daysLeft} дн.</Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">{d.daysLeft} дн.</Badge>
                      )}
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Export row */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4" /> Скопіювати дедлайни
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={filtered.length > 0 ? buildGoogleCalendarUrl(filtered[0]) : "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Calendar className="h-4 w-4" /> Додати у Google Calendar
          </a>
        </Button>
        <Button variant="outline" size="sm" disabled>
          <Bell className="h-4 w-4" /> Підписатись на нагадування
        </Button>
      </div>
    </div>
  );
};
