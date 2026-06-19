/**
 * Мапінг довідника → релевантні типи установ-партнерів з INSTITUTION_PROFILES.
 *
 * Використовується компонентом <RelatedPartnersBlock /> на сторінках довідників
 * та лічильником «+ N партнерів» на картках індексу /dovidnyky.
 *
 * Ключ — `DovidnykySection.id`. Якщо мапінга немає — блок не рендериться.
 */
export interface DirectoryPartnerConfig {
  /** Типи з FullInstitutionProfile.types (фільтр OR) */
  partnerTypes: string[];
  /** Ручний піннінг конкретних установ по slug (виводяться першими) */
  partnerSlugs?: string[];
  /** Що шукає користувач: послугу, продукт чи обидва */
  intent: 'service' | 'product' | 'both';
  /** Кнопка у хедері блоку */
  ctaLabel: string;
  /** Що показуємо у sub-заголовку */
  ctaSubLabel?: string;
  /** Сховати блок для конкретної аудиторії */
  hideForAudience?: 'business' | 'individual';
}

export const DIRECTORY_PARTNER_MAP: Record<string, DirectoryPartnerConfig> = {
  // ── ЗЕД і митниця ──
  'mytni-dokumenty': {
    partnerTypes: ['broker', 'logistics'],
    intent: 'service',
    ctaLabel: 'Знайти митного брокера',
    ctaSubLabel: 'Перевірені брокери і логісти, які оформлять документи за вас',
  },
  'ukt-zed': {
    partnerTypes: ['broker', 'logistics'],
    intent: 'service',
    ctaLabel: 'Підібрати код з брокером',
  },
  'incoterms': {
    partnerTypes: ['logistics', 'broker', 'bank'],
    intent: 'service',
    ctaLabel: 'Логісти та банки для ЗЕД',
  },
  'customs-tariff': {
    partnerTypes: ['broker', 'logistics'],
    intent: 'service',
    ctaLabel: 'Уточнити тариф з брокером',
  },
  'customs-sanctions': {
    partnerTypes: ['legal_service', 'broker'],
    intent: 'service',
    ctaLabel: 'Юристи з санкційного комплаєнсу',
  },
  'intl-carriers': {
    partnerTypes: ['logistics'],
    intent: 'service',
    ctaLabel: 'Перевірені перевізники',
  },
  'rozmytnennya-avto': {
    partnerTypes: ['broker', 'logistics', 'insurance'],
    intent: 'service',
    ctaLabel: 'Брокер + страхування авто',
  },
  'krayiny': {
    partnerTypes: ['bank', 'logistics', 'broker'],
    intent: 'service',
    ctaLabel: 'Партнери для роботи за кордоном',
  },
  'dpo': {
    partnerTypes: ['legal_service', 'legal_consulting', 'bank'],
    intent: 'service',
    ctaLabel: 'Юристи з міжнародного оподаткування',
  },

  // ── Право і договори ──
  'notariusy': {
    partnerTypes: ['notary', 'legal_service'],
    intent: 'service',
    ctaLabel: 'Записатись до нотаріуса',
  },
  'advokaty': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Знайти адвоката',
  },
  'sudovyj-zbir': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Юристи для судового представництва',
  },
  'tsnap': {
    partnerTypes: ['gov_service', 'digital_signature', 'business_registration'],
    intent: 'service',
    ctaLabel: 'Альтернативні сервіси',
  },
  'atsk-kep': {
    partnerTypes: ['digital_signature', 'gov_service', 'edo'],
    intent: 'product',
    ctaLabel: 'Отримати КЕП',
  },
  'zakony': {
    partnerTypes: ['legal_database', 'legal_service', 'legal_consulting'],
    intent: 'both',
    ctaLabel: 'Юр-бази і консультанти',
  },
  'sudy': {
    partnerTypes: ['legal_service', 'legal_consulting', 'legal_database'],
    intent: 'service',
    ctaLabel: 'Адвокати для подібних справ',
  },
  'rozyasnennia': {
    partnerTypes: ['legal_database', 'accounting_software'],
    intent: 'both',
    ctaLabel: 'Бази роз’яснень та обліку',
  },
  'dohovory': {
    partnerTypes: ['legal_service', 'legal_consulting', 'legal_database'],
    intent: 'both',
    ctaLabel: 'Юристи на договори',
  },
  'korporatyvne-pravo': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Корпоративні юристи',
  },
  'ip-prava': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Юристи з IP',
  },
  'litsenziyi': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Юристи для отримання ліцензії',
  },
  'sertyfikatsii': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Консультанти з сертифікації',
  },
  'perevirky-biznesu': {
    partnerTypes: ['legal_service', 'legal_consulting', 'accounting_software'],
    intent: 'service',
    ctaLabel: 'Юристи для супроводу перевірки',
  },
  'sanctions': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Санкційний комплаєнс',
  },
  'penalties': {
    partnerTypes: ['legal_service', 'legal_consulting', 'accounting_software'],
    intent: 'both',
    ctaLabel: 'Як оскаржити: юристи + софт',
  },

  // ── Фінанси і платежі ──
  'banky-mfo': {
    partnerTypes: ['bank', 'neobank', 'fintech'],
    intent: 'product',
    ctaLabel: 'Відкрити рахунок',
  },
  'valyuty': {
    partnerTypes: ['bank', 'payment_system', 'money_transfer'],
    intent: 'service',
    ctaLabel: 'Конвертація і перекази',
  },
  'kursy-nbu': {
    partnerTypes: ['bank', 'payment_system', 'broker'],
    intent: 'service',
    ctaLabel: 'Купити/продати валюту',
  },
  'kvo': {
    partnerTypes: ['bank', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Банки і валютний контроль',
  },
  'valyutnyy-kontrol': {
    partnerTypes: ['bank', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Банки і консультанти з ЗЕД',
  },
  'biudzhetni-rakhunky': {
    partnerTypes: ['bank', 'accounting_software', 'edo'],
    intent: 'service',
    ctaLabel: 'Сплатити через банк-партнер',
  },
  'indeks-infliatsii': {
    partnerTypes: ['investment', 'bank'],
    intent: 'product',
    ctaLabel: 'Захист від інфляції',
  },

  // ── HR і праця ──
  'hr-shablony': {
    partnerTypes: ['hr_platform', 'recruiting', 'legal_service'],
    intent: 'service',
    ctaLabel: 'HR-сервіси і юристи',
  },
  'zarplaty': {
    partnerTypes: ['hr_platform', 'payroll', 'hrm'],
    intent: 'service',
    ctaLabel: 'Розрахунок зарплат і бенчмарки',
  },
  'profesii': {
    partnerTypes: ['hr_platform', 'recruiting', 'hiring'],
    intent: 'service',
    ctaLabel: 'Знайти спеціаліста',
  },
  'viyskovyy-oblik': {
    partnerTypes: ['hrm', 'legal_consulting', 'legal_service'],
    intent: 'service',
    ctaLabel: 'Військовий облік під ключ',
    hideForAudience: 'individual',
  },
  'mobilizatsiya-bronyuvannya': {
    partnerTypes: ['hrm', 'legal_consulting', 'legal_service'],
    intent: 'service',
    ctaLabel: 'Бронювання працівників',
    hideForAudience: 'individual',
  },
  'trudovi-vyplaty': {
    partnerTypes: ['payroll', 'hrm', 'hr_platform'],
    intent: 'service',
    ctaLabel: 'Розрахунок виплат',
  },

  // ── Податки і облік ──
  'pdv-pilhy': {
    partnerTypes: ['accounting_software', 'tax_automation', 'edo', 'legal_consulting'],
    intent: 'both',
    ctaLabel: 'Облік ПДВ-пільг',
  },
  'kody-pilg': {
    partnerTypes: ['accounting_software', 'tax_automation', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Налаштувати коди в обліку',
  },
  'kody-pdv': {
    partnerTypes: ['accounting_software', 'tax_automation', 'edo'],
    intent: 'service',
    ctaLabel: 'Софт для виписки ПН/РК',
  },
  'stavky': {
    partnerTypes: ['accounting_software', 'tax_automation'],
    intent: 'service',
    ctaLabel: 'Автоматичний розрахунок',
  },
  'kalendar': {
    partnerTypes: ['accounting_software', 'tax_automation', 'edo'],
    intent: 'service',
    ctaLabel: 'Нагадування про дедлайни',
  },
  'limity': {
    partnerTypes: ['accounting_software', 'tax_automation'],
    intent: 'service',
    ctaLabel: 'Контроль лімітів',
  },
  'zvitni-formy': {
    partnerTypes: ['edo', 'reporting', 'accounting_software'],
    intent: 'product',
    ctaLabel: 'Сервіси подачі звітності',
  },
  'kkd': {
    partnerTypes: ['accounting_software', 'edo'],
    intent: 'service',
    ctaLabel: 'Автоматичне підставлення ККД',
  },
  'oznaky-dohodu': {
    partnerTypes: ['accounting_software', 'tax_automation', 'edo'],
    intent: 'service',
    ctaLabel: 'Софт для 4ДФ',
  },
  'psp': {
    partnerTypes: ['accounting_software', 'tax_automation'],
    intent: 'service',
    ctaLabel: 'Розрахунок ПСП у зарплаті',
  },
  'kasovi-limity': {
    partnerTypes: ['accounting_software', 'bank', 'cashier_software'],
    intent: 'service',
    ctaLabel: 'Каса і ліміти',
  },
  'tco': {
    partnerTypes: ['legal_consulting', 'accounting_software', 'tax_automation'],
    intent: 'service',
    ctaLabel: 'Консультанти з ТЦО',
    hideForAudience: 'individual',
  },
  'rro-pprro': {
    partnerTypes: ['cashier_software', 'prro', 'accounting_software'],
    intent: 'product',
    ctaLabel: 'Підібрати ПРРО',
  },
  'pervynni-dokumenty': {
    partnerTypes: ['accounting_software', 'edo'],
    intent: 'service',
    ctaLabel: 'Автоматизація первинки',
  },
  'plan-rakhunkiv': {
    partnerTypes: ['accounting_software'],
    intent: 'service',
    ctaLabel: 'Бухгалтерські системи',
    hideForAudience: 'individual',
  },

  // ── Будівництво і нерухомість ──
  'dbn': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'Юристи з ДБН і дозволів',
  },
  'vartist-budivnytstva': {
    partnerTypes: ['leasing', 'leasing_equipment', 'mortgage', 'bank'],
    intent: 'service',
    ctaLabel: 'Фінансування будівництва',
  },
  'otsinka-zemli': {
    partnerTypes: ['legal_service', 'mortgage', 'bank'],
    intent: 'service',
    ctaLabel: 'Юристи з земельного права',
  },
  'komertsiyna-orenda': {
    partnerTypes: ['legal_service', 'business_registration'],
    intent: 'service',
    ctaLabel: 'Юр-супровід оренди',
  },
  'komunalni-taryfy': {
    partnerTypes: ['accounting_software'],
    intent: 'service',
    ctaLabel: 'Облік комунальних',
  },

  // ── Авто і логістика ──
  'osago': {
    partnerTypes: ['insurance'],
    intent: 'product',
    ctaLabel: 'Оформити ОСЦПВ онлайн',
  },
  'shtrafy-pdr': {
    partnerTypes: ['insurance', 'legal_service'],
    intent: 'service',
    ctaLabel: 'Оскарження + страхування',
  },
  'azs': {
    partnerTypes: ['bank', 'payment_system', 'fintech'],
    intent: 'product',
    ctaLabel: 'Палаливні картки і кешбек',
  },
  'tsiny-palyva': {
    partnerTypes: ['bank', 'payment_system'],
    intent: 'product',
    ctaLabel: 'Картки з кешбеком на пальне',
  },
  'domestic-carriers-b2b': {
    partnerTypes: ['logistics'],
    intent: 'service',
    ctaLabel: 'Перевірені перевізники',
  },
  'poshtovi-operatory': {
    partnerTypes: ['logistics'],
    intent: 'service',
    ctaLabel: 'Логістика для бізнесу',
  },

  // ── IT, маркетинг, освіта ──
  'it-stavky': {
    partnerTypes: ['hr_platform', 'recruiting', 'hiring'],
    intent: 'service',
    ctaLabel: 'Найняти ІТ-спеціаліста',
  },
  'it-shablony-dohovoriv': {
    partnerTypes: ['legal_service', 'legal_consulting'],
    intent: 'service',
    ctaLabel: 'IT-юристи для договорів',
  },
  'marketingovi-benchmarky': {
    partnerTypes: ['hr_platform', 'recruiting'],
    intent: 'service',
    ctaLabel: 'Маркетингові підрядники',
  },
  'diia-city': {
    partnerTypes: ['legal_consulting', 'legal_service', 'tax_automation'],
    intent: 'service',
    ctaLabel: 'Вступ у Дія City',
  },
  'navchalni-tsentry': {
    partnerTypes: ['hr_platform', 'recruiting'],
    intent: 'service',
    ctaLabel: 'Корпоративне навчання',
  },
  'granty-na-navchannya': {
    partnerTypes: ['grant_program', 'international_grant', 'startup_fund'],
    intent: 'product',
    ctaLabel: 'Подати заявку на грант',
  },
  'granty': {
    partnerTypes: ['grant_program', 'international_grant', 'startup_fund', 'startup_hub'],
    intent: 'product',
    ctaLabel: 'Подати заявку',
  },

  // ── Установи і реєстри ──
  'ustanovy': {
    partnerTypes: ['bank', 'accounting_software', 'insurance', 'legal_service'],
    intent: 'both',
    ctaLabel: 'Топ установ FINTODO',
  },
  'accountants': {
    partnerTypes: ['accounting_software', 'business_registration'],
    intent: 'both',
    ctaLabel: 'Софт для бухгалтерів',
  },
  'formy-biznesu': {
    partnerTypes: ['business_registration', 'legal_service', 'accounting_software'],
    intent: 'service',
    ctaLabel: 'Зареєструвати бізнес',
  },
  'reestry': {
    partnerTypes: ['registry', 'monitoring', 'legal_database'],
    intent: 'product',
    ctaLabel: 'Сервіси перевірки контрагентів',
  },
  'kved': {
    partnerTypes: ['business_registration', 'legal_service', 'accounting_software'],
    intent: 'service',
    ctaLabel: 'Допомога з вибором КВЕД',
  },
  'katottg': {
    partnerTypes: ['business_registration', 'legal_service', 'legal_database'],
    intent: 'service',
    ctaLabel: 'Юр-перевірка адрес і КОАТУУ',
  },
  'poshtovi-indeksy': {
    partnerTypes: ['logistics'],
    intent: 'service',
    ctaLabel: 'Поштові оператори і логістика',
  },
  'regionalni-kontakty': {
    partnerTypes: ['legal_consulting', 'accounting_software', 'legal_service'],
    intent: 'service',
    ctaLabel: 'Локальні консультанти',
  },
  'templates': {
    partnerTypes: ['legal_service', 'legal_consulting', 'accounting_software'],
    intent: 'both',
    ctaLabel: 'Юристи на ваші договори',
  },
  'derzhorgany': {
    partnerTypes: ['legal_consulting', 'legal_service', 'business_registration'],
    intent: 'service',
    ctaLabel: 'Юр-супровід у держорганах',
  },
  'dogovory': {
    partnerTypes: ['legal_service', 'legal_consulting', 'legal_database'],
    intent: 'both',
    ctaLabel: 'Юристи на договори',
  },
  'sanktsiyni-tovary': {
    partnerTypes: ['legal_service', 'legal_consulting', 'broker'],
    intent: 'service',
    ctaLabel: 'Санкційний комплаєнс',
  },
  'uktzed-mytni-stavky': {
    partnerTypes: ['broker', 'logistics'],
    intent: 'service',
    ctaLabel: 'Уточнити тариф з брокером',
  },
  'lohistyka-b2b': {
    partnerTypes: ['logistics'],
    intent: 'service',
    ctaLabel: 'Перевірені перевізники',
  },
  'mizhnarodni-perevyznyky': {
    partnerTypes: ['logistics', 'broker'],
    intent: 'service',
    ctaLabel: 'Міжнародна логістика',
  },
};

export const getDirectoryPartnerConfig = (id: string): DirectoryPartnerConfig | undefined =>
  DIRECTORY_PARTNER_MAP[id];

export const hasPartnerMapping = (id: string): boolean => id in DIRECTORY_PARTNER_MAP;
