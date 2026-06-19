import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface KPIDrillDownData {
  kpiId: string;
  title: string;
  value: number;
  previousValue?: number;
  format: "currency" | "number";
  delta?: { label: string; value: number }[];
  transactions?: { description: string; amount: number; date?: string; category?: string }[];
}

interface KPIDrillDownSheetProps {
  data: KPIDrillDownData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExplorerNavigate?: () => void;
}

function formatValue(v: number, format: "currency" | "number"): string {
  if (format === "number") return v.toLocaleString("uk-UA");
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₴`;
  return `${v.toLocaleString("uk-UA")} ₴`;
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (!previous) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const isUp = pct >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
      isUp ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
    )}>
      {isUp ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

const DrillDownBody = ({ data, onExplorerNavigate }: { data: KPIDrillDownData; onExplorerNavigate?: () => void }) => {
  const maxAbsDelta = data.delta?.length
    ? Math.max(...data.delta.map((d) => Math.abs(d.value)), 1)
    : 1;

  return (
    <div className="space-y-4 px-4 pb-4">
      {/* Value + Delta badge */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">{formatValue(data.value, data.format)}</span>
        {data.previousValue != null && (
          <DeltaBadge current={data.value} previous={data.previousValue} />
        )}
      </div>

      {/* Δ Decomposition */}
      {data.delta && data.delta.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Декомпозиція зміни</p>
          {data.delta.map((item, i) => {
            const isPositive = item.value >= 0;
            const pct = Math.min((Math.abs(item.value) / maxAbsDelta) * 100, 100);
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm min-h-[44px] px-2 py-1.5 rounded bg-muted/30">
                  <span className="truncate">{item.label}</span>
                  <span className={cn(
                    "font-medium tabular-nums shrink-0 ml-2",
                    isPositive ? "text-success" : "text-destructive"
                  )}>
                    {isPositive ? "+" : ""}{formatValue(item.value, data.format)}
                  </span>
                </div>
                <Progress
                  value={pct}
                  className={cn("h-1", isPositive ? "[&>div]:bg-success" : "[&>div]:bg-destructive")}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Evidence transactions */}
      {data.transactions && data.transactions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Ключові операції</p>
          {data.transactions.slice(0, 8).map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30 text-sm min-h-[44px]">
              <div className="flex items-center gap-2 min-w-0">
                {tx.amount >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-success shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-destructive shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="truncate block">{tx.description}</span>
                  {(tx.date || tx.category) && (
                    <span className="text-xs text-muted-foreground">
                      {[tx.date, tx.category].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </div>
              <span className={cn(
                "font-medium tabular-nums shrink-0 ml-2",
                tx.amount >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatValue(tx.amount, "currency")}
              </span>
            </div>
          ))}
          {data.transactions.length > 8 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              +{data.transactions.length - 8} ще операцій
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      {onExplorerNavigate && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onExplorerNavigate}>
          Детальніше в Explorer
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};

export const KPIDrillDownSheet = ({ data, open, onOpenChange, onExplorerNavigate }: KPIDrillDownSheetProps) => {
  const isMobile = useIsMobile();

  if (!data) return null;

  const title = data.title;
  const description = "Деталізація метрики";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-base">{title}</DrawerTitle>
            <DrawerDescription className="text-xs">{description}</DrawerDescription>
          </DrawerHeader>
          <DrillDownBody data={data} onExplorerNavigate={onExplorerNavigate} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-xs">{description}</DialogDescription>
        </DialogHeader>
        <DrillDownBody data={data} onExplorerNavigate={onExplorerNavigate} />
      </DialogContent>
    </Dialog>
  );
};
