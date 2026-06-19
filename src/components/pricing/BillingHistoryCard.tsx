import { ArrowRight, Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { operationTypeVariants } from "@/config/semanticStyles";

interface BillingHistoryItem {
  id: string;
  date: string;
  type: "subscription" | "topup" | "plan_change";
  plan?: string;
  fromPlan?: string;
  toPlan?: string;
  amount: number;
  credits: number;
  status: "success" | "failed" | "error";
}

interface BillingHistoryCardProps {
  item: BillingHistoryItem;
}

export const BillingHistoryCard = ({ item }: BillingHistoryCardProps) => {
  const opType = operationTypeVariants[item.type] || { label: item.type, variant: "default" as const };
  const isSuccess = item.status === "success";
  const borderColor = isSuccess ? "border-l-emerald-500" : "border-l-red-500";

  return (
    <div className={cn(
      "flex items-stretch gap-0 bg-card border border-border/70 rounded-lg overflow-hidden",
      "hover:bg-muted/30 transition-colors"
    )}>
      {/* Status indicator stripe */}
      <div className={cn("w-1 shrink-0 border-l-[3px]", borderColor)} />
      
      {/* Main content */}
      <div className="flex-1 min-w-0 p-3 pl-2.5 space-y-2">
        {/* Header row: date + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {format(new Date(item.date), "d MMM yyyy", { locale: uk })}
          </span>
          <Badge variant={isSuccess ? "success" : "error"} size="sm">
            {isSuccess ? "Успішно" : "Помилка"}
          </Badge>
        </div>

        {/* Main content row */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <Badge variant={opType.variant} size="sm" className="pointer-events-none">
              {opType.label}
            </Badge>

            <div className="text-sm">
              {item.type === "plan_change" && item.fromPlan && item.toPlan ? (
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">{item.fromPlan}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="font-medium">{item.toPlan}</span>
                </span>
              ) : (
                <span className="font-medium">{item.plan || "—"}</span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
            {item.amount > 0 && (
              <div className={cn(
                "font-semibold tabular-nums",
                item.type === "plan_change" && "text-success"
              )}>
                {item.type === "plan_change" ? `+${item.amount} грн` : `${item.amount} грн`}
              </div>
            )}
            {item.credits > 0 && (
              <div className="text-xs text-muted-foreground tabular-nums">
                {item.credits.toLocaleString()} кредитів
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isSuccess && item.type !== "plan_change" && (
          <div className="flex gap-2 sm:justify-end">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial h-7 text-xs gap-1.5">
              <FileText className="h-3 w-3" />
              Квитанція
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial h-7 text-xs gap-1.5">
              <Download className="h-3 w-3" />
              Завантажити
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
