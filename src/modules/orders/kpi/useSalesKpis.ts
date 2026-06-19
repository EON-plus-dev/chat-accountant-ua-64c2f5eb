import { useMemo } from "react";
import type { Order, SalesKpis } from "../types";

export function useSalesKpis(orders: Order[], totalBookings = 0): SalesKpis {
  return useMemo(() => {
    const sales = orders.filter((o) => o.direction === "sale" && o.status !== "cancelled" && o.status !== "draft");
    const now = Date.now();
    const dayAgo = now - 86_400_000;
    const w7 = now - 7 * 86_400_000;
    const m30 = now - 30 * 86_400_000;
    const m60 = now - 60 * 86_400_000;

    const inWindow = (o: Order, since: number) => {
      const t = new Date(o.confirmedAt ?? o.createdAt).getTime();
      return t >= since;
    };
    const sumUah = (acc: Order[]) =>
      acc.reduce((s, o) => s + o.totals.total * (o.fxRate ?? 1), 0);

    const revenueToday = sumUah(sales.filter((o) => inWindow(o, dayAgo)));
    const revenue7d = sumUah(sales.filter((o) => inWindow(o, w7)));
    const revenue30d = sumUah(sales.filter((o) => inWindow(o, m30)));
    const prev30dList = sales.filter((o) => {
      const t = new Date(o.confirmedAt ?? o.createdAt).getTime();
      return t >= m60 && t < m30;
    });
    const prev30d = sumUah(prev30dList);

    const recent = sales.filter((o) => inWindow(o, m30));
    const avgCheck = recent.length ? Math.round(revenue30d / recent.length) : 0;

    const upsells = sales.filter((o) => o.channel === "upsell_visit" && inWindow(o, m30)).length;
    const upsellConversion = totalBookings > 0 ? Math.round((upsells / totalBookings) * 1000) / 10 : 0;

    // Top SKUs by revenue last 30d
    const skuMap = new Map<string, { name: string; revenue: number; margin: number }>();
    for (const o of recent) {
      for (const l of o.lines) {
        if (l.isReturn) continue;
        const e = skuMap.get(l.productId) ?? { name: l.productName, revenue: 0, margin: 0 };
        const rev = l.price * l.qty * (o.fxRate ?? 1);
        const cost = (l.costBasis ?? l.price * 0.55) * l.qty;
        e.revenue += rev;
        e.margin += rev - cost;
        skuMap.set(l.productId, e);
      }
    }
    const topSkus = [...skuMap.entries()]
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 3);

    return { revenueToday, revenue7d, revenue30d, prev30d, avgCheck, upsellConversion, topSkus };
  }, [orders, totalBookings]);
}
