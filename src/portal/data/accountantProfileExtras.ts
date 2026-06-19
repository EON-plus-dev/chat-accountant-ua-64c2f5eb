import type { AccountantProfile } from "./accountants";

export interface ServicePackage {
  name: string;
  priceFrom: number;
  priceDisplay: string;
  features: string[];
  highlight?: boolean;
  /** ID шаблону договору (з `contractTemplates`), що відповідає саме цій послузі. */
  contractTemplateId?: string;
}

export interface ContractTemplate {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  format: "pdf" | "docx";
  sizeKb?: number;
  updatedAt: string;          // YYYY-MM-DD
  scope: "primary" | "service";
}

export interface AddOn {
  name: string;
  price: string;
}

export interface PricingDetails {
  packages: ServicePackage[];
  addOns: AddOn[];
  vatIncluded: boolean;
  paymentTerms: string;       // "Передплата помісячно" / "Постоплата квартально"
  freeIntroMinutes: number | null;
}

export interface ClientReview {
  authorInitials: string;
  authorLabel: string;        // "ФОП 3 гр., IT" — анонімізовано
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;               // "2026-03"
  text: string;
  reply?: string;
}

export interface CaseStudy {
  title: string;
  context: string;            // "IT-ФОП 3 гр., $80k/рік, Wise + Deel"
  result: string;             // "Декларовано 100% доходів, штрафів немає за 2 роки"
}

export interface ReviewsBlock {
  distribution: { stars: 1|2|3|4|5; percent: number }[];
  recommendPercent: number;   // % "порекомендують колегам"
  items: ClientReview[];
  cases: CaseStudy[];
}

export interface WorkflowStep {
  title: string;
  description: string;
}

export interface WorkflowDetails {
  steps: WorkflowStep[];
  delegationMode: "fintodo" | "kep_handover" | "both";  // як отримує доступ
  reportCadence: string;      // "Щомісяця: звіт + дзвінок 30 хв"
  deadlineSLA: string;        // "Подача декларацій за 5 днів до дедлайну"
  clientProvides: string[];
  accountantHandles: string[];
}

export interface LiabilityDetails {
  contractParty: string;      // "Договір з ФОП Коваленко О.І. (РНОКПП 1234567890)"
  insurance?: { provider: string; limit: string };
  ndaDefault: boolean;
  dataStorage: string;        // "Хмара FINTODO (Україна, EU-mirror), AES-256"
  liabilityClause: string;    // хто платить за помилку
}

/** Біографія індивідуала: освіта, ролі, особисті сертифікати. */
export interface IndividualBackground {
  kind: "individual";
  education: { school: string; degree: string; year: number }[];
  experience: { role: string; org: string; period: string }[];
  certifications: { name: string; issuer: string; year: number; id?: string }[];
  memberships: string[];
}

/** Профайл компанії: лідери, команда, корпоративні сертифікати. */
export interface AgencyLeader {
  name: string;
  role: string;
  bio: string;
  initials: string;
  photoUrl?: string;
  certifications?: string[];
}
export interface AgencyBackground {
  kind: "agency";
  foundedYear: number;
  teamSize: number;
  teamComposition: string;            // "8 senior + 4 middle, з них 3 ACCA"
  clientFocus: string;                // "ТОВ із оборотом 5–500 млн ₴, ЗЕД, IT"
  milestones: { year: number; event: string }[];
  leaders: AgencyLeader[];
  certifications: { name: string; issuer: string; year: number; id?: string }[];
  memberships: string[];
  officeLocation?: string;
}

export type BackgroundDetails = IndividualBackground | AgencyBackground;

export interface AvailabilityDetails {
  status: "accepting" | "waitlist" | "closed";
  waitlistDays?: number;
  freeSlotsThisMonth?: { taken: number; total: number };
  workingHours: string;       // "Пн–Пт, 09:00–19:00"
  timezone: string;           // "Europe/Kyiv"
  vacationNotice?: string;
}

export interface AccountantExtras {
  /** 3 короткі тези під hero: «Спеціалізація · Працює з · Типовий клієнт». */
  headlineTags?: string[];
  pricing?: PricingDetails;
  reviews?: ReviewsBlock;
  workflow?: WorkflowDetails;
  liability?: LiabilityDetails;
  background?: BackgroundDetails;
  availability?: AvailabilityDetails;
  serviceTypes?: string[];    // для schema.org
  /** Зразки договорів партнера (основний + опційні додатки до конкретних послуг). */
  contractTemplates?: ContractTemplate[];
}

// === Defaults applied to any FINTODO Certified accountant when no override ===
export const DEFAULT_EXTRAS: Required<Omit<AccountantExtras, "headlineTags" | "pricing" | "reviews" | "background" | "contractTemplates">> & Pick<AccountantExtras, "headlineTags" | "pricing" | "reviews" | "background" | "contractTemplates"> = {
  workflow: {
    steps: [
      { title: "Запит з каталогу", description: "Ви надсилаєте короткий бриф через FINTODO. Бухгалтер бачить ваш тип бізнесу і поточний стан." },
      { title: "Безкоштовний дзвінок 30 хв", description: "Уточнюємо обсяг робіт, дедлайни, передаємо документи на ознайомлення під NDA." },
      { title: "Договір і ціна", description: "Підписуємо договір КЕП-ом через FINTODO. Ціна фіксована, без прихованих доплат." },
      { title: "Делегування доступу", description: "Ви даєте обмежений доступ до кабінету FINTODO (без передачі КЕП). Дію скасовуєте у 1 клік." },
      { title: "Старт обліку", description: "Першу декларацію подаємо у наступному звітному періоді. Щомісяця — звіт і дзвінок." },
    ],
    delegationMode: "fintodo",
    reportCadence: "Щомісяця: звіт у кабінеті + дзвінок 20–30 хв за запитом",
    deadlineSLA: "Декларації готуються щонайменше за 5 днів до офіційного дедлайну ДПС",
    clientProvides: ["Первинні документи (накладні, акти, інвойси)", "Виписки з банку (або підключений API)", "Зміни у договорах і КВЕД"],
    accountantHandles: ["Декларації ЄП / ПДВ / 4ДФ / ЄСВ", "Книга обліку доходів", "Кадри та зарплата", "Консультації в робочі години", "Листування з ДПС"],
  },
  liability: {
    contractParty: "Договір укладається безпосередньо з виконавцем. Реквізити надаємо перед підписанням.",
    ndaDefault: true,
    dataStorage: "Хмара FINTODO (сервери в Україні, EU-міррор), шифрування AES-256, доступ за RLS-політиками",
    liabilityClause: "Згідно з договором, виконавець відшкодовує штрафи ДПС, що виникли через його помилку (типовий ліміт — місячна вартість послуг). Деталі — у тексті договору.",
  },
  availability: {
    status: "accepting",
    workingHours: "Пн–Пт, 09:00–19:00",
    timezone: "Europe/Kyiv",
  },
  serviceTypes: ["Бухгалтерський облік", "Податковий консалтинг", "Кадровий облік"],
};

// === Concrete overrides for richer demo profiles ===
export const ACCOUNTANT_EXTRAS: Record<string, AccountantExtras> = {
  "oksana-kovalenko": {
    headlineTags: ["IT-ФОП та фрілансери", "Wise · Deel · Payoneer", "Типовий клієнт: розробник $50–150k/рік"],
    contractTemplates: [
      { id: "primary", title: "Договір на бухгалтерське обслуговування ФОП", description: "Базовий шаблон для ФОП 1–3 групи. NDA включено.", fileUrl: "/sample-contracts/oksana-primary.pdf", format: "pdf", sizeKb: 52, updatedAt: "2026-03-15", scope: "primary" },
    ],
    pricing: {
      packages: [
        { name: "ФОП 1–2 гр.", priceFrom: 1500, priceDisplay: "1 500 ₴/міс", features: ["Декларація ЄП квартально", "ЄСВ", "Книга обліку доходів", "1 консультація/міс"], contractTemplateId: "primary" },
        { name: "ФОП 3 гр.", priceFrom: 2500, priceDisplay: "2 500 ₴/міс", features: ["Декларація ЄП квартально", "ЄСВ", "Книга обліку", "Wise/Deel/Payoneer", "2 консультації/міс"], highlight: true, contractTemplateId: "primary" },
        { name: "ФОП 3 гр. + ПДВ", priceFrom: 4000, priceDisplay: "4 000 ₴/міс", features: ["Усе з ФОП 3 гр.", "Декларація ПДВ щомісяця", "Реєстрація ПН/РК", "Узгодження з контрагентами"] },
        { name: "ТОВ малий", priceFrom: 5000, priceDisplay: "від 5 000 ₴/міс", features: ["Повний облік", "Зарплата до 5 співробітників", "Фінзвіт квартально"] },
      ],
      addOns: [
        { name: "Відновлення обліку", price: "від 5 000 ₴/місяць відновлення" },
        { name: "Реєстрація ПДВ", price: "3 000 ₴ разово" },
        { name: "Зміна КВЕД / групи ФОП", price: "1 500 ₴ разово" },
        { name: "Представлення в ДПС (1 виклик)", price: "2 500 ₴" },
        { name: "Ліквідація ФОП", price: "5 000 ₴" },
      ],
      vatIncluded: false,
      paymentTerms: "Передплата помісячно, до 5 числа",
      freeIntroMinutes: 30,
    },
    reviews: {
      distribution: [
        { stars: 5, percent: 87 }, { stars: 4, percent: 10 }, { stars: 3, percent: 2 }, { stars: 2, percent: 1 }, { stars: 1, percent: 0 },
      ],
      recommendPercent: 96,
      items: [
        { authorInitials: "ДВ", authorLabel: "ФОП 3 гр., IT-розробник", rating: 5, date: "2026-03", text: "Перевів з попереднього бухгалтера через помилку з Wise. Оксана за тиждень підняла декларації за 2 роки і виправила. Жодного штрафу не отримав." },
        { authorInitials: "ОК", authorLabel: "ФОП 3 гр., дизайн-агенція", rating: 5, date: "2026-02", text: "Веде нас 14 місяців. Жодного разу не пропустила дедлайн. Завжди відповідає в межах 2 годин навіть у вихідні (за окрему домовленість)." },
        { authorInitials: "АМ", authorLabel: "ФОП 2 гр., консалтинг", rating: 4, date: "2026-01", text: "Усе чітко по суті. Єдине — інколи бракує проактивності, треба самому ставити питання. Але якщо ви знаєте чого хочете — це ідеальний варіант.", reply: "Дякую за відгук! Ввела щомісячний proactive-чекліст для всіх клієнтів з лютого 2026." },
      ],
      cases: [
        { title: "IT-ФОП 3 гр. з валютою", context: "Розробник, $80k/рік через Wise і Deel, оплата з 4 країн", result: "100% задекларовано, оптимізовано курсову різницю, штрафів за 2 роки немає" },
        { title: "Перехід з попереднього бухгалтера", context: "ФОП 3 гр., виявлено 11 неподаних декларацій ПН за 2024–2025", result: "Усе подано із самоштрафом 3% (замість 25–50%), збережено 47 000 ₴" },
      ],
    },
    background: {
      kind: "individual",
      education: [{ school: "КНЕУ ім. В. Гетьмана", degree: "Облік і аудит, магістр", year: 2013 }],
      experience: [
        { role: "Головний бухгалтер", org: "IT-аутсорс компанія (200+ співробітників)", period: "2018–2023" },
        { role: "Бухгалтер ЗЕД-відділу", org: "Експортна компанія", period: "2014–2018" },
      ],
      certifications: [
        { name: "FINTODO Certified Accountant", issuer: "FINTODO", year: 2024, id: "FCA-0142" },
        { name: "Сертифікат практикуючого бухгалтера", issuer: "Палата професійних бухгалтерів", year: 2016 },
      ],
      memberships: ["Палата професійних бухгалтерів і аудиторів України"],
    },
    availability: {
      status: "accepting",
      freeSlotsThisMonth: { taken: 15, total: 18 },
      workingHours: "Пн–Пт, 09:00–19:00",
      timezone: "Europe/Kyiv",
    },
    serviceTypes: ["Бухгалтерський облік ФОП", "Податковий консалтинг IT", "ЗЕД та валютні розрахунки"],
  },

  "finhouse-agency": {
    headlineTags: ["ТОВ із оборотом 5–500 млн ₴", "Due diligence та управлінська звітність", "Виділений менеджер на групу юросіб"],
    contractTemplates: [
      { id: "primary", title: "Договір на бухгалтерське обслуговування ТОВ", description: "Базовий шаблон для ТОВ на ЄП/ЗС. NDA включено.", fileUrl: "/sample-contracts/finhouse-primary.pdf", format: "pdf", sizeKb: 53, updatedAt: "2026-04-01", scope: "primary" },
      { id: "zed-addendum", title: "Додаткова угода: ЗЕД-супровід", description: "Додаток до основного договору для ЗЕД-послуг.", fileUrl: "/sample-contracts/finhouse-zed-addendum.pdf", format: "pdf", sizeKb: 49, updatedAt: "2026-04-01", scope: "service" },
    ],
    pricing: {
      packages: [
        { name: "ТОВ ЄП", priceFrom: 8000, priceDisplay: "від 8 000 ₴/міс", features: ["Повний облік", "Зарплата до 10 осіб", "Декларації", "Місячний звіт"], contractTemplateId: "primary" },
        { name: "ТОВ ЗС + ПДВ", priceFrom: 15000, priceDisplay: "від 15 000 ₴/міс", features: ["Облік ЗС", "ПДВ щомісяця", "Зарплата до 25 осіб", "Управлінська звітність"], highlight: true, contractTemplateId: "primary" },
        { name: "Холдинг / група", priceFrom: 35000, priceDisplay: "від 35 000 ₴/міс", features: ["Кілька юросіб", "Консолідована звітність", "Підготовка до due diligence", "Виділений менеджер"], contractTemplateId: "primary" },
        { name: "ЗЕД-супровід", priceFrom: 12000, priceDisplay: "від 12 000 ₴/міс", features: ["Контракти ЗЕД", "Валютний контроль", "Митниця", "Трансфертне ціноутворення"], contractTemplateId: "zed-addendum" },
      ],
      addOns: [
        { name: "Due diligence / due diligence-ready звітність", price: "від 50 000 ₴" },
        { name: "Аудит фінзвітності за рік", price: "від 25 000 ₴" },
        { name: "Кадровий аудит", price: "15 000 ₴" },
        { name: "Реєстрація ТОВ під ключ", price: "8 000 ₴" },
        { name: "Супровід податкової перевірки", price: "погодинно, від 2 500 ₴/год" },
      ],
      vatIncluded: false,
      paymentTerms: "Постоплата квартально, акт-наряд щомісяця",
      freeIntroMinutes: 60,
    },
    reviews: {
      distribution: [
        { stars: 5, percent: 91 }, { stars: 4, percent: 7 }, { stars: 3, percent: 1 }, { stars: 2, percent: 1 }, { stars: 1, percent: 0 },
      ],
      recommendPercent: 98,
      items: [
        { authorInitials: "СК", authorLabel: "CFO, Series-A SaaS", rating: 5, date: "2026-04", text: "Готували нас до due diligence американського фонду. За 6 тижнів привели 3 роки обліку у відповідність US GAAP-friendly. Угода закрита." },
        { authorInitials: "МР", authorLabel: "Власник ТОВ, e-commerce", rating: 5, date: "2026-02", text: "Веде 4 наші юрособи (УА, EE, PL, US). Один менеджер, єдиний звіт. Це безцінно." },
        { authorInitials: "ВН", authorLabel: "Директор виробничого ТОВ", rating: 4, date: "2026-01", text: "Якість висока, але ціна теж. Для бізнесу до 5 млн обороту — задорого. Для більшого — найкращий вибір у Києві." },
      ],
      cases: [
        { title: "Due diligence для Series-A", context: "SaaS-стартап, $2.4M ARR, оцінка $18M", result: "Звітність готова за 6 тижнів, угода закрилась без discount-ів через бухоблік" },
        { title: "Консолідація 4-х юросіб", context: "E-commerce, продаж в УА/ЄС/США", result: "Єдина управлінська звітність, економія 6 год/міс на reconciliation" },
      ],
    },
    background: {
      kind: "agency",
      foundedYear: 2010,
      teamSize: 12,
      teamComposition: "8 senior + 4 middle бухгалтерів, з них 3 з дипломом ACCA DipIFR і 2 податкових консультанти",
      clientFocus: "ТОВ із оборотом 5–500 млн ₴ — IT, e-commerce, виробництво. Холдинги до 6 юросіб у 4 юрисдикціях.",
      milestones: [
        { year: 2010, event: "Заснування агенції в Києві, перші 4 клієнти-ТОВ" },
        { year: 2018, event: "Перший співробітник з ACCA DipIFR, запуск послуги управлінської звітності" },
        { year: 2021, event: "Перший due diligence для Series-A раунду українського SaaS" },
        { year: 2022, event: "Сертифікація ISO 9001:2015 (Bureau Veritas)" },
        { year: 2023, event: "FINTODO Certified Firm (FCF-0008), 86 активних клієнтів" },
      ],
      leaders: [
        { name: "Олена Гриценко", role: "CEO та засновник", initials: "ОГ", bio: "14 років досвіду в Big4 (Deloitte, EY) до заснування FinHouse. ACCA, DipIFR.", certifications: ["ACCA", "DipIFR"] },
        { name: "Дмитро Литвин", role: "Head of Audit & Due Diligence", initials: "ДЛ", bio: "Веде due diligence-проєкти для VC та M&A. 9 років в аудиті, 23 закритих угоди.", certifications: ["ACCA", "CIA"] },
        { name: "Анна Ковальчук", role: "Head of Tax", initials: "АК", bio: "Спеціалізація — ЗЕД, трансфертне ціноутворення, BEPS. Магістр КНЕУ + LSE Tax Online.", certifications: ["DipIFR"] },
      ],
      certifications: [
        { name: "FINTODO Certified Firm", issuer: "FINTODO", year: 2023, id: "FCF-0008" },
        { name: "ISO 9001:2015", issuer: "Bureau Veritas", year: 2022 },
        { name: "ACCA Approved Employer", issuer: "ACCA Global", year: 2021 },
      ],
      memberships: ["Спілка аудиторів України", "American Chamber of Commerce in Ukraine"],
      officeLocation: "Київ, БЦ «Парус», вул. Мечникова 2",
    },
    liability: {
      contractParty: "Договір з ТОВ «ФінХаус Консалтинг» (ЄДРПОУ 41234567)",
      insurance: { provider: "АСКА Страхування", limit: "до 5 000 000 ₴ на випадок" },
      ndaDefault: true,
      dataStorage: "Хмара FINTODO + резервна копія в EU (Frankfurt). Шифрування AES-256, MFA для всіх співробітників.",
      liabilityClause: "Повне відшкодування штрафів ДПС, що виникли через помилку виконавця, до ліміту страхового покриття. Деталі — у п. 7 договору.",
    },
    availability: {
      status: "waitlist",
      waitlistDays: 14,
      freeSlotsThisMonth: { taken: 86, total: 90 },
      workingHours: "Пн–Пт, 09:00–19:00 · Сб 10:00–14:00 (тільки термінові)",
      timezone: "Europe/Kyiv",
    },
    serviceTypes: ["Бухгалтерський облік ТОВ", "Управлінська звітність", "Due diligence", "ЗЕД"],
  },

  "taxsmart-firm": {
    headlineTags: ["Податкові спори і перевірки ДПС", "M&A та due diligence", "Тільки складні кейси, ціна за результат"],
    background: {
      kind: "agency",
      foundedYear: 2007,
      teamSize: 9,
      teamComposition: "5 податкових консультантів, 3 адвокати з податкової спеціалізації, 1 проєктний менеджер",
      clientFocus: "Виробництво, імпорт, агро. Кейси з оборотом 50 млн ₴ і вище, де ставка спору > 1 млн ₴.",
      milestones: [
        { year: 2007, event: "Заснування у Харкові як податковий консалтинг" },
        { year: 2014, event: "Перший виграний спір з ДПС у касації — ставка 4,2 млн ₴" },
        { year: 2019, event: "Запуск адвокатської практики, отримано свідоцтва" },
        { year: 2022, event: "Перший due diligence для M&A в агро-секторі (угода $12M)" },
        { year: 2024, event: "FINTODO Certified Firm, 76 активних клієнтів" },
      ],
      leaders: [
        { name: "Сергій Тарасенко", role: "Керуючий партнер, адвокат", initials: "СТ", bio: "18 років практики. 47 виграних адміністративних оскаржень. Викладач податкового права у НЮУ ім. Я. Мудрого.", certifications: ["Адвокат", "Податковий консультант"] },
        { name: "Ірина Лебедь", role: "Head of Tax Disputes", initials: "ІЛ", bio: "12 років у податкових спорах. Спеціалізація — ПДВ та трансфертне ціноутворення.", certifications: ["Адвокат"] },
      ],
      certifications: [
        { name: "FINTODO Certified Firm", issuer: "FINTODO", year: 2024, id: "FCF-0021" },
        { name: "Адвокатські свідоцтва (3 співробітники)", issuer: "НААУ", year: 2019 },
      ],
      memberships: ["Національна асоціація адвокатів України", "Асоціація податкових консультантів"],
      officeLocation: "Харків, БЦ «Європа», просп. Науки 9",
    },
    pricing: {
      packages: [
        { name: "Податковий супровід", priceFrom: 12000, priceDisplay: "від 12 000 ₴/міс", features: ["Облік ТОВ", "Податкове планування", "Місячний ризик-звіт"] },
        { name: "Спір з ДПС / оскарження ППР", priceFrom: 25000, priceDisplay: "від 25 000 ₴ за справу", features: ["Аналіз ППР", "Адміністративне оскарження", "Підготовка позову до суду"], highlight: true },
        { name: "Супровід перевірки", priceFrom: 30000, priceDisplay: "від 30 000 ₴", features: ["Підготовка документів", "Присутність на перевірці", "Заперечення на акт"] },
      ],
      addOns: [
        { name: "Due diligence для M&A", price: "від 80 000 ₴" },
        { name: "Реструктуризація бізнесу", price: "індивідуально" },
        { name: "Консультація адвоката-податківця", price: "3 500 ₴/год" },
      ],
      vatIncluded: false,
      paymentTerms: "Передплата 50% + постоплата за актом",
      freeIntroMinutes: 45,
    },
    availability: {
      status: "accepting",
      freeSlotsThisMonth: { taken: 50, total: 60 },
      workingHours: "Пн–Пт, 09:00–18:00",
      timezone: "Europe/Kyiv",
    },
    liability: {
      contractParty: "Договір з ТОВ «TaxSmart» (ЄДРПОУ 39876543) + адвокатська угода",
      insurance: { provider: "ВУСО", limit: "до 3 000 000 ₴" },
      ndaDefault: true,
      dataStorage: "Хмара FINTODO, шифрування AES-256, адвокатська таємниця за ст. 22 ЗУ «Про адвокатуру»",
      liabilityClause: "Відшкодування штрафів за помилку виконавця до ліміту страховки. Адвокатська відповідальність — додатково.",
    },
    serviceTypes: ["Податковий консалтинг", "Податкові спори", "Адвокатський супровід ДПС"],
  },

  "andriy-bondarenko": {
    background: {
      kind: "individual",
      education: [
        { school: "Львівський національний університет ім. І. Франка", degree: "Облік і аудит, магістр", year: 2014 },
        { school: "ACCA Global", degree: "DipIFR (Diploma in IFRS)", year: 2019 },
      ],
      experience: [
        { role: "Фінансовий контролер", org: "Експортна IT-компанія (Львів)", period: "2019–2023" },
        { role: "Бухгалтер ЗЕД-відділу", org: "Виробниче ТОВ", period: "2015–2019" },
        { role: "Приватна практика", org: "ТОВ + ЗЕД-контракти", period: "2023–тепер" },
      ],
      certifications: [
        { name: "FINTODO Certified Accountant", issuer: "FINTODO", year: 2024, id: "FCA-0218" },
        { name: "ACCA DipIFR", issuer: "ACCA Global", year: 2019 },
      ],
      memberships: ["Федерація аудиторів, бухгалтерів і фінансистів АПК України"],
    },
  },

  "maryna-petrenko": {
    background: {
      kind: "individual",
      education: [
        { school: "Дніпровський національний університет ім. О. Гончара", degree: "Економіка підприємства, магістр", year: 2016 },
      ],
      experience: [
        { role: "Бухгалтер", org: "Мережа salon-студій (Дніпро)", period: "2017–2021" },
        { role: "Приватна практика", org: "ФОП 1–3 гр., малий бізнес послуг", period: "2021–тепер" },
      ],
      certifications: [
        { name: "Сертифікат практикуючого бухгалтера", issuer: "Палата професійних бухгалтерів", year: 2018 },
      ],
      memberships: [],
    },
  },

  "iryna-savchuk": {
    background: {
      kind: "individual",
      education: [
        { school: "Одеський національний економічний університет", degree: "Облік і оподаткування, бакалавр", year: 2018 },
      ],
      experience: [
        { role: "Бухгалтер", org: "Digital-агенція (Одеса)", period: "2019–2023" },
        { role: "Приватна практика", org: "IT-фрілансери, digital-агенції", period: "2023–тепер" },
      ],
      certifications: [
        { name: "FINTODO Certified Accountant", issuer: "FINTODO", year: 2024, id: "FCA-0301" },
      ],
      memberships: [],
    },
  },
};

/** Fallback background, побудований із базових полів профілю — щоб блок «Про себе/Про компанію» завжди рендерився. */
function buildFallbackBackground(acc: AccountantProfile): BackgroundDetails {
  const joinedYear = Number(acc.joinedDate?.slice(0, 4)) || new Date().getFullYear();
  const certs = acc.certifications.map((name) => ({
    name,
    issuer: name.startsWith("FINTODO") ? "FINTODO" : (name.includes("ACCA") ? "ACCA Global" : "—"),
    year: joinedYear,
  }));
  if (acc.entityType === "agency") {
    return {
      kind: "agency",
      foundedYear: Math.max(2000, joinedYear - acc.experience),
      teamSize: Math.max(2, Math.round(acc.clientCount / 12)),
      teamComposition: `Команда практикуючих бухгалтерів. Спеціалізація: ${acc.specializations.slice(0, 2).join(", ")}.`,
      clientFocus: `Працює з: ${acc.industries.join(", ")}. Системи оподаткування: ${acc.taxSystems.join(", ")}.`,
      milestones: [],
      leaders: [],
      certifications: certs,
      memberships: [],
      officeLocation: `${acc.city}, ${acc.region}`,
    };
  }
  return {
    kind: "individual",
    education: [],
    experience: [{
      role: "Бухгалтер-практик",
      org: "Приватна практика",
      period: `${Math.max(2005, new Date().getFullYear() - acc.experience)}–тепер · ${acc.experience} років`,
    }],
    certifications: certs,
    memberships: [],
  };
}

export function getAccountantExtras(acc: AccountantProfile): {
  headlineTags: string[];
  pricing: PricingDetails | null;
  reviews: ReviewsBlock | null;
  workflow: WorkflowDetails;
  liability: LiabilityDetails;
  background: BackgroundDetails;
  availability: AvailabilityDetails;
  serviceTypes: string[];
  contractTemplates: ContractTemplate[];
} {
  const overrides = ACCOUNTANT_EXTRAS[acc.id] ?? {};
  const fallbackTags = [
    `${acc.specializations[0] ?? "Бухгалтерський облік"}`,
    `Працює з: ${acc.industries.slice(0, 2).join(" · ") || "різні галузі"}`,
    `${acc.clientCount} активних клієнтів`,
  ];
  return {
    headlineTags: overrides.headlineTags ?? fallbackTags,
    pricing: overrides.pricing ?? null,
    reviews: overrides.reviews ?? null,
    workflow: overrides.workflow ?? DEFAULT_EXTRAS.workflow,
    liability: overrides.liability ?? DEFAULT_EXTRAS.liability,
    background: overrides.background ?? buildFallbackBackground(acc),
    availability: overrides.availability ?? DEFAULT_EXTRAS.availability,
    serviceTypes: overrides.serviceTypes ?? DEFAULT_EXTRAS.serviceTypes,
    contractTemplates: overrides.contractTemplates ?? [],
  };
}

