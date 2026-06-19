/**
 * Bridge: при підтвердженні Fulfillment генеруємо StockMove у warehouse.
 *   receipt → +qty (kind: "receipt")
 *   shipment → -qty (kind: "shipment")
 *
 * Landed cost додається до costPerUnit пропорційно вартості позицій.
 */

import type { Order, Fulfillment } from "@/modules/orders/types";
import type { StockMove } from "../types";
import { appendStockMoves } from "../store/useWarehouseStock";

export function fulfillmentToStockMoves(
  cabinetId: string,
  order: Order,
  fulfillment: Fulfillment,
  productDefaultLocation: (productId: string) => string,
): StockMove[] {
  const sign = fulfillment.kind === "receipt" ? 1 : -1;

  // Landed cost розкид: % від загальної вартості позицій ордера
  const orderValueByLine = new Map<string, number>();
  let totalValue = 0;
  for (const ol of order.lines) {
    const v = ol.qty * ol.price * (1 - (ol.discount ?? 0) / 100);
    orderValueByLine.set(ol.id, v);
    totalValue += v;
  }
  const totalLanded = (fulfillment.landedCosts ?? []).reduce(
    (s, l) => s + l.amount * (l.currency === "UAH" ? 1 : 40), // спрощено: USD/EUR ≈ 40 UAH
    0,
  );

  return fulfillment.lines.map<StockMove>((fl, i) => {
    const ol = order.lines.find((x) => x.id === fl.lineId);
    if (!ol) {
      return {
        id: `mv-fl-${fulfillment.id}-${i}`,
        cabinetId,
        productId: "?",
        locationId: "loc-default",
        qty: 0,
        kind: fulfillment.kind === "receipt" ? "receipt" : "shipment",
        date: fulfillment.date,
      };
    }
    const baseValue = orderValueByLine.get(ol.id) ?? 0;
    const landedPart = totalValue > 0 && fulfillment.kind === "receipt"
      ? (baseValue / totalValue) * totalLanded
      : 0;
    const costPerUnit = ol.price + (fl.qty > 0 ? landedPart / fl.qty : 0);
    return {
      id: `mv-fl-${fulfillment.id}-${i}`,
      cabinetId,
      productId: ol.productId,
      locationId: productDefaultLocation(ol.productId),
      qty: sign * Math.abs(fl.qty),
      kind: fulfillment.kind === "receipt" ? "receipt" : "shipment",
      refType: "fulfillment",
      refId: fulfillment.id,
      costPerUnit,
      date: fulfillment.date,
    };
  });
}

export function postFulfillmentToWarehouse(
  cabinetId: string,
  order: Order,
  fulfillment: Fulfillment,
  productDefaultLocation: (productId: string) => string,
) {
  const moves = fulfillmentToStockMoves(cabinetId, order, fulfillment, productDefaultLocation);
  appendStockMoves(cabinetId, moves);
}
