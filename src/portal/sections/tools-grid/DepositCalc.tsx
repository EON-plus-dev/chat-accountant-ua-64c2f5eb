import { useState, useMemo } from "react";
import { useCalcShareState } from "@/portal/hooks/useCalcShareState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, ChevronDown, Trophy, X, Building2, ShieldCheck, AlertTriangle, RotateCcw, Share2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Line } from "recharts";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { formatNumber } from "@/lib/formatters";

const InfoTip = ({ text }: { text: string }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const depositRegex = /депозит|вклад|deposit|ощадн|накопичувальн/i;

const depositInstitutions = INSTITUTION_PROFILES.filter(inst =>
  inst.products.some(p => depositRegex.test(`${p.name} ${p.category} ${p.description} ${p.tagline}`))
).map(inst => {
  const prod = inst.products.find(p => depositRegex.test(`${p.name} ${p.category} ${p.description} ${p.tagline}`))!;
  const rateMatch = prod.interestRate?.match(/[\d.,]+/);
  return {
    id: inst.id, name: inst.name, color: inst.logo.color, initials: inst.logo.initials,
    rate: rateMatch ? parseFloat(rateMatch[0].replace(",", ".")) : null,
    rateLabel: prod.interestRate || "", productName: prod.name,
  };
});

type Cap = "none" | "monthly" | "quarterly";

function calcDeposit(amount: number, months: number, annualRate: number, cap: Cap, topup: number, inflation: number = 0) {
  const r = annualRate / 100 / 12;
  const infR = inflation / 100 / 12;
  const rows: { month: number; balance: number; balanceNoCap: number; interest: number; realBalance: number }[] = [];

  let balance = amount;
  let totalInterest = 0;
  let accruedQ = 0;

  let balanceNoCap = amount;
  let totalInterestNoCap = 0;

  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    totalInterest += interest;

    if (cap === "monthly") {
      balance += interest;
    } else if (cap === "quarterly") {
      accruedQ += interest;
      if (i % 3 === 0) { balance += accruedQ; accruedQ = 0; }
    }
    balance += topup;

    const interestNoCap = balanceNoCap * r;
    totalInterestNoCap += interestNoCap;
    balanceNoCap += topup;

    const currentBalance = cap === "none" ? balanceNoCap + totalInterestNoCap : balance;
    const realBalance = currentBalance / Math.pow(1 + (inflation / 100 / 12), i);

    rows.push({
      month: i,
      balance: Math.round(currentBalance),
      balanceNoCap: Math.round(balanceNoCap + totalInterestNoCap),
      interest: Math.round(cap === "none" ? interestNoCap : interest),
      realBalance: Math.round(realBalance),
    });
  }

  if (cap === "quarterly" && accruedQ > 0) balance += accruedQ;

  const finalInterest = cap === "none" ? totalInterestNoCap : totalInterest;
  const finalBalance = cap === "none"
    ? balanceNoCap + totalInterestNoCap * (1 - 0.23)
    : balance - totalInterest * 0.23;

  const tax = finalInterest * 0.23;
  const netProfit = finalInterest - tax;
  const realFinalBalance = finalBalance / Math.pow(1 + inflation / 100 / 12, months);

  return { totalInterest: finalInterest, tax, netProfit, finalBalance, realFinalBalance, rows };
}

const fmt = (n: number) => formatNumber(Math.round(n));

const DEFAULTS = { amount: 100000, months: 12, rate: 15, cap: "monthly" as Cap, topup: 0, inflation: 10 };

export const DepositCalc = () => {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [cap, setCap] = useState<Cap>(DEFAULTS.cap);
  const [topup, setTopup] = useState(DEFAULTS.topup);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [selected, setSelected] = useState<string[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const toggleInst = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]
  );

  const handleReset = () => {
    setAmount(DEFAULTS.amount); setMonths(DEFAULTS.months); setRate(DEFAULTS.rate);
    setCap(DEFAULTS.cap); setTopup(DEFAULTS.topup); setInflation(DEFAULTS.inflation); setSelected([]);
    setShowSchedule(false); setShowAllSchedule(false);
  };

  const { copyShareLink } = useCalcShareState([
    { key: "amount", urlKey: "a", getter: () => amount, setter: v => setAmount(Number(v)), defaultValue: DEFAULTS.amount },
    { key: "months", urlKey: "m", getter: () => months, setter: v => setMonths(Number(v)), defaultValue: DEFAULTS.months },
    { key: "rate", urlKey: "r", getter: () => rate, setter: v => setRate(Number(v)), defaultValue: DEFAULTS.rate },
    { key: "cap", urlKey: "c", getter: () => cap, setter: v => setCap(v as "none" | "monthly" | "quarterly"), defaultValue: DEFAULTS.cap },
    { key: "topup", urlKey: "t", getter: () => topup, setter: v => setTopup(Number(v)), defaultValue: DEFAULTS.topup },
    { key: "inflation", urlKey: "inf", getter: () => inflation, setter: v => setInflation(Number(v)), defaultValue: DEFAULTS.inflation },
  ]);

  const results = useMemo(() => {
    const manual = { label: "Ваші параметри", rate, ...calcDeposit(amount, months, rate, cap, topup, inflation) };
    const instResults = selected.map(id => {
      const inst = depositInstitutions.find(i => i.id === id)!;
      const r = inst.rate ?? rate;
      return { label: inst.name, color: inst.color, initials: inst.initials, rate: r, ...calcDeposit(amount, months, r, cap, topup, inflation) };
    });
    return [manual, ...instResults];
  }, [amount, months, rate, cap, topup, selected, inflation]);

  const bestIdx = results.length > 1
    ? results.reduce((best, r, i) => (r.netProfit > results[best].netProfit ? i : best), 0) : -1;

  const withoutCap = useMemo(() => calcDeposit(amount, months, rate, "none", topup, inflation), [amount, months, rate, topup, inflation]);
  const withCap = useMemo(() => calcDeposit(amount, months, rate, "monthly", topup, inflation), [amount, months, rate, topup, inflation]);
  const capDiff = withCap.netProfit - withoutCap.netProfit;

  const realYield = rate - inflation;
  const realValueWithout = amount / Math.pow(1 + inflation / 100 / 12, months);

  // Effect of topups
  const withoutTopup = useMemo(() => calcDeposit(amount, months, rate, cap, 0, inflation), [amount, months, rate, cap, inflation]);
  const topupEffect = results[0].netProfit - withoutTopup.netProfit;

  const effectiveRate = months > 0 ? ((Math.pow(1 + rate / 100 / 12, 12) - 1) * 100).toFixed(2) : "0";

  const chartData = results[0].rows;
  const visibleRows = showAllSchedule ? results[0].rows : results[0].rows.slice(0, 6);

  const isFGVFOExceeded = amount > 600000;

  return (
    <div className="space-y-4">
      {/* Inputs FIRST */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Параметри депозиту</p>
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
            <Label className="text-xs text-muted-foreground">Сума вкладу <InfoTip text="Початкова сума, яку ви розміщуєте на депозиті" /></Label>
            <Input type="number" min={0} value={amount} onChange={e => setAmount(Math.max(0, +e.target.value || 0))} className="w-32 text-right h-7 text-sm" />
          </div>
          <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={1000} max={10000000} step={1000} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label className="text-xs text-muted-foreground">Термін</Label>
              <span className="text-xs font-semibold text-primary">{months} міс</span>
            </div>
            <Slider value={[months]} onValueChange={([v]) => setMonths(v)} min={1} max={60} step={1} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Ставка, % річних</Label>
            <Input type="number" min={0} max={50} value={rate} onChange={e => setRate(Math.max(0, +e.target.value || 0))} step={0.1} className="text-right h-9 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Капіталізація <InfoTip text="Відсотки додаються до вкладу — наступного місяця ви отримуєте більше" />
            </Label>
            <Select value={cap} onValueChange={(v) => setCap(v as Cap)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без капіталізації</SelectItem>
                <SelectItem value="monthly">Щомісяця</SelectItem>
                <SelectItem value="quarterly">Щокварталу</SelectItem>
              </SelectContent>
            </Select>
            {cap !== "none" && capDiff > 0 && (
              <p className="text-[11px] text-muted-foreground mt-1 px-0.5">
                Капіталізація дає <span className="font-semibold text-emerald-600">+{fmt(capDiff)} ₴</span> vs без неї
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Поповнення, ₴/міс <InfoTip text="Щомісячне додаткове поповнення (необов'язково)" /></Label>
            <Input type="number" min={0} value={topup} onChange={e => setTopup(Math.max(0, +e.target.value || 0))} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Інфляція, % <InfoTip text="Середньорічна інфляція. Якщо ставка ≤ інфляції — ви втрачаєте в реальному вираженні" /></Label>
            <Input type="number" min={0} max={50} value={inflation} onChange={e => setInflation(Math.max(0, +e.target.value || 0))} step={0.5} className="text-right h-9 text-sm" />
          </div>
        </div>

        {/* Institution picker */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {selected.map(id => {
              const inst = depositInstitutions.find(i => i.id === id)!;
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                  <span className="w-4 h-4 rounded-full text-[7px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: inst.color }}>{inst.initials}</span>
                  {inst.name}
                  <button onClick={() => toggleInst(id)} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                </span>
              );
            })}
            {selected.length < 3 && depositInstitutions.length > 0 && (
              <button onClick={() => setShowPicker(!showPicker)}
                className="px-2.5 py-1 rounded-full text-[11px] border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
                <Building2 className="w-3 h-3 inline mr-1" />+ Порівняти
              </button>
            )}
          </div>
          {showPicker && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 rounded-lg border border-border bg-card max-h-40 overflow-y-auto">
              {depositInstitutions.filter(i => !selected.includes(i.id)).map(inst => (
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
        <div className="bg-gradient-to-br from-emerald-500/8 to-transparent p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Чистий дохід після податків</p>
              <p className="text-3xl sm:text-4xl font-bold text-emerald-600 tracking-tight">+{fmt(results[0].netProfit)} ₴</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4 text-xs sm:ml-auto">
              <div className="sm:text-right">
                <p className="text-muted-foreground">Нараховано</p>
                <p className="font-semibold">+{fmt(results[0].totalInterest)} ₴</p>
              </div>
              <div className="sm:text-right">
                <p className="text-muted-foreground">Податки (23%)</p>
                <p className="font-semibold text-destructive">-{fmt(results[0].tax)} ₴</p>
              </div>
              <div className="sm:text-right">
                <p className="text-muted-foreground">Баланс</p>
                <p className="font-semibold">{fmt(results[0].finalBalance)} ₴</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Inflation badge */}
      <div className={`px-3 py-2 text-xs rounded-lg border flex items-start gap-2 ${
        realYield > 0
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400"
      }`}>
        {realYield > 0 ? (
          <><ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Депозит обганяє інфляцію на <span className="font-bold">{realYield.toFixed(1)}%</span> — ви заробляєте в реальному вираженні. Реальний баланс: <span className="font-bold">{fmt(results[0].realFinalBalance)} ₴</span></span></>
        ) : (
          <><AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Депозит не покриває інфляцію ({rate}% &lt; {inflation}%). Реальна дохідність: <span className="font-bold">{realYield.toFixed(1)}%</span>. Без депозиту ваші {fmt(amount)} ₴ через {months} міс. матимуть купівельну спроможність {fmt(realValueWithout)} ₴</span></>
        )}
      </div>

      {/* FGVFO warning/success */}
      <div className={`px-3 py-2 text-xs rounded-lg border flex items-center gap-2 ${
        isFGVFOExceeded
          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400"
          : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
      }`}>
        {isFGVFOExceeded ? (
          <>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Сума перевищує гарантію <span className="font-semibold">ФГВФО (600 000 ₴)</span>. Розгляньте розподіл між кількома банками</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Повністю під захистом <span className="font-semibold">ФГВФО</span> (гарантія до 600 000 ₴)</span>
          </>
        )}
      </div>

      {/* Topup effect */}
      {topup > 0 && topupEffect > 0 && (
        <div className="px-3 py-2 text-xs text-muted-foreground rounded-lg bg-muted/30 border border-border/50">
          📈 Ваші поповнення {fmt(topup)} ₴/міс приносять додатково <span className="font-bold text-emerald-600">+{fmt(topupEffect)} ₴</span> чистого доходу. Без поповнень: <span className="font-medium">{fmt(withoutTopup.netProfit)} ₴</span>
        </div>
      )}

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
                {"color" in r && typeof (r as any).color === "string" && (
                  <span className="w-5 h-5 rounded-full text-[8px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: (r as any).color }}>{(r as any).initials}</span>
                )}
                <p className="text-xs font-semibold">{r.label}</p>
                <span className="ml-auto text-[11px] bg-muted px-1.5 py-0.5 rounded-full">{r.rate}%</span>
              </div>
              <div className="bg-emerald-500/5 rounded-lg p-3">
                <p className="text-xl font-bold text-emerald-600">+{fmt(r.netProfit)} ₴</p>
                <p className="text-xs text-muted-foreground">Баланс: {fmt(r.finalBalance)} ₴</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Capitalization benefit + effective rate */}
      {cap !== "none" && (
        <div className="px-3 py-2 text-xs text-muted-foreground rounded-lg bg-muted/30 border border-border/50 space-y-0.5">
          {capDiff > 0 && <p>💡 Капіталізація дає <span className="font-bold text-emerald-600">+{fmt(capDiff)} ₴</span> додатково</p>}
          <p>Ефективна ставка: <span className="font-semibold text-foreground">{effectiveRate}%</span> (номінальна: {rate}%)</p>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 2 && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold">Зростання балансу</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}М` : `${(v / 1000).toFixed(0)}к`} className="text-muted-foreground" />
              <ReTooltip
                contentStyle={{ borderRadius: 12, fontSize: 11, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { balance: "Номінальний", balanceNoCap: "Без капіталізації", realBalance: "Реальна вартість" };
                  return [`${fmt(value)} ₴`, labels[name] || name];
                }}
                labelFormatter={v => `Місяць ${v}`}
              />
              <Area type="monotone" dataKey="balance" fill="hsl(142 71% 45% / 0.15)" stroke="hsl(142 71% 45%)" strokeWidth={2} name="balance" />
              {cap !== "none" && (
                <Line type="monotone" dataKey="balanceNoCap" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="balanceNoCap" />
              )}
              {inflation > 0 && (
                <Line type="monotone" dataKey="realBalance" stroke="hsl(45 93% 47%)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="realBalance" />
              )}
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500" /> Номінальний баланс</span>
            {cap !== "none" && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border border-muted-foreground/40 border-dashed" /> Без капіталізації</span>}
            {inflation > 0 && <span className="flex items-center gap-1"><span className="w-5 h-0 border-t-2 border-dashed border-amber-500" /> Реальна вартість</span>}
          </div>
        </Card>
      )}

      {/* Notes */}
      <div className="px-3 py-2 text-xs text-muted-foreground rounded-lg bg-muted/30 border border-border/50 space-y-1">
        <p>💰 Банк автоматично утримає податки (23%). Ви отримаєте суму вже за вирахуванням</p>
        {months > 12 && <p>📋 Термін &gt; 12 міс — перевірте умови дострокового розірвання у вашому банку</p>}
      </div>

      {/* Schedule — first 6 + expand */}
      <Collapsible open={showSchedule} onOpenChange={setShowSchedule}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between text-xs">
            Помісячний розрахунок
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSchedule ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-2 text-left font-medium text-muted-foreground">Міс.</th>
                  <th className="p-2 text-right font-medium text-muted-foreground">Нараховано</th>
                  <th className="p-2 text-right font-medium text-muted-foreground">Баланс</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr key={row.month} className={`border-b border-border/30 ${i % 2 === 0 ? "bg-muted/10" : ""}`}>
                    <td className="p-2 font-medium">{row.month}</td>
                    <td className="p-2 text-right text-emerald-600">+{fmt(row.interest)}</td>
                    <td className="p-2 text-right font-semibold">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results[0].rows.length > 6 && !showAllSchedule && (
              <button
                onClick={() => setShowAllSchedule(true)}
                className="w-full py-2 text-xs text-primary hover:bg-muted/50 transition-colors border-t border-border"
              >
                Показати всі {results[0].rows.length} міс. ↓
              </button>
            )}
            {showAllSchedule && results[0].rows.length > 6 && (
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
