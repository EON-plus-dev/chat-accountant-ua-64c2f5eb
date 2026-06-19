# Universal cabinet modules

Cabinet-agnostic горизонтальні модулі. Кожен працює в будь-якому
кабінеті (ТОВ-SaaS / ТОВ-торгівля / бюро / ФОП / фізособа) через
**presets** і capability-флаги.

## Структура

```
src/modules/
├── capability.ts              # resolveCrmCapability / resolveTasksCapability
├── responsive.ts              # useModuleResponsive — спільний контракт
├── crm/
│   ├── types.ts               # CrmDeal, CrmAccount, CrmPipeline, CrmHealthScore
│   ├── config/crmPresets.ts   # saas | b2b_trade | bureau | personal
│   └── CrmModule.tsx          # точка входу — підбирає preset, рендерить UI
└── tasks/
    ├── types.ts               # UniversalTask, TaskStatusColumn, TasksPlaybook
    ├── config/tasksPresets.ts # dev_team | accounting_firm | sales_ops | personal
    └── TasksModule.tsx        # точка входу — preset → UI (включно з PersonalTasksView)
```

## Як підключити в кабінеті

```tsx
import CrmModule from "@/modules/crm/CrmModule";
import TasksModule from "@/modules/tasks/TasksModule";
import { useCabinetMembers } from "@/hooks/useCabinetMembers";

// у секції операцій кабінету:
<CrmModule cabinet={cabinet} />
<TasksModule cabinet={cabinet} memberCount={members.length} />
```

Module сам визначить, чи показувати UI, який preset застосувати
і чи рендерити мобільний/desktop варіант (через `useModuleResponsive`).

## Roadmap (плановані фази)

- **Фаза 0 (поточна)** — universal types, presets, capability-resolver,
  adapter-обгортки. SaaS-preset = поточний `CrmSection` / `TeamTasksSection`;
  personal-preset = `useTasksStore` + `TasksList`; решта — preview-стаб.
- **Фаза 1** — повний CRM UI: drag-and-drop pipeline, mobile-swipe канбан,
  health-score badge, drill-stack картка угоди, forecast.
- **Фаза 2** — sequences/cadences, email-шаблони, no-code rules.
- **Фаза 3** — Tasks multi-view (Kanban/List/My/Sprint/Timeline/Calendar/Team),
  subtasks, dependencies, comments з @mentions, capacity-планування.
- **Фаза 4** — CRM↔Tasks↔AI↔Notifications інтеграція.
- **Фаза 5** — Polish, a11y, keyboard shortcuts, FAB, swipe-actions.

## Принципи

- **Cabinet-agnostic** — компоненти не знають про конкретний кабінет,
  тільки про preset.
- **Container-driven responsive** — `useModuleResponsive` через
  `useResponsiveContainer`, не window-media-queries.
- **Mobile-first паритет** — для кожного desktop-патерну є mobile-аналог
  (DnD↔tap-menu, sidebar↔bottom-sheet, header-button↔FAB).
- **Drill-stack для cross-entity nav** — `useDrillStack().push(...)`,
  ніколи `navigate()` напряму всередині картки.
- **Дотримання правил пам'яті** — `max-w-6xl`, `UniversalKPICard density="compact"`,
  семантичні токени, AttentionInbox замість per-section alerts.
