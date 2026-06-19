/**
 * InviteMasterSheet — демо-форма запрошення нового майстра до салону.
 * Локальний стейт; жодних змін у `salonMasterDelegations` чи `salonData`.
 */

import { useMemo, useState } from "react";
import { MailPlus, ShieldCheck, Briefcase, Users as UsersIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export type InviteContractKind = "employment" | "services";
export type InviteTermsKind = "revenue_split" | "workspace_rental" | "hybrid";
export type InviteBillingPayer = "cabinet_owner" | "delegate";

export interface PendingInvite {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  contractKind: InviteContractKind;
  termsKind?: InviteTermsKind;
  commissionPct?: number;
  rentMonthly?: number;
  position?: string;
  salaryMonthly?: number;
  billingPayer: InviteBillingPayer;
  invitedAt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onInvited: (inv: PendingInvite) => void;
}

export function InviteMasterSheet({ open, onOpenChange, onInvited }: Props) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contractKind, setContractKind] = useState<InviteContractKind>("services");
  const [termsKind, setTermsKind] = useState<InviteTermsKind>("revenue_split");
  const [commissionPct, setCommissionPct] = useState(50);
  const [rentMonthly, setRentMonthly] = useState(8000);
  const [position, setPosition] = useState("Майстер-перукар");
  const [salaryMonthly, setSalaryMonthly] = useState(18000);
  const [billingPayer, setBillingPayer] = useState<InviteBillingPayer>("cabinet_owner");
  const [note, setNote] = useState("");

  const reset = () => {
    setFullName(""); setEmail(""); setPhone("");
    setContractKind("services"); setTermsKind("revenue_split");
    setCommissionPct(50); setRentMonthly(8000);
    setPosition("Майстер-перукар"); setSalaryMonthly(18000);
    setBillingPayer("cabinet_owner"); setNote("");
  };

  const isValid = fullName.trim().length > 3 && /.+@.+\..+/.test(email);

  const summary = useMemo(() => {
    if (contractKind === "employment") {
      return `Трудовий договір · ${position} · ${salaryMonthly.toLocaleString("uk-UA")} ₴/міс`;
    }
    if (termsKind === "revenue_split") return `Договір послуг (ФОП) · комісія ${commissionPct}%`;
    if (termsKind === "workspace_rental") return `Договір оренди робочого місця · ${rentMonthly.toLocaleString("uk-UA")} ₴/міс`;
    return `Гібрид · ${commissionPct}% + ${rentMonthly.toLocaleString("uk-UA")} ₴/міс`;
  }, [contractKind, termsKind, commissionPct, rentMonthly, position, salaryMonthly]);

  const handleSubmit = () => {
    if (!isValid) return;
    const inv: PendingInvite = {
      id: `inv-demo-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      contractKind,
      termsKind: contractKind === "services" ? termsKind : undefined,
      commissionPct: contractKind === "services" && termsKind !== "workspace_rental" ? commissionPct : undefined,
      rentMonthly: contractKind === "services" && termsKind !== "revenue_split" ? rentMonthly : undefined,
      position: contractKind === "employment" ? position : undefined,
      salaryMonthly: contractKind === "employment" ? salaryMonthly : undefined,
      billingPayer,
      invitedAt: new Date().toISOString(),
    };
    onInvited(inv);
    toast({
      title: "Запрошення надіслано (демо)",
      description: `${inv.fullName} отримає лист із посиланням на реєстрацію.`,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MailPlus className="w-4 h-4" /> Запросити майстра
          </SheetTitle>
          <SheetDescription>
            Майстер отримає лист із пропозицією договору та посиланням на реєстрацію власного
            кабінету (КЕП / Дія.Підпис). Договір підпишеться після реєстрації.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-4">
          {/* Контактні дані */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Контактні дані
            </legend>
            <div className="space-y-1.5">
              <Label htmlFor="im-name">ПІБ майстра *</Label>
              <Input id="im-name" placeholder="Олена Петренко" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="im-email">Email *</Label>
                <Input id="im-email" type="email" placeholder="master@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="im-phone">Телефон</Label>
                <Input id="im-phone" placeholder="+380 67 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Тип договору */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Тип договору
            </legend>
            <RadioGroup value={contractKind} onValueChange={(v) => setContractKind(v as InviteContractKind)} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-start gap-2 rounded-md border bg-card p-3 cursor-pointer hover:bg-muted/40">
                <RadioGroupItem value="employment" id="im-emp" className="mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" /> Штатний</div>
                  <div className="text-[11px] text-muted-foreground">Трудовий, оклад / ставка</div>
                </div>
              </label>
              <label className="flex items-start gap-2 rounded-md border bg-card p-3 cursor-pointer hover:bg-muted/40">
                <RadioGroupItem value="services" id="im-svc" className="mt-0.5" />
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> ФОП — послуги</div>
                  <div className="text-[11px] text-muted-foreground">Комісія, оренда або гібрид</div>
                </div>
              </label>
            </RadioGroup>
          </fieldset>

          {/* Умови */}
          {contractKind === "employment" ? (
            <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="im-pos">Посада</Label>
                <Input id="im-pos" value={position} onChange={(e) => setPosition(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="im-sal">Ставка, ₴/міс</Label>
                <Input id="im-sal" type="number" min={0} step={500} value={salaryMonthly} onChange={(e) => setSalaryMonthly(Number(e.target.value))} />
              </div>
            </fieldset>
          ) : (
            <fieldset className="space-y-3">
              <div className="space-y-1.5">
                <Label>Модель розрахунку</Label>
                <Select value={termsKind} onValueChange={(v) => setTermsKind(v as InviteTermsKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue_split">Комісія від чека</SelectItem>
                    <SelectItem value="workspace_rental">Оренда робочого місця</SelectItem>
                    <SelectItem value="hybrid">Гібрид (комісія + оренда)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {termsKind !== "workspace_rental" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="im-comm">Комісія майстру, %</Label>
                    <Input id="im-comm" type="number" min={0} max={100} value={commissionPct} onChange={(e) => setCommissionPct(Number(e.target.value))} />
                  </div>
                )}
                {termsKind !== "revenue_split" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="im-rent">Оренда, ₴/міс</Label>
                    <Input id="im-rent" type="number" min={0} step={500} value={rentMonthly} onChange={(e) => setRentMonthly(Number(e.target.value))} />
                  </div>
                )}
              </div>
            </fieldset>
          )}

          {/* AI-білінг */}
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Хто оплачує AI-кредити
            </legend>
            <RadioGroup value={billingPayer} onValueChange={(v) => setBillingPayer(v as InviteBillingPayer)} className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 cursor-pointer hover:bg-muted/40 text-sm">
                <RadioGroupItem value="cabinet_owner" id="im-pay-own" /> Салон
              </label>
              <label className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 cursor-pointer hover:bg-muted/40 text-sm">
                <RadioGroupItem value="delegate" id="im-pay-del" /> Майстер
              </label>
            </RadioGroup>
          </fieldset>

          {/* Превʼю */}
          <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Превʼю запрошення
            </div>
            <div className="text-xs text-muted-foreground">Для: <span className="text-foreground">{fullName || "—"}</span> · {email || "—"}</div>
            <Badge variant="outline" className="text-[10px]">{summary}</Badge>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="im-note">Особистий коментар (необовʼязково)</Label>
            <Textarea id="im-note" rows={3} placeholder="Раді бачити вас у команді!" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="gap-1.5">
            <MailPlus className="w-4 h-4" /> Надіслати запрошення (демо)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
