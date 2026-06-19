import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { GRANTS, GRANT_STATUS_MAP, GRANT_TYPE_MAP, GRANT_ORG_TYPE_MAP } from "@/portal/data/grants";
import type { GrantEntry } from "@/portal/data/grants";

const STATUS_VARIANT: Record<GrantEntry["status"], "success" | "warning" | "secondary" | "default"> = {
  active: "success",
  upcoming: "warning",
  closed: "secondary",
  announced: "default",
};

const GrantsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [orgTypeFilter, setOrgTypeFilter] = useState("all");

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GRANTS.length };
    GRANTS.forEach((g) => { counts[g.status] = (counts[g.status] || 0) + 1; });
    return counts;
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GRANTS.length };
    GRANTS.forEach((g) => { counts[g.type] = (counts[g.type] || 0) + 1; });
    return counts;
  }, []);

  const audienceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GRANTS.length };
    GRANTS.forEach((g) => { counts[g.audience] = (counts[g.audience] || 0) + 1; });
    return counts;
  }, []);

  const orgTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GRANTS.length };
    GRANTS.forEach((g) => { counts[g.orgType] = (counts[g.orgType] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GRANTS.filter((g) => {
      const matchesStatus = statusFilter === "all" || g.status === statusFilter;
      const matchesType = typeFilter === "all" || g.type === typeFilter;
      const matchesAudience = audienceFilter === "all" || g.audience === audienceFilter || g.audience === "both";
      const matchesOrgType = orgTypeFilter === "all" || g.orgType === orgTypeFilter;
      const matchesSearch = !q || g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
      return matchesStatus && matchesType && matchesAudience && matchesOrgType && matchesSearch;
    });
  }, [search, statusFilter, typeFilter, audienceFilter, orgTypeFilter]);

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0) + (audienceFilter !== "all" ? 1 : 0) + (orgTypeFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Статус">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: statusCounts.all },
            { value: "active", label: "🟢 Активні", count: statusCounts.active || 0 },
            { value: "upcoming", label: "🟡 Скоро", count: statusCounts.upcoming || 0 },
            { value: "closed", label: "⚫ Завершені", count: statusCounts.closed || 0 },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </FilterSection>
      <FilterSection title="Тип">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: typeCounts.all },
            { value: "grant", label: "Грант", count: typeCounts.grant || 0 },
            { value: "loan", label: "Кредит", count: typeCounts.loan || 0 },
            { value: "guarantee", label: "Гарантія", count: typeCounts.guarantee || 0 },
            { value: "technical_assistance", label: "Тех. допомога", count: typeCounts.technical_assistance || 0 },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </FilterSection>
      <FilterSection title="Аудиторія">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: audienceCounts.all },
            { value: "business", label: "🏢 Бізнес", count: audienceCounts.business || 0 },
            { value: "personal", label: "👤 Фізособи", count: audienceCounts.personal || 0 },
          ]}
          value={audienceFilter}
          onChange={setAudienceFilter}
        />
      </FilterSection>
      <FilterSection title="Організатор">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: orgTypeCounts.all },
            { value: "government", label: "🏛️ Державний", count: orgTypeCounts.government || 0 },
            { value: "international", label: "🌍 Міжнародний", count: orgTypeCounts.international || 0 },
            { value: "eu", label: "🇪🇺 ЄС", count: orgTypeCounts.eu || 0 },
            { value: "ngo", label: "🤝 НГО", count: orgTypeCounts.ngo || 0 },
          ]}
          value={orgTypeFilter}
          onChange={setOrgTypeFilter}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Гранти та програми підтримки — ${GRANTS.length} програм | FINTODO`,
        description: `${statusCounts.active || 0} активних грантових програм, пільгові кредити та гарантії для підприємців від уряду, ЄС та міжнародних організацій.`,
        canonical: `${SITE_URL}/dovidnyky/granty`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        { name: "Гранти", url: `${SITE_URL}/dovidnyky/granty` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Гранти" },
        ]} />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-foreground">Гранти та програми підтримки</h1>
            <p className="text-muted-foreground">Фінансова допомога для бізнесу — гранти, пільгові кредити та гарантії</p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук програми..."
            resultCount={filtered.length}
            resultLabel="програм"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => { setStatusFilter("all"); setTypeFilter("all"); setAudienceFilter("all"); setOrgTypeFilter("all"); }}
          >
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {filtered.map((grant) => (
                <Link
                  key={grant.id}
                  to={`/dovidnyky/granty/${grant.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <Badge variant={STATUS_VARIANT[grant.status]} size="sm" className="shrink-0 text-[10px]">
                    {GRANT_STATUS_MAP[grant.status]}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{grant.name}</span>
                      <Badge variant="outline" size="sm" className="text-[10px]">{GRANT_TYPE_MAP[grant.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {grant.organization} · {grant.description}
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end shrink-0 gap-0.5">
                    <span className="text-sm font-mono font-bold text-primary">{grant.amount}</span>
                    <span className="text-[10px] text-muted-foreground">до {grant.deadline}</span>
                  </div>
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
          <RelatedPartnersBlock directoryId="granty" />
    </PortalLayout>
  );
};

export default GrantsPage;
