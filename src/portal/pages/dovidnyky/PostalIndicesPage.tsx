import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Info, ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  POSTAL_INDICES,
  POSTAL_INDICES_AS_OF,
  POSTAL_INDICES_NOTE,
  POSTAL_INDICES_SOURCE,
} from "@/portal/data/postalIndices";

const REGIONS = Array.from(new Set(POSTAL_INDICES.map((p) => p.region))).sort((a, b) => a.localeCompare(b, 'uk'));

const PostalIndicesPage = () => {
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = { all: POSTAL_INDICES.length };
    POSTAL_INDICES.forEach((p) => (c[p.region] = (c[p.region] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return POSTAL_INDICES.filter((p) => {
      if (regionFilter !== "all" && p.region !== regionFilter) return false;
      if (!q) return true;
      return (
        p.index.includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.district ?? '').toLowerCase().includes(q)
      );
    }).sort((a, b) => a.city.localeCompare(b.city, 'uk'));
  }, [regionFilter, search]);

  const activeFilters = regionFilter !== "all" ? 1 : 0;

  const sidebar = (
    <FilterSection title="Регіон">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі регіони", count: regionCounts.all },
          ...REGIONS.map((r) => ({
            value: r,
            label: r,
            count: regionCounts[r] || 0,
          })),
        ]}
        value={regionFilter}
        onChange={(v) => setRegionFilter(v)}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `Поштові індекси України 2026 — пошук за містом та індексом | FINTODO`,
        description: `Довідник поштових індексів України. Пошук за містом, районом або 5-значним індексом. Snapshot ${POSTAL_INDICES_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/poshtovi-indeksy`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Поштові індекси", url: `${SITE_URL}/dovidnyky/poshtovi-indeksy` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Поштові індекси" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Поштові індекси України
            </h1>
            <p className="text-muted-foreground">
              Пошук поштового індексу за містом, районом або введіть 5-значний індекс для зворотного
              пошуку. Snapshot {POSTAL_INDICES_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Київ, 01001, Подільський..."
            resultCount={filtered.length}
            resultLabel="індексів"
            activeFilterCount={activeFilters}
            onResetFilters={() => setRegionFilter("all")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filtered.map((p, i) => (
                <Card key={`${p.index}-${p.city}-${i}`} className="p-3 hover:border-primary/40 transition-colors">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground truncate">{p.city}</div>
                      {p.district && <div className="text-[11px] text-muted-foreground">{p.district} р-н</div>}
                      <div className="text-[11px] text-muted-foreground">{p.region} обл.</div>
                    </div>
                    <div className="font-mono text-base font-bold text-primary shrink-0">{p.index}</div>
                  </div>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <Info className="h-4 w-4 text-primary" />
                Про довідник
              </p>
              <p>{POSTAL_INDICES_NOTE}</p>
              <a
                href={POSTAL_INDICES_SOURCE}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Повний довідник Укрпошти <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="poshtovi-indeksy" />
    </PortalLayout>
  );
};

export default PostalIndicesPage;
