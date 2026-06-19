// Stage 14: Каталог звітних форм (фіскальна звітність)
// Snapshot: 2026-04

export type FormCategory =
  | 'income_tax'   // ПДФО / ВЗ
  | 'esv'          // ЄСВ
  | 'vat'          // ПДВ
  | 'single_tax'   // ЄП
  | 'financial'    // Фінзвітність
  | 'profit'       // Податок на прибуток
  | 'property'     // Майнові
  | 'other';

export const FORM_CATEGORY_LABEL: Record<FormCategory, string> = {
  income_tax: 'ПДФО і військовий збір',
  esv: 'ЄСВ',
  vat: 'ПДВ',
  single_tax: 'Єдиний податок',
  financial: 'Фінансова звітність',
  profit: 'Податок на прибуток',
  property: 'Майнові податки',
  other: 'Інше',
};

export type FormSubmitter = 'fop' | 'tov' | 'individual' | 'employer';

export const FORM_SUBMITTER_LABEL: Record<FormSubmitter, string> = {
  fop: 'ФОП',
  tov: 'Юрособи',
  individual: 'Фізособи',
  employer: 'Роботодавці',
};

export type FormFrequency = 'monthly' | 'quarterly' | 'yearly' | 'event' | 'once';

export const FORM_FREQUENCY_LABEL: Record<FormFrequency, string> = {
  monthly: 'Щомісяця',
  quarterly: 'Щокварталу',
  yearly: 'Щорічно',
  event: 'За подією',
  once: 'Одноразово',
};

export interface ReportingForm {
  id: string;
  code: string;            // напр. "4ДФ", "Декларація платника ЄП"
  category: FormCategory;
  title: string;
  submitters: FormSubmitter[];
  frequency: FormFrequency;
  deadline: string;        // людськомовно: "до 40 к.д. після кварталу"
  basis: string;           // нормативка
  submitTo: string;        // куди: ДПС, ПФУ, Держстат
  format: string;          // формат подання
  penaltyForLate?: string;
  notes?: string[];
  tags?: string[];
}

export const REPORTING_FORMS: ReportingForm[] = [
  // ── ПДФО + ВЗ ──
  {
    id: '4df',
    code: '4ДФ (Додаток 4ДФ до Розрахунку)',
    category: 'income_tax',
    title: 'Єдиний розрахунок ПДФО і ЄСВ — додаток 4ДФ',
    submitters: ['employer', 'fop', 'tov'],
    frequency: 'quarterly',
    deadline: '40 календарних днів після звітного кварталу',
    basis: 'наказ Мінфіну № 4 від 13.01.2015 (у редакції № 773)',
    submitTo: 'ДПС (Кабінет платника, M.E.Doc, ПРРО Каста, FREDO)',
    format: 'XML, e-підпис КЕП',
    penaltyForLate: '1 020 ₴ за перше порушення, 2 040 ₴ за повторне (ст. 119 ПКУ).',
    notes: ['Подається у складі Об\'єднаного розрахунку (раніше — окремо як 1ДФ).'],
    tags: ['ПДФО', 'ВЗ', '4ДФ', 'Об\'єднаний розрахунок'],
  },
  {
    id: 'declaration-property-status',
    code: 'Декларація про майновий стан і доходи',
    category: 'income_tax',
    title: 'Річна декларація фізособи (доходи, ФОП на ЗС, інвестиції)',
    submitters: ['fop', 'individual'],
    frequency: 'yearly',
    deadline: 'до 1 травня (для ФОП на ЗС — до 9 лютого)',
    basis: 'наказ Мінфіну № 859, ст. 179 ПКУ',
    submitTo: 'ДПС',
    format: 'XML/PDF, КЕП. Електронний кабінет.',
    penaltyForLate: '340 ₴ за неподання, 1 020 ₴ за повторне.',
    notes: ['Для податкової знижки — до 31 грудня року, наступного за звітним.'],
    tags: ['декларація', 'ПДФО', 'ФОП ЗС', 'податкова знижка'],
  },

  // ── ЄСВ ──
  {
    id: 'esv-fop-d5',
    code: 'Звіт ЄСВ (Додаток 1)',
    category: 'esv',
    title: 'Єдиний внесок ФОП — самозайнятої особи',
    submitters: ['fop'],
    frequency: 'yearly',
    deadline: 'до 9 лютого року, наступного за звітним',
    basis: 'наказ Мінфіну № 4, ст. 4-5 ЗУ № 2464',
    submitTo: 'ДПС (Кабінет платника)',
    format: 'XML, КЕП',
    penaltyForLate: '10 НМДГ (170 ₴) за неподання, далі — 60 НМДГ.',
    notes: ['У 2022-2025 — мобілізовані звільнені від ЄСВ. У 2026 — за загальним правилом.'],
    tags: ['ЄСВ', 'ФОП'],
  },
  {
    id: 'unified-tax-esv',
    code: 'Об\'єднаний розрахунок ПДФО+ВЗ+ЄСВ',
    category: 'esv',
    title: 'Об\'єднаний розрахунок роботодавця',
    submitters: ['employer'],
    frequency: 'quarterly',
    deadline: '40 календарних днів після звітного кварталу',
    basis: 'наказ Мінфіну № 4 (редакція 2021+)',
    submitTo: 'ДПС',
    format: 'XML, КЕП. Містить додатки 1 (ЄСВ), 4ДФ (ПДФО/ВЗ), 5, 6.',
    penaltyForLate: '1 020 ₴ + 10% від суми ЄСВ за невчасну сплату.',
    tags: ['ЄСВ', 'ПДФО', 'роботодавець'],
  },

  // ── ПДВ ──
  {
    id: 'vat-declaration',
    code: 'Декларація з ПДВ',
    category: 'vat',
    title: 'Податкова декларація з податку на додану вартість',
    submitters: ['fop', 'tov'],
    frequency: 'monthly',
    deadline: '20 календарних днів після звітного місяця',
    basis: 'наказ Мінфіну № 21, ст. 203 ПКУ',
    submitTo: 'ДПС',
    format: 'XML, КЕП',
    penaltyForLate: '340 ₴ за перше неподання, 1 020 ₴ за повторне; + 10/20/50% від суми донарахування.',
    notes: ['Сплата ПДВ — протягом 10 к.д. після граничного строку подання декларації.', 'Квартальний звітний період — лише для ФОП-платників ЄП груп 1-3 (за заявою).'],
    tags: ['ПДВ', 'декларація'],
  },
  {
    id: 'pn',
    code: 'Податкова накладна / Розрахунок коригування',
    category: 'vat',
    title: 'Реєстрація ПН/РК в ЄРПН',
    submitters: ['fop', 'tov'],
    frequency: 'event',
    deadline: 'до 15 к.д. місяця, що настає за датою виписки (для ПН поточного місяця); РК — за окремими правилами',
    basis: 'ст. 201 ПКУ, постанова КМУ № 1246',
    submitTo: 'ЄРПН (через ДПС)',
    format: 'XML, КЕП',
    penaltyForLate: '10-50% від суми ПДВ залежно від кількості днів затримки (ст. 1201 ПКУ).',
    tags: ['ПДВ', 'ПН', 'ЄРПН'],
  },

  // ── Єдиний податок ──
  {
    id: 'ep-declaration-1-2',
    code: 'Декларація платника ЄП груп 1-2',
    category: 'single_tax',
    title: 'Декларація платника єдиного податку — фізособа-підприємець (1, 2 групи)',
    submitters: ['fop'],
    frequency: 'yearly',
    deadline: 'до 1 березня року, наступного за звітним',
    basis: 'наказ Мінфіну № 578, ст. 296 ПКУ',
    submitTo: 'ДПС',
    format: 'XML, КЕП',
    penaltyForLate: '340 ₴ за перше, 1 020 ₴ за повторне.',
    notes: ['Сплата ЄП 1-2 групи — щомісячно авансом до 20 числа.'],
    tags: ['ЄП', 'ФОП-1', 'ФОП-2'],
  },
  {
    id: 'ep-declaration-3',
    code: 'Декларація платника ЄП групи 3',
    category: 'single_tax',
    title: 'Декларація платника єдиного податку — 3 група',
    submitters: ['fop', 'tov'],
    frequency: 'quarterly',
    deadline: '40 календарних днів після звітного кварталу',
    basis: 'наказ Мінфіну № 578, ст. 296 ПКУ',
    submitTo: 'ДПС',
    format: 'XML, КЕП',
    penaltyForLate: '340 ₴ за перше, 1 020 ₴ за повторне.',
    notes: ['Сплата ЄП — протягом 10 к.д. після граничного строку подання.'],
    tags: ['ЄП', 'ФОП-3', 'ТОВ-ЄП'],
  },

  // ── Прибуток ──
  {
    id: 'profit-declaration',
    code: 'Декларація з податку на прибуток',
    category: 'profit',
    title: 'Податкова декларація з податку на прибуток підприємств',
    submitters: ['tov'],
    frequency: 'quarterly',
    deadline: '40 к.д. після кварталу (квартальні платники), 60 к.д. після року (річні)',
    basis: 'наказ Мінфіну № 897, ст. 137 ПКУ',
    submitTo: 'ДПС',
    format: 'XML, КЕП. З додатками: РІ, ПН, АМ, ЗП тощо.',
    penaltyForLate: '340 ₴ + 1 020 ₴ за повторне; пеня за несплату.',
    notes: ['Річні платники — підприємства з річним доходом < 40 млн ₴ без коригувань.'],
    tags: ['прибуток', 'декларація', 'ТОВ'],
  },

  // ── Фінансова звітність ──
  {
    id: 'fin-statements-small',
    code: 'Фінансова звітність малого підприємства (Ф1-м, Ф2-м)',
    category: 'financial',
    title: 'Фінансовий звіт малого підприємства',
    submitters: ['tov'],
    frequency: 'yearly',
    deadline: 'до 28 лютого року, наступного за звітним (Держстат); разом з декларацією прибутку — ДПС',
    basis: 'НП(С)БО 25, ст. 14 ЗУ № 996-XIV',
    submitTo: 'Держстат + ДПС',
    format: 'XML (через FREDO/M.E.Doc), КЕП',
    penaltyForLate: '170-510 ₴ адмінштраф на керівника (ст. 1863 КУпАП).',
    notes: ['Малі — дохід < 8 млн €. Мікро — < 700 тис. €, скорочена ф. 1-мс/2-мс.'],
    tags: ['фінзвітність', 'Ф1-м', 'малий бізнес'],
  },
  {
    id: 'fin-statements-full',
    code: 'Фінансова звітність (Ф1-Ф5)',
    category: 'financial',
    title: 'Повний пакет фінансової звітності',
    submitters: ['tov'],
    frequency: 'yearly',
    deadline: 'до 28 лютого; проміжна — до 25 числа місяця після кварталу',
    basis: 'НП(С)БО 1, МСФЗ для великих підприємств',
    submitTo: 'Держстат + ДПС',
    format: 'XML/iXBRL для МСФЗ-звітів через Систему фінансової звітності НКЦПФР',
    penaltyForLate: '170-510 ₴ + 1 020 ₴ за невчасне подання до ДПС у складі декларації прибутку.',
    notes: ['Великі підприємства і ті, що становлять суспільний інтерес — МСФЗ обовʼязково, формат iXBRL.'],
    tags: ['фінзвітність', 'МСФЗ', 'iXBRL'],
  },

  // ── Майнові ──
  {
    id: 'land-declaration',
    code: 'Декларація з плати за землю',
    category: 'property',
    title: 'Податкова декларація з плати за землю (земельний податок / оренда)',
    submitters: ['fop', 'tov'],
    frequency: 'yearly',
    deadline: 'до 20 лютого звітного року (нова) або 20 к.д. після місяця змін',
    basis: 'наказ Мінфіну № 560, ст. 286 ПКУ',
    submitTo: 'ДПС',
    format: 'XML, КЕП',
    penaltyForLate: '340 ₴ за перше неподання, 1 020 ₴ за повторне.',
    tags: ['земля', 'нерухомість'],
  },
  {
    id: 'real-estate-declaration',
    code: 'Декларація з податку на нерухоме майно',
    category: 'property',
    title: 'Податкова декларація з податку на нерухоме майно, відмінне від земельної ділянки',
    submitters: ['tov'],
    frequency: 'yearly',
    deadline: 'до 20 лютого звітного року',
    basis: 'наказ Мінфіну № 408, ст. 266 ПКУ',
    submitTo: 'ДПС',
    format: 'XML, КЕП',
    notes: ['Фізособам ДПС нараховує сама і присилає рішення-повідомлення до 1 липня.'],
    tags: ['нерухомість'],
  },
];

export const REPORTING_FORMS_AS_OF = '2026-04-30';

export const getFormsByCategory = (cat: FormCategory): ReportingForm[] =>
  REPORTING_FORMS.filter((f) => f.category === cat);
