import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Clock, MapPin, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";

interface MemberSessionsCardProps {
  member: ExtendedTeamMember;
}

// Mock sessions data
const getMockSessions = (memberId: string) => [
  {
    id: "session-1",
    device: "desktop" as const,
    browser: "Chrome 120",
    os: "Windows 11",
    ip: "192.168.1.100",
    location: "Київ, Україна",
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "session-2",
    device: "mobile" as const,
    browser: "Safari",
    os: "iOS 17",
    ip: "10.0.0.15",
    location: "Київ, Україна",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
  },
  {
    id: "session-3",
    device: "desktop" as const,
    browser: "Firefox 121",
    os: "macOS Sonoma",
    ip: "192.168.2.50",
    location: "Львів, Україна",
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isCurrent: false,
  },
];

export const MemberSessionsCard = ({ member }: MemberSessionsCardProps) => {
  const sessions = getMockSessions(member.id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            Останні сесії
          </CardTitle>
          <Badge variant="secondary">
            {sessions.length} {sessions.length === 1 ? "сесія" : "сесій"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              session.isCurrent && "border-green-500/50 bg-green-50/50 dark:bg-green-950/10"
            )}
          >
            <div className={cn(
              "p-2 rounded-full",
              session.isCurrent 
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            )}>
              {session.device === "desktop" ? (
                <Monitor className="h-4 w-4" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{session.browser}</p>
                {session.isCurrent && (
                  <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Поточна
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{session.os}</p>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {session.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true, locale: uk })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
