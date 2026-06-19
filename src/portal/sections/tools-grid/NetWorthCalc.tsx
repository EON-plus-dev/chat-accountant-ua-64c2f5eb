import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

const ASSET_GROUPS = [
  { key: "cash", label: "Готівка та рахунки", items: ["Готівка ₴", "Готівка валюта", "Картковий рахунок", "Депозит"] },
  { key: "invest", label: "Інвестиції", items: ["ОВДП", "ETF/акції", "Криптовалюта"] },
  { key: "property", label: "Майно", items: ["Нерухомість", "Авто", "Інше цінне майно"] },
] as const;

const LIABILITY_ITEMS = ["Іпотека", "Споживчі кредити", "Кредитні картки", "Розстрочки", "Борг приватним особам"];

export const NetWorthCalc = () => {
  const [assets, setAssets] = useState<Record<string, number>>({});
  const [liabilities, setLiabilities] = useState<Record<string, number>>({});

  const r = useMemo(() => {
    const totalAssets = Object.values(assets).reduce((s, v) => s + (v || 0), 0);
    const totalLiab = Object.values(liabilities).reduce((s, v) => s + (v || 0), 0);
    const net = totalAssets - totalLiab;
    const ratio = totalAssets > 0 ? (totalLiab / totalAssets) * 100 : 0;
    return { totalAssets, totalLiab, net, ratio };
  }, [assets, liabilities]);

  const healthLabel =
    r.ratio === 0 && r.totalAssets === 0 ? "—" :
    r.ratio < 30 ? "Здоровий" :
    r.ratio < 50 ? "Помірний" :
    r.ratio < 80 ? "Напружений" : "Критичний";

  const healthColor =
    r.ratio < 30 ? "text-primary" :
    r.ratio < 50 ? "text-chart-2" :
    r.ratio < 80 ? "text-chart-3" : "text-destructive";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold">💰 Активи</p>
          {ASSET_GROUPS.map((g) => (
            <div key={g.key} className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{g.label}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {g.items.map((it) => (
                  <div key={it}>
                    <Label className="text-xs">{it}</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={assets[it] || ""}
                      onChange={(e) => setAssets((a) => ({ ...a, [it]: Number(e.target.value) || 0 }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-semibold">💳 Зобовʼязання</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {LIABILITY_ITEMS.map((it) => (
              <div key={it}>
                <Label className="text-xs">{it}</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={liabilities[it] || ""}
                  onChange={(e) => setLiabilities((a) => ({ ...a, [it]: Number(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-4 bg-chart-2/5">
              <p className="text-xs text-muted-foreground">Активи</p>
              <p className="text-xl font-bold">{fmt(r.totalAssets)}</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-destructive/5">
              <p className="text-xs text-muted-foreground">Зобовʼязання</p>
              <p className="text-xl font-bold">{fmt(r.totalLiab)}</p>
            </div>
            <div className="rounded-xl border border-primary/30 p-4 bg-primary/5">
              <p className="text-xs text-muted-foreground">Чистий капітал</p>
              <p className="text-xl font-bold text-primary">{fmt(r.net)}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Боргове навантаження</p>
              <p className={`text-sm font-semibold ${healthColor}`}>{healthLabel} · {Math.round(r.ratio)}%</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              &lt;30% — здорово · 30-50% — контроль · 50-80% — план погашення · &gt;80% — критично
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
