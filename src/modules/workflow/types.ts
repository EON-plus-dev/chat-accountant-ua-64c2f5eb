/**
 * Workflow Engine — універсальний движок процесів.
 *
 * Консолідує 7 розсіяних джерел workflow:
 *   1. CRM sequences (`useCrmSequencesStore`)
 *   2. Tasks playbooks
 *   3. Proactive nudges (`useProactiveNudges`)
 *   4. Auto-sign rules (`auto_sign_rules`)
 *   5. Action library (`actionLibrary.ts`)
 *   6. CRM↔Tasks bridge triggers
 *   7. AI Notifications config
 *
 * Migration: adapters (read-only) → new processes go through engine → старі джерела
 * поступово переписуються (окремими PR).
 */

export type ProcessKind =
  | "sequence"          // CRM-каденція
  | "playbook"          // Tasks playbook
  | "approval_route"    // Документ → ланцюжок погоджень
  | "nudge"             // Проактивне нагадування
  | "auto_sign"         // Авто-підпис (з обовʼязковим reviewer)
  | "custom";

export type TriggerKind =
  // CRM
  | "deal_created"
  | "deal_stage_changed"
  | "deal_won"
  | "deal_lost"
  // Orders
  | "order_created"
  | "order_confirmed"
  | "fulfillment_completed"
  // Documents
  | "document_uploaded"
  | "document_signed"
  | "approval_required"
  // Tasks
  | "task_overdue"
  | "task_completed"
  // Time
  | "scheduled"
  | "interval"
  // Manual
  | "manual";

export interface ProcessTrigger {
  kind: TriggerKind;
  /** Optional filter expression, e.g. { stage: "negotiation" } */
  filter?: Record<string, unknown>;
}

export type StepKind =
  | "create_task"
  | "send_notification"
  | "request_signature"
  | "request_approval"
  | "send_email"
  | "wait"
  | "ai_action"
  | "webhook";

export interface ProcessStep {
  id: string;
  order: number;
  kind: StepKind;
  label: string;
  config: Record<string, unknown>;
  /** Опц. умова виконання — engine пропускає крок, якщо false */
  condition?: string;
}

export type ProcessState =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled"
  | "failed";

export interface ProcessTemplate {
  id: string;
  cabinetId: string;
  kind: ProcessKind;
  name: string;
  description?: string;
  triggers: ProcessTrigger[];
  steps: ProcessStep[];
  createdAt: string;
  enabled: boolean;
  /** Origin source for migration tracking — звідки прийшов template */
  origin: "engine" | "sequence_adapter" | "playbook_adapter" | "nudge_adapter" | "auto_sign_adapter";
}

export interface ProcessInstance {
  id: string;
  cabinetId: string;
  templateId: string;
  state: ProcessState;
  currentStepId?: string;
  startedAt: string;
  finishedAt?: string;
  /** Context — payload з тригера (dealId, orderId, documentId, ...) */
  context: Record<string, unknown>;
  /** Лог виконання кроків */
  history: ProcessStepExecution[];
}

export interface ProcessStepExecution {
  stepId: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "success" | "skipped" | "failed";
  output?: Record<string, unknown>;
  error?: string;
}

// Re-export approval types from documents module (canonical location is here logically,
// but lives in modules/documents/types.ts to avoid circular deps in Epic 1 ship).
export type { ApprovalRequest, ApprovalStatus, ApprovalStep } from "@/modules/documents/types";
