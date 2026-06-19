/**
 * Коди валютних операцій — для платіжних інструкцій в інвалюті, SWIFT,
 * звітності перед банком і НБУ за валютним наглядом.
 * Джерело: Інструкція НБУ «Про порядок валютного нагляду» (постанова № 7),
 * Положення про здійснення операцій із валютними цінностями (постанова № 2),
 * Інструкція з обліку платежів (постанова № 5). Snapshot орієнтований на 2026 рік.
 *
 * Використання: бухгалтер вказує код у дорученні на купівлю/продаж валюти,
 * у SWIFT-платежі через банк-клієнт, у формі звітності 1-ПБ. Код визначає
 * характер операції: експорт/імпорт товарів, послуг, фінансові операції,
 * перекази фізосіб тощо. Невірний код = ризик зупинки валютного нагляду
 * і штрафу за ст. 14 ЗУ «Про валюту і валютні операції».
 */

export type CurrencyOpCategory =
  | 'trade_goods'      // Торгівля товарами
  | 'trade_services'   // Торгівля послугами
  | 'investments'      // Інвестиції, дивіденди, проценти
  | 'credits'          // Кредити, позики, гарантії
  | 'transfers'        // Поточні перекази фізосіб
  | 'budget'           // Бюджетні і урядові розрахунки
  | 'other';           // Інше

export interface CurrencyOpCode {
  /** Код операції (3–4 цифри). */
  code: string;
  /** Коротка назва. */
  name: string;
  /** Розгорнутий опис. */
  description: string;
  category: CurrencyOpCategory;
  /** Напрямок: списання з рахунку клієнта чи зарахування. */
  direction: 'out' | 'in' | 'both';
  /** Підлягає валютному нагляду банку (130 днів, ст. 13 ЗУ № 2473). */
  underSupervision: boolean;
  /** Типові підтверджуючі документи. */
  documents: string[];
  /** Стаття/норма-обґрунтування. */
  legalRef: string;
  /** Чи популярний для ЗЕД-бізнесу — для сортування. */
  popular?: boolean;
  /** Нейтральна примітка. */
  note?: string;
}

export const CURRENCY_OP_CATEGORY_LABEL: Record<CurrencyOpCategory, string> = {
  trade_goods: 'Торгівля товарами',
  trade_services: 'Торгівля послугами',
  investments: 'Інвестиції і доходи',
  credits: 'Кредити і позики',
  transfers: 'Перекази фізосіб',
  budget: 'Бюджетні розрахунки',
  other: 'Інше',
};

export const CURRENCY_OPS_AS_OF = '2026-01';

export const CURRENCY_OP_CODES: CurrencyOpCode[] = [
  // ── Торгівля товарами ──
  {
    code: '101',
    name: 'Експорт товарів — аванс від нерезидента',
    description: 'Зарахування передоплати від нерезидента за товар, що буде поставлений українським резидентом.',
    category: 'trade_goods',
    direction: 'in',
    underSupervision: true,
    documents: ['ЗЕД-контракт', 'Інвойс (proforma)', 'Митна декларація (після поставки)'],
    legalRef: 'Інстр. НБУ № 7, ст. 13 ЗУ № 2473',
    popular: true,
    note: 'Граничний строк поставки товару — 180 днів (ПКМУ № 67 від 2025).',
  },
  {
    code: '102',
    name: 'Експорт товарів — оплата після поставки',
    description: 'Зарахування виручки за товар, що вже поставлений (заборгованість нерезидента).',
    category: 'trade_goods',
    direction: 'in',
    underSupervision: true,
    documents: ['ЗЕД-контракт', 'Митна декларація', 'Інвойс'],
    legalRef: 'Інстр. НБУ № 7',
    popular: true,
  },
  {
    code: '201',
    name: 'Імпорт товарів — передоплата нерезиденту',
    description: 'Списання з рахунку резидента — аванс за товар, що буде ввезений.',
    category: 'trade_goods',
    direction: 'out',
    underSupervision: true,
    documents: ['ЗЕД-контракт', 'Інвойс / proforma', 'Митна декларація (після ввезення)'],
    legalRef: 'Інстр. НБУ № 7',
    popular: true,
    note: 'Якщо товар не ввезено протягом 180 днів — пеня 0,3% / день.',
  },
  {
    code: '202',
    name: 'Імпорт товарів — оплата після ввезення',
    description: 'Розрахунок за фактично отриманий імпортний товар (закриття кредиторської заборгованості).',
    category: 'trade_goods',
    direction: 'out',
    underSupervision: true,
    documents: ['Митна декларація', 'Інвойс', 'Акт прийому'],
    legalRef: 'Інстр. НБУ № 7',
    popular: true,
  },
  {
    code: '105',
    name: 'Реекспорт / реімпорт товарів',
    description: 'Операції з товарами, що ввозяться/вивозяться у режимах реекспорту або реімпорту.',
    category: 'trade_goods',
    direction: 'both',
    underSupervision: true,
    documents: ['Митна декларація', 'ЗЕД-контракт'],
    legalRef: 'Митний кодекс, гл. 23',
  },

  // ── Торгівля послугами ──
  {
    code: '301',
    name: 'Експорт послуг (IT, консалтинг, R&D)',
    description: 'Зарахування оплати за послуги, надані нерезиденту (програмування, дизайн, маркетинг, юридичні).',
    category: 'trade_services',
    direction: 'in',
    underSupervision: true,
    documents: ['ЗЕД-контракт / інвойс', 'Акт виконаних робіт / SOW'],
    legalRef: 'Інстр. НБУ № 7, ст. 5 ЗУ № 2473',
    popular: true,
    note: 'Найпоширеніший код для ФОП-айтішників і агенцій.',
  },
  {
    code: '302',
    name: 'Імпорт послуг — оплата нерезиденту',
    description: 'Списання за послуги, отримані від нерезидента (Google Ads, Stripe, Adobe, юр.послуги).',
    category: 'trade_services',
    direction: 'out',
    underSupervision: true,
    documents: ['Інвойс', 'Договір (або оферта)'],
    legalRef: 'Інстр. НБУ № 7',
    popular: true,
    note: 'Виникає податковий агент з ПДВ за ст. 208 ПКУ (для платників ПДВ).',
  },
  {
    code: '303',
    name: 'Транспортні послуги — експорт',
    description: 'Доходи перевізника-резидента за міжнародні перевезення (CMR, авіа, морські).',
    category: 'trade_services',
    direction: 'in',
    underSupervision: true,
    documents: ['CMR / коносамент', 'Інвойс', 'Договір перевезення'],
    legalRef: 'Інстр. НБУ № 7',
  },
  {
    code: '304',
    name: 'Транспортні послуги — імпорт',
    description: 'Оплата нерезиденту за фрахт, авіаперевезення, експедирування.',
    category: 'trade_services',
    direction: 'out',
    underSupervision: true,
    documents: ['CMR / коносамент', 'Інвойс'],
    legalRef: 'Інстр. НБУ № 7',
  },
  {
    code: '305',
    name: 'Туризм і подорожі',
    description: 'Послуги турагенту-нерезиденту, бронювання, оплата готелів, авіаквитків через корпорат. рахунок.',
    category: 'trade_services',
    direction: 'out',
    underSupervision: false,
    documents: ['Інвойс / договір', 'Ваучер'],
    legalRef: 'Положення НБУ № 5',
  },

  // ── Інвестиції і доходи ──
  {
    code: '401',
    name: 'Дивіденди — виплата нерезиденту',
    description: 'Перерахування дивідендів іноземному учаснику ТОВ / акціонеру АТ.',
    category: 'investments',
    direction: 'out',
    underSupervision: false,
    documents: ['Протокол рішення', 'Витяг з ЄДР', 'Сертифікат резидентства бенефіціара'],
    legalRef: 'ст. 141.4.2 ПКУ, ПКМУ № 153',
    popular: true,
    note: 'Утримується податок 15% (або менше за конвенцією про уникнення подвійного оподаткування).',
  },
  {
    code: '402',
    name: 'Дивіденди — зарахування від нерезидента',
    description: 'Дохід резидента-учасника іноземної компанії (КІК, портфельні інвестиції).',
    category: 'investments',
    direction: 'in',
    underSupervision: false,
    documents: ['Рішення зборів', 'Виписка брокера / банку'],
    legalRef: 'ст. 170.13 ПКУ',
  },
  {
    code: '403',
    name: 'Проценти за кредитом / депозитом',
    description: 'Виплата або зарахування процентів за міжнародними фінансовими інструментами.',
    category: 'investments',
    direction: 'both',
    underSupervision: false,
    documents: ['Кредитний договір', 'Графік платежів'],
    legalRef: 'Інстр. НБУ № 7',
  },
  {
    code: '404',
    name: 'Роялті',
    description: 'Платежі за використання інтелектуальної власності (ПЗ, торгові марки, ноу-хау, патенти).',
    category: 'investments',
    direction: 'both',
    underSupervision: false,
    documents: ['Ліцензійний договір', 'Свідоцтво на ОІВ', 'Інвойс'],
    legalRef: 'ст. 141.4.2 ПКУ',
    popular: true,
    note: 'Утримання податку 15% (або за конвенцією); обмеження витрат на роялті за ст. 140.5.6 ПКУ.',
  },
  {
    code: '405',
    name: 'Прямі інвестиції — внесення / повернення',
    description: 'Внесення нерезидентом до статутного капіталу або повернення інвестиції при виході.',
    category: 'investments',
    direction: 'both',
    underSupervision: false,
    documents: ['Статут', 'Протокол зборів', 'Договір купівлі-продажу частки'],
    legalRef: 'ЗУ № 93/96-ВР',
  },
  {
    code: '406',
    name: 'Цінні папери — купівля / продаж',
    description: 'Операції з акціями, облігаціями, ETF через нерезидентського брокера.',
    category: 'investments',
    direction: 'both',
    underSupervision: false,
    documents: ['Договір з брокером', 'Брокерський звіт'],
    legalRef: 'Положення НБУ № 5',
  },

  // ── Кредити і позики ──
  {
    code: '501',
    name: 'Кредит від нерезидента — отримання',
    description: 'Зарахування тіла кредиту/позики від іноземного кредитора.',
    category: 'credits',
    direction: 'in',
    underSupervision: false,
    documents: ['Кредитний договір', 'Реєстрація договору в НБУ'],
    legalRef: 'Положення НБУ № 7, гл. 11',
    note: 'Договір з нерезидентом-кредитором підлягає реєстрації в НБУ.',
  },
  {
    code: '502',
    name: 'Кредит нерезиденту — повернення тіла',
    description: 'Погашення основної суми кредиту, отриманого від нерезидента.',
    category: 'credits',
    direction: 'out',
    underSupervision: false,
    documents: ['Кредитний договір', 'Графік погашення'],
    legalRef: 'Положення НБУ № 7',
  },
  {
    code: '503',
    name: 'Поворотна фіндопомога від нерезидента',
    description: 'Безпроцентна поворотна фінансова допомога від материнської компанії або засновника.',
    category: 'credits',
    direction: 'in',
    underSupervision: true,
    documents: ['Договір позики', 'Реєстрація в НБУ (якщо > 365 днів)'],
    legalRef: 'ст. 14.1.257 ПКУ',
    note: 'При неповерненні протягом 365 днів — оподаткування як безповоротна.',
  },
  {
    code: '504',
    name: 'Гарантійні платежі',
    description: 'Платежі за банківськими гарантіями, акредитивами, поручительствами.',
    category: 'credits',
    direction: 'both',
    underSupervision: false,
    documents: ['Договір гарантії', 'Заява на акредитив'],
    legalRef: 'Положення НБУ № 5',
  },

  // ── Перекази фізосіб ──
  {
    code: '601',
    name: 'Заробітна плата від нерезидента',
    description: 'Зарахування фізособі-резиденту зарплати від іноземного роботодавця (remote work).',
    category: 'transfers',
    direction: 'in',
    underSupervision: false,
    documents: ['Трудовий договір / contract', 'Payslip'],
    legalRef: 'ст. 170.11 ПКУ',
    popular: true,
    note: 'Самостійне декларування і сплата ПДФО 18% + ВЗ 5% за результатами року.',
  },
  {
    code: '602',
    name: 'Аліменти і утримання',
    description: 'Перекази на утримання членів сімʼї, аліменти за рішенням суду.',
    category: 'transfers',
    direction: 'both',
    underSupervision: false,
    documents: ['Рішення суду / виконавчий лист'],
    legalRef: 'СК України',
  },
  {
    code: '603',
    name: 'Спадщина і подарунки',
    description: 'Отримання спадщини або подарунка від нерезидента / переказ за кордон.',
    category: 'transfers',
    direction: 'both',
    underSupervision: false,
    documents: ['Свідоцтво про спадщину', 'Договір дарування'],
    legalRef: 'ст. 174 ПКУ',
  },
  {
    code: '604',
    name: 'Допомога родичам / приватний переказ',
    description: 'Перекази між фізособами без комерційного підґрунтя в межах ліміту (е-ліміт 400 тис. ₴/рік).',
    category: 'transfers',
    direction: 'both',
    underSupervision: false,
    documents: ['Не вимагаються (банк може запитати призначення)'],
    legalRef: 'Постанова НБУ № 18 (е-ліміт)',
    popular: true,
    note: 'Понад е-ліміт — лише з підтверджуючими документами.',
  },
  {
    code: '605',
    name: 'Купівля нерухомості за кордоном',
    description: 'Переказ за кордон для оплати нерухомості резидентом-фізособою.',
    category: 'transfers',
    direction: 'out',
    underSupervision: false,
    documents: ['Договір купівлі-продажу', 'Витяг з реєстру'],
    legalRef: 'е-ліміт НБУ № 18',
    note: 'Підпадає під е-ліміт; повідомлення про закордонні активи в декларації.',
  },

  // ── Бюджет / урядові ──
  {
    code: '701',
    name: 'Гуманітарна / технічна допомога',
    description: 'Зарахування міжнародної допомоги від донорів (USAID, UN, GIZ, ЄС).',
    category: 'budget',
    direction: 'in',
    underSupervision: false,
    documents: ['Грантова угода', 'Витяг з реєстру гумдопомоги'],
    legalRef: 'ЗУ № 1192-XIV',
    note: 'Звільнення від ПДВ і прибутку при цільовому використанні.',
  },
  {
    code: '702',
    name: 'Зовнішні позики державі',
    description: 'Розрахунки за міжурядовими, єврооблігаційними позиками — лише для держустанов.',
    category: 'budget',
    direction: 'both',
    underSupervision: false,
    documents: ['Міжурядові угоди'],
    legalRef: 'БК України',
  },
  {
    code: '703',
    name: 'Внески до міжнародних організацій',
    description: 'Членські внески до ООН, СОТ, МВФ, ЄБРР тощо.',
    category: 'budget',
    direction: 'out',
    underSupervision: false,
    documents: ['Постанова КМУ'],
    legalRef: 'ПКМУ',
  },

  // ── Інше ──
  {
    code: '901',
    name: 'Конверсія валют (купівля / продаж)',
    description: 'Обмін однієї інвалюти на іншу через банк / купівля валюти за гривню для імпорту.',
    category: 'other',
    direction: 'both',
    underSupervision: false,
    documents: ['Заява на купівлю / продаж'],
    legalRef: 'Положення НБУ № 5',
    popular: true,
    note: 'Збір на ПФ 0% при купівлі валюти юрособою (на 2026).',
  },
  {
    code: '902',
    name: 'Комісії і збори банку',
    description: 'Списання комісій банку-кореспондента, SWIFT-комісії, RMA, нагляду.',
    category: 'other',
    direction: 'out',
    underSupervision: false,
    documents: ['Тарифи банку', 'SWIFT-MT199 / виписка'],
    legalRef: 'Договір банк. обслуговування',
    popular: true,
  },
  {
    code: '903',
    name: 'Помилкові надходження / повернення',
    description: 'Повернення помилково зарахованих сум, відкликання платежу.',
    category: 'other',
    direction: 'both',
    underSupervision: false,
    documents: ['Лист-вимога', 'Виписка'],
    legalRef: 'Положення НБУ № 5',
  },
  {
    code: '999',
    name: 'Інші операції',
    description: 'Операції, що не підпадають під специфічний код (узгоджується з банком окремо).',
    category: 'other',
    direction: 'both',
    underSupervision: false,
    documents: ['За запитом банку'],
    legalRef: 'Положення НБУ № 5',
    note: 'Використовувати лише як останній варіант — банк може запитати додаткові пояснення.',
  },
];
