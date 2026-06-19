import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "lucide-react";
import { VEHICLE_REG_FEES } from "@/portal/data/vehicleCustoms";

type Engine = "petrol" | "diesel" | "electric" | "hybrid";

const fmt = (n: number) => n.toLocaleString("uk-UA", { maximumFractionDigits: 0 });

// Excise base (€/cm³) by engine + volume tier
const exciseBase = (engine: Engine, volumeCc: number, batteryKwh: number): number => {
  if (engine === "electric") return batteryKwh * 1; // 1 €/кВт·год
  if (engine === "petrol" || engine === "hybrid") {
    if (volumeCc <= 1500) return 0.102 * volumeCc;
    if (volumeCc <= 2200) return 0.063 * volumeCc;
    if (volumeCc <= 3000) return 0.267 * volumeCc;
    return 2.139 * volumeCc;
  }
  if (engine === "diesel") {
    if (volumeCc <= 1500) return 0.103 * volumeCc;
    if (volumeCc <= 2500) return 0.327 * volumeCc;
    return 0.327 * volumeCc;
  }
  return 0;
};

const ageCoefficient = (engine: Engine, ageYears: number): number => {
  if (engine === "electric") return 1;
  if (ageYears < 1) return 1;
  if (ageYears <= 5) return 1 + (ageYears - 1) * 0.5; // approx growth
  return 11.111;
};

const pensionRate = (priceUah: number): number => {
  if (priceUah < VEHICLE_REG_FEES.pensionThresholds.tier1) return 0.03;
  if (priceUah < VEHICLE_REG_FEES.pensionThresholds.tier2) return 0.04;
  return 0.05;
};

export const VehicleCustomsCalc = () => {
  const [engine, setEngine] = useState<Engine>("petrol");
  const [priceEur, setPriceEur] = useState(8000);
  const [eurRate, setEurRate] = useState(46);
  const [volumeCc, setVolumeCc] = useState(1600);
  const [ageYears, setAgeYears] = useState(3);
  const [batteryKwh, setBatteryKwh] = useState(60);
  const [broker, setBroker] = useState(5000);

  const r = useMemo(() => {
    const priceUah = priceEur * eurRate;
    const isEv = engine === "electric";
    const dutyPct = isEv ? 0 : 0.10;
    const vatPct = isEv ? 0 : 0.20;
    const dutyAmt = priceUah * dutyPct;
    const exciseEur = exciseBase(engine, volumeCc, batteryKwh) * ageCoefficient(engine, ageYears);
    const exciseUah = exciseEur * eurRate;
    const vatBase = priceUah + dutyAmt + exciseUah;
    const vatAmt = vatBase * vatPct;
    const pension = priceUah * pensionRate(priceUah);
    const total = dutyAmt + exciseUah + vatAmt + pension + VEHICLE_REG_FEES.msvFee + VEHICLE_REG_FEES.newPlatesFee + broker;
    return { priceUah, dutyAmt, exciseUah, vatAmt, pension, total };
  }, [engine, priceEur, eurRate, volumeCc, ageYears, batteryKwh, broker]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Тип двигуна</Label>
              <Select value={engine} onValueChange={(v) => setEngine(v as Engine)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Бензин</SelectItem>
                  <SelectItem value="diesel">Дизель</SelectItem>
                  <SelectItem value="hybrid">Гібрид</SelectItem>
                  <SelectItem value="electric">Електро</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Курс НБУ, ₴/EUR</Label>
              <Input type="number" step="0.01" value={eurRate || ""} onChange={(e) => setEurRate(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ціна авто, EUR</Label>
              <Input type="number" value={priceEur || ""} onChange={(e) => setPriceEur(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {engine !== "electric" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Об'єм двигуна, см³</Label>
                  <Input type="number" value={volumeCc || ""} onChange={(e) => setVolumeCc(Number(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Вік авто, років</Label>
                  <Input type="number" step="0.5" value={ageYears || ""} onChange={(e) => setAgeYears(Number(e.target.value) || 0)} />
                </div>
              </>
            )}
            {engine === "electric" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Ємність батареї, кВт·год</Label>
                <Input type="number" value={batteryKwh || ""} onChange={(e) => setBatteryKwh(Number(e.target.value) || 0)} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Брокер + сертифікат, ₴</Label>
              <Input type="number" value={broker || ""} onChange={(e) => setBroker(Number(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-primary">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Car className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Орієнтовна вартість розмитнення</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Row label="Ціна авто (₴)" value={`${fmt(r.priceUah)} ₴`} />
            <Row label="Мито (10%)" value={`${fmt(r.dutyAmt)} ₴`} />
            <Row label="Акциз з коеф. віку" value={`${fmt(r.exciseUah)} ₴`} />
            <Row label="ПДВ (20%)" value={`${fmt(r.vatAmt)} ₴`} />
            <Row label="Збір ПФУ" value={`${fmt(r.pension)} ₴`} />
            <Row label="ТСЦ + знаки + брокер" value={`${fmt(VEHICLE_REG_FEES.msvFee + VEHICLE_REG_FEES.newPlatesFee + broker)} ₴`} />
          </div>
          <div className="pt-3 border-t flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Усього (без вартості авто)</span>
            <span className="text-2xl font-mono font-bold text-foreground">{fmt(r.total)} ₴</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Розрахунок орієнтовний. Точні ставки — у{" "}
            <a href="/dovidnyky/rozmytnennya-avto" className="underline">довіднику розмитнення</a>. Електро звільнено від мита і ПДВ до 31.12.2028.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono text-foreground">{value}</span>
  </div>
);
