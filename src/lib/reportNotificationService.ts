import { format, subDays } from "date-fns";
import { uk } from "date-fns/locale";
import {
  reportNotificationTemplates,
  getDeadlinePriority,
  reportTypeLabels,
  periodLabels,
  type ReportNotificationEventType,
} from "@/config/reportNotificationsConfig";
import type { NotificationType, NotificationPriority } from "@/components/dashboard/NotificationItem";

export interface ReportNotificationEvent {
  eventType: ReportNotificationEventType;
  reportType: string;
  reportPeriod: string;
  reportYear: number;
  cabinetId: string;
  cabinetName: string;
  deadline?: string;
  daysUntilDeadline?: number;
  generationTime?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  type: NotificationType;
  isRead: boolean;
  cabinetId: string;
  cabinetName: string;
  priority: NotificationPriority;
  /** Deep-link path (e.g. /dashboard?tab=event-journal&cabinet=1&eventId=<uuid>). Set for DB-backed notifications. */
  actionPath?: string;
  /** UUID of the related user_event in DB, when applicable. */
  relatedEventId?: string;
}

// Helper to replace template placeholders
const replaceTemplatePlaceholders = (
  template: string,
  event: ReportNotificationEvent
): string => {
  const reportName = reportTypeLabels[event.reportType] || event.reportType;
  const period = `${periodLabels[event.reportPeriod] || event.reportPeriod} ${event.reportYear}`;

  return template
    .replace("{reportName}", reportName)
    .replace("{period}", period)
    .replace("{days}", String(event.daysUntilDeadline || 0))
    .replace("{deadline}", event.deadline || "")
    .replace("{generationTime}", event.generationTime || "");
};

// Generate a single notification from an event
export const generateReportNotification = (
  event: ReportNotificationEvent,
  notificationDate: Date = new Date()
): Notification => {
  const template = reportNotificationTemplates[event.eventType];

  // Adjust priority for deadline notifications
  let priority = template.priority;
  if (event.eventType === "deadline_approaching" && event.daysUntilDeadline !== undefined) {
    priority = getDeadlinePriority(event.daysUntilDeadline);
  }

  const title = replaceTemplatePlaceholders(template.titleTemplate, event);
  const description = replaceTemplatePlaceholders(template.descriptionTemplate, event);

  return {
    id: `report-${event.eventType}-${event.reportType}-${event.reportPeriod}-${Date.now()}`,
    title,
    description,
    time: formatRelativeTime(notificationDate),
    date: format(notificationDate, "yyyy-MM-dd"),
    type: template.type,
    isRead: false,
    cabinetId: event.cabinetId,
    cabinetName: event.cabinetName,
    priority,
  };
};

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Щойно";
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays === 1) return "Вчора";
  if (diffDays < 7) return `${diffDays} дні тому`;
  return format(date, "d MMM", { locale: uk });
};

// Generate demo notifications for a cabinet
export const generateDemoReportLifecycleNotifications = (
  cabinetId: string,
  cabinetName: string,
  cabinetType: string
): Notification[] => {
  const now = new Date();
  const notifications: Notification[] = [];

  // Different notifications based on cabinet type
  if (cabinetType === "fop" || cabinetType === "fop-group") {
    // ЄП Q4 ready for review
    notifications.push(
      generateReportNotification(
        {
          eventType: "ready_for_review",
          reportType: "ep_declaration",
          reportPeriod: "Q4",
          reportYear: 2024,
          cabinetId,
          cabinetName,
        },
        subDays(now, 0) // 2 hours ago
      )
    );

    // ЄСВ deadline approaching (3 days)
    notifications.push(
      generateReportNotification(
        {
          eventType: "deadline_approaching",
          reportType: "esv_report",
          reportPeriod: "Q4",
          reportYear: 2024,
          cabinetId,
          cabinetName,
          deadline: "19 січня 2025",
          daysUntilDeadline: 3,
        },
        subDays(now, 0)
      )
    );

    // Generation started
    notifications.push(
      generateReportNotification(
        {
          eventType: "generation_started",
          reportType: "ep_declaration",
          reportPeriod: "Q4",
          reportYear: 2024,
          cabinetId,
          cabinetName,
        },
        subDays(now, 1)
      )
    );

    // Approved yesterday
    notifications.push(
      generateReportNotification(
        {
          eventType: "approved",
          reportType: "esv_report",
          reportPeriod: "Q3",
          reportYear: 2024,
          cabinetId,
          cabinetName,
        },
        subDays(now, 2)
      )
    );
  }

  if (cabinetType === "tov") {
    // 1DF ready for review
    notifications.push(
      generateReportNotification(
        {
          eventType: "ready_for_review",
          reportType: "1df_report",
          reportPeriod: "december",
          reportYear: 2024,
          cabinetId,
          cabinetName,
        },
        subDays(now, 0)
      )
    );

    // VAT deadline approaching
    notifications.push(
      generateReportNotification(
        {
          eventType: "deadline_approaching",
          reportType: "vat_declaration",
          reportPeriod: "december",
          reportYear: 2024,
          cabinetId,
          cabinetName,
          deadline: "20 січня 2025",
          daysUntilDeadline: 7,
        },
        subDays(now, 0)
      )
    );

    // Submitted
    notifications.push(
      generateReportNotification(
        {
          eventType: "submitted",
          reportType: "1df_report",
          reportPeriod: "november",
          reportYear: 2024,
          cabinetId,
          cabinetName,
        },
        subDays(now, 1)
      )
    );
  }

  // Mark some as read for demo
  if (notifications.length > 2) {
    notifications[notifications.length - 1].isRead = true;
  }

  return notifications;
};

// Get all report lifecycle notifications for display
export const getReportLifecycleNotifications = (
  cabinets: Array<{ id: string; name: string; type: string }>
): Notification[] => {
  const allNotifications: Notification[] = [];

  cabinets.forEach((cabinet) => {
    const cabinetNotifications = generateDemoReportLifecycleNotifications(
      cabinet.id,
      cabinet.name,
      cabinet.type
    );
    allNotifications.push(...cabinetNotifications);
  });

  // Sort by date (newest first)
  return allNotifications.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};
