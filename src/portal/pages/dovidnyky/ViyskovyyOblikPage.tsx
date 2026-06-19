import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { DirectorySidebarLayout, FilterSection, FilterRadioGroup } from "@/portal/components/DirectorySidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import {
  VIYSKOVYY_OBLIK,
  VIYSKOVYY_TOPIC_LABEL,
  VIYSKOVYY_TOPICS,
  type ViyskovyyTopic,
} from "@/portal/data/viyskovyyOblik";

const ViyskovyyOblikPage = () => {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<ViyskovyyTopic | "all">("all");

  const topicCounts = useMemo(() => {
    const c: Record<string, number> = { all: VIYSKOVYY_OBLIK.length };
    VIYSKOVYY_OBLIK.forEach((e) => (c[e.topic] = (c[e.topic] || 0) + 1));
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return VIYSKOVYY_OBLIK.filter((e) => {
      if (topicFilter !== "all" && e.topic !== topicFilter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, topicFilter]);

  const sidebar = (
    <FilterSection title="Тема">
      <FilterRadioGroup
        options={[
          { value: "all", label: "Всі теми", count: topicCounts.all },
          ...VIYSKOVYY_TOPICS.filter((t) => (topicCounts[t] || 0) > 0).map((t) => ({
            value: t,
            label: VIYSKOVYY_TOPIC_LABEL[t],
            count: topicCounts[t] || 0,
          })),
        ]}
        value={topicFilter}
        onChange={(v) => setTopicFilter(v as ViyskovyyTopic | "all")}
      />
    </FilterSection>
  );

  return (
    <PortalLayout
      meta={{
        title: "Військовий облік і бронювання працівників 2026 | FINTODO",
        description: `Військовий облік на підприємстві, бронювання, критично важливі підприємства, ВОС, штрафи ТЦК, Резерв+. ${VIYSKOVYY_OBLIK.length} практичних інструкцій для роботодавців.`,
        canonical: `${SITE_URL}/dovidnyky/viyskovyy-oblik`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Військовий облік", url: `${SITE_URL}/dovidnyky/viyskovyy-oblik` },
        ])}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Військовий облік" },
          ]}
        />
        <div className="space-y-4 pb-16">
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Військовий облік і бронювання
            </h1>
            <p className="text-muted-foreground">
              Усі обовʼязки роботодавця за постановою КМУ № 1487, бронювання за пост. № 76, штрафи ТЦК, Резерв+, ВОС і мобілізація працівника. Дані станом на квітень 2026.
            </p>
          </header>

          <Card className="p-3 border-l-4 border-l-destructive bg-destructive/5 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <strong>Воєнний стан.</strong> Штрафи за неналежний військовий облік — до <strong>25 500 грн</strong> на посадову особу і <strong>34 000 грн</strong> на підприємство. Перевірте, що ваш облік готовий до перевірки ТЦК.
            </p>
          </Card>

          <DirectorySidebarLayout
            sidebar={sidebar}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Пошук за темою, тегом..."
            resultCount={filtered.length}
            resultLabel="матеріалів"
            activeFilterCount={topicFilter !== "all" ? 1 : 0}
            onResetFilters={() => setTopicFilter("all")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((e) => (
                <Link key={e.id} to={`/dovidnyky/viyskovyy-oblik/${e.slug}`}>
                  <Card className="p-4 h-full hover:border-primary/40 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {e.title}
                      </h3>
                      <Badge variant="outline" size="sm" className="text-[10px] shrink-0">
                        {VIYSKOVYY_TOPIC_LABEL[e.topic]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{e.summary}</p>
                  </Card>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-6">Нічого не знайдено</p>
            )}
          </DirectorySidebarLayout>
        </div>
      </div>
          <RelatedPartnersBlock directoryId="viyskovyy-oblik" />
    </PortalLayout>
  );
};

export default ViyskovyyOblikPage;
