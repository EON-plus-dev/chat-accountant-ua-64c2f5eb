import { subDays, differenceInDays, format, isAfter, isBefore } from "date-fns";
import { uk } from "date-fns/locale";
import type { ReportType, ReportPeriod } from "@/config/reportsConfig";
import type { ReportAutomationSettings } from "@/config/settingsConfig";

/**
 * Autonomous Report Generation Scheduler
 * 
 * Implements Event-Driven Report Lifecycle based on world best practices:
 * - Pilot.com: AI готує все автоматично
 * - Bench.co: Система формує звіти за графіком
 * - Xero: Smart Reports з auto-scheduling
 */

export interface ScheduledGeneration {
  id: string;
  reportType: ReportType;
  period: ReportPeriod;
  year: number;
  deadline: string;
  generationDate: string;    // T-10 днів до дедлайну
  notificationDate: string;  // T-7 днів до дедлайну
  status: "pending" | "in_progress" | "completed" | "failed";
  estimatedDuration?: number; // хвилини
}

export interface GenerationQueue {
  nextGeneration: ScheduledGeneration | null;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  failedCount: number;
}

// Конфігурація автоматичної генерації за замовчуванням
const DEFAULT_GENERATION_CONFIG = {
  DAYS_BEFORE_DEADLINE: 10,
  NOTIFICATION_DAYS_BEFORE: 7,
  MIN_PROCESSING_TIME: 2,
  MAX_PROCESSING_TIME: 15,
} as const;

/**
 * Отримує конфігурацію генерації на основі налаштувань користувача
 */
export function getGenerationConfig(settings?: ReportAutomationSettings) {
  if (!settings) return DEFAULT_GENERATION_CONFIG;

  return {
    DAYS_BEFORE_DEADLINE: settings.generationDaysBefore,
    NOTIFICATION_DAYS_BEFORE: settings.notificationDaysBefore,
    MIN_PROCESSING_TIME: DEFAULT_GENERATION_CONFIG.MIN_PROCESSING_TIME,
    MAX_PROCESSING_TIME: DEFAULT_GENERATION_CONFIG.MAX_PROCESSING_TIME,
  };
}

// Статична конфігурація для зворотної сумісності
export const GENERATION_CONFIG = DEFAULT_GENERATION_CONFIG;

/**
 * Розраховує дату автоматичної генерації звіту
 * За замовчуванням: T-10 днів до дедлайну (або згідно налаштувань)
 */
export function calculateGenerationDate(
  deadline: string, 
  settings?: ReportAutomationSettings
): string {
  const config = getGenerationConfig(settings);
  const deadlineDate = new Date(deadline);
  return subDays(deadlineDate, config.DAYS_BEFORE_DEADLINE).toISOString();
}

/**
 * Розраховує дату нотифікації користувача
 * За замовчуванням: T-7 днів до дедлайну (або згідно налаштувань)
 */
export function calculateNotificationDate(
  deadline: string,
  settings?: ReportAutomationSettings
): string {
  const config = getGenerationConfig(settings);
  const deadlineDate = new Date(deadline);
  return subDays(deadlineDate, config.NOTIFICATION_DAYS_BEFORE).toISOString();
}

/**
 * Перевіряє чи настав час генерації звіту
 */
export function shouldGenerateReport(scheduled: ScheduledGeneration): boolean {
  const generationDate = new Date(scheduled.generationDate);
  const now = new Date();
  return isAfter(now, generationDate) && scheduled.status === "pending";
}

/**
 * Перевіряє чи звіт прострочений для генерації
 */
export function isOverdueForGeneration(scheduled: ScheduledGeneration): boolean {
  const deadline = new Date(scheduled.deadline);
  const now = new Date();
  return isAfter(now, deadline) && scheduled.status === "pending";
}

/**
 * Розраховує дні до генерації звіту
 */
export function getDaysUntilGeneration(scheduled: ScheduledGeneration): number {
  const generationDate = new Date(scheduled.generationDate);
  const now = new Date();
  return differenceInDays(generationDate, now);
}

/**
 * Розраховує дні до дедлайну
 */
export function getDaysUntilDeadline(deadline: string): number {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  return differenceInDays(deadlineDate, now);
}

/**
 * Форматує дату генерації для відображення
 */
export function formatGenerationDate(date: string): string {
  return format(new Date(date), "d MMMM yyyy", { locale: uk });
}

/**
 * Генерує унікальний ID для запланованої генерації
 */
export function generateScheduleId(
  reportType: ReportType,
  period: ReportPeriod,
  year: number
): string {
  return `${reportType}-${period}-${year}`;
}

/**
 * Отримує наступну заплановану генерацію
 */
export function getNextScheduledGeneration(
  schedule: ScheduledGeneration[]
): ScheduledGeneration | null {
  const pending = schedule
    .filter((s) => s.status === "pending")
    .sort((a, b) => new Date(a.generationDate).getTime() - new Date(b.generationDate).getTime());
  
  return pending[0] || null;
}

/**
 * Отримує звіти, які мають бути згенеровані зараз
 */
export function getReportsToGenerate(schedule: ScheduledGeneration[]): ScheduledGeneration[] {
  return schedule.filter(shouldGenerateReport);
}

/**
 * Отримує статистику черги генерації
 */
export function getGenerationQueueStats(schedule: ScheduledGeneration[]): GenerationQueue {
  const pending = schedule.filter((s) => s.status === "pending");
  const inProgress = schedule.filter((s) => s.status === "in_progress");
  const completed = schedule.filter((s) => s.status === "completed");
  const failed = schedule.filter((s) => s.status === "failed");

  return {
    nextGeneration: getNextScheduledGeneration(schedule),
    pendingCount: pending.length,
    inProgressCount: inProgress.length,
    completedCount: completed.length,
    failedCount: failed.length,
  };
}

/**
 * Оцінює час обробки звіту на основі типу та складності
 */
export function estimateProcessingTime(reportType: ReportType): number {
  const complexityMap: Partial<Record<ReportType, number>> = {
    ep: 5,         // Єдиний податок - середня складність
    esv: 8,        // ЄСВ - вища складність
    "esv-emp": 10, // ЄСВ за працівників - висока складність
    vz: 3,         // Військовий збір - низька складність
    "vz-emp": 4,   // Військовий збір за працівників
    "1df": 12,     // 4ДФ (Податковий розрахунок) - висока складність (багато працівників)
    pdfo: 6,       // ПДФО - середня складність
    mpz: 4,        // МПЗ - низька складність
    stat: 5,       // Статистичний звіт
    other: 5,      // Інші - середня складність
  };

  return complexityMap[reportType] || GENERATION_CONFIG.MIN_PROCESSING_TIME;
}

/**
 * Форматує відносний час до генерації
 */
export function formatTimeUntilGeneration(scheduled: ScheduledGeneration): string {
  const days = getDaysUntilGeneration(scheduled);
  
  if (days < 0) {
    return "Готово до генерації";
  } else if (days === 0) {
    return "Сьогодні";
  } else if (days === 1) {
    return "Завтра";
  } else if (days < 7) {
    return `Через ${days} ${getDayWord(days)}`;
  } else {
    return formatGenerationDate(scheduled.generationDate);
  }
}

/**
 * Допоміжна функція для відмінювання слова "день"
 */
function getDayWord(days: number): string {
  if (days === 1) return "день";
  if (days >= 2 && days <= 4) return "дні";
  return "днів";
}

/**
 * Отримує лейбл типу звіту
 */
export function getReportTypeLabel(reportType: ReportType): string {
  const labels: Partial<Record<ReportType, string>> = {
    ep: "Єдиний податок",
    esv: "ЄСВ",
    "esv-emp": "ЄСВ (працівники)",
    vz: "Військовий збір",
    "vz-emp": "ВЗ (працівники)",
    "1df": "Податковий розрахунок (4ДФ)",
    pdfo: "ПДФО",
    mpz: "МПЗ",
    stat: "Статистичний",
    other: "Інший",
  };
  return labels[reportType] || reportType;
}

/**
 * Отримує короткий лейбл типу звіту
 */
export function getReportTypeShortLabel(reportType: ReportType): string {
  const labels: Partial<Record<ReportType, string>> = {
    ep: "ЄП",
    esv: "ЄСВ",
    "esv-emp": "ЄСВ-П",
    vz: "ВЗ",
    "vz-emp": "ВЗ-П",
    "1df": "4ДФ",
    pdfo: "ПДФО",
    mpz: "МПЗ",
    stat: "Стат",
    other: "Інше",
  };
  return labels[reportType] || reportType;
}
