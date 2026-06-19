import type { ProcessTemplate } from "../types";

/** Adapter: Tasks playbooks → ProcessTemplate (kind="playbook"). */
export function fromPlaybooks(cabinetId: string): ProcessTemplate[] {
  // TODO Phase 1: read tasksPresets and emit ProcessTemplate per playbook trigger.
  return [];
}
