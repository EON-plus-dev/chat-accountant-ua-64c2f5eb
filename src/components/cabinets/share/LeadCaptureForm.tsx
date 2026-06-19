import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import { validateEdrpou, validateIpn, validateEmail, validatePhone } from "@/lib/validators";
import { saveLead } from "@/lib/share/shareLinks";
import { useToast } from "@/hooks/use-toast";

interface Props {
  cabinetId: string;
  cabinetName: string;
  onSuccess: () => void;
  onSkip?: () => void;
}

export function LeadCaptureForm({ cabinetId, cabinetName, onSuccess, onSkip }: Props) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    const codeTrim = code.trim();
    if (!codeTrim) {
      e.code = "Вкажіть ваш ІПН або ЄДРПОУ";
    } else if (!/^\d+$/.test(codeTrim)) {
      e.code = "Тільки цифри";
    } else if (codeTrim.length === 8) {
      if (!validateEdrpou(codeTrim)) e.code = "Невірна контрольна сума ЄДРПОУ";
    } else if (codeTrim.length === 10) {
      if (!validateIpn(codeTrim)) e.code = "Невірна контрольна сума ІПН";
    } else {
      e.code = "ІПН — 10 цифр, ЄДРПОУ — 8 цифр";
    }
    if (!email.trim()) {
      e.email = "Вкажіть email";
    } else if (!validateEmail(email.trim())) {
      e.email = "Некоректний email";
    }
    if (phone.trim() && !validatePhone(phone.trim())) {
      e.phone = "Формат: +380XXXXXXXXX";
    }
    if (companyName.trim() && companyName.trim().length > 200) {
      e.companyName = "Занадто довго (макс. 200)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      saveLead({
        cabinetId,
        code: code.trim(),
        companyName: companyName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        subscribeUpdates: subscribe,
      });
      toast({
        title: "Дякуємо!",
        description: `Ваші дані передано власнику кабінету ${cabinetName}.`,
      });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Представтеся, щоб отримати повні реквізити</h3>
        <p className="text-xs text-muted-foreground">
          IBAN, ПДВ-номер, юридична адреса та керівник доступні після введення ваших даних.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="lead-code" className="text-xs">
            Ваш ІПН або ЄДРПОУ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lead-code"
            inputMode="numeric"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="напр. 32855961 або 3184710691"
            className="font-mono tabular-nums"
            aria-invalid={!!errors.code}
          />
          {errors.code && <p className="text-[11px] text-destructive mt-1">{errors.code}</p>}
        </div>

        <div>
          <Label htmlFor="lead-company" className="text-xs">Назва компанії</Label>
          <Input
            id="lead-company"
            maxLength={200}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ТОВ «Назва» або ФОП Прізвище"
            aria-invalid={!!errors.companyName}
          />
          {errors.companyName && <p className="text-[11px] text-destructive mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <Label htmlFor="lead-email" className="text-xs">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lead-email"
            type="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.ua"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-[11px] text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="lead-phone" className="text-xs">Телефон (необов'язково)</Label>
          <Input
            id="lead-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380XXXXXXXXX"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-[11px] text-destructive mt-1">{errors.phone}</p>}
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
          <Checkbox
            checked={subscribe}
            onCheckedChange={(v) => setSubscribe(v === true)}
            className="mt-0.5"
          />
          <span>Повідомляти про зміни реквізитів та статусу платника ПДВ</span>
        </label>
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/40 rounded-md p-2">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>Ваші дані бачить лише власник кабінету. Третім особам не передаються.</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? "Надсилаємо…" : "Отримати реквізити →"}
        </Button>
        {onSkip && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Лише базові дані
          </Button>
        )}
      </div>
    </form>
  );
}
