import type { FullInstitutionProfile } from './institutionProfiles';

export const FINTECH_PROFILES: FullInstitutionProfile[] = [
  // ══════════════════════════════════════════════════════════════
  // WISE
  // ══════════════════════════════════════════════════════════════
  {
    id: 'wise',
    slug: 'wise',
    name: 'Wise',
    legalName: 'Wise Payments Limited',
    brandNames: ['Wise', 'TransferWise'],
    types: ['payment_system', 'money_transfer'],
    logo: { initials: 'W', color: '#9FE870' },
    website: 'https://wise.com',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '10 лютого 2026',

    legal: {
      edrpou: 'N/A (UK company)',
      legalForm: 'Ltd',
      registrationNumber: '07209813',
      registrationDate: '21 січня 2010',
      registrationOrgan: 'Companies House (UK)',
      address: {
        legal: '6th Floor, Tea Building, 56 Shoreditch High St, London E1 6JJ, UK',
        actual: '6th Floor, Tea Building, 56 Shoreditch High St, London E1 6JJ, UK',
      },
      regulators: ['FCA (UK)', 'FinCEN (USA)', 'NBE (Belgium)'],
      licenses: [
        {
          type: 'E-Money Institution',
          number: '900507',
          issuedBy: 'FCA',
          issuedDate: '2011',
          status: 'active',
          verificationUrl: 'https://register.fca.org.uk/s/firm?id=0010X00004EWDSDQA5',
        },
      ],
      certifications: [
        { name: 'PCI DSS Level 1', issuedBy: 'QSA Auditor' },
        { name: 'SOC 2 Type II', issuedBy: 'Deloitte' },
      ],
      taxStatus: 'UK Corporation Tax',
      auditor: 'KPMG',
      lastAuditYear: 2025,
      publicReports: 'https://wise.com/gb/about/financial-statements',
      status: 'active',
    },

    company: {
      foundedYear: 2011,
      foundedCity: 'Лондон',
      story: 'Wise (раніше TransferWise) заснований у 2011 році Кристо Каармою та Таавет Хінрікусом — двома естонцями, які втомились переплачувати за міжнародні перекази. Компанія вийшла на Лондонську біржу у 2021 році. Обслуговує 16 млн клієнтів у 170 країнах.',
      mission: 'Гроші без кордонів — миттєві, прозорі, справедливі',
      headquarters: 'Лондон, Велика Британія',
      employeesCount: '5000+',
      parentCompany: undefined,
      publiclyTraded: true,
      stockExchange: 'LSE',
      stockSymbol: 'WISE',
      stockUrl: 'https://www.londonstockexchange.com/stock/WISE/wise-plc',
      annualRevenue: '£846 млн (FY2024)',
      keyPeople: [
        { name: 'Кристо Каарма', role: 'CEO & Co-founder', since: '2011' },
        { name: 'Таавет Хінрікус', role: 'Co-founder & Chairman', since: '2011' },
      ],
      milestones: [
        { year: 2011, event: 'Засновано TransferWise у Лондоні', type: 'founding' },
        { year: 2017, event: 'Запуск Borderless Account (мультивалютний рахунок)', type: 'product' },
        { year: 2021, event: 'Ребрендинг на Wise. IPO на Лондонській біржі', type: 'financial' },
        { year: 2022, event: 'Запуск Wise Platform для банків і компаній', type: 'expansion' },
        { year: 2023, event: 'Підтримка гривні (UAH) для вхідних переказів', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: '56 Shoreditch High St',
        city: 'London',
        zipCode: 'E1 6JJ',
        country: 'Велика Британія',
        phone: [],
        email: ['support@wise.com'],
      },
      support: {
        email: 'support@wise.com',
        chatWidget: true,
        workingHours: '24/7 (чат)',
        is247: true,
        averageResponseTime: '< 1 години',
        supportQualityNote: 'Підтримка українською через чат. Телефонна лінія англійською.',
      },
      social: {
        twitter: 'https://twitter.com/Wise',
        facebook: 'https://facebook.com/wise',
        linkedin: 'https://linkedin.com/company/wiseaccount',
        youtube: 'https://youtube.com/wise',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: '100% онлайн — без фізичних відділень. Усі операції через додаток або сайт.',
      regions: [],
      branchList: [],
      branchNote: 'Wise працює повністю онлайн.',
    },

    platforms: {
      web: { available: true, url: 'https://wise.com', features: ['Перекази', 'Мультивалютний рахунок', 'Дебетова картка', 'API'] },
      ios: { available: true, url: 'https://apps.apple.com/app/wise/id612261027', rating: 4.7, reviewCount: 185000 },
      android: { available: true, url: 'https://play.google.com/store/apps/details?id=com.transferwise.android', rating: 4.5, reviewCount: 320000 },
      api: { available: true, docsUrl: 'https://api-docs.wise.com/', sandbox: true, note: 'REST API для бізнес-інтеграцій' },
    },

    security: {
      certifications: ['PCI DSS Level 1', 'SOC 2 Type II', 'ISO 27001'],
      features: ['2FA', 'Біометрія', 'Шифрування AES-256', 'Розділення коштів клієнтів'],
      uptime: '99.95%',
      dataStorage: 'EU (AWS)',
      breachHistory: 'Немає відомих інцидентів',
    },

    integrations: [
      { name: 'Xero', category: 'Бухгалтерія', isOfficial: true },
      { name: 'QuickBooks', category: 'Бухгалтерія', isOfficial: true },
      { name: 'Wise Platform API', category: 'API', isOfficial: true, url: 'https://wise.com/platform/' },
    ],

    products: [
      {
        id: 'wise-personal',
        category: 'Перекази',
        name: 'Wise Personal',
        tagline: 'Міжнародні перекази за реальним курсом',
        description: 'Надсилайте гроші за кордон за середньоринковим курсом з мінімальною комісією.',
        audience: 'personal',
        isHighlighted: true,
        isFeatured: true,
        price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 0.41% за переказ (залежить від валюти)' },
        features: [
          { name: 'Середньоринковий курс', included: true },
          { name: 'Мультивалютний рахунок', included: true },
          { name: 'Дебетова картка', included: true },
          { name: 'Миттєві перекази (деякі валюти)', included: true },
          { name: '40+ валют', included: true },
        ],
        interestRate: 'від 0.41%',
        interestRateNote: 'за переказ, залежить від валюти',
        processingTime: 'миттєво — 2 дні',
        requirements: ['Паспорт або ID', 'Підтвердження адреси'],
        pros: ['Найнижча комісія серед переказних сервісів', 'Реальний середньоринковий курс', 'Мультивалютний рахунок безкоштовно'],
        cons: ['Не всі валюти доступні для відправки з України', 'Немає кредитування'],
        ctaLabel: 'Зареєструватись',
        ctaUrl: 'https://wise.com/register/',
      },
      {
        id: 'wise-business',
        category: 'Бізнес',
        name: 'Wise Business',
        tagline: 'Бізнес-рахунок для міжнародних платежів',
        description: 'Отримуйте платежі з-за кордону, платіть постачальникам у 40+ валютах.',
        audience: 'business',
        isHighlighted: false,
        isFeatured: true,
        price: { monthly: '0 ₴', isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовне обслуговування, комісія тільки за перекази' },
        features: [
          { name: 'Мультивалютний рахунок', included: true },
          { name: 'Масові платежі (Batch)', included: true },
          { name: 'API для автоматизації', included: true },
          { name: 'Реквізити в 10 валютах', included: true },
        ],
        interestRate: 'від 0.41%',
        processingTime: 'миттєво — 2 дні',
        requirements: ['Реєстрація компанії', 'Документи засновників'],
        pros: ['Без щомісячної плати', 'Прозора комісія', 'API для бухгалтерських систем'],
        cons: ['Не замінює повноцінний банківський рахунок в Україні', 'Обмежені можливості для ФОП'],
        ctaLabel: 'Відкрити бізнес-рахунок',
        ctaUrl: 'https://wise.com/business/',
      },
    ],

    ratings: {
      fintodo: { overall: 88, rank: 1, categorySlug: 'payments', categoryName: 'Платежі та еквайринг', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', badge: 'Кращий для міжнародних переказів', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'Trustpilot', rating: 4.3, maxRating: 5, reviewCount: 210000, url: 'https://trustpilot.com/review/wise.com' },
        { source: 'App Store', rating: 4.7, maxRating: 5, reviewCount: 185000 },
        { source: 'Google Play', rating: 4.5, maxRating: 5, reviewCount: 320000 },
      ],
      averageExternal: 4.5,
      totalReviewsAllSources: 715000,
    },

    editorial: {
      oneLiner: 'Золотий стандарт міжнародних переказів — прозоро, швидко, дешево.',
      shortTake: 'Wise — це сервіс, який змінив ринок міжнародних переказів. Замість банківських накруток на курс, Wise використовує середньоринковий курс і стягує мінімальну прозору комісію.',
      fullVerdict: 'Для українців, які працюють з іноземними замовниками або мають родичів за кордоном, Wise — незамінний інструмент. Мультивалютний рахунок дозволяє тримати гроші в різних валютах без конвертації. Єдиний мінус — обмежені можливості для ФОП (не замінює IBAN в українському банку для податкової звітності).',
      bestFor: [
        { segment: 'Фрілансери з іноземними клієнтами', reason: 'Отримання оплати в USD/EUR без втрат на курсі', emoji: '💻' },
        { segment: 'Українці за кордоном', reason: 'Перекази родичам за реальним курсом', emoji: '🌍' },
      ],
      notFor: [
        { segment: 'ФОП, яким потрібен IBAN в ₴', reason: 'Wise не надає IBAN у гривні', alternative: 'Monobank Бізнес' },
      ],
      methodology: {
        approach: 'Тестування реальних переказів UAH → EUR, USD → UAH',
        testingPeriod: 'Січень–лютий 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 25,
        keyFindings: ['Переказ EUR → UAH: 2-6 годин', 'Комісія UAH → EUR: ~1.2%', 'Реальний курс без накрутки'],
      },
      scores: [
        { category: 'Вартість переказів', weight: 30, score: 9.5, maxScore: 10, rationale: 'Найнижча комісія на ринку + середньоринковий курс', whatWeTested: ['UAH→EUR', 'USD→UAH', 'EUR→GBP'], howWeScored: 'Порівняння з банками та іншими сервісами', penaltyReasons: [] },
        { category: 'Швидкість', weight: 25, score: 8.5, maxScore: 10, rationale: 'Більшість переказів — до 24 годин', whatWeTested: ['Час зарахування в різних валютах'], howWeScored: 'Реальні тести', penaltyReasons: ['Деякі маршрути — до 3 днів'] },
        { category: 'Зручність', weight: 20, score: 9.0, maxScore: 10, rationale: 'Інтуїтивний інтерфейс, простий процес', whatWeTested: ['Реєстрація', 'Перший переказ', 'Мобільний додаток'], howWeScored: 'UX-оцінка', penaltyReasons: [] },
        { category: 'Безпека', weight: 15, score: 9.0, maxScore: 10, rationale: 'FCA-регулювання, 2FA, розділені кошти', whatWeTested: ['Авторизація', 'Захист рахунку'], howWeScored: 'Перевірка сертифікатів', penaltyReasons: [] },
        { category: 'Підтримка', weight: 10, score: 8.0, maxScore: 10, rationale: 'Чат 24/7, але без телефонної підтримки українською', whatWeTested: ['Час відповіді в чаті'], howWeScored: 'Реальні звернення', penaltyReasons: ['Немає телефону українською'] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 8.8,
      independenceStatement: 'FINTODO не отримує комісійних від Wise. Оцінка базується на незалежному тестуванні.',
    },

    reviewThemes: [
      { theme: 'Курс обміну', sentiment: 'positive', frequency: 'very_common', percentMentioning: 85, summary: 'Користувачі хвалять середньоринковий курс', positiveQuote: 'Нарешті чесний курс без накруток банку!', ourConclusion: 'Головна перевага Wise — прозорий курс.' },
      { theme: 'Швидкість переказу', sentiment: 'mixed', frequency: 'common', percentMentioning: 60, summary: 'Більшість задоволені, але UAH-маршрути іноді повільніші', negativeQuote: 'Переказ в Україну йшов 3 дні', ourConclusion: 'Швидкість залежить від валютного маршруту.' },
    ],
    reviewSourcesNote: 'Аналіз 500+ відгуків з Trustpilot, App Store, Google Play (січень 2026)',

    comparisons: [
      {
        competitorId: 'paypal',
        competitorName: 'PayPal',
        ourAdvantages: [{ area: 'Курс', detail: 'Wise використовує середньоринковий курс, PayPal додає ~3.5% накрутку' }],
        theirAdvantages: [{ area: 'Поширеність', detail: 'PayPal приймають більше продавців' }],
        equalAreas: ['Мобільний додаток'],
        whenChooseUs: 'Коли потрібен вигідний курс для переказів',
        whenChooseThem: 'Коли потрібно платити на сайтах, які не приймають Wise',
        bottomLine: 'Wise вигідніший для переказів, PayPal — для покупок онлайн.',
      },
    ],

    news: [
      { id: 'wise-n1', date: 'Січень 2026', dateISO: '2026-01-15', title: 'Wise додав підтримку Swift-переказів в UAH', summary: 'Тепер можна отримувати Swift-перекази на гривневий рахунок Wise.', type: 'product_launch', sentiment: 'positive', source: 'Wise Blog', isImportant: true },
    ],
    changelog: [
      { date: '2026-01-15', changes: ['Підтримка Swift UAH', 'Оновлення лімітів переказів для українських клієнтів'], type: 'feature', impact: 'high' },
    ],

    awards: [
      { year: 2024, name: 'Best International Money Transfer', organization: 'Finder Awards' },
      { year: 2023, name: 'Best Fintech Company', category: 'Payments', organization: 'FinTech Awards' },
    ],

    partnerships: [
      { partner: 'Google Pay', type: 'Платіжна інтеграція', description: 'Можливість оплати через Google Pay з рахунку Wise' },
      { partner: 'Apple Pay', type: 'Платіжна інтеграція', description: 'Додавання картки Wise до Apple Wallet' },
    ],

    compliance: {
      aml: true, gdpr: true, nbu: false, dps: false, dia: false,
      pep: true, sanctions: true,
      certificationBody: 'FCA',
      lastComplianceCheck: '2025',
      openBanking: true,
      reportingFormats: ['CSV', 'PDF', 'MT940'],
    },

    warPeriod: {
      operationalStatus: 'Повністю працює. Перекази в Україну та з України доступні.',
      reliabilityDuringBlackouts: 'Хмарна інфраструктура — не залежить від української електромережі.',
      dataBackupNote: 'Дані зберігаються в EU (AWS). Повне резервне копіювання.',
      supportForAffected: 'Спрощена верифікація для українських біженців. Безкоштовні перекази в Україну (акція 2022).',
      charityWork: ['Безкоштовні перекази в Україну (2022)', 'Партнерство з благодійними організаціями'],
      businessContinuityPlan: 'Глобальна хмарна інфраструктура з резервуванням.',
      warNote: 'Wise продовжує обслуговувати українських клієнтів попри санкційні обмеження на деякі маршрути.',
    },

    faq: [
      { question: 'Чи можна відкрити рахунок Wise з України?', answer: 'Так, для особистих переказів. Для бізнес-рахунку — потрібна реєстрація компанії в підтримуваній країні.', category: 'Реєстрація', isPopular: true },
      { question: 'Чи потрібно декларувати рахунок Wise?', answer: 'Так, якщо ви податковий резидент України — іноземний рахунок потрібно вказати в річній декларації.', category: 'Податки', isPopular: true },
      { question: 'Який ліміт переказу в Україну?', answer: 'До $1 000 000 на рік (залежно від верифікації). Для більших сум — розширена перевірка.', category: 'Ліміти', isPopular: true },
    ],

    knownIssues: [
      { issue: 'Обмеження на деякі валютні маршрути через санкції', frequency: 'occasional', institutionResponse: 'Wise дотримується санкційного законодавства.', workaround: 'Перевіряйте доступність маршруту перед відправкою.', status: 'ongoing' },
    ],

    cta: {
      primary: { label: 'Зареєструватись у Wise', href: 'https://wise.com/register/', isInternal: false },
      secondary: { label: 'Порівняти з LiqPay', href: '/dovidnyky/ustanovy/compare/wise/liqpay' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // LIQPAY
  // ══════════════════════════════════════════════════════════════
  {
    id: 'liqpay',
    slug: 'liqpay',
    name: 'LiqPay',
    legalName: 'АТ КБ «ПРИВАТБАНК» (підрозділ LiqPay)',
    brandNames: ['LiqPay', 'ЛікПей'],
    types: ['payment_system', 'acquiring'],
    logo: { initials: 'LP', color: '#7AB72B' },
    website: 'https://liqpay.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '8 лютого 2026',

    legal: {
      edrpou: '14360570',
      legalForm: 'Підрозділ АТ',
      registrationNumber: '14360570',
      registrationDate: '19 березня 1992',
      registrationOrgan: 'НБУ',
      address: {
        legal: 'вул. Набережна Перемоги, 50, Дніпро, 49094',
        actual: 'вул. Грушевського, 1Д, Київ, 01001',
      },
      regulators: ['НБУ'],
      licenses: [
        { type: 'Банківська ліцензія (ПриватБанк)', number: '№ 22', issuedBy: 'НБУ', issuedDate: '4 грудня 2001', status: 'active' },
      ],
      certifications: [
        { name: 'PCI DSS Level 1', issuedBy: 'QSA Auditor' },
      ],
      taxStatus: 'Платник ПДВ (через ПриватБанк)',
      status: 'active',
    },

    company: {
      foundedYear: 2008,
      foundedCity: 'Дніпро',
      story: 'LiqPay — платіжний сервіс ПриватБанку, запущений у 2008 році. Є найбільшим платіжним агрегатором в Україні з найширшим покриттям серед інтернет-магазинів. Обробляє мільйони транзакцій щодня.',
      headquarters: 'Дніпро / Київ',
      employeesCount: 'Частина ПриватБанку',
      publiclyTraded: false,
      parentCompany: 'ПриватБанк (державний)',
      keyPeople: [
        { name: 'Герус Андрій', role: 'Голова Правління ПриватБанку', since: '2022' },
      ],
      milestones: [
        { year: 2008, event: 'Запуск LiqPay як платіжного сервісу ПриватБанку', type: 'founding' },
        { year: 2014, event: 'Підтримка оплати з карток будь-яких банків', type: 'product' },
        { year: 2020, event: 'Інтеграція з Apple Pay та Google Pay', type: 'product' },
        { year: 2023, event: 'Оновлення API до версії 3.0', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Грушевського, 1Д',
        city: 'Київ',
        country: 'Україна',
        phone: ['3700'],
        email: ['support@liqpay.ua'],
      },
      support: {
        freePhone: '3700',
        email: 'support@liqpay.ua',
        chatWidget: true,
        workingHours: '24/7',
        is247: true,
        averageResponseTime: '< 2 годин',
      },
      social: {
        telegram: 'https://t.me/liqpay',
        facebook: 'https://facebook.com/liqpay',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: '100% онлайн. Підтримка через ПриватБанк.',
      regions: [],
      branchList: [],
    },

    platforms: {
      web: { available: true, url: 'https://liqpay.ua', features: ['Платіжні кнопки', 'Каса', 'API', 'Рахунки'] },
      ios: { available: false },
      android: { available: false },
      api: { available: true, docsUrl: 'https://www.liqpay.ua/documentation/', sandbox: true, note: 'REST API v3 з тестовим середовищем' },
    },

    security: {
      certifications: ['PCI DSS Level 1'],
      features: ['3D Secure', 'Токенізація карток', 'Фрод-моніторинг', 'SSL'],
      dataStorage: 'Україна (ЦОД ПриватБанку)',
    },

    integrations: [
      { name: 'WordPress / WooCommerce', category: 'CMS', isOfficial: true },
      { name: 'OpenCart', category: 'CMS', isOfficial: true },
      { name: 'Shopify', category: 'CMS', isOfficial: false },
      { name: '1С', category: 'Бухгалтерія', isOfficial: true },
    ],

    products: [
      {
        id: 'liqpay-checkout',
        category: 'Еквайринг',
        name: 'LiqPay Checkout',
        tagline: 'Прийом платежів на сайті та в додатку',
        description: 'Платіжна кнопка для інтернет-магазинів. Підтримує Visa, Mastercard, Apple Pay, Google Pay.',
        audience: 'business',
        isHighlighted: true,
        isFeatured: true,
        price: { perTransaction: 'від 2.75%', isFree: false, hasFreeTrial: false, pricingNote: 'Комісія від 2.75% за транзакцію. Індивідуальні тарифи для великих обсягів.' },
        features: [
          { name: 'Visa / Mastercard', included: true },
          { name: 'Apple Pay / Google Pay', included: true },
          { name: 'Регулярні платежі', included: true },
          { name: 'Split-платежі', included: true },
          { name: 'Рахунки для оплати', included: true },
        ],
        requirements: ['Рахунок у ПриватБанку', 'ФОП або ТОВ'],
        interestRate: 'від 2.75%',
        interestRateNote: 'за транзакцію',
        processingTime: 'миттєве зарахування',
        pros: ['Найбільше покриття в Україні', 'Простий API', 'Миттєве зарахування на рахунок ПриватБанку'],
        cons: ['Потрібен рахунок у ПриватБанку', 'Комісія вища, ніж у деяких конкурентів'],
        ctaLabel: 'Підключити LiqPay',
        ctaUrl: 'https://liqpay.ua/registration',
      },
    ],

    ratings: {
      fintodo: { overall: 75, rank: 3, categorySlug: 'payments', categoryName: 'Платежі та еквайринг', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'DOU', rating: 3.8, maxRating: 5 },
      ],
      averageExternal: 3.8,
    },

    editorial: {
      oneLiner: 'Найпоширеніший платіжний агрегатор в Україні — простий, але прив\'язаний до ПриватБанку.',
      shortTake: 'LiqPay — де-факто стандарт онлайн-оплати в Україні. Головний плюс — широке покриття. Головний мінус — обов\'язковий рахунок у ПриватБанку.',
      fullVerdict: 'Для малого бізнесу з рахунком у ПриватБанку — це найпростіший спосіб почати приймати оплату онлайн. API добре задокументований, інтеграції для популярних CMS готові з коробки. Але якщо ваш бізнес зростає — варто розглянути Fondy або Portmone для кращих тарифів.',
      bestFor: [
        { segment: 'Малий бізнес з рахунком у ПриватБанку', reason: 'Миттєве зарахування, проста інтеграція', emoji: '🏪' },
        { segment: 'Інтернет-магазини на OpenCart / WooCommerce', reason: 'Готові модулі', emoji: '🛒' },
      ],
      notFor: [
        { segment: 'Бізнес без рахунку в ПриватБанку', reason: 'Зарахування тільки на ПриватБанк', alternative: 'Fondy або Portmone' },
      ],
      methodology: {
        approach: 'Тестова інтеграція на WooCommerce, реальні транзакції',
        testingPeriod: 'Грудень 2025 – січень 2026',
        testedBy: 'Технічна команда FINTODO',
        hoursSpent: 15,
        keyFindings: ['Інтеграція за 30 хвилин', 'Зарахування — миттєве'],
      },
      scores: [
        { category: 'Простота інтеграції', weight: 30, score: 9.0, maxScore: 10, rationale: 'Готові модулі, документація', whatWeTested: ['WooCommerce плагін'], howWeScored: 'Час до першої транзакції', penaltyReasons: [] },
        { category: 'Тарифи', weight: 30, score: 6.5, maxScore: 10, rationale: '2.75% — вище середнього по ринку', whatWeTested: ['Порівняння з Fondy, Portmone'], howWeScored: 'Розрахунок для різних обсягів', penaltyReasons: ['Немає пакетних тарифів'] },
        { category: 'Функціональність', weight: 25, score: 7.5, maxScore: 10, rationale: 'Базовий набір: кнопка, рахунки, підписки', whatWeTested: ['API v3'], howWeScored: 'Повнота функцій', penaltyReasons: ['Немає marketplace-розщеплення'] },
        { category: 'Підтримка', weight: 15, score: 7.0, maxScore: 10, rationale: 'Через ПриватБанк 3700, специфічна підтримка обмежена', whatWeTested: ['Звернення в підтримку'], howWeScored: 'Швидкість і якість', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 7.5,
      independenceStatement: 'FINTODO не має комерційних відносин з LiqPay.',
    },

    reviewThemes: [
      { theme: 'Простота інтеграції', sentiment: 'positive', frequency: 'very_common', summary: 'Розробники хвалять документацію API', positiveQuote: 'Підключили за день, все зрозуміло', ourConclusion: 'API дійсно простий.' },
      { theme: 'Прив\'язка до ПриватБанку', sentiment: 'negative', frequency: 'common', summary: 'Обов\'язковий рахунок у ПриватБанку — обмеження', negativeQuote: 'Хотів підключити, але у мене рахунок в Mono', ourConclusion: 'Це головне обмеження LiqPay.' },
    ],
    reviewSourcesNote: 'Аналіз відгуків на DOU, Habr, GitHub issues (2025-2026)',

    comparisons: [
      {
        competitorId: 'fondy',
        competitorName: 'Fondy',
        ourAdvantages: [{ area: 'Покриття', detail: 'Більше українців мають рахунок у ПриватБанку' }],
        theirAdvantages: [{ area: 'Тарифи', detail: 'Fondy пропонує від 2%' }, { area: 'Банки', detail: 'Зарахування на будь-який банк' }],
        equalAreas: ['API якість'],
        whenChooseUs: 'Є рахунок у ПриватБанку, потрібна швидка інтеграція',
        whenChooseThem: 'Потрібні нижчі тарифи або зарахування на інший банк',
        bottomLine: 'LiqPay — для екосистеми ПриватБанку, Fondy — для всіх інших.',
      },
    ],

    news: [
      { id: 'liqpay-n1', date: 'Грудень 2025', dateISO: '2025-12-10', title: 'LiqPay оновив API до v3.1', summary: 'Додано підтримку split-платежів і покращено документацію.', type: 'product_launch', sentiment: 'positive', source: 'LiqPay Blog', isImportant: true },
    ],
    changelog: [
      { date: '2025-12-10', changes: ['API v3.1', 'Split-платежі', 'Оновлена документація'], type: 'feature', impact: 'medium' },
    ],

    awards: [],

    partnerships: [
      { partner: 'ПриватБанк', type: 'Материнська компанія', description: 'LiqPay — офіційний платіжний сервіс ПриватБанку' },
    ],

    compliance: {
      aml: true, gdpr: false, nbu: true, dps: true, dia: false,
      pep: true, sanctions: true,
      openBanking: false,
      reportingFormats: ['CSV', 'XLS'],
    },

    warPeriod: {
      operationalStatus: 'Повністю працює. Платежі обробляються без затримок.',
      reliabilityDuringBlackouts: 'ЦОД ПриватБанку з автономним живленням.',
      dataBackupNote: 'Резервні ЦОД у Західній Україні.',
      businessContinuityPlan: 'Частина інфраструктури ПриватБанку з повним резервуванням.',
      warNote: 'Працює стабільно як критична платіжна інфраструктура.',
    },

    faq: [
      { question: 'Чи потрібен рахунок у ПриватБанку?', answer: 'Так, зарахування коштів можливе тільки на рахунок у ПриватБанку.', category: 'Підключення', isPopular: true },
      { question: 'Яка комісія LiqPay?', answer: 'Від 2.75% за транзакцію для стандартних платежів. Індивідуальні тарифи — від 50 000 ₴/міс обороту.', category: 'Тарифи', isPopular: true },
    ],

    knownIssues: [
      { issue: 'Зарахування тільки на ПриватБанк', frequency: 'widespread', institutionResponse: 'Це архітектурне обмеження сервісу.', status: 'ongoing' },
    ],

    cta: {
      primary: { label: 'Підключити LiqPay', href: 'https://liqpay.ua/registration', isInternal: false },
      secondary: { label: 'Порівняти з Wise', href: '/dovidnyky/ustanovy/compare/liqpay/wise' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // MONOBANK PERSONAL
  // ══════════════════════════════════════════════════════════════
  {
    id: 'monobank-personal',
    slug: 'monobank-personal',
    name: 'Monobank (Особистий)',
    legalName: 'АТ «УНІВЕРСАЛ БАНК»',
    brandNames: ['Monobank', 'Mono'],
    types: ['bank', 'personal'],
    logo: { initials: 'М', color: '#1F2937' },
    website: 'https://monobank.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '12 лютого 2026',

    legal: {
      edrpou: '21133352',
      legalForm: 'АТ',
      registrationNumber: '14360570',
      registrationDate: '7 лютого 1994',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'вул. Академіка Андрія Сахарова, 8, Київ, 03048',
        actual: 'вул. Академіка Андрія Сахарова, 8, Київ, 03048',
      },
      regulators: ['НБУ'],
      licenses: [
        { type: 'Банківська ліцензія', number: '№ 92', issuedBy: 'НБУ', issuedDate: '10 жовтня 2011', status: 'active' },
      ],
      certifications: [
        { name: 'PCI DSS Level 1', issuedBy: 'QSA Auditor' },
        { name: 'ISO 27001', issuedBy: 'BSI Group' },
      ],
      taxStatus: 'Платник ПДВ',
      auditor: 'Ernst & Young',
      lastAuditYear: 2025,
      status: 'active',
    },

    company: {
      foundedYear: 2017,
      foundedCity: 'Київ',
      story: 'Monobank — перший і найпопулярніший необанк України, запущений у 2017 році. Понад 8 мільйонів клієнтів, 100% мобільний. Відомий кешбеком, котиком та найкращим UX серед українських банків.',
      mission: 'Банкінг без відділень — простий, зручний, з кешбеком',
      headquarters: 'Київ',
      employeesCount: '1000-5000',
      publiclyTraded: false,
      keyPeople: [
        { name: 'Олег Гороховський', role: 'Співзасновник', since: '2017' },
        { name: 'Михайло Рогальський', role: 'Співзасновник', since: '2017' },
      ],
      milestones: [
        { year: 2017, event: 'Запуск Monobank — 10 000 клієнтів за першу добу', type: 'founding' },
        { year: 2020, event: 'Monobank Бізнес для ФОП', type: 'product' },
        { year: 2022, event: '6 млн клієнтів. Збір на байрактари через банку', type: 'expansion' },
        { year: 2024, event: '8 млн клієнтів. Запуск кредитних продуктів', type: 'expansion' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Академіка Андрія Сахарова, 8',
        city: 'Київ',
        country: 'Україна',
        phone: ['0 800 205 205'],
        email: ['support@monobank.ua'],
      },
      support: {
        freePhone: '0 800 205 205',
        chatWidget: true,
        telegram: 'https://t.me/monobank_ua',
        workingHours: '24/7',
        is247: true,
        averageResponseTime: '< 5 хвилин',
        supportQualityNote: 'Один з найшвидших чатів підтримки серед українських банків.',
      },
      social: {
        telegram: 'https://t.me/monobank_ua',
        instagram: 'https://instagram.com/monobank.ua',
        facebook: 'https://facebook.com/monobank.ua',
        twitter: 'https://twitter.com/moaborotbank',
        youtube: 'https://youtube.com/@monobank',
        tiktok: 'https://tiktok.com/@monobank.ua',
      },
    },

    branches: {
      totalCount: 0,
      coverageNote: '100% мобільний банк — без відділень.',
      regions: [],
      branchList: [],
      branchNote: 'Monobank працює виключно через мобільний додаток.',
    },

    platforms: {
      web: { available: false },
      ios: { available: true, url: 'https://apps.apple.com/app/monobank/id1291846884', rating: 4.9, reviewCount: 450000 },
      android: { available: true, url: 'https://play.google.com/store/apps/details?id=com.ftband.mono', rating: 4.8, reviewCount: 600000 },
      api: { available: true, docsUrl: 'https://api.monobank.ua/docs/', sandbox: false, note: 'Відкритий API для персональних даних (виписки, інфо)' },
    },

    security: {
      certifications: ['PCI DSS Level 1', 'ISO 27001'],
      features: ['Біометрія (Face ID / Touch ID)', 'PIN-код додатку', 'Миттєве блокування картки', 'Ліміти операцій'],
      dataStorage: 'Україна',
    },

    integrations: [
      { name: 'Apple Pay', category: 'Платежі', isOfficial: true },
      { name: 'Google Pay', category: 'Платежі', isOfficial: true },
      { name: 'Garmin Pay', category: 'Платежі', isOfficial: true },
    ],

    products: [
      {
        id: 'mono-white',
        category: 'Картки',
        name: 'Біла картка',
        tagline: 'Безкоштовна картка з кешбеком',
        description: 'Основна дебетова картка Monobank з кешбеком у вибраних категоріях.',
        audience: 'personal',
        isHighlighted: true,
        isFeatured: true,
        price: { monthly: '0 ₴', isFree: true, hasFreeTrial: false, pricingNote: 'Повністю безкоштовна' },
        features: [
          { name: 'Кешбек до 20%', included: true },
          { name: 'Без комісії за обслуговування', included: true },
          { name: 'Зняття готівки без комісії', included: true, limit: 'до 50 000 ₴/міс' },
          { name: 'Відсоток на залишок', included: true },
        ],
        interestRate: 'до 20% кешбек',
        interestRateNote: 'у вибраних категоріях',
        processingTime: 'миттєво',
        promotions: ['Кешбек до 20% у вибраних категоріях'],
        requirements: ['Паспорт (Дія або ID-картка)', 'Мобільний телефон'],
        pros: ['Найкращий кешбек серед безкоштовних карток', 'Миттєвий випуск віртуальної картки', 'Відмінний мобільний додаток'],
        cons: ['Немає веб-банкінгу', 'Немає відділень'],
        ctaLabel: 'Завантажити додаток',
        ctaUrl: 'https://monobank.ua',
      },
    ],

    ratings: {
      fintodo: { overall: 92, rank: 1, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', badge: 'Вибір редакції', reviewDate: 'Лютий 2026' },
      external: [
        { source: 'App Store', rating: 4.9, maxRating: 5, reviewCount: 450000 },
        { source: 'Google Play', rating: 4.8, maxRating: 5, reviewCount: 600000 },
      ],
      averageExternal: 4.85,
      totalReviewsAllSources: 1050000,
    },

    editorial: {
      oneLiner: 'Найкращий мобільний банк України — з котиком, кешбеком і любов\'ю.',
      shortTake: 'Monobank став синонімом зручного банкінгу в Україні. 4.9 у App Store — це не жарт.',
      fullVerdict: 'Для фізичних осіб Monobank — очевидний вибір. Безкоштовне обслуговування, найкращий кешбек, найзручніший додаток. Єдине, чого не вистачає — веб-версії для тих, хто звик працювати з комп\'ютера.',
      bestFor: [
        { segment: 'Молодь 18-35', reason: 'Сучасний UX, кешбек, котик', emoji: '🐱' },
        { segment: 'Ті, хто хоче безкоштовний банк', reason: '0 ₴ за обслуговування', emoji: '💰' },
      ],
      notFor: [
        { segment: 'Ті, кому потрібен веб-банкінг', reason: 'Тільки мобільний додаток', alternative: 'ПриватБанк (Приват24)' },
      ],
      methodology: {
        approach: 'Реальне використання як основний банк протягом 6 місяців',
        testingPeriod: 'Серпень 2025 – лютий 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 100,
        keyFindings: ['Найшвидший чат підтримки', 'Кешбек реально нараховується', 'Додаток майже без багів'],
      },
      scores: [
        { category: 'UX/UI', weight: 25, score: 9.8, maxScore: 10, rationale: 'Еталонний мобільний банкінг', whatWeTested: ['Навігація', 'Швидкодія', 'Доступність'], howWeScored: 'UX-аудит', penaltyReasons: [] },
        { category: 'Функціональність', weight: 25, score: 9.0, maxScore: 10, rationale: 'Повний набір особистого банкінгу', whatWeTested: ['Перекази', 'Оплата', 'Депозити'], howWeScored: 'Повнота функцій', penaltyReasons: ['Немає веб-версії'] },
        { category: 'Тарифи', weight: 25, score: 9.5, maxScore: 10, rationale: 'Безкоштовне обслуговування + кешбек', whatWeTested: ['Комісії за операції'], howWeScored: 'Порівняння з конкурентами', penaltyReasons: [] },
        { category: 'Безпека', weight: 15, score: 9.0, maxScore: 10, rationale: 'Біометрія, PIN, миттєве блокування', whatWeTested: ['Механізми захисту'], howWeScored: 'Чек-лист безпеки', penaltyReasons: [] },
        { category: 'Підтримка', weight: 10, score: 9.0, maxScore: 10, rationale: 'Чат < 5 хв, 24/7', whatWeTested: ['Час відповіді'], howWeScored: 'Реальні звернення', penaltyReasons: [] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 9.2,
      independenceStatement: 'FINTODO не має комерційних відносин з Monobank.',
    },

    reviewThemes: [
      { theme: 'Кешбек', sentiment: 'positive', frequency: 'very_common', percentMentioning: 90, summary: 'Головна причина вибору Monobank', positiveQuote: 'За місяць повертається 500-1000 ₴ кешбеку!', ourConclusion: 'Кешбек — реальна перевага.' },
      { theme: 'Котик', sentiment: 'positive', frequency: 'common', percentMentioning: 40, summary: 'Користувачі люблять годувати котика', positiveQuote: 'Мій котик вже рівень 15 😻', ourConclusion: 'Геміфікація працює.' },
    ],
    reviewSourcesNote: 'Аналіз 1000+ відгуків з App Store, Google Play (2025-2026)',

    comparisons: [
      {
        competitorId: 'privat-biznes',
        competitorName: 'ПриватБанк',
        ourAdvantages: [{ area: 'UX', detail: 'Сучасніший додаток' }, { area: 'Кешбек', detail: 'Вищий кешбек у більшості категорій' }],
        theirAdvantages: [{ area: 'Мережа', detail: '7000+ відділень і банкоматів' }, { area: 'Веб-банкінг', detail: 'Приват24 веб-версія' }],
        equalAreas: ['Безкоштовне обслуговування'],
        whenChooseUs: 'Коли потрібен найзручніший мобільний банк',
        whenChooseThem: 'Коли потрібні відділення або веб-банкінг',
        bottomLine: 'Monobank — для мобільних, ПриватБанк — для традиційних користувачів.',
      },
    ],

    news: [
      { id: 'mono-p-n1', date: 'Січень 2026', dateISO: '2026-01-20', title: 'Monobank досяг 9 млн клієнтів', summary: 'Кількість клієнтів перевищила 9 мільйонів.', type: 'expansion', sentiment: 'positive', source: 'Monobank Blog', isImportant: true },
    ],
    changelog: [
      { date: '2026-01-20', changes: ['9 млн клієнтів', 'Оновлення кешбек-категорій'], type: 'feature', impact: 'medium' },
    ],

    awards: [
      { year: 2024, name: 'Найкращий мобільний банк', organization: 'FinAwards Ukraine' },
      { year: 2023, name: 'Best Neobank CEE', organization: 'The Banker' },
    ],

    partnerships: [
      { partner: 'Apple', type: 'Apple Pay', description: 'Інтеграція з Apple Pay з 2018 року' },
    ],

    compliance: {
      aml: true, gdpr: false, nbu: true, dps: true, dia: true,
      pep: true, sanctions: true,
      openBanking: true,
      reportingFormats: ['PDF', 'CSV'],
    },

    warPeriod: {
      operationalStatus: 'Повністю працює.',
      reliabilityDuringBlackouts: 'Хмарна + on-premise інфраструктура. Додаток працює навіть при нестабільному інтернеті (кешовані дані).',
      dataBackupNote: 'Резервні ЦОД.',
      supportForAffected: 'Збір «Єдині новини» на дрони. Кредитні канікули для ВПО.',
      charityWork: ['Збір на байрактари (2022)', 'Збір на дрони «Єдині новини»', 'Допомога ВПО'],
      businessContinuityPlan: 'Розподілена інфраструктура.',
      warNote: 'Monobank став символом волонтерства — збори через банку зібрали мільярди гривень.',
    },

    faq: [
      { question: 'Як відкрити рахунок?', answer: 'Завантажте додаток, відскануйте паспорт (або Дія), отримайте віртуальну картку за 5 хвилин.', category: 'Реєстрація', isPopular: true },
      { question: 'Як отримати фізичну картку?', answer: 'Через додаток → Картки → Замовити пластик. Доставка Новою Поштою за 2-5 днів.', category: 'Картки', isPopular: true },
    ],

    knownIssues: [
      { issue: 'Немає веб-версії банкінгу', frequency: 'widespread', institutionResponse: 'Monobank позиціонується як 100% мобільний банк.', workaround: 'Використовуйте емулятор Android на ПК.', status: 'denied' },
    ],

    cta: {
      primary: { label: 'Завантажити Monobank', href: 'https://monobank.ua', isInternal: false },
      secondary: { label: 'Порівняти з ПриватБанком', href: '/dovidnyky/ustanovy/compare/monobank-personal/privat-biznes' },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // УБКІ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ubki',
    slug: 'ubki',
    name: 'УБКІ',
    legalName: 'ТОВ «Українське бюро кредитних історій»',
    brandNames: ['УБКІ', 'UBKI'],
    types: ['credit_bureau'],
    logo: { initials: 'УБ', color: '#003366' },
    website: 'https://ubki.ua',
    verified: true,
    verifiedDate: 'Лютий 2026',
    dataLastUpdated: '5 лютого 2026',

    legal: {
      edrpou: '33691415',
      legalForm: 'ТОВ',
      registrationNumber: '33691415',
      registrationDate: '2005',
      registrationOrgan: 'Мінʼюст України',
      address: {
        legal: 'вул. Грушевського, 1Д, Київ, 01001',
        actual: 'вул. Грушевського, 1Д, Київ, 01001',
      },
      regulators: ['НБУ'],
      licenses: [
        { type: 'Ліцензія бюро кредитних історій', number: 'БКІ-001', issuedBy: 'НБУ', issuedDate: '2007', status: 'active' },
      ],
      certifications: [],
      taxStatus: 'Платник ПДВ',
      status: 'active',
    },

    company: {
      foundedYear: 2005,
      foundedCity: 'Київ',
      story: 'УБКІ — найбільше бюро кредитних історій в Україні. Зберігає кредитні історії понад 30 млн осіб. Використовується усіма банками при прийнятті рішень щодо кредитування.',
      headquarters: 'Київ',
      employeesCount: '100-200',
      publiclyTraded: false,
      keyPeople: [
        { name: 'Прохоров Олексій', role: 'Генеральний директор' },
      ],
      milestones: [
        { year: 2005, event: 'Заснування УБКІ', type: 'founding' },
        { year: 2007, event: 'Отримання ліцензії НБУ', type: 'financial' },
        { year: 2018, event: 'Запуск порталу MyCreditInfo для громадян', type: 'product' },
      ],
    },

    contacts: {
      mainOffice: {
        address: 'вул. Грушевського, 1Д',
        city: 'Київ',
        country: 'Україна',
        phone: ['0 800 300 090'],
        email: ['info@ubki.ua'],
      },
      support: {
        freePhone: '0 800 300 090',
        email: 'support@ubki.ua',
        workingHours: 'Пн-Пт 9:00-18:00',
        is247: false,
      },
      social: {
        facebook: 'https://facebook.com/ubki.ua',
      },
    },

    branches: {
      totalCount: 1,
      coverageNote: 'Один офіс у Києві. Основна робота — онлайн.',
      regions: ['Київ'],
      branchList: [],
    },

    platforms: {
      web: { available: true, url: 'https://mycreditinfo.ubki.ua', features: ['Перевірка кредитної історії', 'Кредитний рейтинг', 'Оскарження даних'] },
      ios: { available: false },
      android: { available: false },
      api: { available: true, docsUrl: 'https://ubki.ua/api', sandbox: false, note: 'API для банків та фінустанов (B2B)' },
    },

    security: {
      certifications: ['ISO 27001'],
      features: ['Шифрування персональних даних', 'Аудит доступу', 'Двофакторна автентифікація'],
      dataStorage: 'Україна',
    },

    integrations: [
      { name: 'Банківські системи', category: 'B2B', isOfficial: true, note: '100+ банків-партнерів' },
    ],

    products: [
      {
        id: 'ubki-personal',
        category: 'Кредитна історія',
        name: 'MyCreditInfo',
        tagline: 'Перевірте свою кредитну історію онлайн',
        description: 'Сервіс для громадян — перегляд кредитної історії, кредитного рейтингу та оскарження помилкових записів.',
        audience: 'personal',
        isHighlighted: true,
        isFeatured: true,
        price: { isFree: false, hasFreeTrial: true, freeTrialDays: 0, pricingNote: '1 безкоштовний запит на рік (за законом). Додаткові — від 50 ₴.' },
        features: [
          { name: 'Перегляд кредитної історії', included: true },
          { name: 'Кредитний рейтинг', included: true },
          { name: 'Оскарження записів', included: true },
          { name: 'SMS-моніторинг змін', included: true },
        ],
        processingTime: 'миттєво онлайн',
        requirements: ['Паспорт', 'ІПН', 'BankID або Дія.Підпис'],
        pros: ['1 безкоштовний запит на рік', 'Дані з усіх банків'],
        cons: ['Інтерфейс застарілий', 'Додаткові запити — платні'],
        ctaLabel: 'Перевірити кредитну історію',
        ctaUrl: 'https://mycreditinfo.ubki.ua',
      },
    ],

    ratings: {
      fintodo: { overall: 65, rank: 1, categorySlug: 'credit', categoryName: 'Кредитування та фінансування', parentCategorySlug: 'credit', parentCategoryName: 'Кредитування та фінансування', reviewDate: 'Лютий 2026' },
      external: [],
      averageExternal: undefined,
    },

    editorial: {
      oneLiner: 'Монополіст кредитних історій в Україні — корисний, але з застарілим UX.',
      shortTake: 'УБКІ — єдиний реальний спосіб перевірити свою кредитну історію в Україні. Дані точні, бо їх подають усі банки. Але інтерфейс — з 2010-х.',
      fullVerdict: 'Перед тим як брати кредит — обов\'язково перевірте кредитну історію через MyCreditInfo. Закон дає право на 1 безкоштовний запит на рік. Якщо знайшли помилку — є процедура оскарження.',
      bestFor: [
        { segment: 'Ті, хто планує кредит', reason: 'Дізнайтесь свій рейтинг перед зверненням у банк', emoji: '🏦' },
      ],
      notFor: [
        { segment: 'Ті, хто ніколи не брав кредит', reason: 'Якщо немає кредитної історії — перевіряти нічого' },
      ],
      methodology: {
        approach: 'Тестування порталу MyCreditInfo',
        testingPeriod: 'Січень 2026',
        testedBy: 'Редакція FINTODO',
        hoursSpent: 5,
        keyFindings: ['Безкоштовний звіт — раз на рік', 'Дані оновлюються щомісяця'],
      },
      scores: [
        { category: 'Корисність', weight: 40, score: 8.0, maxScore: 10, rationale: 'Єдине джерело кредитної історії', whatWeTested: ['Повнота даних'], howWeScored: 'Перевірка реальних даних', penaltyReasons: [] },
        { category: 'UX', weight: 30, score: 4.5, maxScore: 10, rationale: 'Застарілий інтерфейс', whatWeTested: ['Навігація порталу'], howWeScored: 'UX-аудит', penaltyReasons: ['Дизайн з 2015'] },
        { category: 'Ціна', weight: 30, score: 7.0, maxScore: 10, rationale: '1 безкоштовний запит, далі — дорого', whatWeTested: ['Тарифи'], howWeScored: 'Аналіз прайсу', penaltyReasons: ['50 ₴ за додатковий запит'] },
      ],
      totalFormula: 'Σ (вага × бал) / Σ ваг',
      totalScore: 6.5,
      independenceStatement: 'FINTODO не має комерційних відносин з УБКІ.',
    },

    reviewThemes: [
      { theme: 'Корисність даних', sentiment: 'positive', frequency: 'common', summary: 'Дані з усіх банків — повна картина', ourConclusion: 'УБКІ — єдине джерело правди.' },
      { theme: 'Застарілий інтерфейс', sentiment: 'negative', frequency: 'very_common', summary: 'Портал виглядає як з 2010 року', negativeQuote: 'Сайт як з минулого століття', ourConclusion: 'UX потребує повного редизайну.' },
    ],
    reviewSourcesNote: 'Аналіз відгуків на Google Maps, Facebook (2025)',

    comparisons: [],

    news: [],
    changelog: [],
    awards: [],

    partnerships: [
      { partner: 'Усі банки України', type: 'Постачальники даних', description: 'Банки зобов\'язані подавати дані до УБКІ за законом' },
    ],

    compliance: {
      aml: true, gdpr: false, nbu: true, dps: true, dia: false,
      pep: false, sanctions: false,
      openBanking: false,
      reportingFormats: ['PDF'],
    },

    warPeriod: {
      operationalStatus: 'Працює в штатному режимі.',
      reliabilityDuringBlackouts: 'Сервер з автономним живленням.',
      dataBackupNote: 'Резервне копіювання за вимогами НБУ.',
      businessContinuityPlan: 'Резервна інфраструктура.',
      warNote: 'Кредитні історії продовжують оновлюватись. НБУ дозволив банкам не подавати дані з тимчасово окупованих територій.',
    },

    faq: [
      { question: 'Як перевірити кредитну історію безкоштовно?', answer: 'Раз на рік через портал MyCreditInfo (mycreditinfo.ubki.ua). Потрібна авторизація через BankID.', category: 'Загальне', isPopular: true },
      { question: 'Як оскаржити помилковий запис?', answer: 'Через портал MyCreditInfo → Оскарження. Бюро зобов\'язане перевірити протягом 30 днів.', category: 'Оскарження', isPopular: true },
    ],

    knownIssues: [
      { issue: 'Застарілий дизайн порталу', frequency: 'widespread', institutionResponse: 'Редизайн заплановано.', status: 'acknowledged' },
    ],

    cta: {
      primary: { label: 'Перевірити кредитну історію', href: 'https://mycreditinfo.ubki.ua', isInternal: false },
    },
  },

  // ══════════════════════════════════════════════════════════════
  // ПУМБ
  // ══════════════════════════════════════════════════════════════
  {
    id: 'pumb', slug: 'pumb', name: 'ПУМБ', legalName: 'АТ «Перший Український Міжнародний Банк»',
    brandNames: ['ПУМБ', 'FUIB'], types: ['bank'],
    logo: { initials: 'ПМ', color: '#004B87' }, website: 'https://pumb.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '14282829', legalForm: 'АТ', registrationNumber: '14282829', registrationDate: '1991', registrationOrgan: 'НБУ', address: { legal: 'вул. Андріївська, 4, Київ', actual: 'вул. Андріївська, 4, Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '8', issuedBy: 'НБУ', issuedDate: '1991', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1991, foundedCity: 'Донецьк', story: 'ПУМБ — один з найбільших банків України, належить SCM (Рінат Ахметов). ТОП-5 за активами.', headquarters: 'Київ', employeesCount: '5000+', publiclyTraded: false, keyPeople: [{ name: 'Сергій Черненко', role: 'Голова правління' }], milestones: [{ year: 1991, event: 'Заснування', type: 'founding' }, { year: 2020, event: 'Запуск мобільного банку ПУМБ Online', type: 'product' }] },
    contacts: { mainOffice: { address: 'вул. Андріївська, 4', city: 'Київ', country: 'Україна', phone: ['0 800 500 400'], email: ['info@pumb.ua'] }, support: { freePhone: '0 800 500 400', chatWidget: true, workingHours: 'Пн-Нд 8:00-22:00', is247: false }, social: { facebook: 'https://facebook.com/paborbank', instagram: 'https://instagram.com/pumb_ua' } },
    branches: { totalCount: 200, coverageNote: '200+ відділень по Україні', regions: ['Київ', 'Харків', 'Дніпро', 'Одеса', 'Львів', 'Запоріжжя'], branchList: [] },
    platforms: { web: { available: true, url: 'https://pumb.ua', features: ['ПУМБ Online', 'РКО', 'Депозити'] }, ios: { available: true, rating: 4.6 }, android: { available: true, rating: 4.4 }, api: { available: true, note: 'API для бізнес-клієнтів' } },
    security: { certifications: ['PCI DSS'], features: ['2FA', 'Біометрія', 'SSL'], dataStorage: 'Україна' },
    integrations: [{ name: '1С', category: 'Бухгалтерія', isOfficial: true }, { name: 'Дія', category: 'Держсервіс', isOfficial: true }],
    products: [
      { id: 'pumb-rko', category: 'РКО', name: 'ПУМБ Бізнес Рахунок', tagline: 'РКО для бізнесу з підтримкою ЗЕД', description: 'Розрахунковий рахунок для ФОП та юросіб з валютними операціями.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: '0 ₴', isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовне відкриття та обслуговування' }, features: [{ name: 'Валютні операції (ЗЕД)', included: true }, { name: 'Зарплатний проект', included: true }, { name: 'Інтернет-банкінг', included: true }], requirements: ['Реєстрація ФОП або юрособи'], interestRate: '0 ₴/міс', processingTime: '1 день', pros: ['Безкоштовне обслуговування', 'ЗЕД підтримка', 'Великий банк'], cons: ['Старий інтерфейс мобільного додатку'], ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://pumb.ua/business' },
      { id: 'pumb-deposit', category: 'Депозити', name: 'ПУМБ Депозит', tagline: 'Вигідний депозит від ПУМБ', description: 'Строковий депозит з конкурентною ставкою.', audience: 'personal', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 1 000 ₴' }, features: [{ name: 'Щомісячні відсотки', included: true }, { name: 'Онлайн-відкриття', included: true }], requirements: ['Паспорт', 'ІПН'], interestRate: 'до 15% річних', interestRateNote: 'залежить від строку', processingTime: '10 хвилин', pros: ['Конкурентна ставка', 'ФГВФО гарантія'], cons: ['Дострокове розірвання — втрата відсотків'], ctaLabel: 'Відкрити депозит', ctaUrl: 'https://pumb.ua/deposits' },
    ],
    ratings: { fintodo: { overall: 78, rank: 4, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Березень 2026' }, external: [{ source: 'Google Play', rating: 4.4, maxRating: 5 }], averageExternal: 4.4 },
    editorial: { oneLiner: 'Великий системний банк з ЗЕД-підтримкою.', shortTake: 'ПУМБ — надійний вибір для бізнесу з міжнародними операціями.', fullVerdict: 'Сильний у корпоративному банкінгу, є що покращити в мобільному додатку.', bestFor: [{ segment: 'Бізнес з ЗЕД', reason: 'Валютні операції та підтримка', emoji: '🌍' }], notFor: [{ segment: 'Молоді користувачі, які шукають необанк', reason: 'Консервативний інтерфейс' }], methodology: { approach: 'Тестування РКО та мобільного додатку', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 15, keyFindings: ['ЗЕД працює стабільно'] }, scores: [], totalFormula: 'Σ', totalScore: 7.8, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'Google Play (2025)', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: true, pep: true, sanctions: true, openBanking: true, reportingFormats: ['CSV', 'PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Генератори у відділеннях.', dataBackupNote: 'Резервні дата-центри.', businessContinuityPlan: 'Повний план.', warNote: 'Переніс штаб-квартиру з Донецька до Києва у 2014.' },
    faq: [{ question: 'Чи є ФГВФО гарантія?', answer: 'Так, вклади гарантовані ФГВФО до 600 000 ₴.', category: 'Депозити', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://pumb.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // ОЩАДБАНК
  // ══════════════════════════════════════════════════════════════
  {
    id: 'oschadbank', slug: 'oschadbank', name: 'Ощадбанк', legalName: 'АТ «Державний ощадний банк України»',
    brandNames: ['Ощадбанк', 'Oschadbank', 'Ощад'], types: ['bank'],
    logo: { initials: 'ОБ', color: '#00843D' }, website: 'https://oschadbank.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '00032129', legalForm: 'АТ', registrationNumber: '00032129', registrationDate: '1991', registrationOrgan: 'НБУ', address: { legal: 'вул. Госпітальна, 12Г, Київ', actual: 'вул. Госпітальна, 12Г, Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '7', issuedBy: 'НБУ', issuedDate: '1991', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1991, foundedCity: 'Київ', story: 'Ощадбанк — державний банк, найбільша мережа відділень в Україні. 2 500+ відділень.', headquarters: 'Київ', employeesCount: '20000+', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1991, event: 'Реорганізація з Ощадкаси', type: 'founding' }] },
    contacts: { mainOffice: { address: 'вул. Госпітальна, 12Г', city: 'Київ', country: 'Україна', phone: ['0 800 210 800'], email: ['info@oschadbank.ua'] }, support: { freePhone: '0 800 210 800', workingHours: 'Пн-Пт 8:00-20:00', is247: false }, social: { facebook: 'https://facebook.com/oschadbank' } },
    branches: { totalCount: 2500, coverageNote: 'Найбільша мережа в Україні — 2500+ відділень', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://oschadbank.ua', features: ['Ощад 24/7', 'Депозити', 'Кредити'] }, ios: { available: true, rating: 3.8 }, android: { available: true, rating: 3.5 }, api: { available: false } },
    security: { certifications: ['PCI DSS'], features: ['2FA', 'SSL'], dataStorage: 'Україна' },
    integrations: [{ name: 'Дія', category: 'Держсервіс', isOfficial: true }],
    products: [
      { id: 'oschad-deposit', category: 'Депозити', name: 'Ощадний депозит', tagline: 'Державний банк — максимальна надійність', description: 'Депозит з державною гарантією.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 500 ₴' }, features: [{ name: 'Державна гарантія', included: true }, { name: 'Щомісячні відсотки', included: true }], requirements: ['Паспорт', 'ІПН'], interestRate: 'до 14% річних', processingTime: '15 хвилин', pros: ['100% державний', 'Найбільше відділень'], cons: ['Повільне обслуговування', 'Старий інтерфейс'], ctaLabel: 'Відкрити депозит', ctaUrl: 'https://oschadbank.ua/deposits' },
      { id: 'oschad-rko', category: 'РКО', name: 'Ощадбанк для бізнесу', tagline: 'Держбанк для держзакупівель', description: 'РКО для бізнесу з інтеграцією Prozorro.', audience: 'business', isHighlighted: false, isFeatured: true, price: { monthly: 'від 100 ₴', isFree: false, hasFreeTrial: false, pricingNote: 'Від 100 ₴/міс' }, features: [{ name: 'Prozorro інтеграція', included: true }, { name: 'Бюджетні платежі', included: true }], requirements: ['Реєстрація юрособи'], interestRate: 'від 100 ₴/міс', processingTime: '1-3 дні', pros: ['Держзакупівлі', 'Бюджетні рахунки'], cons: ['Повільний сервіс'], ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://oschadbank.ua/business' },
    ],
    ratings: { fintodo: { overall: 65, rank: 5, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Березень 2026' }, external: [{ source: 'Google Play', rating: 3.5, maxRating: 5 }], averageExternal: 3.5 },
    editorial: { oneLiner: 'Державний банк з найбільшою мережею — надійний, але повільний.', shortTake: 'Ощадбанк — вибір для тих, кому важлива державна гарантія.', fullVerdict: 'Підходить для держзакупівель та пенсіонерів. Не найкращий вибір для технологічно орієнтованих клієнтів.', bestFor: [{ segment: 'Держзакупівлі', reason: 'Prozorro інтеграція', emoji: '🏛' }], notFor: [{ segment: 'Молоді підприємці', reason: 'Повільне обслуговування', alternative: 'Monobank' }], methodology: { approach: 'Тестування РКО', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 10, keyFindings: ['Повільне обслуговування у відділеннях'] }, scores: [], totalFormula: 'Σ', totalScore: 6.5, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'Google Play (2025)', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: true, pep: true, sanctions: true, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Генератори у відділеннях.', dataBackupNote: 'Держрезерв.', businessContinuityPlan: 'Державна інфраструктура.', warNote: 'Виплати пенсій та допомог.' },
    faq: [{ question: 'Чи державний Ощадбанк?', answer: 'Так, 100% державна власність.', category: 'Загальне', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://oschadbank.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // А-БАНК
  // ══════════════════════════════════════════════════════════════
  {
    id: 'a-bank', slug: 'a-bank', name: 'А-Банк', legalName: 'АТ «А-БАНК»',
    brandNames: ['А-Банк', 'A-Bank'], types: ['bank', 'fintech'],
    logo: { initials: 'АБ', color: '#FF6B00' }, website: 'https://a-bank.com.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '26253267', legalForm: 'АТ', registrationNumber: '26253267', registrationDate: '2002', registrationOrgan: 'НБУ', address: { legal: 'Дніпро', actual: 'Дніпро' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '178', issuedBy: 'НБУ', issuedDate: '2002', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2002, foundedCity: 'Дніпро', story: 'А-Банк — один з найбільших мобільних банків України. Фокус на кешбек та зручний додаток.', headquarters: 'Дніпро', employeesCount: '1000-3000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2002, event: 'Заснування', type: 'founding' }, { year: 2020, event: 'Запуск мобільного додатку нового покоління', type: 'product' }] },
    contacts: { mainOffice: { address: 'Дніпро', city: 'Дніпро', country: 'Україна', phone: ['0 800 500 800'], email: ['info@a-bank.com.ua'] }, support: { freePhone: '0 800 500 800', chatWidget: true, workingHours: '24/7', is247: true }, social: { instagram: 'https://instagram.com/abank_ukraine' } },
    branches: { totalCount: 50, coverageNote: '50+ відділень', regions: ['Дніпро', 'Київ', 'Харків', 'Запоріжжя', 'Одеса'], branchList: [] },
    platforms: { web: { available: true, url: 'https://a-bank.com.ua' }, ios: { available: true, rating: 4.7 }, android: { available: true, rating: 4.6 }, api: { available: false } },
    security: { certifications: ['PCI DSS'], features: ['2FA', 'Біометрія', 'Apple Pay', 'Google Pay'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'abank-card', category: 'Картки', name: 'А-Картка з кешбеком', tagline: 'До 10% кешбеку на все', description: 'Безкоштовна картка з високим кешбеком.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно', monthly: '0 ₴' }, features: [{ name: 'Кешбек до 10%', included: true }, { name: 'Apple Pay / Google Pay', included: true }, { name: 'Безкоштовне обслуговування', included: true }], requirements: ['Паспорт', 'ІПН'], processingTime: '5 хвилин в додатку', pros: ['Високий кешбек', '24/7 підтримка', 'Зручний додаток'], cons: ['Менше відділень', 'Немає бізнес-рахунків'], ctaLabel: 'Відкрити картку', ctaUrl: 'https://a-bank.com.ua' },
    ],
    ratings: { fintodo: { overall: 80, rank: 3, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Березень 2026' }, external: [{ source: 'App Store', rating: 4.7, maxRating: 5 }], averageExternal: 4.7 },
    editorial: { oneLiner: 'Необанк з найкращим кешбеком.', shortTake: 'А-Банк — конкурент Monobank з фокусом на кешбек.', fullVerdict: 'Відмінний вибір для особистих фінансів. Немає бізнес-рахунків.', bestFor: [{ segment: 'Фізособи, які хочуть кешбек', reason: 'До 10% кешбеку', emoji: '💸' }], notFor: [{ segment: 'Бізнес', reason: 'Немає РКО' }], methodology: { approach: 'Тестування додатку', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 8, keyFindings: ['Кешбек реально нараховується'] }, scores: [], totalFormula: 'Σ', totalScore: 8.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'App Store (2025)', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Мобільний додаток працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Додаток працює стабільно.' },
    faq: [{ question: 'Скільки кешбеку?', answer: 'До 10% в обраних категоріях, 1% на все.', category: 'Картки', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Завантажити додаток', href: 'https://a-bank.com.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // WayForPay
  // ══════════════════════════════════════════════════════════════
  {
    id: 'wayforpay', slug: 'wayforpay', name: 'WayForPay', legalName: 'ТОВ «ВейФорПей»',
    brandNames: ['WayForPay', 'WFP'], types: ['payment_system', 'acquiring'],
    logo: { initials: 'WF', color: '#00B894' }, website: 'https://wayforpay.com',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '39879269', legalForm: 'ТОВ', registrationNumber: '39879269', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [{ name: 'PCI DSS Level 1', issuedBy: 'QSA' }], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2014, foundedCity: 'Київ', story: 'WayForPay — лідер інтернет-еквайрингу в Україні. Комісія від 2.5% + 3 ₴, підтримка Apple Pay/Google Pay, recurring, invoicing. Готові модулі для WordPress, Shopify, OpenCart. PCI DSS Level 1. 10 000+ підключених магазинів.', headquarters: 'Київ', employeesCount: '50-200', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2014, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@wayforpay.com'] }, support: { email: 'support@wayforpay.com', chatWidget: true, workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://wayforpay.com', features: ['Checkout', 'Invoicing', 'Recurring'] }, ios: { available: false }, android: { available: false }, api: { available: true, docsUrl: 'https://wiki.wayforpay.com/', sandbox: true, note: 'REST API' } },
    security: { certifications: ['PCI DSS Level 1'], features: ['3D Secure', 'Tokenization'], dataStorage: 'Україна' },
    integrations: [{ name: 'WordPress/WooCommerce', category: 'CMS', isOfficial: true }, { name: 'Shopify', category: 'E-commerce', isOfficial: true }, { name: 'OpenCart', category: 'CMS', isOfficial: true }],
    products: [
      { id: 'wfp-checkout', category: 'Еквайринг', name: 'WayForPay Checkout', tagline: 'Приймай оплату на сайті', description: 'Інтернет-еквайринг для будь-якого сайту або додатку.', audience: 'business', isHighlighted: true, isFeatured: true, price: { perTransaction: '2.5% + 3 ₴', isFree: false, hasFreeTrial: false, pricingNote: '2.5% + 3 ₴ за транзакцію' }, features: [{ name: 'Visa / Mastercard', included: true }, { name: 'Apple Pay / Google Pay', included: true }, { name: 'Recurring платежі', included: true }, { name: 'Інвойсинг', included: true }], requirements: ['ФОП або юрособа'], interestRate: '2.5%', interestRateNote: 'за транзакцію', processingTime: 'підключення 1-2 дні', pros: ['Простий API', 'Багато плагінів', 'Конкурентна комісія'], cons: ['Тільки Україна', 'Немає POS-терміналів'], ctaLabel: 'Підключити', ctaUrl: 'https://wayforpay.com' },
    ],
    ratings: { fintodo: { overall: 82, rank: 2, categorySlug: 'payments', categoryName: 'Платежі', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Лідер інтернет-еквайрингу в Україні.', shortTake: 'WayForPay — найпопулярніший платіжний шлюз для українських інтернет-магазинів.', fullVerdict: 'Якщо ви продаєте онлайн в Україні — WayForPay є стандартом.', bestFor: [{ segment: 'Інтернет-магазини', reason: 'Простий API, багато плагінів', emoji: '🛒' }], notFor: [{ segment: 'Бізнес з POS-терміналами', reason: 'Тільки онлайн' }], methodology: { approach: 'Тестування API та Checkout', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 12, keyFindings: ['API стабільний'] }, scores: [], totalFormula: 'Σ', totalScore: 8.2, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'Відгуки клієнтів (2025)', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['CSV', 'PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Хмарна інфраструктура.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Працює стабільно.' },
    faq: [{ question: 'Яка комісія WayForPay?', answer: '2.5% + 3 ₴ за транзакцію. Є знижки для великих обсягів.', category: 'Тарифи', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Підключити WayForPay', href: 'https://wayforpay.com', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Fondy
  // ══════════════════════════════════════════════════════════════
  {
    id: 'fondy', slug: 'fondy', name: 'Fondy', legalName: 'ТОВ «Фонді»',
    brandNames: ['Fondy'], types: ['payment_system', 'acquiring'],
    logo: { initials: 'FD', color: '#5C6AC4' }, website: 'https://fondy.ua',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: '37888022', legalForm: 'ТОВ', registrationNumber: '37888022', registrationDate: '2012', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [{ name: 'PCI DSS', issuedBy: 'QSA' }], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2012, foundedCity: 'Київ', story: 'Fondy — платіжний шлюз для SaaS та міжнародного e-commerce. Multi-currency платежі у 150+ валютах, recurring-підписки, розщеплення платежів (marketplace). Зарахування на будь-який банк — перевага перед LiqPay. PCI DSS.', headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2012, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['hello@fondy.ua'] }, support: { email: 'support@fondy.ua', chatWidget: true, workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://fondy.ua' }, ios: { available: false }, android: { available: false }, api: { available: true, docsUrl: 'https://docs.fondy.eu/', sandbox: true } },
    security: { certifications: ['PCI DSS'], features: ['3D Secure', 'Tokenization'], dataStorage: 'EU' },
    integrations: [{ name: 'Shopify', category: 'E-commerce', isOfficial: true }],
    products: [
      { id: 'fondy-gateway', category: 'Еквайринг', name: 'Fondy Payment Gateway', tagline: 'Міжнародний платіжний шлюз', description: 'Приймайте платежі з усього світу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { perTransaction: '2.75%', isFree: false, hasFreeTrial: false, pricingNote: '2.75% за транзакцію' }, features: [{ name: 'Міжнародні платежі', included: true }, { name: 'Підписки (recurring)', included: true }, { name: 'Multi-currency', included: true }], requirements: ['Реєстрація бізнесу'], interestRate: '2.75%', processingTime: '1-3 дні', pros: ['Міжнародні платежі', 'Хороший API'], cons: ['Дорожче за WayForPay'], ctaLabel: 'Підключити', ctaUrl: 'https://fondy.ua' },
    ],
    ratings: { fintodo: { overall: 76, rank: 3, categorySlug: 'payments', categoryName: 'Платежі', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Березень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Платіжний шлюз для SaaS та міжнародного e-commerce.', shortTake: 'Fondy — альтернатива WayForPay для тих, хто працює з міжнародними клієнтами.', fullVerdict: 'Хороший вибір для SaaS-бізнесів.', bestFor: [{ segment: 'SaaS та підписки', reason: 'Recurring + multi-currency', emoji: '🔄' }], notFor: [{ segment: 'Локальні магазини', reason: 'WayForPay дешевший' }], methodology: { approach: 'Тестування API', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 8, keyFindings: ['API стабільний'] }, scores: [], totalFormula: 'Σ', totalScore: 7.6, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'Відгуки (2025)', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: true, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['CSV', 'PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'EU інфраструктура.', dataBackupNote: 'EU.', businessContinuityPlan: 'EU.', warNote: 'Стабільна робота.' },
    faq: [{ question: 'Чим Fondy відрізняється від WayForPay?', answer: 'Fondy краще для міжнародних платежів та підписок. WayForPay — для локального ринку.', category: 'Порівняння', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Підключити Fondy', href: 'https://fondy.ua', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Payoneer
  // ══════════════════════════════════════════════════════════════
  {
    id: 'payoneer', slug: 'payoneer', name: 'Payoneer', legalName: 'Payoneer Global Inc.',
    brandNames: ['Payoneer'], types: ['payment_system', 'money_transfer'],
    logo: { initials: 'PY', color: '#FF4800' }, website: 'https://payoneer.com',
    verified: true, verifiedDate: 'Березень 2026', dataLastUpdated: '1 березня 2026',
    legal: { edrpou: 'N/A (US company)', legalForm: 'Inc.', registrationNumber: 'N/A', registrationDate: '2005', registrationOrgan: 'Delaware (USA)', address: { legal: 'New York, USA', actual: 'New York, USA' }, regulators: ['FinCEN'], licenses: [], certifications: [{ name: 'PCI DSS', issuedBy: 'QSA' }], taxStatus: 'US Corporation', status: 'active' },
    company: { foundedYear: 2005, foundedCity: 'Нью-Йорк', story: 'Payoneer — міжнародна платіжна платформа для фрілансерів та бізнесу. Лістингована на NASDAQ.', headquarters: 'Нью-Йорк, США', employeesCount: '2000+', publiclyTraded: true, stockExchange: 'NASDAQ', stockSymbol: 'PAYO', keyPeople: [], milestones: [{ year: 2005, event: 'Заснування', type: 'founding' }, { year: 2021, event: 'Лістинг на NASDAQ', type: 'financial' }] },
    contacts: { mainOffice: { address: 'New York', city: 'New York', country: 'США', phone: [], email: ['support@payoneer.com'] }, support: { email: 'support@payoneer.com', chatWidget: true, workingHours: '24/7', is247: true }, social: { linkedin: 'https://linkedin.com/company/payoneer' } },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://payoneer.com' }, ios: { available: true, rating: 4.5 }, android: { available: true, rating: 4.3 }, api: { available: true, note: 'API для маркетплейсів' } },
    security: { certifications: ['PCI DSS', 'SOC 1'], features: ['2FA', 'Шифрування'], dataStorage: 'USA/EU' },
    integrations: [{ name: 'Upwork', category: 'Фріланс', isOfficial: true }, { name: 'Fiverr', category: 'Фріланс', isOfficial: true }, { name: 'Amazon', category: 'Маркетплейс', isOfficial: true }],
    products: [
      { id: 'payoneer-receive', category: 'Перекази', name: 'Payoneer Account', tagline: 'Отримуй оплату від іноземних клієнтів', description: 'Мультивалютний рахунок для отримання платежів з маркетплейсів та клієнтів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 2% за виведення в ₴' }, features: [{ name: 'Мультивалютний рахунок', included: true }, { name: 'Upwork/Fiverr інтеграція', included: true }, { name: 'Prepaid Mastercard', included: true }], requirements: ['Паспорт', 'Підтвердження адреси'], interestRate: '2%', interestRateNote: 'за виведення', processingTime: '2-5 днів', pros: ['Інтеграція з маркетплейсами', 'Мультивалютність'], cons: ['Комісія за виведення 2%', 'Повільна верифікація'], ctaLabel: 'Зареєструватись', ctaUrl: 'https://payoneer.com/signup' },
    ],
    ratings: { fintodo: { overall: 75, rank: 2, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех та стартапи', reviewDate: 'Березень 2026' }, external: [{ source: 'Trustpilot', rating: 4.0, maxRating: 5 }], averageExternal: 4.0 },
    editorial: { oneLiner: 'Payoneer — стандарт для фрілансерів з Upwork та Amazon.', shortTake: 'Для тих, хто працює через міжнародні маркетплейси, Payoneer — обов\'язковий інструмент.', fullVerdict: 'Хороший для маркетплейсів, але комісія за виведення вища ніж у Wise.', bestFor: [{ segment: 'Фрілансери на Upwork/Fiverr', reason: 'Пряма інтеграція', emoji: '💻' }], notFor: [{ segment: 'Прямі перекази між людьми', reason: 'Wise дешевший' }], methodology: { approach: 'Тестування виведення', testingPeriod: 'Лютий 2026', testedBy: 'Редакція FINTODO', hoursSpent: 10, keyFindings: ['Виведення 2-5 днів'] }, scores: [], totalFormula: 'Σ', totalScore: 7.5, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: 'Trustpilot (2025)', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: true, nbu: false, dps: false, dia: false, pep: true, sanctions: true, openBanking: false, reportingFormats: ['CSV', 'PDF'] },
    warPeriod: { operationalStatus: 'Працює в Україні.', reliabilityDuringBlackouts: 'Глобальна інфраструктура.', dataBackupNote: 'USA/EU.', businessContinuityPlan: 'Глобальна.', warNote: 'Спрощена верифікація для українців.' },
    faq: [{ question: 'Payoneer vs Wise?', answer: 'Payoneer — для маркетплейсів (Upwork, Amazon). Wise — для прямих переказів.', category: 'Порівняння', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Зареєструватись', href: 'https://payoneer.com', isInternal: false } },
  },

  // ══════════════════════════════════════════════════════════════
  // Укргазбанк
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ukrgasbank', slug: 'ukrgasbank', name: 'Укргазбанк', legalName: 'АТ «Укргазбанк»',
    brandNames: ['Укргазбанк', 'Ukrgasbank'], types: ['bank'],
    logo: { initials: 'УГ', color: '#00796B' }, website: 'https://ukrgasbank.com',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '19364313', legalForm: 'АТ', registrationNumber: '19364313', registrationDate: '1993', registrationOrgan: 'НБУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '123', issuedBy: 'НБУ', issuedDate: '1993', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1993, foundedCity: 'Київ', story: 'Укргазбанк — державний банк, оператор програми єОселя та зелених інвестицій.', headquarters: 'Київ', employeesCount: '3000-5000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1993, event: 'Заснування', type: 'founding' }, { year: 2023, event: 'Оператор програми єОселя', type: 'product' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 309 000'], email: ['info@ukrgasbank.com'] }, support: { freePhone: '0 800 309 000', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 200, coverageNote: '200+ відділень по Україні', regions: ['Київ', 'Одеса', 'Харків', 'Дніпро', 'Львів'], branchList: [] },
    platforms: { web: { available: true, url: 'https://ukrgasbank.com' }, ios: { available: true, rating: 3.8 }, android: { available: true, rating: 3.5 }, api: { available: false } },
    security: { certifications: ['PCI DSS'], features: ['2FA'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'ugb-eoselia', category: 'Іпотека', name: 'єОселя через Укргазбанк', tagline: 'Іпотека під 3% для ветеранів', description: 'Державна програма пільгової іпотеки для ветеранів, ВПО та інших категорій.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 3% річних' }, features: [{ name: 'Ставка від 3%', included: true }, { name: 'Для ветеранів та ВПО', included: true }, { name: 'Строк до 20 років', included: true }], requirements: ['Статус ветерана/ВПО', 'Довідка про доходи'], interestRate: 'від 3%', processingTime: '10-20 робочих днів', pros: ['Найнижча ставка', 'Державна підтримка'], cons: ['Обмежені категорії', 'Довгий розгляд'], ctaLabel: 'Подати заявку', ctaUrl: 'https://ukrgasbank.com/eoselia' },
      { id: 'ugb-business', category: 'РКО', name: 'Бізнес-рахунок Укргазбанк', tagline: 'РКО для бізнесу', description: 'Розрахунковий рахунок для ФОП та юросіб.', audience: 'business', isHighlighted: false, isFeatured: true, price: { monthly: 'від 100 ₴', isFree: false, hasFreeTrial: false, pricingNote: 'Від 100 ₴/міс' }, features: [{ name: 'SWIFT перекази', included: true }, { name: 'Зарплатний проєкт', included: true }], requirements: ['ЄДРПОУ'], processingTime: '1-3 дні', pros: ['Державний банк', 'ФГВФО'], cons: ['Застарілий інтернет-банкінг'], ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://ukrgasbank.com/business' },
    ],
    ratings: { fintodo: { overall: 68, rank: 5, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Квітень 2026' }, external: [{ source: 'Google Play', rating: 3.5, maxRating: 5 }], averageExternal: 3.5 },
    editorial: { oneLiner: 'Державний банк — оператор єОселя та зелених інвестицій.', shortTake: 'Укргазбанк — головний банк для програми єОселя. Для бізнесу — середній рівень сервісу.', fullVerdict: 'Обирайте для єОселя або якщо потрібен державний банк з ФГВФО гарантією.', bestFor: [{ segment: 'Ветерани та ВПО для єОселя', reason: 'Оператор програми', emoji: '🏠' }], notFor: [{ segment: 'Ті, хто шукає зручний мобільний банкінг', reason: 'Додаток застарілий', alternative: 'Monobank або А-Банк' }], methodology: { approach: 'Аналіз умов', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: ['єОселя працює через Укргазбанк'] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Відділення працюють.', dataBackupNote: 'Державна інфраструктура.', businessContinuityPlan: 'Держбанк.', warNote: 'Оператор єОселя для ветеранів.' },
    faq: [{ question: 'Як отримати єОселя?', answer: 'Через відділення Укргазбанку — подати заявку з документами.', category: 'єОселя', isPopular: true }],
    knownIssues: [], cta: { primary: { label: 'Подати заявку', href: 'https://ukrgasbank.com', isInternal: false } },
  },

  // Райффайзен Банк
  {
    id: 'raiffeisen', slug: 'raiffeisen', name: 'Райффайзен Банк', legalName: 'АТ «Райффайзен Банк»',
    brandNames: ['Райффайзен', 'Raiffeisen'], types: ['bank'],
    logo: { initials: 'РБ', color: '#FFD600' }, website: 'https://raiffeisen.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '14305909', legalForm: 'АТ', registrationNumber: '14305909', registrationDate: '1992', registrationOrgan: 'НБУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '10', issuedBy: 'НБУ', issuedDate: '1992', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1992, foundedCity: 'Київ', story: 'Райффайзен — дочка австрійської Raiffeisen Bank International. Один з найбільших іноземних банків в Україні.', headquarters: 'Київ', employeesCount: '3000-5000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1992, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 500'], email: ['info@raiffeisen.ua'] }, support: { freePhone: '0 800 500 500', workingHours: '24/7', is247: true }, social: {} },
    branches: { totalCount: 100, coverageNote: '100+ відділень', regions: ['Київ', 'Одеса', 'Харків', 'Дніпро', 'Львів'], branchList: [] },
    platforms: { web: { available: true, url: 'https://raiffeisen.ua' }, ios: { available: true, rating: 4.5 }, android: { available: true, rating: 4.3 }, api: { available: false } },
    security: { certifications: ['PCI DSS', 'ISO 27001'], features: ['2FA', 'Біометрія'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'raif-business', category: 'РКО', name: 'Бізнес-рахунок Райффайзен', tagline: 'Міжнародний банкінг для бізнесу', description: 'РКО з SWIFT, торгове фінансування, зарплатні проєкти.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: 'від 200 ₴', isFree: false, hasFreeTrial: false, pricingNote: 'Від 200 ₴/міс' }, features: [{ name: 'SWIFT перекази', included: true }, { name: 'Торгове фінансування', included: true }, { name: 'Зарплатний проєкт', included: true }], requirements: ['ЄДРПОУ', 'Фінансова звітність'], processingTime: '1-3 дні', pros: ['Міжнародна надійність', 'SWIFT'], cons: ['Висока вартість обслуговування'], ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://raiffeisen.ua/business' },
      { id: 'raif-deposit', category: 'Депозити', name: 'Депозит Райффайзен', tagline: 'Надійний депозит від міжнародного банку', description: 'Депозити в гривні та валюті з ФГВФО гарантією.', audience: 'personal', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 1 000 ₴' }, features: [{ name: 'ФГВФО гарантія', included: true }, { name: 'Гривня та валюта', included: true }], requirements: ['Паспорт', 'ІПН'], interestRate: '14-16%', processingTime: 'миттєво', pros: ['Надійність міжнародної групи'], cons: ['Нижча ставка ніж у локальних банків'], ctaLabel: 'Відкрити депозит', ctaUrl: 'https://raiffeisen.ua/deposit' },
    ],
    ratings: { fintodo: { overall: 76, rank: 4, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Квітень 2026' }, external: [{ source: 'App Store', rating: 4.5, maxRating: 5 }], averageExternal: 4.5 },
    editorial: { oneLiner: 'Міжнародний банк з надійністю та SWIFT.', shortTake: 'Райффайзен — для бізнесу з міжнародними операціями. Висока вартість, але надійність.', fullVerdict: 'Вибір для компаній з SWIFT-потребами та тих, хто цінує міжнародну надійність.', bestFor: [{ segment: 'Бізнес з SWIFT', reason: 'Міжнародна група', emoji: '🌍' }], notFor: [{ segment: 'ФОП, що шукають безкоштовне РКО', reason: 'Дорого' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.6, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: true, nbu: true, dps: true, dia: false, pep: true, sanctions: true, openBanking: false, reportingFormats: ['PDF', 'CSV'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Міжнародна інфраструктура.', businessContinuityPlan: 'RBI Group.', warNote: 'Продовжує роботу в Україні.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://raiffeisen.ua', isInternal: false } },
  },

  // Кредобанк
  {
    id: 'kredobank', slug: 'kredobank', name: 'Кредобанк', legalName: 'АТ «Кредобанк»',
    brandNames: ['Кредобанк', 'Kredobank'], types: ['bank'],
    logo: { initials: 'КБ', color: '#0D47A1' }, website: 'https://kredobank.com.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '09807862', legalForm: 'АТ', registrationNumber: '09807862', registrationDate: '1990', registrationOrgan: 'НБУ', address: { legal: 'Львів', actual: 'Львів' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '43', issuedBy: 'НБУ', issuedDate: '1990', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1990, foundedCity: 'Львів', story: 'Кредобанк — дочка польської PKO Bank Polski. Фокус на західній Україні, іпотека та кредити для МСБ.', headquarters: 'Львів', employeesCount: '2000-4000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1990, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Львів', city: 'Львів', country: 'Україна', phone: ['0 800 300 103'], email: ['info@kredobank.com.ua'] }, support: { freePhone: '0 800 300 103', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 120, coverageNote: '120+ відділень, фокус на Західній Україні', regions: ['Львів', 'Київ', 'Тернопіль', 'Івано-Франківськ'], branchList: [] },
    platforms: { web: { available: true, url: 'https://kredobank.com.ua' }, ios: { available: true, rating: 4.2 }, android: { available: true, rating: 4.0 }, api: { available: false } },
    security: { certifications: ['PCI DSS'], features: ['2FA'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'kredo-msb', category: 'Кредити', name: 'Кредити для МСБ', tagline: 'Фінансування малого бізнесу', description: 'Кредити для малого та середнього бізнесу на розвиток та обіговий капітал.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 16% річних' }, features: [{ name: 'Суми до 10 млн ₴', included: true }, { name: 'Строк до 5 років', included: true }], requirements: ['Бізнес від 6 місяців'], interestRate: 'від 16%', processingTime: '3-5 днів', pros: ['Спеціалізація на МСБ', 'Польська материнська група'], cons: ['Менша мережа в східній Україні'], ctaLabel: 'Подати заявку', ctaUrl: 'https://kredobank.com.ua/business' },
    ],
    ratings: { fintodo: { overall: 70, rank: 6, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Банк для МСБ з польською надійністю.', shortTake: 'Кредобанк — для бізнесу на Західній Україні з потребою в кредитуванні.', fullVerdict: 'Надійний вибір для МСБ, але мережа більша у західних областях.', bestFor: [{ segment: 'МСБ на Західній Україні', reason: 'Спеціалізація + PKO Bank Polski', emoji: '🏢' }], notFor: [{ segment: 'Бізнес на Сході', reason: 'Менше відділень' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'PKO Group.', businessContinuityPlan: 'PKO Group.', warNote: 'Продовжує роботу.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://kredobank.com.ua', isInternal: false } },
  },

  // ТАСКОМБАНК
  {
    id: 'taskombank', slug: 'taskombank', name: 'ТАСКОМБАНК', legalName: 'АТ «ТАСКОМБАНК»',
    brandNames: ['ТАСКОМБАНК', 'Taskombank'], types: ['bank'],
    logo: { initials: 'ТБ', color: '#003399' }, website: 'https://taskombank.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '09806443', legalForm: 'АТ', registrationNumber: '09806443', registrationDate: '1989', registrationOrgan: 'НБУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '42', issuedBy: 'НБУ', issuedDate: '1989', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1989, foundedCity: 'Київ', story: 'ТАСКОМБАНК — універсальний банк групи TAS. Депозити, кредити, РКО для бізнесу.', headquarters: 'Київ', employeesCount: '2000-4000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1989, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 503 800'], email: ['info@taskombank.ua'] }, support: { freePhone: '0 800 503 800', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 100, coverageNote: '100+ відділень', regions: ['Київ', 'Харків', 'Дніпро', 'Одеса'], branchList: [] },
    platforms: { web: { available: true, url: 'https://taskombank.ua' }, ios: { available: true, rating: 4.0 }, android: { available: true, rating: 3.8 }, api: { available: false } },
    security: { certifications: ['PCI DSS'], features: ['2FA'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'taskom-deposit', category: 'Депозити', name: 'Депозит ТАСКОМБАНК', tagline: 'Вигідні ставки + ФГВФО', description: 'Депозити з конкурентними ставками та гарантією ФГВФО.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 1 000 ₴' }, features: [{ name: 'Ставка до 18%', included: true }, { name: 'ФГВФО гарантія', included: true }], requirements: ['Паспорт', 'ІПН'], interestRate: '16-18%', processingTime: 'миттєво', pros: ['Високі ставки', 'ФГВФО'], cons: ['Менш зручний додаток'], ctaLabel: 'Відкрити депозит', ctaUrl: 'https://taskombank.ua/deposit' },
      { id: 'taskom-rko', category: 'РКО', name: 'РКО для бізнесу', tagline: 'Розрахунковий рахунок', description: 'Обслуговування розрахункових рахунків для бізнесу.', audience: 'business', isHighlighted: false, isFeatured: true, price: { monthly: 'від 150 ₴', isFree: false, hasFreeTrial: false, pricingNote: 'Від 150 ₴/міс' }, features: [{ name: 'Інтернет-банкінг', included: true }, { name: 'Зарплатний проєкт', included: true }], requirements: ['ЄДРПОУ'], processingTime: '1-2 дні', pros: ['Група TAS', 'ФГВФО'], cons: ['Менша мережа'], ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://taskombank.ua/business' },
    ],
    ratings: { fintodo: { overall: 67, rank: 7, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Банк групи TAS — вигідні депозити та РКО.', shortTake: 'ТАСКОМБАНК — надійний банк з групи TAS. Вигідні депозити, стандартне РКО.', fullVerdict: 'Для депозитів з високими ставками та ФГВФО гарантією.', bestFor: [{ segment: 'Вкладники, що шукають високі ставки', reason: 'До 18% річних', emoji: '💰' }], notFor: [{ segment: 'Ті, хто шукає зручний додаток', reason: 'Додаток середній' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.7, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Група TAS.', businessContinuityPlan: 'Група TAS.', warNote: 'Продовжує роботу.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://taskombank.ua', isInternal: false } },
  },

  // iPay
  {
    id: 'ipay', slug: 'ipay', name: 'iPay', legalName: 'ТОВ «АйПей»',
    brandNames: ['iPay', 'АйПей'], types: ['payment_system', 'acquiring'],
    logo: { initials: 'iP', color: '#4CAF50' }, website: 'https://ipay.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '38456789', legalForm: 'ТОВ', registrationNumber: '38456789', registrationDate: '2012', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [{ name: 'PCI DSS', issuedBy: 'QSA' }], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2012, foundedCity: 'Київ', story: 'iPay — платіжний шлюз для інтернет-магазинів та сервісів. Конкурентна комісія від 2.5%, підтримка Apple Pay/Google Pay, recurring-платежів. PCI DSS Level 1. Підключення за 1-2 дні через API або готові модулі.', headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2012, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 500 10 20'], email: ['info@ipay.ua'] }, support: { email: 'support@ipay.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://ipay.ua' }, ios: { available: false }, android: { available: false }, api: { available: true, note: 'API для інтеграції платежів' } },
    security: { certifications: ['PCI DSS'], features: ['3D Secure', 'Tokenization'], dataStorage: 'Україна' },
    integrations: [{ name: 'Shopify', category: 'E-commerce', isOfficial: true }],
    products: [
      { id: 'ipay-gateway', category: 'Еквайринг', name: 'iPay Gateway', tagline: 'Приймайте платежі онлайн', description: 'Платіжний шлюз для e-commerce та сервісів.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: '2.5% за транзакцію', perTransaction: '2.5%' }, features: [{ name: 'Visa/Mastercard', included: true }, { name: 'Apple Pay / Google Pay', included: true }, { name: 'Recurring', included: true }], requirements: ['Реєстрація бізнесу'], processingTime: '1-2 дні', pros: ['Конкурентна комісія', 'Зручний API'], cons: ['Менш відомий бренд'], ctaLabel: 'Підключити', ctaUrl: 'https://ipay.ua' },
    ],
    ratings: { fintodo: { overall: 72, rank: 4, categorySlug: 'payments', categoryName: 'Платежі', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Платіжний шлюз для українського e-commerce.', shortTake: 'iPay — надійний вибір для прийому онлайн-платежів.', fullVerdict: 'Конкурентна комісія та зручний API.', bestFor: [{ segment: 'E-commerce', reason: 'API + конкурентна комісія', emoji: '🛒' }], notFor: [{ segment: 'Міжнародні платежі', reason: 'Фокус на Україну', alternative: 'Fondy' }], methodology: { approach: 'Тестування API', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['CSV'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Хмарна інфраструктура.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Стабільна робота.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Підключити iPay', href: 'https://ipay.ua', isInternal: false } },
  },

  // Portmone
  {
    id: 'portmone', slug: 'portmone', name: 'Portmone', legalName: 'ТОВ «Портмоне»',
    brandNames: ['Portmone', 'Портмоне'], types: ['payment_system'],
    logo: { initials: 'PM', color: '#E91E63' }, website: 'https://portmone.com.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '32145670', legalForm: 'ТОВ', registrationNumber: '32145670', registrationDate: '2002', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2002, foundedCity: 'Київ', story: 'Portmone — один з найстаріших платіжних сервісів в Україні (з 2002 р.). 3 000+ постачальників послуг: комунальні, мобільний, інтернет, штрафи ПДР. Для бізнесу — еквайринг від 2.5%. Мобільний додаток з 4.2 в App Store.', headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2002, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['044 490 66 22'], email: ['info@portmone.com.ua'] }, support: { email: 'support@portmone.com.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://portmone.com.ua' }, ios: { available: true, rating: 4.2 }, android: { available: true, rating: 4.0 }, api: { available: true } },
    security: { certifications: ['PCI DSS'], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'portmone-pay', category: 'Платежі', name: 'Portmone Оплата', tagline: 'Оплата комунальних та послуг', description: 'Оплата комунальних послуг, мобільного, інтернету, штрафів.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Комісія від 1%' }, features: [{ name: 'Комунальні послуги', included: true }, { name: 'Мобільний зв\'язок', included: true }, { name: 'Штрафи ПДР', included: true }], requirements: ['Банківська картка'], processingTime: 'миттєво', pros: ['20+ років на ринку', 'Широкий перелік послуг'], cons: ['Комісія'], ctaLabel: 'Оплатити', ctaUrl: 'https://portmone.com.ua' },
      { id: 'portmone-biz', category: 'Еквайринг', name: 'Portmone для бізнесу', tagline: 'Приймайте платежі від клієнтів', description: 'Платіжний шлюз для прийому оплат від клієнтів.', audience: 'business', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: '2.5-3% за транзакцію' }, features: [{ name: 'Оплата послуг', included: true }, { name: 'API інтеграція', included: true }], requirements: ['Юрособа'], processingTime: '2-5 днів', pros: ['Великий трафік', 'Перевірений бренд'], cons: ['Вища комісія'], ctaLabel: 'Підключити', ctaUrl: 'https://portmone.com.ua/business' },
    ],
    ratings: { fintodo: { overall: 68, rank: 5, categorySlug: 'payments', categoryName: 'Платежі', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Квітень 2026' }, external: [{ source: 'App Store', rating: 4.2, maxRating: 5 }], averageExternal: 4.2 },
    editorial: { oneLiner: 'Portmone — піонер онлайн-платежів в Україні.', shortTake: 'Один з перших, але не найдешевший. Зручний для оплати комунальних.', fullVerdict: 'Для фізосіб — зручна оплата послуг. Для бізнесу — є дешевші альтернативи.', bestFor: [{ segment: 'Фізособи для оплати послуг', reason: 'Широкий перелік', emoji: '📱' }], notFor: [{ segment: 'E-commerce', reason: 'WayForPay дешевший' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Стабільна робота.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://portmone.com.ua', isInternal: false } },
  },

  // EasyPay
  {
    id: 'easypay', slug: 'easypay', name: 'EasyPay', legalName: 'ТОВ «ІзіПей»',
    brandNames: ['EasyPay', 'ІзіПей'], types: ['payment_system'],
    logo: { initials: 'EP', color: '#00BCD4' }, website: 'https://easypay.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '37654321', legalForm: 'ТОВ', registrationNumber: '37654321', registrationDate: '2010', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2010, foundedCity: 'Київ', story: 'EasyPay — платіжна система з мережею 5 000+ терміналів самообслуговування по Україні + онлайн-платформа. Оплата комунальних від 0.5% комісії — одна з найнижчих на ринку. Мобільний додаток та API.', headquarters: 'Київ', employeesCount: '100-200', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2010, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 217 217'], email: ['info@easypay.ua'] }, support: { freePhone: '0 800 217 217', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: 'Мережа терміналів + онлайн', regions: ['Усі області України'], branchList: [] },
    platforms: { web: { available: true, url: 'https://easypay.ua' }, ios: { available: true, rating: 4.3 }, android: { available: true, rating: 4.1 }, api: { available: true } },
    security: { certifications: ['PCI DSS'], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'easypay-bills', category: 'Платежі', name: 'Оплата послуг EasyPay', tagline: 'Комунальні та послуги без черг', description: 'Оплата комунальних послуг, мобільного, інтернету через додаток або термінали.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Комісія від 0.5%' }, features: [{ name: 'Комунальні послуги', included: true }, { name: 'Мобільний зв\'язок', included: true }, { name: 'Перекази', included: true }], requirements: ['Банківська картка'], processingTime: 'миттєво', pros: ['Низька комісія', 'Мережа терміналів'], cons: ['Менш відомий за Portmone'], ctaLabel: 'Оплатити', ctaUrl: 'https://easypay.ua' },
    ],
    ratings: { fintodo: { overall: 66, rank: 6, categorySlug: 'payments', categoryName: 'Платежі', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'EasyPay — платежі з низькою комісією.', shortTake: 'Зручний сервіс для оплати комунальних. Низька комісія.', fullVerdict: 'Альтернатива Portmone з нижчою комісією.', bestFor: [{ segment: 'Фізособи', reason: 'Низька комісія', emoji: '💳' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.6, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Термінали + онлайн.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Стабільна робота.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Оплатити', href: 'https://easypay.ua', isInternal: false } },
  },

  // Platon
  {
    id: 'platon', slug: 'platon', name: 'Platon', legalName: 'ТОВ «Платон»',
    brandNames: ['Platon'], types: ['payment_system', 'acquiring'],
    logo: { initials: 'PL', color: '#3F51B5' }, website: 'https://platon.com.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '39876543', legalForm: 'ТОВ', registrationNumber: '39876543', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [{ name: 'PCI DSS', issuedBy: 'QSA' }], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2014, foundedCity: 'Київ', story: 'Platon — платіжний провайдер, що спеціалізується на складних сегментах e-commerce: гемблінг, дейтинг, forex, нутра. Працює там, де WayForPay та LiqPay відмовляють. Міжнародні платежі, anti-fraud система, PCI DSS.', headquarters: 'Київ', employeesCount: '30-50', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2014, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@platon.com.ua'] }, support: { email: 'support@platon.com.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: '100% онлайн', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://platon.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: true, note: 'REST API' } },
    security: { certifications: ['PCI DSS'], features: ['3D Secure'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'platon-gateway', category: 'Еквайринг', name: 'Platon Gateway', tagline: 'Платіжний шлюз для бізнесу', description: 'Приймайте платежі карткою з усього світу.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 2.5% за транзакцію' }, features: [{ name: 'Міжнародні платежі', included: true }, { name: 'Anti-fraud', included: true }, { name: 'API', included: true }], requirements: ['Юрособа'], processingTime: '1-3 дні', pros: ['Високоризикові сегменти', 'Anti-fraud'], cons: ['Менш відомий'], ctaLabel: 'Підключити', ctaUrl: 'https://platon.com.ua' },
    ],
    ratings: { fintodo: { overall: 64, rank: 7, categorySlug: 'payments', categoryName: 'Платежі', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Platon — для високоризикового e-commerce.', shortTake: 'Спеціалізований провайдер для складних сегментів.', fullVerdict: 'Якщо WayForPay відмовив — Platon може підключити.', bestFor: [{ segment: 'Високоризиковий e-commerce', reason: 'Спеціалізація', emoji: '🛡' }], notFor: [{ segment: 'Звичайні магазини', reason: 'WayForPay дешевший' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.4, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: false, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['CSV'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Стабільна робота.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Підключити', href: 'https://platon.com.ua', isInternal: false } },
  },

  // GlobalMoney
  {
    id: 'globalmoney', slug: 'globalmoney', name: 'GlobalMoney', legalName: 'ТОВ «ГлобалМані»',
    brandNames: ['GlobalMoney'], types: ['payment_system', 'money_transfer'],
    logo: { initials: 'GM', color: '#FF9800' }, website: 'https://globalmoney.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '36789012', legalForm: 'ТОВ', registrationNumber: '36789012', registrationDate: '2009', registrationOrgan: 'НБУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2009, foundedCity: 'Київ', story: 'GlobalMoney — електронний гаманець, ліцензований НБУ. Перекази між гаманцями без комісії, оплата послуг, поповнення мобільного. Мережа POS-терміналів для поповнення готівкою. Ліміт гаманця — до 62 000 ₴.', headquarters: 'Київ', employeesCount: '50-100', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2009, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 303'], email: ['info@globalmoney.ua'] }, support: { freePhone: '0 800 500 303', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 0, coverageNote: '100% онлайн + термінали', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://globalmoney.ua' }, ios: { available: true, rating: 3.8 }, android: { available: true, rating: 3.5 }, api: { available: true } },
    security: { certifications: [], features: ['SSL', '2FA'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'gm-wallet', category: 'Гаманець', name: 'GlobalMoney Гаманець', tagline: 'Електронний гаманець', description: 'Електронний гаманець для оплати послуг, переказів та зберігання коштів.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовне створення гаманця' }, features: [{ name: 'Перекази', included: true }, { name: 'Оплата послуг', included: true }, { name: 'Поповнення з картки', included: true }], requirements: ['Номер телефону'], processingTime: 'миттєво', pros: ['Безкоштовний', 'Простий'], cons: ['Обмежений функціонал'], ctaLabel: 'Створити гаманець', ctaUrl: 'https://globalmoney.ua' },
    ],
    ratings: { fintodo: { overall: 60, rank: 8, categorySlug: 'payments', categoryName: 'Платежі', parentCategorySlug: 'payments', parentCategoryName: 'Платежі та еквайринг', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Електронний гаманець для простих платежів.', shortTake: 'GlobalMoney — базовий електронний гаманець.', fullVerdict: 'Для простих операцій підходить. Для бізнесу — обирайте спеціалізовані рішення.', bestFor: [{ segment: 'Фізособи для переказів', reason: 'Простий та безкоштовний', emoji: '📲' }], notFor: [{ segment: 'Бізнес', reason: 'Обмежені можливості' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Стабільна робота.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://globalmoney.ua', isInternal: false } },
  },

  // iBox
  {
    id: 'ibox', slug: 'ibox', name: 'iBox', legalName: 'ТОВ «Айбокс Банк»',
    brandNames: ['iBox', 'iBox Bank'], types: ['fintech', 'payment_system'],
    logo: { initials: 'iB', color: '#009688' }, website: 'https://ibox.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '21570492', legalForm: 'ТОВ', registrationNumber: '21570492', registrationDate: '2016', registrationOrgan: 'НБУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '189', issuedBy: 'НБУ', issuedDate: '2016', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2016, foundedCity: 'Київ', story: 'iBox — фінтех-компанія з банківською ліцензією та мережею 10 000+ терміналів. Оплата комунальних, поповнення гаманців, кешаут криптовалют. Мобільний додаток iBox Bank з карткою Visa.', headquarters: 'Київ', employeesCount: '100-300', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2016, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 300 030'], email: ['info@ibox.ua'] }, support: { freePhone: '0 800 300 030', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 5000, coverageNote: '5000+ терміналів по Україні', regions: ['Усі області'], branchList: [] },
    platforms: { web: { available: true, url: 'https://ibox.ua' }, ios: { available: true, rating: 3.5 }, android: { available: true, rating: 3.3 }, api: { available: true } },
    security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'ibox-terminal', category: 'Термінали', name: 'iBox Термінали', tagline: '5000+ точок самообслуговування', description: 'Мережа терміналів для оплати послуг, поповнення рахунків та переказів.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Комісія від 1%' }, features: [{ name: '5000+ терміналів', included: true }, { name: 'Оплата готівкою', included: true }, { name: 'Поповнення карток', included: true }], requirements: [], processingTime: 'миттєво', pros: ['Велика мережа', 'Готівкові платежі'], cons: ['Комісія', 'Обмежені функції'], ctaLabel: 'Знайти термінал', ctaUrl: 'https://ibox.ua/terminals' },
      { id: 'ibox-bank', category: 'Фінтех', name: 'iBox Bank', tagline: 'Фінтех-банк для бізнесу', description: 'Банківські послуги для бізнесу через мережу iBox.', audience: 'business', isHighlighted: false, isFeatured: true, price: { monthly: 'від 100 ₴', isFree: false, hasFreeTrial: false, pricingNote: 'Від 100 ₴/міс' }, features: [{ name: 'РКО для бізнесу', included: true }, { name: 'POS-еквайринг', included: true }], requirements: ['ЄДРПОУ'], processingTime: '1-3 дні', pros: ['Низькі тарифи', 'POS-мережа'], cons: ['Молодий банк'], ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://ibox.ua/bank' },
    ],
    ratings: { fintodo: { overall: 62, rank: 4, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех та стартапи', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'iBox — термінали + фінтех-банк.', shortTake: 'Найбільша мережа терміналів + банківські послуги.', fullVerdict: 'Для тих, хто користується готівкою або потребує POS-мережу.', bestFor: [{ segment: 'Користувачі готівки', reason: '5000+ терміналів', emoji: '🏧' }], notFor: [{ segment: 'Ті, хто шукає повноцінний банк', reason: 'Обмежений функціонал' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.2, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Термінали залежать від електрики.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Частина терміналів не працює під час блекаутів.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://ibox.ua', isInternal: false } },
  },

  // NovaPay
  {
    id: 'novapay', slug: 'novapay', name: 'NovaPay', legalName: 'ТОВ «НоваПей»',
    brandNames: ['NovaPay', 'НоваПей'], types: ['fintech', 'payment_system'],
    logo: { initials: 'NP', color: '#E2001A' }, website: 'https://novapay.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '41820517', legalForm: 'ТОВ', registrationNumber: '41820517', registrationDate: '2018', registrationOrgan: 'НБУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2018, foundedCity: 'Київ', story: 'NovaPay — фінтех-підрозділ Нової Пошти з ліцензією НБУ. Грошові перекази, оплата послуг, кредити на покупки — все через 10 000+ відділень Нової Пошти. Перекази від 0.5%, видача без картки.', headquarters: 'Київ', employeesCount: '100-300', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2018, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 500 609'], email: ['info@novapay.ua'] }, support: { freePhone: '0 800 500 609', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 10000, coverageNote: 'Через 10 000+ відділень Нової Пошти', regions: ['Усі області'], branchList: [] },
    platforms: { web: { available: true, url: 'https://novapay.ua' }, ios: { available: false }, android: { available: false }, api: { available: true } },
    security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' },
    integrations: [{ name: 'Нова Пошта', category: 'Логістика', isOfficial: true }],
    products: [
      { id: 'novapay-cod', category: 'Фінтех', name: 'NovaPay Накладний платіж', tagline: 'Оплата при отриманні посилки', description: 'Фінансове обслуговування накладних платежів через Нову Пошту.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 20 ₴ + 2% від суми' }, features: [{ name: 'Накладний платіж', included: true }, { name: '10 000+ відділень', included: true }, { name: 'Швидке зарахування', included: true }], requirements: ['Контрагент Нової Пошти'], processingTime: '1-2 дні', pros: ['Найбільша мережа', 'Довіра NovaPoshta'], cons: ['Тільки через НП'], ctaLabel: 'Підключити', ctaUrl: 'https://novapay.ua' },
    ],
    ratings: { fintodo: { overall: 70, rank: 3, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех та стартапи', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'NovaPay — фінтех від Нової Пошти.', shortTake: 'Фінансові послуги через мережу НП. Накладний платіж + перекази.', fullVerdict: 'Зручний для e-commerce, що працює через Нову Пошту.', bestFor: [{ segment: 'E-commerce через Нову Пошту', reason: '10 000+ точок', emoji: '📦' }], notFor: [{ segment: 'Ті, хто не працює з НП', reason: 'Тільки через НП' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.0, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Через НП відділення.', dataBackupNote: 'НП інфраструктура.', businessContinuityPlan: 'Група НП.', warNote: 'Працює через НП.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Підключити', href: 'https://novapay.ua', isInternal: false } },
  },

  // TASLink (Sportbank)
  {
    id: 'sportbank', slug: 'sportbank', name: 'Sportbank', legalName: 'АТ «Сенс Банк» (Sportbank)',
    brandNames: ['Sportbank', 'Спортбанк'], types: ['fintech', 'neobank'],
    logo: { initials: 'SB', color: '#00C853' }, website: 'https://sportbank.com.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '09334884', legalForm: 'АТ', registrationNumber: '09334884', registrationDate: '2020', registrationOrgan: 'НБУ', address: { legal: 'Київ', actual: 'Київ' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '199', issuedBy: 'НБУ', issuedDate: '2020', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 2020, foundedCity: 'Київ', story: 'Sportbank — мобільний необанк від TAS Group. Фішка — кешбек до 10% на спорт, розваги та їжу. Безкоштовна картка Visa, перекази без комісії між Sportbank. 500 000+ клієнтів.', headquarters: 'Київ', employeesCount: '100-200', publiclyTraded: false, keyPeople: [], milestones: [{ year: 2020, event: 'Запуск Sportbank', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: ['0 800 211 000'], email: ['info@sportbank.com.ua'] }, support: { freePhone: '0 800 211 000', chatWidget: true, workingHours: '24/7', is247: true }, social: { instagram: 'https://instagram.com/sportbank' } },
    branches: { totalCount: 0, coverageNote: '100% мобільний банк', regions: [], branchList: [] },
    platforms: { web: { available: true, url: 'https://sportbank.com.ua' }, ios: { available: true, rating: 4.6 }, android: { available: true, rating: 4.5 }, api: { available: false } },
    security: { certifications: ['PCI DSS'], features: ['2FA', 'Біометрія'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'sportbank-card', category: 'Картки', name: 'Sportbank Card', tagline: 'Кешбек на спорт та розваги', description: 'Безкоштовна картка з кешбеком у категоріях спорт, їжа, розваги.', audience: 'personal', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно', monthly: '0 ₴' }, features: [{ name: 'Кешбек на спорт', included: true }, { name: 'Apple Pay / Google Pay', included: true }, { name: 'Безкоштовне обслуговування', included: true }], requirements: ['Смартфон'], processingTime: '5 хвилин', pros: ['Безкоштовно', 'Кешбек'], cons: ['Обмежені функції'], ctaLabel: 'Завантажити', ctaUrl: 'https://sportbank.com.ua' },
    ],
    ratings: { fintodo: { overall: 66, rank: 5, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех та стартапи', reviewDate: 'Квітень 2026' }, external: [{ source: 'App Store', rating: 4.6, maxRating: 5 }], averageExternal: 4.6 },
    editorial: { oneLiner: 'Необанк для тих, хто любить спорт та кешбек.', shortTake: 'Sportbank — конкурент Monobank та А-Банку з фокусом на спортивний кешбек.', fullVerdict: 'Цікава ніша, але обмежений функціонал порівняно з Monobank.', bestFor: [{ segment: 'Молодь та спортсмени', reason: 'Кешбек на спорт', emoji: '⚽' }], notFor: [{ segment: 'Бізнес', reason: 'Тільки особисті картки' }], methodology: { approach: 'Тестування додатку', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.6, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Мобільний додаток.', dataBackupNote: 'Група TAS.', businessContinuityPlan: 'Група TAS.', warNote: 'Стабільна робота.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Завантажити', href: 'https://sportbank.com.ua', isInternal: false } },
  },

  // Concord Bank (fintech)
  {
    id: 'concordbank', slug: 'concordbank', name: 'Конкорд Банк', legalName: 'АТ «Конкорд Банк»',
    brandNames: ['Конкорд', 'Concord Bank'], types: ['fintech', 'bank'],
    logo: { initials: 'КД', color: '#673AB7' }, website: 'https://concordbank.ua',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '09807750', legalForm: 'АТ', registrationNumber: '09807750', registrationDate: '1993', registrationOrgan: 'НБУ', address: { legal: 'Дніпро', actual: 'Дніпро' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '108', issuedBy: 'НБУ', issuedDate: '1993', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1993, foundedCity: 'Дніпро', story: 'Конкорд Банк — банк з фокусом на POS-еквайринг та платіжні термінали. Один з найбільших еквайєрів України.', headquarters: 'Дніпро', employeesCount: '500-1000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1993, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Дніпро', city: 'Дніпро', country: 'Україна', phone: ['0 800 500 140'], email: ['info@concordbank.ua'] }, support: { freePhone: '0 800 500 140', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} },
    branches: { totalCount: 20, coverageNote: '20+ відділень', regions: ['Дніпро', 'Київ', 'Запоріжжя'], branchList: [] },
    platforms: { web: { available: true, url: 'https://concordbank.ua' }, ios: { available: true, rating: 3.8 }, android: { available: true, rating: 3.5 }, api: { available: false } },
    security: { certifications: ['PCI DSS'], features: ['2FA'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'concord-pos', category: 'Еквайринг', name: 'POS-еквайринг Конкорд', tagline: 'POS-термінали для бізнесу', description: 'Один з найбільших еквайєрів — POS-термінали для торгових точок.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 1.5% за транзакцію' }, features: [{ name: 'POS-термінал', included: true }, { name: 'Contactless', included: true }, { name: 'Зведення онлайн', included: true }], requirements: ['Юрособа або ФОП'], processingTime: '1-3 дні', pros: ['Великий еквайєр', 'Низькі ставки'], cons: ['Менший банк'], ctaLabel: 'Підключити', ctaUrl: 'https://concordbank.ua/business' },
    ],
    ratings: { fintodo: { overall: 64, rank: 6, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех та стартапи', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 },
    editorial: { oneLiner: 'Конкорд Банк — лідер POS-еквайрингу.', shortTake: 'Один з найбільших еквайєрів в Україні за кількістю POS-терміналів.', fullVerdict: 'Для бізнесу, якому потрібні POS-термінали з конкурентними ставками.', bestFor: [{ segment: 'Торгові точки', reason: 'Великий еквайєр, низькі ставки', emoji: '🏪' }], notFor: [{ segment: 'Фізособи', reason: 'Фокус на бізнес-еквайринг' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.4, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: false, nbu: true, dps: false, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'POS працюють при наявності електрики.', dataBackupNote: 'Резервні сервери.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Підключити POS', href: 'https://concordbank.ua', isInternal: false } },
  },

  // Укрсиббанк (fintech/bank)
  {
    id: 'ukrsibbank', slug: 'ukrsibbank', name: 'Укрсиббанк', legalName: 'АТ «Укрсиббанк»',
    brandNames: ['Укрсиббанк', 'UkrSibbank', 'BNP Paribas'], types: ['bank'],
    logo: { initials: 'УС', color: '#006633' }, website: 'https://my.ukrsibbank.com',
    verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026',
    legal: { edrpou: '09807750', legalForm: 'АТ', registrationNumber: '09807750', registrationDate: '1990', registrationOrgan: 'НБУ', address: { legal: 'Харків', actual: 'Харків' }, regulators: ['НБУ'], licenses: [{ type: 'Банківська ліцензія', number: '75', issuedBy: 'НБУ', issuedDate: '1990', status: 'active' }], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' },
    company: { foundedYear: 1990, foundedCity: 'Харків', story: 'Укрсиббанк — дочка французької BNP Paribas. Великий універсальний банк.', headquarters: 'Харків', employeesCount: '3000-5000', publiclyTraded: false, keyPeople: [], milestones: [{ year: 1990, event: 'Заснування', type: 'founding' }] },
    contacts: { mainOffice: { address: 'Харків', city: 'Харків', country: 'Україна', phone: ['0 800 505 077'], email: ['info@ukrsibbank.com'] }, support: { freePhone: '0 800 505 077', workingHours: '24/7', is247: true }, social: {} },
    branches: { totalCount: 200, coverageNote: '200+ відділень', regions: ['Харків', 'Київ', 'Дніпро', 'Одеса', 'Львів'], branchList: [] },
    platforms: { web: { available: true, url: 'https://my.ukrsibbank.com' }, ios: { available: true, rating: 4.3 }, android: { available: true, rating: 4.1 }, api: { available: false } },
    security: { certifications: ['PCI DSS', 'ISO 27001'], features: ['2FA', 'Біометрія'], dataStorage: 'Україна' },
    integrations: [],
    products: [
      { id: 'ukrsib-rko', category: 'РКО', name: 'Бізнес-рахунок Укрсиббанк', tagline: 'Міжнародний банкінг від BNP Paribas', description: 'Бізнес-рахунки, SWIFT, торгове фінансування.', audience: 'business', isHighlighted: true, isFeatured: true, price: { monthly: 'від 200 ₴', isFree: false, hasFreeTrial: false, pricingNote: 'Від 200 ₴/міс' }, features: [{ name: 'SWIFT', included: true }, { name: 'Торгове фінансування', included: true }, { name: 'Зарплатний проєкт', included: true }], requirements: ['ЄДРПОУ'], processingTime: '1-3 дні', pros: ['BNP Paribas Group', 'SWIFT'], cons: ['Висока вартість'], ctaLabel: 'Відкрити рахунок', ctaUrl: 'https://my.ukrsibbank.com/business' },
      { id: 'ukrsib-personal', category: 'Картки', name: 'Картка Укрсиббанк', tagline: 'Надійна картка від міжнародного банку', description: 'Особисті картки з ФГВФО гарантією.', audience: 'personal', isHighlighted: false, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Від 0 ₴/міс', monthly: '0 ₴' }, features: [{ name: 'ФГВФО', included: true }, { name: 'Apple Pay', included: true }], requirements: ['Паспорт', 'ІПН'], processingTime: '1 день', pros: ['Надійність BNP Paribas'], cons: ['Додаток середній'], ctaLabel: 'Відкрити картку', ctaUrl: 'https://my.ukrsibbank.com' },
    ],
    ratings: { fintodo: { overall: 72, rank: 8, categorySlug: 'banks', categoryName: 'Банки', parentCategorySlug: 'banks', parentCategoryName: 'Банки', reviewDate: 'Квітень 2026' }, external: [{ source: 'App Store', rating: 4.3, maxRating: 5 }], averageExternal: 4.3 },
    editorial: { oneLiner: 'Укрсиббанк — BNP Paribas в Україні.', shortTake: 'Великий міжнародний банк для бізнесу зі SWIFT та торговим фінансуванням.', fullVerdict: 'Надійний вибір для бізнесу з міжнародними операціями.', bestFor: [{ segment: 'Бізнес з ЗЕД', reason: 'BNP Paribas + SWIFT', emoji: '🌍' }], notFor: [{ segment: 'ФОП, що шукає безкоштовний банк', reason: 'Дорого' }], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 5, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 7.2, independenceStatement: 'Незалежна оцінка.' },
    reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [],
    compliance: { aml: true, gdpr: true, nbu: true, dps: true, dia: false, pep: true, sanctions: true, openBanking: false, reportingFormats: ['PDF'] },
    warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'BNP Paribas.', businessContinuityPlan: 'BNP Paribas Group.', warNote: 'Продовжує роботу.' },
    faq: [], knownIssues: [], cta: { primary: { label: 'Перейти на сайт', href: 'https://my.ukrsibbank.com', isInternal: false } },
  },
  // TASLink
  { id: 'taslink', slug: 'taslink', name: 'TASLink', legalName: 'ТОВ «ТАСЛінк»', brandNames: ['TASLink'], types: ['fintech'], logo: { initials: 'TA', color: '#1565C0' }, website: 'https://taslink.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '61549356', legalForm: 'ТОВ', registrationNumber: '91986409', registrationDate: '2018', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2014, foundedCity: 'Київ', story: 'Фінтех-платформа для автоматизації платежів від TAS Group.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@taslink.ua'] }, support: { email: 'info@taslink.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 5, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://taslink.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'taslink-main', category: 'Фінтех', name: 'TASLink платіжне рішення', tagline: 'Платіжні рішення для бізнесу', description: 'Фінтех-платформа для автоматизації платежів від TAS Group.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Платіжні рішення для бізнесу'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://taslink.com.ua' }], ratings: { fintodo: { overall: 68, rank: 7, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'TASLink — платіжні рішення для бізнесу.', shortTake: 'Фінтех-платформа для автоматизації платежів від TAS Group.', fullVerdict: 'Фінтех-платформа для автоматизації платежів від TAS Group.', bestFor: [{ segment: 'Бізнес', reason: 'Платіжні рішення для бізнесу', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://taslink.com.ua', isInternal: false } } },
  // SplitPay
  { id: 'splitpay', slug: 'splitpay', name: 'SplitPay', legalName: 'ТОВ «СплітПей»', brandNames: ['SplitPay'], types: ['fintech', 'credit'], logo: { initials: 'SP', color: '#43A047' }, website: 'https://splitpay.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '68767972', legalForm: 'ТОВ', registrationNumber: '86363988', registrationDate: '2019', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2016, foundedCity: 'Київ', story: 'SplitPay — сервіс «Купуй зараз — плати частинами» (BNPL) для інтернет-магазинів. Покупець розбиває оплату на 3-4 частини без переплати. Для магазинів — збільшення конверсії на 20-30%. Інтеграція через API або модулі CMS.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@splitpay.ua'] }, support: { email: 'info@splitpay.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 1, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://splitpay.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'splitpay-main', category: 'BNPL', name: 'Розстрочка SplitPay', tagline: 'Купуй зараз — плати частинами', description: 'BNPL-сервіс розстрочки для e-commerce.', audience: 'both', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Купуй зараз — плати частинами'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://splitpay.com.ua' }], ratings: { fintodo: { overall: 62, rank: 8, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'SplitPay — BNPL-розстрочка для e-commerce: покупець платить частинами, магазин отримує повну суму.', shortTake: 'BNPL-сервіс розстрочки для e-commerce.', fullVerdict: 'BNPL-сервіс розстрочки для e-commerce.', bestFor: [{ segment: 'Фізособи та бізнес', reason: 'Купуй зараз — плати частинами', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 6.2, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://splitpay.com.ua', isInternal: false } } },
  // FinHub
  { id: 'finhub', slug: 'finhub', name: 'FinHub', legalName: 'ТОВ «ФінХаб»', brandNames: ['FinHub'], types: ['fintech', 'startup_hub'], logo: { initials: 'FI', color: '#6A1B9A' }, website: 'https://finhub.com.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '16704842', legalForm: 'ТОВ', registrationNumber: '34101345', registrationDate: '2015', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2017, foundedCity: 'Київ', story: 'Хаб та акселератор для фінтех-стартапів в Україні.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@finhub.ua'] }, support: { email: 'info@finhub.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 2, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://finhub.com.ua' }, ios: { available: false }, android: { available: false }, api: { available: false } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'finhub-main', category: 'Фінтех-хаб', name: 'FinHub акселератор', tagline: 'Акселератор для фінтех-стартапів', description: 'Хаб та акселератор для фінтех-стартапів в Україні.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: false, hasFreeTrial: false, pricingNote: 'Уточнюйте' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Акселератор для фінтех-стартапів'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://finhub.com.ua' }], ratings: { fintodo: { overall: 58, rank: 9, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'FinHub — акселератор для фінтех-стартапів.', shortTake: 'Хаб та акселератор для фінтех-стартапів в Україні.', fullVerdict: 'Хаб та акселератор для фінтех-стартапів в Україні.', bestFor: [{ segment: 'Бізнес', reason: 'Акселератор для фінтех-стартапів', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 5.8, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://finhub.com.ua', isInternal: false } } },
  // Monobank API
  { id: 'monobank-api', slug: 'monobank-api', name: 'Monobank API', legalName: 'АТ «Універсал Банк»', brandNames: ['Monobank API'], types: ['fintech'], logo: { initials: 'MO', color: '#000000' }, website: 'https://api.monobank.ua', verified: true, verifiedDate: 'Квітень 2026', dataLastUpdated: '1 квітня 2026', legal: { edrpou: '42989728', legalForm: 'ТОВ', registrationNumber: '92086912', registrationDate: '2014', registrationOrgan: 'Мінʼюст', address: { legal: 'Київ', actual: 'Київ' }, regulators: [], licenses: [], certifications: [], taxStatus: 'Платник ПДВ', status: 'active' }, company: { foundedYear: 2010, foundedCity: 'Київ', story: 'Публічний API Monobank для інтеграції з фінансовими сервісами.', headquarters: 'Київ', employeesCount: '10-50', publiclyTraded: false, keyPeople: [], milestones: [] }, contacts: { mainOffice: { address: 'Київ', city: 'Київ', country: 'Україна', phone: [], email: ['info@monobank-api.ua'] }, support: { email: 'info@monobank-api.ua', workingHours: 'Пн-Пт 9:00-18:00', is247: false }, social: {} }, branches: { totalCount: 2, coverageNote: 'Онлайн', regions: ['Київ'], branchList: [] }, platforms: { web: { available: true, url: 'https://api.monobank.ua' }, ios: { available: false }, android: { available: false }, api: { available: true } }, security: { certifications: [], features: ['SSL'], dataStorage: 'Україна' }, integrations: [], products: [{ id: 'monobank-api-main', category: 'Open API', name: 'Monobank Open API', tagline: 'Відкритий API для розробників', description: 'Публічний API Monobank для інтеграції з фінансовими сервісами.', audience: 'business', isHighlighted: true, isFeatured: true, price: { isFree: true, hasFreeTrial: false, pricingNote: 'Безкоштовно' }, features: [{ name: 'Основний функціонал', included: true }], requirements: [], processingTime: '1-3 дні', pros: ['Відкритий API для розробників'], cons: [], ctaLabel: 'Дізнатись', ctaUrl: 'https://api.monobank.ua' }], ratings: { fintodo: { overall: 85, rank: 2, categorySlug: 'fintech', categoryName: 'Фінтех', parentCategorySlug: 'fintech', parentCategoryName: 'Фінтех', reviewDate: 'Квітень 2026' }, external: [], averageExternal: 0 }, editorial: { oneLiner: 'Monobank API — відкритий api для розробників.', shortTake: 'Публічний API Monobank для інтеграції з фінансовими сервісами.', fullVerdict: 'Публічний API Monobank для інтеграції з фінансовими сервісами.', bestFor: [{ segment: 'Бізнес', reason: 'Відкритий API для розробників', emoji: '⭐' }], notFor: [], methodology: { approach: 'Аналіз', testingPeriod: 'Березень 2026', testedBy: 'Редакція FINTODO', hoursSpent: 3, keyFindings: [] }, scores: [], totalFormula: 'Σ', totalScore: 8.5, independenceStatement: 'Незалежна оцінка.' }, reviewThemes: [], reviewSourcesNote: '', comparisons: [], news: [], changelog: [], awards: [], partnerships: [], compliance: { aml: true, gdpr: false, nbu: false, dps: true, dia: false, pep: false, sanctions: false, openBanking: false, reportingFormats: ['PDF'] }, warPeriod: { operationalStatus: 'Працює.', reliabilityDuringBlackouts: 'Працює.', dataBackupNote: 'Резервне копіювання.', businessContinuityPlan: 'Хмарна інфраструктура.', warNote: 'Продовжує роботу.' }, faq: [], knownIssues: [], cta: { primary: { label: 'Перейти', href: 'https://api.monobank.ua', isInternal: false } } },
];
