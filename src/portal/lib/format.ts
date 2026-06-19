/**
 * Уніфіковані форматтери для overview-сторінки.
 * Завжди використовуйте їх замість «вручну» зібраних рядків.
 */

const MONTHS_UK = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

/**
 * Хвилини → «коротко» / «1 хв» / «5 хв».
 * Ніяких "0 хв" чи "хвилин".
 */
export function formatMinutes(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "коротко";
  if (n < 1) return "коротко";
  return `${Math.round(n)} хв`;
}

/**
 * Дата → «1 травня 2026» (єдиний формат для overview).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_UK[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Короткий формат дати — «1 травня».
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_UK[d.getMonth()]}`;
}

/**
 * Дні → «1 день» / «2 дн.» / «5 дн.».
 */
export function formatDays(n: number): string {
  if (n === 1) return "1 день";
  return `${n} дн.`;
}
