import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRelatedEntriesGrouped } from "@/portal/data/knowledge/entryGraph";
import type { DirectoryCategory } from "@/portal/data/knowledge/directoryTypes";

interface Props {
  category: DirectoryCategory;
  slug: string;
  /** Override heading. Defaults to "Пов'язані матеріали". */
  title?: string;
  /** Max items per category group (default 6). */
  limitPerCategory?: number;
  className?: string;
}

/**
 * Renders bidirectional cross-links for a directory entry, grouped by
 * target category. Reads from the in-memory entry graph; renders nothing
 * if the entry has no related materials.
 */
export const RelatedEntriesPanel = ({
  category,
  slug,
  title = "Пов'язані матеріали",
  limitPerCategory = 6,
  className,
}: Props) => {
  const groups = getRelatedEntriesGrouped({ category, slug }, limitPerCategory);
  if (groups.length === 0) return null;

  return (
    <section className={className} aria-label={title}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.category} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{g.categoryLabel}</h3>
              <Badge variant="secondary" className="text-xs">
                {g.items.length}
              </Badge>
            </div>
            <ul className="space-y-2">
              {g.items.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.url}
                    className="text-sm text-primary hover:underline line-clamp-2"
                    title={item.summary}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
};
