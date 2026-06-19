import { useState, useMemo, useEffect } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { useAudience } from "@/contexts/AudienceContext";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { PENALTIES, PENALTY_CATEGORIES } from "@/portal/data/penalties";
import { ArrowRight, Sparkles, ShieldAlert } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const SEVERITY_LABEL: Record<string, string> = {
  critical: "КРИТИЧНО",
  high: "СЕРЙОЗНО",
  medium: "СЕРЕДНЄ",
  low: "НЕЗНАЧНО",
};

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "warning",
  medium: "secondary",
  low: "outline",
};

const AUDIENCE_LABELS: Record<string, string> = {
  business: "Для бізнесу",
  personal: "Для фізосіб",
  both: "Для всіх",
};

const PenaltiesPage = () => {
  const { audience } = useAudience();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState(() =>
    audience === "individual" ? "personal" : "business"
  );

  useEffect(() => {
    setAudienceFilter(audience === "individual" ? "personal" : "business");
  }, [audience]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PENALTIES.length };
    PENALTIES.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, []);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PENALTIES.forEach((p) => { counts[p.severity] = (counts[p.severity] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PENALTIES.filter((p) => {
      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
      const matchesSeverity = severityFilter === "all" || p.severity === severityFilter;
      const matchesAudience = audienceFilter === "all" || p.audience === audienceFilter || p.audience === "both";
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.penaltyAmount.toLowerCase().includes(q);
      return matchesCat && matchesSeverity && matchesAudience && matchesSearch;
    });
  }, [search, categoryFilter, severityFilter, audienceFilter]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (severityFilter !== "all" ? 1 : 0) +
    (audienceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: categoryCounts.all },
            ...PENALTY_CATEGORIES.map((c) => ({ value: c, label: c, count: categoryCounts[c] || 0 })),
          ]}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </FilterSection>
      <FilterSection title="Серйозність">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі" },
            { value: "critical", label: "🔴 Критично", count: severityCounts.critical || 0 },
            { value: "high", label: "🟠 Серйозно", count: severityCounts.high || 0 },
            { value: "medium", label: "🟡 Середнє", count: severityCounts.medium || 0 },
            { value: "low", label: "⚪ Незначно", count: severityCounts.low || 0 },
          ]}
          value={severityFilter}
          onChange={setSeverityFilter}
        />
      </FilterSection>
      <FilterSection title="Аудиторія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Все" },
            { value: "business", label: "Для бізнесу" },
            { value: "personal", label: "Для фізосіб" },
          ]}
          value={audienceFilter}
          onChange={setAudienceFilter}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Штрафи для підприємців 2025 — повний довідник | FINTODO",
        description: "Штрафи ДПС, Держпраці, НБУ для ФОП і ТОВ. РРО, ЄСВ, трудові відносини, ПДВ.",
        canonical: `${SITE_URL}/dovidnyky/penalties`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Штрафи і санкції", url: `${SITE_URL}/dovidnyky/penalties` },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Штрафи для підприємців України",
        itemListElement: PENALTIES.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `${SITE_URL}/dovidnyky/penalties/${p.slug}`,
        })),
      }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Штрафи і санкції" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground">Довідник штрафів для підприємців</h1>
            <p className="text-muted-foreground max-w-2xl">Знайте що загрожує — щоб уникнути. Актуальні штрафи по всіх напрямах перевірок.</p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук штрафу..."
            resultCount={filtered.length}
            resultLabel="штрафів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setCategoryFilter("all"); setSeverityFilter("all"); setAudienceFilter("all"); }}
          >
            <div className="space-y-3">
              {filtered.map((penalty) => (
                <Link key={penalty.id} to={`/dovidnyky/penalties/${penalty.slug}`}>
                  <Card className="p-4 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={SEVERITY_VARIANT[penalty.severity]}>{SEVERITY_LABEL[penalty.severity]}</Badge>
                          <Badge variant="outline" className="text-[10px]">{penalty.category}</Badge>
                        </div>
                        <p className="font-semibold text-foreground text-sm leading-snug">{penalty.title}</p>
                        <p className="text-sm font-mono text-destructive font-medium">{penalty.penaltyAmount}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{penalty.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </Card>
                </Link>
              ))}

              {filtered.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">Нічого не знайдено</p>
                </div>
              )}
            </div>

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3 mt-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">FINTODO мінімізує ризик штрафів</h2>
              </div>
              <p className="text-sm text-muted-foreground">Автоматичні нагадування про дедлайни, розрахунок ЄСВ та контроль звітності — все в одному місці.</p>
              <Link to={CTA_CHECKOUT_URL}>
                <Button className="mt-1">Почати безкоштовно <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </section>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="penalties" />
    </PortalLayout>
  );
};

export default PenaltiesPage;
