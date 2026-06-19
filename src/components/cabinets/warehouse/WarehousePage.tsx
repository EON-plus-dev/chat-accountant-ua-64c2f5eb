/**
 * WarehousePage — повноцінний рендер табу «Склад».
 * 4 секції: Залишки (по локаціях) / Журнал рухів / Списання / Інвентаризації.
 *
 * Замінює статичний `demoRecords`-stub у operationsConfig.ts.
 */

import { useMemo, useState } from "react";
import { Truck, AlertTriangle, TrendingDown, PackageOpen, Plus, FileMinus, ClipboardList, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import type { Cabinet } from "@/types/cabinet";
import {
  useWarehouseMoves,
  useWarehouseLocations,
  useStockByLocation,
} from "@/modules/warehouse/store/useWarehouseStock";
import { useWriteOffs, useInventories } from "@/modules/warehouse/store/useWarehouseDocs";
import { useOrderableProducts } from "@/modules/orders/data/useOrderableProducts";
import type { StockMoveKind } from "@/modules/warehouse/types";
import { WriteOffEditorSheet } from "./WriteOffEditorSheet";
import { InventoryEditorSheet } from "./InventoryEditorSheet";

const MOVE_LABEL: Record<StockMoveKind, string> = {
  receipt: "Прихід",
  shipment: "Відвантаж.",
  prro_sale: "ПРРО-продаж",
  writeoff: "Списання",
  transfer_out: "Переміщ. з",
  transfer_in: "Переміщ. в",
  inventory_adj: "Інв. коригув.",
  return_in: "Поверн. від клієнта",
  return_out: "Поверн. постачальнику",
};

interface Props {
  cabinet: Cabinet;
}

export function WarehousePage({ cabinet }: Props) {
  const locations = useWarehouseLocations(cabinet.id);
  const products = useOrderableProducts(cabinet);
  const moves = useWarehouseMoves(cabinet.id);
  const stockByLoc = useStockByLocation(cabinet.id);
  const writeoffs = useWriteOffs(cabinet.id);
  const inventories = useInventories(cabinet.id);

  const [woOpen, setWoOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);

  // KPI
  const kpi = useMemo(() => {
    let totalValue = 0;
    let critical = 0;
    let dosLow = 0;
    for (const p of products) {
      const v = p.stockQty * p.cost;
      totalValue += v;
      if (p.stockQty <= 0 || p.stockQty < p.minStock) critical += 1;
    }
    // Days of stock — спрощено: продукти з ADU=0 і stockQty>0 → dead
    // (детальні розрахунки — у usePurchasesKpis)
    const m30 = Date.now() - 30 * 86_400_000;
    const moves30 = moves.filter((m) => new Date(m.date).getTime() >= m30 && m.qty < 0);
    return { totalValue, critical, moves30: moves30.length, dosLow };
  }, [products, moves]);

  const kpiItems: KPIStripItem[] = [
    { id: "value", title: "Вартість залишків", value: formatCurrency(kpi.totalValue), icon: PackageOpen },
    { id: "crit", title: "Критичних SKU", value: String(kpi.critical), icon: AlertTriangle, variant: kpi.critical > 0 ? "warning" : "default" },
    { id: "moves", title: "Рухів за 30 днів", value: String(kpi.moves30), icon: Truck },
    { id: "loc", title: "Локацій", value: String(locations.length), icon: MapPin },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Склад</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Залишки по локаціях, журнал рухів, списання та інвентаризації. Усі рухи генеруються з прийому товару (Закупки), ПРРО-чеків і документів складу.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setWoOpen(true)} className="gap-1.5">
            <FileMinus className="w-3.5 h-3.5" /> Нове списання
          </Button>
          <Button size="sm" onClick={() => setInvOpen(true)} className="gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Нова інвентаризація
          </Button>
        </div>
      </header>

      <KPIStrip items={kpiItems} ariaLabel="KPI складу" />

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger value="stock" className="text-xs">Залишки</TabsTrigger>
          <TabsTrigger value="moves" className="text-xs">Журнал рухів</TabsTrigger>
          <TabsTrigger value="writeoffs" className="text-xs">Списання ({writeoffs.length})</TabsTrigger>
          <TabsTrigger value="inv" className="text-xs">Інвентаризації ({inventories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-3">
          <StockTable products={products} stockByLoc={stockByLoc} locations={locations} />
        </TabsContent>

        <TabsContent value="moves" className="space-y-3">
          <MovesTable
            moves={moves.slice(0, 200)}
            products={products}
            locations={locations}
          />
        </TabsContent>

        <TabsContent value="writeoffs" className="space-y-3">
          <WriteOffsTable docs={writeoffs} products={products} locations={locations} />
        </TabsContent>

        <TabsContent value="inv" className="space-y-3">
          <InventoriesTable docs={inventories} products={products} locations={locations} />
        </TabsContent>
      </Tabs>

      <WriteOffEditorSheet
        cabinet={cabinet}
        open={woOpen}
        onOpenChange={setWoOpen}
      />
      <InventoryEditorSheet
        cabinet={cabinet}
        open={invOpen}
        onOpenChange={setInvOpen}
      />
    </div>
  );
}

// ─────────────────────── sub-components ───────────────────────

function StockTable({
  products,
  stockByLoc,
  locations,
}: {
  products: ReturnType<typeof useOrderableProducts>;
  stockByLoc: Map<string, Map<string, number>>;
  locations: ReturnType<typeof useWarehouseLocations>;
}) {
  const [locFilter, setLocFilter] = useState<string>("__all__");

  const rows = useMemo(() => {
    return products
      .filter((p) => !p.isService)
      .map((p) => {
        const byLoc: Record<string, number> = {};
        for (const l of locations) {
          byLoc[l.id] = stockByLoc.get(l.id)?.get(p.id) ?? 0;
        }
        const total = Object.values(byLoc).reduce((s, x) => s + x, 0);
        return { ...p, byLoc, total };
      })
      .filter((r) => {
        if (locFilter === "__all__") return true;
        return (r.byLoc[locFilter] ?? 0) !== 0;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, stockByLoc, locations, locFilter]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={locFilter} onValueChange={setLocFilter}>
          <SelectTrigger className="h-8 w-[220px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Усі локації</SelectItem>
            {locations.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">SKU</th>
              <th className="text-left px-3 py-2 font-medium">Товар</th>
              {locations.map((l) => (
                <th key={l.id} className="text-right px-3 py-2 font-medium">{l.name}</th>
              ))}
              <th className="text-right px-3 py-2 font-medium">Всього</th>
              <th className="text-right px-3 py-2 font-medium">Min</th>
              <th className="text-right px-3 py-2 font-medium">Вартість</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr><td colSpan={5 + locations.length} className="p-8 text-center text-sm text-muted-foreground">Залишків немає</td></tr>
            ) : rows.map((r) => {
              const isLow = r.total < r.minStock || r.total <= 0;
              return (
                <tr key={r.id} className={cn("hover:bg-muted/30", isLow && "bg-amber-500/5")}>
                  <td className="px-3 py-2 text-[11px] font-mono text-muted-foreground">{r.sku}</td>
                  <td className="px-3 py-2 truncate max-w-[260px]">{r.name}</td>
                  {locations.map((l) => (
                    <td key={l.id} className="px-3 py-2 text-right tabular-nums">{r.byLoc[l.id]} {r.unit}</td>
                  ))}
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{r.total} {r.unit}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.minStock}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-xs">{formatCurrency(r.total * r.cost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MovesTable({
  moves,
  products,
  locations,
}: {
  moves: ReturnType<typeof useWarehouseMoves>;
  products: ReturnType<typeof useOrderableProducts>;
  locations: ReturnType<typeof useWarehouseLocations>;
}) {
  if (moves.length === 0) {
    return <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">Рухів поки немає</div>;
  }
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="text-left px-3 py-2 font-medium">Дата</th>
            <th className="text-left px-3 py-2 font-medium">Тип</th>
            <th className="text-left px-3 py-2 font-medium">Товар</th>
            <th className="text-left px-3 py-2 font-medium">Локація</th>
            <th className="text-right px-3 py-2 font-medium">К-сть</th>
            <th className="text-right px-3 py-2 font-medium">Собівартість</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {moves.map((m) => {
            const p = products.find((x) => x.id === m.productId);
            const l = locations.find((x) => x.id === m.locationId);
            const positive = m.qty > 0;
            return (
              <tr key={m.id}>
                <td className="px-3 py-2 text-xs tabular-nums">{new Date(m.date).toLocaleDateString("uk-UA")}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="text-[10px]">{MOVE_LABEL[m.kind]}</Badge>
                </td>
                <td className="px-3 py-2 truncate max-w-[240px]">{p?.name ?? m.productId}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{l?.name ?? m.locationId}</td>
                <td className={cn("px-3 py-2 text-right tabular-nums font-medium", positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {positive ? "+" : ""}{m.qty}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-xs text-muted-foreground">
                  {m.costPerUnit ? formatNumber(m.costPerUnit) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WriteOffsTable({
  docs,
  products,
  locations,
}: {
  docs: ReturnType<typeof useWriteOffs>;
  products: ReturnType<typeof useOrderableProducts>;
  locations: ReturnType<typeof useWarehouseLocations>;
}) {
  if (docs.length === 0) return <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">Списань поки немає</div>;
  return (
    <div className="space-y-2">
      {docs.map((d) => {
        const l = locations.find((x) => x.id === d.locationId);
        return (
          <div key={d.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm">{d.number} <span className="text-muted-foreground font-normal">· {l?.name}</span></div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(d.date).toLocaleDateString("uk-UA")} · {d.responsibleName ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">{formatCurrency(d.totalCost)}</div>
                <Badge variant="outline" className="text-[10px] mt-0.5">{d.lines.length} поз.</Badge>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground space-y-0.5">
              {d.lines.map((ln, i) => {
                const p = products.find((x) => x.id === ln.productId);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <span className="truncate">{p?.name ?? ln.productId} <span className="opacity-60">({ln.reason})</span></span>
                    <span className="tabular-nums">{ln.qty} {p?.unit ?? "од"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InventoriesTable({
  docs,
  products,
  locations,
}: {
  docs: ReturnType<typeof useInventories>;
  products: ReturnType<typeof useOrderableProducts>;
  locations: ReturnType<typeof useWarehouseLocations>;
}) {
  if (docs.length === 0) return <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">Інвентаризацій поки немає</div>;
  return (
    <div className="space-y-2">
      {docs.map((d) => {
        const l = locations.find((x) => x.id === d.locationId);
        const totalDelta = d.lines.reduce((s, ln) => s + (ln.countedQty - ln.expectedQty), 0);
        return (
          <div key={d.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm">{d.number} <span className="text-muted-foreground font-normal">· {l?.name}</span></div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(d.date).toLocaleDateString("uk-UA")} · {d.responsibleName ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={cn("text-[10px]", totalDelta < 0 ? "text-rose-600 border-rose-500/30" : totalDelta > 0 ? "text-emerald-600 border-emerald-500/30" : "")}>
                  Δ {totalDelta > 0 ? "+" : ""}{totalDelta}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
