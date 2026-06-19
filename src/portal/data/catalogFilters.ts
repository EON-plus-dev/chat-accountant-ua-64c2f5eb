import type { FullInstitutionProfile } from "./institutionProfiles";

export interface CategoryFilterDef {
  key: string;
  label: string;
  audienceScope?: "business";
  test: (p: FullInstitutionProfile) => boolean;
}

export interface CategoryFilterGroup {
  label: string;
  defs: CategoryFilterDef[];
}

export interface CategoryFilterConfig {
  showCity: boolean;
  groups: CategoryFilterGroup[];
}

// ═══════════════════════════════════════════════
// Банки
// ═══════════════════════════════════════════════
const BANK_FILTERS: CategoryFilterConfig = {
  showCity: true,
  groups: [
    {
      label: "Базові",
      defs: [
        { key: "neobank", label: "Без відділень (необанк)", test: (p) => p.branches.totalCount === 0 },
        { key: "free", label: "Безкоштовне обслуговування", test: (p) => p.products.some((pr) => pr.price?.isFree) },
        { key: "support247", label: "Підтримка 24/7", test: (p) => p.contacts.support.is247 },
        { key: "api", label: "Є API", test: (p) => p.platforms.api.available },
        { key: "mobile-pay", label: "Apple / Google Pay", test: (p) => p.products.some((pr) => pr.features?.some((f) => f.name.includes("Apple Pay") || f.name.includes("Google Pay"))) },
      ],
    },
    {
      label: "Для бізнесу",
      defs: [
        { key: "salary", label: "Зарплатний проект", audienceScope: "business", test: (p) => p.products.some((pr) => pr.features?.some((f) => f.name.includes("Зарплатний"))) },
        { key: "acquiring", label: "Еквайринг", audienceScope: "business", test: (p) => p.products.some((pr) => pr.category === "Еквайринг") || p.integrations.some((i) => i.category === "Еквайринг") },
        { key: "credit", label: "Овердрафт / кредитування", audienceScope: "business", test: (p) => p.products.some((pr) => pr.category === "Кредитування") },
        { key: "currency", label: "Валютні операції (ЗЕД)", audienceScope: "business", test: (p) => p.products.some((pr) => pr.features?.some((f) => f.name.includes("Валютн") || f.name.includes("ЗЕД"))) },
        { key: "1c", label: "Інтеграція з 1С / BAS", audienceScope: "business", test: (p) => p.integrations.some((i) => i.name.includes("1С") || i.name.includes("1C") || i.name.includes("BAS")) },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Страхові компанії
// ═══════════════════════════════════════════════
const INSURANCE_FILTERS: CategoryFilterConfig = {
  showCity: true,
  groups: [
    {
      label: "Тип страхування",
      defs: [
        { key: "osago", label: "ОСЦПВ (автоцивілка)", test: (p) => p.products.some((pr) => pr.name.includes("ОСЦПВ") || pr.name.toLowerCase().includes("автоцивілка") || pr.category === "ОСЦПВ") },
        { key: "kasko", label: "КАСКО", test: (p) => p.products.some((pr) => pr.category === "КАСКО" || pr.name.includes("КАСКО")) },
        { key: "dms", label: "ДМС (медичне)", test: (p) => p.products.some((pr) => pr.name.includes("ДМС") || pr.category.toLowerCase().includes("медичн") || pr.category === "ДМС") },
        { key: "property", label: "Майнове", test: (p) => p.products.some((pr) => pr.category.toLowerCase().includes("майн") || pr.name.toLowerCase().includes("майн")) },
        { key: "life", label: "Страхування життя", test: (p) => p.products.some((pr) => pr.category.toLowerCase().includes("життя") || pr.name.toLowerCase().includes("життя")) },
        { key: "travel", label: "Подорожі / Шенген", test: (p) => p.products.some((pr) => pr.name.toLowerCase().includes("подорож") || pr.name.includes("Шенген") || pr.category === "Подорожі") },
        { key: "green-card", label: "Зелена карта", test: (p) => p.products.some((pr) => pr.name.toLowerCase().includes("зелена карта") || pr.category === "Зелена карта") },
      ],
    },
    {
      label: "Сервіс",
      defs: [
        { key: "online-issue", label: "Онлайн-оформлення", test: (p) => p.platforms.web.available },
        { key: "ins-24-7", label: "Підтримка 24/7", test: (p) => p.contacts.support.is247 },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Юридичні послуги
// ═══════════════════════════════════════════════
const LEGAL_FILTERS: CategoryFilterConfig = {
  showCity: true,
  groups: [
    {
      label: "Спеціалізація",
      defs: [
        { key: "real-estate", label: "Нерухомість", test: (p) => p.products.some((pr) => pr.name.includes("нерухом") || pr.category.includes("нерухом")) },
        { key: "family", label: "Сімейне право", test: (p) => p.products.some((pr) => pr.name.includes("сімейн") || pr.category.includes("сімейн")) },
        { key: "business-law", label: "Бізнес і корпоративне", audienceScope: "business", test: (p) => p.products.some((pr) => pr.category.includes("корпоративн") || pr.name.includes("бізнес")) },
      ],
    },
    {
      label: "Формат",
      defs: [
        { key: "online-consult", label: "Онлайн-консультація", test: (p) => p.platforms.web.available },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Держоргани
// ═══════════════════════════════════════════════
const GOV_FILTERS: CategoryFilterConfig = {
  showCity: true,
  groups: [
    {
      label: "Сервіс",
      defs: [
        { key: "online-services", label: "Онлайн-послуги", test: (p) => p.platforms.web.available },
        { key: "diia", label: "Доступно через Дію", test: (p) => p.integrations.some((i) => i.name.includes("Дія")) },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Платежі та еквайринг
// ═══════════════════════════════════════════════
const PAYMENTS_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Тип послуги",
      defs: [
        { key: "pos-terminal", label: "POS-термінали", test: (p) => p.products.some((pr) => pr.name.includes("POS") || pr.name.includes("термінал")) },
        { key: "online-payments", label: "Онлайн-еквайринг", test: (p) => p.products.some((pr) => pr.category.includes("Еквайринг") || pr.name.includes("Checkout")) },
        { key: "qr-pay", label: "QR-оплата", test: (p) => p.products.some((pr) => pr.name.includes("QR")) },
        { key: "international", label: "Міжнародні перекази", test: (p) => p.products.some((pr) => pr.name.includes("міжнарод") || pr.name.includes("SWIFT") || pr.name.includes("Personal")) },
      ],
    },
    {
      label: "Особливості",
      defs: [
        { key: "api-payments", label: "Є API", test: (p) => p.platforms.api.available },
        { key: "free-payments", label: "Безкоштовне обслуговування", test: (p) => p.products.some((pr) => pr.price?.isFree) },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Інвестиції та брокери
// ═══════════════════════════════════════════════
const INVEST_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Інструменти",
      defs: [
        { key: "ovdp", label: "ОВДП", test: (p) => p.products.some((pr) => pr.category.includes("ОВДП") || pr.name.includes("ОВДП")) },
        { key: "stocks", label: "Акції та ETF", test: (p) => p.products.some((pr) => pr.category.includes("ETF") || pr.category.includes("Акції")) },
        { key: "bonds", label: "Облігації", test: (p) => p.products.some((pr) => pr.category.includes("облігац") || pr.name.includes("облігац")) },
      ],
    },
    {
      label: "Доступність",
      defs: [
        { key: "low-min", label: "Від 1 000 ₴", test: (p) => p.products.some((pr) => pr.requirements?.some((r) => r.includes("1 000"))) },
        { key: "online-invest", label: "Онлайн-платформа", test: (p) => p.platforms.web.available },
        { key: "mobile-invest", label: "Мобільний додаток", test: (p) => p.platforms.ios?.available || p.platforms.android?.available },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Кредитування
// ═══════════════════════════════════════════════
const CREDIT_FILTERS: CategoryFilterConfig = {
  showCity: true,
  groups: [
    {
      label: "Тип",
      defs: [
        { key: "microloan", label: "Мікрокредит (МФО)", test: (p) => p.products.some((pr) => pr.category === "Мікрокредит" || pr.category.toLowerCase().includes("мікрокредит")) },
        { key: "consumer", label: "Споживчий / Банківський", test: (p) => p.products.some((pr) => pr.category.toLowerCase().includes("споживч") || pr.category === "Банківський кредит") },
        { key: "mortgage-filter", label: "Іпотека / єОселя", test: (p) => p.products.some((pr) => pr.name.toLowerCase().includes("іпотек") || pr.name.includes("єОселя") || pr.category.toLowerCase().includes("іпотек")) },
        { key: "leasing-filter", label: "Лізинг", test: (p) => p.products.some((pr) => pr.category.includes("Лізинг") || pr.name.toLowerCase().includes("лізинг")) },
        { key: "credit-history", label: "Кредитна історія", test: (p) => p.types.includes("credit_bureau") },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Бухгалтерія та звітність
// ═══════════════════════════════════════════════
const ACCOUNTING_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Тип сервісу",
      defs: [
        { key: "software", label: "Бухгалтерське ПЗ", test: (p) => p.types.includes("accounting_software") || p.types.includes("tax_automation") },
        { key: "edo-reporting", label: "ЕДО / Звітність", test: (p) => p.types.includes("edo") || p.types.includes("reporting") },
      ],
    },
    {
      label: "Особливості",
      defs: [
        { key: "free-trial-acc", label: "Безкоштовний тріал", test: (p) => p.products.some((pr) => pr.price?.hasFreeTrial) },
        { key: "1c-integration", label: "Інтеграція з 1С / BAS", test: (p) => p.integrations.some((i) => i.name.includes("1С") || i.name.includes("BAS")) },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Цифрові інструменти
// ═══════════════════════════════════════════════
const DIGITAL_TOOLS_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Тип",
      defs: [
        { key: "kep", label: "КЕП / Електронний підпис", test: (p) => p.types.includes("digital_signature") },
        { key: "prro", label: "ПРРО (каса)", test: (p) => p.types.includes("cashier_software") || p.types.includes("prro") },
        { key: "edo-tool", label: "ЕДО", test: (p) => p.types.includes("edo") },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Логістика
// ═══════════════════════════════════════════════
const LOGISTICS_FILTERS: CategoryFilterConfig = {
  showCity: true,
  groups: [
    {
      label: "Особливості",
      defs: [
        { key: "api-logistics", label: "Є API", test: (p) => p.platforms.api.available },
        { key: "international-delivery", label: "Міжнародна доставка", test: (p) => p.products.some((pr) => pr.name.includes("міжнарод") || pr.name.includes("Global")) },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Фінтех
// ═══════════════════════════════════════════════
const FINTECH_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Тип",
      defs: [
        { key: "fintech-tool", label: "Фінтех-інструмент", test: (p) => p.types.includes("payment_system") || p.types.includes("money_transfer") },
        { key: "hub", label: "Хаб / Коворкінг", test: (p) => p.types.includes("startup_hub") || p.types.includes("coworking") },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// HR — Кадри та зарплата
// ═══════════════════════════════════════════════
const HR_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Тип",
      defs: [
        { key: "hris", label: "HRIS / Кадровий облік", test: (p) => p.products.some((pr) => pr.name.toLowerCase().includes("hris") || pr.name.toLowerCase().includes("кадров") || pr.category.toLowerCase().includes("кадр")) },
        { key: "payroll-tool", label: "Payroll / Зарплата", test: (p) => p.products.some((pr) => pr.name.toLowerCase().includes("payroll") || pr.name.toLowerCase().includes("зарплат") || pr.category.toLowerCase().includes("зарплат")) },
        { key: "recruiting", label: "Рекрутинг", test: (p) => p.products.some((pr) => pr.name.toLowerCase().includes("рекрутинг") || pr.category.toLowerCase().includes("рекрутинг")) },
      ],
    },
    {
      label: "Особливості",
      defs: [
        { key: "api-hr", label: "Є API", test: (p) => p.platforms.api.available },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Гранти та держпрограми
// ═══════════════════════════════════════════════
const GRANTS_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Тип програми",
      defs: [
        { key: "gov-program", label: "Держпрограма", test: (p) => p.products.some((pr) => pr.category.includes("Держпрограм") || pr.name.includes("5-7-9") || pr.name.includes("єРобота")) },
        { key: "international-grant", label: "Міжнародний грант", test: (p) => p.products.some((pr) => pr.name.includes("USAID") || pr.name.includes("ЄБРР") || pr.category.includes("Грант")) },
        { key: "startup-fund", label: "Стартап-фонд", test: (p) => p.products.some((pr) => pr.name.includes("Startup") || pr.name.includes("стартап") || pr.category.includes("Стартап")) },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Реєстрація бізнесу
// ═══════════════════════════════════════════════
const REGISTRATION_FILTERS: CategoryFilterConfig = {
  showCity: false,
  groups: [
    {
      label: "Тип послуги",
      defs: [
        { key: "registry", label: "Реєстри / Витяги", test: (p) => p.products.some((pr) => pr.name.includes("реєстр") || pr.name.includes("витяг") || pr.category.includes("Реєстр")) },
        { key: "monitoring", label: "Моніторинг змін", test: (p) => p.products.some((pr) => pr.name.includes("моніторинг") || pr.category.includes("Моніторинг")) },
      ],
    },
    {
      label: "Особливості",
      defs: [
        { key: "api-reg", label: "Є API", test: (p) => p.platforms.api.available },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════
// Реєстр
// ═══════════════════════════════════════════════
export const CATEGORY_FILTERS: Record<string, CategoryFilterConfig> = {
  banks: BANK_FILTERS,
  insurance: INSURANCE_FILTERS,
  legal: LEGAL_FILTERS,
  gov: GOV_FILTERS,
  payments: PAYMENTS_FILTERS,
  invest: INVEST_FILTERS,
  credit: CREDIT_FILTERS,
  accounting: ACCOUNTING_FILTERS,
  digital_tools: DIGITAL_TOOLS_FILTERS,
  logistics: LOGISTICS_FILTERS,
  fintech: FINTECH_FILTERS,
  hr: HR_FILTERS,
  grants: GRANTS_FILTERS,
  registration: REGISTRATION_FILTERS,
};

/** Get all feature defs flat for a category */
export const getAllFilterDefs = (categorySlug: string): CategoryFilterDef[] => {
  const config = CATEGORY_FILTERS[categorySlug];
  if (!config) return [];
  return config.groups.flatMap((g) => g.defs);
};
