import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { validateKvedForTaxGroup, type KvedValidationResult } from "@/lib/businessRules";

interface KvedValidationBadgeProps {
  kvedCode: string;
  taxGroup: 1 | 2 | 3;
  showDetails?: boolean;
  className?: string;
}

export const KvedValidationBadge = ({ 
  kvedCode, 
  taxGroup,
  showDetails = true,
  className,
}: KvedValidationBadgeProps) => {
  const validation = validateKvedForTaxGroup(kvedCode, taxGroup);
  
  if (validation.isAllowed && validation.severity === 'info') {
    return (
      <div className={cn("space-y-1", className)}>
        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Дозволено для {taxGroup} групи
        </Badge>
      </div>
    );
  }
  
  if (validation.isAllowed && validation.severity === 'warning') {
    return (
      <div className={cn("space-y-1", className)}>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Є обмеження
        </Badge>
        {showDetails && validation.reason && (
          <p className="text-xs text-amber-600 dark:text-amber-400">{validation.reason}</p>
        )}
      </div>
    );
  }
  
  // Не дозволено
  return (
    <div className={cn("space-y-1", className)}>
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Заборонено
      </Badge>
      {showDetails && (
        <>
          {validation.reason && (
            <p className="text-xs text-destructive">{validation.reason}</p>
          )}
          {validation.suggestion && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              {validation.suggestion}
            </p>
          )}
        </>
      )}
    </div>
  );
};
