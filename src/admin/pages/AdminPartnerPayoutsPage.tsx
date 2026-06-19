import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PayoutRow {
  id: string;
  partner_user_id: string;
  period_from: string;
  period_to: string;
  amount_uah: number;
  status: "requested" | "approved" | "paid" | "rejected";
  method: string;
  recipient_name: string | null;
  iban: string | null;
  card_last4: string | null;
  reference: string | null;
  rejected_reason: string | null;
  requested_at: string;
  paid_at: string | null;
}

const STATUSES: PayoutRow["status"][] = ["requested", "approved", "paid", "rejected"];

export default function AdminPartnerPayoutsPage() {
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [filter, setFilter] = useState<PayoutRow["status"] | "all">("requested");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<{ id: string; mode: "pay" | "reject" } | null>(null);
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("partner_payouts").select("*").order("requested_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows(((data as unknown) as PayoutRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const submit = async () => {
    if (!actioning) return;
    setBusy(true);
    try {
      if (actioning.mode === "pay") {
        const { data, error } = await supabase.rpc("mark_partner_payout_paid", {
          _payout_id: actioning.id,
          _reference: reference || null,
          _note: null,
        });
        if (error) throw error;
        const res = data as { ok: boolean; error?: string };
        if (!res?.ok) throw new Error(res?.error || "error");
        toast.success("Виплату підтверджено");
      } else {
        if (reason.trim().length < 3) {
          toast.error("Вкажіть причину");
          setBusy(false);
          return;
        }
        const { data, error } = await supabase.rpc("reject_partner_payout", {
          _payout_id: actioning.id,
          _reason: reason.trim(),
        });
        if (error) throw error;
        const res = data as { ok: boolean; error?: string };
        if (!res?.ok) throw new Error(res?.error || "error");
        toast.success("Виплату відхилено");
      }
      setActioning(null);
      setReference("");
      setReason("");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Помилка");
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const header = "id,partner_user_id,period_from,period_to,amount_uah,status,method,iban,card_last4,reference,requested_at,paid_at";
    const csv = [
      header,
      ...rows.map((r) =>
        [r.id, r.partner_user_id, r.period_from, r.period_to, r.amount_uah, r.status, r.method, r.iban || "", r.card_last4 || "", r.reference || "", r.requested_at, r.paid_at || ""].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payouts-${filter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Виплати партнерам</h1>
        <p className="text-sm text-muted-foreground">Підтвердження або відхилення запитів на виплату.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s === "all" ? "Усі" : s}
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" /> Оновити
        </Button>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
          CSV ({rows.length})
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Запити</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className="p-4 flex flex-wrap items-center gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {r.recipient_name || r.partner_user_id.slice(0, 8)}
                    <Badge variant="outline" className="ml-2">{r.method}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.period_from === r.period_to ? r.period_from : `${r.period_from} — ${r.period_to}`}
                    {" · "}
                    {r.iban ? `IBAN ${r.iban.slice(0, 6)}…${r.iban.slice(-4)}` : r.card_last4 ? `•••• ${r.card_last4}` : "—"}
                    {" · "}запит {new Date(r.requested_at).toLocaleDateString("uk-UA")}
                    {r.reference && ` · реф. ${r.reference}`}
                    {r.rejected_reason && ` · ${r.rejected_reason}`}
                  </div>
                </div>
                <div className="font-semibold">{Number(r.amount_uah).toFixed(2)} ₴</div>
                <Badge
                  variant="outline"
                  className={
                    r.status === "paid"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : r.status === "rejected"
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : "bg-warning/10 text-warning border-warning/30"
                  }
                >
                  {r.status}
                </Badge>
                {(r.status === "requested" || r.status === "approved") && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button size="sm" onClick={() => setActioning({ id: r.id, mode: "pay" })}>
                      Підтвердити
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setActioning({ id: r.id, mode: "reject" })}>
                      Відхилити
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {rows.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Немає запитів за цим фільтром.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!actioning} onOpenChange={(o) => !o && setActioning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actioning?.mode === "pay" ? "Підтвердити виплату" : "Відхилити виплату"}
            </DialogTitle>
          </DialogHeader>
          {actioning?.mode === "pay" ? (
            <div>
              <Label htmlFor="ref">Референс платежу (опційно)</Label>
              <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PAY-2026-05-0001" />
            </div>
          ) : (
            <div>
              <Label htmlFor="reason">Причина</Label>
              <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActioning(null)} disabled={busy}>
              Скасувати
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actioning?.mode === "pay" ? "Підтвердити" : "Відхилити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
