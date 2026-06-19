import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const RunwayCalc = () => {
  const [cash, setCash] = useState(450000);
  const [revenue, setRevenue] = useState(180000);
  const [expenses, setExpenses] = useState(260000);
  const [growth, setGrowth] = useState(8);

  const r = useMemo(() => {
    const burn = expenses - revenue;
    const flatRunway = burn > 0 ? Math.floor(cash / burn) : Infinity;

    let bal = cash;
    let rev = revenue;
    let months = 0;
    while (bal > 0 && months < 240) {
      months++;
      bal += rev - expenses;
      rev *= 1 + growth / 100;
    }
    return { burn, flatRunway, growthRunway: months };
  }, [cash, revenue, expenses, growth]);

  const status = !Number.isFinite(r.flatRunway)
    ? { label: "Прибутково", color: "text-primary" }
    : r.flatRunway < 3
      ? { label: "Критично", color: "text-destructive" }
      : r.flatRunway < 6
        ? { label: "Небезпечно", color: "text-chart-3" }
        : r.flatRunway < 12
          ? { label: "Контрольно", color: "text-chart-2" }
          : { label: "Безпечно", color: "text-primary" };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 grid sm:grid-cols-2 gap-3">
          <div><Label className="text-xs">Готівка на рахунках, ₴</Label><Input type="number" value={cash || ""} onChange={(e) => setCash(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Місячний дохід, ₴</Label><Input type="number" value={revenue || ""} onChange={(e) => setRevenue(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Місячні витрати, ₴</Label><Input type="number" value={expenses || ""} onChange={(e) => setExpenses(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Зростання доходу /міс, %</Label><Input type="number" value={growth || ""} onChange={(e) => setGrowth(Number(e.target.value) || 0)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm">
            Burn rate: <strong>{r.burn > 0 ? fmt(r.burn) + "/міс" : "Прибуток " + fmt(-r.burn) + "/міс"}</strong>
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground">При поточних показниках</p>
              <p className={`text-3xl font-bold mt-1 ${status.color}`}>
                {Number.isFinite(r.flatRunway) ? `${r.flatRunway} міс` : "∞"}
              </p>
              <p className={`text-sm font-medium ${status.color} mt-1`}>{status.label}</p>
            </div>
            <div className="rounded-xl border border-primary/30 p-4 bg-primary/5">
              <p className="text-xs text-muted-foreground">З урахуванням зростання доходу</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {r.growthRunway >= 240 ? "20+ років" : `${r.growthRunway} міс`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                +{growth}% до доходу щомісяця
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Безпечний runway: <strong>≥12 міс</strong>. &lt;6 міс — починайте скорочення витрат або
            фандрейзинг негайно.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
