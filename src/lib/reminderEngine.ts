/**
 * Reminder Engine
 * Generates deadline reminders based on cabinet data, documents, and reports
 */

import type { Cabinet } from "@/types/cabinet";
import { FOP_INCOME_LIMITS } from "@/config/taxConstantsConfig";
import { differenceInDays, parseISO, format, addDays, startOfMonth, setDate } from "date-fns";
import { uk } from "date-fns/locale";

export type ReminderType = "tax" | "rent" | "salary" | "report" | "contract" | "limit" | "document";
export type ReminderSeverity = "critical" | "warning" | "info";

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  dueDate: string;
  daysUntil: number;
  severity: ReminderSeverity;
  actionLabel: string;
  actionPath?: string;
  icon?: string;
  amount?: number;
}

interface ReminderSource {
  documents?: Array<{
    id: string;
    title: string;
    dueDate?: string;
    type: string;
    status?: string;
  }>;
  reports?: Array<{
    id: string;
    name: string;
    deadline?: string;
    status?: string;
  }>;
  contractors?: Array<{
    id: string;
    name: string;
    contractEndDate?: string;
  }>;
}

// Fixed payment dates by type
const FIXED_PAYMENT_DATES: Record<string, { day: number; label: string; type: ReminderType }> = {
  rent: { day: 5, label: "Оплата оренди", type: "rent" },
  salary: { day: 7, label: "Виплата зарплати", type: "salary" },
  ep: { day: 20, label: "Сплата єдиного податку", type: "tax" },
  esv: { day: 20, label: "Сплата ЄСВ", type: "tax" },
  vz: { day: 20, label: "Сплата військового збору", type: "tax" },
};

// Tax deadline for quarterly report
const QUARTERLY_TAX_DEADLINE_DAY = 20;

/**
 * Calculate severity based on days until deadline
 */
function getSeverity(daysUntil: number): ReminderSeverity {
  if (daysUntil < 0) return "critical"; // Overdue
  if (daysUntil <= 3) return "critical";
  if (daysUntil <= 7) return "warning";
  return "info";
}

/**
 * Generate fixed monthly reminders (rent, salary, taxes)
 */
function generateFixedReminders(cabinet: Cabinet, today: Date): Reminder[] {
  const reminders: Reminder[] = [];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Only for FOP cabinets with employees or rent
  if (cabinet.type !== "fop") return reminders;

  // Rent reminder (always for active cabinets)
  if (cabinet.accessMode !== "passive") {
    const rentDueDate = setDate(new Date(currentYear, currentMonth, 1), FIXED_PAYMENT_DATES.rent.day);
    if (rentDueDate < today) {
      // Move to next month if already passed
      rentDueDate.setMonth(rentDueDate.getMonth() + 1);
    }
    const daysUntil = differenceInDays(rentDueDate, today);
    
    if (daysUntil <= 14) {
      reminders.push({
        id: `rent-${format(rentDueDate, "yyyy-MM")}`,
        type: "rent",
        title: FIXED_PAYMENT_DATES.rent.label,
        description: `Крайній термін: ${format(rentDueDate, "d MMMM", { locale: uk })}`,
        dueDate: format(rentDueDate, "yyyy-MM-dd"),
        daysUntil,
        severity: getSeverity(daysUntil),
        actionLabel: "Оплатити",
        actionPath: "payments",
      });
    }
  }

  // Salary reminder (only if has employees)
  if (cabinet.hasEmployees) {
    const salaryDueDate = setDate(new Date(currentYear, currentMonth, 1), FIXED_PAYMENT_DATES.salary.day);
    if (salaryDueDate < today) {
      salaryDueDate.setMonth(salaryDueDate.getMonth() + 1);
    }
    const daysUntil = differenceInDays(salaryDueDate, today);
    
    if (daysUntil <= 14) {
      reminders.push({
        id: `salary-${format(salaryDueDate, "yyyy-MM")}`,
        type: "salary",
        title: FIXED_PAYMENT_DATES.salary.label,
        description: `Крайній термін: ${format(salaryDueDate, "d MMMM", { locale: uk })}`,
        dueDate: format(salaryDueDate, "yyyy-MM-dd"),
        daysUntil,
        severity: getSeverity(daysUntil),
        actionLabel: "До платежів",
        actionPath: "payments",
      });
    }
  }

  // Tax reminders (EP + ESV/VZ)
  const taxDueDate = setDate(new Date(currentYear, currentMonth, 1), FIXED_PAYMENT_DATES.ep.day);
  if (taxDueDate < today) {
    taxDueDate.setMonth(taxDueDate.getMonth() + 1);
  }
  const taxDaysUntil = differenceInDays(taxDueDate, today);
  
  if (taxDaysUntil <= 14) {
    reminders.push({
      id: `ep-${format(taxDueDate, "yyyy-MM")}`,
      type: "tax",
      title: "Сплата ЄП + ВЗ",
      description: `До ${format(taxDueDate, "d MMMM", { locale: uk })} (${cabinet.fopGroup} група)`,
      dueDate: format(taxDueDate, "yyyy-MM-dd"),
      daysUntil: taxDaysUntil,
      severity: getSeverity(taxDaysUntil),
      actionLabel: "Сплатити",
      actionPath: "payments",
      amount: cabinet.fopGroup === 2 ? 1600 : undefined,
    });

    if (cabinet.hasEmployees) {
      reminders.push({
        id: `esv-${format(taxDueDate, "yyyy-MM")}`,
        type: "tax",
        title: "Сплата ЄСВ за працівників",
        description: `До ${format(taxDueDate, "d MMMM", { locale: uk })}`,
        dueDate: format(taxDueDate, "yyyy-MM-dd"),
        daysUntil: taxDaysUntil,
        severity: getSeverity(taxDaysUntil),
        actionLabel: "Сплатити",
        actionPath: "payments",
      });
    }
  }

  return reminders;
}

/**
 * Generate limit warning reminder for FOP
 */
function generateLimitReminder(cabinet: Cabinet): Reminder | null {
  if (cabinet.type !== "fop" || !cabinet.fopGroup) return null;

  const limit = FOP_INCOME_LIMITS[cabinet.fopGroup as 1 | 2 | 3] || FOP_INCOME_LIMITS[3];
  const yearlyIncome = cabinet.yearlyIncome || 0;
  const percentage = (yearlyIncome / limit) * 100;

  if (percentage >= 85) {
    const remaining = limit - yearlyIncome;
    return {
      id: `limit-${cabinet.id}`,
      type: "limit",
      title: percentage >= 95 ? "🚨 Ліміт критичний!" : "⚠️ Наближення до ліміту",
      description: `Використано ${percentage.toFixed(1)}%, залишилось ${(remaining / 1000).toFixed(0)}K ₴`,
      dueDate: "",
      daysUntil: 0,
      severity: percentage >= 95 ? "critical" : "warning",
      actionLabel: "Аналіз",
      actionPath: "analytics",
      amount: remaining,
    };
  }

  return null;
}

/**
 * Generate reminders from cabinet's nextDeadline.
 * If `leadDays` provided, the reminder is shown only when daysUntil ∈ leadDays
 * (or overdue). Otherwise, falls back to "show within 30 days" behavior.
 */
function generateCabinetDeadlineReminder(
  cabinet: Cabinet,
  today: Date,
  leadDays?: number[]
): Reminder | null {
  if (!cabinet.nextDeadline) return null;

  const deadline = parseISO(cabinet.nextDeadline);
  const daysUntil = differenceInDays(deadline, today);

  if (leadDays && leadDays.length > 0) {
    // Show only on user-configured lead days, or when overdue
    const maxLead = Math.max(...leadDays);
    if (daysUntil > maxLead) return null;
    if (daysUntil >= 0 && !leadDays.includes(daysUntil)) return null;
  } else if (daysUntil > 30) {
    return null;
  }

  return {
    id: `cabinet-deadline-${cabinet.id}`,
    type: "report",
    title: cabinet.deadlineLabel || "Найближчий дедлайн",
    description: `${format(deadline, "d MMMM yyyy", { locale: uk })}`,
    dueDate: cabinet.nextDeadline,
    daysUntil,
    severity: getSeverity(daysUntil),
    actionLabel: "Деталі",
    actionPath: "reports",
  };
}

/**
 * Main function to generate all reminders for a cabinet.
 * `leadDays` — optional user-configured lead times (days before deadline) for deadline-type reminders.
 */
export function generateReminders(
  cabinet: Cabinet,
  sources?: ReminderSource,
  leadDays?: number[]
): Reminder[] {
  const today = new Date();
  const reminders: Reminder[] = [];

  // Fixed monthly reminders
  reminders.push(...generateFixedReminders(cabinet, today));

  // Limit warning
  const limitReminder = generateLimitReminder(cabinet);
  if (limitReminder) {
    reminders.push(limitReminder);
  }

  // Cabinet deadline (respects user-configured lead days if provided)
  const deadlineReminder = generateCabinetDeadlineReminder(cabinet, today, leadDays);
  if (deadlineReminder) {
    reminders.push(deadlineReminder);
  }

  // Sort by severity (critical first) then by days until
  const severityOrder: Record<ReminderSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  reminders.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.daysUntil - b.daysUntil;
  });

  return reminders;
}

/**
 * Get urgency label for reminder
 */
export function getUrgencyLabel(daysUntil: number): string {
  if (daysUntil < 0) return `Прострочено на ${Math.abs(daysUntil)} дн.`;
  if (daysUntil === 0) return "Сьогодні!";
  if (daysUntil === 1) return "Завтра";
  if (daysUntil <= 3) return `Через ${daysUntil} дні`;
  if (daysUntil <= 7) return `Через ${daysUntil} днів`;
  return `Через ${daysUntil} днів`;
}

/**
 * Get icon name for reminder type
 */
export function getReminderIcon(type: ReminderType): string {
  const icons: Record<ReminderType, string> = {
    tax: "Receipt",
    rent: "Building2",
    salary: "Users",
    report: "FileText",
    contract: "FileSignature",
    limit: "AlertTriangle",
    document: "File",
  };
  return icons[type] || "Bell";
}
