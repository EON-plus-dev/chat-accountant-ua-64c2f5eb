/**
 * Tasks Configuration
 * 
 * Types, configurations and helpers for the Task management system.
 * Supports creating tasks from @mentions in comments.
 */

import { 
  CheckSquare, Clock, Play, XCircle, 
  AlertTriangle, ArrowUp, ArrowRight, ArrowDown,
  type LucideIcon 
} from "lucide-react";

// ============ Types ============

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";
export type TaskSource = "manual" | "mention" | "system" | "ai";

export interface Task {
  id: string;
  title: string;
  description?: string;
  
  // Status & Priority
  status: TaskStatus;
  priority: TaskPriority;
  
  // Assignment
  assigneeId: string;
  assigneeName: string;
  createdById: string;
  createdByName: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  
  // Source tracking
  sourceType: TaskSource;
  sourceId?: string;        // Comment ID if from mention
  sourceText?: string;      // Original comment text
  
  // Context
  cabinetId: string;
  cabinetName: string;
  documentId?: string;
  documentTitle?: string;
  
  // Tags
  tags?: string[];
}

// ============ Priority Configuration ============

export interface PriorityConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

export const taskPriorityConfig: Record<TaskPriority, PriorityConfig> = {
  low: { 
    label: "Низький", 
    color: "text-slate-500", 
    bgColor: "bg-slate-100 dark:bg-slate-800",
    icon: ArrowDown,
  },
  medium: { 
    label: "Середній", 
    color: "text-blue-500", 
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: ArrowRight,
  },
  high: { 
    label: "Високий", 
    color: "text-amber-500", 
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: ArrowUp,
  },
  critical: { 
    label: "Критичний", 
    color: "text-red-500", 
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: AlertTriangle,
  },
};

// ============ Status Configuration ============

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
}

export const taskStatusConfig: Record<TaskStatus, StatusConfig> = {
  open: { 
    label: "Відкрито", 
    color: "text-blue-500", 
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: CheckSquare,
  },
  in_progress: { 
    label: "В роботі", 
    color: "text-amber-500", 
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: Play,
  },
  done: { 
    label: "Виконано", 
    color: "text-emerald-500", 
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    icon: CheckSquare,
  },
  cancelled: { 
    label: "Скасовано", 
    color: "text-slate-400", 
    bgColor: "bg-slate-100 dark:bg-slate-800",
    icon: XCircle,
  },
};

// ============ Source Configuration ============

export const taskSourceConfig: Record<TaskSource, { label: string; icon: string }> = {
  manual: { label: "Створено вручну", icon: "✏️" },
  mention: { label: "З @згадки", icon: "@" },
  system: { label: "Системне", icon: "⚙️" },
  ai: { label: "AI-рекомендація", icon: "🤖" },
};

// ============ Action Verbs for Detection ============

export const actionVerbs = [
  "перевірте", "перевір", "перевірити",
  "зробіть", "зроби", "зробити",
  "підготуйте", "підготуй", "підготувати",
  "надішліть", "надішли", "надіслати",
  "узгодьте", "узгодь", "узгодити",
  "виконайте", "виконай", "виконати",
  "додайте", "додай", "додати",
  "оновіть", "онови", "оновити",
  "виправте", "виправ", "виправити",
  "опрацюйте", "опрацюй", "опрацювати",
];

// ============ Helper Functions ============

/**
 * Check if comment text contains action verb indicating a task
 */
export const hasActionVerb = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return actionVerbs.some(verb => lowerText.includes(verb));
};

/**
 * Extract potential task info from @mention comment
 */
export const extractTaskFromMention = (
  commentContent: string,
  mentionedUserName: string,
  mentionedUserId: string,
  context: {
    cabinetId: string;
    cabinetName: string;
    documentId?: string;
    documentTitle?: string;
    commentId?: string;
  }
): Partial<Task> | null => {
  if (!hasActionVerb(commentContent)) {
    return null;
  }
  
  // Try to extract a meaningful title from the comment
  // Pattern: "@Name дія щось" -> "Дія щось"
  const mentionPattern = /@[\wа-яіїєґ\s]+/gi;
  const cleanedContent = commentContent.replace(mentionPattern, "").trim();
  
  // Capitalize first letter
  const title = cleanedContent.charAt(0).toUpperCase() + cleanedContent.slice(1);
  
  return {
    title: title.length > 80 ? title.slice(0, 77) + "..." : title,
    description: commentContent,
    assigneeId: mentionedUserId,
    assigneeName: mentionedUserName,
    priority: "medium",
    status: "open",
    sourceType: "mention",
    sourceId: context.commentId,
    sourceText: commentContent,
    cabinetId: context.cabinetId,
    cabinetName: context.cabinetName,
    documentId: context.documentId,
    documentTitle: context.documentTitle,
  };
};

// ============ Demo Tasks ============

export const demoTasksByCabinet: Record<string, Task[]> = {
  "1": [
    {
      id: "task-demo-1",
      title: "Перевірити пункт 3.2 договору",
      description: "@Коваленко М.Д. перевірте пункт 3.2 договору щодо термінів оплати",
      status: "open",
      priority: "high",
      assigneeId: "user-4",
      assigneeName: "Коваленко Марія Дмитрівна",
      createdById: "user-6",
      createdByName: "Петренко Ігор Васильович",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      sourceType: "mention",
      sourceText: "@Коваленко М.Д. перевірте пункт 3.2 договору щодо термінів оплати",
      cabinetId: "1",
      cabinetName: "ТОВ «Ромашка»",
      documentId: "doc-125",
      documentTitle: "Договір №125-2025",
      tags: ["договір", "терміново"],
    },
    {
      id: "task-demo-2",
      title: "Підготувати акт звірки за грудень",
      description: "Необхідно підготувати акт звірки з ТОВ «Постачальник» за грудень 2024",
      status: "in_progress",
      priority: "medium",
      assigneeId: "user-4",
      assigneeName: "Коваленко Марія Дмитрівна",
      createdById: "user-5",
      createdByName: "Шевченко Тарас Григорович",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      sourceType: "manual",
      cabinetId: "1",
      cabinetName: "ТОВ «Ромашка»",
      tags: ["акт звірки"],
    },
    {
      id: "task-demo-3",
      title: "Узгодити зміни до трудового договору",
      description: "@Бондаренко А.С. узгодьте зміни до трудового договору з юридичним відділом",
      status: "open",
      priority: "medium",
      assigneeId: "user-7",
      assigneeName: "Бондаренко Анна Сергіївна",
      createdById: "user-5",
      createdByName: "Шевченко Тарас Григорович",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sourceType: "mention",
      cabinetId: "1",
      cabinetName: "ТОВ «Ромашка»",
      documentId: "doc-hr-15",
      documentTitle: "Трудовий договір №15",
    },
    {
      id: "task-demo-4",
      title: "Оновити реєстр контрагентів",
      description: "Додати нових постачальників до реєстру та перевірити актуальність даних",
      status: "done",
      priority: "low",
      assigneeId: "user-4",
      assigneeName: "Коваленко Марія Дмитрівна",
      createdById: "user-4",
      createdByName: "Коваленко Марія Дмитрівна",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sourceType: "manual",
      cabinetId: "1",
      cabinetName: "ТОВ «Ромашка»",
    },
  ],
  "2": [
    {
      id: "task-demo-5",
      title: "Надіслати декларацію ФОП",
      description: "Підготувати та надіслати квартальну декларацію",
      status: "open",
      priority: "critical",
      assigneeId: "user-2",
      assigneeName: "Бухгалтер Онлайн",
      createdById: "user-1",
      createdByName: "Іваненко Олена Михайлівна",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      sourceType: "system",
      cabinetId: "2",
      cabinetName: "ФОП Іваненко О.М.",
      tags: ["декларація", "дедлайн"],
    },
  ],
};

/**
 * Get demo tasks for a cabinet
 */
export const getDemoTasksForCabinet = (cabinetId: string): Task[] => {
  return demoTasksByCabinet[cabinetId] || [];
};

/**
 * Get all demo tasks across all cabinets
 */
export const getAllDemoTasks = (): Task[] => {
  return Object.values(demoTasksByCabinet).flat();
};
