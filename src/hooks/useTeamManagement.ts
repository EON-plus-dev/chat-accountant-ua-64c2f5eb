import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCabinetMembers } from "@/hooks/useCabinetMembers";
import type { Cabinet } from "@/types/cabinet";
import type { PermissionKey, RoleDefinition } from "@/config/teamRolesConfig";
import { getRolesForCabinetType } from "@/config/teamRolesConfig";
import {
  type ExtendedTeamMember,
  type TeamInvitation,
  type TeamAuditEntry,
  getExtendedTeamMembersForCabinet,
  getInvitationsForCabinet,
  getTeamAuditLogForCabinet,
} from "@/config/teamMembersConfig";
import {
  notifyMemberInvited,
  notifyRoleChanged,
  notifyMemberRemoved,
  notifyPermissionsUpdated,
} from "@/lib/teamNotificationService";

// ============ Hook Return Type ============

interface UseTeamManagementReturn {
  // Team data
  members: ExtendedTeamMember[];
  activeMembers: ExtendedTeamMember[];
  invitedMembers: ExtendedTeamMember[];
  invitations: TeamInvitation[];
  pendingInvitations: TeamInvitation[];
  auditLog: TeamAuditEntry[];
  
  // Actions (demo: toast + local state)
  inviteMember: (email: string, role: string, message?: string) => void;
  updateMemberRole: (memberId: string, newRole: string) => void;
  removeMember: (memberId: string) => void;
  suspendMember: (memberId: string) => void;
  reactivateMember: (memberId: string) => void;
  updateMemberPermissions: (
    memberId: string, 
    customPermissions: PermissionKey[], 
    restrictedPermissions: PermissionKey[]
  ) => void;
  resendInvitation: (invitationId: string) => void;
  cancelInvitation: (invitationId: string) => void;
  
  // Helpers
  getMemberById: (id: string) => ExtendedTeamMember | undefined;
  getAvailableRoles: () => RoleDefinition[];
  isLoading: boolean;
}

// ============ Hook Implementation ============

export const useTeamManagement = (cabinet: Cabinet): UseTeamManagementReturn => {
  const [isLoading] = useState(false);
  const { getRecipientsExcept } = useCabinetMembers(cabinet.id);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Get data from config
  const members = useMemo(() => {
    return getExtendedTeamMembersForCabinet(cabinet.id);
  }, [cabinet.id]);
  
  const activeMembers = useMemo(() => {
    return members.filter(m => m.status === "active");
  }, [members]);
  
  const invitedMembers = useMemo(() => {
    return members.filter(m => m.status === "invited");
  }, [members]);
  
  const invitations = useMemo(() => {
    return getInvitationsForCabinet(cabinet.id);
  }, [cabinet.id]);
  
  const pendingInvitations = useMemo(() => {
    return invitations.filter(inv => inv.status === "pending");
  }, [invitations]);
  
  const auditLog = useMemo(() => {
    return getTeamAuditLogForCabinet(cabinet.id);
  }, [cabinet.id]);
  
  // Actions
  const inviteMember = useCallback((email: string, role: string, message?: string) => {
    const roleLabel = getRolesForCabinetType(cabinet.type).find(r => r.key === role)?.label || role;
    
    toast.success("Запрошення надіслано", {
      description: `Запрошення на роль надіслано на ${email}`,
    });
    
    // TODO: invitee user_id is unknown until they accept and a row in cabinet_members is created.
    // Notify existing team members (except initiator) about the new invitation.
    notifyMemberInvited(
      cabinet.id,
      cabinet.name,
      getRecipientsExcept(currentUserId),
      "Поточний користувач",
      email,
      roleLabel
    );
  }, [cabinet.id, cabinet.name, cabinet.type, getRecipientsExcept, currentUserId]);
  
  const updateMemberRole = useCallback((memberId: string, newRole: string) => {
    const member = members.find(m => m.id === memberId || m.userId === memberId);
    const oldRoleLabel = member?.roleLabel || "";
    const newRoleLabel = getRolesForCabinetType(cabinet.type).find(r => r.key === newRole)?.label || newRole;
    
    if (member) {
      toast.success("Роль змінено", {
        description: `Роль ${member.name} змінено на ${newRoleLabel}`,
      });
      
      notifyRoleChanged(
        cabinet.id,
        cabinet.name,
        getRecipientsExcept(currentUserId),
        member.name,
        oldRoleLabel,
        newRoleLabel
      );
    }
  }, [members, cabinet.id, cabinet.name, cabinet.type, getRecipientsExcept, currentUserId]);
  
  const removeMember = useCallback((memberId: string) => {
    const member = members.find(m => m.id === memberId || m.userId === memberId);
    if (member) {
      toast.success("Учасника видалено", {
        description: `${member.name} видалено з кабінету`,
      });
      
      notifyMemberRemoved(
        cabinet.id,
        cabinet.name,
        getRecipientsExcept(currentUserId),
        member.name,
        "Поточний користувач"
      );
    }
  }, [members, cabinet.id, cabinet.name, getRecipientsExcept, currentUserId]);
  
  const suspendMember = useCallback((memberId: string) => {
    const member = members.find(m => m.id === memberId || m.userId === memberId);
    if (member) {
      toast.success("Доступ призупинено", {
        description: `Доступ ${member.name} призупинено`,
      });
    }
  }, [members]);
  
  const reactivateMember = useCallback((memberId: string) => {
    const member = members.find(m => m.id === memberId || m.userId === memberId);
    if (member) {
      toast.success("Доступ відновлено", {
        description: `Доступ ${member.name} відновлено`,
      });
    }
  }, [members]);
  
  const updateMemberPermissions = useCallback((
    memberId: string,
    customPermissions: PermissionKey[],
    restrictedPermissions: PermissionKey[]
  ) => {
    const member = members.find(m => m.id === memberId || m.userId === memberId);
    if (member) {
      toast.success("Дозволи оновлено", {
        description: `Дозволи ${member.name} оновлено`,
      });
      
      notifyPermissionsUpdated(
        cabinet.id,
        cabinet.name,
        getRecipientsExcept(currentUserId),
        member.name
      );
    }
  }, [members, cabinet.id, cabinet.name, getRecipientsExcept, currentUserId]);
  
  const resendInvitation = useCallback((invitationId: string) => {
    toast.success("Запрошення надіслано повторно");
  }, []);
  
  const cancelInvitation = useCallback((invitationId: string) => {
    toast.success("Запрошення скасовано");
  }, []);
  
  // Helpers
  const getMemberById = useCallback((id: string): ExtendedTeamMember | undefined => {
    return members.find(m => m.id === id || m.userId === id);
  }, [members]);
  
  const getAvailableRoles = useCallback((): RoleDefinition[] => {
    return getRolesForCabinetType(cabinet.type);
  }, [cabinet.type]);
  
  return {
    members,
    activeMembers,
    invitedMembers,
    invitations,
    pendingInvitations,
    auditLog,
    inviteMember,
    updateMemberRole,
    removeMember,
    suspendMember,
    reactivateMember,
    updateMemberPermissions,
    resendInvitation,
    cancelInvitation,
    getMemberById,
    getAvailableRoles,
    isLoading,
  };
};
