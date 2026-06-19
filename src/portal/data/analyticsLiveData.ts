/**
 * Централізовані «живі» цифри для сторінки /analytics, які поки що оновлюються
 * вручну. Кожне значення має `asOf` (дата зрізу) і `source` — щоб не вводити
 * користувача в оману «свіжістю», якщо реально воно стояло тиждень.
 *
 * Як тільки відповідні API під'єднаємо (НБУ, OPEC/Мінекономіки, Держстат),
 * значення тут буде заміщено хуками — публічний контракт лишається.
 */

export interface LiveValue<T = number> {
  value: T;
  asOf: string;          // ISO date "2026-05-01"
  source: string;        // human-readable
  isForecast?: boolean;
}

// ── Засідання Правління НБУ з облікової ставки ────────────────────────────
// Розклад публікується на bank.gov.ua/ua/monetary/stages
const NBU_MEETINGS_2026 = [
  "2026-01-22",
  "2026-03-05",
  "2026-04-23",
  "2026-06-11",
  "2026-07-23",
  "2026-09-10",
  "2026-10-22",
  "2026-12-10",
];

export function getNextNbuMeeting(today: Date = new Date()): { iso: string; label: string } {
  const t = today.getTime();
  const next = NBU_MEETINGS_2026.find((d) => new Date(d).getTime() >= t) ?? NBU_MEETINGS_2026[NBU_MEETINGS_2026.length - 1];
  const dt = new Date(next);
  return {
    iso: next,
    label: dt.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }),
  };
}

// ── Бензин А-95 (середнє по топ-5 мереж) ──────────────────────────────────
export const FUEL_A95: LiveValue & { weekDelta: number } = {
  value: 56.80,
  weekDelta: 0.45,
  asOf: "2026-05-08",
  source: "Мінекономіки, середнє по WOG/OKKO/SOCAR/UPG/БРСМ",
};

// ── USD/₴ — девальвація грн до долара за рік (для Lane 2) ─────────────────
export const USD_YEAR_RETURN: LiveValue = {
  value: 1.2,
  asOf: "2026-05-01",
  source: "НБУ, річна динаміка офіційного курсу",
};

// ── Інфляція ІСЦ (рік до року) ────────────────────────────────────────────
export const INFLATION_YOY: LiveValue = {
  value: 12.8,
  asOf: "2026-04-10",
  source: "Держстат, ІСЦ 03/2026 до 03/2025",
};

// ── ОВДП — gross купонна ставка топ-аукціону ──────────────────────────────
export const OVDP_GROSS: LiveValue = {
  value: 14.2,
  asOf: "2026-05-06",
  source: "Мінфін, аукціон ОВДП у грн",
};

export function formatAsOf(asOf: string): string {
  return new Date(asOf).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}
