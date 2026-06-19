import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const GoalTrackerCalc = () => {
  const [goal, setGoal] = useState("Авто Toyota Corolla");
  const [target, setTarget] = useState(800000);
  const [current, setCurrent] = useState(120000);
  const [months, setMonths] = useState(36);
  const [returnRate, setReturnRate] = useState(8);

  const r = useMemo(() => {
    const i = returnRate / 100 / 12;
    const remaining = Math.max(0, target - current * Math.pow(1 + i, months));
    const payment = i > 0
      ? (remaining * i) / (Math.pow(1 + i, months) - 1)
      : remaining / Math.max(1, months);
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return { payment, progress };
  }, [target, current, months, returnRate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div><Label className="text-xs">Ціль</Label><Input value={goal} onChange={(e) => setGoal(e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label className="text-xs">Цільова сума, ₴</Label><Input type="number" value={target || ""} onChange={(e) => setTarget(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Уже накопичено, ₴</Label><Input type="number" value={current || ""} onChange={(e) => setCurrent(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Термін, місяців</Label><Input type="number" value={months || ""} onChange={(e) => setMonths(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Дохідність вкладень /рік, %</Label><Input type="number" value={returnRate || ""} onChange={(e) => setReturnRate(Number(e.target.value) || 0)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold">{goal}</p>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Прогрес</span>
              <span className="font-medium">{Math.round(r.progress)}%</span>
            </div>
            <Progress value={r.progress} className="h-2" />
          </div>
          <div className="rounded-xl border border-primary/30 p-4 bg-primary/5">
            <p className="text-xs text-muted-foreground">Відкладати щомісяця</p>
            <p className="text-3xl font-bold text-primary mt-1">{fmt(r.payment)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {months} міс × {fmt(r.payment)} + {fmt(current)} стартового → {fmt(target)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Тримайте на ОВДП/депозиті, якщо строк &lt; 3 років. Якщо &gt; 5 років — можна додати ETF.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
