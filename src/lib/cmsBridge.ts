/**
 * CMS Bridge — runs inside the public site when embedded in the AI CMS iframe.
 *
 * Responsibilities:
 *  - Handshake with parent (`cms:ready` ↔ `cms:handshake`)
 *  - Forward text selections (`cms:selection`)
 *  - Lasso mode: parent sends `cms:lasso-start`/`cms:lasso-cancel`, child draws
 *    an overlay, user drags a rectangle → child captures that DOM region with
 *    html-to-image and posts `cms:lasso-shot` (PNG dataUrl).
 *
 * Safety:
 *  - Only activates when embedded (`window.top !== window.self`)
 *  - Only talks to allow-listed parent origins
 *  - Never posts to "*"
 */

const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/lovable\.dev$/,
  /^https:\/\/([a-z0-9-]+\.)*lovable\.app$/,
  /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/,
  /^https:\/\/(www\.)?fintodo\.com\.ua$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

function resolveParentOrigin(): string | null {
  try {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get("cmsOrigin");
    if (fromQuery && isAllowedOrigin(fromQuery)) return fromQuery;
  } catch {}
  try {
    if (document.referrer) {
      const refOrigin = new URL(document.referrer).origin;
      if (isAllowedOrigin(refOrigin)) return refOrigin;
    }
  } catch {}
  return null;
}

let mounted = false;

export function mountCmsBridge(): void {
  if (mounted) return;
  if (typeof window === "undefined") return;
  if (window.top === window.self) return;

  const parentOrigin = resolveParentOrigin();
  if (!parentOrigin) return;

  mounted = true;
  if (import.meta.env.DEV) console.debug("[CMS bridge child] mounted, parent =", parentOrigin);

  const post = (msg: Record<string, unknown>) => {
    try {
      window.parent.postMessage(msg, parentOrigin);
    } catch {}
  };

  // ───────── Handshake ─────────
  window.addEventListener("message", (e) => {
    if (e.origin !== parentOrigin) return;
    const d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "cms:handshake") {
      if (import.meta.env.DEV) console.debug("[CMS bridge child] handshake → ready");
      post({ type: "cms:ready", path: window.location.pathname });
    } else if (d.type === "cms:lasso-start") {
      startLasso();
    } else if (d.type === "cms:lasso-cancel") {
      stopLasso();
    }
  });
  if (import.meta.env.DEV) console.debug("[CMS bridge child] initial ready post");
  post({ type: "cms:ready", path: window.location.pathname });

  // ───────── Text selection ─────────
  const onSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      post({ type: "cms:selection", text: "" });
      return;
    }
    const text = sel.toString().trim();
    if (!text || text.length < 2) {
      post({ type: "cms:selection", text: "" });
      return;
    }
    let rect = { x: 0, y: 0, w: 0, h: 0 };
    try {
      const r = sel.getRangeAt(0).getBoundingClientRect();
      rect = { x: r.left, y: r.top, w: r.width, h: r.height };
    } catch {}
    post({ type: "cms:selection", text: text.slice(0, 1000), rect });
  };
  document.addEventListener("mouseup", onSelection);
  document.addEventListener("keyup", onSelection);

  // ───────── Lasso mode ─────────
  let overlay: HTMLDivElement | null = null;
  let rectEl: HTMLDivElement | null = null;
  let hintEl: HTMLDivElement | null = null;
  let dragStart: { x: number; y: number } | null = null;
  let currentRect: { x: number; y: number; w: number; h: number } | null = null;

  function startLasso() {
    if (overlay) return;
    // Clear any text selection so it doesn't interfere
    try { window.getSelection()?.removeAllRanges(); } catch {}

    overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483646",
      cursor: "crosshair",
      background: "rgba(15,23,42,0.18)",
      userSelect: "none",
    } as CSSStyleDeclaration);
    overlay.setAttribute("data-cms-lasso", "1");

    rectEl = document.createElement("div");
    Object.assign(rectEl.style, {
      position: "absolute",
      border: "2px solid #3b82f6",
      background: "rgba(59,130,246,0.12)",
      boxShadow: "0 0 0 9999px rgba(15,23,42,0.35)",
      pointerEvents: "none",
      display: "none",
    } as CSSStyleDeclaration);

    hintEl = document.createElement("div");
    Object.assign(hintEl.style, {
      position: "absolute",
      top: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(15,23,42,0.92)",
      color: "white",
      padding: "8px 14px",
      borderRadius: "8px",
      fontSize: "13px",
      fontFamily: "system-ui, sans-serif",
      pointerEvents: "none",
      boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
    } as CSSStyleDeclaration);
    hintEl.textContent = "Виділіть область для скріншоту · Esc — скасувати";

    overlay.appendChild(rectEl);
    overlay.appendChild(hintEl);
    document.body.appendChild(overlay);

    overlay.addEventListener("mousedown", onLassoDown);
    window.addEventListener("mousemove", onLassoMove);
    window.addEventListener("mouseup", onLassoUp);
    window.addEventListener("keydown", onLassoKey);
  }

  function stopLasso() {
    if (!overlay) return;
    overlay.removeEventListener("mousedown", onLassoDown);
    window.removeEventListener("mousemove", onLassoMove);
    window.removeEventListener("mouseup", onLassoUp);
    window.removeEventListener("keydown", onLassoKey);
    overlay.remove();
    overlay = null;
    rectEl = null;
    hintEl = null;
    dragStart = null;
    currentRect = null;
  }

  function onLassoDown(e: MouseEvent) {
    e.preventDefault();
    dragStart = { x: e.clientX, y: e.clientY };
    currentRect = { x: e.clientX, y: e.clientY, w: 0, h: 0 };
    if (rectEl) {
      rectEl.style.display = "block";
      rectEl.style.left = `${e.clientX}px`;
      rectEl.style.top = `${e.clientY}px`;
      rectEl.style.width = "0px";
      rectEl.style.height = "0px";
    }
  }

  function onLassoMove(e: MouseEvent) {
    if (!dragStart || !rectEl) return;
    const x = Math.min(dragStart.x, e.clientX);
    const y = Math.min(dragStart.y, e.clientY);
    const w = Math.abs(e.clientX - dragStart.x);
    const h = Math.abs(e.clientY - dragStart.y);
    currentRect = { x, y, w, h };
    rectEl.style.left = `${x}px`;
    rectEl.style.top = `${y}px`;
    rectEl.style.width = `${w}px`;
    rectEl.style.height = `${h}px`;
    if (hintEl) hintEl.textContent = `${Math.round(w)} × ${Math.round(h)} px · відпустіть для зйомки`;
  }

  async function onLassoUp() {
    if (!dragStart || !currentRect) { dragStart = null; return; }
    const r = currentRect;
    dragStart = null;
    if (r.w < 8 || r.h < 8) {
      // Treat as cancel-click
      if (hintEl) hintEl.textContent = "Виділіть область для скріншоту · Esc — скасувати";
      if (rectEl) rectEl.style.display = "none";
      return;
    }
    await captureRect(r);
    stopLasso();
  }

  function onLassoKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      stopLasso();
      post({ type: "cms:lasso-cancelled" });
    }
  }

  async function captureRect(rect: { x: number; y: number; w: number; h: number }) {
    // Hide the overlay during capture so it isn't in the screenshot
    if (overlay) overlay.style.display = "none";
    try {
      const { toPng } = await import("html-to-image");
      const dpr = window.devicePixelRatio || 1;
      // Render entire viewport, then crop to rect on a canvas
      const fullDataUrl = await toPng(document.documentElement, {
        pixelRatio: dpr,
        cacheBust: true,
        skipFonts: false,
        filter: (node) => {
          // skip our overlay if it somehow remains
          if (node instanceof HTMLElement && node.dataset?.cmsLasso === "1") return false;
          return true;
        },
      });
      const img = new Image();
      img.src = fullDataUrl;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("image load failed"));
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(rect.w * dpr);
      canvas.height = Math.round(rect.h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d ctx");
      // documentElement render starts at (scrollX, scrollY)? html-to-image renders the element
      // at its current position; for documentElement it starts at (0,0) of the page,
      // but rect coords are viewport-based — add scroll offsets.
      const sx = (rect.x + window.scrollX) * dpr;
      const sy = (rect.y + window.scrollY) * dpr;
      const sw = rect.w * dpr;
      const sh = rect.h * dpr;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      post({
        type: "cms:lasso-shot",
        dataUrl,
        rect: { x: rect.x, y: rect.y, w: Math.round(rect.w), h: Math.round(rect.h) },
        path: window.location.pathname,
        viewport: { w: window.innerWidth, h: window.innerHeight },
      });
    } catch (err) {
      post({
        type: "cms:lasso-error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // ───────── SPA navigation: re-announce on path change ─────────
  let lastPath = window.location.pathname;
  const announceIfChanged = () => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      post({ type: "cms:ready", path: lastPath });
    }
  };
  window.addEventListener("popstate", announceIfChanged);
  for (const k of ["pushState", "replaceState"] as const) {
    const orig = history[k];
    history[k] = function (...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = orig.apply(this, args as any);
      setTimeout(announceIfChanged, 0);
      return r;
    } as typeof history[typeof k];
  }
}
