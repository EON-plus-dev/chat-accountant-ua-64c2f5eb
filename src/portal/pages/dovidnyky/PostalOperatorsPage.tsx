import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Sparkles, Phone, Globe, Mail, Package, MapPin, Network, Plug } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  POSTAL_OPERATORS,
  POSTAL_OPERATOR_KIND_LABEL,
  POSTAL_OPERATORS_AS_OF,
  type PostalOperatorKind,
} from "@/portal/data/postalOperators";

const KINDS: PostalOperatorKind[] = ['state', 'private', 'courier', 'marketplace'];

const KIND_BADGE: Record<PostalOperatorKind, string> = {
  state: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  private: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  courier: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  marketplace: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
};

const PostalOperatorsPage = () => {
  const [kindFilter, setKindFilter] = useState<PostalOperatorKind | "all">("all");
  const [search, setSearch] = useState("");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: POSTAL_OPERATORS.length };
    POSTAL_OPERATORS.forEach((o) => (c[o.kind] = (c[o.kind] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return POSTAL_OPERATORS.filter((o) => {
      if (kindFilter !== "all" && o.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.coverage.toLowerCase().includes(q) ||
        o.hotline.includes(q)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return b.branches - a.branches;
    });
  }, [kindFilter, search]);

  const activeFilters = kindFilter !== "all" ? 1 : 0;

  const sidebar = (
    <FilterSection title="Тип оператора">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі", count: kindCounts.all },
          ...KINDS.map((k) => ({
            value: k,
            label: POSTAL_OPERATOR_KIND_LABEL[k],
            count: kindCounts[k] || 0,
          })),
        ]}
        value={kindFilter}
        onChange={(v) => setKindFilter(v as PostalOperatorKind | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `Поштові оператори України 2026 — Нова Пошта, Укрпошта, Meest, Justin | FINTODO`,
        description: `Довідник усіх поштових і логістичних операторів України: тарифи, мережа відділень і постоматів, API, інтеграції з ЕДО, страхування і накладений платіж. Snapshot ${POSTAL_OPERATORS_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/poshtovi-operatory`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Поштові оператори", url: `${SITE_URL}/dovidnyky/poshtovi-operatory` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Поштові оператори" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Поштові оператори і логістика
            </h1>
            <p className="text-muted-foreground">
              Усі основні оператори поштового звʼязку і логістики в Україні: тарифи, мережа,
              інтеграції з ЕДО, B2B-кабінети, API для інтернет-магазинів. Snapshot {POSTAL_OPERATORS_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: Нова Пошта, Meest, гаряча лінія..."
            resultCount={filtered.length}
            resultLabel="операторів"
            activeFilterCount={activeFilters}
            onResetFilters={() => setKindFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((o) => (
                <Card key={o.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${KIND_BADGE[o.kind]}`}>
                          {POSTAL_OPERATOR_KIND_LABEL[o.kind]}
                        </Badge>
                        {o.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                        {o.apiAvailable && (
                          <Badge variant="outline" className="text-[10px] gap-0.5">
                            <Plug className="h-3 w-3" /> API
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-foreground leading-snug">{o.name}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5 text-center">
                      <div className="text-[10px] text-muted-foreground">Відділень</div>
                      <div className="text-sm font-bold text-foreground">{o.branches.toLocaleString('uk')}</div>
                    </div>
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5 text-center">
                      <div className="text-[10px] text-muted-foreground">Постоматів</div>
                      <div className="text-sm font-bold text-foreground">{(o.postomats ?? 0).toLocaleString('uk')}</div>
                    </div>
                    <div className="rounded-md bg-muted/40 border border-border px-2 py-1.5 text-center">
                      <div className="text-[10px] text-muted-foreground">Міст</div>
                      <div className="text-sm font-bold text-foreground">{o.cities.toLocaleString('uk')}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-2 text-[12px]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <span className="text-foreground">{o.coverage}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Package className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <span><span className="text-muted-foreground">Тариф: </span><span className="text-foreground">{o.baseTariff}</span></span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Network className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <span className="text-foreground">{o.deliveryTime}</span>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/30 border border-border px-2 py-1.5 mb-2 text-[11px] space-y-0.5">
                    <div><span className="text-muted-foreground">Страхування: </span><span className="text-foreground">{o.insurance}</span></div>
                    <div><span className="text-muted-foreground">Накладений платіж: </span><span className="text-foreground">{o.cod}</span></div>
                  </div>

                  {o.edoIntegrations.length > 0 && (
                    <div className="mb-2 flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">ЕДО:</span>
                      {o.edoIntegrations.map((e) => (
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
                    {o.email && (
                      <a href={`mailto:${o.email}`} className="flex items-center gap-1 text-foreground hover:text-primary">
                        <Mail className="h-3 w-3" /> {o.email}
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="poshtovi-operatory" />
    </PortalLayout>
  );
};

export default PostalOperatorsPage;
