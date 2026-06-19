import type { Cabinet } from "@/types/cabinet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  SearchBar,
  SectionTitle,
  CategoryChip,
  LinkMore,
  MediaTile,
  HeroBanner,
  RatingStars,
  PriceTag,
  BrandLogo,
  RailScroller,
  StickyTopBar,
  fmtUah,
} from "../_primitives";
import { getServiceOffers } from "@/personal/orders/discoveryMock";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { stableHash } from "@/personal/orders/offerHelpers";
import {
  Heart,
  Stethoscope,
  Wrench,
  ShieldCheck,
  GraduationCap,
  Landmark,
  Briefcase,
  Sparkles,
  MapPin,
} from "lucide-react";

const CATEGORIES = [
  { label: "Здоров'я", icon: Stethoscope },
  { label: "Дім", icon: Wrench },
  { label: "Страхування", icon: ShieldCheck },
  { label: "Освіта", icon: GraduationCap },
  { label: "Юридичне", icon: Landmark },
  { label: "Фінанси", icon: Briefcase },
];

const CAT_EMOJI: Record<string, string> = {
  "Податки": "🧾",
  "Юридичне": "⚖️",
  "Страхування": "🛡️",
  "Здоров'я": "❤️",
  "Здоровʼя": "❤️",
  "Дім": "🏠",
  "Освіта": "🎓",
  "Клінінг": "🧹",
  "Ремонт": "🔧",
  "Логістика": "🚚",
  "Маркетинг": "📣",
  "Контент": "📷",
};

export default function ServicesPage({ cabinet }: { cabinet: Cabinet }) {
  const services = getServiceOffers(cabinet.id);
  const top = services.slice(0, 4);
  const nearby = services.slice(0, 6);
  const { push } = useDrillStack();
  const openService = (id: string, title: string) =>
    push({ kind: "personal-offer", id, sourceLabel: "Послуги", displayName: title });

  return (
    <PageShell>
      <StickyTopBar>
        <PageHeader
          title="Послуги"
          subtitle="Сервіси перевірених партнерів для вашого життя та бізнесу"
          right={
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Мої послуги</span>
            </Button>
          }
        />
        <SearchBar placeholder="Пошук послуг" />
      </StickyTopBar>

      {/* Hero */}
      <HeroBanner
        eyebrow="AI-ПІДБІР"
        title="Опишіть задачу — отримайте 2–3 пропозиції"
        subtitle="Лікар, юрист, ремонт, страхування. Перевірені провайдери з цінами та контактами."
        cta={{ label: "Запитати AI" }}
        brand="FINTODO AI"
      />

      {/* Categories */}
      <section>
        <SectionTitle title="Категорії послуг" />
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-6 gap-2 md:gap-3">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.label} label={c.label} icon={c.icon} />
          ))}
        </div>
      </section>

      {/* Top services */}
      {top.length > 0 && (
        <section>
          <SectionTitle title="Топ послуги тижня" action={<LinkMore label="Всі" />} />
          <RailScroller>
            {top.map((s) => (
              <Card
                key={s.id}
                className="w-[240px] shrink-0 snap-start p-0 border-border/70 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openService(s.id, s.title)}
              >
                <MediaTile
                  emoji={CAT_EMOJI[s.category] ?? "🛎️"}
                  brand={s.provider}
                  className="w-full h-28 rounded-none border-0"
                />
                <div className="p-3">
                  <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.provider}</div>
                  <div className="flex items-center justify-between mt-2">
                    <RatingStars value={s.rating} />
                    <span className="text-[10px] text-muted-foreground">{s.category}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-semibold tabular-nums">
                      {s.fromUah > 0 ? `від ${fmtUah(s.fromUah)}` : "Безкоштовно"}
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openService(s.id, s.title); }}>Замовити</Button>
                  </div>
                </div>
              </Card>
            ))}
          </RailScroller>
        </section>
      )}

      {/* Recommended cards (grid) */}
      <section>
        <SectionTitle title="Рекомендовано для вас" hint="на основі ваших цілей" action={<LinkMore label="Всі" />} />
        <div className="grid gap-3 sm:grid-cols-2">
          {top.map((s) => (
            <Card
              key={`r-${s.id}`}
              className="p-3 border-border/70 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => openService(s.id, s.title)}
            >
              <MediaTile emoji={CAT_EMOJI[s.category] ?? "🛎️"} brand={s.provider} className="w-16 h-16" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium leading-tight">{s.title}</div>
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.provider}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <RatingStars value={s.rating} />
                  <span className="text-muted-foreground text-[11px]">·</span>
                  <span className="text-[11px] text-muted-foreground">{s.category}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm font-semibold tabular-nums">
                    {s.fromUah > 0 ? `від ${fmtUah(s.fromUah)}` : "Безкоштовно"}
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openService(s.id, s.title); }}>Замовити</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Nearby */}
      {nearby.length > 0 && (
        <section>
          <SectionTitle
            title="Послуги поруч"
            hint="Київ, ваш район"
            action={<LinkMore label="На карті" />}
          />
          <div className="grid gap-2">
            {nearby.map((s) => {
              const distKm = s.distanceKm ?? Number(`1.${(stableHash(s.id) % 9) + 1}`);
              return (
                <Card
                  key={`n-${s.id}`}
                  className="p-3 border-border/70 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => openService(s.id, s.title)}
                >
                  <BrandLogo brand={s.provider} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight truncate">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {s.provider} · {distKm.toFixed(1)} км
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold whitespace-nowrap tabular-nums text-right">
                    {s.fromUah > 0 ? `від ${fmtUah(s.fromUah)}` : "Безкошт."}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}
