import { format, isToday, isYesterday, differenceInDays, parseISO, startOfDay } from "date-fns";
import { uk } from "date-fns/locale";

export interface DateGroupSummary {
  count: number;
  totalAmount: number;
  incomeCount: number;
  returnCount: number;
  issuesCount: number;
  netAmount: number; // totalAmount - returns
  inIncomeBook: number;
  // Payment type aggregates
  cashAmount: number;
  bankAmount: number;
  cardAmount: number;
  prroAmount: number;
}

export interface DateGroup<T> {
  date: string;           // "2025-12-13"
  label: string;          // "13 грудня 2025"
  relativeLabel: string;  // "Сьогодні" | "Вчора" | "Понеділок" | "13 грудня"
  dayOfWeek: string;      // "пʼятниця"
  items: T[];
  summary: DateGroupSummary;
}

/**
 * Get relative date label for Ukrainian locale
 */
export function getRelativeLabel(date: Date): string {
  if (isToday(date)) {
    return "Сьогодні";
  }
  if (isYesterday(date)) {
    return "Вчора";
  }
  
  const daysDiff = differenceInDays(new Date(), date);
  
  // Within this week (2-6 days ago) - show day name
  if (daysDiff >= 2 && daysDiff <= 6) {
    return format(date, "EEEE", { locale: uk }); // "понеділок", "вівторок", etc.
  }
  
  // Beyond a week - show date without year if current year
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  
  if (currentYear === dateYear) {
    return format(date, "d MMMM", { locale: uk }); // "13 грудня"
  }
  
  return format(date, "d MMMM yyyy", { locale: uk }); // "13 грудня 2024"
}

/**
 * Get day of week in Ukrainian
 */
function getDayOfWeek(date: Date): string {
  return format(date, "EEEE", { locale: uk });
}

/**
 * Get full date label
 */
function getFullDateLabel(date: Date): string {
  return format(date, "d MMMM yyyy", { locale: uk });
}

interface GroupByDateOptions<T> {
  getDate: (item: T) => string;
  getAmount?: (item: T) => number;
  getStatus?: (item: T) => string;
  getInIncomeBook?: (item: T) => number;
  getPaymentType?: (item: T) => string;
}

/**
 * Group items by date with summaries
 * @param items - Array of items to group
 * @param options - Configuration for extracting date and computing summary
 * @returns Array of DateGroup sorted by date descending (newest first)
 */
export function groupByDate<T>(
  items: T[],
  options: GroupByDateOptions<T>
): DateGroup<T>[] {
  const { getDate, getAmount, getStatus, getInIncomeBook, getPaymentType } = options;
  
  // Group items by date
  const groups: Record<string, T[]> = {};
  
  items.forEach((item) => {
    const dateStr = getDate(item).split("T")[0]; // Ensure just date part
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(item);
  });
  
  // Convert to DateGroup array with summaries
  const result: DateGroup<T>[] = Object.entries(groups).map(([dateStr, groupItems]) => {
    const date = parseISO(dateStr);
    
    // Calculate summary
    const summary: DateGroupSummary = {
      count: groupItems.length,
      totalAmount: 0,
      incomeCount: 0,
      returnCount: 0,
      issuesCount: 0,
      netAmount: 0,
      inIncomeBook: 0,
      cashAmount: 0,
      bankAmount: 0,
      cardAmount: 0,
      prroAmount: 0,
    };
    
    if (getAmount || getStatus || getInIncomeBook || getPaymentType) {
      groupItems.forEach((item) => {
        const amount = getAmount?.(item) ?? 0;
        const status = getStatus?.(item) ?? "";
        const inBook = getInIncomeBook?.(item) ?? 0;
        const paymentType = getPaymentType?.(item) ?? "";
        
        summary.totalAmount += amount;
        summary.inIncomeBook += inBook;
        
        // Aggregate by payment type
        if (paymentType === "cash") {
          summary.cashAmount += amount;
        } else if (paymentType === "bank") {
          summary.bankAmount += amount;
        } else if (paymentType === "card") {
          summary.cardAmount += amount;
        } else if (paymentType === "prro") {
          summary.prroAmount += amount;
        }
        
        if (status === "income") {
          summary.incomeCount++;
          summary.netAmount += amount;
        } else if (status === "return") {
          summary.returnCount++;
          summary.netAmount -= amount;
        } else if (status === "needs-clarification") {
          summary.issuesCount++;
          summary.netAmount += amount;
        } else {
          summary.netAmount += amount;
        }
      });
    }
    
    return {
      date: dateStr,
      label: getFullDateLabel(date),
      relativeLabel: getRelativeLabel(date),
      dayOfWeek: getDayOfWeek(date),
      items: groupItems,
      summary,
    };
  });
  
  // Sort by date descending (newest first)
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Check if date string is within N days from today
 */
export function isWithinDays(dateStr: string, days: number): boolean {
  const date = parseISO(dateStr);
  const daysDiff = differenceInDays(new Date(), startOfDay(date));
  return daysDiff >= 0 && daysDiff <= days;
}
