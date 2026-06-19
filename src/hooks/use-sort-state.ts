import { useState, useCallback } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState<T extends string = string> {
  key: T;
  direction: SortDirection;
}

/**
 * Unified sorting hook for consistent 2-state toggle (asc ↔ desc)
 * Used across all sortable tables in the application
 */
export function useSortState<T extends string>(
  defaultKey: T,
  defaultDirection: SortDirection = "asc"
) {
  const [sort, setSort] = useState<SortState<T>>({
    key: defaultKey,
    direction: defaultDirection,
  });

  const handleSort = useCallback((key: T) => {
    setSort((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      return {
        key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  }, []);

  const resetSort = useCallback(() => {
    setSort({ key: defaultKey, direction: defaultDirection });
  }, [defaultKey, defaultDirection]);

  return { sort, handleSort, resetSort, setSort };
}
