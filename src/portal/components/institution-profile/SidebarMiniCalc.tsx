import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatNumber } from "@/lib/formatters";

interface Props {
  defaultCreditRate: number;
  defaultDepositRate: number;
}

const fmt = (n: number) => formatNumber(Math.round(n));

export const SidebarMiniCalc = ({ defaultCreditRate, defaultDepositRate }: Props) => {
  const [creditAmount, setCreditAmount] = useState(100000);
  const [creditMonths, setCreditMonths] = useState(12);
  const [creditRate, setCreditRate] = useState(defaultCreditRate);

  const [depAmount, setDepAmount] = useState(100000);
  const [depMonths, setDepMonths] = useState(12);
  const [depRate, setDepRate] = useState(defaultDepositRate);

  // Annuity
  const r = creditRate / 100 / 12;
  const creditPayment = r > 0
    ? creditAmount * (r * Math.pow(1 + r, creditMonths)) / (Math.pow(1 + r, creditMonths) - 1)
    : creditAmount / creditMonths;

  // Deposit
  const dr = depRate / 100 / 12;
  let depBalance = depAmount;
  for (let i = 0; i < depMonths; i++) depBalance *= (1 + dr);
  const depProfit = depBalance - depAmount;
  const depNet = depProfit * 0.77; // after 23% tax

  return (
    <Card className="p-4 space-y-3 overflow-hidden">
      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Calculator className="w-4 h-4 text-primary" /> Калькулятор
      </p>
      <Tabs defaultValue="credit" className="w-full">
        <TabsList className="w-full h-8">
          <TabsTrigger value="credit" className="text-xs flex-1">Кредит</TabsTrigger>
          <TabsTrigger value="deposit" className="text-xs flex-1">Депозит</TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="space-y-2.5 mt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-[11px] text-muted-foreground">Сума, ₴</Label>
              <span className="text-[11px] font-medium text-primary">{fmt(creditAmount)}</span>
            </div>
            <Slider value={[creditAmount]} onValueChange={([v]) => setCreditAmount(v)} min={10000} max={2000000} step={10000} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Термін, міс</Label>
              <Input type="number" value={creditMonths} onChange={e => setCreditMonths(+e.target.value || 1)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Ставка, %</Label>
              <Input type="number" value={creditRate} onChange={e => setCreditRate(+e.target.value || 0)} step={0.1} className="h-8 text-xs" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground transition-all duration-200">{fmt(creditPayment)} ₴<span className="text-[11px] font-normal text-muted-foreground">/міс</span></p>
          </div>
          <Link to="/tools/credit-calc" className="text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1 group">
            Детальний калькулятор <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-2.5 mt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Label className="text-[11px] text-muted-foreground">Сума, ₴</Label>
              <span className="text-[11px] font-medium text-primary">{fmt(depAmount)}</span>
            </div>
            <Slider value={[depAmount]} onValueChange={([v]) => setDepAmount(v)} min={1000} max={2000000} step={1000} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Термін, міс</Label>
              <Input type="number" value={depMonths} onChange={e => setDepMonths(+e.target.value || 1)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Ставка, %</Label>
              <Input type="number" value={depRate} onChange={e => setDepRate(+e.target.value || 0)} step={0.1} className="h-8 text-xs" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-emerald-600 transition-all duration-200">+{fmt(depNet)} ₴</p>
            <p className="text-[10px] text-muted-foreground">чистий дохід після податків</p>
          </div>
          <Link to="/tools/deposit-calc" className="text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1 group">
            Детальний калькулятор <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
