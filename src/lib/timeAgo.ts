const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < MINUTE) return "щойно";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} хв тому`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} год тому`;
  if (diff < WEEK) {
    const d = Math.floor(diff / DAY);
    return `${d} ${d === 1 ? "день" : d < 5 ? "дні" : "днів"} тому`;
  }
  if (diff < MONTH) {
    const w = Math.floor(diff / WEEK);
    return `${w} ${w === 1 ? "тиждень" : w < 5 ? "тижні" : "тижнів"} тому`;
  }
  if (diff < YEAR) {
    const m = Math.floor(diff / MONTH);
    return `${m} ${m === 1 ? "місяць" : m < 5 ? "місяці" : "місяців"} тому`;
  }
  const y = Math.floor(diff / YEAR);
  return `${y} ${y === 1 ? "рік" : y < 5 ? "роки" : "років"} тому`;
}
