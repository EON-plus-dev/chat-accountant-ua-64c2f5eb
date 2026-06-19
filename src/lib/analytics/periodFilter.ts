/**
 * PERIOD FILTER — фільтрація даних по період + вибір базової лінії для порівняння
 */

import type { AnalyticsDataSet } from "./dataLayer";

export type PeriodType = "today" | "week" | "month" | "quarter" | "year" | "custom";

/** Базова лінія для порівняння */
export type CompareBaseline = "previous_period" | "previous_year" | "custom";

export interface PeriodResult {
  current: AnalyticsDataSet;
  previous: AnalyticsDataSet;
  periodLabel: string;
  previousLabel: string;
  periodRange: { from: Date; to: Date };
  previousRange: { from: Date; to: Date };
}

const MONTH_NAMES_UA = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

/** Короткі підписи періодів — для UI бейджів/кнопок */
export const PERIOD_LABELS: Record<PeriodType, string> = {
  today: "Сьогодні",
  week: "Тиждень",
  month: "Місяць",
  quarter: "Квартал",
  year: "Рік",
  custom: "Довільний",
};

/** Підписи базової лінії для UI */
export const BASELINE_LABELS: Record<CompareBaseline, string> = {
  previous_period: "Попередній період",
  previous_year: "Той самий період торік",
  custom: "Власний період",
};

/**
 * Визначає останній місяць з даними (reference point)
 */
export function findLatestDataDate(data: AnalyticsDataSet): Date {
  let latest = new Date(2025, 0, 1); // fallback

  for (const r of data.incomeRecords) {
    const d = new Date(r.date);
    if (d > latest) latest = d;
  }
  for (const p of data.contractorPayments) {
    const d = new Date(p.date);
    if (d > latest) latest = d;
  }
  for (const p of data.salaryPayments) {
    const d = new Date(p.scheduledDate);
    if (d > latest) latest = d;
  }
  return latest;
}

/**
 * Обчислює діапазон дат для періоду
 */
export function getPeriodRange(period: PeriodType, refDate: Date): { from: Date; to: Date } {
  const y = refDate.getFullYear();
  const m = refDate.getMonth();
  const d = refDate.getDate();

  switch (period) {
    case "today": {
      const start = new Date(y, m, d, 0, 0, 0);
      const end = new Date(y, m, d, 23, 59, 59);
      return { from: start, to: end };
    }
    case "week": {
      const dow = (refDate.getDay() + 6) % 7;
      const monday = new Date(y, m, d - dow, 0, 0, 0);
      const sunday = new Date(y, m, d - dow + 6, 23, 59, 59);
      return { from: monday, to: sunday };
    }
    case "month":
      return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0, 23, 59, 59) };
    case "quarter": {
      const qStart = Math.floor(m / 3) * 3;
      return { from: new Date(y, qStart, 1), to: new Date(y, qStart + 3, 0, 23, 59, 59) };
    }
    case "year":
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31, 23, 59, 59) };
    case "custom":
      return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0, 23, 59, 59) };
  }
}

/**
 * Обчислює базову лінію для порівняння на основі поточного діапазону.
 * - previous_period: попередній період такої ж тривалості
 * - previous_year: той самий період торік (зміщення -1 рік)
 * - custom: переданий користувачем діапазон
 */
export function getBaselineRange(
  period: PeriodType,
  currentRange: { from: Date; to: Date },
  baseline: CompareBaseline,
  customBaselineRange?: { from: Date; to: Date } | null,
): { from: Date; to: Date } {
  if (baseline === "custom" && customBaselineRange) {
    return customBaselineRange;
  }

  if (baseline === "previous_year") {
    const f = new Date(currentRange.from);
    const t = new Date(currentRange.to);
    f.setFullYear(f.getFullYear() - 1);
    t.setFullYear(t.getFullYear() - 1);
    return { from: f, to: t };
  }

  // previous_period — за тривалістю поточного
  return getPreviousPeriodRange(period, currentRange);
}

function getPreviousPeriodRange(
  period: PeriodType,
  currentRange: { from: Date; to: Date },
): { from: Date; to: Date } {
  const from = currentRange.from;
  const y = from.getFullYear();
  const m = from.getMonth();
  const d = from.getDate();

  switch (period) {
    case "today": {
      const prev = new Date(y, m, d - 1);
      return {
        from: new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), 0, 0, 0),
        to: new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), 23, 59, 59),
      };
    }
    case "week": {
      const prevStart = new Date(y, m, d - 7);
      const prevEnd = new Date(y, m, d - 1, 23, 59, 59);
      return { from: prevStart, to: prevEnd };
    }
    case "month":
      return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0, 23, 59, 59) };
    case "quarter":
      return { from: new Date(y, m - 3, 1), to: new Date(y, m, 0, 23, 59, 59) };
    case "year":
      return { from: new Date(y - 1, 0, 1), to: new Date(y - 1, 11, 31, 23, 59, 59) };
    case "custom": {
      // Дзеркальне зміщення назад
      const durationMs = currentRange.to.getTime() - currentRange.from.getTime();
      const prevTo = new Date(currentRange.from.getTime() - 1);
      const prevFrom = new Date(prevTo.getTime() - durationMs);
      return { from: prevFrom, to: prevTo };
    }
  }
}

function isInRange(dateStr: string, from: Date, to: Date): boolean {
  const d = new Date(dateStr);
  return d >= from && d <= to;
}

export function filterDataByRange(data: AnalyticsDataSet, from: Date, to: Date): AnalyticsDataSet {
  return {
    ...data,
    incomeRecords: data.incomeRecords.filter(r => isInRange(r.date, from, to)),
    documents: data.documents,
    taxPayments: data.taxPayments.filter(t => {
      if (t.paidDate) return isInRange(t.paidDate, from, to);
      return isInRange(t.deadline, from, to);
    }),
    contractorPayments: data.contractorPayments.filter(p => isInRange(p.date, from, to)),
    salaryPayments: data.salaryPayments.filter(p => isInRange(p.scheduledDate, from, to)),
  };
}

function buildPeriodLabel(period: PeriodType, range: { from: Date; to: Date }): string {
  const y = range.from.getFullYear();
  const m = range.from.getMonth();
  const d = range.from.getDate();

  switch (period) {
    case "today":
      return `Сьогодні, ${String(d).padStart(2, "0")}.${String(m + 1).padStart(2, "0")}.${y}`;
    case "week": {
      const to = range.to;
      return `Тиждень ${String(d).padStart(2, "0")}.${String(m + 1).padStart(2, "0")} – ${String(to.getDate()).padStart(2, "0")}.${String(to.getMonth() + 1).padStart(2, "0")}.${y}`;
    }
    case "month":
      return `${MONTH_NAMES_UA[m]} ${y}`;
    case "quarter": {
      const q = Math.floor(m / 3) + 1;
      return `${q} квартал ${y}`;
    }
    case "year":
      return `${y} рік`;
    case "custom": {
      const fmt = (dt: Date) =>
        `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
      return `${fmt(range.from)} — ${fmt(range.to)}`;
    }
  }
}

/**
 * Будує підпис базової лінії на основі реального діапазону.
 * previous_year → "Грудень 2024", previous_period → "Листопад 2025", custom → "10.01–20.01.2025"
 */
function buildBaselineLabel(
  period: PeriodType,
  baseline: CompareBaseline,
  baselineRange: { from: Date; to: Date },
): string {
  if (baseline === "custom") {
    return buildPeriodLabel("custom", baselineRange);
  }
  // Для previous_year і previous_period використовуємо ту ж логіку label, що й для current,
  // бо діапазон уже обчислений правильно. Це автоматично дасть "Грудень 2024" для YoY-місяця.
  return buildPeriodLabel(period, baselineRange);
}

/**
 * Фільтрує дані за обраним періодом + базовою лінією.
 */
export function filterByPeriod(
  data: AnalyticsDataSet,
  period: PeriodType,
  baseline: CompareBaseline = "previous_period",
  customBaselineRange?: { from: Date; to: Date } | null,
): PeriodResult {
  const refDate = findLatestDataDate(data);
  const currentRange = getPeriodRange(period, refDate);
  const baselineRange = getBaselineRange(period, currentRange, baseline, customBaselineRange);

  return {
    current: filterDataByRange(data, currentRange.from, currentRange.to),
    previous: filterDataByRange(data, baselineRange.from, baselineRange.to),
    periodLabel: buildPeriodLabel(period, currentRange),
    previousLabel: buildBaselineLabel(period, baseline, baselineRange),
    periodRange: currentRange,
    previousRange: baselineRange,
  };
}

/**
 * Фільтрує дані за довільним діапазоном дат + базовою лінією.
 */
export function filterByCustomRange(
  data: AnalyticsDataSet,
  from: Date,
  to: Date,
  baseline: CompareBaseline = "previous_period",
  customBaselineRange?: { from: Date; to: Date } | null,
): PeriodResult {
  const currentRange = { from, to };
  const baselineRange = getBaselineRange("custom", currentRange, baseline, customBaselineRange);

  return {
    current: filterDataByRange(data, from, to),
    previous: filterDataByRange(data, baselineRange.from, baselineRange.to),
    periodLabel: buildPeriodLabel("custom", currentRange),
    previousLabel: buildBaselineLabel("custom", baseline, baselineRange),
    periodRange: currentRange,
    previousRange: baselineRange,
  };
}
