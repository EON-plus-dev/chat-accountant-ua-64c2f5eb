import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Phone, Globe, MessageCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  AGENCIES,
  AGENCY_CATEGORY_LABEL,
  type AgencyCategory,
} from "@/portal/data/agencies";

const AgenciesPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AgencyCategory | "all">("all");
  const [audienceFilter, setAudienceFilter] = useState<"all" | "business" | "personal">("all");

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = { all: AGENCIES.length };
    AGENCIES.forEach((a) => (c[a.category] = (c[a.category] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return AGENCIES.filter((a) => {
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (audienceFilter !== "all" && a.audience !== audienceFilter && a.audience !== "both") return false;
      if (!q) return true;
      return (
        a.shortName.toLowerCase().includes(q) ||
        a.fullName.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, categoryFilter, audienceFilter]);

  const activeFilterCount = (categoryFilter !== "all" ? 1 : 0) + (audienceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: categoryCounts.all },
            ...(Object.entries(AGENCY_CATEGORY_LABEL) as [AgencyCategory, string][]).map(([v, l]) => ({
              value: v,
              label: l,
              count: categoryCounts[v] || 0,
            })),
          ]}
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v as AgencyCategory | "all")}
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
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Держоргани України — ${AGENCIES.length} відомств: контакти, послуги, гарячі лінії | FINTODO`,
        description: `Довідник державних органів: ДПС, Мінфін, ПФУ, Держпраці, Дія, Мінʼюст, НБУ. Контакти, послуги, електронні кабінети, чат-боти.`,
        canonical: `${SITE_URL}/dovidnyky/derzhorgany`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Держоргани", url: `${SITE_URL}/dovidnyky/derzhorgany` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Держоргани" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Держоргани України</h1>
            <p className="text-muted-foreground">
              Контакти, гарячі лінії, чат-боти, електронні кабінети та перелік послуг. Все, з чим стикається бізнес
              і фізособа у спілкуванні з державою.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за назвою або послугою..."
            resultCount={filtered.length}
            resultLabel="органів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              setCategoryFilter("all");
              setAudienceFilter("all");
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((a) => {
                const hotline = a.contacts.find((c) => c.type === "hotline");
                const chatbot = a.contacts.find((c) => c.type === "chatbot");
                return (
                  <Link key={a.id} to={`/dovidnyky/derzhorgany/${a.slug}`}>
                    <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {a.shortName}
                        </h3>
                        <Badge variant="outline" size="sm" className="text-[10px] shrink-0">
                          {AGENCY_CATEGORY_LABEL[a.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{a.fullName}</p>
                      <p className="text-sm text-foreground line-clamp-3 mb-3">{a.summary}</p>
                      <div className="space-y-1 text-xs text-muted-foreground border-t border-border pt-2">
                        {hotline && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span className="font-mono">{hotline.value}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{a.website.replace(/^https?:\/\//, "")}</span>
                        </div>
                        {chatbot && (
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="h-3 w-3 shrink-0" />
                            <span className="truncate">{chatbot.value}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="derzhorgany" />
    </PortalLayout>
  );
};

export default AgenciesPage;
