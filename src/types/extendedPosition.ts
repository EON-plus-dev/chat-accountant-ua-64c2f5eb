/**
 * Extended DocumentPosition Type
 * Adds discount, VAT, currency, and other enterprise features
 */

import type { DocumentPosition } from "@/config/documentTemplateGenerator";
import type { PositionCurrency } from "@/config/currencyConfig";

export type DiscountType = "percent" | "fixed";
export type VatRate = 0 | 7 | 20; // 0% - no VAT, 7% - reduced, 20% - standard

// Re-export for backward compatibility
export type { PositionCurrency } from "@/config/currencyConfig";

export interface ExtendedDocumentPosition extends DocumentPosition {
  // Discount fields
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount?: number; // Calculated discount in currency
  
  // VAT fields
  vatRate?: VatRate;
  vatAmount?: number; // Calculated VAT in currency
  
  // Net/gross amounts (in original currency)
  netAmount?: number; // Amount after discount, before VAT
  grossAmount?: number; // Final amount including VAT
  
  // Currency fields (NEW)
  currency?: PositionCurrency; // Currency of price (default: UAH)
  exchangeRate?: number; // NBU exchange rate on document date
  exchangeRateDate?: string; // Date of the exchange rate
  priceInUAH?: number; // Price converted to UAH
  amountInUAH?: number; // Base amount in UAH (quantity × priceInUAH)
  netAmountInUAH?: number; // Net amount in UAH
  vatAmountInUAH?: number; // VAT in UAH
  grossAmountInUAH?: number; // Final amount in UAH
}

/**
 * Calculate position amounts with discount, VAT, and currency conversion
 */
export function calculatePositionAmounts(
  position: ExtendedDocumentPosition
): ExtendedDocumentPosition {
  const baseAmount = position.quantity * position.price;
  const currency = position.currency || "UAH";
  const exchangeRate = position.exchangeRate || 1;
  
  // Calculate discount (in original currency)
  let discountAmount = 0;
  if (position.discountValue && position.discountValue > 0) {
    if (position.discountType === "percent") {
      discountAmount = baseAmount * (position.discountValue / 100);
    } else {
      discountAmount = position.discountValue;
    }
  }
  
  // Net amount (after discount, before VAT) in original currency
  const netAmount = Math.max(0, baseAmount - discountAmount);
  
  // Calculate VAT (in original currency)
  const vatRate = position.vatRate || 0;
  const vatAmount = netAmount * (vatRate / 100);
  
  // Gross amount (final) in original currency
  const grossAmount = netAmount + vatAmount;
  
  // UAH calculations (for non-UAH currencies)
  let priceInUAH = position.price;
  let amountInUAH = baseAmount;
  let netAmountInUAH = netAmount;
  let vatAmountInUAH = vatAmount;
  let grossAmountInUAH = grossAmount;
  
  if (currency !== "UAH" && exchangeRate > 0) {
    priceInUAH = position.price * exchangeRate;
    amountInUAH = baseAmount * exchangeRate;
    netAmountInUAH = netAmount * exchangeRate;
    vatAmountInUAH = vatAmount * exchangeRate;
    grossAmountInUAH = grossAmount * exchangeRate;
  }
  
  return {
    ...position,
    amount: baseAmount, // Original amount without discount/VAT
    discountAmount,
    netAmount,
    vatAmount,
    grossAmount,
    // UAH conversions
    priceInUAH,
    amountInUAH,
    netAmountInUAH,
    vatAmountInUAH,
    grossAmountInUAH,
  };
}

/**
 * Calculate totals from array of positions (always in UAH for accounting)
 */
export function calculatePositionTotals(positions: ExtendedDocumentPosition[]) {
  return positions.reduce(
    (acc, pos) => {
      const calculated = calculatePositionAmounts(pos);
      return {
        // Original currency totals
        subtotal: acc.subtotal + (calculated.amount || 0),
        totalDiscount: acc.totalDiscount + (calculated.discountAmount || 0),
        totalNet: acc.totalNet + (calculated.netAmount || 0),
        totalVat: acc.totalVat + (calculated.vatAmount || 0),
        totalGross: acc.totalGross + (calculated.grossAmount || calculated.amount || 0),
        // UAH totals (for accounting)
        subtotalUAH: acc.subtotalUAH + (calculated.amountInUAH || calculated.amount || 0),
        totalDiscountUAH: acc.totalDiscountUAH + ((calculated.discountAmount || 0) * (pos.exchangeRate || 1)),
        totalNetUAH: acc.totalNetUAH + (calculated.netAmountInUAH || calculated.netAmount || 0),
        totalVatUAH: acc.totalVatUAH + (calculated.vatAmountInUAH || calculated.vatAmount || 0),
        totalGrossUAH: acc.totalGrossUAH + (calculated.grossAmountInUAH || calculated.grossAmount || calculated.amount || 0),
      };
    },
    { 
      subtotal: 0, totalDiscount: 0, totalNet: 0, totalVat: 0, totalGross: 0,
      subtotalUAH: 0, totalDiscountUAH: 0, totalNetUAH: 0, totalVatUAH: 0, totalGrossUAH: 0
    }
  );
}
