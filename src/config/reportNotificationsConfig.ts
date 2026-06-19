import { Bot, CheckCircle, Clock, AlertTriangle, Send, FileText, XCircle, type LucideIcon } from "lucide-react";
import type { NotificationType, NotificationPriority } from "@/components/dashboard/NotificationItem";

export type ReportNotificationEventType =
  | "generation_scheduled"    // Заплановано генерацію
  | "generation_started"      // scheduled → processing
  | "ready_for_review"        // processing → review
  | "approved"                // review → approved
  | "submitted"               // approved → submitted
  | "accepted"                // submitted → accepted
  | "rejected"                // submitted → rejected
  | "deadline_approaching"    // T-7, T-3, T-1
  | "generation_failed";      // processing → failed

export interface ReportNotificationTemplate {
  type: NotificationType;
  priority: NotificationPriority;
  titleTemplate: string;
  descriptionTemplate: string;
  icon: LucideIcon;
}

export const reportNotificationTemplates: Record<ReportNotificationEventType, ReportNotificationTemplate> = {
  generation_scheduled: {
    type: "ai",
    priority: "normal",
    titleTemplate: "Заплановано генерацію {reportName}",
    descriptionTemplate: "AI сформує звіт за {period} о {generationTime}",
    icon: Clock,
  },
  generation_started: {
    type: "ai",
    priority: "normal",
    titleTemplate: "AI формує {reportName}",
    descriptionTemplate: "Розпочато автоматичну генерацію звіту за {period}",
    icon: Bot,
  },
  ready_for_review: {
    type: "ai",
    priority: "high",
    titleTemplate: "{reportName} готовий до перевірки",
    descriptionTemplate: "Звіт за {period} сформовано. Перевірте та підтвердьте",
    icon: FileText,
  },
  approved: {
    type: "success",
    priority: "normal",
    titleTemplate: "{reportName} підтверджено",
    descriptionTemplate: "Звіт за {period} готовий до подання",
    icon: CheckCircle,
  },
  submitted: {
    type: "success",
    priority: "normal",
    titleTemplate: "{reportName} подано",
    descriptionTemplate: "Звіт за {period} успішно відправлено до ДПС",
    icon: Send,
  },
  accepted: {
    type: "success",
    priority: "normal",
    titleTemplate: "{reportName} прийнято",
    descriptionTemplate: "Звіт за {period} прийнято ДПС",
    icon: CheckCircle,
  },
  rejected: {
    type: "alert",
    priority: "urgent",
    titleTemplate: "{reportName} відхилено",
    descriptionTemplate: "Звіт за {period} відхилено ДПС. Перевірте помилки",
    icon: XCircle,
  },
  deadline_approaching: {
    type: "deadline",
    priority: "normal", // Will be overridden based on days
    titleTemplate: "До дедлайну {reportName} залишилось {days} днів",
    descriptionTemplate: "Звіт за {period} потрібно подати до {deadline}",
    icon: Clock,
  },
  generation_failed: {
    type: "alert",
    priority: "urgent",
    titleTemplate: "Помилка генерації {reportName}",
    descriptionTemplate: "Не вдалося сформувати звіт за {period}. Перевірте дані",
    icon: AlertTriangle,
  },
};

// Get priority for deadline based on days remaining
export const getDeadlinePriority = (daysRemaining: number): NotificationPriority => {
  if (daysRemaining <= 1) return "urgent";
  if (daysRemaining <= 3) return "high";
  return "normal";
};

// Report type labels
export const reportTypeLabels: Record<string, string> = {
  ep_declaration: "Декларація ЄП",
  esv_report: "Звіт ЄСВ",
  "1df_report": "Податковий розрахунок (4ДФ)",
  vat_declaration: "Декларація ПДВ",
  income_statement: "Звіт про доходи",
};

// Period labels
export const periodLabels: Record<string, string> = {
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  Q4: "Q4",
  january: "січень",
  february: "лютий",
  march: "березень",
  april: "квітень",
  may: "травень",
  june: "червень",
  july: "липень",
  august: "серпень",
  september: "вересень",
  october: "жовтень",
  november: "листопад",
  december: "грудень",
  year: "рік",
};
