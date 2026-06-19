/**
 * Утиліти для розрахунку робочих днів у Україні.
 *
 * ПКУ оперує робочими днями для більшості процесуальних строків:
 * - 15 р.д. — відповідь на письмовий запит ДПС (п. 73.3 ПКУ)
 * - 10 р.д. — заперечення до акту перевірки (п. 86.7 ПКУ)
 * - 10 р.д. — адміністративне оскарження ППР (п. 56.3 ПКУ)
 *
 * Враховує суботу/неділю та офіційні державні свята України 2024–2027.
 */

import { differenceInCalendarDays, isWeekend, addDays, formatISO } from "date-fns";

/**
 * Офіційні державні свята України (вихідні дні згідно ст. 73 КЗпП).
 * Перелік на 2024–2027. Великдень та Трійця рухомі — додано конкретні дати.
 */
const UA_PUBLIC_HOLIDAYS: ReadonlySet<string> = new Set([
  // 2024
  "2024-01-01", "2024-01-07", "2024-03-08",
  "2024-05-01", "2024-05-05", "2024-05-09", "2024-06-23",
  "2024-06-28", "2024-07-15", "2024-08-24", "2024-10-14", "2024-12-25",
  // 2025
  "2025-01-01", "2025-01-07", "2025-03-08",
  "2025-04-20", "2025-05-01", "2025-05-09", "2025-06-08",
  "2025-06-28", "2025-07-15", "2025-08-24", "2025-10-14", "2025-12-25",
  // 2026
  "2026-01-01", "2026-01-07", "2026-03-08",
  "2026-04-12", "2026-05-01", "2026-05-09", "2026-05-31",
  "2026-06-28", "2026-07-15", "2026-08-24", "2026-10-14", "2026-12-25",
  // 2027
  "2027-01-01", "2027-01-07", "2027-03-08",
  "2027-05-01", "2027-05-02", "2027-05-09", "2027-06-20",
  "2027-06-28", "2027-07-15", "2027-08-24", "2027-10-14", "2027-12-25",
]);

/**
 * Перевіряє, чи є дата робочим днем в Україні
 * (не вихідний і не офіційне свято).
 */
export function isBusinessDayUA(date: Date): boolean {
  if (isWeekend(date)) return false;
  const iso = formatISO(date, { representation: "date" });
  return !UA_PUBLIC_HOLIDAYS.has(iso);
}

/**
 * Кількість робочих днів між двома датами (від `from` до `to`, включно з to, без from).
 * Якщо `to` < `from` — повертає від'ємне значення.
 */
export function differenceInBusinessDaysUA(to: Date, from: Date): number {
  const sign = to >= from ? 1 : -1;
  const start = sign === 1 ? from : to;
  const end = sign === 1 ? to : from;

  let count = 0;
  let current = addDays(start, 1);
  while (current <= end) {
    if (isBusinessDayUA(current)) count++;
    current = addDays(current, 1);
  }
  return sign * count;
}

/**
 * Додає N робочих днів до дати (N може бути від'ємним).
 */
export function addBusinessDaysUA(date: Date, n: number): Date {
  if (n === 0) return date;
  const sign = n > 0 ? 1 : -1;
  let remaining = Math.abs(n);
  let current = date;
  while (remaining > 0) {
    current = addDays(current, sign);
    if (isBusinessDayUA(current)) remaining--;
  }
  return current;
}

/**
 * Зручне форматування «Лишилось N робочих днів».
 */
export function formatBusinessDaysLeft(days: number): string {
  const abs = Math.abs(days);
  const word =
    abs === 1 ? "робочий день" : abs >= 2 && abs <= 4 ? "робочі дні" : "робочих днів";
  return `${abs} ${word}`;
}

/**
 * Універсальна різниця в днях з урахуванням типу дедлайну.
 */
export function daysUntilDeadline(
  deadline: Date,
  type: "business" | "calendar" = "business",
  from: Date = new Date(),
): number {
  return type === "business"
    ? differenceInBusinessDaysUA(deadline, from)
    : differenceInCalendarDays(deadline, from);
}
