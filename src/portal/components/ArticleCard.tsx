import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { BadgeCategory } from "./BadgeCategory";
import { AuthorCard } from "./AuthorCard";
import { useSavedArticles } from "@/portal/hooks/useSavedArticles";
import type { Article } from "@/portal/data/articles";
import type { Author } from "@/portal/data/authors";
import { Eye, Bookmark, Lock } from "lucide-react";

const PremiumBadge = () => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary text-primary-foreground">
    <Lock className="h-3 w-3" /> Преміум
  </span>
);

const TYPE_EMOJI: Record<string, string> = {
  guide: "📖",
  change: "⚡",
  analysis: "📊",
  dps: "🏛️",
  news: "📰",
  podcast: "🎙",
  video: "📹",
};

const TYPE_BORDER: Record<string, string> = {
  guide: "border-l-info",
  change: "border-l-warning",
  analysis: "border-l-secondary",
  dps: "border-l-destructive",
  news: "border-l-primary",
  podcast: "border-l-accent",
  video: "border-l-chart-2",
};

const TYPE_GRADIENT: Record<string, string> = {
  guide: "from-info/15 to-info/5",
  change: "from-warning/15 to-warning/5",
  analysis: "from-secondary to-muted",
  dps: "from-destructive/15 to-destructive/5",
  news: "from-primary/15 to-primary/5",
  podcast: "from-accent/15 to-accent/5",
  video: "from-chart-2/15 to-chart-2/5",
};

interface Props {
  article: Article;
  author?: Author;
  size: "featured" | "compact" | "list";
}

const BookmarkBtn = ({ articleId }: { articleId: string }) => {
  const { toggle, isSaved } = useSavedArticles();
  const saved = isSaved(articleId);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(articleId); }}
      className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
      aria-label={saved ? "Видалити зі збережених" : "Зберегти"}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
    </button>
  );
};

const ThumbnailPlaceholder = ({ type, size }: { type: string; size: "lg" | "sm" }) => {
  const gradient = TYPE_GRADIENT[type] || TYPE_GRADIENT.news;
  const emoji = TYPE_EMOJI[type] || "📄";

  if (size === "lg") {
    return (
      <div className={`aspect-[16/9] rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-4xl opacity-60">{emoji}</span>
      </div>
    );
  }

  return (
    <div className={`w-20 h-14 rounded-md bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
      <span className="text-lg opacity-60">{emoji}</span>
    </div>
  );
};

export const ArticleCard = ({ article, author, size }: Props) => {
  if (size === "featured") {
    return (
      <Card className={`overflow-hidden border-l-4 ${TYPE_BORDER[article.type] || "border-l-primary"}`}>
        <ThumbnailPlaceholder type={article.type} size="lg" />
        <div className="p-6 space-y-3 relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            {article.isPremium && <PremiumBadge />}
            <BookmarkBtn articleId={article.id} />
          </div>
          <BadgeCategory type={article.type} />
          <Link to={`/articles/${article.slug}`}>
            <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors leading-tight">
              {article.title}
            </h2>
          </Link>
          {author && (
            <AuthorCard author={author} date={article.publishedAt} readingMinutes={article.readingMinutes} />
          )}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{article.excerpt}</p>
          <Link to={`/articles/${article.slug}`} className="text-sm font-medium text-primary hover:underline">
            Читати далі →
          </Link>
        </div>
      </Card>
    );
  }

  if (size === "compact") {
    return (
      <div className={`flex flex-col gap-1.5 py-3 border-b border-border/50 last:border-0 border-l-2 pl-3 ${TYPE_BORDER[article.type] || "border-l-primary"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <BadgeCategory type={article.type} />
            {article.isPremium && <PremiumBadge />}
          </div>
          <BookmarkBtn articleId={article.id} />
        </div>
        <Link to={`/articles/${article.slug}`}>
          <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.publishedAt}</span>
          <span>· {article.readingMinutes} хв</span>
        </div>
      </div>
    );
  }

  // list
  return (
    <div className={`flex gap-3 py-4 border-b border-border/50 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors relative border-l-2 ${TYPE_BORDER[article.type] || "border-l-primary"}`}>
      <div className="flex-1 space-y-2">
        <div className="absolute top-4 right-2 flex items-center gap-1.5">
          {article.isPremium && <PremiumBadge />}
          <BookmarkBtn articleId={article.id} />
        </div>
        <BadgeCategory type={article.type} />
        <Link to={`/articles/${article.slug}`}>
          <h3 className="font-semibold text-foreground hover:text-primary transition-colors leading-snug pr-8">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.publishedAt}</span>
          <span>· {article.readingMinutes} хв</span>
          <span className="flex items-center gap-0.5">· <Eye className="h-3 w-3" /> {article.views.toLocaleString("uk-UA")}</span>
        </div>
      </div>
      <ThumbnailPlaceholder type={article.type} size="sm" />
    </div>
  );
};
