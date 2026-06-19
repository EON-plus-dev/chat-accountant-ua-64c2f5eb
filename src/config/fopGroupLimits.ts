/**
 * Ліміти доходу для ФОП на 2026 рік.
 *
 * Розраховані як кратні мінімальній заробітній платі станом на 01.01.2026 (₴8 000):
 *   1 група — 167 МЗП = 1 336 000 ₴/рік
 *   2 група — 834 МЗП = 6 672 000 ₴/рік
 *   3 група — 1167 МЗП = 9 336 000 ₴/рік
 *
 * Джерело: ст. 291.4 ПКУ (актуальна редакція). Якщо МЗП на 01.01.2026 буде уточнена —
 * оновити константу `MIN_WAGE_2026` тут.
 */

export const MIN_WAGE_2026 = 8_000;

export const FOP_GROUP_LIMITS_2026: Record<1 | 2 | 3, number> = {
  1: 167 * MIN_WAGE_2026, // 1 336 000
  2: 834 * MIN_WAGE_2026, // 6 672 000
  3: 1167 * MIN_WAGE_2026, // 9 336 000
};

export function getFopGroupLimit(group?: 1 | 2 | 3): number | null {
  if (!group) return null;
  return FOP_GROUP_LIMITS_2026[group] ?? null;
}

export type FopLimitTone = "ok" | "warn" | "danger";

export function getFopLimitTone(percent: number): FopLimitTone {
  if (percent >= 80) return "danger";
  if (percent >= 60) return "warn";
  return "ok";
}
