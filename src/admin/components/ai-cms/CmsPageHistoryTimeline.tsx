import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Sparkles, Lightbulb, Search, Trash2, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/timeAgo";
import {
  loadPageHistory,
  clearPageHistory,
  type ChangeEntry,
  type ChangeKind,
  KIND_LABEL,
} from "./articleChangeHistory";
import { toast } from "sonner";

interface Props {
  currentPath: string;
}

const KIND_ICON: Record<ChangeKind, typeof Pencil> = {
  "field-edit": Pencil,
  "ai-suggestion": Sparkles,
  "idea-action": Lightbulb,
  "seo-update": Search,
};

const KIND_COLOR: Record<ChangeKind, string> = {
  "field-edit": "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "ai-suggestion": "bg-primary/10 text-primary border-primary/20",
  "idea-action": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "seo-update": "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const FILTERS: { id: "all" | ChangeKind; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "field-edit", label: "Правки" },
  { id: "ai-suggestion", label: "AI" },
  { id: "idea-action", label: "Ідеї" },
  { id: "seo-update", label: "SEO" },
];

export default function CmsPageHistoryTimeline({ currentPath }: Props) {
  const [entries, setEntries] = useState<ChangeEntry[]>([]);
  const [filter, setFilter] = useState<"all" | ChangeKind>("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setEntries(loadPageHistory(currentPath));
  }, [currentPath, tick]);

  // refresh when storage changes (other tabs / same tab via storage event)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === `cms:history:page:${currentPath}`) setTick((t) => t + 1);
    };
    window.addEventListener("storage", onStorage);
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, [currentPath]);

  const filtered = filter === "all" ? entries : entries.filter((e) => (e.kind ?? "field-edit") === filter);

  const handleClear = () => {
    clearPageHistory(currentPath);
    setEntries([]);
    toast.success("Історію сторінки очищено");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-2 py-2 border-b border-border/60 space-y-2">
        <div className="text-[11px] text-muted-foreground px-1 truncate">
          <code className="text-foreground">{currentPath}</code>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent text-muted-foreground border-border",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-2 py-2 space-y-1.5">
          {filtered.length === 0 && (
            <p className="px-2 py-6 text-xs text-muted-foreground text-center">
              {entries.length === 0
                ? "Тут зʼявляться правки, AI-підказки, ідеї та SEO-зміни для цієї сторінки."
                : "Нічого за цим фільтром."}
            </p>
          )}
          {filtered.map((e) => {
            const kind = (e.kind ?? "field-edit") as ChangeKind;
            const Icon = KIND_ICON[kind];
            return (
              <div key={e.id} className="border border-border/60 rounded-md bg-card px-2 py-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="outline" className={cn("text-[9px] h-4 px-1 gap-1", KIND_COLOR[kind])}>
                    <Icon className="h-2.5 w-2.5" /> {KIND_LABEL[kind]}
                  </Badge>
                  <span
                    className="text-[10px] text-muted-foreground ml-auto"
                    title={new Date(e.at).toLocaleString("uk-UA")}
                  >
                    {timeAgo(e.at)}
                  </span>
                </div>
                <p className="text-[11px] text-foreground leading-snug break-words">
                  {e.summary}
                </p>
                {e.excerpt && (
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-3 italic">
                    {e.excerpt}
                  </p>
                )}
                {e.selectionText && (
                  <p className="text-[10px] text-muted-foreground/80 mt-1 pl-2 border-l-2 border-border line-clamp-2">
                    «{e.selectionText}»
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><UserIcon className="h-2.5 w-2.5" /> {e.author}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {entries.length > 0 && (
        <div className="shrink-0 border-t border-border/60 p-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="w-full h-7 text-[11px] gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Очистити історію сторінки
          </Button>
        </div>
      )}
    </div>
  );
}
