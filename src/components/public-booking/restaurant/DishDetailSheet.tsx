/**
 * Детальна шторка страви — світовий рівень (Wolt / Deliveroo стиль).
 * Велике фото, повний опис, інгредієнти, алергени, дієтичні теги,
 * модифікатори (прожарка, додатковий сир, молоко), нотатка, qty + CTA.
 */

import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Clock, Flame, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DishVisual,
  DIETARY_META,
  ALLERGEN_META,
  type EnrichedMenuItem,
} from "./dishVisuals";

export interface CartLine {
  /** Унікальний id у кошику (item.id + хеш опцій) */
  key: string;
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;   // price + сума priceDelta
  basePrice: number;
  modifierSummary: { optionId: string; label: string; priceDelta: number; modifierId: string }[];
  note?: string;
  imageUrl?: string;
}

interface Props {
  item: EnrichedMenuItem | null;
  accent: string;
  open: boolean;
  onClose: () => void;
  onAdd: (line: CartLine) => void;
}

export function DishDetailSheet({ item, accent, open, onClose, onAdd }: Props) {
  // selectedOptions[modifierId] = optionId або optionId[] для multi
  const [selected, setSelected] = useState<Record<string, string | string[]>>({});
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item && open) {
      // дефолти: для required беремо першу опцію
      const init: Record<string, string | string[]> = {};
      item.modifiers?.forEach((m) => {
        if (m.required && !m.multi) init[m.id] = m.options[0].id;
        if (m.multi) init[m.id] = [];
      });
      setSelected(init);
      setNote("");
      setQty(1);
    }
  }, [item, open]);

  const totals = useMemo(() => {
    if (!item) return { unit: 0, total: 0, summary: [] as CartLine["modifierSummary"] };
    let delta = 0;
    const summary: CartLine["modifierSummary"] = [];
    item.modifiers?.forEach((m) => {
      const v = selected[m.id];
      if (!v) return;
      if (Array.isArray(v)) {
        v.forEach((optId) => {
          const opt = m.options.find((o) => o.id === optId);
          if (opt) {
            delta += opt.priceDelta ?? 0;
            summary.push({ modifierId: m.id, optionId: opt.id, label: opt.label, priceDelta: opt.priceDelta ?? 0 });
          }
        });
      } else {
        const opt = m.options.find((o) => o.id === v);
        if (opt) {
          delta += opt.priceDelta ?? 0;
          summary.push({ modifierId: m.id, optionId: opt.id, label: opt.label, priceDelta: opt.priceDelta ?? 0 });
        }
      }
    });
    const unit = item.price + delta;
    return { unit, total: unit * qty, summary };
  }, [item, selected, qty]);

  if (!item) return null;

  const requiredMissing = item.modifiers?.some(
    (m) => m.required && !m.multi && !selected[m.id],
  );

  const submit = () => {
    onAdd({
      key: `${item.id}-${JSON.stringify(selected)}-${note}`.slice(0, 80),
      itemId: item.id,
      name: item.name,
      qty,
      unitPrice: totals.unit,
      basePrice: item.price,
      modifierSummary: totals.summary,
      note: note.trim() || undefined,
      imageUrl: item.imageUrl,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="p-0 max-h-[92dvh] overflow-hidden flex flex-col rounded-t-2xl border-t-0 sm:max-w-xl sm:mx-auto"
      >
        {/* Hero фото */}
        <div className="relative h-56 md:h-72 shrink-0 bg-muted">
          <DishVisual item={item} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60"
            aria-label="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              {item.chefPick && (
                <Badge style={{ background: accent }} className="text-white border-0 text-[10px]">
                  ⭐ Вибір шефа
                </Badge>
              )}
              {item.popular && (
                <Badge className="bg-white/20 backdrop-blur-md text-white border-0 text-[10px]">
                  🔥 Популярне
                </Badge>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold drop-shadow leading-tight">{item.name}</h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {/* Meta strip */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            {item.weight && <span className="font-medium">{item.weight} {item.unit}</span>}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {item.prepTimeMin} хв
            </span>
            <span>{item.calories} ккал</span>
            {item.spicy > 0 && (
              <span className="inline-flex items-center gap-0.5 text-orange-600">
                {Array.from({ length: item.spicy }).map((_, i) => (
                  <Flame key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="ml-1 text-xs">
                  {item.spicy === 1 ? "Помірно гостра" : item.spicy === 2 ? "Гостра" : "Дуже гостра"}
                </span>
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-sm leading-relaxed text-foreground/90">{item.description}</p>
          )}

          {/* Дієтичні теги */}
          {item.dietary.length > 0 && (
            <div>
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">Підходить</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.dietary.map((d) => {
                  const meta = DIETARY_META[d];
                  return (
                    <Badge
                      key={d}
                      variant="outline"
                      className="text-xs gap-1 py-0.5 px-2"
                      style={{ borderColor: meta.color, color: meta.color }}
                    >
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Інгредієнти */}
          {item.ingredients.length > 0 && (
            <div>
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">Інгредієнти</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs rounded-full bg-muted px-2.5 py-1 text-foreground/80"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Алергени */}
          {item.allergens.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Може містити алергени
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.allergens.map((a) => {
                      const meta = ALLERGEN_META[a] ?? { emoji: "⚠", label: a };
                      return (
                        <span
                          key={a}
                          className="text-[11px] rounded-full bg-white dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 px-2 py-0.5 inline-flex items-center gap-1"
                        >
                          <span>{meta.emoji}</span>
                          <span>{meta.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Модифікатори */}
          {item.modifiers?.map((m) => (
            <div key={m.id}>
              <div className="flex items-baseline justify-between mb-1.5">
                <Label className="text-sm font-semibold">
                  {m.label}
                  {m.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {!m.required && (
                  <span className="text-[11px] text-muted-foreground">за бажанням</span>
                )}
              </div>
              <div className="space-y-1.5">
                {m.options.map((opt) => {
                  const active = m.multi
                    ? Array.isArray(selected[m.id]) && (selected[m.id] as string[]).includes(opt.id)
                    : selected[m.id] === opt.id;
                  const toggle = () => {
                    if (m.multi) {
                      const cur = (selected[m.id] as string[]) || [];
                      setSelected({
                        ...selected,
                        [m.id]: active ? cur.filter((x) => x !== opt.id) : [...cur, opt.id],
                      });
                    } else {
                      setSelected({ ...selected, [m.id]: opt.id });
                    }
                  };
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={toggle}
                      className={cn(
                        "w-full text-left rounded-lg border p-2.5 flex items-center justify-between gap-2 transition-colors",
                        active ? "bg-muted" : "hover:bg-muted/50",
                      )}
                      style={active ? { borderColor: accent } : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "w-4 h-4 shrink-0 flex items-center justify-center",
                            m.multi ? "rounded" : "rounded-full",
                            "border-2",
                          )}
                          style={{
                            borderColor: active ? accent : "hsl(var(--muted-foreground))",
                            background: active ? accent : "transparent",
                          }}
                        >
                          {active && (
                            <span
                              className={cn(
                                "block bg-white",
                                m.multi ? "w-2 h-2 rounded-[1px]" : "w-1.5 h-1.5 rounded-full",
                              )}
                            />
                          )}
                        </span>
                        <span className="text-sm font-medium truncate">{opt.label}</span>
                      </div>
                      {(opt.priceDelta ?? 0) !== 0 && (
                        <span className="text-xs tabular-nums shrink-0 font-semibold text-foreground/80">
                          +{opt.priceDelta} ₴
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Note */}
          <div>
            <Label className="text-sm font-semibold mb-1.5 block">
              Особливі побажання
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Наприклад: «без цибулі», «гарніром — рис, не картопля»"
              rows={2}
              className="text-sm resize-none"
              maxLength={200}
            />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t bg-card p-3 md:p-4 flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center gap-1 rounded-full border bg-card">
            <Button
              size="sm"
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-base font-semibold w-6 text-center tabular-nums">{qty}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-10 w-10 p-0 rounded-full"
              onClick={() => setQty(qty + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            className="flex-1 h-11 text-white"
            disabled={requiredMissing}
            onClick={submit}
            style={{ background: requiredMissing ? "hsl(var(--muted))" : accent }}
          >
            Додати · {totals.total.toLocaleString("uk-UA")} ₴
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
