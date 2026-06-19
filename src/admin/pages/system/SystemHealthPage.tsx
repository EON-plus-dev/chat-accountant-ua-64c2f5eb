import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemPageShell } from "./SystemPageShell";

const TABLES = [
  { name: "user_subscriptions", purpose: "Підписки на тарифи" },
  { name: "user_roles", purpose: "Ролі (admin/moderator/user)" },
  { name: "cabinet_members", purpose: "Учасники кабінетів" },
  { name: "partner_profiles", purpose: "Профілі партнерів-реселерів" },
  { name: "partner_client_links", purpose: "Привʼязки клієнт-партнер" },
  { name: "partner_commission_ledger", purpose: "Реєстр комісій партнерів" },
  { name: "partner_commission_runs", purpose: "Запуски cron нарахування" },
  { name: "partner_payouts", purpose: "Виплати партнерам" },
  { name: "ai_credit_wallets", purpose: "Гаманці AI-кредитів" },
  { name: "ai_credit_transactions", purpose: "Транзакції списань кредитів" },
  { name: "signature_audit_log", purpose: "Лог КЕП-підписів (append-only)" },
  { name: "delegation_contracts", purpose: "Договори делегації" },
  { name: "direct_delegations", purpose: "Прямі делегації фізособа↔ФОП" },
  { name: "user_notifications", purpose: "Сповіщення користувачам" },
] as const;

interface RowState {
  count: number | null;
  error: string | null;
  loading: boolean;
}

export default function SystemHealthPage() {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(TABLES.map((t) => [t.name, { count: null, error: null, loading: true }]))
  );
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const next: Record<string, RowState> = {};
    await Promise.all(
      TABLES.map(async (t) => {
        const { count, error } = await supabase.from(t.name as any).select("*", { count: "exact", head: true });
        next[t.name] = { count: count ?? null, error: error?.message ?? null, loading: false };
      })
    );
    setRows(next);
    setRefreshing(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount = Object.values(rows).reduce((s, r) => s + (r.count ?? 0), 0);
  const errors = Object.values(rows).filter((r) => r.error).length;

  return (
    <SystemPageShell
      title="Здоровʼя БД"
      description="Поверхневий health-check: лічильники рядків основних таблиць. Для детальної телеметрії використовуйте Lovable Cloud."
      actions={
        <Button size="sm" variant="outline" onClick={() => void load()} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Database className="h-3.5 w-3.5 mr-1.5" />}
          Оновити
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Таблиць перевірено</div>
          <div className="text-xl font-semibold mt-1">{TABLES.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Сумарно рядків</div>
          <div className="text-xl font-semibold mt-1 tabular-nums">{new Intl.NumberFormat("uk-UA").format(totalCount)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Помилок доступу</div>
          <div className={`text-xl font-semibold mt-1 ${errors > 0 ? "text-red-600" : ""}`}>{errors}</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Таблиця</TableHead>
                <TableHead>Призначення</TableHead>
                <TableHead className="text-right">Рядків</TableHead>
                <TableHead>Стан</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TABLES.map((t) => {
                const r = rows[t.name];
                return (
                  <TableRow key={t.name}>
                    <TableCell className="font-mono text-xs">{t.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.purpose}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.loading ? <Loader2 className="h-3.5 w-3.5 inline animate-spin" /> : (r.count ?? "—")}
                    </TableCell>
                    <TableCell>
                      {r.error ? (
                        <Badge variant="destructive" className="text-[10px]" title={r.error}>помилка</Badge>
                      ) : r.loading ? (
                        <Badge variant="outline" className="text-[10px]">…</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
