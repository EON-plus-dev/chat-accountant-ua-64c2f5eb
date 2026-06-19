// Local in-browser change history for article + per-page CMS events.
// Storage:
//  - cms:history:<articleId>           legacy per-article field-edits
//  - cms:history:page:<pagePath>       new unified per-page timeline

export type ChangeField = "title" | "excerpt" | "tldr" | "tags" | "content";

export type ChangeKind =
  | "field-edit"
  | "ai-suggestion"
  | "idea-action"
  | "seo-update";

export interface ChangeEntry {
  id: string;
  articleId: string; // "" for system pages
  at: string;
  author: string;
  // field-edit
  field?: ChangeField;
  before?: string;
  after?: string;
  summary: string;
  // metadata
  kind?: ChangeKind; // default "field-edit"
  pagePath?: string;
  // ai-suggestion
  prompt?: string;
  excerpt?: string;
  selectionText?: string;
  threadId?: string;
  // idea-action
  ideaId?: string;
  ideaTitle?: string;
  ideaAction?: "created" | "accepted" | "dismissed" | "deleted" | "generated";
  // seo-update
  seoField?: string;
}

export interface ArticleSnapshot {
  title: string;
  excerpt: string;
  tldr: string;
  tags: string[];
  content: string;
}

const KEY = (articleId: string) => `cms:history:${articleId}`;
const PAGE_KEY = (path: string) => `cms:history:page:${path}`;
const MAX_ENTRIES = 200;

function readArr(key: string): ChangeEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writeArr(key: string, entries: ChangeEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* ignore */
  }
}

// ---------- Per-article (legacy, still used by field-edit) ----------

export function loadHistory(articleId: string): ChangeEntry[] {
  return readArr(KEY(articleId));
}
export function saveHistory(articleId: string, entries: ChangeEntry[]): void {
  writeArr(KEY(articleId), entries);
}
export function appendHistory(articleId: string, newEntries: ChangeEntry[]): ChangeEntry[] {
  const current = loadHistory(articleId);
  const merged = [...newEntries, ...current].slice(0, MAX_ENTRIES);
  saveHistory(articleId, merged);
  return merged;
}
export function clearHistory(articleId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY(articleId));
}

// ---------- Per-page (new unified timeline) ----------

export function loadPageHistory(path: string): ChangeEntry[] {
  return readArr(PAGE_KEY(path));
}
export function appendPageHistory(path: string, newEntries: ChangeEntry[]): ChangeEntry[] {
  if (!path || !newEntries.length) return loadPageHistory(path);
  const stamped = newEntries.map((e) => ({ ...e, pagePath: path, kind: e.kind ?? "field-edit" as ChangeKind }));
  const current = loadPageHistory(path);
  const merged = [...stamped, ...current].slice(0, MAX_ENTRIES);
  writeArr(PAGE_KEY(path), merged);
  return merged;
}
export function clearPageHistory(path: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PAGE_KEY(path));
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function summarize(field: ChangeField, before: string, after: string): string {
  if (field === "tags") {
    const beforeArr = before ? before.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const afterArr = after ? after.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const added = afterArr.filter((t) => !beforeArr.includes(t));
    const removed = beforeArr.filter((t) => !afterArr.includes(t));
    const parts: string[] = [];
    if (added.length) parts.push(`+${added.length} (${added.join(", ")})`);
    if (removed.length) parts.push(`−${removed.length} (${removed.join(", ")})`);
    return parts.length ? parts.join(" · ") : `${beforeArr.length} → ${afterArr.length}`;
  }
  const diff = after.length - before.length;
  const sign = diff > 0 ? "+" : "";
  const labels: Record<Exclude<ChangeField, "tags">, string> = {
    title: "Заголовок",
    excerpt: "Анонс",
    tldr: "TLDR",
    content: "Контент",
  };
  const label = labels[field as Exclude<ChangeField, "tags">];
  return `${label}: ${before.length} → ${after.length} символів (${sign}${diff})`;
}

export function diffArticleSnapshots(
  articleId: string,
  prev: ArticleSnapshot,
  next: ArticleSnapshot,
  author: string,
): ChangeEntry[] {
  const at = new Date().toISOString();
  const entries: ChangeEntry[] = [];

  const fields: { key: ChangeField; before: string; after: string }[] = [
    { key: "title", before: prev.title, after: next.title },
    { key: "excerpt", before: prev.excerpt, after: next.excerpt },
    { key: "tldr", before: prev.tldr, after: next.tldr },
    { key: "tags", before: prev.tags.join(", "), after: next.tags.join(", ") },
    { key: "content", before: prev.content, after: next.content },
  ];

  for (const f of fields) {
    if (f.before !== f.after) {
      entries.push({
        id: makeId(),
        articleId,
        at,
        author,
        field: f.key,
        before: f.before,
        after: f.after,
        summary: summarize(f.key, f.before, f.after),
        kind: "field-edit",
      });
    }
  }

  return entries;
}

export const FIELD_LABEL: Record<ChangeField, string> = {
  title: "Заголовок",
  excerpt: "Анонс",
  tldr: "TLDR",
  tags: "Теги",
  content: "Контент",
};

export const KIND_LABEL: Record<ChangeKind, string> = {
  "field-edit": "Правка",
  "ai-suggestion": "AI",
  "idea-action": "Ідея",
  "seo-update": "SEO",
};
