/**
 * notificationAdapter — мапить записи з public.user_notifications (БД)
 * у уніфікований UI-тип Notification (хедер, /notifications, інбокс).
 */
import type { UserNotification } from "@/hooks/useUserNotifications";
import type { Notification } from "@/lib/reportNotificationService";
import type { NotificationType, NotificationPriority } from "@/components/dashboard/NotificationItem";
import { timeAgo } from "@/lib/timeAgo";

const severityToPriority = (severity: string): NotificationPriority => {
  if (severity === "critical") return "urgent";
  if (severity === "warning") return "high";
  return "normal";
};

const typeToUiType = (dbType: string): NotificationType => {
  switch (dbType) {
    case "event_reminder":
    case "deadline":
      return "deadline";
    case "ai":
      return "ai";
    case "mention":
      return "mention";
    case "task":
      return "task";
    case "document":
      return "document";
    case "alert":
      return "alert";
    case "success":
      return "success";
    case "contractor-onboarded":
      return "contractor-onboarded";
    default:
      return "general";
  }
};

export interface CabinetLookup {
  id: string;
  name: string;
}

export const mapDbNotificationToUI = (
  n: UserNotification,
  cabinets: CabinetLookup[] = []
): Notification => {
  const cab = n.cabinet_id ? cabinets.find((c) => c.id === n.cabinet_id) : undefined;
  return {
    id: n.id,
    title: n.title,
    description: n.body ?? "",
    time: timeAgo(n.created_at),
    date: n.created_at.split("T")[0],
    type: typeToUiType(n.type),
    isRead: !!n.read_at,
    cabinetId: n.cabinet_id ?? "all",
    cabinetName: cab?.name ?? "Система",
    priority: severityToPriority(n.severity),
    actionPath: n.action_path ?? undefined,
    relatedEventId: n.related_event_id ?? undefined,
  };
};

/** Чи це id з БД (uuid v4) — для маршрутизації mark/delete у правильний бекенд. */
export const isDbNotificationId = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};
