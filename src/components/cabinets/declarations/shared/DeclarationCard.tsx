import { MoreHorizontal, MessageSquare, Eye, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  KIND_LABELS,
  KIND_SHORT,
  type UnifiedDeclaration,
} from "@/lib/declarations/unifiedDeclarations";

const fmt = (n: number) => `${Math.abs(n).toLocaleString("uk-UA")} ₴`;
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const URGENCY_BORDER: Record<UnifiedDeclaration["urgency"], string> = {
  overdue: "border-l-destructive",
  urgent: "border-l-red-500",
  warning: "border-l-amber-500",
  normal: "border-l-border",
};

const URGENCY_TEXT: Record<UnifiedDeclaration["urgency"], string> = {
  overdue: "text-destructive font-medium",
  urgent: "text-red-600 dark:text-red-400 font-medium",
  warning: "text-amber-600 dark:text-amber-400",
  normal: "text-muted-foreground",
};

interface Props {
  item: UnifiedDeclaration;
  onOpen: () => void;
  onExplain?: () => void;
}

export function DeclarationCard({ item, onOpen, onExplain }: Props) {
  const isRefund = item.taxAmount < 0;
  const showAmount = item.taxAmount !== 0;
  const urgency = item.urgency;

  return (
    <Card
      className={cn("border-l-4 transition-all hover:shadow-md cursor-pointer", URGENCY_BORDER[urgency])}
      onClick={onOpen}
    >
      <CardContent className="p-3 space-y-1.5">
        {/* Row 1: type badge + name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                {KIND_SHORT[item.kind]}
              </Badge>
              <span className="font-medium text-sm truncate">{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {KIND_LABELS[item.kind]} · {item.period}
            </p>
          </div>
          <Badge variant="secondary" className="font-medium shrink-0 text-[10px]">
            {item.statusLabel}
          </Badge>
        </div>

        {/* Row 2: deadline + amount + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs min-w-0">
            {urgency === "overdue" && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
            <span className={cn("tabular-nums shrink-0", URGENCY_TEXT[urgency])}>
              до {fmtDate(item.deadline)}
            </span>
            {showAmount && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span
                  className={cn(
                    "tabular-nums font-medium truncate",
                    isRefund && "text-emerald-700 dark:text-emerald-400",
                  )}
                >
                  {isRefund ? "↩ " : ""}
                  {fmt(item.taxAmount)}
                </span>
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="Дії"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onOpen}>
                <Eye className="h-4 w-4 mr-2" /> Відкрити
              </DropdownMenuItem>
              {onExplain && (
                <DropdownMenuItem onClick={onExplain}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Пояснити в чаті
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
