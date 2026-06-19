import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, User, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateIpn, validateEmail, validateFullName, getFullNameValidationError } from "@/lib/validators";
import type { TeamInvitation } from "@/config/teamMembersConfig";

interface ProfileFormData {
  fullName: string;
  taxId: string;
  phone: string;
  workEmail: string;
  position: string;
}

interface ProfileStepProps {
  invitation: TeamInvitation;
  profileData: ProfileFormData;
  onProfileChange: (data: ProfileFormData) => void;
  onNext: () => void;
  onBack: () => void;
  autoFilledFields?: string[];
  authMethod?: "email" | "kep" | "diia" | null;
}

export const ProfileStep = ({ 
  invitation, 
  profileData, 
  onProfileChange, 
  onNext, 
  onBack,
  autoFilledFields = [],
  authMethod,
}: ProfileStepProps) => {
  const updateField = (field: keyof ProfileFormData, value: string) => {
    onProfileChange({ ...profileData, [field]: value });
  };
  
  const isTaxIdValid = profileData.taxId.length === 10 && validateIpn(profileData.taxId);
  const isTaxIdPartiallyValid = profileData.taxId.length > 0 && profileData.taxId.length < 10;
  
  // Full name validation with proper error message
  const fullNameError = useMemo(() => {
    if (!profileData.fullName || profileData.fullName.trim().length < 3) return null;
    return getFullNameValidationError(profileData.fullName);
  }, [profileData.fullName]);
  
  // Email validation
  const isEmailValid = profileData.workEmail ? validateEmail(profileData.workEmail) : false;
  const emailError = useMemo(() => {
    if (!profileData.workEmail) return null;
    return !validateEmail(profileData.workEmail) ? "Невірний формат email" : null;
  }, [profileData.workEmail]);
  
  const isValid = 
    validateFullName(profileData.fullName.trim()) && 
    isTaxIdValid &&
    isEmailValid;

  const isAutoFilled = (field: string) => autoFilledFields.includes(field);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Ваш профіль</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Заповніть інформацію для вашого профілю в кабінеті "{invitation.cabinetName}"
        </p>
      </div>
      
      {/* Auto-fill notification */}
      {autoFilledFields.length > 0 && (
        <Card className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Дані заповнено автоматично
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Інформацію отримано з вашого {authMethod === "kep" ? "електронного підпису" : "Дія.Підпису"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Form */}
      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fullName">
                ПІБ <span className="text-destructive">*</span>
              </Label>
              {isAutoFilled("fullName") && (
                <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  З підпису
                </Badge>
              )}
            </div>
            <div className="relative">
              <Input
                id="fullName"
                placeholder="Іваненко Олена Михайлівна"
                value={profileData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={cn(
                  isAutoFilled("fullName") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20",
                  fullNameError && "border-destructive pr-10"
                )}
              />
              {fullNameError && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {fullNameError 
                ? <span className="text-destructive">{fullNameError}</span>
                : "Повне ім'я українською (Прізвище Ім'я По батькові)"
              }
            </p>
          </div>
          
          {/* Tax ID (РНОКПП) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="taxId">
                РНОКПП (ІПН) <span className="text-destructive">*</span>
              </Label>
              {isAutoFilled("taxId") && (
                <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  З підпису
                </Badge>
              )}
            </div>
            <Input
              id="taxId"
              placeholder="1234567890"
              value={profileData.taxId}
              onChange={(e) => updateField("taxId", e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              className={cn(
                "font-mono",
                isAutoFilled("taxId") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20",
                profileData.taxId.length === 10 && !isTaxIdValid && "border-destructive"
              )}
            />
            <p className="text-xs text-muted-foreground">
              {isTaxIdPartiallyValid 
                ? `Введіть ще ${10 - profileData.taxId.length} цифр`
                : profileData.taxId.length === 10 && !isTaxIdValid
                  ? <span className="text-destructive">Невірний формат РНОКПП</span>
                  : "Індивідуальний податковий номер (10 цифр)"
              }
            </p>
          </div>
          
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Контактний телефон
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+380 __ ___ __ __"
              value={profileData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
          
          {/* Work Email */}
          <div className="space-y-2">
            <Label htmlFor="workEmail">
              Робочий email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="workEmail"
                type="email"
                placeholder="your.email@company.com"
                value={profileData.workEmail}
                onChange={(e) => updateField("workEmail", e.target.value)}
                className={cn(
                  emailError && "border-destructive pr-10",
                  profileData.workEmail && isEmailValid && "border-emerald-500"
                )}
              />
              {emailError && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
              {profileData.workEmail && isEmailValid && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {emailError 
                ? <span className="text-destructive">{emailError}</span>
                : "Може відрізнятись від email, на який надійшло запрошення"
              }
            </p>
          </div>
          
          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">
              Посада
            </Label>
            <Input
              id="position"
              placeholder="Наприклад: Бухгалтер"
              value={profileData.position}
              onChange={(e) => updateField("position", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ваша офіційна посада в компанії (якщо відрізняється від ролі)
            </p>
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
          Продовжити
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
