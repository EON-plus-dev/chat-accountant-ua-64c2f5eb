/**
 * DrillStackProvider — глобальний стек контекстних drill-sheets.
 *
 * Зберігає масив рівнів у стані React + синхронізує з URL (?drill=kind:id,kind:id).
 * Це робить стек:
 *   • shareable (refresh/copy URL відновлює стек),
 *   • compatible зі browser back (зміни search-params потрапляють у history).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import type { DrillKind, DrillLevel } from "./types";

interface DrillStackContextValue {
  stack: DrillLevel[];
  push: (level: DrillLevel) => void;
  pop: () => void;
  popAll: () => void;
  /** Текущий (верхній) рівень або null */
  current: DrillLevel | null;
  /** Глибина стека (для z-index) */
  depth: number;
}

const DrillStackContext = createContext<DrillStackContextValue | null>(null);

const QUERY_KEY = "drill";

function serializeStack(stack: DrillLevel[]): string {
  return stack.map((l) => `${l.kind}:${encodeURIComponent(l.id)}`).join(",");
}

function parseStack(raw: string | null): DrillLevel[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => {
      const [kind, id] = part.split(":");
      if (!kind || !id) return null;
      const k = kind as DrillKind;
      const VALID: DrillKind[] = ["income-record", "contractor", "document", "declaration", "payment", "report", "audit", "workstation", "salon-master", "salon-service", "booking", "client", "order", "personal-order", "subscription", "loyalty-program", "personal-offer"];
      if (!VALID.includes(k)) return null;
      return { kind: k, id: decodeURIComponent(id) } as DrillLevel;
    })
    .filter((x): x is DrillLevel => x !== null);
}

export function DrillStackProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stack, setStack] = useState<DrillLevel[]>(() => parseStack(searchParams.get(QUERY_KEY)));

  // Sync URL → state (back/forward navigation)
  useEffect(() => {
    const next = parseStack(searchParams.get(QUERY_KEY));
    const cur = serializeStack(stack);
    const target = serializeStack(next);
    if (cur !== target) setStack(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const writeStack = useCallback(
    (next: DrillLevel[]) => {
      setStack(next);
      const sp = new URLSearchParams(searchParams);
      if (next.length === 0) sp.delete(QUERY_KEY);
      else sp.set(QUERY_KEY, serializeStack(next));
      setSearchParams(sp, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  const push = useCallback(
    (level: DrillLevel) => {
      // Якщо верхній рівень той самий kind+id — нічого не робимо
      const top = stack[stack.length - 1];
      if (top && top.kind === level.kind && top.id === level.id) return;
      writeStack([...stack, level]);
    },
    [stack, writeStack]
  );

  const pop = useCallback(() => {
    if (stack.length === 0) return;
    writeStack(stack.slice(0, -1));
  }, [stack, writeStack]);

  const popAll = useCallback(() => {
    if (stack.length === 0) return;
    writeStack([]);
  }, [stack, writeStack]);

  const value = useMemo<DrillStackContextValue>(
    () => ({
      stack,
      push,
      pop,
      popAll,
      current: stack[stack.length - 1] ?? null,
      depth: stack.length,
    }),
    [stack, push, pop, popAll]
  );

  return <DrillStackContext.Provider value={value}>{children}</DrillStackContext.Provider>;
}

export function useDrillStack(): DrillStackContextValue {
  const ctx = useContext(DrillStackContext);
  if (!ctx) {
    // Safe fallback — no provider in tree (e.g. isolated story)
    return {
      stack: [],
      push: () => {},
      pop: () => {},
      popAll: () => {},
      current: null,
      depth: 0,
    };
  }
  return ctx;
}
