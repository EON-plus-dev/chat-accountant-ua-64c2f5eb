import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, Key, Mail, Send, CheckCircle, AlertCircle,
  Loader2, User, Building2, Shield, FileCheck, FilePen, FileX, Info, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { rolesByType, type RoleDefinition } from "@/config/teamRolesConfig";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { isValidInviteCodeFormat, formatInviteCode } from "@/lib/inviteCodeGenerator";
import { supabase } from "@/integrations/supabase/client";

interface MemberJoinStepProps {
  onBack: () => void;
  onComplete: () => void;
}

type JoinMethod = 'code' | 'request';

// Get unique member roles (non-owner) from all cabinet types
const getMemberRoles = (): { value: string; label: string; description: string }[] => {
  const allRoles = new Map<string, RoleDefinition>();
  
  Object.values(rolesByType).forEach(roles => {
    roles.filter(r => !r.isOwnerRole).forEach(role => {
      if (!allRoles.has(role.key)) {
        allRoles.set(role.key, role);
      }
    });
  });
  
  return Array.from(allRoles.values()).map(role => ({
    value: role.key,
    label: role.label,
    description: role.description,
  }));
};

const ROLE_OPTIONS = getMemberRoles();

// Information block about member rights (collapsible)
const MemberRightsInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-muted/30 overflow-hidden">
        {/* Trigger - always visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold text-sm">Права учасника кабінету</span>
                {!isOpen && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Натисніть, щоб переглянути
                  </p>
                )}
              </div>
            </div>
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </button>
        </CollapsibleTrigger>
        
        {/* Content - collapsible */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t pt-4">
            {/* What member CAN do */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-green-600 dark:text-green-400">
                Що ви можете робити:
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  Переглядати документи та звіти
                </li>
                <li className="flex items-center gap-2">
                  <FilePen className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  Створювати та редагувати документи (в межах ролі)
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  Погоджувати документи (якщо дозволено роллю)
                </li>
              </ul>
            </div>
            
            {/* What member CANNOT do */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-destructive">
                Що недоступно без КЕП:
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <FileX className="w-3.5 h-3.5 text-destructive shrink-0" />
                  Підписання документів від імені власника
                </li>
                <li className="flex items-center gap-2">
                  <FileX className="w-3.5 h-3.5 text-destructive shrink-0" />
                  Подання звітності до ДПС
                </li>
                <li className="flex items-center gap-2">
                  <FileX className="w-3.5 h-3.5 text-destructive shrink-0" />
                  Управління налаштуваннями кабінету
                </li>
                <li className="flex items-center gap-2">
                  <FileX className="w-3.5 h-3.5 text-destructive shrink-0" />
                  Видалення інших учасників команди
                </li>
              </ul>
            </div>
            
            {/* Tip */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Власник може делегувати вам додаткові права після приєднання
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const MemberJoinStep = ({ onBack, onComplete }: MemberJoinStepProps) => {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  
  const [joinMethod, setJoinMethod] = useState<JoinMethod | null>(codeFromUrl ? 'code' : null);
  
  // Code entry state
  const [inviteCode, setInviteCode] = useState(codeFromUrl || "");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [codeResult, setCodeResult] = useState<{
    valid: boolean;
    cabinetName?: string;
    cabinetType?: string;
    role?: string;
    errorMessage?: string;
  } | null>(null);

  // Request access state
  const [ownerEmail, setOwnerEmail] = useState("");
  const [requestRole, setRequestRole] = useState("accountant");
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-validate if code came from URL
  useEffect(() => {
    if (codeFromUrl && isValidInviteCodeFormat(codeFromUrl)) {
      handleValidateCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle code input with formatting
  const handleCodeChange = (value: string) => {
    const formatted = formatInviteCode(value);
    setInviteCode(formatted);
    setCodeResult(null);
  };

  // Validate invite code against DB (RLS lets the invitee see their own invitation by email)
  const handleValidateCode = async () => {
    if (!isValidInviteCodeFormat(inviteCode)) {
      toast.error("Невірний формат коду. Формат: ABC-123-XYZ");
      return;
    }

    setIsValidatingCode(true);
    try {
      const { data, error } = await supabase
        .from("cabinet_invitations")
        .select("cabinet_name, cabinet_type, role, role_label, status, expires_at, invited_email")
        .eq("code", inviteCode)
        .maybeSingle();

      if (error) {
        console.error("[MemberJoinStep] validate error", error);
        setCodeResult({ valid: false, errorMessage: "Не вдалось перевірити код. Спробуйте ще раз." });
        return;
      }

      if (!data) {
        setCodeResult({ valid: false, errorMessage: "Запрошення не знайдено або не на вашу адресу email." });
        return;
      }

      if (data.status === "revoked") {
        setCodeResult({ valid: false, errorMessage: "Запрошення було скасовано." });
        return;
      }
      if (data.status === "accepted") {
        setCodeResult({ valid: false, errorMessage: "Це запрошення вже використано." });
        return;
      }
      if (new Date(data.expires_at) < new Date()) {
        setCodeResult({ valid: false, errorMessage: "Термін дії запрошення закінчився." });
        return;
      }

      setCodeResult({
        valid: true,
        cabinetName: data.cabinet_name,
        cabinetType: data.cabinet_type,
        role: data.role_label,
      });
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleAcceptInvitation = async () => {
    setIsAccepting(true);
    try {
      const { data, error } = await supabase.rpc("accept_cabinet_invitation", { _code: inviteCode });

      if (error) {
        console.error("[MemberJoinStep] accept error", error);
        toast.error("Не вдалось прийняти запрошення", { description: error.message });
        return;
      }

      const result = data as { ok: boolean; error?: string; already_member?: boolean } | null;

      if (!result?.ok) {
        const messages: Record<string, string> = {
          unauthenticated: "Увійдіть в обліковий запис, щоб прийняти запрошення.",
          not_found: "Запрошення не знайдено.",
          revoked: "Запрошення було скасовано.",
          already_accepted: "Це запрошення вже прийнято.",
          expired: "Термін дії запрошення закінчився.",
          wrong_email: "Запрошення надіслано на іншу email-адресу. Увійдіть під вірним акаунтом.",
        };
        toast.error(messages[result?.error ?? ""] ?? "Не вдалось прийняти запрошення");
        return;
      }

      if (result.already_member) {
        toast.success("Ви вже учасник цього кабінету");
      } else {
        toast.success("Запрошення прийнято! Переходимо до кабінету...");
      }
      setTimeout(onComplete, 1200);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSendRequest = async () => {
    if (!ownerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      toast.error("Введіть коректний email");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const roleLabel = ROLE_OPTIONS.find(r => r.value === requestRole)?.label || requestRole;
    toast.success(`Запит надіслано на ${ownerEmail}`);
    toast.info(`Ви запросили роль: ${roleLabel}`, { duration: 4000 });
    
    setIsSubmitting(false);
    setTimeout(onComplete, 1500);
  };

  // Render method selection
  if (!joinMethod) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] px-4 py-8">
        <div className="max-w-lg w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">
            Як ви отримали запрошення?
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Оберіть спосіб приєднання до кабінету
          </p>

          {/* Member rights info block */}
          <div className="mb-6">
            <MemberRightsInfo />
          </div>

          <div className="space-y-4">
            <Card
              className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
              onClick={() => setJoinMethod('code')}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">У мене є код запрошення</h3>
                    <p className="text-sm text-muted-foreground">
                      Введіть код, отриманий від власника кабінету
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex-1 h-px bg-border" />
              <span>або</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Card
              className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
              onClick={() => setJoinMethod('request')}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Запросити доступ у власника</h3>
                    <p className="text-sm text-muted-foreground">
                      Надіслати запит на email власника кабінету
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render code entry
  if (joinMethod === 'code') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] px-4 py-8">
        <div className="max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">
            Введіть код запрошення
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Код складається з букв та цифр
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Формат: ABC-123-XYZ
              </Label>
              <div className="flex gap-2">
                <Input
                  value={inviteCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="ABC-123-XYZ"
                  className="text-center text-lg tracking-wider font-mono uppercase"
                  maxLength={11}
                />
                <Button
                  onClick={handleValidateCode}
                  disabled={inviteCode.length < 11 || isValidatingCode}
                >
                  {isValidatingCode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Перевірити"
                  )}
                </Button>
              </div>
            </div>

            {/* Validation result */}
            {codeResult && (
              <Card
                className={cn(
                  "animate-in fade-in slide-in-from-top-2",
                  codeResult.valid
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-destructive/50 bg-destructive/10"
                )}
              >
                <CardContent className="p-4">
                  {codeResult.valid ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Запрошення знайдено!</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-background/80">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{codeResult.cabinetName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {codeResult.cabinetType}
                            </Badge>
                            <span>·</span>
                            <span>Роль: {codeResult.role}</span>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleAcceptInvitation} disabled={isAccepting}>
                        {isAccepting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Прийняти запрошення
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      <span>{codeResult.errorMessage ?? "Код недійсний або застарілий. Перевірте код та спробуйте знову."}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => setJoinMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render request access form
  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)] px-4 py-6">
      <div className="max-w-md w-full mx-auto flex-1">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          Запросити доступ
        </h2>
        <p className="text-muted-foreground mb-6">
          Власник кабінету отримає ваш запит на email
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="owner-email">Email власника кабінету</Label>
            <Input
              id="owner-email"
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Бажана роль</Label>
            <Select value={requestRole} onValueChange={setRequestRole}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Повідомлення (опціонально)</Label>
            <Textarea
              id="message"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Коротко опишіть, чому вам потрібен доступ..."
              rows={3}
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex items-start gap-2">
            <User className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Власник побачить ваше ім'я та email з профілю та зможе підтвердити або відхилити запит.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="max-w-md w-full mx-auto pt-6 mt-auto">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setJoinMethod(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleSendRequest}
            disabled={isSubmitting || !ownerEmail.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Надіслати запит
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
