// Encode/decode share IDs for cabinet requisite share links.
// Demo-only: shareId is a short URL-safe encoding of cabinetId. In production
// this should be a UUID stored server-side with view/lead tracking.

const PUBLIC_BASE_URL = "https://fintodo.com.ua";

export function encodeShareId(cabinetId: string): string {
  // Stable, URL-safe — first 10 chars of base64url(cabinetId)
  try {
    const b64 = btoa(unescape(encodeURIComponent(cabinetId)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return b64.slice(0, 12);
  } catch {
    return cabinetId.slice(0, 12);
  }
}

export function decodeShareId(shareId: string, candidates: string[]): string | null {
  // Find candidate cabinet whose encoded id matches
  for (const id of candidates) {
    if (encodeShareId(id) === shareId) return id;
  }
  // Fallback: maybe shareId === raw cabinetId
  return candidates.includes(shareId) ? shareId : null;
}

export function buildShareUrl(cabinetId: string): string {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : PUBLIC_BASE_URL;
  return `${origin}/r/${encodeShareId(cabinetId)}`;
}

// Demo cabinet used when /r/ is opened without a real shareId (e.g. /r/:shareId)
export const DEMO_SHARE_CABINET_ID = "passive-demo-1";
export const DEMO_SHARE_ID = encodeShareId(DEMO_SHARE_CABINET_ID);

export function isPlaceholderShareId(shareId: string): boolean {
  return !shareId || shareId === ":shareId" || shareId === "demo";
}

// ── Demo-only local persistence (views & leads) ─────────────────────────────
// TODO: replace with Lovable Cloud tables (share_links, share_views, share_leads).

export interface ShareLead {
  id: string;
  cabinetId: string;
  code: string; // EDRPOU or IPN
  companyName?: string;
  email: string;
  phone?: string;
  subscribeUpdates: boolean;
  createdAt: string;
}

const VIEWS_KEY = (cabinetId: string) => `cabinet-share-views-${cabinetId}`;
const LEADS_KEY = (cabinetId: string) => `cabinet-share-leads-${cabinetId}`;

export function getViewCount(cabinetId: string): number {
  try {
    return Number(localStorage.getItem(VIEWS_KEY(cabinetId)) || 0);
  } catch {
    return 0;
  }
}

export function incrementViewCount(cabinetId: string): number {
  try {
    const next = getViewCount(cabinetId) + 1;
    localStorage.setItem(VIEWS_KEY(cabinetId), String(next));
    return next;
  } catch {
    return 0;
  }
}

export function getLeads(cabinetId: string): ShareLead[] {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY(cabinetId)) || "[]");
  } catch {
    return [];
  }
}

export function saveLead(lead: Omit<ShareLead, "id" | "createdAt">): ShareLead {
  const full: ShareLead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  try {
    const list = getLeads(lead.cabinetId);
    list.unshift(full);
    localStorage.setItem(LEADS_KEY(lead.cabinetId), JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return full;
}
