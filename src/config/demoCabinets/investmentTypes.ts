/**
 * Типи для інвестиційного модуля
 * Підтримує: акції, ETF, облігації, ОВДП, крипто, ESOP/RSU, DeFi, P2P
 */

export interface CorporateAction {
  type: "split" | "merger" | "spinoff";
  date: string;
  ratio?: number;
  newTicker?: string;
  description?: string;
}

export interface InvestmentPosition {
  id: string;
  asset: string;
  ticker: string;
  type: "stock" | "etf" | "crypto" | "bond" | "dividend" | "ovdp" | "esop" | "p2p" | "defi" | "reit" | "fund" | "metal";
  operationType: "sell" | "hold" | "dividend" | "coupon" | "exercise" | "yield";
  currency?: "USD" | "EUR" | "UAH" | "GBP";
  buyDate: string;
  buyQty: number;
  buyPriceUsd: number;
  buyCommission: number;
  nbuRateBuy: number;
  sellDate?: string;
  sellPriceUsd?: number;
  sellCommission?: number;
  nbuRateSell?: number;
  // Dividends
  grossDividendUsd?: number;
  withholdingRate?: number;
  dividendDate?: string;
  nbuRateDividend?: number;
  // Bonds / ОВДП
  couponRate?: number;
  nominal?: number;
  couponDate?: string;
  // ESOP/RSU
  strikePrice?: number;
  fmvAtExercise?: number;
  exerciseDate?: string;
  grantDate?: string;
  // DeFi / P2P
  yieldAmount?: number;
  yieldSource?: string;
  // Corporate actions
  corporateAction?: CorporateAction;
  // Return of Capital
  returnOfCapital?: number;
  // Multi-lot
  relatedLotIds?: string[];
  // Status
  status: "declared" | "in-portfolio" | "pending";
  sector?: string;
  country?: string;
}

// ---- Result types ----

export interface FifoResult {
  position: InvestmentPosition;
  revenueUsd: number;
  revenueUah: number;
  costUsd: number;
  costUah: number;
  plUsd: number;
  plUah: number;
  pit18: number;
  mil5: number;
  totalTax: number;
  isLoss: boolean;
}

export interface DividendResult {
  position: InvestmentPosition;
  grossUsd: number;
  grossUah: number;
  withheldUsd: number;
  withheldUah: number;
  pitDue: number;
  creditCapped: number;
  toPay: number;
  milDue: number;
}

export interface BondResult {
  position: InvestmentPosition;
  couponIncomeUah: number;
  capitalGainUah: number;
  totalIncomeUah: number;
  pit18: number;
  mil5: number;
  totalTax: number;
}

export interface EsopResult {
  position: InvestmentPosition;
  benefitUsd: number;
  benefitUah: number;
  pit18: number;
  mil5: number;
  totalTax: number;
}

export interface YieldResult {
  position: InvestmentPosition;
  yieldUsd: number;
  yieldUah: number;
  pit18: number;
  mil5: number;
  totalTax: number;
  isDefault: boolean;
}

export interface MultiLotMatch {
  lotId: string;
  lotBuyDate: string;
  lotBuyPrice: number;
  lotNbuRateBuy: number;
  matchedQty: number;
  revenueUah: number;
  costUah: number;
  plUah: number;
}

export interface MultiLotFifoResult {
  sellPosition: InvestmentPosition;
  matches: MultiLotMatch[];
  totalPlUah: number;
  totalPlUsd: number;
  pit18: number;
  mil5: number;
  totalTax: number;
  isLoss: boolean;
}

export interface PortfolioSummary {
  totalRealizedPlUah: number;
  totalLossUah: number;
  netRealizedUah: number;
  totalDividendsGrossUah: number;
  totalWhtCreditUah: number;
  totalCouponIncomeUah: number;
  totalEsopBenefitUah: number;
  totalYieldIncomeUah: number;
  totalPitInvestments: number;
  totalMilInvestments: number;
  totalPitDividends: number;
  totalMilDividends: number;
  totalPitOther: number;
  totalMilOther: number;
  totalTaxDue: number;
  openPositionsCostUah: number;
}
