import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { KNOWLEDGE, type KnowledgeEntry } from "@/portal/data/knowledge";

const CATEGORY_MAP: Record<KnowledgeEntry["category"], string> = {
  tax: "Податки",
  accounting: "Облік",
  law: "Право",
  finance: "Фінанси",
};

const pluralizeRelated = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} повʼязаний матеріал`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} повʼязані матеріали`;
  return `${n} повʼязаних матеріалів`;
};

const KnowledgePage = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [letterFilter, setLetterFilter] = useState("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: KNOWLEDGE.length };
    KNOWLEDGE.forEach((k) => { counts[k.category] = (counts[k.category] || 0) + 1; });
    return counts;
  }, []);

  const categoryOptions = useMemo(() => [
    { value: "all", label: "Всі", count: categoryCounts.all },
    { value: "tax", label: "Податки", count: categoryCounts.tax || 0 },
    { value: "accounting", label: "Облік", count: categoryCounts.accounting || 0 },
    { value: "law", label: "Право", count: categoryCounts.law || 0 },
    { value: "finance", label: "Фінанси", count: categoryCounts.finance || 0 },
  ], [categoryCounts]);

  const letterOptions = useMemo(() => {
    const letterCounts: Record<string, number> = {};
    KNOWLEDGE.forEach((k) => {
      const letter = k.term.charAt(0).toUpperCase();
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });
    const sorted = Object.keys(letterCounts).sort((a, b) => a.localeCompare(b, "uk"));
    return [
      { value: "all", label: "Всі", count: KNOWLEDGE.length },
      ...sorted.map((l) => ({ value: l, label: l, count: letterCounts[l] })),
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return KNOWLEDGE.filter((k) => {
      const matchesCategory = activeTab === "all" || k.category === activeTab;
      const matchesLetter = letterFilter === "all" || k.term.charAt(0).toUpperCase() === letterFilter;
      const matchesSearch = !q || k.term.toLowerCase().includes(q) || k.shortDefinition.toLowerCase().includes(q);
      return matchesCategory && matchesLetter && matchesSearch;
    });
  }, [search, activeTab, letterFilter]);

  const activeFilterCount = (activeTab !== "all" ? 1 : 0) + (letterFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup options={categoryOptions} value={activeTab} onChange={setActiveTab} />
      </FilterSection>
      <FilterSection title="Літера">
        <FilterRadioGroup options={letterOptions} value={letterFilter} onChange={setLetterFilter} />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Діловий словник — терміни з оподаткування та обліку | FINTODO",
        description: `${KNOWLEDGE.length} термінів з оподаткування, бухобліку та права — пояснення зрозумілою мовою для підприємців і фізосіб.`,
        canonical: `${SITE_URL}/dovidnyky/slovnyk`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Словник", url: `${SITE_URL}/dovidnyky/slovnyk` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Довідники", to: "/dovidnyky" }, { label: "Словник" }]} />

        <div className="space-y-6 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Діловий словник</h1>
            <p className="text-muted-foreground">Пояснення ключових термінів зрозумілою мовою</p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук терміну..."
            resultCount={filtered.length}
            resultLabel="термінів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setActiveTab("all"); setLetterFilter("all"); }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((entry) => (
                <Card key={entry.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-bold text-foreground">{entry.term}</h2>
                    <Badge variant="outline" size="sm">{CATEGORY_MAP[entry.category]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{entry.shortDefinition}</p>
                  <div className="flex items-center justify-between">
                    {entry.relatedTermSlugs.length > 0 ? (
                      <span className="text-xs text-muted-foreground">{pluralizeRelated(entry.relatedTermSlugs.length)}</span>
                    ) : <span />}
                    <Link to={`/dovidnyky/slovnyk/${entry.slug}`} className="text-sm font-medium text-primary hover:underline">
                      Читати →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">Нічого не знайдено за запитом «{search}»</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
    </PortalLayout>
  );
};

export default KnowledgePage;
