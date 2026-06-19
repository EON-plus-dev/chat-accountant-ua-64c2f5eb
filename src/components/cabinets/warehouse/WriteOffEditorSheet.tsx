/**
 * WriteOffEditorSheet — швидке створення документа списання.
 * MVP: вибір локації, додавання позицій з ProductCombobox, причина списання.
 */

import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, FileMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { useOrderableProducts } from "@/modules/orders/data/useOrderableProducts";
import { useWarehouseLocations } from "@/modules/warehouse/store/useWarehouseStock";
import { createWriteOffDoc } from "@/modules/warehouse/store/useWarehouseDocs";
import { ProductCombobox } from "@/modules/orders/components/ProductCombobox";
import type { WriteOffReason, WriteOffLine } from "@/modules/warehouse/types";
import { formatCurrency } from "@/lib/formatters";

const REASONS: { value: WriteOffReason; label: string }[] = [
  { value: "expired", label: "Прострочено" },
  { value: "damage", label: "Пошкодження / бій" },
  { value: "theft", label: "Крадіжка" },
  { value: "internal_use", label: "Внутрішнє використання" },
  { value: "marketing", label: "Маркетинг / промо" },
  { value: "tester", label: "Тестер" },
  { value: "other", label: "Інше" },
];

interface Props {
  cabinet: Cabinet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WriteOffEditorSheet({ cabinet, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const products = useOrderableProducts(cabinet);
  const locations = useWarehouseLocations(cabinet.id);

  const [locationId, setLocationId] = useState<string>("");
  const [lines, setLines] = useState<WriteOffLine[]>([]);
  const [responsibleName, setResponsibleName] = useState("");

  useEffect(() => {
    if (open) {
      setLocationId(locations[0]?.id ?? "");
      setLines([]);
      setResponsibleName("");
    }
  }, [open, locations]);

  const total = useMemo(() => {
    return lines.reduce((s, l) => {
      const p = products.find((x) => x.id === l.productId);
      return s + l.qty * (p?.cost ?? 0);
    }, 0);
  }, [lines, products]);

  const addLine = () => {
    setLines((a) => [...a, { productId: "", qty: 1, reason: "damage" }]);
  };
  const updateLine = (idx: number, patch: Partial<WriteOffLine>) => {
    setLines((a) => a.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };
  const removeLine = (idx: number) => setLines((a) => a.filter((_, i) => i !== idx));

  const handleSave = (confirm: boolean) => {
    if (!locationId) {
      toast({ title: "Оберіть локацію", variant: "destructive" });
      return;
    }
    if (lines.length === 0 || lines.some((l) => !l.productId || l.qty <= 0)) {
      toast({ title: "Додайте позиції", variant: "destructive" });
      return;
    }
    const id = `wo-${Date.now()}`;
    const now = new Date().toISOString();
    createWriteOffDoc(cabinet.id, {
      id,
      cabinetId: cabinet.id,
      locationId,
      date: now,
      number: `СП-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
      lines,
      totalCost: total,
      expensePosted: confirm,
      status: confirm ? "confirmed" : "draft",
      responsibleName: responsibleName || undefined,
      createdAt: now,
    });
    toast({
      title: confirm ? "Списання проведено" : "Чернетку збережено",
      description: `${formatCurrency(total)} зі складу`,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <FileMinus className="w-4 h-4 text-primary" />
            Нове списання
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Локація</Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Оберіть локацію" /></SelectTrigger>
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

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Позиції</Label>
              <Button size="sm" variant="outline" onClick={addLine} className="h-7 gap-1 text-xs">
                <Plus className="w-3 h-3" /> Додати
              </Button>
            </div>

            {lines.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                <p className="text-xs text-muted-foreground">Додайте позиції для списання</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lines.map((l, idx) => (
                  <div key={idx} className="rounded-lg border bg-card p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <ProductCombobox items={products} value={l.productId} onChange={(id) => updateLine(idx, { productId: id })} />
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-rose-600" onClick={() => removeLine(idx)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">К-сть</Label>
                        <Input type="number" min="0" value={l.qty} onChange={(e) => updateLine(idx, { qty: Number(e.target.value) || 0 })} className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Причина</Label>
                        <Select value={l.reason} onValueChange={(v) => updateLine(idx, { reason: v as WriteOffReason })}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-muted/30 px-5 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Сума списання (собівартість)</span>
            <span className="tabular-nums font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => handleSave(false)}>Чернетка</Button>
            <Button className="flex-1" onClick={() => handleSave(true)}>Провести</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
