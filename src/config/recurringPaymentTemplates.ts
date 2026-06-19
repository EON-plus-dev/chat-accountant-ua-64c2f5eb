/**
 * Шаблони регулярних платежів — мок-дані для Wave 3.
 *
 * `RecurringTemplate` описує повторюваний платіж (оренда, підписка, гонорар бухгалтеру тощо).
 * На основі цих шаблонів `useCashFlowForecast` автоматично генерує scheduled-платежі
 * на наступні 90 днів для прогнозу касового потоку.
 */

import type { LucideIcon } from "lucide-react";
import { Building2, Wifi, Server, Palette, Briefcase, Wallet } from "lucide-react";

export type RecurrencePeriod = "monthly" | "quarterly" | "yearly";

export interface RecurringTemplate {
  id: string;
  name: string;
  amount: number;
  currency: "UAH";
  period: RecurrencePeriod;
  /** Для monthly — день місяця (1–31). Для quarterly — день у місяці кінця кварталу. */
  dayOfMonth: number;
  category: "rent" | "internet" | "hosting" | "subscription" | "service" | "salary";
  active: boolean;
  Icon: LucideIcon;
  /** Дата наступного очікуваного списання (ISO). */
  nextDate: string;
}

export const recurrenceLabel: Record<RecurrencePeriod, string> = {
  monthly: "щомісяця",
  quarterly: "щокварталу",
  yearly: "щороку",
};

/** Helper — обчислити наступну дату для шаблону, починаючи від today. */
export function computeNextDate(period: RecurrencePeriod, dayOfMonth: number, fromDate = new Date()): Date {
  const today = new Date(fromDate);
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(today.getFullYear(), today.getMonth(), Math.min(dayOfMonth, 28));
  if (candidate < today) {
    if (period === "monthly") {
      candidate.setMonth(candidate.getMonth() + 1);
    } else if (period === "quarterly") {
      candidate.setMonth(candidate.getMonth() + 3);
    } else {
      candidate.setFullYear(candidate.getFullYear() + 1);
    }
  }
  return candidate;
}

/** Згенерувати ISO-дати наступних N виконань шаблону (включно з `count` дат). */
export function generateOccurrences(template: RecurringTemplate, count: number, fromDate = new Date()): string[] {
  const dates: string[] = [];
  let next = computeNextDate(template.period, template.dayOfMonth, fromDate);
  for (let i = 0; i < count; i++) {
    dates.push(next.toISOString().slice(0, 10));
    const n = new Date(next);
    if (template.period === "monthly") n.setMonth(n.getMonth() + 1);
    else if (template.period === "quarterly") n.setMonth(n.getMonth() + 3);
    else n.setFullYear(n.getFullYear() + 1);
    next = n;
  }
  return dates;
}

const today = new Date();
const isoNext = (day: number, period: RecurrencePeriod = "monthly") =>
  computeNextDate(period, day, today).toISOString().slice(0, 10);

export const demoRecurringTemplates: RecurringTemplate[] = [
  {
    id: "rec-rent",
    name: "Оренда офісу (коворкінг Creative Quarter)",
    amount: 6_500,
    currency: "UAH",
    period: "monthly",
    dayOfMonth: 1,
    category: "rent",
    active: true,
    Icon: Building2,
    nextDate: isoNext(1),
  },
  {
    id: "rec-internet",
    name: "Інтернет (Київстар бізнес)",
    amount: 450,
    currency: "UAH",
    period: "monthly",
    dayOfMonth: 5,
    category: "internet",
    active: true,
    Icon: Wifi,
    nextDate: isoNext(5),
  },
  {
    id: "rec-hosting",
    name: "Hostinger — домен + хостинг",
    amount: 280,
    currency: "UAH",
    period: "monthly",
    dayOfMonth: 12,
    category: "hosting",
    active: true,
    Icon: Server,
    nextDate: isoNext(12),
  },
  {
    id: "rec-figma",
    name: "Figma Professional",
    amount: 620,
    currency: "UAH",
    period: "monthly",
    dayOfMonth: 18,
    category: "subscription",
    active: true,
    Icon: Palette,
    nextDate: isoNext(18),
  },
  {
    id: "rec-accountant",
    name: "Бухгалтер (аутсорс — Smart Accounting)",
    amount: 2_400,
    currency: "UAH",
    period: "monthly",
    dayOfMonth: 25,
    category: "service",
    active: true,
    Icon: Briefcase,
    nextDate: isoNext(25),
  },
  {
    id: "rec-adobe",
    name: "Adobe Creative Cloud (річна)",
    amount: 14_500,
    currency: "UAH",
    period: "yearly",
    dayOfMonth: 15,
    category: "subscription",
    active: false,
    Icon: Palette,
    nextDate: isoNext(15, "yearly"),
  },
];

export const POPULAR_TEMPLATE_PRESETS: Array<{
  label: string;
  amount: number;
  category: RecurringTemplate["category"];
  Icon: LucideIcon;
}> = [
  { label: "Оренда офісу", amount: 6_500, category: "rent", Icon: Building2 },
  { label: "Інтернет", amount: 450, category: "internet", Icon: Wifi },
  { label: "Підписка SaaS", amount: 620, category: "subscription", Icon: Palette },
  { label: "Бухгалтер", amount: 2_400, category: "service", Icon: Briefcase },
  { label: "Зарплата", amount: 12_000, category: "salary", Icon: Wallet },
];
