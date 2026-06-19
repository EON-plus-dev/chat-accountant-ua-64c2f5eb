import { useState, useMemo } from "react";
import { useCalcShareState } from "@/portal/hooks/useCalcShareState";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, ShieldCheck, Car, Heart, Plane, RotateCcw, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Award } from "lucide-react";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { formatNumber } from "@/lib/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, PieChart, Pie, Label as RechartsLabel } from "recharts";

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

const INSURERS = INSTITUTION_PROFILES.filter(p => p.types.includes("insurance"));

const BAR_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(210,60%,55%)"];

// ─── Hero Result Block ───
const HeroResult = ({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: number; subtitle?: string }) => (
  <Card className="p-4 bg-primary/5 border-primary/20">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-primary">{fmt(value)} ₴</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  </Card>
);

// ─── BarChart comparison ───
const ComparisonBarChart = ({ data, unit = "₴/рік" }: { data: { name: string; value: number; best: boolean }[]; unit?: string }) => (
  <div className="w-full">
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 52)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 50, top: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={v => fmt(v)} className="text-xs" />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.best ? "hsl(var(--primary))" : BAR_COLORS[i % BAR_COLORS.length]} opacity={entry.best ? 1 : 0.6} />
          ))}
          <LabelList dataKey="value" position="right" formatter={(v: number) => `${fmt(v)} ${unit.replace("/рік", "")}`} className="text-xs fill-foreground" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
      <div className="w-3 h-3 rounded-sm bg-primary" />
      Найвигідніше
    </div>
  </div>
);

// ─── Company Selector (chip toggles) ───
const CompanySelector = ({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) => {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length <= 1) return; // min 1
      onChange(selected.filter(s => s !== id));
    } else {
      if (selected.length >= 4) return; // max 4
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">Компанії для порівняння <span className="text-muted-foreground/60">(від 1 до 4)</span></p>
      <div className="flex flex-wrap gap-1.5">
        {INSURERS.map(ins => {
          const isActive = selected.includes(ins.id);
          return (
            <button
              key={ins.id}
              type="button"
              onClick={() => toggle(ins.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {ins.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Result Cards with CTA ───
const ResultCards = ({ results, bestId, categorySlug }: { results: { id: string; name: string; value: number }[]; bestId: string; categorySlug: string }) => {
  const getProfileUrl = (id: string) => {
    const profile = INSTITUTION_PROFILES.find(p => p.id === id);
    return profile ? `/directory/${categorySlug}/${profile.slug}` : "#";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {results.map(r => (
        <div
          key={r.id}
          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
            r.id === bestId
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-card"
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">{r.name}</span>
              {r.id === bestId && (
                <Badge variant="success" size="sm" className="shrink-0">
                  <Award className="w-2.5 h-2.5 mr-0.5" />Найкраще
                </Badge>
              )}
            </div>
            <p className="text-lg font-bold text-foreground">{fmt(r.value)} ₴</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 h-8 text-xs" asChild>
            <a href={getProfileUrl(r.id)}>
              Деталі <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
};

// ─── Reset Button ───
const ResetButton = ({ onReset }: { onReset: () => void }) => (
  <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-xs text-muted-foreground">
    <RotateCcw className="w-3 h-3 mr-1" /> Скинути
  </Button>
);

// ─── ОСЦПВ coefficients ───
const ZONE_COEF: Record<string, number> = { "1": 1.2, "2": 1.0, "3": 0.8, "4": 0.7, "5": 0.6 };
const ZONE_LABELS: Record<string, string> = { "1": "Зона 1 (Київ, Одеса)", "2": "Зона 2 (обласні центри)", "3": "Зона 3 (міста 50-200 тис)", "4": "Зона 4 (невеликі міста)", "5": "Зона 5 (сільська місцевість)" };
const ENGINE_COEF: Record<string, number> = { "1.6": 0.9, "2.0": 1.0, "2.5": 1.1, "3.0": 1.3 };
const KBM_OPTIONS = [
  { value: "0.5", label: "0.5 (10+ років без ДТП)" },
  { value: "0.6", label: "0.6 (6-9 років без ДТП)" },
  { value: "0.8", label: "0.8 (3-5 років без ДТП)" },
  { value: "1.0", label: "1.0 (стандарт)" },
  { value: "1.2", label: "1.2 (1 ДТП за рік)" },
  { value: "1.55", label: "1.55 (2 ДТП за рік)" },
  { value: "2.85", label: "2.85 (3+ ДТП за рік)" },
];
const VEHICLE_BASE: Record<string, number> = { car: 680, truck: 1100, moto: 350 };
const EXP_COEF: Record<string, number> = { "0": 1.8, "2": 1.2, "5": 1.0 };

// ─── КАСКО coefficients ───
const FRANCHISE_COEF: Record<string, number> = { "0": 1.0, "2": 0.85, "5": 0.7, "10": 0.55 };
const AGE_COEF_KASKO = (age: number) => age <= 3 ? 1.0 : age <= 7 ? 1.15 : 1.35;
const PARKING_COEF: Record<string, number> = { garage: 0.9, yard: 1.0, street: 1.15 };

// ─── Health tiers ───
const HEALTH_TIERS = {
  basic: { label: "Базовий", price: 5000, includes: ["Амбулаторне лікування", "Виклик лікаря", "Аналізи"], excludes: ["Стаціонар", "Стоматологія", "Реабілітація"] },
  standard: { label: "Стандарт", price: 10000, includes: ["Амбулаторне лікування", "Стаціонар", "Виклик лікаря", "Аналізи", "Базова стоматологія"], excludes: ["Протезування", "Реабілітація"] },
  premium: { label: "Преміум", price: 25000, includes: ["Амбулаторне", "Стаціонар", "Стоматологія", "Реабілітація", "Аналізи", "Виклик лікаря", "Санаторій"], excludes: ["Пластична хірургія"] },
};
const ALL_HEALTH_SERVICES = ["Амбулаторне", "Стаціонар", "Виклик лікаря", "Аналізи", "Стоматологія", "Реабілітація", "Санаторій"];
const HEALTH_AGE_COEF = (age: number) => age < 30 ? 0.8 : age < 45 ? 1.0 : age < 60 ? 1.4 : 2.0;

// ─── Travel ───
const TRAVEL_ZONE: Record<string, { label: string; base: number; coverage: string }> = {
  europe: { label: "Європа / Шенген", base: 1.8, coverage: "€30 000" },
  world: { label: "Весь світ", base: 2.5, coverage: "€50 000" },
};
const TRAVEL_TYPE_COEF: Record<string, { label: string; coef: number }> = { standard: { label: "Стандарт", coef: 1.0 }, sport: { label: "Активний відпочинок", coef: 1.6 }, business: { label: "Бізнес", coef: 1.3 } };
const USD_UAH = 41.5;

// ─── Company comparison modifiers ───
const COMPANY_MODIFIER: Record<string, number> = {};
INSURERS.forEach((ins, i) => {
  COMPANY_MODIFIER[ins.id] = [0.95, 1.0, 1.05, 1.1][i % 4];
});

// ═══════════════════════════════
// ОСЦПВ Tab
// ═══════════════════════════════
const OscpvTab = () => {
  const defaults = { vehicleType: "car", engine: "2.0", zone: "2", kbm: "1.0", isElectric: false, experience: "5" };
  const [vehicleType, setVehicleType] = useState(defaults.vehicleType);
  const [engine, setEngine] = useState(defaults.engine);
  const [zone, setZone] = useState(defaults.zone);
  const [kbm, setKbm] = useState(defaults.kbm);
  const [isElectric, setIsElectric] = useState(defaults.isElectric);
  const [experience, setExperience] = useState(defaults.experience);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(INSURERS.slice(0, Math.min(3, INSURERS.length)).map(i => i.id));

  const companies = INSURERS.filter(i => selectedCompanies.includes(i.id));

  const calcOscpv = (companyId: string) => {
    const base = VEHICLE_BASE[vehicleType] || 680;
    const mod = COMPANY_MODIFIER[companyId] || 1.0;
    const evMod = isElectric ? 0.7 : 1.0;
    const expMod = EXP_COEF[experience] || 1.0;
    return Math.round(base * ZONE_COEF[zone] * +kbm * (ENGINE_COEF[engine] || 1.0) * mod * evMod * expMod);
  };

  const results = useMemo(() => companies.map(c => ({ id: c.id, name: c.name, value: calcOscpv(c.id) })), [vehicleType, engine, zone, kbm, isElectric, experience, selectedCompanies]);
  const bestId = results.reduce((a, b) => a.value < b.value ? a : b, results[0])?.id;
  const bestResult = results.find(r => r.id === bestId);
  const worstValue = Math.max(...results.map(r => r.value));
  const savings = bestResult ? worstValue - bestResult.value : 0;

  const handleReset = () => {
    setVehicleType(defaults.vehicleType); setEngine(defaults.engine); setZone(defaults.zone);
    setKbm(defaults.kbm); setIsElectric(defaults.isElectric); setExperience(defaults.experience);
  };

  const chartData = results.map(r => ({ name: r.name, value: r.value, best: r.id === bestId }));

  return (
    <div className="space-y-4">
      {bestResult && (
        <HeroResult
          icon={<Car className="w-5 h-5 text-primary" />}
          label="ОСЦПВ від"
          value={bestResult.value}
          subtitle={`Найвигідніше: ${bestResult.name}${savings > 0 ? ` · Економія: ${fmt(savings)} ₴` : ""}`}
        />
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" size="sm">Обов'язково</Badge>
            <p className="text-sm font-semibold">Параметри ОСЦПВ</p>
          </div>
          <ResetButton onReset={handleReset} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Тип ТЗ</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="car">🚗 Легкове</SelectItem>
                <SelectItem value="truck">🚛 Вантажне</SelectItem>
                <SelectItem value="moto">🏍 Мотоцикл</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Об'єм двигуна <InfoTip text="Об'єм двигуна впливає на базову ставку. Більший двигун = вища ціна" /></Label>
            <Select value={engine} onValueChange={setEngine}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1.6">до 1.6 л</SelectItem>
                <SelectItem value="2.0">1.6–2.0 л</SelectItem>
                <SelectItem value="2.5">2.0–2.5 л</SelectItem>
                <SelectItem value="3.0">2.5+ л</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Стаж водія <InfoTip text="Водії з малим стажем платять більше через підвищений ризик ДТП" /></Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">до 2 років (×1.8)</SelectItem>
                <SelectItem value="2">2–5 років (×1.2)</SelectItem>
                <SelectItem value="5">5+ років (×1.0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Зона реєстрації <InfoTip text="Зони визначаються за рівнем аварійності. Зона 1 (великі міста) — найвищий коефіцієнт" /></Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ZONE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">КБМ (бонус-малус) <InfoTip text="Коефіцієнт безаварійності. Менше = дешевше. Без ДТП 10+ років = 0.5 (знижка 50%)" /></Label>
            <Select value={kbm} onValueChange={setKbm}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {KBM_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 self-end pb-2">
            <Checkbox id="ev" checked={isElectric} onCheckedChange={(c) => setIsElectric(!!c)} />
            <Label htmlFor="ev" className="text-xs cursor-pointer">
              ⚡ Електромобіль <span className="text-emerald-600 font-medium">(−30%)</span>
            </Label>
          </div>
        </div>
      </Card>

      {companies.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Порівняння вартості ОСЦПВ</p>
          </div>
          <CompanySelector selected={selectedCompanies} onChange={setSelectedCompanies} />
          <ComparisonBarChart data={chartData} unit="₴/рік" />
          <ResultCards results={results} bestId={bestId} categorySlug="insurance" />
          <p className="text-xs text-muted-foreground">
            Ліміт МТСБУ: до 130 000 ₴ за одне ДТП. Поліс діє 1 рік. Розрахунок орієнтовний — точну ціну дізнайтеся на сайті компанії.
          </p>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════
// КАСКО Tab
// ═══════════════════════════════
const KaskoTab = () => {
  const defaults = { carValue: 500000, carAge: 3, franchise: "5", parking: "yard", hasAlarm: false };
  const [carValue, setCarValue] = useState(defaults.carValue);
  const [carAge, setCarAge] = useState(defaults.carAge);
  const [franchise, setFranchise] = useState(defaults.franchise);
  const [parking, setParking] = useState(defaults.parking);
  const [hasAlarm, setHasAlarm] = useState(defaults.hasAlarm);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(INSURERS.slice(0, Math.min(3, INSURERS.length)).map(i => i.id));

  const companies = INSURERS.filter(i => selectedCompanies.includes(i.id));

  const calcKasko = (companyId: string) => {
    const baseRate = 0.045;
    const mod = COMPANY_MODIFIER[companyId] || 1.0;
    const parkMod = PARKING_COEF[parking] || 1.0;
    const alarmMod = hasAlarm ? 0.9 : 1.0;
    return Math.round(carValue * baseRate * FRANCHISE_COEF[franchise] * AGE_COEF_KASKO(carAge) * mod * parkMod * alarmMod);
  };

  const results = useMemo(() => companies.map(c => ({ id: c.id, name: c.name, value: calcKasko(c.id) })), [carValue, carAge, franchise, parking, hasAlarm, selectedCompanies]);
  const bestId = results.reduce((a, b) => a.value < b.value ? a : b, results[0])?.id;
  const bestResult = results.find(r => r.id === bestId);

  const franchiseAmount = carValue * (+franchise / 100);
  const policyAvg = results.length > 0 ? results.reduce((s, r) => s + r.value, 0) / results.length : 0;
  const totalCostIfAccident = Math.round(policyAvg + franchiseAmount);

  const pieData = +franchise > 0 ? [
    { name: "Поліс", value: Math.round(policyAvg), fill: "hsl(var(--primary))" },
    { name: "Франшиза", value: Math.round(franchiseAmount), fill: "hsl(var(--accent))" },
  ] : [];

  const handleReset = () => {
    setCarValue(defaults.carValue); setCarAge(defaults.carAge); setFranchise(defaults.franchise);
    setParking(defaults.parking); setHasAlarm(defaults.hasAlarm);
  };

  const chartData = results.map(r => ({ name: r.name, value: r.value, best: r.id === bestId }));

  return (
    <div className="space-y-4">
      {bestResult && (
        <HeroResult
          icon={<ShieldCheck className="w-5 h-5 text-primary" />}
          label="КАСКО від"
          value={bestResult.value}
          subtitle={`${bestResult.name} · Покриття: ${fmt(carValue)} ₴ · Франшиза: ${franchise}%`}
        />
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Параметри КАСКО</p>
          <ResetButton onReset={handleReset} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <div className="flex justify-between text-xs">
              <Label className="text-muted-foreground">Вартість авто <InfoTip text="Ринкова вартість вашого автомобіля. Визначає страхову суму та розмір премії" /></Label>
              <span className="font-semibold">{fmt(carValue)} ₴</span>
            </div>
            <Slider min={50000} max={3000000} step={10000} value={[carValue]} onValueChange={([v]) => setCarValue(v)} />
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>50 тис</span><span>3 млн</span></div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Вік авто, років <InfoTip text="Старші авто коштують дорожче в страхуванні через підвищений ризик" /></Label>
            <Input type="number" min={0} max={20} value={carAge} onChange={e => setCarAge(Math.min(20, Math.max(0, +e.target.value || 0)))} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Франшиза <InfoTip text="Сума, яку ви платите самостійно при ДТП. Більша франшиза = дешевший поліс" /></Label>
            <Select value={franchise} onValueChange={setFranchise}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Без франшизи</SelectItem>
                <SelectItem value="2">2% ({fmt(carValue * 0.02)} ₴)</SelectItem>
                <SelectItem value="5">5% ({fmt(carValue * 0.05)} ₴)</SelectItem>
                <SelectItem value="10">10% ({fmt(carValue * 0.1)} ₴)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Тип паркування <InfoTip text="Гараж знижує ризик угону та пошкоджень, вулиця — підвищує" /></Label>
            <Select value={parking} onValueChange={setParking}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="garage">🏠 Гараж (−10%)</SelectItem>
                <SelectItem value="yard">🏢 Двір</SelectItem>
                <SelectItem value="street">🛣 Вулиця (+15%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 self-end pb-2">
            <Checkbox id="alarm" checked={hasAlarm} onCheckedChange={(c) => setHasAlarm(!!c)} />
            <Label htmlFor="alarm" className="text-xs cursor-pointer">
              🔒 Протиугонна система <span className="text-emerald-600 font-medium">(−10%)</span>
            </Label>
          </div>
        </div>
      </Card>

      {companies.length > 0 && (
        <Card className="p-4 space-y-4">
          <p className="text-sm font-semibold">Порівняння вартості КАСКО</p>
          <CompanySelector selected={selectedCompanies} onChange={setSelectedCompanies} />
          <ComparisonBarChart data={chartData} unit="₴/рік" />
          <ResultCards results={results} bestId={bestId} categorySlug="insurance" />

          {pieData.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium mb-2 text-muted-foreground">Структура витрат при ДТП</p>
              <div className="flex items-center gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={65} strokeWidth={1}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        <RechartsLabel value={`${fmt(totalCostIfAccident)} ₴`} position="center" className="text-xs font-semibold fill-foreground" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.fill }} />
                      <div>
                        <span className="text-muted-foreground">{d.name}</span>
                        <p className="font-semibold">{fmt(d.value)} ₴</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-border">
                    <span className="text-muted-foreground">Загальні витрати</span>
                    <p className="font-bold text-sm">{fmt(totalCostIfAccident)} ₴</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-3 py-2 text-xs text-muted-foreground rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            📈 Премії КАСКО зростають на 8-15% щорічно. Через 3 роки вартість може становити ~{fmt((bestResult?.value || 0) * Math.pow(1.12, 3))} ₴.
          </div>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════
// Health (ДМС) Tab
// ═══════════════════════════════
const HealthTab = () => {
  const defaults = { age: 35, tier: "standard" as const, familySize: 1, isCorporate: false };
  const [age, setAge] = useState(defaults.age);
  const [tier, setTier] = useState<"basic" | "standard" | "premium">(defaults.tier);
  const [familySize, setFamilySize] = useState(defaults.familySize);
  const [isCorporate, setIsCorporate] = useState(defaults.isCorporate);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(INSURERS.slice(0, Math.min(3, INSURERS.length)).map(i => i.id));

  const companies = INSURERS.filter(i => selectedCompanies.includes(i.id));
  const tierData = HEALTH_TIERS[tier];
  const ageCoef = HEALTH_AGE_COEF(age);

  const calcHealth = (companyId: string) => {
    const mod = COMPANY_MODIFIER[companyId] || 1.0;
    const perPerson = tierData.price * ageCoef * mod;
    const familyDiscount = familySize > 1 ? 0.85 : 1.0;
    const corpDiscount = isCorporate ? 0.75 : 1.0;
    return Math.round(perPerson * familySize * familyDiscount * corpDiscount);
  };

  const results = useMemo(() => companies.map(c => ({ id: c.id, name: c.name, value: calcHealth(c.id) })), [age, tier, familySize, isCorporate, selectedCompanies]);
  const bestId = results.reduce((a, b) => a.value < b.value ? a : b, results[0])?.id;
  const bestResult = results.find(r => r.id === bestId);

  const handleReset = () => {
    setAge(defaults.age); setTier(defaults.tier); setFamilySize(defaults.familySize); setIsCorporate(defaults.isCorporate);
  };

  const chartData = results.map(r => ({ name: r.name, value: r.value, best: r.id === bestId }));

  // Check which services are included in each tier for comparison table
  const tierKeys = ["basic", "standard", "premium"] as const;
  const hasService = (tierKey: typeof tierKeys[number], service: string) => {
    const t = HEALTH_TIERS[tierKey];
    return t.includes.some(s => s.toLowerCase().includes(service.toLowerCase()));
  };

  return (
    <div className="space-y-4">
      {bestResult && (
        <HeroResult
          icon={<Heart className="w-5 h-5 text-primary" />}
          label={`ДМС «${tierData.label}» від`}
          value={bestResult.value}
          subtitle={`${bestResult.name} · ${familySize > 1 ? `Сім'я ${familySize} осіб` : "1 особа"}${isCorporate ? " · Корпоративний" : ""}`}
        />
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Параметри ДМС</p>
          <ResetButton onReset={handleReset} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <Label className="text-muted-foreground">Вік <InfoTip text="Вік найстаршого застрахованого. Після 45 років — підвищений коефіцієнт" /></Label>
              <span className="font-semibold">{age} р.</span>
            </div>
            <Slider min={18} max={70} step={1} value={[age]} onValueChange={([v]) => setAge(v)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Кількість осіб <InfoTip text="Для сім'ї (2+ осіб) діє знижка ~15%" /></Label>
            <Input type="number" min={1} max={6} value={familySize} onChange={e => setFamilySize(Math.min(6, Math.max(1, +e.target.value || 1)))} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Тип покриття</Label>
            <Select value={tier} onValueChange={v => setTier(v as "basic" | "standard" | "premium")}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Базовий (~5 000 ₴)</SelectItem>
                <SelectItem value="standard">Стандарт (~10 000 ₴)</SelectItem>
                <SelectItem value="premium">Преміум (~25 000 ₴)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 self-end pb-2">
            <Checkbox id="corp" checked={isCorporate} onCheckedChange={(c) => setIsCorporate(!!c)} />
            <Label htmlFor="corp" className="text-xs cursor-pointer">
              🏢 Корпоративний <span className="text-emerald-600 font-medium">(−25%)</span>
            </Label>
          </div>
        </div>
      </Card>

      {/* Tier Comparison Table */}
      <Card className="p-4">
        <p className="text-sm font-semibold mb-3">Порівняння тарифів ДМС</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-muted-foreground font-medium">Послуга</th>
                {tierKeys.map(k => (
                  <th key={k} className={`text-center py-2 px-2 font-semibold ${tier === k ? "text-primary" : "text-foreground"}`}>
                    {HEALTH_TIERS[k].label}
                    <p className="font-normal text-muted-foreground">від {fmt(HEALTH_TIERS[k].price)} ₴</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_HEALTH_SERVICES.map(service => (
                <tr key={service} className="border-b border-border/50">
                  <td className="py-1.5 pr-3 text-muted-foreground">{service}</td>
                  {tierKeys.map(k => (
                    <td key={k} className={`text-center py-1.5 ${tier === k ? "bg-primary/5" : ""}`}>
                      {hasService(k, service)
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" />
                        : <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {companies.length > 0 && (
        <Card className="p-4 space-y-4">
          <p className="text-sm font-semibold">Порівняння вартості ДМС на рік</p>
          <CompanySelector selected={selectedCompanies} onChange={setSelectedCompanies} />
          <ComparisonBarChart data={chartData} unit="₴/рік" />
          <ResultCards results={results} bestId={bestId} categorySlug="insurance" />
          {familySize > 1 && (
            <p className="text-xs text-muted-foreground">👨‍👩‍👧‍👦 Сімейна знижка 15% застосована. Без знижки: {fmt((bestResult?.value || 0) / 0.85)} ₴</p>
          )}
          <div className="px-3 py-2 text-xs text-muted-foreground rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            📈 Премії ДМС зростають на 10-15% щорічно. Через 3 роки вартість може становити ~{fmt((bestResult?.value || 0) * Math.pow(1.12, 3))} ₴.
          </div>
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════
// Travel Tab
// ═══════════════════════════════
const TravelTab = () => {
  const defaults = { destination: "europe", days: 14, age: 35, travelType: "standard", isMultiTrip: false, covidCover: false };
  const [destination, setDestination] = useState(defaults.destination);
  const [days, setDays] = useState(defaults.days);
  const [age, setAge] = useState(defaults.age);
  const [travelType, setTravelType] = useState(defaults.travelType);
  const [isMultiTrip, setIsMultiTrip] = useState(defaults.isMultiTrip);
  const [covidCover, setCovidCover] = useState(defaults.covidCover);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(INSURERS.slice(0, Math.min(3, INSURERS.length)).map(i => i.id));

  const companies = INSURERS.filter(i => selectedCompanies.includes(i.id));
  const ageCoef = age < 30 ? 0.9 : age < 60 ? 1.0 : 1.5;
  const coverageAmount = TRAVEL_ZONE[destination]?.coverage || "€30 000";

  const calcTravel = (companyId: string) => {
    const zoneBase = TRAVEL_ZONE[destination]?.base || 1.8;
    const typeCoef = TRAVEL_TYPE_COEF[travelType]?.coef || 1.0;
    const mod = COMPANY_MODIFIER[companyId] || 1.0;
    const covidMod = covidCover ? 1.15 : 1.0;
    if (isMultiTrip) {
      return Math.round(zoneBase * 365 * 0.15 * ageCoef * typeCoef * mod * covidMod * USD_UAH);
    }
    return Math.round(zoneBase * days * ageCoef * typeCoef * mod * covidMod * USD_UAH);
  };

  const results = useMemo(() => companies.map(c => ({ id: c.id, name: c.name, value: calcTravel(c.id) })), [destination, days, age, travelType, isMultiTrip, covidCover, selectedCompanies]);
  const bestId = results.reduce((a, b) => a.value < b.value ? a : b, results[0])?.id;
  const bestResult = results.find(r => r.id === bestId);

  const handleReset = () => {
    setDestination(defaults.destination); setDays(defaults.days); setAge(defaults.age);
    setTravelType(defaults.travelType); setIsMultiTrip(defaults.isMultiTrip); setCovidCover(defaults.covidCover);
  };

  const chartData = results.map(r => ({ name: r.name, value: r.value, best: r.id === bestId }));

  return (
    <div className="space-y-4">
      {bestResult && (
        <HeroResult
          icon={<Plane className="w-5 h-5 text-primary" />}
          label={isMultiTrip ? "Мультитріп від" : `Подорож ${days} днів від`}
          value={bestResult.value}
          subtitle={`${bestResult.name} · ${TRAVEL_ZONE[destination]?.label || destination} · Покриття: ${coverageAmount}${isMultiTrip ? " · Річний" : ""}`}
        />
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Параметри подорожі</p>
          <ResetButton onReset={handleReset} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Напрямок <InfoTip text="Європа/Шенген — обов'язковий поліс для візи. Покриття €30 000+" /></Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TRAVEL_ZONE).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {!isMultiTrip && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Кількість днів</Label>
              <Input type="number" min={1} max={365} value={days} onChange={e => setDays(Math.min(365, Math.max(1, +e.target.value || 1)))} className="text-right h-9 text-sm" />
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Вік</Label>
            <Input type="number" min={0} max={80} value={age} onChange={e => setAge(Math.min(80, Math.max(0, +e.target.value || 0)))} className="text-right h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Тип покриття <InfoTip text="Спортивне покриття потрібне для гірськолижних курортів, дайвінгу тощо" /></Label>
            <Select value={travelType} onValueChange={setTravelType}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TRAVEL_TYPE_COEF).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 justify-end pb-1">
            <div className="flex items-center gap-2">
              <Checkbox id="multitrip" checked={isMultiTrip} onCheckedChange={(c) => setIsMultiTrip(!!c)} />
              <Label htmlFor="multitrip" className="text-xs cursor-pointer">🔄 Мультитріп (річний)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="covid" checked={covidCover} onCheckedChange={(c) => setCovidCover(!!c)} />
              <Label htmlFor="covid" className="text-xs cursor-pointer">🦠 Покриття COVID (+15%)</Label>
            </div>
          </div>
        </div>
      </Card>

      {destination === "europe" && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span><span className="font-semibold text-foreground">Для Шенгенської візи</span> потрібен поліс з покриттям мінімум €30 000. Всі компанії з каталогу відповідають цій вимозі.</span>
        </div>
      )}

      {companies.length > 0 && (
        <Card className="p-4 space-y-4">
          <p className="text-sm font-semibold">Порівняння вартості</p>
          <CompanySelector selected={selectedCompanies} onChange={setSelectedCompanies} />
          <ComparisonBarChart data={chartData} unit="₴" />
          <ResultCards results={results} bestId={bestId} categorySlug="insurance" />
          {!isMultiTrip && bestResult && (
            <p className="text-xs text-muted-foreground">
              Середня ціна за день: {fmt(bestResult.value / days)} ₴ (~{(bestResult.value / days / USD_UAH).toFixed(1)} $) · Покриття: {coverageAmount}
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

// ═══════════════════════════════
// Main Component
// ═══════════════════════════════
export const InsuranceCalc = () => {
  const [activeTab, setActiveTab] = useState("oscpv");

  const { copyShareLink } = useCalcShareState([
    { key: "type", urlKey: "type", getter: () => activeTab, setter: v => setActiveTab(v), defaultValue: "oscpv" },
  ]);

  return (
    <div className="space-y-4">
      {INSURERS.length === 0 && (
        <Card className="p-4 text-center text-sm text-muted-foreground">
          Страхові компанії не знайдені в каталозі.
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="oscpv" className="flex-1 min-w-fit text-xs sm:text-sm gap-1">
            <Car className="w-3.5 h-3.5 hidden sm:inline" /> ОСЦПВ
          </TabsTrigger>
          <TabsTrigger value="kasko" className="flex-1 min-w-fit text-xs sm:text-sm gap-1">
            <ShieldCheck className="w-3.5 h-3.5 hidden sm:inline" /> КАСКО
          </TabsTrigger>
          <TabsTrigger value="health" className="flex-1 min-w-fit text-xs sm:text-sm gap-1">
            <Heart className="w-3.5 h-3.5 hidden sm:inline" /> Здоров'я
          </TabsTrigger>
          <TabsTrigger value="travel" className="flex-1 min-w-fit text-xs sm:text-sm gap-1">
            <Plane className="w-3.5 h-3.5 hidden sm:inline" /> Подорожі
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oscpv"><OscpvTab /></TabsContent>
        <TabsContent value="kasko"><KaskoTab /></TabsContent>
        <TabsContent value="health"><HealthTab /></TabsContent>
        <TabsContent value="travel"><TravelTab /></TabsContent>
      </Tabs>

      <Card className="px-4 py-3 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Розрахунки орієнтовні.</span> Точну вартість полісу дізнайтеся на сайті обраної компанії. Ціни можуть відрізнятися залежно від індивідуальних умов, знижок та акцій.
          </p>
        </div>
      </Card>
    </div>
  );
};
