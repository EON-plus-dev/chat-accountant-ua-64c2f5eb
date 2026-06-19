import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { ARTICLES } from "@/portal/data/articles";
import type { RecentChangesData } from "@/portal/types/hub";

interface Props {
  data: RecentChangesData;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export const RecentChangesSection = ({ data }: Props) => {
  // Primary: articles tagged as legislation/tax changes (type === 'change' or contentType === 'change')
  // For the 'law' hub we accept changes from related categories (law + taxes), since legal
  // changes most often surface as tax-rule updates.
  const allowedCategories = data.category === "law"
    ? new Set(["law", "taxes", "fop"])
    : data.category
      ? new Set([data.category])
      : null;

  const isChange = (a: typeof ARTICLES[number]) =>
    a.type === "change" || a.contentType === "change";

  const items = ARTICLES
    .filter((a) => (allowedCategories ? allowedCategories.has(a.category) : true))
    .filter(isChange)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, data.limit ?? 5);

  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {items.map((a) => (
        <li key={a.id}>
          <Link
            to={`/articles/${a.slug}`}
            className="group flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 pt-0.5 w-28">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(a.publishedAt)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {a.title}
              </div>
              {a.excerpt && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {a.excerpt}
                </div>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        </li>
      ))}
    </ul>
  );
};
