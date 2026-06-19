/**
 * Розрахункові функції інвестиційного модуля
 * FIFO, WHT credit, облігації, ESOP, yield, multi-lot matching
 */
import type {
  InvestmentPosition,
  FifoResult,
  DividendResult,
  BondResult,
  EsopResult,
  YieldResult,
  MultiLotMatch,
  MultiLotFifoResult,
  PortfolioSummary,
} from "./investmentTypes";
import { multiLotBuyLots, multiLotSellPosition } from "./investmentPositions";

/**
 * FIFO P&L — ст. 170.2 ПКУ
 * P&L(UAH) = Qty × SellPrice × nbuRateSell − (Qty × BuyPrice × nbuRateBuy + Commissions)
 */
export function calculateFifoResult(pos: InvestmentPosition): FifoResult | null {
  if (pos.operationType !== "sell" || !pos.sellPriceUsd || !pos.nbuRateSell) return null;

  // Apply return of capital adjustment to cost basis
  const rocPerUnit = (pos.returnOfCapital || 0) / pos.buyQty;
  const adjustedBuyPrice = pos.buyPriceUsd - rocPerUnit;

  const revenueUsd = pos.buyQty * pos.sellPriceUsd;
  const revenueUah = revenueUsd * pos.nbuRateSell;

  const buyCostUsd = pos.buyQty * adjustedBuyPrice;
  const buyComm = pos.buyCommission || 0;
  const sellComm = pos.sellCommission || 0;
  const costUsd = buyCostUsd + buyComm + sellComm;
  const costUah = buyCostUsd * pos.nbuRateBuy
    + buyComm * pos.nbuRateBuy
    + sellComm * (pos.nbuRateSell || pos.nbuRateBuy);

  const plUsd = revenueUsd - costUsd;
  const plUah = revenueUah - costUah;

  const isLoss = plUah < 0;
  const taxablePlUah = Math.max(0, plUah);
  const pit18 = Math.round(taxablePlUah * 0.18);
  const mil5 = Math.round(taxablePlUah * 0.05);

  return {
    position: pos,
    revenueUsd, revenueUah,
    costUsd, costUah,
    plUsd, plUah,
    pit18, mil5,
    totalTax: pit18 + mil5,
    isLoss,
  };
}

/**
 * Дивідендний дохід з WHT credit — ст. 170.11.2 ПКУ
 * Залік WHT не більше 18%
 */
export function calculateDividendResult(pos: InvestmentPosition): DividendResult | null {
  if (pos.operationType !== "dividend" || !pos.grossDividendUsd || !pos.nbuRateDividend) return null;

  // ROC reduces taxable income, but WHT is withheld on full gross
  const rocAmount = pos.returnOfCapital || 0;
  const grossUsd = pos.grossDividendUsd - rocAmount;
  const grossUah = grossUsd * pos.nbuRateDividend;

  const whtRate = pos.withholdingRate || 0;
  const withheldUsd = pos.grossDividendUsd * whtRate; // WHT on full gross
  const withheldUah = withheldUsd * pos.nbuRateDividend;

  const pitDue = Math.round(grossUah * 0.18);
  const creditCapped = Math.round(Math.min(withheldUah, pitDue));
  const toPay = Math.max(0, pitDue - creditCapped);
  const milDue = Math.round(grossUah * 0.05);

  return {
    position: pos,
    grossUsd, grossUah,
    withheldUsd, withheldUah: creditCapped,
    pitDue, creditCapped, toPay, milDue,
  };
}

/**
 * Облігації / ОВДП — купонний дохід + capital gains
 * Купон: nominal × couponRate × (days/365) × nbuRate
 * Capital gains: (sellPrice - buyPrice) × qty × nbuRates
 */
export function calculateBondResult(pos: InvestmentPosition): BondResult | null {
  if (!["coupon", "sell"].includes(pos.operationType)) return null;
  if (pos.type !== "bond" && pos.type !== "ovdp") return null;

  const nominal = pos.nominal || 0;
  const couponRate = pos.couponRate || 0;
  const nbuRateCoupon = pos.nbuRateDividend || 1;

  // Coupon income (simplified: half-year coupon)
  const couponIncomeRaw = nominal * couponRate * 0.5;
  const couponIncomeUah = couponIncomeRaw * nbuRateCoupon;

  // Capital gains (if sold)
  let capitalGainUah = 0;
  if (pos.operationType === "sell" && pos.sellPriceUsd && pos.nbuRateSell) {
    const sellTotal = pos.buyQty * pos.sellPriceUsd * pos.nbuRateSell;
    const buyTotal = pos.buyQty * pos.buyPriceUsd * pos.nbuRateBuy;
    capitalGainUah = sellTotal - buyTotal;
  }

  const totalIncomeUah = couponIncomeUah + Math.max(0, capitalGainUah);
  const pit18 = Math.round(totalIncomeUah * 0.18);
  const mil5 = Math.round(totalIncomeUah * 0.05);

  return {
    position: pos,
    couponIncomeUah,
    capitalGainUah,
    totalIncomeUah,
    pit18, mil5,
    totalTax: pit18 + mil5,
  };
}

/**
 * ESOP/RSU — дохід при exercise
 * Benefit = (FMV - Strike) × Qty, конвертація за курсом НБУ на дату exercise
 */
export function calculateEsopResult(pos: InvestmentPosition): EsopResult | null {
  if (pos.operationType !== "exercise" || !pos.fmvAtExercise || !pos.strikePrice) return null;

  const nbuRate = pos.nbuRateSell || pos.nbuRateBuy;
  const benefitUsd = (pos.fmvAtExercise - pos.strikePrice) * pos.buyQty;
  const benefitUah = benefitUsd * nbuRate;

  const pit18 = Math.round(benefitUah * 0.18);
  const mil5 = Math.round(benefitUah * 0.05);

  return {
    position: pos,
    benefitUsd, benefitUah,
    pit18, mil5,
    totalTax: pit18 + mil5,
  };
}

/**
 * DeFi / P2P yield — відсотковий/стейкінг дохід
 * Дохід = yieldAmount × nbuRate; default = збиток
 */
export function calculateYieldResult(pos: InvestmentPosition): YieldResult | null {
  if (pos.operationType !== "yield" || pos.yieldAmount === undefined) return null;

  const nbuRate = pos.nbuRateDividend || pos.nbuRateBuy;
  const yieldUsd = pos.yieldAmount;
  const yieldUah = yieldUsd * nbuRate;
  const isDefault = yieldUsd < 0;

  const taxable = Math.max(0, yieldUah);
  const pit18 = Math.round(taxable * 0.18);
  const mil5 = Math.round(taxable * 0.05);

  return {
    position: pos,
    yieldUsd, yieldUah,
    pit18, mil5,
    totalTax: pit18 + mil5,
    isDefault,
  };
}

/**
 * Multi-lot FIFO matching
 * Сортує buy-лоти за датою, матчить qty поступово
 */
export function calculateMultiLotFifo(
  buyLots: InvestmentPosition[],
  sell: InvestmentPosition,
): MultiLotFifoResult | null {
  if (!sell.sellPriceUsd || !sell.nbuRateSell) return null;

  // Sort by date (DD.MM.YYYY → timestamp)
  const parseDate = (d: string) => {
    const [dd, mm, yyyy] = d.split(".");
    return new Date(`${yyyy}-${mm}-${dd}`).getTime();
  };

  const sortedLots = [...buyLots].sort((a, b) => parseDate(a.buyDate) - parseDate(b.buyDate));

  let remainingQty = sell.buyQty;
  const matches: MultiLotMatch[] = [];
  let totalCommissions = sell.sellCommission || 0;

  for (const lot of sortedLots) {
    if (remainingQty <= 0) break;

    const matchedQty = Math.min(remainingQty, lot.buyQty);
    const lotCommission = (lot.buyCommission || 0) * (matchedQty / lot.buyQty);
    totalCommissions += lotCommission;

    const revenueUah = matchedQty * sell.sellPriceUsd * sell.nbuRateSell;
    const costUah = matchedQty * lot.buyPriceUsd * lot.nbuRateBuy + lotCommission * lot.nbuRateBuy;
    const plUah = revenueUah - costUah;

    matches.push({
      lotId: lot.id,
      lotBuyDate: lot.buyDate,
      lotBuyPrice: lot.buyPriceUsd,
      lotNbuRateBuy: lot.nbuRateBuy,
      matchedQty,
      revenueUah,
      costUah,
      plUah,
    });

    remainingQty -= matchedQty;
  }

  const totalPlUah = matches.reduce((s, m) => s + m.plUah, 0);
  const totalPlUsd = matches.reduce((s, m) => s + (m.matchedQty * sell.sellPriceUsd! - m.matchedQty * m.lotBuyPrice), 0);
  const isLoss = totalPlUah < 0;
  const taxable = Math.max(0, totalPlUah);

  return {
    sellPosition: sell,
    matches,
    totalPlUah, totalPlUsd,
    pit18: Math.round(taxable * 0.18),
    mil5: Math.round(taxable * 0.05),
    totalTax: Math.round(taxable * 0.18) + Math.round(taxable * 0.05),
    isLoss,
  };
}

/**
 * Агрегований портфельний summary з усіма класами активів
 */
export function calculatePortfolioSummary(positions: InvestmentPosition[]): PortfolioSummary {
  // FIFO (stocks, ETF, crypto — exclude bonds/ovdp to avoid double counting)
  const fifoResults = positions
    .filter(p => p.operationType === "sell" && !p.relatedLotIds && p.type !== "bond" && p.type !== "ovdp")
    .map(calculateFifoResult)
    .filter(Boolean) as FifoResult[];

  // Multi-lot FIFO (e.g. Amazon)
  const multiLotResult = calculateMultiLotFifo(multiLotBuyLots, multiLotSellPosition);

  const dividendResults = positions
    .filter(p => p.operationType === "dividend")
    .map(calculateDividendResult)
    .filter(Boolean) as DividendResult[];

  const bondResults = positions
    .filter(p => ["bond", "ovdp"].includes(p.type) && ["coupon", "sell"].includes(p.operationType))
    .map(calculateBondResult)
    .filter(Boolean) as BondResult[];

  const esopResults = positions
    .filter(p => p.operationType === "exercise")
    .map(calculateEsopResult)
    .filter(Boolean) as EsopResult[];

  const yieldResults = positions
    .filter(p => p.operationType === "yield")
    .map(calculateYieldResult)
    .filter(Boolean) as YieldResult[];

  const openPositions = positions.filter(p => p.operationType === "hold");

  // FIFO: gains vs losses with carry-forward (ст. 170.2.6)
  let totalGains = fifoResults.filter(r => !r.isLoss).reduce((s, r) => s + r.plUah, 0);
  let totalLosses = fifoResults.filter(r => r.isLoss).reduce((s, r) => s + Math.abs(r.plUah), 0);

  // Add multi-lot FIFO result
  if (multiLotResult) {
    if (multiLotResult.isLoss) {
      totalLosses += Math.abs(multiLotResult.totalPlUah);
    } else {
      totalGains += multiLotResult.totalPlUah;
    }
  }

  const netRealized = Math.max(0, totalGains - totalLosses);

  const pitInvestments = Math.round(netRealized * 0.18);
  const milInvestments = Math.round(netRealized * 0.05);

  // Dividends
  const totalDivGross = dividendResults.reduce((s, r) => s + r.grossUah, 0);
  const totalWhtCredit = dividendResults.reduce((s, r) => s + r.creditCapped, 0);
  const totalPitDiv = dividendResults.reduce((s, r) => s + r.toPay, 0);
  const totalMilDiv = dividendResults.reduce((s, r) => s + r.milDue, 0);

  // Bonds + ESOP + Yield
  const totalCoupon = bondResults.reduce((s, r) => s + r.totalIncomeUah, 0);
  const totalEsop = esopResults.reduce((s, r) => s + r.benefitUah, 0);
  const totalYield = yieldResults.filter(r => !r.isDefault).reduce((s, r) => s + r.yieldUah, 0);

  const pitOther = bondResults.reduce((s, r) => s + r.pit18, 0)
    + esopResults.reduce((s, r) => s + r.pit18, 0)
    + yieldResults.reduce((s, r) => s + r.pit18, 0);
  const milOther = bondResults.reduce((s, r) => s + r.mil5, 0)
    + esopResults.reduce((s, r) => s + r.mil5, 0)
    + yieldResults.reduce((s, r) => s + r.mil5, 0);

  const openCost = openPositions.reduce((s, p) => s + (p.buyQty * p.buyPriceUsd * p.nbuRateBuy), 0);

  return {
    totalRealizedPlUah: totalGains,
    totalLossUah: totalLosses,
    netRealizedUah: netRealized,
    totalDividendsGrossUah: totalDivGross,
    totalWhtCreditUah: totalWhtCredit,
    totalCouponIncomeUah: totalCoupon,
    totalEsopBenefitUah: totalEsop,
    totalYieldIncomeUah: totalYield,
    totalPitInvestments: pitInvestments,
    totalMilInvestments: milInvestments,
    totalPitDividends: totalPitDiv,
    totalMilDividends: totalMilDiv,
    totalPitOther: pitOther,
    totalMilOther: milOther,
    totalTaxDue: pitInvestments + milInvestments + totalPitDiv + totalMilDiv + pitOther + milOther,
    openPositionsCostUah: openCost,
  };
}
