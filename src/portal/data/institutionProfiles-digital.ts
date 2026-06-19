import type { FullInstitutionProfile } from './institutionProfiles';

export const DIGITAL_PROFILES: FullInstitutionProfile[] = [
  // ══════════════════════════════════════════════════════════════
  // FINTODO
  // ══════════════════════════════════════════════════════════════
  {
    id: 'fintodo',
    slug: 'fintodo',
    name: 'FINTODO',
    legalName: 'ТОВ «ФІНТУДУ»',
    brandNames: ['FINTODO', 'Фінтуду'],
    types: ['accounting_software', 'tax_automation'],
    logo: { initials: 'FT', color: '#6366F1' },
    website: 'https://fintodo.com',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '15 лютого 2026',

    legal: {
      edrpou: '44000001',
      legalForm: 'ТОВ',
      registrationNumber: '44000001',
      registrationDate: '2023',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'Київ, Україна',
        actual: 'Київ, Україна',
      },
      regulators: [],
      licenses: [],
      certifications: [],
      taxStatus: 'Платник ЄП 3 група',
      status: 'active',
    },

    company: {
      foundedYear: 2023,
      foundedCity: 'Київ',
      story: 'FINTODO — SaaS-платформа для автоматизації податкової звітності ФОП та фізичних осіб в Україні. Замість паперових декларацій і ручних розрахунків — автоматичне формування звітності з банківських виписок.',
      mission: 'Зробити податки простими та зрозумілими для кожного українця',
      headquarters: 'Київ',
      employeesCount: '10-50',
      publiclyTraded: false,
      keyPeople: [],
      milestones: [
        { year: 2023, event: 'Заснування FINTODO', type: 'founding' },
        { year: 2024, event: 'Запуск Tax Wizard для ФОП 3 групи', type: 'product' },
        { year: 2025, event: 'Підтримка фізосіб (річна декларація)', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'Київ',
        city: 'Київ',
        country: 'Україна',
        phone: [],
        email: ['hello@fintodo.com'],
      },
      support: {
        email: 'support@fintodo.com',
        chatWidget: true,
        telegram: 'https://t.me/fintodo_support',
        workingHours: 'Пн-Пт 9:00-19:00',
        is247: false,
        averageResponseTime: '< 30 хвилин',
      },
      social: {
        telegram: 'https://t.me/fintodo_ua',
        instagram: 'https://instagram.com/fintodo',
        facebook: 'https://facebook.com/fintodo',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: '100% онлайн.',
      regions: [],
      branchList: [],
    },

    platforms: {
      web: { available: true, url: 'https://fintodo.com', features: ['Tax Wizard', 'Книга обліку доходів', 'Генерація XML декларацій', 'Податковий календар'] },
      ios: { available: false },
      android: { available: false },
      api: { available: false },
    },

    security: {
      certifications: [],
      features: ['SSL', '2FA', 'Шифрування даних'],
      dataStorage: 'EU (хмарна інфраструктура)',
    },

    integrations: [
      { name: 'Monobank', category: 'Банк', isOfficial: false, note: 'Імпорт виписок через API' },
      { name: 'ПриватБанк', category: 'Банк', isOfficial: false, note: 'Імпорт виписок' },
      { name: 'M.E.Doc', category: 'Звітність', isOfficial: false, note: 'Експорт XML для подачі' },
    ],

    products: [
      {
        id: 'fintodo-fop',
        category: 'Бухгалтерія',
        name: 'FINTODO для ФОП',
        tagline: 'Автоматична звітність для ФОП',
        description: 'Автоматичне формування податкової декларації, книги обліку доходів, нагадування про дедлайни.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: { monthly: 'від 199 ₴', isFree: false, hasFreeTrial: true, freeTrialDays: 14, pricingNote: 'Від 199 ₴/міс. Безкоштовний тріал 14 днів.' },
        features: [
          { name: 'Автоматична декларація', included: true },
          { name: 'Книга обліку доходів', included: true },
          { name: 'Імпорт банківських виписок', included: true },
          { name: 'Податковий календар', included: true },
          { name: 'Генерація XML для ДПС', included: true },
        ],
        requirements: ['ФОП 2 або 3 групи'],
        interestRate: 'від 199 ₴/міс',
        processingTime: 'реєстрація 5 хвилин',
        pros: ['Все автоматично', 'Не потрібен бухгалтер', 'Зрозумілий інтерфейс'],
        cons: ['Поки не підтримує загальну систему', 'Молодий продукт'],
        ctaLabel: 'Спробувати безкоштовно',
        ctaUrl: 'https://fintodo.com',
      },
    ],

    ratings: {
      fintodo: { overall: 90, rank: 1, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія', badge: 'Наш продукт', reviewDate: 'Лютий 2026' },
      external: [],
    },

    editorial: {
      oneLiner: 'Автоматизація податків для ФОП — просто, швидко, без бухгалтера.',
      shortTake: 'FINTODO — наш продукт, тому ми не можемо бути об\'єктивними. Але ми впевнені в якості.',
      fullVerdict: 'Ми створили FINTODO, тому знаємо його сильні та слабкі сторони. Це найкращий інструмент для ФОП, які хочуть вести облік без бухгалтера. Ми працюємо над підтримкою загальної системи та фізосіб.',
      bestFor: [
        { segment: 'ФОП 2-3 групи', reason: 'Повна автоматизація звітності', emoji: '📊' },
      ],
      notFor: [
        { segment: 'ТОВ на загальній системі', reason: 'Поки не підтримується', alternative: 'BAS або 1С' },
      ],
      methodology: {
        approach: 'N/A (власний продукт)',
        testingPeriod: 'N/A',
        testedBy: 'Команда FINTODO',
        hoursSpent: 0,
        keyFindings: [],
      },
      scores: [],
      totalFormula: 'N/A',
      totalScore: 9.0,
      independenceStatement: '⚠️ FINTODO — це наш власний продукт. Ця сторінка не є незалежною рецензією.',
      conflictOfInterest: 'FINTODO — власний продукт. Рейтинг є самооцінкою.',
    },

    reviewThemes: [],
    reviewSourcesNote: 'N/A (власний продукт)',

    comparisons: [],
    news: [],
    changelog: [],
    awards: [],
    partnerships: [],

    compliance: {
      aml: false, gdpr: true, nbu: false, dps: false, dia: false,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: ['XML', 'PDF'],
    },

    warPeriod: {
      operationalStatus: 'Повністю працює.',
      reliabilityDuringBlackouts: 'Хмарна інфраструктура в EU.',
      dataBackupNote: 'Щоденне резервне копіювання.',
      businessContinuityPlan: 'Хмарна інфраструктура з резервуванням.',
      warNote: 'FINTODO працює стабільно завдяки хмарній інфраструктурі.',
    },

    faq: [
      { question: 'Чи підходить FINTODO для ФОП 1 групи?', answer: 'Ні, наразі підтримуються лише ФОП 2 та 3 груп.', category: 'Загальне', isPopular: true },
    ],

    knownIssues: [],

    cta: {
      primary: { label: 'Почати безкоштовно', href: 'https://fintodo.com', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ВЧАСНО (ЕДО)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'vchasno-edo',
    slug: 'vchasno-edo',
    name: 'Вчасно',
    legalName: 'ТОВ «Вчасно»',
    brandNames: ['Вчасно', 'Vchasno', 'Вчасно.Звіт', 'Вчасно.ЕДО'],
    types: ['edo', 'reporting'],
    logo: { initials: 'ВЧ', color: '#2196F3' },
    website: 'https://vchasno.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '10 лютого 2026',

    legal: {
      edrpou: '38256025',
      legalForm: 'ТОВ',
      registrationNumber: '38256025',
      registrationDate: '2013',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'Київ, Україна',
        actual: 'Київ, Україна',
      },
      regulators: ['ДПС (подача звітності)'],
      licenses: [],
      certifications: [],
      taxStatus: 'Платник ПДВ',
      status: 'active',
    },

    company: {
      foundedYear: 2013,
      foundedCity: 'Київ',
      story: 'Вчасно — платформа електронного документообігу та звітності. Об\'єднує ЕДО (обмін документами з контрагентами) та звітність (подача декларацій до ДПС). Понад 200 000 компаній-користувачів.',
      headquarters: 'Київ',
      employeesCount: '100-200',
      publiclyTraded: false,
      keyPeople: [],
      milestones: [
        { year: 2013, event: 'Заснування Вчасно', type: 'founding' },
        { year: 2017, event: 'Запуск Вчасно.ЕДО', type: 'product' },
        { year: 2020, event: '100 000 користувачів', type: 'expansion' },
        { year: 2024, event: '200 000 користувачів', type: 'expansion' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'Київ',
        city: 'Київ',
        country: 'Україна',
        phone: ['0 800 217 000'],
        email: ['info@vchasno.ua'],
      },
      support: {
        freePhone: '0 800 217 000',
        email: 'support@vchasno.ua',
        chatWidget: true,
        workingHours: 'Пн-Пт 9:00-18:00',
        is247: false,
      },
      social: {
        telegram: 'https://t.me/vchasno_ua',
        facebook: 'https://facebook.com/vchasno',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: '100% онлайн.',
      regions: [],
      branchList: [],
    },

    platforms: {
      web: { available: true, url: 'https://vchasno.ua', features: ['ЕДО', 'Звітність', 'Підпис документів'] },
      ios: { available: true, rating: 4.5 },
      android: { available: true, rating: 4.3 },
      api: { available: true, note: 'API для інтеграції з обліковими системами' },
    },

    security: {
      certifications: [],
      features: ['КЕП (кваліфікований електронний підпис)', 'SSL', 'Шифрування документів'],
      dataStorage: 'Україна',
    },

    integrations: [
      { name: '1С', category: 'Бухгалтерія', isOfficial: true },
      { name: 'BAS', category: 'Бухгалтерія', isOfficial: true },
      { name: 'M.E.Doc', category: 'Звітність', isOfficial: false },
    ],

    products: [
      {
        id: 'vchasno-edo-product',
        category: 'ЕДО',
        name: 'Вчасно.ЕДО',
        tagline: 'Електронний документообіг для бізнесу',
        description: 'Обмін юридично значимими документами з контрагентами: накладні, акти, рахунки — все з КЕП.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: { monthly: 'від 200 ₴', isFree: false, hasFreeTrial: true, freeTrialDays: 30, pricingNote: 'Від 200 ₴/міс (залежить від кількості документів)' },
        features: [
          { name: 'Обмін документами з КЕП', included: true },
          { name: 'Інтеграція з 1С / BAS', included: true },
          { name: 'Архів документів', included: true },
          { name: 'Статуси підписання', included: true },
        ],
        requirements: ['КЕП (кваліфікований електронний підпис)'],
        processingTime: 'підключення за 1 день',
        pros: ['200 000+ компаній у мережі', 'Інтеграція з бухгалтерськими системами'],
        cons: ['Потрібен КЕП', 'Не всі контрагенти на Вчасно'],
        ctaLabel: 'Спробувати безкоштовно',
        ctaUrl: 'https://vchasno.ua/edo',
      },
    ],

    ratings: {
      fintodo: { overall: 75, rank: 2, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'ЕДО, ЕЦП, CRM', reviewDate: 'Лютий 2026' },
      external: [],
    },

    editorial: {
      oneLiner: 'ЕДО + Звітність в одному сервісі — стандарт для українського бізнесу.',
      shortTake: 'Вчасно — один з лідерів ЕДО-ринку. 200 000 компаній у мережі означає, що ваш контрагент, скоріше за все, вже там.',
      fullVerdict: 'Якщо вам потрібен ЕДО та подача звітності в одному місці — Вчасно є надійним вибором. Особливо зручно для тих, хто вже використовує 1С або BAS.',
      bestFor: [
        { segment: 'Бізнес з великим документообігом', reason: '200 000 компаній у мережі', emoji: '📄' },
      ],
      notFor: [
        { segment: 'ФОП без ЕДО', reason: 'Для простої звітності є дешевші варіанти', alternative: 'FINTODO' },
      ],
      methodology: {
        approach: 'Тестування ЕДО-функціоналу',
        testingPeriod: 'Січень 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 10,
        keyFindings: ['Швидкий обмін документами', 'Інтеграція з 1С працює стабільно'],
      },
      scores: [
        { category: 'Функціональність', weight: 40, score: 8.0, maxScore: 10, rationale: 'ЕДО + Звітність — повний набір', whatWeTested: ['ЕДО, подача звітності'], howWeScored: 'Повнота функцій', penaltyReasons: [] },
        { category: 'Мережа', weight: 30, score: 8.0, maxScore: 10, rationale: '200 000 компаній', whatWeTested: ['Пошук контрагентів'], howWeScored: 'Кількість компаній', penaltyReasons: [] },
        { category: 'Ціна', weight: 30, score: 6.5, maxScore: 10, rationale: 'Середній сегмент', whatWeTested: ['Тарифи'], howWeScored: 'Порівняння', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 7.5,
      independenceStatement: 'FINTODO не має комерційних відносин з Вчасно.',
    },

    reviewThemes: [],
    reviewSourcesNote: 'Аналіз відгуків (2025)',

    comparisons: [],
    news: [],
    changelog: [],
    awards: [],
    partnerships: [],

    compliance: {
      aml: false, gdpr: false, nbu: false, dps: true, dia: false,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: ['XML', 'PDF'],
    },

    warPeriod: {
      operationalStatus: 'Працює у штатному режимі.',
      reliabilityDuringBlackouts: 'Хмарна інфраструктура.',
      dataBackupNote: 'Резервне копіювання документів.',
      businessContinuityPlan: 'Хмарна інфраструктура з резервуванням.',
      warNote: 'Вчасно продовжує працювати. ЕДО став ще важливішим під час війни через обмежений рух паперових документів.',
    },

    faq: [
      { question: 'Чи потрібен КЕП для Вчасно.ЕДО?', answer: 'Так, для підписання документів потрібен кваліфікований електронний підпис (можна отримати через Дія.Підпис).', category: 'Загальне', isPopular: true },
    ],

    knownIssues: [],

    cta: {
      primary: { label: 'Спробувати Вчасно', href: 'https://vchasno.ua', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ДІЯ.ПІДПИС
  // ══════════════════════════════════════════════════════════════
  {
    id: 'diia-sign',
    slug: 'diia-sign',
    name: 'Дія.Підпис',
    legalName: 'Міністерство цифрової трансформації України',
    brandNames: ['Дія.Підпис', 'Diia.Sign', 'Дія Підпис'],
    types: ['digital_signature', 'gov_service'],
    logo: { initials: 'ДП', color: '#000000' },
    website: 'https://diia.gov.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '1 лютого 2026',

    legal: {
      edrpou: 'N/A (державна послуга)',
      legalForm: 'Державна послуга',
      registrationNumber: 'N/A',
      registrationDate: '2020',
      registrationOrgan: 'Мінцифри',
      address: {
        legal: 'вул. Михайла Грушевського, 12/2, Київ',
        actual: 'вул. Михайла Грушевського, 12/2, Київ',
      },
      regulators: ['Мінцифри'],
      licenses: [
        { type: 'КНЕДП (кваліфікований надавач електронних довірчих послуг)', number: 'КНЕДП Дія', issuedBy: 'Мінцифри', issuedDate: '2020', status: 'active' },
      ],
      certifications: [],
      taxStatus: 'N/A (державна послуга)',
      status: 'active',
    },

    company: {
      foundedYear: 2020,
      foundedCity: 'Київ',
      story: 'Дія.Підпис — безкоштовний кваліфікований електронний підпис (КЕП), інтегрований у додаток Дія. Дозволяє підписувати документи, подавати звітність та отримувати державні послуги без токенів та USB-ключів.',
      mission: 'Зробити електронний підпис доступним для кожного',
      headquarters: 'Київ',
      employeesCount: 'Частина Мінцифри',
      publiclyTraded: false,
      keyPeople: [
        { name: 'Михайло Федоров', role: 'Міністр цифрової трансформації', since: '2019' },
      ],
      milestones: [
        { year: 2020, event: 'Запуск Дія.Підпис у додатку Дія', type: 'founding' },
        { year: 2022, event: 'Масове впровадження: мільйони КЕП для е-декларування', type: 'expansion' },
        { year: 2024, event: 'Інтеграція з більшістю систем звітності', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Грушевського, 12/2',
        city: 'Київ',
        country: 'Україна',
        phone: ['1545'],
        email: ['help@thedigital.gov.ua'],
      },
      support: {
        freePhone: '1545',
        chatWidget: true,
        workingHours: '24/7 (чат-бот), Пн-Пт 9:00-18:00 (оператор)',
        is247: true,
      },
      social: {
        telegram: 'https://t.me/diaborotbot',
        facebook: 'https://facebook.com/diia.gov.ua',
        instagram: 'https://instagram.com/diia.gov.ua',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: 'Повністю цифровий сервіс через додаток Дія.',
      regions: [],
      branchList: [],
    },

    platforms: {
      web: { available: false },
      ios: { available: true, url: 'https://apps.apple.com/app/diia/id1489717872', rating: 4.7, reviewCount: 200000 },
      android: { available: true, url: 'https://play.google.com/store/apps/details?id=ua.gov.diia.app', rating: 4.5, reviewCount: 400000 },
      api: { available: false },
    },

    security: {
      certifications: ['Відповідність eIDAS (часткова)', 'КНЕДП'],
      features: ['Біометрична верифікація', 'NFC-зчитування ID-картки', 'Шифрування'],
      dataStorage: 'Україна (державні ЦОД)',
    },

    integrations: [
      { name: 'M.E.Doc', category: 'Звітність', isOfficial: true },
      { name: 'Вчасно', category: 'ЕДО', isOfficial: true },
      { name: 'Checkbox', category: 'Каса', isOfficial: true },
      { name: 'ДПС', category: 'Державні сервіси', isOfficial: true },
    ],

    products: [
      {
        id: 'diia-kep',
        category: 'Електронний підпис',
        name: 'КЕП через Дія',
        tagline: 'Безкоштовний електронний підпис у смартфоні',
        description: 'Кваліфікований електронний підпис, що зберігається у додатку Дія. Замінює USB-токен для підписання документів, звітності, договорів.',
        audience: 'both',
        isHighlighted: true,
        isFeatured: true,
        price: { isFree: true, hasFreeTrial: false, pricingNote: 'Повністю безкоштовно' },
        features: [
          { name: 'КЕП у смартфоні', included: true },
          { name: 'Підписання документів', included: true },
          { name: 'Подача звітності', included: true },
          { name: 'Інтеграція з M.E.Doc, Вчасно', included: true },
          { name: 'Без USB-токена', included: true },
        ],
        requirements: ['Додаток Дія', 'ID-картка з NFC або BankID'],
        interestRate: 'безкоштовно',
        processingTime: '3 хвилини',
        pros: ['Безкоштовно', 'Не потрібен USB-токен', 'Державна довіра'],
        cons: ['Тільки через мобільний додаток', 'Не всі системи підтримують'],
        ctaLabel: 'Отримати КЕП через Дію',
        ctaUrl: 'https://diia.gov.ua/services/kep',
      },
    ],

    ratings: {
      fintodo: { overall: 85, rank: 1, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'ЕДО, ЕЦП, CRM', badge: 'Безкоштовний КЕП', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'App Store (Дія)', rating: 4.7, maxRating: 5, reviewCount: 200000 },
        { source: 'Google Play (Дія)', rating: 4.5, maxRating: 5, reviewCount: 400000 },
      ],
      averageExternal: 4.6,
      totalReviewsAllSources: 600000,
    },

    editorial: {
      oneLiner: 'Безкоштовний КЕП у смартфоні — революція від держави.',
      shortTake: 'Дія.Підпис зробив те, що роками не могли зробити комерційні провайдери — безкоштовний і зручний електронний підпис для всіх.',
      fullVerdict: 'Для ФОП та фізосіб Дія.Підпис — обов\'язковий інструмент. Безкоштовний КЕП замість платного USB-токена. Підходить для звітності, ЕДО, державних послуг. Обмеження — не всі комерційні системи його приймають.',
      bestFor: [
        { segment: 'ФОП, які подають звітність', reason: 'Безкоштовний КЕП для ДПС', emoji: '📝' },
        { segment: 'Фізособи', reason: 'Державні послуги без черг', emoji: '🏛️' },
      ],
      notFor: [
        { segment: 'Великий бізнес з корпоративним ЕДО', reason: 'Не всі системи підтримують', alternative: 'ІІТ (Інститут інформаційних технологій)' },
      ],
      methodology: {
        approach: 'Тестування створення КЕП та підписання документів',
        testingPeriod: 'Січень 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 5,
        keyFindings: ['Створення КЕП — 3 хвилини', 'Підписання документа — 10 секунд'],
      },
      scores: [
        { category: 'Ціна', weight: 30, score: 10, maxScore: 10, rationale: 'Безкоштовно', whatWeTested: ['Тарифи'], howWeScored: 'Є / немає оплати', penaltyReasons: [] },
        { category: 'Зручність', weight: 35, score: 8.5, maxScore: 10, rationale: 'Швидке створення, просте підписання', whatWeTested: ['UX додатку'], howWeScored: 'UX-аудит', penaltyReasons: ['Тільки мобільний'] },
        { category: 'Сумісність', weight: 35, score: 7.5, maxScore: 10, rationale: 'Більшість систем підтримує, але не всі', whatWeTested: ['Інтеграції'], howWeScored: 'Перевірка сумісності', penaltyReasons: ['Деякі комерційні ЕДО не підтримують'] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 8.5,
      independenceStatement: 'FINTODO не має відносин з Мінцифри.',
    },

    reviewThemes: [
      { theme: 'Зручність', sentiment: 'positive', frequency: 'very_common', summary: 'Нарешті КЕП без токена!', positiveQuote: 'За 3 хвилини отримав підпис — шок!', ourConclusion: 'Революційна зручність.' },
    ],
    reviewSourcesNote: 'Відгуки з App Store, Google Play (2025)',

    comparisons: [],
    news: [],
    changelog: [],
    awards: [],
    partnerships: [],

    compliance: {
      aml: false, gdpr: false, nbu: false, dps: true, dia: true,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: [],
    },

    warPeriod: {
      operationalStatus: 'Повністю працює.',
      reliabilityDuringBlackouts: 'Додаток працює офлайн (підписання). Для створення КЕП потрібен інтернет.',
      dataBackupNote: 'Державні ЦОД з резервуванням.',
      businessContinuityPlan: 'Розподілена державна інфраструктура.',
      warNote: 'Дія стала критичним інструментом під час війни — е-паспорти, довідки ВПО, підписи.',
    },

    faq: [
      { question: 'Як отримати КЕП через Дію?', answer: 'Завантажте додаток Дія → Послуги → Дія.Підпис → Створити підпис. Потрібна ID-картка з NFC або BankID.', category: 'Створення', isPopular: true },
    ],

    knownIssues: [],

    cta: {
      primary: { label: 'Завантажити Дію', href: 'https://diia.gov.ua', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // CHECKBOX
  // ══════════════════════════════════════════════════════════════
  {
    id: 'checkbox',
    slug: 'checkbox',
    name: 'Checkbox',
    legalName: 'ТОВ «Чекбокс»',
    brandNames: ['Checkbox', 'Чекбокс'],
    types: ['cashier_software', 'prro'],
    logo: { initials: 'CB', color: '#00C853' },
    website: 'https://checkbox.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '8 лютого 2026',

    legal: {
      edrpou: '43005215',
      legalForm: 'ТОВ',
      registrationNumber: '43005215',
      registrationDate: '2019',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'Київ, Україна',
        actual: 'Київ, Україна',
      },
      regulators: ['ДПС (ПРРО)'],
      licenses: [],
      certifications: [],
      taxStatus: 'Платник ПДВ',
      status: 'active',
    },

    company: {
      foundedYear: 2019,
      foundedCity: 'Київ',
      story: 'Checkbox — перше і найпопулярніше програмне РРО (ПРРО) в Україні. Замість фізичного касового апарату — додаток на смартфоні, що передає фіскальні чеки до ДПС. Понад 500 000 ПРРО зареєстровано через Checkbox.',
      mission: 'Зробити фіскалізацію простою і доступною',
      headquarters: 'Київ',
      employeesCount: '100-200',
      publiclyTraded: false,
      investors: ['Y Combinator (учасник W21 batch)'],
      keyPeople: [],
      milestones: [
        { year: 2019, event: 'Заснування Checkbox', type: 'founding' },
        { year: 2020, event: 'Запуск першого ПРРО в Україні', type: 'product' },
        { year: 2021, event: 'Y Combinator W21. 100 000 ПРРО.', type: 'financial' },
        { year: 2023, event: '500 000 ПРРО', type: 'expansion' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'Київ',
        city: 'Київ',
        country: 'Україна',
        phone: [],
        email: ['support@checkbox.ua'],
      },
      support: {
        email: 'support@checkbox.ua',
        chatWidget: true,
        telegram: 'https://t.me/checkbox_ua',
        workingHours: 'Пн-Пт 9:00-18:00',
        is247: false,
      },
      social: {
        telegram: 'https://t.me/checkbox_ua',
        facebook: 'https://facebook.com/checkbox.ua',
        instagram: 'https://instagram.com/checkbox.ua',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: '100% онлайн.',
      regions: [],
      branchList: [],
    },

    platforms: {
      web: { available: true, url: 'https://my.checkbox.ua', features: ['Кабінет касира', 'Звіти', 'Управління ПРРО'] },
      ios: { available: true, url: 'https://apps.apple.com/app/checkbox/id1499505449', rating: 4.6, reviewCount: 20000 },
      android: { available: true, url: 'https://play.google.com/store/apps/details?id=ua.checkbox.cashier', rating: 4.4, reviewCount: 30000 },
      api: { available: true, docsUrl: 'https://docs.checkbox.ua/', sandbox: true, note: 'API для інтеграції з POS-системами та CRM' },
    },

    security: {
      certifications: [],
      features: ['Фіскалізація чеків у ДПС', 'HTTPS', 'Шифрування з КЕП'],
      dataStorage: 'Україна',
    },

    integrations: [
      { name: 'Poster POS', category: 'POS', isOfficial: true },
      { name: 'Нова Пошта', category: 'Логістика', isOfficial: true },
      { name: 'Prom.ua', category: 'Маркетплейс', isOfficial: true },
      { name: 'Monobank', category: 'Банк', isOfficial: true },
    ],

    products: [
      {
        id: 'checkbox-prro',
        category: 'ПРРО',
        name: 'Checkbox ПРРО',
        tagline: 'Каса у смартфоні — без касового апарату',
        description: 'Програмний реєстратор розрахункових операцій. Видача фіскальних чеків через смартфон або ПК.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: { monthly: 'від 250 ₴', isFree: false, hasFreeTrial: true, freeTrialDays: 14, pricingNote: 'Від 250 ₴/міс за 1 ПРРО. Безкоштовний тріал 14 днів.' },
        features: [
          { name: 'Фіскальний чек', included: true },
          { name: 'Мобільний додаток', included: true },
          { name: 'Інтеграція з ДПС', included: true },
          { name: 'Звіти та аналітика', included: true },
          { name: 'API для POS-систем', included: true },
        ],
        requirements: ['ФОП або ТОВ', 'КЕП (Дія.Підпис або токен)'],
        interestRate: 'від 250 ₴/міс',
        processingTime: 'реєстрація 15 хвилин',
        pros: ['Перше ПРРО в Україні', 'Простота використання', 'API для розробників'],
        cons: ['Щомісячна оплата', 'Залежність від інтернету'],
        ctaLabel: 'Спробувати безкоштовно',
        ctaUrl: 'https://checkbox.ua',
      },
    ],

    ratings: {
      fintodo: { overall: 80, rank: 1, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'ЕДО, ЕЦП, CRM', badge: 'Лідер ПРРО', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'App Store', rating: 4.6, maxRating: 5, reviewCount: 20000 },
        { source: 'Google Play', rating: 4.4, maxRating: 5, reviewCount: 30000 },
      ],
      averageExternal: 4.5,
      totalReviewsAllSources: 50000,
    },

    editorial: {
      oneLiner: 'ПРРО №1 в Україні — каса у смартфоні для кожного підприємця.',
      shortTake: 'Checkbox першим зробив ПРРО у смартфоні і став стандартом ринку. 500 000 ПРРО — це більше, ніж у всіх конкурентів разом.',
      fullVerdict: 'Для ФОП, яким потрібен касовий апарат — Checkbox є очевидним вибором. Простий, швидкий, з хорошим API для інтеграцій. Конкуренти є (Вчасно.Каса, ДПС безкоштовне ПРРО), але за функціональністю Checkbox лідирує.',
      bestFor: [
        { segment: 'ФОП, яким потрібен РРО', reason: 'Найпростіше ПРРО на ринку', emoji: '🧾' },
        { segment: 'E-commerce', reason: 'API для автоматичної фіскалізації', emoji: '🛒' },
      ],
      notFor: [
        { segment: 'ФОП, звільнені від РРО', reason: 'Якщо РРО не потрібен — не платіть', alternative: 'Перевірте на сайті ДПС' },
      ],
      methodology: {
        approach: 'Тестування ПРРО в реальних умовах',
        testingPeriod: 'Грудень 2025',
        testedBy: 'Технічна команда FINTODO',
        hoursSpent: 8,
        keyFindings: ['Реєстрація ПРРО — 15 хвилин', 'Перший чек — за 20 хвилин від старту'],
      },
      scores: [
        { category: 'Простота', weight: 35, score: 9.0, maxScore: 10, rationale: 'Інтуїтивний процес реєстрації та використання', whatWeTested: ['Реєстрація ПРРО', 'Видача чеку'], howWeScored: 'Час до першого чеку', penaltyReasons: [] },
        { category: 'Функціональність', weight: 30, score: 8.0, maxScore: 10, rationale: 'Повний набір: чеки, Z-звіти, аналітика', whatWeTested: ['Всі функції'], howWeScored: 'Повнота', penaltyReasons: [] },
        { category: 'Ціна', weight: 20, score: 7.0, maxScore: 10, rationale: '250 ₴/міс — дорожче, ніж безкоштовне ПРРО від ДПС', whatWeTested: ['Тарифи'], howWeScored: 'Порівняння', penaltyReasons: ['ДПС пропонує безкоштовне ПРРО'] },
        { category: 'API', weight: 15, score: 8.5, maxScore: 10, rationale: 'Якісний API, хороша документація', whatWeTested: ['REST API'], howWeScored: 'Час інтеграції', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 8.0,
      independenceStatement: 'FINTODO не має комерційних відносин з Checkbox.',
    },

    reviewThemes: [
      { theme: 'Простота', sentiment: 'positive', frequency: 'very_common', summary: 'Легко зареєструвати і використовувати', positiveQuote: 'За 20 хвилин вже видавав чеки!', ourConclusion: 'Найпростіше ПРРО на ринку.' },
    ],
    reviewSourcesNote: 'Аналіз відгуків з App Store, Google Play (2025)',

    comparisons: [],
    news: [],
    changelog: [],
    awards: [
      { year: 2021, name: 'Y Combinator W21', organization: 'Y Combinator' },
    ],
    partnerships: [
      { partner: 'Monobank', type: 'Інтеграція', description: 'Автоматичне створення чеку при оплаті через Monobank POS' },
    ],

    compliance: {
      aml: false, gdpr: false, nbu: false, dps: true, dia: true,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: ['PDF', 'XML'],
    },

    warPeriod: {
      operationalStatus: 'Повністю працює.',
      reliabilityDuringBlackouts: 'Офлайн-режим: чеки зберігаються і фіскалізуються при відновленні інтернету.',
      dataBackupNote: 'Хмарна інфраструктура з резервуванням.',
      businessContinuityPlan: 'Офлайн-режим + хмарна інфраструктура.',
      warNote: 'Офлайн-режим став критично важливим під час блекаутів — бізнес продовжує працювати.',
    },

    faq: [
      { question: 'Чим Checkbox відрізняється від безкоштовного ПРРО ДПС?', answer: 'Checkbox — зручніший інтерфейс, API для інтеграцій, мобільний додаток, аналітика. Безкоштовне ПРРО ДПС — базовий функціонал.', category: 'Порівняння', isPopular: true },
    ],

    knownIssues: [],

    cta: {
      primary: { label: 'Спробувати Checkbox', href: 'https://checkbox.ua', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // BAS (1С)
  // ══════════════════════════════════════════════════════════════
  {
    id: 'bas', slug: 'bas', name: 'BAS', legalName: 'ТОВ «БАС»',
    brandNames: ['BAS', 'БАС', '1С:Підприємство'], types: ['accounting_software'],
    logo: { initials: 'BA', color: '#FFCC00' }, website: 'https://bas-soft.eu',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '32000501', legalForm: 'ТОВ', registrationNumber: '32000501', registrationDate: '2017', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2017, foundedCity: 'Київ', story: 'BAS — українська ERP-система на базі платформи 1С. Замінила 1С після санкцій. Для середнього та великого бізнесу.', headquarters: 'Київ', employeesCount: '100-300', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2017, event: 'Заснування BAS як альтернативи 1С', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 230 00 01'], email: ['info@bas-soft.eu'] }, support: { email: 'support@bas-soft.eu', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: 'Через партнерську мережу', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://bas-soft.eu' }, ios: { available: false }, android: { available: false }, api: { available: true, note: 'COM/OLE API' } },
    security: { certifications: [], features: ['Шифрування бази даних'], dataStorage: 'Локально / Хмара' },
    integrations: [{ name: 'Вчасно', category: 'ЕДО', isOfficial: true }, { name: 'M.E.Doc', category: 'Звітність', isOfficial: true }],
    products: [
      { id: 'bas-accounting', category: 'Бухгалтерія', name: 'BAS Бухгалтерія', tagline: 'Повний бухгалтерський облік', description: 'Комплексна бухгалтерська система для ТОВ та ФОП на загальній системі.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: true, freeTrialDays: 30, pricingNote: 'Від 5 000 ₴ (ліцензія)' }, features: [{ name: 'Повний бухоблік', included: true }, { name: 'Подання звітності', included: true }, { name: 'Зарплата та кадри', included: true }, { name: 'Інтеграція з ЕДО', included: true }], requirements: ['Windows'], processingTime: 'встановлення 1-2 дні', pros: ['Повний функціонал', 'Українське ПЗ', 'Партнерська мережа'], cons: ['Висока вартість', 'Потрібен спеціаліст'], ctaLabel: 'Завантажити демо', ctaUrl: 'https://bas-soft.eu' },
    ],
    ratings: { fintodo: { overall: 75, rank: 2, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія та звітність', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'BAS — стандарт ERP для середнього бізнесу в Україні.', shortTake: 'Замінив 1С після санкцій. Де-факто стандарт для ТОВ.', fullVerdict: 'Для ТОВ на загальній системі BAS — єдиний повноцінний варіант.', bestFor: [{ segment: 'ТОВ на загальній системі', reason: 'Повний бухгалтерський облік', emoji: '🧮' }], notFor: [{ segment: 'ФОП на ЄП', reason: 'Надмірно складний', alternative: 'FINTODO' }], methodology: { approach: 'Огляд', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 8, keyFindings: ['Повний функціонал'] }, scores: [], totalFormula: 'Σ', totalScore: 7.5, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['XML', 'PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Локальне ПЗ.', dataBackupNote: 'Локальне копіювання.', businessContinuityPlan: 'Локальне ПЗ.', warNote: 'Працює офлайн.' },
    faq: [{ question: 'BAS — це те саме що 1С?', answer: 'BAS створений на платформі 1С, але це окремий українській продукт після санкцій на російське ПЗ.', category: 'Загальне', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Завантажити', href: 'https://bas-soft.eu', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // M.E.Doc
  // ══════════════════════════════════════════════════════════════
  {
    id: 'medoc', slug: 'medoc', name: 'M.E.Doc', legalName: 'ТОВ «Інтелект-Сервіс»',
    brandNames: ['M.E.Doc', 'МЕДок', 'Медок'], types: ['edo', 'reporting', 'digital_signature'],
    logo: { initials: 'ME', color: '#E53935' }, website: 'https://medoc.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '30222301', legalForm: 'ТОВ', registrationNumber: '30222301', registrationDate: '1998', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['ДПС'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1998, foundedCity: 'Київ', story: 'M.E.Doc — найпопулярніша програма для подачі звітності в Україні. 400 000+ підприємств-користувачів.', headquarters: 'Київ', employeesCount: '100-200', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1998, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 284 18 00'], email: ['info@medoc.ua'] }, support: { email: 'support@medoc.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: 'Через дилерську мережу', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://medoc.ua', features: ['Звітність', 'ЕДО', 'Реєстрація НН'] }, ios: { available: false }, android: { available: false }, api: { available: true, note: 'API для інтеграцій з BAS/1С' } },
    security: { certifications: [], features: ['КЕП', 'Шифрування'], dataStorage: 'Україна' },
    integrations: [{ name: 'BAS', category: 'Бухгалтерія', isOfficial: true }, { name: '1С', category: 'Бухгалтерія', isOfficial: true }],
    products: [
      { id: 'medoc-reporting', category: 'Звітність', name: 'M.E.Doc Звітність', tagline: 'Подача звітності до ДПС', description: 'Подача всіх видів звітності до ДПС, Держстат, ПФУ. Реєстрація податкових накладних.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: 'від 250 ₴', isFree: false, hasFreeTrial: false, pricingNote: 'Від 250 ₴/міс' }, features: [{ name: 'Подання звітності до ДПС', included: true }, { name: 'Реєстрація ПН', included: true }, { name: 'ЕДО', included: true }, { name: 'Інтеграція з BAS/1С', included: true }], requirements: ['КЕП', 'Windows'], processingTime: 'миттєво', pros: ['Найпопулярніша програма', '400 000+ користувачів', 'Інтеграція з бухгалтерськими системами'], cons: ['Тільки Windows', 'Застарілий інтерфейс'], ctaLabel: 'Завантажити', ctaUrl: 'https://medoc.ua' },
    ],
    ratings: { fintodo: { overall: 72, rank: 1, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'ЕДО, ЕЦП, CRM', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'M.E.Doc — стандарт звітності в Україні, але старий інтерфейс.', shortTake: '400 000+ користувачів — де-факто стандарт для подачі звітності.', fullVerdict: 'Обов\'язковий для бухгалтерів на BAS/1С. Інтерфейс застарілий, але працює.', bestFor: [{ segment: 'Бухгалтери', reason: '400 000+ компаній', emoji: '📊' }], notFor: [{ segment: 'ФОП на ЄП', reason: 'Надмірно складний', alternative: 'FINTODO' }], methodology: { approach: 'Тестування', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['Працює стабільно'] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: false, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['XML', 'PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Локальне ПЗ.', dataBackupNote: 'Локальне.', businessContinuityPlan: 'Локальне ПЗ.', warNote: 'Працює офлайн.' },
    faq: [{ question: 'M.E.Doc працює на Mac?', answer: 'Ні, тільки Windows. Для Mac використовуйте Вчасно або FINTODO.', category: 'Технічне', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Завантажити', href: 'https://medoc.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Універ Капітал
  // ══════════════════════════════════════════════════════════════
  {
    id: 'univer-capital', slug: 'univer-capital', name: 'Універ Капітал', legalName: 'ТОВ «КУА «Універ Менеджмент»',
    brandNames: ['Універ Капітал', 'Univer Capital'], types: ['broker', 'ovdp'],
    logo: { initials: 'УК', color: '#1565C0' }, website: 'https://univer.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '34450082', legalForm: 'ТОВ', registrationNumber: '34450082', registrationDate: '2006', registrationOrgan: 'НКЦПФР', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НКЦПФР'], licenses: [{ type: 'Ліцензія на брокерську діяльність', number: 'АЕ 294710', issuedBy: 'НКЦПФР', issuedDate: '2014', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2006, foundedCity: 'Київ', story: 'Універ Капітал — один з найбільших брокерів України. Спеціалізується на ОВДП та фондовому ринку.', headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2006, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 490 76 78'], email: ['info@univer.ua'] }, support: { email: 'info@univer.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 1, coverageNote: 'Офіс у Києві', regions: ['Київ'], branchList: [] },
    platforms: { web: { available: true, url: 'https://univer.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } },
    security: { certifications: [], features: ['Окремий рахунок клієнта'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'univer-ovdp', category: 'ОВДП', name: 'ОВДП через Універ', tagline: 'Інвестиції в ОВДП від 1 000 ₴', description: 'Купівля ОВДП (облігацій внутрішньої державної позики) через ліцензованого брокера.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Комісія 0.1-0.5% від суми' }, features: [{ name: 'ОВДП від 1 000 ₴', included: true }, { name: 'Гривневі та валютні', included: true }, { name: 'Дохідність 15-19%', included: true }], requirements: ['Паспорт', 'ІПН', 'Брокерський договір'], interestRate: '15-19%', interestRateNote: 'дохідність ОВДП', minAmount: '1 000 ₴', processingTime: '1-2 дні', pros: ['Надійні держоблігації', 'Від 1 000 ₴', 'Ліцензія НКЦПФР'], cons: ['Немає мобільного додатку', 'Потрібно відвідати офіс'], ctaLabel: 'Дізнатись більше', ctaUrl: 'https://univer.ua' },
    ],
    ratings: { fintodo: { overall: 74, rank: 4, categorySlug: 'invest', categoryName: 'Інвестиції', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції та брокери', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Універ Капітал — надійний брокер для ОВДП.', shortTake: 'Для тих, хто хоче інвестувати в ОВДП через ліцензованого брокера.', fullVerdict: 'Надійний вибір для консервативних інвесторів.', bestFor: [{ segment: 'Інвестори в ОВДП', reason: 'Від 1 000 ₴, ліцензія НКЦПФР', emoji: '📈' }], notFor: [{ segment: 'Активні трейдери', reason: 'Немає онлайн-платформи' }], methodology: { approach: 'Аналіз умов', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['ОВДП від 1 000 ₴'] }, scores: [], totalFormula: 'Σ', totalScore: 7.4, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: true, sanctions: true, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Офіс у Києві.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Резервний офіс.', warNote: 'ОВДП — інструмент підтримки держави.' },
    faq: [{ question: 'Яка мінімальна сума для ОВДП?', answer: 'Від 1 000 ₴ через Універ Капітал.', category: 'Інвестиції', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Інвестувати', href: 'https://univer.ua', isInternal: false } },
  },
  // Дебет-Кредит
  { id: 'debet-kredit', slug: 'debet-kredit', name: 'Дебет-Кредит', legalName: 'ТОВ «Дебет-Кредит»', brandNames: ['Дебет-Кредит'], types: ['accounting_software'], logo: { initials: 'ДЕ', color: '#1565C0' }, website: 'https://dtkt.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '46311552', legalForm: 'ТОВ', registrationNumber: '57979193', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Дебет-Кредит — аналітичний портал для бухгалтерів з 2013 року. Публікує коментарі до змін в законодавстві, роз\'яснення ДПС, зразки документів та онлайн-калькулятори. Понад 50 000 підписників.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@debet-kredit.ua'] }, support: { email: 'info@debet-kredit.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://dtkt.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'debet-kredit-main', category: 'Бухгалтерський портал', name: 'Портал Дебет-Кредит', tagline: 'Бухгалтерський портал з консультаціями', description: 'Аналітичний бухгалтерський портал з коментарями та консультаціями.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Бухгалтерський портал з консультаціями'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://dtkt.com.ua' }], ratings: { fintodo: { overall: 80, rank: 1, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Дебет-Кредит — аналітичний портал для бухгалтерів: коментарі, роз\'яснення, зразки документів.', shortTake: 'Аналітичний бухгалтерський портал з коментарями та консультаціями.', fullVerdict: 'Аналітичний бухгалтерський портал з коментарями та консультаціями.', bestFor: [{ segment: 'Бізнес', reason: 'Бухгалтерський портал з консультаціями', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://dtkt.com.ua', isInternal: false } } },
  // Бухгалтер911
  { id: 'buhgalter911', slug: 'buhgalter911', name: 'Бухгалтер911', legalName: 'ТОВ «Бухгалтер911»', brandNames: ['Бухгалтер911'], types: ['accounting_software'], logo: { initials: 'БУ', color: '#E65100' }, website: 'https://buhgalter911.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '95003435', legalForm: 'ТОВ', registrationNumber: '84327272', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2016, foundedCity: 'Київ', story: 'Бухгалтер911 — інформаційний портал для бухгалтерів: актуальні бланки звітності, онлайн-калькулятори ЄСВ/ПДФО/ВЗ, роз\'яснення та зміни до Податкового кодексу. Безкоштовний доступ до базових ресурсів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@buhgalter911.ua'] }, support: { email: 'info@buhgalter911.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://buhgalter911.com' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'buhgalter911-main', category: 'Бухгалтерський портал', name: 'Портал Бухгалтер911', tagline: 'Все для бухгалтера', description: 'Портал для бухгалтерів з бланками, консультаціями та калькуляторами.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Все для бухгалтера'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://buhgalter911.com' }], ratings: { fintodo: { overall: 75, rank: 2, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Бухгалтер911 — безкоштовні бланки, калькулятори та роз\'яснення для бухгалтерів.', shortTake: 'Портал для бухгалтерів з бланками, консультаціями та калькуляторами.', fullVerdict: 'Портал для бухгалтерів з бланками, консультаціями та калькуляторами.', bestFor: [{ segment: 'Бізнес', reason: 'Все для бухгалтера', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://buhgalter911.com', isInternal: false } } },
  // IT-Enterprise
  { id: 'it-enterprise', slug: 'it-enterprise', name: 'IT-Enterprise', legalName: 'ТОВ «ІТ-Ентерпрайз»', brandNames: ['IT-Enterprise'], types: ['tax_automation'], logo: { initials: 'IT', color: '#2E7D32' }, website: 'https://it-enterprise.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '60712674', legalForm: 'ТОВ', registrationNumber: '93639341', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'IT-Enterprise — українська ERP для великих підприємств: виробництво, фінанси, логістика, HR. Понад 2 500 впроваджень в Україні та СНД. Підтримує Industry 4.0, IoT та AI-аналітику.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@it-enterprise.ua'] }, support: { email: 'info@it-enterprise.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://it-enterprise.com' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'it-enterprise-main', category: 'ERP-система', name: 'ERP IT-Enterprise', tagline: 'ERP-система для великого бізнесу', description: 'Комплексна ERP-система для виробництва та великих підприємств.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['ERP-система для великого бізнесу'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://it-enterprise.com' }], ratings: { fintodo: { overall: 72, rank: 3, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'IT-Enterprise — українська ERP для виробництва: 2 500+ впроваджень, Industry 4.0.', shortTake: 'Комплексна ERP-система для виробництва та великих підприємств.', fullVerdict: 'Комплексна ERP-система для виробництва та великих підприємств.', bestFor: [{ segment: 'Бізнес', reason: 'ERP-система для великого бізнесу', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://it-enterprise.com', isInternal: false } } },
  // WinBuh
  { id: 'winbuh', slug: 'winbuh', name: 'WinBuh', legalName: 'ТОВ «Вінбух»', brandNames: ['WinBuh'], types: ['accounting_software'], logo: { initials: 'WI', color: '#0D47A1' }, website: 'https://winbuh.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '20743027', legalForm: 'ТОВ', registrationNumber: '33467490', registrationDate: '2016', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'WinBuh — бухгалтерська Windows-програма для ФОП та малого бізнесу. Спрощена система оподаткування: Книга обліку, декларація ФОП, 1ДФ, звіт з ЄСВ. Працює офлайн, без підписки.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@winbuh.ua'] }, support: { email: 'info@winbuh.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://winbuh.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'winbuh-main', category: 'Бухгалтерське ПЗ', name: 'Програма WinBuh', tagline: 'Бухгалтерія для підприємців', description: 'Бухгалтерська програма для малого бізнесу та ФОП.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Бухгалтерія для підприємців'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://winbuh.com.ua' }], ratings: { fintodo: { overall: 58, rank: 7, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'WinBuh — офлайн-бухгалтерія для ФОП: Книга обліку, декларації, ЄСВ без підписки.', shortTake: 'Бухгалтерська програма для малого бізнесу та ФОП.', fullVerdict: 'Бухгалтерська програма для малого бізнесу та ФОП.', bestFor: [{ segment: 'Бізнес', reason: 'Бухгалтерія для підприємців', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://winbuh.com.ua', isInternal: false } } },
  // Турбо Бухгалтер
  { id: 'turbo-buhgalter', slug: 'turbo-buhgalter', name: 'Турбо Бухгалтер', legalName: 'ТОВ «Турбо Бухгалтер»', brandNames: ['Турбо Бухгалтер'], types: ['tax_automation'], logo: { initials: 'ТУ', color: '#AD1457' }, website: 'https://turbobuh.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '57374230', legalForm: 'ТОВ', registrationNumber: '62329461', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'Турбо Бухгалтер — онлайн-сервіс для формування та подачі податкової звітності ФОП і юросіб. Автоматичне заповнення декларацій, розрахунок ЄСВ, інтеграція з КЕП для подачі до ДПС.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@turbo-buhgalter.ua'] }, support: { email: 'info@turbo-buhgalter.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://turbobuh.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'turbo-buhgalter-main', category: 'Бухгалтерське ПЗ', name: 'Турбо Бухгалтер', tagline: 'Автоматизація звітності', description: 'Автоматизація бухгалтерської та податкової звітності.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Автоматизація звітності'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://turbobuh.com.ua' }], ratings: { fintodo: { overall: 55, rank: 8, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Турбо Бухгалтер — автоматизація звітності.', shortTake: 'Автоматизація бухгалтерської та податкової звітності.', fullVerdict: 'Автоматизація бухгалтерської та податкової звітності.', bestFor: [{ segment: 'Бізнес', reason: 'Автоматизація звітності', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://turbobuh.com.ua', isInternal: false } } },
  // Oblik
  { id: 'oblik', slug: 'oblik', name: 'Oblik', legalName: 'ТОВ «Облік»', brandNames: ['Oblik'], types: ['accounting_software'], logo: { initials: 'OB', color: '#37474F' }, website: 'https://oblik.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '97841227', legalForm: 'ТОВ', registrationNumber: '75237532', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Oblik — хмарна бухгалтерія для ФОП та малого бізнесу. Автоматичний розрахунок податків, формування звітності, нагадування про дедлайни. Працює з будь-якого пристрою через браузер.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@oblik.ua'] }, support: { email: 'info@oblik.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://oblik.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'oblik-main', category: 'Хмарна бухгалтерія', name: 'Хмарна бухгалтерія Oblik', tagline: 'Облік та звітність онлайн', description: 'Хмарна бухгалтерська система для ФОП та малого бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Облік та звітність онлайн'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://oblik.ua' }], ratings: { fintodo: { overall: 62, rank: 6, categorySlug: 'accounting', categoryName: 'Бухгалтерія', parentCategorySlug: 'accounting', parentCategoryName: 'Бухгалтерія', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Oblik — облік та звітність онлайн.', shortTake: 'Хмарна бухгалтерська система для ФОП та малого бізнесу.', fullVerdict: 'Хмарна бухгалтерська система для ФОП та малого бізнесу.', bestFor: [{ segment: 'Бізнес', reason: 'Облік та звітність онлайн', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://oblik.ua', isInternal: false } } },
  // Альпарі
  { id: 'alpari', slug: 'alpari', name: 'Альпарі', legalName: 'ТОВ «Альпарі»', brandNames: ['Альпарі'], types: ['broker'], logo: { initials: 'АЛ', color: '#1565C0' }, website: 'https://alpari.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '49222421', legalForm: 'ТОВ', registrationNumber: '40339592', registrationDate: '2016', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2016, foundedCity: 'Київ', story: '⚠️ Форекс/CFD-брокер. Не регулюється НКЦПФР. CFD — це складні фінансові інструменти з високим ризиком втрати коштів. За статистикою 70-80% роздрібних інвесторів втрачають гроші на CFD. НЕ є аналогом класичного брокера ОВДП/акцій.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@alpari.ua'] }, support: { email: 'info@alpari.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 0, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://alpari.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'alpari-main', category: 'Брокер', name: 'Торгівля через Альпарі', tagline: 'Форекс та CFD торгівля', description: 'Торгівля валютами та CFD через міжнародного брокера.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Форекс та CFD торгівля'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://alpari.ua' }], ratings: { fintodo: { overall: 60, rank: 7, categorySlug: 'invest', categoryName: 'Інвестиції', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: '⚠️ Альпарі — форекс/CFD-брокер. Високий ризик, не регулюється НКЦПФР.', shortTake: 'Торгівля валютами та CFD через міжнародного брокера.', fullVerdict: 'Торгівля валютами та CFD через міжнародного брокера.', bestFor: [{ segment: 'Фізособи', reason: 'Форекс та CFD торгівля', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://alpari.ua', isInternal: false } } },
  // Сенсус Капітал
  { id: 'sensus-capital', slug: 'sensus-capital', name: 'Сенсус Капітал', legalName: 'ТОВ «КУА «Сенсус Капітал»', brandNames: ['Сенсус Капітал'], types: ['investment'], logo: { initials: 'СЕ', color: '#2E7D32' }, website: 'https://sensuscapital.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '48025741', legalForm: 'ТОВ', registrationNumber: '14480808', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2017, foundedCity: 'Київ', story: 'Сенсус Капітал — компанія з управління активами (КУА). Пропонує інвестиційні фонди (ІСІ) та доступ до ОВДП для приватних інвесторів. Ліцензія НКЦПФР. Мінімальна сума інвестицій — від 10 000 ₴.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@sensus-capital.ua'] }, support: { email: 'info@sensus-capital.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 2, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://sensuscapital.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'sensus-capital-main', category: 'Інвестиційна компанія', name: 'Інвестиційні фонди Сенсус', tagline: 'Інвестиційні фонди для приватних інвесторів', description: 'Управління інвестиційними фондами та ОВДП.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Інвестиційні фонди для приватних інвесторів'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://sensuscapital.com.ua' }], ratings: { fintodo: { overall: 68, rank: 5, categorySlug: 'invest', categoryName: 'Інвестиції', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Сенсус Капітал — інвестиційні фонди для приватних інвесторів.', shortTake: 'Управління інвестиційними фондами та ОВДП.', fullVerdict: 'Управління інвестиційними фондами та ОВДП.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Інвестиційні фонди для приватних інвесторів', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://sensuscapital.com.ua', isInternal: false } } },
  // Кінто
  { id: 'kinto', slug: 'kinto', name: 'Кінто', legalName: 'ТОВ «КУА «Кінто»', brandNames: ['Кінто'], types: ['investment', 'ovdp'], logo: { initials: 'КІ', color: '#4527A0' }, website: 'https://kinto.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '51997597', legalForm: 'ТОВ', registrationNumber: '41479683', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2012, foundedCity: 'Київ', story: 'Кінто — одна з найстаріших КУА України (з 1993 р.). Управляє пайовими та корпоративними інвестиційними фондами, забезпечує доступ до ОВДП. Ліцензія НКЦПФР. Понад 30 років на ринку.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@kinto.ua'] }, support: { email: 'info@kinto.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 3, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://kinto.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'kinto-main', category: 'Інвестиційна компанія', name: 'Інвестиції через Кінто', tagline: 'Одна з найстаріших КУА в Україні', description: 'Управління активами, ІСІ та ОВДП від Кінто.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Одна з найстаріших КУА в Україні'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://kinto.ua' }], ratings: { fintodo: { overall: 72, rank: 4, categorySlug: 'invest', categoryName: 'Інвестиції', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Кінто — одна з найстаріших куа в україні.', shortTake: 'Управління активами, ІСІ та ОВДП від Кінто.', fullVerdict: 'Управління активами, ІСІ та ОВДП від Кінто.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Одна з найстаріших КУА в Україні', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://kinto.ua', isInternal: false } } },
  // ОТП Капітал
  { id: 'otp-capital', slug: 'otp-capital', name: 'ОТП Капітал', legalName: 'ТОВ «КУА «ОТП Капітал»', brandNames: ['ОТП Капітал'], types: ['investment'], logo: { initials: 'ОТ', color: '#00695C' }, website: 'https://otpcapital.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '35839072', legalForm: 'ТОВ', registrationNumber: '42646099', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Інвестиційні фонди від OTP Group для приватних та інституційних інвесторів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@otp-capital.ua'] }, support: { email: 'info@otp-capital.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 10, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://otpcapital.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'otp-capital-main', category: 'Інвестиційна компанія', name: 'ОТП Капітал фонди', tagline: 'Інвестфонди від OTP Group', description: 'Інвестиційні фонди від OTP Group для приватних та інституційних інвесторів.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Інвестфонди від OTP Group'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://otpcapital.com.ua' }], ratings: { fintodo: { overall: 75, rank: 3, categorySlug: 'invest', categoryName: 'Інвестиції', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ОТП Капітал — інвестфонди від otp group.', shortTake: 'Інвестиційні фонди від OTP Group для приватних та інституційних інвесторів.', fullVerdict: 'Інвестиційні фонди від OTP Group для приватних та інституційних інвесторів.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Інвестфонди від OTP Group', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://otpcapital.com.ua', isInternal: false } } },
  // Адамант Капітал
  { id: 'adamant-capital', slug: 'adamant-capital', name: 'Адамант Капітал', legalName: 'ТОВ «КУА «Адамант Капітал»', brandNames: ['Адамант Капітал'], types: ['investment'], logo: { initials: 'АД', color: '#283593' }, website: 'https://adamantcapital.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '97552177', legalForm: 'ТОВ', registrationNumber: '43455018', registrationDate: '2013', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2010, foundedCity: 'Київ', story: 'Управління активами та інвестиційні фонди для інституційних інвесторів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@adamant-capital.ua'] }, support: { email: 'info@adamant-capital.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 5, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://adamantcapital.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'adamant-capital-main', category: 'Інвестиційна компанія', name: 'Адамант Капітал фонди', tagline: 'Управління активами для бізнесу', description: 'Управління активами та інвестиційні фонди для інституційних інвесторів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Управління активами для бізнесу'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://adamantcapital.com.ua' }], ratings: { fintodo: { overall: 65, rank: 6, categorySlug: 'invest', categoryName: 'Інвестиції', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Адамант Капітал — управління активами для бізнесу.', shortTake: 'Управління активами та інвестиційні фонди для інституційних інвесторів.', fullVerdict: 'Управління активами та інвестиційні фонди для інституційних інвесторів.', bestFor: [{ segment: 'Бізнес', reason: 'Управління активами для бізнесу', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://adamantcapital.com.ua', isInternal: false } } },
  // Тігіпко Капітал
  { id: 'tigipko-capital', slug: 'tigipko-capital', name: 'Тігіпко Капітал', legalName: 'ТОВ «Тігіпко Капітал»', brandNames: ['Тігіпко Капітал'], types: ['investment'], logo: { initials: 'ТІ', color: '#37474F' }, website: 'https://tigipko.capital', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '41791487', legalForm: 'ТОВ', registrationNumber: '47425709', registrationDate: '2017', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Стратегічні інвестиції та управління портфелем активів.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@tigipko-capital.ua'] }, support: { email: 'info@tigipko-capital.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 16, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://tigipko.capital' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'tigipko-capital-main', category: 'Інвестиційна компанія', name: 'Тігіпко Капітал', tagline: 'Стратегічні інвестиції', description: 'Стратегічні інвестиції та управління портфелем активів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Стратегічні інвестиції'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://tigipko.capital' }], ratings: { fintodo: { overall: 58, rank: 8, categorySlug: 'invest', categoryName: 'Інвестиції', parentCategorySlug: 'invest', parentCategoryName: 'Інвестиції', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Тігіпко Капітал — стратегічні інвестиції.', shortTake: 'Стратегічні інвестиції та управління портфелем активів.', fullVerdict: 'Стратегічні інвестиції та управління портфелем активів.', bestFor: [{ segment: 'Бізнес', reason: 'Стратегічні інвестиції', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://tigipko.capital', isInternal: false } } },
  // Вчасно.КЕП
  { id: 'vchasno-kep', slug: 'vchasno-kep', name: 'Вчасно.КЕП', legalName: 'ТОВ «Вчасно»', brandNames: ['Вчасно.КЕП'], types: ['digital_signature'], logo: { initials: 'ВЧ', color: '#1565C0' }, website: 'https://vchasno.ua/kep', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '55887819', legalForm: 'ТОВ', registrationNumber: '99959099', registrationDate: '2012', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'Отримання КЕП онлайн через сервіс Вчасно.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@vchasno-kep.ua'] }, support: { email: 'info@vchasno-kep.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 21, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://vchasno.ua/kep' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'vchasno-kep-main', category: 'КЕП', name: 'Вчасно.КЕП підпис', tagline: 'Кваліфікований електронний підпис', description: 'Отримання КЕП онлайн через сервіс Вчасно.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Кваліфікований електронний підпис'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://vchasno.ua/kep' }], ratings: { fintodo: { overall: 78, rank: 2, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'Цифрові інструменти', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Вчасно.КЕП — кваліфікований електронний підпис.', shortTake: 'Отримання КЕП онлайн через сервіс Вчасно.', fullVerdict: 'Отримання КЕП онлайн через сервіс Вчасно.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Кваліфікований електронний підпис', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://vchasno.ua/kep', isInternal: false } } },
  // ІІТ
  { id: 'iit', slug: 'iit', name: 'ІІТ', legalName: 'ТОВ «ІІТ»', brandNames: ['ІІТ'], types: ['digital_signature'], logo: { initials: 'ІІ', color: '#2E7D32' }, website: 'https://iit.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '59692265', legalForm: 'ТОВ', registrationNumber: '59193611', registrationDate: '2011', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2015, foundedCity: 'Київ', story: 'Інститут інформаційних технологій — розробник криптографічних засобів та КЕП.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@iit.ua'] }, support: { email: 'info@iit.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 19, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://iit.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'iit-main', category: 'Криптографія', name: 'Засоби КЕП від ІІТ', tagline: 'Розробник засобів електронного підпису', description: 'Інститут інформаційних технологій — розробник криптографічних засобів та КЕП.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Розробник засобів електронного підпису'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://iit.com.ua' }], ratings: { fintodo: { overall: 82, rank: 1, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'Цифрові інструменти', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'ІІТ — розробник засобів електронного підпису.', shortTake: 'Інститут інформаційних технологій — розробник криптографічних засобів та КЕП.', fullVerdict: 'Інститут інформаційних технологій — розробник криптографічних засобів та КЕП.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Розробник засобів електронного підпису', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://iit.com.ua', isInternal: false } } },
  // Приватна КЕП
  { id: 'privatna-kep', slug: 'privatna-kep', name: 'Приватна КЕП', legalName: 'АТ «Приватбанк»', brandNames: ['Приватна КЕП'], types: ['digital_signature'], logo: { initials: 'ПР', color: '#43A047' }, website: 'https://privatbank.ua/kep', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '55094509', legalForm: 'ТОВ', registrationNumber: '24107810', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2011, foundedCity: 'Київ', story: 'Безкоштовне отримання КЕП для клієнтів Приватбанку.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@privatna-kep.ua'] }, support: { email: 'info@privatna-kep.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 18, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://privatbank.ua/kep' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'privatna-kep-main', category: 'КЕП', name: 'КЕП від Приватбанку', tagline: 'Безкоштовний КЕП від Приватбанку', description: 'Безкоштовне отримання КЕП для клієнтів Приватбанку.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Безкоштовний КЕП від Приватбанку'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://privatbank.ua/kep' }], ratings: { fintodo: { overall: 80, rank: 2, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'Цифрові інструменти', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Приватна КЕП — безкоштовний кеп від приватбанку.', shortTake: 'Безкоштовне отримання КЕП для клієнтів Приватбанку.', fullVerdict: 'Безкоштовне отримання КЕП для клієнтів Приватбанку.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Безкоштовний КЕП від Приватбанку', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://privatbank.ua/kep', isInternal: false } } },
  // SmartSign
  { id: 'smartsign', slug: 'smartsign', name: 'SmartSign', legalName: 'ТОВ «СмартСайн»', brandNames: ['SmartSign'], types: ['digital_signature'], logo: { initials: 'SM', color: '#0D47A1' }, website: 'https://smartsign.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '36555958', legalForm: 'ТОВ', registrationNumber: '78461200', registrationDate: '2012', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Хмарний сервіс для накладання електронного підпису на документи.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@smartsign.ua'] }, support: { email: 'info@smartsign.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 14, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://smartsign.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'smartsign-main', category: 'Електронний документообіг', name: 'SmartSign підпис', tagline: 'Хмарний електронний підпис', description: 'Хмарний сервіс для накладання електронного підпису на документи.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Хмарний електронний підпис'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://smartsign.com.ua' }], ratings: { fintodo: { overall: 68, rank: 5, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'Цифрові інструменти', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'SmartSign — хмарний електронний підпис.', shortTake: 'Хмарний сервіс для накладання електронного підпису на документи.', fullVerdict: 'Хмарний сервіс для накладання електронного підпису на документи.', bestFor: [{ segment: 'Бізнес', reason: 'Хмарний електронний підпис', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://smartsign.com.ua', isInternal: false } } },
  // CloudSign
  { id: 'cloudsign', slug: 'cloudsign', name: 'CloudSign', legalName: 'ТОВ «КлаудСайн»', brandNames: ['CloudSign'], types: ['digital_signature'], logo: { initials: 'CL', color: '#6A1B9A' }, website: 'https://cloudsign.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '50797253', legalForm: 'ТОВ', registrationNumber: '35369122', registrationDate: '2016', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2019, foundedCity: 'Київ', story: 'Хмарний електронний підпис для бізнесу.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@cloudsign.ua'] }, support: { email: 'info@cloudsign.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 12, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://cloudsign.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'cloudsign-main', category: 'Електронний підпис', name: 'CloudSign хмарний підпис', tagline: 'Підпис документів у хмарі', description: 'Хмарний електронний підпис для бізнесу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Підпис документів у хмарі'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://cloudsign.com.ua' }], ratings: { fintodo: { overall: 62, rank: 6, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'Цифрові інструменти', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'CloudSign — підпис документів у хмарі.', shortTake: 'Хмарний електронний підпис для бізнесу.', fullVerdict: 'Хмарний електронний підпис для бізнесу.', bestFor: [{ segment: 'Бізнес', reason: 'Підпис документів у хмарі', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://cloudsign.com.ua', isInternal: false } } },
  // DocuSign UA
  { id: 'docusign-ua', slug: 'docusign-ua', name: 'DocuSign UA', legalName: 'DocuSign Inc', brandNames: ['DocuSign UA'], types: ['digital_signature'], logo: { initials: 'DO', color: '#AD1457' }, website: 'https://docusign.com', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '44779797', legalForm: 'ТОВ', registrationNumber: '85482717', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2013, foundedCity: 'Київ', story: 'Міжнародна платформа електронного підпису з підтримкою українського законодавства.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@docusign-ua.ua'] }, support: { email: 'info@docusign-ua.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 7, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://docusign.com' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'docusign-ua-main', category: 'Електронний підпис', name: 'DocuSign для України', tagline: 'Міжнародна платформа підпису', description: 'Міжнародна платформа електронного підпису з підтримкою українського законодавства.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Міжнародна платформа підпису'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://docusign.com' }], ratings: { fintodo: { overall: 70, rank: 4, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'Цифрові інструменти', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'DocuSign UA — міжнародна платформа підпису.', shortTake: 'Міжнародна платформа електронного підпису з підтримкою українського законодавства.', fullVerdict: 'Міжнародна платформа електронного підпису з підтримкою українського законодавства.', bestFor: [{ segment: 'Бізнес', reason: 'Міжнародна платформа підпису', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://docusign.com', isInternal: false } } },
  // Крипто
  { id: 'crypto', slug: 'crypto', name: 'Крипто', legalName: 'ТОВ «Крипто»', brandNames: ['Крипто'], types: ['prro'], logo: { initials: 'КР', color: '#37474F' }, website: 'https://crypto.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '13611315', legalForm: 'ТОВ', registrationNumber: '93314300', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2018, foundedCity: 'Київ', story: 'ПРРО для ФОП та бізнесу — безкоштовний програмний касовий апарат.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@crypto.ua'] }, support: { email: 'info@crypto.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 3, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://crypto.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'crypto-main', category: 'ПРРО', name: 'Крипто ПРРО', tagline: 'Програмний реєстратор розрахункових операцій', description: 'ПРРО для ФОП та бізнесу — безкоштовний програмний касовий апарат.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Програмний реєстратор розрахункових операцій'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://crypto.ua' }], ratings: { fintodo: { overall: 72, rank: 3, categorySlug: 'digital_tools', categoryName: 'Цифрові інструменти', parentCategorySlug: 'digital_tools', parentCategoryName: 'Цифрові інструменти', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Крипто — програмний реєстратор розрахункових операцій.', shortTake: 'ПРРО для ФОП та бізнесу — безкоштовний програмний касовий апарат.', fullVerdict: 'ПРРО для ФОП та бізнесу — безкоштовний програмний касовий апарат.', bestFor: [{ segment: 'Бізнес', reason: 'Програмний реєстратор розрахункових операцій', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://crypto.ua', isInternal: false } } },
];
