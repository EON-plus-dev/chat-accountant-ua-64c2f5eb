import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Edit, Crown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoleDefinition, roleColorClasses } from "@/config/teamRolesConfig";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";
import type { CabinetType } from "@/types/cabinet";

interface MemberRoleCardProps {
  member: ExtendedTeamMember;
  cabinetType: CabinetType;
  canManageTeam?: boolean;
  onEditRole?: () => void;
}

export const MemberRoleCard = ({ 
  member, 
  cabinetType, 
  canManageTeam,
  onEditRole,
}: MemberRoleCardProps) => {
  const roleDef = getRoleDefinition(member.role, cabinetType);
  const roleColors = roleDef ? roleColorClasses[roleDef.color] : roleColorClasses.gray;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Роль у кабінеті
          </CardTitle>
          {canManageTeam && !roleDef?.isOwnerRole && (
            <Button variant="outline" size="sm" onClick={onEditRole} className="gap-1">
              <Edit className="h-3.5 w-3.5" />
              Змінити
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Badge */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          roleColors.bg, roleColors.border
        )}>
          <div className={cn("p-2 rounded-full", roleColors.bg)}>
            {roleDef?.isOwnerRole ? (
              <Crown className={cn("h-5 w-5", roleColors.text)} />
            ) : (
              <Shield className={cn("h-5 w-5", roleColors.text)} />
            )}
          </div>
          <div>
            <p className={cn("font-semibold", roleColors.text)}>{member.roleLabel}</p>
            {roleDef && (
              <p className="text-sm text-muted-foreground">{roleDef.description}</p>
            )}
          </div>
        </div>

        {/* Role Properties */}
        {roleDef && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className={cn(
                "h-4 w-4",
                roleDef.canDelegate ? "text-green-600" : "text-muted-foreground"
              )} />
              <span className={roleDef.canDelegate ? "" : "text-muted-foreground"}>
                {roleDef.canDelegate ? "Може делегувати права" : "Не може делегувати права"}
              </span>
            </div>
            
            {roleDef.isOwnerRole && (
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-amber-600" />
                <span>Роль власника кабінету</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Вага погодження:</span>
              <span className="font-medium">{roleDef.approvalWeight}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
