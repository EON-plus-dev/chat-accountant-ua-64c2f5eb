import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCabinetMembers } from "@/hooks/useCabinetMembers";
import type { PermissionKey } from "@/config/teamRolesConfig";
import {
  type Delegation,
  type DelegationReason,
  demoDelegations,
  getDelegationsForCabinet,
  getActiveDelegationsForCabinet,
  getScheduledDelegationsForCabinet,
  getDelegationsFromUser,
  getDelegationsToUser,
} from "@/config/delegationsConfig";
import { getExtendedTeamMembersForCabinet } from "@/config/teamMembersConfig";
import {
  notifyDelegationCreated,
  notifyDelegationRevoked,
} from "@/lib/teamNotificationService";

// ============ Input Types ============

export interface CreateDelegationInput {
  delegateId: string;
  delegatedPermissions: PermissionKey[] | "all";
  reason: DelegationReason;
  customReason?: string;
  validFrom: string;
  validUntil: string;
}

// ============ Hook Return Type ============

interface UseDelegationsReturn {
  // Delegation data
  allDelegations: Delegation[];
  activeDelegations: Delegation[];
  scheduledDelegations: Delegation[];
  expiredDelegations: Delegation[];
  revokedDelegations: Delegation[];
  
  // My delegations
  delegationsFromMe: Delegation[];
  delegationsToMe: Delegation[];
  
  // Actions (demo: update local state + toast)
  createDelegation: (data: CreateDelegationInput) => void;
  revokeDelegation: (delegationId: string, reason?: string) => void;
  
  // Helpers
  canCreateDelegation: boolean;
  getDelegationById: (id: string) => Delegation | undefined;
  isLoading: boolean;
}

// ============ Demo current user ============
const DEMO_CURRENT_USER_ID = "user-5";

// ============ Hook Implementation ============

export const useDelegations = (cabinetId: string): UseDelegationsReturn => {
  const [localDelegations, setLocalDelegations] = useState<Delegation[]>([]);
  const [isLoading] = useState(false);
  const { getRecipientsExcept } = useCabinetMembers(cabinetId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  const allDelegations = useMemo(() => {
    const configDelegations = getDelegationsForCabinet(cabinetId);
    return [...configDelegations, ...localDelegations];
  }, [cabinetId, localDelegations]);
  
  const activeDelegations = useMemo(() => {
    return getActiveDelegationsForCabinet(cabinetId);
  }, [cabinetId]);
  
  const scheduledDelegations = useMemo(() => {
    return getScheduledDelegationsForCabinet(cabinetId);
  }, [cabinetId]);
  
  const expiredDelegations = useMemo(() => {
    return allDelegations.filter(d => d.status === "expired");
  }, [allDelegations]);
  
  const revokedDelegations = useMemo(() => {
    return allDelegations.filter(d => d.status === "revoked");
  }, [allDelegations]);
  
  const delegationsFromMe = useMemo(() => {
    return getDelegationsFromUser(DEMO_CURRENT_USER_ID, cabinetId);
  }, [cabinetId]);
  
  const delegationsToMe = useMemo(() => {
    return getDelegationsToUser(DEMO_CURRENT_USER_ID, cabinetId);
  }, [cabinetId]);
  
  const createDelegation = useCallback((data: CreateDelegationInput) => {
    const members = getExtendedTeamMembersForCabinet(cabinetId);
    const currentMember = members.find(m => m.userId === DEMO_CURRENT_USER_ID);
    const delegateMember = members.find(m => m.userId === data.delegateId || m.id === data.delegateId);
    
    if (!currentMember || !delegateMember) {
      toast.error("Помилка: учасник не знайдений");
      return;
    }
    
    const reasonLabels: Record<DelegationReason, string> = {
      vacation: "Відпустка",
      "sick-leave": "Лікарняний",
      "business-trip": "Відрядження",
      maternity: "Декретна відпустка",
      training: "Навчання/курси",
      other: "Інша причина",
    };
    
    const newDelegation: Delegation = {
      id: `del-new-${Date.now()}`,
      cabinetId,
      delegatorId: DEMO_CURRENT_USER_ID,
      delegatorName: currentMember.name,
      delegatorRole: currentMember.role,
      delegatorRoleLabel: currentMember.roleLabel,
      delegateId: delegateMember.userId,
      delegateName: delegateMember.name,
      delegateRole: delegateMember.role,
      delegateRoleLabel: delegateMember.roleLabel,
      delegatedPermissions: data.delegatedPermissions,
      reason: data.reason,
      reasonLabel: reasonLabels[data.reason],
      customReason: data.customReason,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      status: new Date(data.validFrom) > new Date() ? "scheduled" : "active",
      createdAt: new Date().toISOString(),
    };
    
    setLocalDelegations(prev => [...prev, newDelegation]);
    toast.success(`Делегування для ${delegateMember.name} створено`);
    
    // Send team notification — delegate + cabinet members (except initiator)
    const recipients = Array.from(new Set([
      delegateMember.userId,
      ...getRecipientsExcept(currentUserId),
    ]));
    notifyDelegationCreated(
      cabinetId,
      "Кабінет",
      recipients,
      currentMember.name,
      delegateMember.name,
      new Date(data.validFrom).toLocaleDateString('uk-UA'),
      new Date(data.validUntil).toLocaleDateString('uk-UA'),
      reasonLabels[data.reason]
    );
  }, [cabinetId, getRecipientsExcept, currentUserId]);
  
  const revokeDelegation = useCallback((delegationId: string, reason?: string) => {
    const delegation = allDelegations.find(d => d.id === delegationId);
    
    toast.success("Делегування скасовано", {
      description: reason || "Делегування було достроково скасовано",
    });
    
    // Send team notification
    if (delegation) {
      const recipients = Array.from(new Set([
        delegation.delegateId,
        ...getRecipientsExcept(currentUserId),
      ]));
      notifyDelegationRevoked(
        cabinetId,
        "Кабінет",
        recipients,
        delegation.delegatorName,
        delegation.delegateName,
        reason || "Скасовано достроково"
      );
    }
  }, [allDelegations, cabinetId, getRecipientsExcept, currentUserId]);
  
  const getDelegationById = useCallback((id: string): Delegation | undefined => {
    return allDelegations.find(d => d.id === id);
  }, [allDelegations]);
  
  // Check if current user can create delegations (has delegation:create permission)
  const canCreateDelegation = useMemo(() => {
    const members = getExtendedTeamMembersForCabinet(cabinetId);
    const currentMember = members.find(m => m.userId === DEMO_CURRENT_USER_ID);
    // Director and chief-accountant can delegate
    return currentMember?.role === "director" || currentMember?.role === "chief-accountant" || currentMember?.role === "owner";
  }, [cabinetId]);
  
  return {
    allDelegations,
    activeDelegations,
    scheduledDelegations,
    expiredDelegations,
    revokedDelegations,
    delegationsFromMe,
    delegationsToMe,
    createDelegation,
    revokeDelegation,
    canCreateDelegation,
    getDelegationById,
    isLoading,
  };
};
