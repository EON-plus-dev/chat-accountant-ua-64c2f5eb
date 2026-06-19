/**
 * useOrdersStore — єдиний store для Sales + Purchase ордерів.
 * Demo-режим: seed (з `salonOrdersData`) + localStorage overrides/created.
 * Production: edge function з RLS.
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import type { Order, OrderDirection, OrderPolicy } from "../types";
import { DEFAULT_POLICIES } from "../policyEngine";

const KEY = (cabinetId: string) => `orders-${cabinetId}`;
const POLICY_KEY = (cabinetId: string) => `orders-policies-${cabinetId}`;
const EVENT = "orders-updated";

interface OrdersState {
  created: Order[];
  updates: Record<string, Partial<Order>>;
}

const empty: OrdersState = { created: [], updates: {} };

function readState(cabinetId: string): OrdersState {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw);
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updates: parsed.updates && typeof parsed.updates === "object" ? parsed.updates : {},
    };
  } catch {
    return { ...empty };
  }
}

function writeState(cabinetId: string, state: OrdersState) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId } }));
  } catch { /* ignore */ }
}

export function readPolicies(cabinetId: string): OrderPolicy[] {
  try {
    const raw = localStorage.getItem(POLICY_KEY(cabinetId));
    if (!raw) return DEFAULT_POLICIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_POLICIES;
  } catch {
    return DEFAULT_POLICIES;
  }
}

export function writePolicies(cabinetId: string, policies: OrderPolicy[]) {
  try {
    localStorage.setItem(POLICY_KEY(cabinetId), JSON.stringify(policies));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId } }));
  } catch { /* ignore */ }
}

export function createOrder(cabinetId: string, order: Order) {
  const s = readState(cabinetId);
  s.created = [order, ...s.created.filter((o) => o.id !== order.id)];
  writeState(cabinetId, s);
}

export function patchOrder(cabinetId: string, id: string, patch: Partial<Order>) {
  const s = readState(cabinetId);
  const idx = s.created.findIndex((o) => o.id === id);
  if (idx >= 0) s.created[idx] = { ...s.created[idx], ...patch };
  else s.updates[id] = { ...s.updates[id], ...patch };
  writeState(cabinetId, s);
}

interface UseOrdersOpts {
  direction?: OrderDirection;
  /** Seed-функція повертає базовий набір замовлень для кабінету. */
  seed?: (cabinetId: string) => Order[];
}

export function useOrders(cabinetId: string, opts: UseOrdersOpts = {}) {
  const [state, setState] = useState<OrdersState>(() => readState(cabinetId));

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
    const merged = seeded.map((o) =>
      state.updates[o.id] ? { ...o, ...state.updates[o.id] } : o,
    );
    const all = [...state.created, ...merged];
    return opts.direction ? all.filter((o) => o.direction === opts.direction) : all;
  }, [cabinetId, state, opts.seed, opts.direction]);

  const byId = useCallback(
    (id: string) => list.find((o) => o.id === id) ?? null,
    [list],
  );

  return { list, byId };
}
