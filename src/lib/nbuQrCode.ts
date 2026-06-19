/**
 * Генератор QR-коду оплати у форматі EMV Merchant Presented QR Code (NBU).
 * Стандарт EMVCo + рекомендації НБУ для платежів на бюджетні рахунки.
 *
 * Формат: TLV (Tag-Length-Value), де:
 *   - Tag = 2 цифри
 *   - Length = 2 цифри (довжина значення)
 *   - Value = саме значення
 * Наприкінці — CRC16-CCITT (poly 0x1021, init 0xFFFF) над усім рядком + "6304".
 */

function formatTLV(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${tag}${len}${value}`;
}

/** CRC16-CCITT (False): poly 0x1021, init 0xFFFF, без рефлексії, XOR-out 0x0000. */
function crc16ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Транслітерація для merchant name (EMV допускає лише латиницю/цифри). */
function translit(str: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie",
    ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l",
    м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
    ю: "iu", я: "ia", "ʼ": "", "'": "",
  };
  return str
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9 .\-]/gi, "")
    .toUpperCase()
    .slice(0, 25);
}

export interface EmvPayload {
  iban: string;
  recipientName: string;
  edrpou: string;
  amount: number;
  purpose: string;
  city?: string;
}

export function buildEmvQrPayload(data: EmvPayload): string {
  const iban = data.iban.replace(/\s+/g, "");
  // Merchant Account Information (tag 26): GUID НБУ + IBAN + ЄДРПОУ.
  const merchantAccount =
    formatTLV("00", "UA.GOV.BANK.GOV") +
    formatTLV("01", iban) +
    formatTLV("02", data.edrpou);

  // Additional Data (tag 62): призначення платежу — підтег 08 (Purpose of Transaction).
  const purposeTrim = data.purpose.slice(0, 99);
  const additional = formatTLV("08", purposeTrim);

  const amountStr = data.amount.toFixed(2);

  const payloadNoCrc =
    formatTLV("00", "01") + // Payload Format Indicator
    formatTLV("01", "12") + // Static QR with fixed amount
    formatTLV("26", merchantAccount) +
    formatTLV("52", "9311") + // MCC: Tax payments
    formatTLV("53", "980") + // UAH
    formatTLV("54", amountStr) +
    formatTLV("58", "UA") +
    formatTLV("59", translit(data.recipientName) || "BUDGET") +
    formatTLV("60", translit(data.city ?? "Kyiv") || "KYIV") +
    formatTLV("62", additional);

  const crcInput = `${payloadNoCrc}6304`;
  const crc = crc16ccitt(crcInput);
  return `${crcInput}${crc}`;
}
