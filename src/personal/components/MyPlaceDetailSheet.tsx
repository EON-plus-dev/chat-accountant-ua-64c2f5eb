import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MapPin, ExternalLink, ShoppingBag, FileText } from "lucide-react";
import { useMyPlace } from "@/modules/network";
import { useProviderCatalog } from "@/modules/network/hooks/useProviderCatalog";
import { useOrders } from "@/modules/orders/store/useOrdersStore";
import { seedOrdersForCabinet } from "@/modules/orders/demo/seedRegistry";

interface Props {
  placeId: string | null;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function MyPlaceDetailSheet({ placeId, onOpenChange }: Props) {
  const vm = useMyPlace(placeId);

  return (
    <Sheet open={!!placeId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        {vm && (
          <>
            <SheetHeader className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <SheetTitle className="text-xl">{vm.publication.displayName}</SheetTitle>
                <Badge variant="secondary" className="shrink-0">Підписано</Badge>
              </div>
              <SheetDescription>{vm.publication.shortDescription}</SheetDescription>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                {vm.publication.address && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {vm.publication.address}
                  </span>
                )}
                {vm.publication.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {vm.publication.phone}
                  </span>
                )}
              </div>
            </SheetHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Огляд</TabsTrigger>
                <TabsTrigger value="catalog">Каталог</TabsTrigger>
                <TabsTrigger value="orders">Замовлення</TabsTrigger>
                <TabsTrigger value="terms">Умови</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Найближче бронювання</div>
                    <div className="text-sm font-medium mt-1">
                      {formatDate(vm.subscription.stats?.upcomingBookingAt)}
                    </div>
                    {vm.subscription.stats?.upcomingBookingLabel && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {vm.subscription.stats.upcomingBookingLabel}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Останній візит</div>
                    <div className="text-sm font-medium mt-1">
                      {formatDate(vm.subscription.stats?.lastVisitAt)}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Усього замовлень</div>
                    <div className="text-sm font-medium mt-1">
                      {vm.subscription.stats?.totalOrders ?? 0}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Витрачено в закладі</div>
                    <div className="text-sm font-medium mt-1">
                      {(vm.subscription.stats?.totalSpentUah ?? 0).toLocaleString("uk-UA")} ₴
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  {vm.subscription.scope.bookings && vm.publication.publicBookingUrl && (
                    <Button className="gap-1.5 flex-1" asChild>
                      <a href={vm.publication.publicBookingUrl} target="_blank" rel="noopener">
                        <Calendar className="h-4 w-4" />
                        Записатися
                      </a>
                    </Button>
                  )}
                  {vm.subscription.scope.orders && (
                    <Button
                      variant="outline"
                      className="gap-1.5 flex-1"
                      onClick={() => {
                        // MVP: створення замовлення піде через cabinet-chat tool `reorder_last`
                        // або через CreateOrderSheet провайдера. Тут — оптимістичний toast.
                        // Реальна інтеграція — у Phase C-3 (через existing sales API).
                        window.dispatchEvent(new CustomEvent("network:reorder", { detail: { subscriptionId: vm.subscription.id } }));
                      }}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Замовити повторно
                    </Button>
                  )}
                  {vm.publication.publicBookingUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={vm.publication.publicBookingUrl} target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="catalog" className="mt-4">
                <CatalogTab subscriptionId={vm.subscription.id} publicationId={vm.publication.id} />
              </TabsContent>

              <TabsContent value="orders" className="mt-4">
                <OrdersTab cabinetId={vm.publication.providerCabinetId} clientCardId={vm.subscription.clientCardId} />
              </TabsContent>

              <TabsContent value="terms" className="space-y-3 mt-4">
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-primary" />
                    Умови підписки
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 ml-1">
                    <li>• Заклад бачить лише імʼя, телефон і вашу історію замовлень у себе.</li>
                    <li>• Заклад НЕ бачить інших ваших підписок, фінансів чи декларацій.</li>
                    <li>• Ви можете призупинити або відписатися будь-коли — заклад втратить доступ до картки.</li>
                    {vm.subscription.acceptedTermsAt && (
                      <li>• Підписано: {formatDate(vm.subscription.acceptedTermsAt)}</li>
                    )}
                  </ul>
                  <Button variant="outline" size="sm" className="mt-2">
                    Призупинити підписку
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Live tabs (Phase D) ───────────────────────────────────

function CatalogTab({ subscriptionId, publicationId }: { subscriptionId: string; publicationId: string }) {
  const items = useProviderCatalog(publicationId);
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Заклад ще не опублікував каталог.
      </div>
    );
  }
  const order = (it: (typeof items)[number]) => {
    window.dispatchEvent(
      new CustomEvent("network:reorder", {
        detail: { subscriptionId, publicationId, itemId: it.id, itemName: it.name, price: it.price },
      }),
    );
  };
  return (
    <div className="rounded-lg border bg-card divide-y max-h-[60vh] overflow-y-auto">
      {items.map((it) => (
        <div key={it.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{it.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {it.kind === "service" ? "Послуга" : "Товар"}
              {it.category ? ` · ${it.category}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm tabular-nums">{it.price.toLocaleString("uk-UA")} ₴</span>
            <Button size="sm" variant="outline" className="h-7" onClick={() => order(it)}>
              <ShoppingBag className="h-3 w-3 mr-1" /> Замовити
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTab({ cabinetId, clientCardId }: { cabinetId: string; clientCardId?: string }) {
  const { list } = useOrders(cabinetId, { direction: "sale", seed: seedOrdersForCabinet });
  const mine = list
    .filter((o) => (clientCardId ? o.counterpartyId === clientCardId : false) || o.notes?.includes("[network:reorder]"))
    .slice(0, 12);
  if (mine.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Тут зʼявляться ваші замовлення в цьому закладі.
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card divide-y">
      {mine.map((o) => (
        <div key={o.id} className="flex items-center justify-between px-3 py-2 text-sm">
          <div className="min-w-0">
            <div className="font-medium truncate">№{o.number}</div>
            <div className="text-[11px] text-muted-foreground">
              {formatDate(o.confirmedAt ?? o.createdAt)} · {o.status}
            </div>
          </div>
          <div className="text-sm tabular-nums">{o.totals.total.toLocaleString("uk-UA")} ₴</div>
        </div>
      ))}
    </div>
  );
}
