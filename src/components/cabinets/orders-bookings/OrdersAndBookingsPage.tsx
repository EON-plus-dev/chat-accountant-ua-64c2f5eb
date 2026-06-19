/**
 * OrdersAndBookingsPage — агрегатор замовлень і бронювань фізособи
 * по всіх її «Моїх місцях» (L3-підписки).
 *
 * Окрема ментальна модель:
 *  - «Мої місця» (Огляд) = хаб закладів (підписки, профілі, кнопка «Записатись»)
 *  - «Замовлення та брон.» (тут) = транзакції по всіх місцях (історія, статуси, суми)
 *
 * Demo-only: дані беруться з `subscription.stats` (денормалізовані лічильники).
 */
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Calendar, MapPin, Receipt, Scissors, Trophy, Hotel, UtensilsCrossed, Store, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyPlaces, type SubscribedPlaceVM } from "@/modules/network";
import { MyPlaceDetailSheet } from "@/personal/components/MyPlaceDetailSheet";

const CATEGORY_ICONS: Record<string, typeof Scissors> = {
  salon: Scissors,
  tennis_club: Trophy,
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  supplier: Store,
};

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatUah(value?: number): string {
  if (!value) return "0 ₴";
  return `${new Intl.NumberFormat("uk-UA").format(value)} ₴`;
}

interface ActivityRow {
  placeId: string;
  placeName: string;
  categoryKey: string;
  kind: "booking" | "order";
  whenIso: string;
  label: string;
  amountUah?: number;
  isUpcoming: boolean;
}

function buildActivityRows(places: SubscribedPlaceVM[]): ActivityRow[] {
  const rows: ActivityRow[] = [];
  const now = Date.now();
  for (const vm of places) {
    const { subscription: s, publication: p } = vm;
    const stats = s.stats ?? {};
    if (stats.upcomingBookingAt) {
      rows.push({
        placeId: s.id,
        placeName: p.displayName,
        categoryKey: p.categoryKey,
        kind: "booking",
        whenIso: stats.upcomingBookingAt,
        label: stats.upcomingBookingLabel ?? "Бронювання",
        isUpcoming: new Date(stats.upcomingBookingAt).getTime() >= now,
      });
    }
    if (stats.lastOrderAt) {
      rows.push({
        placeId: s.id,
        placeName: p.displayName,
        categoryKey: p.categoryKey,
        kind: "order",
        whenIso: stats.lastOrderAt,
        label: `Замовлення №${stats.totalOrders ?? 1}`,
        amountUah: stats.totalSpentUah,
        isUpcoming: false,
      });
    } else if (stats.lastVisitAt) {
      rows.push({
        placeId: s.id,
        placeName: p.displayName,
        categoryKey: p.categoryKey,
        kind: "booking",
        whenIso: stats.lastVisitAt,
        label: "Візит",
        isUpcoming: false,
      });
    }
  }
  return rows.sort((a, b) => new Date(b.whenIso).getTime() - new Date(a.whenIso).getTime());
}

function ActivityRowItem({
  row,
  onOpen,
}: {
  row: ActivityRow;
  onOpen: () => void;
}) {
  const Icon = CATEGORY_ICONS[row.categoryKey] ?? MapPin;
  const KindIcon = row.kind === "booking" ? Calendar : Receipt;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "w-full text-left flex items-center gap-3 rounded-md border border-border/70 bg-card",
        "px-3 py-2.5 hover:bg-muted/50 transition",
      )}
    >
      <div className="rounded-md bg-primary/10 p-1.5 text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium truncate">
          <KindIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{row.label}</span>
          {row.isUpcoming && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              Майбутнє
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {row.placeName} · {formatDateTime(row.whenIso)}
        </div>
      </div>
      {row.amountUah !== undefined && (
        <div className="text-sm font-semibold tabular-nums shrink-0">
          {formatUah(row.amountUah)}
        </div>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export function OrdersAndBookingsPage() {
  const places = useMyPlaces();
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);
  const [placeFilter, setPlaceFilter] = useState<string>("all");

  const allRows = useMemo(() => buildActivityRows(places), [places]);
  const filteredRows = useMemo(
    () => (placeFilter === "all" ? allRows : allRows.filter((r) => r.placeId === placeFilter)),
    [allRows, placeFilter],
  );
  const upcoming = filteredRows.filter((r) => r.isUpcoming);
  const history = filteredRows.filter((r) => !r.isUpcoming);

  const totalSpent = places.reduce(
    (sum, p) => sum + (p.subscription.stats?.totalSpentUah ?? 0),
    0,
  );
  const totalOrders = places.reduce(
    (sum, p) => sum + (p.subscription.stats?.totalOrders ?? 0),
    0,
  );

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 md:space-y-5">
      {/* Hero KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="border-border/70">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Заклади</div>
            <div className="text-2xl md:text-3xl font-semibold tabular-nums">
              {places.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Замовлень</div>
            <div className="text-2xl md:text-3xl font-semibold tabular-nums">
              {totalOrders}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Витрачено</div>
            <div className="text-2xl md:text-3xl font-semibold tabular-nums">
              {formatUah(totalSpent)}
            </div>
          </CardContent>
        </Card>
      </div>

      {places.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="py-10 text-center space-y-2">
            <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Поки немає замовлень. Підпишіться на заклад у розділі «Управління → Підписки»,
              щоб робити замовлення і бронювання прямо тут.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant={placeFilter === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPlaceFilter("all")}
            >
              Усі місця
            </Button>
            {places.map((vm) => (
              <Button
                key={vm.subscription.id}
                variant={placeFilter === vm.subscription.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPlaceFilter(vm.subscription.id)}
              >
                {vm.publication.displayName}
              </Button>
            ))}
          </div>

          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">
                Майбутні <span className="ml-1 text-muted-foreground">({upcoming.length})</span>
              </TabsTrigger>
              <TabsTrigger value="history">
                Історія <span className="ml-1 text-muted-foreground">({history.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-2">
              {upcoming.length === 0 ? (
                <Card className="border-border/70">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    Немає запланованих замовлень чи бронювань.
                  </CardContent>
                </Card>
              ) : (
                upcoming.map((row, idx) => (
                  <ActivityRowItem
                    key={`${row.placeId}-up-${idx}`}
                    row={row}
                    onOpen={() => setOpenPlaceId(row.placeId)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-2">
              {history.length === 0 ? (
                <Card className="border-border/70">
                  <CardContent className="py-6 text-center text-sm text-muted-foreground">
                    Поки немає завершених замовлень.
                  </CardContent>
                </Card>
              ) : (
                history.map((row, idx) => (
                  <ActivityRowItem
                    key={`${row.placeId}-hist-${idx}`}
                    row={row}
                    onOpen={() => setOpenPlaceId(row.placeId)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      <MyPlaceDetailSheet
        placeId={openPlaceId}
        onOpenChange={(o) => !o && setOpenPlaceId(null)}
      />
    </div>
  );
}

export default OrdersAndBookingsPage;
