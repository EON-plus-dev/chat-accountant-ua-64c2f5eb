/**
 * Days of Stock = stock / ADU(28d).
 * ADU = середнє денне споживання за 28 днів, dead-stock виключаємо.
 */

import type { Order } from "../types";

interface StockInput {
  productId: string;
  stockQty: number;
}

/**
 * @param orders sale orders за останні >=28 днів
 * @returns Map productId → daysOfStock (Infinity якщо ADU=0 — dead-stock)
 */
export function computeDaysOfStock(stock: StockInput[], orders: Order[]): Map<string, number> {
  const cutoff = Date.now() - 28 * 86_400_000;
  // Сумарне споживання за 28д по productId
  const used = new Map<string, number>();
  for (const o of orders) {
    if (o.direction !== "sale") continue;
    if (o.status === "cancelled" || o.status === "draft") continue;
    const t = new Date(o.confirmedAt ?? o.createdAt).getTime();
    if (t < cutoff) continue;
    for (const l of o.lines) {
      if (l.isReturn) continue;
      used.set(l.productId, (used.get(l.productId) ?? 0) + l.qty);
    }
  }

  const out = new Map<string, number>();
  for (const s of stock) {
    const adu = (used.get(s.productId) ?? 0) / 28;
    if (adu <= 0) {
      out.set(s.productId, Infinity); // dead-stock
    } else {
      out.set(s.productId, Math.round(s.stockQty / adu));
    }
  }
  return out;
}

/** Середній days-of-stock по живих SKU (виключає dead-stock + товари з нульовим залишком). */
export function avgLiveDaysOfStock(map: Map<string, number>): number {
  const live = [...map.values()].filter((d) => Number.isFinite(d) && d > 0);
  if (live.length === 0) return 0;
  return Math.round(live.reduce((s, v) => s + v, 0) / live.length);
}
