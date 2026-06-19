/**
 * Локальний демо-стор клієнтів салону:
 *  - `created` — вручну додані / імпортовані клієнти (не у seed)
 *  - `updates` — оверрайди над seed (редагування полів, blacklist, anonymize)
 *  - `bonusLedger` — журнал нарахувань/списань (для табу «Лояльність»)
 *  - `communications` — таймлайн повідомлень (для табу «Комунікації»)
 *
 * Persist у `salon-clients-{cabinetId}` + emit `salon-clients-updated`.
 * Production: edge function + БД з RLS.
 */

import type { Client as SalonClient } from "@/core";

const KEY = (cabinetId: string) => `salon-clients-${cabinetId}`;
const EVENT_NAME = "salon-clients-updated";

export type BonusLedgerEntry = {
  id: string;
  clientId: string;
  date: string;
  delta: number;
  reason: string;
  source: "manual" | "booking" | "birthday" | "voucher" | "expiry";
  bookingId?: string;
};

export type CommunicationEntry = {
  id: string;
  clientId: string;
  date: string;
  channel: "sms" | "viber" | "telegram" | "email" | "call";
  direction: "out" | "in";
  template?: "reminder" | "birthday" | "rebook" | "winback" | "custom";
  subject?: string;
  preview: string;
};

export interface ClientsState {
  created: SalonClient[];
  updates: Record<string, Partial<SalonClient>>;
  bonusLedger: BonusLedgerEntry[];
  communications: CommunicationEntry[];
}

const empty: ClientsState = { created: [], updates: {}, bonusLedger: [], communications: [] };

export function readClientsState(cabinetId: string): ClientsState {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw);
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updates: parsed.updates && typeof parsed.updates === "object" ? parsed.updates : {},
      bonusLedger: Array.isArray(parsed.bonusLedger) ? parsed.bonusLedger : [],
      communications: Array.isArray(parsed.communications) ? parsed.communications : [],
    };
  } catch {
    return { ...empty };
  }
}

function writeClientsState(cabinetId: string, state: ClientsState) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cabinetId } }));
  } catch {
    /* ignore */
  }
}

export function subscribeClients(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  const storage = (e: StorageEvent) => {
    if (e.key?.startsWith("salon-clients-")) cb();
  };
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", storage);
  };
}

// ───────── CRUD ─────────

export function createClient(cabinetId: string, client: SalonClient) {
  const s = readClientsState(cabinetId);
  s.created = [client, ...s.created.filter((c) => c.id !== client.id)];
  writeClientsState(cabinetId, s);
}

export function createClientsBulk(cabinetId: string, clients: SalonClient[]) {
  const s = readClientsState(cabinetId);
  const incomingIds = new Set(clients.map((c) => c.id));
  s.created = [...clients, ...s.created.filter((c) => !incomingIds.has(c.id))];
  writeClientsState(cabinetId, s);
}

export function updateClient(cabinetId: string, id: string, patch: Partial<SalonClient>) {
  const s = readClientsState(cabinetId);
  const idx = s.created.findIndex((c) => c.id === id);
  if (idx >= 0) {
    s.created[idx] = { ...s.created[idx], ...patch };
  } else {
    s.updates[id] = { ...s.updates[id], ...patch };
  }
  writeClientsState(cabinetId, s);
}

/** GDPR Art. 17: анонімізація замість delete — bookings лишаються коректними. */
export function anonymizeClient(cabinetId: string, id: string) {
  const today = new Date().toISOString().slice(0, 10);
  updateClient(cabinetId, id, {
    fullName: `Клієнт #${id.slice(-4).toUpperCase()}`,
    phone: "—",
    email: undefined,
    birthDate: undefined,
    tags: [],
    notes: `Дані видалено за запитом клієнта (GDPR Art. 17, ${today})`,
    isAnonymized: true,
    consents: undefined,
  });
}

export function setBlacklist(cabinetId: string, id: string, reason: string, durationDays?: number) {
  const since = new Date().toISOString();
  const expiresAt = durationDays
    ? new Date(Date.now() + durationDays * 86_400_000).toISOString()
    : undefined;
  updateClient(cabinetId, id, { blacklist: { since, reason, expiresAt } });
}

export function unsetBlacklist(cabinetId: string, id: string) {
  updateClient(cabinetId, id, { blacklist: undefined });
}

// ───────── Bonus ledger ─────────

export function addBonusEntry(cabinetId: string, entry: BonusLedgerEntry) {
  const s = readClientsState(cabinetId);
  s.bonusLedger = [entry, ...s.bonusLedger];
  writeClientsState(cabinetId, s);
}

// ───────── Communications ─────────

export function logCommunication(cabinetId: string, entry: CommunicationEntry) {
  const s = readClientsState(cabinetId);
  s.communications = [entry, ...s.communications];
  writeClientsState(cabinetId, s);
}
