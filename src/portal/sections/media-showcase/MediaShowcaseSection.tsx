import { useState } from "react";
import { Link } from "react-router-dom";
import { Mic, Video, Play, Clock, Users, ChevronRight } from "lucide-react";
import { ARTICLES } from "@/portal/data/articles";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import type { Article } from "@/portal/data/articles";

type MediaTab = "podcast" | "video";

const TAB_CONFIG: Record<MediaTab, { label: string; icon: typeof Mic; allLink: string; allLabel: string; actionLabel: string }> = {
  podcast: { label: "Подкасти", icon: Mic, allLink: "/publications/podcasts", allLabel: "Всі подкасти", actionLabel: "Слухати" },
  video: { label: "Відео", icon: Video, allLink: "/publications/videos", allLabel: "Всі відео", actionLabel: "Дивитися" },
};

function FeaturedCard({ article, tab }: { article: Article; tab: MediaTab }) {
  const config = TAB_CONFIG[tab];
  const Icon = config.icon;

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group block rounded-2xl border border-border/70 bg-card overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Visual block */}
        <div className="relative flex items-center justify-center bg-primary/5 sm:w-52 h-24 sm:h-auto shrink-0">
          <div className="flex flex-col items-center gap-1">
            <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            {tab === "podcast" && article.episodeNumber && (
              <span className="text-xs font-bold text-primary font-mono">EP {article.episodeNumber}</span>
            )}
          </div>
          {article.mediaDuration && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm text-foreground text-[11px] font-mono px-2 py-0.5 rounded-md">
              <Clock className="h-3 w-3" />
              {article.mediaDuration}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              {tab === "podcast" ? "Новий випуск" : "Нове відео"}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {article.categoryLabel}
            </span>
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-foreground leading-snug mb-1 sm:mb-1.5 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{article.publishedAt}</span>
            {article.guests && article.guests.length > 0 && (
              <span className="flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                {article.guests.length} {article.guests.length === 1 ? "гість" : "гостей"}
              </span>
            )}
          </div>
          {/* Chapters preview */}
          {article.chapters && article.chapters.length > 0 && (
            <div className="hidden sm:flex mt-3 flex-wrap gap-1.5">
              {article.chapters.slice(0, 3).map((ch, i) => (
                <span key={i} className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded font-mono">
                  {ch.time} — {ch.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function CompactCard({ article, tab }: { article: Article; tab: MediaTab }) {
  const config = TAB_CONFIG[tab];
  const Icon = config.icon;

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group flex flex-row sm:flex-col rounded-xl border border-border/50 bg-card p-3 hover:shadow-[var(--shadow-md)] hover:border-primary/20 transition-all gap-3 sm:gap-0"
    >
      <div className="flex sm:flex-row items-center gap-2 mb-0 sm:mb-2 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:flex hidden">
          {tab === "podcast" && article.episodeNumber && (
            <span className="font-bold text-primary font-mono">EP {article.episodeNumber}</span>
          )}
          {article.mediaDuration && (
            <span className="flex items-center gap-0.5 font-mono">
              <Clock className="h-2.5 w-2.5" />
              {article.mediaDuration}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {article.title}
        </h4>
        <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 mb-auto">{article.tldr}</p>
        <div className="flex items-center justify-between mt-1 sm:mt-3 sm:pt-2 sm:border-t sm:border-border/30">
          <span className="text-[10px] text-muted-foreground">{article.publishedAt}</span>
          <span className="flex items-center gap-0.5 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-3 w-3" />
            {config.actionLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function MediaShowcaseSection() {
  const [activeTab, setActiveTab] = useState<MediaTab>("podcast");
  const { ref, isVisible } = useScrollReveal(0.1);

  const config = TAB_CONFIG[activeTab];
  const filtered = ARTICLES.filter((a) => a.mediaType === activeTab);
  const [featured, ...rest] = filtered;

  return (
    <section ref={ref} className="py-10 sm:py-14 bg-muted/20">
      <div
        className={cn(
          "max-w-7xl mx-auto px-4 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Подкасти та Відео
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Слухайте, дивіться, розбирайтесь у фінансах
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1">
            {(Object.keys(TAB_CONFIG) as MediaTab[]).map((tab) => {
              const Icon = TAB_CONFIG[tab].icon;
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                  {TAB_CONFIG[tab].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured */}
        {featured && <FeaturedCard article={featured} tab={activeTab} />}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {rest.slice(0, 3).map((article) => (
              <CompactCard key={article.id} article={article} tab={activeTab} />
            ))}
          </div>
        )}

        {/* CTA link */}
        <div className="flex justify-center mt-5">
          <Link
            to={config.allLink}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {config.allLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
