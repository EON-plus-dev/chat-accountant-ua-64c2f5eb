/**
 * Single source of truth для approval/discount/supplier rules.
 * Settings показує цю таблицю — інших правил у системі немає.
 */

import type { CabinetRole } from "@/types/cabinet";
import type { Order, OrderPolicy } from "./types";

export const DEFAULT_POLICIES: OrderPolicy[] = [
  {
    id: "pol-approval-large-sale",
    scope: "sale",
    type: "approval",
    label: "Затвердження продажів > 10 000 ₴",
    enabled: true,
    condition: { field: "total", op: ">", value: 10000 },
    action: { approverRole: "owner" },
    slaHours: 4,
  },
  {
    id: "pol-approval-large-purchase",
    scope: "purchase",
    type: "approval",
    label: "Затвердження закупівель > 25 000 ₴",
    enabled: true,
    condition: { field: "total", op: ">", value: 25000 },
    action: { approverRole: "owner" },
    slaHours: 8,
  },
  {
    id: "pol-discount-master",
    scope: "sale",
    type: "discount_limit",
    label: "Максимальна знижка майстра",
    enabled: true,
    condition: { field: "lineDiscount", op: ">", value: 15 },
    action: { maxDiscountPct: 15 },
  },
  {
    id: "pol-reorder-cosmetics",
    scope: "purchase",
    type: "stock_threshold",
    label: "Авто-рекомендація замовлення (косметика < 5 шт)",
    enabled: true,
    condition: { field: "stockQty", op: "<", value: 5 },
    action: { reorderToQty: 20 },
  },
];

/** Чи потребує ордер апруву за enabled-політиками. */
export function evaluateApprovals(order: Order, policies: OrderPolicy[]): {
  required: { policyId: string; approverRole: CabinetRole; slaHours?: number }[];
} {
  const required: { policyId: string; approverRole: CabinetRole; slaHours?: number }[] = [];
  for (const p of policies) {
    if (!p.enabled || p.type !== "approval") continue;
    if (p.scope !== "both" && p.scope !== order.direction) continue;
    if (p.condition.field !== "total") continue;
    const v = Number(p.condition.value);
    const total = order.totals.total;
    const hit =
      (p.condition.op === ">" && total > v) ||
      (p.condition.op === ">=" && total >= v) ||
      (p.condition.op === "<" && total < v) ||
      (p.condition.op === "<=" && total <= v) ||
      (p.condition.op === "=" && total === v);
    if (hit && p.action.approverRole) {
      required.push({ policyId: p.id, approverRole: p.action.approverRole, slaHours: p.slaHours });
    }
  }
  return { required };
}

/** Повертає максимальний дозволений % знижки для ролі. */
export function getMaxDiscountFor(role: CabinetRole, policies: OrderPolicy[]): number {
  let max = 100;
  for (const p of policies) {
    if (!p.enabled || p.type !== "discount_limit") continue;
    if (p.action.maxDiscountPct == null) continue;
    if (p.action.approverRole && p.action.approverRole !== role) continue;
    max = Math.min(max, p.action.maxDiscountPct);
  }
  return max;
}
