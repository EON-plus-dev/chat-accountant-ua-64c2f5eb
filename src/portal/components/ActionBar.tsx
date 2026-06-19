import { useState, useCallback } from "react";
import { MessageSquare, Link2, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoteButton } from "./VoteButton";
import { toast } from "@/hooks/use-toast";

interface ActionBarProps {
  id: string;
  score: number;
  commentCount: number;
  className?: string;
  variant?: "inline" | "full-width";
}

const isBookmarked = (id: string) => {
  try { return localStorage.getItem(`bm_${id}`) === "1"; } catch { return false; }
};

export const ActionBar = ({ id, score, commentCount, className, variant = "inline" }: ActionBarProps) => {
  const [saved, setSaved] = useState(() => isBookmarked(id));

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Посилання скопійовано", description: "Ви можете поділитися ним" });
  }, []);

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const next = !saved;
    setSaved(next);
    try {
      if (next) localStorage.setItem(`bm_${id}`, "1");
      else localStorage.removeItem(`bm_${id}`);
    } catch {}
    toast({ title: next ? "Збережено" : "Видалено зі збережених" });
  }, [saved, id]);

  const isFullWidth = variant === "full-width";

  const btnClass = cn(
    "flex items-center gap-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
    isFullWidth ? "px-3 py-2 min-h-[44px]" : "px-2.5 py-1.5"
  );

  return (
    <div className={cn(
      "flex items-center gap-1 flex-wrap",
      isFullWidth && "gap-2",
      className
    )}>
      <VoteButton id={id} score={score} direction="horizontal" />
      <span className="w-px h-5 bg-border/60 mx-1 hidden sm:block" />
      <button className={btnClass} disabled>
        <MessageSquare className="w-3.5 h-3.5" />
        <span>{commentCount} уточнень</span>
      </button>
      <button className={btnClass} onClick={handleShare}>
        <Link2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Поділитися</span>
      </button>
      <button
        className={cn(btnClass, saved && "text-primary")}
        onClick={handleBookmark}
      >
        {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{saved ? "Збережено" : "Зберегти"}</span>
      </button>
    </div>
  );
};
