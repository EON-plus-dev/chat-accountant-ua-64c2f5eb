/**
 * RESTAURANT ORDERS demo seed (demo-restaurant-3).
 * Прості Sale-замовлення (dine-in/takeaway/delivery) і кілька закупівель.
 * Зберігаємо канал у `notes` через префікс `[dine_in]` / `[takeaway]` / `[delivery]`
 * щоб не розширювати core-тип Order.
 */

import type { Order, Fulfillment } from "@/modules/orders/types";
import { restaurantMenu, restaurantClients, restaurantContractors } from "./restaurantData";
import { getDateInPast } from "./helpers";

const CABINET = "demo-restaurant-3";

function pickMenu(ids: string[]) {
  return ids
    .map((id) => restaurantMenu.find((m) => m.id === id))
    .filter(Boolean) as typeof restaurantMenu;
}

function mkSaleOrder(
  num: string,
  daysAgo: number,
  clientId: string,
  channel: "dine_in" | "takeaway" | "delivery",
  itemIds: string[],
  status: Order["status"] = "fulfilled",
): Order {
  const items = pickMenu(itemIds);
  const lines = items.map((m, i) => ({
    id: `${num}-l${i + 1}`,
    productId: m.id,
    productName: m.name,
    qty: 1,
    price: m.price,
    fulfilled: status === "fulfilled" || status === "paid" || status === "closed" ? 1 : 0,
    costBasis: m.baseCost,
  }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const client = restaurantClients.find((c) => c.id === clientId);
  return {
    id: `ro-${num}`,
    cabinetId: CABINET,
    direction: "sale",
    number: num,
    counterpartyId: clientId,
    counterpartyName: client?.fullName ?? "Гість",
    currency: "UAH",
    fxRate: 1,
    status,
    channel: channel === "delivery" ? "online" : "retail_prro",
    lines,
    totals: {
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      margin: lines.reduce((s, l) => s + (l.price - (l.costBasis ?? 0)) * l.qty, 0),
    },
    notes: `[${channel}]`,
    createdAt: new Date(Date.now() - daysAgo * 86400_000).toISOString(),
    confirmedAt: new Date(Date.now() - daysAgo * 86400_000).toISOString(),
  };
}

function mkPurchaseOrder(
  num: string,
  daysAgo: number,
  supplierId: string,
  amount: number,
  desc: string,
  status: Order["status"] = "fulfilled",
): Order {
  const sup = restaurantContractors.find((c) => c.id === supplierId);
  const lines = [
    {
      id: `${num}-l1`,
      productId: "generic-purchase",
      productName: desc,
      qty: 1,
      price: amount,
      fulfilled: status === "fulfilled" || status === "paid" || status === "closed" ? 1 : 0,
      costBasis: amount,
    },
  ];
  return {
    id: `ro-${num}`,
    cabinetId: CABINET,
    direction: "purchase",
    number: num,
    counterpartyId: supplierId,
    counterpartyName: sup?.name ?? "Постачальник",
    currency: "UAH",
    fxRate: 1,
    status,
    lines,
    totals: { subtotal: amount, discount: 0, tax: 0, total: amount },
    createdAt: new Date(Date.now() - daysAgo * 86400_000).toISOString(),
    confirmedAt: new Date(Date.now() - daysAgo * 86400_000).toISOString(),
    expectedAt: new Date(Date.now() - (daysAgo - 1) * 86400_000).toISOString(),
  };
}

export const restaurantAllOrders: Order[] = [
  // Sales — Dine in
  mkSaleOrder("SO-2026-04-101", 0, "rcli-1", "dine_in", ["rm-sp-01", "rm-mn-04", "rm-pa-01", "rm-ds-01", "rm-dr-02"], "paid"),
  mkSaleOrder("SO-2026-04-102", 0, "rcli-3", "dine_in", ["rm-gr-01", "rm-sd-01", "rm-wn-04", "rm-ds-03"], "paid"),
  mkSaleOrder("SO-2026-04-103", 0, "rcli-9", "dine_in", ["rm-st-03", "rm-mn-06", "rm-wn-01"], "fulfilled"),
  // Sales — Takeaway
  mkSaleOrder("SO-2026-04-104", 0, "rcli-5", "takeaway", ["rm-pz-02", "rm-dr-12"], "paid"),
  mkSaleOrder("SO-2026-04-105", 1, "rcli-7", "takeaway", ["rm-pz-06", "rm-pz-03", "rm-dr-12", "rm-dr-13"], "paid"),
  // Sales — Delivery
  mkSaleOrder("SO-2026-04-217", 0, "rcli-1", "delivery", ["rm-sp-01", "rm-mn-04", "rm-pa-01", "rm-ds-01"], "fulfilled"),
  mkSaleOrder("SO-2026-04-218", 0, "rcli-2", "delivery", ["rm-sa-01", "rm-pa-01", "rm-dr-09"], "confirmed"),
  mkSaleOrder("SO-2026-04-221", 0, "rcli-9", "delivery", ["rm-pz-03", "rm-pz-06", "rm-sd-01", "rm-ds-02", "rm-dr-14"], "draft"),
  // Historical
  ...Array.from({ length: 20 }).map((_, i) =>
    mkSaleOrder(
      `SO-2026-04-${String(80 - i).padStart(3, "0")}`,
      i + 2,
      restaurantClients[i % restaurantClients.length].id,
      i % 3 === 0 ? "delivery" : i % 3 === 1 ? "takeaway" : "dine_in",
      [
        restaurantMenu[(i * 3) % restaurantMenu.length].id,
        restaurantMenu[(i * 7) % restaurantMenu.length].id,
        restaurantMenu[(i * 11) % restaurantMenu.length].id,
      ],
      "paid",
    ),
  ),

  // Purchases
  mkPurchaseOrder("PO-2026-04-021", 1, "c-rest-meat", 24500, "Філе яловичини + свинина (тижневе замовлення)", "fulfilled"),
  mkPurchaseOrder("PO-2026-04-022", 2, "c-rest-fish", 18200, "Лосось, дорадо, креветки", "fulfilled"),
  mkPurchaseOrder("PO-2026-04-023", 3, "c-rest-veg", 6800, "Овочі, зелень, фрукти", "fulfilled"),
  mkPurchaseOrder("PO-2026-04-024", 4, "c-rest-dairy", 9200, "Сири, сметана, молоко (тиждень)", "fulfilled"),
  mkPurchaseOrder("PO-2026-04-025", 5, "c-rest-wine", 32000, "Винна карта — поновлення Chianti, Prosecco, Pinot", "fulfilled"),
  mkPurchaseOrder("PO-2026-04-026", 1, "c-rest-beer", 12400, "Розливне пиво + сидр (тижневе замовлення)", "fulfilled"),
  mkPurchaseOrder("PO-2026-04-027", 0, "c-rest-bake", 4800, "Хліб, булочки на тиждень", "confirmed"),
  mkPurchaseOrder("PO-2026-04-028", 0, "c-rest-pack", 3200, "Eco-упаковка для доставки (1000 шт)", "confirmed"),
];

export const restaurantFulfillments: Fulfillment[] = restaurantAllOrders
  .filter((o) => o.status === "fulfilled" || o.status === "paid" || o.status === "closed")
  .map((o) => ({
    id: `ff-${o.id}`,
    orderId: o.id,
    kind: o.direction === "sale" ? "shipment" : "receipt",
    date: (o.confirmedAt ?? o.createdAt).split("T")[0],
    lines: o.lines.map((l) => ({ lineId: l.id, qty: l.qty })),
  }));
