import type { Cabinet } from "@/types/cabinet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PageShell,
  PageHeader,
  SearchBar,
  SectionTitle,
  StatTile,
  RailScroller,
  LinkMore,
  BrandLogo,
  HeroBanner,
  fmtUah,
  ORDERS_NUM,
} from "../_primitives";
import { getLoyaltyForCabinet } from "@/personal/loyalty/loyaltyProgramsMock";
import { enrichLoyalty } from "@/personal/loyalty/loyaltyEnrich";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { Clock3, Gift, Percent } from "lucide-react";

const CATEGORY_LABEL = {
  bank: "Банк",
  grocery: "Продукти",
  fuel: "Паливо",
  cinema: "Кіно",
  beauty: "Краса",
  other: "Інше",
} as const;

const NEXT_TIER: Record<string, string> = {
  White: "Black",
  "Срібний": "Золотий",
  "Срібло": "Золото",
  "Silver": "Gold",
  "Базовий": "Срібний",
  "Стандарт": "Преміум",
  Gold: "Platinum",
  "Експерт": "Майстер",
  "Майстер": "Гуру",
};

export default function LoyaltyPage({ cabinet }: { cabinet: Cabinet }) {
  const rawPrograms = getLoyaltyForCabinet(cabinet.id);
  const programs = rawPrograms.map(enrichLoyalty);
  const { push } = useDrillStack();
  const cashbackBalance = programs
    .filter((p) => p.unit === "₴")
    .reduce((acc, p) => acc + p.balance, 0);
  const totalPoints = programs.filter((p) => p.unit === "балів").reduce((acc, p) => acc + p.balance, 0);
  // Реальна метрика «До рівня Gold» — мінімальна дельта серед банківських кешбек-програм
  const toNextTierBank = programs
    .filter((p) => p.unit === "₴" && p.nextTier)
    .reduce((min, p) => Math.min(min, p.toNextDelta), Number.POSITIVE_INFINITY);
  const toGoldLabel = Number.isFinite(toNextTierBank) ? fmtUah(toNextTierBank) : "—";

  return (
    <PageShell>
      <PageHeader
        title="Лояльність"
        subtitle="Бали, кешбек, рівні та спеціальні пропозиції від партнерів"
        right={
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Clock3 className="w-4 h-4" />
            <span className="hidden sm:inline">Історія</span>
          </Button>
        }
      />
      <SearchBar placeholder="Пошук партнерів і програм" />

      {/* Wallet hero */}
      <Card className="p-5 md:p-6 border-border/70 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -right-20 -bottom-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="relative">
          <div className="text-xs uppercase tracking-wide opacity-80">Загальний кешбек-баланс</div>
          <div className="text-3xl md:text-4xl font-semibold mt-1 tabular-nums">{fmtUah(cashbackBalance)}</div>
          <div className="text-xs opacity-80 mt-1">
            та {ORDERS_NUM.format(totalPoints)} балів у {programs.length} партнерів
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" className="h-8 text-xs">Витратити кешбек</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent border-white/30 text-primary-foreground hover:bg-white/10">
              Перевести в банк
            </Button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <StatTile label="Партнерів" value={`${programs.length}`} />
        <StatTile
          label="Цього місяця"
          value={fmtUah(Math.round(cashbackBalance * 0.18))}
          tone="positive"
          hint="нараховано"
        />
        <StatTile label="До наступного рівня" value={toGoldLabel} hint="на кешбеку" />
        <StatTile label="Загалом балів" value={ORDERS_NUM.format(totalPoints)} hint={`у ${programs.length} партнерів`} />
      </section>

      {/* Promo banner */}
      <HeroBanner
        eyebrow="НОВА ПРОГРАМА"
        title="Активуйте Rozetka Premium безкоштовно на 30 днів"
        subtitle="Подвоєний кешбек на електроніку та безкоштовна доставка."
        cta={{ label: "Активувати" }}
        brand="Rozetka"
        badge="30 днів"
      />

      {/* Partners rail with progress */}
      {programs.length > 0 && (
        <section>
          <SectionTitle title="Ваші партнери" action={<LinkMore label="Всі" />} />
          <RailScroller>
            {programs.map((p) => {
              const progress = p.progressPct;
              return (
                <Card
                  key={p.id}
                  className="p-3 w-[220px] shrink-0 snap-start border-border/70 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => push({ kind: "loyalty-program", id: p.id, sourceLabel: "Лояльність", displayName: p.brand })}
                >
                  <div className="flex items-start justify-between">
                    <BrandLogo brand={p.brand} size={44} />
                    {p.tier && (
                      <span className="text-[10px] inline-flex px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                        {p.tier}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-medium leading-tight truncate">{p.brand}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{CATEGORY_LABEL[p.category]}</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-semibold tabular-nums">{ORDERS_NUM.format(p.balance)}</span>
                    <span className="text-[10px] text-muted-foreground">{p.unit}</span>
                  </div>
                  {p.nextTier && (
                    <>
                      <Progress value={progress} className="h-1.5 mt-2" />
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {ORDERS_NUM.format(p.toNextDelta)} {p.toNextUnit} до {p.nextTier}
                      </div>
                    </>
                  )}
                  {p.lastActivity && (
                    <div className="text-[10px] text-muted-foreground mt-1.5">{p.lastActivity}</div>
                  )}
                </Card>
              );
            })}
          </RailScroller>
        </section>
      )}

      {/* Offers */}
      <section>
        <SectionTitle title="Спеціальні пропозиції партнерів" action={<LinkMore label="Всі" />} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="p-3 border-border/70 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">×2 бали в Сільпо на вихідних</div>
              <p className="text-xs text-muted-foreground mt-0.5">12–13 квітня · на всі покупки від 500 ₴</p>
            </div>
          </Card>
          <Card className="p-3 border-border/70 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Кешбек 10% на пальне WOG</div>
              <p className="text-xs text-muted-foreground mt-0.5">для тарифу White · до 500 ₴ / місяць</p>
            </div>
          </Card>
        </div>
      </section>

      {/* History */}
      <section>
        <SectionTitle title="Останні нарахування" action={<LinkMore label="Уся історія" />} />
        <div className="grid gap-2">
          {programs.slice(0, 6).map((p) => {
            const lastTx = p.transactions[0];
            const earned = lastTx?.delta ?? 0;
            return (
              <Card
                key={`h-${p.id}`}
                className="p-3 border-border/70 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => push({ kind: "loyalty-program", id: p.id, sourceLabel: "Лояльність", displayName: p.brand })}
              >
                <BrandLogo brand={p.brand} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium leading-tight truncate">{p.brand}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {lastTx?.reason ?? p.lastActivity ?? "—"} · {CATEGORY_LABEL[p.category]}
                  </div>
                </div>
                <div className={`text-sm font-semibold tabular-nums whitespace-nowrap ${earned >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {earned >= 0 ? "+" : ""}{ORDERS_NUM.format(earned)} {p.unit}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
