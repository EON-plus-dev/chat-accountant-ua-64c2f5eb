import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const FireCalc = () => {
  const [monthlyExpense, setMonthlyExpense] = useState(30000);
  const [current, setCurrent] = useState(100000);
  const [monthlySaving, setMonthlySaving] = useState(15000);
  const [returnRate, setReturnRate] = useState(10);
  const [withdrawRate, setWithdrawRate] = useState(4);

  const r = useMemo(() => {
    const annualExpense = monthlyExpense * 12;
    const target = withdrawRate > 0 ? annualExpense * (100 / withdrawRate) : 0;
    let portfolio = current;
    let years = 0;
    while (portfolio < target && years < 100) {
      portfolio = portfolio * (1 + returnRate / 100) + monthlySaving * 12;
      years++;
    }
    return { target, years };
  }, [monthlyExpense, current, monthlySaving, returnRate, withdrawRate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 grid sm:grid-cols-2 gap-3">
          <div><Label className="text-xs">Витрати на місяць, ₴</Label><Input type="number" value={monthlyExpense || ""} onChange={(e) => setMonthlyExpense(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Уже накопичено, ₴</Label><Input type="number" value={current || ""} onChange={(e) => setCurrent(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Можу інвестувати на місяць, ₴</Label><Input type="number" value={monthlySaving || ""} onChange={(e) => setMonthlySaving(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Очікувана дохідність /рік, %</Label><Input type="number" value={returnRate || ""} onChange={(e) => setReturnRate(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Безпечна ставка зняття, %</Label><Input type="number" value={withdrawRate || ""} onChange={(e) => setWithdrawRate(Number(e.target.value) || 0)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/30 p-4 bg-primary/5">
              <p className="text-xs text-muted-foreground">🎯 Цільовий капітал (FIRE-число)</p>
              <p className="text-2xl font-bold text-primary mt-1">{fmt(r.target)}</p>
              <p className="text-xs text-muted-foreground mt-1">= річні витрати × {withdrawRate > 0 ? (100 / withdrawRate).toFixed(0) : "—"}</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-chart-2/5">
              <p className="text-xs text-muted-foreground">⏳ Років до FIRE</p>
              <p className="text-2xl font-bold text-foreground mt-1">{r.years >= 100 ? "100+" : r.years}</p>
              <p className="text-xs text-muted-foreground mt-1">При поточному темпі заощаджень</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Правило 4% (Trinity Study): портфель з 60/40 акцій/облігацій з імовірністю 95% переживе 30 років зняття.
            Для України з вищою інфляцією — обережніше брати 3-3.5%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
