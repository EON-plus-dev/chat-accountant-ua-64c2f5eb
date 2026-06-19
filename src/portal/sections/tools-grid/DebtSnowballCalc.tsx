import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

type Strategy = "avalanche" | "snowball";

const simulate = (debtsIn: Debt[], extra: number, strategy: Strategy) => {
  const debts = debtsIn.map((d) => ({ ...d }));
  const sortFn = strategy === "avalanche"
    ? (a: Debt, b: Debt) => b.rate - a.rate
    : (a: Debt, b: Debt) => a.balance - b.balance;

  let months = 0;
  let totalInterest = 0;
  while (debts.some((d) => d.balance > 0) && months < 600) {
    months++;
    debts.forEach((d) => {
      if (d.balance <= 0) return;
      const interest = (d.balance * d.rate) / 100 / 12;
      d.balance += interest;
      totalInterest += interest;
    });
    debts.forEach((d) => {
      if (d.balance <= 0) return;
      const pay = Math.min(d.minPayment, d.balance);
      d.balance -= pay;
    });
    const active = debts.filter((d) => d.balance > 0).sort(sortFn);
    if (active[0] && extra > 0) {
      const pay = Math.min(extra, active[0].balance);
      active[0].balance -= pay;
    }
  }
  return { months, totalInterest };
};

export const DebtSnowballCalc = () => {
  const [debts, setDebts] = useState<Debt[]>([
    { id: "1", name: "Кредитка ПриватБанк", balance: 25000, rate: 42, minPayment: 1500 },
    { id: "2", name: "Споживчий кредит", balance: 80000, rate: 24, minPayment: 3500 },
    { id: "3", name: "Розстрочка Rozetka", balance: 12000, rate: 0, minPayment: 1000 },
  ]);
  const [extra, setExtra] = useState(3000);

  const update = (id: string, patch: Partial<Debt>) =>
    setDebts((arr) => arr.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const remove = (id: string) => setDebts((arr) => arr.filter((d) => d.id !== id));
  const add = () =>
    setDebts((arr) => [
      ...arr,
      { id: String(Date.now()), name: "Новий борг", balance: 10000, rate: 20, minPayment: 500 },
    ]);

  const r = useMemo(() => {
    const av = simulate(debts, extra, "avalanche");
    const sn = simulate(debts, extra, "snowball");
    const total = debts.reduce((s, d) => s + d.balance, 0);
    return { av, sn, total };
  }, [debts, extra]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-semibold">Ваші борги</p>
          {debts.map((d) => (
            <div key={d.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-12 sm:col-span-4">
                <Label className="text-xs">Назва</Label>
                <Input value={d.name} onChange={(e) => update(d.id, { name: e.target.value })} />
              </div>
              <div className="col-span-4 sm:col-span-3">
                <Label className="text-xs">Сума, ₴</Label>
                <Input type="number" value={d.balance || ""} onChange={(e) => update(d.id, { balance: Number(e.target.value) || 0 })} />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Label className="text-xs">Ставка %</Label>
                <Input type="number" value={d.rate || ""} onChange={(e) => update(d.id, { rate: Number(e.target.value) || 0 })} />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <Label className="text-xs">Мін. платіж</Label>
                <Input type="number" value={d.minPayment || ""} onChange={(e) => update(d.id, { minPayment: Number(e.target.value) || 0 })} />
              </div>
              <Button variant="ghost" size="icon" className="col-span-1" onClick={() => remove(d.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={add}>
            <Plus className="h-4 w-4 mr-1" /> Додати борг
          </Button>
          <div className="pt-2">
            <Label className="text-xs">Додатково можу платити на місяць, ₴</Label>
            <Input type="number" value={extra || ""} onChange={(e) => setExtra(Number(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold">Загалом боргів: {fmt(r.total)}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/30 p-4 bg-primary/5">
              <p className="text-xs text-muted-foreground">🏔 Лавина (за ставкою)</p>
              <p className="text-2xl font-bold text-primary mt-1">{r.av.months} міс</p>
              <p className="text-xs mt-1">Переплата: <strong>{fmt(r.av.totalInterest)}</strong></p>
              <p className="text-xs text-muted-foreground mt-2">
                Спочатку гасимо борг з найвищою ставкою — мінімум переплати.
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-chart-2/5">
              <p className="text-xs text-muted-foreground">⛄ Снігова куля (за сумою)</p>
              <p className="text-2xl font-bold text-foreground mt-1">{r.sn.months} міс</p>
              <p className="text-xs mt-1">Переплата: <strong>{fmt(r.sn.totalInterest)}</strong></p>
              <p className="text-xs text-muted-foreground mt-2">
                Спочатку найменший борг — швидка психологічна перемога.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Економія від «Лавини»: <strong>{fmt(Math.max(0, r.sn.totalInterest - r.av.totalInterest))}</strong>.
            Якщо мотивація важливіша за відсотки — починайте зі «снігової кулі».
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
