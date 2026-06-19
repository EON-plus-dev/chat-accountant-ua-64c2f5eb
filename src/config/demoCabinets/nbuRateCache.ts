// Phase 6 — NBU FX rate cache snapshot. Demo only.
// Демонструє кешовані курси НБУ на ключові дати року для повторюваних розрахунків.
// У реальній системі: Edge Function → bank.gov.ua API → Supabase storage.

export interface NbuRateSnapshot {
  currency: string;
  rate: number;
  date: string; // ISO yyyy-mm-dd
  fetchedAt: string; // коли отримано з НБУ
  source: "nbu_api" | "nbu_cache";
}

export interface NbuRateUsage {
  txId: string;
  txDate: string;
  txDescription: string;
  currency: string;
  amountForeign: number;
  rate: number;
  amountUah: number;
  module: "investments" | "fin_monitoring" | "kik" | "income_book";
}

const buildYearEndDate = (year: number) => `${year}-12-31`;

/** Ключові курси НБУ на кінець кварталу для звітного року */
export function getYearKeyRates(year: number): NbuRateSnapshot[] {
  const fetched = `${year + 1}-01-15T08:00:00.000Z`;
  return [
    { currency: "USD", rate: 41.85, date: buildYearEndDate(year), fetchedAt: fetched, source: "nbu_cache" },
    { currency: "EUR", rate: 44.12, date: buildYearEndDate(year), fetchedAt: fetched, source: "nbu_cache" },
    { currency: "GBP", rate: 52.18, date: buildYearEndDate(year), fetchedAt: fetched, source: "nbu_cache" },
    { currency: "PLN", rate: 10.34, date: buildYearEndDate(year), fetchedAt: fetched, source: "nbu_cache" },
    { currency: "CHF", rate: 46.92, date: buildYearEndDate(year), fetchedAt: fetched, source: "nbu_cache" },
    { currency: "CAD", rate: 30.21, date: buildYearEndDate(year), fetchedAt: fetched, source: "nbu_cache" },
  ];
}

/** Демо-приклади транзакцій з прив'язкою до курсів НБУ на дату операції */
export function getDemoRateUsage(year: number): NbuRateUsage[] {
  return [
    {
      txId: "fx-1",
      txDate: `${year}-03-15`,
      txDescription: "Дивіденди Apple Inc.",
      currency: "USD",
      amountForeign: 420,
      rate: 39.12,
      amountUah: 16_430,
      module: "investments",
    },
    {
      txId: "fx-2",
      txDate: `${year}-04-22`,
      txDescription: "Зарплата ТОВ «Польща Sp. z o.o.»",
      currency: "PLN",
      amountForeign: 12_000,
      rate: 9.84,
      amountUah: 118_080,
      module: "fin_monitoring",
    },
    {
      txId: "fx-3",
      txDate: `${year}-06-30`,
      txDescription: "Прибуток Northwave OÜ за II кв.",
      currency: "EUR",
      amountForeign: 48_000,
      rate: 43.56,
      amountUah: 2_090_880,
      module: "kik",
    },
    {
      txId: "fx-4",
      txDate: `${year}-09-12`,
      txDescription: "Продаж акцій Microsoft (FIFO)",
      currency: "USD",
      amountForeign: 8_240,
      rate: 41.32,
      amountUah: 340_516,
      module: "investments",
    },
    {
      txId: "fx-5",
      txDate: `${year}-11-08`,
      txDescription: "Гонорар Stripe Connect",
      currency: "USD",
      amountForeign: 3_120,
      rate: 41.78,
      amountUah: 130_354,
      module: "fin_monitoring",
    },
  ];
}
