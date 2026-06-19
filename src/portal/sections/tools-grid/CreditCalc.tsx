import { useState, useMemo } from "react";
import { useCalcShareState } from "@/portal/hooks/useCalcShareState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Info, ChevronDown, Trophy, X, Building2, Calendar, RotateCcw, AlertTriangle, Share2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { formatNumber } from "@/lib/formatters";

const InfoTip = ({ text }: { text: string }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[280px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const creditRegex = /кредит|позик|loan|овердрафт|розстрочк/i;

const creditInstitutions = INSTITUTION_PROFILES.filter(inst =>
  inst.products.some(p => creditRegex.test(`${p.name} ${p.category} ${p.description} ${p.tagline}`))
).map(inst => {
  const prod = inst.products.find(p => creditRegex.test(`${p.name} ${p.category} ${p.description} ${p.tagline}`))!;
  const rateMatch = prod.interestRate?.match(/[\d.,]+/);
  return {
    id: inst.id, name: inst.name, color: inst.logo.color, initials: inst.logo.initials,
    rate: rateMatch ? parseFloat(rateMatch[0].replace(",", ".")) : null,
    rateLabel: prod.interestRate || "", productName: prod.name,
  };
});

function calcAnnuity(amount: number, months: number, annualRate: number) {
  if (annualRate === 0) return { payment: amount / months, total: amount, overpayment: 0 };
  const r = annualRate / 100 / 12;
  const payment = amount * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = payment * months;
  return { payment, total, overpayment: total - amount };
}

function calcDifferentiated(amount: number, months: number, annualRate: number) {
  const r = annualRate / 100 / 12;
  const bodyPart = amount / months;
  let total = 0;
  const firstPayment = bodyPart + amount * r;
  for (let i = 0; i < months; i++) total += bodyPart + (amount - bodyPart * i) * r;
  const lastPayment = bodyPart + (amount - bodyPart * (months - 1)) * r;
  return { firstPayment, lastPayment, total, overpayment: total - amount };
}

function genSchedule(amount: number, months: number, annualRate: number, isAnnuity: boolean) {
  const r = annualRate / 100 / 12;
  const rows: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
  let balance = amount;
  const annuityPayment = isAnnuity ? calcAnnuity(amount, months, annualRate).payment : 0;
  const bodyPart = amount / months;
  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const payment = isAnnuity ? annuityPayment : bodyPart + interest;
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    rows.push({ month: i, payment, principal, interest, balance });
  }
  return rows;
}

const fmt = (n: number) => formatNumber(Math.round(n));

const DEFAULTS = { amount: 200000, months: 12, rate: 24, isAnnuity: true, insurance: false, inflation: 10 };

export const CreditCalc = () => {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [isAnnuity, setIsAnnuity] = useState(DEFAULTS.isAnnuity);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [selected, setSelected] = useState<string[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const effectiveRate = insurance ? rate + 1 : rate;

  const toggleInst = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]);
  };

  const handleReset = () => {
    setAmount(DEFAULTS.amount); setMonths(DEFAULTS.months); setRate(DEFAULTS.rate);
    setIsAnnuity(DEFAULTS.isAnnuity); setInsurance(DEFAULTS.insurance); setInflation(DEFAULTS.inflation);
    setSelected([]); setShowSchedule(false); setShowAllSchedule(false);
  };

  const { copyShareLink } = useCalcShareState([
    { key: "amount", urlKey: "a", getter: () => amount, setter: v => setAmount(Number(v)), defaultValue: DEFAULTS.amount },
    { key: "months", urlKey: "m", getter: () => months, setter: v => setMonths(Number(v)), defaultValue: DEFAULTS.months },
    { key: "rate", urlKey: "r", getter: () => rate, setter: v => setRate(Number(v)), defaultValue: DEFAULTS.rate },
    { key: "inflation", urlKey: "inf", getter: () => inflation, setter: v => setInflation(Number(v)), defaultValue: DEFAULTS.inflation },
  ]);

  // Inflation-adjusted overpayment
  const realOverpayment = useMemo(() => {
    const infR = inflation / 100 / 12;
    const schedule = genSchedule(amount, months, effectiveRate, isAnnuity);
    let realTotal = 0;
    for (let i = 0; i < schedule.length; i++) {
      realTotal += schedule[i].payment / Math.pow(1 + infR, i + 1);
    }
    return Math.max(0, realTotal - amount);
  }, [amount, months, effectiveRate, isAnnuity, inflation]);

  // Floating rate risk
  const rateRiskPayment = useMemo(() => {
    const riskRate = effectiveRate + 5;
    return isAnnuity ? calcAnnuity(amount, months, riskRate).payment : calcDifferentiated(amount, months, riskRate).firstPayment;
  }, [amount, months, effectiveRate, isAnnuity]);

  // Calculate both types for comparison
  const annuityCalc = useMemo(() => calcAnnuity(amount, months, effectiveRate), [amount, months, effectiveRate]);
  const diffCalc = useMemo(() => calcDifferentiated(amount, months, effectiveRate), [amount, months, effectiveRate]);
  const typeDiff = annuityCalc.overpayment - diffCalc.overpayment;

  const results = useMemo(() => {
    const manual = isAnnuity
      ? { label: "Ваші параметри", rate: effectiveRate, ...annuityCalc, type: "annuity" as const }
      : { label: "Ваші параметри", rate: effectiveRate, ...diffCalc, type: "diff" as const };
    const instResults = selected.map(id => {
      const inst = creditInstitutions.find(i => i.id === id)!;
      const r = inst.rate ?? effectiveRate;
      return isAnnuity
        ? { label: inst.name, color: inst.color, initials: inst.initials, rate: r, ...calcAnnuity(amount, months, r), type: "annuity" as const }
        : { label: inst.name, color: inst.color, initials: inst.initials, rate: r, ...calcDifferentiated(amount, months, r), type: "diff" as const };
    });
    return [manual, ...instResults];
  }, [amount, months, effectiveRate, isAnnuity, selected, annuityCalc, diffCalc]);

  const bestIdx = results.length > 1
    ? results.reduce((best, r, i) => (r.overpayment < results[best].overpayment ? i : best), 0) : -1;

  const schedule = genSchedule(amount, months, effectiveRate, isAnnuity);
  const visibleSchedule = showAllSchedule ? schedule : schedule.slice(0, 6);

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(schedule.length / 24));
    return schedule.filter((_, i) => i % step === 0 || i === schedule.length - 1).map(row => ({
      month: row.month, principal: Math.round(row.principal), interest: Math.round(row.interest),
    }));
  }, [schedule]);

  const heroResult = results[0];
  const overpayPercent = amount > 0 ? ((heroResult.overpayment / amount) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Inputs FIRST */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Параметри кредиту</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={copyShareLink} className="h-7 px-2 text-xs text-muted-foreground">
              <Share2 className="w-3 h-3 mr-1" /> Поділитися
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs text-muted-foreground">
              <RotateCcw className="w-3 h-3 mr-1" /> Скинути
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <Label className="text-xs text-muted-foreground">Сума кредиту <InfoTip text="Сума, яку ви хочете отримати від банку" /></Label>
            <Input type="number" min={1000} max={10000000} value={amount} onChange={e => setAmount(Math.max(0, +e.target.value || 0))} className="w-32 text-right h-7 text-sm" />
          </div>
          <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={10000} max={5000000} step={5000} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label className="text-xs text-muted-foreground">Термін <InfoTip text="Довший термін — менший платіж, але більша переплата" /></Label>
              <span className="text-xs font-semibold text-primary">{months} міс{months > 12 ? ` (${(months / 12).toFixed(1)} р.)` : ""}</span>
            </div>
            <Slider value={[months]} onValueChange={([v]) => setMonths(v)} min={1} max={360} step={1} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ставка, % річних <InfoTip text="Чим менша — тим менше ви переплачуєте банку" /></Label>
            <Input type="number" min={0} max={100} value={rate} onChange={e => setRate(Math.max(0, +e.target.value || 0))} step={0.1} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Інфляція, % <InfoTip text="Інфляція знецінює майбутні платежі. Ви платите тими ж грошима, але вони «дешевші». Тому реальна вартість кредиту менша за номінальну" /></Label>
            <Input type="number" min={0} max={50} value={inflation} onChange={e => setInflation(Math.max(0, +e.target.value || 0))} step={0.5} className="text-right h-9 text-sm" />
          </div>
        </div>

        {/* Insurance checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox id="insurance" checked={insurance} onCheckedChange={(v) => setInsurance(!!v)} />
          <Label htmlFor="insurance" className="text-xs text-muted-foreground cursor-pointer">
            Страхування (+1% до ставки) <InfoTip text="Більшість банків вимагають страхування при кредитуванні. Це додає ~1% до ефективної ставки" />
          </Label>
          {insurance && <span className="text-[11px] text-amber-600 font-medium">Ефективна: {effectiveRate}%</span>}
        </div>

        {/* Payment type — compact pills */}
        <div>
          <div className="flex gap-2">
            <button onClick={() => setIsAnnuity(true)}
              className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${isAnnuity ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              Ануїтетний <InfoTip text="Однакова сума щомісяця. Зручно для бюджетування. Загальна переплата трохи більша" />
            </button>
            <button onClick={() => setIsAnnuity(false)}
              className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${!isAnnuity ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              Диференційований <InfoTip text={`Перший платіж найвищий (${fmt(diffCalc.firstPayment)} ₴), потім зменшується. Загальна переплата менша`} />
            </button>
          </div>
          {typeDiff > 100 && (
            <p className="mt-2 text-xs text-muted-foreground px-1">
              📊 Ануїтет: переплата <span className="font-medium text-foreground">{fmt(annuityCalc.overpayment)} ₴</span> / Диференц.: <span className="font-medium text-foreground">{fmt(diffCalc.overpayment)} ₴</span> / Різниця: <span className="font-bold text-emerald-600">{fmt(typeDiff)} ₴</span> на користь диференційованого
            </p>
          )}
        </div>

        {/* Institution picker */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {selected.map(id => {
              const inst = creditInstitutions.find(i => i.id === id)!;
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                  <span className="w-4 h-4 rounded-full text-[7px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: inst.color }}>{inst.initials}</span>
                  {inst.name} {inst.rate && <span className="opacity-70">{inst.rate}%</span>}
                  <button onClick={() => toggleInst(id)} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                </span>
              );
            })}
            {selected.length < 3 && (
              <button onClick={() => setShowPicker(!showPicker)}
                className="px-2.5 py-1 rounded-full text-[11px] border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
                <Building2 className="w-3 h-3 inline mr-1" />+ Порівняти
              </button>
            )}
          </div>
          {showPicker && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 rounded-lg border border-border bg-card max-h-40 overflow-y-auto">
              {creditInstitutions.filter(i => !selected.includes(i.id)).map(inst => (
                <button key={inst.id} onClick={() => { toggleInst(inst.id); if (selected.length >= 2) setShowPicker(false); }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left">
                  <span className="w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0" style={{ backgroundColor: inst.color }}>{inst.initials}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium truncate">{inst.name}</p>
                    <p className="text-[10px] text-muted-foreground">{inst.rateLabel || "—"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Hero Result — AFTER inputs */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/8 to-transparent p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Щомісячний платіж <InfoTip text="Стільки ви платитимете банку щомісяця. Ця сума включає частину тіла кредиту та відсотки" />
              </p>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight transition-all duration-300">
                {heroResult.type === "annuity"
                  ? <>{fmt((heroResult as any).payment)} <span className="text-base font-normal text-muted-foreground">₴/міс</span></>
                  : <>{fmt((heroResult as any).firstPayment)}—{fmt((heroResult as any).lastPayment)} <span className="text-base font-normal text-muted-foreground">₴/міс</span></>
                }
              </p>
            </div>
            <div className="flex gap-4 text-xs sm:ml-auto">
              <div className="sm:text-right">
                <p className="text-muted-foreground">Загальна</p>
                <p className="font-semibold">{fmt(heroResult.total)} ₴</p>
              </div>
              <div className="sm:text-right">
                <p className="text-muted-foreground">Переплата</p>
                <p className="font-semibold text-destructive">{fmt(heroResult.overpayment)} ₴ ({overpayPercent}%)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Inflation & rate risk */}
      <div className="space-y-2">
        <div className="px-3 py-2 text-xs text-muted-foreground rounded-lg bg-muted/30 border border-border/50">
          📉 Реальна переплата (з урахуванням інфляції {inflation}%): <span className="font-bold text-foreground">{fmt(realOverpayment)} ₴</span> замість {fmt(heroResult.overpayment)} ₴
          <InfoTip text="Інфляція знецінює майбутні платежі. Реальна вартість кредиту завжди менша за номінальну — це перевага позичальника" />
        </div>
        <div className="px-3 py-2 text-xs rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Якщо ставка плаваюча — при зростанні на 5% (до {effectiveRate + 5}%) ваш платіж збільшиться до <span className="font-bold">{fmt(rateRiskPayment)} ₴/міс</span> (+{((rateRiskPayment / (isAnnuity ? annuityCalc.payment : diffCalc.firstPayment) - 1) * 100).toFixed(0)}%)</span>
        </div>
      </div>

      {/* Comparison cards */}
      {results.length > 1 && (
        <div className={`grid gap-3 ${results.length > 2 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          {results.map((r, i) => (
            <Card key={i} className={`p-4 space-y-2 transition-all ${bestIdx === i ? "ring-2 ring-emerald-500 relative" : ""}`}>
              {bestIdx === i && (
                <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5" /> Найвигідніше
                </span>
              )}
              <div className="flex items-center gap-2">
                {"color" in r && <span className="w-5 h-5 rounded-full text-[8px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: (r as any).color }}>{(r as any).initials}</span>}
                <p className="text-xs font-semibold">{r.label}</p>
                <span className="ml-auto text-[11px] bg-muted px-1.5 py-0.5 rounded-full">{r.rate}%</span>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                {r.type === "annuity" ? (
                  <p className="text-xl font-bold">{fmt((r as any).payment)} ₴<span className="text-xs font-normal text-muted-foreground">/міс</span></p>
                ) : (
                  <p className="text-base font-bold">{fmt((r as any).firstPayment)}—{fmt((r as any).lastPayment)} ₴<span className="text-xs font-normal text-muted-foreground">/міс</span></p>
                )}
                <p className="text-xs text-destructive font-medium mt-0.5">Переплата: {fmt(r.overpayment)} ₴</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 2 && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold">Структура платежу <span className="font-normal text-muted-foreground text-xs">— як змінюється тіло/відсотки</span></p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}к`} className="text-muted-foreground" />
              <ReTooltip
                contentStyle={{ borderRadius: 12, fontSize: 11, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                formatter={(value: number, name: string) => [`${fmt(value)} ₴`, name === "principal" ? "Тіло" : "Відсотки"]}
                labelFormatter={v => `Місяць ${v}`}
              />
              <Area type="monotone" dataKey="principal" stackId="1" fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" strokeWidth={1.5} name="principal" />
              <Area type="monotone" dataKey="interest" stackId="1" fill="hsl(var(--destructive) / 0.2)" stroke="hsl(var(--destructive) / 0.6)" strokeWidth={1.5} name="interest" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/30 border border-primary" /> Тіло</span>

            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/60" /> Відсотки</span>
          </div>
        </Card>
      )}

      {/* Early repayment note */}
      <div className="px-3 py-2 text-xs text-muted-foreground rounded-lg bg-muted/30 border border-border/50">
        💡 Якщо погасити достроково — відсотки перераховуються. За законом банк не може стягувати штраф за дострокове погашення споживчого кредиту (ст. 1049 ЦКУ)
      </div>

      {/* Schedule — first 6 rows + expand */}
      <Collapsible open={showSchedule} onOpenChange={setShowSchedule}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between text-xs">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Графік погашення</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSchedule ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-2 text-left font-medium text-muted-foreground">Міс.</th>
                  <th className="p-2 text-right font-medium text-muted-foreground">Платіж</th>
                  <th className="p-2 text-right font-medium text-muted-foreground">Тіло</th>
                  <th className="p-2 text-right font-medium text-muted-foreground">Відсотки</th>
                  <th className="p-2 text-right font-medium text-muted-foreground">Залишок</th>
                </tr>
              </thead>
              <tbody>
                {visibleSchedule.map((row, i) => (
                  <tr key={row.month} className={`border-b border-border/30 ${i % 2 === 0 ? "bg-muted/10" : ""}`}>
                    <td className="p-2 font-medium">{row.month}</td>
                    <td className="p-2 text-right font-semibold">{fmt(row.payment)}</td>
                    <td className="p-2 text-right">{fmt(row.principal)}</td>
                    <td className="p-2 text-right text-muted-foreground">{fmt(row.interest)}</td>
                    <td className="p-2 text-right">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {schedule.length > 6 && !showAllSchedule && (
              <button
                onClick={() => setShowAllSchedule(true)}
                className="w-full py-2 text-xs text-primary hover:bg-muted/50 transition-colors border-t border-border"
              >
                Показати всі {schedule.length} міс. ↓
              </button>
            )}
            {showAllSchedule && schedule.length > 6 && (
              <button
                onClick={() => setShowAllSchedule(false)}
                className="w-full py-2 text-xs text-primary hover:bg-muted/50 transition-colors border-t border-border"
              >
                Згорнути ↑
              </button>
            )}
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
