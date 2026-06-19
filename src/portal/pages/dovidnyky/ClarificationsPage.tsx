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
  CLARIFICATIONS,
  CLARIFICATION_KIND_LABEL,
  CLARIFICATION_TOPIC_LABEL,
  CLARIFICATION_STATUS_LABEL,
  type ClarificationKind,
  type ClarificationTopic,
  type ClarificationStatus,
} from "@/portal/data/taxClarifications";

const STATUS_VARIANT: Record<ClarificationStatus, "default" | "destructive" | "warning" | "secondary"> = {
  active: "default",
  cancelled: "destructive",
  outdated: "warning",
  superseded: "secondary",
};

const ClarificationsPage = () => {
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<ClarificationKind | "all">("all");
  const [topicFilter, setTopicFilter] = useState<ClarificationTopic | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ClarificationStatus | "all">("all");

  const kindCounts = useMemo(() => {
    const c: Record<string, number> = { all: CLARIFICATIONS.length };
    CLARIFICATIONS.forEach((x) => (c[x.kind] = (c[x.kind] || 0) + 1));
    return c;
  }, []);
  const topicCounts = useMemo(() => {
    const c: Record<string, number> = { all: CLARIFICATIONS.length };
    CLARIFICATIONS.forEach((x) => (c[x.topic] = (c[x.topic] || 0) + 1));
    return c;
  }, []);
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: CLARIFICATIONS.length };
    CLARIFICATIONS.forEach((x) => (c[x.status] = (c[x.status] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return CLARIFICATIONS.filter((c) => {
      if (kindFilter !== "all" && c.kind !== kindFilter) return false;
      if (topicFilter !== "all" && c.topic !== topicFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.docNumber.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }).sort((a, b) => b.docDate.localeCompare(a.docDate));
  }, [search, kindFilter, topicFilter, statusFilter]);

  const activeFilterCount =
    (kindFilter !== "all" ? 1 : 0) + (topicFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  const sidebar = (
    <>
      <FilterSection title="Тип документа">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: kindCounts.all },
            ...(Object.entries(CLARIFICATION_KIND_LABEL) as [ClarificationKind, string][]).map(([v, l]) => ({
              value: v,
              label: l,
              count: kindCounts[v] || 0,
            })),
          ]}
          value={kindFilter}
          onChange={(v) => setKindFilter(v as ClarificationKind | "all")}
        />
      </FilterSection>
      <FilterSection title="Тема">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: topicCounts.all },
            ...(Object.entries(CLARIFICATION_TOPIC_LABEL) as [ClarificationTopic, string][]).map(([v, l]) => ({
              value: v,
              label: l,
              count: topicCounts[v] || 0,
            })),
          ]}
          value={topicFilter}
          onChange={(v) => setTopicFilter(v as ClarificationTopic | "all")}
        />
      </FilterSection>
      <FilterSection title="Статус">
        <FilterRadioGroup
          options={[
            { value: "all", label: "Всі", count: statusCounts.all },
            ...(Object.entries(CLARIFICATION_STATUS_LABEL) as [ClarificationStatus, string][]).map(([v, l]) => ({
              value: v,
              label: l,
              count: statusCounts[v] || 0,
            })),
          ]}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as ClarificationStatus | "all")}
        />
      </FilterSection>
    </>
  );

  return (
    <PortalLayout
      meta={{
        title: `Податкові розʼяснення — ${CLARIFICATIONS.length} офіційних позицій ДПС | FINTODO`,
        description: `База ІПК, ЗІР, листів ДПС та Мінфіну. ${CLARIFICATIONS.length} офіційних розʼяснень з посиланнями на першоджерела.`,
        canonical: `${SITE_URL}/dovidnyky/rozyasnennia`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Розʼяснення ДПС", url: `${SITE_URL}/dovidnyky/rozyasnennia` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Розʼяснення ДПС" },
          ]}
        />

        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Розʼяснення ДПС та Мінфіну</h1>
            <p className="text-muted-foreground">
              ІПК, ЗІР, узагальнюючі консультації та офіційні листи. Позиція контролюючих органів — з посиланнями на
              першоджерела і практичними наслідками для бізнесу.
            </p>
          </header>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за темою, номером ІПК..."
            resultCount={filtered.length}
            resultLabel="розʼяснень"
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              setKindFilter("all");
              setTopicFilter("all");
              setStatusFilter("all");
            }}
          >
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to={`/dovidnyky/rozyasnennia/${c.slug}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                    {CLARIFICATION_KIND_LABEL[c.kind]}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {c.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.summary}</p>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {c.docNumber} · {c.docDate} · {CLARIFICATION_TOPIC_LABEL[c.topic]}
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[c.status]} size="sm" className="text-[10px] shrink-0">
                    {CLARIFICATION_STATUS_LABEL[c.status]}
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
          <RelatedPartnersBlock directoryId="rozyasnennia" />
    </PortalLayout>
  );
};

export default ClarificationsPage;
