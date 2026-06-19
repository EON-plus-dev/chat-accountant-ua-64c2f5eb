/**
 * Unified Content Coverage Registry
 * Single source of truth for all portal content types in admin panel.
 */

import { ARTICLES } from "@/portal/data/articles";
import { mockConsultations } from "@/config/consultationMockData";
import { aiConsultations } from "@/config/aiConsultationMockData";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { LAWS } from "@/portal/data/laws";
import { GRANTS } from "@/portal/data/grants";
import { PENALTIES } from "@/portal/data/penalties";
import { TEMPLATES } from "@/portal/data/templates";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";
import { LICENSES } from "@/portal/data/licenses";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { RANKINGS } from "@/portal/data/rankings";
import { COURSES, WEBINARS } from "@/portal/data/learn";
import { TOOLS } from "@/portal/data/tools";
import { HUBS } from "@/portal/data/hubs";
import { NEWSLETTER_ISSUES } from "@/portal/data/newsletter";
import { DEADLINES } from "@/portal/data/deadlines";
import { COMPARISONS } from "@/portal/data/comparisons";
import { CATALOG_CATEGORIES } from "@/portal/data/catalog";
import { POPULAR_QUESTIONS } from "@/portal/data/popularQuestions";
import { AUTHORS } from "@/portal/data/authors";
import { MORTGAGE_PROGRAMS } from "@/portal/data/mortgageRates";
import { SALARY_BENCHMARKS } from "@/portal/data/laborMarket";
import { CURRENCY_RATES, FINANCIAL_INDICES, DEPOSIT_OFFERS, CARD_OFFERS, INSURANCE_OFFERS, FEE_COMPARISONS } from "@/portal/data/finder";

export type DataSource = "file" | "db" | "localStorage";
export type CoverageStatus = "ok" | "partial" | "missing" | "desync";

export interface ContentRegistryEntry {
  /** Content type key */
  key: string;
  /** Ukrainian label */
  label: string;
  /** Number of records */
  count: number;
  /** Where data lives */
  source: DataSource;
  /** Public portal route pattern (null = no public page) */
  portalRoute: string | null;
  /** Admin list page route (null = no admin page) */
  adminRoute: string | null;
  /** Has detail/edit route in admin */
  hasDetail: boolean;
  /** Included in SEO audit */
  inSeoAudit: boolean;
  /** Included in Dashboard metrics */
  inDashboard: boolean;
  /** Category for grouping */
  category: "content" | "directory" | "institution" | "education" | "tool" | "analytics" | "communication" | "config";
  /** Notes */
  notes?: string;
}

export function getContentRegistry(): ContentRegistryEntry[] {
  return [
    // ── Content ──
    { key: "articles", label: "Публікації", count: ARTICLES.length, source: "file", portalRoute: "/articles/:slug", adminRoute: "/admin/articles", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "content" },
    { key: "consultations", label: "Консультації (ред.)", count: mockConsultations.length, source: "file", portalRoute: "/consultations/:slug", adminRoute: "/admin/consultations", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "content" },
    { key: "ai-consultations", label: "AI-консультації", count: aiConsultations.length, source: "file", portalRoute: "/ai-consultations/:slug", adminRoute: "/admin/ai-consultations", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "content" },
    { key: "ai-forum", label: "AI-форум (БД)", count: 0, source: "db", portalRoute: "/consultant?tab=forum", adminRoute: "/admin/ai-consultations", hasDetail: true, inSeoAudit: false, inDashboard: true, category: "content", notes: "Кількість з БД (ai_chat_queries)" },
    { key: "rankings", label: "Рейтинги", count: RANKINGS.length, source: "file", portalRoute: "/publications/ratings/:categorySlug", adminRoute: "/admin/rankings", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "content" },
    { key: "newsletter", label: "Розсилки", count: NEWSLETTER_ISSUES.length, source: "file", portalRoute: "/newsletter", adminRoute: "/admin/newsletter", hasDetail: false, inSeoAudit: true, inDashboard: true, category: "content" },
    { key: "hubs", label: "Хаби", count: Object.keys(HUBS).length, source: "file", portalRoute: "/taxes, /fop, /personal, etc.", adminRoute: "/admin/hubs", hasDetail: false, inSeoAudit: true, inDashboard: true, category: "content" },
    { key: "popular-questions", label: "Поп. питання", count: POPULAR_QUESTIONS.length, source: "file", portalRoute: null, adminRoute: "/admin/questions", hasDetail: false, inSeoAudit: true, inDashboard: true, category: "communication" },

    // ── Directories ──
    { key: "knowledge", label: "Словник", count: KNOWLEDGE.length, source: "file", portalRoute: "/dovidnyky/slovnyk/:slug", adminRoute: "/admin/knowledge", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "kved", label: "КВЕД", count: KVED_ENTRIES.length, source: "file", portalRoute: "/dovidnyky/kved/:code", adminRoute: "/admin/kved", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "laws", label: "Закони", count: LAWS.length, source: "file", portalRoute: "/dovidnyky/zakony/:slug", adminRoute: "/admin/laws", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "grants", label: "Гранти", count: GRANTS.length, source: "file", portalRoute: "/dovidnyky/granty/:slug", adminRoute: "/admin/grants", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "penalties", label: "Штрафи", count: PENALTIES.length, source: "file", portalRoute: "/dovidnyky/penalties/:id", adminRoute: "/admin/penalties", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "templates", label: "Шаблони", count: TEMPLATES.length, source: "file", portalRoute: "/dovidnyky/templates/:slug", adminRoute: "/admin/templates", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "registers", label: "Реєстри", count: REGISTERS.length, source: "file", portalRoute: "/dovidnyky/reestry/:slug", adminRoute: "/admin/registers", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "rates", label: "Ставки", count: RATE_TABLES.length, source: "file", portalRoute: "/dovidnyky/stavky/:slug", adminRoute: "/admin/rates", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "licenses", label: "Ліцензії", count: LICENSES.length, source: "file", portalRoute: "/dovidnyky/litsenziyi/:slug", adminRoute: "/admin/licenses", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "business-forms", label: "Форми бізнесу", count: BUSINESS_FORMS.length, source: "file", portalRoute: "/dovidnyky/formy-biznesu/:slug", adminRoute: "/admin/business-forms", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "accountants", label: "Бухгалтери", count: ACCOUNTANTS.length, source: "file", portalRoute: "/dovidnyky/accountants/:slug", adminRoute: "/admin/accountants", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "directory" },
    { key: "deadlines", label: "Дедлайни", count: DEADLINES.length, source: "file", portalRoute: "/dovidnyky/kalendar", adminRoute: "/admin/tax-calendar", hasDetail: false, inSeoAudit: true, inDashboard: true, category: "directory" },

    // ── Institutions ──
    { key: "institutions", label: "Установи", count: INSTITUTION_PROFILES.length, source: "file", portalRoute: "/dovidnyky/ustanovy/profile/:slug", adminRoute: "/admin/institution-profiles", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "institution" },
    { key: "catalog", label: "Каталог", count: CATALOG_CATEGORIES.length, source: "file", portalRoute: "/dovidnyky/ustanovy/:categorySlug", adminRoute: "/admin/catalog", hasDetail: false, inSeoAudit: true, inDashboard: true, category: "institution" },
    { key: "gov-branches", label: "Держоргани", count: 0, source: "db", portalRoute: "/dovidnyky/ustanovy/gov/branch/:id", adminRoute: "/admin/gov-branches", hasDetail: false, inSeoAudit: false, inDashboard: false, category: "institution", notes: "Кількість з БД (gov_branches)" },
    { key: "gov-services", label: "Держпослуги", count: 0, source: "db", portalRoute: null, adminRoute: "/admin/gov-services", hasDetail: false, inSeoAudit: false, inDashboard: false, category: "institution", notes: "Кількість з БД (gov_services)" },
    { key: "gov-reviews", label: "Відгуки держорг.", count: 0, source: "db", portalRoute: null, adminRoute: "/admin/gov-reviews", hasDetail: false, inSeoAudit: false, inDashboard: false, category: "institution", notes: "Кількість з БД (gov_reviews)" },

    // ── Education ──
    { key: "courses", label: "Курси", count: COURSES.length, source: "file", portalRoute: "/learn/:category/:courseSlug", adminRoute: "/admin/courses", hasDetail: true, inSeoAudit: true, inDashboard: true, category: "education" },
    { key: "webinars", label: "Вебінари", count: WEBINARS.length, source: "file", portalRoute: "/learn/webinars", adminRoute: "/admin/courses", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "education", notes: "Керуються через Курси" },

    // ── Tools ──
    { key: "tools", label: "Інструменти", count: TOOLS.length, source: "file", portalRoute: "/tools/:slug", adminRoute: "/admin/tools", hasDetail: false, inSeoAudit: true, inDashboard: true, category: "tool" },
    { key: "comparisons", label: "Порівняння", count: Object.keys(COMPARISONS).length, source: "file", portalRoute: null, adminRoute: "/admin/comparisons", hasDetail: false, inSeoAudit: true, inDashboard: true, category: "tool" },

    // ── Analytics / Financial ──
    { key: "currencies", label: "Валюти", count: CURRENCY_RATES.rates.length, source: "file", portalRoute: "/analytics/currency", adminRoute: "/admin/finder", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },
    { key: "indices", label: "Індекси", count: FINANCIAL_INDICES.indices.length, source: "file", portalRoute: "/analytics/indices", adminRoute: "/admin/finder", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },
    { key: "deposits", label: "Депозити", count: DEPOSIT_OFFERS.offers.length, source: "file", portalRoute: "/analytics/deposits", adminRoute: "/admin/finder", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },
    { key: "cards", label: "Картки", count: CARD_OFFERS.offers.length, source: "file", portalRoute: "/analytics/cards", adminRoute: "/admin/finder", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },
    { key: "insurance", label: "Страхування", count: INSURANCE_OFFERS.offers.length, source: "file", portalRoute: "/analytics/insurance", adminRoute: "/admin/finder", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },
    { key: "fees", label: "Тарифи", count: FEE_COMPARISONS.comparisons.length, source: "file", portalRoute: "/analytics/fees", adminRoute: "/admin/finder", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },
    { key: "mortgage", label: "Іпотечні програми", count: MORTGAGE_PROGRAMS.length, source: "file", portalRoute: "/analytics/mortgage", adminRoute: "/admin/mortgage", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },
    { key: "salary", label: "Зарплатні дані", count: SALARY_BENCHMARKS.length, source: "file", portalRoute: "/analytics/labor", adminRoute: "/admin/labor-market", hasDetail: false, inSeoAudit: false, inDashboard: true, category: "analytics" },

    // ── Config / Meta ──
    { key: "authors", label: "Автори", count: AUTHORS.length, source: "file", portalRoute: null, adminRoute: "/admin/editorial-settings", hasDetail: false, inSeoAudit: false, inDashboard: false, category: "config", notes: "Керуються в Редакційних налаштуваннях" },
  ];
}

export function getRegistryStatus(entry: ContentRegistryEntry): CoverageStatus {
  if (!entry.adminRoute) return "missing";
  if (entry.source === "db" && entry.count === 0) return "partial"; // DB count not loaded
  if (!entry.portalRoute && !entry.inSeoAudit) return "partial";
  return "ok";
}
