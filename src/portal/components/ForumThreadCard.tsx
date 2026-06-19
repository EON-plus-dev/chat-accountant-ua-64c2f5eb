import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, MessageSquare, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/timeAgo";
import { stripMarkdown } from "@/lib/markdownRenderer";
import { VoteButton } from "./VoteButton";
import type { AIConsultation } from "@/config/aiConsultationMockData";

interface ForumThreadCardProps {
  consultation: AIConsultation;
  viewCount: number;
  rank?: number;
}

const isRecentlyUpdated = (date?: string) => {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < 14 * 24 * 60 * 60 * 1000;
};

const isNew = (date: string) => Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;

export const ForumThreadCard = ({ consultation: c, viewCount, rank }: ForumThreadCardProps) => {
  const updated = isRecentlyUpdated(c.updatedDate);
  const fresh = isNew(c.date);
  const score = Math.round(viewCount / 10);

  return (
    <div className={cn(
      "group flex items-stretch rounded-xl border border-border/60 bg-card overflow-hidden transition-colors duration-150",
      "border-l-2 border-l-transparent hover:border-l-primary"
    )}>
      {/* Rank + Vote column */}
      <div className="hidden sm:flex flex-col items-center justify-center gap-0.5 px-2.5 py-2 bg-muted/30 border-r border-border/40">
        {rank != null && (
          <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
            {rank}
          </span>
        )}
        <VoteButton id={c.id} score={score} />
      </div>

      {/* Content */}
      <Link
        to={`/ai-consultations/${c.slug}`}
        className="flex-1 min-w-0 p-3 sm:p-4 space-y-1.5"
      >
        {/* Title + flairs */}
        <div className="flex items-start gap-2">
          <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 leading-snug">
            {c.question}
          </h2>
          <div className="flex gap-1 shrink-0">
            {fresh && <Badge variant="info" size="sm">Нове</Badge>}
            {updated && (
              <Badge variant="warning" size="sm" className="gap-0.5">
                <RefreshCw className="w-2.5 h-2.5" />
                Оновлено
              </Badge>
            )}
          </div>
        </div>

        {/* Answer preview */}
        <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">
          {stripMarkdown(c.answer).slice(0, 120)}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
          <span className="font-medium text-foreground/70">FINTODO AI</span>
          <span>·</span>
          <span>{timeAgo(c.updatedDate || c.date)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5">
            {c.audience === "business" ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />}
            {c.audience === "business" ? "Бізнес" : "Фізособи"}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-0.5">
            <MessageSquare className="w-3 h-3" />
            {c.followUpCount}
          </span>
          {/* Tags as inline flairs (max 2) */}
          {c.tags.slice(0, 2).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-0.5">
              {t}
            </Badge>
          ))}
          {/* Mobile interactive vote */}
          <span className="sm:hidden ml-auto" onClick={(e) => e.preventDefault()}>
            <VoteButton id={c.id} score={score} direction="horizontal" />
          </span>
        </div>
      </Link>
    </div>
  );
};
