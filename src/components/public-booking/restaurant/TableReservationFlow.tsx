/**
 * Бронювання столика для ресторану «Смак» — світовий рівень (OpenTable / Resy стиль).
 * Кроки: дата+час → гості → зона (з фото) → столик → контакти+привід → confirm.
 */

import { useMemo, useState } from "react";
import { format, addDays } from "date-fns";
import { uk } from "date-fns/locale";
import {
  CalendarDays, Users, MapPin, Check, ChevronRight, Phone,
  User as UserIcon, MessageSquare, Sparkles, Cake, Heart, Briefcase, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { restaurantTables } from "@/config/demoCabinets/restaurantData";
import { ZONE_IMAGES } from "./dishVisuals";

interface Props {
  cabinet: Cabinet;
  brandName: string;
  accent: string;
}

type Step = "when" | "guests" | "zone" | "table" | "contact" | "done";
type Zone = "hall" | "terrace" | "vip";

const ZONES: { id: Zone; label: string; hint: string; image: string; tag?: string }[] = [
  { id: "hall",    label: "Зал",    hint: "Класична атмосфера, камін, дерево",        image: ZONE_IMAGES.hall },
  { id: "terrace", label: "Тераса", hint: "Свіже повітря, гірлянди, вид на місто",     image: ZONE_IMAGES.terrace, tag: "Сезонно" },
  { id: "vip",     label: "VIP",    hint: "Приватна кабінка з кришталевою люстрою",   image: ZONE_IMAGES.vip,     tag: "Мін. замовлення 3 000 ₴" },
];

const TIMES = ["12:00", "13:00", "14:00", "17:00", "18:00", "19:00", "19:30", "20:00", "20:30", "21:00"];

const OCCASIONS = [
  { id: "none",     label: "Без приводу",       icon: Sparkles },
  { id: "birthday", label: "День народження",   icon: Cake },
  { id: "romantic", label: "Романтична вечеря", icon: Heart },
  { id: "business", label: "Бізнес-зустріч",    icon: Briefcase },
  { id: "friends",  label: "Дружня зустріч",    icon: PartyPopper },
] as const;

const DIET_TAGS = [
  "Вегетаріанець",
  "Веган",
  "Без глютену",
  "Без лактози",
  "Алергія на горіхи",
  "Алергія на морепродукти",
  "Халяль",
] as const;

export function TableReservationFlow({ brandName, accent }: Props) {
  const [step, setStep] = useState<Step>("when");
  const [date, setDate] = useState<string>(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [time, setTime] = useState<string>("19:00");
  const [guests, setGuests] = useState<number>(2);
  const [zone, setZone] = useState<Zone>("hall");
  const [tableId, setTableId] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<typeof OCCASIONS[number]["id"]>("none");
  const [diets, setDiets] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const availableTables = useMemo(
    () => restaurantTables.filter((t) => t.zone === zone && (t.seats ?? 0) >= guests),
    [zone, guests],
  );
  const chosenTable = restaurantTables.find((t) => t.id === tableId);
  const chosenZone = ZONES.find((z) => z.id === zone)!;
  const chosenOccasion = OCCASIONS.find((o) => o.id === occasion)!;

  const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const toggleDiet = (d: string) =>
    setDiets((s) => {
      const next = new Set(s);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });

  if (step === "done") {
    return (
      <div className="p-0 overflow-hidden">
        <div className="relative h-40 md:h-48">
          <img
            src={chosenZone.image}
            alt={chosenZone.label}
            loading="lazy"
            width={1024}
            height={512}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ background: accent }}
            >
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold drop-shadow">Бронювання прийнято</h2>
            <p className="text-xs md:text-sm opacity-90 mt-0.5">
              {brandName} зв'яжеться з вами за номером {phone || "—"}
            </p>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-3">
          <div className="rounded-lg border bg-muted/40 p-3 md:p-4 text-sm space-y-1.5">
            <Row label="Коли" value={`${format(new Date(date), "d MMMM, EEEE", { locale: uk })} · ${time}`} />
            <Row label="Гостей" value={`${guests}`} />
            <Row label="Зона" value={chosenZone.label} />
            <Row label="Столик" value={chosenTable?.name ?? "—"} />
            {occasion !== "none" && <Row label="Привід" value={chosenOccasion.label} />}
            {diets.size > 0 && <Row label="Особливості" value={Array.from(diets).join(", ")} />}
            {note && <Row label="Побажання" value={note} />}
          </div>
          <Button variant="outline" onClick={() => setStep("when")} className="w-full">
            Створити ще одне бронювання
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Stepper step={step} accent={accent} />

      {step === "when" && (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Дата
            </Label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x pb-1 -mx-1 px-1">
              {nextDays.map((d) => {
                const v = format(d, "yyyy-MM-dd");
                const active = v === date;
                return (
                  <button
                    key={v}
                    onClick={() => setDate(v)}
                    className={cn(
                      "snap-start shrink-0 rounded-xl border px-3 py-2 text-center min-w-[68px] transition-all",
                      active ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
                    )}
                  >
                    <div className="text-[10px] uppercase opacity-70">{format(d, "EEE", { locale: uk })}</div>
                    <div className="text-lg font-semibold leading-tight">{format(d, "d")}</div>
                    <div className="text-[10px] opacity-70">{format(d, "LLL", { locale: uk })}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm">Час</Label>
            <div className="grid grid-cols-5 gap-2">
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTime(t)}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-medium transition-all",
                    time === t ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full h-11 text-white" onClick={() => setStep("guests")} style={{ background: accent }}>
            Далі <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {step === "guests" && (
        <div className="space-y-4">
          <Label className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Скільки гостей?
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                onClick={() => setGuests(n)}
                className={cn(
                  "rounded-lg border py-3 text-base font-semibold transition-all",
                  guests === n ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {guests >= 8 && (
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Для груп від 8 осіб ми рекомендуємо VIP-кабінку — приватність і окремий офіціант.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-11" onClick={() => setStep("when")}>
              Назад
            </Button>
            <Button className="h-11 text-white" onClick={() => setStep("zone")} style={{ background: accent }}>
              Далі <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === "zone" && (
        <div className="space-y-4">
          <Label className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Виберіть зону
          </Label>
          <div className="space-y-2">
            {ZONES.map((z) => {
              const count = restaurantTables.filter((t) => t.zone === z.id && (t.seats ?? 0) >= guests).length;
              const active = zone === z.id;
              const disabled = count === 0;
              return (
                <button
                  key={z.id}
                  onClick={() => !disabled && setZone(z.id)}
                  disabled={disabled}
                  className={cn(
                    "w-full rounded-xl overflow-hidden border text-left transition-all relative group",
                    active && "ring-2 ring-offset-1",
                    disabled && "opacity-40 cursor-not-allowed",
                  )}
                  style={active ? { borderColor: accent, ["--tw-ring-color" as any]: accent } : undefined}
                >
                  <div className="relative h-28">
                    <img
                      src={z.image}
                      alt={z.label}
                      loading="lazy"
                      width={1024}
                      height={384}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                      <div className="flex justify-end gap-1">
                        {z.tag && (
                          <Badge className="bg-white/20 backdrop-blur-md border-0 text-white text-[10px]">
                            {z.tag}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-base flex items-center gap-2">
                          {z.label}
                          {active && <Check className="w-4 h-4" style={{ color: accent }} />}
                        </div>
                        <div className="text-xs opacity-90 line-clamp-1">{z.hint}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {count} {count === 1 ? "столик" : "столиків"} доступно
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-11" onClick={() => setStep("guests")}>
              Назад
            </Button>
            <Button
              className="h-11 text-white"
              onClick={() => setStep("table")}
              disabled={availableTables.length === 0}
              style={{ background: accent }}
            >
              Далі <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === "table" && (
        <div className="space-y-4">
          <Label className="text-sm">Виберіть столик</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto">
            {availableTables.map((t) => {
              const active = tableId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTableId(t.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    active ? "border-foreground bg-muted" : "hover:bg-muted",
                  )}
                >
                  <div className="font-medium text-sm flex items-center justify-between">
                    <span>{t.name}</span>
                    {active && <Check className="w-4 h-4" style={{ color: accent }} />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    До {t.seats} осіб{t.smoking === false ? " · некурячий" : ""}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-11" onClick={() => setStep("zone")}>
              Назад
            </Button>
            <Button
              className="h-11 text-white"
              onClick={() => setStep("contact")}
              disabled={!tableId}
              style={{ background: accent }}
            >
              Далі <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === "contact" && (
        <div className="space-y-3">
          {/* Сводка */}
          <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-0.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Коли:</span>
              <span className="font-medium">{format(new Date(date), "d MMM", { locale: uk })} · {time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Стіл:</span>
              <span className="font-medium">{chosenTable?.name} · {guests} гост.</span>
            </div>
          </div>

          {/* Occasion */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">Привід візиту</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {OCCASIONS.map((o) => {
                const Icon = o.icon;
                const active = occasion === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setOccasion(o.id)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-[11px] text-center transition-all flex flex-col items-center gap-1",
                      active ? "border-foreground bg-muted" : "hover:bg-muted",
                    )}
                    style={active ? { borderColor: accent } : undefined}
                  >
                    <Icon className="w-4 h-4" style={{ color: active ? accent : undefined }} />
                    <span className="leading-tight">{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diet & allergies */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">
              Дієтичні особливості та алергії
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {DIET_TAGS.map((d) => {
                const active = diets.has(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDiet(d)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
                      active ? "text-white" : "hover:bg-muted",
                    )}
                    style={active ? { background: accent, borderColor: accent } : undefined}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Кухня врахує під час приготування. Для серйозних алергій додатково повідомте офіціанта.
            </p>
          </div>

          <div>
            <Label htmlFor="r-name" className="text-sm flex items-center gap-2 mb-1.5">
              <UserIcon className="w-4 h-4" /> Імʼя
            </Label>
            <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Олена" className="text-base" />
          </div>
          <div>
            <Label htmlFor="r-phone" className="text-sm flex items-center gap-2 mb-1.5">
              <Phone className="w-4 h-4" /> Телефон
            </Label>
            <Input id="r-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380 67 123 45 67" className="text-base" />
          </div>
          <div>
            <Label htmlFor="r-note" className="text-sm flex items-center gap-2 mb-1.5">
              <MessageSquare className="w-4 h-4" /> Побажання (необовʼязково)
            </Label>
            <Textarea
              id="r-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                occasion === "birthday"
                  ? "Святкуємо день народження. Чи можна свічку в десерт?"
                  : occasion === "romantic"
                  ? "Приглушене світло, столик біля вікна"
                  : "Дитячий стілець, місце ближче до виходу..."
              }
              rows={3}
              className="text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="outline" className="h-11" onClick={() => setStep("table")}>
              Назад
            </Button>
            <Button
              className="h-11 text-white"
              onClick={() => setStep("done")}
              disabled={!name.trim() || phone.replace(/\D/g, "").length < 9}
              style={{ background: accent }}
            >
              Забронювати
            </Button>
          </div>
          {zone === "vip" && (
            <p className="text-[11px] text-muted-foreground text-center">
              Для VIP-кабінки діє мінімальне замовлення 3 000 ₴. Адміністратор підтвердить умови.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function Stepper({ step, accent }: { step: Step; accent: string }) {
  const steps: Step[] = ["when", "guests", "zone", "table", "contact"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <div
          key={s}
          className="h-1 flex-1 rounded-full transition-all"
          style={{ background: i <= idx ? accent : "hsl(var(--muted))" }}
        />
      ))}
    </div>
  );
}
