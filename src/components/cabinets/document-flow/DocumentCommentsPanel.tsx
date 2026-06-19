import { useState } from "react";
import { 
  MessageSquarePlus, 
  MessageCircle, 
  Reply, 
  Trash2,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface DocumentComment {
  id: string;
  content: string;
  author: string;
  authorInitials?: string;
  createdAt: string;
  fragmentId?: string;
  fragmentText?: string;
  replies?: DocumentComment[];
  isResolved?: boolean;
  mentionedUserIds?: string[];
}

interface DocumentCommentsPanelProps {
  comments: DocumentComment[];
  onAddComment: (content: string, fragmentId?: string, fragmentText?: string) => void;
  onReplyToComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onResolveComment?: (commentId: string) => void;
  onScrollToFragment?: (fragmentId: string) => void;
  className?: string;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Щойно";
  if (diffMins < 60) return `${diffMins} хв. тому`;
  if (diffHours < 24) return `${diffHours} год. тому`;
  if (diffDays < 7) return `${diffDays} дн. тому`;
  
  return date.toLocaleDateString("uk-UA");
};

interface CommentCardProps {
  comment: DocumentComment;
  onReply?: (content: string) => void;
  onDelete?: () => void;
  onResolve?: () => void;
  onScrollToFragment?: () => void;
}

const CommentCard = ({ 
  comment, 
  onReply, 
  onDelete, 
  onResolve,
  onScrollToFragment,
}: CommentCardProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    }
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border bg-card",
      comment.isResolved && "opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {comment.authorInitials || comment.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs font-medium">{comment.author}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {formatRelativeTime(comment.createdAt)}
            </div>
          </div>
        </div>
        
        {comment.isResolved && (
          <Badge variant="secondary" className="text-[10px]">
            Вирішено
          </Badge>
        )}
      </div>

      {/* Fragment Reference */}
      {comment.fragmentText && (
        <button
          onClick={onScrollToFragment}
          className="w-full mb-2 p-2 rounded bg-muted/50 border-l-2 border-primary/50 text-left hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
            <MapPin className="w-2.5 h-2.5" />
            Прив'язано до фрагмента
          </div>
          <p className="text-xs text-foreground/70 line-clamp-2 italic">
            "{comment.fragmentText}"
          </p>
        </button>
      )}

      {/* Content */}
      <p className="text-sm text-foreground/90 mb-2">
        {comment.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {onReply && !comment.isResolved && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setIsReplying(!isReplying)}
          >
            <Reply className="w-3 h-3" />
            Відповісти
          </Button>
        )}
        {onResolve && !comment.isResolved && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 text-muted-foreground hover:text-emerald-600"
            onClick={onResolve}
          >
            ✓ Вирішено
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 text-muted-foreground hover:text-destructive ml-auto"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-2 pt-2 border-t space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Напишіть відповідь..."
            className="min-h-[60px] text-sm resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsReplying(false);
                setReplyContent("");
              }}
            >
              Скасувати
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitReply}
              disabled={!replyContent.trim()}
            >
              Відповісти
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pt-2 border-t space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="pl-3 border-l-2 border-muted">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium">{reply.author}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(reply.createdAt)}
                </span>
              </div>
              <p className="text-xs text-foreground/80">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentCommentsPanel = ({
  comments,
  onAddComment,
  onReplyToComment,
  onDeleteComment,
  onResolveComment,
  onScrollToFragment,
  className,
}: DocumentCommentsPanelProps) => {
  const [newComment, setNewComment] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
      setIsAdding(false);
    }
  };

  const activeComments = comments.filter(c => !c.isResolved);
  const resolvedComments = comments.filter(c => c.isResolved);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Коментарі</span>
          {comments.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeComments.length}
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setIsAdding(true)}
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Додати
        </Button>
      </div>

      {/* New Comment Form */}
      {isAdding && (
        <div className="p-3 border-b bg-muted/30 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишіть коментар до документа..."
            className="min-h-[80px] text-sm resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewComment("");
              }}
            >
              Скасувати
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim()}
            >
              Додати коментар
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {comments.length === 0 && !isAdding ? (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Немає коментарів
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Виділіть текст у документі або натисніть "Додати"
              </p>
            </div>
          ) : (
            <>
              {/* Active Comments */}
              {activeComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={onReplyToComment ? (content) => onReplyToComment(comment.id, content) : undefined}
                  onDelete={onDeleteComment ? () => onDeleteComment(comment.id) : undefined}
                  onResolve={onResolveComment ? () => onResolveComment(comment.id) : undefined}
                  onScrollToFragment={comment.fragmentId && onScrollToFragment ? () => onScrollToFragment(comment.fragmentId!) : undefined}
                />
              ))}

              {/* Resolved Comments */}
              {resolvedComments.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground px-1">
                    Вирішені ({resolvedComments.length})
                  </p>
                  {resolvedComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onDelete={onDeleteComment ? () => onDeleteComment(comment.id) : undefined}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
