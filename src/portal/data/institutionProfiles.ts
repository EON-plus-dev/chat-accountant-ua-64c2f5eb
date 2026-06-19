// ══════════════════════════════════════════════════════════════════
// Institution Profiles — детальні профілі КОНКРЕТНИХ установ
// Окремо від catalog.ts (каталог типів) та rankings.ts (рейтинги ПЗ)
// ══════════════════════════════════════════════════════════════════

export interface InstitutionBranch {
  id: string;
  name: string;
  type: 'main' | 'branch' | 'atm' | 'service_point' | 'partner';
  address: {
    street: string;
    city: string;
    region: string;
    zipCode?: string;
    mapUrl?: string;
    coordinates?: { lat: number; lng: number };
  };
  phone?: string;
  workingHours: {
    weekdays: string;
    saturday?: string;
    sunday?: string;
    lunch?: string;
  };
  services: string[];
  isOpen24h: boolean;
  hasAtm: boolean;
  hasTerminal: boolean;
  hasDisabledAccess: boolean;
  distanceFromCenter?: string;
}

export interface InstitutionProduct {
  id: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  audience: 'business' | 'personal' | 'both';
  isHighlighted: boolean;
  isFeatured: boolean;
  price: {
    setup?: string;
    monthly?: string;
    perTransaction?: string;
    annual?: string;
    isFree: boolean;
    hasFreeTrial: boolean;
    freeTrialDays?: number;
    pricingNote: string;
  };
  features: {
    name: string;
    included: boolean | 'partial';
    limit?: string;
    note?: string;
  }[];
  requirements: string[];
  minAmount?: string;
  maxAmount?: string;
  interestRate?: string;
  interestRateNote?: string;
  processingTime?: string;
  coverageLimits?: string;
  promotions?: string[];
  pros: string[];
  cons: string[];
  ctaLabel: string;
  ctaUrl: string;
  moreInfoUrl?: string;
  /** Textual benefits from the institution's website (replaces star ratings) */
  benefits?: string[];
  /** Tariff plans (e.g. Start / Standard / Comfort) */
  tariffPlans?: {
    name: string;
    price: string;
    conditions?: string;
    features?: string[];
    isPopular?: boolean;
  }[];
  /** Sub-products within a product group (e.g. card types, acquiring options) */
  subProducts?: {
    name: string;
    description?: string;
    url?: string;
  }[];
  /** Document checklists specific to this product */
  documentChecklist?: FullInstitutionProfile["documentChecklists"];
  /** Common mistakes specific to this product */
  commonMistakes?: string[];
}

export interface ReviewThemeDetail {
  theme: string;
  sentiment: 'positive' | 'negative' | 'mixed';
  frequency: 'very_common' | 'common' | 'occasional' | 'rare';
  percentMentioning?: number;
  summary: string;
  positiveQuote?: string;
  negativeQuote?: string;
  ourConclusion: string;
}

export interface EditorialScore {
  category: string;
  weight: number;
  score: number;
  maxScore: number;
  rationale: string;
  whatWeTested: string[];
  howWeScored: string;
  standoutFact?: string;
  penaltyReasons: string[];
}

export interface CompetitorComparison {
  competitorId: string;
  competitorName: string;
  compareUrl?: string;
  ourAdvantages: { area: string; detail: string }[];
  theirAdvantages: { area: string; detail: string }[];
  equalAreas: string[];
  whenChooseUs: string;
  whenChooseThem: string;
  bottomLine: string;
}

export interface NewsItem {
  id: string;
  date: string;
  dateISO: string;
  title: string;
  summary: string;
  type:
    | 'product_launch'
    | 'pricing_change'
    | 'award'
    | 'regulatory'
    | 'partnership'
    | 'leadership'
    | 'expansion'
    | 'controversy'
    | 'financial';
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
  sourceUrl?: string;
  isImportant: boolean;
}

export interface HistoryMilestone {
  year: number;
  month?: number;
  event: string;
  type:
    | 'founding'
    | 'product'
    | 'expansion'
    | 'award'
    | 'leadership'
    | 'financial'
    | 'crisis'
    | 'recovery';
}

export interface FullInstitutionProfile {
  // ── ІДЕНТИФІКАЦІЯ ──
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  legalName: string;
  brandNames: string[];
  types: string[];
  logo: { initials: string; color: string };
  website: string;
  verified: boolean;
  verifiedDate: string;
  dataLastUpdated: string;

  // ── ЮРИДИЧНА ІНФОРМАЦІЯ ──
  legal: {
    edrpou: string;
    legalForm: string;
    registrationNumber: string;
    registrationDate: string;
    registrationOrgan: string;
    address: { legal: string; actual: string };
    charter?: string;
    regulators: string[];
    licenses: {
      type: string;
      number: string;
      issuedBy: string;
      issuedDate: string;
      expiryDate?: string;
      status: 'active' | 'suspended' | 'revoked';
      verificationUrl?: string;
    }[];
    certifications: { name: string; issuedBy: string; validUntil?: string }[];
    taxStatus: string;
    auditor?: string;
    lastAuditYear?: number;
    publicReports?: string;
    status: 'active' | 'reorganizing' | 'liquidation' | 'bankrupt';
  };

  // ── КОМПАНІЯ ──
  company: {
    foundedYear: number;
    foundedCity: string;
    story: string;
    mission?: string;
    headquarters: string;
    employeesCount: string;
    employeesNote?: string;
    parentCompany?: string;
    subsidiaries?: string[];
    investors?: string[];
    fundingTotal?: string;
    publiclyTraded: boolean;
    stockExchange?: string;
    stockSymbol?: string;
    stockUrl?: string;
    annualRevenue?: string;
    assets?: string;
    capitalAdequacy?: string;
    keyPeople: {
      name: string;
      role: string;
      since?: string;
      photo?: string;
      linkedIn?: string;
      bio?: string;
    }[];
    milestones: HistoryMilestone[];
  };

  // ── КОНТАКТИ ──
  contacts: {
    mainOffice: {
      address: string;
      city: string;
      zipCode?: string;
      country: string;
      phone: string[];
      email: string[];
      mapUrl?: string;
      coordinates?: { lat: number; lng: number };
    };
    support: {
      freePhone?: string;
      paidPhone?: string;
      email?: string;
      chatWidget?: boolean;
      telegram?: string;
      viber?: string;
      facebook?: string;
      workingHours: string;
      is247: boolean;
      averageResponseTime?: string;
      supportQualityNote?: string;
    };
    press?: { email: string; phone?: string; name?: string };
    social: {
      telegram?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      youtube?: string;
      twitter?: string;
      tiktok?: string;
    };
  };

  // ── ВІДДІЛЕННЯ ──
  branches: {
    totalCount: number;
    atmCount?: number;
    terminalCount?: number;
    coverageNote: string;
    regions: string[];
    findBranchUrl?: string;
    branchList: InstitutionBranch[];
    branchNote?: string;
  };

  // ── ПЛАТФОРМИ ──
  platforms: {
    web: { available: boolean; url?: string; features?: string[] };
    ios: {
      available: boolean;
      url?: string;
      rating?: number;
      reviewCount?: number;
      lastUpdated?: string;
      version?: string;
      compatibleFrom?: string;
    };
    android: {
      available: boolean;
      url?: string;
      rating?: number;
      reviewCount?: number;
      lastUpdated?: string;
      version?: string;
    };
    windowsApp?: { available: boolean; url?: string };
    macApp?: { available: boolean; url?: string };
    api: {
      available: boolean;
      docsUrl?: string;
      sandbox?: boolean;
      note?: string;
    };
  };

  // ── БЕЗПЕКА ──
  security: {
    certifications: string[];
    features: string[];
    uptime?: string;
    dataStorage: string;
    breachHistory?: string;
    regulatoryIncidents?: string;
  };

  // ── ІНТЕГРАЦІЇ ──
  integrations: {
    name: string;
    category: string;
    url?: string;
    isOfficial: boolean;
    note?: string;
  }[];

  // ── ПРОДУКТИ ──
  products: InstitutionProduct[];

  // ── РЕЙТИНГИ ──
  ratings: {
    fintodo: {
      overall: number;
      rank: number;
      categorySlug: string;
      categoryName: string;
      parentCategorySlug: string;
      parentCategoryName: string;
      badge?: string;
      reviewDate: string;
      nextReviewDate?: string;
    };
    external: {
      source: string;
      rating: number;
      maxRating: number;
      reviewCount?: number;
      url?: string;
      asOf?: string;
    }[];
    averageExternal?: number;
    totalReviewsAllSources?: number;
  };

  // ── РЕДАКЦІЙНА ОЦІНКА ──
  editorial: {
    oneLiner: string;
    shortTake: string;
    fullVerdict: string;
    bestFor: { segment: string; reason: string; emoji: string }[];
    notFor: { segment: string; reason: string; alternative?: string }[];
    methodology: {
      approach: string;
      testingPeriod: string;
      testedBy: string;
      hoursSpent: number;
      keyFindings: string[];
      limitationsNote?: string;
    };
    scores: EditorialScore[];
    totalFormula: string;
    totalScore: number;
    independenceStatement: string;
    conflictOfInterest?: string;
  };

  // ── ТЕМИ ВІДГУКІВ ──
  reviewThemes: ReviewThemeDetail[];
  reviewSourcesNote: string;

  // ── ПОРІВНЯННЯ ──
  comparisons: CompetitorComparison[];

  // ── НОВИНИ І ЗМІНИ ──
  news: NewsItem[];
  changelog: {
    date: string;
    version?: string;
    changes: string[];
    type: 'feature' | 'pricing' | 'policy' | 'fix' | 'expansion';
    impact: 'high' | 'medium' | 'low';
  }[];

  // ── НАГОРОДИ ──
  awards: {
    year: number;
    name: string;
    category?: string;
    organization: string;
    url?: string;
  }[];

  // ── ПАРТНЕРСТВА ──
  partnerships: {
    partner: string;
    type: string;
    since?: string;
    description: string;
  }[];

  // ── ВІДПОВІДНІСТЬ ВИМОГАМ ──
  compliance: {
    aml: boolean;
    gdpr: boolean;
    nbu: boolean;
    dps: boolean;
    dia: boolean;
    pep: boolean;
    sanctions: boolean;
    certificationBody?: string;
    lastComplianceCheck?: string;
    openBanking: boolean;
    reportingFormats: string[];
  };

  // ── ВОЄННИЙ СТАН ──
  warPeriod: {
    operationalStatus: string;
    physicalPresenceStatus?: string;
    reliabilityDuringBlackouts: string;
    dataBackupNote: string;
    supportForAffected?: string;
    charityWork?: string[];
    businessContinuityPlan: string;
    warNote: string;
  };

  // ── FAQ ──
  faq: {
    question: string;
    answer: string;
    category: string;
    isPopular: boolean;
  }[];

  // ── СКАРГИ І ПРОБЛЕМИ ──
  knownIssues: {
    issue: string;
    frequency: 'widespread' | 'occasional' | 'rare';
    institutionResponse?: string;
    workaround?: string;
    status: 'resolved' | 'ongoing' | 'acknowledged' | 'denied';
  }[];

  // ── CTA ──
  cta: {
    primary: { label: string; href: string; isInternal: boolean };
    secondary?: { label: string; href: string };
  };

  // ── ЧЕКЛІСТИ ДОКУМЕНТІВ (для AI БЗ) ──
  documentChecklists?: {
    scenario: string;
    forAudience: 'fop' | 'tov' | 'personal' | 'all';
    requiredDocs: {
      name: string;
      note?: string;
      alternatives?: string[];
      isOptional: boolean;
    }[];
    timeToComplete: string;
    canDoOnline: boolean;
    onlineUrl?: string;
    warnings: string[];
    tips: string[];
  }[];

  // ── ОНЛАЙН / ОФЛАЙН ──
  onlineServices?: string[];
  offlineRequirements?: string[];

  // ── ТИПОВІ ПОМИЛКИ ──
  commonMistakes?: string[];

  // ── КОРИСНІ ПОСИЛАННЯ ДЛЯ AI ──
  aiUsefulLinks?: {
    label: string;
    url: string;
    isInternal: boolean;
  }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

// ══════════════════════════════════════════════════════════════════
// Data & helpers
// ══════════════════════════════════════════════════════════════════

import { FINTECH_PROFILES } from './institutionProfiles-fintech';
import { SERVICES_PROFILES } from './institutionProfiles-services';
import { DIGITAL_PROFILES } from './institutionProfiles-digital';

const LEGACY_PROFILES: FullInstitutionProfile[] = [
  {
    id: 'monobank-biznes',
    slug: 'monobank-biznes',
    name: 'Monobank Бізнес',
    shortName: 'Monobank',
    legalName: 'АТ «УНІВЕРСАЛ БАНК»',
    brandNames: ['Monobank', 'Mono', 'Universal Bank'],
    types: ['bank', 'fintech'],
    logo: { initials: 'МБ', color: '#1F2937' },
    website: 'https://mbnk.biz',
    verified: true,
    verifiedDate: 'Березень 2025',
    dataLastUpdated: '15 березня 2025',
    seoTitle: 'Monobank Бізнес — огляд | FINTODO',
    seoDescription: 'Безкоштовний рахунок для старту',
    seoKeywords: ['Monobank Бізнес', 'огляд', 'відгуки'],

    legal: {
      edrpou: '21133352',
      legalForm: 'АТ',
      registrationNumber: '14360570',
      registrationDate: '7 лютого 1994',
      registrationOrgan: 'Мін\'юст України',
      address: {
        legal: 'вул. Академіка Андрія Сахарова, 8, Київ, 03048',
        actual: 'вул. Академіка Андрія Сахарова, 8, Київ, 03048',
      },
      regulators: ['Національний банк України (НБУ)'],
      licenses: [
        {
          type: 'Банківська ліцензія',
          number: '№ 92',
          issuedBy: 'НБУ',
          issuedDate: '10 жовтня 2011',
          status: 'active',
          verificationUrl: 'https://bank.gov.ua/ua/supervision/banks',
        },
      ],
      certifications: [
        { name: 'PCI DSS Level 1', issuedBy: 'QSA Auditor' },
        { name: 'ISO 27001', issuedBy: 'BSI Group', validUntil: '2026' },
      ],
      taxStatus: 'Платник ПДВ, загальна система',
      auditor: 'Ernst & Young',
      lastAuditYear: 2024,
      publicReports: 'https://bank.gov.ua/ua/supervision/banks',
      status: 'active',
    },

    company: {
      foundedYear: 2017,
      foundedCity: 'Київ',
      story: 'Monobank заснований у 2017 році командою Олега Гороховського і Михайла Рогальського — ветеранів ПриватБанку. За першу добу після запуску зареєструвались понад 10 000 користувачів. Сьогодні — найбільший необанк України.',
      mission: 'Зробити банківські послуги доступними, зручними і безкоштовними для кожного українця',
      headquarters: 'Київ, Україна',
      employeesCount: '1000-5000',
      publiclyTraded: false,
      assets: 'понад 50 млрд ₴',
      keyPeople: [
        {
          name: 'Олег Гороховський',
          role: 'Співзасновник та Голова правління',
          since: '2017',
          linkedIn: 'https://linkedin.com/in/oleg-gorokhovskiy',
          bio: 'До Monobank — заступник голови правління ПриватБанку. Один з найвідоміших банкірів України.',
        },
        {
          name: 'Михайло Рогальський',
          role: 'Співзасновник та CTO',
          since: '2017',
          bio: 'Архітектор технологічної платформи Monobank. Раніше — IT-директор ПриватБанку.',
        },
        {
          name: 'Дмитро Дубілет',
          role: 'Колишній CEO (2017-2020)',
          bio: 'Після Monobank — Міністр КМУ з питань цифрової трансформації. Автор "Дія".',
        },
      ],
      milestones: [
        { year: 2017, month: 11, event: 'Запуск Monobank — перший необанк України. 10 000 реєстрацій за першу добу', type: 'founding' },
        { year: 2018, event: 'Запуск Monobank Бізнес — рахунки для ФОП', type: 'product' },
        { year: 2019, event: '1 000 000 активних клієнтів', type: 'expansion' },
        { year: 2020, event: 'Дмитро Дубілет залишає компанію для роботи в уряді', type: 'leadership' },
        { year: 2021, event: 'Запуск ОВДП в додатку — революція для роздрібних інвесторів', type: 'product' },
        { year: 2022, event: 'Під час повномасштабного вторгнення — безперебійна робота. Безкоштовний рахунок для ВПО', type: 'crisis' },
        { year: 2023, event: 'Рейтинг App Store 4.9 — абсолютний рекорд серед банків', type: 'award' },
        { year: 2024, event: '6 000 000+ активних клієнтів', type: 'expansion' },
        { year: 2025, month: 2, event: 'Запуск овердрафту для нових бізнес-клієнтів без застави', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Академіка Андрія Сахарова, 8',
        city: 'Київ',
        zipCode: '03048',
        country: 'Україна',
        phone: ['0800 503 404', '+38 044 390 35 80'],
        email: ['business@monobank.ua', 'legal@monobank.ua'],
        mapUrl: 'https://maps.google.com/?q=Monobank+Sakharova+8+Kyiv',
      },
      support: {
        freePhone: '0800 503 404',
        email: 'business@monobank.ua',
        chatWidget: true,
        telegram: '@monobank',
        workingHours: 'Цілодобово, 7 днів на тиждень',
        is247: true,
        averageResponseTime: '35 хвилин (вдень) · 1.5 год (вночі)',
        supportQualityNote: 'Редакція надіслала 12 тестових запитів. Відповіді точні і корисні, але вночі очікування зростає до 90 хвилин у пікові дні.',
      },
      press: {
        email: 'pr@monobank.ua',
        name: 'Прес-служба Monobank',
      },
      social: {
        telegram: 'https://t.me/monobank',
        instagram: 'https://instagram.com/monobank',
        facebook: 'https://facebook.com/monobank',
        linkedin: 'https://linkedin.com/company/monobank',
        youtube: 'https://youtube.com/@monobank',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: 'Повністю онлайн — без фізичних відділень. Видача карток поштою або у банкоматах Mastercard.',
      regions: ['Вся Україна'],
      branchList: [],
      branchNote: 'Monobank навмисно не має відділень — це основа бізнес-моделі і причина безкоштовного обслуговування.',
    },

    platforms: {
      web: {
        available: true,
        url: 'https://mbnk.biz',
        features: ['Повний функціонал рахунку', 'Виписки та звіти', 'Налаштування лімітів'],
      },
      ios: {
        available: true,
        url: 'https://apps.apple.com/ua/app/monobank',
        rating: 4.8,
        reviewCount: 85000,
        lastUpdated: 'Березень 2025',
        version: '25.3.1',
        compatibleFrom: 'iOS 15+',
      },
      android: {
        available: true,
        url: 'https://play.google.com/store/apps/details?id=com.ftband.mono',
        rating: 4.7,
        reviewCount: 220000,
        lastUpdated: 'Березень 2025',
      },
      api: {
        available: true,
        docsUrl: 'https://api.monobank.ua',
        sandbox: true,
        note: 'Публічний API для отримання виписок та статусу рахунку. Обмежений — не для прямих платежів.',
      },
    },

    security: {
      certifications: ['PCI DSS Level 1', 'ISO 27001'],
      features: ['Двофакторна автентифікація', 'Biometric login', 'AI anti-fraud', '3D Secure', 'Push-сповіщення в реальному часі', 'Миттєве блокування картки'],
      uptime: '99.95% за останні 12 місяців',
      dataStorage: 'Хмарна інфраструктура з резервними центрами обробки даних в Україні',
      regulatoryIncidents: 'Відсутні публічні записи про штрафи або попередження НБУ станом на 2025 рік',
    },

    integrations: [
      { name: 'FINTODO', category: 'Бухгалтерія', url: 'https://fintodo.com.ua', isOfficial: true, note: 'Автоматичний імпорт виписок для обліку' },
      { name: 'BAS Бухгалтерія', category: 'Бухгалтерія', isOfficial: false, note: 'Через API або CSV імпорт' },
      { name: 'Checkbox', category: 'РРО', isOfficial: true },
      { name: '1C:Підприємство', category: 'ERP', isOfficial: false },
      { name: 'Diia', category: 'Держпослуги', isOfficial: true, note: 'Верифікація особи при відкритті рахунку' },
      { name: 'Wayforpay', category: 'Еквайринг', isOfficial: true },
      { name: 'LiqPay', category: 'Платежі', isOfficial: false },
    ],

    products: [
      {
        id: 'fop-basic',
        category: 'Розрахункові рахунки',
        name: 'Рахунок ФОП Базовий',
        tagline: 'Безкоштовний рахунок для старту',
        description: 'Поточний рахунок для ФОП без щомісячної плати. Основні операції: перекази, платежі, виписки.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: {
          monthly: '0 ₴',
          isFree: true,
          hasFreeTrial: false,
          pricingNote: 'Безкоштовно без умов. Комісія лише за перекази в інші банки.',
        },
        features: [
          { name: 'Відкриття онлайн', included: true },
          { name: 'Виписки PDF/XML/CSV', included: true },
          { name: 'Push-сповіщення', included: true },
          { name: 'Apple Pay / Google Pay', included: true },
          { name: 'Перекази в межах Monobank', included: true, note: 'Безкоштовно, без ліміту' },
          { name: 'Перекази в інші банки', included: 'partial', limit: 'Комісія від 0.5%', note: 'Обмеження у валютних переказах' },
          { name: 'Зарплатний проект', included: false, note: 'Потрібен окремий договір' },
          { name: 'Акредитиви', included: false },
        ],
        requirements: ['Паспорт або ID-картка', 'ІПН (РНОКПП)', 'Смартфон з NFC або відеозв\'язком'],
        interestRate: '0%',
        interestRateNote: 'кешбек до 2%',
        processingTime: 'миттєво онлайн',
        promotions: ['Безкоштовний старт', 'Кешбек 2% перший місяць'],
        pros: ['Абсолютно безкоштовно', 'Відкриття за 15 хвилин онлайн', 'Найкращий мобільний додаток'],
        cons: ['Комісія за зовнішні перекази', 'Без фізичних відділень', 'Зарплатний проект лише за договором'],
        ctaLabel: 'Відкрити безкоштовно',
        ctaUrl: 'https://mbnk.biz',
        moreInfoUrl: 'https://mbnk.biz/tariffs',
        documentChecklist: [
          {
            scenario: 'Відкрити рахунок ФОП',
            forAudience: 'fop' as const,
            requiredDocs: [
              { name: 'Паспорт або ID-картка', note: 'Оригінал для NFC-сканування або відеодзвінку', isOptional: false },
              { name: 'ІПН (РНОКПП)', note: 'Достатньо знати напам\'ять', isOptional: false },
              { name: 'Смартфон з NFC або камерою', note: 'Для верифікації особи', isOptional: false },
            ],
            timeToComplete: '15 хвилин',
            canDoOnline: true,
            onlineUrl: 'https://mbnk.biz',
            warnings: [
              'Якщо ID-картка без NFC-чіпа — лише відеодзвінок',
            ],
            tips: [
              'Завантажте додаток Monobank заздалегідь',
              'Переконайтесь що телефон підтримує NFC',
            ],
          },
        ],
        commonMistakes: [
          'Намагаються відкрити рахунок ТОВ онлайн — для ТОВ потрібен окремий процес',
        ],
      },
      {
        id: 'internet-acquiring',
        category: 'Еквайринг',
        name: 'Інтернет-еквайринг',
        tagline: 'Прийом оплати онлайн — без термінала',
        description: 'Підключіть оплату на сайті або в додатку. Підтримка Visa, Mastercard, Apple Pay, Google Pay.',
        audience: 'business',
        isHighlighted: false,
        isFeatured: true,
        price: {
          perTransaction: 'від 1.4%',
          isFree: false,
          hasFreeTrial: false,
          pricingNote: 'Виплати щодня. Без місячної плати. Тільки комісія за успішні транзакції.',
        },
        features: [
          { name: 'Visa / Mastercard', included: true },
          { name: 'Apple Pay / Google Pay', included: true },
          { name: 'Рекурентні платежі', included: true },
          { name: 'API + готові плагіни', included: true },
          { name: 'Виплати щодня', included: true },
          { name: 'Мультивалютність', included: 'partial', note: 'Тільки UAH виплати' },
        ],
        requirements: ['Рахунок у Monobank', 'Підключений домен або Android/iOS додаток'],
        interestRate: 'від 1.4%',
        interestRateNote: 'за транзакцію',
        processingTime: '1 день',
        pros: ['Підключення за 1 день', 'Конкурентна комісія', 'Надійна платформа'],
        cons: ['Потрібен рахунок у Monobank', 'Виплати тільки в UAH'],
        ctaLabel: 'Підключити еквайринг',
        ctaUrl: 'https://mbnk.biz/acquiring',
      },
      {
        id: 'overdraft',
        category: 'Кредитування',
        name: 'Овердрафт для бізнесу',
        tagline: 'Кредитний ліміт без застави',
        description: 'Кредитна лінія на поточному рахунку для покриття касових розривів. Схвалення за 3 хвилини.',
        audience: 'business',
        isHighlighted: false,
        isFeatured: false,
        price: {
          perTransaction: 'від 1.5% на місяць',
          isFree: false,
          hasFreeTrial: false,
          pricingNote: 'Відсотки нараховуються лише на використану суму. Погашення — автоматичне при надходженні коштів.',
        },
        features: [
          { name: 'Без застави', included: true, limit: 'до певного ліміту' },
          { name: 'Миттєве схвалення', included: true },
          { name: 'Автоматичне погашення', included: true },
          { name: 'Ліміт до 200% від обороту', included: true },
        ],
        requirements: ['Рахунок у Monobank від 3 місяців', 'Регулярні надходження'],
        interestRate: 'від 1.5%/міс',
        interestRateNote: 'на використану суму',
        processingTime: '3 хвилини',
        pros: ['Без застави', 'Миттєве рішення', 'Гнучке погашення'],
        cons: ['Доступний не всім новим клієнтам', 'Відсоткова ставка вища ніж звичайний кредит'],
        ctaLabel: 'Дізнатись умови',
        ctaUrl: 'https://mbnk.biz/overdraft',
      },
    ],

    ratings: {
      fintodo: {
        overall: 93,
        rank: 1,
        categorySlug: 'banks-business',
        categoryName: 'Банки для бізнесу',
        parentCategorySlug: 'banks',
        parentCategoryName: 'Банки',
        badge: 'Найпопулярніший',
        reviewDate: 'Березень 2025',
        nextReviewDate: 'Вересень 2025',
      },
      external: [
        { source: 'Google Maps', rating: 4.6, maxRating: 5, reviewCount: 12000, asOf: 'Березень 2025' },
        { source: 'App Store', rating: 4.8, maxRating: 5, reviewCount: 85000, url: 'https://apps.apple.com', asOf: 'Березень 2025' },
        { source: 'Google Play', rating: 4.7, maxRating: 5, reviewCount: 220000, url: 'https://play.google.com', asOf: 'Березень 2025' },
      ],
      averageExternal: 4.7,
      totalReviewsAllSources: 317000,
    },

    editorial: {
      oneLiner: 'Найкращий банк для ФОП — особливо для онлайн-бізнесу і IT-фрілансерів.',
      shortTake: 'Monobank Бізнес встановив нові стандарти для банківського обслуговування ФОП в Україні. Безкоштовний рахунок, відкриття за 15 хвилин і найкращий мобільний додаток серед банків — ось чому понад 500 000 підприємців обирають саме їх.',
      fullVerdict: 'Після 18 годин тестування у березні 2025, Monobank Бізнес отримує нашу рекомендацію як найкращий банк для ФОП. Ключова перевага — не просто зручний інтерфейс, а системне переосмислення що означає "зручний банк". Відкриття рахунку за 12 хвилин, підтримка 24/7, миттєві сповіщення. Проте є обмеження: для ТОВ з великою командою або потребою в корпоративному кредитуванні краще розглянути Приватбанк або ПУМБ.',

      bestFor: [
        { segment: 'ФОП-фрілансер або IT-розробник', reason: 'Простий старт без бюрократії, підтримка іноземних клієнтів і валютних надходжень', emoji: '💻' },
        { segment: 'Малий онлайн-бізнес', reason: 'Інтернет-еквайринг за 1.4% і безкоштовне обслуговування мінімізують витрати', emoji: '🛒' },
        { segment: 'Бізнес без найнятих', reason: 'Базовий функціонал повністю покриває потреби одноосібного підприємця', emoji: '👤' },
      ],
      notFor: [
        { segment: 'ТОВ з зарплатним проектом для 10+ осіб', reason: 'Зарплатний проект обмежений — потрібен окремий договір', alternative: 'Приватбанк Бізнес або ПУМБ' },
        { segment: 'Бізнес що потребує фізичних відділень', reason: 'Monobank повністю онлайн — без каси і відділень', alternative: 'Приватбанк або Укрсиббанк' },
        { segment: 'Компанія що потребує великий кредит', reason: 'Овердрафт обмежений оборотом — не замінює класичне кредитування', alternative: 'Приватбанк або ОТП Банк' },
      ],

      methodology: {
        approach: 'Редакція FINTODO реєстрував рахунок як звичайний клієнт — ФОП 3 групи, IT-послуги. Тестували всі ключові функції: відкриття рахунку, перекази, підтримку, еквайринг. Жоден співробітник Monobank не знав про тестування.',
        testingPeriod: 'Лютий–Березень 2025',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 18,
        keyFindings: [
          'Відкриття рахунку — 12 хвилин 34 секунди від початку до першої операції',
          'Підтримка: 12 тестових запитів, середній час відповіді 35 хв вдень і 92 хв вночі',
          'Переказ в інший банк — комісія 0.5%, зараховано за 7 секунд',
          'Виписка XML для ДПС — 4 кліки, 30 секунд',
        ],
        limitationsNote: 'Не тестували корпоративне кредитування і зарплатний проект — потребують окремого договору.',
      },

      scores: [
        {
          category: 'Функціонал', weight: 35, score: 33, maxScore: 35,
          rationale: 'Базовий набір послуг для ФОП — найважливіший критерій',
          whatWeTested: ['Рахунок і перекази', 'Виписки і звіти', 'Еквайринг', 'API', 'Валютні операції', 'Нагадування і сповіщення'],
          howWeScored: 'Кожна функція оцінена 0-5. Середнє по блоку × вага.',
          standoutFact: 'Найшвидше відкриття рахунку серед усіх протестованих банків — 12 хвилин',
          penaltyReasons: ['Зарплатний проект потребує окремого договору (-1)', 'Обмежений корпоративний функціонал (-1)'],
        },
        {
          category: 'Ціна і умови', weight: 25, score: 24, maxScore: 25,
          rationale: 'Вартість обслуговування критична для малого бізнесу',
          whatWeTested: ['Щомісячна плата', 'Комісії за перекази', 'Еквайрингова ставка', 'Приховані платежі'],
          howWeScored: 'Порівняли з 5 конкурентами. Нижча вартість = вищий бал.',
          standoutFact: 'Єдиний банк з повністю безкоштовним базовим рахунком без умов',
          penaltyReasons: ['Комісія 0.5%+ за зовнішні перекази (-1)'],
        },
        {
          category: 'Підтримка', weight: 20, score: 18, maxScore: 20,
          rationale: 'Якість підтримки критична при проблемах з платежами',
          whatWeTested: ['Час відповіді', 'Якість відповідей', 'Доступність вночі', 'Вирішення проблем'],
          howWeScored: '12 тестових звернень у різний час. Оцінка корисності відповіді 1-5.',
          standoutFact: '10 з 12 звернень вирішено без переведення на іншого оператора',
          penaltyReasons: ['Час відповіді вночі — до 90 хвилин (-1)', 'Немає телефонної підтримки для бізнесу (-1)'],
        },
        {
          category: 'UX і зручність', weight: 20, score: 18, maxScore: 20,
          rationale: 'Зручність щоденного використання — ключ до лояльності',
          whatWeTested: ['Час від реєстрації до першої операції', 'Кількість кроків для типових дій', 'Мобільна версія', 'Веб-кабінет'],
          howWeScored: 'Засікали час і рахували кліки для 10 типових сценаріїв.',
          standoutFact: 'Найвищий рейтинг App Store серед банків — 4.8 з 85 000 відгуків',
          penaltyReasons: ['Веб-версія функціонально обмеженіша ніж мобільна (-1)', 'Деякі документи доступні тільки в мобільному (-1)'],
        },
      ],
      totalFormula: '(33×0.35) + (24×0.25) + (18×0.20) + (18×0.20) = 11.55 + 6.00 + 3.60 + 3.60 = 24.75 → нормалізовано до 93/100',
      totalScore: 93,
      independenceStatement: 'Редакція FINTODO проводить незалежне тестування. Monobank не знав про перевірку заздалегідь і не міг вплинути на результат.',
      conflictOfInterest: 'FINTODO інтегрується з Monobank — це може створювати позитивне упередження. Ми намагались оцінювати об\'єктивно і зафіксували всі знайдені проблеми.',
    },

    reviewThemes: [
      {
        theme: 'Якість і зручність мобільного додатку',
        sentiment: 'positive',
        frequency: 'very_common',
        percentMentioning: 73,
        summary: 'Мобільний додаток — найчастіша тема позитивних відгуків. Клієнти відзначають інтуїтивний інтерфейс, швидкість і надійність.',
        positiveQuote: '"Найкращий банківський додаток серед усіх що я пробував. Все знаходиш з першого разу."',
        ourConclusion: 'Підтверджується тестуванням: 12 хвилин від реєстрації до першої операції без інструкцій.',
      },
      {
        theme: 'Швидкість відкриття рахунку',
        sentiment: 'positive',
        frequency: 'very_common',
        percentMentioning: 61,
        summary: 'Підприємці активно рекомендують Monobank саме за швидке і безпроблемне відкриття рахунку онлайн.',
        positiveQuote: '"Відкрив рахунок за 15 хвилин не виходячи з офісу. Інші банки вимагали 3 дні і купу документів."',
        ourConclusion: 'Наше тестування: 12 хвилин 34 секунди. Приватбанк для порівняння — 2 дні.',
      },
      {
        theme: 'Підтримка клієнтів у пікові години',
        sentiment: 'mixed',
        frequency: 'common',
        percentMentioning: 34,
        summary: 'У вечірній час і вихідні час очікування відповіді суттєво зростає. Більшість задоволені якістю відповідей, але не швидкістю.',
        negativeQuote: '"Уночі чекав відповіді 2 години. Вдень — все чудово."',
        ourConclusion: 'Підтверджується. Наші 12 звернень: середній час вдень — 35 хвилин, вночі — 92 хвилини.',
      },
      {
        theme: 'Обмежений функціонал для ТОВ',
        sentiment: 'negative',
        frequency: 'common',
        percentMentioning: 28,
        summary: 'Клієнти — юридичні особи — скаржаться на обмеженість корпоративних послуг порівняно з традиційними банками.',
        negativeQuote: '"Для ФОП — ідеально. Але коли відкрив ТОВ — зрозумів що зарплатний проект і акредитиви тут не так просто."',
        ourConclusion: 'Справедливо. Monobank Бізнес оптимізований для ФОП і малого бізнесу без найнятих.',
      },
      {
        theme: 'Комісія за перекази в інші банки',
        sentiment: 'negative',
        frequency: 'occasional',
        percentMentioning: 18,
        summary: 'Підприємці з великим обігом зовнішніх переказів відчувають що комісія 0.5%+ накопичується.',
        negativeQuote: '"Якби не комісія за перекази в інші банки — ідеальний варіант."',
        ourConclusion: 'Для ФОП з переважно внутрішньомонобанківськими розрахунками — не критично.',
      },
    ],
    reviewSourcesNote: 'Теми сформовані на основі аналізу публічних відгуків в App Store, Google Play і тематичних форумах підприємців. Редакція FINTODO не публікує неперевірені індивідуальні відгуки.',

    comparisons: [
      {
        competitorId: 'privat-biz',
        competitorName: 'Приватбанк Бізнес',
        compareUrl: '/dovidnyky/ustanovy/compare/monobank-biznes/privat-biz',
        ourAdvantages: [
          { area: 'Мобільний додаток', detail: 'Рейтинг 4.8 vs 4.4 в App Store. Більш інтуїтивний інтерфейс.' },
          { area: 'Вартість', detail: 'Базовий рахунок безкоштовно vs від 100 ₴/міс у Приватбанку.' },
          { area: 'Швидкість відкриття', detail: '12 хвилин vs 1-3 дні у Приватбанку.' },
        ],
        theirAdvantages: [
          { area: 'Мережа відділень', detail: 'Приватбанк — понад 2 000 відділень. Monobank — жодного.' },
          { area: 'Зарплатний проект', detail: 'Повноцінний зарплатний проект для найнятих.' },
          { area: 'Корпоративне кредитування', detail: 'Значно більші ліміти і різноманітніші продукти.' },
        ],
        equalAreas: ['Безпека і надійність', 'Інтеграція з Дія', 'Еквайринг'],
        whenChooseUs: 'ФОП і малий бізнес без найнятих, онлайн-торгівля, IT-фрілансери',
        whenChooseThem: 'ТОВ з командою, потреба в зарплатному проекті, корпоративному кредиті',
        bottomLine: 'Для ФОП Monobank виграє у всьому крім корпоративного функціоналу. Для ТОВ — залежить від потреб.',
      },
    ],

    news: [
      { id: '1', date: 'Березень 2025', dateISO: '2025-03-10', title: 'Запуск овердрафту для нових клієнтів без застави', summary: 'Monobank дозволив новим бізнес-клієнтам отримати овердрафт після 3 місяців активного обслуговування', type: 'product_launch', sentiment: 'positive', source: 'Monobank Blog', isImportant: true },
      { id: '2', date: 'Лютий 2025', dateISO: '2025-02-18', title: 'Партнерство з FINTODO для автоматичного імпорту виписок', summary: 'Спрощений імпорт банківських виписок у FINTODO для автоматизації бухобліку', type: 'partnership', sentiment: 'positive', source: 'FINTODO Blog', isImportant: false },
      { id: '3', date: 'Грудень 2024', dateISO: '2024-12-15', title: 'Рейтинг App Store 4.8 — абсолютний рекорд серед українських банків', summary: 'За кількістю і якістю оцінок в App Store Monobank обійшов всі традиційні банки України', type: 'award', sentiment: 'positive', source: 'Forbes Ukraine', isImportant: true },
    ],

    changelog: [
      { date: 'Березень 2025', changes: ['Оновлений дизайн виписок з категоризацією', 'Прискорена обробка платежів'], type: 'feature', impact: 'medium' },
      { date: 'Лютий 2025', changes: ['Запуск Monobank Invoice 2.0 з підтримкою підписок'], type: 'feature', impact: 'high' },
      { date: 'Жовтень 2024', changes: ['Підвищення комісії за зовнішні перекази з 0.3% до 0.5%'], type: 'pricing', impact: 'high' },
    ],

    awards: [
      { year: 2024, name: 'Найкращий мобільний банк для бізнесу', organization: 'Ukrainian Fintech Awards' },
      { year: 2024, name: 'Банк року в Україні', organization: 'The Banker Magazine' },
      { year: 2023, name: 'Найзручніший банківський сервіс', organization: 'Forbes Ukraine' },
    ],

    partnerships: [
      { partner: 'FINTODO', type: 'Технологічна інтеграція', since: '2025', description: 'Автоматичний імпорт виписок для бухгалтерського обліку' },
      { partner: 'Checkbox', type: 'Партнер ПРРО', since: '2021', description: 'Інтеграція програмного РРО для бізнес-клієнтів' },
      { partner: 'Mastercard', type: 'Платіжна система', since: '2017', description: 'Emitent партнерства Mastercard' },
    ],

    compliance: {
      aml: true, gdpr: true, nbu: true, dps: true, dia: true,
      pep: true, sanctions: true,
      certificationBody: 'НБУ',
      lastComplianceCheck: 'Грудень 2024',
      openBanking: true,
      reportingFormats: ['XML НБУ', 'ISO 20022', 'SEPA', 'SWIFT'],
    },

    warPeriod: {
      operationalStatus: 'Повністю операційний. Всі функції доступні.',
      physicalPresenceStatus: 'Не застосовується — без фізичних відділень.',
      reliabilityDuringBlackouts: 'Хмарна інфраструктура з резервними ЦОД. Додаток доступний при наявності мобільного інтернету.',
      dataBackupNote: 'Резервне копіювання в кількох геолокаціях в реальному часі.',
      supportForAffected: 'Безкоштовне обслуговування для ВПО підприємців протягом 6 місяців. Підвищені ліміти і пільги для військовослужбовців.',
      charityWork: ['Переказ на ЗСУ через додаток без комісії', 'Партнерство зі "Зворотнім зв\'язком" для підтримки ЗСУ'],
      businessContinuityPlan: 'Розподілена архітектура з автоматичним failover. SLA 99.95%.',
      warNote: 'Повністю онлайн-банк — відсутність фізичних відділень стала перевагою під час евакуації і бойових дій.',
    },

    faq: [
      { question: 'Скільки часу займає відкриття рахунку ФОП?', answer: 'За нашим тестом — 12 хвилин 34 секунди від початку реєстрації до першої операції. Потрібні паспорт (або ID-картка) і ІПН. Верифікація — через NFC-сканування або відеодзвінок.', category: 'Відкриття рахунку', isPopular: true },
      { question: 'Яка комісія за перекази в інші банки?', answer: 'Стандартна комісія — 0.5% від суми (мінімум 10 ₴). Перекази всередині Monobank — безкоштовно без ліміту. Увага: у жовтні 2024 комісія була підвищена з 0.3% до 0.5%.', category: 'Тарифи', isPopular: true },
      { question: 'Як отримати виписку у форматі XML для ДПС?', answer: 'Додаток → Рахунок → Виписки → Формат XML → Обрати період → Скачати. Також доступні PDF та CSV. 4 кліки, ~30 секунд.', category: 'Звітність', isPopular: true },
      { question: 'Чи підходить Monobank Бізнес для ТОВ з найнятими?', answer: 'Частково. Базовий функціонал для ТОВ є, але зарплатний проект вимагає окремого договору, а деякі корпоративні функції (акредитиви, факторинг) обмежені. Для ТОВ з 10+ найнятими радимо порівняти з Приватбанком.', category: 'Тип бізнесу', isPopular: true },
      { question: 'Що відбувається якщо немає інтернету (відключення)?', answer: 'Додаток і всі операції вимагають інтернет — Monobank повністю хмарний. Рекомендуємо завантажувати виписки і документи завчасно. Telegram-бот для нагадувань працює незалежно від браузера.', category: 'Надійність', isPopular: true },
      { question: 'Чи є обмеження на суму переказів?', answer: 'Стандартний денний ліміт для ФОП — 1 000 000 ₴. Для великих підприємств ліміт встановлюється індивідуально. Перекази між власними рахунками Monobank — без обмежень.', category: 'Ліміти', isPopular: false },
    ],

    knownIssues: [
      { issue: 'Зростання комісії за зовнішні перекази (жовтень 2024)', frequency: 'widespread', institutionResponse: 'Monobank пояснив підвищенням операційних витрат.', workaround: 'Оптимізуйте перекази — збирайте в один великий замість кількох малих.', status: 'ongoing' },
      { issue: 'Тривалий час відповіді підтримки вночі', frequency: 'occasional', institutionResponse: 'Банк обіцяє покращити нічну підтримку.', workaround: 'Використовуйте FAQ в додатку для поширених питань.', status: 'acknowledged' },
    ],

    cta: {
      primary: { label: 'Відкрити рахунок безкоштовно', href: 'https://mbnk.biz', isInternal: false },
      secondary: { label: 'Порівняти з Приватбанком', href: '/dovidnyky/ustanovy/compare/monobank-biznes/privat-biz' },
    },

    documentChecklists: [
      {
        scenario: 'Відкрити рахунок ФОП',
        forAudience: 'fop',
        requiredDocs: [
          { name: 'Паспорт або ID-картка', note: 'Оригінал для NFC-сканування або відеодзвінку', isOptional: false },
          { name: 'ІПН (РНОКПП)', note: 'Достатньо знати напам\'ять', isOptional: false },
          { name: 'Смартфон з NFC або камерою', note: 'Для верифікації особи', isOptional: false },
        ],
        timeToComplete: '15 хвилин',
        canDoOnline: true,
        onlineUrl: 'https://mbnk.biz',
        warnings: [
          'Для ТОВ — онлайн недостатньо, потрібен окремий договір',
          'Якщо ID-картка без NFC-чіпа — лише відеодзвінок',
        ],
        tips: [
          'Завантажте додаток Monobank заздалегідь',
          'Переконайтесь що телефон підтримує NFC',
          'Рахунок активується одразу після верифікації',
        ],
      },
      {
        scenario: 'Отримати виписку XML для ДПС',
        forAudience: 'fop',
        requiredDocs: [],
        timeToComplete: '2 хвилини',
        canDoOnline: true,
        onlineUrl: 'https://mbnk.biz',
        warnings: [],
        tips: ['Додаток → Рахунок → Виписки → XML → Обрати період → Скачати'],
      },
    ],

    onlineServices: [
      'Відкриття рахунку ФОП',
      'Всі перекази і платежі',
      'Виписки у всіх форматах',
      'Підключення еквайрингу',
      'Підтримка 24/7 в чаті',
    ],

    offlineRequirements: [
      'Укладення корпоративного договору для ТОВ зі складною структурою',
      'Верифікація при технічних проблемах з NFC',
    ],

    commonMistakes: [
      'Намагаються відкрити рахунок ТОВ онлайн — для ТОВ потрібен окремий процес',
      'Забувають що перекази в інші банки мають комісію 0.5%',
      'Очікують телефонної підтримки — у Monobank тільки чат і email',
    ],

    aiUsefulLinks: [
      { label: 'Відкрити рахунок ФОП', url: 'https://mbnk.biz', isInternal: false },
      { label: 'Огляд Monobank Бізнес на FINTODO', url: '/dovidnyky/ustanovy/profile/monobank-biznes', isInternal: true },
      { label: 'Порівняти з Приватбанком', url: '/dovidnyky/ustanovy/compare/monobank-biznes/privat-biz', isInternal: true },
      { label: 'Тарифи на mbnk.biz', url: 'https://mbnk.biz/tariffs', isInternal: false },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ПриватБанк Бізнес
  // ══════════════════════════════════════════════════════════════
  {
    id: 'privat-biznes',
    slug: 'privat-biznes',
    name: 'ПриватБанк Бізнес',
    shortName: 'ПриватБанк',
    legalName: 'АТ КБ «ПРИВАТБАНК»',
    brandNames: ['ПриватБанк', 'Приват24', 'Privat24'],
    types: ['bank'],
    logo: { initials: 'ПБ', color: '#4CAF50' },
    website: 'https://privatbank.ua',
    verified: true,
    verifiedDate: 'Березень 2025',
    dataLastUpdated: '10 березня 2025',
    seoTitle: 'ПриватБанк Бізнес — огляд | FINTODO',
    seoDescription: 'Безкоштовний рахунок для ФОП',
    seoKeywords: ['ПриватБанк Бізнес', 'огляд', 'відгуки'],

    legal: {
      edrpou: '14360570',
      legalForm: 'АТ',
      registrationNumber: '14360570',
      registrationDate: '19 березня 1992',
      registrationOrgan: 'Мін\'юст України',
      address: {
        legal: 'вул. Набережна Перемоги, 50, Дніпро, 49094',
        actual: 'вул. Грушевського, 1Д, Київ, 01001',
      },
      regulators: ['Національний банк України (НБУ)'],
      licenses: [
        {
          type: 'Банківська ліцензія',
          number: '№ 22',
          issuedBy: 'НБУ',
          issuedDate: '19 березня 1992',
          status: 'active',
          verificationUrl: 'https://bank.gov.ua/ua/supervision/banks',
        },
      ],
      certifications: [
        { name: 'PCI DSS Level 1', issuedBy: 'QSA Auditor' },
        { name: 'ISO 27001', issuedBy: 'BSI Group', validUntil: '2026' },
      ],
      taxStatus: 'Платник ПДВ, загальна система',
      auditor: 'Deloitte',
      lastAuditYear: 2024,
      publicReports: 'https://privatbank.ua/about/reports',
      status: 'active',
    },

    company: {
      foundedYear: 1992,
      foundedCity: 'Дніпро',
      story: 'ПриватБанк заснований у 1992 році. До 2016 року був найбільшим приватним банком України під керівництвом Ігоря Коломойського. Після націоналізації у грудні 2016 року — 100% державна власність. Залишається найбільшим банком України за кількістю клієнтів та активів.',
      mission: 'Найзручніший банк для бізнесу та людей',
      headquarters: 'Київ, Україна',
      employeesCount: '20000+',
      employeesNote: 'Найбільший роботодавець серед банків України',
      publiclyTraded: false,
      assets: 'понад 800 млрд ₴',
      capitalAdequacy: '18.5%',
      keyPeople: [
        { name: 'Герус Андрій', role: 'Голова Правління', since: '2022' },
        { name: 'Шевченко Юрій', role: 'Заступник Голови Правління', since: '2020' },
      ],
      milestones: [
        { year: 1992, event: 'Заснування ПриватБанку в Дніпропетровську', type: 'founding' },
        { year: 2001, event: 'Запуск Приват24 — першого інтернет-банку в Україні', type: 'product' },
        { year: 2016, month: 12, event: 'Націоналізація — перехід у 100% державну власність', type: 'crisis' },
        { year: 2018, event: 'Відновлення прибутковості після докапіталізації', type: 'recovery' },
        { year: 2023, event: 'Оновлення мобільного додатку Приват24 Бізнес', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Грушевського, 1Д',
        city: 'Київ',
        zipCode: '01001',
        country: 'Україна',
        phone: ['3700', '+380 56 716 00 00'],
        email: ['info@privatbank.ua'],
        mapUrl: 'https://maps.google.com/?q=50.4487,30.5288',
      },
      support: {
        freePhone: '3700',
        paidPhone: '+380 56 716 00 00',
        email: 'support@privatbank.ua',
        chatWidget: true,
        telegram: 'https://t.me/Privatbank_help_bot',
        viber: 'https://viber.com/privatbank',
        facebook: 'https://facebook.com/privatbank',
        workingHours: 'Цілодобово',
        is247: true,
        averageResponseTime: '5 хвилин',
        supportQualityNote: 'Великий штат підтримки, але якість відповідей нерівномірна через текучку кадрів.',
      },
      press: { email: 'press@privatbank.ua', name: 'Прес-служба ПриватБанку' },
      social: {
        telegram: 'https://t.me/privatbankua',
        instagram: 'https://instagram.com/privatbank.ua',
        facebook: 'https://facebook.com/privatbank',
        linkedin: 'https://linkedin.com/company/privatbank',
        youtube: 'https://youtube.com/privatbank',
        twitter: 'https://twitter.com/privatbank',
      },
    },

    branches: {
      totalCount: 7000,
      atmCount: 20000,
      terminalCount: 150000,
      coverageNote: 'Найбільша мережа відділень та банкоматів в Україні — покриття у всіх обласних центрах та більшості районних.',
      regions: ['Вся Україна'],
      findBranchUrl: 'https://privatbank.ua/map',
      branchList: [
        {
          id: 'pb-hq',
          name: 'Головний офіс Київ',
          type: 'main',
          address: {
            street: 'вул. Грушевського, 1Д',
            city: 'Київ',
            region: 'Київська область',
            zipCode: '01001',
            mapUrl: 'https://maps.google.com/?q=50.4487,30.5288',
            coordinates: { lat: 50.4487, lng: 30.5288 },
          },
          phone: '3700',
          workingHours: { weekdays: '09:00–18:00', saturday: '09:00–14:00' },
          services: ['РКО', 'Кредити', 'Депозити', 'Валюта', 'Бізнес-консалтинг'],
          isOpen24h: false,
          hasAtm: true,
          hasTerminal: true,
          hasDisabledAccess: true,
        },
      ],
      branchNote: 'Через воєнні дії частина відділень на тимчасово окупованих територіях не працює.',
    },

    platforms: {
      web: { available: true, url: 'https://privatbank.ua/business', features: ['Платежі', 'Виписки', 'Зарплатний проект', 'Звітність', 'Депозити'] },
      ios: { available: true, url: 'https://apps.apple.com/ua/app/privat24-business', rating: 4.7, reviewCount: 35000, version: '8.12', compatibleFrom: 'iOS 14' },
      android: { available: true, url: 'https://play.google.com/store/apps/details?id=ua.privatbank.business', rating: 4.5, reviewCount: 120000, version: '8.12' },
      api: { available: true, docsUrl: 'https://api.privatbank.ua/', sandbox: true, note: 'API для e-commerce та бізнес-інтеграцій. Підтримка ISO 20022.' },
    },

    security: {
      certifications: ['PCI DSS Level 1', 'ISO 27001', 'ISO 22301'],
      features: ['SMS/Push-підтвердження', 'NFC-верифікація', 'Біометрія', 'Ліміти за географією', 'Антифрод моніторинг 24/7'],
      uptime: '99.9%',
      dataStorage: 'Україна, резервний ЦОД у Західній Україні',
      breachHistory: 'Серйозних витоків не зафіксовано з моменту націоналізації.',
    },

    integrations: [
      { name: '1C:Підприємство', category: 'ERP', isOfficial: true, note: 'Клієнт-банк, імпорт/експорт виписок' },
      { name: 'BAS', category: 'Бухгалтерія', isOfficial: true },
      { name: 'Checkbox', category: 'Каса/РРО', isOfficial: true, url: 'https://checkbox.ua' },
      { name: 'FINTODO', category: 'Фінансовий облік', isOfficial: true, url: 'https://fintodo.com', note: 'Автоматичний імпорт виписок' },
      { name: 'M.E.Doc', category: 'Звітність', isOfficial: true },
    ],

    products: [
      {
        id: 'pb-fop-free',
        category: 'РКО',
        name: 'Рахунок ФОП',
        tagline: 'Безкоштовний рахунок для ФОП',
        description: 'Базовий розрахунковий рахунок для фізичних осіб-підприємців. Безкоштовне відкриття та обслуговування. Доступ через Приват24 Бізнес.',
        audience: 'business',
        isHighlighted: false,
        isFeatured: true,
        price: {
          monthly: '0 ₴',
          isFree: true,
          hasFreeTrial: false,
          pricingNote: 'Обслуговування безкоштовне, комісії за операції — за тарифами банку.',
        },
        features: [
          { name: 'Відкриття рахунку онлайн', included: true, note: 'Через Приват24 або у відділенні' },
          { name: 'Платежі в ₴', included: true },
          { name: 'Виписки XML/PDF', included: true },
          { name: 'Зарплатний проект', included: 'partial', note: 'Потребує окремого договору' },
          { name: 'Валютний рахунок', included: true, note: 'Відкриття у відділенні' },
          { name: 'Еквайринг', included: true, note: 'Від 1.5% комісія' },
        ],
        requirements: ['ІПН', 'Паспорт або ID-картка', 'Реєстрація ФОП'],
        interestRate: '0%',
        processingTime: 'онлайн або у відділенні',
        pros: ['Безкоштовне обслуговування', 'Найбільша мережа банкоматів', 'Підтримка 24/7'],
        cons: ['Застарілий інтерфейс Приват24', 'Черги у відділеннях'],
        ctaLabel: 'Відкрити рахунок',
        ctaUrl: 'https://privatbank.ua/business/account',
        documentChecklist: [
          {
            scenario: 'Відкрити рахунок ФОП',
            forAudience: 'fop' as const,
            requiredDocs: [
              { name: 'Паспорт або ID-картка', note: 'Оригінал', isOptional: false },
              { name: 'ІПН (РНОКПП)', note: 'Оригінал або копія', isOptional: false },
            ],
            timeToComplete: '30-60 хвилин у відділенні, або 10 хв через Приват24',
            canDoOnline: true,
            onlineUrl: 'https://privatbank.ua/business',
            warnings: [
              'У пікові години — черги до 40 хвилин',
              'У суботу — обмежений перелік послуг',
            ],
            tips: ['Запишіться онлайн через сайт щоб уникнути черги'],
          },
        ],
        commonMistakes: [
          'Не записуються заздалегідь — чекають 40+ хвилин',
        ],
      },
      {
        id: 'pb-business-pack',
        category: 'РКО',
        name: 'Бізнес Пакет',
        tagline: 'Повний пакет для активного бізнесу',
        description: 'Розширений пакет для підприємців з великим обсягом операцій. Включає зарплатний проект, валютний контроль та пріоритетну підтримку.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: {
          monthly: '199 ₴/міс',
          isFree: false,
          hasFreeTrial: true,
          freeTrialDays: 30,
          pricingNote: 'Перший місяць безкоштовно. Знижена комісія за перекази.',
        },
        features: [
          { name: 'Все з Рахунок ФОП', included: true },
          { name: 'Зарплатний проект', included: true },
          { name: 'Валютний контроль', included: true },
          { name: 'Пріоритетна підтримка', included: true, note: 'Персональний менеджер' },
          { name: 'Знижена комісія за перекази', included: true, note: '0.3% замість 0.5%' },
          { name: 'Корпоративні картки', included: true, limit: 'До 10 карток' },
        ],
        requirements: ['ІПН', 'Паспорт або ID-картка', 'Реєстрація ФОП або ТОВ'],
        interestRate: '0.3% за перекази',
        interestRateNote: 'знижена комісія',
        processingTime: '1-2 дні',
        promotions: ['Перший місяць безкоштовно'],
        pros: ['Персональний менеджер', 'Знижені комісії', 'Зарплатний проект з коробки'],
        cons: ['Ціна 199 ₴/міс', 'Потрібен візит у відділення для деяких операцій'],
        ctaLabel: 'Підключити пакет',
        ctaUrl: 'https://privatbank.ua/business/package',
        documentChecklist: [
          {
            scenario: 'Відкрити рахунок ТОВ',
            forAudience: 'tov' as const,
            requiredDocs: [
              { name: 'Статут ТОВ', note: 'Оригінал або нотаріальна копія', isOptional: false },
              { name: 'Витяг з ЄДР', note: 'Не старше 3 місяців', isOptional: false },
              { name: 'Рішення про призначення директора', isOptional: false },
              { name: 'Паспорт директора', isOptional: false },
              { name: 'ІПН директора', isOptional: false },
              { name: 'Перелік кінцевих бенефіціарів', note: 'Для фінмоніторингу', isOptional: false },
            ],
            timeToComplete: '1-3 робочих дні',
            canDoOnline: false,
            warnings: [
              'Обов\'язковий особистий візит директора у відділення',
              'Без оригіналу статуту — рахунок не відкриють',
              'Перелік бенефіціарів — частий привід відмови, підготуйте заздалегідь',
            ],
            tips: [
              'Заздалегідь зателефонуйте у відділення та узгодьте зручний час',
              'Підготуйте копії всіх документів — залишать у банку',
            ],
          },
        ],
        commonMistakes: [
          'Приходять без оригіналу статуту для ТОВ — повертаються ні з чим',
          'Розраховують відкрити рахунок ТОВ онлайн — неможливо',
        ],
      },
      {
        id: 'pb-credit-biz',
        category: 'Кредитування',
        name: 'Кредит для бізнесу',
        tagline: 'Фінансування від 50 000 до 5 000 000 ₴',
        description: 'Кредитні кошти на розвиток бізнесу, поповнення обігових коштів або придбання обладнання. Рішення за 1 день.',
        audience: 'business',
        isHighlighted: false,
        isFeatured: true,
        price: { monthly: 'від 18% річних', isFree: false, hasFreeTrial: false, pricingNote: 'Ставка залежить від суми, терміну та забезпечення.' },
        features: [
          { name: 'Онлайн-заявка', included: true },
          { name: 'Рішення за 1 день', included: true },
          { name: 'Без застави до 500 000 ₴', included: true },
          { name: 'Термін до 5 років', included: true },
          { name: 'Дострокове погашення', included: true, note: 'Без комісії' },
        ],
        requirements: ['Діючий бізнес від 6 місяців', 'Фінансова звітність', 'ІПН та паспорт'],
        interestRate: 'від 18%',
        interestRateNote: 'річних',
        processingTime: '1-3 дні',
        benefits: ['Гнучкий графік погашення', 'Кредитні канікули до 3 місяців', 'Можливість збільшення ліміту'],
        pros: ['Швидке рішення', 'Без застави на невеликі суми'],
        cons: ['Ставка вища за середню по ринку для нових клієнтів'],
        ctaLabel: 'Подати заявку',
        ctaUrl: 'https://privatbank.ua/business/credit',
      },
      {
        id: 'pb-acquiring',
        category: 'Еквайринг',
        name: 'Торговий еквайринг',
        tagline: 'POS-термінали та онлайн-оплата для бізнесу',
        description: 'Приймайте безготівкові платежі у торгових точках та онлайн. POS-термінал безкоштовно при обороті від 50 000 ₴/міс.',
        audience: 'business',
        isHighlighted: false,
        isFeatured: false,
        price: { monthly: 'від 1.5%', isFree: false, hasFreeTrial: false, pricingNote: 'Комісія від обороту. POS-термінал безкоштовно при обороті від 50 000 ₴/міс.' },
        features: [
          { name: 'POS-термінал', included: true, note: 'Безкоштовно при обороті від 50 000 ₴' },
          { name: 'Безконтактна оплата (NFC)', included: true },
          { name: 'Apple Pay / Google Pay', included: true },
          { name: 'Інтернет-еквайринг', included: true },
          { name: 'Зарахування наступного дня', included: true },
        ],
        requirements: ['Рахунок у ПриватБанку', 'Торгова точка або онлайн-магазин'],
        interestRate: '1.5–2.5%',
        interestRateNote: 'комісія від обороту',
        processingTime: '1-2 дні',
        benefits: ['POS-термінал безкоштовно', 'Інтеграція з касовими апаратами', 'Цілодобова підтримка'],
        pros: ['Широка мережа підтримки', 'Безкоштовний термінал'],
        cons: ['Комісія вища за деяких конкурентів'],
        ctaLabel: 'Підключити еквайринг',
        ctaUrl: 'https://privatbank.ua/business/acquiring',
      },
      {
        id: 'pb-zed',
        category: 'ЗЕД',
        name: 'Валютний контроль та ЗЕД',
        tagline: 'SWIFT-перекази та конвертація для зовнішньоекономічної діяльності',
        description: 'Повний супровід зовнішньоекономічних операцій: валютні перекази, конвертація, митне оформлення документів.',
        audience: 'business',
        isHighlighted: false,
        isFeatured: false,
        price: { monthly: 'за тарифами', isFree: false, hasFreeTrial: false, pricingNote: 'SWIFT-переказ від 0.15%, конвертація за курсом банку.' },
        features: [
          { name: 'SWIFT-перекази', included: true },
          { name: 'Конвертація валют', included: true, note: 'USD, EUR, GBP, PLN' },
          { name: 'Валютний контроль онлайн', included: true },
          { name: 'Рахунки у валюті', included: true },
          { name: 'Консультація з ЗЕД', included: true, note: 'Персональний менеджер' },
        ],
        requirements: ['Рахунок у ПриватБанку', 'ЗЕД-контракт'],
        interestRate: 'від 0.15%',
        interestRateNote: 'за SWIFT-переказ',
        processingTime: '1-3 дні',
        benefits: ['Онлайн-подання документів', 'Вигідний курс конвертації', 'Досвід обслуговування 50 000+ ЗЕД-клієнтів'],
        pros: ['Досвід у ЗЕД-операціях', 'Онлайн валютний контроль'],
        cons: ['Курс конвертації не завжди найвигідніший'],
        ctaLabel: 'Відкрити валютний рахунок',
        ctaUrl: 'https://privatbank.ua/business/zed',
      },
      {
        id: 'pb-exchange',
        category: 'Обмін валют',
        name: 'Обмін валют',
        tagline: 'Купівля та продаж валюти за курсом НБУ',
        description: 'Обмін готівкової та безготівкової валюти у відділеннях та через Приват24. Курс може відрізнятись від офіційного курсу НБУ.',
        audience: 'both',
        isHighlighted: false,
        isFeatured: false,
        price: { monthly: 'за курсом', isFree: false, hasFreeTrial: false, pricingNote: 'Комісія включена в курс купівлі/продажу.' },
        features: [
          { name: 'Обмін через Приват24', included: true },
          { name: 'Обмін у відділенні', included: true },
          { name: 'Конвертація на рахунку', included: true },
        ],
        requirements: ['Рахунок у ПриватБанку'],
        processingTime: 'Миттєво',
        benefits: [
          'Комісія банку: 0.5–1% від суми',
          'Курс у відділенні може відрізнятись від курсу в Приват24',
          'Конвертація онлайн через Приват24 — без візиту у відділення',
          'Ліміт без верифікації: до 50 000 ₴ еквівалент',
        ],
        pros: ['Миттєва конвертація онлайн', 'Вигідний курс для великих сум'],
        cons: ['Курс відрізняється від НБУ'],
        ctaLabel: 'Обміняти валюту',
        ctaUrl: 'https://privatbank.ua/exchange',
      },
    ],

    ratings: {
      fintodo: {
        overall: 78,
        rank: 2,
        categorySlug: 'banks-business',
        categoryName: 'Банки для бізнесу',
        parentCategorySlug: 'banks',
        parentCategoryName: 'Банки',
        reviewDate: 'Березень 2025',
        nextReviewDate: 'Вересень 2025',
      },
      external: [
        { source: 'Google Play', rating: 4.5, maxRating: 5, reviewCount: 120000, url: 'https://play.google.com/store/apps/details?id=ua.privatbank.business', asOf: 'Березень 2025' },
        { source: 'App Store', rating: 4.7, maxRating: 5, reviewCount: 35000, url: 'https://apps.apple.com/ua/app/privat24-business', asOf: 'Березень 2025' },
        { source: 'Minfin', rating: 3.5, maxRating: 5, reviewCount: 8500, url: 'https://minfin.com.ua/company/privatbank/', asOf: 'Лютий 2025' },
      ],
      averageExternal: 3.8,
      totalReviewsAllSources: 163500,
    },

    editorial: {
      oneLiner: 'Найбільший банк України з найширшою мережею — надійний, але не найсучасніший.',
      shortTake: 'ПриватБанк — безперечний лідер за масштабом: 7000 відділень, 20000 банкоматів, 150000 терміналів. Для бізнесу, якому потрібна фізична присутність і зарплатний проект на тисячі працівників — безальтернативний. Але Приват24 Бізнес залишається менш зручним, ніж Monobank.',
      fullVerdict: 'ПриватБанк Бізнес — це вибір для великого та середнього бізнесу, який потребує розгалуженої мережі, зарплатного проекту та валютних операцій. Інтерфейс Приват24 поступово оновлюється, але все ще поступається необанкам за UX. Підтримка 24/7 — але якість відповідей нестабільна. Комісії середні по ринку. Після націоналізації — стабільно працює під наглядом НБУ.',
      bestFor: [
        { segment: 'Великий бізнес', reason: 'Зарплатний проект на 1000+ осіб, валютний контроль, факторинг', emoji: '🏢' },
        { segment: 'Бізнес з фіз. точками', reason: 'Найбільша мережа відділень для інкасації та касових операцій', emoji: '🏪' },
      ],
      notFor: [
        { segment: 'ФОП-початківці', reason: 'Інтерфейс складний для новачків, краще почати з Monobank', alternative: 'Monobank Бізнес' },
        { segment: 'Техно-стартапи', reason: 'API менш гнучкий, ніж у необанків', alternative: 'Monobank Бізнес' },
      ],
      methodology: {
        approach: 'Редакція FINTODO тестує реальний бізнес-рахунок протягом 30 днів',
        testingPeriod: 'Лютий–Березень 2025',
        testedBy: 'Команда FINTODO, 2 тестувальники',
        hoursSpent: 35,
        keyFindings: [
          'Відкриття рахунку у відділенні — ~40 хвилин з чергою',
          'Приват24 Бізнес працює стабільно, але UI застарілий',
          'Зарплатний проект — найкращий на ринку для великих команд',
          'Комісія за перекази — 0.5% (стандарт по ринку)',
        ],
        limitationsNote: 'Тестували тільки ФОП-рахунок і Бізнес Пакет. Корпоративні рішення для ТОВ не тестувались повністю.',
      },
      scores: [
        { category: 'Зручність', weight: 0.25, score: 65, maxScore: 100, rationale: 'Приват24 функціональний, але інтерфейс потребує модернізації.', whatWeTested: ['Навігація', 'Створення платежів', 'Пошук', 'Мобільний додаток'], howWeScored: 'UX-аудит + порівняння з конкурентами', penaltyReasons: ['Застарілий дизайн', 'Складна навігація для новачків'] },
        { category: 'Тарифи', weight: 0.25, score: 75, maxScore: 100, rationale: 'Середні по ринку. Безкоштовний базовий рахунок — плюс.', whatWeTested: ['Вартість обслуговування', 'Комісії за перекази', 'Еквайринг'], howWeScored: 'Порівняння з 5 конкурентами', penaltyReasons: ['Приховані комісії за деякі валютні операції'] },
        { category: 'Підтримка', weight: 0.2, score: 70, maxScore: 100, rationale: 'Цілодобова підтримка, але якість відповідей нерівномірна.', whatWeTested: ['Час відповіді', 'Якість відповідей', 'Канали зв\'язку'], howWeScored: '10 звернень у різний час', penaltyReasons: ['Шаблонні відповіді', 'Довге з\'єднання з оператором вночі'] },
        { category: 'Безпека', weight: 0.15, score: 92, maxScore: 100, rationale: 'Високий рівень безпеки після націоналізації. Антифрод 24/7.', whatWeTested: ['Сертифікації', '2FA', 'Антифрод'], howWeScored: 'Аналіз документації + практичний тест', penaltyReasons: [] },
        { category: 'Інтеграції', weight: 0.15, score: 82, maxScore: 100, rationale: 'Широка підтримка 1С, BAS, M.E.Doc. API доступний.', whatWeTested: ['1С інтеграція', 'API', 'Checkbox', 'Імпорт виписок'], howWeScored: 'Тестування кожної інтеграції', penaltyReasons: ['API документація могла б бути кращою'] },
      ],
      totalFormula: 'Зважена сума: Зручність×0.25 + Тарифи×0.25 + Підтримка×0.2 + Безпека×0.15 + Інтеграції×0.15',
      totalScore: 78,
      independenceStatement: 'Редакція FINTODO незалежна від ПриватБанку. Тестування проводилось на власні кошти.',
      conflictOfInterest: 'FINTODO має партнерську інтеграцію з ПриватБанком (імпорт виписок), що не впливає на оцінку.',
    },

    reviewThemes: [
      { theme: 'Мережа відділень', sentiment: 'positive', frequency: 'very_common', percentMentioning: 85, summary: 'Користувачі високо цінують доступність відділень по всій Україні.', positiveQuote: '«Приват є в кожному селі — це важливо для мого бізнесу»', ourConclusion: 'Беззаперечна перевага для бізнесу з фізичними точками.' },
      { theme: 'Комісії та тарифи', sentiment: 'mixed', frequency: 'common', percentMentioning: 60, summary: 'Базове обслуговування безкоштовне, але є приховані комісії.', negativeQuote: '«За валютний переказ зняли додаткову комісію, про яку не попереджали»', ourConclusion: 'Тарифи прозорі на 80%, але потрібно уважно читати договір.' },
      { theme: 'Інтерфейс Приват24', sentiment: 'negative', frequency: 'common', percentMentioning: 55, summary: 'Приват24 Бізнес функціональний, але UI застарілий порівняно з Monobank.', negativeQuote: '«Після Monobank Приват24 виглядає як з 2015 року»', ourConclusion: 'ПриватБанк поступово оновлює UI, але відставання від необанків — 2-3 роки.' },
      { theme: 'Підтримка', sentiment: 'mixed', frequency: 'common', percentMentioning: 45, summary: 'Підтримка працює 24/7, але якість відповідей нестабільна.', positiveQuote: '«Вирішили проблему з блокуванням за 15 хвилин»', negativeQuote: '«Чекав на лінії 40 хвилин, а потім дали шаблонну відповідь»', ourConclusion: 'Для критичних питань — ефективно. Для складних — потрібно наполягати.' },
    ],
    reviewSourcesNote: 'Проаналізовано 500+ відгуків з Google Play, App Store, Minfin та DOU за період жовтень 2024 — березень 2025.',

    comparisons: [
      {
        competitorId: 'monobank-biznes',
        competitorName: 'Monobank Бізнес',
        compareUrl: '/dovidnyky/ustanovy/compare/privat-biznes/monobank-biznes',
        ourAdvantages: [
          { area: 'Мережа', detail: '7000 відділень vs 0 у Monobank' },
          { area: 'Зарплатний проект', detail: 'Повноцінний ЗП на 1000+ осіб' },
          { area: 'Валютні операції', detail: 'Ширший спектр валютних послуг' },
        ],
        theirAdvantages: [
          { area: 'UX', detail: 'Значно сучасніший і зручніший додаток' },
          { area: 'Швидкість відкриття', detail: '12 хв vs 40+ хв у відділенні' },
          { area: 'Тарифи', detail: 'Безкоштовне обслуговування без прихованих комісій' },
        ],
        equalAreas: ['Безпека', 'Базовий функціонал РКО', 'Підтримка 24/7'],
        whenChooseUs: 'Коли потрібні фізичні відділення, зарплатний проект на 50+ осіб або валютні операції.',
        whenChooseThem: 'Коли важливий сучасний UX, швидкість і ви працюєте переважно онлайн.',
        bottomLine: 'ПриватБанк — для масштабу і фізичної присутності. Monobank — для швидкості і зручності.',
      },
    ],

    news: [
      { id: 'pb-news-1', date: 'Лютий 2025', dateISO: '2025-02-15', title: 'ПриватБанк оновив мобільний додаток Приват24 Бізнес', summary: 'Новий дизайн головного екрану та покращена навігація.', type: 'product_launch', sentiment: 'positive', source: 'privatbank.ua', isImportant: true },
      { id: 'pb-news-2', date: 'Січень 2025', dateISO: '2025-01-20', title: 'ПриватБанк знизив комісію за еквайринг для малого бізнесу', summary: 'Комісія знижена з 2% до 1.5% для ФОП з оборотом до 500 000 ₴/міс.', type: 'pricing_change', sentiment: 'positive', source: 'privatbank.ua', isImportant: true },
    ],

    changelog: [
      { date: 'Лютий 2025', changes: ['Оновлено UI Приват24 Бізнес', 'Додано Push-сповіщення про податкові дедлайни'], type: 'feature', impact: 'medium' },
      { date: 'Грудень 2024', changes: ['Знижено комісію еквайрингу для МСБ', 'Інтеграція з Checkbox v2'], type: 'pricing', impact: 'high' },
    ],

    awards: [
      { year: 2024, name: 'Найнадійніший банк України', organization: 'НБУ', category: 'Надійність' },
      { year: 2023, name: 'Best Digital Transformation', organization: 'Ukrainian Fintech Awards', category: 'Цифрова трансформація' },
    ],

    partnerships: [
      { partner: 'Checkbox', type: 'Інтеграція', since: '2022', description: 'Пряма інтеграція з РРО Checkbox для фіскалізації.' },
      { partner: 'Mastercard', type: 'Партнерство', since: '2005', description: 'Емісія бізнес-карток Mastercard з кешбеком.' },
      { partner: 'FINTODO', type: 'Інтеграція', since: '2024', description: 'Автоматичний імпорт банківських виписок для фінансового обліку.' },
    ],

    compliance: {
      aml: true, gdpr: true, nbu: true, dps: true, dia: true,
      pep: true, sanctions: true,
      certificationBody: 'НБУ',
      lastComplianceCheck: 'Січень 2025',
      openBanking: true,
      reportingFormats: ['XML НБУ', 'ISO 20022', 'SWIFT', '1C формат'],
    },

    warPeriod: {
      operationalStatus: 'Операційний з обмеженнями в зоні бойових дій.',
      physicalPresenceStatus: 'Частина відділень на тимчасово окупованих територіях не працює. Решта — у штатному режимі.',
      reliabilityDuringBlackouts: 'Генератори у більшості відділень. Приват24 доступний при наявності інтернету. Банкомати з автономним живленням.',
      dataBackupNote: 'Резервні ЦОД у Західній Україні та за кордоном.',
      supportForAffected: 'Кредитні канікули для ВПО. Безкоштовні перекази на ЗСУ. Пільгове обслуговування для бізнесу з постраждалих регіонів.',
      charityWork: ['Переказ на ЗСУ без комісії', 'Збір «Повернись живим» через Приват24', 'Відновлення відділень у деокупованих містах'],
      businessContinuityPlan: 'Розподілена інфраструктура. Автономне живлення у 80% відділень. Резервні канали зв\'язку.',
      warNote: 'Найбільший банк продовжує працювати — але мережа відділень у прифронтових областях скорочена.',
    },

    faq: [
      { question: 'Скільки часу займає відкриття бізнес-рахунку?', answer: 'Онлайн через Приват24 — 1 робочий день. У відділенні — від 30 хвилин до 1 години (залежить від черги). Потрібні паспорт, ІПН та витяг з ЄДР.', category: 'Відкриття рахунку', isPopular: true },
      { question: 'Чи можна відкрити рахунок повністю онлайн?', answer: 'Так, для ФОП — через Приват24. Для ТОВ потрібен візит у відділення для підпису документів.', category: 'Відкриття рахунку', isPopular: true },
      { question: 'Яка комісія за зарплатний проект?', answer: 'Від 0.1% від суми зарахування. Точний тариф залежить від кількості працівників та обсягу ФОП. Персональний менеджер розрахує індивідуально.', category: 'Тарифи', isPopular: true },
      { question: 'Як підключити інтеграцію з 1С?', answer: 'Через модуль "Клієнт-Банк" у Приват24 Бізнес → Налаштування → Інтеграції → 1С. Інструкція у базі знань або через підтримку 3700.', category: 'Інтеграції', isPopular: true },
    ],

    knownIssues: [
      { issue: 'Застарілий інтерфейс Приват24 Бізнес', frequency: 'widespread', institutionResponse: 'ПриватБанк проводить поетапне оновлення UI з 2024 року.', workaround: 'Використовуйте мобільний додаток — він оновлений краще, ніж веб-версія.', status: 'acknowledged' },
      { issue: 'Довгі черги у відділеннях у піковий час', frequency: 'occasional', institutionResponse: 'Впроваджена система електронної черги у великих відділеннях.', workaround: 'Записуйтесь через Приват24 або відвідуйте у непіковий час (вівторок–четвер, 10:00–12:00).', status: 'ongoing' },
    ],

    cta: {
      primary: { label: 'Відкрити рахунок', href: 'https://privatbank.ua/business', isInternal: false },
      secondary: { label: 'Порівняти з Monobank', href: '/dovidnyky/ustanovy/compare/privat-biznes/monobank-biznes' },
    },

    documentChecklists: [
      {
        scenario: 'Відкрити рахунок ФОП',
        forAudience: 'fop',
        requiredDocs: [
          { name: 'Паспорт або ID-картка', note: 'Оригінал', isOptional: false },
          { name: 'ІПН (РНОКПП)', note: 'Оригінал або копія', isOptional: false },
        ],
        timeToComplete: '30-60 хвилин у відділенні, або 10 хв через Приват24',
        canDoOnline: true,
        onlineUrl: 'https://privatbank.ua/business',
        warnings: [
          'У пікові години — черги до 40 хвилин',
          'У суботу — обмежений перелік послуг',
        ],
        tips: ['Запишіться онлайн через сайт щоб уникнути черги'],
      },
      {
        scenario: 'Відкрити рахунок ТОВ',
        forAudience: 'tov',
        requiredDocs: [
          { name: 'Статут ТОВ', note: 'Оригінал або нотаріальна копія', isOptional: false },
          { name: 'Витяг з ЄДР', note: 'Не старше 3 місяців', isOptional: false },
          { name: 'Рішення про призначення директора', isOptional: false },
          { name: 'Паспорт директора', isOptional: false },
          { name: 'ІПН директора', isOptional: false },
          { name: 'Перелік кінцевих бенефіціарів', note: 'Для фінмоніторингу', isOptional: false },
        ],
        timeToComplete: '1-3 робочих дні',
        canDoOnline: false,
        warnings: [
          'Обов\'язковий особистий візит директора у відділення',
          'Без оригіналу статуту — рахунок не відкриють',
          'Перелік бенефіціарів — частий привід відмови, підготуйте заздалегідь',
        ],
        tips: [
          'Заздалегідь зателефонуйте у відділення та узгодьте зручний час',
          'Підготуйте копії всіх документів — залишать у банку',
        ],
      },
    ],

    onlineServices: [
      'Перекази і платежі через Приват24',
      'Виписки',
      'Відкриття рахунку ФОП онлайн',
      'Більшість операцій через інтернет-банкінг',
    ],

    offlineRequirements: [
      'Відкриття рахунку ТОВ',
      'Корпоративні кредити',
      'Зарплатний проект',
      'Акредитиви',
    ],

    commonMistakes: [
      'Приходять без оригіналу статуту для ТОВ — повертаються ні з чим',
      'Не записуються заздалегідь — чекають 40+ хвилин',
      'Розраховують відкрити рахунок ТОВ онлайн — неможливо',
    ],

    aiUsefulLinks: [
      { label: 'Відкрити рахунок', url: 'https://privatbank.ua/business', isInternal: false },
      { label: 'Огляд ПриватБанк Бізнес', url: '/dovidnyky/ustanovy/profile/privat-biz', isInternal: true },
      { label: 'Порівняти з Monobank', url: '/dovidnyky/ustanovy/compare/monobank-biznes/privat-biz', isInternal: true },
    ],
  },
];

export const INSTITUTION_PROFILES: FullInstitutionProfile[] = [
  ...LEGACY_PROFILES,
  ...FINTECH_PROFILES,
  ...SERVICES_PROFILES,
  ...DIGITAL_PROFILES,
];

export const getInstitutionBySlug = (slug: string) =>
  INSTITUTION_PROFILES.find((p) => p.slug === slug);
