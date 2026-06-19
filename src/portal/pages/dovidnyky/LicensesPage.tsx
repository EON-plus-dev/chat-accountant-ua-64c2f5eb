import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { LICENSES, LICENSE_CATEGORIES } from "@/portal/data/licenses";
import { ArrowRight, Sparkles, ScrollText } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const AUDIENCE_LABELS: Record<string, string> = {
  business: "Для бізнесу",
  personal: "Для фізосіб",
  both: "Для всіх",
};

const LicensesPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorityFilter, setAuthorityFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: LICENSES.length };
    LICENSES.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1; });
    return counts;
  }, []);

  const authorities = useMemo(() => {
    const set = new Set(LICENSES.map((l) => l.issuingAuthority));
    return Array.from(set).sort();
  }, []);

  const authorityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    LICENSES.forEach((l) => { counts[l.issuingAuthority] = (counts[l.issuingAuthority] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return LICENSES.filter((l) => {
      const matchesCat = categoryFilter === "all" || l.category === categoryFilter;
      const matchesAuth = authorityFilter === "all" || l.issuingAuthority === authorityFilter;
      const matchesAud = audienceFilter === "all" || l.audience === audienceFilter || l.audience === "both";
      const matchesSearch = !q || l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.issuingAuthority.toLowerCase().includes(q);
      return matchesCat && matchesAuth && matchesAud && matchesSearch;
    });
  }, [search, categoryFilter, authorityFilter, audienceFilter]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (authorityFilter !== "all" ? 1 : 0) +
    (audienceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Категорія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: categoryCounts.all },
            ...LICENSE_CATEGORIES.map((c) => ({ value: c, label: c, count: categoryCounts[c] || 0 })),
          ]}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </FilterSection>
      <FilterSection title="Орган видачі">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі" },
            ...authorities.map((a) => ({ value: a, label: a, count: authorityCounts[a] || 0 })),
          ]}
          value={authorityFilter}
          onChange={setAuthorityFilter}
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
        title: "Ліцензії та дозволи для бізнесу в Україні | FINTODO",
        description: "Які види бізнесу потребують ліцензії. Вартість, терміни, документи та орган видачі.",
        canonical: `${SITE_URL}/dovidnyky/litsenziyi`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Ліцензії та дозволи", url: `${SITE_URL}/dovidnyky/litsenziyi` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Ліцензії та дозволи" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground">Ліцензії та дозволи</h1>
            <p className="text-muted-foreground max-w-2xl">Які види діяльності потребують ліцензування, скільки коштує та як отримати.</p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук ліцензії..."
            resultCount={filtered.length}
            resultLabel="ліцензій"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setCategoryFilter("all"); setAuthorityFilter("all"); setAudienceFilter("all"); }}
          >
            <div className="space-y-3">
              {filtered.map((license) => (
                <Link key={license.id} to={`/dovidnyky/litsenziyi/${license.slug}`}>
                  <Card className="p-4 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <ScrollText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{license.category}</Badge>
                          <Badge variant="secondary" className="text-[10px]">{license.issuingAuthority}</Badge>
                        </div>
                        <p className="font-semibold text-foreground text-sm leading-snug">{license.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono font-medium text-foreground">{license.cost}</span>
                          <span>·</span>
                          <span>{license.processingTime}</span>
                          <span>·</span>
                          <span>{license.validity}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{license.description}</p>
                        {license.kvedCodes.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {license.kvedCodes.slice(0, 3).map((code) => (
                              <Badge key={code} variant="outline" className="text-[9px] font-mono">{code}</Badge>
                            ))}
                            {license.kvedCodes.length > 3 && (
                              <Badge variant="outline" className="text-[9px]">+{license.kvedCodes.length - 3}</Badge>
                            )}
                          </div>
                        )}
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

            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-3 mt-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">FINTODO нагадає про продовження ліцензій</h2>
              </div>
              <p className="text-sm text-muted-foreground">Автоматичні нагадування про терміни, контроль документів та звітність — все в одному місці.</p>
              <Link to={CTA_CHECKOUT_URL}>
                <Button className="mt-1">Почати безкоштовно <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </section>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="litsenziyi" />
    </PortalLayout>
  );
};

export default LicensesPage;
