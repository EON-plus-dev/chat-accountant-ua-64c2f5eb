import { useParams } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { RankingCard } from "@/portal/components/RankingCard";
import { MethodologyExplainer } from "@/portal/components/MethodologyExplainer";
import { RANKING_CATEGORIES, RANKINGS } from "@/portal/data/rankings";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";

const RankingCategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = RANKING_CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) return (
    <PortalLayout meta={{ title: "Категорію не знайдено", description: "", canonical: "" }}>
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 text-center">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-2xl font-semibold mb-2">Категорію не знайдено</h1>
        <p className="text-muted-foreground mb-6">Можливо, вона була переміщена або видалена</p>
        <a href="/publications/ratings" className="text-primary font-medium hover:underline">← До рейтингів</a>
      </div>
    </PortalLayout>
  );

  const items = RANKINGS.filter((r) => r.category === category.id).sort(
    (a, b) => a.rank - b.rank
  );

  // Беремо `review` будь-якого сервісу категорії (методологія однакова для всіх)
  const sampleReview = items.find((i) => i.review)?.review;

  return (
    <PortalLayout
      meta={{
        title: `${category.name} — Рейтинг 2026`,
        description: category.description,
        canonical: `${SITE_URL}/publications/ratings/${category.slug}`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Публікації", url: `${SITE_URL}/publications` },
          { name: "Дослідження і рейтинги", url: `${SITE_URL}/publications/ratings` },
          { name: category.name, url: `${SITE_URL}/publications/ratings/${category.slug}` },
        ])}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav
          items={[
            { label: "Головна", to: "/" },
            { label: "Публікації", to: "/publications" },
            { label: "Дослідження і рейтинги", to: "/publications/ratings" },
            { label: category.name },
          ]}
        />

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-2">
          {category.name} — Рейтинг 2026
        </h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
          {category.description}
        </p>
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          Оновлено: {category.lastUpdated}
        </p>

        <MethodologyExplainer sampleReview={sampleReview} />

        <div className="space-y-4 mt-10">
          {items.map((item) => (
            <RankingCard key={item.id} item={item} categorySlug={category.slug} />
          ))}
        </div>
      </div>
    </PortalLayout>
  );
};

export default RankingCategoryPage;
