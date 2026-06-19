import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, Sparkles, ShieldAlert, Info } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  TCO_ENTRIES,
  TCO_KIND_LABEL,
  TCO_AS_OF,
  type TcoEntryKind,
} from "@/portal/data/tcoRules";

const KINDS: TcoEntryKind[] = ['threshold', 'method', 'low_tax_country', 'special_form', 'documentation', 'penalty'];

const KIND_BADGE_CLASS: Record<TcoEntryKind, string> = {
  threshold: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  method: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30',
  low_tax_country: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30',
  special_form: 'bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-500/30',
  documentation: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  penalty: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30',
};

const TcoRulesPage = () => {
  const [kindFilter, setKindFilter] = useState<TcoEntryKind | "all">("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: TCO_ENTRIES.length };
    TCO_ENTRIES.forEach((e) => (c[e.kind] = (c[e.kind] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TCO_ENTRIES.filter((e) => {
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
          ...KINDS.map((k) => ({ value: k, label: TCO_KIND_LABEL[k], count: counts[k] || 0 })),
        ]}
        value={kindFilter}
        onChange={(v) => setKindFilter(v as TcoEntryKind | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `ТЦО — трансфертне ціноутворення, низькоподаткові юрисдикції, методи | FINTODO`,
        description: `Усе про ТЦО: пороги 150 млн / 10 млн, методи (CUP, RPM, C+, TNMM, PSM), перелік низькоподаткових юрисдикцій (КМУ 1045) і орг.-форм (КМУ 480), Звіт про КО, документація, штрафи.`,
        canonical: `${SITE_URL}/dovidnyky/tco`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "ТЦО", url: `${SITE_URL}/dovidnyky/tco` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "ТЦО — трансфертне ціноутворення" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Globe2 className="h-6 w-6 text-primary" />
              ТЦО — трансфертне ціноутворення
            </h1>
            <p className="text-muted-foreground">
              Пороги контрольованості, 5 методів, перелік низькоподаткових юрисдикцій (КМУ № 1045)
              і орг.-правових форм (КМУ № 480), документація і штрафи. Snapshot {TCO_AS_OF}.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук: CUP, TNMM, ОАЕ, Кіпр, LLP, штраф..."
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
                          {TCO_KIND_LABEL[e.kind]}
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
                Ключові правила ТЦО 2026 року
              </p>
              <ul className="space-y-1 ml-3 list-disc">
                <li>Контрольовані лише операції з нерезидентами (резидент↔резидент — НІ).</li>
                <li>Подвійний поріг: дохід платника &gt; 150 млн ₴ І обсяг з контрагентом &gt; 10 млн ₴.</li>
                <li>Звіт про КО — до 1 жовтня року, наступного за звітним.</li>
                <li>Документація — на запит ДПС протягом 30 кал. днів.</li>
                <li>Штраф за неподання Звіту — 300 ПМ ≈ 908 400 ₴.</li>
                <li>UAE, Кіпр, Естонія, BVI, HK — у переліку КМУ 1045 (повний список — щорічно).</li>
                <li>LLP/LP UK, single-member LLC US, GmbH &amp; Co. KG — у переліку КМУ 480.</li>
              </ul>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="tco" />
    </PortalLayout>
  );
};

export default TcoRulesPage;
