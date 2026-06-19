/**
 * VerticalPack — конфіг-описувач вертикалі (salon/tennis_club/hotel/restaurant).
 *
 * Принципи:
 *   • Один файл-пак на вертикаль (`src/core/packs/{vertical}.ts`).
 *   • UI-секції (settings, bookings, public widget) читають labels/defaults
 *     звідси, а не хардкодять «Крісла»/«Майстри»/«Запис».
 *   • Резолвер `getVerticalPack(cabinet)` — поки що за `cabinet.industry`,
 *     на Етапі 5 переключиться на `cabinet.capabilities`.
 *
 * Див. .lovable/plan.md, Етап 2-3.
 */

import type { Cabinet } from "@/types/cabinet";

export type VerticalId = "salon" | "tennis_club" | "hotel" | "restaurant";

export type ResourceKind = "chair" | "court" | "room" | "table";

export type SettingsSectionId =
  | "general"
  | "workstations"
  | "masters"
  | "services"
  | "schedule"
  | "categories"
  | "loyalty"
  | "payouts"
  | "memberships"
  | "channels";

export interface VerticalLabels {
  /** Plural: «Крісла» / «Корти» / «Номери» / «Столи» */
  resourcePlural: string;
  /** Singular: «Крісло» / «Корт» / «Номер» / «Стіл» */
  resourceSingular: string;
  /** Plural: «Майстри» / «Тренери» / «—» / «Офіціанти» */
  staffPlural: string;
  /** Singular: «Майстер» / «Тренер» / «—» / «Офіціант» */
  staffSingular: string;
  /** «Запис» / «Бронювання корту» / «Бронювання номера» / «Резерв стола» */
  bookingSingular: string;
  bookingPlural: string;
  /** «Послуга» / «Тренування» / «—» / «Страва» — для меню/прайсу */
  serviceSingular: string;
  servicePlural: string;
  /** Підпис клієнта: «Клієнт» / «Гість» */
  clientSingular: string;
}

export interface VerticalBookings {
  resourceKind: ResourceKind;
  /** Тривалість слоту за замовчуванням (хв) */
  defaultDurationMin: number;
  /** Чи підтримує date-range (overnight) — true для hotel */
  supportsDateRange: boolean;
  /** Місткість одного слоту (1 для salon/hotel/table, N для tennis групових/restaurant) */
  capacityPerSlot: number;
  /** Чи прив'язаний запис до конкретного staff (false для hotel) */
  requiresStaff: boolean;
}

/**
 * Правила бронювання вертикалі (рушій доступності + публічний віджет).
 * Етап 4: ці значення — єдине джерело для UI-обмежень.
 */
export interface VerticalBookingRules {
  /** Допустимі тривалості (хв) у вибірці клієнтом. Для hotel — у днях через `supportsDateRange`. */
  allowedDurationsMin?: number[];
  /** Мін. час від «зараз» до старту бронювання (год). */
  leadHours: number;
  /** Горизонт бронювання у днях наперед. */
  horizonDays: number;
  /** Макс. активних майбутніх бронювань на один номер телефону. */
  maxActivePerPhone: number;
  /** Чи потрібен депозит при бронюванні. */
  requiresDeposit: boolean;
  /** % від суми (0-100), якщо `requiresDeposit`. */
  depositPct?: number;
  /** Скільки хв тримати «soft-hold» поки клієнт не підтвердив. */
  softHoldMin?: number;
}

/**
 * Дефолти бізнес-правил вертикалі (винагороди, no-show, бонусна політика).
 * Це seed-значення для нових кабінетів; кабінет може перевизначити у налаштуваннях.
 */
export interface VerticalDefaults {
  /** Дефолтна комісія штатного співробітника, %. */
  staffCommissionPct: number;
  /** Дефолтна комісія ФОП-орендаря, %. */
  fopCommissionPct: number;
  /** Кешбек клієнту, % від чека. */
  cashbackPct: number;
  /** Поріг no-show (кількість пропусків до санкцій). */
  noShowThreshold: number;
  /** Категорії послуг за замовчуванням (id + лейбл). */
  serviceCategories: { id: string; label: string }[];
  /** Інтеграції, рекомендовані для вертикалі (id для рендеру в `SalonIntegrationsSection`). */
  recommendedIntegrations: string[];
}

export interface VerticalSettings {
  /** Порядок секцій у NAV_ITEMS налаштувань вертикалі */
  sections: SettingsSectionId[];
  /** Секції, які приховані для цієї вертикалі (фільтр для shared NAV) */
  hidden: SettingsSectionId[];
}

/**
 * Override локального лейбла секції у SalonSettingsSection.
 * Ключ — внутрішній SalonSectionId (workstations, masters, delegations, shifts,
 * services, categories, payout-rules, hours, clients, sales-purchases,
 * online-booking, reminders, integrations).
 */
export type SettingsLabelOverrides = Record<string, { label: string; description: string }>;

export interface VerticalSettingsNav {
  /** Заголовок сторінки налаштувань вертикалі */
  title: string;
  /** Підзаголовок під h2 */
  subtitle: string;
  /** Перевизначення міток nav-секцій (інакше — salon-defaults у компоненті) */
  overrides: SettingsLabelOverrides;
}

export interface VerticalPack {
  id: VerticalId;
  /** Дисплейна назва вертикалі («Салон краси», «Тенісний клуб», …) */
  displayName: string;
  labels: VerticalLabels;
  bookings: VerticalBookings;
  /** Правила бронювання (рушій доступності + публічний віджет). */
  bookingRules: VerticalBookingRules;
  /** Seed-дефолти бізнес-правил для нового кабінету вертикалі. */
  defaults: VerticalDefaults;
  settings: VerticalSettings;
  /** Конфіг сторінки налаштувань (заголовок, підзаголовок, overrides nav) */
  settingsNav: VerticalSettingsNav;
}

// ──────────────────────────── Registry ────────────────────────────

import { salonPack } from "./packs/salon";
import { tennisPack } from "./packs/tennis";
import { hotelPack } from "./packs/hotel";
import { restaurantPack } from "./packs/restaurant";

const PACKS: Record<VerticalId, VerticalPack> = {
  salon: salonPack,
  tennis_club: tennisPack,
  hotel: hotelPack,
  restaurant: restaurantPack,
};

/**
 * Резолвер пакa за кабінетом.
 * Поки що — за `cabinet.industry`. Етап 5: переключити на capabilities.
 * Якщо вертикаль невідома — повертає salonPack як fallback (історичний default).
 */
export function getVerticalPack(cabinet: Cabinet | null | undefined): VerticalPack {
  return PACKS[getVerticalId(cabinet)];
}

/**
 * Резолвить vertical id за кабінетом. Єдина точка прийняття рішення —
 * усі споживачі, що раніше робили `cabinet.industry === "tennis_club"`,
 * мають викликати цю функцію та порівнювати з `"tennis_club"`.
 *
 * Поки що джерело істини — `cabinet.industry`. Коли в `CabinetCapability`
 * зʼявляться subcapabilities (`bookings:court`/`bookings:room`/...), резолвер
 * почне дивитися на них першим, а industry лишиться як аналітичний тег.
 */
export function getVerticalId(cabinet: Cabinet | null | undefined): VerticalId {
  // 1) Явний override через bookings:* subcapabilities (нове джерело істини).
  const caps = cabinet?.capabilities;
  if (caps) {
    if (caps.includes("bookings:court")) return "tennis_club";
    if (caps.includes("bookings:room")) return "hotel";
    if (caps.includes("bookings:table")) return "restaurant";
    if (caps.includes("bookings:chair")) return "salon";
  }
  // 2) Industry (legacy fallback — поки не всі кабінети мають subcaps).
  const industry = cabinet?.industry;
  if (industry === "tennis_club") return "tennis_club";
  if (industry === "hotel") return "hotel";
  if (industry === "restaurant") return "restaurant";
  if (industry === "salon") return "salon";
  // Fallback — salon (історичний default для bookings-кабінетів)
  return "salon";
}

/**
 * Strict variant: повертає id лише якщо кабінет дійсно є однією з
 * bookings-вертикалей. Для consulting/trade/it/… повертає null.
 * Використовується там, де потрібно розрізнити «це bookings-кабінет»
 * vs «це загальний ФОП/ТОВ».
 */
export function getVerticalIdOrNull(cabinet: Cabinet | null | undefined): VerticalId | null {
  // 1) bookings:* subcapabilities
  const caps = cabinet?.capabilities;
  if (caps) {
    if (caps.includes("bookings:court")) return "tennis_club";
    if (caps.includes("bookings:room")) return "hotel";
    if (caps.includes("bookings:table")) return "restaurant";
    if (caps.includes("bookings:chair")) return "salon";
  }
  // 2) Industry
  const industry = cabinet?.industry;
  if (industry === "tennis_club") return "tennis_club";
  if (industry === "hotel") return "hotel";
  if (industry === "restaurant") return "restaurant";
  if (industry === "salon") return "salon";
  // 3) Demo-id fallback
  const id = cabinet?.id;
  if (id === "demo-tennis-3") return "tennis_club";
  if (id === "demo-hotel-3") return "hotel";
  if (id === "demo-restaurant-3" || id === "demo-restaurant-2") return "restaurant";
  if (id === "demo-salon-3") return "salon";
  return null;
}

export function getVerticalPackById(id: VerticalId): VerticalPack {
  return PACKS[id];
}

/**
 * Резолвить (title, description) для конкретної nav-секції налаштувань
 * вертикалі. Якщо в паку немає override — повертає переданий fallback.
 *
 * Використання у секції:
 *   const { title, description } = getSettingsSectionLabel(
 *     cabinet,
 *     "services",
 *     { title: "Послуги та прайс", description: "Каталог послуг салону…" },
 *   );
 */
export function getSettingsSectionLabel(
  cabinet: Cabinet | null | undefined,
  sectionId: string,
  fallback: { title: string; description: string },
): { title: string; description: string } {
  const pack = getVerticalPack(cabinet);
  const ov = pack.settingsNav.overrides[sectionId];
  if (!ov) return fallback;
  return { title: ov.label, description: ov.description };
}

