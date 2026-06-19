import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

const ESV_MIN_MONTHLY = 1760;
const MIL_TAX = 0.05;

export const FopVsTooCalc = () => {
  const [revenue, setRevenue] = useState(2000000);
  const [expensesPct, setExpensesPct] = useState(40);

  const r = useMemo(() => {
    const expenses = (revenue * expensesPct) / 100;
    const profit = revenue - expenses;

    const fop2EP = 1760 * 12;
    const fop2ESV = ESV_MIN_MONTHLY * 12;
    const fop2Total = fop2EP + fop2ESV;
    const fop2Net = profit - fop2Total;

    const fop3EP = revenue * 0.05;
    const fop3VZ = revenue * MIL_TAX;
    const fop3ESV = ESV_MIN_MONTHLY * 12;
    const fop3Total = fop3EP + fop3VZ + fop3ESV;
    const fop3Net = profit - fop3Total;

    const cit = profit * 0.18;
    const afterTax = profit - cit;
    const dividendTax = afterTax * (0.05 + MIL_TAX);
    const tooTotal = cit + dividendTax;
    const tooNet = afterTax - dividendTax;

    return {
      profit,
      fop2: { total: fop2Total, net: fop2Net, available: revenue <= 8285700 },
      fop3: { total: fop3Total, net: fop3Net, available: revenue <= 9336000 },
      too: { total: tooTotal, net: tooNet, available: true },
    };
  }, [revenue, expensesPct]);

  const options = [
    { key: "fop2", label: "ФОП 2 група", hint: "Фікс. ставка ЄП. Лише B2C/B2B-ФОП.", data: r.fop2 },
    { key: "fop3", label: "ФОП 3 група (5%)", hint: "5% обороту + 5% військовий збір.", data: r.fop3 },
    { key: "too", label: "ТОВ (загальна)", hint: "ПНП 18% + дивіденди 5%+5%.", data: r.too },
  ];

  const best = options
    .filter((o) => o.data.available)
    .reduce((a, b) => (a.data.net > b.data.net ? a : b)).key;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 grid sm:grid-cols-2 gap-3">
          <div><Label className="text-xs">Річний оборот, ₴</Label><Input type="number" value={revenue || ""} onChange={(e) => setRevenue(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Витрати, % від обороту</Label><Input type="number" value={expensesPct || ""} onChange={(e) => setExpensesPct(Number(e.target.value) || 0)} /></div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Прибуток до податків: <strong>{fmt(r.profit)}</strong>. Розрахунок спрощений, без ПДВ.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            {options.map((o) => (
              <div
                key={o.key}
                className={`rounded-xl border p-4 ${
                  o.key === best && o.data.available
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-muted/20"
                } ${!o.data.available ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{o.label}</p>
                  {o.key === best && o.data.available && (
                    <span className="text-[10px] uppercase tracking-wide font-bold text-primary">Краще</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{o.hint}</p>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Податки /рік</p>
                  <p className="text-base font-semibold">{fmt(o.data.total)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Чистий дохід</p>
                  <p className="text-lg font-bold text-foreground">{fmt(o.data.net)}</p>
                  {!o.data.available && (
                    <p className="text-[11px] text-destructive mt-2">Перевищено ліміт обороту</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Розрахунок не враховує ПДВ 20%, спецпільги, операції з нерезидентами, ФОП 1/4 груп. Для точної
            відповіді — порадьтеся з бухгалтером.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
