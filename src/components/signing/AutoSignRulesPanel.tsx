import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  contractId: string;
  cabinetId: string;
  currentUserId: string;
  isOwner: boolean;
}

interface Rule {
  id?: string;
  enabled: boolean;
  document_kinds: string[];
  max_amount_uah: number | null;
  requires_trusted_review: boolean;
  trusted_reviewer_user_ids: string[];
}

const DEFAULT_KINDS = ["payment_order", "tax_declaration", "report"];

export function AutoSignRulesPanel({ contractId, cabinetId, currentUserId, isOwner }: Props) {
  const [rule, setRule] = useState<Rule>({
    enabled: false, document_kinds: [], max_amount_uah: null,
    requires_trusted_review: true, trusted_reviewer_user_ids: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("auto_sign_rules")
        .select("*").eq("contract_id", contractId).maybeSingle();
      if (data) setRule({
        id: data.id, enabled: data.enabled,
        document_kinds: (data.document_kinds as string[]) ?? [],
        max_amount_uah: data.max_amount_uah != null ? Number(data.max_amount_uah) : null,
        requires_trusted_review: data.requires_trusted_review,
        trusted_reviewer_user_ids: (data.trusted_reviewer_user_ids as string[]) ?? [],
      });
      setLoading(false);
    })();
  }, [contractId]);

  const save = async () => {
    setSaving(true);
    const payload = {
      contract_id: contractId, cabinet_id: cabinetId,
      enabled: rule.enabled, document_kinds: rule.document_kinds,
      max_amount_uah: rule.max_amount_uah, requires_trusted_review: rule.requires_trusted_review,
      trusted_reviewer_user_ids: rule.trusted_reviewer_user_ids,
      last_changed_by: currentUserId,
    };
    const q = rule.id
      ? supabase.from("auto_sign_rules").update(payload).eq("id", rule.id)
      : supabase.from("auto_sign_rules").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) toast({ title: "Не вдалося зберегти", description: error.message, variant: "destructive" });
    else toast({ title: "Збережено", description: "Правила авто-підпису оновлено." });
  };

  if (loading) return <div className="text-sm text-muted-foreground">Завантаження…</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Авто-підпис документів</CardTitle>
            <CardDescription>
              Дозволити системі автоматично підписувати документи КЕП після рев'ю довіреною особою.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">КЕП власника</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-enable">Увімкнути авто-підпис</Label>
          <Switch id="auto-enable" disabled={!isOwner}
            checked={rule.enabled}
            onCheckedChange={(v) => setRule((r) => ({ ...r, enabled: v }))} />
        </div>

        <div className="space-y-2">
          <Label>Дозволені типи документів</Label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_KINDS.map((k) => {
              const on = rule.document_kinds.includes(k);
              return (
                <Badge key={k} variant={on ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => isOwner && setRule((r) => ({
                    ...r,
                    document_kinds: on ? r.document_kinds.filter((x) => x !== k) : [...r.document_kinds, k],
                  }))}>
                  {k === "payment_order" ? "Платіжки" : k === "tax_declaration" ? "Декларації" : "Звіти"}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cap">Ліміт суми, ₴ (порожньо = без ліміту)</Label>
          <Input id="cap" type="number" disabled={!isOwner}
            value={rule.max_amount_uah ?? ""}
            onChange={(e) => setRule((r) => ({
              ...r, max_amount_uah: e.target.value ? Number(e.target.value) : null,
            }))} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="trusted">Обов'язкове рев'ю довіреною особою</Label>
          <Switch id="trusted" disabled={!isOwner}
            checked={rule.requires_trusted_review}
            onCheckedChange={(v) => setRule((r) => ({ ...r, requires_trusted_review: v }))} />
        </div>

        {isOwner && (
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>Зберегти</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
