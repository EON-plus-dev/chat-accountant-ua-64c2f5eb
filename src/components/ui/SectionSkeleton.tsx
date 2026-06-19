import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";
import { cn } from "@/lib/utils";

interface SectionSkeletonProps {
  variant?: "chart" | "list" | "kpi" | "card";
  className?: string;
}

export function SectionSkeleton({ variant = "card", className }: SectionSkeletonProps) {
  if (variant === "chart") {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end gap-2 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "list") {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-32 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (variant === "kpi") {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}
