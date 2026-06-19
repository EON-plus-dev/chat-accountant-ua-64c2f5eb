/**
 * Universal CRM module types (cabinet-agnostic).
 *
 * Працює в будь-якому кабінеті: ТОВ Fintodo (SaaS), ТОВ-клієнти (продажі),
 * ФОП-послуги, бухгалтерські бюро, партнери-реселери.
 * Конкретна термінологія/стадії/KPI підбираються через `CrmPreset`.
 */

import type { LucideIcon } from "lucide-react";

// ──────────────────────────── Базові типи ────────────────────────────

export type CrmCurrency = "UAH" | "USD" | "EUR";

export type CrmDmuRole =
  | "economic_buyer"
  | "champion"
  | "user"
  | "blocker"
  | "influencer";

export type CrmSource =
  | "website"
  | "referral"
  | "partner"
  | "cold_outreach"
  | "inbound_call"
  | "event"
  | "marketing_campaign"
  | "other";

export type CrmActivityKind =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "sms"
  | "messenger"
  | "whatsapp"
  | "ai_note";

export type CrmHealthLevel = "high" | "medium" | "low" | "critical";

// ──────────────────────────── Stage / Pipeline ────────────────────────────

export interface CrmStage {
  id: string;
  label: string;
  /** tailwind bg-* для індикатора */
  color: string;
  /** імовірність за замовчуванням при переході в стадію */
  defaultProbability: number;
  /** «термінальна» стадія: paid/won/lost — не враховується у weighted pipeline */
  terminal?: "won" | "lost";
}

export interface CrmPipeline {
  id: string;
  label: string;
  stages: CrmStage[];
}

// ──────────────────────────── Сутності ────────────────────────────

export interface CrmAccount {
  id: string;
  name: string;
  region?: string;
  segment?: string;
  /** Універсальне поле — план/тариф/категорія клієнта (для SaaS = план, для торгівлі = категорія) */
  tier?: string;
  industry?: string;
  ownerId?: string;
}

export interface CrmContact {
  id: string;
  accountId: string;
  fullName: string;
  email?: string;
  phone?: string;
  role?: string;
  dmuRole?: CrmDmuRole;
}

export interface CrmHealthDriver {
  id: string;
  label: string;
  /** 0..100 */
  score: number;
  weight: number;
  hint?: string;
}

export interface CrmHealthScore {
  /** 0..100 */
  score: number;
  level: CrmHealthLevel;
  drivers: CrmHealthDriver[];
  updatedAt: string;
}

export interface CrmDeal {
  id: string;
  title: string;
  accountId: string;
  primaryContactId?: string;
  pipelineId: string;
  stageId: string;
  value: number;
  currency: CrmCurrency;
  /** 0..100 */
  probability: number;
  expectedCloseAt: string;
  ownerId: string;
  source?: CrmSource;
  lostReason?: string;
  stageEnteredAt: string;
  lastActivityAt: string;
  nextStep?: string;
  tags?: string[];
  /** Довільні поля per cabinet-type (через CrmPreset.customFields) */
  customFields?: Record<string, unknown>;
  health?: CrmHealthScore;
}

export interface CrmActivity {
  id: string;
  kind: CrmActivityKind;
  at: string;
  summary: string;
  authorId: string;
  dealId?: string;
  accountId?: string;
}

// ──────────────────────────── Preset (per cabinet-type) ────────────────────────────

export type CrmKpiId =
  | "mrr"
  | "active_clients"
  | "arpu"
  | "trials"
  | "churn_risk"
  | "pipeline_value"
  | "pipeline_weighted"
  | "win_rate"
  | "avg_deal_size"
  | "sales_cycle_days"
  | "receivables"
  | "overdue_count"
  | "new_clients_mtd";

export interface CrmKpiConfig {
  id: CrmKpiId;
  label: string;
  icon?: LucideIcon;
  /** для UniversalKPICard variant */
  variant?: "default" | "success" | "warning" | "danger";
}

export interface CrmTerminology {
  /** «Угоди» / «Замовлення» / «Кейси» */
  deal: string;
  dealPlural: string;
  /** «Клієнти» / «Контрагенти» / «Замовники» */
  account: string;
  accountPlural: string;
  /** Назва модуля у sidebar / page header */
  moduleTitle: string;
  /** Підзаголовок з описом */
  moduleSubtitle: string;
  /** «Воронка продажів» / «Воронка замовлень» */
  pipelineLabel: string;
  /** Назва primary value field: «MRR ₴/міс», «Сума», «Гонорар» */
  valueLabel: string;
  /** Чи показувати валюту суфіксом «/міс» (SaaS) чи разово (B2B-торгівля) */
  valueIsRecurring: boolean;
}

export interface CrmHealthDriverConfig {
  id: string;
  label: string;
  weight: number;
  hint?: string;
}

export interface CrmPreset {
  id: string;
  /** «SaaS», «B2B Trade», «Accounting Bureau», «Personal» */
  description: string;
  terminology: CrmTerminology;
  pipelines: CrmPipeline[];
  defaultPipelineId: string;
  kpis: CrmKpiId[];
  /** Драйвери health-score (вага має сумуватись у 100) */
  healthDrivers: CrmHealthDriverConfig[];
  /** Чи показувати lookup-секції підписки/AI/партнера у drill-sheet (тільки для SaaS) */
  showSaasLookups: boolean;
  /** Кастомні поля для запису угоди (рендеряться у формі/sheet) */
  customFields?: Array<{
    key: string;
    label: string;
    type: "text" | "number" | "select" | "date";
    options?: string[];
  }>;
}

// ──────────────────────────── Sequences / Cadences ────────────────────────────

export type CrmSequenceStepKind =
  | "email"
  | "call"
  | "linkedin"
  | "whatsapp"
  | "sms"
  | "check_in"
  | "meeting";

export interface CrmSequenceStep {
  id: string;
  kind: CrmSequenceStepKind;
  /** Заголовок touchpoint (стає назвою задачі) */
  title: string;
  /** Offset в днях від запису угоди в каденцію */
  delayDays: number;
  /** Шаблон/опис (для email — рядок теми, для call — script note) */
  template?: string;
}

export interface CrmSequence {
  id: string;
  label: string;
  description: string;
  /** На які стадії розраховано (порожній — для будь-якої) */
  forStageIds?: string[];
  steps: CrmSequenceStep[];
}

export type CrmEnrollmentStatus = "active" | "completed" | "paused" | "cancelled";

export interface CrmSequenceEnrollment {
  id: string;
  dealId: string;
  sequenceId: string;
  enrolledAt: string;
  status: CrmEnrollmentStatus;
  /** Index наступного нескасованого кроку */
  currentStepIdx: number;
  /** Map stepId → ISO completedAt */
  completedSteps: Record<string, string>;
}

// ──────────────────────────── Capability ────────────────────────────

/**
 * Чи активувати CRM-модуль у конкретному кабінеті.
 * Поточна логіка: лише кабінети з saas_business capability.
 * У майбутньому: будь-який бізнес-кабінет з override `crmEnabled`.
 */
export interface CrmCapability {
  enabled: boolean;
  presetId: string;
  reason?: "saas_business" | "explicit_enabled" | "default_b2b";
}
