/**
 * MasterProfilePage — професійний in-system профіль майстра салону.
 *
 * Канонічна сторінка профілю, що відкривається з усіх поверхонь:
 *   • Бронювання → Майстри (картка)
 *   • Налаштування → Майстри (кнопка «Профіль»)
 *   • Налаштування → Делегації майстрів (клік на ім'я)
 *   • Власний кабінет майстра → Щоденник (кнопка «Мій профіль»)
 *
 * Рендериться у drill-sheet через `SalonMasterDrillView`.
 * Дані: `salonMasters`, `salonMasterDelegations`, `useMergedSalonBookings`,
 *       `salonServices`, `salonWorkstations`, `salonClients`.
 */

import { useMemo } from "react";
import {
  Star,
  ShieldCheck,
  Sparkles,
  Globe,
  AtSign,
  Clock,
  Award,
  Briefcase,
  Users,
  MapPin,
  FileSignature,
  CalendarClock,
  CalendarDays,
  Plus,
  ExternalLink,
  Scissors,
  ArrowRight,
} from "lucide-react";
import { requestMasterAction } from "@/components/cabinets/bookings/masterActionBus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import {
  salonMasters,
  salonServices,
  salonWorkstations,
  salonClients,
  salonBookings,
  type SalonMaster,
  type MasterBadge,
} from "@/config/demoCabinets/salonData";
import {
  getActiveDelegationByMasterId,
  getInvitationsForSalon,
  type SalonMasterDelegationContract,
} from "@/config/demoCabinets/salonMasterDelegations";
import { useMergedSalonBookings } from "../bookings/useMergedSalonBookings";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { generateDemoReviews } from "@/lib/salonMasterReviews";

export type MasterProfileMode = "salon-admin" | "master-self" | "settings-preview";

interface Props {
  masterId: string;
  /** Контекст cabinet, з якого читаємо бронювання (для salon-admin режиму). */
  cabinetId?: string;
  mode?: MasterProfileMode;
  /** Опц. ескейп-CTA «Редагувати в Налаштуваннях» (тільки salon-admin). */
  onEditInSettings?: (masterId: string) => void;
}

const BADGE_META: Record<MasterBadge, { label: string; icon: typeof Star; tone: string }> = {
  top_rated: { label: "Топ-рейтинг", icon: Star, tone: "border-warning/40 bg-warning/10 text-warning-foreground" },
  verified: { label: "Верифіковано", icon: ShieldCheck, tone: "border-success/30 bg-success/10 text-success" },
  new_talent: { label: "Новий талант", icon: Sparkles, tone: "border-primary/30 bg-primary/10 text-primary" },
  kids_friendly: { label: "Працює з дітьми", icon: Sparkles, tone: "border-muted bg-muted text-foreground" },
  eco: { label: "Eco-матеріали", icon: Sparkles, tone: "border-success/30 bg-success/10 text-success" },
  english_speaking: { label: "English-speaking", icon: Globe, tone: "border-muted bg-muted text-foreground" },
};

const CAT_LABEL: Record<string, string> = {
  hair: "перукарські",
  nails: "манікюр/педикюр",
  massage: "масаж",
  spa: "SPA",
  brows: "брови",
};

const DAY_LETTER = ["Н", "П", "В", "С", "Ч", "П", "С"]; // нд..сб

function getDelegationTerms(d: SalonMasterDelegationContract | undefined) {
  if (!d) return { kindLabel: "—", detail: "Делегація відсутня" };
  if (d.contract_kind === "employment") {
    const t = d.terms as Extract<typeof d.terms, { kind: "employment" }>;
    return { kindLabel: "Трудовий договір", detail: `${t.position} · ${formatCurrency(t.salary_uah)}/міс` };
  }
  if (d.terms.kind === "revenue_split") {
    return { kindLabel: "Договір послуг · revenue split", detail: `Комісія майстру ${d.terms.commission_pct}% (виплати ${d.terms.payout_period === "weekly" ? "щотижня" : d.terms.payout_period === "monthly" ? "щомісяця" : "за візит"})` };
  }
  if (d.terms.kind === "workspace_rental") {
    return { kindLabel: "Договір оренди робочого місця", detail: `${formatCurrency(d.terms.rent_amount)} / ${d.terms.rent_period === "month" ? "міс" : d.terms.rent_period === "day" ? "день" : "зміна"}` };
  }
  if (d.terms.kind === "hybrid") {
    return { kindLabel: "Гібридний договір", detail: `${d.terms.commission_pct}% + оренда ${formatCurrency(d.terms.rent_amount)}` };
  }
  return { kindLabel: "—", detail: "" };
}

export function MasterProfilePage({
  masterId,
  cabinetId,
  mode = "salon-admin",
  onEditInSettings,
}: Props) {
  const master = useMemo(() => salonMasters.find((m) => m.id === masterId) ?? null, [masterId]);
  const delegation = useMemo(() => getActiveDelegationByMasterId(masterId), [masterId]);

  // Бронювання — беремо merged, якщо є cabinetId, інакше seed-only.
  const allBookings = useMergedSalonBookings(cabinetId ?? "");
  const bookings = useMemo(() => {
    const base = cabinetId ? allBookings : salonBookings;
    return base.filter((b) => b.masterId === masterId);
  }, [allBookings, cabinetId, masterId]);

  const drill = useDrillStack();

  const reviews = useMemo(() => generateDemoReviews(masterId), [masterId]);

  const signatureServices = useMemo(() => {
    if (!master?.signatureServiceIds) return [];
    return master.signatureServiceIds
      .map((id) => salonServices.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => !!s);
  }, [master]);

  const eligibleServices = useMemo(() => {
    if (!master) return [];
    return salonServices.filter((s) => master.specialties.includes(s.category));
  }, [master]);

  const stats = useMemo(() => {
    if (!master) return null;
    const today = new Date().toISOString().split("T")[0];
    const dShift = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString().split("T")[0];
    };
    const last7 = dShift(7);
    const last30 = dShift(30);
    const done7 = bookings.filter((b) => b.status === "done" && b.date >= last7);
    const done30 = bookings.filter((b) => b.status === "done" && b.date >= last30);
    const revenue7 = done7.reduce((s, b) => s + b.totalPrice, 0);
    const earning7 = done7.reduce((s, b) => s + b.commissionAmount, 0);
    const avg7 = done7.length > 0 ? Math.round(revenue7 / done7.length) : 0;
    const upcoming = bookings
      .filter((b) => b.date >= today && (b.status === "scheduled" || b.status === "confirmed"))
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

    const availableMinPerWeek =
      master.schedule.workDays.length * (master.schedule.endHour - master.schedule.startHour) * 60;
    const minutesBooked7 = done7.reduce((s, b) => s + b.durationMin, 0);
    const utilization = availableMinPerWeek > 0 ? Math.round((minutesBooked7 / availableMinPerWeek) * 100) : 0;

    return {
      done7Count: done7.length,
      revenue7,
      earning7,
      avg7,
      upcoming,
      utilization,
      done30Count: done30.length,
    };
  }, [bookings, master]);

  if (!master) {
    return (
      <div className="p-4 md:p-6 text-sm text-muted-foreground">
        Майстра з id <code>{masterId}</code> не знайдено.
      </div>
    );
  }

  const isStaff = master.type === "staff";
  const isInvited = !delegation && cabinetId
    ? getInvitationsForSalon(cabinetId).some((i) => i.masterId === masterId)
    : false;
  const workDays = new Set(master.schedule.workDays);
  const { kindLabel: contractKind, detail: contractDetail } = getDelegationTerms(delegation);

  const showDelegation = mode !== "master-self";
  const showPayouts = mode === "salon-admin";
  const showPublicSection = mode !== "settings-preview";
  const showServicesFull = mode !== "settings-preview";
  const showUpcoming = mode !== "settings-preview";
  const showReviews = mode !== "settings-preview";

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6 space-y-5">
      {/* HERO */}
      <section className="flex items-start gap-3 md:gap-4">
        <div
          className={cn(
            "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white text-lg md:text-2xl font-semibold shrink-0",
            master.badges?.includes("top_rated") && "ring-2 ring-warning/60 ring-offset-2 ring-offset-background",
          )}
          style={{ background: master.color }}
          aria-hidden
        >
          {master.avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-semibold leading-tight truncate">{master.fullName}</h2>
              {master.publicTitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{master.publicTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isStaff ? (
                <Badge variant="outline" className="gap-1 text-[11px]">
                  <Users className="w-3 h-3" /> Штатний
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 text-[11px]">
                  <Briefcase className="w-3 h-3" /> ФОП-партнер
                </Badge>
              )}
              {isInvited && (
                <Badge variant="outline" className="text-[11px] border-warning/40 bg-warning/10 text-warning-foreground">
                  Запрошення не прийнято
                </Badge>
              )}
              {mode === "salon-admin" && cabinetId && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5"
                    onClick={() => {
                      requestMasterAction({ kind: "calendar", masterId: master.id, cabinetId });
                      drill.popAll();
                    }}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Переглянути в календарі
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 gap-1.5"
                    onClick={() => {
                      requestMasterAction({ kind: "create", masterId: master.id, cabinetId });
                      drill.popAll();
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Створити запис
                  </Button>
                </>
              )}
              {mode === "salon-admin" && onEditInSettings && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5"
                  onClick={() => onEditInSettings(master.id)}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Редагувати в Налаштуваннях
                </Button>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {master.rating != null && (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-semibold">{master.rating.toFixed(1)}</span>
                {master.reviewsCount != null && (
                  <span className="text-muted-foreground">· {master.reviewsCount} відгуків</span>
                )}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {master.specialties.map((s) => CAT_LABEL[s]).join(" · ")}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {master.badges?.map((b) => {
              const meta = BADGE_META[b];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span
                  key={b}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    meta.tone,
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </span>
              );
            })}
            {master.instagramHandle && (
              <a
                href={`https://instagram.com/${master.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <AtSign className="w-3 h-3" />
                @{master.instagramHandle}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* DELEGATION STRIP */}
      {showDelegation && (
        <section className="rounded-lg border bg-card p-3 md:p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <FileSignature className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{contractKind}</div>
                <div className="text-xs text-muted-foreground truncate">{contractDetail}</div>
              </div>
            </div>
            {delegation && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">№ {delegation.contract_number}</Badge>
                <span>з {new Date(delegation.valid_from).toLocaleDateString("uk-UA")}</span>
                {delegation.signed_at && (
                  <Badge variant="outline" className="text-[10px] border-success/40 bg-success/10 text-success gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" /> Підписано
                  </Badge>
                )}
              </div>
            )}
          </div>
          {delegation && (
            <div className="text-[11px] text-muted-foreground">
              AI-операції майстра під час роботи в салоні оплачує:{" "}
              <span className="text-foreground font-medium">
                {delegation.billing_payer === "cabinet_owner" ? "Салон" : "Майстер"}
              </span>
            </div>
          )}
        </section>
      )}

      {/* KPI STRIP */}
      {stats && showUpcoming && (
        <section className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <UniversalKPICard
            title="Записів 7д"
            value={stats.done7Count}
            format="number"
            density="compact"
          />
          <UniversalKPICard
            title="Виторг 7д"
            value={stats.revenue7}
            format="currency"
            density="compact"
          />
          <UniversalKPICard
            title="Сер. чек"
            value={stats.avg7}
            format="currency"
            density="compact"
          />
          <UniversalKPICard
            title="Завантаженість"
            value={`${stats.utilization}%`}
            density="compact"
          />
          <UniversalKPICard
            title="Майбутні"
            value={stats.upcoming.length}
            format="number"
            density="compact"
          />
        </section>
      )}

      {/* SCHEDULE + WORKSTATION */}
      <section className="rounded-lg border bg-card p-3 md:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Графік</h3>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {String(master.schedule.startHour).padStart(2, "0")}:00–
            {String(master.schedule.endHour).padStart(2, "0")}:00
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {DAY_LETTER.map((l, idx) => {
            const works = workDays.has(idx);
            return (
              <div
                key={idx}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 rounded-md py-1.5 text-[11px]",
                  works ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                )}
                title={works ? "Робочий день" : "Вихідний"}
              >
                <span className="font-medium">{l}</span>
                <span className={cn("w-1.5 h-1.5 rounded-full", works ? "bg-success" : "bg-muted-foreground/30")} />
              </div>
            );
          })}
        </div>
        {master.preferredWorkstationIds && master.preferredWorkstationIds.length > 0 && (
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="text-muted-foreground">Постійне робоче місце</div>
              <div className="text-foreground font-medium mt-0.5 flex flex-wrap gap-1.5">
                {master.preferredWorkstationIds.map((wid) => {
                  const w = salonWorkstations.find((x) => x.id === wid);
                  if (!w) return null;
                  return (
                    <button
                      key={wid}
                      type="button"
                      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 hover:bg-muted transition-colors"
                      onClick={() => drill.push({ kind: "workstation", id: wid, displayName: w.name })}
                    >
                      {w.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SERVICES */}
      {showServicesFull && (
        <section className="rounded-lg border bg-card p-3 md:p-4 space-y-3">
          <h3 className="text-sm font-semibold">Послуги майстра</h3>
          {signatureServices.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Фірмові</div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {signatureServices.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => drill.push({ kind: "salon-service", id: s.id, displayName: s.name })}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-card/50 px-3 py-2 text-left hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.durationMin} хв</div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0">
                      {formatCurrency(s.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <Separator />
          <div className="space-y-1.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Усі дозволені ({eligibleServices.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {eligibleServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => drill.push({ kind: "salon-service", id: s.id, displayName: s.name })}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] hover:bg-muted transition-colors"
                >
                  <span>{s.name}</span>
                  <span className="text-muted-foreground tabular-nums">{formatCurrency(s.price)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING BOOKINGS */}
      {showUpcoming && stats && stats.upcoming.length > 0 && (
        <section className="rounded-lg border bg-card p-3 md:p-4 space-y-2">
          <h3 className="text-sm font-semibold">Найближчі записи</h3>
          <ul className="divide-y">
            {stats.upcoming.slice(0, 8).map((b) => {
              const client = salonClients.find((c) => c.id === b.clientId);
              const svc = salonServices.find((s) => s.id === b.serviceIds[0]);
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() =>
                      drill.push({
                        kind: "booking",
                        id: b.id,
                        displayName: `${b.date} ${b.startTime}`,
                      })
                    }
                    className="w-full flex items-center justify-between gap-3 py-2 text-left hover:bg-muted/40 -mx-1 px-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarClock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium tabular-nums truncate">
                          {new Date(b.date + "T00:00:00").toLocaleDateString("uk-UA", {
                            day: "2-digit",
                            month: "short",
                            weekday: "short",
                          })}{" "}
                          · {b.startTime}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {svc?.name ?? "—"} · {client?.fullName ?? "—"}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0">
                      {formatCurrency(b.totalPrice)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* RECENT PAYOUTS (salon-admin only) */}
      {showPayouts && stats && (
        <section className="rounded-lg border bg-card p-3 md:p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Винагороди за останні 30 днів</h3>
            <span className="text-[11px] text-muted-foreground">{stats.done30Count} виконаних</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat
              label="Виторг 7д"
              value={formatCurrency(stats.revenue7)}
            />
            <Stat
              label="Виплата майстру 7д"
              value={formatCurrency(stats.earning7)}
            />
            <Stat
              label="Сер. чек 7д"
              value={formatCurrency(stats.avg7)}
            />
          </div>
        </section>
      )}

      {/* PUBLIC PROFILE PREVIEW */}
      {showPublicSection && (master.bio || master.portfolioImages?.length) && (
        <section className="rounded-lg border bg-card p-3 md:p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Публічний профіль</h3>
            <Badge variant="outline" className="text-[10px] ml-auto">
              видно клієнтам у віджеті запису
            </Badge>
          </div>
          {master.bio && (
            <p className="text-sm leading-relaxed text-foreground">{master.bio}</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {master.experienceYears != null && (
              <Stat icon={Award} label="Досвід" value={`${master.experienceYears} р.`} />
            )}
            {master.completedServices != null && (
              <Stat icon={Sparkles} label="Послуг" value={master.completedServices.toLocaleString("uk")} />
            )}
            {master.languages?.length ? (
              <Stat
                icon={Globe}
                label="Мови"
                value={master.languages
                  .map((l) => (l.length === 2 ? l.toUpperCase() : l))
                  .join(" · ")}
              />
            ) : null}
          </div>
          {master.portfolioImages && master.portfolioImages.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                Портфоліо
              </div>
              <ScrollArea>
                <div className="flex gap-2 pb-2">
                  {master.portfolioImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Робота ${master.shortName} #${i + 1}`}
                      loading="lazy"
                      className="h-32 w-24 object-cover rounded-lg border shrink-0"
                    />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </section>
      )}

      {/* REVIEWS */}
      {showReviews && (
        <section className="rounded-lg border bg-card p-3 md:p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold inline-flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-muted-foreground" />
              Відгуки клієнтів
            </h3>
            {master.reviewsCount != null && (
              <span className="text-[11px] text-muted-foreground">{master.reviewsCount} всього</span>
            )}
          </div>
          <div className="space-y-2">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-lg border bg-card/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        className={cn(
                          "w-3 h-3",
                          k < r.stars ? "fill-warning text-warning" : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {r.daysAgo} {r.daysAgo === 1 ? "день" : r.daysAgo < 5 ? "дні" : "днів"} тому
                </div>
                <p className="text-sm mt-1.5 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Star;
}) {
  return (
    <div className="rounded-lg border bg-card/50 px-2 py-2 text-center">
      {Icon && <Icon className="w-3.5 h-3.5 mx-auto text-muted-foreground" />}
      <div className="text-sm font-semibold mt-0.5 tabular-nums truncate">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}
