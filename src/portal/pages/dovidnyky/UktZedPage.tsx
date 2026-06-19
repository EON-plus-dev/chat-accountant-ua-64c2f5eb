import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Ship } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { UKT_ZED, UKT_SECTION_LABEL, UKT_ZED_SECTIONS, type UktZedSection } from "@/portal/data/uktZed";

const UktZedPage = () => {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<UktZedSection | "all">("all");

  const sectionCounts = useMemo(() => {
    const c: Record<string, number> = { all: UKT_ZED.length };
    UKT_ZED.forEach((e) => (c[e.section] = (c[e.section] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return UKT_ZED.filter((e) => {
      if (sectionFilter !== "all" && e.section !== sectionFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.codeRaw.includes(q.replace(/\s+/g, "")) ||
        e.description.toLowerCase().includes(q) ||
        (e.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false) ||
        (e.examples?.some((x) => x.toLowerCase().includes(q)) ?? false) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, sectionFilter]);

  const sidebar = (
    <FilterSection title="Розділ УКТ ЗЕД">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Всі розділи", count: sectionCounts.all },
          ...UKT_ZED_SECTIONS.filter((s) => (sectionCounts[s] || 0) > 0).map((s) => ({
            value: s, label: `${s}. ${UKT_SECTION_LABEL[s]}`, count: sectionCounts[s] || 0,
          })),
        ]}
        value={sectionFilter}
        onChange={(v) => setSectionFilter(v as UktZedSection | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: `УКТ ЗЕД — коди товарів для імпорту/експорту | FINTODO`,
        description: `Українська класифікація товарів зовнішньоекономічної діяльності. Для кожного коду — мито, ПДВ, акциз, дозволи. ${UKT_ZED.length} ключових позицій.`,
        canonical: `${SITE_URL}/dovidnyky/ukt-zed`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "УКТ ЗЕД", url: `${SITE_URL}/dovidnyky/ukt-zed` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "УКТ ЗЕД" },
        ]} />
        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Ship className="h-6 w-6 text-primary" />
              УКТ ЗЕД — коди товарів для митниці
            </h1>
            <p className="text-muted-foreground">
              Українська класифікація товарів зовнішньоекономічної діяльності (Закон № 674-IX від 04.06.2020 на основі HS 2022). Для кожного коду — мито, ПДВ, акциз, дозволи та сертифікати.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою товару, кодом або прикладом..."
            resultCount={filtered.length}
            resultLabel="позицій"
            activeFilterCount={sectionFilter !== "all" ? 1 : 0}
            onResetFilters={() => setSectionFilter("all")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((e) => (
                <Link key={e.id} to={`/dovidnyky/ukt-zed/${e.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{e.name}</h3>
                      <Badge variant="outline" size="sm" className="text-[10px] shrink-0 font-mono">{e.code}</Badge>
                    </div>
                    {e.aliases && e.aliases.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2 italic">{e.aliases.join(" · ")}</p>
                    )}
                    <div className="grid grid-cols-3 gap-1 text-[10px] border-t border-border pt-2">
                      <div><span className="text-muted-foreground">Мито:</span> <span className="font-semibold text-foreground">{e.duty.importRate}</span></div>
                      <div><span className="text-muted-foreground">ПДВ:</span> <span className="font-semibold text-foreground">{e.duty.vatRate}</span></div>
                      {e.duty.excise && <div><span className="text-muted-foreground">Акциз:</span> <span className="font-semibold text-foreground">є</span></div>}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>}
            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Повний класифікатор</strong> містить понад 11 000 товарних позицій. У FINTODO — найзатребуваніші коди для імпорту/експорту. Повна база — на сайті{" "}
                <a href="https://customs.gov.ua/uktzed" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Держмитслужби</a>.
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="ukt-zed" />
    </PortalLayout>
  );
};

export default UktZedPage;
