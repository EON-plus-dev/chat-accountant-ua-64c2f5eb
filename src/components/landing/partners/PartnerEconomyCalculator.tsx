import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight, TrendingUp, Sparkles, Coffee, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TierId = "solo" | "agency" | "firm";
const TIERS: Record<TierId, { name: string; percent: number; price: number }> = {
  solo: { name: "Solo", percent: 25, price: 499 },
  agency: { name: "Agency", percent: 30, price: 1499 },
  firm: { name: "Firm", percent: 35, price: 3499 },
};
const SMART_PRICE = 799;
const AUTOMATION_RATE = 0.6;
const REALISM = 0.5;

type ResellerMode = "revenue_share" | "to_client";

const PRESETS: Record<TierId, { clients: number; fee: number; hours: number }> = {
  solo: { clients: 5, fee: 2500, hours: 4 },
  agency: { clients: 15, fee: 3500, hours: 6 },
  firm: { clients: 50, fee: 4500, hours: 8 },
};

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA");
const tierFor = (clients: number): TierId =>
  clients <= 7 ? "solo" : clients <= 25 ? "agency" : "firm";

export const PartnerEconomyCalculator = () => {
  const [activePreset, setActivePreset] = useState<TierId>("agency");
  const [clients, setClients] = useState(PRESETS.agency.clients);
  const [fee, setFee] = useState(PRESETS.agency.fee);
  const [hours, setHours] = useState(PRESETS.agency.hours);
  const [resellerMode, setResellerMode] = useState<ResellerMode>("revenue_share");

  const applyPreset = (id: TierId) => {
    setActivePreset(id);
    setClients(PRESETS[id].clients);
    setFee(PRESETS[id].fee);
    setHours(PRESETS[id].hours);
  };

  const data = useMemo(() => {
    const tier = tierFor(clients);
    const t = TIERS[tier];
    const hoursSavedMonth = clients * hours * AUTOMATION_RATE;
    // Тільки конвертовані в нових клієнтів години рахуємо в гроші — щоб не задвоювати.
    const capacityNew = Math.floor((hoursSavedMonth / Math.max(hours, 1)) * REALISM);
    const newRevenueMonth = capacityNew * fee;
    const resellerFlowMonth = clients * SMART_PRICE * (t.percent / 100);
    const resellerToPartner = resellerMode === "revenue_share" ? resellerFlowMonth : 0;
    const resellerToClient = resellerMode === "to_client" ? resellerFlowMonth : 0;
    // Залишок звільнених годин — нерахована якісна вигода.
    const lifeHoursMonth = hoursSavedMonth * (1 - REALISM);

    const totalMonth = newRevenueMonth + resellerToPartner;
    const totalYear = totalMonth * 12;
    const partnerCostMonth = t.price;
    const partnerCostYear = partnerCostMonth * 12;
    const paybackMonths = totalMonth > 0 ? partnerCostMonth / totalMonth : 0;
    const netYear = totalYear - partnerCostYear;

    const rows = [
      {
        label: "Нові клієнти на вільний час",
        value: newRevenueMonth,
        hint: `+${capacityNew} клієнтів × ${fmt(fee)} ₴, реалізм 50%`,
        muted: false,
      },
      {
        label:
          resellerMode === "revenue_share"
            ? `Reseller-виплата (${t.percent}%)`
            : `Знижка клієнту (${t.percent}%) — не у вашому ROI`,
        value: resellerToPartner,
        hint:
          resellerMode === "revenue_share"
            ? `${clients} × ${SMART_PRICE} ₴ підписки клієнтів`
            : `Клієнт економить ${fmt(resellerToClient)} ₴/міс — легше закривати угоди`,
        muted: resellerMode === "to_client",
      },
    ];

    return {
      rows,
      totalMonth,
      totalYear,
      partnerCostYear,
      paybackMonths,
      netYear,
      t,
      lifeHoursMonth,
    };
  }, [clients, fee, hours, resellerMode]);

  const max = Math.max(...data.rows.filter((r) => !r.muted).map((r) => r.value), 1);

  return (
    <section
      id="calculator"
      className="py-12 md:py-16 bg-muted/30 border-y border-border/40 scroll-mt-32"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Калькулятор вашої вигоди
          </h2>
          <p className="text-muted-foreground">
            Чесна формула: дохід від нових клієнтів + ваша частка з підписок. Без подвійного рахунку годин.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Швидкий старт:
          </span>
          {(Object.keys(PRESETS) as TierId[]).map((id) => (
            <Button
              key={id}
              size="sm"
              variant={activePreset === id ? "default" : "outline"}
              onClick={() => applyPreset(id)}
              className="h-7 text-xs"
            >
              {TIERS[id].name} · {PRESETS[id].clients} клієнтів
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Ваші дані</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="clients">Клієнтів</Label>
                <Input
                  id="clients"
                  type="number"
                  min={1}
                  max={500}
                  value={clients}
                  onChange={(e) =>
                    setClients(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fee">Гонорар, ₴/міс</Label>
                <Input
                  id="fee"
                  type="number"
                  min={0}
                  value={fee}
                  onChange={(e) => setFee(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hours">Год/міс на клієнта</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={80}
                  value={hours}
                  onChange={(e) =>
                    setHours(Math.max(1, Math.min(80, Number(e.target.value) || 1)))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Reseller-знижка йде:</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["revenue_share", "to_client"] as ResellerMode[]).map((m) => {
                  const active = resellerMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setResellerMode(m)}
                      className={`text-left rounded-md border px-3 py-2 transition ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="text-sm font-medium text-foreground">
                        {m === "revenue_share" ? "Грошима мені" : "Знижкою клієнту"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {m === "revenue_share" ? "виплата revenue share" : "клієнт платить менше"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-md bg-muted/40 border border-border p-3 text-xs text-muted-foreground">
              Тариф підбирається автоматично:{" "}
              <span className="font-semibold text-foreground">
                {data.t.name} — {fmt(data.t.price)} ₴/міс
              </span>
              . У кабінеті можна перемикати режим Reseller по кожному клієнту окремо.
            </div>
          </Card>

          <Card className="p-5 md:p-6 space-y-4 border-primary/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Ваша вигода
              </h3>
              <Badge variant="outline">реалізм 50%</Badge>
            </div>

            <div className="space-y-3">
              {data.rows.map((r) => (
                <div key={r.label} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className={`text-sm ${
                        r.muted ? "text-muted-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {r.label}
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        r.muted ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {fmt(r.value)} ₴
                    </span>
                  </div>
                  {!r.muted && (
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full transition-all"
                        style={{ width: `${(r.value / max) * 100}%` }}
                      />
                    </div>
                  )}
                  <div className="text-[11px] text-muted-foreground">{r.hint}</div>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-dashed border-border p-3 flex items-start gap-2">
              <Coffee className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  + {fmt(data.lifeHoursMonth)} год/міс
                </span>{" "}
                звільненого часу не йдуть у нових клієнтів — це ваші вечори, вихідні, відпустка.
                У ROI не рахуємо, але рахуються в якості життя.
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">/ Рік</div>
                <div className="text-base md:text-lg font-bold text-primary">
                  {fmt(data.totalYear)} ₴
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Підписка
                </div>
                <div className="text-base md:text-lg font-bold text-foreground">
                  −{fmt(data.partnerCostYear)} ₴
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center justify-center gap-1">
                  Окупність
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground/60" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        За скільки місяців приріст доходу перекриває вартість партнерської підписки.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-base md:text-lg font-bold text-primary">
                  {data.totalMonth <= 0
                    ? "—"
                    : data.paybackMonths < 0.5
                    ? "<1 міс"
                    : `~${data.paybackMonths.toFixed(1)} міс`}
                </div>
              </div>
            </div>

            <div className="text-sm text-center text-muted-foreground">
              Чиста вигода:{" "}
              <span className="font-semibold text-foreground">{fmt(data.netYear)} ₴/рік</span>
            </div>

            <Button asChild size="lg" className="w-full gap-1">
              <Link to="/checkout?plan=pro_agency&trial=true">
                Спробувати безкоштовно <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4 max-w-3xl mx-auto">
          Дані станом на квітень 2026 за публічними тарифами FINTODO. Реалізм 50% означає, що ми
          вважаємо лише половину звільнених годин конвертованими у нових клієнтів.
        </p>
      </div>
    </section>
  );
};
