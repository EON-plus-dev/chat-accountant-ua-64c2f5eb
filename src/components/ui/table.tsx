import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Table Design System (FinTech 2024)
 * ===================================
 * Row height: 40-44px (touch-friendly)
 * Cell padding: 12-16px horizontal, 8-10px vertical
 * Alignment: text left, numbers right
 * Zebra striping: subtle muted/30 background
 */

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn("relative w-full overflow-auto overscroll-x-contain overscroll-y-auto", containerClassName)}>
      <table 
        ref={ref} 
        className={cn(
          "w-full caption-bottom text-table-cell", 
          className
        )} 
        {...props} 
      />
    </div>
  ),
);
Table.displayName = "Table";

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, sticky = false, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "[&_tr]:border-b border-border/70 bg-muted", /* Opaque muted background for visual separation */
        sticky && "sticky top-0 z-20 shadow-[0_1px_3px_0_hsl(var(--foreground)/0.05),0_4px_6px_-2px_hsl(var(--foreground)/0.08)]",
        className
      )}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody 
      ref={ref} 
      className={cn(
        "[&_tr:last-child]:border-0",
        "[&_tr:nth-child(even)]:bg-muted/40", // Zebra striping (improved visibility)
        className
      )} 
      {...props} 
    />
  ),
);
TableBody.displayName = "TableBody";

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, sticky = false, ...props }, ref) => (
    <tfoot 
      ref={ref} 
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        sticky && "sticky bottom-0 z-20 bg-card shadow-[0_-2px_4px_hsl(var(--foreground)/0.05)]",
        className
      )} 
      {...props} 
    />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border/70 transition-colors data-[state=selected]:bg-muted hover:bg-muted/50", /* border-default */
        "min-h-[40px]", // Touch-friendly minimum height
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

/**
 * TableHead Design System (FinTech 2024):
 * - Default: 11px, UPPERCASE, tracking-wider, h-10 (40px)
 * - Use `compact` prop for h-8 (32px) dense tables
 * - Use `numeric` prop for right-aligned numbers
 * - Use `sortable` prop with `onSort` for clickable sort headers
 * - DO NOT override base typography styles with className
 */
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
  sorted?: boolean;
  sortDirection?: "asc" | "desc" | null;
  sortable?: boolean;
  compact?: boolean;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, numeric = false, sorted = false, sortDirection, sortable = false, compact = false, onSort, children, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (sortable && onSort && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSort();
      }
    };

    // Generate aria-label for sortable headers
    const getAriaLabel = () => {
      if (!sortable) return undefined;
      if (!sorted) return "Сортувати за зростанням";
      return sortDirection === "asc" 
        ? "Сортовано за зростанням. Натисніть для сортування за спаданням" 
        : "Сортовано за спаданням. Натисніть для сортування за зростанням";
    };

    return (
      <th
        ref={ref}
        scope="col"
        className={cn(
          "px-4 text-left align-middle !text-table-header uppercase tracking-wider text-muted-foreground [&:has([role=checkbox])]:pr-0",
          compact ? "h-8 px-3" : "h-10",
          numeric && "text-right tabular-nums",
          sorted && "text-foreground", /* Sorting indicated only by arrow, no background highlight */
          sortable && "cursor-pointer select-none hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 group",
          className,
        )}
        onClick={sortable ? onSort : undefined}
        onKeyDown={sortable ? handleKeyDown : undefined}
        tabIndex={sortable ? 0 : undefined}
        aria-sort={sorted ? (sortDirection === "asc" ? "ascending" : "descending") : (sortable ? "none" : undefined)}
        aria-label={getAriaLabel()}
        {...props}
      >
        {children}
      </th>
    );
  },
);
TableHead.displayName = "TableHead";

/**
 * TableCell Design System (FinTech 2024):
 * - Default: py-3 px-4 for standard tables (better touch targets)
 * - Use `compact` prop for py-2 px-3 dense tables
 * - Use `numeric` prop for right-aligned numbers with tabular-nums
 * - DO NOT override base padding styles with className
 */
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  compact?: boolean;
  numeric?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, compact = false, numeric = false, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        compact ? "py-2 px-3" : "py-3 px-4",
        "align-middle [&:has([role=checkbox])]:pr-0",
        numeric && "text-right tabular-nums font-medium",
        className
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-caption text-muted-foreground", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
export type { TableHeadProps, TableCellProps };
