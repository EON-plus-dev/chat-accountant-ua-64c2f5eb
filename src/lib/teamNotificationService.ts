import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  teamNotificationTemplates,
  type TeamEventType,
} from "@/config/teamNotificationsConfig";

// ============ Types ============

interface SendTeamNotificationParams {
  eventType: TeamEventType;
  cabinetId: string;
  cabinetName: string;
  recipientUserIds: string[];
  data: Record<string, string>;
  actionPath?: string;
  channels?: ("email" | "internal" | "telegram")[]; // reserved for future transports
}

interface EdgeResponse {
  delivered: number;
  skipped: { user_id: string; reason: string }[];
  failures: { user_id: string; error: string }[];
  error?: string;
}

// ============ Helpers ============

const replacePlaceholders = (template: string, data: Record<string, string>): string =>
  Object.entries(data).reduce(
    (str, [key, value]) => str.replace(new RegExp(`\\{${key}\\}`, "g"), value),
    template
  );

const stripHtml = (html: string): string =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// ============ Main function ============

export const sendTeamNotification = async (
  params: SendTeamNotificationParams
): Promise<EdgeResponse | null> => {
  const { eventType, cabinetId, cabinetName, recipientUserIds, data, actionPath } = params;

  const template = teamNotificationTemplates[eventType];
  if (!template) {
    console.warn(`Unknown team event type: ${eventType}`);
    return null;
  }

  // No-op: nothing to deliver
  if (!recipientUserIds || recipientUserIds.length === 0) {
    if (import.meta.env.DEV) {
      console.log("[TeamNotification] no recipients, skipping", { eventType });
    }
    return { delivered: 0, skipped: [], failures: [] };
  }

  const fullData = { ...data, cabinetName };
  const title = replacePlaceholders(template.emailSubject, fullData);
  const body = stripHtml(replacePlaceholders(template.emailBodyTemplate, fullData));

  const { data: resp, error } = await supabase.functions.invoke<EdgeResponse>(
    "send-team-notification",
    {
      body: {
        eventType,
        cabinetId,
        cabinetName,
        recipientUserIds,
        title,
        body,
        priority: template.priority,
        actionPath: actionPath ?? null,
        data: fullData,
      },
    }
  );

  if (error || !resp) {
    console.error("[TeamNotification] invoke error", error);
    toast.error("Не вдалось надіслати сповіщення команді");
    return null;
  }

  // Compact UX feedback
  const parts: string[] = [];
  if (resp.delivered > 0) parts.push(`Надіслано: ${resp.delivered}`);
  if (resp.skipped.length > 0) parts.push(`Пропущено: ${resp.skipped.length}`);
  if (resp.failures.length > 0) parts.push(`Помилки: ${resp.failures.length}`);

  if (resp.delivered > 0) {
    toast.success(`📧 ${title}`, { description: parts.join(" · ") });
  } else if (resp.skipped.length > 0) {
    toast.info("Сповіщення пропущено через налаштування", { description: parts.join(" · ") });
  }

  if (import.meta.env.DEV) {
    console.log("[TeamNotification] result", { eventType, ...resp });
  }

  return resp;
};

// ============ Convenience functions ============
// NOTE: Until a `cabinet_members` table exists, callers must pass real
// recipient user IDs. Convenience helpers below accept `recipientUserIds`
// as a required first-class arg to avoid silently notifying the initiator.

export const notifyMemberInvited = (
  cabinetId: string,
  cabinetName: string,
  recipientUserIds: string[],
  inviterName: string,
  inviteeName: string,
  roleLabel: string
) =>
  sendTeamNotification({
    eventType: "member_invited",
    cabinetId,
    cabinetName,
    recipientUserIds,
    data: { inviterName, inviteeName, roleLabel },
  });

export const notifyMemberJoined = (
  cabinetId: string,
  cabinetName: string,
  recipientUserIds: string[],
  memberName: string,
  roleLabel: string
) =>
  sendTeamNotification({
    eventType: "member_joined",
    cabinetId,
    cabinetName,
    recipientUserIds,
    data: { memberName, roleLabel },
  });

export const notifyRoleChanged = (
  cabinetId: string,
  cabinetName: string,
  recipientUserIds: string[],
  memberName: string,
  oldRole: string,
  newRole: string
) =>
  sendTeamNotification({
    eventType: "role_changed",
    cabinetId,
    cabinetName,
    recipientUserIds,
    data: { memberName, oldRole, newRole },
  });

export const notifyPermissionsUpdated = (
  cabinetId: string,
  cabinetName: string,
  recipientUserIds: string[],
  memberName: string
) =>
  sendTeamNotification({
    eventType: "permissions_updated",
    cabinetId,
    cabinetName,
    recipientUserIds,
    data: { memberName },
  });

export const notifyMemberRemoved = (
  cabinetId: string,
  cabinetName: string,
  recipientUserIds: string[],
  memberName: string,
  removedBy: string
) =>
  sendTeamNotification({
    eventType: "member_removed",
    cabinetId,
    cabinetName,
    recipientUserIds,
    data: { memberName, removedBy },
  });

export const notifyDelegationCreated = (
  cabinetId: string,
  cabinetName: string,
  recipientUserIds: string[],
  delegatorName: string,
  delegateName: string,
  validFrom: string,
  validUntil: string,
  reason: string
) =>
  sendTeamNotification({
    eventType: "delegation_created",
    cabinetId,
    cabinetName,
    recipientUserIds,
    data: { delegatorName, delegateName, validFrom, validUntil, reason },
  });

export const notifyDelegationRevoked = (
  cabinetId: string,
  cabinetName: string,
  recipientUserIds: string[],
  delegatorName: string,
  delegateName: string,
  revokeReason: string
) =>
  sendTeamNotification({
    eventType: "delegation_revoked",
    cabinetId,
    cabinetName,
    recipientUserIds,
    data: { delegatorName, delegateName, revokeReason },
  });
