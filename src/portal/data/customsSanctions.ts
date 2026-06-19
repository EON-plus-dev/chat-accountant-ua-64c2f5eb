/**
 * Санкційні та обмежені до експорту/імпорту товари за УКТ ЗЕД.
 *
 * Джерела:
 *  • Постанова КМУ № 1147 від 30.12.2015 (заборона ввезення з РФ)
 *  • Постанова КМУ № 187 від 11.03.2022 (припинення зовнішньоекономічних
 *    операцій з товарами РФ/РБ)
 *  • Регламент ЄС 833/2014 з 2022 змін (експортний контроль до РФ)
 *  • Закон України «Про санкції» (1644-VII від 2014)
 *  • Перелік товарів подвійного використання (dual-use) — Постанова КМУ 1807
 *  • РНБО (рішення про санкції конкретних періодів)
 */

export type RestrictionType =
  | 'prohibited'      // повна заборона
  | 'licensed'        // потрібна окрема ліцензія/дозвіл
  | 'dual_use'        // подвійне використання
  | 'sanctioned_origin' // заборона за країною походження
  | 'quota';          // обмежено квотою

export const RESTRICTION_LABEL: Record<RestrictionType, string> = {
  prohibited: 'Заборонено',
  licensed: 'Ліцензія',
  dual_use: 'Подвійне використання',
  sanctioned_origin: 'Санкція за походженням',
  quota: 'Квота',
};

export type TargetCountry = 'RU' | 'BY' | 'IR' | 'KP' | 'EU' | 'global';

export const TARGET_COUNTRY_LABEL: Record<TargetCountry, string> = {
  RU: 'Російська Федерація',
  BY: 'Республіка Білорусь',
  IR: 'Іран',
  KP: 'КНДР',
  EU: 'ЄС (експорт)',
  global: 'Усі юрисдикції',
};

export interface CustomsSanctionEntry {
  id: string;
  uktZedCode: string;
  description: string;
  targetCountries: TargetCountry[];
  restrictionType: RestrictionType;
  direction: 'import' | 'export' | 'both';
  legalBasis: string;
  legalBasisUrl: string;
  validFrom: string;
  validUntil?: string;
  /** Коротка примітка про умови дозволу/винятку */
  exemption?: string;
}

export const CUSTOMS_SANCTIONS_AS_OF = '2026-04-15';

export const CUSTOMS_SANCTIONS: CustomsSanctionEntry[] = [
  {
    id: 'cs-ru-all',
    uktZedCode: '01-97',
    description: 'Будь-які товари походженням з РФ',
    targetCountries: ['RU'],
    restrictionType: 'prohibited',
    direction: 'import',
    legalBasis: 'Постанова КМУ № 1147 від 30.12.2015 (зі змінами 2022)',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/1147-2015-%D0%BF',
    validFrom: '2016-01-10',
  },
  {
    id: 'cs-by-all',
    uktZedCode: '01-97',
    description: 'Товари походженням з Республіки Білорусь (фактично з 2022)',
    targetCountries: ['BY'],
    restrictionType: 'prohibited',
    direction: 'import',
    legalBasis: 'Постанова КМУ № 187 від 11.03.2022',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/187-2022-%D0%BF',
    validFrom: '2022-03-11',
  },
  {
    id: 'cs-2710-ru',
    uktZedCode: '2710',
    description: 'Нафтопродукти російського/білоруського походження',
    targetCountries: ['RU', 'BY'],
    restrictionType: 'prohibited',
    direction: 'import',
    legalBasis: 'Постанова КМУ № 187 від 11.03.2022',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/187-2022-%D0%BF',
    validFrom: '2022-03-11',
  },
  {
    id: 'cs-dualuse-mil',
    uktZedCode: '9013, 9014',
    description: 'Прицільні пристрої, оптика для зброї (dual-use)',
    targetCountries: ['RU', 'BY', 'IR', 'KP'],
    restrictionType: 'dual_use',
    direction: 'export',
    legalBasis: 'Постанова КМУ № 1807 від 28.01.2004 (Порядок здійснення держконтролю)',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/1807-2003-%D0%BF',
    validFrom: '2004-02-15',
    exemption: 'Потрібен дозвіл Держекспортконтролю на кожну партію',
  },
  {
    id: 'cs-dualuse-it',
    uktZedCode: '8542, 8543',
    description: 'Спеціалізовані інтегральні схеми, шифрувальне обладнання',
    targetCountries: ['RU', 'BY', 'IR'],
    restrictionType: 'dual_use',
    direction: 'export',
    legalBasis: 'Постанова КМУ № 1807; Регламент ЄС 2021/821',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/1807-2003-%D0%BF',
    validFrom: '2004-02-15',
    exemption: 'Дозвіл Держекспортконтролю; ліцензія МЗС',
  },
  {
    id: 'cs-7601-export',
    uktZedCode: '7601',
    description: 'Алюміній необроблений — обмеження експорту в РФ',
    targetCountries: ['RU'],
    restrictionType: 'prohibited',
    direction: 'export',
    legalBasis: 'Регламент ЄС 833/2014; ЗУ «Про санкції»',
    legalBasisUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0833',
    validFrom: '2022-04-08',
  },
  {
    id: 'cs-2701-export',
    uktZedCode: '2701',
    description: 'Вугілля кам\'яне — заборона експорту з РФ',
    targetCountries: ['RU'],
    restrictionType: 'sanctioned_origin',
    direction: 'import',
    legalBasis: 'Регламент ЄС 833/2014; ПКМУ 187',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/187-2022-%D0%BF',
    validFrom: '2022-04-08',
  },
  {
    id: 'cs-9301',
    uktZedCode: '9301-9307',
    description: 'Зброя військова, боєприпаси',
    targetCountries: ['global'],
    restrictionType: 'licensed',
    direction: 'both',
    legalBasis: 'ЗУ «Про державний контроль за міжнародними передачами товарів військового призначення»',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/549-15',
    validFrom: '2003-02-20',
    exemption: 'Дозвіл Держекспортконтролю; виключно через спецекспортерів',
  },
  {
    id: 'cs-3823-pseudo',
    uktZedCode: '2933, 2939',
    description: 'Прекурсори наркотичних/психотропних речовин',
    targetCountries: ['global'],
    restrictionType: 'licensed',
    direction: 'both',
    legalBasis: 'ЗУ «Про обіг прекурсорів»; Постанова КМУ № 770',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/1953-15',
    validFrom: '2010-11-25',
    exemption: 'Ліцензія Держслужби з лікарських засобів',
  },
  {
    id: 'cs-luxury-ru',
    uktZedCode: '7113, 7114, 7116, 9101, 9102',
    description: 'Ювелірні вироби, годинники — експорт в РФ',
    targetCountries: ['RU'],
    restrictionType: 'prohibited',
    direction: 'export',
    legalBasis: 'Регламент ЄС 833/2014 (5-й пакет санкцій)',
    legalBasisUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0833',
    validFrom: '2022-04-08',
  },
  {
    id: 'cs-8704-mil',
    uktZedCode: '8704',
    description: 'Транспортні засоби спецпризначення (армійські)',
    targetCountries: ['RU', 'BY', 'IR'],
    restrictionType: 'dual_use',
    direction: 'export',
    legalBasis: 'Постанова КМУ № 1807',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/1807-2003-%D0%BF',
    validFrom: '2004-02-15',
    exemption: 'Дозвіл Держекспортконтролю',
  },
  {
    id: 'cs-7108-gold',
    uktZedCode: '7108',
    description: 'Золото в злитках — імпорт з РФ',
    targetCountries: ['RU'],
    restrictionType: 'prohibited',
    direction: 'import',
    legalBasis: 'Регламент ЄС 2022/1269 (7-й пакет санкцій)',
    legalBasisUrl: 'https://eur-lex.europa.eu/eli/reg/2022/1269/oj',
    validFrom: '2022-07-21',
  },
  {
    id: 'cs-uav',
    uktZedCode: '8806',
    description: 'Безпілотні літальні апарати (БпЛА) і їх компоненти',
    targetCountries: ['RU', 'BY', 'IR'],
    restrictionType: 'dual_use',
    direction: 'export',
    legalBasis: 'Постанова КМУ № 1807; РНБО від 2023',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/1807-2003-%D0%BF',
    validFrom: '2023-02-15',
    exemption: 'Дозвіл Держекспортконтролю; для оборонних замовлень — спецпорядок',
  },
  {
    id: 'cs-cement-ru',
    uktZedCode: '2523',
    description: 'Цемент походженням з РФ',
    targetCountries: ['RU'],
    restrictionType: 'prohibited',
    direction: 'import',
    legalBasis: 'ПКМУ 1147',
    legalBasisUrl: 'https://zakon.rada.gov.ua/laws/show/1147-2015-%D0%BF',
    validFrom: '2016-01-10',
  },
];

export function getSanctionsForCode(code: string): CustomsSanctionEntry[] {
  return CUSTOMS_SANCTIONS.filter((s) => {
    if (s.uktZedCode.includes('-')) {
      // діапазон, напр. "9301-9307"
      const [from, to] = s.uktZedCode.split('-');
      const num = parseInt(code.slice(0, 4), 10);
      return num >= parseInt(from, 10) && num <= parseInt(to, 10);
    }
    return s.uktZedCode.split(',').map((c) => c.trim()).some((c) => code.startsWith(c));
  });
}
