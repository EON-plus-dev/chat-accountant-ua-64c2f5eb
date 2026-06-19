// Traffic fines (ПДР) — snapshot April 2026
// Legal basis: КУпАП глава 9, Постанови КМУ про штрафи з відеофіксацією

export type TrafficFineCategory =
  | "speeding"
  | "drunk_driving"
  | "parking"
  | "documents"
  | "seatbelt_helmet"
  | "phone"
  | "lights"
  | "tech_state"
  | "insurance"
  | "passenger_freight";

export interface TrafficFine {
  id: string;
  category: TrafficFineCategory;
  violation: string;
  fineAmount: number;       // ₴
  discountedAmount?: number; // ₴ при сплаті протягом 10 днів (50%)
  alternative?: string;     // напр. позбавлення прав
  legalBasis: string;
  legalBasisUrl: string;
  repeatPenalty?: string;
  notes?: string;
  asOf: string;
}

export const TRAFFIC_FINES_AS_OF = "2026-04-01";

export const TRAFFIC_FINES: TrafficFine[] = [
  // ───────── ШВИДКІСТЬ
  {
    id: "tf-speed-20",
    category: "speeding",
    violation: "Перевищення швидкості на 20–50 км/год",
    fineAmount: 340,
    discountedAmount: 170,
    legalBasis: "ст. 122 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    notes: "Автофіксація — на власника ТЗ.",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  {
    id: "tf-speed-50",
    category: "speeding",
    violation: "Перевищення швидкості понад 50 км/год",
    fineAmount: 1700,
    discountedAmount: 850,
    legalBasis: "ст. 122 ч.2 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    repeatPenalty: "Повторне протягом року — 3 400 ₴",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── СВ'ЯНІННЯ
  {
    id: "tf-drunk-1",
    category: "drunk_driving",
    violation: "Керування в стані алкогольного сп'яніння (перше)",
    fineAmount: 17000,
    alternative: "+ позбавлення прав на 1 рік",
    legalBasis: "ст. 130 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    repeatPenalty: "Повторне — 34 000 ₴ + позбавлення на 3 роки",
    notes: "Знижка 50% не застосовується.",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  {
    id: "tf-drunk-refuse",
    category: "drunk_driving",
    violation: "Відмова від огляду на сп'яніння",
    fineAmount: 17000,
    alternative: "+ позбавлення прав на 1 рік",
    legalBasis: "ст. 130 ч.4 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── ПАРКУВАННЯ
  {
    id: "tf-park-invalid",
    category: "parking",
    violation: "Паркування на місці для осіб з інвалідністю",
    fineAmount: 1020,
    discountedAmount: 510,
    legalBasis: "ст. 152-1 ч.4 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    notes: "+ евакуація за рахунок водія",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  {
    id: "tf-park-other",
    category: "parking",
    violation: "Паркування з порушенням ПДР (тротуар, зупинка, газон)",
    fineAmount: 255,
    discountedAmount: 128,
    legalBasis: "ст. 122 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── ДОКУМЕНТИ
  {
    id: "tf-no-license",
    category: "documents",
    violation: "Керування без посвідчення водія",
    fineAmount: 425,
    discountedAmount: 213,
    legalBasis: "ст. 126 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    repeatPenalty: "Повторне — 850 ₴",
    notes: "Якщо ніколи не отримував — 3 400 ₴.",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  {
    id: "tf-no-techpassport",
    category: "documents",
    violation: "Керування без свідоцтва про реєстрацію ТЗ",
    fineAmount: 425,
    discountedAmount: 213,
    legalBasis: "ст. 126 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── РЕМІНЬ / ШОЛОМ
  {
    id: "tf-seatbelt",
    category: "seatbelt_helmet",
    violation: "Не пристебнутий пасок безпеки",
    fineAmount: 510,
    discountedAmount: 255,
    legalBasis: "ст. 121 ч.5 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── ТЕЛЕФОН
  {
    id: "tf-phone",
    category: "phone",
    violation: "Користування телефоном за кермом без hands-free",
    fineAmount: 510,
    discountedAmount: 255,
    legalBasis: "ст. 122 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── ОСВІТЛЕННЯ
  {
    id: "tf-lights",
    category: "lights",
    violation: "Керування без увімкнених денних ходових вогнів",
    fineAmount: 340,
    discountedAmount: 170,
    legalBasis: "ст. 122 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    notes: "Поза містом — обов'язково з 1 жовтня по 1 травня.",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── СТАН ТЗ
  {
    id: "tf-tech-defect",
    category: "tech_state",
    violation: "Керування ТЗ з технічними несправностями",
    fineAmount: 340,
    discountedAmount: 170,
    legalBasis: "ст. 121 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── СТРАХУВАННЯ
  {
    id: "tf-no-osago",
    category: "insurance",
    violation: "Керування без полісу ОСЦПВ",
    fineAmount: 850,
    discountedAmount: 425,
    legalBasis: "ст. 126 ч.1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    notes: "З 2025 поліс електронний у Дії — паперовий не обов'язковий.",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  // ───────── ВАНТАЖНІ / ПАСАЖИРСЬКІ
  {
    id: "tf-overload",
    category: "passenger_freight",
    violation: "Перевантаження вантажного ТЗ (понад 5%)",
    fineAmount: 8500,
    legalBasis: "ст. 132-1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    notes: "За перевищення осьового навантаження або повної маси. Знижка 50% не діє.",
    asOf: TRAFFIC_FINES_AS_OF,
  },
  {
    id: "tf-no-tachograph",
    category: "passenger_freight",
    violation: "Робота без тахографа або з його порушенням",
    fineAmount: 1700,
    discountedAmount: 850,
    legalBasis: "ст. 128-1 КУпАП",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/80731-10",
    notes: "Для вантажних ≥ 3.5 т і пасажирських ≥ 9 місць у міжнародних перевезеннях.",
    asOf: TRAFFIC_FINES_AS_OF,
  },
];

export const TRAFFIC_FINE_CATEGORY_LABEL: Record<TrafficFineCategory, string> = {
  speeding: "Швидкість",
  drunk_driving: "Сп'яніння",
  parking: "Паркування",
  documents: "Документи",
  seatbelt_helmet: "Пасок / шолом",
  phone: "Телефон",
  lights: "Освітлення",
  tech_state: "Технічний стан",
  insurance: "ОСЦПВ",
  passenger_freight: "Вантажні / пасажирські",
};
