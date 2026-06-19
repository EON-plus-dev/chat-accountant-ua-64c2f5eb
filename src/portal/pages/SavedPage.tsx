import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { ArticleCard } from "@/portal/components/ArticleCard";
import { AUTHORS } from "@/portal/data/authors";
import { ARTICLES } from "@/portal/data/articles";
import { useSavedArticles } from "@/portal/hooks/useSavedArticles";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { JsonLd } from "@/components/seo/JsonLd";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const getAuthor = (id: string) => AUTHORS.find((a) => a.id === id);

const SavedPage = () => {
  const { saved } = useSavedArticles();
  const articles = ARTICLES.filter((a) => saved.includes(a.id));

  return (
    <PortalLayout
      meta={{
        title: "Збережені матеріали",
        description: "Ваші збережені статті та матеріали на fintodo.",
        canonical: `${SITE_URL}/saved`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Збережені", url: `${SITE_URL}/saved` },
      ])} />

      <div className="max-w-7xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Збережені" }]} />
        <div className="py-8 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Збережені матеріали</h1>
          {articles.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Ви ще не зберегли жодної статті</p>
              <Button asChild variant="outline">
                <Link to="/taxes">Перейти до статей →</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} author={getAuthor(article.authorId)} size="featured" />
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default SavedPage;
