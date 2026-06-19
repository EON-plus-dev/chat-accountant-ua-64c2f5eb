// Notification Types Configuration
// Single source of truth for profile-level notification type toggles.
// Cabinet-level AI sub-types live in `src/config/aiNotificationsConfig.ts`.

import {
  Bell,
  Brain,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  CalendarClock,
  MessageSquare,
  Link as LinkIcon,
  type LucideIcon,
} from "lucide-react";

export type NotificationTypeKey =
  | "system"
  | "deadlines"
  | "events"
  | "ai"
  | "risks"
  | "team"
  | "mentions"
  | "tasks"
  | "integrations";

export type NotificationTypeGroup = "work" | "ai_risks" | "team" | "system";

export interface NotificationTypeConfig {
  id: NotificationTypeKey;
  label: string;
  description: string;
  icon: LucideIcon;
  group: NotificationTypeGroup;
  defaultEnabled: boolean;
}

export const notificationGroupLabels: Record<NotificationTypeGroup, string> = {
  work: "Робочі",
  ai_risks: "AI та ризики",
  team: "Команда",
  system: "Системні",
};

export const notificationGroupDescriptions: Record<NotificationTypeGroup, string> = {
  work: "Дедлайни, задачі, події та згадки",
  ai_risks: "AI-рекомендації та підозрілі операції",
  team: "Запрошення, ролі, делегування",
  system: "Технічні події платформи",
};

export const notificationTypesConfig: NotificationTypeConfig[] = [
  // Робочі
  {
    id: "deadlines",
    label: "Нагадування про дедлайни",
    description: "За N днів до сплати податків, подачі звітів — деталі нижче",
    icon: Clock,
    group: "work",
    defaultEnabled: true,
  },
  {
    id: "tasks",
    label: "Сповіщення про завдання",
    description: "Призначені вам задачі, зміни статусу, прострочення",
    icon: CheckCircle2,
    group: "work",
    defaultEnabled: true,
  },
  {
    id: "events",
    label: "Події та нагадування",
    description: "Зустрічі, дзвінки та інші події з календаря",
    icon: CalendarClock,
    group: "work",
    defaultEnabled: true,
  },
  {
    id: "mentions",
    label: "@Згадки в коментарях",
    description: "Коли вас згадали в коментарі, документі або задачі",
    icon: MessageSquare,
    group: "work",
    defaultEnabled: true,
  },
  // AI та ризики
  {
    id: "ai",
    label: "AI-рекомендації",
    description:
      "Підказки від AI: оптимізація, категоризація, підсумки. Деталізація — у налаштуваннях кожного кабінету",
    icon: Brain,
    group: "ai_risks",
    defaultEnabled: true,
  },
  {
    id: "risks",
    label: "Критичні ризики кабінетів",
    description: "Підозрілі операції, перевищення лімітів ФОП, невідповідність КВЕДам",
    icon: AlertTriangle,
    group: "ai_risks",
    defaultEnabled: true,
  },
  // Команда
  {
    id: "team",
    label: "Події команди",
    description: "Запрошення, зміни ролей, делегування повноважень",
    icon: Users,
    group: "team",
    defaultEnabled: true,
  },
  // Системні
  {
    id: "system",
    label: "Системні сповіщення",
    description: "Оновлення платформи, обслуговування, важливі повідомлення",
    icon: Bell,
    group: "system",
    defaultEnabled: true,
  },
  {
    id: "integrations",
    label: "Зміни інтеграцій",
    description: "Стан синхронізації Monobank, ПриватБанк, ДПС-кабінет",
    icon: LinkIcon,
    group: "system",
    defaultEnabled: false,
  },
];

export const notificationTypesByGroup: Record<NotificationTypeGroup, NotificationTypeConfig[]> = {
  work: notificationTypesConfig.filter((t) => t.group === "work"),
  ai_risks: notificationTypesConfig.filter((t) => t.group === "ai_risks"),
  team: notificationTypesConfig.filter((t) => t.group === "team"),
  system: notificationTypesConfig.filter((t) => t.group === "system"),
};
