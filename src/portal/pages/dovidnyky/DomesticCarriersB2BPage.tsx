import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Truck, Phone, Mail, ExternalLink, Check } from "lucide-react";
import { DOMESTIC_CARRIERS, DOMESTIC_CARRIERS_AS_OF } from "@/portal/data/domesticCarriers";

const DomesticCarriersB2BPage = () => {
  const [hasApi, setHasApi] = useState<"all" | "yes">("all");
  const [hasContract, setHasContract] = useState<"all" | "yes">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return DOMESTIC_CARRIERS.filter((c) => {
      if (hasApi === "yes" && !c.apiAvailable) return false;
      if (hasContract === "yes" && !c.b2bContractAvailable) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) ||
        c.services.some((s) => s.toLowerCase().includes(q)) ||
        (c.integrations ?? []).some((i) => i.toLowerCase().includes(q));
    });
  }, [hasApi, hasContract, search]);

  const activeFilters = (hasApi !== "all" ? 1 : 0) + (hasContract !== "all" ? 1 : 0);

  const sidebar = (
    <div className="space-y-5">
      <FilterSection title="API-інтеграція">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, { value: "yes", label: "Тільки з API" }]}
          value={hasApi}
          onChange={(v) => setHasApi(v as "all" | "yes")}
        />
      </FilterSection>
      <FilterSection title="B2B-контракт">
        <FilterRadioGroup
          options={[{ value: "all", label: "Усі" }, { value: "yes", label: "З персональним менеджером" }]}
          value={hasContract}
          onChange={(v) => setHasContract(v as "all" | "yes")}
        />
      </FilterSection>
    </div>
  );

  return (
    <PortalLayout
      meta={{
        title: "B2B-логістика України — Нова Пошта Бізнес, УкрПошта, Meest, Делівері | FINTODO",
        description: `Тарифи, API-інтеграції, B2B-контракти українських перевізників для бізнесу. Snapshot ${DOMESTIC_CARRIERS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/lohistyka-b2b`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "B2B-логістика", url: `${SITE_URL}/dovidnyky/lohistyka-b2b` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "B2B-логістика" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              B2B-логістика України
            </h1>
            <p className="text-muted-foreground">
              Українські перевізники для бізнесу: типові тарифи, API, інтеграції з CRM/маркетплейсами, B2B-контракти і знижки за обсягом. Snapshot {DOMESTIC_CARRIERS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: перевізник, послуга, інтеграція..."
            resultCount={filtered.length}
            resultLabel="перевізників"
            activeFilterCount={activeFilters}
            onResetFilters={() => { setHasApi("all"); setHasContract("all"); }}
          >
            <div className="grid gap-3">
              {filtered.map((c) => (
                <Card key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.geography}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {c.apiAvailable && <Badge variant="default" className="text-[10px]">API</Badge>}
                      {c.b2bContractAvailable && <Badge variant="secondary" className="text-[10px]">B2B-контракт</Badge>}
                    </div>
                  </div>

                  {c.personalManagerThreshold && (
                    <p className="text-xs text-muted-foreground"><strong>Поріг для контракту:</strong> {c.personalManagerThreshold}</p>
                  )}

                  <div>
                    <div className="text-[11px] font-semibold text-foreground mb-1">Послуги:</div>
                    <div className="flex flex-wrap gap-1">
                      {c.services.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded p-2 space-y-1">
                    <div className="text-[11px] font-semibold text-foreground mb-1">Типові тарифи:</div>
                    {c.typicalRates.map((p, i) => (
                      <div key={i} className="text-[11px] flex justify-between gap-2">
                        <span className="text-muted-foreground">{p.description}</span>
                        <span className="font-semibold text-primary whitespace-nowrap">{p.price}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-foreground mb-1">Для бізнесу:</div>
                    <div className="grid sm:grid-cols-2 gap-x-3 gap-y-1">
                      {c.b2bFeatures.map((f) => (
                        <div key={f} className="text-[11px] text-muted-foreground flex items-start gap-1">
                          <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />{f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {c.integrations && c.integrations.length > 0 && (
                    <div className="text-[11px] text-muted-foreground">
                      <strong>Інтеграції:</strong> {c.integrations.join(" · ")}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t">
                    {c.contactPhone && (
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{c.contactPhone}</span>
                    )}
                    {c.contactEmail && (
                      <a href={`mailto:${c.contactEmail}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Mail className="h-3 w-3" />{c.contactEmail}
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
          <RelatedPartnersBlock directoryId="lohistyka-b2b" />
    </PortalLayout>
  );
};

export default DomesticCarriersB2BPage;
