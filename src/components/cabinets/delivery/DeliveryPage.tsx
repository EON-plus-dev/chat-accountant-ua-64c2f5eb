/**
 * DeliveryPage — управління доставкою (capability `delivery`).
 * Mobile-first. Показує sale-замовлення з `notes` префіксом `[delivery]`.
 * Стадії: новий → готується → у дорозі → доставлено.
 * Курʼєри — локальний стан (демо). Карти — placeholder.
 */

import { useMemo, useState } from "react";
import { Truck, Clock, ChefHat, MapPin, CheckCircle2, Phone, User, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders, patchOrder } from "@/modules/orders/store/useOrdersStore";
import { seedOrdersForCabinet } from "@/modules/orders/demo/seedRegistry";
import type { Cabinet } from "@/types/cabinet";
import type { Order } from "@/modules/orders/types";

interface DeliveryPageProps {
  cabinet: Cabinet;
}

type Stage = "new" | "cooking" | "en_route" | "delivered";

const COURIERS = [
  { id: "courier-1", name: "Андрій К.", phone: "+380 67 123 45 67" },
  { id: "courier-2", name: "Володимир П.", phone: "+380 67 234 56 78" },
  { id: "courier-3", name: "Сергій М.", phone: "+380 67 345 67 89" },
];

function stageFromOrder(o: Order): Stage {
  if (o.status === "fulfilled" || o.status === "paid" || o.status === "closed") return "delivered";
  if (o.status === "draft") return "new";
  if (o.notes?.includes("[en_route]")) return "en_route";
  return "cooking";
}

const STAGE_META: Record<Stage, { label: string; icon: typeof Clock; tone: string }> = {
  new: { label: "Новий", icon: Clock, tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  cooking: { label: "Готується", icon: ChefHat, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  en_route: { label: "У дорозі", icon: Truck, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  delivered: { label: "Доставлено", icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
};

export function DeliveryPage({ cabinet }: DeliveryPageProps) {
  const { list } = useOrders(cabinet.id, { direction: "sale", seed: seedOrdersForCabinet });
  const [tab, setTab] = useState<Stage | "all">("all");

  const deliveryOrders = useMemo(
    () => list.filter((o) => o.notes?.includes("[delivery]")),
    [list],
  );

  const grouped = useMemo(() => {
    const byStage: Record<Stage, Order[]> = { new: [], cooking: [], en_route: [], delivered: [] };
    deliveryOrders.forEach((o) => byStage[stageFromOrder(o)].push(o));
    return byStage;
  }, [deliveryOrders]);

  const visible = tab === "all" ? deliveryOrders : grouped[tab];

  const todayRevenue = grouped.delivered.reduce((s, o) => s + o.totals.total, 0);
  const activeCount = grouped.new.length + grouped.cooking.length + grouped.en_route.length;

  const advance = (order: Order) => {
    const stage = stageFromOrder(order);
    if (stage === "new") {
      patchOrder(cabinet.id, order.id, { status: "confirmed" });
    } else if (stage === "cooking") {
      patchOrder(cabinet.id, order.id, {
        notes: `${order.notes ?? ""} [en_route]`.trim(),
      });
    } else if (stage === "en_route") {
      patchOrder(cabinet.id, order.id, { status: "fulfilled" });
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <KpiCard label="Активні" value={activeCount} icon={Truck} />
        <KpiCard label="Доставлено сьогодні" value={grouped.delivered.length} icon={CheckCircle2} />
        <KpiCard label="Виторг доставки" value={`${todayRevenue.toLocaleString("uk-UA")} ₴`} icon={MapPin} />
        <KpiCard label="Курʼєрів на зміні" value={COURIERS.length} icon={User} />
      </div>

      {/* Stage tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Stage | "all")}>
        <TabsList className="w-full overflow-x-auto scrollbar-hide flex justify-start md:grid md:grid-cols-5 snap-x">
          <TabsTrigger value="all" className="snap-start shrink-0">
            Усі <span className="ml-1 text-xs opacity-60">{deliveryOrders.length}</span>
          </TabsTrigger>
          {(Object.keys(STAGE_META) as Stage[]).map((s) => (
            <TabsTrigger key={s} value={s} className="snap-start shrink-0">
              {STAGE_META[s].label} <span className="ml-1 text-xs opacity-60">{grouped[s].length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-3 space-y-2">
          {visible.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Немає замовлень на цьому етапі
              </CardContent>
            </Card>
          ) : (
            visible.map((o) => (
              <DeliveryCard key={o.id} order={o} onAdvance={() => advance(o)} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Map placeholder */}
      <Card className="hidden md:block">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Карта курʼєрів</div>
            <span className="text-xs text-muted-foreground">демо — буде Google Maps</span>
          </div>
          <div className="aspect-[16/6] rounded-lg bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center text-muted-foreground">
            <MapPin className="w-8 h-8 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Floating FAB mobile */}
      <Button
        size="lg"
        className="md:hidden fixed bottom-20 right-4 rounded-full h-14 w-14 shadow-lg p-0 z-30"
        onClick={() => window.alert("Нове замовлення з телефону — використайте розділ Продажі")}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Clock }) {
  return (
    <Card>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Icon className="w-3.5 h-3.5" />
          <span className="truncate">{label}</span>
        </div>
        <div className="text-lg md:text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function DeliveryCard({ order, onAdvance }: { order: Order; onAdvance: () => void }) {
  const stage = stageFromOrder(order);
  const meta = STAGE_META[stage];
  const Icon = meta.icon;
  const [courier, setCourier] = useState<string | undefined>(undefined);

  const nextLabel: Record<Stage, string | null> = {
    new: "Прийняти",
    cooking: "На доставку",
    en_route: "Доставлено",
    delivered: null,
  };

  return (
    <Card>
      <CardContent className="p-3 md:p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm md:text-base truncate">{order.number}</span>
              <Badge variant="secondary" className={meta.tone}>
                <Icon className="w-3 h-3 mr-1" />
                {meta.label}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {order.counterpartyName} • {order.lines.length} поз.
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-semibold tabular-nums">{order.totals.total.toLocaleString("uk-UA")} ₴</div>
            <div className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {stage !== "delivered" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select value={courier} onValueChange={setCourier}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Призначити курʼєра" />
              </SelectTrigger>
              <SelectContent>
                {COURIERS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <Phone className="w-3 h-3 opacity-60" />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {nextLabel[stage] && (
              <Button onClick={onAdvance} className="h-10">
                {nextLabel[stage]}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DeliveryPage;
