import { Link } from "react-router-dom";
import { TAX_CATEGORIES } from "@/portal/data/categories";

const EXTRA_TOPICS = [
  { id: "licensing", name: "Ліцензування", count: 94, slug: "licensing", href: "/taxes?topic=licensing" },
  { id: "tools", name: "Інструменти", count: 48, slug: "tools", href: "/tools" },
  { id: "learn", name: "Навчання", count: 4, slug: "learn", href: "/learn" },
  { id: "analytics", name: "Аналітика", count: 6, slug: "analytics", href: "/analytics" },
];

const ALL_TOPICS = [
  ...TAX_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.count,
    slug: c.slug,
    href: c.slug === "fop" ? "/fop" : `/taxes?topic=${c.slug}`,
  })),
  ...EXTRA_TOPICS,
];

export const TopicPills = () => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 snap-x snap-mandatory">
      {ALL_TOPICS.map((topic) => (
        <Link
          key={topic.id}
          to={topic.href}
          className="shrink-0 snap-start inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-muted text-sm font-medium text-foreground
            hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {topic.name}
          <span className="text-[10px] font-mono text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded-full">
            {topic.count}
          </span>
        </Link>
      ))}
    </div>
  );
};
