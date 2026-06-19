/**
 * Компактна публічна картка майстра у вiзарді (Шлях B — «Обрати майстра»).
 * Натхнення: Booksy, Fresha, Treatwell — trust-first (рейтинг вище ціни),
 * без юридичних деталей (commissionPct, ЄДРПОУ).
 */
import { Star, ShieldCheck, Sparkles, Info, ChevronRight, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { StaffMember as SalonMaster, BookableService as SalonService } from "@/core";
import type { MasterBadge } from "@/config/demoCabinets/salonData";
import { computeAvailability } from "@/lib/publicBooking/computeAvailability";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  master: SalonMaster;
  cabinetId: string;
  services: SalonService[];
  serviceIds: string[];
  selected?: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
}

const BADGE_META: Record<MasterBadge, { label: string; icon: typeof Star; tone: string }> = {
  top_rated: { label: "Топ-рейтинг", icon: Star, tone: "border-warning/40 bg-warning/10 text-warning-foreground" },
  verified: { label: "Верифіковано", icon: ShieldCheck, tone: "border-success/30 bg-success/10 text-success" },
  new_talent: { label: "Новий талант", icon: Sparkles, tone: "border-primary/30 bg-primary/10 text-primary" },
  kids_friendly: { label: "Дітям", icon: Sparkles, tone: "border-muted bg-muted text-foreground" },
  eco: { label: "Eco", icon: Sparkles, tone: "border-success/30 bg-success/10 text-success" },
  english_speaking: { label: "EN", icon: Globe, tone: "border-muted bg-muted text-foreground" },
};

function formatNearestSlot(dateIso: string, time: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso); target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return `сьогодні ${time}`;
  if (diff === 1) return `завтра ${time}`;
  if (diff < 7) return `${format(target, "EEEE", { locale: uk })} ${time}`;
  return `${format(target, "d MMM", { locale: uk })} ${time}`;
}

export function MasterCard({ master, cabinetId, services, serviceIds, selected, onSelect, onOpenDetails }: Props) {
  const slots = serviceIds.length
    ? computeAvailability({ cabinetId, serviceIds, masterId: master.id }).slice(0, 1)
    : [];
  const nearest = slots[0];

  const eligibleServices = serviceIds
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const priceFrom = eligibleServices.length
    ? Math.min(...eligibleServices.map((s) => s.price))
    : null;

  const topBadge = master.badges?.[0];
  const ringClass = topBadge === "top_rated" ? "ring-2 ring-warning/60" : "";

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card transition-all",
        "hover:border-primary/40 hover:shadow-sm",
        selected && "border-primary ring-2 ring-primary/30",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left p-3 md:p-3.5 flex items-start gap-3"
      >
        {/* Аватар */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white text-sm md:text-base font-semibold",
              ringClass,
            )}
            style={{ background: master.color }}
            aria-hidden
          >
            {master.avatarInitials}
          </div>
          {master.badges?.includes("verified") && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success text-white flex items-center justify-center border-2 border-card">
              <ShieldCheck className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          {/* Top row: name + rating */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-semibold text-sm md:text-[15px] truncate">
                {master.shortName}
              </div>
              {master.publicTitle && (
                <div className="text-xs text-muted-foreground truncate">
                  {master.publicTitle}
                </div>
              )}
            </div>
            {master.rating != null && (
              <div className="flex items-center gap-1 text-xs shrink-0 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <span className="font-semibold">{master.rating.toFixed(1)}</span>
                {master.reviewsCount != null && (
                  <span className="text-muted-foreground">({master.reviewsCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Бейджі + досвід */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {master.experienceYears != null && (
              <span className="text-[11px] text-muted-foreground">
                {master.experienceYears} років досвіду
              </span>
            )}
            {master.badges?.slice(0, 2).map((b) => {
              const meta = BADGE_META[b];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <span
                  key={b}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    meta.tone,
                  )}
                >
                  <Icon className="w-2.5 h-2.5" />
                  {meta.label}
                </span>
              );
            })}
            {master.type === "fop" && (
              <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal text-muted-foreground">
                ФОП-партнер
              </Badge>
            )}
          </div>

          {/* Footer: nearest slot + price from */}
          {(nearest || priceFrom != null) && (
            <div className="mt-2 pt-2 border-t flex items-center justify-between gap-2 text-xs">
              {nearest ? (
                <span className="text-success font-medium truncate">
                  ⏱ Найближче: {formatNearestSlot(nearest.date, nearest.startTime)}
                </span>
              ) : (
                <span className="text-muted-foreground">Немає вільних слотів</span>
              )}
              {priceFrom != null && (
                <span className="text-muted-foreground tabular-nums shrink-0">
                  від {formatCurrency(priceFrom)}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 hidden md:block" />
      </button>

      {/* Info-кнопка */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}
        className="absolute top-1.5 right-1.5 md:top-2 md:right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
        aria-label={`Детальніше про ${master.shortName}`}
      >
        <Info className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
