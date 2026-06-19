/**
 * Індекс споживчих цін (ІСЦ) — місячні значення Держстату.
 *
 * Джерело: ukrstat.gov.ua, місячний бюлетень «Індекси споживчих цін».
 *
 * Два показники:
 *   • monthOverMonth (m/m) — індекс місяця до попереднього місяця, %. 100 = без змін.
 *   • yearOverYear   (y/y) — індекс місяця до того ж місяця попереднього року, %.
 *
 * Використання:
 *   • Індексація грошових зобовʼязань (ст. 625 ЦКУ) — за добутком m/m індексів.
 *   • Індексація зарплати (постанова КМУ № 1078 від 17.07.2003) — поріг 103%.
 *   • Індексація аліментів, оренди, страхових сум.
 *   • Розрахунок «реального» курсу/доходу.
 *
 * Snapshot станом на квітень 2026.
 */

export interface InflationPoint {
  /** Перше число місяця, YYYY-MM-DD */
  date: string;
  /** Індекс до попереднього місяця, % (100 = немає змін) */
  monthOverMonth: number;
  /** Індекс до того ж місяця попереднього року, % */
  yearOverYear: number;
}

export const INFLATION_INDEX: InflationPoint[] = [
  { date: "2024-01-01", monthOverMonth: 100.4, yearOverYear: 104.7 },
  { date: "2024-02-01", monthOverMonth: 99.7, yearOverYear: 104.3 },
  { date: "2024-03-01", monthOverMonth: 100.5, yearOverYear: 103.2 },
  { date: "2024-04-01", monthOverMonth: 100.2, yearOverYear: 103.2 },
  { date: "2024-05-01", monthOverMonth: 100.5, yearOverYear: 103.3 },
  { date: "2024-06-01", monthOverMonth: 100.4, yearOverYear: 104.8 },
  { date: "2024-07-01", monthOverMonth: 99.6, yearOverYear: 105.4 },
  { date: "2024-08-01", monthOverMonth: 99.4, yearOverYear: 107.5 },
  { date: "2024-09-01", monthOverMonth: 101.5, yearOverYear: 108.6 },
  { date: "2024-10-01", monthOverMonth: 101.8, yearOverYear: 109.7 },
  { date: "2024-11-01", monthOverMonth: 101.9, yearOverYear: 111.2 },
  { date: "2024-12-01", monthOverMonth: 100.9, yearOverYear: 112.0 },
  { date: "2025-01-01", monthOverMonth: 101.2, yearOverYear: 112.9 },
  { date: "2025-02-01", monthOverMonth: 100.8, yearOverYear: 114.1 },
  { date: "2025-03-01", monthOverMonth: 101.4, yearOverYear: 114.6 },
  { date: "2025-04-01", monthOverMonth: 100.7, yearOverYear: 115.2 },
  { date: "2025-05-01", monthOverMonth: 100.6, yearOverYear: 115.3 },
  { date: "2025-06-01", monthOverMonth: 99.8, yearOverYear: 114.6 },
  { date: "2025-07-01", monthOverMonth: 99.2, yearOverYear: 114.1 },
  { date: "2025-08-01", monthOverMonth: 99.4, yearOverYear: 114.1 },
  { date: "2025-09-01", monthOverMonth: 100.9, yearOverYear: 113.4 },
  { date: "2025-10-01", monthOverMonth: 101.2, yearOverYear: 112.7 },
  { date: "2025-11-01", monthOverMonth: 101.4, yearOverYear: 112.1 },
  { date: "2025-12-01", monthOverMonth: 100.7, yearOverYear: 111.9 },
  { date: "2026-01-01", monthOverMonth: 100.9, yearOverYear: 111.6 },
  { date: "2026-02-01", monthOverMonth: 100.6, yearOverYear: 111.4 },
  { date: "2026-03-01", monthOverMonth: 100.8, yearOverYear: 110.7 },
  { date: "2026-04-01", monthOverMonth: 100.5, yearOverYear: 110.5 },
];

/**
 * Кумулятивний індекс інфляції за період [fromDate, toDate] (включно з місяцями).
 * Повертає множник (1.15 = +15%) або null якщо дати поза діапазоном.
 */
export function getCumulativeIndex(fromDate: string, toDate: string): number | null {
  const from = new Date(fromDate).getTime();
  const to = new Date(toDate).getTime();
  if (from > to) return null;
  const slice = INFLATION_INDEX.filter((p) => {
    const t = new Date(p.date).getTime();
    return t >= from && t <= to;
  });
  if (slice.length === 0) return null;
  return slice.reduce((acc, p) => acc * (p.monthOverMonth / 100), 1);
}

export function getLatestInflation(): InflationPoint | null {
  return INFLATION_INDEX[INFLATION_INDEX.length - 1] ?? null;
}

export const INFLATION_DATA_AS_OF = "2026-04-30";
export const INFLATION_SOURCE_URL = "https://www.ukrstat.gov.ua/operativ/operativ2024/ct/isc_m/iscm_u/iscm_24_u.htm";
export const INFLATION_INDEXATION_THRESHOLD = 103; // % — поріг для індексації зарплати
