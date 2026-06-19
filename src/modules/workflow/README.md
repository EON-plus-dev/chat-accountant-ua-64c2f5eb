# Workflow Engine

Універсальний движок процесів, що консолідує **7 розсіяних джерел workflow**:

| # | Джерело | Поточна локація | Адаптер |
|---|---|---|---|
| 1 | CRM sequences | `src/modules/crm/store/useCrmSequencesStore.ts` | `fromSequences` |
| 2 | Tasks playbooks | `src/modules/tasks/...` | `fromPlaybooks` |
| 3 | Proactive nudges | `src/hooks/useProactiveNudges.ts` | `fromProactiveNudges` |
| 4 | Auto-sign rules | `auto_sign_rules` (KEP infra) | `fromAutoSignRules` |
| 5 | Action library | `src/config/actionLibrary.ts` | — (Phase 2) |
| 6 | CRM↔Tasks bridge triggers | `src/modules/integrations/useCrmTasksBridge.ts` | — (Phase 2) |
| 7 | AI Notifications | `src/config/aiNotificationsConfig.ts` | — (Phase 2) |

## Контракт

```ts
ProcessTemplate { id, kind, triggers[], steps[], enabled, origin }
ProcessInstance { templateId, state, currentStepId, context, history[] }
```

- `triggerRegistry.emit(trigger, context)` — універсальна точка входу для CRM/Orders/Documents/Tasks.
- `stepExecutor.executeStep(step, instance)` — виконує крок (create_task / send_notification / request_signature / request_approval / wait / ai_action / webhook).
- `stateMachine.nextState(state, event)` — детерміністичні переходи.

## Міграція без break

1. **Фаза 0 (зараз)** — engine + types + store + adapter-stubs. **Нічого не ламає.**
2. **Фаза 1** — adapters читають existing store і експонують як `ProcessTemplate[]` (read-only).
3. **Фаза 2** — нові процеси створюються через engine напряму; existing UI отримує опційний `[Migrate to engine]` toggle.
4. **Фаза 3** — старі джерела поступово переписуються (окремими PR).

## Інтеграції

- **Document Hub** (Епік 1): `request_approval` step → `createApprovalRequest`.
- **Tasks**: `create_task` step → `useUniversalTasksStore.addTask`.
- **Notifications**: `send_notification` step → `useUserNotifications`.
- **KEP**: `request_signature` step → `kep-sign` edge через `kepBridge`.
- **AttentionInbox**: отримує items з активних `ProcessInstance` (current step = "request_approval" → critical).

## Drill-stack

Додати `kind: "process"` у `DrillKind` (Phase 2) для відкриття `ProcessInstanceSheet` з історією кроків.
