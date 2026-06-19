/**
 * RFM-сегментація для клієнтів салону.
 * Обчислюється деривативно з `salonBookings` — НЕ зберігається.
 *
 *  R (Recency)   — днів від останнього виконаного візиту
 *  F (Frequency) — кількість виконаних візитів за останні 365 днів
 *  M (Monetary)  — сумарний чек за виконані візити за 365 днів
 */

import type { Booking as SalonBooking, Client as SalonClient } from "@/core";

export type RfmScore = 1 | 2 | 3 | 4 | 5;
export interface RfmCell {
  r: RfmScore;
  f: RfmScore;
  m: RfmScore;
  recencyDays: number;
  frequency: number;
  monetary: number;
}

export type ClientSegment =
  | "champions"   // R≥4 ∧ F≥4 ∧ M≥4 — серце салону (≈ VIP)
  | "loyal"       // F≥4 ∧ M≥3
  | "new"         // F=1 ∧ first visit < 30 днів
  | "at-risk"     // R≤2 ∧ F≥3 — були активні, зникають
  | "lost"        // R=1 ∧ F≤2 — фактично пішли
  | "regular"     // решта активних
  | "blacklist";  // ручний/авто blacklist

export const SEGMENT_LABEL: Record<ClientSegment, string> = {
  champions: "VIP / Champions",
  loyal: "Лояльні",
  new: "Нові",
  "at-risk": "Сплячі (at-risk)",
  lost: "Втрачені",
  regular: "Постійні",
  blacklist: "Чорний список",
};

export const SEGMENT_TONE: Record<ClientSegment, "default" | "success" | "warning" | "danger"> = {
  champions: "warning",   // золотий тон через amber
  loyal: "success",
  new: "success",
  "at-risk": "warning",
  lost: "danger",
  regular: "default",
  blacklist: "danger",
};

function daysAgo(iso?: string): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - d) / 86_400_000));
}

function bucket5(value: number, breaks: [number, number, number, number]): RfmScore {
  // breaks — 4 пороги для buckets 1..5 (1 = найменший)
  if (value <= breaks[0]) return 1;
  if (value <= breaks[1]) return 2;
  if (value <= breaks[2]) return 3;
  if (value <= breaks[3]) return 4;
  return 5;
}

/** Розрахунок RFM для одного клієнта на базі його bookings. */
export function computeRfm(clientBookings: SalonBooking[]): RfmCell {
  const completed = clientBookings.filter((b) => b.status === "done" || b.status === "confirmed");
  const yearAgo = Date.now() - 365 * 86_400_000;
  const inYear = completed.filter((b) => new Date(b.date).getTime() >= yearAgo);

  const lastVisit = completed
    .map((b) => new Date(b.date).getTime())
    .reduce((mx, t) => Math.max(mx, t), 0);
  const recencyDays = lastVisit === 0 ? 9999 : Math.max(0, Math.floor((Date.now() - lastVisit) / 86_400_000));
  const frequency = inYear.length;
  const monetary = inYear.reduce((s, b) => s + (b.totalPrice || 0), 0);

  // Recency: менше — краще. R=5 для <14д, 1 для >180д
  const r: RfmScore = recencyDays <= 14 ? 5 : recencyDays <= 30 ? 4 : recencyDays <= 60 ? 3 : recencyDays <= 180 ? 2 : 1;
  // Frequency / Monetary: більше — краще
  const f = bucket5(frequency, [1, 3, 6, 10]);
  const m = bucket5(monetary, [500, 1500, 4000, 9000]);

  return { r, f, m, recencyDays, frequency, monetary };
}

export function deriveSegment(client: SalonClient, rfm: RfmCell): ClientSegment {
  if (client.blacklist) return "blacklist";
  if (rfm.r >= 4 && rfm.f >= 4 && rfm.m >= 4) return "champions";
  if (rfm.f === 1 && rfm.recencyDays < 30) return "new";
  if (rfm.f >= 4 && rfm.m >= 3) return "loyal";
  if (rfm.r <= 2 && rfm.f >= 3) return "at-risk";
  if (rfm.r === 1 && rfm.f <= 2) return "lost";
  return "regular";
}
