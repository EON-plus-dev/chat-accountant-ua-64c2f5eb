import { TableHead, TableHeadProps } from "@/components/ui/table";
import { SortIndicator } from "@/components/ui/sort-indicator";
import type { SortDirection } from "@/hooks/use-sort-state";
import { cn } from "@/lib/utils";

interface SortableHeaderProps<T extends string> extends Omit<TableHeadProps, "onSort"> {
  field: T;
  label: string;
  currentField?: T;
  direction?: SortDirection;
  onSort?: (field: T) => void;
  align?: "left" | "center" | "right";
}

/**
 * Unified sortable table header component with visual sort indicators
 * Used across Document Flow, Income Book, and other sortable tables
 * Includes accessibility support via aria-sort attribute
 */
export function SortableHeader<T extends string>({
  field,
  label,
  currentField,
  direction,
  onSort,
  className,
  align = "left",
  numeric,
  ...props
}: SortableHeaderProps<T>) {
  const isActive = currentField === field;
  
  const handleClick = () => {
    onSort?.(field);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSort?.(field);
    }
  };

  return (
    <TableHead
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        align === "right" && "text-right",
        align === "center" && "text-center",
        isActive && "bg-muted/30",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="columnheader"
      tabIndex={0}
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      numeric={numeric}
      {...props}
    >
      <span className={cn(
        "inline-flex items-center gap-0.5",
        align === "right" && "justify-end w-full",
        align === "center" && "justify-center w-full"
      )}>
        {label}
        <SortIndicator active={isActive} direction={isActive ? direction : null} />
      </span>
    </TableHead>
  );
}
