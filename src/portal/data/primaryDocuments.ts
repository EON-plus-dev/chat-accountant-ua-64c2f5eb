export type PrimaryDocCategory =
  | 'cash'           // касові
  | 'bank'           // банківські
  | 'sales'          // реалізація / послуги
  | 'inventory'      // ТМЦ, склад
  | 'fixed_assets'   // основні засоби
  | 'payroll'        // зарплата
  | 'transport'      // транспорт / ТТН
  | 'business_trip'  // відрядження
  | 'other';

export type PrimaryDocLegalForm = 'standard' | 'typical' | 'free_form';

export interface PrimaryDocument {
  code: string;           // форма, напр. "КО-1", "М-11", "ОЗ-1"
  name: string;
  slug: string;
  category: PrimaryDocCategory;
  legalForm: PrimaryDocLegalForm;
  legalRef: string;       // нормативка
  purpose: string;        // коли застосовується
  signedBy: string[];     // хто підписує
  retention: string;      // строк зберігання
  popular?: boolean;
  note?: string;
}

export const PRIMARY_DOCS_AS_OF = '2026-Q2';

export const PRIMARY_DOC_CATEGORY_LABEL: Record<PrimaryDocCategory, string> = {
  cash: 'Касові',
  bank: 'Банківські',
  sales: 'Реалізація / послуги',
  inventory: 'ТМЦ, склад',
  fixed_assets: 'Основні засоби',
  payroll: 'Зарплата і кадри',
  transport: 'Транспорт / ТТН',
  business_trip: 'Відрядження',
  other: 'Інше',
};

export const PRIMARY_DOC_FORM_LABEL: Record<PrimaryDocLegalForm, string> = {
  standard: 'Обовʼязкова стандартна',
  typical: 'Типова (рекомендована)',
  free_form: 'Довільна (з реквізитами ст. 9)',
};

export const PRIMARY_DOCUMENTS: PrimaryDocument[] = [
  // Касові
  {
    code: 'КО-1', name: 'Прибутковий касовий ордер', slug: 'ko-1',
    category: 'cash', legalForm: 'standard',
    legalRef: 'Постанова НБУ № 148 (Положення про ведення касових операцій)',
    purpose: 'Оформлення надходження готівки в касу підприємства/ФОП. Один екземпляр + квитанція для платника.',
    signedBy: ['Головбух (або уповноважена особа)', 'Касир'],
    retention: '3 роки після перевірки ДПС', popular: true,
  },
  {
    code: 'КО-2', name: 'Видатковий касовий ордер', slug: 'ko-2',
    category: 'cash', legalForm: 'standard',
    legalRef: 'Постанова НБУ № 148',
    purpose: 'Видача готівки з каси (виплата ЗП, підзвіт, повернення). Без підпису одержувача — недійсний.',
    signedBy: ['Керівник', 'Головбух', 'Касир', 'Одержувач'],
    retention: '3 роки', popular: true,
  },
  {
    code: 'КО-3', name: 'Журнал реєстрації прибуткових і видаткових касових ордерів', slug: 'ko-3',
    category: 'cash', legalForm: 'standard',
    legalRef: 'Постанова НБУ № 148',
    purpose: 'Послідовна реєстрація всіх КО-1 і КО-2 за датою. Контроль нумерації.',
    signedBy: ['Касир'],
    retention: '3 роки',
  },
  {
    code: 'КО-4', name: 'Касова книга', slug: 'ko-4',
    category: 'cash', legalForm: 'standard',
    legalRef: 'Постанова НБУ № 148',
    purpose: 'Щоденний облік готівки в касі. Закривається в кінці дня, виводиться залишок.',
    signedBy: ['Касир', 'Головбух'],
    retention: '3 роки', popular: true,
  },
  {
    code: 'Z-звіт РРО/ПРРО', name: 'Z-звіт реєстратора розрахункових операцій', slug: 'z-zvit',
    category: 'cash', legalForm: 'standard',
    legalRef: 'ЗУ № 265/95-ВР, ст. 3',
    purpose: 'Денний фіскальний звіт з обнуленням. Обовʼязковий в кінці робочого дня, якщо були операції через РРО/ПРРО.',
    signedBy: ['Касир (фіскальний підпис ДПС)'],
    retention: '3 роки', popular: true,
    note: 'У ПРРО (Cашалот, checkbox, Дія) формується автоматично і одразу йде в ДПС.',
  },

  // Банківські
  {
    code: 'Платіжна інструкція', name: 'Платіжна інструкція (платіжне доручення)', slug: 'platizhna-instruktsiia',
    category: 'bank', legalForm: 'standard',
    legalRef: 'Постанова НБУ № 216 (з 01.04.2023 замінила платіжне доручення)',
    purpose: 'Доручення банку перерахувати кошти з рахунку платника на рахунок одержувача.',
    signedBy: ['КЕП підписанта (керівник або уповн. особа)'],
    retention: '3 роки', popular: true,
  },
  {
    code: 'Виписка з рахунку', name: 'Виписка банку з поточного рахунку', slug: 'vypyska-banku',
    category: 'bank', legalForm: 'standard',
    legalRef: 'Постанова НБУ № 216',
    purpose: 'Підтверджує рух коштів на рахунку. Підстава для бухпроводок.',
    signedBy: ['Банк (електронно)'],
    retention: '3 роки', popular: true,
  },

  // Реалізація / послуги
  {
    code: 'Рахунок-фактура', name: 'Рахунок-фактура (рахунок на оплату)', slug: 'rakhunok-faktura',
    category: 'sales', legalForm: 'free_form',
    legalRef: 'ЗУ № 996-XIV, ст. 9',
    purpose: 'Пропозиція оплати від продавця. Сам по собі не є первинним для оподаткування, але звичай ділового обороту.',
    signedBy: ['Уповн. особа продавця'],
    retention: '3 роки', popular: true,
    note: 'Може заміняти договір (ст. 181 ГКУ) для разових постачань — оплата = акцепт.',
  },
  {
    code: 'Акт', name: 'Акт виконаних робіт / наданих послуг', slug: 'akt-vykonanyh-robit',
    category: 'sales', legalForm: 'free_form',
    legalRef: 'ЗУ № 996-XIV, ст. 9; ст. 854 ЦКУ',
    purpose: 'Підтверджує факт виконання робіт або надання послуг. Підстава для визнання доходу/витрат і ПК з ПДВ.',
    signedBy: ['Виконавець', 'Замовник'],
    retention: '3 роки', popular: true,
  },
  {
    code: 'Видаткова накладна', name: 'Видаткова накладна (передача товару)', slug: 'vydatkova-nakladna',
    category: 'sales', legalForm: 'free_form',
    legalRef: 'ЗУ № 996-XIV, ст. 9',
    purpose: 'Передача товару від продавця до покупця. Підстава для списання з обліку продавця і оприбуткування покупцем.',
    signedBy: ['Уповн. особа продавця', 'Матеріально відп. особа покупця'],
    retention: '3 роки', popular: true,
  },
  {
    code: 'Податкова накладна', name: 'Податкова накладна (ПН)', slug: 'podatkova-nakladna',
    category: 'sales', legalForm: 'standard',
    legalRef: 'ПКУ, ст. 201; Порядок Мінфіну № 1307',
    purpose: 'Складається платником ПДВ на дату першої події (відвантаження або оплата). Реєструється в ЄРПН.',
    signedBy: ['КЕП посадової особи продавця'],
    retention: '1095 днів (3 роки) — для перевірок ДПС', popular: true,
    note: 'Без реєстрації в ЄРПН — покупець не отримає податковий кредит.',
  },
  {
    code: 'Розрахунок коригування', name: 'Розрахунок коригування до ПН (РК)', slug: 'rk-pdv',
    category: 'sales', legalForm: 'standard',
    legalRef: 'ПКУ, ст. 192',
    purpose: 'Коригує суму, кількість, ставку у раніше виданій ПН (повернення товару, перегляд ціни).',
    signedBy: ['КЕП посадової особи продавця/покупця (залежно від типу)'],
    retention: '1095 днів',
  },

  // ТМЦ
  {
    code: 'М-11', name: 'Накладна-вимога на відпуск (внутрішнє переміщення) матеріалів', slug: 'm-11',
    category: 'inventory', legalForm: 'typical',
    legalRef: 'Наказ Мінстату № 193',
    purpose: 'Внутрішнє переміщення матеріалів між цехами, відділами, складами одного підприємства.',
    signedBy: ['Відпуск. особа', 'Одержувач'],
    retention: '3 роки',
  },
  {
    code: 'М-4', name: 'Прибутковий ордер (оприбуткування ТМЦ)', slug: 'm-4',
    category: 'inventory', legalForm: 'typical',
    legalRef: 'Наказ Мінстату № 193',
    purpose: 'Оприбуткування ТМЦ на склад на основі рахунку постачальника. Складається матеріально відп. особою.',
    signedBy: ['Завскладом / комірник'],
    retention: '3 роки',
  },
  {
    code: 'Інв-3', name: 'Інвентаризаційний опис ТМЦ', slug: 'inv-3',
    category: 'inventory', legalForm: 'typical',
    legalRef: 'Положення Мінфіну № 879',
    purpose: 'Фіксація фактичних залишків ТМЦ під час інвентаризації. Обовʼязкова річна — перед складанням балансу.',
    signedBy: ['Інвент. комісія', 'Матеріально відп. особа'],
    retention: '5 років',
  },

  // Основні засоби
  {
    code: 'ОЗ-1', name: 'Акт приймання-передачі (внутрішнього переміщення) основних засобів', slug: 'oz-1',
    category: 'fixed_assets', legalForm: 'typical',
    legalRef: 'Наказ Мінстату № 352',
    purpose: 'Зарахування ОЗ на баланс, передача між підрозділами, передача іншому підприємству.',
    signedBy: ['Комісія з приймання', 'Матеріально відп. особа'],
    retention: 'Строк експлуатації + 3 роки', popular: true,
  },
  {
    code: 'ОЗ-3', name: 'Акт списання основних засобів', slug: 'oz-3',
    category: 'fixed_assets', legalForm: 'typical',
    legalRef: 'Наказ Мінстату № 352',
    purpose: 'Списання ОЗ через знос, реалізацію, безоплатну передачу, ліквідацію.',
    signedBy: ['Комісія', 'Керівник'],
    retention: '3 роки після списання',
  },
  {
    code: 'ОЗ-6', name: 'Інвентарна картка обліку основних засобів', slug: 'oz-6',
    category: 'fixed_assets', legalForm: 'typical',
    legalRef: 'Наказ Мінстату № 352',
    purpose: 'Аналітичний облік кожного обʼєкта ОЗ: інв. номер, дата введення, амортизація, ремонти.',
    signedBy: ['Бухгалтер'],
    retention: 'Строк експлуатації + 3 роки',
  },

  // Зарплата
  {
    code: 'Наказ про прийом', name: 'Наказ про прийняття на роботу (П-1)', slug: 'nakaz-pryjnyattia',
    category: 'payroll', legalForm: 'typical',
    legalRef: 'КЗпП, ст. 24; Наказ Мінстату № 489',
    purpose: 'Підстава для зарахування працівника в штат. Подається до ДПС повідомлення за формою № 1.',
    signedBy: ['Керівник', 'Працівник (ознайомл.)'],
    retention: '75 років', popular: true,
  },
  {
    code: 'Табель П-5', name: 'Табель обліку використання робочого часу (П-5)', slug: 'p-5',
    category: 'payroll', legalForm: 'typical',
    legalRef: 'Наказ Мінстату № 489',
    purpose: 'Щоденний облік явок/неявок і фактично відпрацьованого часу. Підстава для нарахування ЗП.',
    signedBy: ['Уповн. особа підрозділу', 'Кадровик'],
    retention: '3 роки (75 років для шкідливих умов)', popular: true,
  },
  {
    code: 'Розрахунково-платіжна відомість', name: 'Розрахунково-платіжна відомість П-6/П-7', slug: 'p-6-p-7',
    category: 'payroll', legalForm: 'typical',
    legalRef: 'Наказ Мінстату № 489',
    purpose: 'Нарахування і виплата зарплати, утримань (ПДФО 18%, ВЗ 5%, ЄСВ 22%).',
    signedBy: ['Головбух', 'Касир', 'Працівник (одержання)'],
    retention: '75 років', popular: true,
  },

  // Транспорт
  {
    code: 'ТТН (1-ТН)', name: 'Товарно-транспортна накладна', slug: 'ttn',
    category: 'transport', legalForm: 'typical',
    legalRef: 'Наказ Мінтрансу № 363; Постанова КМУ № 207',
    purpose: 'Оформлення перевезення вантажу автотранспортом загального користування. 4 примірники (вантажовідправник, водій, перевізник, одержувач).',
    signedBy: ['Вантажовідправник', 'Водій', 'Вантажоодержувач'],
    retention: '3 роки', popular: true,
    note: 'Для деяких товарів (алкоголь, ПММ, метал, спирт) — суворо обовʼязкова, штраф за відсутність до 100 нмдг.',
  },
  {
    code: 'Подорожній лист', name: 'Подорожній лист службового автомобіля', slug: 'podorozhnij-lyst',
    category: 'transport', legalForm: 'free_form',
    legalRef: 'З 2018 — необовʼязкова форма. ЗУ № 2245-VIII скасував обовʼязковість.',
    purpose: 'Облік пробігу, витрат ПММ, маршруту службового авто. Підстава для списання ПММ у витрати.',
    signedBy: ['Диспетчер / керівник', 'Водій'],
    retention: '3 роки',
    note: 'Можна замінити внутрішнім розпорядженням про норми списання ПММ.',
  },

  // Відрядження
  {
    code: 'Наказ про відрядження', name: 'Наказ (розпорядження) про відрядження', slug: 'nakaz-vidryadzhennya',
    category: 'business_trip', legalForm: 'free_form',
    legalRef: 'Інструкція Мінфіну № 59',
    purpose: 'Підстава для направлення працівника у відрядження. Зазначає мету, місце, строк, аванс.',
    signedBy: ['Керівник'],
    retention: '3 роки', popular: true,
  },
  {
    code: 'Звіт про використання коштів', name: 'Звіт про використання коштів, виданих на відрядження або під звіт', slug: 'avansovyj-zvit',
    category: 'business_trip', legalForm: 'standard',
    legalRef: 'Наказ Мінфіну № 841 (з 01.04.2023)',
    purpose: 'Подається протягом 5 робочих днів після повернення з відрядження. Залишок коштів — у касу, перевитрата — з каси.',
    signedBy: ['Підзвітна особа', 'Головбух', 'Керівник'],
    retention: '3 роки', popular: true,
  },

  // Інше
  {
    code: 'Бухгалтерська довідка', name: 'Бухгалтерська довідка', slug: 'buhdovidka',
    category: 'other', legalForm: 'free_form',
    legalRef: 'ЗУ № 996-XIV, ст. 9',
    purpose: 'Оформлення внутрішніх проводок: виправлення помилок, нарахування резервів, переоцінка, розрахунки.',
    signedBy: ['Головбух (або відповідальний бухгалтер)'],
    retention: '3 роки',
  },
  {
    code: 'Договір', name: 'Господарський договір (контракт)', slug: 'dogovir',
    category: 'other', legalForm: 'free_form',
    legalRef: 'ЦКУ, гл. 52; ГКУ, гл. 20',
    purpose: 'Підстава для виникнення зобовʼязань між сторонами. Не є первинним сам по собі, але обовʼязковий доданий до акта/накладної.',
    signedBy: ['Уповн. особи сторін (підпис + КЕП для електронного)'],
    retention: '3 роки після закінчення зобовʼязань', popular: true,
  },
];
