import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getPersonalOrders,
  type PersonalOrder,
} from "./personalOrdersMock";

interface OrdersState {
  /** Додані під час сесії (через checkout / booking) */
  extra: Record<string, PersonalOrder[]>;
  /** Override статусу для оригінальних записів (наприклад cancelled) */
  statusOverride: Record<string, PersonalOrder["status"]>;
  addOrder: (cabinetId: string, order: PersonalOrder) => void;
  cancelOrder: (orderId: string) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      extra: {},
      statusOverride: {},
      addOrder: (cabinetId, order) =>
        set((s) => ({
          extra: {
            ...s.extra,
            [cabinetId]: [order, ...(s.extra[cabinetId] ?? [])],
          },
        })),
      cancelOrder: (orderId) =>
        set((s) => ({ statusOverride: { ...s.statusOverride, [orderId]: "cancelled" } })),
    }),
    { name: "lovable-personal-orders" }
  )
);

export function getMergedPersonalOrders(cabinetId: string): PersonalOrder[] {
  const base = getPersonalOrders(cabinetId);
  const { extra, statusOverride } = useOrdersStore.getState();
  const merged = [...(extra[cabinetId] ?? []), ...base];
  return merged.map((o) => (statusOverride[o.id] ? { ...o, status: statusOverride[o.id] } : o));
}
