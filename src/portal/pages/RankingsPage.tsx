import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { StickyFilterBar } from "@/portal/components/StickyFilterBar";
import { TopThreePreview } from "@/portal/components/TopThreePreview";
import { MethodologyExplainer } from "@/portal/components/MethodologyExplainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { RANKING_CATEGORIES, RANKINGS } from "@/portal/data/rankings";

const RankingsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search) return RANKING_CATEGORIES;
    const q = search.toLowerCase();
    return RANKING_CATEGORIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [search]);

  const top3 = RANKINGS.filter((r) => r.category === "tax-services")
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);
  const sampleReview = top3.find((i) => i.review)?.review;

  return (
    <PortalLayout
      meta={{
        title: `Рейтинги фінансових сервісів — ${RANKING_CATEGORIES.length} категорій | FINTODO`,
        description: `Незалежні рейтинги ${RANKING_CATEGORIES.length} категорій сервісів для бізнесу: бухгалтерія, банки, страхування. Методологія: функціонал, ціна, підтримка, UX.`,
        canonical: `${SITE_URL}/publications/ratings`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Публікації", url: `${SITE_URL}/publications` },
        { name: "Дослідження і рейтинги", url: `${SITE_URL}/publications/ratings` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Дослідження і рейтинги" }]} />

        <header className="py-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-4xl tracking-tight">Рейтинги фінансових сервісів</h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Незалежні огляди та порівняння сервісів для бізнесу. Оцінки формуються редакцією fintodo за єдиною методологією. Якщо в рейтингу присутній наш продукт — це позначено бейджем «Наш продукт».
          </p>
        </header>

        <StickyFilterBar
          pills={[{ value: "all", label: "Всі", count: RANKING_CATEGORIES.length }]}
          activeValue="all"
          onPillChange={() => {}}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Пошук категорії..."
          resultCount={filteredCategories.length}
          resultLabel="категорій"
        />

        <MethodologyExplainer sampleReview={sampleReview} />

        {/* Category rows */}
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden mt-8 mb-10">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/publications/ratings/${cat.slug}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
              <span className="text-xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                <span className="font-mono">{cat.count}</span>
                <span className="font-mono text-[10px] hidden sm:inline">{cat.lastUpdated}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Top 3 preview — рівний список без виділеного featured */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Топ сервісів для бухгалтерії</h2>
          <TopThreePreview items={top3} categorySlug="tax-services" />
        </section>
      </div>
    </PortalLayout>
  );
};

export default RankingsPage;
