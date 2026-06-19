import type { CabinetType } from "@/types/cabinet";
import type { PermissionKey } from "./teamRolesConfig";

// ============ Extended Team Member Interface ============

export interface ExtendedTeamMember {
  id: string;
  userId: string; // Reference to user
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  position?: string; // Посада (може відрізнятись від ролі)
  role: string;
  roleLabel: string;
  accessType: "full" | "limited" | "readonly";
  status: "active" | "invited" | "suspended" | "left";
  onboardingCompleted: boolean;
  invitedBy?: string;
  invitedByName?: string;
  invitedAt?: string;
  activatedAt?: string;
  lastActive?: string;
  kepConfigured: boolean;
  notificationsEnabled: boolean;
  customPermissions?: PermissionKey[]; // Додаткові дозволи
  restrictedPermissions?: PermissionKey[]; // Заборонені дозволи
  // Identity verification method (from onboarding)
  identityMethod?: "email" | "kep" | "diia";
  identityVerifiedAt?: string;
  // KEP details (if configured)
  kepProvider?: string;
  kepValidUntil?: string;
}

// ============ Team Invitation Interface ============

export interface TeamInvitation {
  id: string;
  cabinetId: string;
  cabinetName: string;
  cabinetType: CabinetType;
  email: string;
  role: string;
  roleLabel: string;
  accessType: "full" | "limited" | "readonly";
  message?: string;
  invitedBy: string;
  invitedByName: string;
  invitedByEmail: string;
  invitedByAvatar?: string;
  status: "pending" | "accepted" | "declined" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  token: string;
}

// ============ Team Audit Entry ============

export type TeamAuditAction =
  | "member_invited"
  | "member_activated"
  | "member_suspended"
  | "member_removed"
  | "member_left"
  | "role_changed"
  | "permissions_updated"
  | "delegation_created"
  | "delegation_revoked"
  | "invitation_sent"
  | "invitation_accepted"
  | "invitation_declined"
  | "invitation_expired"
  | "invitation_revoked";

export interface TeamAuditEntry {
  id: string;
  cabinetId: string;
  actorId: string;
  actorName: string;
  actorRole?: string;
  action: TeamAuditAction;
  targetId?: string;
  targetName?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  timestamp: string;
}

// ============ Demo Team Members ============

export const demoTeamMembersByСabinet: Record<string, ExtendedTeamMember[]> = {
  // ТОВ "Ромашка" (cabinet id: "1")
  "1": [
    {
      id: "tm-1",
      userId: "user-5",
      name: "Шевченко Тарас Григорович",
      email: "director@romashka.ua",
      phone: "+380501234567",
      position: "Генеральний директор",
      role: "director",
      roleLabel: "Директор",
      accessType: "full",
      status: "active",
      onboardingCompleted: true,
      activatedAt: "2024-01-15T10:00:00",
      lastActive: "2025-01-08T10:30:00",
      kepConfigured: true,
      notificationsEnabled: true,
    },
    {
      id: "tm-2",
      userId: "user-4",
      name: "Коваленко Марія Дмитрівна",
      email: "accountant@romashka.ua",
      phone: "+380502345678",
      position: "Головний бухгалтер",
      role: "chief-accountant",
      roleLabel: "Головний бухгалтер",
      accessType: "full",
      status: "active",
      onboardingCompleted: true,
      invitedBy: "user-5",
      invitedByName: "Шевченко Т.Г.",
      invitedAt: "2024-02-01T09:00:00",
      activatedAt: "2024-02-01T14:30:00",
      lastActive: "2025-01-08T09:15:00",
      kepConfigured: true,
      notificationsEnabled: true,
    },
    {
      id: "tm-3",
      userId: "user-6",
      name: "Петренко Ігор Васильович",
      email: "lawyer@romashka.ua",
      phone: "+380503456789",
      position: "Юрисконсульт",
      role: "lawyer",
      roleLabel: "Юрист",
      accessType: "full",
      status: "active",
      onboardingCompleted: true,
      invitedBy: "user-5",
      invitedByName: "Шевченко Т.Г.",
      invitedAt: "2024-03-10T11:00:00",
      activatedAt: "2024-03-10T16:00:00",
      lastActive: "2025-01-07T17:30:00",
      kepConfigured: false,
      notificationsEnabled: true,
    },
    {
      id: "tm-4",
      userId: "user-7",
      name: "Бондаренко Анна Сергіївна",
      email: "hr@romashka.ua",
      position: "HR-менеджер",
      role: "hr",
      roleLabel: "HR/Кадри",
      accessType: "full",
      status: "active",
      onboardingCompleted: true,
      invitedBy: "user-5",
      invitedByName: "Шевченко Т.Г.",
      invitedAt: "2024-04-05T10:00:00",
      activatedAt: "2024-04-05T15:00:00",
      lastActive: "2025-01-08T08:45:00",
      kepConfigured: false,
      notificationsEnabled: true,
    },
    {
      id: "tm-5",
      userId: "user-8",
      name: "Мельник Олександр Петрович",
      email: "new.accountant@example.com",
      role: "accountant",
      roleLabel: "Бухгалтер",
      accessType: "full",
      status: "invited",
      onboardingCompleted: false,
      invitedBy: "user-4",
      invitedByName: "Коваленко М.Д.",
      invitedAt: "2025-01-07T14:00:00",
      kepConfigured: false,
      notificationsEnabled: false,
    },
  ],
  // ФОП Іваненко (cabinet id: "2")
  "2": [
    {
      id: "tm-10",
      userId: "user-1",
      name: "Іваненко Олена Михайлівна",
      email: "ivanenko@gmail.com",
      phone: "+380671234567",
      role: "owner",
      roleLabel: "Власник",
      accessType: "full",
      status: "active",
      onboardingCompleted: true,
      activatedAt: "2024-01-10T09:00:00",
      lastActive: "2025-01-08T11:00:00",
      kepConfigured: true,
      notificationsEnabled: true,
    },
    {
      id: "tm-11",
      userId: "user-2",
      name: "Бухгалтер Онлайн",
      email: "buh@online-buh.ua",
      role: "accountant",
      roleLabel: "Бухгалтер",
      accessType: "full",
      status: "active",
      onboardingCompleted: true,
      invitedBy: "user-1",
      invitedByName: "Іваненко О.М.",
      invitedAt: "2024-02-15T10:00:00",
      activatedAt: "2024-02-15T12:00:00",
      lastActive: "2025-01-08T08:30:00",
      kepConfigured: false,
      notificationsEnabled: true,
    },
    {
      id: "tm-12",
      userId: "user-5",
      name: "Шевченко Тарас Григорович",
      email: "demo@platform.ua",
      position: "Консультант",
      role: "owner",
      roleLabel: "Адміністратор",
      accessType: "full",
      status: "active",
      onboardingCompleted: true,
      invitedBy: "user-1",
      invitedByName: "Іваненко О.М.",
      invitedAt: "2024-01-15T10:00:00",
      activatedAt: "2024-01-15T12:00:00",
      lastActive: "2025-01-08T12:00:00",
      kepConfigured: false,
      notificationsEnabled: true,
    },
  ],
};

// ============ Demo Invitations ============

export const demoInvitations: TeamInvitation[] = [
  {
    id: "inv-1",
    cabinetId: "1",
    cabinetName: "ТОВ «Ромашка»",
    cabinetType: "tov",
    email: "new.accountant@example.com",
    role: "accountant",
    roleLabel: "Бухгалтер",
    accessType: "full",
    message: "Вітаю! Запрошую вас до нашої команди для ведення обліку. Очікуємо на вас!",
    invitedBy: "user-4",
    invitedByName: "Коваленко Марія Дмитрівна",
    invitedByEmail: "accountant@romashka.ua",
    status: "pending",
    expiresAt: "2025-01-15T23:59:59",
    createdAt: "2025-01-07T14:00:00",
    token: "demo-token-abc123",
  },
  {
    id: "inv-2",
    cabinetId: "1",
    cabinetName: "ТОВ «Ромашка»",
    cabinetType: "tov",
    email: "auditor@audit-firm.ua",
    role: "auditor",
    roleLabel: "Аудитор",
    accessType: "readonly",
    message: "Запрошуємо для проведення аудиту за 2024 рік.",
    invitedBy: "user-5",
    invitedByName: "Шевченко Тарас Григорович",
    invitedByEmail: "director@romashka.ua",
    status: "pending",
    expiresAt: "2025-01-20T23:59:59",
    createdAt: "2025-01-08T09:00:00",
    token: "demo-token-def456",
  },
  {
    id: "inv-3",
    cabinetId: "2",
    cabinetName: "ФОП Іваненко О.М.",
    cabinetType: "fop",
    email: "consultant@tax-help.ua",
    role: "auditor",
    roleLabel: "Аудитор",
    accessType: "readonly",
    invitedBy: "user-1",
    invitedByName: "Іваненко Олена Михайлівна",
    invitedByEmail: "ivanenko@gmail.com",
    status: "expired",
    expiresAt: "2024-12-31T23:59:59",
    createdAt: "2024-12-24T10:00:00",
    token: "demo-token-expired",
  },
];

// ============ Demo Audit Log ============

export const demoTeamAuditLog: TeamAuditEntry[] = [
  {
    id: "audit-1",
    cabinetId: "1",
    actorId: "user-4",
    actorName: "Коваленко М.Д.",
    actorRole: "chief-accountant",
    action: "member_invited",
    targetId: "user-8",
    targetName: "Мельник О.П.",
    newValue: "accountant",
    details: "Запрошено на роль Бухгалтер",
    timestamp: "2025-01-07T14:00:00",
  },
  {
    id: "audit-2",
    cabinetId: "1",
    actorId: "user-5",
    actorName: "Шевченко Т.Г.",
    actorRole: "director",
    action: "delegation_created",
    targetId: "user-4",
    targetName: "Коваленко М.Д.",
    details: "Делеговано право підпису на період відпустки",
    timestamp: "2025-01-06T16:30:00",
  },
  {
    id: "audit-3",
    cabinetId: "1",
    actorId: "user-5",
    actorName: "Шевченко Т.Г.",
    actorRole: "director",
    action: "role_changed",
    targetId: "user-7",
    targetName: "Бондаренко А.С.",
    oldValue: "accountant",
    newValue: "hr",
    details: "Змінено роль з Бухгалтер на HR/Кадри",
    timestamp: "2024-12-20T11:00:00",
  },
  {
    id: "audit-4",
    cabinetId: "1",
    actorId: "user-6",
    actorName: "Петренко І.В.",
    actorRole: "lawyer",
    action: "member_activated",
    details: "Приєднався до кабінету",
    timestamp: "2024-03-10T16:00:00",
  },
  {
    id: "audit-5",
    cabinetId: "2",
    actorId: "user-1",
    actorName: "Іваненко О.М.",
    actorRole: "owner",
    action: "member_invited",
    targetId: "user-2",
    targetName: "Бухгалтер Онлайн",
    newValue: "accountant",
    details: "Запрошено на роль Бухгалтер",
    timestamp: "2024-02-15T10:00:00",
  },
  {
    id: "audit-6",
    cabinetId: "2",
    actorId: "user-2",
    actorName: "Бухгалтер Онлайн",
    actorRole: "accountant",
    action: "member_activated",
    details: "Приєднався до кабінету",
    timestamp: "2024-02-15T12:00:00",
  },
];

// ============ Helper Functions ============

export const getExtendedTeamMembersForCabinet = (cabinetId: string): ExtendedTeamMember[] => {
  return demoTeamMembersByСabinet[cabinetId] || [];
};

export const getTeamMemberById = (memberId: string, cabinetId: string): ExtendedTeamMember | undefined => {
  const members = getExtendedTeamMembersForCabinet(cabinetId);
  return members.find(m => m.id === memberId || m.userId === memberId);
};

export const getInvitationsForCabinet = (cabinetId: string): TeamInvitation[] => {
  return demoInvitations.filter(inv => inv.cabinetId === cabinetId);
};

export const getPendingInvitationsForCabinet = (cabinetId: string): TeamInvitation[] => {
  return demoInvitations.filter(inv => inv.cabinetId === cabinetId && inv.status === "pending");
};

export const getInvitationByToken = (token: string): TeamInvitation | undefined => {
  return demoInvitations.find(inv => inv.token === token);
};

export const getTeamAuditLogForCabinet = (cabinetId: string): TeamAuditEntry[] => {
  return demoTeamAuditLog
    .filter(entry => entry.cabinetId === cabinetId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ============ Audit Action Labels ============

export const auditActionLabels: Record<TeamAuditAction, string> = {
  member_invited: "Запрошено учасника",
  member_activated: "Приєднався до кабінету",
  member_suspended: "Призупинено доступ",
  member_removed: "Видалено з кабінету",
  member_left: "Покинув кабінет",
  role_changed: "Змінено роль",
  permissions_updated: "Оновлено дозволи",
  delegation_created: "Створено делегування",
  delegation_revoked: "Скасовано делегування",
  invitation_sent: "Надіслано запрошення",
  invitation_accepted: "Прийнято запрошення",
  invitation_declined: "Відхилено запрошення",
  invitation_expired: "Запрошення застаріло",
  invitation_revoked: "Скасовано запрошення",
};
