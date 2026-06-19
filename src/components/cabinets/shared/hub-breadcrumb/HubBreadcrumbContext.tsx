import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

export interface HubCrumb {
  id: string;
  label: string;
  onSelect?: () => void;
}

interface Ctx {
  extraCrumbs: HubCrumb[];
  setExtraCrumbs: (crumbs: HubCrumb[]) => void;
  clear: () => void;
}

const HubBreadcrumbContext = createContext<Ctx | null>(null);

export function HubBreadcrumbProvider({
  children,
  resetKey,
}: {
  children: ReactNode;
  /** Зміна цього ключа (напр. effectiveTab) автоматично скидає extra-крихти */
  resetKey?: string;
}) {
  const [extraCrumbs, setExtraCrumbsState] = useState<HubCrumb[]>([]);
  const setExtraCrumbs = useCallback((c: HubCrumb[]) => setExtraCrumbsState(c), []);
  const clear = useCallback(() => setExtraCrumbsState([]), []);
  const previousResetKey = useRef(resetKey);

  useEffect(() => {
    if (resetKey === undefined || previousResetKey.current === resetKey) return;
    previousResetKey.current = resetKey;
    setExtraCrumbsState([]);
  }, [resetKey]);

  return (
    <HubBreadcrumbContext.Provider value={{ extraCrumbs, setExtraCrumbs, clear }}>
      {children}
    </HubBreadcrumbContext.Provider>
  );
}

export function useHubBreadcrumb() {
  const ctx = useContext(HubBreadcrumbContext);
  if (!ctx) {
    return {
      extraCrumbs: [] as HubCrumb[],
      setExtraCrumbs: (_: HubCrumb[]) => {},
      clear: () => {},
    };
  }
  return ctx;
}
