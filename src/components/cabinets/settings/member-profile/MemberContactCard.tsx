import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";

interface MemberContactCardProps {
  member: ExtendedTeamMember;
}

export const MemberContactCard = ({ member }: MemberContactCardProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопійовано`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Контактна інформація
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Email */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm truncate">{member.email}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 shrink-0"
            onClick={() => copyToClipboard(member.email, "Email")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Phone */}
        {member.phone && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{member.phone}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 shrink-0"
              onClick={() => copyToClipboard(member.phone!, "Телефон")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Last Active */}
        {member.lastActive && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Остання активність: </span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true, locale: uk })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
