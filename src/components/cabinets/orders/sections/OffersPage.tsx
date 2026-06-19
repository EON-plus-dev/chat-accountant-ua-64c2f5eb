import type { Cabinet } from "@/types/cabinet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  SearchBar,
  SectionTitle,
  CategoryChip,
  RailScroller,
  LinkMore,
  HeroBanner,
  PromoCard,
  BrandLogo,
  StickyTopBar,
} from "../_primitives";
import {
  getRecommendations,
  getPromos,
  getSpecials,
  getAnnouncements,
} from "@/personal/orders/discoveryMock";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import {
  Sparkles,
  SlidersHorizontal,
  Stethoscope,
  UtensilsCrossed,
  Plane,
  ShieldCheck,
  Dumbbell,
  Repeat,
  GraduationCap,
  Briefcase,
  Gift,
  Megaphone,
} from "lucide-react";

const CATEGORIES = [
  { label: "Лікар", icon: Stethoscope },
  { label: "Ресторан", icon: UtensilsCrossed },
  { label: "Подорож", icon: Plane },
  { label: "Страхування", icon: ShieldCheck },
  { label: "Спорт", icon: Dumbbell },
  { label: "Освіта", icon: GraduationCap },
  { label: "Робота", icon: Briefcase },
  { label: "Повторити", icon: Repeat },
];

const PROMO_EMOJI: Record<string, string> = {
  "Стоматологія": "🦷",
  "Страхування": "🛡️",
  "Ремонт техніки": "🔧",
  "Здоров'я": "❤️",
  "Кіно": "🎬",
  "Електроніка": "💻",
  "Пальне": "⛽",
  "Доставка їжі": "🍔",
  "Подорож": "✈️",
  "Книги": "📚",
  "Клінінг": "🧹",
  "Сервіс": "🛠️",
  "Побут": "🚰",
  "Дім": "🏠",
  "Безпека": "🔐",
  "Інструменти": "🪛",
  "Освіта": "🎓",
  "Краса": "💄",
};

export default function OffersPage({ cabinet }: { cabinet: Cabinet }) {
  const recs = getRecommendations(cabinet.id);
  const promos = getPromos(cabinet.id);
  const specials = getSpecials(cabinet.id);
  const announcements = getAnnouncements(cabinet.id);
  const { push } = useDrillStack();
  const openOffer = (id: string, title: string) =>
    push({ kind: "personal-offer", id, sourceLabel: "Пропозиції", displayName: title });

  return (
    <PageShell>
      <StickyTopBar>
        <PageHeader
          title="Пропозиції"
          subtitle="AI-рекомендації, акції й анонси, що підходять саме вам"
        />
        <SearchBar
          placeholder="Що хочете замовити?"
          trailing={
            <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label="Фільтри">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          }
        />
      </StickyTopBar>

      {/* Hero rail */}
      {promos.length > 0 && (
        <RailScroller>
          {promos.slice(0, 4).map((p) => (
            <div key={`h-${p.id}`} className="w-[300px] md:w-[420px] shrink-0 snap-start">
              <HeroBanner
                badge={p.discount}
                eyebrow={p.category}
                title={p.title}
                subtitle={`${p.provider} · ${p.validUntil}`}
                brand={p.provider}
                cta={{ label: "Дізнатись більше" }}
              />
            </div>
          ))}
        </RailScroller>
      )}

      {/* Categories */}
      <section>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c.label} label={c.label} icon={c.icon} />
          ))}
        </div>
      </section>

      {/* AI Recommendations */}
      {recs.length > 0 && (
        <section>
          <SectionTitle
            title="Рекомендовано AI"
            hint="на основі вашого профілю та цілей"
            action={<LinkMore label="Всі" />}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {recs.map((r) => (
              <Card
                key={r.id}
                className="p-4 border-border/70 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => openOffer(r.id, r.title)}
              >
                <div className="flex items-start gap-3">
                  <BrandLogo brand={r.provider} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm leading-tight">{r.title}</div>
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{r.provider}</div>
                    <p className="text-xs text-foreground/80 mt-2">{r.reason}</p>
                    {r.saving && (
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                        {r.saving}
                      </div>
                    )}
                    <Button size="sm" variant="outline" className="h-7 mt-3 text-xs" onClick={(e) => { e.stopPropagation(); openOffer(r.id, r.title); }}>
                      {r.cta}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Promo rail */}
      {promos.length > 0 && (
        <section>
          <SectionTitle title="Акції тижня" action={<LinkMore label="Всі акції" />} />
          <RailScroller>
            {promos.map((p) => (
              <PromoCard
                key={p.id}
                title={p.title}
                brand={p.provider}
                discount={p.discount}
                expiresHint={p.validUntil}
                category={p.category}
                emoji={PROMO_EMOJI[p.category]}
                onClick={() => openOffer(p.id, p.title)}
              />
            ))}
          </RailScroller>
        </section>
      )}

      {/* Specials */}
      {specials.length > 0 && (
        <section>
          <SectionTitle title="Спеціально для вас" action={<LinkMore label="Всі" />} />
          <div className="grid gap-3 sm:grid-cols-2">
            {specials.map((s) => (
              <Card
                key={s.id}
                className="p-3 border-border/70 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => openOffer(s.id, s.title)}
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-tight">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.provider}</div>
                  <p className="text-xs text-foreground/80 mt-1.5">{s.description}</p>
                  <div className="text-xs font-medium mt-1 tabular-nums">{s.benefit}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section>
          <SectionTitle title="Анонси й новини" action={<LinkMore label="Календар" />} />
          <div className="grid gap-2 sm:grid-cols-2">
            {announcements.map((a) => (
              <Card
                key={a.id}
                className="p-3 border-border/70 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => openOffer(a.id, a.title)}
              >
                <BrandLogo brand={a.provider} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-tight truncate">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate inline-flex items-center gap-1">
                    <Megaphone className="w-3 h-3" />
                    {a.provider} · {a.date}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0" onClick={(e) => { e.stopPropagation(); openOffer(a.id, a.title); }}>
                  Деталі
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
