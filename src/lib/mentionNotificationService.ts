/**
 * Mention Notification Service
 * 
 * Handles notifications when users are @mentioned in document comments.
 * Supports:
 * - Instant toast notifications
 * - Simulated email notifications (demo mode)
 * - Notification Center entries
 * - Event Journal logging
 */

import { toast } from "@/hooks/use-toast";
import { AtSign } from "lucide-react";
import type { MentionMember } from "@/components/ui/mention-textarea";
import type { JournalEvent, EventType } from "@/config/eventJournalConfig";
import type { Notification } from "@/lib/reportNotificationService";

// ============ Types ============

export interface MentionNotificationParams {
  mentionedUserId: string;
  mentionedUserName: string;
  mentionedUserEmail?: string;
  mentionerName: string;
  commentContent: string;
  documentId: string;
  documentTitle: string;
  cabinetId: string;
  cabinetName: string;
  fragmentText?: string;
  commentId?: string;
}

export interface MentionContext {
  mentionerName: string;
  commentContent: string;
  documentId: string;
  documentTitle: string;
  cabinetId: string;
  cabinetName: string;
  fragmentText?: string;
  commentId?: string;
}

// ============ Demo Email Simulation ============

interface SimulatedEmail {
  to: string;
  from: string;
  subject: string;
  htmlPreview: string;
  sentAt: string;
}

/**
 * Simulate sending an email (demo mode)
 * In production, this would call an Edge Function with Resend API
 */
const simulateEmailSend = async (params: MentionNotificationParams): Promise<SimulatedEmail> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  
  const email: SimulatedEmail = {
    to: params.mentionedUserEmail || `${params.mentionedUserName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    from: "noreply@e-cabinet.demo",
    subject: `${shortenName(params.mentionerName)} згадав вас у документі "${params.documentTitle}"`,
    htmlPreview: `
┌─────────────────────────────────────────────────┐
│ 📋 Електронний Кабінет                          │
├─────────────────────────────────────────────────┤
│ @ Вас згадали в коментарі                       │
│                                                 │
│ ${shortenName(params.mentionerName)} згадав вас у документі           │
│ «${params.documentTitle}»                             │
│                                                 │
│ "${params.commentContent.slice(0, 60)}..."       │
│                                                 │
│        [ Перейти до коментаря ]                │
│                                                 │
│ Кабінет: ${params.cabinetName}                          │
└─────────────────────────────────────────────────┘
    `.trim(),
    sentAt: new Date().toISOString(),
  };
  
  if (import.meta.env.DEV) console.log("[Demo Email] 📧 Email simulated:", email);
  
  return email;
};

// ============ Core Functions ============

/**
 * Send notification to a single mentioned user
 */
export const notifyMention = async (params: MentionNotificationParams): Promise<void> => {
  // Log for debugging
  if (import.meta.env.DEV) console.log("[MentionNotification] Sending notification:", {
    to: params.mentionedUserName,
    from: params.mentionerName,
    document: params.documentTitle,
    fragment: params.fragmentText?.slice(0, 50),
  });

  // Demo mode: Simulate email sending
  try {
    const email = await simulateEmailSend(params);
    
    // Show toast about "sent" email
    toast({
      title: "📧 Email надіслано",
      description: `${shortenName(params.mentionedUserName)} отримає сповіщення на ${email.to}`,
    });
  } catch (error) {
    console.error("[MentionNotification] Email simulation failed:", error);
  }
};

/**
 * Send notifications to multiple mentioned users
 */
export const notifyMentions = async (
  mentionedUserIds: string[],
  context: MentionContext,
  teamMembers: MentionMember[]
): Promise<{ notifiedUsers: string[]; notificationCount: number }> => {
  const notifiedUsers: string[] = [];

  for (const userId of mentionedUserIds) {
    const member = teamMembers.find(m => m.userId === userId);
    if (member) {
      await notifyMention({
        ...context,
        mentionedUserId: userId,
        mentionedUserName: member.name,
      });
      notifiedUsers.push(member.name);
    }
  }

  // Show toast to current user (confirmation)
  if (notifiedUsers.length > 0) {
    const names = notifiedUsers.length <= 2 
      ? notifiedUsers.join(" та ") 
      : `${notifiedUsers.slice(0, 2).join(", ")} та ще ${notifiedUsers.length - 2}`;
    
    toast({
      title: "Сповіщення надіслано",
      description: `${names} отримають повідомлення про згадку`,
    });
  }

  return { notifiedUsers, notificationCount: notifiedUsers.length };
};

// ============ Event Journal Integration ============

/**
 * Create a journal entry for @mention event
 */
export const createMentionJournalEntry = (params: MentionNotificationParams): JournalEvent => {
  const shortContent = params.commentContent.length > 100 
    ? params.commentContent.slice(0, 100) + "..." 
    : params.commentContent;

  return {
    id: `mention-${Date.now()}-${params.mentionedUserId.slice(-4)}`,
    date: new Date(),
    title: `@${shortenName(params.mentionedUserName)} згадано в коментарі`,
    description: `${shortenName(params.mentionerName)} згадав у документі "${params.documentTitle}"`,
    type: "mention" as EventType,
    priority: "medium",
    icon: AtSign,
    metadata: {
      relatedEntity: params.documentTitle,
    },
    fullDescription: shortContent,
    assignee: params.mentionedUserName,
    tags: ["@mention", "коментар"],
  };
};

/**
 * Create journal entries for multiple mentions
 */
export const createMentionJournalEntries = (
  mentionedUserIds: string[],
  context: MentionContext,
  teamMembers: MentionMember[]
): JournalEvent[] => {
  const entries: JournalEvent[] = [];

  for (const userId of mentionedUserIds) {
    const member = teamMembers.find(m => m.userId === userId);
    if (member) {
      entries.push(createMentionJournalEntry({
        ...context,
        mentionedUserId: userId,
        mentionedUserName: member.name,
      }));
    }
  }

  return entries;
};

// ============ Notification Center Integration ============

/**
 * Create a notification for Notification Center
 */
export const createMentionNotification = (params: MentionNotificationParams): Notification => {
  const shortContent = params.commentContent.length > 80 
    ? params.commentContent.slice(0, 80) + "..." 
    : params.commentContent;

  return {
    id: `mention-notif-${Date.now()}-${params.mentionedUserId.slice(-4)}`,
    title: `${shortenName(params.mentionerName)} згадав вас`,
    description: `У документі "${params.documentTitle}": "${shortContent}"`,
    time: "Щойно",
    date: new Date().toISOString().split("T")[0],
    type: "mention",
    isRead: false,
    cabinetId: params.cabinetId,
    cabinetName: params.cabinetName,
    priority: "normal",
  };
};

/**
 * Create notifications for multiple mentions
 */
export const createMentionNotifications = (
  mentionedUserIds: string[],
  context: MentionContext,
  teamMembers: MentionMember[]
): Notification[] => {
  const notifications: Notification[] = [];

  for (const userId of mentionedUserIds) {
    const member = teamMembers.find(m => m.userId === userId);
    if (member) {
      notifications.push(createMentionNotification({
        ...context,
        mentionedUserId: userId,
        mentionedUserName: member.name,
      }));
    }
  }

  return notifications;
};

// ============ Helpers ============

/**
 * Shorten a full name (e.g., "Коваленко Марія Дмитрівна" → "Коваленко М.Д.")
 */
const shortenName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  const lastName = parts[0];
  const initials = parts.slice(1).map(p => p.charAt(0).toUpperCase() + ".").join("");
  
  return `${lastName} ${initials}`;
};
