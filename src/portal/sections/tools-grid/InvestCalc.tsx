import { useState, useMemo } from "react";
import { useCalcShareState } from "@/portal/hooks/useCalcShareState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Info, TrendingUp, TrendingDown, ChevronDown, AlertTriangle, ShieldCheck, Zap, Flame, Skull, RotateCcw, ExternalLink, Star, Share2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { formatNumber } from "@/lib/formatters";
import { SERVICES_PROFILES } from "@/portal/data/institutionProfiles-services";

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

const fmt = (n: number) => formatNumber(Math.round(n));

const PRESETS = [
  { id: "deposit", label: "Депозит (топ-банки)", rate: 12, risk: "minimal" as const, icon: ShieldCheck, taxRate: 0.23, drawdown: 0, desc: "Гарантований дохід, захист ФГВФО до 600 000 ₴", howTo: "Відкрити: будь-який банк з ліцензією НБУ. Захист ФГВФО до 600 000 ₴" },
  { id: "ovdp", label: "ОВДП (держоблігації)", rate: 15, risk: "low" as const, icon: ShieldCheck, taxRate: 0.015, drawdown: 0.05, desc: "Гарантія держави. Звільнені від ПДФО (ст. 165.1.52 ПКУ), лише 1.5% ВЗ", howTo: "Купити: monobank, PrivatBank, або через брокера. Мін. сума: від 1 000 ₴" },
  { id: "etf", label: "ETF на S&P 500", rate: 10, risk: "medium" as const, icon: Zap, taxRate: 0.23, drawdown: 0.34, desc: "Фонд, що повторює індекс 500 найбільших компаній США. Історично ~10%/рік", howTo: "Купити: через брокера (Freedom Finance, ICU). Мін. сума: ~$1-50" },
  { id: "stocks", label: "Акції (активне)", rate: 18, risk: "high" as const, icon: Flame, taxRate: 0.23, drawdown: 0.50, desc: "Потребує досвіду. Може падати на 30-50% за рік. Високий потенціал", howTo: "Потребує брокерський рахунок. Рекомендовано для досвідчених інвесторів" },
  { id: "crypto", label: "Крипто (BTC)", rate: 30, risk: "very_high" as const, icon: Skull, taxRate: 0.23, drawdown: 0.78, desc: "Волатильність до 80%. Тільки вільні кошти, які ви готові втратити", howTo: "Купити: Binance, Kuna. Зверніть увагу на комісії за вивід" },
  { id: "stagflation", label: "Стагфляція", rate: 4, risk: "high" as const, icon: Flame, taxRate: 0.23, drawdown: 0.25, desc: "Сценарій: інфляція 18%+, дохідність активів 3-5%. Реальна дохідність від'ємна. Історичні приклади: Україна 2014-2015, Аргентина, Туреччина", howTo: "Захист: нерухомість, золото, валютні ОВДП, індексовані облігації. Уникайте: гривневі депозити, довгі облігації з фіксованою ставкою" },
  { id: "custom", label: "Свій варіант", rate: 0, risk: "custom" as const, icon: Zap, taxRate: 0.23, drawdown: 0, desc: "", howTo: "" },
] as const;

const RISK_CONFIG: Record<string, { label: string; variant: "success" | "info" | "warning" | "error" | "secondary" }> = {
  minimal: { label: "Мінімальний ризик", variant: "success" },
  low: { label: "Низький ризик", variant: "success" },
  medium: { label: "Середній ризик", variant: "warning" },
  high: { label: "Високий ризик", variant: "error" },
  very_high: { label: "Дуже високий ризик", variant: "error" },
  custom: { label: "Свій", variant: "secondary" },
};

const DEFAULTS = { initial: 50000, monthly: 5000, returnRate: 15, years: 10, inflation: 10, preset: "ovdp", depositCompareRate: 12 };

function calcInvestment(initial: number, monthly: number, annualReturn: number, years: number, inflation: number, taxRate: number) {
  const r = annualReturn / 100 / 12;
  const infR = inflation / 100;
  const yearData: { year: number; invested: number; earned: number; realValue: number; balance: number; pessimistic: number }[] = [];

  let balance = initial;
  let totalInvested = initial;

  // Pessimistic scenario inline
  const pessR = Math.max(0, annualReturn - 5) / 100 / 12;
  let pessBalance = initial;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + monthly;
      pessBalance = pessBalance * (1 + pessR) + monthly;
      totalInvested += monthly;
    }
    const earned = balance - totalInvested;
    const realValue = balance / Math.pow(1 + infR, y);
    yearData.push({ year: y, invested: Math.round(totalInvested), earned: Math.round(earned), realValue: Math.round(realValue), balance: Math.round(balance), pessimistic: Math.round(pessBalance) });
  }

  const totalEarned = balance - totalInvested;
  const tax = totalEarned > 0 ? totalEarned * taxRate : 0;
  const netBalance = balance - tax;
  const realNetBalance = netBalance / Math.pow(1 + infR, years);

  const simpleBalance = initial * (1 + annualReturn / 100 * years) + monthly * 12 * years;
  const compoundEffect = Math.max(0, balance - simpleBalance);

  return { balance, totalInvested, totalEarned, tax, netBalance, realNetBalance, yearData, compoundEffect, taxRate };
}

function calcDeposit(initial: number, monthly: number, rate: number, years: number) {
  let balance = initial;
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + rate / 100 / 12) + monthly;
    }
  }
  const totalInvested = initial + monthly * 12 * years;
  const interest = balance - totalInvested;
  const tax = interest * 0.23;
  return balance - tax;
}

export const InvestCalc = () => {
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [returnRate, setReturnRate] = useState(DEFAULTS.returnRate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [selectedPreset, setSelectedPreset] = useState(DEFAULTS.preset);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [depositCompareRate, setDepositCompareRate] = useState(DEFAULTS.depositCompareRate);

  const activePreset = PRESETS.find(p => p.id === selectedPreset);
  const riskConfig = activePreset ? RISK_CONFIG[activePreset.risk] : null;
  const currentTaxRate = activePreset?.taxRate ?? 0.23;
  const taxPercent = (currentTaxRate * 100).toFixed(1).replace(/\.0$/, "");

  const result = useMemo(
    () => calcInvestment(initial, monthly, returnRate, years, inflation, currentTaxRate),
    [initial, monthly, returnRate, years, inflation, currentTaxRate]
  );

  const depositResult = useMemo(
    () => calcDeposit(initial, monthly, depositCompareRate, years),
    [initial, monthly, years, depositCompareRate]
  );

  // 3 scenarios
  const scenarioOptimistic = useMemo(
    () => calcInvestment(initial, monthly, returnRate + 5, years, inflation, currentTaxRate),
    [initial, monthly, returnRate, years, inflation, currentTaxRate]
  );
  const scenarioPessimistic = useMemo(
    () => calcInvestment(initial, monthly, Math.max(0, returnRate - 5), years, inflation, currentTaxRate),
    [initial, monthly, returnRate, years, inflation, currentTaxRate]
  );

  const realReturn = result.totalInvested > 0 ? ((result.realNetBalance / result.totalInvested - 1) * 100).toFixed(1) : "0";
  const diffVsDeposit = result.netBalance - depositResult;

  const handleReset = () => {
    setInitial(DEFAULTS.initial); setMonthly(DEFAULTS.monthly); setReturnRate(DEFAULTS.returnRate);
    setYears(DEFAULTS.years); setInflation(DEFAULTS.inflation); setSelectedPreset(DEFAULTS.preset);
    setDepositCompareRate(DEFAULTS.depositCompareRate);
  };

  const { copyShareLink } = useCalcShareState([
    { key: "initial", urlKey: "i", getter: () => initial, setter: v => setInitial(Number(v)), defaultValue: DEFAULTS.initial },
    { key: "monthly", urlKey: "m", getter: () => monthly, setter: v => setMonthly(Number(v)), defaultValue: DEFAULTS.monthly },
    { key: "rate", urlKey: "r", getter: () => returnRate, setter: v => setReturnRate(Number(v)), defaultValue: DEFAULTS.returnRate },
    { key: "years", urlKey: "y", getter: () => years, setter: v => setYears(Number(v)), defaultValue: DEFAULTS.years },
    { key: "inflation", urlKey: "inf", getter: () => inflation, setter: v => setInflation(Number(v)), defaultValue: DEFAULTS.inflation },
    { key: "preset", urlKey: "p", getter: () => selectedPreset, setter: v => { setSelectedPreset(v); const p = PRESETS.find(x => x.id === v); if (p && p.id !== "custom") setReturnRate(p.rate); }, defaultValue: DEFAULTS.preset },
  ]);

  return (
    <div className="space-y-4">
      {/* Inputs FIRST — standard pattern */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Параметри інвестування</p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={copyShareLink} className="h-7 px-2 text-xs text-muted-foreground">
              <Share2 className="w-3 h-3 mr-1" /> Поділитися
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs text-muted-foreground">
              <RotateCcw className="w-3 h-3 mr-1" /> Скинути
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Початкова сума <InfoTip text="Сума, з якої ви починаєте інвестувати" /></Label>
            <Input type="number" min={0} value={initial} onChange={e => setInitial(Math.max(0, +e.target.value || 0))} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Внесок/міс <InfoTip text="Регулярне щомісячне поповнення. Навіть 1000 ₴/міс дають великий ефект за 10+ років" /></Label>
            <Input type="number" min={0} value={monthly} onChange={e => setMonthly(Math.max(0, +e.target.value || 0))} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Дохідність, % <InfoTip text="Середньорічна очікувана дохідність. Оберіть пресет нижче або введіть свою" /></Label>
            <Input type="number" min={0} max={100} value={returnRate} onChange={e => { setReturnRate(Math.max(0, +e.target.value || 0)); setSelectedPreset("custom"); }} step={0.5} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Термін, років</Label>
            <Input type="number" min={1} max={30} value={years} onChange={e => setYears(Math.min(30, Math.max(1, +e.target.value || 1)))} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Інфляція, % <InfoTip text="Середньорічна інфляція в Україні. Історично ~10%, останні роки — 12-25%" /></Label>
            <Input type="number" min={0} max={50} value={inflation} onChange={e => setInflation(Math.max(0, +e.target.value || 0))} step={0.5} className="text-right h-9 text-sm" />
          </div>
        </div>

        {/* Instrument presets */}
        <div className="mt-3 space-y-2">
          <Label className="text-xs text-muted-foreground">Інструмент <InfoTip text="Оберіть тип інвестиційного інструменту — дохідність та ризик підставляться автоматично" /></Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => {
              const isActive = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPreset(p.id);
                    if (p.id !== "custom") setReturnRate(p.rate);
                    setInflation(p.id === "stagflation" ? 18 : DEFAULTS.inflation);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isActive ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <p.icon className="w-3 h-3" />
                  {p.label}
                  {p.id !== "custom" && <span className="text-[10px] opacity-70">{p.rate}%</span>}
                </button>
              );
            })}
          </div>
          {activePreset && activePreset.id !== "custom" && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 text-xs">
                {riskConfig && <Badge variant={riskConfig.variant} size="sm">{riskConfig.label}</Badge>}
                <span className="text-muted-foreground">{activePreset.desc}</span>
              </div>
              {activePreset.howTo && (
                <p className="text-xs text-muted-foreground px-1">
                  <span className="font-medium text-foreground">📍 Як почати:</span> {activePreset.howTo}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Hero Result — AFTER inputs */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-border">
          <div className="bg-gradient-to-br from-primary/8 to-transparent p-4 sm:p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">Номінальний капітал</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{fmt(result.netBalance)} ₴</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Вкладено:</span><span className="font-medium">{fmt(result.totalInvested)} ₴</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Зароблено:</span><span className="font-medium text-emerald-600">+{fmt(result.totalEarned)} ₴</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Податки ({taxPercent}%):</span><span className="font-medium text-destructive">-{fmt(result.tax)} ₴</span></div>
            </div>
          </div>
          <div className={`bg-gradient-to-br ${+realReturn < 0 ? "from-destructive/8" : "from-amber-500/8"} to-transparent p-4 sm:p-5`}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-xs text-muted-foreground">Реальна вартість <InfoTip text="Купівельна спроможність з урахуванням інфляції — скільки ваш капітал коштуватиме в сьогоднішніх цінах" /></p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{fmt(result.realNetBalance)} ₴</p>
             <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Реальна дохідність:</span><span className={`font-bold ${+realReturn > 0 ? "text-emerald-600" : "text-destructive"}`}>{realReturn}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Інфляція з'їдає:</span><span className="text-amber-600">-{fmt(result.netBalance - result.realNetBalance)} ₴</span></div>
            </div>
          </div>
        </div>
        {/* Summary line + compound effect */}
        <div className="px-4 py-2.5 bg-muted/30 border-t border-border text-xs text-muted-foreground">
          Кожна вкладена гривня принесе <span className="font-semibold text-primary">{result.totalInvested > 0 ? (result.netBalance / result.totalInvested).toFixed(2) : "0"} ₴</span>
          {result.compoundEffect > 1000 && (
            <span>. Складні відсотки дають додатково <span className="font-semibold text-emerald-600">+{fmt(result.compoundEffect)} ₴</span></span>
          )}
        </div>
      </Card>

      {/* Negative Real Return Warning */}
      {+realReturn < 0 && (
        <div className="px-3 py-2.5 text-xs rounded-lg border bg-destructive/5 border-destructive/20 text-destructive flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">⚠ Від'ємна реальна дохідність: {realReturn}%</span>
            <p className="mt-0.5 text-muted-foreground">
              Інфляція ({inflation}%) перевищує дохідність ({returnRate}%).
              За {years} р. ваші {fmt(result.totalInvested)} ₴ матимуть купівельну спроможність лише {fmt(result.realNetBalance)} ₴.
              Розгляньте інструменти з вищою дохідністю або коротший термін.
            </p>
          </div>
        </div>
      )}

      {/* Drawdown / Risk Alert */}
      {activePreset && activePreset.id !== "custom" && activePreset.drawdown > 0 && (
        <div className={`px-3 py-2.5 text-xs rounded-lg border flex items-start gap-2 ${
          activePreset.drawdown >= 0.3
            ? "bg-destructive/5 border-destructive/20 text-destructive"
            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400"
        }`}>
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Історичний максимальний drawdown: -{(activePreset.drawdown * 100).toFixed(0)}%.</span>{" "}
            У найгірший рік ваш портфель міг би впасти до <span className="font-bold">{fmt(result.netBalance * (1 - activePreset.drawdown))} ₴</span>. Чи готові ви до такого просідання?
          </div>
        </div>
      )}

      {/* 3 Scenarios */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="px-2 py-2 rounded-lg bg-destructive/5 border border-destructive/20">
          <p className="text-[11px] text-muted-foreground">Песимістичний ({Math.max(0, returnRate - 5)}%)</p>
          <p className="text-sm font-bold">{fmt(scenarioPessimistic.netBalance)} ₴</p>
        </div>
        <div className="px-2 py-2 rounded-lg bg-primary/5 border border-primary/30">
          <p className="text-[11px] text-muted-foreground">Базовий ({returnRate}%)</p>
          <p className="text-sm font-bold text-primary">{fmt(result.netBalance)} ₴</p>
        </div>
        <div className="px-2 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <p className="text-[11px] text-muted-foreground">Оптимістичний ({returnRate + 5}%)</p>
          <p className="text-sm font-bold text-emerald-600">{fmt(scenarioOptimistic.netBalance)} ₴</p>
        </div>
      </div>

      {/* Invest vs Deposit comparison — editable rate */}
      <div className="px-3 py-2.5 text-xs text-muted-foreground rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>Порівняння з депозитом під</span>
          <Input
            type="number"
            min={0}
            value={depositCompareRate}
            onChange={e => setDepositCompareRate(Math.max(0, +e.target.value || 0))}
            step={0.5}
            className="w-16 h-6 text-xs text-center px-1 py-0 inline-block"
          />
          <span>%:</span>
          {diffVsDeposit > 0 ? (
            <span>інвестуючи під {returnRate}%, ви отримаєте на <span className="font-bold text-emerald-600">{fmt(diffVsDeposit)} ₴ більше</span> за {years} р., але з вищим ризиком.</span>
          ) : (
            <span>депозит дасть на <span className="font-bold text-primary">{fmt(Math.abs(diffVsDeposit))} ₴ більше</span> і з мінімальним ризиком.</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold">Зростання капіталу по роках</p>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={result.yearData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `${v}р`} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}М` : `${(v / 1000).toFixed(0)}к`} className="text-muted-foreground" />
            <ReTooltip
              contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = { invested: "Вкладено", earned: "Зароблено", realValue: "Реальна вартість", pessimistic: "Песимістичний" };
                return [`${fmt(value)} ₴`, labels[name] || name];
              }}
              labelFormatter={v => `Рік ${v}`}
            />
            <Bar dataKey="invested" stackId="a" fill="hsl(var(--muted-foreground) / 0.2)" radius={[0, 0, 0, 0]} name="invested" />
            <Bar dataKey="earned" stackId="a" fill="hsl(var(--primary) / 0.7)" radius={[4, 4, 0, 0]} name="earned" />
            <Line type="monotone" dataKey="realValue" stroke="hsl(45 93% 47%)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="realValue" />
            <Line type="monotone" dataKey="pessimistic" stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="pessimistic" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted-foreground/20" /> Вкладено</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary/70" /> Зароблено</span>
          <span className="flex items-center gap-1"><span className="w-5 h-0 border-t-2 border-dashed border-amber-500" /> Реальна вартість</span>
          <span className="flex items-center gap-1"><span className="w-5 h-0 border-t-2 border-dashed border-destructive" /> Песимістичний</span>
        </div>
      </Card>

      {/* Broker Comparison */}
      {selectedPreset !== "deposit" && selectedPreset !== "custom" && (() => {
        const brokers = SERVICES_PROFILES.filter(p => p.types.includes('broker'));
        
        // Filter brokers by preset relevance
        const relevantBrokers = selectedPreset === "crypto" ? [] : brokers.filter(b => {
          if (selectedPreset === "ovdp") return true; // all brokers sell OVDP
          // ETF/stocks — Freedom Finance + Dragon Capital
          return b.slug !== "icu";
        });

        if (selectedPreset === "crypto") {
          return (
            <div className="px-3 py-2.5 text-xs text-muted-foreground rounded-lg bg-muted/30 border border-border/50">
              💱 Криптовалюти купуються через криптобіржі (Binance, Kuna, WhiteBIT), а не через брокерів. Зверніть увагу на комісії за вивід.
            </div>
          );
        }

        const bestBroker = relevantBrokers.reduce((best, b) => 
          (b.ratings.fintodo.overall > (best?.ratings.fintodo.overall ?? 0)) ? b : best, 
          relevantBrokers[0]
        );

        return (
          <Card className="p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              📊 Порівняти брокерів
              <InfoTip text="Для купівлі інвестиційних інструментів потрібен брокерський рахунок. Порівняйте умови" />
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {relevantBrokers.map(broker => {
                const isBest = broker.slug === bestBroker?.slug;
                const product = broker.products[0];
                const commission = product?.price?.pricingNote || "За запитом";
                const minAmount = product?.cons?.find(c => c.includes("Мін"))?.replace(/^Мін\.\s*/, "") || 
                  product?.cons?.find(c => c.toLowerCase().includes("від"))?.match(/від\s+[\d\s₴$]+/i)?.[0] || "За запитом";
                const hasMobile = broker.platforms?.ios?.available || broker.platforms?.android?.available;
                const instruments = broker.products.map(p => p.category).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(", ");

                return (
                  <div key={broker.slug} className={`relative p-3 rounded-lg border text-xs space-y-2 ${isBest ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                    {isBest && (
                      <Badge variant="success" size="sm" className="absolute -top-2 right-2">Рекомендовано</Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: broker.logo.color }}>
                        {broker.logo.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{broker.shortName}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {broker.ratings.fintodo.overall}/10
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span>Комісія:</span><span className="font-medium text-foreground">{commission.replace(/Комісія\s*/i, "").slice(0, 30)}</span></div>
                      <div className="flex justify-between"><span>Інструменти:</span><span className="font-medium text-foreground">{instruments || "—"}</span></div>
                      <div className="flex justify-between"><span>Платформа:</span><span className="font-medium text-foreground">{hasMobile ? "Web + Mobile" : "Web"}</span></div>
                    </div>
                    {product?.ctaUrl && (
                      <a href={product.ctaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-medium">
                        Відкрити рахунок <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}

      {/* Important disclaimers */}
      <Collapsible open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-xs font-medium text-muted-foreground">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Важливо розуміти
          <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${showDisclaimer ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 p-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
            <div className="flex gap-2"><span className="text-amber-500 shrink-0">⚠️</span> <span><span className="font-semibold text-foreground">Дохідність у минулому не гарантує дохідність у майбутньому.</span> Розрахунок показує прогноз на базі фіксованої дохідності, реальний результат може суттєво відрізнятися.</span></div>
            <div className="flex gap-2"><span className="shrink-0">📉</span> <span><span className="font-semibold text-foreground">Акції можуть падати на 30-50% за рік</span>, але історично (S&P 500) відновлюються протягом 3-5 років. Інвестуйте тільки на довгий термін (5+ років).</span></div>
            <div className="flex gap-2"><span className="shrink-0">🏛️</span> <span><span className="font-semibold text-foreground">ОВДП</span> — гарантія держави, звільнені від ПДФО (ст. 165.1.52 ПКУ), сплачується лише 1.5% ВЗ. Але підлягають інфляційному ризику.</span></div>
            <div className="flex gap-2"><span className="shrink-0">💰</span> <span><span className="font-semibold text-foreground">Податки:</span> ПДФО 18% + ВЗ 5% = 23% сплачуються при фіксації прибутку (продаж активу, дивіденди). <span className="font-medium">ОВДП — лише 1.5% ВЗ.</span></span></div>
            <div className="flex gap-2"><span className="shrink-0">🎯</span> <span><span className="font-semibold text-foreground">Для початківців:</span> Почніть з ОВДП або ETF (наприклад, Vanguard S&P 500). Диверсифікуйте — не вкладайте все в один інструмент.</span></div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
