/**
 * DirectoryEntry — спільний контракт для всіх довідників порталу.
 *
 * Мета — уніфікувати метадані (asOf, source, lastVerifiedAt, legalBasis, faq),
 * щоб:
 *   1. AI-консультант посилався на entry-сторінки з гарантованою свіжістю даних.
 *   2. SEO-сторінки автоматично рендерили JSON-LD (Article + FAQPage + BreadcrumbList).
 *   3. Адмінка показувала індикатор «прострочено» для записів з `nextReviewAt < now()`.
 */

import type { FactConfidence } from "./types";

export type DirectoryCategory =
  | "penalties"
  | "laws"
  | "kved"
  | "grants"
  | "licenses"
  | "registers"
  | "templates"
  | "businessForms"
  | "slovnyk"
  | "stavky"
  | "accountants"
  | "calendar"
  // нові категорії — будуть наповнені у наступних етапах
  | "sudy"
  | "rozyasnennia"
  | "derzhorgany"
  | "biudzhetni-rakhunky"
  | "atsk-kep"
  | "katottg"
  | "profesii"
  | "plan-rakhunkiv"
  | "ukt-zed"
  | "viyskovyy-oblik"
  | "pdv-pilhy";

export type DirectoryAudience = "business" | "personal" | "both";

export interface DirectoryFaqItem {
  q: string;
  a: string;
}

export interface DirectorySeo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface DirectoryEntry<Payload = unknown> {
  /** Унікальний id (для UI key, посилань) */
  id: string;
  /** URL-slug (`/dovidnyky/{category}/{slug}`) */
  slug: string;
  category: DirectoryCategory;
  audience?: DirectoryAudience;

  title: string;
  /** Коротке резюме для карток у списках і og:description */
  summary: string;

  /** Категорійно-специфічні поля (penaltyAmount, articleNumber тощо) */
  payload: Payload;

  /** Дата зрізу значення / редакції */
  asOf: string;
  /** З якої дати норма набула чинності (для law/penalty) */
  effectiveFrom?: string;
  /** До якої дати норма діяла (опц.) */
  effectiveTo?: string;

  /** Назва офіційного джерела ("Кодекс адмін. правопорушень", "ЗУ № 2755-VI") */
  source: string;
  /** Канонічне посилання на офіційне джерело */
  sourceUrl: string;
  /** Нормативна основа (статтю/пункт/постанову) */
  legalBasis?: string;

  confidence: FactConfidence;

  /** Дата останньої перевірки редактором */
  lastVerifiedAt: string;
  /** Коли запис має бути перевірений знов (для індикатора «прострочено») */
  nextReviewAt?: string;

  /** Id інших фактів реєстру, на які цей запис посилається */
  relatedFactIds?: string[];
  /** Id інших entry того ж або іншого довідника (формат `{category}:{slug}`) */
  relatedEntryIds?: string[];
  /** Id калькуляторів `/tools/{slug}`, дотичних до запису */
  relatedToolIds?: string[];

  /** Людський лейбл категорії для BreadcrumbList */
  breadcrumbCategoryLabel?: string;

  faq?: DirectoryFaqItem[];
  seo?: DirectorySeo;
}

/** Утиліта: чи прострочений запис (для індикатора в адмінці) */
export function isDirectoryEntryOverdue(entry: Pick<DirectoryEntry, "nextReviewAt">): boolean {
  if (!entry.nextReviewAt) return false;
  return new Date(entry.nextReviewAt) < new Date();
}

/** Людські лейбли категорій (для UI, breadcrumbs, AI-серіалізації) */
export const DIRECTORY_CATEGORY_LABEL: Record<DirectoryCategory, string> = {
  penalties: "Штрафи",
  laws: "Закони та кодекси",
  kved: "КВЕД 2010",
  grants: "Гранти",
  licenses: "Ліцензії та дозволи",
  registers: "Державні реєстри",
  templates: "Шаблони документів",
  businessForms: "Форми бізнесу",
  slovnyk: "Бухгалтерський словник",
  stavky: "Ставки та показники",
  accountants: "Бухгалтери-партнери",
  calendar: "Податковий календар",
  sudy: "Судова практика",
  rozyasnennia: "Роз'яснення ДПС",
  derzhorgany: "Державні органи",
  "biudzhetni-rakhunky": "Бюджетні рахунки",
  "atsk-kep": "АЦСК та КЕП",
  katottg: "КАТОТТГ",
  profesii: "Класифікатор професій",
  "plan-rakhunkiv": "План рахунків бухобліку",
  "ukt-zed": "УКТ ЗЕД",
  "viyskovyy-oblik": "Військовий облік",
  "pdv-pilhy": "Пільги з ПДВ",
};
