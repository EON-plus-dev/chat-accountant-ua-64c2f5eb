import { useMemo, type RefObject } from "react";
import { useContainerWidth } from "./use-container-width";

export type Bp = "xs" | "sm" | "md" | "lg" | "xl";

const ORDER: Bp[] = ["xs", "sm", "md", "lg", "xl"];

function widthToBp(w: number): Bp {
  if (w === 0) return "lg"; // SSR / first paint — assume desktop to avoid mobile flash
  if (w < 480) return "xs";
  if (w < 768) return "sm";
  if (w < 1024) return "md";
  if (w < 1280) return "lg";
  return "xl";
}

export interface ResponsiveContainer {
  width: number;
  bp: Bp;
  isAtLeast: (b: Bp) => boolean;
  /** Number of columns for paired sections (Analytics+Calendar, Inbox+Recent). */
  cols: 1 | 2;
  /** Number of columns for KPI grid. */
  kpiCols: 2 | 4;
  /** Padding/typography density. */
  density: "compact" | "comfortable";
  /** True for true-mobile widths (<sm). */
  isMobile: boolean;
}

/**
 * Container-driven responsive primitives. Use INSTEAD of viewport media queries
 * when a component lives inside a workspace whose width is independent of the
 * window (e.g. cabinet pages with a collapsible chat panel on the side).
 */
export function useResponsiveContainer<T extends HTMLElement>(
  ref: RefObject<T>,
): ResponsiveContainer {
  const width = useContainerWidth(ref);
  return useMemo(() => {
    const bp = widthToBp(width);
    const idx = ORDER.indexOf(bp);
    return {
      width,
      bp,
      isAtLeast: (b) => idx >= ORDER.indexOf(b),
      cols: idx >= ORDER.indexOf("lg") ? 2 : 1,
      kpiCols: idx >= ORDER.indexOf("md") ? 4 : 2,
      density: idx <= ORDER.indexOf("sm") ? "compact" : "comfortable",
      isMobile: idx <= ORDER.indexOf("sm"),
    };
  }, [width]);
}
