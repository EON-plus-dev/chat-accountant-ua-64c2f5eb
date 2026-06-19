import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export type SubscriptionPaymentMethod = "card" | "applepay" | "balance";

export interface SubscriptionChargeEntry {
  date: string;
  amountUah: number;
  status: "ok" | "failed" | "refunded";
}

export interface PersonalSubscription {
  id: string;
  name: string;
  category: "streaming" | "cloud" | "insurance" | "fitness" | "telecom" | "gov";
  amountUah: number;
  cadence: "month" | "year";
  nextChargeAt: string;
  usageHint?: "active" | "low_use" | "unused";
  isTrial?: boolean;
  trialEndsAt?: string;
  paymentMethod?: SubscriptionPaymentMethod;
  paymentLast4?: string;
  provider?: string;
  startedAt?: string;
  history?: SubscriptionChargeEntry[];
}

const DATA: Partial<Record<PersonalPreset, PersonalSubscription[]>> = {
  declarant: [
    { id: "sub-1", name: "Netflix Standard", category: "streaming", amountUah: 299, cadence: "month", nextChargeAt: "2026-04-22", usageHint: "active" },
    { id: "sub-2", name: "Spotify Family", category: "streaming", amountUah: 199, cadence: "month", nextChargeAt: "2026-04-18", usageHint: "active" },
    { id: "sub-3", name: "iCloud+ 200 ГБ", category: "cloud", amountUah: 99, cadence: "month", nextChargeAt: "2026-04-12", usageHint: "active" },
    { id: "sub-4", name: "Дія+ Преміум", category: "gov", amountUah: 49, cadence: "month", nextChargeAt: "2026-04-15", usageHint: "low_use" },
    { id: "sub-5", name: "ОСЦПВ — Toyota CHR", category: "insurance", amountUah: 2840, cadence: "year", nextChargeAt: "2026-07-01", usageHint: "active" },
    { id: "sub-6", name: "Sport Life Premium", category: "fitness", amountUah: 1490, cadence: "month", nextChargeAt: "2026-04-05", usageHint: "low_use" },
    { id: "sub-7", name: "Київстар Контракт", category: "telecom", amountUah: 350, cadence: "month", nextChargeAt: "2026-04-20", usageHint: "active" },
    { id: "sub-8", name: "Воля Інтернет 1 Гб/с", category: "telecom", amountUah: 480, cadence: "month", nextChargeAt: "2026-04-25", usageHint: "active" },
    { id: "sub-9", name: "MEGOGO «Максимум»", category: "streaming", amountUah: 249, cadence: "month", nextChargeAt: "2026-04-09", usageHint: "low_use" },
    { id: "sub-10", name: "YouTube Premium Family", category: "streaming", amountUah: 269, cadence: "month", nextChargeAt: "2026-04-17", usageHint: "active" },
    { id: "sub-11", name: "Google One 2 ТБ", category: "cloud", amountUah: 329, cadence: "month", nextChargeAt: "2026-04-23", usageHint: "active" },
    { id: "sub-12", name: "ChatGPT Plus", category: "cloud", amountUah: 820, cadence: "month", nextChargeAt: "2026-04-11", usageHint: "active" },
    { id: "sub-13", name: "Страхування подорожей VUSO", category: "insurance", amountUah: 1290, cadence: "year", nextChargeAt: "2026-09-15", usageHint: "active" },
    { id: "sub-14", name: "Антивірус ESET", category: "cloud", amountUah: 690, cadence: "year", nextChargeAt: "2027-01-12", usageHint: "active" },
    { id: "sub-15", name: "Apple Arcade", category: "streaming", amountUah: 199, cadence: "month", nextChargeAt: "2026-04-28", usageHint: "unused" },
    { id: "sub-16", name: "Vodafone Smart Home", category: "telecom", amountUah: 199, cadence: "month", nextChargeAt: "2026-04-06", usageHint: "low_use" },
  ],
  renter: [
    { id: "sub-r-1", name: "Київстар Домашній інтернет (кв.)", category: "telecom", amountUah: 320, cadence: "month", nextChargeAt: "2026-04-19", usageHint: "active" },
    { id: "sub-r-2", name: "ОСББ-сервіс «Мій будинок»", category: "gov", amountUah: 60, cadence: "month", nextChargeAt: "2026-04-10", usageHint: "active" },
    { id: "sub-r-3", name: "Страхування квартири UNIQA", category: "insurance", amountUah: 3600, cadence: "year", nextChargeAt: "2026-05-01", usageHint: "active" },
  ],
  master: [
    { id: "sub-m-1", name: "Київстар Контракт", category: "telecom", amountUah: 280, cadence: "month", nextChargeAt: "2026-04-21", usageHint: "active" },
    { id: "sub-m-2", name: "Spotify Premium", category: "streaming", amountUah: 199, cadence: "month", nextChargeAt: "2026-04-14", usageHint: "active" },
    { id: "sub-m-3", name: "iCloud+ 200 ГБ", category: "cloud", amountUah: 99, cadence: "month", nextChargeAt: "2026-04-08", usageHint: "active" },
    { id: "sub-m-4", name: "Netflix Standard", category: "streaming", amountUah: 299, cadence: "month", nextChargeAt: "2026-04-19", usageHint: "active" },
    { id: "sub-m-5", name: "Canva Pro", category: "cloud", amountUah: 480, cadence: "month", nextChargeAt: "2026-04-11", usageHint: "active" },
    { id: "sub-m-6", name: "ChatGPT Plus", category: "cloud", amountUah: 820, cadence: "month", nextChargeAt: "2026-04-16", usageHint: "low_use" },
    { id: "sub-m-7", name: "YouTube Premium", category: "streaming", amountUah: 199, cadence: "month", nextChargeAt: "2026-04-22", usageHint: "active" },
    { id: "sub-m-8", name: "Київстар Домашній інтернет", category: "telecom", amountUah: 250, cadence: "month", nextChargeAt: "2026-04-24", usageHint: "active" },
    { id: "sub-m-9", name: "Sport Life «Lite»", category: "fitness", amountUah: 890, cadence: "month", nextChargeAt: "2026-04-05", usageHint: "low_use" },
    { id: "sub-m-10", name: "Apple Music", category: "streaming", amountUah: 169, cadence: "month", nextChargeAt: "2026-04-27", usageHint: "unused" },
    { id: "sub-m-11", name: "Страхування здоровʼя ARX", category: "insurance", amountUah: 4800, cadence: "year", nextChargeAt: "2026-09-12", usageHint: "active" },
    { id: "sub-m-12", name: "Дія+ Преміум", category: "gov", amountUah: 49, cadence: "month", nextChargeAt: "2026-04-15", usageHint: "low_use" },
  ],
};

export function getSubscriptionsForCabinet(cabinetId: string): PersonalSubscription[] {
  return pickByPreset(cabinetId, DATA, []);
}

export function getMonthlySubscriptionsTotal(cabinetId: string): number {
  return getSubscriptionsForCabinet(cabinetId)
    .reduce((acc, s) => acc + (s.cadence === "month" ? s.amountUah : s.amountUah / 12), 0);
}
