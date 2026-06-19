import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks the clientWidth of a referenced element using ResizeObserver.
 * Useful for container-driven responsive layouts where viewport breakpoints
 * are not enough (e.g. workspace panel that resizes independently of window).
 */
export function useContainerWidth<T extends HTMLElement>(
  ref: RefObject<T>,
): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}
