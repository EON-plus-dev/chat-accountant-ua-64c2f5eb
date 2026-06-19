import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { LAWS, LAW_CATEGORY_MAP, LAW_TYPE_MAP } from "@/portal/data/laws";
import type { LawEntry } from "@/portal/data/laws";

const IMPACT_VARIANT: Record<string, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

const LawsPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: LAWS.length };
    LAWS.forEach((law) => { counts[law.category] = (counts[law.category] || 0) + 1; });
    return counts;
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: LAWS.length };
    LAWS.forEach((law) => { counts[law.type] = (counts[law.type] || 0) + 1; });
    return counts;
  }, []);

  const impactCounts = useMemo(() => {
    const counts: Record<string, number> = { all: LAWS.length };
    LAWS.forEach((law) => {
      const impact = law.recentChanges[0]?.impact;
      if (impact) counts[impact] = (counts[impact] || 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return LAWS.filter((law) => {
      const matchesCategory = categoryFilter === "all" || law.category === categoryFilter;
      const matchesType = typeFilter === "all" || law.type === typeFilter;
      const matchesImpact = impactFilter === "all" || law.recentChanges[0]?.impact === impactFilter;
      const matchesSearch = !q || law.fullName.toLowerCase().includes(q) || law.shortName.toLowerCase().includes(q) || law.description.toLowerCase().includes(q);
      return matchesCategory && matchesType && matchesImpact && matchesSearch;
    });
  }, [search, categoryFilter, typeFilter, impactFilter]);

  const activeFilterCount = (categoryFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0) + (impactFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: categoryCounts.all },
            { value: "tax", label: "Податкове", count: categoryCounts.tax || 0 },
            { value: "labor", label: "Трудове", count: categoryCounts.labor || 0 },
            { value: "corporate", label: "Корпоративне", count: categoryCounts.corporate || 0 },
            { value: "social", label: "Соціальне", count: categoryCounts.social || 0 },
            { value: "war", label: "Воєнний стан", count: categoryCounts.war || 0 },
          ]}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </FilterSection>
      <FilterSection title="Тип">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: typeCounts.all },
            { value: "kodeks", label: "Кодекс", count: typeCounts.kodeks || 0 },
            { value: "zakon", label: "Закон", count: typeCounts.zakon || 0 },
            { value: "postanova", label: "Постанова", count: typeCounts.postanova || 0 },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </FilterSection>
      <FilterSection title="Вплив змін">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: impactCounts.all },
            { value: "high", label: "🔴 Високий", count: impactCounts.high || 0 },
            { value: "medium", label: "🟡 Середній", count: impactCounts.medium || 0 },
            { value: "low", label: "⚪ Низький", count: impactCounts.low || 0 },
          ]}
          value={impactFilter}
          onChange={setImpactFilter}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Законодавство для бізнесу — ${LAWS.length} ключових законів | FINTODO`,
        description: `Путівник по ${LAWS.length} ключових законах України для підприємців: ПКУ, ЗУ про ЄСВ, КЗпП. Суть, зміни і вплив на бізнес.`,
        canonical: `${SITE_URL}/dovidnyky/zakony`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Законодавство", url: `${SITE_URL}/dovidnyky/zakony` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Законодавство" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground">Законодавство для бізнесу</h1>
            <p className="text-muted-foreground">Суть, зміни і вплив ключових законів України на бізнес</p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук закону..."
            resultCount={filtered.length}
            resultLabel="законів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setCategoryFilter("all"); setTypeFilter("all"); setImpactFilter("all"); }}
          >
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {filtered.map((law) => (
                <Link
                  key={law.id}
                  to={`/dovidnyky/zakony/${law.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">{LAW_TYPE_MAP[law.type]}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{law.shortName}</span>
                      <Badge variant="secondary" size="sm" className="text-[10px]">{LAW_CATEGORY_MAP[law.category]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{law.description}</p>
                  </div>
                  {law.recentChanges.length > 0 && (
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground font-mono">{law.recentChanges[0].date}</span>
                      <Badge variant={IMPACT_VARIANT[law.recentChanges[0].impact]} size="sm" className="text-[10px]">
                        {law.recentChanges[0].impact === 'high' ? '!' : law.recentChanges[0].impact === 'medium' ? '~' : '·'}
                      </Badge>
                    </div>
                  )}
                  <span className="text-xs text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено за запитом «{search}»</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="zakony" />
    </PortalLayout>
  );
};

export default LawsPage;
