// Ставки на IT/маркетингові послуги в Україні
// Джерела: DOU.ua salary survey (літо 2025), AIN, Upwork UA, прайси топ-10 агентств
// Курс ₴/$: 42.0
export const IT_RATES_AS_OF = "2026-01-15";
export const IT_RATES_FX = 42.0;

export type RateUnit = "hour" | "month" | "project";
export type Seniority = "junior" | "middle" | "senior" | "lead";

export const SENIORITY_LABEL: Record<Seniority, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead / Architect",
};

export type RoleCategory =
  | "development"
  | "design"
  | "marketing"
  | "content"
  | "management"
  | "qa_devops"
  | "data_ai";

export const ROLE_CATEGORY_LABEL: Record<RoleCategory, string> = {
  development: "Розробка",
  design: "Дизайн",
  marketing: "Маркетинг / Реклама",
  content: "Контент / SEO",
  management: "Менеджмент",
  qa_devops: "QA / DevOps",
  data_ai: "Data / AI",
};

export interface RoleRate {
  id: string;
  role: string;
  category: RoleCategory;
  seniority: Seniority;
  freelanceHourUsd: { min: number; avg: number; max: number };
  agencyHourUsd:    { min: number; avg: number; max: number };
  monthlySalaryUsd?: { min: number; avg: number; max: number }; // для in-house
  note?: string;
}

const r = (min: number, avg: number, max: number) => ({ min, avg, max });

export const IT_ROLE_RATES: RoleRate[] = [
  // ─── Розробка ───
  { id: "frontend-junior",  role: "Frontend Developer", category: "development", seniority: "junior",
    freelanceHourUsd: r(10, 15, 22), agencyHourUsd: r(20, 28, 38), monthlySalaryUsd: r(700, 1100, 1500) },
  { id: "frontend-middle",  role: "Frontend Developer", category: "development", seniority: "middle",
    freelanceHourUsd: r(22, 32, 45), agencyHourUsd: r(38, 50, 65), monthlySalaryUsd: r(1800, 2800, 3800) },
  { id: "frontend-senior",  role: "Frontend Developer", category: "development", seniority: "senior",
    freelanceHourUsd: r(40, 55, 75), agencyHourUsd: r(60, 75, 95), monthlySalaryUsd: r(3500, 4800, 6200) },
  { id: "backend-middle",   role: "Backend Developer (Node/Python/Go)", category: "development", seniority: "middle",
    freelanceHourUsd: r(25, 35, 48), agencyHourUsd: r(40, 55, 70), monthlySalaryUsd: r(2000, 3200, 4200) },
  { id: "backend-senior",   role: "Backend Developer", category: "development", seniority: "senior",
    freelanceHourUsd: r(45, 60, 85), agencyHourUsd: r(65, 80, 110), monthlySalaryUsd: r(3800, 5500, 7000) },
  { id: "fullstack-senior", role: "Full-stack Developer", category: "development", seniority: "senior",
    freelanceHourUsd: r(50, 65, 90), agencyHourUsd: r(70, 90, 120), monthlySalaryUsd: r(4000, 5800, 7500) },
  { id: "mobile-ios",       role: "iOS Developer (Swift)", category: "development", seniority: "senior",
    freelanceHourUsd: r(45, 60, 85), agencyHourUsd: r(60, 80, 110), monthlySalaryUsd: r(3800, 5400, 7000) },
  { id: "mobile-android",   role: "Android Developer (Kotlin)", category: "development", seniority: "senior",
    freelanceHourUsd: r(45, 60, 85), agencyHourUsd: r(60, 80, 110), monthlySalaryUsd: r(3800, 5400, 7000) },
  { id: "1c-bitrix",        role: "1С/BAS розробник", category: "development", seniority: "middle",
    freelanceHourUsd: r(15, 22, 30), agencyHourUsd: r(25, 35, 45), monthlySalaryUsd: r(1200, 1800, 2500),
    note: "Локальний попит, мало конкуренції з Заходом" },
  { id: "wp-dev",           role: "WordPress / WooCommerce розробник", category: "development", seniority: "middle",
    freelanceHourUsd: r(15, 22, 32), agencyHourUsd: r(25, 35, 50), monthlySalaryUsd: r(1100, 1700, 2300) },
  { id: "tech-lead",        role: "Tech Lead / Architect", category: "development", seniority: "lead",
    freelanceHourUsd: r(70, 95, 130), agencyHourUsd: r(90, 120, 160), monthlySalaryUsd: r(5500, 7500, 10000) },

  // ─── Дизайн ───
  { id: "ui-ux-middle", role: "UI/UX Designer", category: "design", seniority: "middle",
    freelanceHourUsd: r(20, 30, 42), agencyHourUsd: r(35, 50, 65), monthlySalaryUsd: r(1500, 2300, 3000) },
  { id: "ui-ux-senior", role: "UI/UX Designer", category: "design", seniority: "senior",
    freelanceHourUsd: r(40, 55, 75), agencyHourUsd: r(60, 80, 100), monthlySalaryUsd: r(3000, 4200, 5500) },
  { id: "product-designer", role: "Product Designer", category: "design", seniority: "senior",
    freelanceHourUsd: r(50, 65, 85), agencyHourUsd: r(70, 90, 115), monthlySalaryUsd: r(3500, 4800, 6500) },
  { id: "graphic-designer", role: "Графічний дизайнер (брендінг)", category: "design", seniority: "middle",
    freelanceHourUsd: r(15, 22, 32), agencyHourUsd: r(28, 40, 55), monthlySalaryUsd: r(900, 1500, 2200) },
  { id: "motion-designer",  role: "Motion Designer", category: "design", seniority: "senior",
    freelanceHourUsd: r(30, 45, 65), agencyHourUsd: r(50, 70, 95), monthlySalaryUsd: r(2200, 3200, 4500) },
  { id: "illustrator",      role: "Ілюстратор / Concept Artist", category: "design", seniority: "senior",
    freelanceHourUsd: r(25, 38, 55), agencyHourUsd: r(40, 60, 85), monthlySalaryUsd: r(1800, 2700, 3800) },

  // ─── Маркетинг ───
  { id: "ppc-middle", role: "PPC-спеціаліст (Google/Meta Ads)", category: "marketing", seniority: "middle",
    freelanceHourUsd: r(15, 22, 32), agencyHourUsd: r(28, 40, 55), monthlySalaryUsd: r(1100, 1700, 2400),
    note: "Часто оплата 10–15% від рекламного бюджету (мін. $400/міс)" },
  { id: "ppc-senior", role: "PPC-стратег", category: "marketing", seniority: "senior",
    freelanceHourUsd: r(30, 45, 65), agencyHourUsd: r(50, 70, 95), monthlySalaryUsd: r(2200, 3200, 4500) },
  { id: "smm-middle", role: "SMM-менеджер", category: "marketing", seniority: "middle",
    freelanceHourUsd: r(12, 18, 28), agencyHourUsd: r(22, 32, 48), monthlySalaryUsd: r(700, 1200, 1800) },
  { id: "cmo",        role: "CMO / Head of Marketing", category: "marketing", seniority: "lead",
    freelanceHourUsd: r(60, 85, 120), agencyHourUsd: r(80, 110, 150), monthlySalaryUsd: r(4500, 6500, 9000) },
  { id: "emailmkt",   role: "Email-маркетолог", category: "marketing", seniority: "middle",
    freelanceHourUsd: r(15, 22, 32), agencyHourUsd: r(28, 40, 55), monthlySalaryUsd: r(1200, 1800, 2500) },
  { id: "influencer-mgr", role: "Influence-маркетолог", category: "marketing", seniority: "middle",
    freelanceHourUsd: r(18, 28, 40), agencyHourUsd: r(32, 45, 60), monthlySalaryUsd: r(1300, 2000, 2800) },

  // ─── Контент / SEO ───
  { id: "copywriter", role: "Копірайтер (UA/RU)", category: "content", seniority: "middle",
    freelanceHourUsd: r(8, 14, 22), agencyHourUsd: r(15, 25, 38), monthlySalaryUsd: r(500, 900, 1500),
    note: "Або поштучно: $25–80 за лонгрід 5 000 знаків" },
  { id: "copywriter-en", role: "Копірайтер EN (native-level)", category: "content", seniority: "senior",
    freelanceHourUsd: r(30, 45, 65), agencyHourUsd: r(45, 65, 90), monthlySalaryUsd: r(2200, 3200, 4500) },
  { id: "seo-middle", role: "SEO-спеціаліст", category: "content", seniority: "middle",
    freelanceHourUsd: r(15, 22, 32), agencyHourUsd: r(28, 40, 55), monthlySalaryUsd: r(1000, 1600, 2300) },
  { id: "seo-senior", role: "SEO-стратег / Linkbuilder", category: "content", seniority: "senior",
    freelanceHourUsd: r(30, 45, 65), agencyHourUsd: r(50, 70, 95), monthlySalaryUsd: r(2200, 3200, 4500) },
  { id: "translator", role: "Перекладач EN ↔ UA (тех. тексти)", category: "content", seniority: "middle",
    freelanceHourUsd: r(12, 18, 28), agencyHourUsd: r(22, 32, 45),
    note: "Або $40–80 за 1800 знаків (1 умовна сторінка)" },

  // ─── Менеджмент ───
  { id: "pm-middle", role: "Project Manager", category: "management", seniority: "middle",
    freelanceHourUsd: r(20, 30, 42), agencyHourUsd: r(35, 50, 65), monthlySalaryUsd: r(1500, 2300, 3200) },
  { id: "pm-senior", role: "Senior PM / Delivery Manager", category: "management", seniority: "senior",
    freelanceHourUsd: r(40, 55, 75), agencyHourUsd: r(60, 80, 100), monthlySalaryUsd: r(3000, 4200, 5500) },
  { id: "product-mgr", role: "Product Manager", category: "management", seniority: "senior",
    freelanceHourUsd: r(45, 60, 85), agencyHourUsd: r(65, 85, 110), monthlySalaryUsd: r(3500, 5000, 6800) },
  { id: "ba-middle", role: "Business Analyst", category: "management", seniority: "middle",
    freelanceHourUsd: r(22, 32, 45), agencyHourUsd: r(38, 52, 70), monthlySalaryUsd: r(1700, 2500, 3500) },
  { id: "scrum-master", role: "Scrum Master / Agile Coach", category: "management", seniority: "senior",
    freelanceHourUsd: r(40, 55, 75), agencyHourUsd: r(60, 80, 100), monthlySalaryUsd: r(3000, 4200, 5500) },

  // ─── QA / DevOps ───
  { id: "qa-manual", role: "QA Manual", category: "qa_devops", seniority: "middle",
    freelanceHourUsd: r(12, 18, 28), agencyHourUsd: r(22, 32, 45), monthlySalaryUsd: r(900, 1500, 2200) },
  { id: "qa-auto",   role: "QA Automation", category: "qa_devops", seniority: "senior",
    freelanceHourUsd: r(28, 42, 58), agencyHourUsd: r(45, 60, 80), monthlySalaryUsd: r(2400, 3500, 4800) },
  { id: "devops-middle", role: "DevOps Engineer", category: "qa_devops", seniority: "middle",
    freelanceHourUsd: r(28, 42, 58), agencyHourUsd: r(45, 60, 80), monthlySalaryUsd: r(2200, 3300, 4500) },
  { id: "devops-senior", role: "Senior DevOps / SRE", category: "qa_devops", seniority: "senior",
    freelanceHourUsd: r(50, 70, 95), agencyHourUsd: r(70, 95, 130), monthlySalaryUsd: r(4000, 5800, 7500) },
  { id: "security-eng",  role: "Security Engineer", category: "qa_devops", seniority: "senior",
    freelanceHourUsd: r(55, 75, 105), agencyHourUsd: r(80, 110, 145), monthlySalaryUsd: r(4500, 6200, 8500) },

  // ─── Data / AI ───
  { id: "data-analyst",   role: "Data Analyst", category: "data_ai", seniority: "middle",
    freelanceHourUsd: r(20, 30, 45), agencyHourUsd: r(38, 52, 70), monthlySalaryUsd: r(1500, 2400, 3300) },
  { id: "data-engineer",  role: "Data Engineer", category: "data_ai", seniority: "senior",
    freelanceHourUsd: r(45, 60, 85), agencyHourUsd: r(65, 85, 115), monthlySalaryUsd: r(3500, 5000, 6800) },
  { id: "ml-engineer",    role: "ML Engineer", category: "data_ai", seniority: "senior",
    freelanceHourUsd: r(55, 75, 105), agencyHourUsd: r(80, 110, 145), monthlySalaryUsd: r(4200, 6000, 8200) },
  { id: "ai-prompt-eng",  role: "AI / Prompt Engineer", category: "data_ai", seniority: "middle",
    freelanceHourUsd: r(25, 40, 60), agencyHourUsd: r(45, 65, 90), monthlySalaryUsd: r(2000, 3000, 4200),
    note: "Новий ринок, ставки 2025+ ростуть найшвидше" },
];

// Типові пакетні ціни (проектні) — для замовників, які думають «скільки коштує сайт»
export interface ProjectPackage {
  id: string;
  name: string;
  scope: string;
  priceUsd: { min: number; max: number };
  timeline: string;
  whoFor: string;
}

export const PROJECT_PACKAGES: ProjectPackage[] = [
  { id: "landing", name: "Landing page", scope: "1 сторінка, форма, базова анімація, адаптив",
    priceUsd: { min: 500, max: 2500 }, timeline: "1–3 тижні", whoFor: "Запуск послуги, лідген" },
  { id: "corp-site", name: "Корпоративний сайт", scope: "8–12 сторінок, CMS, блог, мультимова",
    priceUsd: { min: 2500, max: 8000 }, timeline: "1–2 міс.", whoFor: "Малий-середній бізнес" },
  { id: "shop-mvp", name: "Інтернет-магазин (MVP)", scope: "Каталог, кошик, оплата (LiqPay/Fondy), CRM-інтеграція",
    priceUsd: { min: 4000, max: 15000 }, timeline: "2–4 міс.", whoFor: "Стартова e-com точка" },
  { id: "shop-enterprise", name: "E-commerce enterprise", scope: "1С/BAS-інтеграція, MDS, кастомні модулі",
    priceUsd: { min: 25000, max: 120000 }, timeline: "6–12 міс.", whoFor: "Мережа, бренд із 1000+ SKU" },
  { id: "mobile-app", name: "Мобільний застосунок (iOS + Android)", scope: "MVP до 15 екранів, бекенд, push",
    priceUsd: { min: 18000, max: 80000 }, timeline: "4–8 міс.", whoFor: "Стартапи, сервіси" },
  { id: "saas-mvp", name: "SaaS MVP", scope: "Auth, біллінг, базовий функціонал, адмінка",
    priceUsd: { min: 30000, max: 150000 }, timeline: "5–10 міс.", whoFor: "Tech-стартапи (pre-seed → seed)" },
  { id: "brand-id", name: "Брендінг (логотип + айдентика)", scope: "Лого, гайдлайн, шаблони соцмереж",
    priceUsd: { min: 800, max: 6000 }, timeline: "2–6 тижнів", whoFor: "Старт бренду, ребрендінг" },
  { id: "seo-setup", name: "SEO-старт", scope: "Аудит, кластеризація, тех. правки, контент-план 3 міс.",
    priceUsd: { min: 1200, max: 5000 }, timeline: "3 міс. (старт результату 6+ міс.)", whoFor: "Контент-залежний бізнес" },
  { id: "ppc-retainer", name: "PPC-ведення (місяць)", scope: "Google + Meta, до 5 кампаній, оптимізація щотижня",
    priceUsd: { min: 400, max: 2500 }, timeline: "Помісячно", whoFor: "Активна реклама $1000+/міс на трафік" },
];

// Структура ціноутворення (для frontend-калькулятора)
export const PRICING_MODELS = [
  { model: "Time & Materials (T&M)", typical: "$25–110/год", whenToUse: "Невизначений скоп, дискавері, MVP" },
  { model: "Fixed Price (Fixed bid)", typical: "Загальна сума за ТЗ", whenToUse: "Чіткий скоп, лендинг, шаблонний сайт" },
  { model: "Retainer (місячний пакет)", typical: "$1500–25000/міс", whenToUse: "Постійний саппорт, SEO, маркетинг" },
  { model: "Dedicated team", typical: "$8000–35000/міс на людину", whenToUse: "Тривалі продукти, outstaffing-моделі" },
  { model: "Revenue share / Equity", typical: "5–25% від виторгу або equity", whenToUse: "Стартапи без бюджету, партнерство" },
];
