import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface RunRow {
  id: string;
  period: string;
  links_processed: number;
  status: string;
  error: string | null;
  triggered_by: string;
  ran_at: string;
}

interface LedgerRow {
  id: string;
  period: string;
  partner_user_id: string;
  cabinet_id: string;
  client_uah_spent: number;
  commission_uah: number;
  status: string;
}

const monthDefault = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
};

export default function AdminPartnerCommissionsPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [period, setPeriod] = useState(monthDefault());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from("partner_commission_runs").select("*").order("ran_at", { ascending: false }).limit(50),
      supabase
        .from("partner_commission_ledger")
        .select("id, period, partner_user_id, cabinet_id, client_uah_spent, commission_uah, status")
        .eq("period", period)
        .order("commission_uah", { ascending: false })
        .limit(200),
    ]);
    setRuns((r as RunRow[]) || []);
    setLedger((l as LedgerRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const runAccrual = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("run_commission_accrual_logged", {
      _period: period,
      _trigger: "manual",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const res = data as { ok: boolean; processed?: number; error?: string };
    if (res?.ok) toast.success(`Готово: ${res.processed} зв'язок оброблено`);
    else toast.error(res?.error || "Помилка");
    await load();
  };

  const exportCsv = () => {
    const header = "period,partner_user_id,cabinet_id,client_uah_spent,commission_uah,status";
    const rows = ledger.map((r) =>
      [r.period, r.partner_user_id, r.cabinet_id, r.client_uah_spent, r.commission_uah, r.status].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Партнерські комісії</h1>
        <p className="text-sm text-muted-foreground">Cron нарахування + ручний бекфіл за період.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Запустити нарахування</CardTitle>
          <CardDescription className="text-xs">
            Cron виконується автоматично 1-го числа о 02:00 UTC за попередній місяць. Тут — для бекфілу.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="period">Період (YYYY-MM)</Label>
            <Input id="period" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40" />
          </div>
          <Button onClick={runAccrual} disabled={busy || !/^\d{4}-\d{2}$/.test(period)}>
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Нарахувати
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" /> Оновити
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={ledger.length === 0}>
            Експорт CSV ({ledger.length})
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Історія запусків</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {runs.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">
                    {r.period} <Badge variant="outline" className="ml-2">{r.triggered_by}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.ran_at).toLocaleString("uk-UA")}
                    {r.error && ` · ${r.error}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{r.links_processed} зв'язок</span>
                  <Badge
                    className={
                      r.status === "success"
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                    }
                    variant="outline"
                  >
                    {r.status}
                  </Badge>
                </div>
              </div>
            ))}
            {runs.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Запусків ще не було.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Реєстр за {period}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {ledger.map((r) => (
              <div key={r.id} className="px-4 py-2 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1 truncate">
                  <span className="font-mono text-[11px] text-muted-foreground">{r.partner_user_id.slice(0, 8)}…</span>
                  <span className="ml-2">{r.cabinet_id}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-muted-foreground">оборот {Number(r.client_uah_spent).toFixed(0)} ₴</span>
                  <span className="font-semibold">{Number(r.commission_uah).toFixed(2)} ₴</span>
                  <Badge variant="outline">{r.status}</Badge>
                </div>
              </div>
            ))}
            {ledger.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Немає нарахувань за цей період.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
