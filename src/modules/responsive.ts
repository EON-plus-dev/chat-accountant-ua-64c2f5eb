/**
 * Спільний responsive-контракт для модулів CRM та Tasks.
 * Reexport `useResponsiveContainer` з єдиним API, плюс хелпери
 * для прийняття UX-рішень (горизонтальний swipe vs DnD, FAB vs inline button).
 */

import { useRef, type RefObject } from "react";
import { useResponsiveContainer, type ResponsiveContainer } from "@/hooks/useResponsiveContainer";

export interface ModuleResponsive extends ResponsiveContainer {
  /** Контейнер для прив'язки useResponsiveContainer */
  containerRef: RefObject<HTMLDivElement>;
  /** Використовувати горизонтальний swipe між колонками канбану замість stacked-grid */
  useSwipeKanban: boolean;
  /** Показувати floating action button замість inline header-кнопки */
  useFab: boolean;
  /** Показувати bottom-navigation (мобільний) замість табів зверху */
  useBottomNav: boolean;
  /** Drill-sheet повноекранний (mobile) чи 480px справа (desktop) */
  drillSheetWidth: "full" | "side";
}

export function useModuleResponsive(): ModuleResponsive {
  const ref = useRef<HTMLDivElement>(null);
  const base = useResponsiveContainer(ref);
  return {
    ...base,
    containerRef: ref,
    useSwipeKanban: base.isMobile,
    useFab: base.isMobile,
    useBottomNav: base.isMobile,
    drillSheetWidth: base.isMobile ? "full" : "side",
  };
}
