import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrillDownPoint {
  category: string;
  values: { label: string; value: number; format?: "currency" | "number" }[];
  transactions?: { description: string; amount: number; date?: string }[];
}

interface ChartDrillDownSheetProps {
  point: DrillDownPoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₴`;
  return `${v.toLocaleString("uk-UA")} ₴`;
}

const DrillDownContent = ({ point }: { point: DrillDownPoint }) => (
  <div className="space-y-4 px-4 pb-4">
    {/* Values summary */}
    <div className="grid grid-cols-2 gap-2">
      {point.values.map((v, i) => (
        <div key={i} className="rounded-lg bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">{v.label}</p>
          <p className="text-lg font-bold tabular-nums">
            {v.format === "number" ? v.value.toLocaleString("uk-UA") : formatCurrency(v.value)}
          </p>
        </div>
      ))}
    </div>

    {/* Transactions list */}
    {point.transactions && point.transactions.length > 0 && (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Ключові операції</p>
        {point.transactions.slice(0, 8).map((tx, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              {tx.amount >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-success shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-destructive shrink-0" />
              )}
              <span className="truncate">{tx.description}</span>
            </div>
            <span className={cn("font-medium tabular-nums shrink-0 ml-2", tx.amount >= 0 ? "text-success" : "text-destructive")}>
              {formatCurrency(tx.amount)}
            </span>
          </div>
        ))}
        {point.transactions.length > 8 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{point.transactions.length - 8} ще операцій
          </p>
        )}
      </div>
    )}
  </div>
);

export const ChartDrillDownSheet = ({ point, open, onOpenChange }: ChartDrillDownSheetProps) => {
  const isMobile = useIsMobile();

  if (!point) return null;

  const title = `Що сталося: ${point.category}`;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-primary" />
              {title}
            </DrawerTitle>
            <DrawerDescription className="text-xs">Деталі за обраний період</DrawerDescription>
          </DrawerHeader>
          <DrillDownContent point={point} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">Деталі за обраний період</DialogDescription>
        </DialogHeader>
        <DrillDownContent point={point} />
      </DialogContent>
    </Dialog>
  );
};
