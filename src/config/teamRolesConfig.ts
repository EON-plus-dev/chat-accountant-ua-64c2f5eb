import type { CabinetType } from "@/types/cabinet";

// ============ Permission Keys (Granular RBAC) ============

export type PermissionKey =
  // Cabinet management
  | "cabinet:settings"
  | "cabinet:delete"
  | "cabinet:archive"
  // Team management
  | "team:view"
  | "team:invite"
  | "team:manage"
  | "team:remove"
  // Documents
  | "documents:view"
  | "documents:create"
  | "documents:edit"
  | "documents:delete"
  | "documents:approve"
  | "documents:sign"
  // Reports
  | "reports:view"
  | "reports:generate"
  | "reports:submit"
  // Payments
  | "payments:view"
  | "payments:approve"
  | "payments:execute"
  // Analytics
  | "analytics:view"
  | "analytics:export"
  // Contractors
  | "contractors:view"
  | "contractors:manage"
  // Employees
  | "employees:view"
  | "employees:manage"
  // Delegation
  | "delegation:create"
  | "delegation:receive";

// ============ Permission Groups for UI ============

export interface PermissionGroup {
  id: string;
  label: string;
  description: string;
  permissions: { key: PermissionKey; label: string; description: string }[];
}

export const permissionGroups: PermissionGroup[] = [
  {
    id: "cabinet",
    label: "Кабінет",
    description: "Управління налаштуваннями кабінету",
    permissions: [
      { key: "cabinet:settings", label: "Налаштування", description: "Редагування налаштувань кабінету" },
      { key: "cabinet:delete", label: "Видалення", description: "Видалення кабінету" },
      { key: "cabinet:archive", label: "Архівування", description: "Архівування кабінету" },
    ],
  },
  {
    id: "team",
    label: "Команда",
    description: "Управління учасниками кабінету",
    permissions: [
      { key: "team:view", label: "Перегляд", description: "Перегляд списку учасників" },
      { key: "team:invite", label: "Запрошення", description: "Запрошення нових учасників (тільки для власника)" },
      { key: "team:manage", label: "Управління", description: "Зміна ролей та дозволів" },
      { key: "team:remove", label: "Видалення", description: "Видалення учасників" },
    ],
  },
  {
    id: "documents",
    label: "Документи",
    description: "Робота з документами",
    permissions: [
      { key: "documents:view", label: "Перегляд", description: "Перегляд документів" },
      { key: "documents:create", label: "Створення", description: "Створення нових документів" },
      { key: "documents:edit", label: "Редагування", description: "Редагування документів" },
      { key: "documents:delete", label: "Видалення", description: "Видалення документів" },
      { key: "documents:approve", label: "Погодження", description: "Погодження документів" },
      { key: "documents:sign", label: "Підпис КЕП", description: "Підписання документів КЕП" },
    ],
  },
  {
    id: "reports",
    label: "Звітність",
    description: "Формування та подання звітів",
    permissions: [
      { key: "reports:view", label: "Перегляд", description: "Перегляд звітів" },
      { key: "reports:generate", label: "Генерація", description: "Формування звітів" },
      { key: "reports:submit", label: "Подання", description: "Подання звітів до ДПС" },
    ],
  },
  {
    id: "payments",
    label: "Платежі",
    description: "Управління платежами",
    permissions: [
      { key: "payments:view", label: "Перегляд", description: "Перегляд черги платежів" },
      { key: "payments:approve", label: "Погодження", description: "Погодження платежів" },
      { key: "payments:execute", label: "Виконання", description: "Виконання платежів" },
    ],
  },
  {
    id: "analytics",
    label: "Аналітика",
    description: "Перегляд та експорт аналітики",
    permissions: [
      { key: "analytics:view", label: "Перегляд", description: "Перегляд аналітичних даних" },
      { key: "analytics:export", label: "Експорт", description: "Експорт аналітики" },
    ],
  },
  {
    id: "contractors",
    label: "Контрагенти",
    description: "Управління контрагентами",
    permissions: [
      { key: "contractors:view", label: "Перегляд", description: "Перегляд контрагентів" },
      { key: "contractors:manage", label: "Управління", description: "Додавання та редагування" },
    ],
  },
  {
    id: "employees",
    label: "Працівники",
    description: "Управління працівниками",
    permissions: [
      { key: "employees:view", label: "Перегляд", description: "Перегляд працівників" },
      { key: "employees:manage", label: "Управління", description: "Управління працівниками" },
    ],
  },
  {
    id: "delegation",
    label: "Делегування",
    description: "Делегування повноважень",
    permissions: [
      { key: "delegation:create", label: "Створення", description: "Делегування своїх повноважень" },
      { key: "delegation:receive", label: "Отримання", description: "Отримання делегованих повноважень" },
    ],
  },
];

// ============ Role Definition ============

export interface RoleDefinition {
  key: string;
  label: string;
  description: string;
  permissions: PermissionKey[];
  canDelegate: boolean;
  isOwnerRole: boolean;
  approvalWeight: number; // Для ланцюга погодження (більше = вища вага)
  color: "purple" | "blue" | "green" | "orange" | "pink" | "cyan" | "yellow" | "gray";
  icon?: string;
}

// ============ Roles by Cabinet Type ============

const tovRoles: RoleDefinition[] = [
  {
    key: "director",
    label: "Директор",
    description: "Повний доступ до всіх функцій, право підпису, управління командою",
    permissions: [
      "cabinet:settings", "cabinet:delete", "cabinet:archive",
      "team:view", "team:invite", "team:manage", "team:remove",
      "documents:view", "documents:create", "documents:edit", "documents:delete", "documents:approve", "documents:sign",
      "reports:view", "reports:generate", "reports:submit",
      "payments:view", "payments:approve", "payments:execute",
      "analytics:view", "analytics:export",
      "contractors:view", "contractors:manage",
      "employees:view", "employees:manage",
      "delegation:create", "delegation:receive",
    ],
    canDelegate: true,
    isOwnerRole: true,
    approvalWeight: 100,
    color: "purple",
  },
  {
    key: "chief-accountant",
    label: "Головний бухгалтер",
    description: "Облік, звітність, контроль фінансів, право другого підпису",
    permissions: [
      "team:view",
      "documents:view", "documents:create", "documents:edit", "documents:approve", "documents:sign",
      "reports:view", "reports:generate", "reports:submit",
      "payments:view", "payments:approve", "payments:execute",
      "analytics:view", "analytics:export",
      "contractors:view", "contractors:manage",
      "employees:view", "employees:manage",
      "delegation:create", "delegation:receive",
    ],
    canDelegate: true,
    isOwnerRole: false,
    approvalWeight: 80,
    color: "blue",
  },
  {
    key: "accountant",
    label: "Бухгалтер",
    description: "Облік, створення документів та звітів",
    permissions: [
      "team:view",
      "documents:view", "documents:create", "documents:edit", "documents:approve",
      "reports:view", "reports:generate",
      "payments:view", "payments:approve",
      "analytics:view",
      "contractors:view", "contractors:manage",
      "employees:view",
      "delegation:receive",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 50,
    color: "green",
  },
  {
    key: "lawyer",
    label: "Юрист",
    description: "Перевірка договорів, правова експертиза",
    permissions: [
      "team:view",
      "documents:view", "documents:create", "documents:edit", "documents:approve",
      "analytics:view",
      "contractors:view", "contractors:manage",
      "delegation:receive",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 60,
    color: "orange",
  },
  {
    key: "hr",
    label: "HR/Кадри",
    description: "Управління персоналом, кадрові документи",
    permissions: [
      "team:view",
      "documents:view", "documents:create", "documents:edit",
      "employees:view", "employees:manage",
      "delegation:receive",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 40,
    color: "pink",
  },
  {
    key: "warehouse",
    label: "Комірник",
    description: "Складський облік, ТТН, інвентаризація",
    permissions: [
      "documents:view", "documents:create", "documents:edit",
      "contractors:view",
      "delegation:receive",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 20,
    color: "cyan",
  },
  {
    key: "auditor",
    label: "Аудитор",
    description: "Перегляд усіх даних без права редагування",
    permissions: [
      "team:view",
      "documents:view",
      "reports:view",
      "payments:view",
      "analytics:view", "analytics:export",
      "contractors:view",
      "employees:view",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 0,
    color: "gray",
  },
];

const fopRoles: RoleDefinition[] = [
  {
    key: "owner",
    label: "Власник",
    description: "Повний доступ до всіх функцій ФОП",
    permissions: [
      "cabinet:settings", "cabinet:delete", "cabinet:archive",
      "team:view", "team:invite", "team:manage", "team:remove",
      "documents:view", "documents:create", "documents:edit", "documents:delete", "documents:approve", "documents:sign",
      "reports:view", "reports:generate", "reports:submit",
      "payments:view", "payments:approve", "payments:execute",
      "analytics:view", "analytics:export",
      "contractors:view", "contractors:manage",
      "delegation:create", "delegation:receive",
    ],
    canDelegate: true,
    isOwnerRole: true,
    approvalWeight: 100,
    color: "purple",
  },
  {
    key: "accountant",
    label: "Бухгалтер",
    description: "Ведення обліку та звітності",
    permissions: [
      "team:view",
      "documents:view", "documents:create", "documents:edit", "documents:approve",
      "reports:view", "reports:generate", "reports:submit",
      "payments:view", "payments:approve",
      "analytics:view",
      "contractors:view", "contractors:manage",
      "delegation:receive",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 60,
    color: "blue",
  },
  {
    key: "auditor",
    label: "Аудитор",
    description: "Перегляд даних для перевірки",
    permissions: [
      "documents:view",
      "reports:view",
      "payments:view",
      "analytics:view", "analytics:export",
      "contractors:view",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 0,
    color: "gray",
  },
];

const fopGroupRoles: RoleDefinition[] = [
  {
    key: "group-admin",
    label: "Адміністратор групи",
    description: "Управління всіма ФОП у групі",
    permissions: [
      "cabinet:settings", "cabinet:archive",
      "team:view", "team:invite", "team:manage", "team:remove",
      "documents:view", "documents:create", "documents:edit", "documents:approve",
      "reports:view", "reports:generate",
      "payments:view", "payments:approve",
      "analytics:view", "analytics:export",
      "contractors:view", "contractors:manage",
      "delegation:create", "delegation:receive",
    ],
    canDelegate: true,
    isOwnerRole: true,
    approvalWeight: 100,
    color: "purple",
  },
  {
    key: "group-accountant",
    label: "Бухгалтер групи",
    description: "Ведення обліку для всіх ФОП групи",
    permissions: [
      "team:view",
      "documents:view", "documents:create", "documents:edit", "documents:approve",
      "reports:view", "reports:generate", "reports:submit",
      "payments:view", "payments:approve",
      "analytics:view",
      "contractors:view", "contractors:manage",
      "delegation:receive",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 60,
    color: "blue",
  },
  {
    key: "viewer",
    label: "Перегляд",
    description: "Тільки перегляд даних",
    permissions: [
      "documents:view",
      "reports:view",
      "payments:view",
      "analytics:view",
      "contractors:view",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 0,
    color: "gray",
  },
];

const individualRoles: RoleDefinition[] = [
  {
    key: "owner",
    label: "Власник",
    description: "Повний доступ до особистого кабінету",
    permissions: [
      "cabinet:settings", "cabinet:delete", "cabinet:archive",
      "team:view", "team:invite", "team:manage",
      "documents:view", "documents:create", "documents:edit", "documents:delete", "documents:sign",
      "reports:view", "reports:generate", "reports:submit",
      "analytics:view", "analytics:export",
      "delegation:create",
    ],
    canDelegate: true,
    isOwnerRole: true,
    approvalWeight: 100,
    color: "purple",
  },
  {
    key: "consultant",
    label: "Податковий консультант",
    description: "Консультування та підготовка звітності",
    permissions: [
      "team:view",
      "documents:view", "documents:create", "documents:edit",
      "reports:view", "reports:generate",
      "analytics:view",
      "delegation:receive",
    ],
    canDelegate: false,
    isOwnerRole: false,
    approvalWeight: 50,
    color: "blue",
  },
];

export const rolesByType: Record<CabinetType, RoleDefinition[]> = {
  tov: tovRoles,
  fop: fopRoles,
  "fop-group": fopGroupRoles,
  individual: individualRoles,
};

// ============ Helper Functions ============

export const getRolesForCabinetType = (cabinetType: CabinetType): RoleDefinition[] => {
  return rolesByType[cabinetType] || [];
};

export const getRoleDefinition = (roleKey: string, cabinetType: CabinetType): RoleDefinition | undefined => {
  const roles = getRolesForCabinetType(cabinetType);
  return roles.find(r => r.key === roleKey);
};

export const hasPermission = (roleKey: string, permission: PermissionKey, cabinetType: CabinetType): boolean => {
  const role = getRoleDefinition(roleKey, cabinetType);
  return role?.permissions.includes(permission) ?? false;
};

export const getPermissionsForRole = (roleKey: string, cabinetType: CabinetType): PermissionKey[] => {
  const role = getRoleDefinition(roleKey, cabinetType);
  return role?.permissions || [];
};

export const getPermissionLabel = (permissionKey: PermissionKey): string => {
  for (const group of permissionGroups) {
    const permission = group.permissions.find(p => p.key === permissionKey);
    if (permission) {
      return `${group.label}: ${permission.label}`;
    }
  }
  return permissionKey;
};

export const groupPermissionsByCategory = (permissions: PermissionKey[]): Record<string, PermissionKey[]> => {
  const grouped: Record<string, PermissionKey[]> = {};
  
  for (const group of permissionGroups) {
    const matchedPermissions = group.permissions
      .filter(p => permissions.includes(p.key))
      .map(p => p.key);
    
    if (matchedPermissions.length > 0) {
      grouped[group.id] = matchedPermissions;
    }
  }
  
  return grouped;
};

// ============ Role Colors for UI ============

export const roleColorClasses: Record<RoleDefinition["color"], { bg: string; text: string; border: string }> = {
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  pink: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" },
  cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
  yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-800" },
  gray: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-800" },
};
