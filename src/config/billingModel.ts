// Single source of truth for token-only billing model.
// Plans are "credit packages with locked top-up rate":
//   higher tier = cheaper credits NOW + cheaper future top-ups.
// Partner gets 10% of client turnover in UAH (subscription + top-ups).

export type PlanId = "start" | "smart" | "premium";
export type IncludedKind = "daily" | "monthly";

export interface BillingPlan {
  id: PlanId;
  label: string;
  priceUah: number;            // monthly price (0 for Start)
  includedCredits: number;     // 300 monthly for Start, monthly for paid plans
  includedKind: IncludedKind;
  /** How many credits user gets per 1 ₴ when topping up while on this plan. */
  topUpRatePerUah: number;
  popular?: boolean;
  /** Effective price-per-credit at base purchase (₴), for comparison only. */
  effectivePricePerCreditUah: number;
}

export const PLANS: Record<PlanId, BillingPlan> = {
  start: {
    id: "start",
    label: "Старт",
    priceUah: 0,
    includedCredits: 300,
    includedKind: "monthly",
    topUpRatePerUah: 100, // base rate: 1 ₴ = 100 кр (= 0.01 ₴/кр)
    effectivePricePerCreditUah: 0.01,
  },
  smart: {
    id: "smart",
    label: "Смарт",
    priceUah: 399,
    includedCredits: 4990,
    includedKind: "monthly",
    topUpRatePerUah: 125, // 1 ₴ = 125 кр (= 0.008 ₴/кр)
    popular: true,
    effectivePricePerCreditUah: 399 / 4990,
  },
  premium: {
    id: "premium",
    label: "Преміум",
    priceUah: 799,
    includedCredits: 16990,
    includedKind: "monthly",
    topUpRatePerUah: 213, // 1 ₴ = 213 кр (= 0.0047 ₴/кр)
    effectivePricePerCreditUah: 799 / 16990,
  },
};

export const PLAN_LIST: BillingPlan[] = [PLANS.start, PLANS.smart, PLANS.premium];

// ── System margin & partner commission ─────────────────────────
export const SYSTEM_MARGIN_TARGET = 0.20;

export const PARTNER_COMMISSION_RATE = 0.10;
export const PARTNER_COMMISSION_BASIS: "turnover_uah" | "margin" = "turnover_uah";
export const PARTNER_PAYOUT_THRESHOLD_UAH = 500;
/** Attribution rule: link must exist before client's first payment. */
export const PARTNER_ATTRIBUTION_RULE = "link_before_first_payment" as const;

// ── Free quota for Start plan (monthly, NOT carried over) ──────
export const START_MONTHLY_FREE_CREDITS = 300;

// ── Helpers ─────────────────────────────────────────────────────
export function getPlan(id: PlanId | string | null | undefined): BillingPlan {
  return (id && PLANS[id as PlanId]) || PLANS.smart;
}

export function creditsForUah(uah: number, planId: PlanId | string): number {
  const plan = getPlan(planId);
  return Math.floor(uah * plan.topUpRatePerUah);
}

export function uahForCredits(credits: number, planId: PlanId | string): number {
  const plan = getPlan(planId);
  return credits / plan.topUpRatePerUah;
}

/**
 * Average estimated credits per "action" (used for marketing copy
 * "~46 дій" calculations). Tuned so plan.includedCredits / AVG ≈ marketed actions.
 */
export const AVG_CREDITS_PER_ACTION = 108;
