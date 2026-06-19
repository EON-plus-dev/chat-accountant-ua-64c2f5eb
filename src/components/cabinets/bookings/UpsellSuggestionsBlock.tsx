/**
 * UpsellSuggestionsBlock — inline-блок у деталі бронювання з рекомендаціями
 * товарів-допродажів за категорією послуги. Створює SO з channel="upsell_visit".
 *
 * Не окрема сторінка — це частина чекауту візиту.
 */

import { ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { SALON_PRODUCTS } from "@/config/demoCabinets/salonOrdersData";
import { createOrder } from "@/modules/orders/store/useOrdersStore";

interface Props {
  cabinetId: string;
  bookingId: string;
  clientId: string;
  clientName: string;
  /** Категорії послуг візиту — для фільтра релевантних товарів. */
  serviceCategories: string[];
}

type ProductCategory = "color" | "hair_care" | "nails" | "skin" | "tools";

const CAT_TO_PRODUCT: Record<string, ProductCategory[]> = {
  hair: ["hair_care"],
  nails: ["nails"],
  massage: ["skin"],
  spa: ["skin"],
  brows: ["skin"],
};

export function UpsellSuggestionsBlock({ cabinetId, bookingId, clientId, clientName, serviceCategories }: Props) {
  const { toast } = useToast();

  const targetCats = new Set<ProductCategory>(serviceCategories.flatMap((c) => CAT_TO_PRODUCT[c] ?? []));
  const recs = SALON_PRODUCTS.filter((p) => p.isRetail && targetCats.has(p.category as ProductCategory)).slice(0, 3);

  if (recs.length === 0) return null;

  const handleAdd = (productId: string) => {
    const p = SALON_PRODUCTS.find((x) => x.id === productId)!;
    const id = `so-up-${Date.now().toString(36)}`;
    const number = `SO-UP-${id.slice(-6).toUpperCase()}`;
    createOrder(cabinetId, {
      id,
      cabinetId,
      direction: "sale",
      number,
      counterpartyId: clientId,
      counterpartyName: clientName,
      currency: "UAH",
      fxRate: 1,
      status: "confirmed",
      channel: "upsell_visit",
      lines: [{
        id: `${id}-l1`,
        productId: p.id,
        productName: p.name,
        qty: 1,
        price: p.retailPrice,
        fulfilled: 1,
        costBasis: p.baseCost,
      }],
      totals: { subtotal: p.retailPrice, discount: 0, tax: 0, total: p.retailPrice, margin: p.retailPrice - p.baseCost },
      linkedBookingId: bookingId,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    });
    toast({
      title: "Додано до візиту",
      description: `${p.name} · ${formatCurrency(p.retailPrice)} → канал «Допродаж на візиті».`,
    });
  };

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <h4 className="text-sm font-medium">AI-рекомендації допродажів</h4>
        <Badge variant="outline" className="text-[9px]">upsell_visit</Badge>
      </div>
      <ul className="space-y-1.5">
        {recs.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 rounded-md bg-card border px-2.5 py-1.5">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{p.name}</div>
              <div className="text-[10px] text-muted-foreground tabular-nums">{formatCurrency(p.retailPrice)}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleAdd(p.id)} className="h-7 gap-1 text-xs">
              <Plus className="w-3 h-3" /> Додати
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
