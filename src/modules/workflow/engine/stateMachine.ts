/**
 * stateMachine — переходи стану ProcessInstance.
 * Чиста функція: (current, event) → next.
 */

import type { ProcessState } from "../types";

export type StateEvent =
  | "start"
  | "pause"
  | "resume"
  | "step_succeeded"
  | "step_failed"
  | "all_steps_done"
  | "cancel";

const TRANSITIONS: Partial<Record<ProcessState, Partial<Record<StateEvent, ProcessState>>>> = {
  draft: { start: "active", cancel: "cancelled" },
  active: {
    pause: "paused",
    step_succeeded: "active",
    step_failed: "failed",
    all_steps_done: "completed",
    cancel: "cancelled",
  },
  paused: { resume: "active", cancel: "cancelled" },
  failed: { resume: "active", cancel: "cancelled" },
};

export function nextState(current: ProcessState, event: StateEvent): ProcessState {
  return TRANSITIONS[current]?.[event] ?? current;
}

export function canTransition(current: ProcessState, event: StateEvent): boolean {
  return !!TRANSITIONS[current]?.[event];
}
