/**
 * useDocumentsStore — demo store backed by localStorage.
 * Production will swap to edge function over `documents` / `document_versions` tables.
 *
 * API:
 *   useDocuments(cabinetId, filter?) → { list, byId, refresh }
 *   createDocument(...), addVersion(...), patchDocument(...), addSignature(...)
 *   attachDocument(cabinetId, documentId, link) — universal hook for other modules
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DocumentEntity,
  DocumentFilter,
  DocumentLink,
  DocumentSignature,
  DocumentVersion,
} from "../types";
import { seedDocumentsForCabinet } from "../demo/seedDocuments";

const KEY = (cabinetId: string) => `documents-${cabinetId}`;
const EVENT = "documents-updated";

interface State {
  created: DocumentEntity[];
  updates: Record<string, Partial<DocumentEntity>>;
}

function readState(cabinetId: string): State {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    if (!raw) return { created: [], updates: {} };
    const p = JSON.parse(raw);
    return {
      created: Array.isArray(p.created) ? p.created : [],
      updates: p.updates && typeof p.updates === "object" ? p.updates : {},
    };
  } catch {
    return { created: [], updates: {} };
  }
}

function writeState(cabinetId: string, state: State) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { cabinetId } }));
  } catch {/* ignore */}
}

export function createDocument(cabinetId: string, doc: DocumentEntity) {
  const s = readState(cabinetId);
  s.created = [doc, ...s.created.filter((d) => d.id !== doc.id)];
  writeState(cabinetId, s);
}

export function patchDocument(cabinetId: string, id: string, patch: Partial<DocumentEntity>) {
  const s = readState(cabinetId);
  const idx = s.created.findIndex((d) => d.id === id);
  if (idx >= 0) s.created[idx] = { ...s.created[idx], ...patch, updatedAt: new Date().toISOString() };
  else s.updates[id] = { ...s.updates[id], ...patch, updatedAt: new Date().toISOString() };
  writeState(cabinetId, s);
}

export function addVersion(cabinetId: string, documentId: string, version: DocumentVersion) {
  const s = readState(cabinetId);
  const fromCreated = s.created.find((d) => d.id === documentId);
  if (fromCreated) {
    fromCreated.versions = [...fromCreated.versions, version];
    fromCreated.updatedAt = new Date().toISOString();
  } else {
    const upd = s.updates[documentId] ?? {};
    upd.versions = [...(upd.versions ?? []), version];
    upd.updatedAt = new Date().toISOString();
    s.updates[documentId] = upd;
  }
  writeState(cabinetId, s);
}

export function addSignature(
  cabinetId: string,
  documentId: string,
  versionId: string,
  signature: DocumentSignature,
) {
  const s = readState(cabinetId);
  const doc = s.created.find((d) => d.id === documentId);
  if (doc) {
    const v = doc.versions.find((vv) => vv.id === versionId);
    if (v) {
      v.signatures = [...v.signatures, signature];
      doc.status = "signed";
      doc.canonicalVersionId = v.id;
      doc.updatedAt = new Date().toISOString();
    }
  }
  writeState(cabinetId, s);
}

/** Universal hook for other modules: attach an existing or new doc to an entity. */
export function attachDocument(cabinetId: string, documentId: string, link: DocumentLink) {
  const s = readState(cabinetId);
  const doc = s.created.find((d) => d.id === documentId);
  if (doc) {
    if (!doc.links.some((l) => l.kind === link.kind && l.entityId === link.entityId)) {
      doc.links = [...doc.links, link];
      doc.updatedAt = new Date().toISOString();
    }
  } else {
    const upd = s.updates[documentId] ?? {};
    const links = upd.links ?? [];
    if (!links.some((l) => l.kind === link.kind && l.entityId === link.entityId)) {
      upd.links = [...links, link];
      upd.updatedAt = new Date().toISOString();
      s.updates[documentId] = upd;
    }
  }
  writeState(cabinetId, s);
}

function matches(doc: DocumentEntity, f: DocumentFilter): boolean {
  if (f.kind && f.kind !== "all" && doc.kind !== f.kind) return false;
  if (f.status && f.status !== "all" && doc.status !== f.status) return false;
  if (f.ownerId && doc.ownerId !== f.ownerId) return false;
  if (f.linkedEntityKind || f.linkedEntityId) {
    const has = doc.links.some(
      (l) =>
        (!f.linkedEntityKind || l.kind === f.linkedEntityKind) &&
        (!f.linkedEntityId || l.entityId === f.linkedEntityId),
    );
    if (!has) return false;
  }
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay = `${doc.title} ${doc.tags?.join(" ") ?? ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function useDocuments(cabinetId: string, filter: DocumentFilter = {}) {
  const [state, setState] = useState<State>(() => readState(cabinetId));

  useEffect(() => {
    setState(readState(cabinetId));
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.cabinetId === cabinetId) setState(readState(cabinetId));
    };
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [cabinetId]);

  const list = useMemo(() => {
    const seeded = seedDocumentsForCabinet(cabinetId);
    const merged = seeded.map((d) =>
      state.updates[d.id] ? { ...d, ...state.updates[d.id] } : d,
    );
    const all = [...state.created, ...merged];
    return all
      .filter((d) => matches(d, filter))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [cabinetId, state, filter]);

  const byId = useCallback((id: string) => list.find((d) => d.id === id) ?? null, [list]);
  const refresh = useCallback(() => setState(readState(cabinetId)), [cabinetId]);

  return { list, byId, refresh };
}

export function useDocumentById(cabinetId: string, documentId: string | null) {
  const { byId, list } = useDocuments(cabinetId);
  return useMemo(() => (documentId ? byId(documentId) : null), [byId, documentId, list]);
}
