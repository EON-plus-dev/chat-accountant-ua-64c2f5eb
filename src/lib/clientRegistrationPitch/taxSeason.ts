/**
 * Tax-season utility — touchpoint #5.
 *
 * Сезон ПДФО-знижки в Україні: декларація за попередній рік подається
 * до 31 грудня поточного року, але активний інтерес — грудень-лютий
 * (нагадування + кінець кварталу + новорічна "розчистка чеків").
 */

export const TAX_SEASON_MONTHS = [12, 1, 2] as const;

export function isTaxSeason(date: Date = new Date()): boolean {
  const m = date.getMonth() + 1;
  return (TAX_SEASON_MONTHS as readonly number[]).includes(m);
}

/**
 * Чи дає індустрія ФОПа клієнту право на ПДФО-знижку?
 * Поки що — все, крім салонів/тенісу (де знижка не передбачена ПКУ для клієнта).
 * У майбутньому розширити: медицина, освіта, страхування життя, благодійність.
 */
export function industryEligibleForTaxRefund(industry?: string): boolean {
  if (!industry) return true;
  const excluded = new Set(["salon", "tennis_club"]);
  return !excluded.has(industry);
}
