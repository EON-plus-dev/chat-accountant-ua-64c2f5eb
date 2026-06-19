// Нормативна грошова оцінка землі (НГО) — база на 2026
// Регулюється: Закон № 1378-IV, ПКМУ № 1147 від 03.11.2021, Методика Держгеокадастру
// База оцінки індексується щорічно: коефіцієнт індексації за 2025 → застосовується у 2026
export const LAND_VALUATION_AS_OF = "2026-01-15";
export const INDEX_COEF_2025 = 1.078; // приклад коефіцієнта індексації

export type LandCategory =
  | "residential"       // житлова забудова
  | "commercial"        // комерційне використання
  | "industrial"        // промисловість
  | "agricultural_arable" // рілля
  | "agricultural_perennial" // багаторічні насадження
  | "recreational"      // рекреаційні
  | "garden"            // садівництво/городництво
  | "forest";           // лісогосподарського призначення

export const LAND_CATEGORY_LABEL: Record<LandCategory, string> = {
  residential: "Житлова забудова",
  commercial: "Комерційне використання",
  industrial: "Промисловість",
  agricultural_arable: "Рілля",
  agricultural_perennial: "Багаторічні насадження",
  recreational: "Рекреаційні",
  garden: "Садівництво/городництво",
  forest: "Ліс",
};

// Базові ставки НГО (₴/м²) — орієнтовні значення для типових міст і сільгоспугідь
export interface LandBaseRate {
  id: string;
  location: string;          // місто або тип території
  category: LandCategory;
  basePerM2: number;         // ₴/м² базова
  indexed2026: number;       // з урахуванням INDEX_COEF_2025
  notes?: string;
}

const idx = (v: number) => Math.round(v * INDEX_COEF_2025 * 100) / 100;

export const LAND_BASE_RATES: LandBaseRate[] = [
  // м. Київ
  { id: "kyiv-res", location: "м. Київ — Печерський р-н", category: "residential",
    basePerM2: 4820, indexed2026: idx(4820), notes: "Центральні райони — максимум" },
  { id: "kyiv-com", location: "м. Київ — Печерський р-н", category: "commercial",
    basePerM2: 7240, indexed2026: idx(7240) },
  { id: "kyiv-ind", location: "м. Київ — Деснянський р-н", category: "industrial",
    basePerM2: 1340, indexed2026: idx(1340) },
  // Обласні центри
  { id: "lviv-res", location: "м. Львів — центр", category: "residential",
    basePerM2: 1860, indexed2026: idx(1860) },
  { id: "lviv-com", location: "м. Львів — центр", category: "commercial",
    basePerM2: 2940, indexed2026: idx(2940) },
  { id: "dnipro-res", location: "м. Дніпро — центр", category: "residential",
    basePerM2: 1420, indexed2026: idx(1420) },
  { id: "odesa-res", location: "м. Одеса — Приморський р-н", category: "residential",
    basePerM2: 1980, indexed2026: idx(1980) },
  { id: "kharkiv-res", location: "м. Харків — центр", category: "residential",
    basePerM2: 1260, indexed2026: idx(1260) },
  // Райцентр / селище
  { id: "raitsentr-res", location: "Райцентр (типовий)", category: "residential",
    basePerM2: 320, indexed2026: idx(320) },
  { id: "village-res", location: "Село (типове)", category: "residential",
    basePerM2: 85, indexed2026: idx(85) },
  // Сільгоспугіддя (₴/га → ₴/м²)
  { id: "agro-arable-cherkasy", location: "Рілля — Черкаська обл.", category: "agricultural_arable",
    basePerM2: 4.32, indexed2026: idx(4.32), notes: "≈ 43 200 ₴/га (1 з найвищих у країні)" },
  { id: "agro-arable-poltava", location: "Рілля — Полтавська обл.", category: "agricultural_arable",
    basePerM2: 3.98, indexed2026: idx(3.98) },
  { id: "agro-arable-zhytomyr", location: "Рілля — Житомирська обл.", category: "agricultural_arable",
    basePerM2: 2.41, indexed2026: idx(2.41) },
  { id: "agro-perennial", location: "Багаторічні насадження (середнє)", category: "agricultural_perennial",
    basePerM2: 5.67, indexed2026: idx(5.67) },
  { id: "garden", location: "Садова ділянка (за межами н. п.)", category: "garden",
    basePerM2: 1.84, indexed2026: idx(1.84) },
  { id: "forest", location: "Землі лісогосп. призначення", category: "forest",
    basePerM2: 0.42, indexed2026: idx(0.42) },
  { id: "recreational-coast", location: "Рекреаційні (узбережжя)", category: "recreational",
    basePerM2: 980, indexed2026: idx(980) },
];

// Локальні коефіцієнти (множники до базової)
export interface LandCoefficient {
  code: string;
  name: string;
  range: string;
  description: string;
}

export const LAND_COEFFICIENTS: LandCoefficient[] = [
  { code: "Км1", name: "Регіональний коефіцієнт", range: "0.7 – 3.0",
    description: "Залежить від чисельності населення н. п. і його статусу" },
  { code: "Км2", name: "Зонінговий коефіцієнт", range: "0.5 – 1.5",
    description: "Зона міста: центральна, серединна, периферійна" },
  { code: "Км3", name: "Локальний коефіцієнт", range: "0.50 – 1.50",
    description: "Інфраструктура, транспортна доступність, екологія, інженерні мережі" },
  { code: "Кф", name: "Функціональний коефіцієнт", range: "0.5 – 2.5",
    description: "Категорія використання: житло 1.0, торгівля 2.5, промисловість 1.2" },
];

// Податок на землю (для довідки)
export const LAND_TAX_RULES = [
  { who: "Земля з НГО (фізособи)", rate: "0.1 – 1% від НГО (рішення місцевої ради)" },
  { who: "Земля з НГО (юрособи)", rate: "0.1 – 3% від НГО (рішення місцевої ради)" },
  { who: "Сільгоспугіддя", rate: "0.3 – 1% від НГО (зазвичай 0.3% для платників ЄП 4-ї групи)" },
  { who: "Земля без НГО", rate: "5% від НГО одиниці площі ріллі по області" },
  { who: "ФОП 3-ї групи (земля під бізнесом)", rate: "Звільнення від земельного податку (за ділянку для діяльності)" },
];

// Орендна плата
export const LAND_RENT_RULES = [
  { type: "Державна/комунальна земля — комерція", rate: "3 – 12% від НГО (ст. 288 ПКУ)" },
  { type: "Державна/комунальна земля — рілля (АПК)", rate: "не менше 3% і не більше 12% від НГО" },
  { type: "Приватна земля — за домовленістю", rate: "Мін. — 12% від НГО (Указ № 92/2002), без верх. межі" },
];
