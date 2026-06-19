import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Grid3X3, 
  ChevronDown, 
  Save,
  X,
  Circle,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  permissionGroups, 
  getPermissionsForRole,
  type PermissionKey,
} from "@/config/teamRolesConfig";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";
import type { CabinetType } from "@/types/cabinet";

interface MemberPermissionsMatrixProps {
  member: ExtendedTeamMember;
  cabinetType: CabinetType;
  canManageTeam?: boolean;
  onSave?: (customPermissions: PermissionKey[], restrictedPermissions: PermissionKey[]) => void;
}

type PermissionSource = "base" | "custom" | "restricted" | "none";

export const MemberPermissionsMatrix = ({ 
  member, 
  cabinetType,
  canManageTeam,
  onSave,
}: MemberPermissionsMatrixProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const basePermissions = getPermissionsForRole(member.role, cabinetType);
  const [customPermissions, setCustomPermissions] = useState<PermissionKey[]>(
    member.customPermissions || []
  );
  const [restrictedPermissions, setRestrictedPermissions] = useState<PermissionKey[]>(
    member.restrictedPermissions || []
  );

  const getPermissionSource = (key: PermissionKey): PermissionSource => {
    if (restrictedPermissions.includes(key)) return "restricted";
    if (customPermissions.includes(key)) return "custom";
    if (basePermissions.includes(key)) return "base";
    return "none";
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  const handlePermissionToggle = (key: PermissionKey) => {
    if (!isEditing) return;
    
    const isBase = basePermissions.includes(key);
    const isCustom = customPermissions.includes(key);
    const isRestricted = restrictedPermissions.includes(key);

    if (isBase) {
      // Base permission: toggle restricted
      if (isRestricted) {
        setRestrictedPermissions(prev => prev.filter(p => p !== key));
      } else {
        setRestrictedPermissions(prev => [...prev, key]);
      }
    } else {
      // Non-base permission: toggle custom
      if (isCustom) {
        setCustomPermissions(prev => prev.filter(p => p !== key));
      } else {
        setCustomPermissions(prev => [...prev, key]);
      }
    }
  };

  const handleSave = () => {
    onSave?.(customPermissions, restrictedPermissions);
    setIsEditing(false);
    toast.success("Дозволи оновлено");
  };

  const handleCancel = () => {
    setCustomPermissions(member.customPermissions || []);
    setRestrictedPermissions(member.restrictedPermissions || []);
    setIsEditing(false);
  };

  const getSourceBadge = (source: PermissionSource) => {
    switch (source) {
      case "base":
        return <Circle className="h-3 w-3 fill-green-500 text-green-500" />;
      case "custom":
        return <Plus className="h-3 w-3 text-blue-500" />;
      case "restricted":
        return <Minus className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            Матриця дозволів
          </CardTitle>
          {canManageTeam && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Скасувати
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Зберегти
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Редагувати
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pb-2 border-b">
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            <span>Базові (роль)</span>
          </div>
          <div className="flex items-center gap-1">
            <Plus className="h-3 w-3 text-blue-500" />
            <span>Додаткові</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="h-3 w-3 text-destructive" />
            <span>Заборонені</span>
          </div>
        </div>

        {/* Permission Groups */}
        {permissionGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          const groupPermissions = group.permissions;
          const activeCount = groupPermissions.filter(p => {
            const source = getPermissionSource(p.key);
            return source === "base" || source === "custom";
          }).length;

          return (
            <Collapsible 
              key={group.id} 
              open={isExpanded}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                  <span className="font-medium text-sm">{group.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activeCount} / {groupPermissions.length}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 pt-1 space-y-1">
                {groupPermissions.map((permission) => {
                  const source = getPermissionSource(permission.key);
                  const isActive = source === "base" || source === "custom";

                  return (
                    <div 
                      key={permission.key}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        isEditing && "hover:bg-muted/50 cursor-pointer",
                        source === "restricted" && "opacity-50"
                      )}
                      onClick={() => handlePermissionToggle(permission.key)}
                    >
                      {isEditing ? (
                        <Checkbox 
                          checked={isActive}
                          disabled={false}
                          className="pointer-events-none"
                        />
                      ) : (
                        getSourceBadge(source)
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          !isActive && "text-muted-foreground"
                        )}>
                          {permission.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                      {!isEditing && getPermissionSource(permission.key) === "restricted" && (
                        <Badge variant="outline" className="text-xs text-destructive border-destructive/50">
                          Заборонено
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
};
