/**
 * PurchasesPage — Операції → Закупки. Capability `purchases`.
 * 5 табів: Замовлення / Прийом / Потреба / Постачальники / Ціни.
 */

import { useMemo, useState } from "react";
import { PackagePlus, Sparkles, FilePlus, AlertCircle, Truck, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import { useToast } from "@/hooks/use-toast";
import { useDrillStack } from "@/components/shared/drill-stack";
import type { Cabinet } from "@/types/cabinet";
import { formatCurrency, formatNumber } from "@/lib/formatters";

import { useOrders } from "@/modules/orders/store/useOrdersStore";
import { useFulfillments } from "@/modules/orders/store/useFulfillmentsStore";
import { usePurchasesKpis } from "@/modules/orders/kpi/usePurchasesKpis";
import { computeDaysOfStock, avgLiveDaysOfStock } from "@/modules/orders/kpi/daysOfStock";
import { OrdersTable } from "@/modules/orders/components/OrdersTable";
import { OrderEditorSheet } from "@/modules/orders/components/OrderEditorSheet";
import { useOrderableProducts } from "@/modules/orders/data/useOrderableProducts";
import { useOrderCounterparties } from "@/modules/orders/data/useOrderCounterparties";
import {
  seedOrdersForCabinet,
  seedFulfillmentsForCabinet,
} from "@/modules/orders/demo/seedRegistry";
import { SubscribedSuppliersPanel } from "./SubscribedSuppliersPanel";

interface Props {
  cabinet: Cabinet;
}

export function PurchasesPage({ cabinet }: Props) {
  const { toast } = useToast();
  const { push } = useDrillStack();
  const { list } = useOrders(cabinet.id, { direction: "purchase", seed: seedOrdersForCabinet });
  const allOrders = useOrders(cabinet.id, { seed: seedOrdersForCabinet }).list;
  const { list: fulfillments } = useFulfillments(cabinet.id, { seed: seedFulfillmentsForCabinet });
  const products = useOrderableProducts(cabinet);
  const suppliers = useOrderCounterparties(cabinet, "purchase");

  const [editorOpen, setEditorOpen] = useState(false);

  // Days of stock — потребує і sale-ордерів
  const dosMap = useMemo(
    () => computeDaysOfStock(products.map((p) => ({ productId: p.id, stockQty: p.stockQty })), allOrders),
    [allOrders, products],
  );
  const daysOfStockAvg = avgLiveDaysOfStock(dosMap);

  const kpi = usePurchasesKpis(list, { monthBudget: 120_000, daysOfStockAvg });

  const kpiItems: KPIStripItem[] = [
    { id: "in", title: "В роботі", value: String(kpi.inProgress), icon: Truck, hint: kpi.overdue > 0 ? `${kpi.overdue} прострочено` : undefined, variant: kpi.overdue > 0 ? "warning" : "default" },
    { id: "spend", title: "Витрати 30д", value: formatCurrency(kpi.monthSpend), icon: PackagePlus, hint: kpi.monthBudget > 0 ? `Бюджет ${formatCurrency(kpi.monthBudget)}` : undefined, variant: kpi.monthBudget > 0 && kpi.monthSpend > kpi.monthBudget ? "warning" : "default" },
    { id: "dos", title: "Days of stock", value: daysOfStockAvg ? `${daysOfStockAvg} дн` : "—", icon: TrendingDown, variant: daysOfStockAvg < 14 ? "warning" : "default" },
    { id: "sup", title: "Постачальників", value: String(suppliers.length), icon: Sparkles },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Закупки</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Замовлення постачальникам, прийом товару (GRN), рекомендації що замовити, рейтинг постачальників і ціни.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setEditorOpen(true)} className="gap-1.5 h-11 md:h-9">
            <FilePlus className="w-3.5 h-3.5" /> Нове замовлення
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast({ title: "AI: Що замовити", description: "Знайдено 3 SKU нижче min-stock. Перевірте таб «Потреба»." })} className="gap-1.5 h-11 md:h-9">
            <Sparkles className="w-3.5 h-3.5" /> AI: Що замовити
          </Button>
        </div>
      </header>

      <KPIStrip items={kpiItems} ariaLabel="KPI закупівель" />

      <SubscribedSuppliersPanel cabinetId={cabinet.id} />

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="h-9 flex w-full overflow-x-auto snap-x scrollbar-hide md:w-auto">
          <TabsTrigger value="orders" className="shrink-0 snap-start text-xs">Замовлення</TabsTrigger>
          <TabsTrigger value="receiving" className="shrink-0 snap-start text-xs">Прийом (GRN)</TabsTrigger>
          <TabsTrigger value="reorder" className="shrink-0 snap-start text-xs">Потреба</TabsTrigger>
          <TabsTrigger value="suppliers" className="shrink-0 snap-start text-xs">Постачальники</TabsTrigger>
          <TabsTrigger value="prices" className="shrink-0 snap-start text-xs">Ціни</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3">
          <OrdersTable
            orders={list}
            direction="purchase"
            onRowClick={(o) => push({ kind: "order", id: o.id, sourceLabel: "Закупки" })}
          />
        </TabsContent>

        <TabsContent value="receiving" className="space-y-3">
          <ReceivingTable fulfillments={fulfillments} orders={list} onOpen={(orderId) => push({ kind: "order", id: orderId, sourceLabel: "Прийом" })} />
        </TabsContent>

        <TabsContent value="reorder" className="space-y-3">
          <ReorderRecommendations dosMap={dosMap} products={products} suppliers={suppliers} />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-3">
          <SuppliersScorecard topSuppliers={kpi.topSuppliers} suppliers={suppliers} />
        </TabsContent>

        <TabsContent value="prices" className="space-y-3">
          <PriceConditions />
        </TabsContent>
      </Tabs>

      <OrderEditorSheet
        cabinet={cabinet}
        direction="purchase"
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </div>
  );
}

// ───────────────────────── Sub-sections ─────────────────────────

function ReceivingTable({
  fulfillments,
  orders,
  onOpen,
}: {
  fulfillments: ReturnType<typeof useFulfillments>["list"];
  orders: ReturnType<typeof useOrders>["list"];
  onOpen: (orderId: string) => void;
}) {
  if (fulfillments.length === 0) {
    return <EmptyHint text="Поки немає прихідних накладних." />;
  }
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Дата прийому</th>
              <th className="text-left px-3 py-2 font-medium">Замовлення</th>
              <th className="text-left px-3 py-2 font-medium">Постачальник</th>
              <th className="text-right px-3 py-2 font-medium">Позицій</th>
              <th className="text-left px-3 py-2 font-medium">Розбіжності</th>
              <th className="text-left px-3 py-2 font-medium">Landed cost</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fulfillments.map((f) => {
              const o = orders.find((x) => x.id === f.orderId);
              const discrepancy = f.lines.reduce((s, l) => s + Math.abs(l.discrepancy ?? 0), 0);
              const landed = (f.landedCosts ?? []).reduce((s, l) => s + l.amount, 0);
              return (
                <tr key={f.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => o && onOpen(o.id)}>
                  <td className="px-3 py-2 text-xs tabular-nums">{new Date(f.date).toLocaleDateString("uk-UA")}</td>
                  <td className="px-3 py-2 text-xs font-mono">{o?.number ?? f.orderId}</td>
                  <td className="px-3 py-2">{o?.counterpartyName ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{f.lines.length}</td>
                  <td className="px-3 py-2">
                    {discrepancy > 0 ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-[10px]">
                        <AlertCircle className="w-3 h-3" /> −{discrepancy} од
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Без розбіжностей</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                    {landed > 0 ? `${formatNumber(landed)} ${f.landedCosts?.[0].currency}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {fulfillments.map((f) => {
          const o = orders.find((x) => x.id === f.orderId);
          const discrepancy = f.lines.reduce((s, l) => s + Math.abs(l.discrepancy ?? 0), 0);
          const landed = (f.landedCosts ?? []).reduce((s, l) => s + l.amount, 0);
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => o && onOpen(o.id)}
              className="w-full text-left rounded-lg border bg-card p-3 space-y-1.5 hover:bg-muted/30 transition-colors min-h-[44px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-mono truncate">{o?.number ?? f.orderId}</div>
                <div className="text-[11px] text-muted-foreground tabular-nums shrink-0">{new Date(f.date).toLocaleDateString("uk-UA")}</div>
              </div>
              <div className="text-sm truncate">{o?.counterpartyName ?? "—"}</div>
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-muted-foreground tabular-nums">Позицій: {f.lines.length}</span>
                {discrepancy > 0 ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-[10px]">
                    <AlertCircle className="w-3 h-3" /> −{discrepancy} од
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">OK</span>
                )}
                <span className="text-muted-foreground tabular-nums">
                  {landed > 0 ? `${formatNumber(landed)} ${f.landedCosts?.[0].currency}` : "—"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function ReorderRecommendations({
  dosMap,
  products,
  suppliers,
}: {
  dosMap: Map<string, number>;
  products: ReturnType<typeof useOrderableProducts>;
  suppliers: ReturnType<typeof useOrderCounterparties>;
}) {
  const recs = products.filter((p) => !p.isService && (p.stockQty < p.minStock || (Number.isFinite(dosMap.get(p.id)) && (dosMap.get(p.id) ?? 999) < 10)));
  if (recs.length === 0) return <EmptyHint text="Усі позиції в нормі." />;
  return (
    <div className="space-y-2">
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
        AI-рекомендації базуються на min-stock, ADU(28д) і даних поточних бронювань.
      </div>
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Товар</th>
              <th className="text-right px-3 py-2 font-medium">Залишок</th>
              <th className="text-right px-3 py-2 font-medium">Min</th>
              <th className="text-right px-3 py-2 font-medium">Days of stock</th>
              <th className="text-left px-3 py-2 font-medium">Постачальник</th>
              <th className="text-right px-3 py-2 font-medium">Замовити</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recs.map((p) => {
              const dos = dosMap.get(p.id);
              const sup = suppliers.find((s) => s.id === p.supplierId);
              const reorderQty = Math.max(p.minStock * 3 - p.stockQty, p.minStock);
              return (
                <tr key={p.id}>
                  <td className="px-3 py-2 truncate max-w-[280px]">{p.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.stockQty} {p.unit}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{p.minStock}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {!Number.isFinite(dos) ? <span className="text-muted-foreground">dead</span> : <span className={(dos ?? 0) < 7 ? "text-rose-600 dark:text-rose-400" : ""}>{dos} дн</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">{sup?.name ?? p.supplierName ?? "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">+{reorderQty} {p.unit}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {recs.map((p) => {
          const dos = dosMap.get(p.id);
          const sup = suppliers.find((s) => s.id === p.supplierId);
          const reorderQty = Math.max(p.minStock * 3 - p.stockQty, p.minStock);
          return (
            <div key={p.id} className="rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0">+{reorderQty} {p.unit}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="tabular-nums">Залишок <span className="text-foreground">{p.stockQty} {p.unit}</span></span>
                <span className="tabular-nums">Min {p.minStock}</span>
                <span className={(dos ?? 0) < 7 ? "tabular-nums text-rose-600 dark:text-rose-400" : "tabular-nums"}>
                  {!Number.isFinite(dos) ? "dead" : `${dos} дн`}
                </span>
                <span className="truncate">{sup?.name ?? p.supplierName ?? "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuppliersScorecard({
  topSuppliers,
  suppliers,
}: {
  topSuppliers: { supplierId: string; name: string; turnover: number; ordersCount: number }[];
  suppliers: ReturnType<typeof useOrderCounterparties>;
}) {
  return (
    <div className="space-y-2">
      {suppliers.map((s) => {
        const stat = topSuppliers.find((t) => t.supplierId === s.id);
        return (
          <div key={s.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {s.country ?? "UA"} · {s.currency}{s.defaultLeadDays ? ` · Lead time ${s.defaultLeadDays} дн` : ""}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm tabular-nums font-semibold">{stat ? formatCurrency(stat.turnover) : "—"}</div>
                <div className="text-[11px] text-muted-foreground">{stat?.ordersCount ?? 0} замовлень</div>
              </div>
            </div>
            {s.onTimePct !== undefined && (
              <div className="flex gap-3 mt-2 text-[11px]">
                <span className={s.onTimePct >= 90 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                  On-time: {s.onTimePct} %
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PriceConditions() {
  return (
    <div className="rounded-lg border bg-card p-4 text-sm space-y-2">
      <h3 className="font-semibold">Історія цін</h3>
      <p className="text-xs text-muted-foreground">
        Інтегровано з довідником номенклатури — клікніть SKU на сторінці прайсу для перегляду повної історії змін цін постачальника.
      </p>
      <p className="text-xs text-muted-foreground">
        AI-сигнал про підвищення спрацьовує, коли остання ціна перевищує попередню на 10%+.
      </p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
