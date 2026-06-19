import type { Cabinet } from "@/types/cabinet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  SearchBar,
  SectionTitle,
  LauncherTile,
  LinkMore,
  MediaTile,
  StatusPill,
  fmtUah,
  goToInner as goToInnerFallback,
} from "./_primitives";

// Local helper using injected onOpen if available, else hard fallback.
function makeOpen(onOpen?: (id: string) => void) {
  return (id: string) => (onOpen ? onOpen(id) : goToInnerFallback(id));
}
import {
  Sparkles,
  ShoppingCart,
  Briefcase,
  CalendarCheck,
  Repeat,
  Trophy,
  ClipboardList,
  SlidersHorizontal,
  RotateCw,
  ChevronLeft,
} from "lucide-react";
import {
  getRecommendations,
  getServiceOffers,
  getBookingOffers,
} from "@/personal/orders/discoveryMock";
import {
  getPersonalOrders,
  type PersonalOrderKind,
  type PersonalOrderStatus,
} from "@/personal/orders/personalOrdersMock";
import {
  getSubscriptionsForCabinet,
  getMonthlySubscriptionsTotal,
} from "@/personal/subscriptions/personalSubscriptionsMock";
import { getLoyaltyForCabinet } from "@/personal/loyalty/loyaltyProgramsMock";

const KIND_EMOJI: Record<PersonalOrderKind, string> = {
  purchase: "📦",
  service: "🛠️",
  booking: "📅",
};
const STATUS_TONE: Record<PersonalOrderStatus, "active" | "success" | "neutral" | "danger"> = {
  scheduled: "active",
  active: "success",
  completed: "neutral",
  cancelled: "danger",
};
const STATUS_LABEL: Record<PersonalOrderStatus, string> = {
  scheduled: "Заплановано",
  active: "В дорозі",
  completed: "Виконано",
  cancelled: "Скасовано",
};

export default function OrdersLauncher({
  cabinet,
  onOpen,
  onBackToHub,
}: {
  cabinet: Cabinet;
  onOpen?: (id: string) => void;
  onBackToHub?: () => void;
}) {
  const goToInner = makeOpen(onOpen);
  const recs = getRecommendations(cabinet.id);
  const services = getServiceOffers(cabinet.id);
  const bookings = getBookingOffers(cabinet.id);
  const orders = getPersonalOrders(cabinet.id);
  const subs = getSubscriptionsForCabinet(cabinet.id);
  const monthly = getMonthlySubscriptionsTotal(cabinet.id);
  const loyalty = getLoyaltyForCabinet(cabinet.id);

  const upcoming = orders
    .filter((o) => o.status === "scheduled" || o.status === "active")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const reorderable = orders
    .filter((o) => o.status === "completed" && o.kind !== "booking")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const cashback = loyalty.filter((p) => p.unit === "₴").reduce((a, p) => a + p.balance, 0);
  const activeSubs = subs.length;
  const inDelivery = orders.filter((o) => o.kind === "purchase" && o.status === "active").length;
  const upcomingBookings = orders.filter((o) => o.kind === "booking" && o.status === "scheduled").length;
  const scheduledServices = orders.filter((o) => o.kind === "service" && o.status === "scheduled").length;

  const tiles = [
    {
      id: "offers",
      label: "Пропозиції",
      description: "AI-рекомендації, акції й анонси",
      kpi: `${recs.length} нових від AI`,
      icon: Sparkles,
      accent: "primary" as const,
    },
    {
      id: "purchases",
      label: "Магазин",
      description: "Товари з доставкою від перевірених продавців",
      kpi: inDelivery > 0 ? `${inDelivery} у дорозі` : "Каталог відкрито",
      icon: ShoppingCart,
      accent: "sky" as const,
    },
    {
      id: "services",
      label: "Послуги",
      description: "Сервіси перевірених партнерів поруч",
      kpi: `${services.length} підібрано · ${scheduledServices} замовлено`,
      icon: Briefcase,
      accent: "violet" as const,
    },
    {
      id: "bookings",
      label: "Бронювання",
      description: "Стіл, корт, готель, лікар — в одному місці",
      kpi: upcomingBookings > 0 ? `${upcomingBookings} попереду` : `${bookings.length} варіантів`,
      icon: CalendarCheck,
      accent: "emerald" as const,
    },
    {
      id: "subscriptions",
      label: "Підписки",
      description: "Усі регулярні платежі та сервіси",
      kpi: `${activeSubs} активних · ${fmtUah(Math.round(monthly))}/міс`,
      icon: Repeat,
      accent: "amber" as const,
    },
    {
      id: "loyalty",
      label: "Лояльність",
      description: "Бали, кешбек, рівні та офери партнерів",
      kpi: `${fmtUah(cashback)} кешбек · ${loyalty.length} партнерів`,
      icon: Trophy,
      accent: "rose" as const,
    },
    {
      id: "my-orders",
      label: "Мої замовлення",
      description: "Покупки, послуги та бронювання разом",
      kpi: `${orders.length} всього · ${upcoming.length} активних`,
      icon: ClipboardList,
      accent: "muted" as const,
    },
  ];

  return (
    <PageShell>
      {onBackToHub && (
        <>
          {/* Desktop breadcrumb */}
          <nav
            className="hidden md:flex items-center gap-1 text-xs text-muted-foreground -mb-3"
            aria-label="Хлібні крихти"
          >
            <button
              type="button"
              onClick={onBackToHub}
              className="hover:text-foreground transition-colors"
            >
              Мої сфери
            </button>
            <span className="opacity-50">/</span>
            <span className="text-foreground/80">Замовлення</span>
          </nav>
        </>
      )}

      <div className="flex items-start gap-3 min-w-0">
        {onBackToHub && (
          <button
            type="button"
            onClick={onBackToHub}
            aria-label="До Мої сфери"
            className="md:hidden w-11 h-11 -ml-1 rounded-2xl bg-muted hover:bg-muted/70 text-foreground flex items-center justify-center shrink-0 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <PageHeader
            title="Замовлення"
            subtitle="Універсальний маркетплейс для вашого життя — від продуктів до бронювання лікаря"
          />
        </div>
      </div>

      <SearchBar
        placeholder="Що хочете замовити чи знайти?"
        trailing={
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0" aria-label="Фільтри">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        }
      />



      {/* Launcher grid */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tiles.map((t) => (
            <LauncherTile
              key={t.id}
              label={t.label}
              description={t.description}
              kpi={t.kpi}
              icon={t.icon}
              accent={t.accent}
              onClick={() => goToInner(t.id)}
            />
          ))}
        </div>
      </section>

      {/* AI suggestions */}
      {recs.length > 0 && (
        <section>
          <SectionTitle
            title="Що пропонує AI зараз"
            hint="на основі вашого профілю та цілей"
            action={<LinkMore label="Всі" onClick={() => goToInner("offers")} />}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {recs.slice(0, 2).map((r) => (
              <Card key={r.id} className="p-4 border-border/70">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm leading-tight">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{r.provider}</div>
                    <p className="text-xs text-foreground/80 mt-2">{r.reason}</p>
                    {r.saving && (
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                        {r.saving}
                      </div>
                    )}
                    <Button size="sm" variant="outline" className="h-7 mt-3 text-xs">
                      {r.cta}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active / upcoming */}
        <section>
          <SectionTitle
            title="Триває / попереду"
            action={<LinkMore label="Всі" onClick={() => goToInner("my-orders")} />}
          />
          {upcoming.length === 0 ? (
            <Card className="p-4 border-border/70 text-sm text-muted-foreground text-center">
              Активних замовлень немає
            </Card>
          ) : (
            <div className="grid gap-2">
              {upcoming.map((o) => (
                <Card key={o.id} className="p-3 border-border/70 flex items-center gap-3">
                  <MediaTile emoji={KIND_EMOJI[o.kind]} className="w-10 h-10" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight truncate">{o.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {o.vendor} · {o.date}
                    </div>
                  </div>
                  <StatusPill label={STATUS_LABEL[o.status]} tone={STATUS_TONE[o.status]} />
                  {o.amountUah > 0 && (
                    <div className="text-sm font-semibold whitespace-nowrap tabular-nums">
                      {fmtUah(o.amountUah)}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Quick re-order */}
        <section>
          <SectionTitle title="Швидко повторити" />
          {reorderable.length === 0 ? (
            <Card className="p-4 border-border/70 text-sm text-muted-foreground text-center">
              Поки немає чого повторити
            </Card>
          ) : (
            <div className="grid gap-2">
              {reorderable.map((o) => (
                <Card key={`r-${o.id}`} className="p-3 border-border/70 flex items-center gap-3">
                  <MediaTile emoji={KIND_EMOJI[o.kind]} className="w-10 h-10" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight truncate">{o.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {o.vendor} · {fmtUah(o.amountUah)}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs shrink-0 gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Ще раз
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
