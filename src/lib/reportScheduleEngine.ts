/**
 * Report Schedule Engine
 * Генерує річний графік звітності на основі групи ФОП
 * Відповідно до ПКУ та законодавства України 2025
 */

import type { ReportType, ReportPeriod, FopGroup } from "@/config/reportsConfig";
import { getMilitaryTaxRate } from "@/config/taxRatesByPeriod";

// Елемент графіку звітності
export interface ReportScheduleItem {
  type: ReportType;
  period: ReportPeriod;
  periodLabel: string;
  deadline: string;          // ISO date
  submissionWindowDays: number; // Кількість днів для подання
  paymentDeadline: string;   // Термін сплати
  paymentDeadlineLabel: string;
  isSubmitted?: boolean;
  isAccepted?: boolean;
}

// Квартальні дедлайни для 3 групи (40 днів після кварталу)
const QUARTERLY_DEADLINES_GROUP_3: Record<number, { deadline: string; paymentDeadline: string }> = {
  1: { deadline: "-05-10", paymentDeadline: "-05-19" }, // Q1: 10 травня, сплата до 19 травня
  2: { deadline: "-08-09", paymentDeadline: "-08-19" }, // Q2: 9 серпня, сплата до 19 серпня
  3: { deadline: "-11-09", paymentDeadline: "-11-19" }, // Q3: 9 листопада, сплата до 19 листопада
  4: { deadline: "-02-09", paymentDeadline: "-02-19" }, // Q4: 9 лютого наступного року
};

// Річні дедлайни для 1-2 групи (60 днів після року)
const YEARLY_DEADLINE_GROUP_12 = {
  deadline: "-03-01", // 1 березня
  paymentDeadline: "-03-01", // до 1 березня
};

// Квартальні назви
const QUARTER_LABELS: Record<number, string> = {
  1: "I квартал",
  2: "II квартал",
  3: "III квартал",
  4: "IV квартал",
};

/**
 * Генерує річний графік звітності для ФОП
 */
export function generateAnnualSchedule(
  fopGroup: FopGroup,
  year: number,
  hasLand: boolean = false,
  hasEmployees: boolean = false
): ReportScheduleItem[] {
  const schedule: ReportScheduleItem[] = [];

  if (fopGroup === 3) {
    // 3 група — квартальна звітність
    for (let quarter = 1; quarter <= 4; quarter++) {
      const deadlineConfig = QUARTERLY_DEADLINES_GROUP_3[quarter];
      const deadlineYear = quarter === 4 ? year + 1 : year;

      // ЄП
      schedule.push({
        type: "ep",
        period: `Q${quarter}` as ReportPeriod,
        periodLabel: `${QUARTER_LABELS[quarter]} ${year}`,
        deadline: `${deadlineYear}${deadlineConfig.deadline}`,
        submissionWindowDays: 40,
        paymentDeadline: `${deadlineYear}${deadlineConfig.paymentDeadline}`,
        paymentDeadlineLabel: "10 днів після подання",
      });

      // ВЗ ФОП ЄП — за дату закінчення кварталу перевіряємо ставку з єдиного джерела правди
      const quarterEndMonth = quarter * 3;
      if (getMilitaryTaxRate(year, quarterEndMonth, "fop-ep") > 0) {
        schedule.push({
          type: "vz",
          period: `Q${quarter}` as ReportPeriod,
          periodLabel: `${QUARTER_LABELS[quarter]} ${year}`,
          deadline: `${deadlineYear}${deadlineConfig.deadline}`,
          submissionWindowDays: 40,
          paymentDeadline: `${deadlineYear}${deadlineConfig.paymentDeadline}`,
          paymentDeadlineLabel: "Разом з ЄП",
        });
      }

      // ЄСВ (подається разом з ЄП)
      schedule.push({
        type: "esv",
        period: `Q${quarter}` as ReportPeriod,
        periodLabel: `${QUARTER_LABELS[quarter]} ${year}`,
        deadline: `${deadlineYear}${deadlineConfig.deadline}`,
        submissionWindowDays: 40,
        paymentDeadline: `${deadlineYear}${deadlineConfig.paymentDeadline}`,
        paymentDeadlineLabel: "До 20 числа кожного місяця",
      });
    }
  } else {
    // 1-2 група — річна звітність
    const deadlineYear = year + 1;

    // ЄП
    schedule.push({
      type: "ep",
      period: "year",
      periodLabel: `${year} рік`,
      deadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.deadline}`,
      submissionWindowDays: 60,
      paymentDeadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.paymentDeadline}`,
      paymentDeadlineLabel: "Авансом щомісяця",
    });

    // ВЗ ФОП ЄП (1-2 група) — за грудень року перевіряємо чи діє ставка
    if (getMilitaryTaxRate(year, 12, "fop-ep") > 0) {
      schedule.push({
        type: "vz",
        period: "year",
        periodLabel: `${year} рік`,
        deadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.deadline}`,
        submissionWindowDays: 60,
        paymentDeadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.paymentDeadline}`,
        paymentDeadlineLabel: "Щомісяця разом з ЄП",
      });
    }

    // ЄСВ
    schedule.push({
      type: "esv",
      period: "year",
      periodLabel: `${year} рік`,
      deadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.deadline}`,
      submissionWindowDays: 60,
      paymentDeadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.paymentDeadline}`,
      paymentDeadlineLabel: "До 20 числа кожного місяця",
    });

    // МПЗ (якщо є земля)
    if (hasLand) {
      schedule.push({
        type: "mpz",
        period: "year",
        periodLabel: `${year} рік`,
        deadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.deadline}`,
        submissionWindowDays: 60,
        paymentDeadline: `${deadlineYear}${YEARLY_DEADLINE_GROUP_12.paymentDeadline}`,
        paymentDeadlineLabel: "Разом з декларацією ЄП",
      });
    }
  }

  // Податковий розрахунок (4ДФ): ПДФО + ВЗ + ЄСВ для роботодавців — щомісячна звітність
  if (hasEmployees) {
    for (let month = 1; month <= 12; month++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextMonthYear = month === 12 ? year + 1 : year;
      const nextMonthStr = nextMonth.toString().padStart(2, "0");

      // 4ДФ замість окремих ПДФО, ВЗ-ЗП, ЄСВ-ЗП
      schedule.push({
        type: "1df",
        period: "month",
        periodLabel: `${getMonthName(month)} ${year}`,
        deadline: `${nextMonthYear}-${nextMonthStr}-20`,
        submissionWindowDays: 20,
        paymentDeadline: `${nextMonthYear}-${nextMonthStr}-20`,
        paymentDeadlineLabel: "До 20 числа наступного місяця",
      });
    }
  }

  // Сортувати за дедлайном
  return schedule.sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
}

/**
 * Отримує найближчі дедлайни з графіку
 */
export function getUpcomingScheduleItems(
  schedule: ReportScheduleItem[],
  days: number = 30
): ReportScheduleItem[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return schedule.filter(item => {
    const deadline = new Date(item.deadline);
    return deadline >= now && deadline <= futureDate && !item.isAccepted;
  });
}

/**
 * Перевіряє чи дедлайн прострочений
 */
export function isDeadlineOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date();
}

/**
 * Розраховує кількість днів до дедлайну
 */
export function getDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Отримує назву місяця українською
 */
function getMonthName(month: number): string {
  const months = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];
  return months[month - 1];
}

/**
 * Отримує поточний квартал
 */
export function getCurrentQuarter(): number {
  return Math.ceil((new Date().getMonth() + 1) / 3);
}

/**
 * Визначає період подання для поточної дати
 */
export function getCurrentReportingPeriod(fopGroup: FopGroup): { period: ReportPeriod; year: number } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (fopGroup === 3) {
    // 3 група — квартальна
    const currentQuarter = Math.ceil(currentMonth / 3);
    // Визначаємо за який квартал потрібно подавати
    // Якщо ми в періоді подання (до 40 днів після кварталу), то за попередній
    const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
    const prevQuarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;

    return {
      period: `Q${prevQuarter}` as ReportPeriod,
      year: prevQuarterYear,
    };
  } else {
    // 1-2 група — річна
    // Якщо до 1 березня — подаємо за минулий рік
    if (currentMonth <= 2) {
      return { period: "year", year: currentYear - 1 };
    }
    return { period: "year", year: currentYear };
  }
}
