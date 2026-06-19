// Server-side mirror of fixed costs from src/config/operationCatalog.ts.
// Keep in sync when the canonical catalog changes.
// For any operation NOT listed here, ai-charge falls back to token-based
// estimation with a 20% margin.

export interface ServerOpCost {
  cost: number;            // fixed cost in credits
  defaultModel?: string;
}

export const OPERATION_COSTS: Record<string, ServerOpCost> = {
  // Documents
  recognize_check: { cost: 2 },
  recognize_expense: { cost: 2 },
  recognize_invoice: { cost: 3 },
  recognize_bank_statement: { cost: 5 },
  recognize_contract: { cost: 8, defaultModel: "google/gemini-2.5-pro" },
  recognize_resume: { cost: 2 },
  document_classify: { cost: 1, defaultModel: "google/gemini-2.5-flash-lite" },
  document_summary: { cost: 2 },

  // Accounting
  auto_categorization: { cost: 1, defaultModel: "google/gemini-2.5-flash-lite" },
  bulk_categorization: { cost: 0.5, defaultModel: "google/gemini-2.5-flash-lite" },
  find_duplicates: { cost: 2 },
  match_payment_invoice: { cost: 3 },
  tax_calculation: { cost: 4 },
  validity_check: { cost: 3 },

  // Reporting
  report_1df: { cost: 10, defaultModel: "google/gemini-2.5-pro" },
  report_4df: { cost: 10, defaultModel: "google/gemini-2.5-pro" },
  pre_submission_check: { cost: 6 },
  explanatory_note: { cost: 5 },
  esv_autofill: { cost: 4 },

  // System margin baseline (in credits per 1 ₴ on the base "start" plan).
  // 1 ₴ → 100 кр, so 1 кр ≈ 0.01 ₴ at base rate.
};

/**
 * Token-based cost estimate with 20% system margin baked in.
 * Used as fallback for unknown / open-chat operations.
 */
export function estimateCreditsFromTokens(
  model: string,
  inTok: number,
  outTok: number,
): number {
  const heavy = model.includes("pro") || model.includes("gpt-5");
  const inRate = heavy ? 1 / 800 : 1 / 1500;
  const outRate = heavy ? 1 / 200 : 1 / 400;
  const raw = inTok * inRate + outTok * outRate;
  const withMargin = raw * 1.20;
  return Math.max(0.01, Math.round(withMargin * 100) / 100);
}
