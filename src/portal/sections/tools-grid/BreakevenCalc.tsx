import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

export const BreakevenCalc = () => {
  const [fixedCosts, setFixedCosts] = useState(50000);
  const [variableCost, setVariableCost] = useState(200);
  const [price, setPrice] = useState(500);

  const result = useMemo(() => {
    const contribution = price - variableCost;
    if (contribution <= 0) return null;
    const units = Math.ceil(fixedCosts / contribution);
    const revenue = units * price;
    return { contribution, units, revenue };
  }, [fixedCosts, variableCost, price]);

  const barPercent = result
    ? Math.min(100, (fixedCosts / (result.revenue || 1)) * 100)
    : 50;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Постійні витрати / місяць, ₴</Label>
            <Input
              type="number"
              value={fixedCosts || ""}
              onChange={(e) => setFixedCosts(Number(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Оренда, зарплата, ЄСВ, комунальні</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Змінні витрати на одиницю, ₴</Label>
              <Input
                type="number"
                value={variableCost || ""}
                onChange={(e) => setVariableCost(Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Собівартість 1 послуги/товару</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ціна продажу одиниці, ₴</Label>
              <Input
                type="number"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card className="border-t-2 border-t-primary">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Точка беззбитковості</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Потрібно продати</span>
                <p className="text-2xl font-mono font-bold text-foreground">{result.units}</p>
                <p className="text-xs text-muted-foreground">одиниць / місяць</p>
              </div>
              <div>
                <span className="text-muted-foreground">Виручка на точці</span>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {result.revenue.toLocaleString("uk-UA")} ₴
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Маржинальний внесок</span>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {result.contribution.toLocaleString("uk-UA")} ₴
                </p>
                <p className="text-xs text-muted-foreground">з кожної одиниці</p>
              </div>
            </div>

            {/* Visual bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Витрати</span>
                <span>Точка беззбитковості</span>
              </div>
              <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-destructive/60 transition-all"
                  style={{ width: `${barPercent}%` }}
                />
                <div
                  className="absolute inset-y-0 rounded-full bg-primary/80 transition-all"
                  style={{ left: `${barPercent}%`, width: `${100 - barPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-destructive">{fixedCosts.toLocaleString("uk-UA")} ₴</span>
                <span className="text-primary">{result.revenue.toLocaleString("uk-UA")} ₴</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {price <= variableCost
                ? "Ціна продажу повинна бути більшою за змінні витрати"
                : "Введіть дані для розрахунку"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl bg-muted/50 border border-border p-6 text-center">
        <p className="font-semibold text-foreground">Плануйте і контролюйте фінанси в FINTODO</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Автоматичний трекінг виручки, витрат та маржі в реальному часі.
        </p>
      </div>
    </div>
  );
};
