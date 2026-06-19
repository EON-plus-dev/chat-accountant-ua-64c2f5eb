export type FuelChainKind = 'major' | 'regional' | 'premium' | 'discount';

export interface FuelChain {
  id: string;
  slug: string;
  name: string;
  kind: FuelChainKind;
  website: string;
  hotline: string;
  stationCount: number;
  regions: number;
  fuels: ('A95' | 'A95+' | 'A98' | 'DT' | 'DT+' | 'LPG' | 'CNG')[];
  loyalty?: string;
  b2bCard: boolean;
  b2bDiscount?: string;
  fleetIntegration: string[];
  popular: boolean;
  notes?: string;
}

export const FUEL_AS_OF = 'квітень 2026';
export const FUEL_PRICE_SOURCE = 'https://index.minfin.com.ua/markets/fuel/';

export const FUEL_CHAIN_KIND_LABEL: Record<FuelChainKind, string> = {
  major: 'Загальнонаціональна',
  regional: 'Регіональна',
  premium: 'Премʼєм',
  discount: 'Дискаунтер',
};

export const FUEL_CHAINS: FuelChain[] = [
  {
    id: 'wog',
    slug: 'wog',
    name: 'WOG',
    kind: 'major',
    website: 'https://wog.ua',
    hotline: '0 800 50 04 31',
    stationCount: 480,
    regions: 24,
    fuels: ['A95', 'A95+', 'A98', 'DT', 'DT+', 'LPG'],
    loyalty: 'WOG PRIDE — кешбек до 5%',
    b2bCard: true,
    b2bDiscount: 'WOG FleetCard: −0.5...−1.5 ₴/л залежно від обсягу',
    fleetIntegration: ['1С', 'BAS', 'M.E.Doc', 'Vchasno'],
    popular: true,
    notes: 'Лідер ринку. Власні Mustang кафе. Зарядні станції e-Drive на 220+ АЗС.',
  },
  {
    id: 'okko',
    slug: 'okko',
    name: 'OKKO',
    kind: 'major',
    website: 'https://okko.ua',
    hotline: '0 800 30 50 50',
    stationCount: 410,
    regions: 24,
    fuels: ['A95', 'A95+', 'A98', 'DT', 'DT+', 'LPG'],
    loyalty: 'Fishka — бали + партнерська мережа',
    b2bCard: true,
    b2bDiscount: 'OKKO FleetCard: −0.5...−2.0 ₴/л',
    fleetIntegration: ['1С', 'BAS', 'M.E.Doc', 'Vchasno'],
    popular: true,
    notes: 'Преміальна палива Pulls. Власна ресторанна мережа A la minute. EV-зарядки.',
  },
  {
    id: 'upg',
    slug: 'upg',
    name: 'UPG',
    kind: 'major',
    website: 'https://upg.ua',
    hotline: '0 800 50 51 50',
    stationCount: 230,
    regions: 22,
    fuels: ['A95', 'A95+', 'DT', 'DT+', 'LPG'],
    loyalty: 'UPG Family — знижки',
    b2bCard: true,
    b2bDiscount: 'UPG FleetCard',
    fleetIntegration: ['1С', 'BAS', 'M.E.Doc'],
    popular: true,
  },
  {
    id: 'socar',
    slug: 'socar',
    name: 'SOCAR',
    kind: 'premium',
    website: 'https://socar.ua',
    hotline: '0 800 30 13 03',
    stationCount: 95,
    regions: 18,
    fuels: ['A95', 'A95+', 'A98', 'DT', 'DT+', 'LPG'],
    loyalty: 'SOCAR Plus',
    b2bCard: true,
    b2bDiscount: 'SOCAR Corporate',
    fleetIntegration: ['1С', 'M.E.Doc', 'Vchasno'],
    popular: true,
    notes: 'Премʼєм-палива Nano. Контроль якості — лабораторія SOCAR.',
  },
  {
    id: 'klo',
    slug: 'klo',
    name: 'KLO',
    kind: 'major',
    website: 'https://klo.ua',
    hotline: '0 800 50 51 52',
    stationCount: 115,
    regions: 14,
    fuels: ['A95', 'A95+', 'DT', 'DT+', 'LPG'],
    loyalty: 'KLO Club',
    b2bCard: true,
    b2bDiscount: 'KLO Fleet',
    fleetIntegration: ['1С', 'BAS', 'M.E.Doc'],
    popular: false,
    notes: 'Сильна сітка в Києві та Центральній Україні.',
  },
  {
    id: 'shell',
    slug: 'shell',
    name: 'Shell',
    kind: 'premium',
    website: 'https://shell.ua',
    hotline: '0 800 30 04 70',
    stationCount: 165,
    regions: 19,
    fuels: ['A95', 'A95+', 'A98', 'DT', 'DT+'],
    loyalty: 'Shell ClubSmart',
    b2bCard: true,
    b2bDiscount: 'Shell Card — спецтарифи + міжнародне покриття',
    fleetIntegration: ['1С', 'BAS', 'M.E.Doc', 'Vchasno'],
    popular: true,
    notes: 'Преміальна V-Power. Міжнародна паливна картка Shell Card — приймається в 30+ країнах.',
  },
  {
    id: 'brsm',
    slug: 'brsm',
    name: 'БРСМ-Нафта',
    kind: 'regional',
    website: 'https://brsm.com.ua',
    hotline: '0 800 50 30 50',
    stationCount: 165,
    regions: 16,
    fuels: ['A95', 'DT', 'LPG'],
    b2bCard: true,
    fleetIntegration: ['1С', 'M.E.Doc'],
    popular: false,
  },
  {
    id: 'anp',
    slug: 'anp',
    name: 'ANP',
    kind: 'regional',
    website: 'https://anp.ua',
    hotline: '0 800 50 80 90',
    stationCount: 75,
    regions: 11,
    fuels: ['A95', 'A95+', 'DT', 'DT+', 'LPG'],
    b2bCard: true,
    fleetIntegration: ['1С', 'M.E.Doc'],
    popular: false,
  },
  {
    id: 'avias',
    slug: 'avias',
    name: 'Avias',
    kind: 'regional',
    website: 'https://avias.com.ua',
    hotline: '0 800 50 20 30',
    stationCount: 230,
    regions: 18,
    fuels: ['A95', 'DT', 'LPG'],
    b2bCard: true,
    fleetIntegration: ['1С'],
    popular: false,
    notes: 'Дискаунт-сегмент Концерну Галнафтогаз (OKKO).',
  },
  {
    id: 'amic',
    slug: 'amic',
    name: 'AMIC Energy',
    kind: 'regional',
    website: 'https://amic.ua',
    hotline: '0 800 30 50 90',
    stationCount: 105,
    regions: 14,
    fuels: ['A95', 'A95+', 'DT', 'DT+', 'LPG'],
    loyalty: 'AMIC Smart',
    b2bCard: true,
    b2bDiscount: 'AMIC Fleet',
    fleetIntegration: ['1С', 'M.E.Doc'],
    popular: false,
  },
];

/* ─────────── Ціни ─────────── */

export type FuelType = 'A95' | 'A95+' | 'A98' | 'DT' | 'DT+' | 'LPG';

export const FUEL_TYPE_LABEL: Record<FuelType, string> = {
  A95: 'А-95',
  'A95+': 'А-95+',
  A98: 'А-98',
  DT: 'ДП',
  'DT+': 'ДП+',
  LPG: 'Газ (LPG)',
};

export interface FuelPriceRow {
  chainId: string;
  prices: Partial<Record<FuelType, number>>;
}

/** Середні ціни по мережах (₴/л), квітень 2026. Джерело: index.minfin. */
export const FUEL_PRICES: FuelPriceRow[] = [
  { chainId: 'wog', prices: { A95: 56.99, 'A95+': 58.99, A98: 60.99, DT: 55.49, 'DT+': 56.99, LPG: 28.49 } },
  { chainId: 'okko', prices: { A95: 56.99, 'A95+': 58.99, A98: 61.49, DT: 55.49, 'DT+': 57.49, LPG: 28.49 } },
  { chainId: 'upg', prices: { A95: 55.49, 'A95+': 57.49, DT: 54.49, 'DT+': 55.99, LPG: 27.99 } },
  { chainId: 'socar', prices: { A95: 57.49, 'A95+': 59.99, A98: 61.99, DT: 55.99, 'DT+': 57.99, LPG: 28.99 } },
  { chainId: 'klo', prices: { A95: 55.99, 'A95+': 57.99, DT: 54.99, 'DT+': 56.49, LPG: 27.99 } },
  { chainId: 'shell', prices: { A95: 57.99, 'A95+': 59.99, A98: 62.49, DT: 56.49, 'DT+': 58.49 } },
  { chainId: 'brsm', prices: { A95: 54.49, DT: 53.49, LPG: 27.49 } },
  { chainId: 'anp', prices: { A95: 55.49, 'A95+': 57.49, DT: 54.49, 'DT+': 55.99, LPG: 27.99 } },
  { chainId: 'avias', prices: { A95: 53.99, DT: 52.99, LPG: 26.99 } },
  { chainId: 'amic', prices: { A95: 55.49, 'A95+': 57.49, DT: 54.49, 'DT+': 55.99, LPG: 27.99 } },
];

export function getFuelStats(fuel: FuelType) {
  const vals = FUEL_PRICES.map((r) => r.prices[fuel]).filter((v): v is number => typeof v === 'number');
  if (!vals.length) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { min, max, avg, count: vals.length };
}
