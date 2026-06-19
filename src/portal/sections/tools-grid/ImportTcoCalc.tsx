import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";
import { TRADE_REGIME_LABEL, type TradeRegime } from "@/portal/data/customsTariff";

const fmt = (n: number) => n.toLocaleString("uk-UA", { maximumFractionDigits: 0 });

export const ImportTcoCalc = () => {
  const [fob, setFob] = useState(10000);       // USD, вартість товару FOB
  const [freight, setFreight] = useState(1200); // USD, морський/авто фрахт
  const [insurance, setInsurance] = useState(80); // USD
  const [rate, setRate] = useState(41.5);       // ₴/USD
  const [duty, setDuty] = useState(5);          // % мито
  const [vat, setVat] = useState(20);           // % ПДВ
  const [excise, setExcise] = useState(0);      // ₴ (фіксована сума акцизу)
  const [broker, setBroker] = useState(8000);   // ₴ експедитор + брокер
  const [terminal, setTerminal] = useState(5000); // ₴ термінал/склад/СВХ
  const [regime, setRegime] = useState<TradeRegime>("MFN");

  const r = useMemo(() => {
    const cif = (fob + freight + insurance) * rate;          // митна вартість, ₴
    const dutyAmt = cif * (duty / 100);
    const exciseAmt = excise;
    const vatBase = cif + dutyAmt + exciseAmt;
    const vatAmt = vatBase * (vat / 100);
    const total = cif + dutyAmt + exciseAmt + vatAmt + broker + terminal;
    return { cif, dutyAmt, exciseAmt, vatAmt, total };
  }, [fob, freight, insurance, rate, duty, vat, excise, broker, terminal]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Торговельний режим</Label>
              <Select value={regime} onValueChange={(v) => setRegime(v as TradeRegime)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TRADE_REGIME_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Впливає на ставку мита (підставте вручну з довідника)</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Курс НБУ, ₴/USD</Label>
              <Input type="number" step="0.01" value={rate || ""} onChange={(e) => setRate(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">FOB вартість, USD</Label>
              <Input type="number" value={fob || ""} onChange={(e) => setFob(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Фрахт, USD</Label>
              <Input type="number" value={freight || ""} onChange={(e) => setFreight(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Страхування, USD</Label>
              <Input type="number" value={insurance || ""} onChange={(e) => setInsurance(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Мито, %</Label>
              <Input type="number" step="0.1" value={duty || ""} onChange={(e) => setDuty(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">ПДВ при імпорті, %</Label>
              <Input type="number" step="1" value={vat || ""} onChange={(e) => setVat(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Акциз (сума), ₴</Label>
              <Input type="number" value={excise || ""} onChange={(e) => setExcise(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Брокер + експедитор, ₴</Label>
              <Input type="number" value={broker || ""} onChange={(e) => setBroker(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Термінал / СВХ / доставка, ₴</Label>
              <Input type="number" value={terminal || ""} onChange={(e) => setTerminal(Number(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-2 border-t-primary">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Собівартість імпорту ({TRADE_REGIME_LABEL[regime]})</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Row label="Митна вартість (CIF)" value={`${fmt(r.cif)} ₴`} />
            <Row label="Мито" value={`${fmt(r.dutyAmt)} ₴`} />
            <Row label="Акциз" value={`${fmt(r.exciseAmt)} ₴`} />
            <Row label="ПДВ при імпорті" value={`${fmt(r.vatAmt)} ₴`} />
            <Row label="Брокер + експедитор" value={`${fmt(broker)} ₴`} />
            <Row label="Термінал/СВХ" value={`${fmt(terminal)} ₴`} />
          </div>
          <div className="pt-3 border-t flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Усього TCO</span>
            <span className="text-2xl font-mono font-bold text-foreground">{fmt(r.total)} ₴</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Розрахунок орієнтовний. Реальні ставки мита, квоти та преференції — у{" "}
            <a href="/dovidnyky/customs-tariff" className="underline">довіднику митних ставок</a>.
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
