import { createContext, useContext } from "react";
import type { ResponsiveContainer } from "@/hooks/useResponsiveContainer";

const OverviewBpContext = createContext<ResponsiveContainer | null>(null);

export const OverviewBpProvider = OverviewBpContext.Provider;

export function useOverviewBp(): ResponsiveContainer {
  const v = useContext(OverviewBpContext);
  if (!v) {
    // Safe fallback (desktop) — never throws so subcomponents can be reused outside Overview.
    return {
      width: 1280,
      bp: "lg",
      isAtLeast: () => true,
      cols: 2,
      kpiCols: 4,
      density: "comfortable",
      isMobile: false,
    };
  }
  return v;
}
