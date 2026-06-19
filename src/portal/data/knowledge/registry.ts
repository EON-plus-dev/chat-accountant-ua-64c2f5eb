/**
 * KNOWLEDGE REGISTRY — єдине джерело правди для всіх фактів порталу.
 *
 * ВАЖЛИВО: усі snapshot-значення зафіксовані на 2026-04-10
 * (узгоджено з усіма /analytics сторінками). Якщо змінюєте число —
 * змінюйте `asOf` і остання точка `series` має дорівнювати `value`.
 *
 * Тести в __tests__/registry.spec.ts це валідують.
 */

import type { KnowledgeFact, KnowledgeForecast } from "./types";

/** Розклад засідань Правління НБУ 2026 (з bank.gov.ua/ua/monetary/stages) */
const NBU_MEETINGS_2026 = [
  "2026-01-22", "2026-03-05", "2026-04-23",
  "2026-06-11", "2026-07-23", "2026-09-10",
  "2026-10-22", "2026-12-10",
] as const;

export function getNextNbuMeeting(today: Date = new Date()): { iso: string; label: string } {
  const t = today.getTime();
  const next = NBU_MEETINGS_2026.find((d) => new Date(d).getTime() >= t)
    ?? NBU_MEETINGS_2026[NBU_MEETINGS_2026.length - 1];
  return {
    iso: next,
    label: new Date(next).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }),
  };
}

/** Дата основного snapshot. Якщо оновлюєте дані — оновлюйте і цю константу. */
export const SNAPSHOT_AS_OF = "2026-04-10";

export const KNOWLEDGE_FACTS = {
  // ── MACRO ───────────────────────────────────────────────────────
  "nbu-key-rate": {
    id: "nbu-key-rate",
    category: "macro",
    label: "Облікова ставка НБУ",
    value: 14.5,
    unit: "% річних",
    display: "14.5%",
    asOf: "2026-03-05",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua/ua/monetary/stages",
    confidence: "snapshot",
    whyItMatters:
      "Від облікової ставки залежать ставки по депозитах, кредитах і ОВДП. Зниження → банки зменшують ставки по депозитах.",
    series: [
      { period: "2024-01", value: 15.0 }, { period: "2024-04", value: 14.5 },
      { period: "2024-07", value: 13.0 }, { period: "2024-10", value: 13.0 },
      { period: "2025-01", value: 13.5 }, { period: "2025-02", value: 14.5 },
      { period: "2025-07", value: 14.0 }, { period: "2026-01", value: 14.5 },
      { period: "2026-03", value: 14.5 },
    ],
  },
  "inflation-cpi-yoy": {
    id: "inflation-cpi-yoy",
    category: "macro",
    label: "Інфляція (ІСЦ, рік до року)",
    value: 12.8,
    unit: "% р/р",
    display: "12.8%",
    asOf: "2026-04-10",
    source: "Держстат",
    sourceUrl: "https://ukrstat.gov.ua",
    confidence: "snapshot",
    whyItMatters:
      "Інфляція знецінює гривневі заощадження. Якщо депозит нижче за інфляцію — ви втрачаєте купівельну спроможність.",
    nextUpdate: "2026-05-10",
    series: [
      { period: "2024-01", value: 5.3 }, { period: "2024-04", value: 3.2 },
      { period: "2024-07", value: 9.8 }, { period: "2024-10", value: 11.2 },
      { period: "2025-01", value: 12.4 }, { period: "2025-07", value: 11.5 },
      { period: "2025-12", value: 12.4 }, { period: "2026-03", value: 12.8 },
    ],
  },
  "ovdp-yield-3m": {
    id: "ovdp-yield-3m",
    category: "rate",
    label: "Дохідність ОВДП (3 міс, gross)",
    value: 14.2,
    unit: "% річних",
    display: "14.2%",
    asOf: "2026-05-06",
    source: "Мінфін України",
    sourceUrl: "https://mof.gov.ua",
    confidence: "snapshot",
    whyItMatters:
      "Дохід від ОВДП звільнений від ПДФО та ВЗ — ефективна ставка ≈ 14.2% vs ≈ 10.4% після оподаткування звичайного депозиту під 13.5%.",
    series: [
      { period: "2024-01", value: 16.5 }, { period: "2024-07", value: 15.2 },
      { period: "2025-01", value: 14.5 }, { period: "2025-09", value: 13.8 },
      { period: "2026-03", value: 14.2 }, { period: "2026-05", value: 14.2 },
    ],
  },

  // ── TAX ─────────────────────────────────────────────────────────
  "pdfo-rate": {
    id: "pdfo-rate",
    category: "tax",
    label: "ПДФО (податок на доходи фізосіб)",
    value: 18,
    unit: "%",
    display: "18%",
    asOf: "2016-01-01",
    source: "ПКУ ст. 167.1",
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/2755-17",
    confidence: "official",
    whyItMatters: "Базова ставка для розрахунку чистої зарплати, дивідендів, відсотків.",
  },
  "military-tax-rate": {
    id: "military-tax-rate",
    category: "tax",
    label: "Військовий збір",
    value: 5,
    unit: "%",
    display: "5%",
    asOf: "2024-12-01",
    source: "ПКУ п. 16-1 підрозд. 10 розд. XX",
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/2755-17",
    confidence: "official",
    whyItMatters: "З 01.12.2024 збільшено з 1.5% до 5%. Утримується з зарплати разом з ПДФО.",
    series: [
      { period: "2014-08", value: 1.5 }, { period: "2024-12", value: 5 },
    ],
  },
  "esv-rate": {
    id: "esv-rate",
    category: "tax",
    label: "ЄСВ (нарахування роботодавця)",
    value: 22,
    unit: "%",
    display: "22%",
    asOf: "2016-01-01",
    source: "ЗУ «Про ЄСВ» ст. 8",
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/2464-17",
    confidence: "official",
    whyItMatters: "Сплачується роботодавцем зверху зарплати; для ФОП — від мінбази.",
  },
  "ep-group-3": {
    id: "ep-group-3",
    category: "tax",
    label: "Єдиний податок 3 група (без ПДВ)",
    value: 5,
    unit: "% з обороту",
    display: "5%",
    asOf: "2016-01-01",
    source: "ПКУ ст. 293.3",
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/2755-17",
    confidence: "official",
  },
  "vat-standard": {
    id: "vat-standard",
    category: "tax",
    label: "ПДВ стандартна ставка",
    value: 20,
    unit: "%",
    display: "20%",
    asOf: "2016-01-01",
    source: "ПКУ ст. 193.1",
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/2755-17",
    confidence: "official",
  },

  // ── WAGE ────────────────────────────────────────────────────────
  "min-wage": {
    id: "min-wage",
    category: "wage",
    label: "Мінімальна заробітна плата",
    value: 8647,
    unit: "₴/міс",
    display: "8 647 ₴",
    asOf: "2025-04-01",
    source: "КМУ",
    sourceUrl: "https://www.kmu.gov.ua",
    confidence: "official",
    whyItMatters: "Від МЗП рахується мін. ЄСВ (22%) для ФОП і ЄП 1-2 груп.",
    series: [
      { period: "2022", value: 6500 }, { period: "2023", value: 7100 },
      { period: "2024", value: 8000 }, { period: "2025", value: 8647 },
    ],
  },
  "min-esv-monthly": {
    id: "min-esv-monthly",
    category: "wage",
    label: "Мінімальний ЄСВ для ФОП (місяць)",
    value: 1902,
    unit: "₴/міс",
    display: "1 902 ₴",
    asOf: "2025-04-01",
    source: "ПФУ (МЗП × 22%)",
    sourceUrl: "https://www.pfu.gov.ua",
    confidence: "official",
    formula: "min-wage × esv-rate / 100",
    derivedFrom: ["min-wage", "esv-rate"],
    whyItMatters: "Обовʼязковий щомісячний платіж для ФОП, незалежно від доходу (крім призупинення).",
  },
  "subsistence-min": {
    id: "subsistence-min",
    category: "wage",
    label: "Прожитковий мінімум (працездатні)",
    value: 3028,
    unit: "₴/міс",
    display: "3 028 ₴",
    asOf: "2024-01-01",
    source: "КМУ",
    sourceUrl: "https://www.kmu.gov.ua",
    confidence: "official",
    whyItMatters: "База для держмита при реєстрації ТОВ, штрафів, аліментів, пенсій.",
  },

  // ── FX (НБУ офіційний) ─────────────────────────────────────────
  "fx-usd-uah": {
    id: "fx-usd-uah",
    category: "fx",
    label: "USD/UAH (НБУ)",
    value: 41.25,
    unit: "₴",
    display: "41.25 ₴",
    asOf: "2026-04-10",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua/ua/markets/exchangerates",
    confidence: "snapshot",
    series: [
      { period: "2022-01", value: 27.28 }, { period: "2023-01", value: 36.57 },
      { period: "2024-01", value: 37.85 }, { period: "2024-07", value: 40.50 },
      { period: "2025-01", value: 41.10 }, { period: "2025-07", value: 41.30 },
      { period: "2026-01", value: 41.18 }, { period: "2026-04", value: 41.25 },
    ],
  },
  "fx-eur-uah": {
    id: "fx-eur-uah",
    category: "fx",
    label: "EUR/UAH (НБУ)",
    value: 44.82,
    unit: "₴",
    display: "44.82 ₴",
    asOf: "2026-04-10",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua/ua/markets/exchangerates",
    confidence: "snapshot",
    series: [
      { period: "2022-01", value: 30.92 }, { period: "2023-01", value: 39.50 },
      { period: "2024-01", value: 41.20 }, { period: "2024-07", value: 43.80 },
      { period: "2025-01", value: 43.90 }, { period: "2025-07", value: 44.50 },
      { period: "2026-01", value: 44.70 }, { period: "2026-04", value: 44.82 },
    ],
  },
  "fx-pln-uah": {
    id: "fx-pln-uah",
    category: "fx",
    label: "PLN/UAH (НБУ)",
    value: 10.28,
    unit: "₴",
    display: "10.28 ₴",
    asOf: "2026-04-10",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua/ua/markets/exchangerates",
    confidence: "snapshot",
  },
  "fx-gbp-uah": {
    id: "fx-gbp-uah",
    category: "fx",
    label: "GBP/UAH (НБУ)",
    value: 52.15,
    unit: "₴",
    display: "52.15 ₴",
    asOf: "2026-04-10",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua/ua/markets/exchangerates",
    confidence: "snapshot",
  },

  // ── FUEL ────────────────────────────────────────────────────────
  "fuel-a95": {
    id: "fuel-a95",
    category: "fuel",
    label: "Бензин А-95 (середнє ТОП-5 мереж)",
    value: 56.80,
    unit: "₴/л",
    display: "56.80 ₴/л",
    asOf: "2026-05-08",
    source: "Мінекономіки, WOG/OKKO/SOCAR/UPG/БРСМ",
    sourceUrl: "https://me.gov.ua",
    confidence: "estimate",
    whyItMatters: "Впливає на собівартість логістики й транспортні витрати ФОП.",
  },
} satisfies Record<string, KnowledgeFact>;

export type FactId = keyof typeof KNOWLEDGE_FACTS;

// ── ПРОГНОЗИ (НБУ / Мінфін / МВФ) ─────────────────────────────────
export const KNOWLEDGE_FORECASTS: KnowledgeForecast[] = [
  {
    id: "inflation-forecast",
    factId: "inflation-cpi-yoy",
    label: "Прогноз інфляції (ІСЦ, р/р)",
    unit: "%",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua/ua/news/all/inflyaciyniy-zvit-kviten-2026-roku",
    horizon: "2024–2027",
    asOf: "2026-04-25",
    actuals: [
      { period: "2024", value: 5.3 },
      { period: "2025", value: 12.4 },
      { period: "2026 Q1", value: 12.8 },
    ],
    forecast: [
      { period: "2026", value: 8.7 },
      { period: "2027", value: 6.0 },
    ],
    note: "Базовий сценарій з квітневого Інфляційного звіту НБУ.",
  },
  {
    id: "key-rate-forecast",
    factId: "nbu-key-rate",
    label: "Облікова ставка НБУ — траєкторія",
    unit: "%",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua",
    horizon: "2024–2027",
    asOf: "2026-04-25",
    actuals: [
      { period: "2024", value: 13.0 },
      { period: "2025", value: 14.5 },
      { period: "2026 Q1", value: 14.5 },
    ],
    forecast: [
      { period: "2026", value: 13.0 },
      { period: "2027", value: 10.5 },
    ],
    note: "Очікуване зниження після стабілізації інфляції.",
  },
  {
    id: "usd-uah-forecast",
    factId: "fx-usd-uah",
    label: "Курс USD/UAH (середній за рік)",
    unit: "₴",
    source: "Мінфін",
    sourceUrl: "https://mof.gov.ua",
    horizon: "2024–2027",
    asOf: "2026-04-01",
    actuals: [
      { period: "2024", value: 40.7 },
      { period: "2025", value: 41.0 },
      { period: "2026 Q1", value: 41.2 },
    ],
    forecast: [
      { period: "2026", value: 42.4 },
      { period: "2027", value: 43.6 },
    ],
    note: "Прогнозний курс закладений у держбюджет-2026.",
  },
  {
    id: "min-wage-forecast",
    factId: "min-wage",
    label: "Мінімальна зарплата (план)",
    unit: "₴",
    source: "Мінфін (Бюджетна декларація)",
    sourceUrl: "https://mof.gov.ua",
    horizon: "2024–2027",
    asOf: "2026-03-15",
    actuals: [
      { period: "2024", value: 8000 },
      { period: "2025", value: 8647 },
    ],
    forecast: [
      { period: "2026", value: 9200 },
      { period: "2027", value: 9800 },
    ],
    note: "Орієнтири з Бюджетної декларації на 2026–2028.",
  },
];
