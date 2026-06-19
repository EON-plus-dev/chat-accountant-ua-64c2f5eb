import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Tag, Check, Truck } from "lucide-react";
import { useCartStore, selectCartCount, selectCartTotal } from "@/personal/cart/cartStore";
import { fmtUah, BrandLogo } from "@/components/cabinets/orders/_primitives";
import { useToast } from "@/hooks/use-toast";

const FREE_SHIPPING_FROM = 1500;
const FLAT_SHIPPING = 70;
const VALID_PROMOS: Record<string, number> = { FINTODO10: 0.1, NP500: 0.05 };

export function CartSheet() {
  const { items, isCartOpen, closeCart, setQty, remove, openCheckout } = useCartStore();
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartTotal);
  const { toast } = useToast();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);

  const discountRate = promo ? VALID_PROMOS[promo] ?? 0 : 0;
  const discount = Math.round(subtotal * discountRate);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_FROM ? 0 : FLAT_SHIPPING;
  const total = Math.max(0, subtotal - discount + shipping);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setPromo(code);
      toast({ title: "Промокод застосовано", description: `Знижка ${Math.round(VALID_PROMOS[code] * 100)}%` });
    } else {
      toast({ title: "Невірний код", description: "Спробуйте FINTODO10", variant: "destructive" });
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={(v) => !v && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Кошик {count > 0 && <span className="text-xs text-muted-foreground">· {count}</span>}
          </SheetTitle>
          <SheetDescription>Перевірте товари перед оформленням</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-12">
              Кошик порожній
            </div>
          ) : (
            items.map((it) => (
              <div key={it.productId} className="flex gap-3 items-start border-b last:border-0 pb-3">
                <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xl shrink-0">
                  {it.emoji ?? <BrandLogo brand={it.vendor} size={32} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium line-clamp-2">{it.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{it.vendor}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-6 w-6"
                        onClick={() => setQty(it.productId, it.qty - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-xs w-6 text-center tabular-nums">{it.qty}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6"
                        onClick={() => setQty(it.productId, it.qty + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {fmtUah(it.priceUah * it.qty)}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600"
                  onClick={() => remove(it.productId)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="pt-2">
              {promo ? (
                <div className="flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> {promo} · −{Math.round(discountRate * 100)}%
                  </span>
                  <button className="text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => { setPromo(null); setPromoInput(""); }}>
                    Скасувати
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={promoInput} onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Промокод (FINTODO10)" className="h-9 pl-8 text-xs" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9" onClick={applyPromo}
                    disabled={!promoInput.trim()}>Застосувати</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Сума</span>
              <span className="tabular-nums">{fmtUah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Знижка</span>
                <span className="tabular-nums">−{fmtUah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Truck className="w-3 h-3" /> Доставка
              </span>
              {shipping === 0 ? (
                <span className="text-emerald-600">Безкоштовно</span>
              ) : (
                <span className="tabular-nums">{fmtUah(shipping)}</span>
              )}
            </div>
            {shipping > 0 && (
              <div className="text-[11px] text-muted-foreground">
                Додайте товарів на {fmtUah(FREE_SHIPPING_FROM - subtotal)} — і доставка безкоштовна
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-baseline">
              <span className="text-sm">Разом</span>
              <span className="text-lg font-bold tabular-nums">{fmtUah(total)}</span>
            </div>
            <Button className="w-full" onClick={openCheckout}>
              Оформити замовлення
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
