export type RroKind =
  | 'pprro_free'      // безкоштовні ПРРО (державні / опенсорс)
  | 'pprro_paid'      // комерційні ПРРО (хмарні)
  | 'hardware'        // апаратні РРО з Держреєстру
  | 'pos_terminal';   // POS-моноблоки/кас. рішення

export interface RroDevice {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  kind: RroKind;
  /** Включений у Держреєстр РРО / реєстр ПРРО ДПС */
  registered: boolean;
  registryRef: string;
  /** Підтримка валют, фіскалізації, видів оплат */
  supports: string[];
  /** Орієнтовна ціна (UAH/міс або UAH одноразово) */
  priceUah: string;
  /** Цільові сегменти */
  bestFor: string[];
  /** Канал звʼязку з ДПС */
  channel: 'mobile_app' | 'web' | 'desktop' | 'api' | 'hardware';
  /** Сумісність з еквайрингом / банком */
  acquiringNotes?: string;
  pros: string[];
  cons: string[];
  popular?: boolean;
  website?: string;
}

export const RRO_DEVICES_AS_OF = '2026-Q2';

export const RRO_KIND_LABEL: Record<RroKind, string> = {
  pprro_free: 'Безкоштовний ПРРО',
  pprro_paid: 'Комерційний ПРРО',
  hardware: 'Апаратний РРО',
  pos_terminal: 'POS-каса',
};

export const RRO_DEVICES: RroDevice[] = [
  // ── Безкоштовні ПРРО ──
  {
    id: 'pprro-dps', slug: 'pprro-dps',
    name: 'ПРРО ДПС (e-Receipt)', vendor: 'Державна податкова служба',
    kind: 'pprro_free', registered: true,
    registryRef: 'Реєстр ПРРО ДПС, наказ № 547',
    supports: ['Готівка', 'Картка', 'Без оплати', 'Передоплата', 'Кредит'],
    priceUah: '0 ₴ (безкоштовно)',
    bestFor: ['ФОП 1–2 групи', 'Низький чек', 'Стартапи'],
    channel: 'mobile_app',
    pros: ['Безкоштовно', 'Прямо від ДПС', 'Мобільний застосунок (iOS/Android)', 'Веб-версія'],
    cons: ['Базовий UI', 'Немає інтеграцій з обліковими системами', 'Періодичні збої серверів ДПС'],
    popular: true,
    website: 'https://tax.gov.ua/baneryi/programni-rro/',
  },
  {
    id: 'checkbox', slug: 'checkbox',
    name: 'Checkbox', vendor: 'ТОВ "Чекбокс Юкрейн"',
    kind: 'pprro_paid', registered: true,
    registryRef: 'Реєстр ПРРО ДПС',
    supports: ['Готівка', 'Картка', 'Безготівковий', 'Передоплата', 'Розстрочка', 'Бонуси'],
    priceUah: 'від 0 ₴ (тариф Free до 100 чеків) / 198 ₴/міс Pro',
    bestFor: ['ФОП 2–3 групи', 'Інтернет-магазини', 'Кафе/доставка'],
    channel: 'web',
    acquiringNotes: 'Інтеграція з monobank, ПриватБанк, Fondy, LiqPay, WayForPay',
    pros: ['Багато інтеграцій з CMS і ERP', 'API', 'Хмарне рішення', 'Готовий webhook для Telegram-нагадувань'],
    cons: ['Платні розширені тарифи', 'Залежність від інтернету'],
    popular: true,
    website: 'https://checkbox.ua',
  },
  {
    id: 'cashalot', slug: 'cashalot',
    name: 'Cashälot', vendor: 'ТОВ "Кешалот"',
    kind: 'pprro_paid', registered: true,
    registryRef: 'Реєстр ПРРО ДПС',
    supports: ['Готівка', 'Картка', 'Безготівковий', 'Розстрочка'],
    priceUah: 'від 99 ₴/міс (1 каса)',
    bestFor: ['Малий ритейл', 'Кафе', 'Сервіси'],
    channel: 'web',
    acquiringNotes: 'Підтримка monobank, ПриватБанк, Ощад, Fondy',
    pros: ['Простий інтерфейс', 'Швидке підключення', 'Дешеві тарифи', 'Інтеграції з 1С, BAS, IIko'],
    cons: ['Менше API-можливостей ніж Checkbox'],
    popular: true,
    website: 'https://cashalot.cc',
  },
  {
    id: 'vchasnokasa', slug: 'vchasnokasa',
    name: 'Вчасно.Каса', vendor: 'ТОВ "Іт-Інтегратор"',
    kind: 'pprro_paid', registered: true,
    registryRef: 'Реєстр ПРРО ДПС',
    supports: ['Готівка', 'Картка', 'Безготівковий', 'Передоплата'],
    priceUah: 'від 149 ₴/міс',
    bestFor: ['Бізнес з ЕДО Вчасно', 'Інтернет-магазини'],
    channel: 'web',
    acquiringNotes: 'monobank, ПриватБанк, Fondy, WayForPay',
    pros: ['Інтегрована з ЕДО Вчасно', 'Хмарна', 'API'],
    cons: ['Окремий тариф ЕДО для повного циклу'],
    website: 'https://kasa.vchasno.ua',
  },
  {
    id: 'fondy-pos', slug: 'fondy-pos',
    name: 'Fondy POS', vendor: 'Fondy',
    kind: 'pprro_paid', registered: true,
    registryRef: 'Реєстр ПРРО ДПС',
    supports: ['Картка (NFC, чип)', 'Apple Pay', 'Google Pay', 'QR-код'],
    priceUah: 'від 199 ₴/міс + комісія еквайрингу',
    bestFor: ['Кафе', 'Сфера послуг', 'Маленькі магазини'],
    channel: 'mobile_app',
    acquiringNotes: 'Власний еквайринг Fondy, інтеграція з ПРРО на смартфоні',
    pros: ['ПРРО + еквайринг в одному рішенні', 'Не потрібен термінал — приймайте картки телефоном (SoftPOS)'],
    cons: ['Комісія еквайрингу 1.4–2.7%'],
    website: 'https://fondy.ua/uk/pos/',
  },
  {
    id: 'liqpay-pprro', slug: 'liqpay-pprro',
    name: 'LiqPay ПРРО', vendor: 'ПриватБанк',
    kind: 'pprro_paid', registered: true,
    registryRef: 'Реєстр ПРРО ДПС',
    supports: ['Готівка', 'Картка', 'Apple Pay', 'Google Pay'],
    priceUah: 'безкоштовно для клієнтів ПриватБанку',
    bestFor: ['Клієнти ПриватБанку', 'Невеликі ФОП'],
    channel: 'mobile_app',
    acquiringNotes: 'Інтеграція з LiqPay еквайрингом ПриватБанку',
    pros: ['Безкоштовно для клієнтів банку', 'Інтеграція з рахунком ФОП', 'Простий запуск'],
    cons: ['Лише для клієнтів ПриватБанку', 'Залежність від екосистеми'],
    website: 'https://www.liqpay.ua/uk/services/pprro',
  },
  {
    id: 'monobank-pprro', slug: 'monobank-pprro',
    name: 'monobank ПРРО', vendor: 'Universal Bank',
    kind: 'pprro_paid', registered: true,
    registryRef: 'Реєстр ПРРО ДПС',
    supports: ['Готівка', 'Картка', 'QR-чек', 'Apple Pay', 'Google Pay'],
    priceUah: 'безкоштовно для клієнтів monobank Бізнес',
    bestFor: ['ФОП-клієнти monobank', 'Самозайняті', 'Кафе/салони'],
    channel: 'mobile_app',
    acquiringNotes: 'Інтеграція з рахунком та еквайрингом monobank',
    pros: ['Все в одному застосунку', 'Безкоштовно', 'Швидке підключення'],
    cons: ['Тільки для клієнтів monobank Бізнес'],
    popular: true,
    website: 'https://monobank.ua/business',
  },

  // ── Апаратні РРО з Держреєстру ──
  {
    id: 'mini-t-400', slug: 'mini-t-400',
    name: 'МІНІ-Т 400.02', vendor: 'НВП "Електрон-Маш"',
    kind: 'hardware', registered: true,
    registryRef: 'Держреєстр РРО, версія програмного забезпечення 1.05',
    supports: ['Готівка', 'Картка (з ПКТ)', 'Безготівковий'],
    priceUah: 'від 5 500 ₴ (одноразово)',
    bestFor: ['Магазини з постійним інтернетом', 'Аптеки'],
    channel: 'hardware',
    pros: ['Незалежність від смартфона', 'Швидкий друк', 'Без щомісячної оплати'],
    cons: ['Витратні матеріали (стрічка)', 'Сервісне обслуговування', 'Потрібен ЦСО'],
  },
  {
    id: 'maria-301mtm', slug: 'maria-301mtm',
    name: 'МАРІЯ 301МТМ', vendor: 'НВТ "Терра"',
    kind: 'hardware', registered: true,
    registryRef: 'Держреєстр РРО',
    supports: ['Готівка', 'Картка', 'Безготівковий'],
    priceUah: 'від 7 800 ₴',
    bestFor: ['Кафе', 'Сервіси', 'Магазини'],
    channel: 'hardware',
    pros: ['Надійна модель', 'Підтримка облікових систем', 'GPRS-модем'],
    cons: ['Потрібен ЦСО', 'Витратні матеріали'],
  },
  {
    id: 'datecs-fp700', slug: 'datecs-fp700',
    name: 'Datecs FP-700', vendor: 'Datecs',
    kind: 'hardware', registered: true,
    registryRef: 'Держреєстр РРО',
    supports: ['Готівка', 'Картка', 'Безготівковий'],
    priceUah: 'від 11 000 ₴',
    bestFor: ['Великий ритейл', 'Аптеки', 'АЗС'],
    channel: 'hardware',
    pros: ['Висока швидкодія', 'Інтеграція з POS-системами'],
    cons: ['Дорожча за українські моделі'],
  },

  // ── POS-каси (моноблоки) ──
  {
    id: 'iiko-front', slug: 'iiko-front',
    name: 'IIKO Front + ПРРО', vendor: 'IIKO Ukraine',
    kind: 'pos_terminal', registered: true,
    registryRef: 'Інтеграція з Checkbox / Cashalot / ПРРО ДПС',
    supports: ['Готівка', 'Картка', 'Безготівковий', 'Розстрочка'],
    priceUah: 'від 1 290 ₴/міс (комплекс)',
    bestFor: ['Ресторани', 'Кафе', 'Доставка'],
    channel: 'desktop',
    acquiringNotes: 'monobank, ПриватБанк, Ощад',
    pros: ['Повна система обліку HoReCa', 'Складський облік', 'Звіти по змінах'],
    cons: ['Потрібен моноблок/POS-термінал', 'Дорогий впровадження'],
  },
  {
    id: 'poster', slug: 'poster',
    name: 'Poster POS + ПРРО', vendor: 'Joinposter',
    kind: 'pos_terminal', registered: true,
    registryRef: 'Інтеграція з Checkbox',
    supports: ['Готівка', 'Картка', 'Безготівковий'],
    priceUah: 'від 27 USD/міс',
    bestFor: ['Малий HoReCa', 'Кав\'ярні', 'Бари'],
    channel: 'web',
    pros: ['Хмарне рішення', 'Робота на iPad/Android', 'Аналітика'],
    cons: ['Тариф в USD'],
  },
];

export interface FiscalReceiptCode {
  code: string;
  name: string;
  description: string;
  example: string;
}

export const FISCAL_RECEIPT_CODES: FiscalReceiptCode[] = [
  { code: '1', name: 'Готівка', description: 'Розрахунок готівковими коштами.', example: 'Покупець оплатив 250 ₴ готівкою.' },
  { code: '2', name: 'Картка', description: 'Безготівковий розрахунок банківською карткою (POS-термінал, NFC).', example: 'Оплата 1 200 ₴ карткою Visa через POS.' },
  { code: '3', name: 'Безготівковий', description: 'Безготівковий розрахунок через рахунок (платіжне доручення, оплата за рахунком).', example: 'ТОВ оплатило послуги за рахунком — 18 000 ₴ безготівково.' },
  { code: '4', name: 'Передоплата', description: 'Авансовий платіж до отримання товару/послуги.', example: 'Покупець вніс передоплату 500 ₴ за товар, що буде доставлено.' },
  { code: '5', name: 'Кредит', description: 'Продаж у кредит або розстрочку (без негайної оплати).', example: 'Покупець оформив товар у розстрочку Monobank Частинами.' },
  { code: '6', name: 'Бонуси', description: 'Оплата бонусами/балами лояльності.', example: 'Списання 200 ₴ бонусами картки лояльності.' },
];
