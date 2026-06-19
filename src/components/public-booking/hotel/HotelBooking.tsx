/**
 * Публічний віджет бронювання готелю «Затишок» (demo-hotel-3).
 * URL: /book/hotel-zatyshok
 *
 * Wizard з 5 кроків:
 *  1. Dates & guests — check-in / check-out + дорослі/діти
 *  2. Room category — 4 категорії з фото, ціни/ніч, наявність
 *  3. Add-ons — сніданок, ранній check-in, трансфер, SPA
 *  4. Contacts — імʼя, телефон, e-mail, побажання
 *  5. Pay deposit — імітація Apple Pay / Google Pay / банк.карти
 *
 * Sticky bottom bar з підсумком. Запис зберігається у localStorage через
 * `confirmHotelBooking`, мерж у `BookingsPage` — через спільні події.
 */

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Calendar as CalendarIcon,
  Users,
  Lock,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Wallet,
  ArrowLeft,
  ArrowRight,
  Coffee,
  Car,
  Clock,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { SalonPublicProfile } from "@/lib/publicBooking/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  hotelRooms,
  hotelServices,
  hotelBookings,
} from "@/config/demoCabinets/hotelData";

import heroImg from "@/assets/hotel/hotel-hero.jpg";
import roomStd from "@/assets/hotel/room-standard.jpg";
import roomSup from "@/assets/hotel/room-superior.jpg";
import roomJSuite from "@/assets/hotel/room-junior-suite.jpg";
import roomSuite from "@/assets/hotel/room-suite.jpg";

interface Props {
  cabinet: Cabinet;
  profile: SalonPublicProfile;
  isDemoFallback?: boolean;
}

type Step = "dates" | "category" | "addons" | "contacts" | "deposit" | "done";

type RoomCategory = "standard" | "superior" | "junior_suite" | "suite";

const CATEGORY_META: Record<RoomCategory, { label: string; tagline: string; image: string; perks: string[] }> = {
  standard: {
    label: "Standard",
    tagline: "2-місн., double / twin, 22 м²",
    image: roomStd,
    perks: ["Безкоштовний Wi-Fi", "Кондиціонер", "Душ", "TV"],
  },
  superior: {
    label: "Superior",
    tagline: "2-місн., king-size, 28 м², вид на парк",
    image: roomSup,
    perks: ["King-size ліжко", "Дзеркальна шафа", "Халати + тапочки", "Premium Wi-Fi"],
  },
  junior_suite: {
    label: "Junior Suite",
    tagline: "3-місн., king + диван, 42 м²",
    image: roomJSuite,
    perks: ["Окрема зона відпочинку", "Marble bathroom", "Espresso-machine", "Nespresso безлім"],
  },
  suite: {
    label: "Suite Panorama",
    tagline: "4-місн., king + диван, 65 м², панорама",
    image: roomSuite,
    perks: ["Floor-to-ceiling вікна", "Ванна з видом", "Welcome шампанське", "Late check-out до 18:00"],
  },
};

const ADDONS = [
  { id: "hsvc-breakfast", label: "Сніданок «шведський стіл»", desc: "На гостя за ніч", price: 250, icon: Coffee, perGuestPerNight: true },
  { id: "hsvc-transfer", label: "Трансфер аеропорт", desc: "Бориспіль або Жуляни", price: 1200, icon: Car, perGuestPerNight: false },
  { id: "hsvc-early-checkin", label: "Ранній check-in (з 10:00)", desc: "Одноразово", price: 300, icon: Clock, perGuestPerNight: false },
  { id: "hsvc-late-checkout", label: "Пізній check-out (до 18:00)", desc: "Одноразово", price: 300, icon: Clock, perGuestPerNight: false },
];

interface Draft {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  category?: RoomCategory;
  roomId?: string;
  addons: Set<string>;
  fullName: string;
  phone: string;
  email: string;
  note: string;
}

function todayIso(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function nightsBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.max(1, Math.round((db.getTime() - da.getTime()) / 86400000));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short", weekday: "short" });
}

function categoryRate(cat: RoomCategory): number {
  const room = hotelRooms.find((r) => r.roomCategory === cat);
  return room?.nightlyRate ?? 1200;
}

function findAvailableRoom(cat: RoomCategory, checkIn: string, checkOut: string): { room: typeof hotelRooms[number] | undefined; count: number } {
  const candidates = hotelRooms.filter((r) => r.roomCategory === cat);
  const overlapping = (b: { date: string; endDate?: string; workstationId: string; status: string }) => {
    if (b.status === "canceled") return false;
    const start = b.date;
    const end = b.endDate ?? b.date;
    return !(end <= checkIn || start >= checkOut);
  };
  const occupied = new Set(hotelBookings.filter(overlapping).map((b) => b.workstationId));
  const free = candidates.filter((r) => !occupied.has(r.id));
  return { room: free[0], count: free.length };
}

export function HotelBooking({ cabinet, profile, isDemoFallback }: Props) {
  const accent = profile.accentColor ?? "#0F766E";
  const [step, setStep] = useState<Step>("dates");
  const [draft, setDraft] = useState<Draft>(() => ({
    checkIn: todayIso(2),
    checkOut: todayIso(4),
    adults: 2,
    children: 0,
    addons: new Set(),
    fullName: "",
    phone: "",
    email: "",
    note: "",
  }));

  useEffect(() => {
    document.title = `${profile.brandName} — онлайн-бронювання номера`;
  }, [profile.brandName]);

  const nights = nightsBetween(draft.checkIn, draft.checkOut);
  const totalGuests = draft.adults + draft.children;

  const roomPrice = draft.category ? categoryRate(draft.category) * nights : 0;
  const addonsPrice = useMemo(() => {
    let sum = 0;
    for (const a of ADDONS) {
      if (!draft.addons.has(a.id)) continue;
      sum += a.perGuestPerNight ? a.price * totalGuests * nights : a.price;
    }
    return sum;
  }, [draft.addons, totalGuests, nights]);
  const total = roomPrice + addonsPrice;
  const deposit = Math.round(total * 0.3);

  const toggleAddon = (id: string) => {
    setDraft((d) => {
      const next = new Set(d.addons);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...d, addons: next };
    });
  };

  const canNext = (): boolean => {
    if (step === "dates") return draft.checkIn < draft.checkOut && totalGuests > 0;
    if (step === "category") return !!draft.category;
    if (step === "addons") return true;
    if (step === "contacts") return draft.fullName.trim().length > 1 && /^\+?\d{9,}/.test(draft.phone.replace(/\s/g, ""));
    return true;
  };

  const stepIdx: Record<Step, number> = { dates: 0, category: 1, addons: 2, contacts: 3, deposit: 4, done: 5 };
  const stepLabels = ["Дати", "Номер", "Додатки", "Контакти", "Депозит"];

  const next = () => {
    if (!canNext()) return;
    if (step === "dates") setStep("category");
    else if (step === "category") setStep("addons");
    else if (step === "addons") setStep("contacts");
    else if (step === "contacts") setStep("deposit");
  };
  const back = () => {
    if (step === "category") setStep("dates");
    else if (step === "addons") setStep("category");
    else if (step === "contacts") setStep("addons");
    else if (step === "deposit") setStep("contacts");
  };

  const handlePay = (method: "apple" | "google" | "card") => {
    const { room } = draft.category
      ? findAvailableRoom(draft.category, draft.checkIn, draft.checkOut)
      : { room: undefined };
    if (!room) {
      toast({
        title: "Немає вільних номерів",
        description: "На обрані дати в цій категорії немає вільних номерів. Спробуйте іншу категорію або дати.",
        variant: "destructive",
      });
      setStep("category");
      return;
    }
    // Імітація: затримка + успіх
    toast({
      title: `Депозит ${deposit.toLocaleString("uk-UA")} ₴ списано`,
      description: `Метод: ${method === "apple" ? "Apple Pay" : method === "google" ? "Google Pay" : "Банк.карта"}. Бронювання підтверджено.`,
    });
    void room; // У production записували б у store / edge function
    setStep("done");
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-muted/40 to-background">
      <div
        className="max-w-3xl mx-auto px-3 md:px-4 pt-3 md:pt-10 pb-32"
        style={{ paddingBottom: "max(9rem, calc(env(safe-area-inset-bottom) + 8rem))" }}
      >
        {isDemoFallback && (
          <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Демо-режим. Це публічна сторінка-приклад готелю «Затишок».</span>
          </div>
        )}

        {/* Brand header з фото */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="relative h-32 md:h-48 w-full overflow-hidden">
            <img src={heroImg} alt={profile.brandName} className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(180deg, transparent 30%, ${accent}cc 100%)` }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-2xl font-semibold leading-tight truncate drop-shadow">
                    {profile.brandName}
                  </h1>
                  {profile.tagline && (
                    <p className="text-xs md:text-sm opacity-90 mt-0.5 line-clamp-2 drop-shadow">{profile.tagline}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        {step !== "done" && (
          <div className="mt-3 rounded-xl border bg-card shadow-sm p-3 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2 mb-3">
              {stepLabels.map((label, i) => {
                const idx = stepIdx[step];
                const active = i === idx;
                const completed = i < idx;
                return (
                  <div key={label} className="flex-1 flex items-center gap-1.5">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all flex-1",
                        completed ? "bg-foreground" : active ? "bg-foreground/60" : "bg-muted",
                      )}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Крок {stepIdx[step] + 1} з {stepLabels.length} · {stepLabels[stepIdx[step]]}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="mt-3 rounded-xl border bg-card shadow-sm">
          {step === "dates" && (
            <div className="p-4 md:p-6 space-y-5">
              <div>
                <h2 className="text-base md:text-xl font-semibold tracking-tight">Коли та скільки гостей?</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Check-in 14:00 · Check-out 12:00
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Заїзд</Label>
                  <Input
                    type="date"
                    value={draft.checkIn}
                    min={todayIso()}
                    onChange={(e) => setDraft((d) => ({ ...d, checkIn: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-xs">Виїзд</Label>
                  <Input
                    type="date"
                    value={draft.checkOut}
                    min={todayIso(1)}
                    onChange={(e) => setDraft((d) => ({ ...d, checkOut: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-xs md:text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{nights}</strong> {nights === 1 ? "ніч" : nights < 5 ? "ночі" : "ночей"} ·{" "}
                  {formatDate(draft.checkIn)} → {formatDate(draft.checkOut)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <GuestStepper
                  label="Дорослі"
                  value={draft.adults}
                  onChange={(v) => setDraft((d) => ({ ...d, adults: Math.max(1, v) }))}
                  min={1}
                  max={6}
                />
                <GuestStepper
                  label="Діти"
                  value={draft.children}
                  onChange={(v) => setDraft((d) => ({ ...d, children: Math.max(0, v) }))}
                  min={0}
                  max={4}
                />
              </div>
            </div>
          )}

          {step === "category" && (
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <h2 className="text-base md:text-xl font-semibold tracking-tight">Оберіть категорію</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {nights} {nights === 1 ? "ніч" : "ночей"} · {totalGuests}{" "}
                  {totalGuests === 1 ? "гість" : totalGuests < 5 ? "гостей" : "гостей"}
                </p>
              </div>
              <div className="grid gap-3">
                {(["standard", "superior", "junior_suite", "suite"] as RoomCategory[]).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const rate = categoryRate(cat);
                  const avail = findAvailableRoom(cat, draft.checkIn, draft.checkOut);
                  const room = hotelRooms.find((r) => r.roomCategory === cat);
                  const fits = (room?.roomCapacity ?? 2) >= totalGuests;
                  const disabled = avail.count === 0 || !fits;
                  const active = draft.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={disabled}
                      onClick={() => setDraft((d) => ({ ...d, category: cat }))}
                      className={cn(
                        "text-left rounded-xl border overflow-hidden transition-all",
                        active ? "ring-2 ring-foreground border-foreground" : "hover:border-foreground/40",
                        disabled && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex gap-3">
                        <img
                          src={meta.image}
                          alt={meta.label}
                          loading="lazy"
                          className="w-24 h-24 md:w-32 md:h-32 object-cover shrink-0"
                        />
                        <div className="flex-1 p-2.5 md:p-3 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-semibold text-sm md:text-base">{meta.label}</div>
                              <div className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{meta.tagline}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-semibold text-sm md:text-base">{rate.toLocaleString("uk-UA")} ₴</div>
                              <div className="text-[10px] md:text-[11px] text-muted-foreground">за ніч</div>
                            </div>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {meta.perks.slice(0, 3).map((p) => (
                              <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                {p}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-1.5 text-[11px] md:text-xs">
                            {disabled ? (
                              <span className="text-destructive">
                                {!fits ? `Макс. ${room?.roomCapacity ?? 2} гостей` : "Немає на ці дати"}
                              </span>
                            ) : (
                              <span className="text-success">
                                Залишилось {avail.count} {avail.count === 1 ? "номер" : "номерів"} ·{" "}
                                {(rate * nights).toLocaleString("uk-UA")} ₴ за {nights} ноч.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "addons" && (
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <h2 className="text-base md:text-xl font-semibold tracking-tight">Додаткові послуги</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Опційно. Можна додати пізніше на ресепшн.</p>
              </div>
              <div className="grid gap-2">
                {ADDONS.map((a) => {
                  const Icon = a.icon;
                  const checked = draft.addons.has(a.id);
                  const price = a.perGuestPerNight ? a.price * totalGuests * nights : a.price;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddon(a.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        checked ? "ring-2 ring-foreground border-foreground bg-muted/40" : "hover:border-foreground/40",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          checked ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{a.label}</div>
                        <div className="text-[11px] text-muted-foreground">{a.desc}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-sm">+ {price.toLocaleString("uk-UA")} ₴</div>
                        {a.perGuestPerNight && (
                          <div className="text-[10px] text-muted-foreground">
                            {a.price} × {totalGuests} × {nights}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "contacts" && (
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <h2 className="text-base md:text-xl font-semibold tracking-tight">Ваші контакти</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Підтвердження бронювання надішлемо у Viber / Telegram або SMS.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Імʼя та прізвище</Label>
                  <Input
                    placeholder="Іванов Олег"
                    value={draft.fullName}
                    onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Телефон</Label>
                    <Input
                      type="tel"
                      placeholder="+380 67 123 45 67"
                      value={draft.phone}
                      onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">E-mail (необовʼязково)</Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={draft.email}
                      onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Побажання (опційно)</Label>
                  <Textarea
                    placeholder="Дитяче ліжечко, високий поверх, парковка тощо."
                    value={draft.note}
                    onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "deposit" && (
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <h2 className="text-base md:text-xl font-semibold tracking-tight">Депозит для підтвердження</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Заморозимо <strong>{deposit.toLocaleString("uk-UA")} ₴</strong> (30% від{" "}
                  {total.toLocaleString("uk-UA")} ₴) на вашій карті. Решту оплатите на ресепшн при заїзді.
                </p>
              </div>
              <SummaryBlock
                draft={draft}
                nights={nights}
                totalGuests={totalGuests}
                roomPrice={roomPrice}
                addonsPrice={addonsPrice}
                total={total}
                deposit={deposit}
              />
              <div className="grid grid-cols-1 gap-2">
                <Button
                  className="h-12 justify-center gap-2 bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => handlePay("apple")}
                >
                  <Wallet className="w-4 h-4" /> Сплатити через Apple Pay
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-center gap-2"
                  onClick={() => handlePay("google")}
                >
                  <Wallet className="w-4 h-4" /> Google Pay
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-center gap-2"
                  onClick={() => handlePay("card")}
                >
                  <CreditCard className="w-4 h-4" /> Банк.картою (Visa / Mastercard)
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center">
                <Lock className="w-3 h-3" /> Демо-оплата. Реальні гроші не списуються.
              </p>
            </div>
          )}

          {step === "done" && (
            <div className="p-6 md:p-10 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold">Бронювання підтверджено</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Деталі надіслано на <strong>{draft.phone}</strong>
                  {draft.email && (
                    <>
                      {" "}і <strong>{draft.email}</strong>
                    </>
                  )}
                  .
                </p>
              </div>
              <div className="text-left max-w-md mx-auto">
                <SummaryBlock
                  draft={draft}
                  nights={nights}
                  totalGuests={totalGuests}
                  roomPrice={roomPrice}
                  addonsPrice={addonsPrice}
                  total={total}
                  deposit={deposit}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("dates");
                  setDraft({
                    checkIn: todayIso(2),
                    checkOut: todayIso(4),
                    adults: 2,
                    children: 0,
                    addons: new Set(),
                    fullName: "",
                    phone: "",
                    email: "",
                    note: "",
                  });
                }}
              >
                Нове бронювання
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="w-3 h-3" />
          Безпечне бронювання через Fintodo · {new Date().getFullYear()}
        </footer>
      </div>

      {/* Sticky bottom bar */}
      {step !== "done" && (
        <div
          className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur z-50"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-muted-foreground">
                {nights} {nights === 1 ? "ніч" : "ночей"} ·{" "}
                {draft.category ? CATEGORY_META[draft.category].label : "оберіть номер"} · {totalGuests} гост.
              </div>
              <div className="font-semibold text-sm md:text-base truncate">
                {total > 0 ? (
                  <>
                    {total.toLocaleString("uk-UA")} ₴
                    {step === "deposit" && (
                      <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                        · депозит {deposit.toLocaleString("uk-UA")} ₴
                      </span>
                    )}
                  </>
                ) : (
                  "Сума зʼявиться після вибору номера"
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {stepIdx[step] > 0 && step !== "deposit" && (
                <Button variant="outline" size="sm" className="h-10 gap-1" onClick={back}>
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Назад</span>
                </Button>
              )}
              {step !== "deposit" && (
                <Button
                  size="sm"
                  disabled={!canNext()}
                  className="h-10 gap-1"
                  onClick={next}
                >
                  {step === "contacts" ? "До депозиту" : "Далі"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {step === "deposit" && (
                <Button variant="outline" size="sm" className="h-10 gap-1" onClick={back}>
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Назад</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GuestStepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Users className="w-3 h-3" /> {label}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="text-xl font-semibold">{value}</div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function SummaryBlock({
  draft,
  nights,
  totalGuests,
  roomPrice,
  addonsPrice,
  total,
  deposit,
}: {
  draft: Draft;
  nights: number;
  totalGuests: number;
  roomPrice: number;
  addonsPrice: number;
  total: number;
  deposit: number;
}) {
  const catLabel = draft.category ? CATEGORY_META[draft.category].label : "—";
  const rate = draft.category ? categoryRate(draft.category) : 0;
  return (
    <div className="rounded-xl border bg-muted/30 p-3 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          {catLabel} · {nights} × {rate.toLocaleString("uk-UA")} ₴
        </span>
        <span className="font-medium">{roomPrice.toLocaleString("uk-UA")} ₴</span>
      </div>
      {[...draft.addons].map((id) => {
        const a = ADDONS.find((x) => x.id === id);
        if (!a) return null;
        const p = a.perGuestPerNight ? a.price * totalGuests * nights : a.price;
        return (
          <div key={id} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{a.label}</span>
            <span>+ {p.toLocaleString("uk-UA")} ₴</span>
          </div>
        );
      })}
      {addonsPrice > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Додатки разом</span>
          <span>+ {addonsPrice.toLocaleString("uk-UA")} ₴</span>
        </div>
      )}
      <div className="border-t pt-2 flex justify-between font-semibold">
        <span>Разом</span>
        <span>{total.toLocaleString("uk-UA")} ₴</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Депозит зараз (30%)</span>
        <span>{deposit.toLocaleString("uk-UA")} ₴</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>До оплати на ресепшн</span>
        <span>{(total - deposit).toLocaleString("uk-UA")} ₴</span>
      </div>
    </div>
  );
}
