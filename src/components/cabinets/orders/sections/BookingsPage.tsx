import { useState } from "react";
import type { Cabinet } from "@/types/cabinet";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  SectionTitle,
  LinkMore,
  MediaTile,
  StatusPill,
  RailScroller,
  RatingStars,
  FavoriteButton,
  CategoryChip,
  BrandLogo,
  StickyTopBar,
  fmtUah,
} from "../_primitives";
import { getBookingOffers } from "@/personal/orders/discoveryMock";
import { getMergedPersonalOrders } from "@/personal/orders/personalOrdersStore";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { useBookingFlowStore } from "@/personal/bookings/bookingFlowStore";

import {
  Heart,
  MapPin,
  Clock3,
  CalendarDays,
  Search,
  Hotel,
  UtensilsCrossed,
  Stethoscope,
  Dumbbell,
  Plane,
  Car,
  Scissors,
} from "lucide-react";

const CATEGORIES = [
  { label: "Готелі", icon: Hotel },
  { label: "Ресторани", icon: UtensilsCrossed },
  { label: "Лікарі", icon: Stethoscope },
  { label: "Спорт", icon: Dumbbell },
  { label: "Подорожі", icon: Plane },
  { label: "Авто", icon: Car },
  { label: "Краса", icon: Scissors },
];

export default function BookingsPage({ cabinet }: { cabinet: Cabinet }) {
  const offers = getBookingOffers(cabinet.id);
  const mine = getMergedPersonalOrders(cabinet.id).filter((o) => o.kind === "booking");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const { push } = useDrillStack();
  const openBookingFlow = useBookingFlowStore((s) => s.openFlow);
  const openOffer = (id: string, title: string) =>
    push({ kind: "personal-offer", id, sourceLabel: "Бронювання", displayName: title });
  const openOrder = (id: string, title: string) =>
    push({ kind: "personal-order", id, sourceLabel: "Бронювання", displayName: title });


  const toggleSaved = (id: string) =>
    setSaved((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <PageShell>
      <StickyTopBar>
        <PageHeader
          title="Бронювання"
          subtitle="Стіл у ресторані, квитки, готель, корт чи лікар — в одному місці"
          right={
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Збережене</span>
              {saved.size > 0 && (
                <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5">{saved.size}</span>
              )}
            </Button>
          }
        />
        <Card className="p-2.5 md:p-3 border-border/70">
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_140px_auto]">
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 h-10 bg-card" placeholder="Куди / що" />
            </div>
            <div className="relative">
              <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 h-10 bg-card" placeholder="Дата" />
            </div>
            <Input className="h-10 bg-card hidden md:block" placeholder="Гості / місця" />
            <Button className="h-10 gap-1.5">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Знайти</span>
            </Button>
          </div>
        </Card>
      </StickyTopBar>

      {/* Categories */}
      <section>
        <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-7 gap-2 md:gap-3">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.label} label={c.label} icon={c.icon} />
          ))}
        </div>
      </section>

      {/* Saved (favorites) */}
      {saved.size > 0 && (
        <section>
          <SectionTitle title="Збережене" action={<LinkMore label="Всі" />} />
          <RailScroller>
            {offers.filter((o) => saved.has(o.id)).map((o) => (
              <Card
                key={`s-${o.id}`}
                className="w-[200px] shrink-0 snap-start p-0 border-border/70 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openOffer(o.id, o.title)}
              >
                <MediaTile emoji="❤️" brand={o.provider} className="w-full h-20 rounded-none border-0" />
                <div className="p-2.5">
                  <div className="text-xs font-medium leading-tight line-clamp-2 min-h-[2rem]">{o.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 truncate">{o.location}</div>
                </div>
              </Card>
            ))}
          </RailScroller>
        </section>
      )}

      {/* Recommended */}
      {offers.length > 0 && (
        <section>
          <SectionTitle title="Рекомендовано для вас" action={<LinkMore label="Всі" />} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <Card
                key={o.id}
                className="p-0 border-border/70 overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openOffer(o.id, o.title)}
              >
                <div className="relative">
                  <MediaTile emoji="🏷️" brand={o.provider} className="w-full h-32 rounded-none border-0" />
                  <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton active={saved.has(o.id)} onClick={() => toggleSaved(o.id)} />
                  </div>
                  <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/90 text-white font-medium">
                    Безкоштовне скасування
                  </span>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="text-sm font-medium leading-tight">{o.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{o.provider}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                    <RatingStars value={o.rating} />
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" />
                      {o.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/60">
                    <span className="text-xs inline-flex items-center gap-1 text-foreground/80">
                      <Clock3 className="w-3.5 h-3.5" />
                      {o.nextSlot}
                    </span>
                    <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openBookingFlow(o.id, cabinet.id); }}>Забронювати</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* My upcoming */}
      <section>
        <SectionTitle title="Мої майбутні бронювання" action={<LinkMore label="Історія" />} />
        {mine.length === 0 ? (
          <Card className="p-4 border-border/70 text-sm text-muted-foreground text-center">
            Поки немає активних бронювань
          </Card>
        ) : (
          <div className="grid gap-2">
            {mine.map((b) => (
              <Card
                key={b.id}
                className="p-3 border-border/70 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => openOrder(b.id, b.title)}
              >
                <BrandLogo brand={b.vendor} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-tight truncate">{b.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {b.vendor} · {b.date}
                  </div>
                </div>
                <StatusPill
                  label={b.status === "scheduled" ? "Заплановано" : b.status === "active" ? "Активне" : "Завершено"}
                  tone={b.status === "scheduled" ? "active" : b.status === "active" ? "success" : "neutral"}
                />
                {b.amountUah > 0 && (
                  <div className="text-sm font-semibold whitespace-nowrap tabular-nums">{fmtUah(b.amountUah)}</div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
