export interface SalaryBenchmark {
  id: string;
  position: string;
  category: string;
  region: string;
  experienceLevel: 'junior' | 'middle' | 'senior';
  salaryMedian: number;
  salaryMin: number;
  salaryMax: number;
  currency: 'UAH' | 'USD';
  updatedAt: string;
  source: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  demandLevel: 'high' | 'medium' | 'low';
  topSkills: string[];
}

export const SALARY_BENCHMARKS: SalaryBenchmark[] = [
  {
    id: 'accountant-kyiv-middle',
    position: 'Бухгалтер',
    category: 'Бухгалтерія та фінанси',
    region: 'Київ',
    experienceLevel: 'middle',
    salaryMedian: 25000,
    salaryMin: 18000,
    salaryMax: 40000,
    currency: 'UAH',
    updatedAt: 'Березень 2025',
    source: 'Work.ua',
    trend: 'up',
    trendPercent: 15,
    demandLevel: 'high',
    topSkills: ['1C', 'BAS', 'FINTODO', 'MEDOC', 'Excel'],
  },
  {
    id: 'chief-accountant-kyiv-senior',
    position: 'Головний бухгалтер',
    category: 'Бухгалтерія та фінанси',
    region: 'Київ',
    experienceLevel: 'senior',
    salaryMedian: 45000,
    salaryMin: 30000,
    salaryMax: 80000,
    currency: 'UAH',
    updatedAt: 'Березень 2025',
    source: 'Work.ua',
    trend: 'up',
    trendPercent: 10,
    demandLevel: 'high',
    topSkills: ['МСФЗ', 'ПДВ', 'BAS', 'Управлінський облік'],
  },
  {
    id: 'it-developer-kyiv-middle',
    position: 'Frontend розробник',
    category: 'IT',
    region: 'Дистанційно',
    experienceLevel: 'middle',
    salaryMedian: 2500,
    salaryMin: 1500,
    salaryMax: 4500,
    currency: 'USD',
    updatedAt: 'Березень 2025',
    source: 'Djinni',
    trend: 'stable',
    trendPercent: 0,
    demandLevel: 'high',
    topSkills: ['React', 'TypeScript', 'Next.js'],
  },
  {
    id: 'hr-manager-kyiv-middle',
    position: 'HR-менеджер',
    category: 'HR та рекрутинг',
    region: 'Київ',
    experienceLevel: 'middle',
    salaryMedian: 22000,
    salaryMin: 15000,
    salaryMax: 35000,
    currency: 'UAH',
    updatedAt: 'Березень 2025',
    source: 'Work.ua',
    trend: 'up',
    trendPercent: 8,
    demandLevel: 'medium',
    topSkills: ['Recruiting', 'HR системи', 'Трудове право'],
  },
  {
    id: 'sales-manager-kyiv-middle',
    position: 'Менеджер з продажів',
    category: 'Продажі',
    region: 'Київ',
    experienceLevel: 'middle',
    salaryMedian: 20000,
    salaryMin: 12000,
    salaryMax: 50000,
    currency: 'UAH',
    updatedAt: 'Березень 2025',
    source: 'Work.ua',
    trend: 'stable',
    trendPercent: 3,
    demandLevel: 'high',
    topSkills: ['CRM', 'B2B продажі', 'Переговори'],
  },
  {
    id: 'lawyer-kyiv-middle',
    position: 'Юрист',
    category: 'Юридичні послуги',
    region: 'Київ',
    experienceLevel: 'middle',
    salaryMedian: 28000,
    salaryMin: 18000,
    salaryMax: 55000,
    currency: 'UAH',
    updatedAt: 'Березень 2025',
    source: 'Work.ua',
    trend: 'up',
    trendPercent: 12,
    demandLevel: 'medium',
    topSkills: ['Договірне право', 'Корпоративне право', 'Судовий захист'],
  },
];

export const LABOR_CATEGORIES = [
  'Бухгалтерія та фінанси',
  'IT',
  'HR та рекрутинг',
  'Продажі',
  'Юридичні послуги',
  'Маркетинг',
  'Логістика',
];

export const LABOR_REGIONS = ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів', 'Дистанційно'];
