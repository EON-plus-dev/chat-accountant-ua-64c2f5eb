/**
 * useWarehouseDocs — стор для InventoryDoc + WriteOffDoc.
 * При confirm — викликає appendStockMoves у useWarehouseStock.
 */

import { useEffect, useMemo, useState } from "react";
import type { WriteOffDoc, InventoryDoc, StockMove } from "../types";
import { appendStockMoves } from "./useWarehouseStock";
import { seedWriteOffsForCabinet, seedInventoriesForCabinet } from "../demo/warehouseSeed";

const KEY_WO = (cId: string) => `warehouse-writeoffs-${cId}`;
const KEY_INV = (cId: string) => `warehouse-inventories-${cId}`;
const EVENT = "warehouse-docs-updated";

function readWO(cId: string): WriteOffDoc[] {
  try {
    const raw = localStorage.getItem(KEY_WO(cId));
    return raw ? (JSON.parse(raw) as WriteOffDoc[]) : [];
  } catch { return []; }
}

function readINV(cId: string): InventoryDoc[] {
  try {
    const raw = localStorage.getItem(KEY_INV(cId));
    return raw ? (JSON.parse(raw) as InventoryDoc[]) : [];
  } catch { return []; }
}

function writeWO(cId: string, list: WriteOffDoc[]) {
  localStorage.setItem(KEY_WO(cId), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId: cId } }));
}

function writeINV(cId: string, list: InventoryDoc[]) {
  localStorage.setItem(KEY_INV(cId), JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId: cId } }));
}

export function useWriteOffs(cabinetId: string): WriteOffDoc[] {
  const [, tick] = useState(0);
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.cabinetId === cabinetId) tick((x) => x + 1);
    };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [cabinetId]);
  return useMemo(() => [...readWO(cabinetId), ...seedWriteOffsForCabinet(cabinetId)], [cabinetId]);
}

export function useInventories(cabinetId: string): InventoryDoc[] {
  const [, tick] = useState(0);
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.cabinetId === cabinetId) tick((x) => x + 1);
    };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [cabinetId]);
  return useMemo(() => [...readINV(cabinetId), ...seedInventoriesForCabinet(cabinetId)], [cabinetId]);
}

export function createWriteOffDoc(cabinetId: string, doc: WriteOffDoc) {
  const list = [doc, ...readWO(cabinetId)];
  writeWO(cabinetId, list);
  if (doc.status === "confirmed") {
    const moves: StockMove[] = doc.lines.map((l, i) => ({
      id: `mv-wo-${doc.id}-${i}`,
      cabinetId,
      productId: l.productId,
      locationId: doc.locationId,
      qty: -Math.abs(l.qty),
      kind: "writeoff",
      refType: "writeoff_doc",
      refId: doc.id,
      date: doc.date,
      notes: l.reason,
    }));
    appendStockMoves(cabinetId, moves);
  }
}

export function createInventoryDoc(cabinetId: string, doc: InventoryDoc) {
  const list = [doc, ...readINV(cabinetId)];
  writeINV(cabinetId, list);
  if (doc.status === "confirmed") {
    const moves: StockMove[] = doc.lines
      .filter((l) => l.countedQty !== l.expectedQty)
      .map((l, i) => ({
        id: `mv-inv-${doc.id}-${i}`,
        cabinetId,
        productId: l.productId,
        locationId: doc.locationId,
        qty: l.countedQty - l.expectedQty,
        kind: "inventory_adj",
        refType: "inventory_doc",
        refId: doc.id,
        date: doc.date,
      }));
    if (moves.length > 0) appendStockMoves(cabinetId, moves);
  }
}
