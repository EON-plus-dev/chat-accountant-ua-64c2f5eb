import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/portal/data/templates";
import { FileText, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const AUDIENCE_LABELS: Record<string, string> = {
  business: "Для бізнесу",
  personal: "Для фізосіб",
  both: "Для всіх",
};

const TemplatesPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TEMPLATES.length };
    TEMPLATES.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (audienceFilter !== "all" && t.audience !== audienceFilter && t.audience !== "both") return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
      }
      return true;
    });
  }, [search, categoryFilter, audienceFilter]);

  const activeFilterCount = (categoryFilter !== "all" ? 1 : 0) + (audienceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: categoryCounts.all },
            ...TEMPLATE_CATEGORIES.map((c) => ({
              value: c.id,
              label: `${c.emoji} ${c.label}`,
              count: categoryCounts[c.id] || 0,
            })),
          ]}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </FilterSection>
      <FilterSection title="Аудиторія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі" },
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
        title: "Шаблони документів — договори, акти, рахунки | FINTODO",
        description: "Готові шаблони бізнес-документів: договори підряду, акти виконаних робіт, рахунки-фактури, накази, заяви, довіреності.",
        canonical: `${SITE_URL}/dovidnyky/templates`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Шаблони документів", url: `${SITE_URL}/dovidnyky/templates` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Шаблони документів" },
        ]} />

        <div className="space-y-6 pb-16">
          <div>
            <h1 className="text-2xl font-bold">📋 Шаблони документів</h1>
            <p className="text-muted-foreground mt-1">Готові шаблони для бізнесу — завантажуйте та адаптуйте</p>
          </div>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук шаблону..."
            resultCount={filtered.length}
            resultLabel="шаблонів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setCategoryFilter("all"); setAudienceFilter("all"); }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((template) => (
                <Link key={template.id} to={`/dovidnyky/templates/${template.slug}`} className="block">
                  <Card className="p-4 hover:border-primary/40 transition-colors h-full">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{template.format}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{AUDIENCE_LABELS[template.audience]}</Badge>
                          {template.isPopular && <Badge className="text-[10px] bg-accent text-accent-foreground">Популярний</Badge>}
                        </div>
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 mt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Потрібен кастомний шаблон?</h3>
                  <p className="text-xs text-muted-foreground mt-1">FINTODO PRO включає генератор документів з автозаповненням реквізитів.</p>
                  <Button size="sm" className="mt-3 h-8 text-xs" asChild>
                    <a href={CTA_CHECKOUT_URL}>Спробувати PRO <ArrowRight className="w-3 h-3 ml-1" /></a>
                  </Button>
                </div>
              </div>
            </Card>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="templates" />
    </PortalLayout>
  );
};

export default TemplatesPage;
