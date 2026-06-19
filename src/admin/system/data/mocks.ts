/**
 * Demo-mock data for the Platform Admin Operations Center.
 * All purely client-side; no DB writes. Replaced with real queries later.
 */

export interface PlatformUserMock {
  id: string;
  email: string;
  name: string;
  status: "active" | "blocked" | "pending_verification";
  role: "user" | "support" | "admin";
  cabinetsCount: number;
  lastLoginAt: string;
  plan: "start" | "smart" | "premium";
  signupAt: string;
}

export const MOCK_USERS: PlatformUserMock[] = [
  { id: "u-1", email: "o.petrenko@gmail.com", name: "Олена Петренко", status: "active", role: "user", cabinetsCount: 2, lastLoginAt: "2026-05-27T08:14:00Z", plan: "smart", signupAt: "2025-11-03T00:00:00Z" },
  { id: "u-2", email: "ivan@brewery.ua", name: "Іван Коваленко", status: "active", role: "user", cabinetsCount: 1, lastLoginAt: "2026-05-26T19:02:00Z", plan: "premium", signupAt: "2025-08-12T00:00:00Z" },
  { id: "u-3", email: "support@fintodo.ua", name: "Марія Шевчук", status: "active", role: "support", cabinetsCount: 0, lastLoginAt: "2026-05-27T07:30:00Z", plan: "start", signupAt: "2025-02-01T00:00:00Z" },
  { id: "u-4", email: "blocked@test.ua", name: "Тестовий Користувач", status: "blocked", role: "user", cabinetsCount: 1, lastLoginAt: "2026-03-10T12:00:00Z", plan: "start", signupAt: "2026-01-15T00:00:00Z" },
  { id: "u-5", email: "newbie@startup.ua", name: "Андрій Бондар", status: "pending_verification", role: "user", cabinetsCount: 0, lastLoginAt: "2026-05-25T11:00:00Z", plan: "start", signupAt: "2026-05-24T00:00:00Z" },
];

export interface PlatformCabinetMock {
  id: string;
  name: string;
  type: "fop" | "tov" | "fop_group" | "individual";
  code: string;
  status: "ok" | "warning" | "error";
  integrationsCount: number;
  lastSyncAt: string;
  errorsCount: number;
  ownerUserId: string;
}

export const MOCK_CABINETS: PlatformCabinetMock[] = [
  { id: "c-1", name: "ФОП Петренко О. (2 група)", type: "fop", code: "1234567890", status: "warning", integrationsCount: 4, lastSyncAt: "2026-05-27T07:00:00Z", errorsCount: 2, ownerUserId: "u-1" },
  { id: "c-2", name: "ТОВ «Зерно-Україна»", type: "tov", code: "12345678", status: "ok", integrationsCount: 6, lastSyncAt: "2026-05-27T09:12:00Z", errorsCount: 0, ownerUserId: "u-2" },
  { id: "c-3", name: "Група ФОП «Консалтинг»", type: "fop_group", code: "—", status: "ok", integrationsCount: 8, lastSyncAt: "2026-05-27T08:45:00Z", errorsCount: 1, ownerUserId: "u-1" },
  { id: "c-4", name: "Фізособа Коваленко І.", type: "individual", code: "2345678901", status: "error", integrationsCount: 2, lastSyncAt: "2026-05-26T14:00:00Z", errorsCount: 5, ownerUserId: "u-2" },
  { id: "c-5", name: "ФОП Бондар А. (3 група)", type: "fop", code: "3456789012", status: "ok", integrationsCount: 3, lastSyncAt: "2026-05-27T06:30:00Z", errorsCount: 0, ownerUserId: "u-5" },
];

export interface IncidentMock {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "new" | "in_progress" | "resolved";
  source: "integration" | "ai" | "platform" | "billing";
  createdAt: string;
  affectedCabinets: number;
  description: string;
}

export const MOCK_INCIDENTS: IncidentMock[] = [
  { id: "inc-1", title: "Деградація інтеграції ПриватБанк", severity: "high", status: "in_progress", source: "integration", createdAt: "2026-05-27T06:12:00Z", affectedCabinets: 47, description: "Зростання помилок до 22% при синхронізації виписок з 06:00." },
  { id: "inc-2", title: "AI-чат повертає застарілу ставку ЄСВ", severity: "medium", status: "new", source: "ai", createdAt: "2026-05-27T08:30:00Z", affectedCabinets: 3, description: "У 3 діалогах AI цитує ставку ЄСВ за 2024 рік замість 2026." },
  { id: "inc-3", title: "Аномалія списань кредитів", severity: "medium", status: "resolved", source: "billing", createdAt: "2026-05-26T22:00:00Z", affectedCabinets: 1, description: "Виявлено х5 від медіани витрат у кабінеті c-3 за дві години." },
];

export interface AiQaDialogMock {
  id: string;
  cabinetId: string;
  channel: "chat" | "voice";
  intent: string;
  preview: string;
  flags: Array<"fact_error" | "missing_context" | "risky" | "bad_tone">;
  createdAt: string;
  status: "pending" | "ok" | "needs_fix";
}

export const MOCK_AI_QA: AiQaDialogMock[] = [
  { id: "qa-1", cabinetId: "c-1", channel: "chat", intent: "fop_limit_check", preview: "Користувач: «Скільки мені ще можна заробити цього року?» — AI відповів коректно з огляду на 87.6% ліміту.", flags: [], createdAt: "2026-05-27T08:14:00Z", status: "ok" },
  { id: "qa-2", cabinetId: "c-2", channel: "chat", intent: "vat_period_close", preview: "AI запропонував закрити період до подання декларації, але не врахував перенесення вихідних.", flags: ["missing_context"], createdAt: "2026-05-27T07:20:00Z", status: "needs_fix" },
  { id: "qa-3", cabinetId: "c-4", channel: "voice", intent: "tax_declaration_help", preview: "Voice: AI повідомив дедлайн декларації фізособи з помилкою (стара дата).", flags: ["fact_error", "risky"], createdAt: "2026-05-26T16:00:00Z", status: "needs_fix" },
  { id: "qa-4", cabinetId: "c-3", channel: "chat", intent: "esv_calc", preview: "Розрахунок ЄСВ для групи ФОП — все коректно.", flags: [], createdAt: "2026-05-27T06:55:00Z", status: "ok" },
  { id: "qa-5", cabinetId: "c-5", channel: "chat", intent: "credit_dispute", preview: "Користувач сперечається про списання кредитів — AI потрібен м'якший тон.", flags: ["bad_tone"], createdAt: "2026-05-26T19:30:00Z", status: "pending" },
];

export interface PlatformEventMock {
  id: string;
  category: "bank" | "documents" | "payroll" | "tax" | "integration";
  name: string;
  description: string;
  examplePayload: Record<string, unknown>;
}

export const MOCK_EVENTS: PlatformEventMock[] = [
  { id: "evt-bank-in", category: "bank", name: "Надходження на банк", description: "Надійшла оплата на рахунок кабінету.", examplePayload: { amount: 12500, currency: "UAH", purpose: "оплата за послуги", counterparty: "ТОВ «Альфа»" } },
  { id: "evt-bank-out", category: "bank", name: "Списання з банку", description: "Здійснено платіж із рахунку кабінету.", examplePayload: { amount: 4200, purpose: "оплата ЄСВ" } },
  { id: "evt-doc-paid", category: "documents", name: "Рахунок оплачено", description: "Рахунок повністю оплачений контрагентом.", examplePayload: { invoiceId: "inv-2026-0331" } },
  { id: "evt-tax-deadline", category: "tax", name: "Наближається дедлайн", description: "Сповіщення про близький податковий дедлайн.", examplePayload: { type: "vat_declaration", dueIn: 5 } },
  { id: "evt-tax-limit", category: "tax", name: "Ризик перевищення ліміту", description: "Користувач наближається до межі ліміту групи.", examplePayload: { fopGroup: 2, used: 87.6 } },
  { id: "evt-int-fail", category: "integration", name: "Помилка синхронізації", description: "Помилка під час синхронізації даних з інтеграцією.", examplePayload: { provider: "privatbank", code: "AUTH_EXPIRED" } },
];

export interface PlatformRuleMock {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  appliesTo: Array<"fop" | "tov" | "individual">;
  status: "draft" | "active" | "disabled";
  safeMode: boolean;
  version: number;
}

export const MOCK_RULES: PlatformRuleMock[] = [
  { id: "r-1", name: "Оплата за послуги → акт виконаних робіт", trigger: "evt-bank-in", conditions: ["призначення містить «оплата за послуги»", "контрагент існує в довіднику"], actions: ["Створити чернетку акта", "Підставити контрагента", "Запропонувати категорію доходу", "Показати підтвердження у чаті"], appliesTo: ["fop", "tov"], status: "active", safeMode: false, version: 3 },
  { id: "r-2", name: "Надходження ФОП → запис у книгу доходів", trigger: "evt-bank-in", conditions: ["кабінет = ФОП", "сума > 0"], actions: ["Створити запис у книзі", "Перерахувати прогноз ЄП"], appliesTo: ["fop"], status: "active", safeMode: false, version: 2 },
  { id: "r-3", name: "Ризик ліміту ФОП → попередження", trigger: "evt-tax-limit", conditions: ["used >= 85%"], actions: ["Показати банер у Огляді", "Додати чіп у чат", "Сформувати рекомендацію"], appliesTo: ["fop"], status: "active", safeMode: true, version: 1 },
  { id: "r-4", name: "Дедлайн декларації фізособи → чернетка", trigger: "evt-tax-deadline", conditions: ["type = personal_income", "dueIn <= 14"], actions: ["Створити чернетку декларації", "Нагадування в чаті"], appliesTo: ["individual"], status: "draft", safeMode: true, version: 1 },
  { id: "r-5", name: "Помилка інтеграції → інцидент + пояснення", trigger: "evt-int-fail", conditions: ["частота помилок > 10/год"], actions: ["Створити інцидент", "Показати banner у чаті", "Підказати дії"], appliesTo: ["fop", "tov", "individual"], status: "active", safeMode: false, version: 4 },
];

export interface RegulatoryUpdateMock {
  id: string;
  title: string;
  date: string;
  affects: Array<"fop" | "tov" | "individual">;
  riskLevel: "low" | "medium" | "high";
  stage: "detected" | "ai_proposed" | "in_review" | "approved" | "testing" | "ready" | "deployed";
  summary: string;
}

export const MOCK_REGULATORY: RegulatoryUpdateMock[] = [
  { id: "reg-1", title: "Оновлення умов для ФОП 2 групи (демо)", date: "2026-05-20", affects: ["fop"], riskLevel: "medium", stage: "ai_proposed", summary: "Зміни порогів та попереджень для платників 2 групи." },
  { id: "reg-2", title: "Нова форма декларації фізособи (демо)", date: "2026-05-18", affects: ["individual"], riskLevel: "high", stage: "in_review", summary: "Структурні зміни форми річної декларації." },
  { id: "reg-3", title: "Зміна ставки ЄСВ (демо)", date: "2026-04-30", affects: ["fop", "tov"], riskLevel: "medium", stage: "deployed", summary: "Перерахунок прогнозів за новою ставкою." },
];

// ===== Knowledge base =====
export interface KnowledgeArticleMock {
  id: string;
  title: string;
  category: "taxes" | "documents" | "integrations" | "examples";
  status: "draft" | "review" | "active" | "archived";
  version: number;
  updatedAt: string;
  author: string;
  intents: string[];
}
export const MOCK_KNOWLEDGE_ARTICLES: KnowledgeArticleMock[] = [
  { id: "kb-1", title: "Ліміти ФОП 2 групи 2026", category: "taxes", status: "active", version: 4, updatedAt: "2026-05-22", author: "Олена М.", intents: ["fop.limits", "fop.group2"] },
  { id: "kb-2", title: "Як подати декларацію фізособи", category: "documents", status: "review", version: 2, updatedAt: "2026-05-19", author: "AI-чернетка", intents: ["individual.declaration"] },
  { id: "kb-3", title: "Підключення ПриватБанку (виписки)", category: "integrations", status: "active", version: 7, updatedAt: "2026-05-10", author: "Ігор С.", intents: ["integration.bank.privat"] },
  { id: "kb-4", title: "Приклад: продаж послуг нерезиденту", category: "examples", status: "draft", version: 1, updatedAt: "2026-05-24", author: "AI-чернетка", intents: ["fop.foreign_income"] },
  { id: "kb-5", title: "Стара інструкція ЄСВ (2024)", category: "taxes", status: "archived", version: 9, updatedAt: "2024-12-30", author: "Олена М.", intents: ["esv.legacy"] },
];

// ===== Chat scenarios =====
export interface ChatScenarioMock {
  id: string;
  name: string;
  intent: string;
  uiTab: string;
  triggers: string[];
  tone: "formal" | "friendly" | "neutral";
  safeMode: boolean;
}
export const MOCK_CHAT_SCENARIOS: ChatScenarioMock[] = [
  { id: "cs-1", name: "Перевірити ліміти ФОП", intent: "fop.check_limits", uiTab: "Огляд / Ліміти", triggers: ["скільки залишилось", "ліміт", "поріг"], tone: "friendly", safeMode: false },
  { id: "cs-2", name: "Створити чернетку декларації", intent: "individual.draft_declaration", uiTab: "Декларації", triggers: ["декларація", "подати річну"], tone: "neutral", safeMode: true },
  { id: "cs-3", name: "Імпорт виписки з банку", intent: "integration.import_statement", uiTab: "Платежі", triggers: ["виписка", "імпорт банку"], tone: "friendly", safeMode: false },
  { id: "cs-4", name: "Пояснити нарахування ЄСВ", intent: "esv.explain", uiTab: "Податки", triggers: ["чому стільки єсв", "єсв"], tone: "formal", safeMode: false },
];

// ===== Voice scenarios =====
export interface VoiceScenarioMock {
  id: string;
  name: string;
  intent: string;
  language: "uk-UA" | "en-US";
  steps: string[];
  recordCall: boolean;
}
export const MOCK_VOICE_SCENARIOS: VoiceScenarioMock[] = [
  { id: "vs-1", name: "Ліміти ФОП", intent: "voice.fop.limits", language: "uk-UA", steps: ["Привітання та згода на запис", "Ідентифікація кабінету", "Озвучити поточні ліміти й залишок", "Пропозиція надіслати деталі у чат"], recordCall: true },
  { id: "vs-2", name: "Підключення банку", intent: "voice.bank.connect", language: "uk-UA", steps: ["Уточнити банк", "Підказати, де взяти токен", "Запросити підтвердження", "Передати оператору при складнощах"], recordCall: true },
  { id: "vs-3", name: "Статус декларації", intent: "voice.declaration.status", language: "uk-UA", steps: ["Ідентифікація", "Прочитати статус подання", "Нагадати про дедлайн", "SMS з посиланням"], recordCall: true },
];

// ===== Connectors =====
export interface ConnectorMock {
  id: string;
  name: string;
  category: "bank" | "edo" | "gov" | "kep";
  status: "ok" | "degraded" | "down";
  successRate: number;
  affectedCabinets: number;
}
export const MOCK_CONNECTORS: ConnectorMock[] = [
  { id: "c-1", name: "ПриватБанк (виписки)", category: "bank", status: "degraded", successRate: 82, affectedCabinets: 14 },
  { id: "c-2", name: "Monobank Business", category: "bank", status: "ok", successRate: 99, affectedCabinets: 0 },
  { id: "c-3", name: "Vchasno (ЕДО)", category: "edo", status: "ok", successRate: 98, affectedCabinets: 1 },
  { id: "c-4", name: "ДПС — Кабінет платника", category: "gov", status: "ok", successRate: 97, affectedCabinets: 2 },
  { id: "c-5", name: "КЕП — хмарний підпис", category: "kep", status: "down", successRate: 41, affectedCabinets: 27 },
];

// ===== Audit log =====
export interface AuditLogMock {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  scope: "knowledge" | "policy" | "cabinet" | "billing" | "rules";
}
export const MOCK_AUDIT_LOG: AuditLogMock[] = [
  { id: "a-1", at: "2026-05-25T10:14:00Z", actor: "Олена М.", action: "Опублікувала статтю", detail: "kb-1 → v4 «Ліміти ФОП 2 групи 2026»", scope: "knowledge" },
  { id: "a-2", at: "2026-05-25T09:02:00Z", actor: "Super Admin", action: "Увімкнув Safe-mode", detail: "Глобально для AI-чату", scope: "policy" },
  { id: "a-3", at: "2026-05-24T18:40:00Z", actor: "Support Admin", action: "Support View", detail: "Кабінет ТОВ «Альфа» — режим перегляду", scope: "cabinet" },
  { id: "a-4", at: "2026-05-24T12:11:00Z", actor: "Billing Admin", action: "Ручне коригування", detail: "+200 кредитів кабінет cab-3 (помилка списання)", scope: "billing" },
  { id: "a-5", at: "2026-05-23T15:30:00Z", actor: "AI Rules Architect", action: "Опубліковано правило", detail: "rule-12 «Попередження про перевищення доходу» → Пілот", scope: "rules" },
];

// ===== Billing transactions =====
export interface BillingTxMock {
  id: string;
  at: string;
  cabinetId: string;
  cabinetName: string;
  type: "charge" | "topup" | "refund" | "adjust";
  amount: number;
  reason: string;
  anomaly?: boolean;
}
export const MOCK_BILLING_TX: BillingTxMock[] = [
  { id: "tx-1", at: "2026-05-25T11:02:00Z", cabinetId: "cab-1", cabinetName: "ТОВ «Альфа»", type: "charge", amount: -12, reason: "AI: аналіз виписки" },
  { id: "tx-2", at: "2026-05-25T09:48:00Z", cabinetId: "cab-2", cabinetName: "ФОП Петренко", type: "topup", amount: 500, reason: "Поповнення картою" },
  { id: "tx-3", at: "2026-05-24T22:10:00Z", cabinetId: "cab-3", cabinetName: "ФОП Сидоренко", type: "charge", amount: -340, reason: "Пакетне розпізнавання документів", anomaly: true },
  { id: "tx-4", at: "2026-05-24T18:41:00Z", cabinetId: "cab-3", cabinetName: "ФОП Сидоренко", type: "adjust", amount: 200, reason: "Ручне коригування (Billing Admin)" },
  { id: "tx-5", at: "2026-05-23T08:00:00Z", cabinetId: "cab-4", cabinetName: "Фізособа Іваненко", type: "charge", amount: -2, reason: "AI: підказка щодо декларації" },
];

// ===== Tickets =====
export interface TicketMock {
  id: string;
  channel: "chat" | "voice" | "email";
  subject: string;
  priority: "low" | "med" | "high" | "urgent";
  sla: string;
  cabinet: string;
  status: "new" | "in_progress" | "resolved";
}
export const MOCK_TICKETS: TicketMock[] = [
  { id: "tk-1", channel: "voice", subject: "Не підтягуються виписки ПриватБанк", priority: "high", sla: "4 год", cabinet: "ТОВ «Альфа»", status: "in_progress" },
  { id: "tk-2", channel: "chat", subject: "Питання щодо ліміту 2 групи", priority: "low", sla: "24 год", cabinet: "ФОП Петренко", status: "resolved" },
  { id: "tk-3", channel: "email", subject: "Помилка КЕП-підпису", priority: "urgent", sla: "1 год", cabinet: "ФОП Сидоренко", status: "new" },
];

// ===== Intents library =====
export interface IntentMock {
  id: string;
  name: string;
  group: "integration" | "operation" | "analytics" | "profile" | "billing";
  channels: Array<"chat" | "voice">;
  linkedArticle?: string;
}
export const MOCK_INTENTS: IntentMock[] = [
  { id: "i-1", name: "fop.check_limits", group: "analytics", channels: ["chat", "voice"], linkedArticle: "kb-1" },
  { id: "i-2", name: "integration.bank.privat", group: "integration", channels: ["chat", "voice"], linkedArticle: "kb-3" },
  { id: "i-3", name: "individual.draft_declaration", group: "operation", channels: ["chat"], linkedArticle: "kb-2" },
  { id: "i-4", name: "billing.topup", group: "billing", channels: ["chat"] },
  { id: "i-5", name: "profile.change_email", group: "profile", channels: ["chat"] },
];

// ===== Roles matrix (RBAC) =====
export const RBAC_ROLES = [
  "Super Admin", "Ops Admin", "Support Admin", "Support Agent",
  "Knowledge Manager", "AI QA Analyst", "Integration Admin", "Billing Admin", "AI Rules Architect",
] as const;
export const RBAC_MODULES = [
  "Користувачі", "Кабінети", "Інтеграції", "Знання/AI", "Комунікації", "Правила", "Білінг", "Аудит",
] as const;
// 0 — немає, 1 — read, 2 — full
export const MOCK_ROLES_MATRIX: Record<string, number[]> = {
  "Super Admin":           [2, 2, 2, 2, 2, 2, 2, 2],
  "Ops Admin":             [2, 2, 2, 1, 2, 1, 1, 1],
  "Support Admin":         [2, 2, 1, 1, 2, 0, 1, 1],
  "Support Agent":         [1, 1, 0, 1, 1, 0, 0, 0],
  "Knowledge Manager":     [0, 0, 0, 2, 1, 0, 0, 1],
  "AI QA Analyst":         [1, 1, 0, 1, 2, 1, 0, 1],
  "Integration Admin":     [0, 1, 2, 0, 0, 0, 0, 1],
  "Billing Admin":         [1, 1, 0, 0, 0, 0, 2, 1],
  "AI Rules Architect":    [0, 1, 0, 1, 1, 2, 0, 1],
};

// ===== Comms analytics =====
export const MOCK_COMMS_ANALYTICS = {
  topQueries: [
    { q: "Скільки лишилось до ліміту?", count: 412, channel: "chat" as const },
    { q: "Як підключити ПриватБанк", count: 287, channel: "chat" as const },
    { q: "Статус декларації", count: 196, channel: "voice" as const },
    { q: "Чому ЄСВ такий", count: 158, channel: "chat" as const },
  ],
  selfResolved: 78,
  escalated: 12,
  hotTopics: ["Зміна ставки ЄСВ", "Збій ПриватБанку", "Нова форма декларації"],
};

// ===== Regulatory proposals (AI Rules Assistant) =====
export interface RegulatoryProposalMock {
  affectedParams: string[];
  ruleDiff: { before: string; after: string };
  recommendedSafeMode: boolean;
  uiImpact: string;
  testCases: string[];
}
export const MOCK_REGULATORY_PROPOSALS: Record<string, RegulatoryProposalMock> = {
  "reg-1": {
    affectedParams: ["Поріг доходу ФОП 2 групи", "Лімітне попередження за 90%"],
    ruleDiff: { before: "limit_year = 7_818_900 UAH", after: "limit_year = 8_285_700 UAH" },
    recommendedSafeMode: true,
    uiImpact: "Бейдж «Ліміт» на Огляді, нове попередження в чаті",
    testCases: ["ФОП на межі 80% ліміту", "ФОП, що перетнув старий поріг", "Розрахунок прогнозу до кінця року"],
  },
  "reg-2": {
    affectedParams: ["Структура форми річної декларації", "Нові поля «Іноземні доходи»"],
    ruleDiff: { before: "form_version = 2025-1", after: "form_version = 2026-1 + foreign_income_block" },
    recommendedSafeMode: true,
    uiImpact: "Нова вкладка «Іноземні доходи» в Декларації",
    testCases: ["Фізособа без іноземних доходів", "Фізособа з іноземною дивідендною виплатою", "Помилка обовʼязкового поля"],
  },
  "reg-3": {
    affectedParams: ["Ставка ЄСВ"],
    ruleDiff: { before: "esv_rate = 0.22", after: "esv_rate = 0.225" },
    recommendedSafeMode: false,
    uiImpact: "Перерахунок прогнозу податків у Огляді",
    testCases: ["ФОП мінімальна база", "ТОВ зі співробітниками", "Перерахунок попередніх місяців"],
  },
};

// ===== Ticket timeline =====
export interface TicketTimelineEventMock {
  id: string;
  ticketId: string;
  at: string;
  actor: string;
  kind: "created" | "assigned" | "note" | "status_changed" | "resolved" | "template_reply";
  text: string;
}
export const MOCK_TICKET_TIMELINE: TicketTimelineEventMock[] = [
  { id: "tte-1", ticketId: "tk-1", at: "2026-05-27T06:14:00Z", actor: "Користувач (ТОВ «Альфа»)", kind: "created", text: "Виписки з ПриватБанку не оновлюються з 06:00." },
  { id: "tte-2", ticketId: "tk-1", at: "2026-05-27T06:32:00Z", actor: "Support Admin", kind: "assigned", text: "Передано Integration Admin." },
  { id: "tte-3", ticketId: "tk-1", at: "2026-05-27T07:01:00Z", actor: "Integration Admin", kind: "note", text: "Підтверджено деградацію конектора. Звʼязано з інцидентом inc-1." },
  { id: "tte-4", ticketId: "tk-1", at: "2026-05-27T07:45:00Z", actor: "Support Admin", kind: "template_reply", text: "Надіслано шаблонну відповідь «Затримка ПриватБанку — у роботі»." },
  { id: "tte-5", ticketId: "tk-2", at: "2026-05-26T10:00:00Z", actor: "Користувач (ФОП Петренко)", kind: "created", text: "Скільки ще можна заробити цього року?" },
  { id: "tte-6", ticketId: "tk-2", at: "2026-05-26T10:08:00Z", actor: "Support Agent", kind: "resolved", text: "Надано посилання на розрахунок ліміту." },
  { id: "tte-7", ticketId: "tk-3", at: "2026-05-27T05:30:00Z", actor: "Користувач (ФОП Сидоренко)", kind: "created", text: "При підписанні документа KEP видає помилку «session expired»." },
  { id: "tte-8", ticketId: "tk-3", at: "2026-05-27T05:48:00Z", actor: "Support Admin", kind: "status_changed", text: "Передано в роботу — пов'язано з інцидентом КЕП-конектора." },
];

// ===== Conversation transcripts (для SystemConversationDetailPage) =====
export interface ConversationMessageMock { role: "user" | "ai"; text: string; at: string; }
export const MOCK_CONVERSATION_TRANSCRIPTS: Record<string, ConversationMessageMock[]> = {
  "qa-1": [
    { role: "user", text: "Скільки мені ще можна заробити цього року?", at: "2026-05-27T08:14:00Z" },
    { role: "ai", text: "Ви — ФОП 2 групи. Поточний дохід 7 257 000 ₴, ліміт 8 285 700 ₴. Залишок 1 028 700 ₴ (12,4%). Якщо темп збережеться — імовірне досягнення межі у вересні.", at: "2026-05-27T08:14:05Z" },
  ],
  "qa-2": [
    { role: "user", text: "Чи треба закривати період до подання декларації?", at: "2026-05-27T07:20:00Z" },
    { role: "ai", text: "Так, рекомендую закрити період до подання, дедлайн 19 травня.", at: "2026-05-27T07:20:04Z" },
    { role: "user", text: "А якщо 19 — субота?", at: "2026-05-27T07:21:00Z" },
    { role: "ai", text: "Тоді все одно 19 травня.", at: "2026-05-27T07:21:03Z" },
  ],
  "qa-3": [
    { role: "user", text: "Коли остання дата подання декларації фізособи за 2025?", at: "2026-05-26T16:00:00Z" },
    { role: "ai", text: "Останній день подання — 1 травня 2026 року.", at: "2026-05-26T16:00:02Z" },
  ],
  "qa-4": [
    { role: "user", text: "Як рахується ЄСВ для групи ФОП?", at: "2026-05-27T06:55:00Z" },
    { role: "ai", text: "Для кожного ФОПа окремо — мінімально 22% від мінзарплати. Зараз 1 760 ₴/міс на ФОП.", at: "2026-05-27T06:55:03Z" },
  ],
  "qa-5": [
    { role: "user", text: "Чому з мене знову зняли кредити?", at: "2026-05-26T19:30:00Z" },
    { role: "ai", text: "За тарифом Smart передбачено списання за пакетну обробку понад ліміт.", at: "2026-05-26T19:30:04Z" },
  ],
};

// ===== Notifications для AdminTopbar bell =====
export interface AdminNotificationMock {
  id: string;
  at: string;
  kind: "incident" | "knowledge" | "billing" | "ticket";
  title: string;
  url: string;
  unread: boolean;
}
export const MOCK_NOTIFICATIONS: AdminNotificationMock[] = [
  { id: "n-1", at: "2026-05-27T08:32:00Z", kind: "incident", title: "Деградація ПриватБанк — 47 кабінетів", url: "/admin/system/incidents/inc-1", unread: true },
  { id: "n-2", at: "2026-05-27T08:10:00Z", kind: "billing", title: "Аномалія списань — кабінет cab-3", url: "/admin/system/billing/anomalies", unread: true },
  { id: "n-3", at: "2026-05-27T07:45:00Z", kind: "knowledge", title: "Опубліковано статтю «Ліміти ФОП 2 групи 2026»", url: "/admin/system/ai/knowledge", unread: false },
  { id: "n-4", at: "2026-05-27T07:01:00Z", kind: "ticket", title: "Новий тікет: помилка КЕП-підпису", url: "/admin/system/incidents/tickets/tk-3", unread: true },
  { id: "n-5", at: "2026-05-26T22:00:00Z", kind: "incident", title: "Аномалію кредитів закрито", url: "/admin/system/incidents/inc-3", unread: false },
];

// ===== Feature flags =====
export interface FeatureFlagMock {
  key: string;
  name: string;
  enabled: boolean;
  rollout: number; // %
  scope: "global" | "fop" | "tov" | "individual";
  owner: string;
}
export const MOCK_FEATURE_FLAGS: FeatureFlagMock[] = [
  { key: "ai.voice.gemini-3-flash", name: "Голосовий AI на Gemini 3 Flash", enabled: true, rollout: 35, scope: "global", owner: "AI Rules Architect" },
  { key: "billing.smart-bundles", name: "Пакети «Smart bundles» у тарифі Smart", enabled: false, rollout: 0, scope: "global", owner: "Billing Admin" },
  { key: "fop.autoclose-period", name: "Авто-закриття періоду ФОП", enabled: true, rollout: 100, scope: "fop", owner: "Ops Admin" },
  { key: "kep.cloud-fallback", name: "Cloud KEP як fallback при недоступності токена", enabled: true, rollout: 75, scope: "global", owner: "Integration Admin" },
  { key: "individual.foreign-income-wizard", name: "Майстер «Іноземні доходи» для фізособи", enabled: false, rollout: 5, scope: "individual", owner: "Knowledge Manager" },
];

// ===== Status page items =====
export interface StatusPageItemMock {
  id: string;
  title: string;
  kind: "incident" | "maintenance";
  status: "investigating" | "monitoring" | "resolved" | "scheduled" | "in_progress";
  startedAt: string;
  endsAt?: string;
  service: string;
  summary: string;
}
export const MOCK_STATUS_PAGE_ITEMS: StatusPageItemMock[] = [
  { id: "sp-1", title: "Затримки синхронізації ПриватБанк", kind: "incident", status: "monitoring", startedAt: "2026-05-27T06:12:00Z", service: "ПриватБанк", summary: "Спостерігаємо за конектором після відновлення." },
  { id: "sp-2", title: "Планові роботи з КЕП", kind: "maintenance", status: "scheduled", startedAt: "2026-05-30T22:00:00Z", endsAt: "2026-05-30T23:30:00Z", service: "Cloud KEP", summary: "Оновлення сертифікатів. Підпис недоступний 30 хв." },
  { id: "sp-3", title: "Аномалія списань", kind: "incident", status: "resolved", startedAt: "2026-05-26T22:00:00Z", service: "Білінг", summary: "Інцидент закрито. Кабінету повернуто кредити." },
];

// ===== Sync logs =====
export interface SyncLogMock {
  id: string;
  at: string;
  cabinet: string;
  integration: string;
  status: "ok" | "warn" | "error";
  message: string;
  durationMs: number;
}
export const MOCK_SYNC_LOGS: SyncLogMock[] = [
  { id: "sl-1", at: "2026-05-27T08:30:00Z", cabinet: "ТОВ «Альфа»", integration: "ПриватБанк", status: "error", message: "AUTH_EXPIRED — токен застарів", durationMs: 1240 },
  { id: "sl-2", at: "2026-05-27T08:28:00Z", cabinet: "ФОП Петренко", integration: "Monobank Business", status: "ok", message: "12 транзакцій імпортовано", durationMs: 820 },
  { id: "sl-3", at: "2026-05-27T08:25:00Z", cabinet: "ФОП Сидоренко", integration: "Cloud KEP", status: "error", message: "session expired", durationMs: 320 },
  { id: "sl-4", at: "2026-05-27T08:20:00Z", cabinet: "ФОП Бондар", integration: "Vchasno", status: "warn", message: "2 документи без контрагентів", durationMs: 540 },
  { id: "sl-5", at: "2026-05-27T08:15:00Z", cabinet: "Група ФОП «Консалтинг»", integration: "ДПС", status: "ok", message: "Реєстри оновлено", durationMs: 1900 },
];

// ===== Data quality issues =====
export interface DataQualityIssueMock {
  cabinetId: string;
  cabinetName: string;
  metric: "unclassified_tx" | "missing_counterparty" | "source_conflict";
  percent: number;
  count: number;
  recommendation: string;
}
export const MOCK_DATA_QUALITY: DataQualityIssueMock[] = [
  { cabinetId: "cab-3", cabinetName: "ФОП Сидоренко", metric: "unclassified_tx", percent: 28, count: 56, recommendation: "Запропонувати правило авто-категоризації за призначенням «комісія банку»." },
  { cabinetId: "cab-1", cabinetName: "ТОВ «Альфа»", metric: "missing_counterparty", percent: 14, count: 22, recommendation: "Імпортувати контрагентів з ЄДР за ЄДРПОУ з призначення платежу." },
  { cabinetId: "cab-4", cabinetName: "Фізособа Іваненко", metric: "source_conflict", percent: 9, count: 4, recommendation: "Звести конфлікт банк↔ЕДО — дублюючий документ acc-882." },
];

// ===== Інтеграції каталог =====
export interface IntegrationCatalogItemMock {
  id: string;
  name: string;
  category: "bank" | "edo" | "gov" | "kep" | "messaging";
  stable: boolean;
  coverage: string;
}
export const MOCK_INTEGRATION_CATALOG: IntegrationCatalogItemMock[] = [
  { id: "ic-1", name: "ПриватБанк (виписки)", category: "bank", stable: true, coverage: "ФОП, ТОВ" },
  { id: "ic-2", name: "Monobank Business", category: "bank", stable: true, coverage: "ФОП, ТОВ" },
  { id: "ic-3", name: "Ощадбанк", category: "bank", stable: false, coverage: "ФОП" },
  { id: "ic-4", name: "Vchasno (ЕДО)", category: "edo", stable: true, coverage: "ФОП, ТОВ" },
  { id: "ic-5", name: "ДПС — Кабінет платника", category: "gov", stable: true, coverage: "Всі" },
  { id: "ic-6", name: "Cloud KEP", category: "kep", stable: true, coverage: "Всі" },
  { id: "ic-7", name: "Telegram Bot", category: "messaging", stable: true, coverage: "Всі" },
  { id: "ic-8", name: "Viber Business", category: "messaging", stable: false, coverage: "Фізособа" },
];

// ===== AI templates =====
export interface AiTemplateMock {
  id: string;
  category: "short" | "step_by_step" | "disclaimer";
  name: string;
  preview: string;
  uses: number;
}
export const MOCK_AI_TEMPLATES: AiTemplateMock[] = [
  { id: "tpl-1", category: "short", name: "Коротка відповідь — ліміт ФОП", preview: "Ваш залишок ліміту — {{remaining_pct}}% ({{remaining_uah}} ₴).", uses: 1284 },
  { id: "tpl-2", category: "step_by_step", name: "Покрокове підключення банку", preview: "1. Зайдіть у Privat24 для бізнесу… 2. Згенеруйте токен… 3. Вставте сюди.", uses: 412 },
  { id: "tpl-3", category: "disclaimer", name: "Юридичний дисклеймер — рекомендація", preview: "Інформація не є податковою консультацією. Радимо звіритися з обліковою політикою.", uses: 980 },
  { id: "tpl-4", category: "short", name: "Підтвердження дії", preview: "Готово ✓ Я створив(-ла) {{entity}}.", uses: 3214 },
];

// ===== AI policies =====
export const MOCK_AI_POLICIES = {
  tone: "friendly" as "formal" | "friendly" | "neutral",
  formality: 0.5,
  safeMode: true,
  autoActionsEnabled: false,
  defaultDisclaimerOn: true,
};

// ===== Escalations =====
export interface EscalationRuleMock {
  id: string;
  topic: string;
  condition: string;
  action: string;
  channel: "chat" | "voice" | "any";
  sla: string;
}
export const MOCK_ESCALATIONS: EscalationRuleMock[] = [
  { id: "esc-1", topic: "Помилка КЕП", condition: "повторна спроба підпису ≥ 2", action: "Створити тікет високої пріоритетності + повідомити Integration Admin", channel: "any", sla: "1 год" },
  { id: "esc-2", topic: "Скарга на списання", condition: "ключове слово «спірне списання»", action: "Передати Billing Admin із транскриптом", channel: "chat", sla: "4 год" },
  { id: "esc-3", topic: "Запит фахівця", condition: "інтент = «потрібен бухгалтер»", action: "Створити тікет середньої пріоритетності + лінк на партнера", channel: "voice", sla: "24 год" },
];

// ===== Compliance disclaimers =====
export interface ComplianceDisclaimerMock {
  id: string;
  scope: "chat" | "voice" | "both";
  trigger: string;
  text: string;
  active: boolean;
  version: number;
}
export const MOCK_COMPLIANCE_DISCLAIMERS: ComplianceDisclaimerMock[] = [
  { id: "cd-1", scope: "both", trigger: "Будь-яка податкова рекомендація", text: "Це інформаційна підказка AI, а не податкова консультація. Радимо погодити з фахівцем.", active: true, version: 4 },
  { id: "cd-2", scope: "voice", trigger: "Початок дзвінка", text: "Розмова може бути записана для покращення якості сервісу.", active: true, version: 2 },
  { id: "cd-3", scope: "chat", trigger: "Створення документа", text: "AI створює чернетку. Перед надсиланням перевірте дані.", active: true, version: 1 },
];

// ===== Billing adjustments =====
export interface BillingAdjustmentMock {
  id: string;
  at: string;
  cabinet: string;
  amount: number;
  reason: string;
  by: string;
  status: "pending" | "applied" | "reverted";
}
export const MOCK_BILLING_ADJUSTMENTS: BillingAdjustmentMock[] = [
  { id: "adj-1", at: "2026-05-24T18:41:00Z", cabinet: "ФОП Сидоренко", amount: 200, reason: "Повернення за помилкове пакетне списання (інцидент inc-3).", by: "Billing Admin", status: "applied" },
  { id: "adj-2", at: "2026-05-22T11:05:00Z", cabinet: "ТОВ «Альфа»", amount: -50, reason: "Коригування подвійного нарахування.", by: "Billing Admin", status: "applied" },
  { id: "adj-3", at: "2026-05-27T09:00:00Z", cabinet: "Фізособа Іваненко", amount: 30, reason: "Компенсація за збій КЕП.", by: "Support Admin", status: "pending" },
];

// ===== User banners (двосвітність) =====
export interface UserBannerMock {
  id: string;
  integrationId?: string;
  title: string;
  description: string;
  severity: "info" | "warn" | "error";
  createdAt: string;
  active: boolean;
}
export const MOCK_USER_BANNERS: UserBannerMock[] = [
  { id: "ub-1", integrationId: "privat24", title: "Інтеграція ПриватБанк деградована (демо)", description: "Виписки можуть оновлюватись із затримкою. Команда вже працює над відновленням.", severity: "warn", createdAt: "2026-05-27T06:30:00Z", active: true },
];

// ===== Subscriptions (cross-tenant) =====
export interface SubscriptionMock {
  id: string;
  cabinetId: string;
  cabinetName: string;
  cabinetType: "tov" | "fop" | "individual";
  plan: "free" | "start" | "smart" | "pro" | "pro_agency";
  planLabel: string;
  status: "active" | "trial" | "past_due" | "canceled";
  mrr: number; // ₴
  startedAt: string;
  nextRenewal: string | null;
  trialEndsAt?: string | null;
  paymentMethod: "card" | "invoice" | "none";
  lastPaymentAt?: string | null;
}
export const MOCK_SUBSCRIPTIONS: SubscriptionMock[] = [
  { id: "sub-1", cabinetId: "cab-1", cabinetName: "ТОВ «Альфа»", cabinetType: "tov", plan: "pro", planLabel: "Pro", status: "active", mrr: 1490, startedAt: "2025-11-12", nextRenewal: "2026-06-12", paymentMethod: "card", lastPaymentAt: "2026-05-12" },
  { id: "sub-2", cabinetId: "cab-2", cabinetName: "ФОП Петренко", cabinetType: "fop", plan: "smart", planLabel: "Smart", status: "active", mrr: 490, startedAt: "2026-01-08", nextRenewal: "2026-06-08", paymentMethod: "card", lastPaymentAt: "2026-05-08" },
  { id: "sub-3", cabinetId: "cab-3", cabinetName: "ФОП Сидоренко", cabinetType: "fop", plan: "smart", planLabel: "Smart", status: "past_due", mrr: 490, startedAt: "2025-09-20", nextRenewal: "2026-05-20", paymentMethod: "card", lastPaymentAt: "2026-04-20" },
  { id: "sub-4", cabinetId: "cab-4", cabinetName: "Фізособа Іваненко", cabinetType: "individual", plan: "free", planLabel: "Free Start", status: "active", mrr: 0, startedAt: "2026-03-01", nextRenewal: null, paymentMethod: "none" },
  { id: "sub-5", cabinetId: "cab-5", cabinetName: "ТОВ «Бета Консалт»", cabinetType: "tov", plan: "pro_agency", planLabel: "Pro Agency", status: "trial", mrr: 0, startedAt: "2026-05-20", nextRenewal: "2026-06-03", trialEndsAt: "2026-06-03", paymentMethod: "none" },
  { id: "sub-6", cabinetId: "cab-6", cabinetName: "ФОП Коваленко", cabinetType: "fop", plan: "start", planLabel: "Start", status: "canceled", mrr: 0, startedAt: "2025-07-01", nextRenewal: null, paymentMethod: "card", lastPaymentAt: "2026-02-01" },
  { id: "sub-7", cabinetId: "cab-7", cabinetName: "ТОВ «Гамма»", cabinetType: "tov", plan: "pro", planLabel: "Pro", status: "active", mrr: 1490, startedAt: "2024-12-01", nextRenewal: "2026-06-01", paymentMethod: "invoice", lastPaymentAt: "2026-05-01" },
];

// ===== Partners (reseller registry) =====
export interface PartnerMock {
  id: string;
  name: string;
  email: string;
  tier: 1 | 2 | 3; // 1: 1–10, 2: 11–50, 3: 51+
  clientsCount: number;
  clientsMrr: number; // сумарний MRR клієнтів партнера, ₴
  mode: "to_client" | "revenue_share";
  verified: boolean;
  pendingPayout: number; // ₴
  paidMtd: number; // ₴
  joinedAt: string;
  status: "active" | "suspended";
}
export const MOCK_PARTNERS: PartnerMock[] = [
  { id: "p-1", name: "Бюро «Баланс+»", email: "office@balanceplus.ua", tier: 2, clientsCount: 23, clientsMrr: 18420, mode: "revenue_share", verified: true, pendingPayout: 4200, paidMtd: 5800, joinedAt: "2025-04-12", status: "active" },
  { id: "p-2", name: "ФОП Гончаренко (бухгалтер)", email: "honcharenko@ua.com", tier: 1, clientsCount: 7, clientsMrr: 4830, mode: "to_client", verified: true, pendingPayout: 0, paidMtd: 0, joinedAt: "2026-01-08", status: "active" },
  { id: "p-3", name: "AccountingHub Pro", email: "hello@achub.ua", tier: 3, clientsCount: 84, clientsMrr: 71240, mode: "revenue_share", verified: true, pendingPayout: 18600, paidMtd: 22400, joinedAt: "2024-11-02", status: "active" },
  { id: "p-4", name: "Бюро «Дебет-Кредит»", email: "dk@ua.com", tier: 1, clientsCount: 4, clientsMrr: 2940, mode: "to_client", verified: false, pendingPayout: 0, paidMtd: 0, joinedAt: "2026-05-19", status: "active" },
  { id: "p-5", name: "ТОВ «ФінПартнер»", email: "ops@finpartner.ua", tier: 2, clientsCount: 31, clientsMrr: 24210, mode: "revenue_share", verified: true, pendingPayout: 6100, paidMtd: 7200, joinedAt: "2025-08-22", status: "suspended" },
];

// ===== AI COGS (internal, USD) =====
export interface AiCostByModelMock {
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  usdSpent: number;
  avgLatencyMs: number;
  successRate: number; // 0..1
}
export const MOCK_AI_COST_BY_MODEL: AiCostByModelMock[] = [
  { model: "google/gemini-2.5-flash", calls: 18420, inputTokens: 9_240_000, outputTokens: 1_810_000, usdSpent: 142.30, avgLatencyMs: 920, successRate: 0.994 },
  { model: "google/gemini-2.5-pro", calls: 3210, inputTokens: 4_120_000, outputTokens: 980_000, usdSpent: 318.40, avgLatencyMs: 2240, successRate: 0.989 },
  { model: "google/gemini-2.5-flash-lite", calls: 26100, inputTokens: 6_300_000, outputTokens: 410_000, usdSpent: 38.20, avgLatencyMs: 480, successRate: 0.997 },
  { model: "openai/gpt-5-mini", calls: 1240, inputTokens: 1_120_000, outputTokens: 240_000, usdSpent: 84.10, avgLatencyMs: 1860, successRate: 0.982 },
  { model: "openai/gpt-5", calls: 310, inputTokens: 420_000, outputTokens: 110_000, usdSpent: 96.80, avgLatencyMs: 3100, successRate: 0.975 },
];

export interface AiCostByOperationMock {
  operationType: string;
  label: string;
  calls: number;
  creditsCharged: number; // нараховано клієнтам
  revenueUah: number; // ₴ еквівалент кредитів
  usdCost: number;
  marginPct: number; // 0..100
}
export const MOCK_AI_COST_BY_OPERATION: AiCostByOperationMock[] = [
  { operationType: "ai.analyze_bank_statement", label: "Аналіз банківської виписки", calls: 4820, creditsCharged: 57840, revenueUah: 11568, usdCost: 184.20, marginPct: 62.5 },
  { operationType: "ai.recognize_expense", label: "Розпізнавання чеку/інвойсу", calls: 12400, creditsCharged: 24800, revenueUah: 4960, usdCost: 41.80, marginPct: 71.0 },
  { operationType: "ai.consultation", label: "AI-консультація", calls: 8210, creditsCharged: 16420, revenueUah: 3284, usdCost: 96.40, marginPct: 28.5 },
  { operationType: "ai.draft_declaration", label: "Чернетка декларації", calls: 940, creditsCharged: 18800, revenueUah: 3760, usdCost: 142.60, marginPct: 18.2 },
  { operationType: "ai.audit_request_analysis", label: "Аналіз запиту ДПС", calls: 86, creditsCharged: 4300, revenueUah: 860, usdCost: 24.80, marginPct: 31.0 },
];

export interface AiCostByCabinetMock {
  cabinetId: string;
  cabinetName: string;
  plan: string;
  calls: number;
  usdCost: number;
  creditsCharged: number;
  marginPct: number;
}
export const MOCK_AI_COST_BY_CABINET: AiCostByCabinetMock[] = [
  { cabinetId: "cab-3", cabinetName: "ФОП Сидоренко", plan: "Smart", calls: 3210, usdCost: 84.20, creditsCharged: 18420, marginPct: -8.4 },
  { cabinetId: "cab-1", cabinetName: "ТОВ «Альфа»", plan: "Pro", calls: 2840, usdCost: 62.10, creditsCharged: 32400, marginPct: 47.8 },
  { cabinetId: "cab-7", cabinetName: "ТОВ «Гамма»", plan: "Pro", calls: 1920, usdCost: 41.30, creditsCharged: 22100, marginPct: 51.2 },
  { cabinetId: "cab-5", cabinetName: "ТОВ «Бета Консалт»", plan: "Pro Agency (trial)", calls: 1410, usdCost: 38.40, creditsCharged: 0, marginPct: -100 },
  { cabinetId: "cab-2", cabinetName: "ФОП Петренко", plan: "Smart", calls: 1180, usdCost: 24.60, creditsCharged: 8420, marginPct: 38.2 },
];

export const MOCK_AI_COST_SUMMARY = {
  revenueUah: 24432,
  cogsUsd: 679.80,
  fxRate: 41.2, // ₴/USD
  grossMarginPct: 31.4,
  costPerActiveCabinetUsd: 4.85,
  anomalies24h: 3,
};
