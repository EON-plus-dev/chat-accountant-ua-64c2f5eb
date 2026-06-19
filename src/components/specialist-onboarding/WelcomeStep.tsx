import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Shield,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamInvitation } from "@/config/teamMembersConfig";
import type { RoleDefinition } from "@/config/teamRolesConfig";
import { roleColorClasses } from "@/config/teamRolesConfig";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface WelcomeStepProps {
  invitation: TeamInvitation;
  roleDefinition: RoleDefinition | null;
  onNext: () => void;
}

const benefits = [
  { icon: FileText, text: "Доступ до документообігу компанії" },
  { icon: BarChart3, text: "Перегляд аналітики та звітності" },
  { icon: Users, text: "Співпраця з командою в реальному часі" },
  { icon: Shield, text: "Захищене середовище з контролем доступу" },
];

export const WelcomeStep = ({ invitation, roleDefinition, onNext }: WelcomeStepProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  const colorClasses = roleDefinition 
    ? roleColorClasses[roleDefinition.color] 
    : roleColorClasses.blue;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Building2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Вас запрошують до кабінету
          </h1>
          <p className="text-lg text-muted-foreground">
            {invitation.cabinetName}
          </p>
        </div>
      </div>
      
      {/* Inviter info */}
      <Card className="border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(invitation.invitedByName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{invitation.invitedByName}</p>
              <p className="text-sm text-muted-foreground">{invitation.invitedByEmail}</p>
              
              {invitation.message && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm italic">
                  "{invitation.message}"
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-3">
                Запрошення надіслано{" "}
                {format(new Date(invitation.createdAt), "d MMMM yyyy", { locale: uk })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Role badge */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Вам пропонують роль:</p>
        <Badge 
          variant="outline" 
          className={cn(
            "text-base px-4 py-2",
            colorClasses.bg,
            colorClasses.text,
            colorClasses.border
          )}
        >
          {invitation.roleLabel}
        </Badge>
        {roleDefinition && (
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            {roleDefinition.description}
          </p>
        )}
      </div>
      
      {/* Benefits */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-medium mb-4">Що ви отримаєте:</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Expiration notice */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Запрошення дійсне до{" "}
          <span className="font-medium text-foreground">
            {format(new Date(invitation.expiresAt), "d MMMM yyyy", { locale: uk })}
          </span>
        </p>
      </div>
      
      {/* Action button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={onNext} className="gap-2 px-8">
          Прийняти запрошення
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
