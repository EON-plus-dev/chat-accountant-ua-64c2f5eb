import { useEffect, useRef, useState } from "react";
import { Sparkles, Layers, Crosshair, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CmsSelectionPopover from "./CmsSelectionPopover";

const PUBLISHED_ORIGIN = "https://chat-accountant-ua.lovable.app";

/**
 * Pick the iframe origin smartly:
 *  - In Lovable preview / lovableproject.com / localhost — same origin as the
 *    admin (so bridge changes are visible without Publish).
 *  - On custom/published domains — fall back to the published site.
 */
function resolveSiteOrigin(): string {
  if (typeof window === "undefined") return PUBLISHED_ORIGIN;
  const here = window.location.origin;
  const isPreview =
    /^https:\/\/([a-z0-9-]+\.)*lovable\.app$/.test(here) ||
    /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/.test(here) ||
    /^http:\/\/localhost(:\d+)?$/.test(here) ||
    /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(here);
  return isPreview ? here : PUBLISHED_ORIGIN;
}

interface Screenshot {
  dataUrl: string;
  rect: { x: number; y: number; w: number; h: number };
  path: string;
}

interface Props {
  currentPath: string;
  sysTitle?: string;
  sysCategory?: string;
  onChatPrompt: (prompt: string) => void;
  onCreateIdeaFromSelection?: (text: string) => void;
  onAttachScreenshot?: (shot: Screenshot) => void;
}

export default function SystemPageLiveEditor({
  currentPath,
  sysTitle,
  sysCategory,
  onChatPrompt,
  onCreateIdeaFromSelection,
  onAttachScreenshot,
}: Props) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [siteOrigin] = useState(() => resolveSiteOrigin());
  const [ready, setReady] = useState(false);
  const [stale, setStale] = useState(false);
  const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
  const [lassoMode, setLassoMode] = useState(false);

  const iframeSrc = `${siteOrigin}${currentPath}${currentPath.includes("?") ? "&" : "?"}cmsOrigin=${encodeURIComponent(window.location.origin)}`;
  

  const postToFrame = (msg: Record<string, unknown>) => {
    try {
      frameRef.current?.contentWindow?.postMessage(msg, siteOrigin);
    } catch {}
  };

  const startLasso = () => {
    if (!ready) return;
    setLassoMode(true);
    postToFrame({ type: "cms:lasso-start" });
  };
  const cancelLasso = () => {
    setLassoMode(false);
    postToFrame({ type: "cms:lasso-cancel" });
  };

  const readyRef = useRef(false);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== siteOrigin) return;
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return;
      const d = e.data;
      if (!d || typeof d !== "object") return;

      if (d.type === "cms:ready") {
        if (import.meta.env.DEV) console.debug("[CMS bridge] ready received", d.path);
        setReady(true);
        setStale(false);
        return;
      }

      if (d.type === "cms:selection") {
        if (!d.text) { setSelection(null); return; }
        const frameRect = frameRef.current.getBoundingClientRect();
        const r = d.rect ?? { x: 0, y: 0, w: 0, h: 0 };
        const rect = new DOMRect(
          frameRect.left + r.x + r.w / 2 - 1,
          frameRect.top + r.y,
          2,
          r.h,
        );
        setSelection({ text: d.text, rect });
        return;
      }

      if (d.type === "cms:lasso-shot") {
        setLassoMode(false);
        onAttachScreenshot?.({
          dataUrl: d.dataUrl,
          rect: d.rect ?? { x: 0, y: 0, w: 0, h: 0 },
          path: d.path ?? currentPath,
        });
        return;
      }

      if (d.type === "cms:lasso-cancelled" || d.type === "cms:lasso-error") {
        setLassoMode(false);
        return;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [currentPath, siteOrigin, onAttachScreenshot]);

  // Esc cancels lasso from admin side too
  useEffect(() => {
    if (!lassoMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelLasso();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lassoMode]);

  // Reset state on path change + stale timer. Reads latest ready via ref to avoid effect loop.
  useEffect(() => {
    setReady(false);
    setStale(false);
    setSelection(null);
    setLassoMode(false);
    readyRef.current = false;
    const t = setTimeout(() => {
      if (!readyRef.current) setStale(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [currentPath]);

  const handleLoad = () => {
    const send = () => {
      try {
        frameRef.current?.contentWindow?.postMessage({ type: "cms:handshake" }, siteOrigin);
        if (import.meta.env.DEV) console.debug("[CMS bridge] handshake sent");
      } catch {}
    };
    send();
    // Retry handshake to cover races with child bridge mount timing
    setTimeout(send, 200);
    setTimeout(send, 800);
  };

  const isPreviewOrigin = siteOrigin === window.location.origin;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="shrink-0 h-9 px-2 flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">
            Системна · {sysTitle ?? currentPath}
            {sysCategory ? <span className="hidden sm:inline"> · {sysCategory}</span> : null}
          </span>
          <span
            className={`ml-1 inline-block h-1.5 w-1.5 rounded-full shrink-0 ${ready ? "bg-emerald-500" : stale ? "bg-amber-500" : "bg-muted-foreground/40"}`}
            title={
              ready
                ? "Bridge активний — виділення тексту і «Запитати AI» працюють"
                : stale
                  ? isPreviewOrigin
                    ? "Bridge не відповідає. Перезавантажте превʼю."
                    : "Сайт не відповідає на bridge. Опублікуйте останню версію — bridge доступний лише в свіжому деплої."
                  : "Очікування bridge…"
            }
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={lassoMode ? "secondary" : "ghost"}
            className="h-6 px-2 text-[11px] gap-1"
            disabled={!ready}
            onClick={lassoMode ? cancelLasso : startLasso}
            title={
              ready
                ? "Виділіть прямокутник на сторінці — скріншот цієї області зʼявиться в чаті"
                : "Bridge ще не готовий"
            }
          >
            {lassoMode ? (
              <>
                <Crosshair className="h-3 w-3 text-primary" /> Скасувати виділення
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-primary" /> Запитати AI
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <iframe
          ref={frameRef}
          src={iframeSrc}
          onLoad={handleLoad}
          className="w-full h-full border-0 bg-background"
          title={`Live preview ${currentPath}`}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />

        {/* Bottom-right helper (dismissible per session) */}
        <SystemPageHelper />

        {/* Visual hint when lasso is active on the admin side */}
        {lassoMode && (
          <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium shadow-lg">
            Режим виділення активний · Esc — скасувати
          </div>
        )}

        {selection && (
          <CmsSelectionPopover
            selectionText={selection.text}
            rect={selection.rect}
            pagePath={currentPath}
            onPrompt={onChatPrompt}
            onCreateIdea={onCreateIdeaFromSelection}
            onClose={() => setSelection(null)}
          />
        )}
      </div>
    </div>
  );
}

function SystemPageHelper() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("cms_sys_helper_dismissed") === "1";
  });
  if (dismissed) return null;
  return (
    <div className="absolute bottom-3 right-3 z-10 max-w-[calc(100vw-24px)] sm:max-w-[300px] bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground mb-1">
          <Crosshair className="h-3.5 w-3.5 text-primary" />
          AI-дії над сторінкою
        </div>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("cms_sys_helper_dismissed", "1");
            setDismissed(true);
          }}
          className="text-muted-foreground hover:text-foreground -mt-0.5 -mr-1 p-0.5"
          aria-label="Сховати підказку"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Натисніть <span className="text-foreground font-medium">«Запитати AI»</span> → виділіть прямокутник на сторінці. Скріншот цієї області автоматично прикріпиться до чату — додайте текст або голос і відправте.
      </p>
      <p className="hidden sm:block text-[10px] text-muted-foreground leading-relaxed mt-1">
        Або просто виділіть текст у сторінці — відкриється швидке меню AI.
      </p>
    </div>
  );
}
