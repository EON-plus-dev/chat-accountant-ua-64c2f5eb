import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const UnitEconomyCalc = () => {
  const [marketing, setMarketing] = useState(30000);
  const [newClients, setNewClients] = useState(40);
  const [avgCheck, setAvgCheck] = useState(1200);
  const [cogsPct, setCogsPct] = useState(35);
  const [purchasesPerYear, setPurchasesPerYear] = useState(6);
  const [retentionYears, setRetentionYears] = useState(2);

  const r = useMemo(() => {
    const cac = newClients > 0 ? marketing / newClients : 0;
    const grossPerOrder = avgCheck * (1 - cogsPct / 100);
    const ltv = grossPerOrder * purchasesPerYear * retentionYears;
    const ratio = cac > 0 ? ltv / cac : 0;
    const paybackOrders = grossPerOrder > 0 ? Math.ceil(cac / grossPerOrder) : 0;
    const paybackMonths = purchasesPerYear > 0 ? Math.ceil((paybackOrders / purchasesPerYear) * 12) : 0;
    return { cac, ltv, ratio, paybackMonths };
  }, [marketing, newClients, avgCheck, cogsPct, purchasesPerYear, retentionYears]);

  const ratioLabel =
    r.ratio < 1 ? { text: "Збитково", color: "text-destructive" } :
    r.ratio < 3 ? { text: "Слабо", color: "text-chart-3" } :
    r.ratio < 5 ? { text: "Здорово", color: "text-primary" } :
    { text: "Відмінно", color: "text-primary" };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 grid sm:grid-cols-2 gap-3">
          <div><Label className="text-xs">Маркетинг-бюджет /міс, ₴</Label><Input type="number" value={marketing || ""} onChange={(e) => setMarketing(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Нових клієнтів /міс</Label><Input type="number" value={newClients || ""} onChange={(e) => setNewClients(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Середній чек, ₴</Label><Input type="number" value={avgCheck || ""} onChange={(e) => setAvgCheck(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Собівартість, %</Label><Input type="number" value={cogsPct || ""} onChange={(e) => setCogsPct(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Покупок на рік від клієнта</Label><Input type="number" value={purchasesPerYear || ""} onChange={(e) => setPurchasesPerYear(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Скільки років клієнт з вами</Label><Input type="number" value={retentionYears || ""} onChange={(e) => setRetentionYears(Number(e.target.value) || 0)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">CAC</p>
              <p className="text-xl font-bold">{fmt(r.cac)}</p>
              <p className="text-xs text-muted-foreground mt-1">Вартість залучення клієнта</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">LTV</p>
              <p className="text-xl font-bold">{fmt(r.ltv)}</p>
              <p className="text-xs text-muted-foreground mt-1">Дохід від клієнта за весь час</p>
            </div>
            <div className={`rounded-xl border p-4 ${r.ratio >= 3 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <p className="text-xs text-muted-foreground">LTV / CAC</p>
              <p className={`text-xl font-bold ${ratioLabel.color}`}>{r.ratio.toFixed(1)}× · {ratioLabel.text}</p>
              <p className="text-xs text-muted-foreground mt-1">Окупність: {r.paybackMonths} міс</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Норма для здорового бізнесу: <strong>LTV/CAC ≥ 3</strong>, окупність &lt; 12 міс. Якщо менше —
            знижуйте CAC (краща конверсія) або підвищуйте LTV (ретеншн, апсейл).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
