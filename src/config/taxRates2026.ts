/**
 * Tax Rates 2026 — Single Source of Truth
 *
 * Усі ставки, мінімальні бази, ліміти та КБК у одному місці.
 * Будь-яка зміна законодавства — лише тут.
 *
 * Джерела:
 * - ПКУ ст. 167 (ПДФО), ст. 168 (нарахування), ст. 169 (ПСП), ст. 187 (перша подія),
 *   ст. 291-300 (ЄП), п. 16-1 підрозд. 10 розд. XX (ВЗ)
 * - ЗУ "Про збір та облік ЄСВ" ст. 7-8
 * - Постанова НБУ №216 (формат призначення платежу)
 */

// ========== СТАВКИ ПОДАТКІВ ==========

export const TAX_RATES_2026 = {
  /** ПДФО — податок на доходи фізосіб (ПКУ ст. 167.1) */
  PDFO: 0.18,
  /** Військовий збір (з 01.12.2024 — 5%) */
  MILITARY_TAX: 0.05,
  /** ЄСВ — нарахування роботодавця */
  ESV: 0.22,
  /** Єдиний податок 3 група (5% без ПДВ або 3% з ПДВ) */
  EP_GROUP_3: 0.05,
  EP_GROUP_3_VAT: 0.03,
  /** ПДВ стандартна ставка */
  VAT_STANDARD: 0.20,
  /** ПДВ пільгова ставка (медикаменти, дитяче харчування тощо) */
  VAT_REDUCED: 0.07,
  /** ПДВ нульова ставка (експорт) */
  VAT_ZERO: 0,
} as const;

// ========== МІНІМАЛЬНІ БАЗИ ==========

/** Мінімальна заробітна плата на 2026 (грн/міс) */
export const MIN_WAGE_2026 = 8000;

/** Прожитковий мінімум для працездатних осіб на 2026 (грн) */
export const SUBSISTENCE_MIN_2026 = 3028;

/** Мінімальний внесок ЄСВ на місяць (= MIN_WAGE × 22%) */
export const MIN_ESV_MONTHLY_2026 = Math.round(MIN_WAGE_2026 * TAX_RATES_2026.ESV);

// ========== ПОДАТКОВА СОЦІАЛЬНА ПІЛЬГА (ПСП) ==========
// ПКУ ст. 169.1 — застосовується якщо зарплата ≤ прожитковий мін × 1.4

/** Граничний дохід для застосування ПСП */
export const PSP_THRESHOLD_2026 = Math.round(SUBSISTENCE_MIN_2026 * 1.4);

/** Базовий розмір ПСП (50% прожиткового мінімуму) */
export const PSP_BASIC_2026 = Math.round(SUBSISTENCE_MIN_2026 * 0.5);

// ========== ЛІМІТИ ДОХОДУ ЄП ==========
// ПКУ ст. 291.4 — для груп 1/2/3 у 2026 році
// База: мінзарплата на 01.01 × коеф (167 / 834 / 1167 — індикативно)

export const EP_INCOME_LIMITS_2026 = {
  GROUP_1: 1_336_000,    // 167 × мінзарплата (≈ 167 × 8000)
  GROUP_2: 6_672_000,    // 834 × мінзарплата
  GROUP_3: 9_336_000,    // 1167 × мінзарплата
} as const;

// ========== КБК (КОДИ БЮДЖЕТНОЇ КЛАСИФІКАЦІЇ) ==========

export const KBK_2026 = {
  EP_GROUP_3: "18050400",
  ESV_FOP: "71040000",
  ESV_EMPLOYER: "71040000",
  PDFO_SALARY: "11010100",
  MILITARY_TAX: "11011000",
  VAT: "14010100",
  CIT: "11021000",
  /** Пеня по ЄП */
  EP_PENALTY: "18050500",
  /** Штраф по ЄП */
  EP_FINE: "18050600",
} as const;

// ========== КОДИ ВИДУ СПЛАТИ (Постанова НБУ №216) ==========

export const PAYMENT_KIND_CODES = {
  /** 101 — поточна сплата податку/збору */
  CURRENT: "101",
  /** 121 — сплата штрафної санкції */
  FINE: "121",
  /** 140 — сплата пені */
  PENALTY: "140",
  /** 130 — сплата за актом перевірки */
  AUDIT: "130",
} as const;

export const PAYMENT_KIND_LABELS: Record<string, string> = {
  "101": "Поточна сплата податку",
  "121": "Сплата штрафної санкції",
  "140": "Сплата пені",
  "130": "Сплата за актом перевірки",
};

// ========== ХЕЛПЕРИ ==========

/**
 * Розрахунок утримань із зарплати з урахуванням ПСП (ПКУ 169.1).
 * Повертає чисті податки (з працівника) + ЄСВ роботодавця окремо.
 */
export function calculateSalaryWithPSP(grossAmount: number, hasPSP: boolean = false) {
  const applyPSP = hasPSP && grossAmount <= PSP_THRESHOLD_2026;
  const taxableBase = applyPSP ? Math.max(0, grossAmount - PSP_BASIC_2026) : grossAmount;
  const pdfo = Math.round(taxableBase * TAX_RATES_2026.PDFO);
  const military = Math.round(grossAmount * TAX_RATES_2026.MILITARY_TAX);
  // База ЄСВ — не менше мінзарплати
  const esvBase = Math.max(grossAmount, MIN_WAGE_2026);
  const esvEmployer = Math.round(esvBase * TAX_RATES_2026.ESV);
  return {
    gross: grossAmount,
    pdfo,
    military,
    esvEmployer,
    net: grossAmount - pdfo - military,
    pspApplied: applyPSP,
    pspAmount: applyPSP ? PSP_BASIC_2026 : 0,
  };
}

/**
 * Залишок ліміту ЄП за групою.
 */
export function getEpLimitInfo(group: 1 | 2 | 3, usedAmount: number) {
  const limit =
    group === 1 ? EP_INCOME_LIMITS_2026.GROUP_1 :
    group === 2 ? EP_INCOME_LIMITS_2026.GROUP_2 :
    EP_INCOME_LIMITS_2026.GROUP_3;
  return {
    limit,
    used: usedAmount,
    remaining: Math.max(0, limit - usedAmount),
    percentUsed: limit > 0 ? Math.min(100, (usedAmount / limit) * 100) : 0,
    overLimit: usedAmount > limit,
  };
}
