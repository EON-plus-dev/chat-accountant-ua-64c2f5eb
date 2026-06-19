export interface KeyFact {
  label: string;
  value: string;
  note?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  type: 'official' | 'register' | 'service' | 'info';
}

export interface CatalogType {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  emoji: string;
  audience: 'business' | 'personal' | 'both';
  description: string;
  whenYouNeedIt: string[];
  whatToPrepare: string[];
  keyFacts: KeyFact[];
  legalBasis?: string;
  fintodoHelp: string;
  relatedArticleIds: string[];
  relatedToolIds: string[];
  externalLinks: ExternalLink[];
  isPopular?: boolean;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  shortDescription: string;
  /** Контекстний підзаголовок для сторінки категорії */
  pageSubtitle: string;
  audience: 'business' | 'personal' | 'both';
  priority: number;
  types: CatalogType[];
  /** Slugs used in InstitutionProfile.types that map to this category */
  profileTypeAliases?: string[];
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. ДЕРЖАВНІ ОРГАНИ ТА СЕРВІСИ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gov', slug: 'gov',
    name: 'Державні органи та сервіси',
    emoji: '🏛',
    shortDescription: 'Органи влади, Дія, ДПС, ПФУ — реєстрація, звітність, перевірки, держпрограми',
    pageSubtitle: 'Знайдіть потрібне відділення, перевірте графік роботи та послуги',
    audience: 'both', priority: 1,
    profileTypeAliases: ['gov_service', 'gov', 'tax_authority', 'state_pension', 'diia'],
    types: [
      {
        id: 'dps', slug: 'dps',
        name: 'Державна податкова служба (ДПС)',
        shortName: 'ДПС',
        emoji: '📋',
        audience: 'both',
        description: 'ДПС — головний фіскальний орган України. Реєструє платників, адмініструє сплату податків, приймає звітність, проводить перевірки.',
        whenYouNeedIt: [
          'Реєстрація ФОП або ТОВ як платника єдиного податку або ПДВ',
          'Подача квартальної або річної декларації',
          'Оплата ЄСВ, єдиного податку, ПДФО',
          'Отримання ІПН (для фізосіб)',
          'Оскарження рішень або сплата штрафів',
          'Перевірки та камеральні звіряння',
        ],
        whatToPrepare: [
          'ЄДРПОУ або ІПН',
          'Кваліфікований електронний підпис (КЕП або Дія.Підпис)',
          'Доступ до Електронного кабінету платника',
          'Банківські виписки за звітний період',
        ],
        keyFacts: [
          { label: 'Е-кабінет', value: 'cabinet.tax.gov.ua', note: 'Всі операції онлайн — без відвідування' },
          { label: 'Гаряча лінія', value: '0800 501 007', note: 'Безкоштовно' },
          { label: 'Дедлайн декларації ФОП 3 гр.', value: '40 днів після кварталу', note: 'Q1 → до 12 травня' },
          { label: 'Штраф за просрочення', value: '340 ₴', note: 'Або 1020 ₴ при повторному' },
        ],
        legalBasis: 'Податковий кодекс України, ЗУ «Про ДПС» №1198-IX',
        fintodoHelp: 'FINTODO автоматично формує декларації, розраховує суми і нагадує про дедлайни за 3, 7 і 14 днів. Ніяких пропущених строків.',
        relatedArticleIds: ['1', '2', '14'],
        relatedToolIds: ['tax', 'esv', 'calendar'],
        externalLinks: [
          { label: 'Електронний кабінет ДПС', url: 'https://cabinet.tax.gov.ua', type: 'official' },
          { label: 'Офіційний сайт ДПС', url: 'https://tax.gov.ua', type: 'official' },
          { label: 'Реєстр платників ПДВ', url: 'https://tax.gov.ua/businesspartner', type: 'register' },
        ],
        isPopular: true,
      },
      {
        id: 'pfu', slug: 'pfu',
        name: 'Пенсійний фонд України (ПФУ)',
        shortName: 'ПФУ',
        emoji: '👴',
        audience: 'both',
        description: 'ПФУ адмініструє пенсійне страхування. Роботодавці подають звітність з нарахування ЄСВ за найнятих. ФОП сплачують ЄСВ напряму.',
        whenYouNeedIt: [
          'Нарахування ЄСВ за найнятих працівників',
          'Подача форми Д4 (ЄСВ) щомісяця якщо є найняті',
          'Отримання довідки про стаж для призначення пенсії',
          'Перевірка власного страхового стажу',
        ],
        whatToPrepare: [
          'ЄДРПОУ роботодавця',
          'КЕП для подачі звітності онлайн',
          'Відомості про нарахування зарплати',
        ],
        keyFacts: [
          { label: 'Ставка ЄСВ', value: '22%', note: 'Від нарахованої зарплати — платить роботодавець' },
          { label: 'Мінімальний ЄСВ ФОП', value: '1 760 ₴/міс', note: '22% від мінзарплати 8 000 ₴' },
          { label: 'Термін подачі Д4', value: '20-е число наступного місяця' },
          { label: 'Перевірка стажу', value: 'portal.pfu.gov.ua' },
        ],
        legalBasis: 'ЗУ №2464-VI «Про єдиний соціальний внесок»',
        fintodoHelp: 'FINTODO автоматично розраховує ЄСВ для ФОП та найнятих, формує платіжки і відстежує строки.',
        relatedArticleIds: ['1', '12'],
        relatedToolIds: ['esv', 'salary'],
        externalLinks: [
          { label: 'Особистий кабінет ПФУ', url: 'https://portal.pfu.gov.ua', type: 'official' },
          { label: 'Офіційний сайт ПФУ', url: 'https://www.pfu.gov.ua', type: 'official' },
        ],
      },
      {
        id: 'dracs', slug: 'dracs',
        name: 'ДРАЦС (Реєстрація актів цивільного стану)',
        shortName: 'ДРАЦС',
        emoji: '📜',
        audience: 'personal',
        description: 'Державна реєстрація народження, шлюбу, смерті та зміни імені. Видає свідоцтва що необхідні для юридичних та фінансових операцій.',
        whenYouNeedIt: [
          'Отримання свідоцтва про народження (для ІПН дитини)',
          'Реєстрація шлюбу (для зміни прізвища в документах)',
          'Свідоцтво про смерть (для оформлення спадщини)',
          'Зміна імені або прізвища',
        ],
        whatToPrepare: ['Паспорт або ID-картка', 'Відповідні документи залежно від типу дії'],
        keyFacts: [
          { label: 'Онлайн через Дія', value: 'Свідоцтво про народження', note: 'Для немовлят через Дія' },
          { label: 'Строк видачі', value: 'У день звернення' },
        ],
        legalBasis: 'ЗУ «Про державну реєстрацію актів цивільного стану»',
        fintodoHelp: 'Не пов\'язано напряму, але зміна прізвища потребує оновлення даних у ДПС та банку — FINTODO нагадає про необхідні кроки.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Запис через Дія', url: 'https://diia.gov.ua', type: 'service' },
          { label: 'Пошук відділень', url: 'https://dracs.minjust.gov.ua', type: 'official' },
        ],
      },
      {
        id: 'dabi', slug: 'dabi',
        name: 'ДАБІ (Державна архітектурно-будівельна інспекція)',
        shortName: 'ДАБІ',
        emoji: '🏗',
        audience: 'business',
        description: 'Видає дозволи на будівництво, введення в експлуатацію нерухомості та реконструкцію. Потрібна для бізнесу що будує або реконструює приміщення.',
        whenYouNeedIt: [
          'Будівництво нового приміщення для бізнесу',
          'Реконструкція або капремонт існуючого',
          'Введення будівлі в експлуатацію',
          'Декларація про початок будівельних робіт',
        ],
        whatToPrepare: [
          'Проектна документація',
          'Право власності або оренди на земельну ділянку',
          'Технічні умови від ресурсопостачальних організацій',
        ],
        keyFacts: [
          { label: 'Онлайн-сервіс', value: 'etown.gov.ua', note: 'Всі дозвільні документи онлайн' },
          { label: 'СС2 клас', value: 'Без ліцензії', note: 'Дрібний ремонт — декларативно' },
          { label: 'СС3 клас', value: 'Дозвіл обов\'язковий', note: 'Великі об\'єкти' },
        ],
        legalBasis: 'ЗУ «Про регулювання містобудівної діяльності»',
        fintodoHelp: 'Не пов\'язано напряму.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Єдина система е-дозволів', url: 'https://etown.gov.ua', type: 'service' },
        ],
      },
      // NEW: Дія (держсервіси)
      {
        id: 'diia', slug: 'diia',
        name: 'Дія (державні послуги онлайн)',
        shortName: 'Дія',
        emoji: '📱',
        audience: 'both',
        description: 'Єдиний цифровий портал для отримання державних послуг — реєстрація ФОП, е-паспорт, довідки, субсидії, єПідтримка, єОселя.',
        whenYouNeedIt: [
          'Реєстрація ФОП онлайн за 15 хвилин',
          'Отримання е-паспорта або довідки ВПО',
          'Подання заявки на єОселя або єПідтримка',
          'Отримання КЕП (Дія.Підпис)',
          'Перевірка штрафів та судових рішень',
        ],
        whatToPrepare: ['Смартфон з додатком Дія', 'ID-картка з NFC або BankID'],
        keyFacts: [
          { label: 'Додаток', value: 'diia.gov.ua', note: '20+ млн користувачів' },
          { label: 'Реєстрація ФОП', value: 'Безкоштовно за 15 хв' },
          { label: 'е-Паспорт', value: 'Юридична сила паспорта' },
          { label: 'КЕП', value: 'Безкоштовний Дія.Підпис' },
        ],
        legalBasis: 'ЗУ «Про електронні публічні послуги»',
        fintodoHelp: 'FINTODO використовує Дія.Підпис для автоматичної подачі декларацій.',
        relatedArticleIds: ['6', '15'],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Дія — портал', url: 'https://diia.gov.ua', type: 'official' },
          { label: 'Дія.Бізнес', url: 'https://business.diia.gov.ua', type: 'service' },
        ],
        isPopular: true,
      },
      // Moved from pension: Державна пенсія
      {
        id: 'state-pension', slug: 'state-pension',
        name: 'Державна пенсія',
        shortName: 'Пенсія',
        emoji: '📋',
        audience: 'personal',
        description: 'Державне пенсійне забезпечення через ПФУ — обов\'язкове страхування через ЄСВ, призначення та перерахунок пенсії.',
        whenYouNeedIt: [
          'Перевірка страхового стажу',
          'Оформлення пенсії',
          'Перерахунок пенсії після продовження роботи',
        ],
        whatToPrepare: ['Паспорт', 'Трудова книжка', 'Довідки про зарплату'],
        keyFacts: [
          { label: 'Мінімальний стаж', value: '25/30 років', note: 'Чоловіки/жінки (зростає)' },
          { label: 'Пенсійний вік', value: '60/60 років', note: 'Зрівнявся з 2021' },
          { label: 'Мінімальна пенсія', value: '2 361 ₴/міс', note: '2024 рік' },
        ],
        legalBasis: 'ЗУ «Про загальнообов\'язкове державне пенсійне страхування»',
        fintodoHelp: 'FINTODO розраховує ЄСВ для ФОП, що формує страховий стаж для пенсії.',
        relatedArticleIds: [],
        relatedToolIds: ['esv'],
        externalLinks: [
          { label: 'Кабінет ПФУ', url: 'https://portal.pfu.gov.ua', type: 'official' },
        ],
      },
      {
        id: 'customs', slug: 'customs',
        name: 'Митна служба України',
        shortName: 'Митниця',
        emoji: '🛃',
        audience: 'business',
        description: 'Державний орган що контролює переміщення товарів через кордон. Для бізнесу що імпортує або експортує — взаємодія обов\'язкова.',
        whenYouNeedIt: [
          'Імпорт товарів для продажу або виробництва',
          'Експорт продукції за кордон',
          'Тимчасове ввезення обладнання',
          'Отримання міжнародної посилки понад €150',
        ],
        whatToPrepare: ['Контракт з постачальником', 'Інвойс і пакувальний лист', 'Сертифікати відповідності', 'Митний брокер (рекомендовано)'],
        keyFacts: [
          { label: 'Ввізне мито', value: '0-10%', note: 'Залежно від коду УКТ ЗЕД' },
          { label: 'ПДВ при імпорті', value: '20%', note: 'Від митної вартості + мито' },
          { label: 'Е-декларування', value: 'cabinet.sfs.gov.ua', note: 'Онлайн митне оформлення' },
          { label: 'Безмитний ліміт', value: '€150', note: 'Для міжнародних посилок фізособам' },
        ],
        legalBasis: 'Митний кодекс України',
        fintodoHelp: 'Митні платежі при імпорті — включаються до вартості товарів при обліку.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Митна служба', url: 'https://customs.gov.ua', type: 'official' },
          { label: 'Коди УКТ ЗЕД', url: 'https://uktved.com.ua', type: 'info' },
          { label: 'Е-декларування', url: 'https://cabinet.sfs.gov.ua', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. БАНКИ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'banks', slug: 'banks',
    name: 'Банки',
    emoji: '🏦',
    shortDescription: 'Банки для бізнесу та фізосіб — рахунки, депозити, необанки, кредитні спілки',
    pageSubtitle: 'Порівняйте умови, тарифи та рейтинги банків для бізнесу або особистих потреб',
    audience: 'both', priority: 2,
    profileTypeAliases: ['bank', 'neobank', 'personal'],
    types: [
      {
        id: 'bank-business', slug: 'bank-business',
        name: 'Банки для бізнесу',
        shortName: 'Банк ФОП/ТОВ',
        emoji: '🏦',
        audience: 'business',
        description: 'Поточний рахунок — обов\'язкова умова для ФОП і ТОВ. Через рахунок проходять всі розрахунки з клієнтами і постачальниками, сплата податків.',
        whenYouNeedIt: [
          'Відразу після реєстрації ФОП або ТОВ — рахунок обов\'язковий',
          'Прийом безготівкової оплати від клієнтів',
          'Оплата постачальникам і підрядникам',
          'Сплата податків: ЄП, ЄСВ, ПДФО',
          'Конвертація валюти при роботі з нерезидентами',
        ],
        whatToPrepare: [
          'Паспорт + ІПН (для ФОП)',
          'Статут і витяг з ЄДР (для ТОВ)',
          'Рішення про призначення директора (ТОВ)',
          'Для онлайн-банків: тільки смартфон',
        ],
        keyFacts: [
          { label: 'Термін відкриття', value: '15 хв – 3 дні', note: 'Залежно від банку' },
          { label: 'Обслуговування ФОП', value: 'від 0 ₴/міс', note: 'Необанки — безкоштовно' },
          { label: 'Обов\'язковість', value: 'Не обов\'язково законом', note: 'Але практично необхідно' },
          { label: 'Звітність до ДПС', value: 'Банк подає автоматично', note: 'Про відкриття/закриття рахунку' },
        ],
        legalBasis: 'ЗУ «Про банки і банківську діяльність»',
        fintodoHelp: 'FINTODO інтегрується з Monobank і Приватбанком — автоматично підтягує виписки для обліку доходів.',
        relatedArticleIds: ['1'],
        relatedToolIds: ['counterparty'],
        externalLinks: [
          { label: 'Порівняти банки для ФОП', url: '/dovidnyky/ustanovy/banks', type: 'info' },
          { label: 'Monobank Бізнес', url: 'https://mbnk.biz', type: 'service' },
          { label: 'Приватбанк для бізнесу', url: 'https://privatbank.ua/business', type: 'service' },
        ],
        isPopular: true,
      },
      // Moved from personal category
      {
        id: 'bank-personal', slug: 'bank-personal',
        name: 'Банки для фізосіб',
        shortName: 'Банк фізособи',
        emoji: '💳',
        audience: 'personal',
        description: 'Поточний рахунок, картка, депозити і кредити для фізичних осіб. В Україні — обов\'язковий інструмент для отримання зарплати, соцвиплат та повсякденних розрахунків.',
        whenYouNeedIt: [
          'Отримання зарплати або соціальних виплат',
          'Повсякденні платежі і покупки',
          'Депозити і накопичення',
          'ОВДП як безпечна інвестиція',
          'Кредит на авто або побутову техніку',
          'Отримання субсидій та пільг',
        ],
        whatToPrepare: ['Паспорт або ID-картка', 'ІПН (РНОКПП)'],
        keyFacts: [
          { label: 'ФГВФО гарантія', value: '600 000 ₴', note: 'На одну особу в одному банку' },
          { label: 'ОВДП дохідність', value: 'від 14% річних', note: 'Без ПДФО — через Monobank' },
          { label: 'Безкоштовні картки', value: 'Monobank, Sense Bank', note: 'Без щомісячної плати' },
        ],
        legalBasis: 'ЗУ «Про банки і банківську діяльність», ЗУ «Про захист прав споживачів»',
        fintodoHelp: 'FINTODO допомагає розраховувати ПДФО з доходів від депозитів і декларувати інвестиційний дохід.',
        relatedArticleIds: ['22', '25'],
        relatedToolIds: ['salary'],
        externalLinks: [
          { label: 'Реєстр банків НБУ', url: 'https://bank.gov.ua/ua/supervision/banks', type: 'register' },
          { label: 'ФГВФО — перевірити страхування', url: 'https://fg.gov.ua', type: 'official' },
        ],
      },
      {
        id: 'credit-union', slug: 'credit-union',
        name: 'Кредитні спілки',
        shortName: 'Кредитна спілка',
        emoji: '🤝',
        audience: 'both',
        description: 'Небанківські фінансові кооперативи — надають кредити членам спілки на пільгових умовах. Альтернатива банкам для малого бізнесу та особистих позик.',
        whenYouNeedIt: [
          'Невеликий кредит без бюрократії великого банку',
          'Кредит для малого бізнесу або фермера',
          'Відкладення заощаджень з вищою ставкою ніж у банку',
        ],
        whatToPrepare: ['Паспорт', 'Членство у спілці (зазвичай мінімальний внесок)'],
        keyFacts: [
          { label: 'Регулятор', value: 'НБУ (з 2020)', note: 'Раніше — Нацкомфінпослуг' },
          { label: 'Реєстр спілок', value: 'НБУ публічний реєстр' },
          { label: 'Гарантія вкладів', value: 'Не гарантовані ФГВФО', note: 'Ризик вищий ніж у банку' },
        ],
        legalBasis: 'ЗУ «Про кредитні спілки»',
        fintodoHelp: 'Відсотки за кредитом кредитної спілки не відносяться до витрат на єдиному податку.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр кредитних спілок НБУ', url: 'https://bank.gov.ua', type: 'register' },
        ],
      },
      // Moved from fintech: Необанки
      {
        id: 'neobank', slug: 'neobank',
        name: 'Необанки',
        shortName: 'Необанк',
        emoji: '📱',
        audience: 'both',
        description: 'Цифрові банки без відділень — обслуговування повністю через додаток. Швидке відкриття рахунку, низькі комісії, зручний інтерфейс.',
        whenYouNeedIt: [
          'Відкриття рахунку за 15 хвилин з телефону',
          'Безкоштовне обслуговування ФОП',
          'Миттєві виписки та аналітика витрат',
        ],
        whatToPrepare: ['Смартфон', 'Паспорт або ID-картка', 'ІПН'],
        keyFacts: [
          { label: 'Monobank', value: '8+ млн клієнтів', note: 'Лідер необанкінгу в Україні' },
          { label: 'Sense Bank', value: 'Колишній Альфа', note: 'Безкоштовні картки' },
          { label: 'ПУМБ Online', value: 'Цифрове відділення', note: 'Великий банк у digital форматі' },
        ],
        legalBasis: 'ЗУ «Про банки і банківську діяльність»',
        fintodoHelp: 'FINTODO інтегрується з Monobank через API для автоматичного обліку.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Monobank', url: 'https://monobank.ua', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. СТРАХУВАННЯ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'insurance', slug: 'insurance',
    name: 'Страхування',
    emoji: '🛡',
    shortDescription: 'ОСЦПВ, ДМС, майнове, подорожі, життя — для бізнесу та фізосіб',
    pageSubtitle: 'Порівняйте умови страхування від провідних компаній України',
    audience: 'both', priority: 3,
    profileTypeAliases: ['insurance'],
    types: [
      {
        id: 'ostsv', slug: 'ostsv',
        name: 'ОСЦПВ (автострахування)',
        shortName: 'ОСЦПВ',
        emoji: '🚗',
        audience: 'both',
        description: 'Обов\'язкове страхування цивільно-правової відповідальності водіїв — \'автоцивілка\'. Вимагається від усіх власників автомобілів.',
        whenYouNeedIt: [
          'Є автомобіль — поліс обов\'язковий',
          'При купівлі нового авто',
          'Щороку при закінченні поліса',
        ],
        whatToPrepare: ['Техпаспорт авто', 'Водійське посвідчення', 'Паспорт'],
        keyFacts: [
          { label: 'Обов\'язковість', value: 'Так, штраф 425 ₴ без поліса' },
          { label: 'Вартість', value: 'від 500 ₴/рік', note: 'Залежить від авто і регіону' },
          { label: 'Онлайн оформлення', value: 'За 5 хвилин', note: 'Через сайт страховика або агрегатор' },
          { label: 'Перевірити поліс', value: 'mtsbu.ua', note: 'Моторне (транспортне) страхове бюро' },
        ],
        legalBasis: 'ЗУ «Про обов\'язкове страхування цивільно-правової відповідальності»',
        fintodoHelp: 'ОСЦПВ для корпоративного транспорту — витрати можна враховувати на загальній системі.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Перевірити поліс', url: 'https://policy.mtsbu.ua', type: 'register' },
          { label: 'МТСБУ офіційний сайт', url: 'https://mtsbu.ua', type: 'official' },
        ],
        isPopular: true,
      },
      {
        id: 'dms', slug: 'dms',
        name: 'Медичне страхування (ДМС)',
        shortName: 'ДМС',
        emoji: '⚕️',
        audience: 'both',
        description: 'Добровільне медичне страхування — для отримання медпомощи у приватних клініках. Роботодавці використовують як соціальний пакет для залучення персоналу.',
        whenYouNeedIt: [
          'ТОВ або ФОП хоче надати медстрахування співробітникам',
          'Фізособа хоче покрити витрати на приватну медицину',
        ],
        whatToPrepare: ['Паспорт', 'Для корпоративного — список співробітників'],
        keyFacts: [
          { label: 'Корпоративний ДМС', value: 'від 3 000 ₴/рік на особу' },
          { label: 'Оподаткування', value: 'До 30% мінзарплати без ПДФО', note: 'Для корпоративного ДМС' },
        ],
        legalBasis: 'ЗУ «Про страхування», ПКУ ст.164.2.16',
        fintodoHelp: 'Корпоративний ДМС — відносяться до витрат на загальній системі. FINTODO допомагає правильно відображати у звітності.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр страховиків НБУ', url: 'https://bank.gov.ua', type: 'register' },
        ],
      },
      {
        id: 'property-insurance', slug: 'property-insurance',
        name: 'Страхування майна та бізнесу',
        shortName: 'Майнове страхування',
        emoji: '🏠',
        audience: 'both',
        description: 'Захист нерухомості, обладнання, товарних запасів від пожежі, крадіжки та стихійних лих. Для бізнесу — також страхування відповідальності і вантажів.',
        whenYouNeedIt: [
          'Офіс або склад — від пожежі і залиття',
          'Обладнання і товари — від крадіжки',
          'Вантажі при транспортуванні',
          'Відповідальність перед клієнтами і третіми особами',
          'Іпотека — банк зазвичай вимагає страхування квартири',
        ],
        whatToPrepare: ['Документи на майно', 'Оцінка вартості', 'Опис об\'єкта страхування'],
        keyFacts: [
          { label: 'Страхування квартири', value: 'від 500 ₴/рік', note: 'Базовий поліс' },
          { label: 'Страхування майна ФОП', value: 'Індивідуально', note: '0.1-0.5% від вартості/рік' },
        ],
        legalBasis: 'ЗУ «Про страхування»',
        fintodoHelp: 'Страхові платежі на загальній системі включаються до витрат.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр страховиків НБУ', url: 'https://bank.gov.ua', type: 'register' },
        ],
      },
      // NEW: Страхування подорожей
      {
        id: 'travel-insurance', slug: 'travel-insurance',
        name: 'Страхування подорожей',
        shortName: 'Туристичне',
        emoji: '✈️',
        audience: 'both',
        description: 'Медичне страхування для поїздок за кордон. Обов\'язкове для отримання Шенгенської візи. Покриває медичні витрати, евакуацію, втрату багажу.',
        whenYouNeedIt: [
          'Поїздка до країн Шенгену — обов\'язкова умова візи',
          'Будь-яка подорож за кордон — рекомендовано',
          'Ділові відрядження',
        ],
        whatToPrepare: ['Паспорт', 'Дати поїздки', 'Країна призначення'],
        keyFacts: [
          { label: 'Для Шенгену', value: 'від 150 ₴/тиждень', note: 'Покриття від €30 000' },
          { label: 'Мін. покриття Шенген', value: '€30 000', note: 'Вимога візового центру' },
          { label: 'Онлайн оформлення', value: 'За 5 хвилин' },
        ],
        legalBasis: 'ЗУ «Про страхування»',
        fintodoHelp: 'Витрати на страхування ділових поїздок можна включити до витрат на загальній системі.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Порівняти страховки', url: 'https://hotline.finance/ua/travel-insurance', type: 'service' },
        ],
      },
      // NEW: Страхування життя
      {
        id: 'life-insurance', slug: 'life-insurance',
        name: 'Страхування життя',
        shortName: 'Життя',
        emoji: '❤️',
        audience: 'both',
        description: 'Накопичувальне та ризикове страхування життя. Податкова пільга: внески зменшують базу оподаткування ПДФО.',
        whenYouNeedIt: [
          'Захист сім\'ї на випадок смерті або інвалідності',
          'Накопичення з гарантованим доходом',
          'Використання податкової пільги',
        ],
        whatToPrepare: ['Паспорт', 'Медичний огляд (для великих сум)'],
        keyFacts: [
          { label: 'Податкова пільга', value: 'До 15% доходу', note: 'Зменшення бази ПДФО — ПКУ ст.166.3.5' },
          { label: 'Строк', value: '5-30 років', note: 'Накопичувальне страхування' },
        ],
        legalBasis: 'ЗУ «Про страхування»',
        fintodoHelp: 'Внески на страхування життя можна включити до податкової знижки при декларуванні.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр страховиків НБУ', url: 'https://bank.gov.ua', type: 'register' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. ЮРИДИЧНІ ПОСЛУГИ
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'legal', slug: 'legal',
    name: 'Юридичні послуги',
    emoji: '⚖️',
    shortDescription: 'Нотаріуси, адвокати, суди — юридичний супровід бізнесу і фізосіб',
    pageSubtitle: 'Знайдіть нотаріуса, адвоката або юридичний сервіс для вашої ситуації',
    audience: 'both', priority: 4,
    profileTypeAliases: ['legal_service', 'legal_database', 'notary', 'lawyer', 'legal_consulting'],
    types: [
      {
        id: 'notary', slug: 'notary',
        name: 'Нотаріус',
        shortName: 'Нотаріус',
        emoji: '🖊',
        audience: 'both',
        description: 'Нотаріус засвідчує юридичну значущість документів — договорів, довіреностей, згоди на виїзд дитини, спадщини. Частина дій без нотаріуса неможлива.',
        whenYouNeedIt: [
          'Купівля-продаж нерухомості (обов\'язково)',
          'Оформлення спадщини',
          'Довіреність на авто або нерухомість',
          'Засвідчення статуту ТОВ (альтернативно через Дія)',
          'Договір дарування',
          'Шлюбний договір',
          'Згода на виїзд дитини за кордон',
        ],
        whatToPrepare: ['Паспорт всіх сторін', 'Документи на майно (якщо про нерухомість)', 'ІПН'],
        keyFacts: [
          { label: 'Пошук нотаріуса', value: 'notariat.in.ua', note: 'Єдиний реєстр нотаріусів' },
          { label: 'Засвідчення підпису', value: 'від 200 ₴' },
          { label: 'Договір нерухомості', value: 'від 3 000 ₴ + 1% від суми' },
          { label: 'Пенсійний збір', value: '1% від вартості нерухомості', note: 'Сплачує покупець' },
        ],
        legalBasis: 'ЗУ «Про нотаріат»',
        fintodoHelp: 'Нотаріальні витрати при купівлі нерухомості для бізнесу — враховуються на загальній системі.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Єдиний реєстр нотаріусів', url: 'https://notariat.in.ua', type: 'register' },
          { label: 'Єдиний реєстр довіреностей', url: 'https://erb.minjust.gov.ua', type: 'register' },
        ],
        isPopular: true,
      },
      {
        id: 'lawyer', slug: 'lawyer',
        name: 'Адвокати та юридичні компанії',
        shortName: 'Адвокат',
        emoji: '👔',
        audience: 'both',
        description: 'Юридичний супровід бізнесу: договори, трудові спори, податкові перевірки, корпоративні питання. Адвокат — для судових справ.',
        whenYouNeedIt: [
          'Складання і перевірка договорів',
          'Захист при податковій перевірці',
          'Трудові спори з працівниками',
          'Реєстрація і реструктуризація бізнесу',
          'Представництво в суді',
          'Інтелектуальна власність і торгові марки',
        ],
        whatToPrepare: ['Документи по конкретному питанню'],
        keyFacts: [
          { label: 'Реєстр адвокатів', value: 'unba.org.ua', note: 'Перевірити адвоката' },
          { label: 'Безоплатна правова допомога', value: 'legalaid.gov.ua', note: 'Для малозабезпечених' },
          { label: 'Вартість консультації', value: 'від 500 ₴/год', note: 'Середня по ринку' },
        ],
        legalBasis: 'ЗУ «Про адвокатуру та адвокатську діяльність»',
        fintodoHelp: 'Юридичні послуги на загальній системі — включаються до витрат з підтвердними документами.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр адвокатів НААУ', url: 'https://unba.org.ua/reestry', type: 'register' },
          { label: 'Безоплатна правова допомога', url: 'https://legalaid.gov.ua', type: 'service' },
        ],
      },
      {
        id: 'court', slug: 'court',
        name: 'Суди та арбітраж',
        shortName: 'Суд',
        emoji: '🏛',
        audience: 'both',
        description: 'Вирішення спорів через суд або арбітраж. Господарський суд — для підприємницьких спорів. Адміністративний — для оскарження рішень держорганів.',
        whenYouNeedIt: [
          'Стягнення боргу з контрагента',
          'Оскарження рішення ДПС або іншого органу',
          'Трудовий спір',
          'Захист прав споживача',
          'Розгляд кримінальної справи',
        ],
        whatToPrepare: [
          'Позовна заява з документальним підтвердженням',
          'Квитанція про сплату судового збору',
          'Документи що підтверджують ваші вимоги',
        ],
        keyFacts: [
          { label: 'Судовий збір (господарський)', value: '1.5% від суми позову', note: 'Але не менше 1 розм. прожиткового мінімуму' },
          { label: 'Єдиний реєстр рішень', value: 'reyestr.court.gov.ua', note: 'Перевірити судові рішення' },
          { label: 'Подання позову онлайн', value: 'vksiis.com.ua', note: 'Електронний суд' },
        ],
        legalBasis: 'ЗУ «Про судоустрій і статус суддів», ГПК України',
        fintodoHelp: 'Судові витрати на загальній системі — відносяться до витрат при наявності рішення суду.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Єдиний державний реєстр судових рішень', url: 'https://reyestr.court.gov.ua', type: 'register' },
          { label: 'Електронний суд', url: 'https://vksiis.com.ua', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. ПЛАТЕЖІ ТА ЕКВАЙРИНГ (merged payments + acquiring)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'payments', slug: 'payments',
    name: 'Платежі та еквайринг',
    emoji: '💳',
    shortDescription: 'Прийом карток, POS-термінали, онлайн-оплата, SWIFT, міжнародні перекази',
    pageSubtitle: 'Оберіть платіжне рішення для прийому оплати та міжнародних переказів',
    audience: 'both', priority: 5,
    profileTypeAliases: ['payment_system', 'money_transfer', 'acquiring'],
    types: [
      {
        id: 'pos-acquiring', slug: 'pos-acquiring',
        name: 'POS-еквайринг',
        shortName: 'POS',
        emoji: '🖥',
        audience: 'business',
        description: 'Прийом оплати картками в торговій точці через POS-термінал або смартфон. Обов\'язковий для більшості ФОП з товарообігом.',
        whenYouNeedIt: [
          'Магазин, кафе або салон — прийом карток',
          'Виїзна торгівля з мобільним терміналом',
          'Прийом Apple/Google Pay',
        ],
        whatToPrepare: ['Рахунок у банку', 'ЄДРПОУ', 'РРО або ПРРО'],
        keyFacts: [
          { label: 'Комісія', value: '1.2–1.8%', note: 'Від суми транзакції' },
          { label: 'Зарахування', value: 'Наступний робочий день' },
          { label: 'SoftPOS', value: 'Термінал на смартфоні', note: 'Monobank, Приватбанк' },
        ],
        legalBasis: 'ЗУ «Про платіжні системи», ЗУ «Про застосування РРО»',
        fintodoHelp: 'Надходження від еквайрингу автоматично обліковуються при інтеграції з банком.',
        relatedArticleIds: ['20'],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Monobank Бізнес термінал', url: 'https://mbnk.biz', type: 'service' },
        ],
        isPopular: true,
      },
      {
        id: 'internet-acquiring', slug: 'internet-acquiring',
        name: 'Інтернет-еквайринг',
        shortName: 'Онлайн-оплата',
        emoji: '🌐',
        audience: 'business',
        description: 'Прийом онлайн-оплати на сайті або в додатку — платіжні шлюзи LiqPay, Wayforpay, Fondy та інші.',
        whenYouNeedIt: [
          'Інтернет-магазин — кнопка «Оплатити»',
          'SaaS — підписки і рекурентні платежі',
          'Послуги онлайн — оплата за бронювання',
        ],
        whatToPrepare: ['Сайт або додаток', 'Рахунок у банку', 'ЄДРПОУ', 'Інтеграція API'],
        keyFacts: [
          { label: 'LiqPay', value: '2.75% + 3 ₴', note: 'Від Приватбанку' },
          { label: 'Wayforpay', value: 'від 1.5%', note: 'Популярний у e-commerce' },
          { label: 'Fondy', value: 'від 1.4%', note: '150+ методів оплати' },
          { label: 'Mono Acquiring', value: 'від 1%', note: 'Для великих обсягів' },
        ],
        legalBasis: 'ЗУ «Про платіжні системи»',
        fintodoHelp: 'FINTODO інтегрується з банками для автоматичного обліку онлайн-продажів.',
        relatedArticleIds: ['20'],
        relatedToolIds: [],
        externalLinks: [
          { label: 'LiqPay', url: 'https://liqpay.ua', type: 'service' },
          { label: 'Wayforpay', url: 'https://wayforpay.com', type: 'service' },
          { label: 'Fondy', url: 'https://fondy.ua', type: 'service' },
        ],
      },
      {
        id: 'swift-iban', slug: 'swift-iban',
        name: 'SWIFT та міжнародні перекази',
        shortName: 'SWIFT',
        emoji: '🌍',
        audience: 'business',
        description: 'Міжнародна система банківських переказів. ФОП що отримують оплату від іноземних клієнтів — зазвичай через SWIFT або сервіси типу Wise, Payoneer.',
        whenYouNeedIt: [
          'Отримання оплати від іноземного клієнта',
          'Оплата іноземному постачальнику',
          'Переказ коштів за кордон',
          'Отримання зарплати від іноземного роботодавця',
        ],
        whatToPrepare: ['IBAN рахунку', 'SWIFT-код банку', 'Повна адреса банку', 'Контракт або інвойс для валютного контролю'],
        keyFacts: [
          { label: 'Комісія SWIFT', value: '$15–40 за переказ', note: 'Плюс комісія банку відправника' },
          { label: 'Термін', value: '1–3 банківські дні' },
          { label: 'Ліміт без декларації', value: 'Немає ліміту при наявності контракту' },
          { label: 'Альтернатива', value: 'Wise, Payoneer', note: 'Дешевше і швидше для IT' },
        ],
        legalBasis: 'Постанова НБУ №5 від 2019 (валютний нагляд)',
        fintodoHelp: 'FINTODO автоматично перераховує валютні надходження за курсом НБУ і правильно відображає в декларації.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Правила валютного нагляду НБУ', url: 'https://bank.gov.ua', type: 'official' },
          { label: 'Wise (вигідно для IT)', url: 'https://wise.com', type: 'service' },
        ],
      },
      // Merged from personal: Грошові перекази (фізособи)
      {
        id: 'international-transfers', slug: 'international-transfers',
        name: 'Міжнародні перекази (фізособи)',
        shortName: 'Перекази',
        emoji: '📤',
        audience: 'personal',
        description: 'Переказ грошей родичам за кордон або отримання з-за кордону — через Western Union, MoneyGram, Wise або банківський SWIFT.',
        whenYouNeedIt: [
          'Відправити гроші родичам за кордоном',
          'Отримати допомогу від родичів за кордоном',
          'Оплатити навчання або послуги за кордоном',
        ],
        whatToPrepare: ['Паспорт', 'Дані отримувача', 'Ліміти залежать від системи'],
        keyFacts: [
          { label: 'Western Union', value: 'Готівка в 200+ країнах', note: 'Виплата за 10 хвилин' },
          { label: 'Wise', value: '0.41%+ комісія', note: 'Найвигідніший курс' },
          { label: 'MoneyGram', value: 'Аналогічно WU' },
          { label: 'Ліміт для фізосіб', value: '150 000 ₴/рік без декларації', note: 'НБУ постанова' },
        ],
        legalBasis: 'Постанова НБУ про транскордонні перекази',
        fintodoHelp: 'Отримані перекази з-за кордону можуть бути оподатковуваним доходом — FINTODO допомагає розрахувати ПДФО.',
        relatedArticleIds: ['21'],
        relatedToolIds: ['salary'],
        externalLinks: [
          { label: 'Western Union Україна', url: 'https://westernunion.com/ua', type: 'service' },
          { label: 'Wise', url: 'https://wise.com', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. ІНВЕСТИЦІЇ ТА БРОКЕРИ (merged broker + investment_biz + pension НПФ)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'invest', slug: 'invest',
    name: 'Інвестиції та брокери',
    emoji: '📈',
    shortDescription: 'Брокери, ОВДП, акції, ETF, НПФ, ФГВФО — все про інвестування коштів',
    pageSubtitle: 'Порівняйте брокерів, умови інвестування та дохідність фінансових інструментів',
    audience: 'both', priority: 6,
    profileTypeAliases: ['broker', 'investment', 'ovdp'],
    types: [
      {
        id: 'stock-broker', slug: 'stock-broker',
        name: 'Фондовий брокер',
        shortName: 'Брокер',
        emoji: '📈',
        audience: 'both',
        description: 'Ліцензований посередник для купівлі та продажу цінних паперів — акцій, облігацій, ETF. В Україні брокерська діяльність ліцензується НКЦПФР.',
        whenYouNeedIt: [
          'Купівля ОВДП на первинному або вторинному ринку',
          'Інвестиції в акції українських та міжнародних компаній',
          'Купівля ETF (фондів, що повторюють індекси)',
          'Управління інвестиційним портфелем',
        ],
        whatToPrepare: ['Паспорт + ІПН', 'Банківський рахунок для поповнення брокерського'],
        keyFacts: [
          { label: 'Регулятор', value: 'НКЦПФР', note: 'Всі брокери мають бути ліцензовані' },
          { label: 'Мін. сума', value: 'від 1 000 ₴', note: 'Для ОВДП, для акцій — від $1' },
          { label: 'Комісія', value: '0.02-0.5%', note: 'Від обороту операцій' },
          { label: 'Депозитарій', value: 'НКДЦП', note: 'Активи зберігаються окремо від брокера' },
        ],
        legalBasis: 'ЗУ «Про ринки капіталу та організовані товарні ринки»',
        fintodoHelp: 'FINTODO допомагає порівняти брокерів, розрахувати інвестиційний дохід та відстежити податки на прибуток від цінних паперів.',
        relatedArticleIds: [],
        relatedToolIds: ['invest-calc'],
        externalLinks: [
          { label: 'Реєстр ліцензій НКЦПФР', url: 'https://www.nssmc.gov.ua', type: 'register' },
        ],
        isPopular: true,
      },
      {
        id: 'ovdp-broker', slug: 'ovdp-broker',
        name: 'ОВДП та облігації',
        shortName: 'ОВДП',
        emoji: '🏛',
        audience: 'both',
        description: 'Облігації внутрішньої державної позики — найбезпечніший інвестиційний інструмент в Україні. Гарантія держави, пільгове оподаткування.',
        whenYouNeedIt: [
          'Безпечне збереження вільних коштів',
          'Альтернатива банківському депозиту з вищою дохідністю',
          'Інвестиція зі звільненням від ПДФО',
        ],
        whatToPrepare: ['Рахунок у брокера або банку'],
        keyFacts: [
          { label: 'Дохідність', value: '14-18% річних', note: 'Залежить від терміну' },
          { label: 'Податок', value: 'лише 1.5% ВЗ', note: 'Звільнено від ПДФО 18%' },
          { label: 'Через monobank', value: 'від 1 000 ₴', note: 'Найпростіший спосіб купити' },
        ],
        legalBasis: 'ст. 165.1.52 ПКУ',
        fintodoHelp: 'FINTODO розраховує дохідність ОВДП з урахуванням пільгового оподаткування.',
        relatedArticleIds: [],
        relatedToolIds: ['invest-calc'],
        externalLinks: [
          { label: 'Аукціони ОВДП (НБУ)', url: 'https://bank.gov.ua', type: 'official' },
        ],
      },
      // Moved from investment_biz: ФГВФО
      {
        id: 'fgvfo', slug: 'fgvfo',
        name: 'ФГВФО (Фонд гарантування вкладів)',
        shortName: 'ФГВФО',
        emoji: '🔒',
        audience: 'personal',
        description: 'Гарантує повернення банківських вкладів у разі ліквідації банку — до 600 000 ₴ на одну особу в одному банку.',
        whenYouNeedIt: [
          'Відкриття депозиту — перевірити чи банк є членом ФГВФО',
          'Банк ліквідується — отримати виплату через ФГВФО',
          'Вибір між кількома банками для вкладу',
        ],
        whatToPrepare: ['Паспорт для отримання виплати при ліквідації'],
        keyFacts: [
          { label: 'Гарантія', value: '600 000 ₴', note: 'На одну особу в одному банку' },
          { label: 'Валютні вклади', value: 'Еквівалент у гривні', note: 'За курсом НБУ на день виплати' },
          { label: 'ФОП вклади', value: 'Не гарантуються', note: 'Тільки фізособи' },
          { label: 'Строк виплати', value: '20 робочих днів', note: 'Після рішення про ліквідацію' },
        ],
        legalBasis: 'ЗУ «Про систему гарантування вкладів фізичних осіб»',
        fintodoHelp: 'Не пов\'язано напряму.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'ФГВФО — перевірити банк', url: 'https://fg.gov.ua', type: 'official' },
          { label: 'Список банків-учасників', url: 'https://fg.gov.ua/banks', type: 'register' },
        ],
      },
      // Moved from pension: НПФ
      {
        id: 'npf', slug: 'npf',
        name: 'Недержавні пенсійні фонди (НПФ)',
        shortName: 'НПФ',
        emoji: '🏦',
        audience: 'both',
        description: 'НПФ дозволяють накопичувати на пенсію добровільно — понад обов\'язкове пенсійне страхування. Роботодавці використовують як бенефіт для співробітників.',
        whenYouNeedIt: [
          'Добровільне накопичення на пенсію',
          'Роботодавець надає НПФ як бенефіт',
          'Відрахування з ПДФО до 18 відсоткових пунктів при внесках',
        ],
        whatToPrepare: ['Паспорт', 'ІПН'],
        keyFacts: [
          { label: 'Мінімальний внесок', value: 'від 200 ₴/міс', note: 'Залежно від фонду' },
          { label: 'Податкова пільга', value: 'До 15% доходу без ПДФО', note: 'ПКУ ст.166.3.5' },
          { label: 'Гарантія', value: 'Не гарантується ФГВФО', note: 'Держрегулювання через НБУ' },
          { label: 'Регулятор', value: 'НБУ (з 2020)', note: 'Реєстр на сайті НБУ' },
        ],
        legalBasis: 'ЗУ «Про недержавне пенсійне забезпечення»',
        fintodoHelp: 'Внески в НПФ можна враховувати для зменшення оподатковуваного доходу на загальній системі.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр НПФ НБУ', url: 'https://bank.gov.ua/ua/supervision/nkuf/npf', type: 'register' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. КРЕДИТУВАННЯ ТА ФІНАНСУВАННЯ (merged credit + leasing + property mortgage + personal credit-history)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'credit', slug: 'credit',
    name: 'Кредитування та фінансування',
    emoji: '💰',
    shortDescription: 'Споживчі кредити, іпотека, лізинг, факторинг, кредитна історія',
    pageSubtitle: 'Порівняйте кредитні пропозиції, ставки та умови фінансування',
    audience: 'both', priority: 7,
    profileTypeAliases: ['credit_bureau', 'leasing', 'leasing_equipment', 'mortgage', 'consumer_credit', 'microloan'],
    types: [
      {
        id: 'consumer-credit', slug: 'consumer-credit',
        name: 'Споживче кредитування',
        shortName: 'Кредит',
        emoji: '💳',
        audience: 'personal',
        description: 'Банківські споживчі кредити і кредити МФО. Регулюються НБУ — максимальна ставка обмежена. Обов\'язкова перевірка кредитної історії.',
        whenYouNeedIt: ['Купівля побутової техніки або авто', 'Невідкладні витрати', 'Ремонт або лікування'],
        whatToPrepare: ['Паспорт', 'ІПН', 'Підтвердження доходу'],
        keyFacts: [
          { label: 'Ліміт МФО', value: '30 000 ₴', note: 'Без кредитної перевірки — до 10 000' },
          { label: 'Максимальна ставка МФО', value: '0.5%/день', note: 'НБУ обмеження з 2021' },
          { label: 'Кредитне бюро', value: 'УБКІ, ПКБ', note: 'Перевірити свою КІ перед позикою' },
          { label: 'Захист позичальника', value: 'НБУ пункт 2.4', note: 'Скарга на кредитора' },
        ],
        legalBasis: 'ЗУ «Про споживче кредитування»',
        fintodoHelp: 'ПДФО на прощений борг — FINTODO допомагає правильно декларувати.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'УБКІ — кредитна історія', url: 'https://ubki.ua', type: 'service' },
          { label: 'Скарга на кредитора до НБУ', url: 'https://bank.gov.ua/ua/consumers', type: 'service' },
        ],
      },
      {
        id: 'credit-bureau', slug: 'credit-bureau',
        name: 'Кредитні бюро',
        shortName: 'Кредитна історія',
        emoji: '📊',
        audience: 'both',
        description: 'Зберігають кредитну історію позичальників. Перед отриманням кредиту варто перевірити власний рейтинг і виправити помилки.',
        whenYouNeedIt: [
          'Перед подачею заявки на кредит або іпотеку',
          'Перевірка чи є помилкові записи',
          'Після закриття кредиту — перевірити відображення',
          'Захист від шахрайства з документами',
        ],
        whatToPrepare: ['Паспорт', 'BankID для онлайн-доступу'],
        keyFacts: [
          { label: 'Безкоштовна звіта', value: '1 раз/рік', note: 'Право кожного громадянина' },
          { label: 'Два основних бюро', value: 'УБКІ і ПКБ' },
          { label: 'Строк зберігання', value: '10 років', note: 'Після погашення кредиту' },
        ],
        legalBasis: 'ЗУ «Про організацію формування та обігу кредитних історій»',
        fintodoHelp: 'Не пов\'язано напряму.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'УБКІ', url: 'https://ubki.ua', type: 'service' },
          { label: 'ПКБ (Перше кредитне бюро)', url: 'https://pkb.ua', type: 'service' },
        ],
      },
      // Moved from property: Іпотека
      {
        id: 'mortgage', slug: 'mortgage',
        name: 'Іпотека',
        shortName: 'Іпотека',
        emoji: '🔑',
        audience: 'personal',
        description: 'Кредит під заставу нерухомості для купівлі житла. В Україні доступна державна програма "єОселя" під 3% або 7%.',
        whenYouNeedIt: [
          'Купівля першої квартири або будинку',
          'Державна програма "єОселя" під 3%',
          'Рефінансування дорогої іпотеки',
        ],
        whatToPrepare: ['Підтвердження доходів', 'Паспорт', 'Довідка з роботи або звітність ФОП', 'Перший внесок 20%+'],
        keyFacts: [
          { label: 'єОселя для педагогів/лікарів', value: '3% річних' },
          { label: 'єОселя загальна', value: '7% річних' },
          { label: 'Перший внесок', value: 'від 20%' },
          { label: 'Строк', value: 'до 20 років' },
        ],
        legalBasis: 'Постанова КМУ №856 «єОселя»',
        fintodoHelp: 'Відсотки за іпотекою фізособа може включити до податкової знижки при декларуванні.',
        relatedArticleIds: ['21'],
        relatedToolIds: [],
        externalLinks: [
          { label: 'єОселя — подати заявку', url: 'https://eoselia.gov.ua', type: 'service' },
          { label: 'Реєстр нерухомості', url: 'https://re.minjust.gov.ua', type: 'register' },
        ],
      },
      // Moved from leasing: Лізинг
      {
        id: 'leasing-equipment', slug: 'leasing-equipment',
        name: 'Лізинг',
        shortName: 'Лізинг',
        emoji: '🏗',
        audience: 'business',
        description: 'Фінансова оренда обладнання, транспорту, нерухомості з правом подальшого викупу. Альтернатива кредиту для придбання основних засобів.',
        whenYouNeedIt: [
          'Придбання обладнання без повної оплати',
          'Оновлення автопарку підприємства',
          'Недостатньо коштів для купівлі — лізинг як альтернатива кредиту',
        ],
        whatToPrepare: ['Фінзвітність за 2 роки', 'Бізнес-план', 'Документи на підприємство'],
        keyFacts: [
          { label: 'Аванс', value: '10–30%', note: 'Від вартості предмета лізингу' },
          { label: 'Строк', value: '2–7 років' },
          { label: 'Податкова перевага', value: 'Лізингові платежі — витрати', note: 'На загальній системі' },
          { label: 'Регулятор', value: 'НБУ', note: 'Реєстр лізингодавців' },
        ],
        legalBasis: 'ЗУ «Про фінансовий лізинг»',
        fintodoHelp: 'Лізингові платежі відносяться до витрат на загальній системі — FINTODO правильно облікує.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр лізингодавців НБУ', url: 'https://bank.gov.ua', type: 'register' },
        ],
      },
      // Moved from leasing: Факторинг
      {
        id: 'factoring', slug: 'factoring',
        name: 'Факторинг',
        shortName: 'Факторинг',
        emoji: '💵',
        audience: 'business',
        description: 'Фінансування під відступлення дебіторської заборгованості — отримання грошей за рахунками-фактурами до оплати клієнтом.',
        whenYouNeedIt: [
          'Клієнти платять з відтермінуванням 30-90 днів',
          'Потрібен оборотний капітал для закупівель',
          'Сезонний бізнес з касовими розривами',
        ],
        whatToPrepare: ['Договори з дебіторами', 'Рахунки-фактури', 'Фінзвітність'],
        keyFacts: [
          { label: 'Комісія', value: '1.5–4% від суми', note: 'Залежно від строку і ризику' },
          { label: 'Виплата', value: '80–95% одразу', note: 'Решта — після оплати дебітором' },
        ],
        legalBasis: 'ЦК України, глава 73 (факторинг)',
        fintodoHelp: 'FINTODO допомагає контролювати дебіторську заборгованість і планувати cashflow.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. БУХГАЛТЕРІЯ ТА ЗВІТНІСТЬ (merged accounting + reporting)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'accounting', slug: 'accounting',
    name: 'Бухгалтерія та звітність',
    emoji: '🧮',
    shortDescription: 'Бухгалтерське ПЗ, аутсорс, е-звітність для бізнесу',
    pageSubtitle: 'Оберіть бухгалтерський сервіс або ПЗ для автоматизації обліку та звітності',
    audience: 'business', priority: 8,
    profileTypeAliases: ['accounting_software', 'tax_automation', 'edo', 'reporting'],
    types: [
      {
        id: 'accounting-software', slug: 'accounting-software',
        name: 'Бухгалтерське ПЗ',
        shortName: 'Облік',
        emoji: '💻',
        audience: 'business',
        description: 'Програми для ведення бухгалтерського обліку ФОП і ТОВ — автоматичне формування декларацій, облік доходів/витрат, зарплата.',
        whenYouNeedIt: [
          'Ведення обліку ФОП на єдиному або загальному податку',
          'Автоматичне формування декларацій до ДПС',
          'Облік зарплати і ЄСВ для найнятих працівників',
          'Підготовка фінзвітності для ТОВ',
        ],
        whatToPrepare: ['ЄДРПОУ або ІПН', 'Банківські виписки', 'КЕП для відправки звітності'],
        keyFacts: [
          { label: 'FINTODO', value: 'Від 0 ₴/міс', note: 'Для ФОП 1-3 групи — AI-автоматизація' },
          { label: 'BAS (1С)', value: 'Від 3 000 ₴/рік', note: 'Класичне ПЗ для ТОВ' },
          { label: 'Дія.Бізнес', value: 'Безкоштовно', note: 'Базовий облік для ФОП' },
        ],
        legalBasis: 'ЗУ «Про бухгалтерський облік та фінансову звітність»',
        fintodoHelp: 'FINTODO автоматизує 100% обліку для ФОП — від імпорту виписок до подання декларацій в 1 клік.',
        relatedArticleIds: ['1', '2'],
        relatedToolIds: ['tax', 'esv'],
        externalLinks: [
          { label: 'FINTODO — спробувати', url: '/', type: 'service' },
          { label: 'Дія.Бізнес', url: 'https://business.diia.gov.ua', type: 'service' },
        ],
      },
      {
        id: 'outsource-accounting', slug: 'outsource-accounting',
        name: 'Аутсорс бухгалтерії',
        shortName: 'Аутсорс',
        emoji: '👩‍💼',
        audience: 'business',
        description: 'Зовнішній бухгалтер або бухгалтерська фірма — для тих хто не хоче вести облік самостійно.',
        whenYouNeedIt: [
          'ТОВ потребує повний бухоблік',
          'Складний облік на загальній системі',
          'Підготовка до аудиту або перевірки ДПС',
        ],
        whatToPrepare: ['Первинні документи', 'Банківські виписки', 'Контракти'],
        keyFacts: [
          { label: 'ФОП бухгалтер', value: 'від 1 500 ₴/міс', note: 'За обсягом документів' },
          { label: 'ТОВ бухгалтер', value: 'від 5 000 ₴/міс', note: 'Повний бухоблік' },
        ],
        legalBasis: 'ЗУ «Про бухгалтерський облік та фінансову звітність»',
        fintodoHelp: 'FINTODO як альтернатива аутсорсу для ФОП — дешевше і швидше.',
        relatedArticleIds: ['1'],
        relatedToolIds: ['tax'],
        externalLinks: [],
      },
      // Merged from reporting: Електронна звітність
      {
        id: 'e-reporting', slug: 'e-reporting',
        name: 'Електронна звітність',
        shortName: 'Е-звітність',
        emoji: '📤',
        audience: 'business',
        description: 'Сервіси для формування та відправки звітів до ДПС, ПФУ і Держстату через інтернет з використанням КЕП або Дія.Підпис.',
        whenYouNeedIt: [
          'Подання декларації ФОП щокварталу',
          'Подання Д4 (ЄСВ) за найнятих працівників',
          'Статистична звітність ТОВ',
          'Подача ПДВ-декларації',
        ],
        whatToPrepare: ['КЕП або Дія.Підпис', 'ЄДРПОУ', 'Дані для звітності'],
        keyFacts: [
          { label: 'M.E.Doc', value: 'від 2 000 ₴/рік', note: 'Найпопулярніший в Україні' },
          { label: 'Вчасно.Звіт', value: 'від 1 200 ₴/рік', note: 'Хмарний сервіс' },
          { label: 'Е-кабінет ДПС', value: 'Безкоштовно', note: 'Обмежений функціонал' },
        ],
        legalBasis: 'ПКУ, ЗУ «Про електронні документи та документообіг»',
        fintodoHelp: 'FINTODO формує і подає декларації автоматично — без окремого сервісу звітності.',
        relatedArticleIds: ['1', '14'],
        relatedToolIds: ['tax', 'calendar'],
        externalLinks: [
          { label: 'M.E.Doc', url: 'https://medoc.ua', type: 'service' },
          { label: 'Вчасно.Звіт', url: 'https://vchasno.ua/zvit', type: 'service' },
          { label: 'Е-кабінет ДПС', url: 'https://cabinet.tax.gov.ua', type: 'official' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 9. ЦИФРОВІ ІНСТРУМЕНТИ (ЕДО, КЕП, CRM, ПРРО)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'digital_tools', slug: 'digital_tools',
    name: 'Цифрові інструменти',
    emoji: '🔐',
    shortDescription: 'ЕДО, КЕП, CRM, ПРРО — цифровізація бізнес-процесів',
    pageSubtitle: 'Знайдіть цифрові інструменти для електронного підпису, документообігу та каси',
    audience: 'business', priority: 9,
    profileTypeAliases: ['digital_signature', 'cashier_software', 'prro'],
    types: [
      {
        id: 'edo', slug: 'edo',
        name: 'Електронний документообіг (ЕДО)',
        shortName: 'ЕДО',
        emoji: '📄',
        audience: 'business',
        description: 'Обмін первинними документами (накладні, акти, рахунки) з контрагентами в електронному вигляді з юридичною силою.',
        whenYouNeedIt: [
          'Обмін накладними і актами з контрагентами',
          'Зменшення паперового документообігу',
          'Прискорення підписання документів',
        ],
        whatToPrepare: ['КЕП або Дія.Підпис', 'ЄДРПОУ'],
        keyFacts: [
          { label: 'Вчасно.ЕДО', value: 'від 500 ₴/міс', note: 'Лідер ринку ЕДО' },
          { label: 'M.E.Doc ЕДО', value: 'Інтеграція зі звітністю' },
          { label: 'Checkbox', value: 'ПРРО + ЕДО', note: 'Для малого бізнесу' },
        ],
        legalBasis: 'ЗУ «Про електронні документи та електронний документообіг»',
        fintodoHelp: 'FINTODO приймає первинні документи через ЕДО-інтеграцію.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Вчасно', url: 'https://vchasno.ua', type: 'service' },
          { label: 'Checkbox', url: 'https://checkbox.ua', type: 'service' },
        ],
      },
      {
        id: 'ecp', slug: 'ecp',
        name: 'Електронний підпис (КЕП)',
        shortName: 'КЕП / Дія.Підпис',
        emoji: '✍️',
        audience: 'both',
        description: 'Кваліфікований електронний підпис (КЕП) або Дія.Підпис — для подачі звітності, підписання документів і роботи з держсервісами.',
        whenYouNeedIt: [
          'Подання звітності до ДПС електронно',
          'Підписання ЕДО документів',
          'Реєстрація ФОП через Дія',
          'Робота з банківськими API',
        ],
        whatToPrepare: ['Паспорт', 'ІПН', 'Смартфон (для Дія.Підпис)'],
        keyFacts: [
          { label: 'Дія.Підпис', value: 'Безкоштовно', note: 'Через додаток Дія' },
          { label: 'КЕП від АЦСК', value: 'від 0 ₴', note: 'Безкоштовні КЕП від деяких АЦСК' },
          { label: 'Термін дії', value: '1-2 роки', note: 'Потрібне поновлення' },
        ],
        legalBasis: 'ЗУ «Про електронну ідентифікацію та електронні довірчі послуги»',
        fintodoHelp: 'FINTODO використовує КЕП для автоматичної подачі декларацій до ДПС.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Дія.Підпис', url: 'https://diia.gov.ua', type: 'service' },
          { label: 'ІІТ (Інститут інформаційних технологій)', url: 'https://iit.com.ua', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 10. РЕЄСТРАЦІЯ БІЗНЕСУ (registration + property-registry)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'registration', slug: 'registration',
    name: 'Реєстрація бізнесу',
    emoji: '📝',
    shortDescription: 'Реєстрація ФОП/ТОВ, ліцензування, реєстр нерухомості',
    pageSubtitle: 'Реєстрація бізнесу, ліцензування та перевірка в державних реєстрах',
    audience: 'business', priority: 10,
    profileTypeAliases: ['registry', 'monitoring', 'edr', 'business_registration'],
    types: [
      {
        id: 'minjust', slug: 'minjust',
        name: 'Мін\'юст / Державний реєстратор',
        shortName: 'Реєстратор',
        emoji: '📝',
        audience: 'business',
        description: 'Державна реєстрація юридичних осіб і ФОП. Внесення змін до статуту, реєстрація припинення діяльності. Зараз більшість дій доступна через Дія.',
        whenYouNeedIt: [
          'Реєстрація ФОП — безкоштовно через Дія',
          'Реєстрація ТОВ — через нотаріуса або Дія',
          'Зміна юридичної адреси або видів діяльності',
          'Зміна керівника або складу засновників',
          'Ліквідація або припинення діяльності',
        ],
        whatToPrepare: [
          'Паспорт + ІПН',
          'Для ТОВ: статут, рішення про створення, інформація про засновників',
          'Дія.Підпис або КЕП для онлайн-реєстрації',
        ],
        keyFacts: [
          { label: 'Реєстрація ФОП', value: 'Безкоштовно', note: 'Через Дія або держреєстратора' },
          { label: 'Термін реєстрації ФОП', value: '1-3 робочих дні' },
          { label: 'Держмито ТОВ', value: '1 прожитковий мінімум', note: 'Через нотаріуса — вища вартість' },
          { label: 'ЄДР онлайн', value: 'usr.minjust.gov.ua', note: 'Перевірити будь-яку компанію' },
        ],
        legalBasis: 'ЗУ «Про державну реєстрацію юридичних осіб та ФОП»',
        fintodoHelp: 'FINTODO автоматично підтягує назву і КВЕД за ЄДРПОУ при реєстрації в сервісі.',
        relatedArticleIds: ['6', '15'],
        relatedToolIds: ['counterparty', 'kved'],
        externalLinks: [
          { label: 'Реєстрація через Дія', url: 'https://diia.gov.ua', type: 'service' },
          { label: 'Єдиний державний реєстр (ЄДР)', url: 'https://usr.minjust.gov.ua', type: 'register' },
          { label: 'Знайти держреєстратора', url: 'https://online.minjust.gov.ua', type: 'service' },
        ],
        isPopular: true,
      },
      {
        id: 'licensing-body', slug: 'licensing-body',
        name: 'Органи ліцензування',
        shortName: 'Ліцензування',
        emoji: '🪪',
        audience: 'business',
        description: 'Окремі види діяльності вимагають ліцензії — медицина, освіта, будівництво, фінансові послуги, торгівля алкоголем. Ліцензії видають різні міністерства.',
        whenYouNeedIt: [
          'Медична практика → МОЗ',
          'Торгівля алкоголем → ДАРС (районна адміністрація)',
          'Освітня діяльність зі свідоцтвами → МОН',
          'Охоронна діяльність → МВС',
          'Фінансові послуги → НБУ або НКЦПФР',
          'Будівельна діяльність 3+ клас → ДАБІ',
        ],
        whatToPrepare: [
          'Пакет документів залежно від виду ліцензії',
          'Відповідне приміщення і обладнання',
          'Кваліфіковані спеціалісти',
        ],
        keyFacts: [
          { label: 'Реєстр ліцензій', value: 'license.minjust.gov.ua', note: 'Перевірити будь-яку ліцензію' },
          { label: 'Строк ліцензування', value: '10-30 робочих днів', note: 'Залежно від виду' },
          { label: 'Ліцензія на алкоголь (рознична)', value: 'від 780 ₴/рік' },
        ],
        legalBasis: 'ЗУ «Про ліцензування видів господарської діяльності»',
        fintodoHelp: 'Дедлайни поновлення ліцензій — FINTODO може нагадати через Change Alert систему.',
        relatedArticleIds: [],
        relatedToolIds: ['kved'],
        externalLinks: [
          { label: 'Реєстр ліцензій Мін\'юст', url: 'https://license.minjust.gov.ua', type: 'register' },
          { label: 'Довідник ліцензованих видів', url: 'https://zakon.rada.gov.ua', type: 'info' },
        ],
      },
      // Moved from property: Державний реєстр нерухомості
      {
        id: 'property-registry', slug: 'property-registry',
        name: 'Державний реєстр нерухомості',
        shortName: 'Реєстр нерухомості',
        emoji: '📋',
        audience: 'both',
        description: 'Реєстрація права власності на нерухомість і перевірка обтяжень (заставу, арешту). Обов\'язкова після купівлі або отримання у спадщину.',
        whenYouNeedIt: [
          'Реєстрація права власності після купівлі',
          'Перевірка чи є обтяження на майно перед купівлею',
          'Зняття заставу після погашення іпотеки',
          'Реєстрація оренди на строк більше 3 років',
        ],
        whatToPrepare: ['Договір купівлі-продажу', 'Паспорт', 'Квитанція про оплату збору'],
        keyFacts: [
          { label: 'Строк реєстрації', value: '5 робочих днів (стандарт)', note: 'Або 2 дні за підвищеним збором' },
          { label: 'Держзбір', value: '0.1% від оціночної вартості' },
          { label: 'Перевірка онлайн', value: 'minjust.gov.ua', note: 'Витяг з реєстру' },
        ],
        legalBasis: 'ЗУ «Про державну реєстрацію речових прав»',
        fintodoHelp: 'Придбання нерухомості для бізнесу на загальній системі — суттєво впливає на облік.',
        relatedArticleIds: ['24'],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Реєстр прав на нерухомість', url: 'https://re.minjust.gov.ua', type: 'register' },
          { label: 'Кабінет реєстрації', url: 'https://online.minjust.gov.ua', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 11. ЛОГІСТИКА ТА ДОСТАВКА
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'logistics', slug: 'logistics',
    name: 'Логістика та доставка',
    emoji: '🚚',
    shortDescription: 'Кур\'єрські служби, Нова Пошта, митне оформлення для бізнесу',
    pageSubtitle: 'Порівняйте кур\'єрські служби, тарифи доставки та митне оформлення',
    audience: 'both', priority: 11,
    profileTypeAliases: ['logistics'],
    types: [
      {
        id: 'delivery', slug: 'delivery',
        name: 'Кур\'єрські та поштові служби',
        shortName: 'Доставка',
        emoji: '📦',
        audience: 'both',
        description: 'Відправлення і отримання посилок всередині України та міжнародно. Для e-commerce — API інтеграція для автоматизованої відправки.',
        whenYouNeedIt: ['E-commerce — відправка замовлень клієнтам', 'Особисті відправлення', 'Документи і цінні пакети'],
        whatToPrepare: ['Адреса отримувача', 'Декларація для міжнародних відправлень'],
        keyFacts: [
          { label: 'Нова Пошта', value: 'від 40 ₴, 12 000+ відділень', note: 'Лідер ринку' },
          { label: 'Укрпошта', value: 'від 25 ₴', note: 'Державна пошта, дешевше' },
          { label: 'Meest Express', value: 'Міжнародна доставка', note: 'До діаспори та ЄС' },
          { label: 'API інтеграція', value: 'Нова Пошта, Justin', note: 'Для e-commerce автоматизації' },
        ],
        legalBasis: 'ЗУ «Про поштовий зв\'язок»',
        fintodoHelp: 'Витрати на доставку на загальній системі включаються до витрат з ТТН.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Нова Пошта', url: 'https://novaposhta.ua', type: 'service' },
          { label: 'Укрпошта', url: 'https://ukrposhta.ua', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 12. КАДРИ ТА ЗАРПЛАТА (NEW)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'hr', slug: 'hr',
    name: 'Кадри та зарплата',
    emoji: '👥',
    shortDescription: 'Оформлення працівників, зарплата, відпустки, звільнення, військовий облік',
    pageSubtitle: 'Знайдіть HR-сервіси для управління персоналом, зарплатою та кадровим обліком',
    audience: 'business', priority: 12,
    profileTypeAliases: ['hr_platform', 'hiring', 'payroll', 'hrm', 'recruiting'],
    types: [
      {
        id: 'hiring', slug: 'hiring',
        name: 'Оформлення працівника',
        shortName: 'Найм',
        emoji: '📋',
        audience: 'business',
        description: 'Правила оформлення трудових відносин — трудовий договір, ЦПД, повідомлення ДПС, випробувальний термін.',
        whenYouNeedIt: [
          'Прийом працівника на роботу',
          'Вибір між трудовим договором та ЦПД (ГПД)',
          'Повідомлення ДПС про прийняття',
          'Оформлення випробувального терміну',
        ],
        whatToPrepare: ['Паспорт працівника', 'ІПН працівника', 'Заява про прийняття на роботу'],
        keyFacts: [
          { label: 'Повідомлення ДПС', value: 'До початку роботи', note: 'Штраф за несвоєчасне — 10 МЗП' },
          { label: 'Мінзарплата 2026', value: '8 000 ₴', note: 'Менше — порушення' },
          { label: 'ЄСВ роботодавця', value: '22%', note: 'Від нарахованої зарплати' },
          { label: 'ПДФО', value: '18% + 1.5% ВЗ', note: 'Утримується із зарплати' },
        ],
        legalBasis: 'КЗпП України, ЗУ «Про ЄСВ»',
        fintodoHelp: 'FINTODO розраховує зарплату, ПДФО, ЄСВ та ВЗ автоматично.',
        relatedArticleIds: [],
        relatedToolIds: ['salary'],
        externalLinks: [
          { label: 'Е-кабінет ДПС — повідомлення', url: 'https://cabinet.tax.gov.ua', type: 'service' },
        ],
        isPopular: true,
      },
      {
        id: 'payroll', slug: 'payroll',
        name: 'Зарплата та податки',
        shortName: 'Зарплата',
        emoji: '💰',
        audience: 'business',
        description: 'Нарахування зарплати, утримання ПДФО і ВЗ, нарахування ЄСВ, форма Д4, лікарняні.',
        whenYouNeedIt: [
          'Щомісячне нарахування зарплати',
          'Розрахунок «чистих» на руки',
          'Подача Д4 (ЄСВ)',
          'Розрахунок лікарняних',
        ],
        whatToPrepare: ['Табель обліку робочого часу', 'Лікарняні листи (якщо є)'],
        keyFacts: [
          { label: 'ПДФО', value: '18%', note: 'Від нарахованої зарплати' },
          { label: 'Військовий збір', value: '5%', note: 'З 2024 року (було 1.5%)' },
          { label: 'ЄСВ', value: '22%', note: 'Платить роботодавець' },
          { label: 'Дедлайн Д4', value: '20-е число наступного місяця' },
        ],
        legalBasis: 'ПКУ, КЗпП, ЗУ «Про ЄСВ»',
        fintodoHelp: 'FINTODO автоматично розраховує зарплату та формує Д4 для подачі.',
        relatedArticleIds: ['12'],
        relatedToolIds: ['salary', 'esv'],
        externalLinks: [],
      },
      {
        id: 'leave', slug: 'leave',
        name: 'Відпустки та лікарняні',
        shortName: 'Відпустки',
        emoji: '🏖️',
        audience: 'both',
        description: 'Щорічна відпустка, навчальна, без збереження зарплати, лікарняний лист, декретна відпустка.',
        whenYouNeedIt: [
          'Надання щорічної відпустки працівнику',
          'Працівник приніс лікарняний лист',
          'Відпустка по вагітності та пологах',
          'Розрахунок відпускних',
        ],
        whatToPrepare: ['Заява від працівника', 'Лікарняний лист (для лікарняних)'],
        keyFacts: [
          { label: 'Мін. відпустка', value: '24 календарних дні', note: 'Щорічна основна' },
          { label: 'Лікарняний', value: '50-100% середньої зарплати', note: 'Залежно від стажу' },
          { label: 'Декрет', value: '126 днів', note: '70 до + 56 після пологів' },
        ],
        legalBasis: 'ЗУ «Про відпустки», КЗпП',
        fintodoHelp: 'FINTODO розраховує відпускні та лікарняні автоматично.',
        relatedArticleIds: [],
        relatedToolIds: ['salary'],
        externalLinks: [],
      },
      {
        id: 'dismissal', slug: 'dismissal',
        name: 'Звільнення',
        shortName: 'Звільнення',
        emoji: '📝',
        audience: 'both',
        description: 'Порядок звільнення працівника — за власним бажанням, за згодою сторін, за статтею. Компенсація, вихідна допомога.',
        whenYouNeedIt: [
          'Працівник хоче звільнитися',
          'Роботодавець хоче звільнити працівника',
          'Скорочення штату',
          'Звільнення за порушення',
        ],
        whatToPrepare: ['Заява працівника або наказ роботодавця', 'Розрахунок компенсації'],
        keyFacts: [
          { label: 'За власним бажанням', value: '14 днів відпрацювання', note: 'Або за згодою сторін — одразу' },
          { label: 'Компенсація відпустки', value: 'За невикористані дні', note: 'Виплачується в день звільнення' },
          { label: 'Вихідна допомога', value: '1 МЗП', note: 'При скороченні штату' },
        ],
        legalBasis: 'КЗпП, ст. 36, 38, 40',
        fintodoHelp: 'FINTODO розраховує компенсацію за невикористану відпустку та вихідну допомогу.',
        relatedArticleIds: [],
        relatedToolIds: ['salary'],
        externalLinks: [],
      },
      {
        id: 'military-hr', slug: 'military-hr',
        name: 'Військовий облік',
        shortName: 'Військовий облік',
        emoji: '🎖️',
        audience: 'business',
        description: 'Обов\'язки роботодавця з військового обліку працівників — повідомлення ТЦК, бронювання, мобілізація.',
        whenYouNeedIt: [
          'Організація військового обліку на підприємстві',
          'Бронювання працівників',
          'Повістка працівнику на роботі',
          'Прийом / звільнення військовозобов\'язаного',
        ],
        whatToPrepare: ['Військові облікові документи працівників', 'Повідомлення до ТЦК'],
        keyFacts: [
          { label: 'Штраф за неведення обліку', value: 'від 34 000 ₴', note: 'За кожного працівника' },
          { label: 'Бронювання', value: 'Через Дію', note: 'Для критичних працівників' },
          { label: 'Повідомлення ТЦК', value: '7 днів', note: 'Про прийняття/звільнення' },
        ],
        legalBasis: 'ЗУ «Про мобілізаційну підготовку та мобілізацію»',
        fintodoHelp: 'FINTODO нагадує про дедлайни повідомлень ТЦК.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Бронювання через Дію', url: 'https://diia.gov.ua', type: 'service' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 13. ГРАНТИ ТА ДЕРЖПРОГРАМИ (NEW — merged from investment_biz funds + startups accelerators)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'grants', slug: 'grants',
    name: 'Гранти та держпрограми',
    emoji: '🤲',
    shortDescription: 'Програма 5-7-9, USAID, єРабота, грантове фінансування для бізнесу',
    pageSubtitle: 'Знайдіть підходящу програму фінансування або грант для вашого бізнесу',
    audience: 'both', priority: 13,
    profileTypeAliases: ['grant_program', 'grant', 'program_579', 'international_grant', 'startup_fund'],
    types: [
      {
        id: 'program-579', slug: 'program-579',
        name: 'Програма «5-7-9%»',
        shortName: '5-7-9',
        emoji: '🏦',
        audience: 'business',
        description: 'Державна програма пільгового кредитування для мікро та малого бізнесу — кредити під 5%, 7% або 9% через банки-партнери.',
        whenYouNeedIt: [
          'Потрібен кредит для старту або розвитку бізнесу',
          'Пільгова ставка замість ринкових 20%+',
          'Рефінансування існуючого кредиту',
        ],
        whatToPrepare: ['Бізнес-план', 'Фінзвітність', 'Документи на бізнес'],
        keyFacts: [
          { label: 'Ставка', value: '5%, 7% або 9%', note: 'Залежно від розміру бізнесу' },
          { label: 'Сума', value: 'до 60 млн ₴', note: 'Для малого бізнесу' },
          { label: 'Строк', value: 'до 5 років', note: 'Інвестиційні — до 7 років' },
          { label: 'Банки-партнери', value: '30+ банків', note: 'Список на 579.gov.ua' },
        ],
        legalBasis: 'Постанова КМУ №28 від 24.01.2020',
        fintodoHelp: 'FINTODO допомагає підготувати фінзвітність для подачі заявки.',
        relatedArticleIds: ['8'],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Програма «5-7-9»', url: 'https://579.gov.ua', type: 'official' },
        ],
        isPopular: true,
      },
      {
        id: 'international-grants', slug: 'international-grants',
        name: 'USAID та міжнародні гранти',
        shortName: 'Міжнародні гранти',
        emoji: '🌍',
        audience: 'business',
        description: 'Безповоротна фінансова та технічна допомога від міжнародних організацій — USAID, ЄБРР, IFC, GIZ.',
        whenYouNeedIt: [
          'Потрібен грант для розвитку бізнесу',
          'Технічна допомога та менторство',
          'Постраждали від воєнних дій — компенсація',
        ],
        whatToPrepare: ['Бізнес-план', 'Реєстрація бізнесу', 'Конкурсна заявка'],
        keyFacts: [
          { label: 'USAID гранти', value: 'до $50 000', note: 'Безповоротна допомога' },
          { label: 'ЄБРР для МСБ', value: 'до €1 000 000', note: 'Через банки-партнери' },
          { label: 'Строк процесу', value: '3-6 місяців' },
        ],
        legalBasis: 'Міжнародні угоди про технічну допомогу',
        fintodoHelp: 'FINTODO допомагає підготувати фінансову звітність для подачі на гранти.',
        relatedArticleIds: ['8'],
        relatedToolIds: [],
        externalLinks: [
          { label: 'USAID в Україні', url: 'https://www.usaid.gov/ukraine', type: 'official' },
          { label: 'Фонд розвитку підприємництва', url: 'https://www.entrepreneurship.gov.ua', type: 'official' },
        ],
      },
      {
        id: 'usf', slug: 'usf',
        name: 'Ukrainian Startup Fund',
        shortName: 'USF',
        emoji: '🚀',
        audience: 'business',
        description: 'Державний грантовий фонд для стартапів — до $75 000 безповоротного фінансування для українських технологічних компаній.',
        whenYouNeedIt: [
          'Є MVP і потрібен seed-раунд',
          'Потрібне грантове фінансування стартапу',
          'Потрібна підтримка для виходу на ринок',
        ],
        whatToPrepare: ['Працюючий MVP', 'Pitch deck', 'Команда 2+ людини'],
        keyFacts: [
          { label: 'Грант', value: 'до $75 000', note: 'Безповоротний' },
          { label: 'Конкурс', value: '5-10% заявок', note: 'Конкурсний відбір' },
          { label: 'Строк', value: '2-4 місяці', note: 'Від заявки до виплати' },
        ],
        legalBasis: 'Постанова КМУ про USF',
        fintodoHelp: 'FINTODO допомагає стартапам вести облік гранту.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Ukrainian Startup Fund', url: 'https://usf.com.ua', type: 'official' },
        ],
      },
      {
        id: 'gov-programs', slug: 'gov-programs',
        name: 'єРабота та держпрограми зайнятості',
        shortName: 'Держпрограми',
        emoji: '🤝',
        audience: 'both',
        description: 'Державні програми підтримки зайнятості — єРабота (гранти для ветеранів та ВПО), єВідновлення, програми перенавчання.',
        whenYouNeedIt: [
          'Ветеран або ВПО хоче відкрити бізнес',
          'Потрібне перенавчання або перекваліфікація',
          'Потрібна допомога у працевлаштуванні',
        ],
        whatToPrepare: ['Паспорт', 'Документ ВПО або ветерана (якщо є)', 'Бізнес-ідея'],
        keyFacts: [
          { label: 'єРабота грант', value: 'до 250 000 ₴', note: 'Для створення бізнесу' },
          { label: 'Перенавчання', value: 'Безкоштовно', note: 'Через центри зайнятості' },
        ],
        legalBasis: 'Постанова КМУ про єРабота',
        fintodoHelp: 'FINTODO допомагає правильно облікувати отриманий грант.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'єРабота', url: 'https://erobota.gov.ua', type: 'official' },
        ],
      },
      // Moved from startups: Акселератори
      {
        id: 'accelerators', slug: 'accelerators',
        name: 'Акселератори та інкубатори',
        shortName: 'Акселератори',
        emoji: '🚀',
        audience: 'business',
        description: 'Програми прискореного розвитку стартапів — менторство, фінансування, доступ до ринку. Тривалість 3-6 місяців.',
        whenYouNeedIt: [
          'Є MVP і потрібен ринковий фідбек',
          'Потрібен seed-раунд інвестицій',
          'Вихід на міжнародний ринок',
        ],
        whatToPrepare: ['Працюючий MVP', 'Команда 2+ людини', 'Метрики зростання'],
        keyFacts: [
          { label: 'YEP', value: 'Безкоштовний', note: 'Youth Entrepreneurship Program' },
          { label: 'GrowthUP', value: 'До $50K фінансування', note: 'ТехУкраїна' },
        ],
        legalBasis: 'ЗУ «Про підтримку стартапів» (проєкт)',
        fintodoHelp: 'FINTODO допомагає підготувати фінзвітність для інвесторів.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Ukrainian Startup Fund', url: 'https://usf.com.ua', type: 'official' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 14. ФІНТЕХ ТА СТАРТАПИ (merged fintech + startups hubs)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'fintech', slug: 'fintech',
    name: 'Фінтех та стартапи',
    emoji: '🚀',
    shortDescription: 'Фінтех-інструменти, хаби, акселератори — інноваційні фінансові сервіси',
    pageSubtitle: 'Відкрийте фінтех-інструменти, акселератори та інноваційні фінансові сервіси',
    audience: 'both', priority: 14,
    profileTypeAliases: ['fintech', 'startup_hub', 'coworking'],
    types: [
      {
        id: 'fintech-tools', slug: 'fintech-tools',
        name: 'Фінтех-інструменти',
        shortName: 'Фінтех',
        emoji: '⚡',
        audience: 'business',
        description: 'Сервіси автоматизації фінансів: інвойсинг, управління підписками, аналітика cashflow, конвертація валют.',
        whenYouNeedIt: [
          'Автоматизація виставлення рахунків клієнтам',
          'Управління cashflow та прогнозування',
          'Конвертація валют з мінімальними комісіями',
        ],
        whatToPrepare: ['Рахунок у банку', 'API доступ (опціонально)'],
        keyFacts: [
          { label: 'Wise', value: 'від 0.41% комісії', note: 'Міжнародні перекази' },
          { label: 'Payoneer', value: 'для IT фрілансерів', note: 'Вивід з UpWork, Fiverr' },
        ],
        legalBasis: 'ЗУ «Про платіжні послуги»',
        fintodoHelp: 'FINTODO інтегрує дані з фінтех-сервісів для єдиного обліку.',
        relatedArticleIds: [],
        relatedToolIds: [],
        externalLinks: [
          { label: 'Wise', url: 'https://wise.com', type: 'service' },
          { label: 'Payoneer', url: 'https://payoneer.com', type: 'service' },
        ],
      },
      // Moved from startups: Стартап-хаби
      {
        id: 'startup-hubs', slug: 'startup-hubs',
        name: 'Стартап-хаби та коворкінги',
        shortName: 'Хаби',
        emoji: '🏢',
        audience: 'business',
        description: 'Простори для стартапів з менторством, нетворкінгом і доступом до інвесторів. В Україні найвідоміші — Unit.City, Sigma Software Labs, 1991.',
        whenYouNeedIt: [
          'Запуск стартапу з нуля — потрібен простір і менторство',
          'Масштабування — доступ до інвесторів',
          'Нетворкінг та ком\'юніті',
        ],
        whatToPrepare: ['Ідея або MVP', 'Бізнес-план (для акселераторів)', 'Pitch deck'],
        keyFacts: [
          { label: 'Unit.City', value: 'Найбільший інноваційний парк', note: 'Київ, 25 000 м²' },
          { label: '1991 Open Data', value: 'Акселератор', note: 'USAID-підтримка' },
          { label: 'Sigma Software Labs', value: 'Корпоративний хаб', note: 'Харків, Київ' },
        ],
        legalBasis: 'ЗУ «Про індустріальні парки»',
        fintodoHelp: 'FINTODO допомагає стартапам вести облік з першого дня — автоматизовано і безкоштовно для ФОП.',
        relatedArticleIds: ['8'],
        relatedToolIds: ['kved'],
        externalLinks: [
          { label: 'Unit.City', url: 'https://unit.city', type: 'service' },
          { label: 'Startup Ukraine', url: 'https://startup.ua', type: 'info' },
        ],
      },
    ],
  },
];

/** Flatten all types from all categories */
export const ALL_CATALOG_TYPES = CATALOG_CATEGORIES.flatMap((c) =>
  c.types.map((t) => ({ ...t, categoryId: c.id, categorySlug: c.slug, categoryName: c.name }))
);
