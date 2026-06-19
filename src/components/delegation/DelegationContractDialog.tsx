import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, FileSignature } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cabinetId: string;
  cabinetOwnerUserId: string;
  delegateUserId: string;
  delegateKind: "partner_company" | "individual";
  /** Called after a contract is created in 'pending_sign' status. */
  onCreated?: (contractId: string) => void;
}

export function DelegationContractDialog(props: Props) {
  const qc = useQueryClient();
  const [contractKind, setContractKind] = useState<
    "services" | "employment" | "partner_outsourcing"
  >(props.delegateKind === "partner_company" ? "partner_outsourcing" : "services");
  const [contractNumber, setContractNumber] = useState("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [serviceFeeTerms, setServiceFeeTerms] = useState("");
  const [billingPayer, setBillingPayer] = useState<"cabinet_owner" | "delegate">(
    "cabinet_owner"
  );
  const [allowOverride, setAllowOverride] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("delegation_contracts")
        .insert({
          cabinet_id: props.cabinetId,
          cabinet_owner_user_id: props.cabinetOwnerUserId,
          delegate_kind: props.delegateKind,
          delegate_user_id: props.delegateUserId,
          contract_kind: contractKind,
          contract_number: contractNumber || null,
          valid_until: validUntil || null,
          service_fee_terms: serviceFeeTerms || null,
          terms: { allow_payer_override: allowOverride, billing_payer: billingPayer },
          status: "pending_sign",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => {
      toast.success("Договір створено. Очікує підпису.");
      qc.invalidateQueries({ queryKey: ["delegation_contracts", props.cabinetId] });
      props.onCreated?.(id);
      props.onOpenChange(false);
    },
    onError: (e: Error) => toast.error("Помилка: " + e.message),
  });

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Договір делегування
          </DialogTitle>
          <DialogDescription>
            Підстава для надання доступу до кабінету. Платник AI-кредитів — обов'язкова
            умова договору.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Тип договору</Label>
            <Select value={contractKind} onValueChange={(v) => setContractKind(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {props.delegateKind === "partner_company" && (
                  <SelectItem value="partner_outsourcing">
                    Аутсорсинг (партнер-компанія)
                  </SelectItem>
                )}
                <SelectItem value="services">Договір надання послуг</SelectItem>
                <SelectItem value="employment">Трудовий договір</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Номер</Label>
              <Input
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="№ 12/2026"
              />
            </div>
            <div>
              <Label>Діє до</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Умови оплати послуг/праці (поза AI-кредитами)</Label>
            <Textarea
              value={serviceFeeTerms}
              onChange={(e) => setServiceFeeTerms(e.target.value)}
              placeholder="Напр.: 5 000 грн/міс, оплата до 5 числа"
              rows={2}
            />
          </div>

          <div className="rounded-lg border-2 border-primary/20 p-3 space-y-3">
            <Label className="font-semibold">Хто платить за AI-кредити?</Label>
            <RadioGroup
              value={billingPayer}
              onValueChange={(v) => setBillingPayer(v as any)}
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem value="cabinet_owner" id="payer-owner" />
                <div className="grid gap-1">
                  <Label htmlFor="payer-owner" className="font-normal">
                    Я — власник кабінету
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Безпечно: ви контролюєте витрати. Делегат не може запустити
                    AI-операцію без вашого балансу.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="delegate" id="payer-delegate" />
                <div className="grid gap-1">
                  <Label htmlFor="payer-delegate" className="font-normal">
                    Делегована сторона
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Зручно для аутсорсингу: AI-витрати йдуть з гаманця партнера/співробітника.
                  </p>
                </div>
              </div>
            </RadioGroup>
            {props.delegateKind === "partner_company" && (
              <label className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={allowOverride}
                  onCheckedChange={(v) => setAllowOverride(!!v)}
                />
                Дозволити партнеру перевизначати платника на рівні окремого співробітника
              </label>
            )}
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Після підпису платник зафіксований. Зміна — лише через новий договір.
            </AlertDescription>
          </Alert>

          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(!!v)}
              className="mt-0.5"
            />
            Я підтверджую, що ознайомлений з умовами і погоджуюсь, що AI-кредити
            будуть списуватися згідно з вибором вище.
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Скасувати
          </Button>
          <Button
            disabled={!confirmed || create.isPending}
            onClick={() => create.mutate()}
          >
            Створити та надіслати на підпис
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
