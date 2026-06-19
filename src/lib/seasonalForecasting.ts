/**
 * Seasonal Forecasting Engine
 * Provides industry-specific seasonal coefficients for FOP income forecasting
 */

// Industry types based on demo cabinets
export type IndustryType = "consulting" | "it" | "autorepair" | "dealer" | "default";

// Monthly seasonal coefficients (1.0 = average, >1.0 = above average, <1.0 = below average)
// Index 0 = January, 11 = December
export const SEASONAL_FACTORS: Record<IndustryType, number[]> = {
  // Consulting: Peak in Q1 (budgeting season) and Q4 (year-end projects), slow summer
  consulting: [1.2, 1.1, 1.0, 0.9, 0.9, 0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
  
  // IT: Relatively stable throughout the year with slight dip in summer
  it: [1.0, 1.0, 1.0, 1.0, 1.0, 0.95, 0.95, 0.95, 1.0, 1.0, 1.05, 1.05],
  
  // Auto repair: Peak in spring (post-winter damage) and fall (tire change season)
  autorepair: [0.8, 0.85, 1.2, 1.25, 1.0, 0.9, 0.85, 0.9, 1.1, 1.2, 1.1, 0.85],
  
  // Dealer/Trade: Peak in Q4 (holidays), slow in Q1 (post-holiday)
  dealer: [0.7, 0.8, 0.9, 0.95, 1.0, 0.95, 0.85, 0.9, 1.0, 1.1, 1.2, 1.4],
  
  // Default: Even distribution
  default: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
};

// Month labels for display
export const MONTH_LABELS_SHORT = [
  "Січ", "Лют", "Бер", "Кві", "Тра", "Чер",
  "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"
];

export interface SeasonalForecast {
  projectedYearEnd: number;
  willExceed: boolean;
  monthsUntilLimit: number | null;
  monthlyProjections: MonthlyProjection[];
  peakMonth: number;
  lowMonth: number;
  avgMonthlyForecast: number;
}

export interface MonthlyProjection {
  month: number; // 0-11
  label: string;
  factor: number;
  projectedIncome: number;
  cumulativeIncome: number;
  isProjected: boolean; // false for past months (actual data)
}

/**
 * Detect industry type from cabinet name or id
 */
export function detectIndustryType(cabinetId: string, cabinetName?: string): IndustryType {
  const id = cabinetId.toLowerCase();
  const name = (cabinetName || "").toLowerCase();
  
  if (id.includes("consulting") || name.includes("консалт")) return "consulting";
  if (id.includes("it") || name.includes("айті") || name.includes("розроб")) return "it";
  if (id.includes("autorepair") || id.includes("auto") || name.includes("сто") || name.includes("авто")) return "autorepair";
  if (id.includes("dealer") || name.includes("дилер") || name.includes("торг")) return "dealer";
  
  return "default";
}

/**
 * Get seasonal factors for an industry
 */
export function getSeasonalFactors(industry: IndustryType): number[] {
  return SEASONAL_FACTORS[industry] || SEASONAL_FACTORS.default;
}

/**
 * Calculate seasonal forecast with industry-specific coefficients
 */
export function calculateSeasonalForecast(
  yearlyIncome: number,
  limit: number,
  currentMonth: number, // 1-12 (January = 1)
  industry: IndustryType,
  growthScenario: number = 1.0 // 0.8 = optimistic, 1.0 = base, 1.2 = pessimistic
): SeasonalForecast {
  const factors = getSeasonalFactors(industry);
  const monthIndex = currentMonth - 1; // Convert to 0-11
  
  // Calculate average monthly income from past months
  const monthlyAverage = monthIndex > 0 ? yearlyIncome / currentMonth : 0;
  
  // Generate projections for each month
  const monthlyProjections: MonthlyProjection[] = [];
  let cumulative = 0;
  
  for (let m = 0; m < 12; m++) {
    const factor = factors[m];
    let projectedIncome: number;
    let isProjected: boolean;
    
    if (m < monthIndex) {
      // Past months - use proportional split of actual income
      // (simplified: assume even distribution for demo)
      projectedIncome = yearlyIncome / currentMonth;
      isProjected = false;
    } else if (m === monthIndex) {
      // Current month - partial actual + partial projected
      projectedIncome = yearlyIncome / currentMonth; // Simplified
      isProjected = false;
    } else {
      // Future months - apply seasonal factor and growth scenario
      projectedIncome = monthlyAverage * factor * growthScenario;
      isProjected = true;
    }
    
    cumulative += projectedIncome;
    
    monthlyProjections.push({
      month: m,
      label: MONTH_LABELS_SHORT[m],
      factor,
      projectedIncome,
      cumulativeIncome: cumulative,
      isProjected,
    });
  }
  
  // Calculate projected year-end
  const projectedYearEnd = monthlyProjections[11].cumulativeIncome;
  const willExceed = projectedYearEnd > limit;
  
  // Find month when limit will be exceeded
  let monthsUntilLimit: number | null = null;
  const remaining = limit - yearlyIncome;
  
  if (remaining > 0 && monthlyAverage > 0) {
    let accumulatedProjected = 0;
    for (let m = monthIndex; m < 12; m++) {
      const projectedMonthly = monthlyAverage * factors[m] * growthScenario;
      accumulatedProjected += projectedMonthly;
      if (accumulatedProjected >= remaining) {
        monthsUntilLimit = m - monthIndex + 1;
        break;
      }
    }
  }
  
  // Find peak and low months in remaining period
  const remainingFactors = factors.slice(monthIndex);
  const peakMonth = monthIndex + remainingFactors.indexOf(Math.max(...remainingFactors));
  const lowMonth = monthIndex + remainingFactors.indexOf(Math.min(...remainingFactors));
  
  // Average monthly forecast for remaining months
  const remainingMonths = 12 - currentMonth;
  const projectedRemaining = projectedYearEnd - yearlyIncome;
  const avgMonthlyForecast = remainingMonths > 0 ? projectedRemaining / remainingMonths : 0;
  
  return {
    projectedYearEnd,
    willExceed,
    monthsUntilLimit,
    monthlyProjections,
    peakMonth,
    lowMonth,
    avgMonthlyForecast,
  };
}

/**
 * Get seasonal insight text for display
 */
export function getSeasonalInsight(industry: IndustryType, currentMonth: number): string {
  const factors = getSeasonalFactors(industry);
  const monthIndex = currentMonth - 1;
  const currentFactor = factors[monthIndex];
  
  // Find next significant change
  let nextPeak = -1;
  let nextLow = -1;
  
  for (let m = monthIndex + 1; m < 12; m++) {
    if (factors[m] >= 1.1 && nextPeak === -1) nextPeak = m;
    if (factors[m] <= 0.9 && nextLow === -1) nextLow = m;
  }
  
  const insights: Record<IndustryType, string> = {
    consulting: currentFactor >= 1.0
      ? "Зараз сезон підвищеного попиту на консалтинг (бюджетування, річні звіти)"
      : "Очікуйте сезонний спад влітку, пік активності — Q4",
    it: "IT-сектор має стабільний попит, незначний спад можливий влітку",
    autorepair: currentFactor >= 1.1
      ? "Сезонний пік: весняний ремонт або осіння заміна шин"
      : "Готуйтесь до сезонного піку навесні та восени",
    dealer: currentMonth >= 10
      ? "Передноворічний пік продажів — очікуйте +20-40% до обороту"
      : "Основний пік продажів — листопад-грудень",
    default: "Рівномірний розподіл доходу протягом року",
  };
  
  return insights[industry];
}

/**
 * Get industry-specific recommendations based on season
 */
export function getSeasonalRecommendations(
  industry: IndustryType, 
  currentMonth: number,
  limitPercentage: number
): string[] {
  const recommendations: string[] = [];
  const factors = getSeasonalFactors(industry);
  const monthIndex = currentMonth - 1;
  
  // High season ahead
  const nextThreeMonthsAvg = factors.slice(monthIndex, monthIndex + 3).reduce((a, b) => a + b, 0) / 3;
  
  if (nextThreeMonthsAvg >= 1.1) {
    recommendations.push("Наближається сезон підвищеного попиту — підготуйте ресурси");
  }
  
  if (nextThreeMonthsAvg <= 0.85) {
    recommendations.push("Очікується сезонний спад — оптимізуйте витрати");
  }
  
  // Limit warnings with seasonal context
  if (limitPercentage >= 80 && nextThreeMonthsAvg >= 1.1) {
    recommendations.push("⚠️ Високий ризик перевищення ліміту в сезон піку");
  }
  
  if (limitPercentage >= 70 && limitPercentage < 85) {
    recommendations.push("Рекомендовано спланувати доходи з урахуванням сезонності");
  }
  
  // Industry-specific
  if (industry === "autorepair" && (currentMonth === 3 || currentMonth === 10)) {
    recommendations.push("Сезон заміни шин — очікуйте підвищене навантаження");
  }
  
  if (industry === "consulting" && currentMonth >= 10) {
    recommendations.push("Сезон річного планування — оптимальний час для нових контрактів");
  }
  
  if (industry === "dealer" && currentMonth === 11) {
    recommendations.push("Чорна п'ятниця та передсвяткові продажі — контролюйте ліміт");
  }
  
  return recommendations.slice(0, 3); // Max 3 recommendations
}
