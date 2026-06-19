import { useState } from "react";
import { 
  MessageSquare, 
  Send, 
  Edit2, 
  Trash2, 
  Reply,
  MoreHorizontal,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

// Role labels for comments
const roleLabels: Record<string, string> = {
  accountant: "Бухгалтер",
  lawyer: "Юрист",
  director: "Директор",
  hr: "HR",
  manager: "Менеджер",
};

// Get initials from name
const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Comment interface
export interface DocumentComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  replyToId?: string;
  mentions?: string[];
  attachments?: { name: string; url: string }[];
  // Статус "вирішено"
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
}

interface DocumentCommentsSectionProps {
  documentId: string;
  comments: DocumentComment[];
  currentUserId: string;
  currentUserName: string;
  currentUserRole?: string;
  onAddComment: (content: string, replyToId?: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolveComment?: (commentId: string, resolved: boolean) => void;
  className?: string;
}

// Individual Comment Card
const CommentCard = ({ 
  comment, 
  isOwn, 
  onReply, 
  onEdit, 
  onDelete,
  onResolve,
  isReply = false,
}: { 
  comment: DocumentComment; 
  isOwn: boolean;
  onReply: () => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onResolve?: (commentId: string, resolved: boolean) => void;
  isReply?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  // Визначаємо чи це коментар-запит (⚠️) що можна вирішити
  const isResolvableComment = comment.content.includes('⚠️');

  return (
    <div className={cn(
      "flex gap-2 p-3 rounded-lg transition-opacity",
      isOwn ? "bg-primary/5" : "bg-muted/30",
      isReply && "ml-8 border-l-2 border-muted",
      comment.resolved && "opacity-60 bg-green-50/30 dark:bg-green-950/20"
    )}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10">
          {getInitials(comment.authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{comment.authorName}</span>
          {comment.authorRole && (
            <Badge variant="outline" className="text-[10px] py-0">
              {roleLabels[comment.authorRole] || comment.authorRole}
            </Badge>
          )}
          {comment.resolved && (
            <Badge 
              variant="outline" 
              className="text-[10px] py-0 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Вирішено
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { 
              addSuffix: true, 
              locale: uk 
            })}
          </span>
          {comment.editedAt && (
            <span className="text-xs text-muted-foreground italic">
              (редаговано)
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              className="resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                Скасувати
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                Зберегти
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        )}
        
        {!isEditing && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs text-muted-foreground hover:text-primary" 
              onClick={onReply}
            >
              <Reply className="w-3 h-3 mr-1" />
              Відповісти
            </Button>
            
            {/* Кнопка "Вирішено" для запитів уточнення */}
            {!comment.resolved && isResolvableComment && onResolve && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => onResolve(comment.id, true)}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Вирішено
              </Button>
            )}
            
            {/* Кнопка "Повернути" для вже вирішених коментарів */}
            {comment.resolved && onResolve && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onResolve(comment.id, false)}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Повернути
              </Button>
            )}
            
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3.5 h-3.5 mr-2" />
                    Редагувати
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(comment.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Видалити
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const DocumentCommentsSection = ({
  documentId,
  comments,
  currentUserId,
  currentUserName,
  currentUserRole,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveComment,
  className,
}: DocumentCommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim(), replyToId || undefined);
      setNewComment("");
      setReplyToId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const handleReply = (commentId: string) => {
    setReplyToId(commentId);
    setIsExpanded(true);
  };

  // Get parent comments (not replies)
  const parentComments = comments.filter(c => !c.replyToId);
  
  // Get replies for a comment
  const getReplies = (commentId: string) => 
    comments.filter(c => c.replyToId === commentId);

  // Find the comment being replied to
  const replyToComment = replyToId 
    ? comments.find(c => c.id === replyToId) 
    : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Comment Input */}
      <div className="flex gap-2">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10">
            {getInitials(currentUserName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          {replyToComment && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              <Reply className="w-3 h-3" />
              <span>Відповідь для {replyToComment.authorName}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-auto"
                onClick={() => setReplyToId(null)}
              >
                ×
              </Button>
            </div>
          )}
          {isExpanded ? (
            <>
              <Textarea
                placeholder="Додати коментар..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="resize-none"
                autoFocus
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Cmd/Ctrl + Enter для відправки
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setNewComment("");
                      setReplyToId(null);
                      setIsExpanded(false);
                    }}
                  >
                    Скасувати
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSubmit} 
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Надіслати
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground font-normal"
              onClick={() => setIsExpanded(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Додати коментар...
            </Button>
          )}
        </div>
      </div>

      {/* Comments List */}
      {parentComments.length > 0 && (
        <div className="space-y-3">
          {parentComments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <CommentCard
                comment={comment}
                isOwn={comment.authorId === currentUserId}
                onReply={() => handleReply(comment.id)}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                onResolve={onResolveComment}
              />
              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  isOwn={reply.authorId === currentUserId}
                  onReply={() => handleReply(comment.id)}
                  onEdit={onEditComment}
                  onDelete={onDeleteComment}
                  onResolve={onResolveComment}
                  isReply
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {comments.length === 0 && !isExpanded && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Коментарів поки немає
        </div>
      )}
    </div>
  );
};

export default DocumentCommentsSection;
