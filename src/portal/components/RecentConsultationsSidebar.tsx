import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMergedForumData } from "@/hooks/useAiChatQueries";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageSquare, Briefcase, User } from "lucide-react";

type SidebarAudience = "all" | "business" | "individual";

const PILLS: { value: SidebarAudience; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "business", label: "Бізнес" },
  { value: "individual", label: "Фізособи" },
];

const audienceIcon = (a: string) =>
  a === "business" ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />;

const audienceLabel = (a: string) =>
  a === "business" ? "Бізнес" : "Фізособи";

interface Props {
  maxItems?: number;
}

export const RecentConsultationsSidebar = ({ maxItems = 6 }: Props) => {
  const [filter, setFilter] = useState<SidebarAudience>("all");
  const { items: allItems } = useMergedForumData();

  const items = useMemo(() => {
    let filtered = [...allItems];
    if (filter !== "all") {
      filtered = filtered.filter((c) => c.audience === filter);
    }
    return filtered
      .sort((a, b) => new Date(b.updatedDate || b.date).getTime() - new Date(a.updatedDate || a.date).getTime())
      .slice(0, maxItems);
  }, [filter, maxItems, allItems]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Нещодавні консультації</h3>
      </div>

      {/* Audience pills */}
      <div className="flex gap-0.5 rounded-lg bg-muted p-0.5 mb-3">
        {PILLS.map((p) => (
          <button
            key={p.value}
            onClick={() => setFilter(p.value)}
            className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
              filter === p.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Немає консультацій</p>
        ) : (
          items.map((c) => (
            <Link
              key={c.id}
              to={`/ai-consultations/${c.slug}`}
              className="group w-full text-left p-3 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:shadow-sm transition-all duration-200 relative overflow-hidden block"
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug pr-4">
                {c.question}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  {audienceIcon(c.audience)}
                  {audienceLabel(c.audience)}
                </span>
                {c.tags.slice(0, 1).map((t) => (
                  <Badge key={t} variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                    {t}
                  </Badge>
                ))}
              </div>
              <ArrowRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/60 opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          ))
        )}
      </div>

      <Link
        to="/consultant?tab=forum"
        className="mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-muted/50 transition-all"
      >
        Всі консультації
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
