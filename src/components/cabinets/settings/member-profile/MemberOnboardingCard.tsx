import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Calendar, User, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";

interface MemberOnboardingCardProps {
  member: ExtendedTeamMember;
}

export const MemberOnboardingCard = ({ member }: MemberOnboardingCardProps) => {
  const daysInTeam = member.activatedAt 
    ? differenceInDays(new Date(), new Date(member.activatedAt))
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            Приєднання
          </CardTitle>
          <Badge 
            variant={member.onboardingCompleted ? "default" : "outline"}
            className={cn(
              member.onboardingCompleted 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : ""
            )}
          >
            {member.onboardingCompleted ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Завершено
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                В процесі
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Invited By */}
        {member.invitedByName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Запросив:</span>
            <span className="font-medium">{member.invitedByName}</span>
          </div>
        )}

        {/* Invited At */}
        {member.invitedAt && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Дата запрошення:</span>
            <span>{format(new Date(member.invitedAt), "d MMMM yyyy", { locale: uk })}</span>
          </div>
        )}

        {/* Activated At */}
        {member.activatedAt && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">Дата активації:</span>
            <span>{format(new Date(member.activatedAt), "d MMMM yyyy", { locale: uk })}</span>
          </div>
        )}

        {/* Days in Team */}
        {daysInTeam !== null && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Днів у команді:</span>
              <span className="text-lg font-bold tabular-nums">{daysInTeam}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
