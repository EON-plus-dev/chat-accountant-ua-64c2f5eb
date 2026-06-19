/**
 * subscriptionEnrich — deterministic derivation для PersonalSubscription:
 * isTrial, paymentMethod, history. Не змінює seeds.
 */

import {
  type PersonalSubscription,
  type SubscriptionPaymentMethod,
  type SubscriptionChargeEntry,
} from "./personalSubscriptionsMock";
import { stableHash } from "@/personal/orders/offerHelpers";

const PAY_METHODS: SubscriptionPaymentMethod[] = ["card", "applepay", "balance"];

export interface EnrichedSubscription extends PersonalSubscription {
  paymentMethod: SubscriptionPaymentMethod;
  paymentLast4: string;
  isTrial: boolean;
  startedAt: string;
  history: SubscriptionChargeEntry[];
}

/** Heuristic: підписки з очевидно «триальними» характеристиками → trial */
function deriveTrial(s: PersonalSubscription): boolean {
  if (s.isTrial !== undefined) return s.isTrial;
  // Apple Arcade (unused) + ChatGPT Plus з low_use → демо-триали
  if (s.usageHint === "unused" && s.name.toLowerCase().includes("arcade")) return true;
  if (s.name.toLowerCase().includes("chatgpt") && s.usageHint === "low_use") return true;
  return false;
}

export function enrichSubscription(s: PersonalSubscription): EnrichedSubscription {
  const h = stableHash(s.id);
  const paymentMethod = s.paymentMethod ?? PAY_METHODS[h % PAY_METHODS.length];
  const paymentLast4 = s.paymentLast4 ?? String(1000 + (h % 9000)).slice(-4);
  const isTrial = deriveTrial(s);
  const startedAt = s.startedAt ?? deriveStartedAt(s.nextChargeAt, s.cadence, h);
  const history = s.history ?? deriveHistory(s, h);
  return { ...s, paymentMethod, paymentLast4, isTrial, startedAt, history };
}

function deriveStartedAt(nextIso: string, cadence: "month" | "year", h: number): string {
  const d = new Date(nextIso);
  if (Number.isNaN(d.getTime())) return nextIso;
  const periodsAgo = 3 + (h % 6); // 3-8 періодів
  if (cadence === "month") d.setMonth(d.getMonth() - periodsAgo);
  else d.setFullYear(d.getFullYear() - periodsAgo);
  return d.toISOString().slice(0, 10);
}

function deriveHistory(s: PersonalSubscription, h: number): SubscriptionChargeEntry[] {
  const periods = 4 + (h % 3); // 4-6 записів
  const out: SubscriptionChargeEntry[] = [];
  const d = new Date(s.nextChargeAt);
  if (Number.isNaN(d.getTime())) return out;
  for (let i = 1; i <= periods; i++) {
    const dd = new Date(d);
    if (s.cadence === "month") dd.setMonth(dd.getMonth() - i);
    else dd.setFullYear(dd.getFullYear() - i);
    const status: SubscriptionChargeEntry["status"] =
      i === 2 && h % 5 === 0 ? "failed" : "ok";
    out.push({ date: dd.toISOString().slice(0, 10), amountUah: s.amountUah, status });
  }
  return out;
}

const PM_LABEL: Record<SubscriptionPaymentMethod, string> = {
  card: "Картка",
  applepay: "Apple Pay",
  balance: "Баланс",
};
export const subPaymentMethodLabel = (m: SubscriptionPaymentMethod) => PM_LABEL[m];
