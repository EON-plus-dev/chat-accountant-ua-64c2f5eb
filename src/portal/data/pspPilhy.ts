/**
 * Податкова соціальна пільга (ПСП) — ст. 169 ПКУ.
 * Зменшує базу оподаткування ПДФО на місяць (до утримання 18%).
 * Застосовується лише до доходу від ОДНОГО роботодавця за заявою працівника
 * та лише якщо місячна ЗП ≤ граничного розміру (прожитковий мінімум × 1,4, округлено до 10 ₴).
 *
 * Snapshot: 2026 рік. Прожитковий мінімум працездатної особи на 01.01.2026: 3 028 ₴.
 * Базова ПСП (50%) = 1 514 ₴/міс. Граничний дохід = 4 240 ₴/міс.
 */

export const PSP_AS_OF = '2026-01';
export const PSP_PROZHYTKOVYY_2026 = 3028;
export const PSP_BASE_2026 = Math.round(PSP_PROZHYTKOVYY_2026 * 0.5); // 1 514 ₴
export const PSP_INCOME_LIMIT_2026 = 4240; // 3 028 × 1,4 ≈ 4 240 (округлено до 10)

export type PspCategory =
  | 'basic'
  | 'children'
  | 'single_parent'
  | 'disabled_child'
  | 'disability'
  | 'chornobyl'
  | 'war_veteran';

export interface PspEntry {
  /** Унікальний ідентифікатор для filter/key. */
  id: string;
  /** Категорія для фільтра. */
  category: PspCategory;
  /** Коротка назва пільги. */
  title: string;
  /** Хто має право (детально). */
  whoApplies: string;
  /** Коефіцієнт від базової ПСП (1.0 / 1.5 / 2.0). */
  coefficient: 1 | 1.5 | 2;
  /** Сума пільги 2026, ₴/міс (на одного працівника або × кількість дітей). */
  amount2026: number;
  /** Чи рахується на кількість дітей. */
  perChild: boolean;
  /** Підпункт ст. 169 ПКУ. */
  legalRef: string;
  /** Граничний дохід — стандартний чи підвищений (× кількість дітей). */
  incomeLimitMultiplier: 'standard' | 'per_child';
  /** Які документи потрібні від працівника. */
  documents: string[];
  /** Особливі умови / нотатки. */
  note?: string;
  /** Чи популярна категорія. */
  popular?: boolean;
}

export const PSP_CATEGORY_LABEL: Record<PspCategory, string> = {
  basic: 'Базова (загальна)',
  children: 'На дітей',
  single_parent: 'Одинокий батько / мати',
  disabled_child: 'На дитину з інвалідністю',
  disability: 'Інвалідність працівника',
  chornobyl: 'Чорнобильці 1–2 кат.',
  war_veteran: 'УБД / ветерани',
};

export const PSP_ENTRIES: PspEntry[] = [
  {
    id: 'basic',
    category: 'basic',
    title: 'Базова ПСП — 50%',
    whoApplies:
      'Будь-який працівник, чия місячна ЗП не перевищує граничний розмір (4 240 ₴ у 2026). На практиці — лише низькооплачувані категорії (двірники, прибиральниці, неповний робочий день).',
    coefficient: 1,
    amount2026: PSP_BASE_2026,
    perChild: false,
    legalRef: 'пп. 169.1.1 ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: ['Заява про застосування ПСП'],
    note: 'Зменшує базу оподаткування на 1 514 ₴ → економія ПДФО 272,52 ₴/міс.',
    popular: true,
  },
  {
    id: 'children-2plus',
    category: 'children',
    title: 'На двох і більше дітей до 18 років — 100% на кожну',
    whoApplies:
      'Один з батьків (за вибором). Граничний дохід = 4 240 ₴ × кількість дітей. Дозволяє реально користуватися ПСП при ЗП до 8 480 ₴ (2 дітей) чи 12 720 ₴ (3 дітей).',
    coefficient: 1,
    amount2026: PSP_BASE_2026,
    perChild: true,
    legalRef: 'пп. 169.1.2 ПКУ',
    incomeLimitMultiplier: 'per_child',
    documents: [
      'Заява про застосування ПСП',
      'Копії свідоцтв про народження дітей',
      'Заява другого з батьків про відмову від ПСП (нотаріально не обовʼязково)',
    ],
    note: 'Сума = 1 514 ₴ × кількість дітей. Другий з батьків ПСП на цих дітей застосувати НЕ може.',
    popular: true,
  },
  {
    id: 'single-parent',
    category: 'single_parent',
    title: 'Одинокий батько / мати, вдова, вдівець — 150%',
    whoApplies:
      'Самотній батько/мати з дитиною до 18 років (підтверджується «Книжкою матері-одиначки» або відсутністю запису про другого батька). Опікун, піклувальник дитини.',
    coefficient: 1.5,
    amount2026: Math.round(PSP_BASE_2026 * 1.5),
    perChild: true,
    legalRef: 'пп. 169.1.3 «а» ПКУ',
    incomeLimitMultiplier: 'per_child',
    documents: [
      'Заява про застосування ПСП',
      'Копії свідоцтв про народження дітей',
      'Документ про статус одинокого батька (довідка РАЦС, посвідчення)',
    ],
    note: 'Сума = 2 271 ₴ × кількість дітей. Граничний дохід × кількість дітей.',
  },
  {
    id: 'disabled-child',
    category: 'disabled_child',
    title: 'На дитину з інвалідністю — 150%',
    whoApplies:
      'Один з батьків, який утримує дитину з інвалідністю (до 18 років). Застосовується додатково до загальної ПСП на інших дітей.',
    coefficient: 1.5,
    amount2026: Math.round(PSP_BASE_2026 * 1.5),
    perChild: true,
    legalRef: 'пп. 169.1.3 «б» ПКУ',
    incomeLimitMultiplier: 'per_child',
    documents: [
      'Заява про застосування ПСП',
      'Копія свідоцтва про народження дитини',
      'Медичний висновок про дитину з інвалідністю (форма МСЕК)',
    ],
    note: 'Сума = 2 271 ₴ × кількість дітей з інвалідністю.',
  },
  {
    id: 'chornobyl',
    category: 'chornobyl',
    title: 'Постраждалі від ЧАЕС 1–2 категорії — 150%',
    whoApplies:
      'Особи з посвідченням постраждалого від Чорнобильської катастрофи 1 або 2 категорії.',
    coefficient: 1.5,
    amount2026: Math.round(PSP_BASE_2026 * 1.5),
    perChild: false,
    legalRef: 'пп. 169.1.3 «в» ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: [
      'Заява про застосування ПСП',
      'Копія посвідчення постраждалого від ЧАЕС 1/2 категорії',
    ],
    note: 'Сума 2 271 ₴/міс. Граничний дохід — стандартний 4 240 ₴.',
  },
  {
    id: 'student',
    category: 'basic',
    title: 'Учні, студенти, аспіранти — 150%',
    whoApplies:
      'Учні, студенти, аспіранти, ординатори, адʼюнкти, які отримують стипендію або працюють і не отримують стипендії з бюджету.',
    coefficient: 1.5,
    amount2026: Math.round(PSP_BASE_2026 * 1.5),
    perChild: false,
    legalRef: 'пп. 169.1.3 «г» ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: [
      'Заява про застосування ПСП',
      'Довідка з місця навчання',
    ],
    note: 'Не застосовується одночасно з ПСП на дітей.',
  },
  {
    id: 'disability-i-ii',
    category: 'disability',
    title: 'Особа з інвалідністю I–II групи — 150%',
    whoApplies:
      'Особи з інвалідністю I або II групи (крім тих, що належать до постраждалих від ЧАЕС, бо для них окрема пільга).',
    coefficient: 1.5,
    amount2026: Math.round(PSP_BASE_2026 * 1.5),
    perChild: false,
    legalRef: 'пп. 169.1.3 «ґ» ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: [
      'Заява про застосування ПСП',
      'Копія посвідчення / довідка МСЕК про групу інвалідності',
    ],
  },
  {
    id: 'afgan-veteran',
    category: 'war_veteran',
    title: 'Учасники бойових дій до 1945 р. — 150%',
    whoApplies:
      'Учасники бойових дій під час Другої світової війни, працівники тилу.',
    coefficient: 1.5,
    amount2026: Math.round(PSP_BASE_2026 * 1.5),
    perChild: false,
    legalRef: 'пп. 169.1.3 «е» ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: ['Копія посвідчення УБД'],
  },
  {
    id: 'hero-ukraine',
    category: 'war_veteran',
    title: 'Герої України, Герої СРСР, Соц. Праці — 200%',
    whoApplies:
      'Особи з відзнаками «Герой України», «Герой Радянського Союзу», «Герой Соціалістичної Праці», повні кавалери ордена Слави, Трудової Слави.',
    coefficient: 2,
    amount2026: PSP_BASE_2026 * 2,
    perChild: false,
    legalRef: 'пп. 169.1.4 «а» ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: ['Копія посвідчення / орденської книжки'],
    note: 'Сума 3 028 ₴/міс.',
  },
  {
    id: 'concentration-camp',
    category: 'war_veteran',
    title: 'Колишні вʼязні концтаборів, репресовані — 200%',
    whoApplies:
      'Колишні вʼязні концтаборів, гетто, інших місць примусового тримання під час Другої світової війни; особи, визнані репресованими або реабілітованими.',
    coefficient: 2,
    amount2026: PSP_BASE_2026 * 2,
    perChild: false,
    legalRef: 'пп. 169.1.4 «б»–«в» ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: ['Копія документа про реабілітацію / статус'],
  },
  {
    id: 'leningrad-blockade',
    category: 'war_veteran',
    title: 'Особи, насильно вивезені з СРСР під час Другої світової — 200%',
    whoApplies:
      'Особи, які підпадають під дію пп. 169.1.4 «г» ПКУ — насильно вивезені на роботи в Німеччину чи інші країни.',
    coefficient: 2,
    amount2026: PSP_BASE_2026 * 2,
    perChild: false,
    legalRef: 'пп. 169.1.4 «г» ПКУ',
    incomeLimitMultiplier: 'standard',
    documents: ['Копія посвідчення / архівної довідки'],
  },
];

/** Розрахунок граничного доходу з урахуванням дітей. */
export const calcIncomeLimit = (entry: PspEntry, childrenCount = 1): number => {
  if (entry.incomeLimitMultiplier === 'per_child') {
    return PSP_INCOME_LIMIT_2026 * Math.max(1, childrenCount);
  }
  return PSP_INCOME_LIMIT_2026;
};

/** Скільки фактично ПДФО економить ця ПСП за місяць (18% від суми пільги). */
export const calcPdfoEconomy = (entry: PspEntry, childrenCount = 1): number => {
  const total = entry.perChild ? entry.amount2026 * Math.max(1, childrenCount) : entry.amount2026;
  return Math.round(total * 0.18 * 100) / 100;
};
