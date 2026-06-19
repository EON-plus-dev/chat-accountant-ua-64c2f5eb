/**
 * TodayAgenda — професійний денний планер салону.
 * Три режими: «Робочі місця» (swimlane day × workstation, основний),
 * «Майстри» (групування по майстрах), «Список» (плоска таблиця).
 */

import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Scissors,
  Hand,
  HeartPulse,
  Eye,
  Users as UsersIcon,
  Briefcase,
  CircleDot,
  CheckCircle2,
  XCircle,
  Ban,
  Plus,
  LayoutGrid,
  Rows3,
  List as ListIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type {
  SalonBooking,
  SalonMaster,
  SalonService,
  SalonClient,
  SalonWorkstation,
  MasterShift,
  WorkstationKind,
  BookingStatus,
} from "@/config/demoCabinets/salonData";
import { BookingEditorSheet } from "./BookingEditorSheet";
import { formatBookingRange } from "./timeRange";

interface Props {
  cabinetId: string;
  bookings: SalonBooking[];
  masters: SalonMaster[];
  services: SalonService[];
  clients: SalonClient[];
  workstations: SalonWorkstation[];
  shifts: MasterShift[];
}

// ============================================================================
// Constants
// ============================================================================

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 21;
const SLOT_MIN = 30;
const SLOT_PX = 28;
const HOUR_PX = (60 / SLOT_MIN) * SLOT_PX; // 56

const STATUS_META: Record<BookingStatus, { label: string; dot: string; chip: string; icon: typeof CircleDot }> = {
  scheduled: {
    label: "Заплановано",
    dot: "bg-sky-500",
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
    icon: CircleDot,
  },
  confirmed: {
    label: "Підтверджено",
    dot: "bg-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  done: {
    label: "Виконано",
    dot: "bg-violet-500",
    chip: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
    icon: CheckCircle2,
  },
  "no-show": {
    label: "Не прийшов",
    dot: "bg-rose-500",
    chip: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    icon: XCircle,
  },
  canceled: {
    label: "Скасовано",
    dot: "bg-muted-foreground/60",
    chip: "bg-muted text-muted-foreground border-border",
    icon: Ban,
  },
};

const WS_ICON: Partial<Record<WorkstationKind, typeof Scissors>> = {
  hair_chair: Scissors,
  nail_table: Hand,
  massage_room: HeartPulse,
  brow_chair: Eye,
  court: CircleDot,
  shop_counter: LayoutGrid,
  cafe_table: LayoutGrid,
};

const WS_KIND_LABEL: Partial<Record<WorkstationKind, string>> = {
  hair_chair: "Перукарське",
  nail_table: "Манікюр",
  massage_room: "Масаж/SPA",
  brow_chair: "Брови/візаж",
  court: "Корт",
  shop_counter: "Каса магазину",
  cafe_table: "Стіл кафе",
};

// ============================================================================
// Helpers
// ============================================================================

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const fmtMin = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", { weekday: "long", day: "2-digit", month: "long" });

const shiftDateIso = (offset: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

// ============================================================================
// Main
// ============================================================================

export function TodayAgenda(props: Props) {
  const { cabinetId, bookings, masters, services, clients, workstations, shifts } = props;
  const [createDefaults, setCreateDefaults] = useState<{ date: string; startTime: string; masterId?: string; workstationId?: string } | null>(null);

  const [dayOffset, setDayOffset] = useState(0);
  const [mode, setMode] = useState<"workstations" | "masters" | "list">("workstations");
  const [statusFilter, setStatusFilter] = useState<BookingStatus[]>([]);
  const [selected, setSelected] = useState<SalonBooking | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const dateIso = shiftDateIso(dayOffset);
  const isToday = dayOffset === 0;

  const dayBookings = useMemo(() => {
    const filtered = bookings
      .filter((b) => b.date === dateIso)
      .filter((b) => statusFilter.length === 0 || statusFilter.includes(b.status));
    return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [bookings, dateIso, statusFilter]);

  const dayShifts = useMemo(
    () => shifts.filter((s) => s.date === dateIso),
    [shifts, dateIso],
  );

  // KPIs
  const kpi = useMemo(() => {
    const active = dayBookings.filter((b) => b.status !== "canceled" && b.status !== "no-show");
    const revenue = active.reduce((s, b) => s + b.totalPrice, 0);
    const payouts = dayBookings
      .filter((b) => b.status === "done")
      .reduce((s, b) => s + b.commissionAmount, 0);

    // Utilization: booked minutes / total shift minutes across all workstations
    const shiftMinutes = dayShifts.reduce(
      (s, sh) => s + (sh.endHour - sh.startHour) * 60,
      0,
    );
    const bookedMinutes = active.reduce((s, b) => s + b.durationMin, 0);
    const utilization = shiftMinutes > 0 ? Math.round((bookedMinutes / shiftMinutes) * 100) : 0;

    return { count: dayBookings.length, revenue, payouts, utilization };
  }, [dayBookings, dayShifts]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-3">
        <TodayHeader
          dateIso={dateIso}
          dayOffset={dayOffset}
          onPrev={() => setDayOffset((x) => x - 1)}
          onToday={() => setDayOffset(0)}
          onNext={() => setDayOffset((x) => x + 1)}
          kpi={kpi}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          mode={mode}
          onMode={setMode}
        />

        {dayBookings.length === 0 && dayShifts.length === 0 ? (
          <EmptyState isToday={isToday} />
        ) : mode === "workstations" ? (
          <WorkstationsTimeline
            dateIso={dateIso}
            isToday={isToday}
            now={now}
            workstations={workstations}
            masters={masters}
            services={services}
            clients={clients}
            shifts={dayShifts}
            bookings={dayBookings}
            onSelect={setSelected}
            onCreateFromSlot={setCreateDefaults}
          />
        ) : mode === "masters" ? (
          <MastersView
            bookings={dayBookings}
            masters={masters}
            services={services}
            clients={clients}
            workstations={workstations}
            onSelect={setSelected}
          />
        ) : (
          <ListView
            bookings={dayBookings}
            masters={masters}
            services={services}
            clients={clients}
            workstations={workstations}
            onSelect={setSelected}
          />
        )}
      </div>

      <BookingEditorSheet
        open={!!selected || !!createDefaults}
        onClose={() => {
          setSelected(null);
          setCreateDefaults(null);
        }}
        cabinetId={cabinetId}
        booking={selected}
        masters={masters}
        services={services}
        clients={clients}
        workstations={workstations}
        defaults={createDefaults ?? undefined}
      />
    </TooltipProvider>
  );
}

// ============================================================================
// Header
// ============================================================================

interface HeaderProps {
  dateIso: string;
  dayOffset: number;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  kpi: { count: number; revenue: number; payouts: number; utilization: number };
  statusFilter: BookingStatus[];
  onStatusFilter: (s: BookingStatus[]) => void;
  mode: "workstations" | "masters" | "list";
  onMode: (m: "workstations" | "masters" | "list") => void;
}

function TodayHeader({
  dateIso,
  dayOffset,
  onPrev,
  onToday,
  onNext,
  kpi,
  statusFilter,
  onStatusFilter,
  mode,
  onMode,
}: HeaderProps) {
  const dateLabel = fmtDate(dateIso);
  return (
    <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-3 md:p-4 space-y-3 sticky top-0 z-20">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm md:text-base font-semibold capitalize min-w-[180px]">
            {dateLabel}
            {dayOffset === 0 && (
              <Badge variant="secondary" size="sm" className="ml-2 text-[10px]">
                сьогодні
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          {dayOffset !== 0 && (
            <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={onToday}>
              До сьогодні
            </Button>
          )}
        </div>

        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => v && onMode(v as typeof mode)}
          className="bg-muted/50 rounded-md p-0.5"
        >
          <ToggleGroupItem value="workstations" className="h-7 px-2 gap-1 text-[11px]" aria-label="Робочі місця">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Робочі місця</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="masters" className="h-7 px-2 gap-1 text-[11px]" aria-label="Майстри">
            <Rows3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Майстри</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="list" className="h-7 px-2 gap-1 text-[11px]" aria-label="Список">
            <ListIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Список</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <KpiCell label="Записів" value={kpi.count.toString()} />
        <KpiCell label="План виторгу" value={formatCurrency(kpi.revenue)} />
        <KpiCell label="Виплати майстрам" value={formatCurrency(kpi.payouts)} hint="за виконаними записами" />
        <KpiCell label="Утилізація" value={`${kpi.utilization}%`} hint="зайняті хвилини змін" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground mr-1">Статус:</span>
        {(Object.keys(STATUS_META) as BookingStatus[]).map((s) => {
          const active = statusFilter.includes(s);
          return (
            <button
              key={s}
              onClick={() => {
                onStatusFilter(
                  active ? statusFilter.filter((x) => x !== s) : [...statusFilter, s],
                );
              }}
              className={cn(
                "inline-flex items-center gap-1 px-2 h-6 rounded-full border text-[11px] transition",
                active
                  ? STATUS_META[s].chip
                  : "bg-background text-muted-foreground border-border hover:bg-muted/40",
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_META[s].dot)} />
              {STATUS_META[s].label}
            </button>
          );
        })}
        {statusFilter.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[11px]" onClick={() => onStatusFilter([])}>
            скинути
          </Button>
        )}
      </div>
    </div>
  );
}

function KpiCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border bg-background px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm md:text-base font-semibold tabular-nums leading-tight">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}

// ============================================================================
// Workstations swimlane
// ============================================================================

interface WSTimelineProps {
  dateIso: string;
  isToday: boolean;
  now: Date;
  workstations: SalonWorkstation[];
  masters: SalonMaster[];
  services: SalonService[];
  clients: SalonClient[];
  shifts: MasterShift[];
  bookings: SalonBooking[];
  onSelect: (b: SalonBooking) => void;
  onCreateFromSlot: (defaults: { date: string; startTime: string; masterId?: string; workstationId?: string }) => void;
}

function WorkstationsTimeline({
  dateIso,
  isToday,
  now,
  workstations,
  masters,
  services,
  clients,
  shifts,
  bookings,
  onSelect,
  onCreateFromSlot,
}: WSTimelineProps) {
  const totalSlots = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MIN;
  const totalHeight = totalSlots * SLOT_PX;

  // Current-time line position
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMin - DAY_START_HOUR * 60) / SLOT_MIN) * SLOT_PX;
  const showNowLine = isToday && nowMin >= DAY_START_HOUR * 60 && nowMin <= DAY_END_HOUR * 60;

  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="flex min-w-fit relative">
          {/* Time column */}
          <div className="flex-none w-12 border-r bg-muted/20">
            <div className="h-14 border-b" />
            <div className="relative" style={{ height: totalHeight }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 text-[10px] text-muted-foreground tabular-nums pr-1 text-right pt-0.5"
                  style={{ top: (h - DAY_START_HOUR) * HOUR_PX }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Workstation columns */}
          {workstations.map((ws) => {
            const wsShift = shifts.find((s) => s.workstationId === ws.id);
            const wsMaster = wsShift ? masters.find((m) => m.id === wsShift.masterId) : null;
            const wsBookings = bookings.filter((b) => b.workstationId === ws.id);
            const Icon = WS_ICON[ws.kind] ?? Scissors;

            return (
              <div key={ws.id} className="flex-none w-[160px] md:w-[180px] border-r last:border-r-0 relative">
                {/* Header */}
                <div className="h-14 border-b px-2 py-1 bg-muted/20">
                  <div className="flex items-center gap-1 text-[11px] font-semibold truncate">
                    <Icon className="w-3 h-3 text-muted-foreground flex-none" />
                    {ws.name}
                  </div>
                  {wsMaster ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="w-3 h-3 rounded-full flex-none"
                        style={{ backgroundColor: wsMaster.color }}
                      />
                      <span className="text-[10px] text-muted-foreground truncate">
                        {wsMaster.shortName} · {wsShift!.startHour}–{wsShift!.endHour}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5 italic">Зміна не призначена</div>
                  )}
                </div>

                {/* Grid background + bookings */}
                <div className="relative bg-card" style={{ height: totalHeight }}>
                  {Array.from({ length: totalSlots + 1 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "absolute left-0 right-0 border-t",
                        i % 2 === 0 ? "border-border/60" : "border-border/25",
                      )}
                      style={{ top: i * SLOT_PX }}
                    />
                  ))}

                  {wsShift ? (
                    <>
                      {wsShift.startHour > DAY_START_HOUR && (
                        <OutOfShiftBand
                          top={0}
                          height={(wsShift.startHour - DAY_START_HOUR) * HOUR_PX}
                        />
                      )}
                      {wsShift.endHour < DAY_END_HOUR && (
                        <OutOfShiftBand
                          top={(wsShift.endHour - DAY_START_HOUR) * HOUR_PX}
                          height={(DAY_END_HOUR - wsShift.endHour) * HOUR_PX}
                        />
                      )}
                    </>
                  ) : (
                    <OutOfShiftBand top={0} height={totalHeight} label="Місце вільне" />
                  )}

                  {wsBookings.map((b) => {
                    const master = masters.find((m) => m.id === b.masterId);
                    if (!master) return null;
                    const startMin = toMin(b.startTime);
                    const top = ((startMin - DAY_START_HOUR * 60) / SLOT_MIN) * SLOT_PX;
                    const height = (b.durationMin / SLOT_MIN) * SLOT_PX;
                    return (
                      <BookingPill
                        key={b.id}
                        booking={b}
                        master={master}
                        services={services}
                        clients={clients}
                        top={top}
                        height={height}
                        onClick={() => onSelect(b)}
                      />
                    );
                  })}

                  {wsShift &&
                    findFreeSlots(wsShift, wsBookings).map((slot, idx) => (
                      <FreeSlotPill
                        key={`${ws.id}-free-${idx}`}
                        top={((slot.startMin - DAY_START_HOUR * 60) / SLOT_MIN) * SLOT_PX}
                        height={(slot.minutes / SLOT_MIN) * SLOT_PX}
                        minutes={slot.minutes}
                        onClick={() =>
                          onCreateFromSlot({
                            date: dateIso,
                            startTime: fmtMin(slot.startMin),
                            masterId: wsMaster?.id,
                            workstationId: ws.id,
                          })
                        }
                      />
                    ))}
                </div>
              </div>
            );
          })}

          {/* Now line — overlay across all workstation columns */}
          {showNowLine && (
            <div
              className="absolute left-12 right-0 border-t-2 border-rose-500 pointer-events-none z-10 flex items-center"
              style={{ top: 56 + nowTop, height: 0 }}
            >
              <span className="absolute -left-12 -translate-y-1/2 text-[10px] tabular-nums bg-rose-500 text-white px-1 rounded">
                {fmtMin(nowMin)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


function OutOfShiftBand({ top, height, label }: { top: number; height: number; label?: string }) {
  return (
    <div
      className="absolute left-0 right-0 bg-muted/40 pointer-events-none"
      style={{
        top,
        height,
        backgroundImage:
          "repeating-linear-gradient(45deg, transparent, transparent 6px, hsl(var(--muted-foreground) / 0.07) 6px, hsl(var(--muted-foreground) / 0.07) 12px)",
      }}
    >
      {label && height > 30 && (
        <div className="text-[10px] text-muted-foreground/70 text-center pt-2 italic">{label}</div>
      )}
    </div>
  );
}

function findFreeSlots(shift: MasterShift, bookings: SalonBooking[]): { startMin: number; minutes: number }[] {
  const start = shift.startHour * 60;
  const end = shift.endHour * 60;
  const intervals = bookings
    .filter((b) => b.status !== "canceled")
    .map((b) => ({ s: toMin(b.startTime), e: toMin(b.startTime) + b.durationMin }))
    .sort((a, b) => a.s - b.s);
  const out: { startMin: number; minutes: number }[] = [];
  let cursor = start;
  for (const i of intervals) {
    if (i.s - cursor >= 30) {
      out.push({ startMin: cursor, minutes: i.s - cursor });
    }
    cursor = Math.max(cursor, i.e);
  }
  if (end - cursor >= 30) {
    out.push({ startMin: cursor, minutes: end - cursor });
  }
  return out;
}

// ============================================================================
// BookingPill
// ============================================================================

interface PillProps {
  booking: SalonBooking;
  master: SalonMaster;
  services: SalonService[];
  clients: SalonClient[];
  top: number;
  height: number;
  onClick: () => void;
}

function BookingPill({ booking, master, services, clients, top, height, onClick }: PillProps) {
  const svcNames = booking.serviceIds
    .map((id) => services.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .join(" + ");
  const client = clients.find((c) => c.id === booking.clientId);
  const meta = STATUS_META[booking.status];
  const dense = height < 50;
  const muted = booking.status === "canceled" || booking.status === "no-show";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "absolute left-1 right-1 rounded-md border bg-card hover:shadow-md transition text-left overflow-hidden group",
            muted && "opacity-60",
          )}
          style={{
            top: top + 1,
            height: height - 2,
            borderLeftWidth: 3,
            borderLeftColor: master.color,
          }}
        >
          <div className="px-1.5 py-0.5 h-full flex flex-col justify-start">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold tabular-nums">{formatBookingRange(booking.startTime, booking.durationMin)}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">{formatCurrency(booking.totalPrice)}</span>
            </div>
            {!dense && (
              <>
                <div className="text-[11px] font-medium truncate leading-tight">{svcNames}</div>
                {client && (
                  <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                    {client.fullName.split(" ").slice(0, 2).join(" ")}
                    {client.isVip && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">VIP</span>
                    )}
                  </div>
                )}
              </>
            )}
            <div className="mt-auto flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                {!dense && meta.label}
              </span>
              {master.type === "fop" && (
                <Briefcase className="w-2.5 h-2.5 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs max-w-xs">
        <div className="font-semibold">{svcNames}</div>
        <div className="text-muted-foreground mt-0.5">
          {formatBookingRange(booking.startTime, booking.durationMin)} · {booking.durationMin} хв · {formatCurrency(booking.totalPrice)}
        </div>
        <div className="text-muted-foreground">
          {master.fullName} ({master.type === "staff" ? "штатний" : "ФОП"})
        </div>
        {client && (
          <div className="text-muted-foreground">
            {client.fullName} · {client.phone}
          </div>
        )}
        <div className="mt-1 flex gap-1.5 text-[10px]">
          {(["confirm", "reschedule", "cancel"] as const).map((act) => (
            <button
              key={act}
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Демо-режим",
                  description:
                    act === "confirm"
                      ? "Підтвердження бронювання — лише в робочому акаунті."
                      : act === "reschedule"
                      ? "Перенесення запису — у платній версії."
                      : "Скасування — у платній версії.",
                });
              }}
              className="px-1.5 py-0.5 rounded border hover:bg-muted/40"
            >
              {act === "confirm" ? "Підтв." : act === "reschedule" ? "Перенести" : "Скасувати"}
            </button>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function FreeSlotPill({ top, height, minutes, onClick }: { top: number; height: number; minutes: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-1 right-1 rounded-md border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition group flex items-center justify-center"
      style={{ top: top + 1, height: height - 2 }}
    >
      <span className="text-[10px] text-muted-foreground/70 group-hover:text-primary inline-flex items-center gap-1">
        <Plus className="w-3 h-3" />
        вільно {minutes} хв
      </span>
    </button>
  );
}

function EmptyState({ isToday }: { isToday: boolean }) {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-3">
        <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground/40" />
        <div className="text-sm text-muted-foreground">
          {isToday
            ? "Сьогодні бронювань і змін немає."
            : "На цей день немає бронювань та призначених змін."}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast({ title: "Демо-режим", description: "Створення запису — у робочій версії." })
          }
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Додати запис
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Masters view (per-master grouping)
// ============================================================================

interface MastersViewProps {
  bookings: SalonBooking[];
  masters: SalonMaster[];
  services: SalonService[];
  clients: SalonClient[];
  workstations: SalonWorkstation[];
  onSelect: (b: SalonBooking) => void;
}

function MastersView({ bookings, masters, services, clients, workstations, onSelect }: MastersViewProps) {
  const grouped = new Map<string, SalonBooking[]>();
  for (const b of bookings) {
    const arr = grouped.get(b.masterId) ?? [];
    arr.push(b);
    grouped.set(b.masterId, arr);
  }

  if (grouped.size === 0) {
    return <EmptyState isToday />;
  }

  return (
    <div className="space-y-3">
      {[...grouped.entries()].map(([masterId, items]) => {
        const master = masters.find((m) => m.id === masterId);
        if (!master) return null;
        const dailyRevenue = items
          .filter((b) => b.status !== "canceled" && b.status !== "no-show")
          .reduce((s, b) => s + b.totalPrice, 0);
        const isStaff = master.type === "staff";

        return (
          <Card key={masterId}>
            <CardContent className="p-3 md:p-4 space-y-2">
              <header
                className="flex items-center justify-between gap-2 pb-2 border-b border-l-4 -ml-3 md:-ml-4 pl-3 md:pl-4"
                style={{ borderLeftColor: master.color }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: master.color }}
                  >
                    {master.avatarInitials}
                  </span>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{master.shortName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {items.length} зап. · {formatCurrency(dailyRevenue)}
                    </div>
                  </div>
                </div>
                <Badge variant={isStaff ? "outline" : "secondary"} size="sm" className="text-[10px] gap-1">
                  {isStaff ? <UsersIcon className="w-2.5 h-2.5" /> : <Briefcase className="w-2.5 h-2.5" />}
                  {isStaff ? "Штатний" : "ФОП-партнер"} · {master.commissionPct}%
                </Badge>
              </header>

              <ul className="divide-y">
                {items.map((b) => {
                  const client = clients.find((c) => c.id === b.clientId);
                  const svcNames = b.serviceIds
                    .map((id) => services.find((s) => s.id === id)?.name)
                    .filter(Boolean)
                    .join(" + ");
                  const ws = workstations.find((w) => w.id === b.workstationId);
                  const meta = STATUS_META[b.status];

                  return (
                    <li key={b.id}>
                      <button
                        onClick={() => onSelect(b)}
                        className="w-full text-left px-1 py-2 hover:bg-muted/40 rounded transition flex items-start gap-3"
                      >
                        <div className="text-sm font-semibold tabular-nums min-w-[104px]">{formatBookingRange(b.startTime, b.durationMin)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{svcNames}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {client?.fullName.split(" ").slice(0, 2).join(" ")}
                            {client?.phone && ` · ${client.phone}`}
                            {ws && ` · ${ws.name}`}
                          </div>
                        </div>
                        <div className="text-right flex-none">
                          <div className="text-sm font-semibold tabular-nums">
                            {formatCurrency(b.totalPrice)}
                          </div>
                          <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                            {meta.label}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// List view
// ============================================================================

interface ListViewProps {
  bookings: SalonBooking[];
  masters: SalonMaster[];
  services: SalonService[];
  clients: SalonClient[];
  workstations: SalonWorkstation[];
  onSelect: (b: SalonBooking) => void;
}

function ListView({ bookings, masters, services, clients, workstations, onSelect }: ListViewProps) {
  if (bookings.length === 0) return <EmptyState isToday />;
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 border-b">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Час (з–по)</th>
              <th className="px-3 py-2 font-medium">Місце</th>
              <th className="px-3 py-2 font-medium">Майстер</th>
              <th className="px-3 py-2 font-medium">Послуга</th>
              <th className="px-3 py-2 font-medium">Клієнт</th>
              <th className="px-3 py-2 font-medium text-right">Сума</th>
              <th className="px-3 py-2 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const m = masters.find((x) => x.id === b.masterId);
              const c = clients.find((x) => x.id === b.clientId);
              const ws = workstations.find((x) => x.id === b.workstationId);
              const svcNames = b.serviceIds
                .map((id) => services.find((s) => s.id === id)?.name)
                .filter(Boolean)
                .join(" + ");
              const meta = STATUS_META[b.status];
              const Icon = ws ? WS_ICON[ws.kind] : Scissors;
              return (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
                >
                  <td className="px-3 py-2 font-semibold tabular-nums whitespace-nowrap">{formatBookingRange(b.startTime, b.durationMin)}</td>
                  <td className="px-3 py-2">
                    {ws && (
                      <span className="inline-flex items-center gap-1">
                        <Icon className="w-3 h-3 text-muted-foreground" />
                        {ws.name}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {m && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        {m.shortName}
                        {m.type === "fop" && (
                          <Briefcase className="w-2.5 h-2.5 text-muted-foreground" />
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-[240px] truncate">{svcNames}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {c?.fullName.split(" ").slice(0, 2).join(" ")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">
                    {formatCurrency(b.totalPrice)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 h-5 rounded border text-[10px]",
                        meta.chip,
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
