import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  DIIA_CITY_ENTRIES,
  DIIA_CITY_KIND_LABEL,
  DIIA_CITY_AS_OF,
  type DiiaCityEntryKind,
} from "@/portal/data/diiaCity";

const KINDS: DiiaCityEntryKind[] = ['criteria', 'tax_regime', 'personnel', 'reporting', 'benefit', 'risk'];

const KIND_BADGE_CLASS: Record<DiiaCityEntryKind, string> = {
  criteria: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  tax_regime: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  personnel: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  reporting: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  benefit: 'bg-primary/15 text-primary border border-primary/30',
  risk: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
};

const DiiaCityPage = () => {
  const [kindFilter, setKindFilter] = useState<DiiaCityEntryKind | "all">("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: DIIA_CITY_ENTRIES.length };
    DIIA_CITY_ENTRIES.forEach((e) => (c[e.kind] = (c[e.kind] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return DIIA_CITY_ENTRIES.filter((e) => {
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.legalRef.toLowerCase().includes(q) ||
        (e.shortName?.toLowerCase().includes(q) ?? false)
      );
    }).sort((a, b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [kindFilter, search]);

  const sidebar = (
    <FilterSection title="Тип запису">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Усі", count: counts.all },
          ...KINDS.map((k) => ({ value: k, label: DIIA_CITY_KIND_LABEL[k], count: counts[k] || 0 })),
        ]}
        value={kindFilter}
        onChange={(v) => setKindFilter(v as DiiaCityEntryKind | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `Дія City — критерії, податковий режим 9%, гіг-контракти, дивіденди | FINTODO`,
        description: `Усе про Дія City: 22 види діяльності, 9 осіб, 1 200 EUR, 90% доходу, ПДВ 9% на виведений капітал, ПДФО 5%, ЄСВ на мін. зарплату, гіг-контракти, опціони, дивіденди 0%.`,
        canonical: `${SITE_URL}/dovidnyky/diia-city`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Дія City", url: `${SITE_URL}/dovidnyky/diia-city` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Дія City" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              Дія City — спецрежим для IT
            </h1>
            <p className="text-muted-foreground">
              Критерії резидентства, податок 9% на виведений капітал, ПДФО 5%, ЄСВ на мінімалку,
              гіг-контракти, опціони і дивіденди 0%. Snapshot {DIIA_CITY_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: 9%, гіг-контракт, дивіденди, опціон, R&D..."
            resultCount={filtered.length}
            resultLabel="записів"
            activeFilterCount={kindFilter !== "all" ? 1 : 0}
            onResetFilters={() => setKindFilter("all")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((e) => (
                <Card key={e.slug} className="p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`text-[10px] ${KIND_BADGE_CLASS[e.kind]}`}>
                          {DIIA_CITY_KIND_LABEL[e.kind]}
                        </Badge>
                        {e.shortName && (
                          <Badge variant="outline" className="text-[10px] font-mono">{e.shortName}</Badge>
                        )}
                        {e.popular && (
                          <Badge className="text-[10px] gap-0.5 bg-primary/15 text-primary border border-primary/30">
                            <Sparkles className="h-3 w-3" /> Топ
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug">{e.name}</h3>
                    </div>
                  </div>

                  <p className="text-[12px] text-foreground/90 mb-2">{e.description}</p>

                  <div className="text-[11px] text-muted-foreground italic mb-2">{e.legalRef}</div>

                  {e.details && e.details.length > 0 && (
                    <ul className="text-[11px] space-y-0.5 ml-3 list-disc text-muted-foreground mb-2">
                      {e.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}

                  {e.practicalNote && (
                    <div className="flex items-start gap-1.5 text-[11px] text-foreground/80 bg-muted/40 rounded-md px-2 py-1.5">
                      <Info className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                      <span>{e.practicalNote}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                Ключові параметри 2026 року
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Мінімум 9 осіб (штатних + гіг) і середня винагорода ≥ 1 200 EUR/міс.</li>
                <li>≥ 90% доходу — від видів діяльності зі ст. 5 ЗУ № 1667-IX.</li>
                <li>Податок 9% на виведений капітал АБО стандартні 18% (за вибором).</li>
                <li>ПДФО 5% + ВЗ 5% для штатних і гіг-спеціалістів.</li>
                <li>ЄСВ — лише на мінзарплату: 8 000 × 22% = 1 760 ₴/міс на штатного.</li>
                <li>Дивіденди 1 раз / 2 роки — 0% ПДФО (тільки 5% ВЗ).</li>
                <li>Звіт про відповідність — до 30 червня щороку.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="diia-city" />
    </PortalLayout>
  );
};

export default DiiaCityPage;
