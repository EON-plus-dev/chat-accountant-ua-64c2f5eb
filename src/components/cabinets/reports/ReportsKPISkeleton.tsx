import { Skeleton } from "@/components/ui/skeleton";

export function ReportsKPISkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[80px] rounded-lg" />
      ))}
    </div>
  );
}
