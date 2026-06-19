/**
 * TasksModule — універсальна точка входу для Команда & Завдання
 * у будь-якому кабінеті.
 *
 * Адаптер:
 *   1. Resolve-ить capability через `resolveTasksCapability(cabinet, { memberCount })`.
 *   2. Обирає preset (dev_team / accounting_firm / sales_ops / personal).
 *   3. Для dev_team — рендерить існуючий `TeamTasksSection` (Fintodo UI).
 *   4. Для personal — рендерить спрощений `PersonalTasksView` через існуючий
 *      `useTasksStore` + `TasksList` (без swimlanes, без team-load).
 *   5. Для інших пресетів — preview-стаб.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { resolveTasksCapability } from "../capability";
import { getTasksPreset } from "./config/tasksPresets";
import TeamTasksSection from "@/components/cabinets/team-tasks/TeamTasksSection";
import { useTasksStore } from "@/hooks/useTasksStore";
import { TasksList } from "@/components/tasks/TasksList";
import UniversalTasksBoard from "./components/UniversalTasksBoard";

interface TasksModuleProps {
  cabinet: Cabinet | null | undefined;
  memberCount?: number;
}

// ──────────────────────────── Personal view ────────────────────────────
const PersonalTasksView = ({ cabinetId, title, subtitle }: { cabinetId: string; title: string; subtitle: string }) => {
  const store = useTasksStore({ cabinetId, persistToLocalStorage: true, initializeWithDemo: true });
  return (
    <div className="px-4 md:px-6 space-y-4 min-w-0 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <TasksList
        tasks={store.tasks}
        stats={store.stats}
        onComplete={store.completeTask}
        onStart={store.startTask}
        onReopen={store.reopenTask}
        onDelete={store.deleteTask}
        maxHeight="calc(100vh - 280px)"
      />
    </div>
  );
};

const TasksModule = ({ cabinet, memberCount }: TasksModuleProps) => {
  const cap = resolveTasksCapability(cabinet, { memberCount });
  const preset = getTasksPreset(cap.presetId);

  if (!cap.enabled || !cabinet) {
    return (
      <div className="px-4 md:px-6">
        <Card>
          <CardContent className="py-8 text-center">
            <ListChecks className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="text-sm font-medium">Модуль завдань недоступний</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dev team (Fintodo та SaaS) — поточний повний UI
  if (preset.id === "dev_team") {
    return <TeamTasksSection />;
  }

  // Personal — спрощений view через useTasksStore + TasksList
  if (preset.id === "personal") {
    return (
      <PersonalTasksView
        cabinetId={cabinet.id}
        title={preset.terminology.moduleTitle}
        subtitle={preset.terminology.moduleSubtitle}
      />
    );
  }

  // Universal board — accounting_firm / sales_ops та будь-який майбутній preset
  return (
    <div className="px-4 md:px-6 space-y-4 min-w-0 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">{preset.terminology.moduleTitle}</h2>
          <p className="text-sm text-muted-foreground">{preset.terminology.moduleSubtitle}</p>
        </div>
        <Badge variant="outline" className="text-[10px] w-fit">Preset: {preset.id}</Badge>
      </div>

      <UniversalTasksBoard cabinetId={cabinet.id} preset={preset} />
    </div>
  );
};

export default TasksModule;

