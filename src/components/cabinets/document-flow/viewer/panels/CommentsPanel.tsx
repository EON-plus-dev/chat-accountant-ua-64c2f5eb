/**
 * CommentsPanel - Вкладка "Коментарі" бокової панелі
 * Показує всі коментарі до документа з фільтрами та навігацією
 * 
 * Підтримує @mentions для тегування членів команди
 * Розпізнає action verbs для створення завдань
 */

import { useState, useMemo } from "react";
import { 
  MessageCircle, Check, Filter, ChevronRight,
  User, Reply, Trash2, MoreHorizontal, CheckSquare
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";

import { MentionTextarea, type MentionMember } from "@/components/ui/mention-textarea";
import { parseMentions } from "@/utils/mentionUtils";
import { hasActionVerb, extractTaskFromMention } from "@/config/tasksConfig";
import { CreateTaskDialog, type TaskPrefillData } from "@/components/tasks/CreateTaskDialog";
import { useTasksStore } from "@/hooks/useTasksStore";
import { toast } from "@/hooks/use-toast";

// Import from original panel for type compatibility
import type { DocumentComment } from "@/components/cabinets/document-flow/DocumentCommentsPanel";

// Re-export for consumers
export type { DocumentComment };

// Internal extended type for panel usage
interface CommentWithDisplay {
  id: string;
  content: string;
  author: string;
  authorInitials?: string;
  createdAt: string;
  fragmentId?: string;
  fragmentText?: string;
  replies?: CommentWithDisplay[];
  isResolved?: boolean;
}

type CommentFilter = "all" | "open" | "resolved" | "mine";

interface CommentsPanelProps {
  comments: CommentWithDisplay[];
  currentUserId?: string;
  teamMembers?: MentionMember[]; // Для @mentions автокомпліту
  onAddComment?: (content: string, fragmentId?: string, fragmentText?: string, mentionedUserIds?: string[]) => void;
  onReplyToComment?: (commentId: string, content: string, mentionedUserIds?: string[]) => void;
  onDeleteComment?: (commentId: string) => void;
  onResolveComment?: (commentId: string) => void;
  onScrollToFragment?: (fragmentId: string) => void;
  onMentionClick?: (userId: string) => void;
  pendingFragment?: { id: string; text: string };
  // Task creation context
  cabinetId?: string;
  cabinetName?: string;
  currentUserName?: string;
  documentId?: string;
  documentTitle?: string;
  className?: string;
}

// Role labels for display (used if authorRole is available)
const roleLabels: Record<string, string> = {
  accountant: "Бухгалтер",
  lawyer: "Юрист",
  director: "Директор",
  manager: "Менеджер",
  hr: "HR",
};

export const CommentsPanel = ({
  comments,
  currentUserId = "current-user",
  teamMembers = [],
  onAddComment,
  onReplyToComment,
  onDeleteComment,
  onResolveComment,
  onScrollToFragment,
  onMentionClick,
  pendingFragment,
  cabinetId,
  cabinetName,
  currentUserName,
  documentId,
  documentTitle,
  className,
}: CommentsPanelProps) => {
  const [filter, setFilter] = useState<CommentFilter>("all");
  const [newComment, setNewComment] = useState("");
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyMentionedUserIds, setReplyMentionedUserIds] = useState<string[]>([]);
  
  // Task creation state
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [taskPrefillData, setTaskPrefillData] = useState<TaskPrefillData | null>(null);
  
  // Task store
  const { addTask } = useTasksStore({ cabinetId });
  
  // Detect action verb in comment for task creation prompt
  const showTaskPrompt = useMemo(() => {
    return hasActionVerb(newComment) && mentionedUserIds.length > 0;
  }, [newComment, mentionedUserIds]);
  
  // Handle creating task from mention
  const handleCreateTaskFromMention = () => {
    if (mentionedUserIds.length === 0) return;
    
    const firstMentionedId = mentionedUserIds[0];
    const mentionedMember = teamMembers.find(m => m.userId === firstMentionedId);
    
    if (!mentionedMember) return;
    
    // Extract task data from mention
    const extractedTask = extractTaskFromMention(
      newComment,
      mentionedMember.name,
      mentionedMember.userId,
      {
        documentId,
        documentTitle,
        cabinetId,
        cabinetName,
      }
    );
    
    setTaskPrefillData({
      title: extractedTask?.title || "",
      description: newComment,
      assigneeId: mentionedMember.userId,
      assigneeName: mentionedMember.name,
      sourceType: "mention",
      documentId,
      documentTitle,
      mentionContext: {
        commentContent: newComment,
        mentionedUserName: mentionedMember.name,
      },
    });
    
    setShowCreateTaskDialog(true);
  };
  
  // Handle task submission
  const handleTaskSubmit = (taskData: Omit<import("@/config/tasksConfig").Task, "id" | "createdAt" | "updatedAt">) => {
    addTask(taskData);
    toast({
      title: "Завдання створено",
      description: taskData.title,
    });
    setShowCreateTaskDialog(false);
    setTaskPrefillData(null);
  };
  
  // Підрахунок коментарів для фільтрів
  const openCount = comments.filter(c => !c.isResolved).length;
  const resolvedCount = comments.filter(c => c.isResolved).length;
  const myCount = comments.filter(c => 
    c.author === currentUserId || c.author === "current-user"
  ).length;
  
  // Фільтрація коментарів
  const filteredComments = useMemo(() => {
    switch (filter) {
      case "open":
        return comments.filter(c => !c.isResolved);
      case "resolved":
        return comments.filter(c => c.isResolved);
      case "mine":
        return comments.filter(c => 
          c.author === currentUserId || c.author === "current-user"
        );
      default:
        return comments;
    }
  }, [comments, filter, currentUserId]);
  
  const handleSubmitComment = () => {
    if (!newComment.trim() || !onAddComment) return;
    
    onAddComment(
      newComment.trim(),
      pendingFragment?.id,
      pendingFragment?.text,
      mentionedUserIds
    );
    setNewComment("");
    setMentionedUserIds([]);
  };
  
  const handleSubmitReply = (commentId: string) => {
    if (!replyContent.trim() || !onReplyToComment) return;
    
    onReplyToComment(commentId, replyContent.trim(), replyMentionedUserIds);
    setReplyContent("");
    setReplyMentionedUserIds([]);
    setReplyingTo(null);
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            Коментарі
          </h3>
          <Badge variant="secondary" className="text-xs">
            {openCount} відкритих
          </Badge>
        </div>
        
        {/* Фільтри */}
        <ToggleGroup 
          type="single" 
          value={filter} 
          onValueChange={(v) => v && setFilter(v as CommentFilter)}
          className="w-full justify-start flex-wrap gap-1"
        >
          <ToggleGroupItem value="all" size="sm" className="text-xs h-7 px-2.5">
            Усі ({comments.length})
          </ToggleGroupItem>
          <ToggleGroupItem value="open" size="sm" className="text-xs h-7 px-2.5">
            Відкриті ({openCount})
          </ToggleGroupItem>
          <ToggleGroupItem value="resolved" size="sm" className="text-xs h-7 px-2.5">
            Вирішені ({resolvedCount})
          </ToggleGroupItem>
          <ToggleGroupItem value="mine" size="sm" className="text-xs h-7 px-2.5">
            Мої ({myCount})
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {filteredComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter === "all" 
                  ? "Коментарів поки немає" 
                  : filter === "open"
                    ? "Немає відкритих коментарів"
                    : filter === "resolved"
                      ? "Немає вирішених коментарів"
                      : "Ви ще не додали жодного коментаря"
                }
              </p>
              <p className="text-xs mt-1">
                Виділіть текст у документі, щоб додати коментар
              </p>
            </div>
          ) : (
          filteredComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                teamMembers={teamMembers}
                isReplying={replyingTo === comment.id}
                replyContent={replyContent}
                replyMentionedUserIds={replyMentionedUserIds}
                onReplyChange={(text, mentions) => {
                  setReplyContent(text);
                  setReplyMentionedUserIds(mentions);
                }}
                onStartReply={() => setReplyingTo(comment.id)}
                onCancelReply={() => { 
                  setReplyingTo(null); 
                  setReplyContent(""); 
                  setReplyMentionedUserIds([]);
                }}
                onSubmitReply={() => handleSubmitReply(comment.id)}
                onResolve={() => onResolveComment?.(comment.id)}
                onDelete={() => onDeleteComment?.(comment.id)}
                onScrollToFragment={onScrollToFragment}
                onMentionClick={onMentionClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* New Comment Input */}
      <div className="p-3 border-t bg-muted/30">
        {pendingFragment && (
          <div className="mb-2 p-2 bg-primary/5 border border-primary/20 rounded text-xs">
            <p className="text-muted-foreground mb-1">До фрагменту:</p>
            <p className="italic line-clamp-2">"{pendingFragment.text}"</p>
          </div>
        )}
        
        <MentionTextarea
          value={newComment}
          onChange={(text, mentions) => {
            setNewComment(text);
            setMentionedUserIds(mentions);
          }}
          teamMembers={teamMembers}
          placeholder="Коментар... (@ для згадки)"
          minHeight="60px"
        />
        
        {/* Task creation prompt */}
        {showTaskPrompt && (
          <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg mt-2 border border-indigo-200 dark:border-indigo-800">
            <CheckSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="text-xs text-indigo-700 dark:text-indigo-300 flex-1">
              Схоже на завдання
            </span>
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
              onClick={handleCreateTaskFromMention}
            >
              Створити завдання
            </Button>
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          <Button 
            size="sm" 
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            Додати
          </Button>
        </div>
      </div>
      
      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={showCreateTaskDialog}
        onOpenChange={setShowCreateTaskDialog}
        onSubmit={handleTaskSubmit}
        teamMembers={teamMembers}
        cabinetId={cabinetId}
        cabinetName={cabinetName}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        prefillData={taskPrefillData}
      />
    </div>
  );
};

interface CommentCardProps {
  comment: CommentWithDisplay;
  currentUserId: string;
  teamMembers: MentionMember[];
  isReplying: boolean;
  replyContent: string;
  replyMentionedUserIds: string[];
  onReplyChange: (content: string, mentionedUserIds: string[]) => void;
  onStartReply: () => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  onResolve?: () => void;
  onDelete?: () => void;
  onScrollToFragment?: (fragmentId: string) => void;
  onMentionClick?: (userId: string) => void;
}

const CommentCard = ({
  comment,
  currentUserId,
  teamMembers,
  isReplying,
  replyContent,
  replyMentionedUserIds,
  onReplyChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onResolve,
  onDelete,
  onScrollToFragment,
  onMentionClick,
}: CommentCardProps) => {
  const isOwn = comment.author === "current-user" || comment.author === currentUserId;
  const initials = comment.authorInitials || comment.author.split(" ").map(n => n[0]).join("").slice(0, 2);
  
  // Parse mentions in comment content
  const contentParts = parseMentions(comment.content, teamMembers);
  
  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2",
      comment.isResolved && "bg-muted/30 opacity-75"
    )}>
      {/* Fragment Quote */}
      {comment.fragmentText && (
        <button
          onClick={() => comment.fragmentId && onScrollToFragment?.(comment.fragmentId)}
          className="w-full text-left p-2 bg-muted/50 rounded text-xs border-l-2 border-primary/40 hover:bg-muted transition-colors"
        >
          <p className="line-clamp-2 italic text-muted-foreground">
            "{comment.fragmentText}"
          </p>
        </button>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-[10px] bg-primary/10">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-tight">
              {comment.author}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {comment.isResolved && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              Вирішено
            </Badge>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!comment.isResolved && onResolve && (
                <DropdownMenuItem onClick={onResolve}>
                  <Check className="w-4 h-4 mr-2" />
                  Позначити вирішеним
                </DropdownMenuItem>
              )}
              {isOwn && onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Видалити
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Content with @mentions highlighting */}
      <p className="text-sm">
        {contentParts.map((part, i) => (
          part.isMention ? (
            <span 
              key={i}
              className="text-primary font-medium cursor-pointer hover:underline"
              onClick={() => part.userId && onMentionClick?.(part.userId)}
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        ))}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {formatDistanceToNow(new Date(comment.createdAt), { 
            addSuffix: true, 
            locale: uk 
          })}
        </span>
        
        {!comment.isResolved && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs gap-1"
            onClick={onStartReply}
          >
            <Reply className="w-3 h-3" />
            Відповісти
          </Button>
        )}
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 border-l-2 border-muted space-y-2 mt-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium">{reply.author}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.createdAt), { 
                    addSuffix: true, 
                    locale: uk 
                  })}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Reply Input */}
      {isReplying && (
        <div className="pt-2 space-y-2">
          <MentionTextarea
            value={replyContent}
            onChange={onReplyChange}
            teamMembers={teamMembers}
            placeholder="Ваша відповідь... (@ для згадки)"
            minHeight="50px"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancelReply}>
              Скасувати
            </Button>
            <Button 
              size="sm" 
              onClick={onSubmitReply}
              disabled={!replyContent.trim()}
            >
              Відповісти
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
