/**
 * Фінансовий радар — статичні дані для MVP
 * Фаза 2 — підключення НБУ Open API
 */

// ── МЕТА ─────────────────────────────────────────────────────────
export interface FinderDataMeta {
  lastUpdated: string;
  lastUpdatedISO: string;
  source: string;
  nextUpdateNote: string;
  isLive: boolean;
}

// ── КУРСИ ВАЛЮТ ───────────────────────────────────────────────────
export interface BankCurrencyRate {
  bankId: string;
  bankName: string;
  buyRate?: number;
  sellRate?: number;
  cardRate?: number;
  isOnline: boolean;
  note?: string;
}

export interface CurrencyRate {
  currency: string;
  currencyName: string;
  flag: string;
  nbuRate: number;
  nbuChange: number;
  nbuChangePercent: number;
  banks: BankCurrencyRate[];
}

export const CURRENCY_RATES: { meta: FinderDataMeta; rates: CurrencyRate[] } = {
  meta: {
    lastUpdated: '10 квітня 2026, 10:00',
    lastUpdatedISO: '2026-04-10T10:00:00',
    source: 'НБУ офіційний курс + дані банків',
    nextUpdateNote: 'Оновлюється щодня о 10:00',
    isLive: false,
  },
  rates: [
    {
      currency: 'USD', currencyName: 'Долар США', flag: '🇺🇸',
      nbuRate: 41.25, nbuChange: +0.12, nbuChangePercent: +0.29,
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', buyRate: 40.80, sellRate: 41.70, cardRate: 41.25, isOnline: true },
        { bankId: 'privat', bankName: 'Приватбанк', buyRate: 40.50, sellRate: 41.90, cardRate: 41.25, isOnline: false },
        { bankId: 'oschadbank', bankName: 'Ощадбанк', buyRate: 40.30, sellRate: 42.10, cardRate: 41.25, isOnline: false },
        { bankId: 'pumb', bankName: 'ПУМБ', buyRate: 40.70, sellRate: 41.80, cardRate: 41.25, isOnline: false },
        { bankId: 'ukrsib', bankName: 'Укрсиббанк', buyRate: 40.60, sellRate: 41.85, cardRate: 41.25, isOnline: false },
        { bankId: 'wise', bankName: 'Wise', buyRate: undefined, sellRate: undefined, cardRate: 41.08, isOnline: true, note: 'Комісія 0.41%' },
      ],
    },
    {
      currency: 'EUR', currencyName: 'Євро', flag: '🇪🇺',
      nbuRate: 44.82, nbuChange: -0.08, nbuChangePercent: -0.18,
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', buyRate: 44.20, sellRate: 45.40, cardRate: 44.82, isOnline: true },
        { bankId: 'privat', bankName: 'Приватбанк', buyRate: 44.00, sellRate: 45.60, cardRate: 44.82, isOnline: false },
        { bankId: 'oschadbank', bankName: 'Ощадбанк', buyRate: 43.80, sellRate: 45.80, cardRate: 44.82, isOnline: false },
        { bankId: 'pumb', bankName: 'ПУМБ', buyRate: 44.10, sellRate: 45.50, cardRate: 44.82, isOnline: false },
        { bankId: 'wise', bankName: 'Wise', buyRate: undefined, sellRate: undefined, cardRate: 44.64, isOnline: true, note: 'Комісія 0.41%' },
      ],
    },
    {
      currency: 'GBP', currencyName: 'Фунт стерлінгів', flag: '🇬🇧',
      nbuRate: 52.15, nbuChange: +0.23, nbuChangePercent: +0.44,
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', buyRate: 51.40, sellRate: 52.90, cardRate: 52.15, isOnline: true },
        { bankId: 'privat', bankName: 'Приватбанк', buyRate: 51.20, sellRate: 53.10, cardRate: 52.15, isOnline: false },
      ],
    },
    {
      currency: 'PLN', currencyName: 'Польський злотий', flag: '🇵🇱',
      nbuRate: 10.28, nbuChange: -0.03, nbuChangePercent: -0.29,
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', buyRate: 10.10, sellRate: 10.46, cardRate: 10.28, isOnline: true },
        { bankId: 'privat', bankName: 'Приватбанк', buyRate: 10.05, sellRate: 10.51, cardRate: 10.28, isOnline: false },
      ],
    },
    {
      currency: 'CZK', currencyName: 'Чеська крона', flag: '🇨🇿',
      nbuRate: 1.74, nbuChange: 0, nbuChangePercent: 0,
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', buyRate: undefined, sellRate: undefined, cardRate: 1.74, isOnline: true },
      ],
    },
  ],
};

// ── ФІНАНСОВІ ІНДЕКСИ ─────────────────────────────────────────────
export interface FinancialIndex {
  id: string;
  name: string;
  shortName: string;
  value: string;
  numericValue: number;
  unit: string;
  change?: number;
  changeDate?: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  whyItMatters: string;
  history: { date: string; value: number }[];
  source: string;
  sourceUrl: string;
  updateFrequency: string;
  nextUpdateDate?: string;
}

export const FINANCIAL_INDICES: { meta: FinderDataMeta; indices: FinancialIndex[] } = {
  meta: {
    lastUpdated: '10 квітня 2026, 10:00',
    lastUpdatedISO: '2026-04-10T10:00:00',
    source: 'НБУ, Держстат, Мінфін',
    nextUpdateNote: 'Різна частота для кожного індексу',
    isLive: false,
  },
  indices: [
    {
      id: 'nbu-rate', name: 'Облікова ставка НБУ', shortName: 'Облікова ставка',
      value: '14.5%', numericValue: 14.5, unit: '% річних',
      change: 0, changeDate: '5 березня 2026', trend: 'stable',
      description: 'Ключова процентна ставка НБУ — базова для визначення вартості грошей в економіці.',
      whyItMatters: 'Від облікової ставки залежать ставки по депозитах, кредитах і ОВДП. При зниженні — банки зменшують ставки по депозитах.',
      history: [
        { date: '2024-01', value: 15.0 }, { date: '2024-04', value: 14.5 },
        { date: '2024-07', value: 13.0 }, { date: '2024-10', value: 13.0 },
        { date: '2025-01', value: 13.5 }, { date: '2025-02', value: 14.5 },
        { date: '2025-07', value: 14.0 }, { date: '2026-01', value: 14.5 },
        { date: '2026-03', value: 14.5 },
      ],
      source: 'НБУ', sourceUrl: 'https://bank.gov.ua',
      updateFrequency: '8 разів на рік (засідання Правління НБУ)',
      nextUpdateDate: '11 червня 2026',
    },
    {
      id: 'inflation', name: 'Інфляція (ІСЦ)', shortName: 'Інфляція',
      value: '12.8%', numericValue: 12.8, unit: '% (рік до року)',
      change: +0.4, changeDate: 'Березень 2026', trend: 'up',
      description: 'Індекс споживчих цін — зростання цін на товари і послуги споживчого кошика.',
      whyItMatters: 'Інфляція знецінює гривневі заощадження. Якщо депозит нижче за інфляцію — ви втрачаєте купівельну спроможність.',
      history: [
        { date: '2024-01', value: 5.3 }, { date: '2024-04', value: 3.2 },
        { date: '2024-07', value: 9.8 }, { date: '2024-10', value: 11.2 },
        { date: '2025-01', value: 12.4 }, { date: '2025-07', value: 11.5 },
        { date: '2025-12', value: 12.4 }, { date: '2026-03', value: 12.8 },
      ],
      source: 'Держстат', sourceUrl: 'https://ukrstat.gov.ua',
      updateFrequency: 'Щомісяця, ~10 числа',
      nextUpdateDate: '10 травня 2026',
    },
    {
      id: 'min-wage', name: 'Мінімальна зарплата', shortName: 'Мінзарплата',
      value: '8 647 ₴', numericValue: 8647, unit: 'грн/міс',
      change: 647, changeDate: '1 квітня 2025', trend: 'up',
      description: 'Законодавчо встановлений мінімум оплати праці в Україні.',
      whyItMatters: 'Від мінзарплати рахується мінімальний ЄСВ для ФОП (22% = 1 902 ₴/міс) і єдиний податок 1 і 2 груп.',
      history: [
        { date: '2022-01', value: 6500 }, { date: '2022-10', value: 6700 },
        { date: '2023-04', value: 6700 }, { date: '2023-10', value: 7100 },
        { date: '2024-04', value: 8000 }, { date: '2025-04', value: 8647 },
      ],
      source: 'КМУ', sourceUrl: 'https://www.kmu.gov.ua',
      updateFrequency: 'Рішення КМУ (зазвичай 1-2 рази на рік)',
    },
    {
      id: 'min-esv', name: 'Мінімальний ЄСВ', shortName: 'Мін. ЄСВ',
      value: '1 902 ₴', numericValue: 1902, unit: 'грн/міс',
      change: 142, changeDate: '1 квітня 2025', trend: 'up',
      description: 'Мінімальний єдиний соціальний внесок для ФОП — 22% від мінімальної зарплати.',
      whyItMatters: 'Обов\'язковий щомісячний платіж для ФОП незалежно від доходу (крім призупинення діяльності).',
      history: [
        { date: '2022-01', value: 1430 }, { date: '2023-04', value: 1474 },
        { date: '2024-04', value: 1760 }, { date: '2025-04', value: 1902 },
      ],
      source: 'ПФУ', sourceUrl: 'https://www.pfu.gov.ua',
      updateFrequency: 'При зміні мінзарплати',
    },
    {
      id: 'ovdp-yield', name: 'Дохідність ОВДП (3 міс)', shortName: 'ОВДП 3 міс',
      value: '14.2%', numericValue: 14.2, unit: '% річних',
      change: -0.3, changeDate: 'Березень 2026', trend: 'down',
      description: 'Середня дохідність облігацій держпозики на 3 місяці — безризикова ставка для гривневих інвестицій.',
      whyItMatters: 'Дохід від ОВДП звільнений від ПДФО та ВЗ — ефективна ставка 14.2% vs ~11.6% по депозиту після оподаткування.',
      history: [
        { date: '2024-01', value: 16.5 }, { date: '2024-04', value: 15.8 },
        { date: '2024-07', value: 15.2 }, { date: '2024-10', value: 14.8 },
        { date: '2025-01', value: 14.5 }, { date: '2025-03', value: 14.2 },
        { date: '2025-09', value: 13.8 }, { date: '2026-03', value: 14.2 },
      ],
      source: 'Мінфін України', sourceUrl: 'https://mof.gov.ua',
      updateFrequency: 'Щотижня (первинні аукціони по вівторках)',
    },
    {
      id: 'subsistence', name: 'Прожитковий мінімум', shortName: 'Прожитковий мін.',
      value: '3 028 ₴', numericValue: 3028, unit: 'грн/міс',
      change: 0, changeDate: '1 липня 2024', trend: 'stable',
      description: 'Мінімальний набір товарів і послуг для нормальної життєдіяльності.',
      whyItMatters: 'Від прожиткового мінімуму розраховується держмито при реєстрації ТОВ, штрафи, аліменти, пенсійні виплати.',
      history: [
        { date: '2023-01', value: 2684 }, { date: '2023-07', value: 2920 },
        { date: '2024-01', value: 3028 }, { date: '2026-04', value: 3028 },
      ],
      source: 'КМУ', sourceUrl: 'https://www.kmu.gov.ua',
      updateFrequency: 'Зазвичай 2 рази на рік (01.01 і 01.07)',
    },
    {
      id: 'pdfo-rate', name: 'Ставка ПДФО', shortName: 'ПДФО',
      value: '18%', numericValue: 18, unit: '%',
      trend: 'stable',
      description: 'Податок на доходи фізичних осіб — утримується з зарплати, дивідендів, відсотків по депозитах.',
      whyItMatters: 'Базова ставка для розрахунку чистого доходу працівника та оподаткування пасивних доходів.',
      history: [
        { date: '2015-01', value: 15 }, { date: '2016-01', value: 18 },
        { date: '2026-04', value: 18 },
      ],
      source: 'ПКУ ст. 167', sourceUrl: 'https://zakon.rada.gov.ua',
      updateFrequency: 'При зміні Податкового кодексу',
    },
    {
      id: 'military-levy', name: 'Військовий збір', shortName: 'Військовий збір',
      value: '5%', numericValue: 5, unit: '%',
      change: 3.5, changeDate: '1 грудня 2024', trend: 'up',
      description: 'Збір на підтримку ЗСУ — утримується додатково до ПДФО з усіх доходів фізичних осіб.',
      whyItMatters: 'З грудня 2024 ставку збільшено з 1.5% до 5%. Впливає на розрахунок чистої зарплати та доходу від депозитів.',
      history: [
        { date: '2014-08', value: 1.5 }, { date: '2024-12', value: 5 },
        { date: '2026-04', value: 5 },
      ],
      source: 'ПКУ ст. 161', sourceUrl: 'https://zakon.rada.gov.ua',
      updateFrequency: 'При зміні Податкового кодексу',
    },
  ],
};

// ── ДЕПОЗИТИ ──────────────────────────────────────────────────────
export interface DepositOffer {
  id: string;
  bankId: string;
  bankName: string;
  bankInitials: string;
  bankColor: string;
  productName: string;
  rateMin: number;
  rateMax: number;
  rateDisplay: string;
  currency: 'UAH' | 'USD' | 'EUR';
  termMonths: number[];
  minAmount: number;
  minAmountDisplay: string;
  capitalization: boolean;
  earlyTermination: boolean;
  isOnline: boolean;
  taxNote: string;
  effectiveRate?: number;
  badge?: string;
  ctaUrl: string;
}

export const DEPOSIT_OFFERS: { meta: FinderDataMeta; offers: DepositOffer[] } = {
  meta: {
    lastUpdated: '10 квітня 2026, 10:00',
    lastUpdatedISO: '2026-04-10T10:00:00',
    source: 'Офіційні сайти банків',
    nextUpdateNote: 'Оновлюється щотижня',
    isLive: false,
  },
  offers: [
    { id: 'd1', bankId: 'sense', bankName: 'Sense Bank', bankInitials: 'SB', bankColor: '#7C3AED', productName: 'Депозит Онлайн Плюс', rateMin: 13.5, rateMax: 15.0, rateDisplay: 'до 15.0% річних', currency: 'UAH', termMonths: [3, 6, 12], minAmount: 1000, minAmountDisplay: 'від 1 000 ₴', capitalization: true, earlyTermination: false, isOnline: true, taxNote: 'ПДФО 18% + ВЗ 5%', effectiveRate: 11.6, badge: 'Найвища ставка', ctaUrl: 'https://sensebank.com.ua' },
    { id: 'd2', bankId: 'monobank', bankName: 'Monobank', bankInitials: 'МБ', bankColor: '#1F2937', productName: 'Депозит в Mono', rateMin: 13.0, rateMax: 14.5, rateDisplay: 'до 14.5% річних', currency: 'UAH', termMonths: [1, 3, 6, 12], minAmount: 1000, minAmountDisplay: 'від 1 000 ₴', capitalization: false, earlyTermination: false, isOnline: true, taxNote: 'ПДФО 18% + ВЗ 5%', effectiveRate: 11.2, ctaUrl: 'https://monobank.ua' },
    { id: 'd3', bankId: 'privat', bankName: 'Приватбанк', bankInitials: 'ПБ', bankColor: '#166534', productName: 'Депозит Класичний', rateMin: 12.0, rateMax: 13.5, rateDisplay: 'до 13.5% річних', currency: 'UAH', termMonths: [1, 3, 6, 12, 18], minAmount: 500, minAmountDisplay: 'від 500 ₴', capitalization: true, earlyTermination: true, isOnline: true, taxNote: 'ПДФО 18% + ВЗ 5%', effectiveRate: 10.4, ctaUrl: 'https://privatbank.ua' },
    { id: 'd4', bankId: 'oschadbank', bankName: 'Ощадбанк', bankInitials: 'ОБ', bankColor: '#1E40AF', productName: 'Ощадний вклад', rateMin: 11.5, rateMax: 13.0, rateDisplay: 'до 13.0% річних', currency: 'UAH', termMonths: [3, 6, 12], minAmount: 1000, minAmountDisplay: 'від 1 000 ₴', capitalization: false, earlyTermination: false, isOnline: false, taxNote: 'ПДФО 18% + ВЗ 5%', effectiveRate: 10.0, ctaUrl: 'https://oschadbank.ua' },
    { id: 'd5', bankId: 'pumb', bankName: 'ПУМБ', bankInitials: 'ПМ', bankColor: '#7C3AED', productName: 'ПУМБ Онлайн', rateMin: 12.5, rateMax: 14.0, rateDisplay: 'до 14.0% річних', currency: 'UAH', termMonths: [1, 3, 6, 12], minAmount: 500, minAmountDisplay: 'від 500 ₴', capitalization: true, earlyTermination: true, isOnline: true, taxNote: 'ПДФО 18% + ВЗ 5%', effectiveRate: 10.8, ctaUrl: 'https://pumb.ua' },
    { id: 'd6', bankId: 'monobank-ovdp', bankName: 'ОВДП (Monobank)', bankInitials: 'ОВ', bankColor: '#1F2937', productName: 'ОВДП 3 місяці', rateMin: 14.2, rateMax: 14.2, rateDisplay: '14.2% річних', currency: 'UAH', termMonths: [3], minAmount: 1000, minAmountDisplay: 'від 1 000 ₴', capitalization: false, earlyTermination: true, isOnline: true, taxNote: '0% ПДФО та ВЗ', effectiveRate: 14.2, badge: 'Без ПДФО', ctaUrl: 'https://monobank.ua' },
  ],
};

// ── КАРТКИ ────────────────────────────────────────────────────────
export interface CardOffer {
  id: string;
  bankId: string;
  bankName: string;
  bankInitials: string;
  bankColor: string;
  cardName: string;
  cardType: 'debit' | 'credit' | 'prepaid';
  audience: 'personal' | 'business' | 'both';
  annualFee: number;
  annualFeeDisplay: string;
  cashback: string;
  cashbackCategories: string[];
  maxCashbackMonth?: number;
  foreignFee: string;
  atmWithdrawal: string;
  creditLimit?: string;
  gracePeriod?: string;
  highlights: string[];
  badge?: string;
  ctaUrl: string;
}

export const CARD_OFFERS: { meta: FinderDataMeta; offers: CardOffer[] } = {
  meta: {
    lastUpdated: '10 квітня 2026, 10:00',
    lastUpdatedISO: '2026-04-10T10:00:00',
    source: 'Офіційні сайти банків',
    nextUpdateNote: 'Оновлюється щомісяця',
    isLive: false,
  },
  offers: [
    { id: 'c1', bankId: 'monobank', bankName: 'Monobank', bankInitials: 'МБ', bankColor: '#1F2937', cardName: 'Monobank Visa', cardType: 'debit', audience: 'personal', annualFee: 0, annualFeeDisplay: 'Безкоштовна', cashback: 'до 20% в категоріях', cashbackCategories: ['Ресторани', 'АЗС', 'Кіно'], maxCashbackMonth: 500, foreignFee: '0%', atmWithdrawal: 'Безкоштовно 5 разів/міс', highlights: ['Найкращий UX', 'ОВДП прямо в додатку', 'Apple Pay / Google Pay'], badge: 'Найпопулярніша', ctaUrl: 'https://monobank.ua' },
    { id: 'c2', bankId: 'sense', bankName: 'Sense Bank', bankInitials: 'SB', bankColor: '#7C3AED', cardName: 'Sense Cashback', cardType: 'debit', audience: 'personal', annualFee: 0, annualFeeDisplay: 'Безкоштовна', cashback: 'до 5% на все', cashbackCategories: ['Всі покупки'], maxCashbackMonth: 1000, foreignFee: '1%', atmWithdrawal: 'Безкоштовно 3 рази/міс', highlights: ['Фіксований кешбек 5%', 'Без обмежень на категорії'], ctaUrl: 'https://sensebank.com.ua' },
    { id: 'c3', bankId: 'privat', bankName: 'Приватбанк', bankInitials: 'ПБ', bankColor: '#166534', cardName: 'Приват Mastercard', cardType: 'debit', audience: 'both', annualFee: 0, annualFeeDisplay: 'Безкоштовна', cashback: 'до 2% на покупки', cashbackCategories: ['Всі покупки'], foreignFee: '1.5%', atmWithdrawal: 'Безкоштовно в банкоматах Приват', highlights: ['Найбільша мережа банкоматів', 'Cashback на всі покупки'], ctaUrl: 'https://privatbank.ua' },
    { id: 'c4', bankId: 'pumb', bankName: 'ПУМБ', bankInitials: 'ПМ', bankColor: '#7C3AED', cardName: 'ПУМБ Кредитна', cardType: 'credit', audience: 'personal', annualFee: 0, annualFeeDisplay: 'Безкоштовна', cashback: 'до 3% cashback', cashbackCategories: ['Супермаркети', 'Аптеки', 'АЗС'], foreignFee: '1%', atmWithdrawal: '2.5% комісія', creditLimit: 'до 100 000 ₴', gracePeriod: 'до 62 днів', highlights: ['62 дні пільговий період', 'Безкоштовне обслуговування'], badge: 'Кращий грейс', ctaUrl: 'https://pumb.ua' },
    { id: 'c5', bankId: 'monobank-biz', bankName: 'Monobank Бізнес', bankInitials: 'МБ', bankColor: '#1F2937', cardName: 'Monobank Бізнес Visa', cardType: 'debit', audience: 'business', annualFee: 0, annualFeeDisplay: 'Безкоштовна', cashback: '—', cashbackCategories: [], foreignFee: '0%', atmWithdrawal: 'Безкоштовно', highlights: ['Безкоштовний рахунок ФОП', 'Корпоративна картка', 'Виписки XML для ДПС'], badge: 'Для ФОП', ctaUrl: 'https://mbnk.biz' },
  ],
};

// ── СТРАХУВАННЯ ───────────────────────────────────────────────────
export interface InsuranceOffer {
  id: string;
  insurerId: string;
  insurerName: string;
  insurerInitials: string;
  insurerColor: string;
  type: 'ostsv' | 'dms' | 'property' | 'cargo' | 'travel' | 'life';
  productName: string;
  audience: 'personal' | 'business' | 'both';
  priceMin: number;
  priceMax?: number;
  priceDisplay: string;
  pricePeriod: string;
  coverage: string;
  onlineAvailable: boolean;
  keyFeatures: string[];
  exclusions?: string[];
  badge?: string;
  ctaUrl: string;
}

export const INSURANCE_OFFERS: { meta: FinderDataMeta; offers: InsuranceOffer[] } = {
  meta: {
    lastUpdated: '10 квітня 2026, 10:00',
    lastUpdatedISO: '2026-04-10T10:00:00',
    source: 'Офіційні сайти страховиків',
    nextUpdateNote: 'Оновлюється щоквартально',
    isLive: false,
  },
  offers: [
    { id: 'i1', insurerId: 'usg', insurerName: 'USG', insurerInitials: 'УС', insurerColor: '#1E40AF', type: 'ostsv', productName: 'ОСЦПВ Онлайн', audience: 'both', priceMin: 520, priceDisplay: 'від 520 ₴/рік', pricePeriod: '/рік', coverage: 'до 130 000 ₴', onlineAvailable: true, keyFeatures: ['Електронний поліс за 5 хв', 'Без черг', 'Перевірка на mtsbu.ua'], badge: 'Найшвидше', ctaUrl: 'https://usg.ua' },
    { id: 'i2', insurerId: 'aska', insurerName: 'АСКА', insurerInitials: 'АС', insurerColor: '#DC2626', type: 'ostsv', productName: 'ОСЦПВ АСКА', audience: 'both', priceMin: 495, priceDisplay: 'від 495 ₴/рік', pricePeriod: '/рік', coverage: 'до 130 000 ₴', onlineAvailable: true, keyFeatures: ['Найнижча ціна', 'Онлайн оформлення', 'Виплати до 15 днів'], badge: 'Найдешевше', ctaUrl: 'https://aska.ua' },
    { id: 'i3', insurerId: 'pzh', insurerName: 'Провідна', insurerInitials: 'ПР', insurerColor: '#166534', type: 'ostsv', productName: 'ОСЦПВ Провідна', audience: 'both', priceMin: 560, priceDisplay: 'від 560 ₴/рік', pricePeriod: '/рік', coverage: 'до 130 000 ₴', onlineAvailable: true, keyFeatures: ['Розстрочка без відсотків', 'Виплати до 10 днів', 'Аварійний комісар'], ctaUrl: 'https://provid.ua' },
    { id: 'i4', insurerId: 'usg-dms', insurerName: 'USG', insurerInitials: 'УС', insurerColor: '#1E40AF', type: 'dms', productName: 'ДМС Базовий', audience: 'both', priceMin: 2800, priceMax: 8000, priceDisplay: 'від 2 800 ₴/рік', pricePeriod: '/рік', coverage: 'до 300 000 ₴', onlineAvailable: false, keyFeatures: ['Амбулаторне лікування', 'Стоматологія', 'Стаціонар', 'Виклик лікаря додому'], ctaUrl: 'https://usg.ua' },
    { id: 'i5', insurerId: 'allianz', insurerName: 'Allianz', insurerInitials: 'AL', insurerColor: '#1E40AF', type: 'travel', productName: 'Страхування подорожей', audience: 'personal', priceMin: 150, priceMax: 400, priceDisplay: 'від 150 ₴/тиждень', pricePeriod: '/тиждень', coverage: 'до €50 000', onlineAvailable: true, keyFeatures: ['Шенгенська зона', 'Медичні витрати', 'Репатріація', 'COVID покриття'], badge: 'Для Шенгену', ctaUrl: 'https://allianz.ua' },
  ],
};

// ── ТАРИФИ І КОМІСІЇ ──────────────────────────────────────────────
export interface FeeComparison {
  id: string;
  category: string;
  subCategory: string;
  banks: {
    bankId: string;
    bankName: string;
    fee: string;
    conditions?: string;
    rating: 'best' | 'ok' | 'expensive';
  }[];
  fintodoTip?: string;
}

export const FEE_COMPARISONS: { meta: FinderDataMeta; comparisons: FeeComparison[] } = {
  meta: {
    lastUpdated: '10 квітня 2026',
    lastUpdatedISO: '2026-04-10T10:00:00',
    source: 'Тарифні пакети банків',
    nextUpdateNote: 'Оновлюється при зміні тарифів',
    isLive: false,
  },
  comparisons: [
    {
      id: 'f1', category: 'Перекази між банками', subCategory: 'В інший банк (UAH)',
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', fee: '0.5%', conditions: 'мін. 10 ₴', rating: 'ok' },
        { bankId: 'privat', bankName: 'Приватбанк', fee: '0.5%', conditions: 'мін. 8 ₴', rating: 'ok' },
        { bankId: 'oschadbank', bankName: 'Ощадбанк', fee: '0.3%', conditions: 'мін. 5 ₴', rating: 'best' },
        { bankId: 'pumb', bankName: 'ПУМБ', fee: '0.7%', conditions: 'мін. 10 ₴', rating: 'expensive' },
      ],
      fintodoTip: 'Збирайте платежі — один великий переказ вигідніший ніж кілька малих',
    },
    {
      id: 'f2', category: 'Обслуговування рахунку ФОП', subCategory: 'Щомісячна плата',
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', fee: 'Безкоштовно', rating: 'best' },
        { bankId: 'privat', bankName: 'Приватбанк', fee: 'від 100 ₴/міс', rating: 'ok' },
        { bankId: 'oschadbank', bankName: 'Ощадбанк', fee: 'від 150 ₴/міс', rating: 'ok' },
        { bankId: 'pumb', bankName: 'ПУМБ', fee: 'від 150 ₴/міс', rating: 'ok' },
        { bankId: 'ukrsib', bankName: 'Укрсиббанк', fee: 'від 180 ₴/міс', rating: 'expensive' },
      ],
      fintodoTip: 'Якщо у вас 3+ банки — сумарні витрати на обслуговування можуть перевищити 5 000 ₴/рік',
    },
    {
      id: 'f3', category: 'Інтернет-еквайринг', subCategory: 'Комісія з транзакції',
      banks: [
        { bankId: 'liqpay', bankName: 'LiqPay', fee: 'від 1.5%', rating: 'ok' },
        { bankId: 'wayforpay', bankName: 'WayForPay', fee: 'від 1.4%', rating: 'best' },
        { bankId: 'fondy', bankName: 'Fondy', fee: 'від 1.5%', rating: 'ok' },
        { bankId: 'monobank', bankName: 'Monobank', fee: 'від 1.4%', rating: 'best' },
        { bankId: 'stripe', bankName: 'Stripe', fee: '2.9% + $0.30', conditions: 'для іноземних карток', rating: 'expensive' },
      ],
      fintodoTip: 'Різниця між 1.4% і 2.9% при обороті 100 000 ₴/міс = 1 500 ₴ на місяць',
    },
    {
      id: 'f4', category: 'Зняття готівки', subCategory: 'В банкоматах інших банків',
      banks: [
        { bankId: 'monobank', bankName: 'Monobank', fee: 'Безкоштовно 5 разів/міс', rating: 'best' },
        { bankId: 'privat', bankName: 'Приватбанк', fee: '1%', conditions: 'мін. 5 ₴', rating: 'ok' },
        { bankId: 'pumb', bankName: 'ПУМБ', fee: '1.5%', conditions: 'мін. 15 ₴', rating: 'expensive' },
      ],
    },
  ],
};
