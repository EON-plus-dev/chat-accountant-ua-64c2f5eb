import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowRightLeft, Calendar, Activity } from "lucide-react";
import { differenceInDays } from "date-fns";
import type { Cabinet } from "@/types/cabinet";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";
import { useCabinetPermissions } from "@/hooks/useCabinetPermissions";
import { getDelegationsFromUser, getDelegationsToUser } from "@/config/delegationsConfig";

import { MemberProfileHeader } from "./member-profile/MemberProfileHeader";
import { MemberContactCard } from "./member-profile/MemberContactCard";
import { MemberDelegationsCard } from "./member-profile/MemberDelegationsCard";
import { MemberOnboardingCard } from "./member-profile/MemberOnboardingCard";
import { MemberRoleCard } from "./member-profile/MemberRoleCard";
import { MemberPermissionsMatrix } from "./member-profile/MemberPermissionsMatrix";
import { MemberEffectivePermissionsCard } from "./member-profile/MemberEffectivePermissionsCard";
import { MemberActivityTimeline } from "./member-profile/MemberActivityTimeline";
import { MemberSessionsCard } from "./member-profile/MemberSessionsCard";

interface MemberProfilePageProps {
  member: ExtendedTeamMember;
  cabinet: Cabinet;
  onBack: () => void;
  onOpenDelegationPanel?: () => void;
  onOpenPermissionsEditor?: () => void;
}

export const MemberProfilePage = ({
  member,
  cabinet,
  onBack,
  onOpenDelegationPanel,
  onOpenPermissionsEditor,
}: MemberProfilePageProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { canManageTeam, canDelegate, isOwner } = useCabinetPermissions(cabinet.id, cabinet.type);

  // Quick stats calculations
  const daysInTeam = member.activatedAt 
    ? differenceInDays(new Date(), new Date(member.activatedAt))
    : 0;

  const delegationsFrom = getDelegationsFromUser(member.userId, cabinet.id);
  const delegationsTo = getDelegationsToUser(member.userId, cabinet.id);
  const activeDelegationsCount = [...delegationsFrom, ...delegationsTo]
    .filter(d => d.status === "active" || d.status === "scheduled").length;

  // Mock stats
  const documentsProcessed = Math.floor(Math.random() * 100) + 20;
  const operationsCount = Math.floor(Math.random() * 50) + 10;

  return (
    <div className="space-y-5">
      {/* Header */}
      <MemberProfileHeader
        member={member}
        cabinetType={cabinet.type}
        onBack={onBack}
        canManageTeam={canManageTeam}
        canDelegate={canDelegate}
        isOwner={isOwner}
        onEditRole={onOpenPermissionsEditor}
        onDelegate={onOpenDelegationPanel}
      />

      {/* Quick Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{documentsProcessed}</p>
              <p className="text-xs text-muted-foreground">Документів</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{operationsCount}</p>
              <p className="text-xs text-muted-foreground">Операцій</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{activeDelegationsCount}</p>
              <p className="text-xs text-muted-foreground">Делегувань</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{daysInTeam}</p>
              <p className="text-xs text-muted-foreground">Днів у команді</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="permissions">Дозволи</TabsTrigger>
          <TabsTrigger value="activity">Активність</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <MemberContactCard member={member} />
          <MemberDelegationsCard
            member={member} 
            cabinetId={cabinet.id}
            canDelegate={canDelegate}
            onCreateDelegation={onOpenDelegationPanel}
          />
          <MemberOnboardingCard member={member} />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 mt-4">
          <MemberRoleCard 
            member={member} 
            cabinetType={cabinet.type}
            canManageTeam={canManageTeam}
            onEditRole={onOpenPermissionsEditor}
          />
          <MemberPermissionsMatrix 
            member={member} 
            cabinetType={cabinet.type}
            canManageTeam={canManageTeam}
          />
          <MemberEffectivePermissionsCard 
            member={member} 
            cabinetType={cabinet.type}
            cabinetId={cabinet.id}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <MemberActivityTimeline member={member} cabinetId={cabinet.id} />
          <MemberSessionsCard member={member} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberProfilePage;
