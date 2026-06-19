/**
 * useWarehouseStock — derived store: поточний залишок = Σ StockMove.qty
 * по (productId, locationId). Не зберігаємо як окреме поле — патерн ERP.
 *
 * Seed-логіка: для тенісного кабінету генеруємо початкові «receipt»-руху
 * з salon/tennis-каталогу (stock з seed). Це дозволяє WarehousePage показувати
 * реальні залишки навіть без жодних транзакцій користувача.
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import type { StockMove, StockLocation } from "../types";
import { seedStockMovesForCabinet, seedLocationsForCabinet } from "../demo/warehouseSeed";

const KEY = (cabinetId: string) => `warehouse-moves-${cabinetId}`;
const EVENT = "warehouse-updated";

interface State {
  created: StockMove[];
}

function readState(cabinetId: string): State {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    if (!raw) return { created: [] };
    const p = JSON.parse(raw);
    return { created: Array.isArray(p.created) ? p.created : [] };
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

export function appendStockMoves(cabinetId: string, moves: StockMove[]) {
  if (moves.length === 0) return;
  const s = readState(cabinetId);
  s.created = [...moves, ...s.created];
  writeState(cabinetId, s);
}

export function useWarehouseMoves(cabinetId: string) {
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
    const seeded = seedStockMovesForCabinet(cabinetId);
    return [...state.created, ...seeded].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [cabinetId, state]);

  return list;
}

export function useWarehouseLocations(cabinetId: string): StockLocation[] {
  return useMemo(() => seedLocationsForCabinet(cabinetId), [cabinetId]);
}

/**
 * Мапа залишків по productId (агреговано всі локації).
 * Для розбивки по локаціях — `useStockByLocation`.
 */
export function useWarehouseStockMap(cabinetId: string): Map<string, number> {
  const moves = useWarehouseMoves(cabinetId);
  return useMemo(() => {
    const m = new Map<string, number>();
    for (const mv of moves) {
      m.set(mv.productId, (m.get(mv.productId) ?? 0) + mv.qty);
    }
    return m;
  }, [moves]);
}

export function useStockByLocation(cabinetId: string): Map<string, Map<string, number>> {
  const moves = useWarehouseMoves(cabinetId);
  return useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    for (const mv of moves) {
      if (!m.has(mv.locationId)) m.set(mv.locationId, new Map());
      const inner = m.get(mv.locationId)!;
      inner.set(mv.productId, (inner.get(mv.productId) ?? 0) + mv.qty);
    }
    return m;
  }, [moves]);
}

/** ADU(N днів) — середньоденний витратний рух (shipment/prro_sale/writeoff). */
export function computeAdu(moves: StockMove[], productId: string, days: number): number {
  const cutoff = Date.now() - days * 86_400_000;
  let outflow = 0;
  for (const m of moves) {
    if (m.productId !== productId) continue;
    if (new Date(m.date).getTime() < cutoff) continue;
    if (m.qty < 0 && (m.kind === "shipment" || m.kind === "prro_sale" || m.kind === "writeoff")) {
      outflow += -m.qty;
    }
  }
  return +(outflow / days).toFixed(2);
}

export function useStockActions(cabinetId: string) {
  return useCallback(
    (moves: StockMove[]) => appendStockMoves(cabinetId, moves),
    [cabinetId],
  );
}
