/**
 * useEventJournal Hook
 * 
 * Manages dynamic event journal entries for cabinets.
 * Allows adding events at runtime (e.g., @mentions, comments, bookings).
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { JournalEvent } from "@/config/eventJournalConfig";
import { getEventJournalConfig, eventTypeConfig } from "@/config/eventJournalConfig";
import type { CabinetType } from "@/types/cabinet";

const STORAGE_KEY_PREFIX = "eventJournal_";
const BRIDGE_EVENT = "event-journal-updated";

interface UseEventJournalOptions {
  cabinetId: string;
  cabinetType: CabinetType;
  persistToLocalStorage?: boolean;
}

interface UseEventJournalReturn {
  events: JournalEvent[];
  dynamicEvents: JournalEvent[];
  addEvent: (event: JournalEvent) => void;
  addEvents: (events: JournalEvent[]) => void;
  clearDynamicEvents: () => void;
}

function readPersistedEvents(cabinetId: string): JournalEvent[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cabinetId}`);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((e: any) => ({
      ...e,
      date: new Date(e.date),
      icon: e.icon ?? eventTypeConfig[e.type as keyof typeof eventTypeConfig]?.icon,
    }));
  } catch {
    return [];
  }
}

export function useEventJournal(options: UseEventJournalOptions): UseEventJournalReturn {
  const { cabinetId, cabinetType, persistToLocalStorage = true } = options;

  const [dynamicEvents, setDynamicEvents] = useState<JournalEvent[]>(() =>
    persistToLocalStorage ? readPersistedEvents(cabinetId) : []
  );

  // Re-read on bridge events (e.g. publishBookingEvent) and on cabinet change
  useEffect(() => {
    if (!persistToLocalStorage) return;
    setDynamicEvents(readPersistedEvents(cabinetId));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ cabinetId?: string }>).detail;
      if (!detail?.cabinetId || detail.cabinetId === cabinetId) {
        setDynamicEvents(readPersistedEvents(cabinetId));
      }
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === `${STORAGE_KEY_PREFIX}${cabinetId}`) {
        setDynamicEvents(readPersistedEvents(cabinetId));
      }
    };
    window.addEventListener(BRIDGE_EVENT, handler as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(BRIDGE_EVENT, handler as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, [cabinetId, persistToLocalStorage]);

  const persistEvents = useCallback((events: JournalEvent[]) => {
    if (!persistToLocalStorage) return;
    try {
      const toStore = events.map(e => ({
        ...e,
        date: e.date instanceof Date ? e.date.toISOString() : e.date,
        icon: undefined,
      }));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${cabinetId}`, JSON.stringify(toStore));
    } catch (error) {
      console.error("[useEventJournal] Failed to persist events:", error);
    }
  }, [cabinetId, persistToLocalStorage]);

  const addEvent = useCallback((event: JournalEvent) => {
    setDynamicEvents(prev => {
      const updated = [event, ...prev];
      persistEvents(updated);
      return updated;
    });
  }, [persistEvents]);

  const addEvents = useCallback((events: JournalEvent[]) => {
    setDynamicEvents(prev => {
      const updated = [...events, ...prev];
      persistEvents(updated);
      return updated;
    });
  }, [persistEvents]);

  const clearDynamicEvents = useCallback(() => {
    setDynamicEvents([]);
    if (persistToLocalStorage) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${cabinetId}`);
    }
  }, [cabinetId, persistToLocalStorage]);

  const events = useMemo(() => {
    const staticEvents = getEventJournalConfig(cabinetType);
    return [...dynamicEvents, ...staticEvents].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [dynamicEvents, cabinetType]);

  return {
    events,
    dynamicEvents,
    addEvent,
    addEvents,
    clearDynamicEvents,
  };
}
