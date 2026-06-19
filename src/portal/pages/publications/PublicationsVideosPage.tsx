import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAudience } from "@/contexts/AudienceContext";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { ARTICLES } from "@/portal/data/articles";
import { MediaCard } from "@/portal/components/MediaCard";
import { StickyFilterBar } from "@/portal/components/StickyFilterBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL, getMediaItemListSchema } from "@/portal/seo/structuredData";
import { ArrowUpDown, Video, Play, Clock, Eye } from "lucide-react";
import type { Article } from "@/portal/data/articles";

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} млн`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")} тис`;
  return String(n);
}

const VideoGridCard = ({ article }: { article: Article }) => (
  <Link
    to={`/articles/${article.slug}`}
    className="group block rounded-xl border border-border/60 bg-card overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow"
  >
    {/* Thumbnail placeholder */}
    <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
      <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <Video className="h-8 w-8 text-primary" />
        <Play className="h-5 w-5 text-primary/70" />
      </div>
      {article.mediaDuration && (
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm text-foreground text-[11px] font-mono px-2 py-0.5 rounded-md">
          <Clock className="h-3 w-3" />
          {article.mediaDuration}
        </span>
      )}
    </div>
    <div className="p-3">
      <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
        {article.title}
      </h3>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{article.publishedAt}</span>
        <span className="flex items-center gap-0.5">
          <Eye className="h-3 w-3" />
          {formatViewCount(article.views)}
        </span>
      </div>
    </div>
  </Link>
);

type SortKey = "newest" | "popular" | "longest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Новіші" },
  { value: "popular", label: "Популярніші" },
  { value: "longest", label: "Довші" },
];

function parseDuration(d?: string): number {
  if (!d) return 0;
  const parts = d.split(":").map(Number);
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
}

export default function PublicationsVideosPage() {
  const { audience } = useAudience();
  const [audienceFilter, setAudienceFilter] = useState(() =>
    audience === "individual" ? "personal" : "business"
  );

  useEffect(() => {
    setAudienceFilter(audience === "individual" ? "personal" : "business");
  }, [audience]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const allVideos = useMemo(() => ARTICLES.filter((a) => a.mediaType === "video"), []);

  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    allVideos.forEach((a) => cats.set(a.category, a.categoryLabel));
    return Array.from(cats, ([value, label]) => ({ value, label }));
  }, [allVideos]);

  const categoryPills = useMemo(() => {
    const counts = new Map<string, number>();
    allVideos.forEach((a) => counts.set(a.category, (counts.get(a.category) || 0) + 1));
    return [
      { value: "all", label: "Всі теми", count: allVideos.length },
      ...categories.map((c) => ({ ...c, count: counts.get(c.value) || 0 })),
    ];
  }, [allVideos, categories]);

  const audiencePills = useMemo(() => {
    const biz = allVideos.filter((a) => a.audience === "business" || a.audience === "both").length;
    const pers = allVideos.filter((a) => a.audience === "personal" || a.audience === "both").length;
    return [
      { value: "all", label: "Всі", count: allVideos.length },
      { value: "business", label: "Для бізнесу", count: biz },
      { value: "personal", label: "Для фізосіб", count: pers },
    ];
  }, [allVideos]);

  const filtered = useMemo(() => {
    let result = [...allVideos];
    if (audienceFilter !== "all") result = result.filter((a) => a.audience === audienceFilter || a.audience === "both");
    if (categoryFilter !== "all") result = result.filter((a) => a.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    switch (sort) {
      case "popular": result.sort((a, b) => b.views - a.views); break;
      case "longest": result.sort((a, b) => parseDuration(b.mediaDuration) - parseDuration(a.mediaDuration)); break;
      default: result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    return result;
  }, [allVideos, audienceFilter, categoryFilter, search, sort]);

  const featured = allVideos.length > 0
    ? [...allVideos].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0]
    : null;

  const dynamicDescription = `Дивіться ${allVideos.length} відео FINTODO з покроковими інструкціями, оглядами сервісів та поясненнями змін у законодавстві.`;

  return (
    <PortalLayout
      showTicker
      meta={{
        title: `Відео (${allVideos.length}) — покрокові інструкції та огляди | FINTODO`,
        description: dynamicDescription,
        canonical: `${SITE_URL}/publications/videos`,
        type: "video.other",
      }}
    >
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Публікації", url: `${SITE_URL}/publications` }, { name: "Відео", url: `${SITE_URL}/publications/videos` }])} />
      <JsonLd data={getMediaItemListSchema(allVideos, "video")} />

      <div className="max-w-5xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Відео" }]} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Відео</h1>
        <p className="text-muted-foreground mb-6">{dynamicDescription}</p>

        {/* Featured video */}
        {featured && (
          <div className="mb-6">
            <MediaCard article={featured} variant="featured" />
          </div>
        )}

        {/* Filters */}
        <StickyFilterBar
          pills={audiencePills}
          activeValue={audienceFilter}
          onPillChange={setAudienceFilter}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Пошук відео..."
          resultCount={filtered.length}
        />

        {/* Category + Sort */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {categoryPills.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setCategoryFilter(pill.value)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === pill.value
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {pill.label}
                <span className={`font-mono text-[10px] ${categoryFilter === pill.value ? "text-secondary-foreground/70" : "text-muted-foreground/60"}`}>
                  {pill.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                  sort === opt.value
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center col-span-full">Немає відео за обраними фільтрами</p>
          ) : (
            filtered
              .filter((a) => a.id !== featured?.id)
              .map((a) => <VideoGridCard key={a.id} article={a} />)
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
