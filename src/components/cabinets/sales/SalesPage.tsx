/**
 * SalesPage — Операції → Продажі. Capability `goods_sales`.
 * Hero KPIStrip + 4 таби (Замовлення / Канали / Прайс і знижки / Аналітика).
 */

import { useMemo, useState } from "react";
import { ShoppingCart, Sparkles, FilePlus, Plus, Search, Tag, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import { useToast } from "@/hooks/use-toast";
import { useDrillStack } from "@/components/shared/drill-stack";
import type { Cabinet } from "@/types/cabinet";
import { formatCurrency, formatPercent } from "@/lib/formatters";

import { useOrders } from "@/modules/orders/store/useOrdersStore";
import { useSalesKpis } from "@/modules/orders/kpi/useSalesKpis";
import { OrdersTable } from "@/modules/orders/components/OrdersTable";
import { OrderEditorSheet } from "@/modules/orders/components/OrderEditorSheet";
import { seedOrdersForCabinet } from "@/modules/orders/demo/seedRegistry";
import { useOrderableProducts } from "@/modules/orders/data/useOrderableProducts";
import { useSalonViewBookings } from "@/components/cabinets/bookings/useSalonViewBookings";
import type { OrderChannel } from "@/modules/orders/types";

const CHANNEL_LABEL: Record<OrderChannel, string> = {
  retail_prro: "Каса (ПРРО)",
  b2b: "B2B-рахунок",
  online: "Онлайн",
  upsell_visit: "Допродаж на візиті",
  marketplace: "Маркетплейс",
};

interface Props {
  cabinet: Cabinet;
  onNavigateToPrro?: () => void;
}

export function SalesPage({ cabinet, onNavigateToPrro }: Props) {
  const { toast } = useToast();
  const { push } = useDrillStack();
  const { list } = useOrders(cabinet.id, { direction: "sale", seed: seedOrdersForCabinet });
  const bookings = useSalonViewBookings(cabinet.id);
  const totalBookings30d = useMemo(() => {
    const m30 = Date.now() - 30 * 86_400_000;
    return bookings.filter((b) => new Date(b.date).getTime() >= m30 && b.status === "done").length;
  }, [bookings]);

  const [editorOpen, setEditorOpen] = useState(false);

  const kpi = useSalesKpis(list, totalBookings30d);

  const pendingMasterDrafts = useMemo(
    () => list.filter((o) => o.status === "draft" && o.ownerUserId),
    [list],
  );

  const deltaPct = kpi.prev30d > 0 ? Math.round(((kpi.revenue30d - kpi.prev30d) / kpi.prev30d) * 100) : 0;

  const kpiItems: KPIStripItem[] = [
    { id: "today", title: "Виторг сьогодні", value: formatCurrency(kpi.revenueToday), icon: ShoppingCart },
    { id: "w7", title: "За 7 днів", value: formatCurrency(kpi.revenue7d), icon: TrendingUp },
    { id: "m30", title: "За 30 днів", value: formatCurrency(kpi.revenue30d), icon: BarChart3, hint: kpi.prev30d > 0 ? `MoM ${formatPercent(deltaPct)}` : undefined, variant: deltaPct >= 0 ? "success" : "warning" },
    { id: "check", title: "Середній чек", value: formatCurrency(kpi.avgCheck), icon: Tag },
    { id: "upsell", title: "Допродажі", value: `${kpi.upsellConversion} %`, icon: Sparkles, variant: kpi.upsellConversion >= 20 ? "success" : "default", hint: `${totalBookings30d} візитів` },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Продажі</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Виторг товарів і послуг по каналах, чеки ПРРО, B2B-замовлення, прайс і знижки. Один Order-движок для роздробу і опту.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setEditorOpen(true)} className="gap-1.5 h-11 md:h-9">
            <FilePlus className="w-3.5 h-3.5" /> Новий рахунок
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast({ title: "AI: Знайдено падіння продажів", description: "2 SKU з падінням >20% MoM. Перевірте Аналітику." })} className="gap-1.5 h-11 md:h-9">
            <Sparkles className="w-3.5 h-3.5" /> AI: Падіння продажів
          </Button>
        </div>
      </header>

      {pendingMasterDrafts.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Чернетки від майстрів: {pendingMasterDrafts.length}
            </div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
              Потребують вашого затвердження перед фіскалізацією.
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto h-10 sm:h-9"
            onClick={() => {
              const first = pendingMasterDrafts[0];
              if (first) push({ kind: "order", id: first.id, sourceLabel: "Чернетки майстрів" });
            }}
          >
            Переглянути
          </Button>
        </div>
      )}

      <KPIStrip items={kpiItems} ariaLabel="KPI продажів" />

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="h-9 flex w-full overflow-x-auto snap-x scrollbar-hide md:w-auto">
          <TabsTrigger value="orders" className="shrink-0 snap-start text-xs">Замовлення</TabsTrigger>
          <TabsTrigger value="channels" className="shrink-0 snap-start text-xs">Виторг по каналах</TabsTrigger>
          <TabsTrigger value="price" className="shrink-0 snap-start text-xs">Прайс і знижки</TabsTrigger>
          <TabsTrigger value="analytics" className="shrink-0 snap-start text-xs">Аналітика</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3">
          <OrdersTable
            orders={list}
            direction="sale"
            onRowClick={(o) => push({ kind: "order", id: o.id, sourceLabel: "Продажі" })}
          />
        </TabsContent>

        <TabsContent value="channels" className="space-y-3">
          <RevenueByChannel orders={list} onOpenPrro={onNavigateToPrro} />
        </TabsContent>

        <TabsContent value="price" className="space-y-3">
          <PriceDiscountsTable cabinet={cabinet} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-3">
          <SalesAnalytics topSkus={kpi.topSkus} upsellRate={kpi.upsellConversion} />
        </TabsContent>
      </Tabs>

      <OrderEditorSheet
        cabinet={cabinet}
        direction="sale"
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </div>
  );
}

// ───────────────────────── Sub-sections ─────────────────────────

function RevenueByChannel({ orders, onOpenPrro }: { orders: ReturnType<typeof useOrders>["list"]; onOpenPrro?: () => void }) {
  const m30 = Date.now() - 30 * 86_400_000;
  const byChannel = new Map<OrderChannel, number>();
  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "draft") continue;
    if (new Date(o.confirmedAt ?? o.createdAt).getTime() < m30) continue;
    const ch = o.channel ?? "retail_prro";
    byChannel.set(ch, (byChannel.get(ch) ?? 0) + o.totals.total * (o.fxRate ?? 1));
  }
  const total = [...byChannel.values()].reduce((s, v) => s + v, 0);
  const rows = [...byChannel.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-lg border bg-card divide-y">
      {rows.map(([ch, sum]) => {
        const pct = total > 0 ? Math.round((sum / total) * 100) : 0;
        return (
          <div key={ch} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <Badge variant="outline" className="text-[10px]">{CHANNEL_LABEL[ch]}</Badge>
              <span className="text-xs text-muted-foreground tabular-nums">{pct} %</span>
              {ch === "retail_prro" && onOpenPrro && (
                <button onClick={onOpenPrro} className="text-[11px] text-primary hover:underline">
                  Відкрити зміну в ПРРО →
                </button>
              )}
            </div>
            <div className="sm:text-right">
              <div className="text-sm font-semibold tabular-nums">{formatCurrency(sum)}</div>
            </div>
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">Немає продажів за останні 30 днів.</div>
      )}
    </div>
  );
}

function PriceDiscountsTable({ cabinet }: { cabinet: Cabinet }) {
  const [q, setQ] = useState("");
  const products = useOrderableProducts(cabinet);
  const filtered = products.filter((p) => !p.isService && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук SKU або назви…" className="pl-8 h-11 md:h-9 text-base md:text-sm" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">SKU</th>
              <th className="text-left px-3 py-2 font-medium">Товар</th>
              <th className="text-right px-3 py-2 font-medium">Ціна продажу</th>
              <th className="text-right px-3 py-2 font-medium">Собівартість</th>
              <th className="text-right px-3 py-2 font-medium">Маржа</th>
              <th className="text-center px-3 py-2 font-medium">Залишок</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => {
              const margin = p.price - p.cost;
              const marginPct = p.price > 0 ? Math.round((margin / p.price) * 100) : 0;
              return (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 text-xs tabular-nums text-muted-foreground">{p.sku}</td>
                  <td className="px-3 py-2 truncate max-w-[280px]">{p.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(p.price)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{formatCurrency(p.cost)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    <span className={marginPct >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                      {marginPct} %
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    {p.stockQty < p.minStock ? (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]">{p.stockQty} {p.unit}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{p.stockQty} {p.unit}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((p) => {
          const margin = p.price - p.cost;
          const marginPct = p.price > 0 ? Math.round((margin / p.price) * 100) : 0;
          return (
            <div key={p.id} className="rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">SKU {p.sku}</div>
                </div>
                {p.stockQty < p.minStock ? (
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] shrink-0">{p.stockQty} {p.unit}</Badge>
                ) : (
                  <span className="text-[11px] text-muted-foreground shrink-0">{p.stockQty} {p.unit}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Ціна <span className="text-foreground tabular-nums">{formatCurrency(p.price)}</span></span>
                <span>Собів. <span className="tabular-nums">{formatCurrency(p.cost)}</span></span>
                <span className={marginPct >= 50 ? "text-emerald-600 dark:text-emerald-400 tabular-nums" : "text-amber-600 dark:text-amber-400 tabular-nums"}>
                  Маржа {marginPct}%
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Нічого не знайдено.</p>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">Редагування прайсу через Налаштування → Довідники → Номенклатура. Знижкова політика — Налаштування → Продажі і закупки.</p>
    </div>
  );
}

function SalesAnalytics({ topSkus, upsellRate }: { topSkus: { productId: string; name: string; revenue: number; margin: number }[]; upsellRate: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold mb-2">ТОП SKU за маржею (30д)</h3>
        {topSkus.length === 0 ? (
          <p className="text-xs text-muted-foreground">Недостатньо даних.</p>
        ) : (
          <ul className="space-y-2">
            {topSkus.map((s, idx) => (
              <li key={s.productId} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <span className="text-muted-foreground tabular-nums mr-2">#{idx + 1}</span>
                  <span className="truncate">{s.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold tabular-nums">{formatCurrency(s.revenue)}</div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">маржа {formatCurrency(s.margin)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold">Конверсія допродажів на візиті</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-bold tabular-nums">{upsellRate}</span>
          <span className="text-sm text-muted-foreground">% візитів закінчуються купівлею товару</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Бенчмарк для салонів краси — 18–25 %. Для збільшення конверсії — додайте товарну рекомендацію у картку послуги.
        </p>
      </div>
    </div>
  );
}
