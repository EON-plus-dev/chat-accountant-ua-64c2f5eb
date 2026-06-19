import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SubStatusOverride = "cancelled" | "paused" | "active";

interface SubsState {
  statusOverride: Record<string, SubStatusOverride>;
  planOverride: Record<string, string>;
  cancel: (id: string) => void;
  pause: (id: string) => void;
  resume: (id: string) => void;
  changePlan: (id: string, planName: string) => void;
}

export const useSubsStore = create<SubsState>()(
  persist(
    (set) => ({
      statusOverride: {},
      planOverride: {},
      cancel: (id) =>
        set((s) => ({ statusOverride: { ...s.statusOverride, [id]: "cancelled" } })),
      pause: (id) =>
        set((s) => ({ statusOverride: { ...s.statusOverride, [id]: "paused" } })),
      resume: (id) =>
        set((s) => ({ statusOverride: { ...s.statusOverride, [id]: "active" } })),
      changePlan: (id, planName) =>
        set((s) => ({ planOverride: { ...s.planOverride, [id]: planName } })),
    }),
    { name: "lovable-personal-subscriptions" }
  )
);
