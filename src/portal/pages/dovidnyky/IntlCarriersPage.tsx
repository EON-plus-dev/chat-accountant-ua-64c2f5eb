import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Globe, Phone, Mail, ExternalLink, MapPin } from "lucide-react";
import { INTL_CARRIERS, INTL_CARRIERS_AS_OF, CARRIER_SERVICE_LABEL, type CarrierService } from "@/portal/data/intlCarriers";

const SERVICES: CarrierService[] = ["ftl", "ltl", "sea", "air", "rail", "express", "customs"];

const IntlCarriersPage = () => {
  const [service, setService] = useState<CarrierService | "all">("all");
  const [scope, setScope] = useState<"all" | "global" | "european" | "ukrainian">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return INTL_CARRIERS.filter((c) => {
      if (service !== "all" && !c.services.includes(service)) return false;
      if (scope !== "all" && c.scope !== scope) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.geography.join(" ").toLowerCase().includes(q);
    });
  }, [service, scope, search]);

  const activeFilters = (service !== "all" ? 1 : 0) + (scope !== "all" ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="Послуга">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            ...SERVICES.map((s) => ({ value: s, label: CARRIER_SERVICE_LABEL[s] })),
          ]}
          value={service}
          onChange={(v) => setService(v as CarrierService | "all")}
        />
      </FilterSection>
      <FilterSection title="Покриття">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Усі" },
            { value: "global", label: "Глобальні" },
            { value: "european", label: "Європейські" },
            { value: "ukrainian", label: "Українські міжнар." },
          ]}
          value={scope}
          onChange={(v) => setScope(v as "all" | "global" | "european" | "ukrainian")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "Міжнародні перевізники B2B в Україні — DSV, Kuehne+Nagel, Maersk | FINTODO",
        description: `Контакти та типові тарифи DSV, Kuehne+Nagel, DB Schenker, Maersk, ZIM, DHL, FedEx, Raben для українського B2B. Snapshot ${INTL_CARRIERS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/mizhnarodni-perevyznyky`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Міжнародні перевізники", url: `${SITE_URL}/dovidnyky/mizhnarodni-perevyznyky` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Міжнародні перевізники" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Міжнародні перевізники
            </h1>
            <p className="text-muted-foreground">
              Контакти, типові тарифи та сильні сторони міжнародних B2B-перевізників: морський фрахт, авіа, FTL/LTL, експрес. Snapshot {INTL_CARRIERS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: перевізник, регіон..."
            resultCount={filtered.length}
            resultLabel="перевізників"
            activeFilterCount={activeFilters}
            onResetFilters={() => { setService("all"); setScope("all"); }}
          >
            <div className="grid gap-3">
              {filtered.map((c) => (
                <Card key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.geography.join(" · ")}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {c.services.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">{CARRIER_SERVICE_LABEL[s]}</Badge>
                      ))}
                    </div>
                  </div>

                  {c.typicalLeadTimeDays && (
                    <p className="text-xs text-muted-foreground"><strong>Терміни:</strong> {c.typicalLeadTimeDays}</p>
                  )}
                  <p className="text-xs text-muted-foreground"><strong>Цінова модель:</strong> {c.pricingModel}</p>

                  {c.priceBenchmarks && c.priceBenchmarks.length > 0 && (
                    <div className="bg-muted/40 rounded p-2 space-y-1">
                      <div className="text-[11px] font-semibold text-foreground mb-1">Орієнтовні тарифи:</div>
                      {c.priceBenchmarks.map((p, i) => (
                        <div key={i} className="text-[11px] flex justify-between gap-2">
                          <span className="text-muted-foreground">{p.route}</span>
                          <span className="font-semibold text-primary whitespace-nowrap">{p.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {c.strengths.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">✓ {s}</Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t">
                    {c.ukrainianOffices.length > 0 && (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.ukrainianOffices.map((o) => o.city).join(", ")}</span>
                    )}
                    {c.ukrainianOffices[0]?.phone && (
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{c.ukrainianOffices[0].phone}</span>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Mail className="h-3 w-3" />{c.email}
                      </a>
                    )}
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline ml-auto">
                      <ExternalLink className="h-3 w-3" />Сайт
                    </a>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="mizhnarodni-perevyznyky" />
    </PortalLayout>
  );
};

export default IntlCarriersPage;
