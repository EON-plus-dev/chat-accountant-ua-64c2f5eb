// Salary grids for state/budget sectors + market private salaries (snapshot April 2026)
// Sources: Постанова КМУ № 1298, Єдина тарифна сітка, Мінсоцполітики, DOU.ua, robota.ua

export type SalaryGridSector =
  | "education"     // освіта (ЄТС)
  | "healthcare"    // охорона здоров'я
  | "civil_service" // держслужба
  | "military"      // ЗСУ
  | "police"        // поліція
  | "it"            // IT (ринкові)
  | "finance"       // фінанси (ринкові)
  | "industry"      // виробництво (ринкові)
  | "retail";       // ритейл (ринкові)

export interface SalaryGridEntry {
  id: string;
  sector: SalaryGridSector;
  position: string;
  level?: string; // junior/middle/senior або розряд ЄТС
  minSalary: number; // ₴ брутто/міс
  medianSalary: number;
  maxSalary: number;
  region?: string; // якщо суттєво різниться
  notes?: string;
  legalBasis?: string;
  legalBasisUrl?: string;
  asOf: string;
}

export const SALARY_GRIDS_AS_OF = "2026-04-01";
export const MIN_WAGE_2026 = 8000; // ₴ мінімальна зарплата (квітень 2026)
export const SUBSISTENCE_2026 = 3028; // ₴ прожитковий мінімум

export const SALARY_GRIDS: SalaryGridEntry[] = [
  // ───────── ОСВІТА — ЄТС
  {
    id: "edu-teacher-1",
    sector: "education",
    position: "Вчитель школи (вища категорія)",
    level: "12 розряд ЄТС",
    minSalary: 12100,
    medianSalary: 13900,
    maxSalary: 16500,
    notes: "З доплатою за стаж, методичну роботу, перевірку зошитів. Класне керівництво +20%.",
    legalBasis: "Постанова КМУ № 1298",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/1298-2002-%D0%BF",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "edu-prof",
    sector: "education",
    position: "Професор ЗВО (доктор наук)",
    level: "22 розряд ЄТС",
    minSalary: 18200,
    medianSalary: 24500,
    maxSalary: 35000,
    notes: "Базовий оклад + доплата за вчений ступінь (25%), звання (33%), стаж.",
    asOf: SALARY_GRIDS_AS_OF,
  },
  // ───────── ОХОРОНА ЗДОРОВ'Я
  {
    id: "med-doctor",
    sector: "healthcare",
    position: "Лікар-терапевт ПМД",
    minSalary: 20000,
    medianSalary: 28500,
    maxSalary: 45000,
    notes: "За контрактом з НСЗУ через капітаційну ставку (~610 ₴/пацієнт/рік × 1800 декларацій).",
    legalBasis: "Постанова КМУ № 1440, контракти НСЗУ",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "med-nurse",
    sector: "healthcare",
    position: "Медсестра ПМД",
    minSalary: 13500,
    medianSalary: 17000,
    maxSalary: 22000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  // ───────── ДЕРЖСЛУЖБА
  {
    id: "civ-b3",
    sector: "civil_service",
    position: "Головний спеціаліст (категорія Б3)",
    level: "Б3",
    minSalary: 18000,
    medianSalary: 22000,
    maxSalary: 28000,
    notes: "Базовий оклад + надбавка за ранг + вислугу. Без премій.",
    legalBasis: "Закон «Про державну службу» № 889-VIII",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/889-19",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "civ-a3",
    sector: "civil_service",
    position: "Заступник директора департаменту (А3)",
    level: "А3",
    minSalary: 35000,
    medianSalary: 48000,
    maxSalary: 75000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  // ───────── ЗСУ
  {
    id: "mil-soldier",
    sector: "military",
    position: "Військовослужбовець (рядовий, контрактник, не бойова)",
    minSalary: 20100,
    medianSalary: 30000,
    maxSalary: 30000,
    notes: "Базовий оклад + ВПД. На передовій — 100 000 ₴ (постанова КМУ № 168).",
    legalBasis: "Постанова КМУ № 168 від 28.02.2022",
    legalBasisUrl: "https://zakon.rada.gov.ua/laws/show/168-2022-%D0%BF",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "mil-front",
    sector: "military",
    position: "Військовослужбовець на ЛБЗ (передова)",
    minSalary: 100000,
    medianSalary: 100000,
    maxSalary: 120000,
    notes: "Доплата 100 000 ₴ діє доки бере участь у бойових діях, додаткові виплати за поранення/нагороди.",
    asOf: SALARY_GRIDS_AS_OF,
  },
  // ───────── IT
  {
    id: "it-fe-junior",
    sector: "it",
    position: "Frontend Developer Junior",
    level: "junior (0–1.5 років)",
    minSalary: 32000,
    medianSalary: 42000,
    maxSalary: 60000,
    notes: "На ФОП 3 група. У продуктових — outsource +10–15%. DOU.ua snapshot 2026/Q1.",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "it-fe-mid",
    sector: "it",
    position: "Frontend Developer Middle",
    level: "middle (2–4 роки)",
    minSalary: 80000,
    medianSalary: 115000,
    maxSalary: 150000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "it-fe-senior",
    sector: "it",
    position: "Frontend Developer Senior",
    level: "senior (5+ років)",
    minSalary: 130000,
    medianSalary: 180000,
    maxSalary: 260000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "it-devops",
    sector: "it",
    position: "DevOps / SRE",
    level: "middle+",
    minSalary: 120000,
    medianSalary: 175000,
    maxSalary: 280000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "it-pm",
    sector: "it",
    position: "Product Manager",
    minSalary: 95000,
    medianSalary: 140000,
    maxSalary: 220000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  // ───────── ФІНАНСИ
  {
    id: "fin-accountant",
    sector: "finance",
    position: "Головний бухгалтер",
    minSalary: 35000,
    medianSalary: 55000,
    maxSalary: 95000,
    notes: "Залежить від розміру компанії і наявності ЗЕД. Бухгалтер на аутсорс 5–25 тис./клієнт.",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "fin-cfo",
    sector: "finance",
    position: "CFO / Фінансовий директор",
    minSalary: 80000,
    medianSalary: 140000,
    maxSalary: 280000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  // ───────── РИТЕЙЛ
  {
    id: "ret-cashier",
    sector: "retail",
    position: "Касир-продавець (мережа)",
    minSalary: 14500,
    medianSalary: 17500,
    maxSalary: 22000,
    region: "Київ, Дніпро",
    notes: "На руки. Графік 3/3 або 4/2.",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "ret-store-mgr",
    sector: "retail",
    position: "Адміністратор магазину",
    minSalary: 22000,
    medianSalary: 28000,
    maxSalary: 38000,
    asOf: SALARY_GRIDS_AS_OF,
  },
  // ───────── ВИРОБНИЦТВО
  {
    id: "ind-worker",
    sector: "industry",
    position: "Робітник виробничої лінії",
    minSalary: 16000,
    medianSalary: 20000,
    maxSalary: 28000,
    notes: "На руки. Доплата за нічні зміни +40%.",
    asOf: SALARY_GRIDS_AS_OF,
  },
  {
    id: "ind-welder",
    sector: "industry",
    position: "Зварювальник (5 розряд)",
    minSalary: 25000,
    medianSalary: 35000,
    maxSalary: 55000,
    asOf: SALARY_GRIDS_AS_OF,
  },
];

export const SALARY_SECTOR_LABEL: Record<SalaryGridSector, string> = {
  education: "Освіта",
  healthcare: "Охорона здоров'я",
  civil_service: "Держслужба",
  military: "ЗСУ і силові",
  police: "Поліція",
  it: "IT",
  finance: "Фінанси",
  industry: "Виробництво",
  retail: "Ритейл і HoReCa",
};
