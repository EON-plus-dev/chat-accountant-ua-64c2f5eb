import { ARTICLES, type Article } from "@/portal/data/articles";
import { DEADLINES } from "@/portal/data/deadlines";
import { TOOLS, type Tool } from "@/portal/data/tools";
import { CURRENCY_RATES } from "@/portal/data/finder";
import { EP_FIXED, ESV_MONTHLY, TAX_RATES, MINIMUM_WAGE } from "@/config/taxConstantsConfig";

type Audience = "business" | "individual";

const DAYS_UK = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"];
const MONTHS_UK = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

export function getDailyGreeting(): string {
  const now = new Date();
  const h = now.getHours();
  if (h < 12) return "Доброго ранку";
  if (h < 18) return "Доброго дня";
  return "Доброго вечора";
}

export function getFormattedDate(): string {
  const now = new Date();
  return `${DAYS_UK[now.getDay()]}, ${now.getDate()} ${MONTHS_UK[now.getMonth()]} ${now.getFullYear()}`;
}

export function getUpdateTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function matchesAudience(articleAudience: string, audience?: Audience): boolean {
  if (!audience) return true;
  if (audience === "individual") return articleAudience === "personal" || articleAudience === "both";
  return articleAudience === "business" || articleAudience === "both";
}

export function getTodayArticles(audience?: Audience, limit = 5): Article[] {
  return ARTICLES
    .filter(a => matchesAudience(a.audience, audience))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function getFeaturedArticle(audience?: Audience): Article | undefined {
  const filtered = getTodayArticles(audience, 20);
  return filtered.find(a => a.isFeatured) || filtered[0];
}

export function getLegislationChanges(audience?: Audience, limit = 3): Article[] {
  return ARTICLES
    .filter(a => a.contentType === "change" && matchesAudience(a.audience, audience))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function getMostReadArticles(limit = 5): Article[] {
  return [...ARTICLES].sort((a, b) => b.views - a.views).slice(0, limit);
}

export interface KeyMetric {
  label: string;
  value: string;
  sublabel: string;
  delta?: string;
  trend: "up" | "down" | "stable";
  href: string;
}

// ============= Market Data (mock — замінити на API) =============

const MARKET_DATA = {
  fuelA95: { price: 56.80, weekDelta: 0.45 },
  nbuRate: { rate: 14.5, prevRate: 15.0, since: "2026-02-01" },
  creditBusiness: { rate: 18.5, monthDelta: -0.3 },
  depositAvg12: { grossRate: 15.2, monthDelta: 0.1 },
  businessExpectations: { index: 52.3, monthDelta: 1.2 },
  cpiMonthly: { value: 0.8, month: "березень" },
  livingWage: { value: 3328, since: "2026-01-01" },
};

function getDynamicBusinessMetrics(): KeyMetric[] {
  const nearestDeadline = DEADLINES.filter(d => d.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft)[0];
  const changesCount = ARTICLES.filter(a => a.contentType === "change" && (a.audience === "business" || a.audience === "both")).length;

  return [
    {
      label: "Бензин А-95",
      value: `${MARKET_DATA.fuelA95.price.toFixed(2)} ₴/л`,
      sublabel: "середня по країні",
      delta: `▲${MARKET_DATA.fuelA95.weekDelta.toFixed(2)} за тижд.`,
      trend: MARKET_DATA.fuelA95.weekDelta > 0 ? "up" : MARKET_DATA.fuelA95.weekDelta < 0 ? "down" : "stable",
      href: "/analytics",
    },
    {
      label: "Облікова ставка НБУ",
      value: `${MARKET_DATA.nbuRate.rate}%`,
      sublabel: "ключова ставка",
      delta: MARKET_DATA.nbuRate.rate < MARKET_DATA.nbuRate.prevRate
        ? `▼${(MARKET_DATA.nbuRate.prevRate - MARKET_DATA.nbuRate.rate).toFixed(1)} з лютого`
        : `▲${(MARKET_DATA.nbuRate.rate - MARKET_DATA.nbuRate.prevRate).toFixed(1)}`,
      trend: MARKET_DATA.nbuRate.rate < MARKET_DATA.nbuRate.prevRate ? "down" : "up",
      href: "/analytics",
    },
    {
      label: "Кредит бізнес (сер.)",
      value: `${MARKET_DATA.creditBusiness.rate}%`,
      sublabel: "середня по банках",
      delta: MARKET_DATA.creditBusiness.monthDelta < 0
        ? `▼${Math.abs(MARKET_DATA.creditBusiness.monthDelta).toFixed(1)} за міс.`
        : `▲${MARKET_DATA.creditBusiness.monthDelta.toFixed(1)} за міс.`,
      trend: MARKET_DATA.creditBusiness.monthDelta < 0 ? "down" : "up",
      href: "/analytics",
    },
    {
      label: "Ділові очікування",
      value: MARKET_DATA.businessExpectations.index.toFixed(1),
      sublabel: MARKET_DATA.businessExpectations.index >= 50 ? "зростання" : "спад",
      delta: `${MARKET_DATA.businessExpectations.monthDelta > 0 ? "▲" : "▼"}${Math.abs(MARKET_DATA.businessExpectations.monthDelta).toFixed(1)} за міс.`,
      trend: MARKET_DATA.businessExpectations.monthDelta > 0 ? "up" : "down",
      href: "/analytics",
    },
    {
      label: nearestDeadline?.title || "Дедлайн",
      value: nearestDeadline ? `${nearestDeadline.daysLeft} дн.` : "—",
      sublabel: nearestDeadline?.date || "немає найближчих",
      trend: nearestDeadline && nearestDeadline.daysLeft <= 7 ? "up" : "stable",
      href: "/tools/calendar",
    },
    {
      label: "Зміни за 30 днів",
      value: String(changesCount),
      sublabel: "законодавчих змін",
      trend: changesCount > 3 ? "up" : "stable",
      href: "/law",
    },
  ];
}

function getDynamicIndividualMetrics(): KeyMetric[] {
  const nearestDeadline = DEADLINES.filter(d => d.daysLeft > 0 && (d.taxType === "all" || d.type === "report")).sort((a, b) => a.daysLeft - b.daysLeft)[0]
    || DEADLINES.filter(d => d.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft)[0];
  const netDepositRate = Math.round(MARKET_DATA.depositAvg12.grossRate * (1 - 0.18 - 0.05) * 10) / 10;

  return [
    {
      label: "Бензин А-95",
      value: `${MARKET_DATA.fuelA95.price.toFixed(2)} ₴/л`,
      sublabel: "середня по країні",
      delta: `▲${MARKET_DATA.fuelA95.weekDelta.toFixed(2)} за тижд.`,
      trend: MARKET_DATA.fuelA95.weekDelta > 0 ? "up" : MARKET_DATA.fuelA95.weekDelta < 0 ? "down" : "stable",
      href: "/analytics",
    },
    {
      label: "Облікова ставка НБУ",
      value: `${MARKET_DATA.nbuRate.rate}%`,
      sublabel: "іпотека, кредити",
      delta: MARKET_DATA.nbuRate.rate < MARKET_DATA.nbuRate.prevRate
        ? `▼${(MARKET_DATA.nbuRate.prevRate - MARKET_DATA.nbuRate.rate).toFixed(1)} з лютого`
        : `▲${(MARKET_DATA.nbuRate.rate - MARKET_DATA.nbuRate.prevRate).toFixed(1)}`,
      trend: MARKET_DATA.nbuRate.rate < MARKET_DATA.nbuRate.prevRate ? "down" : "up",
      href: "/analytics",
    },
    {
      label: "Депозит 12 міс",
      value: `${MARKET_DATA.depositAvg12.grossRate}%`,
      sublabel: `net ${netDepositRate}% після ПДФО+ВЗ`,
      delta: `${MARKET_DATA.depositAvg12.monthDelta > 0 ? "▲" : "▼"}${Math.abs(MARKET_DATA.depositAvg12.monthDelta).toFixed(1)} за міс.`,
      trend: MARKET_DATA.depositAvg12.monthDelta > 0 ? "up" : "down",
      href: "/analytics",
    },
    {
      label: "Прожитковий мінімум",
      value: `${MARKET_DATA.livingWage.value.toLocaleString("uk-UA")} ₴`,
      sublabel: "аліменти, соцвиплати",
      delta: `з ${new Date(MARKET_DATA.livingWage.since).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" })}`,
      trend: "stable",
      href: "/analytics",
    },
    {
      label: nearestDeadline?.title || "Дедлайн",
      value: nearestDeadline ? `${nearestDeadline.daysLeft} дн.` : "—",
      sublabel: nearestDeadline?.date || "немає найближчих",
      trend: nearestDeadline && nearestDeadline.daysLeft <= 7 ? "up" : "stable",
      href: "/tools/calendar",
    },
    {
      label: "ІСЦ (місячний)",
      value: `+${MARKET_DATA.cpiMonthly.value}%`,
      sublabel: `за ${MARKET_DATA.cpiMonthly.month}`,
      trend: MARKET_DATA.cpiMonthly.value > 1 ? "up" : MARKET_DATA.cpiMonthly.value > 0.5 ? "stable" : "down",
      href: "/analytics",
    },
  ];
}

export function getKeyMetrics(audience?: Audience): KeyMetric[] {
  if (audience === "individual") return getDynamicIndividualMetrics();
  return getDynamicBusinessMetrics();
}

// ============= Profile Insights =============

export interface ProfileInsight {
  id: string;
  label: string;
  description: string;
  cta: string;
  href: string;
}

const BUSINESS_PROFILES: ProfileInsight[] = [
  { id: "fop1", label: "ФОП 1 гр.", description: "ЄП 332,80 ₴ + ЄСВ 1 902 ₴ + ВЗ 864,70 ₴/міс. Ліміт доходу — 1,44 млн ₴/рік. Тільки роздрібна торгівля та послуги населенню.", cta: "Калькулятор ФОП 1 →", href: "/tools/tax-calc" },
  { id: "fop2", label: "ФОП 2 гр.", description: "ЄП 1 729 ₴ + ЄСВ 1 902 ₴ + ВЗ 864,70 ₴/міс. Ліміт — 7,21 млн ₴/рік. Послуги для бізнесу та населення.", cta: "Калькулятор ФОП 2 →", href: "/tools/tax-calc" },
  { id: "fop3", label: "ФОП 3 гр.", description: "ЄП 5% від доходу (або 3% + ПДВ) + ЄСВ 1 902 ₴ + ВЗ 5% від доходу. Ліміт — 10,09 млн ₴/рік.", cta: "Калькулятор ФОП 3 →", href: "/tools/tax-calc" },
  { id: "llc", label: "ТОВ", description: "Податок на прибуток 18% + ПДВ 20%. Дивіденди: ПДФО 5% (або 9%) + ВЗ 5%. Обов'язковий аудит від 40 млн ₴.", cta: "Порівняти з ФОП →", href: "/fop" },
  { id: "employer", label: "Роботодавець", description: "ЄСВ 22% від зарплати. Штраф за неоформлення — 86 470 ₴. Мін. зарплата — 8 647 ₴. Повторне порушення — 172 940 ₴.", cta: "ROI найму →", href: "/tools/hire-roi" },
];

const INDIVIDUAL_PROFILES: ProfileInsight[] = [
  { id: "employee", label: "Найманий", description: "ПДФО 18% + ВЗ 5% утримує роботодавець. Зарплата 8 647 ₴ мін. → на руки ≈ 6 660 ₴. Є право на податкову знижку.", cta: "Калькулятор зарплати →", href: "/tools/salary-calc" },
  { id: "freelancer", label: "Фрілансер", description: "Без ФОП: ПДФО 18% + ВЗ 5% = 23%. З ФОП 3 гр.: ЄП 5% + ЄСВ + ВЗ. Іноземний дохід — декларувати обов'язково.", cta: "ФОП чи ні? →", href: "/fop" },
  { id: "landlord", label: "Орендодавець", description: "ПДФО 18% + ВЗ 5% = 23% від орендної плати. Декларація до 1 травня. Як ФОП 2 гр. — всього 1 729 ₴/міс.", cta: "Порівняти варіанти →", href: "/personal" },
  { id: "investor", label: "Інвестор", description: "Дивіденди: ПДФО 5% (або 9%) + ВЗ 5%. Продаж акцій/крипто: ПДФО 18% + ВЗ 5%. Декларувати самостійно.", cta: "Як декларувати →", href: "/personal" },
  { id: "tax-discount", label: "Податкова знижка", description: "Повернення до 18% від витрат на навчання, лікування, іпотеку, благодійність. Декларація до 31 грудня наступного року.", cta: "Перевірити право →", href: "/personal" },
];

export function getProfileInsights(audience?: Audience): ProfileInsight[] {
  return audience === "individual" ? INDIVIDUAL_PROFILES : BUSINESS_PROFILES;
}

export function getUpcomingDeadlines(limit = 4) {
  return DEADLINES.filter(d => d.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, limit);
}

// Business-oriented tool IDs
const BUSINESS_TOOL_IDS = ["esv", "tax", "salary", "counterparty", "kved", "calendar", "cashflow", "invoice"];
// Individual-oriented tool IDs
const INDIVIDUAL_TOOL_IDS = ["salary", "calendar", "kved", "counterparty", "cashflow", "breakeven"];

export function getPopularTools(audience?: Audience, limit = 6): Tool[] {
  const preferredIds = audience === "individual" ? INDIVIDUAL_TOOL_IDS : BUSINESS_TOOL_IDS;
  
  return TOOLS
    .filter(t => !t.isPremium)
    .sort((a, b) => {
      const aPreferred = preferredIds.includes(a.id) ? 0 : 1;
      const bPreferred = preferredIds.includes(b.id) ? 0 : 1;
      if (aPreferred !== bPreferred) return aPreferred - bPreferred;
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return b.usageCount - a.usageCount;
    })
    .slice(0, limit);
}

export function getCurrencySnapshot() {
  const usd = CURRENCY_RATES.rates.find(r => r.currency === "USD");
  const eur = CURRENCY_RATES.rates.find(r => r.currency === "EUR");
  return { usd, eur, meta: CURRENCY_RATES.meta };
}

const BUSINESS_SUGGESTIONS = [
  "Який штраф за неподання декларації?",
  "Як розрахувати ЄСВ для ФОП 2 групи?",
  "Коли дедлайн звіту за Q1?",
];

const INDIVIDUAL_SUGGESTIONS = [
  "Чи треба декларувати дохід з оренди?",
  "Як сплатити ПДФО з інвестицій?",
  "Який ліміт P2P переказів?",
];

export function getAiSuggestions(audience?: Audience): string[] {
  return audience === "individual" ? INDIVIDUAL_SUGGESTIONS : BUSINESS_SUGGESTIONS;
}

interface DailyTip {
  text: string;
  cta: string;
  href: string;
}

const BUSINESS_TIPS: DailyTip[] = [
  { text: "ФОП 3 групи може перевищити ліміт доходу на 15% одноразово — але сплатить подвійну ставку ЄП за надлишок.", cta: "Ліміти ФОП →", href: "/fop" },
  { text: "Штраф за неоформленого працівника — 86 470 ₴ (10 МЗП). При повторному порушенні — 172 940 ₴.", cta: "Перевірити →", href: "/law" },
  { text: "З 2026 року ВЗ для ФОП 1-2 груп — фіксований 864,70 ₴/міс, а для 3 групи — 5% від доходу.", cta: "Детальніше →", href: "/taxes" },
  { text: "Бартерні операції заборонені для спрощеної системи. Штрафна ставка ЄП — 15%.", cta: "ПКУ ст. 291.6 →", href: "/law" },
  { text: "ФОП-пенсіонери повністю звільнені від сплати ЄСВ. Економія — 1 902 ₴/міс.", cta: "Калькулятор →", href: "/tools/esv-calc" },
  { text: "Дедлайн квартального звіту — 19 число місяця, що йде за кварталом. Пропуск = штраф 340 ₴.", cta: "Календар →", href: "/tools/calendar" },
  { text: "Перевіряйте контрагентів перед угодою — борги ДПС та відкриті справи можуть стати вашою проблемою.", cta: "Перевірити →", href: "/tools/counterparty" },
  { text: "Cash Flow прогноз на 3 місяці допомагає уникнути касових розривів — спробуйте новий інструмент.", cta: "Cash Flow →", href: "/tools/cashflow" },
  { text: "З 01.01.2026 КВЕД 80.10, 80.20, 80.30 (охоронна діяльність) заборонені для ЄП.", cta: "Перевірити КВЕД →", href: "/tools/kved" },
  { text: "Мінімальний ЄСВ 2026 — 1 902,34 ₴. Це на 202 ₴ більше, ніж у 2025.", cta: "Розрахувати →", href: "/tools/esv-calc" },
  { text: "Єдиний податок Гр. 1 — 332,80 ₴/міс, Гр. 2 — 1 729,40 ₴/міс у 2026 році.", cta: "Порівняти групи →", href: "/tools/tax-calc" },
  { text: "Генератор рахунків створює PDF за 2 хвилини — більше не потрібен Excel.", cta: "Спробувати →", href: "/tools/invoice" },
  { text: "ROI найму: порівняйте витрати на штатного працівника vs ФОП-виконавця vs аутсорс.", cta: "Порівняти →", href: "/tools/hire-roi" },
  { text: "Прожитковий мінімум 2026 — 3 328 ₴. Впливає на розрахунок аліментів та соцвиплат.", cta: "Аналітика →", href: "/analytics" },
  { text: "Автоматичні нагадування про дедлайни — підключіть Google Calendar експорт.", cta: "Календар →", href: "/tools/calendar" },
];

const INDIVIDUAL_TIPS: DailyTip[] = [
  { text: "Дохід від оренди нерухомості оподатковується ПДФО 18% + ВЗ 5%. Декларацію подають до 1 травня.", cta: "Гайд →", href: "/personal" },
  { text: "P2P перекази понад 400 000 ₴ потрапляють під фінансовий моніторинг банку.", cta: "Детальніше →", href: "/personal" },
  { text: "Дохід від інвестицій (дивіденди, продаж акцій) треба самостійно задекларувати.", cta: "Як декларувати →", href: "/personal" },
  { text: "Поріг декларування 2026 — 302 400 ₴. Перевищили? Потрібна декларація до 1 травня.", cta: "Перевірити →", href: "/personal" },
  { text: "Виграш у лотерею понад 4 324 ₴ оподатковується ПДФО 18% + ВЗ 5%.", cta: "ПКУ 170.6 →", href: "/taxes" },
  { text: "Військовий збір з 2026 — 5% замість попередніх 1,5%. Стосується всіх доходів.", cta: "Розрахувати →", href: "/taxes" },
  { text: "Калькулятор зарплати покаже реальний Net з урахуванням ПДФО 18% та ВЗ 5%.", cta: "Калькулятор →", href: "/tools/salary-calc" },
  { text: "Податковий календар допоможе не пропустити жоден дедлайн.", cta: "Календар →", href: "/tools/calendar" },
  { text: "Перевірте свій КВЕД — деякі види діяльності мають обмеження для спрощеної системи.", cta: "Пошук КВЕД →", href: "/tools/kved" },
  { text: "Якщо плануєте стати ФОП — порівняйте групи та розрахуйте податки заздалегідь.", cta: "Порівняти →", href: "/tools/tax-calc" },
  { text: "Прожитковий мінімум 2026 — 3 328 ₴. Впливає на розрахунок аліментів та пільг.", cta: "Аналітика →", href: "/analytics" },
  { text: "AI-консультант дає відповіді з посиланням на конкретну норму ПКУ — безкоштовно.", cta: "Запитати →", href: "/qa" },
  { text: "Курси НБУ оновлюються щодня — слідкуйте за динамікою долара та євро.", cta: "Курси →", href: "/analytics/currency" },
  { text: "Дохід від продажу нерухомості: перший продаж за рік — 0% ПДФО, другий — 5%.", cta: "Детальніше →", href: "/personal" },
  { text: "Іноземні доходи (фріланс, дивіденди) підлягають декларуванню в Україні.", cta: "Гайд →", href: "/personal" },
];

export function getDailyTip(audience?: Audience): DailyTip {
  const tips = audience === "individual" ? INDIVIDUAL_TIPS : BUSINESS_TIPS;
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return tips[dayOfYear % tips.length];
}

// ============= LiveDataStrip helpers =============

export interface LiveRate {
  label: string;
  value: string;
}

export function getLiveRates(audience?: Audience): LiveRate[] {
  if (audience === "individual") {
    return [
      { label: "ПДФО", value: "18%" },
      { label: "ВЗ", value: "5%" },
      { label: "P2P ліміт", value: "400 000 ₴" },
    ];
  }
  return [
    { label: "МЗП", value: "8 647 ₴" },
    { label: "ЄСВ", value: "1 902 ₴" },
    { label: "ПДФО+ВЗ", value: "18%+5%" },
  ];
}

export function getRelevantDeadline(audience?: Audience) {
  const all = DEADLINES.filter(d => d.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft);
  if (audience === "individual") {
    const relevant = all.filter(d => d.type === "report" || d.taxType === "all");
    return relevant[0] || all[0];
  }
  return all[0];
}

// ============= Unique Indices =============

export type IndexSeverity = "positive" | "neutral" | "warning" | "negative";

export interface UniqueIndex {
  id: string;
  icon: string;
  label: string;
  value: string;
  detail: string;
  severity: IndexSeverity;
  href: string;
  /** 0-100 for progress-bar style indices */
  progress?: number;
  /** "primary" — featured row (3 cards), "secondary" — collapsed by default */
  priority?: "primary" | "secondary";
}

/** Середня ефективна ставка по 3 групах ФОП */
function calcTaxFreedomDay(): { day: number; dateLabel: string; avgRate: number } {
  // Середнє навантаження по групах: Гр.3 ~12.2% — найпоширеніша
  const avgRate = 0.122;
  const day = Math.round(365 * avgRate);
  const d = new Date(new Date().getFullYear(), 0, day);
  const label = `${d.getDate()} ${MONTHS_UK[d.getMonth()]}`;
  return { day, dateLabel: label, avgRate };
}

/** Ефективні ставки для всіх груп ФОП */
function calcEffectiveTaxRates() {
  const wz1 = MINIMUM_WAGE * TAX_RATES.militaryTax; // ВЗ для Гр.1 = 10% МЗП → але фіксований
  const wz12 = Math.round(MINIMUM_WAGE * 0.10 * 100) / 100; // ВЗ фікс. 10% МЗП для Гр.1-2

  // Типові місячні доходи для розрахунку ефективної ставки
  const income1 = 10000;
  const income2 = 25000;

  const fixed1 = EP_FIXED.group1 + wz12 + ESV_MONTHLY;
  const fixed2 = EP_FIXED.group2 + wz12 + ESV_MONTHLY;
  const rate3 = TAX_RATES.epGroup3_withoutVat + TAX_RATES.militaryTax; // 5% + 5% = 10% + ЄСВ

  const eff1 = Math.round((fixed1 / income1) * 100);
  const eff2 = Math.round((fixed2 / income2) * 100);
  const eff3 = Math.round((rate3 + ESV_MONTHLY / 50000) * 100); // ~12% при 50к доходу

  return { eff1, eff2, eff3 };
}

function getQuarterCountdown(): { daysLeft: number; quarter: number } {
  const now = new Date();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  const quarterEndMonth = quarter * 3; // 0-indexed: Q1→3, Q2→6, Q3→9, Q4→12
  const quarterEnd = quarterEndMonth === 12
    ? new Date(now.getFullYear() + 1, 0, 1)
    : new Date(now.getFullYear(), quarterEndMonth, 1);
  const daysLeft = Math.ceil((quarterEnd.getTime() - now.getTime()) / 86400000);
  return { daysLeft, quarter };
}

function getYearProgress(): { percent: number; dayOfYear: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const percent = Math.round((dayOfYear / 365) * 100);
  return { percent, dayOfYear };
}

function getBusinessIndices(): UniqueIndex[] {
  const freedom = calcTaxFreedomDay();
  const taxRates = calcEffectiveTaxRates();
  
  // Вартість працівника: ЄСВ 22% + адмін ~15%
  const employeeCost = 1 + TAX_RATES.esv + 0.15;
  
  // Реальний підрахунок змін з ARTICLES
  const regChanges = ARTICLES.filter(a => a.contentType === "change" && (a.audience === "business" || a.audience === "both")).length;
  const regSeverity: IndexSeverity = regChanges <= 3 ? "positive" : regChanges <= 7 ? "neutral" : "negative";

  const qtr = getQuarterCountdown();
  const yearProg = getYearProgress();

  return [
    // Primary: 3 ключові індекси — найбільш actionable
    {
      id: "reg-pulse",
      icon: "📋",
      label: "Змін у законодавстві",
      value: `${regChanges}`,
      detail: "За останні 30 днів",
      severity: regSeverity,
      href: "/law",
      priority: "primary",
    },
    {
      id: "quarter-countdown",
      icon: "⏳",
      label: `До кінця Q${qtr.quarter}`,
      value: `${qtr.daysLeft} дн.`,
      detail: "Звітність, платежі, ліміти",
      severity: qtr.daysLeft <= 14 ? "negative" : qtr.daysLeft <= 30 ? "warning" : "neutral",
      href: "/tools/calendar",
      priority: "primary",
    },
    {
      id: "tax-burden",
      icon: "💰",
      label: "Ефективна ставка ФОП",
      value: `~${taxRates.eff3}%`,
      detail: `Гр.1: ~${taxRates.eff1}% · Гр.2: ~${taxRates.eff2}% · Гр.3: ~${taxRates.eff3}%`,
      severity: "neutral",
      href: "/tools/tax-calc",
      priority: "primary",
    },
    // Secondary: контекстні, додаткові
    {
      id: "tax-freedom",
      icon: "🗓",
      label: "Днів роботи на податки",
      value: `${freedom.day} дн.`,
      detail: `День податкової свободи — ${freedom.dateLabel}`,
      severity: "neutral",
      href: "/analytics/indices",
      progress: Math.round((freedom.day / 365) * 100),
      priority: "secondary",
    },
    {
      id: "employee-cost",
      icon: "👥",
      label: "Реальна вартість зарплати",
      value: `×${employeeCost.toFixed(2)}`,
      detail: `1 000 ₴ «на руки» → ${Math.round(employeeCost * 1000).toLocaleString("uk-UA")} ₴ витрат`,
      severity: "warning",
      href: "/tools/hire-roi",
      priority: "secondary",
    },
    {
      id: "year-progress",
      icon: "📈",
      label: "Рік пройдено",
      value: `${yearProg.percent}%`,
      detail: `${yearProg.dayOfYear} з 365 днів · слідкуй за лімітами`,
      severity: "neutral",
      href: "/analytics",
      progress: yearProg.percent,
      priority: "secondary",
    },
  ];
}

function getIndividualIndices(): UniqueIndex[] {
  // Податковий клин: ПДФО 18% + ВЗ 5% = 23%
  const taxWedge = 23;
  
  // Реальна зарплата: номінальне зростання 9.6% - інфляція 12.8% = -3.2%
  const realWage = -3.2;
  
  // Інфляція ІСЦ
  const inflation = 12.8;
  
  // Споживчий кошик
  const basket = 6800;
  
  // Депозит vs ОВДП: депозит 19.5% gross → net 15% (after ПДФО+ВЗ), ОВДП 14.5% net (звільнені)
  const depositNet = 15.0;
  const ovdpNet = 14.2;

  const qtr = getQuarterCountdown();

  return [
    // Primary: 3 ключові
    {
      id: "tax-wedge",
      icon: "✂️",
      label: "Податки із зарплати",
      value: `${taxWedge}%`,
      detail: "ПДФО 18% + ВЗ 5%",
      severity: "warning",
      href: "/tools/salary-calc",
      progress: taxWedge,
      priority: "primary",
    },
    {
      id: "real-wage",
      icon: "📉",
      label: "Реальна зарплата",
      value: `${realWage > 0 ? "+" : ""}${realWage}%`,
      detail: realWage < 0 ? "Інфляція з'їдає зростання" : "Зарплати випереджають інфляцію",
      severity: realWage < 0 ? "negative" : "positive",
      href: "/analytics/indices",
      priority: "primary",
    },
    {
      id: "quarter-countdown",
      icon: "⏳",
      label: `До кінця Q${qtr.quarter}`,
      value: `${qtr.daysLeft} дн.`,
      detail: "Декларування, звітність",
      severity: qtr.daysLeft <= 14 ? "negative" : qtr.daysLeft <= 30 ? "warning" : "neutral",
      href: "/tools/calendar",
      priority: "primary",
    },
    // Secondary
    {
      id: "inflation",
      icon: "🔥",
      label: "Інфляція (ІСЦ)",
      value: `${inflation}%`,
      detail: `ІСЦ ${inflation}% · ціль НБУ 5%`,
      severity: inflation > 10 ? "negative" : inflation > 5 ? "warning" : "positive",
      href: "/analytics/indices",
      progress: Math.min((inflation / 20) * 100, 100),
      priority: "secondary",
    },
    {
      id: "basket",
      icon: "🛒",
      label: "Споживчий кошик",
      value: `~${basket.toLocaleString("uk-UA")} ₴`,
      detail: "На 1 особу/місяць",
      severity: "neutral",
      href: "/analytics/indices",
      priority: "secondary",
    },
    {
      id: "invest",
      icon: "📊",
      label: "Депозит vs ОВДП",
      value: `${depositNet}% / ${ovdpNet}%`,
      detail: "Чистий дохід після податків",
      severity: "positive",
      href: "/analytics/indices",
      priority: "secondary",
    },
  ];
}

export function getUniqueIndices(audience?: Audience): UniqueIndex[] {
  return audience === "individual" ? getIndividualIndices() : getBusinessIndices();
}

// ============= Personas (точки входу для overview) =============

export interface PersonaDeadline {
  title: string;
  date: string;
  daysLeft: number;
}
export interface PersonaTool {
  id: string;
  emoji: string;
  name: string;
  href: string;
}
export interface PersonaChange {
  title: string;
  href: string;
}
export interface Persona {
  id: string;
  label: string;
  audience: "business" | "individual" | "both";
  hint: string;
  hubHref: string;
  hubLabel: string;
  toolIds: string[];
  deadlineFilter?: (d: { type?: string; taxType?: string; title: string }) => boolean;
}

export const PERSONAS: Persona[] = [
  {
    id: "fop",
    label: "Я ФОП",
    audience: "business",
    hint: "Дедлайни ЄП/ЄСВ, ліміти, калькулятори",
    hubHref: "/fop",
    hubLabel: "Розділ для ФОП",
    toolIds: ["esv", "tax", "calendar"],
  },
  {
    id: "accountant",
    label: "Я бухгалтер",
    audience: "business",
    hint: "Зміни у законодавстві, звітність, інструменти",
    hubHref: "/law",
    hubLabel: "Зміни та норми",
    toolIds: ["calendar", "salary", "counterparty"],
  },
  {
    id: "owner",
    label: "Я підприємець (ТОВ)",
    audience: "business",
    hint: "Найм, грошові потоки, контрагенти",
    hubHref: "/business",
    hubLabel: "Розділ для бізнесу",
    toolIds: ["hire-roi", "cashflow", "counterparty"],
  },
  {
    id: "employee",
    label: "Я найманий",
    audience: "individual",
    hint: "Зарплата, податкова знижка, декларація",
    hubHref: "/personal",
    hubLabel: "Розділ для фізосіб",
    toolIds: ["salary", "calendar", "deposit-calc"],
  },
  {
    id: "freelancer",
    label: "Я фрілансер",
    audience: "both",
    hint: "ФОП чи без ФОП, іноземні доходи, декларація",
    hubHref: "/fop",
    hubLabel: "Як стати ФОП",
    toolIds: ["tax", "esv", "calendar"],
  },
  {
    id: "investor",
    label: "Я орендодавець / інвестор",
    audience: "individual",
    hint: "Декларування доходу, ставки, дедлайни",
    hubHref: "/personal",
    hubLabel: "Декларування",
    toolIds: ["deposit-calc", "invest-calc", "calendar"],
  },
];

export function getPersonas(audience?: Audience): Persona[] {
  if (!audience) return PERSONAS;
  return PERSONAS.filter(p => p.audience === audience || p.audience === "both");
}

export function getPersonaContext(personaId: string) {
  const persona = PERSONAS.find(p => p.id === personaId);
  if (!persona) return null;

  // Tools для персони
  const tools: PersonaTool[] = persona.toolIds
    .map(id => TOOLS.find(t => t.id === id))
    .filter((t): t is Tool => Boolean(t))
    .slice(0, 3)
    .map(t => ({ id: t.id, emoji: t.emoji, name: t.name, href: `/tools/${t.slug}` }));

  // Дедлайни — найближчі релевантні
  const audience: Audience | undefined =
    persona.audience === "both" ? undefined : persona.audience;
  const deadlines: PersonaDeadline[] = DEADLINES
    .filter(d => d.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 2)
    .map(d => ({ title: d.title, date: d.date, daysLeft: d.daysLeft }));

  // Свіжі зміни — релевантні аудиторії
  const changes: PersonaChange[] = ARTICLES
    .filter(a => a.contentType === "change" && (audience ? matchesAudience(a.audience, audience) : true))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 2)
    .map(a => ({ title: a.title, href: `/articles/${a.slug}` }));

  return { persona, tools, deadlines, changes };
}

// ============= Tool benefit overlay (orientation на користь) =============

const TOOL_BENEFITS: Record<string, string> = {
  cashflow: "Зрозумієш, чи вистачить грошей на 3, 6 і 12 місяців",
  tax: "Покаже, скільки реально залишиться після податків",
  salary: "Скільки зарплата коштує бізнесу і скільки «на руки»",
  "hire-roi": "Чи окупиться найм нового працівника",
  invoice: "PDF-рахунок за 2 хвилини, без Excel",
  kved: "Перевірить, чи можна твій КВЕД на ЄП",
  esv: "Точний розмір ЄСВ і коли його треба сплатити",
  calendar: "Які звіти і платежі — у найближчі 30 днів",
  counterparty: "Перевірить контрагента до укладання угоди",
  breakeven: "Скільки треба продати, щоб вийти в нуль",
  "deposit-calc": "Реальна дохідність вкладу після податків",
  "invest-calc": "Скільки капіталу буде через 5–10 років",
  "credit-calc": "Реальна вартість кредиту з усіма платежами",
  "vacation-calc": "Скільки виплатити працівнику за відпустку",
  "insurance-calc": "Підбере оптимальну страховку за ціною",
};

export function getToolBenefit(toolId: string): string | undefined {
  return TOOL_BENEFITS[toolId];
}
