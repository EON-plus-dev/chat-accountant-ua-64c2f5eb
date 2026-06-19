/**
 * Єдине джерело курсів НБУ для розділу «Фінанси».
 *
 * Сьогодні — статичні значення з фіксованою датою `asOf`, щоб UI міг чесно показати чіп
 * «за курсом НБУ станом на DD.MM.YYYY». Перенесено сюди з `paymentsCurrency.ts`,
 * щоб не дублювати магічні числа в `useCabinetCashPosition` та `usePaymentsAccountsBalance`.
 *
 * Wave 3 → замінити імплементацію `useFinanceFxRates` на live-фетч НБУ
 * (`fetchNBUExchangeRate` з `lib/nbuExchangeRate.ts`) з кешем у React Query,
 * формат повернення лишається сумісним.
 */

import type { AccountCurrency } from "@/hooks/usePaymentsAccountsBalance";

/** ISO-дата, на яку зафіксовано наведені курси (UAH за 1 одиницю валюти). */
export const FINANCE_FX_AS_OF = "2026-04-01";

export const FINANCE_FX_RATES: Record<AccountCurrency, number> = {
  UAH: 1,
  USD: 41.6,
  EUR: 44.8,
};

export interface FinanceFxRatesSnapshot {
  rates: Record<AccountCurrency, number>;
  /** ISO дата котирувань. */
  asOf: string;
  /** Людино-читабельний рядок для UI-чіпа. */
  label: string;
  /** Джерело — `nbu` (поки що зафіксовано), у майбутньому — `interbank` тощо. */
  source: "nbu";
}

function formatAsOf(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * Sync-обгортка: повертає поточний знімок курсів НБУ без мережі.
 * Дозволяє hero/cards рендеритись синхронно й мати MetricContextChip
 * «Курс НБУ · станом на 01.04.2026» без миготіння лоадерів.
 */
export function useFinanceFxRates(): FinanceFxRatesSnapshot {
  return {
    rates: FINANCE_FX_RATES,
    asOf: FINANCE_FX_AS_OF,
    label: `Курс НБУ · станом на ${formatAsOf(FINANCE_FX_AS_OF)}`,
    source: "nbu",
  };
}

/** Перерахунок суми у валюті → UAH за поточними курсами. */
export function convertToUah(amount: number, currency: AccountCurrency): number {
  return amount * (FINANCE_FX_RATES[currency] ?? 1);
}
