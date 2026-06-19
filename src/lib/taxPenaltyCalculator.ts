/**
 * Розрахунок пені та штрафу за прострочення податкового зобов'язання.
 *
 * Пеня: 120% облікової ставки НБУ ÷ 365 × кількість днів прострочення (ст. 129.4 ПКУ).
 * Штраф: 5% (≤30 днів), 10% (31–90), 25% (>90) від суми (ст. 124 ПКУ).
 *
 * Облікова ставка НБУ станом на 04.2026 — 13.5% → ставка пені ≈ 16.2%/рік.
 */

export const NBU_KEY_RATE_2026 = 0.135; // 13.5%
export const PENALTY_RATE_ANNUAL = NBU_KEY_RATE_2026 * 1.2; // 16.2%

export interface TaxPenaltyResult {
  /** Пеня за прострочення (₴) */
  penalty: number;
  /** Штраф за несплату (₴) */
  fine: number;
  /** Пеня + штраф (₴) */
  total: number;
  /** Кількість днів прострочення */
  daysOverdue: number;
  /** Відсоток штрафу, що застосовується */
  finePercent: number;
  /** Текстова формула пені */
  formula: string;
}

export function calcTaxPenalty(amount: number, daysOverdue: number): TaxPenaltyResult {
  const safeDays = Math.max(0, Math.floor(daysOverdue));
  const safeAmount = Math.max(0, amount);

  const penalty = (safeAmount * PENALTY_RATE_ANNUAL * safeDays) / 365;

  let finePercent: number;
  if (safeDays === 0) finePercent = 0;
  else if (safeDays <= 30) finePercent = 0.05;
  else if (safeDays <= 90) finePercent = 0.1;
  else finePercent = 0.25;

  const fine = safeAmount * finePercent;
  const total = penalty + fine;

  const formula =
    `${(PENALTY_RATE_ANNUAL * 100).toFixed(1)}%/рік × ${safeDays} ${
      safeDays === 1 ? "день" : "дн."
    }`;

  return {
    penalty: Math.round(penalty),
    fine: Math.round(fine),
    total: Math.round(total),
    daysOverdue: safeDays,
    finePercent,
    formula,
  };
}

export function formatPenaltyShort(total: number): string {
  if (total <= 0) return "";
  return `+₴${total.toLocaleString("uk-UA")} санкції`;
}
