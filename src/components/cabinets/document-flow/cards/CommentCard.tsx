/**
 * CommentCard - Compact expandable card for document comments
 * Used in horizontal Context Shelf for View mode
 * v2: Added quick actions (Reply, Resolve) and emoji reactions
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, Check, Reply, ChevronDown, ChevronUp, ThumbsUp, Heart, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import type { DocumentComment } from "../viewer/panels/CommentsPanel";

// Reaction type
interface CommentReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

// Available reactions
const AVAILABLE_REACTIONS = ["👍", "❤️", "⚠️", "✅", "👀"];

interface CommentCardProps {
  comment: DocumentComment;
  isHighlighted?: boolean;
  onHover?: (fragmentId: string | null) => void;
  onClick?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  onResolve?: (commentId: string) => void;
  onReact?: (commentId: string, emoji: string) => void;
  className?: string;
}

export const CommentCard = ({
  comment,
  isHighlighted = false,
  onHover,
  onClick,
  onReply,
  onResolve,
  onReact,
  className,
}: CommentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Demo reactions based on comment
  const [reactions, setReactions] = useState<CommentReaction[]>(() => {
    // Generate some demo reactions for variety
    if (comment.id === "comment-1") {
      return [{ emoji: "👍", count: 2, hasReacted: false }];
    }
    if (comment.id === "comment-3") {
      return [
        { emoji: "⚠️", count: 1, hasReacted: true },
        { emoji: "👀", count: 1, hasReacted: false },
      ];
    }
    return [];
  });
  
  const initials = comment.authorInitials || 
    comment.author.split(" ").map(n => n[0]).join("").slice(0, 2);
  
  const repliesCount = comment.replies?.length || 0;
  const hasFragment = !!comment.fragmentText;
  // Always show expand if there's any content to review
  const hasExpandableContent = 
    comment.content.length > 0 || 
    hasFragment || 
    repliesCount > 0 ||
    reactions.length > 0;
  
  const handleReaction = (emoji: string) => {
    setReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji);
      if (existing) {
        if (existing.hasReacted) {
          // Remove reaction
          return prev.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count - 1, hasReacted: false }
              : r
          ).filter(r => r.count > 0);
        } else {
          // Add to existing
          return prev.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count + 1, hasReacted: true }
              : r
          );
        }
      } else {
        // New reaction
        return [...prev, { emoji, count: 1, hasReacted: true }];
      }
    });
    onReact?.(comment.id, emoji);
  };
  
  return (
    <div
      data-comment-card-id={comment.id}
      role="article"
      aria-label={`Коментар від ${comment.author}: ${comment.content.slice(0, 50)}${comment.content.length > 50 ? '...' : ''}`}
      tabIndex={0}
      className={cn(
        // Responsive width for horizontal scroll - wider on mobile for readability
        "w-[280px] sm:w-[240px] shrink-0 snap-center",
        // Flex layout to pin footer
        "flex flex-col",
        // Card styling with overflow protection
        "rounded-lg border bg-card p-3 overflow-hidden",
        // States
        "transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        // Focus state for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        comment.isResolved && "opacity-60 bg-muted/30",
        isHighlighted && "bg-accent/50 shadow-md ring-2 ring-primary/30",
        // Cursor
        "cursor-pointer select-none",
        className
      )}
      style={{
        minHeight: isExpanded ? 180 : 140,
        maxHeight: isExpanded ? 280 : 180,
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={() => comment.fragmentId && onHover?.(comment.fragmentId)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(comment.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(comment.id);
        }
      }}
    >
      {/* Content area - flexible with scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        {/* Fragment quote */}
        {hasFragment && (
          <div className="mb-2 p-2 bg-muted/50 rounded text-xs border-l-2 border-primary/40">
            <p className={cn(
              "italic text-muted-foreground",
              isExpanded ? "line-clamp-2" : "line-clamp-1"
            )}>
              "{comment.fragmentText}"
            </p>
          </div>
        )}
        
        {/* Author row - larger avatar and readable text */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-7 h-7 sm:w-6 sm:h-6">
            <AvatarFallback className="text-[10px] sm:text-[9px] bg-primary/10">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] sm:text-xs font-medium truncate">{comment.author}</p>
            <p className="text-[11px] sm:text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { 
                addSuffix: true, 
                locale: uk 
              })}
            </p>
          </div>
        </div>
        
        {/* Comment content - improved readability */}
        <div className={cn(
          isExpanded && "max-h-[60px] overflow-y-auto"
        )}>
          <p className={cn(
            "text-[13px] sm:text-xs break-words leading-relaxed",
            !isExpanded && "line-clamp-2"
          )}>
            {comment.content}
          </p>
        </div>
        
        {/* Reactions display - limited height when collapsed */}
        {reactions.length > 0 && (
          <div className={cn(
            "flex items-center gap-1 mt-2 flex-wrap",
            !isExpanded && "max-h-[24px] overflow-hidden"
          )}>
            {reactions.map(reaction => (
              <Badge 
                key={reaction.emoji} 
                variant="outline" 
                className={cn(
                  "h-5 px-1.5 text-xs cursor-pointer hover:bg-accent transition-colors",
                  reaction.hasReacted && "bg-primary/10 border-primary/30"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction(reaction.emoji);
                }}
              >
                {reaction.emoji} {reaction.count}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with actions - always visible, improved touch targets */}
      <div className="flex items-center justify-between mt-auto pt-2 shrink-0 border-t border-border/50">
        {/* Quick actions with improved touch targets (min-h-10 = 40px for mobile) */}
        <div className="flex items-center gap-0.5">
          {!comment.isResolved && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground focus-visible:ring-primary rounded-lg"
                aria-label={`Відповісти на коментар від ${comment.author}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onReply?.(comment.id);
                }}
              >
                <Reply className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Відповісти</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[11px] gap-1 text-muted-foreground hover:text-emerald-600 focus-visible:ring-emerald-500 rounded-lg"
                aria-label="Позначити коментар як вирішений"
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve?.(comment.id);
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Вирішити</span>
              </Button>
            </>
          )}
          
        </div>
        
        {/* Status badges and expand */}
        <div className="flex items-center gap-1">
          {comment.isResolved && (
            <Badge 
              variant="secondary" 
              className="text-[9px] h-4 px-1.5 gap-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              <Check className="w-2 h-2" />
              Вирішено
            </Badge>
          )}
          {repliesCount > 0 && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 gap-0.5">
              <Reply className="w-2 h-2" />
              {repliesCount}
            </Badge>
          )}
          
          {hasExpandableContent && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={isExpanded ? "Згорнути коментар" : "Розгорнути коментар"}
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(prev => !prev);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
