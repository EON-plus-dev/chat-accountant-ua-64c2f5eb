/**
 * IBAN утиліти для українських рахунків (UAxx + 27 цифр = 29 символів).
 */

/**
 * Форматує IBAN у читабельний вигляд: `UAXX XXXX XX XXXXXXXXXXXXXXXXXX`
 * Приклад: `UA213996220000026007233566001` → `UA21 3996 22 0000026007233566001`
 */
export function formatIban(iban: string): string {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (clean.length !== 29 || !clean.startsWith("UA")) {
    // Не валідний UA-IBAN — повертаємо як є з пробілами по 4
    return clean.replace(/(.{4})/g, "$1 ").trim();
  }
  // UA21 — контрольні; 399622 — МФО (6); далі — рахунок (19)
  const country = clean.slice(0, 4);
  const mfoPart1 = clean.slice(4, 8);
  const mfoPart2 = clean.slice(8, 10);
  const account = clean.slice(10);
  return `${country} ${mfoPart1} ${mfoPart2} ${account}`;
}

/**
 * Маскує IBAN, лишаючи перші 6 і останні 4 цифри (для compact view).
 * Не використовуйте у вікнах оплати — там потрібно показувати повний IBAN.
 */
export function maskIban(iban: string): string {
  if (!iban) return "";
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 12) return clean;
  return `${clean.slice(0, 6)} •••• ${clean.slice(-4)}`;
}

/**
 * Валідація формату UA-IBAN (без контрольної суми mod-97).
 */
export function isValidUaIbanFormat(iban: string): boolean {
  if (!iban) return false;
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  return /^UA\d{27}$/.test(clean);
}

/**
 * Витягує МФО з IBAN (позиції 5–10 у цифрах після UAxx).
 * Зверніть увагу: МФО офіційно скасовано НБУ з 2017 — використовується лише довідково.
 */
export function extractMfoFromIban(iban: string): string | null {
  if (!iban) return null;
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (clean.length < 10) return null;
  return clean.slice(4, 10);
}
