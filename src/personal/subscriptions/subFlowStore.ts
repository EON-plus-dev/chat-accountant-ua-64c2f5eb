import { create } from "zustand";

type FlowKind = "cancel" | "changePlan" | null;

interface State {
  kind: FlowKind;
  subscriptionId: string | null;
  cabinetId: string | null;
  open: (kind: Exclude<FlowKind, null>, subscriptionId: string, cabinetId: string) => void;
  close: () => void;
}

export const useSubFlowStore = create<State>((set) => ({
  kind: null,
  subscriptionId: null,
  cabinetId: null,
  open: (kind, subscriptionId, cabinetId) => set({ kind, subscriptionId, cabinetId }),
  close: () => set({ kind: null, subscriptionId: null, cabinetId: null }),
}));
