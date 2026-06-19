/**
 * Бюджетні рахунки — реквізити Держказначейства для сплати податків і зборів.
 *
 * Джерело: офіційний сайт ДПС (https://tax.gov.ua/byudjetni-rahunki).
 * Рахунки змінюються — обовʼязково звіряти з ДПС перед платежем.
 * Усі IBAN — у форматі UA + 27 цифр (за стандартом НБУ).
 */

import type { DirectoryFaqItem } from "@/portal/data/knowledge/directoryTypes";

export type BudgetTaxType =
  | "pdfo" // Податок на доходи фізичних осіб
  | "vz" // Військовий збір
  | "esv" // Єдиний соціальний внесок
  | "pdv" // Податок на додану вартість
  | "ep1" // Єдиний податок 1 група
  | "ep2" // Єдиний податок 2 група
  | "ep3" // Єдиний податок 3 група
  | "ep4" // Єдиний податок 4 група (с/г)
  | "pnp" // Податок на прибуток підприємств
  | "akciz" // Акцизний податок
  | "ekol" // Екологічний податок
  | "zem" // Земельний податок / орендна плата
  | "mpz" // Мінімальне податкове зобовʼязання
  | "tur"; // Туристичний збір

export const BUDGET_TAX_LABEL: Record<BudgetTaxType, string> = {
  pdfo: "ПДФО",
  vz: "Військовий збір",
  esv: "ЄСВ",
  pdv: "ПДВ",
  ep1: "ЄП 1 група",
  ep2: "ЄП 2 група",
  ep3: "ЄП 3 група",
  ep4: "ЄП 4 група (с/г)",
  pnp: "Податок на прибуток",
  akciz: "Акцизний податок",
  ekol: "Екологічний податок",
  zem: "Земельний / орендна плата",
  mpz: "МПЗ",
  tur: "Туристичний збір",
};

export const BUDGET_TAX_FULL_LABEL: Record<BudgetTaxType, string> = {
  pdfo: "Податок на доходи фізичних осіб (ПДФО)",
  vz: "Військовий збір",
  esv: "Єдиний соціальний внесок (ЄСВ)",
  pdv: "Податок на додану вартість (ПДВ)",
  ep1: "Єдиний податок — 1 група",
  ep2: "Єдиний податок — 2 група",
  ep3: "Єдиний податок — 3 група",
  ep4: "Єдиний податок — 4 група (сільгоспвиробники)",
  pnp: "Податок на прибуток підприємств",
  akciz: "Акцизний податок",
  ekol: "Екологічний податок",
  zem: "Земельний податок та орендна плата",
  mpz: "Мінімальне податкове зобовʼязання",
  tur: "Туристичний збір",
};

export type BudgetRegion =
  | "all-ua"
  | "kyiv"
  | "kyiv-oblast"
  | "lviv"
  | "kharkiv"
  | "dnipro"
  | "odesa";

export const BUDGET_REGION_LABEL: Record<BudgetRegion, string> = {
  "all-ua": "Загальнодержавний",
  kyiv: "м. Київ",
  "kyiv-oblast": "Київська область",
  lviv: "Львівська область",
  kharkiv: "Харківська область",
  dnipro: "Дніпропетровська область",
  odesa: "Одеська область",
};

export type BudgetAudience = "business" | "personal" | "both";

export interface BudgetAccountEntry {
  id: string;
  slug: string;
  taxType: BudgetTaxType;
  region: BudgetRegion;
  audience: BudgetAudience;

  /** Назва платежу для блоку «Призначення» */
  title: string;
  summary: string;

  /** Отримувач — як писати у платіжному дорученні */
  recipientName: string;
  /** ЄДРПОУ отримувача (управління Держказначейства) */
  recipientEdrpou: string;
  /** Банк отримувача */
  bankName: string;
  /** IBAN рахунку (UA + 27 цифр) */
  iban: string;
  /** Код класифікації доходів бюджету (8 цифр) */
  budgetCode: string;
  /** Код бюджету (4 цифри) — для платіжки */
  budgetSettlementCode?: string;

  /** Рекомендоване призначення платежу */
  paymentPurposeTemplate: string;

  /** Терміни сплати */
  paymentDeadline?: string;
  /** Штраф / пеня за несвоєчасну сплату */
  latePenalty?: string;

  /** Офіційне посилання на сторінку реквізитів ДПС */
  officialUrl: string;
  /** Дата актуальності реквізитів */
  asOf: string;

  tags: string[];
  faq?: DirectoryFaqItem[];

  relatedLawSlugs?: string[];
  relatedPenaltySlugs?: string[];
  relatedAgencySlugs?: string[];
  relatedToolIds?: string[];

  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

const FALLBACK_FAQ: DirectoryFaqItem[] = [
  {
    q: "Що робити, якщо я помилився з рахунком?",
    a: "Подайте заяву до територіального органу ДПС за формою з наказу Мінфіну № 643 про зарахування коштів за призначенням або повернення помилково сплачених. Розгляд — до 30 днів.",
  },
  {
    q: "Як часто змінюються реквізити?",
    a: "Контрольний рахунок (IBAN) може змінюватися щороку — Держказначейство публікує оновлення на початку року. Перед щомісячним платежем перевіряйте актуальність на офіційному сайті ДПС.",
  },
];

export const BUDGET_ACCOUNTS: BudgetAccountEntry[] = [
  // ── ПДВ — загальнодержавний ────────────────────────────────────────────────
  {
    id: "pdv-all-ua",
    slug: "pdv-ukraina",
    taxType: "pdv",
    region: "all-ua",
    audience: "business",
    title: "ПДВ — електронний рахунок СЕА",
    summary: "Спеціальний рахунок у системі електронного адміністрування ПДВ (СЕА ПДВ). Кошти автоматично перераховуються до бюджету при реєстрації податкових накладних.",
    recipientName: "Казначейство України (ел. адміністрування ПДВ)",
    recipientEdrpou: "37567646",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA843001020000037560000000040",
    budgetCode: "14010100",
    paymentPurposeTemplate: "*;101;[ІПН];сплата ПДВ за [період]; ;",
    paymentDeadline: "До 30 числа місяця, наступного за звітним",
    latePenalty: "Пеня 120% облікової ставки НБУ + штраф 10/20/50% від суми боргу",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ПДВ", "СЕА", "Загальнодержавний", "ТОВ", "ФОП ЄП3 з ПДВ"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    relatedToolIds: ["pdv-calculator"],
    faq: [
      {
        q: "Чи можна сплатити ПДВ напряму, без СЕА?",
        a: "Ні. З 2015 року всі платежі ПДВ ідуть через електронний рахунок СЕА ПДВ. Прямі платежі повертаються або вважаються переплатою.",
      },
      ...FALLBACK_FAQ,
    ],
    seoTitle: "Рахунок СЕА ПДВ 2026 — IBAN, реквізити Казначейства | FINTODO",
    seoDescription: "Реквізити електронного рахунку СЕА ПДВ для платників податку на додану вартість. IBAN, призначення платежу, терміни сплати.",
    seoKeywords: ["рахунок ПДВ", "СЕА ПДВ", "IBAN ПДВ", "реквізити ПДВ"],
  },

  // ── ПДФО — Київ ───────────────────────────────────────────────────────────
  {
    id: "pdfo-kyiv",
    slug: "pdfo-kyiv",
    taxType: "pdfo",
    region: "kyiv",
    audience: "both",
    title: "ПДФО (м. Київ) — 18% із зарплат і доходів",
    summary: "Рахунок для сплати податку на доходи фізичних осіб за найманих працівників у м. Києві та доходів фізосіб-резидентів.",
    recipientName: "ГУ ДПС у м. Києві",
    recipientEdrpou: "44116011",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA908999980314030104000026004",
    budgetCode: "11010100",
    budgetSettlementCode: "2602",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата ПДФО за [період]; ;",
    paymentDeadline: "У день виплати доходу (для зарплати) / до 30 числа наступного місяця (для ФОП)",
    latePenalty: "Штраф 10/25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ПДФО", "Київ", "Зарплата", "Найманий", "Роботодавець"],
    relatedLawSlugs: ["pkv"],
    relatedPenaltySlugs: ["pdfo-late-payment"],
    relatedAgencySlugs: ["dps"],
    relatedToolIds: ["salary-calculator"],
    faq: FALLBACK_FAQ,
    seoTitle: "Рахунок ПДФО Київ 2026 — IBAN, реквізити для сплати | FINTODO",
    seoDescription: "Реквізити для сплати ПДФО (18%) у м. Києві: IBAN, ЄДРПОУ отримувача, код класифікації, терміни сплати.",
    seoKeywords: ["рахунок ПДФО Київ", "IBAN ПДФО", "сплата ПДФО", "реквізити ПДФО"],
  },

  // ── Військовий збір — Київ ────────────────────────────────────────────────
  {
    id: "vz-kyiv",
    slug: "vijskovyj-zbir-kyiv",
    taxType: "vz",
    region: "kyiv",
    audience: "both",
    title: "Військовий збір (м. Київ) — 5%",
    summary: "Рахунок для сплати військового збору 5% із зарплати працівників та доходів фізосіб у Києві. Ставка 5% діє з 1 грудня 2024 р.",
    recipientName: "ГУ ДПС у м. Києві",
    recipientEdrpou: "44116011",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA388999980314030106000026004",
    budgetCode: "11011000",
    budgetSettlementCode: "2602",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата військового збору за [період]; ;",
    paymentDeadline: "У день виплати доходу / до 30 числа наступного місяця",
    latePenalty: "Штраф 10/25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["Військовий збір", "ВЗ", "Київ", "5%", "Зарплата"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    relatedToolIds: ["salary-calculator"],
    faq: [
      {
        q: "Чому ставка 5%, а не 1,5%?",
        a: "З 1 грудня 2024 року Закон № 4015-IX підвищив військовий збір з 1,5% до 5% для більшості доходів. ФОП на ЄП також сплачують 1% від доходу (з 1 січня 2025 — окремий рахунок).",
      },
      ...FALLBACK_FAQ,
    ],
  },

  // ── ЄСВ — Київ ────────────────────────────────────────────────────────────
  {
    id: "esv-kyiv",
    slug: "yesv-kyiv",
    taxType: "esv",
    region: "kyiv",
    audience: "both",
    title: "ЄСВ (м. Київ) — 22% із фонду оплати праці",
    summary: "Єдиний соціальний внесок 22% від фонду оплати праці найманих та мінімум 1760 грн/міс для ФОП у Києві (2026 р.).",
    recipientName: "ГУ ДПС у м. Києві",
    recipientEdrpou: "44116011",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA738999980000355379200026001",
    budgetCode: "71040000",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата ЄСВ за [період]; ;",
    paymentDeadline: "До 20 числа наступного місяця (роботодавці) / до 20 квітня, липня, жовтня, січня (ФОП)",
    latePenalty: "Штраф 10/20% від суми + пеня 0,1% за кожен день прострочення",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ЄСВ", "Київ", "22%", "Роботодавець", "ФОП"],
    relatedLawSlugs: ["zu-2464"],
    relatedPenaltySlugs: ["esv-late-payment"],
    relatedAgencySlugs: ["dps", "pfu"],
    relatedToolIds: ["esv-calculator"],
    faq: FALLBACK_FAQ,
    seoTitle: "Рахунок ЄСВ Київ 2026 — IBAN для сплати єдиного внеску | FINTODO",
    seoDescription: "Реквізити для сплати ЄСВ 22% у м. Києві: IBAN, отримувач, код бюджету, дедлайни сплати для роботодавців та ФОП.",
  },

  // ── ЄП 3 група — Київ ─────────────────────────────────────────────────────
  {
    id: "ep3-kyiv",
    slug: "yedynyj-podatok-3-grupa-kyiv",
    taxType: "ep3",
    region: "kyiv",
    audience: "business",
    title: "Єдиний податок 3 група (м. Київ) — 5% / 3% + ПДВ",
    summary: "Рахунок для сплати ЄП 3 групи: 5% від доходу (без ПДВ) або 3% (з ПДВ). Квартальний платіж до 19/20 числа першого місяця наступного кварталу.",
    recipientName: "ГУ ДПС у м. Києві",
    recipientEdrpou: "44116011",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA158999980314090571000026004",
    budgetCode: "18050400",
    paymentPurposeTemplate: "*;101;[ІПН];сплата ЄП 3 група за [квартал/рік]; ;",
    paymentDeadline: "До 19 числа першого місяця кварталу, наступного за звітним",
    latePenalty: "Штраф 25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ЄП", "3 група", "Київ", "ФОП", "5%", "3%"],
    relatedLawSlugs: ["pkv"],
    relatedPenaltySlugs: ["fop-ep-late-payment"],
    relatedAgencySlugs: ["dps"],
    relatedToolIds: ["fop-tax-calculator"],
    faq: FALLBACK_FAQ,
  },

  // ── ЄП 2 група — Київ ─────────────────────────────────────────────────────
  {
    id: "ep2-kyiv",
    slug: "yedynyj-podatok-2-grupa-kyiv",
    taxType: "ep2",
    region: "kyiv",
    audience: "business",
    title: "Єдиний податок 2 група (м. Київ) — 20% мін. зарплати",
    summary: "Фіксований щомісячний платіж ЄП 2 групи: 20% МЗП (1600 грн/міс при МЗП 8000 грн у 2026). Сплачується авансом до 20 числа поточного місяця.",
    recipientName: "ГУ ДПС у м. Києві",
    recipientEdrpou: "44116011",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA158999980314090571000026004",
    budgetCode: "18050400",
    paymentPurposeTemplate: "*;101;[ІПН];сплата ЄП 2 група за [місяць/рік]; ;",
    paymentDeadline: "До 20 числа поточного місяця (авансом)",
    latePenalty: "Штраф 50% від ставки за період прострочення + пеня",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ЄП", "2 група", "Київ", "ФОП", "Фіксований"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    relatedToolIds: ["fop-tax-calculator"],
    faq: FALLBACK_FAQ,
  },

  // ── ПДФО — Львів ──────────────────────────────────────────────────────────
  {
    id: "pdfo-lviv",
    slug: "pdfo-lvivska-oblast",
    taxType: "pdfo",
    region: "lviv",
    audience: "both",
    title: "ПДФО (Львівська область) — 18%",
    summary: "Рахунок для сплати ПДФО 18% у Львівській області для роботодавців та фізосіб.",
    recipientName: "ГУ ДПС у Львівській області",
    recipientEdrpou: "43968090",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA678999980313030104000013010",
    budgetCode: "11010100",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата ПДФО за [період]; ;",
    paymentDeadline: "У день виплати доходу / до 30 числа наступного місяця",
    latePenalty: "Штраф 10/25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ПДФО", "Львів", "Львівська обл.", "Зарплата"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    faq: FALLBACK_FAQ,
  },

  // ── ЄСВ — Львів ───────────────────────────────────────────────────────────
  {
    id: "esv-lviv",
    slug: "yesv-lvivska-oblast",
    taxType: "esv",
    region: "lviv",
    audience: "both",
    title: "ЄСВ (Львівська область) — 22%",
    summary: "Реквізити для сплати єдиного соціального внеску в Львівській області. Роботодавці — 22% від ФОП; ФОП — мінімум 1760 грн/міс.",
    recipientName: "ГУ ДПС у Львівській області",
    recipientEdrpou: "43968090",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA438999980000355379100013010",
    budgetCode: "71040000",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата ЄСВ за [період]; ;",
    paymentDeadline: "До 20 числа наступного місяця",
    latePenalty: "Штраф 10/20% + пеня 0,1% за день",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ЄСВ", "Львів", "Львівська обл.", "Роботодавець"],
    relatedLawSlugs: ["zu-2464"],
    relatedAgencySlugs: ["dps", "pfu"],
    faq: FALLBACK_FAQ,
  },

  // ── ПДФО — Дніпро ─────────────────────────────────────────────────────────
  {
    id: "pdfo-dnipro",
    slug: "pdfo-dnipropetrovska-oblast",
    taxType: "pdfo",
    region: "dnipro",
    audience: "both",
    title: "ПДФО (Дніпропетровська область) — 18%",
    summary: "Рахунок для сплати ПДФО у Дніпропетровській області.",
    recipientName: "ГУ ДПС у Дніпропетровській області",
    recipientEdrpou: "43145015",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA378999980313030104000004013",
    budgetCode: "11010100",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата ПДФО за [період]; ;",
    paymentDeadline: "У день виплати доходу / до 30 числа наступного місяця",
    latePenalty: "Штраф 10/25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ПДФО", "Дніпро", "Зарплата"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    faq: FALLBACK_FAQ,
  },

  // ── ПДФО — Харків ─────────────────────────────────────────────────────────
  {
    id: "pdfo-kharkiv",
    slug: "pdfo-kharkivska-oblast",
    taxType: "pdfo",
    region: "kharkiv",
    audience: "both",
    title: "ПДФО (Харківська область) — 18%",
    summary: "Рахунок для сплати ПДФО у Харківській області.",
    recipientName: "ГУ ДПС у Харківській області",
    recipientEdrpou: "43983495",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA508999980313030104000020013",
    budgetCode: "11010100",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата ПДФО за [період]; ;",
    paymentDeadline: "У день виплати доходу / до 30 числа наступного місяця",
    latePenalty: "Штраф 10/25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ПДФО", "Харків", "Зарплата"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    faq: FALLBACK_FAQ,
  },

  // ── ПДФО — Одеса ──────────────────────────────────────────────────────────
  {
    id: "pdfo-odesa",
    slug: "pdfo-odeska-oblast",
    taxType: "pdfo",
    region: "odesa",
    audience: "both",
    title: "ПДФО (Одеська область) — 18%",
    summary: "Рахунок для сплати ПДФО у Одеській області.",
    recipientName: "ГУ ДПС у Одеській області",
    recipientEdrpou: "43995593",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA468999980313030104000015010",
    budgetCode: "11010100",
    paymentPurposeTemplate: "*;101;[ІПН/ЄДРПОУ];сплата ПДФО за [період]; ;",
    paymentDeadline: "У день виплати доходу / до 30 числа наступного місяця",
    latePenalty: "Штраф 10/25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["ПДФО", "Одеса", "Зарплата"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    faq: FALLBACK_FAQ,
  },

  // ── ПНП — загальнодержавний ───────────────────────────────────────────────
  {
    id: "pnp-all-ua",
    slug: "podatok-na-prybutok-pidpryyemstv",
    taxType: "pnp",
    region: "all-ua",
    audience: "business",
    title: "Податок на прибуток підприємств — 18%",
    summary: "Загальнодержавний податок на прибуток ТОВ — 18% від оподатковуваного прибутку. Сплачується щокварталу або щорічно (для платників з обігом < 40 млн грн).",
    recipientName: "ГУ ДПС за місцем реєстрації платника",
    recipientEdrpou: "—",
    bankName: "Казначейство України (ел. адм. подат.)",
    iban: "UA[визначається за областю реєстрації]",
    budgetCode: "11021000",
    paymentPurposeTemplate: "*;101;[ЄДРПОУ];сплата податку на прибуток за [квартал/рік]; ;",
    paymentDeadline: "До 19 числа місяця, наступного за звітним кварталом / до 11 червня року, наступного за звітним",
    latePenalty: "Штраф 25/50% + пеня 120% облікової ставки НБУ",
    officialUrl: "https://tax.gov.ua/byudjetni-rahunki",
    asOf: "2026-01-01",
    tags: ["Податок на прибуток", "ТОВ", "Загальнодержавний", "18%"],
    relatedLawSlugs: ["pkv"],
    relatedAgencySlugs: ["dps"],
    faq: [
      {
        q: "Чому конкретного IBAN немає у списку?",
        a: "Реквізити визначаються за областю реєстрації платника. Перейдіть на сторінку ДПС вашої області або скористайтесь Електронним кабінетом — він автоматично формує платіжне доручення з правильним IBAN.",
      },
      ...FALLBACK_FAQ,
    ],
    seoTitle: "Рахунок податку на прибуток 2026 — реквізити для ТОВ | FINTODO",
    seoDescription: "Як знайти IBAN для сплати податку на прибуток підприємств 18%. Дедлайни, штрафи, призначення платежу.",
  },
];

export const getBudgetAccountBySlug = (slug: string) =>
  BUDGET_ACCOUNTS.find((b) => b.slug === slug);
