import { useState, useMemo } from "react";
import { useAudience } from "@/contexts/AudienceContext";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { ARTICLES } from "@/portal/data/articles";
import { ArticleRow } from "@/portal/components/ArticleRow";
import { StickyFilterBar } from "@/portal/components/StickyFilterBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";

const PILLS = [
  { value: "all", label: "Всі" },
  { value: "analysis", label: "Аналіз" },
  { value: "comparison", label: "Порівняння" },
];

export default function PublicationsReviewsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { audience } = useAudience();
  const mappedAudience = audience === "individual" ? "personal" : "business";

  const articles = useMemo(() => {
    let result = ARTICLES.filter((a) => a.contentType === "analysis" || a.contentType === "comparison");
    result = result.filter(a => a.audience === mappedAudience || a.audience === "both");
    if (filter !== "all") result = result.filter((a) => a.contentType === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    return result;
  }, [filter, search, mappedAudience]);

  return (
    <PortalLayout
      meta={{
        title: "Огляди та аналітика | FINTODO",
        description: "Аналітичні огляди фінансових продуктів, порівняння сервісів та експертні матеріали.",
        canonical: `${SITE_URL}/publications/reviews`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Публікації", url: `${SITE_URL}/publications` }, { name: "Огляди", url: `${SITE_URL}/publications/reviews` }])} />
      <div className="max-w-5xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Огляди" }]} />
        <h1 className="text-3xl font-extrabold text-foreground mb-6">Огляди та аналітика</h1>
        <StickyFilterBar
          pills={PILLS}
          activeValue={filter}
          onPillChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Пошук оглядів..."
          resultCount={articles.length}
        />
        <div className="mt-4 divide-y divide-border/30">
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Немає оглядів</p>
          ) : (
            articles.map((a) => <ArticleRow key={a.id} article={a} />)
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
