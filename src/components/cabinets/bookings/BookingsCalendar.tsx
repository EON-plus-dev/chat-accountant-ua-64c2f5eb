/**
 * BookingsCalendar v2 — денний resource grid (по майстрах або по робочих місцях),
 * з now-indicator, виявленням конфліктів, drag-and-drop переносом,
 * та створенням запису кліком на вільний слот.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, AlertTriangle, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type {
  SalonBooking,
  SalonMaster,
  SalonService,
  SalonClient,
  SalonWorkstation,
} from "@/config/demoCabinets/salonData";
import { BookingEditorSheet } from "./BookingEditorSheet";
import { salonWorkstations } from "@/config/demoCabinets/salonData";
import { findConflicts, checkPlacement } from "./conflicts";
import { updateBooking } from "./bookingsStore";
import { formatBookingRange } from "./timeRange";

interface Props {
  cabinetId: string;
  bookings: SalonBooking[];
  masters: SalonMaster[];
  services: SalonService[];
  clients: SalonClient[];
  /** Якщо true — показуємо колонку майстра навіть якщо в нього вихідний у вибраний день. */
  forceShowAllDays?: boolean;
}

const DAY_NAMES = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const START_HOUR = 9;
const END_HOUR = 21;
const SLOT_HEIGHT = 28;
const SLOTS_PER_HOUR = 2;
const SLOT_MIN = 30;

type ResourceMode = "masters" | "workstations";

function fmtDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  const dow = out.getDay();
  out.setDate(out.getDate() + (dow === 0 ? -6 : 1 - dow));
  out.setHours(0, 0, 0, 0);
  return out;
}

function timeToSlot(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - START_HOUR) * SLOTS_PER_HOUR + Math.floor(m / 30);
}

function slotToTime(slot: number): string {
  const total = START_HOUR * 60 + slot * SLOT_MIN;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function BookingsCalendar({ cabinetId, bookings, masters, services, clients, forceShowAllDays }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const today = new Date();
    const dow = today.getDay();
    return dow === 0 ? 6 : dow - 1;
  });
  const [resourceMode, setResourceMode] = useState<ResourceMode>("masters");
  const [selected, setSelected] = useState<SalonBooking | null>(null);
  const [creating, setCreating] = useState<{
    date: string;
    startTime: string;
    masterId?: string;
    workstationId?: string;
  } | null>(null);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );
  const selectedDay = days[selectedDayIdx];
  const selectedDayIso = fmtDate(selectedDay);
  const selectedDow = selectedDay.getDay();
  const isToday = selectedDayIso === fmtDate(new Date());

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === selectedDayIso),
    [bookings, selectedDayIso],
  );
  const conflicts = useMemo(() => findConflicts(dayBookings), [dayBookings]);

  const totalSlots = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;
  const totalHours = END_HOUR - START_HOUR;

  // Колонки — залежно від режиму
  const columns = useMemo(() => {
    if (resourceMode === "masters") {
      return masters
        .filter((m) => forceShowAllDays || m.schedule.workDays.includes(selectedDow))
        .map((m) => ({ id: m.id, label: m.shortName, fullLabel: m.fullName, color: m.color }));
    }
    return salonWorkstations.map((w) => ({
      id: w.id,
      label: w.name,
      fullLabel: w.name,
      color: "hsl(var(--primary))",
    }));
  }, [resourceMode, masters, selectedDow, forceShowAllDays]);

  // Now indicator
  const [nowMin, setNowMin] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    }, 60_000);
    return () => clearInterval(t);
  }, []);
  const nowTopPx =
    ((nowMin - START_HOUR * 60) / SLOT_MIN) * SLOT_HEIGHT;
  const showNow = isToday && nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60;

  const navWeek = (delta: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    setWeekStart(next);
  };

  // ===================== DnD =====================
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const over = e.over;
    if (!over) return;
    const bookingId = String(e.active.id);
    const targetColumnId = String(over.id);
    const booking = dayBookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Зсув часу = округлений до 30 хв із дельти Y
    const dy = e.delta?.y ?? 0;
    const slotShift = Math.round(dy / SLOT_HEIGHT);
    const newSlot = Math.max(0, Math.min(totalSlots - 1, timeToSlot(booking.startTime) + slotShift));
    const newStart = slotToTime(newSlot);

    const patch: Partial<SalonBooking> = { startTime: newStart };
    let newMasterId = booking.masterId;
    let newWorkstationId = booking.workstationId;

    if (resourceMode === "masters" && targetColumnId !== booking.masterId) {
      patch.masterId = targetColumnId;
      newMasterId = targetColumnId;
    }
    if (resourceMode === "workstations" && targetColumnId !== booking.workstationId) {
      patch.workstationId = targetColumnId;
      newWorkstationId = targetColumnId;
    }

    // Якщо нічого не змінилось — нічого не робимо
    if (patch.startTime === booking.startTime && !patch.masterId && !patch.workstationId) return;

    const place = checkPlacement({
      bookings: dayBookings,
      excludeId: booking.id,
      date: booking.date,
      startTime: newStart,
      durationMin: booking.durationMin,
      masterId: newMasterId,
      workstationId: newWorkstationId,
    });
    if (place.master || place.workstation) {
      toast({
        title: "Конфлікт",
        description: place.master
          ? "Майстер у цей час уже зайнятий."
          : "Робоче місце у цей час уже зайняте.",
        variant: "destructive",
      });
      return;
    }

    updateBooking(cabinetId, booking.id, patch);
    toast({
      title: "Перенесено",
      description: `${slotToTime(newSlot)} · ${
        resourceMode === "masters"
          ? masters.find((m) => m.id === newMasterId)?.shortName
          : salonWorkstations.find((w) => w.id === newWorkstationId)?.name
      }`,
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-3 md:p-4 space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => navWeek(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm font-medium tabular-nums px-2">
                {days[0].toLocaleDateString("uk-UA", { day: "2-digit", month: "short" })} —{" "}
                {days[6].toLocaleDateString("uk-UA", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
                Сьогодні
              </Button>
              <Button variant="outline" size="sm" onClick={() => navWeek(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <ToggleGroup
              type="single"
              value={resourceMode}
              onValueChange={(v) => v && setResourceMode(v as ResourceMode)}
              size="sm"
            >
              <ToggleGroupItem value="masters" className="gap-1.5 text-xs h-8">
                <Users className="w-3.5 h-3.5" /> Майстри
              </ToggleGroupItem>
              <ToggleGroupItem value="workstations" className="gap-1.5 text-xs h-8">
                <MapPin className="w-3.5 h-3.5" /> Робочі місця
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Day picker */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const iso = fmtDate(d);
              const count = bookings.filter((b) => b.date === iso).length;
              const isTodayCell = iso === fmtDate(new Date());
              const isSel = i === selectedDayIdx;
              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDayIdx(i)}
                  className={cn(
                    "flex flex-col items-center py-2 rounded-md transition border text-xs",
                    isSel
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 hover:bg-muted/60 border-transparent",
                    isTodayCell && !isSel && "ring-1 ring-primary/40",
                  )}
                >
                  <span className="opacity-70">{DAY_NAMES[d.getDay()]}</span>
                  <span className="text-sm font-semibold tabular-nums mt-0.5">{d.getDate()}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] tabular-nums mt-0.5",
                        isSel ? "opacity-90" : "text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {columns.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12 border rounded-md">
              На цей день немає доступних колонок.
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
              <div className="overflow-x-auto border rounded-md">
                <div className="flex min-w-fit">
                  {/* Hours column */}
                  <div className="flex-none w-12 border-r bg-muted/30">
                    <div className="h-9 border-b" />
                    {Array.from({ length: totalHours }, (_, h) => (
                      <div
                        key={h}
                        style={{ height: SLOT_HEIGHT * SLOTS_PER_HOUR }}
                        className="text-[11px] text-muted-foreground text-right pr-2 pt-1 border-b"
                      >
                        {String(START_HOUR + h).padStart(2, "0")}:00
                      </div>
                    ))}
                  </div>

                  {columns.map((col) => {
                    const colBookings = dayBookings.filter((b) =>
                      resourceMode === "masters"
                        ? b.masterId === col.id
                        : b.workstationId === col.id,
                    );
                    return (
                      <ResourceColumn
                        key={col.id}
                        col={col}
                        totalSlots={totalSlots}
                        bookings={colBookings}
                        services={services}
                        clients={clients}
                        masters={masters}
                        resourceMode={resourceMode}
                        conflicts={conflicts}
                        onSelect={setSelected}
                        onEmptySlot={(slot) => {
                          setCreating({
                            date: selectedDayIso,
                            startTime: slotToTime(slot),
                            masterId: resourceMode === "masters" ? col.id : undefined,
                            workstationId: resourceMode === "workstations" ? col.id : undefined,
                          });
                        }}
                        showNow={showNow}
                        nowTopPx={nowTopPx}
                      />
                    );
                  })}
                </div>
              </div>
            </DndContext>
          )}

          <div className="text-[11px] text-muted-foreground flex items-center gap-3 flex-wrap">
            <span>Клік на блок — деталі. Клік на вільний слот — новий запис.</span>
            <span className="hidden md:inline">Перетягніть блок, щоб перенести час або колонку.</span>
            <span className="inline-flex items-center gap-1 text-destructive">
              <AlertTriangle className="w-3 h-3" /> — конфлікт
            </span>
          </div>
        </CardContent>
      </Card>

      <BookingEditorSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        cabinetId={cabinetId}
        booking={selected}
        masters={masters}
        services={services}
        clients={clients}
        workstations={salonWorkstations}
      />

      <BookingEditorSheet
        open={!!creating}
        onClose={() => setCreating(null)}
        cabinetId={cabinetId}
        booking={null}
        masters={masters}
        services={services}
        clients={clients}
        workstations={salonWorkstations}
        defaults={creating ?? undefined}
      />
    </>
  );
}

// ============================================================================
// ResourceColumn — droppable column with bookings + empty slots
// ============================================================================

interface ColumnProps {
  col: { id: string; label: string; fullLabel: string; color: string };
  totalSlots: number;
  bookings: SalonBooking[];
  services: SalonService[];
  clients: SalonClient[];
  masters: SalonMaster[];
  resourceMode: ResourceMode;
  conflicts: Map<string, unknown[]>;
  onSelect: (b: SalonBooking) => void;
  onEmptySlot: (slot: number) => void;
  showNow: boolean;
  nowTopPx: number;
}

function ResourceColumn({
  col,
  totalSlots,
  bookings,
  services,
  clients,
  masters,
  resourceMode,
  conflicts,
  onSelect,
  onEmptySlot,
  showNow,
  nowTopPx,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="flex-none w-[140px] border-r last:border-r-0 relative">
      <div className="h-9 border-b px-2 flex items-center gap-1.5 bg-muted/30 sticky top-0">
        <span
          className="w-2 h-2 rounded-full flex-none"
          style={{ backgroundColor: col.color }}
        />
        <span className="text-xs font-medium truncate" title={col.fullLabel}>
          {col.label}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn("relative", isOver && "bg-primary/5")}
        style={{ height: totalSlots * SLOT_HEIGHT }}
      >
        {/* Slot grid + click handlers */}
        {Array.from({ length: totalSlots }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onEmptySlot(i)}
            className={cn(
              "absolute left-0 right-0 border-b border-dashed border-border/50 hover:bg-primary/5 transition focus:outline-none focus:bg-primary/10",
              i % 2 === 1 && "border-solid border-border/40",
            )}
            style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
            aria-label={`Створити запис на ${slotToTime(i)}`}
          />
        ))}

        {/* Now indicator */}
        {showNow && (
          <div
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ top: nowTopPx }}
          >
            <div className="h-px bg-destructive" />
            <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-destructive" />
          </div>
        )}

        {/* Bookings */}
        {bookings.map((b) => (
          <BookingBlock
            key={b.id}
            booking={b}
            services={services}
            clients={clients}
            masters={masters}
            color={
              resourceMode === "masters"
                ? col.color
                : masters.find((m) => m.id === b.masterId)?.color ?? "hsl(var(--primary))"
            }
            hasConflict={(conflicts.get(b.id)?.length ?? 0) > 0}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BookingBlock — draggable
// ============================================================================

function BookingBlock({
  booking,
  services,
  clients,
  masters,
  color,
  hasConflict,
  onSelect,
}: {
  booking: SalonBooking;
  services: SalonService[];
  clients: SalonClient[];
  masters: SalonMaster[];
  color: string;
  hasConflict: boolean;
  onSelect: (b: SalonBooking) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: booking.id,
  });
  const slot = timeToSlot(booking.startTime);
  const heightSlots = Math.max(1, Math.round(booking.durationMin / 30));
  const svcNames = booking.serviceIds
    .map((id) => services.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .join(" + ");
  const client = clients.find((c) => c.id === booking.clientId);
  const master = masters.find((m) => m.id === booking.masterId);
  const dim = booking.status === "canceled" || booking.status === "no-show";

  const style: React.CSSProperties = {
    top: slot * SLOT_HEIGHT + 1,
    height: heightSlots * SLOT_HEIGHT - 2,
    backgroundColor: `${color}22`,
    borderLeftColor: color,
    color,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 30 : 5,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={() => onSelect(booking)}
            className={cn(
              "absolute left-0.5 right-0.5 rounded text-left text-[10px] p-1 overflow-hidden border-l-2 transition hover:shadow-md focus:outline-none focus:ring-1 focus:ring-ring cursor-grab active:cursor-grabbing",
              dim && "opacity-40 line-through",
              hasConflict && "ring-2 ring-destructive/70",
            )}
            style={style}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-semibold tabular-nums">{formatBookingRange(booking.startTime, booking.durationMin)}</span>
              {hasConflict && <AlertTriangle className="w-3 h-3 text-destructive" />}
            </div>
            <div className="truncate text-foreground/80">{svcNames}</div>
            <div className="truncate text-foreground/60">
              {client?.fullName.split(" ")[0]}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[260px]">
          <div className="space-y-1 text-xs">
            <div className="font-semibold tabular-nums">
              {formatBookingRange(booking.startTime, booking.durationMin)} · {booking.durationMin} хв
            </div>
            <div>{svcNames}</div>
            <div className="text-muted-foreground">
              {client?.fullName} · {master?.shortName}
            </div>
            <div className="font-medium">{formatCurrency(booking.totalPrice)}</div>
            {hasConflict && (
              <div className="text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Конфлікт розкладу
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
