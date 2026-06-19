import { useState } from "react";
import { 
  CheckCircle2, Circle, AlertTriangle, Upload, UserPlus, 
  ExternalLink, Settings, Clock, FileSignature, Send, 
  CreditCard, Archive, ChevronDown, ChevronUp, Sparkles, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { DocumentChecklist, ChecklistItem, ChecklistPriority, WorkflowPhase } from "@/types/documentSummary";
import type { Document as FlowDocument, DocumentFlowStatus } from "@/config/documentFlowConfig";

// Workflow phase labels
const phaseLabels: Record<WorkflowPhase, string> = {
  'pre-sign': 'До підпису',
  'post-sign': 'Після підпису',
  'post-confirm': 'Після підтвердження',
  'archive': 'Архівація',
};

const priorityConfig: Record<ChecklistPriority, { label: string; color: string; bgColor: string }> = {
  critical: { 
    label: "Критично", 
    color: "text-red-600 dark:text-red-400", 
    bgColor: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800" 
  },
  high: { 
    label: "Високий", 
    color: "text-amber-600 dark:text-amber-400", 
    bgColor: "bg-amber-50/50 dark:bg-amber-950/30" 
  },
  medium: { 
    label: "Середній", 
    color: "text-blue-600 dark:text-blue-400", 
    bgColor: "" 
  },
  low: { 
    label: "Низький", 
    color: "text-muted-foreground", 
    bgColor: "" 
  },
};

const getActionIcon = (type: ChecklistItem["action"]["type"]) => {
  switch (type) {
    case "invite": return UserPlus;
    case "upload": return Upload;
    case "navigate": return ExternalLink;
    case "validate": return Settings;
    case "auto": return Clock;
    default: return Sparkles;
  }
};

// Get primary action based on document status
const getPrimaryAction = (document?: FlowDocument): {
  label: string;
  icon: typeof FileSignature;
  action: "sign" | "send" | "pay" | "archive" | "wait" | null;
  variant: "default" | "outline" | "secondary";
} | null => {
  if (!document) return null;
  
  switch (document.status) {
    case "draft":
    case "pending-sign":
      return { label: "Підписати КЕП", icon: FileSignature, action: "sign", variant: "default" };
    case "signed":
      return { label: "Надіслати контрагенту", icon: Send, action: "send", variant: "default" };
    case "sent":
      return { label: "Очікуємо відповіді", icon: Clock, action: "wait", variant: "secondary" };
    case "confirmed":
      if (document.amount && (!document.paidAmount || document.paidAmount < document.amount)) {
        return { label: "Створити платіж", icon: CreditCard, action: "pay", variant: "default" };
      }
      return { label: "Архівувати", icon: Archive, action: "archive", variant: "outline" };
    case "paid":
      return { label: "Архівувати", icon: Archive, action: "archive", variant: "outline" };
    default:
      return null;
  }
};

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onAction?: (item: ChecklistItem) => void;
  onComplete?: () => void;
}

const ChecklistItemRow = ({ item, onAction, onComplete }: ChecklistItemRowProps) => {
  const isDone = item.status === "done";
  const priorityCfg = priorityConfig[item.priority];
  const ActionIcon = getActionIcon(item.action.type);

  const handleAction = () => {
    if (item.action.type === "auto") {
      toast({
        title: "Автоматична дія",
        description: "Ця дія виконається автоматично при настанні умови",
      });
      return;
    }
    
    if (onAction) {
      onAction(item);
    } else {
      toast({
        title: item.action.label,
        description: `Дія для: ${item.title}`,
      });
    }
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-start gap-3 p-4 sm:p-3 rounded-lg border transition-colors",
      isDone 
        ? "bg-muted/30 border-transparent" 
        : priorityCfg.bgColor || "border-border/50 hover:border-border"
    )}>
      {/* Checkbox + Content Row */}
      <div className="flex items-start gap-3 flex-1">
        <button 
          onClick={onComplete}
          className="mt-0.5 shrink-0 w-8 h-8 sm:w-5 sm:h-5 flex items-center justify-center"
          disabled={isDone || item.action.type === "auto"}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : item.priority === "critical" ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/50" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className={cn(
              "font-medium text-sm",
              isDone && "line-through text-muted-foreground"
            )}>
              {item.title}
            </p>
            {!isDone && item.priority === "critical" && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 sm:h-4">
                {priorityCfg.label}
              </Badge>
            )}
          </div>
          <p className={cn(
            "text-xs leading-relaxed",
            isDone ? "text-muted-foreground/70" : "text-muted-foreground"
          )}>
            {item.description}
          </p>
          {/* SLA Badge */}
          {!isDone && item.dueDate && (
            <Badge variant="outline" className="mt-1.5 text-[10px] gap-1 h-5 w-fit">
              <Calendar className="w-3 h-3" />
              до {format(new Date(item.dueDate), "dd.MM", { locale: uk })}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Action Button - full width on mobile */}
      {!isDone && (
        <Button 
          variant={item.action.type === "auto" ? "ghost" : "outline"} 
          size="sm" 
          className="shrink-0 gap-1.5 h-11 sm:h-8 w-full sm:w-auto justify-center active:scale-[0.98] transition-transform"
          onClick={handleAction}
          disabled={item.action.type === "auto"}
        >
          <ActionIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          {item.action.label}
        </Button>
      )}
    </div>
  );
};

interface ActionCenterProps {
  document?: FlowDocument;
  checklist?: DocumentChecklist;
  isLoading?: boolean;
  onPrimaryAction?: (action: "sign" | "send" | "pay" | "archive") => void;
  onChecklistAction?: (item: ChecklistItem) => void;
  onChecklistItemComplete?: (itemId: string) => void;
  className?: string;
}

// Skeleton component for loading state
export const ActionCenterSkeleton = ({ className }: { className?: string }) => (
  <Card className={cn("overflow-hidden", className)}>
    <CardHeader className="pb-2 sm:pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2.5 sm:h-2 w-full mt-2 rounded-full" />
    </CardHeader>
    
    <CardContent className="space-y-4">
      {/* Primary action skeleton */}
      <Skeleton className="h-12 w-full rounded-md" />
      
      {/* Checklist items skeleton */}
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div 
            key={i}
            className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 sm:p-3 rounded-lg border border-border/50"
          >
            <div className="flex items-start gap-3 flex-1">
              <Skeleton className="w-8 h-8 sm:w-5 sm:h-5 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <Skeleton className="h-11 sm:h-8 w-full sm:w-24 rounded-md" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ActionCenter = ({
  document,
  checklist,
  isLoading,
  onPrimaryAction,
  onChecklistAction,
  onChecklistItemComplete,
  className,
}: ActionCenterProps) => {
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Show skeleton while loading
  if (isLoading) {
    return <ActionCenterSkeleton className={className} />;
  }
  
  // Get primary action based on document status
  const primaryAction = getPrimaryAction(document);
  
  // Filter checklist items
  const pendingItems = checklist?.items.filter(i => i.status !== "done") || [];
  const criticalItems = pendingItems.filter(i => i.priority === "critical");
  const otherItems = pendingItems.filter(i => i.priority !== "critical");
  const completedItems = checklist?.items.filter(i => i.status === "done") || [];
  
  // Group other items by workflow phase
  const groupedByPhase = otherItems.reduce((acc, item) => {
    const phase = item.workflowPhase || 'pre-sign';
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(item);
    return acc;
  }, {} as Record<WorkflowPhase, ChecklistItem[]>);
  
  const hasPendingItems = pendingItems.length > 0;
  const hasChecklist = checklist && checklist.totalItems > 0;
  const isAllComplete = hasChecklist && checklist.completionPercent === 100;
  
  const handleComplete = (itemId: string) => {
    if (onChecklistItemComplete) {
      onChecklistItemComplete(itemId);
    } else {
      toast({
        title: "Виконано",
        description: "Пункт позначено як виконаний",
      });
    }
  };
  
  const handlePrimaryAction = () => {
    if (primaryAction?.action && primaryAction.action !== "wait") {
      onPrimaryAction?.(primaryAction.action);
    }
  };
  
  // Determine card style based on state
  const getCardStyles = () => {
    if (criticalItems.length > 0) {
      return "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20";
    }
    if (isAllComplete) {
      return "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20";
    }
    if (hasPendingItems) {
      return "border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10";
    }
    return "";
  };
  
  return (
    <Card id="action-center" className={cn("overflow-hidden", getCardStyles(), className)}>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "text-sm flex items-center gap-2",
            isAllComplete 
              ? "text-emerald-700 dark:text-emerald-300" 
              : criticalItems.length > 0 
              ? "text-red-700 dark:text-red-300"
              : ""
          )}>
            {isAllComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Необхідні дії
          </CardTitle>
          {hasChecklist && (
            <span className="text-xs text-muted-foreground">
              <span className="sm:hidden">{checklist.completedItems}/{checklist.totalItems}</span>
              <span className="hidden sm:inline">{checklist.completedItems} з {checklist.totalItems}</span>
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        {hasChecklist && (
          <Progress 
            value={checklist.completionPercent} 
            className={cn(
              "h-2.5 sm:h-2 mt-2",
              isAllComplete && "[&>div]:bg-emerald-500"
            )} 
          />
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Action Button */}
        {primaryAction && primaryAction.action !== "wait" && (
          <Button 
            variant={primaryAction.variant}
            size="lg"
            className="w-full gap-2 h-12 active:scale-[0.98] transition-transform"
            onClick={handlePrimaryAction}
          >
            <primaryAction.icon className="w-5 h-5" />
            {primaryAction.label}
          </Button>
        )}
        
        {/* Waiting State */}
        {primaryAction?.action === "wait" && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border min-h-[64px]">
            <Clock className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground animate-pulse shrink-0" />
            <div>
              <p className="font-medium text-sm">{primaryAction.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Контрагент отримав документ і має підписати його
              </p>
            </div>
          </div>
        )}
        
        {/* Critical Items */}
        {criticalItems.length > 0 && (
          <div className="space-y-2">
            {criticalItems.map(item => (
              <ChecklistItemRow 
                key={item.id} 
                item={item} 
                onAction={onChecklistAction}
                onComplete={() => handleComplete(item.id)}
              />
            ))}
          </div>
        )}

        {/* Other Pending Items - grouped by workflow phase */}
        {otherItems.length > 0 && (
          <div className="space-y-3">
            {criticalItems.length > 0 && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide pt-1">
                Інші завдання
              </p>
            )}
            {/* Group items by workflow phase */}
            {Object.entries(groupedByPhase).map(([phase, items]) => (
              <div key={phase} className="space-y-2">
                {items.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide pt-1 flex items-center gap-1.5">
                      {phaseLabels[phase as WorkflowPhase]}
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                        {items.length}
                      </Badge>
                    </p>
                    {items.map(item => (
                      <ChecklistItemRow 
                        key={item.id} 
                        item={item} 
                        onAction={onChecklistAction}
                        onComplete={() => handleComplete(item.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground h-11 sm:h-9 active:scale-[0.98] transition-transform">
                {showCompleted ? (
                  <>Сховати виконані <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Виконано ({completedItems.length}) <ChevronDown className="w-4 h-4" /></>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {completedItems.map(item => (
                <ChecklistItemRow 
                  key={item.id} 
                  item={item} 
                  onAction={onChecklistAction}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* All completed state */}
        {isAllComplete && pendingItems.length === 0 && (
          <div className="flex items-center gap-2 p-4 sm:p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Всі дії виконано
            </span>
          </div>
        )}
        
        {/* No checklist state */}
        {!hasChecklist && !primaryAction && (
          <div className="flex items-center gap-2 p-4 sm:p-3 rounded-lg bg-muted/30">
            <CheckCircle2 className="w-6 h-6 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              Немає необхідних дій
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
