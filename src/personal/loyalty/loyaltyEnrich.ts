/**
 * loyaltyEnrich — deterministic derivation для LoyaltyProgram:
 * tierThresholds, transactions, pointsRate. Використовується drill-view і
 * LoyaltyPage для коректного progress-bar (без random).
 */

import {
  type LoyaltyProgram,
  type LoyaltyTierThreshold,
  type LoyaltyTransaction,
} from "./loyaltyProgramsMock";
import { stableHash } from "@/personal/orders/offerHelpers";

const NEXT_TIER: Record<string, string> = {
  White: "Black",
  "Срібний": "Золотий",
  "Срібло": "Золото",
  "Silver": "Gold",
  "Базовий": "Срібний",
  "Стандарт": "Преміум",
  Gold: "Platinum",
  "Експерт": "Майстер",
  "Майстер": "Гуру",
};

const TIER_ORDER_BY_NAME: Record<string, string[]> = {
  White: ["White", "Black"],
  "Срібний": ["Базовий", "Срібний", "Золотий"],
  "Срібло": ["Базовий", "Срібло", "Золото"],
  Silver: ["Базовий", "Silver", "Gold"],
  "Базовий": ["Базовий", "Срібний", "Золотий"],
  Стандарт: ["Стандарт", "Преміум"],
  Gold: ["Silver", "Gold", "Platinum"],
  "Експерт": ["Базовий", "Експерт", "Майстер"],
  "Майстер": ["Експерт", "Майстер", "Гуру"],
};

export interface EnrichedLoyalty extends LoyaltyProgram {
  tierThresholds: LoyaltyTierThreshold[];
  currentTierIndex: number;
  nextTier?: string;
  progressPct: number;
  toNextDelta: number;
  toNextUnit: LoyaltyProgram["unit"];
  pointsRate: number;
  transactions: LoyaltyTransaction[];
  expiryRules: string;
}

export function enrichLoyalty(p: LoyaltyProgram): EnrichedLoyalty {
  const h = stableHash(p.id);
  const order = p.tierThresholds
    ? p.tierThresholds.map((t) => t.tier)
    : (p.tier ? TIER_ORDER_BY_NAME[p.tier] ?? [p.tier, NEXT_TIER[p.tier] ?? "Top"] : ["Базовий", "Просунутий", "Топ"]);
  const baseStep = unitBaseStep(p);
  const thresholds: LoyaltyTierThreshold[] = p.tierThresholds
    ?? order.map((tier, i) => ({ tier, minBalance: i === 0 ? 0 : Math.round(baseStep * Math.pow(2, i - 1)) }));
  let currentTierIndex = p.currentTierIndex
    ?? thresholds.reduce((acc, t, i) => (p.balance >= t.minBalance ? i : acc), 0);
  currentTierIndex = Math.min(currentTierIndex, thresholds.length - 1);
  const next = thresholds[currentTierIndex + 1];
  const prev = thresholds[currentTierIndex];
  const progressPct = next
    ? Math.min(100, Math.max(0, Math.round(((p.balance - prev.minBalance) / (next.minBalance - prev.minBalance)) * 100)))
    : 100;
  const toNextDelta = next ? Math.max(0, next.minBalance - p.balance) : 0;
  const pointsRate = p.pointsRate ?? (p.unit === "₴" ? 1 : p.unit === "балів" ? 0.5 : 1);
  const transactions = p.transactions ?? deriveTransactions(p, h);
  const expiryRules = p.expiryRules
    ?? (p.expiresAt
      ? `Згоряє ${p.expiresAt}`
      : "Бали залишаються активними доки ви робите хоча б одну операцію на 90 днів");
  return {
    ...p,
    tierThresholds: thresholds,
    currentTierIndex,
    nextTier: next?.tier,
    progressPct,
    toNextDelta,
    toNextUnit: p.unit,
    pointsRate,
    transactions,
    expiryRules,
  };
}

function unitBaseStep(p: LoyaltyProgram): number {
  if (p.unit === "л") return 20;
  if (p.unit === "сеансів") return 5;
  if (p.unit === "₴") return 500;
  return 500; // балів
}

function deriveTransactions(p: LoyaltyProgram, h: number): LoyaltyTransaction[] {
  const n = 5 + (h % 3);
  const out: LoyaltyTransaction[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * (2 + (h % 4)));
    const delta = i === 0 ? Math.round(p.balance * 0.05 + 10)
      : i === 3 ? -Math.round(p.balance * 0.08)
      : Math.round(p.balance * 0.04 + 5);
    const reason = delta > 0
      ? (i % 2 === 0 ? "Покупка" : "Кешбек")
      : "Списання балів";
    out.push({ date: d.toISOString().slice(0, 10), delta, reason });
  }
  return out;
}
