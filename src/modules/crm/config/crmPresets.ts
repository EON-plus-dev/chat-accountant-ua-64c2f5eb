/**
 * CRM-пресети per cabinet-type.
 * Виводять термінологію, стадії воронки, KPI та health-драйвери,
 * щоб один універсальний CRM-модуль працював у будь-якому кабінеті.
 */

import type { CrmPreset } from "../types";

// ──────────────────────────── SaaS (ТОВ Fintodo та подібні) ────────────────────────────
export const SAAS_PRESET: CrmPreset = {
  id: "saas",
  description: "SaaS-оператор: підписки, MRR, churn, AI-кредити",
  terminology: {
    deal: "Угода",
    dealPlural: "Угоди",
    account: "Клієнт",
    accountPlural: "Клієнти",
    moduleTitle: "CRM — клієнти та угоди",
    moduleSubtitle: "Воронка продажів, активні підписки, активності команди",
    pipelineLabel: "Воронка продажів",
    valueLabel: "MRR",
    valueIsRecurring: true,
  },
  pipelines: [
    {
      id: "sales",
      label: "Продажі",
      stages: [
        { id: "lead",   label: "Лід",        color: "bg-slate-500",   defaultProbability: 10 },
        { id: "demo",   label: "Демо",       color: "bg-blue-500",    defaultProbability: 30 },
        { id: "trial",  label: "Тріал",      color: "bg-amber-500",   defaultProbability: 55 },
        { id: "paid",   label: "Платний",    color: "bg-emerald-500", defaultProbability: 100, terminal: "won" },
        { id: "expand", label: "Розширення", color: "bg-violet-500",  defaultProbability: 100 },
        { id: "lost",   label: "Втрачено",   color: "bg-red-500",     defaultProbability: 0,   terminal: "lost" },
      ],
    },
  ],
  defaultPipelineId: "sales",
  kpis: ["mrr", "active_clients", "arpu", "trials", "churn_risk"],
  healthDrivers: [
    { id: "nps",         label: "NPS",                          weight: 25 },
    { id: "usage",       label: "Активність використання",      weight: 30 },
    { id: "tickets",     label: "Відкриті тікети підтримки",    weight: 15 },
    { id: "payments",    label: "Дисципліна оплат",             weight: 20 },
    { id: "ai_quota",    label: "Витрата AI-кредитів",          weight: 10 },
  ],
  showSaasLookups: true,
};

// ──────────────────────────── B2B Trade (ТОВ-торгівля) ────────────────────────────
export const B2B_TRADE_PRESET: CrmPreset = {
  id: "b2b_trade",
  description: "B2B-торгівля: замовлення, дебіторка, котирування",
  terminology: {
    deal: "Замовлення",
    dealPlural: "Замовлення",
    account: "Контрагент",
    accountPlural: "Контрагенти",
    moduleTitle: "Замовлення та контрагенти",
    moduleSubtitle: "Воронка замовлень, дебіторка, активності",
    pipelineLabel: "Воронка замовлень",
    valueLabel: "Сума",
    valueIsRecurring: false,
  },
  pipelines: [
    {
      id: "orders",
      label: "Замовлення",
      stages: [
        { id: "inquiry",  label: "Запит",        color: "bg-slate-500",   defaultProbability: 15 },
        { id: "quote",    label: "Котирування",  color: "bg-blue-500",    defaultProbability: 40 },
        { id: "negotiate",label: "Переговори",   color: "bg-amber-500",   defaultProbability: 65 },
        { id: "won",      label: "Виграно",      color: "bg-emerald-500", defaultProbability: 100, terminal: "won" },
        { id: "shipped",  label: "Відвантажено", color: "bg-violet-500",  defaultProbability: 100 },
        { id: "lost",     label: "Втрачено",     color: "bg-red-500",     defaultProbability: 0,   terminal: "lost" },
      ],
    },
  ],
  defaultPipelineId: "orders",
  kpis: ["pipeline_value", "pipeline_weighted", "win_rate", "avg_deal_size", "receivables"],
  healthDrivers: [
    { id: "receivables", label: "Дебіторка (днів)",          weight: 35 },
    { id: "frequency",   label: "Регулярність замовлень",    weight: 25 },
    { id: "volume",      label: "Об'єм за рік",              weight: 25 },
    { id: "payments",    label: "Дисципліна оплат",          weight: 15 },
  ],
  showSaasLookups: false,
};

// ──────────────────────────── Accounting Bureau (бюро) ────────────────────────────
export const BUREAU_PRESET: CrmPreset = {
  id: "bureau",
  description: "Бухгалтерське бюро: клієнти на абонементі",
  terminology: {
    deal: "Договір",
    dealPlural: "Договори",
    account: "Клієнт бюро",
    accountPlural: "Клієнти бюро",
    moduleTitle: "Клієнти бюро та договори",
    moduleSubtitle: "Воронка нових клієнтів, активні договори обслуговування",
    pipelineLabel: "Воронка клієнтів",
    valueLabel: "Гонорар",
    valueIsRecurring: true,
  },
  pipelines: [
    {
      id: "bureau_sales",
      label: "Залучення",
      stages: [
        { id: "lead",       label: "Звернення",  color: "bg-slate-500",   defaultProbability: 20 },
        { id: "consult",    label: "Консультація",color: "bg-blue-500",   defaultProbability: 40 },
        { id: "proposal",   label: "Пропозиція", color: "bg-amber-500",   defaultProbability: 60 },
        { id: "active",     label: "На обслуг.", color: "bg-emerald-500", defaultProbability: 100, terminal: "won" },
        { id: "paused",     label: "Призупин.",  color: "bg-violet-500",  defaultProbability: 50 },
        { id: "lost",       label: "Відмова",    color: "bg-red-500",     defaultProbability: 0,   terminal: "lost" },
      ],
    },
  ],
  defaultPipelineId: "bureau_sales",
  kpis: ["active_clients", "mrr", "arpu", "new_clients_mtd", "overdue_count"],
  healthDrivers: [
    { id: "deadlines",   label: "Дотримання термінів здачі", weight: 35 },
    { id: "communication",label: "Якість комунікації",       weight: 20 },
    { id: "fee_payment", label: "Оплата гонорару",           weight: 30 },
    { id: "docs_quality",label: "Якість первинки",           weight: 15 },
  ],
  showSaasLookups: false,
};

// ──────────────────────────── Personal (фізособа) ────────────────────────────
export const PERSONAL_CRM_PRESET: CrmPreset = {
  id: "personal",
  description: "Особистий CRM: контакти, особисті цілі (опційно)",
  terminology: {
    deal: "Ціль",
    dealPlural: "Цілі",
    account: "Контакт",
    accountPlural: "Контакти",
    moduleTitle: "Контакти та цілі",
    moduleSubtitle: "Особистий простір",
    pipelineLabel: "Цілі",
    valueLabel: "Бюджет",
    valueIsRecurring: false,
  },
  pipelines: [
    {
      id: "personal",
      label: "Цілі",
      stages: [
        { id: "idea",      label: "Ідея",       color: "bg-slate-500",   defaultProbability: 10 },
        { id: "planning",  label: "Планування", color: "bg-blue-500",    defaultProbability: 40 },
        { id: "active",    label: "Активна",    color: "bg-amber-500",   defaultProbability: 70 },
        { id: "achieved",  label: "Досягнуто",  color: "bg-emerald-500", defaultProbability: 100, terminal: "won" },
        { id: "abandoned", label: "Відкладено", color: "bg-red-500",     defaultProbability: 0,   terminal: "lost" },
      ],
    },
  ],
  defaultPipelineId: "personal",
  kpis: ["pipeline_value", "active_clients"],
  healthDrivers: [],
  showSaasLookups: false,
};

// ──────────────────────────── Registry ────────────────────────────
export const CRM_PRESETS = {
  saas: SAAS_PRESET,
  b2b_trade: B2B_TRADE_PRESET,
  bureau: BUREAU_PRESET,
  personal: PERSONAL_CRM_PRESET,
} as const;

export type CrmPresetId = keyof typeof CRM_PRESETS;

export function getCrmPreset(id: string): CrmPreset {
  return (CRM_PRESETS as Record<string, CrmPreset>)[id] ?? SAAS_PRESET;
}
