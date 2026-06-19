import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type Audience = "business" | "individual";
export type BusinessMode = "owner" | "pro";

interface AudienceContextValue {
  audience: Audience;
  setAudience: (a: Audience) => void;
  toggle: () => void;
  businessMode: BusinessMode;
  setBusinessMode: (m: BusinessMode) => void;
}

export const AudienceContext = createContext<AudienceContextValue | null>(null);

/**
 * Audience = логічна аудиторія сторінки. Синхронізується з pathname:
 *  - /partners*    → business + pro
 *  - /individuals* → individual + owner
 *  - інше          → не чіпаємо (зберігаємо вибір користувача)
 *
 * `setAudience()` залишається state-only — для портальних сторінок
 * (довідники, каталоги), де перемикання аудиторії не змінює URL.
 */
export const AudienceProvider = ({ children }: { children: ReactNode }) => {
  const [audience, setAudience] = useState<Audience>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/individuals")) return "individual";
      if (path.startsWith("/partners")) return "business";
    }
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("audience") : null;
    return saved === "individual" ? "individual" : "business";
  });

  const [businessMode, setBusinessMode] = useState<BusinessMode>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.startsWith("/partners")) return "pro";
      if (path.startsWith("/individuals") || path === "/") return "owner";
    }
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("businessMode") : null;
    return saved === "pro" ? "pro" : "owner";
  });

  // Sync з pathname при кожній зміні маршруту
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const path = window.location.pathname;
      if (path.startsWith("/partners")) {
        setAudience("business");
        setBusinessMode("pro");
      } else if (path.startsWith("/individuals")) {
        setAudience("individual");
        setBusinessMode("owner");
      } else if (path === "/") {
        setAudience("business");
        setBusinessMode("owner");
      }
    };
    sync();
    window.addEventListener("popstate", sync);
    // Patch pushState/replaceState to fire a custom event
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (...args) {
      origPush.apply(this, args);
      sync();
    };
    history.replaceState = function (...args) {
      origReplace.apply(this, args);
      sync();
    };
    return () => {
      window.removeEventListener("popstate", sync);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem("audience", audience);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-audience", audience);
    }
  }, [audience]);

  useEffect(() => {
    sessionStorage.setItem("businessMode", businessMode);
  }, [businessMode]);

  const toggle = useCallback(() => setAudience((a) => (a === "business" ? "individual" : "business")), []);

  return (
    <AudienceContext.Provider value={{ audience, setAudience, toggle, businessMode, setBusinessMode }}>
      {children}
    </AudienceContext.Provider>
  );
};

export const useAudience = () => {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error("useAudience must be used within AudienceProvider");
  return ctx;
};
