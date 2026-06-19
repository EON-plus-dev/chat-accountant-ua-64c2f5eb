/**
 * TasksList Component
 * 
 * Displays a list of tasks with filtering and grouping.
 */

import { useState, useMemo } from "react";
import { 
  CheckSquare, ListTodo, Play, CheckCircle2, 
  XCircle, Plus, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/config/tasksConfig";
import { TaskCard } from "./TaskCard";

interface TasksListProps {
  tasks: Task[];
  stats: {
    open: number;
    inProgress: number;
    done: number;
    cancelled: number;
    overdue: number;
  };
  onComplete: (taskId: string) => void;
  onStart: (taskId: string) => void;
  onReopen: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onNavigateToDocument?: (documentId: string) => void;
  onCreateTask?: () => void;
  showCreateButton?: boolean;
  compact?: boolean;
  maxHeight?: string;
  className?: string;
}

type TabValue = "all" | "open" | "in_progress" | "done";

export const TasksList = ({
  tasks,
  stats,
  onComplete,
  onStart,
  onReopen,
  onDelete,
  onEdit,
  onNavigateToDocument,
  onCreateTask,
  showCreateButton = true,
  compact = false,
  maxHeight = "400px",
  className,
}: TasksListProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  
  const filteredTasks = useMemo(() => {
    if (activeTab === "all") {
      return tasks.filter(t => t.status !== "cancelled");
    }
    return tasks.filter(t => t.status === activeTab);
  }, [tasks, activeTab]);
  
  const activeTasks = stats.open + stats.inProgress;
  
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <ListTodo className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-semibold">Завдання</h3>
          {activeTasks > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeTasks} активних
            </Badge>
          )}
          {stats.overdue > 0 && (
            <Badge variant="destructive" className="text-xs">
              {stats.overdue} прострочено
            </Badge>
          )}
        </div>
        
        {showCreateButton && onCreateTask && (
          <Button size="sm" variant="outline" onClick={onCreateTask} className="shrink-0">
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Нове</span>
            <span className="sr-only sm:hidden">Нове завдання</span>
          </Button>
        )}
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="w-full grid grid-cols-4 h-auto mb-3">
          <TabsTrigger value="all" className="text-[11px] sm:text-xs gap-1 px-1 sm:px-2 py-1.5 min-w-0">
            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Усі </span>
            <span>({tasks.filter(t => t.status !== "cancelled").length})</span>
          </TabsTrigger>
          <TabsTrigger value="open" className="text-[11px] sm:text-xs gap-1 px-1 sm:px-2 py-1.5 min-w-0">
            <ListTodo className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Відкриті </span>
            <span>({stats.open})</span>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="text-[11px] sm:text-xs gap-1 px-1 sm:px-2 py-1.5 min-w-0">
            <Play className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">В роботі </span>
            <span>({stats.inProgress})</span>
          </TabsTrigger>
          <TabsTrigger value="done" className="text-[11px] sm:text-xs gap-1 px-1 sm:px-2 py-1.5 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Виконані </span>
            <span>({stats.done})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea style={{ maxHeight }} className="sm:pr-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {activeTab === "all" 
                    ? "Завдань поки немає"
                    : activeTab === "open"
                      ? "Немає відкритих завдань"
                      : activeTab === "in_progress"
                        ? "Немає завдань в роботі"
                        : "Немає виконаних завдань"
                  }
                </p>
                {activeTab === "all" && onCreateTask && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={onCreateTask}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Створити завдання
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact={compact}
                    onComplete={onComplete}
                    onStart={onStart}
                    onReopen={onReopen}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onNavigateToDocument={onNavigateToDocument}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
