/**
 * Bidirectional cross-linking graph for DirectoryEntry-based knowledge.
 *
 * Builds an in-memory graph from all directory adapters and computes
 * inverse-edges so that an entry can show "related materials" even when
 * the back-link was declared only on the other side.
 *
 * Edge sources:
 *   1. entry.relatedEntryIds — explicit cross-links (`{category}:{slug}`)
 *   2. entry.relatedFactIds  — pointers to KNOWLEDGE_FACTS (no graph edge)
 *   3. entry.relatedToolIds  — pointers to /tools/{slug} (no graph edge)
 *   4. payload heuristics    — e.g. penalty.legalUrl pointing to a law slug
 *
 * The graph is computed lazily once per process; entries are immutable
 * fixtures so caching is safe.
 */

import { getAllDirectoryEntries } from "./directoryAdapters";
import type { DirectoryEntry, DirectoryCategory } from "./directoryTypes";
import { DIRECTORY_CATEGORY_LABEL } from "./directoryTypes";

const DIRECTORY_URL_PREFIX_LOCAL: Record<DirectoryCategory, string> = {
  penalties: "/dovidnyky/penalties",
  laws: "/dovidnyky/zakony",
  kved: "/dovidnyky/kved",
  grants: "/dovidnyky/granty",
  licenses: "/dovidnyky/litsenziyi",
  registers: "/dovidnyky/reestry",
  templates: "/dovidnyky/templates",
  businessForms: "/dovidnyky/formy-biznesu",
  slovnyk: "/dovidnyky/slovnyk",
  stavky: "/dovidnyky/stavky",
  accountants: "/dovidnyky/accountants",
  calendar: "/dovidnyky/kalendar",
  sudy: "/dovidnyky/sudy",
  rozyasnennia: "/dovidnyky/roz-yasnennia",
  derzhorgany: "/dovidnyky/derzhorgany",
  "biudzhetni-rakhunky": "/dovidnyky/biudzhetni-rakhunky",
  "atsk-kep": "/dovidnyky/atsk-kep",
  katottg: "/dovidnyky/katottg",
  profesii: "/dovidnyky/profesii",
  "plan-rakhunkiv": "/dovidnyky/plan-rakhunkiv",
  "ukt-zed": "/dovidnyky/ukt-zed",
  "viyskovyy-oblik": "/dovidnyky/viyskovyy-oblik",
  "pdv-pilhy": "/dovidnyky/pdv-pilhy",
};

function localUrl(e: Pick<DirectoryEntry, "category" | "slug">): string {
  return `${DIRECTORY_URL_PREFIX_LOCAL[e.category]}/${e.slug}`;
}


export type EntryKey = string; // `${category}:${slug}`

export function entryKey(e: Pick<DirectoryEntry, "category" | "slug">): EntryKey {
  return `${e.category}:${e.slug}`;
}

export interface RelatedEntryRef {
  key: EntryKey;
  category: DirectoryCategory;
  categoryLabel: string;
  slug: string;
  title: string;
  summary: string;
  url: string;
}

interface EntryGraph {
  /** key → entry */
  byKey: Map<EntryKey, DirectoryEntry>;
  /** key → set of related keys (union of forward + inverse edges) */
  edges: Map<EntryKey, Set<EntryKey>>;
}

let _graph: EntryGraph | null = null;

function buildGraph(): EntryGraph {
  const all = getAllDirectoryEntries();
  const byKey = new Map<EntryKey, DirectoryEntry>();
  for (const e of all) byKey.set(entryKey(e), e);

  const edges = new Map<EntryKey, Set<EntryKey>>();
  const addEdge = (a: EntryKey, b: EntryKey) => {
    if (a === b || !byKey.has(a) || !byKey.has(b)) return;
    if (!edges.has(a)) edges.set(a, new Set());
    if (!edges.has(b)) edges.set(b, new Set());
    edges.get(a)!.add(b);
    edges.get(b)!.add(a);
  };

  for (const e of all) {
    const k = entryKey(e);
    for (const rel of e.relatedEntryIds ?? []) {
      // Accept both `${cat}:${slug}` and bare slug (legacy)
      if (rel.includes(":")) {
        addEdge(k, rel as EntryKey);
      } else {
        // resolve bare slug within same category first, else any match
        const sameCat = `${e.category}:${rel}` as EntryKey;
        if (byKey.has(sameCat)) addEdge(k, sameCat);
        else {
          for (const other of byKey.keys()) {
            if (other.endsWith(`:${rel}`)) {
              addEdge(k, other);
              break;
            }
          }
        }
      }
    }
  }

  return { byKey, edges };
}

function getGraph(): EntryGraph {
  if (!_graph) _graph = buildGraph();
  return _graph;
}

/** Test-only: drop cached graph. */
export function _resetEntryGraph(): void {
  _graph = null;
}

function toRef(e: DirectoryEntry): RelatedEntryRef {
  return {
    key: entryKey(e),
    category: e.category,
    categoryLabel: DIRECTORY_CATEGORY_LABEL[e.category],
    slug: e.slug,
    title: e.title,
    summary: e.summary,
    url: localUrl(e),
  };
}


/** Related entries grouped by category, suitable for `<RelatedEntriesPanel>`. */
export function getRelatedEntriesGrouped(
  entry: Pick<DirectoryEntry, "category" | "slug">,
  limitPerCategory = 6,
): Array<{ category: DirectoryCategory; categoryLabel: string; items: RelatedEntryRef[] }> {
  const { byKey, edges } = getGraph();
  const k = entryKey(entry);
  const ids = edges.get(k);
  if (!ids || ids.size === 0) return [];

  const groups = new Map<DirectoryCategory, RelatedEntryRef[]>();
  for (const id of ids) {
    const target = byKey.get(id);
    if (!target) continue;
    const arr = groups.get(target.category) ?? [];
    arr.push(toRef(target));
    groups.set(target.category, arr);
  }

  return Array.from(groups.entries())
    .map(([category, items]) => ({
      category,
      categoryLabel: DIRECTORY_CATEGORY_LABEL[category],
      items: items.slice(0, limitPerCategory),
    }))
    .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel, "uk"));
}

/** Flat list of related entries (for AI `seeAlso`). */
export function getSeeAlsoForAi(
  entry: Pick<DirectoryEntry, "category" | "slug">,
  limit = 5,
): Array<{ title: string; url: string; categoryLabel: string }> {
  const groups = getRelatedEntriesGrouped(entry, limit);
  const flat: Array<{ title: string; url: string; categoryLabel: string }> = [];
  for (const g of groups) {
    for (const it of g.items) {
      flat.push({ title: it.title, url: it.url, categoryLabel: g.categoryLabel });
      if (flat.length >= limit) return flat;
    }
  }
  return flat;
}
