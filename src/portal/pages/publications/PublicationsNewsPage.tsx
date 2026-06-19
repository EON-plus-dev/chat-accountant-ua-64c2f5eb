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
  { value: "news", label: "Новини" },
  { value: "change", label: "Зміни" },
];

export default function PublicationsNewsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { audience } = useAudience();
  const mappedAudience = audience === "individual" ? "personal" : "business";

  const articles = useMemo(() => {
    let result = ARTICLES.filter((a) => a.contentType === "news" || a.contentType === "change");
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
      showTicker
      meta={{
        title: "Новини — зміни в оподаткуванні | FINTODO",
        description: "Актуальні новини про зміни в оподаткуванні, законодавстві та бухгалтерському обліку для підприємців.",
        canonical: `${SITE_URL}/publications/news`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Публікації", url: `${SITE_URL}/publications` }, { name: "Новини", url: `${SITE_URL}/publications/news` }])} />
      <div className="max-w-5xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Новини" }]} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">Новини</h1>
        <StickyFilterBar
          pills={PILLS}
          activeValue={filter}
          onPillChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Пошук новин..."
          resultCount={articles.length}
        />
        <div className="mt-4 divide-y divide-border/30">
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Немає новин</p>
          ) : (
            articles.map((a) => <ArticleRow key={a.id} article={a} />)
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
