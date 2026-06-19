import { useMemo } from "react";
import type { Order, PurchasesKpis } from "../types";

interface Opts {
  monthBudget?: number;
  daysOfStockAvg?: number;
}

export function usePurchasesKpis(orders: Order[], opts: Opts = {}): PurchasesKpis {
  return useMemo(() => {
    const po = orders.filter((o) => o.direction === "purchase");
    const inProgress = po.filter((o) =>
      ["confirmed", "partial"].includes(o.status),
    ).length;
    const today = new Date().toISOString().slice(0, 10);
    const overdue = po.filter(
      (o) =>
        ["confirmed", "partial"].includes(o.status) &&
        o.expectedAt &&
        o.expectedAt < today,
    ).length;

    const m30 = Date.now() - 30 * 86_400_000;
    const monthSpend = po
      .filter((o) => {
        const t = new Date(o.confirmedAt ?? o.createdAt).getTime();
        return t >= m30 && o.status !== "cancelled" && o.status !== "draft";
      })
      .reduce((s, o) => s + o.totals.total * (o.fxRate ?? 1), 0);

    // Top suppliers by turnover
    const supMap = new Map<string, { name: string; turnover: number; ordersCount: number }>();
    for (const o of po) {
      if (o.status === "draft" || o.status === "cancelled") continue;
      const e = supMap.get(o.counterpartyId) ?? {
        name: o.counterpartyName,
        turnover: 0,
        ordersCount: 0,
      };
      e.turnover += o.totals.total * (o.fxRate ?? 1);
      e.ordersCount += 1;
      supMap.set(o.counterpartyId, e);
    }
    const topSuppliers = [...supMap.entries()]
      .map(([supplierId, v]) => ({ supplierId, ...v }))
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 5);

    return {
      inProgress,
      overdue,
      monthSpend,
      monthBudget: opts.monthBudget ?? 0,
      daysOfStockAvg: opts.daysOfStockAvg ?? 0,
      topSuppliers,
    };
  }, [orders, opts.monthBudget, opts.daysOfStockAvg]);
}
