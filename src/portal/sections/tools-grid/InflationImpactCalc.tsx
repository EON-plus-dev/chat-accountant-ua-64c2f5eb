import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const InflationImpactCalc = () => {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);

  const r = useMemo(() => {
    const r1 = rate / 100;
    const points = Array.from({ length: years + 1 }, (_, i) => ({
      year: i,
      real: amount / Math.pow(1 + r1, i),
    }));
    const finalReal = points[points.length - 1].real;
    const lossPct = amount > 0 ? ((amount - finalReal) / amount) * 100 : 0;
    return { points, finalReal, lossPct };
  }, [amount, rate, years]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Сума сьогодні, ₴</Label>
              <Input
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Інфляція на рік, %</Label>
              <Input
                type="number"
                value={rate || ""}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Україна 2020-2026: 5-26%</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Період, років</Label>
              <Input
                type="number"
                value={years || ""}
                onChange={(e) => setYears(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Реальна вартість через {years} р.</p>
              <p className="text-2xl font-bold text-foreground mt-1">{fmt(r.finalReal)}</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-destructive/5">
              <p className="text-xs text-muted-foreground">Втрата купівельної спроможності</p>
              <p className="text-2xl font-bold text-destructive mt-1">−{Math.round(r.lossPct)}%</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Реальна вартість по роках
            </p>
            <div className="space-y-1">
              {r.points.filter((_, i) => i % Math.max(1, Math.ceil(years / 6)) === 0 || i === years).map((p) => {
                const pct = amount > 0 ? (p.real / amount) * 100 : 0;
                return (
                  <div key={p.year} className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-muted-foreground">Рік {p.year}</span>
                    <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-28 text-right font-mono text-foreground">{fmt(p.real)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Щоб «обігнати» інфляцію — інвестуйте в ОВДП, ETF або депозити зі ставкою вище інфляції.
            Кеш «під подушкою» втрачає вартість щороку.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
