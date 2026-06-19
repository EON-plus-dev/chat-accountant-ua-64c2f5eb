/**
 * Форматер призначення платежу за стандартом ДПС.
 * Постанова НБУ №216, наказ Мінфіну №666.
 *
 * Формат: `*;<код виду>;<ЄДРПОУ платника>;<опис>;`
 * Приклад: `*;101;12345678;Сплата ЄП за I кв. 2026;`
 */

export interface PaymentPurposeParts {
  /** Код виду сплати: 101 (поточна), 121 (штраф), 140 (пеня) */
  kindCode: string;
  /** ЄДРПОУ або ІПН платника (хто платить) */
  payerCode: string;
  /** Опис: податок + період */
  description: string;
}

/**
 * Формує рядок призначення платежу за форматом ДПС.
 */
export function formatTaxPaymentPurpose(parts: PaymentPurposeParts): string {
  const { kindCode, payerCode, description } = parts;
  return `*;${kindCode};${payerCode};${description};`;
}

/**
 * Парсить рядок призначення платежу від платника (з банк-виписки).
 * Намагається витягти код виду + опис.
 */
export function parseIncomingPurpose(raw: string): {
  kindCode?: string;
  payerCode?: string;
  description: string;
  isFormatted: boolean;
} {
  if (!raw) return { description: "", isFormatted: false };

  // Стандартний формат `*;101;12345678;опис;`
  const match = raw.match(/^\*;(\d{3});(\d{8,10});(.+?);?$/);
  if (match) {
    return {
      kindCode: match[1],
      payerCode: match[2],
      description: match[3].trim(),
      isFormatted: true,
    };
  }

  return { description: raw.trim(), isFormatted: false };
}
