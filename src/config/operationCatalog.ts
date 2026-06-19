// Central registry of every billable / non-billable operation in the cabinet.
// Used by:
//   - `aiCharge()` to gate AI requests
//   - `CreditsBadge` / `AIOperationConfirmDialog` to show price
//   - `MyPlanTab` to filter transactions
//   - `BudgetConstructor` to forecast monthly cost
//   - per-operation billing payer overrides (delegation contracts)
//
// Concept: everything is FREE except AI. AI operations have an estimated
// credit cost; the actual cost comes from the response (`billing.credits_spent`).

export type OperationKind = "manual" | "ai" | "system";

export type OperationGroup =
  | "documents"
  | "accounting"
  | "reporting"
  | "dps_audits"
  | "chat_consult"
  | "investments_tax"
  | "bank_integration"
  | "registry_integration"
  | "signing"
  | "delegation"
  | "manual"
  | "system";

export interface OperationDef {
  id: string;
  kind: OperationKind;
  group: OperationGroup;
  /** Short human label (Ukrainian) */
  label: string;
  /** Estimated credits per call (only for AI ops). 0 for free ops. */
  estimatedCredits: number;
  /** Description for UI confirmation dialogs */
  description?: string;
  /** Default model used by this operation */
  defaultModel?: string;
  /** Whether the user can configure how often this runs (sync / monitoring) */
  frequencyConfigurable?: boolean;
}

const ai = (
  id: string,
  group: OperationGroup,
  label: string,
  estimatedCredits: number,
  extra: Partial<OperationDef> = {},
): OperationDef => ({
  id,
  kind: "ai",
  group,
  label,
  estimatedCredits,
  defaultModel: "google/gemini-2.5-flash",
  ...extra,
});

const manual = (id: string, label: string): OperationDef => ({
  id,
  kind: "manual",
  group: "manual",
  label,
  estimatedCredits: 0,
});

const system = (id: string, label: string): OperationDef => ({
  id,
  kind: "system",
  group: "system",
  label,
  estimatedCredits: 0,
});

export const OPERATION_CATALOG: Record<string, OperationDef> = {
  // ── A. Documents ─────────────────────────────────────────────
  recognize_check: ai("recognize_check", "documents", "Розпізнавання чеку", 2),
  recognize_expense: ai("recognize_expense", "documents", "Розпізнавання витрати з документа", 2, {
    description: "AI зчитує квитанцію/інвойс і пропонує категорію та суму.",
  }),
  recognize_invoice: ai("recognize_invoice", "documents", "Розпізнавання інвойсу", 3),
  recognize_bank_statement: ai("recognize_bank_statement", "documents", "Розпізнавання банк-виписки", 5),
  recognize_contract: ai("recognize_contract", "documents", "Розпізнавання договору", 8, {
    defaultModel: "google/gemini-2.5-pro",
  }),
  recognize_resume: ai("recognize_resume", "documents", "Розпізнавання резюме", 2),
  document_classify: ai("document_classify", "documents", "Класифікація документа", 1, {
    defaultModel: "google/gemini-2.5-flash-lite",
  }),
  document_summary: ai("document_summary", "documents", "AI-резюме документа", 2),

  // ── B. Accounting ────────────────────────────────────────────
  auto_categorization: ai("auto_categorization", "accounting", "Авто-категоризація транзакції", 1, {
    defaultModel: "google/gemini-2.5-flash-lite",
  }),
  bulk_categorization: ai("bulk_categorization", "accounting", "Масова категоризація", 0.5, {
    defaultModel: "google/gemini-2.5-flash-lite",
  }),
  find_duplicates: ai("find_duplicates", "accounting", "Пошук дублікатів", 2),
  match_payment_invoice: ai("match_payment_invoice", "accounting", "Зіставлення платежу з інвойсом", 3),
  tax_calculation: ai("tax_calculation", "accounting", "Розрахунок податку", 4),
  validity_check: ai("validity_check", "accounting", "Перевірка реквізитів/коректності", 3),

  // ── C. Reporting ─────────────────────────────────────────────
  report_1df: ai("report_1df", "reporting", "Звіт 1ДФ", 10, { defaultModel: "google/gemini-2.5-pro" }),
  report_4df: ai("report_4df", "reporting", "Звіт 4ДФ", 10, { defaultModel: "google/gemini-2.5-pro" }),
  pre_submission_check: ai("pre_submission_check", "reporting", "Перевірка перед поданням", 6),
  explanatory_note: ai("explanatory_note", "reporting", "Пояснювальна записка", 5),
  esv_autofill: ai("esv_autofill", "reporting", "Авто-заповнення ЄСВ", 4),
  report_analysis: ai("report_analysis", "reporting", "AI-аналіз звіту", 8, {
    defaultModel: "google/gemini-2.5-pro",
  }),

  // ── D. ДПС / перевірки ───────────────────────────────────────
  audit_ai_readiness: ai("audit_ai_readiness", "dps_audits", "AI-перевірка готовності до перевірки", 6, {
    defaultModel: "google/gemini-2.5-pro",
  }),
  audit_request_analysis: ai("audit_request_analysis", "dps_audits", "AI-аналіз запиту ДПС", 5, {
    defaultModel: "google/gemini-2.5-pro",
  }),
  audit_response_draft: ai("audit_response_draft", "dps_audits", "AI-чернетка відповіді ДПС", 8, {
    defaultModel: "google/gemini-2.5-pro",
  }),
  risk_assessment: ai("risk_assessment", "dps_audits", "Оцінка податкових ризиків", 5),

  // ── E. Chat / consultations ──────────────────────────────────
  ai_chat_short: ai("ai_chat_short", "chat_consult", "Швидка AI-відповідь", 1),
  ai_consultation: ai("ai_consultation", "chat_consult", "AI-консультація", 5, {
    description: "Розгорнута відповідь з посиланнями на нормативку.",
    defaultModel: "google/gemini-2.5-pro",
  }),
  roi_advice: ai("roi_advice", "chat_consult", "AI-аналіз ROI / дохідності", 4, {
    defaultModel: "google/gemini-2.5-pro",
  }),
  kpi_explain: ai("kpi_explain", "chat_consult", "Пояснення KPI", 3),
  timeline_ai_summary: ai("timeline_ai_summary", "chat_consult", "AI-підсумок таймлайну", 2),
  cashflow_forecast: ai("cashflow_forecast", "chat_consult", "Прогноз cash-flow", 6, {
    defaultModel: "google/gemini-2.5-pro",
  }),
  bi_query: ai("bi_query", "chat_consult", "Conversational BI-запит", 4),
  analytics_ai_comment: ai("analytics_ai_comment", "chat_consult", "AI-коментар до аналітики", 3),

  // ── F. Investments / tax ─────────────────────────────────────
  foreign_tax_credit: ai("foreign_tax_credit", "investments_tax", "Foreign Tax Credit (залік)", 5),
  portfolio_analysis: ai("portfolio_analysis", "investments_tax", "Аналіз портфеля", 8, {
    defaultModel: "google/gemini-2.5-pro",
  }),
  currency_diff: ai("currency_diff", "investments_tax", "Курсові різниці", 4),

  // ── G. Bank integration (frequencyConfigurable) ──────────────
  bank_sync: ai("bank_sync", "bank_integration", "Синхронізація з банком", 0.5, {
    frequencyConfigurable: true,
    defaultModel: "google/gemini-2.5-flash-lite",
  }),
  payment_normalization: ai("payment_normalization", "bank_integration", "Нормалізація платежу", 1, {
    frequencyConfigurable: true,
    defaultModel: "google/gemini-2.5-flash-lite",
  }),
  iban_check: ai("iban_check", "bank_integration", "Перевірка IBAN", 2, { frequencyConfigurable: true }),
  tx_categorization: ai("tx_categorization", "bank_integration", "Категоризація транзакції", 1, {
    frequencyConfigurable: true,
    defaultModel: "google/gemini-2.5-flash-lite",
  }),
  bank_risk_check: ai("bank_risk_check", "bank_integration", "Перевірка ризику транзакції", 2, {
    frequencyConfigurable: true,
  }),

  // ── H. Registry integration (frequencyConfigurable) ──────────
  edr_check: ai("edr_check", "registry_integration", "Перевірка ЄДР", 1, { frequencyConfigurable: true }),
  edr_monitoring: ai("edr_monitoring", "registry_integration", "Моніторинг ЄДР", 2, {
    frequencyConfigurable: true,
  }),
  counterparty_risk: ai("counterparty_risk", "registry_integration", "Ризик контрагента", 5, {
    frequencyConfigurable: true,
    defaultModel: "google/gemini-2.5-pro",
  }),
  iban_validate: ai("iban_validate", "registry_integration", "Валідація IBAN у реєстрі", 0.5, {
    frequencyConfigurable: true,
    defaultModel: "google/gemini-2.5-flash-lite",
  }),
  vat_payer_check: ai("vat_payer_check", "registry_integration", "Перевірка платника ПДВ", 1, {
    frequencyConfigurable: true,
  }),
  dps_blacklist_monitor: ai("dps_blacklist_monitor", "registry_integration", "Моніторинг чорного списку ДПС", 2, {
    frequencyConfigurable: true,
  }),

  // ── I. Signing (КЕП сам по собі — 0) ─────────────────────────
  pre_sign_check: ai("pre_sign_check", "signing", "AI-перевірка перед підписанням", 3),
  template_generation: ai("template_generation", "signing", "Генерація шаблону документа", 8, {
    defaultModel: "google/gemini-2.5-pro",
  }),

  // ── J. Delegation ────────────────────────────────────────────
  partner_onboarding: ai("partner_onboarding", "delegation", "AI-онбординг партнера", 5),
  partner_efficiency: ai("partner_efficiency", "delegation", "Аналіз ефективності партнера", 4),

  // ── Manual / free ────────────────────────────────────────────
  manual_income_entry: manual("manual_income_entry", "Ручне додавання доходу"),
  manual_expense_entry: manual("manual_expense_entry", "Ручне додавання витрати"),
  manual_document_upload: manual("manual_document_upload", "Завантаження документа"),
  manual_report_generate: manual("manual_report_generate", "Формування звіту (без AI)"),
  manual_payment_create: manual("manual_payment_create", "Створення платіжного доручення"),

  // ── System ───────────────────────────────────────────────────
  system_kep_sign: system("system_kep_sign", "Підписання документа КЕП"),
  system_auto_sign: system("system_auto_sign", "Авто-підписання за правилом"),
};

export function getOperation(id: string): OperationDef | undefined {
  return OPERATION_CATALOG[id];
}

export function isAiOperation(id: string): boolean {
  return getOperation(id)?.kind === "ai";
}

export function isFreeOperation(id: string): boolean {
  const op = getOperation(id);
  return !!op && op.kind !== "ai";
}

export function listAiOperations(): OperationDef[] {
  return Object.values(OPERATION_CATALOG).filter((o) => o.kind === "ai");
}

export function listManualOperations(): OperationDef[] {
  return Object.values(OPERATION_CATALOG).filter((o) => o.kind === "manual");
}

export function listOperationsByGroup(group: OperationGroup): OperationDef[] {
  return Object.values(OPERATION_CATALOG).filter((o) => o.group === group);
}

export function listConfigurableOperations(): OperationDef[] {
  return Object.values(OPERATION_CATALOG).filter((o) => o.frequencyConfigurable);
}

export const OPERATION_GROUP_LABELS: Record<OperationGroup, string> = {
  documents: "Документи",
  accounting: "Облік",
  reporting: "Звітність",
  dps_audits: "ДПС / перевірки",
  chat_consult: "Чат і консультації",
  investments_tax: "Інвестиції та податки",
  bank_integration: "Інтеграція з банком",
  registry_integration: "Інтеграція з реєстрами",
  signing: "Підписання",
  delegation: "Делегування",
  manual: "Ручні дії",
  system: "Системні",
};
