import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { REGISTERS } from "@/portal/data/registers";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AUDIENCE_MAP: Record<string, string> = {
  business: "Для бізнесу",
  personal: "Для фізосіб",
  both: "Для всіх",
};

const RegistersPage = () => {
  const [search, setSearch] = useState("");
  const [freeFilter, setFreeFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [operatorFilter, setOperatorFilter] = useState("all");

  const audienceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: REGISTERS.length };
    REGISTERS.forEach((r) => { counts[r.audience] = (counts[r.audience] || 0) + 1; });
    return counts;
  }, []);

  const operatorOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    REGISTERS.forEach((r) => { counts[r.operator] = (counts[r.operator] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return [
      { value: "all", label: "Всі", count: REGISTERS.length },
      ...sorted.map(([op, count]) => ({ value: op, label: op, count })),
    ];
  }, []);

  const filtered = useMemo(() => {
    return REGISTERS.filter((r) => {
      if (freeFilter === "free" && !r.isFree) return false;
      if (freeFilter === "paid" && r.isFree) return false;
      if (audienceFilter !== "all" && r.audience !== audienceFilter) return false;
      if (operatorFilter !== "all" && r.operator !== operatorFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.shortName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [search, freeFilter, audienceFilter, operatorFilter]);

  const activeFilterCount = (freeFilter !== "all" ? 1 : 0) + (audienceFilter !== "all" ? 1 : 0) + (operatorFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Доступність">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: REGISTERS.length },
            { value: "free", label: "Безкоштовні", count: REGISTERS.filter(r => r.isFree).length },
            { value: "paid", label: "Платні", count: REGISTERS.filter(r => !r.isFree).length },
          ]}
          value={freeFilter}
          onChange={setFreeFilter}
        />
      </FilterSection>
      <FilterSection title="Аудиторія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: audienceCounts.all },
            { value: "business", label: "🏢 Бізнес", count: audienceCounts.business || 0 },
            { value: "personal", label: "👤 Фізособи", count: audienceCounts.personal || 0 },
            { value: "both", label: "Для всіх", count: audienceCounts.both || 0 },
          ]}
          value={audienceFilter}
          onChange={setAudienceFilter}
        />
      </FilterSection>
      <FilterSection title="Оператор">
        <FilterRadioGroup options={operatorOptions} value={operatorFilter} onChange={setOperatorFilter} />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: "Реєстри та перевірки — державні реєстри України | FINTODO",
        description: "Каталог державних реєстрів: ЄДРПОУ, ПДВ, ДРРП, санкції, боржники. Що перевірити та як користуватися.",
        canonical: `${SITE_URL}/dovidnyky/reestry`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Реєстри та перевірки", url: `${SITE_URL}/dovidnyky/reestry` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Реєстри та перевірки" },
        ]} />

        <div className="space-y-6 pb-16">
          <div>
            <h1 className="text-2xl font-bold">🔍 Реєстри та перевірки</h1>
            <p className="text-muted-foreground mt-1">Державні реєстри — що перевірити, де знайти, як користуватися</p>
          </div>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук реєстру..."
            resultCount={filtered.length}
            resultLabel="реєстрів"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setFreeFilter("all"); setAudienceFilter("all"); setOperatorFilter("all"); }}
          >
            <div className="space-y-3">
              {filtered.map((register) => (
                <Link key={register.id} to={`/dovidnyky/reestry/${register.slug}`}>
                  <Card className="p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-sm">{register.shortName}</h3>
                          {register.isFree ? (
                            <Badge variant="secondary" className="text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Безкоштовно
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              <XCircle className="w-3 h-3 mr-0.5" /> Платний
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{register.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Оператор: {register.operator}</p>
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {register.tags.map((tag) => (
                            <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary shrink-0">
                        Детальніше <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="reestry" />
    </PortalLayout>
  );
};

export default RegistersPage;
