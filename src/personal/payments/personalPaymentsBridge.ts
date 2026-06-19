/**
 * Personal Payments Bridge
 *
 * Для демо: будь-яке замовлення/підписка/бронювання має «віртуальний» платіж,
 * який рендериться у drill-views як окремий блок. Деталі генеруються
 * детерміністично з id, щоб демо переживало reload.
 */

import type { PersonalOrder } from "@/personal/orders/personalOrdersMock";
import type { PersonalSubscription } from "@/personal/subscriptions/personalSubscriptionsMock";

export interface PersonalPaymentRef {
  id: string;
  date: string;
  amountUah: number;
  status: "paid" | "pending" | "scheduled" | "refunded";
  method: "card" | "applepay" | "googlepay" | "cash" | "balance";
  last4?: string;
  account?: string;
  category: "Покупки" | "Послуги" | "Бронювання" | "Підписки";
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const LAST4_POOL = ["4242", "1170", "8826", "5599", "0314"];

export function paymentForOrder(o: PersonalOrder): PersonalPaymentRef | null {
  if (o.amountUah <= 0) return null;
  const seed = hash(o.id);
  const method = o.paymentMethod === "applepay" ? "applepay"
    : o.paymentMethod === "googlepay" ? "googlepay"
    : o.paymentMethod === "cash" ? "cash"
    : o.paymentMethod === "balance" ? "balance"
    : "card";
  return {
    id: `pay-${o.id}`,
    date: o.date,
    amountUah: o.amountUah,
    status: o.status === "scheduled" ? "scheduled" : o.status === "cancelled" ? "refunded" : "paid",
    method,
    last4: method === "card" ? (o.paymentLast4 ?? LAST4_POOL[seed % LAST4_POOL.length]) : undefined,
    account: method === "card" ? "Mono Black" : method === "applepay" ? "Apple Pay" : undefined,
    category: o.kind === "purchase" ? "Покупки" : o.kind === "service" ? "Послуги" : "Бронювання",
  };
}

export function upcomingChargesForSubscription(
  s: PersonalSubscription,
  isCancelled = false
): PersonalPaymentRef[] {
  if (isCancelled) return [];
  const base = new Date(s.nextChargeAt);
  if (Number.isNaN(base.getTime())) return [];
  const seed = hash(s.id);
  const last4 = LAST4_POOL[seed % LAST4_POOL.length];
  const stepDays = s.cadence === "month" ? 30 : 365;
  const out: PersonalPaymentRef[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(base.getTime() + i * stepDays * 86400000);
    out.push({
      id: `pay-${s.id}-${i}`,
      date: d.toISOString().slice(0, 10),
      amountUah: s.amountUah,
      status: i === 0 ? "scheduled" : "scheduled",
      method: s.paymentMethod === "applepay" ? "applepay" : "card",
      last4: s.paymentMethod === "applepay" ? undefined : last4,
      category: "Підписки",
    });
  }
  return out;
}

export function methodLabel(m: PersonalPaymentRef["method"]): string {
  return m === "card" ? "Картка" : m === "applepay" ? "Apple Pay" : m === "googlepay" ? "Google Pay" : m === "cash" ? "Готівка" : "Баланс";
}

export function statusLabel(s: PersonalPaymentRef["status"]): { label: string; cls: string } {
  if (s === "paid") return { label: "Оплачено", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" };
  if (s === "pending") return { label: "В обробці", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" };
  if (s === "scheduled") return { label: "Заплановано", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30" };
  return { label: "Повернуто", cls: "bg-muted text-muted-foreground border-border" };
}

/**
 * Cancellation policy для бронювань (демо): безкоштовно >24г, штраф 50% <24г.
 */
export function bookingCancellationFee(o: PersonalOrder): { feeUah: number; refundUah: number; reason: string } {
  if (o.kind !== "booking" || o.amountUah <= 0) return { feeUah: 0, refundUah: o.amountUah, reason: "Безкоштовне скасування" };
  const date = new Date(o.date);
  const hoursLeft = (date.getTime() - Date.now()) / 3600000;
  if (hoursLeft > 24) return { feeUah: 0, refundUah: o.amountUah, reason: "Понад 24 години до візиту — повне повернення" };
  if (hoursLeft > 0) return { feeUah: Math.round(o.amountUah * 0.5), refundUah: Math.round(o.amountUah * 0.5), reason: "Менше 24 годин — штраф 50%" };
  return { feeUah: o.amountUah, refundUah: 0, reason: "Дата вже минула — повернення неможливе" };
}
