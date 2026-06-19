import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Row {
  id: number;
  label: string;
  amount: number;
}

let nextId = 100;

export const CashFlowWizard = () => {
  const [months, setMonths] = useState(6);
  const [initialBalance, setInitialBalance] = useState(50000);
  const [incomes, setIncomes] = useState<Row[]>([
    { id: 1, label: "Дохід від послуг", amount: 80000 },
    { id: 2, label: "Інші доходи", amount: 5000 },
  ]);
  const [expenses, setExpenses] = useState<Row[]>([
    { id: 10, label: "ЄСВ", amount: 1760 },
    { id: 11, label: "Єдиний податок", amount: 4000 },
    { id: 12, label: "Оренда", amount: 10000 },
    { id: 13, label: "Зарплата", amount: 30000 },
    { id: 14, label: "Інші витрати", amount: 8000 },
  ]);

  const totalIncome = useMemo(() => incomes.reduce((s, r) => s + r.amount, 0), [incomes]);
  const totalExpense = useMemo(() => expenses.reduce((s, r) => s + r.amount, 0), [expenses]);
  const monthlyNet = totalIncome - totalExpense;

  const chartData = useMemo(
    () =>
      Array.from({ length: months }, (_, i) => ({
        month: `Міс ${i + 1}`,
        balance: initialBalance + monthlyNet * (i + 1),
      })),
    [months, initialBalance, monthlyNet],
  );

  const finalBalance = initialBalance + monthlyNet * months;
  const isPositive = monthlyNet >= 0;

  const addRow = (setter: React.Dispatch<React.SetStateAction<Row[]>>) =>
    setter((prev) => [...prev, { id: ++nextId, label: "", amount: 0 }]);

  const updateRow = (setter: React.Dispatch<React.SetStateAction<Row[]>>, id: number, field: "label" | "amount", value: string) =>
    setter((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: field === "amount" ? Number(value) || 0 : value } : r)),
    );

  const removeRow = (setter: React.Dispatch<React.SetStateAction<Row[]>>, id: number) =>
    setter((prev) => prev.filter((r) => r.id !== id));

  const RowTable = ({
    title,
    rows,
    setter,
    accent,
  }: {
    title: string;
    rows: Row[];
    setter: React.Dispatch<React.SetStateAction<Row[]>>;
    accent: string;
  }) => (
    <div>
      <h3 className={`text-sm font-semibold mb-2 ${accent}`}>{title}</h3>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex gap-2 items-center">
            <Input
              className="flex-1"
              placeholder="Назва"
              value={r.label}
              onChange={(e) => updateRow(setter, r.id, "label", e.target.value)}
            />
            <Input
              className="w-32"
              type="number"
              value={r.amount || ""}
              onChange={(e) => updateRow(setter, r.id, "amount", e.target.value)}
            />
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeRow(setter, r.id)}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-2" onClick={() => addRow(setter)}>
        <Plus className="h-3 w-3 mr-1" /> Додати
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Початковий залишок, ₴</Label>
              <Input
                type="number"
                value={initialBalance || ""}
                onChange={(e) => setInitialBalance(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Горизонт прогнозу</Label>
              <div className="flex gap-2">
                {[3, 6, 12].map((m) => (
                  <Button
                    key={m}
                    variant={months === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMonths(m)}
                  >
                    {m} міс
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RowTable title="Доходи" rows={incomes} setter={setIncomes} accent="text-emerald-600 dark:text-emerald-400" />
            <RowTable title="Витрати" rows={expenses} setter={setExpenses} accent="text-destructive" />
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Прогноз залишку</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString("uk-UA")} ₴`, "Залишок"]} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className={isPositive ? "border-t-2 border-t-success" : "border-t-2 border-t-destructive"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            <span className="font-semibold text-foreground">
              Cash flow {isPositive ? "позитивний" : "негативний"}
            </span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Щомісячний нетто</span>
              <p className="font-mono font-semibold text-foreground">{monthlyNet.toLocaleString("uk-UA")} ₴</p>
            </div>
            <div>
              <span className="text-muted-foreground">Через {months} міс</span>
              <p className="font-mono font-semibold text-foreground">{finalBalance.toLocaleString("uk-UA")} ₴</p>
            </div>
            <div>
              <span className="text-muted-foreground">Доходи / Витрати</span>
              <p className="font-mono font-semibold text-foreground">
                {totalIncome.toLocaleString("uk-UA")} / {totalExpense.toLocaleString("uk-UA")} ₴
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl bg-muted/50 border border-border p-6 text-center">
        <p className="font-semibold text-foreground">FINTODO веде управлінський облік автоматично</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Підключіть банк і бачте реальний Cash Flow в реальному часі.
        </p>
      </div>
    </div>
  );
};
