import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const PricingCalc = () => {
  const [cost, setCost] = useState(500);
  const [overheadPct, setOverheadPct] = useState(20);
  const [targetMargin, setTargetMargin] = useState(40);
  const [competitorPrice, setCompetitorPrice] = useState(1200);
  const [valuePrice, setValuePrice] = useState(1800);

  const r = useMemo(() => {
    const fullCost = cost * (1 + overheadPct / 100);
    const costPlusPrice = targetMargin < 100 ? fullCost / (1 - targetMargin / 100) : fullCost * 2;
    const calc = (price: number) => ({
      price,
      profit: price - fullCost,
      margin: price > 0 ? ((price - fullCost) / price) * 100 : 0,
      markup: fullCost > 0 ? ((price - fullCost) / fullCost) * 100 : 0,
    });
    return {
      fullCost,
      costPlus: calc(costPlusPrice),
      competitor: calc(competitorPrice),
      value: calc(valuePrice),
    };
  }, [cost, overheadPct, targetMargin, competitorPrice, valuePrice]);

  type PriceData = { price: number; profit: number; margin: number; markup: number };
  const Box = ({ title, data, hint, accent }: { title: string; data: PriceData; hint: string; accent?: boolean }) => (
    <div className={`rounded-xl border p-4 ${accent ? "border-primary/30 bg-primary/5" : "border-border"}`}>
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{fmt(data.price)}</p>
      <div className="flex gap-3 mt-2 text-xs">
        <span>Маржа: <strong>{Math.round(data.margin)}%</strong></span>
        <span>Націнка: <strong>{Math.round(data.markup)}%</strong></span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Прибуток: {fmt(data.profit)}</p>
      <p className="text-[11px] text-muted-foreground mt-2">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 grid sm:grid-cols-2 gap-3">
          <div><Label className="text-xs">Собівартість одиниці, ₴</Label><Input type="number" value={cost || ""} onChange={(e) => setCost(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Накладні витрати, % до собівартості</Label><Input type="number" value={overheadPct || ""} onChange={(e) => setOverheadPct(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Бажана маржа, %</Label><Input type="number" value={targetMargin || ""} onChange={(e) => setTargetMargin(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Ціна конкурента, ₴</Label><Input type="number" value={competitorPrice || ""} onChange={(e) => setCompetitorPrice(Number(e.target.value) || 0)} /></div>
          <div className="sm:col-span-2"><Label className="text-xs">Цінність для клієнта (скільки готовий платити), ₴</Label><Input type="number" value={valuePrice || ""} onChange={(e) => setValuePrice(Number(e.target.value) || 0)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm">Повна собівартість з накладними: <strong>{fmt(r.fullCost)}</strong></p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Box title="Cost-plus" data={r.costPlus} hint="Гарантована маржа, але ігнорує ринок" />
            <Box title="Конкурентне" data={r.competitor} hint="Безпечно, але без диференціації" />
            <Box title="Value-based" data={r.value} accent hint="Найбільший прибуток — якщо є цінність" />
          </div>
          <p className="text-xs text-muted-foreground">
            Якщо value &gt; cost-plus — у вас є простір для підняття ціни. Якщо competitor &lt; cost-plus —
            ринок не готовий до вашої моделі, скорочуйте витрати.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
