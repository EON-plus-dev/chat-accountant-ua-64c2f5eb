/**
 * MyEventsTab - User-created events view with calendar + list + AI integration.
 * Also overlays upcoming SYSTEM events (read-only) so the user has a single
 * forward-looking view in one place.
 */
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { format, isSameDay, isAfter, isBefore } from "date-fns";
import { uk } from "date-fns/locale";
import {
  Plus,
  Bell,
  CheckCircle2,
  Trash2,
  Sparkles,
  Calendar as CalendarIcon,
  Landmark,
  PlusCircle,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { useUserEvents, type CreateEventInput } from "@/hooks/useUserEvents";
import { getEventJournalConfig, type JournalEvent } from "@/config/eventJournalConfig";
import { hasCapability } from "@/config/cabinetCapabilities";
import {
  useMyBookingsAsEvents,
  type MyBookingEvent,
} from "./bookings/useMyBookingsAsEvents";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import AddEventDialog from "./AddEventDialog";
import { IndividualEventsView } from "./events/IndividualEventsView";

interface MyEventsTabProps {
  cabinet: Cabinet;
  onOpenSystemEvent?: (eventId: string) => void;
  /** Deep-link: highlight a specific user event row (by user_events.id, no "u:" prefix). */
  highlightId?: string | null;
  onClearHighlight?: () => void;
}

type FilterMode = "all" | "mine" | "system";

interface UnifiedItem {
  id: string;
  kind: "user" | "system" | "booking";
  date: Date;
  title: string;
  description?: string;
  // user-only
  status?: "scheduled" | "completed" | "cancelled";
  source?: "manual" | "ai";
  reminderAt?: Date;
  // system-only
  systemEvent?: JournalEvent;
  // booking-only
  bookingEvent?: MyBookingEvent;
}


export const MyEventsTab = (props: MyEventsTabProps) => {
  // ── Individual cabinets: new rich AI-OS view (Phase B redesign) ─────────
  if (props.cabinet.type === "individual") {
    return <IndividualEventsView cabinet={props.cabinet} />;
  }
  return <LegacyMyEventsTab {...props} />;
};

const LegacyMyEventsTab = ({ cabinet, onOpenSystemEvent, highlightId, onClearHighlight }: MyEventsTabProps) => {
  const { events, reminders, loading, createEvent, updateStatus, deleteEvent } = useUserEvents(cabinet.id);
  const [addOpen, setAddOpen] = useState(false);
  const [addInitial, setAddInitial] = useState<Partial<CreateEventInput> | undefined>(undefined);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<FilterMode>("all");
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Layer "📒 Мої бронювання" — для майстрів з активною salon-master делегацією.
  const canSeeBookings = hasCapability(cabinet, "bookings_personal:view");
  const [bookingsLayerOn, setBookingsLayerOn] = useState(true);
  const myBookings = useMyBookingsAsEvents(canSeeBookings ? cabinet.id : "");
  const { push } = useDrillStack();



  // Deep-link: when highlightId arrives, clear date filter so the row is visible,
  // then scroll into view and pulse the ring for 2.5s.
  useEffect(() => {
    if (!highlightId) return;
    const exists = events.some((e) => e.id === highlightId);
    if (!exists) return;
    setSelectedDate(undefined);
    setFilter("all");
    setActiveHighlight(highlightId);
    const raf = requestAnimationFrame(() => {
      highlightRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    const t = setTimeout(() => {
      setActiveHighlight(null);
      onClearHighlight?.();
    }, 2500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [highlightId, events, onClearHighlight]);

  const remindersByEvent = useMemo(() => {
    const map = new Map<string, typeof reminders>();
    reminders.forEach((r) => {
      const arr = map.get(r.event_id) ?? [];
      arr.push(r);
      map.set(r.event_id, arr);
    });
    return map;
  }, [reminders]);

  // Pull only UPCOMING system events (deadlines & reminders) — read-only overlay
  const systemUpcoming = useMemo<JournalEvent[]>(() => {
    const all = getEventJournalConfig(cabinet.type);
    const now = new Date();
    return all.filter((e) => {
      const d = e.dueDate ?? e.date;
      const isFuture = d.getTime() >= now.getTime() - 60_000;
      const isPlannable =
        e.type === "deadline" ||
        e.type === "notification" ||
        e.type === "report" ||
        !!e.dueDate;
      return isFuture && isPlannable;
    });
  }, [cabinet.type]);

  // Build unified list
  const unified = useMemo<UnifiedItem[]>(() => {
    const userItems: UnifiedItem[] = events.map((e) => ({
      id: `u:${e.id}`,
      kind: "user",
      date: new Date(e.event_at),
      title: e.title,
      description: e.description ?? undefined,
      status: e.status,
      source: e.source,
      reminderAt: remindersByEvent.get(e.id)?.[0]
        ? new Date(remindersByEvent.get(e.id)![0].remind_at)
        : undefined,
    }));

    const systemItems: UnifiedItem[] = systemUpcoming.map((e) => ({
      id: `s:${e.id}`,
      kind: "system",
      date: e.dueDate ?? e.date,
      title: e.title,
      description: e.description,
      systemEvent: e,
    }));

    const bookingItems: UnifiedItem[] =
      canSeeBookings && bookingsLayerOn
        ? myBookings.map((be) => ({
            id: `b:${be.booking.id}`,
            kind: "booking",
            date: be.startAt,
            title: `${be.booking.startTime} · ${be.salonName}`,
            description: `${be.booking.durationMin} хв`,
            bookingEvent: be,
          }))
        : [];

    let combined: UnifiedItem[];
    if (filter === "mine") combined = [...userItems, ...bookingItems];
    else if (filter === "system") combined = systemItems;
    else combined = [...userItems, ...systemItems, ...bookingItems];

    return combined.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, remindersByEvent, systemUpcoming, filter, myBookings, canSeeBookings, bookingsLayerOn]);

  // Calendar dot dates per kind
  const userEventDates = useMemo(
    () => events.map((e) => new Date(e.event_at)),
    [events]
  );
  const systemEventDates = useMemo(
    () => systemUpcoming.map((e) => e.dueDate ?? e.date),
    [systemUpcoming]
  );
  const bookingEventDates = useMemo(
    () => (canSeeBookings && bookingsLayerOn ? myBookings.map((b) => b.startAt) : []),
    [myBookings, canSeeBookings, bookingsLayerOn]
  );

  const handleOpenBooking = (be: MyBookingEvent) => {
    push({
      kind: "booking",
      id: be.booking.id,
      sourceLabel: be.salonName,
      displayName: be.booking.startTime,
    });
  };



  const visibleItems = useMemo(() => {
    if (!selectedDate) return unified;
    return unified.filter((i) => isSameDay(i.date, selectedDate));
  }, [unified, selectedDate]);

  const upcoming = useMemo(
    () =>
      unified
        .filter((i) => isAfter(i.date, new Date()))
        .filter((i) => i.kind === "system" || i.status === "scheduled")
        .slice(0, 3),
    [unified]
  );

  const handleCreateReminderFromSystem = (sys: JournalEvent) => {
    const date = sys.dueDate ?? sys.date;
    setAddInitial({
      title: sys.title,
      description: sys.description,
      event_at: date.toISOString(),
      source: "manual",
    });
    setDialogKey((k) => k + 1);
    setAddOpen(true);
  };

  const handleOpenSystem = (sys: JournalEvent) => {
    if (onOpenSystemEvent) onOpenSystemEvent(sys.id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold">Мої події</h3>
          <p className="text-xs text-muted-foreground">
            Особистий календар + майбутні системні дедлайни в одному місці.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setAddInitial(undefined);
            setDialogKey((k) => k + 1);
            setAddOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Додати подію
        </Button>
      </div>

      {/* Upcoming strip */}
      {upcoming.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Найближчі</span>
            </div>
            <div className="space-y-1.5">
              {upcoming.map((i) => (
                <div key={i.id} className="flex items-center justify-between text-xs gap-2">
                  <span className="truncate flex items-center gap-1.5 min-w-0">
                    {i.kind === "system" && (
                      <Landmark className="w-3 h-3 text-warning flex-shrink-0" />
                    )}
                    <span className="truncate">{i.title}</span>
                  </span>
                  <span className="text-muted-foreground tabular-nums ml-2 flex-shrink-0">
                    {format(i.date, "d MMM HH:mm", { locale: uk })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout: calendar + list */}
      <div className="grid md:grid-cols-[auto_1fr] gap-4">
        <div className="bg-card border rounded-lg p-2 self-start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasUserEvent: userEventDates,
              hasSystemEvent: systemEventDates,
              hasBookingEvent: bookingEventDates,
            }}
            modifiersClassNames={{
              hasUserEvent:
                "relative after:content-[''] after:absolute after:bottom-1 after:left-[calc(50%-4px)] after:w-1 after:h-1 after:rounded-full after:bg-primary",
              hasSystemEvent:
                "relative before:content-[''] before:absolute before:bottom-1 before:left-[calc(50%+2px)] before:w-1 before:h-1 before:rounded-full before:bg-warning",
              hasBookingEvent:
                "relative [&_>button]:underline [&_>button]:decoration-emerald-500 [&_>button]:decoration-2 [&_>button]:underline-offset-[3px]",
            }}
            locale={uk}
          />
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Мої
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" /> Системні
            </span>
            {canSeeBookings && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-emerald-500" /> Бронювання
              </span>
            )}
          </div>
          {canSeeBookings && (
            <label className="flex items-center gap-2 mt-2 px-1 text-xs text-muted-foreground cursor-pointer select-none">
              <Checkbox
                checked={bookingsLayerOn}
                onCheckedChange={(v) => setBookingsLayerOn(!!v)}
                className="h-3.5 w-3.5"
              />
              <span>📒 Мої бронювання</span>
            </label>
          )}
          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-xs"
              onClick={() => setSelectedDate(undefined)}
            >
              Показати всі
            </Button>
          )}

        </div>

        <div className="space-y-2 min-w-0">
          {/* Filter toggle */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-2.5">Усі</TabsTrigger>
                <TabsTrigger value="mine" className="text-xs px-2.5">Мої</TabsTrigger>
                <TabsTrigger value="system" className="text-xs px-2.5">Системні</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="text-xs text-muted-foreground">
              {selectedDate
                ? format(selectedDate, "d MMMM yyyy", { locale: uk })
                : "Усі дати"}{" "}
              · {visibleItems.length}
            </div>
          </div>

          {loading && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Завантаження…
            </div>
          )}

          {!loading && visibleItems.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Подій немає</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Додайте подію вручну або попросіть AI-чат
              </p>
            </div>
          )}

          {visibleItems.map((i) => {
            if (i.kind === "user") {
              return (
                <UserEventRow
                  key={i.id}
                  ref={activeHighlight && i.id === `u:${activeHighlight}` ? highlightRef : undefined}
                  highlighted={!!activeHighlight && i.id === `u:${activeHighlight}`}
                  item={i}
                  onComplete={() => updateStatus(i.id.replace(/^u:/, ""), "completed")}
                  onDelete={() => deleteEvent(i.id.replace(/^u:/, ""))}
                />
              );
            }
            if (i.kind === "booking") {
              return (
                <BookingEventRow
                  key={i.id}
                  item={i}
                  onOpen={() => handleOpenBooking(i.bookingEvent!)}
                />
              );
            }
            return (
              <SystemEventRow
                key={i.id}
                item={i}
                onAddReminder={() => handleCreateReminderFromSystem(i.systemEvent!)}
                onOpen={() => handleOpenSystem(i.systemEvent!)}
              />
            );
          })}

        </div>
      </div>

      <AddEventDialog
        key={dialogKey}
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={createEvent}
        initial={addInitial}
      />
    </div>
  );
};

// --- subcomponents ---

const UserEventRow = forwardRef<
  HTMLDivElement,
  {
    item: UnifiedItem;
    onComplete: () => void;
    onDelete: () => void;
    highlighted?: boolean;
  }
>(({ item, onComplete, onDelete, highlighted }, ref) => {
  const past = isBefore(item.date, new Date());
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border bg-card transition-shadow duration-300",
        item.status === "completed" && "opacity-60",
        past && item.status === "scheduled" && "border-warning/40",
        highlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{item.title}</span>
          {item.source === "ai" && (
            <Badge variant="outline" size="sm" className="gap-1 text-[10px]">
              <Sparkles className="w-3 h-3" /> AI
            </Badge>
          )}
          {item.status === "completed" && (
            <Badge variant="outline" size="sm" className="text-[10px] text-success">
              Виконано
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {format(item.date, "d MMM yyyy · HH:mm", { locale: uk })}
          {item.reminderAt && (
            <>
              {" · "}
              <Bell className="inline w-3 h-3 mr-0.5" />
              нагадати {format(item.reminderAt, "d MMM HH:mm", { locale: uk })}
            </>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        {item.status === "scheduled" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={onComplete}
            title="Позначити виконаним"
            aria-label="Позначити подію виконаною"
          >
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-destructive hover:text-destructive"
          onClick={onDelete}
          title="Видалити"
          aria-label="Видалити подію"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});
UserEventRow.displayName = "UserEventRow";

const SystemEventRow = ({
  item,
  onAddReminder,
  onOpen,
}: {
  item: UnifiedItem;
  onAddReminder: () => void;
  onOpen: () => void;
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border bg-warning/5 border-warning/30"
      )}
    >
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") onOpen();
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Landmark className="w-3.5 h-3.5 text-warning flex-shrink-0" />
          <span className="text-sm font-medium">{item.title}</span>
          <Badge variant="outline" size="sm" className="text-[10px] border-warning/40 text-warning">
            Система
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {format(item.date, "d MMM yyyy · HH:mm", { locale: uk })}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-primary hover:text-primary"
          onClick={onAddReminder}
          title="Додати нагадування"
        >
          <PlusCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const BookingEventRow = ({
  item,
  onOpen,
}: {
  item: UnifiedItem;
  onOpen: () => void;
}) => {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/10 transition-colors"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarClock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{item.title}</span>
          <Badge
            variant="outline"
            size="sm"
            className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
          >
            Бронювання
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {format(item.date, "d MMM yyyy · HH:mm", { locale: uk })}
          {item.description && <> · {item.description}</>}
        </div>
      </div>
    </div>
  );
};

export default MyEventsTab;

