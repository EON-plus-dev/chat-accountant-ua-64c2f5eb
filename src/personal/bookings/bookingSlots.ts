import { stableHash } from "@/personal/orders/offerHelpers";

/** Детерміністичний генератор слотів за offerId+date (без Math.random). */
export function getSlots(offerId: string, dateIso: string): string[] {
  const seed = stableHash(`${offerId}:${dateIso}`);
  const base = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"];
  // Маскуємо: ~40% слотів — зайняті
  return base.filter((_, i) => ((seed >> i) & 1) === 1).slice(0, 6);
}

export function getNextDays(count = 7): { iso: string; label: string }[] {
  const months = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
  const wd = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  // База — 2026-04-09 (сьогодні в демо)
  const base = new Date("2026-04-09");
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = i === 0 ? "Сьогодні" : i === 1 ? "Завтра" : `${wd[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    return { iso, label };
  });
}
