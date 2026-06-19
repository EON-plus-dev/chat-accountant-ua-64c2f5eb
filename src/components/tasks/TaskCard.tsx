/**
 * TaskCard Component
 * 
 * Displays a single task with status, priority, assignee, and quick actions.
 */

import { useState } from "react";
import { 
  CheckCircle2, Circle, Clock, MoreHorizontal, 
  Play, Trash2, RotateCcw, FileText, AtSign, 
  Calendar, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { uk } from "date-fns/locale";
import type { Task } from "@/config/tasksConfig";
import { taskPriorityConfig, taskStatusConfig, taskSourceConfig } from "@/config/tasksConfig";

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onStart?: (taskId: string) => void;
  onReopen?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onNavigateToDocument?: (documentId: string) => void;
  compact?: boolean;
  className?: string;
}

export const TaskCard = ({
  task,
  onComplete,
  onStart,
  onReopen,
  onDelete,
  onEdit,
  onNavigateToDocument,
  compact = false,
  className,
}: TaskCardProps) => {
  const priorityConfig = taskPriorityConfig[task.priority];
  const statusConfig = taskStatusConfig[task.status];
  const sourceConfig = taskSourceConfig[task.sourceType];
  
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && 
    task.status !== "done" && task.status !== "cancelled";
  
  const isDone = task.status === "done";
  const isCancelled = task.status === "cancelled";
  
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };
  
  const handleCheckboxClick = () => {
    if (isDone) {
      onReopen?.(task.id);
    } else {
      onComplete?.(task.id);
    }
  };
  
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors flex-wrap",
        (isDone || isCancelled) && "opacity-60",
        className
      )}>
        <button
          onClick={handleCheckboxClick}
          className="flex-shrink-0"
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
          )}
        </button>
        
        <div className="flex-1 min-w-[140px]">
          <p className={cn(
            "text-sm truncate",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
        </div>
        
        {task.sourceType === "mention" && (
          <AtSign className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        )}
        
        {isOverdue && (
          <Badge variant="destructive" className="text-[10px] h-5 flex-shrink-0">
            Прострочено
          </Badge>
        )}
        
        <Badge 
          variant="outline" 
          className={cn("text-[10px] h-5 flex-shrink-0 hidden sm:inline-flex", priorityConfig.color)}
        >
          {priorityConfig.label}
        </Badge>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "rounded-lg border bg-card p-3 space-y-2",
      (isDone || isCancelled) && "opacity-70",
      isOverdue && "border-destructive/50",
      className
    )}>
      {/* Header */}
      <div className="flex items-start gap-2">
        <button
          onClick={handleCheckboxClick}
          className="mt-0.5 flex-shrink-0"
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          
          {task.description && !isDone && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {task.status === "open" && onStart && (
              <DropdownMenuItem onClick={() => onStart(task.id)}>
                <Play className="w-4 h-4 mr-2" />
                Почати роботу
              </DropdownMenuItem>
            )}
            {!isDone && !isCancelled && onComplete && (
              <DropdownMenuItem onClick={() => onComplete(task.id)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Позначити виконаним
              </DropdownMenuItem>
            )}
            {(isDone || isCancelled) && onReopen && (
              <DropdownMenuItem onClick={() => onReopen(task.id)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Відкрити знову
              </DropdownMenuItem>
            )}
            {task.documentId && onNavigateToDocument && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigateToDocument(task.documentId!)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Перейти до документа
                </DropdownMenuItem>
              </>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Видалити
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Meta info */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        {/* Priority */}
        <Badge 
          variant="secondary" 
          className={cn("text-[10px] h-5 gap-1", priorityConfig.bgColor, priorityConfig.color)}
        >
          <priorityConfig.icon className="w-3 h-3" />
          {priorityConfig.label}
        </Badge>
        
        {/* Status */}
        <Badge 
          variant="secondary" 
          className={cn("text-[10px] h-5 gap-1", statusConfig.bgColor, statusConfig.color)}
        >
          {statusConfig.label}
        </Badge>
        
        {/* Source */}
        {task.sourceType === "mention" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] h-5 gap-1">
                  <AtSign className="w-3 h-3" />
                  Згадка
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Створено з @mention коментаря</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Overdue */}
        {isOverdue && (
          <Badge variant="destructive" className="text-[10px] h-5">
            Прострочено
          </Badge>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <div className="flex items-center gap-3">
          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[8px] bg-primary/10">
                {getInitials(task.assigneeName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[100px]">{task.assigneeName}</span>
          </div>
          
          {/* Due date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-destructive"
            )}>
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), "d MMM", { locale: uk })}</span>
            </div>
          )}
        </div>
        
        {/* Document link */}
        {task.documentTitle && (
          <button
            onClick={() => task.documentId && onNavigateToDocument?.(task.documentId)}
            className="flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[120px]"
          >
            <FileText className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{task.documentTitle}</span>
          </button>
        )}
      </div>
    </div>
  );
};
