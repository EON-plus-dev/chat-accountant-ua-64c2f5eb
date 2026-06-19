import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAudience } from "@/contexts/AudienceContext";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { ARTICLES } from "@/portal/data/articles";
import { ArticleRow } from "@/portal/components/ArticleRow";
import { AlertSubscription } from "@/portal/sections/alert-subscription/AlertSubscription";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Newspaper, BookOpen, FlaskConical, MessageSquare, ClipboardList, CalendarDays, Mic, Video } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";

const TYPE_CARDS = [
  { label: "Новини", emoji: "📰", href: "/publications/news", desc: "Зміни в законодавстві та оподаткуванні", icon: Newspaper },
  { label: "Гайди", emoji: "📚", href: "/publications/guides", desc: "Покрокові інструкції для підприємців", icon: BookOpen },
  { label: "Подкасти", emoji: "🎙", href: "/publications/podcasts", desc: "Аудіо про податки, бізнес та зміни", icon: Mic },
  { label: "Відео", emoji: "📹", href: "/publications/videos", desc: "Покрокові інструкції та огляди", icon: Video },
  { label: "Дослідження", emoji: "🔬", href: "/publications/ratings", desc: "Рейтинги та аналітичні огляди", icon: FlaskConical },
  { label: "Консультації", emoji: "💬", href: "/publications/consultations", desc: "Відповіді на питання підприємців", icon: MessageSquare },
  { label: "Огляди", emoji: "📋", href: "/publications/reviews", desc: "Аналіз продуктів та сервісів", icon: ClipboardList },
  { label: "Дайджест", emoji: "📅", href: "/newsletter", desc: "Щотижневі зміни в оподаткуванні", icon: CalendarDays },
];

const THEMATIC_SECTIONS = [
  { label: "ФОП", emoji: "🏪", href: "/fop", desc: "Єдиний податок, ЄСВ, звітність" },
  { label: "Оподаткування", emoji: "📋", href: "/taxes", desc: "ПДВ, податок на прибуток, акцизи" },
  { label: "Бухоблік", emoji: "📊", href: "/accounting", desc: "Облік, документообіг, аудит" },
  { label: "Законодавство", emoji: "⚖️", href: "/law", desc: "Нормативна база та зміни" },
  { label: "Під час війни", emoji: "🇺🇦", href: "/wartime", desc: "Пільги, мораторії, особливості" },
  { label: "Фізособам", emoji: "👤", href: "/personal", desc: "ПДФО, декларування, субсидії" },
];

const TAB_FILTERS: Record<string, string[]> = {
  all: [],
  news: ["news", "change", "dps"],
  guides: ["guide", "explainer"],
  analysis: ["analysis", "comparison"],
  reviews: ["review"],
  podcasts: ["podcast"],
  videos: ["video"],
};

export default function PublicationsPage() {
  const [tab, setTab] = useState("all");
  const { audience } = useAudience();
  const mappedAudience = audience === "individual" ? "personal" : "business";

  const featuredArticle = useMemo(() => ARTICLES.find((a) => a.isFeatured && (a.audience === mappedAudience || a.audience === "both")), [mappedAudience]);

  const filteredArticles = useMemo(() => {
    const types = TAB_FILTERS[tab];
    let result = (!types || types.length === 0) ? [...ARTICLES] : ARTICLES.filter((a) => types.includes(a.contentType) || types.includes(a.type));
    result = result.filter(a => a.audience === mappedAudience || a.audience === "both");
    return result;
  }, [tab, mappedAudience]);

  return (
    <PortalLayout
      showTicker
      meta={{
        title: "Публікації — новини, гайди, дослідження | FINTODO",
        description: "Новини про оподаткування, практичні гайди для підприємців, консультації та аналітичні дослідження.",
        canonical: `${SITE_URL}/publications`,
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації" }]} />
        <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Публікації", url: `${SITE_URL}/publications` }])} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">Публікації</h1>

        {/* Type cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {TYPE_CARDS.map((c) => (
            <Link key={c.href} to={c.href}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Featured article */}
        {featuredArticle && (
          <section className="mb-6">
            <Link to={`/articles/${featuredArticle.slug}`} className="block group">
              <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6 md:p-6">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Рекомендоване</span>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mt-2 group-hover:text-primary transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{featuredArticle.excerpt}</p>
                  <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                    <span>{featuredArticle.publishedAt}</span>
                    <span>·</span>
                    <span>{featuredArticle.readingMinutes} хв читання</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
                    Читати <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}

        {/* Articles feed */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Матеріали</h2>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="overflow-x-auto max-w-full scrollbar-hide">
              <TabsTrigger value="all">Всі</TabsTrigger>
              <TabsTrigger value="news">Новини</TabsTrigger>
              <TabsTrigger value="guides">Гайди</TabsTrigger>
              <TabsTrigger value="analysis">Аналіз</TabsTrigger>
              <TabsTrigger value="reviews">Огляди</TabsTrigger>
              <TabsTrigger value="podcasts">Подкасти</TabsTrigger>
              <TabsTrigger value="videos">Відео</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              <div className="mt-4 divide-y divide-border/30">
                {filteredArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Немає матеріалів</p>
                ) : (
                  filteredArticles.map((a) => <ArticleRow key={a.id} article={a} />)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Thematic sections */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Тематичні розділи</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {THEMATIC_SECTIONS.map((s) => (
              <Link key={s.href} to={s.href}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4 flex items-start gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">{s.label}</p>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <AlertSubscription />
      </div>
    </PortalLayout>
  );
}
