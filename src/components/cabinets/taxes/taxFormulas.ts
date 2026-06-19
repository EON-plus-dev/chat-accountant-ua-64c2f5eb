/**
 * Спільні формули та повні людські назви податків — щоб картки, таблиця
 * нарахувань та інші представлення говорили одною мовою.
 */
import type { TaxType } from "@/config/paymentsConfig";

export const taxFormula: Record<TaxType, string> = {
  ep: "Дохід × 5% (ФОП 3 група)",
  esv: "МЗП × 22% × N міс. (фікс.)",
  "military-fop": "Дохід × 1% (з 01.01.2025)",
  pdfo: "Зарплата × 18%",
  military: "Зарплата × 5% (з 12.2024)",
  "esv-employer": "Зарплата × 22% (роботодавець)",
  other: "—",
};

export const taxFullName: Record<TaxType, string> = {
  ep: "Єдиний податок (ЄП), 3 група",
  esv: "Єдиний соціальний внесок (ЄСВ за себе)",
  "military-fop": "Військовий збір ФОП‑єдинника",
  pdfo: "ПДФО із заробітної плати",
  military: "Військовий збір із заробітної плати",
  "esv-employer": "ЄСВ нарахований роботодавцем",
  other: "Інший податок",
};

/** Людський опис «через N дн.» / «прострочено N дн.» / «сьогодні» / «завтра». */
export function humanizeDeadline(daysToDeadline: number): string {
  if (daysToDeadline === 0) return "сьогодні";
  if (daysToDeadline === 1) return "завтра";
  if (daysToDeadline === -1) return "прострочено 1 дн.";
  if (daysToDeadline < 0) return `прострочено ${Math.abs(daysToDeadline)} дн.`;
  return `через ${daysToDeadline} дн.`;
}
