/**
 * Seed demo CRM data per preset. Без зовнішніх залежностей, детерміністичні id
 * щоб localStorage між сесіями давав стабільні картки.
 *
 * Використовується useCrmStore при першому рендері у кабінеті без збережених даних.
 */

import type { CrmAccount, CrmContact, CrmDeal, CrmHealthLevel, CrmPreset, CrmSource } from "../types";

interface SeededData {
  deals: CrmDeal[];
  accounts: CrmAccount[];
  contacts: CrmContact[];
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function daysAheadISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function healthLevel(score: number): CrmHealthLevel {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  if (score >= 35) return "low";
  return "critical";
}

interface SeedDealTemplate {
  accountName: string;
  contactName: string;
  contactRole?: string;
  email: string;
  title: string;
  stageOffset: number; // 0..N — посуне на N-ту стадію (з 0)
  value: number;
  source: CrmSource;
  tier?: string;
  industry?: string;
  daysInStage: number;
  daysToClose: number;
  healthScore: number;
  nextStep?: string;
  tags?: string[];
}

const TEMPLATES_BY_PRESET: Record<string, SeedDealTemplate[]> = {
  b2b_trade: [
    { accountName: "ТОВ «Метал-Південь»",     contactName: "Олександр Іщенко", contactRole: "Закупівлі",        email: "purchase@metal-pivden.ua", title: "Постачання труб Q2 2026",     stageOffset: 0, value: 480_000, source: "inbound_call",     industry: "Будівництво", daysInStage: 2,  daysToClose: 21, healthScore: 78, nextStep: "Надіслати специфікацію",       tags: ["hot"] },
    { accountName: "ПП «Агро-Степ»",          contactName: "Тетяна Мороз",      contactRole: "Постачання",        email: "tm@agro-step.ua",          title: "Котирування мінеральних добрив", stageOffset: 1, value: 1_240_000, source: "referral",       industry: "Агро",         daysInStage: 5,  daysToClose: 14, healthScore: 65, nextStep: "Узгодити логістику" },
    { accountName: "ТОВ «БудМаркет»",         contactName: "Іван Бондар",      contactRole: "Директор",          email: "boss@budmarket.ua",        title: "Договір на цемент 200т",      stageOffset: 2, value: 720_000, source: "partner",         industry: "Будівництво", daysInStage: 8,  daysToClose: 7,  healthScore: 58, nextStep: "Дзвінок щодо знижки" },
    { accountName: "ТОВ «Енерго-Захід»",      contactName: "Марія Левченко",   contactRole: "Головний інженер",  email: "ml@energo.ua",             title: "Поставка кабельної продукції", stageOffset: 1, value: 2_150_000, source: "event",         industry: "Енергетика",  daysInStage: 12, daysToClose: 30, healthScore: 42, nextStep: "Тендерна пропозиція",            tags: ["enterprise"] },
    { accountName: "ФОП Кравчук О.М.",        contactName: "Олег Кравчук",      contactRole: "ФОП",               email: "okravchuk@gmail.com",      title: "Замовлення інструменту",      stageOffset: 3, value: 95_000,  source: "website",         industry: "Сервіс",       daysInStage: 1,  daysToClose: 3,  healthScore: 82 },
    { accountName: "ТОВ «Сонячна Енергія»",   contactName: "Дмитро Шевчук",     contactRole: "Закупівля",         email: "ds@son-en.ua",             title: "Сонячні панелі 500кВт",       stageOffset: 2, value: 3_400_000, source: "marketing_campaign", industry: "Енергетика", daysInStage: 18, daysToClose: 45, healthScore: 71, nextStep: "Підписання договору" },
  ],
  bureau: [
    { accountName: "ТОВ «ПромБуд»",            contactName: "Олена Шевченко",   contactRole: "Бухгалтер",          email: "ol@prombud.ua",            title: "Повне обслуговування ТОВ",       stageOffset: 0, value: 18_000, source: "referral",  tier: "Standard",  industry: "Будівництво", daysInStage: 1,  daysToClose: 14, healthScore: 75, nextStep: "Призначити консультацію" },
    { accountName: "ФОП Петренко І.В.",        contactName: "Ірина Петренко",   contactRole: "ФОП",                email: "petrenko@gmail.com",      title: "Звітність ФОП 3 група",         stageOffset: 1, value: 4_500,  source: "website",   tier: "Lite",     industry: "Послуги",     daysInStage: 3,  daysToClose: 5,  healthScore: 82 },
    { accountName: "ТОВ «Кафе Лісове»",        contactName: "Андрій Лісовий",   contactRole: "Директор",           email: "andrii@lisove.ua",        title: "Перехід на абонемент",          stageOffset: 2, value: 12_000, source: "partner",   tier: "Standard", industry: "HoReCa",       daysInStage: 6,  daysToClose: 10, healthScore: 55, nextStep: "Узгодити пакет" },
    { accountName: "ПП «Медіа-Стар»",          contactName: "Юлія Білик",       contactRole: "СFO",               email: "yulia@mediastar.ua",       title: "VIP-обслуговування з податковим",stageOffset: 3, value: 38_000, source: "referral",  tier: "VIP",      industry: "Media",        daysInStage: 22, daysToClose: 0,  healthScore: 88,                                             tags: ["vip"] },
    { accountName: "ТОВ «АвтоСервіс-Центр»",   contactName: "Сергій Гончар",    contactRole: "Власник",            email: "gonchar@auto.ua",         title: "Закриття 2025 + прогноз 2026",  stageOffset: 1, value: 9_500,  source: "cold_outreach", tier: "Lite",     industry: "Авто",          daysInStage: 9,  daysToClose: 12, healthScore: 48, nextStep: "Аудит первинки" },
  ],
  personal: [
    { accountName: "Особиста ціль",     contactName: "Я",        email: "me@example.com", title: "Ремонт квартири",       stageOffset: 1, value: 250_000, source: "other", daysInStage: 14, daysToClose: 90, healthScore: 60 },
    { accountName: "Особиста ціль",     contactName: "Я",        email: "me@example.com", title: "Відпустка Іспанія",     stageOffset: 0, value: 80_000,  source: "other", daysInStage: 3,  daysToClose: 120, healthScore: 70 },
    { accountName: "Особиста ціль",     contactName: "Я",        email: "me@example.com", title: "Купити авто",           stageOffset: 2, value: 600_000, source: "other", daysInStage: 30, daysToClose: 60, healthScore: 45 },
  ],
};

export function seedCrmData(preset: CrmPreset): SeededData {
  const templates = TEMPLATES_BY_PRESET[preset.id] ?? [];
  const pipeline = preset.pipelines.find((p) => p.id === preset.defaultPipelineId) ?? preset.pipelines[0];
  if (!pipeline) return { deals: [], accounts: [], contacts: [] };

  // Не сидити у термінальні стадії (won/lost) щоб усі картки видимі у воронці
  const openStages = pipeline.stages.filter((s) => !s.terminal);

  const accounts: CrmAccount[] = [];
  const contacts: CrmContact[] = [];
  const deals: CrmDeal[] = [];

  templates.forEach((t, idx) => {
    const accountId = `acc-${preset.id}-${idx}`;
    const contactId = `ctc-${preset.id}-${idx}`;
    accounts.push({
      id: accountId,
      name: t.accountName,
      industry: t.industry,
      tier: t.tier,
    });
    contacts.push({
      id: contactId,
      accountId,
      fullName: t.contactName,
      email: t.email,
      role: t.contactRole,
      dmuRole: "economic_buyer",
    });

    const stage = openStages[Math.min(t.stageOffset, openStages.length - 1)] ?? openStages[0];
    deals.push({
      id: `deal-${preset.id}-${idx}`,
      title: t.title,
      accountId,
      primaryContactId: contactId,
      pipelineId: pipeline.id,
      stageId: stage.id,
      value: t.value,
      currency: "UAH",
      probability: stage.defaultProbability,
      expectedCloseAt: daysAheadISO(t.daysToClose),
      ownerId: "owner-self",
      source: t.source,
      stageEnteredAt: daysAgoISO(t.daysInStage),
      lastActivityAt: daysAgoISO(Math.max(0, t.daysInStage - 1)),
      nextStep: t.nextStep,
      tags: t.tags,
      health: preset.healthDrivers.length
        ? {
            score: t.healthScore,
            level: healthLevel(t.healthScore),
            drivers: preset.healthDrivers.map((d) => ({
              id: d.id,
              label: d.label,
              weight: d.weight,
              score: Math.max(0, Math.min(100, t.healthScore + (Math.random() * 20 - 10))),
              hint: d.hint,
            })),
            updatedAt: daysAgoISO(0),
          }
        : undefined,
    });
  });

  return { deals, accounts, contacts };
}
