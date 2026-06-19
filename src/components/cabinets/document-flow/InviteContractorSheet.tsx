import { useState, useEffect } from "react";
import { Mail, Gift, Shield, CheckCircle2, Building2, User, Loader2, Link2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export interface ContractorPrefillData {
  name?: string;
  code?: string;           // ЄДРПОУ/ІПН
  email?: string;
  type?: "supplier" | "buyer" | "both";  // Unified with ContractorRole
  sourceDocument?: string; // ID документа-джерела
}

interface InviteContractorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillName?: string;
  prefillEmail?: string;
  prefillData?: ContractorPrefillData;
  cabinetName?: string;
  onInviteSent?: (email: string, name: string, code?: string, role?: "supplier" | "buyer" | "both") => void;
}

const contractorTypes = [
  { value: "supplier", label: "Постачальник", icon: Building2 },
  { value: "buyer", label: "Покупець", icon: User },
  { value: "both", label: "Постачальник і покупець", icon: Building2 },
];

export function InviteContractorSheet({
  open,
  onOpenChange,
  prefillName = "",
  prefillEmail = "",
  prefillData,
  cabinetName = "Ваш кабінет",
  onInviteSent,
}: InviteContractorSheetProps) {
  // Use prefillData if available, otherwise fall back to individual props
  const initialName = prefillData?.name || prefillName;
  const initialEmail = prefillData?.email || prefillEmail;
  const initialCode = prefillData?.code || "";
  const initialType = prefillData?.type || "buyer";

  const [email, setEmail] = useState(initialEmail);
  const [companyName, setCompanyName] = useState(initialName);
  const [companyCode, setCompanyCode] = useState(initialCode);
  const [contractorType, setContractorType] = useState<string>(initialType);
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form with prefillData when sheet opens
  useEffect(() => {
    if (open && prefillData) {
      setCompanyName(prefillData.name || "");
      setCompanyCode(prefillData.code || "");
      setEmail(prefillData.email || "");
      setContractorType(prefillData.type || "buyer");
    }
  }, [open, prefillData]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setEmail("");
      setCompanyName("");
      setCompanyCode("");
      setContractorType("buyer");
      setPersonalMessage("");
    }
  }, [open]);

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidCode = !companyCode || /^\d{8,10}$/.test(companyCode);
  const canSubmit = isValidEmail && companyName.trim() && isValidCode;

  // Generate demo invite URL
  const generateInviteToken = () => {
    return `inv_${Math.random().toString(36).substring(2, 10)}`;
  };
  
  const demoInviteUrl = `${window.location.origin}/contractor-onboarding?token=${generateInviteToken()}&from=${encodeURIComponent(cabinetName)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(demoInviteUrl);
    toast.success("Посилання скопійовано");
  };

  const handleOpenDemo = () => {
    window.open(demoInviteUrl, "_blank");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    
    toast.success("Запрошення надіслано!", {
      description: `${companyName} отримає лист на ${email}`,
    });

    onInviteSent?.(email, companyName, companyCode || undefined, contractorType as "supplier" | "buyer" | "both");
    onOpenChange(false);
    
    // Reset form
    setEmail("");
    setCompanyName("");
    setCompanyCode("");
    setContractorType("buyer");
    setPersonalMessage("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Запросити контрагента
          </SheetTitle>
          <SheetDescription>
            {prefillData?.sourceDocument 
              ? "Контрагента знайдено в документі — надішліть запрошення для синхронізації"
              : "Надішліть запрошення для синхронізації реквізитів"
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Bonus indicator */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-500/20">
              <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                +5K кредитів за запрошення
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                Отримайте бонус після реєстрації контрагента
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Назва компанії / ФОП *</Label>
              <Input
                id="company-name"
                placeholder="ТОВ «Приклад» або ФОП Іваненко"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            {/* ЄДРПОУ/ІПН field */}
            <div className="space-y-2">
              <Label htmlFor="company-code">ЄДРПОУ / ІПН</Label>
              <Input
                id="company-code"
                placeholder="12345678"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="font-mono"
              />
              {companyCode && !isValidCode && (
                <p className="text-xs text-destructive">
                  Код має містити 8-10 цифр
                </p>
              )}
              {companyCode && isValidCode && (
                <p className="text-xs text-muted-foreground">
                  {companyCode.length === 8 ? "ЄДРПОУ (юридична особа)" : companyCode.length === 10 ? "ІПН (фізична особа)" : ""}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email контрагента *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email && !isValidEmail && (
                <p className="text-xs text-destructive">
                  Введіть коректну email-адресу
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor-type">Тип контрагента</Label>
              <Select value={contractorType} onValueChange={setContractorType}>
                <SelectTrigger id="contractor-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contractorTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4 text-muted-foreground" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Особисте повідомлення (необов'язково)</Label>
              <Textarea
                id="message"
                placeholder="Додайте коментар до запрошення..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Demo invite link */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Демо-посилання для контрагента</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={demoInviteUrl}
                className="text-xs font-mono bg-muted/50"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleOpenDemo}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Контрагент перейде за цим посиланням для реєстрації через КЕП
            </p>
          </div>

          <Separator />

          {/* Benefits for contractor */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Що отримає контрагент:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm">
                  <strong>Безкоштовний доступ</strong> — пасивний кабінет без оплати
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm">
                  <strong>Швидка реєстрація</strong> — вхід через КЕП або вручну
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm">
                  <strong>Синхронізація реквізитів</strong> — завжди актуальні дані
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">
                  <strong>Захист даних</strong> — контроль над своїми реквізитами
                </span>
              </div>
            </div>
          </div>

          {/* Preview badge */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Превʼю запрошення:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Mail className="h-3 w-3" />
                {email || "email@company.com"}
              </Badge>
              <Badge variant="secondary">
                {contractorTypes.find(t => t.value === contractorType)?.label}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Скасувати
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Надсилання...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Надіслати запрошення
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
