import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, AlertOctagon, Star, Calendar } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  DTT_TREATIES,
  DTT_REGION_LABEL,
  DTT_AS_OF,
  DTT_TERMINATED,
  type DttRegion,
} from "@/portal/data/dttTreaties";

const REGIONS: DttRegion[] = [
  "eu",
  "europe_non_eu",
  "americas",
  "asia",
  "middle_east",
  "cis",
  "africa",
  "oceania",
];

const DttPage = () => {
  const [regionFilter, setRegionFilter] = useState<DttRegion | "all" | "popular">("all");
  const [search, setSearch] = useState("");

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {
      all: DTT_TREATIES.length,
      popular: DTT_TREATIES.filter((t) => t.popular).length,
    };
    DTT_TREATIES.forEach((t) => (c[t.region] = (c[t.region] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return DTT_TREATIES.filter((t) => {
      if (regionFilter === "popular" && !t.popular) return false;
      if (regionFilter !== "all" && regionFilter !== "popular" && t.region !== regionFilter)
        return false;
      if (!q) return true;
      return (
        t.country.toLowerCase().includes(q) ||
        t.countryEn.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    });
  }, [regionFilter, search]);

  const sidebar = (
    <FilterSection title="Регіон">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі країни", count: regionCounts.all },
          { value: "popular", label: "★ Топові", count: regionCounts.popular },
          ...REGIONS.filter((r) => (regionCounts[r] || 0) > 0).map((r) => ({
            value: r,
            label: DTT_REGION_LABEL[r],
            count: regionCounts[r] || 0,
          })),
        ]}
        value={regionFilter}
        onChange={(v) => setRegionFilter(v as DttRegion | "all" | "popular")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: "Договори про уникнення подвійного оподаткування — ставки для України | FINTODO",
        description: `Ставки податку у джерела виплати з України по 50+ країнах: дивіденди, проценти, роялті. ДПО з ЄС, США, ОАЕ, Сингапуром. ${DTT_TREATIES.length} країн на ${DTT_AS_OF}.`,
        canonical: `${SITE_URL}/dovidnyky/dpo`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Уникнення подвійного оподаткування", url: `${SITE_URL}/dovidnyky/dpo` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Уникнення подвійного оподаткування" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Globe2 className="h-6 w-6 text-primary" />
              Уникнення подвійного оподаткування
            </h1>
            <p className="text-muted-foreground">
              Чинні конвенції України про уникнення подвійного оподаткування: ставки податку
              у джерела виплати на дивіденди, проценти і роялті. Snapshot на {DTT_AS_OF}.
            </p>
          </header>

          {/* Денонсовані */}
          <Card className="p-4 bg-destructive/5 border-destructive/30">
            <div className="flex items-start gap-2">
              <AlertOctagon className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="text-foreground font-semibold">Призупинено / припинено:</p>
                {DTT_TERMINATED.map((t) => (
                  <p key={t.country} className="text-muted-foreground">
                    <span className="text-foreground">{t.country}</span> — {t.reason} (з {t.terminatedFrom})
                  </p>
                ))}
              </div>
            </div>
          </Card>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук країни: Польща, USA, Cyprus..."
            resultCount={filtered.length}
            resultLabel="країн"
            activeFilterCount={regionFilter !== "all" ? 1 : 0}
            onResetFilters={() => setRegionFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((t) => (
                <Card key={t.id} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl leading-none">{t.flag}</span>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{t.country}</h3>
                          <p className="text-[11px] text-muted-foreground">{t.countryEn}</p>
                        </div>
                        {t.popular && (
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="rounded-md bg-primary/5 border border-primary/20 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase">Дивіденди</div>
                      <div className="text-sm font-bold text-primary tabular-nums">{t.dividends}</div>
                    </div>
                    <div className="rounded-md bg-primary/5 border border-primary/20 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase">Проценти</div>
                      <div className="text-sm font-bold text-primary tabular-nums">{t.interest}</div>
                    </div>
                    <div className="rounded-md bg-primary/5 border border-primary/20 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase">Роялті</div>
                      <div className="text-sm font-bold text-primary tabular-nums">{t.royalties}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Чинна з: <span className="text-foreground">{t.inForceSince}</span>
                      {t.mli && (
                        <Badge variant="outline" className="text-[9px] ml-auto">
                          MLI / BEPS
                        </Badge>
                      )}
                    </div>
                    {t.dividendsNote && (
                      <p><span className="text-foreground">Дивіденди:</span> {t.dividendsNote}</p>
                    )}
                    {t.interestNote && (
                      <p><span className="text-foreground">Проценти:</span> {t.interestNote}</p>
                    )}
                    {t.royaltiesNote && (
                      <p><span className="text-foreground">Роялті:</span> {t.royaltiesNote}</p>
                    )}
                    {t.notes?.map((n, i) => (
                      <p key={i} className="italic">{n}</p>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-1">
              <p className="text-foreground font-semibold">Як скористатися пільговою ставкою?</p>
              <p>
                Резидент іноземної країни повинен надати українському платнику <strong>довідку про
                податкове резидентство</strong> (Certificate of Residence) за календарний рік виплати.
                Без довідки — застосовується звичайна ставка ПКУ (15% для дивідендів/процентів/роялті
                нерезидента).
              </p>
              <p>Підстава: ст. 103 ПКУ.</p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="dpo" />
    </PortalLayout>
  );
};

export default DttPage;
