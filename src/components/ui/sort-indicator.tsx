import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortDirection } from "@/hooks/use-sort-state";

interface SortIndicatorProps {
  active: boolean;
  direction?: SortDirection | null;
  className?: string;
}

/**
 * Visual sort indicator for table headers
 * Shows: neutral (↕️) when inactive, up arrow (↑) for asc, down arrow (↓) for desc
 * All icons are aria-hidden as they are decorative - the sort state is conveyed via aria-sort
 */
export const SortIndicator = ({ active, direction, className }: SortIndicatorProps) => {
  if (!active || !direction) {
    return <ArrowUpDown className={cn("w-3 h-3 ml-1 opacity-40 group-hover:opacity-60 transition-opacity", className)} aria-hidden="true" />;
  }
  
  return direction === "asc" ? (
    <ArrowUp className={cn("w-3 h-3 ml-1 text-primary", className)} aria-hidden="true" />
  ) : (
    <ArrowDown className={cn("w-3 h-3 ml-1 text-primary", className)} aria-hidden="true" />
  );
};
