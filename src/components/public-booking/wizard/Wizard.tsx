/**
 * Алгоритмічний wizard з 3 кроків: Послуга → Майстер+Час → Контакти.
 * На 2-му кроці клієнт обирає пріоритет: «Будь-який майстер» (спершу час)
 * або «Обрати майстра» (спершу майстер → потім час лише для нього).
 */

import { useEffect, useMemo, useState } from "react";
import { Search, Check, ChevronRight, ArrowLeft, Sparkles, User, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { uk } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import type { Cabinet } from "@/types/cabinet";
import type { PublicBookingDraft, PublicBookingRecord } from "@/lib/publicBooking/types";
import { computeAvailability, groupSlotsByDate } from "@/lib/publicBooking/computeAvailability";
import { confirmPublicBooking, lookupClientByPhone } from "@/lib/publicBooking/store";
import { getBookableContext } from "@/core";
import { LivePreviewCard } from "../LivePreviewCard";
import { ConfirmationView } from "../ConfirmationView";
import { MasterCard } from "./MasterCard";
import { MasterDetailSheet } from "./MasterDetailSheet";
import { RegisterCabinetPitch } from "@/components/client-registration/RegisterCabinetPitch";
import { MobileScrollHint } from "@/components/ui/mobile-scroll-hint";

interface Props {
  cabinet: Cabinet;
  brandName?: string;
  initialDraft?: PublicBookingDraft;
  onConfirmed?: (b: PublicBookingRecord) => void;
}

type Step = 1 | 2 | 3;
type PickFirst = "any" | "master";
type TOD = "any" | "morning" | "day" | "evening";

export function Wizard({ cabinet, brandName, initialDraft, onConfirmed }: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<PublicBookingDraft>(initialDraft ?? { serviceIds: [] });
  const [confirmed, setConfirmed] = useState<PublicBookingRecord | null>(null);
  const [search, setSearch] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TOD>("any");
  const [pickFirst, setPickFirst] = useState<PickFirst>("any");
  const [detailMasterId, setDetailMasterId] = useState<string | null>(null);
  const [matchedClient, setMatchedClient] = useState<{ id: string; fullName: string; totalVisits?: number } | null>(null);
  // TODO: preselect "master" + draft.masterId from lookupClientByPhone(preferredMasterId) on next iteration.

  const slots = useMemo(() => {
    if (draft.serviceIds.length === 0) return [];
    return computeAvailability({
      cabinetId: cabinet.id,
      serviceIds: draft.serviceIds,
      masterId: pickFirst === "master" ? draft.masterId : undefined,
    });
  }, [cabinet.id, draft.serviceIds, draft.masterId, pickFirst]);

  const slotsByDate = useMemo(() => groupSlotsByDate(slots), [slots]);

  // Returning client recognition
  useEffect(() => {
    if (!draft.clientPhone || draft.clientPhone.replace(/\D/g, "").length < 10) {
      setMatchedClient(null);
      return;
    }
    const c = lookupClientByPhone(cabinet.id, draft.clientPhone);
    if (c) {
      setMatchedClient({ id: c.id ?? draft.clientPhone, fullName: c.fullName, totalVisits: c.totalVisits });
      if (!draft.clientName) {
        setDraft((d) => ({ ...d, clientName: c.fullName }));
        toast({
          title: `Вітаємо знову, ${c.fullName.split(" ")[1] || c.fullName}!`,
          description: c.isVip ? "VIP-клієнт" : `Ваш ${c.totalVisits}-й запис`,
        });
      }
    } else {
      setMatchedClient(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.clientPhone]);

  const ctx = useMemo(() => getBookableContext(cabinet.id), [cabinet.id]);
  const { services: allServices, masters: allMasters } = ctx;

  if (confirmed) {
    return <ConfirmationView cabinet={cabinet} brandName={brandName} booking={confirmed} />;
  }


  const services = allServices.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const eligibleMasters = allMasters.filter((m) => {
    const cats = new Set(
      draft.serviceIds.map((id) => allServices.find((s) => s.id === id)?.category).filter(Boolean),
    );
    return [...cats].every((c) => m.specialties.includes(c as never));
  });

  const switchPickFirst = (next: PickFirst) => {
    if (next === pickFirst) return;
    setPickFirst(next);
    // Скидаємо вибір майстра/слоту, якщо він стає невалідним.
    if (next === "any") {
      setDraft((d) => ({ ...d, masterId: undefined }));
    } else {
      // Переходимо на «майстра спершу» — скидаємо час, бо буде перерахунок для конкретного майстра.
      setDraft((d) => ({ ...d, date: undefined, startTime: undefined }));
    }
  };

  const handleConfirm = () => {
    if (!gdpr) {
      toast({ title: "Потрібна згода на обробку даних", variant: "destructive" });
      return;
    }
    const res = confirmPublicBooking(cabinet.id, draft, "wizard");
    if (!res.ok || !res.booking) {
      toast({
        title: "Не вдалося зарезервувати слот",
        description: res.error === "slot_taken" ? "Слот щойно зайняли. Оберіть інший." : "Спробуйте ще раз.",
        variant: "destructive",
      });
      return;
    }
    setConfirmed(res.booking);
    onConfirmed?.(res.booking);
  };

  const stepLabels = ["Послуга", "Майстер і час", "Контакти"];

  const masterChip =
    draft.masterId && pickFirst === "master"
      ? allMasters.find((m) => m.id === draft.masterId)
      : null;

  const canGoToContacts =
    draft.serviceIds.length > 0 && !!draft.date && !!draft.startTime;

  return (
    <div className="p-3 md:p-6">
      {/* Stepper */}
      <ol className="flex items-center gap-1.5 mb-3 md:mb-4" aria-label="Прогрес запису">
        {([1, 2, 3] as Step[]).map((n) => (
          <li key={n} className="flex-1">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                n <= step ? "bg-primary" : "bg-muted",
              )}
              aria-current={n === step ? "step" : undefined}
            />
            <div className="text-[11px] mt-1 text-center text-muted-foreground">
              {stepLabels[n - 1]}
            </div>
          </li>
        ))}
      </ol>

      <div className="md:static sticky top-0 z-10 -mx-3 md:mx-0 px-3 md:px-0 pt-2 md:pt-0 pb-1 md:pb-0 bg-background/95 md:bg-transparent backdrop-blur md:backdrop-blur-0">
        <LivePreviewCard draft={draft} className="mb-3" onOpenMasterDetails={setDetailMasterId} />
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <section aria-label="Крок 1: послуга" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук послуги (стрижка, манікюр…)"
              className="pl-8"
            />
          </div>
          <ScrollArea className="md:max-h-[340px] md:pr-2">
            <div className="space-y-1.5">
              {services.map((s) => {
                const checked = draft.serviceIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        serviceIds: checked
                          ? d.serviceIds.filter((x) => x !== s.id)
                          : [...d.serviceIds, s.id],
                      }))
                    }
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors min-h-[56px]",
                      checked ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center shrink-0",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.durationMin} хв</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums shrink-0">
                      {formatCurrency(s.price)}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          <div className="sticky bottom-0 -mx-3 md:mx-0 px-3 md:px-0 pt-2 pb-2 md:pb-0 mt-2 bg-card/95 md:bg-transparent backdrop-blur md:backdrop-blur-0 border-t md:border-t-0 flex justify-end z-10"
               style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
            <Button
              onClick={() => setStep(2)}
              disabled={draft.serviceIds.length === 0}
              className="w-full md:w-auto md:min-w-[140px] h-11 md:h-10"
            >
              Далі <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>
      )}


      {/* Step 2: Master + Time */}
      {step === 2 && (
        <section aria-label="Крок 2: майстер і час" className="space-y-3">
          {/* Pick-first segmented control */}
          <div
            role="tablist"
            aria-label="Що спершу обрати"
            className="grid grid-cols-2 gap-1 p-1 rounded-lg border bg-muted/40"
          >
            <button
              role="tab"
              aria-selected={pickFirst === "any"}
              type="button"
              onClick={() => switchPickFirst("any")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all min-h-[40px]",
                pickFirst === "any"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Будь-хто</span>
              <span className="hidden sm:inline">Будь-який майстер</span>
            </button>
            <button
              role="tab"
              aria-selected={pickFirst === "master"}
              type="button"
              onClick={() => switchPickFirst("master")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all min-h-[40px]",
                pickFirst === "master"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">Майстер</span>
              <span className="hidden sm:inline">Обрати майстра</span>
            </button>
          </div>

          {/* Шлях B: master picker first */}
          {pickFirst === "master" && !draft.masterId && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground px-0.5">
                Оберіть майстра — далі покажемо лише його вільний час.
              </div>
              {eligibleMasters.length === 0 ? (
                <div className="rounded-lg border p-4 text-center text-xs text-muted-foreground">
                  Немає майстрів для цих послуг.
                </div>
              ) : (
                eligibleMasters.map((m) => (
                  <MasterCard
                    key={m.id}
                    master={m}
                    cabinetId={cabinet.id}
                    services={allServices}
                    serviceIds={draft.serviceIds}
                    onSelect={() => setDraft((d) => ({ ...d, masterId: m.id }))}
                    onOpenDetails={() => setDetailMasterId(m.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Time picker (Шлях A завжди; Шлях B — після вибору майстра) */}
          {(pickFirst === "any" || (pickFirst === "master" && draft.masterId)) && (
            <TimePicker
              cabinetId={cabinet.id}
              slotsByDate={slotsByDate}
              activeDate={draft.date}
              activeTime={draft.startTime}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              timeOfDay={timeOfDay}
              setTimeOfDay={setTimeOfDay}
              onPick={(date, time) =>
                setDraft((d) => ({ ...d, date, startTime: time }))
              }
              header={
                masterChip ? (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-xs">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                      style={{ background: masterChip.color }}
                    >
                      {masterChip.avatarInitials}
                    </div>
                    <span className="font-medium truncate">{masterChip.shortName}</span>
                    <button
                      type="button"
                      onClick={() => setDetailMasterId(masterChip.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Профіль майстра"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          masterId: undefined,
                          date: undefined,
                          startTime: undefined,
                        }))
                      }
                      className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" /> Інший
                    </button>
                  </div>
                ) : null
              }
            />
          )}

          <div
            className="sticky bottom-0 -mx-3 md:mx-0 px-3 md:px-0 pt-2 pb-2 md:pb-0 mt-2 bg-card/95 md:bg-transparent backdrop-blur md:backdrop-blur-0 border-t md:border-t-0 flex items-center gap-2 z-10"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            <Button variant="ghost" size="icon" className="h-11 w-11 md:h-10 md:w-auto md:px-3 shrink-0" onClick={() => setStep(1)} aria-label="Назад">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Назад</span>
            </Button>
            <Button className="flex-1 md:flex-initial h-11 md:h-10" onClick={() => setStep(3)} disabled={!canGoToContacts}>
              Далі: контакти <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <section aria-label="Крок 3: контакти" className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+380 67 123 45 67"
              value={draft.clientPhone ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, clientPhone: e.target.value }))}
              className="h-11 text-base md:h-10 md:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Імʼя *</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Як до вас звертатися"
              value={draft.clientName ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, clientName: e.target.value }))}
              className="h-11 text-base md:h-10 md:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Побажання (опц.)</Label>
            <Input
              id="note"
              placeholder="Наприклад: коротко зрізати"
              value={draft.note ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
              className="h-11 text-base md:h-10 md:text-sm"
            />
          </div>
          {matchedClient && (
            <RegisterCabinetPitch
              clientId={matchedClient.id}
              fopCabinetId={cabinet.id}
              fopIndustry={(cabinet as { industry?: string }).industry}
              brandName={brandName}
              source="returning-client"
              variant="inline-step"
              className="mt-2"
            />
          )}
          <label className="flex items-start gap-2 text-xs cursor-pointer pt-2">
            <Checkbox checked={gdpr} onCheckedChange={(v) => setGdpr(v === true)} />
            <span>
              Погоджуюся з{" "}
              <a href="/privacy" target="_blank" className="underline">
                політикою обробки персональних даних
              </a>
              .
            </span>
          </label>
          <div
            className="sticky bottom-0 -mx-3 md:mx-0 px-3 md:px-0 pt-2 pb-2 md:pb-0 mt-2 bg-card/95 md:bg-transparent backdrop-blur md:backdrop-blur-0 border-t md:border-t-0 flex items-center gap-2 z-10"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            <Button variant="ghost" size="icon" className="h-11 w-11 md:h-10 md:w-auto md:px-3 shrink-0" onClick={() => setStep(2)} aria-label="Назад">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline ml-1">Назад</span>
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!draft.clientName || !draft.clientPhone || !gdpr}
              className="flex-1 md:flex-initial h-11 md:h-10"
            >
              Підтвердити запис
            </Button>
          </div>
        </section>
      )}

      <MasterDetailSheet
        master={detailMasterId ? allMasters.find((m) => m.id === detailMasterId) ?? null : null}
        services={allServices}
        open={!!detailMasterId}
        onOpenChange={(o) => { if (!o) setDetailMasterId(null); }}
        onSelect={() => {
          if (detailMasterId) {
            setDraft((d) => ({ ...d, masterId: detailMasterId }));
            if (pickFirst !== "master") setPickFirst("master");
            setDetailMasterId(null);
          }
        }}
      />
    </div>
  );
}

/* ---------- TimePicker subcomponent ---------- */

interface TimePickerProps {
  cabinetId: string;
  slotsByDate: Record<string, { startTime: string }[]>;
  activeDate?: string;
  activeTime?: string;
  selectedDay: string | null;
  setSelectedDay: (d: string) => void;
  timeOfDay: TOD;
  setTimeOfDay: (t: TOD) => void;
  onPick: (date: string, time: string) => void;
  header?: React.ReactNode;
}

function TimePicker({
  slotsByDate,
  activeDate,
  activeTime,
  selectedDay,
  setSelectedDay,
  timeOfDay,
  setTimeOfDay,
  onPick,
  header,
}: TimePickerProps) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i);
    const date = format(d, "yyyy-MM-dd");
    return { date, d, count: (slotsByDate[date] || []).length };
  }).filter((x) => x.count > 0);

  const activeDay =
    selectedDay && days.some((x) => x.date === selectedDay)
      ? selectedDay
      : days[0]?.date ?? null;

  const todFilter = (t: string) => {
    if (timeOfDay === "any") return true;
    const h = parseInt(t.slice(0, 2), 10);
    if (timeOfDay === "morning") return h >= 9 && h < 12;
    if (timeOfDay === "day") return h >= 12 && h < 17;
    return h >= 17 && h < 22;
  };

  const dayTimes = activeDay
    ? Array.from(new Set((slotsByDate[activeDay] || []).map((s) => s.startTime)))
        .sort()
        .filter(todFilter)
    : [];

  const dayLabel = (d: Date, i: number) => {
    if (i === 0) return "Сьогодні";
    if (i === 1) return "Завтра";
    return format(d, "EEEEEE", { locale: uk });
  };

  if (days.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        Найближчим часом немає вільних слотів. Спробуйте іншого майстра або послугу.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {header}
      {/* Day picker */}
      <div className="relative">
        <MobileScrollHint label="свайп" />
        <div
          role="tablist"
          aria-label="Оберіть день"
          className="-mx-3 md:mx-0 px-3 md:px-0 overflow-x-auto snap-x snap-mandatory flex gap-1.5 pb-1 scrollbar-thin"
        >
          {days.map((x) => {
            const i = Math.round((x.d.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
            const active = x.date === activeDay;
            return (
              <button
                key={x.date}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setSelectedDay(x.date)}
                className={cn(
                  "snap-start shrink-0 flex flex-col items-center justify-center rounded-lg border px-2.5 py-2 min-w-[62px] min-h-[60px] transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <span className="text-[10px] uppercase tracking-wide opacity-80">
                  {dayLabel(x.d, i)}
                </span>
                <span className="text-base font-semibold leading-tight tabular-nums">
                  {format(x.d, "d")}
                </span>
                <span className="text-[9px] opacity-70 leading-tight">
                  {x.count} слот{x.count === 1 ? "" : x.count < 5 ? "и" : "ів"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time-of-day filter */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "any" as TOD, label: "Будь-коли" },
          { id: "morning" as TOD, label: "Ранок" },
          { id: "day" as TOD, label: "День" },
          { id: "evening" as TOD, label: "Вечір" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setTimeOfDay(f.id)}
            className={cn(
              "text-[11px] h-7 px-2.5 rounded-full border transition-colors",
              timeOfDay === f.id
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "hover:bg-muted text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {activeDay && (
        <div className="text-[11px] text-muted-foreground">
          {format(new Date(activeDay), "EEEE, d MMMM", { locale: uk })}
        </div>
      )}

      {/* Slot grid */}
      {dayTimes.length === 0 ? (
        <div className="rounded-lg border p-4 text-center text-xs text-muted-foreground">
          Немає слотів у цьому інтервалі. Спробуйте інший час доби.
        </div>
      ) : (
        <div className="md:max-h-[280px] md:overflow-y-auto md:pr-1">
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-1.5">
            {dayTimes.map((time) => {
              const active = activeDate === activeDay && activeTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onPick(activeDay!, time)}
                  className={cn(
                    "h-11 md:h-10 rounded-md border text-sm md:text-[13px] font-medium tabular-nums transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
