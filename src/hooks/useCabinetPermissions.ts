import { useMemo } from "react";
import type { CabinetType } from "@/types/cabinet";
import { 
  type PermissionKey, 
  type RoleDefinition,
  getRoleDefinition, 
  getPermissionsForRole,
  hasPermission as checkPermission,
} from "@/config/teamRolesConfig";
import { 
  getExtendedTeamMembersForCabinet, 
  type ExtendedTeamMember 
} from "@/config/teamMembersConfig";
import { 
  getActiveDelegationsToUser, 
  type Delegation 
} from "@/config/delegationsConfig";

// ============ Hook Return Type ============

interface UseCabinetPermissionsReturn {
  // Current user info
  currentMember: ExtendedTeamMember | null;
  currentRole: RoleDefinition | null;
  
  // Permission checks
  hasPermission: (permission: PermissionKey) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  
  // Effective permissions (including delegated)
  basePermissions: PermissionKey[];
  delegatedPermissions: PermissionKey[];
  effectivePermissions: PermissionKey[];
  
  // Delegations
  activeDelegationsToMe: Delegation[];
  activeDelegationsFromMe: Delegation[];
  isDelegating: boolean;
  isReceivingDelegation: boolean;
  
  // UI helpers
  canInviteMembers: boolean;
  canManageRoles: boolean;
  canManageTeam: boolean;
  canSignDocuments: boolean;
  canSubmitReports: boolean;
  canDelegate: boolean;
  canEditCabinetSettings: boolean;
  isOwner: boolean;
}

// ============ Demo current user (for demo purposes) ============
// ⚠️ DEMO MODE: This is a demonstration system with fictitious data.
// All permissions are checked client-side for demo purposes only.
// 
// TODO: For production deployment:
// 1. Implement user authentication with Lovable Cloud
// 2. Create server-side RBAC with database tables and RLS policies
// 3. Replace this hardcoded ID with authenticated user from auth context
// 
// Security note: Client-side permission checks are acceptable here because
// there is no real data to protect. All data is mock/demo data.
const DEMO_CURRENT_USER_ID = "user-5"; // Director in demo data

// ============ Hook Implementation ============

export const useCabinetPermissions = (
  cabinetId: string, 
  cabinetType: CabinetType
): UseCabinetPermissionsReturn => {
  
  return useMemo(() => {
    // Get current user's membership in this cabinet
    const members = getExtendedTeamMembersForCabinet(cabinetId);
    const currentMember = members.find(m => m.userId === DEMO_CURRENT_USER_ID) || null;
    
    // Get role definition
    const currentRole = currentMember 
      ? getRoleDefinition(currentMember.role, cabinetType) || null
      : null;
    
    // Base permissions from role
    const basePermissions: PermissionKey[] = currentMember 
      ? getPermissionsForRole(currentMember.role, cabinetType)
      : [];
    
    // Add custom permissions (if any)
    const customPermissions = currentMember?.customPermissions || [];
    
    // Remove restricted permissions (if any)
    const restrictedPermissions = currentMember?.restrictedPermissions || [];
    
    // Get delegated permissions
    const activeDelegationsToMe = currentMember 
      ? getActiveDelegationsToUser(DEMO_CURRENT_USER_ID, cabinetId)
      : [];
    
    const delegatedPermissions: PermissionKey[] = [];
    for (const delegation of activeDelegationsToMe) {
      if (delegation.delegatedPermissions === "all") {
        // Get all permissions from delegator's role
        const delegatorPerms = getPermissionsForRole(delegation.delegatorRole, cabinetType);
        delegatedPermissions.push(...delegatorPerms);
      } else {
        delegatedPermissions.push(...delegation.delegatedPermissions);
      }
    }
    
    // Calculate effective permissions
    const allPermissions = [...basePermissions, ...customPermissions, ...delegatedPermissions];
    const effectivePermissions = [...new Set(allPermissions)]
      .filter(p => !restrictedPermissions.includes(p));
    
    // Get delegations from current user
    const activeDelegationsFromMe = members.length > 0
      ? getActiveDelegationsToUser(DEMO_CURRENT_USER_ID, cabinetId)
        .filter(d => d.delegatorId === DEMO_CURRENT_USER_ID)
      : [];
    
    // Permission check functions
    const hasPermission = (permission: PermissionKey): boolean => {
      return effectivePermissions.includes(permission);
    };
    
    const hasAnyPermission = (permissions: PermissionKey[]): boolean => {
      return permissions.some(p => effectivePermissions.includes(p));
    };
    
    const hasAllPermissions = (permissions: PermissionKey[]): boolean => {
      return permissions.every(p => effectivePermissions.includes(p));
    };
    
    // UI helper flags
    const canInviteMembers = hasPermission("team:invite");
    const canManageRoles = hasPermission("team:manage");
    const canManageTeam = hasAnyPermission(["team:manage", "team:remove"]);
    const canSignDocuments = hasPermission("documents:sign");
    const canSubmitReports = hasPermission("reports:submit");
    const canDelegate = currentRole?.canDelegate ?? false;
    const canEditCabinetSettings = hasPermission("cabinet:settings");
    const isOwner = currentRole?.isOwnerRole ?? false;
    
    return {
      currentMember,
      currentRole,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      basePermissions,
      delegatedPermissions: [...new Set(delegatedPermissions)],
      effectivePermissions,
      activeDelegationsToMe,
      activeDelegationsFromMe,
      isDelegating: activeDelegationsFromMe.length > 0,
      isReceivingDelegation: activeDelegationsToMe.length > 0,
      canInviteMembers,
      canManageRoles,
      canManageTeam,
      canSignDocuments,
      canSubmitReports,
      canDelegate,
      canEditCabinetSettings,
      isOwner,
    };
  }, [cabinetId, cabinetType]);
};

// ============ Simplified hook for quick permission checks ============

export const useHasPermission = (
  cabinetId: string,
  cabinetType: CabinetType,
  permission: PermissionKey
): boolean => {
  const { hasPermission } = useCabinetPermissions(cabinetId, cabinetType);
  return hasPermission(permission);
};
