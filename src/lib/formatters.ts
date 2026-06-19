/**
 * Centralized formatting utilities for Ukrainian FinTech application
 * Format: spaces for thousands separator, comma for decimals
 */

/**
 * Format number with Ukrainian locale (space as thousands separator)
 * @example formatNumber(4532000) => "4 532 000"
 * @example formatNumber(12.5, 1) => "12,5"
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(value);
};

/**
 * Format currency in Ukrainian hryvnia format
 * @example formatCurrency(85000) => "85 000 грн"
 * @example formatCurrency(1760.5) => "1 760,50 грн"
 */
export const formatCurrency = (value: number, showDecimals = false): string => {
  const formatted = formatNumber(value, showDecimals ? 2 : 0);
  return `${formatted} грн`;
};

/**
 * Format currency with symbol (for KPI cards where space is limited)
 * @example formatCurrencySymbol(85000) => "₴85 000"
 */
export const formatCurrencySymbol = (value: number): string => {
  return `₴${formatNumber(value)}`;
};

/**
 * Format percentage with optional sign
 * @example formatPercent(12) => "+12 %"
 * @example formatPercent(-3) => "−3 %"
 * @example formatPercent(12, false) => "12 %"
 */
export const formatPercent = (value: number, showSign = true): string => {
  const sign = showSign ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
  const absValue = Math.abs(value);
  // Use comma for decimal separator
  const formatted = absValue % 1 === 0 
    ? absValue.toString() 
    : absValue.toFixed(1).replace(".", ",");
  return `${sign}${formatted} %`;
};

/**
 * Format date in Ukrainian format
 * @example formatDate(new Date()) => "12.03.2025"
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format date with time
 * @example formatDateTime(new Date()) => "12.03.2025, 14:30"
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format relative date
 * @example formatRelativeDate(new Date()) => "Сьогодні"
 */
export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Сьогодні";
  if (diffDays === 1) return "Вчора";
  if (diffDays < 7) return `${diffDays} дні тому`;
  return formatDate(d);
};

/**
 * Universal value formatter
 * @example formatValue(85000, "currency") => "85 000 грн"
 * @example formatValue(12, "percent") => "12 %"
 * @example formatValue(5, "days") => "5 днів"
 */
export const formatValue = (
  value: number,
  format?: "currency" | "number" | "percent" | "days"
): string => {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value, false);
    case "days":
      return `${value} ${getDaysWord(value)}`;
    case "number":
    default:
      return formatNumber(value);
  }
};

/**
 * Get correct Ukrainian word form for days
 */
export const getDaysWord = (n: number): string => {
  const abs = Math.abs(n);
  const lastTwo = abs % 100;
  const lastOne = abs % 10;
  
  if (lastTwo >= 11 && lastTwo <= 19) return "днів";
  if (lastOne === 1) return "день";
  if (lastOne >= 2 && lastOne <= 4) return "дні";
  return "днів";
};

/**
 * Compact number format for large values
 * @example formatCompact(1500000) => "1,5 млн"
 * @example formatCompact(2500) => "2,5 тис"
 */
export const formatCompact = (value: number): string => {
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `${millions.toFixed(1).replace(".", ",")} млн`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `${thousands.toFixed(1).replace(".", ",")} тис`;
  }
  return formatNumber(value);
};
