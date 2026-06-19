/**
 * Офіційні прогнози НБУ та Мінфіну (станом на квітень 2026).
 * Використовуються на сторінці /analytics/archive.
 */

export interface ForecastPoint {
  period: string; // YYYY або YYYY-Q
  value: number;
  scenario?: "base" | "optimistic" | "pessimistic";
}

export interface Forecast {
  id: string;
  label: string;
  unit: string;
  source: "НБУ" | "Мінфін" | "МВФ";
  sourceUrl: string;
  horizon: string;
  /** Фактичні значення (історія) */
  actuals: { period: string; value: number }[];
  /** Прогнозні точки */
  forecast: ForecastPoint[];
  note: string;
}

export const FORECASTS: Forecast[] = [
  {
    id: "inflation-forecast",
    label: "Прогноз інфляції (ІСЦ, рік до року)",
    unit: "%",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua/ua/news/all/inflyaciyniy-zvit-kviten-2026-roku",
    horizon: "2024–2027",
    actuals: [
      { period: "2024", value: 12.0 },
      { period: "2025", value: 11.2 },
      { period: "2026 Q1", value: 10.2 },
    ],
    forecast: [
      { period: "2026", value: 8.7 },
      { period: "2027", value: 6.0 },
    ],
    note: "Базовий сценарій з квітневого Інфляційного звіту НБУ.",
  },
  {
    id: "key-rate-forecast",
    label: "Облікова ставка НБУ — траєкторія",
    unit: "%",
    source: "НБУ",
    sourceUrl: "https://bank.gov.ua",
    horizon: "2024–2027",
    actuals: [
      { period: "2024", value: 13.5 },
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
    id: "gdp-forecast",
    label: "Реальний ВВП України, зростання",
    unit: "%",
    source: "Мінфін",
    sourceUrl: "https://mof.gov.ua",
    horizon: "2024–2027",
    actuals: [
      { period: "2024", value: 3.2 },
      { period: "2025", value: 2.8 },
    ],
    forecast: [
      { period: "2026", value: 3.6 },
      { period: "2027", value: 4.5 },
    ],
    note: "Базовий макропрогноз Мінфіну, скоригований у березні 2026.",
  },
  {
    id: "usd-uah-forecast",
    label: "Курс USD/UAH, середній за рік",
    unit: "₴",
    source: "Мінфін",
    sourceUrl: "https://mof.gov.ua",
    horizon: "2024–2027",
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
    label: "Мінімальна зарплата (план)",
    unit: "₴",
    source: "Мінфін",
    sourceUrl: "https://mof.gov.ua",
    horizon: "2024–2027",
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
  {
    id: "imf-gdp",
    label: "МВФ: прогноз ВВП України",
    unit: "%",
    source: "МВФ",
    sourceUrl: "https://www.imf.org/en/Countries/UKR",
    horizon: "2025–2027",
    actuals: [
      { period: "2024", value: 3.2 },
      { period: "2025", value: 2.5 },
    ],
    forecast: [
      { period: "2026", value: 3.2 },
      { period: "2027", value: 4.0 },
    ],
    note: "World Economic Outlook, оновлено квітень 2026.",
  },
];

// ── Історія курсів валют (середньомісячна) ────────────────────────
export interface CurrencyHistorySeries {
  currency: string;
  flag: string;
  name: string;
  history: { date: string; value: number }[];
}

export const CURRENCY_HISTORY: CurrencyHistorySeries[] = [
  {
    currency: "USD", flag: "🇺🇸", name: "Долар США",
    history: [
      { date: "2022-01", value: 27.28 }, { date: "2022-07", value: 29.25 },
      { date: "2023-01", value: 36.57 }, { date: "2023-07", value: 36.93 },
      { date: "2024-01", value: 37.85 }, { date: "2024-07", value: 40.50 },
      { date: "2025-01", value: 41.10 }, { date: "2025-07", value: 41.30 },
      { date: "2026-01", value: 41.18 }, { date: "2026-04", value: 41.25 },
    ],
  },
  {
    currency: "EUR", flag: "🇪🇺", name: "Євро",
    history: [
      { date: "2022-01", value: 30.92 }, { date: "2022-07", value: 30.10 },
      { date: "2023-01", value: 39.50 }, { date: "2023-07", value: 40.60 },
      { date: "2024-01", value: 41.20 }, { date: "2024-07", value: 43.80 },
      { date: "2025-01", value: 43.90 }, { date: "2025-07", value: 44.50 },
      { date: "2026-01", value: 44.70 }, { date: "2026-04", value: 44.82 },
    ],
  },
  {
    currency: "PLN", flag: "🇵🇱", name: "Польський злотий",
    history: [
      { date: "2022-01", value: 6.78 }, { date: "2023-01", value: 8.41 },
      { date: "2024-01", value: 9.55 }, { date: "2025-01", value: 10.05 },
      { date: "2026-01", value: 10.22 }, { date: "2026-04", value: 10.28 },
    ],
  },
  {
    currency: "GBP", flag: "🇬🇧", name: "Фунт стерлінгів",
    history: [
      { date: "2022-01", value: 36.95 }, { date: "2023-01", value: 44.10 },
      { date: "2024-01", value: 48.20 }, { date: "2025-01", value: 51.40 },
      { date: "2026-01", value: 51.95 }, { date: "2026-04", value: 52.15 },
    ],
  },
];
