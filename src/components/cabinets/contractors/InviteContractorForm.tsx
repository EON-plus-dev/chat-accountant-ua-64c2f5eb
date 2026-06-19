import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Gift,
  Shield,
  CheckCircle2,
  Building2,
  User,
  Loader2,
  Link2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";

interface InviteContractorFormProps {
  cabinet: Cabinet;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const contractorTypes = [
  { value: "supplier", label: "Постачальник", icon: Building2 },
  { value: "buyer", label: "Покупець", icon: User },
  { value: "both", label: "Постачальник і покупець", icon: Building2 },
];

export const InviteContractorForm = ({
  cabinet,
  onSuccess,
  onCancel,
}: InviteContractorFormProps) => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [contractorType, setContractorType] = useState("buyer");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidCode = !companyCode || /^\d{8,10}$/.test(companyCode);
  const canSubmit = isValidEmail && companyName.trim() && isValidCode;

  // Generate demo invite URL
  const generateInviteToken = () => {
    return `inv_${Math.random().toString(36).substring(2, 10)}`;
  };

  const demoInviteUrl = `${window.location.origin}/contractor-onboarding?token=${generateInviteToken()}&from=${encodeURIComponent(cabinet.name)}`;

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
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);

    toast.success("Запрошення надіслано!", {
      description: `${companyName} отримає лист на ${email}`,
    });

    onSuccess?.();
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4 sm:px-6">
        <div className="space-y-6 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="company-code">ЄДРПОУ / ІПН</Label>
              <Input
                id="company-code"
                placeholder="12345678"
                value={companyCode}
                onChange={(e) =>
                  setCompanyCode(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="font-mono"
              />
              {companyCode && !isValidCode && (
                <p className="text-xs text-destructive">
                  Код має містити 8-10 цифр
                </p>
              )}
              {companyCode && isValidCode && (
                <p className="text-xs text-muted-foreground">
                  {companyCode.length === 8
                    ? "ЄДРПОУ (юридична особа)"
                    : companyCode.length === 10
                      ? "ІПН (фізична особа)"
                      : ""}
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
              <Label htmlFor="message">
                Особисте повідомлення (необов'язково)
              </Label>
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
              <Label className="text-sm font-medium">
                Посилання для контрагента
              </Label>
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
                  <strong>Безкоштовний доступ</strong> — пасивний кабінет без
                  оплати
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
                  <strong>Синхронізація реквізитів</strong> — завжди актуальні
                  дані
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">
                  <strong>Захист даних</strong> — контроль над своїми
                  реквізитами
                </span>
              </div>
            </div>
          </div>

          {/* Preview badge */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">
              Превʼю запрошення:
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <Mail className="h-3 w-3" />
                {email || "email@company.com"}
              </Badge>
              <Badge variant="secondary">
                {contractorTypes.find((t) => t.value === contractorType)?.label}
              </Badge>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="shrink-0 border-t p-4 sm:px-6 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
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
  );
};
