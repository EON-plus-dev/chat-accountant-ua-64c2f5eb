/**
 * Методологія індексів та історичні дані ключових цифр
 * Центральний довідник для сторінки /analytics
 */

// ── Типи ────────────────────────────────────────────────────────

export interface IndexMethodology {
  id: string;
  formula: string;
  formulaDescription: string;
  sources: { name: string; url: string }[];
  updateFrequency: string;
  historicalData: { label: string; value: number }[];
  whyItMatters: string;
}

export interface KeyFigureYear {
  year: number;
  value: number;
  label: string;
}

export interface KeyFigureHistory {
  id: string;
  name: string;
  currentValue: string;
  unit: string;
  years: KeyFigureYear[];
  impact: string;
  legalBasis: string;
  totalGrowth: string;
}

// ── Методологія індексів (бізнес) ──────────────────────────────

export const BUSINESS_INDEX_METHODOLOGY: IndexMethodology[] = [
  {
    id: "tax-freedom",
    formula: "(ЄП + ВЗ + ЄСВ) ÷ Дохід × 365",
    formulaDescription: "Сума всіх обов'язкових платежів ФОП відносно доходу, перерахована в дні року. Показує, скільки днів ФОП «працює на державу».",
    sources: [
      { name: "ПКУ (ст. 293–298)", url: "https://zakon.rada.gov.ua/laws/show/2755-17" },
      { name: "ЗУ «Про ЄСВ»", url: "https://zakon.rada.gov.ua/laws/show/2464-17" },
    ],
    updateFrequency: "Щорічно (при зміні ставок або МЗП)",
    historicalData: [
      { label: "2022", value: 38 }, { label: "2023", value: 40 },
      { label: "2024", value: 42 }, { label: "2025 H1", value: 44 },
      { label: "2025 H2", value: 45 }, { label: "2026", value: 45 },
    ],
    whyItMatters: "Візуалізує реальне податкове навантаження: чим пізніше дата — тим більше ви віддаєте державі.",
  },
  {
    id: "tax-burden",
    formula: "(ЄП + ЄСВ + ВЗ) ÷ Дохід × 100%",
    formulaDescription: "Ефективна ставка оподаткування для кожної групи ЄП. Враховує фіксовані платежі (ЄСВ, ЄП для 1-2 гр.) та процентні (ЄП 5% для 3 гр., ВЗ).",
    sources: [
      { name: "ПКУ (ст. 293)", url: "https://zakon.rada.gov.ua/laws/show/2755-17" },
    ],
    updateFrequency: "При зміні ставок ЄП, ЄСВ або ВЗ",
    historicalData: [
      { label: "2022", value: 7.2 }, { label: "2023", value: 7.5 },
      { label: "2024", value: 8.1 }, { label: "2025", value: 10.8 },
      { label: "2026 (прогноз)", value: 12.2 }, { label: "2026", value: 12.2 },
    ],
    whyItMatters: "Дозволяє порівняти реальне навантаження між групами ФОП та обрати оптимальну.",
  },
  {
    id: "employee-cost",
    formula: "Зарплата × (1 + ЄСВ 22% + адмін ~15%)",
    formulaDescription: "Повна вартість одного працівника для роботодавця. Включає ЄСВ 22%, адміністративні витрати (бухгалтерія, HR, робоче місце).",
    sources: [
      { name: "ЗУ «Про ЄСВ» (ст. 8)", url: "https://zakon.rada.gov.ua/laws/show/2464-17" },
    ],
    updateFrequency: "При зміні ставки ЄСВ або МЗП",
    historicalData: [
      { label: "2022", value: 1.34 }, { label: "2023", value: 1.35 },
      { label: "2024", value: 1.36 }, { label: "2025", value: 1.37 },
      { label: "2026", value: 1.37 }, { label: "2026+", value: 1.37 },
    ],
    whyItMatters: "Кожні 1 000 ₴ зарплати коштують роботодавцю ~1 370 ₴. Критично для планування ФОП.",
  },
  {
    id: "reg-pulse",
    formula: "Count(законодавчих змін за 30 днів)",
    formulaDescription: "Кількість нормативних актів, що впливають на бізнес, опублікованих за останні 30 днів. Парсинг джерел: Верховна Рада, КМУ, НБУ, ДПС.",
    sources: [
      { name: "Верховна Рада", url: "https://zakon.rada.gov.ua" },
      { name: "КМУ", url: "https://www.kmu.gov.ua" },
    ],
    updateFrequency: "Щоденно",
    historicalData: [
      { label: "Жов", value: 4 }, { label: "Лис", value: 6 },
      { label: "Гру", value: 12 }, { label: "Січ", value: 8 },
      { label: "Лют", value: 5 }, { label: "Бер", value: 7 },
    ],
    whyItMatters: "Високий темп змін = ризик пропустити важливе. FINTODO моніторить автоматично.",
  },
  {
    id: "currency",
    formula: "Офіційний курс НБУ (mid-rate)",
    formulaDescription: "Офіційний курс Національного банку України, встановлюється щоденно о 10:00. Для ЗЕД операцій — перерахунок за датою митної декларації.",
    sources: [
      { name: "НБУ Open Data", url: "https://bank.gov.ua/ua/open-data/api-dev" },
    ],
    updateFrequency: "Щоденно о 10:00 (крім вихідних)",
    historicalData: [
      { label: "2022", value: 36.57 }, { label: "2023", value: 37.54 },
      { label: "2024 Q1", value: 38.20 }, { label: "2024 Q3", value: 41.05 },
      { label: "2025 Q1", value: 41.25 }, { label: "2026 Q1", value: 41.25 },
    ],
    whyItMatters: "Впливає на вартість імпорту, ЗЕД та валютні операції ФОП.",
  },
  {
    id: "fop-optimize",
    formula: "Порівняння: Дохід × ЄП% + ЄСВ + ВЗ для кожної групи",
    formulaDescription: "Визначає оптимальну групу ЄП за рівнем доходу. При доході понад ~300K ₴/рік ФОП 3 групи (5%) вигідніша за фіксовані платежі 1-2 груп.",
    sources: [
      { name: "ПКУ (ст. 291–298)", url: "https://zakon.rada.gov.ua/laws/show/2755-17" },
    ],
    updateFrequency: "При зміні ставок або лімітів ЄП",
    historicalData: [
      { label: "2022", value: 250 }, { label: "2023", value: 280 },
      { label: "2024", value: 300 }, { label: "2025", value: 320 },
      { label: "2026", value: 350 }, { label: "2026+", value: 350 },
    ],
    whyItMatters: "Поріг беззбитковості зростає — 3 група стає вигідною при все вищому доході.",
  },
];

// ── Методологія індексів (фізособи) ────────────────────────────

export const INDIVIDUAL_INDEX_METHODOLOGY: IndexMethodology[] = [
  {
    id: "tax-wedge",
    formula: "ПДФО 18% + ВЗ 5% = 23%",
    formulaDescription: "Різниця між gross і net зарплатою. Роботодавець утримує ПДФО та ВЗ при нарахуванні, працівник отримує 77% від gross.",
    sources: [
      { name: "ПКУ (ст. 167, 168)", url: "https://zakon.rada.gov.ua/laws/show/2755-17" },
    ],
    updateFrequency: "При зміні ставок ПДФО або ВЗ",
    historicalData: [
      { label: "2022", value: 19.5 }, { label: "2023", value: 19.5 },
      { label: "2024", value: 19.5 }, { label: "2025 H1", value: 23 },
      { label: "2025 H2", value: 23 }, { label: "2026", value: 23 },
    ],
    whyItMatters: "ВЗ зріс з 1.5% до 5% — ваш net-дохід зменшився на ~3.5 п.п.",
  },
  {
    id: "real-wage",
    formula: "Номінальне зростання ЗП (%) − Інфляція ІСЦ (%)",
    formulaDescription: "Показує реальну зміну купівельної спроможності зарплат. Від'ємне значення означає, що ціни зростають швидше за зарплати.",
    sources: [
      { name: "Держстат (ЗП)", url: "https://ukrstat.gov.ua" },
      { name: "Держстат (ІСЦ)", url: "https://ukrstat.gov.ua" },
    ],
    updateFrequency: "Щомісяця",
    historicalData: [
      { label: "2022", value: -15.2 }, { label: "2023", value: 8.4 },
      { label: "2024 Q1", value: 4.2 }, { label: "2024 Q3", value: -1.5 },
      { label: "2025 Q1", value: -3.2 }, { label: "2026 Q1", value: -3.2 },
    ],
    whyItMatters: "Навіть при зростанні номінальної ЗП ваша купівельна спроможність може падати.",
  },
  {
    id: "currency",
    formula: "Офіційний курс НБУ (mid-rate)",
    formulaDescription: "Курс гривні до долара та євро. Впливає на ціни імпортних товарів та вартість подорожей.",
    sources: [
      { name: "НБУ", url: "https://bank.gov.ua" },
    ],
    updateFrequency: "Щоденно",
    historicalData: [
      { label: "2022", value: 36.57 }, { label: "2023", value: 37.54 },
      { label: "2024 Q1", value: 38.20 }, { label: "2024 Q3", value: 41.05 },
      { label: "2025 Q1", value: 41.25 }, { label: "2026 Q1", value: 41.25 },
    ],
    whyItMatters: "Слабша гривня = дорожчі імпортні товари та подорожі.",
  },
  {
    id: "inflation",
    formula: "ІСЦ = Σ(Ціна_t ÷ Ціна_t-1 × Вага) × 100",
    formulaDescription: "Індекс споживчих цін вимірює зміну вартості фіксованого кошика товарів і послуг. Розраховується Держстатом за методологією МВФ.",
    sources: [
      { name: "Держстат", url: "https://ukrstat.gov.ua" },
      { name: "НБУ (таргет)", url: "https://bank.gov.ua/ua/monetary/inflation/inflation-targets" },
    ],
    updateFrequency: "Щомісяця, ~10 числа",
    historicalData: [
      { label: "2022", value: 26.6 }, { label: "2023", value: 5.1 },
      { label: "2024 Q1", value: 3.2 }, { label: "2024 Q3", value: 9.8 },
      { label: "2025 Q1", value: 12.8 }, { label: "2026 Q1", value: 12.8 },
    ],
    whyItMatters: "При інфляції 12.8% ваші 100 000 ₴ за рік втрачають 12 800 ₴ купівельної спроможності.",
  },
  {
    id: "basket",
    formula: "Σ(Ціна × Кількість) для 296 позицій кошика",
    formulaDescription: "Вартість базового набору продуктів, комунальних послуг та транспорту на 1 особу на місяць. Фактична вартість удвічі перевищує офіційний ПМ.",
    sources: [
      { name: "Держстат", url: "https://ukrstat.gov.ua" },
      { name: "Opendatabot", url: "https://opendatabot.ua" },
    ],
    updateFrequency: "Щомісяця",
    historicalData: [
      { label: "2022", value: 4200 }, { label: "2023", value: 5100 },
      { label: "2024 Q1", value: 5500 }, { label: "2024 Q3", value: 6200 },
      { label: "2025 Q1", value: 6800 }, { label: "2026 Q1", value: 6800 },
    ],
    whyItMatters: "Реальний прожитковий мінімум — ~6 800 ₴, тоді як офіційний ПМ лише 3 328 ₴.",
  },
  {
    id: "invest",
    formula: "Депозит net = Gross × (1 − ПДФО 18% − ВЗ 5%); ОВДП net = Gross (звільнені)",
    formulaDescription: "Порівняння чистої дохідності після оподаткування: депозити оподатковуються (ПДФО + ВЗ), ОВДП — ні.",
    sources: [
      { name: "Мінфін (ОВДП)", url: "https://mof.gov.ua" },
      { name: "НБУ (банки)", url: "https://bank.gov.ua" },
    ],
    updateFrequency: "Щотижня (аукціони ОВДП)",
    historicalData: [
      { label: "2022", value: 18.0 }, { label: "2023", value: 16.5 },
      { label: "2024 Q1", value: 15.8 }, { label: "2024 Q3", value: 14.8 },
      { label: "2025 Q1", value: 14.2 }, { label: "2026 Q1", value: 14.2 },
    ],
    whyItMatters: "ОВДП без ПДФО: 14.2% чистими vs депозит ~15% gross → ~11.6% net.",
  },
];

// ── Ключові цифри з історією ───────────────────────────────────

export const KEY_FIGURES_HISTORY: KeyFigureHistory[] = [
  {
    id: "mzp",
    name: "Мінімальна зарплата",
    currentValue: "8 647 ₴",
    unit: "грн/міс",
    years: [
      { year: 2022, value: 6500, label: "6 500 ₴" },
      { year: 2023, value: 6700, label: "6 700 ₴" },
      { year: 2024, value: 8000, label: "8 000 ₴" },
      { year: 2025, value: 8000, label: "8 000 ₴" },
      { year: 2026, value: 8647, label: "8 647 ₴" },
    ],
    impact: "Впливає на: ЄП (1-2 гр.), ЄСВ, штрафи, аліменти",
    legalBasis: "ЗУ «Про Державний бюджет на 2026 рік»",
    totalGrowth: "+33%",
  },
  {
    id: "esv-min",
    name: "Мінімальний ЄСВ",
    currentValue: "1 902 ₴",
    unit: "грн/міс",
    years: [
      { year: 2022, value: 1430, label: "1 430 ₴" },
      { year: 2023, value: 1474, label: "1 474 ₴" },
      { year: 2024, value: 1760, label: "1 760 ₴" },
      { year: 2025, value: 1760, label: "1 760 ₴" },
      { year: 2026, value: 1902, label: "1 902 ₴" },
    ],
    impact: "Обов'язковий для всіх ФОП (крім пенсіонерів, осіб з інвалідністю)",
    legalBasis: "ЗУ «Про ЄСВ» (ст. 8) — 22% від МЗП",
    totalGrowth: "+33%",
  },
  {
    id: "ep-gr1",
    name: "ЄП Група 1",
    currentValue: "332,80 ₴",
    unit: "грн/міс",
    years: [
      { year: 2022, value: 248.10, label: "248 ₴" },
      { year: 2023, value: 268.40, label: "268 ₴" },
      { year: 2024, value: 302.80, label: "303 ₴" },
      { year: 2025, value: 302.80, label: "303 ₴" },
      { year: 2026, value: 332.80, label: "333 ₴" },
    ],
    impact: "Фіксований щомісячний платіж для ФОП 1 групи",
    legalBasis: "ПКУ ст. 293.1 — до 10% ПМ для працездатних",
    totalGrowth: "+34%",
  },
  {
    id: "ep-gr2",
    name: "ЄП Група 2",
    currentValue: "1 729 ₴",
    unit: "грн/міс",
    years: [
      { year: 2022, value: 1300, label: "1 300 ₴" },
      { year: 2023, value: 1340, label: "1 340 ₴" },
      { year: 2024, value: 1600, label: "1 600 ₴" },
      { year: 2025, value: 1600, label: "1 600 ₴" },
      { year: 2026, value: 1729, label: "1 729 ₴" },
    ],
    impact: "Фіксований щомісячний платіж для ФОП 2 групи",
    legalBasis: "ПКУ ст. 293.1 — до 20% МЗП",
    totalGrowth: "+33%",
  },
  {
    id: "vz",
    name: "Військовий збір (ФОП 1-2)",
    currentValue: "864,70 ₴",
    unit: "грн/міс",
    years: [
      { year: 2022, value: 0, label: "—" },
      { year: 2023, value: 0, label: "—" },
      { year: 2024, value: 0, label: "—" },
      { year: 2025, value: 800, label: "800 ₴" },
      { year: 2026, value: 865, label: "865 ₴" },
    ],
    impact: "Новий обов'язковий платіж для ФОП 1-2 груп з 2025 року",
    legalBasis: "ПКУ ст. 161 — 10% від МЗП для 1-2 груп",
    totalGrowth: "новий з 2025",
  },
  {
    id: "limit-gr3",
    name: "Ліміт ФОП 3 групи",
    currentValue: "10.09 млн ₴",
    unit: "грн/рік",
    years: [
      { year: 2022, value: 7585, label: "7.59 млн" },
      { year: 2023, value: 7818, label: "7.82 млн" },
      { year: 2024, value: 8285, label: "8.29 млн" },
      { year: 2025, value: 8285, label: "8.29 млн" },
      { year: 2026, value: 10091, label: "10.09 млн" },
    ],
    impact: "Максимальний річний дохід для перебування на 3 групі ЄП",
    legalBasis: "ПКУ ст. 291.4 — 1168 МЗП",
    totalGrowth: "+33%",
  },
  {
    id: "pdfo",
    name: "ПДФО (основна ставка)",
    currentValue: "18%",
    unit: "%",
    years: [
      { year: 2022, value: 18, label: "18%" },
      { year: 2023, value: 18, label: "18%" },
      { year: 2024, value: 18, label: "18%" },
      { year: 2025, value: 18, label: "18%" },
      { year: 2026, value: 18, label: "18%" },
    ],
    impact: "Базова ставка для зарплат, оренди, дивідендів",
    legalBasis: "ПКУ ст. 167.1",
    totalGrowth: "без змін",
  },
  {
    id: "pm",
    name: "Прожитковий мінімум",
    currentValue: "3 328 ₴",
    unit: "грн/міс",
    years: [
      { year: 2022, value: 2589, label: "2 589 ₴" },
      { year: 2023, value: 2684, label: "2 684 ₴" },
      { year: 2024, value: 3028, label: "3 028 ₴" },
      { year: 2025, value: 3028, label: "3 028 ₴" },
      { year: 2026, value: 3328, label: "3 328 ₴" },
    ],
    impact: "Впливає на: штрафи, держмито, аліменти, пенсії",
    legalBasis: "ЗУ «Про Державний бюджет»",
    totalGrowth: "+29%",
  },
  {
    id: "shtraf-worker",
    name: "Штраф за неоформлення",
    currentValue: "86 470 ₴",
    unit: "грн/працівник",
    years: [
      { year: 2022, value: 65000, label: "65 000 ₴" },
      { year: 2023, value: 67000, label: "67 000 ₴" },
      { year: 2024, value: 80000, label: "80 000 ₴" },
      { year: 2025, value: 80000, label: "80 000 ₴" },
      { year: 2026, value: 86470, label: "86 470 ₴" },
    ],
    impact: "10 МЗП за кожного неоформленого працівника, повторно — 20 МЗП",
    legalBasis: "КЗпП ст. 265",
    totalGrowth: "+33%",
  },
  {
    id: "fin-monitoring",
    name: "Поріг фінмоніторингу",
    currentValue: "400 000 ₴",
    unit: "грн",
    years: [
      { year: 2022, value: 400000, label: "400 000 ₴" },
      { year: 2023, value: 400000, label: "400 000 ₴" },
      { year: 2024, value: 400000, label: "400 000 ₴" },
      { year: 2025, value: 400000, label: "400 000 ₴" },
      { year: 2026, value: 400000, label: "400 000 ₴" },
    ],
    impact: "P2P перекази понад цю суму потрапляють під фін. моніторинг",
    legalBasis: "ЗУ «Про запобігання та протидію» (ст. 20)",
    totalGrowth: "без змін",
  },
];

export function getMethodologyForIndex(indexId: string, audience: "business" | "individual"): IndexMethodology | undefined {
  const list = audience === "individual" ? INDIVIDUAL_INDEX_METHODOLOGY : BUSINESS_INDEX_METHODOLOGY;
  return list.find(m => m.id === indexId);
}
