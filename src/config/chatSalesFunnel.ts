// ── Sales Funnel Configuration for Landing Chat Bot ──
import { mockConsultations, type MockConsultation } from "@/config/consultationMockData";
import { TAX_RATES, EP_FIXED, FOP_INCOME_LIMITS, ESV_MONTHLY, ESV_QUARTERLY, MINIMUM_WAGE, CURRENT_TAX_YEAR, FOP_LIMIT_MULTIPLIERS, formatTaxCurrency } from "@/config/taxConstantsConfig";
import { individualPlans, plans as businessPlans } from "@/config/pricingData";


// ── Dynamic tax rate helpers (single source of truth: taxConstantsConfig.ts) ──
const VZ_RATE = TAX_RATES.militaryTax * 100;           // 5
const PIT_RATE = TAX_RATES.personalIncomeTax * 100;     // 18
const TOTAL_RATE = PIT_RATE + VZ_RATE;                  // 23

export type UserType = "fop" | "tov" | "accountant" | "individual" | null;
export type FopGroup = 1 | 2 | 3 | null;
export type FunnelStage = "greeting" | "qualifying" | "qualifying_2" | "qualifying_3" | "qualifying_4" | "pain_discovery" | "consulting" | "value_add" | "conversion" | "pricing_calc" | "check_declaration";

export interface UserProfile {
  type: UserType;
  fopGroup: FopGroup;
  hasAccountant: boolean | null;
  employeeCount: string | null;
  individualType: string | null;
  email: string | null;
  vatPayer: boolean | null;
  hasEmployees: boolean | null;
  painPoint: string | null;
  taxSystem: string | null;
  clientCount: string | null;
  source?: "direct" | "curious" | "comparing";
}

export const emptyProfile: UserProfile = {
  type: null,
  fopGroup: null,
  hasAccountant: null,
  employeeCount: null,
  individualType: null,
  email: null,
  vatPayer: null,
  hasEmployees: null,
  painPoint: null,
  taxSystem: null,
  clientCount: null,
};

export interface ChatAction {
  label: string;
  icon: string;
  type: "reminder" | "check_fop" | "send_email" | "calculate" | "register" | "consult" | "check_declaration";
  requiresEmail?: boolean;
}

export interface FunnelNode {
  aiText: string;
  quickReplies?: string[];
  actions?: ChatAction[];
  nextStage: FunnelStage;
  profileUpdate?: Partial<UserProfile>;
  inputType?: "email" | "number";
}

// ── Greeting messages by audience ──

export const GREETING_BUSINESS: FunnelNode = {
  aiText: "Привіт! 👋 Я AI-бухгалтер FINTODO. Розкажіть — ви ФОП, директор ТОВ чи бухгалтер? Допоможу з податками, звітами або підключенням банку.",
  quickReplies: ["Я ФОП", "Я директор ТОВ", "Я бухгалтер", "Просто цікавлюсь"],
  nextStage: "qualifying",
};

export const GREETING_INDIVIDUAL: FunnelNode = {
  aiText: "Привіт! 👋 Я AI-консультант FINTODO. Маєте інвестиції, здаєте нерухомість, працюєте на фрілансі чи маєте питання щодо продажу майна або спадщини? Розкажу, як оптимізувати податки.",
  quickReplies: ["Маю інвестиції", "Здаю квартиру", "Фріланс", "Продаж / спадщина / інше", "Просто цікавлюсь"],
  nextStage: "qualifying",
};

// ── Qualifying step responses ──

export const QUALIFYING_RESPONSES: Record<string, FunnelNode> = {
  // ─ Business ─
  "Я ФОП": {
    aiText: "Чудово! На якій ви групі спрощеної системи оподаткування?",
    quickReplies: ["1 група", "2 група", "3 група", "Не знаю"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "fop" },
  },
  "Я директор ТОВ": {
    aiText: "Зрозуміло! Скільки працівників у вашому ТОВ?",
    quickReplies: ["1–5", "5–20", "20+"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "tov" },
  },
  "Я бухгалтер": {
    aiText: "Радий бачити колегу! 😊 Скільки клієнтів ви обслуговуєте?",
    quickReplies: ["1–3", "4–10", "10+"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "accountant" },
  },
  "Просто цікавлюсь": {
    aiText: "Чудово, що зацікавились! FINTODO автоматизує бухгалтерію та податки. Покажу, як це працює на вашому прикладі — оберіть найближчий сценарій:",
    quickReplies: [
      "Я ФОП — хочу зрозуміти, чи потрібен сервіс",
      "Маю ТОВ — шукаю альтернативу бухгалтеру",
      "Я фізособа з доходами",
      "Просто порівнюю сервіси"
    ],
    nextStage: "qualifying",
    profileUpdate: { type: null, source: "curious" },
  },
  "Я ФОП — хочу зрозуміти, чи потрібен сервіс": {
    aiText: "Чудово! На якій ви групі спрощеної системи оподаткування?",
    quickReplies: ["1 група", "2 група", "3 група", "Не знаю"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "fop", source: "curious" },
  },
  "Маю ТОВ — шукаю альтернативу бухгалтеру": {
    aiText: "Зрозуміло! Скільки працівників у вашому ТОВ?",
    quickReplies: ["1–5", "5–20", "20+"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "tov", source: "curious" },
  },
  "Я фізособа з доходами": {
    aiText: "Що саме вас цікавить?",
    quickReplies: ["Маю інвестиції", "Здаю квартиру", "Фріланс", "Продаж / спадщина / інше"],
    nextStage: "qualifying",
    profileUpdate: { type: "individual", source: "curious" },
  },
  "Просто порівнюю сервіси": {
    aiText: "Розумію! Ось чим FINTODO відрізняється:\n\n" +
      "✅ **AI замість шаблонів** — не просто формує звіти, а перевіряє на помилки та пропонує оптимізацію\n" +
      "✅ **Банк підключається за 2 хв** — виписки імпортуються автоматично\n" +
      "✅ **Податковий календар** — нагадування за 7 і 3 дні до дедлайну\n" +
      "✅ **Безкоштовний «Старт»**, Смарт від 399 грн/міс — у 10 разів дешевше за бухгалтера\n\n" +
      "Хочете побачити конкретніше?",
    quickReplies: [
      "Покажіть ціни",
      "Я ФОП",
      "Я директор ТОВ",
      "Спробувати безкоштовно"
    ],
    nextStage: "consulting",
    profileUpdate: { type: null, source: "comparing" },
  },
  "Просто цікавлюсь::individual": {
    aiText: "Чудово, що зацікавились! FINTODO допомагає фізичним особам правильно декларувати доходи та оптимізувати податки. Оберіть найближчий сценарій:",
    quickReplies: [
      "Маю інвестиції",
      "Здаю квартиру",
      "Фріланс",
      "Продаж / спадщина / інше",
      "Просто порівнюю сервіси"
    ],
    nextStage: "qualifying",
    profileUpdate: { type: "individual", source: "curious" },
  },
  "Просто порівнюю сервіси::individual": {
    aiText: "Розумію! Ось чим FINTODO відрізняється для фізичних осіб:\n\n" +
      "✅ **Автоматичний імпорт** — звіти з брокерів та бірж завантажуються за 2 хв\n" +
      "✅ **Розрахунок ПДФО та ВЗ** — AI перевіряє на помилки\n" +
      "✅ **Декларація за 3 хв** — формується автоматично з усіма додатками\n" +
      "✅ **Від 149 грн/міс** — дешевше за одну консультацію з бухгалтером\n\n" +
      "Хочете побачити конкретніше?",
    quickReplies: [
      "Покажіть ціни",
      "Маю інвестиції",
      "Здаю квартиру",
      "Спробувати безкоштовно"
    ],
    nextStage: "consulting",
    profileUpdate: { type: "individual", source: "comparing" },
  },
  // "Покажіть ціни" — handled dynamically via getPricingNode(profile) in ConsultationChat.tsx
  "Спробувати безкоштовно": {
    aiText: "Чудово! 🚀 Створіть акаунт за 30 секунд — **безкоштовний тариф «Старт»** (300 кр./міс, без картки) доступний одразу.\n\nПісля реєстрації ви зможете підключити банк, сформувати першу декларацію та побачити, як FINTODO автоматизує вашу бухгалтерію.",
    quickReplies: [],
    nextStage: "conversion",
    profileUpdate: {},
  },

  // ─ Individual ─
  "Маю інвестиції": {
    aiText: "Чудово! Які саме інвестиції у вас є?",
    quickReplies: ["Акції (IBKR, Freedom)", "Криптовалюта", "ОВДП / облігації"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "individual", individualType: "investor" },
  },
  "Здаю квартиру": {
    aiText: "Зрозуміло! Ви декларуєте дохід від оренди як фізособа чи через ФОП?",
    quickReplies: ["Як фізособа", "Через ФОП", "Не знаю різниці"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "individual", individualType: "landlord" },
  },
  "Фріланс": {
    aiText: "Ви працюєте з іноземними замовниками чи українськими?",
    quickReplies: ["Іноземні (Upwork, Fiverr)", "Українські", "Обидва"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "individual", individualType: "freelancer" },
  },
  "Інше": {
    aiText: "Розкажіть, що саме вас цікавить — я підберу найкращу відповідь.",
    quickReplies: ["Продаж нерухомості", "Податкова знижка", "Іноземний дохід"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "individual" },
  },
  "Продаж / спадщина / інше": {
    aiText: "Зрозуміло! Що саме вас цікавить?",
    quickReplies: ["Продаж нерухомості", "Продаж авто", "Спадщина / дарування", "Іноземний дохід"],
    nextStage: "qualifying_2",
    profileUpdate: { type: "individual" },
  },
};

// ── Qualifying step 2 responses (context-specific) ──

export const QUALIFYING_2_RESPONSES: Record<string, FunnelNode> = {
  // FOP groups
  "1 група": {
    aiText: `ФОП 1 групи — це роздрібна торгівля та послуги тільки для фізосіб. Ліміт доходу — ${FOP_LIMIT_MULTIPLIERS.group1} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[1])} у ${CURRENT_TAX_YEAR}). ЄП фіксований — ${EP_FIXED.group1.toLocaleString('uk-UA')} грн/міс (${TAX_RATES.epGroup1 * 100}% МЗП — ${MINIMUM_WAGE.toLocaleString('uk-UA')} грн).\n\nМи автоматично контролюємо ліміт та попереджаємо при наближенні до 80%. Також формуємо платіжки на ЄП та ЄСВ.\n\nСпробуйте безкоштовно — контроль ліміту та платіжки формуються автоматично.`,
    nextStage: "qualifying_3",
    profileUpdate: { fopGroup: 1 },
  },
  "2 група": {
    aiText: `ФОП 2 групи — послуги та торгівля для ФОП і юросіб. Ліміт — ${FOP_LIMIT_MULTIPLIERS.group2} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[2])}). ЄП фіксований — ${EP_FIXED.group2.toLocaleString('uk-UA')} грн/міс (${TAX_RATES.epGroup2 * 100}% МЗП). ЄСВ — мінімум ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс.\n\nМи автоматично формуємо платіжки на ЄП і ЄСВ та нагадуємо про дедлайни подачі декларації.\n\nСпробуйте безкоштовно — платіжки та декларація за 3 хвилини.`,
    nextStage: "qualifying_3",
    profileUpdate: { fopGroup: 2 },
  },
  "3 група": {
    aiText: `ФОП 3 групи — найпопулярніша група. Ліміт доходу — ${FOP_LIMIT_MULTIPLIERS.group3} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[3])} у ${CURRENT_TAX_YEAR}). Ставка ЄП — ${TAX_RATES.epGroup3_withoutVat * 100}% від доходу або ${TAX_RATES.epGroup3_withVat * 100}%+ПДВ.\n\nМи автоматично розраховуємо ЄП з кожної транзакції, контролюємо ліміт (попередження на 80%) та формуємо квартальну декларацію за 3 хвилини.\n\nСпробуйте безкоштовно — автоматичний ЄП з кожної транзакції.`,
    nextStage: "qualifying_3",
    profileUpdate: { fopGroup: 3 },
  },
  "Не знаю": {
    aiText: `Не хвилюйтесь! Коротко:\n\n• **1 група** — дохід до ${formatTaxCurrency(FOP_INCOME_LIMITS[1])}, тільки фізособи-клієнти, фіксований ЄП ${EP_FIXED.group1.toLocaleString('uk-UA')} грн/міс\n• **2 група** — дохід до ${formatTaxCurrency(FOP_INCOME_LIMITS[2])}, послуги/торгівля для бізнесу, ЄП ${EP_FIXED.group2.toLocaleString('uk-UA')} грн/міс\n• **3 група** — дохід до ${formatTaxCurrency(FOP_INCOME_LIMITS[3])}, будь-яка діяльність, ЄП ${TAX_RATES.epGroup3_withoutVat * 100}% від доходу\n\nЯкщо скажете, чим займаєтесь — допоможу визначити оптимальну групу!`,
    quickReplies: ["1 група", "2 група", "3 група"],
    nextStage: "qualifying_2",
  },

  // TOV
  "1–5": {
    aiText: "Компактна команда! Для ТОВ з 1–5 працівниками FINTODO покриває повний цикл: зарплатні звіти (1-ДФ, ЄСВ Д4), бухоблік, банківські виписки та податкові декларації.\n\nТариф «Смарт» — 399 грн/міс — дешевше за годину роботи бухгалтера, а автоматизує 80% рутини. Почніть на безкоштовному «Старті» — або спробуйте Смарт 14 днів без оплати.",
    nextStage: "qualifying_3",
    profileUpdate: { employeeCount: "1-5", hasEmployees: true },
  },
  "5–20": {
    aiText: "Середня команда — саме тут автоматизація дає максимальну віддачу! Зарплатна звітність, відпускні, лікарняні, аванси — все формується автоматично.\n\nТариф «Смарт» (399 грн/міс) замінює штатного бухгалтера з зарплатою 15 000+ грн. Почніть на безкоштовному «Старті» — або спробуйте Смарт 14 днів без оплати.",
    nextStage: "qualifying_3",
    profileUpdate: { employeeCount: "5-20", hasEmployees: true },
  },
  "20+": {
    aiText: "Для великих команд 20+ пропонуємо тариф «Преміум» — 799 грн/міс: виділений менеджер, кастомні інтеграції (1С, SAP, Power BI), SLA 4 години та необмежена кількість користувачів.\n\nДавайте організуємо демо-дзвінок? Почніть на безкоштовному «Старті» — або спробуйте Смарт 14 днів без оплати.",
    nextStage: "qualifying_3",
    profileUpdate: { employeeCount: "20+", hasEmployees: true },
  },

  // Accountant
  "1–3": {
    aiText: "Для невеликої практики FINTODO — ідеальний асистент. Мультикабінет дозволяє вести 3 клієнтів в одному вікні, перемикатися між ними та формувати звіти в один клік.\n\nТариф «Смарт» — 399 грн/міс за необмежену кількість ФОП-клієнтів. Почніть на безкоштовному «Старті» — або спробуйте Смарт 14 днів без оплати.",
    nextStage: "pain_discovery",
    profileUpdate: { clientCount: "1–3" },
  },
  "4–10": {
    aiText: "10 клієнтів — це вже серйозна практика! Мультикабінет FINTODO дає: єдину панель по всіх клієнтах, масове формування декларацій, автоматичний контроль дедлайнів та спільний податковий календар.\n\nТариф «Преміум» — 799 грн/міс. Окупається за 2 години зекономленого часу. Почніть на безкоштовному «Старті» — або спробуйте Смарт 14 днів без оплати.",
    nextStage: "pain_discovery",
    profileUpdate: { clientCount: "4–10" },
  },
  "10+": {
    aiText: "10+ клієнтів — ви серйозний гравець! 💪 Для великих бухгалтерських практик є «Преміум»: мульти-кабінет, API для масових операцій, пріоритетна підтримка.\n\nДавайте організуємо персональну демонстрацію? Почніть на безкоштовному «Старті» — або спробуйте Смарт 14 днів без оплати.",
    nextStage: "pain_discovery",
    profileUpdate: { clientCount: "10+" },
  },

  // Individual — investments
  "Акції (IBKR, Freedom)": {
    aiText: `Прибуток від акцій оподатковується ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}%. Ми автоматично імпортуємо звіти з Interactive Brokers, Freedom Finance та Exante, розраховуємо прибуток за методом FIFO та формуємо додаток ІП до декларації.\n\nНаприклад, при прибутку $3 000 (124 500 грн) податок складе ~${Math.round(124500 * (TAX_RATES.personalIncomeTax + TAX_RATES.militaryTax)).toLocaleString('uk-UA')} грн.\n\nСпробуйте безкоштовно — імпортуємо ваш звіт з брокера за 2 хвилини.`,
    nextStage: "pain_discovery",
  },
  "Криптовалюта": {
    aiText: `Крипто-прибуток в Україні оподатковується як інвестиційний дохід: ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}%. Ми імпортуємо транзакції з Binance, Bybit, Kraken та інших бірж, розраховуємо прибуток по кожній операції та формуємо декларацію.\n\nВажливо: зберігайте історію транзакцій — ДПС може запросити підтвердження.\n\nСпробуйте безкоштовно — підключіть біржу та розрахуйте податок.`,
    nextStage: "pain_discovery",
  },
  "ОВДП / облігації": {
    aiText: `Дохід від ОВДП звільнений від ПДФО та ВЗ — це одна з небагатьох пільг для фізосіб. Але купонний дохід від корпоративних облігацій оподатковується стандартно (${PIT_RATE}% + ${VZ_RATE}%).\n\nFINTODO автоматично розділяє ці типи та формує правильну декларацію.\n\nСпробуйте безкоштовно — автоматичне розділення пільгових та оподатковуваних доходів.`,
    nextStage: "pain_discovery",
  },

  // Individual — rent
  "Як фізособа": {
    aiText: `Якщо здаєте квартиру як фізособа, ставка ПДФО — ${PIT_RATE}% + ВЗ ${VZ_RATE}% від суми оренди. Платити потрібно щоквартально до 40-го дня після кварталу.\n\nНаприклад, оренда 15 000 грн/міс → податок ${Math.round(15000 * (TAX_RATES.personalIncomeTax + TAX_RATES.militaryTax)).toLocaleString('uk-UA')} грн/міс (${Math.round(15000 * (TAX_RATES.personalIncomeTax + TAX_RATES.militaryTax) * 3).toLocaleString('uk-UA')} грн/квартал). Ми нагадуємо про дедлайни та формуємо платіжки.\n\nСпробуйте безкоштовно — нагадування про дедлайни та готові платіжки.`,
    nextStage: "pain_discovery",
  },
  "Через ФОП": {
    aiText: `Здавання нерухомості через ФОП 2 або 3 групи часто вигідніше: ЄП 5% замість ${TOTAL_RATE}% ПДФО+ВЗ. При оренді 15 000 грн/міс економія — ${Math.round(15000 * (TAX_RATES.personalIncomeTax + TAX_RATES.militaryTax) - 15000 * TAX_RATES.epGroup3_withoutVat).toLocaleString('uk-UA')} грн/міс!\n\nАле є нюанси: потрібен КВЕД 68.20, і не всю нерухомість можна здавати через ФОП. Хочете, розрахую для вашого випадку?`,
    nextStage: "pain_discovery",
  },
  "Не знаю різниці": {
    aiText: `Коротко: як фізособа — податок ${TOTAL_RATE}% (ПДФО + ВЗ), через ФОП — податок 5% (ЄП 3 група).\n\nПри оренді 15 000 грн/міс різниця — ${Math.round(15000 * (TAX_RATES.personalIncomeTax + TAX_RATES.militaryTax) - 15000 * TAX_RATES.epGroup3_withoutVat).toLocaleString('uk-UA')} грн/міс на користь ФОП. Хочете детальне порівняння?`,
    nextStage: "pain_discovery",
  },

  // Individual — freelance
  "Іноземні (Upwork, Fiverr)": {
    aiText: `Дохід з-за кордону оподатковується ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}%. Курс — за НБУ на дату зарахування. Якщо ви оформлені як ФОП 3 групи — ставка лише 5%!\n\nМи автоматично конвертуємо валюту, формуємо книгу доходів та декларацію. Імпорт виписок з Payoneer та Wise — автоматичний.\n\nСпробуйте безкоштовно — імпорт Payoneer та Wise за 2 хвилини.`,
    nextStage: "pain_discovery",
  },
  "Українські": {
    aiText: "Якщо працюєте з українськими замовниками як фізособа — замовник утримує ПДФО та ВЗ при виплаті (якщо він юрособа). Якщо як ФОП — платите ЄП самостійно.\n\nFINTODO допоможе контролювати доходи, формувати акти та вчасно подавати звітність.\n\nСпробуйте безкоштовно — контроль доходів та акти формуються автоматично.",
    nextStage: "pain_discovery",
  },
  "Обидва": {
    aiText: "Змішаний дохід — найскладніший для декларування, але FINTODO справляється! Ми розділяємо гривневі та валютні надходження, конвертуємо за курсом НБУ, і формуємо єдину декларацію з усіма додатками.\n\nОсобливо зручно для ФОП 3 групи — один звіт покриває всі джерела доходу.\n\nСпробуйте безкоштовно — єдина декларація з усіх джерел за 3 хвилини.",
    nextStage: "pain_discovery",
  },

  // Individual — other
  "Продаж нерухомості": {
    aiText: `Перший продаж нерухомості за рік — без ПДФО (якщо у власності 3+ роки). Другий і наступні — ПДФО 5% + ВЗ ${VZ_RATE}%.\n\nFINTODO допоможе визначити, чи підпадає ваш продаж під пільгу, та сформує декларацію якщо потрібно.\n\nСпробуйте безкоштовно — AI визначить вашу пільгу та сформує декларацію.`,
    nextStage: "pain_discovery",
  },
  "Продаж авто": {
    aiText: `Перший продаж авто за рік — без ПДФО (якщо у власності 3+ роки). Другий і наступні — ПДФО ${TAX_RATES.personalIncomeTax * 100}% + ВЗ ${TAX_RATES.militaryTax * 100}%.\n\nНотаріус утримує податок при оформленні — додатково декларувати не потрібно (якщо пільга). Але якщо це другий продаж — подаєте декларацію до 1 травня.\n\nСпробуйте безкоштовно — AI визначить вашу пільгу та підкаже наступні кроки.`,
    nextStage: "pain_discovery",
  },
  "Спадщина / дарування": {
    aiText: `Від родичів 1 ступеня (батьки, діти, подружжя) — 0% податку. Від інших родичів — ПДФО 5% + ВЗ ${TAX_RATES.militaryTax * 100}%. Від не-родичів — ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}%.\n\nСпадщина оподатковується аналогічно. Декларацію подаєте до 1 травня наступного року.\n\nСпробуйте безкоштовно — AI розрахує ваш податок та сформує декларацію.`,
    nextStage: "pain_discovery",
  },
  "Податкова знижка": {
    aiText: "Фізособи можуть повернути частину ПДФО через податкову знижку: витрати на навчання, лікування, іпотеку, благодійність. Максимум — повернення усього утриманого ПДФО за рік.\n\nFINTODO збирає чеки та документи, розраховує суму повернення та формує декларацію для податкової знижки.\n\nСпробуйте безкоштовно — розрахуємо ваше максимальне повернення.",
    nextStage: "pain_discovery",
  },
  "Іноземний дохід": {
    aiText: `Будь-який дохід з-за кордону (зарплата, роялті, пенсія) оподатковується в Україні: ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}%. Якщо країна має договір про уникнення подвійного оподаткування — податок, сплачений там, зараховується.\n\nFINTODO автоматично перевіряє наявність договору та розраховує суму до сплати в Україні.\n\nСпробуйте безкоштовно — перевірка конвенцій та розрахунок за 1 хвилину.`,
    nextStage: "pain_discovery",
  },

  // FAQ fallback
  "Як підключити банк?": {
    aiText: "Підключення банку займає 2 хвилини. Ми підтримуємо Monobank, ПриватБанк та будь-який банк через API. Просто авторизуйтесь — і виписки імпортуються автоматично.",
    quickReplies: ["Скільки коштує?", "Як подати декларацію?"],
    nextStage: "value_add",
  },
  "Скільки коштує?": {
    aiText: `Найдоступніший тариф — «${businessPlans[0].name}» за ${businessPlans[0].price} грн/міс. Є безкоштовний «Старт» (300 кр./міс), а платні тарифи можна спробувати 14 днів без оплати.`,
    quickReplies: ["Як підключити банк?", "Як подати декларацію?"],
    nextStage: "value_add",
  },
  "Як подати декларацію?": {
    aiText: "AI автоматично збирає дані з ваших транзакцій, формує декларацію та перевіряє на помилки. Вам залишається лише підписати КЕП і надіслати — все в одному вікні.",
    nextStage: "value_add",
  },
};

// ── Qualifying step 3: VAT & employees ──

export const QUALIFYING_3_RESPONSES: Record<string, FunnelNode> = {
  // FOP 3 група — ПДВ
  "Так, 3% + ПДВ": {
    aiText: "Зрозуміло! ФОП 3 групи з ПДВ — ставка ЄП 3% + ПДВ 20%. Вигідно, якщо маєте великі витрати з ПДВ (можна формувати податковий кредит).\n\nFINTODO автоматично веде реєстр податкових накладних та формує декларацію з ПДВ.",
    nextStage: "qualifying_4",
    profileUpdate: { vatPayer: true },
  },
  "Ні, 5% без ПДВ": {
    aiText: "Добре! ФОП 3 групи без ПДВ — ставка ЄП 5% від доходу. Простіше адмініструвати, менше звітності. Оптимально для більшості ФОП.",
    nextStage: "qualifying_4",
    profileUpdate: { vatPayer: false },
  },
  "Не знаю різниці": {
    aiText: "Коротко:\n\n• **5% без ПДВ** — простіше, менше звітності, оптимально якщо витрати невеликі\n• **3% + ПДВ** — вигідно при великих витратах з ПДВ (товари, обладнання), бо можна формувати податковий кредит і зменшити ПДВ-зобов'язання\n\nБільшість ФОП обирають 5% без ПДВ. Яка у вас ставка?",
    quickReplies: ["Так, 3% + ПДВ", "Ні, 5% без ПДВ"],
    nextStage: "qualifying_3",
  },

  // TOV — система оподаткування
  "Загальна система": {
    aiText: "ТОВ на загальній системі — податок на прибуток 18% + ПДВ. Складніше в адмініструванні, але дає більше гнучкості при великих обсягах.\n\nFINTODO веде повний бухоблік та формує усю звітність автоматично.",
    nextStage: "qualifying_4",
    profileUpdate: { taxSystem: "general" },
  },
  "Спрощена (3 група)": {
    aiText: "ТОВ на спрощеній системі (3 група) — ЄП 5% або 3%+ПДВ. Простіше в обліку, менше звітності.\n\nFINTODO автоматизує облік для обох варіантів.",
    nextStage: "qualifying_4",
    profileUpdate: { taxSystem: "simplified" },
  },
  "Не знаю": {
    aiText: "Не проблема! Коротко:\n\n• **Загальна система** — податок на прибуток 18%, обов'язковий ПДВ, більше звітності\n• **Спрощена (3 група)** — ЄП 5% від доходу або 3%+ПДВ, менше звітності\n\nЯкщо не впевнені — найімовірніше, ваше ТОВ на загальній системі. Який у вас варіант?",
    quickReplies: ["Загальна система", "Спрощена (3 група)"],
    nextStage: "qualifying_3",
  },
};

// ── Qualifying step 4: VAT for TOV / Employees for FOP ──

export const QUALIFYING_4_RESPONSES: Record<string, FunnelNode> = {
  // TOV — ПДВ
  "Так, платник ПДВ": {
    aiText: "Зрозуміло! Для ТОВ-платника ПДВ FINTODO автоматично формує реєстр податкових накладних, звіряє з ЄРПН та подає декларацію з ПДВ щомісяця.",
    nextStage: "pain_discovery",
    profileUpdate: { vatPayer: true },
  },
  "Ні, не платник": {
    aiText: "Добре! Без ПДВ облік простіший. FINTODO веде всю звітність для вашого ТОВ автоматично.",
    nextStage: "pain_discovery",
    profileUpdate: { vatPayer: false },
  },
  "Плануємо реєструватися": {
    aiText: "Чудово! FINTODO допоможе з переходом на ПДВ — автоматично налаштує реєстр ПН та звітність з дати реєстрації.",
    nextStage: "pain_discovery",
    profileUpdate: { vatPayer: false },
  },

  // FOP — працівники
  "Так, маю працівників": {
    aiText: "Зрозуміло! Для ФОП з працівниками додається зарплатна звітність: 1-ДФ (щоквартально), ЄСВ Д4, розрахунок ПДФО та ВЗ.\n\nFINTODO автоматизує розрахунок зарплати, формує платіжки та звіти.",
    nextStage: "pain_discovery",
    profileUpdate: { hasEmployees: true },
  },
  "Ні, працюю сам": {
    aiText: "Добре! Без працівників звітність мінімальна — лише декларація ЄП та ЄСВ. FINTODO формує все автоматично.",
    nextStage: "pain_discovery",
    profileUpdate: { hasEmployees: false },
  },
  "Планую найняти": {
    aiText: "Коли будете готові — FINTODO одразу підключить зарплатний модуль: розрахунок зарплати, ПДФО, ЄСВ, формування 1-ДФ та ЄСВ Д4.",
    nextStage: "pain_discovery",
    profileUpdate: { hasEmployees: false },
  },
};

// ── Pain-point discovery ──

export const PAIN_POINT_RESPONSES: Record<string, FunnelNode> = {
  "Боюсь штрафів за помилки": {
    aiText: "Розумію! Штрафи за помилки в звітності — це серйозний ризик. FINTODO перевіряє кожен звіт перед подачею.",
    nextStage: "value_add",
    profileUpdate: { painPoint: "штрафи" } as Partial<UserProfile>,
  },
  "Забагато ручної роботи": {
    aiText: "Так, ручна робота з'їдає час! Покажу, як FINTODO це вирішує 👇",
    nextStage: "value_add",
    profileUpdate: { painPoint: "рутина" } as Partial<UserProfile>,
  },
  "Не встигаю за дедлайнами": {
    aiText: "Пропущені дедлайни — це штрафи та стрес. Ми нагадуємо за 7 і 3 дні до кожного дедлайну.",
    nextStage: "value_add",
    profileUpdate: { painPoint: "дедлайни" } as Partial<UserProfile>,
  },
  "Хочу зменшити витрати на бухгалтера": {
    aiText: "Зрозуміло! Бухгалтер коштує 3 000–5 000 грн/міс, тоді як FINTODO — від 0 ₴ (Старт), Смарт від 399 грн/міс.",
    nextStage: "value_add",
    profileUpdate: { painPoint: "витрати" } as Partial<UserProfile>,
  },
  "Хочу автоматизувати звітність": {
    aiText: "Вірний підхід! AI формує звіти за хвилини замість годин — і перевіряє на помилки перед подачею.",
    nextStage: "value_add",
    profileUpdate: { painPoint: "автоматизація" } as Partial<UserProfile>,
  },
  "Не знаю, чи потрібна декларація": {
    aiText: "Це часте питання! Давайте з'ясуємо за 30 секунд — я задам кілька простих питань.",
    nextStage: "check_declaration",
    profileUpdate: { painPoint: "невизначеність" } as Partial<UserProfile>,
  },
  "Боюсь помилитися в розрахунках": {
    aiText: "Розумію! Помилки в розрахунках — найчастіша причина штрафів. Давайте перевіримо вашу ситуацію.",
    nextStage: "value_add",
    profileUpdate: { painPoint: "помилки" } as Partial<UserProfile>,
  },
  "Забагато різних доходів": {
    aiText: "Декілька джерел доходу — це складніше, але FINTODO автоматично збирає все в одну декларацію.",
    nextStage: "value_add",
    profileUpdate: { painPoint: "складність" } as Partial<UserProfile>,
  },
  "Перейти до дій ➡️": {
    aiText: "",
    nextStage: "value_add",
  },
};

// ── Qualifying_3 question builders ──

export function getQualifying3Question(profile: UserProfile): FunnelNode {
  if (profile.type === "fop" && profile.fopGroup === 3) {
    return {
      aiText: "Ви платник ПДВ?",
      quickReplies: ["Так, 3% + ПДВ", "Ні, 5% без ПДВ", "Не знаю різниці"],
      nextStage: "qualifying_3",
    };
  }
  if (profile.type === "tov") {
    return {
      aiText: "Ваше ТОВ на якій системі оподаткування?",
      quickReplies: ["Загальна система", "Спрощена (3 група)", "Не знаю"],
      nextStage: "qualifying_3",
    };
  }
  // FOP 1, 2 — skip VAT, ask about employees
  if (profile.type === "fop") {
    return {
      aiText: "Маєте найманих працівників?",
      quickReplies: ["Так, маю працівників", "Ні, працюю сам", "Планую найняти"],
      nextStage: "qualifying_4",
    };
  }
  // Default — go to pain discovery
  return getPainDiscoveryQuestion(profile);
}

export function getQualifying4Question(profile: UserProfile): FunnelNode {
  if (profile.type === "tov") {
    return {
      aiText: "Чи є ваше ТОВ платником ПДВ?",
      quickReplies: ["Так, платник ПДВ", "Ні, не платник", "Плануємо реєструватися"],
      nextStage: "qualifying_4",
    };
  }
  // FOP 3 група after VAT — ask about employees
  if (profile.type === "fop") {
    return {
      aiText: "Маєте найманих працівників?",
      quickReplies: ["Так, маю працівників", "Ні, працюю сам", "Планую найняти"],
      nextStage: "qualifying_4",
    };
  }
  return getPainDiscoveryQuestion(profile);
}

export function getPainDiscoveryQuestion(profile?: UserProfile): FunnelNode {
  if (profile?.type === "individual") {
    return {
      aiText: "Що зараз найбільше турбує?",
      quickReplies: ["Не знаю, чи потрібна декларація", "Боюсь помилитися в розрахунках", "Забагато різних доходів", "Перейти до дій ➡️"],
      nextStage: "pain_discovery",
    };
  }
  if (profile?.type === "fop" && !profile?.hasEmployees) {
    return {
      aiText: "Що зараз найбільше турбує?",
      quickReplies: ["Боюсь штрафів за помилки", "Не встигаю за дедлайнами", "Хочу автоматизувати звітність", "Перейти до дій ➡️"],
      nextStage: "pain_discovery",
    };
  }
  return {
    aiText: "Що зараз найбільше турбує?",
    quickReplies: ["Боюсь штрафів за помилки", "Забагато ручної роботи", "Не встигаю за дедлайнами", "Хочу зменшити витрати на бухгалтера", "Перейти до дій ➡️"],
    nextStage: "pain_discovery",
  };
}

// ── Value-Add actions by user type ──

const FOP_ACTIONS: ChatAction[] = [
  { label: "Нагадати про дедлайн", icon: "Bell", type: "reminder", requiresEmail: true },
  { label: "Перевірити ФОП", icon: "Search", type: "check_fop" },
  { label: "Розрахувати податки", icon: "Calculator", type: "calculate" },
  { label: "Персональна консультація", icon: "MessageSquare", type: "consult" },
];

const TOV_ACTIONS: ChatAction[] = [
  { label: "Нагадати про дедлайн", icon: "Bell", type: "reminder", requiresEmail: true },
  { label: "Розрахувати зарплатні податки", icon: "Calculator", type: "calculate" },
  { label: "Персональна консультація", icon: "MessageSquare", type: "consult" },
];

const ACCOUNTANT_ACTIONS: ChatAction[] = [
  { label: "Спробувати мультикабінет", icon: "ArrowRight", type: "register" },
  { label: "Персональна консультація", icon: "MessageSquare", type: "consult" },
];

const INDIVIDUAL_ACTIONS: ChatAction[] = [
  { label: "Нагадати про декларацію", icon: "Bell", type: "reminder", requiresEmail: true },
  { label: "Чи потрібна декларація?", icon: "FileCheck", type: "check_declaration" },
  { label: "Розрахувати податок", icon: "Calculator", type: "calculate" },
  { label: "Персональна консультація", icon: "MessageSquare", type: "consult" },
];

// ── Personalized value_add based on full profile ──

function getLegislativeWarning(profile: UserProfile): string {
  if (profile.type === "fop" && profile.fopGroup === 3 && profile.vatPayer === true) {
    return "📋 Не забудьте: реєстр податкових накладних подається до 15 числа. FINTODO формує його автоматично.";
  }
  if (profile.type === "fop" && profile.fopGroup === 3 && profile.vatPayer === false) {
    return `📋 Поточний мінімальний ЄСВ — ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс (МЗП ${MINIMUM_WAGE.toLocaleString('uk-UA')} грн × ${TAX_RATES.esv * 100}%).`;
  }
  if (profile.type === "fop" && profile.hasEmployees === true) {
    return "📋 Звіт 1-ДФ подається щоквартально. FINTODO розраховує ПДФО та ЄСВ з кожної зарплати автоматично.";
  }
  if (profile.type === "tov" && profile.vatPayer === true) {
    return "📋 Декларація з ПДВ подається щомісяця до 20 числа. AI перевіряє узгодженість з ЄРПН.";
  }
  if (profile.type === "tov" && profile.taxSystem === "general") {
    return "📋 Фінансова звітність для ТОВ на загальній системі подається щоквартально. FINTODO формує повний пакет автоматично.";
  }
  if (profile.type === "fop") {
    return `📋 Поточний мінімальний ЄСВ — ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс (МЗП ${MINIMUM_WAGE.toLocaleString('uk-UA')} грн × ${TAX_RATES.esv * 100}%).`;
  }
  return "";
}

function getPainPointBenefit(profile: UserProfile): string {
  const pain = profile.painPoint;
  if (pain === "штрафи") {
    if (profile.type === "tov" && profile.vatPayer) return "🛡️ AI перевіряє декларацію на 50+ типових помилок та звіряє з ЄРПН до подачі — жодного штрафу через помилки.";
    return "🛡️ AI перевіряє кожний звіт на помилки перед подачею. За рік роботи — 0 штрафів у наших клієнтів.";
  }
  if (pain === "рутина") {
    if (profile.type === "fop" && profile.fopGroup === 3) return "⚡ Замість 4 годин на декларацію — 3 хвилини. AI збирає дані з банку, рахує ЄП, формує декларацію автоматично.";
    return "⚡ Банківська виписка, розрахунок податків, формування звіту — все автоматично. Ви лише перевіряєте та подаєте.";
  }
  if (pain === "дедлайни") {
    return "⏰ FINTODO нагадає про кожний дедлайн за 7 і 3 дні, а звітність сформує автоматично — жодного пропущеного строку.";
  }
  if (pain === "витрати") {
    if (profile.type === "fop" && profile.fopGroup === 3) return "💰 Тариф «Смарт» — 399 грн/міс замість 3 000–5 000 грн за бухгалтера. Окупається після першого ж уникнутого штрафу.";
    if (profile.type === "fop") return "💰 Тариф «Старт» — безкоштовно (300 кр./міс) замість 3 000–5 000 грн за бухгалтера. Окупається після першого ж уникнутого штрафу.";
    return "💰 FINTODO від 0 ₴ (Старт) — в рази дешевше за бухгалтера, з гарантією точності та автоматизації.";
  }
  if (pain === "помилки") {
    return "🛡️ AI перевіряє кожну цифру перед подачею: 94% клієнтів подають декларацію без помилок з першого разу.";
  }
  if (pain === "складність") {
    return "📊 FINTODO автоматично збирає доходи з різних джерел (зарплата, оренда, інвестиції) та формує єдину декларацію.";
  }
  if (pain === "автоматизація") {
    return "⚡ FINTODO автоматично формує декларації, платіжки та звіти — 3 хвилини замість 4 годин.";
  }
  return "";
}

function getServiceSuggestion(profile: UserProfile): string {
  const suggestions: string[] = [];
  if (profile.vatPayer === true) suggestions.push("модуль ПДВ (реєстр ПН, автозвіт)");
  if (profile.hasEmployees === true) suggestions.push("HR-модуль (зарплата, 1-ДФ, ЄСВ Д4)");
  if (profile.type === "tov" && profile.taxSystem === "general") suggestions.push("повний бухоблік");
  if (suggestions.length > 0) return `\n\n🔧 Рекомендуємо додатково: ${suggestions.join(", ")}.`;
  return "";
}

export function getValueAddNode(profile: UserProfile): FunnelNode {
  const actions =
    profile.type === "fop" ? FOP_ACTIONS :
    profile.type === "tov" ? TOV_ACTIONS :
    profile.type === "accountant" ? ACCOUNTANT_ACTIONS :
    INDIVIDUAL_ACTIONS;

  const warning = getLegislativeWarning(profile);
  const benefit = getPainPointBenefit(profile);
  const services = getServiceSuggestion(profile);

  let text = "";
  if (warning) text += warning + "\n\n";
  if (benefit) text += benefit + "\n\n";
  if (services) text += services.trim() + "\n\n";
  text += "Чим ще можу допомогти? Оберіть дію нижче або задайте будь-яке питання 👇";

  return {
    aiText: text,
    actions,
    nextStage: "conversion",
  };
}

// ── Action responses ──

export function getActionResponse(action: ChatAction, profile: UserProfile): string {
  switch (action.type) {
    case "reminder":
      return "Чудово! Введіть ваш email — надішлю податковий календар та нагадуватиму про дедлайни. Найближчий дедлайн — подача декларації ЄП за I квартал (до 12 травня 2026).";
    case "check_fop":
      return getFopCheckCTA(profile);
    case "consult": {
      const ctx = profile.type === "fop" && profile.fopGroup
        ? `ФОП ${profile.fopGroup} групи`
        : profile.type === "tov" ? "ТОВ"
        : profile.type === "accountant" ? "бухгалтерської практики"
        : profile.individualType === "investor" ? "інвестицій"
        : profile.individualType === "landlord" ? "оренди нерухомості"
        : profile.individualType === "freelancer" ? "фрілансу"
        : "вашої ситуації";
      return `Напишіть ваше питання — я дам відповідь з урахуванням ${ctx}. Наприклад: "Коли подавати декларацію?", "Як зменшити податки?" або будь-що інше.`;
    }
    case "calculate": {
      if (profile.type === "fop") {
        if (profile.fopGroup === 3 && profile.vatPayer === true) {
          return `Для розрахунку введіть ваш місячний дохід. Ваш ЄП 3% + ПДВ 20%. При доході 100 000 грн: ЄП 3 000 + ПДВ-зобов'язання (залежить від податкового кредиту) + ЄСВ ${ESV_MONTHLY.toLocaleString('uk-UA')} грн. Я розрахую точну суму.`;
        }
        if (profile.fopGroup === 3) {
          return `Для розрахунку введіть ваш місячний дохід. Ваш ЄП 5% від доходу. При доході 100 000 грн: ЄП 5 000 + ЄСВ ${ESV_MONTHLY.toLocaleString('uk-UA')} = ${(5000 + ESV_MONTHLY).toLocaleString('uk-UA')} грн. Я розрахую точну суму.`;
        }
        const rate = profile.fopGroup === 2 ? `фіксований ${EP_FIXED.group2.toLocaleString('uk-UA')} грн/міс` : `фіксований ${EP_FIXED.group1.toLocaleString('uk-UA')} грн/міс`;
        const hasEmp = profile.hasEmployees ? " Також розрахую зарплатні податки для працівників." : "";
        return `Для розрахунку введіть ваш місячний дохід. Ставка ЄП для вашої групи: ${rate}. Я розрахую ЄП, ЄСВ та загальне податкове навантаження.${hasEmp}`;
      }
      if (profile.type === "tov") {
        const vatNote = profile.vatPayer ? " Також розрахую ПДВ-зобов'язання." : "";
        return `Введіть суму доходу — я розрахую податок на прибуток, ЄСВ та зарплатні податки.${vatNote}`;
      }
      return "__individual_calc_type__";
    }
    case "check_declaration":
      return "__check_declaration_start__";
    case "register":
      return "Є безкоштовний «Старт» (300 кр./міс), а платні тарифи можна спробувати 14 днів без оплати. Реєстрація займає 30 секунд — потрібен лише email. Спробуйте без зобов'язань!";
    default:
      return "Чим ще можу допомогти?";
  }
}

// ── CTA consult topics (show quick replies instead of follow-ups) ──

export const CTA_CONSULT_TOPICS = new Set([
  "перевірка декларації",
  "аудит КОД",
  "перевірка ДПС",
  "податковий health-check",
  "перевірка контрагентів ТОВ",
  "розбіжність з ДПС",
  "розбіжність ПРРО",
]);
export const CTA_QUICK_REPLIES = ["Спробувати безкоштовно", "Що ще входить?", "Інше питання"];

// ── FOP Check CTA (registration prompt) ──

export function getFopCheckCTA(profile: UserProfile): string {
  return `Перевірка ФОП — це функція повної версії FINTODO. Після реєстрації ви зможете:\n\n— Перевірити чи є ваш ФОП у плані перевірок ДПС на 2026 рік\n— Моніторити податковий борг в реальному часі\n— Перевіряти контрагентів за ІПН або ЄДРПОУ\n— Отримувати автоматичні сповіщення при зміні статусу\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
}

// ── Conversion CTA text ──

export function getConversionText(profile: UserProfile): string {
  if (profile.type === "fop" && profile.fopGroup) {
    return `Для ФОП ${profile.fopGroup} групи рекомендую тариф ${profile.fopGroup <= 2 ? "«Старт» — 0 ₴/міс (300 кр.), він покриває базові потреби" : "«Смарт» — 399 грн/міс, він покриває авто-декларації ЄП, контроль ліміту та AI-аналітику"}. Реєстрація через Дія.Підпис займає 30 секунд 🚀`;
  }
  if (profile.type === "tov") {
    if (profile.employeeCount === "20+") {
      return "Для ТОВ рекомендую тариф «Преміум» — 799 грн/міс. Повний бухоблік, зарплатна звітність, AI-перевірки та масштабування. Реєстрація через Дія.Підпис — почніть з безкоштовного «Старту» або 14 днів повного Смарту 🚀";
    }
    return "Для ТОВ рекомендую тариф «Смарт» — 399 грн/міс. Повний бухоблік, зарплатна звітність та AI-перевірки. Реєстрація через Дія.Підпис — почніть з безкоштовного «Старту» або 14 днів повного Смарту 🚀";
  }
  if (profile.type === "accountant") {
    if (profile.clientCount === "4–10" || profile.clientCount === "10+") {
      return "Тариф «Преміум» — 799 грн/міс. Мультикабінет, масове формування звітів, єдиний податковий календар. Реєстрація через Дія.Підпис — почніть з безкоштовного «Старту» або 14 днів повного Смарту 🚀";
    }
    return "Тариф «Смарт» — від 399 грн/міс. Мультикабінет, масове формування звітів, єдиний податковий календар. Реєстрація через Дія.Підпис — почніть з безкоштовного «Старту» або 14 днів повного Смарту 🚀";
  }
  return "Базовий тариф для фізосіб — 149 грн/міс (1 декларація на рік). Тариф «Стандарт» — 349 грн/міс з AI-аналітикою та необмеженими деклараціями. Реєстрація через Дія.Підпис 🚀";
}

// ── Dynamic pricing node (audience-aware) ──
export function getPricingNode(profile: UserProfile): FunnelNode {
  if (profile.type === "individual") {
    return {
      aiText: `Ось наші тарифи для фізичних осіб:\n\n` +
        `📋 **Базовий** — 149 грн/міс\nОренда, продаж майна, податкова знижка — 1 декларація на рік\n\n` +
        `⭐ **Стандарт** — 349 грн/міс\nІнвестиції, крипто, іноземні доходи — необмежені декларації + AI-аналітика\n\n` +
        `💎 **Професійний** — 699 грн/міс\nНАЗК, незалежна профдіяльність — повна автоматизація + пріоритетна підтримка\n\n` +
        `Є безкоштовний **«Старт»** (300 кр./міс, без картки), а платні тарифи можна спробувати 14 днів без оплати.`,
      quickReplies: ["Маю інвестиції", "Здаю квартиру", "Спробувати безкоштовно"],
      nextStage: "consulting",
      profileUpdate: {},
    };
  }
  return {
    aiText: `Ось наші тарифи:\n\n` +
      `📦 **Старт** — 0 ₴/міс (300 кр.)\nДля ФОП 1–2 групи: ЄП, ЄСВ, декларація, податковий календар — безкоштовно назавжди\n\n` +
      `🚀 **Смарт** — 399 грн/міс\nДля ФОП 3 групи та ТОВ: повна автоматизація + банківські виписки + AI-перевірка\n\n` +
      `👑 **Преміум** — 799 грн/міс\nДля великих команд: виділений менеджер, кастомні інтеграції, SLA 4 год\n\n` +
      `Є безкоштовний **«Старт»** (300 кр./міс, без картки), а платні тарифи можна спробувати 14 днів без оплати.`,
    quickReplies: ["Я ФОП", "Я директор ТОВ", "Спробувати безкоштовно"],
    nextStage: "consulting",
    profileUpdate: {},
  };
}

// ── Keyword matching for free-text input ──

const KEYWORD_MAP: Record<string, string> = {
  банк: "банк", моно: "Як підключити банк?", приват: "Як підключити банк?",
  "обрати тариф": "__pricing_calculator__", "підібрати тариф": "__pricing_calculator__", "допоможи обрати": "__pricing_calculator__", "який тариф": "__pricing_calculator__", "порадь тариф": "__pricing_calculator__", "підібрати план": "__pricing_calculator__",
  ціна: "Скільки коштує?", тариф: "Скільки коштує?", вартість: "Скільки коштує?", кошту: "Скільки коштує?",
  "декларац": "декларац", "звіт": "звітність", "звітність": "звітність",
  фоп: "Я ФОП", підприєм: "Я ФОП",
  тов: "Я директор ТОВ", товариств: "Я директор ТОВ",
  бухгалтер: "Я бухгалтер",
  інвестиц: "інвестиції", акці: "інвестиції", крипт: "криптовалюта", криптовалют: "криптовалюта", біткоін: "криптовалюта", usdt: "криптовалюта",
  здаю: "Здаю квартиру", нерухом: "Здаю квартиру",
  фріланс: "Фріланс", upwork: "Upwork", апворк: "Upwork",
  безпек: "Чи безпечні мої дані?", захист: "Чи безпечні мої дані?",
  "1с": "Чи є інтеграція з 1С?", інтеграц: "Чи є інтеграція з 1С?",
  валют: "Працюєте з валютою?",
  "1 груп": "1 група", "2 груп": "2 група", "3 груп": "3 група",
  // Дохід, ліміти, перевірки
  "перевищення": "перевищення ліміту", "ліміт": "ліміт ЄП", "обсяг доход": "ліміт ЄП",
  "план перевір": "перевірка ДПС", "перевірк": "перевірка ДПС", "перевірок": "перевірка ДПС", "перевіро": "перевірка ДПС", "плані перевір": "перевірка ДПС", "податкова перевір": "перевірка ДПС", "ризик перевір": "перевірка ДПС",
  "валюта на рахунок": "валютний дохід", "валютний дохід": "валютний дохід", "отримав долар": "валютний дохід", "отримав євро": "валютний дохід", "курс нбу": "валютний дохід",
  "продав долар": "продаж валюти", "продав євро": "продаж валюти", "продаж валют": "продаж валюти", "конвертац": "продаж валюти",
  "переказ між": "переказ між рахунками", "переказ на свій": "переказ між рахунками", "між рахунк": "переказ між рахунками", "між банк": "переказ між рахунками",
  "повернув клієнт": "повернення клієнту", "повернення клієнт": "повернення клієнту", "повернув гроші клієнт": "повернення клієнту",
  "повернення постачальник": "повернення від постачальника", "рефанд": "повернення від постачальника", "refund": "повернення від постачальника", "повернув постачальник": "повернення від постачальника",
  "еквайринг": "еквайринг", "комісія еквайр": "еквайринг", "комісія банк": "еквайринг", "термінал": "еквайринг", "pos": "еквайринг",
  "передоплат": "передоплата", "аванс": "передоплата", "предоплат": "передоплата",
  "часткове поверн": "часткове повернення", "повернення товар": "часткове повернення",
  // РРО, Банки, Фінмоніторинг
  "прро": "ПРРО", "рро": "ПРРО", "касовий апарат": "ПРРО", "фіскал": "ПРРО",
  "готівк": "готівковий дохід", "готівковий дохід": "готівковий дохід", "каса": "готівковий дохід",
  "розбіжність прро": "розбіжність ПРРО", "різниця прро": "розбіжність ПРРО", "звірка каси": "розбіжність ПРРО",
  "блокуван": "блокування банком", "заблокував": "блокування банком", "заморож": "блокування банком",
  "особиста картка": "особиста картка", "особистий рахунок": "особиста картка", "на картку фізособи": "особиста картка",
  "кілька банків": "кілька банків", "декілька банків": "кілька банків", "два банки": "кілька банків", "три банки": "кілька банків",
  "без призначення": "без призначення", "не вказано призначення": "без призначення",
  "дроблення": "дроблення платежів", "дробить": "дроблення платежів",
  "один клієнт": "концентрація доходу", "один контрагент": "концентрація доходу", "від одного": "концентрація доходу",
  "фіндопомога": "фінансова допомога", "фінансова допомога": "фінансова допомога", "поворотна допомога": "фінансова допомога", "безповоротна допомога": "фінансова допомога",
  "фінансової допомоги": "фінансова допомога", "фінансову допомогу": "фінансова допомога",
  // Нові маппінги (оренда для кваліфікованих, YouTube, p2p, кеш-бек)
  "оренда приміщення": "оренда бізнесу", "орендую офіс": "оренда бізнесу", "оренда офісу": "оренда бізнесу", "оренд": "оренда",
  "youtube": "дохід від контенту", "ютуб": "дохід від контенту", "instagram": "дохід від контенту", "інстаграм": "дохід від контенту", "tiktok": "дохід від контенту", "тікток": "дохід від контенту", "блогер": "дохід від контенту", "монетизац": "дохід від контенту",
  "p2p": "p2p перекази", "п2п": "p2p перекази", "переказ на картку": "p2p перекази", "переказ від фізособи": "p2p перекази",
  "кешбек": "кешбек та бонуси", "кеш-бек": "кешбек та бонуси", "cashback": "кешбек та бонуси", "бонус від банку": "кешбек та бонуси",
  // Міжнародні платежі
  "payoneer": "Payoneer", "пайонір": "Payoneer",
  "paypal": "PayPal", "пейпал": "PayPal",
  "грант": "грант", "грантова": "грант",
  "продаж за кордон": "продаж за кордон", "експорт": "продаж за кордон", "іноземний клієнт": "продаж за кордон",
  "між валютними": "переказ між валютними рахунками", "переказ валют": "переказ між валютними рахунками",
  "курсова різниця": "курсові різниці", "курсові різниці": "курсові різниці",
  "комісія платформ": "комісія платформи", "комісія fiverr": "комісія платформи", "комісія upwork": "комісія платформи",
  "swift": "SWIFT-комісія", "свіфт": "SWIFT-комісія", "swift-комісія": "SWIFT-комісія",
  // Структура бізнесу
  "зміна групи": "зміна групи ЄП", "змінити групу": "зміна групи ЄП", "перейти на групу": "зміна групи ЄП",
  "перехід на тов": "перехід на ТОВ", "відкрити тов": "перехід на ТОВ", "фоп чи тов": "перехід на ТОВ", "фоп або тов": "перехід на ТОВ",
  "перевищив ліміт": "перевищення ліміту", "перевищення ліміту": "перевищення ліміту",
  "квед": "зміна КВЕД", "вид діяльності": "зміна КВЕД", "додати квед": "зміна КВЕД", "змінити квед": "зміна КВЕД",
  "продаж основного": "продаж основного засобу", "продаж обладнання": "продаж основного засобу",
  "продаж авто": "продаж авто", "продажу авто": "продаж авто", "продажі авто": "продаж авто",
  "продаж автомобіл": "продаж авто", "продажу автомобіл": "продаж авто",
  "без договору": "робота без договору", "немає договору": "робота без договору", "усний договір": "робота без договору",
  "за кордоном": "ФОП за кордоном", "виїхав": "ФОП за кордоном", "резидентство": "ФОП за кордоном", "183 дні": "ФОП за кордоном",
  "втрата статусу": "втрата статусу ЄП", "анулювання": "втрата статусу ЄП", "позбавлення єп": "втрата статусу ЄП",
  "неподана декларація": "неподана декларація", "не подав декларацію": "неподана декларація", "уточнююча": "неподана декларація", "забув подати": "неподана декларація",
  "податковий борг": "податковий борг", "борг дпс": "податковий борг", "заборгованість": "податковий борг", "недоїмка": "податковий борг",

  // Сценарії 41-50: Контроль та аудит
  "аудит код": "аудит КОД", "перевірка код": "аудит КОД", "перевірити код": "аудит КОД",
  "перевірка декларації": "перевірка декларації", "правильність декларації": "перевірка декларації", "звірка декларації": "перевірка декларації",
  "нульова декларація": "нульова декларація", "нульовий дохід": "нульова декларація", "декларація без доходу": "нульова декларація", "нульову декларацію": "нульова декларація",
  "закриття фоп": "закриття ФОП", "закрити фоп": "закриття ФОП", "ліквідація фоп": "закриття ФОП", "закриваю фоп": "закриття ФОП", "закрив фоп": "закриття ФОП",
  "розбіжність дпс": "розбіжність з ДПС", "різниця з дпс": "розбіжність з ДПС", "кабінет платника": "розбіжність з ДПС",
  "штраф": "отримання штрафу", "штрафів": "отримання штрафу", "отримав штраф": "отримання штрафу", "оскарження": "отримання штрафу", "оскаржити": "отримання штрафу", "податків": "податк",
  "первинка": "відсутність первинки", "первинні документи": "відсутність первинки", "відсутність документів": "відсутність первинки",
  "велика сума": "велика одноразова сума", "одноразова сума": "велика одноразова сума", "великий платіж": "велика одноразова сума",
  "від фізосіб": "платежі від фізосіб", "від фізичних осіб": "платежі від фізосіб", "платежі фізосіб": "платежі від фізосіб",
  "health-check": "податковий health-check", "хелсчек": "податковий health-check", "повна перевірка": "податковий health-check", "комплексна перевірка": "податковий health-check",

  // Мертві зони — додані маппінги
  "військовий збір": "військовий збір", "вз ": "військовий збір", "воєнний збір": "військовий збір",
  "пдв": "ПДВ", "податок на додану вартість": "ПДВ",
  "пеня": "податковий борг", "пені": "податковий борг",
  "не знаю свою групу": "визначення групи", "не знаю групу": "визначення групи", "яка група мені підходить": "визначення групи",

  // Сценарії для ТОВ
  "дивіденд": "дивіденди ТОВ", "виплата дивідендів": "дивіденди ТОВ",
  "зарплатні податки": "зарплатні податки ТОВ", "зарплатна звітність": "зарплатні податки ТОВ", "нарахування зарплати": "зарплатні податки ТОВ", "зарплатних податків": "зарплатні податки ТОВ",
  "фінансова звітність": "фінансова звітність ТОВ", "баланс": "фінансова звітність ТОВ", "фінзвітність": "фінансова звітність ТОВ",
  "касова дисципліна": "касова дисципліна ТОВ", "ліміт каси": "касова дисципліна ТОВ", "касової дисципліни": "касова дисципліна ТОВ", "касову дисципліну": "касова дисципліна ТОВ",
  "статутний капітал": "статутний капітал ТОВ", "статутний фонд": "статутний капітал ТОВ",
  "ліквідація тов": "ліквідація ТОВ", "закрити тов": "ліквідація ТОВ", "закриття тов": "ліквідація ТОВ",
  "єдрпоу": "реєстрація ТОВ", "зареєструвати тов": "реєстрація ТОВ",
  "перевірка контрагент": "перевірка контрагентів ТОВ", "перевірити контрагент": "перевірка контрагентів ТОВ",
  "трансфертне ціноутвор": "трансфертне ціноутворення ТОВ", "трансфертн": "трансфертне ціноутворення ТОВ",
  "відповідальність директ": "відповідальність директора ТОВ", "субсидіарна відповідальність": "відповідальність директора ТОВ",

  // Сценарії для фізосіб
  "податкова знижка": "податкова знижка фізособи", "повернення пдфо": "податкова знижка фізособи", "повернити пдфо": "податкова знижка фізособи", "податкову знижку": "податкова знижка фізособи", "податковій знижці": "податкова знижка фізособи",
  "продаж квартири": "продаж нерухомості фізособи", "продаж будинку": "продаж нерухомості фізособи", "продажу нерухомості": "продаж нерухомості фізособи", "продажі нерухомості": "продаж нерухомості фізособи",
  "спадщин": "спадщина та дарування", "дарування": "спадщина та дарування", "дарча": "спадщина та дарування",
  "іноземний дохід фізособ": "іноземний дохід фізособи", "дохід з-за кордону": "іноземний дохід фізособи", "закордонний дохід": "іноземний дохід фізособи",
  "гіг-контракт": "гіг-контракти фізособи", "цивільно-правовий договір": "гіг-контракти фізособи", "цпд": "гіг-контракти фізособи",
  "депозит": "депозити та відсотки фізособи", "відсотки по депозит": "депозити та відсотки фізособи",
  "аліменти": "аліменти фізособи", "утримання аліментів": "аліменти фізособи",
  "продаж авто фіз": "продаж авто фізособи", "продаж машини": "продаж авто фізособи",
  "благодійн": "благодійність фізособи", "донат": "благодійність фізособи", "пожертв": "благодійність фізособи",
  "е-декларування": "е-декларування фізособи", "декларація НАЗК": "е-декларування фізособи", "назк": "е-декларування фізособи",
  // Нові сценарії для фізосіб (71-80)
  "виграш": "виграш лотерея", "лотерея": "виграш лотерея", "казино": "виграш лотерея", "гральний": "виграш лотерея",
  "форекс": "форекс торгівля", "forex": "форекс торгівля", "cfd": "форекс торгівля", "трейдинг": "форекс торгівля",
  "іноземна пенсія": "пенсія з-за кордону", "пенсія з-за кордон": "пенсія з-за кордону", "пенсія за кордоном": "пенсія з-за кордону",
  "подарунок": "подарунок грошовий", "подаруно": "подарунок грошовий", "подарували": "подарунок грошовий",
  "стипенді": "стипендія грант фізособа",
  "пай": "оренда землі пай", "земельний пай": "оренда землі пай", "оренда землі": "оренда землі пай",
  "продаж землі": "продаж землі", "продав ділянку": "продаж землі", "земельна ділянка": "продаж землі",
  "переказ з-за кордону": "переказ з-за кордону", "надіслали гроші": "переказ з-за кордону", "гроші з-за кордону": "переказ з-за кордону",
  "кеп": "кеп дія підпис", "дія підпис": "кеп дія підпис", "електронний підпис": "кеп дія підпис", "ацск": "кеп дія підпис",
  "чи потрібна декларація": "чи потрібна декларація", "треба подавати декларацію": "чи потрібна декларація", "обов'язкова декларація": "чи потрібна декларація",

  // Оптимізація / зменшення податків
  "зменшити": "зменш", "зменшити податк": "зменш", "оптимізувати": "зменш", "оптимізац": "зменш", "економити": "зменш",
  // Загальні податкові питання
  "податки": "податк", "податок": "податк", "податку": "податк",
  "єдиний податок": "єдиний податок ФОП",
  // ПДФО — загальні питання (не знижка)
  "розрахувати пдфо": "податк", "скільки пдфо": "податк", "пдфо": "податк",
  // Зарплата
  "нарахувати зарплат": "зарплатні податки ТОВ", "розрахунок зарплат": "зарплатні податки ТОВ",

  // Калькулятор — загальні питання з числами
  "скільки заплачу": "__calculator__", "загальна сума податк": "__calculator__", "мої податки": "__calculator__",
  "порахувати податок": "__calculator__", "порахуй": "__calculator__", "розрахуй": "__calculator__",
  "скільки платити": "__calculator__", "сума податк": "__calculator__",

  // Escape / персональна консультація
  "консультац": "персональна консультація", "не знайшов": "персональна консультація", "не бачу": "персональна консультація",
};

// Additional FAQ entries that can be reached via free text
const FAQ_ENTRIES: Record<string, string> = {
  "Чи безпечні мої дані?": "Дані зашифровані AES-256, сервери в ЄС, доступ лише через КЕП. Ми не передаємо дані третім сторонам і відповідаємо вимогам GDPR.",
  "Чи є інтеграція з 1С?": "Так! Двостороння синхронізація з 1С: імпорт залишків, експорт документів, автоматичне звіряння. Налаштування — 15 хвилин через майстер підключення.",
  "Працюєте з валютою?": "Підтримуємо USD, EUR, PLN, GBP та інші. Курс НБУ підтягується автоматично, конвертація та курсові різниці розраховуються при кожній операції.",
};

export type MatchResult = { key: string; source: "qualifying" | "qualifying_2" | "faq" | "consult" };
export type DisambiguateResult = { source: "disambiguate"; options: Array<{ key: string; source: "faq" | "consult"; label: string }> };

export function matchFreeText(text: string, profile?: UserProfile): MatchResult | DisambiguateResult | null {
  const lower = text.toLowerCase().trim();
  const isQualified = profile?.type != null;

  // Direct match in qualifying or qualifying_2 (skip if already qualified — fix #11)
  if (!isQualified) {
    const allKeys = [...Object.keys(QUALIFYING_RESPONSES), ...Object.keys(QUALIFYING_2_RESPONSES)];
    const direct = allKeys.find((k) => lower === k.toLowerCase());
    if (direct) {
      if (QUALIFYING_RESPONSES[direct]) return { key: direct, source: "qualifying" };
      return { key: direct, source: "qualifying_2" };
    }
  }

  // Keyword match — collect ALL matches for disambiguation
  const sortedEntries = Object.entries(KEYWORD_MAP).sort((a, b) => b[0].length - a[0].length);
  const allMatches: Array<{ key: string; source: "qualifying" | "qualifying_2" | "faq" | "consult"; keyword: string }> = [];
  const seenMappedKeys = new Set<string>();

  for (const [kw, mappedKey] of sortedEntries) {
    if (lower.includes(kw) && !seenMappedKeys.has(mappedKey)) {
      seenMappedKeys.add(mappedKey);
      if (isQualified && QUALIFYING_RESPONSES[mappedKey]) continue;
      if (isQualified && QUALIFYING_2_RESPONSES[mappedKey]) continue;
      if (!isQualified && QUALIFYING_RESPONSES[mappedKey]) {
        allMatches.push({ key: mappedKey, source: "qualifying", keyword: kw });
      } else if (!isQualified && QUALIFYING_2_RESPONSES[mappedKey]) {
        allMatches.push({ key: mappedKey, source: "qualifying_2", keyword: kw });
      } else if (FAQ_ENTRIES[mappedKey]) {
        allMatches.push({ key: mappedKey, source: "faq", keyword: kw });
      } else if (CONSULT_KEYWORDS[mappedKey]) {
        allMatches.push({ key: mappedKey, source: "consult", keyword: kw });
      }
    }
  }

  // If multiple CONSULT/FAQ matches from different topics — disambiguate
  const consultFaqMatches = allMatches.filter(m => m.source === "consult" || m.source === "faq");
  if (consultFaqMatches.length >= 2) {
    // Check if they are truly different topics (not just different keywords for the same topic)
    const uniqueTopics = new Set(consultFaqMatches.map(m => m.key));
    if (uniqueTopics.size >= 2) {
      return {
        source: "disambiguate",
        options: consultFaqMatches.slice(0, 4).map(m => ({
          key: m.key,
          source: m.source as "faq" | "consult",
          label: m.key,
        })),
      };
    }
  }

  // Return first match (with audience-aware routing)
  if (allMatches.length > 0) {
    const match = allMatches[0];
    const isIndividual = !profile?.type || profile.type === "individual";

    // Audience-aware routing: "продаж авто"
    if (match.key === "продаж авто" && !isIndividual) {
      return { key: "продаж основного засобу", source: "consult" };
    }
    // Audience-aware routing: "оренда"
    if (match.key === "оренда") {
      return { key: isIndividual ? "Здаю квартиру" : "оренда бізнесу", source: isIndividual ? "qualifying" : "consult" };
    }
    // Audience-aware routing: "інвестиції" for business → skip (not relevant)
    if (match.key === "інвестиції" && !isIndividual) {
      // For business, skip investment routing — fall through to next match or null
      const remaining = allMatches.filter(m => m.key !== "інвестиції");
      if (remaining.length > 0) return { key: remaining[0].key, source: remaining[0].source };
      return null;
    }
    return { key: match.key, source: match.source };
  }

  // FAQ direct
  const faqKey = Object.keys(FAQ_ENTRIES).find((k) => lower.includes(k.toLowerCase().slice(0, 10)));
  if (faqKey) return { key: faqKey, source: "faq" };

  return null;
}

export function getFaqResponse(key: string): string {
  return FAQ_ENTRIES[key] || "";
}

export const FALLBACK_TEXT_BUSINESS = "Щоб дати точну відповідь, скажіть — ви ФОП, директор ТОВ чи бухгалтер? Або оберіть тему нижче 👇";
export const FALLBACK_TEXT_INDIVIDUAL = "Щоб дати точну відповідь, уточніть вашу ситуацію — або оберіть тему нижче 👇";

export function getFallbackText(audience: "business" | "individual", profileType?: string | null): string {
  if (profileType) {
    return "Не знайшов точну відповідь на це питання. Оберіть тему нижче або задайте інше питання 👇";
  }
  return audience === "business" ? FALLBACK_TEXT_BUSINESS : FALLBACK_TEXT_INDIVIDUAL;
}

export const FALLBACK_TEXT = FALLBACK_TEXT_BUSINESS;
export const FALLBACK_REPLIES_BUSINESS = ["Я ФОП", "Я директор ТОВ", "Я бухгалтер"];
export const FALLBACK_REPLIES_INDIVIDUAL = ["Маю інвестиції", "Здаю квартиру", "Фріланс", "Продаж / спадщина / інше"];
export const FALLBACK_TOPIC_REPLIES = ["Податки", "Звітність", "Ліміти", "Штрафи"];

export function getFallbackReplies(audience: "business" | "individual", profileType?: string | null): string[] {
  if (profileType) {
    return [...FALLBACK_TOPIC_REPLIES, "Інше питання"];
  }
  const identReplies = audience === "business" ? FALLBACK_REPLIES_BUSINESS : FALLBACK_REPLIES_INDIVIDUAL;
  return [...identReplies, ...FALLBACK_TOPIC_REPLIES];
}

// ── Inline tax calculator ──

export function calculateTaxForIncome(income: number, profile: UserProfile): string {
  if (profile.type === "fop" && profile.fopGroup === 3) {
    const epRate = profile.vatPayer ? TAX_RATES.epGroup3_withVat : TAX_RATES.epGroup3_withoutVat;
    const ep = Math.round(income * epRate);
    const vz = Math.round(income * TAX_RATES.militaryTax);
    const esv = ESV_MONTHLY;
    const total = ep + vz + esv;
    const effectiveRate = ((total / income) * 100).toFixed(1);
    const vatNote = profile.vatPayer ? `\n• ПДВ (20%): ${Math.round(income * TAX_RATES.vat).toLocaleString('uk-UA')} ₴ (зменшується на податковий кредит)` : '';
    return `📊 Розрахунок для ФОП 3 групи (дохід ${income.toLocaleString('uk-UA')} ₴/міс):\n\n• ЄП (${epRate * 100}%): ${ep.toLocaleString('uk-UA')} ₴${vatNote}\n• ВЗ (${TAX_RATES.militaryTax * 100}%): ${vz.toLocaleString('uk-UA')} ₴\n• ЄСВ (мін.): ${esv.toLocaleString('uk-UA')} ₴\n\n💰 **Разом: ${total.toLocaleString('uk-UA')} ₴/міс** (ефективна ставка ${effectiveRate}%)\n• На руки: ${(income - total).toLocaleString('uk-UA')} ₴\n\n📅 За квартал: ${(total * 3).toLocaleString('uk-UA')} ₴\n📅 За рік: ${(total * 12).toLocaleString('uk-UA')} ₴\n\n94% клієнтів FINTODO подають декларацію без помилок з першого разу.${getEmailBridge(profile)}`;
  }
  if (profile.type === "fop" && profile.fopGroup === 2) {
    const ep = EP_FIXED.group2;
    const esv = ESV_MONTHLY;
    const vz = Math.round(MINIMUM_WAGE * TAX_RATES.militaryTax);
    const total = ep + esv + vz;
    return `📊 Розрахунок для ФОП 2 групи (дохід ${income.toLocaleString('uk-UA')} ₴/міс):\n\n• ЄП (фікс.): ${ep.toLocaleString('uk-UA')} ₴\n• ВЗ (фікс.): ${vz.toLocaleString('uk-UA')} ₴\n• ЄСВ (мін.): ${esv.toLocaleString('uk-UA')} ₴\n\n💰 **Разом: ${total.toLocaleString('uk-UA')} ₴/міс** (ефективна ставка ${((total / income) * 100).toFixed(1)}%)\n• На руки: ${(income - total).toLocaleString('uk-UA')} ₴\n\nFINTODO автоматично формує платіжки щомісяця.${getEmailBridge(profile)}`;
  }
  if (profile.type === "fop" && profile.fopGroup === 1) {
    const ep = EP_FIXED.group1;
    const esv = ESV_MONTHLY;
    const vz = Math.round(MINIMUM_WAGE * TAX_RATES.militaryTax);
    const total = ep + esv + vz;
    return `📊 Розрахунок для ФОП 1 групи (дохід ${income.toLocaleString('uk-UA')} ₴/міс):\n\n• ЄП (фікс.): ${ep.toLocaleString('uk-UA')} ₴\n• ВЗ (фікс.): ${vz.toLocaleString('uk-UA')} ₴\n• ЄСВ (мін.): ${esv.toLocaleString('uk-UA')} ₴\n\n💰 **Разом: ${total.toLocaleString('uk-UA')} ₴/міс** (ефективна ставка ${((total / income) * 100).toFixed(1)}%)\n\nFINTODO автоматично формує платіжки.${getEmailBridge(profile)}`;
  }
  // Generic / TOV / individual
  const pdfo = Math.round(income * TAX_RATES.personalIncomeTax);
  const vz = Math.round(income * TAX_RATES.militaryTax);
  const total = pdfo + vz;
  return `📊 Розрахунок податків (дохід ${income.toLocaleString('uk-UA')} ₴):\n\n• ПДФО (18%): ${pdfo.toLocaleString('uk-UA')} ₴\n• ВЗ (${TAX_RATES.militaryTax * 100}%): ${vz.toLocaleString('uk-UA')} ₴\n\n💰 **Разом: ${total.toLocaleString('uk-UA')} ₴** (ефективна ставка ${((total / income) * 100).toFixed(1)}%)\n• На руки: ${(income - total).toLocaleString('uk-UA')} ₴\n\nFINTODO автоматизує розрахунок та подачу декларації.${getEmailBridge(profile)}`;
}

// ── Contextual follow-up actions ──

export function getContextualFollowUps(scenarioKey: string): string[] | null {
  // Follow-up values MUST be recognizable by matchFreeText (KEYWORD_MAP keys or CONSULT_KEYWORDS keys)
  const followUpMap: Record<string, string[]> = {
    // Blocks 1-10: Base tax queries
    "декларац": ["звітність", "нульова декларація", "єсв"],
    "податк": ["декларац", "зменш", "єсв"],
    "зменш": ["ліміт ЄП", "зміна групи ЄП", "декларац"],
    "єсв": ["декларац", "податк", "військовий збір"],
    "банк": ["еквайринг", "кілька банків", "блокування банком"],
    "ліміт ЄП": ["перевищення ліміту", "зміна групи ЄП", "декларац"],
    // "перевірка ДПС" removed — now a CTA topic
    "валютний дохід": ["продаж валюти", "курсові різниці", "Payoneer"],
    "продаж валюти": ["валютний дохід", "курсові різниці", "декларац"],
    // Blocks 11-20: POS, banks, monitoring
    "ПРРО": ["готівковий дохід", "розбіжність ПРРО", "еквайринг"],
    "готівковий дохід": ["ПРРО", "платежі від фізосіб", "еквайринг"],
    // "розбіжність ПРРО" removed — now a CTA topic
    "блокування банком": ["фінансова допомога", "дроблення платежів", "кілька банків"],
    "особиста картка": ["блокування банком", "банк", "переказ між рахунками"],
    "кілька банків": ["переказ між рахунками", "банк", "аудит КОД"],
    "без призначення": ["блокування банком", "перевірка ДПС", "банк"],
    "дроблення платежів": ["блокування банком", "велика одноразова сума", "фінансова допомога"],
    "концентрація доходу": ["перевірка ДПС", "дроблення платежів", "зміна групи ЄП"],
    "фінансова допомога": ["блокування банком", "податк", "декларац"],
    // Blocks 21-30: International
    "Payoneer": ["комісія платформи", "валютний дохід", "курсові різниці"],
    "PayPal": ["комісія платформи", "валютний дохід", "SWIFT-комісія"],
    "Upwork": ["комісія платформи", "валютний дохід", "Payoneer"],
    "грант": ["валютний дохід", "декларац", "податк"],
    "продаж за кордон": ["валютний дохід", "курсові різниці", "ПДВ"],
    "переказ між валютними рахунками": ["валютний дохід", "курсові різниці", "продаж валюти"],
    "курсові різниці": ["валютний дохід", "продаж валюти", "декларац"],
    "комісія платформи": ["еквайринг", "валютний дохід", "Payoneer"],
    "SWIFT-комісія": ["валютний дохід", "PayPal", "курсові різниці"],
    "переказ між рахунками": ["кілька банків", "аудит КОД", "банк"],
    "повернення клієнту": ["часткове повернення", "еквайринг", "аудит КОД"],
    "повернення від постачальника": ["повернення клієнту", "аудит КОД", "декларац"],
    "передоплата": ["повернення клієнту", "еквайринг", "банк"],
    "часткове повернення": ["повернення клієнту", "еквайринг", "аудит КОД"],
    "еквайринг": ["ПРРО", "комісія платформи", "часткове повернення"],
    // Blocks 31-40: Business structure
    "зміна групи ЄП": ["ліміт ЄП", "перехід на ТОВ", "перевищення ліміту"],
    "перехід на ТОВ": ["дивіденди ТОВ", "зарплатні податки ТОВ", "зміна групи ЄП"],
    "перевищення ліміту": ["зміна групи ЄП", "ліміт ЄП", "перехід на ТОВ"],
    "зміна КВЕД": ["зміна групи ЄП", "декларац", "перевірка ДПС"],
    "продаж основного засобу": ["декларац", "податк", "ліміт ЄП"],
    "продаж авто": ["декларац", "продаж нерухомості", "спадщина"],
    "робота без договору": ["перевірка ДПС", "отримання штрафу", "відсутність первинки"],
    "ФОП за кордоном": ["закриття ФОП", "єсв", "декларац"],
    "втрата статусу ЄП": ["перевищення ліміту", "зміна групи ЄП", "перехід на ТОВ"],
    "неподана декларація": ["отримання штрафу", "податковий борг", "нульова декларація"],
    "податковий борг": ["отримання штрафу", "неподана декларація", "перевірка ДПС"],
    // Blocks 41-50: Control & audit
    // "аудит КОД" removed — now a CTA topic
    // "перевірка декларації" removed — now a CTA topic with its own quick replies
    "нульова декларація": ["закриття ФОП", "єсв", "податковий борг"],
    "закриття ФОП": ["нульова декларація", "єсв", "податковий борг"],
    // "розбіжність з ДПС" removed — now a CTA topic
    "отримання штрафу": ["податковий борг", "неподана декларація", "перевірка ДПС"],
    "відсутність первинки": ["аудит КОД", "перевірка ДПС", "декларац"],
    "велика одноразова сума": ["блокування банком", "ліміт ЄП", "дроблення платежів"],
    "платежі від фізосіб": ["ПРРО", "еквайринг", "готівковий дохід"],
    // "податковий health-check" removed — now a CTA topic
    // Blocks 51-60: TOV
    "дивіденди ТОВ": ["зарплатні податки ТОВ", "фінансова звітність ТОВ", "касова дисципліна ТОВ"],
    "зарплатні податки ТОВ": ["дивіденди ТОВ", "єсв", "фінансова звітність ТОВ"],
    "фінансова звітність ТОВ": ["дивіденди ТОВ", "зарплатні податки ТОВ", "декларац"],
    "касова дисципліна ТОВ": ["ПРРО", "дивіденди ТОВ", "фінансова звітність ТОВ"],
    "статутний капітал ТОВ": ["дивіденди ТОВ", "перехід на ТОВ", "фінансова звітність ТОВ"],
    "ліквідація ТОВ": ["закриття ФОП", "податковий борг", "фінансова звітність ТОВ"],
    "реєстрація ТОВ": ["перехід на ТОВ", "статутний капітал ТОВ", "зарплатні податки ТОВ"],
    // "перевірка контрагентів ТОВ" removed — now a CTA topic
    "трансфертне ціноутворення ТОВ": ["перевірка ДПС", "фінансова звітність ТОВ", "продаж за кордон"],
    "відповідальність директора ТОВ": ["дивіденди ТОВ", "податковий борг", "фінансова звітність ТОВ"],
    // Blocks 61-70: Individuals
    "податкова знижка фізособи": ["декларац", "благодійність фізособи", "депозити та відсотки фізособи"],
    "продаж нерухомості фізособи": ["спадщина та дарування", "податкова знижка фізособи", "декларац"],
    "спадщина та дарування": ["продаж нерухомості фізособи", "декларац", "податк"],
    "іноземний дохід фізособи": ["валютний дохід", "декларац", "курсові різниці"],
    "гіг-контракти фізособи": ["єсв", "декларац", "податк"],
    "депозити та відсотки фізособи": ["декларац", "податкова знижка фізособи", "податк"],
    "аліменти фізособи": ["зарплатні податки ТОВ", "податк", "декларац"],
    "продаж авто фізособи": ["продаж нерухомості фізособи", "декларац", "податк"],
    "благодійність фізособи": ["податкова знижка фізособи", "декларац", "податк"],
    "е-декларування фізособи": ["декларац", "податк", "іноземний дохід фізособи"],
    // Blocks 71-80: New individual scenarios
    "виграш лотерея": ["декларац", "податк", "чи потрібна декларація"],
    "форекс торгівля": ["інвестиції", "криптовалюта", "декларац"],
    "пенсія з-за кордону": ["іноземний дохід фізособи", "декларац", "чи потрібна декларація"],
    "подарунок грошовий": ["спадщина та дарування", "декларац", "податк"],
    "стипендія грант фізособа": ["податкова знижка фізособи", "декларац", "чи потрібна декларація"],
    "оренда землі пай": ["продаж землі", "декларац", "податк"],
    "продаж землі": ["оренда землі пай", "продаж нерухомості фізособи", "декларац"],
    "переказ з-за кордону": ["іноземний дохід фізособи", "подарунок грошовий", "декларац"],
    "кеп дія підпис": ["декларац", "чи потрібна декларація", "податк"],
    "чи потрібна декларація": ["декларац", "податкова знижка фізособи", "кеп дія підпис"],
    // New handlers
    "звітність": ["декларац", "єсв", "податковий health-check"],
    "військовий збір": ["податк", "єсв", "декларац"],
    "ПДВ": ["еквайринг", "декларац", "ліміт ЄП"],
    "визначення групи": ["ліміт ЄП", "зміна групи ЄП", "єсв"],
    "оренда бізнесу": ["ПРРО", "звітність", "зміна КВЕД"],
    "дохід від контенту": ["валютний дохід", "єсв", "декларац"],
    "p2p перекази": ["блокування банком", "податковий борг", "особиста картка"],
    "кешбек та бонуси": ["еквайринг", "податк", "декларац"],
    "криптовалюта": ["валютний дохід", "інвестиції", "декларац"],
    "інвестиції": ["криптовалюта", "податкова знижка фізособи", "декларац"],
  };
  return followUpMap[scenarioKey] || null;
}

// ── Library search for personalized consultation ──

const STOP_WORDS = new Set(["як", "що", "чи", "це", "та", "і", "в", "у", "на", "з", "до", "для", "від", "по", "не", "мій", "моя", "моє", "мої", "яка", "яке", "які", "який", "можна", "треба", "потрібно"]);

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[?!.,;:"""''«»()]/g, "").split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function scoreConsultation(tokens: string[], c: MockConsultation): number {
  let score = 0;
  const qLower = c.question.toLowerCase();
  const aLower = c.answer.toLowerCase();
  for (const t of tokens) {
    if (qLower.includes(t)) score += 3;
    if (c.tags.some(tag => tag.toLowerCase().includes(t))) score += 2;
    if (aLower.includes(t)) score += 1;
  }
  return score;
}

function findRelevantConsultation(text: string, profile: UserProfile): MockConsultation | null {
  const audience = (profile.type === "individual" || profile.type === null && profile.individualType) ? "individual" : "business";
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;

  let best: MockConsultation | null = null;
  let bestScore = 0;

  for (const c of mockConsultations) {
    if (c.audience !== audience) continue;
    const s = scoreConsultation(tokens, c);
    if (s > bestScore) { bestScore = s; best = c; }
  }

  return bestScore >= 3 ? best : null;
}

// ── matchFreeTextAll: collect ALL keyword matches with scoring ──

const ANCHOR_WORDS = new Set(["пдв", "єсв", "прро", "декларація", "декларац", "фоп", "рро"]);
const GENERIC_WORDS = new Set(["податок", "податк", "звіт", "дохід", "допомога", "послуга"]);

export function matchFreeTextAll(text: string, profile: UserProfile): Array<{
  key: string;
  score: number;
  matched: string[];
}> {
  const lower = text.toLowerCase().trim();
  const isIndividual = !profile?.type || profile.type === "individual";

  const results: Array<{ key: string; score: number; matched: string[] }> = [];
  const seenKeys = new Set<string>();

  // Sort by key length DESC for longest-match-first
  const sortedEntries = Object.entries(KEYWORD_MAP).sort((a, b) => b[0].length - a[0].length);

  for (const [kw, mappedKey] of sortedEntries) {
    if (!lower.includes(kw)) continue;
    if (seenKeys.has(mappedKey)) continue;
    seenKeys.add(mappedKey);

    // Skip qualifying responses for qualified users
    if (profile?.type != null && QUALIFYING_RESPONSES[mappedKey]) continue;
    if (profile?.type != null && QUALIFYING_2_RESPONSES[mappedKey]) continue;

    // Only include consult/faq targets
    if (!CONSULT_KEYWORDS[mappedKey] && !FAQ_ENTRIES[mappedKey]) continue;

    // Audience-aware routing
    if (mappedKey === "продаж авто" && !isIndividual) continue;
    if (mappedKey === "інвестиції" && !isIndividual) continue;

    // Scoring
    let score = kw.length > 8 ? 0.6 : 0.4;

    const kwLower = kw.toLowerCase();
    if (ANCHOR_WORDS.has(kwLower) || ANCHOR_WORDS.has(mappedKey.toLowerCase())) {
      score += 0.2;
    }
    if (GENERIC_WORDS.has(kwLower) || GENERIC_WORDS.has(mappedKey.toLowerCase())) {
      score -= 0.3;
    }

    score = Math.min(1, Math.max(0, score));
    results.push({ key: mappedKey, score, matched: [kw] });
  }

  // Sort by score DESC and return top 5
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

// ── findRelevantConsultationTopN: scored library search ──

export function findRelevantConsultationTopN(
  text: string,
  profile: UserProfile,
  n: number = 5
): Array<{
  consultation: MockConsultation;
  scoreRaw: number;
  scoreNorm: number;
  matchedTokens: string[];
}> {
  const audience = (profile.type === "individual" || profile.type === null && profile.individualType) ? "individual" : "business";
  const tokens = tokenize(text);
  if (tokens.length === 0) return [];

  const lower = text.toLowerCase();
  const results: Array<{
    consultation: MockConsultation;
    scoreRaw: number;
    scoreNorm: number;
    matchedTokens: string[];
  }> = [];

  for (const c of mockConsultations) {
    if (c.audience !== audience) continue;
    let scoreRaw = scoreConsultation(tokens, c);
    if (scoreRaw < 3) continue;

    const matchedTokens = tokens.filter(t =>
      c.question.toLowerCase().includes(t) ||
      c.tags.some(tag => tag.toLowerCase().includes(t))
    );

    // Rerank bonuses
    // +0.3 for exact phrase match (>= 2 consecutive words) in question
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words[i] + " " + words[i + 1];
      if (c.question.toLowerCase().includes(phrase)) {
        scoreRaw += 0.3;
        break;
      }
    }

    // +0.2 for tag match
    if (c.tags.some(tag => tokens.some(t => tag.toLowerCase().includes(t)))) {
      scoreRaw += 0.2;
    }

    // +0.2 for match in first sentence (title)
    const firstSentence = c.question.split(/[?.!]/)[0]?.toLowerCase() || "";
    if (tokens.some(t => firstSentence.includes(t))) {
      scoreRaw += 0.2;
    }

    // -0.2 for very short generic tokens
    const hasOnlyShortGeneric = tokens.every(t => t.length < 4);
    if (hasOnlyShortGeneric) {
      scoreRaw -= 0.2;
    }

    const scoreNorm = Math.min(1, scoreRaw / 10);

    results.push({ consultation: c, scoreRaw, scoreNorm, matchedTokens });
  }

  // Calibration log (dev only)
  if (import.meta.env.DEV && results.length > 0) {
    console.log('[calibration]', results.map(r => ({ q: r.consultation.question.slice(0, 50), raw: r.scoreRaw })));
  }

  results.sort((a, b) => b.scoreRaw - a.scoreRaw);
  return results.slice(0, n);
}

function extractTeaser(answer: string): string {
  // Extract first 1-2 sentences (up to ~200 chars) for a teaser
  const firstParagraph = answer.split("\n\n").filter(p => p.trim())[0] || "";
  // Try to get first 1-2 sentences
  const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    let teaser = sentences[0].trim();
    if (teaser.length < 100 && sentences.length > 1) {
      teaser += " " + sentences[1].trim();
    }
    return teaser.length > 250 ? teaser.slice(0, 247) + "..." : teaser;
  }
  return firstParagraph.length > 250 ? firstParagraph.slice(0, 247) + "..." : firstParagraph;
}

function classifyQuery(text: string): "informational" | "product" {
  const productKeywords = ["контрол", "моніторин", "автоматиз", "підключ", "інтеграц", "облік", "звітніст", "декларацію подати", "нагад", "відстеж"];
  const lower = text.toLowerCase();
  return productKeywords.some(kw => lower.includes(kw)) ? "product" : "informational";
}

export function getLibraryBonusOffer(profile: UserProfile): string {
  if (profile.type === "fop" && profile.fopGroup) {
    return `податковий календар для ФОП ${profile.fopGroup} групи на ${CURRENT_TAX_YEAR} рік`;
  }
  if (profile.type === "tov") {
    return `календар фінансової звітності ТОВ на ${CURRENT_TAX_YEAR} рік`;
  }
  if (profile.type === "accountant") {
    return "чек-лист квартальної звітності для всіх типів клієнтів";
  }
  if (profile.type === "individual") {
    if (profile.individualType === "investor") return "гайд з декларування інвестиційного доходу";
    if (profile.individualType === "landlord") return "чек-лист декларації з доходу від оренди";
    if (profile.individualType === "freelancer") return "порівняння: фізособа vs ФОП для фрілансера";
    return `податковий календар фізичної особи на ${CURRENT_TAX_YEAR} рік`;
  }
  return `податковий календар на ${CURRENT_TAX_YEAR} рік`;
}

function getProfileContext(profile: UserProfile): string {
  if (profile.type === "fop" && profile.fopGroup) return `ФОП ${profile.fopGroup} групи`;
  if (profile.type === "tov") return "ТОВ";
  if (profile.type === "accountant") return "бухгалтерської практики";
  if (profile.individualType === "investor") return "інвестицій";
  if (profile.individualType === "landlord") return "оренди нерухомості";
  if (profile.individualType === "freelancer") return "фрілансу";
  return "вашої ситуації";
}

function getEmailBridge(profile: UserProfile): string {
  const ctx = getProfileContext(profile);
  if (profile.type === "fop" && profile.fopGroup) {
    return `\n\nХочете, надішлю цю консультацію на email разом з податковим календарем для ФОП ${profile.fopGroup} групи? Або оберіть іншу дію нижче.`;
  }
  return `\n\nХочете, надішлю цю консультацію на email? Додам корисні матеріали для ${ctx}. Або оберіть іншу дію нижче.`;
}

// ── Personalized consultation responses ──

const CONSULT_KEYWORDS: Record<string, (profile: UserProfile) => string> = {
  "Скільки коштує?": (p) => {
    const plans = p.type === "individual" ? individualPlans : businessPlans;
    const cheapest = plans[0];
    const mid = plans[1];
    return `Тарифи FINTODO:\n• «${cheapest.name}» — ${cheapest.price} грн/міс\n• «${mid.name}» — ${mid.price} грн/міс\n\nБезкоштовний «Старт» доступний одразу, платні — з 14 днями trial без картки. Хочете підібрати оптимальний тариф?`;
  },
  "персональна консультація": () =>
    "Зрозуміло! Опишіть вашу ситуацію — я підберу відповідь або порекомендую тариф.",
  декларац: (p) => {
    if (p.type === "fop") return `Для ФОП ${p.fopGroup || ""} групи декларація подається щоквартально — до 40 календарних днів після кінця кварталу. Наступний дедлайн — 12 травня 2026 (за I квартал). FINTODO сформує декларацію автоматично за 3 хвилини.${getEmailBridge(p)}`;
    return `Декларація про доходи фізосіб подається до 1 травня за попередній рік. Податок сплачується до 1 серпня. FINTODO допоможе зібрати всі дані та сформувати декларацію.${getEmailBridge(p)}`;
  },
  податк: (p) => {
    if (p.type === "fop" && p.fopGroup === 3 && p.vatPayer === true) return `ФОП 3 групи з ПДВ платить ЄП 3% від доходу + ПДВ 20% щоквартально + ЄСВ (мін. ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс). При доході 100 000 грн: ЄП 3 000 + ПДВ-зобов'язання + ЄСВ ${ESV_MONTHLY.toLocaleString('uk-UA')}. Податковий кредит зменшує ПДВ.${getEmailBridge(p)}`;
    if (p.type === "fop" && p.fopGroup === 3) return `ФОП 3 групи платить ЄП 5% від доходу щоквартально + ЄСВ (мін. ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс). При доході 50 000 грн/міс: ЄП 2 500 + ЄСВ ${ESV_MONTHLY.toLocaleString('uk-UA')} = ${(2500 + ESV_MONTHLY).toLocaleString('uk-UA')} грн. Ефективна ставка ~${((2500 + ESV_MONTHLY) / 50000 * 100).toFixed(1)}%.${getEmailBridge(p)}`;
    if (p.type === "fop" && p.fopGroup === 2) return `ФОП 2 групи платить фіксований ЄП ${EP_FIXED.group2.toLocaleString('uk-UA')} грн/міс + ЄСВ ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс = ${(EP_FIXED.group2 + ESV_MONTHLY).toLocaleString('uk-UA')} грн/міс незалежно від доходу.${getEmailBridge(p)}`;
    if (p.type === "fop" && p.fopGroup === 1) return `ФОП 1 групи платить фіксований ЄП ${EP_FIXED.group1.toLocaleString('uk-UA')} грн/міс + ЄСВ ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс = ${(EP_FIXED.group1 + ESV_MONTHLY).toLocaleString('uk-UA')} грн/міс. Найнижче навантаження серед усіх груп.${getEmailBridge(p)}`;
    if (p.type === "tov" && p.taxSystem === "general") return `ТОВ на загальній системі: податок на прибуток 18% + ПДВ 20%. FINTODO веде повний бухоблік та формує усю звітність автоматично.${getEmailBridge(p)}`;
    return `Стандартна ставка для фізосіб: ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}% = ${TOTAL_RATE}%. Але є пільги та знижки — розкажу детальніше, якщо уточните тип доходу.${getEmailBridge(p)}`;
  },
  зменш: (p) => {
    if (p.type === "fop") return `Легальні способи оптимізації для ФОП: (1) правильний вибір групи, (2) контроль ліміту доходу, (3) використання витрат для 3 групи з ПДВ, (4) своєчасна подача звітів без штрафів.${getEmailBridge(p)}`;
    return `Для фізосіб є податкова знижка: повернення ПДФО за витрати на навчання, лікування, іпотеку. Також є пільги для інвесторів в ОВДП. FINTODO розрахує максимальне повернення.${getEmailBridge(p)}`;
  },
  // (removed dead "штраф" handler — "отримання штрафу" covers this via KEYWORD_MAP)
  банк: (p) => `Підключення банку до FINTODO: Monobank — через API за 1 хв, ПриватБанк — через Приват24, інші банки — через завантаження виписок. Всі транзакції класифікуються автоматично.${getEmailBridge(p)}`,
  єсв: (p) => {
    if (p.type === "fop") return `ЄСВ для ФОП — мінімум 22% від мінімальної зарплати = ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс. Сплачується щоквартально до 19 числа наступного місяця після кварталу. FINTODO формує платіжки автоматично.${getEmailBridge(p)}`;
    return `ЄСВ утримується роботодавцем автоматично. Для фізосіб-підприємців — мінімум ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс.${getEmailBridge(p)}`;
  },
  "єдиний податок ФОП": (p) => {
    if (p.type === "fop" && p.fopGroup === 3 && p.vatPayer === true) return `Єдиний податок для ФОП 3 групи з ПДВ — 3% від доходу, сплачується щоквартально протягом 10 к.д. після граничного строку подачі декларації. FINTODO нагадає дедлайн та сформує платіжку.${getEmailBridge(p)}`;
    if (p.type === "fop" && p.fopGroup === 3) return `Єдиний податок для ФОП 3 групи — 5% від доходу, сплачується щоквартально протягом 10 к.д. після граничного строку подачі декларації. FINTODO нагадає дедлайн та сформує платіжку.${getEmailBridge(p)}`;
    if (p.type === "fop" && p.fopGroup === 2) return `Єдиний податок для ФОП 2 групи — фіксований ${EP_FIXED.group2.toLocaleString('uk-UA')} грн/міс, сплачується щомісячно до 20 числа. FINTODO нагадає та сформує платіжку.${getEmailBridge(p)}`;
    if (p.type === "fop" && p.fopGroup === 1) return `Єдиний податок для ФОП 1 групи — фіксований ${EP_FIXED.group1.toLocaleString('uk-UA')} грн/міс, сплачується щомісячно до 20 числа. FINTODO нагадає та сформує платіжку.${getEmailBridge(p)}`;
    return `Єдиний податок залежить від групи ФОП: 1 група — ${EP_FIXED.group1.toLocaleString('uk-UA')} грн/міс, 2 група — ${EP_FIXED.group2.toLocaleString('uk-UA')} грн/міс, 3 група — 5% (або 3% з ПДВ) від доходу. FINTODO автоматично розраховує суму та нагадує про дедлайни.${getEmailBridge(p)}`;
  },

  // ── Дохід, ліміти, перевірки ──

  "ліміт ЄП": (p) => {
    if (p.type === "fop" && p.fopGroup === 3)
      return `📊 Ліміт для ФОП 3 групи — ${FOP_LIMIT_MULTIPLIERS.group3} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[3])} у ${CURRENT_TAX_YEAR} р.).\n\nFINTODO автоматично відстежує ваш дохід та попереджає при досягненні 80% і 95% ліміту. На основі банківської виписки ми розрахуємо точну дату можливого перевищення та запропонуємо план дій.\n\n🔁 Зареєструйтесь, щоб отримати точний прогноз перевищення ліміту на підставі реальних даних.`;
    if (p.type === "fop" && p.fopGroup === 2)
      return `📊 Ліміт для ФОП 2 групи — ${FOP_LIMIT_MULTIPLIERS.group2} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[2])} у ${CURRENT_TAX_YEAR} р.).\n\nFINTODO контролює ваш дохід наростаючим підсумком і попереджає при 80% та 95% ліміту. При перевищенні — автоматично розрахує податкові наслідки переходу на загальну систему.\n\n🔁 Зареєструйтесь, щоб отримати автоматичний контроль ліміту.`;
    if (p.type === "fop" && p.fopGroup === 1)
      return `📊 Ліміт для ФОП 1 групи — ${FOP_LIMIT_MULTIPLIERS.group1} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[1])} у ${CURRENT_TAX_YEAR} р.).\n\nFINTODO відстежує ваш дохід та попереджає при наближенні до ліміту. Якщо ви близькі до перевищення — порадимо перехід на 2 або 3 групу з розрахунком різниці в податках.\n\n🔁 Зареєструйтесь для автоматичного контролю ліміту.`;
    return `📊 Ліміт ЄП залежить від групи:\n• 1 група — ${FOP_LIMIT_MULTIPLIERS.group1} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[1])})\n• 2 група — ${FOP_LIMIT_MULTIPLIERS.group2} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[2])})\n• 3 група — ${FOP_LIMIT_MULTIPLIERS.group3} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[3])})\n\nFINTODO автоматично відстежує дохід та попереджає при наближенні до ліміту.\n\n🔁 Зареєструйтесь, щоб контролювати ліміт у реальному часі.`;
  },

  "перевірка ДПС": (_p) => {
    return `Перевірка ризику потрапляння до плану перевірок ДПС — це функція повної версії FINTODO. Після реєстрації ви зможете:\n\n— Оцінити ваш ризик за 12+ факторами (концентрація доходу, збитковість, невідповідності)\n— Отримати персональний аудит з рекомендаціями по зниженню ризику\n— Моніторити зміни в реальному часі\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
  },

  "валютний дохід": (p) => {
    const base = "💱 Валютний дохід ФОП визначається за курсом НБУ на дату зарахування коштів на розподільчий рахунок.\n\nВажливо: подальший продаж валюти НЕ створює нового доходу — це лише конвертація вже зарахованого доходу.\n\nПриклад: отримано $1 000 — 12 березня (курс 41.25) → дохід = 41 250 грн. Продаж цих доларів 15 березня за 41 800 грн — не є додатковим доходом.";
    if (p.type === "fop")
      return base + `\n\nFINTODO автоматично фіксує курс НБУ на дату зарахування для ФОП ${p.fopGroup || ""} групи та коректно відображає валютні операції в Книзі обліку доходів.\n\n🔁 Зареєструйтесь, щоб автоматизувати валютний облік.`;
    return base + "\n\n🔁 Зареєструйтесь, щоб автоматизувати облік валютних операцій.";
  },

  "продаж валюти": () => {
    return "💱 Продаж валюти з вашого рахунку — це конвертація власних коштів, а не новий дохід.\n\nЯкщо ви раніше отримали валюту як дохід — він уже був зафіксований за курсом НБУ на дату зарахування. Гривня, отримана від продажу, не включається в Книгу обліку доходів повторно.\n\nFINTODO автоматично розпізнає конвертаційні операції та виключає їх з доходу.\n\n🔁 Зареєструйтесь, щоб FINTODO автоматично перевірив усі ваші валютні операції.";
  },

  "переказ між рахунками": () => {
    return "🔄 Переказ між власними рахунками (навіть у різних банках) — це внутрішній рух коштів, а НЕ дохід.\n\nТакі операції не включаються в Книгу обліку доходів і не впливають на базу оподаткування.\n\nFINTODO автоматично розпізнає перекази між вашими рахунками та виключає їх з доходу, щоб уникнути завищення.\n\n🔁 Зареєструйтесь, щоб автоматично виключати внутрішні перекази з доходу.";
  },

  "повернення клієнту": (p) => {
    const base = "↩️ Повернення коштів клієнту — це коригування доходу.\n\nСума повернення зменшує дохід того періоду, в якому було здійснено повернення. Це відображається в Книзі обліку доходів зі знаком «мінус» або як окреме коригування.";
    if (p.type === "fop")
      return base + `\n\nДля ФОП ${p.fopGroup || ""} групи FINTODO автоматично зменшує суму доходу при поверненні та коригує суму ЄП за відповідний квартал.\n\n🔁 Зареєструйтесь, щоб автоматизувати облік повернень та коригування декларації.`;
    return base + "\n\n🔁 Зареєструйтесь, щоб FINTODO автоматично обробляв повернення.";
  },

  "повернення від постачальника": () => {
    return "↩️ Повернення коштів від постачальника (refund) — це повернення ВАШИХ раніше витрачених коштів. Воно НЕ є доходом і НЕ включається в Книгу обліку доходів.\n\nFINTODO автоматично розпізнає такі операції за призначенням платежу та виключає їх із доходу.\n\n🔁 Зареєструйтесь, щоб FINTODO перевірив усі ваші повернення за рік та виключив їх з доходу.";
  },

  "еквайринг": (p) => {
    const base = "💳 При оплаті через еквайринг (термінал або онлайн) банк утримує комісію (зазвичай 1.5–3%). На рахунок надходить менша сума, АЛЕ доходом є ПОВНА сума покупки.\n\nПриклад: клієнт оплатив 10 000 грн, комісія 2% (200 грн), на рахунок надійшло 9 800 грн. У Книгу обліку доходів записуємо 10 000 грн.";
    if (p.type === "fop" && p.fopGroup === 3)
      return base + "\n\nДля ФОП 3 групи ЄП 5% нараховується на повну суму (10 000 грн), а не на отриману (9 800 грн). FINTODO автоматично відновлює повну суму (gross) та правильно розраховує ЄП.\n\n🔁 Зареєструйтесь, щоб налаштувати автоматичний облік еквайрингу.";
    return base + "\n\nFINTODO автоматично відновлює повну суму та правильно відображає її в обліку.\n\n🔁 Зареєструйтесь, щоб налаштувати еквайринг у FINTODO.";
  },

  "передоплата": (p) => {
    const base = "💰 Передоплата (аванс) є доходом на дату її отримання — незалежно від того, коли буде виконано роботу чи поставлено товар.\n\nЦе правило діє для всіх ФОП на спрощеній системі: дохід визначається за касовим методом (дата надходження коштів).";
    if (p.type === "fop")
      return base + `\n\nДля ФОП ${p.fopGroup || ""} групи FINTODO автоматично фіксує дату отримання авансу як дату доходу та включає його в декларацію за відповідний квартал.\n\n🔁 Зареєструйтесь, щоб автоматично відстежувати авансові надходження.`;
    return base + "\n\n🔁 Зареєструйтесь, щоб FINTODO автоматично обліковував передоплати.";
  },

  "часткове повернення": (p) => {
    const base = "📦 Часткове повернення товару — дохід зменшується на суму повернення.\n\nFINTODO знаходить відповідне надходження, зіставляє суму повернення та автоматично коригує Книгу обліку доходів та декларацію за відповідний період.";
    if (p.type === "fop")
      return base + `\n\nДля ФОП ${p.fopGroup || ""} групи це означає зменшення бази для розрахунку ЄП. Якщо повернення стосується минулого кварталу — подається уточнюючий розрахунок.\n\n🔁 Зареєструйтесь, щоб автоматизувати обробку часткових повернень.`;
    return base + "\n\n🔁 Зареєструйтесь для автоматичного обліку повернень товарів.";
  },

  // ── РРО, Банки, Фінмоніторинг (сценарії 11-20) ──

  "ПРРО": (p) => {
    if (p.type === "fop") {
      const groupNote = p.fopGroup === 1
        ? "Для ФОП 1 групи ПРРО обов'язковий при торгівлі на ринках (крім продажу власної с/г продукції)."
        : `Для ФОП ${p.fopGroup || ""} групи ПРРО обов'язковий у таких випадках:\n• Роздрібна торгівля\n• Ресторанний бізнес (HoReCa)\n• Надання побутових послуг населенню\n• Дохід понад ${FOP_LIMIT_MULTIPLIERS.group3} МЗП (${formatTaxCurrency(FOP_INCOME_LIMITS[3])} у ${CURRENT_TAX_YEAR} р.) незалежно від виду діяльності`;
      return `📱 ${groupNote}\n\nВинятки (ПРРО не потрібен): дистанційна торгівля з оплатою на рахунок, послуги для юросіб з безготівковою оплатою.\n\nFINTODO допоможе визначити, чи обов'язковий для вас ПРРО, та автоматизувати фіскальний облік.\n\n🔁 Зареєструйтесь, щоб автоматизувати облік ПРРО.`;
    }
    return "📱 ПРРО (програмний реєстратор розрахункових операцій) обов'язковий для суб'єктів господарювання, які здійснюють розрахунки з населенням готівкою або платіжними картками.\n\nОбов'язковість залежить від виду діяльності, форми розрахунків та обсягу доходу.\n\n🔁 Зареєструйтесь, щоб FINTODO перевірив, чи потрібен вам ПРРО.";
  },

  "готівковий дохід": (p) => {
    const base = "💵 Готівкові надходження є доходом ФОП і підлягають обліку. Якщо ви приймаєте готівку від клієнтів — обов'язково проводьте через ПРРО (якщо він вам потрібен).\n\nГотівку потрібно вносити на підприємницький рахунок у банку для коректного відображення в обліку.";
    if (p.type === "fop")
      return base + `\n\nДля ФОП ${p.fopGroup || ""} групи FINTODO фіксує готівкові надходження, контролює наявність фіскального чека та відображає їх у Книзі обліку доходів.\n\n🔁 Зареєструйтесь, щоб налаштувати готівковий облік.`;
    return base + "\n\n🔁 Зареєструйтесь, щоб налаштувати облік готівкових операцій.";
  },

  "розбіжність ПРРО": (_p) => {
    return `Звірка ПРРО з банківською випискою — це функція повної версії FINTODO. Після реєстрації ви зможете:\n\n— Автоматично зіставити кожен фіскальний чек з банківським надходженням\n— Виявити розбіжності (комісія еквайра, повернення, зміщення по даті)\n— Отримати звіт з поясненням кожної невідповідності\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
  },

  "блокування банком": (p) => {
    return "🔒 Банк може заблокувати рахунок або операцію з кількох причин:\n\n• Фінансовий моніторинг — нетипова сума або контрагент\n• Відсутність підтверджуючих документів\n• Операції з «високоризиковими» країнами\n• Великий обсяг готівкових операцій\n\nДля розблокування зазвичай потрібні:\n📄 Договір з контрагентом\n📄 Акт виконаних робіт / видаткова накладна\n📄 Виписка з ЄДР / свідоцтво ФОП\n📄 Податкова декларація за останній період\n\nFINTODO допоможе швидко сформувати пакет документів для банку.\n\n🔁 Зареєструйтесь, щоб сформувати пакет документів для розблокування.";
  },

  "особиста картка": (p) => {
    return `⚠️ Отримання підприємницького доходу на особисту картку фізособи — серйозний ризик:\n\n• Штраф від ДПС за порушення порядку розрахунків\n• Банк може заблокувати картку за підозрілі операції\n• Ризик донарахування ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}% на всю суму\n• Неможливість підтвердити підприємницький характер доходу\n\nРекомендація: відкрийте підприємницький рахунок (це безкоштовно у більшості банків) та переведіть усі розрахунки на нього.\n\nFINTODO допоможе підключити підприємницький рахунок та налаштувати автоматичний облік.\n\n🔁 Зареєструйтесь, щоб підключити підприємницький рахунок.`;
  },

  "кілька банків": (p) => {
    return "🏦 Робота через кілька банків — звична практика, але є нюанси:\n\n• Перекази між власними рахунками НЕ є доходом — їх потрібно виключати\n• Важливо синхронізувати виписки з усіх банків, щоб не пропустити надходження\n• Дублювання доходу при переказах — найчастіша помилка\n\nFINTODO підключає всі ваші банки (моно, Приват, ПУМБ, Ощад та інші) в єдиний кабінет, автоматично виключає внутрішні перекази та формує повну картину доходів.\n\n🔁 Зареєструйтесь, щоб підключити всі банки в єдиний кабінет.";
  },

  "без призначення": (p) => {
    return "❓ Платіж без призначення або з невизначеним призначенням — це ризик:\n\n• ДПС може включити його в дохід ФОП, навіть якщо це не оплата за послуги\n• Банк може запросити пояснення в рамках фінмоніторингу\n• Складно довести, що це НЕ дохід (повернення, переказ тощо)\n\nРекомендація: зв'яжіться з відправником і попросіть уточнити призначення. Якщо це оплата — відновіть зв'язок із договором/рахунком.\n\nFINTODO виявляє всі операції без призначення та допомагає їх класифікувати.\n\n🔁 Зареєструйтесь, щоб перевірити операції без призначення.";
  },

  "дроблення платежів": (p) => {
    return "⚡ Дроблення платежів — коли один контрагент сплачує кількома частинами замість однієї суми. Це може привернути увагу ДПС:\n\n• Якщо загальна сума перевищує 50 000 грн — банк зобов'язаний перевірити\n• ДПС може розцінити як спробу уникнення фінмоніторингу\n• Регулярні однакові суми (наприклад, 49 000 грн) — «червоний прапорець»\n\nРекомендації:\n✅ Оформлюйте один договір на повну суму\n✅ В призначенні платежу вказуйте номер договору\n✅ Зберігайте акти та рахунки\n\nFINTODO аналізує структуру ваших надходжень та попереджає про ризики дроблення.\n\n🔁 Зареєструйтесь, щоб провести аналіз структури платежів.";
  },

  "концентрація доходу": (p) => {
    return `🎯 Якщо 75% і більше вашого доходу надходить від одного контрагента — є ризик перекваліфікації у трудові відносини:\n\n• ДПС може визнати вас найманим працівником цього контрагента\n• Наслідки: донарахування ПДФО ${PIT_RATE}%, ВЗ ${VZ_RATE}%, ЄСВ ${TAX_RATES.esv * 100}% — на всю суму\n• Особливо ризиковано при щомісячних однакових сумах\n\nОзнаки «трудових відносин» за критеріями ДПС:\n❌ Фіксований графік роботи\n❌ Підпорядкування замовнику\n❌ Використання обладнання замовника\n❌ Регулярні однакові виплати\n\nРекомендація: диверсифікуйте клієнтську базу або документально підтвердіть підрядний характер відносин.\n\n🔁 Зареєструйтесь, щоб провести аналіз структури доходу та оцінити ризики.`;
  },

  "фінансова допомога": (p) => {
    return "🤝 Фінансова допомога буває двох видів:\n\n📌 Поворотна фінансова допомога:\n• НЕ є доходом, якщо повертається протягом 12 місяців\n• Якщо не повернута вчасно — включається в дохід ФОП\n• Договір позики обов'язковий!\n\n📌 Безповоротна фінансова допомога:\n• Є доходом на дату отримання\n• Включається в Книгу обліку доходів\n• Оподатковується ЄП за ставкою вашої групи\n\n⚠️ Важливо: поворотна фіндопомога від засновника для ТОВ та від третіх осіб для ФОП має різне оподаткування.\n\nFINTODO відстежує строки повернення та попереджає за 30 днів до закінчення 12-місячного терміну.\n\n🔁 Зареєструйтесь, щоб перевірити статус фінансових допомог.";
  },

  // === Міжнародні платежі (сценарії 21-30) ===

  "Payoneer": (p) => {
    const personalization = p.type === "fop" ? `Як ФОП${p.fopGroup ? ` ${p.fopGroup} групи` : ""}, ` : "";
    return `💳 ${personalization}дохід від Payoneer виникає на дату зарахування коштів на ваш банківський рахунок ФОП:\n\n• Дата доходу — саме зарахування на рахунок в українському банку, НЕ дата оплати клієнтом\n• Курс — за офіційним курсом НБУ на дату зарахування\n• Комісія Payoneer НЕ зменшує суму доходу — у КОД вказується повна сума\n• Виведення на рахунок ФОП: Payoneer → банк → дохід\n\n⚠️ Якщо виводите на особисту картку — це порушення!\n\nFINTODO автоматично визначає курс НБУ та розраховує дохід від Payoneer.\n\n🔁 Зареєструйтесь, щоб автоматизувати облік Payoneer.`;
  },

  "PayPal": (p) => {
    const personalization = p.type === "fop" ? `Для ФОП${p.fopGroup ? ` ${p.fopGroup} групи` : ""}: ` : "";
    return `💳 ${personalization}дата доходу від PayPal визначається доступністю коштів:\n\n• Дата доходу — момент, коли кошти стали доступні на вашому PayPal-акаунті\n• Курс НБУ застосовується на дату виведення коштів на рахунок ФОП\n• PayPal не має ліцензії НБУ — пряме отримання на PayPal може мати обмеження\n• Комісія PayPal НЕ зменшує дохід\n\n⚠️ Рекомендація: виводьте кошти з PayPal на підприємницький рахунок якнайшвидше.\n\nFINTODO допоможе коректно обліковувати PayPal-доходи.\n\n🔁 Зареєструйтесь, щоб підключити облік PayPal.`;
  },

  "Upwork": (p) => {
    const personalization = p.type === "fop" ? `Як ФОП${p.fopGroup ? ` ${p.fopGroup} групи` : ""}, ` : "";
    return `💼 ${personalization}дохід від Upwork виникає на дату зарахування на ваш рахунок ФОП:\n\n• Дата доходу — зарахування на банківський рахунок, НЕ дата виконання контракту\n• Комісія Upwork (10-20%) НЕ зменшує дохід — у КОД повна сума до утримання комісії\n• Курс НБУ — на дату зарахування на рахунок\n• Upwork → Payoneer → банк ФОП — дохід на останньому етапі\n\n📌 Приклад: клієнт заплатив $1000, Upwork утримав $200 комісії. У КОД — $1000 × курс НБУ.\n\nFINTODO автоматично враховує повну суму контракту.\n\n🔁 Зареєструйтесь, щоб автоматизувати облік фрілансу.`;
  },

  "криптовалюта": (p) => {
    return "⚠️ Криптовалюта для ФОП має значні правові ризики:\n\n• Станом на 2025 рік правовий статус криптовалюти в Україні не повністю врегульований\n• Отримання оплати в крипті як ФОП — ризик перевірок ДПС\n• Конвертація крипти в гривню — може бути визнана доходом\n• Немає офіційного курсу НБУ для криптовалют\n\n📌 Що потрібно врахувати:\n❓ Як саме отримуєте крипту — напряму чи через біржу?\n❓ Чи конвертуєте в фіат?\n❓ Чи є документальне підтвердження операцій?\n\nРекомендація: отримайте індивідуальну консультацію щодо оподаткування криптовалютних операцій.\n\n🔁 Зареєструйтесь, щоб отримати персональну консультацію щодо криптовалюти.";
  },

  "грант": (p) => {
    const personalization = p.type === "fop" ? "Для ФОП" : p.type === "tov" ? "Для ТОВ" : "Для вас";
    return `🎓 ${personalization} оподаткування гранту залежить від умов договору:\n\n📌 Цільовий грант (на конкретний проект):\n• Може бути звільнений від ЄП за умови цільового використання\n• Потрібен звіт про використання коштів\n\n📌 Нецільовий грант:\n• Включається в дохід на дату отримання\n• Оподатковується ЄП за ставкою групи\n\n📌 Безповоротна фінансова допомога (грант):\n• Є доходом ФОП\n• Поворотна — не є доходом при поверненні протягом 12 місяців\n\n⚠️ Ключове: уважно читайте грантову угоду — саме вона визначає режим оподаткування.\n\nFINTODO допоможе правильно класифікувати грантові надходження.\n\n🔁 Зареєструйтесь, щоб перевірити грантову угоду.`;
  },

  "продаж за кордон": (p) => {
    const personalization = p.type === "fop" ? `Як ФОП${p.fopGroup ? ` ${p.fopGroup} групи` : ""}, ` : "";
    return `🌍 ${personalization}продаж за кордон — валютний дохід за курсом НБУ:\n\n• Дата доходу — зарахування валюти на рахунок ФОП\n• Курс — офіційний курс НБУ на дату зарахування\n• Валютний контроль: строк розрахунків — 365 днів з дати митного оформлення\n• Обов'язково: зовнішньоекономічний договір (контракт)\n\n📌 Для послуг (IT, консалтинг):\n• Акт виконаних робіт або інвойс\n• Валютний нагляд банку\n\n📌 Для товарів:\n• Митна декларація\n• Сертифікати відповідності (за потреби)\n\nFINTODO автоматично конвертує валютний дохід за курсом НБУ.\n\n🔁 Зареєструйтесь, щоб автоматизувати облік експорту.`;
  },

  "переказ між валютними рахунками": (p) => {
    return "🔄 Переказ між вашими валютними рахунками — це внутрішній рух коштів, НЕ дохід:\n\n• Переказ USD → USD між вашими рахунками — не дохід\n• Переказ EUR → EUR між вашими рахунками — не дохід\n• Аналогічно до переказу між гривневими рахунками\n\n⚠️ Важливо відрізняти:\n✅ Переказ між своїми рахунками — НЕ дохід\n❌ Продаж валюти (конвертація USD → UAH) — теж НЕ дохід для спрощеної системи\n❌ Отримання валюти від клієнта — ДОХІД\n\nFINTODO автоматично виключає внутрішні перекази з доходу.\n\n🔁 Зареєструйтесь, щоб автоматично виключати внутрішні перекази з доходу.";
  },

  "курсові різниці": (p) => {
    const isFop = p.type === "fop";
    const isTov = p.type === "tov";
    if (isTov) {
      return "📊 Для ТОВ курсові різниці відображаються в бухгалтерському обліку:\n\n• Позитивна курсова різниця — інший операційний дохід\n• Від'ємна курсова різниця — інші операційні витрати\n• Перерахунок — на дату балансу та на дату операції\n• Впливає на фінансовий результат до оподаткування\n\nFINTODO автоматично розраховує курсові різниці для ТОВ.\n\n🔁 Зареєструйтесь, щоб перевірити валютні операції.";
    }
    return "📊 Для ФОП на спрощеній системі курсові різниці НЕ впливають на Книгу обліку доходів:\n\n• Дохід фіксується за курсом НБУ на дату зарахування — і все\n• Подальші зміни курсу не змінюють суму доходу в КОД\n• Перерахунок залишків на валютних рахунках не потрібний\n\n📌 Приклад: отримали $1000 при курсі 41 грн = дохід 41 000 грн. Якщо завтра курс став 42 грн — дохід залишається 41 000 грн.\n\n⚠️ Для ФОП на загальній системі правила інші — курсові різниці враховуються.\n\nFINTODO фіксує курс НБУ автоматично на дату кожної операції.\n\n🔁 Зареєструйтесь, щоб перевірити валютні операції.";
  },

  "комісія платформи": (p) => {
    return "💰 Комісія іноземної платформи (Upwork, Fiverr, Payoneer тощо) НЕ зменшує дохід ФОП:\n\n• У Книгу обліку доходів записується ПОВНА сума до утримання комісії\n• Комісія платформи — це витрати ФОП, які не впливають на дохід на спрощеній системі\n\n📌 Приклади:\n• Upwork: клієнт заплатив $1000, комісія 20% ($200) → у КОД $1000\n• Fiverr: замовлення $500, комісія 20% ($100) → у КОД $500\n• Payoneer: виведення $800, комісія 2% ($16) → у КОД $800\n\n⚠️ Типова помилка: записувати в КОД суму «на руки» замість повної суми.\n\nFINTODO автоматично враховує повну суму доходу до комісій.\n\n🔁 Зареєструйтесь, щоб перевірити суми доходу.";
  },

  "SWIFT-комісія": (p) => {
    return "🏦 Банківська SWIFT-комісія за міжнародний переказ НЕ зменшує дохід ФОП:\n\n• У КОД записується повна сума, відправлена клієнтом\n• Комісія банку-відправника та банку-отримувача — це банківські витрати\n• Навіть якщо на рахунок зараховано менше через комісію — дохід = повна сума\n\n📌 Приклад: клієнт відправив $5000, SWIFT-комісія $30, на рахунок зараховано $4970. У КОД — $5000 × курс НБУ.\n\n⚠️ Перевірте виписку SWIFT (MT103) — там вказана повна сума переказу.\n\nFINTODO автоматично визначає повну суму переказу з урахуванням SWIFT-комісій.\n\n🔁 Зареєструйтесь, щоб перевірити всі комісії.";
  },

  // === СТРУКТУРА БІЗНЕСУ (31-40) ===

  "зміна групи ЄП": (p) => {
    const group = p.fopGroup || 3;
    return `🔄 Зміна групи єдиного податку — порівняння навантаження:\n\n📊 Групи ЄП:\n• 1 група: ${TAX_RATES.epGroup1 * 100}% від МЗП (${EP_FIXED.group1} грн/міс), ліміт ${formatTaxCurrency(FOP_INCOME_LIMITS[1])}\n• 2 група: ${TAX_RATES.epGroup2 * 100}% від МЗП (${EP_FIXED.group2} грн/міс), ліміт ${formatTaxCurrency(FOP_INCOME_LIMITS[2])}\n• 3 група: ${TAX_RATES.epGroup3_withoutVat * 100}% від доходу (без ПДВ), ліміт ${formatTaxCurrency(FOP_INCOME_LIMITS[3])}\n\n📝 Як перейти:\n• Подати заяву до ДПС до 15 числа місяця, що передує кварталу переходу\n• Перехід діє з 1-го числа наступного кварталу\n• Через Дію або електронний кабінет ДПС\n\n💡 Коли вигідно змінити:\n• Якщо дохід зростає — перехід на вищу групу до перевищення ліміту\n• Якщо дохід падає — перехід на нижчу групу для економії\n\nВи зараз на ${group} групі. FINTODO розрахує оптимальну групу для вашого обсягу доходу.\n\n${getEmailBridge(p)}`;
  },

  "перехід на ТОВ": (p) => {
    return `🏢 Порівняння ФОП vs ТОВ — податкове навантаження:\n\n📊 ФОП (спрощена система):\n• ЄП: ${TAX_RATES.epGroup3_withoutVat * 100}% від доходу (3 група)\n• ЄСВ: ${ESV_MONTHLY} грн/міс (фіксований)\n• Військовий збір: ${TAX_RATES.militaryTax * 100}% від доходу\n• Простий облік, менше звітності\n\n📊 ТОВ (загальна система):\n• Податок на прибуток: 18% від прибутку\n• ПДВ: 20% (якщо платник)\n• Дивіденди: 5% ПДФО + ${VZ_RATE}% ВЗ\n• Повний бухоблік, більше звітності\n\n📊 ТОВ (спрощена, 3 група):\n• ЄП: 5% від доходу\n• Менше звітності ніж на загальній\n\n💡 Коли вигідно перейти на ТОВ:\n• Потрібні інвестори або партнери\n• Тендери та держзакупівлі\n• Обмежена відповідальність\n• Великі обсяги (понад ${formatTaxCurrency(FOP_INCOME_LIMITS[3])})\n\n⚠️ Витрати на реєстрацію ТОВ: від 3 000 грн (з нотаріусом).\n\nFINTODO порівняє податкове навантаження для вашого обсягу.\n\n${getEmailBridge(p)}`;
  },

  "перевищення ліміту": (p) => {
    const group = p.fopGroup || 3;
    const limit = FOP_INCOME_LIMITS[group as 1 | 2 | 3] || FOP_INCOME_LIMITS[3];
    return `⚠️ Перевищення ліміту доходу ФОП — наслідки:\n\n📊 Ваш ліміт (${group} група): ${formatTaxCurrency(limit)}\n\n❗ Що відбувається при перевищенні:\n• На суму перевищення — штраф 15% (замість звичайної ставки ЄП)\n• Обов'язковий перехід на іншу систему з 1-го числа наступного кварталу\n• Для 1-2 групи: можна перейти на 3 групу\n• Для 3 групи: перехід на загальну систему\n\n📝 Що робити:\n1. Подати заяву про перехід протягом 20 днів з дня перевищення\n2. Сплатити 15% з суми перевищення\n3. Подати декларацію за період\n\n💡 Профілактика:\n• Моніторте наростаючий дохід щомісяця\n• Плануйте перехід заздалегідь (до перевищення)\n\nFINTODO відстежує ваш дохід і попередить про наближення до ліміту.\n\n${getEmailBridge(p)}`;
  },

  "зміна КВЕД": (p) => {
    return `🆕 Додавання або зміна КВЕД для ФОП:\n\n📝 Процедура:\n• Через портал Дія — безкоштовно, онлайн\n• Через електронний кабінет ДПС\n• Через ЦНАП — особисто\n• Строк: зміни набувають чинності з дня внесення до реєстру\n\n⚠️ Обмеження за групами:\n• 1 група: лише роздрібна торгівля на ринках та побутові послуги населенню\n• 2 група: обмежений перелік послуг (тільки населенню та ЄП)\n• 3 група: будь-яка незаборонена діяльність\n\n📌 Важливо:\n• Дохід за незареєстрованим КВЕД — ризик втрати статусу ЄП\n• Деякі КВЕДи заборонені для спрощеної системи (фінансові послуги, виробництво підакцизних товарів тощо)\n• Можна мати необмежену кількість КВЕДів\n\nFINTODO перевірить ваші КВЕДи на відповідність групі.\n\n${getEmailBridge(p)}`;
  },

  "продаж основного засобу": (p) => {
    return `🏗️ Продаж основного засобу ФОП — вплив на дохід:\n\n📊 Правила:\n• Дохід від продажу включається в Книгу обліку доходів за ПОВНОЮ вартістю продажу\n• Залишкова балансова вартість НЕ віднімається (для спрощеної системи)\n• Ця сума враховується у ліміті доходу ФОП\n\n📌 Приклад:\n• Купили обладнання за 200 000 грн\n• Продали за 150 000 грн\n• У КОД записуєте 150 000 грн доходу\n• Ця сума входить у ліміт ${formatTaxCurrency(FOP_INCOME_LIMITS[p.fopGroup as 1 | 2 | 3] || FOP_INCOME_LIMITS[3])}\n\n⚠️ Ризики:\n• Продаж дорогого ОЗ може наблизити до ліміту\n• Продаж нерухомості чи авто — особливі правила\n• Безоплатна передача = дохід за звичайною ціною\n\nFINTODO розрахує вплив продажу на ваш ліміт.\n\n${getEmailBridge(p)}`;
  },

  "продаж авто": (p) => {
    return `🚗 Продаж авто фізичною особою — податки:\n\n📊 Правила (ст. 173 ПКУ):\n• Перший продаж легкового авто за рік — **0% ПДФО** (звільнення від оподаткування)\n• Другий продаж за рік — ПДФО 5% + ВЗ ${VZ_RATE}%\n• Третій і далі — ПДФО 18% + ВЗ ${VZ_RATE}%\n\n📌 Важливо:\n• Договір купівлі-продажу завіряється нотаріально\n• Нотаріус утримує податок (якщо є) та подає дані до ДПС\n• Оцінка вартості — за експертною оцінкою або за ціною договору\n• Авто, що перебувало у власності менше 3 років — може підлягати додатковим перевіркам\n\n💡 Порада:\n• Плануйте продажі — один авто на рік без податку\n• Зберігайте документи про придбання\n\nFINTODO допоможе розрахувати податок та підготувати декларацію.\n\n${getEmailBridge(p)}`;
  },

  "робота без договору": (p) => {
    return `📋 Робота без письмового договору — ризики для ФОП:\n\n❗ Основні ризики:\n• Немає доказів умов співпраці (ціна, строки, обсяг)\n• Проблеми з отриманням оплати — складно довести борг\n• ДПС може поставити під сумнів реальність операції\n• Неможливо підтвердити дату виникнення доходу\n\n📊 Що каже закон:\n• Усний договір дійсний для сум до ~3 400 грн (1 неоподатковуваний мінімум × 20)\n• Для більших сум — обов'язкова письмова форма\n• Без договору складно захистити свої права в суді\n\n📝 Рекомендація:\n• Завжди укладайте письмовий договір або рахунок-оферту\n• Мінімум: рахунок + акт виконаних робіт\n• Для регулярних клієнтів — рамковий договір\n\nFINTODO допоможе сформувати шаблон договору для вашої діяльності.\n\n${getEmailBridge(p)}`;
  },

  "ФОП за кордоном": (p) => {
    return `✈️ ФОП за кордоном — податкове резидентство:\n\n📊 Правило 183 днів:\n• Якщо перебуваєте за кордоном понад 183 дні на рік — ризик втрати податкового резидентства України\n• Центр життєвих інтересів також враховується (сім'я, житло, робота)\n\n❗ Наслідки зміни резидентства:\n• Втрата права на спрощену систему оподаткування\n• Необхідність сплачувати податки в країні резидентства\n• Можливе подвійне оподаткування (залежить від конвенцій)\n• ЄСВ — залишається обов'язковим, поки ФОП не закрито\n\n📝 Що робити:\n• Відстежуйте кількість днів перебування в Україні\n• Перевірте наявність конвенції про уникнення подвійного оподаткування\n• Зберігайте підтвердження зв'язку з Україною (реєстрація, рахунки, сім'я)\n\n⚠️ Закриття ФОП за кордоном можливе через електронний кабінет або представника за довіреністю.\n\nFINTODO допоможе перевірити ваш статус резидентства.\n\n${getEmailBridge(p)}`;
  },

  "втрата статусу ЄП": (p) => {
    return `🚫 Втрата статусу єдиноподатника — причини та наслідки:\n\n❗ Причини примусової втрати:\n• Перевищення ліміту доходу для групи\n• Заборонений вид діяльності (не відповідає КВЕДам)\n• Борг з ЄСВ понад 2 квартали поспіль\n• Несплата ЄП протягом 2 кварталів\n• Наявність податкового боргу на кожне 1 число місяця протягом 2 кварталів\n\n📊 Наслідки:\n• Автоматичний перехід на загальну систему оподаткування\n• ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}% від чистого доходу\n• Повний бухоблік витрат і доходів\n• Можливі штрафи за порушення\n\n📝 Відновлення:\n• Можна повернутися на спрощену систему з наступного кварталу\n• Подати заяву до 15 числа місяця перед кварталом\n• Усунути причину втрати (погасити борг, змінити КВЕД)\n\nFINTODO перевірить ваші ризики втрати статусу ЄП.\n\n${getEmailBridge(p)}`;
  },

  "неподана декларація": (p) => {
    return `📋 Неподана декларація ФОП — алгоритм дій:\n\n❗ Штрафи за неподачу:\n• Перше порушення: 340 грн\n• Повторне протягом року: 1 020 грн\n• Додатково: адміністративний штраф 51-136 грн\n\n📝 Алгоритм подачі уточнюючої:\n1. Підготувати Книгу обліку доходів за пропущений період\n2. Заповнити декларацію платника ЄП (форма Ф0301207)\n3. Подати через електронний кабінет ДПС\n4. Сплатити штраф + ЄП за пропущений період\n5. Сплатити пеню (при наявності)\n\n⏰ Строки давності:\n• ДПС може нарахувати штраф за останні 1 095 днів (3 роки)\n• Після 3 років — строк давності спливає\n\n⚠️ Важливо:\n• Краще подати із запізненням, ніж не подати взагалі\n• Самостійне виявлення помилки зменшує штрафи\n• ЄСВ теж потрібно сплатити за пропущений період\n\nFINTODO підготує уточнюючу декларацію автоматично.\n\n${getEmailBridge(p)}`;
  },

  "податковий борг": (p) => {
    return `💸 Податковий борг ФОП — наслідки та погашення:\n\n❗ Наслідки боргу:\n• Штраф: 10% від суми боргу (перші 30 днів), 20% (після 30 днів)\n• Пеня: 0.0411% за кожен день прострочення (120% облікової ставки НБУ / 365)\n• Блокування рахунків: ДПС має право арештувати кошти\n• Ризик втрати статусу ЄП при боргу понад 2 квартали\n\n📝 Алгоритм погашення:\n1. Перевірити суму боргу в електронному кабінеті ДПС\n2. Сформувати платіжку з правильними реквізитами\n3. Сплатити основну суму + штраф + пеню\n4. Зберегти квитанцію як підтвердження\n\n💡 Розстрочка:\n• Можна оформити розстрочку на термін до 24 місяців\n• Подати заяву до ДПС з обґрунтуванням\n• На час розстрочки пеня не нараховується\n\n⚠️ Не ігноруйте борг — він зростає щодня!\n\nFINTODO перевірить наявність боргу та допоможе сформувати платіж.\n\n${getEmailBridge(p)}`;
  },

  // ===== Сценарії 41-50: Контроль та аудит =====

  "аудит КОД": (_p) => {
    return `Аудит Книги обліку доходів — це функція повної версії FINTODO. Після реєстрації ви зможете:\n\n— Зіставити кожну транзакцію з банківської виписки із записами в КОД\n— Виявити пропущені записи, зайві суми та помилки в курсах валют\n— Отримувати щоденну автоматичну перевірку після підключення банку\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
  },

  "перевірка декларації": (_p) => {
    return `Перевірка декларації — це функція повної версії FINTODO. Після реєстрації ви зможете:\n\n— Завантажити декларацію та перевірити її на 50+ типових помилок\n— Зіставити суми з банківськими виписками автоматично\n— Перевірити правильність розрахунку ЄП, ЄСВ та ВЗ\n— Отримати конкретні рекомендації по виправленню перед подачею\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
  },

  "нульова декларація": (p) => {
    return `📄 Нульова декларація ФОП — обов'язкова навіть без доходу:\n\n❗ Головне правило:\n• Декларація подається ЗАВЖДИ, навіть якщо дохід = 0 грн\n• Неподача = штраф 340 грн (перше порушення), 1 020 грн (повторне)\n\n📝 Що вказувати:\n• Дохід: 0,00 грн\n• ЄП: 0,00 грн (для 3 групи) або фіксована сума (для 1-2 груп)\n• ЄСВ: сплачується НЕЗАЛЕЖНО від доходу — ${ESV_MONTHLY.toLocaleString('uk-UA')} ₴/міс\n\n⏰ Строки подачі:\n• За квартал — протягом 40 днів після закінчення кварталу (3 група)\n• За рік — до 9 лютого наступного року (1-2 група)\n\n⚠️ Навіть при нульовому доході:\n• ЄСВ ${ESV_QUARTERLY.toLocaleString('uk-UA')} ₴/квартал — обов'язковий\n• Книгу обліку доходів вести не потрібно, але зберігати\n\nFINTODO сформує нульову декларацію за 2 хвилини.\n\n${getEmailBridge(p)}`;
  },

  "закриття ФОП": (p) => {
    return `🔒 Закриття ФОП — покроковий алгоритм:\n\n📝 Порядок дій:\n1. Подати заяву про припинення (форма 8) — через Дію або ЦНАПом\n2. Подати останню декларацію за неповний період — протягом 30 днів\n3. Сплатити ЄП за фактичні дні роботи\n4. Сплатити ЄСВ до дня закриття включно\n5. Закрити банківські рахунки ФОП\n${p.vatPayer ? '6. Подати заяву на анулювання ПДВ-реєстрації\n7. Подати останню ПДВ-декларацію' : ''}\n\n💰 Фінансові зобов'язання:\n• ЄСВ: ${ESV_MONTHLY.toLocaleString('uk-UA')} ₴ × кількість повних місяців + пропорційно за неповний\n• ЄП: за фактичний період роботи\n• Штрафи/борги: погасити до закриття\n\n⏰ Терміни:\n• Реєстрація припинення — 1 робочий день\n• Зняття з обліку в ДПС — до 10 робочих днів\n• Декларація — 30 днів з дня припинення\n\n⚠️ Після закриття зберігайте документи ще 3 роки!\n\nFINTODO підготує всі документи для закриття ФОП.\n\n${getEmailBridge(p)}`;
  },

  "розбіжність з ДПС": (_p) => {
    return `Звірка даних з ДПС — це функція повної версії FINTODO. Після реєстрації ви зможете:\n\n— Автоматично порівняти ваші платежі з інтегрованою карткою платника\n— Виявити розбіжності в реквізитах, затримки обробки та помилки\n— Сформувати заяву на звірку з підтверджуючими документами\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
  },

  "отримання штрафу": (p) => {
    return `⚠️ Отримали штраф від ДПС — що робити:\n\n📋 Перевірка підстави:\n• Уважно прочитайте податкове повідомлення-рішення (ППР)\n• Перевірте підставу: стаття ПКУ та суму\n• Переконайтеся, що порушення дійсно мало місце\n\n⏰ Строки оскарження:\n• Адміністративне оскарження: 10 робочих днів з дня отримання ППР\n• Судове оскарження: 1 095 днів (3 роки)\n• Під час оскарження штраф НЕ сплачується\n\n📝 Адміністративне оскарження:\n1. Подати скаргу до вищого органу ДПС\n2. Додати документи-підтвердження\n3. Рішення — протягом 20 робочих днів\n\n💡 Пом'якшуючі обставини:\n• Перше порушення за рік\n• Самостійне виявлення помилки\n• Форс-мажорні обставини (війна, хвороба)\n• Незначна сума порушення\n\n⚠️ Не ігноруйте штраф — після 10 днів ППР набирає чинності!\n\nFINTODO перевірить підставу штрафу та порадить оптимальну стратегію.\n\n${getEmailBridge(p)}`;
  },

  "відсутність первинки": (p) => {
    return `📂 Чек-лист первинних документів ФОП:\n\n✅ Обов'язкові документи:\n• Книга обліку доходів (КОД) — заповнена щодня\n• Банківські виписки — за кожен місяць\n• Договори з контрагентами — на кожну послугу/товар\n• Акти виконаних робіт / наданих послуг\n• Рахунки-фактури (інвойси)\n${p.vatPayer ? '• Податкові накладні — зареєстровані в ЄРПН\n• Реєстр ПДВ-операцій' : ''}\n\n📋 Додаткові документи:\n• Квитанції про сплату ЄП та ЄСВ\n• Виписки з ЄДРПОУ\n• Копії КЕП-підписів\n• Листування з контрагентами (при спорах)\n\n❗ Наслідки відсутності при перевірці:\n• ДПС може визначити дохід розрахунковим методом\n• Штрафи за відсутність КОД: 510-1 020 грн\n• Неможливість підтвердити витрати (для 3 групи на загальній)\n• Ризик донарахування податків\n\n💡 Зберігайте документи мінімум 3 роки після звітного періоду!\n\nFINTODO сформує персональний чек-лист документів.\n\n${getEmailBridge(p)}`;
  },

  "велика одноразова сума": (p) => {
    const group = p.fopGroup || 3;
    const limit = FOP_INCOME_LIMITS[group as 1 | 2 | 3];
    return `💰 Велика одноразова сума — ризики та рекомендації:\n\n📊 Поріг фінмоніторингу:\n• Операції від 400 000 грн підлягають обов'язковому фінансовому моніторингу\n• Банк може запросити пояснення походження коштів\n\n❗ Ризики для ФОП:\n• Перевірка ДПС при різкому зростанні доходу\n• Наближення до ліміту групи: ${formatTaxCurrency(limit)} для ${group} групи\n• Підозра у дробленні бізнесу (якщо кілька ФОП)\n\n📝 Рекомендації:\n• Підготуйте договір на повну суму заздалегідь\n• Збережіть акт виконаних робіт з детальним описом\n• Забезпечте відповідність суми ринковим цінам\n• При наближенні до ліміту — розгляньте перехід на вищу групу\n\n💡 Документальне оформлення:\n• Договір з чітким предметом та сумою\n• Акт приймання-передачі\n• Рахунок-фактура\n• Підтвердження оплати (виписка)\n\nFINTODO перевірить ризики для вашого обсягу операцій.\n\n${getEmailBridge(p)}`;
  },

  "платежі від фізосіб": (p) => {
    const group = p.fopGroup || 3;
    return `👤 Платежі від фізичних осіб — правила для ФОП:\n\n✅ Основне правило:\n• Оплата від фізосіб — це звичайний дохід ФОП\n• ПДВ-ризику немає (фізособи не є платниками ПДВ)\n• Дохід включається в КОД на дату отримання коштів\n\n💳 Способи прийому оплати:\n• Безготівковий переказ на рахунок ФОП — без обмежень\n• Еквайринг (картковий термінал) — комісія 1.5-2.5%\n• Готівка — ОБОВ'ЯЗКОВИЙ ПРРО (програмний РРО) або РРО\n${group <= 2 ? `\n⚠️ Обмеження для ${group} групи:\n• Розрахунки лише в готівковій або безготівковій формі\n• Дохід від однієї фізособи не обмежений\n• Але загальний ліміт: ${formatTaxCurrency(FOP_INCOME_LIMITS[group as 1 | 2 | 3])}` : ''}\n\n📝 Обов'язки ФОП:\n• Видати фіскальний чек (при готівковій оплаті)\n• Записати в КОД в день отримання\n• Зберігати підтвердження оплати\n\n❗ Без ПРРО за готівку — штраф від 100% суми!\n\nFINTODO перевірить правила прийому оплат для вашої діяльності.\n\n${getEmailBridge(p)}`;
  },

  "податковий health-check": (_p) => {
    return `Податковий health-check — це комплексна перевірка за 7 напрямками у повній версії FINTODO. Після реєстрації система автоматично перевірить:\n\n— Контроль ліміту доходу (попередження на 80% та 95%)\n— Валютні операції, еквайринг, повернення коштів\n— Внутрішні перекази (виключення з доходу)\n— Своєчасність сплати ЄСВ та подачі звітності\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
  },

  // ===== Нові handlers для мертвих зон =====

  "звітність": (p) => {
    if (p.type === "fop" && p.fopGroup === 3) return `📋 Звітність ФОП 3 групи:\n\n📝 Обов'язкові звіти:\n• Декларація ЄП — щоквартально (40 днів після кварталу)\n• ЄСВ Д5 (додаток 1) — щорічно до 9 лютого\n${p.vatPayer ? '• Декларація ПДВ — щомісяця до 20 числа\n• Реєстр податкових накладних — до 15 числа' : ''}\n${p.hasEmployees ? '• 1-ДФ — щоквартально\n• ЄСВ Д4 — щоквартально' : ''}\n\n⏰ Найближчий дедлайн: 12 травня 2026 (декларація за I квартал)\n\nFINTODO формує всі звіти автоматично.\n\n${getEmailBridge(p)}`;
    if (p.type === "fop") return `📋 Звітність ФОП ${p.fopGroup || ''} групи:\n\n📝 Обов'язкові звіти:\n• Декларація ЄП — щорічно до 9 лютого\n• ЄСВ Д5 — щорічно до 9 лютого\n${p.hasEmployees ? '• 1-ДФ — щоквартально\n• ЄСВ Д4 — щоквартально' : ''}\n\nFINTODO формує всі звіти автоматично.\n\n${getEmailBridge(p)}`;
    if (p.type === "tov") return `📋 Звітність ТОВ:\n\n📝 Основні звіти:\n• Фінансова звітність — щорічно (щоквартально для середніх/великих)\n• Декларація з податку на прибуток — щоквартально або щорічно\n${p.vatPayer ? '• Декларація ПДВ — щомісяця до 20 числа' : ''}\n• 1-ДФ — щоквартально\n• ЄСВ Д4 — щоквартально\n\nFINTODO автоматизує повний цикл звітності.\n\n${getEmailBridge(p)}`;
    return `📋 Звітність залежить від типу платника:\n\n• ФОП 1-2 групи: декларація раз на рік\n• ФОП 3 групи: декларація щоквартально\n• ТОВ: повний пакет (фінзвітність, податок на прибуток, ПДВ, зарплатна звітність)\n• Фізособи: річна декларація (при необхідності)\n\nFINTODO формує звітність автоматично.\n\n${getEmailBridge(p)}`;
  },

  "військовий збір": (p) => {
    const rate = TAX_RATES.militaryTax * 100;
    if (p.type === "fop" && p.fopGroup === 3) return `🪖 Військовий збір для ФОП 3 групи — ${rate}% від доходу (з 2024 року):\n\n📊 Розрахунок:\n• ВЗ нараховується на ПОВНУ суму доходу (як і ЄП)\n• При доході 100 000 грн: ВЗ = ${(100000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n• Сплачується щоквартально разом з ЄП\n\n📝 Строки:\n• Сплата — протягом 10 днів після граничного строку подачі декларації\n• Відображається в декларації ЄП\n\n⚠️ ВЗ не враховується у ліміті доходу ФОП.\n\nFINTODO автоматично розраховує ВЗ з кожної транзакції.\n\n${getEmailBridge(p)}`;
    if (p.type === "fop") return `🪖 Військовий збір для ФОП 1-2 групи — ${rate}% від мінімальної зарплати:\n\n📊 Розрахунок:\n• ВЗ = ${rate}% × МЗП = ${Math.round(MINIMUM_WAGE * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн/міс\n• Сплачується щоквартально\n\n${getEmailBridge(p)}`;
    return `🪖 Військовий збір — ${rate}% від бази оподаткування:\n\n• Для найманих працівників: утримується з зарплати\n• Для ФОП 3 групи: ${rate}% від доходу\n• Для фізосіб: ${rate}% від доходів, зазначених у декларації\n\n${getEmailBridge(p)}`;
  },

  "ПДВ": (p) => {
    if (p.type === "fop" && p.fopGroup === 3 && p.vatPayer) return `📊 ПДВ для ФОП 3 групи (ставка 3% + ПДВ):\n\n• ЄП: 3% від доходу\n• ПДВ: 20% — нараховується окремо\n• Подача декларації ПДВ — щомісяця до 20 числа\n• Реєстр податкових накладних — до 15 числа\n• Можливість формувати податковий кредит\n\n💡 Вигідно, якщо маєте великі витрати з ПДВ (товари, обладнання).\n\nFINTODO автоматизує ПДВ-облік.\n\n${getEmailBridge(p)}`;
    if (p.type === "fop" && p.fopGroup === 3) return `📊 ФОП 3 групи без ПДВ — ставка ЄП 5%:\n\n• ПДВ не сплачується\n• Декларація ПДВ не подається\n• Реєстр ПН не ведеться\n• Простіше адмініструвати\n\n⚠️ Обов'язкова реєстрація ПДВ при доході понад 1 млн грн за останні 12 місяців (для загальної системи).\n\nДля спрощеної системи реєстрація ПДВ — добровільна.\n\n${getEmailBridge(p)}`;
    if (p.type === "tov") return `📊 ПДВ для ТОВ:\n\n• Ставка: 20% (стандартна), 7% (медичні вироби), 0% (експорт)\n• Обов'язкова реєстрація: при доході понад 1 млн грн за 12 місяців\n• Декларація: щомісяця до 20 числа\n• Податковий кредит: зменшує зобов'язання з ПДВ\n\nFINTODO автоматично веде реєстр ПН та формує декларацію.\n\n${getEmailBridge(p)}`;
    return `📊 ПДВ (податок на додану вартість) — 20%:\n\n• Включений у ціну більшості товарів та послуг\n• Фізособи сплачують ПДВ як споживачі\n• Реєстрація ПДВ обов'язкова для бізнесу з доходом понад 1 млн грн/рік\n\n${getEmailBridge(p)}`;
  },

  "визначення групи": (p) => {
    return `🔍 Допоможу визначити оптимальну групу ФОП:\n\n📊 Критерії вибору:\n\n**1 група** — для вас, якщо:\n• Продаєте товари на ринках або надаєте побутові послуги\n• Клієнти — ТІЛЬКИ фізичні особи\n• Дохід до ${formatTaxCurrency(FOP_INCOME_LIMITS[1])}/рік\n• ЄП: ${EP_FIXED.group1} грн/міс (фіксований)\n\n**2 група** — для вас, якщо:\n• Надаєте послуги або торгуєте\n• Клієнти — фізособи ТА підприємці/юрособи\n• Дохід до ${formatTaxCurrency(FOP_INCOME_LIMITS[2])}/рік\n• ЄП: ${EP_FIXED.group2} грн/міс (фіксований)\n\n**3 група** — для вас, якщо:\n• Будь-яка діяльність (крім забороненої)\n• Будь-які клієнти\n• Дохід до ${formatTaxCurrency(FOP_INCOME_LIMITS[3])}/рік\n• ЄП: 5% від доходу або 3%+ПДВ\n\n💡 IT-фрілансери, консультанти, експортери — зазвичай 3 група.\nТорговці на ринку — 1 група.\nПослуги для бізнесу — 2 або 3 група.\n\n${getEmailBridge(p)}`;
  },

  // ===== Сценарії для ТОВ (51-60) =====

  "дивіденди ТОВ": (p) => {
    return `💰 Дивіденди ТОВ — оподаткування та порядок виплати:\n\n📊 Ставки:\n• ПДФО: 5% (на спрощеній) або 9% (на загальній + ПДВ)\n• Військовий збір: ${TAX_RATES.militaryTax * 100}% від суми дивідендів\n• ЄСВ: НЕ нараховується на дивіденди\n\n📝 Порядок виплати:\n1. Рішення загальних зборів учасників\n2. Затвердження фінансової звітності\n3. Наявність чистого прибутку\n4. Сплата податків ДО виплати\n\n⚠️ Обмеження:\n• Не можна виплачувати частіше ніж раз на квартал\n• Заборонено при від'ємному власному капіталі\n• Заборонено при наявності податкового боргу\n\n📌 Приклад: чистий прибуток 500 000 грн → дивіденди 500 000 → ПДФО 25 000 (5%) + ВЗ ${(500000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} → на руки ${(500000 - 25000 - 500000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн.\n\nFINTODO розрахує оптимальну суму дивідендів та податки.\n\n${getEmailBridge(p)}`;
  },

  "зарплатні податки ТОВ": (p) => {
    return `💼 Зарплатні податки для ТОВ — повний розрахунок:\n\n📊 Утримання із зарплати працівника:\n• ПДФО: 18% від нарахованої зарплати\n• Військовий збір: ${TAX_RATES.militaryTax * 100}%\n\n📊 Нарахування на зарплату (за рахунок ТОВ):\n• ЄСВ: 22% від нарахованої зарплати\n\n📌 Приклад (зарплата 25 000 грн):\n• ПДФО: 4 500 грн (18%)\n• ВЗ: ${(25000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n• На руки: ${(25000 - 4500 - 25000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n• ЄСВ (за рахунок ТОВ): 5 500 грн\n• Загальна вартість для ТОВ: 30 500 грн\n\n📝 Звітність:\n• 1-ДФ: щоквартально\n• ЄСВ Д4: щоквартально\n• Сплата — до 20 числа наступного місяця\n\nFINTODO автоматизує розрахунок зарплати та формування звітності.\n\n${getEmailBridge(p)}`;
  },

  "фінансова звітність ТОВ": (p) => {
    return `📊 Фінансова звітність ТОВ — що потрібно подавати:\n\n📋 Для мікропідприємств (до 10 працівників, дохід до 700 000 €):\n• Фінансова звітність малого підприємства (скорочена)\n• Щорічно, до 28 лютого\n\n📋 Для малих підприємств:\n• Баланс (форма 1-м)\n• Звіт про фінансові результати (форма 2-м)\n• Щорічно або щоквартально\n\n📋 Для середніх/великих:\n• Повний комплект (баланс, звіт про фінрезультати, рух грошових коштів, власний капітал, примітки)\n• Щоквартально\n\n⏰ Дедлайни:\n• Річна: до 28 лютого наступного року\n• Квартальна: 40 днів після закінчення кварталу\n\nFINTODO автоматично формує повний пакет фінансової звітності.\n\n${getEmailBridge(p)}`;
  },

  "касова дисципліна ТОВ": (p) => {
    return `💵 Касова дисципліна для ТОВ:\n\n📊 Ліміт залишку каси:\n• Встановлюється самостійно наказом по підприємству\n• Перевищення — штраф у 2-кратному розмірі понадлімітної суми\n\n📋 Обов'язкові документи:\n• Прибуткові та видаткові касові ордери\n• Касова книга (щоденно при наявності операцій)\n• Відомості на виплату зарплати\n\n⚠️ Обмеження готівкових розрахунків:\n• Між юрособами: до 10 000 грн за один день\n• З фізособами: до 50 000 грн\n• За рахунок готівки, отриманої з банку: без обмежень\n\n❗ Штрафи:\n• Понадлімітна каса: 2× суми перевищення\n• Неоприбуткування: 5× суми\n• Перевищення ліміту розрахунків: 10 000 грн\n\nFINTODO контролює ліміт каси та формує касові документи.\n\n${getEmailBridge(p)}`;
  },

  "статутний капітал ТОВ": (p) => {
    return `🏛️ Статутний капітал ТОВ:\n\n📊 Мінімальний розмір: 1 грн (з 2019 року)\n\n📋 Формування:\n• Грошові внески — на рахунок ТОВ\n• Майнові внески — оцінка + акт приймання-передачі\n• Строк внесення: визначається Статутом (зазвичай до 6 місяців)\n\n📝 Зміна розміру:\n• Збільшення: рішення загальних зборів + реєстрація в ЄДР\n• Зменшення: рішення + повідомлення кредиторів за 2 місяці\n\n⚠️ Важливо:\n• Невнесений статутний капітал — борг учасника перед ТОВ\n• Розмір впливає на відповідальність учасників\n• При ліквідації — повертається після задоволення кредиторів\n\nFINTODO відстежує стан внесення статутного капіталу.\n\n${getEmailBridge(p)}`;
  },

  "ліквідація ТОВ": (p) => {
    return `🔒 Ліквідація ТОВ — покроковий алгоритм:\n\n📝 Порядок дій:\n1. Рішення загальних зборів про ліквідацію\n2. Призначення ліквідаційної комісії\n3. Публікація повідомлення в бюлетені (2 місяці для кредиторів)\n4. Звільнення працівників (повідомлення за 2 місяці)\n5. Інвентаризація активів та зобов'язань\n6. Ліквідаційний баланс\n7. Подача останньої звітності\n8. Закриття банківських рахунків\n9. Виключення з ЄДР\n\n⏰ Строки: від 3 до 6 місяців\n\n💰 Витрати:\n• Публікація: ~500 грн\n• Нотаріус: ~1 000 грн\n• Бухгалтерські послуги: від 5 000 грн\n\n⚠️ Альтернатива: продаж ТОВ (зміна учасників) — швидше та дешевше.\n\nFINTODO підготує весь пакет документів для ліквідації.\n\n${getEmailBridge(p)}`;
  },

  "реєстрація ТОВ": (p) => {
    return `🏢 Реєстрація ТОВ — покрокова інструкція:\n\n📝 Що потрібно:\n1. Визначити назву (перевірити унікальність на usr.minjust.gov.ua)\n2. Підготувати Статут\n3. Визначити юридичну адресу\n4. Відкрити тимчасовий рахунок для статутного капіталу\n5. Подати документи до держреєстратора (ЦНАП або онлайн через Дію)\n\n💰 Вартість:\n• Реєстрація: безкоштовно (через Дію)\n• Нотаріус (підпис Статуту): ~500-1 000 грн\n• Печатка (необов'язкова): 200-500 грн\n• Відкриття рахунку: безкоштовно\n\n⏰ Строки: 1-3 робочих дні\n\n📋 Після реєстрації:\n• Отримати витяг з ЄДР\n• Відкрити банківський рахунок\n• Зареєструватися платником ЄП (за бажанням)\n• Зареєструватися платником ПДВ (при потребі)\n\nFINTODO допоможе з налаштуванням обліку для нового ТОВ.\n\n${getEmailBridge(p)}`;
  },

  "перевірка контрагентів ТОВ": (_p) => {
    return `Перевірка контрагентів — це функція повної версії FINTODO. Після реєстрації ви зможете:\n\n— Перевіряти контрагентів за ІПН/ЄДРПОУ в один клік\n— Автоматично моніторити статус ЄДР, ПДВ, санкційні списки та судові справи\n— Отримувати попередження при зміні статусу контрагента\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний «Старт» (300 кр./міс) — без картки і назавжди.`;
  },

  "трансфертне ціноутворення ТОВ": (p) => {
    return `📊 Трансфертне ціноутворення (ТЦУ) для ТОВ:\n\n❓ Коли застосовується:\n• Операції з пов'язаними особами (контрольовані операції)\n• Операції з нерезидентами з країн із «низькоподатковою юрисдикцією»\n• Річний обсяг операцій з одним контрагентом — від 10 млн грн\n• Загальний річний дохід — від 150 млн грн\n\n📝 Звітність:\n• Звіт про контрольовані операції — до 1 жовтня наступного року\n• Документація з ТЦУ — за запитом ДПС (30 днів)\n\n⚠️ Штрафи:\n• Неподання звіту: від 300 до 500 прожиткових мінімумів\n• Неподання документації: від 3% суми контрольованих операцій\n\nFINTODO допоможе визначити, чи підпадають ваші операції під ТЦУ.\n\n${getEmailBridge(p)}`;
  },

  "відповідальність директора ТОВ": (p) => {
    return `⚖️ Відповідальність директора ТОВ:\n\n📋 Адміністративна відповідальність:\n• Порушення порядку ведення бухобліку: штраф 8 500-17 000 грн\n• Несвоєчасна подача звітності: 340-1 020 грн\n• Порушення валютного законодавства: до 100% суми операції\n\n⚖️ Субсидіарна відповідальність:\n• При банкрутстві ТОВ з вини директора\n• Якщо доведено, що дії директора призвели до збитків\n• Відповідальність — ОСОБИСТИМ майном\n\n🔒 Кримінальна відповідальність:\n• Ухилення від податків (понад 1 млн грн): до 5 років\n• Фіктивне підприємництво: до 3 років\n• Підроблення документів: до 2 років\n\n💡 Як захиститися:\n• Вести повний бухоблік\n• Документувати всі рішення\n• Своєчасно подавати звітність\n• Мати D&O страховку\n\nFINTODO мінімізує ризики через автоматизацію обліку.\n\n${getEmailBridge(p)}`;
  },

  // ===== Сценарії для фізосіб (61-70) =====

  "податкова знижка фізособи": (p) => {
    return `💰 Податкова знижка — як повернути ПДФО:\n\n📊 Що можна включити:\n• Навчання (вуз, школа, курси) — до суми зарплати за рік\n• Лікування — без обмежень суми\n• Іпотека — відсотки по кредиту\n• Благодійність — до 4% доходу за рік\n• Страхування — довгострокове страхування життя\n\n📝 Як отримати:\n1. Зібрати документи (чеки, договори, квитанції)\n2. Подати декларацію до 31 грудня наступного року\n3. Додати додаток 6 до декларації\n4. Повернення — протягом 60 днів після подачі\n\n📌 Приклад:\n• Зарплата 20 000 грн/міс → ПДФО за рік: 43 200 грн\n• Витрати на навчання: 50 000 грн\n• Повернення: 50 000 × 18% = 9 000 грн\n\n⚠️ Знижка доступна лише найманим працівникам (не ФОП)!\n\nFINTODO розрахує максимальну суму повернення.\n\n${getEmailBridge(p)}`;
  },

  "продаж нерухомості фізособи": (p) => {
    return `🏠 Продаж нерухомості фізособою — оподаткування:\n\n✅ Пільга (0% ПДФО) — якщо:\n• Перший продаж за календарний рік\n• Нерухомість у власності 3+ роки\n• Площа квартири до 100 м² або будинку до 250 м²\n\n❌ Оподаткування (якщо пільга не застосовується):\n• ПДФО: 5% від суми продажу\n• Військовий збір: ${TAX_RATES.militaryTax * 100}%\n• Другий і наступні продажі за рік: 5% + ВЗ\n• У власності менше 3 років: 5% + ВЗ\n\n📝 Документи:\n• Договір купівлі-продажу (нотаріальний)\n• Оцінка нерухомості\n• Декларація (якщо є податок)\n\n📌 Приклад (другий продаж за рік):\n• Продаж за 2 000 000 грн\n• ПДФО: 100 000 грн\n• ВЗ: ${(2000000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n\nFINTODO визначить, чи підпадає ваш продаж під пільгу.\n\n${getEmailBridge(p)}`;
  },

  "спадщина та дарування": (p) => {
    return `🎁 Спадщина та дарування — оподаткування:\n\n👨‍👩‍👧‍👦 Від родичів 1 ступеня (батьки, діти, подружжя):\n• ПДФО: 0%\n• ВЗ: 0%\n• Це стосується і спадщини, і дарування\n\n👥 Від родичів 2 ступеня (брати, сестри, бабусі, дідусі):\n• ПДФО: 5%\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n\n🌍 Від нерезидентів або неродичів:\n• ПДФО: 18%\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n\n📝 Обов'язки:\n• Подати декларацію до 1 травня наступного року\n• Сплатити податок до 1 серпня\n• Нерухомість — переоформити право власності\n\n⚠️ Спадщина від нерезидента оподатковується за ставкою 18%!\n\nFINTODO розрахує податок на спадщину або дарування.\n\n${getEmailBridge(p)}`;
  },

  "іноземний дохід фізособи": (p) => {
    return `🌍 Іноземний дохід резидента України:\n\n📊 Оподаткування:\n• ПДФО: 18% від суми доходу\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n• Курс — НБУ на дату отримання доходу\n\n📋 Типи доходів:\n• Зарплата від іноземного роботодавця\n• Роялті, дивіденди від іноземних компаній\n• Пенсія з-за кордону\n• Дохід від продажу іноземних активів\n\n💡 Уникнення подвійного оподаткування:\n• Україна має конвенції з 70+ країнами\n• Податок, сплачений за кордоном, зараховується\n• Потрібна довідка з податкової іноземної країни\n\n📝 Обов'язки:\n• Декларація до 1 травня\n• Сплата до 1 серпня\n• Зберігати документи 3 роки\n\nFINTODO перевірить наявність конвенції та розрахує податок.\n\n${getEmailBridge(p)}`;
  },

  "гіг-контракти фізособи": (p) => {
    return `📋 Цивільно-правові договори (ЦПД / гіг-контракти):\n\n📊 Оподаткування:\n• Якщо замовник — юрособа/ФОП: вони утримують ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}% + сплачують ЄСВ 22%\n• Якщо замовник — фізособа: ви самостійно декларуєте та сплачуєте\n\n❗ Відмінність від трудового договору:\n• Немає відпусток та лікарняних\n• Немає трудових гарантій\n• Оплата за результат, не за час\n• Можна працювати з кількома замовниками\n\n⚠️ Ризики:\n• ДПС може перекваліфікувати ЦПД у трудові відносини\n• Штраф для замовника: 10× мінімальної зарплати\n• Донарахування всіх податків та ЄСВ\n\n💡 Альтернатива: оформити ФОП 3 групи — ставка лише 5%.\n\nFINTODO допоможе обрати оптимальну форму.\n\n${getEmailBridge(p)}`;
  },

  "депозити та відсотки фізособи": (p) => {
    return `🏦 Депозити та відсотки — оподаткування:\n\n📊 Відсотки по банківських депозитах:\n• ПДФО: 18% від суми відсотків\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n• Утримується банком автоматично при виплаті\n\n✅ Ваших дій не потрібно:\n• Банк є податковим агентом\n• Утримує та сплачує податок самостійно\n• Відображає в 1-ДФ\n\n⚠️ Винятки:\n• Депозити в іноземних банках — декларуєте самостійно\n• Валютні депозити — курсова різниця може бути доходом\n\n📌 Приклад:\n• Депозит 100 000 грн під 15% річних\n• Відсотки: 15 000 грн\n• ПДФО: 2 700 грн\n• ВЗ: ${(15000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n• На руки: ${(15000 - 2700 - 15000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n\nFINTODO автоматично враховує дохід від депозитів.\n\n${getEmailBridge(p)}`;
  },

  "аліменти фізособи": (p) => {
    return `👨‍👧 Аліменти — податкові аспекти:\n\n📊 Для отримувача аліментів:\n• ПДФО: 0% (аліменти НЕ оподатковуються)\n• ВЗ: 0%\n• Не включаються в декларацію\n\n📊 Для платника аліментів:\n• Утримуються із зарплати ПІСЛЯ утримання ПДФО та ВЗ\n• Розмір: 25% на одну дитину, 33% на двох, 50% на трьох+\n• Мінімум: 50% прожиткового мінімуму на дитину\n\n📋 Для ФОП-платника:\n• Аліменти розраховуються від чистого доходу (дохід − податки)\n• Потрібна декларація або КОД для підтвердження доходу\n\n⚠️ Несплата аліментів понад 3 місяці — кримінальна відповідальність.\n\nFINTODO допоможе розрахувати суму аліментів.\n\n${getEmailBridge(p)}`;
  },

  "продаж авто фізособи": (p) => {
    return `🚗 Продаж автомобіля фізособою:\n\n✅ Пільга (0% ПДФО) — якщо:\n• Перший продаж легкового авто за рік\n• Мотоцикла або мопеда — теж перший за рік\n\n❌ Оподаткування (другий і наступні за рік):\n• ПДФО: 5% від суми продажу\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n• Базою є вартість за договором (але не менше оціночної)\n\n📝 Документи:\n• Договір купівлі-продажу\n• Експертна оцінка (обов'язкова)\n• Сервісний центр МВС для перереєстрації\n\n📌 Приклад (другий продаж):\n• Авто за 300 000 грн\n• ПДФО: 15 000 грн\n• ВЗ: ${(300000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n\n⚠️ Продаж вантажного авто оподатковується завжди!\n\nFINTODO визначить, чи підпадає продаж під пільгу.\n\n${getEmailBridge(p)}`;
  },

  "благодійність фізособи": (p) => {
    return `❤️ Благодійність — податкові пільги:\n\n💰 Для благодійника (фізособи):\n• Благодійні внески можна включити в податкову знижку\n• Максимум: 4% від річного оподатковуваного доходу\n• Повернення: до 18% від суми внесків (у вигляді ПДФО)\n\n📋 Умови:\n• Внесок — на користь неприбуткової організації\n• Наявність підтверджуючих документів (квитанція, договір)\n• Подання декларації з додатком 6\n\n📌 Приклад:\n• Дохід 500 000 грн/рік\n• Допустимий благодійний внесок: 20 000 грн (4%)\n• Повернення ПДФО: 3 600 грн\n\n⚠️ Внески на ЗСУ через благодійні фонди теж підпадають під знижку!\n\nFINTODO розрахує максимальний розмір податкової знижки.\n\n${getEmailBridge(p)}`;
  },

  "е-декларування фізособи": (p) => {
    return `📋 Е-декларування (НАЗК) — для держслужбовців:\n\n❓ Хто подає:\n• Державні службовці\n• Депутати, судді, прокурори\n• Керівники держпідприємств\n• Кандидати на посади\n\n📝 Строки подачі:\n• Щорічна: до 1 квітня\n• При вступі на посаду: до призначення\n• При звільненні: наступного року\n\n📊 Що декларується:\n• Доходи (усі джерела)\n• Нерухомість та земельні ділянки\n• Цінне рухоме майно (понад 50 ПМ)\n• Банківські рахунки та готівка (понад 50 ПМ)\n• Фінансові зобов'язання\n• Видатки (понад 50 ПМ)\n\n⚠️ Штрафи:\n• Неподання: кримінальна відповідальність\n• Недостовірні дані: штраф або кримінальна відповідальність\n\nFINTODO допоможе зібрати та систематизувати дані для е-декларації.\n\n${getEmailBridge(p)}`;
  },


  "оренда бізнесу": (p) => {
    if (p.type === "fop") return `🏢 Оренда приміщення для ФОП:\n\n📊 Як це впливає на податки:\n• ФОП на спрощеній системі НЕ має права враховувати витрати на оренду для зменшення ЄП\n• Оренда — це витрата, але вона не зменшує базу оподаткування ЄП\n• Якщо орендодавець — фізособа, ФОП має утримати ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}% та ЄСВ ${TAX_RATES.esv * 100}%\n\n📋 Документи:\n• Договір оренди (обов'язково письмовий)\n• Акти приймання-передачі\n• Акти наданих послуг (щомісячно)\n• Платіжні документи\n\n⚠️ КВЕД: перевірте, чи ваш КВЕД дозволяє діяльність за цією адресою.\n\nFINTODO контролює документообіг по оренді.\n\n${getEmailBridge(p)}`;
    return `🏢 Оренда приміщення — податкові аспекти:\n\n• Якщо ви орендар-юрособа: витрати на оренду зменшують прибуток\n• Якщо орендодавець — фізособа: утримуйте ПДФО + ВЗ\n• Документи: договір + акти + оплата\n\nFINTODO автоматизує облік орендних платежів.\n\n${getEmailBridge(p)}`;
  },

  "дохід від контенту": (p) => {
    if (p.type === "fop") return `📱 Дохід від YouTube/Instagram/TikTok для ФОП:\n\n📊 Оподаткування:\n• Монетизація YouTube (Google Adsense) — дохід у валюті, курс НБУ на дату зарахування\n• Рекламні інтеграції — дохід від замовника (договір + акт)\n• Донати (Patreon, Buy Me a Coffee) — також дохід\n\n💡 Оптимальна структура:\n• ФОП 3 групи, КВЕД 73.11 або 59.11\n• ЄП 5% від усього доходу (або 3%+ПДВ)\n• Валютний дохід фіксується за курсом НБУ\n\n⚠️ Важливо:\n• Рекламні контракти — зберігайте договори\n• Бартер (товари за рекламу) — теж дохід за ринковою вартістю\n• Дохід з YouTube приходить на Payoneer/банк — все одно оподатковується\n\nFINTODO автоматично конвертує валютний дохід та формує звітність.\n\n${getEmailBridge(p)}`;
    return `📱 Дохід від YouTube/Instagram/TikTok:\n\n📊 Якщо ви фізособа:\n• ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}% від усього доходу\n• Декларація до 1 травня\n\n💡 Рекомендація: оформити ФОП 3 групи — ставка лише 5% замість ${TOTAL_RATE}%.\n\nFINTODO допоможе обрати оптимальну структуру та вести облік.\n\n${getEmailBridge(p)}`;
  },

  "p2p перекази": (p) => {
    if (p.type === "fop") return `💸 P2P-перекази та ФОП:\n\n⚠️ Ключове правило: дохід ФОП — це кошти, отримані на підприємницький рахунок за товари/послуги.\n\n❌ Що НЕ є доходом:\n• Переказ від себе (з особистої картки)\n• Повернення помилкового переказу\n• Позика від фізособи (якщо є договір)\n\n✅ Що Є доходом:\n• Оплата за послуги від фізособи на ФОП-рахунок\n• Регулярні надходження від одного відправника без договору\n\n⚠️ Ризики:\n• Банк може запитати пояснення при частих p2p\n• ДПС може вважати систематичні надходження доходом\n• Фінмоніторинг при сумах від 400 000 грн\n\nFINTODO допоможе класифікувати перекази та виключити непідприємницькі.\n\n${getEmailBridge(p)}`;
    return `💸 P2P-перекази та податки:\n\n📊 Для фізособи:\n• Перекази між власними картками — не дохід\n• Систематичні надходження від інших осіб — можуть бути визнані доходом\n• Разові подарунки — не оподатковуються (до певних сум)\n\n⚠️ Ризики: якщо ДПС визначить систематичну підприємницьку діяльність — штраф + донарахування податків.\n\n💡 Рекомендація: при регулярних доходах краще оформити ФОП.\n\nFINTODO допоможе оцінити ризики та обрати оптимальну структуру.\n\n${getEmailBridge(p)}`;
  },

  "кешбек та бонуси": (p) => {
    return `💳 Кешбек та бонуси від банку:\n\n✅ Кешбек від банку за покупки — НЕ є доходом:\n• Це знижка (зменшення витрат), а не дохід\n• Не включається в Книгу обліку доходів\n• Не оподатковується ПДФО\n\n⚠️ Виняток — промоакції:\n• Якщо банк нараховує грошовий бонус як "подарунок" — це може бути оподатковуваний дохід\n• Банк як податковий агент має утримати ПДФО\n\n📊 Для ФОП:\n• Кешбек на бізнес-картку — не дохід, не впливає на ЄП\n• Відсотки на залишок рахунку — також не є підприємницьким доходом (оподатковуються як дохід фізособи)\n\nFINTODO автоматично виключає кешбек з доходу.\n\n${getEmailBridge(p)}`;
  },

  "інвестиції": (p) => {
    if (p.type === "fop") return `📈 Інвестиційний дохід для ФОП:\n\n📊 Ключове правило: інвестиційний дохід (акції, облігації) оподатковується як дохід фізособи, а НЕ як дохід ФОП:\n• ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}% від прибутку (різниця купівля-продаж)\n• Не включається в дохід ФОП і не впливає на ліміт ЄП\n\n💡 Виняток: ОВДП — звільнені від ПДФО та ВЗ.\n\nFINTODO автоматично розділяє підприємницький та інвестиційний дохід.\n\n${getEmailBridge(p)}`;
    return `📈 Інвестиційний дохід та податки:\n\n📊 Оподаткування:\n• Акції (IBKR, Freedom): ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}% від прибутку\n• ОВДП / державні облігації: звільнені від ПДФО та ВЗ\n• Корпоративні облігації: ПДФО ${PIT_RATE}% + ВЗ ${VZ_RATE}%\n• Дивіденди: ПДФО 9% (або 18% від нерезидентів) + ВЗ ${VZ_RATE}%\n\n📋 Декларація:\n• Подається до 1 травня за попередній рік\n• Додаток ІП — для інвестиційного прибутку\n• Метод FIFO для розрахунку прибутку\n\nFINTODO автоматично імпортує брокерські звіти та формує додаток ІП.\n\n${getEmailBridge(p)}`;
  },

  // ===== Нові сценарії для фізосіб (71-80) =====

  "виграш лотерея": (p) => {
    const mzp8 = MINIMUM_WAGE * 8;
    return `🎰 Виграш у лотерею / казино / гральний бізнес (п.170.6 ПКУ):\n\n📊 Оподаткування:\n• До 8 МЗП (${mzp8.toLocaleString('uk-UA')} грн у ${new Date().getFullYear()}): податок утримується організатором\n• Понад 8 МЗП: ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}% + декларація обов'язкова\n\n📋 Нюанси:\n• Онлайн-казино з ліцензією КРАІЛ: оператор = податковий агент\n• Виграш в іноземному казино: декларуєте самостійно\n• Лотерейний виграш: організатор утримує ПДФО при виплаті\n\n📌 Приклад (виграш 200 000 грн):\n• ПДФО: ${Math.round(200000 * 0.18).toLocaleString('uk-UA')} грн\n• ВЗ: ${Math.round(200000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n\nFINTODO допоможе розрахувати податок з виграшу.\n\n${getEmailBridge(p)}`;
  },

  "форекс торгівля": (p) => {
    return `📈 Forex / CFD торгівля — оподаткування як інвестиційний дохід:\n\n📊 Ставки:\n• ПДФО: 18% від прибутку (різниця між продажем і купівлею)\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n\n📋 Особливості:\n• Збитки від Forex НЕ зменшують інші доходи\n• Брокер-нерезидент: декларуєте самостійно (до 1 травня)\n• Курс — НБУ на дату фіксації прибутку\n• Зберігайте виписки з торгового терміналу (MT4/MT5)\n\n⚠️ Важливо:\n• Свопи, комісії — не зменшують базу оподаткування для фізосіб\n• Кредитне плече не впливає на розрахунок податку\n\n💡 Рекомендація: ведіть журнал операцій для декларації.\n\nFINTODO допоможе розрахувати інвестиційний прибуток.\n\n${getEmailBridge(p)}`;
  },

  "пенсія з-за кордону": (p) => {
    return `🌍 Іноземна пенсія — оподаткування в Україні:\n\n📊 Ставки:\n• ПДФО: 18% від суми пенсії\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n• Курс — НБУ на дату отримання\n\n💡 Уникнення подвійного оподаткування:\n• Якщо є конвенція з країною виплати — податок, сплачений там, зараховується\n• Потрібна довідка з податкової іноземної країни (апостильована)\n• Україна має конвенції з 70+ країнами\n\n📋 Обов'язки:\n• Декларація обов'язкова (до 1 травня)\n• Сплата — до 1 серпня\n• Зберігайте підтвердження отримання пенсії\n\n⚠️ Українська пенсія — декларація НЕ потрібна.\n\nFINTODO перевірить наявність конвенції та розрахує податок.\n\n${getEmailBridge(p)}`;
  },

  "подарунок грошовий": (p) => {
    const mzp1 = MINIMUM_WAGE;
    return `🎁 Подарунки — оподаткування (п.174 ПКУ):\n\n👨‍👩‍👧‍👦 Від родичів 1 ступеня (батьки, діти, подружжя): **0%**\n\n👥 Від родичів 2 ступеня (брати, бабусі): **ПДФО 5% + ВЗ ${TAX_RATES.militaryTax * 100}%**\n\n🌍 Від неродичів: **ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}%**\n\n🏢 Від компанії (роботодавця):\n• До 1 МЗП на рік (${mzp1.toLocaleString('uk-UA')} грн): **0%**\n• Понад 1 МЗП: ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}%\n\n📋 Подарунковий сертифікат = подарунок (оподатковується так само)\n\n📌 Приклад (подарунок 50 000 грн від неродича):\n• ПДФО: ${Math.round(50000 * 0.18).toLocaleString('uk-UA')} грн\n• ВЗ: ${Math.round(50000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n\nFINTODO розрахує податок на подарунок.\n\n${getEmailBridge(p)}`;
  },

  "стипендія грант фізособа": (p) => {
    return `🎓 Стипендії та гранти для фізосіб:\n\n✅ Не оподатковується:\n• Державна стипендія (п.165.1.26 ПКУ)\n• Стипендія Кабміну, Президента\n• Стипендія у навчальних закладах\n\n❌ Оподатковується (ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}%):\n• Іменна стипендія від юридичної особи (понад МЗП)\n• Стипендія від іноземного фонду\n• Грант без цільового використання\n\n📋 Гранти:\n• Цільовий грант (на дослідження, проект): може бути звільнений при цільовому використанні\n• Нецільовий грант: оподатковується як інший дохід\n• Від міжнародних організацій: перевірте пільговий список КМУ\n\nFINTODO допоможе класифікувати вашу стипендію чи грант.\n\n${getEmailBridge(p)}`;
  },

  "оренда землі пай": (p) => {
    return `🌾 Оренда землі / паю — оподаткування:\n\n📊 Ставки:\n• ПДФО: 18% від суми оренди\n• ВЗ: ${TAX_RATES.militaryTax * 100}%\n\n📋 Якщо орендар — юрособа (агропідприємство):\n• Утримує ПДФО + ВЗ при виплаті\n• Ви отримуєте «чисту» суму\n• Декларація не потрібна\n\n📋 Якщо орендар — фізособа:\n• Декларуєте самостійно (до 1 травня)\n• Сплачуєте до 1 серпня\n\n⚠️ Мінімальна оренда паю: 3% від нормативної грошової оцінки (НГО)\n\n📌 Приклад (оренда 30 000 грн/рік):\n• ПДФО: ${Math.round(30000 * 0.18).toLocaleString('uk-UA')} грн\n• ВЗ: ${Math.round(30000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n• На руки: ${Math.round(30000 - 30000 * 0.18 - 30000 * TAX_RATES.militaryTax).toLocaleString('uk-UA')} грн\n\nFINTODO розрахує податок з оренди землі.\n\n${getEmailBridge(p)}`;
  },

  "продаж землі": (p) => {
    return `🏞️ Продаж земельної ділянки — оподаткування (п.172 ПКУ):\n\n✅ Пільга (0% ПДФО) — якщо:\n• Перший продаж за календарний рік\n• Земля у власності 3+ роки\n\n❌ Оподаткування:\n• Другий і наступні продажі: ПДФО 5% + ВЗ ${TAX_RATES.militaryTax * 100}%\n• У власності менше 3 років: ПДФО 5% + ВЗ ${TAX_RATES.militaryTax * 100}%\n\n📋 Сільськогосподарські землі:\n• Мораторій на продаж скасовано з 2024\n• Для фізосіб-громадян: до 100 га в одні руки\n• Юрособи — з 2024 до 10 000 га\n\n📝 Документи:\n• Нотаріальний договір купівлі-продажу\n• Оцінка земельної ділянки\n• Нотаріус утримує податок при посвідченні\n\nFINTODO визначить, чи підпадає продаж під пільгу.\n\n${getEmailBridge(p)}`;
  },

  "переказ з-за кордону": (p) => {
    return `💸 Грошовий переказ з-за кордону — оподаткування:\n\n📋 Залежить від характеру переказу:\n\n🎁 Подарунок від родичів:\n• 1 ступінь (батьки, діти, подружжя): 0%\n• 2 ступінь: ПДФО 5% + ВЗ ${TAX_RATES.militaryTax * 100}%\n• Неродичі: ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}%\n\n💰 Матеріальна допомога (не від родичів): ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}%\n\n🔄 Повернення власних коштів: НЕ оподатковується (потрібно підтвердження — виписки, договори)\n\n⚠️ Фінансовий моніторинг:\n• Операції від 400 000 грн — обов'язкова перевірка банком\n• Банк може запросити документи про джерело коштів\n\n📝 Декларація обов'язкова для оподатковуваних переказів.\n\nFINTODO допоможе класифікувати переказ та розрахувати податок.\n\n${getEmailBridge(p)}`;
  },

  "кеп дія підпис": (p) => {
    return `🔐 КЕП / Дія.Підпис — як отримати електронний підпис:\n\n📱 Дія.Підпис (найпростіше):\n• Безкоштовно через додаток Дія\n• Потрібен смартфон з NFC + ID-картка\n• Підходить для подачі декларації\n\n🏦 Через банк:\n• ПриватБанк — у Privat24 (безкоштовно)\n• Monobank — в додатку (безкоштовно)\n• Більшість банків пропонують КЕП безкоштовно\n\n🏢 Через АЦСК:\n• ІДД (cabinet.tax.gov.ua) — безкоштовно\n• Masterkey, Depositsign — платно\n• Потрібен особистий візит або онлайн-ідентифікація\n\n📋 Для чого потрібен:\n• Подача декларації в ДПС\n• Електронний документообіг\n• Реєстрація ФОП / ТОВ через Дію\n\n💡 FINTODO підтримує всі типи КЕП — підпишіть та надішліть декларацію в один клік!\n\n${getEmailBridge(p)}`;
  },

  "чи потрібна декларація": (p) => {
    return `📝 Чи потрібна вам декларація — швидка перевірка:\n\n✅ **Декларація обов'язкова** якщо ви:\n• Отримували дохід від фізосіб (оренда, продаж)\n• Мали іноземний дохід (зарплата, пенсія, інвестиції)\n• Мали інвестиційний дохід (акції, крипто, Forex)\n• Продавали нерухомість / авто (другий+ за рік)\n• Отримували спадщину від неродичів\n• Хочете отримати податкову знижку\n\n❌ **Декларація НЕ потрібна** якщо:\n• Тільки зарплата (роботодавець — податковий агент)\n• Тільки українська пенсія\n• Тільки депозити (банк утримує податок)\n• Подарунки від родичів 1 ступеня\n\n📅 Дедлайни:\n• Подача: до 1 травня наступного року\n• Сплата: до 1 серпня\n• Для податкової знижки: до 31 грудня\n\n💡 Натисніть «Чи потрібна декларація?» нижче для детальної перевірки!\n\nFINTODO сформує декларацію автоматично.\n\n${getEmailBridge(p)}`;
  },

  // Audience-routed placeholder (actual routing happens in matchFreeText)
  "оренда": (p) => {
    if (p.type === "individual" || !p.type) {
      return `🏠 Здача нерухомості в оренду — потрібно декларувати дохід та сплатити ПДФО 18% + ВЗ ${TAX_RATES.militaryTax * 100}%. Або можна оформити ФОП та платити 5% ЄП.\n\nFINTODO допоможе обрати оптимальний спосіб та сформувати декларацію.\n\n${getEmailBridge(p)}`;
    }
    return `🏢 Оренда комерційної нерухомості для бізнесу: витрати на оренду зменшують базу оподаткування (для загальної системи). Для ФОП на спрощеній — це не впливає на суму ЄП, але важливо мати договір оренди.\n\nFINTODO допоможе правильно оформити орендні операції.\n\n${getEmailBridge(p)}`;
  },
};

function getConsultPersonalization(profile: UserProfile): string {
  const parts: string[] = [];
  if (profile.type === "fop" && profile.fopGroup) {
    parts.push(`Для ФОП ${profile.fopGroup} групи${profile.vatPayer ? " (з ПДВ)" : ""} це особливо актуально.`);
  }
  if (profile.type === "tov") {
    parts.push(`Для вашого ТОВ${profile.taxSystem === "general" ? " на загальній системі" : profile.taxSystem === "simplified" ? " на спрощеній системі" : ""} це важливо врахувати.`);
  }
  if (profile.hasEmployees) parts.push("Також врахуйте зарплатну звітність для працівників.");
  if (profile.vatPayer && profile.type !== "fop") parts.push("Як платнику ПДВ, зверніть увагу на строки подачі реєстру ПН.");
  return parts.length > 0 ? "\n\n" + parts.join(" ") : "";
}

export interface ConsultResponseResult {
  text: string;
  isLibraryMatch: boolean;
}

export function getConsultResponse(text: string, profile: UserProfile): ConsultResponseResult | null {
  const lower = text.toLowerCase();

  // 1. Check CONSULT_KEYWORDS first (exact match for meta-keys from matchFreeText)
  if (CONSULT_KEYWORDS[lower] || CONSULT_KEYWORDS[text]) {
    const handler = CONSULT_KEYWORDS[lower] || CONSULT_KEYWORDS[text];
    if (handler) {
      return { text: handler(profile), isLibraryMatch: false };
    }
  }

  // 2. Search library
  const found = findRelevantConsultation(text, profile);
  if (found) {
    const teaser = extractTeaser(found.answer);
    const queryType = classifyQuery(text);
    const bonus = getLibraryBonusOffer(profile);
    const personalization = getConsultPersonalization(profile);

    if (queryType === "product") {
      const taxFacts = getTaxFactsForQuery(text, profile);
      const productText = (taxFacts ? taxFacts + "\n\n" : "") + teaser + personalization +
        `\n\nFINTODO автоматично контролює це за вас. Спробуйте безкоштовно — або отримайте детальне роз'яснення з **${bonus}** на email.`;
      return { text: productText, isLibraryMatch: true };
    } else {
      const infoText = teaser + personalization +
        `\n\nХочете отримати повне роз'яснення з прикладами на email? Додам **${bonus}** з усіма дедлайнами.`;
      return { text: infoText, isLibraryMatch: true };
    }
  }

  // 3. Fallback to keyword substring matching
  for (const [keyword, responder] of Object.entries(CONSULT_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return { text: responder(profile), isLibraryMatch: false };
    }
  }

  // 3. Nothing found
  return null;
}

/** Inject relevant tax facts from taxConstantsConfig when query is about limits, rates, etc. */
function getTaxFactsForQuery(text: string, profile: UserProfile): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("ліміт") || lower.includes("обмеження доход")) {
    const limits = [
      `1 група — ${formatTaxCurrency(FOP_INCOME_LIMITS[1])}`,
      `2 група — ${formatTaxCurrency(FOP_INCOME_LIMITS[2])}`,
      `3 група — ${formatTaxCurrency(FOP_INCOME_LIMITS[3])}`,
    ];
    return `📊 Ліміти доходу ФОП на ${CURRENT_TAX_YEAR} рік: ${limits.join(", ")}. При перевищенні — примусове переведення на загальну систему.`;
  }
  if (lower.includes("єсв") || lower.includes("соціальний внесок")) {
    return `📊 ЄСВ у ${CURRENT_TAX_YEAR}: мінімум ${ESV_MONTHLY.toLocaleString('uk-UA')} грн/міс (${ESV_QUARTERLY.toLocaleString('uk-UA')} грн/квартал). Базується на МЗП ${MINIMUM_WAGE.toLocaleString('uk-UA')} грн.`;
  }
  if (lower.includes("єдиний податок") || lower.includes("ставка єп")) {
    return `📊 Ставки ЄП: 1 група — ${EP_FIXED.group1.toLocaleString('uk-UA')} грн/міс, 2 група — ${EP_FIXED.group2.toLocaleString('uk-UA')} грн/міс, 3 група — 5% від доходу (або 3%+ПДВ).`;
  }
  return null;
}

// ── Re-engagement: Action rotation & nudges ──

function getActionsForProfile(profile: UserProfile): ChatAction[] {
  return profile.type === "fop" ? FOP_ACTIONS :
    profile.type === "tov" ? TOV_ACTIONS :
    profile.type === "accountant" ? ACCOUNTANT_ACTIONS :
    INDIVIDUAL_ACTIONS;
}

export function getRemainingActions(profile: UserProfile, usedActions: Set<string>): ChatAction[] {
  return getActionsForProfile(profile).filter(a => !usedActions.has(a.type));
}

export function getTotalActionsCount(profile: UserProfile): number {
  return getActionsForProfile(profile).length;
}

export function getEmailNudgeText(profile: UserProfile, lastAction?: string): string {
  const ctx = profile.type === "fop" && profile.fopGroup
    ? `ФОП ${profile.fopGroup} групи`
    : profile.type === "tov" ? "ТОВ"
    : profile.type === "accountant" ? "бухгалтерської практики"
    : profile.type === "individual" ? "фізичної особи"
    : "вашого профілю";

  switch (lastAction) {
    case "calculate":
      return `Готово! Хочете, надішлю цей розрахунок на email разом з податковим календарем для ${ctx}?`;
    case "check_fop":
      return `Результат перевірки готовий. Надіслати на email для вашого обліку?`;
    case "check_declaration":
      return `Хочете отримати нагадування про дедлайн декларації на email?`;
    case "consult":
      return `Хочете, збережу цю консультацію та надішлю на email з корисними посиланнями для ${ctx}?`;
    default:
      return `Ви вже отримали кілька консультацій. Хочете зберегти їх та отримати податковий календар для ${ctx} на email?`;
  }
}

export function getInactivityNudge(profile: UserProfile, usedActionsSet?: Set<string>): string {
  if (profile.type === "fop" && profile.fopGroup) {
    return `До речі, для ФОП ${profile.fopGroup} групи найактуальніше зараз — подача декларації за I квартал (дедлайн 12 травня 2026). Хочете, нагадаю?`;
  }
  if (profile.type === "tov") {
    return "До речі, для ТОВ найближчий дедлайн — подача фінансової звітності та декларації з ПДВ. Хочете, перевірю ваші дедлайни?";
  }
  if (profile.type === "accountant") {
    return "До речі, зараз актуальний період звітності за I квартал — масове формування декларацій для клієнтів. Хочете спробувати мультикабінет?";
  }
  if (profile.type === "individual" && profile.painPoint === "невизначеність") {
    if (usedActionsSet?.has("check_declaration")) {
      return "Хочете розрахувати податок або почати безкоштовно?";
    }
    return "Якщо сумніваєтесь щодо декларації — ми перевіримо за 30 секунд. Спробуйте!";
  }
  if (profile.painPoint === "помилки") {
    return "Хочете розрахувати точну суму без помилок? AI порахує за секунду.";
  }
  if (profile.painPoint === "складність") {
    return "Маєте кілька джерел доходу? AI врахує все автоматично — спробуйте розрахунок.";
  }
  if (profile.painPoint === "штрафи") {
    return "Хочете перевірити, чи все правильно? AI перевірить кожну цифру — спробуйте розрахунок.";
  }
  if (profile.painPoint === "рутина") {
    return "Втомилися від ручної роботи? Спробуйте безкоштовно — AI зробить все за вас за 3 хвилини.";
  }
  if (profile.painPoint === "дедлайни") {
    return "Найближчий дедлайн вже скоро! Хочете налаштувати нагадування — більше жодного пропуску?";
  }
  if (profile.painPoint === "витрати") {
    return "Хочете побачити, скільки зекономите? Безкоштовний «Старт» — 300 кр./міс назавжди, або 14 днів повного Смарту без оплати.";
  }
  if (profile.painPoint === "автоматизація") {
    return "Готові автоматизувати? Спробуйте безкоштовно — перша декларація за 3 хвилини.";
  }
  return "До речі, маєте ще питання? Я можу допомогти з податковою знижкою, деклараціями або розрахунком податків.";
}

export function getFinalCtaText(profile: UserProfile): string {
  const ctx = profile.type === "fop" && profile.fopGroup
    ? `ФОП ${profile.fopGroup} групи`
    : profile.type === "tov" ? "ТОВ"
    : profile.type === "accountant" ? "бухгалтерів"
    : "фізосіб";
  return `Ви розібрались у всіх ключових моментах для ${ctx}! Залишилось почати з FINTODO. Базовий тариф — безкоштовний, реєстрація 30 секунд 🚀`;
}

// ── Personalized email confirmation & soft CTA ──

export function getEmailConfirmationText(email: string, profile: UserProfile): string {
  const materials: string[] = [];

  if (profile.type === "fop" && profile.fopGroup) {
    const groupLabel = `ФОП ${profile.fopGroup} групи`;

    if (profile.painPoint === "дедлайни") {
      materials.push(`📅 Податковий календар ${groupLabel} на 2026 рік`);
      materials.push("📋 Чек-лист квартальної звітності (ЄП + ЄСВ)");
      materials.push("⏰ Нагадування за 7 днів до кожного дедлайну");
    } else if (profile.painPoint === "штрафи") {
      materials.push(`📋 Чек-лист перевірки звітності ${groupLabel}`);
      materials.push(`📅 Календар звітності ${groupLabel} на 2026 рік`);
      materials.push("🔍 Гайд: як уникнути штрафів при перевірці ДПС");
    } else if (profile.painPoint === "рутина") {
      if (profile.hasEmployees) {
        materials.push("📋 Шаблони зарплатної відомості та 1-ДФ");
        materials.push(`📅 Календар звітності ${groupLabel} з найманими працівниками`);
        materials.push("💡 Гайд: як автоматизувати 80% бухгалтерської рутини");
      } else {
        materials.push(`📋 Покроковий чек-лист подачі декларації ${groupLabel}`);
        materials.push(`📅 Податковий календар ${groupLabel} на 2026 рік`);
        materials.push("💡 Гайд: автоматизація бухгалтерії для ФОП");
      }
    } else if (profile.painPoint === "витрати") {
      materials.push("💰 Порівняння: бухгалтер vs автоматизація (ROI-калькулятор)");
      materials.push(`📅 Податковий календар ${groupLabel} на 2026 рік`);
      materials.push("📋 Чек-лист обов'язкової звітності");
    } else {
      // No specific pain point
      materials.push(`📅 Податковий календар ${groupLabel} на 2026 рік`);
      materials.push("📋 Чек-лист квартальної звітності");
      if (profile.vatPayer) materials.push("📊 Гайд з ПДВ-звітності для ФОП");
    }
  } else if (profile.type === "tov") {
    if (profile.painPoint === "штрафи") {
      materials.push(profile.vatPayer
        ? "📋 Чек-лист перевірки декларації ПДВ (50 пунктів)"
        : "📋 Чек-лист перевірки фінансової звітності ТОВ");
      materials.push("📅 Календар звітності ТОВ на 2026 рік");
      materials.push("🔍 Гайд: як уникнути штрафів при перевірці ДПС");
    } else if (profile.painPoint === "рутина") {
      materials.push("📋 Шаблони зарплатної відомості та звітності");
      materials.push("📅 Календар звітності ТОВ на 2026 рік");
      materials.push("💡 Гайд: автоматизація бухобліку для ТОВ");
    } else if (profile.painPoint === "дедлайни") {
      materials.push("📅 Повний календар звітності ТОВ на 2026 рік");
      materials.push("📋 Чек-лист щомісячної та квартальної звітності");
      materials.push("⏰ Нагадування за 7 днів до кожного дедлайну");
    } else {
      materials.push("📅 Календар звітності ТОВ на 2026 рік");
      materials.push("📋 Чек-лист обов'язкової звітності");
      if (profile.vatPayer) materials.push("📊 Гайд з ПДВ-звітності для ТОВ");
    }
  } else if (profile.type === "accountant") {
    materials.push("📅 Зведений календар звітності для всіх типів клієнтів");
    materials.push("📋 Чек-лист масового формування декларацій");
    materials.push("💡 Гайд: ефективне ведення мультикабінету");
  } else {
    // Individual or unknown
    materials.push("📅 Податковий календар фізичної особи на 2026 рік");
    materials.push("📋 Чек-лист подачі річної декларації");
    materials.push("💡 Гайд: як отримати податкову знижку");
  }

  const list = materials.join("\n");
  return `Готово! На ${email} надішлю:\n${list}\n\nПерший лист прийде протягом 5 хвилин.`;
}

export function getSoftCtaAfterEmail(profile: UserProfile): string {
  let feature: string;

  if (profile.type === "fop" && profile.fopGroup === 3) {
    feature = profile.vatPayer
      ? "автоматичне формування реєстру ПН та декларації ЄП"
      : "автоматичне формування декларації ЄП";
  } else if (profile.type === "fop" && profile.fopGroup) {
    feature = "автоматичний контроль ліміту доходу та формування платіжок";
  } else if (profile.type === "tov") {
    feature = profile.vatPayer
      ? "AI-перевірку декларації ПДВ на помилки"
      : "автоматичне формування фінансової звітності";
  } else if (profile.type === "accountant") {
    feature = "мультикабінет для всіх клієнтів";
  } else {
    feature = "автоматичний розрахунок податків";
  }

  if (profile.hasEmployees) {
    feature = "автоматичний розрахунок зарплати та ЄСВ";
  }

  return `До речі, поки чекаєте на лист — можете вже зараз спробувати ${feature} безкоштовно. Реєстрація через Дія.Підпис займає 30 секунд 🚀`;
}

// ── Pricing Calculator Scenario ──────────────────────────────

export interface PricingCalcProfile {
  entityType: string | null;    // "ФОП" | "Директор ТОВ" | "Бухгалтер" | "Фізична особа"
  detail: string | null;        // group, employee count, client count, income sources
  volume: string | null;        // monthly operations volume
}

export const emptyPricingCalcProfile: PricingCalcProfile = {
  entityType: null,
  detail: null,
  volume: null,
};

export interface PricingCalcNode {
  aiText: string;
  quickReplies?: string[];
}

export function getPricingCalcGreeting(audience?: "business" | "individual"): PricingCalcNode {
  if (audience === "individual") {
    return {
      aiText: "Допоможу обрати оптимальний тариф для фізичної особи! 🎯\n\nСкільки у вас джерел доходу (зарплата, оренда, інвестиції тощо)?",
      quickReplies: ["1 джерело", "2–3 джерела", "4+ джерел"],
    };
  }
  return {
    aiText: "Допоможу обрати оптимальний тариф! 🎯\n\nДля точної рекомендації, скажіть — ви:",
    quickReplies: ["ФОП", "Директор ТОВ", "Бухгалтер"],
  };
}

export function getPricingCalcFollowUp(step: number, calcProfile: PricingCalcProfile): PricingCalcNode {
  if (step === 1) {
    // Ask for details based on entity type
    switch (calcProfile.entityType) {
      case "ФОП":
        return {
          aiText: "На якій групі спрощеної системи оподаткування ви працюєте?",
          quickReplies: ["1 група", "2 група", "3 група"],
        };
      case "Директор ТОВ":
        return {
          aiText: "Скільки працівників у вашому ТОВ?",
          quickReplies: ["1–5", "6–20", "20+"],
        };
      case "Бухгалтер":
        return {
          aiText: "Скільки клієнтів ви обслуговуєте?",
          quickReplies: ["1–3", "4–10", "10+"],
        };
      case "Фізична особа":
        return {
          aiText: "Скільки у вас джерел доходу (зарплата, оренда, інвестиції тощо)?",
          quickReplies: ["1 джерело", "2–3 джерела", "4+ джерел"],
        };
      default:
        return {
          aiText: "Розкажіть більше про вашу діяльність.",
          quickReplies: ["ФОП", "Директор ТОВ", "Бухгалтер"],
        };
    }
  }

  if (step === 2) {
    // Ask for volume
    if (calcProfile.entityType === "Фізична особа") {
      // For individuals volume question is less relevant, skip to recommendation
      return getPricingRecommendation(calcProfile);
    }
    return {
      aiText: "Скільки приблизно операцій (документів, звітів, платежів) у вас на місяць?",
      quickReplies: ["До 10", "10–50", "50+"],
    };
  }

  // Step 3 = recommendation
  return getPricingRecommendation(calcProfile);
}

export function getPricingRecommendation(calcProfile: PricingCalcProfile): PricingCalcNode {
  const { entityType, detail, volume } = calcProfile;

  // Business plans
  if (entityType === "ФОП") {
    const isGroup3 = detail === "3 група";
    const highVolume = volume === "10–50" || volume === "50+";

    if (isGroup3 || highVolume) {
      return {
        aiText: `✅ **Рекомендую тариф «Смарт» — 399 грн/міс**\n\n` +
          `📦 16 990 кредитів (~165 дій на місяць)\n\n` +
          `Чому саме цей тариф:\n` +
          `• ФОП ${detail || "3 групи"} потребує регулярної звітності — щоквартальна декларація ЄП, можливо ПДВ\n` +
          `• ${highVolume ? "Ваш обсяг операцій потребує більшого пакету кредитів" : "Автоматичний розрахунок ЄП з кожної транзакції"}\n` +
          `• Включає перевірку контрагентів та бонусні кредити\n` +
          `• Вартість однієї дії — від 4.7 грн\n\n` +
          `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
      };
    }

    return {
      aiText: `✅ **Рекомендую тариф «Старт» — 0 ₴/міс (300 кр.)**\n\n` +
        `📦 4 990 кредитів (~46 дій на місяць)\n\n` +
        `Чому саме цей тариф:\n` +
        `• ФОП ${detail || "1–2 групи"} — фіксований ЄП, менше звітності\n` +
        `• Достатньо для щомісячних платіжок, кількох документів та AI-консультацій\n` +
        `• Контроль ліміту доходу та автоматичні нагадування\n` +
        `• Вартість однієї дії — від 8.7 грн\n\n` +
        `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
    };
  }

  if (entityType === "Директор ТОВ") {
    const isLarge = detail === "20+";

    if (isLarge) {
      return {
        aiText: `✅ **Рекомендую тариф «Преміум» — 799 грн/міс**\n\n` +
          `📦 28 990 кредитів (~298 дій на місяць)\n\n` +
          `Чому саме цей тариф:\n` +
          `• Великий штат 20+ потребує повну автоматизацію зарплати та HR\n` +
          `• Персональний менеджер та відповідь підтримки до 4 годин\n` +
          `• Мульти-кабінет для кількох юросіб\n` +
          `• Найвигідніша ціна за дію — від 4 грн\n\n` +
          `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
      };
    }

    return {
      aiText: `✅ **Рекомендую тариф «Смарт» — 399 грн/міс**\n\n` +
        `📦 16 990 кредитів (~165 дій на місяць)\n\n` +
        `Чому саме цей тариф:\n` +
        `• ТОВ з ${detail || "невеликою"} командою — зарплатна звітність, ЄСВ, 1-ДФ\n` +
        `• Автоматичне формування платіжних файлів для банку\n` +
        `• Перевірка контрагентів на ліцензії та санкції\n` +
        `• Дешевше за годину роботи бухгалтера\n\n` +
        `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
    };
  }

  if (entityType === "Бухгалтер") {
    const isLarge = detail === "4–10" || detail === "10+";

    if (isLarge) {
      return {
        aiText: `✅ **Рекомендую тариф «Преміум» — 799 грн/міс**\n\n` +
          `📦 28 990 кредитів (~298 дій на місяць)\n\n` +
          `Чому саме цей тариф:\n` +
          `• ${detail} клієнтів — потрібен мульти-кабінет та масове формування декларацій\n` +
          `• Персональний менеджер для швидкого вирішення питань\n` +
          `• Єдина панель по всіх клієнтах з контролем дедлайнів\n` +
          `• Окупається за 2 години зекономленого часу\n\n` +
          `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
      };
    }

    return {
      aiText: `✅ **Рекомендую тариф «Смарт» — 399 грн/міс**\n\n` +
        `📦 16 990 кредитів (~165 дій на місяць)\n\n` +
        `Чому саме цей тариф:\n` +
        `• ${detail || "1–3"} клієнти — достатньо кредитів для повного ведення\n` +
        `• Автоматичне формування декларацій та звітів\n` +
        `• Пріоритетна підтримка та чат в робочі години\n` +
        `• Бонусні кредити щомісяця\n\n` +
        `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
    };
  }

  if (entityType === "Фізична особа") {
    const multiSources = detail === "2–3 джерела" || detail === "4+ джерел";

    if (detail === "4+ джерел") {
      return {
        aiText: `✅ **Рекомендую тариф «Професійний» — 699 грн/міс**\n\n` +
          `📦 12 000 кредитів (~120 дій)\n\n` +
          `Чому саме цей тариф:\n` +
          `• 4+ джерел доходу — складне декларування потребує повний набір функцій\n` +
          `• Підтримка конвенцій про уникнення подвійного оподаткування\n` +
          `• Персональний податковий консультант\n` +
          `• Е-декларування НАЗК (якщо потрібно)\n\n` +
          `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
      };
    }

    if (multiSources) {
      return {
        aiText: `✅ **Рекомендую тариф «Стандарт» — 349 грн/міс**\n\n` +
          `📦 4 500 кредитів (~45 дій)\n\n` +
          `Чому саме цей тариф:\n` +
          `• 2–3 джерела доходу — потрібен імпорт звітів брокера та облік оренди\n` +
          `• Автоматична конвертація валютних доходів за курсом НБУ\n` +
          `• Пріоритетна підтримка та чат в робочі години\n` +
          `• Вигідніша ціна за дію, ніж у «Базовому»\n\n` +
          `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
      };
    }

    return {
      aiText: `✅ **Рекомендую тариф «Базовий» — 149 грн/міс**\n\n` +
        `📦 1 500 кредитів (~15 дій)\n\n` +
        `Чому саме цей тариф:\n` +
        `• 1 джерело доходу — достатньо для щорічної декларації\n` +
        `• Розрахунок ПДФО та ВЗ автоматично\n` +
        `• Подача через Дію або ДПС в один клік\n` +
        `• Найдоступніший варіант для простих доходів\n\n` +
        `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
    };
  }

  // Fallback
  return {
    aiText: `✅ **Рекомендую тариф «Смарт» — 399 грн/міс**\n\n` +
      `📦 16 990 кредитів (~165 дій на місяць)\n\n` +
      `Це найпопулярніший тариф — покриває більшість потреб бізнесу та включає AI-помічника, документи, податки, зарплату та перевірку контрагентів.\n\n` +
      `Спробуйте 14 днів безкоштовно — без картки! 🚀`,
  };
}
