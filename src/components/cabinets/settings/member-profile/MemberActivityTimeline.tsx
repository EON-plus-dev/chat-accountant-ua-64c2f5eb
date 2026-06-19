import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, UserPlus, Shield, ArrowRightLeft, LogIn, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  getTeamAuditLogForCabinet, 
  auditActionLabels,
  type TeamAuditEntry,
  type TeamAuditAction,
} from "@/config/teamMembersConfig";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";

interface MemberActivityTimelineProps {
  member: ExtendedTeamMember;
  cabinetId: string;
  maxItems?: number;
}

const actionIcons: Partial<Record<TeamAuditAction, typeof UserPlus>> = {
  member_invited: UserPlus,
  member_activated: LogIn,
  role_changed: Shield,
  permissions_updated: Edit,
  delegation_created: ArrowRightLeft,
  delegation_revoked: ArrowRightLeft,
};

const actionColors: Partial<Record<TeamAuditAction, string>> = {
  member_invited: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  member_activated: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  role_changed: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  permissions_updated: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  delegation_created: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  delegation_revoked: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

export const MemberActivityTimeline = ({ 
  member, 
  cabinetId,
  maxItems = 10,
}: MemberActivityTimelineProps) => {
  const allAuditLog = getTeamAuditLogForCabinet(cabinetId);
  
  // Filter to only entries related to this member
  const memberAuditLog = allAuditLog.filter(entry => 
    entry.actorId === member.userId || entry.targetId === member.userId
  );

  const displayedEntries = memberAuditLog.slice(0, maxItems);

  const renderEntry = (entry: TeamAuditEntry) => {
    const Icon = actionIcons[entry.action] || History;
    const colorClass = actionColors[entry.action] || "bg-muted text-muted-foreground";
    const isActor = entry.actorId === member.userId;

    return (
      <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
        {/* Timeline Line */}
        <div className="flex flex-col items-center">
          <div className={cn("p-1.5 rounded-full", colorClass)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="w-px flex-1 bg-border mt-1" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-4">
          <p className="text-sm">
            {isActor ? (
              <>
                <span className="font-medium">{entry.actorName}</span>
                {" "}
                <span className="text-muted-foreground">{auditActionLabels[entry.action]}</span>
                {entry.targetName && (
                  <>
                    {" "}
                    <span className="font-medium">{entry.targetName}</span>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="font-medium">{entry.actorName}</span>
                {" "}
                <span className="text-muted-foreground">{auditActionLabels[entry.action]}</span>
                {" "}
                <span className="font-medium">{member.name}</span>
              </>
            )}
          </p>
          
          {entry.details && (
            <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
          )}
          
          {entry.oldValue && entry.newValue && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {entry.oldValue}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="outline" className="text-xs">
                {entry.newValue}
              </Badge>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: uk })}
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
            <History className="h-4 w-4 text-muted-foreground" />
            Історія активності
          </CardTitle>
          {memberAuditLog.length > 0 && (
            <Badge variant="secondary">
              {memberAuditLog.length} {memberAuditLog.length === 1 ? "запис" : "записів"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {displayedEntries.length > 0 ? (
          <div>
            {displayedEntries.map(renderEntry)}
          </div>
        ) : (
          <div className="text-center py-6">
            <History className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Немає записів активності
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
