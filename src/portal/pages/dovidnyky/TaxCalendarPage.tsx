import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { DEADLINES, getCurrentQuarter, type Deadline } from "@/portal/data/deadlines";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];
const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const monthMap: Record<string, number> = {
  'січня': 0, 'лютого': 1, 'березня': 2, 'квітня': 3,
  'травня': 4, 'червня': 5, 'липня': 6, 'серпня': 7,
  'вересня': 8, 'жовтня': 9, 'листопада': 10, 'грудня': 11,
};

function parseDeadlineDate(dateStr: string): Date {
  const parts = dateStr.split(" ");
  const day = parseInt(parts[0]);
  const month = monthMap[parts[1]];
  const year = parts.length >= 3 && /^\d{4}$/.test(parts[2]) ? parseInt(parts[2]) : new Date().getFullYear();
  return new Date(year, month, day);
}

function buildGoogleCalUrl(d: Deadline): string {
  const dt = parseDeadlineDate(d.date);
  const ymd = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(d.title)}&dates=${ymd}/${ymd}&details=${encodeURIComponent(`${d.legalBasis}. ${d.penalty}`)}`;
}

const TAX_TYPE_OPTIONS = [
  { value: "all", label: "Всі" },
  { value: "fop1", label: "ФОП 1 група" },
  { value: "fop2", label: "ФОП 2 група" },
  { value: "fop3", label: "ФОП 3 група" },
  { value: "tov", label: "ТОВ" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Всі" },
  { value: "payment", label: "💳 Оплата" },
  { value: "report", label: "📄 Звітність" },
];

const URGENCY_OPTIONS = [
  { value: "all", label: "Всі" },
  { value: "urgent", label: "🔴 Термінові" },
  { value: "upcoming", label: "🟡 Найближчі" },
  { value: "ok", label: "🟢 В нормі" },
];

const URGENCY_BADGE: Record<Deadline["urgency"], { label: string; cls: string }> = {
  urgent: { label: "Терміново", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  upcoming: { label: "Найближчий", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  ok: { label: "В нормі", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function TaxCalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [taxType, setTaxType] = useState("all");
  const [type, setType] = useState("all");
  const [urgency, setUrgency] = useState("all");

  const filtered = useMemo(() => {
    return DEADLINES.filter((d) => {
      if (taxType !== "all" && d.taxType !== taxType && d.taxType !== "all") return false;
      if (type !== "all" && d.type !== type) return false;
      if (urgency !== "all" && d.urgency !== urgency) return false;
      return true;
    });
  }, [taxType, type, urgency]);

  const monthDeadlines = useMemo(() => {
    return filtered.filter((d) => {
      const dt = parseDeadlineDate(d.date);
      return dt.getMonth() === month && dt.getFullYear() === year;
    }).sort((a, b) => parseDeadlineDate(a.date).getTime() - parseDeadlineDate(b.date).getTime());
  }, [filtered, month, year]);

  // Days with deadlines for the grid
  const deadlineDays = useMemo(() => {
    const map = new Map<number, Deadline[]>();
    monthDeadlines.forEach((d) => {
      const day = parseDeadlineDate(d.date).getDate();
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(d);
    });
    return map;
  }, [monthDeadlines]);

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0

  const prevMonth = () => {
    setSelectedDay(null);
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const handleDayClick = (day: number) => {
    if (!deadlineDays.has(day)) return;
    setSelectedDay(prev => prev === day ? null : day);
  };

  const displayedDeadlines = selectedDay !== null
    ? monthDeadlines.filter(d => parseDeadlineDate(d.date).getDate() === selectedDay)
    : monthDeadlines;

  const activeFilterCount = [taxType !== "all", type !== "all", urgency !== "all"].filter(Boolean).length;

  const sidebar = (
    <>
      <FilterSection title="Група ФОП">
        <FilterRadioGroup options={TAX_TYPE_OPTIONS} value={taxType} onChange={setTaxType} />
      </FilterSection>
      <FilterSection title="Тип">
        <FilterRadioGroup options={TYPE_OPTIONS} value={type} onChange={setType} />
      </FilterSection>
      <FilterSection title="Статус">
        <FilterRadioGroup options={URGENCY_OPTIONS} value={urgency} onChange={setUrgency} />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout meta={{ title: "Податковий календар", description: "Дедлайни оплат і звітності для ФОП та ТОВ", canonical: "/dovidnyky/kalendar" }}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <BreadcrumbNav
          items={[
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Податковий календар" },
          ]}
        />

        <div>
          <h1 className="text-2xl font-bold text-foreground">📅 Податковий календар</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Дедлайни оплат і звітності для ФОП та ТОВ на {year} рік
          </p>
        </div>

        <DirectorySidebarLayout
          sidebar={sidebar}
          activeFilterCount={activeFilterCount}
          onResetFilters={() => { setTaxType("all"); setType("all"); setUrgency("all"); }}
          resultCount={monthDeadlines.length}
          resultLabel="дедлайнів"
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">
              {MONTH_NAMES[month]} {year}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden mb-6">
            {DAY_NAMES.map((d) => (
              <div key={d} className="bg-muted px-1 py-1.5 text-center text-[10px] font-medium text-muted-foreground uppercase">
                {d}
              </div>
            ))}
            {Array.from({ length: startDow }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-card p-1 min-h-[2.5rem]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dls = deadlineDays.get(day);
              const worstUrgency = dls?.reduce<Deadline["urgency"]>((worst, d) => {
                if (d.urgency === "urgent") return "urgent";
                if (d.urgency === "upcoming" && worst !== "urgent") return "upcoming";
                return worst;
              }, "ok");

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "bg-card p-1 min-h-[2.5rem] relative",
                    dls && "cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedDay === day && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full",
                      isToday && "bg-primary text-primary-foreground",
                      !isToday && dls && worstUrgency === "urgent" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                      !isToday && dls && worstUrgency === "upcoming" && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                      !isToday && dls && worstUrgency === "ok" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
                    )}
                  >
                    {day}
                  </span>
                  {dls && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap">
                      {dls.map((d) => (
                        <span
                          key={d.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            d.urgency === "urgent" && "bg-red-500",
                            d.urgency === "upcoming" && "bg-amber-500",
                            d.urgency === "ok" && "bg-emerald-500",
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Deadline cards */}
          {selectedDay !== null && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                Фільтр: <span className="font-medium text-foreground">{selectedDay} {MONTH_NAMES[month].toLowerCase()}</span>
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)} className="text-xs h-7">
                Показати всі
              </Button>
            </div>
          )}

          {displayedDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {selectedDay !== null ? "Немає дедлайнів на цю дату" : "Немає дедлайнів у цьому місяці за обраними фільтрами"}
            </p>
          ) : (
            <div className="space-y-3">
              {displayedDeadlines.map((d) => {
                const badge = URGENCY_BADGE[d.urgency];
                return (
                  <div key={d.id} className="rounded-lg border border-border/70 bg-card p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">{d.date}</p>
                        <p className="text-sm text-foreground">
                          {d.type === "payment" ? "💳" : "📄"} {d.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {d.legalBasis} · {d.penalty}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("shrink-0 text-[10px]", badge.cls)}>
                        {d.daysLeft} дн.
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn("text-[10px]", badge.cls)}>
                        {badge.label}
                      </Badge>
                      <a
                        href={buildGoogleCalUrl(d)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <CalendarDays className="h-3 w-3" />
                        Google Calendar
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DirectorySidebarLayout>
      </div>
          <RelatedPartnersBlock directoryId="kalendar" />
    </PortalLayout>
  );
}
