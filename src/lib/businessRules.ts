/**
 * Модуль бізнес-правил для перевірки сумісності КВЕД з групами ЄП
 * та валідації податкових лімітів
 * 
 * ВАЖЛИВО: Всі податкові константи імпортуються з taxConstantsConfig.ts
 * При зміні законодавства оновлюйте ТІЛЬКИ той файл!
 */

import {
  MINIMUM_WAGE,
  FOP_INCOME_LIMITS as IMPORTED_FOP_LIMITS,
  TAX_RATES as IMPORTED_TAX_RATES,
  ESV_MONTHLY,
  EP_FIXED,
  formatTaxCurrency,
  type TaxGroup,
} from "@/config/taxConstantsConfig";

// =====================================
// РЕЕКСПОРТ КОНСТАНТ (для зворотної сумісності)
// =====================================

export const FOP_INCOME_LIMITS = IMPORTED_FOP_LIMITS;
export const TAX_RATES = IMPORTED_TAX_RATES;

/** @deprecated Використовуйте MINIMUM_WAGE з taxConstantsConfig */
export const MINIMUM_WAGE_2025 = MINIMUM_WAGE;

/** @deprecated Використовуйте TAX_RATES та ESV_MONTHLY з taxConstantsConfig */
export const TAX_CONSTANTS = {
  esvRate: IMPORTED_TAX_RATES.esv,
  esvMonthly: ESV_MONTHLY,
  epGroup1: EP_FIXED.group1,
  epGroup2: EP_FIXED.group2,
  epGroup3_5: IMPORTED_TAX_RATES.epGroup3_withoutVat,
  epGroup3_3: IMPORTED_TAX_RATES.epGroup3_withVat,
};

// ============================================
// ЗАБОРОНЕНІ КВЕД ЗА ГРУПАМИ ЄП
// ============================================

interface KvedRule {
  pattern: RegExp;
  reason: string;
}

// Заборонені секції/коди для ВСІХ груп ЄП
const FORBIDDEN_ALL_GROUPS: KvedRule[] = [
  // Гральний бізнес
  { pattern: /^92\.00/, reason: 'Гральний бізнес заборонений на ЄП' },
  
  // Валютні операції
  { pattern: /^66\.12/, reason: 'Обмін валют заборонений на ЄП' },
  
  // Підакцизні товари (алкоголь, тютюн, пальне)
  { pattern: /^11\.(01|02|03|04|05|06|07)/, reason: 'Виробництво алкоголю заборонене на ЄП' },
  { pattern: /^12\.00/, reason: 'Виробництво тютюну заборонене на ЄП' },
  { pattern: /^19\.20/, reason: 'Виробництво пального заборонене на ЄП' },
  
  // Видобуток корисних копалин (крім місцевого значення)
  { pattern: /^0[5-9]\./, reason: 'Видобуток корисних копалин заборонений на ЄП' },
  
  // Фінансове посередництво
  { pattern: /^64\.(11|19|92)/, reason: 'Фінансове посередництво заборонене на ЄП' },
  { pattern: /^66\.(11|19|30)/, reason: 'Фінансові послуги заборонені на ЄП' },
  
  // Поштовий зв'язок (кур'єрська дозволена - 53.20)
  { pattern: /^53\.10/, reason: 'Послуги пошти заборонені на ЄП (кур\'єрська дозволена)' },
  
  // Телекомунікації
  { pattern: /^61\.(10|20|30)/, reason: 'Телекомунікаційні послуги заборонені на ЄП' },
];

// Дозволені КВЕД для групи 1 (обмежений перелік)
const ALLOWED_GROUP_1: RegExp[] = [
  /^47\.(81|82|89|91|99)/, // Роздрібна торгівля на ринках
  /^96\.(01|02|04|09)/,     // Побутові послуги населенню
  /^95\.(11|12|21|22|23|24|25|29)/, // Ремонт побутових виробів
];

// Заборонені для групи 2 (окрім загальних)
const FORBIDDEN_GROUP_2: KvedRule[] = [
  { pattern: /^68\.31/, reason: 'Ріелторська діяльність дозволена тільки на 3 групі' },
  { pattern: /^32\.12/, reason: 'Виробництво ювелірних виробів заборонене на 2 групі' },
  { pattern: /^46\.48.*ювелір/i, reason: 'Торгівля ювелірними виробами заборонена на 2 групі' },
  { pattern: /^47\.77/, reason: 'Роздрібна торгівля ювелірними виробами заборонена на 2 групі' },
];

// ============================================
// ВАЛІДАЦІЯ КВЕД
// ============================================

export interface KvedValidationResult {
  isAllowed: boolean;
  reason?: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Перевіряє сумісність КВЕД з групою ЄП
 */
export function validateKvedForTaxGroup(
  kvedCode: string,
  taxGroup: 1 | 2 | 3
): KvedValidationResult {
  // Нормалізуємо код (видаляємо пробіли)
  const code = kvedCode.trim();
  
  // 1. Перевірка загальних заборон для всіх груп
  for (const rule of FORBIDDEN_ALL_GROUPS) {
    if (rule.pattern.test(code)) {
      return {
        isAllowed: false,
        reason: rule.reason,
        severity: 'error',
      };
    }
  }
  
  // 2. Специфічні обмеження для групи 1
  if (taxGroup === 1) {
    const isAllowed = ALLOWED_GROUP_1.some(pattern => pattern.test(code));
    if (!isAllowed) {
      return {
        isAllowed: false,
        reason: 'Група 1 дозволяє лише роздрібну торгівлю на ринках та побутові послуги населенню',
        suggestion: 'Оберіть групу 2 або 3 для цього виду діяльності',
        severity: 'error',
      };
    }
  }
  
  // 3. Специфічні обмеження для групи 2
  if (taxGroup === 2) {
    for (const rule of FORBIDDEN_GROUP_2) {
      if (rule.pattern.test(code)) {
        return {
          isAllowed: false,
          reason: rule.reason,
          suggestion: 'Перейдіть на групу 3 для цього виду діяльності',
          severity: 'error',
        };
      }
    }
    
    // Попередження про обмеження клієнтів для групи 2
    // Група 2 може працювати тільки з населенням та платниками ЄП
    return {
      isAllowed: true,
      reason: 'Група 2: клієнти — тільки населення та платники ЄП',
      severity: 'warning',
    };
  }
  
  return { isAllowed: true, severity: 'info' };
}

// ============================================
// ВАЛІДАЦІЯ ЛІМІТІВ ДОХОДУ
// ============================================

export type IncomeLimitStatus = 'safe' | 'warning' | 'critical' | 'exceeded';

export interface IncomeLimitValidation {
  currentIncome: number;
  limit: number;
  usedPercent: number;
  status: IncomeLimitStatus;
  remainingAmount: number;
  monthsUntilLimit: number | null;
  message: string;
  recommendation?: string;
}

/**
 * Перевіряє поточний дохід відносно ліміту групи ЄП
 */
export function validateIncomeLimit(
  taxGroup: 1 | 2 | 3,
  yearlyIncome: number,
  monthlyAverage?: number
): IncomeLimitValidation {
  const limit = FOP_INCOME_LIMITS[taxGroup];
  const usedPercent = (yearlyIncome / limit) * 100;
  const remaining = Math.max(limit - yearlyIncome, 0);
  
  // Прогноз місяців до ліміту
  let monthsUntilLimit: number | null = null;
  if (monthlyAverage && monthlyAverage > 0 && remaining > 0) {
    monthsUntilLimit = Math.ceil(remaining / monthlyAverage);
  }
  
  // Визначення статусу
  let status: IncomeLimitStatus;
  let message: string;
  let recommendation: string | undefined;
  
  if (usedPercent >= 100) {
    status = 'exceeded';
    message = `Ліміт перевищено на ${formatCurrency(yearlyIncome - limit)}!`;
    recommendation = taxGroup < 3 
      ? 'Необхідно перейти на вищу групу або загальну систему оподаткування'
      : 'Необхідно перейти на загальну систему оподаткування';
  } else if (usedPercent >= 90) {
    status = 'critical';
    message = `До ліміту залишилось ${formatCurrency(remaining)} (${(100 - usedPercent).toFixed(1)}%)`;
    recommendation = 'Рекомендуємо планувати перехід на вищу групу';
  } else if (usedPercent >= 75) {
    status = 'warning';
    message = `Використано ${usedPercent.toFixed(0)}% ліміту`;
    recommendation = 'Слідкуйте за динамікою доходів';
  } else {
    status = 'safe';
    message = `Ліміт: ${formatCurrency(remaining)} вільно`;
  }
  
  return {
    currentIncome: yearlyIncome,
    limit,
    usedPercent: Math.min(usedPercent, 100),
    status,
    remainingAmount: remaining,
    monthsUntilLimit,
    message,
    recommendation,
  };
}

// ============================================
// ВАЛІДАЦІЯ ПДВ + ГРУПА
// ============================================

export interface VatGroupValidation {
  isValid: boolean;
  error?: string;
  autoCorrection?: {
    field: 'taxRate' | 'isVatPayer';
    value: number | boolean;
    reason: string;
  };
}

/**
 * Перевіряє відповідність ПДВ статусу та групи/ставки ЄП
 */
export function validateVatAndTaxGroup(
  taxGroup: 1 | 2 | 3,
  taxRate: number,
  isVatPayer: boolean
): VatGroupValidation {
  // Група 1 та 2 не можуть бути платниками ПДВ
  if ((taxGroup === 1 || taxGroup === 2) && isVatPayer) {
    return {
      isValid: false,
      error: `Група ${taxGroup} не передбачає статус платника ПДВ`,
      autoCorrection: {
        field: 'isVatPayer',
        value: false,
        reason: 'ПДВ доступний тільки для групи 3',
      },
    };
  }
  
  // Група 3: перевірка відповідності ставки та ПДВ
  if (taxGroup === 3) {
    // 3% — обов'язково платник ПДВ
    if (taxRate === 3 && !isVatPayer) {
      return {
        isValid: false,
        error: 'Ставка 3% передбачає статус платника ПДВ',
        autoCorrection: {
          field: 'isVatPayer',
          value: true,
          reason: 'При ставці 3% ПДВ обов\'язковий',
        },
      };
    }
    
    // 5% — автоматично скидаємо ПДВ (замість зміни ставки)
    if (taxRate === 5 && isVatPayer) {
      return {
        isValid: false,
        error: 'Ставка 5% передбачає відсутність статусу платника ПДВ',
        autoCorrection: {
          field: 'isVatPayer',
          value: false,
          reason: 'Ставка 5% не передбачає статус платника ПДВ',
        },
      };
    }
  }
  
  return { isValid: true };
}

// ============================================
// УТИЛІТИ
// ============================================

/**
 * Форматування суми у валюту
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} млн ₴`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)} тис ₴`;
  }
  return `${value.toFixed(0)} ₴`;
}

/**
 * Отримує ліміт для групи ЄП
 */
export function getIncomeLimitForGroup(taxGroup: 1 | 2 | 3): number {
  return FOP_INCOME_LIMITS[taxGroup];
}

/**
 * Розраховує податки для групи ЄП
 */
export function calculateMonthlyTaxes(taxGroup: 1 | 2 | 3, monthlyIncome: number = 0): {
  ep: number;
  esv: number;
  total: number;
} {
  let ep: number;
  
  switch (taxGroup) {
    case 1:
      ep = TAX_CONSTANTS.epGroup1;
      break;
    case 2:
      ep = TAX_CONSTANTS.epGroup2;
      break;
    case 3:
      // 5% від доходу (стандартно без ПДВ)
      ep = monthlyIncome * TAX_CONSTANTS.epGroup3_5;
      break;
  }
  
  const esv = TAX_CONSTANTS.esvMonthly;
  
  return {
    ep,
    esv,
    total: ep + esv,
  };
}
