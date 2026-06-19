/**
 * Tennis-club booking rules (Ace Court, demo-tennis-3).
 * Централізоване місце для UI-обмежень публічного віджета.
 */

export const TENNIS_RULES = {
  /** Робочі години за типом покриття (open inclusive, close exclusive). */
  hours: {
    "hard-in": { open: 7, close: 22 }, // indoor
    clay: { open: 8, close: 21 }, // outdoor
    "hard-out": { open: 8, close: 21 }, // outdoor
  } as Record<"hard-in" | "clay" | "hard-out", { open: number; close: number }>,
  /** Допустимі тривалості оренди корту, хв. */
  courtDurations: [60, 90, 120] as const,
  defaultCourtDuration: 60 as 60 | 90 | 120,
  /** Мін. час до початку. */
  leadHours: 2,
  /** Горизонт бронювання у днях від сьогодні. */
  horizonDays: 14,
  /** Макс. активних майбутніх бронювань на телефон (по всіх типах). */
  maxActivePerPhone: 3,
};

/** Об'єднане вікно по всіх покриттях — для рендеру колонок таблиці. */
export const TENNIS_GRID_HOURS: number[] = (() => {
  const open = Math.min(...Object.values(TENNIS_RULES.hours).map((h) => h.open));
  const close = Math.max(...Object.values(TENNIS_RULES.hours).map((h) => h.close));
  const out: number[] = [];
  for (let h = open; h < close; h++) out.push(h);
  return out;
})();

export type TennisSurface = "hard-in" | "clay" | "hard-out";

export function isWithinSurfaceWindow(
  surface: TennisSurface,
  hour: number,
  durationMin: number,
): boolean {
  const w = TENNIS_RULES.hours[surface];
  if (!w) return false;
  return hour >= w.open && hour + durationMin / 60 <= w.close;
}

/** Нормалізує телефон для порівняння (тільки цифри, без + і пробілів). */
export function normalizePhone(p: string): string {
  return p.replace(/\D/g, "");
}
