import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

export const RentVsBuyCalc = () => {
  const [price, setPrice] = useState(2400000);
  const [downPct, setDownPct] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(15);
  const [years, setYears] = useState(20);
  const [rent, setRent] = useState(15000);
  const [rentGrowth, setRentGrowth] = useState(8);
  const [investReturn, setInvestReturn] = useState(12);
  const [propertyGrowth, setPropertyGrowth] = useState(7);
  const [horizon, setHorizon] = useState(10);

  const r = useMemo(() => {
    const down = (price * downPct) / 100;
    const loan = price - down;
    const i = mortgageRate / 100 / 12;
    const n = years * 12;
    const monthlyMortgage = i > 0 ? (loan * i) / (1 - Math.pow(1 + i, -n)) : loan / n;

    const months = horizon * 12;
    let balance = loan;
    for (let m = 0; m < months && m < n; m++) {
      const interest = balance * i;
      const principal = monthlyMortgage - interest;
      balance -= principal;
    }
    const propertyValue = price * Math.pow(1 + propertyGrowth / 100, horizon);
    const buyEquity = propertyValue - balance;

    let portfolio = down;
    let rentPaid = 0;
    let curRent = rent;
    for (let y = 0; y < horizon; y++) {
      for (let m = 0; m < 12; m++) {
        const diff = monthlyMortgage - curRent;
        rentPaid += curRent;
        portfolio = portfolio * (1 + investReturn / 100 / 12);
        if (diff > 0) portfolio += diff;
      }
      curRent *= 1 + rentGrowth / 100;
    }

    return {
      monthlyMortgage,
      buyEquity,
      rentPaid,
      portfolio,
      winner: portfolio > buyEquity ? "rent" : "buy",
    };
  }, [price, downPct, mortgageRate, years, rent, rentGrowth, investReturn, propertyGrowth, horizon]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-semibold">🏠 Купівля</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label className="text-xs">Ціна квартири, ₴</Label><Input type="number" value={price || ""} onChange={(e) => setPrice(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Перший внесок, %</Label><Input type="number" value={downPct || ""} onChange={(e) => setDownPct(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Ставка іпотеки, %</Label><Input type="number" value={mortgageRate || ""} onChange={(e) => setMortgageRate(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Строк іпотеки, років</Label><Input type="number" value={years || ""} onChange={(e) => setYears(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Зростання нерухомості /рік, %</Label><Input type="number" value={propertyGrowth || ""} onChange={(e) => setPropertyGrowth(Number(e.target.value) || 0)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <p className="text-sm font-semibold">🔑 Оренда + інвестування</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label className="text-xs">Оренда на місяць, ₴</Label><Input type="number" value={rent || ""} onChange={(e) => setRent(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Зростання оренди /рік, %</Label><Input type="number" value={rentGrowth || ""} onChange={(e) => setRentGrowth(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Дохідність інвестицій, %</Label><Input type="number" value={investReturn || ""} onChange={(e) => setInvestReturn(Number(e.target.value) || 0)} /></div>
            <div><Label className="text-xs">Горизонт порівняння, років</Label><Input type="number" value={horizon || ""} onChange={(e) => setHorizon(Number(e.target.value) || 0)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm">Платіж за іпотекою: <strong>{fmt(r.monthlyMortgage)}/міс</strong></p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className={`rounded-xl border p-4 ${r.winner === "buy" ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"}`}>
              <p className="text-xs text-muted-foreground">🏠 Купівля — капітал через {horizon} р.</p>
              <p className="text-2xl font-bold mt-1">{fmt(r.buyEquity)}</p>
              <p className="text-xs text-muted-foreground mt-1">Власний капітал = вартість − залишок іпотеки</p>
            </div>
            <div className={`rounded-xl border p-4 ${r.winner === "rent" ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"}`}>
              <p className="text-xs text-muted-foreground">🔑 Оренда — портфель через {horizon} р.</p>
              <p className="text-2xl font-bold mt-1">{fmt(r.portfolio)}</p>
              <p className="text-xs text-muted-foreground mt-1">Ви платите оренду {fmt(r.rentPaid)}, а різницю інвестуєте</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Це чисто фінансовий розрахунок. Стабільність житла, мобільність і психологічний комфорт — окремо.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
