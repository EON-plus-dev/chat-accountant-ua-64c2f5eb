import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, Sparkles, Phone, Globe, MapPin, CreditCard, Plug } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  FUEL_CHAINS,
  FUEL_CHAIN_KIND_LABEL,
  FUEL_AS_OF,
  FUEL_PRICES,
  FUEL_TYPE_LABEL,
  type FuelChainKind,
} from "@/portal/data/fuelStations";

const KINDS: FuelChainKind[] = ['major', 'premium', 'regional', 'discount'];

const KIND_BADGE: Record<FuelChainKind, string> = {
  major: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  premium: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  regional: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  discount: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
};

const FuelStationsPage = () => {
  const [kindFilter, setKindFilter] = useState<FuelChainKind | "all">("all");
  const [search, setSearch] = useState("");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: FUEL_CHAINS.length };
    FUEL_CHAINS.forEach((o) => (c[o.kind] = (c[o.kind] || 0) + 1));
    return c;
  }, []);

  const priceByChain = useMemo(() => {
    const map: Record<string, Partial<Record<string, number>>> = {};
    FUEL_PRICES.forEach((r) => (map[r.chainId] = r.prices));
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return FUEL_CHAINS.filter((o) => {
      if (kindFilter !== "all" && o.kind !== kindFilter) return false;
      if (!q) return true;
      return o.name.toLowerCase().includes(q) || (o.notes ?? '').toLowerCase().includes(q);
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return b.stationCount - a.stationCount;
    });
  }, [kindFilter, search]);

  const activeFilters = kindFilter !== "all" ? 1 : 0;

  const sidebar = (
    <FilterSection title="Тип мережі">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі", count: kindCounts.all },
          ...KINDS.map((k) => ({
            value: k,
            label: FUEL_CHAIN_KIND_LABEL[k],
            count: kindCounts[k] || 0,
          })),
        ]}
        value={kindFilter}
        onChange={(v) => setKindFilter(v as FuelChainKind | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `АЗС України 2026 — WOG, OKKO, SOCAR, Shell, UPG | FINTODO`,
        description: `Довідник мереж АЗС України: кількість станцій, типи палива, паливні картки для бізнесу, B2B-знижки, інтеграції з 1С/BAS/M.E.Doc. Snapshot ${FUEL_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/azs`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "АЗС", url: `${SITE_URL}/dovidnyky/azs` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "АЗС" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Fuel className="h-6 w-6 text-primary" />
              АЗС і мережі палива
            </h1>
            <p className="text-muted-foreground">
              Усі основні мережі АЗС України: покриття, програми лояльності, паливні картки для
              автопарку, інтеграції з ЕДО. Поточні ціни — у розділі{" "}
              <a href="/dovidnyky/tsiny-palyva" className="text-primary hover:underline">Ціни на паливо</a>.
              Snapshot {FUEL_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: WOG, OKKO, Shell..."
            resultCount={filtered.length}
            resultLabel="мереж"
            activeFilterCount={activeFilters}
            onResetFilters={() => setKindFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((o) => {
                const prices = priceByChain[o.id] || {};
                return (
                  <Card key={o.slug} className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`text-[10px] ${KIND_BADGE[o.kind]}`}>
                            {FUEL_CHAIN_KIND_LABEL[o.kind]}
                          </Badge>
                          {o.popular && (
                            <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                              <Sparkles className="h-3 w-3" /> Топ
                            </Badge>
                          )}
                          {o.b2bCard && (
                            <Badge variant="outline" className="text-[10px] gap-0.5">
                              <CreditCard className="h-3 w-3" /> FleetCard
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-foreground leading-snug">{o.name}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5 text-center">
                        <div className="text-[10px] text-muted-foreground">Станцій</div>
                        <div className="text-sm font-bold text-foreground">{o.stationCount.toLocaleString('uk')}</div>
                      </div>
                      <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5 text-center">
                        <div className="text-[10px] text-muted-foreground">Областей</div>
                        <div className="text-sm font-bold text-foreground">{o.regions}</div>
                      </div>
                    </div>

                    <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2 mb-2">
                      <div className="text-[10px] text-muted-foreground mb-1">Ціни ({FUEL_AS_OF}, ₴/л):</div>
                      <div className="grid grid-cols-3 gap-1 text-[11px]">
                        {(Object.keys(prices) as (keyof typeof prices)[]).map((k) => (
                          <div key={k} className="flex justify-between gap-1">
                            <span className="text-muted-foreground">{FUEL_TYPE_LABEL[k]}:</span>
                            <span className="font-semibold text-foreground">{prices[k]?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      <span className="text-[10px] text-muted-foreground">Паливо:</span>
                      {o.fuels.map((f) => (
                        <Badge key={f} variant="secondary" className="text-[10px]">{FUEL_TYPE_LABEL[f]}</Badge>
                      ))}
                    </div>

                    {o.loyalty && (
                      <div className="text-[11px] text-foreground mb-1">
                        <span className="text-muted-foreground">Лояльність: </span>{o.loyalty}
                      </div>
                    )}
                    {o.b2bDiscount && (
                      <div className="text-[11px] text-foreground mb-1">
                        <span className="text-muted-foreground">B2B: </span>{o.b2bDiscount}
                      </div>
                    )}

                    {o.fleetIntegration.length > 0 && (
                      <div className="mb-2 flex items-center gap-1 flex-wrap">
                        <Plug className="h-3 w-3 text-muted-foreground" />
                        {o.fleetIntegration.map((e) => (
                          <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
                        ))}
                      </div>
                    )}

                    {o.notes && (
                      <p className="text-[11px] text-muted-foreground italic mb-2">{o.notes}</p>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-border text-[11px] flex-wrap">
                      <a href={o.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <Globe className="h-3 w-3" /> Сайт
                      </a>
                      <a href={`tel:${o.hotline.replace(/\s/g, '')}`} className="flex items-center gap-1 text-foreground hover:text-primary">
                        <Phone className="h-3 w-3" /> {o.hotline}
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="azs" />
    </PortalLayout>
  );
};

export default FuelStationsPage;
