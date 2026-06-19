/**
 * Централізований конфігураційний файл податкових констант України
 * 
 * ВАЖЛИВО: При зміні законодавства оновлюйте ТІЛЬКИ цей файл!
 * Всі інші модулі імпортують константи звідси.
 * 
 * Останнє оновлення: 2026-02-25
 * Джерела: tax.gov.ua, index.minfin.com.ua, ПКУ ст.293
 */

// =====================================
// ТИПИ
// =====================================

export interface TaxPeriod {
  startDate: string;     // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD, undefined = діє зараз
  minimumWage: number;
  note?: string;
}

export type TaxGroup = 1 | 2 | 3;

// =====================================
// ІСТОРІЯ ЗМІН МЗП
// =====================================

/**
 * Історія змін мінімальної заробітної плати
 * Використовується для коректних розрахунків за минулі періоди
 */
export const MINIMUM_WAGE_HISTORY: TaxPeriod[] = [
  { startDate: '2026-01-01', minimumWage: 8647, note: 'З 1 січня 2026' },
  { startDate: '2025-01-01', endDate: '2025-12-31', minimumWage: 8000, note: 'Весь 2025 рік (без змін)' },
  { startDate: '2024-04-01', endDate: '2024-12-31', minimumWage: 8000, note: 'З 1 квітня 2024' },
  { startDate: '2024-01-01', endDate: '2024-03-31', minimumWage: 7100, note: 'З 1 січня 2024' },
  { startDate: '2023-10-01', endDate: '2023-12-31', minimumWage: 6700, note: 'З 1 жовтня 2023' },
  { startDate: '2023-01-01', endDate: '2023-09-30', minimumWage: 6700, note: 'З 1 січня 2023' },
];

// =====================================
// ПОТОЧНІ КОНСТАНТИ
// =====================================

/** Поточний податковий рік */
export const CURRENT_TAX_YEAR = 2026;

/** Поточна мінімальна заробітна плата (грн) */
export const MINIMUM_WAGE = 8647;

/** Дата набуття чинності поточного МЗП */
export const MINIMUM_WAGE_EFFECTIVE_DATE = '2026-01-01';

/** Прожитковий мінімум для працездатних осіб (грн) — для розрахунку ЄП групи 1 */
export const SUBSISTENCE_MINIMUM = 3328;

// =====================================
// СТАВКИ ПОДАТКІВ
// =====================================

export const TAX_RATES = {
  /** ЄСВ — єдиний соціальний внесок (22%) */
  esv: 0.22,
  
  /** Єдиний податок для групи 1 (до 10% від прожиткового мінімуму, ст.293 ПКУ) */
  epGroup1: 0.10,
  
  /** Єдиний податок для групи 2 (до 20% від МЗП) */
  epGroup2: 0.20,
  
  /** Єдиний податок для групи 3 без ПДВ (5% від доходу) */
  epGroup3_withoutVat: 0.05,
  
  /** Єдиний податок для групи 3 з ПДВ (3% від доходу) */
  epGroup3_withVat: 0.03,
  
  /**
   * Військовий збір — загальна ставка (5%)
   * Застосовується до: зарплат найманих працівників, ПДФО-доходів фізосіб,
   * пасивних доходів, інвестиційних прибутків.
   * Діє з 01.01.2025 (ЗУ №4015-IX). До 31.12.2024 — 1.5%.
   */
  militaryTax: 0.05,

  /**
   * Військовий збір для ФОП груп 1, 2, 3 та 4 — 1% від доходу
   * Окрема ставка згідно ЗУ №4015-IX (діє з 01.12.2024)
   * НЕ плутати зі ставкою 5% — для ФОП діє знижена ставка 1%.
   */
  militaryTaxFop: 0.01,
  
  /** ПДФО — податок на доходи фізичних осіб (18%) */
  personalIncomeTax: 0.18,
  
  /** ПДВ — податок на додану вартість (20%) */
  vat: 0.20,
} as const;

// =====================================
// ЛІМІТИ ДОХОДУ ФОП
// =====================================

/** Множники для розрахунку лімітів (кількість МЗП) */
export const FOP_LIMIT_MULTIPLIERS = {
  group1: 167,  // 167 МЗП
  group2: 834,  // 834 МЗП
  group3: 1167, // 1167 МЗП
} as const;

/** Автоматично розраховані ліміти доходу на основі поточного МЗП */
export const FOP_INCOME_LIMITS: Record<TaxGroup, number> = {
  1: MINIMUM_WAGE * FOP_LIMIT_MULTIPLIERS.group1,  // 1 444 049 грн
  2: MINIMUM_WAGE * FOP_LIMIT_MULTIPLIERS.group2,  // 7 211 598 грн
  3: MINIMUM_WAGE * FOP_LIMIT_MULTIPLIERS.group3,  // 10 091 049 грн
} as const;

// =====================================
// ОБЧИСЛЮВАНІ КОНСТАНТИ
// =====================================

/** Місячний ЄСВ для ФОП (мінімальний внесок): 8647 × 22% = 1902,34 грн */
export const ESV_MONTHLY = Math.round(MINIMUM_WAGE * TAX_RATES.esv);

/** Квартальний ЄСВ для ФОП */
export const ESV_QUARTERLY = ESV_MONTHLY * 3;

/** Річний ЄСВ для ФОП */
export const ESV_YEARLY = ESV_MONTHLY * 12;

/** Фіксований єдиний податок для груп 1-2 */
export const EP_FIXED = {
  /** Група 1: 10% від прожиткового мінімуму (3328 × 10% = 332,80 грн) */
  group1: Math.round(SUBSISTENCE_MINIMUM * TAX_RATES.epGroup1),
  /** Група 2: 20% від МЗП (8647 × 20% = 1729,40 грн) */
  group2: Math.round(MINIMUM_WAGE * TAX_RATES.epGroup2),
} as const;

// =====================================
// ФУНКЦІЇ-ХЕЛПЕРИ
// =====================================

/**
 * Отримати МЗП для конкретної дати
 * @param date Дата для перевірки
 * @returns Мінімальна зарплата на вказану дату
 */
export function getMinimumWageForDate(date: Date): number {
  const dateStr = date.toISOString().split('T')[0];
  
  for (const period of MINIMUM_WAGE_HISTORY) {
    if (dateStr >= period.startDate) {
      if (!period.endDate || dateStr <= period.endDate) {
        return period.minimumWage;
      }
    }
  }
  
  return MINIMUM_WAGE; // fallback на поточне значення
}

/**
 * Отримати ліміти ФОП для конкретного року
 * @param year Рік для розрахунку
 * @returns Об'єкт з лімітами для кожної групи
 */
export function getFopLimitsForYear(year: number): Record<TaxGroup, number> {
  const yearEndDate = new Date(year, 11, 31);
  const mzp = getMinimumWageForDate(yearEndDate);
  
  return {
    1: mzp * FOP_LIMIT_MULTIPLIERS.group1,
    2: mzp * FOP_LIMIT_MULTIPLIERS.group2,
    3: mzp * FOP_LIMIT_MULTIPLIERS.group3,
  };
}

/**
 * Отримати ставку ЄП для групи
 * @param group Група єдиного податку
 * @param isVatPayer Чи є платником ПДВ (для групи 3)
 * @returns Ставка податку
 */
export function getEpRateForGroup(group: TaxGroup, isVatPayer: boolean = false): number {
  switch (group) {
    case 1:
      return TAX_RATES.epGroup1;
    case 2:
      return TAX_RATES.epGroup2;
    case 3:
      return isVatPayer ? TAX_RATES.epGroup3_withVat : TAX_RATES.epGroup3_withoutVat;
  }
}

/**
 * Розрахувати ЄСВ для періоду з урахуванням зміни МЗП
 * @param startDate Початок періоду
 * @param endDate Кінець періоду
 * @returns Загальна сума та помісячна розбивка
 */
export function calculateEsvForPeriod(
  startDate: Date,
  endDate: Date
): { total: number; breakdown: { month: string; mzp: number; amount: number }[] } {
  const breakdown: { month: string; mzp: number; amount: number }[] = [];
  let total = 0;
  
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  
  while (current <= end) {
    const mzp = getMinimumWageForDate(current);
    const esv = Math.round(mzp * TAX_RATES.esv);
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    
    breakdown.push({ month: monthKey, mzp, amount: esv });
    total += esv;
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return { total, breakdown };
}

/**
 * Форматування валюти
 * @param value Сума в грн
 * @returns Відформатована строка
 */
export function formatTaxCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} млн ₴`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} тис ₴`;
  }
  return `${value.toLocaleString('uk-UA')} ₴`;
}

/**
 * Отримати інформацію про поточні константи для відображення в UI
 */
export function getTaxConstantsInfo() {
  return {
    minimumWage: MINIMUM_WAGE,
    minimumWageFormatted: `${MINIMUM_WAGE.toLocaleString('uk-UA')} ₴`,
    effectiveDate: MINIMUM_WAGE_EFFECTIVE_DATE,
    subsistenceMinimum: SUBSISTENCE_MINIMUM,
    esvMonthly: ESV_MONTHLY,
    esvMonthlyFormatted: `${ESV_MONTHLY.toLocaleString('uk-UA')} ₴`,
    limits: {
      group1: FOP_INCOME_LIMITS[1],
      group2: FOP_INCOME_LIMITS[2],
      group3: FOP_INCOME_LIMITS[3],
    },
    year: CURRENT_TAX_YEAR,
  };
}
