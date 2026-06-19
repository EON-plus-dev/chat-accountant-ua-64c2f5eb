import { useMemo, useState } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Hammer, Search, Home, Plus } from "lucide-react";
import {
  REGION_CONSTRUCTION_COSTS,
  PRIVATE_CONSTRUCTION_COSTS,
  ADDITIONAL_COSTS,
  CATEGORY_LABEL,
  CONSTR_COSTS_AS_OF,
  CONSTR_COSTS_SOURCE,
} from "@/portal/data/constructionCostsM2";

const f = (n: number) => n.toLocaleString("uk-UA") + " ₴";

const ConstructionCostsPage = () => {
  const [search, setSearch] = useState("");

  const regions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return REGION_CONSTRUCTION_COSTS;
    return REGION_CONSTRUCTION_COSTS.filter((r) => r.region.toLowerCase().includes(q) || r.capital.toLowerCase().includes(q));
  }, [search]);

  const avg = Math.round(REGION_CONSTRUCTION_COSTS.reduce((s, r) => s + r.costPerM2, 0) / REGION_CONSTRUCTION_COSTS.length);

  return (
    <PortalLayout
      meta={{
        title: "Вартість будівництва за регіонами 2026: ₴/м² | FINTODO",
        description: "Опосередкована вартість будівництва житла за регіонами України (наказ Мінрегіону). Економ/комфорт/преміум варіанти приватного будівництва. Snapshot " + CONSTR_COSTS_AS_OF + ".",
        canonical: `${SITE_URL}/dovidnyky/vartist-budivnytstva`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Вартість будівництва", url: `${SITE_URL}/dovidnyky/vartist-budivnytstva` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Вартість будівництва" },
        ]} />

        <div className="space-y-6 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Hammer className="h-6 w-6 text-primary" />
              Вартість будівництва: ₴ за м²
            </h1>
            <p className="text-muted-foreground">
              Опосередкована вартість будівництва житла за регіонами України. Використовується для розрахунку держдопомоги ВПО, програми «єОселя», оцінки кошторисів.
            </p>
            <p className="text-xs text-muted-foreground">{CONSTR_COSTS_SOURCE}</p>
          </header>

          {/* Сумарні KPI */}
          <div className="grid sm:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="text-[10px] uppercase text-muted-foreground">Середнє по Україні</div>
              <div className="text-xl font-bold text-foreground mt-1">{f(avg)}/м²</div>
            </Card>
            <Card className="p-4">
              <div className="text-[10px] uppercase text-muted-foreground">Максимум</div>
              <div className="text-xl font-bold text-foreground mt-1">{f(Math.max(...REGION_CONSTRUCTION_COSTS.map((r) => r.costPerM2)))}/м²</div>
              <div className="text-[10px] text-muted-foreground">м. Київ</div>
            </Card>
            <Card className="p-4">
              <div className="text-[10px] uppercase text-muted-foreground">Мінімум</div>
              <div className="text-xl font-bold text-foreground mt-1">{f(Math.min(...REGION_CONSTRUCTION_COSTS.map((r) => r.costPerM2)))}/м²</div>
              <div className="text-[10px] text-muted-foreground">прифронтові області</div>
            </Card>
          </div>

          {/* Таблиця регіонів */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                Опосередкована вартість по регіонах
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук регіону..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Регіон</th>
                      <th className="text-left px-3 py-2 font-semibold">Центр</th>
                      <th className="text-right px-3 py-2 font-semibold">₴ / м²</th>
                      <th className="text-right px-3 py-2 font-semibold">100 м² орієнт.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r) => (
                      <tr key={r.id} className="border-t border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">
                          {r.region}
                          {r.premiumKyiv && <Badge variant="default" className="ml-2 text-[10px]">столиця</Badge>}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.capital}</td>
                        <td className="px-3 py-2 text-right font-semibold">{f(r.costPerM2)}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{f(r.costPerM2 * 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Приватне будівництво */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Приватне будівництво (котедж, дача)</h2>
            <div className="grid gap-3">
              {PRIVATE_CONSTRUCTION_COSTS.map((c, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <h3 className="text-base font-bold text-foreground">{c.type}</h3>
                    <Badge variant="outline" className="text-[10px]">{CATEGORY_LABEL[c.category]}</Badge>
                  </div>
                  <div className="text-xl font-bold text-primary">{f(c.costPerM2Min)} – {f(c.costPerM2Max)}/м²</div>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Додаткові витрати */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Додаткові витрати (поза вартістю м²)
            </h2>
            <Card className="p-4 space-y-2">
              {ADDITIONAL_COSTS.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{a.item}</span>
                  <span className="text-sm font-semibold text-foreground text-right shrink-0">{a.range}</span>
                </div>
              ))}
            </Card>
          </section>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="vartist-budivnytstva" />
    </PortalLayout>
  );
};

export default ConstructionCostsPage;
