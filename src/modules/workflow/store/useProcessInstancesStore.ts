/**
 * useProcessInstancesStore — активні екземпляри процесів.
 */

import { useEffect, useMemo, useState } from "react";
import type { ProcessInstance, ProcessState } from "../types";

const KEY = (cabinetId: string) => `process-instances-${cabinetId}`;
const EVENT = "process-instances-updated";

function read(cabinetId: string): ProcessInstance[] {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(cabinetId: string, list: ProcessInstance[]) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId } }));
  } catch {/* ignore */}
}

export function createProcessInstance(cabinetId: string, inst: ProcessInstance) {
  const list = read(cabinetId);
  write(cabinetId, [inst, ...list]);
}

export function patchProcessInstance(cabinetId: string, id: string, patch: Partial<ProcessInstance>) {
  const list = read(cabinetId);
  const idx = list.findIndex((i) => i.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch };
    write(cabinetId, list);
  }
}

export function useProcessInstances(cabinetId: string, state?: ProcessState) {
  const [list, setList] = useState<ProcessInstance[]>(() => read(cabinetId));

  useEffect(() => {
    setList(read(cabinetId));
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.cabinetId === cabinetId) setList(read(cabinetId));
    };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [cabinetId]);

  return useMemo(
    () => (state ? list.filter((i) => i.state === state) : list),
    [list, state],
  );
}
