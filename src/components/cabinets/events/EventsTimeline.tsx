import { useMemo, useState } from "react";
import { format, isToday, isYesterday, isTomorrow, addDays, isBefore, isAfter, startOfDay, isSameDay } from "date-fns";
import { uk } from "date-fns/locale";
import { ChevronDown, ChevronRight, AlertOctagon, CalendarDays, Clock4, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EventChannelChip } from "./EventChannelChip";
import type { IndividualRichEvent } from "@/config/individualEventsRich";
import { formatCurrency } from "@/lib/formatters";

export interface TimelineEvent extends IndividualRichEvent {
  at: Date;
  isAllDay: boolean;
}

interface Props {
  events: TimelineEvent[];
  selectedDate?: Date;
  onEventClick?: (event: TimelineEvent) => void;
}

type SectionId = "overdue" | "today" | "upcoming" | "history";

interface Section {
  id: SectionId;
  label: string;
  icon: typeof AlertOctagon;
  railClass: string;
  defaultOpen: boolean;
}

const SECTIONS: Section[] = [
  { id: "overdue",  label: "Прострочено",              icon: AlertOctagon, railClass: "bg-destructive",        defaultOpen: true },
  { id: "today",    label: "Сьогодні",                 icon: CalendarDays, railClass: "bg-primary",            defaultOpen: true },
  { id: "upcoming", label: "Найближчі події",          icon: Clock4,       railClass: "bg-muted-foreground/30", defaultOpen: true },
  { id: "history",  label: "Історія (останні 60 днів)", icon: History,      railClass: "bg-border",             defaultOpen: false },
];

export function EventsTimeline({ events, selectedDate, onEventClick }: Props) {
  const today = startOfDay(new Date());

  const grouped = useMemo(() => {
    const buckets: Record<SectionId, TimelineEvent[]> = {
      overdue: [], today: [], upcoming: [], history: [],
    };
    for (const e of events) {
      if (selectedDate && !isSameDay(e.at, selectedDate)) continue;
      if (e.status === "overdue") { buckets.overdue.push(e); continue; }
      if (isSameDay(e.at, today)) {
        buckets.today.push(e);
      } else if (isAfter(e.at, today)) {
        buckets.upcoming.push(e);
      } else if (isBefore(e.at, today)) {
        buckets.history.push(e);
      }
    }
    buckets.overdue.sort((a, b) => a.at.getTime() - b.at.getTime());
    buckets.today.sort((a, b) => a.at.getTime() - b.at.getTime());
    buckets.upcoming.sort((a, b) => a.at.getTime() - b.at.getTime());
    buckets.history.sort((a, b) => b.at.getTime() - a.at.getTime());
    return buckets;
  }, [events, selectedDate, today]);

  const totalVisible = grouped.overdue.length + grouped.today.length + grouped.upcoming.length + grouped.history.length;

  if (totalVisible === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg">
        <CalendarDays className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Подій на цей день немає</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {SECTIONS.map((section) => {
        const items = grouped[section.id];
        if (items.length === 0) return null;
        return (
          <TimelineSection
            key={section.id}
            section={section}
            items={items}
            onEventClick={onEventClick}
          />
        );
      })}
    </div>
  );
}

function TimelineSection({
  section, items, onEventClick,
}: {
  section: Section;
  items: TimelineEvent[];
  onEventClick?: (e: TimelineEvent) => void;
}) {
  const [open, setOpen] = useState(section.defaultOpen);
  const Icon = section.icon;

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-1 py-1.5 text-left"
        aria-expanded={open}
      >
        <Icon className={cn("w-4 h-4", section.id === "overdue" ? "text-destructive" : "text-muted-foreground")} />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {section.label}
        </span>
        <Badge variant="outline" size="sm" className="text-[10px] tabular-nums">{items.length}</Badge>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="space-y-1.5 mt-1">
          {items.map((e, idx) => {
            const prev = items[idx - 1];
            const showDayLabel = !prev || !isSameDay(prev.at, e.at);
            return (
              <div key={e.id}>
                {showDayLabel && section.id !== "today" && (
                  <div className="text-[11px] font-medium text-muted-foreground px-3 py-1">
                    {formatDayLabel(e.at)}
                  </div>
                )}
                <EventRow event={e} railClass={section.railClass} onClick={onEventClick} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EventRow({
  event, railClass, onClick,
}: {
  event: TimelineEvent;
  railClass: string;
  onClick?: (e: TimelineEvent) => void;
}) {
  const clickable = !!onClick;
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => onClick?.(event)}
      onKeyDown={(ev) => { if (clickable && ev.key === "Enter") onClick?.(event); }}
      className={cn(
        "relative pl-4 pr-3 py-2.5 rounded-md border bg-card flex items-start gap-3 transition-colors",
        clickable && "cursor-pointer hover:bg-accent/40",
        event.status === "overdue" && "border-destructive/40 bg-destructive/5",
        event.status === "completed" && "opacity-70",
      )}
    >
      <span className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r-md", railClass)} aria-hidden />

      <div className="flex-shrink-0 w-12 text-right pr-1 pt-0.5">
        <div className="text-xs font-semibold tabular-nums text-foreground">
          {event.isAllDay ? "—" : format(event.at, "HH:mm")}
        </div>
        <div className="text-[10px] text-muted-foreground tabular-nums">
          {format(event.at, "d MMM", { locale: uk })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <EventChannelChip channel={event.channel} />
          <span className={cn(
            "text-sm font-medium",
            event.status === "completed" && "line-through text-muted-foreground"
          )}>
            {event.title}
          </span>
          {event.tag && (
            <Badge variant="outline" size="sm" className="text-[10px]">{event.tag}</Badge>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
        )}
      </div>

      {event.amount !== undefined && (
        <div className="flex-shrink-0 text-right pt-0.5">
          <div className={cn(
            "text-sm font-semibold tabular-nums",
            event.status === "overdue" && "text-destructive",
          )}>
            {formatCurrency(event.amount)}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDayLabel(d: Date): string {
  if (isToday(d)) return "Сьогодні";
  if (isYesterday(d)) return "Вчора";
  if (isTomorrow(d)) return "Завтра";
  return format(d, "EEEE, d MMMM", { locale: uk });
}
