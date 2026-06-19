import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Settings2, Pause, ExternalLink } from "lucide-react";
import { useMyPlaces } from "@/modules/network";
import { PLACE_CATEGORY_ICONS, PLACE_CATEGORY_LABELS } from "@/personal/components/PlaceCard";
import { SubscriptionManagementSheet } from "./SubscriptionManagementSheet";

interface Props {
  initialSubscriptionId?: string | null;
}

export function PlacesSubscriptionsTab({ initialSubscriptionId }: Props) {
  const places = useMyPlaces();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(initialSubscriptionId ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return places;
    return places.filter((p) =>
      p.publication.displayName.toLowerCase().includes(q) ||
      (p.publication.shortDescription ?? "").toLowerCase().includes(q),
    );
  }, [places, query]);

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Усі заклади, на які ви підписані. Тут ви керуєте дозволами,
        призупиняєте та відписуєтеся. Швидкі дії (записатись, замовити) —
        у <strong className="text-foreground">Управління → Підписки</strong>.
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук серед підписок…"
          className="pl-8 h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <MapPin className="h-6 w-6 mx-auto mb-2 opacity-60" />
            Немає активних підписок.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((vm) => {
            const Icon = PLACE_CATEGORY_ICONS[vm.publication.categoryKey] ?? MapPin;
            const stats = vm.subscription.stats;
            const paused = vm.subscription.status === "paused";
            const scope = vm.subscription.scope;
            return (
              <div
                key={vm.subscription.id}
                className="rounded-lg border bg-card p-3 flex items-start gap-3"
              >
                <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-medium truncate">
                      {vm.publication.displayName}
                    </div>
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {PLACE_CATEGORY_LABELS[vm.publication.categoryKey] ?? vm.publication.categoryKey}
                    </Badge>
                    {paused ? (
                      <Badge variant="secondary" className="h-5 text-[10px] gap-1">
                        <Pause className="h-3 w-3" /> Призупинено
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="h-5 text-[10px]">Активна</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Підписані {fmt(vm.subscription.createdAt)}
                    {stats?.lastVisitAt ? ` · Ост. візит ${fmt(stats.lastVisitAt)}` : ""}
                    {stats?.totalOrders ? ` · ${stats.totalOrders} зам.` : ""}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                    <span>Дозволено:</span>
                    <ScopeChip on={scope.catalog} label="каталог" />
                    <ScopeChip on={scope.orders} label="замовлення" />
                    <ScopeChip on={scope.bookings} label="бронювання" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                    onClick={() => setOpenId(vm.subscription.id)}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Керувати
                  </Button>
                  {vm.publication.publicBookingUrl && (
                    <a
                      href={vm.publication.publicBookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Сайт
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SubscriptionManagementSheet
        subscriptionId={openId}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </div>
  );
}

function ScopeChip({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={on ? "text-foreground" : "line-through opacity-60"}>
      {label} {on ? "✓" : "✗"}
    </span>
  );
}

function fmt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "short", year: "2-digit" }).format(new Date(iso));
  } catch {
    return iso;
  }
}
