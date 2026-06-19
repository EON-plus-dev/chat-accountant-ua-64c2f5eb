/**
 * Класифікатор професій ДК 003:2010
 * (затверджений наказом Держспоживстандарту № 327 від 28.07.2010).
 *
 * Обов'язковий для:
 *   • трудових договорів і наказів про прийняття на роботу;
 *   • штатних розписів і посадових інструкцій;
 *   • форми 1ДФ та звіту з ЄСВ (поле «код за класифікатором професій»);
 *   • статистичних звітів про оплату праці.
 *
 * Підмножина найзатребуваніших ~60 професій по всіх 9 розділах. Повний класифікатор
 * містить ~8 500 професій і опублікований на dlsu.com.ua / Мінсоцполітики.
 */

import type { DirectoryFaqItem } from "@/portal/data/knowledge/directoryTypes";

export type ProfesiaSection =
  | "1" // Законодавці, керівники
  | "2" // Професіонали
  | "3" // Фахівці
  | "4" // Технічні службовці
  | "5" // Працівники сфери торгівлі та послуг
  | "6" // Кваліфіковані робітники с/г
  | "7" // Кваліфіковані робітники з інструментом
  | "8" // Робітники з обслуговування машин
  | "9"; // Найпростіші професії

export const PROFESIA_SECTION_LABEL: Record<ProfesiaSection, string> = {
  "1": "Керівники",
  "2": "Професіонали",
  "3": "Фахівці",
  "4": "Технічні службовці",
  "5": "Сфера торгівлі та послуг",
  "6": "Кваліфіковані робітники с/г",
  "7": "Робітники з інструментом",
  "8": "Робітники з обслуговування машин",
  "9": "Найпростіші професії",
};

export const PROFESIA_SECTION_FULL_LABEL: Record<ProfesiaSection, string> = {
  "1": "Розділ 1. Законодавці, вищі державні службовці, керівники, менеджери (управителі)",
  "2": "Розділ 2. Професіонали",
  "3": "Розділ 3. Фахівці",
  "4": "Розділ 4. Технічні службовці",
  "5": "Розділ 5. Працівники сфери торгівлі та послуг",
  "6": "Розділ 6. Кваліфіковані робітники сільського та лісового господарств, риборозведення та рибальства",
  "7": "Розділ 7. Кваліфіковані робітники з інструментом",
  "8": "Розділ 8. Робітники з обслуговування, експлуатації та контролювання за роботою технологічного устаткування",
  "9": "Розділ 9. Найпростіші професії",
};

export interface ProfesiaEntry {
  id: string;
  /** Код ДК 003:2010 (4–5 цифр) */
  code: string;
  /** URL-slug */
  slug: string;
  /** Офіційна назва професії */
  name: string;
  /** Альтернативні / синонімічні назви */
  aliases?: string[];
  section: ProfesiaSection;
  /** Стислий опис обов'язків */
  description: string;
  /** Необхідна освіта */
  requiredEducation: string;
  /** Орієнтовна зарплата, грн/міс */
  typicalSalary?: string;
  /** Чи передбачена пільгова пенсія (Список 1/2) */
  pensionList?: "1" | "2" | "none";
  /** Чи поширені трудові порушення (для AI-предикторів) */
  riskNotes?: string;

  /** Дотичні КВЕД-коди (де професія найчастіше зустрічається) */
  typicalKvedCodes?: string[];
  audience: "business" | "personal" | "both";

  tags: string[];
  faq?: DirectoryFaqItem[];

  relatedLawSlugs?: string[];
  relatedPenaltySlugs?: string[];
  relatedToolIds?: string[];

  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

const COMMON_FAQ: DirectoryFaqItem[] = [
  {
    q: "Що буде, якщо в наказі вказати неправильний код професії?",
    a: "Держпраці може застосувати штраф за порушення вимог трудового законодавства — від 1 МЗП (для ФОП) до 2 МЗП (для юрособи). Крім того, неправильний код блокує подальші розрахунки пільгової пенсії працівника.",
  },
  {
    q: "Чи можна змінити назву посади на власну?",
    a: "Назва посади у штатному розписі має точно відповідати ДК 003:2010 (із дозволеними доповненнями: галузь, напрям). Власні «креативні» назви на кшталт «Head of Magic» — не допускаються в офіційних документах.",
  },
];

export const PROFESII: ProfesiaEntry[] = [
  // ── Розділ 1. Керівники ───────────────────────────────────────────────────
  {
    id: "1210-1",
    code: "1210.1",
    slug: "kerivnyk-pidpryiemstva",
    name: "Керівник підприємства",
    aliases: ["Директор", "Генеральний директор", "CEO"],
    section: "1",
    description: "Здійснює загальне керівництво виробничою, господарською та соціально-економічною діяльністю підприємства.",
    requiredEducation: "Повна вища освіта (магістр) + стаж керівної роботи від 5 років.",
    typicalSalary: "40 000–250 000 грн/міс",
    pensionList: "none",
    typicalKvedCodes: ["70.10"],
    audience: "business",
    tags: ["директор", "CEO", "керівник", "штатний розпис"],
    relatedLawSlugs: ["kzpp"],
    seoTitle: "Директор підприємства — код 1210.1 ДК 003:2010 | FINTODO",
    seoDescription: "Офіційний код професії «Керівник підприємства» (1210.1) для штатного розпису, форми 1ДФ та звіту ЄСВ.",
    faq: COMMON_FAQ,
  },
  {
    id: "1231",
    code: "1231",
    slug: "kerivnyk-finansovogo-pidrozdilu",
    name: "Керівник фінансового підрозділу",
    aliases: ["Фінансовий директор", "CFO", "Головний бухгалтер (з функціями керівника)"],
    section: "1",
    description: "Очолює фінансовий підрозділ, відповідає за бюджетування, фінансову звітність, податкову політику.",
    requiredEducation: "Повна вища освіта (фінанси, облік) + стаж від 3 років.",
    typicalSalary: "35 000–180 000 грн/міс",
    typicalKvedCodes: ["69.20"],
    audience: "business",
    tags: ["CFO", "фінансовий директор"],
    faq: COMMON_FAQ,
  },
  {
    id: "1238",
    code: "1238",
    slug: "kerivnyk-proektiv-ta-programu",
    name: "Керівник проєктів та програм",
    aliases: ["Project Manager", "PM", "Програмний менеджер"],
    section: "1",
    description: "Управління проєктами/програмами організації — від планування до контролю виконання.",
    requiredEducation: "Повна вища освіта + сертифікація PMP/PRINCE2 (бажано).",
    typicalSalary: "45 000–120 000 грн/міс",
    typicalKvedCodes: ["62.01", "70.22"],
    audience: "business",
    tags: ["Project Manager", "PM", "IT"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 2. Професіонали ────────────────────────────────────────────────
  {
    id: "2411-1",
    code: "2411.1",
    slug: "audytor",
    name: "Аудитор",
    section: "2",
    description: "Здійснює незалежний аудит фінансової звітності підприємств, готує аудиторські висновки.",
    requiredEducation: "Повна вища освіта (облік, аудит) + сертифікат аудитора.",
    typicalSalary: "30 000–100 000 грн/міс",
    typicalKvedCodes: ["69.20"],
    audience: "business",
    tags: ["аудитор", "аудит", "звітність"],
    faq: COMMON_FAQ,
  },
  {
    id: "2411-2",
    code: "2411.2",
    slug: "bukhgalter",
    name: "Бухгалтер",
    aliases: ["Головний бухгалтер", "Бухгалтер-фінансист"],
    section: "2",
    description: "Ведення бухгалтерського обліку, складання фінансової та податкової звітності, контроль розрахунків.",
    requiredEducation: "Повна або базова вища освіта (облік і оподаткування).",
    typicalSalary: "15 000–60 000 грн/міс",
    typicalKvedCodes: ["69.20", "82.11"],
    audience: "business",
    tags: ["бухгалтер", "облік", "ЄСВ", "1ДФ"],
    relatedLawSlugs: ["zu-bukhoblik"],
    relatedToolIds: ["esv-calculator"],
    seoTitle: "Бухгалтер — код 2411.2 ДК 003:2010 | FINTODO",
    seoDescription: "Код професії «Бухгалтер» (2411.2) для трудового договору, штатного розпису та звіту ЄСВ.",
    faq: COMMON_FAQ,
  },
  {
    id: "2421-2",
    code: "2421.2",
    slug: "advokat",
    name: "Адвокат",
    section: "2",
    description: "Здійснює адвокатську діяльність на основі свідоцтва Ради адвокатів України.",
    requiredEducation: "Повна вища юридична освіта + стаж 2 роки + свідоцтво адвоката.",
    typicalSalary: "30 000–150 000 грн/міс",
    typicalKvedCodes: ["69.10"],
    audience: "business",
    tags: ["адвокат", "юрист"],
    faq: COMMON_FAQ,
  },
  {
    id: "2421-3",
    code: "2421.3",
    slug: "yurystkonsult",
    name: "Юрисконсульт",
    aliases: ["Корпоративний юрист", "Юрист підприємства"],
    section: "2",
    description: "Забезпечує юридичний супровід діяльності підприємства, договірну роботу, представництво.",
    requiredEducation: "Повна вища юридична освіта.",
    typicalSalary: "20 000–80 000 грн/міс",
    typicalKvedCodes: ["69.10"],
    audience: "business",
    tags: ["юрист", "юрисконсульт"],
    faq: COMMON_FAQ,
  },
  {
    id: "2131-2",
    code: "2131.2",
    slug: "inzhener-programist",
    name: "Інженер-програміст",
    aliases: ["Розробник", "Software Engineer", "Developer", "Програміст"],
    section: "2",
    description: "Розробка, тестування і супровід програмного забезпечення.",
    requiredEducation: "Повна вища освіта (комп'ютерні науки, інженерія ПЗ).",
    typicalSalary: "40 000–250 000 грн/міс",
    typicalKvedCodes: ["62.01", "62.02"],
    audience: "business",
    tags: ["програміст", "розробник", "developer", "IT"],
    seoTitle: "Програміст — код 2131.2 ДК 003:2010 для IT-компаній | FINTODO",
    seoDescription: "Код «Інженер-програміст» (2131.2) для трудових договорів IT-спеціалістів, ФОП 3 групи.",
    seoKeywords: ["програміст код", "розробник професія", "2131.2"],
    faq: COMMON_FAQ,
  },
  {
    id: "2132-2",
    code: "2132.2",
    slug: "administrator-system",
    name: "Адміністратор систем",
    aliases: ["DevOps", "SRE", "Системний адміністратор"],
    section: "2",
    description: "Адміністрування комп'ютерних мереж, серверів, баз даних.",
    requiredEducation: "Повна вища освіта (комп'ютерні науки).",
    typicalSalary: "30 000–120 000 грн/міс",
    typicalKvedCodes: ["62.03", "62.09"],
    audience: "business",
    tags: ["DevOps", "адмін", "SRE"],
    faq: COMMON_FAQ,
  },
  {
    id: "2310-2",
    code: "2310.2",
    slug: "vykladach-vyshchogo-zakladu",
    name: "Викладач закладу вищої освіти",
    section: "2",
    description: "Викладає навчальні дисципліни, веде наукову роботу.",
    requiredEducation: "Повна вища освіта + науковий ступінь (бажано).",
    typicalSalary: "12 000–35 000 грн/міс",
    typicalKvedCodes: ["85.42"],
    audience: "personal",
    tags: ["викладач", "освіта"],
    faq: COMMON_FAQ,
  },
  {
    id: "2221-2",
    code: "2221.2",
    slug: "likar",
    name: "Лікар",
    section: "2",
    description: "Здійснює діагностику, лікування та профілактику захворювань.",
    requiredEducation: "Повна вища медична освіта + інтернатура + сертифікат лікаря-спеціаліста.",
    typicalSalary: "15 000–80 000 грн/міс",
    pensionList: "2",
    typicalKvedCodes: ["86.10", "86.21"],
    audience: "personal",
    tags: ["лікар", "медицина"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 3. Фахівці ─────────────────────────────────────────────────────
  {
    id: "3434-1",
    code: "3434.1",
    slug: "bukhgalter-fakhivets",
    name: "Бухгалтер (з дипломом молодшого спеціаліста)",
    section: "3",
    description: "Веде первинний облік, оформлює документи, нараховує зарплату під керівництвом головного бухгалтера.",
    requiredEducation: "Базова вища освіта (молодший спеціаліст з обліку).",
    typicalSalary: "12 000–30 000 грн/міс",
    typicalKvedCodes: ["69.20"],
    audience: "business",
    tags: ["бухгалтер", "молодший спеціаліст"],
    faq: COMMON_FAQ,
  },
  {
    id: "3411-2",
    code: "3411.2",
    slug: "ahent-z-prodazhu",
    name: "Агент з продажу",
    aliases: ["Менеджер з продажу", "Sales Manager"],
    section: "3",
    description: "Здійснює продаж товарів/послуг, веде переговори, оформлює угоди.",
    requiredEducation: "Базова вища або середня спеціальна.",
    typicalSalary: "15 000–80 000 грн/міс (з %)",
    typicalKvedCodes: ["46.19", "47.91"],
    audience: "business",
    tags: ["продажі", "Sales", "менеджер"],
    faq: COMMON_FAQ,
  },
  {
    id: "3433",
    code: "3433",
    slug: "fakhivets-z-zovnishnoekonomichnoi-diialnosti",
    name: "Фахівець з зовнішньоекономічної діяльності",
    section: "3",
    description: "Супровід ЗЕД-операцій: митні декларації, валютний контроль, контракти з нерезидентами.",
    requiredEducation: "Базова вища освіта (міжнародна економіка, митна справа).",
    typicalSalary: "20 000–60 000 грн/міс",
    typicalKvedCodes: ["46.90"],
    audience: "business",
    tags: ["ЗЕД", "митниця", "експорт", "імпорт"],
    faq: COMMON_FAQ,
  },
  {
    id: "3119",
    code: "3119",
    slug: "tekhnik-z-pidgotovky-vyrobnytstva",
    name: "Технік з підготовки виробництва",
    section: "3",
    description: "Розробляє технологічну документацію, контролює дотримання технології виробництва.",
    requiredEducation: "Базова вища технічна освіта.",
    typicalSalary: "15 000–35 000 грн/міс",
    audience: "business",
    tags: ["технік", "виробництво"],
    faq: COMMON_FAQ,
  },
  {
    id: "3340",
    code: "3340",
    slug: "vykladach-pochatkovykh-spetsializnovanykh-navchalnykh-zakladiv",
    name: "Викладач початкових спеціалізованих мистецьких навчальних закладів",
    section: "3",
    description: "Викладає у мистецьких школах (музика, образотворче мистецтво, хореографія).",
    requiredEducation: "Базова вища освіта (мистецька).",
    typicalSalary: "10 000–25 000 грн/міс",
    audience: "personal",
    tags: ["викладач", "мистецтво"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 4. Технічні службовці ──────────────────────────────────────────
  {
    id: "4115",
    code: "4115",
    slug: "sekretar",
    name: "Секретар керівника",
    aliases: ["Office Manager", "Помічник керівника", "Адміністратор офісу"],
    section: "4",
    description: "Організація роботи приймальні, документообіг, прийом дзвінків і відвідувачів.",
    requiredEducation: "Повна загальна середня + курси діловодства.",
    typicalSalary: "12 000–25 000 грн/міс",
    audience: "business",
    tags: ["секретар", "офіс-менеджер"],
    faq: COMMON_FAQ,
  },
  {
    id: "4121",
    code: "4121",
    slug: "obliccovets",
    name: "Обліковець (реєстрація бухгалтерських даних)",
    section: "4",
    description: "Обробка первинних документів, реєстрація операцій, оформлення відомостей.",
    requiredEducation: "Повна загальна середня + курси обліку.",
    typicalSalary: "10 000–20 000 грн/міс",
    audience: "business",
    tags: ["обліковець"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 5. Сфера торгівлі та послуг ────────────────────────────────────
  {
    id: "5220-2",
    code: "5220.2",
    slug: "prodavets-prodovolchykh-tovariv",
    name: "Продавець продовольчих товарів",
    section: "5",
    description: "Обслуговує покупців, готує товар до продажу, працює з касовим апаратом / ПРРО.",
    requiredEducation: "Повна загальна середня + санітарна книжка.",
    typicalSalary: "10 000–18 000 грн/міс",
    typicalKvedCodes: ["47.11", "47.21"],
    audience: "business",
    tags: ["продавець", "РРО"],
    relatedPenaltySlugs: ["bez-rro"],
    faq: COMMON_FAQ,
  },
  {
    id: "5141",
    code: "5141",
    slug: "perukar",
    name: "Перукар",
    aliases: ["Барбер", "Стиліст"],
    section: "5",
    description: "Виконує перукарські послуги: стрижки, фарбування, укладки.",
    requiredEducation: "Професійно-технічна (перукарська) + сертифікат.",
    typicalSalary: "15 000–60 000 грн/міс",
    typicalKvedCodes: ["96.02"],
    audience: "business",
    tags: ["перукар", "барбер", "салон"],
    faq: COMMON_FAQ,
  },
  {
    id: "5123",
    code: "5123",
    slug: "ofitsiant",
    name: "Офіціант",
    section: "5",
    description: "Обслуговування відвідувачів у закладах ресторанного господарства.",
    requiredEducation: "Повна загальна середня + санітарна книжка.",
    typicalSalary: "12 000–35 000 грн/міс (з чайовими)",
    typicalKvedCodes: ["56.10"],
    audience: "business",
    tags: ["офіціант", "HoReCa"],
    faq: COMMON_FAQ,
  },
  {
    id: "5122",
    code: "5122",
    slug: "kukhar",
    name: "Кухар",
    aliases: ["Шеф-кухар", "Су-шеф", "Chef"],
    section: "5",
    description: "Приготування страв за технологічними картками, контроль якості.",
    requiredEducation: "Професійно-технічна освіта (кулінарія) + санітарна книжка.",
    typicalSalary: "15 000–80 000 грн/міс",
    typicalKvedCodes: ["56.10"],
    audience: "business",
    tags: ["кухар", "шеф", "HoReCa"],
    faq: COMMON_FAQ,
  },
  {
    id: "5132-2",
    code: "5132.2",
    slug: "medychna-sestra",
    name: "Сестра медична",
    aliases: ["Медсестра", "Молодша медсестра"],
    section: "5",
    description: "Надає медичну допомогу під керівництвом лікаря, виконує медичні маніпуляції.",
    requiredEducation: "Базова вища (молодший спеціаліст з медицини).",
    typicalSalary: "12 000–25 000 грн/міс",
    pensionList: "2",
    typicalKvedCodes: ["86.90"],
    audience: "personal",
    tags: ["медсестра"],
    faq: COMMON_FAQ,
  },
  {
    id: "5169",
    code: "5169",
    slug: "okhoronets",
    name: "Охоронець",
    section: "5",
    description: "Здійснює охорону об'єктів, контроль доступу, перевірку документів.",
    requiredEducation: "Повна загальна середня + ліцензія охоронця.",
    typicalSalary: "12 000–25 000 грн/міс",
    typicalKvedCodes: ["80.10"],
    audience: "business",
    tags: ["охорона", "СБ"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 6. С/г ─────────────────────────────────────────────────────────
  {
    id: "6111",
    code: "6111",
    slug: "ovochivnyk",
    name: "Овочівник",
    section: "6",
    description: "Вирощування овочів у відкритому та закритому ґрунті, догляд за рослинами.",
    requiredEducation: "Професійно-технічна (с/г).",
    typicalSalary: "10 000–22 000 грн/міс (сезонно)",
    typicalKvedCodes: ["01.13"],
    audience: "business",
    tags: ["с/г", "овочі"],
    faq: COMMON_FAQ,
  },
  {
    id: "6121",
    code: "6121",
    slug: "tvarynnyk",
    name: "Тваринник",
    section: "6",
    description: "Догляд за сільськогосподарськими тваринами, годівля, доїння, ветеринарний контроль.",
    requiredEducation: "Професійно-технічна.",
    typicalSalary: "12 000–25 000 грн/міс",
    typicalKvedCodes: ["01.41", "01.45"],
    audience: "business",
    tags: ["с/г", "тваринництво"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 7. Робітники з інструментом ────────────────────────────────────
  {
    id: "7212",
    code: "7212",
    slug: "zvariuvalnyk",
    name: "Зварювальник",
    section: "7",
    description: "Виконує зварювальні роботи (ручне, напівавтоматичне, аргонно-дугове зварювання).",
    requiredEducation: "Професійно-технічна + посвідчення зварювальника + допуски.",
    typicalSalary: "20 000–60 000 грн/міс",
    pensionList: "2",
    typicalKvedCodes: ["25.62", "33.11"],
    audience: "business",
    tags: ["зварник", "будівництво"],
    faq: COMMON_FAQ,
  },
  {
    id: "7129",
    code: "7129",
    slug: "muliar",
    name: "Муляр",
    section: "7",
    description: "Кладка стін, перегородок, фундаментів із цегли, газоблоків, каменю.",
    requiredEducation: "Професійно-технічна (будівельна).",
    typicalSalary: "18 000–45 000 грн/міс",
    typicalKvedCodes: ["41.20", "43.99"],
    audience: "business",
    tags: ["муляр", "будівництво"],
    faq: COMMON_FAQ,
  },
  {
    id: "7132",
    code: "7132",
    slug: "elektromontazhnyk",
    name: "Електромонтажник",
    section: "7",
    description: "Монтаж і обслуговування електричних мереж, кабельних ліній, освітлення.",
    requiredEducation: "Професійно-технічна + кваліфікаційна група з електробезпеки.",
    typicalSalary: "18 000–45 000 грн/міс",
    typicalKvedCodes: ["43.21"],
    audience: "business",
    tags: ["електрик", "монтаж"],
    faq: COMMON_FAQ,
  },
  {
    id: "7233",
    code: "7233",
    slug: "slesar-remontnyk",
    name: "Слюсар-ремонтник",
    section: "7",
    description: "Ремонт і технічне обслуговування промислового обладнання.",
    requiredEducation: "Професійно-технічна.",
    typicalSalary: "18 000–40 000 грн/міс",
    typicalKvedCodes: ["33.12"],
    audience: "business",
    tags: ["слюсар", "ремонт"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 8. Робітники з обслуговування машин ────────────────────────────
  {
    id: "8322-2",
    code: "8322.2",
    slug: "vodii-avtotransportnykh-zasobiv",
    name: "Водій автотранспортних засобів",
    aliases: ["Водій вантажівки", "Водій", "Шофер"],
    section: "8",
    description: "Перевезення вантажів / пасажирів автотранспортом, контроль технічного стану.",
    requiredEducation: "Посвідчення водія відповідної категорії + медогляд.",
    typicalSalary: "18 000–55 000 грн/міс",
    typicalKvedCodes: ["49.41", "49.39"],
    audience: "business",
    tags: ["водій", "транспорт", "логістика"],
    faq: COMMON_FAQ,
  },
  {
    id: "8332-2",
    code: "8332.2",
    slug: "mashynist-ekskavatora",
    name: "Машиніст екскаватора",
    section: "8",
    description: "Керування екскаватором при виконанні земляних, гірничих, будівельних робіт.",
    requiredEducation: "Професійно-технічна + посвідчення машиніста.",
    typicalSalary: "25 000–60 000 грн/міс",
    pensionList: "2",
    typicalKvedCodes: ["43.12"],
    audience: "business",
    tags: ["машиніст", "екскаватор"],
    faq: COMMON_FAQ,
  },

  // ── Розділ 9. Найпростіші професії ────────────────────────────────────────
  {
    id: "9112",
    code: "9112",
    slug: "prybyralnyk",
    name: "Прибиральник службових приміщень",
    aliases: ["Прибиральник", "Cleaner"],
    section: "9",
    description: "Прибирання офісних, виробничих, торгових приміщень.",
    requiredEducation: "Не потребує спеціальної освіти.",
    typicalSalary: "8 000–18 000 грн/міс",
    typicalKvedCodes: ["81.21"],
    audience: "business",
    tags: ["прибиральниця", "клінінг"],
    faq: COMMON_FAQ,
  },
  {
    id: "9322",
    code: "9322",
    slug: "vantazhnyk",
    name: "Вантажник",
    section: "9",
    description: "Виконує вантажно-розвантажувальні роботи вручну або з використанням механізмів.",
    requiredEducation: "Не потребує спеціальної освіти.",
    typicalSalary: "12 000–25 000 грн/міс",
    typicalKvedCodes: ["52.24"],
    audience: "business",
    tags: ["вантажник", "склад"],
    faq: COMMON_FAQ,
  },
  {
    id: "9621",
    code: "9621",
    slug: "kurier",
    name: "Кур'єр",
    section: "9",
    description: "Доставка кореспонденції, документів, посилок одержувачам.",
    requiredEducation: "Не потребує спеціальної освіти.",
    typicalSalary: "12 000–30 000 грн/міс",
    typicalKvedCodes: ["53.20", "82.99"],
    audience: "business",
    tags: ["кур'єр", "доставка"],
    faq: COMMON_FAQ,
  },
];

export function getProfesiaBySlug(slug: string): ProfesiaEntry | undefined {
  return PROFESII.find((e) => e.slug === slug);
}

export function getProfesiaByCode(code: string): ProfesiaEntry | undefined {
  return PROFESII.find((e) => e.code === code);
}
