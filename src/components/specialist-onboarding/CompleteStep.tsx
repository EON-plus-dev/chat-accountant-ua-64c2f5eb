import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ArrowRight,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamInvitation } from "@/config/teamMembersConfig";
import type { RoleDefinition } from "@/config/teamRolesConfig";
import { roleColorClasses } from "@/config/teamRolesConfig";


interface ProfileFormData {
  fullName: string;
  phone: string;
  workEmail: string;
  position: string;
}

interface CompleteStepProps {
  invitation: TeamInvitation;
  roleDefinition: RoleDefinition | null;
  profileData: ProfileFormData;
  onComplete: () => void;
}

const quickActions = [
  { icon: FileText, label: "Переглянути документи", description: "Ознайомтесь з документами кабінету" },
  { icon: BarChart3, label: "Аналітика", description: "Перегляньте ключові показники" },
  { icon: Bell, label: "Налаштувати сповіщення", description: "Оберіть важливі для вас події" },
  { icon: Settings, label: "Налаштування профілю", description: "Персоналізуйте ваш досвід" },
];

export const CompleteStep = ({ 
  invitation, 
  roleDefinition,
  profileData,
  onComplete 
}: CompleteStepProps) => {
  const colorClasses = roleDefinition 
    ? roleColorClasses[roleDefinition.color] 
    : roleColorClasses.blue;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Вітаємо в команді!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ви успішно приєдналися до {invitation.cabinetName}
          </p>
        </div>
      </div>
      
      {/* Summary card */}
      <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold">Підсумок</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Кабінет:</span>
              <span className="font-medium">{invitation.cabinetName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ваша роль:</span>
              <Badge 
                variant="outline" 
                className={cn(
                  colorClasses.bg,
                  colorClasses.text,
                  colorClasses.border
                )}
              >
                {invitation.roleLabel}
              </Badge>
            </div>
            {profileData.fullName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Профіль:</span>
                <span className="font-medium">{profileData.fullName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Тип доступу:</span>
              <span className="font-medium">
                Повноцінний учасник команди
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Рівень:</span>
              <span className="font-medium">
                {invitation.accessType === "full" && "Повний доступ"}
                {invitation.accessType === "limited" && "Обмежений доступ"}
                {invitation.accessType === "readonly" && "Тільки перегляд"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick actions */}
      <div className="space-y-3">
        <h3 className="font-medium text-center">Перші кроки</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Main CTA */}
      <div className="flex justify-center">
        <Button size="lg" onClick={onComplete} className="gap-2 px-8">
          Перейти до кабінету
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
