import { Progress } from "@/components/ui/progress";
import { Check, X, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationProgressProps {
  confirmedCount: number;
  disputedCount: number;
  totalCount: number;
  className?: string;
}

export const VerificationProgress = ({
  confirmedCount,
  disputedCount,
  totalCount,
  className,
}: VerificationProgressProps) => {
  const verifiedCount = confirmedCount + disputedCount;
  const pendingCount = totalCount - verifiedCount;
  const percent = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;

  return (
    <div className={cn("flex flex-col gap-2 p-3 bg-muted/50 rounded-lg", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Прогрес верифікації</span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      
      <Progress value={percent} className="h-2" />
      
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <Check className="w-3.5 h-3.5" />
          <span>{confirmedCount} підтверджено</span>
        </div>
        {disputedCount > 0 && (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <X className="w-3.5 h-3.5" />
            <span>{disputedCount} оскаржено</span>
          </div>
        )}
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
            <CircleDashed className="w-3.5 h-3.5" />
            <span>{pendingCount} очікує</span>
          </div>
        )}
      </div>
    </div>
  );
};
