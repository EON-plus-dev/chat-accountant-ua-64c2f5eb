import { Brain, Wallet, Users, TrendingUp, FileBarChart, Calendar, Sparkles, type LucideIcon } from "lucide-react";

export type AiNotificationCategory = "realtime" | "periodic";

export interface AiNotificationConfig {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: AiNotificationCategory;
  defaultEnabled: boolean;
  cabinetTypes?: string[];
}

export const aiNotificationsConfig: AiNotificationConfig[] = [
  {
    id: "autoCategorizeSuggestions",
    label: "Авто-категоризація операцій",
    description: "AI пропонує категорію для нерозпізнаних транзакцій у ваших виписках",
    icon: Sparkles,
    category: "realtime",
    defaultEnabled: true,
  },
  {
    id: "fopLimitWarnings",
    label: "Попередження про ліміт ФОП",
    description: "За досягнення 80% та 95% річного ліміту доходу для вашої групи ФОП",
    icon: Wallet,
    category: "realtime",
    defaultEnabled: true,
    cabinetTypes: ["fop", "fop-group"],
  },
  {
    id: "kvedMismatch",
    label: "Невідповідність КВЕДам",
    description: "Якщо тип операції не відповідає зареєстрованим у вас КВЕДам",
    icon: Brain,
    category: "realtime",
    defaultEnabled: true,
    cabinetTypes: ["fop", "tov", "fop-group"],
  },
  {
    id: "hrPayrollAlerts",
    label: "HR/Payroll сповіщення",
    description: "Розрахунок ЗП, ЄСВ, лікарняні, відпустки, нові співробітники",
    icon: Users,
    category: "realtime",
    defaultEnabled: true,
    cabinetTypes: ["tov"],
  },
  {
    id: "weeklySummary",
    label: "Щотижневі AI-підсумки",
    description: "Зведення про стан кабінету щопонеділка о 09:00",
    icon: FileBarChart,
    category: "periodic",
    defaultEnabled: false,
  },
  {
    id: "groupSummary",
    label: "Зведені сповіщення по групі",
    description: "Об'єднаний звіт по всіх ФОП у групі — без шуму від кожного окремо",
    icon: TrendingUp,
    category: "periodic",
    defaultEnabled: true,
    cabinetTypes: ["fop-group"],
  },
  {
    id: "declarationReminders",
    label: "Нагадування про декларації",
    description: "За 14, 7 та 3 дні до дедлайну декларації про майновий стан",
    icon: Calendar,
    category: "periodic",
    defaultEnabled: true,
    cabinetTypes: ["individual"],
  },
];

export const aiCategoryLabels: Record<AiNotificationCategory, string> = {
  realtime: "Поточна робота",
  periodic: "Періодичні підсумки",
};

export const aiCategoryDescriptions: Record<AiNotificationCategory, string> = {
  realtime: "Сповіщення в момент події",
  periodic: "Зведення за розкладом",
};
