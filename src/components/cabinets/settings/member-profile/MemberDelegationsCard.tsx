import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, ArrowRight, Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getDelegationsFromUser, 
  getDelegationsToUser,
  getDelegationStatusInfo,
  formatDelegationPeriod,
  type Delegation,
} from "@/config/delegationsConfig";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";

interface MemberDelegationsCardProps {
  member: ExtendedTeamMember;
  cabinetId: string;
  canDelegate?: boolean;
  onCreateDelegation?: () => void;
}

export const MemberDelegationsCard = ({ 
  member, 
  cabinetId,
  canDelegate,
  onCreateDelegation,
}: MemberDelegationsCardProps) => {
  const delegationsFrom = getDelegationsFromUser(member.userId, cabinetId);
  const delegationsTo = getDelegationsToUser(member.userId, cabinetId);

  const allDelegations = [
    ...delegationsFrom.map(d => ({ ...d, direction: "from" as const })),
    ...delegationsTo.map(d => ({ ...d, direction: "to" as const })),
  ].filter(d => d.status === "active" || d.status === "scheduled");

  const renderDelegation = (delegation: Delegation & { direction: "from" | "to" }) => {
    const statusInfo = getDelegationStatusInfo(delegation);
    const period = formatDelegationPeriod(delegation);
    
    return (
      <div 
        key={delegation.id}
        className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
      >
        <div className={cn(
          "p-1.5 rounded-full shrink-0",
          delegation.direction === "from" 
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        )}>
          <ArrowRightLeft className="h-3.5 w-3.5" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {delegation.direction === "from" 
                ? `→ ${delegation.delegateName}` 
                : `← від ${delegation.delegatorName}`
              }
            </span>
            <Badge 
              variant="outline" 
              className={cn("text-xs", statusInfo.color)}
            >
              {statusInfo.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {period}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {typeof delegation.delegatedPermissions === "string" 
              ? "Усі права"
              : `${delegation.delegatedPermissions.length} прав`
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            Делегування
          </CardTitle>
          {canDelegate && (
            <Button variant="outline" size="sm" onClick={onCreateDelegation} className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Делегувати
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {allDelegations.length > 0 ? (
          <div className="space-y-2">
            {allDelegations.map(renderDelegation)}
          </div>
        ) : (
          <div className="text-center py-4">
            <ArrowRightLeft className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Немає активних або запланованих делегувань
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
