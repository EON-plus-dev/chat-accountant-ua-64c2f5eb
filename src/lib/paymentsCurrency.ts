/**
 * Утиліти для відображення валют у платежах.
 *
 * Поки `UnifiedPayment` не має поля `currency` — деривуємо валюту з контексту:
 *   • Якщо entityName/description містить ключове слово (Payoneer, Wise, Upwork, SWIFT, Stripe…) → USD/EUR
 *   • Інакше — UAH
 *
 * Wave 3 → коли поле currency з'явиться в моделі, замінити `inferCurrency` на пряме читання.
 */

import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

export type CurrencyCode = "UAH" | "USD" | "EUR" | "GBP" | "PLN";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
  GBP: "£",
  PLN: "zł",
};

// Курси на 04.2026 (мок — Wave 3 підключити NBU)
export const FX_TO_UAH: Record<CurrencyCode, number> = {
  UAH: 1,
  USD: 41.6,
  EUR: 44.8,
  GBP: 53.1,
  PLN: 10.5,
};

const FOREIGN_KEYWORDS: Array<{ re: RegExp; currency: CurrencyCode }> = [
  { re: /payoneer|upwork|stripe|paypal|swift|fiverr|toptal|braintree/i, currency: "USD" },
  { re: /wise|revolut|n26|deel/i, currency: "EUR" },
  { re: /uk\b|gbp|hmrc/i, currency: "GBP" },
  { re: /pl\b|pln|allegro/i, currency: "PLN" },
];

export function inferCurrency(payment: UnifiedPayment): CurrencyCode {
  const haystack = `${payment.entityName ?? ""} ${payment.description ?? ""}`;
  for (const { re, currency } of FOREIGN_KEYWORDS) {
    if (re.test(haystack)) return currency;
  }
  return "UAH";
}

export function toUah(amount: number, currency: CurrencyCode): number {
  return amount * (FX_TO_UAH[currency] ?? 1);
}

export function formatMoney(amount: number, currency: CurrencyCode = "UAH"): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${Math.round(amount).toLocaleString("uk-UA")}`;
}

export function formatUahApprox(amount: number, currency: CurrencyCode): string | null {
  if (currency === "UAH") return null;
  return `≈ ₴${Math.round(toUah(amount, currency)).toLocaleString("uk-UA")}`;
}
