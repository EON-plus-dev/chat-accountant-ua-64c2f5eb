import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const EmergencyFundCalc = () => {
  const [monthlyExpense, setMonthlyExpense] = useState(20000);
  const [months, setMonths] = useState(6);
  const [monthlySaving, setMonthlySaving] = useState(4000);
  const [current, setCurrent] = useState(0);

  const r = useMemo(() => {
    const target = monthlyExpense * months;
    const remaining = Math.max(0, target - current);
    const monthsToGoal = monthlySaving > 0 ? Math.ceil(remaining / monthlySaving) : Infinity;
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    return { target, remaining, monthsToGoal, progress };
  }, [monthlyExpense, months, monthlySaving, current]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Місячні витрати, ₴</Label>
              <Input
                type="number"
                value={monthlyExpense || ""}
                onChange={(e) => setMonthlyExpense(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Базові потреби: житло, їжа, транспорт</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Бажана подушка, місяців</Label>
              <Input
                type="number"
                value={months || ""}
                onChange={(e) => setMonths(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Стандарт: 3-6 міс. Фрілансер/ФОП — 6-12 міс.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Уже накопичено, ₴</Label>
              <Input
                type="number"
                value={current || ""}
                onChange={(e) => setCurrent(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Можу відкладати на місяць, ₴</Label>
              <Input
                type="number"
                value={monthlySaving || ""}
                onChange={(e) => setMonthlySaving(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Цільова подушка</p>
              <p className="text-2xl font-bold text-foreground mt-1">{fmt(r.target)}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Залишилось зібрати</p>
              <p className="text-2xl font-bold text-foreground mt-1">{fmt(r.remaining)}</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-primary/5">
              <p className="text-xs text-muted-foreground">Час до цілі</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {Number.isFinite(r.monthsToGoal) ? `${r.monthsToGoal} міс` : "—"}
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Прогрес</span>
              <span>{Math.round(r.progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${r.progress}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Тримайте подушку у ліквідних активах: ОВДП на 3-6 міс, депозит з можливістю дострокового
            зняття або накопичувальний рахунок. Не змішуйте з інвестиціями.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
