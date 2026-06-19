/**
 * Realistic mock event stream for individual cabinet "Мої події".
 *
 * Persona: активна фізособа в Києві — інвестор IBKR, орендодавець квартири на
 * Лесі Українки, орендодавець квартири у Варшаві, дитина-першокурсник у КНУ,
 * член тенісного клубу Net Point, користувач Beauty Zatyshok.
 *
 * Used by IndividualEventsView (Phase B of "AI OS" IA redesign).
 * NOT consumed by SystemEventsView — that one still uses eventJournalConfig.
 */

import {
  Receipt,
  CreditCard,
  FileText,
  CalendarCheck,
  Repeat,
  TrendingUp,
  Home,
  Heart,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type EventChannel =
  | "tax"
  | "payment"
  | "document"
  | "booking"
  | "subscription"
  | "investment"
  | "property"
  | "family"
  | "ai-action"
  | "system";

export interface EventChannelMeta {
  id: EventChannel;
  label: string;
  icon: LucideIcon;
  /** CSS variable name (without --) — resolves to hsl(var(--channel-*)) */
  cssVar: string;
}

export const EVENT_CHANNELS: Record<EventChannel, EventChannelMeta> = {
  tax:           { id: "tax",          label: "Податки",       icon: Receipt,       cssVar: "channel-tax" },
  payment:       { id: "payment",      label: "Платежі",       icon: CreditCard,    cssVar: "channel-payment" },
  document:      { id: "document",     label: "Документи",     icon: FileText,      cssVar: "channel-document" },
  booking:       { id: "booking",      label: "Бронювання",    icon: CalendarCheck, cssVar: "channel-booking" },
  subscription:  { id: "subscription", label: "Підписки",      icon: Repeat,        cssVar: "channel-subscription" },
  investment:    { id: "investment",   label: "Інвестиції",    icon: TrendingUp,    cssVar: "channel-investment" },
  property:      { id: "property",     label: "Майно",         icon: Home,          cssVar: "channel-property" },
  family:        { id: "family",       label: "Родина",        icon: Heart,         cssVar: "channel-family" },
  "ai-action":   { id: "ai-action",    label: "AI-дії",        icon: Sparkles,      cssVar: "channel-ai-action" },
  system:        { id: "system",       label: "Система",       icon: Settings,      cssVar: "channel-system" },
};

export const EVENT_CHANNELS_LIST: EventChannelMeta[] = Object.values(EVENT_CHANNELS);

export type EventStatus =
  | "scheduled"   // майбутня запланована
  | "deadline"    // дедлайн без часу (день Х)
  | "completed"   // успішно виконано
  | "overdue"     // прострочено
  | "info";       // довідкова

export interface IndividualRichEvent {
  id: string;
  channel: EventChannel;
  /** Day offset from today. Negative = past, 0 = today, positive = future. */
  dayOffset: number;
  /** Optional time of day. Omit for all-day events (deadlines). */
  time?: { h: number; m: number };
  title: string;
  description?: string;
  status: EventStatus;
  amount?: number;          // UAH
  /** Where to drill: section id within current cabinet (route param). */
  drillTo?: string;
  /** Short tag on the right (e.g. "Авто", "Дедлайн"). */
  tag?: string;
}

// =============================================================
// Mock stream — ~50 events spread across -60 → +60 days
// =============================================================

export const INDIVIDUAL_RICH_EVENTS: IndividualRichEvent[] = [
  // ──────────── ПРОСТРОЧЕНО (-15 → -1) ────────────
  { id: "o-1", channel: "payment", dayOffset: -2, title: "Комунальні · Лесі Українки", description: "Київенерго · 1 847 ₴", status: "overdue", amount: 1847, tag: "Прострочено", drillTo: "payments" },
  { id: "o-2", channel: "document", dayOffset: -4, title: "Акт виконаних робіт від репетитора", description: "Не підписано — чекає вашого КЕП", status: "overdue", tag: "Підпис", drillTo: "documents" },
  { id: "o-3", channel: "tax", dayOffset: -7, title: "Сплата податку на нерухомість (квартира)", description: "78 м² · м. Київ, Лесі Українки", status: "overdue", amount: 2335, tag: "Дедлайн пройшов", drillTo: "property" },

  // ──────────── СЬОГОДНІ (0) ────────────
  { id: "t-1", channel: "ai-action", dayOffset: 0, time: { h: 8, m: 30 },
    title: "AI зіставив 3 надходження з Monobank",
    description: "Запропоновано категорії: «Зарплата», «Оренда», «Дивіденди»",
    status: "info", tag: "Огляд", drillTo: "fin-monitoring" },
  { id: "t-2", channel: "booking", dayOffset: 0, time: { h: 10, m: 30 },
    title: "Тренування з Дмитром · корт №3",
    description: "Net Point Tennis · 60 хв",
    status: "scheduled", tag: "Сьогодні", drillTo: "orders-bookings" },
  { id: "t-3", channel: "tax", dayOffset: 0, time: { h: 14, m: 0 },
    title: "Нагадування: декларація за 2025",
    description: "Дедлайн через 18 днів. Готовність чернетки: 64%",
    status: "scheduled", tag: "Декларація", drillTo: "declarations" },
  { id: "t-4", channel: "document", dayOffset: 0, time: { h: 15, m: 45 },
    title: "Квитанція стоматології підписана",
    description: "3 330 ₴ → додано до Податкової знижки 2025",
    status: "completed", amount: 3330, drillTo: "tax-discount" },
  { id: "t-5", channel: "family", dayOffset: 0, time: { h: 19, m: 0 },
    title: "День народження доньки Софії",
    description: "Бронювання столика — Канапа на 5 осіб",
    status: "scheduled", tag: "Особисте" },

  // ──────────── НАЙБЛИЖЧІ 7 ДНІВ (+1 → +7) ────────────
  { id: "u-1", channel: "booking", dayOffset: 1, time: { h: 10, m: 0 }, title: "Стрижка · Beauty Zatyshok", description: "Майстер Олена · 45 хв", status: "scheduled", drillTo: "orders-bookings" },
  { id: "u-2", channel: "payment", dayOffset: 2, title: "ПДФО з оренди (Лесі Українки)", description: "Автосплата з рахунку Monobank", status: "scheduled", amount: 32400, tag: "Авто", drillTo: "payments" },
  { id: "u-3", channel: "ai-action", dayOffset: 3, time: { h: 23, m: 0 }, title: "AI підготує чернетку декларації", description: "Запуск нічного процесу о 23:00", status: "scheduled", tag: "Авто-дія", drillTo: "declarations" },
  { id: "u-4", channel: "tax", dayOffset: 4, title: "Дедлайн: ПДФО з оренди", description: "Сплата за I квартал 2026", status: "deadline", amount: 32400, tag: "Дедлайн", drillTo: "payments" },
  { id: "u-5", channel: "tax", dayOffset: 5, title: "Дедлайн: декларація про майновий стан", description: "Останній день подачі за 2025", status: "deadline", tag: "Дедлайн", drillTo: "declarations" },
  { id: "u-6", channel: "subscription", dayOffset: 6, time: { h: 9, m: 0 }, title: "Поновлення Netflix Premium", description: "Списання 279 ₴ з картки 4441…2031", status: "scheduled", amount: 279, drillTo: "subscriptions" },
  { id: "u-7", channel: "booking", dayOffset: 6, time: { h: 18, m: 0 }, title: "Сімейна вечеря · Канапа", description: "5 осіб · бронь №B-2026-0428", status: "scheduled", drillTo: "orders-bookings" },
  { id: "u-8", channel: "booking", dayOffset: 7, time: { h: 8, m: 0 }, title: "Тренування з Дмитром · корт №1", description: "Net Point Tennis · 90 хв", status: "scheduled", drillTo: "orders-bookings" },
  { id: "u-9", channel: "investment", dayOffset: 7, time: { h: 16, m: 30 }, title: "Очікувані дивіденди MSFT", description: "$340 → ~14 280 ₴ (НБУ 42.0)", status: "scheduled", amount: 14280, drillTo: "investments" },
  { id: "u-10", channel: "ai-action", dayOffset: 7, time: { h: 11, m: 0 }, title: "AI-рекомендація: збільшити резервний фонд", description: "Поточний 28%, цільовий 50% від 3-міс. витрат", status: "info", tag: "Insight" },

  // ──────────── 8–30 ДНІВ ────────────
  { id: "f-1", channel: "tax", dayOffset: 10, title: "Дедлайн: податок на землю (Гатне)", status: "deadline", amount: 4800, tag: "Дедлайн", drillTo: "property" },
  { id: "f-2", channel: "booking", dayOffset: 11, time: { h: 17, m: 0 }, title: "Огляд авто перед ТО · Toyota RAV4", description: "СТО Avto-Plaza", status: "scheduled" },
  { id: "f-3", channel: "document", dayOffset: 12, title: "Договір оренди (Варшава) — продовження", description: "AI підготує проект для підпису", status: "scheduled", tag: "AI-проект" },
  { id: "f-4", channel: "payment", dayOffset: 14, title: "Орендний платіж від орендаря (Лесі Українки)", description: "15 000 ₴ → Monobank", status: "scheduled", amount: 15000, drillTo: "fin-monitoring" },
  { id: "f-5", channel: "booking", dayOffset: 14, time: { h: 12, m: 0 }, title: "Сімейний тренер з тенісу · корт №5", status: "scheduled" },
  { id: "f-6", channel: "tax", dayOffset: 18, title: "Дедлайн: декларація 2025 (загальний)", status: "deadline", tag: "Дедлайн", drillTo: "declarations" },
  { id: "f-7", channel: "ai-action", dayOffset: 20, title: "AI перерахує податкову знижку", description: "Очікується +6 800 ₴ після додавання квитанцій КНУ", status: "scheduled", amount: 6800, drillTo: "tax-discount" },
  { id: "f-8", channel: "subscription", dayOffset: 22, time: { h: 9, m: 0 }, title: "Поновлення Spotify Family", description: "199 ₴ · 6 учасників", status: "scheduled", amount: 199, drillTo: "subscriptions" },
  { id: "f-9", channel: "property", dayOffset: 24, title: "Страхування квартири (Лесі Українки) — продовження", description: "ARX · 3 200 ₴/рік", status: "scheduled", amount: 3200, drillTo: "property" },
  { id: "f-10", channel: "booking", dayOffset: 25, time: { h: 14, m: 0 }, title: "Стоматологія · повторний візит", description: "Клініка Lumi-Dent", status: "scheduled" },
  { id: "f-11", channel: "investment", dayOffset: 27, title: "Ребалансування портфеля (квартальне)", description: "AI-рекомендація: зменшити TSLA до 12%", status: "scheduled", tag: "AI", drillTo: "investments" },
  { id: "f-12", channel: "payment", dayOffset: 28, title: "Комунальні (квітень)", description: "Прогноз 2 100 ₴", status: "scheduled", amount: 2100, drillTo: "payments" },

  // ──────────── 31–60 ДНІВ ────────────
  { id: "ff-1", channel: "tax", dayOffset: 35, title: "Звіт за оренду нерухомості (Польща)", description: "Foreign Tax Credit · готовність 40%", status: "scheduled", tag: "Іноз. дохід" },
  { id: "ff-2", channel: "subscription", dayOffset: 42, title: "Поновлення iCloud 2 TB", description: "279 ₴/міс", status: "scheduled", amount: 279, drillTo: "subscriptions" },
  { id: "ff-3", channel: "booking", dayOffset: 45, time: { h: 11, m: 0 }, title: "Сімейна поїздка до Львова — готель", description: "3 ночі · Готель «Затишок»", status: "scheduled" },
  { id: "ff-4", channel: "property", dayOffset: 50, title: "Перевірка КАСКО Toyota RAV4", description: "До закінчення дії — 14 днів", status: "scheduled" },

  // ──────────── ІСТОРІЯ (-60 → -8) ────────────
  { id: "h-1", channel: "payment", dayOffset: -8, title: "Сплачено комунальні (Хрещатик, офіс)", status: "completed", amount: 3200, drillTo: "payments" },
  { id: "h-2", channel: "tax", dayOffset: -10, title: "Сплачено ПДФО з оренди (IV кв. 2025)", status: "completed", amount: 32400, drillTo: "payments" },
  { id: "h-3", channel: "tax", dayOffset: -10, title: "Сплачено ВЗ з оренди (IV кв. 2025)", status: "completed", amount: 9000, drillTo: "payments" },
  { id: "h-4", channel: "booking", dayOffset: -11, title: "Тренування з Дмитром · корт №2", status: "completed" },
  { id: "h-5", channel: "investment", dayOffset: -12, title: "Отримано дивіденди MSFT", description: "$340 → 14 008 ₴ (НБУ 41.20)", status: "completed", amount: 14008, drillTo: "investments" },
  { id: "h-6", channel: "document", dayOffset: -14, title: "Завантажено довідку про доходи від роботодавця", description: "За 2025 рік", status: "completed", drillTo: "documents" },
  { id: "h-7", channel: "booking", dayOffset: -15, title: "Стрижка · Beauty Zatyshok", status: "completed" },
  { id: "h-8", channel: "ai-action", dayOffset: -16, title: "AI класифікував 27 операцій з банку", description: "Точність 96% · 1 запит на уточнення", status: "completed", drillTo: "fin-monitoring" },
  { id: "h-9", channel: "subscription", dayOffset: -18, title: "Списано Netflix Premium", status: "completed", amount: 279, drillTo: "subscriptions" },
  { id: "h-10", channel: "tax", dayOffset: -20, title: "Подано декларацію про майновий стан за 2024", status: "completed", tag: "Подано", drillTo: "declarations" },
  { id: "h-11", channel: "document", dayOffset: -22, title: "Підписано договір оренди (Варшава)", description: "На 12 місяців · 18 000 PLN/міс", status: "completed", drillTo: "documents" },
  { id: "h-12", channel: "family", dayOffset: -25, title: "Оплата 2-го семестру КНУ (Софія)", status: "completed", amount: 42000 },
  { id: "h-13", channel: "investment", dayOffset: -28, title: "Продаж NVDA (FIFO лот #4)", description: "+$2 800 → +115 360 ₴", status: "completed", amount: 115360, drillTo: "investments" },
  { id: "h-14", channel: "payment", dayOffset: -32, title: "Сплачено податок на нерухомість (Київ)", status: "completed", amount: 2335, drillTo: "payments" },
  { id: "h-15", channel: "booking", dayOffset: -38, title: "Стоматологія · протезування", status: "completed", amount: 18500 },
  { id: "h-16", channel: "ai-action", dayOffset: -45, title: "AI заповнив анкету для податкової знижки", description: "9 категорій · потенційне повернення 79 647 ₴", status: "completed", drillTo: "tax-discount" },
  { id: "h-17", channel: "property", dayOffset: -55, title: "Продаж квартири (пр. Перемоги, 67)", description: "1 750 000 ₴ · ПДФО не нараховано (1-й продаж за рік)", status: "completed", amount: 1750000, drillTo: "property" },
];

/**
 * Materialize all rich events into Date instances anchored on "now".
 */
export function getIndividualRichEvents(now: Date = new Date()): Array<
  IndividualRichEvent & { at: Date; isAllDay: boolean }
> {
  return INDIVIDUAL_RICH_EVENTS.map((e) => {
    const d = new Date(now);
    d.setDate(d.getDate() + e.dayOffset);
    if (e.time) {
      d.setHours(e.time.h, e.time.m, 0, 0);
    } else {
      d.setHours(9, 0, 0, 0);
    }
    return { ...e, at: d, isAllDay: !e.time };
  }).sort((a, b) => a.at.getTime() - b.at.getTime());
}
