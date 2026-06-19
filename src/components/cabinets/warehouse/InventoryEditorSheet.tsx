/**
 * InventoryEditorSheet — створення документа інвентаризації.
 * MVP: вибір локації, авто-заповнення expected з поточних залишків,
 * введення counted, авто-розрахунок delta + cost.
 */

import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { useOrderableProducts } from "@/modules/orders/data/useOrderableProducts";
import { useWarehouseLocations, useStockByLocation } from "@/modules/warehouse/store/useWarehouseStock";
import { createInventoryDoc } from "@/modules/warehouse/store/useWarehouseDocs";
import type { InventoryLine } from "@/modules/warehouse/types";

interface Props {
  cabinet: Cabinet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryEditorSheet({ cabinet, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const products = useOrderableProducts(cabinet);
  const locations = useWarehouseLocations(cabinet.id);
  const stockByLoc = useStockByLocation(cabinet.id);

  const [locationId, setLocationId] = useState<string>("");
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [responsibleName, setResponsibleName] = useState("");

  useEffect(() => {
    if (open) {
      setLocationId(locations[0]?.id ?? "");
      setCounts(new Map());
      setResponsibleName("");
    }
  }, [open, locations]);

  const rows = useMemo(() => {
    const map = stockByLoc.get(locationId) ?? new Map();
    return products
      .filter((p) => !p.isService && (map.get(p.id) ?? 0) !== 0)
      .map((p) => {
        const expected = map.get(p.id) ?? 0;
        const counted = counts.get(p.id) ?? expected;
        return { ...p, expected, counted, delta: counted - expected };
      });
  }, [products, stockByLoc, locationId, counts]);

  const totals = useMemo(() => {
    let dCost = 0;
    let changed = 0;
    for (const r of rows) {
      if (r.delta !== 0) {
        changed += 1;
        dCost += r.delta * r.cost;
      }
    }
    return { dCost, changed };
  }, [rows]);

  const setCount = (productId: string, value: number) => {
    setCounts((m) => {
      const nm = new Map(m);
      nm.set(productId, value);
      return nm;
    });
  };

  const handleSave = (confirm: boolean) => {
    if (!locationId) {
      toast({ title: "Оберіть локацію", variant: "destructive" });
      return;
    }
    const lines: InventoryLine[] = rows
      .filter((r) => r.delta !== 0)
      .map((r) => ({
        productId: r.id,
        expectedQty: r.expected,
        countedQty: r.counted,
        deltaCost: r.delta * r.cost,
      }));
    const id = `inv-${Date.now()}`;
    const now = new Date().toISOString();
    createInventoryDoc(cabinet.id, {
      id,
      cabinetId: cabinet.id,
      locationId,
      date: now,
      number: `ІНВ-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      lines,
      status: confirm ? "confirmed" : "draft",
      responsibleName: responsibleName || undefined,
      createdAt: now,
    });
    toast({
      title: confirm ? "Інвентаризацію проведено" : "Чернетку збережено",
      description: `Коригувань: ${lines.length}`,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Нова інвентаризація
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 py-3 border-b grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Локація</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Оберіть" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Відповідальний</Label>
            <Input value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} className="h-9" placeholder="ПІБ" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Товар</th>
                <th className="text-right px-3 py-2 font-medium">Очікувано</th>
                <th className="text-right px-3 py-2 font-medium">Фактично</th>
                <th className="text-right px-3 py-2 font-medium">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">{locationId ? "Залишків на локації немає" : "Оберіть локацію"}</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className={cn(r.delta !== 0 && "bg-amber-500/5")}>
                  <td className="px-3 py-1.5 truncate max-w-[280px] text-xs">{r.name}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-xs text-muted-foreground">{r.expected}</td>
                  <td className="px-3 py-1.5 text-right">
                    <Input
                      type="number"
                      value={r.counted}
                      onChange={(e) => setCount(r.id, Number(e.target.value) || 0)}
                      className="h-7 text-xs w-20 text-right ml-auto tabular-nums"
                    />
                  </td>
                  <td className={cn("px-3 py-1.5 text-right tabular-nums text-xs font-medium",
                    r.delta < 0 ? "text-rose-600" : r.delta > 0 ? "text-emerald-600" : "text-muted-foreground"
                  )}>
                    {r.delta > 0 ? "+" : ""}{r.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>

        <div className="border-t bg-muted/30 px-5 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Коригувань</span>
            <Badge variant="outline">{totals.changed}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Δ собівартості</span>
            <span className={cn("tabular-nums font-medium", totals.dCost < 0 ? "text-rose-600" : totals.dCost > 0 ? "text-emerald-600" : "")}>
              {totals.dCost > 0 ? "+" : ""}{totals.dCost.toFixed(0)} ₴
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleSave(false)}>Чернетка</Button>
            <Button className="flex-1" onClick={() => handleSave(true)} disabled={totals.changed === 0}>Провести</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
