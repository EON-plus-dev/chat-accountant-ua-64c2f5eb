import { useMemo, useState, useCallback, type SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { format, isBefore, isAfter, addDays, differenceInCalendarDays } from "date-fns";
import type { ReportScheduleItem } from "@/lib/reportScheduleEngine";
import type { Report, ReportType } from "@/config/reportsConfig";
import { migrateReportStatus, reportTypeConfig } from "@/config/reportsConfig";
import { Sparkline } from "@/components/ui/Sparkline";
import { getCabinetPaymentDisciplineStats } from "@/lib/paymentDiscipline";
import { resolvePaymentStatusForReport } from "@/lib/paymentResolver";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarClock,
  Loader2,
  Eye,
  ChevronRight,
  
  Info,
  TrendingUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReportTimelineCalendarProps {
  schedule: ReportScheduleItem[];
  reports?: Report[];
  /** Filtered subset of reports — used to compute which schedule items match active page filters */
  filteredReports?: Report[];
  filterTypes?: ReportType[];
  filterStatuses?: string[];
  quickFilter?: string | null;
  hasActiveFilters?: boolean;
  onScheduleItemClick?: (item: ReportScheduleItem) => void;
  year?: number;
  compact?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  title?: string;
  /** Controlled selected month (0-11) or null. If provided, internal state is bypassed. */
  selectedMonth?: number | null;
  /** Controlled month setter — required when `selectedMonth` is provided. */
  onSelectMonth?: (m: number | null) => void;
}


type ScheduleStatus =
  | "completed"
  | "current"
  | "upcoming"
  | "overdue"
  | "scheduled"
  | "processing"
  | "review";

function getScheduleStatus(item: ReportScheduleItem, reports: Report[]): ScheduleStatus {
  const today = new Date();
  const deadline = new Date(item.deadline);

  const relatedReport = reports.find(
    (r) => r.type === item.type && r.periodLabel?.includes(item.periodLabel || "")
  );

  if (relatedReport) {
    const status = migrateReportStatus(relatedReport.status);
    if (status === "submitted" || status === "accepted") return "completed";
    if (status === "processing") return "processing";
    if (status === "review") return "review";
    if (status === "scheduled") return "scheduled";
    if (status === "approved") return "current";
  }

  if (isBefore(deadline, today)) return "overdue";
  if (isBefore(today, deadline) && isAfter(today, addDays(deadline, -30))) return "current";
  return "scheduled";
}

const statusConfig: Record<
  ScheduleStatus,
  { icon: typeof CheckCircle2; label: string; dotColor: string; textColor: string; borderColor: string }
> = {
  completed: {
    icon: CheckCircle2,
    label: "Подано",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/40",
  },
  current: {
    icon: Clock,
    label: "В роботі",
    dotColor: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/40",
  },
  overdue: {
    icon: AlertCircle,
    label: "Прострочено",
    dotColor: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-500/40",
  },
  upcoming: {
    icon: CalendarClock,
    label: "Очікується",
    dotColor: "bg-muted-foreground/50",
    textColor: "text-muted-foreground",
    borderColor: "border-border",
  },
  scheduled: {
    icon: CalendarClock,
    label: "Заплановано",
    dotColor: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/40",
  },
  processing: {
    icon: Loader2,
    label: "Формується",
    dotColor: "bg-purple-500",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/40",
  },
  review: {
    icon: Eye,
    label: "На перевірку",
    dotColor: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/40",
  },
};

const typeLabels: Record<string, string> = {
  ep: "ЄП",
  esv: "ЄСВ",
  vz: "ВЗ",
  mpz: "МПЗ",
  "1df": "4ДФ",
};

const monthsFull = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];

const statusPriority: Record<ScheduleStatus, number> = {
  overdue: 6,
  current: 5,
  review: 4,
  processing: 3,
  scheduled: 2,
  upcoming: 1,
  completed: 0,
};

function formatRelativeUk(deadline: Date, today: Date): string {
  const days = differenceInCalendarDays(deadline, today);
  if (days === 0) return "сьогодні";
  if (days === 1) return "завтра";
  if (days === -1) return "вчора";
  if (days < 0) {
    const abs = Math.abs(days);
    if (abs < 30) return `прострочено ${abs} ${pluralUk(abs, "день", "дні", "днів")}`;
    const months = Math.round(abs / 30);
    return `прострочено ${months} ${pluralUk(months, "місяць", "місяці", "місяців")}`;
  }
  if (days < 30) return `через ${days} ${pluralUk(days, "день", "дні", "днів")}`;
  const months = Math.round(days / 30);
  return `через ${months} ${pluralUk(months, "місяць", "місяці", "місяців")}`;
}

function pluralUk(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

type TimeBucket = "overdue" | "thisWeek" | "thisMonth" | "later";

const bucketMeta: Record<
  TimeBucket,
  { label: string; icon: typeof AlertCircle; iconClass: string }
> = {
  overdue: { label: "Прострочено", icon: AlertCircle, iconClass: "text-red-500" },
  thisWeek: { label: "Цього тижня", icon: Clock, iconClass: "text-amber-500" },
  thisMonth: { label: "Цього місяця", icon: Calendar, iconClass: "text-muted-foreground" },
  later: { label: "Пізніше", icon: CalendarClock, iconClass: "text-muted-foreground" },
};

function bucketOf(deadline: Date, today: Date): TimeBucket {
  const days = differenceInCalendarDays(deadline, today);
  if (days < 0) return "overdue";
  if (days <= 7) return "thisWeek";
  if (days <= 30) return "thisMonth";
  return "later";
}

type StatusFilter = "all" | "active" | "overdue";

export function ReportTimelineCalendar({
  schedule,
  reports = [],
  filteredReports,
  filterTypes = [],
  filterStatuses = [],
  quickFilter = null,
  hasActiveFilters = false,
  onScheduleItemClick,
  year = new Date().getFullYear(),
  compact = false,
  maxItems = 3,
  onViewAll,
  title,
  selectedMonth: controlledMonth,
  onSelectMonth: controlledOnSelectMonth,
}: ReportTimelineCalendarProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const isCurrentYear = year === currentYear;
  const currentMonthIndex = isCurrentYear ? today.getMonth() : -1;

  const isControlled = controlledMonth !== undefined;
  const [internalMonth, setInternalMonth] = useState<number | null>(null);
  const selectedMonth = isControlled ? controlledMonth : internalMonth;
  const setSelectedMonth = useCallback(
    (next: number | null | ((prev: number | null) => number | null)) => {
      if (isControlled) {
        const value =
          typeof next === "function"
            ? (next as (p: number | null) => number | null)(controlledMonth ?? null)
            : next;
        controlledOnSelectMonth?.(value);
      } else {
        setInternalMonth(next as SetStateAction<number | null>);
      }
    },
    [isControlled, controlledMonth, controlledOnSelectMonth]
  );
  const [showAll, setShowAll] = useState(false);

  const yearItems = useMemo(
    () => schedule.filter((i) => new Date(i.deadline).getFullYear() === year),
    [schedule, year]
  );

  // Memoize per-item status to avoid recomputing inside monthData/heroItem/render.
  // Key by `${type}::${deadline}::${periodLabel}` — stable across renders.
  const statusByKey = useMemo(() => {
    const map = new Map<string, ScheduleStatus>();
    yearItems.forEach((item) => {
      const key = `${item.type}::${item.deadline}::${item.periodLabel ?? ""}`;
      map.set(key, getScheduleStatus(item, reports));
    });
    return map;
  }, [yearItems, reports]);

  const statusOf = useCallback(
    (item: ReportScheduleItem): ScheduleStatus => {
      const key = `${item.type}::${item.deadline}::${item.periodLabel ?? ""}`;
      return statusByKey.get(key) ?? getScheduleStatus(item, reports);
    },
    [statusByKey, reports]
  );

  // Build a Set of "matching" schedule items based on page-level filters.
  // A schedule item matches if:
  //  (a) no active filters → all match, OR
  //  (b) it has a corresponding report in `filteredReports`, OR
  //  (c) it has no related report yet AND only type-filter is active AND its type ∈ filterTypes
  const matchingKeys = useMemo(() => {
    const keyOf = (type: string, periodLabel?: string) => `${type}::${periodLabel ?? ""}`;
    if (!hasActiveFilters) {
      return null; // null = "everything matches"
    }
    const set = new Set<string>();
    const fr = filteredReports ?? [];
    fr.forEach((r) => set.add(keyOf(r.type, r.periodLabel)));
    // Items without a report — match purely by type filter (when status/quick/search not active)
    const onlyTypeFilter =
      filterTypes.length > 0 &&
      filterStatuses.length === 0 &&
      !quickFilter;
    if (onlyTypeFilter) {
      yearItems.forEach((item) => {
        const hasReport = reports.some(
          (r) => r.type === item.type && r.periodLabel?.includes(item.periodLabel || "")
        );
        if (!hasReport && filterTypes.includes(item.type as ReportType)) {
          set.add(keyOf(item.type, item.periodLabel));
        }
      });
    }
    return set;
  }, [hasActiveFilters, filteredReports, filterTypes, filterStatuses, quickFilter, yearItems, reports]);

  const isMatching = (item: ReportScheduleItem) => {
    if (matchingKeys === null) return true;
    return matchingKeys.has(`${item.type}::${item.periodLabel ?? ""}`);
  };

  // Per-month items + per-month-per-status counts (for dot strip)
  // Splits matching vs non-matching to support dimming when filters active.
  const monthData = useMemo(() => {
    const buckets: Array<{
      items: ReportScheduleItem[];
      statusCounts: Partial<Record<ScheduleStatus, number>>;
      dimmedCounts: Partial<Record<ScheduleStatus, number>>;
      worst: ScheduleStatus | null;
    }> = Array.from({ length: 12 }, () => ({
      items: [],
      statusCounts: {},
      dimmedCounts: {},
      worst: null,
    }));

    yearItems.forEach((item) => {
      const m = new Date(item.deadline).getMonth();
      buckets[m].items.push(item);
      const s = statusOf(item);
      if (isMatching(item)) {
        buckets[m].statusCounts[s] = (buckets[m].statusCounts[s] || 0) + 1;
      } else {
        buckets[m].dimmedCounts[s] = (buckets[m].dimmedCounts[s] || 0) + 1;
      }
      if (!buckets[m].worst || statusPriority[s] > statusPriority[buckets[m].worst!]) {
        buckets[m].worst = s;
      }
    });
    buckets.forEach((b) =>
      b.items.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    );
    return buckets;
  }, [yearItems, statusOf, matchingKeys]);

  // Items shown in hero/list = matching only, optionally narrowed by selectedMonth (zoom).
  const filteredItems = useMemo(() => {
    let items = selectedMonth !== null ? monthData[selectedMonth].items : yearItems;
    items = items.filter((i) => isMatching(i));
    return [...items].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  }, [yearItems, monthData, selectedMonth, matchingKeys]);


  // Hero = next active deadline (overdue first, then earliest upcoming)
  const heroItem = useMemo(() => {
    const active = filteredItems.filter((i) => statusOf(i) !== "completed");
    if (active.length === 0) return null;
    const overdue = active.filter((i) => statusOf(i) === "overdue");
    return overdue.length > 0 ? overdue[overdue.length - 1] : active[0];
  }, [filteredItems, statusOf]);

  const restItems = useMemo(
    () => filteredItems.filter((i) => i !== heroItem),
    [filteredItems, heroItem]
  );

  // Group rest into buckets
  const grouped = useMemo(() => {
    const groups: Record<TimeBucket, ReportScheduleItem[]> = {
      overdue: [],
      thisWeek: [],
      thisMonth: [],
      later: [],
    };
    restItems.forEach((item) => {
      groups[bucketOf(new Date(item.deadline), today)].push(item);
    });
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restItems]);

  const visibleLimit = 6;
  const flatRest = useMemo(() => {
    const out: Array<{ item: ReportScheduleItem; bucket: TimeBucket }> = [];
    (Object.keys(grouped) as TimeBucket[]).forEach((b) => {
      grouped[b].forEach((item) => out.push({ item, bucket: b }));
    });
    return out;
  }, [grouped]);

  const visibleRest = showAll ? flatRest : flatRest.slice(0, visibleLimit);
  const hiddenCount = flatRest.length - visibleRest.length;

  const visibleByBucket = useMemo(() => {
    const map = new Map<TimeBucket, ReportScheduleItem[]>();
    visibleRest.forEach(({ item, bucket }) => {
      if (!map.has(bucket)) map.set(bucket, []);
      map.get(bucket)!.push(item);
    });
    return map;
  }, [visibleRest]);

  // ============== Compact mode (Cabinet Overview) ==============
  if (compact) {
    const compactActive = yearItems
      .filter((i) => getScheduleStatus(i, reports) !== "completed")
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    const compactHero = compactActive[0] ?? null;
    const compactRest = compactHero
      ? compactActive.slice(1, Math.max(1, maxItems))
      : [];

    return (
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2">
          <CardTitle className="text-base flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{title ?? "Найближчі звіти"}</span>
          </CardTitle>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs text-primary hover:underline shrink-0 inline-flex items-center gap-0.5"
            >
              Усі <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {yearItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              У {year} році дедлайнів немає.
            </div>
          ) : (
            <>
              <DotStrip
                monthData={monthData}
                currentMonthIndex={currentMonthIndex}
                selectedMonth={null}
                onSelectMonth={() => onViewAll?.()}
              />
              {compactHero ? (
                <div className="space-y-2">
                  <HeroDeadlineCard
                    item={compactHero}
                    reports={reports}
                    today={today}
                    onClick={() => onScheduleItemClick?.(compactHero)}
                  />
                  {compactRest.length > 0 && (
                    <ul>
                      {compactRest.map((item, idx) => (
                        <CompactListRow
                          key={`compact-${idx}`}
                          item={item}
                          reports={reports}
                          today={today}
                          onClick={() => onScheduleItemClick?.(item)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Усі звіти подано — нових дедлайнів немає 🎉
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0 gap-2 flex-wrap">
        <CardTitle className="text-base flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">Графік звітності {year}</span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground/60 hover:text-muted-foreground"
                  aria-label="Легенда статусів"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs space-y-1">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Прострочено</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> В роботі</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Заплановано</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Подано</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        {yearItems.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground tabular-nums">
              {hasActiveFilters
                ? `${filteredItems.length} з ${yearItems.length}`
                : filteredItems.length}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {yearItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            У {year} році дедлайнів немає.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
            <div className="space-y-4 min-w-0">
              {/* Status legend (above DotStrip) */}
              <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Подано
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> На перевірку
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Заплановано
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Прострочено
                </span>
                {hasActiveFilters && (
                  <span className="inline-flex items-center gap-1.5 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> Поза фільтром
                  </span>
                )}
              </div>

              {/* ZONE A — Dot Strip */}
              <DotStrip
                monthData={monthData}
                currentMonthIndex={currentMonthIndex}
                selectedMonth={selectedMonth}
                onSelectMonth={(m) => setSelectedMonth((prev) => (prev === m ? null : m))}
              />



              {/* ZONE B — Hero + compact list */}
              {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Немає дедлайнів за цим фільтром.
                </div>
              ) : (
                <div className="space-y-4">
                  {heroItem && (
                    <HeroDeadlineCard
                      item={heroItem}
                      reports={reports}
                      today={today}
                      onClick={() => onScheduleItemClick?.(heroItem)}
                    />
                  )}

                  {visibleRest.length > 0 && (
                    <div className="space-y-3">
                      {(Object.keys(grouped) as TimeBucket[])
                        .filter((b) => visibleByBucket.has(b))
                        .map((bucket) => {
                          const items = visibleByBucket.get(bucket)!;
                          const meta = bucketMeta[bucket];
                          const Icon = meta.icon;
                          return (
                            <div key={bucket} className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1">
                                <Icon className={cn("h-3.5 w-3.5", meta.iconClass)} />
                                <span>{meta.label}</span>
                                <span className="text-muted-foreground/60">· {items.length}</span>
                              </div>
                              <ul>
                                {items.map((item, idx) => (
                                  <CompactListRow
                                    key={`${bucket}-${idx}`}
                                    item={item}
                                    reports={reports}
                                    today={today}
                                    onClick={() => onScheduleItemClick?.(item)}
                                  />
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {hiddenCount > 0 && !showAll && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="text-xs text-primary hover:underline px-1"
                    >
                      + ще {hiddenCount} {pluralUk(hiddenCount, "дедлайн", "дедлайни", "дедлайнів")}
                    </button>
                  )}
                  {showAll && flatRest.length > visibleLimit && (
                    <button
                      onClick={() => setShowAll(false)}
                      className="text-xs text-muted-foreground hover:underline px-1"
                    >
                      Згорнути
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* M3: Year summary sidebar (lg+) */}
            <YearSummarySidebar reports={reports} year={year} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============== Year Summary Sidebar (M3) ==============

interface YearSummarySidebarProps {
  reports: Report[];
  year: number;
}

function YearSummarySidebar({ reports, year }: YearSummarySidebarProps) {
  const stats = useMemo(() => {
    const yearReports = reports.filter((r) => r.year === year);
    let submitted = 0;
    let review = 0;
    let overdue = 0;
    yearReports.forEach((r) => {
      const s = migrateReportStatus(r.status);
      if (s === "submitted" || s === "accepted") submitted++;
      else if (s === "review" || s === "processing") review++;
      const today = new Date();
      const deadline = new Date(r.deadline);
      if (
        deadline < today &&
        s !== "submitted" &&
        s !== "accepted"
      ) {
        overdue++;
      }
    });
    return { submitted, review, overdue, total: yearReports.length };
  }, [reports, year]);

  // Платіжна дисципліна — sparkline помісячного on-time rate
  const disciplineSeries = useMemo(() => {
    const monthly: number[] = Array.from({ length: 12 }, () => 0);
    const totals: number[] = Array.from({ length: 12 }, () => 0);
    reports
      .filter((r) => r.year === year)
      .forEach((r) => {
        const resolved = resolvePaymentStatusForReport(r);
        if (resolved.status !== "paid") return;
        const paidDate = resolved.paidDate ?? r.paymentDate;
        if (!paidDate) return;
        const m = new Date(r.deadline).getMonth();
        totals[m]++;
        const onTime = new Date(paidDate) <= new Date(r.deadline);
        if (onTime) monthly[m]++;
      });
    // % on-time per month, default 0 if no data
    return monthly.map((c, i) => (totals[i] > 0 ? Math.round((c / totals[i]) * 100) : 0));
  }, [reports, year]);

  const disciplineStats = useMemo(
    () => getCabinetPaymentDisciplineStats(reports, year),
    [reports, year]
  );

  if (stats.total === 0) {
    return (
      <aside className="hidden lg:flex flex-col gap-3 border-l border-border/40 pl-5">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Зведення {year}
        </div>
        <div className="text-sm text-muted-foreground">Дані з'являться, коли буде хоча б один звіт.</div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col gap-4 border-l border-border/40 pl-5">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Зведення {year}
      </div>

      <div className="space-y-3">
        <SummaryRow
          label="Подано"
          value={stats.submitted}
          accent="text-emerald-600 dark:text-emerald-400"
          dotColor="bg-emerald-500"
        />
        <SummaryRow
          label="На перевірку"
          value={stats.review}
          accent="text-amber-600 dark:text-amber-400"
          dotColor="bg-amber-500"
        />
        <SummaryRow
          label="Прострочено"
          value={stats.overdue}
          accent="text-red-600 dark:text-red-400"
          dotColor="bg-red-500"
        />
      </div>

      {disciplineStats.totalPaid > 0 && (
        <div className="pt-3 border-t border-border/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Дисципліна
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {disciplineStats.onTimeRate}%
            </span>
          </div>
          <Sparkline
            data={disciplineSeries}
            width={200}
            height={32}
            color={
              disciplineStats.onTimeRate >= 80
                ? "success"
                : disciplineStats.onTimeRate >= 50
                ? "warning"
                : "destructive"
            }
            className="w-full"
          />
          <p className="text-[11px] text-muted-foreground leading-tight">
            Вчасні сплати по місяцях ({disciplineStats.totalPaid} платежів)
          </p>
        </div>
      )}
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  dotColor,
}: {
  label: string;
  value: number;
  accent: string;
  dotColor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} aria-hidden />
        {label}
      </span>
      <span className={cn("text-lg font-semibold tabular-nums", value > 0 ? accent : "text-muted-foreground/50")}>
        {value}
      </span>
    </div>
  );
}

// ============== Sub-components ==============

interface DotStripProps {
  monthData: Array<{
    items: ReportScheduleItem[];
    statusCounts: Partial<Record<ScheduleStatus, number>>;
    dimmedCounts?: Partial<Record<ScheduleStatus, number>>;
    worst: ScheduleStatus | null;
  }>;
  currentMonthIndex: number;
  selectedMonth: number | null;
  onSelectMonth: (m: number) => void;
}

const monthsShort = ["Січ","Лют","Бер","Кві","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру"];

function DotStrip({ monthData, currentMonthIndex, selectedMonth, onSelectMonth }: DotStripProps) {

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
        <div
          className="grid grid-cols-12 gap-0 rounded-md border border-border/40 bg-muted/20 overflow-hidden min-w-[420px] sm:min-w-0"
          role="tablist"
          aria-label="Місяці року"
        >
          {monthData.map((data, monthIdx) => {
            const isCurrent = monthIdx === currentMonthIndex;
            const isSelected = selectedMonth === monthIdx;
            const isQuarterStart = monthIdx > 0 && monthIdx % 3 === 0;
            const hasItems = data.items.length > 0;

            const overdueCount = data.statusCounts.overdue || 0;
            const matchingTotal = Object.values(data.statusCounts).reduce(
              (acc, n) => acc + (n || 0),
              0
            );
            const dimmedTotal = Object.values(data.dimmedCounts ?? {}).reduce(
              (acc, n) => acc + (n || 0),
              0
            );
            const tooltipText = !hasItems
              ? `${monthsFull[monthIdx]} · немає дедлайнів`
              : `${monthsFull[monthIdx]} · ${data.items.length} ${pluralUk(data.items.length, "дедлайн", "дедлайни", "дедлайнів")}${
                  dimmedTotal > 0
                    ? ` · ${matchingTotal} за фільтром`
                    : ""
                }${
                  overdueCount > 0
                    ? ` · ${overdueCount} ${pluralUk(overdueCount, "прострочений", "прострочені", "прострочених")}`
                    : ""
                }`;

            // Build dots: order by severity, max 4 visible.
            // Matching dots come first (full opacity), then dimmed (opacity-30).
            const dotOrder: ScheduleStatus[] = [
              "overdue",
              "current",
              "review",
              "processing",
              "scheduled",
              "upcoming",
              "completed",
            ];
            const dots: { color: string; dimmed: boolean }[] = [];
            dotOrder.forEach((s) => {
              const n = data.statusCounts[s] || 0;
              for (let i = 0; i < n; i++) {
                dots.push({ color: statusConfig[s].dotColor, dimmed: false });
              }
            });
            dotOrder.forEach((s) => {
              const n = data.dimmedCounts?.[s] || 0;
              for (let i = 0; i < n; i++) {
                dots.push({ color: statusConfig[s].dotColor, dimmed: true });
              }
            });
            const visibleDots = dots.slice(0, 4);
            const overflow = dots.length - visibleDots.length;


            const Inner = (
              <div
                className={cn(
                  "relative h-10 flex flex-col items-center justify-center px-1 transition-colors",
                  isQuarterStart && "border-l border-border/60",
                  isSelected && "bg-primary/5",
                  isCurrent && !isSelected && "bg-primary/[0.03]",
                  hasItems && "cursor-pointer hover:bg-muted/40",
                  !hasItems && "opacity-40"
                )}
              >
                {/* Today vertical line */}
                {isCurrent && (
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-primary pointer-events-none" />
                )}
                {/* Dots row */}
                <div className="flex items-center gap-0.5 h-3 relative z-10">
                  {visibleDots.length === 0 ? (
                    <div className="w-1 h-1 rounded-full bg-border" />
                  ) : (
                    <>
                      {visibleDots.map((d, i) => (
                        <span
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            d.color,
                            d.dimmed && "opacity-30"
                          )}
                        />
                      ))}
                      {overflow > 0 && (
                        <span className="text-[8px] font-semibold text-muted-foreground ml-0.5 leading-none">
                          +{overflow}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {/* Month letter */}
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] leading-none mt-1 font-medium tracking-tight relative z-10",
                    isCurrent ? "text-primary font-semibold" : "text-muted-foreground/70"
                  )}
                >
                  {monthsShort[monthIdx]}
                </span>
              </div>
            );

            return (
              <Tooltip key={monthIdx}>
                <TooltipTrigger asChild>
                  {hasItems ? (
                    <button
                      onClick={() => onSelectMonth(monthIdx)}
                      aria-label={tooltipText}
                      aria-pressed={isSelected}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:z-10"
                    >
                      {Inner}
                    </button>
                  ) : (
                    <div role="presentation" aria-label={tooltipText}>{Inner}</div>
                  )}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {tooltipText}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        {/* Today label below strip */}
        {currentMonthIndex >= 0 && (
          <div
            className="absolute -bottom-4 text-[10px] text-primary font-medium tabular-nums whitespace-nowrap pointer-events-none"
            style={{
              left: `${((currentMonthIndex + 0.5) / 12) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            Сьогодні
          </div>
        )}
        {currentMonthIndex >= 0 && <div className="h-4" />}
      </div>
    </TooltipProvider>
  );
}

interface HeroCardProps {
  item: ReportScheduleItem;
  reports: Report[];
  today: Date;
  onClick: () => void;
}

function HeroDeadlineCard({ item, reports, today, onClick }: HeroCardProps) {
  const status = getScheduleStatus(item, reports);
  const config = statusConfig[status];
  const Icon = config.icon;
  const deadline = new Date(item.deadline);
  const typeLabel =
    typeLabels[item.type] ||
    reportTypeConfig[item.type as ReportType]?.shortLabel ||
    item.type;
  const isOverdue = status === "overdue";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border bg-card transition-colors",
        "hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        config.borderColor,
        isOverdue && "bg-red-500/[0.03] dark:bg-red-500/[0.05]"
      )}
    >
      <div className="p-3 sm:p-4 flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-md flex items-center justify-center shrink-0",
            isOverdue ? "bg-red-500/10" : "bg-primary/10"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              config.textColor,
              status === "processing" && "animate-spin"
            )}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {typeLabel}
            </span>
            <span className="text-sm text-muted-foreground truncate">
              {item.periodLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span>Подати до {format(deadline, "dd.MM.yyyy")}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className={cn("font-medium", config.textColor)}>
              {formatRelativeUk(deadline, today)}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs font-medium transition-colors",
              isOverdue
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            Відкрити
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0 sm:hidden" />
      </div>
    </button>
  );
}

interface RowProps {
  item: ReportScheduleItem;
  reports: Report[];
  today: Date;
  onClick: () => void;
}

function CompactListRow({ item, reports, today, onClick }: RowProps) {
  const status = getScheduleStatus(item, reports);
  const config = statusConfig[status];
  const deadline = new Date(item.deadline);
  const typeLabel =
    typeLabels[item.type] ||
    reportTypeConfig[item.type as ReportType]?.shortLabel ||
    item.type;

  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "group w-full min-h-10 flex items-center gap-2.5 px-2 py-2 text-left rounded-md",
          "hover:bg-muted/40 transition-colors",
          "focus:outline-none focus-visible:bg-muted/40 focus-visible:ring-1 focus-visible:ring-primary/40"
        )}
      >
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotColor)}
          aria-hidden
        />
        <span className="text-[10px] font-bold text-muted-foreground tabular-nums shrink-0 w-8">
          {typeLabel}
        </span>
        <span className="text-sm text-foreground truncate min-w-0 flex-1">
          {item.periodLabel}
        </span>
        <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums shrink-0">
          {format(deadline, "dd.MM")}
        </span>
        <span
          className={cn(
            "text-xs tabular-nums shrink-0",
            config.textColor
          )}
        >
          {formatRelativeUk(deadline, today)}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 shrink-0 transition-colors" />
      </button>
    </li>
  );
}
