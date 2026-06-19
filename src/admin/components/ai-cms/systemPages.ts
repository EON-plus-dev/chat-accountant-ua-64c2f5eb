/**
 * Registry of "system" (non-article) pages — top-level public routes from src/App.tsx.
 * Used by AI CMS Sitemap and Preview workspaces for SEO/Analytics/Edit context.
 *
 * Excluded: /admin/*, /me/*, cabinet routes, checkout/auth flow, pure Navigate redirects.
 * Dynamic :slug entry-pages are not enumerated here — they appear via ARTICLES
 * or via a "collection" virtual node in the sitemap tree.
 */
export type SystemPageCategory =
  | "Лендинг"
  | "Дашборд"
  | "Хаб"
  | "Аналітика"
  | "Публікації"
  | "Навчання"
  | "Інструмент"
  | "Каталог"
  | "Довідник";

export interface SystemPage {
  path: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  category: SystemPageCategory;
  /** Approximate monthly traffic share for mock analytics (0-1) */
  trafficWeight?: number;
  /**
   * Куди класти згенерований AI контент:
   * - 'article'      — окрема стаття-супутник, прив'язана до сторінки
   * - 'page-section' — блок усередині JSX сторінки (потребує структурованих блоків)
   * - 'none'         — лише текст/SEO правки, генерація статей не передбачена
   */
  contentTarget: "article" | "page-section" | "none";
  /** Якщо сторінка — динамічна колекція (entries за :slug), сюди пишемо назву таблиці для count-запиту */
  collectionTable?: string;
  /**
   * Якщо колекція живе у статичних файлах `src/portal/data/*.ts` (а не в Supabase),
   * вказуємо ключ із STATIC_COLLECTION_COUNTS у CmsSitemapPanel.
   */
  staticCollection?: string;
  /** Deeplink на адмінку конкретної сутності (CRUD-сторінку), якщо є. */
  adminUrl?: string;
}

// ─── Лендинги ──────────────────────────────────────────────────────────────
const LANDINGS: SystemPage[] = [
  { path: "/", title: "Головна — Fintodo (бізнес)", description: "Продуктовий лендинг для бізнесу та ФОП.", category: "Лендинг", trafficWeight: 1, contentTarget: "none" },
  { path: "/individuals", title: "Лендинг — Фізособи", description: "Сценарій для фізосіб: податкова знижка, інвестиції, контроль витрат.", category: "Лендинг", trafficWeight: 0.4, contentTarget: "none" },
  { path: "/partners", title: "Лендинг — Партнери", description: "Партнерська програма для бухгалтерів і бюро.", category: "Лендинг", trafficWeight: 0.2, contentTarget: "none" },
  { path: "/partners/program", title: "Партнерська програма — деталі", description: "Pitch-сторінка з умовами та комісіями.", category: "Лендинг", trafficWeight: 0.05, contentTarget: "none" },
  { path: "/pricing", title: "Тарифи", description: "Тарифна сітка 2026: Старт, Смарт, Преміум.", category: "Лендинг", trafficWeight: 0.5, contentTarget: "none" },
];

// ─── Дашборд / Огляд ───────────────────────────────────────────────────────
const DASHBOARDS: SystemPage[] = [
  { path: "/overview", title: "Огляд — Morning Brief", description: "Динамічний дашборд із блоком «Ринок сьогодні» та щоденними індикаторами.", category: "Дашборд", trafficWeight: 0.45, contentTarget: "article" },
  { path: "/radar", title: "Радар змін", description: "Стрічка ключових змін у законах, ставках і ринку.", category: "Дашборд", trafficWeight: 0.15, contentTarget: "article" },
  { path: "/saved", title: "Збережене", description: "Особистий список збережених статей і матеріалів.", category: "Дашборд", trafficWeight: 0.05, contentTarget: "none" },
];

// ─── Хаби ──────────────────────────────────────────────────────────────────
const HUBS: SystemPage[] = [
  { path: "/taxes", title: "Хаб — Податки", description: "Центральний хаб з податкових тем.", category: "Хаб", trafficWeight: 0.4, contentTarget: "page-section" },
  { path: "/fop", title: "Хаб — ФОП", description: "Все про ФОП: групи, ліміти, звітність, єдиний податок.", category: "Хаб", trafficWeight: 0.5, contentTarget: "page-section" },
  { path: "/personal", title: "Хаб — Особисті фінанси", description: "Бюджет, інвестиції, кредити, страхування для фізосіб.", category: "Хаб", trafficWeight: 0.3, contentTarget: "page-section" },
  { path: "/wartime", title: "Хаб — Воєнний час", description: "Особливості ведення бізнесу та податків у воєнний час.", category: "Хаб", trafficWeight: 0.2, contentTarget: "page-section" },
  { path: "/accounting", title: "Хаб — Бухгалтерія", description: "Облікова політика, первинні документи, звітність.", category: "Хаб", trafficWeight: 0.25, contentTarget: "page-section" },
  { path: "/law", title: "Хаб — Право", description: "Корпоративне, договірне, трудове право.", category: "Хаб", trafficWeight: 0.2, contentTarget: "page-section" },
];

// ─── Аналітика ─────────────────────────────────────────────────────────────
const ANALYTICS: SystemPage[] = [
  { path: "/analytics", title: "Аналітика ринку", description: "Унікальні індекси, ключові цифри, макропоказники 2026.", category: "Аналітика", trafficWeight: 0.25, contentTarget: "article" },
  { path: "/analytics/currency", title: "Валюти", description: "Курси, тренди, прогнози.", category: "Аналітика", trafficWeight: 0.2, contentTarget: "article" },
  { path: "/analytics/deposits", title: "Депозити", description: "Ставки за валютами, термінами, банками.", category: "Аналітика", trafficWeight: 0.15, contentTarget: "article" },
  { path: "/analytics/cards", title: "Картки", description: "Кешбек, тарифи, лімити.", category: "Аналітика", trafficWeight: 0.12, contentTarget: "article" },
  { path: "/analytics/insurance", title: "Страхування", description: "Ставки ОСЦПВ, КАСКО, ДМС.", category: "Аналітика", trafficWeight: 0.1, contentTarget: "article" },
  { path: "/analytics/fees", title: "Комісії", description: "Аналіз банківських комісій.", category: "Аналітика", trafficWeight: 0.08, contentTarget: "article" },
  { path: "/analytics/indices", title: "Індекси Fintodo", description: "Унікальні індекси з 140px sparkline.", category: "Аналітика", trafficWeight: 0.1, contentTarget: "article" },
  { path: "/analytics/labor", title: "Ринок праці", description: "Зарплати, вакансії, динаміка.", category: "Аналітика", trafficWeight: 0.1, contentTarget: "article" },
  { path: "/analytics/mortgage", title: "Іпотека", description: "Програми, ставки, доступність.", category: "Аналітика", trafficWeight: 0.1, contentTarget: "article" },
  { path: "/analytics/archive", title: "Архів аналітики", description: "Історичні зрізи показників.", category: "Аналітика", trafficWeight: 0.05, contentTarget: "none" },
];

// ─── Публікації ────────────────────────────────────────────────────────────
const PUBLICATIONS: SystemPage[] = [
  { path: "/publications", title: "Публікації — хаб", description: "Новини, гайди, подкасти, відео, рейтинги, консультації, відгуки.", category: "Публікації", trafficWeight: 0.4, contentTarget: "page-section" },
  { path: "/publications/news", title: "Новини", description: "Стрічка новин для бізнесу та фізосіб.", category: "Публікації", trafficWeight: 0.3, contentTarget: "article" },
  { path: "/publications/guides", title: "Гайди", description: "Покрокові інструкції з обліку та права.", category: "Публікації", trafficWeight: 0.35, contentTarget: "article" },
  { path: "/publications/podcasts", title: "Подкасти", description: "Аудіо-розмови з експертами.", category: "Публікації", trafficWeight: 0.1, contentTarget: "article" },
  { path: "/publications/videos", title: "Відео", description: "Відео-уроки та інтерв'ю.", category: "Публікації", trafficWeight: 0.12, contentTarget: "article" },
  { path: "/publications/ratings", title: "Рейтинги", description: "Рейтинги банків, страхових, бухгалтерів.", category: "Публікації", trafficWeight: 0.18, contentTarget: "article", staticCollection: "rankings", adminUrl: "/admin/rankings" },
  { path: "/publications/consultations", title: "Консультації", description: "Архів консультацій від експертів.", category: "Публікації", trafficWeight: 0.15, contentTarget: "article", collectionTable: "consultations", adminUrl: "/admin/consultations" },
  { path: "/publications/reviews", title: "Відгуки", description: "Відгуки користувачів про послуги.", category: "Публікації", trafficWeight: 0.1, contentTarget: "article", adminUrl: "/admin/gov-reviews" },
  { path: "/newsletter", title: "Розсилка", description: "Архів випусків розсилки Fintodo.", category: "Публікації", trafficWeight: 0.12, contentTarget: "article", staticCollection: "newsletter", adminUrl: "/admin/newsletter" },
];

// ─── Навчання ──────────────────────────────────────────────────────────────
const LEARN: SystemPage[] = [
  { path: "/learn", title: "Навчальний центр", description: "Курси, вебінари, сертифікація.", category: "Навчання", trafficWeight: 0.4, contentTarget: "page-section", staticCollection: "courses", adminUrl: "/admin/courses" },
  { path: "/learn/webinars", title: "Вебінари", description: "Найближчі та поточні вебінари.", category: "Навчання", trafficWeight: 0.2, contentTarget: "article", staticCollection: "webinars" },
  { path: "/learn/webinars/archive", title: "Архів вебінарів", description: "Записи попередніх вебінарів.", category: "Навчання", trafficWeight: 0.1, contentTarget: "none" },
  { path: "/learn/certification", title: "Сертифікація", description: "Програма сертифікації Fintodo.", category: "Навчання", trafficWeight: 0.1, contentTarget: "article" },
];

// ─── Інструменти ───────────────────────────────────────────────────────────
const TOOLS: SystemPage[] = [
  { path: "/tools", title: "Інструменти — хаб", description: "Каталог калькуляторів і утиліт.", category: "Інструмент", trafficWeight: 0.6, contentTarget: "page-section" },
  { path: "/consultant", title: "AI-консультант", description: "Сторінка AI-консультанта з форумом.", category: "Інструмент", trafficWeight: 0.35, contentTarget: "article" },
  // Топ tool-сторінки (стабільні slug з ToolsHub):
  { path: "/tools/esv-calc", title: "Калькулятор ЄСВ", description: "Розрахунок ЄСВ для ФОП та найманих.", category: "Інструмент", trafficWeight: 0.3, contentTarget: "article" },
  { path: "/tools/tax-calc", title: "Калькулятор єдиного податку", description: "Порівняння груп ФОП.", category: "Інструмент", trafficWeight: 0.3, contentTarget: "article" },
  { path: "/tools/salary-calc", title: "Калькулятор зарплати", description: "Gross → Net, ПДФО 18%, ВЗ 5%.", category: "Інструмент", trafficWeight: 0.25, contentTarget: "article" },
  { path: "/tools/counterparty", title: "Перевірка контрагента", description: "Статус, керівник, борги ДПС за ЄДРПОУ.", category: "Інструмент", trafficWeight: 0.2, contentTarget: "article" },
  { path: "/tools/kved", title: "Пошук КВЕД", description: "Перевірка сумісності КВЕД із групами ФОП.", category: "Інструмент", trafficWeight: 0.2, contentTarget: "article" },
  { path: "/tools/calendar", title: "Податковий календар (інструмент)", description: "Дедлайни з фільтром та нагадуваннями.", category: "Інструмент", trafficWeight: 0.25, contentTarget: "article" },
  { path: "/tools/credit-calc", title: "Кредитний калькулятор", description: "Розрахунок платежів і порівняння банків.", category: "Інструмент", trafficWeight: 0.15, contentTarget: "article" },
  { path: "/tools/deposit-calc", title: "Депозитний калькулятор", description: "Дохідність вкладу.", category: "Інструмент", trafficWeight: 0.15, contentTarget: "article" },
  { path: "/tools/invest-calc", title: "Інвестиційний калькулятор", description: "Прогноз капіталу зі складними відсотками.", category: "Інструмент", trafficWeight: 0.12, contentTarget: "article" },
  { path: "/tools/insurance-calc", title: "Калькулятор страхування", description: "ОСЦПВ, КАСКО, ДМС.", category: "Інструмент", trafficWeight: 0.1, contentTarget: "article" },
  { path: "/tools/invoice", title: "Генератор рахунків", description: "Рахунок-фактура PDF за 2 хв.", category: "Інструмент", trafficWeight: 0.08, contentTarget: "article" },
  { path: "/tools/contract-builder", title: "Конструктор договорів", description: "Договори підряду, оренди, послуг.", category: "Інструмент", trafficWeight: 0.08, contentTarget: "article" },
  { path: "/tools/cashflow", title: "Прогноз грошових потоків", description: "На 3/6/12 місяців.", category: "Інструмент", trafficWeight: 0.05, contentTarget: "article" },
  { path: "/tools/breakeven", title: "Точка беззбитковості", description: "Розрахунок беззбиткового обсягу.", category: "Інструмент", trafficWeight: 0.05, contentTarget: "article" },
  { path: "/tools/compare", title: "Порівняння продуктів", description: "Готові порівняння банків, тарифів, послуг.", category: "Інструмент", trafficWeight: 0.1, contentTarget: "page-section", staticCollection: "comparisons", adminUrl: "/admin/comparisons" },
];

// ─── Каталог установ (під /dovidnyky/ustanovy) ─────────────────────────────
const CATALOG_CATEGORIES = [
  { slug: "gov", title: "Державні органи" },
  { slug: "banks", title: "Банки" },
  { slug: "insurance", title: "Страхові" },
  { slug: "legal", title: "Юридичні послуги" },
  { slug: "payments", title: "Платежі та еквайринг" },
  { slug: "invest", title: "Інвестиції та фонди" },
  { slug: "credit", title: "Кредит і лізинг" },
  { slug: "accounting", title: "Бухгалтерські послуги" },
  { slug: "digital_tools", title: "Цифрові інструменти" },
  { slug: "registration", title: "Реєстрація бізнесу" },
  { slug: "logistics", title: "Логістика та митниця" },
  { slug: "hr", title: "HR та кадри" },
  { slug: "grants", title: "Гранти та підтримка" },
  { slug: "fintech", title: "Fintech та стартапи" },
] as const;

const CATALOG: SystemPage[] = [
  { path: "/dovidnyky/ustanovy", title: "Каталог установ", description: "Усі категорії установ і провайдерів послуг.", category: "Каталог", trafficWeight: 0.35, contentTarget: "page-section", staticCollection: "institutionProfiles", adminUrl: "/admin/institution-profiles" },
  ...CATALOG_CATEGORIES.map<SystemPage>((c) => ({
    path: `/dovidnyky/ustanovy/${c.slug}`,
    title: `Каталог — ${c.title}`,
    description: `Перелік установ у категорії «${c.title}».`,
    category: "Каталог",
    trafficWeight: 0.05,
    contentTarget: "page-section",
  })),
  // Розширення для держоргани/послуги (entries з gov_branches/gov_services у Supabase)
  { path: "/dovidnyky/ustanovy/gov/branches", title: "Відділення держорганів", description: "База відділень ДПС, ПФУ, ЦНАП тощо за регіонами.", category: "Каталог", trafficWeight: 0.08, contentTarget: "page-section", collectionTable: "gov_branches", adminUrl: "/admin/gov-branches" },
  { path: "/dovidnyky/ustanovy/gov/services", title: "Адмінпослуги держорганів", description: "Перелік адмінпослуг із документами, ціною та online-каналом.", category: "Каталог", trafficWeight: 0.1, contentTarget: "page-section", collectionTable: "gov_services", adminUrl: "/admin/gov-services" },
];

// ─── Довідники (під /dovidnyky) ────────────────────────────────────────────
const DOVIDNYKY: SystemPage[] = [
  { path: "/dovidnyky", title: "Довідники — хаб", description: "КВЕД, установи, словник, закони, гранти, штрафи, ліцензії, шаблони тощо.", category: "Довідник", trafficWeight: 0.55, contentTarget: "page-section" },
  { path: "/dovidnyky/slovnyk", title: "Фінансовий словник", description: "Терміни простою мовою.", category: "Довідник", trafficWeight: 0.2, contentTarget: "page-section", staticCollection: "knowledge", adminUrl: "/admin/knowledge" },
  { path: "/dovidnyky/kved", title: "Класифікатор КВЕД", description: "Повна база КВЕД-кодів і сумісність із групами ФОП.", category: "Довідник", trafficWeight: 0.3, contentTarget: "page-section", staticCollection: "kved", adminUrl: "/admin/kved" },
  { path: "/dovidnyky/zakony", title: "Закони і нормативка", description: "Актуальні редакції ключових законів.", category: "Довідник", trafficWeight: 0.18, contentTarget: "page-section", staticCollection: "laws", adminUrl: "/admin/laws" },
  { path: "/dovidnyky/granty", title: "Гранти і підтримка", description: "Доступні грантові програми.", category: "Довідник", trafficWeight: 0.15, contentTarget: "page-section", staticCollection: "grants", adminUrl: "/admin/grants" },
  { path: "/dovidnyky/penalties", title: "Штрафи", description: "Розміри штрафів за порушення.", category: "Довідник", trafficWeight: 0.18, contentTarget: "page-section", staticCollection: "penalties", adminUrl: "/admin/penalties" },
  { path: "/dovidnyky/litsenziyi", title: "Ліцензії та дозволи", description: "Перелік ліцензованих видів діяльності.", category: "Довідник", trafficWeight: 0.12, contentTarget: "page-section", staticCollection: "licenses", adminUrl: "/admin/licenses" },
  { path: "/dovidnyky/kalendar", title: "Податковий календар", description: "Дедлайни звітності та платежів.", category: "Довідник", trafficWeight: 0.25, contentTarget: "page-section", staticCollection: "deadlines", adminUrl: "/admin/tax-calendar" },
  { path: "/dovidnyky/accountants", title: "Довідник бухгалтерів", description: "Перевірені бухгалтери та бюро.", category: "Довідник", trafficWeight: 0.12, contentTarget: "page-section", staticCollection: "accountants", adminUrl: "/admin/accountants" },
  { path: "/dovidnyky/templates", title: "Шаблони документів", description: "Договори, заяви, накази.", category: "Довідник", trafficWeight: 0.2, contentTarget: "page-section", staticCollection: "templates", adminUrl: "/admin/templates" },
  { path: "/dovidnyky/reestry", title: "Реєстри", description: "Публічні реєстри та порядок доступу.", category: "Довідник", trafficWeight: 0.1, contentTarget: "page-section", staticCollection: "registers", adminUrl: "/admin/registers" },
  { path: "/dovidnyky/stavky", title: "Ставки і тарифи", description: "Податкові ставки і тарифи за періодами.", category: "Довідник", trafficWeight: 0.15, contentTarget: "page-section", staticCollection: "rates", adminUrl: "/admin/rates" },
  { path: "/dovidnyky/formy-biznesu", title: "Форми бізнесу", description: "ФОП, ТОВ, ПП — порівняння.", category: "Довідник", trafficWeight: 0.18, contentTarget: "page-section", staticCollection: "businessForms", adminUrl: "/admin/business-forms" },
  { path: "/faq", title: "Популярні питання", description: "База популярних питань і відповідей для бізнесу та фізосіб.", category: "Довідник", trafficWeight: 0.1, contentTarget: "article", staticCollection: "questions", adminUrl: "/admin/questions" },
];

export const SYSTEM_PAGES: SystemPage[] = [
  ...LANDINGS,
  ...DASHBOARDS,
  ...HUBS,
  ...ANALYTICS,
  ...PUBLICATIONS,
  ...LEARN,
  ...TOOLS,
  ...CATALOG,
  ...DOVIDNYKY,
];

export function findSystemPage(path: string): SystemPage | undefined {
  const normalized = path.replace(/\/+$/, "") || "/";
  return SYSTEM_PAGES.find((p) => p.path === normalized);
}
