/**
 * Нормалізація українських телефонів до канонічного `+380XXXXXXXXX`.
 * Використовується для dedupe-метчингу при імпорті та пошуку.
 */

export function normalizePhone(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Локальний формат: 0XXXXXXXXX → +380XXXXXXXXX
  if (digits.length === 10 && digits.startsWith("0")) {
    return `+380${digits.slice(1)}`;
  }
  // 380XXXXXXXXX → +380XXXXXXXXX
  if (digits.length === 12 && digits.startsWith("380")) {
    return `+${digits}`;
  }
  // Вже з кодом + (взяли всі цифри)
  if (digits.length === 12) return `+${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

/** Маска для auditor-ролі: «+380•• ••• 56 78» */
export function maskPhone(raw: string): string {
  const normalized = normalizePhone(raw);
  if (normalized.length < 13) return "—";
  const last4 = normalized.slice(-4);
  return `+380•• ••• ${last4.slice(0, 2)} ${last4.slice(2)}`;
}

/** Зрозумілий формат для UI: +380 50 123 45 01 */
export function formatPhone(raw: string): string {
  const n = normalizePhone(raw);
  if (n.length !== 13) return raw || "—";
  return `${n.slice(0, 4)} ${n.slice(4, 6)} ${n.slice(6, 9)} ${n.slice(9, 11)} ${n.slice(11)}`;
}
