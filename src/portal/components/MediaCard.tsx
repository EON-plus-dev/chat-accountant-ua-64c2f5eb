import { Link } from "react-router-dom";
import { Mic, Video, Eye, Bookmark, Clock, Play, Users } from "lucide-react";
import { useSavedArticles } from "@/portal/hooks/useSavedArticles";
import type { Article } from "@/portal/data/articles";

interface Props {
  article: Article;
  variant?: "default" | "featured";
}

export const MediaCard = ({ article, variant = "default" }: Props) => {
  const { toggle, isSaved } = useSavedArticles();
  const saved = isSaved(article.id);
  const isPodcast = article.mediaType === "podcast";

  if (variant === "featured") {
    return (
      <Link
        to={`/articles/${article.slug}`}
        className="group block rounded-2xl border border-border/70 bg-card overflow-hidden shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-shadow"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Left: visual block */}
          <div className="relative flex items-center justify-center bg-muted/40 sm:w-52 h-32 sm:h-auto shrink-0">
            <div className="flex flex-col items-center gap-1">
              {isPodcast ? (
                <>
                  <Mic className="h-8 w-8 text-primary" />
                  {article.episodeNumber && (
                    <span className="text-xs font-bold text-primary font-mono">EP {article.episodeNumber}</span>
                  )}
                </>
              ) : (
                <>
                  <Video className="h-8 w-8 text-primary" />
                  <Play className="h-5 w-5 text-primary/70" />
                </>
              )}
            </div>
            {article.mediaDuration && (
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm text-foreground text-[11px] font-mono px-2 py-0.5 rounded-md">
                <Clock className="h-3 w-3" />
                {article.mediaDuration}
              </span>
            )}
          </div>

          {/* Right: content */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                {isPodcast ? "Новий випуск" : "Нове відео"}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {article.categoryLabel}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>{article.publishedAt}</span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                <span className="font-mono">{article.views.toLocaleString("uk-UA")}</span>
              </span>
              {article.guests && article.guests.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <Users className="h-3 w-3" />
                  {article.guests.length} {article.guests.length === 1 ? "гість" : "гостей"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-muted/30 transition-colors">
      {/* Left icon block */}
      <Link
        to={`/articles/${article.slug}`}
        className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-muted/50 shrink-0 group-hover:bg-primary/10 transition-colors"
      >
        {isPodcast ? (
          <>
            <Mic className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            {article.episodeNumber && (
              <span className="absolute -top-1 -right-1 text-[9px] font-bold text-primary-foreground bg-primary rounded-full w-5 h-5 flex items-center justify-center">
                {article.episodeNumber}
              </span>
            )}
          </>
        ) : (
          <Video className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {article.categoryLabel}
          </span>
          {article.mediaDuration && (
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {article.mediaDuration}
            </span>
          )}
          {article.isPremium && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">PRO</span>
          )}
        </div>
        <Link to={`/articles/${article.slug}`} className="block">
          <h3 className="text-sm font-semibold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">{article.publishedAt}</span>
          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span className="font-mono">{article.views.toLocaleString("uk-UA")}</span>
          </span>
          {article.guests && article.guests.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{article.guests[0].split("—")[0].trim()}</span>
            </span>
          )}
        </div>
      </div>

      {/* Play + Bookmark */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          to={`/articles/${article.slug}`}
          className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          aria-label={isPodcast ? "Слухати" : "Дивитися"}
        >
          <Play className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(article.id); }}
          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
          aria-label={saved ? "Видалити зі збережених" : "Зберегти"}
        >
          <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
    </div>
  );
};
