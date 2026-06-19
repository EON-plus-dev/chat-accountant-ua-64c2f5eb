import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Shield, 
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamInvitation } from "@/config/teamMembersConfig";
import type { RoleDefinition, PermissionKey } from "@/config/teamRolesConfig";
import { permissionGroups, roleColorClasses } from "@/config/teamRolesConfig";

interface RoleReviewStepProps {
  invitation: TeamInvitation;
  roleDefinition: RoleDefinition | null;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  onAgreedToTermsChange: (value: boolean) => void;
  onAgreedToPrivacyChange: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export const RoleReviewStep = ({ 
  invitation, 
  roleDefinition,
  agreedToTerms,
  agreedToPrivacy,
  onAgreedToTermsChange,
  onAgreedToPrivacyChange,
  onNext, 
  onBack 
}: RoleReviewStepProps) => {
  const colorClasses = roleDefinition 
    ? roleColorClasses[roleDefinition.color] 
    : roleColorClasses.blue;
  
  // Group permissions by category
  const groupedPermissions: { group: typeof permissionGroups[0]; has: PermissionKey[]; missing: PermissionKey[] }[] = [];
  
  if (roleDefinition) {
    for (const group of permissionGroups) {
      const has: PermissionKey[] = [];
      const missing: PermissionKey[] = [];
      
      for (const perm of group.permissions) {
        if (roleDefinition.permissions.includes(perm.key)) {
          has.push(perm.key);
        } else {
          missing.push(perm.key);
        }
      }
      
      if (has.length > 0 || missing.length > 0) {
        groupedPermissions.push({ group, has, missing });
      }
    }
  }
  
  const isValid = agreedToTerms && agreedToPrivacy;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Перегляд ролі та дозволів</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Ознайомтесь з вашими можливостями в кабінеті
        </p>
      </div>
      
      {/* Role info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Ваша роль</CardTitle>
            <Badge 
              variant="outline" 
              className={cn(
                "text-sm px-3 py-1",
                colorClasses.bg,
                colorClasses.text,
                colorClasses.border
              )}
            >
              {invitation.roleLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {roleDefinition && (
            <p className="text-sm text-muted-foreground">
              {roleDefinition.description}
            </p>
          )}
          
          {roleDefinition?.canDelegate && (
            <div className="mt-3 flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ця роль може делегувати повноваження</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Permissions breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ваші дозволи</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {groupedPermissions.filter(g => g.has.length > 0).map(({ group, has }) => (
              <div key={group.id}>
                <h4 className="text-sm font-medium mb-2">{group.label}</h4>
                <div className="flex flex-wrap gap-2">
                  {group.permissions
                    .filter(p => has.includes(p.key))
                    .map(perm => (
                      <div 
                        key={perm.key}
                        className="flex items-center gap-1.5 text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {perm.label}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Access type */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Тип доступу</p>
              <p className="text-xs text-muted-foreground">
                {invitation.accessType === "full" && "Повний доступ до всіх функцій ролі"}
                {invitation.accessType === "limited" && "Обмежений доступ до деяких функцій"}
                {invitation.accessType === "readonly" && "Лише перегляд, без можливості редагування"}
              </p>
            </div>
            <Badge variant={invitation.accessType === "full" ? "default" : "secondary"}>
              {invitation.accessType === "full" && "Повний"}
              {invitation.accessType === "limited" && "Обмежений"}
              {invitation.accessType === "readonly" && "Тільки перегляд"}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Agreements */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox 
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => onAgreedToTermsChange(checked === true)}
            />
            <label 
              htmlFor="terms" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              Я ознайомився з обов'язками ролі "{invitation.roleLabel}" та приймаю{" "}
              <a href="#" className="text-primary underline">умови використання</a> системи
            </label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox 
              id="privacy"
              checked={agreedToPrivacy}
              onCheckedChange={(checked) => onAgreedToPrivacyChange(checked === true)}
            />
            <label 
              htmlFor="privacy" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              Я надаю згоду на обробку персональних даних відповідно до{" "}
              <a href="#" className="text-primary underline">політики конфіденційності</a>
            </label>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="gap-2">
          Прийняти та продовжити
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
