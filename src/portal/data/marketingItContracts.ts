// Юридичні шаблони для IT та маркетингу
// Підготовлено на основі ЦКУ, ГКУ, ЗУ «Про авторське право і суміжні права» № 3792-XII (ред. 2022),
// ЗУ «Про захист персональних даних», практики IT Ukraine Association
export const CONTRACTS_AS_OF = "2026-01-15";

export type ContractCategory =
  | "ip"           // інтелектуальна власність
  | "services"     // надання послуг
  | "confidential" // NDA, поліцейські
  | "saas"         // SaaS-договори
  | "marketing"    // маркетингові
  | "team";        // підрядники / B2B

export const CONTRACT_CATEGORY_LABEL: Record<ContractCategory, string> = {
  ip: "Інтелектуальна власність",
  services: "Послуги / роботи",
  confidential: "NDA / конфіденційність",
  saas: "SaaS / ліцензії",
  marketing: "Маркетинг / реклама",
  team: "Підрядники / outstaff",
};

export interface ContractTemplate {
  id: string;
  name: string;
  category: ContractCategory;
  summary: string;
  whoNeeds: string;
  keyClauses: string[];
  laws: string[];
  riskWithout: string;
  estimateLawyerUah: number; // приблизна вартість підготовки юристом
  formats: string[]; // ["UA", "EN"]
  isNew?: boolean;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  // ─── IP ───
  {
    id: "nda-mutual",
    name: "NDA (взаємне нерозголошення)",
    category: "confidential",
    summary: "Двосторонній договір про конфіденційну інформацію між компанією і підрядником/партнером.",
    whoNeeds: "Будь-який проект до підписання MSA: переговори з клієнтом, спільна розробка, due diligence.",
    keyClauses: [
      "Визначення «конфіденційної інформації» (з винятками: публічна, легально отримана від 3-х осіб)",
      "Термін дії зобовʼязань (3–5 років після завершення)",
      "Виключення на «незалежний розвиток» (independent development carve-out)",
      "Юрисдикція: Україна (м. Київ) або англійське право для EN-версії",
      "Liquidated damages: фіксована сума за порушення (типово $10 000 – 50 000)",
    ],
    laws: ["ЦКУ ст. 505–508 (комерційна таємниця)", "ЗУ «Про захист від недобросовісної конкуренції»"],
    riskWithout: "Розкриття know-how, переманювання команди, втрата конкурентної переваги. Стягнути збитки без NDA — майже неможливо.",
    estimateLawyerUah: 3500,
    formats: ["UA", "EN"],
    isNew: false,
  },
  {
    id: "ip-assignment",
    name: "IP Assignment (передача прав інтелектуальної власності)",
    category: "ip",
    summary: "Підрядник передає замовнику всі майнові права на створений продукт (код, дизайн, контент).",
    whoNeeds: "Обовʼязково для всіх ФОП-розробників, дизайнерів, копірайтерів. Без цього код по дефолту належить виконавцю.",
    keyClauses: [
      "Передача саме майнових прав (ст. 440 ЦКУ) — без терміну та території",
      "Перелік об'єктів: код, дизайн, документація, тестові кейси, бренд-активи",
      "Винагорода вже включена у ціну послуг (роялті 0%)",
      "Гарантія від виконавця: робота не порушує прав третіх осіб (IP indemnity)",
      "Moral rights waiver — наскільки дозволено законом (особисті немайнові права)",
      "Перевід FOSS-компонентів окремим Schedule (з ліцензіями MIT/Apache/GPL)",
    ],
    laws: ["ЦКУ ст. 421–448 (авторське право)", "ЗУ № 3792-XII «Про авторське право»", "ЦКУ ст. 1107–1114 (договір про передачу прав)"],
    riskWithout: "Розробник може блокувати використання продукту, вимагати додаткові виплати або продати код конкурентам. Інвестори на due diligence відмовляють у вкладеннях.",
    estimateLawyerUah: 5500,
    formats: ["UA", "EN"],
    isNew: true,
  },
  {
    id: "wfh-agreement",
    name: "Work-for-Hire (заявка на доробку в межах послуг)",
    category: "ip",
    summary: "Statement of Work (SOW) до основного договору з фіксацією завдання, дедлайну, прийняття-передачі.",
    whoNeeds: "Будь-яке агентство/студія, що працює циклами по 1–3 місяці.",
    keyClauses: [
      "Конкретний обʼєм: список фіч, екранів, постів",
      "Критерії приймання (Definition of Done)",
      "Терміни та milestone-оплати (30/40/30)",
      "Зміна скопу — Change Request з додатковою оплатою",
      "Передача прав з моменту повної оплати",
    ],
    laws: ["ЦКУ ст. 837 (договір підряду)", "ст. 901–907 (надання послуг)"],
    riskWithout: "Безкінечні правки, спори про «що було в скопі», застрягання проекту на 80%.",
    estimateLawyerUah: 2500,
    formats: ["UA", "EN"],
  },

  // ─── Послуги ───
  {
    id: "msa-it",
    name: "MSA (Master Service Agreement) — IT",
    category: "services",
    summary: "Рамковий договір для постійної співпраці: загальні правила, до яких приєднуються конкретні SOW.",
    whoNeeds: "Outstaff/outsource-команди, агентства з 2+ клієнтами на місяць.",
    keyClauses: [
      "Структура: MSA + SOW + DPA (для GDPR) + NDA",
      "Платежі: NET-15/30, штрафи за прострочку (0.1%/день)",
      "Гарантії якості (warranty 30–90 днів після здачі)",
      "Limitation of liability (зазвичай — сума оплати за останні 3-12 міс.)",
      "Termination for convenience (з 30-денним повідомленням)",
      "Non-solicitation (не переманювати співробітників 12-24 міс.)",
    ],
    laws: ["ЦКУ ст. 901", "Інкотермс 2020 (для крос-бордерних)", "ст. 627 ЦКУ (свобода договору)"],
    riskWithout: "Кожен новий проект з 0, неузгоджена відповідальність, юристи на 2-х сторонах сперечаються по 2 тижні.",
    estimateLawyerUah: 8500,
    formats: ["UA", "EN"],
    isNew: true,
  },
  {
    id: "outstaff-agreement",
    name: "Outstaff / Dedicated Team Agreement",
    category: "team",
    summary: "Договір на оренду команди розробників із заміною ролей, погодинною оплатою, KPI.",
    whoNeeds: "Сервісні IT-компанії, що працюють Time & Materials.",
    keyClauses: [
      "Перелік ролей з seniority, ставкою/годину, мін.bandwidth (160 год./міс)",
      "Заміна спеціаліста (notice 14-30 днів, ramp-up до 2 тижнів безоплатно)",
      "Тайм-трекінг (Hubstaff/Toggl) та валідація таймшитів до 5-го числа",
      "Equipment: хто надає (компанія — за замовчуванням)",
      "VPN, security baseline, обовʼязковий 2FA",
    ],
    laws: ["ЦКУ ст. 901–907", "Гл. 23 ПКУ (оподаткування ФОП-резидентів)"],
    riskWithout: "Спори про оплачені/неоплачені години, переманювання інженерів клієнтом без компенсації.",
    estimateLawyerUah: 6500,
    formats: ["UA", "EN"],
  },
  {
    id: "fop-services",
    name: "Договір з ФОП на надання послуг",
    category: "services",
    summary: "Стандартний договір для роботи з ФОП 3 групи: чітка фіксація послуг ≠ трудовим відносинам.",
    whoNeeds: "Будь-яка компанія, що працює з ФОП-розробниками, дизайнерами, маркетологами.",
    keyClauses: [
      "Чітко: «послуги», а не «робота», без графіка та підпорядкування",
      "Винагорода: фіксована за послугу або погодинна за актом",
      "Без оплачуваних відпусток, лікарняних — ризик переоформлення у трудові",
      "Самостійне обладнання та робоче місце виконавця",
      "Підписання актів щомісяця через електронний підпис",
      "ФОП самостійно сплачує всі податки (5% ЄП + ЄСВ)",
    ],
    laws: ["ЦКУ ст. 901", "Постанова КМУ № 197 від 27.06.2018 (про ознаки трудових відносин)", "ПКУ ст. 291–299 (єдиний податок)"],
    riskWithout: "Держпраці перекваліфіковує у трудові: штраф 30 МЗП за кожного «прихованого» працівника + донарахування ПДФО/ЄСВ за 3 роки.",
    estimateLawyerUah: 3500,
    formats: ["UA"],
  },

  // ─── SaaS ───
  {
    id: "saas-tos",
    name: "SaaS Terms of Service (Користувацька угода)",
    category: "saas",
    summary: "Публічна оферта для веб-сервісу: акцепт через галочку, тарифи, повернення коштів, відповідальність.",
    whoNeeds: "Будь-який SaaS, мобільний застосунок з оплатою, маркетплейс.",
    keyClauses: [
      "Click-wrap акцепт (галочка + Sign Up)",
      "Підписка: автопоновлення, відмова, пропорційне повернення",
      "Acceptable Use Policy: заборона abuse, спаму, scraping",
      "SLA (зазвичай 99.5% uptime), service credits за простій",
      "Юрисдикція + споживчі права (для UA — ЗУ «Про захист прав споживачів»)",
      "GDPR / Privacy Policy окремим документом",
    ],
    laws: ["ЦКУ ст. 633–635 (публічна оферта)", "ЗУ «Про електронну комерцію»", "GDPR Art. 13–14"],
    riskWithout: "Користувачі можуть оскаржити списання, повернути всі платежі за 3 роки, заблокувати домен на скарги.",
    estimateLawyerUah: 12000,
    formats: ["UA", "EN"],
    isNew: true,
  },
  {
    id: "privacy-policy",
    name: "Privacy Policy + Cookie Banner",
    category: "saas",
    summary: "Політика конфіденційності з UA-законом + GDPR (для EU-користувачів) + cookie consent.",
    whoNeeds: "Усі сайти зі збором email, форм, аналітикою (GA, Meta Pixel).",
    keyClauses: [
      "Перелік даних, мета обробки, правова підстава (consent / contract / legitimate interest)",
      "Список процесорів (Mailchimp, Stripe, Google) із посиланнями на їх policies",
      "Права субʼєкта: доступ, виправлення, видалення (right to be forgotten)",
      "Cookie banner з диференціацією: necessary / analytics / marketing",
      "Контакти DPO (для GDPR — обовʼязково за певних умов)",
      "Trans-border transfers + Standard Contractual Clauses",
    ],
    laws: ["ЗУ № 2297-VI «Про захист персональних даних»", "GDPR (Regulation 2016/679)", "ePrivacy Directive (для cookies)"],
    riskWithout: "Штрафи від Уповноваженого ВРУ (10 000–34 000 ₴ за порушення), GDPR — до 20 млн € або 4% обороту.",
    estimateLawyerUah: 9500,
    formats: ["UA", "EN"],
  },
  {
    id: "dpa",
    name: "DPA (Data Processing Agreement)",
    category: "saas",
    summary: "Договір між контролером і процесором персональних даних — обовʼязкова частина GDPR.",
    whoNeeds: "Якщо ви обробляєте дані клієнтів від їх імені (CRM, email-сервіси, хмарні бекапи).",
    keyClauses: [
      "Перелік категорій даних і субʼєктів",
      "Технічні і організаційні заходи (шифрування at-rest/in-transit, MFA, аудит-логи)",
      "Subprocessors list + право клієнта на заперечення",
      "Breach notification у 72 години",
      "Audit rights клієнта (1× на рік або на письмовий запит)",
      "Видалення/повернення даних при припиненні договору",
    ],
    laws: ["GDPR Art. 28", "ЗУ № 2297-VI"],
    riskWithout: "Клієнти-нерезиденти не зможуть з вами працювати — GDPR забороняє передачу даних без DPA.",
    estimateLawyerUah: 6500,
    formats: ["UA", "EN"],
    isNew: true,
  },

  // ─── Маркетинг ───
  {
    id: "influencer-agreement",
    name: "Договір з інфлюенсером",
    category: "marketing",
    summary: "Договір на рекламну інтеграцію з блогером: формат, дедлайн, KPI, ексклюзивність.",
    whoNeeds: "Бренди, що замовляють пости/рілси/сторіс у блогерів.",
    keyClauses: [
      "Формат контенту: тип (пост/reels/story), кількість, дата виходу",
      "Узгодження тексту і візуалу до публікації (review window 48 год)",
      "Disclosure: тег #реклама або #ad (обовʼязково за ЗУ «Про рекламу»)",
      "Ексклюзивність на категорію (наприклад, не публікувати конкурентів 30 днів)",
      "Архівне зберігання у профілі мін. 12 місяців",
      "Метрики звіту (impressions, reach, engagement) із посиланням на скріни insights",
    ],
    laws: ["ЗУ № 270/96-ВР «Про рекламу» (ст. 9 — обовʼязкове маркування)", "ЦКУ ст. 901"],
    riskWithout: "Блогер видалить пост через тиждень, поскандалить, не покаже статистику.",
    estimateLawyerUah: 4500,
    formats: ["UA"],
  },
  {
    id: "ppc-management",
    name: "Договір на ведення PPC-реклами",
    category: "marketing",
    summary: "Договір з агенцією/фрилансером на налаштування і оптимізацію Google/Meta Ads.",
    whoNeeds: "Малий-середній бізнес, що віддає рекламу на аутсорс.",
    keyClauses: [
      "Структура оплати: managament fee (% від бюджету або фікс) + бюджет окремо",
      "Доступи: рекламний акаунт залишається у клієнта (Manager Account / Business Manager)",
      "KPI: CPL/ROAS/CPA — як baseline, не як гарантія",
      "Звітність: щотижневі дашборди Looker Studio + щомісячний strategic review",
      "Передача матеріалів і доступів при припиненні — у 5 робочих днів",
    ],
    laws: ["ЦКУ ст. 901", "ЗУ «Про рекламу»"],
    riskWithout: "Агенція може забрати акаунт собі, видалити структуру кампаній, тримати «у заручниках» креативи.",
    estimateLawyerUah: 3500,
    formats: ["UA"],
  },
  {
    id: "content-license",
    name: "Договір на ліцензування контенту (фото/відео/музика)",
    category: "ip",
    summary: "Виключна або невиключна ліцензія на використання творів у маркетингу.",
    whoNeeds: "Бренди, що замовляють зйомки, музичні треки, ілюстрації для кампаній.",
    keyClauses: [
      "Тип ліцензії: виключна / невиключна / single-use",
      "Територія (Україна / світ) і термін (1 рік / безстроково)",
      "Канали: digital / OOH / TV / print — з різними коефіцієнтами",
      "Model release (для фото з людьми) — окремо",
      "Гарантія від ліцензіара: твір оригінальний, права на музику/семпли очищені",
    ],
    laws: ["ЦКУ ст. 1108 (ліцензійний договір)", "ЗУ № 3792-XII"],
    riskWithout: "Стоковий саунд із сірих джерел → claim на YouTube, видалення відео з Facebook, позов від правовласника (від $500 за фото).",
    estimateLawyerUah: 4500,
    formats: ["UA", "EN"],
  },
];

// Структура комплектів (часто закуповують пакетами)
export interface ContractBundle {
  id: string;
  name: string;
  templates: string[];
  priceUah: number;
  whoFor: string;
}

export const CONTRACT_BUNDLES: ContractBundle[] = [
  {
    id: "startup-pack",
    name: "Стартовий пак для IT-стартапу",
    templates: ["nda-mutual", "ip-assignment", "fop-services", "saas-tos", "privacy-policy"],
    priceUah: 28000,
    whoFor: "Засновники, які запускають MVP і наймають перших підрядників.",
  },
  {
    id: "agency-pack",
    name: "Пак для агенції/студії",
    templates: ["msa-it", "wfh-agreement", "outstaff-agreement", "nda-mutual", "fop-services"],
    priceUah: 22000,
    whoFor: "Сервісні IT-компанії з 5+ клієнтами та 10+ підрядниками.",
  },
  {
    id: "saas-pack",
    name: "Compliance-пак для SaaS",
    templates: ["saas-tos", "privacy-policy", "dpa", "nda-mutual"],
    priceUah: 32000,
    whoFor: "Готовність до клієнтів з ЄС/США, очікувані SOC2/ISO27001.",
  },
  {
    id: "marketing-pack",
    name: "Маркетинговий пак",
    templates: ["influencer-agreement", "ppc-management", "content-license", "fop-services"],
    priceUah: 14000,
    whoFor: "Брендам зі своїм маркетинг-відділом і регулярними інтеграціями.",
  },
];
