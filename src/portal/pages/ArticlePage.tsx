import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { ARTICLES } from "@/portal/data/articles";
import { AUTHORS } from "@/portal/data/authors";
import { getArticleSchema, getBreadcrumbSchema, getFaqSchema, getPodcastEpisodeSchema, getVideoObjectSchema, SITE_URL } from "@/portal/seo/structuredData";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { ArticleHeader } from "@/portal/sections/article-header/ArticleHeader";
import { ArticleBody, DesktopTableOfContents, TOC_ITEMS_DATA } from "@/portal/sections/article-body/ArticleBody";
import { ArticleSidebar } from "@/portal/sections/article-sidebar/ArticleSidebar";
import { ReadingProgressBar } from "@/portal/components/ReadingProgressBar";
import { PodcastPlayer } from "@/portal/components/PodcastPlayer";
import { VideoPlayer } from "@/portal/components/VideoPlayer";
import { MediaArticleBody } from "@/portal/components/MediaArticleBody";
import { analytics } from "@/portal/services/analytics";
import { renderMarkdown } from "@/lib/markdownRenderer";

const CONTENT_TYPE_BREADCRUMB: Record<string, { label: string; to: string }> = {
  news:       { label: 'Новини', to: '/publications/news' },
  change:     { label: 'Новини', to: '/publications/news' },
  guide:      { label: 'Гайди', to: '/publications/guides' },
  explainer:  { label: 'Гайди', to: '/publications/guides' },
  analysis:   { label: 'Огляди', to: '/publications/reviews' },
  comparison: { label: 'Огляди', to: '/publications/reviews' },
};

const MEDIA_TYPE_BREADCRUMB: Record<string, { label: string; to: string }> = {
  podcast: { label: 'Подкасти', to: '/publications/podcasts' },
  video:   { label: 'Відео', to: '/publications/videos' },
};

const FAQ_ITEMS = [
  { question: "Чи може ФОП 2 групи надавати послуги юридичним особам?", answer: "Так, може." },
  { question: "Як перейти з 2 на 3 групу ФОП?", answer: "Подати заяву у ДПС до 15-го числа останнього місяця кварталу." },
  { question: "Чи потрібно ФОП сплачувати ЄСВ під час відпустки?", answer: "ФОП 1 групи мають право не сплачувати ЄСВ за один місяць відпустки на рік." },
  { question: "Що буде при перевищенні ліміту доходу?", answer: "ФОП зобов'язаний перейти на вищу групу або загальну систему." },
  { question: "Коли подавати звіт ФОП за Q1 2025?", answer: "До 12 травня 2025." },
];

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = ARTICLES.find((a) => a.slug === slug);
  const author = article ? AUTHORS.find((a) => a.id === article.authorId) : null;

  useEffect(() => {
    if (article) analytics.articleViewed(article.slug, article.category);
  }, [article?.slug]);

  const [activeSection, setActiveSection] = useState(0);
  const isMedia = article?.mediaType === 'podcast' || article?.mediaType === 'video';

  // Scroll spy for desktop ToC (only for text articles)
  useEffect(() => {
    if (isMedia) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = TOC_ITEMS_DATA.findIndex((t) => t.id === entry.target.id);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    TOC_ITEMS_DATA.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [article?.slug, isMedia]);

  if (!article || !author) {
    return (
      <PortalLayout
        meta={{
          title: "Стаття не знайдена",
          description: "Запитана стаття не існує.",
          canonical: `${SITE_URL}/articles/${slug}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Стаття не знайдена</h1>
        </div>
      </PortalLayout>
    );
  }

  // Determine breadcrumb category: media type takes priority
  const categoryBreadcrumb = article.mediaType && MEDIA_TYPE_BREADCRUMB[article.mediaType]
    ? MEDIA_TYPE_BREADCRUMB[article.mediaType]
    : CONTENT_TYPE_BREADCRUMB[article.contentType];

  // Determine og:type
  const ogType = article.mediaType === 'video' ? 'video.other' as const : 'article' as const;

  // Determine JSON-LD schema based on media type
  const getContentSchema = () => {
    if (article.mediaType === 'podcast') return getPodcastEpisodeSchema(article, author);
    if (article.mediaType === 'video') return getVideoObjectSchema(article, author);
    return getArticleSchema(article, author);
  };

  return (
    <PortalLayout
      meta={{
        title: article.title,
        description: article.tldr.slice(0, 160),
        canonical: `${SITE_URL}/articles/${article.slug}`,
        type: ogType,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        authorName: author.name,
      }}
    >
      {/* Reading progress only for text articles */}
      {!isMedia && <ReadingProgressBar />}

      <JsonLd data={getContentSchema()} />
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Публікації", url: `${SITE_URL}/publications` },
        ...(categoryBreadcrumb ? [{ name: categoryBreadcrumb.label, url: `${SITE_URL}${categoryBreadcrumb.to}` }] : []),
        { name: article.title, url: `${SITE_URL}/articles/${article.slug}` },
      ])} />
      {/* FAQ schema only for text articles */}
      {!isMedia && <JsonLd data={getFaqSchema(FAQ_ITEMS)} />}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Публікації", to: "/publications" },
          ...(categoryBreadcrumb ? [categoryBreadcrumb] : []),
          { label: article.title },
        ]} />
        <ArticleHeader article={article} author={author} />

        {/* Media player */}
        {article.mediaType === 'podcast' && article.mediaUrl && (
          <PodcastPlayer audioUrl={article.mediaUrl} duration={article.mediaDuration} />
        )}
        {article.mediaType === 'video' && (
          <VideoPlayer videoUrl={article.mediaUrl || '#'} duration={article.mediaDuration} />
        )}

        {/* Layout: 2-column for media, 3-column for text */}
        {isMedia ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <MediaArticleBody article={article} />
            <ArticleSidebar article={article} author={author} />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px] lg:grid-cols-[200px_1fr_340px]">
            <aside className="hidden lg:block">
              <DesktopTableOfContents activeIndex={activeSection} onSelect={setActiveSection} />
            </aside>
            {article.content ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
              />
            ) : (
              <ArticleBody article={article} />
            )}
            <ArticleSidebar article={article} author={author} />
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default ArticlePage;
