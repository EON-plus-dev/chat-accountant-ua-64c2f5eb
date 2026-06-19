import { Link } from "react-router-dom";
import { Eye, Bookmark, Mic, Video } from "lucide-react";
import { useSavedArticles } from "@/portal/hooks/useSavedArticles";
import type { Article } from "@/portal/data/articles";

const TYPE_DOT: Record<string, string> = {
  guide: "bg-info",
  change: "bg-warning",
  analysis: "bg-secondary",
  dps: "bg-destructive",
  news: "bg-primary",
  podcast: "bg-accent",
  video: "bg-chart-2",
};

const TYPE_LABEL: Record<string, string> = {
  guide: "Гайд",
  change: "Зміна",
  analysis: "Аналітика",
  dps: "ДПС",
  news: "Новина",
  podcast: "Подкаст",
  video: "Відео",
};

interface Props {
  article: Article;
}

export const ArticleRow = ({ article }: Props) => {
  const { toggle, isSaved } = useSavedArticles();
  const saved = isSaved(article.id);

  const isMedia = article.mediaType && article.mediaType !== 'text';
  const durationLabel = isMedia && article.mediaDuration ? article.mediaDuration : `${article.readingMinutes} хв`;
  const DurationIcon = article.mediaType === 'podcast' ? Mic : article.mediaType === 'video' ? Video : null;

  return (
    <div className="group flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-muted/30 transition-colors">
      {/* Type dot */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_DOT[article.type] || TYPE_DOT.news}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {TYPE_LABEL[article.type] || article.type}
          </span>
          <span className="text-muted-foreground/40 text-[10px]">·</span>
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-0.5">
            {DurationIcon && <DurationIcon className="h-2.5 w-2.5" />}
            {durationLabel}
          </span>
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
        </div>
      </div>

      {/* Bookmark */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(article.id); }}
        className="shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
        aria-label={saved ? "Видалити зі збережених" : "Зберегти"}
      >
        <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      </button>
    </div>
  );
};
