/**
 * fintodoSubscriptionsData — MRR-пайплайн SaaS-кабінету ТОВ «Fintodo».
 *
 * Витяг із реальних SaaS-сутностей системи:
 *   • clientId   — посилається на FINTODO_CLIENTS (CRM)
 *   • partnerId  — посилається на FINTODO_PARTNERS (Партнерська мережа)
 *   • plan       — `BillingPlan.id` із src/config/billingModel.ts
 *
 * Дані квітня 2026. Жодних змін БД — це демо-вітрина.
 */

import {
  FINTODO_CLIENTS,
  type FintodoClient,
} from "./fintodoCrmData";
import { FINTODO_LINKS } from "./fintodoPartnersData";

export type SubStage =
  | "trial"          // 14 днів пробного періоду (тільки партнерські)
  | "active"         // активна підписка
  | "past_due"       // прострочена оплата
  | "paused"         // призупинено
  | "churned";       // відписався

export type SubPlanId = "free" | "start" | "smart" | "premium";

export interface FintodoSubscription {
  id: string;
  clientId: string;
  clientName: string;
  plan: SubPlanId;
  planLabel: string;
  stage: SubStage;
  mrr: number;               // ₴/міс
  startedAt: string;         // ISO
  nextBillAt: string;        // ISO
  trialEndsAt?: string;      // ISO (лише для stage="trial")
  partnerId?: string;        // якщо клієнт приведений партнером
  partnerName?: string;
  creditsBalance: number;    // залишок кредитів на гаманці
  monthlyTopUps: number;     // ₴ донат-поповнень за поточний місяць
  churnRisk: "low" | "med" | "high";
}

const PLAN_LABEL: Record<SubPlanId, string> = {
  free: "Free",
  start: "Старт",
  smart: "Смарт",
  premium: "Преміум",
};

const PLAN_MRR: Record<SubPlanId, number> = {
  free: 0,
  start: 0,
  smart: 399,
  premium: 799,
};

// Map FintodoPlan (CRM) → SubPlanId (білінг)
const planFromCrm = (p: FintodoClient["plan"]): SubPlanId => {
  if (p === "Free") return "free";
  if (p === "Start") return "start";
  if (p === "Smart") return "smart";
  return "premium"; // Pro → premium
};

const partnerLinkByClientName = new Map(
  FINTODO_LINKS.map((l) => [l.clientName, l]),
);

// ────────────────────── Генерація підписок із CRM-клієнтів ──────────────────────
const _today = new Date("2026-05-26");
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r.toISOString().slice(0, 10);
};

export const FINTODO_SUBSCRIPTIONS: FintodoSubscription[] = FINTODO_CLIENTS.map(
  (c, idx): FintodoSubscription => {
    const plan = planFromCrm(c.plan);
    const link = partnerLinkByClientName.get(c.company);
    // 3 клієнти штучно — past_due, 2 — paused для реалістичної демо-картини
    const stage: SubStage =
      idx === 11 ? "past_due" : idx === 22 ? "past_due" : idx === 29 ? "paused" :
      idx === 33 ? "past_due" : c.churnRisk === "high" ? "past_due" : "active";
    // Наступна оплата ~ +30 днів від останньої активності
    const last = new Date(c.lastActivityAt);
    return {
      id: `sub-${String(idx + 1).padStart(3, "0")}`,
      clientId: c.id,
      clientName: c.company,
      plan,
      planLabel: PLAN_LABEL[plan],
      stage,
      mrr: c.mrr || PLAN_MRR[plan],
      startedAt: c.signedAt,
      nextBillAt: addDays(last, 30),
      partnerId: link?.partnerId,
      partnerName: link ? `Партнер ${link.partnerId}` : undefined,
      creditsBalance: Math.round((c.aiCreditsPerMonth ?? 200) * 0.35),
      monthlyTopUps: c.mrr > 4000 ? Math.round(Math.random() * 600) * 10 : 0,
      churnRisk: c.churnRisk,
    };
  },
);

// 4 активних 14-денних trial (партнерські)
const TRIAL_BASE: Omit<FintodoSubscription, "id">[] = [
  {
    clientId: "trial-001", clientName: "ТОВ «Дніпро-Логістик»",
    plan: "premium", planLabel: PLAN_LABEL.premium, stage: "trial", mrr: 0,
    startedAt: "2026-05-18", nextBillAt: "2026-06-01",
    trialEndsAt: "2026-06-01",
    partnerId: "p-04", partnerName: "Партнер p-04",
    creditsBalance: 1200, monthlyTopUps: 0, churnRisk: "med",
  },
  {
    clientId: "trial-002", clientName: "ФОП Кравченко І.І.",
    plan: "smart", planLabel: PLAN_LABEL.smart, stage: "trial", mrr: 0,
    startedAt: "2026-05-20", nextBillAt: "2026-06-03",
    trialEndsAt: "2026-06-03",
    partnerId: "p-07", partnerName: "Партнер p-07",
    creditsBalance: 480, monthlyTopUps: 0, churnRisk: "low",
  },
  {
    clientId: "trial-003", clientName: "ТОВ «Карпатські Меблі»",
    plan: "premium", planLabel: PLAN_LABEL.premium, stage: "trial", mrr: 0,
    startedAt: "2026-05-15", nextBillAt: "2026-05-29",
    trialEndsAt: "2026-05-29",
    partnerId: "p-02", partnerName: "Партнер p-02",
    creditsBalance: 2300, monthlyTopUps: 0, churnRisk: "low",
  },
  {
    clientId: "trial-004", clientName: "ФОП Бойко Тетяна",
    plan: "smart", planLabel: PLAN_LABEL.smart, stage: "trial", mrr: 0,
    startedAt: "2026-05-22", nextBillAt: "2026-06-05",
    trialEndsAt: "2026-06-05",
    partnerId: "p-05", partnerName: "Партнер p-05",
    creditsBalance: 320, monthlyTopUps: 0, churnRisk: "med",
  },
];

TRIAL_BASE.forEach((t, i) =>
  FINTODO_SUBSCRIPTIONS.push({ ...t, id: `sub-trial-${i + 1}` }),
);

// 2 churned (для метрики net churn)
FINTODO_SUBSCRIPTIONS.push(
  {
    id: "sub-churn-1", clientId: "churn-001", clientName: "ТОВ «ЗапоріжСталь-ЛТД»",
    plan: "smart", planLabel: PLAN_LABEL.smart, stage: "churned", mrr: 0,
    startedAt: "2024-12-15", nextBillAt: "2026-04-10",
    partnerId: "p-06", partnerName: "Партнер p-06",
    creditsBalance: 0, monthlyTopUps: 0, churnRisk: "high",
  },
  {
    id: "sub-churn-2", clientId: "churn-002", clientName: "ТОВ «Облік24-Сервіс»",
    plan: "smart", planLabel: PLAN_LABEL.smart, stage: "churned", mrr: 0,
    startedAt: "2025-03-20", nextBillAt: "2026-04-22",
    partnerId: "p-08", partnerName: "Партнер p-08",
    creditsBalance: 0, monthlyTopUps: 0, churnRisk: "high",
  },
);

// ────────────────────── Агрегати ──────────────────────
const activeSubs = FINTODO_SUBSCRIPTIONS.filter((s) => s.stage === "active");
const trialSubs  = FINTODO_SUBSCRIPTIONS.filter((s) => s.stage === "trial");
const pastDueSubs= FINTODO_SUBSCRIPTIONS.filter((s) => s.stage === "past_due");
const churnedSubs= FINTODO_SUBSCRIPTIONS.filter((s) => s.stage === "churned");

const _mrr = activeSubs.reduce((s, x) => s + x.mrr, 0);
const _arpu = activeSubs.length ? Math.round(_mrr / activeSubs.length) : 0;
const _topUps = FINTODO_SUBSCRIPTIONS.reduce((s, x) => s + x.monthlyTopUps, 0);

export const FINTODO_SUBSCRIPTIONS_TOTALS = {
  mrr: _mrr,
  arr: _mrr * 12,
  arpu: _arpu,
  activeCount: activeSubs.length,
  trialCount: trialSubs.length,
  pastDueCount: pastDueSubs.length,
  churnedCount: churnedSubs.length,
  totalTopUpsMonth: _topUps,
  // Trial → paid conversion: 2 з 4 trial конвертували цього тижня (демо)
  trialToPaidWeek: { converted: 2, total: 4 },
  // Net churn: -2 платних (1180 ₴ MRR втрачено)
  netChurnMrr: -1180,
  netChurnRate: -1180 / Math.max(1, _mrr),
};

export const STAGE_LABEL: Record<SubStage, string> = {
  trial: "Trial (14 дн.)",
  active: "Активна",
  past_due: "Прострочена",
  paused: "Призупинено",
  churned: "Відписався",
};

export const STAGE_COLOR: Record<SubStage, string> = {
  trial: "bg-amber-500",
  active: "bg-emerald-500",
  past_due: "bg-red-500",
  paused: "bg-slate-400",
  churned: "bg-slate-600",
};

export const PLAN_COLOR: Record<SubPlanId, string> = {
  free:    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  start:   "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  smart:   "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  premium: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export const formatUAH = (n: number) =>
  `${new Intl.NumberFormat("uk-UA").format(Math.round(n))} ₴`;
