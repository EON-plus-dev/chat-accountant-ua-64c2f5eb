/**
 * Centralized Currency Configuration (ISO 4217)
 * Supports NBU exchange rates integration
 */

export interface Currency {
  code: string;        // ISO 4217 alpha code: UAH, USD, EUR
  numericCode: string; // ISO 4217 numeric code: 980, 840, 978
  name: string;        // "Українська гривня", "Долар США"
  symbol: string;      // "₴", "$", "€"
  decimalPlaces: number; // Number of decimal places (usually 2)
  isActive: boolean;   // Whether available for selection
  isDefault?: boolean; // Default currency for the system
  nbuCode?: number;    // NBU API currency code (r030)
  sortOrder: number;
}

/**
 * Supported currencies list
 * Based on ISO 4217 with NBU integration codes
 */
export const CURRENCIES: Currency[] = [
  { 
    code: "UAH", 
    numericCode: "980", 
    name: "Українська гривня", 
    symbol: "₴", 
    decimalPlaces: 2, 
    isActive: true, 
    isDefault: true,
    nbuCode: undefined, // UAH is base currency
    sortOrder: 1
  },
  { 
    code: "USD", 
    numericCode: "840", 
    name: "Долар США", 
    symbol: "$", 
    decimalPlaces: 2, 
    isActive: true,
    nbuCode: 840,
    sortOrder: 2
  },
  { 
    code: "EUR", 
    numericCode: "978", 
    name: "Євро", 
    symbol: "€", 
    decimalPlaces: 2, 
    isActive: true,
    nbuCode: 978,
    sortOrder: 3
  },
  { 
    code: "PLN", 
    numericCode: "985", 
    name: "Польський злотий", 
    symbol: "zł", 
    decimalPlaces: 2, 
    isActive: true,
    nbuCode: 985,
    sortOrder: 4
  },
  { 
    code: "GBP", 
    numericCode: "826", 
    name: "Фунт стерлінгів", 
    symbol: "£", 
    decimalPlaces: 2, 
    isActive: true,
    nbuCode: 826,
    sortOrder: 5
  },
  { 
    code: "CHF", 
    numericCode: "756", 
    name: "Швейцарський франк", 
    symbol: "Fr", 
    decimalPlaces: 2, 
    isActive: true,
    nbuCode: 756,
    sortOrder: 6
  },
  { 
    code: "CZK", 
    numericCode: "203", 
    name: "Чеська крона", 
    symbol: "Kč", 
    decimalPlaces: 2, 
    isActive: true,
    nbuCode: 203,
    sortOrder: 7
  },
  { 
    code: "CAD", 
    numericCode: "124", 
    name: "Канадський долар", 
    symbol: "C$", 
    decimalPlaces: 2, 
    isActive: false, // Inactive but available
    nbuCode: 124,
    sortOrder: 8
  },
  { 
    code: "JPY", 
    numericCode: "392", 
    name: "Японська єна", 
    symbol: "¥", 
    decimalPlaces: 0, // JPY has no decimal places
    isActive: false,
    nbuCode: 392,
    sortOrder: 9
  },
  { 
    code: "CNY", 
    numericCode: "156", 
    name: "Китайський юань", 
    symbol: "¥", 
    decimalPlaces: 2, 
    isActive: false,
    nbuCode: 156,
    sortOrder: 10
  },
];

// ============= Type for position currency (backward compatible) =============

export type PositionCurrency = "UAH" | "USD" | "EUR" | "PLN" | "GBP" | "CHF" | "CZK";

// ============= Helper Functions =============

/**
 * Get all active currencies
 */
export function getActiveCurrencies(): Currency[] {
  return CURRENCIES.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get currency by code
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  const currency = getCurrencyByCode(code);
  return currency?.symbol || code;
}

/**
 * Get default currency (UAH)
 */
export function getDefaultCurrency(): Currency {
  return CURRENCIES.find(c => c.isDefault) || CURRENCIES[0];
}

/**
 * Check if currency is foreign (non-UAH)
 */
export function isForeignCurrency(code: string): boolean {
  return code !== "UAH";
}

/**
 * Format currency options for select components
 */
export function getCurrencyOptions(): { value: string; label: string }[] {
  return getActiveCurrencies().map(c => ({
    value: c.code,
    label: `${c.symbol} ${c.code}`,
  }));
}

/**
 * Format currency options with full names
 */
export function getCurrencyOptionsDetailed(): { value: string; label: string; symbol: string }[] {
  return getActiveCurrencies().map(c => ({
    value: c.code,
    label: `${c.symbol} ${c.code} — ${c.name}`,
    symbol: c.symbol,
  }));
}

/**
 * Format amount in currency
 */
export function formatCurrency(amount: number, code: string = "UAH"): string {
  const currency = getCurrencyByCode(code);
  const symbol = currency?.symbol || code;
  const decimalPlaces = currency?.decimalPlaces ?? 2;
  
  const formatted = amount.toLocaleString("uk-UA", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  
  return `${formatted} ${symbol}`;
}

/**
 * Format amount with currency symbol at start
 */
export function formatCurrencyWithSymbol(amount: number, code: string = "UAH"): string {
  const currency = getCurrencyByCode(code);
  const symbol = currency?.symbol || code;
  const decimalPlaces = currency?.decimalPlaces ?? 2;
  
  const formatted = amount.toLocaleString("uk-UA", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  
  return `${symbol}${formatted}`;
}

/**
 * Get currency symbols map (for backward compatibility)
 */
export const CURRENCY_SYMBOLS: Record<string, string> = CURRENCIES.reduce(
  (acc, c) => ({ ...acc, [c.code]: c.symbol }),
  {} as Record<string, string>
);
