import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, CheckCircle, XCircle, ShieldCheck, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";

interface MemberKEPStatusCardProps {
  member: ExtendedTeamMember;
  canManageTeam?: boolean;
}

export const MemberKEPStatusCard = ({ member, canManageTeam }: MemberKEPStatusCardProps) => {
  const isConfigured = member.kepConfigured;

  // Mock KEP details
  const kepDetails = isConfigured ? {
    provider: "ПриватБанк",
    type: "Файловий ключ",
    validUntil: "2025-12-31",
    isValid: true,
  } : null;

  const handleConfigureKep = () => {
    toast.info("Налаштування КЕП (demo)", {
      description: "Перейдіть до розділу КЕП та підписи"
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            Статус КЕП
          </CardTitle>
          <Badge 
            variant={isConfigured ? "default" : "outline"}
            className={cn(
              "gap-1",
              isConfigured 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : ""
            )}
          >
            {isConfigured ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Налаштовано
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Не налаштовано
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isConfigured && kepDetails ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Провайдер:</span>
              <span className="font-medium">{kepDetails.provider}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Тип:</span>
              <span>{kepDetails.type}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Дійсний до:</span>
              <span className={cn(
                kepDetails.isValid ? "text-green-600" : "text-destructive"
              )}>
                {new Date(kepDetails.validUntil).toLocaleDateString("uk-UA")}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <XCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Електронний підпис не налаштовано
            </p>
            {canManageTeam && (
              <Button variant="outline" size="sm" onClick={handleConfigureKep}>
                Налаштувати КЕП
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
