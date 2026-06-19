import type { Article } from "@/portal/data/articles";
import type { Author } from "@/portal/data/authors";
import { BadgeCategory } from "@/portal/components/BadgeCategory";
import { ChangeAlertButton } from "@/portal/components/ChangeAlertButton";
import { TldrBox } from "@/portal/components/TldrBox";
import { ComparisonSummaryBox } from "@/portal/components/ComparisonSummaryBox";
import { COMPARISONS } from "@/portal/data/comparisons";
import { useSavedArticles } from "@/portal/hooks/useSavedArticles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, Bookmark, Mic, Video, Newspaper } from "lucide-react";

interface Props {
  article: Article;
  author: Author;
}

export const ArticleHeader = ({ article, author }: Props) => {
  const { toggle, isSaved } = useSavedArticles();
  const saved = isSaved(article.id);
  const comparison = COMPARISONS[article.slug];
  const isMedia = article.mediaType === 'podcast' || article.mediaType === 'video';

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{article.categoryLabel}</Badge>
        <BadgeCategory type={article.type} />
        {article.contentType === 'comparison' && (
          <Badge variant="secondary" size="sm">⚖️ Порівняння</Badge>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-4xl leading-tight">
        {article.title}
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Newspaper className="h-4 w-4" />
        </span>
        <span className="font-medium text-foreground">{author.name}</span>
        <span>·</span>
        <span>{new Date(article.publishedAt).toLocaleDateString("uk-UA")}</span>
        <Badge variant="success" size="sm">
          Оновлено {new Date(article.updatedAt).toLocaleDateString("uk-UA")}
        </Badge>
        <Badge variant="info" size="sm">
          ✓ Перевірено редакцією
        </Badge>

        {/* Duration: media shows mediaDuration, text shows readingMinutes */}
        {isMedia && article.mediaDuration ? (
          <span className="flex items-center gap-1">
            {article.mediaType === 'podcast' ? <Mic className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
            {article.mediaDuration}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readingMinutes} хв
          </span>
        )}

        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {article.views.toLocaleString("uk-UA")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ChangeAlertButton articleSlug={article.slug} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggle(article.id)}
          aria-label={saved ? "Видалити зі збережених" : "Зберегти"}
        >
          <Bookmark className={`h-5 w-5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </Button>
      </div>

      <TldrBox text={article.tldr} />

      {article.contentType === 'comparison' && comparison && (
        <ComparisonSummaryBox {...comparison} />
      )}
    </header>
  );
};
