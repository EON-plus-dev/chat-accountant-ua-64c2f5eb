import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  partnerUserId: string;
  initial: {
    payout_method?: "iban" | "card" | "manual" | null;
    payout_iban?: string | null;
    payout_card_last4?: string | null;
    payout_recipient_name?: string | null;
  };
  isDemo?: boolean;
  onSaved?: () => void;
}

const ibanRe = /^UA\d{27}$/;

export function PayoutMethodForm({ partnerUserId, initial, isDemo, onSaved }: Props) {
  const [method, setMethod] = useState<"iban" | "card" | "manual">(initial.payout_method || "iban");
  const [iban, setIban] = useState(initial.payout_iban || "");
  const [card, setCard] = useState(initial.payout_card_last4 || "");
  const [name, setName] = useState(initial.payout_recipient_name || "");
  const [busy, setBusy] = useState(false);

  const valid =
    name.trim().length >= 2 &&
    (method === "manual" ||
      (method === "iban" && ibanRe.test(iban.replace(/\s/g, ""))) ||
      (method === "card" && /^\d{4}$/.test(card)));

  const save = async () => {
    if (isDemo) {
      toast.info("Демо-режим: реквізити не зберігаються");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("partner_profiles")
      .update({
        payout_method: method,
        payout_iban: method === "iban" ? iban.replace(/\s/g, "") : null,
        payout_card_last4: method === "card" ? card : null,
        payout_recipient_name: name.trim(),
      })
      .eq("user_id", partnerUserId);
    setBusy(false);
    if (error) {
      toast.error("Не вдалося зберегти реквізити");
      return;
    }
    toast.success("Реквізити збережено");
    onSaved?.();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Реквізити для виплати
        </CardTitle>
        <CardDescription className="text-xs">
          Вкажіть, куди надсилати виплати комісій. Мінімальна сума виплати — 500 ₴.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={method} onValueChange={(v) => setMethod(v as "iban" | "card" | "manual")} className="grid grid-cols-3 gap-2">
          <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary">
            <RadioGroupItem value="iban" /> <span className="text-sm">IBAN</span>
          </Label>
          <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary">
            <RadioGroupItem value="card" /> <span className="text-sm">Картка</span>
          </Label>
          <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary">
            <RadioGroupItem value="manual" /> <span className="text-sm">Інше</span>
          </Label>
        </RadioGroup>

        <div className="grid gap-3">
          <div>
            <Label htmlFor="recipient">Отримувач</Label>
            <Input id="recipient" value={name} onChange={(e) => setName(e.target.value)} placeholder="ФОП Іваненко Олена Олегівна" />
          </div>
          {method === "iban" && (
            <div>
              <Label htmlFor="iban">IBAN (UA + 27 цифр)</Label>
              <Input id="iban" value={iban} onChange={(e) => setIban(e.target.value.toUpperCase())} placeholder="UA213223130000026007233566001" />
            </div>
          )}
          {method === "card" && (
            <div>
              <Label htmlFor="card">Останні 4 цифри картки</Label>
              <Input id="card" value={card} onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" maxLength={4} />
              <p className="text-[11px] text-muted-foreground mt-1">Повний номер передасте адміністратору окремо при першій виплаті.</p>
            </div>
          )}
          {method === "manual" && (
            <p className="text-xs text-muted-foreground">Адміністратор звʼяжеться з вами для уточнення способу виплати.</p>
          )}
        </div>

        <Button onClick={save} disabled={!valid || busy} size="sm">
          {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Зберегти реквізити
        </Button>
      </CardContent>
    </Card>
  );
}
