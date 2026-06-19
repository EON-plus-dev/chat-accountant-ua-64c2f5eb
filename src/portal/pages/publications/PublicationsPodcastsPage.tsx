import { useState, useMemo, useEffect } from "react";
import { useAudience } from "@/contexts/AudienceContext";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { ARTICLES } from "@/portal/data/articles";
import { MediaCard } from "@/portal/components/MediaCard";
import { StickyFilterBar } from "@/portal/components/StickyFilterBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL, getPodcastSeriesSchema, getMediaItemListSchema } from "@/portal/seo/structuredData";
import { ArrowUpDown, Headphones, Rss, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

export default function PublicationsPodcastsPage() {
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

  const allPodcasts = useMemo(() => ARTICLES.filter((a) => a.mediaType === "podcast"), []);

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    allPodcasts.forEach((a) => cats.set(a.category, a.categoryLabel));
    return Array.from(cats, ([value, label]) => ({ value, label }));
  }, [allPodcasts]);

  const categoryPills = useMemo(() => {
    const counts = new Map<string, number>();
    allPodcasts.forEach((a) => counts.set(a.category, (counts.get(a.category) || 0) + 1));
    return [
      { value: "all", label: "Всі теми", count: allPodcasts.length },
      ...categories.map((c) => ({ ...c, count: counts.get(c.value) || 0 })),
    ];
  }, [allPodcasts, categories]);

  const audiencePills = useMemo(() => {
    const biz = allPodcasts.filter((a) => a.audience === "business" || a.audience === "both").length;
    const pers = allPodcasts.filter((a) => a.audience === "personal" || a.audience === "both").length;
    return [
      { value: "all", label: "Всі", count: allPodcasts.length },
      { value: "business", label: "Для бізнесу", count: biz },
      { value: "personal", label: "Для фізосіб", count: pers },
    ];
  }, [allPodcasts]);

  const filtered = useMemo(() => {
    let result = [...allPodcasts];
    if (audienceFilter !== "all") result = result.filter((a) => a.audience === audienceFilter || a.audience === "both");
    if (categoryFilter !== "all") result = result.filter((a) => a.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    // Sort
    switch (sort) {
      case "popular": result.sort((a, b) => b.views - a.views); break;
      case "longest": result.sort((a, b) => parseDuration(b.mediaDuration) - parseDuration(a.mediaDuration)); break;
      default: result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    return result;
  }, [allPodcasts, audienceFilter, categoryFilter, search, sort]);

  const featured = allPodcasts.length > 0
    ? [...allPodcasts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0]
    : null;

  // Stats
  const totalSeconds = allPodcasts.reduce((s, a) => s + parseDuration(a.mediaDuration), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const avgMin = allPodcasts.length > 0 ? Math.round(totalSeconds / allPodcasts.length / 60) : 0;

  const dynamicDescription = `Слухайте ${allPodcasts.length} випусків подкасту FINTODO про оподаткування, бухоблік та законодавство для підприємців та фізосіб.`;

  const handleCopyRss = () => {
    navigator.clipboard.writeText("https://fintodo.com.ua/feed/podcast.xml").then(() => {
      toast.success("RSS-посилання скопійовано");
    }).catch(() => {});
  };

  return (
    <PortalLayout
      showTicker
      meta={{
        title: `Подкасти (${allPodcasts.length} випусків) — аудіо про податки та бізнес | FINTODO`,
        description: dynamicDescription,
        canonical: `${SITE_URL}/publications/podcasts`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Публікації", url: `${SITE_URL}/publications` }, { name: "Подкасти", url: `${SITE_URL}/publications/podcasts` }])} />
      <JsonLd data={getPodcastSeriesSchema()} />
      <JsonLd data={getMediaItemListSchema(allPodcasts, "podcast")} />

      <div className="max-w-5xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Подкасти" }]} />
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Подкасти</h1>
        <p className="text-muted-foreground mb-3">{dynamicDescription}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6 flex-wrap">
          <span className="font-medium">{totalHours} годин контенту</span>
          <span className="text-border">·</span>
          <span>{allPodcasts.length} випусків</span>
          <span className="text-border">·</span>
          <span>~{avgMin} хв/випуск</span>
          <span className="text-border">·</span>
          <span>Щотижня</span>
        </div>

        {/* Featured episode */}
        {featured && (
          <div className="mb-6">
            <MediaCard article={featured} variant="featured" />
          </div>
        )}

        {/* Platform CTA */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl bg-muted/30 border border-border/40">
          <Headphones className="h-5 w-5 text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">Слухайте також на</span>
          <div className="flex gap-2">
            {["Apple Podcasts", "Spotify", "Google Podcasts"].map((platform) => (
              <a
                key={platform}
                href="#"
                className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopyRss} className="sm:ml-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Rss className="h-3.5 w-3.5" />
            RSS
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {/* Filters */}
        <StickyFilterBar
          pills={audiencePills}
          activeValue={audienceFilter}
          onPillChange={setAudienceFilter}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Пошук подкастів..."
          resultCount={filtered.length}
        />

        {/* Category + Sort row */}
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

          {/* Sort */}
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

        {/* List */}
        <div className="mt-4 divide-y divide-border/30">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Немає подкастів за обраними фільтрами</p>
          ) : (
            filtered
              .filter((a) => a.id !== featured?.id)
              .map((a) => <MediaCard key={a.id} article={a} />)
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
