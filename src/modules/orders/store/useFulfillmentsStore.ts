/**
 * Fulfillment store — Receipt (PO→GRN) і Shipment (SO→DN).
 * Demo: localStorage. Production: edge з посиланням на warehouse moves.
 */

import { useEffect, useMemo, useState } from "react";
import type { Fulfillment } from "../types";

const KEY = (cabinetId: string) => `fulfillments-${cabinetId}`;
const EVENT = "fulfillments-updated";

interface State {
  created: Fulfillment[];
}

function readState(cabinetId: string): State {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    if (!raw) return { created: [] };
    const parsed = JSON.parse(raw);
    return { created: Array.isArray(parsed.created) ? parsed.created : [] };
  } catch {
    return { created: [] };
  }
}

function writeState(cabinetId: string, state: State) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId } }));
  } catch { /* ignore */ }
}

export function createFulfillment(cabinetId: string, f: Fulfillment) {
  const s = readState(cabinetId);
  s.created = [f, ...s.created.filter((x) => x.id !== f.id)];
  writeState(cabinetId, s);
}

interface UseFulfillmentsOpts {
  seed?: (cabinetId: string) => Fulfillment[];
}

export function useFulfillments(cabinetId: string, opts: UseFulfillmentsOpts = {}) {
  const [state, setState] = useState<State>(() => readState(cabinetId));

  useEffect(() => {
    setState(readState(cabinetId));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.cabinetId === cabinetId) setState(readState(cabinetId));
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [cabinetId]);

  const list = useMemo(() => {
    const seeded = opts.seed?.(cabinetId) ?? [];
    return [...state.created, ...seeded];
  }, [cabinetId, state, opts.seed]);

  return { list, byOrderId: (orderId: string) => list.filter((f) => f.orderId === orderId) };
}
