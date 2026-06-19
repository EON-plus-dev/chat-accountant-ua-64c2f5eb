import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  PROFESII,
  PROFESIA_SECTION_LABEL,
  type ProfesiaSection,
} from "@/portal/data/profesii";

const ProfesiiPage = () => {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<ProfesiaSection | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<"all" | "business" | "personal">("all");
  const [pensionFilter, setPensionFilter] = useState<"all" | "list1" | "list2" | "none">("all");

  const sectionCounts = useMemo(() => {
    const c: Record<string, number> = { all: PROFESII.length };
    PROFESII.forEach((p) => (c[p.section] = (c[p.section] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return PROFESII.filter((p) => {
      if (sectionFilter !== "all" && p.section !== sectionFilter) return false;
      if (audienceFilter !== "all" && p.audience !== audienceFilter && p.audience !== "both") return false;
      if (pensionFilter === "list1" && p.pensionList !== "1") return false;
      if (pensionFilter === "list2" && p.pensionList !== "2") return false;
      if (pensionFilter === "none" && p.pensionList && p.pensionList !== "none") return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, sectionFilter, audienceFilter, pensionFilter]);

  const activeFilterCount =
    (sectionFilter !== "all" ? 1 : 0) +
    (audienceFilter !== "all" ? 1 : 0) +
    (pensionFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Розділ класифікатора">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі розділи", count: sectionCounts.all },
            ...(Object.entries(PROFESIA_SECTION_LABEL) as [ProfesiaSection, string][])
              .filter(([v]) => (sectionCounts[v] || 0) > 0)
              .map(([v, l]) => ({ value: v, label: `${v}. ${l}`, count: sectionCounts[v] || 0 })),
          ]}
          value={sectionFilter}
          onChange={(v) => setSectionFilter(v as ProfesiaSection | "all")}
        />
      </FilterSection>
      <FilterSection title="Кому корисно">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всім" },
            { value: "business", label: "Бізнесу / ФОП" },
            { value: "personal", label: "Фізособам" },
          ]}
          value={audienceFilter}
          onChange={(v) => setAudienceFilter(v as "all" | "business" | "personal")}
        />
      </FilterSection>
      <FilterSection title="Пільгова пенсія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Будь-яка" },
            { value: "list1", label: "Список 1" },
            { value: "list2", label: "Список 2" },
            { value: "none", label: "Без пільг" },
          ]}
          value={pensionFilter}
          onChange={(v) => setPensionFilter(v as "all" | "list1" | "list2" | "none")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Класифікатор професій ДК 003:2010 — ${PROFESII.length} професій | FINTODO`,
        description: `Класифікатор професій ДК 003:2010 для трудових договорів, штатних розписів, форми 1ДФ. Коди, опис, освіта, зарплати, пільгова пенсія.`,
        canonical: `${SITE_URL}/dovidnyky/profesii`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Класифікатор професій", url: `${SITE_URL}/dovidnyky/profesii` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Класифікатор професій" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Класифікатор професій ДК 003:2010
            </h1>
            <p className="text-muted-foreground">
              Офіційний класифікатор професій України — обовʼязковий у трудових договорах, штатних розписах,
              формі 1ДФ та звіті з ЄСВ. Назва посади має точно відповідати ДК 003:2010.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою, кодом або синонімом..."
            resultCount={filtered.length}
            resultLabel="професій"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              setSectionFilter("all");
              setAudienceFilter("all");
              setPensionFilter("all");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((p) => (
                <Link key={p.id} to={`/dovidnyky/profesii/${p.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <Badge variant="outline" size="sm" className="text-[10px] shrink-0 font-mono">
                        {p.code}
                      </Badge>
                    </div>
                    {p.aliases && p.aliases.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2 italic">
                        {p.aliases.join(" · ")}
                      </p>
                    )}
                    <p className="text-sm text-foreground line-clamp-2 mb-2">{p.description}</p>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] border-t border-border pt-2">
                      <Badge variant="secondary" size="sm" className="text-[10px]">
                        Розділ {p.section}
                      </Badge>
                      {p.pensionList && p.pensionList !== "none" && (
                        <Badge variant="default" size="sm" className="text-[10px]">
                          Пільгова пенсія, Список {p.pensionList}
                        </Badge>
                      )}
                      {p.typicalSalary && (
                        <span className="text-[10px] text-muted-foreground ml-auto">{p.typicalSalary}</span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}

            <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Повний класифікатор</strong> ДК 003:2010 містить близько 8 500
                професій. У FINTODO опубліковано підмножину найзатребуваніших. Повний перелік — на сайті{" "}
                <a
                  href="https://zakon.rada.gov.ua/rada/show/va327609-10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Верховної Ради
                </a>
                .
              </p>
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="profesii" />
    </PortalLayout>
  );
};

export default ProfesiiPage;
