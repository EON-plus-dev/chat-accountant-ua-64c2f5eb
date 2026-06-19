/**
 * Регіональні офіси держорганів — телефонний/адресний довідник для бізнесу.
 *
 * Покриття: ГУ ДПС, ТЦК та СП, Управління Держпраці, Митниці по областях.
 * Snapshot станом на квітень 2026.
 *
 * Джерела:
 *   • tax.gov.ua/territorialni-organi
 *   • rekrut.mil.gov.ua (мережа ТЦК)
 *   • dsp.gov.ua/teritorialni-orhany
 *   • customs.gov.ua/mytni-orhany
 */

export type RegionalAuthority =
  | "dps"            // Головне управління ДПС
  | "pfu"            // Головне управління ПФУ
  | "tck"            // ТЦК та СП
  | "labor"          // Управління Держпраці
  | "customs";       // Митниця

export const REGIONAL_AUTHORITY_LABEL: Record<RegionalAuthority, string> = {
  dps: "ГУ ДПС",
  pfu: "ГУ ПФУ",
  tck: "ТЦК та СП",
  labor: "Управління Держпраці",
  customs: "Митниця",
};

export const REGIONAL_AUTHORITY_FULL: Record<RegionalAuthority, string> = {
  dps: "Головне управління Державної податкової служби",
  pfu: "Головне управління Пенсійного фонду України",
  tck: "Територіальний центр комплектування та соціальної підтримки",
  labor: "Управління Держпраці",
  customs: "Митниця Держмитслужби",
};

export type RegionalOblast =
  | "Київ" | "Київська" | "Львівська" | "Харківська" | "Одеська" | "Дніпропетровська"
  | "Запорізька" | "Полтавська" | "Вінницька" | "Чернігівська" | "Сумська"
  | "Житомирська" | "Хмельницька" | "Тернопільська" | "Івано-Франківська"
  | "Закарпатська" | "Чернівецька" | "Рівненська" | "Волинська" | "Черкаська"
  | "Кіровоградська" | "Миколаївська" | "Херсонська" | "Донецька" | "Луганська";

export const REGIONAL_OBLASTS: RegionalOblast[] = [
  "Київ", "Київська", "Львівська", "Харківська", "Одеська", "Дніпропетровська",
  "Запорізька", "Полтавська", "Вінницька", "Чернігівська", "Сумська",
  "Житомирська", "Хмельницька", "Тернопільська", "Івано-Франківська",
  "Закарпатська", "Чернівецька", "Рівненська", "Волинська", "Черкаська",
  "Кіровоградська", "Миколаївська", "Херсонська", "Донецька", "Луганська",
];

export interface RegionalOffice {
  id: string;
  authority: RegionalAuthority;
  oblast: RegionalOblast;
  /** Назва відділення */
  name: string;
  /** Поштова адреса */
  address: string;
  /** Поштовий індекс */
  postalCode?: string;
  /** Телефон гарячої лінії або канцелярії */
  phone?: string;
  /** Додаткові телефони (приймальня, відділ X) */
  additionalPhones?: { label: string; value: string }[];
  /** E-mail канцелярії */
  email?: string;
  /** Графік прийому */
  schedule?: string;
  /** Веб-сторінка регіонального офісу */
  url?: string;
  /** EDRPOU юрособи */
  edrpou?: string;
  /** Голова / Начальник */
  head?: string;
  /** Особливості — куди дивитись бізнесу */
  notes?: string;
}

export const REGIONAL_OFFICES: RegionalOffice[] = [
  // ─── ДПС ────────────────────────────────────────────────────────────────────
  {
    id: "dps-kyiv-city",
    authority: "dps",
    oblast: "Київ",
    name: "ГУ ДПС у м. Києві",
    address: "вул. Шолуденка, 33/19, Київ",
    postalCode: "04116",
    phone: "(044) 461-77-00",
    email: "kyiv.official@tax.gov.ua",
    schedule: "Пн–Чт 9:00–18:00, Пт 9:00–16:45",
    url: "https://kyiv.tax.gov.ua",
    edrpou: "44116011",
    notes: "Найбільший територіальний орган. Електронні звернення — через ЕК платника.",
  },
  {
    id: "dps-kyiv-oblast",
    authority: "dps",
    oblast: "Київська",
    name: "ГУ ДПС у Київській області",
    address: "вул. М. Кривоноса, 14, Київ",
    postalCode: "03680",
    phone: "(044) 596-67-00",
    email: "kobl.official@tax.gov.ua",
    url: "https://kobl.tax.gov.ua",
    edrpou: "44096797",
  },
  {
    id: "dps-lviv",
    authority: "dps",
    oblast: "Львівська",
    name: "ГУ ДПС у Львівській області",
    address: "вул. Стрийська, 35, Львів",
    postalCode: "79026",
    phone: "(032) 297-23-00",
    email: "lviv.official@tax.gov.ua",
    url: "https://lv.tax.gov.ua",
    edrpou: "43968090",
  },
  {
    id: "dps-kharkiv",
    authority: "dps",
    oblast: "Харківська",
    name: "ГУ ДПС у Харківській області",
    address: "вул. Пушкінська, 46, Харків",
    postalCode: "61057",
    phone: "(057) 702-86-00",
    email: "kh.official@tax.gov.ua",
    url: "https://kh.tax.gov.ua",
    edrpou: "43983495",
  },
  {
    id: "dps-odesa",
    authority: "dps",
    oblast: "Одеська",
    name: "ГУ ДПС в Одеській області",
    address: "вул. Семінарська, 5, Одеса",
    postalCode: "65044",
    phone: "(048) 725-83-00",
    email: "od.official@tax.gov.ua",
    url: "https://od.tax.gov.ua",
    edrpou: "44069166",
  },
  {
    id: "dps-dnipro",
    authority: "dps",
    oblast: "Дніпропетровська",
    name: "ГУ ДПС у Дніпропетровській області",
    address: "вул. Сімферопольська, 17А, Дніпро",
    postalCode: "49600",
    phone: "(056) 374-31-83",
    email: "dp.official@tax.gov.ua",
    url: "https://dp.tax.gov.ua",
    edrpou: "44118658",
  },
  {
    id: "dps-zaporizhzhia",
    authority: "dps",
    oblast: "Запорізька",
    name: "ГУ ДПС у Запорізькій області",
    address: "пр. Соборний, 166, Запоріжжя",
    postalCode: "69107",
    phone: "(061) 219-04-00",
    email: "zp.official@tax.gov.ua",
    url: "https://zp.tax.gov.ua",
  },
  {
    id: "dps-poltava",
    authority: "dps",
    oblast: "Полтавська",
    name: "ГУ ДПС у Полтавській області",
    address: "вул. Європейська, 4, Полтава",
    postalCode: "36014",
    phone: "(0532) 56-37-21",
    email: "pl.official@tax.gov.ua",
    url: "https://pl.tax.gov.ua",
  },
  {
    id: "dps-vinnytsia",
    authority: "dps",
    oblast: "Вінницька",
    name: "ГУ ДПС у Вінницькій області",
    address: "вул. Хмельницьке шосе, 7, Вінниця",
    postalCode: "21027",
    phone: "(0432) 67-15-00",
    email: "vn.official@tax.gov.ua",
    url: "https://vn.tax.gov.ua",
  },
  {
    id: "dps-ivano-frankivsk",
    authority: "dps",
    oblast: "Івано-Франківська",
    name: "ГУ ДПС в Івано-Франківській області",
    address: "вул. Незалежності, 20, Івано-Франківськ",
    postalCode: "76018",
    phone: "(0342) 75-31-21",
    email: "if.official@tax.gov.ua",
    url: "https://if.tax.gov.ua",
  },

  // ─── ПФУ ────────────────────────────────────────────────────────────────────
  {
    id: "pfu-kyiv-city",
    authority: "pfu",
    oblast: "Київ",
    name: "Головне управління ПФУ в м. Києві",
    address: "вул. Б. Грінченка, 4, Київ",
    postalCode: "01001",
    phone: "(044) 281-08-00",
    email: "info@kievpfu.gov.ua",
    url: "https://www.pfu.gov.ua/kyiv",
    schedule: "Пн–Чт 9:00–18:00, Пт 9:00–16:45",
    notes: "Призначення пенсій, виплати ЄСВ, виправлення індивідуальних відомостей.",
  },
  {
    id: "pfu-lviv",
    authority: "pfu",
    oblast: "Львівська",
    name: "ГУ ПФУ у Львівській області",
    address: "вул. Січових Стрільців, 11, Львів",
    postalCode: "79000",
    phone: "(032) 297-12-00",
    url: "https://www.pfu.gov.ua/lviv",
  },
  {
    id: "pfu-dnipro",
    authority: "pfu",
    oblast: "Дніпропетровська",
    name: "ГУ ПФУ у Дніпропетровській області",
    address: "вул. Європейська, 13, Дніпро",
    postalCode: "49000",
    phone: "(056) 749-23-00",
    url: "https://www.pfu.gov.ua/dnipro",
  },
  {
    id: "pfu-odesa",
    authority: "pfu",
    oblast: "Одеська",
    name: "ГУ ПФУ в Одеській області",
    address: "вул. Канатна, 83, Одеса",
    postalCode: "65039",
    phone: "(048) 720-13-00",
    url: "https://www.pfu.gov.ua/odesa",
  },

  // ─── ТЦК та СП ──────────────────────────────────────────────────────────────
  {
    id: "tck-kyiv-city",
    authority: "tck",
    oblast: "Київ",
    name: "Київський міський ТЦК та СП",
    address: "вул. Юрія Іллєнка, 65/1, Київ",
    postalCode: "04050",
    phone: "(044) 489-37-72",
    additionalPhones: [
      { label: "Гаряча лінія", value: "(044) 489-31-71" },
      { label: "Бронювання", value: "(044) 489-32-50" },
    ],
    email: "kyivmtck@post.mil.gov.ua",
    url: "https://kyivmtck.gov.ua",
    schedule: "Пн–Пт 9:00–18:00",
    notes: "Звернення з бронювання — лише через Дію або Резерв+. Особистий прийом — за попереднім записом.",
  },
  {
    id: "tck-kyiv-oblast",
    authority: "tck",
    oblast: "Київська",
    name: "Київський обласний ТЦК та СП",
    address: "вул. Антоновича, 174, Київ",
    postalCode: "03150",
    phone: "(044) 528-32-66",
    email: "ko.otck@post.mil.gov.ua",
  },
  {
    id: "tck-lviv",
    authority: "tck",
    oblast: "Львівська",
    name: "Львівський обласний ТЦК та СП",
    address: "вул. Шевченка, 17, Львів",
    postalCode: "79007",
    phone: "(032) 261-08-30",
    email: "lv.otck@post.mil.gov.ua",
  },
  {
    id: "tck-kharkiv",
    authority: "tck",
    oblast: "Харківська",
    name: "Харківський обласний ТЦК та СП",
    address: "вул. Іванова, 12, Харків",
    postalCode: "61022",
    phone: "(057) 705-23-22",
    email: "kh.otck@post.mil.gov.ua",
  },
  {
    id: "tck-odesa",
    authority: "tck",
    oblast: "Одеська",
    name: "Одеський обласний ТЦК та СП",
    address: "вул. Преображенська, 28, Одеса",
    postalCode: "65000",
    phone: "(048) 723-50-89",
    email: "od.otck@post.mil.gov.ua",
  },
  {
    id: "tck-dnipro",
    authority: "tck",
    oblast: "Дніпропетровська",
    name: "Дніпропетровський обласний ТЦК та СП",
    address: "вул. Барикадна, 19, Дніпро",
    postalCode: "49000",
    phone: "(056) 744-12-12",
    email: "dn.otck@post.mil.gov.ua",
  },

  // ─── Держпраці ──────────────────────────────────────────────────────────────
  {
    id: "labor-kyiv-city",
    authority: "labor",
    oblast: "Київ",
    name: "Управління Держпраці у Київській області",
    address: "вул. Євгена Сверстюка, 11, Київ",
    postalCode: "02002",
    phone: "(044) 503-29-00",
    email: "kyiv@dsp.gov.ua",
    url: "https://kyiv.dsp.gov.ua",
    notes: "Інспекції з охорони праці і трудових відносин. Для скарг працівників — гаряча лінія 0 800 308 558.",
  },
  {
    id: "labor-lviv",
    authority: "labor",
    oblast: "Львівська",
    name: "Управління Держпраці у Львівській області",
    address: "вул. Заводська, 25, Львів",
    postalCode: "79018",
    phone: "(032) 244-22-12",
    email: "lviv@dsp.gov.ua",
    url: "https://lviv.dsp.gov.ua",
  },
  {
    id: "labor-kharkiv",
    authority: "labor",
    oblast: "Харківська",
    name: "Управління Держпраці у Харківській області",
    address: "вул. Сумська, 64, Харків",
    postalCode: "61002",
    phone: "(057) 707-30-99",
    email: "kharkiv@dsp.gov.ua",
  },
  {
    id: "labor-dnipro",
    authority: "labor",
    oblast: "Дніпропетровська",
    name: "Управління Держпраці у Дніпропетровській області",
    address: "вул. Воскресенська, 13, Дніпро",
    postalCode: "49000",
    phone: "(056) 745-67-71",
    email: "dnipro@dsp.gov.ua",
  },

  // ─── Митниці ────────────────────────────────────────────────────────────────
  {
    id: "customs-kyiv",
    authority: "customs",
    oblast: "Київ",
    name: "Київська митниця",
    address: "бульв. Гавела, 8А, Київ",
    postalCode: "03124",
    phone: "(044) 247-27-11",
    email: "kyiv@customs.gov.ua",
    url: "https://customs.gov.ua/kyiv",
    notes: "Оформлення імпорту/експорту для столичного регіону. Електронні декларації — через Єдине вікно.",
  },
  {
    id: "customs-lviv",
    authority: "customs",
    oblast: "Львівська",
    name: "Львівська митниця",
    address: "вул. Костюшка, 1, Львів",
    postalCode: "79000",
    phone: "(032) 297-15-58",
    email: "lviv@customs.gov.ua",
    notes: "Найбільший західний митний хаб. Пункти пропуску з ЄС: Краковець, Шегині, Рава-Руська.",
  },
  {
    id: "customs-odesa",
    authority: "customs",
    oblast: "Одеська",
    name: "Одеська митниця",
    address: "вул. Лип Гімназійна, 21, Одеса",
    postalCode: "65078",
    phone: "(048) 729-46-91",
    email: "odesa@customs.gov.ua",
    notes: "Морські порти Чорноморськ, Південний, Ізмаїл. Контейнерні перевезення.",
  },
  {
    id: "customs-volyn",
    authority: "customs",
    oblast: "Волинська",
    name: "Волинська митниця",
    address: "вул. Ярощука, 11, Луцьк",
    postalCode: "43025",
    phone: "(0332) 77-71-23",
    email: "volyn@customs.gov.ua",
    notes: "Пункти пропуску Ягодин, Устилуг (з Польщею).",
  },
  {
    id: "customs-zakarpattia",
    authority: "customs",
    oblast: "Закарпатська",
    name: "Закарпатська митниця",
    address: "вул. Собранецька, 20, Ужгород",
    postalCode: "88000",
    phone: "(0312) 64-09-22",
    email: "zakarpattia@customs.gov.ua",
    notes: "Кордон з Словаччиною, Угорщиною, Румунією — найдовший західний фронт ЄС.",
  },
];

export const REGIONAL_OFFICES_AS_OF = "2026-04-30";

export function getOfficesByOblast(oblast: RegionalOblast): RegionalOffice[] {
  return REGIONAL_OFFICES.filter((o) => o.oblast === oblast);
}

export function getOfficesByAuthority(authority: RegionalAuthority): RegionalOffice[] {
  return REGIONAL_OFFICES.filter((o) => o.authority === authority);
}
