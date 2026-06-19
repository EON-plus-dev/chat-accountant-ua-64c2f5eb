import { Skeleton } from "./skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-56 flex-col border-r border-border/50 p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      </div>
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="h-14 border-b border-border/50 flex items-center px-4 gap-3">
          <Skeleton className="h-8 w-8 rounded-md md:hidden" />
          <Skeleton className="h-5 w-40" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
