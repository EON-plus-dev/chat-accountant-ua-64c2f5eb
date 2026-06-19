/**
 * OrderEditorSheet — універсальний редактор Order (sale/purchase).
 * Фаза 2 плану: «Новий рахунок» / «Нове замовлення» → відкриває цей Sheet.
 *
 * MVP-обсяг:
 *   • Контрагент через Combobox з useOrderCounterparties
 *   • Лінії товарів через ProductCombobox (useOrderableProducts)
 *   • Кількість + ціна + знижка% (1 ставка ПДВ)
 *   • Автоматичний номер, дата, валюта (UAH дефолт)
 *   • «Зберегти чернетку» / «Підтвердити»
 *   • Policy Engine info (без блокування — лише попередження)
 *
 * Поза скоупом MVP: інлайн-створення SKU/контрагента, multi-currency з fx-snapshot,
 * детальний approval flow (вкладається у `requiresApproval`).
 */

import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ShoppingCart, PackagePlus, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import type { Cabinet } from "@/types/cabinet";
import type { Order, OrderDirection, OrderLine } from "../types";
import { createOrder } from "../store/useOrdersStore";
import { useOrderableProducts } from "../data/useOrderableProducts";
import { useOrderCounterparties } from "../data/useOrderCounterparties";
import { CounterpartyCombobox } from "./CounterpartyCombobox";
import { ProductCombobox } from "./ProductCombobox";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface Props {
  cabinet: Cabinet;
  direction: OrderDirection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Якщо створення з контексту майстра — preset. */
  presets?: {
    counterpartyId?: string;
    linkedBookingId?: string;
    submittedByMasterId?: string;
    requiresApproval?: boolean;
  };
  onCreated?: (order: Order) => void;
}

interface DraftLine extends Omit<OrderLine, "fulfilled"> {}

function nextOrderNumber(direction: OrderDirection): string {
  const prefix = direction === "sale" ? "РФ" : "ЗП";
  const seq = Math.floor(1000 + Math.random() * 8999);
  return `${prefix}-${new Date().getFullYear()}/${seq}`;
}

export function OrderEditorSheet({
  cabinet,
  direction,
  open,
  onOpenChange,
  presets,
  onCreated,
}: Props) {
  const { toast } = useToast();
  const products = useOrderableProducts(cabinet);
  const counterparties = useOrderCounterparties(cabinet, direction);

  const [counterpartyId, setCounterpartyId] = useState<string>(presets?.counterpartyId ?? "");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setCounterpartyId(presets?.counterpartyId ?? "");
      setLines([]);
      setNotes("");
    }
  }, [open, presets?.counterpartyId]);

  const counterparty = counterparties.find((c) => c.id === counterpartyId);

  const totals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let margin = 0;
    for (const l of lines) {
      const gross = l.qty * l.price;
      const dsc = (gross * (l.discount ?? 0)) / 100;
      subtotal += gross;
      discount += dsc;
      const cost = (l.costBasis ?? 0) * l.qty;
      margin += gross - dsc - cost;
    }
    return { subtotal, discount, total: subtotal - discount, margin };
  }, [lines]);

  const addLine = () => {
    setLines((arr) => [
      ...arr,
      {
        id: `l-${Date.now()}-${arr.length}`,
        productId: "",
        productName: "",
        qty: 1,
        price: 0,
        discount: 0,
      },
    ]);
  };

  const updateLine = (idx: number, patch: Partial<DraftLine>) => {
    setLines((arr) => arr.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const removeLine = (idx: number) => {
    setLines((arr) => arr.filter((_, i) => i !== idx));
  };

  const pickProduct = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    updateLine(idx, {
      productId: p.id,
      productName: p.name,
      price: direction === "sale" ? p.price : p.cost,
      costBasis: p.cost,
    });
  };

  // Policy engine — спрощено: для sale > 10 000 → попередження
  const policyWarnings: string[] = [];
  if (direction === "sale" && totals.total > 10000) {
    policyWarnings.push("Сума > 10 000 ₴ — потрібне підтвердження власника");
  }
  if (presets?.requiresApproval) {
    policyWarnings.push("Замовлення створюється майстром — піде в чергу затвердження власника");
  }
  for (const l of lines) {
    if ((l.discount ?? 0) > 30) {
      policyWarnings.push(`Знижка ${l.discount}% перевищує ліміт 30%`);
      break;
    }
  }

  const handleSave = (asDraft: boolean) => {
    if (!counterparty) {
      toast({ title: "Оберіть контрагента", variant: "destructive" });
      return;
    }
    if (lines.length === 0 || lines.some((l) => !l.productId || l.qty <= 0)) {
      toast({ title: "Додайте позиції", description: "Перевірте товари і к-сть", variant: "destructive" });
      return;
    }
    const orderId = `ord-${Date.now()}`;
    const now = new Date().toISOString();
    const status = asDraft ? "draft" : presets?.requiresApproval ? "draft" : "confirmed";
    const order: Order = {
      id: orderId,
      cabinetId: cabinet.id,
      direction,
      number: nextOrderNumber(direction),
      counterpartyId: counterparty.id,
      counterpartyName: counterparty.name,
      currency: counterparty.currency,
      fxRate: counterparty.currency === "UAH" ? 1 : 40,
      status,
      channel: direction === "sale" ? "b2b" : undefined,
      lines: lines.map((l) => ({ ...l, fulfilled: 0 })),
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: 0,
        total: totals.total,
        margin: direction === "sale" ? totals.margin : undefined,
      },
      linkedBookingId: presets?.linkedBookingId,
      ownerUserId: presets?.submittedByMasterId,
      expectedAt: undefined,
      notes,
      createdAt: now,
      confirmedAt: !asDraft && !presets?.requiresApproval ? now : undefined,
    };
    createOrder(cabinet.id, order);
    onCreated?.(order);
    toast({
      title: asDraft ? "Чернетку збережено" : presets?.requiresApproval ? "Чернетка передана власнику" : "Замовлення підтверджено",
      description: `${order.number} · ${formatCurrency(totals.total)}`,
    });
    onOpenChange(false);
  };

  const Icon = direction === "sale" ? ShoppingCart : PackagePlus;
  const title = direction === "sale" ? "Новий рахунок (продаж)" : "Нове замовлення постачальнику";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            {title}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Контрагент */}
            <div className="space-y-1.5">
              <Label className="text-xs">{direction === "sale" ? "Клієнт" : "Постачальник"}</Label>
              <CounterpartyCombobox
                items={counterparties}
                value={counterpartyId}
                onChange={setCounterpartyId}
                direction={direction}
              />
              {counterparty && counterparty.currency !== "UAH" && (
                <p className="text-[11px] text-muted-foreground">
                  Валюта: {counterparty.currency} · курс буде зафіксовано при підтвердженні
                </p>
              )}
            </div>

            <Separator />

            {/* Позиції */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Позиції</Label>
                <Button size="sm" variant="outline" onClick={addLine} className="h-7 gap-1 text-xs">
                  <Plus className="w-3 h-3" /> Додати позицію
                </Button>
              </div>

              {lines.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                  <p className="text-xs text-muted-foreground">Натисніть «Додати позицію» щоб обрати товар</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lines.map((l, idx) => (
                    <div key={l.id} className="rounded-lg border bg-card p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <ProductCombobox
                            items={products}
                            value={l.productId}
                            onChange={(id) => pickProduct(idx, id)}
                          />
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          onClick={() => removeLine(idx)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">К-сть</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={l.qty}
                            onChange={(e) => updateLine(idx, { qty: Number(e.target.value) || 0 })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Ціна</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.price}
                            onChange={(e) => updateLine(idx, { price: Number(e.target.value) || 0 })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Знижка %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={l.discount ?? 0}
                            onChange={(e) => updateLine(idx, { discount: Number(e.target.value) || 0 })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Підсумок</span>
                        <span className="tabular-nums font-medium">
                          {formatCurrency(l.qty * l.price * (1 - (l.discount ?? 0) / 100))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Нотатки */}
            <div className="space-y-1.5">
              <Label className="text-xs">Нотатки (необов'язково)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-9" />
            </div>

            {/* Policy warnings */}
            {policyWarnings.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="w-3.5 h-3.5" /> Перевірка політик
                </div>
                {policyWarnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-700/80 dark:text-amber-400/80 pl-5">• {w}</p>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-muted/30 px-5 py-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Без знижки</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Знижка</span>
              <span className="tabular-nums text-rose-600">−{formatCurrency(totals.discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-base font-semibold">
            <span>До сплати</span>
            <span className="tabular-nums">{formatCurrency(totals.total)}</span>
          </div>
          {direction === "sale" && totals.margin > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Маржа</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                {formatCurrency(totals.margin)}
              </Badge>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => handleSave(true)}>
              Зберегти чернетку
            </Button>
            <Button className="flex-1" onClick={() => handleSave(false)}>
              {presets?.requiresApproval ? "Відправити на затвердження" : "Підтвердити"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
