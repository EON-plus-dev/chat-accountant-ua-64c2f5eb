import { create } from "zustand";

interface FlowState {
  open: boolean;
  offerId: string | null;
  cabinetId: string | null;
  openFlow: (offerId: string, cabinetId: string) => void;
  close: () => void;
}

export const useBookingFlowStore = create<FlowState>((set) => ({
  open: false,
  offerId: null,
  cabinetId: null,
  openFlow: (offerId, cabinetId) => set({ open: true, offerId, cabinetId }),
  close: () => set({ open: false, offerId: null, cabinetId: null }),
}));
