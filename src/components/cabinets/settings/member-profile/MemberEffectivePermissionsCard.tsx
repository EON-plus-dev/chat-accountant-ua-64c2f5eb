import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRightLeft, Circle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getPermissionsForRole,
  getPermissionLabel,
  groupPermissionsByCategory,
  permissionGroups,
  type PermissionKey,
} from "@/config/teamRolesConfig";
import { getActiveDelegationsToUser } from "@/config/delegationsConfig";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";
import type { CabinetType } from "@/types/cabinet";

interface MemberEffectivePermissionsCardProps {
  member: ExtendedTeamMember;
  cabinetType: CabinetType;
  cabinetId: string;
}

type PermissionWithSource = {
  key: PermissionKey;
  source: "role" | "custom" | "delegation";
  sourceName?: string;
};

export const MemberEffectivePermissionsCard = ({ 
  member, 
  cabinetType,
  cabinetId,
}: MemberEffectivePermissionsCardProps) => {
  // Calculate effective permissions
  const basePermissions = getPermissionsForRole(member.role, cabinetType);
  const customPermissions = member.customPermissions || [];
  const restrictedPermissions = member.restrictedPermissions || [];
  const activeDelegations = getActiveDelegationsToUser(member.userId, cabinetId);

  // Build effective permissions with sources
  const permissionsWithSources: PermissionWithSource[] = [];

  // Add base permissions (excluding restricted)
  for (const perm of basePermissions) {
    if (!restrictedPermissions.includes(perm)) {
      permissionsWithSources.push({ key: perm, source: "role" });
    }
  }

  // Add custom permissions (excluding already added)
  for (const perm of customPermissions) {
    if (!permissionsWithSources.some(p => p.key === perm)) {
      permissionsWithSources.push({ key: perm, source: "custom" });
    }
  }

  // Add delegated permissions
  for (const delegation of activeDelegations) {
    const delegatedPerms = delegation.delegatedPermissions === "all"
      ? getPermissionsForRole(delegation.delegatorRole, cabinetType)
      : delegation.delegatedPermissions;

    for (const perm of delegatedPerms) {
      if (!permissionsWithSources.some(p => p.key === perm)) {
        permissionsWithSources.push({ 
          key: perm, 
          source: "delegation",
          sourceName: delegation.delegatorName,
        });
      }
    }
  }

  // Group by category
  const grouped = groupPermissionsByCategory(permissionsWithSources.map(p => p.key));

  const getSourceIcon = (source: PermissionWithSource["source"]) => {
    switch (source) {
      case "role":
        return <Circle className="h-2 w-2 fill-green-500 text-green-500" />;
      case "custom":
        return <User className="h-2 w-2 text-blue-500" />;
      case "delegation":
        return <ArrowRightLeft className="h-2 w-2 text-amber-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Ефективні права
          </CardTitle>
          <Badge variant="secondary">
            {permissionsWithSources.length} прав
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pb-2 border-b">
          <div className="flex items-center gap-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            <span>Від ролі</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-2 w-2 text-blue-500" />
            <span>Індивідуальні</span>
          </div>
          {activeDelegations.length > 0 && (
            <div className="flex items-center gap-1">
              <ArrowRightLeft className="h-2 w-2 text-amber-500" />
              <span>Делеговані</span>
            </div>
          )}
        </div>

        {/* Permission Groups */}
        {Object.entries(grouped).map(([groupId, permissions]) => {
          const group = permissionGroups.find(g => g.id === groupId);
          if (!group) return null;

          return (
            <div key={groupId} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {permissions.map((permKey) => {
                  const permWithSource = permissionsWithSources.find(p => p.key === permKey);
                  if (!permWithSource) return null;

                  const permDef = group.permissions.find(p => p.key === permKey);

                  return (
                    <Badge 
                      key={permKey} 
                      variant="outline" 
                      className="gap-1 text-xs py-0.5"
                    >
                      {getSourceIcon(permWithSource.source)}
                      {permDef?.label || permKey}
                    </Badge>
                  );
                })}
              </div>
            </div>
          );
        })}

        {permissionsWithSources.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Учасник не має жодних прав
          </p>
        )}
      </CardContent>
    </Card>
  );
};
