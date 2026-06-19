/**
 * Barrel export — інвестиційний модуль
 * Рефакторинг: types, positions, engine в окремих файлах
 */
export type {
  InvestmentPosition,
  CorporateAction,
  FifoResult,
  DividendResult,
  BondResult,
  EsopResult,
  YieldResult,
  MultiLotMatch,
  MultiLotFifoResult,
  PortfolioSummary,
} from "./investmentTypes";

export {
  investmentPositions,
  multiLotBuyLots,
  multiLotSellPosition,
} from "./investmentPositions";

export {
  calculateFifoResult,
  calculateDividendResult,
  calculateBondResult,
  calculateEsopResult,
  calculateYieldResult,
  calculateMultiLotFifo,
  calculatePortfolioSummary,
} from "./investmentEngine";
