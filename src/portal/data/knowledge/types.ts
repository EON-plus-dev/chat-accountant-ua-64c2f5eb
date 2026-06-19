/**
 * Knowledge layer — типобезпечний реєстр фактів порталу.
 * Це єдине джерело правди для UI /analytics, кабінетних калькуляторів і AI-консультанта.
 */

export type FactConfidence =
  | "official"   // живий фід з офіційного джерела (НБУ API, Держстат)
  | "snapshot"   // ручний знімок з офіційного джерела, дата фіксована
  | "estimate";  // ринкова оцінка / агрегат

export type FactCategory =
  | "macro"        // інфляція, ставка, ВВП
  | "tax"          // ПДФО, ВЗ, ЄСВ, ставки ЄП
  | "wage"         // МЗП, прожитковий мін, мін.ЄСВ
  | "fx"           // курси валют
  | "rate"         // ОВДП, депозити (агрегат)
  | "fuel"
  | "labor"        // salary benchmarks (агрегат)
  | "mortgage";

export interface SeriesPoint {
  /** ISO date "2026-04" або "2026-04-10" або "2026" */
  period: string;
  value: number;
}

export interface ForecastPoint extends SeriesPoint {
  scenario?: "base" | "optimistic" | "pessimistic";
}

export interface KnowledgeFact {
  id: string;
  category: FactCategory;
  /** Коротка назва для UI */
  label: string;
  /** Числове значення (одиниця в `unit`) */
  value: number;
  /** "%", "₴", "₴/міс", "грн/л" тощо */
  unit: string;
  /** Форматоване значення для UI ("14.5%", "8 647 ₴") — опційно */
  display?: string;
  /** ISO date зрізу значення, напр. "2026-04-10" */
  asOf: string;
  /** До якої дати значення вважається актуальним (опц.) */
  validUntil?: string;
  source: string;
  sourceUrl: string;
  confidence: FactConfidence;
  /** Чому це важливо — для AI-контексту і UI-тултіпа */
  whyItMatters?: string;
  /** Формула, якщо значення похідне */
  formula?: string;
  /** Інші факти, від яких залежить це */
  derivedFrom?: string[];
  /** Часовий ряд історії (опц.). Остання точка має збігатись з `value`. */
  series?: SeriesPoint[];
  /** Дата наступного офіційного оновлення (опц.) */
  nextUpdate?: string;
}

export interface KnowledgeForecast {
  id: string;
  factId?: string; // якщо це прогноз для існуючого факту
  label: string;
  unit: string;
  source: string;
  sourceUrl: string;
  horizon: string;
  asOf: string;
  actuals: SeriesPoint[];
  forecast: ForecastPoint[];
  note?: string;
}
