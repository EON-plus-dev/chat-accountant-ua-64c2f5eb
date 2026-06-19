/**
 * IBAN Parser and Validator for Ukrainian Banks
 * 
 * Ukrainian IBAN structure (29 characters):
 * UA + 2 check digits + 6 MFO + 5 zeros + 14 account number
 * Example: UA903052990000026001234567890
 */

import { getBankByMfo, type UkrainianBank } from "@/config/banksConfig";

/**
 * Extract MFO code from Ukrainian IBAN
 * @param iban - Ukrainian IBAN (29 characters starting with UA)
 * @returns MFO code (6 digits) or null if invalid
 */
export function extractMfoFromIban(iban: string): string | null {
  const normalized = normalizeIban(iban);
  
  if (!normalized || normalized.length !== 29) {
    return null;
  }
  
  if (!normalized.startsWith("UA")) {
    return null;
  }
  
  // MFO is at positions 4-10 (0-indexed: 4-9)
  const mfo = normalized.substring(4, 10);
  
  // Validate MFO is numeric
  if (!/^\d{6}$/.test(mfo)) {
    return null;
  }
  
  return mfo;
}

/**
 * Get bank information from IBAN
 * @param iban - Ukrainian IBAN
 * @returns Bank object or undefined
 */
export function getBankByIban(iban: string): UkrainianBank | undefined {
  const mfo = extractMfoFromIban(iban);
  if (!mfo) return undefined;
  return getBankByMfo(mfo);
}

/**
 * Get bank short name from IBAN
 * @param iban - Ukrainian IBAN
 * @returns Bank short name or null
 */
export function getBankNameByIban(iban: string): string | null {
  const bank = getBankByIban(iban);
  return bank?.shortName || null;
}

/**
 * Get bank full name from IBAN
 * @param iban - Ukrainian IBAN
 * @returns Bank full name or null
 */
export function getBankFullNameByIban(iban: string): string | null {
  const bank = getBankByIban(iban);
  return bank?.name || null;
}

/**
 * Normalize IBAN (remove spaces, uppercase)
 */
export function normalizeIban(iban: string): string {
  return iban.replace(/\s/g, "").toUpperCase();
}

/**
 * Format IBAN with spaces for display
 * @param iban - Raw IBAN
 * @returns Formatted IBAN with spaces every 4 characters
 */
export function formatIban(iban: string): string {
  const normalized = normalizeIban(iban);
  return normalized.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Validate Ukrainian IBAN structure
 * @param iban - IBAN to validate
 * @returns Validation result with details
 */
export function validateIban(iban: string): {
  isValid: boolean;
  error?: string;
  mfo?: string;
  bank?: UkrainianBank;
} {
  const normalized = normalizeIban(iban);
  
  // Check if empty
  if (!normalized) {
    return { isValid: false, error: "IBAN не може бути порожнім" };
  }
  
  // Check country code
  if (!normalized.startsWith("UA")) {
    return { isValid: false, error: "IBAN має починатися з UA" };
  }
  
  // Check length
  if (normalized.length !== 29) {
    return { 
      isValid: false, 
      error: `Невірна довжина IBAN: ${normalized.length} символів (має бути 29)` 
    };
  }
  
  // Check format (UA + 2 digits + 25 digits)
  if (!/^UA\d{27}$/.test(normalized)) {
    return { isValid: false, error: "Невірний формат IBAN" };
  }
  
  // Extract and validate MFO
  const mfo = normalized.substring(4, 10);
  const bank = getBankByMfo(mfo);
  
  // Validate check digits using modulo 97 algorithm
  const checkDigitsValid = validateCheckDigits(normalized);
  if (!checkDigitsValid) {
    return { isValid: false, error: "Невірна контрольна сума IBAN", mfo };
  }
  
  return {
    isValid: true,
    mfo,
    bank,
  };
}

/**
 * Validate IBAN check digits using ISO 7064 Mod 97-10
 */
function validateCheckDigits(iban: string): boolean {
  // Move first 4 characters to end
  const rearranged = iban.substring(4) + iban.substring(0, 4);
  
  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  let numericIban = "";
  for (const char of rearranged) {
    if (/[A-Z]/.test(char)) {
      numericIban += (char.charCodeAt(0) - 55).toString();
    } else {
      numericIban += char;
    }
  }
  
  // Calculate modulo 97 using BigInt for large numbers
  try {
    const mod = BigInt(numericIban) % BigInt(97);
    return mod === BigInt(1);
  } catch {
    return false;
  }
}

/**
 * Extract account number from IBAN
 * @param iban - Ukrainian IBAN
 * @returns Account number (14 digits) or null
 */
export function extractAccountFromIban(iban: string): string | null {
  const normalized = normalizeIban(iban);
  
  if (normalized.length !== 29 || !normalized.startsWith("UA")) {
    return null;
  }
  
  // Account number is last 14 digits
  return normalized.substring(15);
}

/**
 * Parse full IBAN info
 */
export function parseIban(iban: string): {
  isValid: boolean;
  normalized?: string;
  formatted?: string;
  mfo?: string;
  bank?: UkrainianBank;
  bankName?: string;
  accountNumber?: string;
  error?: string;
} {
  const validation = validateIban(iban);
  
  if (!validation.isValid) {
    return { isValid: false, error: validation.error };
  }
  
  const normalized = normalizeIban(iban);
  
  return {
    isValid: true,
    normalized,
    formatted: formatIban(normalized),
    mfo: validation.mfo,
    bank: validation.bank,
    bankName: validation.bank?.shortName,
    accountNumber: extractAccountFromIban(iban) || undefined,
  };
}

/**
 * Check if string looks like a partial IBAN
 */
export function isPartialIban(value: string): boolean {
  const normalized = normalizeIban(value);
  return normalized.startsWith("UA") && normalized.length < 29 && normalized.length > 2;
}

/**
 * Get IBAN input mask for formatting
 */
export function getIbanMask(): string {
  return "UA00 0000 0000 0000 0000 0000 000";
}
