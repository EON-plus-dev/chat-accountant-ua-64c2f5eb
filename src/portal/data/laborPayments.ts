export type LaborPaymentCategory =
  | 'leave'         // відпустки
  | 'sick'          // лікарняні
  | 'maternity'     // декретні / по вагітності
  | 'travel'        // відрядження
  | 'compensation'  // компенсаційні (індексація, відрядні, окремі виплати)
  | 'severance'     // вихідна допомога
  | 'wartime';      // воєнні (бронювання, простій, мобілізація)

export interface LaborPayment {
  id: string;
  slug: string;
  name: string;
  category: LaborPaymentCategory;
  /** Хто фінансує: роботодавець / ФСС / Держбюджет */
  payer: 'employer' | 'social_fund' | 'state' | 'mixed';
  /** Розрахункова база */
  base: string;
  /** Формула / розмір */
  formula: string;
  /** Орієнтовний приклад */
  example: string;
  legalRef: string;
  /** Чи оподатковується ПДФО 18% / ВЗ 5% / ЄСВ 22% */
  taxation: {
    pdfo: boolean;
    vz: boolean;
    esv: boolean;
    notes?: string;
  };
  /** Обмеження, ліміти, особливості */
  limits?: string[];
  popular?: boolean;
}

export const LABOR_PAYMENTS_AS_OF = '2026-Q2';

export const LABOR_CATEGORY_LABEL: Record<LaborPaymentCategory, string> = {
  leave: 'Відпустки',
  sick: 'Лікарняні',
  maternity: 'Декрет / по вагітності',
  travel: 'Відрядження',
  compensation: 'Компенсаційні виплати',
  severance: 'Вихідна допомога',
  wartime: 'Воєнні виплати',
};

export const LABOR_PAYMENTS: LaborPayment[] = [
  // ── ВІДПУСТКИ ──
  {
    id: 'osnovna-vidpustka', slug: 'osnovna-vidpustka',
    name: 'Основна щорічна відпустка',
    category: 'leave', payer: 'employer',
    base: 'Середньоденна ЗП за 12 міс. (Постанова КМУ № 100)',
    formula: 'Середньоденна × кількість днів (мін. 24 к.д.)',
    example: 'ЗП 30 000 ₴/міс → середньоденна ≈ 1 015 ₴ → 24 дні = 24 360 ₴.',
    legalRef: 'Ст. 6 ЗУ «Про відпустки», ст. 75 КЗпП',
    taxation: { pdfo: true, vz: true, esv: true, notes: 'Оподатковується як зарплата.' },
    limits: ['Мін. 24 к.д. на рік', 'Не пізніше 12 міс. після робочого року', 'Можна ділити на частини (одна — не менше 14 к.д.)'],
    popular: true,
  },
  {
    id: 'dodatkova-vidpustka-dity', slug: 'dodatkova-vidpustka-dity',
    name: 'Додаткова відпустка на дітей',
    category: 'leave', payer: 'employer',
    base: 'Середньоденна ЗП',
    formula: '10 к.д. (1 дитина до 15 р.) або 17 к.д. (2+ дітей / дитина з інвалідністю)',
    example: 'Мати двох дітей: 17 к.д. × середньоденну ≈ 17 250 ₴.',
    legalRef: 'Ст. 19 ЗУ «Про відпустки»',
    taxation: { pdfo: true, vz: true, esv: true },
    limits: ['Не використана — компенсується грошима при звільненні', 'Незалежно від відпрацьованого часу'],
    popular: true,
  },
  {
    id: 'dodatkova-shkidlyvi-umovy', slug: 'dodatkova-shkidlyvi-umovy',
    name: 'Додаткова відпустка за шкідливі умови праці',
    category: 'leave', payer: 'employer',
    base: 'Середньоденна ЗП',
    formula: 'До 35 к.д. (за списком виробництв, КМУ № 1290)',
    example: 'Зварник: 7 к.д. додатково до основної.',
    legalRef: 'Ст. 7 ЗУ «Про відпустки»',
    taxation: { pdfo: true, vz: true, esv: true },
    limits: ['Лише за результатами атестації робочих місць', 'Не підлягає заміні грошима, крім звільнення'],
  },
  {
    id: 'navchalna-vidpustka', slug: 'navchalna-vidpustka',
    name: 'Навчальна відпустка',
    category: 'leave', payer: 'employer',
    base: 'Середньоденна ЗП',
    formula: 'До 40 к.д. (сесія) + 4 міс. (держіспити, диплом)',
    example: 'Студент-заочник: 30 к.д. на сесію × 1 015 ₴ = 30 450 ₴.',
    legalRef: 'Ст. 15 ЗУ «Про відпустки»',
    taxation: { pdfo: true, vz: true, esv: true },
    limits: ['Тільки при успішному навчанні', 'Підтвердження довідкою-викликом'],
  },
  {
    id: 'vidpustka-bez-zberezhennia', slug: 'vidpustka-bez-zberezhennia',
    name: 'Відпустка без збереження ЗП',
    category: 'leave', payer: 'employer',
    base: '—',
    formula: 'До 15 к.д./рік (за згодою сторін) або без обмеження (за сімейними обставинами)',
    example: 'Працівник попросив 5 к.д. без оплати — ЗП не нараховується.',
    legalRef: 'Ст. 25–26 ЗУ «Про відпустки»',
    taxation: { pdfo: false, vz: false, esv: false, notes: 'Виплат немає — податків теж.' },
    limits: ['Не входить у стаж для основної відпустки понад 15 к.д.', 'Воєнний час: без обмеження за заявою'],
  },

  // ── ЛІКАРНЯНІ ──
  {
    id: 'likarniani-2024', slug: 'likarniani-strakhuvanniy-stazh',
    name: 'Лікарняні (тимчасова непрацездатність)',
    category: 'sick', payer: 'mixed',
    base: 'Середньоденна ЗП за 12 міс. (Постанова КМУ № 1266)',
    formula: 'Перші 5 днів — роботодавець; 6+ день — ФСС. % залежить від стажу: до 3 р. — 50%, 3–5 р. — 60%, 5–8 р. — 70%, понад 8 р. — 100%',
    example: 'Стаж 6 років, ЗП 30 000 ₴, 10 днів хвороби: 5 днів × 70% × 1 015 ₴ (роботодавець) + 5 днів × 70% × 1 015 ₴ (ФСС) ≈ 7 105 ₴.',
    legalRef: 'ЗУ № 1105-XIV, ст. 22; Постанова № 1266',
    taxation: { pdfo: true, vz: true, esv: true, notes: 'ЄСВ нараховується тільки на частину роботодавця (перші 5 днів). Виплата ФСС — без ЄСВ.' },
    limits: ['Макс. база ЄСВ: 15 МЗП = 120 000 ₴ (2026)', 'Перші 5 днів — за рахунок роботодавця'],
    popular: true,
  },
  {
    id: 'likarniani-100', slug: 'likarniani-100-vidsotok',
    name: 'Лікарняні 100% (особливі категорії)',
    category: 'sick', payer: 'social_fund',
    base: 'Середньоденна ЗП',
    formula: '100% незалежно від стажу',
    example: 'Чорнобилець 1–2 категорії: 100% лікарняні від першого дня.',
    legalRef: 'Ст. 24 ЗУ № 1105-XIV',
    taxation: { pdfo: true, vz: true, esv: false },
    limits: ['Чорнобильці', 'Учасники бойових дій', 'Донори (раз/рік)', 'Догляд за хворою дитиною до 14 р.'],
  },

  // ── ДЕКРЕТ ──
  {
    id: 'po-vahitnosti-pologamy', slug: 'po-vahitnosti-pologamy',
    name: 'Допомога по вагітності та пологах',
    category: 'maternity', payer: 'social_fund',
    base: 'Середньоденна ЗП за 12 міс.',
    formula: '100% × середньоденну × 126 к.д. (нормальні пологи) / 140 к.д. (ускладнені) / 180 к.д. (двійня)',
    example: 'ЗП 25 000 ₴/міс, 126 к.д.: ≈ 822 ₴ × 126 = 103 572 ₴.',
    legalRef: 'Ст. 25 ЗУ № 1105-XIV',
    taxation: { pdfo: false, vz: false, esv: false, notes: 'Не оподатковується (п. 165.1.1 ПКУ).' },
    limits: ['Макс. база: 15 МЗП × кількість місяців', 'Незалежно від стажу — 100%', 'Подається через єПослуги або ФСС'],
    popular: true,
  },
  {
    id: 'odnorazova-pry-narodzhenni', slug: 'odnorazova-pry-narodzhenni',
    name: 'Одноразова допомога при народженні дитини',
    category: 'maternity', payer: 'state',
    base: 'Фіксована сума',
    formula: '41 280 ₴ (10 800 ₴ одразу + 30 480 ₴ рівними частинами 36 міс.)',
    example: 'При народженні: 10 800 ₴ + 847 ₴/міс. протягом 36 міс.',
    legalRef: 'ЗУ № 2811-IV, Постанова КМУ № 1751',
    taxation: { pdfo: false, vz: false, esv: false },
    limits: ['Подача через єМалятко або ПФУ', 'Розмір не індексується з 2014'],
  },
  {
    id: 'doglyad-do-3-rokiv', slug: 'doglyad-do-3-rokiv',
    name: 'Відпустка для догляду за дитиною до 3 років',
    category: 'maternity', payer: 'employer',
    base: '—',
    formula: 'Без збереження ЗП (зберігається місце роботи і стаж)',
    example: 'Мати у відпустці 3 роки — без оплати, але зі збереженням посади.',
    legalRef: 'Ст. 18 ЗУ «Про відпустки»',
    taxation: { pdfo: false, vz: false, esv: false, notes: 'Виплат від роботодавця немає; стаж зберігається.' },
    limits: ['До 3 років (6 років за мед. показаннями)', 'Може взяти батько/бабуся/дідусь', 'Можна працювати на умовах part-time'],
  },

  // ── ВІДРЯДЖЕННЯ ──
  {
    id: 'dobovi-vidriadzhennia-uk', slug: 'dobovi-vidriadzhennia-ua',
    name: 'Добові у відрядженні (Україна)',
    category: 'travel', payer: 'employer',
    base: 'Норма КМУ № 98 (для бюджетних установ) або внутрішня політика',
    formula: 'Не більше 0.1 × МЗП = 800 ₴/добу (2026) — не оподатковується',
    example: '5 днів відрядження × 800 ₴ = 4 000 ₴ без ПДФО/ВЗ.',
    legalRef: 'Пп. 170.9.1 ПКУ, Постанова № 98',
    taxation: { pdfo: false, vz: false, esv: false, notes: 'У межах ліміту 0.1 МЗП — без податків. Понад ліміт — оподатковується ПДФО і ВЗ.' },
    limits: ['Ліміт 2026: 800 ₴/добу (Україна)', 'Понад — як додаткове благо'],
    popular: true,
  },
  {
    id: 'dobovi-vidriadzhennia-zakordon', slug: 'dobovi-vidriadzhennia-zakordon',
    name: 'Добові у відрядженні за кордон',
    category: 'travel', payer: 'employer',
    base: 'Постанова КМУ № 98 (норми по країнах)',
    formula: 'Не більше 80 EUR/добу — без ПДФО/ВЗ',
    example: '5 днів у Польщі × 80 EUR ≈ 16 000 ₴ без податків.',
    legalRef: 'Пп. 170.9.1 ПКУ',
    taxation: { pdfo: false, vz: false, esv: false, notes: 'У межах ліміту 80 EUR — без податків.' },
    limits: ['Ліміт 2026: 80 EUR/добу', 'Підтверджуючі: відмітки в паспорті, авіаквитки'],
  },
  {
    id: 'kompensatsiia-transport-zhytlo', slug: 'kompensatsiia-transport-zhytlo',
    name: 'Компенсація транспорту і житла у відрядженні',
    category: 'travel', payer: 'employer',
    base: 'Підтверджуючі документи',
    formula: '100% за підтверджуючими документами (квитки, рахунки готелю)',
    example: 'Квиток UZ Львів-Київ 850 ₴ + готель 3 ночі × 1 200 ₴ = 4 450 ₴ — без податків.',
    legalRef: 'Пп. 170.9.1 ПКУ',
    taxation: { pdfo: false, vz: false, esv: false, notes: 'За наявності документів — без обмеження. Без документів — як дохід.' },
    limits: ['Обовʼязковий авансовий звіт за 5 банк. днів', 'Без чеків — як додаткове благо'],
  },

  // ── КОМПЕНСАЦІЇ ──
  {
    id: 'indeksatsiia-zp', slug: 'indeksatsiia-zarobitnoyi-platy',
    name: 'Індексація заробітної плати',
    category: 'compensation', payer: 'employer',
    base: 'Прожитковий мінімум для працездатних × кумулятивний ІСЦ',
    formula: '(Прожитковий мін. × кумулятивний ІСЦ понад 103%) — індексаційна сума',
    example: 'При зростанні ІСЦ на 5% з базового місяця: ПМ 3 028 ₴ × 5% = 151 ₴/міс.',
    legalRef: 'ЗУ № 1282-XII, Постанова КМУ № 1078',
    taxation: { pdfo: true, vz: true, esv: true, notes: 'Оподатковується як ЗП.' },
    limits: ['Базовий місяць — місяць останнього підвищення ЗП', 'ЗП не індексується, якщо роботодавець підвищив її більше за поріг'],
  },
  {
    id: 'kompensatsiia-vidpustky', slug: 'kompensatsiia-nevykorystanoi-vidpustky',
    name: 'Компенсація невикористаної відпустки',
    category: 'compensation', payer: 'employer',
    base: 'Середньоденна ЗП',
    formula: 'Невикористані к.д. × середньоденну',
    example: 'При звільненні: 12 невикористаних к.д. × 1 015 ₴ = 12 180 ₴.',
    legalRef: 'Ст. 24 ЗУ «Про відпустки»',
    taxation: { pdfo: true, vz: true, esv: true },
    limits: ['Виплачується тільки при звільненні (для основної)', 'Дитячі відпустки — компенсуються в т.ч. при звільненні'],
    popular: true,
  },
  {
    id: 'kompensatsiia-za-zatrymku-zp', slug: 'kompensatsiia-za-zatrymku-zp',
    name: 'Компенсація за затримку зарплати',
    category: 'compensation', payer: 'employer',
    base: 'Сума ЗП × ІСЦ за період затримки',
    formula: 'ЗП × (індекс інфляції за період затримки − 1)',
    example: 'ЗП 20 000 ₴, затримка 3 міс., ІСЦ кумулятивний 1.03 → компенсація 600 ₴.',
    legalRef: 'ЗУ № 2050-VIII «Про компенсацію втрати частини зарплати»',
    taxation: { pdfo: true, vz: true, esv: false, notes: 'ЄСВ не нараховується.' },
    limits: ['Затримка понад 1 міс.', 'Окрім штрафу 4 800 ₴ за ст. 265 КЗпП'],
  },

  // ── ВИХІДНА ДОПОМОГА ──
  {
    id: 'vykhidna-dopomoga-osnovna', slug: 'vykhidna-dopomoga-osnovna',
    name: 'Вихідна допомога (скорочення)',
    category: 'severance', payer: 'employer',
    base: 'Середньомісячна ЗП',
    formula: 'Не менше 1 середньомісячного заробітку',
    example: 'Скорочення, ЗП 30 000 ₴ → вихідна допомога 30 000 ₴.',
    legalRef: 'Ст. 44 КЗпП',
    taxation: { pdfo: true, vz: true, esv: false, notes: 'ЄСВ не нараховується (компенсаційна виплата).' },
    limits: ['При скороченні штату — мін. 1 середньомісячна ЗП', 'При відмові від переведення — 2 тижня', 'Звільненим за станом здоровʼя — 1 міс.'],
  },
  {
    id: 'vykhidna-mobilizatsiia', slug: 'vykhidna-mobilizatsiia-3-misiatsi',
    name: 'Вихідна допомога при мобілізації',
    category: 'severance', payer: 'employer',
    base: 'Середньомісячна ЗП',
    formula: '3 середньомісячні ЗП (за згодою сторін на звільнення)',
    example: 'ЗП 30 000 ₴ → 90 000 ₴ при звільненні мобілізованого за бажанням.',
    legalRef: 'Ст. 36 КЗпП п. 8',
    taxation: { pdfo: true, vz: true, esv: false },
    limits: ['Тільки при звільненні за бажанням мобілізованого', 'Не плутати з збереженням ЗП під час служби'],
  },

  // ── ВОЄННІ ──
  {
    id: 'bronyuvannia-zp', slug: 'bronyuvannia-zp',
    name: 'ЗП заброньованого працівника',
    category: 'wartime', payer: 'employer',
    base: 'Звичайна ЗП',
    formula: 'Звичайна ЗП в повному обсязі',
    example: 'Заброньований IT-фахівець: ЗП 60 000 ₴ → виплачується як зазвичай.',
    legalRef: 'Постанова КМУ № 76',
    taxation: { pdfo: true, vz: true, esv: true },
    limits: ['Бронювання — лише для критично важливих підприємств', 'Перевірка через Дія/Резерв+', 'До 50% штату підлягає бронюванню'],
  },
  {
    id: 'mobilizatsiya-zberezhennia', slug: 'mobilizatsiya-zberezhennia',
    name: 'Збереження робочого місця мобілізованому',
    category: 'wartime', payer: 'employer',
    base: '—',
    formula: 'З 2022 — без збереження ЗП, але зі збереженням посади і стажу',
    example: 'Мобілізований працівник: ЗП не нараховується, посада зберігається на весь термін служби.',
    legalRef: 'Ст. 119 КЗпП (зміни ЗУ № 2352-IX)',
    taxation: { pdfo: false, vz: false, esv: false, notes: 'Виплат немає, тому податків теж.' },
    limits: ['Виплати від ЗСУ — за рахунок держави', 'Може отримувати винагороду через Армія+'],
    popular: true,
  },
  {
    id: 'prostiy-prychyn-viyna', slug: 'prostiy-z-prychyn-viyna',
    name: 'Оплата простою (воєнний)',
    category: 'wartime', payer: 'employer',
    base: 'Тарифна ставка / оклад',
    formula: 'Не менше 2/3 тарифної ставки (окладу)',
    example: 'Оклад 20 000 ₴ → простій 13 333 ₴/міс.',
    legalRef: 'Ст. 113 КЗпП',
    taxation: { pdfo: true, vz: true, esv: true },
    limits: ['Простій з не залежних від працівника причин', 'Оформлюється наказом про простій', 'Можна оформити часткове скорочення часу'],
  },
];
