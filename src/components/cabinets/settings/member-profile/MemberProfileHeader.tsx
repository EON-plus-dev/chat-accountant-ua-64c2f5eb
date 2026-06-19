import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  MoreVertical, 
  Edit, 
  ArrowRightLeft, 
  UserX, 
  Trash2,
  CheckCircle,
  Clock,
  Ban,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";
import { getRoleDefinition, roleColorClasses, type RoleDefinition } from "@/config/teamRolesConfig";
import type { CabinetType } from "@/types/cabinet";

interface MemberProfileHeaderProps {
  member: ExtendedTeamMember;
  cabinetType: CabinetType;
  onBack: () => void;
  canManageTeam: boolean;
  canDelegate: boolean;
  isOwner: boolean;
  onEditRole?: () => void;
  onDelegate?: () => void;
  onSuspend?: () => void;
  onRemove?: () => void;
}

const statusConfig: Record<ExtendedTeamMember["status"], { 
  label: string; 
  icon: typeof CheckCircle; 
  className: string 
}> = {
  active: { 
    label: "Активний", 
    icon: CheckCircle, 
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
  },
  invited: { 
    label: "Запрошено", 
    icon: Clock, 
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700" 
  },
  suspended: { 
    label: "Призупинено", 
    icon: Ban, 
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" 
  },
  left: { 
    label: "Покинув", 
    icon: UserX, 
    className: "bg-muted text-muted-foreground" 
  },
};

export const MemberProfileHeader = ({
  member,
  cabinetType,
  onBack,
  canManageTeam,
  canDelegate,
  isOwner,
  onEditRole,
  onDelegate,
  onSuspend,
  onRemove,
}: MemberProfileHeaderProps) => {
  const roleDef = getRoleDefinition(member.role, cabinetType);
  const roleColors = roleDef ? roleColorClasses[roleDef.color] : roleColorClasses.gray;
  const status = statusConfig[member.status];
  const StatusIcon = status.icon;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isCurrentMemberOwner = roleDef?.isOwnerRole ?? false;

  return (
    <div className="space-y-4">
      {/* Navigation Row */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад до команди
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canManageTeam && (
              <DropdownMenuItem onClick={onEditRole}>
                <Edit className="h-4 w-4 mr-2" />
                Змінити роль / дозволи
              </DropdownMenuItem>
            )}
            {canDelegate && (
              <DropdownMenuItem onClick={onDelegate}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Делегувати права
              </DropdownMenuItem>
            )}
            {canManageTeam && !isCurrentMemberOwner && (
              <>
                <DropdownMenuSeparator />
                {member.status === "active" && (
                  <DropdownMenuItem 
                    onClick={() => {
                      onSuspend?.();
                      toast.info("Призупинення доступу (demo)");
                    }}
                    className="text-orange-600"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Призупинити доступ
                  </DropdownMenuItem>
                )}
                {member.status === "suspended" && (
                  <DropdownMenuItem 
                    onClick={() => toast.info("Відновлення доступу (demo)")}
                    className="text-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Відновити доступ
                  </DropdownMenuItem>
                )}
                {isOwner && (
                  <DropdownMenuItem 
                    onClick={() => {
                      onRemove?.();
                      toast.info("Видалення учасника (demo)");
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Видалити з команди
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Info */}
      <div className="flex items-start gap-4">
        <Avatar className={cn("h-16 w-16", roleColors.bg)}>
          <AvatarFallback className={cn("text-xl font-semibold", roleColors.text)}>
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{member.name}</h2>
          {member.position && (
            <p className="text-muted-foreground">{member.position}</p>
          )}
          
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className={cn("gap-1", status.className)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            
            {member.kepConfigured && (
              <Badge variant="outline" className="gap-1 border-green-500/50 text-green-700 dark:text-green-400">
                <Key className="h-3 w-3" />
                КЕП
              </Badge>
            )}
            
            <Badge className={cn(roleColors.bg, roleColors.text)}>
              {member.roleLabel}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
