/**
 * Публічний віджет бронювання тенісного клубу «Ace Court» (demo-tennis-3).
 * URL: /book/ace-court
 *
 * Tabs:
 *  1. "Оренда корту"  — slot-grid (рядок=корт × колонки=години). Без тренера.
 *  2. "Тренування"    — Сервіс → Тренер → Слот (через computeAvailability).
 *  3. "Групові класи" — фіксований weekly schedule з capacity ("Cardio Tennis", "Juniors").
 *
 * Корзина (sticky bottom desktop+mobile) → ContactsStep → confirmPublicBooking()×N.
 * Якщо телефон збігається з клієнтом — показуємо membership-бейдж + опцію списання.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, BadgeCheck, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { SalonPublicProfile, PublicBookingDraft } from "@/lib/publicBooking/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import {
  tennisServices,
  tennisCoaches,
  tennisWorkstations,
  tennisBookings,
} from "@/config/demoCabinets/tennisData";
import {
  tennisGroupSchedule,
  findMembershipByClientId,
  type TennisGroupClass,
} from "@/config/demoCabinets/tennisExtras";
import { listPublicBookings, confirmPublicBooking, lookupClientByPhone } from "@/lib/publicBooking/store";
import { computeAvailability, groupSlotsByDate } from "@/lib/publicBooking/computeAvailability";
import {
  TENNIS_RULES,
  TENNIS_GRID_HOURS,
  isWithinSurfaceWindow,
  normalizePhone,
  type TennisSurface,
} from "@/config/demoCabinets/tennisRules";
import heroImg from "@/assets/tennis/tennis-hero.jpg";

interface Props {
  cabinet: Cabinet;
  profile: SalonPublicProfile;
  isDemoFallback?: boolean;
}

// ============================================
// Типи кошика
// ============================================

type CartItem =
  | {
      kind: "court";
      uid: string;
      courtId: string;
      courtName: string;
      surface: "clay" | "hard-out" | "hard-in";
      date: string;
      startTime: string;
      durationMin: number;
      price: number;
      addonIds: string[]; // tsvc-rental-*
    }
  | {
      kind: "training";
      uid: string;
      serviceId: string;
      serviceName: string;
      courtId: string;
      courtName: string;
      coachId: string;
      coachName: string;
      date: string;
      startTime: string;
      durationMin: number;
      price: number;
    }
  | {
      kind: "group";
      uid: string;
      classId: string;
      serviceId: string;
      className: string;
      coachName: string;
      courtName: string;
      date: string;
      startTime: string;
      durationMin: number;
      price: number;
      participantName: string;
    };

const SENTINEL_COURT_MASTER = "tc-court-direct";

const ADDONS = tennisServices.filter((s) => s.category === "rental");

// ============================================
// Court availability helpers
// ============================================

function todayIso(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const COURT_HOURS = TENNIS_GRID_HOURS;
const LEAD_MS = TENNIS_RULES.leadHours * 60 * 60 * 1000;
const HORIZON_DAYS = TENNIS_RULES.horizonDays;

interface CourtBusy {
  start: number;
  end: number;
}

/** Зайнятість одного корту в заданий день — з salonBookings + publicBookings. */
function getCourtBusy(cabinetId: string, courtId: string, dateIso: string): CourtBusy[] {
  const fromBase = tennisBookings
    .filter((b) => b.workstationId === courtId && b.date === dateIso && b.status !== "canceled")
    .map((b) => ({ start: toMin(b.startTime), end: toMin(b.startTime) + b.durationMin }));
  const fromPub = listPublicBookings(cabinetId)
    .filter((b) => b.workstationId === courtId && b.date === dateIso && b.status === "scheduled")
    .map((b) => ({ start: toMin(b.startTime), end: toMin(b.startTime) + b.durationMin }));
  return [...fromBase, ...fromPub];
}

type SlotStatus = "free" | "busy" | "out-of-hours" | "lead-time";

function getCourtSlotStatus(
  busy: CourtBusy[],
  surface: TennisSurface,
  dateIso: string,
  hour: number,
  durationMin: number,
): SlotStatus {
  if (!isWithinSurfaceWindow(surface, hour, durationMin)) return "out-of-hours";
  const slotMs = new Date(`${dateIso}T${String(hour).padStart(2, "0")}:00:00`).getTime();
  if (slotMs - Date.now() < LEAD_MS) return "lead-time";
  const start = hour * 60;
  const end = start + durationMin;
  const overlaps = busy.some((b) => start < b.end && end > b.start);
  return overlaps ? "busy" : "free";
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short", weekday: "short" });
}

const SURFACE_LABEL: Record<string, string> = {
  clay: "Ґрунт",
  "hard-out": "Хард outdoor",
  "hard-in": "Хард indoor",
};

// ============================================
// Root
// ============================================

export function TennisBooking({ cabinet, profile, isDemoFallback }: Props) {
  const accent = profile.accentColor ?? "#15803D";
  const [tab, setTab] = useState<"court" | "training" | "groups">("court");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = `${profile.brandName} — онлайн-бронювання кортів і тренувань`;
  }, [profile.brandName]);

  const total = cart.reduce((s, i) => {
    if (i.kind === "court") {
      const addons = i.addonIds.reduce((a, id) => a + (ADDONS.find((x) => x.id === id)?.price ?? 0), 0);
      return s + i.price + addons;
    }
    return s + i.price;
  }, 0);

  const addCourt = (item: CartItem) => setCart((c) => [...c, item]);
  const removeCart = (uid: string) => setCart((c) => c.filter((i) => i.uid !== uid));
  const toggleAddon = (uid: string, addonId: string) =>
    setCart((c) =>
      c.map((i) => {
        if (i.uid !== uid || i.kind !== "court") return i;
        const has = i.addonIds.includes(addonId);
        return { ...i, addonIds: has ? i.addonIds.filter((x) => x !== addonId) : [...i.addonIds, addonId] };
      }),
    );

  if (done) {
    return <DoneView cabinet={cabinet} profile={profile} accent={accent} count={cart.length} />;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-muted/40 to-background">
      <div
        className="max-w-5xl mx-auto px-3 md:px-4 pt-3 md:pt-8"
        style={{ paddingBottom: "max(11rem, calc(env(safe-area-inset-bottom) + 10rem))" }}
      >
        {isDemoFallback && (
          <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Демо-режим. Це публічна сторінка-приклад тенісного клубу «Ace Court».</span>
          </div>
        )}

        {/* Hero */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="relative h-32 md:h-52 w-full overflow-hidden">
            <img src={heroImg} alt={profile.brandName} className="w-full h-full object-cover" width={1536} height={768} />
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 35%, ${accent}d9 100%)` }} />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg md:text-3xl font-semibold leading-tight truncate drop-shadow">{profile.brandName}</h1>
                  {profile.tagline && (
                    <p className="text-xs md:text-sm opacity-90 mt-0.5 line-clamp-2 drop-shadow">{profile.tagline}</p>
                  )}
                </div>
                <div className="hidden md:flex gap-4 shrink-0 text-right">
                  <HeroKpi label="кортів" value="8" />
                  <HeroKpi label="тренерів" value="5" />
                  <HeroKpi label="груп/тиждень" value={String(tennisGroupSchedule.length)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-3">
          <TabsList className="w-full grid grid-cols-3 h-11">
            <TabsTrigger value="court" className="text-xs md:text-sm gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Оренда корту
            </TabsTrigger>
            <TabsTrigger value="training" className="text-xs md:text-sm gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Тренування
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs md:text-sm gap-1.5">
              <Users className="w-3.5 h-3.5" /> Групи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="court" className="mt-3">
            <CourtRentTab cabinetId={cabinet.id} cart={cart} onAdd={addCourt} accent={accent} />
          </TabsContent>
          <TabsContent value="training" className="mt-3">
            <TrainingTab cabinetId={cabinet.id} onAdd={addCourt} accent={accent} />
          </TabsContent>
          <TabsContent value="groups" className="mt-3">
            <GroupClassesTab cabinetId={cabinet.id} onAdd={addCourt} accent={accent} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky cart */}
      <CartBar
        cart={cart}
        total={total}
        accent={accent}
        onRemove={removeCart}
        onToggleAddon={toggleAddon}
        onContinue={() => setContactsOpen(true)}
      />

      <ContactsSheet
        open={contactsOpen}
        onOpenChange={setContactsOpen}
        cabinetId={cabinet.id}
        cart={cart}
        total={total}
        accent={accent}
        onSuccess={() => {
          setContactsOpen(false);
          setDone(true);
        }}
      />
    </div>
  );
}

// ============================================
// Hero KPI
// ============================================

function HeroKpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-semibold drop-shadow">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80 drop-shadow">{label}</div>
    </div>
  );
}

// ============================================
// TAB 1 — Court Rent (slot-grid)
// ============================================

function CourtRentTab({
  cabinetId,
  cart,
  onAdd,
  accent,
}: {
  cabinetId: string;
  cart: CartItem[];
  onAdd: (i: CartItem) => void;
  accent: string;
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const [durationMin, setDurationMin] = useState<60 | 90 | 120>(60);
  const [surfaceFilter, setSurfaceFilter] = useState<"all" | "clay" | "hard-out" | "hard-in">("all");
  const dateIso = todayIso(dayOffset);

  const courts = useMemo(() => {
    if (surfaceFilter === "all") return tennisWorkstations;
    return tennisWorkstations.filter((c) => c.surface === surfaceFilter);
  }, [surfaceFilter]);

  const cartUids = new Set(
    cart
      .filter((i) => i.kind === "court")
      .map((i) => `${(i as Extract<CartItem, { kind: "court" }>).courtId}|${i.date}|${i.startTime}`),
  );

  const handlePick = (courtId: string, hour: number) => {
    const court = tennisWorkstations.find((c) => c.id === courtId)!;
    const price = Math.round(((court.hourlyRate ?? 280) * durationMin) / 60);
    onAdd({
      kind: "court",
      uid: `c-${courtId}-${dateIso}-${hour}-${Date.now().toString(36)}`,
      courtId,
      courtName: court.name,
      surface: (court.surface ?? "clay") as "clay" | "hard-out" | "hard-in",
      date: dateIso,
      startTime: `${String(hour).padStart(2, "0")}:00`,
      durationMin,
      price,
      addonIds: [],
    });
    toast({ title: "Додано в кошик", description: `${court.name}, ${dateIso}, ${hour}:00 · ${durationMin} хв` });
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="rounded-xl border bg-card p-3 md:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setDayOffset((d) => Math.max(0, d - 1))} disabled={dayOffset === 0}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm md:text-base font-semibold w-32 md:w-40 text-center">
              {formatDateShort(dateIso)}
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setDayOffset((d) => Math.min(HORIZON_DAYS - 1, d + 1))} disabled={dayOffset >= HORIZON_DAYS - 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            {TENNIS_RULES.courtDurations.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={durationMin === m ? "default" : "outline"}
                className="h-8 px-2.5 text-xs"
                onClick={() => setDurationMin(m)}
              >
                {m === 60 ? "1 год" : m === 90 ? "1,5 год" : "2 год"}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "clay", "hard-out", "hard-in"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={surfaceFilter === s ? "default" : "outline"}
              className="h-7 px-2.5 text-xs"
              onClick={() => setSurfaceFilter(s)}
            >
              {s === "all" ? "Всі покриття" : SURFACE_LABEL[s]}
            </Button>
          ))}
        </div>
      </div>

      {/* Rules legend */}
      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>Indoor 07–22 · Outdoor 08–21 · бронь від +{TENNIS_RULES.leadHours} год · до {HORIZON_DAYS} днів</span>
      </div>

      {/* Grid */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left p-2 md:p-3 sticky left-0 bg-muted/40 z-10 min-w-[110px] md:min-w-[160px]">Корт</th>
              {COURT_HOURS.map((h) => (
                <th key={h} className="p-1 md:p-1.5 font-normal text-center w-9 md:w-11 text-[10px] md:text-xs">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => {
              const busy = getCourtBusy(cabinetId, court.id, dateIso);
              const surface = (court.surface ?? "clay") as TennisSurface;
              return (
                <tr key={court.id} className="border-t">
                  <td className="p-2 md:p-3 sticky left-0 bg-card z-10">
                    <div className="font-medium leading-tight">{court.name.split(" (")[0]}</div>
                    <div className="text-[10px] md:text-[11px] text-muted-foreground">
                      {SURFACE_LABEL[surface]} · {court.hourlyRate} ₴/год
                    </div>
                  </td>
                  {COURT_HOURS.map((h) => {
                    const status = getCourtSlotStatus(busy, surface, dateIso, h, durationMin);
                    const inCart = cartUids.has(`${court.id}|${dateIso}|${String(h).padStart(2, "0")}:00`);
                    const free = status === "free";
                    const title =
                      status === "out-of-hours"
                        ? "Поза робочими годинами"
                        : status === "lead-time"
                          ? `Менше ${TENNIS_RULES.leadHours} год до початку`
                          : status === "busy"
                            ? "Зайнято"
                            : inCart
                              ? "У кошику"
                              : "Вільно";
                    return (
                      <td key={h} className="p-0.5 text-center align-middle">
                        <button
                          type="button"
                          disabled={!free}
                          onClick={() => handlePick(court.id, h)}
                          title={title}
                          className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-md text-[10px] md:text-xs font-medium transition-all",
                            status === "out-of-hours" && "bg-transparent text-muted-foreground/30 cursor-not-allowed",
                            status === "busy" && "bg-muted text-muted-foreground/40 cursor-not-allowed",
                            status === "lead-time" && "bg-muted/40 text-muted-foreground/40 cursor-not-allowed",
                            free && !inCart && "bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400",
                            inCart && "text-white",
                          )}
                          style={inCart ? { background: accent } : undefined}
                          aria-label={`${court.name} ${h}:00 ${title}`}
                        >
                          {inCart ? (
                            <Check className="w-3.5 h-3.5 mx-auto" />
                          ) : status === "free" ? (
                            "•"
                          ) : status === "out-of-hours" ? (
                            ""
                          ) : (
                            "×"
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-muted-foreground px-1">
        <span className="inline-flex items-center gap-1.5 mr-3">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/30" /> вільно
        </span>
        <span className="inline-flex items-center gap-1.5 mr-3">
          <span className="w-3 h-3 rounded-sm bg-muted" /> зайнято
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: accent }} /> у кошику
        </span>
      </div>
    </div>
  );
}

// ============================================
// TAB 2 — Training (service → coach → slot)
// ============================================

const TRAINING_SERVICES = tennisServices.filter((s) => s.category === "training");

function TrainingTab({
  cabinetId,
  onAdd,
  accent,
}: {
  cabinetId: string;
  onAdd: (i: CartItem) => void;
  accent: string;
}) {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);

  const service = TRAINING_SERVICES.find((s) => s.id === serviceId);
  const eligibleCoaches = useMemo(() => {
    if (!service) return [];
    return tennisCoaches.filter((c) => c.specialties.includes(service.category));
  }, [service]);

  const slots = useMemo(() => {
    if (!serviceId) return {};
    const svc = TRAINING_SERVICES.find((s) => s.id === serviceId);
    const dur = svc?.durationMin ?? 60;
    const all = computeAvailability({
      cabinetId,
      serviceIds: [serviceId],
      masterId: coachId ?? undefined,
      daysAhead: HORIZON_DAYS,
      minLeadHours: TENNIS_RULES.leadHours,
    });
    // Додатково відсіюємо слоти, де корт за межами робочого вікна свого покриття.
    const filtered = all.filter((s) => {
      const ws = tennisWorkstations.find((w) => w.id === s.workstationId);
      const surface = (ws?.surface ?? "clay") as TennisSurface;
      const [h, m] = s.startTime.split(":").map(Number);
      const startHourFractional = h + m / 60;
      const w = TENNIS_RULES.hours[surface];
      return startHourFractional >= w.open && startHourFractional + dur / 60 <= w.close;
    });
    return groupSlotsByDate(filtered);
  }, [cabinetId, serviceId, coachId]);

  const handlePick = (slot: { date: string; startTime: string; masterId: string; workstationId: string }) => {
    if (!service) return;
    const coach = tennisCoaches.find((c) => c.id === slot.masterId)!;
    const court = tennisWorkstations.find((c) => c.id === slot.workstationId)!;
    onAdd({
      kind: "training",
      uid: `t-${slot.masterId}-${slot.date}-${slot.startTime}-${Date.now().toString(36)}`,
      serviceId: service.id,
      serviceName: service.name,
      coachId: coach.id,
      coachName: coach.shortName,
      courtId: court.id,
      courtName: court.name.split(" (")[0],
      date: slot.date,
      startTime: slot.startTime,
      durationMin: service.durationMin,
      price: service.price,
    });
    toast({ title: "Додано в кошик", description: `${service.name} · ${coach.shortName} · ${slot.date} ${slot.startTime}` });
  };

  return (
    <div className="space-y-3">
      {/* Service picker */}
      <div className="rounded-xl border bg-card p-3 md:p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">1. Тип тренування</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TRAINING_SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setServiceId(s.id);
                setCoachId(null);
              }}
              className={cn(
                "text-left rounded-lg border p-2.5 transition-all hover:border-foreground/40",
                serviceId === s.id ? "ring-2 border-foreground" : "",
              )}
              style={serviceId === s.id ? ({ ["--tw-ring-color" as never]: accent, borderColor: accent } as React.CSSProperties) : undefined}
            >
              <div className="text-xs md:text-sm font-medium leading-tight">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>{s.durationMin} хв</span>
                <span className="font-semibold text-foreground">{s.price} ₴</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coach */}
      {serviceId && (
        <div className="rounded-xl border bg-card p-3 md:p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            2. Тренер{" "}
            <button
              type="button"
              className="ml-2 normal-case tracking-normal underline-offset-2 hover:underline"
              onClick={() => setCoachId(null)}
            >
              {coachId ? "Скинути · будь-який" : "будь-який вільний"}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {eligibleCoaches.map((c) => (
              <button
                key={c.id}
                onClick={() => setCoachId(c.id)}
                className={cn(
                  "text-left rounded-lg border p-2.5 transition-all hover:border-foreground/40 flex items-center gap-2.5",
                  coachId === c.id ? "ring-2 border-foreground" : "",
                )}
                style={coachId === c.id ? ({ ["--tw-ring-color" as never]: accent, borderColor: accent } as React.CSSProperties) : undefined}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: c.color }}>
                  {c.avatarInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs md:text-sm font-medium truncate">{c.shortName}</div>
                  <div className="text-[10px] md:text-[11px] text-muted-foreground truncate">
                    ★ {c.rating} · {c.publicTitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slots */}
      {serviceId && (
        <div className="rounded-xl border bg-card p-3 md:p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">3. Найближчі вільні слоти</div>
          {Object.keys(slots).length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              На найближчі 7 днів вільних слотів не знайдено. Спробуйте іншого тренера або зверніться на ресепшн.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(slots).slice(0, 5).map(([date, daySlots]) => (
                <div key={date}>
                  <div className="text-xs font-medium mb-1.5 text-muted-foreground">{formatDateShort(date)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {daySlots.slice(0, 18).map((s, i) => (
                      <button
                        key={`${s.masterId}-${s.startTime}-${i}`}
                        onClick={() => handlePick(s)}
                        className="h-8 px-2.5 rounded-md border text-xs hover:border-foreground/60 hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                      >
                        <Clock className="w-3 h-3" />
                        {s.startTime}
                        {!coachId && (
                          <span className="text-[10px] text-muted-foreground">
                            · {tennisCoaches.find((c) => c.id === s.masterId)?.shortName}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB 3 — Group classes (weekly schedule)
// ============================================

function GroupClassesTab({
  cabinetId,
  onAdd,
  accent,
}: {
  cabinetId: string;
  onAdd: (i: CartItem) => void;
  accent: string;
}) {
  const [picked, setPicked] = useState<{ klass: TennisGroupClass; date: string } | null>(null);
  const [participant, setParticipant] = useState("");

  // Розклад на горизонті бронювання, з урахуванням lead-time
  const upcoming = useMemo(() => {
    const out: { klass: TennisGroupClass; date: string }[] = [];
    const now = Date.now();
    for (let off = 0; off <= HORIZON_DAYS; off++) {
      const d = new Date();
      d.setDate(d.getDate() + off);
      const dow = d.getDay();
      const dateIso = d.toISOString().slice(0, 10);
      for (const k of tennisGroupSchedule) {
        if (k.weekday !== dow) continue;
        const startMs = new Date(`${dateIso}T${k.startTime}:00`).getTime();
        if (startMs - now < LEAD_MS) continue;
        out.push({ klass: k, date: dateIso });
      }
    }
    return out;
  }, []);

  const handleConfirm = () => {
    if (!picked || !participant.trim()) return;
    const k = picked.klass;
    const svc = tennisServices.find((s) => s.id === k.serviceId)!;
    const coach = tennisCoaches.find((c) => c.id === k.masterId)!;
    const court = tennisWorkstations.find((c) => c.id === k.workstationId)!;
    onAdd({
      kind: "group",
      uid: `g-${k.id}-${picked.date}-${Date.now().toString(36)}`,
      classId: k.id,
      serviceId: svc.id,
      className: k.shortName === "Cardio" ? "Cardio Tennis" : "Junior School",
      coachName: coach.shortName,
      courtName: court.name.split(" (")[0],
      date: picked.date,
      startTime: k.startTime,
      durationMin: k.durationMin,
      price: svc.price,
      participantName: participant.trim(),
    });
    toast({ title: "Додано у кошик", description: `${k.shortName} · ${picked.date} ${k.startTime} · ${participant}` });
    setPicked(null);
    setParticipant("");
  };

  // Поточне заповнення з урахуванням публічних бронювань
  const computeEnrolled = (k: TennisGroupClass, date: string): number => {
    const fromPub = listPublicBookings(cabinetId).filter(
      (b) => b.serviceIds.includes(k.serviceId) && b.date === date && b.startTime === k.startTime && b.status === "scheduled",
    ).length;
    return k.baseEnrolled + fromPub;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-card p-3 md:p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Розклад на 2 тижні</div>
        <p className="text-xs text-muted-foreground mt-1">Понеділок — день закритих кортів. Оплата на ресепшн перед заняттям.</p>
      </div>

      <div className="grid gap-2">
        {upcoming.map(({ klass, date }) => {
          const enrolled = computeEnrolled(klass, date);
          const full = enrolled >= klass.capacity;
          const svc = tennisServices.find((s) => s.id === klass.serviceId)!;
          return (
            <button
              key={`${klass.id}-${date}`}
              disabled={full}
              onClick={() => setPicked({ klass, date })}
              className={cn(
                "text-left rounded-xl border bg-card p-3 md:p-4 transition-all flex items-center gap-3",
                full ? "opacity-50 cursor-not-allowed" : "hover:border-foreground/40",
              )}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center text-white shrink-0" style={{ background: accent }}>
                <div className="text-[10px] uppercase opacity-90">{new Date(date + "T00:00:00").toLocaleDateString("uk-UA", { weekday: "short" })}</div>
                <div className="text-base font-bold leading-none">{new Date(date + "T00:00:00").getDate()}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm md:text-base">
                    {klass.shortName === "Cardio" ? "Cardio Tennis" : "Junior School"}
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {klass.startTime} · {klass.durationMin} хв
                  </Badge>
                </div>
                <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5 truncate">
                  Тренер {tennisCoaches.find((c) => c.id === klass.masterId)?.shortName} · корт{" "}
                  {tennisWorkstations.find((c) => c.id === klass.workstationId)?.name.split(" (")[0]}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold">{svc.price} ₴</div>
                <div className={cn("text-[11px]", full ? "text-destructive font-medium" : "text-muted-foreground")}>
                  {full ? "Повна" : `${enrolled}/${klass.capacity} місць`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Participant form */}
      <Sheet open={!!picked} onOpenChange={(o) => !o && setPicked(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {picked && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {picked.klass.shortName === "Cardio" ? "Cardio Tennis" : "Junior School"} · {formatDateShort(picked.date)} {picked.klass.startTime}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-muted-foreground">{picked.klass.description}</p>
                <div>
                  <Label className="text-xs">Ім'я учасника (хто буде на занятті)</Label>
                  <Input
                    autoFocus
                    value={participant}
                    onChange={(e) => setParticipant(e.target.value)}
                    placeholder={picked.klass.kind === "juniors" ? "Напр. Микита (8 років)" : "Ваше ім'я"}
                    className="mt-1.5 h-11"
                  />
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={participant.trim().length < 2}
                  className="w-full h-11"
                  style={{ background: accent }}
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Додати в кошик
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ============================================
// Cart bar (sticky bottom)
// ============================================

function CartBar({
  cart,
  total,
  accent,
  onRemove,
  onToggleAddon,
  onContinue,
}: {
  cart: CartItem[];
  total: number;
  accent: string;
  onRemove: (uid: string) => void;
  onToggleAddon: (uid: string, addonId: string) => void;
  onContinue: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = cart.length;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-5xl mx-auto px-3 md:px-4 py-2.5 flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              disabled={count === 0}
              className="flex-1 text-left flex items-center gap-2.5 disabled:opacity-50"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: count > 0 ? accent : undefined }}
              >
                {count > 0 ? count : "0"}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">У кошику</div>
                <div className="font-semibold text-sm md:text-base">
                  {total.toLocaleString("uk-UA")} ₴
                  {count > 0 && <span className="ml-1.5 text-xs text-muted-foreground font-normal">· відкрити</span>}
                </div>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Ваш кошик · {count} позицій</SheetTitle>
            </SheetHeader>
            <div className="mt-3 space-y-2">
              {cart.map((i) => (
                <CartItemRow key={i.uid} item={i} onRemove={onRemove} onToggleAddon={onToggleAddon} accent={accent} />
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Button
          size="lg"
          disabled={count === 0}
          onClick={onContinue}
          className="h-11 px-5 shrink-0"
          style={count > 0 ? { background: accent } : undefined}
        >
          Підтвердити <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function CartItemRow({
  item,
  onRemove,
  onToggleAddon,
  accent,
}: {
  item: CartItem;
  onRemove: (uid: string) => void;
  onToggleAddon: (uid: string, addonId: string) => void;
  accent: string;
}) {
  if (item.kind === "court") {
    const addonsSum = item.addonIds.reduce((s, id) => s + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
    return (
      <div className="rounded-lg border p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
              <span className="truncate">{item.courtName}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {formatDateShort(item.date)} · {item.startTime} · {item.durationMin} хв
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-semibold">{(item.price + addonsSum).toLocaleString("uk-UA")} ₴</div>
            <button onClick={() => onRemove(item.uid)} className="text-xs text-muted-foreground hover:text-destructive mt-1 inline-flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> прибрати
            </button>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t flex flex-wrap gap-1.5">
          {ADDONS.map((a) => (
            <button
              key={a.id}
              onClick={() => onToggleAddon(item.uid, a.id)}
              className={cn(
                "text-[11px] px-2 py-1 rounded-md border transition-colors",
                item.addonIds.includes(a.id) ? "text-white border-transparent" : "hover:border-foreground/40",
              )}
              style={item.addonIds.includes(a.id) ? { background: accent } : undefined}
            >
              {item.addonIds.includes(a.id) && <Check className="w-3 h-3 inline mr-0.5" />}
              {a.name.replace(" на 1 год", "").replace("Прокат ", "")} +{a.price}₴
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (item.kind === "training") {
    return (
      <div className="rounded-lg border p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
            <span className="truncate">{item.serviceName}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Тренер {item.coachName} · {item.courtName} · {formatDateShort(item.date)} {item.startTime}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold">{item.price} ₴</div>
          <button onClick={() => onRemove(item.uid)} className="text-xs text-muted-foreground hover:text-destructive mt-1 inline-flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> прибрати
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border p-3 flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-sm font-medium flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
          <span className="truncate">{item.className} · {item.participantName}</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {item.courtName} · Тренер {item.coachName} · {formatDateShort(item.date)} {item.startTime}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold">{item.price} ₴</div>
        <button onClick={() => onRemove(item.uid)} className="text-xs text-muted-foreground hover:text-destructive mt-1 inline-flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> прибрати
        </button>
      </div>
    </div>
  );
}

// ============================================
// Contacts sheet → confirm
// ============================================

function ContactsSheet({
  open,
  onOpenChange,
  cabinetId,
  cart,
  total,
  accent,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cabinetId: string;
  cart: CartItem[];
  total: number;
  accent: string;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [marketing, setMarketing] = useState(true);
  const [useDeposit, setUseDeposit] = useState(false);
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const recognized = useMemo(() => {
    if (phone.replace(/\D/g, "").length < 9) return null;
    return lookupClientByPhone(cabinetId, phone);
  }, [phone, cabinetId]);

  const membership = useMemo(() => findMembershipByClientId(recognized?.id), [recognized]);
  const [useMembership, setUseMembership] = useState(true);

  const existingActive = useMemo(() => {
    const normalized = normalizePhone(phone);
    if (normalized.length < 9) return 0;
    const now = Date.now();
    return listPublicBookings(cabinetId).filter(
      (b) =>
        b.status === "scheduled" &&
        normalizePhone(b.clientPhone) === normalized &&
        new Date(`${b.date}T${b.startTime}:00`).getTime() > now,
    ).length;
  }, [phone, cabinetId]);

  const nameInvalid = fullName.trim().length <= 1;
  const phoneInvalid = !/^\+?\d{9,}/.test(phone.replace(/\s/g, ""));
  const wouldExceedLimit = existingActive + cart.length > TENNIS_RULES.maxActivePerPhone;
  const canSubmit = !nameInvalid && !phoneInvalid && cart.length > 0 && !wouldExceedLimit;
  const deposit = Math.round(total * 0.3);

  const showNameError = (touched.name || submitAttempted) && nameInvalid;
  const showPhoneError = (touched.phone || submitAttempted) && phoneInvalid;

  // Disabled-reason text (інлайн під кнопкою).
  const disabledReason = (() => {
    if (cart.length === 0) return "Додайте слот, корт або заняття у кошик.";
    if (nameInvalid) return "Вкажіть імʼя та прізвище.";
    if (phoneInvalid) return "Вкажіть телефон у форматі +380...";
    if (wouldExceedLimit)
      return `Перевищено ліміт: максимум ${TENNIS_RULES.maxActivePerPhone} активних бронювань. Уже активних: ${existingActive}, у кошику: ${cart.length}.`;
    return null;
  })();

  /** Прямий запис у localStorage без re-check `computeAvailability`. */
  const pushDirectRecord = (record: {
    serviceIds: string[];
    masterId: string;
    workstationId: string;
    date: string;
    startTime: string;
    durationMin: number;
    totalPrice: number;
    note?: string;
  }): boolean => {
    try {
      const full = {
        id: crypto.randomUUID(),
        cabinetId,
        ...record,
        clientName: fullName.trim(),
        clientPhone: phone.trim(),
        clientEmail: email.trim() || undefined,
        source: "wizard" as const,
        status: "scheduled" as const,
        createdAt: new Date().toISOString(),
        cancelToken: crypto.randomUUID().slice(0, 12),
        origin: "salon" as const,
      };
      const key = `salon-public-bookings-${cabinetId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(full);
      localStorage.setItem(key, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent("public-bookings-updated", { detail: { cabinetId } }));
      return true;
    } catch {
      return false;
    }
  };

  const handleConfirm = () => {
    setSubmitAttempted(true);
    if (!canSubmit) {
      if (phoneInvalid) phoneRef.current?.focus();
      else if (nameInvalid) nameRef.current?.focus();
      return;
    }
    let ok = 0;
    let fail = 0;
    const extraNote = note.trim();

    for (const item of cart) {
      if (item.kind === "court") {
        const svcId =
          item.surface === "clay"
            ? "tsvc-rent-clay"
            : item.surface === "hard-out"
              ? "tsvc-rent-hard-out"
              : "tsvc-rent-hard-in";
        const addonsPrice = item.addonIds.reduce(
          (s, id) => s + (ADDONS.find((a) => a.id === id)?.price ?? 0),
          0,
        );
        const success = pushDirectRecord({
          serviceIds: [svcId, ...item.addonIds],
          masterId: SENTINEL_COURT_MASTER,
          workstationId: item.courtId,
          date: item.date,
          startTime: item.startTime,
          durationMin: item.durationMin,
          totalPrice: item.price + addonsPrice,
          note: extraNote || undefined,
        });
        success ? ok++ : fail++;
        continue;
      }

      if (item.kind === "training") {
        const success = pushDirectRecord({
          serviceIds: [item.serviceId],
          masterId: item.coachId,
          workstationId: item.courtId,
          date: item.date,
          startTime: item.startTime,
          durationMin: item.durationMin,
          totalPrice: item.price,
          note: extraNote || undefined,
        });
        success ? ok++ : fail++;
        continue;
      }

      // group
      const cls: TennisGroupClass | undefined = tennisGroupSchedule.find((c) => c.id === item.classId);
      if (!cls) {
        fail++;
        continue;
      }
      const success = pushDirectRecord({
        serviceIds: [item.serviceId],
        masterId: cls.masterId,
        workstationId: cls.workstationId,
        date: item.date,
        startTime: item.startTime,
        durationMin: item.durationMin,
        totalPrice: item.price,
        note: `Учасник: ${item.participantName}${extraNote ? `. ${extraNote}` : ""}`,
      });
      success ? ok++ : fail++;
    }

    if (ok > 0) {
      toast({
        title: `Заброньовано: ${ok}`,
        description:
          fail > 0
            ? `${fail} позицій не вдалось забронювати. Спробуйте ще раз.`
            : "Ми надіслали підтвердження на телефон.",
      });
      onSuccess();
    } else {
      toast({
        title: "Не вдалось забронювати",
        description: "Сталась помилка. Оновіть сторінку та спробуйте ще раз.",
        variant: "destructive",
      });
    }
    void useDeposit;
    void confirmPublicBooking; // kept for future re-enable of availability re-check
    void marketing;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Контактні дані</SheetTitle>
        </SheetHeader>
        <div className="mt-3 space-y-3">
          <div>
            <Label className="text-xs" htmlFor="tennis-phone">Телефон *</Label>
            <Input
              id="tennis-phone"
              ref={phoneRef}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              placeholder="+380…"
              aria-invalid={showPhoneError || undefined}
              className={cn(
                "mt-1.5 h-11",
                showPhoneError && "border-destructive focus-visible:ring-destructive",
              )}
            />
            {showPhoneError && (
              <p className="text-[11px] text-destructive mt-1">Вкажіть телефон у форматі +380XXXXXXXXX (мін. 9 цифр).</p>
            )}
          </div>
          {recognized && (
            <div className="rounded-lg border bg-emerald-500/5 border-emerald-500/30 p-2.5 text-xs flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium">{recognized.fullName}</div>
                <div className="text-muted-foreground">Постійний клієнт · ми впізнали вас за телефоном</div>
              </div>
            </div>
          )}
          {membership && (
            <div className="rounded-lg border p-3" style={{ borderColor: `${accent}66`, background: `${accent}10` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" style={{ color: accent }} />
                    Активний абонемент
                  </div>
                  <div className="text-xs mt-0.5">{membership.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Залишок: {membership.hoursLeft === 999 ? "безліміт" : `${membership.hoursLeft} год`} · до {membership.validUntil}
                  </div>
                </div>
                <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer shrink-0">
                  <input type="checkbox" checked={useMembership} onChange={(e) => setUseMembership(e.target.checked)} />
                  Списати
                </label>
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs" htmlFor="tennis-name">Імʼя *</Label>
            <Input
              id="tennis-name"
              ref={nameRef}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Як до вас звертатись"
              aria-invalid={showNameError || undefined}
              className={cn(
                "mt-1.5 h-11",
                showNameError && "border-destructive focus-visible:ring-destructive",
              )}
            />
            {showNameError && (
              <p className="text-[11px] text-destructive mt-1">Вкажіть імʼя та прізвище (мін. 2 символи).</p>
            )}
          </div>
          <div>
            <Label className="text-xs">Email (для нагадування)</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" />
          </div>
          <div>
            <Label className="text-xs">Коментар (необов'язково)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1.5" />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            Згодний(на) на нагадування у SMS / Viber
          </label>

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Разом</span>
              <span className="font-semibold">{total.toLocaleString("uk-UA")} ₴</span>
            </div>
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span>Передоплата 30% Apple/Google Pay (демо)</span>
              <input type="checkbox" checked={useDeposit} onChange={(e) => setUseDeposit(e.target.checked)} />
            </label>
            {useDeposit && (
              <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
                <span>Депозит зараз</span>
                <span>{deposit.toLocaleString("uk-UA")} ₴</span>
              </div>
            )}
          </div>

          {existingActive > 0 && !wouldExceedLimit && (
            <div className="text-[11px] text-muted-foreground">
              У вас уже {existingActive} активних бронювань · залишилось {TENNIS_RULES.maxActivePerPhone - existingActive}.
            </div>
          )}
          {wouldExceedLimit && (
            <div className="text-[11px] text-destructive">
              Перевищено ліміт: {TENNIS_RULES.maxActivePerPhone} активних бронювань на телефон. Уже активних: {existingActive}, у кошику: {cart.length}.
            </div>
          )}
          <Button onClick={handleConfirm} disabled={cart.length === 0 || wouldExceedLimit} className="w-full h-11" style={{ background: accent }}>
            <Check className="w-4 h-4 mr-1.5" /> Підтвердити бронювання
          </Button>
          {disabledReason && (
            <div className="text-[11px] text-muted-foreground text-center">{disabledReason}</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// Done view
// ============================================

function DoneView({ cabinet, profile, accent, count }: { cabinet: Cabinet; profile: SalonPublicProfile; accent: string; count: number }) {
  void cabinet;
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-b from-muted/40 to-background">
      <div className="max-w-md w-full rounded-2xl border bg-card shadow-sm p-6 md:p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: `${accent}20` }}>
          <Check className="w-8 h-8" style={{ color: accent }} />
        </div>
        <h1 className="mt-4 text-xl md:text-2xl font-semibold">Дякуємо!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Заброньовано {count} {count === 1 ? "позицію" : "позицій"} у {profile.brandName}.
          <br /> Нагадування надішлемо за 24 години та за 2 години до візиту.
        </p>
        <Button className="mt-5 h-11" style={{ background: accent }} onClick={() => window.location.reload()}>
          Забронювати ще
        </Button>
      </div>
    </div>
  );
}
