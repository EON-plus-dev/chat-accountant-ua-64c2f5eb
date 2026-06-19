/**
 * @deprecated Use DocumentAICommandCenter instead.
 * This component is deprecated and will be removed in a future version.
 * 
 * OverviewTasksBlock — Блок "Необхідні дії"
 * 
 * Modernized UX (v4):
 * - Radix UI Checkbox for accessibility (WCAG AA)
 * - Semantic grouping: Required → Recommended → Automatic
 * - Contextual action buttons based on action type
 * - Avatar display for assignees
 * - Priority sort with localStorage persistence
 * - Demo data marking
 */

import { useState, useMemo, useEffect, useCallback, type ReactNode } from "react";
import { 
  ListChecks, Clock, AlertCircle, Lightbulb, ChevronDown, ChevronUp, Beaker, 
  Zap, Check, Search, ExternalLink, Upload, UserPlus, Info, Circle, Lock, CheckCircle2, type LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DocumentTask, TaskPriority, TaskStatus } from "@/config/documentFlowConfig";
import type { DocumentChecklist, ChecklistItem, ChecklistActionType, ActionCategory } from "@/types/documentSummary";

interface OverviewTasksBlockProps {
  tasks?: DocumentTask[];
  checklist?: DocumentChecklist;
  onTaskAction?: (task: DocumentTask | ChecklistItem) => void;
  onTaskComplete?: (taskId: string) => void;
  className?: string;
  maxVisible?: number;
  documentId?: string;
  // Action workflow handlers
  onSignDocument?: () => void;
  onValidateContractor?: () => void;
  onInviteContractor?: () => void;
  onNavigateToRegistration?: () => void;
  // Phase 4-5: External completion state and document status for auto-triggers
  documentStatus?: string;
  externalCompletedTaskIds?: Set<string>;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "text-muted-foreground",
  medium: "text-primary",
  high: "text-warning-foreground",
  critical: "text-destructive",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
  critical: "Критичний",
};

const priorityOrder: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// Action category configuration
const actionCategoryConfig: Record<ActionCategory, {
  label: string;
  icon: LucideIcon;
  badgeClass: string;
  order: number;
}> = {
  required: {
    label: "Обов'язкові",
    icon: AlertCircle,
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
    order: 0,
  },
  recommended: {
    label: "Рекомендовані",
    icon: Lightbulb,
    badgeClass: "border-warning/30 bg-warning/10 text-warning-foreground",
    order: 1,
  },
  automatic: {
    label: "Автоматичні",
    icon: Zap,
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
    order: 2,
  },
};

// Action button configuration
const actionButtonConfig: Record<ChecklistActionType, {
  label: string;
  icon: LucideIcon;
  variant: "default" | "outline" | "ghost";
}> = {
  manual: { label: "Позначити", icon: Check, variant: "outline" },
  auto: { label: "Деталі", icon: Info, variant: "ghost" },
  invite: { label: "Запросити", icon: UserPlus, variant: "default" },
  validate: { label: "Перевірити", icon: Search, variant: "outline" },
  navigate: { label: "Перейти", icon: ExternalLink, variant: "ghost" },
  upload: { label: "Завантажити", icon: Upload, variant: "outline" },
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return dateString;
  }
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// Infer category from task context
const inferCategory = (task: TaskItemProps): ActionCategory => {
  if (task.actionType === "auto") return "automatic";
  if (task.priority === "critical" || task.priority === "high") return "required";
  return "recommended";
};

interface TaskItemProps {
  id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status: TaskStatus | "pending" | "completed";
  assignee?: string;
  dueDate?: string;
  actionCategory?: ActionCategory;
  actionType?: ChecklistActionType;
  onComplete?: () => void;
  onAction?: () => void;
}

const TaskItem = ({
  id,
  title,
  description,
  priority = "medium",
  status,
  assignee,
  dueDate,
  actionType,
  actionCategory,
  onComplete,
  onAction,
}: TaskItemProps) => {
  const isCompleted = status === "completed";
  const isPending = status === "pending";
  const isOverdue = dueDate && new Date(dueDate) < new Date() && !isCompleted;
  const isAutomatic = actionType === "auto";
  const isRecommended = actionCategory === "recommended";

  const ActionIcon = actionType ? actionButtonConfig[actionType].icon : Check;

  // No manual checkboxes - all tasks use status icons only
  // Tasks are completed via action handlers or auto-triggers
  const showCheckbox = false;
  
  // Status icon for required/automatic tasks
  const getStatusIcon = () => {
    if (isCompleted) return CheckCircle2;
    if (isAutomatic) return Lock;
    return Circle;
  };
  const StatusIcon = getStatusIcon();

  return (
    <div className={cn(
      "flex items-start gap-3 p-2.5 rounded-lg transition-colors",
      isCompleted ? "bg-muted/30" : "hover:bg-muted/50"
    )}>
      {/* Checkbox for recommended OR Status icon for required/automatic */}
      {showCheckbox ? (
        <Checkbox
          id={`task-${id}`}
          checked={isCompleted}
          onCheckedChange={() => !isCompleted && onComplete?.()}
          className="mt-0.5"
        />
      ) : (
        <StatusIcon className={cn(
          "w-4 h-4 mt-0.5 shrink-0",
          isCompleted ? "text-success" : isAutomatic ? "text-muted-foreground" : "text-primary"
        )} />
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <label
              htmlFor={`task-${id}`}
              className={cn(
                "text-sm font-medium cursor-pointer",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {title}
            </label>
            
            {/* Meta row */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {assignee && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="text-[8px] bg-muted font-medium">
                      {getInitials(assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{assignee}</span>
                </div>
              )}
              
              {dueDate && (
                <span className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )}>
                  <Clock className="w-3 h-3" />
                  {formatDate(dueDate)}
                  {isOverdue && <AlertCircle className="w-3 h-3" />}
                </span>
              )}
              
              {priority && priority !== "medium" && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1 py-0",
                    priorityColors[priority]
                  )}
                >
                  {priorityLabels[priority]}
                </Badge>
              )}

              {isAutomatic && isCompleted && (
                <span className="text-xs text-success flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Автоматично
                </span>
              )}
            </div>
          </div>
          
          {/* AI Tip */}
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                    <Lightbulb className="w-3.5 h-3.5 text-warning-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Contextual Action button */}
          {isPending && actionType && actionType !== "auto" && onAction && (
            <Button
              variant={actionButtonConfig[actionType].variant}
              size="sm"
              onClick={onAction}
              className="h-7 text-xs shrink-0 gap-1"
            >
              <ActionIcon className="w-3 h-3" />
              {actionButtonConfig[actionType].label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Category group header
const CategoryHeader = ({ 
  category, 
  count 
}: { 
  category: ActionCategory; 
  count: number;
}) => {
  const config = actionCategoryConfig[category];
  const Icon = config.icon;
  
  return (
    <div className="flex items-center gap-2 py-1.5 px-1">
      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 gap-1", config.badgeClass)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
};

// Trigger configuration for automatic tasks
const automaticTaskTriggers: Record<string, string[]> = {
  "demo-5": ["paid", "completed"], // КУДіР completes when document is paid
};

const checkAutomaticTrigger = (taskId: string, docStatus?: string): boolean => {
  if (!docStatus) return false;
  const validStatuses = automaticTaskTriggers[taskId];
  return validStatuses?.includes(docStatus) || false;
};

export const OverviewTasksBlock = ({
  tasks,
  checklist,
  onTaskAction,
  onTaskComplete,
  className,
  maxVisible = 5,
  documentId,
  // Action workflow handlers
  onSignDocument,
  onValidateContractor,
  onInviteContractor,
  onNavigateToRegistration,
  // Phase 4-5: External completion state and document status
  documentStatus,
  externalCompletedTaskIds,
}: OverviewTasksBlockProps) => {
  // localStorage key for persistence
  const storageKey = documentId ? `doc-tasks-${documentId}` : null;
  
  // Initialize from localStorage
  const [localCompletedIds, setLocalCompletedIds] = useState<Set<string>>(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      } catch {
        // Ignore parse errors
      }
    }
    return new Set();
  });
  const [showAll, setShowAll] = useState(false);
  
  // Merge local and external completed IDs (Phase 4)
  const effectiveCompletedIds = useMemo(() => {
    const merged = new Set(localCompletedIds);
    externalCompletedTaskIds?.forEach(id => merged.add(id));
    return merged;
  }, [localCompletedIds, externalCompletedTaskIds]);
  
  // Persist to localStorage when completed tasks change
  useEffect(() => {
    if (storageKey && localCompletedIds.size > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...localCompletedIds]));
      } catch {
        // Ignore storage errors
      }
    }
  }, [storageKey, localCompletedIds]);
  
  // Helper to complete a task with persistence
  const handleCompleteTask = useCallback((taskId: string) => {
    setLocalCompletedIds(prev => new Set([...prev, taskId]));
    onTaskComplete?.(taskId);
  }, [onTaskComplete]);

  // Track if showing demo data
  const isUsingDemoData = !tasks?.length && !checklist?.items?.length;
  
  // Merge tasks from both sources
  const displayTasks = useMemo(() => {
    const result: TaskItemProps[] = [];

    // Add tasks from DocumentTask[]
    if (tasks && tasks.length > 0) {
      tasks.forEach(task => {
        result.push({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: effectiveCompletedIds.has(task.id) ? "completed" : task.status,
          assignee: task.assignee,
          dueDate: task.dueDate,
          actionCategory: "recommended", // Default for legacy tasks
          actionType: "manual",
          onComplete: () => handleCompleteTask(task.id),
          onAction: () => onTaskAction?.(task),
        });
      });
    }

    // Add tasks from checklist if no tasks provided
    if (result.length === 0 && checklist?.items) {
      checklist.items.forEach(item => {
        result.push({
          id: item.id,
          title: item.title || item.id,
          description: item.description,
          status: effectiveCompletedIds.has(item.id) || item.status === "done" ? "completed" : "pending",
          priority: item.priority as TaskPriority || "medium",
          assignee: item.assignee,
          dueDate: item.dueDate,
          actionCategory: item.actionCategory,
          actionType: item.action?.type,
          onComplete: () => handleCompleteTask(item.id),
          onAction: () => onTaskAction?.(item),
        });
      });
    }

    // Demo tasks if nothing provided
    if (result.length === 0) {
      result.push(
        {
          id: "demo-1",
          title: "Підписати документ КЕП",
          description: "Використайте ваш кваліфікований електронний підпис для завершення",
          priority: "critical",
          status: effectiveCompletedIds.has("demo-1") ? "completed" : "pending",
          assignee: "Директор",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          actionCategory: "required",
          actionType: "manual",
          // No onComplete for required tasks - system marks it when action completes
          onAction: onSignDocument,
        },
        {
          id: "demo-2",
          title: "Зареєструвати ПН в ЄРПН",
          description: "Реєстрація податкової накладної в Єдиному реєстрі",
          priority: "high",
          status: effectiveCompletedIds.has("demo-2") ? "completed" : "pending",
          assignee: "Бухгалтер",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          actionCategory: "required",
          actionType: "navigate",
          onAction: onNavigateToRegistration,
        },
        {
          id: "demo-3",
          title: "Перевірити реквізити контрагента",
          description: "Перевірте ЄДРПОУ в реєстрі підприємств",
          priority: "medium",
          status: effectiveCompletedIds.has("demo-3") ? "completed" : "pending",
          assignee: "Бухгалтер",
          actionCategory: "recommended",
          actionType: "validate",
          onComplete: () => handleCompleteTask("demo-3"),
          onAction: onValidateContractor,
        },
        {
          id: "demo-4",
          title: "Погодити з юристом",
          description: "Необхідна візу юриста перед підписанням",
          priority: "medium",
          status: effectiveCompletedIds.has("demo-4") ? "completed" : "pending",
          assignee: "Юрист",
          actionCategory: "recommended",
          actionType: "invite",
          onComplete: () => handleCompleteTask("demo-4"),
          onAction: onInviteContractor,
        },
        {
          id: "demo-5",
          title: "Запис в Книгу обліку доходів",
          description: "Виконується автоматично після підтвердження оплати",
          priority: "low",
          status: effectiveCompletedIds.has("demo-5") ? "completed" : "pending",
          actionCategory: "automatic",
          actionType: "auto",
          onComplete: () => handleCompleteTask("demo-5"),
        },
      );
    }

    return result;
  }, [tasks, checklist, effectiveCompletedIds, onTaskAction, handleCompleteTask, onSignDocument, onValidateContractor, onInviteContractor, onNavigateToRegistration]);

  // Phase 5: Auto-complete automatic tasks when document status triggers
  useEffect(() => {
    if (!documentStatus) return;
    
    // Check each automatic task for trigger conditions
    Object.keys(automaticTaskTriggers).forEach(taskId => {
      if (!effectiveCompletedIds.has(taskId) && checkAutomaticTrigger(taskId, documentStatus)) {
        handleCompleteTask(taskId);
        if (import.meta.env.DEV) console.log(`[Auto] Task "${taskId}" completed due to document status: ${documentStatus}`);
      }
    });
  }, [documentStatus, effectiveCompletedIds, handleCompleteTask]);

  // Group tasks by category
  const groupedTasks = useMemo(() => {
    const groups: Record<ActionCategory, TaskItemProps[]> = {
      required: [],
      recommended: [],
      automatic: [],
    };
    
    // Sort within each group by: completed last, then by priority
    displayTasks.forEach(task => {
      const category = task.actionCategory || inferCategory(task);
      groups[category].push(task);
    });
    
    // Sort each group
    Object.keys(groups).forEach(key => {
      const category = key as ActionCategory;
      groups[category].sort((a, b) => {
        // Completed at the end
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        // Then by priority
        return priorityOrder[a.priority || "medium"] - priorityOrder[b.priority || "medium"];
      });
    });
    
    return groups;
  }, [displayTasks]);

  // Calculate progress
  const completedCount = displayTasks.filter(t => t.status === "completed").length;
  const totalCount = displayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Flatten for visibility control
  const orderedCategories: ActionCategory[] = ["required", "recommended", "automatic"];
  
  // Build visible content with progressive disclosure
  const renderGroupedContent = (): ReactNode => {
    let itemsRendered = 0;
    const content: ReactNode[] = [];
    
    for (const category of orderedCategories) {
      const categoryTasks = groupedTasks[category];
      if (categoryTasks.length === 0) continue;
      
      const remainingSlots = showAll ? Infinity : maxVisible - itemsRendered;
      if (remainingSlots <= 0 && !showAll) break;
      
      const tasksToShow = showAll ? categoryTasks : categoryTasks.slice(0, remainingSlots);
      
      if (tasksToShow.length > 0) {
        content.push(
          <div key={category} className="space-y-1">
            <CategoryHeader category={category} count={categoryTasks.length} />
            {tasksToShow.map(task => (
              <TaskItem key={task.id} {...task} />
            ))}
          </div>
        );
        itemsRendered += tasksToShow.length;
      }
    }
    
    return content;
  };

  const hiddenCount = totalCount - (showAll ? totalCount : Math.min(totalCount, maxVisible));

  return (
    <Card className={cn("overflow-hidden", className)} data-section="checklist">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            Необхідні дії
            {isUsingDemoData && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 border-dashed border-warning text-warning-foreground">
                      <Beaker className="w-3 h-3" />
                      Demo
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Приклад чек-листу для демонстрації</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {completedCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progressPercent}% виконано
          </p>
        </div>
        
        {/* Grouped tasks list */}
        <div className="space-y-3">
          {renderGroupedContent()}
        </div>

        {/* Show more / less */}
        {hiddenCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full justify-center gap-1.5 text-xs h-8"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Згорнути
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Ще {hiddenCount} {hiddenCount === 1 ? 'дія' : hiddenCount < 5 ? 'дії' : 'дій'}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
