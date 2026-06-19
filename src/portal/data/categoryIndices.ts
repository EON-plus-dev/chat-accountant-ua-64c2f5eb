import type { IndexSeverity, UniqueIndex } from "@/portal/data/dailyDigest";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

export interface CategoryIndex extends UniqueIndex {
  comparison?: string;
  contextLabel?: string;
}

const BANK_INDICES: CategoryIndex[] = [
  {
    id: "bank-deposit-avg",
    icon: "💰",
    label: "Депозити (ринок)",
    value: "15.2%",
    detail: "Середня ставка 12-міс. депозитів у ТОП-20 банків",
    severity: "neutral",
    href: "/analytics",
    comparison: "ринковий медіан",
    contextLabel: "сер. ТОП-20",
  },
  {
    id: "bank-credit-avg",
    icon: "💳",
    label: "Кредити (ринок)",
    value: "22.8%",
    detail: "Середня ставка споживчих кредитів для бізнесу",
    severity: "warning",
    href: "/analytics",
    comparison: "ринковий медіан",
    contextLabel: "⚠ вище норми",
  },
  {
    id: "bank-fx-spread",
    icon: "💱",
    label: "Спред USD",
    value: "+0.8%",
    detail: "Різниця курсу купівлі/продажу банку відносно курсу НБУ",
    severity: "positive",
    href: "/tools/exchange",
    contextLabel: "↓ дешевше ринку",
  },
  {
    id: "bank-network",
    icon: "🏧",
    label: "Мережа ТОП-5",
    value: "12 400+",
    detail: "Банкоматів у п'ятірці найбільших мереж",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/banks",
    contextLabel: "#1 в Україні",
  },
];

const INSURANCE_INDICES: CategoryIndex[] = [
  {
    id: "ins-loss-ratio",
    icon: "📊",
    label: "Рівень виплат",
    value: "42%",
    detail: "Середній loss ratio по ринку страхування",
    severity: "warning",
    href: "/analytics",
    contextLabel: "↓ нижче норми",
  },
  {
    id: "ins-osago",
    icon: "🚗",
    label: "ОСЦПВ премія",
    value: "1 200 ₴",
    detail: "Середня вартість автоцивілки",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/insurance",
    contextLabel: "сер. по ринку",
  },
  {
    id: "ins-reviews",
    icon: "💬",
    label: "Відгуки",
    value: "4.2 / 5",
    detail: "Середній рейтинг клієнтських відгуків по ринку страхування",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/insurance",
    contextLabel: "сер. по ринку",
  },
  {
    id: "ins-payout-speed",
    icon: "⏱",
    label: "Швидкість виплат",
    value: "14 днів",
    detail: "Середній час від подачі заяви до виплати страхового відшкодування",
    severity: "neutral",
    href: "/analytics",
    contextLabel: "сер. по ринку",
  },
];

const CREDIT_INDICES: CategoryIndex[] = [
  {
    id: "credit-apr",
    icon: "📈",
    label: "Ефективна ставка",
    value: "~365%",
    detail: "Середній APR мікрокредитів (0.01%/день)",
    severity: "negative",
    href: "/analytics",
    contextLabel: "⚠ дуже високий",
  },
  {
    id: "credit-avg-amount",
    icon: "💵",
    label: "Середня сума",
    value: "5 000 ₴",
    detail: "Медіана суми мікрокредиту по ринку",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/credit",
    contextLabel: "медіана ринку",
  },
  {
    id: "credit-first-free",
    icon: "🔄",
    label: "Перший кредит 0%",
    value: "у 65% МФО",
    detail: "Частка МФО, що пропонують перший кредит під 0%",
    severity: "positive",
    href: "/dovidnyky/ustanovy/credit",
    contextLabel: "✓ є пропозиція",
  },
  {
    id: "credit-speed",
    icon: "⏱",
    label: "Видача",
    value: "15 хв",
    detail: "Середній час від заявки до зарахування коштів",
    severity: "positive",
    href: "/dovidnyky/ustanovy/credit",
    contextLabel: "сер. по ринку",
  },
];

const INVEST_INDICES: CategoryIndex[] = [
  {
    id: "invest-ovdp",
    icon: "🏛",
    label: "ОВДП net",
    value: "14.2%",
    detail: "Чиста дохідність після ПДФО+ВЗ",
    severity: "positive",
    href: "/analytics",
    contextLabel: "↑ вигідно",
  },
  {
    id: "invest-vs-deposit",
    icon: "⚖",
    label: "Депозит vs ОВДП",
    value: "15% / 14.2%",
    detail: "Порівняння чистих ставок",
    severity: "neutral",
    href: "/analytics",
    contextLabel: "≈ паритет",
  },
  {
    id: "invest-min-entry",
    icon: "💰",
    label: "Мін. вхід",
    value: "1 000 ₴",
    detail: "Мінімальна сума для початку інвестування по ринку",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/invest",
    contextLabel: "сер. по ринку",
  },
  {
    id: "invest-top5-yield",
    icon: "📈",
    label: "Дохідність ТОП-5",
    value: "12.8%",
    detail: "Середня річна дохідність портфелів топ-5 брокерів",
    severity: "positive",
    href: "/analytics",
    contextLabel: "сер. портфель",
  },
];

const GOV_INDICES: CategoryIndex[] = [
  {
    id: "gov-processing",
    icon: "⏱",
    label: "Час обробки",
    value: "5 днів",
    detail: "Середній час обробки звернень",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/gov",
    contextLabel: "сер. по держоргану",
  },
  {
    id: "gov-online",
    icon: "📱",
    label: "Онлайн послуги",
    value: "78%",
    detail: "Частка послуг держоргану, доступних онлайн",
    severity: "positive",
    href: "/dovidnyky/ustanovy/gov",
    contextLabel: "частка від усіх",
  },
  {
    id: "gov-satisfaction",
    icon: "⭐",
    label: "Задоволеність",
    value: "3.8 / 5",
    detail: "Середня оцінка якості обслуговування за відгуками громадян",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/gov",
    contextLabel: "сер. по ринку",
  },
];

const HR_INDICES: CategoryIndex[] = [
  {
    id: "hr-min-wage",
    icon: "💰",
    label: "МЗП 2026",
    value: "8 647 ₴",
    detail: "Мінімальна заробітна плата",
    severity: "neutral",
    href: "/analytics",
    contextLabel: "з 01.01.2026",
  },
  {
    id: "hr-esv",
    icon: "📋",
    label: "ЄСВ мін.",
    value: "1 902 ₴",
    detail: "Мінімальний внесок ЄСВ / місяць",
    severity: "neutral",
    href: "/analytics",
    contextLabel: "мін. внесок",
  },
  {
    id: "hr-fine",
    icon: "⚠",
    label: "Штраф за неоформлення",
    value: "86 470 ₴",
    detail: "10 МЗП за неоформленого працівника",
    severity: "negative",
    href: "/law",
    contextLabel: "⚠ 10× МЗП",
  },
];

const ACCOUNTING_INDICES: CategoryIndex[] = [
  {
    id: "acc-prro",
    icon: "📱",
    label: "ПРРО замість РРО",
    value: "85%",
    detail: "ФОП, що перейшли на програмний РРО",
    severity: "positive",
    href: "/dovidnyky/ustanovy/accounting",
    progress: 85,
    contextLabel: "✓ тренд ринку",
  },
  {
    id: "acc-deadlines",
    icon: "📅",
    label: "Дедлайни",
    value: "3",
    detail: "Найближчі звітні дедлайни цього місяця",
    severity: "warning",
    href: "/tools/calendar",
    contextLabel: "⚠ цього місяця",
  },
  {
    id: "acc-cost",
    icon: "💰",
    label: "Вартість сервісу",
    value: "від 500 ₴/міс",
    detail: "Середня вартість бухгалтерського ПЗ по ринку",
    severity: "neutral",
    href: "/dovidnyky/ustanovy/accounting",
    contextLabel: "сер. по ринку",
  },
];

const LEGAL_INDICES: CategoryIndex[] = [
  { id: "legal-acts", icon: "📜", label: "Нормативні акти", value: "180 000+", detail: "Кількість актів у базі правової системи", severity: "neutral", href: "/analytics", contextLabel: "актуальна база" },
  { id: "legal-registries", icon: "🔍", label: "Онлайн реєстри", value: "12+", detail: "Кількість державних реєстрів для перевірки контрагентів", severity: "positive", href: "/analytics", contextLabel: "доступних онлайн" },
  { id: "legal-cost", icon: "💰", label: "Вартість сервісу", value: "від 800 ₴/міс", detail: "Середня вартість правової платформи по ринку", severity: "neutral", href: "/dovidnyky/ustanovy/legal", contextLabel: "сер. по ринку" },
  { id: "legal-speed", icon: "⏱", label: "Час реєстрації", value: "1-3 дні", detail: "Середній час реєстрації юридичних документів", severity: "neutral", href: "/dovidnyky/ustanovy/legal", contextLabel: "сер. по ринку" },
];

const PAYMENTS_INDICES: CategoryIndex[] = [
  { id: "pay-acquiring", icon: "💳", label: "Комісія еквайрингу", value: "1.5-2.5%", detail: "Середня комісія за прийом карткових платежів", severity: "neutral", href: "/analytics", contextLabel: "сер. по ринку" },
  { id: "pay-api", icon: "🔗", label: "API інтеграція", value: "у 90%", detail: "Частка платіжних сервісів з повноцінним API", severity: "positive", href: "/dovidnyky/ustanovy/payments", contextLabel: "✓ стандарт" },
  { id: "pay-setup", icon: "⏱", label: "Час підключення", value: "1-5 днів", detail: "Середній час підключення еквайрингу", severity: "neutral", href: "/dovidnyky/ustanovy/payments", contextLabel: "сер. по ринку" },
  { id: "pay-intl", icon: "🌍", label: "Міжнародні", value: "SWIFT / SEPA", detail: "Доступність міжнародних переказів", severity: "neutral", href: "/dovidnyky/ustanovy/payments", contextLabel: "основні системи" },
];

const FINTECH_INDICES: CategoryIndex[] = [
  { id: "fin-users", icon: "👥", label: "Активні користувачі", value: "5M+", detail: "Сукупна база користувачів ТОП-5 фінтех-сервісів", severity: "positive", href: "/analytics", contextLabel: "ТОП-5 сервісів" },
  { id: "fin-reg", icon: "⏱", label: "Час реєстрації", value: "< 5 хв", detail: "Середній час реєстрації у фінтех-сервісі", severity: "positive", href: "/dovidnyky/ustanovy/fintech", contextLabel: "✓ швидко" },
  { id: "fin-api", icon: "🔗", label: "Open API", value: "у 70%", detail: "Частка фінтех-сервісів з відкритим API", severity: "neutral", href: "/dovidnyky/ustanovy/fintech", contextLabel: "частка ринку" },
  { id: "fin-fee", icon: "💰", label: "Середня комісія", value: "0-1.5%", detail: "Діапазон комісій фінтех-сервісів", severity: "positive", href: "/analytics", contextLabel: "↓ нижче банків" },
];

const LOGISTICS_INDICES: CategoryIndex[] = [
  { id: "log-delivery", icon: "📦", label: "Середня доставка", value: "1-2 дні", detail: "Середній час доставки по Україні", severity: "positive", href: "/analytics", contextLabel: "по Україні" },
  { id: "log-cities", icon: "🏙", label: "Покриття міст", value: "28 000+", detail: "Кількість населених пунктів з доставкою", severity: "positive", href: "/dovidnyky/ustanovy/logistics", contextLabel: "✓ широке" },
  { id: "log-cost", icon: "💰", label: "Середня вартість", value: "від 45 ₴", detail: "Мінімальна вартість стандартної доставки", severity: "neutral", href: "/dovidnyky/ustanovy/logistics", contextLabel: "сер. по ринку" },
  { id: "log-tracking", icon: "📍", label: "Відстеження", value: "у 95%", detail: "Частка служб з онлайн-трекінгом відправлень", severity: "positive", href: "/dovidnyky/ustanovy/logistics", contextLabel: "✓ стандарт" },
];

const GRANTS_INDICES: CategoryIndex[] = [
  { id: "grant-active", icon: "📋", label: "Активні програми", value: "25+", detail: "Кількість діючих грантових програм для бізнесу", severity: "positive", href: "/analytics", contextLabel: "станом на 2026" },
  { id: "grant-avg", icon: "💰", label: "Середня сума", value: "250 000 ₴", detail: "Медіана суми гранту для малого бізнесу", severity: "neutral", href: "/dovidnyky/ustanovy/grants", contextLabel: "медіана ринку" },
  { id: "grant-competition", icon: "📊", label: "Конкурс", value: "3-5 заявок", detail: "Середня кількість заявок на одне місце", severity: "warning", href: "/dovidnyky/ustanovy/grants", contextLabel: "на 1 місце" },
  { id: "grant-time", icon: "⏱", label: "Час розгляду", value: "30-90 днів", detail: "Середній час від подання заявки до рішення", severity: "neutral", href: "/dovidnyky/ustanovy/grants", contextLabel: "сер. по програмах" },
];

const REGISTRATION_INDICES: CategoryIndex[] = [
  { id: "reg-fop", icon: "📝", label: "Реєстрація ФОП", value: "1-3 дні", detail: "Час реєстрації ФОП через держоргани або онлайн", severity: "positive", href: "/dovidnyky/ustanovy/registration", contextLabel: "через Дію — 1 день" },
  { id: "reg-cost", icon: "💰", label: "Вартість", value: "0 ₴", detail: "Реєстрація ФОП безкоштовна", severity: "positive", href: "/dovidnyky/ustanovy/registration", contextLabel: "✓ безкоштовно" },
  { id: "reg-online", icon: "📱", label: "Онлайн реєстрація", value: "100%", detail: "Усі типи реєстрації доступні онлайн", severity: "positive", href: "/dovidnyky/ustanovy/registration", progress: 100, contextLabel: "✓ повністю" },
  { id: "reg-services", icon: "📋", label: "Кількість послуг", value: "15+", detail: "Типи реєстраційних послуг для бізнесу", severity: "neutral", href: "/dovidnyky/ustanovy/registration", contextLabel: "основні послуги" },
];

const STARTUP_HUB_INDICES: CategoryIndex[] = [
  { id: "hub-residents", icon: "🏢", label: "Резиденти", value: "100+", detail: "Кількість компаній-резидентів інноваційних хабів", severity: "positive", href: "/dovidnyky/ustanovy/fintech", contextLabel: "сер. по хабах" },
  { id: "hub-events", icon: "📅", label: "Івенти / рік", value: "200+", detail: "Кількість бізнес-подій, мітапів та конференцій на рік", severity: "positive", href: "/dovidnyky/ustanovy/fintech", contextLabel: "активна спільнота" },
  { id: "hub-area", icon: "📐", label: "Площа", value: "25 000 м²", detail: "Загальна площа інноваційного простору", severity: "neutral", href: "/dovidnyky/ustanovy/fintech", contextLabel: "сер. по хабах" },
  { id: "hub-cost", icon: "💰", label: "Оренда від", value: "5 000 ₴/міс", detail: "Мінімальна вартість робочого місця", severity: "neutral", href: "/dovidnyky/ustanovy/fintech", contextLabel: "сер. по ринку" },
];

// ── Особисті фінанси (фін-здоровʼя фізособи) ──
export const PERSONAL_FINHEALTH_INDICES: CategoryIndex[] = [
  { id: "personal-savings-rate", icon: "💰", label: "Норма заощадження", value: "≥ 20%", detail: "Цільова частка заощаджень від чистого доходу", severity: "positive", href: "/tools/budget-503020", contextLabel: "ціль FIRE" },
  { id: "personal-emergency-months", icon: "🛟", label: "Подушка безпеки", value: "3-6 міс", detail: "Скільки місяців витрат тримати у ліквідних активах", severity: "neutral", href: "/tools/emergency-fund", contextLabel: "стандарт" },
  { id: "personal-debt-ratio", icon: "📉", label: "Борги / дохід", value: "≤ 36%", detail: "Сумарні щомісячні платежі за боргами не мають перевищувати 36% доходу", severity: "warning", href: "/tools/debt-snowball", contextLabel: "межа здоровʼя" },
  { id: "personal-housing-ratio", icon: "🏠", label: "Житло / дохід", value: "≤ 30%", detail: "Витрати на оренду або іпотеку не мають перевищувати 30% чистого доходу", severity: "neutral", href: "/tools/rent-vs-buy", contextLabel: "правило 30%" },
  { id: "personal-inv-share", icon: "📈", label: "Частка інвестицій", value: "≥ 25%", detail: "Інвестиційні активи (ОВДП, ETF, акції) у структурі капіталу", severity: "positive", href: "/tools/invest-calc", contextLabel: "довгострокова ціль" },
  { id: "personal-finhealth-score", icon: "❤️", label: "Health Score", value: "0-100", detail: "Агрегований індекс фін-здоровʼя на базі 5 показників вище", severity: "neutral", href: "/learn/personal/personal-finlit-free", contextLabel: "пройдіть курс" },
];

// ── Здоровʼя бізнесу ──
export const BUSINESS_FINHEALTH_INDICES: CategoryIndex[] = [
  { id: "biz-gross-margin", icon: "💵", label: "Валова маржа", value: "≥ 30%", detail: "Цільова валова маржа для стійкого малого бізнесу", severity: "positive", href: "/tools/unit-economy", contextLabel: "бенчмарк" },
  { id: "biz-runway", icon: "✈️", label: "Runway", value: "≥ 6 міс", detail: "Скільки місяців бізнес проживе при поточному burn rate", severity: "warning", href: "/tools/runway-calc", contextLabel: "мін. безпека" },
  { id: "biz-current-ratio", icon: "⚖️", label: "Current ratio", value: "≥ 1.5", detail: "Поточні активи / поточні зобовʼязання — здатність покрити борги", severity: "neutral", href: "/tools/runway-calc", contextLabel: "ліквідність" },
  { id: "biz-payroll-share", icon: "👥", label: "ФОП / виторг", value: "≤ 30%", detail: "Частка витрат на персонал у виторгу — типова межа", severity: "neutral", href: "/tools/hire-roi", contextLabel: "межа" },
  { id: "biz-tax-burden", icon: "🧾", label: "Податкове навантаження", value: "5-22%", detail: "Залежить від режиму: ФОП 2 гр (5% ЄП), 3 гр (5%), ТОВ (18%+ПДВ)", severity: "neutral", href: "/tools/fop-vs-too", contextLabel: "обрати режим" },
  { id: "biz-finhealth-score", icon: "🩺", label: "Health Score", value: "0-100", detail: "Агрегований індекс здоровʼя бізнесу на базі 5 показників вище", severity: "neutral", href: "/learn/business/business-finlit-free", contextLabel: "пройдіть курс" },
];

const CATEGORY_MAP: Record<string, CategoryIndex[]> = {
  banks: BANK_INDICES,
  insurance: INSURANCE_INDICES,
  credit: CREDIT_INDICES,
  invest: INVEST_INDICES,
  gov: GOV_INDICES,
  hr: HR_INDICES,
  accounting: ACCOUNTING_INDICES,
  digital_tools: ACCOUNTING_INDICES,
  legal: LEGAL_INDICES,
  payments: PAYMENTS_INDICES,
  fintech: FINTECH_INDICES,
  logistics: LOGISTICS_INDICES,
  grants: GRANTS_INDICES,
  registration: REGISTRATION_INDICES,
};

export function getCategoryIndices(categorySlug: string, types?: string[]): CategoryIndex[] {
  // Startup hubs in fintech category get their own indices
  if (categorySlug.startsWith('fintech') && types?.some(t => ['startup_hub', 'coworking'].includes(t))) {
    return STARTUP_HUB_INDICES;
  }
  const key = Object.keys(CATEGORY_MAP).find((k) => categorySlug.startsWith(k));
  return key ? CATEGORY_MAP[key] : [];
}

// ========== AI Insight Generator ==========

interface InsightTemplate {
  test: (p: FullInstitutionProfile) => boolean;
  generate: (p: FullInstitutionProfile) => string;
}

const INSIGHT_TEMPLATES: InsightTemplate[] = [
  {
    test: (p) => {
      const cs = p.ratings?.fintodo?.categorySlug || '';
      if (!cs.startsWith('banks')) return false;
      const product = p.products.find((pr) => pr.price.isFree);
      return !!product;
    },
    generate: (p) => {
      const product = p.products.find((pr) => pr.price.isFree);
      return `${p.name} пропонує ${product!.name.toLowerCase()} безкоштовно — це нижче ринкового медіану 150 ₴/міс за обслуговування рахунку.`;
    },
  },
  {
    test: (p) => {
      const cs = p.ratings?.fintodo?.categorySlug || '';
      return cs.startsWith('banks') && (p.branches?.atmCount ?? 0) > 2000;
    },
    generate: (p) =>
      `${p.name} має одну з найбільших мереж банкоматів в Україні — ${p.branches?.atmCount?.toLocaleString("uk")}+ терміналів, що в 3 рази більше за середній ТОП-5 банк.`,
  },
  {
    test: (p) => {
      const cs = p.ratings?.fintodo?.categorySlug || '';
      return cs.startsWith('legal') && p.ratings.fintodo.overall >= 75;
    },
    generate: (p) =>
      `${p.name} — провідна правова платформа з рейтингом ${p.ratings.fintodo.overall}/100. Охоплює ${p.products.length}+ правових інструментів для бізнесу.`,
  },
  {
    test: (p) => {
      const cs = p.ratings?.fintodo?.categorySlug || '';
      return cs.startsWith('logistics');
    },
    generate: (p) =>
      `${p.name} забезпечує доставку через мережу з ${p.branches?.totalCount?.toLocaleString("uk") || 'тисяч'} відділень по Україні. Порівняйте тарифи з іншими операторами.`,
  },
  {
    test: (p) => {
      const cs = p.ratings?.fintodo?.categorySlug || '';
      return cs.startsWith('fintech') || cs.startsWith('payments');
    },
    generate: (p) => {
      const freeProd = p.products.find(pr => pr.price.isFree);
      return freeProd
        ? `${p.name} пропонує ${freeProd.name.toLowerCase()} безкоштовно — зручний старт для малого бізнесу без початкових витрат.`
        : `${p.name} — ${p.editorial.oneLiner}. Порівняйте комісії та функціонал з іншими фінтех-сервісами.`;
    },
  },
  {
    test: (p) => {
      const cs = p.ratings?.fintodo?.categorySlug || '';
      return cs.startsWith('fintech') && (p.types?.some(t => ['startup_hub', 'coworking'].includes(t)) ?? false);
    },
    generate: (p) =>
      `${p.name} — інноваційний хаб із ${p.company.employeesCount || '100+'} резидентами. Порівняйте умови коворкінгу та програми підтримки стартапів.`,
  },
  {
    test: (p) => {
      const cs = p.ratings?.fintodo?.categorySlug || '';
      return cs.startsWith('grants');
    },
    generate: (p) =>
      `${p.name} пропонує грантові програми для бізнесу. Середній час розгляду заявки — 30-90 днів. Порівняйте з іншими програмами у категорії.`,
  },
  {
    test: (p) => p.ratings.fintodo.overall >= 80,
    generate: (p) =>
      `${p.name} має рейтинг FINTODO ${p.ratings.fintodo.overall}/100 — це вище 85% установ у категорії. Сильні сторони: ${p.editorial.bestFor[0]?.segment || "широкий функціонал"}.`,
  },
  {
    test: (p) => !!p.company?.foundedYear && new Date().getFullYear() - p.company.foundedYear > 20,
    generate: (p) => {
      const years = new Date().getFullYear() - p.company.foundedYear;
      return `${p.name} працює ${years}+ років на ринку. Довготривала присутність свідчить про стійкість бізнес-моделі та довіру регулятора.`;
    },
  },
  {
    test: () => true,
    generate: (p) =>
      `${p.name} — ${p.editorial.oneLiner}. Порівняйте з аналогами у категорії для оптимального вибору.`,
  },
];

export function generateAiInsight(profile: FullInstitutionProfile): string {
  for (const tpl of INSIGHT_TEMPLATES) {
    if (tpl.test(profile)) {
      return tpl.generate(profile);
    }
  }
  return `${profile.name} — ${profile.editorial.oneLiner}.`;
}
