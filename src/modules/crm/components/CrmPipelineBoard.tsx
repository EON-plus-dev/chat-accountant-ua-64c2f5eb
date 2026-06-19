/**
 * CrmPipelineBoard — універсальний канбан-board воронки.
 *
 * Desktop (≥md): горизонтальний скрол колонок, перетягування @dnd-kit/core,
 *                sticky header колонок, weighted Σ та лічильник.
 * Mobile (xs/sm): одна колонка на екран, swipe між стадіями (use-swipe-navigation),
 *                tap-меню «Перемістити →» замість DnD, FAB.
 *
 * Cabinet-agnostic — приймає preset, дані з useCrmStore.
 */

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useResponsiveContainer } from "@/hooks/useResponsiveContainer";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import type { CrmDeal, CrmPipeline, CrmPreset, CrmStage } from "../types";
import type { TasksPreset } from "@/modules/tasks/types";
// useCrmStore використовується всередині useCrmTasksBridge (Phase 4)
import { useCrmTasksBridge } from "@/modules/integrations/useCrmTasksBridge";
import { useCrmSequencesStore } from "../store/useCrmSequencesStore";
import { getCrmSequences } from "../sequences/sequenceTemplates";
import { quickTaskFromDeal } from "@/modules/integrations/crmTasksBridge";
import { CrmDealCard } from "./CrmDealCard";
import { CrmDealSheet } from "./CrmDealSheet";

interface Props {
  cabinetId: string;
  preset: CrmPreset;
  pipeline?: CrmPipeline;
  /** Phase 4 — preset для модуля Tasks (необхідний для CRM↔Tasks↔AI). */
  tasksPreset: TasksPreset;
}

function formatSum(value: number, currency: string, isRecurring: boolean): string {
  const compact = new Intl.NumberFormat("uk-UA", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  const symbol = currency === "UAH" ? "₴" : currency;
  return `${compact} ${symbol}${isRecurring ? "/міс" : ""}`;
}

// ────────────── Single column (used by both desktop & mobile) ──────────────
function StageColumn({
  stage,
  deals,
  preset,
  draggable,
  onOpen,
  className,
}: {
  stage: CrmStage;
  deals: CrmDeal[];
  preset: CrmPreset;
  draggable: boolean;
  onOpen: (d: CrmDeal) => void;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage:${stage.id}` });

  const sum = deals.reduce((acc, d) => acc + d.value, 0);
  const weighted = deals.reduce((acc, d) => acc + (d.value * d.probability) / 100, 0);
  const currency = deals[0]?.currency ?? "UAH";

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-muted/30 min-h-[300px]",
        isOver && "ring-2 ring-primary/40 bg-primary/5",
        className,
      )}
    >
      <header className="px-3 py-2 border-b bg-card rounded-t-lg sticky top-0 z-10">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("h-2 w-2 rounded-full shrink-0", stage.color)} aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-wide truncate">{stage.label}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] tabular-nums">{deals.length}</Badge>
        </div>
        <div className="flex items-baseline justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>Σ {formatSum(sum, currency, preset.terminology.valueIsRecurring)}</span>
          {!stage.terminal && (
            <span title="Зважена сума за імовірністю">
              ≈ {formatSum(weighted, currency, preset.terminology.valueIsRecurring)}
            </span>
          )}
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div ref={setNodeRef} className="p-2 space-y-2 min-h-[200px]">
          <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            {deals.length === 0 ? (
              <div className="text-center py-6 text-[11px] text-muted-foreground/70">
                Порожньо
              </div>
            ) : (
              deals.map((d) => (
                <CrmDealCardWithAccount
                  key={d.id}
                  deal={d}
                  preset={preset}
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

// Helper to inject account from store
function CrmDealCardWithAccount({
  deal,
  preset,
  draggable,
  onOpen,
}: {
  deal: CrmDeal;
  preset: CrmPreset;
  draggable: boolean;
  onOpen: (d: CrmDeal) => void;
}) {
  // We can't access store directly here without prop drilling; use a Context-like prop
  // For simplicity, AccountResolver is provided via parent through a render-prop pattern (not used here).
  // The board passes account directly via deal renderer below — but for sortable to be lightweight
  // we just look up via window-attached map (set by board). Simpler: pass via a Context.
  return <CrmDealCard deal={deal} preset={preset} draggable={draggable} onOpen={onOpen} />;
}

// ────────────── Mobile single-stage viewer with swipe ──────────────
function MobilePipelineSwipe({
  stages,
  deals,
  preset,
  onOpen,
  onMoveDeal,
}: {
  stages: CrmStage[];
  deals: CrmDeal[];
  preset: CrmPreset;
  onOpen: (d: CrmDeal) => void;
  onMoveDeal: (dealId: string, stageId: string) => void;
}) {
  const [activeStageId, setActiveStageId] = useState(stages[0]?.id ?? "");
  const stageIds = stages.map((s) => s.id);
  const idx = stages.findIndex((s) => s.id === activeStageId);
  const stage = stages[idx];

  const { swipeOffset, isSwiping, handlers } = useSwipeNavigation({
    tabs: stageIds,
    activeTab: activeStageId,
    onTabChange: setActiveStageId,
  });

  if (!stage) return null;
  const stageDeals = deals.filter((d) => d.stageId === stage.id);

  const prev = stages[idx - 1];
  const next = stages[idx + 1];

  return (
    <div className="flex flex-col">
      {/* Stage pager */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!prev}
          onClick={() => prev && setActiveStageId(prev.id)}
          className="h-8 px-2"
          aria-label="Попередня стадія"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className={cn("h-2 w-2 rounded-full", stage.color)} aria-hidden />
          {stage.label}
          <span className="text-muted-foreground tabular-nums">({stageDeals.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!next}
          onClick={() => next && setActiveStageId(next.id)}
          className="h-8 px-2"
          aria-label="Наступна стадія"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stage dots */}
      <div className="flex items-center justify-center gap-1.5 mb-3" role="tablist">
        {stages.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === activeStageId}
            aria-label={s.label}
            onClick={() => setActiveStageId(s.id)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              s.id === activeStageId ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
            )}
          />
        ))}
      </div>

      {/* Swipeable column */}
      <div
        {...handlers}
        className="relative"
        style={{
          transform: isSwiping ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwiping ? "none" : "transform 0.2s ease",
        }}
      >
        <StageColumn
          stage={stage}
          deals={stageDeals}
          preset={preset}
          draggable={false}
          onOpen={(d) => onOpen(d)}
        />
      </div>

      {/* Move-to-stage strip (tap menu) */}
      {stageDeals.length > 0 && (
        <div className="mt-2 text-[10px] text-muted-foreground text-center">
          Тапніть картку → дії перенесення доступні у деталях
        </div>
      )}
    </div>
  );
}

// ────────────── Main Board ──────────────
export function CrmPipelineBoard({ cabinetId, preset, pipeline, tasksPreset }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const responsive = useResponsiveContainer(containerRef);

  // Phase 4 — завжди використовуємо bridge (CRM + Tasks)
  const bridge = useCrmTasksBridge({ cabinetId, crmPreset: preset, tasksPreset });
  const store = bridge.crm;

  const activePipeline = pipeline ?? preset.pipelines.find((p) => p.id === preset.defaultPipelineId) ?? preset.pipelines[0];
  const stages = activePipeline?.stages ?? [];

  const [openDealId, setOpenDealId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const openDeal = useMemo(() => store.deals.find((d) => d.id === openDealId) ?? null, [store.deals, openDealId]);
  const openAccount = openDeal ? store.getAccount(openDeal.accountId) : undefined;
  const openContact = openDeal?.primaryContactId ? store.getContact(openDeal.primaryContactId) : undefined;

  const openLinkedTasks = useMemo(
    () => (openDeal ? bridge.linkedTasks(openDeal.id) : []),
    [bridge, openDeal],
  );
  const openSuggestions = useMemo(
    () => (openDeal ? bridge.getSuggestions(openDeal) : []),
    [bridge, openDeal],
  );

  // Phase 2 — каденції
  const sequences = useMemo(() => getCrmSequences(preset.id), [preset.id]);
  const sequencesStore = useCrmSequencesStore({ cabinetId });
  const openEnrollments = useMemo(
    () => (openDeal ? sequencesStore.getEnrollments(openDeal.id) : []),
    [sequencesStore, openDeal],
  );

  const dealsByStage = useMemo(() => {
    const map = new Map<string, CrmDeal[]>();
    stages.forEach((s) => map.set(s.id, []));
    store.deals
      .filter((d) => d.pipelineId === activePipeline?.id)
      .forEach((d) => {
        if (!map.has(d.stageId)) map.set(d.stageId, []);
        map.get(d.stageId)!.push(d);
      });
    return map;
  }, [store.deals, stages, activePipeline]);

  const totalWeighted = useMemo(() => {
    return Array.from(dealsByStage.values())
      .flat()
      .filter((d) => {
        const s = stages.find((st) => st.id === d.stageId);
        return !s?.terminal;
      })
      .reduce((acc, d) => acc + (d.value * d.probability) / 100, 0);
  }, [dealsByStage, stages]);

  function handleDragStart(e: DragStartEvent) {
    setActiveDragId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over) return;
    const overId = String(over.id);
    let targetStageId: string | null = null;
    if (overId.startsWith("stage:")) {
      targetStageId = overId.slice("stage:".length);
    } else {
      const overDeal = store.deals.find((d) => d.id === overId);
      if (overDeal) targetStageId = overDeal.stageId;
    }
    if (targetStageId) store.moveDealToStage(String(active.id), targetStageId);
  }

  const activeDragDeal = activeDragId ? store.deals.find((d) => d.id === activeDragId) : null;

  if (!activePipeline) {
    return (
      <div ref={containerRef} className="p-6 text-center text-sm text-muted-foreground">
        У пресеті не визначено воронок.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-w-0 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap px-1">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold truncate">{activePipeline.label}</h3>
          <Badge variant="outline" className="text-[10px] tabular-nums">
            {store.deals.filter((d) => d.pipelineId === activePipeline.id).length} {preset.terminology.dealPlural.toLowerCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:inline">
            Зважена воронка: {formatSum(totalWeighted, store.deals[0]?.currency ?? "UAH", preset.terminology.valueIsRecurring)}
          </span>
          {!responsive.isMobile && (
            <Button size="sm" variant="outline" className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1" /> {preset.terminology.deal}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile swipe view */}
      {responsive.isMobile ? (
        <MobilePipelineSwipe
          stages={stages}
          deals={store.deals.filter((d) => d.pipelineId === activePipeline.id)}
          preset={preset}
          onOpen={(d) => setOpenDealId(d.id)}
          onMoveDeal={store.moveDealToStage}
        />
      ) : (
        // Desktop / tablet — horizontal columns with DnD
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragId(null)}
        >
          <div className="overflow-x-auto -mx-1 px-1 pb-2">
            <div
              className="grid gap-3 min-w-fit"
              style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(240px, 1fr))` }}
            >
              {stages.map((s) => (
                <StageColumn
                  key={s.id}
                  stage={s}
                  deals={dealsByStage.get(s.id) ?? []}
                  preset={preset}
                  draggable
                  onOpen={(d) => setOpenDealId(d.id)}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeDragDeal && (
              <div className="w-[240px] rotate-2 opacity-90">
                <CrmDealCard deal={activeDragDeal} preset={preset} draggable={false} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* FAB on mobile */}
      {responsive.isMobile && (
        <Button
          size="lg"
          className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg p-0 z-30"
          aria-label={`Нова ${preset.terminology.deal.toLowerCase()}`}
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      {/* Drill sheet */}
      <CrmDealSheet
        deal={openDeal}
        account={openAccount}
        contact={openContact}
        preset={preset}
        stages={stages}
        isMobile={responsive.isMobile}
        onOpenChange={(open) => !open && setOpenDealId(null)}
        onMoveToStage={(stageId) => {
          if (openDealId) {
            store.moveDealToStage(openDealId, stageId);
            setOpenDealId(null);
          }
        }}
        linkedTasks={openLinkedTasks}
        suggestions={openSuggestions}
        onCreateTaskFromSuggestion={(s) => openDeal && bridge.createTaskFromSuggestion(openDeal, s)}
        onAddManualTask={() => openDeal && bridge.addManualTaskForDeal(openDeal)}
        onRunPlaybook={(trigger) => (openDeal ? bridge.runPlaybookForDeal(openDeal, trigger).length : 0)}
        sequences={sequences}
        enrollments={openEnrollments}
        onEnrollSequence={(seqId) => openDeal && sequencesStore.enroll(openDeal.id, seqId)}
        onExecuteSequenceStep={(enr, step) => {
          if (!openDeal) return;
          // Створюємо задачу для виконання touchpoint
          const account = bridge.crm.getAccount(openDeal.accountId);
          const seed = quickTaskFromDeal(openDeal, account, tasksPreset, {
            title: step.title,
            dueOffsetDays: 0,
            ownerId: openDeal.ownerId,
          });
          bridge.tasks.addTask({
            ...seed,
            description: step.template
              ? `Каденція · ${step.kind}\n\n${step.template}`
              : `Каденція · ${step.kind}`,
            tags: ["sequence", step.kind],
          });
          const seq = sequences.find((s) => s.steps.some((st) => st.id === step.id));
          sequencesStore.markStepCompleted(enr.id, step.id, seq?.steps.length ?? enr.currentStepIdx + 1);
        }}
        onPauseSequence={sequencesStore.pause}
        onResumeSequence={sequencesStore.resume}
        onCancelSequence={sequencesStore.cancel}
      />
    </div>
  );
}

export default CrmPipelineBoard;
