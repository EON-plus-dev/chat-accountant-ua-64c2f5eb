import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Car, ExternalLink } from "lucide-react";
import {
  VEHICLE_CUSTOMS_RATES, VEHICLE_CUSTOMS_AS_OF, VEHICLE_ENGINE_LABEL, VEHICLE_REG_FEES,
} from "@/portal/data/vehicleCustoms";

type EngineType = "all" | "petrol" | "diesel" | "electric" | "hybrid";

const fmt = (n: number) => n.toLocaleString("uk-UA");

const VehicleCustomsPage = () => {
  const [engine, setEngine] = useState<EngineType>("all");

  const filtered = useMemo(() => {
    return VEHICLE_CUSTOMS_RATES.filter((r) => engine === "all" || r.engineType === engine);
  }, [engine]);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Тип двигуна">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            { value: "petrol", label: "Бензин" },
            { value: "diesel", label: "Дизель" },
            { value: "electric", label: "Електро" },
            { value: "hybrid", label: "Гібрид" },
          ]}
          value={engine}
          onChange={(v) => setEngine(v as EngineType)}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Розмитнення авто Україна 2026 — ставки мита, акцизу, ПДВ | FINTODO",
        description: `Ставки розмитнення легкових авто: мито 10%, акциз €/см³, ПДВ 20%. Електромобілі звільнені від мита і ПДВ до 2028. Збір ПФУ за реєстрацію. Snapshot ${VEHICLE_CUSTOMS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/rozmytnennya-avto`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Розмитнення авто", url: `${SITE_URL}/dovidnyky/rozmytnennya-avto` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Розмитнення авто" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              Розмитнення авто
            </h1>
            <p className="text-muted-foreground">
              Ставки ввізного мита, акцизу і ПДВ для легкових ТЗ. Акциз = базова ставка (€/см³) × коефіцієнт віку. Електромобілі звільнені від мита і ПДВ до 31.12.2028. Snapshot {VEHICLE_CUSTOMS_AS_OF}.
            </p>
            <p className="text-xs">
              <a href="/tools/vehicle-customs" className="text-primary hover:underline">→ Калькулятор розмитнення</a>
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search=""
            onSearchChange={() => {}}
            searchPlaceholder=""
            resultCount={filtered.length}
            resultLabel="ставок"
            activeFilterCount={engine !== "all" ? 1 : 0}
            onResetFilters={() => setEngine("all")}
          >
            <div className="grid gap-2.5">
              {filtered.map((r) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="default" className="text-[10px]">{VEHICLE_ENGINE_LABEL[r.engineType]}</Badge>
                        <Badge variant="outline" className="text-[10px]">{r.ageYears}</Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Об'єм: {r.engineVolumeCc}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    <Stat label="Мито" value={`${r.dutyPercent}%`} />
                    <Stat label="ПДВ" value={`${r.vatPercent}%`} />
                    <Stat label="Акциз база" value={r.excisePerKw ? `${r.excisePerKw} €/кВт·год` : `${r.exciseEurPerCc.toFixed(3)} €/см³`} />
                    <Stat label="Коеф. віку" value={`× ${r.ageCoefficient}`} />
                  </div>

                  {r.notes && <p className="text-[11px] text-muted-foreground">{r.notes}</p>}
                </Card>
              ))}
            </div>

            <Card className="p-4 mt-6 bg-muted/40">
              <h3 className="text-sm font-semibold text-foreground mb-2">Збір до Пенсійного фонду при реєстрації</h3>
              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                <div>3% — до {fmt(VEHICLE_REG_FEES.pensionThresholds.tier1)} ₴ вартості</div>
                <div>4% — до {fmt(VEHICLE_REG_FEES.pensionThresholds.tier2)} ₴</div>
                <div>5% — понад {fmt(VEHICLE_REG_FEES.pensionThresholds.tier2)} ₴</div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                + {fmt(VEHICLE_REG_FEES.msvFee)} ₴ адмін. збір ТСЦ МВС, + {fmt(VEHICLE_REG_FEES.newPlatesFee)} ₴ номерні знаки.
              </p>
            </Card>
          </DirectorySidebarLayout>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="rozmytnennya-avto" />
    </PortalLayout>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded p-2 text-center">
    <div className="text-[10px] text-muted-foreground">{label}</div>
    <div className="text-xs font-mono font-semibold text-foreground">{value}</div>
  </div>
);

export default VehicleCustomsPage;
