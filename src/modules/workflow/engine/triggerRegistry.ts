/**
 * triggerRegistry — уніфікований реєстр тригерів процесів.
 * Замінює розсіяні listener'и в bridges/store'ах.
 *
 * Споживачі (CRM/Orders/Documents/Tasks) викликають `emit(trigger, context)`,
 * engine знаходить усі active ProcessTemplates з відповідним тригером і
 * запускає ProcessInstance.
 *
 * Поки що демо: лише registry + emit, без реального dispatch (Phase 2).
 */

import type { ProcessTrigger, TriggerKind } from "../types";

type Listener = (trigger: ProcessTrigger, context: Record<string, unknown>) => void;

const listeners = new Map<TriggerKind, Set<Listener>>();

export function subscribe(kind: TriggerKind, listener: Listener): () => void {
  if (!listeners.has(kind)) listeners.set(kind, new Set());
  listeners.get(kind)!.add(listener);
  return () => listeners.get(kind)?.delete(listener);
}

export function emit(trigger: ProcessTrigger, context: Record<string, unknown> = {}) {
  const set = listeners.get(trigger.kind);
  if (!set) return;
  for (const l of set) l(trigger, context);
}

/** Debug — список усіх зареєстрованих тригерів. */
export function listSubscribedKinds(): TriggerKind[] {
  return Array.from(listeners.keys());
}
