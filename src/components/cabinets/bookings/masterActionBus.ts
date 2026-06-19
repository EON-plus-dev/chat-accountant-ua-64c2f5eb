/**
 * masterActionBus — легкий in-memory bus для крос-розділних дій з профілю майстра.
 *
 * Використовується кнопками CTA на `MasterProfilePage`:
 *   - "Переглянути в календарі" → BookingsPage перемикається на таб "calendar"
 *   - "Створити запис"           → BookingsPage відкриває BookingEditorSheet з prefill masterId
 *
 * Sequence: MasterProfilePage.requestMasterAction → CabinetOperationsPage перемикає subtab=bookings →
 * BookingsPage при mount/notify викликає consumePendingAction і виконує дію.
 */

export type MasterAction = {
  kind: "calendar" | "create";
  masterId: string;
  cabinetId: string;
};

let pending: MasterAction | null = null;
const listeners = new Set<() => void>();

export function requestMasterAction(action: MasterAction) {
  pending = action;
  listeners.forEach((l) => l());
}

export function consumePendingAction(cabinetId: string): MasterAction | null {
  if (pending && pending.cabinetId === cabinetId) {
    const a = pending;
    pending = null;
    return a;
  }
  return null;
}

export function peekPendingAction(): MasterAction | null {
  return pending;
}

export function subscribeMasterAction(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
