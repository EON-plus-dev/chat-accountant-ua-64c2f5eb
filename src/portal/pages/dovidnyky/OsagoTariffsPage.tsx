import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Shield } from "lucide-react";
import {
  OSAGO_TARIFFS, OSAGO_AS_OF, OSAGO_BASE_AMOUNT, OSAGO_COEFFICIENTS, OSAGO_PAYOUT_LIMITS,
} from "@/portal/data/osagoTariffs";

const fmt = (n: number) => n.toLocaleString("uk-UA");

const OsagoTariffsPage = () => {
  return (
    <PortalLayout
      meta={{
        title: "Тарифи ОСЦПВ 2026 — коефіцієнти, базові ставки, ліміти | FINTODO",
        description: `Базові тарифи і коригуючі коефіцієнти ОСЦПВ для легкових, вантажних, мотоциклів. Ліміти виплат, регіональні коефіцієнти, бонус-малус. Snapshot ${OSAGO_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/osago`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Тарифи ОСЦПВ", url: `${SITE_URL}/dovidnyky/osago` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "ОСЦПВ" },
        ]} />

        <div className="space-y-6 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Тарифи ОСЦПВ
            </h1>
            <p className="text-muted-foreground">
              Базова ставка {fmt(OSAGO_BASE_AMOUNT)} ₴/рік. Кінцева премія = базова × коефіцієнти (територія × вік водія × бонус-малус × строк). Ліміти виплат: здоров'я {fmt(OSAGO_PAYOUT_LIMITS.health)} ₴, майно {fmt(OSAGO_PAYOUT_LIMITS.property)} ₴. Snapshot {OSAGO_AS_OF}.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Базові ставки за типом ТЗ</h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {OSAGO_TARIFFS.map((t) => (
                <Card key={t.id} className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-1">Кат. {t.category}</Badge>
                      <h3 className="text-sm font-semibold text-foreground">{t.vehicleType}</h3>
                      {t.enginePowerKw && <p className="text-[11px] text-muted-foreground">{t.enginePowerKw}</p>}
                    </div>
                    <div className="text-right">
                      <div className="text-base font-mono font-bold text-primary">{fmt(t.baseTariff)} ₴</div>
                      <div className="text-[10px] text-muted-foreground">базова/рік</div>
                    </div>
                  </div>
                  {t.notes && <p className="text-[11px] text-muted-foreground">{t.notes}</p>}
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Коригуючі коефіцієнти</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(OSAGO_COEFFICIENTS).map(([groupKey, group]) => {
                const labels: Record<string, string> = {
                  territory: "Територія використання",
                  driverAge: "Вік / стаж водія",
                  bonusMalus: "Бонус-малус (історія)",
                  contractType: "Тип договору",
                };
                return (
                  <Card key={groupKey} className="p-3.5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{labels[groupKey]}</h3>
                    <div className="space-y-1">
                      {Object.entries(group).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2 text-[12px]">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-mono font-semibold text-foreground">× {v.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Ліміти страхових виплат</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Шкода життю і здоров'ю</div>
                <div className="text-2xl font-mono font-bold text-foreground">{fmt(OSAGO_PAYOUT_LIMITS.health)} ₴</div>
                <p className="text-[11px] text-muted-foreground mt-1">На одного потерпілого</p>
              </Card>
              <Card className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Шкода майну</div>
                <div className="text-2xl font-mono font-bold text-foreground">{fmt(OSAGO_PAYOUT_LIMITS.property)} ₴</div>
                <p className="text-[11px] text-muted-foreground mt-1">Понад ліміт — стягується з винуватця ДТП</p>
              </Card>
            </div>
          </section>

          <Card className="p-4 bg-muted/40">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Як розрахувати:</strong> Премія = базовий тариф × територія × вік × бонус-малус × строк. Наприклад, легкове 1500 см³ у Києві, водій 30 років зі стажем 5 р., без аварій 3 роки = 2 107 × 1.30 × 1.00 × 0.85 × 1.00 = <strong>2 329 ₴/рік</strong>.
            </p>
          </Card>
        </div>
      </div>
    <RelatedPartnersBlock directoryId="osago" />
    </PortalLayout>
  );
};

export default OsagoTariffsPage;
