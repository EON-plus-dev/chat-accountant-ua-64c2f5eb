import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Star } from "lucide-react";
import { toast } from "sonner";
import { PLAN_LIST, PARTNER_COMMISSION_RATE, SYSTEM_MARGIN_TARGET, START_MONTHLY_FREE_CREDITS } from "@/config/billingModel";
import { SystemPageShell } from "./SystemPageShell";

export default function SystemPlansPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("plan_id")
        .eq("status", "active");
      const c: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        c[r.plan_id] = (c[r.plan_id] || 0) + 1;
      });
      setCounts(c);
    })();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("uk-UA").format(n);

  return (
    <SystemPageShell
      title="Тарифні плани"
      description="Конфігурація читається з src/config/billingModel.ts. Редагування цін — у наступній версії (потребує таблиці pricing_plans)."
      actions={
        <Button size="sm" variant="outline" onClick={() => toast.info("Редагування — у наступній версії")}>
          <Lock className="h-3.5 w-3.5 mr-1.5" />
          Редагувати
        </Button>
      }
    >
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>План</TableHead>
                <TableHead className="text-right">Ціна, ₴/міс</TableHead>
                <TableHead className="text-right">Кредитів</TableHead>
                <TableHead className="text-right">Курс топ-апу (кр./₴)</TableHead>
                <TableHead className="text-right">₴/кредит</TableHead>
                <TableHead className="text-right">Активних</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLAN_LIST.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.label}</span>
                      {p.popular && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Star className="h-3 w-3" /> popular
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">{p.id}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.priceUah === 0 ? "0 (Free)" : fmt(p.priceUah)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(p.includedCredits)} <span className="text-xs text-muted-foreground">/{p.includedKind === "monthly" ? "міс" : "день"}</span></TableCell>
                  <TableCell className="text-right tabular-nums">{p.topUpRatePerUah}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{p.effectivePricePerCreditUah.toFixed(4)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant="outline">{counts[p.id] ?? 0}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Цільова маржа системи</div>
          <div className="text-xl font-semibold mt-1">{Math.round(SYSTEM_MARGIN_TARGET * 100)}%</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Партнерська комісія</div>
          <div className="text-xl font-semibold mt-1">{Math.round(PARTNER_COMMISSION_RATE * 100)}% обороту</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Free quota (Старт)</div>
          <div className="text-xl font-semibold mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            {fmt(START_MONTHLY_FREE_CREDITS)} кр./міс
          </div>
        </CardContent></Card>
      </div>
    </SystemPageShell>
  );
}
