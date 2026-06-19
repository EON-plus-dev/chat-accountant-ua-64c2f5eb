/**
 * Landed cost — розподіл додаткових витрат (freight/duty/insurance) на
 * собівартість одиниці SKU пропорційно вартості позиції в ордері.
 * Працює як для UAH, так і для multi-currency (через fxRate ордера).
 */

import type { Order, Fulfillment, LandedCostItem } from "../types";

const FX_SNAPSHOT: Record<string, number> = { UAH: 1, USD: 41.5, EUR: 44.2 };

function toUah(amount: number, currency: "UAH" | "USD" | "EUR"): number {
  return amount * (FX_SNAPSHOT[currency] ?? 1);
}

export function totalLandedUah(items: LandedCostItem[] | undefined): number {
  if (!items?.length) return 0;
  return items.reduce((s, i) => s + toUah(i.amount, i.currency), 0);
}

/**
 * Повертає costBasis (грн/од) для кожної позиції ордера після GRN:
 * basis = priceUAH + share(landed) / qty.
 */
export function allocateLandedCost(order: Order, receipt: Fulfillment): Map<string, number> {
  const result = new Map<string, number>();
  const landedUah = totalLandedUah(receipt.landedCosts);

  // Загальна "вартість позицій" у грн (для пропорції).
  const totalUah = order.lines.reduce(
    (s, l) => s + l.price * l.qty * order.fxRate,
    0,
  );
  if (totalUah <= 0) return result;

  for (const line of order.lines) {
    const linePriceUah = line.price * order.fxRate;
    const lineTotalUah = linePriceUah * line.qty;
    const share = (lineTotalUah / totalUah) * landedUah;
    const basis = linePriceUah + (line.qty > 0 ? share / line.qty : 0);
    result.set(line.id, Math.round(basis * 100) / 100);
  }
  return result;
}
