/**
 * SubscriptionsPage — повноцінний хаб підписок на заклади (фізособа).
 * На відміну від компактної `MyPlacesPanel` в Огляді, тут:
 *  - 3 KPI зверху
 *  - пошук + фільтр по категоріях
 *  - повний grid карток
 *  - кнопка «+ Додати підписку» (інлайн-пошук)
 *
 * Транзакції (замовлення / бронювання) — окремий підрозділ «Замовлення та брон.».
 */
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMyPlaces } from "@/modules/network";
import { PlaceCard, PLACE_CATEGORY_LABELS } from "@/personal/components/PlaceCard";
import { PlaceSearchInline } from "@/personal/components/PlaceSearchInline";
import { MyPlaceDetailSheet } from "@/personal/components/MyPlaceDetailSheet";

export function SubscriptionsPage() {
  const places = useMyPlaces();
  const navigate = useNavigate();
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const goToPrivacyHub = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "settings");
    params.set("sub", "connections-privacy");
    params.set("inner", "places");
    navigate(`${window.location.pathname}?${params.toString()}`);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => set.add(p.publication.categoryKey));
    return Array.from(set);
  }, [places]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((vm) => {
      if (categoryFilter !== "all" && vm.publication.categoryKey !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        vm.publication.displayName.toLowerCase().includes(q) ||
        (vm.publication.shortDescription ?? "").toLowerCase().includes(q)
      );
    });
  }, [places, query, categoryFilter]);

  const upcomingCount = places.filter(
    (p) =>
      p.subscription.stats?.upcomingBookingAt &&
      new Date(p.subscription.stats.upcomingBookingAt).getTime() >= Date.now(),
  ).length;

  const pendingTotal = places.reduce(
    (sum, p) => sum + (p.subscription.stats?.pendingActionsCount ?? 0),
    0,
  );

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 md:space-y-5">
      {/* Hero KPIs */}
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="border-border/70">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Закладів</div>
            <div className="text-2xl md:text-3xl font-semibold tabular-nums">
              {places.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Майбутніх бронювань</div>
            <div className="text-2xl md:text-3xl font-semibold tabular-nums">
              {upcomingCount}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Потребують уваги</div>
            <div className="text-2xl md:text-3xl font-semibold tabular-nums">
              {pendingTotal}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy notice */}
      <div className="text-xs text-muted-foreground">
        Підписки приватні — лише ви бачите свою історію. Кожен заклад бачить тільки візити у себе.
      </div>

      {places.length === 0 && !searchOpen ? (
        <Card className="border-border/70 border-dashed">
          <CardContent className="py-10 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Підпишіться на заклад через QR-код, посилання або просто знайдіть тут —
              і він зʼявиться у вашому списку для швидких записів і замовлень.
            </p>
            <Button size="sm" onClick={() => setSearchOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              Підписатись на перший заклад
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук по назві або опису…"
                className="pl-8 h-9"
              />
            </div>
            <Button
              variant={searchOpen ? "secondary" : "outline"}
              size="sm"
              className="h-9 gap-1 shrink-0"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Plus className="h-4 w-4" />
              {searchOpen ? "Закрити пошук" : "Додати підписку"}
            </Button>
          </div>

          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCategoryFilter("all")}
              >
                Усі
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {places.length}
                </Badge>
              </Button>
              {categories.map((cat) => {
                const count = places.filter((p) => p.publication.categoryKey === cat).length;
                return (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {PLACE_CATEGORY_LABELS[cat] ?? cat}
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          )}

          {searchOpen && (
            <Card className="border-border/70">
              <CardContent className="p-3">
                <PlaceSearchInline onClose={() => setSearchOpen(false)} />
              </CardContent>
            </Card>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <Card className="border-border/70 border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Нічого не знайдено за поточними фільтрами.
              </CardContent>
            </Card>
          ) : (
            <div className={cn("grid gap-2.5", "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
              {filtered.map((vm) => (
                <PlaceCard
                  key={vm.subscription.id}
                  vm={vm}
                  onOpen={() => setOpenPlaceId(vm.subscription.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <MyPlaceDetailSheet
        placeId={openPlaceId}
        onOpenChange={(o) => !o && setOpenPlaceId(null)}
      />

      {places.length > 0 && (
        <button
          type="button"
          onClick={goToPrivacyHub}
          className={cn(
            "w-full mt-2 rounded-lg border border-dashed border-border/70 bg-muted/20",
            "px-3 py-2.5 flex items-center gap-2 text-xs text-muted-foreground",
            "hover:bg-muted/40 hover:text-foreground transition",
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="flex-1 text-left">
            Керувати дозволами, призупинити або відписатися — у{" "}
            <strong className="text-foreground">Налаштування → Підключення та приватність</strong>
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default SubscriptionsPage;
