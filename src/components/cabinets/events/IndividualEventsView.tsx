import { useMemo, useState } from "react";
import { addDays, isAfter, isBefore, startOfDay, startOfWeek, isSameDay } from "date-fns";
import { Plus } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getIndividualRichEvents,
  EVENT_CHANNELS_LIST,
  type EventChannel,
} from "@/config/individualEventsRich";
import { EventsDailyBrief, computeBriefText } from "./EventsDailyBrief";
import { EventsMiniCalendar } from "./EventsMiniCalendar";
import { EventsTimeline, type TimelineEvent } from "./EventsTimeline";
import { EventChannelChip } from "./EventChannelChip";
import { cn } from "@/lib/utils";

interface Props {
  cabinet: Cabinet;
  onAddEvent?: () => void;
}

/**
 * Rich Events view for individual cabinets. Replaces the legacy calendar+list
 * layout in MyEventsTab with: AI Daily Brief + density mini-calendar + 4-section
 * timeline (Overdue / Today / Upcoming / History) + channel filtering.
 */
export function IndividualEventsView({ cabinet, onAddEvent }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeChannels, setActiveChannels] = useState<Set<EventChannel>>(new Set());

  const allEvents = useMemo<TimelineEvent[]>(() => getIndividualRichEvents(), []);

  const filteredEvents = useMemo(() => {
    if (activeChannels.size === 0) return allEvents;
    return allEvents.filter((e) => activeChannels.has(e.channel));
  }, [allEvents, activeChannels]);

  const counts = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const in7days = addDays(today, 7);
    let scheduledToday = 0;
    let upcomingDeadlines = 0;
    let overdue = 0;
    let completedThisWeek = 0;
    for (const e of allEvents) {
      if (e.status === "overdue") overdue++;
      if (isSameDay(e.at, today) && (e.status === "scheduled" || e.status === "info")) scheduledToday++;
      if (e.status === "deadline" && isAfter(e.at, today) && isBefore(e.at, in7days)) upcomingDeadlines++;
      if (e.status === "completed" && isAfter(e.at, weekStart) && isBefore(e.at, today)) completedThisWeek++;
    }
    return { scheduledToday, upcomingDeadlines, overdue, completedThisWeek };
  }, [allEvents]);

  const briefText = useMemo(() => computeBriefText(counts), [counts]);

  const miniCalEvents = useMemo(
    () =>
      filteredEvents.map((e) => ({
        at: e.at,
        channel: e.channel,
        isOverdue: e.status === "overdue",
        isDeadline: e.status === "deadline",
      })),
    [filteredEvents],
  );

  const toggleChannel = (ch: EventChannel) => {
    setActiveChannels((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Мої події</h3>
          <p className="text-xs text-muted-foreground">
            AI-стрічка ваших подій з усіх джерел: бронювання, платежі, податки, документи.
          </p>
        </div>
        {onAddEvent && (
          <Button size="sm" onClick={onAddEvent}>
            <Plus className="w-4 h-4 mr-1.5" />
            Додати подію
          </Button>
        )}
      </div>

      {/* AI Brief */}
      <EventsDailyBrief counts={counts} briefText={briefText} />

      {/* Channel filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mr-1">
          Фільтр:
        </span>
        <button
          onClick={() => setActiveChannels(new Set())}
          className={cn(
            "text-xs px-2.5 py-1 rounded-md border transition-colors",
            activeChannels.size === 0
              ? "border-primary bg-primary/10 text-primary font-medium"
              : "border-border/60 text-muted-foreground hover:bg-accent/40",
          )}
        >
          Усі
          <Badge variant="outline" size="sm" className="ml-1.5 text-[10px] tabular-nums">
            {allEvents.length}
          </Badge>
        </button>
        {EVENT_CHANNELS_LIST.map((meta) => {
          const count = allEvents.filter((e) => e.channel === meta.id).length;
          if (count === 0) return null;
          const active = activeChannels.has(meta.id);
          return (
            <button
              key={meta.id}
              onClick={() => toggleChannel(meta.id)}
              className={cn(
                "transition-opacity",
                active ? "opacity-100" : "opacity-70 hover:opacity-100",
              )}
              aria-pressed={active}
            >
              <EventChannelChip channel={meta.id} size="md" />
            </button>
          );
        })}
      </div>

      {/* Layout: mini-calendar + timeline */}
      <div className="grid md:grid-cols-[auto_1fr] gap-4">
        <EventsMiniCalendar
          events={miniCalEvents}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
        <div className="min-w-0">
          <EventsTimeline events={filteredEvents} selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}
