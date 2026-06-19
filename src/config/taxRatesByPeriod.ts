/**
 * Історія податкових ставок за періодами
 * Дозволяє коректно рендерити звіти за різні роки з відповідними ставками.
 *
 * Юридичні підстави:
 * - ВЗ для виплат працівникам: 1,5% до 31.12.2024; 5% з 01.01.2025 (ЗУ №4015-IX)
 * - ВЗ для ФОП ЄП: 1% з 01.10.2024 (п. 161 підрозд. 10 ПКУ, набрав чинності 01.12.2024)
 * - ПДФО: 18% (ст. 167.1 ПКУ)
 * - ЄСВ роботодавця: 22% (ст. 8 ЗУ «Про ЄСВ»)
 */

export type MilitaryTaxPayerType = "employee" | "fop-ep";

interface RateChange {
  /** ISO дата набрання чинності */
  effectiveFrom: string;
  /** Ставка у долях (0.05 = 5%) */
  rate: number;
  /** Юридична підстава */
  legalBasis: string;
}

const VZ_HISTORY: Record<MilitaryTaxPayerType, RateChange[]> = {
  // Військовий збір з виплат найманим працівникам
  employee: [
    { effectiveFrom: "2014-08-03", rate: 0.015, legalBasis: "п. 161 підрозд. 10 ПКУ (1,5%)" },
    { effectiveFrom: "2025-01-01", rate: 0.05, legalBasis: "ЗУ №4015-IX від 10.10.2024 (5% з 01.01.2025)" },
  ],
  // Військовий збір для ФОП на ЄП
  "fop-ep": [
    { effectiveFrom: "2024-10-01", rate: 0.01, legalBasis: "п. 161.7 підрозд. 10 ПКУ (1% від доходу)" },
  ],
};

/**
 * Отримати ставку ВЗ на конкретний місяць/рік
 */
export function getMilitaryTaxRate(
  year: number,
  month: number,
  payerType: MilitaryTaxPayerType = "employee"
): number {
  const date = new Date(year, month - 1, 15); // середина місяця
  const history = VZ_HISTORY[payerType];

  // Знаходимо останню зміну, що передує даті
  let applicableRate = 0;
  for (const change of history) {
    if (new Date(change.effectiveFrom) <= date) {
      applicableRate = change.rate;
    }
  }
  return applicableRate;
}

/**
 * Форматує ставку як рядок (напр. "5%", "1,5%")
 */
export function formatTaxRate(rate: number): string {
  const percent = rate * 100;
  if (Number.isInteger(percent)) return `${percent}%`;
  return `${percent.toString().replace(".", ",")}%`;
}

/**
 * Отримати ставку ВЗ для звітного періоду (ISO date або year/month)
 */
export function getMilitaryTaxRateForPeriod(
  reportDate: string | Date,
  payerType: MilitaryTaxPayerType = "employee"
): { rate: number; label: string; legalBasis: string } {
  const date = typeof reportDate === "string" ? new Date(reportDate) : reportDate;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const rate = getMilitaryTaxRate(year, month, payerType);
  const history = VZ_HISTORY[payerType];
  const change = [...history].reverse().find(c => new Date(c.effectiveFrom) <= date);
  return {
    rate,
    label: formatTaxRate(rate),
    legalBasis: change?.legalBasis || "",
  };
}

// Стандартні ставки (константи)
export const PDFO_RATE = 0.18; // 18%
export const ESV_EMPLOYER_RATE = 0.22; // 22%
