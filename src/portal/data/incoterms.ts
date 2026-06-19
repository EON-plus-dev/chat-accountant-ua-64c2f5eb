// Stage 16: Incoterms 2020 — 11 термінів ICC для зовнішньоекономічних контрактів
// Джерело: ICC Publication No. 723E (Incoterms 2020). Чинні з 01.01.2020.

export type IncotermMode = 'any' | 'sea';   // any transport / sea-and-inland-waterway only
export type IncotermGroup = 'E' | 'F' | 'C' | 'D';

export const INCOTERM_MODE_LABEL: Record<IncotermMode, string> = {
  any: 'Будь-який вид транспорту',
  sea: 'Тільки морський / внутрішній водний',
};

export const INCOTERM_GROUP_LABEL: Record<IncotermGroup, string> = {
  E: 'E — Відправлення',
  F: 'F — Основне перевезення не оплачене',
  C: 'C — Основне перевезення оплачене',
  D: 'D — Прибуття',
};

export interface IncotermSplit {
  carriageMain: 'seller' | 'buyer';        // основне перевезення
  insurance: 'seller' | 'buyer' | 'none_required';
  exportClearance: 'seller' | 'buyer';
  importClearance: 'seller' | 'buyer';
  riskTransferPoint: string;               // де переходить ризик
  unloadingAtDestination: 'seller' | 'buyer' | 'na';
}

export interface IncotermEntry {
  id: string;            // напр. "exw"
  code: string;          // "EXW"
  name: string;          // укр назва
  nameEn: string;
  group: IncotermGroup;
  mode: IncotermMode;
  shortDescription: string;
  split: IncotermSplit;
  bestFor: string[];
  notes?: string[];
  newIn2020?: boolean;
}

const r = (
  carriageMain: IncotermSplit['carriageMain'],
  insurance: IncotermSplit['insurance'],
  exportClearance: IncotermSplit['exportClearance'],
  importClearance: IncotermSplit['importClearance'],
  riskTransferPoint: string,
  unloadingAtDestination: IncotermSplit['unloadingAtDestination'],
): IncotermSplit => ({
  carriageMain, insurance, exportClearance, importClearance, riskTransferPoint, unloadingAtDestination,
});

export const INCOTERMS_2020: IncotermEntry[] = [
  // ── Група E ──
  {
    id: 'exw', code: 'EXW', name: 'Франко-склад', nameEn: 'Ex Works',
    group: 'E', mode: 'any',
    shortDescription: 'Продавець надає товар на своєму складі; покупець забирає, оформляє експорт і несе всі ризики та витрати.',
    split: r('buyer', 'none_required', 'buyer', 'buyer', 'Склад продавця (товар у розпорядженні покупця, без завантаження)', 'na'),
    bestFor: ['Внутрішні поставки', 'Покупець має власну логістику'],
    notes: [
      'Мінімум зобовʼязань продавця, максимум — покупця.',
      'Не рекомендується для міжнародних контрактів — покупець-нерезидент не може оформити експорт в Україні. Краще FCA.',
    ],
  },

  // ── Група F ──
  {
    id: 'fca', code: 'FCA', name: 'Франко-перевізник', nameEn: 'Free Carrier',
    group: 'F', mode: 'any',
    shortDescription: 'Продавець передає товар перевізнику, призначеному покупцем, у вказаному місці; ризик переходить після передачі.',
    split: r('buyer', 'none_required', 'seller', 'buyer', 'Місце передачі перевізнику (склад продавця або термінал)', 'buyer'),
    bestFor: ['IT-обладнання', 'Авіа і автотранспорт', 'Контейнерні перевезення', 'Аналог EXW для міжнародних угод'],
    notes: [
      'Найкращий вибір для українського експортера-початківця: продавець оформлює митну експортну декларацію (МД).',
      'У 2020 додано опцію вимагати від покупця надання коносамента з відміткою "on board" (для морських FCA).',
    ],
    newIn2020: true,
  },
  {
    id: 'fas', code: 'FAS', name: 'Франко вздовж судна', nameEn: 'Free Alongside Ship',
    group: 'F', mode: 'sea',
    shortDescription: 'Продавець розміщує товар поряд із судном у порту відправлення; покупець завантажує і несе подальші ризики.',
    split: r('buyer', 'none_required', 'seller', 'buyer', 'Поруч із судном у порту відправлення', 'buyer'),
    bestFor: ['Насипні / навалочні вантажі', 'Чартерні судна', 'Метали, зерно'],
  },
  {
    id: 'fob', code: 'FOB', name: 'Франко-борт', nameEn: 'Free on Board',
    group: 'F', mode: 'sea',
    shortDescription: 'Продавець завантажує товар на борт судна в порту відправлення; ризик переходить після перетину поручнів судна.',
    split: r('buyer', 'none_required', 'seller', 'buyer', 'На борту судна в порту відправлення', 'buyer'),
    bestFor: ['Морські перевезення некрупної партії', 'Зерно з українських портів'],
    notes: ['Не рекомендується для контейнерів — для них використовуйте FCA.'],
  },

  // ── Група C ──
  {
    id: 'cpt', code: 'CPT', name: 'Перевезення оплачене до', nameEn: 'Carriage Paid To',
    group: 'C', mode: 'any',
    shortDescription: 'Продавець оплачує перевезення до названого місця призначення, але ризик переходить уже при передачі першому перевізнику.',
    split: r('seller', 'none_required', 'seller', 'buyer', 'Передача першому перевізнику (а не місце призначення!)', 'buyer'),
    bestFor: ['Контейнери', 'Авіа-вантажі', 'Експрес-доставка (DHL, FedEx)'],
    notes: ['Ризик і витрати розділені у різних точках — типова пастка для покупця.'],
  },
  {
    id: 'cip', code: 'CIP', name: 'Перевезення і страхування оплачено до', nameEn: 'Carriage and Insurance Paid To',
    group: 'C', mode: 'any',
    shortDescription: 'Як CPT, але продавець додатково оплачує страхування вантажу (з 2020 — за макс. покриттям ICC A).',
    split: r('seller', 'seller', 'seller', 'buyer', 'Передача першому перевізнику', 'buyer'),
    bestFor: ['Дорогі IT-вантажі', 'Електроніка', 'Контейнерні перевезення з покриттям ICC A'],
    notes: [
      'У 2020 рівень страхування підвищено з мінімального (ICC C) до максимального (ICC A) — за замовчуванням.',
      'Сторони можуть домовитися про нижчий рівень покриття в контракті.',
    ],
    newIn2020: true,
  },
  {
    id: 'cfr', code: 'CFR', name: 'Вартість і фрахт', nameEn: 'Cost and Freight',
    group: 'C', mode: 'sea',
    shortDescription: 'Продавець оплачує фрахт до порту призначення; ризик переходить на покупця при завантаженні на борт у порту відправлення.',
    split: r('seller', 'none_required', 'seller', 'buyer', 'На борту судна в порту відправлення', 'buyer'),
    bestFor: ['Зернові експортні контракти', 'Метал, добрива'],
  },
  {
    id: 'cif', code: 'CIF', name: 'Вартість, страхування і фрахт', nameEn: 'Cost, Insurance and Freight',
    group: 'C', mode: 'sea',
    shortDescription: 'CFR + мінімальне страхування ICC C, оформлене продавцем на користь покупця.',
    split: r('seller', 'seller', 'seller', 'buyer', 'На борту судна в порту відправлення', 'buyer'),
    bestFor: ['Морський експорт зерна, металу', 'Стандартні товари без високого ризику'],
    notes: ['Страхування — мінімальне (ICC C). Для дорогих вантажів краще обрати CIP з ICC A.'],
  },

  // ── Група D ──
  {
    id: 'dap', code: 'DAP', name: 'Поставка в місце', nameEn: 'Delivered at Place',
    group: 'D', mode: 'any',
    shortDescription: 'Продавець доставляє товар у вказане місце, готовий до розвантаження покупцем; імпортне розмитнення на покупцеві.',
    split: r('seller', 'none_required', 'seller', 'buyer', 'Місце призначення, готовий до розвантаження', 'buyer'),
    bestFor: ['B2B-поставки до складу клієнта', 'Європейські експортні контракти'],
  },
  {
    id: 'dpu', code: 'DPU', name: 'Поставка в місце розвантажена', nameEn: 'Delivered at Place Unloaded',
    group: 'D', mode: 'any',
    shortDescription: 'Як DAP, але продавець ще й розвантажує товар у місці призначення. Замінив старий термін DAT.',
    split: r('seller', 'none_required', 'seller', 'buyer', 'Місце призначення, після розвантаження', 'seller'),
    bestFor: ['Постачання обладнання', 'Контейнерні поставки з розвантаженням на терміналі'],
    notes: ['Єдиний термін Incoterms, де продавець розвантажує товар у місці призначення.'],
    newIn2020: true,
  },
  {
    id: 'ddp', code: 'DDP', name: 'Поставка зі сплаченим митом', nameEn: 'Delivered Duty Paid',
    group: 'D', mode: 'any',
    shortDescription: 'Продавець доставляє товар у місце призначення зі сплатою всіх імпортних мит і ПДВ. Максимум зобовʼязань для продавця.',
    split: r('seller', 'none_required', 'seller', 'seller', 'Місце призначення, готовий до розвантаження', 'buyer'),
    bestFor: ['E-commerce роздрібному покупцю', 'Premium B2B-поставки', 'Запчастини для гарантійного обслуговування'],
    notes: [
      'Продавець-нерезидент повинен мати можливість зареєструватися як платник ПДВ у країні призначення — інакше DDP неможливий.',
      'Не використовуйте без перевірки податкового резидентства в країні покупця.',
    ],
  },
];

export const INCOTERMS_2020_AS_OF = '2026-04-30';

export const getIncotermsByGroup = (g: IncotermGroup): IncotermEntry[] =>
  INCOTERMS_2020.filter((i) => i.group === g);
