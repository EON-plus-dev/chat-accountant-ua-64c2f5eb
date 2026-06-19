/**
 * Military Tax Calculator
 * Розрахунок Військового збору для ФОП
 * Відповідно до п. 161 підрозд. 10 ПКУ (з 01.12.2024)
 */

import type { VZCalculation, FopGroup } from "@/config/reportsConfig";
import { VZ_RATE_GROUP_3, VZ_FIXED_GROUP_1, VZ_FIXED_GROUP_2 } from "@/config/reportsConfig";

// Дата набрання чинності ВЗ для ФОП
const VZ_EFFECTIVE_DATE = new Date("2024-12-01");

// Інтерфейс для вхідних даних
export interface MilitaryTaxInput {
  fopGroup: FopGroup;
  income: number;           // Загальний дохід за період
  periodStart: Date;        // Початок періоду
  periodEnd: Date;          // Кінець періоду
  paidAmount?: number;      // Вже сплачена сума
}

// Інтерфейс для щомісячного розрахунку
export interface MonthlyVZBreakdown {
  month: number;
  year: number;
  monthName: string;
  income: number;
  vzAmount: number;
  isEffective: boolean;     // Чи діяв ВЗ у цьому місяці
}

/**
 * Розраховує Військовий збір для ФОП
 */
export function calculateMilitaryTax(input: MilitaryTaxInput): VZCalculation {
  const { fopGroup, income, periodStart, periodEnd, paidAmount = 0 } = input;

  // Перевіряємо чи період включає дати після 01.12.2024
  const effectiveMonths = getEffectiveMonths(periodStart, periodEnd);

  if (effectiveMonths === 0) {
    // Період до набрання чинності — ВЗ не застосовується
    return {
      baseAmount: 0,
      rate: 0,
      calculatedVZ: 0,
      paidAmount: 0,
      toPay: 0,
      isLinkedToEP: true,
    };
  }

  let calculatedVZ: number;
  let rate: number;
  let baseAmount: number;

  if (fopGroup === 3) {
    // 3 група — 1% від доходу
    rate = VZ_RATE_GROUP_3 * 100; // 1%
    
    // Розраховуємо дохід тільки за ефективні місяці
    const totalMonths = getMonthsDifference(periodStart, periodEnd);
    const effectiveIncome = totalMonths > 0 
      ? (income / totalMonths) * effectiveMonths 
      : income;
    
    baseAmount = effectiveIncome;
    calculatedVZ = Math.round(effectiveIncome * VZ_RATE_GROUP_3);
  } else {
    // 1-2 група — фіксована сума
    rate = 0;
    baseAmount = 0;
    
    const fixedAmount = fopGroup === 1 ? VZ_FIXED_GROUP_1 : VZ_FIXED_GROUP_2;
    calculatedVZ = fixedAmount * effectiveMonths;
  }

  const toPay = Math.max(0, calculatedVZ - paidAmount);

  return {
    baseAmount,
    rate,
    calculatedVZ,
    paidAmount,
    toPay,
    isLinkedToEP: true,
  };
}

/**
 * Розраховує ВЗ з помісячною деталізацією
 */
export function calculateMonthlyBreakdown(input: MilitaryTaxInput): MonthlyVZBreakdown[] {
  const { fopGroup, income, periodStart, periodEnd } = input;
  const breakdown: MonthlyVZBreakdown[] = [];

  const totalMonths = getMonthsDifference(periodStart, periodEnd);
  const monthlyIncome = totalMonths > 0 ? income / totalMonths : income;

  let currentDate = new Date(periodStart);
  
  while (currentDate <= periodEnd) {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const isEffective = currentDate >= VZ_EFFECTIVE_DATE;

    let vzAmount = 0;
    let monthIncome = 0;

    if (isEffective) {
      if (fopGroup === 3) {
        monthIncome = monthlyIncome;
        vzAmount = Math.round(monthlyIncome * VZ_RATE_GROUP_3);
      } else {
        vzAmount = fopGroup === 1 ? VZ_FIXED_GROUP_1 : VZ_FIXED_GROUP_2;
      }
    }

    breakdown.push({
      month,
      year,
      monthName: getMonthName(month),
      income: monthIncome,
      vzAmount,
      isEffective,
    });

    // Перейти до наступного місяця
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return breakdown;
}

/**
 * Перевіряє чи застосовується ВЗ для даного періоду
 */
export function isVZApplicable(periodEnd: Date): boolean {
  return periodEnd >= VZ_EFFECTIVE_DATE;
}

/**
 * Отримує кількість місяців, протягом яких діяв ВЗ
 */
function getEffectiveMonths(periodStart: Date, periodEnd: Date): number {
  if (periodEnd < VZ_EFFECTIVE_DATE) {
    return 0;
  }

  const effectiveStart = periodStart > VZ_EFFECTIVE_DATE ? periodStart : VZ_EFFECTIVE_DATE;
  return getMonthsDifference(effectiveStart, periodEnd);
}

/**
 * Розраховує різницю в місяцях
 */
function getMonthsDifference(start: Date, end: Date): number {
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/**
 * Отримує назву місяця
 */
function getMonthName(month: number): string {
  const months = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];
  return months[month - 1];
}

/**
 * Форматує ставку ВЗ для відображення
 */
export function formatVZRate(fopGroup: FopGroup): string {
  if (fopGroup === 3) {
    return "1% від доходу";
  } else if (fopGroup === 2) {
    return `${VZ_FIXED_GROUP_2} грн/міс (фіксовано)`;
  } else {
    return `${VZ_FIXED_GROUP_1} грн/міс (фіксовано)`;
  }
}

/**
 * Отримує законодавче обгрунтування ВЗ
 */
export function getVZLegalBasis(): {
  article: string;
  description: string;
  effectiveDate: string;
} {
  return {
    article: "п. 161 підрозд. 10 ПКУ",
    description: "Військовий збір для платників єдиного податку",
    effectiveDate: "01.12.2024",
  };
}
