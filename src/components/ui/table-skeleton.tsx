import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface TableSkeletonColumn {
  width?: string;
  align?: "left" | "center" | "right";
  header?: string;
}

interface TableSkeletonProps {
  columns: TableSkeletonColumn[];
  rows?: number;
  compact?: boolean;
  showHeader?: boolean;
}

/**
 * TableSkeleton - Loading state for tables
 * Renders animated skeleton rows matching table structure
 */
export const TableSkeleton = ({ 
  columns, 
  rows = 5, 
  compact = false,
  showHeader = false 
}: TableSkeletonProps) => (
  <>
    {showHeader && (
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col, j) => (
            <TableHead
              key={j}
              numeric={col.align === "right"}
              className={cn(col.align === "center" && "text-center")}
            >
              {col.header ? (
                col.header
              ) : (
                <Skeleton className={cn("h-3", col.width || "w-16")} />
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
    )}
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent animate-pulse">
          {columns.map((col, j) => (
            <TableCell
              key={j}
              compact={compact}
              numeric={col.align === "right"}
              className={cn(col.align === "center" && "text-center")}
            >
              <Skeleton
                className={cn(
                  "h-4 rounded",
                  col.width || "w-full max-w-[120px]",
                  col.align === "right" && "ml-auto",
                  col.align === "center" && "mx-auto"
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </>
);

/**
 * Standalone skeleton table with container
 */
export const TableSkeletonCard = (props: TableSkeletonProps) => (
  <div className="border rounded-lg overflow-hidden">
    <Table>
      <TableSkeleton {...props} showHeader />
    </Table>
  </div>
);
