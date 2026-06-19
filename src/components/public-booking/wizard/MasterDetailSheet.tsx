/**
 * Повний публічний профіль майстра у Sheet.
 * Bottom sheet на mobile / right panel на md+. Без юридичних деталей.
 */
import { useMemo } from "react";
import {
  Star, ShieldCheck, Sparkles, Globe, AtSign, Clock, Award,
  ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { StaffMember as SalonMaster, BookableService as SalonService } from "@/core";
import type { MasterBadge } from "@/config/demoCabinets/salonData";
import { formatCurrency } from "@/lib/formatters";
import { generateDemoReviews } from "@/lib/salonMasterReviews";

interface Props {
  master: SalonMaster | null;
  services: SalonService[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: () => void;
  selectLabel?: string;
}

const BADGE_META: Record<MasterBadge, { label: string; icon: typeof Star; tone: string }> = {
  top_rated: { label: "Топ-рейтинг", icon: Star, tone: "border-warning/40 bg-warning/10 text-warning-foreground" },
  verified: { label: "Верифіковано", icon: ShieldCheck, tone: "border-success/30 bg-success/10 text-success" },
  new_talent: { label: "Новий талант", icon: Sparkles, tone: "border-primary/30 bg-primary/10 text-primary" },
  kids_friendly: { label: "Працює з дітьми", icon: Sparkles, tone: "border-muted bg-muted text-foreground" },
  eco: { label: "Eco-матеріали", icon: Sparkles, tone: "border-success/30 bg-success/10 text-success" },
  english_speaking: { label: "English-speaking", icon: Globe, tone: "border-muted bg-muted text-foreground" },
};

const LANG_LABEL: Record<string, string> = {
  uk: "Українська",
  en: "English",
  pl: "Polski",
  ru: "Русский",
};

const DAY_LETTER = ["Н", "П", "В", "С", "Ч", "П", "С"]; // нд..сб

export function MasterDetailSheet({ master, services, open, onOpenChange, onSelect, selectLabel }: Props) {
  const reviews = useMemo(() => (master ? generateDemoReviews(master.id) : []), [master]);

  const signatureServices = useMemo(() => {
    if (!master?.signatureServiceIds) return [];
    return master.signatureServiceIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => !!s);
  }, [master, services]);

  if (!master) return null;
  const workDays = new Set(master.schedule.workDays);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="p-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 pb-24">
            {/* HERO */}
            <div className="flex items-start gap-3 md:gap-4">
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
                <h2 className="text-lg md:text-xl font-semibold leading-tight">{master.shortName}</h2>
                {master.publicTitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">{master.publicTitle}</p>
                )}
                {master.rating != null && (
                  <div className="mt-1.5 flex items-center gap-1 text-sm tabular-nums">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-semibold">{master.rating.toFixed(1)}</span>
                    {master.reviewsCount != null && (
                      <span className="text-muted-foreground">· {master.reviewsCount} відгуків</span>
                    )}
                  </div>
                )}
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
                  {master.type === "fop" && (
                    <Badge variant="outline" className="h-5 px-2 text-[11px] font-normal text-muted-foreground">
                      ФОП-партнер
                    </Badge>
                  )}
                </div>
                {master.instagramHandle && (
                  <a
                    href={`https://instagram.com/${master.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <AtSign className="w-3.5 h-3.5" />
                    @{master.instagramHandle}
                  </a>
                )}
              </div>
            </div>

            {/* STATS STRIP */}
            <div className="mt-4 grid grid-cols-3 gap-2">
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
                  value={master.languages.map((l) => (l.length === 2 ? l.toUpperCase() : l)).join(" · ")}
                />
              ) : null}
            </div>

            {/* BIO */}
            {master.bio && (
              <p className="mt-4 text-sm leading-relaxed text-foreground">{master.bio}</p>
            )}

            {/* SIGNATURE SERVICES */}
            {signatureServices.length > 0 && (
              <Section title="Фірмові послуги">
                <div className="space-y-1.5">
                  {signatureServices.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-2 rounded-lg border bg-card/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.durationMin} хв
                        </div>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0">
                        {formatCurrency(s.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* PORTFOLIO */}
            {master.portfolioImages && master.portfolioImages.length > 0 && (
              <Section title="Портфоліо">
                <ScrollArea>
                  <div className="flex gap-2 pb-2">
                    {master.portfolioImages.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Робота ${master.shortName} #${i + 1}`}
                        loading="lazy"
                        className="h-40 w-32 object-cover rounded-lg border shrink-0 snap-start"
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Section>
            )}

            {/* WEEK SCHEDULE */}
            <Section title="Графік на тиждень">
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
              <p className="mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 inline-block mr-1" />
                Зазвичай {String(master.schedule.startHour).padStart(2, "0")}:00–
                {String(master.schedule.endHour).padStart(2, "0")}:00
              </p>
            </Section>

            {/* REVIEWS */}
            <Section title="Відгуки клієнтів" sub={master.reviewsCount ? `${master.reviewsCount} всього` : undefined}>
              <div className="space-y-2.5">
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
            </Section>
          </div>
        </ScrollArea>

        {/* STICKY CTA */}
        {onSelect && (
          <div className="border-t bg-background p-3 md:p-4 shrink-0">
            <Button onClick={onSelect} className="w-full h-11" size="lg">
              {selectLabel || `Обрати ${master.shortName}`}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card/50 px-2 py-2 text-center">
      <Icon className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
      <div className="text-sm font-semibold mt-0.5 tabular-nums truncate">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
      {children}
    </section>
  );
}
