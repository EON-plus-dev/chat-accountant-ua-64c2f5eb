import type { PermissionKey } from "./teamRolesConfig";

// ============ Delegation Interface ============

export interface Delegation {
  id: string;
  cabinetId: string;
  // Delegator (who delegates)
  delegatorId: string;
  delegatorName: string;
  delegatorRole: string;
  delegatorRoleLabel: string;
  // Delegate (who receives)
  delegateId: string;
  delegateName: string;
  delegateRole: string;
  delegateRoleLabel: string;
  // What is delegated
  delegatedPermissions: PermissionKey[] | "all"; // "all" = всі права ролі
  // Reason
  reason: DelegationReason;
  reasonLabel: string;
  customReason?: string;
  // Period
  validFrom: string;
  validUntil: string;
  // Status
  status: "active" | "scheduled" | "expired" | "revoked";
  // Metadata
  createdAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedByName?: string;
  revokeReason?: string;
}

// ============ Delegation Reasons ============

export type DelegationReason = 
  | "vacation" 
  | "sick-leave" 
  | "business-trip" 
  | "maternity" 
  | "training" 
  | "other";

export const delegationReasons: { value: DelegationReason; label: string; icon?: string }[] = [
  { value: "vacation", label: "Відпустка" },
  { value: "sick-leave", label: "Лікарняний" },
  { value: "business-trip", label: "Відрядження" },
  { value: "maternity", label: "Декретна відпустка" },
  { value: "training", label: "Навчання/курси" },
  { value: "other", label: "Інша причина" },
];

// ============ Demo Delegations ============

export const demoDelegations: Delegation[] = [
  {
    id: "del-1",
    cabinetId: "1",
    delegatorId: "user-5",
    delegatorName: "Шевченко Тарас Григорович",
    delegatorRole: "director",
    delegatorRoleLabel: "Директор",
    delegateId: "user-4",
    delegateName: "Коваленко Марія Дмитрівна",
    delegateRole: "chief-accountant",
    delegateRoleLabel: "Головний бухгалтер",
    delegatedPermissions: ["documents:sign", "reports:submit", "payments:execute"],
    reason: "vacation",
    reasonLabel: "Відпустка",
    validFrom: "2025-01-10T00:00:00",
    validUntil: "2025-01-24T23:59:59",
    status: "active",
    createdAt: "2025-01-08T12:00:00",
  },
  {
    id: "del-2",
    cabinetId: "1",
    delegatorId: "user-4",
    delegatorName: "Коваленко Марія Дмитрівна",
    delegatorRole: "chief-accountant",
    delegatorRoleLabel: "Головний бухгалтер",
    delegateId: "user-5",
    delegateName: "Шевченко Тарас Григорович",
    delegateRole: "director",
    delegateRoleLabel: "Директор",
    delegatedPermissions: "all",
    reason: "maternity",
    reasonLabel: "Декретна відпустка",
    validFrom: "2025-02-01T00:00:00",
    validUntil: "2025-08-01T23:59:59",
    status: "scheduled",
    createdAt: "2025-01-05T10:00:00",
  },
  {
    id: "del-3",
    cabinetId: "1",
    delegatorId: "user-5",
    delegatorName: "Шевченко Тарас Григорович",
    delegatorRole: "director",
    delegatorRoleLabel: "Директор",
    delegateId: "user-6",
    delegateName: "Петренко Ігор Васильович",
    delegateRole: "lawyer",
    delegateRoleLabel: "Юрист",
    delegatedPermissions: ["documents:sign"],
    reason: "business-trip",
    reasonLabel: "Відрядження",
    validFrom: "2024-12-01T00:00:00",
    validUntil: "2024-12-15T23:59:59",
    status: "expired",
    createdAt: "2024-11-28T14:00:00",
  },
  {
    id: "del-4",
    cabinetId: "1",
    delegatorId: "user-5",
    delegatorName: "Шевченко Тарас Григорович",
    delegatorRole: "director",
    delegatorRoleLabel: "Директор",
    delegateId: "user-4",
    delegateName: "Коваленко Марія Дмитрівна",
    delegateRole: "chief-accountant",
    delegateRoleLabel: "Головний бухгалтер",
    delegatedPermissions: ["documents:sign", "payments:execute"],
    reason: "sick-leave",
    reasonLabel: "Лікарняний",
    validFrom: "2024-10-01T00:00:00",
    validUntil: "2024-10-10T23:59:59",
    status: "revoked",
    createdAt: "2024-10-01T08:00:00",
    revokedAt: "2024-10-05T10:00:00",
    revokedBy: "user-5",
    revokedByName: "Шевченко Т.Г.",
    revokeReason: "Повернувся з лікарняного раніше",
  },
];

// ============ Helper Functions ============

export const getDelegationsForCabinet = (cabinetId: string): Delegation[] => {
  return demoDelegations.filter(d => d.cabinetId === cabinetId);
};

export const getActiveDelegationsForCabinet = (cabinetId: string): Delegation[] => {
  const now = new Date();
  return demoDelegations.filter(d => {
    if (d.cabinetId !== cabinetId) return false;
    if (d.status !== "active") return false;
    
    const validFrom = new Date(d.validFrom);
    const validUntil = new Date(d.validUntil);
    return now >= validFrom && now <= validUntil;
  });
};

export const getScheduledDelegationsForCabinet = (cabinetId: string): Delegation[] => {
  const now = new Date();
  return demoDelegations.filter(d => {
    if (d.cabinetId !== cabinetId) return false;
    if (d.status !== "scheduled" && d.status !== "active") return false;
    
    const validFrom = new Date(d.validFrom);
    return now < validFrom;
  });
};

export const getDelegationsFromUser = (userId: string, cabinetId: string): Delegation[] => {
  return demoDelegations.filter(d => d.cabinetId === cabinetId && d.delegatorId === userId);
};

export const getDelegationsToUser = (userId: string, cabinetId: string): Delegation[] => {
  return demoDelegations.filter(d => d.cabinetId === cabinetId && d.delegateId === userId);
};

export const getActiveDelegationsToUser = (userId: string, cabinetId: string): Delegation[] => {
  const now = new Date();
  return demoDelegations.filter(d => {
    if (d.cabinetId !== cabinetId || d.delegateId !== userId) return false;
    if (d.status !== "active") return false;
    
    const validFrom = new Date(d.validFrom);
    const validUntil = new Date(d.validUntil);
    return now >= validFrom && now <= validUntil;
  });
};

export const getEffectivePermissionsFromDelegations = (
  userId: string, 
  cabinetId: string, 
  delegatorPermissions: Record<string, PermissionKey[]>
): PermissionKey[] => {
  const activeDelegations = getActiveDelegationsToUser(userId, cabinetId);
  const additionalPermissions: PermissionKey[] = [];
  
  for (const delegation of activeDelegations) {
    if (delegation.delegatedPermissions === "all") {
      // Get all permissions from delegator's role
      const delegatorPerms = delegatorPermissions[delegation.delegatorRole] || [];
      additionalPermissions.push(...delegatorPerms);
    } else {
      additionalPermissions.push(...delegation.delegatedPermissions);
    }
  }
  
  // Remove duplicates
  return [...new Set(additionalPermissions)];
};

// ============ Delegation Status Helpers ============

export const getDelegationStatusInfo = (delegation: Delegation): { 
  label: string; 
  color: "green" | "blue" | "gray" | "red";
  description: string;
} => {
  const now = new Date();
  const validFrom = new Date(delegation.validFrom);
  const validUntil = new Date(delegation.validUntil);
  
  if (delegation.status === "revoked") {
    return { 
      label: "Скасовано", 
      color: "red", 
      description: delegation.revokeReason || "Делегування скасовано" 
    };
  }
  
  if (now < validFrom) {
    return { 
      label: "Заплановано", 
      color: "blue", 
      description: `Почнеться ${validFrom.toLocaleDateString("uk-UA")}` 
    };
  }
  
  if (now > validUntil) {
    return { 
      label: "Завершено", 
      color: "gray", 
      description: `Завершилось ${validUntil.toLocaleDateString("uk-UA")}` 
    };
  }
  
  return { 
    label: "Активне", 
    color: "green", 
    description: `До ${validUntil.toLocaleDateString("uk-UA")}` 
  };
};

// ============ Format Delegation Period ============

export const formatDelegationPeriod = (delegation: Delegation): string => {
  const from = new Date(delegation.validFrom).toLocaleDateString("uk-UA", { 
    day: "numeric", 
    month: "short" 
  });
  const until = new Date(delegation.validUntil).toLocaleDateString("uk-UA", { 
    day: "numeric", 
    month: "short",
    year: "numeric"
  });
  return `${from} — ${until}`;
};
