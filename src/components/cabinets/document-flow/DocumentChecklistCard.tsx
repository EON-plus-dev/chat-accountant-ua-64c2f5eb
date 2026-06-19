import { 
  CheckCircle2, Circle, AlertTriangle, Upload, UserPlus, 
  ExternalLink, Settings, BookOpen, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { DocumentChecklist, ChecklistItem, ChecklistPriority } from "@/types/documentSummary";

interface DocumentChecklistCardProps {
  checklist: DocumentChecklist;
  onAction?: (item: ChecklistItem) => void;
  onItemComplete?: (itemId: string) => void;
  className?: string;
}

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
    default: return BookOpen;
  }
};

const ChecklistItemRow = ({ 
  item, 
  onAction,
  onComplete 
}: { 
  item: ChecklistItem; 
  onAction?: (item: ChecklistItem) => void;
  onComplete?: () => void;
}) => {
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
      // Default demo behavior
      toast({
        title: item.action.label,
        description: `Дія для: ${item.title}`,
      });
    }
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      isDone 
        ? "bg-muted/30 border-transparent" 
        : priorityCfg.bgColor || "border-border/50 hover:border-border"
    )}>
      <button 
        onClick={onComplete}
        className="mt-0.5 shrink-0"
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
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              {priorityCfg.label}
            </Badge>
          )}
        </div>
        <p className={cn(
          "text-xs",
          isDone ? "text-muted-foreground/70" : "text-muted-foreground"
        )}>
          {item.description}
        </p>
      </div>
      
      {!isDone && (
        <Button 
          variant={item.action.type === "auto" ? "ghost" : "outline"} 
          size="sm" 
          className="shrink-0 gap-1.5 h-8"
          onClick={handleAction}
          disabled={item.action.type === "auto"}
        >
          <ActionIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{item.action.label}</span>
        </Button>
      )}
    </div>
  );
};

export function DocumentChecklistCard({ 
  checklist, 
  onAction,
  onItemComplete,
  className 
}: DocumentChecklistCardProps) {
  const pendingItems = checklist.items.filter(i => i.status !== "done");
  const criticalItems = pendingItems.filter(i => i.priority === "critical");
  const otherItems = pendingItems.filter(i => i.priority !== "critical");
  const completedItems = checklist.items.filter(i => i.status === "done");

  const handleComplete = (itemId: string) => {
    if (onItemComplete) {
      onItemComplete(itemId);
    } else {
      toast({
        title: "Виконано",
        description: "Пункт позначено як виконаний",
      });
    }
  };

  return (
    <Card id="document-checklist" className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header with Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Чек-лист</span>
              <span className="text-xs text-muted-foreground">
                {checklist.completedItems} з {checklist.totalItems}
              </span>
            </div>
            <Progress value={checklist.completionPercent} className="h-2" />
          </div>
          {checklist.criticalItems > 0 && (
            <Badge variant="destructive" className="shrink-0">
              {checklist.criticalItems} критичних
            </Badge>
          )}
        </div>

        {/* Critical Items */}
        {criticalItems.length > 0 && (
          <div className="space-y-2">
            {criticalItems.map(item => (
              <ChecklistItemRow 
                key={item.id} 
                item={item} 
                onAction={onAction}
                onComplete={() => handleComplete(item.id)}
              />
            ))}
          </div>
        )}

        {/* Other Pending Items */}
        {otherItems.length > 0 && (
          <div className="space-y-2">
            {criticalItems.length > 0 && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide pt-2">
                Інші завдання
              </p>
            )}
            {otherItems.map(item => (
              <ChecklistItemRow 
                key={item.id} 
                item={item} 
                onAction={onAction}
                onComplete={() => handleComplete(item.id)}
              />
            ))}
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide pt-2">
              Виконано ({completedItems.length})
            </p>
            {completedItems.map(item => (
              <ChecklistItemRow 
                key={item.id} 
                item={item} 
                onAction={onAction}
              />
            ))}
          </div>
        )}

        {/* All completed state */}
        {checklist.completionPercent === 100 && checklist.totalItems > 0 && pendingItems.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Всі пункти виконано
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
