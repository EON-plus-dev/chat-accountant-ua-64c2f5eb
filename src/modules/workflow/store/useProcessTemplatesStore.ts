/**
 * useProcessTemplatesStore — реєстр шаблонів процесів кабінету.
 * Demo: localStorage. Production: edge.
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import type { ProcessTemplate } from "../types";

const KEY = (cabinetId: string) => `process-templates-${cabinetId}`;
const EVENT = "process-templates-updated";

function read(cabinetId: string): ProcessTemplate[] {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(cabinetId: string, list: ProcessTemplate[]) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId } }));
  } catch {/* ignore */}
}

export function createProcessTemplate(cabinetId: string, tpl: ProcessTemplate) {
  const list = read(cabinetId);
  write(cabinetId, [tpl, ...list.filter((t) => t.id !== tpl.id)]);
}

export function patchProcessTemplate(cabinetId: string, id: string, patch: Partial<ProcessTemplate>) {
  const list = read(cabinetId);
  const idx = list.findIndex((t) => t.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch };
    write(cabinetId, list);
  }
}

export function useProcessTemplates(cabinetId: string) {
  const [list, setList] = useState<ProcessTemplate[]>(() => read(cabinetId));

  useEffect(() => {
    setList(read(cabinetId));
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.cabinetId === cabinetId) setList(read(cabinetId));
    };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [cabinetId]);

  const byTrigger = useCallback(
    (kind: string) => list.filter((t) => t.enabled && t.triggers.some((tr) => tr.kind === kind)),
    [list],
  );

  return useMemo(() => ({ list, byTrigger }), [list, byTrigger]);
}
