/**
 * sequenceTemplates — каталог демо-каденцій per CRM-preset.
 *
 * Каденція = послідовність touchpoints із затримками (delayDays від моменту
 * enrollment), що породжують задачі через CRM↔Tasks bridge.
 *
 * Cabinet-agnostic: викликається getCrmSequences(presetId) і повертає
 * пресет-релевантні шаблони.
 */

import type { CrmSequence } from "../types";

// ──────────────────────────── B2B Trade ────────────────────────────
const B2B_TRADE_SEQUENCES: CrmSequence[] = [
  {
    id: "b2b_cold_outreach_5",
    label: "Холодний аутріч 5-touch",
    description: "Класична 5-крокова каденція для нових лідів",
    steps: [
      { id: "s1", kind: "email",    title: "Знайомство — value-proposition",     delayDays: 0, template: "Стислий лист зі value-prop та CTA на 15-хв дзвінок." },
      { id: "s2", kind: "linkedin", title: "Connect-запит у LinkedIn",            delayDays: 2 },
      { id: "s3", kind: "call",     title: "Дзвінок — discovery",                 delayDays: 4, template: "3 відкриті питання про поточний процес." },
      { id: "s4", kind: "email",    title: "Кейс схожого клієнта",                delayDays: 7, template: "Лист із посиланням на case-study релевантного сегменту." },
      { id: "s5", kind: "email",    title: "Break-up лист",                       delayDays: 12, template: "Останній лист — «закриваю питання, дайте знати»." },
    ],
  },
  {
    id: "b2b_reengage_stale",
    label: "Реактивація зависшої угоди",
    description: "3 touchpoints для угоди, що 14+ днів в одній стадії",
    steps: [
      { id: "r1", kind: "email",    title: "Пінг — нагадування про статус",       delayDays: 0 },
      { id: "r2", kind: "call",     title: "Дзвінок — зняти заперечення",         delayDays: 3 },
      { id: "r3", kind: "email",    title: "Альтернативна пропозиція",            delayDays: 7 },
    ],
  },
];

// ──────────────────────────── Bureau ────────────────────────────
const BUREAU_SEQUENCES: CrmSequence[] = [
  {
    id: "bureau_onboarding_series",
    label: "Welcome-серія нового клієнта",
    description: "4-крокова серія після підписання договору на обслуговування",
    steps: [
      { id: "b1", kind: "email",    title: "Welcome-лист + чек-лист первинки",    delayDays: 0 },
      { id: "b2", kind: "call",     title: "Установчий дзвінок з відповідальним", delayDays: 2 },
      { id: "b3", kind: "check_in", title: "Перевірка отримання документів",      delayDays: 5 },
      { id: "b4", kind: "meeting",  title: "Огляд першого тижня",                 delayDays: 10 },
    ],
  },
  {
    id: "bureau_quarterly_review",
    label: "Квартальна зустріч з клієнтом",
    description: "Підготовка та проведення QBR",
    steps: [
      { id: "q1", kind: "email",    title: "Запит даних для QBR",                 delayDays: 0 },
      { id: "q2", kind: "meeting",  title: "QBR-зустріч з результатами",          delayDays: 7 },
      { id: "q3", kind: "email",    title: "Follow-up з резюме та планом",        delayDays: 9 },
    ],
  },
];

// ──────────────────────────── Personal / fallback ────────────────────────────
const PERSONAL_SEQUENCES: CrmSequence[] = [
  {
    id: "personal_followup_3",
    label: "Простий follow-up (3 touch)",
    description: "Мінімальна каденція для особистих контактів",
    steps: [
      { id: "p1", kind: "whatsapp", title: "Перше повідомлення",                  delayDays: 0 },
      { id: "p2", kind: "call",     title: "Дзвінок-уточнення",                   delayDays: 3 },
      { id: "p3", kind: "whatsapp", title: "Фінальне нагадування",                delayDays: 7 },
    ],
  },
];

const REGISTRY: Record<string, CrmSequence[]> = {
  b2b_trade: B2B_TRADE_SEQUENCES,
  bureau: BUREAU_SEQUENCES,
  personal: PERSONAL_SEQUENCES,
  // SaaS використовує власний CrmSection — не задіяний тут
};

export function getCrmSequences(presetId: string): CrmSequence[] {
  return REGISTRY[presetId] ?? B2B_TRADE_SEQUENCES;
}

export function findCrmSequence(presetId: string, sequenceId: string) {
  return getCrmSequences(presetId).find((s) => s.id === sequenceId);
}
