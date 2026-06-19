// User Settings Configuration
import { LayoutGrid, User, Shield, Bell, Building2, Download, CreditCard, AlertTriangle, type LucideIcon } from "lucide-react";

export interface UserSettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const userSettingsTabs: UserSettingsTab[] = [
  { id: "hub", label: "Огляд", icon: LayoutGrid },
  { id: "personal", label: "Особисті дані", icon: User },
  { id: "security", label: "Безпека", icon: Shield },
  { id: "notifications", label: "Сповіщення", icon: Bell },
  { id: "tariff", label: "Тариф і заробіток", icon: CreditCard },
  { id: "cabinets", label: "Мої кабінети", icon: Building2 },
  { id: "export", label: "Експорт даних", icon: Download },
  { id: "danger-zone", label: "Небезпечна зона", icon: AlertTriangle },
];

export const aiChatPrompts = [
  "Допоможи налаштувати сповіщення",
  "Поясни різницю між налаштуваннями профілю і кабінету",
  "Який режим підходить моїй ролі?",
];


// Ролі для приєднання до кабінету (що може запитувати користувач)
export const cabinetAccessRoles = [
  { value: "accountant", label: "Бухгалтер", description: "Повний доступ до обліку та звітності" },
  { value: "auditor", label: "Аудитор", description: "Перегляд та аналіз без редагування" },
  { value: "viewer", label: "Переглядач", description: "Тільки перегляд основних даних" },
];

// Mock зареєстрованих користувачів (для live-індикації existing/new user у діалозі приєднання)
export interface MockRegisteredUser {
  email: string;
  name: string;
  avatar?: string | null;
}

export const mockRegisteredUsers: MockRegisteredUser[] = [
  { email: "owner@romashka.ua", name: "Іван Петренко", avatar: null },
  { email: "kovalenko@gmail.com", name: "Олена Коваленко", avatar: null },
  { email: "sidorenko.p@tech-plus.ua", name: "Петро Сидоренко", avatar: null },
  { email: "m.bondarenko@fop-group.ua", name: "Марія Бондаренко", avatar: null },
  { email: "shevchenko.a@gmail.com", name: "Андрій Шевченко", avatar: null },
];

export interface NotificationChannel {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  isDemo?: boolean;
  type: "basic" | "messenger";
  status: "connected" | "not_connected" | "error";
  lastTestAt?: string;
  lastTestSuccess?: boolean;
  connectionUrl?: string;
  connectionHint?: string;
  comingSoon?: boolean;
}

export const notificationChannels: NotificationChannel[] = [
  // Базові канали
  {
    id: "internal",
    label: "Внутрішні сповіщення",
    description: "Дзвіночок у хедері та сторінка /notifications. Працює завжди",
    enabled: true,
    type: "basic",
    status: "connected",
  },
  {
    id: "email",
    label: "Email",
    description: "Для звітів і важливих подій. Можуть запізнюватись на хвилини",
    enabled: true,
    type: "basic",
    status: "connected",
    comingSoon: true,
  },
  {
    id: "push",
    label: "Push-сповіщення",
    description: "Миттєво на пристрої. Потребує дозволу браузера",
    enabled: false,
    isDemo: true,
    type: "basic",
    status: "not_connected",
  },
  // Месенджери
  {
    id: "telegram",
    label: "Telegram",
    description: "Сповіщення у бота. Найшвидший канал",
    enabled: false,
    type: "messenger",
    status: "not_connected",
    connectionUrl: "https://t.me/AIBuhgalterBot",
    connectionHint: "Напишіть /start нашому боту",
    comingSoon: true,
  },
  {
    id: "viber",
    label: "Viber",
    description: "Підпишіться на наш паблік-акаунт",
    enabled: false,
    type: "messenger",
    status: "not_connected",
    connectionUrl: "viber://pa?chatURI=aibuhgalter",
    connectionHint: "Підпишіться на наш паблік-акаунт",
    comingSoon: true,
  },
];

// Re-export notification types config from dedicated file for backwards compatibility.
// New code should import directly from `@/config/notificationTypesConfig`.
export {
  notificationTypesConfig as notificationTypes,
  notificationGroupLabels as notificationTypeGroupLabels,
  notificationGroupDescriptions as notificationTypeGroupDescriptions,
  type NotificationTypeGroup,
  type NotificationTypeConfig,
} from "./notificationTypesConfig";

export const demoSessions = [
  { 
    id: "1", 
    device: "Chrome на Windows", 
    location: "Київ, Україна", 
    lastActive: "Зараз активна",
    isCurrent: true 
  },
  { 
    id: "2", 
    device: "Safari на iPhone", 
    location: "Київ, Україна", 
    lastActive: "2 години тому",
    isCurrent: false 
  },
  { 
    id: "3", 
    device: "Firefox на MacOS", 
    location: "Львів, Україна", 
    lastActive: "Вчора",
    isCurrent: false 
  },
];

export const demoSecurityLog = [
  { id: "1", action: "Вхід у систему", device: "Chrome на Windows", date: "10 грудня 2025, 09:15" },
  { id: "2", action: "Зміна пароля", device: "Chrome на Windows", date: "8 грудня 2025, 14:30" },
  { id: "3", action: "Вхід у систему", device: "Safari на iPhone", date: "7 грудня 2025, 18:45" },
  { id: "4", action: "Оновлення email", device: "Chrome на Windows", date: "5 грудня 2025, 11:00" },
];

// Delivery Log types and demo data
export interface DeliveryLogEntry {
  id: string;
  channel: 'email' | 'telegram' | 'push' | 'viber' | 'internal';
  type: 'system' | 'deadline' | 'ai_insight' | 'risk_alert' | 'integration' | 'digest' | 'team';
  title: string;
  recipient: string;
  status: 'delivered' | 'failed' | 'pending';
  createdAt: string;
  errorMessage?: string;
  cabinetName?: string;
}

export const demoDeliveryLog: DeliveryLogEntry[] = [
  {
    id: "1",
    channel: "email",
    type: "digest",
    title: "Щотижневий дайджест",
    recipient: "user@example.com",
    status: "delivered",
    createdAt: "2025-12-10T08:00:00",
    cabinetName: "ТОВ «Ромашка»"
  },
  {
    id: "2",
    channel: "telegram",
    type: "deadline",
    title: "Нагадування: здача ЄСВ через 3 дні",
    recipient: "@user_telegram",
    status: "delivered",
    createdAt: "2025-12-09T15:30:00",
    cabinetName: "ФОП Петренко"
  },
  {
    id: "3",
    channel: "email",
    type: "ai_insight",
    title: "AI: виявлено аномалію у витратах",
    recipient: "user@example.com",
    status: "delivered",
    createdAt: "2025-12-09T10:15:00",
    cabinetName: "ТОВ «Ромашка»"
  },
  {
    id: "4",
    channel: "push",
    type: "risk_alert",
    title: "Критичний ризик: перевищення ліміту ФОП",
    recipient: "Browser Push",
    status: "pending",
    createdAt: "2025-12-10T09:45:00",
    cabinetName: "ФОП Петренко"
  },
  {
    id: "5",
    channel: "email",
    type: "system",
    title: "Тестовий дайджест",
    recipient: "invalid@mail",
    status: "failed",
    errorMessage: "Invalid email address",
    createdAt: "2025-12-07T14:20:00"
  },
  {
    id: "6",
    channel: "viber",
    type: "deadline",
    title: "Нагадування: сплата ЄП до 20.12",
    recipient: "+380501234567",
    status: "failed",
    errorMessage: "User not subscribed to Viber channel",
    createdAt: "2025-12-08T11:00:00",
    cabinetName: "ФОП Коваленко"
  },
  {
    id: "7",
    channel: "internal",
    type: "integration",
    title: "Monobank: синхронізацію завершено",
    recipient: "Внутрішнє",
    status: "delivered",
    createdAt: "2025-12-10T07:30:00",
    cabinetName: "ФОП Петренко"
  },
  // Team events
  {
    id: "8",
    channel: "email",
    type: "team",
    title: "Іванов І.І. приєднався до команди",
    recipient: "director@company.ua",
    status: "delivered",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    cabinetName: "ТОВ «Ромашка»"
  },
  {
    id: "9",
    channel: "telegram",
    type: "team",
    title: "Делегування повноважень створено",
    recipient: "@chief_accountant",
    status: "delivered",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    cabinetName: "ТОВ «Ромашка»"
  },
  {
    id: "10",
    channel: "email",
    type: "team",
    title: "Змінено роль: Бухгалтер → Головний бухгалтер",
    recipient: "hr@company.ua",
    status: "delivered",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    cabinetName: "ТОВ «Ромашка»"
  }
];

// Cabinet Membership Configuration
export interface CabinetMembership {
  id: string;
  cabinetId: string;
  cabinetName: string;
  cabinetType: 'fop' | 'tov' | 'fop-group' | 'individual';
  role: string;
  roleLabel: string;
  status: 'active' | 'invited' | 'pending_request';
  reportStatus?: 'ok' | 'tasks';
  invitedAt?: string;
  requestedAt?: string;
  invitedBy?: string;
  requestMessage?: string;
}

export const demoInvitations: CabinetMembership[] = [
  {
    id: "inv-1",
    cabinetId: "new-1",
    cabinetName: "ТОВ «Нова Компанія»",
    cabinetType: "tov",
    role: "accountant",
    roleLabel: "Бухгалтер",
    status: "invited",
    invitedAt: "2025-12-09T14:00:00",
    invitedBy: "Олександр Власник"
  },
  {
    id: "inv-2",
    cabinetId: "new-2",
    cabinetName: "ФОП Мельник О.В.",
    cabinetType: "fop",
    role: "accountant",
    roleLabel: "Бухгалтер",
    status: "invited",
    invitedAt: "2025-12-08T10:30:00",
    invitedBy: "Олена Мельник"
  }
];

export const demoPendingRequests: CabinetMembership[] = [
  {
    id: "req-1",
    cabinetId: "req-cab-1",
    cabinetName: "ФОП Сидоренко І.П.",
    cabinetType: "fop",
    role: "accountant",
    roleLabel: "Бухгалтер",
    status: "pending_request",
    requestedAt: "2025-12-07T09:15:00",
    requestMessage: "Хочу допомогти з обліком"
  }
];

// Cabinet Access Details for "Деталі доступу" dialog
export interface CabinetAccessDetails {
  cabinetId: string;
  grantedAt: string;
  grantedBy: string;
  grantedByEmail: string;
  accessType: 'full' | 'limited' | 'readonly';
  expiresAt?: string;
  permissions: string[];
}

export const demoCabinetAccessDetails: Record<string, CabinetAccessDetails> = {
  "1": {
    cabinetId: "1",
    grantedAt: "2024-03-15T10:00:00",
    grantedBy: "Іван Петренко",
    grantedByEmail: "owner@romashka.ua",
    accessType: "full",
    permissions: ["documents", "reports", "analytics", "settings"]
  },
  "2": {
    cabinetId: "2",
    grantedAt: "2024-06-20T14:30:00",
    grantedBy: "Олена Коваленко",
    grantedByEmail: "kovalenko@gmail.com",
    accessType: "full",
    permissions: ["documents", "reports", "analytics", "settings"]
  },
  "3": {
    cabinetId: "3",
    grantedAt: "2024-09-01T09:00:00",
    grantedBy: "Петро Сидоренко",
    grantedByEmail: "sidorenko.p@tech-plus.ua",
    accessType: "limited",
    permissions: ["documents", "reports", "analytics"]
  },
  "4": {
    cabinetId: "4",
    grantedAt: "2025-01-10T11:15:00",
    grantedBy: "Марія Бондаренко",
    grantedByEmail: "m.bondarenko@fop-group.ua",
    accessType: "readonly",
    permissions: ["reports", "analytics"]
  },
  "5": {
    cabinetId: "5",
    grantedAt: "2025-02-28T16:45:00",
    grantedBy: "Андрій Шевченко",
    grantedByEmail: "shevchenko.a@gmail.com",
    accessType: "full",
    permissions: ["documents", "reports", "analytics", "settings"]
  }
};
