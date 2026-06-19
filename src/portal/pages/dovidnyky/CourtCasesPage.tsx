import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  COURT_CASES,
  COURT_INSTANCE_LABEL,
  COURT_TOPIC_LABEL,
  COURT_OUTCOME_LABEL,
  type CourtTopic,
  type CourtOutcome,
  type CourtInstance,
} from "@/portal/data/courtCases";

const OUTCOME_VARIANT: Record<CourtOutcome, "default" | "destructive" | "warning" | "secondary"> = {
  plaintiff: "default",
  defendant: "destructive",
  partial: "warning",
  remanded: "secondary",
};

const CourtCasesPage = () => {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<CourtTopic | "all">("all");
  const [outcomeFilter, setOutcomeFilter] = useState<CourtOutcome | "all">("all");
  const [instanceFilter, setInstanceFilter] = useState<CourtInstance | "all">("all");

  const topicCounts = useMemo(() => {
    const c: Record<string, number> = { all: COURT_CASES.length };
    COURT_CASES.forEach((cs) => (c[cs.topic] = (c[cs.topic] || 0) + 1));
    return c;
  }, []);
  const outcomeCounts = useMemo(() => {
    const c: Record<string, number> = { all: COURT_CASES.length };
    COURT_CASES.forEach((cs) => (c[cs.outcome] = (c[cs.outcome] || 0) + 1));
    return c;
  }, []);
  const instanceCounts = useMemo(() => {
    const c: Record<string, number> = { all: COURT_CASES.length };
    COURT_CASES.forEach((cs) => (c[cs.instance] = (c[cs.instance] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return COURT_CASES
      .filter((c) => {
        if (topicFilter !== "all" && c.topic !== topicFilter) return false;
        if (outcomeFilter !== "all" && c.outcome !== outcomeFilter) return false;
        if (instanceFilter !== "all" && c.instance !== instanceFilter) return false;
        if (!q) return true;
        return (
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.decisionDate.localeCompare(a.decisionDate));
  }, [search, topicFilter, outcomeFilter, instanceFilter]);

  const activeFilterCount =
    (topicFilter !== "all" ? 1 : 0) + (outcomeFilter !== "all" ? 1 : 0) + (instanceFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Тема">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: topicCounts.all },
            ...(Object.entries(COURT_TOPIC_LABEL) as [CourtTopic, string][]).map(([v, l]) => ({
              value: v,
              label: l,
              count: topicCounts[v] || 0,
            })),
          ]}
          value={topicFilter}
          onChange={(v) => setTopicFilter(v as CourtTopic | "all")}
        />
      </FilterSection>
      <FilterSection title="Результат">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: outcomeCounts.all },
            ...(Object.entries(COURT_OUTCOME_LABEL) as [CourtOutcome, string][]).map(([v, l]) => ({
              value: v,
              label: l,
              count: outcomeCounts[v] || 0,
            })),
          ]}
          value={outcomeFilter}
          onChange={(v) => setOutcomeFilter(v as CourtOutcome | "all")}
        />
      </FilterSection>
      <FilterSection title="Інстанція">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: instanceCounts.all },
            ...(Object.entries(COURT_INSTANCE_LABEL) as [CourtInstance, string][]).map(([v, l]) => ({
              value: v,
              label: l,
              count: instanceCounts[v] || 0,
            })),
          ]}
          value={instanceFilter}
          onChange={(v) => setInstanceFilter(v as CourtInstance | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Судова практика — ${COURT_CASES.length} ключових рішень ВС | FINTODO`,
        description: `Огляд резонансних рішень судів по податкових, трудових і господарських спорах. ${COURT_CASES.length} справ з посиланнями на ЄДРСР.`,
        canonical: `${SITE_URL}/dovidnyky/sudy`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Судова практика", url: `${SITE_URL}/dovidnyky/sudy` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Судова практика" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Судова практика</h1>
            <p className="text-muted-foreground">
              Ключові рішення Верховного Суду та апеляційних інстанцій по податкових і господарських спорах.
              Висновки, які реально впливають на бізнес.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за темою, номером справи..."
            resultCount={filtered.length}
            resultLabel="рішень"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              setTopicFilter("all");
              setOutcomeFilter("all");
              setInstanceFilter("all");
            }}
          >
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to={`/dovidnyky/sudy/${c.slug}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                    {COURT_TOPIC_LABEL[c.topic]}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {c.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.summary}</p>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {c.caseNumber} · {c.decisionDate} · {COURT_INSTANCE_LABEL[c.instance]}
                    </div>
                  </div>
                  <Badge variant={OUTCOME_VARIANT[c.outcome]} size="sm" className="text-[10px] shrink-0">
                    {COURT_OUTCOME_LABEL[c.outcome]}
                  </Badge>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="sudy" />
    </PortalLayout>
  );
};

export default CourtCasesPage;
