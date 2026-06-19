import { 
  UserPlus, 
  UserCheck, 
  UserMinus, 
  UserX, 
  ShieldCheck, 
  Settings, 
  ArrowRightLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Mail,
  type LucideIcon
} from "lucide-react";

// ============ Team Event Types ============

export type TeamEventType =
  | "member_invited"
  | "member_joined"
  | "member_left"
  | "member_removed"
  | "role_changed"
  | "permissions_updated"
  | "delegation_created"
  | "delegation_started"
  | "delegation_ending"
  | "delegation_expired"
  | "delegation_revoked"
  | "invitation_accepted"
  | "invitation_declined"
  | "invitation_expired";

// ============ Notification Template ============

export interface TeamNotificationTemplate {
  id: TeamEventType;
  label: string;
  description: string;
  priority: "normal" | "high" | "urgent";
  icon: LucideIcon;
  emailSubject: string;
  emailBodyTemplate: string;
}

// ============ Team Notification Setting ============

export interface TeamNotificationSetting {
  id: TeamEventType;
  label: string;
  description: string;
  enabled: boolean;
  category: "members" | "roles" | "delegations";
}

// ============ Default Settings ============

export const defaultTeamNotificationSettings: TeamNotificationSetting[] = [
  // Members category
  { 
    id: "member_invited", 
    label: "Нове запрошення", 
    description: "Коли надсилається запрошення новому члену команди",
    enabled: true,
    category: "members"
  },
  { 
    id: "member_joined", 
    label: "Приєднання до команди", 
    description: "Коли новий член прийняв запрошення",
    enabled: true,
    category: "members"
  },
  { 
    id: "member_left", 
    label: "Вихід з команди", 
    description: "Коли член команди самостійно покинув кабінет",
    enabled: true,
    category: "members"
  },
  { 
    id: "member_removed", 
    label: "Видалення з команди", 
    description: "Коли адміністратор видалив члена команди",
    enabled: true,
    category: "members"
  },
  
  // Roles category
  { 
    id: "role_changed", 
    label: "Зміна ролі", 
    description: "Коли змінюється роль учасника",
    enabled: true,
    category: "roles"
  },
  { 
    id: "permissions_updated", 
    label: "Оновлення дозволів", 
    description: "Коли змінюються індивідуальні дозволи",
    enabled: false,
    category: "roles"
  },
  
  // Delegations category
  { 
    id: "delegation_created", 
    label: "Нове делегування", 
    description: "Коли створюється делегування повноважень",
    enabled: true,
    category: "delegations"
  },
  { 
    id: "delegation_started", 
    label: "Початок делегування", 
    description: "Коли делегування починає діяти",
    enabled: true,
    category: "delegations"
  },
  { 
    id: "delegation_ending", 
    label: "Завершення делегування (за 1 день)", 
    description: "Нагадування про закінчення делегування",
    enabled: true,
    category: "delegations"
  },
  { 
    id: "delegation_revoked", 
    label: "Скасування делегування", 
    description: "Коли делегування достроково скасовано",
    enabled: true,
    category: "delegations"
  },
];

// ============ Templates for Email ============

export const teamNotificationTemplates: Record<TeamEventType, TeamNotificationTemplate> = {
  member_invited: {
    id: "member_invited",
    label: "Запрошення надіслано",
    description: "Новий член запрошений до команди",
    priority: "normal",
    icon: UserPlus,
    emailSubject: "Нове запрошення до команди «{cabinetName}»",
    emailBodyTemplate: `
      <p><strong>{inviterName}</strong> запросив <strong>{inviteeName}</strong> приєднатися до команди кабінету <strong>{cabinetName}</strong>.</p>
      <p>Роль: <strong>{roleLabel}</strong></p>
    `,
  },
  member_joined: {
    id: "member_joined",
    label: "Новий член команди",
    description: "Хтось приєднався до команди",
    priority: "high",
    icon: UserCheck,
    emailSubject: "{memberName} приєднався до «{cabinetName}»",
    emailBodyTemplate: `
      <p><strong>{memberName}</strong> прийняв запрошення та приєднався до команди кабінету <strong>{cabinetName}</strong>.</p>
      <p>Роль: <strong>{roleLabel}</strong></p>
    `,
  },
  member_left: {
    id: "member_left",
    label: "Член покинув команду",
    description: "Хтось самостійно покинув команду",
    priority: "normal",
    icon: UserMinus,
    emailSubject: "{memberName} покинув «{cabinetName}»",
    emailBodyTemplate: `
      <p><strong>{memberName}</strong> покинув команду кабінету <strong>{cabinetName}</strong>.</p>
    `,
  },
  member_removed: {
    id: "member_removed",
    label: "Член видалений",
    description: "Адміністратор видалив члена команди",
    priority: "high",
    icon: UserX,
    emailSubject: "{memberName} видалено з «{cabinetName}»",
    emailBodyTemplate: `
      <p><strong>{memberName}</strong> було видалено з команди кабінету <strong>{cabinetName}</strong>.</p>
      <p>Видалено: <strong>{removedBy}</strong></p>
    `,
  },
  role_changed: {
    id: "role_changed",
    label: "Зміна ролі",
    description: "Роль учасника змінено",
    priority: "high",
    icon: ShieldCheck,
    emailSubject: "Зміна ролі в «{cabinetName}»",
    emailBodyTemplate: `
      <p>Роль користувача <strong>{memberName}</strong> у кабінеті <strong>{cabinetName}</strong> змінено.</p>
      <p>Попередня роль: <strong>{oldRole}</strong></p>
      <p>Нова роль: <strong>{newRole}</strong></p>
    `,
  },
  permissions_updated: {
    id: "permissions_updated",
    label: "Оновлення дозволів",
    description: "Індивідуальні дозволи змінено",
    priority: "normal",
    icon: Settings,
    emailSubject: "Оновлення дозволів в «{cabinetName}»",
    emailBodyTemplate: `
      <p>Індивідуальні дозволи користувача <strong>{memberName}</strong> у кабінеті <strong>{cabinetName}</strong> було оновлено.</p>
    `,
  },
  delegation_created: {
    id: "delegation_created",
    label: "Делегування створено",
    description: "Створено нове делегування повноважень",
    priority: "high",
    icon: ArrowRightLeft,
    emailSubject: "Нове делегування в «{cabinetName}»",
    emailBodyTemplate: `
      <p><strong>{delegatorName}</strong> делегував повноваження користувачу <strong>{delegateName}</strong>.</p>
      <p>Період: {validFrom} — {validUntil}</p>
      <p>Причина: {reason}</p>
    `,
  },
  delegation_started: {
    id: "delegation_started",
    label: "Делегування почало діяти",
    description: "Заплановане делегування активоване",
    priority: "high",
    icon: CheckCircle2,
    emailSubject: "Делегування активовано в «{cabinetName}»",
    emailBodyTemplate: `
      <p>Делегування повноважень від <strong>{delegatorName}</strong> до <strong>{delegateName}</strong> почало діяти.</p>
      <p>Діє до: {validUntil}</p>
    `,
  },
  delegation_ending: {
    id: "delegation_ending",
    label: "Делегування закінчується",
    description: "Нагадування про завершення делегування",
    priority: "normal",
    icon: Clock,
    emailSubject: "Делегування закінчується завтра в «{cabinetName}»",
    emailBodyTemplate: `
      <p>Делегування повноважень від <strong>{delegatorName}</strong> до <strong>{delegateName}</strong> закінчується <strong>завтра</strong>.</p>
      <p>Дата завершення: {validUntil}</p>
    `,
  },
  delegation_expired: {
    id: "delegation_expired",
    label: "Делегування завершено",
    description: "Делегування автоматично завершено",
    priority: "normal",
    icon: Clock,
    emailSubject: "Делегування завершено в «{cabinetName}»",
    emailBodyTemplate: `
      <p>Делегування повноважень від <strong>{delegatorName}</strong> до <strong>{delegateName}</strong> завершено.</p>
    `,
  },
  delegation_revoked: {
    id: "delegation_revoked",
    label: "Делегування скасовано",
    description: "Делегування достроково скасовано",
    priority: "high",
    icon: XCircle,
    emailSubject: "Делегування скасовано в «{cabinetName}»",
    emailBodyTemplate: `
      <p>Делегування повноважень від <strong>{delegatorName}</strong> до <strong>{delegateName}</strong> було достроково скасовано.</p>
      <p>Причина: {revokeReason}</p>
    `,
  },
  invitation_accepted: {
    id: "invitation_accepted",
    label: "Запрошення прийнято",
    description: "Запрошений користувач прийняв запрошення",
    priority: "high",
    icon: CheckCircle2,
    emailSubject: "{memberName} прийняв запрошення до «{cabinetName}»",
    emailBodyTemplate: `
      <p><strong>{memberName}</strong> прийняв ваше запрошення та приєднався до команди кабінету <strong>{cabinetName}</strong>.</p>
    `,
  },
  invitation_declined: {
    id: "invitation_declined",
    label: "Запрошення відхилено",
    description: "Запрошений користувач відхилив запрошення",
    priority: "normal",
    icon: XCircle,
    emailSubject: "{memberName} відхилив запрошення до «{cabinetName}»",
    emailBodyTemplate: `
      <p><strong>{memberName}</strong> відхилив запрошення приєднатися до команди кабінету <strong>{cabinetName}</strong>.</p>
    `,
  },
  invitation_expired: {
    id: "invitation_expired",
    label: "Запрошення протерміноване",
    description: "Термін дії запрошення закінчився",
    priority: "normal",
    icon: Clock,
    emailSubject: "Запрошення до «{cabinetName}» протерміноване",
    emailBodyTemplate: `
      <p>Запрошення для <strong>{inviteeName}</strong> приєднатися до команди кабінету <strong>{cabinetName}</strong> протерміноване.</p>
    `,
  },
};

// ============ Helper: Map priority → severity ============

export type NotificationSeverity = "info" | "warning" | "critical";

export const priorityToSeverity = (
  priority: TeamNotificationTemplate["priority"]
): NotificationSeverity => {
  switch (priority) {
    case "urgent": return "critical";
    case "high": return "warning";
    case "normal":
    default: return "info";
  }
};

// ============ Helper: Get icon for event type ============

export const getTeamEventIcon = (eventType: TeamEventType): LucideIcon => {
  return teamNotificationTemplates[eventType]?.icon || Mail;
};

// ============ Helper: Get category label ============

export const getTeamNotificationCategoryLabel = (category: TeamNotificationSetting["category"]): string => {
  switch (category) {
    case "members": return "Учасники";
    case "roles": return "Ролі та дозволи";
    case "delegations": return "Делегування";
    default: return category;
  }
};
