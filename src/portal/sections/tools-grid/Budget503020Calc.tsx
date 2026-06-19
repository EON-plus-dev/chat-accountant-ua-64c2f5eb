import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const Budget503020Calc = () => {
  const [income, setIncome] = useState(35000);

  const r = useMemo(() => {
    const i = Math.max(0, income);
    return {
      needs: i * 0.5,
      wants: i * 0.3,
      savings: i * 0.2,
    };
  }, [income]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Чистий дохід на місяць, ₴ (після податків)</Label>
            <Input
              type="number"
              value={income || ""}
              onChange={(e) => setIncome(Number(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Зарплата на руки + ФОП-доходи після ЄП/ЄСВ + інші регулярні надходження
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-semibold text-foreground">Розкладка за правилом 50/30/20</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-4 bg-chart-2/5">
              <p className="text-xs text-muted-foreground">50% — Потреби</p>
              <p className="text-2xl font-bold text-foreground mt-1">{fmt(r.needs)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Житло, їжа, транспорт, ліки, мінімальні платежі за боргами
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-chart-1/5">
              <p className="text-xs text-muted-foreground">30% — Бажання</p>
              <p className="text-2xl font-bold text-foreground mt-1">{fmt(r.wants)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Розваги, кафе, передплати, подорожі, хобі
              </p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-primary/5">
              <p className="text-xs text-muted-foreground">20% — Заощадження</p>
              <p className="text-2xl font-bold text-primary mt-1">{fmt(r.savings)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Подушка, інвестиції, дострокове погашення кредитів
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Правило Елізабет Воррен. Якщо «Потреби» &gt; 50% — варто скорочувати фіксовані витрати,
            а не «Бажання».
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
