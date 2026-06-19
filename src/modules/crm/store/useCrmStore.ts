/**
 * useCrmStore — універсальний CRUD-стор для CRM-deals/accounts/contacts,
 * з localStorage-персистенцією per (cabinetId × presetId).
 *
 * Не залежить від конкретного кабінету — обирає preset через параметр,
 * і за відсутності збережених даних сидить демо-набором із seedDeals().
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrmAccount, CrmContact, CrmDeal, CrmPreset } from "../types";
import { seedCrmData } from "../demo/seedDeals";

interface UseCrmStoreOptions {
  cabinetId: string;
  preset: CrmPreset;
  persist?: boolean;
}

interface PersistedShape {
  v: 1;
  deals: CrmDeal[];
  accounts: CrmAccount[];
  contacts: CrmContact[];
}

interface UseCrmStoreReturn {
  deals: CrmDeal[];
  accounts: CrmAccount[];
  contacts: CrmContact[];
  getAccount: (id: string) => CrmAccount | undefined;
  getContact: (id: string) => CrmContact | undefined;
  getDealsByStage: (stageId: string) => CrmDeal[];
  moveDealToStage: (dealId: string, stageId: string) => void;
  updateDeal: (dealId: string, patch: Partial<CrmDeal>) => void;
  addDeal: (deal: Omit<CrmDeal, "id" | "stageEnteredAt" | "lastActivityAt">) => CrmDeal;
  deleteDeal: (dealId: string) => void;
  reset: () => void;
}

const KEY_PREFIX = "crm-store-v1-";

function loadFromStorage(key: string): PersistedShape | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedShape;
    if (parsed?.v === 1 && Array.isArray(parsed.deals)) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function useCrmStore({ cabinetId, preset, persist = true }: UseCrmStoreOptions): UseCrmStoreReturn {
  const storageKey = `${KEY_PREFIX}${cabinetId}-${preset.id}`;

  const [{ deals, accounts, contacts }, setState] = useState<Omit<PersistedShape, "v">>(() => {
    if (persist) {
      const loaded = loadFromStorage(storageKey);
      if (loaded) return { deals: loaded.deals, accounts: loaded.accounts, contacts: loaded.contacts };
    }
    return seedCrmData(preset);
  });

  // Reseed when preset/cabinet changes and no persisted data
  useEffect(() => {
    if (!persist) return;
    const loaded = loadFromStorage(storageKey);
    if (!loaded) {
      setState(seedCrmData(preset));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persist
  useEffect(() => {
    if (!persist) return;
    try {
      const payload: PersistedShape = { v: 1, deals, accounts, contacts };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      /* quota / unavailable — ignore */
    }
  }, [deals, accounts, contacts, storageKey, persist]);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const contactsById = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);

  const getAccount = useCallback((id: string) => accountsById.get(id), [accountsById]);
  const getContact = useCallback((id: string) => contactsById.get(id), [contactsById]);

  const getDealsByStage = useCallback(
    (stageId: string) => deals.filter((d) => d.stageId === stageId),
    [deals],
  );

  const moveDealToStage = useCallback((dealId: string, stageId: string) => {
    setState((s) => ({
      ...s,
      deals: s.deals.map((d) => {
        if (d.id !== dealId || d.stageId === stageId) return d;
        const stage = preset.pipelines.find((p) => p.id === d.pipelineId)?.stages.find((st) => st.id === stageId);
        return {
          ...d,
          stageId,
          probability: stage?.defaultProbability ?? d.probability,
          stageEnteredAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        };
      }),
    }));
  }, [preset]);

  const updateDeal = useCallback((dealId: string, patch: Partial<CrmDeal>) => {
    setState((s) => ({
      ...s,
      deals: s.deals.map((d) => (d.id === dealId ? { ...d, ...patch, lastActivityAt: new Date().toISOString() } : d)),
    }));
  }, []);

  const addDeal = useCallback((input: Omit<CrmDeal, "id" | "stageEnteredAt" | "lastActivityAt">): CrmDeal => {
    const now = new Date().toISOString();
    const deal: CrmDeal = {
      ...input,
      id: `deal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      stageEnteredAt: now,
      lastActivityAt: now,
    };
    setState((s) => ({ ...s, deals: [deal, ...s.deals] }));
    return deal;
  }, []);

  const deleteDeal = useCallback((dealId: string) => {
    setState((s) => ({ ...s, deals: s.deals.filter((d) => d.id !== dealId) }));
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    setState(seedCrmData(preset));
  }, [preset, storageKey]);

  return { deals, accounts, contacts, getAccount, getContact, getDealsByStage, moveDealToStage, updateDeal, addDeal, deleteDeal, reset };
}
