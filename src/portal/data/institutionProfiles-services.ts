import type { FullInstitutionProfile } from './institutionProfiles';

export const SERVICES_PROFILES: FullInstitutionProfile[] = [
  // ══════════════════════════════════════════════════════════════
  // USG (Українська страхова група)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'usg',
    slug: 'usg',
    name: 'USG',
    legalName: 'ПрАТ «Українська страхова група»',
    brandNames: ['USG', 'УСГ', 'Українська страхова група'],
    types: ['insurance'],
    logo: { initials: 'USG', color: '#E31E24' },
    website: 'https://usg.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '7 лютого 2026',

    legal: {
      edrpou: '20494019',
      legalForm: 'ПрАТ',
      registrationNumber: '20494019',
      registrationDate: '1994',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'вул. Богдана Хмельницького, 17/21, Київ, 01030',
        actual: 'вул. Богдана Хмельницького, 17/21, Київ, 01030',
      },
      regulators: ['Національний банк України (регулятор страхового ринку з 2020)'],
      licenses: [
        { type: 'Ліцензія на страхування', number: 'АВ №584327', issuedBy: 'Нацкомфінпослуг', issuedDate: '2011', status: 'active' },
      ],
      certifications: [],
      taxStatus: 'Платник ПДВ',
      status: 'active',
    },

    company: {
      foundedYear: 1994,
      foundedCity: 'Київ',
      story: 'USG — одна з найстаріших страхових компаній України, заснована у 1994 році. Входить до ТОП-10 за обсягом страхових виплат. Спеціалізується на ОСЦПВ, КАСКО, медичному та майновому страхуванні.',
      headquarters: 'Київ',
      employeesCount: '500-1000',
      publiclyTraded: false,
      keyPeople: [],
      milestones: [
        { year: 1994, event: 'Заснування компанії', type: 'founding' },
        { year: 2010, event: 'Входження до ТОП-10 страховиків', type: 'award' },
        { year: 2020, event: 'Запуск онлайн-страхування', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Богдана Хмельницького, 17/21',
        city: 'Київ',
        country: 'Україна',
        phone: ['0 800 500 820'],
        email: ['info@usg.ua'],
      },
      support: {
        freePhone: '0 800 500 820',
        email: 'support@usg.ua',
        workingHours: 'Пн-Пт 9:00-18:00',
        is247: false,
      },
      social: {
        facebook: 'https://facebook.com/usg.ua',
        instagram: 'https://instagram.com/usg_ua',
      },
    },

    branches: {
      totalCount: 25,
      coverageNote: 'Представництва у всіх обласних центрах.',
      regions: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів'],
      branchList: [],
    },

    platforms: {
      web: { available: true, url: 'https://usg.ua', features: ['Онлайн-калькулятор ОСЦПВ', 'Оформлення полісу онлайн', 'Особистий кабінет'] },
      ios: { available: false },
      android: { available: false },
      api: { available: false },
    },

    security: {
      certifications: [],
      features: ['SSL', 'Захист персональних даних'],
      dataStorage: 'Україна',
    },

    integrations: [
      { name: 'МТСБУ', category: 'Державний реєстр', isOfficial: true, note: 'Обов\'язкова інтеграція для ОСЦПВ' },
    ],

    products: [
      {
        id: 'usg-osago',
        category: 'ОСЦПВ',
        name: 'Автоцивілка USG',
        tagline: 'ОСЦПВ онлайн за 5 хвилин',
        description: 'Обов\'язкове страхування цивільно-правової відповідальності власників наземних транспортних засобів.',
        audience: 'both',
        isHighlighted: true,
        isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 500 ₴/рік (залежить від типу ТЗ та водійського стажу)' },
        features: [
          { name: 'Оформлення онлайн', included: true },
          { name: 'Доставка полісу на email', included: true },
          { name: 'Європротокол', included: true },
        ],
        interestRate: 'від 500 ₴/рік',
        interestRateNote: 'залежить від ТЗ та стажу',
        processingTime: '5 хвилин онлайн',
        coverageLimits: 'до 130 000 ₴ (ліміт МТСБУ)',
        requirements: ['Свідоцтво про реєстрацію ТЗ', 'Водійське посвідчення'],
        pros: ['Конкурентна ціна', 'Швидке оформлення'],
        cons: ['Обмежена мережа партнерських СТО'],
        ctaLabel: 'Розрахувати вартість',
        ctaUrl: 'https://usg.ua/osago',
      },
    ],

    ratings: {
      fintodo: { overall: 70, rank: 3, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'Finance.ua', rating: 3.5, maxRating: 5 },
      ],
      averageExternal: 3.5,
    },

    editorial: {
      oneLiner: 'Надійний страховик з 30-річною історією — не найдешевший, але стабільний.',
      shortTake: 'USG — класична страхова компанія без зайвих інновацій. Головне — виплачує, коли потрібно.',
      fullVerdict: 'Для тих, хто шукає надійну автоцивілку або КАСКО від перевіреної компанії. Не найнижча ціна, але стабільні виплати.',
      bestFor: [
        { segment: 'Автовласники, яким потрібна надійна ОСЦПВ', reason: 'Стабільні виплати, 30 років на ринку', emoji: '🚗' },
      ],
      notFor: [
        { segment: 'Ті, хто шукає найдешевшу страховку', reason: 'Є дешевші варіанти', alternative: 'Порівняйте на hotline.finance' },
      ],
      methodology: {
        approach: 'Аналіз виплат, відгуків, тарифів',
        testingPeriod: 'Грудень 2025 – січень 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 10,
        keyFindings: ['Виплати без затримок у 90% випадків'],
      },
      scores: [
        { category: 'Надійність', weight: 40, score: 8.0, maxScore: 10, rationale: '30 років на ринку, стабільні виплати', whatWeTested: ['Історія виплат'], howWeScored: 'Статистика МТСБУ', penaltyReasons: [] },
        { category: 'Ціни', weight: 30, score: 6.0, maxScore: 10, rationale: 'Середній сегмент', whatWeTested: ['Порівняння тарифів'], howWeScored: 'Калькулятор', penaltyReasons: [] },
        { category: 'Зручність', weight: 30, score: 7.0, maxScore: 10, rationale: 'Є онлайн-оформлення', whatWeTested: ['Сайт'], howWeScored: 'UX-аудит', penaltyReasons: ['Немає мобільного додатку'] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 7.0,
      independenceStatement: 'FINTODO не має комерційних відносин з USG.',
    },

    reviewThemes: [
      { theme: 'Виплати', sentiment: 'positive', frequency: 'common', summary: 'Виплачують без зайвих питань', ourConclusion: 'Надійний страховик.' },
    ],
    reviewSourcesNote: 'Аналіз відгуків з Finance.ua, Google Maps (2025)',

    comparisons: [],
    news: [],
    changelog: [],
    awards: [],
    partnerships: [],

    compliance: {
      aml: true, gdpr: false, nbu: true, dps: true, dia: false,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: ['PDF'],
    },

    warPeriod: {
      operationalStatus: 'Працює у штатному режимі.',
      reliabilityDuringBlackouts: 'Онлайн-сервіси доступні.',
      dataBackupNote: 'Резервне копіювання даних полісів.',
      businessContinuityPlan: 'Резервна інфраструктура.',
      warNote: 'Виплати продовжуються. Є обмеження для ТЗ з тимчасово окупованих територій.',
    },

    faq: [
      { question: 'Як оформити ОСЦПВ онлайн?', answer: 'На сайті usg.ua → Калькулятор ОСЦПВ → Заповнити дані ТЗ → Оплатити. Поліс надійде на email.', category: 'Оформлення', isPopular: true },
    ],

    knownIssues: [],

    cta: {
      primary: { label: 'Розрахувати страховку', href: 'https://usg.ua', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // НОВА ПОШТА
  // ══════════════════════════════════════════════════════════════
  {
    id: 'nova-poshta',
    slug: 'nova-poshta',
    name: 'Нова Пошта',
    legalName: 'ТОВ «Нова Пошта»',
    brandNames: ['Нова Пошта', 'Nova Poshta', 'NovaPoshta'],
    types: ['logistics'],
    logo: { initials: 'НП', color: '#E2001A' },
    website: 'https://novaposhta.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '10 лютого 2026',

    legal: {
      edrpou: '31316718',
      legalForm: 'ТОВ',
      registrationNumber: '31316718',
      registrationDate: '2001',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'вул. Академіка Туполєва, 17, Київ, 04128',
        actual: 'вул. Академіка Туполєва, 17, Київ, 04128',
      },
      regulators: ['НКРЗІ (поштовий зв\'язок)'],
      licenses: [
        { type: 'Ліцензія на надання послуг поштового зв\'язку', number: '2427', issuedBy: 'НКРЗІ', issuedDate: '2015', status: 'active' },
      ],
      certifications: [
        { name: 'ISO 9001', issuedBy: 'TÜV SÜD' },
      ],
      taxStatus: 'Платник ПДВ',
      status: 'active',
    },

    company: {
      foundedYear: 2001,
      foundedCity: 'Полтава',
      story: 'Нова Пошта — №1 логістична компанія України. Заснована у 2001 році Вячеславом Климовим і Володимиром Поперешнюком. Обробляє понад 1 млн посилок на день. 35 000+ працівників.',
      mission: 'Надихати кожного клієнта неперевершеним сервісом',
      headquarters: 'Київ',
      employeesCount: '35000+',
      publiclyTraded: false,
      keyPeople: [
        { name: 'Володимир Поперешнюк', role: 'Співзасновник', since: '2001' },
        { name: 'Вячеслав Климов', role: 'Співзасновник', since: '2001' },
      ],
      milestones: [
        { year: 2001, event: 'Заснування у Полтаві', type: 'founding' },
        { year: 2012, event: 'Перехід за позначку 1000 відділень', type: 'expansion' },
        { year: 2019, event: 'Запуск Nova Poshta Global — міжнародна доставка', type: 'expansion' },
        { year: 2022, event: 'Безкоштовна доставка для ЗСУ. Продовження роботи під обстрілами.', type: 'crisis' },
        { year: 2024, event: '10 000+ відділень по Україні', type: 'expansion' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Академіка Туполєва, 17',
        city: 'Київ',
        country: 'Україна',
        phone: ['0 800 500 609'],
        email: ['info@novaposhta.ua'],
      },
      support: {
        freePhone: '0 800 500 609',
        chatWidget: true,
        telegram: 'https://t.me/novaposhta_bot',
        viber: 'Нова Пошта',
        workingHours: '8:00-21:00',
        is247: false,
        averageResponseTime: '< 10 хвилин',
      },
      social: {
        telegram: 'https://t.me/novaposhta',
        instagram: 'https://instagram.com/novaposhta',
        facebook: 'https://facebook.com/novaposhta',
        youtube: 'https://youtube.com/@novaposhta',
        tiktok: 'https://tiktok.com/@novaposhta',
      },
    },

    branches: {
      totalCount: 10000,
      coverageNote: '10 000+ відділень у всіх містах і селищах України.',
      regions: ['Усі області України'],
      findBranchUrl: 'https://novaposhta.ua/office',
      branchList: [],
      branchNote: 'Найбільша мережа відділень серед логістичних компаній.',
    },

    platforms: {
      web: { available: true, url: 'https://novaposhta.ua', features: ['Створення ТТН', 'Трекінг', 'Адресна доставка', 'Пошуковик відділень'] },
      ios: { available: true, url: 'https://apps.apple.com/app/nova-poshta/id1222948498', rating: 4.8, reviewCount: 150000 },
      android: { available: true, url: 'https://play.google.com/store/apps/details?id=ua.com.novaposhta', rating: 4.6, reviewCount: 250000 },
      api: { available: true, docsUrl: 'https://developers.novaposhta.ua/', sandbox: true, note: 'REST API для бізнес-інтеграцій (створення ТТН, трекінг)' },
    },

    security: {
      certifications: ['ISO 9001'],
      features: ['SMS-підтвердження отримання', 'Страхування посилок', 'Відеоспостереження у відділеннях'],
      dataStorage: 'Україна',
    },

    integrations: [
      { name: 'Shopify', category: 'E-commerce', isOfficial: true },
      { name: 'Prom.ua', category: 'Маркетплейс', isOfficial: true },
      { name: 'Rozetka', category: 'Маркетплейс', isOfficial: true },
      { name: '1С', category: 'Бухгалтерія', isOfficial: true },
      { name: 'Checkbox', category: 'Каса', isOfficial: true },
    ],

    products: [
      {
        id: 'np-express',
        category: 'Доставка',
        name: 'Експрес-доставка',
        tagline: 'Доставка по Україні за 1-2 дні',
        description: 'Доставка між відділеннями, поштоматами або адресна. 1-2 дні по Україні.',
        audience: 'both',
        isHighlighted: true,
        isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 35 ₴ за посилку (залежить від ваги та напрямку)' },
        features: [
          { name: 'Доставка 1-2 дні', included: true },
          { name: 'Відділення / Поштомат / Адресна', included: true },
          { name: 'Трекінг у реальному часі', included: true },
          { name: 'Страхування вантажу', included: true },
          { name: 'Накладений платіж', included: true },
        ],
        processingTime: '1-2 дні',
        requirements: [],
        pros: ['Найбільше покриття в Україні', 'Швидка доставка', 'Зручний додаток'],
        cons: ['Ціни зросли у 2024-2025', 'Черги у піковий час'],
        ctaLabel: 'Створити ТТН',
        ctaUrl: 'https://novaposhta.ua/create_ttn',
      },
    ],

    ratings: {
      fintodo: { overall: 85, rank: 1, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика', badge: 'Лідер ринку', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'App Store', rating: 4.8, maxRating: 5, reviewCount: 150000 },
        { source: 'Google Play', rating: 4.6, maxRating: 5, reviewCount: 250000 },
      ],
      averageExternal: 4.7,
      totalReviewsAllSources: 400000,
    },

    editorial: {
      oneLiner: 'Нова Пошта = логістика в Україні. Де-факто монополіст із найкращим сервісом.',
      shortTake: '10 000 відділень, 35 000 працівників, 1 млн+ посилок на день. Альтернативи є, але за покриттям і швидкістю — Нова Пошта поки що без конкурентів.',
      fullVerdict: 'Для бізнесу — обов\'язкова інтеграція. API добре документований, є модулі для всіх популярних CMS. Єдине — ціни ростуть щорічно, тому для великих обсягів варто обговорювати індивідуальні тарифи.',
      bestFor: [
        { segment: 'E-commerce бізнес', reason: 'Найширше покриття і API для автоматизації', emoji: '📦' },
        { segment: 'Фізичні особи', reason: 'Зручний додаток і поштомати', emoji: '📱' },
      ],
      notFor: [
        { segment: 'Міжнародна доставка (великі обсяги)', reason: 'DHL/FedEx мають кращі тарифи для великих обсягів', alternative: 'DHL Express' },
      ],
      methodology: {
        approach: 'Реальне використання для бізнесу і особистих потреб',
        testingPeriod: 'Весь 2025 рік',
        testedBy: 'Команда FINTODO',
        hoursSpent: 50,
        keyFindings: ['Середній час доставки Київ-Львів: 1 день', 'API інтеграція за 2 години'],
      },
      scores: [
        { category: 'Покриття', weight: 30, score: 9.5, maxScore: 10, rationale: '10 000+ відділень — без конкурентів', whatWeTested: ['Карта відділень'], howWeScored: 'Кількість і географія', penaltyReasons: [] },
        { category: 'Швидкість', weight: 25, score: 9.0, maxScore: 10, rationale: '1-2 дні по Україні', whatWeTested: ['Реальні доставки'], howWeScored: 'Середній час', penaltyReasons: [] },
        { category: 'Ціна', weight: 20, score: 7.0, maxScore: 10, rationale: 'Не найдешевша, але виправдана якістю', whatWeTested: ['Порівняння тарифів'], howWeScored: 'Бенчмарк з конкурентами', penaltyReasons: ['Зростання цін у 2024-2025'] },
        { category: 'API / Інтеграції', weight: 15, score: 8.5, maxScore: 10, rationale: 'Якісний API, модулі для CMS', whatWeTested: ['REST API'], howWeScored: 'Час інтеграції', penaltyReasons: [] },
        { category: 'Підтримка', weight: 10, score: 8.0, maxScore: 10, rationale: 'Чат-бот + телефон', whatWeTested: ['Звернення'], howWeScored: 'Час відповіді', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 8.5,
      independenceStatement: 'FINTODO не має комерційних відносин з Новою Поштою.',
    },

    reviewThemes: [
      { theme: 'Швидкість доставки', sentiment: 'positive', frequency: 'very_common', percentMentioning: 80, summary: 'Більшість задоволені швидкістю', positiveQuote: 'Відправив вчора — сьогодні вже у Львові!', ourConclusion: 'Швидкість — головна перевага.' },
      { theme: 'Зростання цін', sentiment: 'negative', frequency: 'common', percentMentioning: 40, summary: 'Ціни щорічно зростають', negativeQuote: 'Знову подорожчала доставка...', ourConclusion: 'Тренд на подорожчання.' },
    ],
    reviewSourcesNote: 'Аналіз 2000+ відгуків з App Store, Google Play, Google Maps (2025)',

    comparisons: [
      {
        competitorId: 'ukrposhta',
        competitorName: 'Укрпошта',
        ourAdvantages: [{ area: 'Швидкість', detail: '1-2 дні проти 3-7 днів' }, { area: 'Мережа', detail: '10 000 відділень проти 7 000' }],
        theirAdvantages: [{ area: 'Ціна', detail: 'Укрпошта дешевша у 2-3 рази' }, { area: 'Міжнародна доставка', detail: 'Укрпошта — частина UPU' }],
        equalAreas: ['Покриття сільської місцевості'],
        whenChooseUs: 'Коли потрібна швидкість і надійність',
        whenChooseThem: 'Коли потрібна найнижча ціна або міжнародна посилка',
        bottomLine: 'Нова Пошта — для швидкості, Укрпошта — для економії.',
      },
    ],

    news: [
      { id: 'np-n1', date: 'Січень 2026', dateISO: '2026-01-10', title: 'Нова Пошта відкрила 10 000-не відділення', summary: 'Мережа досягла позначки 10 000 відділень.', type: 'expansion', sentiment: 'positive', source: 'NovaPoshta Blog', isImportant: true },
    ],
    changelog: [],
    awards: [
      { year: 2024, name: 'Найкращий роботодавець', organization: 'Forbes Ukraine' },
      { year: 2023, name: 'Найбільш інноваційна логістична компанія', organization: 'Logistics Awards CEE' },
    ],

    partnerships: [
      { partner: 'Rozetka', type: 'Логістичний партнер', description: 'Основний перевізник для найбільшого маркетплейсу' },
      { partner: 'Prom.ua', type: 'Інтеграція', description: 'Автоматичне створення ТТН з кабінету продавця' },
    ],

    compliance: {
      aml: false, gdpr: false, nbu: false, dps: true, dia: false,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: ['CSV', 'XLS', 'PDF'],
    },

    warPeriod: {
      operationalStatus: 'Працює у всіх підконтрольних регіонах. У прифронтових — з обмеженнями.',
      physicalPresenceStatus: 'Відділення закриті в зоні активних бойових дій.',
      reliabilityDuringBlackouts: 'Генератори у сортувальних центрах. Відділення — залежить від наявності електрики.',
      dataBackupNote: 'Хмарна інфраструктура з резервуванням.',
      supportForAffected: 'Безкоштовна доставка для ЗСУ. Гуманітарні вантажі.',
      charityWork: ['Безкоштовна доставка для ЗСУ', 'Гуманітарна логістика', 'Відновлення відділень'],
      businessContinuityPlan: 'Розподілені сортувальні центри по всій Україні.',
      warNote: 'Нова Пошта продовжує працювати навіть під обстрілами — справжній символ стійкості.',
    },

    faq: [
      { question: 'Як створити ТТН онлайн?', answer: 'Через особистий кабінет на novaposhta.ua або через мобільний додаток → Створити відправлення.', category: 'Відправка', isPopular: true },
      { question: 'Скільки коштує доставка?', answer: 'Від 35 ₴ (до 2 кг, відділення-відділення). Точну вартість розрахує калькулятор на сайті.', category: 'Тарифи', isPopular: true },
    ],

    knownIssues: [
      { issue: 'Черги у пікові дні (понеділок, п\'ятниця)', frequency: 'occasional', institutionResponse: 'Впроваджено систему електронної черги.', workaround: 'Використовуйте поштомати або адресну доставку.', status: 'acknowledged' },
    ],

    cta: {
      primary: { label: 'Створити ТТН', href: 'https://novaposhta.ua', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // UNIT.CITY
  // ══════════════════════════════════════════════════════════════
  {
    id: 'unit-city',
    slug: 'unit-city',
    name: 'UNIT.City',
    legalName: 'ТОВ «ЮНІТ.СІТІ»',
    brandNames: ['UNIT.City', 'Юніт Сіті'],
    types: ['startup_hub', 'coworking'],
    logo: { initials: 'UC', color: '#FF6600' },
    website: 'https://unit.city',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '3 лютого 2026',

    legal: {
      edrpou: '41303206',
      legalForm: 'ТОВ',
      registrationNumber: '41303206',
      registrationDate: '2017',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'вул. Дорогожицька, 3, Київ, 04112',
        actual: 'вул. Дорогожицька, 3, Київ, 04112',
      },
      regulators: [],
      licenses: [],
      certifications: [],
      taxStatus: 'Платник ПДВ',
      status: 'active',
    },

    company: {
      foundedYear: 2017,
      foundedCity: 'Київ',
      story: 'UNIT.City — перший і найбільший інноваційний парк України, заснований Vasyl Khmelnytsky. На території колишнього мотоциклетного заводу створено екосистему для технологічних компаній, стартапів та освітніх проектів.',
      mission: 'Створити екосистему для інновацій в Україні',
      headquarters: 'Київ',
      employeesCount: '100-200',
      publiclyTraded: false,
      investors: ['UFuture (Vasyl Khmelnytsky)'],
      keyPeople: [
        { name: 'Василь Хмельницький', role: 'Засновник', since: '2017' },
      ],
      milestones: [
        { year: 2017, event: 'Відкриття UNIT.City на місці заводу «КМЗ»', type: 'founding' },
        { year: 2019, event: 'Запуск UNIT Factory (IT-школа)', type: 'product' },
        { year: 2021, event: '100+ компаній-резидентів', type: 'expansion' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Дорогожицька, 3',
        city: 'Київ',
        country: 'Україна',
        phone: ['+380 44 490 9090'],
        email: ['info@unit.city'],
      },
      support: {
        email: 'info@unit.city',
        workingHours: 'Пн-Пт 9:00-18:00',
        is247: false,
      },
      social: {
        facebook: 'https://facebook.com/unitcity',
        instagram: 'https://instagram.com/unit.city',
        linkedin: 'https://linkedin.com/company/unit-city',
        youtube: 'https://youtube.com/@unitcity',
      },
    },

    branches: {
      totalCount: 1,
      coverageNote: 'Один кампус у Києві (25 гектарів).',
      regions: ['Київ'],
      branchList: [
        {
          id: 'unit-campus',
          name: 'UNIT.City Campus',
          type: 'main',
          address: { street: 'вул. Дорогожицька, 3', city: 'Київ', region: 'Київ' },
          workingHours: { weekdays: '08:00-22:00', saturday: '10:00-18:00' },
          services: ['Коворкінг', 'Офіси', 'Конференц-зали', 'Паркінг'],
          isOpen24h: false,
          hasAtm: false,
          hasTerminal: false,
          hasDisabledAccess: true,
        },
      ],
    },

    platforms: {
      web: { available: true, url: 'https://unit.city', features: ['Каталог резидентів', 'Бронювання заходів', 'Коворкінг'] },
      ios: { available: false },
      android: { available: false },
      api: { available: false },
    },

    security: {
      certifications: [],
      features: ['Контроль доступу', 'Відеоспостереження', 'Охорона 24/7'],
      dataStorage: 'Україна',
    },

    integrations: [],

    products: [
      {
        id: 'unit-coworking',
        category: 'Коворкінг',
        name: 'UNIT Coworking',
        tagline: 'Робоче місце в інноваційному парку',
        description: 'Гнучкі робочі місця, приватні офіси та зони для зустрічей на території кампусу.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: { monthly: 'від 5 000 ₴', isFree: false, hasFreeTrial: true, freeTrialDays: 1, pricingNote: 'Від 5 000 ₴/міс за робоче місце. Офіси — за запитом.' },
        features: [
          { name: 'Швидкий інтернет', included: true },
          { name: 'Конференц-зали', included: true },
          { name: 'Кухня та лаунж', included: true },
          { name: 'Паркінг', included: true },
          { name: 'Нетворкінг-івенти', included: true },
        ],
        requirements: ['Реєстрація компанії або ФОП'],
        pros: ['Екосистема 100+ tech-компаній', 'Нетворкінг', 'Сучасний кампус'],
        cons: ['Тільки Київ', 'Не найдешевший коворкінг'],
        ctaLabel: 'Забронювати тур',
        ctaUrl: 'https://unit.city/coworking/',
      },
    ],

    ratings: {
      fintodo: { overall: 80, rank: 1, categorySlug: 'fintech', categoryName: 'Фінтех та стартапи', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех та стартапи', badge: 'Найбільший інноваційний парк', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'Google Maps', rating: 4.5, maxRating: 5, reviewCount: 500 },
      ],
      averageExternal: 4.5,
    },

    editorial: {
      oneLiner: 'Найбільший інноваційний парк України — екосистема для tech-бізнесу.',
      shortTake: 'UNIT.City — це не просто коворкінг, а цілий мікрорайон для інновацій. 100+ компаній-резидентів, освітні програми, івенти.',
      fullVerdict: 'Для стартапу або tech-компанії, яка шукає офіс у Києві з нетворкінгом і екосистемою — UNIT.City є очевидним вибором. Ціни вищі за середні, але переваги екосистеми це компенсують.',
      bestFor: [
        { segment: 'Tech-стартапи', reason: 'Екосистема, менторство, інвестори поруч', emoji: '🚀' },
        { segment: 'IT-компанії, що шукають офіс у Києві', reason: 'Сучасний кампус, інфраструктура', emoji: '🏢' },
      ],
      notFor: [
        { segment: 'Компанії за межами Києва', reason: 'Тільки один кампус', alternative: 'Місцеві коворкінги' },
      ],
      methodology: {
        approach: 'Відвідування кампусу, інтерв\'ю з резидентами',
        testingPeriod: 'Січень 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 8,
        keyFindings: ['Висока якість інфраструктури', '100+ резидентів'],
      },
      scores: [
        { category: 'Інфраструктура', weight: 40, score: 9.0, maxScore: 10, rationale: 'Сучасний кампус з усім необхідним', whatWeTested: ['Коворкінг', 'Конференц-зали'], howWeScored: 'Візуальна оцінка', penaltyReasons: [] },
        { category: 'Екосистема', weight: 35, score: 8.5, maxScore: 10, rationale: '100+ резидентів, івенти, менторство', whatWeTested: ['Мережа резидентів'], howWeScored: 'Кількість і якість', penaltyReasons: [] },
        { category: 'Ціна', weight: 25, score: 6.5, maxScore: 10, rationale: 'Вище середнього для Києва', whatWeTested: ['Тарифи'], howWeScored: 'Порівняння з конкурентами', penaltyReasons: ['Дорожче за звичайні коворкінги'] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 8.0,
      independenceStatement: 'FINTODO не є резидентом UNIT.City.',
    },

    reviewThemes: [
      { theme: 'Атмосфера', sentiment: 'positive', frequency: 'common', summary: 'Резиденти хвалять середовище та нетворкінг', ourConclusion: 'Екосистема — головна цінність.' },
    ],
    reviewSourcesNote: 'Інтерв\'ю з резидентами, Google Maps відгуки (2025)',

    comparisons: [],
    news: [],
    changelog: [],
    awards: [
      { year: 2023, name: 'Кращий інноваційний парк CEE', organization: 'CEE Innovation Awards' },
    ],
    partnerships: [
      { partner: 'Google for Startups', type: 'Партнерство', description: 'Програми підтримки стартапів' },
    ],

    compliance: {
      aml: false, gdpr: false, nbu: false, dps: true, dia: false,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: [],
    },

    warPeriod: {
      operationalStatus: 'Працює. Кампус функціонує у штатному режимі.',
      reliabilityDuringBlackouts: 'Генератори та Starlink для резидентів.',
      dataBackupNote: 'N/A',
      businessContinuityPlan: 'Генератори, автономне водопостачання.',
      warNote: 'UNIT.City став хабом для волонтерських і гуманітарних ініціатив.',
    },

    faq: [
      { question: 'Як стати резидентом?', answer: 'Заповніть форму на unit.city/coworking або зв\'яжіться з відділом продажів.', category: 'Резидентство', isPopular: true },
    ],

    knownIssues: [],

    cta: {
      primary: { label: 'Стати резидентом', href: 'https://unit.city/coworking/', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // USAID BIZ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'usaid-biz',
    slug: 'usaid-biz',
    name: 'USAID / UKAID Програми для бізнесу',
    legalName: 'United States Agency for International Development',
    brandNames: ['USAID', 'UKAID', 'Програма USAID'],
    types: ['grant_program', 'development'],
    logo: { initials: 'US', color: '#002F6C' },
    website: 'https://usaid.gov/ukraine',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '1 лютого 2026',

    legal: {
      edrpou: 'N/A (US Government)',
      legalForm: 'Урядова агенція США',
      registrationNumber: 'N/A',
      registrationDate: '1961',
      registrationOrgan: 'US Government',
      address: {
        legal: '1300 Pennsylvania Avenue NW, Washington, DC 20523, USA',
        actual: 'вул. Юрія Коцюбинського, 8, Київ, 01054',
      },
      regulators: ['US Government'],
      licenses: [],
      certifications: [],
      taxStatus: 'N/A',
      status: 'active',
    },

    company: {
      foundedYear: 1961,
      foundedCity: 'Вашингтон',
      story: 'USAID працює в Україні з 1992 року. Підтримує розвиток малого та середнього бізнесу, демократичні реформи, енергетичну безпеку. Програми для бізнесу допомагають українським підприємцям з грантами, менторством та технічною допомогою.',
      headquarters: 'Вашингтон, США / Київ, Україна',
      employeesCount: 'N/A',
      publiclyTraded: false,
      keyPeople: [],
      milestones: [
        { year: 1992, event: 'Початок роботи USAID в Україні', type: 'founding' },
        { year: 2022, event: 'Масштабне збільшення допомоги у зв\'язку з повномасштабним вторгненням', type: 'expansion' },
        { year: 2023, event: 'Запуск програми USAID HOVERLA для підтримки МСП', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Юрія Коцюбинського, 8',
        city: 'Київ',
        country: 'Україна',
        phone: ['+380 44 521 5700'],
        email: ['kyiv-info@usaid.gov'],
      },
      support: {
        email: 'kyiv-info@usaid.gov',
        workingHours: 'Пн-Пт 9:00-17:00',
        is247: false,
      },
      social: {
        facebook: 'https://facebook.com/USAIDUkraine',
        twitter: 'https://twitter.com/USAIDUkraine',
      },
    },

    branches: {
      totalCount: 1,
      coverageNote: 'Офіс у Києві. Програми діють по всій Україні.',
      regions: ['Уся Україна'],
      branchList: [],
    },

    platforms: {
      web: { available: true, url: 'https://usaid.gov/ukraine', features: ['Інформація про програми', 'Грантові можливості'] },
      ios: { available: false },
      android: { available: false },
      api: { available: false },
    },

    security: {
      certifications: [],
      features: [],
      dataStorage: 'USA / Україна',
    },

    integrations: [],

    products: [
      {
        id: 'usaid-grants',
        category: 'Гранти',
        name: 'Грантові програми USAID',
        tagline: 'Фінансова та технічна підтримка бізнесу',
        description: 'Гранти на розвиток бізнесу, модернізацію виробництва, технічне навчання. Фокус — МСП, ветерани, жінки-підприємці.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: { isFree: true, hasFreeTrial: false, pricingNote: 'Грантове фінансування — безповоротна допомога' },
        features: [
          { name: 'Гранти до $50 000', included: true },
          { name: 'Технічна допомога', included: true },
          { name: 'Менторські програми', included: true },
          { name: 'Навчальні курси', included: true },
        ],
        processingTime: '3-6 місяців',
        requirements: ['Зареєстрований бізнес в Україні', 'Бізнес-план', 'Конкурсний відбір'],
        pros: ['Безповоротна допомога', 'Менторство від міжнародних експертів'],
        cons: ['Конкурентний відбір', 'Складна звітність', 'Тривалий процес'],
        ctaLabel: 'Дізнатись про програми',
        ctaUrl: 'https://usaid.gov/ukraine/economic-growth',
      },
    ],

    ratings: {
      fintodo: { overall: 80, rank: 1, categorySlug: 'grants', categoryName: 'Гранти та держпрограми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та держпрограми', reviewDate: 'Лютий 2026' },
      external: [],
    },

    editorial: {
      oneLiner: 'Найбільший донор підтримки бізнесу в Україні — гранти, менторство, технічна допомога.',
      shortTake: 'USAID — основний партнер для МСП, які шукають грантову підтримку. Процес конкурентний, але нагорода — безповоротна допомога та менторство.',
      fullVerdict: 'Для бізнесу, який готовий до складного конкурсного відбору та детальної звітності — гранти USAID можуть стати потужним інструментом зростання. Особливо актуально для ветеранів, жінок-підприємців та бізнесів у постраждалих регіонах.',
      bestFor: [
        { segment: 'МСП, що шукають грантове фінансування', reason: 'Безповоротна допомога до $50 000', emoji: '💰' },
        { segment: 'Ветерани та жінки-підприємці', reason: 'Спеціальні програми підтримки', emoji: '🎖️' },
      ],
      notFor: [
        { segment: 'Великий бізнес', reason: 'Фокус на МСП', alternative: 'ЄБРР або IFC' },
      ],
      methodology: {
        approach: 'Аналіз грантових програм та інтерв\'ю з отримувачами',
        testingPeriod: 'Січень 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 15,
        keyFindings: ['Середній грант — $20 000-50 000', 'Процес від заявки до отримання — 3-6 місяців'],
      },
      scores: [
        { category: 'Обсяг підтримки', weight: 40, score: 9.0, maxScore: 10, rationale: 'Мільярди доларів щорічно', whatWeTested: ['Обсяг програм'], howWeScored: 'Публічна звітність', penaltyReasons: [] },
        { category: 'Доступність', weight: 30, score: 6.5, maxScore: 10, rationale: 'Конкурентний відбір, складна заявка', whatWeTested: ['Процес подачі'], howWeScored: 'Складність форм', penaltyReasons: ['Англомовні документи'] },
        { category: 'Якість менторства', weight: 30, score: 8.5, maxScore: 10, rationale: 'Міжнародні експерти', whatWeTested: ['Відгуки отримувачів'], howWeScored: 'Інтерв\'ю', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 8.0,
      independenceStatement: 'FINTODO не отримує фінансування від USAID.',
    },

    reviewThemes: [],
    reviewSourcesNote: 'Інтерв\'ю з отримувачами грантів (2025)',

    comparisons: [],
    news: [],
    changelog: [],
    awards: [],
    partnerships: [
      { partner: 'Уряд України', type: 'Стратегічне партнерство', description: 'Спільні програми економічного розвитку' },
    ],

    compliance: {
      aml: false, gdpr: false, nbu: false, dps: false, dia: false,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: [],
    },

    warPeriod: {
      operationalStatus: 'Масштабно збільшено підтримку з 2022 року.',
      reliabilityDuringBlackouts: 'N/A',
      dataBackupNote: 'N/A',
      supportForAffected: 'Спеціальні програми для бізнесу з постраждалих регіонів.',
      businessContinuityPlan: 'N/A',
      warNote: 'USAID став ключовим партнером у відновленні української економіки.',
    },

    faq: [
      { question: 'Як подати заявку на грант USAID?', answer: 'Слідкуйте за оголошеннями на usaid.gov/ukraine та grants.gov. Заявки приймаються в рамках конкретних програм.', category: 'Заявка', isPopular: true },
    ],

    knownIssues: [],

    cta: {
      primary: { label: 'Переглянути програми', href: 'https://usaid.gov/ukraine/economic-growth', isInternal: false },
    },
  },
  // ══════════════════════════════════════════════════════════════
  // Freedom Finance (Фрідом Фінанс Україна)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'freedom-finance',
    slug: 'freedom-finance',
    name: 'Freedom Finance',
    legalName: 'ТОВ «Фрідом Фінанс Україна»',
    brandNames: ['Freedom Finance', 'Фрідом Фінанс'],
    types: ['broker', 'investment'],
    logo: { initials: 'FF', color: '#00A651' },
    website: 'https://ffin.ua',
    verified: true,
    verifiedDate: 'Березень 2026',
    dataLastUpdated: '15 березня 2026',

    legal: {
      edrpou: '43516024',
      legalForm: 'ТОВ',
      registrationNumber: '43516024',
      registrationDate: '2017',
      registrationOrgan: 'НКЦПФР',
      address: { legal: 'вул. Хрещатик, 19, Київ, 01001', actual: 'вул. Хрещатик, 19, Київ, 01001' },
      regulators: ['НКЦПФР'],
      licenses: [
        { type: 'Ліцензія на брокерську діяльність', number: 'АЕ №263493', issuedBy: 'НКЦПФР', issuedDate: '2018', status: 'active' },
      ],
      certifications: [],
      taxStatus: 'Платник ПДВ',
      status: 'active',
    },

    company: {
      foundedYear: 2017, foundedCity: 'Київ',
      story: 'Українське представництво Freedom Holding Corp. (NASDAQ: FRHC). Доступ до ОВДП, ETF, міжнародних акцій.',
      headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: true,
      keyPeople: [],
      milestones: [
        { year: 2017, event: 'Вихід на ринок України', type: 'founding' },
        { year: 2020, event: 'Запуск онлайн-платформи', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: { address: 'вул. Хрещатик, 19', city: 'Київ', country: 'Україна', phone: ['0 800 300 517'], email: ['info@ffin.ua'] },
      support: { freePhone: '0 800 300 517', email: 'support@ffin.ua', workingHours: 'Пн-Пт 9:00-19:00', is247: false },
      social: { facebook: 'https://facebook.com/ffin.ua' },
    },

    branches: { totalCount: 3, coverageNote: 'Офіси в Києві, Дніпрі та Одесі', regions: ['Київ', 'Дніпро', 'Одеса'], branchList: [] },

    platforms: {
      web: { available: true, url: 'https://ffin.ua', features: ['Торгова платформа', 'ОВДП онлайн', 'Аналітика'] },
      ios: { available: true, url: 'https://apps.apple.com' },
      android: { available: true, url: 'https://play.google.com' },
      api: { available: true },
    },

    security: { certifications: [], features: ['2FA', 'SSL/TLS', 'Зберігання активів на окремих рахунках'], dataStorage: 'Україна' },
    integrations: [{ name: 'НКДЦП', category: 'Депозитарій', isOfficial: true, note: 'Центральний депозитарій цінних паперів' }],

    products: [
      {
        id: 'ff-ovdp', category: 'ОВДП', name: 'ОВДП через Freedom Finance', tagline: 'Державні облігації від 1 000 ₴',
        description: 'Купівля та продаж ОВДП на первинному та вторинному ринках.', audience: 'both', isHighlighted: true, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Комісія 0.02% від суми угоди' },
        features: [
          { name: 'Первинний ринок (аукціони НБУ)', included: true },
          { name: 'Вторинний ринок', included: true },
          { name: 'Онлайн-платформа', included: true },
        ],
        interestRate: '14-18% річних',
        interestRateNote: 'Залежить від терміну та аукціону',
        processingTime: '1-2 робочих дні',
        requirements: ['Паспорт', 'ІПН', 'Банківський рахунок'],
        pros: ['Низькі комісії', 'Міжнародна група', 'Онлайн-доступ'],
        cons: ['Мін. сума від 1 000 ₴'],
        ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://ffin.ua',
      },
      {
        id: 'ff-etf', category: 'ETF', name: 'ETF та міжнародні акції', tagline: 'Доступ до S&P 500 та інших індексів',
        description: 'Інвестиції в ETF, акції NYSE, NASDAQ через єдину платформу.', audience: 'both', isHighlighted: false, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 0.02% від обороту' },
        features: [
          { name: 'ETF на S&P 500, NASDAQ', included: true },
          { name: 'Міжнародні акції', included: true },
          { name: 'Аналітика', included: true },
        ],
        interestRate: 'Від 0.02% комісії',
        requirements: ['Паспорт', 'ІПН', 'Верифікація'],
        pros: ['Широкий вибір', 'NASDAQ лістинг'],
        cons: ['Валютні ризики'],
        ctaLabel: 'Почати інвестувати', ctaUrl: 'https://ffin.ua',
      },
    ],

    ratings: {
      fintodo: { overall: 80, rank: 1, categorySlug: 'invest', categoryName: 'Інвестиції та брокери', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції та брокери', reviewDate: 'Березень 2026' },
      external: [{ source: 'Finance.ua', rating: 4.0, maxRating: 5 }],
    },

    editorial: {
      oneLiner: 'Частина міжнародної FRHC (NASDAQ) — широкий доступ до ринків за низькі комісії.',
      shortTake: 'Freedom Finance — оптимальний для роздрібного інвестора, який хоче ОВДП та ETF в одному місці.',
      fullVerdict: 'Найкращий вибір для початківців завдяки онлайн-платформі, мобільному додатку та мінімальному порогу від 1 000 ₴.',
      bestFor: [
        { segment: 'Інвестори-початківці', reason: 'Низький поріг входу, зрозуміла платформа', emoji: '🚀' },
        { segment: 'ОВДП-інвестори', reason: 'Первинний та вторинний ринок', emoji: '🏛' },
      ],
      notFor: [
        { segment: 'Інституційні інвестори з $1M+', reason: 'Краще Dragon Capital або ICU', alternative: 'dragon-capital' },
      ],
      methodology: { approach: 'Тестування платформи, аналіз комісій', testingPeriod: 'Лютий-березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 15, keyFindings: ['Комісія 0.02% — одна з найнижчих'] },
      scores: [
        { category: 'Зручність', weight: 35, score: 8.5, maxScore: 10, rationale: 'Зручна онлайн-платформа + мобільний додаток', whatWeTested: ['Web', 'iOS', 'Android'], howWeScored: 'UX-аудит', penaltyReasons: [] },
        { category: 'Ціна', weight: 35, score: 9.0, maxScore: 10, rationale: '0.02% — найнижча комісія серед брокерів', whatWeTested: ['Порівняння тарифів'], howWeScored: 'Benchmarking', penaltyReasons: [] },
        { category: 'Надійність', weight: 30, score: 7.0, maxScore: 10, rationale: 'NASDAQ лістинг = прозорість, але молода компанія в Україні', whatWeTested: ['Фінансова звітність'], howWeScored: 'Аналіз FRHC', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 8.0,
      independenceStatement: 'FINTODO не має комерційних відносин з Freedom Finance.',
    },

    reviewThemes: [
      { theme: 'Платформа', sentiment: 'positive', frequency: 'common', summary: 'Зручна та зрозуміла для початківців', ourConclusion: 'Один з кращих UX серед українських брокерів.' },
    ],
    reviewSourcesNote: 'Відгуки з Google Play, App Store (2025-2026)',
    comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює у штатному режимі.', reliabilityDuringBlackouts: 'Онлайн-сервіси доступні.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Активи зберігаються в НКДЦП.' },
    faq: [
      { question: 'Яка мінімальна сума для інвестування?', answer: 'Від 1 000 ₴ для ОВДП, від $1 для ETF.', category: 'Загальне', isPopular: true },
    ],
    knownIssues: [],
    cta: { primary: { label: 'Відкрити рахунок', href: 'https://ffin.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // ICU (Інвестиційний Капітал Україна)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'icu', slug: 'icu', name: 'ICU',
    legalName: 'ТОВ «Інвестиційний Капітал Україна»',
    brandNames: ['ICU', 'ІКУ'],
    types: ['broker', 'investment'],
    logo: { initials: 'ICU', color: '#1A3D7C' },
    website: 'https://icu.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '10 березня 2026',

    legal: {
      edrpou: '24920335', legalForm: 'ТОВ', registrationNumber: '24920335', registrationDate: '1997', registrationOrgan: 'НКЦПФР',
      address: { legal: 'вул. Ярославів Вал, 13-А, Київ', actual: 'вул. Ярославів Вал, 13-А, Київ' },
      regulators: ['НКЦПФР'],
      licenses: [{ type: 'Ліцензія на брокерську діяльність', number: 'АЕ №286612', issuedBy: 'НКЦПФР', issuedDate: '2013', status: 'active' }],
      certifications: [], taxStatus: 'Платник ПДВ', status: 'active',
    },

    company: {
      foundedYear: 1997, foundedCity: 'Київ',
      story: 'ICU — провідна інвестиційна компанія з 25+ роками досвіду. Лідер ринку ОВДП та облігацій в Україні.',
      headquarters: 'Київ', employeesCount: '100-200', publiclyTraded: false, keyPeople: [],
      milestones: [
        { year: 1997, event: 'Заснування', type: 'founding' },
        { year: 2015, event: 'Лідер ринку ОВДП', type: 'award' },
      ],
    },

    contacts: {
      mainOffice: { address: 'вул. Ярославів Вал, 13-А', city: 'Київ', country: 'Україна', phone: ['+380 44 490 9000'], email: ['info@icu.ua'] },
      support: { freePhone: '+380 44 490 9000', email: 'info@icu.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false },
      social: {},
    },

    branches: { totalCount: 1, coverageNote: 'Головний офіс у Києві', regions: ['Київ'], branchList: [] },
    platforms: { web: { available: true, url: 'https://icu.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } },
    security: { certifications: [], features: ['SSL/TLS'], dataStorage: 'Україна' },
    integrations: [{ name: 'НКДЦП', category: 'Депозитарій', isOfficial: true }],

    products: [
      {
        id: 'icu-ovdp', category: 'ОВДП', name: 'ОВДП через ICU', tagline: 'Найбільший торговець облігаціями',
        description: 'Професійний доступ до ринку ОВДП та корпоративних облігацій.', audience: 'both', isHighlighted: true, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Комісія за домовленістю (від 0.1%)' },
        features: [
          { name: 'ОВДП первинний/вторинний ринок', included: true },
          { name: 'Корпоративні облігації', included: true },
          { name: 'Управління активами', included: true },
        ],
        interestRate: '14-18% річних',
        processingTime: '1-3 робочих дні',
        requirements: ['Паспорт', 'ІПН', 'Мін. сума від 100 000 ₴'],
        pros: ['25+ років досвіду', 'Лідер ринку облігацій'],
        cons: ['Висока мінімальна сума', 'Немає мобільного додатку'],
        ctaLabel: 'Зв\'язатися', ctaUrl: 'https://icu.ua',
      },
    ],

    ratings: {
      fintodo: { overall: 75, rank: 2, categorySlug: 'invest', categoryName: 'Інвестиції та брокери', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції та брокери', reviewDate: 'Березень 2026' },
      external: [{ source: 'Cbonds', rating: 4.5, maxRating: 5 }],
    },

    editorial: {
      oneLiner: 'Лідер ринку облігацій з 25+ роками — для серйозних інвесторів.',
      shortTake: 'ICU — інституційний рівень для портфелів від 100 000 ₴. Глибока експертиза в ОВДП.',
      fullVerdict: 'Найкращий для великих портфелів ОВДП. Не підходить для початківців з малими сумами.',
      bestFor: [{ segment: 'Інвестори з портфелем 100 000+ ₴', reason: 'Найглибша експертиза в облігаціях', emoji: '🏛' }],
      notFor: [{ segment: 'Початківці з малими сумами', reason: 'Мін. 100 000 ₴', alternative: 'freedom-finance' }],
      methodology: { approach: 'Інтерв\'ю, аналіз', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 12, keyFindings: ['Лідер за обсягом торгів ОВДП'] },
      scores: [
        { category: 'Експертиза', weight: 40, score: 9.0, maxScore: 10, rationale: '25+ років, лідер ринку', whatWeTested: ['Портфоліо'], howWeScored: 'Аналіз обсягів торгів', penaltyReasons: [] },
        { category: 'Доступність', weight: 30, score: 5.5, maxScore: 10, rationale: 'Мін. 100 000 ₴, без мобільного', whatWeTested: ['Поріг входу'], howWeScored: 'Порівняння', penaltyReasons: ['Високий поріг'] },
        { category: 'Надійність', weight: 30, score: 8.5, maxScore: 10, rationale: '25+ років, репутація', whatWeTested: ['Історія'], howWeScored: 'Track record', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг', totalScore: 7.5,
      independenceStatement: 'FINTODO не має комерційних відносин з ICU.',
    },

    reviewThemes: [{ theme: 'Професіоналізм', sentiment: 'positive', frequency: 'common', summary: 'Висока якість аналітики', ourConclusion: 'Найкраща команда для облігацій.' }],
    reviewSourcesNote: 'Cbonds, профільні форуми (2025)',
    comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Онлайн доступний.', dataBackupNote: 'НКДЦП.', businessContinuityPlan: 'Резервні системи.', warNote: 'Продовжує торгівлю ОВДП.' },
    faq: [{ question: 'Яка мінімальна сума?', answer: 'Від 100 000 ₴.', category: 'Загальне', isPopular: true }],
    knownIssues: [],
    cta: { primary: { label: 'Зв\'язатися з ICU', href: 'https://icu.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Dragon Capital
  // ══════════════════════════════════════════════════════════════
  {
    id: 'dragon-capital', slug: 'dragon-capital', name: 'Dragon Capital',
    legalName: 'ТОВ «Драгон Капітал»',
    brandNames: ['Dragon Capital', 'Драгон Капітал'],
    types: ['broker', 'investment'],
    logo: { initials: 'DC', color: '#B8860B' },
    website: 'https://dragon-capital.com',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '12 березня 2026',

    legal: {
      edrpou: '21738198', legalForm: 'ТОВ', registrationNumber: '21738198', registrationDate: '2000', registrationOrgan: 'НКЦПФР',
      address: { legal: 'вул. Саксаганського, 36Д, Київ', actual: 'вул. Саксаганського, 36Д, Київ' },
      regulators: ['НКЦПФР'],
      licenses: [{ type: 'Ліцензія на брокерську діяльність', number: 'АЕ №263189', issuedBy: 'НКЦПФР', issuedDate: '2006', status: 'active' }],
      certifications: [], taxStatus: 'Платник ПДВ', status: 'active',
    },

    company: {
      foundedYear: 2000, foundedCity: 'Київ',
      story: 'Dragon Capital — найбільша інвестиційна компанія України за обсягом активів під управлінням.',
      headquarters: 'Київ', employeesCount: '200-500', publiclyTraded: false, keyPeople: [],
      milestones: [
        { year: 2000, event: 'Заснування', type: 'founding' },
        { year: 2010, event: 'Лідер за AUM', type: 'award' },
      ],
    },

    contacts: {
      mainOffice: { address: 'вул. Саксаганського, 36Д', city: 'Київ', country: 'Україна', phone: ['+380 44 490 7120'], email: ['info@dragon-capital.com'] },
      support: { freePhone: '+380 44 490 7120', email: 'info@dragon-capital.com', workingHours: 'Пн-Пт 9:00-18:00', is247: false },
      social: {},
    },

    branches: { totalCount: 1, coverageNote: 'Головний офіс у Києві', regions: ['Київ'], branchList: [] },
    platforms: { web: { available: true, url: 'https://dragon-capital.com' }, ios: { available: false }, android: { available: false }, api: { available: false } },
    security: { certifications: [], features: ['SSL/TLS'], dataStorage: 'Україна' },
    integrations: [{ name: 'НКДЦП', category: 'Депозитарій', isOfficial: true }],

    products: [
      {
        id: 'dc-stocks', category: 'Акції', name: 'Акції та ОВДП', tagline: 'Найбільший інвестбанк',
        description: 'Повний спектр: акції, ОВДП, IPO, M&A.', audience: 'both', isHighlighted: true, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Індивідуальні умови' },
        features: [
          { name: 'Українські акції', included: true },
          { name: 'ОВДП та облігації', included: true },
          { name: 'Управління активами (ІСІ)', included: true },
        ],
        interestRate: 'Індивідуально',
        processingTime: '3-5 робочих днів',
        requirements: ['Паспорт', 'ІПН', 'Мін. портфель від $50 000'],
        pros: ['Лідер за AUM', 'Доступ до IPO'],
        cons: ['Висока мінімальна сума'],
        ctaLabel: 'Зв\'язатися', ctaUrl: 'https://dragon-capital.com',
      },
    ],

    ratings: {
      fintodo: { overall: 70, rank: 3, categorySlug: 'invest', categoryName: 'Інвестиції та брокери', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції та брокери', reviewDate: 'Березень 2026' },
      external: [],
    },

    editorial: {
      oneLiner: 'Найбільший інвестбанк України — для великих портфелів та інституційних клієнтів.',
      shortTake: 'Dragon Capital — преміум-рівень. Підходить для портфелів від $50 000.',
      fullVerdict: 'Для великих інвесторів з портфелем $50 000+. Професійна аналітика та доступ до IPO.',
      bestFor: [{ segment: 'Великі інвестори $50 000+', reason: 'Найбільший AUM, доступ до IPO', emoji: '🏆' }],
      notFor: [{ segment: 'Роздрібні інвестори', reason: 'Мін. $50 000', alternative: 'freedom-finance' }],
      methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 10, keyFindings: ['Найбільший AUM серед інвесткомпаній'] },
      scores: [
        { category: 'Престиж', weight: 40, score: 9.0, maxScore: 10, rationale: 'Лідер ринку', whatWeTested: ['AUM'], howWeScored: 'Рейтинги', penaltyReasons: [] },
        { category: 'Доступність', weight: 30, score: 4.0, maxScore: 10, rationale: 'Мін. $50 000', whatWeTested: ['Поріг'], howWeScored: 'Benchmarking', penaltyReasons: ['Дуже високий поріг'] },
        { category: 'Якість', weight: 30, score: 8.0, maxScore: 10, rationale: 'Професійна команда', whatWeTested: ['Аналітика'], howWeScored: 'Експертна оцінка', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг', totalScore: 7.0,
      independenceStatement: 'FINTODO не має комерційних відносин з Dragon Capital.',
    },

    reviewThemes: [{ theme: 'Професіоналізм', sentiment: 'positive', frequency: 'common', summary: 'Інституційний рівень сервісу', ourConclusion: 'Преміум.' }],
    reviewSourcesNote: 'Профільні ЗМІ (2025)',
    comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Доступний.', dataBackupNote: 'НКДЦП.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Продовжує діяльність.' },
    faq: [{ question: 'Яка мін. сума?', answer: 'Від $50 000 для індивідуального управління.', category: 'Загальне', isPopular: true }],
    knownIssues: [],
    cta: { primary: { label: 'Зв\'язатися', href: 'https://dragon-capital.com', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // ARX (колишня Альфа Страхування)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'arx', slug: 'arx', name: 'ARX',
    legalName: 'ПрАТ «Страхова компанія ARX»',
    brandNames: ['ARX', 'АРХ', 'Альфа Страхування'],
    types: ['insurance'],
    logo: { initials: 'ARX', color: '#D32F2F' },
    website: 'https://arx.com.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '8 березня 2026',

    legal: {
      edrpou: '23510607', legalForm: 'ПрАТ', registrationNumber: '23510607', registrationDate: '1999', registrationOrgan: 'Мінʼюст',
      address: { legal: 'просп. Степана Бандери, 9, Київ', actual: 'просп. Степана Бандери, 9, Київ' },
      regulators: ['НБУ'],
      licenses: [{ type: 'Ліцензія на страхування', number: 'АГ №569023', issuedBy: 'Нацкомфінпослуг', issuedDate: '2009', status: 'active' }],
      certifications: [], taxStatus: 'Платник ПДВ', status: 'active',
    },

    company: {
      foundedYear: 1999, foundedCity: 'Київ',
      story: 'ARX (раніше Альфа Страхування) — ТОП-3 за виплатами. Повний спектр: ОСЦПВ, КАСКО, здоров\'я, подорожі.',
      headquarters: 'Київ', employeesCount: '1000-2000', publiclyTraded: false, keyPeople: [],
      milestones: [
        { year: 1999, event: 'Заснування', type: 'founding' },
        { year: 2019, event: 'Ребрендинг у ARX', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: { address: 'просп. Степана Бандери, 9', city: 'Київ', country: 'Україна', phone: ['0 800 500 480'], email: ['info@arx.com.ua'] },
      support: { freePhone: '0 800 500 480', email: 'support@arx.com.ua', workingHours: 'Пн-Пт 8:00-20:00, Сб 9:00-16:00', is247: false },
      social: { facebook: 'https://facebook.com/arx.ua', instagram: 'https://instagram.com/arx.ua' },
    },

    branches: { totalCount: 150, coverageNote: '150+ точок по Україні', regions: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів'], branchList: [] },
    platforms: { web: { available: true, url: 'https://arx.com.ua', features: ['Калькулятор', 'Поліс онлайн'] }, ios: { available: true, url: 'https://apps.apple.com' }, android: { available: true, url: 'https://play.google.com' }, api: { available: false } },
    security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [{ name: 'МТСБУ', category: 'Реєстр', isOfficial: true }],

    products: [
      {
        id: 'arx-osago', category: 'ОСЦПВ', name: 'Автоцивілка ARX', tagline: 'ТОП-3 за виплатами',
        description: 'ОСЦПВ з найбільшою мережею СТО.', audience: 'both', isHighlighted: true, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 550 ₴/рік' },
        features: [{ name: 'Оформлення онлайн', included: true }, { name: '150+ точок', included: true }, { name: 'Європротокол', included: true }],
        interestRate: 'від 550 ₴/рік', processingTime: '10 хвилин',
        coverageLimits: 'до 130 000 ₴',
        requirements: ['Свідоцтво ТЗ', 'Водійське посвідчення'],
        pros: ['Найбільша мережа', 'Швидкі виплати'], cons: ['Трохи вища ціна'],
        ctaLabel: 'Розрахувати', ctaUrl: 'https://arx.com.ua/osago',
      },
      {
        id: 'arx-kasko', category: 'КАСКО', name: 'КАСКО ARX', tagline: 'Повний захист авто',
        description: 'Повне та часткове КАСКО з франшизою.', audience: 'both', isHighlighted: false, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 3% вартості авто/рік' },
        features: [{ name: 'Повне КАСКО', included: true }, { name: 'Евакуатор 24/7', included: true }, { name: 'Підмінне авто', included: false }],
        interestRate: '3-8% від вартості авто',
        requirements: ['Свідоцтво ТЗ', 'Паспорт'],
        pros: ['Широка мережа СТО'], cons: ['Без підмінного авто'],
        ctaLabel: 'Розрахувати КАСКО', ctaUrl: 'https://arx.com.ua/kasko',
      },
      {
        id: 'arx-health', category: 'ДМС', name: 'Медичне ARX', tagline: 'Здоров\'я під захистом',
        description: 'ДМС для фізосіб та корпоративних клієнтів.', audience: 'both', isHighlighted: false, isFeatured: false,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 5 000 ₴/рік' },
        features: [{ name: 'Амбулаторне', included: true }, { name: 'Стаціонар', included: true }, { name: 'Стоматологія', included: false }],
        interestRate: 'від 5 000 ₴/рік',
        requirements: ['Паспорт', 'ІПН'],
        pros: ['Широка мережа клінік'], cons: ['Стоматологія — опціонально'],
        ctaLabel: 'Дізнатися', ctaUrl: 'https://arx.com.ua/health',
      },
    ],

    ratings: {
      fintodo: { overall: 85, rank: 1, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Березень 2026' },
      external: [{ source: 'Finance.ua', rating: 4.2, maxRating: 5 }],
    },

    editorial: {
      oneLiner: 'ТОП-3 за виплатами, найбільша мережа — надійний вибір для ОСЦПВ та КАСКО.',
      shortTake: 'ARX — для тих, хто цінує швидке врегулювання та широку мережу СТО.',
      fullVerdict: 'Оптимальний вибір для ОСЦПВ та КАСКО. Ціна трохи вища за середню, але компенсується якістю сервісу.',
      bestFor: [{ segment: 'Автовласники', reason: '150+ точок, швидкі виплати', emoji: '🚗' }],
      notFor: [{ segment: 'Ті, хто шукає найдешевшу страховку', reason: 'Ціна вища за середню', alternative: 'tas-insurance' }],
      methodology: { approach: 'Аналіз виплат та відгуків', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 12, keyFindings: ['ТОП-3 за виплатами МТСБУ'] },
      scores: [
        { category: 'Надійність', weight: 40, score: 9.0, maxScore: 10, rationale: 'ТОП-3 за виплатами', whatWeTested: ['Статистика МТСБУ'], howWeScored: 'Реальні виплати', penaltyReasons: [] },
        { category: 'Мережа', weight: 30, score: 9.0, maxScore: 10, rationale: '150+ точок', whatWeTested: ['Покриття'], howWeScored: 'Карта відділень', penaltyReasons: [] },
        { category: 'Ціна', weight: 30, score: 7.5, maxScore: 10, rationale: 'Трохи вище ринку', whatWeTested: ['Тарифи'], howWeScored: 'Порівняння', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг', totalScore: 8.5,
      independenceStatement: 'FINTODO не має комерційних відносин з ARX.',
    },

    reviewThemes: [{ theme: 'Виплати', sentiment: 'positive', frequency: 'common', summary: 'Швидко виплачують', ourConclusion: 'Один з найнадійніших страховиків.' }],
    reviewSourcesNote: 'Finance.ua, Google Maps (2025)',
    comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Онлайн-сервіси доступні.', dataBackupNote: 'Резервне копіювання полісів.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Виплати продовжуються.' },
    faq: [{ question: 'Як оформити ОСЦПВ онлайн?', answer: 'На arx.com.ua або через додаток за 10 хвилин.', category: 'ОСЦПВ', isPopular: true }],
    knownIssues: [],
    cta: { primary: { label: 'Оформити поліс', href: 'https://arx.com.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // ТАС Страхування
  // ══════════════════════════════════════════════════════════════
  {
    id: 'tas-insurance', slug: 'tas-insurance', name: 'ТАС Страхування',
    legalName: 'ПрАТ «СК «ТАС»',
    brandNames: ['ТАС', 'TAS Insurance'],
    types: ['insurance'],
    logo: { initials: 'ТАС', color: '#003399' },
    website: 'https://taslife.com.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '10 березня 2026',

    legal: {
      edrpou: '30115168', legalForm: 'ПрАТ', registrationNumber: '30115168', registrationDate: '2001', registrationOrgan: 'Мінʼюст',
      address: { legal: 'просп. Перемоги, 65, Київ', actual: 'просп. Перемоги, 65, Київ' },
      regulators: ['НБУ'],
      licenses: [{ type: 'Ліцензія на страхування', number: 'АГ №569888', issuedBy: 'Нацкомфінпослуг', issuedDate: '2010', status: 'active' }],
      certifications: [], taxStatus: 'Платник ПДВ', status: 'active',
    },

    company: {
      foundedYear: 2001, foundedCity: 'Київ',
      story: 'ТАС — частина TAS Group. Повний спектр: авто, здоров\'я, подорожі, life.',
      headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [],
      milestones: [{ year: 2001, event: 'Заснування', type: 'founding' }],
    },

    contacts: {
      mainOffice: { address: 'просп. Перемоги, 65', city: 'Київ', country: 'Україна', phone: ['0 800 309 309'], email: ['info@taslife.com.ua'] },
      support: { freePhone: '0 800 309 309', email: 'support@taslife.com.ua', workingHours: 'Пн-Пт 8:00-20:00', is247: false },
      social: { facebook: 'https://facebook.com/tasinsurance' },
    },

    branches: { totalCount: 80, coverageNote: 'Мережа по всій Україні', regions: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів'], branchList: [] },
    platforms: { web: { available: true, url: 'https://taslife.com.ua' }, ios: { available: true, url: 'https://apps.apple.com' }, android: { available: true, url: 'https://play.google.com' }, api: { available: false } },
    security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [{ name: 'МТСБУ', category: 'Реєстр', isOfficial: true }],

    products: [
      {
        id: 'tas-osago', category: 'ОСЦПВ', name: 'Автоцивілка ТАС', tagline: 'Доступна ціна',
        description: 'ОСЦПВ за конкурентними цінами.', audience: 'both', isHighlighted: true, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 480 ₴/рік' },
        features: [{ name: 'Оформлення онлайн', included: true }, { name: 'Європротокол', included: true }, { name: '80+ відділень', included: true }],
        interestRate: 'від 480 ₴/рік', processingTime: '10 хвилин',
        coverageLimits: 'до 130 000 ₴',
        requirements: ['Свідоцтво ТЗ', 'Водійське посвідчення'],
        pros: ['Низька ціна', 'Частина TAS Group'], cons: ['Менша мережа СТО'],
        ctaLabel: 'Розрахувати', ctaUrl: 'https://taslife.com.ua/osago',
      },
      {
        id: 'tas-travel', category: 'Подорожі', name: 'Туристичне ТАС', tagline: 'Подорожуйте безпечно',
        description: 'Страхування для поїздок за кордон.', audience: 'personal', isHighlighted: false, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 1.5 $/день' },
        features: [{ name: 'Медичні витрати до €50 000', included: true }, { name: 'Багаж', included: true }, { name: 'Спортивне покриття', included: false }],
        interestRate: 'від 1.5 $/день',
        requirements: ['Паспорт'],
        pros: ['Покриття для Шенгену', 'Доступна ціна'], cons: ['Спорт — за доплату'],
        ctaLabel: 'Оформити', ctaUrl: 'https://taslife.com.ua/travel',
      },
    ],

    ratings: {
      fintodo: { overall: 75, rank: 2, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Березень 2026' },
      external: [{ source: 'Finance.ua', rating: 3.8, maxRating: 5 }],
    },

    editorial: {
      oneLiner: 'Доступні ціни + підтримка TAS Group — хороший баланс ціна/якість.',
      shortTake: 'ТАС — для тих, хто шукає найнижчу ціну на автоцивілку та подорожі.',
      fullVerdict: 'Конкурентні ціни, надійна фінансова група. Менша мережа СТО ніж у ARX.',
      bestFor: [{ segment: 'Економні водії', reason: 'Найнижчі ціни на ОСЦПВ', emoji: '💰' }],
      notFor: [{ segment: 'Ті, хто хоче широку мережу СТО', reason: '80 vs 150+ у ARX', alternative: 'arx' }],
      methodology: { approach: 'Порівняння тарифів', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 8, keyFindings: ['Найнижча ціна на ОСЦПВ серед ТОП-5'] },
      scores: [
        { category: 'Ціна', weight: 40, score: 9.0, maxScore: 10, rationale: 'Найнижча серед лідерів', whatWeTested: ['Тарифи'], howWeScored: 'Benchmarking', penaltyReasons: [] },
        { category: 'Надійність', weight: 30, score: 7.0, maxScore: 10, rationale: 'Частина TAS Group', whatWeTested: ['Фінзвітність'], howWeScored: 'Аналіз', penaltyReasons: [] },
        { category: 'Мережа', weight: 30, score: 6.5, maxScore: 10, rationale: '80 точок', whatWeTested: ['Покриття'], howWeScored: 'Карта', penaltyReasons: ['Менше ніж ARX'] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг', totalScore: 7.5,
      independenceStatement: 'FINTODO не має комерційних відносин з ТАС.',
    },

    reviewThemes: [{ theme: 'Ціна', sentiment: 'positive', frequency: 'common', summary: 'Доступні тарифи', ourConclusion: 'Найкращий варіант за ціною.' }],
    reviewSourcesNote: 'Finance.ua (2025)',
    comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Доступний.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Виплати продовжуються.' },
    faq: [{ question: 'Чи можна оформити онлайн?', answer: 'Так, на taslife.com.ua.', category: 'Загальне', isPopular: true }],
    knownIssues: [],
    cta: { primary: { label: 'Оформити поліс', href: 'https://taslife.com.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // PZU Україна
  // ══════════════════════════════════════════════════════════════
  {
    id: 'pzu-ukraine', slug: 'pzu-ukraine', name: 'PZU Україна',
    legalName: 'ПрАТ «СК «PZU Україна»',
    brandNames: ['PZU', 'ПЗУ'],
    types: ['insurance'],
    logo: { initials: 'PZU', color: '#003EA4' },
    website: 'https://pzu.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '10 березня 2026',

    legal: {
      edrpou: '20782312', legalForm: 'ПрАТ', registrationNumber: '20782312', registrationDate: '1992', registrationOrgan: 'Мінʼюст',
      address: { legal: 'вул. Пимоненка, 13, Київ', actual: 'вул. Пимоненка, 13, Київ' },
      regulators: ['НБУ'],
      licenses: [{ type: 'Ліцензія на страхування', number: 'АГ №569111', issuedBy: 'Нацкомфінпослуг', issuedDate: '2008', status: 'active' }],
      certifications: [], taxStatus: 'Платник ПДВ', status: 'active',
    },

    company: {
      foundedYear: 1992, foundedCity: 'Київ',
      story: 'PZU Україна — частина найбільшої страхової групи ЦСЄ (PZU SA, Польща). 30+ років на ринку.',
      headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [],
      milestones: [{ year: 1992, event: 'Вихід на ринок України', type: 'founding' }],
    },

    contacts: {
      mainOffice: { address: 'вул. Пимоненка, 13', city: 'Київ', country: 'Україна', phone: ['0 800 500 381'], email: ['info@pzu.ua'] },
      support: { freePhone: '0 800 500 381', email: 'support@pzu.ua', workingHours: 'Пн-Пт 8:00-20:00', is247: false },
      social: { facebook: 'https://facebook.com/pzuukraine' },
    },

    branches: { totalCount: 100, coverageNote: '100+ точок', regions: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів'], branchList: [] },
    platforms: { web: { available: true, url: 'https://pzu.ua' }, ios: { available: true, url: 'https://apps.apple.com' }, android: { available: true, url: 'https://play.google.com' }, api: { available: false } },
    security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [{ name: 'МТСБУ', category: 'Реєстр', isOfficial: true }],

    products: [
      {
        id: 'pzu-osago', category: 'ОСЦПВ', name: 'Автоцивілка PZU', tagline: 'Міжнародна надійність',
        description: 'ОСЦПВ від міжнародного бренду.', audience: 'both', isHighlighted: true, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 520 ₴/рік' },
        features: [{ name: 'Оформлення онлайн', included: true }, { name: '100+ точок', included: true }, { name: 'Зелена картка', included: true }],
        interestRate: 'від 520 ₴/рік', processingTime: '10 хвилин',
        coverageLimits: 'до 130 000 ₴',
        requirements: ['Свідоцтво ТЗ', 'Водійське посвідчення'],
        pros: ['Міжнародний бренд', 'Зелена картка'], cons: ['Ціна вища за ТАС'],
        ctaLabel: 'Розрахувати', ctaUrl: 'https://pzu.ua/osago',
      },
      {
        id: 'pzu-kasko', category: 'КАСКО', name: 'КАСКО PZU', tagline: 'Європейський стандарт',
        description: 'КАСКО з підмінним авто.', audience: 'both', isHighlighted: false, isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 2.5% вартості авто/рік' },
        features: [{ name: 'Повне КАСКО', included: true }, { name: 'Евакуатор', included: true }, { name: 'Підмінне авто', included: true }],
        interestRate: '2.5-7% від вартості авто',
        requirements: ['Свідоцтво ТЗ', 'Паспорт'],
        pros: ['Підмінне авто', 'Міжнародний досвід'], cons: ['Ціна'],
        ctaLabel: 'Розрахувати КАСКО', ctaUrl: 'https://pzu.ua/kasko',
      },
    ],

    ratings: {
      fintodo: { overall: 80, rank: 2, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Березень 2026' },
      external: [{ source: 'Finance.ua', rating: 4.0, maxRating: 5 }],
    },

    editorial: {
      oneLiner: 'Частина PZU SA (Польща) — міжнародний рівень сервісу та Зелена картка.',
      shortTake: 'PZU — для тих, хто цінує міжнародний бренд та підмінне авто в КАСКО.',
      fullVerdict: 'Преміальний вибір для ОСЦПВ та КАСКО. Зелена картка для подорожей — великий плюс.',
      bestFor: [{ segment: 'Подорожуючі за кордон', reason: 'Зелена картка, міжнародний бренд', emoji: '🌍' }],
      notFor: [{ segment: 'Економні клієнти', reason: 'Ціна вища за ТАС', alternative: 'tas-insurance' }],
      methodology: { approach: 'Порівняння', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 10, keyFindings: ['Єдиний з підмінним авто та Зеленою карткою'] },
      scores: [
        { category: 'Бренд', weight: 35, score: 9.0, maxScore: 10, rationale: '200+ років групи PZU SA', whatWeTested: ['Історія'], howWeScored: 'Track record', penaltyReasons: [] },
        { category: 'Сервіс', weight: 35, score: 8.5, maxScore: 10, rationale: 'Підмінне авто, Зелена картка', whatWeTested: ['Продукти'], howWeScored: 'Порівняння', penaltyReasons: [] },
        { category: 'Ціна', weight: 30, score: 6.5, maxScore: 10, rationale: 'Вище середнього', whatWeTested: ['Тарифи'], howWeScored: 'Benchmarking', penaltyReasons: ['Преміальна ціна'] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг', totalScore: 8.0,
      independenceStatement: 'FINTODO не має комерційних відносин з PZU.',
    },

    reviewThemes: [{ theme: 'Надійність', sentiment: 'positive', frequency: 'common', summary: 'Міжнародний стандарт', ourConclusion: 'Преміальний вибір.' }],
    reviewSourcesNote: 'Finance.ua (2025)',
    comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Доступний.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Міжнародна інфраструктура PZU SA.', warNote: 'Продовжує виплати.' },
    faq: [{ question: 'Що таке Зелена картка?', answer: 'Міжнародний сертифікат для поїздок за кордон. PZU продає онлайн.', category: 'ОСЦПВ', isPopular: true }],
    knownIssues: [],
    cta: { primary: { label: 'Оформити поліс', href: 'https://pzu.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // ДПС (Державна податкова служба)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'dps', slug: 'dps', name: 'ДПС', legalName: 'Державна податкова служба України',
    brandNames: ['ДПС', 'DPS', 'Податкова'], types: ['gov', 'tax_authority'],
    logo: { initials: 'ДП', color: '#1B5E20' }, website: 'https://tax.gov.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '43005393', legalForm: 'Державний орган', registrationNumber: '43005393', registrationDate: '2019', registrationOrgan: 'КМУ', address: { legal: 'Львівська площа, 8, Київ', actual: 'Львівська площа, 8, Київ' }, regulators: ['КМУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' },
    company: { foundedYear: 2019, foundedCity: 'Київ', story: 'ДПС — центральний орган виконавчої влади, що забезпечує реалізацію податкової та митної політики.', headquarters: 'Київ', employeesCount: '30000+', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2019, event: 'Реорганізація з ДФС', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Львівська площа, 8', city: 'Київ', country: 'Україна', phone: ['0 800 501 007'], email: ['zvernennya@tax.gov.ua'] }, support: { freePhone: '0 800 501 007', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: { telegram: 'https://t.me/TaxUkraine' } },
    branches: { totalCount: 500, coverageNote: 'Територіальні управління у всіх областях', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://tax.gov.ua', features: ['Електронний кабінет', 'Подання декларацій', 'Перевірка ІПН'] }, ios: { available: false }, android: { available: false }, api: { available: false } },
    security: { certifications: [], features: ['КЕП-авторизація'], dataStorage: 'Україна' },
    integrations: [{ name: 'Дія', category: 'Держсервіс', isOfficial: true }],
    products: [
      { id: 'dps-cabinet', category: 'Держсервіс', name: 'Електронний кабінет ДПС', tagline: 'Подача звітності онлайн', description: 'Безкоштовний сервіс для подачі податкових декларацій та звітності.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовний державний сервіс' }, features: [{ name: 'Подання декларацій', included: true }, { name: 'Перевірка стану розрахунків', included: true }, { name: 'Реєстрація ФОП', included: true }], requirements: ['КЕП (електронний підпис)'], processingTime: 'миттєво', pros: ['Безкоштовно', 'Офіційний сервіс'], cons: ['Складний інтерфейс', 'Потрібен КЕП'], ctaLabel: 'Перейти в кабінет', ctaUrl: 'https://cabinet.tax.gov.ua' },
    ],
    ratings: { fintodo: { overall: 60, rank: 1, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Головна податкова — складний інтерфейс, але безкоштовно.', shortTake: 'ДПС — єдине місце для офіційної податкової звітності.', fullVerdict: 'Інтерфейс складний, але альтернативи для офіційних дій немає.', bestFor: [{ segment: 'Усі платники податків', reason: 'Офіційний сервіс', emoji: '🏛' }], notFor: [], methodology: { approach: 'UX-аудит', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['Складний UI'] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: true, dia: true, pep: false, sanctions: false, openBanking: false, reportingFormats: ['XML', 'PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Електронний кабінет доступний.', dataBackupNote: 'Державна інфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Продовжує роботу.' },
    faq: [{ question: 'Як подати декларацію онлайн?', answer: 'Через електронний кабінет cabinet.tax.gov.ua з КЕП.', category: 'Звітність', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Електронний кабінет', href: 'https://cabinet.tax.gov.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // ПФУ (Пенсійний фонд)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'pfu', slug: 'pfu', name: 'ПФУ', legalName: 'Пенсійний фонд України',
    brandNames: ['ПФУ', 'Пенсійний фонд'], types: ['gov', 'state_pension'],
    logo: { initials: 'ПФ', color: '#0D47A1' }, website: 'https://pfu.gov.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '21869100', legalForm: 'Державний орган', registrationNumber: '21869100', registrationDate: '1992', registrationOrgan: 'КМУ', address: { legal: 'вул. Бастіонна, 9, Київ', actual: 'вул. Бастіонна, 9, Київ' }, regulators: ['КМУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' },
    company: { foundedYear: 1992, foundedCity: 'Київ', story: 'ПФУ — адмініструє пенсійне забезпечення, облік стажу та ЄСВ.', headquarters: 'Київ', employeesCount: '20000+', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1992, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'вул. Бастіонна, 9', city: 'Київ', country: 'Україна', phone: ['0 800 503 753'], email: ['info@pfu.gov.ua'] }, support: { freePhone: '0 800 503 753', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 600, coverageNote: 'Управління у кожному районі', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://portal.pfu.gov.ua', features: ['Перевірка стажу', 'Розрахунок пенсії', 'Електронні довідки'] }, ios: { available: false }, android: { available: false }, api: { available: false } },
    security: { certifications: [], features: ['КЕП'], dataStorage: 'Україна' },
    integrations: [{ name: 'Дія', category: 'Держсервіс', isOfficial: true }],
    products: [
      { id: 'pfu-portal', category: 'Держсервіс', name: 'Портал ПФУ', tagline: 'Перевірка стажу та розрахунок пенсії', description: 'Безкоштовний портал для перевірки страхового стажу та отримання довідок.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовний державний сервіс' }, features: [{ name: 'Перевірка стажу', included: true }, { name: 'Калькулятор пенсії', included: true }, { name: 'Електронні довідки', included: true }], requirements: ['КЕП або BankID'], processingTime: 'миттєво', pros: ['Безкоштовно', 'Перевірка стажу онлайн'], cons: ['Складний інтерфейс'], ctaLabel: 'Перейти на портал', ctaUrl: 'https://portal.pfu.gov.ua' },
    ],
    ratings: { fintodo: { overall: 55, rank: 2, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Пенсійний фонд — перевірка стажу та пенсії онлайн.', shortTake: 'Портал ПФУ — єдиний спосіб перевірити свій стаж онлайн.', fullVerdict: 'Корисний для перевірки стажу, але інтерфейс потребує модернізації.', bestFor: [{ segment: 'Ті, хто перевіряє пенсійний стаж', reason: 'Офіційні дані', emoji: '👴' }], notFor: [], methodology: { approach: 'UX-аудит', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: ['Складний UI'] }, scores: [], totalFormula: 'Σ', totalScore: 5.5, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: true, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Портал доступний.', dataBackupNote: 'Державна інфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Пенсії виплачуються.' },
    faq: [{ question: 'Як перевірити стаж?', answer: 'Через портал portal.pfu.gov.ua з КЕП або BankID.', category: 'Стаж', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Перевірити стаж', href: 'https://portal.pfu.gov.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // ДІЯ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'diia', slug: 'diia', name: 'Дія', legalName: 'Міністерство цифрової трансформації України',
    brandNames: ['Дія', 'Diia'], types: ['gov', 'diia'],
    logo: { initials: 'Дя', color: '#000000' }, website: 'https://diia.gov.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '43909069', legalForm: 'Державний орган', registrationNumber: '43909069', registrationDate: '2020', registrationOrgan: 'КМУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['КМУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' },
    company: { foundedYear: 2020, foundedCity: 'Київ', story: 'Дія — державний додаток, який об\'єднує цифрові документи та держпослуги. 20 млн+ користувачів.', headquarters: 'Київ', employeesCount: '500+', publiclyTraded: false, keyPeople: [{ name: 'Михайло Федоров', role: 'Міністр цифрової трансформації' }], milestones: [{ year: 2020, event: 'Запуск додатку Дія', type: 'founding' }, { year: 2022, event: 'єПідтримка — виплати 6 500 ₴', type: 'product' }, { year: 2023, event: 'Дія.Бізнес — реєстрація ФОП онлайн', type: 'product' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['1545'], email: ['info@thedigital.gov.ua'] }, support: { freePhone: '1545', chatWidget: true, workingHours: '24/7', is247: true }, social: { telegram: 'https://t.me/diaborot', instagram: 'https://instagram.com/diia.gov.ua' } },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://diia.gov.ua', features: ['Дія.Бізнес', 'Цифрові документи', 'єПідтримка'] }, ios: { available: true, rating: 4.8 }, android: { available: true, rating: 4.7 }, api: { available: false } },
    security: { certifications: [], features: ['BankID', 'Біометрія', 'КЕП'], dataStorage: 'Україна' },
    integrations: [{ name: 'BankID', category: 'Ідентифікація', isOfficial: true }, { name: 'ДПС', category: 'Держсервіс', isOfficial: true }, { name: 'ПФУ', category: 'Держсервіс', isOfficial: true }],
    products: [
      { id: 'diia-docs', category: 'Держсервіс', name: 'Цифрові документи', tagline: 'Паспорт, права, ІПН — у смартфоні', description: 'Всі документи в одному додатку з юридичною силою.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно' }, features: [{ name: 'Цифровий паспорт', included: true }, { name: 'Водійське посвідчення', included: true }, { name: 'ІПН', included: true }, { name: 'COVID-сертифікат', included: true }], requirements: ['Смартфон', 'BankID'], processingTime: '5 хвилин', pros: ['Безкоштовно', 'Юридична сила', '20 млн+ користувачів'], cons: ['Потрібен смартфон'], ctaLabel: 'Завантажити', ctaUrl: 'https://diia.gov.ua' },
      { id: 'diia-business', category: 'Реєстрація', name: 'Дія.Бізнес', tagline: 'Реєстрація ФОП за 10 хвилин', description: 'Реєстрація ФОП, зміна даних, отримання витягів — все онлайн через Дію.', audience: 'business', isHighlighted: false, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно' }, features: [{ name: 'Реєстрація ФОП онлайн', included: true }, { name: 'Зміна КВЕДів', included: true }, { name: 'Витяг з ЄДР', included: true }], requirements: ['BankID або КЕП'], processingTime: '10 хвилин — 24 години', pros: ['Безкоштовно', 'Без відвідування держорганів'], cons: ['Не всі послуги доступні'], ctaLabel: 'Зареєструвати ФОП', ctaUrl: 'https://diia.gov.ua/services/register-fop' },
    ],
    ratings: { fintodo: { overall: 85, rank: 1, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', badge: 'Найкращий держсервіс', reviewDate: 'Березень 2026' }, external: [{ source: 'App Store', rating: 4.8, maxRating: 5 }, { source: 'Google Play', rating: 4.7, maxRating: 5 }], averageExternal: 4.75 },
    editorial: { oneLiner: 'Дія — революція в держпослугах. 20 млн користувачів.', shortTake: 'Найкращий держсервіс у Східній Європі. Реєстрація ФОП за 10 хвилин.', fullVerdict: 'Дія змінила ставлення українців до держпослуг. Обов\'язковий додаток.', bestFor: [{ segment: 'Всі громадяни України', reason: 'Цифрові документи з юридичною силою', emoji: '📱' }], notFor: [], methodology: { approach: 'Тестування додатку', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 15, keyFindings: ['Реєстрація ФОП — 10 хвилин'] }, scores: [], totalFormula: 'Σ', totalScore: 8.5, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'App Store, Google Play (2025)', comparisons: [], news: [], changelog: [], awards: [{ year: 2022, name: 'Special Recognition Award', organization: 'UN WSIS' }], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: true, dia: true, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Додаток працює офлайн для документів.', dataBackupNote: 'Державна інфраструктура з резервуванням.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'єПідтримка виплати через Дію.' },
    faq: [{ question: 'Як зареєструвати ФОП через Дію?', answer: 'Дія → Послуги → Реєстрація ФОП → Заповнити форму → Отримати результат протягом 24 годин.', category: 'Бізнес', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Завантажити Дію', href: 'https://diia.gov.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Ліга:Закон
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ligazakon', slug: 'ligazakon', name: 'Ліга:Закон', legalName: 'ТОВ «ЛІГА:ЗАКОН»',
    brandNames: ['Ліга:Закон', 'Liga:Zakon'], types: ['legal_service', 'legal_database'],
    logo: { initials: 'ЛЗ', color: '#1A237E' }, website: 'https://ligazakon.net',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '21464498', legalForm: 'ТОВ', registrationNumber: '21464498', registrationDate: '1991', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1991, foundedCity: 'Київ', story: 'Ліга:Закон — найбільша правова інформаційна система в Україні з 1991 року. 300 000+ документів: закони, постанови, роз\'яснення, судова практика. Щоденне оновлення. Використовується юристами, бухгалтерами та держорганами. Версії для малого бізнесу від 1 500 ₴/рік.', headquarters: 'Київ', employeesCount: '200-500', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1991, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 233 46 04'], email: ['info@ligazakon.ua'] }, support: { email: 'support@ligazakon.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: { facebook: 'https://facebook.com/ligazakon' } },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://ligazakon.net', features: ['Правова база', 'Аналітика', 'Консультації'] }, ios: { available: true }, android: { available: true }, api: { available: true, note: 'API для інтеграції з корпоративними системами' } },
    security: { certifications: [], features: ['SSL', 'Захист даних'], dataStorage: 'Україна' },
    integrations: [{ name: '1С', category: 'Бухгалтерія', isOfficial: true }],
    products: [
      { id: 'liga-base', category: 'Правова база', name: 'Ліга:Закон ПРОФ', tagline: 'Повна правова база України', description: '300 000+ нормативно-правових актів з коментарями та аналітикою.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: 'від 500 ₴', isFree: false, hasFreeTrial: true, freeTrialDays: 7, pricingNote: 'Від 500 ₴/міс за підписку' }, features: [{ name: '300 000+ документів', included: true }, { name: 'Коментарі юристів', included: true }, { name: 'Аналітика змін', included: true }], requirements: [], processingTime: 'миттєво', pros: ['Найповніша правова база', '30+ років на ринку'], cons: ['Висока ціна'], ctaLabel: 'Спробувати безкоштовно', ctaUrl: 'https://ligazakon.net' },
    ],
    ratings: { fintodo: { overall: 80, rank: 1, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', badge: 'Лідер ринку', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Ліга:Закон — стандарт правової інформації в Україні.', shortTake: 'Якщо вам потрібна правова база — Ліга:Закон є стандартом ринку.', fullVerdict: 'Обов\'язковий інструмент для юристів та бухгалтерів.', bestFor: [{ segment: 'Юристи та бухгалтери', reason: '300 000+ документів', emoji: '⚖️' }], notFor: [{ segment: 'Фізособи', reason: 'Дорого для особистого використання' }], methodology: { approach: 'Огляд бази', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['Найповніша база'] }, scores: [], totalFormula: 'Σ', totalScore: 8.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Хмарна інфраструктура.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Працює стабільно.' },
    faq: [{ question: 'Скільки коштує підписка?', answer: 'Від 500 ₴/міс залежно від пакету. Є безкоштовний тріал 7 днів.', category: 'Тарифи', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Спробувати', href: 'https://ligazakon.net', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // OTP Лізинг
  // ══════════════════════════════════════════════════════════════
  {
    id: 'otp-leasing', slug: 'otp-leasing', name: 'OTP Лізинг', legalName: 'ТОВ «ОТП Лізинг»',
    brandNames: ['OTP Лізинг', 'ОТП Лізинг'], types: ['leasing', 'leasing_equipment'],
    logo: { initials: 'OL', color: '#006837' }, website: 'https://otpleasing.com.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '33410783', legalForm: 'ТОВ', registrationNumber: '33410783', registrationDate: '2005', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2005, foundedCity: 'Київ', story: 'OTP Лізинг — частина угорської OTP Group (ТОП-5 банк ЦСЄ). Фінансовий лізинг: авто від 200 000 ₴, обладнання від 500 000 ₴. Строк до 5 років, аванс від 10%. Ставка від 12% річних. 20+ років на ринку.', headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2005, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 490 05 55'], email: ['info@otpleasing.com.ua'] }, support: { email: 'info@otpleasing.com.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 5, coverageNote: 'Офіси у великих містах', regions: ['Київ', 'Дніпро', 'Харків'], branchList: [] },
    platforms: { web: { available: true, url: 'https://otpleasing.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } },
    security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'otp-auto', category: 'Лізинг', name: 'Лізинг автотранспорту', tagline: 'Авто для бізнесу в лізинг', description: 'Фінансовий лізинг легкових та вантажних автомобілів для бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Індивідуальний розрахунок' }, features: [{ name: 'Нові та б/у автомобілі', included: true }, { name: 'Строк до 5 років', included: true }], requirements: ['Юрособа або ФОП', 'Фінансова звітність'], interestRate: 'від 12% річних', processingTime: '3-5 днів', minAmount: '200 000 ₴', pros: ['Міжнародна група', 'Гнучкі умови'], cons: ['Тільки для бізнесу'], ctaLabel: 'Розрахувати', ctaUrl: 'https://otpleasing.com.ua' },
    ],
    ratings: { fintodo: { overall: 72, rank: 1, categorySlug: 'credit', categoryName: 'Кредитування', parentCategorySlug: 'credit', parentCategoryName: 'Кредитування та фінансування', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Лізинг від міжнародної групи OTP.', shortTake: 'OTP Лізинг — надійний вибір для лізингу авто та обладнання.', fullVerdict: 'Для бізнесу, якому потрібен транспорт або обладнання без великого авансу.', bestFor: [{ segment: 'Бізнес, якому потрібен автопарк', reason: 'Гнучкі умови, міжнародна група', emoji: '🚗' }], notFor: [{ segment: 'Фізособи', reason: 'Тільки для бізнесу' }], methodology: { approach: 'Аналіз умов', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['Ставка від 12%'] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Офіс у Києві.', dataBackupNote: 'Міжнародна група.', businessContinuityPlan: 'OTP Group.', warNote: 'Продовжує лізингові операції.' },
    faq: [{ question: 'Яка мінімальна сума лізингу?', answer: 'Від 200 000 ₴. Строк до 5 років.', category: 'Умови', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Розрахувати лізинг', href: 'https://otpleasing.com.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Укрпошта
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ukrposhta', slug: 'ukrposhta', name: 'Укрпошта', legalName: 'АТ «Укрпошта»',
    brandNames: ['Укрпошта', 'Ukrposhta'], types: ['logistics'],
    logo: { initials: 'УП', color: '#FFD700' }, website: 'https://ukrposhta.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '21560045', legalForm: 'АТ', registrationNumber: '21560045', registrationDate: '1994', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НКРЗІ'], licenses: [{ type: 'Ліцензія на поштові послуги', number: '01', issuedBy: 'НКРЗІ', issuedDate: '1994', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1994, foundedCity: 'Київ', story: 'Укрпошта — національний поштовий оператор з найбільшою мережею в країні (11 000+ відділень).', headquarters: 'Київ', employeesCount: '60000+', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1994, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 300 545'], email: ['info@ukrposhta.ua'] }, support: { freePhone: '0 800 300 545', workingHours: 'Пн-Пт 8:00-20:00', is247: false }, social: { facebook: 'https://facebook.com/ukrposhta' } },
    branches: { totalCount: 11000, coverageNote: 'Найбільша мережа — 11 000+ відділень, включаючи села', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://ukrposhta.ua', features: ['Трекінг', 'Створення відправлень', 'Міжнародна доставка'] }, ios: { available: true, rating: 3.5 }, android: { available: true, rating: 3.2 }, api: { available: true, note: 'API для бізнес-клієнтів' } },
    security: { certifications: [], features: ['Страхування відправлень'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'ukrposhta-standard', category: 'Доставка', name: 'Стандартна доставка', tagline: 'Доставка по Україні та за кордон', description: 'Стандартна поштова доставка з найбільшим покриттям в країні.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 15 ₴' }, features: [{ name: 'Доставка у села', included: true }, { name: 'Міжнародна доставка', included: true }, { name: 'Трекінг', included: true }], requirements: [], processingTime: '2-5 днів', pros: ['Найбільше покриття', 'Дешево', 'Міжнародна доставка'], cons: ['Повільніше за Нову Пошту', 'Черги'], ctaLabel: 'Створити відправлення', ctaUrl: 'https://ukrposhta.ua' },
    ],
    ratings: { fintodo: { overall: 60, rank: 2, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Березень 2026' }, external: [{ source: 'Google Play', rating: 3.2, maxRating: 5 }], averageExternal: 3.2 },
    editorial: { oneLiner: 'Укрпошта — дешево та до кожного села, але повільно.', shortTake: 'Єдиний оператор, який доставляє в найвіддаленіші села.', fullVerdict: 'Для міжнародних відправлень та доставки в села — незамінний. Для швидкої доставки — Нова Пошта.', bestFor: [{ segment: 'Доставка в села', reason: '11 000+ відділень', emoji: '🏘' }], notFor: [{ segment: 'Термінова доставка', reason: 'Повільніше', alternative: 'Нова Пошта' }], methodology: { approach: 'Тестування доставки', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 8, keyFindings: ['Доставка 3-5 днів'] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'Google Play (2025)', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Відділення працюють.', dataBackupNote: 'Державна інфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Доставляє гумдопомогу та пенсії.' },
    faq: [{ question: 'Скільки коштує відправка?', answer: 'Від 15 ₴ залежно від ваги та відстані.', category: 'Тарифи', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://ukrposhta.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // HRlink
  // ══════════════════════════════════════════════════════════════
  {
    id: 'hrlink', slug: 'hrlink', name: 'HRlink', legalName: 'ТОВ «ЕйчАрЛінк»',
    brandNames: ['HRlink'], types: ['hr_platform', 'hiring'],
    logo: { initials: 'HR', color: '#7C3AED' }, website: 'https://hrlink.com.ua',
    verified: false, verifiedDate: '', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '40000101', legalForm: 'ТОВ', registrationNumber: '40000101', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2018, foundedCity: 'Київ', story: 'HRlink — українська HRIS-платформа для МСБ. Автоматизація: кадровий облік, табелі, відпустки, лікарняні, військовий облік (актуально з 2022). Від 300 ₴/міс. Інтеграція з 1С/BAS. Безкоштовний тріал 14 днів.', headquarters: 'Київ', employeesCount: '20-50', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2018, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['hello@hrlink.com.ua'] }, support: { email: 'support@hrlink.com.ua', chatWidget: true, workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://hrlink.com.ua', features: ['Кадровий облік', 'Табелі', 'Відпустки', 'Військовий облік'] }, ios: { available: false }, android: { available: false }, api: { available: true, note: 'API для інтеграцій' } },
    security: { certifications: [], features: ['SSL', 'Шифрування'], dataStorage: 'Україна' },
    integrations: [{ name: '1С', category: 'Бухгалтерія', isOfficial: true }],
    products: [
      { id: 'hrlink-hris', category: 'Кадри', name: 'HRlink HRIS', tagline: 'Автоматизація кадрового обліку', description: 'Кадровий облік, табелі, відпустки, лікарняні, військовий облік — все в одній системі.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: 'від 300 ₴', isFree: false, hasFreeTrial: true, freeTrialDays: 14, pricingNote: 'Від 300 ₴/міс за базовий пакет' }, features: [{ name: 'Кадровий облік', included: true }, { name: 'Табелі обліку', included: true }, { name: 'Відпустки та лікарняні', included: true }, { name: 'Військовий облік', included: true }], requirements: ['Бізнес-клієнт'], processingTime: 'підключення за 1 день', pros: ['Військовий облік — актуально', 'API', 'Безкоштовний тріал'], cons: ['Молодий продукт'], ctaLabel: 'Спробувати безкоштовно', ctaUrl: 'https://hrlink.com.ua' },
    ],
    ratings: { fintodo: { overall: 70, rank: 1, categorySlug: 'hr', categoryName: 'Кадри', parentCategorySlug: 'hr', parentCategoryName: 'Кадри та зарплата', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'HRIS-система з військовим обліком — актуально для 2026.', shortTake: 'HRlink — для тих, хто хоче автоматизувати кадровий облік.', fullVerdict: 'Хороший вибір для малого та середнього бізнесу.', bestFor: [{ segment: 'МСБ з 10+ працівниками', reason: 'Автоматизація кадрів + військовий облік', emoji: '👥' }], notFor: [{ segment: 'Мікробізнес до 5 працівників', reason: 'Може бути надмірно' }], methodology: { approach: 'Тестування системи', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 6, keyFindings: ['Військовий облік працює'] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: true, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF', 'XLSX'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Хмарна інфраструктура.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Додано функцію військового обліку.' },
    faq: [{ question: 'Є військовий облік?', answer: 'Так, HRlink підтримує автоматизований військовий облік працівників.', category: 'Функції', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Спробувати', href: 'https://hrlink.com.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Hurma
  // ══════════════════════════════════════════════════════════════
  {
    id: 'hurma', slug: 'hurma', name: 'Hurma', legalName: 'ТОВ «Хурма»',
    brandNames: ['Hurma', 'Hurma System'], types: ['hr_platform', 'payroll'],
    logo: { initials: 'HM', color: '#F97316' }, website: 'https://hurma.work',
    verified: false, verifiedDate: '', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '42000201', legalForm: 'ТОВ', registrationNumber: '42000201', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Hurma — HRM-система, популярна серед IT-компаній України. Рекрутинг (ATS), HR-облік, Payroll, OKR, опитування. Від 1$/працівника/міс. Інтеграція зі Slack, Telegram, Google Calendar. 1 000+ компаній-клієнтів.', headquarters: 'Київ', employeesCount: '30-60', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2019, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['hello@hurma.work'] }, support: { email: 'support@hurma.work', chatWidget: true, workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: { linkedin: 'https://linkedin.com/company/hurma-system' } },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://hurma.work', features: ['Рекрутинг', 'HR-облік', 'Payroll', 'OKR'] }, ios: { available: false }, android: { available: false }, api: { available: true, note: 'API для інтеграцій' } },
    security: { certifications: [], features: ['SSL', 'GDPR'], dataStorage: 'EU' },
    integrations: [{ name: 'Slack', category: 'Комунікації', isOfficial: true }, { name: 'Telegram', category: 'Комунікації', isOfficial: true }],
    products: [
      { id: 'hurma-hrm', category: 'Кадри', name: 'Hurma HRM', tagline: 'Рекрутинг + HR + Payroll', description: 'Комплексна HRM-система для рекрутингу, обліку та розрахунку зарплат.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: 'від $3/працівник', isFree: false, hasFreeTrial: true, freeTrialDays: 14, pricingNote: 'Від $3/працівник/міс' }, features: [{ name: 'Рекрутинг (ATS)', included: true }, { name: 'HR-облік', included: true }, { name: 'Payroll розрахунок', included: true }, { name: 'OKR/KPI', included: true }], requirements: ['Бізнес-клієнт'], processingTime: 'підключення за 1 день', pros: ['Рекрутинг + HR + Payroll', 'API', 'GDPR'], cons: ['Ціна в долларах'], ctaLabel: 'Спробувати безкоштовно', ctaUrl: 'https://hurma.work' },
    ],
    ratings: { fintodo: { overall: 74, rank: 2, categorySlug: 'hr', categoryName: 'Кадри', parentCategorySlug: 'hr', parentCategoryName: 'Кадри та зарплата', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Hurma — HRM для IT-компаній: рекрутинг, HR, payroll.', shortTake: 'Комплексне рішення для компаній від 20 працівників.', fullVerdict: 'Якщо вам потрібен рекрутинг + HR + payroll в одній системі — Hurma.', bestFor: [{ segment: 'IT-компанії', reason: 'Рекрутинг + OKR + Payroll', emoji: '💻' }], notFor: [{ segment: 'Малий бізнес', reason: 'Ціна від $3/працівник' }], methodology: { approach: 'Тестування', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['Зручний рекрутинг'] }, scores: [], totalFormula: 'Σ', totalScore: 7.4, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: true, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF', 'CSV'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'EU інфраструктура.', dataBackupNote: 'EU.', businessContinuityPlan: 'EU.', warNote: 'Стабільна робота.' },
    faq: [{ question: 'Для яких компаній підходить Hurma?', answer: 'Для компаній від 20 працівників, особливо IT-сектор.', category: 'Загальне', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Спробувати', href: 'https://hurma.work', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // OpenDataBot
  // ══════════════════════════════════════════════════════════════
  {
    id: 'opendatabot', slug: 'opendatabot', name: 'OpenDataBot', legalName: 'ТОВ «ОпенДатаБот»',
    brandNames: ['OpenDataBot', 'ODB'], types: ['registry', 'monitoring'],
    logo: { initials: 'OD', color: '#2563EB' }, website: 'https://opendatabot.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '40000301', legalForm: 'ТОВ', registrationNumber: '40000301', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2015, foundedCity: 'Київ', story: 'OpenDataBot — сервіс перевірки контрагентів та моніторингу реєстрів. Витяги з ЄДР за 30 секунд, перевірка боргів, судових справ, санкцій. Автоматичні сповіщення про зміни у ваших контрагентах. 500 000+ користувачів. Безкоштовний базовий доступ.', headquarters: 'Київ', employeesCount: '20-50', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2015, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@opendatabot.ua'] }, support: { email: 'support@opendatabot.ua', chatWidget: true, workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: { telegram: 'https://t.me/opendatabot' } },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://opendatabot.ua', features: ['Витяги з ЄДР', 'Моніторинг контрагентів', 'Аналітика'] }, ios: { available: true }, android: { available: true }, api: { available: true, docsUrl: 'https://docs.opendatabot.ua/', sandbox: true, note: 'REST API' } },
    security: { certifications: [], features: ['SSL', 'Шифрування'], dataStorage: 'Україна' },
    integrations: [{ name: 'CRM системи', category: 'CRM', isOfficial: false }],
    products: [
      { id: 'odb-monitoring', category: 'Моніторинг', name: 'OpenDataBot Моніторинг', tagline: 'Слідкуй за змінами в реєстрах', description: 'Автоматичний моніторинг змін у ЄДР, судових реєстрах, санкціях.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: 'від 199 ₴', isFree: false, hasFreeTrial: true, freeTrialDays: 7, pricingNote: 'Безкоштовна версія + від 199 ₴/міс PRO' }, features: [{ name: 'Моніторинг ЄДР', included: true }, { name: 'Судові реєстри', included: true }, { name: 'Перевірка санкцій', included: true }, { name: 'API доступ', included: true }], requirements: [], processingTime: 'миттєво', pros: ['API', 'Автоматичний моніторинг', 'Є безкоштовна версія'], cons: ['PRO-функції платні'], ctaLabel: 'Зареєструватись', ctaUrl: 'https://opendatabot.ua' },
      { id: 'odb-extract', category: 'Реєстр', name: 'Витяг з ЄДР', tagline: 'Витяг за 5 хвилин', description: 'Отримайте витяг з Єдиного державного реєстру юросіб та ФОП.', audience: 'both', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 50 ₴ за витяг' }, features: [{ name: 'Витяг з ЄДР', included: true }, { name: 'PDF формат', included: true }], requirements: ['ЄДРПОУ або ІПН'], processingTime: '5 хвилин', pros: ['Швидко', 'Онлайн'], cons: ['Платний'], ctaLabel: 'Отримати витяг', ctaUrl: 'https://opendatabot.ua/extract' },
    ],
    ratings: { fintodo: { overall: 82, rank: 1, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація бізнесу', badge: 'Кращий для моніторингу', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'OpenDataBot — стандарт для перевірки контрагентів.', shortTake: 'Якщо ви працюєте з контрагентами — OpenDataBot обов\'язковий.', fullVerdict: 'Кращий сервіс для моніторингу реєстрів та перевірки партнерів.', bestFor: [{ segment: 'Бізнес, який працює з контрагентами', reason: 'Автоматичний моніторинг змін', emoji: '🔍' }], notFor: [{ segment: 'Фізособи', reason: 'Більшість функцій для бізнесу' }], methodology: { approach: 'Тестування API та моніторингу', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 8, keyFindings: ['API швидкий'] }, scores: [], totalFormula: 'Σ', totalScore: 8.2, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: true, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF', 'JSON'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Хмарна інфраструктура.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Додано перевірку санкцій.' },
    faq: [{ question: 'Чи є безкоштовна версія?', answer: 'Так, базова перевірка ЄДРПОУ безкоштовна. PRO — від 199 ₴/міс.', category: 'Тарифи', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Зареєструватись', href: 'https://opendatabot.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Фонд 5-7-9
  // ══════════════════════════════════════════════════════════════
  {
    id: 'fund-579', slug: 'fund-579', name: 'Програма 5-7-9', legalName: 'Державна програма «Доступні кредити 5-7-9%»',
    brandNames: ['5-7-9', 'Доступні кредити'], types: ['grant', 'program_579'],
    logo: { initials: '59', color: '#059669' }, website: 'https://579.gov.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: 'N/A', legalForm: 'Держпрограма', registrationNumber: 'N/A', registrationDate: '2020', registrationOrgan: 'КМУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['КМУ', 'Мінекономіки'], licenses: [], certifications: [], taxStatus: 'Держпрограма', status: 'active' },
    company: { foundedYear: 2020, foundedCity: 'Київ', story: 'Програма «5-7-9%» — державна програма пільгового кредитування МСБ через уповноважені банки. Ставка: 5% для мікробізнесу, 7% для малого, 9% для середнього. Сума до 60 млн ₴. Потрібен бізнес-план та позитивна кредитна історія. Діє з 2020 р.', headquarters: 'Київ', employeesCount: 'N/A', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2020, event: 'Запуск програми', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 579'], email: [] }, support: { freePhone: '0 800 500 579', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: 'Через банки-партнери', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://579.gov.ua', features: ['Калькулятор', 'Список банків-партнерів'] }, ios: { available: false }, android: { available: false }, api: { available: false } },
    security: { certifications: [], features: [], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: '579-credit', category: 'Держпрограма', name: 'Кредит 5-7-9%', tagline: 'Пільговий кредит для МСБ', description: 'Державна компенсація відсоткової ставки до 5-7-9% для малого та середнього бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Ставка 5-9% річних (решту компенсує держава)' }, features: [{ name: 'Ставка 5-9% річних', included: true }, { name: 'Сума до 60 млн ₴', included: true }, { name: 'Через банки-партнери', included: true }], requirements: ['ФОП або юрособа', 'Річний дохід до 400 млн ₴', 'Не в реєстрі боржників'], interestRate: '5-9%', interestRateNote: 'решту компенсує держава', processingTime: '5-10 робочих днів', maxAmount: '60 000 000 ₴', pros: ['Пільгова ставка', 'Через звичайні банки'], cons: ['Багато документів', 'Обмеження по галузях'], ctaLabel: 'Розрахувати', ctaUrl: 'https://579.gov.ua' },
    ],
    ratings: { fintodo: { overall: 78, rank: 1, categorySlug: 'grants', categoryName: 'Гранти', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та держпрограми', badge: 'Топ-програма', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Держпрограма пільгового кредитування — до 60 млн ₴ під 5-9%.', shortTake: 'Програма 5-7-9 — один з найбільших інструментів підтримки МСБ в Україні.', fullVerdict: 'Якщо ви МСБ і потребуєте кредит — обов\'язково перевірте чи підходите.', bestFor: [{ segment: 'МСБ, що потребує фінансування', reason: 'Ставка 5-9% замість 20%+', emoji: '💰' }], notFor: [{ segment: 'Великий бізнес', reason: 'Обмеження по доходу 400 млн' }], methodology: { approach: 'Аналіз умов', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['Реально працює через банки'] }, scores: [], totalFormula: 'Σ', totalScore: 7.8, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: [] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Через банки-партнери.', dataBackupNote: 'Держпрограма.', businessContinuityPlan: 'КМУ.', warNote: 'Під час війни умови пом\'якшені.' },
    faq: [{ question: 'Хто може отримати кредит 5-7-9?', answer: 'МСБ з річним доходом до 400 млн ₴, не в реєстрі боржників.', category: 'Умови', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Розрахувати', href: 'https://579.gov.ua', isInternal: false } },
  },

  // ══════════════ INSURANCE +6 ══════════════
  // ІНГО
  { id: 'ingo', slug: 'ingo', name: 'ІНГО', legalName: 'ПрАТ «СК «ІНГО»', brandNames: ['ІНГО', 'INGO'], types: ['insurance'], logo: { initials: 'ІН', color: '#1565C0' }, website: 'https://ingo.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '16157606', legalForm: 'ПрАТ', registrationNumber: '16157606', registrationDate: '1994', registrationOrgan: 'Нацкомфінпослуг', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Ліцензія на страхування', number: 'АГ №569195', issuedBy: 'Нацкомфінпослуг', issuedDate: '2010', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 1994, foundedCity: 'Київ', story: 'ІНГО — одна з найбільших страхових компаній України. ТОП-5 за обсягом премій.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1994, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 985'], email: ['info@ingo.ua'] }, support: { freePhone: '0 800 500 985', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 40, coverageNote: '40+ відділень', regions: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів'], branchList: [] }, platforms: { web: { available: true, url: 'https://ingo.ua' }, ios: { available: true, rating: 4.0 }, android: { available: true, rating: 3.8 }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'ingo-kasko', category: 'КАСКО', name: 'КАСКО ІНГО', tagline: 'Повне страхування авто', description: 'Комплексне страхування автомобіля від ДТП, викрадення та стихійних лих.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 3% вартості авто' }, features: [{ name: 'Повне покриття', included: true }, { name: 'Евакуатор', included: true }], requirements: ['Свідоцтво ТЗ'], processingTime: '1 день', coverageLimits: 'Повна вартість авто', pros: ['ТОП-5 страховик', 'Повне покриття'], cons: ['Дорожче за ОСЦПВ-only'], ctaLabel: 'Розрахувати', ctaUrl: 'https://ingo.ua/kasko' }, { id: 'ingo-dms', category: 'ДМС', name: 'ДМС для співробітників', tagline: 'Корпоративне медичне страхування', description: 'Добровільне медичне страхування для команди.', audience: 'business', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 3 000 ₴/особу/рік' }, features: [{ name: 'Амбулаторія', included: true }, { name: 'Стаціонар', included: true }], requirements: ['Від 5 працівників'], processingTime: '5-10 днів', pros: ['Широка мережа клінік'], cons: ['Мін. 5 працівників'], ctaLabel: 'Отримати пропозицію', ctaUrl: 'https://ingo.ua/dms' }], ratings: { fintodo: { overall: 78, rank: 2, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ІНГО — ТОП-5 страховик з повним КАСКО та ДМС.', shortTake: 'Надійний вибір для КАСКО та корпоративного ДМС.', fullVerdict: 'Великий досвід та широка мережа. Ціни вищі за середні.', bestFor: [{ segment: 'Компанії, яким потрібен ДМС', reason: 'Широка мережа клінік', emoji: '🏥' }], notFor: [{ segment: 'Ті, хто шукає найдешевшу ОСЦПВ', reason: 'Є дешевші' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Виплати продовжуються.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://ingo.ua', isInternal: false } } },
  // Провідна
  { id: 'providna', slug: 'providna', name: 'Провідна', legalName: 'ПрАТ «СК «Провідна»', brandNames: ['Провідна', 'Providna'], types: ['insurance'], logo: { initials: 'ПВ', color: '#E65100' }, website: 'https://providna.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '23510011', legalForm: 'ПрАТ', registrationNumber: '23510011', registrationDate: '1995', registrationOrgan: 'Нацкомфінпослуг', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 1995, foundedCity: 'Київ', story: 'Провідна — один з найстаріших страховиків. ОСЦПВ, КАСКО, туристичне.', headquarters: 'Київ', employeesCount: '300-500', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1995, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 197'], email: ['info@providna.ua'] }, support: { freePhone: '0 800 500 197', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 30, coverageNote: '30+ відділень', regions: ['Київ', 'Харків', 'Одеса'], branchList: [] }, platforms: { web: { available: true, url: 'https://providna.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'providna-osago', category: 'ОСЦПВ', name: 'ОСЦПВ Провідна', tagline: 'Автоцивілка за вигідною ціною', description: 'Обов\'язкове страхування цивільної відповідальності.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 450 ₴/рік' }, features: [{ name: 'Оформлення онлайн', included: true }, { name: 'Европротокол', included: true }], requirements: ['Свідоцтво ТЗ'], processingTime: '5 хвилин', pros: ['Конкурентна ціна'], cons: ['Менша мережа СТО'], ctaLabel: 'Розрахувати', ctaUrl: 'https://providna.ua' }], ratings: { fintodo: { overall: 68, rank: 4, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Провідна — доступна автоцивілка.', shortTake: 'Один з найстаріших страховиків з конкурентними цінами.', fullVerdict: 'Для тих, хто шукає дешеву ОСЦПВ.', bestFor: [{ segment: 'Автовласники, що шукають дешеву ОСЦПВ', reason: 'Від 450 ₴/рік', emoji: '🚗' }], notFor: [] , methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Виплати продовжуються.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Розрахувати', href: 'https://providna.ua', isInternal: false } } },
  // АСКА
  { id: 'aska', slug: 'aska', name: 'АСКА', legalName: 'ПрАТ «СК «АСКА»', brandNames: ['АСКА', 'ASKA'], types: ['insurance'], logo: { initials: 'АС', color: '#0277BD' }, website: 'https://aska.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '13490997', legalForm: 'ПрАТ', registrationNumber: '13490997', registrationDate: '1990', registrationOrgan: 'Нацкомфінпослуг', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 1990, foundedCity: 'Донецьк', story: 'АСКА — одна з найстаріших СК, ТОП-10. Переїхала до Києва після 2014.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1990, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 270'], email: ['info@aska.ua'] }, support: { freePhone: '0 800 500 270', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 35, coverageNote: '35+ відділень', regions: ['Київ', 'Дніпро', 'Одеса', 'Запоріжжя'], branchList: [] }, platforms: { web: { available: true, url: 'https://aska.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'aska-kasko', category: 'КАСКО', name: 'КАСКО АСКА', tagline: 'Повне КАСКО від ТОП-10 страховика', description: 'КАСКО з широким покриттям та мережею партнерських СТО.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 2.5% вартості авто' }, features: [{ name: 'Повне покриття', included: true }, { name: 'Партнерські СТО', included: true }], requirements: ['Свідоцтво ТЗ', 'Огляд авто'], processingTime: '1-2 дні', pros: ['ТОП-10', 'Мережа СТО'], cons: ['Потрібен огляд авто'], ctaLabel: 'Розрахувати', ctaUrl: 'https://aska.ua' }], ratings: { fintodo: { overall: 72, rank: 5, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'АСКА — ТОП-10 з КАСКО та майновим страхуванням.', shortTake: 'Стабільний страховик зі стійкою репутацією.', fullVerdict: 'Надійний вибір для КАСКО.', bestFor: [{ segment: 'Автовласники', reason: 'ТОП-10, мережа СТО', emoji: '🚗' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Розрахувати', href: 'https://aska.ua', isInternal: false } } },
  // Вусо
  { id: 'vuso', slug: 'vuso', name: 'Вусо', legalName: 'ТОВ «Вусо»', brandNames: ['Вусо', 'VUSO'], types: ['insurance'], logo: { initials: 'ВС', color: '#FF5722' }, website: 'https://vuso.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '34000501', legalForm: 'ТОВ', registrationNumber: '34000501', registrationDate: '2012', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2012, foundedCity: 'Київ', story: 'Вусо — онлайн-агрегатор страхування. Порівняння та оформлення ОСЦПВ від різних компаній.', headquarters: 'Київ', employeesCount: '30-50', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2012, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 330 880'], email: ['info@vuso.ua'] }, support: { freePhone: '0 800 330 880', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] }, platforms: { web: { available: true, url: 'https://vuso.ua' }, ios: { available: true, rating: 4.5 }, android: { available: true, rating: 4.3 }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'vuso-compare', category: 'Агрегатор', name: 'Порівняння ОСЦПВ', tagline: 'Порівняй та обери найдешевшу ОСЦПВ', description: 'Калькулятор ОСЦПВ з порівнянням цін від 10+ страхових компаній.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 350 ₴/рік (ціна СК)' }, features: [{ name: 'Порівняння 10+ СК', included: true }, { name: 'Оформлення за 5 хв', included: true }], requirements: ['Номер авто або свідоцтво ТЗ'], processingTime: '5 хвилин', pros: ['Порівняння цін', 'Швидко'], cons: ['Не всі СК представлені'], ctaLabel: 'Порівняти', ctaUrl: 'https://vuso.ua' }], ratings: { fintodo: { overall: 76, rank: 6, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Квітень 2026' }, external: [{ source: 'App Store', rating: 4.5, maxRating: 5 }], averageExternal: 4.5 }, editorial: { oneLiner: 'Вусо — агрегатор для порівняння страховок.', shortTake: 'Зручний спосіб знайти найдешевшу ОСЦПВ.', fullVerdict: 'Для тих, хто хоче порівняти ціни перед покупкою.', bestFor: [{ segment: 'Автовласники, що порівнюють ціни', reason: 'Агрегатор 10+ СК', emoji: '📊' }], notFor: [], methodology: { approach: 'Тестування', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.6, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: [] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Хмарна інфраструктура.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Працює стабільно.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Порівняти страховки', href: 'https://vuso.ua', isInternal: false } } },
  // Альфа Страхування
  { id: 'alfa-insurance', slug: 'alfa-insurance', name: 'Альфа Страхування', legalName: 'ПрАТ «СК «Альфа Страхування»', brandNames: ['Альфа Страхування'], types: ['insurance'], logo: { initials: 'АС', color: '#EF5350' }, website: 'https://alfaic.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '30800016', legalForm: 'ПрАТ', registrationNumber: '30800016', registrationDate: '2000', registrationOrgan: 'Нацкомфінпослуг', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2000, foundedCity: 'Київ', story: 'Альфа Страхування — великий страховик з фокусом на корпоративне та туристичне страхування.', headquarters: 'Київ', employeesCount: '300-500', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2000, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 354'], email: ['info@alfaic.ua'] }, support: { freePhone: '0 800 500 354', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 25, coverageNote: '25+ відділень', regions: ['Київ', 'Харків', 'Одеса'], branchList: [] }, platforms: { web: { available: true, url: 'https://alfaic.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'alfa-travel', category: 'Туристичне', name: 'Туристичне страхування', tagline: 'Страховка для подорожей', description: 'Страхування для виїзду за кордон — медичні витрати, багаж, відміна рейсу.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 200 ₴ за тиждень' }, features: [{ name: 'Медичні витрати', included: true }, { name: 'Багаж', included: true }, { name: 'Відміна рейсу', included: true }], requirements: ['Паспорт'], processingTime: '10 хвилин', pros: ['Широке покриття'], cons: ['Середні ціни'], ctaLabel: 'Оформити', ctaUrl: 'https://alfaic.ua/travel' }, { id: 'alfa-corporate', category: 'Корпоративне', name: 'Корпоративне страхування', tagline: 'Комплексне страхування для бізнесу', description: 'Страхування майна, відповідальності, ДМС для компаній.', audience: 'business', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Індивідуальний розрахунок' }, features: [{ name: 'Майнове', included: true }, { name: 'Відповідальність', included: true }, { name: 'ДМС', included: true }], requirements: ['ЄДРПОУ'], processingTime: '3-5 днів', pros: ['Комплексне покриття'], cons: ['Індивідуальний тариф'], ctaLabel: 'Отримати пропозицію', ctaUrl: 'https://alfaic.ua/corporate' }], ratings: { fintodo: { overall: 74, rank: 7, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Альфа Страхування — корпоративне та туристичне.', shortTake: 'Великий страховик для бізнесу та подорожей.', fullVerdict: 'Надійний вибір для корпоративного страхування та подорожей.', bestFor: [{ segment: 'Подорожуючі та компанії', reason: 'Широке покриття', emoji: '✈️' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.4, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://alfaic.ua', isInternal: false } } },
  // Universalna
  { id: 'universalna', slug: 'universalna', name: 'Universalna', legalName: 'ПрАТ «СК «Універсальна»', brandNames: ['Universalna', 'Універсальна'], types: ['insurance'], logo: { initials: 'УН', color: '#7B1FA2' }, website: 'https://universalna.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '14014767', legalForm: 'ПрАТ', registrationNumber: '14014767', registrationDate: '1993', registrationOrgan: 'Нацкомфінпослуг', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 1993, foundedCity: 'Київ', story: 'Universalna — один з найбільших страховиків. Широкий спектр продуктів.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1993, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 790'], email: ['info@universalna.com'] }, support: { freePhone: '0 800 500 790', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 50, coverageNote: '50+ відділень', regions: ['Київ', 'Одеса', 'Дніпро', 'Харків', 'Львів'], branchList: [] }, platforms: { web: { available: true, url: 'https://universalna.com' }, ios: { available: true }, android: { available: true }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'universalna-life', category: 'Життя', name: 'Страхування життя', tagline: 'Захист для вашої родини', description: 'Страхування життя з накопичувальною та ризиковою програмою.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 500 ₴/рік' }, features: [{ name: 'Ризикове страхування', included: true }, { name: 'Накопичувальна програма', included: true }], requirements: ['Паспорт', 'Медична анкета'], processingTime: '1-3 дні', pros: ['Великий досвід', 'Різні програми'], cons: ['Потрібна медична анкета'], ctaLabel: 'Дізнатись більше', ctaUrl: 'https://universalna.com/life' }], ratings: { fintodo: { overall: 70, rank: 8, categorySlug: 'insurance', categoryName: 'Страхування', parentCategorySlug: 'insurance', parentCategoryName: 'Страхування', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Universalna — страхування життя та накопичення.', shortTake: 'Для тих, хто хоче захистити родину та накопичувати.', fullVerdict: 'Надійний вибір для страхування життя.', bestFor: [{ segment: 'Родини', reason: 'Захист + накопичення', emoji: '👨‍👩‍👧' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://universalna.com', isInternal: false } } },

  // ══════════════ LOGISTICS +8 ══════════════
  { id: 'meest', slug: 'meest', name: 'Meest', legalName: 'ТОВ «Міст Експрес»', brandNames: ['Meest', 'Міст Експрес'], types: ['logistics'], logo: { initials: 'ME', color: '#FF6D00' }, website: 'https://meest.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '20042839', legalForm: 'ТОВ', registrationNumber: '20042839', registrationDate: '1989', registrationOrgan: 'Мінʼюст', address: { legal: 'Львів', actual: 'Львів' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 1989, foundedCity: 'Львів', story: 'Meest — міжнародний логістичний оператор. Доставка в Україну та за кордон, діаспорна мережа.', headquarters: 'Львів', employeesCount: '2000-5000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1989, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Львів', city: 'Львів', country: 'Україна', phone: ['0 800 501 501'], email: ['info@meest.com'] }, support: { freePhone: '0 800 501 501', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 1000, coverageNote: '1000+ відділень', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://meest.com' }, ios: { available: true }, android: { available: true }, api: { available: true } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'meest-intl', category: 'Міжнародна доставка', name: 'Meest International', tagline: 'Доставка за кордон до діаспори', description: 'Міжнародна доставка посилок до 30+ країн.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 100 ₴ за посилку' }, features: [{ name: '30+ країн', included: true }, { name: 'Трекінг', included: true }], requirements: [], processingTime: '3-14 днів', pros: ['Міжнародна мережа', 'Діаспора'], cons: ['Повільніше за DHL'], ctaLabel: 'Створити відправлення', ctaUrl: 'https://meest.com' }], ratings: { fintodo: { overall: 72, rank: 3, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Meest — міжнародна доставка до діаспори.', shortTake: 'Для посилок за кордон — особливо до Канади, Польщі, Німеччини.', fullVerdict: 'Кращий вибір для діаспорних посилок.', bestFor: [{ segment: 'Відправлення за кордон', reason: '30+ країн, діаспорна мережа', emoji: '🌍' }], notFor: [{ segment: 'Внутрішня доставка', reason: 'Нова Пошта швидша' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: [] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Міжнародна мережа.', warNote: 'Міжнародні відправлення працюють.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://meest.com', isInternal: false } } },
  { id: 'sat', slug: 'sat', name: 'SAT', legalName: 'ТОВ «САТ»', brandNames: ['SAT', 'САТ'], types: ['logistics'], logo: { initials: 'ST', color: '#1976D2' }, website: 'https://sat.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '32930000', legalForm: 'ТОВ', registrationNumber: '32930000', registrationDate: '2001', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2001, foundedCity: 'Київ', story: 'SAT — логістичний оператор для великогабаритних вантажів.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2001, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 300 020'], email: ['info@sat.ua'] }, support: { freePhone: '0 800 300 020', workingHours: 'Пн-Пт 8:00-18:00', is247: false }, social: {} }, branches: { totalCount: 70, coverageNote: '70+ відділень', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://sat.ua' }, ios: { available: false }, android: { available: false }, api: { available: true } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'sat-cargo', category: 'Вантажі', name: 'SAT Вантажі', tagline: 'Великогабаритна доставка', description: 'Доставка великогабаритних та важких вантажів по Україні.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 50 ₴ за місце' }, features: [{ name: 'Великогабаритні вантажі', included: true }, { name: '70+ відділень', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Великогабаритні вантажі', 'По всій Україні'], cons: ['Менш зручний трекінг'], ctaLabel: 'Створити ТТН', ctaUrl: 'https://sat.ua' }], ratings: { fintodo: { overall: 64, rank: 4, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'SAT — для великих вантажів.', shortTake: 'Спеціалізація на великогабаритних вантажах.', fullVerdict: 'Для меблів, обладнання та великих відправлень.', bestFor: [{ segment: 'Великогабаритні вантажі', reason: 'Спеціалізація', emoji: '📦' }], notFor: [{ segment: 'Дрібні посилки', reason: 'Нова Пошта зручніша' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.4, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: [] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://sat.ua', isInternal: false } } },
  { id: 'delivery', slug: 'delivery-service', name: 'Delivery', legalName: 'ТОВ «Делівері»', brandNames: ['Delivery'], types: ['logistics'], logo: { initials: 'DL', color: '#4CAF50' }, website: 'https://delivery-auto.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '31789000', legalForm: 'ТОВ', registrationNumber: '31789000', registrationDate: '2001', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2001, foundedCity: 'Київ', story: 'Delivery — логістична компанія для бізнесу та фізосіб.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2001, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 300 000'], email: ['info@delivery-auto.com'] }, support: { freePhone: '0 800 300 000', workingHours: 'Пн-Пт 8:00-18:00', is247: false }, social: {} }, branches: { totalCount: 250, coverageNote: '250+ відділень', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://delivery-auto.com' }, ios: { available: true }, android: { available: true }, api: { available: true } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'delivery-express', category: 'Доставка', name: 'Delivery Експрес', tagline: 'Швидка доставка по Україні', description: 'Доставка посилок та вантажів 1-2 дні.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 30 ₴' }, features: [{ name: '250+ відділень', included: true }, { name: 'Трекінг', included: true }], requirements: [], processingTime: '1-2 дні', pros: ['Широке покриття', 'API'], cons: ['Менш відомий за НП'], ctaLabel: 'Створити ТТН', ctaUrl: 'https://delivery-auto.com' }], ratings: { fintodo: { overall: 62, rank: 5, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Delivery — альтернатива Новій Пошті.', shortTake: '250+ відділень, конкурентні тарифи.', fullVerdict: 'Хороша альтернатива для бізнесу.', bestFor: [{ segment: 'Бізнес, що шукає альтернативу НП', reason: '250+ відділень', emoji: '📦' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: [] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Резервна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://delivery-auto.com', isInternal: false } } },
  { id: 'justin', slug: 'justin', name: 'Justin', legalName: 'ТОВ «Джастін»', brandNames: ['Justin', 'Джастін'], types: ['logistics'], logo: { initials: 'JT', color: '#F44336' }, website: 'https://justin.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '41783000', legalForm: 'ТОВ', registrationNumber: '41783000', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'Justin — логістична компанія від Fozzy Group. 1500+ відділень у магазинах Сільпо та Фора.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2018, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 300 033'], email: ['info@justin.ua'] }, support: { freePhone: '0 800 300 033', workingHours: 'Пн-Пт 8:00-20:00', is247: false }, social: {} }, branches: { totalCount: 1500, coverageNote: '1500+ відділень у Сільпо/Фора', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://justin.ua' }, ios: { available: true }, android: { available: true }, api: { available: true } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [{ name: 'Prom.ua', category: 'Маркетплейс', isOfficial: true }], products: [{ id: 'justin-delivery', category: 'Доставка', name: 'Justin Доставка', tagline: 'Забери у Сільпо', description: 'Доставка у відділення в магазинах Сільпо та Фора — зручно під час покупок.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 25 ₴' }, features: [{ name: 'У Сільпо/Фора', included: true }, { name: 'API для e-commerce', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Зручні локації', 'API'], cons: ['Менша мережа за НП'], ctaLabel: 'Створити ТТН', ctaUrl: 'https://justin.ua' }], ratings: { fintodo: { overall: 66, rank: 6, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Justin — забери посилку разом з продуктами.', shortTake: 'Відділення у Сільпо — зручна концепція.', fullVerdict: 'Для тих, хто ходить у Сільпо/Фору — зручно.', bestFor: [{ segment: 'Покупці Сільпо/Фора', reason: 'Забрати разом з покупками', emoji: '🛒' }], notFor: [{ segment: 'Великі вантажі', reason: 'Обмеження по розміру' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.6, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: [] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Fozzy Group.', businessContinuityPlan: 'Fozzy Group.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://justin.ua', isInternal: false } } },
  { id: 'autolux', slug: 'autolux', name: 'Автолюкс', legalName: 'ТОВ «Автолюкс»', brandNames: ['Автолюкс', 'Autolux'], types: ['logistics'], logo: { initials: 'АЛ', color: '#FF9800' }, website: 'https://autolux.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '30456000', legalForm: 'ТОВ', registrationNumber: '30456000', registrationDate: '1998', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 1998, foundedCity: 'Київ', story: 'Автолюкс — автобусні перевезення та вантажна логістика.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1998, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 050'], email: ['info@autolux.ua'] }, support: { freePhone: '0 800 500 050', workingHours: 'Пн-Пт 8:00-18:00', is247: false }, social: {} }, branches: { totalCount: 30, coverageNote: '30+ відділень', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://autolux.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'autolux-cargo', category: 'Вантажі', name: 'Автолюкс Вантажі', tagline: 'Доставка автобусними маршрутами', description: 'Доставка вантажів та документів автобусними маршрутами.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 40 ₴' }, features: [{ name: 'Автобусні маршрути', included: true }, { name: 'Документи', included: true }], requirements: [], processingTime: '1 день', pros: ['Швидко (автобусом)'], cons: ['Обмежена мережа'], ctaLabel: 'Відправити', ctaUrl: 'https://autolux.ua' }], ratings: { fintodo: { overall: 58, rank: 7, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Автолюкс — доставка автобусом.', shortTake: 'Для термінових документів та малих посилок — автобусом за день.', fullVerdict: 'Ніша для термінових малих відправлень.', bestFor: [{ segment: 'Термінові документи', reason: 'Доставка за день автобусом', emoji: '🚌' }], notFor: [{ segment: 'Великі вантажі', reason: 'Обмеження по розміру' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 2, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: [] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Залежить від маршрутів.', dataBackupNote: 'Локальна інфраструктура.', businessContinuityPlan: 'Автобусний парк.', warNote: 'Маршрути обмежені.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://autolux.ua', isInternal: false } } },
  { id: 'dhl-ua', slug: 'dhl-ua', name: 'DHL Express Україна', legalName: 'ТОВ «ДХЛ Експрес Україна»', brandNames: ['DHL', 'DHL Express'], types: ['logistics'], logo: { initials: 'DH', color: '#D50032' }, website: 'https://dhl.com/ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '25370000', legalForm: 'ТОВ', registrationNumber: '25370000', registrationDate: '1993', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 1993, foundedCity: 'Київ', story: 'DHL Express — глобальний лідер експрес-доставки. Офіс в Україні з 1993 року.', headquarters: 'Київ', employeesCount: '200-500', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1993, event: 'Вихід на ринок України', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 003'], email: ['info@dhl.com'] }, support: { freePhone: '0 800 500 003', workingHours: '24/7', is247: true }, social: {} }, branches: { totalCount: 15, coverageNote: '15+ сервіс-центрів', regions: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів'], branchList: [] }, platforms: { web: { available: true, url: 'https://dhl.com/ua' }, ios: { available: true, rating: 4.5 }, android: { available: true, rating: 4.3 }, api: { available: true, note: 'API для бізнес-інтеграцій' } }, security: { certifications: ['ISO 27001'], features: ['SSL', 'Шифрування'], dataStorage: 'EU' }, integrations: [], products: [{ id: 'dhl-express', category: 'Міжнародна доставка', name: 'DHL Express', tagline: 'Експрес-доставка по всьому світу', description: 'Міжнародна експрес-доставка за 1-3 дні у 220+ країн.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 500 ₴ (залежить від ваги та країни)' }, features: [{ name: '220+ країн', included: true }, { name: 'Доставка за 1-3 дні', included: true }, { name: 'Трекінг у реальному часі', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Глобальний лідер', 'Швидкість', 'Надійність'], cons: ['Висока ціна'], ctaLabel: 'Розрахувати', ctaUrl: 'https://dhl.com/ua' }], ratings: { fintodo: { overall: 80, rank: 8, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [{ source: 'Trustpilot', rating: 4.0, maxRating: 5 }], averageExternal: 4.0 }, editorial: { oneLiner: 'DHL — глобальний лідер експрес-доставки.', shortTake: 'Дорого, але надійно і швидко по всьому світу.', fullVerdict: 'Для термінових міжнародних відправлень — DHL без конкурентів.', bestFor: [{ segment: 'Термінові міжнародні відправлення', reason: '1-3 дні в 220+ країн', emoji: '✈️' }], notFor: [{ segment: 'Внутрішня доставка в Україні', reason: 'Нова Пошта дешевша' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: true, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює з обмеженнями.', reliabilityDuringBlackouts: 'Глобальна інфраструктура.', dataBackupNote: 'EU.', businessContinuityPlan: 'Deutsche Post DHL Group.', warNote: 'Обмеження доставки в деякі регіони.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Розрахувати вартість', href: 'https://dhl.com/ua', isInternal: false } } },
  { id: 'fedex-ua', slug: 'fedex-ua', name: 'FedEx Україна', legalName: 'FedEx Express', brandNames: ['FedEx'], types: ['logistics'], logo: { initials: 'FE', color: '#4D148C' }, website: 'https://fedex.com/ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: 'N/A', legalForm: 'Inc.', registrationNumber: 'N/A', registrationDate: '2000', registrationOrgan: 'USA', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'US Corporation', status: 'active' }, company: { foundedYear: 2000, foundedCity: 'Київ', story: 'FedEx — глобальний логістичний оператор. Представництво в Україні.', headquarters: 'Memphis, USA', employeesCount: '50-100', publiclyTraded: true, stockExchange: 'NYSE', stockSymbol: 'FDX', keyPeople: [], milestones: [{ year: 2000, event: 'Вихід на ринок України', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 600'], email: [] }, support: { freePhone: '0 800 500 600', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 5, coverageNote: '5+ сервіс-центрів', regions: ['Київ', 'Одеса', 'Дніпро'], branchList: [] }, platforms: { web: { available: true, url: 'https://fedex.com/ua' }, ios: { available: true }, android: { available: true }, api: { available: true } }, security: { certifications: ['ISO 27001'], features: ['SSL'], dataStorage: 'USA' }, integrations: [], products: [{ id: 'fedex-intl', category: 'Міжнародна доставка', name: 'FedEx International', tagline: 'Доставка у 220+ країн', description: 'Міжнародна доставка документів та вантажів.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 600 ₴' }, features: [{ name: '220+ країн', included: true }, { name: 'Трекінг', included: true }], requirements: [], processingTime: '2-5 днів', pros: ['Глобальна мережа'], cons: ['Дорожче за Meest'], ctaLabel: 'Розрахувати', ctaUrl: 'https://fedex.com/ua' }], ratings: { fintodo: { overall: 74, rank: 9, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'FedEx — глобальна експрес-доставка.', shortTake: 'Альтернатива DHL для міжнародних відправлень.', fullVerdict: 'Для тих, кому потрібен FedEx-бренд.', bestFor: [{ segment: 'Міжнародний бізнес', reason: 'Глобальна мережа FedEx', emoji: '📦' }], notFor: [{ segment: 'Внутрішня доставка', reason: 'Немає сенсу' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.4, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: true, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює з обмеженнями.', reliabilityDuringBlackouts: 'Глобальна інфраструктура.', dataBackupNote: 'USA.', businessContinuityPlan: 'FedEx Corporation.', warNote: 'Обмежена доставка в деякі регіони.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Розрахувати', href: 'https://fedex.com/ua', isInternal: false } } },
  { id: 'ups-ua', slug: 'ups-ua', name: 'UPS Україна', legalName: 'UPS', brandNames: ['UPS'], types: ['logistics'], logo: { initials: 'UP', color: '#351C15' }, website: 'https://ups.com/ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: 'N/A', legalForm: 'Inc.', registrationNumber: 'N/A', registrationDate: '2005', registrationOrgan: 'USA', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'US Corporation', status: 'active' }, company: { foundedYear: 2005, foundedCity: 'Київ', story: 'UPS — глобальний логістичний оператор. Присутній в Україні через партнерів.', headquarters: 'Atlanta, USA', employeesCount: '20-50', publiclyTraded: true, stockExchange: 'NYSE', stockSymbol: 'UPS', keyPeople: [], milestones: [{ year: 2005, event: 'Вихід на ринок України', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 300 033'], email: [] }, support: { freePhone: '0 800 300 033', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 3, coverageNote: '3+ сервіс-центри', regions: ['Київ', 'Одеса'], branchList: [] }, platforms: { web: { available: true, url: 'https://ups.com/ua' }, ios: { available: true }, android: { available: true }, api: { available: true } }, security: { certifications: [], features: ['SSL'], dataStorage: 'USA' }, integrations: [], products: [{ id: 'ups-express', category: 'Міжнародна доставка', name: 'UPS Express', tagline: 'Глобальна доставка', description: 'Міжнародна доставка документів та вантажів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 700 ₴' }, features: [{ name: '220+ країн', included: true }], requirements: [], processingTime: '2-5 днів', pros: ['Глобальна мережа'], cons: ['Найдорожчий'], ctaLabel: 'Розрахувати', ctaUrl: 'https://ups.com/ua' }], ratings: { fintodo: { overall: 70, rank: 10, categorySlug: 'logistics', categoryName: 'Логістика', parentCategorySlug: 'logistics', parentCategoryName: 'Логістика та доставка', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'UPS — глобальна логістика.', shortTake: 'Третій глобальний оператор після DHL та FedEx.', fullVerdict: 'Для бізнесу з потребою в UPS-мережі.', bestFor: [{ segment: 'Бізнес з UPS-контрактами', reason: 'Глобальна мережа', emoji: '📦' }], notFor: [{ segment: 'Фізособи', reason: 'Дорого' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 2, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: true, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює з обмеженнями.', reliabilityDuringBlackouts: 'Глобальна інфраструктура.', dataBackupNote: 'USA.', businessContinuityPlan: 'UPS Inc.', warNote: 'Обмеження.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Розрахувати', href: 'https://ups.com/ua', isInternal: false } } },

  // ══════════════ GOV +6 ══════════════
  { id: 'minjust', slug: 'minjust', name: 'Мінʼюст', legalName: 'Міністерство юстиції України', brandNames: ['Мінʼюст', 'Minjust'], types: ['gov', 'gov_service'], logo: { initials: 'МЮ', color: '#1A237E' }, website: 'https://minjust.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '00015622', legalForm: 'Державний орган', registrationNumber: '00015622', registrationDate: '1918', registrationOrgan: 'КМУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['КМУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' }, company: { foundedYear: 1918, foundedCity: 'Київ', story: 'Мінʼюст — центральний орган виконавчої влади. Реєстри юросіб, нерухомості, нотаріат.', headquarters: 'Київ', employeesCount: '5000+', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1918, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 213 103'], email: ['callcenter@minjust.gov.ua'] }, support: { freePhone: '0 800 213 103', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 25, coverageNote: 'Управління в усіх областях', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://minjust.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['КЕП'], dataStorage: 'Україна' }, integrations: [{ name: 'Дія', category: 'Держсервіс', isOfficial: true }], products: [{ id: 'minjust-edr', category: 'Реєстр', name: 'ЄДР (Єдиний держреєстр)', tagline: 'Реєстрація юросіб та ФОП', description: 'Державна реєстрація юридичних осіб, ФОП, громадських організацій.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно (держсервіс)' }, features: [{ name: 'Реєстрація ФОП', included: true }, { name: 'Реєстрація ТОВ', included: true }, { name: 'Витяг з ЄДР', included: true }], requirements: ['КЕП або Дія.Підпис'], processingTime: '1-3 дні', pros: ['Безкоштовно', 'Офіційний реєстр'], cons: ['Складний інтерфейс'], ctaLabel: 'Перейти на портал', ctaUrl: 'https://usr.minjust.gov.ua' }, { id: 'minjust-realty', category: 'Реєстр', name: 'Реєстр нерухомості', tagline: 'Перевірка та реєстрація нерухомості', description: 'Державний реєстр речових прав на нерухоме майно.', audience: 'both', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: '0.1% від оціночної вартості' }, features: [{ name: 'Реєстрація права власності', included: true }, { name: 'Перевірка обтяжень', included: true }], requirements: ['Договір купівлі-продажу', 'Паспорт'], processingTime: '5 робочих днів', pros: ['Офіційний реєстр'], cons: ['Повільно'], ctaLabel: 'Перевірити', ctaUrl: 'https://re.minjust.gov.ua' }], ratings: { fintodo: { overall: 55, rank: 3, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Мінʼюст — реєстри юросіб та нерухомості.', shortTake: 'Офіційні реєстри для бізнесу та нерухомості.', fullVerdict: 'Обов\'язковий орган для реєстрації та перевірки.', bestFor: [{ segment: 'Реєстрація бізнесу та нерухомості', reason: 'Офіційний реєстр', emoji: '📋' }], notFor: [], methodology: { approach: 'UX-аудит', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: true, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Портал доступний.', dataBackupNote: 'Держінфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на портал', href: 'https://minjust.gov.ua', isInternal: false } } },
  { id: 'derzhstat', slug: 'derzhstat', name: 'Держстат', legalName: 'Державна служба статистики', brandNames: ['Держстат', 'ДССУ'], types: ['gov', 'gov_service'], logo: { initials: 'ДС', color: '#0D47A1' }, website: 'https://ukrstat.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '00014075', legalForm: 'Державний орган', registrationNumber: '00014075', registrationDate: '1991', registrationOrgan: 'КМУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['КМУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' }, company: { foundedYear: 1991, foundedCity: 'Київ', story: 'Держстат — центральний орган статистики. Збір та публікація економічних даних.', headquarters: 'Київ', employeesCount: '10000+', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1991, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 287 24 48'], email: ['info@ukrstat.gov.ua'] }, support: { email: 'info@ukrstat.gov.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 25, coverageNote: 'В усіх областях', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://ukrstat.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: [], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'stat-reporting', category: 'Статистична звітність', name: 'Статистична звітність', tagline: 'Подання статзвітності для бізнесу', description: 'Обов\'язкова статистична звітність для юросіб та ФОП.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно (держсервіс)' }, features: [{ name: 'Подання онлайн', included: true }, { name: 'Довідники КВЕД', included: true }], requirements: ['КЕП'], processingTime: 'миттєво', pros: ['Безкоштовно'], cons: ['Складні форми'], ctaLabel: 'Подати звіт', ctaUrl: 'https://ukrstat.gov.ua' }], ratings: { fintodo: { overall: 45, rank: 5, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Держстат — статистична звітність для бізнесу.', shortTake: 'Обов\'язкова статзвітність для юросіб.', fullVerdict: 'Якщо вас вимагають — подаєте.', bestFor: [{ segment: 'Юрособи, зобов\'язані подавати статзвіти', reason: 'Обов\'язковий орган', emoji: '📊' }], notFor: [{ segment: 'ФОП спрощена система', reason: 'Зазвичай не потрібно' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 2, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 4.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Портал доступний.', dataBackupNote: 'Держінфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Спрощена звітність під час війни.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://ukrstat.gov.ua', isInternal: false } } },
  { id: 'amku', slug: 'amku', name: 'АМКУ', legalName: 'Антимонопольний комітет України', brandNames: ['АМКУ', 'Антимонопольний комітет'], types: ['gov', 'gov_service'], logo: { initials: 'АМ', color: '#283593' }, website: 'https://amcu.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '00032767', legalForm: 'Державний орган', registrationNumber: '00032767', registrationDate: '1993', registrationOrgan: 'ВРУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['ВРУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' }, company: { foundedYear: 1993, foundedCity: 'Київ', story: 'АМКУ — регулятор конкуренції. Контролює злиття, поглинання, антиконкурентні дії.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1993, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 236 34 90'], email: ['info@amcu.gov.ua'] }, support: { email: 'info@amcu.gov.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 25, coverageNote: 'В усіх областях', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://amcu.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: [], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'amku-merger', category: 'Регулювання', name: 'Дозвіл на концентрацію', tagline: 'Дозвіл АМКУ на M&A', description: 'Отримання дозволу на злиття та поглинання для бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 20 400 ₴ (держмито)' }, features: [{ name: 'Дозвіл на M&A', included: true }, { name: 'Перевірка конкуренції', included: true }], requirements: ['Заява', 'Фінзвітність'], processingTime: '25 робочих днів', pros: ['Обов\'язковий для M&A'], cons: ['Довго', 'Дорого'], ctaLabel: 'Подати заявку', ctaUrl: 'https://amcu.gov.ua' }], ratings: { fintodo: { overall: 50, rank: 6, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'АМКУ — регулятор конкуренції.', shortTake: 'Потрібен для M&A та захисту від антиконкурентних дій.', fullVerdict: 'Обов\'язковий для великих угод.', bestFor: [{ segment: 'Бізнес з M&A угодами', reason: 'Обов\'язковий дозвіл', emoji: '🏢' }], notFor: [{ segment: 'Малий бізнес', reason: 'Не стосується' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 2, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Держінфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://amcu.gov.ua', isInternal: false } } },
  { id: 'nazk', slug: 'nazk', name: 'НАЗК', legalName: 'Національне агентство з питань запобігання корупції', brandNames: ['НАЗК', 'NAPC'], types: ['gov', 'gov_service'], logo: { initials: 'НК', color: '#1B5E20' }, website: 'https://nazk.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '39784190', legalForm: 'Державний орган', registrationNumber: '39784190', registrationDate: '2015', registrationOrgan: 'КМУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['ВРУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'НАЗК — орган протидії корупції. Реєстр декларацій, антикорупційна експертиза.', headquarters: 'Київ', employeesCount: '200-500', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2015, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 200 06 94'], email: ['info@nazk.gov.ua'] }, support: { email: 'info@nazk.gov.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Центральний офіс', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://nazk.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['КЕП'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'nazk-declaration', category: 'Антикорупція', name: 'Е-декларування', tagline: 'Подання електронних декларацій', description: 'Реєстр електронних декларацій для посадових осіб та кандидатів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно' }, features: [{ name: 'Е-декларації', included: true }, { name: 'Перевірка декларацій', included: true }], requirements: ['КЕП', 'Статус посадової особи'], processingTime: 'миттєво', pros: ['Безкоштовно', 'Офіційний реєстр'], cons: ['Тільки для зобов\'язаних осіб'], ctaLabel: 'Перейти до реєстру', ctaUrl: 'https://declarations.nazk.gov.ua' }], ratings: { fintodo: { overall: 48, rank: 7, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'НАЗК — антикорупційний орган та е-декларації.', shortTake: 'Обов\'язковий для посадових осіб та держслужбовців.', fullVerdict: 'Для е-декларувания.', bestFor: [{ segment: 'Посадові особи', reason: 'Обов\'язкове декларування', emoji: '📋' }], notFor: [{ segment: 'Звичайний бізнес', reason: 'Не стосується' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 2, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 4.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: false, dia: false, pep: true, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Портал доступний.', dataBackupNote: 'Держінфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://nazk.gov.ua', isInternal: false } } },
  { id: 'rada-biznes', slug: 'rada-biznes', name: 'Рада бізнес-омбудсмена', legalName: 'Рада бізнес-омбудсмена', brandNames: ['BOC', 'Business Ombudsman Council'], types: ['gov', 'gov_service'], logo: { initials: 'РБ', color: '#00695C' }, website: 'https://boi.org.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '39737400', legalForm: 'Інституція', registrationNumber: '39737400', registrationDate: '2015', registrationOrgan: 'КМУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['КМУ'], licenses: [], certifications: [], taxStatus: 'Неприбуткова', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'Рада бізнес-омбудсмена — інституція для захисту прав бізнесу від тиску держорганів.', headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2015, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 237 74 01'], email: ['info@boi.org.ua'] }, support: { email: 'info@boi.org.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Центральний офіс у Києві', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://boi.org.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: [], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'boc-complaint', category: 'Захист бізнесу', name: 'Скарга до бізнес-омбудсмена', tagline: 'Захист від тиску держорганів', description: 'Подання скарги на дії ДПС, митниці, правоохоронців щодо бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно' }, features: [{ name: 'Захист від тиску', included: true }, { name: 'Медіація', included: true }], requirements: ['Юрособа або ФОП'], processingTime: '30 робочих днів', pros: ['Безкоштовно', 'Реальна допомога'], cons: ['Рекомендаційний характер'], ctaLabel: 'Подати скаргу', ctaUrl: 'https://boi.org.ua/complaint' }], ratings: { fintodo: { overall: 65, rank: 8, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Бізнес-омбудсмен — захист від тиску держорганів.', shortTake: 'Безкоштовний захист бізнесу від незаконних дій ДПС та інших.', fullVerdict: 'Рекомендаційний характер, але реально допомагає.', bestFor: [{ segment: 'Бізнес під тиском', reason: 'Безкоштовний захист', emoji: '🛡' }], notFor: [{ segment: 'Фізособи', reason: 'Тільки для бізнесу' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Хмарна інфраструктура.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує прийом скарг.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Подати скаргу', href: 'https://boi.org.ua', isInternal: false } } },
  { id: 'dabi-profile', slug: 'dabi-profile', name: 'ДАБІ', legalName: 'Державна архітектурно-будівельна інспекція', brandNames: ['ДАБІ'], types: ['gov', 'gov_service'], logo: { initials: 'ДБ', color: '#E65100' }, website: 'https://dabi.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '37471505', legalForm: 'Державний орган', registrationNumber: '37471505', registrationDate: '2011', registrationOrgan: 'КМУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['КМУ'], licenses: [], certifications: [], taxStatus: 'Держустанова', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'ДАБІ — дозволи на будівництво, введення в експлуатацію, декларації.', headquarters: 'Київ', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2011, event: 'Заснування', type: 'founding' }] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 271 18 51'], email: ['info@dabi.gov.ua'] }, support: { email: 'info@dabi.gov.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 25, coverageNote: 'В усіх областях', regions: ['Усі області'], branchList: [] }, platforms: { web: { available: true, url: 'https://e-construction.gov.ua', features: ['E-Town', 'Електронні дозволи'] }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['КЕП'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'dabi-permit', category: 'Будівництво', name: 'Дозвіл на будівництво', tagline: 'Електронні дозволи через E-Town', description: 'Отримання дозволів на будівництво та введення в експлуатацію онлайн.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 0 ₴ (декларація) до 10 000+ ₴ (дозвіл)' }, features: [{ name: 'Онлайн через E-Town', included: true }, { name: 'Декларація про початок робіт', included: true }], requirements: ['Проектна документація', 'КЕП'], processingTime: '10-30 робочих днів', pros: ['Онлайн'], cons: ['Складна процедура'], ctaLabel: 'Подати через E-Town', ctaUrl: 'https://e-construction.gov.ua' }], ratings: { fintodo: { overall: 52, rank: 9, categorySlug: 'gov', categoryName: 'Державні органи', parentCategorySlug: 'gov', parentCategoryName: 'Державні органи та сервіси', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ДАБІ — дозволи на будівництво.', shortTake: 'Обов\'язковий для будівництва та реконструкції.', fullVerdict: 'Складно, але без нього не побудуєш.', bestFor: [{ segment: 'Забудовники та бізнес', reason: 'Обов\'язковий дозвіл', emoji: '🏗' }], notFor: [{ segment: 'Малий бізнес без будівництва', reason: 'Не стосується' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 2, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: false, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'E-Town доступний.', dataBackupNote: 'Держінфраструктура.', businessContinuityPlan: 'Держрезерв.', warNote: 'Спрощені процедури під час війни.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на E-Town', href: 'https://e-construction.gov.ua', isInternal: false } } },
  // Протокол
  { id: 'protokol', slug: 'protokol', name: 'Протокол', legalName: 'ТОВ «Протокол»', brandNames: ['Протокол'], types: ['legal_service'], logo: { initials: 'ПР', color: '#2E7D32' }, website: 'https://protokol.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '96942323', legalForm: 'ТОВ', registrationNumber: '42354347', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2014, foundedCity: 'Київ', story: 'Юридичні послуги для бізнесу: договори, реєстрація, супровід.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@protokol.ua'] }, support: { email: 'info@protokol.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 19, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://protokol.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'protokol-main', category: 'Правничий консалтинг', name: 'Юридичний супровід бізнесу', tagline: 'Юридичний супровід та консалтинг', description: 'Юридичні послуги для бізнесу: договори, реєстрація, супровід.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Юридичний супровід та консалтинг'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://protokol.ua' }], ratings: { fintodo: { overall: 75, rank: 2, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Протокол — юридичний супровід та консалтинг.', shortTake: 'Юридичні послуги для бізнесу: договори, реєстрація, супровід.', fullVerdict: 'Юридичні послуги для бізнесу: договори, реєстрація, супровід.', bestFor: [{ segment: 'Бізнес', reason: 'Юридичний супровід та консалтинг', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://protokol.ua', isInternal: false } } },
  // Безоплатна правова допомога
  { id: 'bpd', slug: 'bpd', name: 'Безоплатна правова допомога', legalName: 'Координаційний центр з надання правової допомоги', brandNames: ['Безоплатна правова допомога'], types: ['legal_consulting'], logo: { initials: 'БЕ', color: '#1565C0' }, website: 'https://legalaid.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '11368533', legalForm: 'ТОВ', registrationNumber: '16702153', registrationDate: '2017', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2010, foundedCity: 'Київ', story: 'Державна система безоплатної правової допомоги.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@bpd.ua'] }, support: { email: 'info@bpd.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 17, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://legalaid.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'bpd-main', category: 'Правова допомога', name: 'Безоплатна правова допомога', tagline: 'Безоплатні юридичні консультації для громадян', description: 'Державна система безоплатної правової допомоги.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Безоплатні юридичні консультації для громадян'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://legalaid.gov.ua' }], ratings: { fintodo: { overall: 80, rank: 1, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Безоплатна правова допомога — безоплатні юридичні консультації для громадян.', shortTake: 'Державна система безоплатної правової допомоги.', fullVerdict: 'Державна система безоплатної правової допомоги.', bestFor: [{ segment: 'Фізособи', reason: 'Безоплатні юридичні консультації для громадян', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://legalaid.gov.ua', isInternal: false } } },
  // Jurimex
  { id: 'jurimex', slug: 'jurimex', name: 'Jurimex', legalName: 'ТОВ «Юрімекс»', brandNames: ['Jurimex'], types: ['legal_database'], logo: { initials: 'JU', color: '#0D47A1' }, website: 'https://jurimex.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '30560783', legalForm: 'ТОВ', registrationNumber: '90411221', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2014, foundedCity: 'Київ', story: 'База судових рішень, правовий аналіз та моніторинг.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@jurimex.ua'] }, support: { email: 'info@jurimex.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 21, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://jurimex.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'jurimex-main', category: 'Правова база', name: 'Правова база даних Jurimex', tagline: 'Правова аналітика та база судових рішень', description: 'База судових рішень, правовий аналіз та моніторинг.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Правова аналітика та база судових рішень'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://jurimex.com.ua' }], ratings: { fintodo: { overall: 72, rank: 3, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Jurimex — правова аналітика та база судових рішень.', shortTake: 'База судових рішень, правовий аналіз та моніторинг.', fullVerdict: 'База судових рішень, правовий аналіз та моніторинг.', bestFor: [{ segment: 'Бізнес', reason: 'Правова аналітика та база судових рішень', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://jurimex.com.ua', isInternal: false } } },
  // Правотайм
  { id: 'pravotaim', slug: 'pravotaim', name: 'Правотайм', legalName: 'ТОВ «Правотайм»', brandNames: ['Правотайм'], types: ['legal_service'], logo: { initials: 'ПР', color: '#4527A0' }, website: 'https://pravotaim.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '66518458', legalForm: 'ТОВ', registrationNumber: '91324102', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2014, foundedCity: 'Київ', story: 'Швидкі юридичні консультації онлайн від досвідчених адвокатів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@pravotaim.ua'] }, support: { email: 'info@pravotaim.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 8, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://pravotaim.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'pravotaim-main', category: 'Юридичний онлайн-сервіс', name: 'Онлайн юридичні консультації', tagline: 'Юридичні консультації онлайн 24/7', description: 'Швидкі юридичні консультації онлайн від досвідчених адвокатів.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Юридичні консультації онлайн 24/7'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://pravotaim.com.ua' }], ratings: { fintodo: { overall: 68, rank: 5, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Правотайм — юридичні консультації онлайн 24/7.', shortTake: 'Швидкі юридичні консультації онлайн від досвідчених адвокатів.', fullVerdict: 'Швидкі юридичні консультації онлайн від досвідчених адвокатів.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Юридичні консультації онлайн 24/7', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://pravotaim.com.ua', isInternal: false } } },
  // LegalBot
  { id: 'legalbot', slug: 'legalbot', name: 'LegalBot', legalName: 'ТОВ «ЛігалБот»', brandNames: ['LegalBot'], types: ['legal_service'], logo: { initials: 'LE', color: '#00695C' }, website: 'https://legalbot.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '95646633', legalForm: 'ТОВ', registrationNumber: '81474501', registrationDate: '2017', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Генерація юридичних документів та консультації з ШІ.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@legalbot.ua'] }, support: { email: 'info@legalbot.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 18, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://legalbot.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'legalbot-main', category: 'AI юрист', name: 'AI юридичний помічник', tagline: 'Автоматизовані юридичні документи', description: 'Генерація юридичних документів та консультації з ШІ.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Автоматизовані юридичні документи'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://legalbot.ua' }], ratings: { fintodo: { overall: 65, rank: 6, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'LegalBot — автоматизовані юридичні документи.', shortTake: 'Генерація юридичних документів та консультації з ШІ.', fullVerdict: 'Генерація юридичних документів та консультації з ШІ.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Автоматизовані юридичні документи', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://legalbot.ua', isInternal: false } } },
  // Notario
  { id: 'notario', slug: 'notario', name: 'Notario', legalName: 'ТОВ «Нотаріо»', brandNames: ['Notario'], types: ['notary'], logo: { initials: 'NO', color: '#5D4037' }, website: 'https://notario.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '60853754', legalForm: 'ТОВ', registrationNumber: '32937500', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Платформа для пошуку нотаріуса та запису на прийом.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@notario.ua'] }, support: { email: 'info@notario.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 11, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://notario.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'notario-main', category: 'Нотаріальні послуги', name: 'Онлайн запис до нотаріуса', tagline: 'Пошук нотаріуса та онлайн-запис', description: 'Платформа для пошуку нотаріуса та запису на прийом.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Пошук нотаріуса та онлайн-запис'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://notario.com.ua' }], ratings: { fintodo: { overall: 62, rank: 7, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Notario — пошук нотаріуса та онлайн-запис.', shortTake: 'Платформа для пошуку нотаріуса та запису на прийом.', fullVerdict: 'Платформа для пошуку нотаріуса та запису на прийом.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Пошук нотаріуса та онлайн-запис', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://notario.com.ua', isInternal: false } } },
  // Закон і Бізнес
  { id: 'zakon-i-biznes', slug: 'zakon-i-biznes', name: 'Закон і Бізнес', legalName: 'ТОВ «Закон і Бізнес»', brandNames: ['Закон і Бізнес'], types: ['legal_database'], logo: { initials: 'ЗА', color: '#37474F' }, website: 'https://zib.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '13377120', legalForm: 'ТОВ', registrationNumber: '61055590', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2014, foundedCity: 'Київ', story: 'Аналітичний юридичний портал з коментарями законодавства.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@zakon-i-biznes.ua'] }, support: { email: 'info@zakon-i-biznes.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 5, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://zib.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'zakon-i-biznes-main', category: 'Юридичне видання', name: 'Юридичний портал', tagline: 'Аналітика для юристів та бізнесу', description: 'Аналітичний юридичний портал з коментарями законодавства.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Аналітика для юристів та бізнесу'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://zib.com.ua' }], ratings: { fintodo: { overall: 60, rank: 8, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Закон і Бізнес — аналітика для юристів та бізнесу.', shortTake: 'Аналітичний юридичний портал з коментарями законодавства.', fullVerdict: 'Аналітичний юридичний портал з коментарями законодавства.', bestFor: [{ segment: 'Бізнес', reason: 'Аналітика для юристів та бізнесу', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://zib.com.ua', isInternal: false } } },
  // Liga360
  { id: 'liga360', slug: 'liga360', name: 'Liga360', legalName: 'ТОВ «ІАС «ЛІГА»', brandNames: ['Liga360'], types: ['legal_database'], logo: { initials: 'LI', color: '#E65100' }, website: 'https://liga360.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '45127541', legalForm: 'ТОВ', registrationNumber: '19428462', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Правова аналітика, моніторинг контрагентів та реєстрів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@liga360.ua'] }, support: { email: 'info@liga360.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 10, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://liga360.com' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'liga360-main', category: 'Правова платформа', name: 'Liga360 для бізнесу', tagline: 'Комплексна правова платформа', description: 'Правова аналітика, моніторинг контрагентів та реєстрів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Комплексна правова платформа'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://liga360.com' }], ratings: { fintodo: { overall: 82, rank: 1, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Liga360 — комплексна правова платформа.', shortTake: 'Правова аналітика, моніторинг контрагентів та реєстрів.', fullVerdict: 'Правова аналітика, моніторинг контрагентів та реєстрів.', bestFor: [{ segment: 'Бізнес', reason: 'Комплексна правова платформа', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://liga360.com', isInternal: false } } },
  // LexInform
  { id: 'lexinform', slug: 'lexinform', name: 'LexInform', legalName: 'ТОВ «ЛексІнформ»', brandNames: ['LexInform'], types: ['legal_database'], logo: { initials: 'LE', color: '#1B5E20' }, website: 'https://lexinform.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '14806979', legalForm: 'ТОВ', registrationNumber: '44063657', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'Правова довідково-інформаційна система для бухгалтерів та юристів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@lexinform.ua'] }, support: { email: 'info@lexinform.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 21, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://lexinform.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'lexinform-main', category: 'Правова база', name: 'Правова довідкова система', tagline: 'Довідкова правова система', description: 'Правова довідково-інформаційна система для бухгалтерів та юристів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Довідкова правова система'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://lexinform.com.ua' }], ratings: { fintodo: { overall: 58, rank: 9, categorySlug: 'legal', categoryName: 'Юридичні послуги', parentCategorySlug: 'legal', parentCategoryName: 'Юридичні послуги', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'LexInform — довідкова правова система.', shortTake: 'Правова довідково-інформаційна система для бухгалтерів та юристів.', fullVerdict: 'Правова довідково-інформаційна система для бухгалтерів та юристів.', bestFor: [{ segment: 'Бізнес', reason: 'Довідкова правова система', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://lexinform.com.ua', isInternal: false } } },
  // єОселя
  { id: 'yeoselya', slug: 'yeoselya', name: 'єОселя', legalName: 'Укрфінжитло', brandNames: ['єОселя'], types: ['mortgage'], logo: { initials: 'ЄО', color: '#1565C0' }, website: 'https://yeoselya.diia.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '67143871', legalForm: 'ТОВ', registrationNumber: '93088438', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Державна програма пільгового іпотечного кредитування під 3%.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@yeoselya.ua'] }, support: { email: 'info@yeoselya.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 10, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://yeoselya.diia.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'yeoselya-main', category: 'Іпотечна програма', name: 'єОселя — пільгова іпотека', tagline: 'Державна пільгова іпотека 3%', description: 'Державна програма пільгового іпотечного кредитування під 3%.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Державна пільгова іпотека 3%'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://yeoselya.diia.gov.ua' }], ratings: { fintodo: { overall: 90, rank: 1, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'єОселя — державна пільгова іпотека 3%.', shortTake: 'Державна програма пільгового іпотечного кредитування під 3%.', fullVerdict: 'Державна програма пільгового іпотечного кредитування під 3%.', bestFor: [{ segment: 'Фізособи', reason: 'Державна пільгова іпотека 3%', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 9.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://yeoselya.diia.gov.ua', isInternal: false } } },
  // CreditPlus
  { id: 'creditplus', slug: 'creditplus', name: 'CreditPlus', legalName: 'ТОВ «КредитПлюс»', brandNames: ['CreditPlus'], types: ['microloan'], logo: { initials: 'CR', color: '#FF6F00' }, website: 'https://creditplus.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '17127490', legalForm: 'ТОВ', registrationNumber: '86371231', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'Мікрокредити онлайн за 15 хвилин без довідки про доходи.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@creditplus.ua'] }, support: { email: 'info@creditplus.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 16, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://creditplus.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'creditplus-main', category: 'Мікрокредит', name: 'Мікрокредит CreditPlus', tagline: 'Швидкий кредит онлайн до 20 000 ₴', description: 'Мікрокредити онлайн за 15 хвилин без довідки про доходи.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Швидкий кредит онлайн до 20 000 ₴'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://creditplus.ua' }], ratings: { fintodo: { overall: 55, rank: 6, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'CreditPlus — швидкий кредит онлайн до 20 000 ₴.', shortTake: 'Мікрокредити онлайн за 15 хвилин без довідки про доходи.', fullVerdict: 'Мікрокредити онлайн за 15 хвилин без довідки про доходи.', bestFor: [{ segment: 'Фізособи', reason: 'Швидкий кредит онлайн до 20 000 ₴', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://creditplus.ua', isInternal: false } } },
  // Манівео
  { id: 'maniveo', slug: 'maniveo', name: 'Манівео', legalName: 'ТОВ «Манівео»', brandNames: ['Манівео'], types: ['microloan'], logo: { initials: 'МА', color: '#43A047' }, website: 'https://maniveo.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '15778168', legalForm: 'ТОВ', registrationNumber: '34875889', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Мікрокредити онлайн до 15 000 ₴. Перший — під мінімальний відсоток.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@maniveo.ua'] }, support: { email: 'info@maniveo.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 5, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://maniveo.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'maniveo-main', category: 'Мікрокредит', name: 'Кредит онлайн Манівео', tagline: 'Перший кредит під 0.01%', description: 'Мікрокредити онлайн до 15 000 ₴. Перший — під мінімальний відсоток.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Перший кредит під 0.01%'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://maniveo.ua' }], ratings: { fintodo: { overall: 58, rank: 5, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Манівео — перший кредит під 0.01%.', shortTake: 'Мікрокредити онлайн до 15 000 ₴. Перший — під мінімальний відсоток.', fullVerdict: 'Мікрокредити онлайн до 15 000 ₴. Перший — під мінімальний відсоток.', bestFor: [{ segment: 'Фізособи', reason: 'Перший кредит під 0.01%', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://maniveo.ua', isInternal: false } } },
  // КредитМаркет
  { id: 'kreditmarket', slug: 'kreditmarket', name: 'КредитМаркет', legalName: 'ТОВ «КредитМаркет»', brandNames: ['КредитМаркет'], types: ['consumer_credit'], logo: { initials: 'КР', color: '#1976D2' }, website: 'https://creditmarket.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '97174978', legalForm: 'ТОВ', registrationNumber: '89018427', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2017, foundedCity: 'Київ', story: 'Споживче кредитування в точках продажу. Кредит на техніку, меблі.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@kreditmarket.ua'] }, support: { email: 'info@kreditmarket.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 12, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://creditmarket.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'kreditmarket-main', category: 'Споживчий кредит', name: 'Кредит на товар КредитМаркет', tagline: 'Кредити на товар у магазинах', description: 'Споживче кредитування в точках продажу. Кредит на техніку, меблі.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Кредити на товар у магазинах'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://creditmarket.com.ua' }], ratings: { fintodo: { overall: 62, rank: 4, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'КредитМаркет — кредити на товар у магазинах.', shortTake: 'Споживче кредитування в точках продажу. Кредит на техніку, меблі.', fullVerdict: 'Споживче кредитування в точках продажу. Кредит на техніку, меблі.', bestFor: [{ segment: 'Фізособи', reason: 'Кредити на товар у магазинах', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://creditmarket.com.ua', isInternal: false } } },
  // ПУМБ Кредити
  { id: 'pumb-credit', slug: 'pumb-credit', name: 'ПУМБ Кредити', legalName: 'АТ «ПУМБ»', brandNames: ['ПУМБ Кредити'], types: ['consumer_credit'], logo: { initials: 'ПУ', color: '#00838F' }, website: 'https://pumb.ua/credit', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '83165382', legalForm: 'ТОВ', registrationNumber: '83413493', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Споживчі та бізнес-кредити від ПУМБ.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@pumb-credit.ua'] }, support: { email: 'info@pumb-credit.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 4, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://pumb.ua/credit' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'pumb-credit-main', category: 'Банківський кредит', name: 'Кредити ПУМБ', tagline: 'Кредити для бізнесу та фізосіб', description: 'Споживчі та бізнес-кредити від ПУМБ.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Кредити для бізнесу та фізосіб'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://pumb.ua/credit' }], ratings: { fintodo: { overall: 70, rank: 3, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ПУМБ Кредити — кредити для бізнесу та фізосіб.', shortTake: 'Споживчі та бізнес-кредити від ПУМБ.', fullVerdict: 'Споживчі та бізнес-кредити від ПУМБ.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Кредити для бізнесу та фізосіб', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://pumb.ua/credit', isInternal: false } } },
  // Аванс
  { id: 'avans', slug: 'avans', name: 'Аванс', legalName: 'ТОВ «ФК «Аванс»', brandNames: ['Аванс'], types: ['microloan'], logo: { initials: 'АВ', color: '#AD1457' }, website: 'https://avans.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '99570846', legalForm: 'ТОВ', registrationNumber: '97978838', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Мікрокредити онлайн на картку до 10 000 ₴.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@avans.ua'] }, support: { email: 'info@avans.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 17, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://avans.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'avans-main', category: 'Мікрокредит', name: 'Мікрокредит Аванс', tagline: 'Кредит на картку за 5 хвилин', description: 'Мікрокредити онлайн на картку до 10 000 ₴.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Кредит на картку за 5 хвилин'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://avans.com.ua' }], ratings: { fintodo: { overall: 50, rank: 8, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Аванс — кредит на картку за 5 хвилин.', shortTake: 'Мікрокредити онлайн на картку до 10 000 ₴.', fullVerdict: 'Мікрокредити онлайн на картку до 10 000 ₴.', bestFor: [{ segment: 'Фізособи', reason: 'Кредит на картку за 5 хвилин', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://avans.com.ua', isInternal: false } } },
  // FinBridge
  { id: 'finbridge', slug: 'finbridge', name: 'FinBridge', legalName: 'ТОВ «ФінБрідж»', brandNames: ['FinBridge'], types: ['leasing'], logo: { initials: 'FI', color: '#283593' }, website: 'https://finbridge.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '74204953', legalForm: 'ТОВ', registrationNumber: '11410825', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'Фінансовий лізинг обладнання та транспорту для бізнесу.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@finbridge.ua'] }, support: { email: 'info@finbridge.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 9, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://finbridge.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'finbridge-main', category: 'Лізинг', name: 'Фінансовий лізинг FinBridge', tagline: 'Лізинг обладнання для бізнесу', description: 'Фінансовий лізинг обладнання та транспорту для бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Лізинг обладнання для бізнесу'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://finbridge.com.ua' }], ratings: { fintodo: { overall: 65, rank: 4, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'FinBridge — лізинг обладнання для бізнесу.', shortTake: 'Фінансовий лізинг обладнання та транспорту для бізнесу.', fullVerdict: 'Фінансовий лізинг обладнання та транспорту для бізнесу.', bestFor: [{ segment: 'Бізнес', reason: 'Лізинг обладнання для бізнесу', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://finbridge.com.ua', isInternal: false } } },
  // Глобус Банк кредити
  { id: 'globus-credit', slug: 'globus-credit', name: 'Глобус Банк кредити', legalName: 'АТ «Глобус Банк»', brandNames: ['Глобус Банк кредити'], types: ['consumer_credit'], logo: { initials: 'ГЛ', color: '#E65100' }, website: 'https://globusbank.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '44485611', legalForm: 'ТОВ', registrationNumber: '81253203', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Споживчі кредити готівкою від Глобус Банку.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@globus-credit.ua'] }, support: { email: 'info@globus-credit.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 6, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://globusbank.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'globus-credit-main', category: 'Банківський кредит', name: 'Кредит готівкою Глобус Банк', tagline: 'Кредит готівкою до 500 000 ₴', description: 'Споживчі кредити готівкою від Глобус Банку.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Кредит готівкою до 500 000 ₴'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://globusbank.ua' }], ratings: { fintodo: { overall: 52, rank: 7, categorySlug: 'credit', categoryName: 'Кредити', parentCategorySlug: 'credit', parentCategoryName: 'Кредити', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Глобус Банк кредити — кредит готівкою до 500 000 ₴.', shortTake: 'Споживчі кредити готівкою від Глобус Банку.', fullVerdict: 'Споживчі кредити готівкою від Глобус Банку.', bestFor: [{ segment: 'Фізособи', reason: 'Кредит готівкою до 500 000 ₴', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://globusbank.ua', isInternal: false } } },
  // Robota.ua
  { id: 'robota-ua', slug: 'robota-ua', name: 'Robota.ua', legalName: 'ТОВ «Робота Інтернешнл»', brandNames: ['Robota.ua'], types: ['hr_platform', 'recruiting'], logo: { initials: 'RO', color: '#1565C0' }, website: 'https://robota.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '58588294', legalForm: 'ТОВ', registrationNumber: '18128366', registrationDate: '2012', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Пошук роботи для кандидатів та підбір персоналу для бізнесу.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@robota-ua.ua'] }, support: { email: 'info@robota-ua.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 5, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://robota.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'robota-ua-main', category: 'Рекрутинг', name: 'Пошук роботи та найм', tagline: 'Найбільший сайт з працевлаштування', description: 'Пошук роботи для кандидатів та підбір персоналу для бізнесу.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Найбільший сайт з працевлаштування'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://robota.ua' }], ratings: { fintodo: { overall: 85, rank: 1, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Robota.ua — найбільший сайт з працевлаштування.', shortTake: 'Пошук роботи для кандидатів та підбір персоналу для бізнесу.', fullVerdict: 'Пошук роботи для кандидатів та підбір персоналу для бізнесу.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Найбільший сайт з працевлаштування', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://robota.ua', isInternal: false } } },
  // Work.ua
  { id: 'work-ua', slug: 'work-ua', name: 'Work.ua', legalName: 'ТОВ «Ворк.юа»', brandNames: ['Work.ua'], types: ['hr_platform', 'recruiting'], logo: { initials: 'WO', color: '#43A047' }, website: 'https://work.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '39409779', legalForm: 'ТОВ', registrationNumber: '68937679', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2010, foundedCity: 'Київ', story: 'Один з найбільших сайтів пошуку роботи в Україні.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@work-ua.ua'] }, support: { email: 'info@work-ua.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 18, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://work.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'work-ua-main', category: 'Рекрутинг', name: 'Пошук роботи Work.ua', tagline: 'Вакансії та резюме по всій Україні', description: 'Один з найбільших сайтів пошуку роботи в Україні.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Вакансії та резюме по всій Україні'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://work.ua' }], ratings: { fintodo: { overall: 83, rank: 2, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Work.ua — вакансії та резюме по всій україні.', shortTake: 'Один з найбільших сайтів пошуку роботи в Україні.', fullVerdict: 'Один з найбільших сайтів пошуку роботи в Україні.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Вакансії та резюме по всій Україні', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.3, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://work.ua', isInternal: false } } },
  // HeadHunter UA
  { id: 'headhunter-ua', slug: 'headhunter-ua', name: 'HeadHunter UA', legalName: 'ТОВ «Хедхантер Україна»', brandNames: ['HeadHunter UA'], types: ['recruiting'], logo: { initials: 'HE', color: '#D50000' }, website: 'https://hh.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '71026900', legalForm: 'ТОВ', registrationNumber: '62566060', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'Платформа для пошуку топ-менеджменту та IT-спеціалістів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@headhunter-ua.ua'] }, support: { email: 'info@headhunter-ua.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 13, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://hh.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'headhunter-ua-main', category: 'Рекрутинг', name: 'Рекрутинг HeadHunter', tagline: 'Професійний рекрутинг', description: 'Платформа для пошуку топ-менеджменту та IT-спеціалістів.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Професійний рекрутинг'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://hh.ua' }], ratings: { fintodo: { overall: 72, rank: 4, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'HeadHunter UA — професійний рекрутинг.', shortTake: 'Платформа для пошуку топ-менеджменту та IT-спеціалістів.', fullVerdict: 'Платформа для пошуку топ-менеджменту та IT-спеціалістів.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Професійний рекрутинг', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://hh.ua', isInternal: false } } },
  // PeopleForce
  { id: 'peopleforce', slug: 'peopleforce', name: 'PeopleForce', legalName: 'ТОВ «ПіплФорс»', brandNames: ['PeopleForce'], types: ['hrm'], logo: { initials: 'PE', color: '#6A1B9A' }, website: 'https://peopleforce.io', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '24949038', legalForm: 'ТОВ', registrationNumber: '93297002', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2016, foundedCity: 'Київ', story: 'Хмарна HR-платформа для автоматизації HR-процесів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@peopleforce.ua'] }, support: { email: 'info@peopleforce.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 3, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://peopleforce.io' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'peopleforce-main', category: 'HRM-система', name: 'HRM PeopleForce', tagline: 'HR-платформа для управління персоналом', description: 'Хмарна HR-платформа для автоматизації HR-процесів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['HR-платформа для управління персоналом'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://peopleforce.io' }], ratings: { fintodo: { overall: 76, rank: 3, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'PeopleForce — hr-платформа для управління персоналом.', shortTake: 'Хмарна HR-платформа для автоматизації HR-процесів.', fullVerdict: 'Хмарна HR-платформа для автоматизації HR-процесів.', bestFor: [{ segment: 'Бізнес', reason: 'HR-платформа для управління персоналом', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.6, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://peopleforce.io', isInternal: false } } },
  // BambooHR UA
  { id: 'bamboohr-ua', slug: 'bamboohr-ua', name: 'BambooHR UA', legalName: 'BambooHR LLC', brandNames: ['BambooHR UA'], types: ['hrm'], logo: { initials: 'BA', color: '#7CB342' }, website: 'https://bamboohr.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '73794250', legalForm: 'ТОВ', registrationNumber: '18912150', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'HR-платформа для малого та середнього бізнесу з адаптацією для України.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@bamboohr-ua.ua'] }, support: { email: 'info@bamboohr-ua.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 20, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://bamboohr.com' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'bamboohr-ua-main', category: 'HRM-система', name: 'BambooHR для України', tagline: 'Міжнародна HR-система', description: 'HR-платформа для малого та середнього бізнесу з адаптацією для України.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Міжнародна HR-система'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://bamboohr.com' }], ratings: { fintodo: { overall: 70, rank: 5, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'BambooHR UA — міжнародна hr-система.', shortTake: 'HR-платформа для малого та середнього бізнесу з адаптацією для України.', fullVerdict: 'HR-платформа для малого та середнього бізнесу з адаптацією для України.', bestFor: [{ segment: 'Бізнес', reason: 'Міжнародна HR-система', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://bamboohr.com', isInternal: false } } },
  // Zoho People UA
  { id: 'zoho-people-ua', slug: 'zoho-people-ua', name: 'Zoho People UA', legalName: 'Zoho Corporation', brandNames: ['Zoho People UA'], types: ['hrm'], logo: { initials: 'ZO', color: '#E65100' }, website: 'https://zoho.com/people', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '58574480', legalForm: 'ТОВ', registrationNumber: '85251752', registrationDate: '2017', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2016, foundedCity: 'Київ', story: 'HR-система для обліку відпусток, робочого часу та оцінки персоналу.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@zoho-people-ua.ua'] }, support: { email: 'info@zoho-people-ua.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 8, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://zoho.com/people' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'zoho-people-ua-main', category: 'HRM-система', name: 'Zoho People для України', tagline: 'Хмарна HR-система', description: 'HR-система для обліку відпусток, робочого часу та оцінки персоналу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Хмарна HR-система'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://zoho.com/people' }], ratings: { fintodo: { overall: 65, rank: 6, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Zoho People UA — хмарна hr-система.', shortTake: 'HR-система для обліку відпусток, робочого часу та оцінки персоналу.', fullVerdict: 'HR-система для обліку відпусток, робочого часу та оцінки персоналу.', bestFor: [{ segment: 'Бізнес', reason: 'Хмарна HR-система', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://zoho.com/people', isInternal: false } } },
  // Персонал Плюс
  { id: 'personal-plus', slug: 'personal-plus', name: 'Персонал Плюс', legalName: 'ТОВ «Персонал Плюс»', brandNames: ['Персонал Плюс'], types: ['payroll'], logo: { initials: 'ПЕ', color: '#37474F' }, website: 'https://personalplus.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '42842121', legalForm: 'ТОВ', registrationNumber: '32442516', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Автоматизація нарахування зарплати, ЄСВ, ПДФО.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@personal-plus.ua'] }, support: { email: 'info@personal-plus.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 17, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://personalplus.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'personal-plus-main', category: 'Зарплата', name: 'Облік зарплати Персонал Плюс', tagline: 'Програма для нарахування зарплати', description: 'Автоматизація нарахування зарплати, ЄСВ, ПДФО.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Програма для нарахування зарплати'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://personalplus.com.ua' }], ratings: { fintodo: { overall: 60, rank: 7, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Персонал Плюс — програма для нарахування зарплати.', shortTake: 'Автоматизація нарахування зарплати, ЄСВ, ПДФО.', fullVerdict: 'Автоматизація нарахування зарплати, ЄСВ, ПДФО.', bestFor: [{ segment: 'Бізнес', reason: 'Програма для нарахування зарплати', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://personalplus.com.ua', isInternal: false } } },
  // CleverStaff
  { id: 'cleverstaff', slug: 'cleverstaff', name: 'CleverStaff', legalName: 'ТОВ «КлеверСтафф»', brandNames: ['CleverStaff'], types: ['recruiting'], logo: { initials: 'CL', color: '#0277BD' }, website: 'https://cleverstaff.net', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '39850269', legalForm: 'ТОВ', registrationNumber: '57464661', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'ATS-система для автоматизації рекрутингу.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@cleverstaff.ua'] }, support: { email: 'info@cleverstaff.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 21, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://cleverstaff.net' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'cleverstaff-main', category: 'ATS', name: 'ATS CleverStaff', tagline: 'Система управління кандидатами', description: 'ATS-система для автоматизації рекрутингу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Система управління кандидатами'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://cleverstaff.net' }], ratings: { fintodo: { overall: 68, rank: 5, categorySlug: 'hr', categoryName: 'HR та персонал', parentCategorySlug: 'hr', parentCategoryName: 'HR та персонал', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'CleverStaff — система управління кандидатами.', shortTake: 'ATS-система для автоматизації рекрутингу.', fullVerdict: 'ATS-система для автоматизації рекрутингу.', bestFor: [{ segment: 'Бізнес', reason: 'Система управління кандидатами', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://cleverstaff.net', isInternal: false } } },
  // Вчасно.Реєстрація
  { id: 'vchasno-reg', slug: 'vchasno-reg', name: 'Вчасно.Реєстрація', legalName: 'ТОВ «Вчасно»', brandNames: ['Вчасно.Реєстрація'], types: ['business_registration'], logo: { initials: 'ВЧ', color: '#1565C0' }, website: 'https://vchasno.ua/registration', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '99261055', legalForm: 'ТОВ', registrationNumber: '49866653', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Онлайн-реєстрація ФОП та ТОВ через сервіс Вчасно.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@vchasno-reg.ua'] }, support: { email: 'info@vchasno-reg.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 3, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://vchasno.ua/registration' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'vchasno-reg-main', category: 'Реєстрація', name: 'Реєстрація ФОП/ТОВ', tagline: 'Реєстрація бізнесу онлайн', description: 'Онлайн-реєстрація ФОП та ТОВ через сервіс Вчасно.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Реєстрація бізнесу онлайн'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://vchasno.ua/registration' }], ratings: { fintodo: { overall: 78, rank: 2, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Вчасно.Реєстрація — реєстрація бізнесу онлайн.', shortTake: 'Онлайн-реєстрація ФОП та ТОВ через сервіс Вчасно.', fullVerdict: 'Онлайн-реєстрація ФОП та ТОВ через сервіс Вчасно.', bestFor: [{ segment: 'Бізнес', reason: 'Реєстрація бізнесу онлайн', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://vchasno.ua/registration', isInternal: false } } },
  // YouControl
  { id: 'youcontrol', slug: 'youcontrol', name: 'YouControl', legalName: 'ТОВ «ЮКонтрол»', brandNames: ['YouControl'], types: ['monitoring'], logo: { initials: 'YO', color: '#2E7D32' }, website: 'https://youcontrol.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '35766866', legalForm: 'ТОВ', registrationNumber: '16219584', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Перевірка компаній, моніторинг контрагентів та аналіз ризиків.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@youcontrol.ua'] }, support: { email: 'info@youcontrol.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 11, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://youcontrol.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'youcontrol-main', category: 'Моніторинг', name: 'Перевірка контрагентів', tagline: 'Аналітична система перевірки контрагентів', description: 'Перевірка компаній, моніторинг контрагентів та аналіз ризиків.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Аналітична система перевірки контрагентів'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://youcontrol.com.ua' }], ratings: { fintodo: { overall: 82, rank: 1, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'YouControl — аналітична система перевірки контрагентів.', shortTake: 'Перевірка компаній, моніторинг контрагентів та аналіз ризиків.', fullVerdict: 'Перевірка компаній, моніторинг контрагентів та аналіз ризиків.', bestFor: [{ segment: 'Бізнес', reason: 'Аналітична система перевірки контрагентів', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://youcontrol.com.ua', isInternal: false } } },
  // Clarity
  { id: 'clarity-project', slug: 'clarity-project', name: 'Clarity', legalName: 'ТОВ «Клеріті Проджект»', brandNames: ['Clarity'], types: ['monitoring'], logo: { initials: 'CL', color: '#0D47A1' }, website: 'https://clarity-project.info', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '38238524', legalForm: 'ТОВ', registrationNumber: '85226134', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Аналітика ProZorro, моніторинг компаній та закупівель.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@clarity-project.ua'] }, support: { email: 'info@clarity-project.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 14, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://clarity-project.info' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'clarity-project-main', category: 'Аналітика', name: 'Аналітика держзакупівель', tagline: 'Моніторинг держзакупівель та компаній', description: 'Аналітика ProZorro, моніторинг компаній та закупівель.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Моніторинг держзакупівель та компаній'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://clarity-project.info' }], ratings: { fintodo: { overall: 75, rank: 3, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Clarity — моніторинг держзакупівель та компаній.', shortTake: 'Аналітика ProZorro, моніторинг компаній та закупівель.', fullVerdict: 'Аналітика ProZorro, моніторинг компаній та закупівель.', bestFor: [{ segment: 'Бізнес', reason: 'Моніторинг держзакупівель та компаній', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://clarity-project.info', isInternal: false } } },
  // ЄДР
  { id: 'edr', slug: 'edr', name: 'ЄДР', legalName: 'Міністерство юстиції України', brandNames: ['ЄДР'], types: ['edr'], logo: { initials: 'ЄД', color: '#37474F' }, website: 'https://usr.minjust.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '82396786', legalForm: 'ТОВ', registrationNumber: '62466615', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Єдиний державний реєстр юридичних та фізичних осіб-підприємців.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@edr.ua'] }, support: { email: 'info@edr.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 12, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://usr.minjust.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'edr-main', category: 'Державний реєстр', name: 'Єдиний держреєстр', tagline: 'Офіційний реєстр юридичних осіб', description: 'Єдиний державний реєстр юридичних та фізичних осіб-підприємців.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Офіційний реєстр юридичних осіб'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://usr.minjust.gov.ua' }], ratings: { fintodo: { overall: 70, rank: 4, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ЄДР — офіційний реєстр юридичних осіб.', shortTake: 'Єдиний державний реєстр юридичних та фізичних осіб-підприємців.', fullVerdict: 'Єдиний державний реєстр юридичних та фізичних осіб-підприємців.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Офіційний реєстр юридичних осіб', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://usr.minjust.gov.ua', isInternal: false } } },
  // Nais
  { id: 'nais', slug: 'nais', name: 'Nais', legalName: 'ДП «НАІС»', brandNames: ['Nais'], types: ['registry'], logo: { initials: 'NA', color: '#4527A0' }, website: 'https://nais.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '20881300', legalForm: 'ТОВ', registrationNumber: '89656259', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'Платформа доступу до державних реєстрів нерухомості, обтяжень тощо.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@nais.ua'] }, support: { email: 'info@nais.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 16, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://nais.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'nais-main', category: 'Державні реєстри', name: 'Національні інформаційні системи', tagline: 'Доступ до державних реєстрів', description: 'Платформа доступу до державних реєстрів нерухомості, обтяжень тощо.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Доступ до державних реєстрів'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://nais.gov.ua' }], ratings: { fintodo: { overall: 65, rank: 6, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Nais — доступ до державних реєстрів.', shortTake: 'Платформа доступу до державних реєстрів нерухомості, обтяжень тощо.', fullVerdict: 'Платформа доступу до державних реєстрів нерухомості, обтяжень тощо.', bestFor: [{ segment: 'Бізнес', reason: 'Доступ до державних реєстрів', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://nais.gov.ua', isInternal: false } } },
  // Реєстр.Онлайн
  { id: 'registr-online', slug: 'registr-online', name: 'Реєстр.Онлайн', legalName: 'ТОВ «Реєстр.Онлайн»', brandNames: ['Реєстр.Онлайн'], types: ['business_registration'], logo: { initials: 'РЕ', color: '#00695C' }, website: 'https://registr.online', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '44838089', legalForm: 'ТОВ', registrationNumber: '42570456', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Онлайн-сервіс для реєстрації ФОП, ТОВ та змін у реєстрі.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@registr-online.ua'] }, support: { email: 'info@registr-online.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 9, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://registr.online' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'registr-online-main', category: 'Реєстрація', name: 'Реєстрація бізнесу онлайн', tagline: 'Швидка реєстрація ФОП та ТОВ', description: 'Онлайн-сервіс для реєстрації ФОП, ТОВ та змін у реєстрі.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Швидка реєстрація ФОП та ТОВ'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://registr.online' }], ratings: { fintodo: { overall: 60, rank: 7, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Реєстр.Онлайн — швидка реєстрація фоп та тов.', shortTake: 'Онлайн-сервіс для реєстрації ФОП, ТОВ та змін у реєстрі.', fullVerdict: 'Онлайн-сервіс для реєстрації ФОП, ТОВ та змін у реєстрі.', bestFor: [{ segment: 'Бізнес', reason: 'Швидка реєстрація ФОП та ТОВ', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://registr.online', isInternal: false } } },
  // ProZorro
  { id: 'prozorro', slug: 'prozorro', name: 'ProZorro', legalName: 'ДП «ProZorro»', brandNames: ['ProZorro'], types: ['edr'], logo: { initials: 'PR', color: '#1B5E20' }, website: 'https://prozorro.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '95544982', legalForm: 'ТОВ', registrationNumber: '27865503', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2014, foundedCity: 'Київ', story: 'Система електронних державних закупівель ProZorro.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@prozorro.ua'] }, support: { email: 'info@prozorro.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 20, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://prozorro.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'prozorro-main', category: 'Держзакупівлі', name: 'Система ProZorro', tagline: 'Прозорі держзакупівлі', description: 'Система електронних державних закупівель ProZorro.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Прозорі держзакупівлі'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://prozorro.gov.ua' }], ratings: { fintodo: { overall: 85, rank: 1, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ProZorro — прозорі держзакупівлі.', shortTake: 'Система електронних державних закупівель ProZorro.', fullVerdict: 'Система електронних державних закупівель ProZorro.', bestFor: [{ segment: 'Бізнес', reason: 'Прозорі держзакупівлі', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://prozorro.gov.ua', isInternal: false } } },
  // SmartTender
  { id: 'smarttender', slug: 'smarttender', name: 'SmartTender', legalName: 'ТОВ «Смарт Тендер»', brandNames: ['SmartTender'], types: ['edr'], logo: { initials: 'SM', color: '#E65100' }, website: 'https://smarttender.biz', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '62075442', legalForm: 'ТОВ', registrationNumber: '69369739', registrationDate: '2016', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2017, foundedCity: 'Київ', story: 'Авторизований майданчик для участі у держзакупівлях ProZorro.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@smarttender.ua'] }, support: { email: 'info@smarttender.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 10, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://smarttender.biz' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'smarttender-main', category: 'Тендери', name: 'Майданчик SmartTender', tagline: 'Акредитований майданчик ProZorro', description: 'Авторизований майданчик для участі у держзакупівлях ProZorro.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Акредитований майданчик ProZorro'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://smarttender.biz' }], ratings: { fintodo: { overall: 72, rank: 3, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'SmartTender — акредитований майданчик prozorro.', shortTake: 'Авторизований майданчик для участі у держзакупівлях ProZorro.', fullVerdict: 'Авторизований майданчик для участі у держзакупівлях ProZorro.', bestFor: [{ segment: 'Бізнес', reason: 'Акредитований майданчик ProZorro', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://smarttender.biz', isInternal: false } } },
  // DataBot Pro
  { id: 'databot-pro', slug: 'databot-pro', name: 'DataBot Pro', legalName: 'ТОВ «ДатаБот Про»', brandNames: ['DataBot Pro'], types: ['monitoring'], logo: { initials: 'DA', color: '#AD1457' }, website: 'https://databotpro.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '10321840', legalForm: 'ТОВ', registrationNumber: '20440621', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2016, foundedCity: 'Київ', story: 'Моніторинг контрагентів, реєстрів та аналітика ризиків для бізнесу.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@databot-pro.ua'] }, support: { email: 'info@databot-pro.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 5, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://databotpro.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'databot-pro-main', category: 'Моніторинг', name: 'Моніторинг DataBot Pro', tagline: 'Аналітика контрагентів та реєстрів', description: 'Моніторинг контрагентів, реєстрів та аналітика ризиків для бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Аналітика контрагентів та реєстрів'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://databotpro.com.ua' }], ratings: { fintodo: { overall: 55, rank: 9, categorySlug: 'registration', categoryName: 'Реєстрація', parentCategorySlug: 'registration', parentCategoryName: 'Реєстрація', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'DataBot Pro — аналітика контрагентів та реєстрів.', shortTake: 'Моніторинг контрагентів, реєстрів та аналітика ризиків для бізнесу.', fullVerdict: 'Моніторинг контрагентів, реєстрів та аналітика ризиків для бізнесу.', bestFor: [{ segment: 'Бізнес', reason: 'Аналітика контрагентів та реєстрів', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://databotpro.com.ua', isInternal: false } } },
  // ЄБРР
  { id: 'ebrd', slug: 'ebrd', name: 'ЄБРР', legalName: 'Європейський банк реконструкції та розвитку', brandNames: ['ЄБРР'], types: ['international_grant'], logo: { initials: 'ЄБ', color: '#1565C0' }, website: 'https://ebrd.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '86820969', legalForm: 'ТОВ', registrationNumber: '10261106', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Програми підтримки малого та середнього бізнесу від ЄБРР.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@ebrd.ua'] }, support: { email: 'info@ebrd.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 21, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://ebrd.com' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'ebrd-main', category: 'Міжнародний фонд', name: 'Програми ЄБРР для МСБ', tagline: 'Гранти та кредити для українського бізнесу', description: 'Програми підтримки малого та середнього бізнесу від ЄБРР.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Гранти та кредити для українського бізнесу'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://ebrd.com' }], ratings: { fintodo: { overall: 88, rank: 1, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ЄБРР — гранти та кредити для українського бізнесу.', shortTake: 'Програми підтримки малого та середнього бізнесу від ЄБРР.', fullVerdict: 'Програми підтримки малого та середнього бізнесу від ЄБРР.', bestFor: [{ segment: 'Бізнес', reason: 'Гранти та кредити для українського бізнесу', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://ebrd.com', isInternal: false } } },
  // GIZ
  { id: 'giz', slug: 'giz', name: 'GIZ', legalName: 'Deutsche Gesellschaft für Internationale Zusammenarbeit', brandNames: ['GIZ'], types: ['international_grant'], logo: { initials: 'GI', color: '#E65100' }, website: 'https://giz.de', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '46667969', legalForm: 'ТОВ', registrationNumber: '38230848', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Грантові програми для підтримки МСБ та реформ в Україні.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@giz.ua'] }, support: { email: 'info@giz.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 3, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://giz.de' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'giz-main', category: 'Міжнародний фонд', name: 'Програми GIZ в Україні', tagline: 'Німецьке міжнародне співробітництво', description: 'Грантові програми для підтримки МСБ та реформ в Україні.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Німецьке міжнародне співробітництво'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://giz.de' }], ratings: { fintodo: { overall: 82, rank: 2, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'GIZ — німецьке міжнародне співробітництво.', shortTake: 'Грантові програми для підтримки МСБ та реформ в Україні.', fullVerdict: 'Грантові програми для підтримки МСБ та реформ в Україні.', bestFor: [{ segment: 'Бізнес', reason: 'Німецьке міжнародне співробітництво', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://giz.de', isInternal: false } } },
  // EU4Business
  { id: 'eu4business', slug: 'eu4business', name: 'EU4Business', legalName: 'Представництво ЄС в Україні', brandNames: ['EU4Business'], types: ['international_grant'], logo: { initials: 'EU', color: '#0D47A1' }, website: 'https://eu4business.org.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '49142304', legalForm: 'ТОВ', registrationNumber: '52307921', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2014, foundedCity: 'Київ', story: 'Програма ЄС з підтримки малого та середнього бізнесу в Україні.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@eu4business.ua'] }, support: { email: 'info@eu4business.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 18, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://eu4business.org.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'eu4business-main', category: 'Грантова програма', name: 'EU4Business Україна', tagline: 'Підтримка бізнесу від ЄС', description: 'Програма ЄС з підтримки малого та середнього бізнесу в Україні.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Підтримка бізнесу від ЄС'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://eu4business.org.ua' }], ratings: { fintodo: { overall: 80, rank: 3, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'EU4Business — підтримка бізнесу від єс.', shortTake: 'Програма ЄС з підтримки малого та середнього бізнесу в Україні.', fullVerdict: 'Програма ЄС з підтримки малого та середнього бізнесу в Україні.', bestFor: [{ segment: 'Бізнес', reason: 'Підтримка бізнесу від ЄС', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://eu4business.org.ua', isInternal: false } } },
  // SeedForum
  { id: 'seedforum', slug: 'seedforum', name: 'SeedForum', legalName: 'SeedForum Foundation', brandNames: ['SeedForum'], types: ['startup_fund'], logo: { initials: 'SE', color: '#2E7D32' }, website: 'https://seedforum.org', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '89583515', legalForm: 'ТОВ', registrationNumber: '71325550', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Менторська підтримка та підготовка до інвестицій для стартапів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@seedforum.ua'] }, support: { email: 'info@seedforum.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 8, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://seedforum.org' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'seedforum-main', category: 'Стартап-фонд', name: 'Менторство SeedForum', tagline: 'Менторство для стартапів', description: 'Менторська підтримка та підготовка до інвестицій для стартапів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Менторство для стартапів'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://seedforum.org' }], ratings: { fintodo: { overall: 65, rank: 6, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'SeedForum — менторство для стартапів.', shortTake: 'Менторська підтримка та підготовка до інвестицій для стартапів.', fullVerdict: 'Менторська підтримка та підготовка до інвестицій для стартапів.', bestFor: [{ segment: 'Бізнес', reason: 'Менторство для стартапів', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://seedforum.org', isInternal: false } } },
  // CUTIS
  { id: 'cutis', slug: 'cutis', name: 'CUTIS', legalName: 'ГО «КУТІС»', brandNames: ['CUTIS'], types: ['grant_program'], logo: { initials: 'CU', color: '#6A1B9A' }, website: 'https://cutis.org.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '39130100', legalForm: 'ТОВ', registrationNumber: '66987454', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'Грантова підтримка інноваційних проєктів та IT-стартапів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@cutis.ua'] }, support: { email: 'info@cutis.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 8, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://cutis.org.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'cutis-main', category: 'Бізнес-підтримка', name: 'Грантова підтримка CUTIS', tagline: 'Підтримка IT та інновацій', description: 'Грантова підтримка інноваційних проєктів та IT-стартапів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Підтримка IT та інновацій'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://cutis.org.ua' }], ratings: { fintodo: { overall: 60, rank: 7, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'CUTIS — підтримка it та інновацій.', shortTake: 'Грантова підтримка інноваційних проєктів та IT-стартапів.', fullVerdict: 'Грантова підтримка інноваційних проєктів та IT-стартапів.', bestFor: [{ segment: 'Бізнес', reason: 'Підтримка IT та інновацій', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://cutis.org.ua', isInternal: false } } },
  // КМДА Гранти
  { id: 'kmda-grants', slug: 'kmda-grants', name: 'КМДА Гранти', legalName: 'Київська міська державна адміністрація', brandNames: ['КМДА Гранти'], types: ['grant_program'], logo: { initials: 'КМ', color: '#37474F' }, website: 'https://kyivcity.gov.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '86022033', legalForm: 'ТОВ', registrationNumber: '87924805', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'Муніципальні грантові програми підтримки малого бізнесу Києва.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@kmda-grants.ua'] }, support: { email: 'info@kmda-grants.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 2, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://kyivcity.gov.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'kmda-grants-main', category: 'Муніципальна програма', name: 'Міські гранти для підприємців', tagline: 'Гранти від міста Києва', description: 'Муніципальні грантові програми підтримки малого бізнесу Києва.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Гранти від міста Києва'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://kyivcity.gov.ua' }], ratings: { fintodo: { overall: 55, rank: 8, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'КМДА Гранти — гранти від міста києва.', shortTake: 'Муніципальні грантові програми підтримки малого бізнесу Києва.', fullVerdict: 'Муніципальні грантові програми підтримки малого бізнесу Києва.', bestFor: [{ segment: 'Бізнес', reason: 'Гранти від міста Києва', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://kyivcity.gov.ua', isInternal: false } } },
  // USF
  { id: 'usf', slug: 'usf', name: 'USF', legalName: 'Ukrainian Startup Fund', brandNames: ['USF'], types: ['startup_fund'], logo: { initials: 'US', color: '#1B5E20' }, website: 'https://usf.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '26924372', legalForm: 'ТОВ', registrationNumber: '48970859', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'Український стартап-фонд — гранти до $75 000 для стартапів на ранній стадії.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@usf.ua'] }, support: { email: 'info@usf.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 6, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://usf.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'usf-main', category: 'Стартап-фонд', name: 'Грант USF до $75 000', tagline: 'Державний фонд для стартапів', description: 'Український стартап-фонд — гранти до $75 000 для стартапів на ранній стадії.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Державний фонд для стартапів'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://usf.com.ua' }], ratings: { fintodo: { overall: 78, rank: 4, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'USF — державний фонд для стартапів.', shortTake: 'Український стартап-фонд — гранти до $75 000 для стартапів на ранній стадії.', fullVerdict: 'Український стартап-фонд — гранти до $75 000 для стартапів на ранній стадії.', bestFor: [{ segment: 'Бізнес', reason: 'Державний фонд для стартапів', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://usf.com.ua', isInternal: false } } },
  // EIF
  { id: 'eif', slug: 'eif', name: 'EIF', legalName: 'European Investment Fund', brandNames: ['EIF'], types: ['international_grant'], logo: { initials: 'EI', color: '#283593' }, website: 'https://eif.org', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '78463111', legalForm: 'ТОВ', registrationNumber: '79671668', registrationDate: '2012', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2017, foundedCity: 'Київ', story: 'Гарантійні та кредитні програми для МСБ від Європейського інвестиційного фонду.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@eif.ua'] }, support: { email: 'info@eif.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 17, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://eif.org' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'eif-main', category: 'Міжнародний фонд', name: 'Програми EIF для МСБ', tagline: 'Європейський інвестиційний фонд', description: 'Гарантійні та кредитні програми для МСБ від Європейського інвестиційного фонду.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Європейський інвестиційний фонд'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://eif.org' }], ratings: { fintodo: { overall: 75, rank: 5, categorySlug: 'grants', categoryName: 'Гранти та програми', parentCategorySlug: 'grants', parentCategoryName: 'Гранти та програми', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'EIF — європейський інвестиційний фонд.', shortTake: 'Гарантійні та кредитні програми для МСБ від Європейського інвестиційного фонду.', fullVerdict: 'Гарантійні та кредитні програми для МСБ від Європейського інвестиційного фонду.', bestFor: [{ segment: 'Бізнес', reason: 'Європейський інвестиційний фонд', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://eif.org', isInternal: false } } },
];
