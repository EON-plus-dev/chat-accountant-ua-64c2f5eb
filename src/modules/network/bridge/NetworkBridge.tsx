/**
 * NetworkBridge — слухач події `network:reorder`, що створює sale-Order
 * у store провайдера через існуючий `createOrder()`. Тригер — кнопка
 * «Замовити» з `MyPlaceDetailSheet → Каталог` у фізособи.
 *
 * Privacy: replicates `client_card_id` як `counterpartyId`, ніяких
 * персональних даних більше не передаємо.
 */
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/modules/orders/store/useOrdersStore";
import type { Order } from "@/modules/orders/types";
import { MOCK_CATALOG_PUBLICATIONS, MOCK_CATALOG_SUBSCRIPTIONS } from "@/modules/network/data/mockNetworkData";
import { useProviderCatalog } from "@/modules/network/hooks/useProviderCatalog";

interface ReorderDetail {
  subscriptionId?: string;
  publicationId?: string;
  itemId?: string;
  itemName?: string;
  price?: number;
}

export function NetworkBridge() {
  const { toast } = useToast();
  // pre-warm catalog for known publications — keeps deps minimal.
  useProviderCatalog(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ReorderDetail>).detail ?? {};
      const sub = detail.subscriptionId
        ? MOCK_CATALOG_SUBSCRIPTIONS.find((s) => s.id === detail.subscriptionId)
        : null;
      const pubId = detail.publicationId ?? sub?.publicationId;
      const pub = pubId ? MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === pubId) : null;
      if (!pub) {
        toast({ title: "Не вдалося оформити замовлення", description: "Заклад не знайдено.", variant: "destructive" });
        return;
      }

      const orderId = `net-${Date.now()}`;
      const num = `N-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const price = detail.price ?? 0;
      const order: Order = {
        id: orderId,
        cabinetId: pub.providerCabinetId,
        direction: "sale",
        number: num,
        counterpartyId: sub?.clientCardId ?? "client-network",
        counterpartyName: "Клієнт з мережі",
        currency: "UAH",
        fxRate: 1,
        status: "confirmed",
        channel: "online",
        lines: detail.itemId
          ? [{
              id: `${orderId}-l1`,
              productId: detail.itemId,
              productName: detail.itemName ?? "Позиція з каталогу",
              qty: 1,
              price,
              fulfilled: 0,
            }]
          : [],
        totals: { subtotal: price, discount: 0, tax: 0, total: price },
        notes: `[network:reorder] subscription=${sub?.id ?? "?"}`,
        createdAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
      };
      createOrder(pub.providerCabinetId, order);
      toast({
        title: `Замовлення №${num} надіслано`,
        description: `«${pub.displayName}» отримає його зараз. Слідкуйте у вкладці «Замовлення».`,
      });
    };
    window.addEventListener("network:reorder", handler);
    return () => window.removeEventListener("network:reorder", handler);
  }, [toast]);

  return null;
}
