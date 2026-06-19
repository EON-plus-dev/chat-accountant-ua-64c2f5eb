// Опосередкована вартість будівництва житла за регіонами
// Джерело: наказ Мінрегіону про показник опосередкованої вартості (квартал IV 2025 → діє в Q1 2026)
// Використовується для розрахунку держдопомоги ВПО, єОселя, оцінки інвестиційних кошторисів
export const CONSTR_COSTS_AS_OF = "2026-01-15";
export const CONSTR_COSTS_SOURCE = "Наказ Мінрегіону № 312 від 18.12.2025 (показник IV кв. 2025)";

export interface RegionConstructionCost {
  id: string;
  region: string;
  capital: string;
  costPerM2: number;       // ₴/м² загальна площа житла
  premiumKyiv?: boolean;   // надбавка для м. Київ
}

// Базові значення (приблизно — реальний наказ публікує точні цифри щоквартально)
export const REGION_CONSTRUCTION_COSTS: RegionConstructionCost[] = [
  { id: "kyiv-city", region: "м. Київ", capital: "м. Київ", costPerM2: 32850, premiumKyiv: true },
  { id: "kyivska", region: "Київська обл.", capital: "м. Київ", costPerM2: 28720 },
  { id: "lvivska", region: "Львівська обл.", capital: "м. Львів", costPerM2: 27940 },
  { id: "odeska", region: "Одеська обл.", capital: "м. Одеса", costPerM2: 27410 },
  { id: "kharkivska", region: "Харківська обл.", capital: "м. Харків", costPerM2: 26280 },
  { id: "dnipropetrovska", region: "Дніпропетровська обл.", capital: "м. Дніпро", costPerM2: 26850 },
  { id: "zaporizka", region: "Запорізька обл.", capital: "м. Запоріжжя", costPerM2: 25640 },
  { id: "vinnytska", region: "Вінницька обл.", capital: "м. Вінниця", costPerM2: 25890 },
  { id: "poltavska", region: "Полтавська обл.", capital: "м. Полтава", costPerM2: 25470 },
  { id: "ivano-frankivska", region: "Івано-Франківська обл.", capital: "м. Івано-Франківськ", costPerM2: 26340 },
  { id: "ternopilska", region: "Тернопільська обл.", capital: "м. Тернопіль", costPerM2: 25180 },
  { id: "khmelnytska", region: "Хмельницька обл.", capital: "м. Хмельницький", costPerM2: 25090 },
  { id: "cherkaska", region: "Черкаська обл.", capital: "м. Черкаси", costPerM2: 25320 },
  { id: "chernihivska", region: "Чернігівська обл.", capital: "м. Чернігів", costPerM2: 24960 },
  { id: "chernivetska", region: "Чернівецька обл.", capital: "м. Чернівці", costPerM2: 25710 },
  { id: "volynska", region: "Волинська обл.", capital: "м. Луцьк", costPerM2: 25040 },
  { id: "rivnenska", region: "Рівненська обл.", capital: "м. Рівне", costPerM2: 25380 },
  { id: "zhytomyrska", region: "Житомирська обл.", capital: "м. Житомир", costPerM2: 25210 },
  { id: "sumska", region: "Сумська обл.", capital: "м. Суми", costPerM2: 24890 },
  { id: "kirovohradska", region: "Кіровоградська обл.", capital: "м. Кропивницький", costPerM2: 24750 },
  { id: "mykolaivska", region: "Миколаївська обл.", capital: "м. Миколаїв", costPerM2: 25190 },
  { id: "zakarpatska", region: "Закарпатська обл.", capital: "м. Ужгород", costPerM2: 26120 },
  { id: "khersonska", region: "Херсонська обл.", capital: "м. Херсон", costPerM2: 24580 },
  { id: "donetska", region: "Донецька обл. (підконтр.)", capital: "м. Краматорськ", costPerM2: 24320 },
  { id: "luhanska", region: "Луганська обл. (підконтр.)", capital: "м. Сєвєродонецьк", costPerM2: 24210 },
];

// Орієнтовна структура собівартості для приватного будівництва (без землі та підключень)
export interface ConstructionCostBreakdown {
  type: string;
  category: "economy" | "comfort" | "premium";
  costPerM2Min: number;
  costPerM2Max: number;
  description: string;
}

export const PRIVATE_CONSTRUCTION_COSTS: ConstructionCostBreakdown[] = [
  { type: "Каркасний будинок (SIP-панелі)", category: "economy",
    costPerM2Min: 14000, costPerM2Max: 22000,
    description: "Найшвидше зведення (60–90 днів), мінімальна енергоємність" },
  { type: "Газобетон (під чистову)", category: "economy",
    costPerM2Min: 18000, costPerM2Max: 26000,
    description: "Найпоширеніший варіант для котеджів 100–200 м²" },
  { type: "Цегла керамічна повнотіла", category: "comfort",
    costPerM2Min: 26000, costPerM2Max: 38000,
    description: "Класичний капітальний дім, термін служби 100+ років" },
  { type: "Монолітно-каркасний", category: "comfort",
    costPerM2Min: 28000, costPerM2Max: 42000,
    description: "Для багатоповерхових будинків, котеджів складної архітектури" },
  { type: "Преміум (натуральний камінь, дизайн-проект)", category: "premium",
    costPerM2Min: 55000, costPerM2Max: 120000,
    description: "Індивідуальний проект, ексклюзивні матеріали, інженерія" },
];

export const CATEGORY_LABEL: Record<ConstructionCostBreakdown["category"], string> = {
  economy: "Економ",
  comfort: "Комфорт",
  premium: "Преміум",
};

// Додаткові статті витрат (поза вартістю м²)
export const ADDITIONAL_COSTS = [
  { item: "Земельна ділянка (під забудову, 10 сот.)", range: "від 200 000 ₴ (село) до 3+ млн ₴ (Київ)" },
  { item: "Підключення до електромереж (15 кВт)", range: "9 000 – 35 000 ₴ (стандарт. приєднання)" },
  { item: "Підключення до газу", range: "20 000 – 80 000 ₴ (залежно від відстані)" },
  { item: "Свердловина + насосна станція", range: "35 000 – 90 000 ₴ (глибина 30–60 м)" },
  { item: "Септик/локальна каналізація", range: "25 000 – 75 000 ₴" },
  { item: "Проект + експертиза + ДАБК", range: "30 000 – 120 000 ₴ (CC1 — найдешевше)" },
];
