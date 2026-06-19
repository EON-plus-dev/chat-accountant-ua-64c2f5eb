/**
 * orderEnrich — deterministic derivation of optional fields (paymentMethod, items, etc.)
 * для PersonalOrder, коли seed не містить розширених полів. Використовується лише у
 * drill-view для багатшого превʼю; не зачіпає публічні моки.
 */

import {
  type PersonalOrder,
  type PersonalOrderPaymentMethod,
  type PersonalOrderDeliveryStatus,
  type PersonalOrderItem,
} from "./personalOrdersMock";
import { stableHash } from "./offerHelpers";

const PAY_BY_HASH: PersonalOrderPaymentMethod[] = [
  "card", "applepay", "googlepay", "balance", "card", "card",
];
const DELIVERY_BY_STATUS: Record<string, PersonalOrderDeliveryStatus> = {
  scheduled: "preparing",
  active: "shipped",
  completed: "delivered",
  cancelled: "preparing",
};

export interface EnrichedOrder extends PersonalOrder {
  paymentMethod: PersonalOrderPaymentMethod;
  paymentLast4: string;
  items: PersonalOrderItem[];
  deliveryStatus?: PersonalOrderDeliveryStatus;
  trackingNo?: string;
  returnableUntil?: string;
  invoiceUrl?: string;
  address?: string;
}

export function enrichOrder(o: PersonalOrder): EnrichedOrder {
  const h = stableHash(o.id);
  const paymentMethod = o.paymentMethod ?? PAY_BY_HASH[h % PAY_BY_HASH.length];
  const paymentLast4 = o.paymentLast4 ?? String(1000 + (h % 9000)).slice(-4);
  const items = o.items ?? deriveItems(o, h);
  const deliveryStatus =
    o.kind === "purchase"
      ? o.deliveryStatus ?? DELIVERY_BY_STATUS[o.status]
      : undefined;
  const trackingNo =
    o.kind === "purchase" && (o.status === "active" || o.status === "completed")
      ? o.trackingNo ?? `NP${20000000000 + (h % 9999999999)}`
      : undefined;
  const returnableUntil =
    o.kind === "purchase" && o.status === "completed"
      ? o.returnableUntil ?? addDays(o.date, 14)
      : undefined;
  const invoiceUrl =
    o.status === "completed" ? o.invoiceUrl ?? `mock://invoice/${o.id}.pdf` : undefined;
  const address = o.address ?? "Київ, вул. Хрещатик, 22";
  return {
    ...o,
    paymentMethod, paymentLast4, items,
    deliveryStatus, trackingNo, returnableUntil, invoiceUrl, address,
  };
}

function deriveItems(o: PersonalOrder, h: number): PersonalOrderItem[] {
  // Один основний рядок + дрібні наповнювачі для реалістичності кошика
  if (o.amountUah === 0) {
    return [{ title: o.title, qty: 1, priceUah: 0 }];
  }
  if (o.kind !== "purchase") {
    return [{ title: o.title, qty: 1, priceUah: o.amountUah }];
  }
  const main = Math.round(o.amountUah * 0.85);
  const extra = o.amountUah - main;
  const extraTitle = ["Доставка", "Подарункова упаковка", "Сервісний збір"][h % 3];
  return [
    { title: o.title, qty: 1, priceUah: main },
    { title: extraTitle, qty: 1, priceUah: extra },
  ];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const PM_LABEL: Record<PersonalOrderPaymentMethod, string> = {
  card: "Картка",
  applepay: "Apple Pay",
  googlepay: "Google Pay",
  cash: "Готівка",
  fop_iban: "Рахунок ФОП",
  balance: "Баланс",
};
export const paymentMethodLabel = (m: PersonalOrderPaymentMethod) => PM_LABEL[m];

const DS_LABEL: Record<PersonalOrderDeliveryStatus, string> = {
  preparing: "Готується",
  shipped: "Відправлено",
  out_for_delivery: "Курʼєр у дорозі",
  delivered: "Доставлено",
};
export const deliveryStatusLabel = (s: PersonalOrderDeliveryStatus) => DS_LABEL[s];
