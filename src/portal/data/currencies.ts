/**
 * Довідник валют ISO 4217 — релевантні для української ЗЕД і бухобліку.
 * Джерело: офіційний перелік ISO + Класифікатор іноземних валют НБУ (постанова 34).
 * Використання: контракти ЗЕД, інвойси, банківські перекази (поле currency у SWIFT MT103),
 * декларації, перерахунок курсових різниць за П(С)БО 21.
 */

export type CurrencyGroup = 'g10' | 'eu' | 'cis' | 'asia' | 'mena' | 'americas' | 'crypto' | 'metals';

export interface CurrencyEntry {
  /** Літерний код ISO 4217 (3 символи). */
  code: string;
  /** Цифровий код ISO 4217. */
  numeric: string;
  /** Назва українською. */
  name: string;
  /** Назва англійською. */
  nameEn: string;
  /** Країна/територія обігу. */
  country: string;
  /** Прапор-емоджі. */
  flag: string;
  /** Символ валюти. */
  symbol: string;
  /** Кількість знаків після коми (мінорні одиниці). */
  minorUnits: number;
  group: CurrencyGroup;
  /** Чи є в Класифікаторі НБУ (Класифікатор іноземних валют, група 1/2/3). */
  nbuClass?: '1' | '2' | '3';
  /** Чи популярна в українській ЗЕД — для пріоритизації. */
  popular?: boolean;
  /** Короткий нейтральний коментар. */
  note?: string;
}

export const CURRENCY_GROUP_LABEL: Record<CurrencyGroup, string> = {
  g10: 'G10 — головні резервні',
  eu: 'Європа (не євро)',
  cis: 'СНД і сусіди',
  asia: 'Азія',
  mena: 'Близький Схід і Африка',
  americas: 'Америка',
  crypto: 'Криптовалюти',
  metals: 'Дорогоцінні метали',
};

export const NBU_CLASS_LABEL: Record<'1' | '2' | '3', string> = {
  '1': 'Група 1 — вільноконвертовані, торгуються на FX',
  '2': 'Група 2 — вільноконвертовані, не торгуються широко',
  '3': 'Група 3 — неконвертовані',
};

export const CURRENCIES_AS_OF = '2026-05';

export const CURRENCIES: CurrencyEntry[] = [
  // ── G10 / резервні ──
  {
    code: 'UAH', numeric: '980', name: 'Українська гривня', nameEn: 'Ukrainian Hryvnia',
    country: 'Україна', flag: '🇺🇦', symbol: '₴', minorUnits: 2, group: 'g10', popular: true,
    note: 'Національна валюта. Базова для всіх внутрішніх розрахунків.',
  },
  {
    code: 'USD', numeric: '840', name: 'Долар США', nameEn: 'US Dollar',
    country: 'США', flag: '🇺🇸', symbol: '$', minorUnits: 2, group: 'g10', nbuClass: '1', popular: true,
    note: '№1 у ЗЕД-розрахунках України. Основна резервна валюта НБУ.',
  },
  {
    code: 'EUR', numeric: '978', name: 'Євро', nameEn: 'Euro',
    country: 'Єврозона', flag: '🇪🇺', symbol: '€', minorUnits: 2, group: 'g10', nbuClass: '1', popular: true,
    note: '№2 у ЗЕД, особливо з ЄС. Стандарт для контрактів з ЄС.',
  },
  {
    code: 'GBP', numeric: '826', name: 'Фунт стерлінгів', nameEn: 'Pound Sterling',
    country: 'Велика Британія', flag: '🇬🇧', symbol: '£', minorUnits: 2, group: 'g10', nbuClass: '1', popular: true,
  },
  {
    code: 'CHF', numeric: '756', name: 'Швейцарський франк', nameEn: 'Swiss Franc',
    country: 'Швейцарія', flag: '🇨🇭', symbol: 'CHF', minorUnits: 2, group: 'g10', nbuClass: '1',
  },
  {
    code: 'JPY', numeric: '392', name: 'Японська єна', nameEn: 'Japanese Yen',
    country: 'Японія', flag: '🇯🇵', symbol: '¥', minorUnits: 0, group: 'g10', nbuClass: '1',
    note: 'Без копійок (0 мінорних одиниць).',
  },
  {
    code: 'CAD', numeric: '124', name: 'Канадський долар', nameEn: 'Canadian Dollar',
    country: 'Канада', flag: '🇨🇦', symbol: 'C$', minorUnits: 2, group: 'g10', nbuClass: '1',
  },
  {
    code: 'AUD', numeric: '036', name: 'Австралійський долар', nameEn: 'Australian Dollar',
    country: 'Австралія', flag: '🇦🇺', symbol: 'A$', minorUnits: 2, group: 'g10', nbuClass: '1',
  },
  {
    code: 'NZD', numeric: '554', name: 'Новозеландський долар', nameEn: 'New Zealand Dollar',
    country: 'Нова Зеландія', flag: '🇳🇿', symbol: 'NZ$', minorUnits: 2, group: 'g10', nbuClass: '1',
  },

  // ── Європа (не євро) ──
  {
    code: 'PLN', numeric: '985', name: 'Польський злотий', nameEn: 'Polish Zloty',
    country: 'Польща', flag: '🇵🇱', symbol: 'zł', minorUnits: 2, group: 'eu', nbuClass: '1', popular: true,
    note: 'Активно використовується у транскордонній торгівлі з Польщею.',
  },
  {
    code: 'CZK', numeric: '203', name: 'Чеська крона', nameEn: 'Czech Koruna',
    country: 'Чехія', flag: '🇨🇿', symbol: 'Kč', minorUnits: 2, group: 'eu', nbuClass: '1',
  },
  {
    code: 'HUF', numeric: '348', name: 'Угорський форинт', nameEn: 'Hungarian Forint',
    country: 'Угорщина', flag: '🇭🇺', symbol: 'Ft', minorUnits: 2, group: 'eu', nbuClass: '1',
  },
  {
    code: 'RON', numeric: '946', name: 'Румунський лей', nameEn: 'Romanian Leu',
    country: 'Румунія', flag: '🇷🇴', symbol: 'lei', minorUnits: 2, group: 'eu', nbuClass: '1',
  },
  {
    code: 'BGN', numeric: '975', name: 'Болгарський лев', nameEn: 'Bulgarian Lev',
    country: 'Болгарія', flag: '🇧🇬', symbol: 'лв', minorUnits: 2, group: 'eu', nbuClass: '1',
  },
  {
    code: 'SEK', numeric: '752', name: 'Шведська крона', nameEn: 'Swedish Krona',
    country: 'Швеція', flag: '🇸🇪', symbol: 'kr', minorUnits: 2, group: 'eu', nbuClass: '1',
  },
  {
    code: 'NOK', numeric: '578', name: 'Норвезька крона', nameEn: 'Norwegian Krone',
    country: 'Норвегія', flag: '🇳🇴', symbol: 'kr', minorUnits: 2, group: 'eu', nbuClass: '1',
  },
  {
    code: 'DKK', numeric: '208', name: 'Данська крона', nameEn: 'Danish Krone',
    country: 'Данія', flag: '🇩🇰', symbol: 'kr', minorUnits: 2, group: 'eu', nbuClass: '1',
  },
  {
    code: 'TRY', numeric: '949', name: 'Турецька ліра', nameEn: 'Turkish Lira',
    country: 'Туреччина', flag: '🇹🇷', symbol: '₺', minorUnits: 2, group: 'eu', nbuClass: '1', popular: true,
    note: 'Поширена в торгівлі з Туреччиною. Висока волатильність.',
  },
  {
    code: 'MDL', numeric: '498', name: 'Молдовський лей', nameEn: 'Moldovan Leu',
    country: 'Молдова', flag: '🇲🇩', symbol: 'L', minorUnits: 2, group: 'eu', nbuClass: '2',
  },

  // ── Азія ──
  {
    code: 'CNY', numeric: '156', name: 'Китайський юань', nameEn: 'Chinese Yuan Renminbi',
    country: 'Китай', flag: '🇨🇳', symbol: '¥', minorUnits: 2, group: 'asia', nbuClass: '1', popular: true,
    note: 'Зростаюча роль у ЗЕД з Китаєм. Офшорний CNH використовується для розрахунків поза материком.',
  },
  {
    code: 'SGD', numeric: '702', name: 'Сингапурський долар', nameEn: 'Singapore Dollar',
    country: 'Сингапур', flag: '🇸🇬', symbol: 'S$', minorUnits: 2, group: 'asia', nbuClass: '1',
    note: 'Часто валюта IT-контрактів через сингапурські юрособи.',
  },
  {
    code: 'HKD', numeric: '344', name: 'Гонконгський долар', nameEn: 'Hong Kong Dollar',
    country: 'Гонконг', flag: '🇭🇰', symbol: 'HK$', minorUnits: 2, group: 'asia', nbuClass: '1',
  },
  {
    code: 'KRW', numeric: '410', name: 'Південнокорейська вона', nameEn: 'South Korean Won',
    country: 'Південна Корея', flag: '🇰🇷', symbol: '₩', minorUnits: 0, group: 'asia', nbuClass: '1',
    note: 'Без копійок (0 мінорних одиниць).',
  },
  {
    code: 'INR', numeric: '356', name: 'Індійська рупія', nameEn: 'Indian Rupee',
    country: 'Індія', flag: '🇮🇳', symbol: '₹', minorUnits: 2, group: 'asia', nbuClass: '2',
  },
  {
    code: 'VND', numeric: '704', name: 'Вʼєтнамський донг', nameEn: 'Vietnamese Dong',
    country: 'Вʼєтнам', flag: '🇻🇳', symbol: '₫', minorUnits: 0, group: 'asia', nbuClass: '2',
  },
  {
    code: 'THB', numeric: '764', name: 'Тайський бат', nameEn: 'Thai Baht',
    country: 'Таїланд', flag: '🇹🇭', symbol: '฿', minorUnits: 2, group: 'asia', nbuClass: '1',
  },

  // ── Близький Схід і Африка ──
  {
    code: 'AED', numeric: '784', name: 'Дирхам ОАЕ', nameEn: 'UAE Dirham',
    country: 'ОАЕ', flag: '🇦🇪', symbol: 'د.إ', minorUnits: 2, group: 'mena', nbuClass: '1', popular: true,
    note: 'Поширений для контрактів через юрособи в Дубаї (DMCC, IFZA).',
  },
  {
    code: 'SAR', numeric: '682', name: 'Саудівський ріал', nameEn: 'Saudi Riyal',
    country: 'Саудівська Аравія', flag: '🇸🇦', symbol: '﷼', minorUnits: 2, group: 'mena', nbuClass: '1',
  },
  {
    code: 'ILS', numeric: '376', name: 'Ізраїльський шекель', nameEn: 'Israeli New Shekel',
    country: 'Ізраїль', flag: '🇮🇱', symbol: '₪', minorUnits: 2, group: 'mena', nbuClass: '1',
  },
  {
    code: 'EGP', numeric: '818', name: 'Єгипетський фунт', nameEn: 'Egyptian Pound',
    country: 'Єгипет', flag: '🇪🇬', symbol: 'E£', minorUnits: 2, group: 'mena', nbuClass: '2',
  },
  {
    code: 'ZAR', numeric: '710', name: 'Південноафриканський ранд', nameEn: 'South African Rand',
    country: 'ПАР', flag: '🇿🇦', symbol: 'R', minorUnits: 2, group: 'mena', nbuClass: '1',
  },

  // ── Америка ──
  {
    code: 'MXN', numeric: '484', name: 'Мексиканське песо', nameEn: 'Mexican Peso',
    country: 'Мексика', flag: '🇲🇽', symbol: 'MX$', minorUnits: 2, group: 'americas', nbuClass: '1',
  },
  {
    code: 'BRL', numeric: '986', name: 'Бразильський реал', nameEn: 'Brazilian Real',
    country: 'Бразилія', flag: '🇧🇷', symbol: 'R$', minorUnits: 2, group: 'americas', nbuClass: '1',
  },
  {
    code: 'ARS', numeric: '032', name: 'Аргентинське песо', nameEn: 'Argentine Peso',
    country: 'Аргентина', flag: '🇦🇷', symbol: '$', minorUnits: 2, group: 'americas', nbuClass: '2',
  },

  // ── СНД / сусіди (нейтрально) ──
  {
    code: 'GEL', numeric: '981', name: 'Грузинський ларі', nameEn: 'Georgian Lari',
    country: 'Грузія', flag: '🇬🇪', symbol: '₾', minorUnits: 2, group: 'cis', nbuClass: '2',
    note: 'Поширений серед українських IT-релокацій до Грузії.',
  },
  {
    code: 'KZT', numeric: '398', name: 'Казахстанський теньге', nameEn: 'Kazakhstani Tenge',
    country: 'Казахстан', flag: '🇰🇿', symbol: '₸', minorUnits: 2, group: 'cis', nbuClass: '2',
  },
  {
    code: 'AMD', numeric: '051', name: 'Вірменський драм', nameEn: 'Armenian Dram',
    country: 'Вірменія', flag: '🇦🇲', symbol: '֏', minorUnits: 2, group: 'cis', nbuClass: '2',
  },

  // ── Дорогоцінні метали ──
  {
    code: 'XAU', numeric: '959', name: 'Золото (тройська унція)', nameEn: 'Gold (troy ounce)',
    country: '—', flag: '🥇', symbol: 'Au', minorUnits: 6, group: 'metals',
    note: 'Облік банківських металів. НБУ публікує котирування Au/Ag/Pt/Pd.',
  },
  {
    code: 'XAG', numeric: '961', name: 'Срібло (тройська унція)', nameEn: 'Silver (troy ounce)',
    country: '—', flag: '🥈', symbol: 'Ag', minorUnits: 6, group: 'metals',
  },
  {
    code: 'XPT', numeric: '962', name: 'Платина (тройська унція)', nameEn: 'Platinum (troy ounce)',
    country: '—', flag: '⚪', symbol: 'Pt', minorUnits: 6, group: 'metals',
  },
  {
    code: 'XPD', numeric: '964', name: 'Паладій (тройська унція)', nameEn: 'Palladium (troy ounce)',
    country: '—', flag: '⚪', symbol: 'Pd', minorUnits: 6, group: 'metals',
  },

  // ── Криптовалюти (не ISO 4217, але уніфіковані для договорів) ──
  {
    code: 'BTC', numeric: '—', name: 'Bitcoin', nameEn: 'Bitcoin',
    country: '—', flag: '₿', symbol: '₿', minorUnits: 8, group: 'crypto',
    note: 'Не є офіційним кодом ISO. В Україні — віртуальний актив за ЗУ № 2074-IX.',
  },
  {
    code: 'ETH', numeric: '—', name: 'Ethereum', nameEn: 'Ether',
    country: '—', flag: 'Ξ', symbol: 'Ξ', minorUnits: 18, group: 'crypto',
  },
  {
    code: 'USDT', numeric: '—', name: 'Tether USD', nameEn: 'Tether USD',
    country: '—', flag: '💲', symbol: '₮', minorUnits: 6, group: 'crypto',
    note: 'Стейблкоїн, прив\'язаний до USD. Не є офіційним кодом ISO.',
  },
];
