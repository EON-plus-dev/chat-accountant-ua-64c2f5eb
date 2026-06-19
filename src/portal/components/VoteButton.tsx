import { useState, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  score: number;
  id: string;
  direction?: "vertical" | "horizontal";
  className?: string;
}

type Vote = 1 | -1 | 0;

const getStoredVote = (id: string): Vote => {
  try {
    const v = localStorage.getItem(`vote_${id}`);
    return v === "1" ? 1 : v === "-1" ? -1 : 0;
  } catch {
    return 0;
  }
};

const storeVote = (id: string, vote: Vote) => {
  try {
    if (vote === 0) localStorage.removeItem(`vote_${id}`);
    else localStorage.setItem(`vote_${id}`, String(vote));
  } catch {}
};

export const VoteButton = ({ score, id, direction = "vertical", className }: VoteButtonProps) => {
  const [vote, setVote] = useState<Vote>(() => getStoredVote(id));

  const handleVote = useCallback((v: 1 | -1) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Vote = vote === v ? 0 : v;
    setVote(next);
    storeVote(id, next);
  }, [vote, id]);

  const displayScore = score + vote;
  const isVert = direction === "vertical";

  return (
    <div className={cn(
      "flex items-center gap-0.5 select-none",
      isVert ? "flex-col" : "flex-row",
      className
    )}>
      <button
        onClick={handleVote(1)}
        className={cn(
          "p-0.5 rounded transition-colors",
          vote === 1
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <span className={cn(
        "text-xs font-bold tabular-nums min-w-[1.5rem] text-center",
        vote === 1 ? "text-primary" : vote === -1 ? "text-destructive" : "text-foreground"
      )}>
        {displayScore}
      </span>
      <button
        onClick={handleVote(-1)}
        className={cn(
          "p-0.5 rounded transition-colors",
          vote === -1
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
};
