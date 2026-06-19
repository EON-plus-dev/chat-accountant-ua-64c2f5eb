import { useEffect, useMemo, useState } from "react";
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
  MediaTile,
  HeroBanner,
  PriceTag,
  RatingStars,
  FavoriteButton,
  BrandLogo,
  fmtUah,
} from "../_primitives";
import { getProductOffers } from "@/personal/orders/discoveryMock";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { useCartStore } from "@/personal/cart/cartStore";

import { StickyTopBar } from "../_primitives";
import {
  ShoppingCart,
  Scale,
  Laptop,
  Shirt,
  Home,
  Baby,
  BookOpen,
  Car,
  UtensilsCrossed,
  Sparkles,
  Timer,
  Truck,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "Все", icon: ShoppingCart, match: () => true },
  { id: "electronics", label: "Електроніка", icon: Laptop, match: (p: { category?: string; title: string }) => /електрон|техн|gadget|phone|laptop|iphone|airpods|кавомашин|телевізор|фен|dyson/i.test(`${p.category ?? ""} ${p.title}`) },
  { id: "fashion", label: "Одяг", icon: Shirt, match: (p: { category?: string; title: string }) => /одяг|кросів|футбол|куртк|nike|adidas|intertop|пуховик/i.test(`${p.category ?? ""} ${p.title}`) },
  { id: "home", label: "Дім", icon: Home, match: (p: { category?: string; title: string }) => /дім|меблі|посуд|бойлер|пилосос|prom|епіцентр/i.test(`${p.category ?? ""} ${p.title}`) },
  { id: "kids", label: "Дитяче", icon: Baby, match: (p: { category?: string; title: string }) => /дитяч|іграшк|lego/i.test(`${p.category ?? ""} ${p.title}`) },
  { id: "books", label: "Книги", icon: BookOpen, match: (p: { category?: string; title: string }) => /книг|yakaboo|книгарн/i.test(`${p.category ?? ""} ${p.title}`) },
  { id: "auto", label: "Авто", icon: Car, match: (p: { category?: string; title: string }) => /авто|шин|масло|колодк/i.test(`${p.category ?? ""} ${p.title}`) },
  { id: "grocery", label: "Продукти", icon: UtensilsCrossed, match: (p: { category?: string; title: string }) => /продукт|сільпо|атб|fora|їж|food/i.test(`${p.category ?? ""} ${p.title}`) },
];

function useCountdown(ms: number) {
  const [left, setLeft] = useState(ms);
  useEffect(() => {
    const t = setInterval(() => setLeft((v) => Math.max(0, v - 1000)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PurchasesPage({ cabinet }: { cabinet: Cabinet }) {
  const allProducts = getProductOffers(cabinet.id);
  const [query, setQuery] = useState("");
  const [catId, setCatId] = useState<string>("all");

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = CATEGORIES.find((c) => c.id === catId)!;
    return allProducts.filter((p) => {
      if (!cat.match(p as any)) return false;
      if (!q) return true;
      return `${p.title} ${p.provider}`.toLowerCase().includes(q);
    });
  }, [allProducts, query, catId]);

  const deals = products.slice(0, 6);
  const recs = products.slice(0, 4);
  const recent = products.slice(2, 8);
  const countdown = useCountdown(4 * 3600 * 1000 + 27 * 60 * 1000);
  const { add, openCart } = useCartStore();
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const { push } = useDrillStack();
  const openProduct = (id: string, title: string) =>
    push({ kind: "personal-offer", id, sourceLabel: "Магазин", displayName: title });
  const addToCart = (p: { id: string; title: string; provider: string; priceUah: number; emoji?: string }, discount = 1) =>
    add({ productId: p.id, title: p.title, vendor: p.provider, priceUah: Math.round(p.priceUah * discount), emoji: p.emoji });


  return (
    <PageShell>
      <StickyTopBar>
        <PageHeader
          title="Магазин"
          subtitle="Товари від перевірених продавців з доставкою"
          right={
            <>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">Порівняння</span>
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={openCart}>
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Кошик</span>
                {cartCount > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

            </>
          }
        />
        <SearchBar placeholder="Пошук товарів, брендів, категорій..." value={query} onChange={setQuery} />
      </StickyTopBar>

      {/* Hero commerce banner */}
      <HeroBanner
        eyebrow="ВЕСНЯНИЙ РОЗПРОДАЖ"
        title="До −40% на електроніку та техніку"
        subtitle="Найкращі ціни тижня від Rozetka, Comfy, iStore. Безкоштовна доставка від 1500 ₴."
        cta={{ label: "Перейти до знижок" }}
        brand="Rozetka"
        badge="−40%"
      />

      {/* Popular categories */}
      <section>
        <SectionTitle title="Популярні категорії" hint={catId !== "all" ? `Фільтр: ${CATEGORIES.find((c) => c.id === catId)?.label}` : undefined} />
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.label}
              icon={c.icon}
              active={catId === c.id}
              onClick={() => setCatId(c.id === catId ? "all" : c.id)}
            />
          ))}
        </div>
      </section>

      {(query.trim() || catId !== "all") && (
        <div className="text-xs text-muted-foreground">
          Знайдено товарів: <span className="font-medium text-foreground">{products.length}</span>
        </div>
      )}

      {/* AI Recommendations */}
      {recs.length > 0 && (
        <section>
          <SectionTitle
            title="Рекомендовано для вас"
            hint="на основі ваших покупок та цілей"
            action={<LinkMore label="Всі" />}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recs.map((p) => (
              <Card
                key={p.id}
                className="p-3 border-border/70 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openProduct(p.id, p.title)}
              >
                <div className="relative">
                  <MediaTile emoji={p.emoji} brand={p.provider} className="w-full h-28" />
                  <div className="absolute top-1.5 right-1.5" onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton />
                  </div>
                  {p.tag && (
                    <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-semibold">
                      {p.tag}
                    </span>
                  )}
                  <Sparkles className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 text-primary" />
                </div>
                <div className="mt-2 text-xs font-medium leading-tight line-clamp-2 min-h-[2rem]">{p.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.provider}</div>
                <div className="mt-1">
                  <RatingStars value={p.rating} />
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <PriceTag price={p.priceUah} />
                  <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); addToCart(p); }}>
                    +
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Hot deals with timer */}
      {deals.length > 0 && (
        <section>
          <SectionTitle
            title="Гарячі знижки"
            hint={`до завершення ${countdown}`}
            action={<LinkMore label="Всі" />}
          />
          <RailScroller>
            {deals.map((p) => (
              <Card
                key={`d-${p.id}`}
                className="p-3 w-[200px] shrink-0 snap-start border-border/70 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openProduct(p.id, p.title)}
              >
                <div className="relative">
                  <MediaTile emoji={p.emoji} brand={p.provider} className="w-full h-24" />
                  <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-semibold">
                    −20%
                  </span>
                  <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded bg-background/90 border border-border/60 text-foreground/80 inline-flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    {countdown}
                  </span>
                </div>
                <div className="mt-2 text-xs font-medium line-clamp-2 min-h-[2rem]">{p.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <BrandLogo brand={p.provider} size={14} className="rounded" />
                  <span className="truncate">{p.provider}</span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold tabular-nums">{fmtUah(Math.round(p.priceUah * 0.8))}</span>
                  <span className="text-[10px] text-muted-foreground line-through tabular-nums">{fmtUah(p.priceUah)}</span>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 inline-flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Завтра
                </div>
              </Card>
            ))}
          </RailScroller>
        </section>
      )}

      {/* Recently viewed */}
      {recent.length > 0 && (
        <section>
          <SectionTitle title="Нещодавно переглянуті" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recent.map((p) => (
              <Card
                key={`r-${p.id}`}
                className="p-3 border-border/70 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openProduct(p.id, p.title)}
              >
                <MediaTile emoji={p.emoji} brand={p.provider} className="w-full h-20" />
                <div className="mt-2 text-xs font-medium leading-tight line-clamp-2 min-h-[2rem]">{p.title}</div>
                <PriceTag price={p.priceUah} className="mt-1" />
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Floating cart CTA (mobile) */}
      {cartCount > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <Button className="w-full h-12 shadow-lg gap-2" onClick={openCart}>
            <ShoppingCart className="w-4 h-4" />
            Кошик · {cartCount} {cartCount === 1 ? "товар" : "товари"}
          </Button>
        </div>
      )}
    </PageShell>
  );
}
