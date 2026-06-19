/**
 * UniversalTasksBoard — головний компонент Tasks-модуля для всіх non-saas
 * пресетів (accounting_firm, sales_ops і будь-який майбутній).
 *
 * Multi-view: Kanban / List / My.
 *  • Desktop (≥md): Kanban — горизонтальні колонки з DnD; List — таблиця.
 *  • Mobile (xs/sm): Kanban — одна колонка на екран зі swipe;
 *                     List — стек карток з infinite scroll.
 *
 * KPI-стрічка зверху, фільтр-чіпи (Мої / Прострочені / High+), FAB на mobile.
 */

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  ChevronLeft,
  ChevronRight,
  KanbanSquare,
  ListChecks,
  Plus,
  User,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useResponsiveContainer } from "@/hooks/useResponsiveContainer";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import type { TasksPreset, UniversalTask, TaskStatusColumn } from "../types";
import { useUniversalTasksStore } from "../store/useUniversalTasksStore";
import { deriveSeedMembers } from "../demo/seedTasks";
import { UniversalTaskCard } from "./UniversalTaskCard";
import { UniversalTaskSheet } from "./UniversalTaskSheet";

interface Props {
  cabinetId: string;
  preset: TasksPreset;
}

// ──────────────────────────── Helpers ────────────────────────────

function priorityIcon(p: UniversalTask["priority"]) {
  if (p === "urgent") return Flame;
  if (p === "high") return AlertTriangle;
  return null;
}

function isOverdue(t: UniversalTask, statuses: TaskStatusColumn[]): boolean {
  if (!t.deadline) return false;
  const terminal = statuses.find((s) => s.id === t.statusId)?.terminal;
  if (terminal) return false;
  return new Date(t.deadline).getTime() < Date.now();
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

// ──────────────────────────── KPI strip ────────────────────────────

function TasksKpiStrip({
  tasks,
  preset,
  isMobile,
}: { tasks: UniversalTask[]; preset: TasksPreset; isMobile: boolean }) {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => {
    const s = preset.statuses.find((ss) => ss.id === t.statusId);
    return s && !s.terminal && s.id !== preset.statuses[0]?.id;
  }).length;
  const overdue = tasks.filter((t) => isOverdue(t, preset.statuses)).length;
  const dueToday = tasks.filter((t) => {
    const d = daysUntil(t.deadline);
    return d !== null && d >= 0 && d === 0 && !preset.statuses.find((s) => s.id === t.statusId)?.terminal;
  }).length;
  const done = tasks.filter((t) => preset.statuses.find((s) => s.id === t.statusId)?.terminal === "done").length;

  const items = [
    { label: "Всього", value: total, tone: "default" as const },
    { label: "В роботі", value: inProgress, tone: "default" as const },
    { label: "Сьогодні", value: dueToday, tone: dueToday > 0 ? "warning" as const : "default" as const },
    { label: "Прострочено", value: overdue, tone: overdue > 0 ? "danger" as const : "default" as const },
    { label: preset.terminology.completeVerb === "Виконати" ? "Виконано" : "Здано", value: done, tone: "success" as const },
  ];

  return (
    <div
      className={cn(
        "grid gap-2",
        isMobile ? "grid-cols-3" : "grid-cols-5",
      )}
    >
      {items.slice(0, isMobile ? 3 : 5).map((k) => (
        <div
          key={k.label}
          className={cn(
            "rounded-lg border bg-card px-3 py-2",
            k.tone === "warning" && "border-amber-500/30 bg-amber-500/5",
            k.tone === "danger" && "border-red-500/30 bg-red-500/5",
            k.tone === "success" && "border-emerald-500/30 bg-emerald-500/5",
          )}
        >
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
          <div className="text-lg font-semibold tabular-nums">{k.value}</div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────── Kanban column ────────────────────────────

function KanbanColumn({
  status,
  tasks,
  membersById,
  draggable,
  onOpen,
  className,
}: {
  status: TaskStatusColumn;
  tasks: UniversalTask[];
  membersById: Map<string, string>;
  draggable: boolean;
  onOpen: (t: UniversalTask) => void;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `tstatus:${status.id}` });
  const wipExceeded = status.wipLimit !== undefined && tasks.length > status.wipLimit;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-muted/30 min-h-[300px]",
        isOver && "ring-2 ring-primary/40 bg-primary/5",
        className,
      )}
    >
      <header className="px-3 py-2 border-b bg-card rounded-t-lg sticky top-0 z-10">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("h-2 w-2 rounded-full shrink-0", status.color)} aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-wide truncate">{status.label}</h3>
          </div>
          <Badge
            variant={wipExceeded ? "destructive" : "outline"}
            className="text-[10px] tabular-nums"
          >
            {tasks.length}{status.wipLimit ? `/${status.wipLimit}` : ""}
          </Badge>
        </div>
        {wipExceeded && (
          <div className="text-[10px] text-destructive">WIP-ліміт перевищено</div>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div ref={setNodeRef} className="p-2 space-y-2 min-h-[200px]">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="text-center py-6 text-[11px] text-muted-foreground/70">Порожньо</div>
            ) : (
              tasks.map((t) => (
                <UniversalTaskCard
                  key={t.id}
                  task={t}
                  assigneeName={t.assigneeId ? membersById.get(t.assigneeId) : undefined}
                  draggable={draggable}
                  onOpen={onOpen}
                />
              ))
            )}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}

// ──────────────────────────── Mobile swipe kanban ────────────────────────────

function MobileKanbanSwipe({
  statuses,
  tasksByStatus,
  membersById,
  onOpen,
}: {
  statuses: TaskStatusColumn[];
  tasksByStatus: Map<string, UniversalTask[]>;
  membersById: Map<string, string>;
  onOpen: (t: UniversalTask) => void;
}) {
  const [activeId, setActiveId] = useState(statuses[0]?.id ?? "");
  const ids = statuses.map((s) => s.id);
  const idx = statuses.findIndex((s) => s.id === activeId);
  const status = statuses[idx];

  const { swipeOffset, isSwiping, handlers } = useSwipeNavigation({
    tabs: ids,
    activeTab: activeId,
    onTabChange: setActiveId,
  });

  if (!status) return null;
  const list = tasksByStatus.get(status.id) ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={idx === 0}
          onClick={() => setActiveId(statuses[idx - 1].id)}
          className="h-8 px-2"
          aria-label="Попередній статус"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className={cn("h-2 w-2 rounded-full", status.color)} aria-hidden />
          {status.label}
          <span className="text-muted-foreground tabular-nums">({list.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={idx === statuses.length - 1}
          onClick={() => setActiveId(statuses[idx + 1].id)}
          className="h-8 px-2"
          aria-label="Наступний статус"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-3" role="tablist">
        {statuses.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === activeId}
            aria-label={s.label}
            onClick={() => setActiveId(s.id)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              s.id === activeId ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
            )}
          />
        ))}
      </div>

      <div
        {...handlers}
        style={{
          transform: isSwiping ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwiping ? "none" : "transform 0.2s ease",
        }}
      >
        <KanbanColumn
          status={status}
          tasks={list}
          membersById={membersById}
          draggable={false}
          onOpen={onOpen}
        />
      </div>
    </div>
  );
}

// ──────────────────────────── List view ────────────────────────────

function TasksListView({
  tasks,
  preset,
  membersById,
  onOpen,
}: {
  tasks: UniversalTask[];
  preset: TasksPreset;
  membersById: Map<string, string>;
  onOpen: (t: UniversalTask) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground border rounded-lg">
        Задач за обраними фільтрами немає
      </div>
    );
  }
  return (
    <ul className="divide-y rounded-lg border bg-card">
      {tasks.map((t) => {
        const status = preset.statuses.find((s) => s.id === t.statusId);
        const PIcon = priorityIcon(t.priority);
        const d = daysUntil(t.deadline);
        const overdue = isOverdue(t, preset.statuses);
        const assignee = t.assigneeId ? membersById.get(t.assigneeId) : undefined;
        return (
          <li
            key={t.id}
            className="px-3 py-2.5 flex items-center gap-3 hover:bg-muted/40 cursor-pointer transition-colors"
            onClick={() => onOpen(t)}
          >
            <span className={cn("h-2 w-2 rounded-full shrink-0", status?.color ?? "bg-muted")} aria-hidden />
            {PIcon && (
              <PIcon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  t.priority === "urgent" && "text-red-600 dark:text-red-400",
                  t.priority === "high" && "text-orange-600 dark:text-orange-400",
                )}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t.title}</div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                {status && <span>{status.label}</span>}
                {assignee && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="truncate">{assignee}</span>
                  </>
                )}
                {t.tags?.slice(0, 2).map((tg) => (
                  <Badge key={tg} variant="secondary" className="text-[10px] px-1.5 py-0 leading-none h-4">{tg}</Badge>
                ))}
              </div>
            </div>
            {t.deadline && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] shrink-0 tabular-nums",
                  overdue && "border-red-500/40 text-red-700 dark:text-red-300",
                  !overdue && d !== null && d <= 2 && "border-amber-500/40 text-amber-700 dark:text-amber-300",
                )}
              >
                {overdue ? `+${Math.abs(d!)}д` : d === 0 ? "Сьогодні" : `${d}д`}
              </Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ──────────────────────────── Main board ────────────────────────────

type ViewId = "kanban" | "list" | "my";

export function UniversalTasksBoard({ cabinetId, preset }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const responsive = useResponsiveContainer(containerRef);

  const store = useUniversalTasksStore({ cabinetId, preset });

  const members = useMemo(() => deriveSeedMembers(store.tasks), [store.tasks]);
  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m.name])), [members]);
  /** Тестова симуляція «я» — перший виконавець у seed, для view "My" */
  const selfId = members[0]?.id ?? null;

  const [view, setView] = useState<ViewId>(() =>
    preset.views.includes("kanban") ? "kanban" : preset.views.includes("list") ? "list" : "my",
  );
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [filterHigh, setFilterHigh] = useState(false);

  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filteredTasks = useMemo(() => {
    return store.tasks.filter((t) => {
      if (view === "my" && selfId && t.assigneeId !== selfId) return false;
      if (filterOverdue && !isOverdue(t, preset.statuses)) return false;
      if (filterHigh && t.priority !== "high" && t.priority !== "urgent") return false;
      return true;
    });
  }, [store.tasks, view, selfId, filterOverdue, filterHigh, preset.statuses]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, UniversalTask[]>();
    preset.statuses.forEach((s) => map.set(s.id, []));
    filteredTasks.forEach((t) => {
      if (!map.has(t.statusId)) map.set(t.statusId, []);
      map.get(t.statusId)!.push(t);
    });
    return map;
  }, [filteredTasks, preset]);

  const openTask = openId ? store.tasks.find((t) => t.id === openId) ?? null : null;
  const activeDrag = dragId ? store.tasks.find((t) => t.id === dragId) ?? null : null;

  function onDragStart(e: DragStartEvent) {
    setDragId(String(e.active.id));
  }
  function onDragEnd(e: DragEndEvent) {
    setDragId(null);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    let targetStatus: string | null = null;
    if (overId.startsWith("tstatus:")) targetStatus = overId.slice("tstatus:".length);
    else {
      const overTask = store.tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.statusId;
    }
    if (targetStatus) store.moveToStatus(String(e.active.id), targetStatus);
  }

  const allowedViews: ViewId[] = (["kanban", "list", "my"] as ViewId[]).filter((v) =>
    preset.views.includes(v),
  );

  return (
    <div ref={containerRef} className="min-w-0 space-y-3">
      <TasksKpiStrip tasks={store.tasks} preset={preset} isMobile={responsive.isMobile} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Tabs value={view} onValueChange={(v) => setView(v as ViewId)}>
          <TabsList className="h-8">
            {allowedViews.includes("kanban") && (
              <TabsTrigger value="kanban" className="text-xs gap-1.5 px-2.5 h-7">
                <KanbanSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Канбан</span>
              </TabsTrigger>
            )}
            {allowedViews.includes("list") && (
              <TabsTrigger value="list" className="text-xs gap-1.5 px-2.5 h-7">
                <ListChecks className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Список</span>
              </TabsTrigger>
            )}
            {allowedViews.includes("my") && (
              <TabsTrigger value="my" className="text-xs gap-1.5 px-2.5 h-7">
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Мої</span>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1.5">
          <Toggle
            size="sm"
            pressed={filterOverdue}
            onPressedChange={setFilterOverdue}
            className="h-7 text-[11px] px-2 data-[state=on]:bg-red-500/15 data-[state=on]:text-red-700 dark:data-[state=on]:text-red-300"
          >
            Прострочені
          </Toggle>
          <Toggle
            size="sm"
            pressed={filterHigh}
            onPressedChange={setFilterHigh}
            className="h-7 text-[11px] px-2 data-[state=on]:bg-orange-500/15 data-[state=on]:text-orange-700 dark:data-[state=on]:text-orange-300"
          >
            High+
          </Toggle>
          {!responsive.isMobile && (
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> {preset.terminology.task}
            </Button>
          )}
        </div>
      </div>

      {/* View */}
      <Tabs value={view} className="m-0">
        <TabsContent value="kanban" className="m-0">
          {responsive.isMobile ? (
            <MobileKanbanSwipe
              statuses={preset.statuses}
              tasksByStatus={tasksByStatus}
              membersById={membersById}
              onOpen={(t) => setOpenId(t.id)}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={() => setDragId(null)}
            >
              <div className="overflow-x-auto -mx-1 px-1 pb-2">
                <div
                  className="grid gap-3 min-w-fit"
                  style={{ gridTemplateColumns: `repeat(${preset.statuses.length}, minmax(240px, 1fr))` }}
                >
                  {preset.statuses.map((s) => (
                    <KanbanColumn
                      key={s.id}
                      status={s}
                      tasks={tasksByStatus.get(s.id) ?? []}
                      membersById={membersById}
                      draggable
                      onOpen={(t) => setOpenId(t.id)}
                    />
                  ))}
                </div>
              </div>
              <DragOverlay>
                {activeDrag && (
                  <div className="w-[240px] rotate-2 opacity-90">
                    <UniversalTaskCard
                      task={activeDrag}
                      assigneeName={activeDrag.assigneeId ? membersById.get(activeDrag.assigneeId) : undefined}
                      draggable={false}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </TabsContent>
        <TabsContent value="list" className="m-0">
          <TasksListView
            tasks={filteredTasks}
            preset={preset}
            membersById={membersById}
            onOpen={(t) => setOpenId(t.id)}
          />
        </TabsContent>
        <TabsContent value="my" className="m-0">
          <TasksListView
            tasks={filteredTasks}
            preset={preset}
            membersById={membersById}
            onOpen={(t) => setOpenId(t.id)}
          />
        </TabsContent>
      </Tabs>

      {responsive.isMobile && (
        <Button
          size="lg"
          className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg p-0 z-30"
          aria-label={`Нова ${preset.terminology.task.toLowerCase()}`}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <UniversalTaskSheet
        task={openTask}
        preset={preset}
        assigneeName={openTask?.assigneeId ? membersById.get(openTask.assigneeId) : undefined}
        isMobile={responsive.isMobile}
        onOpenChange={(open) => !open && setOpenId(null)}
        onMoveToStatus={(statusId) => {
          if (openId) {
            store.moveToStatus(openId, statusId);
            setOpenId(null);
          }
        }}
      />
    </div>
  );
}

export default UniversalTasksBoard;
