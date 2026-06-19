import { useState } from "react";
import {
  ListChecks, Users, Clock, CheckCircle2, AlertOctagon, Sparkles, Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { cn } from "@/lib/utils";
import {
  FINTODO_MEMBERS, FINTODO_TASKS, FINTODO_TEAMS, FINTODO_STATUS_COLUMNS,
  FINTODO_PRIORITY_COLORS, FINTODO_EPICS,
  fintodoMemberById, fintodoEpicById, fintodoInitials,
  type FintodoTask,
} from "@/config/demoCabinets/fintodoTasksData";

// ──────────────────────────── KPI ────────────────────────────
const TasksKpi = () => {
  const total = FINTODO_TASKS.length;
  const inProg = FINTODO_TASKS.filter(t => t.status === "in_progress").length;
  const done = FINTODO_TASKS.filter(t => t.status === "done").length;
  const today = "2026-05-26";
  const overdue = FINTODO_TASKS.filter(t => t.status !== "done" && t.deadline < today).length;
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <UniversalKPICard density="compact" title="Усього"      value={total}    icon={ListChecks} />
      <UniversalKPICard density="compact" title="В роботі"    value={inProg}   icon={Clock} />
      <UniversalKPICard density="compact" title="Виконано"    value={done}     icon={CheckCircle2} variant="success" />
      <UniversalKPICard density="compact" title="Прострочено" value={overdue}  icon={AlertOctagon} variant={overdue > 0 ? "danger" : "default"} />
      <UniversalKPICard density="compact" title="Команда"     value={FINTODO_MEMBERS.length} icon={Users} />
    </div>
  );
};

// ──────────────────────────── KANBAN ────────────────────────────
const TaskCard = ({ task, onClick }: { task: FintodoTask; onClick: () => void }) => {
  const m = fintodoMemberById(task.assigneeId)!;
  const TeamIcon = FINTODO_TEAMS[task.team].icon;
  const epic = fintodoEpicById(task.epicId);
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-md border border-border/70 bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all space-y-2"
    >
      <div className="flex items-start gap-2">
        <div className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", FINTODO_TEAMS[task.team].color)} />
        <div className="text-sm leading-snug flex-1 min-w-0">{task.title}</div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar className="h-5 w-5"><AvatarFallback className="text-[10px]">{fintodoInitials(m.name)}</AvatarFallback></Avatar>
          <span className="text-[11px] text-muted-foreground truncate">{m.name.split(" ")[0]}</span>
        </div>
        <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5", FINTODO_PRIORITY_COLORS[task.priority])}>
          {task.priority.toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground gap-2">
        <span className="flex items-center gap-1 min-w-0">
          <TeamIcon className="h-3 w-3 shrink-0" />
          <span className="truncate">{epic ? epic.title : FINTODO_TEAMS[task.team].label}</span>
        </span>
        <span className="tabular-nums shrink-0">{task.deadline.slice(5)}</span>
      </div>
    </button>
  );
};

const TasksKanban = ({ onPick }: { onPick: (t: FintodoTask) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
    {FINTODO_STATUS_COLUMNS.map(col => {
      const items = FINTODO_TASKS.filter(t => t.status === col.id);
      return (
        <div key={col.id} className="rounded-lg bg-muted/30 p-2 min-h-[200px]">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", col.color)} />
              <span className="text-sm font-medium">{col.label}</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1">{items.length}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            {items.map(t => <TaskCard key={t.id} task={t} onClick={() => onPick(t)} />)}
          </div>
        </div>
      );
    })}
  </div>
);

// ──────────────────────────── КОМАНДА ────────────────────────────
const TeamLoad = () => {
  const today = "2026-05-26";
  return (
    <div className="space-y-2">
      {FINTODO_MEMBERS.map(m => {
        const my = FINTODO_TASKS.filter(t => t.assigneeId === m.id);
        const active = my.filter(t => t.status === "in_progress" || t.status === "review").length;
        const overdue = my.filter(t => t.status !== "done" && t.deadline < today).length;
        const load = Math.min(100, active * 25 + overdue * 15);
        const TeamIcon = FINTODO_TEAMS[m.team].icon;
        return (
          <Card key={m.id}>
            <CardContent className="py-3 flex items-center gap-3">
              <Avatar className="h-9 w-9"><AvatarFallback>{fintodoInitials(m.name)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{m.name}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 flex items-center gap-1">
                    <TeamIcon className="h-2.5 w-2.5" />{FINTODO_TEAMS[m.team].label}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{m.contract}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{m.role} • {m.email} • {m.capacityHoursPerWeek}год/тиж</div>
                <div className="mt-2">
                  <Progress value={load} className="h-1.5" />
                </div>
              </div>
              <div className="text-right text-xs shrink-0">
                <div className="font-semibold tabular-nums">{active}</div>
                <div className="text-muted-foreground">активні</div>
                {overdue > 0 && (
                  <div className="text-red-600 dark:text-red-400 mt-1 tabular-nums">{overdue} ⚠</div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ──────────────────────────── ДЕТАЛЬ ────────────────────────────
const TaskDetailSheet = ({ task, onOpenChange }: { task: FintodoTask | null; onOpenChange: (o: boolean) => void }) => (
  <Sheet open={!!task} onOpenChange={onOpenChange}>
    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
      {task && (() => {
        const m = fintodoMemberById(task.assigneeId)!;
        const epic = fintodoEpicById(task.epicId);
        return (
          <>
            <SheetHeader>
              <SheetTitle>{task.title}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-muted-foreground">Статус</div><Badge variant="outline">{FINTODO_STATUS_COLUMNS.find(s => s.id === task.status)?.label}</Badge></div>
                <div><div className="text-xs text-muted-foreground">Пріоритет</div><Badge className={cn("text-[10px]", FINTODO_PRIORITY_COLORS[task.priority])}>{task.priority.toUpperCase()}</Badge></div>
                <div><div className="text-xs text-muted-foreground">Команда</div><div>{FINTODO_TEAMS[task.team].label}</div></div>
                <div><div className="text-xs text-muted-foreground">Дедлайн</div><div className="tabular-nums">{task.deadline}</div></div>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground mb-1">Виконавець</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{fintodoInitials(m.name)}</AvatarFallback></Avatar>
                  <div><div className="text-sm font-medium">{m.name}</div><div className="text-xs text-muted-foreground">{m.role}</div></div>
                </div>
              </div>
              {epic && (
                <div className="rounded-md border bg-violet-50 dark:bg-violet-950/30 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Епік</div>
                  <div className="text-sm font-medium">{epic.title}</div>
                </div>
              )}
              {task.linkedClient && (
                <div className="rounded-md border bg-primary/5 p-3">
                  <div className="text-xs text-muted-foreground mb-1">Пов'язаний клієнт CRM</div>
                  <div className="text-sm font-medium">{task.linkedClient}</div>
                </div>
              )}
              {task.tag && <Badge variant="secondary">{task.tag}</Badge>}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm"><CheckCircle2 className="h-4 w-4 mr-1.5" />Завершити</Button>
                <Button size="sm" variant="secondary"><Sparkles className="h-4 w-4 mr-1.5" />AI: Розбити на підзадачі</Button>
              </div>
            </div>
          </>
        );
      })()}
    </SheetContent>
  </Sheet>
);

// ──────────────────────────── КОРІНЬ ────────────────────────────
const TeamTasksSection = () => {
  const [picked, setPicked] = useState<FintodoTask | null>(null);
  return (
    <div className="px-4 md:px-6 space-y-5 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Команда & Завдання</h2>
          <p className="text-sm text-muted-foreground">
            {FINTODO_TASKS.length} задач • {FINTODO_EPICS.length} епіків • {FINTODO_MEMBERS.length} людей
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary"><Sparkles className="h-4 w-4 mr-1.5" />AI: Підсумок тижня</Button>
          <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Нове завдання</Button>
        </div>
      </div>

      <TasksKpi />

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Дошка</TabsTrigger>
          <TabsTrigger value="team">Команда</TabsTrigger>
          <TabsTrigger value="calendar">Календар</TabsTrigger>
        </TabsList>
        <TabsContent value="board"    className="mt-4"><TasksKanban onPick={setPicked} /></TabsContent>
        <TabsContent value="team"     className="mt-4"><TeamLoad /></TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
            <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
            Календар команди — наступна ітерація.
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <TaskDetailSheet task={picked} onOpenChange={o => !o && setPicked(null)} />
    </div>
  );
};

export default TeamTasksSection;
